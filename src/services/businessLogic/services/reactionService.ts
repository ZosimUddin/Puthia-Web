// Reaction Business Service (Single Reaction per User, Atomic Toggle, Type Switch, Duplicate Prevention)

import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../../../firebase';
import { 
  doc, 
  runTransaction, 
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { ToggleReactionRequest, ReactionType, ServiceResult } from '../types';
import { ReactionValidator } from '../validators';
import { IdempotencyManager } from '../idempotencyManager';
import { EventDispatcher } from '../eventDispatcher';
import { notificationService } from '../../notificationService';

export class ReactionBusinessService {
  /**
   * Atomic Reaction Toggle / Switch Engine
   */
  static async toggleReaction(
    req: ToggleReactionRequest
  ): Promise<ServiceResult<{ action: 'added' | 'removed' | 'changed'; currentReaction: ReactionType | null; newCount: number }>> {
    // 1. Validate
    const validation = ReactionValidator.validate(req);
    if (!validation.isValid) {
      return { success: false, error: 'অবৈধ রিঅ্যাকশন অনুরোধ', validationErrors: validation.errors };
    }

    const { postId, userId, userName, userPhotoUrl, reactionType } = req;
    const lockKey = `reaction_${postId}_${userId}`;

    if (!IdempotencyManager.acquireLock(lockKey)) {
      return { success: false, error: 'অনুগ্রহ করে অপেক্ষা করুন...', errorCode: 'LOCKED' };
    }

    try {
      const postRef = doc(db, 'discussions', postId);
      const reactionDocRef = doc(db, 'post_reactions', `${postId}_${userId}`);

      let actionTaken: 'added' | 'removed' | 'changed' = 'added';
      let resultingReaction: ReactionType | null = reactionType;
      let updatedTotal = 0;
      let postAuthorId = '';
      let postTitle = '';

      // Execute Atomic Database Transaction
      await runTransaction(db, async (transaction) => {
        const postSnap = await transaction.get(postRef);
        if (!postSnap.exists()) {
          throw new Error('POST_NOT_FOUND');
        }

        const postData = postSnap.data();
        postAuthorId = postData.authorId;
        postTitle = postData.title || postData.content?.slice(0, 30) || '';

        const existingReactions = { ...(postData.reactions || {}) };
        const currentLikedBy = Array.isArray(postData.likedBy) ? [...postData.likedBy] : [];
        const prevUserReaction = existingReactions[userId] as ReactionType | undefined;

        if (prevUserReaction === reactionType) {
          // 1. Same reaction clicked -> REMOVE REACTION
          actionTaken = 'removed';
          resultingReaction = null;
          delete existingReactions[userId];
          
          const filteredLikedBy = currentLikedBy.filter(id => id !== userId);
          const newLikes = Math.max(0, (postData.likes || 1) - 1);
          updatedTotal = newLikes;

          transaction.update(postRef, {
            reactions: existingReactions,
            likedBy: filteredLikedBy,
            likes: newLikes,
            reactionsCount: newLikes
          });

          transaction.delete(reactionDocRef);

        } else if (prevUserReaction) {
          // 2. Different reaction clicked -> CHANGE TYPE (count stays same)
          actionTaken = 'changed';
          resultingReaction = reactionType;
          existingReactions[userId] = reactionType;
          updatedTotal = postData.likes || 1;

          transaction.update(postRef, {
            reactions: existingReactions
          });

          transaction.set(reactionDocRef, {
            postId,
            userId,
            userName,
            userPhotoUrl: userPhotoUrl || '',
            reactionType,
            updatedAt: serverTimestamp()
          }, { merge: true });

        } else {
          // 3. New reaction added -> ADD REACTION
          actionTaken = 'added';
          resultingReaction = reactionType;
          existingReactions[userId] = reactionType;
          
          if (!currentLikedBy.includes(userId)) {
            currentLikedBy.push(userId);
          }

          const newLikes = (postData.likes || 0) + 1;
          updatedTotal = newLikes;

          transaction.update(postRef, {
            reactions: existingReactions,
            likedBy: currentLikedBy,
            likes: newLikes,
            reactionsCount: newLikes
          });

          transaction.set(reactionDocRef, {
            postId,
            userId,
            userName,
            userPhotoUrl: userPhotoUrl || '',
            reactionType,
            createdAt: serverTimestamp()
          });
        }
      });

      // Business Events & Notifications (Asynchronous)
      if (actionTaken === 'added' || actionTaken === 'changed') {
        EventDispatcher.emit('ReactionCreated', {
          postId,
          userId,
          userName,
          reactionType,
          postAuthorId
        });

        // Trigger Notification to Post Author (if not self)
        if (postAuthorId && postAuthorId !== userId) {
          notificationService.dispatchNotification({
            recipientId: postAuthorId,
            actorId: userId,
            actorName: userName,
            actorAvatar: userPhotoUrl || '',
            type: 'reaction',
            targetId: postId,
            targetType: 'post',
            title: `${userName} আপনার পোস্টে রিঅ্যাকশন দিয়েছেন`,
            message: `${userName} "${postTitle}" পোস্টে ${reactionType} রিঅ্যাক্ট করেছেন`,
            actionData: { postId, postTitle }
          }).catch(() => {});
        }
      } else {
        EventDispatcher.emit('ReactionRemoved', {
          postId,
          userId,
          postAuthorId
        });
      }

      return {
        success: true,
        data: {
          action: actionTaken,
          currentReaction: resultingReaction,
          newCount: updatedTotal
        }
      };

    } catch (err: any) {
      if (err.message === 'POST_NOT_FOUND') {
        return { success: false, error: 'পোস্টটি খুঁজে পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
      }
      console.error('Error in reaction toggle:', err);
      return { success: false, error: 'রিঅ্যাকশন আপডেট করতে ব্যর্থ হয়েছে' };
    } finally {
      IdempotencyManager.releaseLock(lockKey);
    }
  }
}

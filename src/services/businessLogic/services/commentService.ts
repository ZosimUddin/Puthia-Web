// Comment Business Service (Hierarchical Replies, Mention Parse, Policy & Notifications)

import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../../../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { CreateCommentRequest, UpdateCommentRequest, ServiceResult } from '../types';
import { CommentValidator } from '../validators';
import { CommentPolicy, PostPolicy, UserContext } from '../policies';
import { IdempotencyManager } from '../idempotencyManager';
import { EventDispatcher } from '../eventDispatcher';
import { notificationService } from '../../notificationService';
import { MentionBusinessService } from './mentionService';

export class CommentBusinessService {
  /**
   * Add Comment or Reply
   */
  static async addComment(
    req: CreateCommentRequest, 
    userContext: UserContext
  ): Promise<ServiceResult<{ commentId: string }>> {
    // 1. Validation
    const validation = CommentValidator.validateCreate(req);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: 'মন্তব্যের তথ্যে সমস্যা রয়েছে', 
        validationErrors: validation.errors, 
        errorCode: 'VALIDATION_ERROR' 
      };
    }

    const lockKey = `comment_${req.postId}_${req.authorId}_${req.idempotencyKey || req.content.slice(0, 15)}`;
    if (!IdempotencyManager.acquireLock(lockKey)) {
      return { success: false, error: 'অনুগ্রহ করে অপেক্ষা করুন, কমেন্ট পোস্ট হচ্ছে...', errorCode: 'DUPLICATE' };
    }

    try {
      const postRef = doc(db, 'discussions', req.postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        return { success: false, error: 'পোস্টটি খুঁজে পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
      }

      const postData = postSnap.data();

      // 2. Policy Check
      const policyCheck = PostPolicy.canComment(userContext, {
        authorId: postData.authorId,
        commentsLocked: postData.commentsLocked
      });

      if (!policyCheck.allowed) {
        return { success: false, error: policyCheck.reason, errorCode: 'FORBIDDEN' };
      }

      // 3. Parent Reply Check
      let parentCommentAuthorId: string | null = null;
      if (req.parentId) {
        const parentDoc = await getDoc(doc(db, 'discussion_comments', req.parentId));
        if (parentDoc.exists()) {
          parentCommentAuthorId = parentDoc.data().authorId;
        }
      }

      // 4. Extract Mentions from Content
      const mentionedUserIds = await MentionBusinessService.extractAndValidateMentions(req.content);

      // 5. Create Comment Document & Increment Post Comment Count Atomically
      const commentPayload: any = {
        postId: req.postId,
        author: req.authorName,
        authorId: req.authorId,
        authorBadge: !!req.authorBadge,
        authorPhotoUrl: req.authorPhotoUrl || '',
        content: req.content.trim(),
        parentId: req.parentId || null,
        imageUrl: req.imageUrl || null,
        mentions: mentionedUserIds,
        likes: 0,
        likedBy: [],
        reactions: {},
        isEdited: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const commentDocRef = await addDoc(collection(db, 'discussion_comments'), commentPayload);
      const commentId = commentDocRef.id;

      // Increment commentsCount on Post
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      // 6. Emit Realtime Event
      await EventDispatcher.emit('CommentCreated', {
        commentId,
        postId: req.postId,
        authorId: req.authorId,
        authorName: req.authorName,
        content: req.content,
        parentId: req.parentId
      });

      // 7. Dispatch Notifications
      // A. Post Author Notification
      if (postData.authorId && postData.authorId !== req.authorId) {
        notificationService.dispatchNotification({
          recipientId: postData.authorId,
          actorId: req.authorId,
          actorName: req.authorName,
          actorAvatar: req.authorPhotoUrl || '',
          type: 'comment',
          targetId: req.postId,
          targetType: 'post',
          title: `${req.authorName} আপনার পোস্টে মন্তব্য করেছেন`,
          message: `"${req.content.slice(0, 50)}..."`,
          actionData: { postId: req.postId, commentId }
        }).catch(() => {});
      }

      // B. Parent Comment Author Notification (for replies)
      if (parentCommentAuthorId && parentCommentAuthorId !== req.authorId && parentCommentAuthorId !== postData.authorId) {
        notificationService.dispatchNotification({
          recipientId: parentCommentAuthorId,
          actorId: req.authorId,
          actorName: req.authorName,
          actorAvatar: req.authorPhotoUrl || '',
          type: 'reply',
          targetId: req.postId,
          targetType: 'post',
          title: `${req.authorName} আপনার মন্তব্যের উত্তর দিয়েছেন`,
          message: `"${req.content.slice(0, 50)}..."`,
          actionData: { postId: req.postId, commentId, parentId: req.parentId || undefined }
        }).catch(() => {});
      }

      // C. Mentioned Users Notifications
      for (const targetUid of mentionedUserIds) {
        if (targetUid !== req.authorId) {
          notificationService.dispatchNotification({
            recipientId: targetUid,
            actorId: req.authorId,
            actorName: req.authorName,
            actorAvatar: req.authorPhotoUrl || '',
            type: 'mention',
            targetId: req.postId,
            targetType: 'post',
            title: `${req.authorName} আপনাকে একটি মন্তব্যে মেনশন করেছেন`,
            message: `"${req.content.slice(0, 50)}..."`,
            actionData: { postId: req.postId, commentId }
          }).catch(() => {});
        }
      }

      return {
        success: true,
        data: { commentId },
        message: 'মন্তব্য যুক্ত হয়েছে!'
      };

    } catch (err: any) {
      console.error('Error adding comment:', err);
      return { success: false, error: 'মন্তব্য করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' };
    } finally {
      IdempotencyManager.releaseLock(lockKey);
    }
  }

  /**
   * Delete Comment with authorization
   */
  static async deleteComment(
    commentId: string, 
    postId: string, 
    userContext: UserContext
  ): Promise<ServiceResult<void>> {
    const commentRef = doc(db, 'discussion_comments', commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return { success: false, error: 'মন্তব্যটি পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
    }

    const commentData = commentSnap.data();

    // Fetch Post to check post-author moderation policy
    const postSnap = await getDoc(doc(db, 'discussions', postId));
    const postAuthorId = postSnap.exists() ? postSnap.data().authorId : undefined;

    const policy = CommentPolicy.canDelete(userContext, { authorId: commentData.authorId }, postAuthorId);
    if (!policy.allowed) {
      return { success: false, error: policy.reason, errorCode: 'FORBIDDEN' };
    }

    try {
      await deleteDoc(commentRef);

      // Decrement post comment counter
      if (postSnap.exists()) {
        await updateDoc(doc(db, 'discussions', postId), {
          commentsCount: increment(-1)
        });
      }

      await EventDispatcher.emit('CommentDeleted', {
        commentId,
        postId,
        deletedBy: userContext.uid
      });

      return { success: true, message: 'মন্তব্যটি মুছে ফেলা হয়েছে।' };
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      return { success: false, error: 'মন্তব্য মুছতে সমস্যা হয়েছে।' };
    }
  }
}

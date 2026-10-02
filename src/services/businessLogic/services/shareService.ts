// Share Business Service (Original Post Link, Counter Sync & Feed Insertion)

import { db } from '../../../firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { SharePostRequest, ServiceResult } from '../types';
import { EventDispatcher } from '../eventDispatcher';
import { notificationService } from '../../notificationService';
import { cleanUndefined } from '../../../utils/firestoreUtils';

export class ShareBusinessService {
  /**
   * Share Post to Feed
   */
  static async sharePost(req: SharePostRequest): Promise<ServiceResult<{ sharedPostId: string }>> {
    const { originalPostId, authorId, authorName, authorPhotoUrl, caption, visibility, union } = req;

    try {
      const originalDocRef = doc(db, 'discussions', originalPostId);
      const originalSnap = await getDoc(originalDocRef);

      if (!originalSnap.exists()) {
        return { success: false, error: 'মূল পোস্টটি পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
      }

      const originalData = originalSnap.data();

      // Create new shared post entry in feed
      const sharedPostPayload = {
        title: caption ? caption.slice(0, 50) : `শেয়ারকৃত পোস্ট: ${originalData.title || ''}`,
        content: caption || '',
        author: authorName,
        authorId,
        authorBadge: false,
        authorPhotoUrl: authorPhotoUrl || '',
        union: union || originalData.union || 'পুঠিয়া ইউনিয়ন',
        category: originalData.category || 'general',
        visibility: visibility || 'public',
        isShared: true,
        sharedPostId: originalPostId,
        sharedPostData: {
          id: originalPostId,
          title: originalData.title || '',
          content: originalData.content || '',
          author: originalData.author || '',
          authorId: originalData.authorId || '',
          authorPhotoUrl: originalData.authorPhotoUrl || '',
          category: originalData.category || '',
          imageUrl: originalData.imageUrl || null,
          gallery: originalData.gallery || [],
          createdAt: originalData.createdAt || null
        },
        likes: 0,
        reactionsCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        views: 0,
        likedBy: [],
        reactions: {},
        isDeleted: false,
        isHidden: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'discussions'), cleanUndefined(sharedPostPayload));
      const sharedPostId = docRef.id;

      // Increment shares count on original post
      await updateDoc(originalDocRef, {
        sharesCount: increment(1)
      });

      // Emit Event
      await EventDispatcher.emit('PostShared', {
        sharedPostId,
        originalPostId,
        authorId,
        authorName
      });

      // Notify Original Post Author
      if (originalData.authorId && originalData.authorId !== authorId) {
        notificationService.dispatchNotification({
          recipientId: originalData.authorId,
          actorId: authorId,
          actorName: authorName,
          actorAvatar: authorPhotoUrl || '',
          type: 'reaction',
          targetId: sharedPostId,
          targetType: 'post',
          title: `${authorName} আপনার পোস্ট শেয়ার করেছেন`,
          message: `আপনার পোস্টটি নিজের টাইমলাইনে শেয়ার করেছেন`,
          actionData: { postId: sharedPostId, originalPostId }
        }).catch(() => {});
      }

      return { success: true, data: { sharedPostId }, message: 'পোস্টটি সফলভাবে শেয়ার করা হয়েছে!' };
    } catch (err: any) {
      console.error('Error sharing post:', err);
      return { success: false, error: 'পোস্ট শেয়ার করতে সমস্যা হয়েছে।' };
    }
  }
}

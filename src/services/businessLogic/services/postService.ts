// Post Business Service (Post Lifecycle, Permission, Anti-Spam, Search Sync, DB Transactions)

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
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { CreatePostRequest, UpdatePostRequest, ServiceResult } from '../types';
import { PostValidator } from '../validators';
import { PostPolicy, UserContext } from '../policies';
import { IdempotencyManager } from '../idempotencyManager';
import { EventDispatcher } from '../eventDispatcher';
import { CacheManager } from '../cacheManager';
import { AntiSpamEngineService } from '../../antiSpamEngine';
import { cleanUndefined } from '../../../utils/firestoreUtils';
import { notificationService } from '../../notificationService';

export class PostBusinessService {
  /**
   * Create Post with complete validation, spam check, idempotency, search index, and event dispatch
   */
  static async createPost(
    req: CreatePostRequest, 
    userContext: UserContext
  ): Promise<ServiceResult<{ postId: string }>> {
    // 1. Policy / Permission check
    const policyResult = PostPolicy.canCreate(userContext);
    if (!policyResult.allowed) {
      return { success: false, error: policyResult.reason, errorCode: 'FORBIDDEN' };
    }

    // 2. Form Request Validation
    const validation = PostValidator.validateCreate(req);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: 'পোস্টের তথ্যে সমস্যা রয়েছে। অনুগ্রহ করে চেক করুন।', 
        validationErrors: validation.errors, 
        errorCode: 'VALIDATION_ERROR' 
      };
    }

    // 3. Idempotency Lock
    const lockKey = `create_post_${req.authorId}_${req.idempotencyKey || req.content.slice(0, 20)}`;
    if (!IdempotencyManager.acquireLock(lockKey)) {
      return { success: false, error: 'অনুগ্রহ করে অপেক্ষা করুন, পোস্ট প্রসেস হচ্ছে...', errorCode: 'DUPLICATE_SUBMISSION' };
    }

    try {
      // 4. Anti-Spam & Rate Limiting Check
      try {
        const spamCheck = await AntiSpamEngineService.checkActionAllowed(req.authorId, 'post', {
          content: req.content
        });

        if (!spamCheck.allowed) {
          return { 
            success: false, 
            error: spamCheck.reason || 'স্প্যাম ও সিকিউরিটি নিয়মের কারণে পোস্টটি গ্রহণ করা হয়নি', 
            errorCode: 'SPAM_REJECTED' 
          };
        }
      } catch (spamErr) {
        console.warn('Anti-spam evaluation bypass note:', spamErr);
      }

      // 5. Build Document Payload
      const postPayload: any = {
        title: req.title || '',
        content: req.content.trim(),
        author: req.authorName,
        authorId: req.authorId,
        authorBadge: !!req.authorBadge,
        authorPhotoUrl: req.authorPhotoUrl || '',
        union: req.union || 'পুঠিয়া ইউনিয়ন',
        category: req.category || 'general',
        visibility: req.visibility || 'public',
        customAllowedUserIds: req.customAllowedUserIds || [],
        groupId: req.groupId || null,
        pageId: req.pageId || null,
        imageUrl: req.imageUrl || null,
        videoUrl: req.videoUrl || null,
        gallery: req.gallery || [],
        location: req.location || '',
        feeling: req.feeling || '',
        likes: 0,
        reactionsCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        views: 0,
        likedBy: [],
        reactions: {},
        pinned: false,
        trending: false,
        poll: req.poll || null,
        scheduledFor: req.scheduledFor || null,
        isUrgent: !!req.isUrgent,
        emergencyCategory: req.emergencyCategory || '',
        emergencyLocation: req.emergencyLocation || '',
        emergencyContact: req.emergencyContact || '',
        isDeleted: false,
        isHidden: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 6. Save to Database
      const docRef = await addDoc(collection(db, 'discussions'), cleanUndefined(postPayload));
      const postId = docRef.id;

      // 8. Invalidate Feed Cache
      CacheManager.invalidate('feed_posts');

      // 9. Dispatch Business Event
      await EventDispatcher.emit('PostCreated', {
        postId,
        authorId: req.authorId,
        authorName: req.authorName,
        content: req.content,
        title: req.title,
        visibility: req.visibility || 'public'
      });

      return {
        success: true,
        data: { postId },
        message: 'পোস্টটি সফলভাবে প্রকাশিত হয়েছে!'
      };

    } catch (err: any) {
      console.error('Error creating post:', err);
      return {
        success: false,
        error: 'পোস্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        errorCode: err.code || 'DATABASE_ERROR'
      };
    } finally {
      IdempotencyManager.releaseLock(lockKey);
    }
  }

  /**
   * Edit Post
   */
  static async updatePost(
    req: UpdatePostRequest, 
    userContext: UserContext
  ): Promise<ServiceResult<void>> {
    const postRef = doc(db, 'discussions', req.postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, error: 'পোস্টটি খুঁজে পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
    }

    const postData = postSnap.data();

    // 1. Authorization Check
    const policyResult = PostPolicy.canEdit(userContext, { authorId: postData.authorId });
    if (!policyResult.allowed) {
      return { success: false, error: policyResult.reason, errorCode: 'FORBIDDEN' };
    }

    // 2. Validation
    const validation = PostValidator.validateUpdate(req);
    if (!validation.isValid) {
      return { success: false, error: 'ভুল তথ্য প্রদান করা হয়েছে', validationErrors: validation.errors };
    }

    try {
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      if (req.content !== undefined) updateData.content = req.content.trim();
      if (req.title !== undefined) updateData.title = req.title.trim();
      if (req.category !== undefined) updateData.category = req.category;
      if (req.union !== undefined) updateData.union = req.union;
      if (req.visibility !== undefined) updateData.visibility = req.visibility;
      if (req.imageUrl !== undefined) updateData.imageUrl = req.imageUrl;
      if (req.gallery !== undefined) updateData.gallery = req.gallery;
      if (req.location !== undefined) updateData.location = req.location;
      if (req.feeling !== undefined) updateData.feeling = req.feeling;

      await updateDoc(postRef, updateData);

      // Invalidate Cache
      CacheManager.invalidate('feed_posts');

      // Emit Event
      await EventDispatcher.emit('PostEdited', {
        postId: req.postId,
        authorId: userContext.uid
      });

      return { success: true, message: 'পোস্ট সফলভাবে আপডেট করা হয়েছে!' };
    } catch (err: any) {
      console.error('Error updating post:', err);
      return { success: false, error: 'পোস্ট আপডেট করা সম্ভব হয়নি। আবার চেষ্টা করুন।' };
    }
  }

  /**
   * Delete / Soft Delete Post
   */
  static async deletePost(
    postId: string, 
    userContext: UserContext
  ): Promise<ServiceResult<void>> {
    const postRef = doc(db, 'discussions', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return { success: false, error: 'পোস্টটি পাওয়া যায়নি', errorCode: 'NOT_FOUND' };
    }

    const postData = postSnap.data();

    // Authorization Check
    const policy = PostPolicy.canDelete(userContext, { authorId: postData.authorId });
    if (!policy.allowed) {
      return { success: false, error: policy.reason, errorCode: 'FORBIDDEN' };
    }

    try {
      // Soft Delete: mark as isDeleted true
      await updateDoc(postRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: userContext.uid
      });

      CacheManager.invalidate('feed_posts');

      // Emit Event
      await EventDispatcher.emit('PostDeleted', {
        postId,
        authorId: postData.authorId,
        deletedBy: userContext.uid
      });

      return { success: true, message: 'পোস্টটি সফলভাবে মুছে ফেলা হয়েছে।' };
    } catch (err: any) {
      console.error('Error deleting post:', err);
      return { success: false, error: 'পোস্ট মুছতে সমস্যা হয়েছে।' };
    }
  }
}

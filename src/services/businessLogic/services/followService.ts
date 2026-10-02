// Follow Business Service (Follow, Unfollow, Relationship Sync & Notifications)

import { db } from '../../../firebase';
import { doc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { ServiceResult } from '../types';
import { EventDispatcher } from '../eventDispatcher';
import { notificationService } from '../../notificationService';

export class FollowBusinessService {
  /**
   * Follow User
   */
  static async followUser(
    followerId: string,
    followerName: string,
    followerPhotoUrl: string | undefined,
    targetUserId: string,
    targetUserName: string
  ): Promise<ServiceResult<void>> {
    if (followerId === targetUserId) {
      return { success: false, error: 'নিজেকে ফলো করা সম্ভব নয়' };
    }

    try {
      const followId = `${followerId}_${targetUserId}`;
      const followDocRef = doc(db, 'user_follows', followId);

      await setDoc(followDocRef, {
        id: followId,
        followerId,
        followerName,
        followerPhotoUrl: followerPhotoUrl || '',
        targetUserId,
        targetUserName,
        createdAt: serverTimestamp()
      });

      // Increment counters
      try {
        await updateDoc(doc(db, 'users', targetUserId), {
          followersCount: increment(1)
        });
        await updateDoc(doc(db, 'users', followerId), {
          followingCount: increment(1)
        });
      } catch {}

      await EventDispatcher.emit('UserFollowed', {
        followerId,
        followerName,
        targetUserId
      });

      notificationService.dispatchNotification({
        recipientId: targetUserId,
        actorId: followerId,
        actorName: followerName,
        actorAvatar: followerPhotoUrl || '',
        type: 'follow',
        targetId: followerId,
        targetType: 'user',
        title: `${followerName} আপনাকে ফলো করা শুরু করেছেন`,
        message: `আপনার প্রোফাইল দেখুন`,
        actionData: { followerId }
      }).catch(() => {});

      return { success: true, message: 'ফলো করা হয়েছে!' };
    } catch (err: any) {
      console.error('Error following user:', err);
      return { success: false, error: 'ফলো করতে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Unfollow User
   */
  static async unfollowUser(followerId: string, targetUserId: string): Promise<ServiceResult<void>> {
    try {
      const followId = `${followerId}_${targetUserId}`;
      await deleteDoc(doc(db, 'user_follows', followId));

      try {
        await updateDoc(doc(db, 'users', targetUserId), {
          followersCount: increment(-1)
        });
        await updateDoc(doc(db, 'users', followerId), {
          followingCount: increment(-1)
        });
      } catch {}

      await EventDispatcher.emit('UserUnfollowed', { followerId, targetUserId });

      return { success: true, message: 'আনফলো করা হয়েছে।' };
    } catch (err) {
      return { success: false, error: 'আনফলো করতে সমস্যা হয়েছে।' };
    }
  }
}

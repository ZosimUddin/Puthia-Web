// Friend Business Service (Atomic Transactions, Bidirectional Sync, Notifications)

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
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { FriendActionRequest, FriendshipStatus, ServiceResult } from '../types';
import { IdempotencyManager } from '../idempotencyManager';
import { EventDispatcher } from '../eventDispatcher';
import { notificationService } from '../../notificationService';

export class FriendBusinessService {
  /**
   * Send Friend Request
   */
  static async sendFriendRequest(
    req: FriendActionRequest
  ): Promise<ServiceResult<{ requestId: string }>> {
    const { currentUserId, currentUserName, currentUserPhotoUrl, targetUserId, targetUserName, targetUserPhotoUrl } = req;

    if (currentUserId === targetUserId) {
      return { success: false, error: 'নিজেকে বন্ধুত্বের অনুরোধ পাঠানো সম্ভব নয়' };
    }

    const lockKey = `friend_req_${currentUserId}_${targetUserId}`;
    if (!IdempotencyManager.acquireLock(lockKey)) {
      return { success: false, error: 'অনুরোধ প্রক্রিয়াধীন...' };
    }

    try {
      const requestId = `${currentUserId}_${targetUserId}`;
      const requestDocRef = doc(db, 'friend_requests', requestId);

      await setDoc(requestDocRef, {
        id: requestId,
        senderId: currentUserId,
        senderName: currentUserName,
        senderPhotoUrl: currentUserPhotoUrl || '',
        receiverId: targetUserId,
        receiverName: targetUserName || '',
        receiverPhotoUrl: targetUserPhotoUrl || '',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Emit Event
      await EventDispatcher.emit('FriendRequestSent', {
        requesterId: currentUserId,
        requesterName: currentUserName,
        targetUserId
      });

      // Notification
      notificationService.dispatchNotification({
        recipientId: targetUserId,
        actorId: currentUserId,
        actorName: currentUserName,
        actorAvatar: currentUserPhotoUrl || '',
        type: 'friend_request',
        targetId: requestId,
        targetType: 'friend_request',
        title: `${currentUserName} আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছেন`,
        message: `অনুরোধ পর্যালোচনা করুন`,
        actionData: { senderId: currentUserId }
      }).catch(() => {});

      return { success: true, data: { requestId }, message: 'বন্ধুত্বের অনুরোধ পাঠানো হয়েছে!' };
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      return { success: false, error: 'অনুরোধ পাঠাতে সমস্যা হয়েছে।' };
    } finally {
      IdempotencyManager.releaseLock(lockKey);
    }
  }

  /**
   * Accept Friend Request (Atomic DB Transaction)
   */
  static async acceptFriendRequest(
    requestId: string,
    currentUserId: string,
    currentUserName: string
  ): Promise<ServiceResult<void>> {
    const requestDocRef = doc(db, 'friend_requests', requestId);

    try {
      let senderId = '';
      let senderName = '';

      await runTransaction(db, async (transaction) => {
        const reqSnap = await transaction.get(requestDocRef);
        if (!reqSnap.exists()) {
          throw new Error('REQUEST_NOT_FOUND');
        }

        const reqData = reqSnap.data();
        if (reqData.receiverId !== currentUserId) {
          throw new Error('UNAUTHORIZED');
        }

        senderId = reqData.senderId;
        senderName = reqData.senderName;

        const userDocRef1 = doc(db, 'users', currentUserId);
        const userDocRef2 = doc(db, 'users', senderId);

        // Update Request Doc
        transaction.update(requestDocRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp()
        });

        // Add to friends array atomically
        transaction.set(userDocRef1, {
          friendIds: arrayUnion(senderId)
        }, { merge: true });

        transaction.set(userDocRef2, {
          friendIds: arrayUnion(currentUserId)
        }, { merge: true });

        // Direct friendship relation doc
        const friendshipId = [currentUserId, senderId].sort().join('_');
        transaction.set(doc(db, 'friendships', friendshipId), {
          user1: currentUserId,
          user2: senderId,
          createdAt: serverTimestamp()
        });
      });

      // Emit Event
      await EventDispatcher.emit('FriendRequestAccepted', {
        userId: currentUserId,
        friendId: senderId,
        userName: currentUserName
      });

      // Notification to requester
      notificationService.dispatchNotification({
        recipientId: senderId,
        actorId: currentUserId,
        actorName: currentUserName,
        actorAvatar: '',
        type: 'friend_request_accepted',
        targetId: currentUserId,
        targetType: 'user',
        title: `${currentUserName} আপনার বন্ধুত্বের অনুরোধ গ্রহণ করেছেন`,
        message: `এখন আপনারা পরস্পর বন্ধু!`,
        actionData: { friendId: currentUserId }
      }).catch(() => {});

      return { success: true, message: 'বন্ধুত্বের অনুরোধ গ্রহণ করা হয়েছে!' };
    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      return { success: false, error: 'অনুরোধ গ্রহণে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Cancel / Reject Friend Request
   */
  static async cancelOrRejectRequest(requestId: string): Promise<ServiceResult<void>> {
    try {
      await deleteDoc(doc(db, 'friend_requests', requestId));
      return { success: true, message: 'অনুরোধটি বাতিল করা হয়েছে।' };
    } catch (err) {
      return { success: false, error: 'বাতিল করতে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Unfriend
   */
  static async unfriend(user1Id: string, user2Id: string): Promise<ServiceResult<void>> {
    try {
      const friendshipId = [user1Id, user2Id].sort().join('_');
      await deleteDoc(doc(db, 'friendships', friendshipId));

      await setDoc(doc(db, 'users', user1Id), {
        friendIds: arrayRemove(user2Id)
      }, { merge: true });

      await setDoc(doc(db, 'users', user2Id), {
        friendIds: arrayRemove(user1Id)
      }, { merge: true });

      await EventDispatcher.emit('FriendshipRemoved', { user1Id, user2Id });

      return { success: true, message: 'বন্ধু তালিকা থেকে সরানো হয়েছে।' };
    } catch (err) {
      return { success: false, error: 'আনফ্রেন্ড করতে সমস্যা হয়েছে।' };
    }
  }
}

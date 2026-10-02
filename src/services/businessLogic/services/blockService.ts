// Block Business Service (Cross-Cutting Privacy & Safety Layer)

import { db } from '../../../firebase';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ServiceResult } from '../types';
import { EventDispatcher } from '../eventDispatcher';

export class BlockBusinessService {
  /**
   * Block User
   */
  static async blockUser(
    currentUserId: string,
    targetUserId: string,
    targetUserName?: string
  ): Promise<ServiceResult<void>> {
    if (currentUserId === targetUserId) {
      return { success: false, error: 'নিজেকে ব্লক করা সম্ভব নয়' };
    }

    try {
      const blockId = `${currentUserId}_${targetUserId}`;
      await setDoc(doc(db, 'user_blocks', blockId), {
        id: blockId,
        blockerId: currentUserId,
        blockedId: targetUserId,
        blockedName: targetUserName || '',
        createdAt: serverTimestamp()
      });

      // Update user document blocked array
      await setDoc(doc(db, 'users', currentUserId), {
        blockedUserIds: arrayUnion(targetUserId)
      }, { merge: true });

      // Automatically unfriend if were friends
      const friendshipId = [currentUserId, targetUserId].sort().join('_');
      try {
        await deleteDoc(doc(db, 'friendships', friendshipId));
        await setDoc(doc(db, 'users', currentUserId), { friendIds: arrayRemove(targetUserId) }, { merge: true });
        await setDoc(doc(db, 'users', targetUserId), { friendIds: arrayRemove(currentUserId) }, { merge: true });
      } catch {}

      await EventDispatcher.emit('UserBlocked', {
        blockerId: currentUserId,
        blockedId: targetUserId
      });

      return { success: true, message: 'ব্যবহারকারীকে ব্লক করা হয়েছে।' };
    } catch (err: any) {
      console.error('Error blocking user:', err);
      return { success: false, error: 'ব্লক করতে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Unblock User
   */
  static async unblockUser(currentUserId: string, targetUserId: string): Promise<ServiceResult<void>> {
    try {
      const blockId = `${currentUserId}_${targetUserId}`;
      await deleteDoc(doc(db, 'user_blocks', blockId));

      await setDoc(doc(db, 'users', currentUserId), {
        blockedUserIds: arrayRemove(targetUserId)
      }, { merge: true });

      return { success: true, message: 'আনব্লক সম্পন্ন হয়েছে।' };
    } catch (err) {
      return { success: false, error: 'আনব্লক করতে সমস্যা হয়েছে।' };
    }
  }
}

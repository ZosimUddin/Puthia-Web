// Bookmark Business Service (Save / Unsave Post & Saved Feed Retrieval)

import { db } from '../../../firebase';
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ServiceResult } from '../types';
import { EventDispatcher } from '../eventDispatcher';

export class BookmarkBusinessService {
  /**
   * Toggle Bookmark / Save Post
   */
  static async toggleSavePost(
    userId: string,
    postId: string,
    postSnippet?: { title?: string; author?: string; imageUrl?: string }
  ): Promise<ServiceResult<{ isSaved: boolean }>> {
    const bookmarkId = `${userId}_${postId}`;
    const bookmarkDocRef = doc(db, 'saved_posts', bookmarkId);

    try {
      const snap = await getDoc(bookmarkDocRef);

      if (snap.exists()) {
        // Unsave
        await deleteDoc(bookmarkDocRef);
        return { success: true, data: { isSaved: false }, message: 'বুকমার্ক থেকে সরানো হয়েছে।' };
      } else {
        // Save
        await setDoc(bookmarkDocRef, {
          id: bookmarkId,
          userId,
          postId,
          title: postSnippet?.title || '',
          author: postSnippet?.author || '',
          imageUrl: postSnippet?.imageUrl || null,
          savedAt: serverTimestamp()
        });

        await EventDispatcher.emit('PostSaved' as any, { userId, postId });

        return { success: true, data: { isSaved: true }, message: 'পোস্টটি সেভ করা হয়েছে!' };
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      return { success: false, error: 'বুকমার্ক আপডেট করতে সমস্যা হয়েছে।' };
    }
  }

  /**
   * Get All Saved Posts for User
   */
  static async getUserSavedPosts(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'saved_posts'),
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error getting saved posts:', err);
      return [];
    }
  }
}

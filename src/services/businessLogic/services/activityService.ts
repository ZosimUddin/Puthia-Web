// Activity Business Service (Audit Log & User Action Timeline)

import { db } from '../../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserActivityLog } from '../types';

export class ActivityBusinessService {
  /**
   * Get Recent Activity Log for a User
   */
  static async getUserActivities(userId: string, limitCount: number = 20): Promise<UserActivityLog[]> {
    try {
      const q = query(
        collection(db, 'user_activities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserActivityLog));
    } catch (err) {
      console.warn('Error fetching user activities:', err);
      return [];
    }
  }
}

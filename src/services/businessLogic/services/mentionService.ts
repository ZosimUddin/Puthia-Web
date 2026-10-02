// Mention Business Service (Regex Parser, User Validation, Notification Payload)

import { db } from '../../../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export class MentionBusinessService {
  /**
   * Parse mention strings e.g. @Rahim or @রহিম from content
   */
  static parseMentionNames(content: string): string[] {
    if (!content) return [];
    const regex = /@([a-zA-Z0-9_\u0980-\u09FF]+)/g;
    const matches = content.match(regex) || [];
    return Array.from(new Set(matches.map(m => m.replace('@', '').trim())));
  }

  /**
   * Extract mentions from text and resolve them to user IDs in DB
   */
  static async extractAndValidateMentions(content: string): Promise<string[]> {
    const names = this.parseMentionNames(content);
    if (names.length === 0) return [];

    const userIds: string[] = [];

    for (const name of names.slice(0, 10)) { // limit to max 10 mentions per item
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', name), limit(1));
        const snap = await getDocs(q);

        if (!snap.empty) {
          userIds.push(snap.docs[0].id);
        } else {
          // Try username
          const q2 = query(usersRef, where('username', '==', name), limit(1));
          const snap2 = await getDocs(q2);
          if (!snap2.empty) {
            userIds.push(snap2.docs[0].id);
          }
        }
      } catch (err) {
        console.warn('Error resolving mention:', name, err);
      }
    }

    return Array.from(new Set(userIds));
  }
}

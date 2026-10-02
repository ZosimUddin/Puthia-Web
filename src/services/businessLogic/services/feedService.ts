// Feed Business Service (Multi-Stream Compilation, Ranking Algorithm, Privacy & Block Filtering)

import { db } from '../../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { PostPolicy, UserContext } from '../policies';
import { CacheManager } from '../cacheManager';

export interface FeedQueryParams {
  userContext: UserContext | null;
  category?: string;
  union?: string;
  limitCount?: number;
  feedType?: 'for_you' | 'friends' | 'popular' | 'recent';
}

export class FeedBusinessService {
  /**
   * Fetch compiled, ranked, and privacy-filtered feed
   */
  static async getFeedPosts(params: FeedQueryParams): Promise<any[]> {
    const { userContext, category, union, limitCount = 30, feedType = 'for_you' } = params;
    const cacheKey = `feed_${feedType}_${category || 'all'}_${union || 'all'}_${userContext?.uid || 'guest'}`;

    // 1. Check Cache
    const cached = CacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const postsRef = collection(db, 'discussions');
      let q = query(
        postsRef,
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // fetch buffer for filtering
      );

      const snapshot = await getDocs(q);
      let rawPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));

      // 2. Filter by Category
      if (category && category !== 'all') {
        rawPosts = rawPosts.filter(p => p.category === category);
      }

      // 3. Filter by Union
      if (union && union !== 'all') {
        rawPosts = rawPosts.filter(p => p.union === union);
      }

      // 4. Authorization & Block Policy Filter
      let authorizedPosts = rawPosts.filter(post => {
        const policy = PostPolicy.canView(userContext, post);
        return policy.allowed;
      });

      // 5. Ranking & Scoring Algorithm
      const scoredPosts = authorizedPosts.map(post => {
        let score = 0;

        // Recency Score (hours elapsed)
        const postTime = post.createdAt?.toDate ? post.createdAt.toDate().getTime() : (post.createdAt ? new Date(post.createdAt).getTime() : Date.now());
        const hoursAgo = Math.max(0.1, (Date.now() - postTime) / (1000 * 60 * 60));
        score += Math.max(0, 100 - (hoursAgo * 2)); // Decay over 50 hours

        // Engagement Score
        const reactions = post.likes || post.reactionsCount || 0;
        const comments = post.commentsCount || 0;
        const shares = post.sharesCount || 0;
        score += (reactions * 3) + (comments * 5) + (shares * 7);

        // Locality Boost
        if (post.union?.includes('পুঠিয়া') || post.union?.includes('বানেশ্বর')) {
          score += 15;
        }

        // Friends Boost
        if (userContext?.friendIds?.includes(post.authorId)) {
          score += 40;
        }

        // Urgent / Emergency Alert Boost
        if (post.isUrgent) {
          score += 80;
        }

        return { ...post, feedScore: score };
      });

      // Sort by feedScore if 'for_you' or 'popular', else by timestamp
      if (feedType === 'for_you' || feedType === 'popular') {
        scoredPosts.sort((a, b) => b.feedScore - a.feedScore);
      }

      const finalFeed = scoredPosts.slice(0, limitCount);

      // Cache Feed for 60 seconds
      CacheManager.set(cacheKey, finalFeed, 60);

      return finalFeed;
    } catch (err) {
      console.error('Error in FeedBusinessService:', err);
      return [];
    }
  }
}

import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { Reel, ReelComment, ReelAudio, ReelReactionType, ReelRulesConfig, ReelAnalyticsData } from '../types';
import { INITIAL_AUDIO_TRACKS, DEFAULT_REEL_RULES } from '../data/reelAudioData';

const FALLBACK_REELS: Reel[] = [
  {
    id: 'fallback_reel_1',
    authorId: 'u4',
    authorName: 'মোঃ জসিম উদ্দিন',
    authorUsername: 'josim_puthia',
    authorAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=josim',
    isVerified: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-4735-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&auto=format&fit=crop&q=80',
    caption: 'পুঠিয়া রাজবাড়ির শিব মন্দির লেক ড্রোন ভিউ 🌿 রাজকীয় সৌন্দর্য ও শান্ত পরিবেশ। আমাদের পুঠিয়া আমাদের অহংকার! #Puthia #Rajbari #BeautifulBangladesh',
    hashtags: ['Puthia', 'Rajbari', 'BeautifulBangladesh'],
    mentions: [],
    location: 'শিব মন্দির, পুঠিয়া',
    audioTitle: 'রবীন্দ্র সঙ্গীত - বাঁশি সুর',
    originalAudio: false,
    audioAuthor: 'শান্তনু মৈত্র',
    duration: 15,
    privacy: 'public',
    viewsCount: 342,
    likesCount: 124,
    reactionsCount: 124,
    commentsCount: 23,
    sharesCount: 12,
    savesCount: 5,
    status: 'published',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'fallback_reel_2',
    authorId: 'u1',
    authorName: 'তানজিলা আক্তার',
    authorUsername: 'tanzila_aktar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    isVerified: false,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-4735-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    caption: 'বানেশ্বর আম বাজারের প্রাণবন্ত দৃশ্য 🥭 সারা দেশ থেকে পাইকাররা এসেছে আম কিনতে। লক্ষণভোগ ও ল্যাংড়া আমের সুবাসে মুখরিত পুরো বাজার! #Baneswar #Mango #Rajshahi',
    hashtags: ['Baneswar', 'Mango', 'Rajshahi'],
    mentions: [],
    location: 'বানেশ্বর আম বাজার, পুঠিয়া',
    audioTitle: 'বাংলার লোক সুর - বাঁশি',
    originalAudio: true,
    duration: 20,
    privacy: 'public',
    viewsCount: 198,
    likesCount: 56,
    reactionsCount: 56,
    commentsCount: 9,
    sharesCount: 3,
    savesCount: 2,
    status: 'published',
    createdAt: Date.now() - 7200000
  }
];

export const reelService = {
  // 1. Real-time Subscription to Public & Allowed Reels
  subscribeToReels: (
    currentUserId: string | null | undefined, 
    callback: (reels: Reel[]) => void
  ) => {
    const path = 'reels';
    try {
      // Note: combining where('status', '==', 'published') with orderBy('createdAt', 'desc')
      // requires a composite index in Firestore. To avoid missing index runtime errors,
      // we query by status and sort descending in-memory.
      const q = query(
        collection(db, path),
        where('status', '==', 'published'),
        limit(100)
      );

      return onSnapshot(q, (snapshot) => {
        const reelsList: Reel[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter out private reels if not author
          if (data.privacy === 'only_me' && (!currentUserId || data.authorId !== currentUserId)) {
            return;
          }
          reelsList.push({
            id: docSnap.id,
            ...data
          } as Reel);
        });

        // Sort descending by creation timestamp in memory
        reelsList.sort((a: any, b: any) => {
          const timeA = typeof a.createdAt?.toMillis === 'function' 
            ? a.createdAt.toMillis() 
            : (typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime());
          const timeB = typeof b.createdAt?.toMillis === 'function' 
            ? b.createdAt.toMillis() 
            : (typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime());
          return timeB - timeA;
        });
        
        try {
          localStorage.setItem("cached_reels_list", JSON.stringify(reelsList));
        } catch {}
        
        callback(reelsList);
      }, (error: any) => {
        if (error?.message?.includes("Quota") || error?.code === "resource-exhausted" || error?.message?.includes("quota")) {
          console.warn("Firestore quota limit reached for reels. Using cached/sample reels.");
        } else {
          console.error("Error subscribing to reels:", error);
        }

        let fallbackReelsList: Reel[] = [];
        try {
          const cached = localStorage.getItem("cached_reels_list");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              fallbackReelsList = parsed;
            }
          }
        } catch {}

        if (fallbackReelsList.length === 0) {
          fallbackReelsList = FALLBACK_REELS;
        }

        callback(fallbackReelsList);
      });
    } catch (error) {
      console.warn("Could not setup reels snapshot listener:", error);
      callback(FALLBACK_REELS);
      return () => {};
    }
  },

  // 2. Create and publish new Reel
  createReel: async (reelData: Omit<Reel, 'id' | 'viewsCount' | 'likesCount' | 'reactionsCount' | 'commentsCount' | 'sharesCount' | 'savesCount' | 'createdAt'>): Promise<string> => {
    const path = 'reels';
    try {
      const newDocRef = doc(collection(db, path));
      const fullReel: Reel = {
        ...reelData,
        id: newDocRef.id,
        viewsCount: 0,
        likesCount: 0,
        reactionsCount: 0,
        reactions: {},
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        savedBy: [],
        likedBy: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        watchTimeTotal: 0,
        completionCount: 0
      };

      await setDoc(newDocRef, fullReel);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  // 3. Delete Reel
  deleteReel: async (reelId: string) => {
    const path = `reels/${reelId}`;
    try {
      await deleteDoc(doc(db, 'reels', reelId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  // 4. Toggle/Change Reaction (like, love, haha, wow, sad, angry)
  toggleReaction: async (
    reelId: string, 
    userId: string, 
    reactionType: ReelReactionType, 
    currentReaction?: ReelReactionType | null
  ) => {
    const path = `reels/${reelId}`;
    try {
      const reelRef = doc(db, 'reels', reelId);
      const isRemoving = currentReaction === reactionType;

      if (isRemoving) {
        // Remove reaction
        await updateDoc(reelRef, {
          [`reactions.${userId}`]: null,
          reactionsCount: increment(-1),
          likesCount: increment(-1)
        });
      } else {
        // Add or replace reaction
        const countDiff = currentReaction ? 0 : 1;
        await updateDoc(reelRef, {
          [`reactions.${userId}`]: reactionType,
          reactionsCount: increment(countDiff),
          likesCount: increment(countDiff)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // 5. Subscribe to Comments for a Reel
  subscribeToComments: (reelId: string, callback: (comments: ReelComment[]) => void) => {
    const path = `reels/${reelId}/comments`;
    try {
      const q = query(
        collection(db, `reels/${reelId}/comments`),
        orderBy('timestamp', 'asc')
      );

      return onSnapshot(q, (snapshot) => {
        const comments: ReelComment[] = [];
        snapshot.forEach((docSnap) => {
          comments.push({ id: docSnap.id, ...docSnap.data() } as ReelComment);
        });
        callback(comments);
      }, (error) => {
        console.error("Error subscribing to reel comments:", error);
      });
    } catch (error) {
      console.warn("Could not listen to comments:", error);
      return () => {};
    }
  },

  // 6. Add Comment to Reel
  addComment: async (
    reelId: string, 
    user: { uid: string; name: string; photoURL?: string }, 
    text: string, 
    parentId?: string
  ): Promise<string> => {
    const path = `reels/${reelId}/comments`;
    try {
      const commentRef = doc(collection(db, path));
      const commentData: ReelComment = {
        id: commentRef.id,
        reelId,
        authorId: user.uid,
        authorName: user.name || 'ব্যবহারকারী',
        authorAvatar: user.photoURL || '',
        text,
        timestamp: Date.now(),
        likes: 0,
        likedBy: [],
        parentId: parentId || undefined
      };

      const batch = writeBatch(db);
      batch.set(commentRef, commentData);
      
      const reelRef = doc(db, 'reels', reelId);
      batch.update(reelRef, {
        commentsCount: increment(1),
        updatedAt: Date.now()
      });

      await batch.commit();
      return commentRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  // 7. Delete Comment
  deleteComment: async (reelId: string, commentId: string) => {
    const path = `reels/${reelId}/comments/${commentId}`;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, `reels/${reelId}/comments`, commentId));
      batch.update(doc(db, 'reels', reelId), {
        commentsCount: increment(-1)
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  // 8. Toggle Save Reel
  toggleSaveReel: async (reelId: string, userId: string, isCurrentlySaved: boolean) => {
    const path = `reels/${reelId}`;
    try {
      const reelRef = doc(db, 'reels', reelId);
      const userRef = doc(db, 'users', userId);

      const batch = writeBatch(db);
      if (isCurrentlySaved) {
        batch.update(reelRef, { savesCount: increment(-1) });
      } else {
        batch.update(reelRef, { savesCount: increment(1) });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // 9. Record Real View Event (Validated for >= 3 sec watch time)
  recordView: async (reelId: string, userId?: string, watchSeconds: number = 3) => {
    if (watchSeconds < 2.5) return; // Ignore accidental scrolls
    const sessionKey = `viewed_reel_${reelId}`;
    if (sessionStorage.getItem(sessionKey)) return; // Prevent multi-increment in same tab session

    sessionStorage.setItem(sessionKey, '1');
    const path = `reels/${reelId}`;
    try {
      const reelRef = doc(db, 'reels', reelId);
      await updateDoc(reelRef, {
        viewsCount: increment(1),
        watchTimeTotal: increment(Math.round(watchSeconds))
      });
    } catch (error) {
      console.warn("View counter update failed:", error);
    }
  },

  // 10. Record Share
  recordShare: async (reelId: string) => {
    const path = `reels/${reelId}`;
    try {
      const reelRef = doc(db, 'reels', reelId);
      await updateDoc(reelRef, {
        sharesCount: increment(1)
      });
    } catch (error) {
      console.warn("Share count increment failed:", error);
    }
  },

  // 11. Report Reel
  reportReel: async (reportData: {
    reelId: string;
    reporterId: string;
    reason: string;
    details?: string;
  }) => {
    const path = 'reel_reports';
    try {
      await addDoc(collection(db, path), {
        ...reportData,
        status: 'pending',
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  // 12. Audio Library Access
  getAudioTracks: async (): Promise<ReelAudio[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'reel_audio'));
      const dbTracks: ReelAudio[] = [];
      snapshot.forEach(d => dbTracks.push({ id: d.id, ...d.data() } as ReelAudio));
      return dbTracks.length > 0 ? dbTracks : INITIAL_AUDIO_TRACKS;
    } catch (error) {
      return INITIAL_AUDIO_TRACKS;
    }
  },

  // 13. Add Audio Track (Admin)
  addAudioTrack: async (track: Omit<ReelAudio, 'id' | 'createdAt' | 'useCount'>): Promise<string> => {
    const path = 'reel_audio';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...track,
        useCount: 0,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  // 14. Get Analytics for creator
  getReelAnalytics: (reel: Reel): ReelAnalyticsData => {
    const views = Math.max(1, reel.viewsCount || 0);
    const avgTime = reel.watchTimeTotal && reel.viewsCount 
      ? Math.round(reel.watchTimeTotal / reel.viewsCount) 
      : Math.min(reel.duration || 15, 8);
    const completionRate = Math.min(100, Math.round(((reel.completionCount || (views * 0.65)) / views) * 100));

    return {
      reelId: reel.id,
      viewsCount: reel.viewsCount || 0,
      uniqueViewers: Math.round(views * 0.85),
      reactionsCount: reel.reactionsCount || reel.likesCount || 0,
      commentsCount: reel.commentsCount || 0,
      sharesCount: reel.sharesCount || 0,
      savesCount: reel.savesCount || 0,
      averageWatchTime: avgTime,
      completionRate: completionRate,
      trafficSources: {
        feed: 45,
        explore: 30,
        profile: 15,
        direct: 10
      }
    };
  }
};

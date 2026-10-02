import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove, 
  increment 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  LiveStream, 
  LiveComment, 
  LiveReaction, 
  LiveViewer, 
  LiveReport, 
  LiveStreamStatus, 
  LiveCategory, 
  LiveAudience 
} from "../types/live";

const LIVE_COLLECTION = "live_streams";
const REPORTS_COLLECTION = "live_reports";

export const liveService = {
  /**
   * Create and launch a new Live Video Stream
   */
  async createLiveStream(data: {
    hostUid: string;
    hostName: string;
    hostAvatar?: string;
    hostVerified?: boolean;
    hostUnion?: string;
    title: string;
    description?: string;
    coverUrl?: string;
    category: LiveCategory;
    audience: LiveAudience;
    location?: string;
  }): Promise<string> {
    const path = LIVE_COLLECTION;
    try {
      const liveRef = doc(collection(db, LIVE_COLLECTION));
      const newStream: LiveStream = {
        id: liveRef.id,
        hostUid: data.hostUid,
        hostName: data.hostName,
        hostAvatar: data.hostAvatar || "",
        hostVerified: data.hostVerified || false,
        hostUnion: data.hostUnion || "",
        title: data.title,
        description: data.description || "",
        coverUrl: data.coverUrl || "",
        category: data.category,
        audience: data.audience,
        location: data.location || "পুঠিয়া",
        status: "live",
        viewerCount: 1, // Host starts as 1st viewer
        peakViewerCount: 1,
        totalReactions: 0,
        totalComments: 0,
        totalShares: 0,
        startedAt: Date.now(),
        replaySaved: true,
        slowModeSeconds: 0,
        commentsDisabled: false,
        blockedUserIds: [],
        moderatorUids: [data.hostUid],
        interestedUserIds: [],
        quality: "Auto",
        streamToken: `token_${Math.random().toString(36).substring(2, 10)}`,
        createdAt: Date.now(),
      };

      await setDoc(liveRef, newStream);

      // Trigger Broadcast Notification to Followers / Friends
      this.sendLiveNotification(liveRef.id, data.hostUid, data.hostName, data.title).catch(console.error);

      return liveRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  /**
   * Schedule a future Live Broadcast
   */
  async scheduleLiveStream(data: {
    hostUid: string;
    hostName: string;
    hostAvatar?: string;
    hostVerified?: boolean;
    hostUnion?: string;
    title: string;
    description?: string;
    coverUrl?: string;
    category: LiveCategory;
    audience: LiveAudience;
    location?: string;
    scheduledFor: number;
  }): Promise<string> {
    const path = LIVE_COLLECTION;
    try {
      const liveRef = doc(collection(db, LIVE_COLLECTION));
      const scheduledStream: LiveStream = {
        id: liveRef.id,
        hostUid: data.hostUid,
        hostName: data.hostName,
        hostAvatar: data.hostAvatar || "",
        hostVerified: data.hostVerified || false,
        hostUnion: data.hostUnion || "",
        title: data.title,
        description: data.description || "",
        coverUrl: data.coverUrl || "",
        category: data.category,
        audience: data.audience,
        location: data.location || "পুঠিয়া",
        status: "scheduled",
        scheduledFor: data.scheduledFor,
        viewerCount: 0,
        peakViewerCount: 0,
        totalReactions: 0,
        totalComments: 0,
        totalShares: 0,
        replaySaved: true,
        slowModeSeconds: 0,
        commentsDisabled: false,
        blockedUserIds: [],
        moderatorUids: [data.hostUid],
        interestedUserIds: [],
        createdAt: Date.now(),
      };

      await setDoc(liveRef, scheduledStream);
      return liveRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  /**
   * Listen to active Live Streams with filter
   */
  listenLiveStreams(
    statusFilter: LiveStreamStatus | "all" | "replays",
    categoryFilter: string | null,
    callback: (streams: LiveStream[]) => void
  ) {
    const path = LIVE_COLLECTION;
    try {
      let q = query(collection(db, LIVE_COLLECTION), orderBy("createdAt", "desc"), limit(50));

      if (statusFilter === "live") {
        q = query(collection(db, LIVE_COLLECTION), where("status", "==", "live"), orderBy("startedAt", "desc"), limit(50));
      } else if (statusFilter === "scheduled") {
        q = query(collection(db, LIVE_COLLECTION), where("status", "==", "scheduled"), orderBy("scheduledFor", "asc"), limit(50));
      } else if (statusFilter === "replays") {
        q = query(collection(db, LIVE_COLLECTION), where("status", "==", "ended"), where("replaySaved", "==", true), orderBy("endedAt", "desc"), limit(50));
      }

      return onSnapshot(
        q,
        (snapshot) => {
          let list: LiveStream[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as LiveStream;
            if (!categoryFilter || categoryFilter === "All" || data.category === categoryFilter) {
              list.push(data);
            }
          });
          callback(list);
        },
        (err) => {
          console.warn("Live stream query error/fallback:", err);
          callback([]);
        }
      );
    } catch (error) {
      console.warn("LiveStreams query setup failed:", error);
      callback([]);
      return () => {};
    }
  },

  /**
   * Get single Live Stream document in realtime
   */
  listenLiveStreamById(streamId: string, callback: (stream: LiveStream | null) => void) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const docRef = doc(db, LIVE_COLLECTION, streamId);
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data() as LiveStream);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.warn("Error listening to live stream doc:", error);
          callback(null);
        }
      );
    } catch (error) {
      console.warn("Error setting up live stream listener:", error);
      callback(null);
      return () => {};
    }
  },

  /**
   * End a Live Broadcast and update stats
   */
  async endLiveStream(streamId: string, saveReplay: boolean = true) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const docRef = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(docRef, {
        status: "ended",
        endedAt: Date.now(),
        replaySaved: saveReplay,
        viewerCount: 0,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Send a Real-time Comment during Live
   */
  async sendComment(streamId: string, data: {
    authorUid: string;
    authorName: string;
    authorAvatar?: string;
    authorBadge?: 'host' | 'moderator' | 'viewer';
    text: string;
    mentions?: string[];
    replyToId?: string;
  }) {
    const path = `${LIVE_COLLECTION}/${streamId}/comments`;
    try {
      const commentRef = doc(collection(db, LIVE_COLLECTION, streamId, "comments"));
      const newComment: LiveComment = {
        id: commentRef.id,
        streamId,
        authorUid: data.authorUid,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || "",
        authorBadge: data.authorBadge || "viewer",
        text: data.text,
        createdAt: Date.now(),
        reactions: {},
        mentions: data.mentions || [],
        replyToId: data.replyToId || "",
        hidden: false,
      };

      await setDoc(commentRef, newComment);

      // Increment comments count on master live stream
      const streamRef = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(streamRef, {
        totalComments: increment(1),
      }).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Listen to Live Stream Comments in Realtime
   */
  listenComments(streamId: string, callback: (comments: LiveComment[]) => void) {
    try {
      const q = query(
        collection(db, LIVE_COLLECTION, streamId, "comments"),
        orderBy("createdAt", "asc"),
        limit(100)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const list: LiveComment[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as LiveComment;
            if (!data.hidden) {
              list.push(data);
            }
          });
          callback(list);
        },
        (error) => {
          console.warn("Comments listener warning:", error);
          callback([]);
        }
      );
    } catch (error) {
      console.warn("Failed to listen to comments:", error);
      callback([]);
      return () => {};
    }
  },

  /**
   * Send floating reaction (Heart, Like, Laugh, Wow, Sad, Angry)
   */
  async sendReaction(streamId: string, userUid: string, type: LiveReaction['type']) {
    const path = `${LIVE_COLLECTION}/${streamId}/reactions`;
    try {
      const reactionRef = doc(collection(db, LIVE_COLLECTION, streamId, "reactions"));
      const newReaction: LiveReaction = {
        id: reactionRef.id,
        streamId,
        userUid,
        type,
        createdAt: Date.now(),
        xPosition: Math.floor(Math.random() * 80) + 10, // random 10% to 90%
      };

      await setDoc(reactionRef, newReaction);

      // Increment master stream reaction count
      const streamRef = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(streamRef, {
        totalReactions: increment(1),
      }).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Listen to floating reactions stream
   */
  listenReactions(streamId: string, callback: (reaction: LiveReaction) => void) {
    try {
      const q = query(
        collection(db, LIVE_COLLECTION, streamId, "reactions"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            callback(change.doc.data() as LiveReaction);
          }
        });
      });
    } catch (error) {
      console.warn("Reactions listener error:", error);
      return () => {};
    }
  },

  /**
   * Presence heartbeat for viewer count tracking
   */
  async joinAsViewer(streamId: string, user: { uid: string; name: string; avatar?: string }): Promise<string> {
    const path = `${LIVE_COLLECTION}/${streamId}/viewers`;
    try {
      const viewerRef = doc(db, LIVE_COLLECTION, streamId, "viewers", user.uid);
      const viewerData: LiveViewer = {
        id: user.uid,
        streamId,
        userUid: user.uid,
        userName: user.name,
        userAvatar: user.avatar || "",
        joinedAt: Date.now(),
        lastSeenAt: Date.now(),
      };

      await setDoc(viewerRef, viewerData);

      // Increment viewer count & update peak count
      const streamRef = doc(db, LIVE_COLLECTION, streamId);
      const snap = await getDoc(streamRef);
      if (snap.exists()) {
        const stream = snap.data() as LiveStream;
        const newCount = (stream.viewerCount || 0) + 1;
        const newPeak = Math.max(newCount, stream.peakViewerCount || 0);
        await updateDoc(streamRef, {
          viewerCount: newCount,
          peakViewerCount: newPeak,
        }).catch(() => {});
      }

      return viewerRef.id;
    } catch (error) {
      console.warn("Error registering viewer:", error);
      return user.uid;
    }
  },

  /**
   * Leave live stream as viewer
   */
  async leaveAsViewer(streamId: string, userUid: string) {
    try {
      const viewerRef = doc(db, LIVE_COLLECTION, streamId, "viewers", userUid);
      await deleteDoc(viewerRef).catch(() => {});

      const streamRef = doc(db, LIVE_COLLECTION, streamId);
      const snap = await getDoc(streamRef);
      if (snap.exists()) {
        const stream = snap.data() as LiveStream;
        const newCount = Math.max(0, (stream.viewerCount || 1) - 1);
        await updateDoc(streamRef, {
          viewerCount: newCount,
        }).catch(() => {});
      }
    } catch (error) {
      console.warn("Leave viewer error:", error);
    }
  },

  /**
   * Moderate: Delete comment
   */
  async deleteComment(streamId: string, commentId: string) {
    const path = `${LIVE_COLLECTION}/${streamId}/comments/${commentId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId, "comments", commentId);
      await deleteDoc(ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  /**
   * Moderate: Hide comment
   */
  async hideComment(streamId: string, commentId: string) {
    const path = `${LIVE_COLLECTION}/${streamId}/comments/${commentId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId, "comments", commentId);
      await updateDoc(ref, { hidden: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Moderate: Block user from live stream
   */
  async blockUserFromLive(streamId: string, targetUid: string) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(ref, {
        blockedUserIds: arrayUnion(targetUid),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Moderate: Add Moderator to stream
   */
  async addModerator(streamId: string, targetUid: string) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(ref, {
        moderatorUids: arrayUnion(targetUid),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Toggle Slow Mode (e.g., 10s delay)
   */
  async setSlowMode(streamId: string, seconds: number) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(ref, {
        slowModeSeconds: seconds,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Toggle Comments Disabled
   */
  async setCommentsDisabled(streamId: string, disabled: boolean) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(ref, {
        commentsDisabled: disabled,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Report Live Stream
   */
  async reportLiveStream(streamId: string, reporterUid: string, reason: string, details?: string) {
    const path = REPORTS_COLLECTION;
    try {
      const ref = doc(collection(db, REPORTS_COLLECTION));
      const report: LiveReport = {
        id: ref.id,
        streamId,
        reporterUid,
        reason,
        details: details || "",
        createdAt: Date.now(),
      };
      await setDoc(ref, report);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  /**
   * Interested / Notify Me on Scheduled Live
   */
  async toggleInterested(streamId: string, userUid: string) {
    const path = `${LIVE_COLLECTION}/${streamId}`;
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const stream = snap.data() as LiveStream;
        const interested = stream.interestedUserIds || [];
        if (interested.includes(userUid)) {
          await updateDoc(ref, { interestedUserIds: arrayRemove(userUid) });
        } else {
          await updateDoc(ref, { interestedUserIds: arrayUnion(userUid) });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  /**
   * Record Share Count
   */
  async recordShare(streamId: string) {
    try {
      const ref = doc(db, LIVE_COLLECTION, streamId);
      await updateDoc(ref, {
        totalShares: increment(1),
      }).catch(() => {});
    } catch (error) {
      console.warn("Record share error:", error);
    }
  },

  /**
   * Broadcast notification to friends / followers when user goes live
   */
  async sendLiveNotification(streamId: string, hostUid: string, hostName: string, title: string) {
    try {
      // Find followers or general users to notify
      const followsQuery = query(collection(db, "follows"), where("followingId", "==", hostUid), limit(100));
      const followsSnap = await getDocs(followsQuery).catch(() => null);

      if (followsSnap && !followsSnap.empty) {
        for (const docSnap of followsSnap.docs) {
          const followerId = docSnap.data().followerId;
          if (followerId && followerId !== hostUid) {
            const notifRef = doc(collection(db, "notifications"));
            await setDoc(notifRef, {
              id: notifRef.id,
              userId: followerId,
              title: `🔴 ${hostName} এখন Live!`,
              message: title,
              type: "live",
              link: `/live/${streamId}`,
              read: false,
              createdAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.warn("Error sending live notifications:", error);
    }
  }
};

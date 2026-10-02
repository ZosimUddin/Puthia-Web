import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  deleteDoc, 
  setDoc,
  updateDoc,
  writeBatch,
  limit,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { 
  notificationService, 
  NotificationType, 
  NotificationPriority, 
  AppNotificationRecord, 
  UserNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationActionData
} from '../services/notificationService';
import { toast } from 'sonner';

export type { NotificationType, NotificationPriority };

export interface AppNotification extends AppNotificationRecord {}

interface NotificationContextType {
  notifications: AppNotification[];
  groupedNotifications: AppNotification[];
  unreadCount: number;
  preferences: UserNotificationPreferences;
  isGroupingEnabled: boolean;
  setIsGroupingEnabled: (enabled: boolean) => void;
  updatePreferences: (prefs: Partial<UserNotificationPreferences>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  respondToFriendRequest: (id: string, accept: boolean) => Promise<void>;
  toggleFollowBack: (id: string) => Promise<void>;
  togglePinNotification: (id: string) => Promise<void>;
  sendQuickReply: (id: string, replyText: string) => Promise<void>;
  sendNotification: (notifData: {
    recipientId: string;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    type: NotificationType;
    priority?: NotificationPriority;
    targetId: string;
    targetType: string;
    title?: string;
    message: string;
    actionData?: NotificationActionData;
  }) => Promise<AppNotification | null>;
  addTestNotification: (type: NotificationType) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const SAMPLE_NOTIFICATIONS: AppNotification[] = [];

// Helper to normalize legacy notification types to standardized format
const normalizeNotificationType = (rawType: string): NotificationType => {
  const map: Record<string, NotificationType> = {
    'LIKE': 'reaction',
    'COMMENT': 'comment',
    'REPLY': 'reply',
    'FRIEND_REQUEST': 'friend_request',
    'MESSAGE': 'message',
    'MENTION': 'mention',
    'FOLLOW': 'follow',
    'GROUP': 'group_activity',
    'PAGE': 'page_activity',
    'MARKETPLACE': 'marketplace',
    'LIVE': 'live',
    'STORY': 'story_interaction',
    'NOTICE': 'system_notification',
    'JOB': 'system_notification',
    'BLOOD_EMERGENCY': 'system_notification',
    'SYSTEM': 'system_notification'
  };
  return map[rawType] || (rawType.toLowerCase() as NotificationType) || 'system_notification';
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  groupedNotifications: [],
  unreadCount: 0,
  preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  isGroupingEnabled: true,
  setIsGroupingEnabled: () => {},
  updatePreferences: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAllNotifications: async () => {},
  respondToFriendRequest: async () => {},
  toggleFollowBack: async () => {},
  togglePinNotification: async () => {},
  sendQuickReply: async () => {},
  sendNotification: async () => null,
  addTestNotification: async () => {},
  requestPushPermission: async () => false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);

  // User preferences
  const [preferences, setPreferences] = useState<UserNotificationPreferences>(() => {
    return notificationService.getUserPreferences(user?.uid || 'guest');
  });

  // Notifications State (100% Real from Firestore / Real-time events)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(`adda_system_notifs_v3_${user?.uid || 'guest'}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Strictly filter out any old sample/mock notifications
          return parsed.filter(n => n && !n.id.startsWith('sample-') && !n.id.startsWith('notif-'));
        }
      }
    } catch (e) {}
    return [];
  });

  // Sync preferences on user change
  useEffect(() => {
    const loadedPrefs = notificationService.getUserPreferences(user?.uid || 'guest');
    setPreferences(loadedPrefs);
  }, [user?.uid]);

  // Persist real notifications to local cache
  useEffect(() => {
    try {
      const realOnly = notifications.filter(n => n && !n.id.startsWith('sample-') && !n.id.startsWith('notif-'));
      localStorage.setItem(`adda_system_notifs_v3_${user?.uid || 'guest'}`, JSON.stringify(realOnly));
    } catch (e) {}
  }, [notifications, user?.uid]);

  // Real-time Event Listener for instant dispatch across components/tabs
  useEffect(() => {
    const handleNewNotif = (e: any) => {
      const newNotif = e.detail as AppNotification;
      if (newNotif && (newNotif.userId === (user?.uid || 'guest') || newNotif.userId === 'all_community_users')) {
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      }
    };

    window.addEventListener('adda_new_notification', handleNewNotif);
    return () => window.removeEventListener('adda_new_notification', handleNewNotif);
  }, [user?.uid]);

  // Sync with Firestore collections in real-time (Notifications + Incoming Friend Requests)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Map to hold merged notifications from all streams
    const notifMap = new Map<string, AppNotification>();

    const updateCombinedState = () => {
      const combined = Array.from(notifMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(combined);
    };

    // 1. Listen to notifications where userId == user.uid
    const q1 = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      limit(60)
    );

    const unsub1 = onSnapshot(q1, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const normType = normalizeNotificationType(data.type || 'system');
          
          let parsedCreatedAt = Date.now();
          if (typeof data.createdAt === 'number') {
            parsedCreatedAt = data.createdAt;
          } else if (data.createdAt?.toMillis) {
            parsedCreatedAt = data.createdAt.toMillis();
          } else if (data.createdAt?.seconds) {
            parsedCreatedAt = data.createdAt.seconds * 1000;
          }

          notifMap.set(docSnap.id, { 
            id: docSnap.id, 
            userId: data.userId || data.recipientId || user.uid,
            actorId: data.actorId || data.senderId || 'user',
            actorName: data.actorName || data.senderName || 'ব্যবহারকারী',
            actorAvatar: data.actorAvatar || data.senderPhotoUrl || data.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            type: normType,
            priority: data.priority || (normType === 'security_alert' ? 'critical' : 'normal'),
            targetId: data.targetId || data.postId || data.commentId || '',
            targetType: data.targetType || 'post',
            title: data.title || '',
            message: data.message || '',
            read: data.read !== undefined ? data.read : (data.isRead || false),
            actionStatus: data.actionStatus || 'pending',
            actionData: data.actionData || {},
            createdAt: parsedCreatedAt,
            isPinned: data.isPinned || false
          } as AppNotification);
        });

        // Trigger phone push notification for new incoming items
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) {
            const data = change.doc.data();
            const actorAvatar = data.actorAvatar || data.senderPhotoUrl || data.senderAvatar || '/pwa-192x192.png';
            const notifTitle = data.title || 'আমাদের পুঠিয়া নোটিফিকেশন';
            const notifBody = data.message || 'নতুন তথ্য এসেছে';
            const deepLink = data.actionData?.deepLink || data.link || '/notifications';

            notificationService.triggerBrowserPushNotification(notifTitle, {
              body: notifBody,
              icon: actorAvatar,
              tag: change.doc.id,
              url: deepLink,
              vibrate: [200, 100, 200, 100, 200],
              requireInteraction: data.type === 'friend_request' || data.type === 'message' || data.type === 'live'
            });
          }
        });
      }
      updateCombinedState();
    }, (err) => {
      console.warn("Firestore notification listener 1 note:", err);
    });

    // 2. Listen to notifications where recipientId == user.uid (for backward compatibility)
    const q2 = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      limit(60)
    );

    const unsub2 = onSnapshot(q2, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const normType = normalizeNotificationType(data.type || 'system');
          
          let parsedCreatedAt = Date.now();
          if (typeof data.createdAt === 'number') {
            parsedCreatedAt = data.createdAt;
          } else if (data.createdAt?.toMillis) {
            parsedCreatedAt = data.createdAt.toMillis();
          } else if (data.createdAt?.seconds) {
            parsedCreatedAt = data.createdAt.seconds * 1000;
          }

          notifMap.set(docSnap.id, { 
            id: docSnap.id, 
            userId: data.userId || data.recipientId || user.uid,
            actorId: data.actorId || data.senderId || 'user',
            actorName: data.actorName || data.senderName || 'ব্যবহারকারী',
            actorAvatar: data.actorAvatar || data.senderPhotoUrl || data.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            type: normType,
            priority: data.priority || (normType === 'security_alert' ? 'critical' : 'normal'),
            targetId: data.targetId || data.postId || data.commentId || '',
            targetType: data.targetType || 'post',
            title: data.title || '',
            message: data.message || '',
            read: data.read !== undefined ? data.read : (data.isRead || false),
            actionStatus: data.actionStatus || 'pending',
            actionData: data.actionData || {},
            createdAt: parsedCreatedAt,
            isPinned: data.isPinned || false
          } as AppNotification);
        });
      }
      updateCombinedState();
    }, (err) => {
      console.warn("Firestore notification listener 2 note:", err);
    });

    // 3. Listen to incoming Friend Requests (Guarantees pending requests appear in Notifications tab!)
    const q3 = query(
      collection(db, "friend_requests"),
      where("receiverId", "==", user.uid),
      where("status", "==", "pending"),
      limit(30)
    );

    const unsub3 = onSnapshot(q3, (snapshot) => {
      // Remove stale friend request notifications
      Array.from(notifMap.keys()).forEach(key => {
        if (key.startsWith('fr_')) notifMap.delete(key);
      });

      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const senderName = data.senderName || data.name || 'একজন সম্মানিত নাগরিক';
          const senderAvatar = data.senderPhotoUrl || data.senderAvatar || data.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(senderName)}`;
          
          let parsedCreatedAt = Date.now();
          if (typeof data.createdAt === 'number') {
            parsedCreatedAt = data.createdAt;
          } else if (data.createdAt?.toMillis) {
            parsedCreatedAt = data.createdAt.toMillis();
          } else if (data.createdAt?.seconds) {
            parsedCreatedAt = data.createdAt.seconds * 1000;
          }

          notifMap.set(`fr_${docSnap.id}`, {
            id: `fr_${docSnap.id}`,
            userId: user.uid,
            actorId: data.senderId,
            actorName: senderName,
            actorAvatar: senderAvatar,
            type: 'friend_request',
            priority: 'high',
            targetId: data.senderId,
            targetType: 'user',
            title: '👤 নতুন ফ্রেন্ড রিকোয়েস্ট',
            message: 'আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছেন।',
            read: false,
            actionStatus: 'pending',
            actionData: {
              requestId: docSnap.id,
              senderId: data.senderId,
              senderName: senderName,
              senderPhotoUrl: senderAvatar,
              deepLink: '/friends'
            },
            createdAt: parsedCreatedAt,
            isPinned: true
          } as AppNotification);
        });

        // Trigger phone push notification for new incoming friend requests
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) {
            const data = change.doc.data();
            const senderName = data.senderName || data.name || 'একজন নাগরিক';
            const senderAvatar = data.senderPhotoUrl || data.senderAvatar || data.photoURL || '/pwa-192x192.png';

            notificationService.triggerBrowserPushNotification('👤 নতুন ফ্রেন্ড রিকোয়েস্ট', {
              body: `${senderName} আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছেন।`,
              icon: senderAvatar,
              tag: `fr_${change.doc.id}`,
              url: '/friends',
              vibrate: [200, 100, 200, 100, 200],
              requireInteraction: true
            });
          }
        });
      }
      updateCombinedState();
    }, (err) => {
      console.warn("Firestore friend request listener note:", err);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user]);

  // Compute unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Compute grouped notifications
  const groupedNotifications = useMemo(() => {
    if (!isGroupingEnabled) return notifications;
    return notificationService.groupNotifications(notifications);
  }, [notifications, isGroupingEnabled]);

  // Update Preferences
  const updatePreferences = async (newPrefs: Partial<UserNotificationPreferences>) => {
    const updated = await notificationService.saveUserPreferences(user?.uid || 'guest', newPrefs);
    setPreferences(updated);
    toast.success("🔔 নোটিফিকেশন সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
  };

  // Mark single as read
  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!user || id.startsWith('sample-')) return;
    try {
      await setDoc(doc(db, "notifications", id), { 
        read: true, 
        isRead: true,
        userId: user.uid,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn("Notification read sync note:", e);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("সবগুলো নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে!");
    if (!user) return;
    try {
      const unreadNotifs = notifications.filter(n => !n.read && !n.id.startsWith('sample-'));
      if (unreadNotifs.length === 0) return;
      const batch = writeBatch(db);
      unreadNotifs.forEach(n => {
        batch.set(doc(db, "notifications", n.id), { 
          ...n,
          read: true, 
          isRead: true,
          userId: user.uid,
          updatedAt: Date.now()
        }, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      console.warn("Mark all read batch sync note:", e);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info("নোটিফিকেশন মুছে ফেলা হয়েছে।");
    if (!user || id.startsWith('sample-')) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (e) {
      console.warn("Delete notification sync note:", e);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setNotifications([]);
    toast.success("সকল নোটিফিকেশন মুছে ফেলা হয়েছে!");
    if (!user) return;
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.id.startsWith('sample-')).forEach(n => {
        batch.delete(doc(db, "notifications", n.id));
      });
      await batch.commit();
    } catch (e) {
      console.warn("Clear notifications sync note:", e);
    }
  };

  // Friend Request Action
  const respondToFriendRequest = async (id: string, accept: boolean) => {
    const nextStatus = accept ? 'accepted' : 'declined';
    const targetNotif = notifications.find(n => n.id === id);
    const senderUid = targetNotif?.actorId;
    const reqDocId = targetNotif?.actionData?.requestId || (id.startsWith('fr_') ? id.replace('fr_', '') : `${senderUid}_${user?.uid}`);

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, actionStatus: nextStatus, read: true } : n));
    
    if (accept) {
      toast.success(`🎉 ${targetNotif?.actorName || 'ব্যবহারকারীর'} ফ্রেন্ড রিকোয়েস্ট গ্রহণ করা হয়েছে!`);
      
      // Update Firestore friend_requests & users friend lists
      if (user && senderUid) {
        try {
          if (reqDocId) {
            await updateDoc(doc(db, 'friend_requests', reqDocId), {
              status: 'accepted',
              acceptedAt: Date.now()
            }).catch(() => {});
          }
          await updateDoc(doc(db, 'users', user.uid), {
            friends: arrayUnion(senderUid),
            friendsCount: increment(1),
            friendRequestsReceived: arrayRemove(senderUid)
          }).catch(() => {});
          await updateDoc(doc(db, 'users', senderUid), {
            friends: arrayUnion(user.uid),
            friendsCount: increment(1),
            friendRequestsSent: arrayRemove(user.uid)
          }).catch(() => {});
        } catch (e) {
          console.warn("Friend request accept sync error:", e);
        }
      }

      // Send notification back to actor
      if (targetNotif && user) {
        notificationService.dispatchNotification({
          recipientId: targetNotif.actorId,
          actorId: user.uid,
          actorName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
          actorAvatar: userProfile?.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          type: 'friend_request_accepted',
          priority: 'high',
          targetId: user.uid,
          targetType: 'user',
          title: 'অনুরোধ গৃহীত হয়েছে ✅',
          message: `${userProfile?.name || 'ব্যবহারকারী'} আপনার বন্ধুর অনুরোধ গ্রহণ করেছেন।`
        }).catch(() => {});
      }
    } else {
      toast.info("ফ্রেন্ড রিকোয়েস্ট বাতিল করা হয়েছে।");
      if (user && senderUid && reqDocId) {
        try {
          await deleteDoc(doc(db, 'friend_requests', reqDocId)).catch(() => {});
          await updateDoc(doc(db, 'users', user.uid), {
            friendRequestsReceived: arrayRemove(senderUid)
          }).catch(() => {});
          await updateDoc(doc(db, 'users', senderUid), {
            friendRequestsSent: arrayRemove(user.uid)
          }).catch(() => {});
        } catch (e) {}
      }
    }

    if (!user || id.startsWith('sample-') || id.startsWith('fr_')) return;
    try {
      await setDoc(doc(db, "notifications", id), { 
        actionStatus: nextStatus, 
        read: true, 
        isRead: true,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {}
  };

  // Follow Back Action
  const toggleFollowBack = async (id: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    const isFollowing = targetNotif?.actionStatus === 'following';
    const nextStatus = isFollowing ? 'pending' : 'following';

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, actionStatus: nextStatus, read: true } : n));

    if (!isFollowing) {
      toast.success(`➕ ${targetNotif?.actorName || 'ব্যবহারকারীকে'} ফলো করা হয়েছে!`);
      if (targetNotif) {
        notificationService.dispatchNotification({
          recipientId: targetNotif.actorId,
          actorId: user?.uid || 'guest',
          actorName: userProfile?.name || user?.displayName || 'সম্মানিত নাগরিক',
          actorAvatar: userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          type: 'follow',
          priority: 'normal',
          targetId: user?.uid || 'guest',
          targetType: 'user',
          title: 'নতুন ফলোয়ার ➕',
          message: `${userProfile?.name || 'ব্যবহারকারী'} আপনাকে ফলো করা শুরু করেছেন।`
        });
      }
    } else {
      toast.info("আনফলো করা হয়েছে।");
    }

    if (!user || id.startsWith('sample-')) return;
    try {
      await setDoc(doc(db, "notifications", id), { 
        actionStatus: nextStatus, 
        read: true, 
        isRead: true,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {}
  };

  // Send Quick Reply to Message Notification
  const sendQuickReply = async (id: string, replyText: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    if (!targetNotif || !replyText.trim()) return;

    markAsRead(id);
    toast.success(`${targetNotif.actorName}-কে কুইক মেসেজ পাঠানো হয়েছে: "${replyText}"`);

    // Dispatch reply message notification
    await notificationService.dispatchNotification({
      recipientId: targetNotif.actorId,
      actorId: user?.uid || 'guest',
      actorName: userProfile?.name || user?.displayName || 'নাগরিক',
      actorAvatar: userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      type: 'message',
      priority: 'high',
      targetId: user?.uid || 'guest',
      targetType: 'message',
      title: 'নতুন বার্তা 📩',
      message: `আপনাকে রিপ্লাই দিয়েছেন: "${replyText}"`,
      actionData: {
        conversationId: targetNotif.actionData?.conversationId || `chat_${targetNotif.actorId}`,
        messagePreview: replyText
      }
    });
  };

  // Toggle Pin Notification
  const togglePinNotification = async (id: string) => {
    const targetNotif = notifications.find(n => n.id === id);
    const newPinned = !targetNotif?.isPinned;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isPinned: newPinned } : n));
    toast.info(newPinned ? "📌 নোটিফিকেশন পিন করা হয়েছে" : "পিন মুক্ত করা হয়েছে");

    if (!user || id.startsWith('sample-')) return;
    try {
      await setDoc(doc(db, "notifications", id), { 
        isPinned: newPinned,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {}
  };

  // Send Generic Notification
  const sendNotification = async (notifData: {
    recipientId: string;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    type: NotificationType;
    priority?: NotificationPriority;
    targetId: string;
    targetType: string;
    title?: string;
    message: string;
    actionData?: NotificationActionData;
  }) => {
    return notificationService.dispatchNotification({
      recipientId: notifData.recipientId,
      actorId: notifData.actorId || user?.uid || 'guest',
      actorName: notifData.actorName || userProfile?.name || user?.displayName || 'নাগরিক',
      actorAvatar: notifData.actorAvatar || userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      type: notifData.type,
      priority: notifData.priority || 'normal',
      targetId: notifData.targetId,
      targetType: notifData.targetType,
      title: notifData.title,
      message: notifData.message,
      actionData: notifData.actionData
    });
  };

  // Web Push Permission Request
  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('আপনার ব্রাউজারে পুশ নোটিফিকেশন সাপোর্ট করে না।');
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('🎉 পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে!');
      updatePreferences({ pushEnabled: true });
      return true;
    } else {
      toast.error('পুশ নোটিফিকেশন পারমিশন প্রত্যাখ্যান করা হয়েছে।');
      updatePreferences({ pushEnabled: false });
      return false;
    }
  };

  // Test Simulator for any of the 18+ types
  const addTestNotification = async (type: NotificationType) => {
    const actorSeeds = [
      { name: 'তানভীর আহমেদ', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      { name: 'সালমা খাতুন', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
      { name: 'নাজমুল হুদা', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    ];
    const actor = actorSeeds[Math.floor(Math.random() * actorSeeds.length)];
    const myUid = user?.uid || 'guest';

    let title = '';
    let message = '';
    let targetType = 'post';
    let targetId = 'post-demo-1';
    let priority: NotificationPriority = 'normal';
    let actionData: NotificationActionData = {};

    switch (type) {
      case 'reaction':
        title = 'নতুন প্রতিক্রিয়া ❤️';
        message = `${actor.name} আপনার আড্ডা পোস্টে রিঅ্যাক্ট করেছেন 🔥`;
        actionData = { reactionEmoji: '🔥', postId: 'post-1' };
        break;
      case 'comment':
        title = 'নতুন মন্তব্য 💬';
        message = `${actor.name} আপনার পোস্টে মন্তব্য করেছেন: "পুঠিয়া রাজবাড়ীর স্থাপত্যশৈলী সত্যি চমৎকার!"`;
        actionData = { postId: 'post-1', commentText: 'পুঠিয়া রাজবাড়ীর স্থাপত্যশৈলী সত্যি চমৎকার!' };
        break;
      case 'reply':
        title = 'মন্তব্যের উত্তর ↩️';
        message = `${actor.name} আপনার মন্তব্যের উত্তর দিয়েছেন: "হ্যাঁ ভাই, কাল আমিও রাজবাড়ী যাবো।"`;
        actionData = { postId: 'post-1', replyId: 'rpl-1' };
        break;
      case 'friend_request':
        title = 'বন্ধুর অনুরোধ 👤';
        message = `${actor.name} আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন।`;
        targetType = 'user';
        targetId = `usr-${Date.now()}`;
        priority = 'high';
        break;
      case 'friend_request_accepted':
        title = 'অনুরোধ গৃহীত হয়েছে ✅';
        message = `${actor.name} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন।`;
        targetType = 'user';
        break;
      case 'follow':
        title = 'নতুন ফলোয়ার ➕';
        message = `${actor.name} আপনাকে আড্ডায় ফলো করেছেন।`;
        targetType = 'user';
        break;
      case 'mention':
        title = 'আপনাকে মেনশন করা হয়েছে 👀';
        message = `${actor.name} একটি পোস্টে আপনাকে মেনশন করেছেন: "@আপনি দেখুন আজকের বিশেষ আয়োজন!"`;
        priority = 'high';
        break;
      case 'message':
        title = 'নতুন বার্তা 📩';
        message = `${actor.name} আপনাকে একটি বার্তা পাঠিয়েছেন: "কেমন আছেন ভাইয়া? পুঠিয়া বাজারে আছেন কি?"`;
        priority = 'high';
        actionData = { conversationId: `chat_${actor.name}`, messagePreview: 'কেমন আছেন ভাইয়া? পুঠিয়া বাজারে আছেন কি?' };
        break;
      case 'group_activity':
        title = 'গ্রুপ আপডেট 👥';
        message = `পুঠিয়া নাগরিক কল্যাণ ফোরামে ${actor.name} একটি নতুন পোস্ট প্রকাশ করেছেন।`;
        targetType = 'group';
        actionData = { groupId: 'grp-1', groupName: 'পুঠিয়া নাগরিক কল্যাণ ফোরাম' };
        break;
      case 'page_activity':
        title = 'পেজ আপডেট 📄';
        message = `পুঠিয়া সেবা কেন্দ্রে একটি নতুন নোটিশ আপলোড হয়েছে।`;
        targetType = 'page';
        actionData = { pageId: 'pg-1', pageName: 'পুঠিয়া সেবা কেন্দ্র' };
        break;
      case 'reel_interaction':
        title = 'রিল প্রতিক্রিয়া 🎬';
        message = `${actor.name} আপনার রিলে লাভ রিয়েকশন দিয়েছেন ❤️`;
        targetType = 'reel';
        break;
      case 'story_interaction':
        title = 'স্টোরি আপডেট 📸';
        message = `${actor.name} আপনার ২৪ ঘণ্টার স্টোরিতে রিঅ্যাক্ট করেছেন 😍`;
        targetType = 'story';
        break;
      case 'live':
        title = '🔴 লাইভ সম্প্রচার';
        message = `উপজেলা পরিষদ পুঠিয়া থেকে সরাসরি লাইভ অধিবেশন শুরু হয়েছে।`;
        targetType = 'live';
        priority = 'high';
        break;
      case 'event':
        title = 'ইভেন্ট আমন্ত্রণ 📅';
        message = `আপনাকে "পুঠিয়া বইমেলা ও সাহিত্য উৎসব ২০২৬"-এ আমন্ত্রণ জানানো হয়েছে।`;
        targetType = 'event';
        break;
      case 'marketplace':
        title = 'মার্কেটপ্লেস আপডেট 🛒';
        message = `${actor.name} আপনার বিক্রয় পণ্যের জন্য ৳ ১,২০০ দাম প্রস্তাব করেছেন।`;
        targetType = 'marketplace';
        priority = 'high';
        break;
      case 'moderation':
        title = 'মডারেশন নোটিশ 🚩';
        message = `আপনার একটি পোস্ট রিভিউ সম্পন্ন হয়েছে এবং আড্ডার কমিউনিটি নীতিমালার সাথে সংগতিপূর্ণ পাওয়া গেছে।`;
        priority = 'high';
        break;
      case 'security_alert':
        title = '🛡️ নিরাপত্তা সতর্কতা';
        message = `সতর্কতা: আপনার অ্যাকাউন্টে নতুন লোকেশন (রাজশাহী সদর) থেকে পাসওয়ার্ড পরিবর্তনের চেষ্টা করা হয়েছে।`;
        priority = 'critical';
        actionData = {
          securityDetails: {
            device: 'Mobile Safari on iOS',
            location: 'Rajshahi Sadar, BD',
            ip: '103.220.14.88',
            action: 'Password Change Request'
          }
        };
        break;
      case 'system_notification':
      default:
        title = 'সিস্টেম নোটিশ ⚙️';
        message = `পুঠিয়া ডিজিটাল সেবা পোর্টাল ৩.০ ভার্সনে সফলভাবে আপগ্রেড করা হয়েছে!`;
        priority = 'normal';
        break;
    }

    const created = await notificationService.dispatchNotification({
      recipientId: myUid,
      actorId: `test-actor-${Date.now()}`,
      actorName: actor.name,
      actorAvatar: actor.avatar,
      type,
      priority,
      targetId,
      targetType,
      title,
      message,
      actionData
    });

    if (created) {
      setNotifications(prev => [created, ...prev]);
      toast.success(`🔔 "${title}" নোটিফিকেশন সিমুলেট করা হয়েছে!`);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        groupedNotifications,
        unreadCount,
        preferences,
        isGroupingEnabled,
        setIsGroupingEnabled,
        updatePreferences,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        respondToFriendRequest,
        toggleFollowBack,
        togglePinNotification,
        sendQuickReply,
        sendNotification,
        addTestNotification,
        requestPushPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

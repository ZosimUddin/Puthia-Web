import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// 1. Comprehensive Notification Types as per specification
export type NotificationType =
  | 'reaction'                    // ❤️ Reaction
  | 'comment'                     // 💬 Comment
  | 'reply'                       // ↩️ Reply
  | 'friend_request'              // 👤 Friend Request
  | 'friend_request_accepted'     // ✅ Friend Request Accepted
  | 'follow'                      // ➕ Follow
  | 'mention'                     // 👀 Mention
  | 'message'                     // 📩 Message
  | 'group_activity'              // 👥 Group Activity (post, comment, join, announcement)
  | 'page_activity'               // 📄 Page Activity (post, live, event)
  | 'reel_interaction'            // 🎬 Reel Interaction (reaction, comment)
  | 'story_interaction'           // 📸 Story Interaction (reaction, reply, mention)
  | 'live'                        // 🔴 Live Broadcast (started, invited)
  | 'event'                       // 📅 Event (invite, reminder)
  | 'birthday'                    // 🎂 Birthday
  | 'marketplace'                 // 🛒 Marketplace (approved, buyer msg, sold)
  | 'moderation'                  // 🚩 Report / Moderation Warning
  | 'security_alert'              // 🛡️ Security Alert (login, password, verification)
  | 'system_notification';        // ⚙️ System Announcement / Maintenance

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export interface NotificationActionData {
  [key: string]: any;
  postId?: string;
  postTitle?: string;
  commentId?: string;
  commentText?: string;
  replyId?: string;
  conversationId?: string;
  messagePreview?: string;
  groupId?: string;
  groupName?: string;
  pageId?: string;
  pageName?: string;
  reelId?: string;
  storyId?: string;
  liveId?: string;
  liveTitle?: string;
  eventId?: string;
  eventTitle?: string;
  marketplaceId?: string;
  itemTitle?: string;
  itemPrice?: string;
  reactionEmoji?: string;
  securityDetails?: {
    device?: string;
    location?: string;
    ip?: string;
    action?: string;
  };
  deepLink?: string;
  aggregateCount?: number;
  aggregateActors?: { id: string; name: string; avatar: string }[];
}

export interface AppNotificationRecord {
  id: string;
  userId: string;                   // Recipient UID
  actorId: string;                  // Creator UID
  actorName: string;
  actorAvatar: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetId: string;
  targetType: string;
  title?: string;
  message: string;
  read: boolean;
  isPinned?: boolean;
  actionStatus?: 'pending' | 'accepted' | 'declined' | 'following';
  actionData?: NotificationActionData;
  createdAt: number;
  expiresAt?: number;
  idempotencyKey?: string;
}

export interface UserNotificationPreferences {
  reactions: boolean;
  comments: boolean;
  replies: boolean;
  friendRequests: boolean;
  followers: boolean;
  mentions: boolean;
  messages: boolean;
  messagePreviewPrivacy: boolean; // Hide message text preview
  groups: boolean;
  pages: boolean;
  marketplace: boolean;
  storiesAndReels: boolean;
  liveStreams: boolean;
  events: boolean;
  moderationAlerts: boolean;
  securityAlerts: boolean;         // Always TRUE (Locked)
  soundEnabled: boolean;
  pushEnabled: boolean;
  inAppBannerEnabled: boolean;
  dndEnabled: boolean;
  dndStartTime?: string;           // "22:00"
  dndEndTime?: string;             // "07:00"
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  reactions: true,
  comments: true,
  replies: true,
  friendRequests: true,
  followers: true,
  mentions: true,
  messages: true,
  messagePreviewPrivacy: false,
  groups: true,
  pages: true,
  marketplace: true,
  storiesAndReels: true,
  liveStreams: true,
  events: true,
  moderationAlerts: true,
  securityAlerts: true,            // Non-modifiable
  soundEnabled: true,
  pushEnabled: true,
  inAppBannerEnabled: true,
  dndEnabled: false,
  dndStartTime: "22:00",
  dndEndTime: "07:00"
};

export interface NotificationAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  notificationType: string;
  targetAudience: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  recipientCount: number;
  deliveryStatus: 'sent' | 'partial' | 'failed';
  createdAt: number;
  reason?: string;
}

export class NotificationService {
  private recentEventsCache = new Map<string, number>();

  /**
   * Sound Chime Generator for web browser
   */
  public playNotificationSound(priority: NotificationPriority = 'normal') {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (priority === 'critical') {
        // High alert double tone
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        // Gentle modern chime
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Web Push Notification trigger (Displays in Phone System Notification Bar)
   */
  public async triggerBrowserPushNotification(
    title: string, 
    options: NotificationOptions & { 
      url?: string; 
      vibrate?: number[] | number; 
      requireInteraction?: boolean; 
      [key: string]: any; 
    }
  ) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        const deepUrl = options.url || (options.data as any)?.url || '/';
        const notifOptions: any = {
          icon: options.icon || '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: options.vibrate || [200, 100, 200, 100, 200],
          body: options.body || '',
          tag: options.tag || `notif_${Date.now()}`,
          requireInteraction: options.requireInteraction || false,
          data: { url: deepUrl },
          ...options
        };

        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
              await reg.showNotification(title, notifOptions);
              return;
            }
          } catch (swErr) {
            console.warn('Service worker notification fallback:', swErr);
          }
        }

        const n = new Notification(title, notifOptions);
        n.onclick = () => {
          window.focus();
          if (deepUrl) {
            window.location.href = deepUrl;
          }
        };
      } catch (e) {
        console.warn('Browser push notification error:', e);
      }
    }
  }

  /**
   * Resolve Deep Link Destination for seamless routing
   */
  public resolveDeepLink(type: NotificationType, targetId: string, actionData?: NotificationActionData): string {
    switch (type) {
      case 'reaction':
      case 'comment':
      case 'reply':
      case 'mention':
        return `/adda?post=${targetId}${actionData?.commentId ? `&comment=${actionData.commentId}` : ''}`;
      case 'friend_request':
      case 'friend_request_accepted':
      case 'follow':
        return `/profile?uid=${targetId}`;
      case 'message':
        return `/chat?user=${targetId}`;
      case 'group_activity':
        return `/group/${targetId}`;
      case 'page_activity':
        return `/page/${targetId}`;
      case 'reel_interaction':
        return `/adda?tab=reels&reel=${targetId}`;
      case 'story_interaction':
        return `/adda?story=${targetId}`;
      case 'live':
        return `/live`;
      case 'event':
        return `/events?event=${targetId}`;
      case 'marketplace':
        return `/marketplace/item/${targetId}`;
      case 'moderation':
        return `/moderation/appeals?id=${targetId}`;
      case 'security_alert':
        return `/profile?tab=security`;
      case 'system_notification':
      default:
        return `/notifications`;
    }
  }

  /**
   * Check if User is in Do Not Disturb Mode
   */
  private isInDndTime(prefs: UserNotificationPreferences): boolean {
    if (!prefs.dndEnabled || !prefs.dndStartTime || !prefs.dndEndTime) return false;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = prefs.dndStartTime.split(':').map(Number);
    const [endH, endM] = prefs.dndEndTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin <= endMin;
    } else {
      // Over midnight
      return currentMin >= startMin || currentMin <= endMin;
    }
  }

  /**
   * Check Block List - if sender is blocked by recipient or vice versa
   */
  private isUserBlocked(recipientId: string, actorId: string): boolean {
    try {
      const blockedKey = `adda_blocked_users_${recipientId}`;
      const blockedRaw = localStorage.getItem(blockedKey);
      if (blockedRaw) {
        const blockedList = JSON.parse(blockedRaw);
        if (Array.isArray(blockedList) && blockedList.includes(actorId)) {
          return true;
        }
      }
    } catch {}
    return false;
  }

  /**
   * Check User Notification Preferences
   */
  public getUserPreferences(userId: string): UserNotificationPreferences {
    try {
      const key = `adda_notif_prefs_${userId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(cached), securityAlerts: true };
      }
    } catch {}
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  /**
   * Save User Notification Preferences
   */
  public async saveUserPreferences(userId: string, prefs: Partial<UserNotificationPreferences>) {
    const updated: UserNotificationPreferences = {
      ...this.getUserPreferences(userId),
      ...prefs,
      securityAlerts: true // Strictly locked
    };
    try {
      localStorage.setItem(`adda_notif_prefs_${userId}`, JSON.stringify(updated));
      await setDoc(doc(db, "notification_preferences", userId), updated, { merge: true });
    } catch (e) {
      console.warn("Preferences cloud sync error:", e);
    }
    return updated;
  }

  /**
   * MAIN NOTIFICATION DISPATCHER (End-to-End Flow)
   */
  public async dispatchNotification(params: {
    recipientId: string;
    actorId: string;
    actorName: string;
    actorAvatar: string;
    type: NotificationType;
    priority?: NotificationPriority;
    targetId: string;
    targetType: string;
    title?: string;
    message: string;
    actionData?: NotificationActionData;
  }): Promise<AppNotificationRecord | null> {
    const {
      recipientId,
      actorId,
      actorName,
      actorAvatar,
      type,
      priority = 'normal',
      targetId,
      targetType,
      title,
      message,
      actionData = {}
    } = params;

    // Rule 1: Never notify self
    if (recipientId === actorId) return null;

    // Rule 2: Check Block List
    if (this.isUserBlocked(recipientId, actorId)) {
      return null;
    }

    // Rule 3: Check User Preferences
    const prefs = this.getUserPreferences(recipientId);
    if (type !== 'security_alert') {
      if (type === 'reaction' && !prefs.reactions) return null;
      if (type === 'comment' && !prefs.comments) return null;
      if (type === 'reply' && !prefs.replies) return null;
      if (type === 'friend_request' && !prefs.friendRequests) return null;
      if (type === 'follow' && !prefs.followers) return null;
      if (type === 'mention' && !prefs.mentions) return null;
      if (type === 'message' && !prefs.messages) return null;
      if (type === 'group_activity' && !prefs.groups) return null;
      if (type === 'page_activity' && !prefs.pages) return null;
      if (type === 'marketplace' && !prefs.marketplace) return null;
      if (type === 'story_interaction' && !prefs.storiesAndReels) return null;
      if (type === 'reel_interaction' && !prefs.storiesAndReels) return null;
      if (type === 'live' && !prefs.liveStreams) return null;
      if (type === 'event' && !prefs.events) return null;
      if (type === 'moderation' && !prefs.moderationAlerts) return null;
    }

    // Rule 4: Duplicate Prevention (Idempotency check within 25 seconds)
    const idempotencyKey = `${actorId}_${type}_${targetId}`;
    const lastEventTime = this.recentEventsCache.get(idempotencyKey);
    const now = Date.now();

    if (lastEventTime && now - lastEventTime < 25000 && type === 'reaction') {
      // Ignore rapid duplicate reaction bursts
      return null;
    }
    this.recentEventsCache.set(idempotencyKey, now);

    // Rule 5: Privacy Setting for Message Preview
    let finalMessage = message;
    if (type === 'message' && prefs.messagePreviewPrivacy) {
      finalMessage = 'আপনাকে একটি ব্যক্তিগত বার্তা পাঠিয়েছেন।';
    }

    // Rule 6: Deep Link Calculation
    const deepLink = this.resolveDeepLink(type, targetId, actionData);
    actionData.deepLink = deepLink;

    const notifRecord: Omit<AppNotificationRecord, 'id'> = {
      userId: recipientId,
      actorId,
      actorName,
      actorAvatar,
      type,
      priority,
      targetId,
      targetType,
      title: title || this.getDefaultTitle(type),
      message: finalMessage,
      read: false,
      isPinned: priority === 'critical',
      actionStatus: type === 'friend_request' ? 'pending' : undefined,
      actionData,
      createdAt: now,
      expiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days retention
      idempotencyKey
    };

    let docId = `notif_${now}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      // 1. Write to Firestore
      const docRef = await addDoc(collection(db, "notifications"), notifRecord);
      docId = docRef.id;
    } catch (err) {
      console.warn("Firestore notification insert note (using local state fallback):", err);
    }

    const completeRecord: AppNotificationRecord = {
      id: docId,
      ...notifRecord
    };

    // 2. Real-time Dispatch Event (Custom Event for instant UI update without refresh)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adda_new_notification', { detail: completeRecord }));

      // 3. Audio & Push if not in DND
      const inDnd = this.isInDndTime(prefs);
      if (!inDnd) {
        if (prefs.soundEnabled) {
          this.playNotificationSound(priority);
        }
        if (prefs.pushEnabled || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted')) {
          this.triggerBrowserPushNotification(completeRecord.title || 'আমাদের পুঠিয়া নোটিফিকেশন', {
            body: completeRecord.message,
            icon: completeRecord.actorAvatar || '/pwa-192x192.png',
            tag: idempotencyKey,
            data: { url: deepLink },
            url: deepLink,
            requireInteraction: priority === 'critical' || type === 'message' || type === 'friend_request' || type === 'live'
          });

          // 4. Server-Side FCM Trigger (Delivers Android System Notification via Google Cloud Messaging)
          try {
            fetch('/api/fcm/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipientId: recipientId,
                title: completeRecord.title || 'আমাদের পুঠিয়া নোটিফিকেশন',
                body: completeRecord.message,
                icon: completeRecord.actorAvatar || '/pwa-192x192.png',
                type: type,
                priority: priority,
                data: {
                  ...actionData,
                  deepLink: deepLink,
                  url: deepLink,
                  actorId: actorId,
                  actorName: actorName,
                  actorAvatar: actorAvatar
                },
                url: deepLink
              })
            }).catch(err => console.warn('[fcmTrigger] Background server FCM send skipped:', err));
          } catch (e) {}
        }
      }
    }

    return completeRecord;
  }

  /**
   * Smart Grouping: E.g., "রহিম এবং আরও ২৪ জন..."
   */
  public groupNotifications(notifs: AppNotificationRecord[]): AppNotificationRecord[] {
    const groupedMap = new Map<string, AppNotificationRecord[]>();

    notifs.forEach(notif => {
      // Only group reactions and comments on same target
      if (['reaction', 'comment'].includes(notif.type) && notif.targetId) {
        const groupKey = `${notif.type}_${notif.targetId}`;
        const existing = groupedMap.get(groupKey) || [];
        existing.push(notif);
        groupedMap.set(groupKey, existing);
      }
    });

    const result: AppNotificationRecord[] = [];
    const processedGroupKeys = new Set<string>();

    notifs.forEach(notif => {
      if (['reaction', 'comment'].includes(notif.type) && notif.targetId) {
        const groupKey = `${notif.type}_${notif.targetId}`;
        if (processedGroupKeys.has(groupKey)) return;

        const cluster = groupedMap.get(groupKey);
        if (cluster && cluster.length > 1) {
          processedGroupKeys.add(groupKey);
          const lead = cluster[0];
          const otherCount = cluster.length - 1;
          const emoji = lead.actionData?.reactionEmoji || (lead.type === 'reaction' ? '❤️' : '💬');

          const groupedTitle = lead.type === 'reaction' 
            ? `${lead.actorName} এবং আরও ${this.toBengaliNumber(otherCount)} জন আপনার পোস্টে রিঅ্যাক্ট করেছেন ${emoji}`
            : `${lead.actorName} এবং আরও ${this.toBengaliNumber(otherCount)} জন আপনার পোস্টে মন্তব্য করেছেন 💬`;

          result.push({
            ...lead,
            actorName: `${lead.actorName} +${otherCount}`,
            message: groupedTitle,
            actionData: {
              ...lead.actionData,
              aggregateCount: cluster.length,
              aggregateActors: cluster.map(c => ({ id: c.actorId, name: c.actorName, avatar: c.actorAvatar }))
            }
          });
          return;
        }
      }
      result.push(notif);
    });

    return result;
  }

  /**
   * Admin Broadcast System Notification
   */
  public async broadcastAdminAnnouncement(params: {
    adminId: string;
    adminName: string;
    title: string;
    message: string;
    priority: NotificationPriority;
    targetAudience: 'all' | 'verified' | 'moderators' | 'citizens';
    reason?: string;
  }): Promise<{ success: boolean; deliveredCount: number; auditId: string }> {
    const { adminId, adminName, title, message, priority, targetAudience, reason } = params;
    const now = Date.now();

    // Query recipients based on target audience
    let recipientIds: string[] = [];
    try {
      const usersRef = collection(db, "users");
      let q = query(usersRef, limit(100));
      if (targetAudience === 'verified') {
        q = query(usersRef, where("isVerified", "==", true), limit(100));
      } else if (targetAudience === 'moderators') {
        q = query(usersRef, where("role", "in", ["admin", "moderator"]), limit(100));
      }
      const snap = await getDocs(q);
      recipientIds = snap.docs.map(d => d.id);
    } catch (e) {
      console.warn("User query for broadcast error:", e);
    }

    if (recipientIds.length === 0) {
      recipientIds = ['guest', 'all_community_users'];
    }

    // Batch send notifications
    let count = 0;
    for (const uId of recipientIds) {
      await this.dispatchNotification({
        recipientId: uId,
        actorId: adminId,
        actorName: adminName,
        actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        type: 'system_notification',
        priority,
        targetId: 'system_broadcast',
        targetType: 'system',
        title: title || 'জরুরি সিস্টেম ঘোষণা',
        message
      });
      count++;
    }

    // Record in Audit Logs
    const auditRecord: NotificationAuditLog = {
      id: `audit_${now}`,
      adminId,
      adminName,
      notificationType: 'system_announcement',
      targetAudience,
      title,
      message,
      priority,
      recipientCount: count,
      deliveryStatus: 'sent',
      createdAt: now,
      reason
    };

    try {
      await addDoc(collection(db, "notification_audit_logs"), auditRecord);
    } catch (e) {
      const existingLogsRaw = localStorage.getItem('adda_notification_audit_logs') || '[]';
      const parsed = JSON.parse(existingLogsRaw);
      parsed.unshift(auditRecord);
      localStorage.setItem('adda_notification_audit_logs', JSON.stringify(parsed));
    }

    return {
      success: true,
      deliveredCount: count,
      auditId: auditRecord.id
    };
  }

  private getDefaultTitle(type: NotificationType): string {
    switch (type) {
      case 'reaction': return 'নতুন প্রতিক্রিয়া ❤️';
      case 'comment': return 'নতুন মন্তব্য 💬';
      case 'reply': return 'মন্তব্যের উত্তর ↩️';
      case 'friend_request': return 'বন্ধুর অনুরোধ 👤';
      case 'friend_request_accepted': return 'অনুরোধ গৃহীত হয়েছে ✅';
      case 'follow': return 'নতুন ফলোয়ার ➕';
      case 'mention': return 'আপনাকে মেনশন করা হয়েছে 👀';
      case 'message': return 'নতুন বার্তা 📩';
      case 'group_activity': return 'গ্রুপ আপডেট 👥';
      case 'page_activity': return 'পেজ আপডেট 📄';
      case 'reel_interaction': return 'রিল আপডেট 🎬';
      case 'story_interaction': return 'স্টোরি আপডেট 📸';
      case 'live': return 'লাইভ শুরু হয়েছে 🔴';
      case 'event': return 'ইভেন্ট আমন্ত্রণ 📅';
      case 'marketplace': return 'মার্কেটপ্লেস আপডেট 🛒';
      case 'moderation': return 'মডারেশন নোটিশ 🚩';
      case 'security_alert': return 'নিরাপত্তা সতর্কতা 🛡️';
      case 'system_notification': return 'সিস্টেম নোটিশ ⚙️';
      default: return 'নোটিফিকেশন';
    }
  }

  private toBengaliNumber(num: number): string {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => {
      const parsed = parseInt(digit);
      return isNaN(parsed) ? digit : bengaliDigits[parsed];
    }).join('');
  }
}

export const notificationService = new NotificationService();

// Legacy export for backward compatibility
export const sendNotification = async (
  recipientId: string,
  actorId: string,
  actorName: string,
  actorAvatar: string,
  type: string,
  targetId: string,
  targetType: string,
  message: string
) => {
  return notificationService.dispatchNotification({
    recipientId,
    actorId,
    actorName,
    actorAvatar,
    type: (type.toLowerCase() as NotificationType) || 'system_notification',
    targetId,
    targetType,
    message
  });
};

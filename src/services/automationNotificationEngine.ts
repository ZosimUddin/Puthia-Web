// Central Automation & Notification Engine for Puthia Smart Portal

export type EventType = 
  | 'USER_SUBMIT_INFO'
  | 'ADMIN_APPROVE_INFO'
  | 'ADMIN_REJECT_INFO'
  | 'VERIFICATION_EXPIRED'
  | 'JOB_MATCH_FOUND'
  | 'EMERGENCY_ALERT_UPDATED';

export interface SystemNotification {
  id: string;
  recipientId: string; // 'admin' or specific userId
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AutomationRule {
  event: EventType;
  condition?: (payload: any) => boolean;
  createNotification: (payload: any) => Omit<SystemNotification, 'id' | 'timestamp' | 'read'>;
}

// Global Notification Store in memory
const notificationStore: SystemNotification[] = [
  {
    id: "NOTIF-101",
    recipientId: "admin",
    title: "নতুন তথ্য অনুমোদন অপেক্ষমাণ",
    message: "বানেশ্বর রাইস মিল ও অটো রাইস হাব নতুন ডিরেক্টরি সাবমিট করেছে।",
    type: "info",
    timestamp: "১০ মিনিট আগে",
    read: false,
    actionUrl: "/admin/approval"
  },
  {
    id: "NOTIF-102",
    recipientId: "user-123",
    title: "আপনার তথ্যটি অনুমোদিত হয়েছে!",
    message: "আপনার নিবন্ধিত ব্যবসা 'পুঠিয়া রাজবাড়ি ভিউ হোটেল' পোর্টালে যুক্ত হয়েছে।",
    type: "success",
    timestamp: "১ ঘণ্টা আগে",
    read: true,
    actionUrl: "/restaurants"
  },
  {
    id: "NOTIF-103",
    recipientId: "owner-456",
    title: "⚠️ তথ্যের ভেরিফিকেশনের মেয়াদ শেষ!",
    message: "আপনার 'বানেশ্বর কোকা-কোলা ডিস্ট্রিবিউশন' এর তথ্যের মেয়াদ ৯০ দিন পেরিয়ে গেছে। অনুগ্রহ করে তথ্য নবায়ন করুন।",
    type: "warning",
    timestamp: "২ ঘণ্টা আগে",
    read: false,
    actionUrl: "/my-profile"
  }
];

// Automation Event Rules
const AUTOMATION_RULES: AutomationRule[] = [
  {
    event: 'USER_SUBMIT_INFO',
    createNotification: (payload) => ({
      recipientId: 'admin',
      title: 'নতুন তথ্য সাবমিশন নোটিফিকেশন',
      message: `ইউজার "${payload.title}" শিরোনামে নতুন তথ্য সাবমিট করেছেন।`,
      type: 'info',
      actionUrl: '/admin/approval'
    })
  },
  {
    event: 'ADMIN_APPROVE_INFO',
    createNotification: (payload) => ({
      recipientId: payload.userId || 'user-default',
      title: 'অভিনন্দন! আপনার সাবমিশন অনুমোদিত হয়েছে',
      message: `আপনার জমা দেয়া "${payload.title}" সফলভাবে পোর্টালে প্রকাশিত হয়েছে।`,
      type: 'success',
      actionUrl: payload.pageUrl || '/'
    })
  },
  {
    event: 'VERIFICATION_EXPIRED',
    createNotification: (payload) => ({
      recipientId: payload.ownerId || 'owner-default',
      title: '⚠️ তথ্যের মেয়াদোত্তীর্ণ সতর্কতা',
      message: `আপনার প্রতিষ্ঠান "${payload.title}"-এর তথ্য যাচাইকরণের মেয়াদ উত্তীর্ণ হয়েছে। পুন:যাচাই করুন।`,
      type: 'warning',
      actionUrl: '/my-profile'
    })
  },
  {
    event: 'JOB_MATCH_FOUND',
    createNotification: (payload) => ({
      recipientId: payload.userId || 'user-default',
      title: '💼 নতুন মানানসই চাকরির সার্কুলার!',
      message: `আপনার পছন্দের ক্যাটাগরি "${payload.category}"-এ নতুন চাকরি পোস্ট করা হয়েছে।`,
      type: 'info',
      actionUrl: '/jobs'
    })
  },
  {
    event: 'EMERGENCY_ALERT_UPDATED',
    createNotification: (payload) => ({
      recipientId: 'global',
      title: '🚨 জরুরী সতর্কতা জারি!',
      message: payload.message || "পুঠিয়া উপজেলায় জরুরী অ্যালার্ট জারি করা হয়েছে। বিস্তারিত দেখতে ক্লিক করুন।",
      type: 'emergency',
      actionUrl: '/emergency'
    })
  }
];

/**
 * Trigger an Automation Event (Event → Rule → Action)
 */
export function triggerAutomationEvent(event: EventType, payload: any): SystemNotification | null {
  const matchingRule = AUTOMATION_RULES.find(r => r.event === event);
  if (!matchingRule) return null;

  if (matchingRule.condition && !matchingRule.condition(payload)) {
    return null;
  }

  const notifData = matchingRule.createNotification(payload);
  const newNotif: SystemNotification = {
    id: `NOTIF-${Date.now().toString().slice(-4)}`,
    ...notifData,
    timestamp: "এখনই",
    read: false
  };

  notificationStore.unshift(newNotif);
  return newNotif;
}

/**
 * Fetch notifications for a user/admin
 */
export function getNotificationsForUser(recipientId: string): SystemNotification[] {
  return notificationStore.filter(n => n.recipientId === recipientId || n.recipientId === 'global');
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id: string): void {
  const notif = notificationStore.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
}

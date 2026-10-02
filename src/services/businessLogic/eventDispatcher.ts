// Event Dispatcher & Real-time Queue (WebSocket/BroadcastChannel Integration)

import { ActivityType } from './types';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { notificationService } from '../notificationService';

export type BusinessEventType = 
  | 'PostCreated'
  | 'PostEdited'
  | 'PostDeleted'
  | 'ReactionCreated'
  | 'ReactionRemoved'
  | 'CommentCreated'
  | 'CommentDeleted'
  | 'FriendRequestSent'
  | 'FriendRequestAccepted'
  | 'FriendshipRemoved'
  | 'MentionDetected'
  | 'PostShared'
  | 'UserFollowed'
  | 'UserUnfollowed'
  | 'UserBlocked'
  | 'ReportSubmitted';

export interface BusinessEvent<T = any> {
  eventType: BusinessEventType;
  timestamp: number;
  payload: T;
}

export type EventHandler<T = any> = (event: BusinessEvent<T>) => void | Promise<void>;

export class EventDispatcher {
  private static handlers: Map<BusinessEventType, EventHandler[]> = new Map();
  private static broadcastChannel: BroadcastChannel | null = null;

  static init() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!this.broadcastChannel) {
        this.broadcastChannel = new BroadcastChannel('adda_realtime_bus');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.eventType) {
            this.dispatchLocal(event.data);
          }
        };
      }
    }
  }

  /**
   * Subscribe to business event
   */
  static subscribe<T = any>(eventType: BusinessEventType, handler: EventHandler<T>): () => void {
    const list = this.handlers.get(eventType) || [];
    list.push(handler);
    this.handlers.set(eventType, list);

    return () => {
      const updated = (this.handlers.get(eventType) || []).filter(h => h !== handler);
      this.handlers.set(eventType, updated);
    };
  }

  /**
   * Dispatch an event through queue, real-time broadcast channel, and handlers.
   */
  static async emit<T = any>(eventType: BusinessEventType, payload: T): Promise<void> {
    const event: BusinessEvent<T> = {
      eventType,
      timestamp: Date.now(),
      payload
    };

    // 1. Dispatch locally to subscribed listeners
    this.dispatchLocal(event);

    // 2. Broadcast across tabs via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch {}
    }

    // 3. Automated side-effects (Notifications, Audit/Activity logging)
    this.handleAutomaticSideEffects(event).catch((err) => {
      console.warn('Background event side-effect error:', err);
    });
  }

  private static dispatchLocal(event: BusinessEvent) {
    const listeners = this.handlers.get(event.eventType) || [];
    for (const handler of listeners) {
      try {
        handler(event);
      } catch (err) {
        console.error(`Error in event handler for ${event.eventType}:`, err);
      }
    }
  }

  /**
   * Handle automatic side-effects asynchronously
   */
  private static async handleAutomaticSideEffects(event: BusinessEvent): Promise<void> {
    const { eventType, payload } = event;

    // Log Activity to Firestore if user action
    if (payload?.userId || payload?.authorId || payload?.requesterId) {
      const userId = payload.userId || payload.authorId || payload.requesterId;
      const userName = payload.userName || payload.authorName || 'নাগরিক';

      let activityType: ActivityType | null = null;
      let summary = '';

      switch (eventType) {
        case 'PostCreated':
          activityType = 'post_created';
          summary = `একটি নতুন আড্ডা পোস্ট করেছেন: "${(payload.title || payload.content || '').slice(0, 40)}..."`;
          break;
        case 'CommentCreated':
          activityType = 'comment_created';
          summary = `একটি পোস্টে মন্তব্য করেছেন: "${(payload.content || '').slice(0, 30)}..."`;
          break;
        case 'ReactionCreated':
          activityType = 'reaction_created';
          summary = `একটি পোস্টে রিঅ্যাকশন দিয়েছেন (${payload.reactionType})`;
          break;
        case 'PostShared':
          activityType = 'post_shared';
          summary = `একটি পোস্ট শেয়ার করেছেন`;
          break;
        case 'FriendRequestSent':
          activityType = 'friend_request_sent';
          summary = `বন্ধুত্বের অনুরোধ পাঠিয়েছেন`;
          break;
        case 'FriendRequestAccepted':
          activityType = 'friend_accepted';
          summary = `বন্ধুত্বের অনুরোধ গ্রহণ করেছেন`;
          break;
        case 'UserFollowed':
          activityType = 'user_followed';
          summary = `অনুসরণ করা শুরু করেছেন`;
          break;
        case 'ReportSubmitted':
          activityType = 'report_submitted';
          summary = `একটি কনটেন্ট রিপোর্ট করেছেন`;
          break;
      }

      if (activityType) {
        try {
          await addDoc(collection(db, 'user_activities'), {
            userId,
            userName,
            activityType,
            targetId: payload.targetId || payload.postId || payload.targetUserId || null,
            targetType: payload.targetType || 'post',
            summary,
            createdAt: serverTimestamp()
          });
        } catch {}
      }
    }
  }
}

// Auto-initialize event dispatcher
EventDispatcher.init();

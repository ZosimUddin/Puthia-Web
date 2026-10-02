// Authorization & Policy Engine (Spatie / Laravel Policy Pattern)

import { PostVisibility } from './types';

export interface UserContext {
  uid: string;
  role?: string;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  isBanned?: boolean;
  blockedUserIds?: string[];
  friendIds?: string[];
}

export class PostPolicy {
  static canView(
    user: UserContext | null,
    post: {
      authorId: string;
      visibility?: PostVisibility | string;
      customAllowedUserIds?: string[];
      isDeleted?: boolean;
      isHidden?: boolean;
      groupId?: string;
    }
  ): { allowed: boolean; reason?: string } {
    if (post.isDeleted || post.isHidden) {
      if (user?.isSuperAdmin || user?.isAdmin || user?.isModerator) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'পোস্টটি সরিয়ে নেওয়া হয়েছে বা ডিলিট করা হয়েছে' };
    }

    // Check if author blocked user or user blocked author
    if (user && user.blockedUserIds && user.blockedUserIds.includes(post.authorId)) {
      return { allowed: false, reason: 'ব্লকড কনটেন্ট' };
    }

    const visibility = post.visibility || 'public';

    if (visibility === 'public') {
      return { allowed: true };
    }

    // Unauthenticated user cannot view non-public posts
    if (!user) {
      return { allowed: false, reason: 'এই পোস্টটি দেখার জন্য অনুগ্রহ করে লগইন করুন' };
    }

    // Author can always see their own post
    if (user.uid === post.authorId) {
      return { allowed: true };
    }

    // Admins can inspect posts
    if (user.isSuperAdmin || user.isAdmin) {
      return { allowed: true };
    }

    if (visibility === 'only_me') {
      return { allowed: false, reason: 'পোস্টটির প্রাইভেসী Only Me' };
    }

    if (visibility === 'friends') {
      const isFriend = user.friendIds?.includes(post.authorId);
      if (isFriend) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'শুধুমাত্র বন্ধুদের জন্য উন্মুক্ত' };
    }

    if (visibility === 'custom') {
      if (post.customAllowedUserIds && post.customAllowedUserIds.includes(user.uid)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'কাস্টম অনুমতি তালিকায় আপনি অন্তর্ভুক্ত নন' };
    }

    return { allowed: true };
  }

  static canCreate(user: UserContext | null): { allowed: boolean; reason?: string } {
    if (!user || !user.uid) {
      return { allowed: false, reason: 'পোস্ট তৈরি করার জন্য লগইন আবশ্যক' };
    }
    if (user.isBanned) {
      return { allowed: false, reason: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত রয়েছে' };
    }
    return { allowed: true };
  }

  static canEdit(user: UserContext | null, post: { authorId: string }): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'লগইন আবশ্যক' };
    if (user.uid === post.authorId) return { allowed: true };
    if (user.isSuperAdmin) return { allowed: true };
    return { allowed: false, reason: 'শুধুমাত্র পোস্টের লেখক এই পোস্টটি সম্পাদনা করতে পারবেন' };
  }

  static canDelete(user: UserContext | null, post: { authorId: string }): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'লগইন আবশ্যক' };
    if (user.uid === post.authorId) return { allowed: true };
    if (user.isSuperAdmin || user.isAdmin || user.isModerator) return { allowed: true };
    return { allowed: false, reason: 'পোস্টটি মুছে ফেলার অনুমতি নেই' };
  }

  static canComment(user: UserContext | null, post: { authorId: string; commentsLocked?: boolean }): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'কমেন্ট করতে লগইন করুন' };
    if (user.isBanned) return { allowed: false, reason: 'অ্যাকাউন্ট রেস্ট্রিক্টেড' };
    if (post.commentsLocked && !user.isAdmin && !user.isSuperAdmin) {
      return { allowed: false, reason: 'এই পোস্টের কমেন্ট সেকশন বন্ধ করা হয়েছে' };
    }
    if (user.blockedUserIds?.includes(post.authorId)) {
      return { allowed: false, reason: 'ব্লক থাকায় কমেন্ট করা সম্ভব নয়' };
    }
    return { allowed: true };
  }
}

export class CommentPolicy {
  static canEdit(user: UserContext | null, comment: { authorId: string }): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'লগইন আবশ্যক' };
    if (user.uid === comment.authorId) return { allowed: true };
    if (user.isSuperAdmin) return { allowed: true };
    return { allowed: false, reason: 'শুধুমাত্র কমেন্টের লেখক সম্পাদনা করতে পারবেন' };
  }

  static canDelete(user: UserContext | null, comment: { authorId: string }, postAuthorId?: string): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'লগইন আবশ্যক' };
    // Comment author can delete
    if (user.uid === comment.authorId) return { allowed: true };
    // Post author can moderate comments on their post
    if (postAuthorId && user.uid === postAuthorId) return { allowed: true };
    // Admins / Moderators can delete
    if (user.isSuperAdmin || user.isAdmin || user.isModerator) return { allowed: true };
    return { allowed: false, reason: 'কমেন্ট মুছে ফেলার অধিকার আপনার নেই' };
  }
}

export class ProfilePolicy {
  static canEditProfile(user: UserContext | null, targetUserId: string): { allowed: boolean; reason?: string } {
    if (!user) return { allowed: false, reason: 'লগইন আবশ্যক' };
    if (user.uid === targetUserId || user.isSuperAdmin) return { allowed: true };
    return { allowed: false, reason: 'শুধুমাত্র নিজের প্রোফাইল এডিট করা সম্ভব' };
  }
}

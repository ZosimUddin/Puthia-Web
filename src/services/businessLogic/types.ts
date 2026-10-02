// Core Business Logic Types & Contracts for আড্ডা (Adda)

export type PostVisibility = 'public' | 'friends' | 'only_me' | 'custom' | 'group' | 'page';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';

export type ActivityType = 
  | 'post_created'
  | 'post_edited'
  | 'post_deleted'
  | 'comment_created'
  | 'reaction_created'
  | 'post_shared'
  | 'friend_request_sent'
  | 'friend_accepted'
  | 'user_followed'
  | 'group_joined'
  | 'post_saved'
  | 'report_submitted';

export type ReportReason = 
  | 'spam'
  | 'hate_speech'
  | 'harassment'
  | 'misinformation'
  | 'nudity'
  | 'violence'
  | 'scam'
  | 'copyright'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed' | 'action_taken';

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorCode?: string;
  validationErrors?: Record<string, string[]>;
}

// 1. Post Requests
export interface CreatePostRequest {
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorBadge?: boolean;
  title?: string;
  content: string;
  category: string;
  union?: string;
  visibility?: PostVisibility;
  customAllowedUserIds?: string[];
  groupId?: string;
  pageId?: string;
  imageUrl?: string;
  videoUrl?: string;
  gallery?: string[];
  location?: string;
  feeling?: string;
  poll?: {
    question: string;
    options: { id: string | number; label: string; votes: number }[];
    durationDays?: number;
  } | null;
  scheduledFor?: string | null;
  isUrgent?: boolean;
  emergencyCategory?: string;
  emergencyLocation?: string;
  emergencyContact?: string;
  idempotencyKey?: string;
}

export interface UpdatePostRequest {
  postId: string;
  authorId: string;
  title?: string;
  content?: string;
  category?: string;
  union?: string;
  visibility?: PostVisibility;
  imageUrl?: string;
  gallery?: string[];
  location?: string;
  feeling?: string;
}

// 2. Comment Requests
export interface CreateCommentRequest {
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorBadge?: boolean;
  content: string;
  parentId?: string | null; // For hierarchical nested replies
  imageUrl?: string | null;
  idempotencyKey?: string;
}

export interface UpdateCommentRequest {
  commentId: string;
  authorId: string;
  content: string;
}

// 3. Reaction Request
export interface ToggleReactionRequest {
  postId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  reactionType: ReactionType;
}

// 4. Share Request
export interface SharePostRequest {
  originalPostId: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  caption?: string;
  visibility?: PostVisibility;
  union?: string;
}

// 5. Friend Requests
export interface FriendActionRequest {
  currentUserId: string;
  currentUserName: string;
  currentUserPhotoUrl?: string;
  targetUserId: string;
  targetUserName?: string;
  targetUserPhotoUrl?: string;
}

// 6. User Profile Request
export interface UserProfileUpdateRequest {
  userId: string;
  name: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  gender?: string;
  location?: string;
  website?: string;
  phone?: string;
  privacy?: {
    whoCanSeePosts: PostVisibility;
    whoCanSendFriendRequests: 'everyone' | 'friends_of_friends';
    showPhoneNumber: boolean;
    showEmail: boolean;
  };
}

// 7. Report Request
export interface SubmitReportRequest {
  reporterId: string;
  reporterName: string;
  targetType: 'post' | 'comment' | 'user' | 'group' | 'reel' | 'story' | 'marketplace';
  targetId: string;
  reason: ReportReason;
  description?: string;
  evidenceUrl?: string;
}

// 8. User Activity Log Model
export interface UserActivityLog {
  id: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  targetId?: string;
  targetType?: string;
  summary: string;
  metadata?: Record<string, any>;
  createdAt: any;
}

// 9. Normalized Reaction Record
export interface ReactionRecord {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  reactionType: ReactionType;
  createdAt: any;
}

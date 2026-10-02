export type LiveStreamStatus = 'scheduled' | 'live' | 'ended';

export type LiveAudience = 'public' | 'friends' | 'group' | 'followers' | 'custom';

export type LiveCategory = 
  | 'News' 
  | 'Education' 
  | 'Sports' 
  | 'Entertainment' 
  | 'Tourism' 
  | 'Community' 
  | 'Business' 
  | 'Health' 
  | 'Talk' 
  | 'Other';

export interface LiveCategoryInfo {
  id: LiveCategory;
  nameBangla: string;
  icon: string;
  color: string;
}

export const LIVE_CATEGORIES: LiveCategoryInfo[] = [
  { id: 'News', nameBangla: '📰 সংবাদ ও খবর', icon: '📰', color: 'bg-red-500' },
  { id: 'Education', nameBangla: '🎓 শিক্ষা ও ক্যারিয়ার', icon: '🎓', color: 'bg-blue-500' },
  { id: 'Sports', nameBangla: '🏏 খেলাধুলা', icon: '🏏', color: 'bg-emerald-500' },
  { id: 'Entertainment', nameBangla: '🎵 বিনোদন ও সংস্কৃতি', icon: '🎵', color: 'bg-purple-500' },
  { id: 'Tourism', nameBangla: '🏞️ পুঠিয়া ভ্রমণ ও ঐতিহ্য', icon: '🏞️', color: 'bg-amber-500' },
  { id: 'Community', nameBangla: '🏘️ পুঠিয়া কমিউনিটি', icon: '🏘️', color: 'bg-teal-500' },
  { id: 'Business', nameBangla: '💼 ব্যবসা ও বাণিজ্য', icon: '💼', color: 'bg-indigo-500' },
  { id: 'Health', nameBangla: '🩺 স্বাস্থ্য ও চিকিৎসা', icon: '🩺', color: 'bg-rose-500' },
  { id: 'Talk', nameBangla: '🎤 টকশো ও আড্ডা', icon: '🎤', color: 'bg-cyan-500' },
  { id: 'Other', nameBangla: '📌 অন্যান্য', icon: '📌', color: 'bg-slate-500' },
];

export type LiveReactionType = 'like' | 'heart' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface LiveReactionMeta {
  type: LiveReactionType;
  emoji: string;
  label: string;
  color: string;
}

export const LIVE_REACTIONS: LiveReactionMeta[] = [
  { type: 'heart', emoji: '❤️', label: 'ভালোবাসি', color: 'text-red-500' },
  { type: 'like', emoji: '👍', label: 'লাইক', color: 'text-blue-500' },
  { type: 'laugh', emoji: '😂', label: 'হা হা', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'ওয়াও', color: 'text-amber-500' },
  { type: 'sad', emoji: '😢', label: 'স্যাড', color: 'text-blue-400' },
  { type: 'angry', emoji: '😡', label: 'এংরি', color: 'text-orange-600' },
];

export interface LiveStream {
  id: string;
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
  status: LiveStreamStatus;
  viewerCount: number;
  peakViewerCount: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  startedAt?: number;
  endedAt?: number;
  scheduledFor?: number;
  replaySaved?: boolean;
  slowModeSeconds?: number;
  commentsDisabled?: boolean;
  blockedUserIds?: string[];
  moderatorUids?: string[];
  interestedUserIds?: string[];
  quality?: 'Auto' | 'Low' | 'Medium' | 'High';
  streamToken?: string;
  guestUid?: string;
  guestName?: string;
  createdAt: number;
}

export interface LiveComment {
  id: string;
  streamId: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: 'host' | 'moderator' | 'viewer';
  text: string;
  createdAt: number;
  reactions?: Record<string, number>;
  mentions?: string[];
  replyToId?: string;
  hidden?: boolean;
  reported?: boolean;
}

export interface LiveReaction {
  id: string;
  streamId: string;
  userUid: string;
  type: LiveReactionType;
  createdAt: number;
  xPosition?: number; // percentage 0-100 for floating animation
}

export interface LiveViewer {
  id: string;
  streamId: string;
  userUid: string;
  userName: string;
  userAvatar?: string;
  joinedAt: number;
  lastSeenAt: number;
}

export interface LiveReport {
  id: string;
  streamId: string;
  reporterUid: string;
  reason: string;
  details?: string;
  createdAt: number;
}

export interface LiveAnalytics {
  totalViewers: number;
  peakConcurrentViewers: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  averageWatchTimeMinutes: number;
  durationMinutes: number;
}

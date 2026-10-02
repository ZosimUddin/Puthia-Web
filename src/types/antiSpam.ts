// ==========================================
// ADDA — SPAM & FAKE ACCOUNT PROTECTION TYPES
// System Architecture & Risk Engine Models
// ==========================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskScoreBreakdown {
  registrationRisk: number; // 0 - 25 (device clustering, rapid signup, suspicious IP)
  velocityRisk: number;     // 0 - 25 (burst actions, rapid API requests, bot signals)
  contentRisk: number;      // 0 - 25 (duplicate posts, spam comments, link spam)
  engagementRisk: number;   // 0 - 25 (mass follow, mass friend requests, mass DM)
  reportRiskPenalty: number;// 0 - 25 (valid reports from community)
  totalScore: number;       // 0 - 100
  riskLevel: RiskLevel;
}

export type RiskEventType =
  | 'abnormal_registration'
  | 'device_clustering'
  | 'ip_burst_signup'
  | 'rapid_profile_change'
  | 'mass_friend_request'
  | 'mass_follow'
  | 'mass_messaging'
  | 'spam_post_duplicate'
  | 'spam_comment_flood'
  | 'link_spam_detected'
  | 'marketplace_spam'
  | 'fake_engagement_burst'
  | 'bot_velocity_trigger'
  | 'suspicious_login_new_device'
  | 'rapid_session_switch'
  | 'account_security_lock'
  | 'rate_limit_exceeded';

export interface RiskEvent {
  id: string;
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  eventType: RiskEventType;
  ruleId: string;
  riskScoreAdded: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    message?: string;
    actionType?: string;
    velocityCount?: number;
    timeWindowSec?: number;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    contentSnippet?: string;
    targetId?: string;
    metadata?: Record<string, any>;
  };
  createdAt: string; // ISO
}

export interface UserRiskProfile {
  id: string; // userId
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  
  // Score metrics
  riskLevel: RiskLevel;
  totalScore: number; // 0 - 100
  scoreBreakdown: RiskScoreBreakdown;
  
  // Trust Signals
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isNidVerified: boolean;
  accountAgeDays: number;
  trustBadge?: 'none' | 'verified_phone' | 'verified_citizen' | 'trusted_contributor';
  
  // Detection tracking counters
  knownDevices: {
    deviceId: string;
    deviceName: string;
    os?: string;
    browser?: string;
    firstSeen: string;
    lastSeen: string;
    ipAddress?: string;
    isTrusted: boolean;
  }[];
  knownIps: string[];
  
  // Action Velocity Counters (Rolling counters)
  recentPostCount: number;
  recentCommentCount: number;
  recentFriendRequestCount: number;
  recentFollowCount: number;
  recentMessageCount: number;
  recentReportCountAgainst: number;
  
  // Active restrictions
  status: 'active' | 'rate_limited' | 'challenge_required' | 'restricted' | 'locked' | 'suspended' | 'banned';
  activeRestrictions?: {
    posts?: boolean;
    comments?: boolean;
    friendRequests?: boolean;
    follows?: boolean;
    messages?: boolean;
    marketplace?: boolean;
    loginLocked?: boolean;
    expiresAt?: string;
    reason?: string;
    ruleId?: string;
  };
  
  // False positive tracking
  falsePositiveReviewPending?: boolean;
  lastFalsePositiveNote?: string;
  
  lastActivityAt: string;
  updatedAt: string;
}

export interface AntiSpamRule {
  id: string;
  ruleCode: string; // e.g. "FR-005", "SP-001", "BOT-003", "LG-002"
  name: string;
  category: 'friend_request' | 'post' | 'comment' | 'message' | 'follow' | 'engagement' | 'login' | 'bot' | 'marketplace' | 'registration';
  description: string;
  threshold: number; // e.g. 8 requests
  timeWindowSeconds: number; // e.g. 120 seconds
  actionType: 'warning' | 'rate_limit' | 'challenge' | 'temporary_restriction' | 'manual_review_queue';
  penaltyScore: number;
  isEnabled: boolean;
  isConfigurable: boolean;
}

export interface SecurityChallenge {
  id: string;
  userId: string;
  type: 'captcha_math' | 'visual_puzzle' | 'phone_otp' | 'email_code' | 're_auth';
  question?: string;
  expectedAnswerHash?: string;
  status: 'pending' | 'passed' | 'failed' | 'expired';
  expiresAt: string;
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
}

export interface SuspiciousLoginAlert {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  location?: string;
  ipAddress: string;
  timestamp: string;
  status: 'unacknowledged' | 'confirmed_owner' | 'secured_by_owner' | 'dismissed';
}

export interface AntiSpamAuditLog {
  id: string;
  ruleCode: string;
  eventType: RiskEventType | 'admin_override' | 'false_positive_cleared' | 'restriction_released' | 'rule_updated';
  actorType: 'system_engine' | 'admin' | 'moderator' | 'user';
  actorId: string;
  actorName: string;
  targetUserId: string;
  targetUserName?: string;
  riskScore: number;
  actionTaken: string;
  reason: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface SecurityReviewRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  restrictionType: string;
  ruleTriggered: string;
  userExplanation: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewerName?: string;
  reviewDecisionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

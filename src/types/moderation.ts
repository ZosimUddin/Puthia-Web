import { AdminRole } from './admin';

export type ReportCategory = 
  | 'safety'
  | 'spam'
  | 'fake_impersonation'
  | 'scam'
  | 'inappropriate'
  | 'other';

export type ReportableContentType = 
  | 'post'
  | 'comment'
  | 'reply'
  | 'profile'
  | 'page'
  | 'group'
  | 'story'
  | 'reel'
  | 'video'
  | 'live'
  | 'marketplace'
  | 'event'
  | 'message';

export type ReportPriority = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'action_taken'
  | 'no_violation'
  | 'resolved';

export type ModerationActionType = 
  | 'review'
  | 'hide'
  | 'remove'
  | 'restore'
  | 'warn'
  | 'restrict'
  | 'suspend'
  | 'ban'
  | 'no_violation'
  | 'appeal_granted'
  | 'appeal_rejected';

export type UserRestrictionFeature = 
  | 'comments'
  | 'posts'
  | 'messages'
  | 'live'
  | 'marketplace';

export interface ReportReasonDefinition {
  id: string;
  category: ReportCategory;
  label: string;
  bnLabel: string;
  description: string;
  severity: ReportPriority;
  icon: string;
  applicableTypes?: ReportableContentType[];
  detailsRequired?: boolean;
}

export interface ContentHierarchyContext {
  postId?: string;
  postSnippet?: string;
  postAuthorName?: string;
  commentId?: string;
  commentSnippet?: string;
  commentAuthorName?: string;
  replyId?: string;
  replySnippet?: string;
  rootType?: ReportableContentType;
  rootTitle?: string;
}

export interface ReporterSubmission {
  uid: string;
  name: string;
  avatar?: string;
  reportedAt: string;
  reasonId: string;
  reasonCategory: ReportCategory;
  reasonLabel: string;
  details?: string;
  proofUrl?: string;
  reporterTrustScore?: number;
}

export interface ModerationCase {
  id: string; // Ticket ID like RPT-2026-000123
  contentId: string;
  contentType: ReportableContentType;
  contentTitle?: string;
  contentSnippet?: string;
  contentUrl?: string;
  mediaUrls?: string[];
  
  // Author
  contentAuthorUid: string;
  contentAuthorName: string;
  contentAuthorAvatar?: string;
  
  // Hierarchical Context (e.g. Post -> Comment -> Reply)
  context?: ContentHierarchyContext;
  
  // Aggregation for Duplicate Reports
  reportsCount: number;
  reportIds: string[];
  reporters: ReporterSubmission[];
  
  // Categorization & Priority
  primaryCategory: ReportCategory;
  primaryReasonId: string;
  primaryReasonLabel: string;
  priority: ReportPriority;
  riskScore: number;
  status: ReportStatus;
  
  // Assignment
  assignedModeratorUid?: string;
  assignedModeratorName?: string;
  assignedModeratorRole?: AdminRole;
  assignedAt?: string;
  
  // Resolution & Enforcement
  contentHidden?: boolean;
  contentRemoved?: boolean;
  lastActionTaken?: ModerationActionType;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedByUid?: string;
  resolvedByName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface UserReport {
  id: string;
  ticketId: string; // RPT-2026-000123
  caseId: string;
  
  contentId: string;
  contentType: ReportableContentType;
  contentTitle?: string;
  contentSnippet?: string;
  contentUrl?: string;
  contentOwnerUid?: string;
  contentOwnerName?: string;
  
  reasonId: string;
  reasonCategory: ReportCategory;
  reasonLabel: string;
  details?: string;
  proofUrl?: string;
  
  reporterUid: string;
  reporterName: string;
  reporterPhone?: string;
  reporterEmail?: string;
  reporterTrustScore: number;
  
  priority: ReportPriority;
  status: ReportStatus;
  
  resolutionNote?: string;
  actionTaken?: ModerationActionType;
  
  createdAt: string;
  updatedAt: string;
}

export interface ModerationActionRecord {
  id: string;
  caseId: string;
  ticketId: string;
  contentId: string;
  contentType: ReportableContentType;
  targetUserUid?: string;
  targetUserName?: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  action: ModerationActionType;
  reason: string;
  details?: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
  is2FAVerified?: boolean;
}

export interface ModeratorNote {
  id: string;
  caseId: string;
  contentId?: string;
  authorUid: string;
  authorName: string;
  authorRole: AdminRole;
  note: string;
  createdAt: string;
}

export interface UserWarning {
  id: string;
  targetUid: string;
  targetName: string;
  caseId?: string;
  ticketId?: string;
  reason: string;
  violationCategory: string;
  message: string;
  issuedByUid: string;
  issuedByName: string;
  warningNumber: number;
  acknowledged?: boolean;
  createdAt: string;
}

export interface UserRestriction {
  id: string;
  targetUid: string;
  targetName: string;
  caseId?: string;
  features: UserRestrictionFeature[];
  reason: string;
  issuedByUid: string;
  issuedByName: string;
  startsAt: string;
  expiresAt?: string | null;
  isPermanent: boolean;
  status: 'active' | 'lifted' | 'expired';
  createdAt: string;
  liftedAt?: string;
  liftedByUid?: string;
  liftedByName?: string;
}

export interface UserSuspension {
  id: string;
  targetUid: string;
  targetName: string;
  caseId?: string;
  durationType: '1h' | '24h' | '7d' | '30d' | 'custom';
  durationHours?: number;
  reason: string;
  issuedByUid: string;
  issuedByName: string;
  startsAt: string;
  endsAt: string;
  status: 'active' | 'lifted' | 'expired';
  createdAt: string;
  liftedAt?: string;
  liftedByUid?: string;
}

export interface UserBan {
  id: string;
  targetUid: string;
  targetName: string;
  caseId?: string;
  reason: string;
  bannedByUid: string;
  bannedByName: string;
  bannedByRole: AdminRole;
  status: 'active' | 'lifted';
  twoFactorVerified: boolean;
  createdAt: string;
  liftedAt?: string;
  liftedByUid?: string;
  liftedByName?: string;
}

export interface Appeal {
  id: string;
  caseId: string;
  ticketId: string;
  targetType: 'content' | 'warning' | 'restriction' | 'suspension' | 'ban';
  targetId: string;
  userUid: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  appealStatement: string;
  evidenceUrl?: string;
  originalAction: ModerationActionType | string;
  originalReason: string;
  status: 'pending' | 'under_review' | 'granted' | 'rejected';
  reviewerUid?: string;
  reviewerName?: string;
  reviewerRole?: AdminRole;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AppealReview {
  id: string;
  appealId: string;
  caseId: string;
  reviewerUid: string;
  reviewerName: string;
  decision: 'granted' | 'rejected';
  justification: string;
  actionsTaken: string[];
  timestamp: string;
}

export interface ReportNotification {
  id: string;
  recipientUid: string;
  type: 'report_update' | 'warning' | 'restriction' | 'suspension' | 'ban' | 'appeal_update';
  title: string;
  body: string;
  ticketId?: string;
  caseId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserEnforcementHistory {
  uid: string;
  totalReportsAgainst: number;
  warnings: UserWarning[];
  restrictions: UserRestriction[];
  suspensions: UserSuspension[];
  ban?: UserBan | null;
  trustScore: number;
}

export interface ModerationAnalytics {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  resolvedReports: number;
  avgResolutionMinutes: number;
  categoryBreakdown: Record<ReportCategory, number>;
  contentTypeBreakdown: Record<ReportableContentType, number>;
  priorityBreakdown: Record<ReportPriority, number>;
  actionBreakdown: Record<string, number>;
  totalAppeals: number;
  pendingAppeals: number;
  appealGrantRate: number;
}

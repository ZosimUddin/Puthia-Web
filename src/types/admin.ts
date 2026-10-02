export type AdminRole = 
  | 'super_admin'     // 👑 Super Admin
  | 'admin'           // 🛡️ Admin
  | 'moderator'       // 👮 Moderator
  | 'editor'          // ✍️ Editor (Legacy/General)
  | 'staff'           // 👔 Staff (Legacy/General)
  | 'analyst'         // 📊 Analyst
  | 'support'         // 🎧 Support
  | 'page_admin'      // 📄 Page Admin
  | 'page_editor'     // ✍️ Page Editor
  | 'page_moderator'  // 🛡️ Page Moderator
  | 'group_admin'     // 👥 Group Admin
  | 'group_moderator' // 👮 Group Moderator
  | 'user';           // 👤 Normal User

export type ActionPermission = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'manage'
  | 'approve'
  | 'reject'
  | 'moderate'
  | 'report'
  | 'restrict'
  | 'suspend'
  | 'ban';

export type PermissionDomain = 
  | 'users'
  | 'posts'
  | 'comments'
  | 'groups'
  | 'pages'
  | 'reports'
  | 'marketplace'
  | 'settings'
  | 'audit_logs'
  | 'security';

export type ScopeType = 'global' | 'page' | 'group';

export type UserStatus = 'active' | 'restricted' | 'suspended' | 'banned' | 'deleted' | 'pending_verification';

export type ReportPriority = 'critical' | 'high' | 'medium' | 'low';

export type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'dismissed';

export type ContentType = 'post' | 'comment' | 'reply' | 'story' | 'reel' | 'video' | 'photo' | 'live' | 'group' | 'page' | 'marketplace';

export interface ScopedRoleAssignment {
  id: string;
  uid: string;
  userEmail?: string;
  userName?: string;
  role: AdminRole;
  scopeType: ScopeType;
  scopeId?: string; // Page ID or Group ID if scoped
  scopeName?: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  expiresAt?: string | null; // ISO string for role expiration
  status?: 'active' | 'expired' | 'revoked';
}

export interface UserDirectPermission {
  domain: PermissionDomain;
  action: ActionPermission;
  granted: boolean;
  scopeType?: ScopeType;
  scopeId?: string;
}

export interface RoleDefinition {
  id: AdminRole;
  name: string;
  bnName: string;
  icon: string;
  description: string;
  levelPriority: number; // 100 for super_admin down to 10 for user
  defaultPermissions: Record<PermissionDomain, ActionPermission[]>;
  isSystem?: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: UserStatus;
  avatarUrl?: string;
  is2FAEnabled?: boolean;
  twoFactorPin?: string;
  assignedBy?: string;
  assignedAt?: string;
  lastActive?: string;
  scopedRoles?: ScopedRoleAssignment[];
  directPermissions?: UserDirectPermission[];
}

export interface SystemUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: AdminRole;
  status: UserStatus;
  createdAt: string;
  phone?: string;
  location?: string;
  restrictionReason?: string;
  suspendedUntil?: string;
  reportsCount?: number;
  activityCount?: number;
  scopedRoles?: ScopedRoleAssignment[];
}

export interface ModerationReport {
  id: string;
  reporterUid: string;
  reporterName: string;
  reportedUserUid: string;
  reportedUserName: string;
  contentType: ContentType;
  contentId: string;
  contentSnippet?: string;
  contentUrl?: string;
  reason: string;
  evidenceUrl?: string;
  priority: ReportPriority;
  status: ReportStatus;
  createdAt: string;
  assignedModeratorUid?: string;
  assignedModeratorName?: string;
  resolutionNote?: string;
}

export interface AdminAuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  moderatorUid?: string;
  moderatorName?: string;
  moderatorRole?: AdminRole;
  targetUid?: string;
  targetName?: string;
  targetType: ContentType | 'user' | 'system' | 'role' | 'permission' | 'page' | 'group';
  targetId: string;
  action: string;
  domain?: PermissionDomain;
  permissionAction?: ActionPermission;
  scopeType?: ScopeType;
  scopeId?: string;
  scopeName?: string;
  grantedRole?: AdminRole;
  previousState?: any;
  newState?: any;
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface SecurityEvent {
  id: string;
  type: '2fa_verify' | 'sensitive_action' | 'suspicious_activity' | 'role_change' | 'failed_access' | 'permission_denied';
  actorUid: string;
  actorEmail: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ipAddress?: string;
}

export interface AdminActivityStats {
  reportsReviewed: number;
  usersRestricted: number;
  postsRemoved: number;
  commentsRemoved: number;
  pagesReviewed: number;
}

export interface DashboardRealtimeStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  comments: number;
  groups: number;
  pages: number;
  liveCount: number;
  reelsCount: number;
  eventsCount: number;
  marketplaceListings: number;
  pendingReports: number;
  suspiciousActivityCount: number;
}

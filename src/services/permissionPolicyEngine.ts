import { 
  AdminRole, 
  ActionPermission, 
  PermissionDomain, 
  ScopeType, 
  ScopedRoleAssignment, 
  RoleDefinition,
  AdminAuditLog,
  UserStatus
} from '../types/admin';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

// System Role Definitions (Matching Spatie/Filament RBAC pattern)
export const SYSTEM_ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    bnName: '👑 সুপার অ্যাডমিন',
    icon: 'Crown',
    description: 'পুরো সিস্টেমের পূর্ণ নিয়ন্ত্রণ ও সমস্ত অ্যাকশনের একচ্ছত্র ক্ষমতা',
    levelPriority: 100,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      posts: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      comments: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      groups: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      pages: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      reports: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      marketplace: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      settings: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      audit_logs: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      security: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban']
    }
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    bnName: '🛡️ অ্যাডমিন',
    icon: 'Shield',
    description: 'সিস্টেম পরিচালনা, ইউজার মোডারেশন ও পারমিশন কন্ট্রোল (সুপার অ্যাডমিন ব্যতীত)',
    levelPriority: 80,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'create', 'edit', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict', 'suspend', 'ban'],
      posts: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict'],
      comments: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report', 'restrict'],
      groups: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report'],
      pages: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'report'],
      reports: ['view', 'edit', 'manage', 'approve', 'reject', 'moderate', 'restrict', 'suspend', 'ban'],
      marketplace: ['view', 'edit', 'delete', 'approve', 'reject', 'moderate'],
      settings: ['view', 'edit', 'manage'],
      audit_logs: ['view'],
      security: ['view', 'report']
    }
  },
  moderator: {
    id: 'moderator',
    name: 'Moderator',
    bnName: '👮 মোডারেটর',
    icon: 'ShieldAlert',
    description: 'পোস্ট, কমেন্ট ও রিপোর্টেড কনটেন্ট মডারেশন এবং নিয়ম অমান্যকারীদের নিয়ন্ত্রণ',
    levelPriority: 60,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'moderate', 'report', 'restrict', 'suspend'],
      posts: ['view', 'edit', 'delete', 'approve', 'reject', 'moderate', 'report'],
      comments: ['view', 'edit', 'delete', 'approve', 'reject', 'moderate', 'report'],
      groups: ['view', 'moderate', 'report'],
      pages: ['view', 'moderate', 'report'],
      reports: ['view', 'edit', 'approve', 'reject', 'moderate'],
      marketplace: ['view', 'approve', 'reject', 'moderate'],
      settings: ['view'],
      audit_logs: ['view'],
      security: ['view']
    }
  },
  support: {
    id: 'support',
    name: 'Support Staff',
    bnName: '🎧 সাপোর্ট টিম',
    icon: 'Headphones',
    description: 'ব্যবহারকারীদের সহায়তা প্রদান, সমস্যা সমাধান ও রিপোর্ট পর্যালোচনা',
    levelPriority: 50,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'report'],
      posts: ['view', 'report'],
      comments: ['view', 'report'],
      groups: ['view'],
      pages: ['view'],
      reports: ['view', 'edit'],
      marketplace: ['view'],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  analyst: {
    id: 'analyst',
    name: 'Analyst',
    bnName: '📊 অ্যানালিস্ট',
    icon: 'BarChart2',
    description: 'প্ল্যাটফর্ম অ্যানালিটিক্স ও রিপোর্ট বিশ্লেষণ ক্ষমতা',
    levelPriority: 45,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view'],
      comments: ['view'],
      groups: ['view'],
      pages: ['view'],
      reports: ['view'],
      marketplace: ['view'],
      settings: ['view'],
      audit_logs: ['view'],
      security: ['view']
    }
  },
  editor: {
    id: 'editor',
    name: 'General Editor',
    bnName: '✍️ জেনারেল এডিটর',
    icon: 'Edit3',
    description: 'প্ল্যাটফর্ম পোস্ট ও কনটেন্ট প্রকাশনা ও সম্পাদনা',
    levelPriority: 35,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view', 'create', 'edit'],
      comments: ['view', 'create', 'edit'],
      groups: ['view'],
      pages: ['view'],
      reports: ['report'],
      marketplace: ['view', 'create', 'edit'],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  staff: {
    id: 'staff',
    name: 'General Staff',
    bnName: '👔 জেনারেল স্টাফ',
    icon: 'Briefcase',
    description: 'প্ল্যাটফর্ম সেবা ও সহায়তা কার্যক্রম পরিচালনা',
    levelPriority: 30,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view', 'create'],
      comments: ['view', 'create'],
      groups: ['view'],
      pages: ['view'],
      reports: ['view'],
      marketplace: ['view'],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  page_admin: {
    id: 'page_admin',
    name: 'Page Admin',
    bnName: '📄 পেজ অ্যাডমিন',
    icon: 'FileText',
    description: 'নির্দিষ্ট পেজের সকল কনটেন্ট, রোল ও সেটিংস পূর্ণ নিয়ন্ত্রণ',
    levelPriority: 40,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate'],
      comments: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate'],
      groups: [],
      pages: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate'],
      reports: ['view', 'report'],
      marketplace: [],
      settings: ['view', 'edit'],
      audit_logs: [],
      security: []
    }
  },
  page_editor: {
    id: 'page_editor',
    name: 'Page Editor',
    bnName: '✍️ পেজ এডিটর',
    icon: 'Edit3',
    description: 'নির্দিষ্ট পেজে পোস্ট তৈরি, সম্পাদনা ও প্রকাশনা ক্ষমতা',
    levelPriority: 30,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view', 'create', 'edit'],
      comments: ['view', 'create', 'edit', 'delete'],
      groups: [],
      pages: ['view', 'edit'],
      reports: ['report'],
      marketplace: [],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  page_moderator: {
    id: 'page_moderator',
    name: 'Page Moderator',
    bnName: '🛡️ পেজ মোডারেটর',
    icon: 'ShieldCheck',
    description: 'নির্দিষ্ট পেজের কমেন্ট, মেসেজ ও ইউজার ফিডব্যাক মডারেশন',
    levelPriority: 25,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view'],
      comments: ['view', 'delete', 'approve', 'reject', 'moderate'],
      groups: [],
      pages: ['view'],
      reports: ['report'],
      marketplace: [],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  group_admin: {
    id: 'group_admin',
    name: 'Group Admin',
    bnName: '👥 গ্রুপ অ্যাডমিন',
    icon: 'Users',
    description: 'নির্দিষ্ট গ্রুপের সদস্য অনুমোদন, পোস্ট মডারেশন ও রুলস সেটআপ',
    levelPriority: 40,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'approve', 'reject', 'restrict'],
      posts: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate'],
      comments: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate'],
      groups: ['view', 'edit', 'manage', 'approve', 'reject', 'moderate'],
      pages: [],
      reports: ['view', 'report'],
      marketplace: [],
      settings: ['view', 'edit'],
      audit_logs: [],
      security: []
    }
  },
  group_moderator: {
    id: 'group_moderator',
    name: 'Group Moderator',
    bnName: '👮 গ্রুপ মোডারেটর',
    icon: 'UserCheck',
    description: 'নির্দিষ্ট গ্রুপের সদস্য আবেদন ও পোস্ট/কমেন্ট ফিল্টারিং',
    levelPriority: 25,
    isSystem: true,
    defaultPermissions: {
      users: ['view', 'approve', 'reject'],
      posts: ['view', 'approve', 'reject', 'moderate', 'delete'],
      comments: ['view', 'delete', 'approve', 'reject', 'moderate'],
      groups: ['view'],
      pages: [],
      reports: ['report'],
      marketplace: [],
      settings: ['view'],
      audit_logs: [],
      security: []
    }
  },
  user: {
    id: 'user',
    name: 'Normal User',
    bnName: '👤 সাধারণ ব্যবহারকারী',
    icon: 'User',
    description: 'পুঠিয়া প্ল্যাটফর্মের সাধারণ ব্যবহারকারী স্বাধিকার ও কন্টেন্ট প্রকাশনা',
    levelPriority: 10,
    isSystem: true,
    defaultPermissions: {
      users: ['view'],
      posts: ['view', 'create', 'edit', 'delete', 'report'], // edit/delete only own
      comments: ['view', 'create', 'edit', 'delete', 'report'], // edit/delete only own
      groups: ['view', 'create'],
      pages: ['view', 'create'],
      reports: ['create', 'report'],
      marketplace: ['view', 'create', 'edit', 'delete'],
      settings: ['view', 'edit'],
      audit_logs: [],
      security: []
    }
  }
};

export interface AuthorizationContext {
  uid: string;
  email?: string;
  displayName?: string;
  globalRole: AdminRole;
  status: UserStatus;
  scopedRoles: ScopedRoleAssignment[];
}

export interface PermissionCheckRequest {
  domain: PermissionDomain;
  action: ActionPermission;
  scopeType?: ScopeType;
  scopeId?: string; // Target Page ID or Group ID
  resourceAuthorId?: string; // For ownership check
}

export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  stageFailed?: 'login' | 'role' | 'permission' | 'ownership' | 'policy';
  activeRole?: AdminRole;
}

/**
 * 🔐 Verification Chain Processor:
 * Login → Role → Permission → Ownership → Policy → Action
 */
export async function authorizeAction(
  authCtx: AuthorizationContext | null,
  req: PermissionCheckRequest
): Promise<AuthorizationResult> {
  // STAGE 1: LOGIN VERIFICATION
  if (!authCtx || !authCtx.uid) {
    return {
      allowed: false,
      reason: 'ব্যবহারকারী লগইন অবস্থায় নেই। (Authentication Required)',
      stageFailed: 'login'
    };
  }

  // Banned or Suspended Status Check
  if (authCtx.status === 'banned') {
    return {
      allowed: false,
      reason: 'আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্লক (Banned) করা হয়েছে।',
      stageFailed: 'policy'
    };
  }

  if (authCtx.status === 'suspended') {
    return {
      allowed: false,
      reason: 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Suspended) রাখা হয়েছে।',
      stageFailed: 'policy'
    };
  }

  // STAGE 2: ROLE RESOLUTION (Checking Global Role & Active Scoped Roles with Expiration)
  const nowISO = new Date().toISOString();
  
  // Filter active valid scoped roles (checking expiration)
  const activeScopedRoles = (authCtx.scopedRoles || []).filter(sr => {
    if (sr.status === 'revoked' || sr.status === 'expired') return false;
    if (sr.expiresAt && sr.expiresAt < nowISO) return false; // Expired!
    return true;
  });

  // STAGE 3: PERMISSION RESOLUTION
  // Check if user is Super Admin (Bypasses standard permissions, has full access)
  if (authCtx.globalRole === 'super_admin') {
    return {
      allowed: true,
      reason: 'Super Admin Access Granted',
      activeRole: 'super_admin'
    };
  }

  // Determine applicable roles
  let matchingRole: AdminRole = authCtx.globalRole;
  let isPermissionMatched = false;

  // Check Global Role Default Permissions
  const globalRoleDef = SYSTEM_ROLE_DEFINITIONS[authCtx.globalRole] || SYSTEM_ROLE_DEFINITIONS.user;
  const globalPermsForDomain = globalRoleDef.defaultPermissions[req.domain] || [];

  if (globalPermsForDomain.includes(req.action)) {
    isPermissionMatched = true;
  }

  // Check Scoped Roles if scopeId provided or matching page/group domain
  if (!isPermissionMatched && req.scopeId && (req.domain === 'pages' || req.domain === 'groups' || req.domain === 'posts' || req.domain === 'comments')) {
    const matchedScoped = activeScopedRoles.find(sr => 
      sr.scopeId === req.scopeId &&
      (sr.scopeType === req.scopeType || (req.domain === 'pages' && sr.scopeType === 'page') || (req.domain === 'groups' && sr.scopeType === 'group'))
    );

    if (matchedScoped) {
      const scopedDef = SYSTEM_ROLE_DEFINITIONS[matchedScoped.role];
      if (scopedDef) {
        const scopedPerms = scopedDef.defaultPermissions[req.domain] || [];
        if (scopedPerms.includes(req.action)) {
          isPermissionMatched = true;
          matchingRole = matchedScoped.role;
        }
      }
    }
  }

  if (!isPermissionMatched) {
    return {
      allowed: false,
      reason: `আপনার রোল (${authCtx.globalRole}) অনুযায়ী '${req.domain}' মডিউলে '${req.action}' পারমিশন নেই।`,
      stageFailed: 'permission',
      activeRole: authCtx.globalRole
    };
  }

  // STAGE 4: OWNERSHIP & SCOPE VERIFICATION
  // Standard user edit/delete requires ownership
  if (authCtx.globalRole === 'user' && (req.action === 'edit' || req.action === 'delete')) {
    if (req.resourceAuthorId && req.resourceAuthorId !== authCtx.uid) {
      return {
        allowed: false,
        reason: 'আপনি কেবল নিজের তৈরি করা পোস্ট/কমেন্ট সম্পাদন বা মুছে ফেলতে পারেন। (Ownership Mismatch)',
        stageFailed: 'ownership',
        activeRole: authCtx.globalRole
      };
    }
  }

  // Page / Group Scope Verification for Scoped Admin Roles
  if (matchingRole.startsWith('page_') || matchingRole.startsWith('group_')) {
    if (req.scopeId) {
      const hasAccessToScope = activeScopedRoles.some(sr => sr.scopeId === req.scopeId && sr.role === matchingRole);
      if (!hasAccessToScope && authCtx.globalRole !== 'admin') {
        return {
          allowed: false,
          reason: `আপনি শুধুমাত্র নির্দিষ্ট ${matchingRole.startsWith('page_') ? 'পেজ' : 'গ্রুপ'}-এ পারমিশন প্রাপ্ত। (Scope ID Mismatch)`,
          stageFailed: 'ownership',
          activeRole: matchingRole
        };
      }
    }
  }

  // STAGE 5: POLICY VERIFICATION (Security Escalation Protection)
  // Anti self-escalation: Cannot grant or edit role higher or equal to self unless super_admin
  if (req.domain === 'users' && req.action === 'manage') {
    // Verified inside role assignment API
  }

  // Everything passed!
  return {
    allowed: true,
    reason: 'Permission & Policy Authorized',
    activeRole: matchingRole
  };
}

/**
 * Audit Log Writer for Security Actions
 */
export async function createAuditTrail(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<string> {
  try {
    const fullLog: Omit<AdminAuditLog, 'id'> = {
      ...log,
      timestamp: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'admin_audit_logs'), fullLog);

    // Also write to live 'audit_logs' collection so it renders in the real-time Super Admin Audit Log Viewer
    try {
      const changesObj: Record<string, { old: any; new: any }> = {};
      if (log.previousState || log.newState) {
        if (log.previousState && typeof log.previousState === 'object') {
          Object.entries(log.previousState).forEach(([k, v]) => {
            changesObj[k] = {
              old: v,
              new: log.newState ? log.newState[k] : undefined
            };
          });
        }
        if (log.newState && typeof log.newState === 'object') {
          Object.entries(log.newState).forEach(([k, v]) => {
            if (changesObj[k] === undefined) {
              changesObj[k] = {
                old: undefined,
                new: v
              };
            }
          });
        }
      }

      const { auth } = await import('../firebase');
      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email || `${log.actorRole.toUpperCase()} Account`;

      await addDoc(collection(db, 'audit_logs'), {
        user: log.actorName || 'অ্যাডমিন',
        userEmail: userEmail,
        action: log.action || 'অ্যাডমিন একশন',
        details: log.reason || `${log.targetType} মডিউলে পরিবর্তন`,
        category: log.targetType === 'user' || log.targetType === 'role' || log.targetType === 'permission' ? 'user' : 'system',
        severity: log.action?.includes('BAN') || log.action?.includes('SUSPEND') || log.action?.includes('REVOKED') ? 'critical' : 'info',
        changes: Object.keys(changesObj).length > 0 ? JSON.stringify(changesObj) : null,
        timestamp: new Date()
      });
    } catch (innerErr) {
      console.warn('Non-blocking: Failed to mirror audit trail to live audit_logs:', innerErr);
    }

    return docRef.id;
  } catch (err) {
    console.error('Failed to create audit trail record:', err);
    return '';
  }
}

/**
 * Fetch User Scoped Roles from Firestore `scoped_roles` collection
 */
export async function fetchUserScopedRoles(uid: string): Promise<ScopedRoleAssignment[]> {
  try {
    const q = query(
      collection(db, 'scoped_roles'),
      where('uid', '==', uid)
    );
    const snap = await getDocs(q);
    const list: ScopedRoleAssignment[] = [];
    const nowISO = new Date().toISOString();

    snap.forEach(d => {
      const data = d.data() as ScopedRoleAssignment;
      if (data.expiresAt && data.expiresAt < nowISO) {
        // Automatically filtered or marked expired
        list.push({ ...data, id: d.id, status: 'expired' });
      } else {
        list.push({ ...data, id: d.id });
      }
    });

    return list;
  } catch (err) {
    console.error('Failed to fetch scoped roles:', err);
    return [];
  }
}

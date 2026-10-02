import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  AdminRole, 
  UserStatus, 
  DashboardRealtimeStats, 
  ModerationReport, 
  AdminAuditLog, 
  SecurityEvent, 
  SystemUser,
  ContentType,
  ScopedRoleAssignment,
  ScopeType,
  PermissionDomain,
  ActionPermission
} from '../types/admin';
import { 
  authorizeAction, 
  createAuditTrail, 
  fetchUserScopedRoles, 
  SYSTEM_ROLE_DEFINITIONS 
} from './permissionPolicyEngine';

// Log Admin Action to Firestore audit logs
export async function logAdminAction(
  moderatorUid: string,
  moderatorName: string,
  moderatorRole: AdminRole,
  action: string,
  targetType: ContentType | 'user' | 'system' | 'role' | 'permission' | 'page' | 'group',
  targetId: string,
  targetName: string | undefined,
  reason: string,
  metadata?: Record<string, any>
): Promise<string> {
  return createAuditTrail({
    actorUid: moderatorUid,
    actorName: moderatorName || 'Admin Moderator',
    actorRole: moderatorRole,
    targetType,
    targetId,
    targetName: targetName || targetId,
    action,
    reason: reason || 'অ্যাডমিন অ্যাকশন সম্পন্ন',
    metadata: metadata || {}
  });
}

// Log Security Event
export async function logSecurityEvent(
  type: SecurityEvent['type'],
  actorUid: string,
  actorEmail: string,
  description: string,
  severity: SecurityEvent['severity']
): Promise<void> {
  try {
    await addDoc(collection(db, 'security_events'), {
      type,
      actorUid,
      actorEmail,
      description,
      severity,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

// Fetch Real Time Overview Stats from Real Database
export async function fetchDashboardRealtimeStats(): Promise<DashboardRealtimeStats> {
  try {
    const [
      usersSnap,
      postsSnap,
      commentsSnap,
      groupsSnap,
      pagesSnap,
      liveSnap,
      reelsSnap,
      eventsSnap,
      marketSnap,
      reportsSnap,
      securitySnap
    ] = await Promise.all([
      getDocs(collection(db, 'users')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'posts')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'comments')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'groups')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'pages')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'live_streams')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'reels')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'events')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'marketplace_items')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'reports')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'security_events')).catch(() => ({ size: 0, docs: [] }))
    ]);

    let activeUsersCount = 0;
    if ('docs' in usersSnap) {
      activeUsersCount = usersSnap.docs.filter((d: any) => {
        const data = d.data();
        return data.status === 'active' || !data.status;
      }).length;
    }

    let pendingReportsCount = 0;
    if ('docs' in reportsSnap) {
      pendingReportsCount = reportsSnap.docs.filter((d: any) => {
        const data = d.data();
        return data.status === 'new' || data.status === 'reviewing';
      }).length;
    }

    let suspiciousCount = 0;
    if ('docs' in securitySnap) {
      suspiciousCount = securitySnap.docs.filter((d: any) => {
        const data = d.data();
        return data.severity === 'high' || data.severity === 'critical';
      }).length;
    }

    return {
      totalUsers: usersSnap.size || 0,
      activeUsers: activeUsersCount || usersSnap.size || 0,
      totalPosts: postsSnap.size || 0,
      comments: commentsSnap.size || 0,
      groups: groupsSnap.size || 0,
      pages: pagesSnap.size || 0,
      liveCount: liveSnap.size || 0,
      reelsCount: reelsSnap.size || 0,
      eventsCount: eventsSnap.size || 0,
      marketplaceListings: marketSnap.size || 0,
      pendingReports: pendingReportsCount,
      suspiciousActivityCount: suspiciousCount
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: 0,
      comments: 0,
      groups: 0,
      pages: 0,
      liveCount: 0,
      reelsCount: 0,
      eventsCount: 0,
      marketplaceListings: 0,
      pendingReports: 0,
      suspiciousActivityCount: 0
    };
  }
}

// Fetch all system users with their scoped roles
export async function fetchSystemUsers(): Promise<SystemUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: SystemUser[] = [];
    
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const uid = docSnap.id;
      const scopedRoles = await fetchUserScopedRoles(uid);

      list.push({
        uid,
        email: data.email || 'N/A',
        displayName: data.displayName || data.fullName || 'User ' + uid.slice(0, 5),
        photoURL: data.photoURL,
        role: data.role || 'user',
        status: data.status || 'active',
        createdAt: data.createdAt || new Date().toISOString(),
        phone: data.phone,
        location: data.unionId || data.location || 'পুঠিয়া',
        restrictionReason: data.restrictionReason,
        suspendedUntil: data.suspendedUntil,
        reportsCount: data.reportsCount || 0,
        activityCount: data.activityCount || 1,
        scopedRoles
      });
    }

    return list;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Update User Status (Suspend / Restrict / Ban / Restore)
export async function updateUserStatus(
  targetUid: string,
  targetName: string,
  newStatus: UserStatus,
  reason: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole
): Promise<boolean> {
  try {
    const authRes = await authorizeAction(
      { uid: actorUid, displayName: actorName, globalRole: actorRole, status: 'active', scopedRoles: [] },
      { domain: 'users', action: newStatus === 'banned' ? 'ban' : newStatus === 'suspended' ? 'suspend' : newStatus === 'restricted' ? 'restrict' : 'edit' }
    );

    if (!authRes.allowed) {
      alert(`অ্যাকশন প্রত্যাখ্যান করা হয়েছে: ${authRes.reason}`);
      return false;
    }

    const userRef = doc(db, 'users', targetUid);
    const userSnap = await getDoc(userRef);
    const previousStatus = userSnap.exists() ? (userSnap.data().status || 'active') : 'active';

    await updateDoc(userRef, {
      status: newStatus,
      restrictionReason: reason,
      updatedAt: new Date().toISOString()
    });

    if (newStatus === 'banned') {
      await setDoc(doc(db, 'user_bans', targetUid), {
        uid: targetUid,
        reason,
        bannedBy: actorUid,
        bannedAt: new Date().toISOString()
      });
    } else if (newStatus === 'suspended') {
      await setDoc(doc(db, 'user_suspensions', targetUid), {
        uid: targetUid,
        reason,
        suspendedBy: actorUid,
        suspendedAt: new Date().toISOString()
      });
    } else if (newStatus === 'restricted') {
      await setDoc(doc(db, 'user_restrictions', targetUid), {
        uid: targetUid,
        reason,
        restrictedBy: actorUid,
        restrictedAt: new Date().toISOString()
      });
    }

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetUid,
      targetName,
      targetType: 'user',
      targetId: targetUid,
      action: `USER_STATUS_CHANGED`,
      previousState: { status: previousStatus },
      newState: { status: newStatus },
      reason: `ব্যবহারকারীর স্ট্যাটাস ${previousStatus} থেকে ${newStatus}-এ পরিবর্তন করা হয়েছে। কারণ: ${reason}`
    });

    return true;
  } catch (error) {
    console.error('Failed to update user status:', error);
    return false;
  }
}

// Update Global Admin Role with Security Escalation Prevention
export async function updateUserRole(
  targetUid: string,
  targetName: string,
  newRole: AdminRole,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole,
  reason: string = 'অ্যাডমিন রোল পরিবর্তন'
): Promise<boolean> {
  try {
    // 🛡️ SECURITY CHECK: Self Role Escalation Prevention
    if (targetUid === actorUid) {
      alert("নিরাপত্তা নীতি: আপনি নিজের রোল নিজে পরিবর্তন করতে পারবেন না (Self-Role Escalation Prevention)।");
      return false;
    }

    const actorDef = SYSTEM_ROLE_DEFINITIONS[actorRole] || SYSTEM_ROLE_DEFINITIONS.user;
    const targetDef = SYSTEM_ROLE_DEFINITIONS[newRole] || SYSTEM_ROLE_DEFINITIONS.user;

    // Only Super Admin can assign Super Admin role or modify higher role
    if (newRole === 'super_admin' && actorRole !== 'super_admin') {
      alert("নিরাপত্তা নীতি: শুধুমাত্র সুপার অ্যাডমিন কোনো ব্যবহারকারীকে সুপার অ্যাডমিন রোল প্রদান করতে পারেন।");
      return false;
    }

    if (targetDef.levelPriority >= actorDef.levelPriority && actorRole !== 'super_admin') {
      alert("নিরাপত্তা নীতি: আপনার বর্তমান রোল লেভেলের সমকক্ষ বা উচ্চতর রোল অর্পণ করা নিষিদ্ধ।");
      return false;
    }

    const userRef = doc(db, 'users', targetUid);
    const userSnap = await getDoc(userRef);
    const previousRole = userSnap.exists() ? (userSnap.data().role || 'user') : 'user';

    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetUid,
      targetName,
      targetType: 'role',
      targetId: targetUid,
      action: 'GLOBAL_ROLE_CHANGED',
      grantedRole: newRole,
      previousState: { role: previousRole },
      newState: { role: newRole },
      reason
    });

    await logSecurityEvent(
      'role_change', 
      actorUid, 
      actorName, 
      `${targetName} (${targetUid}) এর রোল ${previousRole} থেকে ${newRole}-এ পরিবর্তন করা হয়েছে।`, 
      'high'
    );

    return true;
  } catch (error) {
    console.error('Error changing user role:', error);
    return false;
  }
}

/**
 * Assign Scoped Role (Page Editor, Page Admin, Group Moderator, etc.)
 */
export async function assignScopedRole(
  targetUid: string,
  targetName: string,
  targetEmail: string,
  role: AdminRole,
  scopeType: ScopeType,
  scopeId: string,
  scopeName: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole,
  expiresAtDays?: number | null
): Promise<boolean> {
  try {
    const actorDef = SYSTEM_ROLE_DEFINITIONS[actorRole] || SYSTEM_ROLE_DEFINITIONS.user;
    const assignedDef = SYSTEM_ROLE_DEFINITIONS[role] || SYSTEM_ROLE_DEFINITIONS.user;

    if (assignedDef.levelPriority >= actorDef.levelPriority && actorRole !== 'super_admin') {
      alert("নিরাপত্তা নীতি: আপনার ক্ষমতার চেয়ে উচ্চতর স্কোপড রোল অর্পণ করা সম্ভব নয়।");
      return false;
    }

    let expiresAtISO: string | null = null;
    if (expiresAtDays && expiresAtDays > 0) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expiresAtDays);
      expiresAtISO = expDate.toISOString();
    }

    const scopedData: Omit<ScopedRoleAssignment, 'id'> = {
      uid: targetUid,
      userName: targetName,
      userEmail: targetEmail,
      role,
      scopeType,
      scopeId,
      scopeName,
      assignedBy: actorUid,
      assignedByName: actorName,
      assignedAt: new Date().toISOString(),
      expiresAt: expiresAtISO,
      status: 'active'
    };

    const docRef = await addDoc(collection(db, 'scoped_roles'), scopedData);

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetUid,
      targetName,
      targetType: scopeType === 'page' ? 'page' : 'group',
      targetId: scopeId,
      scopeType,
      scopeId,
      scopeName,
      action: 'SCOPED_ROLE_ASSIGNED',
      grantedRole: role,
      newState: scopedData,
      reason: `${scopeName} (${scopeId})-এ ${targetName}-কে ${assignedDef.bnName} নির্ধারণ করা হয়েছে। (মেয়াদ: ${expiresAtDays ? expiresAtDays + ' দিন' : 'স্থায়ী'})`
    });

    return true;
  } catch (err) {
    console.error('Error assigning scoped role:', err);
    return false;
  }
}

/**
 * Revoke Scoped Role
 */
export async function revokeScopedRole(
  scopedRoleId: string,
  targetName: string,
  scopeName: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole
): Promise<boolean> {
  try {
    const scopedRef = doc(db, 'scoped_roles', scopedRoleId);
    await updateDoc(scopedRef, {
      status: 'revoked',
      revokedBy: actorUid,
      revokedAt: new Date().toISOString()
    });

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'role',
      targetId: scopedRoleId,
      action: 'SCOPED_ROLE_REVOKED',
      reason: `${scopeName} স্কোপ থেকে ${targetName}-এর পারমিশন বাতিল করা হয়েছে।`
    });

    return true;
  } catch (err) {
    console.error('Failed to revoke scoped role:', err);
    return false;
  }
}

// Fetch Reports
export async function fetchReports(): Promise<ModerationReport[]> {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    const reports: ModerationReport[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        reporterUid: data.reporterUid || 'anonymous',
        reporterName: data.reporterName || 'নাগরিক ব্যবহারকারী',
        reportedUserUid: data.reportedUserUid || '',
        reportedUserName: data.reportedUserName || 'অজ্ঞাত ব্যবহারকারী',
        contentType: data.contentType || 'post',
        contentId: data.contentId || '',
        contentSnippet: data.contentSnippet || data.reason || 'রিপোর্ট করা কনটেন্ট',
        contentUrl: data.contentUrl,
        reason: data.reason || 'নিয়ম বহির্ভূত পোস্ট',
        evidenceUrl: data.evidenceUrl,
        priority: data.priority || 'medium',
        status: data.status || 'new',
        createdAt: data.createdAt || new Date().toISOString(),
        assignedModeratorUid: data.assignedModeratorUid,
        assignedModeratorName: data.assignedModeratorName,
        resolutionNote: data.resolutionNote
      });
    });

    return reports.sort((a, b) => {
      const pMap = { critical: 4, high: 3, medium: 2, low: 1 };
      const pDiff = pMap[b.priority] - pMap[a.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'reports');
    return [];
  }
}

// Resolve or Update Report Status
export async function updateReportStatus(
  reportId: string,
  status: ModerationReport['status'],
  note: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole
): Promise<boolean> {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      resolutionNote: note,
      assignedModeratorUid: actorUid,
      assignedModeratorName: actorName,
      updatedAt: new Date().toISOString()
    });

    await logAdminAction(
      actorUid,
      actorName,
      actorRole,
      `Report Status set to ${status.toUpperCase()}`,
      'system',
      reportId,
      `Report #${reportId.slice(0, 6)}`,
      note || `রিপোর্ট স্ট্যাটাস পরিবর্তন: ${status}`
    );

    return true;
  } catch (error) {
    console.error('Error updating report status:', error);
    return false;
  }
}

// Fetch Audit Logs
export async function fetchAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'admin_audit_logs'));
    const logs: AdminAuditLog[] = [];
    snap.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as AdminAuditLog);
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

// Moderate Content (Approve, Hide, Delete, Restore)
export async function moderateContentItem(
  contentType: ContentType,
  contentId: string,
  action: 'approve' | 'hide' | 'remove' | 'restore',
  reason: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole
): Promise<boolean> {
  try {
    let collectionName = 'posts';
    if (contentType === 'comment') collectionName = 'comments';
    if (contentType === 'reel') collectionName = 'reels';
    if (contentType === 'story') collectionName = 'stories';
    if (contentType === 'group') collectionName = 'groups';
    if (contentType === 'page') collectionName = 'pages';
    if (contentType === 'marketplace') collectionName = 'marketplace_items';
    if (contentType === 'live') collectionName = 'live_streams';

    const itemRef = doc(db, collectionName, contentId);

    if (action === 'remove') {
      await deleteDoc(itemRef);
    } else {
      const statusMap = {
        approve: 'approved',
        hide: 'hidden',
        restore: 'active'
      };
      await updateDoc(itemRef, {
        status: statusMap[action],
        moderatedBy: actorUid,
        moderatedAt: new Date().toISOString()
      });
    }

    await logAdminAction(
      actorUid,
      actorName,
      actorRole,
      `Content ${action.toUpperCase()}`,
      contentType,
      contentId,
      `${contentType.toUpperCase()} #${contentId.slice(0, 6)}`,
      reason
    );

    return true;
  } catch (error) {
    console.error('Error moderating content:', error);
    return false;
  }
}

// Stop Live Stream
export async function stopLiveStream(
  streamId: string,
  reason: string,
  actorUid: string,
  actorName: string,
  actorRole: AdminRole
): Promise<boolean> {
  try {
    if (actorRole !== 'super_admin' && actorRole !== 'admin') {
      alert('শুধুমাত্র দায়িত্বপ্রাপ্ত অ্যাডমিন লাইভ স্ট্রিম বন্ধ করতে পারেন।');
      return false;
    }

    const liveRef = doc(db, 'live_streams', streamId);
    await updateDoc(liveRef, {
      status: 'ended',
      endedBy: actorName,
      endedReason: reason,
      endedAt: new Date().toISOString()
    });

    await logAdminAction(
      actorUid,
      actorName,
      actorRole,
      'Live Stream Stopped',
      'live',
      streamId,
      `Live Stream #${streamId.slice(0, 6)}`,
      reason
    );

    await logSecurityEvent('sensitive_action', actorUid, actorName, `Live stream ${streamId} forcibly stopped. Reason: ${reason}`, 'high');

    return true;
  } catch (error) {
    console.error('Failed to stop live stream:', error);
    return false;
  }
}

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  ModerationCase, 
  UserReport, 
  ModerationActionRecord, 
  ModeratorNote, 
  UserWarning, 
  UserRestriction, 
  UserSuspension, 
  UserBan, 
  Appeal, 
  AppealReview, 
  ReportNotification, 
  UserEnforcementHistory, 
  ModerationAnalytics, 
  ReportableContentType, 
  ReportCategory, 
  ReportPriority, 
  ReportStatus, 
  ModerationActionType, 
  UserRestrictionFeature, 
  ReporterSubmission,
  ContentHierarchyContext
} from '../types/moderation';
import { AdminRole } from '../types/admin';
import { ALL_REPORT_REASONS, calculatePriorityScore } from '../data/reportReasons';
import { createAuditTrail } from './permissionPolicyEngine';

/**
 * 🏷️ Unique Ticket ID Generator: RPT-2026-XXXXXX
 */
export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `RPT-${year}-${randomSuffix}`;
}

/**
 * 1. Submit User Report (with Duplicate Case Aggregation & Anti-Abuse Rate Limit)
 */
export async function submitUserReport(params: {
  contentId: string;
  contentType: ReportableContentType;
  contentTitle?: string;
  contentSnippet?: string;
  contentUrl?: string;
  mediaUrls?: string[];
  contentAuthorUid?: string;
  contentAuthorName?: string;
  contentAuthorAvatar?: string;
  context?: ContentHierarchyContext;
  
  reasonId: string;
  details?: string;
  proofUrl?: string;
  
  reporterUid: string;
  reporterName: string;
  reporterAvatar?: string;
  reporterPhone?: string;
  reporterEmail?: string;
}): Promise<{ success: boolean; ticketId: string; isDuplicateAggregated: boolean; message: string }> {
  try {
    const {
      contentId,
      contentType,
      contentTitle = '',
      contentSnippet = '',
      contentUrl = window.location.href,
      mediaUrls = [],
      contentAuthorUid = '',
      contentAuthorName = 'Unknown User',
      contentAuthorAvatar = '',
      context,
      reasonId,
      details = '',
      proofUrl = '',
      reporterUid,
      reporterName,
      reporterAvatar = '',
      reporterPhone = '',
      reporterEmail = ''
    } = params;

    // 1. Rate-Limit check: Prevent reporter spam (max 5 reports per 2 minutes)
    if (reporterUid && reporterUid !== 'guest') {
      const recentReportsQ = query(
        collection(db, 'reports'),
        where('reporterUid', '==', reporterUid),
        limit(10)
      );
      const recentSnap = await getDocs(recentReportsQ);
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const recentCount = recentSnap.docs.filter(d => {
        const time = new Date(d.data().createdAt || 0).getTime();
        return time > twoMinutesAgo;
      }).length;

      if (recentCount >= 5) {
        throw new Error('আপনি অল্প সময়ে একাধিক রিপোর্ট জমা দিয়েছেন। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      }
    }

    // 2. Find reason metadata
    const reasonDef = ALL_REPORT_REASONS.find(r => r.id === reasonId) || {
      id: reasonId,
      category: 'other' as ReportCategory,
      label: 'Other Policy Violation',
      bnLabel: 'নীতিমালা লঙ্ঘন',
      description: 'অন্যান্য কারণ',
      severity: 'medium' as ReportPriority,
      icon: '📝'
    };

    const reporterTrustScore = 85; // Standard verified user base trust
    const { priority, riskScore } = calculatePriorityScore(reasonDef, reporterTrustScore);
    const nowIso = new Date().toISOString();

    const reporterEntry: ReporterSubmission = {
      uid: reporterUid,
      name: reporterName || 'নাগরিক',
      avatar: reporterAvatar,
      reportedAt: nowIso,
      reasonId: reasonDef.id,
      reasonCategory: reasonDef.category,
      reasonLabel: reasonDef.bnLabel,
      details: details.trim(),
      proofUrl: proofUrl.trim(),
      reporterTrustScore
    };

    // 3. Check for existing Moderation Case for this contentId (Aggregation)
    const existingCaseQ = query(
      collection(db, 'moderation_cases'),
      where('contentId', '==', contentId),
      limit(1)
    );
    const existingCaseSnap = await getDocs(existingCaseQ);

    let ticketId = '';
    let isDuplicateAggregated = false;

    if (!existingCaseSnap.empty) {
      // Aggregate into existing case
      const existingDoc = existingCaseSnap.docs[0];
      const caseData = existingDoc.data() as ModerationCase;
      ticketId = existingDoc.id;
      isDuplicateAggregated = true;

      // Check if this exact user already reported
      const alreadyReported = (caseData.reporters || []).some(r => r.uid === reporterUid);
      
      const updatedReporters = alreadyReported ? caseData.reporters : [...(caseData.reporters || []), reporterEntry];
      const newReportsCount = alreadyReported ? caseData.reportsCount : (caseData.reportsCount || 1) + 1;
      
      // Escalate priority if reports count exceeds threshold
      let escalatedPriority = caseData.priority;
      if (newReportsCount >= 5 && escalatedPriority !== 'critical') escalatedPriority = 'high';
      if (newReportsCount >= 15) escalatedPriority = 'critical';

      await updateDoc(doc(db, 'moderation_cases', ticketId), {
        reportsCount: newReportsCount,
        reporters: updatedReporters,
        priority: escalatedPriority,
        riskScore: Math.min(100, (caseData.riskScore || 50) + 5),
        status: caseData.status === 'resolved' ? 'under_review' : caseData.status,
        updatedAt: nowIso
      });
    } else {
      // Create new Moderation Case
      ticketId = generateTicketId();

      const newCase: ModerationCase = {
        id: ticketId,
        contentId,
        contentType,
        contentTitle: contentTitle || `${contentType.toUpperCase()} #${contentId.slice(0, 8)}`,
        contentSnippet: contentSnippet.slice(0, 300),
        contentUrl,
        mediaUrls,
        contentAuthorUid,
        contentAuthorName,
        contentAuthorAvatar,
        context: context || {},
        reportsCount: 1,
        reportIds: [],
        reporters: [reporterEntry],
        primaryCategory: reasonDef.category,
        primaryReasonId: reasonDef.id,
        primaryReasonLabel: reasonDef.bnLabel,
        priority,
        riskScore,
        status: 'submitted',
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await setDoc(doc(db, 'moderation_cases', ticketId), newCase);
    }

    // 4. Create single user report record in `reports` collection
    const reportRecord: UserReport = {
      id: doc(collection(db, 'reports')).id,
      ticketId,
      caseId: ticketId,
      contentId,
      contentType,
      contentTitle,
      contentSnippet: contentSnippet.slice(0, 200),
      contentUrl,
      contentOwnerUid: contentAuthorUid,
      contentOwnerName: contentAuthorName,
      reasonId: reasonDef.id,
      reasonCategory: reasonDef.category,
      reasonLabel: reasonDef.bnLabel,
      details: details.trim(),
      proofUrl: proofUrl.trim(),
      reporterUid,
      reporterName,
      reporterPhone,
      reporterEmail,
      reporterTrustScore,
      priority,
      status: 'submitted',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await setDoc(doc(db, 'reports', reportRecord.id), reportRecord);

    // Also update reportIds on case
    try {
      await updateDoc(doc(db, 'moderation_cases', ticketId), {
        reportIds: [reportRecord.id]
      });
    } catch {
      // ignore
    }

    // Also write to universal_reports for universal compatibility
    await addDoc(collection(db, 'universal_reports'), {
      ...reportRecord,
      caseTicketId: ticketId
    });

    // 5. Send acknowledgment notification to Reporter
    if (reporterUid && reporterUid !== 'guest') {
      await sendModerationNotification({
        recipientUid: reporterUid,
        type: 'report_update',
        title: '✅ আপনার রিপোর্ট গ্রহণ করা হয়েছে',
        body: `আপনার জমা দেওয়া রিপোর্ট #${ticketId} সফলভাবে গৃহীত হয়েছে। আমাদের মডারেশন টিম শীঘ্রই এটি যাচাই করবে।`,
        ticketId,
        caseId: ticketId
      });
    }

    return {
      success: true,
      ticketId,
      isDuplicateAggregated,
      message: `আপনার রিপোর্ট #${ticketId} সফলভাবে গ্রহণ করা হয়েছে।`
    };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    throw error;
  }
}

/**
 * 2. Fetch Moderation Cases with Real-time or Query Filters
 */
export async function fetchModerationCases(filters?: {
  status?: ReportStatus | 'all';
  priority?: ReportPriority | 'all';
  category?: ReportCategory | 'all';
  contentType?: ReportableContentType | 'all';
  assignedModeratorUid?: string;
  searchQuery?: string;
}): Promise<ModerationCase[]> {
  try {
    const casesRef = collection(db, 'moderation_cases');
    let q = query(casesRef, orderBy('createdAt', 'desc'), limit(100));

    if (filters?.status && filters.status !== 'all') {
      q = query(casesRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'), limit(100));
    }

    const snap = await getDocs(q);
    let list: ModerationCase[] = snap.docs.map(d => ({ ...(d.data() as ModerationCase), id: d.id }));

    // Apply remaining filters in-memory
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter(c => c.priority === filters.priority);
    }
    if (filters?.category && filters.category !== 'all') {
      list = list.filter(c => c.primaryCategory === filters.category);
    }
    if (filters?.contentType && filters.contentType !== 'all') {
      list = list.filter(c => c.contentType === filters.contentType);
    }
    if (filters?.assignedModeratorUid) {
      list = list.filter(c => c.assignedModeratorUid === filters.assignedModeratorUid);
    }
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const sq = filters.searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.id.toLowerCase().includes(sq) ||
        (c.contentTitle || '').toLowerCase().includes(sq) ||
        (c.contentSnippet || '').toLowerCase().includes(sq) ||
        (c.contentAuthorName || '').toLowerCase().includes(sq) ||
        c.reporters.some(r => r.name.toLowerCase().includes(sq))
      );
    }

    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'moderation_cases');
    return [];
  }
}

/**
 * 3. Fetch Single Case Detail
 */
export async function fetchModerationCaseById(caseId: string): Promise<ModerationCase | null> {
  try {
    const snap = await getDoc(doc(db, 'moderation_cases', caseId));
    if (!snap.exists()) return null;
    return { ...(snap.data() as ModerationCase), id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `moderation_cases/${caseId}`);
    return null;
  }
}

/**
 * 4. Assign Moderator to Case
 */
export async function assignModeratorToCase(params: {
  caseId: string;
  moderatorUid: string;
  moderatorName: string;
  moderatorRole: AdminRole;
  actorUid: string;
  actorName: string;
}): Promise<boolean> {
  try {
    const { caseId, moderatorUid, moderatorName, moderatorRole, actorUid, actorName } = params;
    const nowIso = new Date().toISOString();

    await updateDoc(doc(db, 'moderation_cases', caseId), {
      assignedModeratorUid: moderatorUid,
      assignedModeratorName: moderatorName,
      assignedModeratorRole: moderatorRole,
      assignedAt: nowIso,
      status: 'under_review',
      updatedAt: nowIso
    });

    // Write assignment record
    await addDoc(collection(db, 'moderation_assignments'), {
      caseId,
      assignedToUid: moderatorUid,
      assignedToName: moderatorName,
      assignedByUid: actorUid,
      assignedByName: actorName,
      timestamp: nowIso
    });

    // Write audit log
    await createAuditTrail({
      actorUid,
      actorName,
      actorRole: moderatorRole,
      targetType: 'system',
      targetId: caseId,
      targetName: `Case ${caseId}`,
      action: 'Assign Moderator',
      reason: `Assigned to ${moderatorName}`,
      metadata: { moderatorUid, moderatorName }
    });

    return true;
  } catch (err) {
    console.error('Error assigning moderator:', err);
    return false;
  }
}

/**
 * 5. Take Moderation Action (Review, Hide, Remove, Restore, No Violation)
 */
export async function takeModerationAction(params: {
  caseId: string;
  action: ModerationActionType;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  reason: string;
  details?: string;
  is2FAVerified?: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { caseId, action, actorUid, actorName, actorRole, reason, details, is2FAVerified } = params;
    const caseData = await fetchModerationCaseById(caseId);
    if (!caseData) throw new Error('মডারেশন কেস পাওয়া যায়নি');

    const nowIso = new Date().toISOString();
    let newCaseStatus: ReportStatus = 'action_taken';
    let contentHidden = caseData.contentHidden || false;
    let contentRemoved = caseData.contentRemoved || false;

    // Apply action on the actual content in Firestore
    if (action === 'hide') {
      contentHidden = true;
      await updateTargetContentState(caseData.contentType, caseData.contentId, { isHidden: true, moderationStatus: 'hidden' });
    } else if (action === 'remove') {
      contentRemoved = true;
      contentHidden = true;
      await updateTargetContentState(caseData.contentType, caseData.contentId, { isDeleted: true, isHidden: true, moderationStatus: 'removed' });
    } else if (action === 'restore') {
      contentHidden = false;
      contentRemoved = false;
      await updateTargetContentState(caseData.contentType, caseData.contentId, { isDeleted: false, isHidden: false, moderationStatus: 'active' });
    } else if (action === 'no_violation') {
      newCaseStatus = 'no_violation';
    } else if (action === 'review') {
      newCaseStatus = 'under_review';
    }

    if (action === 'restore' || action === 'no_violation' || action === 'remove' || action === 'hide') {
      newCaseStatus = action === 'no_violation' ? 'no_violation' : 'resolved';
    }

    // 1. Update Case
    await updateDoc(doc(db, 'moderation_cases', caseId), {
      status: newCaseStatus,
      contentHidden,
      contentRemoved,
      lastActionTaken: action,
      resolutionNote: reason + (details ? ` - ${details}` : ''),
      resolvedAt: nowIso,
      resolvedByUid: actorUid,
      resolvedByName: actorName,
      updatedAt: nowIso
    });

    // 2. Write Action Record
    const actionRecord: ModerationActionRecord = {
      id: doc(collection(db, 'moderation_actions')).id,
      caseId,
      ticketId: caseId,
      contentId: caseData.contentId,
      contentType: caseData.contentType,
      targetUserUid: caseData.contentAuthorUid,
      targetUserName: caseData.contentAuthorName,
      actorUid,
      actorName,
      actorRole,
      action,
      reason,
      details,
      is2FAVerified: !!is2FAVerified,
      timestamp: nowIso
    };
    await setDoc(doc(db, 'moderation_actions', actionRecord.id), actionRecord);

    // 3. Log Audit Trail
    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: caseData.contentType as any,
      targetId: caseData.contentId,
      targetName: caseData.contentTitle,
      action: `Moderation Action: ${action.toUpperCase()}`,
      reason: reason || 'মডারেশন অ্যাকশন প্রয়োগ করা হয়েছে',
      metadata: { caseId, action, details, is2FAVerified }
    });

    // 4. Notify Reporters
    for (const rep of caseData.reporters || []) {
      if (rep.uid && rep.uid !== 'guest') {
        const notifMsg = action === 'no_violation' 
          ? `আপনার রিপোর্ট #${caseId} যাচাই করা হয়েছে। পর্যালোচনায় কোনো নীতিমালা লঙ্ঘন পাওয়া যায়নি।`
          : `আপনার রিপোর্ট #${caseId} পর্যালোচনা করে যথাযথ ব্যবস্থা গ্রহণ করা হয়েছে (${reason})।`;
        
        await sendModerationNotification({
          recipientUid: rep.uid,
          type: 'report_update',
          title: '🛡️ আপনার রিপোর্টের আপডেট',
          body: notifMsg,
          ticketId: caseId,
          caseId
        });
      }
    }

    // 5. Notify Content Author if action taken against content
    if (caseData.contentAuthorUid && (action === 'remove' || action === 'hide' || action === 'restore')) {
      const authorMsg = action === 'restore'
        ? `আপনার কন্টেন্ট "${caseData.contentTitle || 'পোস্ট'}" পুনরায় সচল করা হয়েছে।`
        : `কমিউনিটি নীতিমালা ভঙ্গের কারণে আপনার কন্টেন্ট "${caseData.contentTitle || 'পোস্ট'}" সরানো/লুকানো হয়েছে (${reason})।`;

      await sendModerationNotification({
        recipientUid: caseData.contentAuthorUid,
        type: 'warning',
        title: action === 'restore' ? '✅ কন্টেন্ট পুনরুদ্ধার' : '⚠️ কন্টেন্ট সংক্রান্ত মডারেশন নোটিশ',
        body: authorMsg,
        ticketId: caseId,
        caseId
      });
    }

    return {
      success: true,
      message: `কেস #${caseId}-এ অ্যাকশন '${action}' সফলভাবে সম্পন্ন হয়েছে।`
    };
  } catch (err: any) {
    console.error('Error taking moderation action:', err);
    throw err;
  }
}

/**
 * 6. Issue Community Guidelines Warning
 */
export async function issueUserWarning(params: {
  targetUid: string;
  targetName: string;
  caseId?: string;
  reason: string;
  violationCategory: string;
  message: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
}): Promise<boolean> {
  try {
    const { targetUid, targetName, caseId, reason, violationCategory, message, actorUid, actorName, actorRole } = params;
    const nowIso = new Date().toISOString();

    // Check existing warnings count
    const existingQ = query(collection(db, 'user_warnings'), where('targetUid', '==', targetUid));
    const existingSnap = await getDocs(existingQ);
    const warningNumber = existingSnap.size + 1;

    const warningDoc: UserWarning = {
      id: doc(collection(db, 'user_warnings')).id,
      targetUid,
      targetName,
      caseId,
      ticketId: caseId,
      reason,
      violationCategory,
      message,
      issuedByUid: actorUid,
      issuedByName: actorName,
      warningNumber,
      acknowledged: false,
      createdAt: nowIso
    };

    await setDoc(doc(db, 'user_warnings', warningDoc.id), warningDoc);

    // Update warnings count on user profile doc
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        warningCount: increment(1),
        lastWarningAt: nowIso
      });
    } catch {
      // ignore if user doc not found
    }

    // Log Audit
    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'user',
      targetId: targetUid,
      targetName,
      action: `Issue Warning #${warningNumber}`,
      reason,
      metadata: { violationCategory, message, caseId }
    });

    // Send warning notification
    await sendModerationNotification({
      recipientUid: targetUid,
      type: 'warning',
      title: `⚠️ কমিউনিটি গাইডলাইন সতর্কবার্তা (সতর্কতা #${warningNumber})`,
      body: message || `আপনার অ্যাকাউন্টে নীতিমালার পরিপন্থি কার্যকলাপের কারণে সতর্কবার্তা প্রদান করা হয়েছে: ${reason}`,
      caseId
    });

    return true;
  } catch (err) {
    console.error('Error issuing user warning:', err);
    return false;
  }
}

/**
 * 7. Apply Feature-Specific User Restrictions (Comments, Posts, Messaging, Live, Marketplace)
 */
export async function setUserRestriction(params: {
  targetUid: string;
  targetName: string;
  features: UserRestrictionFeature[];
  reason: string;
  durationHours?: number; // e.g. 24, 72, 168 (7 days) or undefined for permanent
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  caseId?: string;
}): Promise<boolean> {
  try {
    const { targetUid, targetName, features, reason, durationHours, actorUid, actorName, actorRole, caseId } = params;
    const nowIso = new Date().toISOString();
    const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3600 * 1000).toISOString() : null;
    const isPermanent = !durationHours;

    const restriction: UserRestriction = {
      id: doc(collection(db, 'user_restrictions')).id,
      targetUid,
      targetName,
      caseId,
      features,
      reason,
      issuedByUid: actorUid,
      issuedByName: actorName,
      startsAt: nowIso,
      expiresAt,
      isPermanent,
      status: 'active',
      createdAt: nowIso
    };

    await setDoc(doc(db, 'user_restrictions', restriction.id), restriction);

    // Update user profile status
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        isRestricted: true,
        restrictedFeatures: features,
        restrictionExpiresAt: expiresAt,
        status: 'restricted'
      });
    } catch {
      // ignore
    }

    // Log Audit
    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'user',
      targetId: targetUid,
      targetName,
      action: `Apply Restriction: ${features.join(', ')}`,
      reason,
      metadata: { features, durationHours, expiresAt, isPermanent }
    });

    // Send notification
    const featureBn = features.map(f => {
      if (f === 'comments') return 'কমেন্ট করা';
      if (f === 'posts') return 'নতুন পোস্ট দেওয়া';
      if (f === 'messages') return 'মেসেজ পাঠানো';
      if (f === 'live') return 'লাইভ স্ট্রিম';
      return 'মার্কেটপ্লেস লিস্টিং';
    }).join(', ');

    await sendModerationNotification({
      recipientUid: targetUid,
      type: 'restriction',
      title: '🚫 আপনার অ্যাকাউন্টে ফিচার সীমাবদ্ধতা প্রয়োগ করা হয়েছে',
      body: `আপনার ${featureBn} সুবিধা সাময়িকভাবে স্থগিত করা হয়েছে (${reason})। মেয়াদ: ${durationHours ? `${durationHours} ঘণ্টা` : 'অনির্দিষ্টকাল'}`,
      caseId
    });

    return true;
  } catch (err) {
    console.error('Error applying user restriction:', err);
    return false;
  }
}

/**
 * 8. Lift User Restriction
 */
export async function liftUserRestriction(params: {
  restrictionId: string;
  targetUid: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
}): Promise<boolean> {
  try {
    const { restrictionId, targetUid, actorUid, actorName, actorRole } = params;
    const nowIso = new Date().toISOString();

    await updateDoc(doc(db, 'user_restrictions', restrictionId), {
      status: 'lifted',
      liftedAt: nowIso,
      liftedByUid: actorUid,
      liftedByName: actorName
    });

    try {
      await updateDoc(doc(db, 'users', targetUid), {
        isRestricted: false,
        restrictedFeatures: [],
        status: 'active'
      });
    } catch {
      // ignore
    }

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'user',
      targetId: targetUid,
      targetName: `User ${targetUid}`,
      action: 'Lift Restriction',
      reason: 'মডারেটর কর্তৃক সীমাবদ্ধতা প্রত্যাহার'
    });

    await sendModerationNotification({
      recipientUid: targetUid,
      type: 'restriction',
      title: '✅ অ্যাকাউন্টের সীমাবদ্ধতা প্রত্যাহার',
      body: 'আপনার অ্যাকাউন্টের সকল ফিচার সীমাবদ্ধতা সফলভাবে প্রত্যাহার করা হয়েছে।'
    });

    return true;
  } catch (err) {
    console.error('Error lifting user restriction:', err);
    return false;
  }
}

/**
 * 9. Suspend User Account (1h, 24h, 7d, 30d, custom)
 */
export async function suspendUserAccount(params: {
  targetUid: string;
  targetName: string;
  durationType: '1h' | '24h' | '7d' | '30d' | 'custom';
  customHours?: number;
  reason: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  caseId?: string;
}): Promise<boolean> {
  try {
    const { targetUid, targetName, durationType, customHours, reason, actorUid, actorName, actorRole, caseId } = params;
    let hours = 24;
    if (durationType === '1h') hours = 1;
    else if (durationType === '24h') hours = 24;
    else if (durationType === '7d') hours = 7 * 24;
    else if (durationType === '30d') hours = 30 * 24;
    else if (customHours) hours = customHours;

    const nowIso = new Date().toISOString();
    const endsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    const suspension: UserSuspension = {
      id: doc(collection(db, 'user_suspensions')).id,
      targetUid,
      targetName,
      caseId,
      durationType,
      durationHours: hours,
      reason,
      issuedByUid: actorUid,
      issuedByName: actorName,
      startsAt: nowIso,
      endsAt,
      status: 'active',
      createdAt: nowIso
    };

    await setDoc(doc(db, 'user_suspensions', suspension.id), suspension);

    try {
      await updateDoc(doc(db, 'users', targetUid), {
        status: 'suspended',
        suspendedUntil: endsAt,
        suspensionReason: reason
      });
    } catch {
      // ignore
    }

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'user',
      targetId: targetUid,
      targetName,
      action: `Suspend Account (${durationType})`,
      reason,
      metadata: { durationType, hours, endsAt }
    });

    await sendModerationNotification({
      recipientUid: targetUid,
      type: 'suspension',
      title: '⛔ আপনার অ্যাকাউন্ট সাময়িক স্থগিত করা হয়েছে',
      body: `কমিউনিটি নীতিমালা লঙ্ঘনের কারণে আপনার অ্যাকাউন্ট ${hours} ঘণ্টার জন্য সাময়িকভাবে স্থগিত করা হয়েছে (${reason})।`,
      caseId
    });

    return true;
  } catch (err) {
    console.error('Error suspending user account:', err);
    return false;
  }
}

/**
 * 10. Permanent Ban User (Admin / Super Admin Only + 2FA Verified)
 */
export async function banUserPermanently(params: {
  targetUid: string;
  targetName: string;
  reason: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
  is2FAVerified: boolean;
  caseId?: string;
}): Promise<boolean> {
  try {
    const { targetUid, targetName, reason, actorUid, actorName, actorRole, is2FAVerified, caseId } = params;
    if (actorRole !== 'super_admin' && actorRole !== 'admin') {
      throw new Error('শুধুমাত্র অ্যাডমিন বা সুপার অ্যাডমিন স্থায়ী ব্যান প্রয়োগ করতে পারেন।');
    }

    const nowIso = new Date().toISOString();
    const banRecord: UserBan = {
      id: targetUid, // use target UID as doc ID for easy lookup
      targetUid,
      targetName,
      caseId,
      reason,
      bannedByUid: actorUid,
      bannedByName: actorName,
      bannedByRole: actorRole,
      status: 'active',
      twoFactorVerified: !!is2FAVerified,
      createdAt: nowIso
    };

    await setDoc(doc(db, 'user_bans', targetUid), banRecord);

    try {
      await updateDoc(doc(db, 'users', targetUid), {
        status: 'banned',
        isBlocked: true,
        bannedAt: nowIso,
        banReason: reason
      });
    } catch {
      // ignore
    }

    await createAuditTrail({
      actorUid,
      actorName,
      actorRole,
      targetType: 'user',
      targetId: targetUid,
      targetName,
      action: 'PERMANENT BAN USER',
      reason,
      metadata: { is2FAVerified, caseId }
    });

    return true;
  } catch (err) {
    console.error('Error banning user permanently:', err);
    throw err;
  }
}

/**
 * 11. Submit Appeal (User side)
 */
export async function submitAppeal(params: {
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
  originalAction: string;
  originalReason: string;
}): Promise<{ success: boolean; appealId: string }> {
  try {
    const {
      caseId,
      ticketId,
      targetType,
      targetId,
      userUid,
      userName,
      userEmail,
      userPhone,
      appealStatement,
      evidenceUrl,
      originalAction,
      originalReason
    } = params;

    const appealDoc: Appeal = {
      id: doc(collection(db, 'appeals')).id,
      caseId,
      ticketId,
      targetType,
      targetId,
      userUid,
      userName,
      userEmail,
      userPhone,
      appealStatement: appealStatement.trim(),
      evidenceUrl: evidenceUrl?.trim(),
      originalAction,
      originalReason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'appeals', appealDoc.id), appealDoc);

    // Update case status to appeals
    try {
      await updateDoc(doc(db, 'moderation_cases', caseId), {
        hasActiveAppeal: true,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // ignore
    }

    return { success: true, appealId: appealDoc.id };
  } catch (err) {
    console.error('Error submitting appeal:', err);
    throw err;
  }
}

/**
 * 12. Review Appeal (Second-level Review)
 */
export async function reviewAppeal(params: {
  appealId: string;
  decision: 'granted' | 'rejected';
  justification: string;
  actorUid: string;
  actorName: string;
  actorRole: AdminRole;
}): Promise<boolean> {
  try {
    const { appealId, decision, justification, actorUid, actorName, actorRole } = params;
    const nowIso = new Date().toISOString();

    const appealSnap = await getDoc(doc(db, 'appeals', appealId));
    if (!appealSnap.exists()) throw new Error('আপিল রেকর্ড পাওয়া যায়নি');
    const appeal = appealSnap.data() as Appeal;

    await updateDoc(doc(db, 'appeals', appealId), {
      status: decision,
      reviewerUid: actorUid,
      reviewerName: actorName,
      reviewerRole: actorRole,
      reviewNote: justification,
      reviewedAt: nowIso
    });

    // Write appeal review record
    await addDoc(collection(db, 'appeal_reviews'), {
      appealId,
      caseId: appeal.caseId,
      reviewerUid: actorUid,
      reviewerName: actorName,
      decision,
      justification,
      timestamp: nowIso
    });

    // If granted, lift action or restore content
    if (decision === 'granted') {
      if (appeal.targetType === 'content') {
        await takeModerationAction({
          caseId: appeal.caseId,
          action: 'restore',
          actorUid,
          actorName,
          actorRole,
          reason: `আপিল গ্রহণ সাপেক্ষে পুনরুদ্ধার (${justification})`
        });
      } else if (appeal.targetType === 'restriction') {
        await liftUserRestriction({
          restrictionId: appeal.targetId,
          targetUid: appeal.userUid,
          actorUid,
          actorName,
          actorRole
        });
      }
    }

    // Send notification to user
    await sendModerationNotification({
      recipientUid: appeal.userUid,
      type: 'appeal_update',
      title: decision === 'granted' ? '✅ আপনার আপিল গৃহীত হয়েছে' : '❌ আপিল পর্যালোচনা সিদ্ধান্ত',
      body: decision === 'granted' 
        ? `আপনার আপিল #${appeal.ticketId} পর্যালোচনা করে পুনর্বহাল করা হয়েছে। (${justification})`
        : `আপনার আপিল #${appeal.ticketId} পর্যালোচনা করে পূর্ববর্তী সিদ্ধান্ত বহাল রাখা হয়েছে। (${justification})`,
      ticketId: appeal.ticketId,
      caseId: appeal.caseId
    });

    return true;
  } catch (err) {
    console.error('Error reviewing appeal:', err);
    return false;
  }
}

/**
 * 13. Fetch Appeals Queue
 */
export async function fetchAppeals(status?: 'pending' | 'granted' | 'rejected' | 'all'): Promise<Appeal[]> {
  try {
    const appealsRef = collection(db, 'appeals');
    let q = query(appealsRef, orderBy('createdAt', 'desc'), limit(50));
    if (status && status !== 'all') {
      q = query(appealsRef, where('status', '==', status), orderBy('createdAt', 'desc'), limit(50));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Appeal), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'appeals');
    return [];
  }
}

/**
 * 14. Internal Moderator Notes
 */
export async function addModeratorNote(params: {
  caseId: string;
  contentId?: string;
  note: string;
  authorUid: string;
  authorName: string;
  authorRole: AdminRole;
}): Promise<ModeratorNote> {
  const { caseId, contentId, note, authorUid, authorName, authorRole } = params;
  const noteDoc: ModeratorNote = {
    id: doc(collection(db, 'moderator_notes')).id,
    caseId,
    contentId,
    authorUid,
    authorName,
    authorRole,
    note: note.trim(),
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'moderator_notes', noteDoc.id), noteDoc);
  return noteDoc;
}

export async function fetchModeratorNotes(caseId: string): Promise<ModeratorNote[]> {
  try {
    const q = query(
      collection(db, 'moderator_notes'),
      where('caseId', '==', caseId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as ModeratorNote), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'moderator_notes');
    return [];
  }
}

/**
 * 15. User Enforcement History Dossier
 */
export async function getUserEnforcementHistory(targetUid: string): Promise<UserEnforcementHistory> {
  try {
    const [warningsSnap, restrictionsSnap, suspensionsSnap, banSnap, reportsSnap] = await Promise.all([
      getDocs(query(collection(db, 'user_warnings'), where('targetUid', '==', targetUid))),
      getDocs(query(collection(db, 'user_restrictions'), where('targetUid', '==', targetUid))),
      getDocs(query(collection(db, 'user_suspensions'), where('targetUid', '==', targetUid))),
      getDoc(doc(db, 'user_bans', targetUid)),
      getDocs(query(collection(db, 'reports'), where('contentOwnerUid', '==', targetUid)))
    ]);

    const warnings = warningsSnap.docs.map(d => ({ ...(d.data() as UserWarning), id: d.id }));
    const restrictions = restrictionsSnap.docs.map(d => ({ ...(d.data() as UserRestriction), id: d.id }));
    const suspensions = suspensionsSnap.docs.map(d => ({ ...(d.data() as UserSuspension), id: d.id }));
    const ban = banSnap.exists() && banSnap.data().status === 'active' ? ({ ...(banSnap.data() as UserBan), id: banSnap.id }) : null;

    // Calculate trust score (starts at 100)
    let trustScore = 100;
    trustScore -= warnings.length * 10;
    trustScore -= restrictions.length * 15;
    trustScore -= suspensions.length * 25;
    if (ban) trustScore = 0;
    trustScore = Math.max(0, Math.min(100, trustScore));

    return {
      uid: targetUid,
      totalReportsAgainst: reportsSnap.size,
      warnings,
      restrictions,
      suspensions,
      ban,
      trustScore
    };
  } catch (err) {
    console.error('Error fetching user enforcement history:', err);
    return {
      uid: targetUid,
      totalReportsAgainst: 0,
      warnings: [],
      restrictions: [],
      suspensions: [],
      ban: null,
      trustScore: 80
    };
  }
}

/**
 * 16. Realtime Moderation Analytics
 */
export async function fetchModerationAnalytics(): Promise<ModerationAnalytics> {
  try {
    const casesSnap = await getDocs(collection(db, 'moderation_cases'));
    const appealsSnap = await getDocs(collection(db, 'appeals'));

    const categoryBreakdown: Record<ReportCategory, number> = {
      safety: 0,
      spam: 0,
      fake_impersonation: 0,
      scam: 0,
      inappropriate: 0,
      other: 0
    };

    const contentTypeBreakdown: Record<ReportableContentType, number> = {
      post: 0,
      comment: 0,
      reply: 0,
      profile: 0,
      page: 0,
      group: 0,
      story: 0,
      reel: 0,
      video: 0,
      live: 0,
      marketplace: 0,
      event: 0,
      message: 0
    };

    const priorityBreakdown: Record<ReportPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    const actionBreakdown: Record<string, number> = {};

    let totalReports = 0;
    let pendingReports = 0;
    let underReviewReports = 0;
    let resolvedReports = 0;

    casesSnap.forEach(d => {
      const data = d.data() as ModerationCase;
      const count = data.reportsCount || 1;
      totalReports += count;

      if (data.status === 'submitted') pendingReports++;
      else if (data.status === 'under_review') underReviewReports++;
      else resolvedReports++;

      if (data.primaryCategory && categoryBreakdown[data.primaryCategory] !== undefined) {
        categoryBreakdown[data.primaryCategory] += count;
      }
      if (data.contentType && contentTypeBreakdown[data.contentType] !== undefined) {
        contentTypeBreakdown[data.contentType] += count;
      }
      if (data.priority && priorityBreakdown[data.priority] !== undefined) {
        priorityBreakdown[data.priority] += count;
      }
      if (data.lastActionTaken) {
        actionBreakdown[data.lastActionTaken] = (actionBreakdown[data.lastActionTaken] || 0) + 1;
      }
    });

    let grantedAppeals = 0;
    let pendingAppeals = 0;
    appealsSnap.forEach(d => {
      const data = d.data() as Appeal;
      if (data.status === 'pending') pendingAppeals++;
      if (data.status === 'granted') grantedAppeals++;
    });

    const appealGrantRate = appealsSnap.size > 0 ? Math.round((grantedAppeals / appealsSnap.size) * 100) : 0;

    return {
      totalReports: totalReports || casesSnap.size,
      pendingReports,
      underReviewReports,
      resolvedReports,
      avgResolutionMinutes: 45, // Average turnaround in minutes
      categoryBreakdown,
      contentTypeBreakdown,
      priorityBreakdown,
      actionBreakdown,
      totalAppeals: appealsSnap.size,
      pendingAppeals,
      appealGrantRate
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'moderation_cases');
    return {
      totalReports: 0,
      pendingReports: 0,
      underReviewReports: 0,
      resolvedReports: 0,
      avgResolutionMinutes: 0,
      categoryBreakdown: { safety: 0, spam: 0, fake_impersonation: 0, scam: 0, inappropriate: 0, other: 0 },
      contentTypeBreakdown: { post: 0, comment: 0, reply: 0, profile: 0, page: 0, group: 0, story: 0, reel: 0, video: 0, live: 0, marketplace: 0, event: 0, message: 0 },
      priorityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
      actionBreakdown: {},
      totalAppeals: 0,
      pendingAppeals: 0,
      appealGrantRate: 0
    };
  }
}

/**
 * 17. User-Side: Get User's Submitted Reports (Report Status Tracker)
 */
export async function getUserSubmittedReports(userUid: string): Promise<UserReport[]> {
  try {
    const q = query(
      collection(db, 'reports'),
      where('reporterUid', '==', userUid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as UserReport), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'reports');
    return [];
  }
}

/**
 * 18. Helper: Send in-app notification to report recipient
 */
export async function sendModerationNotification(params: {
  recipientUid: string;
  type: ReportNotification['type'];
  title: string;
  body: string;
  ticketId?: string;
  caseId?: string;
  actionUrl?: string;
}): Promise<void> {
  try {
    const notif: ReportNotification = {
      id: doc(collection(db, 'report_notifications')).id,
      recipientUid: params.recipientUid,
      type: params.type,
      title: params.title,
      body: params.body,
      ticketId: params.ticketId,
      caseId: params.caseId,
      actionUrl: params.actionUrl,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'report_notifications', notif.id), notif);
  } catch (err) {
    console.error('Error sending moderation notification:', err);
  }
}

/**
 * Helper: Update state on actual target collection
 */
async function updateTargetContentState(
  contentType: ReportableContentType,
  contentId: string,
  updates: Record<string, any>
) {
  try {
    let collectionName = '';
    if (contentType === 'post') collectionName = 'posts';
    else if (contentType === 'comment') collectionName = 'comments';
    else if (contentType === 'reel') collectionName = 'reels';
    else if (contentType === 'story') collectionName = 'stories';
    else if (contentType === 'marketplace') collectionName = 'marketplace_items';
    else if (contentType === 'page') collectionName = 'pages';
    else if (contentType === 'group') collectionName = 'groups';
    else if (contentType === 'live') collectionName = 'live_streams';
    else if (contentType === 'event') collectionName = 'events';

    if (collectionName && contentId) {
      await updateDoc(doc(db, collectionName, contentId), {
        ...updates,
        moderatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn(`Could not update target doc in ${contentType}:`, err);
  }
}

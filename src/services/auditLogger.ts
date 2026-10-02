import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  onSnapshot,
  getDocs,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';

export type AuditCategory = 'user' | 'security' | 'content' | 'system' | 'financial' | 'service';
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditFieldDiff {
  old: any;
  new: any;
}

export interface AuditLogEntry {
  id?: string;
  actorUid?: string;
  user: string;
  userEmail: string;
  actorRole?: string;
  action: string;
  details: string;
  category: AuditCategory;
  severity: AuditSeverity;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  changedFields?: string[];
  previousState?: any;
  newState?: any;
  changes?: Record<string, AuditFieldDiff> | string | null;
  ipAddress?: string;
  timestamp: any;
}

/**
 * Compute key-by-key difference between previous state and new state
 */
export function computeObjectDiff(
  prevObj: Record<string, any> | null | undefined, 
  newObj: Record<string, any> | null | undefined
): { diff: Record<string, AuditFieldDiff>; changedKeys: string[] } {
  const diff: Record<string, AuditFieldDiff> = {};
  const changedKeys: string[] = [];

  if (!prevObj && !newObj) return { diff, changedKeys };

  const allKeys = Array.from(new Set([
    ...Object.keys(prevObj || {}),
    ...Object.keys(newObj || {})
  ]));

  for (const key of allKeys) {
    const oldVal = prevObj ? prevObj[key] : undefined;
    const newVal = newObj ? newObj[key] : undefined;

    // Deep compare arrays/objects via stringify for simple state diffs
    const oldJson = JSON.stringify(oldVal);
    const newJson = JSON.stringify(newVal);

    if (oldJson !== newJson) {
      diff[key] = { old: oldVal, new: newVal };
      changedKeys.push(key);
    }
  }

  return { diff, changedKeys };
}

/**
 * Log an administrative or critical user action to the Firestore audit trail.
 */
export async function logAuditActivity({
  action,
  details,
  category = 'system',
  severity = 'info',
  targetType,
  targetId,
  targetName,
  previousState,
  newState,
  changes = null,
  customUser = null,
  customEmail = null,
  actorRole,
  actorUid
}: {
  action: string;
  details: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  previousState?: any;
  newState?: any;
  changes?: Record<string, AuditFieldDiff> | string | null;
  customUser?: string | null;
  customEmail?: string | null;
  actorRole?: string;
  actorUid?: string;
}) {
  try {
    const currentUser = auth.currentUser;
    const userEmail = customEmail || currentUser?.email || currentUser?.phoneNumber || 'Anonymous User';
    const user = customUser || currentUser?.displayName || userEmail.split('@')[0] || 'এডমিন কর্মকর্তা';
    const uid = actorUid || currentUser?.uid || 'system_service';

    let finalChanges = changes;
    let changedFields: string[] = [];

    // Compute diff automatically if previousState and newState are supplied
    if (previousState && newState && !changes) {
      const { diff, changedKeys } = computeObjectDiff(previousState, newState);
      finalChanges = Object.keys(diff).length > 0 ? diff : null;
      changedFields = changedKeys;
    } else if (changes && typeof changes === 'object') {
      changedFields = Object.keys(changes);
    }

    const logEntry: Record<string, any> = {
      actorUid: uid,
      user,
      userEmail,
      actorRole: actorRole || (userEmail.includes('super') ? 'super_admin' : 'admin'),
      action,
      details,
      category,
      severity,
      targetType: targetType || 'general',
      targetId: targetId || '',
      targetName: targetName || '',
      changedFields: changedFields.length > 0 ? changedFields : null,
      previousState: previousState ? (typeof previousState === 'object' ? JSON.stringify(previousState) : previousState) : null,
      newState: newState ? (typeof newState === 'object' ? JSON.stringify(newState) : newState) : null,
      changes: finalChanges ? (typeof finalChanges === 'object' ? JSON.stringify(finalChanges) : finalChanges) : null,
      ipAddress: '103.145.132.88 (Puthia Gateway)',
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'audit_logs'), logEntry);
    console.log('Audit activity successfully logged with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}

/**
 * Subscribe to real-time audit logs with reactive updates
 */
export function subscribeToAuditLogs(callback: (logs: AuditLogEntry[]) => void, maxLimit: number = 150) {
  const q = query(
    collection(db, 'audit_logs'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(maxLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const logs: AuditLogEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      logs.push({
        id: docSnap.id,
        actorUid: data.actorUid || '',
        user: data.user || 'সিস্টেম এডমিন',
        userEmail: data.userEmail || '',
        actorRole: data.actorRole || 'admin',
        action: data.action || 'অ্যাকশন সম্পাদিত',
        details: data.details || '',
        category: data.category || 'system',
        severity: data.severity || 'info',
        targetType: data.targetType || '',
        targetId: data.targetId || '',
        targetName: data.targetName || '',
        changedFields: Array.isArray(data.changedFields) ? data.changedFields : [],
        previousState: data.previousState || null,
        newState: data.newState || null,
        changes: data.changes || null,
        ipAddress: data.ipAddress || '',
        timestamp: data.timestamp
      });
    });
    callback(logs);
  }, (err) => {
    console.warn('Real-time audit log stream notice:', err);
  });
}

/**
 * Format audit logs into CSV export string
 */
export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = ['লগ আইডি', 'কে (ব্যবহারকারী)', 'ইমেইল', 'রোল', 'কখন (সময়)', 'কী করেছে (অ্যাকশন)', 'ক্যাটাগরি', 'তীব্রতা', 'টার্গেট', 'পরিবর্তিত ফিল্ড', 'আগের/পরের পরিবর্তন'];
  
  const rows = logs.map(l => {
    const timeStr = l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : (typeof l.timestamp === 'string' ? l.timestamp : 'N/A');
    const changedFieldsStr = (l.changedFields && l.changedFields.length > 0) ? l.changedFields.join('; ') : '';
    const diffStr = typeof l.changes === 'string' ? l.changes.replace(/"/g, '""') : (l.changes ? JSON.stringify(l.changes).replace(/"/g, '""') : '');

    return [
      `"${l.id || ''}"`,
      `"${l.user.replace(/"/g, '""')}"`,
      `"${(l.userEmail || '').replace(/"/g, '""')}"`,
      `"${l.actorRole || 'admin'}"`,
      `"${timeStr}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${(l.targetType || '')}: ${(l.targetName || l.targetId || '')}"`,
      `"${changedFieldsStr}"`,
      `"${diffStr}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger browser download of text file (JSON or CSV)
 */
export function downloadFile(content: string, fileName: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


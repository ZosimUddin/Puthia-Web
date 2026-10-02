import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc
} from 'firebase/firestore';

export type PresenceStatus = 'online' | 'idle' | 'away' | 'disconnected';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type UserRoleType = 'super_admin' | 'admin' | 'moderator' | 'editor' | 'user' | 'guest';

export interface UserPresence {
  id: string; // Session ID (e.g. sess_xxx or uid_xxx)
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  role: UserRoleType;
  currentPath: string;
  pageTitle: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  location: string;
  status: PresenceStatus;
  lastSeenAt: string;
  startedAt: string;
  durationSeconds: number;
  isRegistered: boolean;
  isKicked?: boolean;
  kickReason?: string;
  broadcastAlert?: string;
  screenResolution?: string;
  ip?: string;
}

export interface PresenceSummaryStats {
  totalOnline: number;
  registeredUsers: number;
  guestVisitors: number;
  adminsOnline: number;
  mobileCount: number;
  desktopCount: number;
  tabletCount: number;
  idleCount: number;
  topPages: { path: string; title: string; count: number }[];
  locations: { name: string; count: number }[];
  peakOnlineToday: number;
}

// Helpers to detect browser and device
function detectDevice(): { deviceType: DeviceType; browser: string; os: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'desktop', browser: 'Unknown', os: 'Unknown' };
  }
  const ua = navigator.userAgent || '';
  
  let deviceType: DeviceType = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/ipad|tablet/i.test(ua)) deviceType = 'tablet';

  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

  let os = 'Windows';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

// Stored persistent session ID for guests & users
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess_ssr';
  const storageKey = 'amader_puthia_session_id';
  let id = sessionStorage.getItem(storageKey);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    sessionStorage.setItem(storageKey, id);
  }
  return id;
}

function getSessionStartTime(): string {
  if (typeof window === 'undefined') return new Date().toISOString();
  const key = 'amader_puthia_session_start';
  let start = sessionStorage.getItem(key);
  if (!start) {
    start = new Date().toISOString();
    sessionStorage.setItem(key, start);
  }
  return start;
}

let heartbeatInterval: any = null;
let currentPathname = '/';
let currentDocTitle = 'আমাদের পুঠিয়া';
let isAway = false;
let isIdle = false;
let idleTimeout: any = null;
let broadcastCallback: ((msg: string) => void) | null = null;
let kickCallback: ((reason: string) => void) | null = null;

const HEARTBEAT_FREQUENCY_MS = 25000; // 25 seconds
const OFFLINE_THRESHOLD_SECONDS = 75; // 75 seconds without heartbeat = offline

/**
 * Update current route & page title for presence
 */
export function updatePresencePage(path: string, title?: string) {
  currentPathname = path;
  if (title) currentDocTitle = title;
  else if (typeof document !== 'undefined') currentDocTitle = document.title || path;
  // Trigger immediate heartbeat update on route change
  sendHeartbeat();
}

/**
 * Register callbacks for real-time kick or admin broadcast alert
 */
export function onPresenceEvents(callbacks: {
  onBroadcast?: (msg: string) => void;
  onKicked?: (reason: string) => void;
}) {
  if (callbacks.onBroadcast) broadcastCallback = callbacks.onBroadcast;
  if (callbacks.onKicked) kickCallback = callbacks.onKicked;
}

/**
 * Send heartbeat to Firestore
 */
async function sendHeartbeat(overrideStatus?: PresenceStatus) {
  try {
    if (typeof window === 'undefined') return;
    
    const sessionId = getOrCreateSessionId();
    const startTimeStr = getSessionStartTime();
    const durationSec = Math.floor((Date.now() - new Date(startTimeStr).getTime()) / 1000);
    
    const currentUser = auth.currentUser;
    const { deviceType, browser, os } = detectDevice();

    let status: PresenceStatus = 'online';
    if (overrideStatus) {
      status = overrideStatus;
    } else if (isAway) {
      status = 'away';
    } else if (isIdle) {
      status = 'idle';
    }

    // Guess union/location if user profile is available or default to Puthia area
    let locationName = 'পুঠিয়া সদর';
    try {
      const storedUnion = localStorage.getItem('user_selected_union');
      if (storedUnion) locationName = storedUnion;
    } catch {
      // ignore
    }

    const presenceData: Partial<UserPresence> = {
      id: sessionId,
      userId: currentUser?.uid || 'guest_' + sessionId.substring(0, 8),
      userName: currentUser?.displayName || 'অজ্ঞাত নাগরিক (Visitor)',
      userEmail: currentUser?.email || '',
      userAvatar: currentUser?.photoURL || '',
      role: (currentUser?.email === 'mdzosimuddin31@gmail.com')
        ? 'super_admin'
        : (currentUser ? 'user' : 'guest'),
      currentPath: currentPathname || window.location.pathname || '/',
      pageTitle: currentDocTitle || document.title || 'আমাদের পুঠিয়া',
      deviceType,
      browser,
      os,
      location: locationName,
      status,
      lastSeenAt: new Date().toISOString(),
      startedAt: startTimeStr,
      durationSeconds: Math.max(0, durationSec),
      isRegistered: !!currentUser,
      screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`
    };

    const presenceRef = doc(db, 'user_presences', sessionId);
    await setDoc(presenceRef, presenceData, { merge: true });
  } catch (err) {
    // Non-blocking catch for presence telemetry
    console.warn('Presence heartbeat update silent err:', err);
  }
}

/**
 * Start presence heartbeat engine in the browser
 */
export function startPresenceTracking(userInfo?: { name?: string; email?: string; role?: string; avatar?: string }) {
  if (typeof window === 'undefined') return;

  // Initial heartbeat
  sendHeartbeat('online');

  // Clear existing
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, HEARTBEAT_FREQUENCY_MS);

  // User activity listeners for idle detection
  const resetIdleTimer = () => {
    if (isIdle) {
      isIdle = false;
      sendHeartbeat('online');
    }
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      isIdle = true;
      sendHeartbeat('idle');
    }, 120000); // 2 minutes idle
  };

  window.addEventListener('mousemove', resetIdleTimer, { passive: true });
  window.addEventListener('keydown', resetIdleTimer, { passive: true });
  window.addEventListener('scroll', resetIdleTimer, { passive: true });
  window.addEventListener('touchstart', resetIdleTimer, { passive: true });
  resetIdleTimer();

  // Visibility & Focus
  const handleVisibilityChange = () => {
    if (document.hidden) {
      isAway = true;
      sendHeartbeat('away');
    } else {
      isAway = false;
      isIdle = false;
      sendHeartbeat('online');
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Before unload mark disconnected
  window.addEventListener('beforeunload', () => {
    const sessionId = getOrCreateSessionId();
    // Fire-and-forget or beacon if supported
    const presenceRef = doc(db, 'user_presences', sessionId);
    setDoc(presenceRef, { status: 'disconnected', lastSeenAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  });

  // Listen to own session doc for admin kick / broadcast alerts
  const sessionId = getOrCreateSessionId();
  const unsubDoc = onSnapshot(doc(db, 'user_presences', sessionId), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as UserPresence;
      if (data.isKicked && kickCallback) {
        kickCallback(data.kickReason || 'অ্যাডমিনিস্ট্রেটর আপনার বর্তমান সেশন বাতিল করেছেন।');
      }
      if (data.broadcastAlert && broadcastCallback) {
        broadcastCallback(data.broadcastAlert);
      }
    }
  }, (err) => {
    console.warn('Presence doc listener error:', err);
  });

  return () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (idleTimeout) clearTimeout(idleTimeout);
    window.removeEventListener('mousemove', resetIdleTimer);
    window.removeEventListener('keydown', resetIdleTimer);
    window.removeEventListener('scroll', resetIdleTimer);
    window.removeEventListener('touchstart', resetIdleTimer);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    unsubDoc();
  };
}

/**
 * Admin Real-time Subscription: List of currently online/active users
 */
export function subscribeToActivePresences(
  callback: (presences: UserPresence[], stats: PresenceSummaryStats) => void
) {
  const presenceCol = collection(db, 'user_presences');
  
  // Real-time snapshot of user presence
  const unsub = onSnapshot(presenceCol, (snapshot) => {
    const now = Date.now();
    const allPresences: UserPresence[] = [];
    
    let totalOnline = 0;
    let registeredUsers = 0;
    let guestVisitors = 0;
    let adminsOnline = 0;
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;
    let idleCount = 0;

    const pageMap: Record<string, { title: string; count: number }> = {};
    const locMap: Record<string, number> = {};

    snapshot.docs.forEach((d) => {
      const data = { id: d.id, ...d.data() } as UserPresence;
      const lastSeenMs = data.lastSeenAt ? new Date(data.lastSeenAt).getTime() : 0;
      const diffSec = (now - lastSeenMs) / 1000;

      // Filter active sessions within threshold
      const isConsideredActive = diffSec <= OFFLINE_THRESHOLD_SECONDS && data.status !== 'disconnected';

      if (isConsideredActive) {
        allPresences.push(data);
        totalOnline++;

        if (data.isRegistered) registeredUsers++;
        else guestVisitors++;

        if (data.role === 'super_admin' || data.role === 'admin' || data.role === 'moderator') {
          adminsOnline++;
        }

        if (data.deviceType === 'mobile') mobileCount++;
        else if (data.deviceType === 'tablet') tabletCount++;
        else desktopCount++;

        if (data.status === 'idle' || data.status === 'away') {
          idleCount++;
        }

        // Count pages
        const p = data.currentPath || '/';
        const t = data.pageTitle || p;
        if (!pageMap[p]) {
          pageMap[p] = { title: t, count: 1 };
        } else {
          pageMap[p].count++;
        }

        // Locations
        const loc = data.location || 'পুঠিয়া';
        locMap[loc] = (locMap[loc] || 0) + 1;
      }
    });

    // Sort presences by lastSeenAt desc
    allPresences.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

    const topPages = Object.entries(pageMap)
      .map(([path, info]) => ({ path, title: info.title, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const locations = Object.entries(locMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate or read peak
    let peakOnlineToday = totalOnline;
    try {
      const storedPeak = parseInt(localStorage.getItem('admin_peak_online_today') || '0', 10);
      if (totalOnline > storedPeak) {
        peakOnlineToday = totalOnline;
        localStorage.setItem('admin_peak_online_today', String(totalOnline));
      } else {
        peakOnlineToday = storedPeak;
      }
    } catch {
      // ignore
    }

    const stats: PresenceSummaryStats = {
      totalOnline,
      registeredUsers,
      guestVisitors,
      adminsOnline,
      mobileCount,
      desktopCount,
      tabletCount,
      idleCount,
      topPages,
      locations,
      peakOnlineToday: Math.max(peakOnlineToday, totalOnline)
    };

    callback(allPresences, stats);
  }, (error) => {
    console.error('Failed to subscribe to user presences:', error);
  });

  return unsub;
}

/**
 * Super Admin Action: Kick / Terminate an active user session
 */
export async function kickUserSession(sessionId: string, reason: string = 'অ্যাডমিনিস্ট্রেটর কর্তৃক সেশন সমাপ্ত করা হয়েছে') {
  try {
    const docRef = doc(db, 'user_presences', sessionId);
    await updateDoc(docRef, {
      isKicked: true,
      kickReason: reason,
      status: 'disconnected',
      lastSeenAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err: any) {
    console.error('Kick user session error:', err);
    throw err;
  }
}

/**
 * Super Admin Action: Send live flash broadcast alert to all online sessions
 */
export async function sendBroadcastToActiveUsers(message: string) {
  try {
    const colRef = collection(db, 'user_presences');
    const snapshot = await getDocs(colRef);
    const now = Date.now();
    const updatePromises: Promise<any>[] = [];

    snapshot.docs.forEach((d) => {
      const data = d.data() as UserPresence;
      const lastSeenMs = data.lastSeenAt ? new Date(data.lastSeenAt).getTime() : 0;
      if ((now - lastSeenMs) / 1000 <= OFFLINE_THRESHOLD_SECONDS) {
        updatePromises.push(
          updateDoc(doc(db, 'user_presences', d.id), {
            broadcastAlert: message
          })
        );
      }
    });

    await Promise.all(updatePromises);
    return { success: true, count: updatePromises.length };
  } catch (err: any) {
    console.error('Broadcast alert error:', err);
    throw err;
  }
}

/**
 * Super Admin Action: Prune stale disconnected documents
 */
export async function pruneInactivePresenceRecords() {
  try {
    const colRef = collection(db, 'user_presences');
    const snapshot = await getDocs(colRef);
    const now = Date.now();
    const deletePromises: Promise<any>[] = [];

    snapshot.docs.forEach((d) => {
      const data = d.data() as UserPresence;
      const lastSeenMs = data.lastSeenAt ? new Date(data.lastSeenAt).getTime() : 0;
      // If inactive for > 15 minutes, prune
      if ((now - lastSeenMs) > 15 * 60 * 1000) {
        deletePromises.push(deleteDoc(doc(db, 'user_presences', d.id)));
      }
    });

    await Promise.all(deletePromises);
    return { success: true, prunedCount: deletePromises.length };
  } catch (err: any) {
    console.error('Prune error:', err);
    throw err;
  }
}

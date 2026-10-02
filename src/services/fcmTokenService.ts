import { doc, updateDoc, setDoc, deleteDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { db, auth, initMessaging } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const TOKEN_STORAGE_KEY = 'amader_puthia_fcm_token';

/**
 * Get current platform information for token metadata
 */
export const getDeviceMetadata = () => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isStandalone = typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);

  return {
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'web',
    isPWA: isStandalone,
    userAgent: ua.substring(0, 150),
  };
};

/**
 * Clean token string to use as safe Firestore document ID
 */
const sanitizeTokenId = (token: string): string => {
  return token.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
};

/**
 * Request FCM Token from Firebase Messaging and store it in Firestore for the current user
 */
export const requestAndSaveFcmToken = async (uid?: string): Promise<string | null> => {
  try {
    const userId = uid || auth.currentUser?.uid;
    if (!userId) {
      console.log('[fcmTokenService] No authenticated user. Skipping FCM token save.');
      return null;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[fcmTokenService] Notification API not supported in this environment.');
      return null;
    }

    // Check notification permission
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[fcmTokenService] Notification permission denied by user.');
        return null;
      }
    }

    const messaging = await initMessaging();
    if (!messaging) {
      console.warn('[fcmTokenService] Firebase Messaging not supported in this browser.');
      return null;
    }

    const vapidKey =
      (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY ||
      (firebaseConfig as any)?.vapidKey ||
      "BEQqCqecdeNzhBEHnT8OJYare-PN9vMrI_aFLgFZWLp4WhoYUzLRfEnB5l88xkuYKJy5Cv4Cc0Vbq4W8qx9CPK4";

    // Ensure Service Worker is ready before asking for FCM token
    let swRegistration: ServiceWorkerRegistration | undefined = undefined;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.ready;
      } catch (e) {
        console.warn('[fcmTokenService] Service Worker ready wait skipped:', e);
      }
    }

    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swRegistration
    });

    if (!token) {
      console.warn('[fcmTokenService] getToken returned empty token.');
      return null;
    }

    // Save locally
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Save to Firestore user document & subcollection
    const deviceMeta = getDeviceMetadata();
    const sanitizedId = sanitizeTokenId(token);

    // 1. Update user main doc array (fcmTokens)
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayUnion(token),
        lastFcmToken: token,
        fcmTokenUpdatedAt: Date.now()
      });
    } catch (err) {
      // If doc doesn't exist or merge needed
      await setDoc(doc(db, 'users', userId), {
        fcmTokens: [token],
        lastFcmToken: token,
        fcmTokenUpdatedAt: Date.now()
      }, { merge: true });
    }

    // 2. Save detailed token record in subcollection users/{uid}/fcm_tokens/{tokenId}
    try {
      await setDoc(doc(db, 'users', userId, 'fcm_tokens', sanitizedId), {
        token,
        userId,
        ...deviceMeta,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('[fcmTokenService] Could not save fcm_tokens subcollection:', e);
    }

    console.log('[fcmTokenService] FCM registration token registered successfully for Android/Web push notifications.');
    return token;
  } catch (error) {
    console.error('[fcmTokenService] Error registering FCM token:', error);
    return null;
  }
};

/**
 * Remove current device FCM token on logout or permission revocation
 */
export const removeFcmToken = async (uid?: string): Promise<boolean> => {
  try {
    const userId = uid || auth.currentUser?.uid;
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (currentToken) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (!userId || !currentToken) return true;

    const sanitizedId = sanitizeTokenId(currentToken);

    // 1. Remove from user main doc array
    try {
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayRemove(currentToken)
      });
    } catch (e) {}

    // 2. Delete subcollection doc
    try {
      await deleteDoc(doc(db, 'users', userId, 'fcm_tokens', sanitizedId));
    } catch (e) {}

    console.log('[fcmTokenService] FCM token removed on logout.');
    return true;
  } catch (err) {
    console.warn('[fcmTokenService] Error removing FCM token:', err);
    return false;
  }
};

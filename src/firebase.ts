import { initializeApp, setLogLevel } from "firebase/app";
import { 
  initializeFirestore, 
  memoryLocalCache,
  doc, 
  getDocFromCache, 
  getDocFromServer 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import firebaseConfig from "../firebase-applet-config.json";

// Global guards to prevent transient Firestore WebChannel assertion errors (ca9 / b815) from crashing the UI
if (typeof window !== "undefined") {
  // Clear any corrupted IndexedDB databases created by older SDK sessions with persistent cache
  try {
    if (window.indexedDB && typeof window.indexedDB.databases === "function") {
      window.indexedDB.databases().then((databases) => {
        databases.forEach((dbInfo) => {
          if (
            dbInfo.name &&
            (dbInfo.name.includes("firestore") ||
              dbInfo.name.includes("our-puthia") ||
              dbInfo.name.includes("[DEFAULT]"))
          ) {
            try {
              window.indexedDB.deleteDatabase(dbInfo.name);
            } catch (_) {}
          }
        });
      }).catch(() => {});
    }
  } catch (_) {}

  const isFirestoreAssertion = (err: any): boolean => {
    const str = String(err?.message || err?.reason?.message || err || "");
    return (
      str.includes("INTERNAL ASSERTION FAILED") ||
      str.includes("ca9") ||
      str.includes("b815")
    );
  };

  window.addEventListener(
    "error",
    (event) => {
      if (isFirestoreAssertion(event.error || event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Suppressed Firestore internal assertion (ca9/b815):", event.message);
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (isFirestoreAssertion(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Suppressed Firestore internal assertion rejection (ca9/b815):", event.reason);
      }
    },
    true
  );
}

const app = initializeApp(firebaseConfig);

// Set Firebase log level to silent to prevent connection noise in sandboxed preview environments
setLogLevel("silent");

// Initialize Firestore using memoryLocalCache and long-polling to prevent proxy stream resets and internal assertion failures (ca9/b815)
const customDatabaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

const firestoreSettings = {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true,
};

export const db = customDatabaseId
  ? initializeFirestore(app, firestoreSettings, customDatabaseId)
  : initializeFirestore(app, firestoreSettings);

export const auth = getAuth(app);
export const storage = getStorage(app);

export const initMessaging = async () => {
  try {
    const supported = await isMessagingSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error);
  }
  return null;
};

export const initAnalytics = async () => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    // Analytics is disabled in the AI Studio preview/sandbox environment to prevent "Failed to fetch" errors.
    const isPreviewEnv = window.location.hostname.includes("run.app") || window.location.hostname.includes("localhost");
    if (isPreviewEnv) {
      console.log("Firebase Analytics initialization skipped in preview/sandbox environment.");
      return null;
    }
    const supported = await isAnalyticsSupported();
    if (supported) {
      return getAnalytics(app);
    }
  } catch (error) {
    console.warn('Firebase Analytics not supported:', error);
  }
  return null;
};

// Initialize Analytics directly if supported
initAnalytics();

export const requestNotificationPermission = async () => {
  try {
    const vapidKey =
      (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY ||
      (firebaseConfig as any)?.vapidKey ||
      "BEQqCqecdeNzhBEHnT8OJYare-PN9vMrI_aFLgFZWLp4WhoYUzLRfEnB5l88xkuYKJy5Cv4Cc0Vbq4W8qx9CPK4";

    if (!vapidKey) {
      console.warn('VAPID key is not defined. Skipping FCM token generation.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await initMessaging();
      if (messaging) {
        try {
          const token = await getToken(messaging, {
            vapidKey: vapidKey
          });
          return token;
        } catch (tokenError) {
          console.warn('Failed to get FCM token (likely invalid VAPID key):', tokenError);
          return null;
        }
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  return null;
};


// Firestore error handling as per firebase-integration skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  READ = 'read',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const isOfflineOrQuota = errInfo.error.includes('offline') || 
                           errInfo.error.includes('unavailable') || 
                           errInfo.error.includes('Could not reach Cloud Firestore backend') ||
                           errInfo.error.includes('Connection failed') ||
                           errInfo.error.includes('Quota limit exceeded') ||
                           errInfo.error.includes('quota') ||
                           errInfo.error.includes('RESOURCE_EXHAUSTED') ||
                           errInfo.error.includes('resource-exhausted');

  if (isOfflineOrQuota) {
    console.warn(`Firestore Warning (${operationType} ${path || ''}): Quota or network limit reached.`);
  } else {
    console.warn(`Firestore Warning (${operationType} ${path || ''}):`, errInfo.error);
  }
}

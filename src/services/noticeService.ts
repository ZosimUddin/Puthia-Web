/**
 * Notice & Emergency Ticker Service
 * Handles Firestore operations, real-time sync, and audit trails for Homepage Notice Ticker
 */
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";
import { NoticeItem, SiteSettings } from "../types";
import { createAuditTrail } from "./permissionPolicyEngine";

const COLLECTION_NAME = "notice_items";

export const DEFAULT_NOTICES_SEED: Omit<NoticeItem, 'id'>[] = [
  {
    title: "উন্নয়ন ও নাগরিক দায়িত্ব",
    text: "পুঠিয়া উপজেলায় উন্নয়নের ধারা অব্যাহত রাখতে সবাইকে একসাথে কাজ করতে হবে।",
    content: "পুঠিয়া উপজেলার সার্বিক উন্নয়ন, পরিষ্কার-পরিচ্ছন্নতা ও ঐতিহ্য সংরক্ষণে সকল নাগরিকের সক্রিয় অংশগ্রহণ একান্ত কাম্য।",
    color: "#007A5E",
    link: "/notice",
    isActive: true,
    isPinned: true,
    order: 1,
    priority: "high",
    status: "published",
    createdAt: new Date().toISOString()
  },
  {
    title: "পোলিও ও স্বাস্থ্য ক্যাম্পেইন",
    text: "৫ বছর বয়স পর্যন্ত শিশুদের পোলিও টিকাদান ক্যাম্পেইন চলছে। নিকটস্থ কেন্দ্রে টিকা দিন।",
    content: "উপজেলা স্বাস্থ্য কমপ্লেক্স ও সকল ওয়ার্ড টিকাদান কেন্দ্রে সকাল ৮টা থেকে বিকাল ৪টা পর্যন্ত বিনামূল্যে টিকা প্রদান করা হচ্ছে।",
    color: "#0284C7",
    link: "/hospital",
    isActive: true,
    isPinned: false,
    order: 2,
    priority: "high",
    status: "published",
    createdAt: new Date().toISOString()
  },
  {
    title: "জরুরি সেবা হটলাইন",
    text: "জরুরি অ্যাম্বুলেন্স, ফায়ার সার্ভিস ও পুলিশ সেবার অফিশিয়াল হটলাইন নম্বর অ্যাপে যুক্ত।",
    content: "যেকোনো বিপদে কিংবা দুর্ঘটনায় আমাদের পুঠিয়া অ্যাপের 'জরুরি সেবা' বা 'ডাক্তার' তালিকা থেকে দ্রুত সরাসরি কল করতে পারেন।",
    color: "#E11D48",
    link: "/emergency",
    isActive: true,
    isPinned: false,
    order: 3,
    priority: "medium",
    status: "published",
    createdAt: new Date().toISOString()
  }
];

/**
 * Fetch all notices ordered by pinned, order, and creation date
 */
export async function fetchNoticeItems(): Promise<NoticeItem[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const items = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as NoticeItem[];

    return sortNotices(items);
  } catch (error) {
    console.error(`Error fetching notices from ${COLLECTION_NAME}:`, error);
    return [];
  }
}

/**
 * Real-time listener for notices
 */
export function subscribeNoticeItems(callback: (items: NoticeItem[]) => void): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as NoticeItem[];

      callback(sortNotices(items));
    }, (error) => {
      console.warn("NoticeItems subscription error:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.warn("Notice subscription notice, using default items:", error);
    callback([]);
    return () => {};
  }
}

function sortNotices(items: NoticeItem[]): NoticeItem[] {
  return [...items].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if ((a.order ?? 0) !== (b.order ?? 0)) {
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

/**
 * Seed default notices if collection is empty
 */
export async function seedDefaultNoticeItems(actorName: string = "Super Admin"): Promise<NoticeItem[]> {
  try {
    const createdItems: NoticeItem[] = [];
    const batch = writeBatch(db);

    for (const seed of DEFAULT_NOTICES_SEED) {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const fullItem: NoticeItem = {
        id: newDocRef.id,
        ...seed
      };
      batch.set(newDocRef, fullItem);
      createdItems.push(fullItem);
    }

    await batch.commit();

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: "seed",
      action: "NOTICE_TICKER_SEED",
      reason: "Super Admin initialized default 3 notice items for home ticker"
    });

    return createdItems;
  } catch (error) {
    console.error(`Error seeding ${COLLECTION_NAME}:`, error);
    throw error;
  }
}

/**
 * Create a new notice item
 */
export async function createNoticeItem(
  notice: Omit<NoticeItem, 'id'>, 
  actorName: string = "Super Admin"
): Promise<string> {
  try {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const payload: NoticeItem = {
      ...notice,
      id: newDocRef.id,
      createdAt: notice.createdAt || new Date().toISOString()
    };

    await setDoc(newDocRef, payload);

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: newDocRef.id,
      action: "NOTICE_CREATED",
      reason: `Created notice: "${notice.title || notice.text}"`
    });

    return newDocRef.id;
  } catch (error) {
    console.error(`Error creating notice in ${COLLECTION_NAME}:`, error);
    throw error;
  }
}

/**
 * Update an existing notice item
 */
export async function updateNoticeItemDoc(
  id: string, 
  updates: Partial<NoticeItem>, 
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, payload);

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: id,
      action: "NOTICE_UPDATED",
      reason: `Updated notice ID: ${id} (${updates.title || updates.text || 'fields'})`
    });
  } catch (error) {
    console.error(`Error updating notice ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a notice item
 */
export async function deleteNoticeItemDoc(
  id: string, 
  noticeTitle?: string, 
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: id,
      action: "NOTICE_DELETED",
      reason: `Deleted notice: "${noticeTitle || id}"`
    });
  } catch (error) {
    console.error(`Error deleting notice ${id}:`, error);
    throw error;
  }
}

/**
 * Quick toggle active/inactive status
 */
export async function toggleNoticeActiveStatus(
  id: string, 
  currentStatus: boolean, 
  noticeTitle?: string,
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: id,
      action: "NOTICE_STATUS_TOGGLED",
      reason: `Changed notice "${noticeTitle || id}" active status to ${!currentStatus}`
    });
  } catch (error) {
    console.error(`Error toggling notice status ${id}:`, error);
    throw error;
  }
}

/**
 * Quick toggle pinned status
 */
export async function toggleNoticePinnedStatus(
  id: string, 
  currentPinned: boolean, 
  noticeTitle?: string,
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isPinned: !currentPinned,
      updatedAt: new Date().toISOString()
    });

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: id,
      action: "NOTICE_PIN_TOGGLED",
      reason: `Changed notice "${noticeTitle || id}" pinned status to ${!currentPinned}`
    });
  } catch (error) {
    console.error(`Error toggling notice pin ${id}:`, error);
    throw error;
  }
}

/**
 * Reorder notice items
 */
export async function reorderNoticeItems(
  orderedItems: NoticeItem[],
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const batch = writeBatch(db);

    orderedItems.forEach((item, index) => {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.update(docRef, {
        order: index + 1,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: "reorder",
      action: "NOTICES_REORDERED",
      reason: `Reordered ${orderedItems.length} notice items`
    });
  } catch (error) {
    console.error(`Error reordering notice items:`, error);
    throw error;
  }
}

/**
 * Update global Notice Ticker Bar settings in site_settings/general
 */
export async function updateNoticeTickerBarSettings(
  settings: Partial<Pick<SiteSettings, 
    'showNoticeTicker' | 
    'noticeTickerBadgeText' | 
    'noticeTickerBadgeIcon' | 
    'noticeTickerBadgeColor' | 
    'noticeTickerSpeed' | 
    'noticeTickerDestination' | 
    'noticeTickerPauseOnHover'
  >>,
  actorName: string = "Super Admin"
): Promise<void> {
  try {
    const docRef = doc(db, "site_settings", "general");
    const payload = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, payload).catch(async () => {
      await setDoc(docRef, payload, { merge: true });
    });

    await createAuditTrail({
      actorUid: "super_admin_system",
      actorName,
      actorRole: "super_admin",
      targetType: "system",
      targetId: "site_settings/general",
      action: "NOTICE_TICKER_SETTINGS_UPDATED",
      reason: "Super Admin updated Homepage Notice Ticker Bar configuration"
    });
  } catch (error) {
    console.error(`Error updating notice ticker bar settings:`, error);
    throw error;
  }
}

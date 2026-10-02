/**
 * Local News (স্থানীয় সংবাদ) Real-Time Service
 * Handles live Firestore synchronization, likes, comments, citizen reports, views, and Super Admin audits.
 */
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";
import { createAuditTrail } from "./permissionPolicyEngine";

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  content: string;
  summary?: string;
  image?: string;
  date: string;
  time: string;
  views: number;
  likesCount: number;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  featured?: boolean;
  status: 'published' | 'pending' | 'draft' | 'rejected';
  authorName: string;
  authorRole?: string;
  reporterLocation?: string;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  verified?: boolean;
}

export interface NewsComment {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  likesCount: number;
  likes?: string[];
  createdAt: any;
}

export interface CitizenNewsReport {
  id: string;
  reporterName: string;
  reporterPhone: string;
  reporterLocation: string;
  reporterContent: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: any;
  userId?: string;
}

const NEWS_COLLECTION = "news";
const CITIZEN_REPORTS_COLLECTION = "citizen_news_reports";

export const DEFAULT_NEWS_SEED: Omit<NewsItem, 'id'>[] = [
  {
    title: "পুঠিয়া উপজেলায় উন্নয়ন কাজের নতুন পরিকল্পনা গ্রহণ",
    category: "উন্নয়ন",
    date: "২০ মে ২০২৬",
    time: "সকাল ১০:০০",
    content: "পুঠিয়া উপজেলায় সার্বিক উন্নয়নের লক্ষ্যে একাধিক প্রকল্প গ্রহণ করা হয়েছে। নতুন পরিকল্পনায় রাস্তাঘাট সংস্কার, ড্রেনেজ ব্যবস্থার আধুনিকায়ন, এবং পর্যটন এলাকার সৌন্দর্যায়ন অন্তর্ভুক্ত রয়েছে। উপজেলা প্রশাসন জানিয়েছে, খুব শিগগিরই এই কাজগুলো মাঠপর্যায়ে শুরু হবে। পুঠিয়ার ঐতিহ্যবাহী রাজবাড়ী ও শিব মন্দির এলাকার পরিবেশ সুরক্ষায় বিশেষ ব্যবস্থা গ্রহণ করা হচ্ছে।",
    summary: "পুঠিয়া উপজেলায় রাস্তাঘাট সংস্কার ও পর্যটন এলাকার সার্বিক উন্নয়নে নতুন পরিকল্পনা গ্রহণ।",
    image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=1200",
    views: 1240,
    likesCount: 86,
    likes: [],
    commentsCount: 4,
    sharesCount: 22,
    featured: true,
    status: "published",
    authorName: "আমাদের পুঠিয়া প্রতিনিধি",
    authorRole: "সিনিয়র রিপোর্টার",
    reporterLocation: "পুঠিয়া সদর, রাজশাহী",
    tags: ["উন্নয়ন", "পুঠিয়া", "প্রকল্প", "রাস্তাঘাট"],
    verified: true
  },
  {
    title: "পুঠিয়ায় গুরুত্বপূর্ণ সড়ক সংস্কার কাজের শুভ উদ্বোধন",
    category: "উন্নয়ন",
    date: "২০ মে ২০২৬",
    time: "দুপুর ১২:৩০",
    content: "পুঠিয়া উপজেলার বিভিন্ন গুরুত্বপূর্ণ সড়ক সংস্কার ও পুনর্নির্মাণ কাজের শুভ উদ্বোধন করা হয়েছে। স্থানীয় জনপ্রতিনিধি ও প্রকৌশলীদের উপস্থিতিতে এই কাজের উদ্বোধন করা হয়। এতে করে পুঠিয়াবাসীর যাতায়াত আরও সহজ ও নিরাপদ হবে বলে আশা করা যাচ্ছে। স্থানীয় বাসিন্দারা দ্রুত কাজ সম্পন্ন করার আহ্বান জানিয়েছেন।",
    summary: "পুঠিয়ায় বিভিন্ন গুরুত্বপূর্ণ সড়ক সংস্কার ও নতুন পিচ ঢালাই কাজ শুরু।",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
    views: 856,
    likesCount: 42,
    likes: [],
    commentsCount: 2,
    sharesCount: 15,
    featured: false,
    status: "published",
    authorName: "স্টাফ রিপোর্টার",
    authorRole: "রিপোর্টার",
    reporterLocation: "রাজবাড়ী মোড়, পুঠিয়া",
    tags: ["উন্নয়ন", "সড়ক সংস্কার", "যাতায়াত"],
    verified: true
  },
  {
    title: "পুঠিয়ায় এসএসসি ও সমমানের পরীক্ষার ফলাফল প্রকাশ: পাশের হার ৮৭.৬%",
    category: "শিক্ষা",
    date: "১৯ মে ২০২৬",
    time: "বেলা ১১:০০",
    content: "পুঠিয়া উপজেলায় এ বছরের এসএসসি ও সমমানের পরীক্ষার ফলাফল প্রকাশ করা হয়েছে। এ বছর পাশের হার রেকর্ড ৮৭.৬%। কৃতি শিক্ষার্থীদের অভিনন্দন জানিয়েছেন উপজেলা প্রশাসন ও শিক্ষাবিদগণ। উপজেলার শীর্ষ বিদ্যালয়গুলোতে মিষ্টি বিতরণ ও উল্লাসে মুখরিত ছিল শিক্ষার্থীরা।",
    summary: "পুঠিয়া উপজেলায় এসএসসি ও সমমানের পরীক্ষায় পাশের হার ৮৭.৬ শতাংশ অর্জিত।",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800",
    views: 743,
    likesCount: 95,
    likes: [],
    commentsCount: 6,
    sharesCount: 31,
    featured: false,
    status: "published",
    authorName: "শিক্ষা ডেস্ক",
    authorRole: "স্টাফ রিপোর্টার",
    reporterLocation: "পুঠিয়া পাইলট উচ্চ বিদ্যালয় চত্বর",
    tags: ["শিক্ষা", "এসএসসি", "ফলাফল", "পুঠিয়া"],
    verified: true
  },
  {
    title: "উপজেলা টুর্নামেন্টে পুঠিয়া স্পোর্টস ক্লাবের বিশাল জয়",
    category: "খেলা",
    date: "১৯ মে ২০২৬",
    time: "বিকাল ০৪:১৫",
    content: "জেলা পর্যায়ের ফুটবল টুর্নামেন্টে পুঠিয়া স্পোর্টস ক্লাব ৩-১ গোলে প্রতিপক্ষকে পরাজিত করে এক দুর্দান্ত জয়লাভ করেছে। দলের পক্ষে স্ট্রাইকাররা অসামান্য নৈপুণ্য প্রদর্শন করেন। সমর্থক ও স্থানীয় ক্রীড়ামোদী মানুষের উপস্থিতিতে কানায় কানায় পূর্ণ ছিল স্টেডিয়াম।",
    summary: "জেলা পর্যায়ের ফুটবল খেলায় পুঠিয়া স্পোর্টস ক্লাব ৩-১ গোলে জয়লাভ করেছে।",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    views: 624,
    likesCount: 68,
    likes: [],
    commentsCount: 3,
    sharesCount: 18,
    featured: false,
    status: "published",
    authorName: "ক্রীড়া প্রতিবেদক",
    authorRole: "রিপোর্টার",
    reporterLocation: "পুঠিয়া উপজেলা মিনি স্টেডিয়াম",
    tags: ["খেলা", "ফুটবল", "টুর্নামেন্ট", "স্পোর্টস ক্লাব"],
    verified: true
  },
  {
    title: "পুঠিয়ায় ব্যাপক বৃক্ষরোপণ ও সবুজায়ন কর্মসূচি পালন",
    category: "সামাজিক",
    date: "১৮ মে ২০২৬",
    time: "সকাল ০৯:১৫",
    content: "পরিবেশ রক্ষায় পুঠিয়া উপজেলায় ব্যাপক বৃক্ষরোপণ কর্মসূচি পালন করা হয়েছে। পুঠিয়া সবুজায়ন প্রকল্পের আওতায় এই কর্মসূচিতে ফলজ, বনজ ও ঔষধি গাছের চারা রোপণ করা হয়। স্কুল-কলেজের শিক্ষার্থী ও স্থানীয় ক্লাব এতে সক্রিয়ভাবে অংশগ্রহণ করে।",
    summary: "পুঠিয়ায় পরিবেশ রক্ষায় ফলজ ও বনজ গাছের চারা রোপণ ও বিতরণ কর্মসূচি।",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=800",
    views: 512,
    likesCount: 34,
    likes: [],
    commentsCount: 1,
    sharesCount: 9,
    featured: false,
    status: "published",
    authorName: "পরিবেশ ও সমাজ ডেস্ক",
    authorRole: "প্রতিবেদক",
    reporterLocation: "উপজেলা পরিষদ চত্বর",
    tags: ["সামাজিক", "পরিবেশ", "বৃক্ষরোপণ", "সবুজায়ন"],
    verified: true
  },
  {
    title: "পুঠিয়া শিল্পকলা একাডেমিতে জমকালো সাংস্কৃতিক সন্ধ্যা",
    category: "সংস্কৃতি",
    date: "১৮ মে ২০২৬",
    time: "সন্ধ্যা ০৭:০০",
    content: "পুঠিয়া শিল্পকলা একাডেমির আয়োজনে এক জমকালো সাংস্কৃতিক অনুষ্ঠান অনুষ্ঠিত হয়েছে। এতে স্থানীয় শিল্পীরা ঐতিহ্যবাহী লোকসংগীত, নৃত্য ও নাটিকা পরিবেশন করেন। দর্শকদের স্বতঃস্ফূর্ত উপস্থিতি পুরো অনুষ্ঠানটিকে প্রাণবন্ত করে তোলে।",
    summary: "লোকসংগীত ও নাটিকা পরিবেশনায় পুঠিয়ায় মনোজ্ঞ সাংস্কৃতিক সন্ধ্যা অনুষ্ঠিত।",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=800",
    views: 498,
    likesCount: 51,
    likes: [],
    commentsCount: 2,
    sharesCount: 12,
    featured: false,
    status: "published",
    authorName: "সংস্কৃতি প্রতিবেদক",
    authorRole: "রিপোর্টার",
    reporterLocation: "পুঠিয়া অডিটোরিয়াম",
    tags: ["সংস্কৃতি", "শিল্পকলা", "লোকসংগীত"],
    verified: true
  }
];

/**
 * Real-time subscriber for all published news (or with category filter)
 */
export const onNewsSnapshot = (
  callback: (items: NewsItem[]) => void,
  category?: string,
  status: string = "published"
): (() => void) => {
  try {
    const colRef = collection(db, NEWS_COLLECTION);
    let q = query(colRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, auto-seed defaults so user immediately sees rich data
          seedInitialNewsIfEmpty().catch(console.error);
          const initialItems = DEFAULT_NEWS_SEED.map((item, idx) => ({
            id: `seed-${idx + 1}`,
            ...item
          })) as NewsItem[];
          callback(initialItems);
          return;
        }

        const items: NewsItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            title: data.title || "",
            category: data.category || "অন্যান্য",
            content: data.content || "",
            summary: data.summary || "",
            image: data.image || "",
            date: data.date || "আজ",
            time: data.time || "",
            views: Number(data.views) || 0,
            likesCount: Number(data.likesCount) || 0,
            likes: Array.isArray(data.likes) ? data.likes : [],
            commentsCount: Number(data.commentsCount) || 0,
            sharesCount: Number(data.sharesCount) || 0,
            featured: Boolean(data.featured),
            status: data.status || "published",
            authorName: data.authorName || "আমাদের পুঠিয়া প্রতিনিধি",
            authorRole: data.authorRole || "স্টাফ রিপোর্টার",
            reporterLocation: data.reporterLocation || "পুঠিয়া, রাজশাহী",
            tags: Array.isArray(data.tags) ? data.tags : [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            createdBy: data.createdBy,
            verified: Boolean(data.verified)
          });
        });

        // Filter by category if requested
        let filtered = items;
        if (category && category !== "all") {
          if (category === "খেলা") {
            filtered = filtered.filter(i => i.category === "খেলা" || i.category === "খেলাধুলা");
          } else {
            filtered = filtered.filter(i => i.category === category);
          }
        }

        callback(filtered);
      },
      (error) => {
        console.error("Firestore onNewsSnapshot error:", error);
        // Fallback gracefully to seed items on network error
        const fallback = DEFAULT_NEWS_SEED.map((item, idx) => ({
          id: `seed-${idx + 1}`,
          ...item
        })) as NewsItem[];
        callback(fallback);
      }
    );
  } catch (err) {
    console.error("Error setting up onNewsSnapshot:", err);
    return () => {};
  }
};

/**
 * Real-time subscriber for Single News Item
 */
export const onSingleNewsSnapshot = (
  newsId: string,
  callback: (item: NewsItem | null) => void
): (() => void) => {
  if (!newsId) return () => {};
  const docRef = doc(db, NEWS_COLLECTION, newsId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        title: data.title || "",
        category: data.category || "অন্যান্য",
        content: data.content || "",
        summary: data.summary || "",
        image: data.image || "",
        date: data.date || "",
        time: data.time || "",
        views: Number(data.views) || 0,
        likesCount: Number(data.likesCount) || 0,
        likes: Array.isArray(data.likes) ? data.likes : [],
        commentsCount: Number(data.commentsCount) || 0,
        sharesCount: Number(data.sharesCount) || 0,
        featured: Boolean(data.featured),
        status: data.status || "published",
        authorName: data.authorName || "আমাদের পুঠিয়া প্রতিনিধি",
        authorRole: data.authorRole || "স্টাফ রিপোর্টার",
        reporterLocation: data.reporterLocation || "পুঠিয়া, রাজশাহী",
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        verified: Boolean(data.verified)
      });
    } else {
      callback(null);
    }
  });
};

/**
 * Real-time subscriber for comments on a specific news item
 */
export const onNewsCommentsSnapshot = (
  newsId: string,
  callback: (comments: NewsComment[]) => void
): (() => void) => {
  if (!newsId) return () => {};
  const commentsCol = collection(db, NEWS_COLLECTION, newsId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const list: NewsComment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        newsId,
        userId: data.userId || "",
        userName: data.userName || "নাগরিক",
        userPhoto: data.userPhoto,
        text: data.text || "",
        likesCount: Number(data.likesCount) || 0,
        likes: Array.isArray(data.likes) ? data.likes : [],
        createdAt: data.createdAt
      });
    });
    callback(list);
  }, (err) => {
    console.warn("Comments snapshot note:", err);
    callback([]);
  });
};

/**
 * Add a live comment to a news article
 */
export const addNewsComment = async (
  newsId: string,
  text: string,
  user: { uid: string; name?: string; email?: string; photoURL?: string }
): Promise<string> => {
  if (!newsId || !text.trim()) throw new Error("Comment text is required");

  const commentsCol = collection(db, NEWS_COLLECTION, newsId, "comments");
  const commentDoc = await addDoc(commentsCol, {
    newsId,
    userId: user?.uid || "anonymous",
    userName: user?.name || user?.email?.split('@')[0] || "পুঠিয়া নাগরিক",
    userPhoto: user?.photoURL || "",
    text: text.trim(),
    likesCount: 0,
    likes: [],
    createdAt: serverTimestamp()
  });

  // Increment comment counter on parent news document
  try {
    const newsDocRef = doc(db, NEWS_COLLECTION, newsId);
    await updateDoc(newsDocRef, {
      commentsCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Could not increment news commentsCount:", err);
  }

  return commentDoc.id;
};

/**
 * Delete a news comment
 */
export const deleteNewsComment = async (newsId: string, commentId: string): Promise<void> => {
  if (!newsId || !commentId) return;
  const commentRef = doc(db, NEWS_COLLECTION, newsId, "comments", commentId);
  await deleteDoc(commentRef);

  try {
    const newsDocRef = doc(db, NEWS_COLLECTION, newsId);
    await updateDoc(newsDocRef, {
      commentsCount: increment(-1),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Could not decrement news commentsCount:", err);
  }
};

/**
 * Real-time Like/Unlike a news article
 */
export const toggleNewsLike = async (
  newsId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  if (!newsId || !userId) throw new Error("Missing newsId or userId");
  const docRef = doc(db, NEWS_COLLECTION, newsId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error("News item not found");
  }

  const data = snap.data();
  const currentLikes: string[] = Array.isArray(data.likes) ? data.likes : [];
  const isLiked = currentLikes.includes(userId);

  if (isLiked) {
    await updateDoc(docRef, {
      likes: arrayRemove(userId),
      likesCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    return { liked: false, likesCount: Math.max(0, (data.likesCount || 1) - 1) };
  } else {
    await updateDoc(docRef, {
      likes: arrayUnion(userId),
      likesCount: increment(1),
      updatedAt: serverTimestamp()
    });
    return { liked: true, likesCount: (data.likesCount || 0) + 1 };
  }
};

// Throttle map to prevent view spamming
const viewThrottles = new Map<string, number>();

/**
 * Safely increment news view count
 */
export const incrementNewsView = async (newsId: string): Promise<void> => {
  if (!newsId || newsId.startsWith("seed-")) return;
  const now = Date.now();
  const lastView = viewThrottles.get(newsId) || 0;
  if (now - lastView < 60000) {
    // Throttled within 1 minute per session
    return;
  }
  viewThrottles.set(newsId, now);

  try {
    const docRef = doc(db, NEWS_COLLECTION, newsId);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (err) {
    console.warn("Could not increment news view:", err);
  }
};

/**
 * Create a new News Item (Admin / Super Admin)
 */
export const createNews = async (
  itemData: Partial<NewsItem>,
  user: { uid: string; email?: string; name?: string }
): Promise<string> => {
  const colRef = collection(db, NEWS_COLLECTION);
  const now = new Date();
  
  const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const bnDate = `${now.getDate().toLocaleString('bn-BD')} ${bnMonths[now.getMonth()]} ${now.getFullYear().toLocaleString('bn-BD').replace(/,/g, '')}`;
  const bnTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });

  const payload = {
    title: itemData.title?.trim() || "সংবাদ শিরোনাম",
    category: itemData.category || "উন্নয়ন",
    content: itemData.content?.trim() || "",
    summary: itemData.summary?.trim() || itemData.content?.slice(0, 120) || "",
    image: itemData.image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800",
    date: itemData.date || bnDate,
    time: itemData.time || bnTime,
    views: 0,
    likesCount: 0,
    likes: [],
    commentsCount: 0,
    sharesCount: 0,
    featured: Boolean(itemData.featured),
    status: itemData.status || "published",
    authorName: itemData.authorName || user.name || "আমাদের পুঠিয়া প্রতিনিধি",
    authorRole: itemData.authorRole || "প্রতিনিধি",
    reporterLocation: itemData.reporterLocation || "পুঠিয়া, রাজশাহী",
    tags: itemData.tags || [itemData.category || "সংবাদ", "পুঠিয়া"],
    verified: true,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(colRef, payload);

  // Audit logging
  await createAuditTrail({
    actorUid: user.uid,
    actorName: user.name || "Admin",
    actorRole: "admin",
    targetType: "system",
    targetId: docRef.id,
    action: "CREATE_NEWS",
    reason: "New local news article published",
    metadata: { title: payload.title, category: payload.category }
  }).catch(() => {});

  return docRef.id;
};

/**
 * Update an existing News Item (Admin / Super Admin)
 */
export const updateNews = async (
  newsId: string,
  itemData: Partial<NewsItem>,
  user: { uid: string; email?: string; name?: string }
): Promise<void> => {
  if (!newsId) throw new Error("News ID is required");
  const docRef = doc(db, NEWS_COLLECTION, newsId);

  const payload: Record<string, any> = {
    ...itemData,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid
  };
  delete payload.id;

  await updateDoc(docRef, payload);

  // Audit logging
  await createAuditTrail({
    actorUid: user.uid,
    actorName: user.name || "Admin",
    actorRole: "admin",
    targetType: "system",
    targetId: newsId,
    action: "UPDATE_NEWS",
    reason: "Local news article modified",
    metadata: { ...itemData }
  }).catch(() => {});
};

/**
 * Delete a News Item (Super Admin / Admin)
 */
export const deleteNews = async (
  newsId: string,
  user: { uid: string; email?: string; name?: string }
): Promise<void> => {
  if (!newsId) throw new Error("News ID is required");
  const docRef = doc(db, NEWS_COLLECTION, newsId);
  await deleteDoc(docRef);

  // Audit logging
  await createAuditTrail({
    actorUid: user.uid,
    actorName: user.name || "Admin",
    actorRole: "admin",
    targetType: "system",
    targetId: newsId,
    action: "DELETE_NEWS",
    reason: "Local news article removed",
    metadata: { deletedAt: new Date().toISOString() }
  }).catch(() => {});
};

/**
 * Submit a Citizen Journalist Report (নাগরিক সংবাদ প্রতিবেদন)
 */
export const submitCitizenReport = async (
  reportData: {
    reporterName: string;
    reporterPhone: string;
    reporterLocation: string;
    reporterContent: string;
    imageUrl?: string;
  },
  user?: { uid: string; email?: string }
): Promise<string> => {
  if (!reportData.reporterName || !reportData.reporterPhone || !reportData.reporterContent) {
    throw new Error("সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন");
  }

  const colRef = collection(db, CITIZEN_REPORTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    reporterName: reportData.reporterName.trim(),
    reporterPhone: reportData.reporterPhone.trim(),
    reporterLocation: reportData.reporterLocation.trim() || "পুঠিয়া",
    reporterContent: reportData.reporterContent.trim(),
    imageUrl: reportData.imageUrl || "",
    status: "pending",
    userId: user?.uid || null,
    createdAt: serverTimestamp()
  });

  return docRef.id;
};

/**
 * Real-time subscriber for Citizen Journalist Reports (Super Admin panel)
 */
export const onCitizenReportsSnapshot = (
  callback: (reports: CitizenNewsReport[]) => void
): (() => void) => {
  const colRef = collection(db, CITIZEN_REPORTS_COLLECTION);
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const reports: CitizenNewsReport[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        reporterName: data.reporterName || "",
        reporterPhone: data.reporterPhone || "",
        reporterLocation: data.reporterLocation || "",
        reporterContent: data.reporterContent || "",
        imageUrl: data.imageUrl || "",
        status: data.status || "pending",
        adminNotes: data.adminNotes || "",
        createdAt: data.createdAt,
        userId: data.userId
      });
    });
    callback(reports);
  }, (err) => {
    console.error("Citizen reports onSnapshot error:", err);
    callback([]);
  });
};

/**
 * Update Citizen Report Status (Approve / Reject)
 */
export const updateCitizenReportStatus = async (
  reportId: string,
  status: 'approved' | 'rejected' | 'pending',
  adminNotes?: string,
  user?: { uid: string }
): Promise<void> => {
  const docRef = doc(db, CITIZEN_REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, {
    status,
    adminNotes: adminNotes || "",
    reviewedAt: serverTimestamp(),
    reviewedBy: user?.uid || "admin"
  });
};

/**
 * 1-Click Convert Citizen Report to Live Published News
 */
export const convertCitizenReportToNews = async (
  report: CitizenNewsReport,
  user: { uid: string; name?: string }
): Promise<string> => {
  const newsId = await createNews({
    title: report.reporterContent.slice(0, 60) + (report.reporterContent.length > 60 ? "..." : ""),
    category: "সামাজিক",
    content: report.reporterContent,
    summary: report.reporterContent.slice(0, 120),
    image: report.imageUrl || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800",
    authorName: report.reporterName + " (নাগরিক সাংবাদিক)",
    authorRole: "নাগরিক প্রতিনিধি",
    reporterLocation: report.reporterLocation,
    status: "published",
    featured: false
  }, user);

  // Mark report as approved
  await updateCitizenReportStatus(report.id, "approved", `সংবাদ হিসেবে প্রকাশিত হয়েছে (News ID: ${newsId})`, user);

  return newsId;
};

/**
 * Seed initial news if collection is empty
 */
export const seedInitialNewsIfEmpty = async (): Promise<boolean> => {
  try {
    const colRef = collection(db, NEWS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return false; // Already has items
    }

    // Insert seeds
    for (const seed of DEFAULT_NEWS_SEED) {
      await addDoc(colRef, {
        ...seed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (err) {
    console.warn("Could not seed news:", err);
    return false;
  }
};

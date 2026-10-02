import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { compressImageToSafeFirestoreDataUrl } from "./mediaProcessingService";
import { cleanUndefined } from "../utils/firestoreUtils";

export type MemoryType = 'post' | 'photo' | 'video' | 'album' | 'event' | 'story';

export interface MemoryItem {
  id: string; // Unique memory virtual ID e.g. `mem_${collection}_${id}`
  originalId: string;
  originalCollection: 'discussions' | 'stories' | 'events';
  type: MemoryType;
  content?: string;
  title?: string;
  author: string;
  authorId: string;
  authorPhotoUrl?: string;
  authorBadge?: boolean;
  imageUrl?: string;
  gallery?: string[];
  videoUrl?: string;
  videoPoster?: string;
  originalDate: string; // ISO date string
  yearsAgo: number; // e.g. 1, 2, 3, 5
  anniversaryLabelBn: string; // e.g. "১ বছর আগে আজকের দিনে"
  formattedDateBn: string; // e.g. "২০ আগস্ট ২০২৫"
  originalLikes: number;
  originalCommentsCount: number;
  privacy: 'public' | 'friends' | 'only_me';
  reactions?: { [uid: string]: string }; // live reactions on memory
  eventDetails?: {
    venue?: string;
    organizer?: string;
    time?: string;
  };
  location?: string;
  tags?: string[];
  taggedUsers?: string[];
}

export interface HiddenPerson {
  id: string;
  name: string;
  avatar?: string;
}

export interface HiddenDateRange {
  id: string;
  label: string;
  type: 'specific_date' | 'month' | 'range';
  startDate?: string;
  endDate?: string;
  monthYear?: string; // YYYY-MM
}

export interface MemoryPreferences {
  userId: string;
  notificationsEnabled: boolean;
  hiddenMemories: string[]; // List of memory IDs or original post IDs hidden by user
  hiddenPeople: HiddenPerson[]; // List of users to exclude from memories
  hiddenDates: HiddenDateRange[]; // Dates/Months to hide from memories
  highlightFavoritesOnly?: boolean;
  updatedAt?: any;
}

export const BENGALI_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/\d/g, (digit) => BENGALI_NUMERALS[parseInt(digit, 10)]);
}

export function formatBengaliDate(dateObj: Date): string {
  const day = toBengaliNumber(dateObj.getDate());
  const month = BENGALI_MONTHS[dateObj.getMonth()];
  const year = toBengaliNumber(dateObj.getFullYear());
  return `${day} ${month} ${year}`;
}

export function getAnniversaryLabel(yearsAgo: number): string {
  if (yearsAgo <= 0) return "আজকের দিনে";
  return `${toBengaliNumber(yearsAgo)} বছর আগে আজকের দিনে`;
}

/**
 * Parses any Firestore timestamp, Date, or string into a valid JS Date
 */
export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val === 'number') return new Date(val);
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val.seconds) return new Date(val.seconds * 1000);
  return null;
}

/**
 * Get User Memory Preferences
 */
export async function getMemoryPreferences(userId: string): Promise<MemoryPreferences> {
  if (!userId) {
    return {
      userId: '',
      notificationsEnabled: true,
      hiddenMemories: [],
      hiddenPeople: [],
      hiddenDates: []
    };
  }

  try {
    const docRef = doc(db, "memory_preferences", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId,
        notificationsEnabled: data.notificationsEnabled ?? true,
        hiddenMemories: Array.isArray(data.hiddenMemories) ? data.hiddenMemories : [],
        hiddenPeople: Array.isArray(data.hiddenPeople) ? data.hiddenPeople : [],
        hiddenDates: Array.isArray(data.hiddenDates) ? data.hiddenDates : [],
        highlightFavoritesOnly: data.highlightFavoritesOnly ?? false
      };
    }
  } catch (err) {
    console.warn("Could not fetch memory preferences from Firestore:", err);
  }

  // Fallback to localStorage if offline/guest
  try {
    const local = localStorage.getItem(`memory_prefs_${userId}`);
    if (local) return JSON.parse(local);
  } catch {}

  return {
    userId,
    notificationsEnabled: true,
    hiddenMemories: [],
    hiddenPeople: [],
    hiddenDates: []
  };
}

/**
 * Save User Memory Preferences
 */
export async function saveMemoryPreferences(userId: string, prefs: Partial<MemoryPreferences>): Promise<void> {
  if (!userId) return;

  try {
    const docRef = doc(db, "memory_preferences", userId);
    await setDoc(docRef, {
      ...prefs,
      userId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Error saving memory preferences to Firestore:", err);
  }

  try {
    const existing = await getMemoryPreferences(userId);
    localStorage.setItem(`memory_prefs_${userId}`, JSON.stringify({ ...existing, ...prefs }));
  } catch {}
}

/**
 * Checks if a specific post/memory is allowed by user's privacy and hiding preferences
 */
export function isMemoryAllowed(
  item: {
    id: string;
    authorId?: string;
    taggedUsers?: string[];
    createdAtDate: Date;
  },
  prefs: MemoryPreferences,
  currentUserId: string
): boolean {
  // 1. Check if memory is explicitly hidden
  if (prefs.hiddenMemories.includes(item.id) || prefs.hiddenMemories.includes(`mem_discussions_${item.id}`)) {
    return false;
  }

  // 2. Check if author or tagged people are hidden
  if (item.authorId && prefs.hiddenPeople.some(p => p.id === item.authorId)) {
    return false;
  }
  if (item.taggedUsers && item.taggedUsers.length > 0) {
    const hasBlockedPerson = item.taggedUsers.some(uid => prefs.hiddenPeople.some(p => p.id === uid));
    if (hasBlockedPerson) return false;
  }

  // 3. Check if date or month is hidden
  const year = item.createdAtDate.getFullYear();
  const month = item.createdAtDate.getMonth() + 1; // 1-12
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const dateIso = item.createdAtDate.toISOString().slice(0, 10);

  for (const hd of prefs.hiddenDates) {
    if (hd.type === 'month' && hd.monthYear === monthStr) return false;
    if (hd.type === 'specific_date' && hd.startDate === dateIso) return false;
    if (hd.type === 'range' && hd.startDate && hd.endDate) {
      if (dateIso >= hd.startDate && dateIso <= hd.endDate) return false;
    }
  }

  return true;
}

/**
 * Scan and Fetch Today's Memories (On This Day)
 */
export async function fetchTodayMemories(
  userId: string,
  targetDate: Date = new Date()
): Promise<MemoryItem[]> {
  if (!userId) return [];

  const prefs = await getMemoryPreferences(userId);
  const targetMonth = targetDate.getMonth(); // 0-11
  const targetDay = targetDate.getDate(); // 1-31
  const currentYear = targetDate.getFullYear();

  const memories: MemoryItem[] = [];

  try {
    // 1. Scan discussions collection
    const discRef = collection(db, "discussions");
    const qDisc = query(discRef, limit(250));
    const discSnap = await getDocs(qDisc);

    discSnap.forEach(docSnap => {
      const data = docSnap.data();
      const date = parseDate(data.createdAt);
      if (!date) return;

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth();
      const itemDay = date.getDate();

      // Check if it matches today's month & day, and is from a previous year
      if (itemMonth === targetMonth && itemDay === targetDay && itemYear < currentYear) {
        const yearsAgo = currentYear - itemYear;

        // Privacy check: only author, public or permitted users can see
        const isAuthor = data.authorId === userId;
        const isPublic = !data.audience || data.audience === 'Public' || data.privacy === 'public';
        const isOnlyMe = data.audience === 'Only Me' || data.privacy === 'only_me';

        if (isOnlyMe && !isAuthor) return;
        if (!isAuthor && !isPublic) return;

        // Check user preferences
        if (!isMemoryAllowed({
          id: docSnap.id,
          authorId: data.authorId,
          taggedUsers: data.taggedUsers,
          createdAtDate: date
        }, prefs, userId)) {
          return;
        }

        // Determine Memory Type
        let type: MemoryType = 'post';
        if (data.videoUrl) type = 'video';
        else if (data.gallery && data.gallery.length > 1) type = 'album';
        else if (data.imageUrl || (data.gallery && data.gallery.length === 1)) type = 'photo';
        else if (data.type === 'event' || data.category === 'events') type = 'event';

        memories.push({
          id: `mem_discussions_${docSnap.id}`,
          originalId: docSnap.id,
          originalCollection: 'discussions',
          type,
          content: data.content || '',
          title: data.title,
          author: data.author || 'সম্মানিত নাগরিক',
          authorId: data.authorId || '',
          authorPhotoUrl: data.authorPhotoUrl,
          authorBadge: data.authorBadge,
          imageUrl: data.imageUrl,
          gallery: data.gallery,
          videoUrl: data.videoUrl,
          videoPoster: data.videoPoster,
          originalDate: date.toISOString(),
          yearsAgo,
          anniversaryLabelBn: getAnniversaryLabel(yearsAgo),
          formattedDateBn: formatBengaliDate(date),
          originalLikes: data.likes || (data.likedBy ? data.likedBy.length : 0),
          originalCommentsCount: data.commentsCount || 0,
          privacy: isOnlyMe ? 'only_me' : data.audience === 'Friends' ? 'friends' : 'public',
          location: data.union || data.location,
          tags: data.tags,
          taggedUsers: data.taggedUsers,
          reactions: data.memoryReactions || {}
        });
      }
    });

    // 2. Scan stories collection if available
    try {
      const storiesRef = collection(db, "stories");
      const qStories = query(storiesRef, limit(100));
      const storySnap = await getDocs(qStories);

      storySnap.forEach(sDoc => {
        const data = sDoc.data();
        const date = parseDate(data.createdAt);
        if (!date) return;

        const itemYear = date.getFullYear();
        const itemMonth = date.getMonth();
        const itemDay = date.getDate();

        if (itemMonth === targetMonth && itemDay === targetDay && itemYear < currentYear) {
          const yearsAgo = currentYear - itemYear;
          if (data.authorId === userId || data.userId === userId) {
            memories.push({
              id: `mem_stories_${sDoc.id}`,
              originalId: sDoc.id,
              originalCollection: 'stories',
              type: 'story',
              content: data.caption || data.text || '',
              author: data.userName || data.author || 'সম্মানিত নাগরিক',
              authorId: data.userId || data.authorId || '',
              authorPhotoUrl: data.userPhoto || data.authorPhotoUrl,
              imageUrl: data.mediaUrl || data.imageUrl,
              originalDate: date.toISOString(),
              yearsAgo,
              anniversaryLabelBn: getAnniversaryLabel(yearsAgo),
              formattedDateBn: formatBengaliDate(date),
              originalLikes: 0,
              originalCommentsCount: 0,
              privacy: 'public'
            });
          }
        }
      });
    } catch {}

  } catch (err) {
    console.error("Error generating today's memories:", err);
  }

  // Sort by latest anniversary (1 year ago first, then 2, 3...)
  return memories.sort((a, b) => a.yearsAgo - b.yearsAgo);
}

/**
 * Fetch Archive Memories with Filter support (Year, Month, Type, Keyword)
 */
export async function fetchArchiveMemories(
  userId: string,
  filter?: {
    year?: number | 'all';
    month?: number | 'all';
    type?: MemoryType | 'all';
    keyword?: string;
    location?: string;
  }
): Promise<MemoryItem[]> {
  if (!userId) return [];

  const prefs = await getMemoryPreferences(userId);
  const currentYear = new Date().getFullYear();
  const memories: MemoryItem[] = [];

  try {
    const discRef = collection(db, "discussions");
    const qDisc = query(discRef, limit(300));
    const snap = await getDocs(qDisc);

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const date = parseDate(data.createdAt);
      if (!date) return;

      const itemYear = date.getFullYear();
      const itemMonth = date.getMonth(); // 0-11

      // Must be older than 30 days or previous years
      const isPast = date.getTime() < (Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (!isPast) return;

      const yearsAgo = Math.max(0, currentYear - itemYear);

      // Privacy check
      const isAuthor = data.authorId === userId;
      const isPublic = !data.audience || data.audience === 'Public' || data.privacy === 'public';
      const isOnlyMe = data.audience === 'Only Me' || data.privacy === 'only_me';

      if (isOnlyMe && !isAuthor) return;
      if (!isAuthor && !isPublic) return;

      // User hide check
      if (!isMemoryAllowed({
        id: docSnap.id,
        authorId: data.authorId,
        taggedUsers: data.taggedUsers,
        createdAtDate: date
      }, prefs, userId)) {
        return;
      }

      // Filter matches
      if (filter?.year && filter.year !== 'all' && itemYear !== filter.year) return;
      if (filter?.month !== undefined && filter.month !== 'all' && itemMonth !== filter.month) return;

      let type: MemoryType = 'post';
      if (data.videoUrl) type = 'video';
      else if (data.gallery && data.gallery.length > 1) type = 'album';
      else if (data.imageUrl || (data.gallery && data.gallery.length === 1)) type = 'photo';
      else if (data.type === 'event' || data.category === 'events') type = 'event';

      if (filter?.type && filter.type !== 'all' && type !== filter.type) return;

      if (filter?.location && data.union !== filter.location && data.location !== filter.location) return;

      if (filter?.keyword && filter.keyword.trim() !== "") {
        const kw = filter.keyword.toLowerCase().trim();
        const textMatch = (data.content || '').toLowerCase().includes(kw) ||
                          (data.title || '').toLowerCase().includes(kw) ||
                          (data.author || '').toLowerCase().includes(kw);
        if (!textMatch) return;
      }

      memories.push({
        id: `mem_discussions_${docSnap.id}`,
        originalId: docSnap.id,
        originalCollection: 'discussions',
        type,
        content: data.content || '',
        title: data.title,
        author: data.author || 'সম্মানিত নাগরিক',
        authorId: data.authorId || '',
        authorPhotoUrl: data.authorPhotoUrl,
        authorBadge: data.authorBadge,
        imageUrl: data.imageUrl,
        gallery: data.gallery,
        videoUrl: data.videoUrl,
        videoPoster: data.videoPoster,
        originalDate: date.toISOString(),
        yearsAgo,
        anniversaryLabelBn: getAnniversaryLabel(yearsAgo),
        formattedDateBn: formatBengaliDate(date),
        originalLikes: data.likes || 0,
        originalCommentsCount: data.commentsCount || 0,
        privacy: isOnlyMe ? 'only_me' : data.audience === 'Friends' ? 'friends' : 'public',
        location: data.union || data.location,
        tags: data.tags,
        taggedUsers: data.taggedUsers,
        reactions: data.memoryReactions || {}
      });
    });
  } catch (err) {
    console.error("Error fetching archive memories:", err);
  }

  // Sort newest original date to oldest
  return memories.sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
}

/**
 * React to a Memory (e.g. like, love, haha, wow, sad, angry)
 */
export async function reactToMemory(
  memory: MemoryItem,
  userId: string,
  reactionType: string
): Promise<void> {
  if (!userId || !memory.originalId) return;

  try {
    const docRef = doc(db, memory.originalCollection, memory.originalId);
    await updateDoc(docRef, {
      [`memoryReactions.${userId}`]: reactionType
    });
  } catch (err) {
    console.warn("Could not update reaction in firestore:", err);
  }
}

/**
 * Hide a specific memory from appearing in user's memory feed
 */
export async function hideMemory(userId: string, memoryId: string): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const updated = Array.from(new Set([...prefs.hiddenMemories, memoryId]));
  await saveMemoryPreferences(userId, { hiddenMemories: updated });
}

/**
 * Unhide a specific memory
 */
export async function unhideMemory(userId: string, memoryId: string): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const updated = prefs.hiddenMemories.filter(id => id !== memoryId);
  await saveMemoryPreferences(userId, { hiddenMemories: updated });
}

/**
 * Hide memories involving a specific person
 */
export async function hidePersonFromMemories(userId: string, person: HiddenPerson): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const existing = prefs.hiddenPeople.filter(p => p.id !== person.id);
  await saveMemoryPreferences(userId, { hiddenPeople: [...existing, person] });
}

/**
 * Unhide a person
 */
export async function unhidePersonFromMemories(userId: string, personId: string): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const updated = prefs.hiddenPeople.filter(p => p.id !== personId);
  await saveMemoryPreferences(userId, { hiddenPeople: updated });
}

/**
 * Hide memories on a specific date or month
 */
export async function hideDateFromMemories(userId: string, dateRange: HiddenDateRange): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const existing = prefs.hiddenDates.filter(d => d.id !== dateRange.id);
  await saveMemoryPreferences(userId, { hiddenDates: [...existing, dateRange] });
}

/**
 * Unhide date filter
 */
export async function unhideDateFromMemories(userId: string, dateRangeId: string): Promise<void> {
  if (!userId) return;
  const prefs = await getMemoryPreferences(userId);
  const updated = prefs.hiddenDates.filter(d => d.id !== dateRangeId);
  await saveMemoryPreferences(userId, { hiddenDates: updated });
}

/**
 * Enable/Disable daily memory notifications
 */
export async function toggleMemoryNotifications(userId: string, enabled: boolean): Promise<void> {
  if (!userId) return;
  await saveMemoryPreferences(userId, { notificationsEnabled: enabled });
}

/**
 * Execute Sharing a Memory:
 * Publishes a new Post in Discussions, Story, Group, or Direct Message with memory context
 */
export async function executeShareMemory(params: {
  memory: MemoryItem;
  user: any;
  userProfile: any;
  shareTarget: 'feed' | 'story' | 'group' | 'message';
  caption: string;
  privacy: 'Public' | 'Friends' | 'Only Me';
  selectedGroup?: { id: string; name: string };
  selectedRecipients?: string[];
}): Promise<void> {
  const { memory, user, userProfile, shareTarget, caption, privacy, selectedGroup, selectedRecipients } = params;

  const authorName = userProfile?.name || user?.displayName || 'সম্মানিত নাগরিক';
  const authorPhoto = userProfile?.photoURL || user?.photoURL || '';
  const authorUnion = userProfile?.union || 'পুঠিয়া ইউনিয়ন';

  if (shareTarget === 'feed') {
    await addDoc(collection(db, "discussions"), cleanUndefined({
      title: `${memory.anniversaryLabelBn} — স্মৃতি শেয়ার`,
      content: caption.trim() || `${memory.anniversaryLabelBn} এই পোস্টটি শেয়ার করা হয়েছিল`,
      author: authorName,
      authorId: user.uid,
      authorBadge: userProfile?.verified || false,
      authorPhotoUrl: authorPhoto,
      union: authorUnion,
      category: 'general',
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      views: 0,
      likedBy: [],
      reactions: {},
      pinned: false,
      trending: false,
      createdAt: serverTimestamp(),
      audience: privacy,
      isMemoryShare: true,
      sharedMemory: {
        id: memory.id,
        originalId: memory.originalId,
        originalCollection: memory.originalCollection,
        type: memory.type,
        content: memory.content || '',
        author: memory.author || '',
        authorId: memory.authorId || '',
        authorPhotoUrl: memory.authorPhotoUrl || '',
        originalDate: memory.originalDate || '',
        yearsAgo: memory.yearsAgo || 0,
        anniversaryLabelBn: memory.anniversaryLabelBn || '',
        formattedDateBn: memory.formattedDateBn || '',
        imageUrl: memory.imageUrl || '',
        gallery: memory.gallery || [],
        videoUrl: memory.videoUrl || ''
      }
    }));
  } else if (shareTarget === 'story') {
    let storyMedia = memory.imageUrl || memory.gallery?.[0] || '';
    if (storyMedia && storyMedia.startsWith('data:') && storyMedia.length > 200000) {
      storyMedia = await compressImageToSafeFirestoreDataUrl(storyMedia, 1080, 180000);
    }

    await addDoc(collection(db, "stories"), cleanUndefined({
      userId: user.uid,
      userName: authorName,
      userPhoto: authorPhoto,
      caption: caption || `${memory.anniversaryLabelBn} স্মৃতি`,
      mediaUrl: storyMedia,
      type: memory.videoUrl ? 'video' : 'image',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isMemoryStory: true,
      anniversaryLabel: memory.anniversaryLabelBn || ''
    }));
  } else if (shareTarget === 'group' && selectedGroup) {
    await addDoc(collection(db, "discussions"), cleanUndefined({
      title: `${memory.anniversaryLabelBn} — গ্রুপ স্মৃতি শেয়ার`,
      content: caption || `${memory.anniversaryLabelBn} স্মৃতি শেয়ার`,
      author: authorName,
      authorId: user.uid,
      authorBadge: userProfile?.verified || false,
      authorPhotoUrl: authorPhoto,
      union: authorUnion,
      category: 'groups',
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      views: 0,
      likedBy: [],
      reactions: {},
      pinned: false,
      trending: false,
      createdAt: serverTimestamp(),
      audience: 'Public',
      isMemoryShare: true,
      sharedMemory: {
        id: memory.id,
        originalId: memory.originalId,
        content: memory.content || '',
        author: memory.author || '',
        originalDate: memory.originalDate || '',
        yearsAgo: memory.yearsAgo || 0,
        anniversaryLabelBn: memory.anniversaryLabelBn || '',
        formattedDateBn: memory.formattedDateBn || '',
        imageUrl: memory.imageUrl || '',
        gallery: memory.gallery || []
      }
    }));
  } else if (shareTarget === 'message' && selectedRecipients && selectedRecipients.length > 0) {
    const promises = selectedRecipients.map(recId => {
      return addDoc(collection(db, "messages"), cleanUndefined({
        senderId: user.uid,
        senderName: authorName,
        senderPhoto: authorPhoto,
        recipientId: recId,
        type: 'memory_share',
        content: caption || `একটি স্মৃতি শেয়ার করেছেন (${memory.anniversaryLabelBn})`,
        sharedMemory: {
          id: memory.id,
          title: memory.title || '',
          content: memory.content || '',
          author: memory.author || '',
          originalDate: memory.originalDate || '',
          imageUrl: memory.imageUrl || ''
        },
        createdAt: serverTimestamp(),
        read: false
      }));
    });
    await Promise.all(promises);
  }
}

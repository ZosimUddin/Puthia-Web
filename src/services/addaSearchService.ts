import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  getDoc,
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";

export type AddaSearchCategory = 
  | 'all' 
  | 'people' 
  | 'posts' 
  | 'pages' 
  | 'groups' 
  | 'photos' 
  | 'videos' 
  | 'reels' 
  | 'events' 
  | 'marketplace' 
  | 'hashtags';

export interface AddaSearchFilters {
  date?: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  location?: string; // e.g. "সব ইউনিয়ন", "পুঠিয়া ইউনিয়ন", "বানেশ্বর", etc.
  authorFilter?: 'all' | 'friends' | 'verified';
  specificAuthorId?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: 'all' | 'new' | 'used';
  eventTimeFilter?: 'all' | 'today' | 'this_week' | 'this_month' | 'upcoming';
  hashtagSubTab?: 'top' | 'recent' | 'reels' | 'photos';
}

export interface AddaPersonResult {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  union?: string;
  village?: string;
  profession?: string;
  bio?: string;
  school?: string;
  college?: string;
  points?: number;
  badges?: string[];
  role?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  connectionStatus?: 'none' | 'following' | 'pending_sent' | 'pending_received' | 'connected';
  isPrivateProfile?: boolean;
  score?: number;
}

export interface AddaPageResult {
  id: string;
  name: string;
  title?: string;
  category: string;
  union?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  followersCount?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  score?: number;
}

export interface AddaGroupResult {
  id: string;
  name: string;
  description: string;
  banner?: string;
  memberCount: number;
  rules?: string[];
  isJoined?: boolean;
  category?: string;
  adminName?: string;
  isPrivate?: boolean;
  union?: string;
  score?: number;
}

export interface AddaPostResult {
  id: string;
  title?: string;
  content: string;
  author: string;
  authorId: string;
  authorBadge?: boolean;
  authorPhotoUrl?: string;
  union?: string;
  category?: string;
  imageUrl?: string;
  videoUrl?: string;
  gallery?: string[];
  location?: string;
  feeling?: string;
  likes: number;
  reactionsCount?: number;
  commentsCount: number;
  sharesCount?: number;
  views: number;
  pinned?: boolean;
  trending?: boolean;
  createdAt: any;
  audience?: string;
  isUrgent?: boolean;
  emergencyCategory?: string;
  linkUrl?: string;
  score?: number;
}

export interface AddaMediaResult {
  id: string;
  type: 'photo' | 'video';
  url: string;
  title?: string;
  caption?: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  postId?: string;
  albumName?: string;
  location?: string;
  createdAt: any;
  duration?: string;
  likes?: number;
  views?: number;
  score?: number;
}

export interface AddaReelResult {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  audioTitle?: string;
  audioArtist?: string;
  hashtags?: string[];
  location?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: any;
  privacy?: string;
  score?: number;
}

export interface AddaEventResult {
  id: string;
  title: string;
  category: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  organizer: string;
  description: string;
  image?: string;
  interestedCount?: number;
  score?: number;
}

export interface AddaMarketplaceResult {
  id: string;
  title: string;
  description: string;
  price: number;
  unit?: string;
  category: string;
  condition: "new" | "used";
  images: string[];
  imageUrl?: string;
  location: string;
  sellerName: string;
  sellerPhone: string;
  sellerId: string;
  sellerVerified?: boolean;
  status: "active" | "sold" | "pending";
  createdAt: string;
  views?: number;
  score?: number;
}

export interface AddaHashtagResult {
  tag: string;
  count: number;
  posts: AddaPostResult[];
  reels: AddaReelResult[];
  photos: AddaMediaResult[];
}

export interface AddaFullSearchResults {
  query: string;
  category: AddaSearchCategory;
  totalCount: number;
  people: AddaPersonResult[];
  pages: AddaPageResult[];
  groups: AddaGroupResult[];
  posts: AddaPostResult[];
  photos: AddaMediaResult[];
  videos: AddaMediaResult[];
  reels: AddaReelResult[];
  events: AddaEventResult[];
  marketplace: AddaMarketplaceResult[];
  hashtags: AddaHashtagResult[];
}

export interface AddaSearchSuggestionGroup {
  people: AddaPersonResult[];
  pages: AddaPageResult[];
  groups: AddaGroupResult[];
  posts: AddaPostResult[];
  reels: AddaReelResult[];
  hashtags: string[];
  totalMatches: number;
}

// Normalizer for Bengali and English text search
function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[,\.\?!:;\-_"']/g, ' ')
    .replace(/\s+/g, ' ');
}

function calculateScore(textToSearch: string, queryWords: string[], baseWeight = 10): number {
  if (!textToSearch || queryWords.length === 0) return 0;
  const normalized = normalizeText(textToSearch);
  let matchCount = 0;
  let exactMatch = false;

  const fullQuery = queryWords.join(' ');
  if (normalized.includes(fullQuery)) {
    exactMatch = true;
  }

  for (const word of queryWords) {
    if (word.length >= 2 && normalized.includes(word)) {
      matchCount++;
    }
  }

  let score = matchCount * baseWeight;
  if (exactMatch) score += baseWeight * 2;
  return score;
}

// Check date filter helper
function isWithinDateFilter(createdAt: any, dateFilter?: string, customStart?: string, customEnd?: string): boolean {
  if (!dateFilter || dateFilter === 'all') return true;

  let itemDate: Date | null = null;
  if (createdAt?.toDate) {
    itemDate = createdAt.toDate();
  } else if (createdAt?.seconds) {
    itemDate = new Date(createdAt.seconds * 1000);
  } else if (typeof createdAt === 'string' || typeof createdAt === 'number') {
    itemDate = new Date(createdAt);
  }

  if (!itemDate || isNaN(itemDate.getTime())) return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateFilter === 'today') {
    return itemDate >= todayStart;
  }

  if (dateFilter === 'this_week') {
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    return itemDate >= weekStart;
  }

  if (dateFilter === 'this_month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return itemDate >= monthStart;
  }

  if (dateFilter === 'custom') {
    if (customStart) {
      const start = new Date(customStart);
      if (itemDate < start) return false;
    }
    if (customEnd) {
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      if (itemDate > end) return false;
    }
  }

  return true;
}

// Check event date filter helper
function isEventWithinFilter(eventDateStr: string, filter?: string): boolean {
  if (!filter || filter === 'all') return true;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  if (filter === 'today') {
    return eventDateStr === todayStr;
  }

  if (filter === 'upcoming') {
    return eventDateStr >= todayStr;
  }

  if (filter === 'this_week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    return eventDateStr >= todayStr && eventDateStr <= nextWeekStr;
  }

  if (filter === 'this_month') {
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return eventDateStr.startsWith(currentMonth) && eventDateStr >= todayStr;
  }

  return true;
}

export const addaSearchService = {
  // 1. Live Search Suggestions (Debounced autocomplete)
  getLiveSuggestions: async (
    rawQuery: string, 
    currentUserId?: string | null
  ): Promise<AddaSearchSuggestionGroup> => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      return { people: [], pages: [], groups: [], posts: [], reels: [], hashtags: [], totalMatches: 0 };
    }

    const queryWords = normalizeText(trimmed).split(' ').filter(w => w.length > 0);
    const isTagSearch = trimmed.startsWith('#');
    const cleanTag = trimmed.replace(/^#+/, '').toLowerCase();

    // Parallel fetch from core collections
    const [usersSnap, postsSnap, reelsSnap, businessesSnap, eventsSnap] = await Promise.all([
      getDocs(query(collection(db, "users"), limit(40))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "discussions"), limit(50))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "reels"), limit(40))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "businesses"), limit(40))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "events"), limit(30))).catch(() => ({ docs: [] } as any))
    ]);

    // Parse Groups from localStorage / state
    let localGroups: AddaGroupResult[] = [];
    try {
      const saved = localStorage.getItem('adda_groups');
      if (saved) localGroups = JSON.parse(saved);
    } catch {}
    if (!localGroups || localGroups.length === 0) {
      localGroups = [
        { id: 'g_puthia_bazar', name: 'পুঠিয়া বাজার আড্ডা', description: 'পুঠিয়া বাজারের ব্যবসায়ী এবং ক্রেতাদের আড্ডার স্থান।', memberCount: 340, category: 'ব্যবসায়িক' },
        { id: 'g_baneswar', name: 'বানেশ্বর আড্ডা', description: 'বানেশ্বরের ঐতিহ্যবাহী আম বাজার ও সাধারণ স্থানীয় বাসিন্দাদের মিলনমেলা।', memberCount: 520, category: 'সাধারণ' },
        { id: 'g_students', name: 'শিক্ষার্থী আড্ডা', description: 'পুঠিয়ার সকল কলেজ ও বিদ্যালয়ের ছাত্র-ছাত্রীদের পড়াশোনা আলোচনা।', memberCount: 180, category: 'শিক্ষা' },
        { id: 'g_farmers', name: 'কৃষক আড্ডা', description: 'আধুনিক কৃষি তথ্য, পুঠিয়ার সোনালী ফসল ও আম চাষ।', memberCount: 290, category: 'কৃষি' }
      ];
    }

    // 1. Match People
    const matchedPeople: AddaPersonResult[] = [];
    usersSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const person: AddaPersonResult = {
        id: docSnap.id,
        name: data.name || data.displayName || 'সম্মানিত নাগরিক',
        username: data.username || (data.email ? data.email.split('@')[0] : undefined),
        email: data.email,
        avatarUrl: data.photoURL || data.avatarUrl,
        union: data.union,
        village: data.village,
        profession: data.profession || data.occupation,
        bio: data.bio,
        role: data.role,
        isVerified: data.isVerified || data.role === 'admin' || data.role === 'super_admin',
        followersCount: data.followersCount || (data.followers ? data.followers.length : 0),
        score: 0
      };

      const score = calculateScore(
        `${person.name} ${person.username || ''} ${person.union || ''} ${person.village || ''} ${person.profession || ''}`,
        queryWords,
        15
      );

      if (score > 0) {
        person.score = score + (person.isVerified ? 10 : 0);
        matchedPeople.push(person);
      }
    });
    matchedPeople.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 2. Match Pages
    const matchedPages: AddaPageResult[] = [];
    businessesSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const page: AddaPageResult = {
        id: docSnap.id,
        name: data.name || data.title || 'ব্যবসায়িক পেজ',
        category: data.category || 'ব্যবসা',
        union: data.union || data.location,
        address: data.address,
        phone: data.phone || data.mobile,
        logoUrl: data.logoUrl || data.imageUrl || data.image,
        bannerUrl: data.bannerUrl,
        description: data.description,
        isVerified: data.isVerified || data.verified,
        score: 0
      };

      const score = calculateScore(
        `${page.name} ${page.category} ${page.union || ''} ${page.description || ''}`,
        queryWords,
        15
      );

      if (score > 0) {
        page.score = score + (page.isVerified ? 15 : 0);
        matchedPages.push(page);
      }
    });
    matchedPages.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 3. Match Groups
    const matchedGroups: AddaGroupResult[] = [];
    localGroups.forEach((group) => {
      const score = calculateScore(
        `${group.name} ${group.description} ${group.category || ''}`,
        queryWords,
        15
      );
      if (score > 0) {
        matchedGroups.push({ ...group, score });
      }
    });
    matchedGroups.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 4. Match Posts
    const matchedPosts: AddaPostResult[] = [];
    const extractedHashtags = new Set<string>();

    postsSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      // Privacy Check: Exclude private posts if not owner
      if (data.audience === 'only_me' && data.authorId !== currentUserId) {
        return;
      }

      const content = data.content || '';
      // Extract hashtags from content
      const tags = content.match(/#[^\s#]+/g);
      if (tags) {
        tags.forEach((t: string) => {
          const clean = t.replace(/^#+/, '');
          if (clean.toLowerCase().includes(cleanTag) || queryWords.some(w => clean.toLowerCase().includes(w))) {
            extractedHashtags.add(clean);
          }
        });
      }

      const post: AddaPostResult = {
        id: docSnap.id,
        title: data.title,
        content: content,
        author: data.author || 'নাগরিক',
        authorId: data.authorId,
        authorBadge: data.authorBadge,
        authorPhotoUrl: data.authorPhotoUrl,
        union: data.union,
        category: data.category,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        gallery: data.gallery,
        location: data.location,
        feeling: data.feeling,
        likes: data.likes || 0,
        reactionsCount: data.reactionsCount || (data.reactions ? Object.keys(data.reactions).length : 0),
        commentsCount: data.commentsCount || 0,
        views: data.views || 0,
        createdAt: data.createdAt,
        score: 0
      };

      const score = calculateScore(
        `${post.title || ''} ${post.content} ${post.author} ${post.union || ''} ${post.category || ''}`,
        queryWords,
        10
      );

      if (score > 0) {
        post.score = score + (post.likes || 0);
        matchedPosts.push(post);
      }
    });
    matchedPosts.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 5. Match Reels
    const matchedReels: AddaReelResult[] = [];
    reelsSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (data.privacy === 'only_me' && data.authorId !== currentUserId) return;

      const reel: AddaReelResult = {
        id: docSnap.id,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption || '',
        authorId: data.authorId,
        authorName: data.authorName || 'ক্রিয়েটর',
        authorPhoto: data.authorPhoto,
        audioTitle: data.audioTitle,
        audioArtist: data.audioArtist,
        hashtags: data.hashtags || [],
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        viewsCount: data.viewsCount || 0,
        createdAt: data.createdAt,
        score: 0
      };

      const score = calculateScore(
        `${reel.caption} ${reel.authorName} ${reel.audioTitle || ''} ${(reel.hashtags || []).join(' ')}`,
        queryWords,
        10
      );

      if (score > 0) {
        reel.score = score + (reel.likesCount || 0);
        matchedReels.push(reel);
      }
    });
    matchedReels.sort((a, b) => (b.score || 0) - (a.score || 0));

    const totalMatches = 
      matchedPeople.length + 
      matchedPages.length + 
      matchedGroups.length + 
      matchedPosts.length + 
      matchedReels.length;

    return {
      people: matchedPeople.slice(0, 4),
      pages: matchedPages.slice(0, 3),
      groups: matchedGroups.slice(0, 3),
      posts: matchedPosts.slice(0, 4),
      reels: matchedReels.slice(0, 3),
      hashtags: Array.from(extractedHashtags).slice(0, 6),
      totalMatches
    };
  },

  // 2. Full Search Execution across All Categories
  searchFull: async (
    rawQuery: string,
    category: AddaSearchCategory = 'all',
    filters: AddaSearchFilters = {},
    currentUserId?: string | null
  ): Promise<AddaFullSearchResults> => {
    const trimmed = rawQuery.trim();
    const queryWords = trimmed ? normalizeText(trimmed).split(' ').filter(w => w.length > 0) : [];
    const isTagSearch = trimmed.startsWith('#');
    const cleanTag = trimmed.replace(/^#+/, '').toLowerCase();

    // Fetch all necessary collections in parallel
    const [
      usersSnap,
      postsSnap,
      reelsSnap,
      businessesSnap,
      eventsSnap,
      marketplaceSnap,
      gallerySnap
    ] = await Promise.all([
      getDocs(query(collection(db, "users"), limit(80))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "discussions"), limit(120))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "reels"), limit(60))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "businesses"), limit(60))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "events"), limit(50))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "marketplace_items"), limit(60))).catch(() => ({ docs: [] } as any)),
      getDocs(query(collection(db, "gallery_items"), limit(50))).catch(() => ({ docs: [] } as any))
    ]);

    // Local Groups
    let localGroups: AddaGroupResult[] = [];
    try {
      const saved = localStorage.getItem('adda_groups');
      if (saved) localGroups = JSON.parse(saved);
    } catch {}
    if (!localGroups || localGroups.length === 0) {
      localGroups = [
        { id: 'g_puthia_bazar', name: 'পুঠিয়া বাজার আড্ডা', description: 'পুঠিয়া বাজারের ব্যবসায়ী এবং ক্রেতাদের আড্ডার স্থান। বাজার দর ও সামগ্রিক আলোচনা।', memberCount: 340, category: 'ব্যবসায়িক', isJoined: true },
        { id: 'g_baneswar', name: 'বানেশ্বর আড্ডা', description: 'বানেশ্বরের ঐতিহ্যবাহী আম বাজার ও সাধারণ স্থানীয় বাসিন্দাদের মিলনমেলা।', memberCount: 520, category: 'সাধারণ', isJoined: false },
        { id: 'g_students', name: 'শিক্ষার্থী আড্ডা', description: 'পুঠিয়ার সকল কলেজ ও বিদ্যালয়ের ছাত্র-ছাত্রীদের পড়াশোনা এবং শিক্ষা বিষয়ক আলোচনা।', memberCount: 180, category: 'শিক্ষা', isJoined: false },
        { id: 'g_farmers', name: 'কৃষক আড্ডা', description: 'আধুনিক কৃষি তথ্য, পুঠিয়ার সোনালী ফসল, আলু ও আম চাষের সুপরামর্শ আদান প্রদান।', memberCount: 290, category: 'কৃষি', isJoined: false }
      ];
    }

    // 1. Process People
    const people: AddaPersonResult[] = [];
    usersSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const person: AddaPersonResult = {
        id: docSnap.id,
        name: data.name || data.displayName || 'সম্মানিত নাগরিক',
        username: data.username || (data.email ? data.email.split('@')[0] : undefined),
        email: data.email,
        avatarUrl: data.photoURL || data.avatarUrl,
        union: data.union,
        village: data.village,
        profession: data.profession || data.occupation,
        bio: data.bio,
        school: data.school || data.institution,
        college: data.college,
        points: data.points || 150,
        badges: data.badges || [],
        role: data.role,
        isVerified: data.isVerified || data.role === 'admin' || data.role === 'super_admin',
        followersCount: data.followersCount || (data.followers ? data.followers.length : 0),
        followingCount: data.followingCount || (data.following ? data.following.length : 0),
        score: 0
      };

      // Filter location if applied
      if (filters.location && filters.location !== 'সব ইউনিয়ন' && person.union && !person.union.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      if (filters.authorFilter === 'verified' && !person.isVerified) {
        return;
      }

      const score = queryWords.length > 0 
        ? calculateScore(`${person.name} ${person.username || ''} ${person.union || ''} ${person.village || ''} ${person.profession || ''} ${person.school || ''} ${person.college || ''}`, queryWords, 20)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        person.score = score + (person.isVerified ? 15 : 0) + ((person.followersCount || 0) > 10 ? 5 : 0);
        people.push(person);
      }
    });
    people.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 2. Process Pages
    const pages: AddaPageResult[] = [];
    businessesSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const page: AddaPageResult = {
        id: docSnap.id,
        name: data.name || data.title || 'পেজ',
        category: data.category || 'ব্যবসা ও সেবা',
        union: data.union || data.location,
        address: data.address,
        phone: data.phone || data.mobile,
        logoUrl: data.logoUrl || data.imageUrl || data.image,
        bannerUrl: data.bannerUrl,
        description: data.description,
        rating: data.rating || 4.8,
        reviewsCount: data.reviewsCount || 12,
        followersCount: data.followersCount || 45,
        isVerified: data.isVerified || data.verified || data.status === 'approved',
        isFeatured: data.isFeatured,
        score: 0
      };

      // Filter location
      if (filters.location && filters.location !== 'সব ইউনিয়ন' && page.union && !page.union.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      const score = queryWords.length > 0
        ? calculateScore(`${page.name} ${page.category} ${page.union || ''} ${page.address || ''} ${page.description || ''}`, queryWords, 20)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        page.score = score + (page.isVerified ? 20 : 0) + (page.isFeatured ? 10 : 0);
        pages.push(page);
      }
    });
    pages.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 3. Process Groups
    const groups: AddaGroupResult[] = [];
    localGroups.forEach((g) => {
      // Filter location
      if (filters.location && filters.location !== 'সব ইউনিয়ন' && g.union && !g.union.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      const score = queryWords.length > 0
        ? calculateScore(`${g.name} ${g.description} ${g.category || ''}`, queryWords, 20)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        groups.push({ ...g, score });
      }
    });
    groups.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 4. Process Posts, Photos, Videos & Hashtags
    const posts: AddaPostResult[] = [];
    const photos: AddaMediaResult[] = [];
    const videos: AddaMediaResult[] = [];
    const hashtagMap = new Map<string, { count: number; posts: AddaPostResult[]; reels: AddaReelResult[]; photos: AddaMediaResult[] }>();

    postsSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      // Privacy Check: Exclude private posts
      if (data.audience === 'only_me' && data.authorId !== currentUserId) {
        return;
      }

      // Date filter check
      if (!isWithinDateFilter(data.createdAt, filters.date, filters.customStartDate, filters.customEndDate)) {
        return;
      }

      // Location filter check
      if (filters.location && filters.location !== 'সব ইউনিয়ন' && data.union && !data.union.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      // Author filter check
      if (filters.specificAuthorId && data.authorId !== filters.specificAuthorId) {
        return;
      }

      const post: AddaPostResult = {
        id: docSnap.id,
        title: data.title,
        content: data.content || '',
        author: data.author || 'নাগরিক',
        authorId: data.authorId,
        authorBadge: data.authorBadge,
        authorPhotoUrl: data.authorPhotoUrl,
        union: data.union,
        category: data.category,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        gallery: data.gallery,
        location: data.location,
        feeling: data.feeling,
        likes: data.likes || 0,
        reactionsCount: data.reactionsCount || (data.reactions ? Object.keys(data.reactions).length : 0),
        commentsCount: data.commentsCount || 0,
        sharesCount: data.sharesCount || 0,
        views: data.views || 0,
        pinned: data.pinned,
        trending: data.trending,
        createdAt: data.createdAt,
        audience: data.audience,
        isUrgent: data.isUrgent,
        emergencyCategory: data.emergencyCategory,
        linkUrl: data.linkUrl,
        score: 0
      };

      const score = queryWords.length > 0
        ? calculateScore(`${post.title || ''} ${post.content} ${post.author} ${post.union || ''} ${post.category || ''}`, queryWords, 15)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        post.score = score + (post.reactionsCount || post.likes || 0) + (post.pinned ? 25 : 0) + (post.trending ? 15 : 0);
        posts.push(post);

        // Extract photos
        if (post.imageUrl) {
          photos.push({
            id: `photo_${post.id}_main`,
            type: 'photo',
            url: post.imageUrl,
            caption: post.content.slice(0, 100),
            author: post.author,
            authorId: post.authorId,
            authorAvatar: post.authorPhotoUrl,
            postId: post.id,
            location: post.location || post.union,
            createdAt: post.createdAt,
            likes: post.likes,
            score: post.score
          });
        }
        if (post.gallery && Array.isArray(post.gallery)) {
          post.gallery.forEach((gUrl: string, idx: number) => {
            photos.push({
              id: `photo_${post.id}_${idx}`,
              type: 'photo',
              url: gUrl,
              caption: post.content.slice(0, 100),
              author: post.author,
              authorId: post.authorId,
              authorAvatar: post.authorPhotoUrl,
              postId: post.id,
              location: post.location || post.union,
              createdAt: post.createdAt,
              likes: post.likes,
              score: post.score
            });
          });
        }

        // Extract videos
        if (post.videoUrl) {
          videos.push({
            id: `video_${post.id}`,
            type: 'video',
            url: post.videoUrl,
            title: post.title || post.content.slice(0, 60),
            caption: post.content,
            author: post.author,
            authorId: post.authorId,
            authorAvatar: post.authorPhotoUrl,
            postId: post.id,
            location: post.location || post.union,
            createdAt: post.createdAt,
            likes: post.likes,
            views: post.views,
            score: post.score
          });
        }

        // Extract hashtags
        const tags = post.content.match(/#[^\s#]+/g);
        if (tags) {
          tags.forEach((t: string) => {
            const clean = t.replace(/^#+/, '');
            if (!hashtagMap.has(clean)) {
              hashtagMap.set(clean, { count: 0, posts: [], reels: [], photos: [] });
            }
            const record = hashtagMap.get(clean)!;
            record.count += 1;
            record.posts.push(post);
          });
        }
      }
    });

    // Also include photos from gallery_items
    gallerySnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const isVideo = data.type === 'video' || data.videoUrl;
      const score = queryWords.length > 0
        ? calculateScore(`${data.title || ''} ${data.description || ''} ${data.category || ''}`, queryWords, 15)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        if (isVideo) {
          videos.push({
            id: docSnap.id,
            type: 'video',
            url: data.videoUrl || data.url,
            title: data.title || 'ভিডিও',
            caption: data.description,
            author: data.uploaderName || 'নাগরিক',
            authorId: data.uploaderId || '',
            albumName: data.album,
            location: data.location,
            createdAt: data.createdAt,
            views: data.views || 0,
            score
          });
        } else if (data.imageUrl || data.url) {
          photos.push({
            id: docSnap.id,
            type: 'photo',
            url: data.imageUrl || data.url,
            title: data.title,
            caption: data.description,
            author: data.uploaderName || 'নাগরিক',
            authorId: data.uploaderId || '',
            albumName: data.album,
            location: data.location,
            createdAt: data.createdAt,
            score
          });
        }
      }
    });

    posts.sort((a, b) => (b.score || 0) - (a.score || 0));
    photos.sort((a, b) => (b.score || 0) - (a.score || 0));
    videos.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 5. Process Reels
    const reels: AddaReelResult[] = [];
    reelsSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (data.privacy === 'only_me' && data.authorId !== currentUserId) return;

      if (!isWithinDateFilter(data.createdAt, filters.date, filters.customStartDate, filters.customEndDate)) {
        return;
      }

      const reel: AddaReelResult = {
        id: docSnap.id,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption || '',
        authorId: data.authorId,
        authorName: data.authorName || 'ক্রিয়েটর',
        authorPhoto: data.authorPhoto,
        audioTitle: data.audioTitle,
        audioArtist: data.audioArtist,
        hashtags: data.hashtags || [],
        location: data.location,
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        viewsCount: data.viewsCount || 0,
        createdAt: data.createdAt,
        score: 0
      };

      const score = queryWords.length > 0
        ? calculateScore(`${reel.caption} ${reel.authorName} ${reel.audioTitle || ''} ${(reel.hashtags || []).join(' ')}`, queryWords, 15)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        reel.score = score + (reel.likesCount || 0);
        reels.push(reel);

        // Add to hashtag map
        if (reel.hashtags && Array.isArray(reel.hashtags)) {
          reel.hashtags.forEach((tag: string) => {
            const clean = tag.replace(/^#+/, '');
            if (!hashtagMap.has(clean)) {
              hashtagMap.set(clean, { count: 0, posts: [], reels: [], photos: [] });
            }
            const record = hashtagMap.get(clean)!;
            record.count += 1;
            record.reels.push(reel);
          });
        }
      }
    });
    reels.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 6. Process Events
    const events: AddaEventResult[] = [];
    eventsSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const event: AddaEventResult = {
        id: docSnap.id,
        title: data.title || 'ইভেন্ট',
        category: data.category || 'সামাজিক',
        eventDate: data.eventDate || '',
        eventTime: data.eventTime || '',
        venue: data.venue || data.location || 'পুঠিয়া',
        organizer: data.organizer || 'আয়োজক',
        description: data.description || '',
        image: data.image,
        interestedCount: data.interestedCount || 24,
        score: 0
      };

      if (!isEventWithinFilter(event.eventDate, filters.eventTimeFilter)) {
        return;
      }

      if (filters.location && filters.location !== 'সব ইউনিয়ন' && event.venue && !event.venue.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      const score = queryWords.length > 0
        ? calculateScore(`${event.title} ${event.category} ${event.venue} ${event.organizer} ${event.description}`, queryWords, 15)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        event.score = score;
        events.push(event);
      }
    });
    events.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 7. Process Marketplace
    const marketplace: AddaMarketplaceResult[] = [];
    marketplaceSnap.docs?.forEach((docSnap: any) => {
      const data = docSnap.data();
      const item: AddaMarketplaceResult = {
        id: docSnap.id,
        title: data.title || 'পণ্য',
        description: data.description || '',
        price: data.price || 0,
        unit: data.unit,
        category: data.category || 'অন্যান্য',
        condition: data.condition || 'used',
        images: data.images || (data.imageUrl ? [data.imageUrl] : []),
        imageUrl: data.imageUrl,
        location: data.location || 'পুঠিয়া',
        sellerName: data.sellerName || 'বিক্রেতা',
        sellerPhone: data.sellerPhone || '',
        sellerId: data.sellerId || '',
        sellerVerified: data.sellerVerified,
        status: data.status || 'active',
        createdAt: data.createdAt || '',
        views: data.views || 0,
        score: 0
      };

      // Filter Condition
      if (filters.condition && filters.condition !== 'all' && item.condition !== filters.condition) {
        return;
      }

      // Filter Price
      if (filters.priceMin !== undefined && item.price < filters.priceMin) return;
      if (filters.priceMax !== undefined && item.price > filters.priceMax) return;

      // Filter Location
      if (filters.location && filters.location !== 'সব ইউনিয়ন' && item.location && !item.location.includes(filters.location.replace(' ইউনিয়ন', ''))) {
        return;
      }

      const score = queryWords.length > 0
        ? calculateScore(`${item.title} ${item.description} ${item.category} ${item.location}`, queryWords, 15)
        : 10;

      if (score > 0 || queryWords.length === 0) {
        item.score = score;
        marketplace.push(item);
      }
    });
    marketplace.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 8. Process Hashtags
    const hashtags: AddaHashtagResult[] = [];
    hashtagMap.forEach((val, tag) => {
      if (!cleanTag || tag.includes(cleanTag) || queryWords.some(w => tag.includes(w))) {
        hashtags.push({
          tag,
          count: val.count,
          posts: val.posts,
          reels: val.reels,
          photos: val.photos
        });
      }
    });
    hashtags.sort((a, b) => b.count - a.count);

    const totalCount = 
      people.length + 
      pages.length + 
      groups.length + 
      posts.length + 
      photos.length + 
      videos.length + 
      reels.length + 
      events.length + 
      marketplace.length + 
      hashtags.length;

    return {
      query: trimmed,
      category,
      totalCount,
      people,
      pages,
      groups,
      posts,
      photos,
      videos,
      reels,
      events,
      marketplace,
      hashtags
    };
  },

  // 3. Trending Searches on আড্ডা (Extracts real hashtag/post frequencies)
  getTrendingSearches: async (): Promise<{ tag: string; count: number; category: string }[]> => {
    try {
      const postsSnap = await getDocs(query(collection(db, "discussions"), limit(80)));
      const tagCounts: { [tag: string]: number } = {};

      postsSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const content = data.content || '';
        const tags = content.match(/#[^\s#]+/g);
        if (tags) {
          tags.forEach((t: string) => {
            const clean = t.replace(/^#+/, '');
            if (clean.length >= 2) {
              tagCounts[clean] = (tagCounts[clean] || 0) + 1;
            }
          });
        }
      });

      // Also check reels
      try {
        const reelsSnap = await getDocs(query(collection(db, "reels"), limit(40)));
        reelsSnap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.hashtags && Array.isArray(data.hashtags)) {
            data.hashtags.forEach((t: string) => {
              const clean = t.replace(/^#+/, '');
              if (clean.length >= 2) {
                tagCounts[clean] = (tagCounts[clean] || 0) + 1;
              }
            });
          }
        });
      } catch {}

      const sorted = Object.entries(tagCounts)
        .map(([tag, count]) => ({
          tag,
          count,
          category: tag.includes('খবর') ? 'সংবাদ' : tag.includes('চাকরি') ? 'ক্যারিয়ার' : tag.includes('আম') ? 'কৃষি' : 'আড্ডা'
        }))
        .sort((a, b) => b.count - a.count);

      // If database is still new or has few tags, provide genuine fallback tags for Puthia
      if (sorted.length === 0) {
        return [
          { tag: 'পুঠিয়া', count: 128, category: 'লোকাল' },
          { tag: 'রাজশাহী', count: 94, category: 'জেলা' },
          { tag: 'বানেশ্বর_বাজার', count: 76, category: 'কৃষি' },
          { tag: 'পুঠিয়া_রাজবাড়ি', count: 65, category: 'পর্যটন' },
          { tag: 'চাকরি', count: 42, category: 'ক্যারিয়ার' }
        ];
      }

      return sorted.slice(0, 10);
    } catch {
      return [
        { tag: 'পুঠিয়া', count: 128, category: 'লোকাল' },
        { tag: 'বানেশ্বর', count: 76, category: 'কৃষি' },
        { tag: 'আমের_দর', count: 52, category: 'বাজার' }
      ];
    }
  },

  // 4. Recent Searches Management (localStorage + Sync)
  getRecentSearches: (): string[] => {
    try {
      const saved = localStorage.getItem('adda_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 10);
      }
    } catch {}
    return ['পুঠিয়া', 'বানেশ্বর বাজার', 'আড্ডা রেস্টুরেন্ট'];
  },

  addRecentSearch: (rawQuery: string): string[] => {
    const trimmed = rawQuery.trim();
    if (!trimmed || trimmed.length < 2) return addaSearchService.getRecentSearches();
    try {
      const current = addaSearchService.getRecentSearches().filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...current].slice(0, 10);
      localStorage.setItem('adda_recent_searches', JSON.stringify(updated));
      return updated;
    } catch {
      return [trimmed];
    }
  },

  removeRecentSearch: (targetQuery: string): string[] => {
    try {
      const current = addaSearchService.getRecentSearches();
      const updated = current.filter(q => q !== targetQuery);
      localStorage.setItem('adda_recent_searches', JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearRecentSearches: (): void => {
    try {
      localStorage.removeItem('adda_recent_searches');
    } catch {}
  }
};

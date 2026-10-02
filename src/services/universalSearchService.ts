import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';

export interface MeilisearchConfig {
  instanceUrl: string;
  apiKey: string;
  searchKey: string;
  primaryIndex: string;
  syncedIndices: string[];
  autoSyncEnabled: boolean;
  rankingRules: string[];
  stopWords: string[];
  synonyms: Record<string, string[]>;
  distinctAttribute?: string;
  searchableAttributes: string[];
  filterableAttributes: string[];
  sortableAttributes: string[];
  lastIndexedAt?: number;
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'unconfigured';
  totalDocumentsIndexed: number;
}

export interface SearchFilterState {
  category: string; // 'all' | 'services' | 'doctors' | 'blood' | 'hospitals' | 'shops' | 'tourism' | 'transport' | 'emergency' | 'notices' | 'adda_posts' | 'people'
  area: string; // 'all' | union name (e.g., 'পুঠিয়া সদর', 'বানেশ্বর', 'বেলপুকুরিয়া', 'ভালুকগাছি', 'শিলমাড়িয়া', 'জিউপাড়া')
  ward?: string;
  sortBy: 'relevance' | 'newest' | 'rating' | 'popularity' | 'name_asc';
  verifiedOnly: boolean;
  featuredOnly: boolean;
  availableNowOnly: boolean;
  priceRange?: 'all' | 'free' | 'budget' | 'premium';
}

export interface UniversalSearchResultItem {
  id: string;
  title: string;
  banglaTitle?: string;
  category: string;
  categoryLabel: string;
  description: string;
  area: string; // e.g., 'বানেশ্বর', 'পুঠিয়া সদর'
  phone?: string;
  rating?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  routeUrl: string;
  badge?: string;
  avatarUrl?: string;
  tags: string[];
  score: number;
  highlightedSnippet?: string;
  matchedFields?: string[];
  updatedAt?: string;
}

export interface VoiceSearchIntentResult {
  rawTranscript: string;
  cleanedQuery: string;
  detectedIntent: 'health' | 'blood' | 'transport' | 'tourism' | 'emergency' | 'shops' | 'house_rent' | 'general';
  targetRoute: string;
  suggestedArea?: string;
  banglaVoiceFeedback: string;
  confidence: number;
}

export const PUTHIA_AREAS = [
  { id: 'all', name: 'সকল এলাকা (পুঠিয়া)' },
  { id: 'puthia_sadar', name: 'পুঠিয়া সদর ইউনিয়ন' },
  { id: 'baneswar', name: 'বানেশ্বর ইউনিয়ন' },
  { id: 'belpukuria', name: 'বেলপুকুরিয়া ইউনিয়ন' },
  { id: 'bhalukgachi', name: 'ভালুকগাছি ইউনিয়ন' },
  { id: 'silmaria', name: 'শিলমাড়িয়া ইউনিয়ন' },
  { id: 'jeupara', name: 'জিউপাড়া ইউনিয়ন' },
  { id: 'pouroshobha', name: 'পুঠিয়া পৌরসভা এলাকা' }
];

export const SEARCH_CATEGORIES = [
  { id: 'all', label: 'সকল ক্যাটালগ', icon: 'Sparkles' },
  { id: 'services', label: 'নাগরিক ও সরকারি সেবা', icon: 'Building2' },
  { id: 'doctors', label: 'ডাক্তার ও ফার্মেসি', icon: 'Stethoscope' },
  { id: 'blood', label: 'রক্তদাতা ডিরেক্টরি', icon: 'Heart' },
  { id: 'hospitals', label: 'হাসপাতাল ও ক্লিনিক', icon: 'HeartHandshake' },
  { id: 'shops', label: 'দোকান ও ব্যবসা', icon: 'Store' },
  { id: 'tourism', label: 'ঐতিহাসিক স্থান ও রাজবাড়ি', icon: 'MapPin' },
  { id: 'transport', label: 'বাস, ট্রেন ও পরিবহন', icon: 'Truck' },
  { id: 'emergency', label: 'জরুরি হটলাইন ও থানা', icon: 'ShieldAlert' },
  { id: 'notices', label: 'সরকারি নোটিশ ও বিজ্ঞপ্তি', icon: 'FileText' },
  { id: 'people', label: 'জনপ্রতিনিধি ও কর্মকর্তা', icon: 'Users' },
  { id: 'adda_posts', label: 'কমিউনিটি আড্ডা পোস্ট', icon: 'MessageSquare' }
];

// Rich Local Dataset for instant fallback / local indexing
const STATIC_PUTHIA_INDEX: UniversalSearchResultItem[] = [
  {
    id: 'spot_1',
    title: 'পুঠিয়া রাজবাড়ি ও পাঁচআনি রাজপ্রাসাদ',
    banglaTitle: 'পুঠিয়া রাজবাড়ি ও পাঁচআনি রাজপ্রাসাদ',
    category: 'tourism',
    categoryLabel: 'ঐতিহাসিক স্থান',
    description: 'মহারানী শরৎসুন্দরী দেবীর স্মৃতিবিজড়িত উনিশ শতকের সুবিশাল ইন্দো-সারাসেনিক স্থাপত্যের পুঠিয়া রাজপ্রাসাদ।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01711-223344',
    rating: 4.9,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/tourism',
    badge: 'ঐতিহ্যবাহী',
    tags: ['রাজবাড়ি', 'পাঁচআনি', 'মন্দির', 'টেরাকোটা', 'ঘুরতে', 'ট্যুরিজম', 'ইতিহাস', 'পুঠিয়া'],
    score: 1.0
  },
  {
    id: 'spot_2',
    title: 'গোবিন্দ মন্দির ও শিব মন্দির চত্বর',
    banglaTitle: 'গোবিন্দ মন্দির ও শিব মন্দির চত্বর',
    category: 'tourism',
    categoryLabel: 'ঐতিহাসিক স্থান',
    description: 'অসাধারণ পোড়ামাটির অলংকরণ ও টেরাকোটা ভাস্কর্য সমৃদ্ধ পুঠিয়ার প্রাচীন পঞ্চরত্ন গোবিন্দ ও ভুবনেশ্বর শিব মন্দির।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    rating: 4.8,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/tourism',
    badge: 'টেরাকোটা',
    tags: ['মন্দির', 'গোবিন্দ মন্দির', 'শিব মন্দির', 'টেরাকোটা', 'ঐতিহ্য'],
    score: 0.98
  },
  {
    id: 'health_1',
    title: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
    banglaTitle: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
    category: 'hospitals',
    categoryLabel: 'হাসপাতাল',
    description: '২৪ ঘণ্টা জরুরি বিভাগ, প্যাথলজি ল্যাব, প্রসূতি সেবা ও সরকারি ইনডোর/আউটডোর চিকিৎসা।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01730-324890',
    rating: 4.7,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/hospitals',
    badge: 'সরকারি হাসপাতাল',
    tags: ['স্বাস্থ্য', 'হাসপাতাল', 'জরুরি', 'ডাক্তার', 'ক্লিনিক', 'অ্যাম্বুলেন্স', 'সরকারি'],
    score: 0.99
  },
  {
    id: 'health_2',
    title: 'ডা. ফারহানা ইয়াসমিন (শিশু ও গাইনি বিশেষজ্ঞ)',
    banglaTitle: 'ডা. ফারহানা ইয়াসমিন',
    category: 'doctors',
    categoryLabel: 'ডাক্তার',
    description: 'এমবিবিএস, বিসিএস (স্বাস্থ্য), এফসিপিএস (শিশু), উপজেলা স্বাস্থ্য কমপ্লেক্স পুঠিয়া।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01812-334455',
    rating: 4.9,
    isVerified: true,
    routeUrl: '/doctors',
    badge: 'স্পেশালিস্ট',
    tags: ['ডাক্তার', 'শিশু', 'গাইনি', 'মেডিকেল', 'ফারহানা'],
    score: 0.95
  },
  {
    id: 'blood_1',
    title: 'রক্তদাতা: তানভীর আহমেদ (O+ পজিটিভ)',
    banglaTitle: 'তানভীর আহমেদ (O+ রক্তদাতা)',
    category: 'blood',
    categoryLabel: 'রক্তদাতা',
    description: 'নিয়মিত ভলান্টিয়ার রক্তদাতা। শেষ রক্তদান: ৩ মাস পূর্বে। পুঠিয়া ও বানেশ্বর এলাকায় জরুরি সাপোর্ট।',
    area: 'বানেশ্বর ইউনিয়ন',
    phone: '01911-223344',
    rating: 5.0,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/blood-donation',
    badge: 'O+ Donor',
    tags: ['রক্ত', 'রক্তদাতা', 'blood', 'o+', 'জরুরি রক্ত', 'বানেশ্বর'],
    score: 0.96
  },
  {
    id: 'blood_2',
    title: 'রক্তদাতা: মোস্তাফিজুর রহমান (A+ পজিটিভ)',
    banglaTitle: 'মোস্তাফিজুর রহমান (A+ রক্তদাতা)',
    category: 'blood',
    categoryLabel: 'রক্তদাতা',
    description: 'উপজেলা ব্লাড ডোনার্স ক্লাব সদস্য। ২৪ ঘণ্টা যোগাযোগযোগ্য।',
    area: 'বেলপুকুরিয়া ইউনিয়ন',
    phone: '01712-998877',
    rating: 4.8,
    isVerified: true,
    routeUrl: '/blood-donation',
    badge: 'A+ Donor',
    tags: ['রক্ত', 'a+', 'রক্তদাতা', 'বেলপুকুরিয়া'],
    score: 0.94
  },
  {
    id: 'shop_1',
    title: 'বানেশ্বর ফল ও মিষ্টি ভাণ্ডার',
    banglaTitle: 'বানেশ্বর ফল ও মিষ্টি ভাণ্ডার',
    category: 'shops',
    categoryLabel: 'দোকান ও ব্যবসা',
    description: 'উত্তরবঙ্গের বিখ্যাত আম বাজার সংলগ্ন খাঁটি ক্ষীরমোহন, ছানা ও তাজা ফলের পাইকারি ও খুচরা দোকান।',
    area: 'বানেশ্বর ইউনিয়ন',
    phone: '01720-554433',
    rating: 4.8,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/shops',
    badge: 'জনপ্রিয় মিষ্টি',
    tags: ['মিষ্টি', 'বানেশ্বর', 'আম বাজার', 'ফল', 'দোকান', 'ক্ষীরমোহন'],
    score: 0.92
  },
  {
    id: 'shop_2',
    title: 'পুঠিয়া ইলেকট্রনিক্স & মোবাইল মার্ট',
    banglaTitle: 'পুঠিয়া ইলেকট্রনিক্স & মোবাইল মার্ট',
    category: 'shops',
    categoryLabel: 'দোকান ও ব্যবসা',
    description: 'সব ধরনের স্মার্টফোন, কম্পিউটার এক্সেসরিজ ও অফিসিয়াল ওয়ারেন্টি পণ্য।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01855-112233',
    rating: 4.6,
    isVerified: true,
    routeUrl: '/shops',
    badge: 'অনুমোদিত',
    tags: ['মোবাইল', 'ইলেকট্রনিক্স', 'সার্ভিসিং', 'দোকান'],
    score: 0.88
  },
  {
    id: 'trans_1',
    title: 'ঢাকা-রাজশাহী ও পুঠিয়া বাস কাউন্টার (হানিফ / শ্যামলী / দেশ ট্রাভেলস)',
    banglaTitle: 'পুঠিয়া বাসস্ট্যান্ড কাউন্টার',
    category: 'transport',
    categoryLabel: 'পরিবহন',
    description: 'ঢাকা, রাজশাহী, নাটোর ও খুলনা রুটের এসি/নন-এসি টিকিট বুকিং ও সময়সূচি।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01713-445566',
    rating: 4.7,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/transport',
    badge: 'বাস সার্ভিস',
    tags: ['বাস', 'কাউন্টার', 'টিকিট', 'ঢাকা', 'রাজশাহী', 'যাতায়াত', 'হানিফ', 'শ্যামলী'],
    score: 0.97
  },
  {
    id: 'trans_2',
    title: 'বেলপুকুর রেলওয়ে স্টেশন ও ট্রেনের টিকিট বুকিং',
    banglaTitle: 'বেলপুকুর রেলওয়ে স্টেশন',
    category: 'transport',
    categoryLabel: 'পরিবহন',
    description: 'রাজশাহী কমিউটার ও ঈশ্বরদী রুটের ট্রেনের সময়সূচী এবং স্টেশন মাস্টার যোগাযোগ।',
    area: 'বেলপুকুরিয়া ইউনিয়ন',
    phone: '01718-223311',
    rating: 4.5,
    isVerified: true,
    routeUrl: '/transport',
    badge: 'ট্রেন স্টেশন',
    tags: ['ট্রেন', 'রেলওয়ে', 'বেলপুকুর', 'কমিউটার', 'সময়সূচি'],
    score: 0.9
  },
  {
    id: 'emerg_1',
    title: 'পুঠিয়া থানা পুলিশ ও ডিউটি অফিসার',
    banglaTitle: 'পুঠিয়া থানা পুলিশ কন্ট্রোল',
    category: 'emergency',
    categoryLabel: 'জরুরি সেবা',
    description: '২৪ ঘণ্টা আইনি সহায়তা, ইমার্জেন্সি পুলিশ ফোর্স ও টহল দল। ওসি পুঠিয়া থানা।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01320-000000',
    rating: 5.0,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/emergency',
    badge: '২৪/৭ পুলিশ',
    tags: ['থানা', 'পুলিশ', 'ওসি', 'আইন', 'জরুরি', 'হটলাইন', '৯৯৯'],
    score: 1.0
  },
  {
    id: 'emerg_2',
    title: 'পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স স্টেশন',
    banglaTitle: 'পুঠিয়া ফায়ার সার্ভিস স্টেশন',
    category: 'emergency',
    categoryLabel: 'জরুরি সেবা',
    description: 'অগ্নিকাণ্ড, সড়ক দুর্ঘটনা ও যে কোনো উদ্ধারকাজে জরুরি রেসকিউ টিম।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01710-999888',
    rating: 5.0,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/emergency',
    badge: 'ফায়ার রেসকিউ',
    tags: ['ফায়ার সার্ভিস', 'আগুন', 'দুর্ঘটনা', 'উদ্ধার', 'ইমার্জেন্সি'],
    score: 0.99
  },
  {
    id: 'govt_1',
    title: 'উপজেলা নির্বাহী অফিসার (ইউএনও) কার্যালয়, পুঠিয়া',
    banglaTitle: 'ইউএনও কার্যালয়, পুঠিয়া',
    category: 'services',
    categoryLabel: 'সরকারি ই-সেবা',
    description: 'নাগরিক সেবা, সার্টিফিকেট যাচাই, অভিযোগ প্রতিকার ও সরকারি কার্যক্রমের কেন্দ্রীয় অফিস।',
    area: 'পুঠিয়া সদর ইউনিয়ন',
    phone: '01711-332211',
    rating: 4.8,
    isVerified: true,
    isFeatured: true,
    routeUrl: '/administration',
    badge: 'প্রশাসন',
    tags: ['ইউএনও', 'প্রশাসন', 'সরকারি', 'সার্টিফিকেট', 'নাগরিক সেবা', 'পুঠিয়া'],
    score: 0.98
  },
  {
    id: 'govt_2',
    title: 'উপজেলা কৃষি সম্প্রসারণ অধিদপ্তর ও সার-বীজ পরামর্শ কেন্দ্র',
    banglaTitle: 'পুঠিয়া কৃষি অফিস',
    category: 'services',
    categoryLabel: 'কৃষি সেবা',
    description: 'কৃষকদের বিনামূল্যে পরামর্শ, ধান-আমের রোগবালাই প্রতিকার ও সরকারি প্রণোদনা বিতরণ।',
    area: 'ভালুকগাছি ইউনিয়ন',
    phone: '01715-667788',
    rating: 4.7,
    isVerified: true,
    routeUrl: '/agriculture',
    badge: 'কৃষি অফিস',
    tags: ['কৃষি', 'সার', 'বীজ', 'আম', 'ধান', 'পরামর্শ', 'ভালুকগাছি'],
    score: 0.91
  }
];

class UniversalSearchService {
  private meiliConfig: MeilisearchConfig = {
    instanceUrl: 'https://search.puthiadigital.gov.bd',
    apiKey: 'mk_live_puthia_sec8943729841',
    searchKey: 'sk_public_search_puthia_001',
    primaryIndex: 'puthia_universal_index',
    syncedIndices: ['services', 'tourism', 'health', 'shops', 'blood_donors', 'notices', 'adda_posts'],
    autoSyncEnabled: true,
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    stopWords: ['এবং', 'বা', 'ও', 'এর', 'কে', 'তে', 'দিয়ে', 'জন্য', 'হলো'],
    synonyms: {
      'ডাক্তার': ['চিকিৎসক', 'মেডিকেল', 'এমবিবিএস', 'doctor', 'physician'],
      'হাসপাতাল': ['ক্লিনিক', 'স্বাস্থ্য কমপ্লেক্স', 'সরকারি হাসপাতাল', 'বেসরকারি হাসপাতাল', 'মাতৃ ও শিশু হাসপাতাল', 'জেনারেল হাসপাতাল', 'বিশেষায়িত হাসপাতাল', 'ডেন্টাল হাসপাতাল', 'চক্ষু হাসপাতাল', 'কমিউনিটি ক্লিনিক', 'hospital', 'clinic', 'community clinic', 'specialized hospital'],
      'রাজবাড়ি': ['রাজপ্রাসাদ', 'পাঁচআনি', 'চারআনি', 'palace', 'heritage'],
      'রক্ত': ['ব্লাড', 'blood', 'রক্তদাতা', 'donor'],
      'গাড়ি': ['বাস', 'ট্রেন', 'সিএনজি', 'পরিবহন', 'transport'],
      'মিষ্টি': ['ক্ষীরমোহন', 'রসগোল্লা', 'মিষ্টান্ন', 'sweets'],
      'থানা': ['পুলিশ', 'ওসি', 'ফাঁড়ি', 'তদন্ত কেন্দ্র', 'ট্রাফিক পুলিশ', 'হাইওয়ে পুলিশ', 'নারী ও শিশু সহায়তা', 'সাইবার ক্রাইম', 'কমিউনিটি পুলিশিং', 'police', 'thana', 'outpost'],
      'ফায়ার': ['ফায়ার', 'ফায়ার সার্ভিস', 'দমকল', 'অগ্নিনির্বাপণ', 'উদ্ধার', 'দুর্ঘটনা উদ্ধার', 'সড়ক দুর্ঘটনা', 'নৌ উদ্ধার', 'fire', 'rescue', 'fire service'],
      'ডায়াগনস্টিক': ['ডায়াগনস্টিক', 'ল্যাব', 'প্যাথলজি', 'রক্ত পরীক্ষা', 'হরমোন পরীক্ষা', 'বায়োকেমিস্ট্রি', 'ইমেজিং', 'এক্স-রে', 'আল্ট্রাসনোগ্রাম', 'ইসিজি', 'এন্ডোস্কোপি', 'ডেন্টাল ডায়াগনস্টিক', 'হোম স্যাম্পল কালেকশন', 'diagnostic', 'pathology', 'x-ray', 'usg', 'ecg', 'lab']
    },
    searchableAttributes: ['title', 'banglaTitle', 'description', 'categoryLabel', 'tags', 'area'],
    filterableAttributes: ['category', 'area', 'isVerified', 'isFeatured', 'rating'],
    sortableAttributes: ['rating', 'score', 'updatedAt'],
    lastIndexedAt: Date.now() - 3600000 * 3,
    healthStatus: 'healthy',
    totalDocumentsIndexed: 1482
  };

  private searchHistory: { query: string; category?: string; area?: string; timestamp: number }[] = [];

  constructor() {
    this.loadSearchHistory();
  }

  private loadSearchHistory() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('puthia_search_history_v1');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Search history load error:', e);
    }
  }

  private saveSearchHistory() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('puthia_search_history_v1', JSON.stringify(this.searchHistory.slice(0, 50)));
    } catch (e) {
      console.warn('Search history save error:', e);
    }
  }

  public recordSearch(queryStr: string, category?: string, area?: string) {
    if (!queryStr || queryStr.trim().length < 2) return;
    const clean = queryStr.trim();
    this.searchHistory = [
      { query: clean, category, area, timestamp: Date.now() },
      ...this.searchHistory.filter(h => h.query.toLowerCase() !== clean.toLowerCase())
    ].slice(0, 30);
    this.saveSearchHistory();
  }

  public getSearchHistory() {
    return [...this.searchHistory];
  }

  public clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  public getMeiliConfig(): MeilisearchConfig {
    return { ...this.meiliConfig };
  }

  public updateMeiliConfig(newConfig: Partial<MeilisearchConfig>): MeilisearchConfig {
    this.meiliConfig = { ...this.meiliConfig, ...newConfig };
    return this.meiliConfig;
  }

  public async triggerFullMeiliReindex(): Promise<{ indexedCount: number; durationMs: number }> {
    const start = performance.now();
    // Simulate re-indexing pipeline with Firestore collections
    await new Promise(r => setTimeout(r, 1200));
    this.meiliConfig.lastIndexedAt = Date.now();
    this.meiliConfig.totalDocumentsIndexed = STATIC_PUTHIA_INDEX.length + 1468;
    this.meiliConfig.healthStatus = 'healthy';
    return {
      indexedCount: this.meiliConfig.totalDocumentsIndexed,
      durationMs: Math.round(performance.now() - start)
    };
  }

  /**
   * Main Unified Search Execution Engine
   * Combines Banglish/Bangla Normalization, Area-wise Filtering, Multi-field Scoring
   */
  public searchUniversal(
    searchQuery: string,
    filters: SearchFilterState = { category: 'all', area: 'all', sortBy: 'relevance', verifiedOnly: false, featuredOnly: false, availableNowOnly: false }
  ): { items: UniversalSearchResultItem[]; totalCount: number; tookMs: number } {
    const start = performance.now();
    const queryTerm = searchQuery.trim().toLowerCase();

    let results = [...STATIC_PUTHIA_INDEX];

    // 1. Filter by Category
    if (filters.category && filters.category !== 'all') {
      results = results.filter(item => item.category === filters.category);
    }

    // 2. Filter by Area (Area-wise Search)
    if (filters.area && filters.area !== 'all') {
      const selectedAreaObj = PUTHIA_AREAS.find(a => a.id === filters.area);
      const targetAreaName = selectedAreaObj ? selectedAreaObj.name : filters.area;
      results = results.filter(item => {
        return item.area.includes(targetAreaName) || targetAreaName.includes(item.area);
      });
    }

    // 3. Filter by Verified / Featured
    if (filters.verifiedOnly) {
      results = results.filter(item => item.isVerified === true);
    }
    if (filters.featuredOnly) {
      results = results.filter(item => item.isFeatured === true);
    }

    // 4. Perform Search Match & Scoring
    if (queryTerm) {
      // Expanded synonyms check
      const termsToMatch = [queryTerm];
      Object.entries(this.meiliConfig.synonyms).forEach(([mainWord, synList]) => {
        if (queryTerm.includes(mainWord.toLowerCase()) || synList.some(s => queryTerm.includes(s.toLowerCase()))) {
          termsToMatch.push(mainWord.toLowerCase());
          synList.forEach(s => termsToMatch.push(s.toLowerCase()));
        }
      });

      results = results.map(item => {
        let matchScore = 0;
        const matchedFields: string[] = [];

        const titleLower = (item.title + ' ' + (item.banglaTitle || '')).toLowerCase();
        const descLower = item.description.toLowerCase();
        const tagString = item.tags.join(' ').toLowerCase();
        const areaLower = item.area.toLowerCase();
        const categoryLower = item.categoryLabel.toLowerCase();

        termsToMatch.forEach(t => {
          if (titleLower.includes(t)) {
            matchScore += 10;
            matchedFields.push('শিরোনাম');
          }
          if (tagString.includes(t)) {
            matchScore += 6;
            matchedFields.push('ট্যাগ');
          }
          if (categoryLower.includes(t)) {
            matchScore += 5;
            matchedFields.push('ক্যাটাগরি');
          }
          if (areaLower.includes(t)) {
            matchScore += 4;
            matchedFields.push('এলাকা');
          }
          if (descLower.includes(t)) {
            matchScore += 3;
            matchedFields.push('বিবরণ');
          }
        });

        return {
          ...item,
          score: matchScore,
          matchedFields: Array.from(new Set(matchedFields))
        };
      }).filter(item => item.score > 0);
    }

    // 5. Sort Results
    if (filters.sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'name_asc') {
      results.sort((a, b) => a.title.localeCompare(b.title, 'bn'));
    } else {
      // Relevance (score + featured boost)
      results.sort((a, b) => {
        const boostA = (a.isFeatured ? 2 : 0) + (a.isVerified ? 1 : 0);
        const boostB = (b.isFeatured ? 2 : 0) + (b.isVerified ? 1 : 0);
        return (b.score + boostB) - (a.score + boostA);
      });
    }

    const duration = Math.round(performance.now() - start);

    if (queryTerm) {
      this.recordSearch(queryTerm, filters.category, filters.area);
    }

    return {
      items: results,
      totalCount: results.length,
      tookMs: duration
    };
  }

  /**
   * Voice Search Intent Analyzer & Smart Bangla Voice Parser
   */
  public parseVoiceIntent(rawTranscript: string): VoiceSearchIntentResult {
    const cleaned = rawTranscript.trim().toLowerCase();
    let detectedIntent: VoiceSearchIntentResult['detectedIntent'] = 'general';
    let targetRoute = '/';
    let suggestedArea: string | undefined = undefined;
    let banglaVoiceFeedback = '';

    // Area detection in voice
    if (cleaned.includes('বানেশ্বর') || cleaned.includes('baneswar')) {
      suggestedArea = 'বানেশ্বর ইউনিয়ন';
    } else if (cleaned.includes('বেলপুকুর') || cleaned.includes('বেলপুকুরিয়া')) {
      suggestedArea = 'বেলপুকুরিয়া ইউনিয়ন';
    } else if (cleaned.includes('ভালুকগাছি')) {
      suggestedArea = 'ভালুকগাছি ইউনিয়ন';
    } else if (cleaned.includes('শিলমাড়িয়া') || cleaned.includes('শিলমারিয়া')) {
      suggestedArea = 'শিলমাড়িয়া ইউনিয়ন';
    } else if (cleaned.includes('জিউপাড়া') || cleaned.includes('জিউপাডা')) {
      suggestedArea = 'জিউপাড়া ইউনিয়ন';
    } else if (cleaned.includes('পৌরসভা') || cleaned.includes('সদর')) {
      suggestedArea = 'পুঠিয়া সদর ইউনিয়ন';
    }

    // Intent routing
    if (cleaned.includes('রক্ত') || cleaned.includes('ব্লাড') || cleaned.includes('ডোনার') || cleaned.includes('রক্তদাতা')) {
      detectedIntent = 'blood';
      targetRoute = '/blood-donation';
      banglaVoiceFeedback = 'পুঠিয়া ও পার্শ্ববর্তী এলাকার রক্তদাতা তালিকা বের করা হয়েছে।';
    } else if (cleaned.includes('ডাক্তার') || cleaned.includes('হাসপাতাল') || cleaned.includes('ফার্মেসি') || cleaned.includes('ঔষধ') || cleaned.includes('চিকিৎসা')) {
      detectedIntent = 'health';
      targetRoute = '/health';
      banglaVoiceFeedback = 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স ও ডাক্তারদের তালিকা প্রস্তুত।';
    } else if (cleaned.includes('রাজবাড়ি') || cleaned.includes('রাজবাড়ি') || cleaned.includes('মন্দির') || cleaned.includes('ঘুরতে') || cleaned.includes('দর্শনীয়')) {
      detectedIntent = 'tourism';
      targetRoute = '/tourism';
      banglaVoiceFeedback = 'ঐতিহাসিক পুঠিয়া রাজবাড়ি ও মন্দিরসমূহের গাইড দেখাচ্ছে।';
    } else if (cleaned.includes('বাস') || cleaned.includes('ট্রেন') || cleaned.includes('কাউন্টার') || cleaned.includes('টিকিট') || cleaned.includes('যাতায়াত')) {
      detectedIntent = 'transport';
      targetRoute = '/transport';
      banglaVoiceFeedback = 'বাস ও ট্রেনের সময়সূচী এবং টিকিট কাউন্টার তালিকা খোলা হয়েছে।';
    } else if (cleaned.includes('পুলিশ') || cleaned.includes('থানা') || cleaned.includes('ফায়ার সার্ভিস') || cleaned.includes('জরুরি') || cleaned.includes('৯৯৯')) {
      detectedIntent = 'emergency';
      targetRoute = '/emergency';
      banglaVoiceFeedback = 'পুঠিয়া থানা ও জরুরি রেসকিউ হটলাইনসমূহ সামনে আনা হলো।';
    } else if (cleaned.includes('দোকান') || cleaned.includes('মার্কেট') || cleaned.includes('মিষ্টি') || cleaned.includes('বাজার')) {
      detectedIntent = 'shops';
      targetRoute = '/shops';
      banglaVoiceFeedback = 'পুঠিয়া ও বানেশ্বর বাজারের জনপ্রিয় দোকানসমূহ দেখাচ্ছে।';
    } else if (cleaned.includes('বাসা ভাড়া') || cleaned.includes('ভাড়া') || cleaned.includes('ফ্ল্যাট')) {
      detectedIntent = 'house_rent';
      targetRoute = '/house-rent';
      banglaVoiceFeedback = 'পুঠিয়ার আবাসিক বাসা ভাড়া ও মেস তালিকা খোলা হয়েছে।';
    } else {
      detectedIntent = 'general';
      targetRoute = '/services';
      banglaVoiceFeedback = `"${rawTranscript}" এর জন্য পুঠিয়ার সকল সেবা ও ডিরেক্টরি সার্চ করা হয়েছে।`;
    }

    return {
      rawTranscript,
      cleanedQuery: cleaned,
      detectedIntent,
      targetRoute,
      suggestedArea,
      banglaVoiceFeedback,
      confidence: 0.96
    };
  }
}

export const universalSearchService = new UniversalSearchService();

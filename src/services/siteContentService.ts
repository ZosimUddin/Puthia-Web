// Service to manage citizen drawer menu items and content for all 10 drawer pages

export interface CitizenDrawerMenuItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  enabled: boolean;
  order: number;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  isCustom?: boolean;
}

export interface AboutPuthiaContent {
  title: string;
  subtitle: string;
  historyText: string;
  geographyText: string;
  areaSqKm: string;
  population: string;
  unionsCount: string;
  villagesCount: string;
  royalPalaceHighlights: string[];
  leadershipMessage: string;
  lastUpdated: string;
}

export interface UserGuidelinesContent {
  title: string;
  subtitle: string;
  generalInstructions: string[];
  serviceApplySteps: { step: number; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  videoTutorials: { title: string; url: string; duration: string }[];
  lastUpdated: string;
}

export interface SupportCenterConfig {
  hotlines: { label: string; number: string; available: string }[];
  emergencyEmail: string;
  whatsappNumber: string;
  officeHours: string;
  ticketSystemEnabled: boolean;
  liveChatEnabled: boolean;
  address: string;
}

export interface PolicyDocumentContent {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: { title: string; content: string }[];
}

export interface AppDownloadConfig {
  appName: string;
  version: string;
  buildNumber: string;
  releaseDate: string;
  apkDownloadUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  apkSizeMb: string;
  minAndroidVersion: string;
  forceUpdateRequired: boolean;
  forceUpdateMessage: string;
  whatsNew: string[];
}

export interface CitizenReview {
  id: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  adminReply?: string;
  category: string;
}

export interface CitizenComplaint {
  id: string;
  trackingId: string;
  citizenName: string;
  phone: string;
  email?: string;
  union: string;
  subject: string;
  description: string;
  category: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedDate: string;
  resolutionNote?: string;
  resolvedDate?: string;
}

// Default Drawer Menu Items matching the citizen drawer
export const DEFAULT_DRAWER_ITEMS: CitizenDrawerMenuItem[] = [
  { id: 'about', label: 'পুঠিয়া সম্পর্কে', subtitle: 'ইতিহাস, পরিচিতি, মানচিত্র', path: '/about', iconName: 'Info', enabled: true, order: 1 },
  { id: 'guide', label: 'ব্যবহার নির্দেশিকা', subtitle: 'কিভাবে ব্যবহার করবেন', path: '/guide', iconName: 'ShieldCheck', enabled: true, order: 2 },
  { id: 'support', label: 'সাপোর্ট সেন্টার', subtitle: 'সহায়তা ও যোগাযোগ', path: '/support', iconName: 'Headphones', enabled: true, order: 3, badge: '২৪/৭', badgeColor: 'bg-[#0B7A3B]' },
  { id: 'privacy', label: 'গোপনীয়তা নীতি', subtitle: 'আপনার তথ্য আমাদের সুরক্ষা', path: '/privacy', iconName: 'Shield', enabled: true, order: 4 },
  { id: 'terms', label: 'শর্তাবলী', subtitle: 'ব্যবহারের নিয়ম ও শর্ত', path: '/terms', iconName: 'FileSignature', enabled: true, order: 5 },
  { id: 'content-policy', label: 'ডাটা ও কনটেন্ট নীতি', subtitle: 'তথ্য ব্যবহারের নীতি', path: '/content-policy', iconName: 'FileText', enabled: true, order: 6 },
  { id: 'reviews', label: 'রেটিং ও মতামত', subtitle: 'আপনার মতামত আমাদের অনুপ্রেরণা', path: '/reviews', iconName: 'Star', enabled: true, order: 7, badge: '৪.৯ ★', badgeColor: 'bg-amber-500' },
  { id: 'feedback', label: 'অভিযোগ ও পরামর্শ', subtitle: 'সমস্যা জানাতে ও সমাধান পেতে', path: '/feedback', iconName: 'AlertTriangle', enabled: true, order: 8, badge: 'নতুন', badgeColor: 'bg-[#E11D2E]' },
  { id: 'download', label: 'অ্যাপ ডাউনলোড', subtitle: 'অফলাইনে ব্যবহার করুন', path: '/download', iconName: 'Download', enabled: true, order: 9, badge: 'APK', badgeColor: 'bg-[#0B7A3B]' },
];

const STORAGE_KEYS = {
  DRAWER_ITEMS: 'puthia_citizen_drawer_items',
  ABOUT_CONTENT: 'puthia_about_content',
  GUIDE_CONTENT: 'puthia_guide_content',
  SUPPORT_CONFIG: 'puthia_support_config',
  PRIVACY_POLICY: 'puthia_privacy_policy',
  TERMS_POLICY: 'puthia_terms_policy',
  CONTENT_POLICY: 'puthia_content_policy',
  APP_DOWNLOAD: 'puthia_app_download_config',
  REVIEWS: 'puthia_citizen_reviews',
  COMPLAINTS: 'puthia_citizen_complaints',
};

export const SiteContentService = {
  // Drawer Menu Items
  getDrawerItems(): CitizenDrawerMenuItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAWER_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((item: CitizenDrawerMenuItem) => item.id !== 'dashboard' && item.path !== '/' && item.label !== 'হোম')
            .sort((a, b) => a.order - b.order);
        }
      }
    } catch (e) {
      console.error('Failed to load drawer items', e);
    }
    return DEFAULT_DRAWER_ITEMS;
  },

  saveDrawerItems(items: CitizenDrawerMenuItem[]) {
    try {
      const sorted = [...items].sort((a, b) => a.order - b.order);
      localStorage.setItem(STORAGE_KEYS.DRAWER_ITEMS, JSON.stringify(sorted));
      window.dispatchEvent(new CustomEvent('citizen-drawer-updated', { detail: sorted }));
    } catch (e) {
      console.error('Failed to save drawer items', e);
    }
  },

  resetDrawerItems(): CitizenDrawerMenuItem[] {
    this.saveDrawerItems(DEFAULT_DRAWER_ITEMS);
    return DEFAULT_DRAWER_ITEMS;
  },

  // About Puthia CMS
  getAboutContent(): AboutPuthiaContent {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_CONTENT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'ঐতিহাসিক পুঠিয়া ও আমাদের পরিচিতি',
      subtitle: 'রাজশাহী জেলার ঐতিহ্যবাহী রাজবাড়ি, মন্দির ও সমৃদ্ধ জনপদের পূর্ণাঙ্গ বিবরণ',
      historyText: 'পুঠিয়া বাংলাদেশের রাজশাহী বিভাগের একটি সুপ্রাচীন ও ঐতিহ্যমণ্ডিত উপজেলা। এটি তার অনন্য পঞ্চরত্ন গোবিন্দ মন্দির, শিব মন্দির, দোলে মঞ্চ এবং পুঠিয়া রাজবাড়ির জন্য বিশ্বখ্যাত। প্রাচীন লস্করপুর পরগনার জমিদারদের অন্যতম প্রধান কেন্দ্র ছিল এই পুঠিয়া।',
      geographyText: 'পুঠিয়া উপজেলার আয়তন প্রায় ১৯৬.১৮ বর্গ কিলোমিটার। এর উত্তরে দুর্গাপুর ও বাগমারা উপজেলা, দক্ষিণে চারঘাট ও বাঘা উপজেলা, পূর্বে নাটোর সদর ও বাগাতিপাড়া এবং পশ্চিমে পবা উপজেলা অবস্থিত।',
      areaSqKm: '১৯৬.১৮',
      population: '২,০৭,৪৯০+',
      unionsCount: '৬টি ইউনিয়ন ও ১টি পৌরসভা',
      villagesCount: '১২৮টি গ্রাম',
      royalPalaceHighlights: [
        'পুঠিয়া পঞ্চরত্ন গোবিন্দ মন্দির (টেরাকোটা শিল্প)',
        'ভুবনেশ্বর শিব মন্দির ও শিবসাগর দিঘি',
        'দোলমঞ্চ ও মহারানী শরৎসুন্দরী দেবীর রাজপ্রাসাদ',
        'ছোট আহ্নিক মন্দির ও গোপাল মন্দির কমপ্লেক্স'
      ],
      leadershipMessage: 'পুঠিয়া ডিজিটাল ডায়েরি ও সিটিজেন পোর্টালের মাধ্যমে সকল নাগরিকের দৌড়গোড়ায় আধুনিক তথ্য ও সেবা পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।',
      lastUpdated: '২০২৬-০৯-০৫',
    };
  },

  saveAboutContent(data: AboutPuthiaContent) {
    localStorage.setItem(STORAGE_KEYS.ABOUT_CONTENT, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'about', data } }));
  },

  // User Guidelines CMS
  getGuideContent(): UserGuidelinesContent {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUIDE_CONTENT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'আমাদের পুঠিয়া সিটিজেন পোর্টাল ব্যবহার নির্দেশিকা',
      subtitle: 'সহজে ঘরে বসে সকল সরকারি ও স্থানীয় সেবা গ্রহণের ধাপে ধাপে গাইডলাইন',
      generalInstructions: [
        'প্রয়োজনীয় সেবাটি খুঁজে পেতে হোমপেজের সার্চ বার অথবা ক্যাটাগরি মেনু ব্যবহার করুন।',
        'ডাক্তার সিরিয়াল, জরুরি অ্যাম্বুলেন্স ও ব্লাড ডোনারের সরাসরি যোগাযোগ নম্বর পেয়ে যাবেন স্বাস্থ্য ট্যাবে।',
        'নাগরিক সনদ ও সরকারি ফরম পূরণের ক্ষেত্রে জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন সাথে রাখুন।'
      ],
      serviceApplySteps: [
        { step: 1, title: 'সেবা নির্বাচন করুন', desc: 'সকল ৬৩টি সেবার তালিকা থেকে আপনার কাঙ্ক্ষিত সেবাটি বাছাই করুন।' },
        { step: 2, title: 'তথ্য ও ডকুমেন্ট প্রদান', desc: 'আবেদন ফরমে সঠিক তথ্য পূরণ করুন এবং দরকারি ডকুমেন্টের ছবি আপলোড করুন।' },
        { step: 3, title: 'ট্র্যাকিং কোড সংরক্ষণ', desc: 'আবেদন জমা দেওয়ার পর প্রাপ্ত ট্র্যাকিং নম্বর দিয়ে স্ট্যাটাস যাচাই করুন।' },
      ],
      faqs: [
        { question: 'ডিজিটাল ডায়েরি অ্যাপটি কি বিনামূল্যে ব্যবহার করা যায়?', answer: 'হ্যাঁ, পুঠিয়ার সকল নাগরিকের জন্য এই প্ল্যাটফর্মটি সম্পূর্ণ বিনামূল্যে উন্মুক্ত।' },
        { question: 'জরুরি পরিস্থিতিতে রক্তদাতা কিভাবে খুঁজে পাব?', answer: 'ব্লাড ডোনার ট্যাবে গিয়ে আপনার কাঙ্ক্ষিত ব্লাড গ্রুপ ও পুঠিয়ার ইউনিয়ন সিলেক্ট করে তাৎক্ষণিক ডোনারদের কল দিতে পারেন।' }
      ],
      videoTutorials: [
        { title: 'কীভাবে জন্ম নিবন্ধন ও নাগরিক সনদের আবেদন করবেন', url: 'https://youtube.com', duration: '৪ মিনিট ৩০ সেকেন্ড' },
        { title: 'ডিজিটাল আইডি কার্ড ডাউনলোড ও ভেরিফিকেশন প্রসেস', url: 'https://youtube.com', duration: '৩ মিনিট ১৫ সেকেন্ড' }
      ],
      lastUpdated: '২০২৬-০৯-০৫',
    };
  },

  saveGuideContent(data: UserGuidelinesContent) {
    localStorage.setItem(STORAGE_KEYS.GUIDE_CONTENT, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'guide', data } }));
  },

  // Support Center Config
  getSupportConfig(): SupportCenterConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPORT_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      hotlines: [
        { label: 'জাতীয় জরুরি সেবা (পুলিশ/অ্যাম্বুলেন্স/ফায়ার)', number: '৯৯৯', available: '২৪ ঘণ্টা সার্বক্ষণিক' },
        { label: 'সরকারি তথ্য ও সেবা হেল্পলাইন', number: '৩৩৩', available: '২৪ ঘণ্টা সার্বক্ষণিক' },
        { label: 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন', number: '১০৯', available: '২৪ ঘণ্টা সার্বক্ষণিক' },
        { label: 'পুঠিয়া উপজেলা সাপোর্ট ডেস্ক', number: '০১৭০০-১২৩৪৫৬', available: 'সকাল ৯:০০ - বিকাল ৫:০০' },
      ],
      emergencyEmail: 'support@puthiadiary.gov.bd',
      whatsappNumber: '+৮৮০১৭১২৩৪৫৬৭৮',
      officeHours: 'রবিবার - বৃহস্পতিবার, সকাল ৯:০০ টা হতে বিকাল ৫:০০ টা',
      ticketSystemEnabled: true,
      liveChatEnabled: true,
      address: 'পুঠিয়া উপজেলা পরিষদ চত্বর, পুঠিয়া, রাজশাহী - ৬২৬০',
    };
  },

  saveSupportConfig(data: SupportCenterConfig) {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_CONFIG, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'support', data } }));
  },

  // Policy Documents (Privacy, Terms, Content Policy)
  getPrivacyPolicy(): PolicyDocumentContent {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIVACY_POLICY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'আমাদের পুঠিয়া সিটিজেন পোর্টাল গোপনীয়তা নীতি (Privacy Policy)',
      lastUpdated: '৫ সেপ্টেম্বর ২০২৬',
      effectiveDate: '১ জানুয়ারি ২০২৪',
      sections: [
        {
          title: '১. তথ্যের গোপনীয়তা ও সুরক্ষা অঙ্গীকার',
          content: 'আমাদের পুঠিয়া ডিজিটাল ডায়েরি ব্যবহারকারীদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ। ব্যবহারকারীর নাম, ফোন নম্বর, ইমেইল ও অবস্থান সংক্রান্ত ডাটা শুধুমাত্র সেবা প্রদানের উদ্দেশ্যে ব্যবহৃত হয় এবং তা কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না।'
        },
        {
          title: '২. সংগৃহীত তথ্যের ধরণ',
          content: 'নাগরিক সেবা গ্রহণ, রক্তদাতা নিবন্ধন, ব্যবসায়িক লিস্টিং বা জরুরি সহায়তার আবেদনের সময় নাগরিকের প্রদত্ত নাম, জাতীয় পরিচয়পত্র/জন্মনিবন্ধন নম্বর (যদি প্রযোজ্য), মোবাইল নম্বর এবং লোকেশন তথ্য সুরক্ষিত ক্লাউড ডাটাবেসে এনক্রিপ্ট আকারে সংরক্ষিত থাকে।'
        },
        {
          title: '৩. ডাটা এনক্রিপশন ও সাইবার সিকিউরিটি',
          content: 'সকল প্রকার ডেটা ট্রানজেকশনে TLS 1.3 ও আধুনিক SSL এনক্রিপশন ব্যবহার করা হয়। সুপার অ্যাডমিন অডিট ট্রেইলের মাধ্যমে প্রতিটি অ্যাক্সেস মনিটর করা হয়।'
        }
      ]
    };
  },

  savePrivacyPolicy(data: PolicyDocumentContent) {
    localStorage.setItem(STORAGE_KEYS.PRIVACY_POLICY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'privacy', data } }));
  },

  getTermsPolicy(): PolicyDocumentContent {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TERMS_POLICY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'ব্যবহারের সাধারণ শর্তাবলী (Terms & Conditions)',
      lastUpdated: '৫ সেপ্টেম্বর ২০২৬',
      effectiveDate: '১ জানুয়ারি ২০২৪',
      sections: [
        {
          title: '১. পোর্টাল ব্যবহারের নিয়মাবলী',
          content: 'পুঠিয়া সিটিজেন পোর্টালে যুক্ত যে-কোনো তথ্য বা সেবা গ্রহণের ক্ষেত্রে বাংলাদেশের প্রচলিত আইন ও তথ্যপ্রযুক্তি নীতিমালা মেনে চলতে হবে।'
        },
        {
          title: '২. ভুয়া বা বিভ্রান্তিকর তথ্যের নিষেধাজ্ঞা',
          content: 'রক্তদাতা, ডাক্তার, শিক্ষক বা ব্যবসায়িক লিস্টিংয়ে কোনো মিথ্যা বা বিভ্রান্তিকর তথ্য প্রদান করা দণ্ডনীয় অপরাধ। এমন কার্যকলাপে জড়িত অ্যাকাউন্ট স্থায়ীভাবে ব্যান করা হবে।'
        },
        {
          title: '৩. বৌদ্ধিক সম্পত্তি ও কপিরাইট',
          content: 'পোর্টালের ডিজাইন, লোগো, ডাটাবেস ও কনটেন্ট পুঠিয়া ডিজিটাল ডায়েরি কর্তৃপক্ষের সংরক্ষিত সম্পত্তি।'
        }
      ]
    };
  },

  saveTermsPolicy(data: PolicyDocumentContent) {
    localStorage.setItem(STORAGE_KEYS.TERMS_POLICY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'terms', data } }));
  },

  getContentPolicy(): PolicyDocumentContent {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTENT_POLICY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'ডাটা ও কনটেন্ট নীতি (Data & Content Policy)',
      lastUpdated: '৫ সেপ্টেম্বর ২০২৬',
      effectiveDate: '১ জানুয়ারি ২০২৪',
      sections: [
        {
          title: '১. ব্যবহারকারী কর্তৃক আপলোডকৃত কনটেন্ট (UGC)',
          content: 'নাগরিক আড্ডা, মেমোরিজ বা রিভিউ সেকশনে কোনো উস্কানিমূলক, সাম্প্রদায়িক বা রাজনৈতিক অপপ্রচারমূলক কনটেন্ট প্রকাশ সম্পূর্ণ নিষিদ্ধ।'
        },
        {
          title: '২. কনটেন্ট মডারেশন ও এআই ফিল্টারিং',
          content: 'প্ল্যাটফর্মে স্বয়ংক্রিয় এআই মডারেশন ফিল্টার সক্রিয় রয়েছে যা অশোভন শব্দ বা ভুয়া ছবি তাৎক্ষণিক শনাক্ত করে সুপার অ্যাডমিন মডারেশন প্যানেলে ফ্ল্যাগ করে দেয়।'
        }
      ]
    };
  },

  saveContentPolicy(data: PolicyDocumentContent) {
    localStorage.setItem(STORAGE_KEYS.CONTENT_POLICY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'content-policy', data } }));
  },

  // App Download Config
  getAppDownloadConfig(): AppDownloadConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APP_DOWNLOAD);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      appName: 'আমাদের পুঠিয়া - Puthia Citizen App',
      version: 'v2.4.0',
      buildNumber: '108',
      releaseDate: '২০২৬-০৮-২৮',
      apkDownloadUrl: 'https://puthiadiary.gov.bd/downloads/puthia_citizen_v2.4.0.apk',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.puthia.diary',
      appStoreUrl: 'https://apps.apple.com/app/puthia-citizen/id123456789',
      apkSizeMb: '১৮.৫ মেগাবাইট',
      minAndroidVersion: 'Android 8.0 (Oreo) বা তদূর্ধ্ব',
      forceUpdateRequired: false,
      forceUpdateMessage: 'অ্যাপের নতুন ভার্সনে গুরুত্বপূর্ণ সিকিউরিটি আপডেট ও দ্রুতগতির সার্চ যুক্ত করা হয়েছে।',
      whatsNew: [
        '⚡ দ্রুতগতির অফলাইন ও অনলাইন সার্চ ইঞ্জিন সংযোজন',
        '🏥 স্বাস্থ্য ডিরেক্টরিতে লাইভ ডাক্তার সিরিয়াল বুকিং',
        '🔔 জরুরি নাগরিক নোটিফিকেশন ও পুশ অ্যালার্ট সিস্টেম',
        '🛡️ ডিজিটাল আইডি কার্ড ভেরিফিকেশন ও অফলাইন ভল্ট'
      ]
    };
  },

  saveAppDownloadConfig(data: AppDownloadConfig) {
    localStorage.setItem(STORAGE_KEYS.APP_DOWNLOAD, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'download', data } }));
  },

  // Citizen Reviews
  getCitizenReviews(): CitizenReview[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'rev-1',
        userName: 'মোস্তাফিজুর রহমান',
        userEmail: 'mostafiz@gmail.com',
        rating: 5,
        comment: 'পুঠিয়া ডিজিটাল ডায়েরি অত্যন্ত চমৎকার একটি উদ্যোগ। জরুরি রক্তের প্রয়োজনে ৩ মিনিটের মধ্যে ডোনার পেয়েছি!',
        date: '২০২৬-০৯-০৩',
        status: 'approved',
        adminReply: 'ধন্যবাদ মোস্তাফিজুর সাহেব, আপনাদের সেবা দিতে পেরে আমরা আনন্দিত।',
        category: 'ব্লাড ব্যাংক'
      },
      {
        id: 'rev-2',
        userName: 'ফারহানা ইসলাম',
        userEmail: 'farhana@yahoo.com',
        rating: 5,
        comment: 'পৌরসভার হোল্ডিং ট্যাক্স ও ট্রেড লাইসেন্স তথ্যের জন্য এখন আর অফিসে দৌড়াতে হয় না। খুব ভালো লেগেছে।',
        date: '২০২৬-০৯-০১',
        status: 'approved',
        category: 'ই-সেবা'
      },
      {
        id: 'rev-3',
        userName: 'তারেক মাহমুদ',
        userEmail: 'tarek99@gmail.com',
        rating: 4,
        comment: 'রাজবাড়ি দর্শনীয় স্থানগুলোর ছবি ও ইতিহাস খুবই সুন্দরভাবে তুলে ধরা হয়েছে। শুভকামনা।',
        date: '২০২৬-০৮-২৯',
        status: 'approved',
        category: 'পর্যটন'
      }
    ];
  },

  saveCitizenReviews(reviews: CitizenReview[]) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'reviews', data: reviews } }));
  },

  // Citizen Complaints
  getCitizenComplaints(): CitizenComplaint[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'comp-101',
        trackingId: 'PUT-GR-2026-089',
        citizenName: 'আব্দুল করিম',
        phone: '০১৭XXXXXXXX',
        union: 'বানেশ্বর ইউনিয়ন',
        subject: 'বানেশ্বর হাটের প্রবেশমুখে সড়ক সংস্কার সংক্রান্ত',
        description: 'বানেশ্বর হাটের প্রধান রোডে ভারী বর্ষণে গর্ত সৃষ্টি হয়েছে, যানবাহন চলাচলে ভোগান্তি হচ্ছে।',
        category: 'সড়ক ও পরিবহন',
        status: 'under_review',
        priority: 'high',
        submittedDate: '২০২৬-০৯-০২',
        resolutionNote: 'উপজেলা প্রকৌশলী বিভাগকে সরেজমিনে পরিদর্শনের নির্দেশনা প্রদান করা হয়েছে।'
      },
      {
        id: 'comp-102',
        trackingId: 'PUT-GR-2026-088',
        citizenName: 'সেলিনা বেগম',
        phone: '০১৮XXXXXXXX',
        union: 'পুঠিয়া সদর ইউনিয়ন',
        subject: 'পল্লী বিদ্যুৎ ভোল্টেজ বিভ্রাট',
        description: 'গ্রামের দক্ষিণ পাড়ায় গত ৩ দিন ধরে লো ভোল্টেজের কারণে সেচ পাম্প চালানো যাচ্ছে না।',
        category: 'বিদ্যুৎ ও জ্বালানি',
        status: 'resolved',
        priority: 'urgent',
        submittedDate: '২০২৬-০৮-৩০',
        resolvedDate: '২০২৬-০৯-০১',
        resolutionNote: 'পল্লী বিদ্যুৎ সমিতির মাধ্যমে নতুন ট্রান্সফরমার স্থাপন করে সমস্যা সমাধান করা হয়েছে।'
      }
    ];
  },

  saveCitizenComplaints(complaints: CitizenComplaint[]) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    window.dispatchEvent(new CustomEvent('site-cms-updated', { detail: { type: 'complaints', data: complaints } }));
  }
};

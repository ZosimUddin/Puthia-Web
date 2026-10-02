// Recommendation Engine for Puthia Smart Portal

export type RecommendationCategory =
  | 'doctor'
  | 'health'
  | 'hospital'
  | 'house_rent'
  | 'education'
  | 'transport'
  | 'vehicle'
  | 'jobs'
  | 'business'
  | 'emergency'
  | 'default';

export interface RecommendedItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string; // Lucide icon identifier
  badge: string;
  path: string;
  phone?: string;
  location?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  rating?: number;
  actionText?: string;
}

// User context storage key
const CONTEXT_KEY = 'puthia_user_browsing_context';

export interface UserBrowsingContext {
  lastCategory: RecommendationCategory;
  lastViewedTitle?: string;
  viewHistory: { category: RecommendationCategory; title: string; timestamp: number }[];
}

/**
 * Save user view activity to localStorage
 */
export function trackUserBrowsing(category: RecommendationCategory, title?: string) {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    let context: UserBrowsingContext = raw
      ? JSON.parse(raw)
      : { lastCategory: 'default', viewHistory: [] };

    context.lastCategory = category;
    if (title) {
      context.lastViewedTitle = title;
      context.viewHistory = [
        { category, title, timestamp: Date.now() },
        ...context.viewHistory.filter((item) => item.title !== title).slice(0, 15),
      ];
    }
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    console.warn('Could not track user browsing:', e);
  }
}

/**
 * Get stored user browsing context
 */
export function getUserBrowsingContext(): UserBrowsingContext {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse user browsing context:', e);
  }
  return { lastCategory: 'default', viewHistory: [] };
}

/**
 * Contextual Rule Registry for Puthia Portal
 */
export const RECOMMENDATION_RULES: Record<RecommendationCategory, RecommendedItem[]> = {
  doctor: [
    {
      id: 'puthia-uaz-health',
      title: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
      category: 'হাসপাতাল ও জরুরি সেবা',
      description: '২৪/৭ ইমার্জেন্সি, প্যাথলজি ও ভর্তি সেবা সংলগ্ন।',
      iconName: 'Hospital',
      badge: 'কাছাকাছি হাসপাতাল',
      path: '/hospital',
      phone: '০১৭৩০-৩২৪৫৬৮',
      location: 'উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, পুঠিয়া',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      rating: 4.8,
      actionText: 'হাসপাতাল বিবরণী'
    },
    {
      id: 'puthia-digital-diagnostic',
      title: 'পুঠিয়া ডিজিটাল ডায়াগনস্টিক & প্যাথলজি',
      category: 'ডায়াগনস্টিক সেন্টার',
      description: 'কম খরচে ইসিজি, আল্ট্রাসাউন্ড, ডিজিটাল এক্স-রে ও রক্তের পরীক্ষা।',
      iconName: 'Activity',
      badge: 'জরুরি ডায়াগনস্টিক',
      path: '/health?category=diagnostic',
      phone: '০১৭৭২-৮৮৯৯০১',
      location: 'রাজবাড়ী রোড (প্রেসক্লাবের বিপরীতে), পুঠিয়া',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      rating: 4.9,
      actionText: 'টেস্ট ও ফি দেখুন'
    },
    {
      id: 'puthia-emergency-ambulance',
      title: 'পুঠিয়া জরুরি অ্যাম্বুলেন্স সার্ভিস',
      category: 'জরুরি অ্যাম্বুলেন্স',
      description: 'উপজেলার যেকোনো স্থানে ১০-১৫ মিনিটে এসি/নন-এসি অ্যাম্বুলেন্স উপস্থিত।',
      iconName: 'Ambulance',
      badge: '২৪/৭ অ্যাম্বুলেন্স',
      path: '/ambulance',
      phone: '০১৭৩১-০০২৪৪৪',
      location: 'পুঠিয়া বাসস্ট্যান্ড, রাজশাহী',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      rating: 4.9,
      actionText: 'কল করুন'
    },
    {
      id: 'puthia-blood-bank',
      title: 'পুঠিয়া ব্লাড ডোনার নেটওয়ার্ক',
      category: 'রক্তদান সেবা',
      description: 'জরুরি মুহূর্তে পুঠিয়ার স্বেসচ্ছাসেবী রক্তদাতাদের তালিকা।',
      iconName: 'Droplet',
      badge: 'জরুরি রক্তদাতা',
      path: '/blood-donors',
      phone: '০১৭৮৯-৫৫৪৪১১',
      location: 'পুঠিয়া উপজেলা',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      rating: 5.0,
      actionText: 'ডোনার খুঁজুন'
    }
  ],

  health: [
    {
      id: 'puthia-uaz-health',
      title: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
      category: 'হাসপাতাল',
      description: 'উপজেলার প্রধান সরকারি হাসপাতাল ও ইমার্জেন্সি বিভাগ।',
      iconName: 'Hospital',
      badge: 'সরকারি হাসপাতাল',
      path: '/hospital',
      phone: '০১৭৩০-৩২৪৫৬৮',
      location: 'পুঠিয়া বাজার, রাজশাহী',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      rating: 4.8,
      actionText: 'হাসপাতাল তথ্য'
    },
    {
      id: 'puthia-specialist-doctors',
      title: 'বিশেষজ্ঞ ডাক্তার তালিকা',
      category: 'চিকিৎসক',
      description: 'মেডিসিন, শিশু, গাইনী, চর্ম ও হৃদরোগ বিশেষজ্ঞ ডাক্তারদের সিরিয়াল।',
      iconName: 'Stethoscope',
      badge: 'বিশেষজ্ঞ ডাক্তার',
      path: '/doctors',
      location: 'পুঠিয়া উপজেলা',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      rating: 4.9,
      actionText: 'সিরিয়াল নিন'
    },
    {
      id: 'puthia-emergency-ambulance',
      title: 'জরুরি অ্যাম্বুলেন্স',
      category: 'অ্যাম্বুলেন্স',
      description: 'অক্সিজেন সুবিধাসহ দ্রুততম সময়ে রাজশাহী রামেক নেওয়ার সুবিধা।',
      iconName: 'Ambulance',
      badge: '২৪/৭ সেবা',
      path: '/ambulance',
      phone: '০১৭৩১-০০২৪৪৪',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'কল দিন'
    }
  ],

  hospital: [
    {
      id: 'puthia-specialist-doctors',
      title: 'পুঠিয়া চেম্বারের বিশেষজ্ঞ ডাক্তারগণ',
      category: 'চিকিৎসক সিরিয়াল',
      description: 'হাসপাতালের পাশাপাশি চেম্বারের বিশেষজ্ঞ ডাক্তারদের দেখার সময়সূচি।',
      iconName: 'Stethoscope',
      badge: 'সিরিয়াল বুকিং',
      path: '/doctors',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      rating: 4.9,
      actionText: 'ডাক্তার নির্বাচন'
    },
    {
      id: 'puthia-blood-bank',
      title: 'পুঠিয়া স্বেচ্ছাসেবী রক্তদাতা ক্লাব',
      category: 'রক্ত ব্যাংক',
      description: 'হাসপাতালে অপারেশনের জন্য বিনামূল্যে রক্তদাতা সংগ্রহ।',
      iconName: 'Droplet',
      badge: 'ফ্রি ব্লাড ডোনার',
      path: '/blood-donors',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'ডোনার কল'
    },
    {
      id: 'puthia-pharmacy-24',
      title: 'পুঠিয়া মডেল ফার্মেসি',
      category: 'ওষুধের দোকান',
      description: '২৪ ঘণ্টা ইনসুলিন, লাইফ-সেভিং ড্রাগস ও হোম ডেলিভারি।',
      iconName: 'Pill',
      badge: '২৪/৭ খোলা ফার্মেসি',
      path: '/health?category=pharmacy',
      phone: '০১৭৮১-২২৩৩৪৪',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionText: 'ওষুধ অর্ডার'
    }
  ],

  house_rent: [
    {
      id: 'puthia-packers-movers',
      title: 'পুঠিয়া বাসা পরিবর্তন ও মালামাল পরিবহন',
      category: 'ট্রান্সপোর্ট সেবা',
      description: 'নিরাপদে নতুন বাসায় মালামাল শিফটিং ও অভিজ্ঞ লেবার সার্ভিস।',
      iconName: 'Truck',
      badge: 'বাসা পরিবর্তন সেবা',
      path: '/vehicle-rental',
      phone: '০১৭৯০-১১২২৩৩',
      location: 'পুঠিয়া উপজেলা',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      actionText: 'গাড়ি বুকিং'
    },
    {
      id: 'puthia-electrician-plumber',
      title: 'পুঠিয়া অভিজ্ঞ ইলেকট্রিশিয়ান & প্লাম্বার',
      category: 'হোম সার্ভিস',
      description: 'নতুন বাসায় বিদ্যুৎ সংযোগ, ফ্যান, এসি ও স্যানিটারি ফিটিং।',
      iconName: 'Wrench',
      badge: 'জরুরি মেরামত',
      path: '/p/electrician',
      phone: '০১৭৬৬-৪৪৪৫৫৫',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionText: 'মিস্ত্রি ডাকুন'
    },
    {
      id: 'puthia-broadband-internet',
      title: 'পুঠিয়া ফাইবার অপটিক ইন্টারনেট সংযোগ',
      category: 'ব্রডব্যান্ড সংযোগ',
      description: 'নতুন বাসায় হাই-স্পিড ওয়াইফাই সংযোগ ও ফ্রি রাউটার কনফিগার।',
      iconName: 'Wifi',
      badge: 'ইন্টারনেট কানেকশন',
      path: '/p/internet',
      phone: '০১৭৫৫-৬৬৭৭৮৮',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      actionText: 'সংযোগ নিন'
    }
  ],

  education: [
    {
      id: 'puthia-coaching-academic',
      title: 'পুঠিয়া একাডেমিক কোচিং & ক্যাডেট একাডেমি',
      category: 'কোচিং ও টিউটোরিয়াল',
      description: 'এইচএসসি, এসএসসি ও প্রাইমারি ক্যান্ডিডেটদের স্পেশাল কেয়ার।',
      iconName: 'BookOpen',
      badge: 'সেরা রেজাল্ট',
      path: '/coaching',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      rating: 4.8,
      actionText: 'ভর্তি তথ্য'
    },
    {
      id: 'puthia-bookstore-library',
      title: 'রাজবাড়ী বইবিতান & স্টেশনারি',
      category: 'বই ও লাইব্রেরি',
      description: 'সকল শ্রেণীর গাইড, নোটবুক, কলম ও ফটোকপি সুবিধা।',
      iconName: 'BookMarked',
      badge: 'শিক্ষা উপকরণ',
      path: '/library',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionText: 'বই খুঁজুন'
    },
    {
      id: 'puthia-scholarships',
      title: 'উপজেলা মেধা স্কলারশিপ & বৃত্তি তথ্য',
      category: 'বৃত্তি ও উপবৃত্তি',
      description: 'দরিদ্র ও মেধাবী ছাত্র-ছাত্রীদের সরকারি উপবৃত্তি আবেদন।',
      iconName: 'Award',
      badge: 'উপবৃত্তি আবেদন',
      path: '/scholarships',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      actionText: 'আবেদন যোগ্যতা'
    }
  ],

  transport: [
    {
      id: 'puthia-cng-auto-stand',
      title: 'পুঠিয়া সিএনজি & অটো রিজার্ভ স্ট্যান্ড',
      category: 'স্থানীয় পরিবহন',
      description: 'রাজশাহী, নাটোর, দুর্গাপুর রোডে লোকাল ও রিজার্ভ সিএনজি।',
      iconName: 'Car',
      badge: 'লোকাল ট্রিপ',
      path: '/cng-auto',
      phone: '০১৭৪-৯৯০০০১',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionText: 'ড্রাইভার ফোন'
    },
    {
      id: 'puthia-bike-share',
      title: 'পুঠিয়া বাইক রাইড শেয়ার সার্ভিস',
      category: 'বাইক শেয়ার',
      description: 'উপজেলার যেকোনো গ্রামে দ্রুত যাতায়াতে সাশ্রয়ী বাইক রাইড।',
      iconName: 'Navigation',
      badge: 'দ্রুত রাইড',
      path: '/ride-share',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionText: 'বাইক ডাকুন'
    },
    {
      id: 'puthia-petrol-pump',
      title: 'পুঠিয়া মহাসড়ক ফিলিং স্টেশন (পেট্রোল পাম্প)',
      category: 'ফুয়েল স্টেশন',
      description: '২৪ ঘণ্টা খাঁটি পেট্রোল, ডিজেল, অক্টেন ও টায়ার প্রেশার চেইক।',
      iconName: 'Fuel',
      badge: '২৪ ঘণ্টা ফুয়েল',
      path: '/petrol-pump',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'ম্যাপ লোকেশন'
    }
  ],

  vehicle: [
    {
      id: 'puthia-cng-auto-stand',
      title: 'পুঠিয়া রিজার্ভ গাড়ি ও সিএনজি স্ট্যান্ড',
      category: 'যানবাহন ভাড়া',
      description: 'পারিবারিক সফর, বিবাহ বা হাসপাতালে যাওয়ার জন্য কার/হাইয়েস।',
      iconName: 'Car',
      badge: 'গাড়ি ভাড়া',
      path: '/vehicle-rental',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      actionText: 'গাড়ি বুকিং'
    },
    {
      id: 'puthia-petrol-pump',
      title: 'পুঠিয়া ফিলিং স্টেশন',
      category: 'পেট্রোল পাম্প',
      description: 'ঢাকা-রাজশাহী মহাসড়কে নিরবচ্ছিন্ন ফুয়েল ও সার্ভিসিং।',
      iconName: 'Fuel',
      badge: 'মহাসড়ক পাম্প',
      path: '/petrol-pump',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'পাম্প স্থান'
    }
  ],

  jobs: [
    {
      id: 'puthia-freelancing-hub',
      title: 'পুঠিয়া ডিজিটাল ফ্রিল্যান্সিং আইটি ট্রেনিং',
      category: 'দক্ষতা উন্নয়ন',
      description: 'গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং ও ডাটা এন্ট্রি ফ্রী কোর্স।',
      iconName: 'Laptop',
      badge: 'আইটি প্রশিক্ষণ',
      path: '/freelancing',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      actionText: 'কোর্স বিবরণী'
    },
    {
      id: 'puthia-govt-job-circulars',
      title: 'রাজশাহী জেলা ও উপজেলা সরকারি নিয়োগ বিজ্ঞপ্তি',
      category: 'সরকারি চাকরি',
      description: 'উপজেলা পরিষদ, স্বাস্থ্য বিভাগ ও ইউনিয়ন পরিষদের শূন্যপদ।',
      iconName: 'Briefcase',
      badge: 'সরকারি সার্কুলার',
      path: '/govt-jobs',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionText: 'বিজ্ঞপ্তি দেখুন'
    }
  ],

  business: [
    {
      id: 'puthia-verified-shops',
      title: 'পুঠিয়া ভেরিফাইড বাজার ডিরেক্টরি',
      category: 'ব্যবসা ও দোকান',
      description: 'পুঠিয়ার ট্রাস্টেড দোকান, মোবাইল শপ, পোশাক ও জুয়েলারি।',
      iconName: 'Store',
      badge: 'ভেরিফাইড দোকান',
      path: '/businesses',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      actionText: 'দোকান তালিকা'
    },
    {
      id: 'puthia-trade-license',
      title: 'উপজেলা ট্রেড লাইসেন্স ও অনলাইন ই-সেবা',
      category: 'ব্যবসা অনুমোদন',
      description: 'নতুন ট্রেড লাইসেন্স আবেদন ও নবায়নের সরকারি পোর্টাল।',
      iconName: 'FileCheck',
      badge: 'ই-সেবা',
      path: '/e-services',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionText: 'অনলাইন আবেদন'
    }
  ],

  emergency: [
    {
      id: 'puthia-emergency-ambulance',
      title: 'পুঠিয়া জরুরি অ্যাম্বুলেন্স সার্ভিস',
      category: 'অ্যাম্বুলেন্স',
      description: '২৪/৭ ড্রাইভারদের ফোন নাম্বার ও হাসপাতাল ট্রিপ।',
      iconName: 'Ambulance',
      badge: 'জরুরি অ্যাম্বুলেন্স',
      path: '/ambulance',
      phone: '০১৭৩১-০০২৪৪৪',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'জরুরি কল'
    },
    {
      id: 'puthia-fire-service',
      title: 'পুঠিয়া ফায়ার সার্ভিস & সিভিল ডিফেন্স',
      category: 'ফায়ার সার্ভিস',
      description: 'আগুন বা যেকোনো দুর্ঘটনায় তাৎক্ষণিক উদ্ধার টিম।',
      iconName: 'Flame',
      badge: 'ফায়ার স্টেশন',
      path: '/emergency',
      phone: '০১৭৩০-০০১২৩৪',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      actionText: 'ফায়ার স্টেশনে কল'
    }
  ],

  default: [
    {
      id: 'puthia-uaz-health',
      title: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
      category: 'জরুরি স্বাস্থ্যসেবা',
      description: '২৪ ঘণ্টা ইমার্জেন্সি বিভাগ, প্যাথলজি ও অ্যাম্বুলেন্স স্ট্যান্ড।',
      iconName: 'Hospital',
      badge: 'জরুরি হাসপাতাল',
      path: '/hospital',
      phone: '০১৭৩০-৩২৪৫৬৮',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      rating: 4.8,
      actionText: 'হাসপাতাল সেবাসমূহ'
    },
    {
      id: 'puthia-verified-shops',
      title: 'পুঠিয়া ভেরিফাইড লোকাল বাজার',
      category: 'সেরা ব্যবসা',
      description: 'উপজেলার সেরা রেটিংপ্রাপ্ত দোকান, মার্কেট ও রেস্টুরেন্ট।',
      iconName: 'Store',
      badge: 'জনপ্রিয় বাজার',
      path: '/businesses',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      rating: 4.9,
      actionText: 'দোকানসমূহ দেখুন'
    },
    {
      id: 'puthia-cng-auto-stand',
      title: 'পুঠিয়া লোকাল সিএনজি & অটো রাইড',
      category: 'পরিবহন তথ্য',
      description: 'রাজশাহী ও নাটোর রোডে যাতায়াতের সিএনজি ও বাস সময়সূচি।',
      iconName: 'Car',
      badge: 'স্থানীয় যাতায়াত',
      path: '/cng-auto',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      actionText: 'গাড়ি স্ট্যান্ড'
    }
  ]
};

/**
 * Get Recommendations based on category or user context
 */
export function getContextualRecommendations(
  currentCategory?: RecommendationCategory | string,
  limit: number = 4
): RecommendedItem[] {
  let category: RecommendationCategory = 'default';

  if (currentCategory && (currentCategory as RecommendationCategory) in RECOMMENDATION_RULES) {
    category = currentCategory as RecommendationCategory;
  } else {
    // Fallback to user history
    const userCtx = getUserBrowsingContext();
    if (userCtx.lastCategory && userCtx.lastCategory in RECOMMENDATION_RULES) {
      category = userCtx.lastCategory;
    }
  }

  const items = RECOMMENDATION_RULES[category] || RECOMMENDATION_RULES.default;
  return items.slice(0, limit);
}

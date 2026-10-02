export interface NGOProjectItem {
  id: string;
  name: string;
  targetArea: string;
  startDate: string;
  endDate: string;
  status: 'চলমান' | 'সম্পন্ন' | 'আসন্ন';
  description: string;
}

export interface NGOActivityItem {
  id: string;
  title: string;
  location: string;
  date: string;
  image?: string;
  description: string;
}

export interface NGOReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface NGOData {
  id: string;
  name: string;
  applicantName?: string;
  logoUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  type: 'স্থানীয়' | 'জাতীয়' | 'আন্তর্জাতিক';
  category: string; // e.g. 'education', 'women_development'
  union: string;
  location: string;
  establishedYear: string;
  registrationNumber?: string;
  headOffice?: string;
  puthiaOffice?: string;
  workingArea?: string;
  membersCount?: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  shortDescription: string;
  description: string;
  services: string[];
  serviceFields: string[]; // e.g. ['শিক্ষা', 'স্বাস্থ্য', 'নারী']
  activities: NGOActivityItem[];
  projects: NGOProjectItem[];
  mapLocationUrl?: string;
  distance: string;
  rating: number;
  reviewCount: number;
  ratingBreakdown?: { [stars: number]: number };
  reviews: NGOReviewItem[];
  gallery?: string[];
  status: 'Draft' | 'Pending Review' | 'Verified' | 'Rejected' | 'Suspended';
  createdAt?: any;
  views?: number;
}

export const NGO_CATEGORIES = [
  { id: 'all', label: 'সকল', icon: '🌐' },
  { id: 'education', label: 'শিক্ষা', icon: '🎓' },
  { id: 'health', label: 'স্বাস্থ্য', icon: '❤️' },
  { id: 'women_development', label: 'নারী উন্নয়ন', icon: '👩' },
  { id: 'child_development', label: 'শিশু উন্নয়ন', icon: '👶' },
  { id: 'youth_development', label: 'যুব উন্নয়ন', icon: '👨‍🎓' },
  { id: 'agri_environment', label: 'কৃষি ও পরিবেশ', icon: '🌱' },
  { id: 'poverty_alleviation', label: 'দারিদ্র্য বিমোচন', icon: '💰' },
  { id: 'humanitarian', label: 'মানবিক সহায়তা', icon: '🤝' },
  { id: 'social_development', label: 'সামাজিক উন্নয়ন', icon: '🏛️' },
  { id: 'skill_development', label: 'দক্ষতা উন্নয়ন', icon: '💼' },
  { id: 'others', label: 'অন্যান্য', icon: '✨' },
];

export const UNIONS = [
  'সব ইউনিয়ন',
  'ভালুকগাছি',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'জিউপাড়া',
  'পুঠিয়া',
  'শিলমাড়িয়া'
];

export const NGO_TYPES = [
  'সব ধরন',
  'স্থানীয়',
  'জাতীয়',
  'আন্তর্জাতিক'
];

export const SERVICE_FIELDS = [
  'শিক্ষা',
  'স্বাস্থ্য',
  'নারী',
  'শিশু',
  'কৃষি',
  'পরিবেশ',
  'যুব',
  'মানবিক সহায়তা'
];

export const DISTANCE_OPTIONS = [
  'সব দূরত্ব',
  '১ কিমি',
  '৫ কিমি',
  '১০ কিমি',
  '২০ কিমি+'
];

export const SORT_OPTIONS = [
  { id: 'popular', label: 'জনপ্রিয়' },
  { id: 'rating', label: 'সর্বোচ্চ রেটিং' },
  { id: 'distance', label: 'কাছাকাছি' },
  { id: 'newest', label: 'নতুন যুক্ত হয়েছে' },
  { id: 'name', label: 'নাম অনুযায়ী' },
];

export const SEED_NGOS: NGOData[] = [
  {
    id: 'ngo-brac-puthia',
    name: 'ব্র্যাক (BRAC)',
    applicantName: 'মোঃ শফিকুল ইসলাম',
    logoUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'আন্তর্জাতিক',
    category: 'women_development',
    union: 'পুঠিয়া',
    location: 'পুঠিয়া সদর, রাজশাহী',
    establishedYear: '১৯৭২',
    registrationNumber: 'NGO-100234',
    headOffice: '৭৫ মহাখালী, ঢাকা-১২১২',
    puthiaOffice: 'পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া বাজার, রাজশাহী',
    workingArea: 'পুঠিয়া উপজেলার ৬টি ইউনিয়ন',
    membersCount: '৪৫ জন কর্মী',
    contactPerson: 'মোঃ শফিকুল ইসলাম (শাখা ব্যবস্থাপক)',
    contactPersonPhone: '01711-234567',
    phone: '01711-234567',
    whatsapp: '01711-234567',
    email: 'puthia.brac@gmail.com',
    website: 'https://www.brac.net',
    facebook: 'https://facebook.com/BRACWorld',
    shortDescription: 'নারী ক্ষমতায়ন, স্বাস্থ্য, শিক্ষা ও ক্ষুদ্রঋণ সেবার মাধ্যমে দারিদ্র্য বিমোচনে নিবেদিত।',
    description: 'ব্র্যাক বিশ্বজুড়ে অন্যতম শীর্ষ সামাজিক উন্নয়ন সংস্থা। পুঠিয়া উপজেলায় সংস্থাটি গত তিন দশক ধরে শিক্ষা সহায়তা, মা ও শিশু স্বাস্থ্যসেবা, নারী উদ্যোক্তা তৈরি, বিশুদ্ধ পানি সরবরাহ এবং সামাজিক সুরক্ষামূলক নানা কার্যক্রম পরিচালনা করে আসছে।',
    services: [
      '🎓 শিক্ষা সহায়তা ও প্রাথমিক বিদ্যালয় পরিচালনা',
      '❤️ গর্ভবতী মা ও শিশুদের স্বাস্থ্যসেবা',
      '👩 নারী ক্ষমতায়ন ও আইনি সহায়তা',
      '💰 সঞ্চয় ও অতিদরিদ্রদের জন্য ক্ষুদ্রঋণ',
      '🌱 কৃষিপ্রযুক্তি ও বীজ বিতরণ'
    ],
    serviceFields: ['শিক্ষা', 'স্বাস্থ্য', 'নারী', 'কৃষি', 'মানবিক সহায়তা'],
    activities: [
      {
        id: 'act-1',
        title: 'ফ্রি স্বাস্থ্য ক্যাম্প ও ওষুধ বিতরণ',
        location: 'বানেশ্বর ইউনিয়ন পরিষদ প্রাঙ্গণ',
        date: '১৫ জানুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        description: 'পুঠিয়া উপজেলার বানেশ্বরে ৩৫০ জন গর্ভবতী মা ও শিশুকে নিখরচায় স্বাস্থ্য পরীক্ষা এবং প্রয়োজনীয় অ্যান্টিবায়েটিক ও মডার্ন ভিটামিন ওষুধ বিতরণ করা হয়েছে।'
      },
      {
        id: 'act-2',
        title: 'নারী উদ্যোক্তা প্রশিক্ষণ কর্মশালা',
        location: 'পুঠিয়া ব্র্যাক ট্রেনিং সেন্টার',
        date: '০২ ফেব্রুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        description: '৫০ জন গ্রামীণ নারীকে হস্তশিল্প, সেলাই ও ক্ষুদ্র ব্যবসা পরিচালনার জন্য ৫ দিনব্যাপী আবাসিক দক্ষতা উন্নয়ন প্রশিক্ষণ প্রদান।'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'আল্ট্রা-পুওর গ্র্যাজুয়েশন প্রোগ্রাম (UPG)',
        targetArea: 'ভালুকগাছি ও জিউপাড়া ইউনিয়ন',
        startDate: 'জানুয়ারি ২০২৫',
        endDate: 'ডিসেম্বর ২০২৬',
        status: 'চলমান',
        description: 'অতিদরিদ্র পরিবারসমূহকে স্বাবলম্বী করতে গবাদিপশু বিতরণ, সম্পদ হস্তান্তর ও ধারাবাহিক কারিগরি পরামর্শ দান।'
      },
      {
        id: 'proj-2',
        name: 'কৈশোর প্রজনন স্বাস্থ্য ও মানসিক বিকাশ প্রকল্প',
        targetArea: 'পুঠিয়া উপজেলার সকল মাধ্যমিক বিদ্যালয়',
        startDate: 'মার্চ ২০২৪',
        endDate: 'নভেম্বর ২০২৫',
        status: 'সম্পন্ন',
        description: 'কিশোর-কিশোরীদের প্রজনন স্বাস্থ্য সচেতনতা তৈরি ও বয়ঃসন্ধিকালীন স্বাস্থ্যসুরক্ষা কিট বিতরণ।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Puthia+Rajbari+Rajshahi',
    distance: '১.২ কিমি',
    rating: 4.8,
    reviewCount: 128,
    ratingBreakdown: { 5: 95, 4: 22, 3: 8, 2: 2, 1: 1 },
    reviews: [
      {
        id: 'rev-1',
        userName: 'মোসাঃ সালেহা বেগম',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '৫ দিন আগে',
        comment: 'ব্র্যাকের স্বাস্থ্য ক্যাম্প থেকে আমার ছোট বাচ্চার চিকিৎসা পেয়েছি। ডাক্তারদের ব্যবহার খুব চমৎকার ছিল।'
      },
      {
        id: 'rev-2',
        userName: 'আব্দুল করিম',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '২ সপ্তাহ আগে',
        comment: 'ক্ষুদ্রঋণ নিয়ে আমাদের কাপড়ের দোকান অনেক বড় করেছি। কিস্তি আদায়ে তারা সবসময় সহনশীল আচরণ করেন।'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 1420
  },
  {
    id: 'ngo-asa-puthia',
    name: 'আশা (ASA)',
    applicantName: 'মোঃ মোস্তাফিজুর রহমান',
    logoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'জাতীয়',
    category: 'poverty_alleviation',
    union: 'বানেশ্বর',
    location: 'বানেশ্বর বাজার, পুঠিয়া, রাজশাহী',
    establishedYear: '১৯৭৮',
    registrationNumber: 'NGO-100889',
    headOffice: 'আশা টাওয়ার, শ্যামলী, ঢাকা',
    puthiaOffice: 'বানেশ্বর বাজার হাইস্কুল রোড, পুঠিয়া',
    workingArea: 'বানেশ্বর, বেলপুকুরিয়া ও পুঠিয়া সদর',
    membersCount: '২৮ জন কর্মী',
    contactPerson: 'মোঃ মোস্তাফিজুর রহমান (এরিয়া ম্যানেজার)',
    contactPersonPhone: '01819-345678',
    phone: '01819-345678',
    whatsapp: '01819-345678',
    email: 'baneswar.asa@asa.org.bd',
    website: 'https://www.asa.org.bd',
    facebook: 'https://facebook.com/ASA.Bangladesh',
    shortDescription: 'ক্ষুদ্র ঋণ, শিক্ষা উন্নয়ন ও চিকিৎসাসেবার মাধ্যমে স্বনির্ভর বাংলাদেশ গড়ার প্রত্যয়।',
    description: 'আশা বাংলাদেশের অন্যতম প্রধান আত্ম-নির্ভরশীল এনজিও। বানেশ্বর ও পার্শ্ববর্তী এলাকায় আশার শাখা থেকে নিয়মিত প্রাক-প্রাথমিক শিক্ষা কেন্দ্র পরিচালনা, বিশেষজ্ঞ চিকিৎসকের মাধ্যমে ফ্রি মেডিকেল সুবিধা এবং ক্ষুদ্র উদ্যোক্তাদের আর্থিক ঋণ প্রদান করা হয়।',
    services: [
      '🎓 প্রাথমিক শিক্ষা সহায়তা কেন্দ্র',
      '❤️ ফিজিওথেরাপি ও সাধারণ চিকিৎসা সুবিধা',
      '💰 ক্ষুদ্র ও মাঝারি ব্যবসায়িক ঋণ'
    ],
    serviceFields: ['শিক্ষা', 'স্বাস্থ্য', 'মানবিক সহায়তা'],
    activities: [
      {
        id: 'act-asa-1',
        title: 'শিক্ষার্থী শিক্ষাবৃত্তি বিতরণ',
        location: 'বানেশ্বর আশা অফিস মিলনায়তন',
        date: '১০ জানুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
        description: 'পুঠিয়া উপজেলার ৫০ জন অসচ্ছল মেধাবী শিক্ষার্থীকে বাৎসরিক নগদ শিক্ষাবৃত্তি ও বই-খাতা প্রদান করা হয়।'
      }
    ],
    projects: [
      {
        id: 'proj-asa-1',
        name: 'সবার জন্য স্বাস্থ্যসেবা প্রকল্প',
        targetArea: 'বানেশ্বর ও বেলপুকুরিয়া ইউনিয়ন',
        startDate: 'ফেব্রুয়ারি ২০২৫',
        endDate: 'ফেব্রুয়ারি ২০২৭',
        status: 'চলমান',
        description: 'সপ্তাহে ২ দিন অভিজ্ঞ এমবিবিএস ডাক্তার দ্বারা নামমাত্র মূল্যে চিকিৎসা সেবা ও ডায়াবেটিস পরীক্ষা।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Baneswar+Rajshahi',
    distance: '২.৫ কিমি',
    rating: 4.6,
    reviewCount: 94,
    ratingBreakdown: { 5: 65, 4: 20, 3: 6, 2: 2, 1: 1 },
    reviews: [
      {
        id: 'rev-asa-1',
        userName: 'মোঃ রফিকুল ইসলাম',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '১ মাস আগে',
        comment: 'আমার মেয়ে আশার শিক্ষাবৃত্তি পেয়ে কলেজে পড়তে পারছে। তাদের এ উদ্যোগ অত্যন্ত প্রশংসনীয়।'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 980
  },
  {
    id: 'ngo-tmss-puthia',
    name: 'টিএমএসএস (TMSS)',
    applicantName: 'মোসাঃ নাসরিন আক্তার',
    logoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'জাতীয়',
    category: 'women_development',
    union: 'বেলপুকুরিয়া',
    location: 'বেলপুকুরিয়া মোড়, পুঠিয়া, রাজশাহী',
    establishedYear: '১৯৮০',
    registrationNumber: 'NGO-100412',
    headOffice: 'টিএমএসএস ভবন, মাটিডালি, বগুড়া',
    puthiaOffice: 'বেলপুকুরিয়া স্টেশন রোড, পুঠিয়া',
    workingArea: 'বেলপুকুরিয়া ও শিলমাড়িয়া ইউনিয়ন',
    membersCount: '৩২ জন কর্মী',
    contactPerson: 'মোসাঃ নাসরিন আক্তার (শাখা ব্যবস্থাপক)',
    contactPersonPhone: '01713-456789',
    phone: '01713-456789',
    whatsapp: '01713-456789',
    email: 'tmss.puthia@gmail.com',
    website: 'https://www.tmss-bd.org',
    facebook: 'https://facebook.com/TMSSNGO',
    shortDescription: 'নারীর আর্থ-সামাজিক সামাজিক ক্ষমতায়ন, কারিগরি শিক্ষা ও আইসিবি প্রকল্প।',
    description: 'টিএমএসএস নারীদের আত্মকর্মসংস্থান সৃষ্টিতে নানা প্রশিক্ষণ ও কারিগরি সহায়তা দান করে। সেলাই, কম্পিউটার চালনা, হাঁস-মুরগি পালন এবং ড্রাইভিং বিষয়ে প্রশিক্ষণ প্রদান করা হয়ে থাকে।',
    services: [
      '👩 নারী ক্ষমতায়ন ও কারিগরি প্রশিক্ষণ',
      '👶 শিশু শিক্ষা সাপোর্ট',
      '💼 হস্তশিল্প ও সেলাই কোর্স'
    ],
    serviceFields: ['নারী', 'দক্ষতা উন্নয়ন', 'শিশু'],
    activities: [
      {
        id: 'act-tmss-1',
        title: 'ফ্রি সেলাই মেশিন বিতরণ',
        location: 'বেলপুকুরিয়া ইউনিয়ন প্রাঙ্গণ',
        date: '২০ ডিসেম্বর, ২০২৫',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
        description: 'প্রশিক্ষণপ্রাপ্ত ২০ জন দুস্থ নারীকে বিনামূল্যে সেলাই মেশিন প্রদান।'
      }
    ],
    projects: [
      {
        id: 'proj-tmss-1',
        name: 'ডিজিটাল আইসিটি দক্ষতা উন্নয়ন প্রকল্প',
        targetArea: 'বেলপুকুরিয়া ইউনিয়ন',
        startDate: 'মার্চ ২০২৫',
        endDate: 'ডিসেম্বর ২০২৫',
        status: 'সম্পন্ন',
        description: '১০০ জন তরুণ-তরুণীকে কম্পিউটার অফিস অ্যাপ্লিকেশন বিষয়ে ফ্রি প্রশিক্ষণ দান।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Belpukuria+Puthia+Rajshahi',
    distance: '৪.১ কিমি',
    rating: 4.5,
    reviewCount: 76,
    ratingBreakdown: { 5: 50, 4: 18, 3: 5, 2: 2, 1: 1 },
    reviews: [
      {
        id: 'rev-tmss-1',
        userName: 'মোসাঃ রেশমা পারভীন',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '৩ সপ্তাহ আগে',
        comment: 'টিএমএসএস থেকে সেলাই কাজ শিখে আমি এখন নিজের বুটিক শপ চালাচ্ছি।'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 710
  },
  {
    id: 'ngo-grameen-bank-puthia',
    name: 'গ্রামীণ ব্যাংক (Grameen Bank)',
    applicantName: 'মোঃ আকমল হোসেন',
    logoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'জাতীয়',
    category: 'poverty_alleviation',
    union: 'ভালুকগাছি',
    location: 'ভালুকগাছি বাজার, পুঠিয়া, রাজশাহী',
    establishedYear: '১৯৮৩',
    registrationNumber: 'GB-PUTH-01',
    headOffice: 'গ্রামীণ ব্যাংক ভবন, মিরপুর, ঢাকা',
    puthiaOffice: 'ভালুকগাছি চৌরাস্তা মোড়, পুঠিয়া',
    workingArea: 'ভালুকগাছি ও জিউপাড়া ইউনিয়ন',
    membersCount: '২০ জন কর্মী',
    contactPerson: 'মোঃ আকমল হোসেন (শাখা ব্যবস্থাপক)',
    contactPersonPhone: '01715-678901',
    phone: '01715-678901',
    whatsapp: '01715-678901',
    email: 'valukgachi.gb@grameen.org',
    website: 'https://www.grameen.com',
    facebook: 'https://facebook.com/GrameenBankOfficial',
    shortDescription: 'জামানতহীন ক্ষুদ্র ঋণ দিয়ে গ্রামীণ দরিদ্র জনগোষ্ঠীর জীবনমান উন্নয়ন।',
    description: 'গ্রামীণ ব্যাংক নোবেলজয়ী ক্ষুদ্রঋণ প্রদানকারী প্রতিষ্ঠান। পুঠিয়া উপজেলার গ্রামে গ্রামে কেন্দ্র গঠন করে বিশেষত নারীদের জামানত ছাড়া ঋণ ও শিক্ষা ঋণ প্রদান করা হয়।',
    services: [
      '💰 জামানতহীন ক্ষুদ্র ঋণ',
      '🎓 উচ্চ শিক্ষা ঋণ প্রকল্প',
      '🏡 গৃহনির্মাণ ঋণ'
    ],
    serviceFields: ['শিক্ষা', 'নারী', 'মানবিক সহায়তা'],
    activities: [
      {
        id: 'act-gb-1',
        title: 'শিক্ষা ঋণ চেক হস্তান্তর',
        location: 'ভালুকগাছি গ্রামীণ ব্যাংক কেন্দ্র',
        date: '১৮ জানুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=80',
        description: 'বিশ্ববিদ্যালয়ে অধ্যয়নরত ১০ জন শিক্ষার্থীকে সুদমুক্ত উচ্চ শিক্ষা ঋণের চেক প্রদান করা হয়।'
      }
    ],
    projects: [
      {
        id: 'proj-gb-1',
        name: 'স্ট্রাগলিং মেম্বার (ভিক্ষুক মুক্তকরণ) প্রকল্প',
        targetArea: 'ভালুকগাছি ইউনিয়ন',
        startDate: 'জানুয়ারি ২০২৪',
        endDate: 'ডিসেম্বর ২০২৬',
        status: 'চলমান',
        description: 'ভিক্ষাবৃত্তিতে নিয়োজিত ব্যক্তিদের বিনাসূদে পুঁজি দিয়ে ছোট দোকানে সম্পৃক্ত করা।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Valukgachi+Puthia',
    distance: '৩.৮ কিমি',
    rating: 4.7,
    reviewCount: 110,
    ratingBreakdown: { 5: 80, 4: 20, 3: 8, 2: 1, 1: 1 },
    reviews: [
      {
        id: 'rev-gb-1',
        userName: 'মোসাঃ আয়েশা সিদ্দিকা',
        userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '১ সপ্তাহ আগে',
        comment: 'ছেলেকে ইঞ্জিনিয়ারিং পড়াতে গ্রামীণ ব্যাংকের শিক্ষা ঋণ পেয়েছি। খুব সহজ নিয়ম।'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 1120
  },
  {
    id: 'ngo-wave-puthia',
    name: 'ওয়েভ ফাউন্ডেশন (Wave Foundation)',
    applicantName: 'মোঃ মহসিন রেজা',
    logoUrl: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'জাতীয়',
    category: 'social_development',
    union: 'জিউপাড়া',
    location: 'জিউপাড়া বাসস্ট্যান্ড, পুঠিয়া, রাজশাহী',
    establishedYear: '১৯৯০',
    registrationNumber: 'WAVE-PUTH-12',
    headOffice: 'মোহাম্মদপুর, ঢাকা',
    puthiaOffice: 'জিউপাড়া বাজার সংলগ্ন, পুঠিয়া',
    workingArea: 'জিউপাড়া ও শিলমাড়িয়া ইউনিয়ন',
    membersCount: '১৮ জন কর্মী',
    contactPerson: 'মোঃ মহসিন রেজা (সমন্বয়কারী)',
    contactPersonPhone: '01716-789012',
    phone: '01716-789012',
    whatsapp: '01716-789012',
    email: 'puthia@wavefoundationbd.org',
    website: 'https://wavefoundationbd.org',
    facebook: 'https://facebook.com/WaveFoundationBD',
    shortDescription: 'সুশাসন, মানবাধিকার, সামাজিক সুবিচার এবং টেকসই কৃষি উন্নয়নে কাজ করছে।',
    description: 'ওয়েভ ফাউন্ডেশন পুঠিয়া উপজেলার কৃষকদের জৈব সার প্রস্তুতকরণ, নিরাপদ সবজি চাষ এবং গ্রামীণ সুশাসন প্রতিষ্ঠায় সিটিজেন প্ল্যাটফর্ম পরিচালনা করে আসছে।',
    services: [
      '🌱 নিরাপদ কৃষি প্রযুক্তি ও প্রজনন বীজ',
      '⚖️ সামাজিক বিচার ও আইনগত সহায়তা',
      '👨‍🎓 যুব কল্যাণ আন্দোলন'
    ],
    serviceFields: ['কৃষি', 'পরিবেশ', 'যুব', 'মানবিক সহায়তা'],
    activities: [
      {
        id: 'act-wave-1',
        title: 'জৈব সার উৎপাদন ও পরিবেশ সচেতনতা সভা',
        location: 'জিউপাড়া পরিষদ মিলনায়তন',
        date: '১২ জানুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
        description: 'কেমিক্যাল সার কমিয়ে ভার্মিকম্পোস্ট চাষে কৃষকদের উদ্বুদ্ধকরণ ও প্রশিক্ষণ প্রদান।'
      }
    ],
    projects: [
      {
        id: 'proj-wave-1',
        name: 'স্মার্ট এগ্রিকালচার উইথ ক্লাইমেট রেজিলিয়েন্স',
        targetArea: 'জিউপাড়া ও শিলমাড়িয়া',
        startDate: 'মার্চ ২০২৫',
        endDate: 'ফেব্রুয়ারি ২০২৭',
        status: 'চলমান',
        description: 'জলবায়ু সহনশীল জাতের ধান ও সবজি চাষের জন্য ২০০ জন কৃষককে প্রদশর্নী প্লট বরাদ্দ।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Jiupara+Puthia',
    distance: '৬.২ কিমি',
    rating: 4.4,
    reviewCount: 42,
    ratingBreakdown: { 5: 25, 4: 12, 3: 3, 2: 1, 1: 1 },
    reviews: [
      {
        id: 'rev-wave-1',
        userName: 'কৃষক মোঃ সিরাজুল ইসলাম',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '২ সপ্তাহ আগে',
        comment: 'ওয়েভ ফাউন্ডেশনের পরামর্শে কেঁচো সার তৈরি করে আমার জমিতে খরচ অনেক কমেছে।'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 450
  },
  {
    id: 'ngo-puthia-unnnayan-sangstha',
    name: 'পুঠিয়া সামাজিক উন্নয়ন সংস্থা (PUS)',
    applicantName: 'প্রকৌশলী আলতাফ হোসেন',
    logoUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&auto=format&fit=crop&q=80',
    isVerified: true,
    type: 'স্থানীয়',
    category: 'social_development',
    union: 'পুঠিয়া',
    location: 'পুঠিয়া থানা মোড়, রাজশাহী',
    establishedYear: '২০১০',
    registrationNumber: 'RAJ-PUTH-554',
    headOffice: 'পুঠিয়া বাজার, পুঠিয়া, রাজশাহী',
    puthiaOffice: 'পুঠিয়া থানা রোড, রাজশাহী',
    workingArea: 'সম্পূর্ণ পুঠিয়া উপজেলা',
    membersCount: '১৫ জন সেচ্ছাসেবক',
    contactPerson: 'প্রকৌশলী আলতাফ হোসেন (প্রতিষ্ঠাতা)',
    contactPersonPhone: '01717-890123',
    phone: '01717-890123',
    whatsapp: '01717-890123',
    email: 'pus.puthia@gmail.com',
    website: 'https://amaderputhia.com/ngo/pus',
    facebook: 'https://facebook.com/PUSPuthia',
    shortDescription: 'স্থানীয় সেচ্ছাসেবী সংস্থা হিসেবে শীতবস্ত্র বিতরণ, রক্তদান ও বাল্যবিয়ে রোধে সক্রিয়।',
    description: 'পুঠিয়া উপজেলার তরুণ সমাজসেবীদের উদ্যোগে গঠিত একটি সম্পূর্ণ স্থানীয় অলাভজনক সংস্থা। রক্তদান নেটওয়ার্ক পরিচালনা, দরিদ্র শিক্ষার্থীদের বই কিনে দেওয়া এবং প্রাকৃতিক দুর্যোগে ত্রাণ বিতরণে সংস্থাটি অগ্রণী ভূমিকা পালন করে।',
    services: [
      '🩸 জরুরী রক্তদান সহায়তা নেটওয়ার্ক',
      '🧥 শীতবস্ত্র ও খাদ্যসামগ্রী বিতরণ',
      '🛑 বাল্যবিয়ে ও মাদক বিরোধী সচেতনতা'
    ],
    serviceFields: ['মানবিক সহায়তা', 'যুব', 'শিক্ষা'],
    activities: [
      {
        id: 'act-pus-1',
        title: 'বার্ষিক শীতবস্ত্র বিতরণ অভিযান ২০২৬',
        location: 'পুঠিয়া রাজবাড়ী মাঠ',
        date: '০৫ জানুয়ারি, ২০২৬',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
        description: 'পুঠিয়া উপজেলার ৩০০ জন দুস্থ ও বয়স্ক মানুষের মাঝে কম্বল বিতরণ।'
      }
    ],
    projects: [
      {
        id: 'proj-pus-1',
        name: 'জরুরী ব্লাড ব্যাংক ডিরেক্টরি',
        targetArea: 'পুঠিয়া উপজেলা',
        startDate: 'জানুয়ারি ২০২৫',
        endDate: 'চলমান',
        status: 'চলমান',
        description: ' ৫০০ জন স্বেচ্ছাসেবী রক্তদাতার ডেটাবেস মেইনটেইন করা।'
      }
    ],
    mapLocationUrl: 'https://maps.google.com/?q=Puthia+Rajshahi',
    distance: '০.৫ কিমি',
    rating: 4.9,
    reviewCount: 65,
    ratingBreakdown: { 5: 58, 4: 5, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: 'rev-pus-1',
        userName: 'ড. মাহমুদুন নবী',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        date: '৩ দিন আগে',
        comment: 'জরুরী প্রয়োজনে পুঠিয়া হাসপাতাল রোগীর জন্য ও-নেগেটিভ ব্লাড সংগ্রহ করে দিয়েছে। অসংখ্য ধন্যবাদ!'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Verified',
    views: 890
  }
];

export const NGO_FAQS = [
  {
    q: 'পুঠিয়া উপজেলার এনজিওসমূহের তালিকায় কীভাবে অন্তর্ভুক্ত হওয়া যাবে?',
    a: 'নিচে দেওয়া "আপনার এনজিও যুক্ত করুন" বাটনে ক্লিক করে রেজিস্ট্রেশন ফর্মটি নির্ভুল তথ্য দিয়ে পূরণ করুন। আপনার দেওয়া তথ্য আমাদের মডারেশন টিম যাচাই করে এনজিও ডিরেক্টরিতে ভেরিফাইড ব্যাজসহ প্রকাশ করবে।'
  },
  {
    q: 'কোনো এনজিওর তথ্য ভুল বা অসম্পূর্ণ থাকলে তা কীভাবে সংশোধন করা যাবে?',
    a: 'সংশ্লিষ্ট এনজিওর ডিটেইলস পেজে গিয়ে নিচে "তথ্য ভুল মনে হচ্ছে?" থেকে "তথ্য সংশোধনের অনুরোধ করুন" ফর্মটি পূরণ করে সাবমিট করুন।'
  },
  {
    q: 'এনজিও ভেরিফিকেশন কীভাবে প্রদান করা হয়?',
    a: 'নিবন্ধন নম্বর, পুঠিয়া স্থানীয় অফিসের অস্তিত্ব, ফোন নম্বর ও দায়িত্বপ্রাপ্ত ব্যক্তির পরিচয় স্বশরীরে অথবা দাপ্তরিক যাচাইয়ের পর গ্রিন ভেরিফাইড ব্যাজ (✓) দেয়া হয়।'
  }
];

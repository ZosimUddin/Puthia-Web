import { DiagnosticCenter, MedicalTestItem, ReviewItem, UserReport } from './types';

export const initialDiagnosticCenters: DiagnosticCenter[] = [
  {
    id: 'puthia-diagnostic-1',
    name: 'পুঠিয়াখালী ডায়াগনস্টিক সেন্টার',
    tagline: 'বিশ্বস্ত রিপোর্ট, নিশ্চিত স্বাস্থ্য',
    category: 'general',
    type: 'private',
    address: 'পুঠিয়াখালী, পুঠিয়াখালী সদর, রাজশাহী',
    union: 'পুঠিয়া সদর',
    area: 'পৌর শহর',
    rating: 4.6,
    reviewCount: 128,
    open24Hours: true,
    onlineReport: true,
    homeCollection: true,
    digitalPayment: true,
    establishedYear: '২০১৫ সাল',
    reportTime: 'সাধারণত ৩-১২ ঘণ্টা',
    distance: '1.2 কিমি',
    phone: '01711224455',
    whatsapp: '01711224455',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    services: ['প্যাথলজি', 'ইমেজিং', 'হার্ট (ইসিজি)', 'ডিজিটাল এক্স-রে', '4D আল্ট্রাসনোগ্রাফি'],
    visitFeeRange: '২০০ - ৫০০ টাকা'
  },
  {
    id: 'medical-diagnostic-2',
    name: 'মেডিকেল ডায়াগনস্টিক সেন্টার',
    tagline: 'আধুনিক চিকিৎসা পরীক্ষা কেন্দ্র',
    category: 'imaging',
    type: 'private',
    address: 'পুঠিয়াখালী, পৌর শহর, পুঠিয়া',
    union: 'পুঠিয়া সদর',
    area: 'পৌর শহর',
    rating: 4.4,
    reviewCount: 95,
    open24Hours: true,
    onlineReport: true,
    homeCollection: false,
    digitalPayment: true,
    establishedYear: '২০১৮ সাল',
    reportTime: 'সাধারণত ৪-২৪ ঘণ্টা',
    distance: '2.1 কিমি',
    phone: '01712224455',
    whatsapp: '01712224455',
    imageUrl: 'https://images.unsplash.com/photo-1581594693702-f2323b0463b8?auto=format&fit=crop&q=80&w=800',
    services: ['ডিজিটাল এক্স-রে', 'আল্ট্রাসনোগ্রাফি', 'ইসিজি', 'রক্ত পরীক্ষা'],
    visitFeeRange: '১৫০ - ৪০০ টাকা'
  },
  {
    id: 'alhera-diagnostic-3',
    name: 'আল-হেরা ডায়াগনস্টিক',
    tagline: 'অভিজ্ঞ প্যাথলজিস্টদের তত্ত্বাবধানে',
    category: 'pathology',
    type: 'private',
    address: 'বাউফল রোড, পুঠিয়া, রাজশাহী',
    union: 'বানেশ্বর',
    area: 'বাজার এলাকা',
    rating: 4.3,
    reviewCount: 76,
    open24Hours: false,
    onlineReport: true,
    homeCollection: true,
    digitalPayment: true,
    establishedYear: '২০১৬ সাল',
    reportTime: 'সাধারণত ৬-১২ ঘণ্টা',
    distance: '2.7 কিমি',
    phone: '01713224455',
    whatsapp: '01713224455',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    services: ['বায়োকেমিস্ট্রি', 'হরমোন পরীক্ষা', 'হেপাটোলজি', 'ইউরিন রুটিন'],
    visitFeeRange: '১০০ - ৪০০ টাকা'
  },
  {
    id: 'baneshwar-digital-4',
    name: 'বানেশ্বর ডিজিটাল ডায়াগনস্টিক ও হাসপাতাল',
    tagline: 'উন্নত প্রযুক্তির দ্রুত রিপোর্ট',
    category: 'general',
    type: 'private',
    address: 'বানেশ্বর বাজার, পুঠিয়া, রাজশাহী',
    union: 'বানেশ্বর',
    area: 'বানেশ্বর বাজার',
    rating: 4.5,
    reviewCount: 112,
    open24Hours: true,
    onlineReport: true,
    homeCollection: true,
    digitalPayment: true,
    establishedYear: '২০১৪ সাল',
    reportTime: 'সাধারণত ২-৮ ঘণ্টা',
    distance: '5.5 কিমি',
    phone: '01714224455',
    whatsapp: '01714224455',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    services: ['প্যাথলজি', 'কালার ডপলার', 'ইকোকার্ডিওগ্রাম', 'হরমোন ল্যাব'],
    visitFeeRange: '২০০ - ৬০০ টাকা'
  }
];

export const initialTestList: MedicalTestItem[] = [
  {
    id: 't-1',
    name: 'CBC (Complete Blood Count)',
    bengaliName: 'সিবিসি (সম্পূর্ণ রক্ত পরীক্ষা)',
    category: 'popular',
    price: 400,
    reportDeliveryTime: '৪-৬ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-2',
    name: 'Blood Sugar (Fasting / Random)',
    bengaliName: 'ব্লাড সুগার (ফাস্টিং)',
    category: 'popular',
    price: 100,
    reportDeliveryTime: '২ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-3',
    name: 'Lipid Profile',
    bengaliName: 'লিপিড প্রোফাইল (কোলস্টেরল)',
    category: 'popular',
    price: 700,
    reportDeliveryTime: '৬-১২ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-4',
    name: 'SGPT (ALT)',
    bengaliName: 'এসজিপিটি (লিভার টেস্ট)',
    category: 'popular',
    price: 200,
    reportDeliveryTime: '৪ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-5',
    name: 'Creatinine (Kidney Test)',
    bengaliName: 'ক্রিয়েটিনিন (কিডনি পরীক্ষা)',
    category: 'popular',
    price: 150,
    reportDeliveryTime: '৪ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-6',
    name: 'Thyroid (TSH / FT4)',
    bengaliName: 'থাইরয়েড (TSH)',
    category: 'hormone',
    price: 600,
    reportDeliveryTime: '১২-২৪ ঘণ্টা',
    sampleRequired: 'রক্ত'
  },
  {
    id: 't-7',
    name: 'X-Ray (Chest Digital)',
    bengaliName: 'ডিজিটাল এক্স-রে (বুক)',
    category: 'imaging',
    price: 300,
    reportDeliveryTime: '১-২ ঘণ্টা',
    sampleRequired: 'ইমেজিং'
  },
  {
    id: 't-8',
    name: 'ECG (Electrocardiogram)',
    bengaliName: 'ইসিজি (ECG)',
    category: 'heart',
    price: 500,
    reportDeliveryTime: '৩০ মিনিট',
    sampleRequired: 'হার্ট মনিটরিং'
  },
  {
    id: 't-9',
    name: 'Urine R/E',
    bengaliName: 'প্রস্রাব সাধারণ পরীক্ষা',
    category: 'urine',
    price: 150,
    reportDeliveryTime: '৩ ঘণ্টা',
    sampleRequired: 'প্রস্রাব'
  },
  {
    id: 't-10',
    name: 'USG (Ultrasonography)',
    bengaliName: 'আল্ট্রাসনোগ্রাফি (হোল অ্যাবডোমেন)',
    category: 'imaging',
    price: 800,
    reportDeliveryTime: '১ ঘণ্টা',
    sampleRequired: 'ইমেজিং'
  }
];

export const initialReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    userName: 'মাহিমুল ইসলাম',
    date: '১২ মে, ২০২৪',
    rating: 5,
    comment: 'খুব ভালো সেবা। রিপোর্ট দ্রুত পাই। স্টাফদের আচরণ খুব ভালো। পরিষ্কার পরিচ্ছন্ন পরিবেশ।',
    photos: [
      'https://picsum.photos/seed/revphoto1/300/200',
      'https://picsum.photos/seed/revphoto2/300/200',
      'https://picsum.photos/seed/revphoto3/300/200'
    ],
    likes: 12,
    replies: 1
  },
  {
    id: 'rev-2',
    userName: 'সুমি আক্তার',
    date: '৫ মে, ২০২৪',
    rating: 5,
    comment: 'রিপোর্ট অনলাইনে দেখা যায়, খুব সুবিধা হয়। ডিজিটাল পেমেন্ট সুবিধা আছে।',
    photos: [],
    likes: 7,
    replies: 0
  },
  {
    id: 'rev-3',
    userName: 'মো: আরিফ হোসেন',
    date: '১ মে, ২০২৪',
    rating: 4,
    comment: 'সেবা ভালো, তবে পার্কিং এর জায়গা কম। টেস্ট এর মান সন্তোষজনক।',
    photos: [],
    likes: 4,
    replies: 0
  }
];

export const initialUserReports: UserReport[] = [
  {
    id: 'rep-1',
    testName: 'CBC (Complete Blood Count)',
    date: '১২ মে, ২০২৪',
    time: '10:30 AM',
    status: 'সম্পন্ন'
  },
  {
    id: 'rep-2',
    testName: 'লিপিড প্রোফাইল',
    date: '১০ মে, ২০২৪',
    time: '09:15 AM',
    status: 'সম্পন্ন'
  },
  {
    id: 'rep-3',
    testName: 'ইসিজি (ECG)',
    date: '৮ মে, ২০২৪',
    time: '11:45 AM',
    status: 'সম্পন্ন'
  },
  {
    id: 'rep-4',
    testName: 'থাইরয়েড (TSH)',
    date: '৫ মে, ২০২৪',
    time: '10:20 AM',
    status: 'সম্পন্ন'
  }
];

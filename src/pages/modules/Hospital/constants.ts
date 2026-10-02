import { Hospital } from '../../../types';

export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/[0-9]/g, (d) => banglaDigits[parseInt(d, 10)]);
};

export const HOSPITAL_TYPES = [
  { id: 'all', label: 'সকল' },
  { id: 'govt', label: 'সরকারি' },
  { id: 'private', label: 'বেসরকারি' },
  { id: 'specialized', label: 'বিশেষায়িত' },
  { id: 'clinic', label: 'ক্লিনিক' },
  { id: 'maternity', label: 'মাতৃসদন' },
];

export const RAJSHAHI_UPAZILAS = [
  'পুঠিয়া',
  'বাঘমারা',
  'বাঘা',
  'চারঘাট',
  'দুর্গাপুর',
  'গোদাগাড়ী',
  'মোহনপুর',
  'পবা',
  'তানোর',
  'বোয়ালিয়া (রাজশাহী)',
  'রাজপাড়া (রাজশাহী)',
  'মতিহার (রাজশাহী)',
  'শাহ মখদুম (রাজশাহী)',
  'চন্দ্রিমা (রাজশাহী)',
  'কাশিয়াডাঙ্গা (রাজশাহী)',
  'কাটাখালী (রাজশাহী)',
  'বিমানবন্দর (রাজশাহী)',
  'অন্যান্য',
];

export const UNIONS = [
  'সকল এলাকা',
  'পুঠিয়া',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছি',
  'জিউপাড়া',
  'শিলমাড়িয়া',
  'রাজশাহী সিটি করপোরেশন',
  'অন্যান্য',
];

export const FACILITIES_LIST = [
  { id: 'icu', name: 'ICU', icon: '🏥' },
  { id: 'ccu', name: 'CCU', icon: '🫀' },
  { id: 'nicu', name: 'NICU', icon: '👶' },
  { id: 'ot', name: 'OT (অপারেশন থিয়েটার)', icon: '🩹' },
  { id: 'xray', name: 'X-Ray', icon: '🩻' },
  { id: 'ultrasound', name: 'Ultrasound', icon: '📡' },
  { id: 'ctscan', name: 'CT Scan', icon: '🧠' },
  { id: 'mri', name: 'MRI', icon: '🧲' },
  { id: 'lab', name: 'Laboratory', icon: '🧪' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
  { id: 'bloodbank', name: 'Blood Bank', icon: '🩸' },
  { id: 'ambulance', name: 'Ambulance', icon: '🚑' },
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'wheelchair', name: 'Wheelchair access', icon: '♿' },
];

export const SERVICES_LIST = [
  { id: 'emergency', name: 'জরুরি সেবা', icon: '🚑' },
  { id: 'opd', name: 'বহির্বিভাগ', icon: '🩺' },
  { id: 'ipd', name: 'ভর্তি সেবা', icon: '🏥' },
  { id: 'surgery', name: 'সার্জারি', icon: '🩹' },
  { id: 'pediatric', name: 'শিশু বিভাগ', icon: '👶' },
  { id: 'gynae', name: 'নারী ও প্রসূতি', icon: '👩' },
  { id: 'cardio', name: 'হৃদরোগ', icon: '❤️' },
  { id: 'ortho', name: 'অর্থোপেডিক', icon: '🦴' },
  { id: 'eye', name: 'চক্ষু', icon: '👁️' },
  { id: 'dental', name: 'ডেন্টাল', icon: '🦷' },
  { id: 'lab', name: 'ল্যাবরেটরি', icon: '🧪' },
  { id: 'pharmacy', name: 'ফার্মেসি', icon: '💊' },
  { id: 'blood', name: 'রক্তের ব্যবস্থা', icon: '🩸' },
];

export const DEPARTMENTS_LIST = [
  'মেডিসিন',
  'সার্জারি',
  'গাইনি ও প্রসূতি',
  'শিশু',
  'অর্থোপেডিক',
  'হৃদরোগ',
  'চক্ষু',
  'ডেন্টাল',
  'ENT',
  'জরুরি বিভাগ',
  'ডায়াগনস্টিক'
];

export const SORT_OPTIONS = [
  { id: 'relevant', label: 'প্রাসঙ্গিক' },
  { id: 'nearby', label: 'কাছাকাছি' },
  { id: 'rating', label: 'সর্বোচ্চ রেটিং' },
  { id: 'reviews', label: 'সবচেয়ে বেশি রিভিউ' },
  { id: 'newest', label: 'নতুন যুক্ত হয়েছে' },
  { id: 'name', label: 'নাম অনুযায়ী' },
];

export const INITIAL_SEED_HOSPITALS: Hospital[] = [
  {
    id: 'puthia-upazila-health-complex',
    slug: 'puthia-upazila-health-complex',
    name: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
    type: 'সরকারি',
    ownership: 'সরকারি (স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয়)',
    licenseNumber: 'GOVT-RAJ-PUTHIA-001',
    description: 'পুঠিয়া উপজেলার প্রধান সরকারি হাসপাতাল। এখানে ৫০ শয্যার রোগী ভর্তির সুবিধা, ২৪ ঘণ্টা জরুরি চিকিৎসা, প্রসূতি সেবা, শিশু রোগ বিভাগ, আধুনিক অ্যানেস্থেসিয়া ও অপারেশন থিয়েটার রয়েছে।',
    address: 'রাজশাহী-নাটোর মহাসড়ক সংলগ্ন, পুঠিয়া সদর, রাজশাহী',
    union: 'পুঠিয়া',
    village: 'গোবিন্দপাড়া',
    phone: '01730324700',
    emergencyHotline: '01712345679',
    whatsapp: '01730324700',
    email: 'puthia.uhc@dghs.gov.bd',
    website: 'https://uhc.puthia.rajshahi.gov.bd',
    contactPerson: 'উপজেলা স্বাস্থ্য ও পরিবার পরিকল্পনা কর্মকর্তা (UH&FPO)',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    openingTime: '২৪ ঘণ্টা খোলা',
    closingTime: '২৪ ঘণ্টা খোলা',
    departments: ['জরুরি বিভাগ', 'মেডিসিন', 'সার্জারি', 'গাইনি ও প্রসূতি', 'শিশু', 'অর্থোপেডিক', 'ডায়াগনস্টিক'],
    services: ['জরুরি সেবা', 'বহির্বিভাগ', 'ভর্তি সেবা', 'সার্জারি', 'শিশু বিভাগ', 'নারী ও প্রসূতি', 'ল্যাবরেটরি', 'ফার্মেসি', 'রক্তের ব্যবস্থা'],
    facilities: ['OT (অপারেশন থিয়েটার)', 'X-Ray', 'Ultrasound', 'Laboratory', 'Pharmacy', 'Ambulance', 'Parking', 'Wheelchair access'],
    bedCount: 50,
    bedCapacity: {
      total: 50,
      general: 30,
      pediatric: 8,
      female: 8,
      emergency: 4,
      updatedAt: '২০২৬-০৮-০১'
    },
    schedule: [
      { day: 'শনিবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'রবিবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'সোমবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'মঙ্গলবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'বুধবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'বৃহস্পতিবার', openingTime: 'সকাল ৮:০০', closingTime: 'রাত ৮:০০', notes: 'জরুরি বিভাগ ২৪ ঘণ্টা' },
      { day: 'শুক্রবার', openingTime: '২৪ ঘণ্টা জরুরি সেবা', closingTime: '২৪ ঘণ্টা জরুরি সেবা', notes: 'বহির্বিভাগ বন্ধ' },
    ],
    hasEmergency24h: true,
    emergencyDetails: {
      phone: '01712345679',
      ambulancePhone: '01711009988',
      hasEmergency24h: true,
      hours: '২৪ ঘণ্টা খোলা',
      notes: 'জরুরি বিভাগে ২৪ ঘণ্টা সার্বক্ষণিক ডাক্তার ও নার্স নিয়োজিত থাকেন।'
    },
    hasAmbulance: true,
    hasParking: true,
    isDisabledFriendly: true,
    acceptsGovtHealthCard: true,
    acceptsInsurance: true,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Upazila+Health+Complex',
    gallery: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
    ],
    doctorIds: ['doc-1'],
    isVerified: true,
    verificationStatus: 'verified',
    isFeatured: true,
    status: 'active',
    rating: 4.7,
    reviewCount: 142,
    distance: '১.২ কিমি',
    establishedYear: '১৯৮৬'
  },
  {
    id: 'al-amin-general-hospital',
    slug: 'al-amin-general-hospital',
    name: 'আল-আমিন জেনারেল হাসপাতাল',
    type: 'বেসরকারি',
    ownership: 'ব্যক্তিগত / প্রাইভেট লিমিটেড',
    licenseNumber: 'PVT-RAJ-PUTHIA-012',
    description: 'আধুনিক চিকিৎসা যন্ত্রপাতি ও অভিজ্ঞ বিশেষজ্ঞ চিকিৎসকদের তত্ত্বাবধানে ২৪ ঘণ্টা স্বাস্থ্যসেবা নিশ্চিতকারী প্রথম সারির বেসরকারি হাসপাতাল।',
    address: 'বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া বাজার, রাজশাহী',
    union: 'পুঠিয়া',
    village: 'পুঠিয়া বাজার',
    phone: '01711122334',
    emergencyHotline: '01711122335',
    whatsapp: '01711122334',
    email: 'alaminhospital.puthia@gmail.com',
    contactPerson: 'ব্যবস্থাপনা পরিচালক',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
    openingTime: '২৪ ঘণ্টা খোলা',
    closingTime: '২৪ ঘণ্টা খোলা',
    departments: ['জরুরি বিভাগ', 'মেডিসিন', 'সার্জারি', 'গাইনি ও প্রসূতি', 'অর্থোপেডিক', 'ডায়াগনস্টিক'],
    services: ['জরুরি সেবা', 'বহির্বিভাগ', 'ভর্তি সেবা', 'সার্জারি', 'নারী ও প্রসূতি', 'ল্যাবরেটরি', 'ফার্মেসি'],
    facilities: ['OT (অপারেশন থিয়েটার)', 'X-Ray', 'Ultrasound', 'Laboratory', 'Pharmacy', 'Ambulance', 'Parking'],
    bedCount: 30,
    bedCapacity: {
      total: 30,
      general: 20,
      icu: 2,
      female: 5,
      emergency: 3,
      updatedAt: '২০২৬-০৮-০৫'
    },
    schedule: [
      { day: 'প্রতিদিন', openingTime: '২৪ ঘণ্টা খোলা', closingTime: '২৪ ঘণ্টা খোলা', notes: 'জরুরি বিভাগ খোলা' }
    ],
    hasEmergency24h: true,
    emergencyDetails: {
      phone: '01711122335',
      ambulancePhone: '01711122336',
      hasEmergency24h: true,
      hours: '২৪ ঘণ্টা খোলা'
    },
    hasAmbulance: true,
    hasParking: true,
    isDisabledFriendly: false,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Market',
    gallery: [
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80'
    ],
    isVerified: true,
    verificationStatus: 'verified',
    isFeatured: true,
    status: 'active',
    rating: 4.5,
    reviewCount: 98,
    distance: '২.৫ কিমি',
    establishedYear: '২০১০'
  },
  {
    id: 'ma-o-sishu-hospital-puthia',
    slug: 'ma-o-sishu-hospital-puthia',
    name: 'মা ও শিশু হাসপাতাল, পুঠিয়া',
    type: 'মাতৃসদন',
    ownership: 'বেসরকারি মাতৃসদন কেন্দ্র',
    licenseNumber: 'PVT-RAJ-PUTHIA-019',
    description: 'গর্ভবতী মা ও নবজাতক শিশুদের জন্য বিশেষায়িত আধুনিক ও নিরাপদ চিকিৎসা কেন্দ্র। নরমাল ডেলিভারি, সিজারিয়ান সেকশন ও এনআইসিইউ সুবিধা সমন্বিত।',
    address: 'হাসপাতাল রোড, পুঠিয়া সদর, রাজশাহী',
    union: 'পুঠিয়া',
    village: 'কাচারিপাড়া',
    phone: '01799887766',
    emergencyHotline: '01799887767',
    whatsapp: '01799887766',
    email: 'maosishu.puthia@gmail.com',
    contactPerson: 'মেডিকেল সুপারিনটেনডেন্ট',
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    openingTime: '২৪ ঘণ্টা খোলা',
    closingTime: '২৪ ঘণ্টা খোলা',
    departments: ['গাইনি ও প্রসূতি', 'শিশু', 'প্রসূতি বিভাগ', 'এনআইসিইউ'],
    services: ['জরুরি সেবা', 'বহির্বিভাগ', 'ভর্তি সেবা', 'সার্জারি', 'শিশু বিভাগ', 'নারী ও প্রসূতি', 'ল্যাবরেটরি'],
    facilities: ['NICU', 'OT (অপারেশন থিয়েটার)', 'Ultrasound', 'Laboratory', 'Pharmacy', 'Ambulance'],
    bedCount: 25,
    bedCapacity: {
      total: 25,
      general: 15,
      nicu: 4,
      female: 6,
      updatedAt: '২০২৬-০৮-০৪'
    },
    hasEmergency24h: true,
    emergencyDetails: {
      phone: '01799887767',
      ambulancePhone: '01799887768',
      hasEmergency24h: true,
      hours: '২৪ ঘণ্টা সেবা'
    },
    hasAmbulance: true,
    hasParking: true,
    isVerified: true,
    verificationStatus: 'verified',
    isFeatured: false,
    status: 'active',
    rating: 4.6,
    reviewCount: 76,
    distance: '২.৮ কিমি',
    establishedYear: '২০১৫'
  },
  {
    id: 'baneshwar-seba-hospital',
    slug: 'baneshwar-seba-hospital',
    name: 'বানেশ্বর সেবা হাসপাতাল ও ডায়াগনস্টিক সেন্টার',
    type: 'ক্লিনিক',
    ownership: 'বেসরকারি ক্লিনিক',
    licenseNumber: 'PVT-RAJ-PUTHIA-025',
    description: 'বানেশ্বর ইউনিয়ন ও আশপাশের এলাকার মানুষের জন্য দ্রুত ডায়াগনস্টিক পরীক্ষা ও সার্বক্ষণিক চিকিৎসকের পরামর্শ সেবা।',
    address: 'বানেশ্বর বাজার, পুঠিয়া, রাজশাহী',
    union: 'বানেশ্বর',
    village: 'বানেশ্বর বাজার',
    phone: '01733445566',
    emergencyHotline: '01733445567',
    whatsapp: '01733445566',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    openingTime: '২৪ ঘণ্টা খোলা',
    closingTime: '২৪ ঘণ্টা খোলা',
    departments: ['মেডিসিন', 'ডায়াগনস্টিক', 'জরুরি বিভাগ', 'ফার্মেসি'],
    services: ['জরুরি সেবা', 'বহির্বিভাগ', 'ল্যাবরেটরি', 'ফার্মেসি', 'রক্তের ব্যবস্থা'],
    facilities: ['X-Ray', 'Ultrasound', 'Laboratory', 'Pharmacy', 'Ambulance'],
    bedCount: 20,
    hasEmergency24h: true,
    hasAmbulance: true,
    hasParking: true,
    isVerified: true,
    verificationStatus: 'verified',
    status: 'active',
    rating: 4.3,
    reviewCount: 52,
    distance: '৫.৫ কিমি',
    establishedYear: '২০১৮'
  }
];

export const HOSPITAL_FAQS = [
  {
    q: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে কি বিনামূল্যে চিকিৎসা সেবা দেওয়া হয়?',
    a: 'হ্যাঁ, এটি সরকারি হাসপাতাল হওয়ায় এখানে আউটডোর টিকিট ও বহির্বিভাগের অধিকাংশ চিকিৎসা সরকারি নিয়ম অনুযায়ী বিনামূল্যে বা নামমাত্র মূল্যে প্রদান করা হয়।'
  },
  {
    q: 'হাসপাতালে জরুরি প্রয়োজনে অ্যাম্বুলেন্স সার্ভিস কীভাবে বুক করব?',
    a: 'প্রতিটি হাসপাতাল কার্ডের "📞 কল" বা জরুরি সেবার ফোন নম্বরে সরাসরি কল দিয়ে ২৪ ঘণ্টা অ্যাম্বুলেন্স সেবার জন্য আবেদন করতে পারবেন।'
  },
  {
    q: 'হাসপাতালের তথ্যে ভুল থাকলে সংশোধনের আবেদন কীভাবে করব?',
    a: 'হাসপাতালের বিস্তারিত পেজে গিয়ে "তথ্য ভুল মনে হচ্ছে? তথ্য সংশোধনের অনুরোধ করুন" বোতামে ক্লিক করে সংশোধিত তথ্য জমা দিতে পারেন। অ্যাডমিন প্যানেল যাচাই করে আপডেট করবে।'
  }
];

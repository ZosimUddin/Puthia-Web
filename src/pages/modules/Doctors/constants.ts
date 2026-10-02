export interface SpecialtyOption {
  id: string;
  label: string;
  icon: string;
}

export const DOCTOR_SPECIALITIES: SpecialtyOption[] = [
  { id: 'medicine', label: 'মেডিসিন', icon: '🩺' },
  { id: 'child', label: 'শিশু বিশেষজ্ঞ', icon: '👶' },
  { id: 'gynae', label: 'গাইনী ও প্রসূতি', icon: '👩‍⚕️' },
  { id: 'surgery', label: 'সার্জারি', icon: '🔪' },
  { id: 'cardiology', label: 'হৃদরোগ', icon: '❤️' },
  { id: 'eye', label: 'চক্ষু', icon: '👁️' },
  { id: 'dental', label: 'দাঁত', icon: '🦷' },
  { id: 'skin', label: 'চর্মরোগ', icon: '🧴' },
  { id: 'orthopedics', label: 'অর্থোপেডিক', icon: '🦴' },
  { id: 'ent', label: 'নাক-কান-গলা', icon: '👂' },
  { id: 'mental', label: 'মানসিক স্বাস্থ্য', icon: '🧠' },
  { id: 'kidney-urology', label: 'কিডনি ও মূত্ররোগ', icon: '🫘' },
  { id: 'liver-gastro', label: 'লিভার ও পরিপাকতন্ত্র', icon: '🧪' },
  { id: 'other', label: 'অন্যান্য', icon: '❓' },
];

export const DOCTOR_CATEGORIES_WITH_ALL: SpecialtyOption[] = [
  { id: 'all', label: 'সব ডাক্তার', icon: '🩺' },
  ...DOCTOR_SPECIALITIES,
];

export const WORKPLACE_TYPES = [
  { id: 'all', label: 'সকল কর্মস্থল' },
  { id: 'hospital', label: 'হাসপাতাল' },
  { id: 'clinic', label: 'ক্লিনিক' },
  { id: 'diagnostic', label: 'ডায়াগনস্টিক সেন্টার' },
  { id: 'chamber', label: 'ব্যক্তিগত চেম্বার' },
  { id: 'other', label: 'অন্যান্য' },
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
  'পুঠিয়া সদর',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছি',
  'জিউপাড়া',
  'শিলমাড়িয়া',
  'রাজশাহী সিটি করপোরেশন',
  'অন্যান্য',
];

export const WEEKDAYS = [
  { id: 'Sat', label: 'শনিবার', banglaName: 'শনিবার' },
  { id: 'Sun', label: 'রবিবার', banglaName: 'রবিবার' },
  { id: 'Mon', label: 'সোমবার', banglaName: 'সোমবার' },
  { id: 'Tue', label: 'মঙ্গলবার', banglaName: 'মঙ্গলবার' },
  { id: 'Wed', label: 'বুধবার', banglaName: 'বুধবার' },
  { id: 'Thu', label: 'বৃহস্পতিবার', banglaName: 'বৃহস্পতিবার' },
  { id: 'Fri', label: 'শুক্রবার', banglaName: 'শুক্রবার' },
];

export const SORT_OPTIONS = [
  { id: 'relevant', label: 'প্রাসঙ্গিক' },
  { id: 'rating', label: 'সর্বোচ্চ রেটিং' },
  { id: 'reviews', label: 'সবচেয়ে বেশি রিভিউ' },
  { id: 'experience', label: 'অভিজ্ঞতা অনুযায়ী' },
  { id: 'newest', label: 'নতুন যুক্ত হয়েছে' },
  { id: 'name', label: 'নাম অনুযায়ী' },
];

export const REPORT_REASONS = [
  'ভুল তথ্য',
  'ভুল ফোন নম্বর',
  'ডাক্তার এখানে কাজ করেন না',
  'ভুয়া প্রোফাইল',
  'অনুপযুক্ত তথ্য',
  'অন্যান্য'
];

export const PRESET_DOCTOR_AVATARS = [
  {
    id: 'male-doctor-1',
    label: 'পুরুষ চিকিৎসক',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    gender: 'পুরুষ'
  },
  {
    id: 'female-doctor-1',
    label: 'নারী চিকিৎসক',
    url: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=400&q=80',
    gender: 'নারী'
  },
  {
    id: 'male-doctor-2',
    label: 'তরুণ চিকিৎসক',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    gender: 'পুরুষ'
  },
  {
    id: 'female-doctor-2',
    label: 'বিশেষজ্ঞ নারী চিকিৎসক',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    gender: 'নারী'
  },
  {
    id: 'dental-doctor',
    label: 'ডেন্টাল চিকিৎসক',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80',
    gender: 'অন্যান্য'
  },
  {
    id: 'senior-doctor',
    label: 'সিনিয়র বিশেষজ্ঞ',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    gender: 'পুরুষ'
  }
];

export const getDoctorAvatarUrl = (doctor?: { profilePhoto?: string; imageUrl?: string; gender?: string; speciality?: string; specialization?: string }): string => {
  if (doctor?.profilePhoto && doctor.profilePhoto.trim().length > 0) return doctor.profilePhoto.trim();
  if (doctor?.imageUrl && doctor.imageUrl.trim().length > 0) return doctor.imageUrl.trim();

  const isFemale = doctor?.gender === 'নারী' || doctor?.speciality === 'gynae' || doctor?.specialization === 'gynae';
  const isDental = doctor?.speciality === 'dental' || doctor?.specialization === 'dental';
  
  if (isFemale) {
    return 'https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=400&q=80';
  }
  if (isDental) {
    return 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
};

export const DOCTOR_FAQS = [
  {
    q: 'পুঠিয়া উপজেলায় কীভাবে বিশেষজ্ঞ ডাক্তার খুঁজে পাব?',
    a: 'ডাক্তারের নাম, বিশেষত্ব (যেমনঃ মেডিসিন, শিশু, গাইনি) বা চেম্বার লোকেশন ফিল্টার করে সহজে আপনার প্রয়োজনীয় চিকিৎসকের তথ্য পেতে পারেন।',
  },
  {
    q: 'নতুন ডাক্তারের তথ্য কীভাবে যুক্ত করব?',
    a: '“＋ ডাক্তার যোগ করুন” বোতাম চেপে রেজিস্ট্রেশন ফর্ম পূরণ করুন। BMDC নম্বর ও প্রয়োজনীয় তথ্য যাচাইয়ের পর অ্যাডমিন টিম তা সক্রিয় করবেন।',
  },
  {
    q: 'ডাক্তারদের প্রোফাইল কি যাচাইকৃত (Verified)?',
    a: 'হ্যাঁ, বিএমডিসি (BMDC) রেজিস্ট্রেশন নম্বর এবং চিকিৎসকের পেশাগত তথ্য পর্যালোচনার পর প্রোফাইলে “✓ Verified Doctor” ব্যাজ যুক্ত করা হয়।',
  },
  {
    q: 'সিরিয়াল বা অ্যাপয়েন্টমেন্ট নেওয়ার নিয়ম কী?',
    a: 'ডাক্তারের প্রোফাইলে গিয়ে “অ্যাপয়েন্টমেন্ট” বাটনে ক্লিক করে পছন্দসই তারিখ ও সময় নির্বাচন করে সরাসরি সিরিয়াল রিকোয়েস্ট পাঠাতে পারেন।',
  },
  {
    q: 'জরুরি পরিস্থিতিতে কী করব?',
    a: 'জরুরি চিকিৎসা সেবার জন্য দ্রুত পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে যোগাযোগ করুন অথবা ৯৯৯-এ কল করুন।',
  },
];

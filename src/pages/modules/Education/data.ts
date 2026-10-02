export interface TeacherItem {
  id: string;
  name: string;
  designation: string;
  subject?: string;
  phone?: string;
}

export interface StudentClassInfo {
  class: string;
  section?: string;
  count: number;
}

export interface ExamResultSummary {
  year: string;
  exam: string;
  passRate: string;
  gpa5: number;
  totalExaminees?: number;
}

export interface EducationInstitutionFull {
  id: string;
  name: string;
  type: 'primary' | 'school' | 'college' | 'madrasa' | 'technical' | 'higher_ed' | 'kindergarten' | 'orphanage' | 'other';
  subType: string;
  governmentStatus: 'government' | 'non_government';
  eiinNumber: string;
  institutionCode: string;
  establishedYear: string;
  union: 'পুঠিয়া' | 'বানেশ্বর' | 'বেলপুকুরিয়া' | 'ভালুকগাছি' | 'জিউপাড়া' | 'শিলমাড়িয়া';
  village: string;
  address: string;
  headName: string;
  headDesignation?: string;
  phone: string;
  email?: string;
  website?: string;
  studentCount: number;
  teacherCount: number;
  officeHours?: string;
  rating: number;
  reviewCount: number;
  views: number;
  googleMapUrl: string;
  imageUrl: string;
  description: string;
  history?: string;
  status: 'active' | 'pending' | 'rejected';
  teachersList?: TeacherItem[];
  studentsInfo?: StudentClassInfo[];
  resultsSummary?: ExamResultSummary[];
}

export const INSTITUTION_TYPES = [
  {
    id: 'primary',
    iconName: 'BookOpen',
    emoji: '📚',
    label: 'প্রাথমিক বিদ্যালয়',
    subtypes: ['সরকারি প্রাথমিক', 'বেসরকারি প্রাথমিক', 'প্রাক-প্রাথমিক'],
    countLabel: '৮৫টি প্রতিষ্ঠান',
    countNum: 85,
    gradient: 'from-amber-500 to-orange-600',
    colorText: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'school',
    iconName: 'School',
    emoji: '🏫',
    label: 'মাধ্যমিক বিদ্যালয়',
    subtypes: ['সরকারি মাধ্যমিক', 'বেসরকারি মাধ্যমিক', 'উচ্চ বিদ্যালয়'],
    countLabel: '১২৫টি প্রতিষ্ঠান',
    countNum: 125,
    gradient: 'from-blue-600 to-indigo-700',
    colorText: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'college',
    iconName: 'GraduationCap',
    emoji: '🎓',
    label: 'উচ্চ মাধ্যমিক / কলেজ',
    subtypes: ['ডিগ্রি কলেজ', 'অনার্স কলেজ', 'উচ্চ মাধ্যমিক বিদ্যালয়'],
    countLabel: '১৮টি প্রতিষ্ঠান',
    countNum: 18,
    gradient: 'from-emerald-600 to-teal-700',
    colorText: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'madrasa',
    iconName: 'Landmark',
    emoji: '🕌',
    label: 'মাদ্রাসা',
    subtypes: ['কওমি মাদ্রাসা', 'দাখিল মাদ্রাসা', 'হাফেজিয়া মাদ্রাসা'],
    countLabel: '৩২টি প্রতিষ্ঠান',
    countNum: 32,
    gradient: 'from-teal-600 to-cyan-700',
    colorText: 'text-teal-600',
    bgColor: 'bg-teal-50'
  },
  {
    id: 'technical',
    iconName: 'Wrench',
    emoji: '🛠️',
    label: 'কারিগরি ও ভোকেশনাল',
    subtypes: ['কারিগরি স্কুল', 'পলিটেকনিক', 'ভোকেশনাল ইনস্টিটিউট'],
    countLabel: '৮টি প্রতিষ্ঠান',
    countNum: 8,
    gradient: 'from-purple-600 to-indigo-800',
    colorText: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'higher_ed',
    iconName: 'Building',
    emoji: '🏛️',
    label: 'বিশ্ববিদ্যালয় / উচ্চশিক্ষা',
    subtypes: ['বিশ্ববিদ্যালয়', 'গবেষণা কেন্দ্র', 'অনুরূপ উচ্চ শিক্ষা'],
    countLabel: '৫টি প্রতিষ্ঠান',
    countNum: 5,
    gradient: 'from-slate-700 to-slate-900',
    colorText: 'text-slate-700',
    bgColor: 'bg-slate-100'
  },
  {
    id: 'kindergarten',
    iconName: 'Baby',
    emoji: '👶',
    label: 'কিন্ডারগার্টেন',
    subtypes: ['কেজি স্কুল', 'প্লে-গ্রুপ', 'প্রাক-প্রাথমিক কেজি'],
    countLabel: '১৫টি প্রতিষ্ঠান',
    countNum: 15,
    gradient: 'from-pink-500 to-rose-600',
    colorText: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  {
    id: 'orphanage',
    iconName: 'Home',
    emoji: '🏠',
    label: 'এতিমখানা ও আবাসিক শিক্ষা',
    subtypes: ['আবাসিক এতিমখানা', 'লিল্লাহ বোর্ডিং', 'শিশু পরিবার'],
    countLabel: '১২টি প্রতিষ্ঠান',
    countNum: 12,
    gradient: 'from-violet-600 to-fuchsia-700',
    colorText: 'text-violet-600',
    bgColor: 'bg-violet-50'
  },
  {
    id: 'other',
    iconName: 'Layers',
    emoji: '✨',
    label: 'অন্যান্য',
    subtypes: ['যুব প্রশিক্ষণ', 'কোচিং ও ট্রেনিং', 'বিশেষ স্কুল'],
    countLabel: '১০টি প্রতিষ্ঠান',
    countNum: 10,
    gradient: 'from-lime-600 to-emerald-700',
    colorText: 'text-lime-600',
    bgColor: 'bg-lime-50'
  }
];

export const UNIONS_LIST = [
  'পুঠিয়া',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছি',
  'জিউপাড়া',
  'শিলমাড়িয়া'
] as const;

export const UNION_SUMMARY_DATA = [
  {
    name: 'বানেশ্বর ইউনিয়ন',
    unionKey: 'বানেশ্বর',
    schoolCount: 18,
    collegeCount: 2,
    primaryCount: 15,
    madrasaCount: 6,
    totalCount: 41,
    centerVillage: 'বানেশ্বর বাজার'
  },
  {
    name: 'পুঠিয়া ইউনিয়ন',
    unionKey: 'পুঠিয়া',
    schoolCount: 25,
    collegeCount: 4,
    primaryCount: 20,
    madrasaCount: 8,
    totalCount: 57,
    centerVillage: 'পুঠিয়া সদর'
  },
  {
    name: 'বেলপুকুরিয়া ইউনিয়ন',
    unionKey: 'বেলপুকুরিয়া',
    schoolCount: 15,
    collegeCount: 1,
    primaryCount: 12,
    madrasaCount: 5,
    totalCount: 33,
    centerVillage: 'বেলপুকুরিয়া'
  },
  {
    name: 'ভালুকগাছি ইউনিয়ন',
    unionKey: 'ভালুকগাছি',
    schoolCount: 14,
    collegeCount: 1,
    primaryCount: 13,
    madrasaCount: 4,
    totalCount: 32,
    centerVillage: 'ভালুকগাছি'
  },
  {
    name: 'জিউপাড়া ইউনিয়ন',
    unionKey: 'জিউপাড়া',
    schoolCount: 16,
    collegeCount: 2,
    primaryCount: 14,
    madrasaCount: 5,
    totalCount: 37,
    centerVillage: 'জিউপাড়া'
  },
  {
    name: 'শিলমাড়িয়া ইউনিয়ন',
    unionKey: 'শিলমাড়িয়া',
    schoolCount: 12,
    collegeCount: 1,
    primaryCount: 11,
    madrasaCount: 4,
    totalCount: 28,
    centerVillage: 'শিলমাড়িয়া'
  }
];

export const INITIAL_INSTITUTIONS: EducationInstitutionFull[] = [
  {
    id: 'inst-1',
    name: 'পুঠিয়া পি.এন. সরকারি উচ্চ বিদ্যালয়',
    type: 'school',
    subType: 'মাধ্যমিক বিদ্যালয় (বালক ও বালিকা)',
    governmentStatus: 'government',
    eiinNumber: '১০২৬৫২',
    institutionCode: 'PUT-SCH-001',
    establishedYear: '১৮৯৩',
    union: 'পুঠিয়া',
    village: 'রাজবাড়ী রোড, পুঠিয়া সদর',
    address: 'রাজবাড়ী রোড, পুঠিয়া সদর, পুঠিয়া, রাজশাহী',
    headName: 'মো: আব্দুল হান্নান',
    headDesignation: 'প্রধান শিক্ষক',
    phone: '01715263748',
    email: 'puthiapngovths@gmail.com',
    website: 'https://puthiapngovths.edu.bd',
    studentCount: 1280,
    teacherCount: 38,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    rating: 4.9,
    reviewCount: 48,
    views: 3420,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+PN+Govt+High+School',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    description: 'পুঠিয়া উপজেলার প্রাচীনতম ও ঐতিহ্যবাহী সরকারি মডেল মাধ্যমিক বিদ্যালয়। ১৮৯৩ সালে পুঠিয়া রাজপরিবারের রাজর্ষি পাঁচআনি স্টেটের আনুকূল্যে এটি প্রতিষ্ঠিত হয়। সুসংগঠিত বিজ্ঞানাগার, কম্পিউটার ল্যাব ও ক্রীড়া ময়দান সমৃদ্ধ।',
    history: '১৮৯৩ খ্রিষ্টাব্দে পুঠিয়া রাজপরিবারের মহারাণী হেমন্তকুমারী দেবী ও স্থানীয় শিক্ষানুরাগী ব্যক্তিত্বদের উদ্যোগে প্রতিষ্ঠিত হয়। রাজবাড়ি সংলগ্ন সুবিশাল মাঠে প্রতি বছর উপজেলা শিক্ষা মেলা আয়োজিত হয়।',
    status: 'active',
    teachersList: [
      { id: 't1', name: 'মো: আব্দুল হান্নান', designation: 'প্রধান শিক্ষক', subject: 'গণিত', phone: '01715263748' },
      { id: 't2', name: 'মোছা: সালমা খাতুন', designation: 'সহকারী প্রধান শিক্ষক', subject: 'ইংরেজি', phone: '01712000111' },
      { id: 't3', name: 'মো: রফিকুল ইসলাম', designation: 'সিনিয়র শিক্ষক', subject: 'পদার্থবিজ্ঞান', phone: '01713222333' },
      { id: 't4', name: 'জনাব শফিক আহমেদ', designation: 'সিনিয়র শিক্ষক', subject: 'রসায়ন', phone: '01714333444' }
    ],
    studentsInfo: [
      { class: '৬ষ্ঠ শ্রেণী', count: 260 },
      { class: '৭ম শ্রেণী', count: 250 },
      { class: '৮ম শ্রেণী', count: 270 },
      { class: '৯ম শ্রেণী', count: 250 },
      { class: '১০ম শ্রেণী', count: 250 }
    ],
    resultsSummary: [
      { year: '২০২৪', exam: 'SSC', passRate: '৯৮.৫%', gpa5: 45, totalExaminees: 240 },
      { year: '২০২৩', exam: 'SSC', passRate: '৯৭.৮%', gpa5: 42, totalExaminees: 235 },
      { year: '২০২২', exam: 'SSC', passRate: '৯৯.১%', gpa5: 50, totalExaminees: 250 }
    ]
  },
  {
    id: 'inst-2',
    name: 'বানেশ্বর সরকারি কলেজ',
    type: 'college',
    subType: 'সরকারি ডিগ্রি ও অনার্স কলেজ',
    governmentStatus: 'government',
    eiinNumber: '১০২৬৮০',
    institutionCode: 'PUT-COL-001',
    establishedYear: '১৯৬৪',
    union: 'বানেশ্বর',
    village: 'বানেশ্বর বাজার সংলগ্ন',
    address: 'ঢাকা-রাজশাহী মহাসড়ক, বানেশ্বর, পুঠিয়া, রাজশাহী',
    headName: 'অধ্যাপক ড. মো: শফিকুল ইসলাম',
    headDesignation: 'অধ্যক্ষ',
    phone: '01712456789',
    email: 'baneshwargovtcollege@gmail.com',
    website: 'http://baneshwarcollege.edu.bd',
    studentCount: 3400,
    teacherCount: 62,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:৩০',
    rating: 4.8,
    reviewCount: 36,
    views: 4100,
    googleMapUrl: 'https://maps.google.com/?q=Baneshwar+Govt+College',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    description: 'রাজশাহী বিভাগের অন্যতম বৃহৎ ও খ্যাতিমান সরকারি ডিগ্রি কলেজ। বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার পাশাপাশি ৭টি বিষয়ে জাতীয় বিশ্ববিদ্যালয়ের অধীনে সম্মান (অনার্স) কোর্স চালু রয়েছে।',
    history: '১৯৬৪ সালে স্থানীয় শিক্ষানুরাগী ও বিশিষ্ট ব্যক্তিদের উদযোগে বানেশ্বর বাজারে কলেজটি স্থাপিত হয়। পরবর্তীতে জাতীয়করণ করা হয়।',
    status: 'active',
    teachersList: [
      { id: 't1', name: 'অধ্যাপক ড. মো: শফিকুল ইসলাম', designation: 'অধ্যক্ষ', subject: 'অর্থনীতি', phone: '01712456789' },
      { id: 't2', name: 'মো: জহুরুল হক', designation: 'সহযোগী অধ্যাপক', subject: 'রসায়ন', phone: '01711998877' },
      { id: 't3', name: 'মোছা: নাসরিন সুলতানা', designation: 'সহকারী অধ্যাপক', subject: 'উদ্ভিদবিজ্ঞান', phone: '01711665544' }
    ],
    studentsInfo: [
      { class: 'একাদশ শ্রেণী', count: 1100 },
      { class: 'দ্বাদশ শ্রেণী', count: 1050 },
      { class: 'ডিগ্রি (পাস)', count: 450 },
      { class: 'অনার্স (৭টি বিভাগ)', count: 800 }
    ],
    resultsSummary: [
      { year: '২০২৪', exam: 'HSC', passRate: '৯৫.২%', gpa5: 78, totalExaminees: 980 },
      { year: '২০২৩', exam: 'HSC', passRate: '৯৪.৬%', gpa5: 72, totalExaminees: 950 }
    ]
  },
  {
    id: 'inst-3',
    name: 'পুঠিয়া মডেল স্কুল অ্যান্ড কলেজ',
    type: 'school',
    subType: 'বেসরকারি উচ্চ বিদ্যালয় ও কলেজ',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৬৫৪',
    institutionCode: 'PUT-SCH-002',
    establishedYear: '১৯৭২',
    union: 'পুঠিয়া',
    village: 'হাসপাতাল রোড, পুঠিয়া সদর',
    address: 'হাসপাতাল রোড, পুঠিয়া বাজার, পুঠিয়া, রাজশাহী',
    headName: 'মো: জাহিদুল ইসলাম',
    headDesignation: 'অধ্যক্ষ',
    phone: '01718877665',
    email: 'puthiamodelcol@yahoo.com',
    website: 'https://puthiamodel.edu.bd',
    studentCount: 1650,
    teacherCount: 45,
    officeHours: 'সকাল ৮:৩০ - বিকাল ৩:৩০',
    rating: 4.7,
    reviewCount: 29,
    views: 2150,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Model+School+And+College',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    description: 'পুঠিয়ার কেন্দ্রে অবস্থিত উচ্চমানের বেসরকারি শিক্ষাপ্রতিষ্ঠান। ৬ষ্ঠ থেকে দ্বাদশ শ্রেণী পর্যন্ত সুশৃঙ্খল পরিবেশ ও আধুনিক পাঠদান ব্যবস্থা।',
    status: 'active',
    teachersList: [
      { id: 't1', name: 'মো: জাহিদুল ইসলাম', designation: 'অধ্যক্ষ', subject: 'পদার্থবিজ্ঞান', phone: '01718877665' },
      { id: 't2', name: 'মো: মাহবুবুর রহমান', designation: 'উপাধ্যক্ষ', subject: 'গণিত', phone: '01718001122' }
    ],
    studentsInfo: [
      { class: 'মাধ্যমিক স্তর (৬-১০)', count: 1150 },
      { class: 'উচ্চ মাধ্যমিক স্তর (১১-১২)', count: 500 }
    ],
    resultsSummary: [
      { year: '২০২৪', exam: 'SSC', passRate: '৯৬.০%', gpa5: 35, totalExaminees: 210 },
      { year: '২০২৪', exam: 'HSC', passRate: '৯২.৫%', gpa5: 25, totalExaminees: 180 }
    ]
  },
  {
    id: 'inst-4',
    name: 'পুঠিয়া মডেল সরকারি প্রাথমিক বিদ্যালয়',
    type: 'primary',
    subType: 'সরকারি প্রাথমিক বিদ্যালয়',
    governmentStatus: 'government',
    eiinNumber: '৯০৫০০০১',
    institutionCode: 'PUT-PRI-001',
    establishedYear: '১৯৩৮',
    union: 'পুঠিয়া',
    village: 'থানা মোড়, পুঠিয়া সদর',
    address: 'থানা মোড়, পুঠিয়া, রাজশাহী',
    headName: 'মোছা: রাবেয়া খাতুন',
    headDesignation: 'প্রধান শিক্ষিকা',
    phone: '01722334455',
    email: 'puthiagovtprimary@gmail.com',
    studentCount: 520,
    teacherCount: 12,
    officeHours: 'সকাল ৯:০০ - বিকাল ৩:৩০',
    rating: 4.8,
    reviewCount: 19,
    views: 1200,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Govt+Primary+School',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'উপজেলা সদরের সবচেয়ে পুরোনো ও মানসম্মত সরকারি প্রাথমিক বিদ্যালয়। শিশুদের উপযোগী খেলাধুলার মাঠ, মাল্টিমিডিয়া ক্লাস এবং মিড-ডে মিল ব্যবস্থা রয়েছে।',
    status: 'active'
  },
  {
    id: 'inst-5',
    name: 'পুঠিয়া ইসলামিয়া আলিয়া মাদ্রাসা',
    type: 'madrasa',
    subType: 'আলিয়া মাদ্রাসা (দাখিল ও আলিম)',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৭১২',
    institutionCode: 'PUT-MAD-001',
    establishedYear: '১৯৫৮',
    union: 'পুঠিয়া',
    village: 'মাদ্রাসা মোড়, পুঠিয়া',
    address: 'মাদ্রাসা মোড়, পুঠিয়া সদর, রাজশাহী',
    headName: 'মাওলানা মো: আবদুস সাত্তার',
    headDesignation: 'অধ্যক্ষ',
    phone: '01733445566',
    email: 'puthiamadrasa@yahoo.com',
    studentCount: 780,
    teacherCount: 22,
    officeHours: 'সকাল ৮:০০ - দুপুর ২:৩০',
    rating: 4.6,
    reviewCount: 15,
    views: 1650,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Islamia+Madrasa',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
    description: 'ইবতেদায়ী, দাখিল ও আলিম স্তরের বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড অনুমোদিত প্রাচীন আলিয়া মাদ্রাসা। ধর্মীয় শিক্ষার পাশাপাশি আধুনিক শিক্ষার সমন্বয় রয়েছে।',
    status: 'active'
  },
  {
    id: 'inst-6',
    name: 'পুঠিয়া সরকারি কারিগরি স্কুল ও কলেজ (TSC)',
    type: 'technical',
    subType: 'সরকারি কারিগরি ও পলিটেকনিক ইনস্টিটিউট',
    governmentStatus: 'government',
    eiinNumber: '১৩৮৯০০',
    institutionCode: 'PUT-TEC-001',
    establishedYear: '২০২০',
    union: 'পুঠিয়া',
    village: 'বাইপাস মোড়, পুঠিয়া',
    address: 'রাজশাহী-নাটের বাইপাস রোড, পুঠিয়া, রাজশাহী',
    headName: 'প্রকৌশলী মো: মেসবাহুল আলম',
    headDesignation: 'অধ্যক্ষ (ভারপ্রাপ্ত)',
    phone: '01744556677',
    email: 'puthiatsc@bteb.gov.bd',
    website: 'http://tscputhia.gov.bd',
    studentCount: 420,
    teacherCount: 18,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    rating: 4.9,
    reviewCount: 22,
    views: 2900,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Govt+Technical+School+and+College',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    description: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ডের অধীনে পরিচালিত ৪ বছর মেয়াদী ইলেকট্রিক্যাল, কম্পিউটার, মেকানিক্যাল ও সিভিল ট্রেডে এসএসসি ও এইচএসসি (ভোকেশনাল) কোর্স প্রদানকারী বিশ্বমানের সরকারি কারিগরি ইন্সটিটিউট।',
    status: 'active'
  },
  {
    id: 'inst-7',
    name: 'ভালুকগাছি বহুমুখী উচ্চ বিদ্যালয়',
    type: 'school',
    subType: 'মাধ্যমিক বিদ্যালয়',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৬৫৮',
    institutionCode: 'PUT-SCH-003',
    establishedYear: '১৯৬২',
    union: 'ভালুকগাছি',
    village: 'ভালুকগাছি বাজার',
    address: 'ভালুকগাছি বাজার, ভালুকগাছি, পুঠিয়া, রাজশাহী',
    headName: 'মো: আকরাম হোসেন',
    headDesignation: 'প্রধান শিক্ষক',
    phone: '01733221144',
    studentCount: 920,
    teacherCount: 26,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    rating: 4.7,
    reviewCount: 18,
    views: 1400,
    googleMapUrl: 'https://maps.google.com/?q=Bhalukgachi+High+School',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'ভালুকগাছি ইউনিয়নের প্রধান মাধ্যমিক শিক্ষাপীঠ। সুন্দর প্রাকৃতিক পরিবেশ, বিজ্ঞানাগার ও কম্পিউটার ল্যাব সমৃদ্ধ।',
    status: 'active'
  },
  {
    id: 'inst-8',
    name: 'বেলপুকুরিয়া বালিকা উচ্চ বিদ্যালয় ও কলেজ',
    type: 'college',
    subType: 'বেসরকারি বালিকা কলেজ',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৬৭৫',
    institutionCode: 'PUT-COL-002',
    establishedYear: '১৯৮৫',
    union: 'বেলপুকুরিয়া',
    village: 'বেলপুকুরিয়া রেলগেট',
    address: 'বেলপুকুরিয়া বাজার, পুঠিয়া, রাজশাহী',
    headName: 'মোছা: ফরিদা পারভীন',
    headDesignation: 'অধ্যক্ষ',
    phone: '01711223388',
    studentCount: 850,
    teacherCount: 28,
    officeHours: 'সকাল ৮:৩০ - বিকাল ৩:৩০',
    rating: 4.6,
    reviewCount: 14,
    views: 1300,
    googleMapUrl: 'https://maps.google.com/?q=Belpukuria+Girls+High+School+and+College',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    description: 'বেলপুকুরিয়া ইউনিয়ন ও সংলগ্ন এলাকার নারী শিক্ষার প্রসারকল্পে প্রতিষ্ঠিত স্বনামধন্য নারী বিদ্যাপীঠ।',
    status: 'active'
  },
  {
    id: 'inst-9',
    name: 'জিউপাড়া দ্বিমুখী উচ্চ বিদ্যালয়',
    type: 'school',
    subType: 'মাধ্যমিক বিদ্যালয়',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৬৬০',
    institutionCode: 'PUT-SCH-004',
    establishedYear: '১৯৭১',
    union: 'জিউপাড়া',
    village: 'জিউপাড়া বাজার',
    address: 'জিউপাড়া, পুঠিয়া, রাজশাহী',
    headName: 'মো: মোশতাক আহমাদ',
    headDesignation: 'প্রধান শিক্ষক',
    phone: '01719988776',
    studentCount: 740,
    teacherCount: 21,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    rating: 4.5,
    reviewCount: 12,
    views: 1100,
    googleMapUrl: 'https://maps.google.com/?q=Jiupara+High+School',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    description: 'জিউপাড়া ইউনিয়নের প্রাণকেন্দ্রে অবস্থিত সুপরিচিত মাধ্যমিক উচ্চ বিদ্যালয়।',
    status: 'active'
  },
  {
    id: 'inst-10',
    name: 'শিলমাড়িয়া দ্বিমুখী উচ্চ বিদ্যালয়',
    type: 'school',
    subType: 'মাধ্যমিক বিদ্যালয়',
    governmentStatus: 'non_government',
    eiinNumber: '১০২৬৬২',
    institutionCode: 'PUT-SCH-005',
    establishedYear: '১৯৬৫',
    union: 'শিলমাড়িয়া',
    village: 'শিলমাড়িয়া বাজার',
    address: 'শিলমাড়িয়া, পুঠিয়া, রাজশাহী',
    headName: 'মো: লুৎফর রহমান',
    headDesignation: 'প্রধান শিক্ষক',
    phone: '01714455668',
    studentCount: 680,
    teacherCount: 19,
    officeHours: 'সকাল ৯:০০ - বিকাল ৪:০০',
    rating: 4.5,
    reviewCount: 11,
    views: 950,
    googleMapUrl: 'https://maps.google.com/?q=Shilmariya+High+School',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    description: 'শিলমাড়িয়া ইউনিয়নের ঐতিহ্যবাহী মাধ্যমিক বিদ্যাপীঠ।',
    status: 'active'
  },
  {
    id: 'inst-11',
    name: 'রাজশাহী বিশ্ববিদ্যালয় (সমকক্ষ উচ্চশিক্ষা কেন্দ্র)',
    type: 'higher_ed',
    subType: 'পাবলিক বিশ্ববিদ্যালয়',
    governmentStatus: 'government',
    eiinNumber: '১০০০০১',
    institutionCode: 'RU-UNI-001',
    establishedYear: '১৯৫৩',
    union: 'বানেশ্বর',
    village: 'মতিহার (পুঠিয়ার নিকটস্থ)',
    address: 'ঢাকা-রাজশাহী হাইওয়ে, মতিহার, রাজশাহী (পুঠিয়া সীমানা সংলগ্ন)',
    headName: 'অধ্যাপক ড. সালেহ হাসান নকীব',
    headDesignation: 'উপাচার্য',
    phone: '0721-711101',
    website: 'https://www.ru.ac.bd',
    studentCount: 38000,
    teacherCount: 1200,
    officeHours: 'সকাল ৮:০০ - বিকাল ৫:০০',
    rating: 5.0,
    reviewCount: 120,
    views: 9800,
    googleMapUrl: 'https://maps.google.com/?q=University+of+Rajshahi',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    description: 'দেশের ২য় প্রাচীনতম ও বৃহত্তম বিশ্ববিদ্যালয়। পুঠিয়ার শিক্ষার্থীদের উচ্চশিক্ষার প্রধান কেন্দ্রবিন্দু।',
    status: 'active'
  },
  {
    id: 'inst-12',
    name: 'পুঠিয়া লিটল ফ্লাওয়ার কিন্ডারগার্টেন',
    type: 'kindergarten',
    subType: 'কিন্ডারগার্টেন (কেজি স্কুল)',
    governmentStatus: 'non_government',
    eiinNumber: '৯৮৫০০১',
    institutionCode: 'PUT-KG-001',
    establishedYear: '২০০৫',
    union: 'পুঠিয়া',
    village: 'থানা মোড় সংলগ্ন',
    address: 'থানা মোড় সংলগ্ন, পুঠিয়া সদর, রাজশাহী',
    headName: 'মোছা: নাসরিন আক্তার',
    headDesignation: 'অধ্যক্ষ',
    phone: '01715000999',
    studentCount: 220,
    teacherCount: 11,
    officeHours: 'সকাল ৮:০০ - দুপুর ১:০০',
    rating: 4.8,
    reviewCount: 15,
    views: 820,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Little+Flower+Kindergarten',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'শিশু শিক্ষার্থীদের সুপ্ত প্রতিভা বিকাশে ও আনন্দময় পরিবেশে আধুনিক কেজি কারিকুলাম ভিত্তিক শিক্ষা প্রদানকারী প্রতিষ্ঠান।',
    status: 'active'
  },
  {
    id: 'inst-13',
    name: 'পুঠিয়া শাহী জামে মসজিদ ও এতিমখানা',
    type: 'orphanage',
    subType: 'এতিমখানা ও আবাসিক হাফেজিয়া মাদ্রাসা',
    governmentStatus: 'non_government',
    eiinNumber: '৯৮৫০০২',
    institutionCode: 'PUT-ORP-001',
    establishedYear: '১৯৯৫',
    union: 'পুঠিয়া',
    village: 'রাজবাড়ী সংলগ্ন',
    address: 'পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া সদর, রাজশাহী',
    headName: 'হাফেজ মাওলানা কারী মো: আব্দুর রশিদ',
    headDesignation: 'তত্ত্বাবধায়ক',
    phone: '01716111222',
    studentCount: 85,
    teacherCount: 5,
    officeHours: '২৪ ঘণ্টা চলমান',
    rating: 4.9,
    reviewCount: 18,
    views: 940,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Shahi+Mosque+and+Orphanage',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
    description: 'পুঠিয়ার ঐতিহ্যবাহী শাহী জামে মসজিদ সংলগ্ন আবাসিক এতিমখানা, লিল্লাহ বোর্ডিং ও হিফজখানা। এতিম ও দুস্থ শিশুদের সম্পূর্ণ বিনামূল্যে খাদ্য, বাসস্থান ও ইসলামী এবং সাধারণ দ্বিমুখী শিক্ষার নিশ্চয়তা।',
    status: 'active'
  },
  {
    id: 'inst-14',
    name: 'পুঠিয়া সরকারি যুব উন্নয়ন কম্পিউটার প্রশিক্ষণ কেন্দ্র',
    type: 'other',
    subType: 'যুব প্রশিক্ষণ ও কোচিং সেন্টার',
    governmentStatus: 'government',
    eiinNumber: '৯৮৫০০৩',
    institutionCode: 'PUT-OTH-001',
    establishedYear: '২০১০',
    union: 'পুঠিয়া',
    village: 'উপজেলা পরিষদ ভবন',
    address: 'উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া সদর, রাজশাহী',
    headName: 'জনাব মো: তারেক রহমান',
    headDesignation: 'প্রশিক্ষণ কর্মকর্তা',
    phone: '01717222333',
    studentCount: 120,
    teacherCount: 4,
    officeHours: 'সকাল ৯:০০ - বিকাল ৫:০০',
    rating: 4.7,
    reviewCount: 22,
    views: 1150,
    googleMapUrl: 'https://maps.google.com/?q=Puthia+Youth+Development+Computer+Training',
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    description: 'উপজেলা যুব উন্নয়ন অধিদপ্তরের অধীনে বেকার যুব ও যুবতীদের জন্য মেয়াদী প্রফেশনাল কম্পিউটার অ্যাপ্লিকেশন ও ফ্রিল্যান্সিং আইটি কোার্স প্রদান কেন্দ্র।',
    status: 'active'
  }
];

export const EDUCATION_FAQS = [
  {
    q: "পুঠিয়া উপজেলার কতগুলো শিক্ষা প্রতিষ্ঠানের তথ্য এই পোর্টালে রয়েছে?",
    a: "পুঠিয়া উপজেলার ৬টি ইউনিয়নের সকল সরকারি ও বেসরকারি স্কুল, কলেজ, প্রাথমিক বিদ্যালয়, আলিয়া ও কওমি মাদ্রাসা এবং কারিগরি প্রতিষ্ঠানের পুঙ্খানুপুঙ্খ তথ্য অন্তর্ভুক্ত রয়েছে।"
  },
  {
    q: "আমি কীভাবে নতুন শিক্ষা প্রতিষ্ঠানের তথ্য যুক্ত বা সংশোধন করতে পারি?",
    a: "পেজের 'নতুন শিক্ষা প্রতিষ্ঠান যুক্ত করুন' বাটনে ক্লিক করে তথ্য জমা দিন। আমাদের এডমিন টিম যাচাই-বাছাই করে দ্রুত আপডেট প্রকাশ করবে।"
  },
  {
    q: "কোন প্রতিষ্ঠানের EIIN নম্বর ও কোড কীভাবে খুঁজব?",
    a: "ফিল্টার সেকশনে 'প্রতিষ্ঠান কোড' সিলেক্ট করুন অথবা সার্চ বক্সে প্রতিষ্ঠানের নাম বা EIIN লিখে সার্চ করলে সরাসরি পেয়ে যাবেন।"
  },
  {
    q: "প্রতিষ্ঠানের শিক্ষক ও ফলাফলের তথ্য কীভাবে পাওয়া যাবে?",
    a: "যেকোনো প্রতিষ্ঠানের কার্ডের 'বিস্তারিত দেখুন' বাটনে ক্লিক করলে পরিচিতি, শিক্ষক তালিকা, শিক্ষার্থী সংখ্যা, পাবলিক পরীক্ষার ফলাফল ও সরাসরি যোগাযোগের ঠিকানা ট্যাব আকারে দেখতে পাবেন।"
  }
];

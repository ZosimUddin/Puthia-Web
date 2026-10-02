import { Business, Market } from "../types";
import { 
  ShoppingBag, Utensils, Coffee, Store, Shirt, 
  Pill, Hospital, Landmark, Smartphone, Wrench, 
  Sprout, Scissors, Hotel, Grid, Laptop, Building2,
  Car, BookOpen, ShoppingBasket
} from 'lucide-react';

export const BUSINESS_CATEGORIES = [
  { id: 'restaurant', label: 'রেস্টুরেন্ট', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'grocery', label: 'মুদি দোকান', icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'clothing', label: 'কাপড়ের দোকান', icon: Shirt, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 'pharmacy', label: 'ফার্মেসি', icon: Pill, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'hospital', label: 'হাসপাতাল', icon: Hospital, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 'bank', label: 'ব্যাংক', icon: Landmark, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'mobile', label: 'মোবাইল শপ', icon: Smartphone, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  { id: 'computer', label: 'কম্পিউটার', icon: Laptop, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'construction', label: 'নির্মাণ সামগ্রী', icon: Building2, color: 'text-amber-700', bgColor: 'bg-amber-50' },
  { id: 'garage', label: 'গ্যারেজ & সার্ভিসিং', icon: Car, color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  { id: 'agriculture', label: 'কৃষি পণ্য', icon: Sprout, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'hotel', label: 'হোটেল', icon: Hotel, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'cafe', label: 'ক্যাফে', icon: Coffee, color: 'text-amber-800', bgColor: 'bg-amber-50' },
  { id: 'salon', label: 'সেলুন & পার্লার', icon: Scissors, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'library', label: 'লাইব্রেরি & বই', icon: BookOpen, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { id: 'shopping', label: 'শপিং মল', icon: ShoppingBasket, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50' },
  { id: 'hardware', label: 'হার্ডওয়্যার', icon: Wrench, color: 'text-slate-600', bgColor: 'bg-slate-50' },
  { id: 'other', label: 'অন্যান্য', icon: Grid, color: 'text-slate-500', bgColor: 'bg-slate-50' },
];

export const SAMPLE_MARKETS: Market[] = [
  {
    id: 'm1',
    name: 'পুঠিয়া বাজার',
    location: 'পুঠিয়া সদর',
    lat: 24.3683,
    lng: 88.8475,
    shopCount: 450,
    description: 'পুঠিয়ার প্রধান ও ঐতিহাসিক বাজার। এখানে নিত্যপ্রয়োজনীয় সকল পণ্য পাওয়া যায়।',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80'
  },
  {
    id: 'm2',
    name: 'বানেশ্বর বাজার',
    location: 'বানেশ্বর, পুঠিয়া',
    lat: 24.3725,
    lng: 88.7611,
    shopCount: 800,
    description: 'রাজশাহীর অন্যতম বৃহৎ আমের বাজার হিসেবে পরিচিত।',
    imageUrl: 'https://images.unsplash.com/photo-1488459711612-06daef9e8550?w=800&q=80'
  },
  {
    id: 'm3',
    name: 'ঝলমলিয়া বাজার',
    location: 'ঝলমলিয়া',
    lat: 24.3580,
    lng: 88.8320,
    shopCount: 320,
    description: 'পুঠিয়া-নাটোর মহাসড়কের পাশে অবস্থিত একটি ব্যস্ত বাজার।',
    imageUrl: 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800&q=80'
  }
];

export const SAMPLE_BUSINESSES: Business[] = [
  {
    id: 'b_janata_drug',
    name: 'জনতা ড্রাগ হাউস',
    ownerName: 'ডাঃ রফিকুল ইসলাম',
    establishedYear: '২০০২',
    description: 'ঔষধ ও মডেল ফার্মেসি। সকল জরুরি লাইফ সেভিং ড্রাগ, ইনসুলিন ও সার্জিক্যাল সামগ্রী সুনির্দিষ্ট তাপমাত্রায় সংরক্ষিত।',
    category: 'pharmacy',
    categoryLabel: 'ঔষধ ও মডেল ফার্মেসি',
    address: 'থানা রোড, পুঠিয়া সদর।',
    union: 'পুঠিয়া',
    phone: '01712345678',
    rating: 4.8,
    ratingCount: 195,
    reviewCount: 160,
    views: 2450,
    images: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80'
    ],
    openingHours: { open: '08:00 AM', close: '11:00 PM' },
    isVerified: true,
    isFeatured: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b_baneshwar_fashion',
    name: 'বানেশ্বর সুপার মার্কেট ফ্যাশন গ্যালারি',
    ownerName: 'মো: শরিফুল ইসলাম',
    establishedYear: '২০১৬',
    description: 'পোশাক ও ফ্যাশন সামগ্রী। আধুনিক ডিজাইনের শাড়ি, থ্রি-পিস, জিন্স, শার্ট ও বাচ্চাদের আকর্ষণীয় পোশাকের বিশাল সম্ভার।',
    category: 'clothing',
    categoryLabel: 'পোশাক ও ফ্যাশন সামগ্রী',
    address: 'হাইওয়ে রোড, বানেশ্বর বাজার।',
    union: 'বানেশ্বর',
    marketName: 'বানেশ্বর সুপার মার্কেট',
    phone: '01812345678',
    rating: 4.6,
    ratingCount: 142,
    reviewCount: 98,
    views: 1890,
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'
    ],
    openingHours: { open: '09:00 AM', close: '09:30 PM' },
    isVerified: true,
    isFeatured: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b_puthia_khaja',
    name: 'পুঠিয়া রাজকীয় খাজা ঘর',
    ownerName: 'আলহাজ্ব খলিলুর রহমান',
    establishedYear: '১৯৯৮',
    description: 'ঐতিহাসিক মিষ্টি ও কনফেকশনারি। খাঁটি গাভীর দুধের সুস্বাদু ক্ষীরপুলি, দধি, ছানার রাজভোগ ও স্পেশাল রাজকীয় খাজা।',
    category: 'restaurant',
    categoryLabel: 'ঐতিহাসিক মিষ্টি ও কনফেকশনারি',
    address: 'রাজবাড়ী রোড, পুঠিয়া সদর।',
    union: 'পুঠিয়া',
    phone: '01912345678',
    rating: 4.9,
    ratingCount: 320,
    reviewCount: 280,
    views: 3120,
    images: [
      'https://images.unsplash.com/photo-1589119671131-da08f516086c?w=800&q=80'
    ],
    openingHours: { open: '07:30 AM', close: '10:00 PM' },
    isVerified: true,
    isFeatured: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b1',
    name: 'রাজবাড়ি সুইটস ও রেস্টুরেন্ট',
    ownerName: 'মো: আব্দুল মালেক',
    establishedYear: '১৯৯৫',
    description: 'পুঠিয়ার ঐতিহ্যবাহী মিষ্টি ও ফাস্টফুডের দোকান। আমাদের বিশেষ ক্ষীরপুলি, রাজভোগ ও দধি রাজশাহীর সেরা স্বাদ উপহার দেয়।',
    category: 'restaurant',
    address: 'রাজবাড়ি মোড়, পুঠিয়া বাজার',
    union: 'পুঠিয়া',
    marketName: 'পুঠিয়া বাজার',
    phone: '01711223344',
    email: 'rajbarisweets@gmail.com',
    facebook: 'facebook.com/rajbarisweetsputhia',
    whatsapp: '01711223344',
    website: 'https://rajbarisweets.com',
    location: { lat: 24.3685, lng: 88.8470 },
    rating: 4.9,
    ratingCount: 310,
    reviewCount: 245,
    views: 1840,
    offer: {
      discount: '১০%',
      title: '৫০০ টাকার মিষ্টি কেনাকাটায় ১০% ছাড়!',
      validUntil: '২০২৬-০৮-৩১'
    },
    images: [
      'https://images.unsplash.com/photo-1589119671131-da08f516086c?w=800&q=80',
      'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
    ],
    logo: 'https://images.unsplash.com/photo-1589119671131-da08f516086c?w=200&q=80',
    openingHours: { open: '08:00 AM', close: '10:00 PM' },
    isVerified: true,
    isFeatured: true,
    isPremium: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
    products: [
      { id: 'p1', name: 'বিশেষ ক্ষীরপুলি', price: 480, description: 'প্রতি কেজি খাঁটি দুধের খিরসার ক্ষীরপুলি' },
      { id: 'p2', name: 'শাহী রাজভোগ', price: 420, description: 'প্রতি কেজি' },
      { id: 'p3', name: 'পুঠিয়া বিশেষ দধি', price: 280, description: '১ কেজি মাটির পাত্রের দই' }
    ],
    reviewsList: [
      {
        id: 'r1',
        userId: 'u101',
        userName: 'আরিফুল ইসলাম',
        rating: 5,
        comment: 'রাজবাড়ি সুইটসের ক্ষীরপুলি অসাধারণ! পুঠিয়া আসলে সবাই একবার ট্রাই করবেন।',
        createdAt: '2026-07-28T10:15:00Z'
      },
      {
        id: 'r2',
        userId: 'u102',
        userName: 'মোছা: সাবিনা ইয়াসমিন',
        rating: 5,
        comment: 'প্যাকেজিং ও মিষ্টির গুণগত মান অনেক ভালো। সার্ভিসও চমৎকার।',
        createdAt: '2026-08-01T14:20:00Z'
      }
    ]
  },
  {
    id: 'b2',
    name: 'মায়ের দোয়া ফার্মেসি & হেলথকেয়ার',
    ownerName: 'ডাক্তার সিরাজুল ইসলাম',
    establishedYear: '২০১০',
    description: 'সকল প্রকার দেশী-বিদেশী লাইফ-সেভিং ঔষুধ সুলভ মূল্যে পাওয়া যায়। ২৪ ঘণ্টা জরুরী প্রেসক্রিপশন সেবা ও অক্সিজেন সিলিন্ডার ডেলিভারি সুবিধা।',
    category: 'pharmacy',
    address: 'থানা গেট সংলগ্ন, পুঠিয়া',
    union: 'পুঠিয়া',
    phone: '01811223355',
    whatsapp: '01811223355',
    email: 'mayerdoapharmacy@gmail.com',
    facebook: 'facebook.com/mayerdoapharmacy.puthia',
    location: { lat: 24.3690, lng: 88.8480 },
    rating: 4.8,
    ratingCount: 140,
    reviewCount: 112,
    views: 1420,
    images: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80'
    ],
    openingHours: { open: '12:00 AM', close: '11:59 PM' },
    isVerified: true,
    isFeatured: true,
    status: 'approved',
    createdAt: new Date().toISOString(),
    products: [
      { id: 'p10', name: 'প্রেসার ও ডায়াবেটিস চেকআপ', price: 30, description: 'ডিজিটাল ডিভাইসে নিখুঁত মাপ' },
      { id: 'p11', name: 'জরুরী অক্সিজেন সিলিন্ডার', price: 1200, description: '২৪ ঘণ্টা হোম ডেলিভারি' }
    ]
  },
  {
    id: 'b3',
    name: 'পুঠিয়া ফ্যাশন হাউজ & শোরুম',
    ownerName: 'রেজাউল করিম',
    establishedYear: '২০১৮',
    description: 'জেন্টস, লেডিস এবং কিডস কালেকশনের এক অনন্য রাজকীয় মেলা। বিয়ে, ঈদ ও সকল উৎসবে দেশীয় ও আমদানিকৃত থ্রি-পিস, শাড়ি ও শেরওয়ানি।',
    category: 'clothing',
    address: 'নিউ মার্কেট ২য় তলা, পুঠিয়া বাজার',
    union: 'পুঠিয়া',
    phone: '01722334455',
    whatsapp: '01722334455',
    facebook: 'facebook.com/puthiafashionhouse',
    location: { lat: 24.3688, lng: 88.8478 },
    rating: 4.6,
    ratingCount: 95,
    reviewCount: 78,
    views: 980,
    offer: {
      discount: '১৫%',
      title: 'নতুন কালেকশনে ১৫% পর্যন্ত বিশেষ ছাড়!',
      validUntil: '২০২৬-০৮-২৫'
    },
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'
    ],
    openingHours: { open: '09:30 AM', close: '09:00 PM', offDay: 'Sunday' },
    isVerified: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b4',
    name: 'বানেশ্বর ডিজিটাল টেলিকম & গ্যাজেট',
    ownerName: 'মাহাবুব আলম',
    establishedYear: '২০১৫',
    description: 'সকল ব্র্যান্ডের নতুন ও ব্যবহৃত স্মার্টফোন, অরিজিনাল এক্সেসরিজ, কম্পিউটার পার্টস ও মোবাইল সার্ভিসিং ইস্টার।',
    category: 'mobile',
    address: 'বানেশ্বর ট্রাফিক মোড়, বানেশ্বর',
    union: 'বানেশ্বর',
    marketName: 'বানেশ্বর বাজার',
    phone: '01922334455',
    whatsapp: '01922334455',
    facebook: 'facebook.com/baneshwartelecom',
    location: { lat: 24.3728, lng: 88.7618 },
    rating: 4.7,
    ratingCount: 180,
    reviewCount: 135,
    views: 1650,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
    ],
    openingHours: { open: '09:00 AM', close: '09:30 PM' },
    isVerified: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b5',
    name: 'ভাই ভাই হার্ডওয়্যার & বিল্ডার্স',
    ownerName: 'আলহাজ্ব জহুরুল ইসলাম',
    establishedYear: '২০০৫',
    description: 'বার্জার পেইন্টস, শাহ সিমেন্ট, রড, স্যানিটারি ও সকল প্রকার হার্ডওয়্যার সামগ্রীর বিশ্বস্ত পাইকারি ও খুচরা প্রতিষ্ঠান।',
    category: 'construction',
    address: 'বানেশ্বর বাজার, পুঠিয়া',
    union: 'বানেশ্বর',
    marketName: 'বানেশ্বর বাজার',
    phone: '01911223366',
    location: { lat: 24.3730, lng: 88.7615 },
    rating: 4.5,
    ratingCount: 88,
    reviewCount: 56,
    views: 840,
    images: [
      'https://images.unsplash.com/photo-1530124560676-44bc914276f8?w=800&q=80'
    ],
    openingHours: { open: '09:00 AM', close: '08:00 PM', offDay: 'Friday' },
    isVerified: true,
    status: 'approved',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b6',
    name: 'ঝলমলিয়া মোটো গ্যারেজ & সার্ভিস',
    ownerName: 'ওমর ফারুক',
    establishedYear: '২০২০',
    description: 'মোটরসাইকেল ও কার কম্পিউটারাইজড টিউনিং, ইঞ্জিন ওভারহোলিং ও পার্টস চেঞ্জ। অভিজ্ঞ মেকানিক দ্বারা সেবা প্রদান।',
    category: 'garage',
    address: 'ঝলমলিয়া মোড়, পুঠিয়া-নাটোর হাইওয়ে',
    union: 'বেলপুকুর',
    marketName: 'ঝলমলিয়া বাজার',
    phone: '01733445566',
    location: { lat: 24.3582, lng: 88.8322 },
    rating: 4.8,
    ratingCount: 65,
    reviewCount: 42,
    views: 710,
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80'
    ],
    openingHours: { open: '08:00 AM', close: '08:00 PM' },
    isVerified: false,
    status: 'approved',
    createdAt: new Date().toISOString()
  }
];

export const BUSINESS_FAQS = [
  {
    q: "আমি কিভাবে আমার ব্যবসা ডিরেক্টরিতে যুক্ত করতে পারি?",
    a: "আপনি 'ব্যবসা নিবন্ধন করুন' বাটনে ক্লিক করে ফর্মটি পূরণ করে আপনার ব্যবসার নাম, ঠিকানা, ক্যাটাগরি ও ফোন নম্বর জমা দিন। অ্যাডমিন যাচাইকরণের পর আপনার ব্যবসা ফ্রিতেই লাইভ হয়ে যাবে।"
  },
  {
    q: "ভেরিফাইড ব্যাজ (Verified Badge) কিভাবে পাওয়া যায়?",
    a: "আপনার ব্যবসার ট্রেড লাইসেন্স বা সঠিক তথ্যাদি প্রদর্শনের পর আমাদের টিম সরজমিনে পরিদর্শনের মাধ্যমে ভেরিফাইড ব্যাজ প্রদান করে।"
  },
  {
    q: "আমার ব্যবসার বিজ্ঞাপন বা অফার কিভাবে প্রচার করব?",
    a: "আপনার বিশেষ ডিসকাউন্ট বা প্রমোশনাল ব্যানার ডিরেক্টরির হোমপেজে প্রিমিয়াম সেকশনে দেখানোর জন্য 'বিজ্ঞাপন দিন' অথবা 'Featured Business করুন' বাটনে ক্লিক করুন।"
  }
];

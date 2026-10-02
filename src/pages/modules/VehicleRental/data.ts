import { Vehicle, VehicleReview } from './types';

export const CATEGORY_CHIPS = [
  { id: 'all', label: 'সকল', icon: '🚗' },
  { id: 'car', label: 'প্রাইভেট কার', icon: '🏎️' },
  { id: 'microbus', label: 'মাইক্রোবাস', icon: '🚐' },
  { id: 'ambulance', label: 'অ্যাম্বুলেন্স', icon: '🚑' },
  { id: 'pickup', label: 'পিকআপ', icon: '🛻' },
  { id: 'covered_van', label: 'কাভার্ড ভ্যান', icon: '🚚' },
  { id: 'cng', label: 'সিএনজি', icon: '🛺' },
  { id: 'autorickshaw', label: 'অটোরিকশা', icon: '🛵' },
  { id: 'motorcycle', label: 'মোটরসাইকেল', icon: '🏍️' },
  { id: 'bus', label: 'বাস', icon: '🚌' },
  { id: 'other', label: 'অন্যান্য', icon: '🚛' }
];

export const SERVICE_TYPES = [
  { id: 'hourly', label: 'ঘণ্টাভিত্তিক', icon: '⏱️' },
  { id: 'daily', label: 'দৈনিক', icon: '📅' },
  { id: 'monthly', label: 'মাসিক', icon: '📆' },
  { id: 'long_distance', label: 'দূরপাল্লা', icon: '🛣️' },
  { id: 'local', label: 'স্থানীয়', icon: '🏙️' },
  { id: 'airport', label: 'বিমানবন্দর', icon: '✈️' },
  { id: 'wedding', label: 'বিয়ের অনুষ্ঠান', icon: '💒' },
  { id: 'tour', label: 'ভ্রমণ', icon: '🧳' },
  { id: 'office', label: 'অফিস/ব্যবসা', icon: '🏢' },
  { id: 'cargo', label: 'মালামাল পরিবহন', icon: '📦' }
];

export const PUTHIA_UNIONS = [
  'পুঠিয়া সদর',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছি',
  'জিউপাড়া',
  'শিলমাড়িয়া'
];

export const PUTHIA_AREAS = [
  'পুঠিয়া বাজার / পৌরসভা',
  'বানেশ্বর বাজার',
  'বেলপুকুরিয়া বাইপাস',
  'মোল্লাপাড়া',
  'ভালুকগাছি মোড়',
  'জিউপাড়া বাসস্ট্যান্ড',
  'শিলমাড়িয়া বাজার'
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    slug: 'toyota-noah-voxy-microbus-puthia',
    name: 'Toyota Noah X (৭-৮ আসন VIP মাইক্রোবাস)',
    type: 'microbus',
    typeLabel: 'মাইক্রোবাস',
    brand: 'Toyota',
    model: 'Noah X Hybrid',
    modelYear: '২০১৮',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 8,
    isAC: true,
    fuelType: 'অকটেন ও হাইব্রিড',
    transmission: 'অটোমেটিক',
    luggageCapacity: '৪ টি বড় লাগেজ',
    driverOption: 'with_driver',
    services: ['daily', 'long_distance', 'wedding', 'tour', 'airport'],
    serviceArea: ['পুঠিয়া', 'বানেশ্বর', 'রাজশাহী শহর', 'ঢাকা', 'সমগ্র বাংলাদেশ'],
    location: {
      union: 'পুঠিয়া সদর',
      area: 'পুঠিয়া বাজার, রাজবাড়ি মোড়',
      address: 'পুঠিয়া বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া পৌরসভা',
      lat: 24.366,
      lng: 88.831
    },
    pricing: {
      hourly: 600,
      halfDay: 2200,
      daily: 3800,
      monthly: 65000,
      perKm: 14,
      longDistanceRate: 4200,
      longDistanceNote: 'ফুয়েল ও টোল ব্যতিত। ড্রাইভারের খোরাকি আলোচনা সাপেক্ষে।'
    },
    provider: {
      id: 'prov-1',
      name: 'মো: রফিকুল ইসলাম',
      businessName: 'পুঠিয়া রেন্ট-এ-কার & ট্রাভেলস',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.9,
      phone: '01712345678',
      whatsapp: '01712345678',
      email: 'puthia.rentacar@gmail.com',
      serviceArea: 'পুঠিয়া উপজেলা ও সারা দেশ',
      address: 'রাজবাড়ি রোড, পুঠিয়া বাজার',
      union: 'পুঠিয়া সদর',
      area: 'পুঠিয়া বাজার',
      totalVehicles: 6
    },
    driverInfo: {
      name: 'মো: রানা আহমেদ',
      experience: '৮ বছর অভিজ্ঞতা',
      phone: '01712345678',
      rating: 4.9,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 4,
      maxPassengers: 8,
      fuelIncluded: false,
      tollIncluded: false,
      parkingIncluded: false,
      extraHourCharge: 400,
      cancellationPolicy: 'যাত্রার ২৪ ঘণ্টা পূর্বে বাতিল করলে সম্পূর্ণ ফ্রী।',
      rulesText: 'গাড়িতে ধূমপান নিষেধ। অতিরিক্ত যাত্রী বা মালামাল বহনে পূর্বেই আলোচনা করুন।'
    },
    rating: 4.8,
    reviewCount: 34,
    isFeatured: true,
    status: 'published',
    bookedDates: ['2026-08-15', '2026-08-16'],
    createdAt: '2026-01-10',
    description: 'পুঠিয়া রাজবাড়ি ও আশেপাশের যেকোনো ট্যুর, বিয়ের অনুষ্ঠান, ঢাকা/রাজশাহী এয়ারপোর্ট ট্রিপ বা পারিবারিক সফরের জন্য আরামদায়ক এসি নোয়া মাইক্রোবাস।'
  },
  {
    id: 'veh-2',
    slug: 'toyota-allion-premium-car-baneshwar',
    name: 'Toyota Allion G-Superior (এসি প্রাইভেট কার)',
    type: 'car',
    typeLabel: 'প্রাইভেট কার',
    brand: 'Toyota',
    model: 'Allion G',
    modelYear: '২০১৯',
    imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 5,
    isAC: true,
    fuelType: 'অকটেন',
    transmission: 'অটোমেটিক',
    luggageCapacity: '২ টি ট্রলি ব্যাগ',
    driverOption: 'with_driver',
    services: ['hourly', 'daily', 'wedding', 'airport', 'office'],
    serviceArea: ['বানেশ্বর', 'পুঠিয়া', 'রাজশাহী', 'নাটোর', 'পাবনা'],
    location: {
      union: 'বানেশ্বর',
      area: 'বানেশ্বর বাজার বাইপাস',
      address: 'বানেশ্বর ডিগ্রি কলেজ মোড়, পুঠিয়া',
      lat: 24.372,
      lng: 88.810
    },
    pricing: {
      hourly: 500,
      halfDay: 1800,
      daily: 3200,
      monthly: 55000,
      perKm: 12,
      longDistanceRate: 3500,
      longDistanceNote: 'পাসঞ্জার ফুয়েল চার্জ যুক্ত হতে পারে।'
    },
    provider: {
      id: 'prov-2',
      name: 'মো: আব্দুল মতিন',
      businessName: 'বানেশ্বর কার রেন্টাল এন্ড সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.8,
      phone: '01812345678',
      whatsapp: '01812345678',
      email: 'baneshwar.car@gmail.com',
      serviceArea: 'বানেশ্বর, পুঠিয়া ও রাজশাহী পথ',
      address: 'বানেশ্বর বাজার মোড়',
      union: 'বানেশ্বর',
      area: 'বানেশ্বর বাজার',
      totalVehicles: 4
    },
    driverInfo: {
      name: 'শরিফুল ইসলাম',
      experience: '৬ বছর অভিজ্ঞতা',
      phone: '01812345678',
      rating: 4.8,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 2,
      maxPassengers: 4,
      fuelIncluded: false,
      tollIncluded: false,
      parkingIncluded: false,
      extraHourCharge: 350,
      cancellationPolicy: 'যাত্রার ১২ ঘণ্টা পূর্বে ফ্রিতে বাতিল।'
    },
    rating: 4.9,
    reviewCount: 28,
    isFeatured: true,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-02-01',
    description: 'বানেশ্বর ও পুঠিয়া অঞ্চলের নির্ভরযোগ্য এসি এলিয়ন প্রাইভেট কার। ভিআইপি মুভমেন্ট, অফিসিয়াল ভিজিট ও পারিবারিক সফরের জন্য পারফেক্ট।'
  },
  {
    id: 'veh-3',
    slug: 'hiace-emergency-ambulance-puthia',
    name: 'Toyota HiAce এয়ারকন্ডিশনড আইসিইউ অ্যাম্বুলেন্স',
    type: 'ambulance',
    typeLabel: 'অ্যাম্বুলেন্স',
    brand: 'Toyota',
    model: 'HiAce High Roof Ambulance',
    modelYear: '২০২০',
    imageUrl: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 6,
    isAC: true,
    fuelType: 'ডিজেল ও সিএনজি',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: 'অক্সিজেন সিলিন্ডার ও পেশেন্ট ট্রলি',
    driverOption: 'with_driver',
    services: ['hourly', 'daily', 'long_distance', 'local'],
    serviceArea: ['পুঠিয়া', 'উপজেলা হাসপাতাল', 'রাজশাহী মেডিকেল', 'ঢাকা'],
    location: {
      union: 'পুঠিয়া সদর',
      area: 'উপজেলা স্বাস্থ্য কমপ্লেক্স এর সামনে',
      address: 'হাসপাতাল রোড, পুঠিয়া',
      lat: 24.368,
      lng: 88.835
    },
    pricing: {
      hourly: 400,
      halfDay: 1500,
      daily: 3000,
      perKm: 15,
      longDistanceNote: 'জরুরি অক্সিজেন সিলিন্ডার ও সাইরেন সুবিধা অন্তর্ভুক্ত।'
    },
    provider: {
      id: 'prov-3',
      name: 'পুঠিয়া জরুরি এম্বুলেন্স সেবা',
      businessName: 'পুঠিয়া জনসেবা অ্যাম্বুলেন্স সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 5.0,
      phone: '01799887766',
      whatsapp: '01799887766',
      serviceArea: '২৪ ঘণ্টা পুঠিয়া ও আশেপাশের সকল হাসপাতাল ট্রিপ',
      address: 'হাসপাতাল গেট, পুঠিয়া',
      union: 'পুঠিয়া সদর',
      area: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
      totalVehicles: 3
    },
    driverInfo: {
      name: 'মো: আল-আমিন (ফার্স্ট এইড প্রশিক্ষিত)',
      experience: '১০ বছর জরুরি সার্ভিস অভিজ্ঞতা',
      phone: '01799887766',
      rating: 5.0,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 1,
      maxPassengers: 4,
      fuelIncluded: true,
      tollIncluded: false,
      parkingIncluded: true,
      extraHourCharge: 300,
      cancellationPolicy: 'জরুরি রোগীর ক্ষেত্রে বাতিল ফি মুক্ত।'
    },
    rating: 5.0,
    reviewCount: 45,
    isFeatured: true,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-01-05',
    description: '২৪ ঘণ্টা জরুরি অক্সিজেন সাপোর্ট, স্ট্রেচার ও অভিজ্ঞ ড্রাইভারসহ পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স এবং রাজশাহী মেডিকেল কলেজের উদ্দেশ্যে প্রস্তুত।'
  },
  {
    id: 'veh-4',
    slug: 'mahindra-pickup-cargo-belpukuria',
    name: 'Mahindra Bolero 1.5 Ton প্যাকড পিকআপ',
    type: 'pickup',
    typeLabel: 'পিকআপ',
    brand: 'Mahindra',
    model: 'Bolero Maxi Truck',
    modelYear: '২০২১',
    imageUrl: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 3,
    isAC: false,
    fuelType: 'ডিজেল',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: '১.৫ টন মালামাল',
    driverOption: 'with_driver',
    services: ['cargo', 'daily', 'local', 'long_distance'],
    serviceArea: ['বেলপুকুরিয়া', 'পুঠিয়া', 'বানেশ্বর', 'রাজশাহী জেলা', 'নাটোর'],
    location: {
      union: 'বেলপুকুরিয়া',
      area: 'বেলপুকুরিয়া বাইপাস মোড়',
      address: 'বেলপুকুরিয়া বাজার সংলগ্ন, পুঠিয়া',
      lat: 24.360,
      lng: 88.800
    },
    pricing: {
      hourly: 400,
      halfDay: 1500,
      daily: 2800,
      perKm: 18,
      longDistanceNote: 'পণ্য ওঠানো-নামানোর জন্য হেলপার সুবিধা রয়েছে।'
    },
    provider: {
      id: 'prov-4',
      name: 'বেলপুকুরিয়া ট্রান্সপোর্ট এজেন্সি',
      businessName: 'বেলপুকুরিয়া মালামাল পরিবহন সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.7,
      phone: '01911223344',
      whatsapp: '01911223344',
      serviceArea: 'বেলপুকুরিয়া, পুঠিয়া ও উত্তরবঙ্গ রোড',
      address: 'বেলপুকুরিয়া বাইপাস',
      union: 'বেলপুকুরিয়া',
      area: 'বেলপুকুরিয়া বাজার',
      totalVehicles: 5
    },
    driverInfo: {
      name: 'মো: বেল্লাল হোসেন',
      experience: '৭ বছর অভিজ্ঞতা',
      phone: '01911223344',
      rating: 4.7,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 2,
      maxPassengers: 2,
      fuelIncluded: false,
      tollIncluded: false,
      parkingIncluded: false,
      extraHourCharge: 250,
      cancellationPolicy: 'লোডিংয়ের ২ ঘণ্টা পূর্বে বাতিল করলে চার্জ নেই।'
    },
    rating: 4.7,
    reviewCount: 19,
    isFeatured: false,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-02-10',
    description: 'বাসা পরিবর্তন, দোকান বা হাটের মালামাল, কৃষিপণ্য ও নির্মাণ সামগ্রী নিরাপদে গন্তব্যে পৌঁছানোর জন্য উপযুক্ত মহিন্দ্রা পিকআপ।'
  },
  {
    id: 'veh-5',
    slug: 'covered-van-tata-14ft-puthia',
    name: 'Tata 14 Feet কাভার্ড ভ্যান (বৃষ্টি ও সুরক্ষাবেষ্টিত)',
    type: 'covered_van',
    typeLabel: 'কাভার্ড ভ্যান',
    brand: 'Tata',
    model: 'LPT 407 Covered Van',
    modelYear: '২০২০',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 3,
    isAC: false,
    fuelType: 'ডিজেল',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: '৩.৫ টন নিরাপদে ঢাকা প্যাকড গুডস',
    driverOption: 'with_driver',
    services: ['cargo', 'long_distance', 'office'],
    serviceArea: ['পুঠিয়া', 'রাজশাহী', 'ঢাকা', 'চট্টগ্রাম', 'সারা দেশ'],
    location: {
      union: 'পুঠিয়া সদর',
      area: 'পৌরসভা ট্রাক স্ট্যান্ড',
      address: 'রাজশাহী-নাটোর হাইওয়ে, পুঠিয়া',
      lat: 24.365,
      lng: 88.828
    },
    pricing: {
      daily: 4500,
      perKm: 22,
      longDistanceNote: 'ঢাকা বা চট্টগ্রাম রুটের জন্য আকর্ষণীয় এককালীন ভাড়া প্যাকেজ।'
    },
    provider: {
      id: 'prov-5',
      name: 'পুঠিয়া কুরিয়ার ও কাভার্ড ভ্যান সার্ভিস',
      businessName: 'শাহ আমানত ট্রান্সপোর্ট সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.8,
      phone: '01755443322',
      whatsapp: '01755443322',
      serviceArea: 'সারা বাংলাদেশে নিরাপদ মালামাল পরিবহন',
      address: 'ট্রাক স্ট্যান্ড, পুঠিয়া',
      union: 'পুঠিয়া সদর',
      area: 'পুঠিয়া বাজার',
      totalVehicles: 8
    },
    driverInfo: {
      name: 'মো: জহুরুল ইসলাম',
      experience: '১২ বছর অভিজ্ঞতা',
      phone: '01755443322',
      rating: 4.8,
      licenseVerified: true
    },
    rules: {
      fuelIncluded: false,
      tollIncluded: false,
      parkingIncluded: false,
      cancellationPolicy: 'যাত্রার ২৪ ঘণ্টা পূর্বে বাতিলের সুযোগ।'
    },
    rating: 4.8,
    reviewCount: 22,
    isFeatured: false,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-01-20',
    description: 'বৃষ্টি বা রোদ হতে মালামাল বা ফ্যাক্টরি প্রডাক্ট সম্পূর্ণ সুরক্ষিত রাখতে ১৪ ফিটের নির্ভরযোগ্য কাভার্ড ভ্যান সার্ভিস।'
  },
  {
    id: 'veh-6',
    slug: 'cng-4-stroke-autorickshaw-jiopara',
    name: 'Bajaj RE 4-Stroke সিএনজি অটোরিকশা',
    type: 'cng',
    typeLabel: 'সিএনজি',
    brand: 'Bajaj',
    model: 'RE 4S Compact',
    modelYear: '২০২২',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 4,
    isAC: false,
    fuelType: 'সিএনজি ও পেট্রোল',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: '১-২ টি ছোট ব্যাগ',
    driverOption: 'with_driver',
    services: ['local', 'hourly', 'daily'],
    serviceArea: ['জিউপাড়া', 'পুঠিয়া সদর', 'বানেশ্বর', 'মোল্লাপাড়া'],
    location: {
      union: 'জিউপাড়া',
      area: 'জিউপাড়া বাসস্ট্যান্ড',
      address: 'জিউপাড়া বাজার মোড়, পুঠিয়া',
      lat: 24.380,
      lng: 88.850
    },
    pricing: {
      hourly: 150,
      halfDay: 600,
      daily: 1200,
      perKm: 10,
      longDistanceNote: 'পুঠিয়া উপজেলার ভেতরে দ্রুত ভ্রমণের জন্য উপযুক্ত।'
    },
    provider: {
      id: 'prov-6',
      name: 'মো: জালাল উদ্দিন',
      businessName: 'জিউপাড়া স্থানীয় সিএনজি স্ট্যান্ড',
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
      isVerified: false,
      verificationStatus: 'pending',
      rating: 4.6,
      phone: '01833221100',
      whatsapp: '01833221100',
      serviceArea: 'জিউপাড়া ও স্থানীয় সকল রোড',
      address: 'জিউপাড়া বাসস্ট্যান্ড',
      union: 'জিউপাড়া',
      area: 'জিউপাড়া বাসস্ট্যান্ড',
      totalVehicles: 2
    },
    driverInfo: {
      name: 'মো: জালাল উদ্দিন',
      experience: '৫ বছর অভিজ্ঞতা',
      phone: '01833221100',
      rating: 4.6,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 1,
      maxPassengers: 4,
      fuelIncluded: true,
      extraHourCharge: 120
    },
    rating: 4.6,
    reviewCount: 14,
    isFeatured: false,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-02-15',
    description: 'কম খরচে পুঠিয়া উপজেলার ভেতরের যেকোনো গ্রামে বা বাজারে ভ্রমণের জন্য ঝটপট সিএনজি সার্ভিস।'
  },
  {
    id: 'veh-7',
    slug: 'easy-bike-autorickshaw-bhalukgachi',
    name: 'ব্যাটারিচালিত অটো রিকশা (ইজি বাইক)',
    type: 'autorickshaw',
    typeLabel: 'অটোরিকশা',
    brand: 'Local Eco-Bike',
    model: '5-Battery Heavy Duty',
    modelYear: '২০২৩',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 6,
    isAC: false,
    fuelType: 'ইলেকট্রিক ব্যাটারি',
    transmission: 'অটোমেটিক',
    luggageCapacity: 'বাজারের থলে বা হালকা মালামাল',
    driverOption: 'with_driver',
    services: ['local', 'hourly'],
    serviceArea: ['ভালুকগাছি', 'পুঠিয়া সদর', 'ধোপাপাড়া', 'শিলমাড়িয়া'],
    location: {
      union: 'ভালুকগাছি',
      area: 'ভালুকগাছি বাজার',
      address: 'ভালুকগাছি ইউনিয়ন পরিষদ মোড়',
      lat: 24.390,
      lng: 88.820
    },
    pricing: {
      hourly: 100,
      halfDay: 450,
      daily: 800,
      longDistanceNote: 'সংক্ষিপ্ত দূরত্বের গ্রামীণ যাতায়াতের জন্য।'
    },
    provider: {
      id: 'prov-7',
      name: 'মো: সারোয়ার হোসেন',
      businessName: 'ভালুকগাছি ইজি বাইক সমিতি',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.7,
      phone: '01722334455',
      whatsapp: '01722334455',
      serviceArea: 'ভালুকগাছি ও পার্শ্ববর্তী গ্রামসমূহ',
      address: 'ভালুকগাছি বাজার',
      union: 'ভালুকগাছি',
      area: 'ভালুকগাছি বাজার',
      totalVehicles: 3
    },
    driverInfo: {
      name: 'মো: সারোয়ার হোসেন',
      experience: '৪ বছর অভিজ্ঞতা',
      phone: '01722334455',
      rating: 4.7,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 1,
      maxPassengers: 6,
      fuelIncluded: true,
      extraHourCharge: 80
    },
    rating: 4.7,
    reviewCount: 12,
    isFeatured: false,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-02-18',
    description: 'ভালুকগাছি ও পুঠিয়ার গ্রামীণ কাঁচা-পাকা রাস্তায় স্বাচ্ছন্দ্যে যাতায়াতের পরিবেশবান্ধব অটো রিকশা।'
  },
  {
    id: 'veh-8',
    slug: 'bajaj-pulsar-motorcycle-silmaria',
    name: 'Bajaj Pulsar 150 SD (মোটরসাইকেল রাইড / রেন্ট)',
    type: 'motorcycle',
    typeLabel: 'মোটরসাইকেল',
    brand: 'Bajaj',
    model: 'Pulsar 150 Twin Disc',
    modelYear: '২০২৩',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 2,
    isAC: false,
    fuelType: 'অকটেন',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: '১ টি হেলমেট ও ছোট ব্যাকপ্যাক',
    driverOption: 'both',
    services: ['hourly', 'daily', 'local', 'office'],
    serviceArea: ['শিলমাড়িয়া', 'পুঠিয়া', 'বানেশ্বর', 'রাজশাহী city'],
    location: {
      union: 'শিলমাড়িয়া',
      area: 'শিলমাড়িয়া বাজার',
      address: 'শিলমাড়িয়া স্কুল গেট, পুঠিয়া',
      lat: 24.350,
      lng: 88.860
    },
    pricing: {
      hourly: 150,
      halfDay: 600,
      daily: 1000,
      perKm: 8,
      longDistanceNote: 'স্মার্ট হেলমেট ফ্রী দেয়া হবে।'
    },
    provider: {
      id: 'prov-8',
      name: 'তৌহিদুর রহমান',
      businessName: 'পুঠিয়া বাইক রেন্টাল সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.9,
      phone: '01844556677',
      whatsapp: '01844556677',
      serviceArea: 'পুঠিয়া উপজেলা ও রাজশাহী রুটে এক্সপ্রেস বাইক',
      address: 'শিলমাড়িয়া বাজার',
      union: 'শিলমাড়িয়া',
      area: 'শিলমাড়িয়া বাজার',
      totalVehicles: 2
    },
    driverInfo: {
      name: 'তৌহিদুর রহমান',
      experience: '৫ বছর অভিজ্ঞতা',
      phone: '01844556677',
      rating: 4.9,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 1,
      maxPassengers: 1,
      fuelIncluded: false,
      cancellationPolicy: 'ফ্রী বাতিল ব্যবস্থা।'
    },
    rating: 4.9,
    reviewCount: 16,
    isFeatured: false,
    status: 'published',
    bookedDates: [],
    createdAt: '2026-02-20',
    description: 'দ্রুত যেকোনো জরুরি কাজে পুঠিয়া বা রাজশাহীতে যাতায়াতের জন্য পারফেক্ট ১৫০ সিসি বাইক রাইড ও রেন্ট সার্ভিস।'
  },
  {
    id: 'veh-9',
    slug: 'toyota-coaster-30-seat-bus-puthia',
    name: 'Toyota Coaster (৩০ সিট বিলাসবহুল মিনি বাস)',
    type: 'bus',
    typeLabel: 'বাস',
    brand: 'Toyota',
    model: 'Coaster VIP AC',
    modelYear: '২০১৯',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800'
    ],
    seatCapacity: 30,
    isAC: true,
    fuelType: 'ডিজেল',
    transmission: 'ম্যানুয়াল',
    luggageCapacity: 'বিশাল সাইড ও ব্যাক লাগেজ স্পেস',
    driverOption: 'with_driver',
    services: ['daily', 'wedding', 'tour', 'long_distance', 'office'],
    serviceArea: ['পুঠিয়া', 'রাজশাহী', 'পাবনা', 'বগুড়া', 'ঢাকা', 'সারা দেশ'],
    location: {
      union: 'পুঠিয়া সদর',
      area: 'পুঠিয়া বাজার বাস টার্মিনাল',
      address: 'বাস টার্মিনাল, পুঠিয়া পৌরসভা',
      lat: 24.367,
      lng: 88.830
    },
    pricing: {
      daily: 8500,
      monthly: 180000,
      longDistanceRate: 9500,
      longDistanceNote: 'পিকনিক, স্কুল/কলেজ ট্যুর ও বিয়ের পার্টির জন্য স্পেশাল বুকিং डिस्काउंट।'
    },
    provider: {
      id: 'prov-9',
      name: 'পুঠিয়া ট্রাভেলস & ট্যুরিজম',
      businessName: 'পুঠিয়া রয়েল বাস সার্ভিস',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      verificationStatus: 'verified',
      rating: 4.8,
      phone: '01711002233',
      whatsapp: '01711002233',
      serviceArea: 'সারা বাংলাদেশে গ্রুপের ভ্রমণ ও ইভেন্ট বাস',
      address: 'বাস স্ট্যান্ড, পুঠিয়া',
      union: 'পুঠিয়া সদর',
      area: 'পুঠিয়া বাজার',
      totalVehicles: 4
    },
    driverInfo: {
      name: 'মো: এরশাদ আলী',
      experience: '১৫ বছর অভিজ্ঞতা',
      phone: '01711002233',
      rating: 4.8,
      licenseVerified: true
    },
    rules: {
      minBookingHours: 8,
      maxPassengers: 30,
      fuelIncluded: false,
      tollIncluded: false,
      parkingIncluded: false,
      cancellationPolicy: 'যাত্রার ৪৮ ঘণ্টা পূর্বে জানালে ৫০% রিফান্ড।'
    },
    rating: 4.8,
    reviewCount: 31,
    isFeatured: true,
    status: 'published',
    bookedDates: ['2026-08-25'],
    createdAt: '2026-01-01',
    description: 'বিয়ের বরযাত্রী, শিক্ষা সফর, পিকনিক কিংবা বড় পারিবারিক ভ্রমণের জন্য আরামদায়ক ৩০ সিটের বিলাসবহুল এসি কোস্টার বাস।'
  }
];

export const sampleReviews: VehicleReview[] = [
  {
    id: 'rev-1',
    vehicleId: 'veh-1',
    userName: 'তাহমিদ হাসান',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    date: '০২ আগস্ট, ২০২৬',
    comment: 'পুঠিয়া থেকে ফ্যামিলি নিয়ে কক্সবাজার ট্যুরে গিয়েছিলাম। ড্রাইভার রানা ভাই চমৎকার ও নিরাপদ ড্রাইভ করেছেন। নোয়া গাড়িটির এসি কুলিং দারুণ।'
  },
  {
    id: 'rev-2',
    vehicleId: 'veh-1',
    userName: 'মো: সাজ্জাদ হোসেন',
    rating: 4,
    date: '২৫ জুলাই, ২০২৬',
    comment: 'সময়মতো বানেশ্বর এসে পিকআপ করেছেন। সার্ভিস সার্ভিস অনেক ভালো। রিকমেন্ডেড।'
  },
  {
    id: 'rev-3',
    vehicleId: 'veh-3',
    userName: 'ড. কামরুল ইসলাম',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    date: '১০ জুলাই, ২০২৬',
    comment: 'জরুরি রুগীকে রাজশাহী মেডিকেলে নেওয়ার জন্য রাত ২টায় ফোন দিয়েছিলাম। ৫ মিনিটের মধ্যে এম্বুলেন্স হাজির ছিল। অক্সিজেন সাপোর্টও পারফেক্ট ছিল।'
  }
];

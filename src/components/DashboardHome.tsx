import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Award, Gift, HeartPulse, FileText, Plus, Store, Newspaper, Building, Wrench, Calendar, Ambulance, Hospital, ShieldAlert, Bus, Bell, Heart, PhoneCall, QrCode, ChevronRight, CheckSquare, Square, Sparkles, Search, MapPin, Navigation, Phone, Shield, UserCheck, Flame, Volume2, Copy, Check, X, CreditCard, Landmark, Users, Trash2, Camera, Upload, AlertCircle, CheckCircle2, Trophy, Share2, RefreshCw, Mic, MicOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MapComponent } from '../components/MapComponent';
import { Skeleton } from './Skeleton';
import Footer from './home/Footer';

// Smart Search Dataset covering village, school, hospital, business, representatives, and jobs
const searchDataset = [
  // গ্রাম
  { name: 'তারাপুর', category: 'গ্রাম', details: 'পুঠিয়া ইউনিয়ন, ৩ নং ওয়ার্ড', action: 'directory', subview: 'unions' },
  { name: 'কান্দ্রা', category: 'গ্রাম', details: 'পুঠিয়া ইউনিয়ন, ১ নং ওয়ার্ড', action: 'directory', subview: 'unions' },
  { name: 'গণ্ডগোহালী', category: 'গ্রাম', details: 'জিউপাড়া ইউনিয়ন, ৫ নং ওয়ার্ড', action: 'directory', subview: 'unions' },
  { name: 'ধোকড়াকুল', category: 'গ্রাম', details: 'ভালুকগাছী ইউনিয়ন, ৭ নং ওয়ার্ড', action: 'directory', subview: 'unions' },
  { name: 'শিবপুর', category: 'গ্রাম', details: 'পুঠিয়া ইউনিয়ন, ৪ নং ওয়ার্ড', action: 'directory', subview: 'unions' },
  // স্কুল
  { name: 'পুঠিয়া পি এন সরকারি মডেল উচ্চ বিদ্যালয়', category: 'স্কুল', details: 'ঐতিহাসিক পিএন স্কুল রোড, পুঠিয়া', action: 'directory', subview: 'profile', tab: 'educational_institutions' },
  { name: 'পুঠিয়া সরকারি বালিকা উচ্চ বিদ্যালয়', category: 'স্কুল', details: 'উপজেলা রোড, পুঠিয়া বাজার', action: 'directory', subview: 'profile', tab: 'educational_institutions' },
  { name: 'বানেশ্বর সরকারি কলেজ', category: 'স্কুল', details: 'ঢাকা-রাজশাহী মহাসড়ক, বানেশ্বর', action: 'directory', subview: 'profile', tab: 'educational_institutions' },
  { name: 'পুঠিয়া মডেল স্কুল', category: 'স্কুল', details: 'পুঠিয়া বাজার মেইন রোড', action: 'directory', subview: 'profile', tab: 'educational_institutions' },
  // হাসপাতাল
  { name: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স', category: 'হাসপাতাল', details: 'হাসপাতাল রোড, পুঠিয়া সদর', action: 'directory', subview: 'hospital_contact' },
  { name: 'সেভ গার্ড হাসপাতাল ও ডায়াগনস্টিক', category: 'হাসপাতাল', details: 'বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া', action: 'directory', subview: 'hospital_contact' },
  { name: 'পপুলার ডায়াগনস্টিক পুঠিয়া', category: 'হাসপাতাল', details: 'থানা গেট সংলগ্ন, পুঠিয়া বাজার', action: 'directory', subview: 'hospital_contact' },
  // ব্যবসা
  { name: 'ভাই ভাই সুপার মার্কেট', category: 'ব্যবসা', details: 'বানেশ্বর বড় বাজার, পুঠিয়া', action: 'directory', subview: 'profile', tab: 'my_ads' },
  { name: 'মা জুয়েলার্স', category: 'ব্যবসা', details: 'পুঠিয়া বাজার, গোল চত্বর', action: 'directory', subview: 'profile', tab: 'my_ads' },
  { name: 'রাজবাড়ী সুইটস অ্যান্ড রেস্টুরেন্ট', category: 'ব্যবসা', details: 'ঐতিহাসিক রাজবাড়ী তোরণ সংলগ্ন, পুঠিয়া', action: 'directory', subview: 'profile', tab: 'my_ads' },
  { name: 'সততা বস্ত্রালয়', category: 'ব্যবসা', details: 'পুঠিয়া বাজার কাপড় পট্টি', action: 'directory', subview: 'profile', tab: 'my_ads' },
  // জনপ্রতিনিধি
  { name: 'মো: জি এম হিরা বাচ্চু (উপজেলা চেয়ারম্যান)', category: 'জনপ্রতিনিধি', details: 'উপজেলা পরিষদ কার্যালয়, পুঠিয়া', action: 'directory', subview: 'unions' },
  { name: 'আলহাজ্ব মো: আল মামুন খান (পৌর মেয়র)', category: 'জনপ্রতিনিধি', details: 'পুঠিয়া পৌরসভা ভবন', action: 'directory', subview: 'unions' },
  { name: 'মো: আশরাফ খান ঝন্টু (পুঠিয়া ইউপি চেয়ারম্যান)', category: 'জনপ্রতিনিধি', details: 'পুঠিয়া ইউনিয়ন পরিষদ কার্যালয়', action: 'directory', subview: 'unions' },
  // চাকরি
  { name: 'পার্ট-টাইম সেলস অ্যাসিস্ট্যান্ট (বানেশ্বর বাজার)', category: 'চাকরি', details: 'বেতন: ৮,০০০৳, সময়: বিকেল ৪টা - রাত ১০টা', action: 'directory', subview: 'profile', tab: 'my_ads' },
  { name: 'সহকারী শিক্ষক (গণিত) - পুঠিয়া মডেল স্কুল', category: 'চাকরি', details: 'বেতন: ১৫,০০০৳, ফুল-টাইম', action: 'directory', subview: 'profile', tab: 'educational_institutions' },
  { name: 'ডাটা এন্ট্রি অপারেটর (উপজেলা পোস্ট অফিস)', category: 'চাকরি', details: 'চুক্তিভিত্তিক, কম্পিউটারে দক্ষ', action: 'directory', subview: 'profile', tab: 'my_ads' },
  { name: 'প্রাইভেট টিউটর (ক্লাস ৫-৮, পুঠিয়া সদর)', category: 'চাকরি', details: 'বেতন: ৩,৫০০৳, সপ্তাহে ৩ দিন', action: 'directory', subview: 'profile', tab: 'my_ads' },
];

// Emergency contacts list (one-click action)
const emergencyContacts: Record<string, { title: string, bnTitle: string, icon: any, contacts: { name: string, phone: string, available: string }[] }> = {
  ambulance: {
    title: 'Ambulance',
    bnTitle: 'অ্যাম্বুলেন্স সেবা',
    icon: Ambulance,
    contacts: [
      { name: 'পুঠিয়া সরকারি হাসপাতাল অ্যাম্বুলেন্স', phone: '01711223344', available: '২৪ ঘণ্টা খোলা' },
      { name: 'রেড ক্রিসেন্ট জরুরি অ্যাম্বুলেন্স', phone: '01911998877', available: '২৪ ঘণ্টা খোলা' },
      { name: 'আল-আমিন প্রাইভেট অ্যাম্বুলেন্স', phone: '01822334455', available: '২৪ ঘণ্টা খোলা' },
    ]
  },
  fire: {
    title: 'Fire Service',
    bnTitle: 'ফায়ার সার্ভিস স্টেশন',
    icon: Flame,
    contacts: [
      { name: 'পুঠিয়া ফায়ার স্টেশন (জরুরি ডিউটি)', phone: '01711224455', available: '২৪ ঘণ্টা খোলা' },
      { name: 'রাজশাহী জেলা ফায়ার স্টেশন', phone: '01811556677', available: '২৪ ঘণ্টা খোলা' },
      { name: 'জাতীয় জরুরি সেবা (ফায়ার/ফায়ার সার্ভিস)', phone: '999', available: 'টোল ফ্রি' },
    ]
  },
  police: {
    title: 'Police Station',
    bnTitle: 'পুঠিয়া থানা পুলিশ',
    icon: Shield,
    contacts: [
      { name: 'ওসি (অফিসার ইন চার্জ), পুঠিয়া থানা', phone: '01320122340', available: '২৪ ঘণ্টা খোলা' },
      { name: 'ডিউটি অফিসার, পুঠিয়া থানা', phone: '01320122344', available: '২৪ ঘণ্টা খোলা' },
      { name: 'জাতীয় জরুরি হেল্পলাইন', phone: '999', available: 'টোল ফ্রি' },
    ]
  },
  blood: {
    title: 'Blood Donor Group',
    bnTitle: 'রক্তদাতা ফোরাম ও ক্লাব',
    icon: Heart,
    contacts: [
      { name: 'পুঠিয়া ব্লাড ডোনারস ক্লাব', phone: '01733445566', available: 'জরুরি প্রয়োজনে প্রস্তুত' },
      { name: 'সন্ধানী (রাজশাহী মেডিকেল কলেজ শাখা)', phone: '01711889900', available: '২৪ ঘণ্টা রক্তদান' },
      { name: 'বাঁধন ব্লাড ব্যাংক ফাউন্ডেশন', phone: '01911223344', available: 'স্বেচ্ছাসেবী গ্রুপ' },
    ]
  }
};

// Nearby spots for interactive radar map
const nearbySpots: Record<'hospital' | 'atm' | 'mosque' | 'restaurant', { name: string, distance: string, status: string, coords: { x: number, y: number }, info: string }[]> = {
  hospital: [
    { name: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স', distance: '০.৪ কি.মি.', status: 'খোলা আছে', coords: { x: 45, y: 35 }, info: 'মেডিকেল রোড, পুঠিয়া সদর' },
    { name: 'পপুলার ডায়াগনস্টিক পুঠিয়া', distance: '০.৯ কি.মি.', status: 'খোলা আছে', coords: { x: 70, y: 55 }, info: 'থানা গেট সংলগ্ন, পুঠিয়া বাজার' },
    { name: 'সেভ গার্ড হাসপাতাল ও ডায়াগনস্টিক', distance: '১.৫ কি.মি.', status: '২৪ ঘণ্টা খোলা', coords: { x: 30, y: 75 }, info: 'পুঠিয়া বাসস্ট্যান্ড' },
  ],
  atm: [
    { name: 'ডাচ-বাংলা ব্যাংক এটিএম', distance: '০.২ কি.মি.', status: '২৪ ঘণ্টা খোলা', coords: { x: 55, y: 45 }, info: 'পুঠিয়া বাজার মেইন তোরণ' },
    { name: 'ব্র্যাক ব্যাংক এটিএম বুথ', distance: '০.৬ কি.মি.', status: '২৪ ঘণ্টা খোলা', coords: { x: 40, y: 60 }, info: 'পুঠিয়া রোড' },
    { name: 'ইসলামী ব্যাংক সিআরএম বুথ', distance: '০.৮ কি.মি.', status: '২৪ ঘণ্টা খোলা', coords: { x: 65, y: 30 }, info: 'বাসস্ট্যান্ড রোড' },
  ],
  mosque: [
    { name: 'পুঠিয়া রাজবাড়ী শাহী মসজিদ', distance: '০.৩ কি.মি.', status: 'ঐতিহাসিক মসজিদ', coords: { x: 50, y: 25 }, info: 'রাজবাড়ী লেক সংলগ্ন' },
    { name: 'পুঠিয়া বাজার জামে মসজিদ', distance: '০.৫ কি.মি.', status: 'পাঁচ ওয়াক্ত নামায', coords: { x: 35, y: 50 }, info: 'বাজার চত্বর' },
    { name: 'পুঠিয়া বাসস্ট্যান্ড জামে মসজিদ', distance: '০.৭ কি.মি.', status: 'পাঁচ ওয়াক্ত নামায', coords: { x: 60, y: 65 }, info: 'বাসস্ট্যান্ড জামে মসজিদ লেন' },
  ],
  restaurant: [
    { name: 'উৎসর্গ ক্যাফে ও রেস্টুরেন্ট', distance: '০.৩ কি.মি.', status: '৪.৮ ★ • খোলা আছে', coords: { x: 48, y: 52 }, info: 'রাজবাড়ী দিঘী পাড়' },
    { name: 'রাজবাড়ী হোটেল ও রেস্টুরেন্ট', distance: '০.৫ কি.মি.', status: '৪.২ ★ • খোলা আছে', coords: { x: 38, y: 38 }, info: 'পুঠিয়া বাজার চত্বর' },
    { name: 'কস্তুরী বিরিয়ানি হাউজ', distance: '০.৮ কি.মি.', status: '৪.০ ★ • খোলা আছে', coords: { x: 62, y: 48 }, info: 'থানা রোড, পুঠিয়া' },
  ]
};

interface DashboardHomeProps {
  onNavigate?: (view: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { userProfile, user } = useAuth() || { userProfile: null, user: null };

  // New High-Polish UX states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bellClickCount, setBellClickCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', text: '📢 জরুরী রক্তের সন্ধান: ও-পজিটিভ (O+) রক্তের প্রয়োজন, বানেশ্বর বাজার', date: '১০ মিনিট আগে', read: false },
    { id: '2', text: '🌾 নতুন কৃষি বীজ নোটিশ: আজ থেকে ইউনিয়ন পরিষদে বিতরণ শুরু', date: '২ ঘণ্টা আগে', read: false },
    { id: '3', text: '🏛️ পুঠিয়া রাজবাড়ী ভ্রমণ গাইড আপডেট সম্পন্ন হয়েছে', date: '১ দিন আগে', read: true }
  ]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showConfettiBurst, setShowConfettiBurst] = useState(false);

  // Initialize loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll activity for floating button size modulation
  useEffect(() => {
    let scrollTimeout: any;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Simulate pull to refresh logic
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setUserStars(prev => prev + 5);
    }, 1200);
  };

  const checklistTasks = [
    {
      id: 'photo',
      label: 'ছবি আপলোড',
      isCompleted: !!userProfile?.photoURL,
      btnLabel: 'Complete',
      action: () => onNavigate?.('edit-profile')
    },
    {
      id: 'phone',
      label: 'মোবাইল নম্বর যুক্তকরণ',
      isCompleted: !!userProfile?.phone && userProfile.phone.length >= 11,
      btnLabel: 'Verify Now',
      action: () => onNavigate?.('edit-profile')
    },
    {
      id: 'union',
      label: 'ইউনিয়ন নির্বাচন',
      isCompleted: !!userProfile?.union && userProfile.union !== "তথ্য নেই" && userProfile.union !== "",
      btnLabel: 'Complete',
      action: () => onNavigate?.('edit-profile')
    },
    {
      id: 'email',
      label: 'ইমেইল ভেরিফাই',
      isCompleted: !!user?.email || false,
      btnLabel: 'Verify Now',
      action: () => onNavigate?.('settings')
    },
    {
      id: 'address',
      label: 'ঠিকানা সম্পূর্ণ করুন',
      isCompleted: !!userProfile?.village && userProfile.village !== "তথ্য নেই" && userProfile.village !== "",
      btnLabel: 'Complete',
      action: () => onNavigate?.('edit-profile')
    }
  ];

  const completedCount = checklistTasks.filter(t => t.isCompleted).length;
  const totalCount = checklistTasks.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  useEffect(() => {
    if (completionPercentage === 100) {
      setShowConfettiBurst(true);
      const timer = setTimeout(() => {
        setShowConfettiBurst(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [completionPercentage]);

  const displayName = userProfile?.name || "জসিম উদ্দিন";

  const [dailyTasks, setDailyTasks] = useState([
    { id: 'blood', label: 'রক্তদাতা তথ্য আপডেট', completed: false },
    { id: 'news', label: 'নতুন সংবাদ পড়ুন', completed: false },
    { id: 'profile', label: 'প্রোফাইল সম্পূর্ণ করুন', completed: true },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('puthia_recent_searches_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [isListening, setIsListening] = useState(false);
  const [showGoldUnlockModal, setShowGoldUnlockModal] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem('puthia_recent_searches_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('puthia_recent_searches_v1');
    setRecentSearches([]);
  };

  const handleVoiceSearch = () => {
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত ভাই, আপনার ব্রাউজার ভয়েস সার্চ সমর্থন করে না। অনুগ্রহ করে গুগল ক্রোম ব্যবহার করুন!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      saveRecentSearch(speechToText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [selectedNearbyCategory, setSelectedNearbyCategory] = useState<'hospital' | 'atm' | 'mosque' | 'restaurant'>('hospital');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setDailyTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Dynamic user stars state loaded from localStorage
  const [userStars, setUserStars] = useState<number>(() => {
    const saved = localStorage.getItem('puthia_user_stars');
    return saved ? parseInt(saved, 10) : 1450;
  });

  useEffect(() => {
    const prevStars = localStorage.getItem('puthia_user_stars_prev_v1');
    const prevVal = prevStars ? parseInt(prevStars, 10) : 1450;
    if (prevVal < 5000 && userStars >= 5000) {
      setShowConfettiBurst(true);
      setShowGoldUnlockModal(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 150]);
      }
    }
    localStorage.setItem('puthia_user_stars_prev_v1', userStars.toString());
  }, [userStars]);

  // Daily Challenge state
  const [challenges, setChallenges] = useState<any[]>(() => {
    const saved = localStorage.getItem('puthia_daily_challenges_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 'historic_site',
        title: 'ঐতিহাসিক নিদর্শন পরিদর্শন (Check Historic Site)',
        titleEn: 'Check Historic Site',
        stars: 150,
        iconName: 'Landmark',
        description: 'ঐতিহাসিক পুঠিয়া রাজবাড়ী বা পঞ্চরত্ন শিব মন্দির প্রাঙ্গণে গিয়ে জিপিএস চেক-ইন করুন এবং প্রাঙ্গণের একটি ছবি আপলোড করুন।',
        actionLabel: 'পরিদর্শন ও চেক-ইন',
        status: 'idle',
        gpsRequired: true,
        uploadRequired: true,
        gpsVerified: false
      },
      {
        id: 'community_contribution',
        title: 'কমিউনিটি সহায়তা প্রদান (Contribute to Community)',
        titleEn: 'Contribute to Community',
        stars: 100,
        iconName: 'Users',
        description: 'পুঠিয়ার কোনো রক্তদাতাকে সাহায্য করুন অথবা ব্লাড গ্রুপ তথ্য হালনাগাদ করতে উদ্বুদ্ধ করে তার একটি সংক্ষিপ্ত বিবরণী শেয়ার করুন।',
        actionLabel: 'সহায়তা বিবরণী দিন',
        status: 'idle',
        textRequired: true
      },
      {
        id: 'spot_cleanup',
        title: 'নিকটস্থ স্থান পরিচ্ছন্নতা (Report & Clean Spot)',
        titleEn: 'Report & Clean Spot',
        stars: 120,
        iconName: 'Trash2',
        description: 'পুঠিয়া রাজবাড়ী দিঘী পাড় বা শিব মন্দির এলাকার যেকোনো নোংরা স্পটের ছবি তুলে পরিষ্কার করুন এবং পূর্বের ও পরের ছবি আপলোড দিন।',
        actionLabel: 'ছবি আপলোড ও রিপোর্ট',
        status: 'idle',
        uploadRequired: true
      }
    ];
  });

  // Persist challenges to local storage
  useEffect(() => {
    localStorage.setItem('puthia_daily_challenges_v1', JSON.stringify(challenges));
  }, [challenges]);

  // Persist user stars
  useEffect(() => {
    localStorage.setItem('puthia_user_stars', userStars.toString());
  }, [userStars]);

  const [challengeTexts, setChallengeTexts] = useState<Record<string, string>>({});
  const [challengeFiles, setChallengeFiles] = useState<Record<string, File | null>>({});
  const [challengePreviews, setChallengePreviews] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [verifyingChallengeId, setVerifyingChallengeId] = useState<string | null>(null);
  
  // Confetti / Completion Reward Popup State
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [earnedTitle, setEarnedTitle] = useState('');

  // Challenge Actions Handlers
  const startChallenge = (id: string) => {
    setChallenges(prev => prev.map(ch => 
      ch.id === id ? { ...ch, status: 'started' } : ch
    ));
  };

  const simulateGpsCheckIn = (id: string) => {
    setVerifyingChallengeId(id);
    setChallenges(prev => prev.map(ch => 
      ch.id === id ? { ...ch, status: 'verifying' } : ch
    ));

    // Simulate real GPS tracking and calculation
    setTimeout(() => {
      setVerifyingChallengeId(null);
      setChallenges(prev => prev.map(ch => 
        ch.id === id ? { ...ch, status: 'started', gpsVerified: true } : ch
      ));
    }, 2500);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setChallengeFiles(prev => ({ ...prev, [id]: file }));
      setChallengePreviews(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChallengeFiles(prev => ({ ...prev, [id]: file }));
      setChallengePreviews(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }
  };

  const submitChallenge = (id: string) => {
    const ch = challenges.find(c => c.id === id);
    if (!ch) return;

    // Validations
    if (ch.textRequired && !challengeTexts[id]?.trim()) {
      alert('অনুগ্রহ করে বিবরণীটি পূরণ করুন ভাই!');
      return;
    }
    if (ch.uploadRequired && !challengeFiles[id]) {
      alert('অনুগ্রহ করে একটি ছবি আপলোড করুন ভাই!');
      return;
    }
    if (ch.gpsRequired && !ch.gpsVerified) {
      alert('অনুগ্রহ করে আগে জিপিএস লোকেশনটি যাচাই করুন ভাই!');
      return;
    }

    // Complete challenge & grant reward
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'completed' } : c
    ));
    
    setUserStars(prev => prev + ch.stars);
    setEarnedPoints(ch.stars);
    setEarnedTitle(ch.title);
    setShowRewardModal(true);
  };

  const getChallengeIcon = (name: string) => {
    switch (name) {
      case 'Landmark': return Landmark;
      case 'Users': return Users;
      case 'Trash2': return Trash2;
      default: return Star;
    }
  };
  
  // Stars Count-up Animation
  const [animatedStars, setAnimatedStars] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = userStars;
    const duration = 1200; // ms
    const incrementTime = 15; // ms
    const steps = duration / incrementTime;
    const stepValue = end / steps;
    
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        clearInterval(timer);
        setAnimatedStars(end);
      } else {
        setAnimatedStars(Math.floor(start));
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [userStars]);

  const getGreetingWithEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "শুভ সকাল", emoji: "🌅" };
    if (hour >= 12 && hour < 15) return { text: "শুভ দুপুর", emoji: "☀️" };
    if (hour >= 15 && hour < 18) return { text: "শুভ বিকেল", emoji: "🌇" };
    return { text: "শুভ রাত্রি", emoji: "🌙" };
  };

  const greetingObj = getGreetingWithEmoji();

  const filteredSearch = searchQuery.trim()
    ? searchDataset.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <div className="p-5 space-y-6 text-white pb-24 animate-pulse max-w-7xl mx-auto">
        {/* Shimmer Search Bar */}
        <div className="h-[50px] bg-neutral-900 border border-gray-800/80 rounded-[20px] w-full"></div>

        {/* Shimmer Premium Hero Card */}
        <div className="bg-neutral-900 border border-gray-800/80 rounded-[20px] h-96 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-neutral-800"></div>
              <div className="space-y-2">
                <div className="h-5 bg-neutral-800 rounded w-32"></div>
                <div className="h-4 bg-neutral-800 rounded w-24"></div>
              </div>
            </div>
            <div className="h-8 bg-neutral-800 rounded-full w-24"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="h-16 bg-neutral-800 rounded-[20px]"></div>
            <div className="h-16 bg-neutral-800 rounded-[20px]"></div>
            <div className="h-16 bg-neutral-800 rounded-[20px]"></div>
            <div className="h-16 bg-neutral-800 rounded-[20px]"></div>
          </div>
          <div className="h-24 bg-neutral-800 rounded-[20px] mt-4"></div>
        </div>

        {/* Shimmer Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-900 border border-gray-800/80 rounded-[20px]"></div>
          <div className="h-24 bg-neutral-900 border border-gray-800/80 rounded-[20px]"></div>
          <div className="h-24 bg-neutral-900 border border-gray-800/80 rounded-[20px]"></div>
          <div className="h-24 bg-neutral-900 border border-gray-800/80 rounded-[20px]"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-5 space-y-6 text-white pb-24 max-w-7xl mx-auto scroll-smooth"
    >
      {/* 2-Second Success Confetti Burst */}
      {showConfettiBurst && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: "110vh", 
                x: `${Math.random() * 100}vw`, 
                scale: Math.random() * 0.6 + 0.6,
                opacity: 1,
                rotate: 0 
              }}
              animate={{ 
                y: "-10vh", 
                x: `${Math.random() * 100}vw`,
                opacity: 0,
                rotate: Math.random() * 360 
              }}
              transition={{ 
                duration: 2.2, 
                ease: "easeOut",
                delay: Math.random() * 0.4
              }}
              className="absolute text-2xl"
            >
              {['🎉', '✨', '🌟', '💖', '🍀', '🏆'][i % 6]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pull to Refresh Indicator */}
      <motion.div 
        animate={{ height: isRefreshing ? 52 : 0 }}
        className="overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-500/5 rounded-[20px] border border-emerald-500/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2 py-3">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>↻ রিফ্রেশ হচ্ছে... (Refreshing...)</span>
        </div>
      </motion.div>

      {/* Floating Action Share Button */}
      <motion.button
        animate={{ width: isScrolling ? '48px' : '135px' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={async () => {
          if (navigator.share) {
            navigator.share({
              title: 'পুঠিয়া ডিজিটাল ইউনিয়ন',
              text: 'পুঠিয়া ডিজিটাল ইউনিয়ন অ্যাপের মাধ্যমে নাগরিক সেবা ও তথ্য এক ক্লিকে পান!',
              url: window.location.href,
            }).catch(() => {});
          } else {
            await copyToClipboard(window.location.href);
            alert('লিংক কপি করা হয়েছে! আপনার বন্ধুদের সাথে শেয়ার করুন ভাই!');
          }
        }}
        className="fixed bottom-6 right-6 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 text-white flex items-center justify-center gap-2 shadow-2xl z-[150] overflow-hidden cursor-pointer"
        title="অ্যাপটি শেয়ার করুন"
      >
        <Share2 className="w-5 h-5 shrink-0" />
        {!isScrolling && <span className="text-xs font-extrabold tracking-wide whitespace-nowrap pr-1.5 select-none">শেয়ার অ্যাপ</span>}
      </motion.button>

      {/* Smart Search Bar */}
      <div className="relative">
        <div 
          className={`relative bg-[#1C1F24] h-[50px] px-4 rounded-[20px] border transition-all duration-300 flex items-center gap-3 ${
            searchFocused 
              ? 'border-emerald-500 shadow-lg shadow-emerald-500/15 scale-[1.005]' 
              : 'border-gray-800 shadow-xl'
          }`}
        >
          <motion.div 
            animate={{ rotate: searchFocused ? 15 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 shrink-0"
          >
            <Search className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <input 
            type="text" 
            placeholder="গ্রাম, স্কুল, হাসপাতাল, ব্যবসা, জনপ্রতিনিধি বা চাকরি খুঁজুন..." 
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveRecentSearch(searchQuery);
              }
            }}
            className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-gray-500 font-medium py-2 w-full focus:ring-0"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer relative ${
              isListening ? 'bg-red-500/10 text-red-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="কণ্ঠ দিয়ে খুঁজুন (Voice Search)"
          >
            {isListening ? (
              <>
                <motion.span 
                  animate={{ scale: [1, 1.4, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }} 
                  className="absolute inset-0 bg-red-500/20 rounded-lg pointer-events-none"
                />
                <Mic className="w-4.5 h-4.5 text-red-500 animate-pulse" />
              </>
            ) : (
              <Mic className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
            )}
          </button>
        </div>

        {/* Floating Search Dropdowns */}
        {searchFocused && !searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-2 bg-[#1C1F24] border border-gray-800 rounded-[20px] shadow-2xl p-4.5 z-[100] text-left space-y-4"
          >
            {recentSearches.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 mb-2.5 flex items-center justify-between">
                  <span>🕒 সাম্প্রতিক অনুসন্ধান (Recent)</span>
                  <button 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearRecentSearches();
                    }}
                    className="text-[10px] text-red-400 hover:underline cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(term);
                      }}
                      className="px-3 py-1 bg-neutral-900/60 hover:bg-gray-800 border border-gray-800/80 rounded-full text-xs font-bold text-gray-300 transition-all cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 mb-2.5">🔥 জনপ্রিয় অনুসন্ধান (Popular)</h4>
              <div className="flex flex-wrap gap-1.5">
                {['হাসপাতাল', 'রক্তদাতা', 'কৃষি', 'রাজবাড়ী', 'চাকরি', 'পরিবার পরিকল্পনা'].map((term, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(term);
                    }}
                    className="px-3 py-1 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 transition-all cursor-pointer"
                  >
                    #{term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-2 bg-[#1C1F24] border border-gray-750 rounded-[20px] shadow-2xl z-[100] max-h-96 overflow-y-auto divide-y divide-gray-800/60"
          >
            <div className="p-3 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-neutral-900/40 flex justify-between items-center rounded-t-[20px]">
              <span>অনুসন্ধানের ফলাফল ({filteredSearch.length})</span>
              <span className="text-[9px] text-gray-500 font-mono">সব তথ্য একসাথে</span>
            </div>

            {filteredSearch.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredSearch.map((item, idx) => {
                  let CategoryIcon = MapPin;
                  let categoryColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                  
                  if (item.category === 'স্কুল') {
                    CategoryIcon = Building;
                    categoryColor = 'text-emerald-500 bg-amber-500/10 border-amber-500/20';
                  } else if (item.category === 'হাসপাতাল') {
                    CategoryIcon = Hospital;
                    categoryColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  } else if (item.category === 'ব্যবসা') {
                    CategoryIcon = Store;
                    categoryColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  } else if (item.category === 'জনপ্রতিনিধি') {
                    CategoryIcon = UserCheck;
                    categoryColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                  } else if (item.category === 'চাকরি') {
                    CategoryIcon = FileText;
                    categoryColor = 'text-pink-400 bg-pink-500/10 border-pink-500/20';
                  }

                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        saveRecentSearch(item.name);
                        setSearchQuery('');
                        if (item.action === 'directory') {
                          onNavigate?.(item.subview);
                          if (item.tab) {
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('changeProfileTab', { detail: item.tab }));
                            }, 150);
                          }
                        }
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#252525]/60 transition-all cursor-pointer border border-transparent hover:border-gray-800/80 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${categoryColor}`}>
                          <CategoryIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">{item.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${categoryColor}`}>
                          {item.category}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                <span className="text-2xl">🔍</span>
                <p className="text-xs font-semibold">দুঃখিত ভাই, এই নামে কোনো তথ্য খুঁজে পাওয়া যায়নি!</p>
                <p className="text-[10px] text-gray-600">গ্রাম, স্কুল, হাসপাতাল, প্রতিনিধি বা অন্য কিছু দিয়ে পুনরায় চেষ্টা করুন।</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Premium Hero Card with Load Animation (250-300ms) */}
      <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-neutral-950 to-neutral-900 rounded-[20px] border border-emerald-800/40 shadow-xl"
      >
          <div className="h-32 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute -bottom-10 left-10 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-40"></div>
              
              {/* Date, Weather, Location & Status Overlay */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white font-semibold border border-white/10 flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            className="inline-block"
                          >
                            ☀️
                          </motion.span>
                          <motion.span 
                            animate={{ x: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="inline-block"
                          >
                            ☁️
                          </motion.span>
                          <span>৩০°C</span>
                      </div>
                      <span className="text-white/20">•</span>
                      <span>সোমবার, ৩০ জুন</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-gray-200 font-semibold border border-white/10 flex items-center gap-1">
                          <span>📍</span>
                          <span>{userProfile?.union || 'বানেশ্বর ইউনিয়ন'}</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-extrabold border border-emerald-500/20 flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
                          <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[9px] tracking-wider uppercase">অনলাইন</span>
                      </div>
                  </div>
              </div>
          </div>
          <div className="p-5 -mt-16 relative">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center shrink-0">
                          <div 
                              onClick={() => onNavigate?.('profile')}
                              title="প্রোফাইল দেখুন"
                              className="w-16 h-16 rounded-full border-[3px] border-amber-500 hover:border-emerald-500 transition-all cursor-pointer overflow-hidden shadow-lg shadow-amber-500/15 hover:shadow-emerald-500/20 duration-300 relative group"
                          >
                              <img src={userProfile?.photoURL || '/placeholder-avatar.png'} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                          </div>
                          {/* Verified Badge underneath */}
                          <div className="mt-1 bg-emerald-500/90 text-neutral-950 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-emerald-400/30 select-none animate-pulse">
                              <span>Verified</span>
                              <span>✔️</span>
                          </div>
                      </div>
                      <div>
                          <h2 className="text-xl font-bold text-white">{greetingObj.text}, {displayName}</h2>
                          <p className="text-emerald-400 font-medium text-sm">📍 {userProfile?.union || 'বানেশ্বর ইউনিয়ন'}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                          <motion.span 
                            animate={{ 
                              boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 10px rgba(245, 158, 11, 0.45)", "0 0 0px rgba(245, 158, 11, 0)"],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatDelay: 5, 
                              duration: 1.2, 
                              ease: "easeInOut" 
                            }}
                            className="bg-amber-500/15 text-amber-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/20 shadow-sm select-none"
                          >
                            🥈 Silver Member
                          </motion.span>
                          <span className="text-[9px] text-gray-400 font-bold font-mono mt-1">Level 2 • {animatedStars} XP</span>
                      </div>
                      <div className="relative">
                        <motion.button 
                          onClick={() => {
                            setBellClickCount(prev => prev + 1);
                            setShowNotifications(prev => !prev);
                            if (navigator.vibrate) {
                              navigator.vibrate([40, 30, 40]);
                            }
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="relative p-2 bg-[#111112]/50 rounded-full border border-gray-800 hover:bg-gray-800 transition-all shrink-0 cursor-pointer"
                        >
                            <motion.div
                              key={bellClickCount}
                              animate={bellClickCount > 0 ? {
                                scale: [1, 1.3, 0.9, 1.1, 1],
                                rotate: [0, 15, -15, 10, -10, 0]
                              } : {}}
                              transition={{ duration: 0.4 }}
                            >
                                <Bell className="w-4.5 h-4.5 text-emerald-400" />
                            </motion.div>
                            {notifications.filter(n => !n.read).length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full select-none animate-pulse">
                                {notifications.filter(n => !n.read).length}
                              </span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                          {showNotifications && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowNotifications(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-72 md:w-80 bg-[#1E1E1E] border border-gray-750 rounded-[20px] shadow-2xl p-4 z-50 overflow-hidden"
                              >
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                                    <span>🔔</span> নোটিফিকেশন 
                                  </h4>
                                  <button 
                                    onClick={() => {
                                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                      if (navigator.vibrate) navigator.vibrate(30);
                                    }}
                                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                                  >
                                    সব পঠিত করুন
                                  </button>
                                </div>

                                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                  {notifications.length === 0 ? (
                                    <p className="text-center text-xs text-gray-500 py-4">কোনো নতুন নোটিফিকেশন নেই।</p>
                                  ) : (
                                    notifications.map((notif) => (
                                      <div 
                                        key={notif.id}
                                        onClick={() => {
                                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                          if (navigator.vibrate) navigator.vibrate(20);
                                        }}
                                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                          notif.read 
                                            ? 'bg-neutral-900/40 border-gray-800 text-gray-400' 
                                            : 'bg-emerald-500/5 border-emerald-500/10 text-gray-200'
                                        }`}
                                      >
                                        <p className="text-[11px] font-medium leading-relaxed">{notif.text}</p>
                                        <div className="flex items-center justify-between mt-1 text-[9px] font-semibold text-gray-500">
                                          <span>{notif.date}</span>
                                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-gray-800 text-center">
                                  <button 
                                    onClick={() => {
                                      setShowNotifications(false);
                                      onNavigate?.('my-posts');
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer"
                                  >
                                    সব নোটিশ দেখুন
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                  </div>
              </div>

              {/* Enhanced 2x2 Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-[#111112]/50 p-5 rounded-[20px] border border-gray-800 shadow-inner hover:border-emerald-500/20 transition-all">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Points</p>
                      <p className="text-2xl font-black text-emerald-400">{animatedStars}</p>
                  </div>
                  <div className="bg-[#111112]/50 p-5 rounded-[20px] border border-gray-800 shadow-inner hover:border-emerald-500/20 transition-all">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Rank</p>
                      <p className="text-2xl font-black text-white">#12</p>
                  </div>
                  <div className="bg-[#111112]/50 p-5 rounded-[20px] border border-gray-800 shadow-inner hover:border-emerald-500/20 transition-all">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Posts</p>
                      <p className="text-2xl font-black text-white">24</p>
                  </div>
                  <div className="bg-[#111112]/50 p-5 rounded-[20px] border border-gray-800 shadow-inner hover:border-emerald-500/20 transition-all">
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Badges</p>
                      <p className="text-2xl font-black text-emerald-500">৩</p>
                  </div>
              </div>

              {/* Progress Section with Filled Button */}
              <div className="space-y-3 bg-[#111112]/30 p-5 rounded-[20px] border border-gray-800/50">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                      <span>প্রোফাইল {completionPercentage}% সম্পন্ন হয়েছে</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${completionPercentage}%` }} 
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="bg-emerald-500 h-2.5 rounded-full" 
                      />
                  </div>

                  {/* Profile Completion Checklist */}
                  <div className="pt-2 pb-1 space-y-2 text-xs">
                      <p className="font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">📋 প্রোফাইল সম্পন্ন করার চেকলিস্ট</p>
                      <div className="grid grid-cols-1 gap-2 text-gray-300">
                          {checklistTasks.map((task) => (
                              <div 
                                  key={task.id}
                                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all ${
                                      task.isCompleted 
                                          ? 'bg-emerald-500/5 border-emerald-500/10 text-gray-200' 
                                          : 'bg-neutral-900/40 border-gray-800/40 text-gray-400'
                                  }`}
                              >
                                  <div className="flex items-center gap-2">
                                      {task.isCompleted ? (
                                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] select-none shrink-0">
                                              ✔️
                                          </span>
                                      ) : (
                                          <span className="w-5 h-5 rounded-full bg-neutral-950/40 border border-gray-800 flex items-center justify-center font-bold text-[9px] text-gray-500 select-none shrink-0">
                                              
                                          </span>
                                      )}
                                      <span className={task.isCompleted ? 'text-gray-200 font-medium' : 'text-gray-400'}>
                                          {task.label}
                                      </span>
                                  </div>
                                  {!task.isCompleted && (
                                      <motion.button 
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={task.action}
                                          className="px-2.5 py-1 text-[10px] font-extrabold bg-gradient-to-r from-emerald-950 to-neutral-900 hover:from-emerald-600 hover:to-emerald-500 text-emerald-400 hover:text-neutral-950 border border-emerald-500/20 hover:border-transparent rounded-lg transition-all duration-300 cursor-pointer shrink-0 shadow-sm"
                                      >
                                          {task.id === 'email' || task.id === 'phone' ? 'Verify Now' : 'Complete'}
                                      </motion.button>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* 100% Complete Banner */}
                  {completionPercentage === 100 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center shadow-lg shadow-emerald-950/20 mt-2"
                      >
                          <p className="text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5">
                              <span>🎉</span> অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পূর্ণ।
                          </p>
                      </motion.div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => onNavigate?.(completionPercentage === 100 ? 'profile' : 'edit-profile')}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 text-center flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/10"
                  >
                    {completionPercentage === 100 ? 'প্রোফাইল দেখুন 👤' : 'Complete Now'}
                  </motion.button>
              </div>
          </div>
      </motion.div>

      {/* 6 Circular Buttons below Hero Card */}
      <div className="grid grid-cols-3 gap-3 py-2">
        {[
          { label: 'নতুন পোস্ট', icon: Plus, action: 'my-posts', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white' },
          { label: 'রক্তদান', icon: Heart, action: 'blood-donor', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-600 hover:text-white' },
          { label: 'জরুরি সেবা', icon: HeartPulse, action: 'health', color: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white' },
          { label: 'শিক্ষা ও ক্যারিয়ার', icon: GraduationCap, action: 'education-hub', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600 hover:text-white' },
          { label: 'হারানো ও প্রাপ্তি', icon: Search, action: 'lost-found', color: 'bg-amber-500/10 text-emerald-500 border-amber-500/20 hover:bg-amber-600 hover:text-white' },
          { label: 'স্বেচ্ছাসেবী সংগঠন', icon: Users, action: 'social-orgs', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white' },
        ].map((btn, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onNavigate?.(btn.action)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg group-hover:shadow-emerald-500/10 ${btn.color}`}>
              <btn.icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors">{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* আমার পুঠিয়া স্ট্যাটাস Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-[#1A1A1A] p-5 rounded-[20px] border border-emerald-500/20 shadow-xl relative overflow-hidden text-left"
      >
        {/* Decorative dynamic glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Card Header & Badge */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3">
          <span className="text-xs font-black text-emerald-400 tracking-wider flex items-center gap-2">
            📊 আমার পুঠিয়া স্ট্যাটাস
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase font-mono tracking-widest">
            LIVE PREVIEW
          </span>
        </div>

        {/* User Info with standard symbol */}
        <div className="flex items-center gap-3.5 mt-2">
          <div className="flex flex-col items-center shrink-0">
            <div 
              onClick={() => onNavigate?.('profile')}
              title="প্রোফাইল দেখুন"
              className="w-12 h-12 rounded-full border-[2.5px] border-emerald-500 hover:border-amber-400 transition-all cursor-pointer overflow-hidden bg-neutral-900 flex items-center justify-center text-xl relative group shadow-md shadow-emerald-500/10 hover:shadow-amber-500/20 duration-300"
            >
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
              ) : (
                <span className="group-hover:scale-110 transition-transform duration-300">👤</span>
              )}
            </div>
            {/* Small Verified badge underneath */}
            <div className="mt-1 bg-emerald-500 text-neutral-950 font-black text-[8px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-sm border border-emerald-400/30 select-none">
              <span>Verified</span>
              <span className="text-[7px]">✔️</span>
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-1.5 leading-none">
              {displayName}
            </h3>
            <p className="text-[10px] text-gray-500 font-semibold mt-1">ভেরিফাইড নাগরিক অ্যাকাউন্ট</p>
          </div>
        </div>

        {/* Divider matches requested symbol list perfectly */}
        <div className="text-gray-800 font-mono text-xs tracking-tighter my-3.5 select-none leading-none opacity-80">
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        </div>

        {/* Beautiful visual stats grid containing all user request entries explicitly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-amber-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">🏆</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">সদস্যতা স্তর</span>
            </div>
            <span className="text-emerald-500 font-black tracking-wide">Silver Member</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-emerald-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">⭐</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">মোট ইস্টার</span>
            </div>
            <span className="text-emerald-400 font-black font-mono">{userStars} ইস্টার</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-orange-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">🔥</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">লগইন স্ট্রিক</span>
            </div>
            <span className="text-white font-black font-mono">Login Streak: 18 Days</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-rose-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">❤️</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">রক্তদান</span>
            </div>
            <span className="text-rose-400 font-black font-mono">Blood Donation: 2 Times</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-blue-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">📝</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">পোস্ট সংখ্যা</span>
            </div>
            <span className="text-white font-black font-mono">Posts: 15</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-gray-800 rounded-[20px] hover:border-pink-500/20 hover:bg-neutral-900/80 transition-all duration-300 group">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">🎁</span>
              <span className="text-gray-400 font-bold group-hover:text-gray-300 transition-colors">পুরস্কার</span>
            </div>
            <span className="text-pink-400 font-black font-mono">Rewards: 5</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#1F2D24]/40 border border-emerald-500/20 rounded-[20px] hover:border-emerald-500/40 hover:bg-[#1F2D24]/60 transition-all duration-300 group sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="text-base filter drop-shadow-sm shrink-0">📈</span>
              <span className="text-gray-400 font-bold group-hover:text-emerald-300 transition-colors">কমিউনিটি র‍্যাংক</span>
            </div>
            <span className="text-emerald-400 font-extrabold font-mono">Community Rank: #12</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ইস্টার', icon: Star, val: `${userStars}`, action: 'points' },
          { label: 'ব্যাজ', icon: Award, val: '3', action: 'badges' },
          { label: 'রিওয়ার্ড', icon: Gift, val: '5', action: 'recharge-gift' },
          { label: 'রক্তদাতা', icon: HeartPulse, val: 'O+', action: 'blood-donor' },
        ].map((stat, i) => (
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={i} 
            onClick={() => onNavigate?.(stat.action)}
            className="bg-[#1C1F24] p-5 rounded-[20px] border border-gray-800 hover:border-[#0E8F63]/50 hover:bg-[#202329] transition-all duration-300 flex flex-col items-center cursor-pointer text-center w-full shadow-xl"
          >
            <stat.icon className="w-7 h-7 text-[#0E8F63] mb-3" strokeWidth={2} />
            <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.val}</p>
          </motion.button>
        ))}
      </div>

      {/* Citizen Score & QR Citizen ID & Daily Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: Citizen Score & QR ID Card */}
        <div className="space-y-4">
          {/* Citizen Score Widget */}
          <div className="bg-[#1C1F24] p-5 rounded-[20px] border border-gray-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Citizen Score</h3>
                <p className="text-xs text-emerald-400 font-semibold">নাগরিক স্কোর</p>
              </div>
              <span className="bg-amber-500/10 text-emerald-500 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/20">
                ★★★★☆ 82/100
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl font-black text-white font-mono tracking-tight">82<span className="text-gray-500 text-lg">/100</span></div>
              <div className="flex gap-0.5 text-emerald-500 text-lg">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed bg-[#2a2a2a]/50 p-2.5 rounded-[20px] border border-gray-800">
              এটি ব্যবহারকারীর অবদানের ওপর ভিত্তি করে পরিবর্তন হবে।
            </p>
          </div>

          {/* QR Citizen ID Card Preview */}
          <div 
            onClick={() => onNavigate?.('digital_id_card')}
            className="bg-gradient-to-br from-emerald-950 via-[#162A1D] to-neutral-900 p-5 rounded-[20px] border border-emerald-800/40 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">QR Citizen ID</h3>
                <p className="text-[10px] text-gray-400">ডিজিটাল নাগরিক পরিচয়পত্র</p>
              </div>
              <QrCode className="w-8 h-8 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>

            <div className="bg-[#111112]/60 p-3.5 rounded-[20px] border border-emerald-900/40 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-950/80 rounded-lg border border-emerald-500/20 flex items-center justify-center font-mono text-emerald-400 text-xs font-bold">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[9px] text-emerald-400 font-mono tracking-wider">PUT-8745 • ভেরিফাইড নাগরিক</p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
            </div>

            <p className="text-[10px] text-gray-400 text-center font-semibold">
              প্রতিটি ইউজারের একটি QR Card থাকবে, যেটি স্ক্যান করে তার পাবলিক প্রোফাইল দেখা যাবে।
            </p>
          </div>
        </div>

        {/* Right Side: Daily Task */}
        <div className="bg-[#1C1F24] p-5 rounded-[20px] border border-gray-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-base">
                <span>🎯</span> আজকের কাজ (Daily Task)
              </h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/15">
                {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} সম্পন্ন
              </span>
            </div>
            
            <div className="space-y-3">
              {dailyTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between p-3.5 rounded-[20px] border cursor-pointer transition-all duration-300 ${
                    task.completed 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-300' 
                      : 'bg-[#2a2a2a] border-gray-800 text-gray-400 hover:border-gray-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded border transition-colors border-gray-600">
                      {task.completed ? (
                        <div className="absolute inset-0 bg-emerald-500 rounded flex items-center justify-center text-neutral-950 font-black text-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-transparent rounded"></div>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                      {task.label}
                    </span>
                  </div>
                  {task.completed && (
                    <span className="text-[10px] text-emerald-500 font-bold">☑</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex justify-between items-center text-[10px] text-gray-500 font-semibold">
            <span>প্রতিদিন রাত ১২ টায় নতুন কাজ যোগ হবে।</span>
            <span className="text-emerald-500/80 hover:underline cursor-pointer">রিলোড করুন</span>
          </div>
        </div>
      </div>

      {/* ⚔️ দৈনিক চ্যালেঞ্জ (Daily Challenges Widget) */}
      <div id="daily-challenges-widget" className="bg-[#1C1F24] p-5 rounded-[20px] border border-gray-800 shadow-xl relative overflow-hidden">
        {/* Glowing design elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-gray-800 pb-4">
          <div>
            <h3 className="font-extrabold text-white flex items-center gap-2 text-base">
              <span className="text-[#0E8F63] animate-pulse">⚔️</span> আজকের চ্যালেঞ্জ (Daily Challenge)
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">পুঠিয়ার ঐতিহ্য সংরক্ষণ ও স্থানীয় উন্নয়নে অংশ নিয়ে এক্সট্রা ইস্টার অর্জন করুন ভাই!</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              {challenges.filter(c => c.status === 'completed').length}/{challenges.length} সম্পন্ন
            </span>
            <button 
              onClick={() => {
                // Reset daily challenges for testing convenience
                if (confirm('আপনি কি আজকের চ্যালেঞ্জ রিসেট করতে চান?')) {
                  const reset = challenges.map(c => ({ ...c, status: 'idle', gpsVerified: false }));
                  setChallenges(reset);
                  setChallengeTexts({});
                  setChallengeFiles({});
                  setChallengePreviews({});
                }
              }}
              className="text-[10px] text-gray-500 hover:text-emerald-400 border border-gray-800 hover:border-emerald-500/30 px-2.5 py-1 rounded-[20px] transition-all cursor-pointer"
            >
              রিসেট
            </button>
          </div>
        </div>

        {/* Challenge Items list */}
        <div className="space-y-4">
          {challenges.map((ch) => {
            const IconComponent = getChallengeIcon(ch.iconName);
            const isIdle = ch.status === 'idle';
            const isStarted = ch.status === 'started' || ch.status === 'verifying';
            const isVerifying = ch.status === 'verifying';
            const isCompleted = ch.status === 'completed';

            return (
              <div 
                key={ch.id} 
                className={`p-5 rounded-[20px] border transition-all duration-300 flex flex-col justify-between min-h-[195px] ${
                  isCompleted 
                    ? 'bg-[#152a1d]/20 border-emerald-500/30 shadow-inner' 
                    : isStarted 
                      ? 'bg-[#1B1B1C] border-emerald-500/20' 
                      : 'bg-[#181819]/50 border-gray-800 hover:border-gray-700 hover:bg-[#1C1C1D]/60'
                }`}
              >
                {/* Header row / top info block of each challenge card */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex gap-3.5 items-start">
                      {/* Left side Icon: updated to exact 48px size (w-12 h-12) */}
                      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 border ${
                        isCompleted 
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' 
                          : isStarted 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-neutral-900 border-gray-800 text-gray-400'
                      }`}>
                        <IconComponent className="w-5 h-5" strokeWidth={2} />
                      </div>

                      {/* Text block: separated Bengali (primary) and English (small helper) */}
                      <div className="text-left flex-1 min-w-0">
                        {(() => {
                          let bnTitle = ch.title;
                          let enTitle = '';
                          if (ch.title.includes('(')) {
                            const parts = ch.title.split('(');
                            bnTitle = parts[0].trim();
                            enTitle = '(' + parts.slice(1).join('(').trim();
                          } else if (ch.titleEn) {
                            enTitle = `(${ch.titleEn})`;
                          }

                          const isExpanded = expandedDesc[ch.id];
                          const maxLen = 85;
                          const needsToggle = ch.description.length > maxLen;
                          const displayDesc = (needsToggle && !isExpanded) 
                            ? `${ch.description.slice(0, maxLen)}...` 
                            : ch.description;

                          return (
                            <>
                              <h4 className={`text-sm font-black leading-tight ${isCompleted ? 'text-[#0E8F63] line-through' : 'text-white'}`}>
                                {bnTitle}
                              </h4>
                              {enTitle && (
                                <span className={`text-[10px] font-semibold text-gray-500 block mt-0.5 ${isCompleted ? 'line-through text-[#0E8F63]/50' : ''}`}>
                                  {enTitle}
                                </span>
                              )}

                              {/* Description with enhanced line-height (1.5 - 1.6) & Read More toggle */}
                              <p className="text-xs text-gray-400 leading-[1.6] font-medium mt-2.5">
                                {displayDesc}
                                {needsToggle && (
                                  <button 
                                    onClick={() => setExpandedDesc(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 ml-1.5 inline-block cursor-pointer focus:outline-none"
                                  >
                                    {isExpanded ? 'সংক্ষিপ্ত করুন' : 'আরও দেখুন'}
                                  </button>
                                )}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Points Badge */}
                    <div className="shrink-0">
                      <span className="bg-amber-500/10 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-[20px] border border-amber-500/20 flex items-center gap-1 shrink-0 whitespace-nowrap">
                        🔥 +{ch.stars} ইস্টার
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-form section based on Challenge State */}
                {isIdle && (
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startChallenge(ch.id)}
                      className="w-full sm:w-[185px] h-10 bg-[#0E8F63] hover:bg-[#0c7a54] text-xs font-bold text-neutral-950 rounded-[20px] flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                    >
                      <span>🚀</span> চ্যালেঞ্জ শুরু করুন
                    </motion.button>
                  </div>
                )}

                {isStarted && (
                  <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-4">
                    {/* GPS Check-in simulator */}
                    {ch.gpsRequired && (
                      <div className="bg-neutral-900/60 p-4 rounded-[20px] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            ch.gpsVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 text-emerald-500 animate-pulse'
                          }`}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-gray-200">জিপিএস লোকেশন ট্র্যাকিং</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {ch.gpsVerified 
                                ? 'যাচাইকৃত! আপনি পুঠিয়া রাজবাড়ী এরিয়াতেই আছেন।' 
                                : isVerifying 
                                  ? 'স্যাটেলাইট অনুসন্ধান চলছে...' 
                                  : 'চেক-ইন বোতাম টিপে স্থান নিশ্চিত করুন।'}
                            </p>
                          </div>
                        </div>
                        {ch.gpsVerified ? (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-[20px] flex items-center gap-1">
                            ✓ লোকেশন ভেরিফাইড
                          </span>
                        ) : (
                          <button
                            disabled={isVerifying}
                            onClick={() => simulateGpsCheckIn(ch.id)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-[20px] border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isVerifying 
                                ? 'bg-neutral-800 border-gray-700 text-gray-500' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isVerifying ? (
                              <>
                                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full" />
                                জিপিএস যাচাই হচ্ছে...
                              </>
                            ) : (
                              <>
                                <Navigation className="w-3.5 h-3.5" />
                                জিপিএস চেক-ইন করুন
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Text Area Description Input */}
                    {ch.textRequired && (
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                          📝 আপনার অবদানের বিবরণী দিন:
                        </label>
                        <textarea
                          placeholder="রক্তদাতার নাম, এলাকা অথবা আপনার উদ্বুদ্ধকরণ কাজের সংক্ষিপ্ত বিবরণী লিখুন..."
                          value={challengeTexts[ch.id] || ''}
                          onChange={(e) => setChallengeTexts(prev => ({ ...prev, [ch.id]: e.target.value }))}
                          className="w-full text-xs p-3 rounded-[20px] bg-neutral-900 border border-gray-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 min-h-[80px]"
                        />
                      </div>
                    )}

                    {/* Image Drag & Drop Uploader */}
                    {ch.uploadRequired && (
                      <div className="space-y-2 text-left">
                        <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                          📷 প্রমাণের ছবি আপলোড করুন (Drag & Drop or Select):
                        </label>
                        <div
                          onDragOver={(e) => handleDragOver(e, ch.id)}
                          onDragLeave={(e) => handleDragLeave(e, ch.id)}
                          onDrop={(e) => handleDrop(e, ch.id)}
                          className={`border-2 border-dashed rounded-[20px] p-4 text-center cursor-pointer transition-all ${
                            dragActive[ch.id] 
                              ? 'border-emerald-500 bg-emerald-500/5' 
                              : challengePreviews[ch.id] 
                                ? 'border-emerald-500/40 bg-neutral-900/60' 
                                : 'border-gray-800 bg-neutral-900/40 hover:border-gray-700'
                          }`}
                        >
                          {challengePreviews[ch.id] ? (
                            <div className="space-y-3">
                              <div className="w-32 h-20 mx-auto rounded-lg overflow-hidden border border-emerald-500/20 relative group">
                                <img src={challengePreviews[ch.id]} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChallengeFiles(prev => ({ ...prev, [ch.id]: null }));
                                    setChallengePreviews(prev => ({ ...prev, [ch.id]: '' }));
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 active:scale-95 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[10px] text-emerald-400 font-bold">ছবি লোড হয়েছে! ক্লিক বা ড্রপ করে পরিবর্তন করুন।</p>
                            </div>
                          ) : (
                            <label className="cursor-pointer block space-y-2">
                              <Upload className="w-6 h-6 text-gray-500 mx-auto" />
                              <div className="text-xs text-gray-300">
                                <span className="text-emerald-400 font-bold">ছবি আপলোড করতে ক্লিক করুন</span>
                                <span className="text-gray-500"> অথবা ড্র্যাগ করে ছেড়ে দিন</span>
                              </div>
                              <p className="text-[9px] text-gray-600">JPG, PNG, WebP (সর্বোচ্চ ৫ মেগাবাইট)</p>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileChange(e, ch.id)} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Row */}
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button 
                        onClick={() => {
                          setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, status: 'idle', gpsVerified: false } : c));
                        }}
                        className="px-3.5 py-2 text-xs font-bold text-gray-400 bg-[#252525]/80 hover:bg-[#252525] border border-gray-800 hover:border-gray-700 rounded-[20px] transition-all cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => submitChallenge(ch.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-xs font-bold text-neutral-950 rounded-[20px] flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-95 transition-transform cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        সম্পন্ন ও ইস্টার দাবি করুন
                      </button>
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div className="mt-3.5 pt-3 border-t border-emerald-950/40 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-500/80 font-black flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      চ্যালেঞ্জ সম্পন্ন হয়েছে! বোনাস যুক্ত হয়েছে ভাই।
                    </span>
                    <span className="text-emerald-400 font-black font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      ✓ +{ch.stars} XP Claimed
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement System Section */}
      <div className="bg-[#1C1F24] p-6 rounded-[20px] border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
              <span>🏆</span> অ্যাচিভমেন্ট সিস্টেম (Achievement System)
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">আপনার অর্জিত ব্যাজ এবং পরবর্তী টার্গেট</p>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-500 font-bold px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
            🥈 Silver Member
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { level: 'Bronze', emoji: '🥉', stars: 0, label: 'Bronze' },
            { level: 'Silver', emoji: '🥈', stars: 1000, label: 'Silver' },
            { level: 'Gold', emoji: '🥇', stars: 5000, label: 'Gold' },
            { level: 'Platinum', emoji: '💎', stars: 10000, label: 'Platinum' },
            { level: 'Ambassador', emoji: '👑', stars: 25000, label: 'Ambassador' },
          ].map((ach) => {
            const isUnlocked = userStars >= ach.stars;
            const isActive = ach.level === 'Silver'; // Currently active level
            
            return (
              <div 
                key={ach.level} 
                className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                  isActive 
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/5 scale-105' 
                    : isUnlocked 
                      ? 'bg-emerald-500/5 border-emerald-500/15' 
                      : 'bg-neutral-900/40 border-gray-800 opacity-40'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow-md">{ach.emoji}</span>
                <span className={`text-[9px] font-black ${isActive ? 'text-emerald-500' : 'text-white'}`}>{ach.label}</span>
                <span className="text-[8px] font-mono text-gray-500 mt-0.5">{ach.stars > 0 ? `${ach.stars}+` : '০'}</span>
              </div>
            );
          })}
        </div>

        {/* Progress to next level (Gold) */}
        <div className="space-y-2 bg-[#2a2a2a]/40 p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1">🥈 সিলভার মেম্বার <span className="text-gray-500">•</span> <span className="text-emerald-400">{userStars} ইস্টার</span></span>
            <span className="text-amber-500">🥇 গোল্ড (৫,০০০ ইস্টার)</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (userStars / 5000) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
            <span>অর্জিত: {Math.min(100, Math.floor((userStars / 5000) * 100))}%</span>
            <span>{userStars >= 5000 ? 'অভিনন্দন! আপনি গোল্ড মেম্বারশিপ লেভেলে পৌঁছে গেছেন!' : `আর মাত্র ${5000 - userStars} ইস্টার প্রয়োজন`}</span>
          </div>
        </div>
      </div>

      {/* Emergency Card - One Click Access */}
      <div className="bg-[#1C1F24] p-6 rounded-[20px] border border-gray-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span className="text-red-500 animate-pulse">🚨</span> জরুরি কার্ড (One-Click Help)
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">এক ক্লিকেই পেয়ে যান জরুরি যোগাযোগের তালিকা</p>
          </div>
          <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/20">জরুরি সেবা</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'ambulance', label: 'অ্যাম্বুলেন্স', emoji: '🚑', color: 'hover:border-red-500/50 hover:bg-red-950/20 text-red-400 bg-red-500/5 border-red-500/10' },
            { id: 'fire', label: 'ফায়ার সার্ভিস', emoji: '🚒', color: 'hover:border-amber-500/50 hover:bg-amber-950/20 text-emerald-500 bg-amber-500/5 border-amber-500/10' },
            { id: 'police', label: 'পুলিশ', emoji: '👮', color: 'hover:border-blue-500/50 hover:bg-blue-950/20 text-blue-400 bg-blue-500/5 border-blue-500/10' },
            { id: 'blood', label: 'রক্তদাতা', emoji: '🩸', color: 'hover:border-rose-500/50 hover:bg-rose-950/20 text-rose-400 bg-rose-500/5 border-rose-500/10' },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedEmergency(item.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-[20px] border text-center transition-all cursor-pointer shadow-md ${item.color}`}
            >
              <span className="text-3xl mb-2 filter drop-shadow-md">{item.emoji}</span>
              <span className="text-xs font-bold text-white mt-1">{item.label}</span>
              <span className="text-[9px] text-gray-400 font-semibold mt-1">ক্লিক করুন</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Community Ranking (কমিউনিটি র‍্যাংকিং) */}
      <div className="bg-[#1C1F24] p-6 rounded-[20px] border border-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              🏆 এই মাসের সেরা সদস্য (Leaderboard)
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">সবচেয়ে সক্রিয় ও সেবামূলক সদস্যদের তালিকা</p>
          </div>
          <span className="bg-amber-500/10 text-emerald-500 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/20">Monthly</span>
        </div>

        <div className="space-y-3">
          {[
            { rank: 1, name: 'জসিম উদ্দিন', stars: userStars, isCurrentUser: true, avatar: userProfile?.photoURL || '/placeholder-avatar.png', status: 'ambassador' },
            { rank: 2, name: 'মো: আব্দুল বারী', stars: 1320, isCurrentUser: false, avatar: '', status: 'platinum' },
            { rank: 3, name: 'মোছা: সাদিয়া খাতুন', stars: 1250, isCurrentUser: false, avatar: '', status: 'gold' },
            { rank: 4, name: 'ফাহাদ আহমেদ শান্ত', stars: 1180, isCurrentUser: false, avatar: '', status: 'silver' },
            { rank: 5, name: 'ফারহানা ইয়াসমিন', stars: 1120, isCurrentUser: false, avatar: '', status: 'silver' },
          ].map((member, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                member.isCurrentUser 
                  ? 'bg-[#1a2d24] border-emerald-500/30' 
                  : 'bg-[#252525]/30 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Medal or Position Icon */}
                <div className="w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">
                  {member.rank === 1 ? (
                    <span className="text-xl">🥇</span>
                  ) : member.rank === 2 ? (
                    <span className="text-xl">🥈</span>
                  ) : member.rank === 3 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="text-gray-500 text-xs font-mono">{member.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-neutral-800 border border-gray-700 overflow-hidden flex items-center justify-center text-xs shrink-0 font-bold text-white">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-1.5 py-0.2 rounded">আপনি</span>
                    )}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5 capitalize flex items-center gap-1">
                    <span>⚡ {member.stars} ইস্টার</span>
                    <span className="text-gray-600">•</span>
                    <span className={
                      member.status === 'ambassador' ? 'text-purple-400 font-black' :
                      member.status === 'platinum' ? 'text-blue-400' :
                      member.status === 'gold' ? 'text-emerald-500' : 'text-gray-400'
                    }>{member.status}</span>
                  </p>
                </div>
              </div>

              {/* Progress visual */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block w-24 bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${(member.stars / 1500) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-gray-300 font-mono">{member.rank === 1 ? 'Top 1' : `${Math.floor((member.stars / (userStars || 1450)) * 100)}%`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Services with interactive Radar and Spots list */}
      <div className="bg-[#1C1F24] p-6 rounded-[20px] border border-gray-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              📍 নিকটবর্তী সেবা (Nearby Services)
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">আপনার বর্তমান লোকেশন থেকে পুঠিয়ার প্রধান সেবা</p>
          </div>
          
          {/* Tabs inside Nearby services */}
          <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-gray-800">
            {[
              { id: 'hospital', label: 'হাসপাতাল', emoji: '🏥' },
              { id: 'atm', label: 'ATM', emoji: '🏧' },
              { id: 'mosque', label: 'মসজিদ', emoji: '🕌' },
              { id: 'restaurant', label: 'রেস্টুরেন্ট', emoji: '🍽️' },
            ].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (navigator.vibrate) {
                    navigator.vibrate(20);
                  }
                  setIsMapLoading(true);
                  setSelectedNearbyCategory(tab.id as any);
                  setTimeout(() => setIsMapLoading(false), 450);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  selectedNearbyCategory === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Radar Fallback */}
        {isMapLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center w-full">
            {/* Left Radar Skeleton */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 bg-neutral-950/40 border border-gray-800 rounded-[20px] h-64 relative overflow-hidden">
              <Skeleton className="w-44 h-44 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-emerald-500/30 rounded-full animate-ping"></div>
              </div>
              <div className="mt-4 flex gap-4 w-full px-4">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-2 w-16 ml-auto" />
              </div>
            </div>

            {/* Right List Skeletons */}
            <div className="lg:col-span-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-[#252525]/20 border border-gray-800 rounded-xl">
                  <div className="flex items-start gap-3.5 w-full">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="space-y-2 w-full max-w-[180px]">
                      <Skeleton className="h-3 w-32 rounded-md" />
                      <Skeleton className="h-2.5 w-44 rounded-md" />
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-12 rounded-sm" />
                        <Skeleton className="h-3 w-16 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="w-20 h-7 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 bg-neutral-950/40 border border-gray-800 rounded-[20px] relative overflow-hidden h-64 shadow-inner">
              {/* Radar swept light background lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(16,185,129,0.02)_10%,_transparent_60%)]"></div>
              
              {/* Concentric rings */}
              <div className="w-48 h-48 rounded-full border border-emerald-500/10 absolute flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-emerald-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center">
                    {/* Center Dot (User current location) */}
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] relative z-10">
                      <span className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sweep radar hand */}
              <div className="absolute top-1/2 left-1/2 w-24 h-0.5 bg-gradient-to-r from-emerald-500/40 to-transparent origin-left animate-[spin_4s_linear_infinite] pointer-events-none"></div>

              {/* Plotted spots as selectable pins */}
              {nearbySpots[selectedNearbyCategory].map((spot, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ top: `${spot.coords.y}%`, left: `${spot.coords.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                >
                  {/* Interactive ping pulse */}
                  <span className="absolute -inset-2 rounded-full bg-emerald-500/20 scale-0 group-hover:scale-125 transition-transform duration-300 pointer-events-none"></span>
                  <div className="bg-emerald-500 text-neutral-950 p-1.5 rounded-full shadow-lg border border-white hover:bg-white transition-colors">
                    {selectedNearbyCategory === 'hospital' ? <Hospital className="w-3.5 h-3.5" /> :
                     selectedNearbyCategory === 'atm' ? <CreditCard className="w-3.5 h-3.5" /> :
                     selectedNearbyCategory === 'mosque' ? <Building className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                  </div>

                  {/* Mini Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1C1F24] border border-gray-750 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none scale-90 group-hover:scale-100">
                    <span className="text-emerald-400 font-black">{spot.distance}</span>
                    <p className="mt-0.5">{spot.name}</p>
                  </div>
                </motion.div>
              ))}

              <div className="absolute bottom-3 left-3 text-[9px] text-gray-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>GPS: PUTHIA, BD</span>
              </div>
              <div className="absolute bottom-3 right-3 text-[9px] text-gray-500 font-mono">
                রেঞ্জ: ২.০ কি.মি.
              </div>
            </div>

            {/* Location Spots details list with slide-in animation */}
            <div className="lg:col-span-3 space-y-3">
              {nearbySpots[selectedNearbyCategory].map((spot, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  whileHover={{ scale: 0.99, boxShadow: "0 0 15px rgba(16,185,129,0.04)" }}
                  className="flex items-center justify-between p-3.5 bg-[#252525]/30 border border-gray-800/80 rounded-[20px] hover:border-emerald-500/20 hover:bg-[#252525]/50 transition-all group"
                >
                  <div className="flex items-start gap-3.5 text-left min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                      {selectedNearbyCategory === 'hospital' ? <Hospital className="w-5 h-5" /> :
                       selectedNearbyCategory === 'atm' ? <CreditCard className="w-5 h-5" /> :
                       selectedNearbyCategory === 'mosque' ? <Building className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{spot.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{spot.info}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8.5px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/15">
                          {spot.status}
                        </span>
                        <span className="text-gray-600 font-semibold">•</span>
                        <span className="text-[10px] font-black text-emerald-400 font-mono">{spot.distance} দূরে</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (navigator.vibrate) {
                        navigator.vibrate([30, 20, 30]);
                      }
                      alert(`দিকনির্দেশনা সফলভাবে চালু হয়েছে ভাই!\n${spot.name} এ যাওয়ার জন্য রাজশাহী-ঢাকা মহাসড়ক ধরে এগিয়ে চলুন। দূরত্ব: ${spot.distance}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[10px] font-black rounded-lg border border-emerald-500/20 hover:border-emerald-600 transition-all cursor-pointer shrink-0"
                  >
                    <Navigation className="w-3 h-3" />
                    <span className="hidden sm:inline">দিকনির্দেশনা</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact Modal popup */}
      {selectedEmergency && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1C1F24] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  {React.createElement(emergencyContacts[selectedEmergency].icon, { className: 'w-5 h-5' })}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white">{emergencyContacts[selectedEmergency].bnTitle}</h3>
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wide">{emergencyContacts[selectedEmergency].title}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedEmergency(null); setCopiedNumber(null); }}
                className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contacts List inside Modal */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {emergencyContacts[selectedEmergency].contacts.map((contact, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 bg-neutral-900/40 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all text-left flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                    <p className="text-[10px] font-black text-emerald-400 font-mono mt-0.5">{contact.phone}</p>
                    <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.2 rounded mt-1.5">
                      {contact.available}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copy Button */}
                    <button 
                      onClick={async () => {
                        await copyToClipboard(contact.phone);
                        setCopiedNumber(contact.phone);
                        setTimeout(() => setCopiedNumber(null), 1500);
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all border border-gray-700 cursor-pointer"
                      title="নম্বরটি কপি করুন"
                    >
                      {copiedNumber === contact.phone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Direct Call Button */}
                    <a 
                      href={`tel:${contact.phone}`}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center transition-all cursor-pointer border border-red-500/20"
                      title="কল করুন"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer warning */}
            <div className="p-4 bg-neutral-900/60 border-t border-gray-800/80 text-[10px] text-gray-500 font-semibold text-center flex items-center justify-center gap-1.5">
              <span>⚠️ যেকোনো অনাকাঙ্ক্ষিত হয়রানি আইনি দণ্ডনীয় অপরাধ।</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🏆 Rewards Claimed Confetti Overlay */}
      {showRewardModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div 
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            className="bg-[#1A1A1A] max-w-sm w-full p-8 rounded-[32px] border-2 border-emerald-500 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/10"
          >
            {/* Animated Glow Backdrops */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            {/* Sparkles / Confetti Particle Simulation (CSS/motion framework native) */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 200, x: 0, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
                  animate={{ 
                    y: -150 - Math.random() * 100, 
                    x: (Math.random() - 0.5) * 160, 
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity, delay: i * 0.15 }}
                  className="absolute bottom-4 left-1/2 text-lg"
                >
                  {['✨', '⭐', '🎉', '🌟', '🏆', '💎'][i % 6]}
                </motion.div>
              ))}
            </div>

            {/* Trophy Icon */}
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg relative animate-bounce">
              🏆
              <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-25"></div>
            </div>

            <h3 className="text-xl font-black text-emerald-500 mb-1">অসাধারণ অর্জন!</h3>
            <p className="text-xs text-gray-400 font-semibold mb-4 px-2">চ্যাম্পিয়ন! চ্যালেঞ্জটি সফলভাবে যাচাই ও সম্পন্ন হয়েছে ভাই!</p>
            
            {/* Dynamic details card inside modal */}
            <div className="bg-neutral-900/80 p-4 rounded-2xl border border-gray-800 mb-6">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">কাজের বিবরণী</p>
              <p className="text-xs font-bold text-white px-2 leading-relaxed truncate">{earnedTitle}</p>
              
              <div className="mt-4 flex items-center justify-center gap-1">
                <span className="text-xs text-gray-400 font-bold">পুরস্কার:</span>
                <span className="text-emerald-400 text-base font-black font-mono flex items-center gap-1.5">
                  ⭐ +{earnedPoints} ইস্টার
                </span>
              </div>
            </div>

            {/* Claim button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowRewardModal(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-neutral-950 font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            >
              ইস্টার সংগ্রহ করুন 🚀
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* 👑 Gold Level Up / Badge Unlock Modal */}
      {showGoldUnlockModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <motion.div 
            initial={{ scale: 0.3, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0, rotate: 5 }}
            className="bg-gradient-to-b from-[#1C1F24] to-[#121418] max-w-sm w-full p-8 rounded-[32px] border-2 border-amber-500 text-center relative overflow-hidden shadow-2xl shadow-amber-500/10"
          >
            {/* Ambient golden aura background */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl pointer-events-none"></div>

            {/* Confetti Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, x: Math.random() * 300 - 150, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
                  animate={{ 
                    y: 400, 
                    x: Math.random() * 300 - 150, 
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 3, ease: "easeOut", repeat: Infinity, delay: i * 0.1 }}
                  className="absolute left-1/2 text-lg"
                >
                  {['👑', '🥇', '✨', '💖', '⭐', '🎉'][i % 6]}
                </motion.div>
              ))}
            </div>

            {/* Glowing Golden Badge / Medal with pulse */}
            <div className="w-24 h-24 bg-amber-500/15 border border-amber-500/40 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl relative">
              <motion.span
                animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                🥇
              </motion.span>
              <div className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-30"></div>
            </div>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-2 font-sans tracking-tight">
              অভিনন্দন! গোল্ড মেম্বার
            </h3>
            <p className="text-xs text-gray-300 font-bold mb-6 px-4 leading-relaxed">
              আপনি সফলভাবে ৫,০০০+ ইস্টার অর্জন করেছেন এবং <span className="text-emerald-500 font-extrabold">গোল্ড মেম্বারশিপ ব্যাজ</span> আনলক করেছেন!
            </p>

            <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 mb-6">
              <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wide">নতুন আনলককৃত সুবিধা</p>
              <ul className="text-left text-[11px] text-gray-400 mt-2 space-y-1.5 list-disc pl-4 font-semibold">
                <li>নতুন ব্যাজ: <span className="text-emerald-500 font-extrabold">🥇 গোল্ড নাগরিক</span></li>
                <li>লিডারবোর্ডে গোল্ডেন হাইলাইট ও এক্সক্লুসিভ মেডেল</li>
                <li>পদ্ধতিগত নোটিশ বোর্ডে পোস্ট করার বিশেষ অনুমোদন</li>
                <li>বিশেষ সেবা প্রাপ্তির অগ্রগণ্যতা</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowGoldUnlockModal(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-950/20 cursor-pointer"
            >
              ব্যাজটি সংগ্রহ করুন 👑
            </motion.button>
          </motion.div>
        </div>
      )}
      <Footer />
    </motion.div>
  );
}

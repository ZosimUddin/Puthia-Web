import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Bookmark, Download, ExternalLink, 
  Landmark, Map, Sprout, Users, BookOpen, ShieldCheck, Lightbulb,
  ChevronRight, Headset, FolderSearch, Star, AlertCircle, RefreshCw, User, Plane, Car, Shield, Briefcase, FileCheck, PhoneCall, Phone, Flame, Ambulance, Hospital, ShieldAlert, Coins, Receipt, Building, Smartphone, Home, Edit, Cloud, GraduationCap, Award, Gift, Zap, Calculator, ArrowRightLeft, Calendar, Activity, CreditCard, BookmarkPlus, Globe, CheckSquare,
  Search, ArrowLeft, X, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import Skeleton from "../../components/home/Skeleton";
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { resourceSections } from './ResourceSectionsData';
import { governmentWebsites } from "./GovernmentWebsitesData";
import { emergencyServicesList, EmergencyServiceItem } from "./EmergencyServicesData";
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Copy, Compass, Check, MapPin, Clock, Share2, Trash2, History, Sparkles, BookmarkCheck, Eye, CheckCircle2, WifiOff, SearchX, Type, Contrast, Volume2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Icon mapping to handle dynamic icons from Firestore
const iconMap: { [key: string]: React.ReactNode } = {
  'Landmark': <Landmark size={24} className="text-[#009664]" strokeWidth={2} />,
  'Map': <Map size={24} className="text-purple-600" strokeWidth={2} />,
  'Sprout': <Sprout size={24} className="text-emerald-600" strokeWidth={2} />,
  'Users': <Users size={24} className="text-blue-500" strokeWidth={2} />,
  'BookOpen': <BookOpen size={24} className="text-orange-500" strokeWidth={2} />,
  'ShieldCheck': <ShieldCheck size={24} className="text-rose-500" strokeWidth={2} />,
  'FileText': <FileText size={24} className="text-teal-500" strokeWidth={2} />,
  'Lightbulb': <Lightbulb size={24} className="text-amber-500" strokeWidth={2} />,
};

interface Category {
  id: string;
  title: string;
  count: string;
  iconName: string;
  bg: string;
  path: string;
}

interface PopularResource {
  id: string;
  title: string;
  dept: string;
  type: string;
  size: string;
  color: string;
  downloads?: string;
  updated?: string;
  badge?: string;
}

const ResourcesHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularResources, setPopularResources] = useState<PopularResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quickActionDoc, setQuickActionDoc] = useState<any | null>(null);
  const longPressTimeoutRef = React.useRef<any>(null);
  const isDraggingRef = React.useRef<boolean>(false);
  
  // Performance: Network Offline Detection
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে!", { id: "net-status" });
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("ইন্টারনেট সংযোগ বিচ্ছিন। অফলাইন মোডে আছেন।", { id: "net-status" });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Accessibility States
  const [isLargeFont, setIsLargeFont] = useState(() => {
    return localStorage.getItem("a11y_large_font") === "true";
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem("a11y_high_contrast") === "true";
  });

  const [srAnnouncement, setSrAnnouncement] = useState("");

  const toggleLargeFont = () => {
    setIsLargeFont(prev => {
      const next = !prev;
      localStorage.setItem("a11y_large_font", String(next));
      const msg = next ? "বড় ফন্ট মোড সক্রিয় করা হয়েছে" : "সাধারণ ফন্ট মোড সক্রিয় করা হয়েছে";
      toast.info(msg);
      setSrAnnouncement(msg);
      return next;
    });
  };

  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const next = !prev;
      localStorage.setItem("a11y_high_contrast", String(next));
      const msg = next ? "উচ্চ কনট্রাস্ট মোড সক্রিয় করা হয়েছে" : "সাধারণ কনট্রাস্ট মোড সক্রিয় করা হয়েছে";
      toast.info(msg);
      setSrAnnouncement(msg);
      return next;
    });
  };
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return !!params.get('search');
    } catch {
      return false;
    }
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    } catch {
      return '';
    }
  });
  
  // Usability View Mode Tab: 'all' | 'favorites' | 'recent'
  const [viewTab, setViewTab] = useState<'all' | 'favorites' | 'recent'>('all');

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("recently_viewed_hub");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToRecentlyViewed = (item: {
    id?: string;
    title: string;
    dept?: string;
    type?: string;
    bg?: string;
    size?: string;
    path?: string;
    phone?: string;
    categoryName?: string;
    updated?: string;
    views?: string;
    badge?: string;
    isVerified?: boolean;
  }) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.title !== item.title);
      const newItem = {
        id: item.id || `rv-${Date.now()}`,
        ...item,
        timestamp: Date.now()
      };
      const updated = [newItem, ...filtered].slice(0, 12);
      localStorage.setItem("recently_viewed_hub", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem("recently_viewed_hub");
    toast.success("সাম্প্রতিক দেখা ইতিহাস মুছে ফেলা হয়েছে!");
  };

  // Custom Emergency States
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyServiceItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("emergency_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleFavorite = (id: string, name?: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("emergency_favorites", JSON.stringify(updated));
      toast.success(isFav ? `"${name || 'জরুরি নম্বর'}" প্রিয় তালিকা থেকে সরানো হয়েছে!` : `"${name || 'জরুরি নম্বর'}" প্রিয় তালিকায় যোগ করা হয়েছে!`);
      return updated;
    });
  };

  const handleCopy = async (phone: string, id: string) => {
    await copyToClipboard(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Custom Popular Resource States & Helpers
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

  const openResourceModal = (item: any) => {
    const details = getResourceDetails(item.title);
    const fullItem = { ...item, ...details };
    addToRecentlyViewed({
      id: fullItem.id || "res-" + Date.now(),
      title: fullItem.title,
      dept: fullItem.dept,
      type: fullItem.type,
      bg: fullItem.color || fullItem.bg,
      size: fullItem.size,
      updated: fullItem.updated,
      views: fullItem.views,
      badge: fullItem.badge,
      isVerified: fullItem.isVerified
    });
    setSelectedResource(fullItem);
  };

  const openEmergencyModal = (item: EmergencyServiceItem) => {
    addToRecentlyViewed({
      id: item.id,
      title: item.name,
      dept: item.subtitle,
      type: "জরুরি সেবা",
      phone: item.phone,
      bg: "bg-red-50"
    });
    setSelectedEmergency(item);
  };

  // Favorites state for documents
  const [favDocs, setFavDocs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fav_downloads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavDoc = (title: string) => {
    setFavDocs(prev => {
      const updated = prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title];
      localStorage.setItem("fav_downloads", JSON.stringify(updated));
      toast.success(updated.includes(title) ? `"${title}" প্রিয় তালিকায় যুক্ত হয়েছে!` : `"${title}" প্রিয় তালিকা থেকে সরানো হয়েছে!`);
      return updated;
    });
  };

  const handleCopyLink = async (title: string) => {
    const link = `${window.location.origin}/downloads?search=${encodeURIComponent(title)}`;
    await copyToClipboard(link);
    toast.success("শেয়ারিং লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
  };

  const handleShareDoc = async (title: string) => {
    const link = window.location.origin + '/downloads?search=' + encodeURIComponent(title);
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'পুঠিয়া ডিজিটাল পোর্টাল - ডাউনলোড সেবা: ' + title,
          url: link
        });
      } catch (err) {
        handleCopyLink(title);
      }
    } else {
      handleCopyLink(title);
    }
  };

  const startLongPress = (item: any) => {
    isDraggingRef.current = false;
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    longPressTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setQuickActionDoc(item);
      }
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
  };

  const handleTouchMove = () => {
    isDraggingRef.current = true;
    cancelLongPress();
  };

  const getResourceDetails = (title: string) => {
    const defaults = {
      updated: "১৫ মে, ২০২৪",
      views: "৪,৫২০+",
      badge: "⭐ জনপ্রিয়",
      isVerified: true
    };

    if (title.includes("কৃষি")) {
      return {
        ...defaults,
        updated: "১২ মে, ২০২৪",
        views: "৩,৯২০+",
        badge: "⭐ জনপ্রিয়",
        description: "উপজেলার প্রান্তিক কৃষকদের জন্য সরকারি সার, বীজ ও কৃষি যন্ত্রপাতি সহায়তার আবেদন নির্দেশিকা।",
        fee: "বিনামূল্যে",
        submitTo: "উপজেলা কৃষি কর্মকর্তার কার্যালয়, পুঠিয়া",
        requirements: [
          "কৃষক কার্ডের কপি",
          "NID এর ফটোকপি",
          "জমি মালিকানা বা বর্গা চাষের প্রমাণপত্র"
        ],
        steps: [
          "আবেদন ফরম পূরণ করে উপ-সহকারী কৃষি কর্মকর্তার সুপারিশ নিন।",
          "উপজেলা কৃষি অফিসে আবেদনপত্র জমা দিন।"
        ]
      };
    } else if (title.includes("পরচা") || title.includes("খতিয়ান") || title.includes("ভূমি")) {
      return {
        ...defaults,
        updated: "০১ জুন, ২০২৪",
        views: "৯,৬০০+",
        badge: "⭐ জনপ্রিয়",
        description: "অনলাইনে বা সরাসরি আর.এস/সি.এস খতিয়ান বা জমির পরচা উত্তোলনের আবেদন ফরম ও প্রস্তুত নির্দেশিকা।",
        fee: "খতিয়ান সার্টিফাইড কপি ১০০ টাকা",
        submitTo: "উপজেলা ভূমি অফিস / ইউনিয়ন ভূমি অফিস, পুঠিয়া",
        requirements: [
          "খতিয়ান বা দাগ নম্বর ও মৌজার নাম",
          "জমি মালিকের নাম ও NID কপি",
          "আবেদনকারীর মোবাইল নম্বর"
        ],
        steps: [
          "আবেদন ফরমের সাথে জেলা/উপজেলা ভূমি অফিসের নির্ধারিত ফি পরিশোধ রসিদ যুক্ত করুন।",
          "ভূমি অফিসে ফরমটি দাখিল করে রসিদ সংগ্রহ করুন।"
        ]
      };
    } else if (title.includes("জন্ম নিবন্ধন")) {
      return {
        ...defaults,
        updated: "২০ জানুয়ারি, ২০২৪",
        views: "১৫,৮০০+",
        badge: "⭐ জনপ্রিয়",
        description: "নতুন ডিজিটাল জন্ম সনদ প্রাপ্তি অথবা অনলাইন নিবন্ধনে ভুল তথ্য সংশোধনের নির্দেশিকা ফরম।",
        fee: "বিনামূল্যে (৪৫ দিনের মধ্যে) / ৫০-১০০ টাকা (পরবর্তী)",
        submitTo: "সংশ্লিষ্ট ইউনিয়ন পরিষদ কার্যালয় অথবা পৌরসভা কার্যালয়, পুঠিয়া",
        requirements: [
          "টিকাদান কার্ড বা ই পি আই কার্ডের ফটোকপি",
          "পিতা ও মাতার জাতীয় পরিচয়পত্র (NID) এবং ডিজিটাল জন্ম নিবন্ধন",
          "শিক্ষা প্রতিষ্ঠানের প্রধান কর্তৃক প্রত্যয়ন পত্র (বয়স প্রমাণে)"
        ],
        steps: [
          "অনলাইনে আবেদন সাবমিট করে প্রিন্ট কপি সংগ্রহ করুন।",
          "প্রয়োজনীয় সত্যতা প্রমাণের ডকুমেন্টস সহ ইউনিয়ন পরিষদে যোগাযোগ করুন।"
        ]
      };
    } else if (title.includes("NID") || title.includes("জাতীয় পরিচয়")) {
      return {
        ...defaults,
        updated: "১৫ ফেব্রুয়ারি, ২০২৪",
        views: "১০,৪০০+",
        badge: "🔥 নতুন",
        description: "জাতীয় পরিচয়পত্রের স্মার্ট কপি ডাউনলোড, নতুন ভোটার নিবন্ধন অথবা ভুল তথ্য সংশোধনের অফিশিয়াল গাইডলাইন ও ফরম।",
        fee: "অনলাইন কপি বিনামূল্যে, সংশোধন ফি ২৩০-৪৬০ টাকা",
        submitTo: "উপজেলা নির্বাচন কর্মকর্তার কার্যালয়, পুঠিয়া",
        requirements: [
          "অনলাইন আবেদনপত্রের কপি",
          "শিক্ষাগত যোগ্যতার সার্টিফিকেট বা জন্ম নিবন্ধন কপি",
          "বাবা/মায়ের NID কপির ফটোকপি",
          "ইউটিলিটি বিলের কপি (ঠিকানা প্রমাণে)"
        ],
        steps: [
          "ভোটার পোর্টালে সংশোধনের প্রয়োজনীয় ডকুমেন্ট আপলোড করুন।",
          "অনুমোদনের পর নতুন অনলাইন কপি ডাউনলোড করুন।"
        ]
      };
    } else if (title.includes("পাসপোর্ট")) {
      return {
        ...defaults,
        updated: "১০ মার্চ, ২০২৪",
        views: "৮,১ ১০০+",
        badge: "⭐ জনপ্রিয়",
        description: "নতুন ই-পাসপোর্ট (e-Passport) পাওয়ার জন্য আবেদন নির্দেশিকা ও সোনালী ব্যাংকে চালানের ফি হিসাব বিবরণী।",
        fee: "৫ বছর মেয়াদি ৫,৭৫০ টাকা এবং ১০ বছর মেয়াদি ৮,০৫০ টাকা",
        submitTo: "আঞ্চলিক পাসপোর্ট অফিস, রাজশাহী (পুঠিয়ার নাগরিকদের জন্য)",
        requirements: [
          "অনলাইন আবেদনের প্রিন্ট কপি ও পেমেন্ট স্লিপ",
          "স্মার্ট জাতীয় পরিচয়পত্র (NID) বা ডিজিটাল জন্ম সনদ",
          "অফিসিয়াল এনওএস বা জিও (সরকারি চাকুরিজীবীদের ক্ষেত্রে)"
        ],
        steps: [
          "অনলাইনে ফরম পূরণ ও ফি পরিশোধ সম্পন্ন করুন।",
          "পাসপোর্ট অফিসে বায়োমেট্রিক ও ছবি তোলার জন্য নির্ধারিত তারিখে উপস্থিত থাকুন।"
        ]
      };
    } else if (title.includes("ট্রেড লাইসেন্স")) {
      return {
        ...defaults,
        updated: "০৫ এপ্রিল, ২০২৪",
        views: "৭,২০০+",
        badge: "⭐ জনপ্রিয়",
        description: "উপজেলার পৌরসভা বা ইউনিয়ন এলাকাভুক্ত যেকোনো ব্যবসা পরিচালনার জন্য বার্ষিক ট্রেড লাইসেন্স প্রাপ্তির আবেদন ফরম।",
        fee: "ব্যবসার ধরন ও পরিধি অনুযায়ী ৩০০ টাকা থেকে ৫,০০০ টাকা",
        submitTo: "পৌরসভা কার্যালয় অথবা সংশ্লিষ্ট ইউনিয়ন পরিষদ সচিবের কক্ষ",
        requirements: [
          "আবেদনকারীর জাতীয় পরিচয়পত্র (NID) ও ছবি",
          "দোকান বা ব্যবসা স্থানের ভাড়ার চুক্তিপত্র অথবা দলিল",
          "হালনাগাদ হোল্ডিং ট্যাক্স পরিশোধের রশিদ"
        ],
        steps: [
          "ফরমটি পূরণ করে ট্যাক্স রশিদের কপিসহ জমা দিন।",
          "লাইসেন্স পরিদর্শক কর্তৃক পরিদর্শনের পর লাইসেন্স ফি প্রদান করে সংগ্রহ করুন।"
        ]
      };
    } else {
      return {
        ...defaults,
        description: "পুঠিয়া উপজেলার নাগরিকদের জন্য জরুরি সেবামূলক এবং দাপ্তরিক কাজের প্রয়োজনীয় আবেদন বা নির্দেশিকা পত্র।",
        fee: "বিনামূল্যে ডাউনলোডযোগ্য",
        submitTo: "সংশ্লিষ্ট উপজেলা কার্যালয়, পুঠিয়া, রাজশাহী",
        requirements: [
          "আবেদনকারীর জাতীয় পরিচয়পত্রের (NID) কপি",
          "২ কপি পাসপোর্ট সাইজের রঙিন ছবি",
          "নাগরিকত্ব বা চারিত্রিক সনদপত্র"
        ],
        steps: [
          "সংশ্লিষ্ট দপ্তরে যথাযথ কাগজপত্র সহ আবেদনটি দাখিল করুন।"
        ]
      };
    }
  };

  const getSolidColor = (colorClass: string) => {
    if (!colorClass) return 'bg-[#009664]';
    if (colorClass.startsWith('bg-') && colorClass.endsWith('-50')) {
      const base = colorClass.substring(3, colorClass.length - 3);
      if (base === 'emerald') return 'bg-[#009664]';
      return 'bg-' + base + '-500';
    }
    return colorClass;
  };

  const handleDownloadFile = (title: string, type: string) => {
    addToRecentlyViewed({
      title: title,
      dept: "উপজেলা প্রশাসন",
      type: type || "PDF",
      bg: "bg-emerald-50"
    });
    toast.loading('"' + title + '" ডাউনলোড শুরু হচ্ছে...', { id: "download-toast" });
    
    setTimeout(() => {
      try {
        const content = "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nপুঠিয়া উপজেলা প্রশাসন, রাজশাহী\n\nডকুমেন্ট: " + title + "\nফাইল টাইপ: " + type + "\n\nএটি একটি নমুনা বা অফিসিয়াল ফরম ফাইল। পুঠিয়া উপজেলার ডিজিটাল নাগরিক সেবা পোর্টাল থেকে সংগৃহীত।\n\nডাউনলোডের সময়: " + new Date().toLocaleString('bn-BD');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = title.replace(/\s+/g, '_') + '.' + type.toLowerCase();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('"' + title + '" সফলভাবে ডাউনলোড হয়েছে!', { id: "download-toast" });
      } catch (err) {
        toast.error("ডাউনলোড করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।", { id: "download-toast" });
      }
    }, 1200);
  };

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to Categories
    const categoriesQuery = query(collection(db, "resources_categories"), orderBy("order", "asc"));
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "resources_categories");
      setError("ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      setLoading(false);
    });

    // Subscribe to Popular Resources
    const resourcesQuery = query(collection(db, "popular_resources"), orderBy("createdAt", "desc"));
    const unsubResources = onSnapshot(resourcesQuery, (snapshot) => {
      const res = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PopularResource));
      setPopularResources(res);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "popular_resources");
    });

    return () => {
      unsubCategories();
      unsubResources();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem("scroll_resources_hub");
      if (savedScroll) {
        const timer = setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            behavior: "instant" as any
          });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [loading]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("scroll_resources_hub", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const stats = [
    { label: 'সকল রিসোর্স', value: '১২৬+', icon: <FileText size={24} className="text-[#009664]" />, bg: 'bg-emerald-50', path: '/resources' },
    { label: 'গুরুত্বপূর্ণ সেবা', value: '৫৮+', icon: <Bookmark size={24} className="text-purple-600" />, bg: 'bg-purple-50', path: '/services' },
    { label: 'ডাউনলোড', value: '৯৩+', icon: <Download size={24} className="text-orange-500" />, bg: 'bg-orange-50', path: '/downloads' },
    { label: 'সহায়ক লিংক', value: '৭৮+', icon: <ExternalLink size={24} className="text-blue-500" />, bg: 'bg-blue-50', path: '/contact' },
  ];

  // Search Results Filtering
  const filteredPopular = popularResources.filter(r => 
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.dept?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGovtWebsites = governmentWebsites.filter(g => 
    g.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredEmergency = emergencyServicesList.filter(e => 
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phone?.includes(searchQuery)
  );

  const totalResultsCount = filteredPopular.length + filteredCategories.length + filteredGovtWebsites.length + filteredEmergency.length;

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={(q) => {
          setSearchQuery(q);
          setIsSearchOpen(true);
        }} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : '/' + path);
        }} 
      />

      <main className={`flex-1 pb-24 ${isLargeFont ? 'text-[112%] [&_*]:text-base' : ''} ${isHighContrast ? 'contrast-125 bg-slate-900 text-white' : ''}`}>
        {/* Screen Reader Live Announcement */}
        <div className="sr-only" aria-live="polite" role="status">
          {srAnnouncement}
        </div>

        {/* Offline Notification Banner */}
        {isOffline && (
          <div role="status" aria-live="polite" className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold relative z-50 animate-in fade-in">
            <div className="flex items-center gap-2">
              <WifiOff size={16} />
              <span>আপনি অফলাইন মোডে আছেন। ব্রাউজারে সংরক্ষিত অফলাইন ডেটা ও প্রিয় তালিকার তথ্য পড়তে পারবেন।</span>
            </div>
            <button 
              type="button"
              onClick={() => window.location.reload()} 
              className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
            >
              রিফ্রেশ
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-[#006847] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between mb-6 h-12 relative z-30">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 w-full relative z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#006847]" />
                  <input 
                    type="text" 
                    autoFocus 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="রিসোর্স, ফরম, বা সেবা খুঁজুন..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-800 placeholder-slate-400 rounded-full text-sm font-bold shadow-md outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2.5 text-white text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors shrink-0"
                >
                  বন্ধ করুন
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (window.history.length > 2) {
                        navigate(-1);
                      } else {
                        navigate('/');
                      }
                    }}
                    className="p-3 -ml-3 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer relative z-50"
                    type="button"
                    aria-label="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
                  >
                    <ArrowLeft size={28} className="stroke-[2.5]" />
                  </button>
                  <h1 className="text-[20px] font-black text-white leading-tight">দরকারি রিসোর্স হাব</h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white bg-white/10 backdrop-blur-sm shadow-xs hover:bg-white/20 transition-all relative z-50 cursor-pointer active:scale-95"
                    type="button"
                    aria-label="রিসোর্স অনুসন্ধান করুন"
                    title="রিসোর্স অনুসন্ধান করুন"
                  >
                    <Search size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div 
            className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-inner overflow-hidden group cursor-pointer" 
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/20">
                  সরকারি সেবা, ভূমি, কৃষি ও জরুরি তথ্য
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white leading-tight">
                    দরকারি সব লিংক ও সেবা এক জায়গায়
                  </h2>
                  <p className="text-xs font-medium text-emerald-50/80 leading-relaxed">
                    গুরুত্বপূর্ণ ফরম, গাইডলাইন, অফিসের তালিকা ও সহায়ক লিংক খুঁজুন
                  </p>
                </div>
              </div>
              <div className="ml-4 opacity-40 group-hover:opacity-60 transition-opacity">
                <FolderSearch size={56} className="text-white -rotate-12" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-[32px] -mt-8 pt-7 pb-6 px-4 relative z-20 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
          <div className="space-y-6">

          {/* Search Results Display Section */}
          {searchQuery.trim() !== '' && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-[#009664]" />
                  <h2 className="text-sm font-black text-slate-800">
                    অনুসন্ধান ফলাফল ({totalResultsCount})
                  </h2>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs"
                >
                  ক্লিয়ার করুন
                </button>
              </div>

              {totalResultsCount === 0 ? (
                <div className="text-center py-6 bg-white rounded-xl border border-slate-200/60 p-4">
                  <AlertCircle size={32} className="mx-auto text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    "{searchQuery}" এর সাথে মিলে এমন কিছু পাওয়া যায়নি।
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    কৃষি, পরচা, বিদ্যুৎ, এনআইডি, সেবা, বা পাসপোর্টের মতো কীওয়ার্ড দিয়ে চেষ্টা করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Popular Resources Results */}
                  {filteredPopular.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-[#009664] uppercase tracking-wider">
                        ফরম ও ফাইল ({filteredPopular.length})
                      </p>
                      <div className="bg-white rounded-xl divide-y divide-slate-100 border border-slate-200/60 overflow-hidden shadow-xs">
                        {filteredPopular.map((res) => (
                          <div 
                            key={res.id}
                            onClick={() => openResourceModal(res)}
                            className="p-3 hover:bg-emerald-50/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={"w-8 h-8 rounded-lg " + (res.color || 'bg-[#009664]') + " flex items-center justify-center text-white shrink-0"}>
                                <FileText size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{res.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{res.dept} • {res.type}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(res.title, res.type || "PDF");
                              }}
                              className="p-2 rounded-lg bg-emerald-50 text-[#009664] hover:bg-emerald-100 text-xs font-bold shrink-0 flex items-center gap-1 border border-emerald-200"
                            >
                              <Download size={14} />
                              <span>ডাউনলোড</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories Results */}
                  {filteredCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-purple-600 uppercase tracking-wider">
                        ক্যাটাগরি ({filteredCategories.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => navigate(cat.path.startsWith('/') ? cat.path : '/' + cat.path)}
                            className="p-3 bg-white hover:bg-purple-50/50 rounded-xl border border-slate-200/60 hover:border-purple-200 transition-all cursor-pointer flex items-center gap-2.5"
                          >
                            <div className={"w-8 h-8 rounded-lg " + cat.bg + " flex items-center justify-center shrink-0"}>
                              {iconMap[cat.iconName] || <FileText size={16} className="text-slate-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{cat.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{cat.count}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Results */}
                  {filteredEmergency.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-red-600 uppercase tracking-wider">
                        জরুরি নম্বর ({filteredEmergency.length})
                      </p>
                      <div className="bg-white rounded-xl divide-y divide-slate-100 border border-slate-200/60 overflow-hidden shadow-xs">
                        {filteredEmergency.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => openEmergencyModal(item)}
                            className="p-3 hover:bg-red-50/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                <PhoneCall size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{item.subtitle} • {item.phone}</p>
                              </div>
                            </div>
                            <a
                              href={'tel:' + item.phone}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
                            >
                              <Phone size={12} />
                              <span>কল করুন</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Govt Websites Results */}
                  {filteredGovtWebsites.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider">
                        সরকারি ওয়েবসাইট
                      </p>
                      <div className="bg-white rounded-xl divide-y divide-slate-100 border border-slate-200/60 overflow-hidden shadow-xs">
                        {filteredGovtWebsites.flatMap(site => site.items).map((item, i) => (
                          <a
                            key={i}
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 hover:bg-blue-50/50 flex items-center justify-between gap-2 transition-colors block"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                {item.icon || <Globe size={16} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{item.subtitle || 'সরকারি পোর্টাল'}</p>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-blue-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Server or Data Error State (500/404 handling) */}
        {error && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center my-6 shadow-xs animate-in fade-in">
            <AlertTriangle size={40} className="text-rose-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-rose-900 mb-1">তথ্য লোড করতে সমস্যা হয়েছে (Server/Network Error)</h3>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> পুনরায় চেষ্টা করুন
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="px-4 py-2 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                হোম পেজে ফিরুন
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-[20px] p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 my-6">
          {stats.map((stat, idx) => (
            <React.Fragment key={idx}>
              <button 
                onClick={() => navigate(stat.path)}
                className="flex flex-col items-center gap-2 flex-1 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={"w-12 h-12 rounded-full " + stat.bg + " flex items-center justify-center shrink-0 shadow-xs"}>
                  {stat.icon}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500">{stat.label}</p>
                  <p className="text-[14px] font-black text-slate-800">{stat.value}</p>
                </div>
              </button>
              {idx < stats.length - 1 && <div className="w-[1px] h-12 bg-slate-100"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Usability Filter Tabs: All, Favorites, Recent */}
        <div className="flex items-center justify-between gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 my-5 shadow-xs">
          <button
            type="button"
            onClick={() => setViewTab('all')}
            className={"flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer " + (
              viewTab === 'all' 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <FileText size={15} className={viewTab === 'all' ? 'text-[#009664]' : ''} />
            <span>সকল হাব</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('favorites')}
            className={"flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer " + (
              viewTab === 'favorites' 
                ? 'bg-white text-rose-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Heart size={15} className={favDocs.length + favorites.length > 0 ? 'text-rose-500 fill-rose-500' : ''} />
            <span>প্রিয় ({favDocs.length + favorites.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('recent')}
            className={"flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer " + (
              viewTab === 'recent' 
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <History size={15} className={recentlyViewed.length > 0 ? 'text-emerald-600' : ''} />
            <span>সাম্প্রতিক ({recentlyViewed.length})</span>
          </button>
        </div>

        {/* Favorites View Tab Content */}
        {viewTab === 'favorites' && (
          <div className="space-y-4 my-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-rose-500 rounded-full"></div>
                <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                  <span>সংরক্ষিত ও প্রিয় বুকমার্ক</span>
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                মোট {favDocs.length + favorites.length} টি
              </span>
            </div>

            {favDocs.length === 0 && favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 space-y-3">
                <Heart size={40} className="mx-auto text-slate-300" />
                <div>
                  <h3 className="text-sm font-black text-slate-700">কোনো প্রিয় রিসোর্স পাওয়া যায়নি</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 max-w-xs mx-auto">
                    যেকোনো ফরম, ফাইল বা জরুরি হটলাইনের হার্ট (❤️) আইকন চাপলে তা এখানে পাওয়া যাবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewTab('all')}
                  className="px-4 py-2 bg-emerald-50 text-[#009664] rounded-full text-xs font-black border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  রিসোর্স হাব ব্রাউজ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Favorited Downloads */}
                {favDocs.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">প্রিয় ফরম ও ডকুমেন্ট ({favDocs.length})</h3>
                    <div className="space-y-2">
                      {favDocs.map((title, i) => (
                        <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-rose-200 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{title}</p>
                              <p className="text-[10px] text-slate-400 font-bold">পুঠিয়া ডিজিটাল রিসোর্স পোর্টাল</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(title, "PDF")}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#009664] text-xs font-bold transition-colors border border-emerald-200/60 cursor-pointer"
                              title="ডাউনলোড করুন"
                            >
                              <Download size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareDoc(title)}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors border border-blue-200/60 cursor-pointer"
                              title="শেয়ার করুন"
                            >
                              <Share2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFavDoc(title)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors border border-rose-200/60 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorited Emergency Hotlines */}
                {favorites.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">প্রিয় জরুরি সেবা ({favorites.length})</h3>
                    <div className="space-y-2">
                      {emergencyServicesList.filter(e => favorites.includes(e.id)).map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-red-200 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                              <PhoneCall size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{item.subtitle} • {item.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={'tel:' + item.phone}
                              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Phone size={13} />
                              <span>কল</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(item.id, item.name)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                              title="পছন্দ তালিকা থেকে সরান"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recently Viewed View Tab Content */}
        {viewTab === 'recent' && (
          <div className="space-y-4 my-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
                <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
                  <History size={18} className="text-emerald-600" />
                  <span>সাম্প্রতিক দেখা রিসোর্স</span>
                </h2>
              </div>
              {recentlyViewed.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentlyViewed}
                  className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>ইতিহাস মুছুন</span>
                </button>
              )}
            </div>

            {recentlyViewed.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 space-y-3">
                <History size={40} className="mx-auto text-slate-300" />
                <div>
                  <h3 className="text-sm font-black text-slate-700">সাম্প্রতিক কোনো দেখা রিসোর্স নেই</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1 max-w-xs mx-auto">
                    আপনি যেসব ফাইল বা সেবা ওপেন করবেন বা ডাউনলোড করবেন তা এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewTab('all')}
                  className="px-4 py-2 bg-emerald-50 text-[#009664] rounded-full text-xs font-black border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  রিসোর্স অনুসন্ধান করুন
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentlyViewed.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009664] flex items-center justify-center shrink-0 border border-emerald-100">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {item.dept || item.categoryName || 'নাগরিক সেবা'} • {new Date(item.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.phone) {
                            window.location.href = 'tel:' + item.phone;
                          } else {
                            handleDownloadFile(item.title, item.type || "PDF");
                          }
                        }}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#009664] text-xs font-bold transition-colors border border-emerald-200/60 flex items-center gap-1 cursor-pointer"
                      >
                        {item.phone ? <Phone size={13} /> : <Download size={13} />}
                        <span>{item.phone ? 'কল' : 'ডাউনলোড'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareDoc(item.title)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors border border-blue-200/60 cursor-pointer"
                        title="শেয়ার করুন"
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.title)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
                        title="লিংক কপি"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Hub View Content */}
        {viewTab === 'all' && (
          <>
            {/* Quick Recently Viewed Banner if exists */}
            {recentlyViewed.length > 0 && (
              <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#009664]">
                    <History size={14} />
                    <span>সম্প্রতি দেখা রিসোর্স ({recentlyViewed.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewTab('recent')}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    সব দেখুন
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {recentlyViewed.slice(0, 5).map((rv, rIdx) => (
                    <button
                      key={rIdx}
                      type="button"
                      onClick={() => {
                        const details = getResourceDetails(rv.title);
                        setSelectedResource({ ...rv, ...details });
                      }}
                      className="bg-white rounded-xl p-2.5 border border-slate-200/80 hover:border-emerald-300 text-left shrink-0 min-w-[140px] max-w-[180px] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <p className="text-[11px] font-black text-slate-800 truncate">{rv.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5">{rv.dept || 'নাগরিক সেবা'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

        {/* Quick Actions */}
        <div className="my-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-[#009664] rounded-full"></div>
            <h2 className="text-[16px] font-black text-slate-800">কুইক একশন</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "NID", icon: <User size={24} className="text-blue-500" />, path: "/services/nid", bg: "bg-blue-50" },
              { name: "জন্ম নিবন্ধন", icon: <FileText size={24} className="text-teal-500" />, path: "/services/birth-reg", bg: "bg-teal-50" },
              { name: "পাসপোর্ট", icon: <Plane size={24} className="text-indigo-500" />, path: "/services/passport", bg: "bg-indigo-50" },
              { name: "ড্রাইভিং লাইসেন্স", icon: <Car size={24} className="text-orange-500" />, path: "/services/driving-license", bg: "bg-orange-50" },
              { name: "ভূমি সেবা", icon: <Map size={24} className="text-amber-500" />, path: "/services/land", bg: "bg-amber-50" },
              { name: "আবেদন ফরম", icon: <FileText size={24} className="text-emerald-500" />, path: "/downloads/forms", bg: "bg-emerald-50" },
              { name: "কর ও ভ্যাট", icon: <Coins size={24} className="text-purple-500" />, path: "/finance/tax", bg: "bg-purple-50" },
              { name: "ব্যাংকিং সেবা", icon: <Landmark size={24} className="text-cyan-500" />, path: "/finance", bg: "bg-cyan-50" },
              { name: "জরুরি নম্বর", icon: <PhoneCall size={24} className="text-red-500" />, path: "tel:999", bg: "bg-red-50" },
              { name: "ডাউনলোড", icon: <Download size={24} className="text-purple-500" />, path: "/downloads", bg: "bg-purple-50" },
            ].map((action, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (action.path.startsWith('tel')) {
                    window.location.href = action.path;
                  } else {
                    navigate(action.path);
                  }
                }}
                className="h-[105px] bg-white rounded-[16px] p-3 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className={"w-12 h-12 rounded-full " + action.bg + " flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shrink-0"}>
                  {action.icon}
                </div>
                <h3 className="text-[11px] font-black text-slate-700 leading-tight group-hover:text-emerald-700 transition-colors">{action.name}</h3>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Government Websites Section */}
        <div className="my-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-[#009664] rounded-full"></div>
            <h2 className="text-[16px] font-black text-slate-800">সরকারি ওয়েবসাইট </h2>
          </div>
          {governmentWebsites.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + section.color + " shrink-0"}>
                  {section.icon}
                </div>
                <h2 className="text-[16px] font-black text-slate-800">{section.title}</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.items.map((item, itemIdx) => (
                  <motion.button 
                    key={itemIdx}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => window.open(item.path, '_blank', 'noopener,noreferrer')}
                    className="h-[56px] flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors shrink-0 shadow-xs border border-slate-100">
                      {item.icon}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 group-hover:text-emerald-700 leading-tight truncate">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Services (জরুরি সেবা হটলাইন) */}
        <div className="my-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-red-600 rounded-full animate-pulse"></div>
              <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-1.5">
                <PhoneCall size={24} className="text-red-600" /> জরুরি সেবা হটলাইন
              </h2>
            </div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_1px_3px_rgba(239,68,68,0.02)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span> ২৪/৭ সক্রিয়
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {emergencyServicesList.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative p-3.5 bg-red-50/30 rounded-[20px] border border-red-100/50 hover:border-red-200 hover:bg-red-50/70 transition-all text-left shadow-[0_2px_8px_rgba(220,38,38,0.01)] hover:shadow-md cursor-pointer group flex flex-col justify-between h-[135px]"
                  onClick={() => openEmergencyModal(item)}
                >
                  {/* Badge & Favorite indicator */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-full tracking-wider">
                        {item.badge}
                      </span>
                    )}
                    {isFav && (
                      <Heart size={12} className="text-red-500 fill-red-500" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={"w-10 h-10 rounded-xl " + item.textColor + " bg-white flex items-center justify-center shadow-[0_2px_6px_rgba(220,38,38,0.04)] border border-red-100/30 group-hover:scale-110 transition-transform shrink-0"}>
                    {item.icon}
                  </div>

                  {/* Info */}
                  <div className="mt-1 min-w-0">
                    <h3 className="text-[12px] font-black text-slate-800 group-hover:text-red-800 leading-snug truncate">
                      {item.name}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Action Row - Phone number with One-tap Quick Call button */}
                  <div className="flex items-center justify-between border-t border-red-100/30 pt-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono font-black text-slate-700">
                      {item.phone}
                    </span>
                    <button
                      onClick={() => window.location.href = 'tel:' + item.phone}
                      className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs hover:bg-red-700 hover:scale-110 transition-all shrink-0 cursor-pointer"
                      title="সরাসরি কল করুন"
                    >
                      <PhoneCall size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Grouped Resource Sections */}
        <div className="my-6 space-y-4">
          {resourceSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 mb-4">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + section.color + " shrink-0"}>
                  {section.icon}
                </div>
                <h2 className="text-[16px] font-black text-slate-800">{section.title}</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {section.items.map((item, itemIdx) => (
                  <motion.button 
                    key={itemIdx}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (item.path.startsWith('http') || item.path.startsWith('tel')) {
                        window.location.href = item.path;
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className="h-[56px] flex items-center gap-2.5 p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors shrink-0 shadow-xs border border-slate-100">
                      {item.icon}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 group-hover:text-emerald-700 leading-tight truncate">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Popular Resources */}
        <div className="my-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#009664] rounded-full"></div>
              <h2 className="text-[16px] font-black text-slate-800">জনপ্রিয় রিসোর্স</h2>
            </div>
            <button 
              onClick={() => navigate('/downloads')}
              className="text-[11px] font-black text-[#009664] bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 border border-emerald-100/30 shadow-[0_1px_2px_rgba(0,150,100,0.02)] cursor-pointer"
            >
              সব দেখুন <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>

          <p className="text-[11px] font-bold text-slate-400 mb-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/30 flex items-center gap-1.5">
            <Zap size={12} className="text-amber-500 animate-bounce" />
            <span>দ্রুত অ্যাকশন (শেয়ার, কপি, প্রিয় তালিকা) পেতে যেকোনো কার্ডে ট্যাপ করে ধরে রাখুন!</span>
          </p>

          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={'sk-res-' + i} className="bg-white rounded-[16px] p-4 flex items-center gap-3 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] h-[100px]">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-full" />
                      <Skeleton className="h-3 w-1/2 rounded-full" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                ))
              ) : (
                popularResources.map((res) => {
                  const details = getResourceDetails(res.title);
                  const isFav = favDocs.includes(res.title);
                  const downloadsCount = res.downloads || "১,২৫০+";
                  const updatedDate = res.updated || details.updated || "২০ মার্চ, ২০২৪";
                  const viewsCount = details.views || "৪,৫২০+";
                  const badgeText = res.badge || details.badge || "⭐ জনপ্রিয়";

                  return (
                    <motion.div 
                      key={res.id} 
                      whileHover={{ y: -2 }}
                      onTouchStart={() => startLongPress({ ...res, ...details })}
                      onTouchEnd={cancelLongPress}
                      onTouchMove={handleTouchMove}
                      onMouseDown={() => startLongPress({ ...res, ...details })}
                      onMouseUp={cancelLongPress}
                      onMouseLeave={cancelLongPress}
                      onClick={() => openResourceModal(res)}
                      className="w-full bg-white rounded-[18px] p-4 flex flex-col gap-3 shadow-[0_1.5px_4px_rgba(15,23,42,0.012)] border border-slate-100 hover:border-emerald-200 text-left transition-all hover:shadow-[0_4px_12px_rgba(0,150,100,0.04)] relative overflow-hidden group cursor-pointer"
                    >
                      {/* Top Badges & Actions Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={11} className="text-[#009664]" />
                            <span>ভেরিফায়েড</span>
                          </span>
                          <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                            {badgeText}
                          </span>
                        </div>

                        {/* Direct Action Icons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleFavDoc(res.title)}
                            className="p-1.5 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors border border-slate-100"
                            title="পছন্দের তালিকায় যোগ করুন"
                          >
                            <Heart size={14} className={isFav ? "text-rose-500 fill-rose-500" : ""} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareDoc(res.title)}
                            className="p-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100"
                            title="শেয়ার করুন"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(res.title)}
                            className="p-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"
                            title="লিংক কপি করুন"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={"w-11 h-11 rounded-xl " + (res.color || 'bg-[#009664]') + " flex flex-col items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs"}>
                            <FileText size={22} strokeWidth={2} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[14px] font-black text-slate-800 truncate mb-0.5 group-hover:text-emerald-700 transition-colors">{res.title}</h3>
                            <p className="text-[11px] font-bold text-slate-500 truncate">{res.dept}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 text-[#009664] text-[10px] font-black rounded border border-emerald-100/60">{res.type}</span>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{res.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(res.title, res.type || "PDF");
                            }}
                            className="w-9 h-9 rounded-full bg-emerald-50 text-[#009664] hover:bg-emerald-100 flex items-center justify-center transition-colors border border-emerald-200 shrink-0"
                            title="ডাউনলোড করুন"
                          >
                            <Download size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* Download count, View count & Updated date row */}
                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2.5 mt-0.5 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar size={12} className="text-emerald-600" />
                            <span>আপডেট: {updatedDate}</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Eye size={12} className="text-blue-500" />
                            <span>ভিউ: {viewsCount}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-black text-emerald-600 bg-emerald-50/90 border border-emerald-100/50 px-2 py-0.5 rounded">
                          <Download size={11} /> 
                          <span>{downloadsCount}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Popular Downloads Center Section */}
        <div className="my-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#009664] rounded-full"></div>
              <h2 className="text-[16px] font-black text-slate-800 flex items-center gap-1.5">
                <FolderSearch size={24} className="text-emerald-600" /> জনপ্রিয় ডাউনলোড
              </h2>
            </div>
            <button 
              onClick={() => navigate('/downloads')}
              className="text-[11px] font-black text-[#009664] bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 border border-emerald-100/30 shadow-[0_1px_2px_rgba(0,150,100,0.02)] cursor-pointer"
            >
              সব দেখুন <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: "জন্ম নিবন্ধন ফরম", type: "PDF", size: "১.২ MB", updated: "২০ জানুয়ারি, ২০২৪", downloads: "১২.৪K+", icon: <FileText size={24} className="text-red-500" />, bg: "bg-red-50" },
              { title: "NID সংশোধন ফরম", type: "PDF", size: "২.১ MB", updated: "১৫ ফেব্রুয়ারি, ২০২৪", downloads: "৮.৯K+", icon: <FileCheck size={24} className="text-blue-500" />, bg: "bg-blue-50" },
              { title: "পাসপোর্ট আবেদন", type: "PDF", size: "৩.৪ MB", updated: "১০ মার্চ, ২০২৪", downloads: "১৫.২K+", icon: <Plane size={24} className="text-indigo-500" />, bg: "bg-indigo-50" },
              { title: "ট্রেড লাইসেন্স ফরম", type: "DOCX", size: "১.৫ MB", updated: "০৫ এপ্রিল, ২০২৪", downloads: "৫.১K+", icon: <Briefcase size={24} className="text-orange-500" />, bg: "bg-orange-50" },
              { title: "ই-টিন গাইড", type: "PDF", size: "৪.২ MB", updated: "১২ মে, ২০২৪", downloads: "৩.৮K+", icon: <BookOpen size={24} className="text-purple-500" />, bg: "bg-purple-50" },
              { title: "ভূমি আবেদন ফরম", type: "PDF", size: "২.৮ MB", updated: "০১ জুন, ২০২৪", downloads: "৯.৬K+", icon: <Map size={24} className="text-emerald-500" />, bg: "bg-emerald-50" }
            ].map((item, idx) => {
              const isFav = favDocs.includes(item.title);
              return (
                <motion.button 
                  key={idx} 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onTouchStart={() => startLongPress({
                    title: item.title,
                    dept: "উপজেলা প্রশাসন",
                    type: item.type,
                    size: item.size,
                    color: item.bg,
                    ...getResourceDetails(item.title)
                  })}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={handleTouchMove}
                  onMouseDown={() => startLongPress({
                    title: item.title,
                    dept: "উপজেলা প্রশাসন",
                    type: item.type,
                    size: item.size,
                    color: item.bg,
                    ...getResourceDetails(item.title)
                  })}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onClick={() => openResourceModal({ title: item.title, dept: "উপজেলা প্রশাসন", type: item.type, size: item.size, color: item.bg, downloads: item.downloads, updated: item.updated })}
                  className="w-full bg-white rounded-[16px] p-4 flex flex-col gap-3 shadow-[0_1.5px_4px_rgba(15,23,42,0.012)] border border-slate-100 hover:border-emerald-200 text-left group transition-all hover:shadow-[0_4px_12px_rgba(0,150,100,0.04)] relative overflow-hidden cursor-pointer"
                >
                  {isFav && (
                    <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-r-[24px] border-t-rose-500 border-r-rose-500" />
                      <Heart size={8} className="text-white fill-white absolute top-1 right-1 z-10" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={"w-12 h-12 rounded-xl " + item.bg + " flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-black text-slate-800 truncate leading-tight mb-1 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><FileText size={10} /> {item.type}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1"><Archive size={10} /> {item.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors border border-slate-100 group-hover:border-emerald-200">
                      <Download size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100/80 pt-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Calendar size={12} /> সর্বশেষ আপডেট: {item.updated}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50/90 border border-emerald-100/50 px-2 py-0.5 rounded">
                      <Download size={12} /> {item.downloads} বার
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer Support Banner */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[#f0fcf7] rounded-[20px] p-5 flex items-center gap-4 relative overflow-hidden my-6 border border-emerald-100/60 shadow-xs hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate('/contact')}
        >
          <div className="flex-1 relative z-10">
            <h2 className="text-[14px] font-black text-[#01412F]">কোন রিসোর্স খুঁজে পাচ্ছেন না?</h2>
            <p className="text-[11px] font-bold text-slate-500 mt-1 mb-3">আমাদের সাপোর্ট টিম আপনাকে সাহায্য করবে</p>
            <button 
              type="button"
              className="px-3.5 py-1.5 bg-white border border-[#009664] text-[#009664] rounded-full text-[11px] font-black flex items-center gap-1 shadow-xs hover:bg-emerald-50 w-fit transition-all active:scale-95 cursor-pointer"
            >
              যোগাযোগ করুন <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="relative z-10 w-16 h-16 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#009664] opacity-10 rounded-full blur-md"></div>
            <Headset size={48} className="text-[#009664]" strokeWidth={1.5} />
          </div>
        </motion.div>
          </>
        )}

        </div>
      </div>
    </main>

    {/* Emergency Detail Bottom Sheet / Modal */}
    <AnimatePresence>
      {selectedEmergency && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEmergency(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          />

          {/* Sheet / Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed bottom-0 sm:bottom-auto left-0 right-0 sm:max-w-md w-full mx-auto bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col"
          >
            {/* Drag handle for mobile feel */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-50 flex items-start justify-between relative">
              <div className="flex items-center gap-3.5">
                <div className={"w-12 h-12 rounded-2xl " + selectedEmergency.textColor + " bg-red-50 flex items-center justify-center shrink-0"}>
                  {selectedEmergency.icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 leading-snug flex items-center gap-2">
                    {selectedEmergency.name}
                    {selectedEmergency.badge && (
                      <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full tracking-wide">
                        {selectedEmergency.badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {selectedEmergency.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => {
                    const link = window.location.origin + '/resources?search=' + encodeURIComponent(selectedEmergency.name);
                    if (navigator.share) {
                      navigator.share({
                        title: selectedEmergency.name,
                        text: 'পুঠিয়া জরুরি সেবা: ' + selectedEmergency.name + ' - ' + selectedEmergency.phone,
                        url: link
                      }).catch(() => handleCopy(selectedEmergency.phone, selectedEmergency.id));
                    } else {
                      handleCopy(selectedEmergency.phone, selectedEmergency.id);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                  title="শেয়ার করুন"
                >
                  <Share2 size={16} />
                </button>
                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedEmergency.id, selectedEmergency.name)}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                  title="পছন্দের তালিকায় যোগ করুন"
                >
                  <Heart 
                    size={16} 
                    className={favorites.includes(selectedEmergency.id) ? "text-red-500 fill-red-500 scale-110" : "scale-100"} 
                  />
                </button>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedEmergency(null)}
                  className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Phone Card */}
              <div className="bg-red-50/30 rounded-2xl p-4 border border-red-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-red-600 uppercase tracking-wider block">জরুরি ফোন নম্বর</span>
                    <span className="text-[20px] font-mono font-black text-slate-800 block mt-1 tracking-tight">
                      {selectedEmergency.phone}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(selectedEmergency.phone, selectedEmergency.id)}
                      className="px-3 py-1.5 bg-white border border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl text-[11px] font-black flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      {copiedId === selectedEmergency.id ? (
                        <>
                          <Check size={12} className="text-emerald-600 animate-bounce" />
                          <span className="text-emerald-600">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>কপি করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Items List */}
              <div className="space-y-3 pt-1">
                
                {/* Address */}
                {selectedEmergency.address && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-500">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-400">ঠিকানা</h4>
                      <p className="text-[13px] font-bold text-slate-700 leading-snug mt-0.5">
                        {selectedEmergency.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Opening Hours */}
                {selectedEmergency.hours && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-500">
                      <Clock size={14} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-400">খোলার সময়</h4>
                      <p className="text-[13px] font-bold text-slate-700 leading-snug mt-0.5">
                        {selectedEmergency.hours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Official Website */}
                {selectedEmergency.website && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-500">
                      <Globe size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-black text-slate-400">অফিসিয়াল ওয়েবসাইট</h4>
                      <a 
                        href={selectedEmergency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-black text-[#009664] hover:underline flex items-center gap-1 mt-0.5 group/link truncate"
                      >
                        {selectedEmergency.website}
                        <ExternalLink size={12} className="inline group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              {/* Google Maps Directions */}
              {selectedEmergency.mapsUrl ? (
                <button
                  onClick={() => window.open(selectedEmergency.mapsUrl, '_blank')}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[13px] font-black flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-100 transition-colors"
                >
                  <Compass size={16} className="text-slate-500" />
                  <span>দিকনির্দেশনা (Map)</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 bg-white border border-slate-100 text-slate-300 rounded-2xl text-[13px] font-black flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
                >
                  <Compass size={16} />
                  <span>ম্যাপ উপলব্ধ নয়</span>
                </button>
              )}

              {/* Call Now Button */}
              <button
                onClick={() => window.location.href = 'tel:' + selectedEmergency.phone}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[13px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-100 hover:shadow-lg hover:shadow-red-200 transition-all"
              >
                <PhoneCall size={16} />
                <span>কল করুন</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Resource Detail Bottom Sheet / Modal */}
    <AnimatePresence>
      {selectedResource && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResource(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          />

          {/* Sheet / Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed bottom-0 sm:bottom-auto left-0 right-0 sm:max-w-lg w-full mx-auto bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
          >
            {/* Drag handle for mobile feel */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-50 flex items-start justify-between relative">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={"w-12 h-12 rounded-2xl " + getSolidColor(selectedResource.color) + " text-white flex flex-col items-center justify-center shrink-0 shadow-md"}>
                  <FileText size={20} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase mt-0.5">{selectedResource.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-black text-slate-800 leading-snug flex items-center gap-1.5 flex-wrap">
                    <span>{selectedResource.title}</span>
                    {selectedResource.isVerified !== false && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full" title="সরকারি তথ্যভাণ্ডার দ্বারা সত্যায়িত">
                        <CheckCircle2 size={12} className="text-[#009664]" />
                        <span>ভেরিফায়েড</span>
                      </span>
                    )}
                    {selectedResource.badge && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                        {selectedResource.badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">
                    {selectedResource.dept}
                  </p>                  
                  
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={12} className="text-emerald-600" />
                      <span>আপডেট: {selectedResource.updated || "১৫ মে, ২০২৪"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Eye size={12} className="text-blue-600" />
                      <span>ভিউ: {selectedResource.views || "৪,৫২০+"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => toggleFavDoc(selectedResource.title)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                  title="পছন্দের তালিকায় যোগ করুন"
                >
                  <Heart 
                    size={16} 
                    className={favDocs.includes(selectedResource.title) ? "text-rose-500 fill-rose-500 scale-110" : "scale-100"} 
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleShareDoc(selectedResource.title)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                  title="শেয়ার করুন"
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedResource.title)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                  title="লিংক কপি করুন"
                >
                  <Copy size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border border-slate-100 cursor-pointer"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[50vh]">
              {/* Description */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80">
                <p className="text-[12px] font-bold text-slate-600 leading-relaxed">
                  {selectedResource.description}
                </p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/30">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-0.5">আবেদন ফি</span>
                  <span className="text-[12px] font-black text-[#01412F]">{selectedResource.fee}</span>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/30">
                  <span className="text-[10px] font-bold text-blue-600 block mb-0.5">ফাইল সাইজ</span>
                  <span className="text-[12px] font-black text-blue-950">{selectedResource.size} ({selectedResource.type})</span>
                </div>
              </div>

              {/* Requirements */}
              {selectedResource.requirements && selectedResource.requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#009664]" /> প্রয়োজনীয় কাগজপত্র
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-600 text-[11px] font-bold">
                    {selectedResource.requirements.map((req: string, rIdx: number) => (
                      <li key={rIdx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Steps */}
              {selectedResource.steps && selectedResource.steps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black text-slate-800 flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-blue-600" /> আবেদন প্রক্রিয়া
                  </h4>
                  <ol className="space-y-2 pl-1 text-slate-600 text-[11px] font-bold">
                    {selectedResource.steps.map((step: string, sIdx: number) => (
                      <li key={sIdx} className="flex gap-2 items-start">
                        <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{sIdx + 1}</span>
                        <span className="flex-1 leading-normal">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Submit To */}
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span><strong className="text-slate-700">দাখিলের স্থান:</strong> {selectedResource.submitTo}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-4 border-t border-slate-50 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => setSelectedResource(null)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-500 font-black text-[13px] rounded-xl border border-slate-200 transition-colors"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  handleDownloadFile(selectedResource.title, selectedResource.type);
                  setSelectedResource(null);
                }}
                className="flex-[2] py-3 bg-[#009664] hover:bg-[#007f54] text-white font-black text-[13px] rounded-xl transition-colors shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2"
              >
                <Download size={16} strokeWidth={2.5} /> ডাউনলোড করুন
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Quick Action Bottom Sheet */}
    <AnimatePresence>
      {quickActionDoc && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickActionDoc(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed bottom-0 sm:bottom-auto left-0 right-0 sm:max-w-md w-full mx-auto bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col p-6 space-y-4"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2 shrink-0 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#009664] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">দ্রুত অ্যাকশন</span>
                <h3 className="text-[15px] font-black text-slate-800 mt-1 leading-tight">{quickActionDoc.title}</h3>
              </div>
              <button
                onClick={() => setQuickActionDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border border-slate-100"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Actions Grid / List */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {/* Toggle Favorite */}
              <button
                onClick={() => {
                  toggleFavDoc(quickActionDoc.title);
                  setQuickActionDoc(null);
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-slate-100 hover:border-rose-100 transition-all flex items-center justify-between text-left group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <Heart 
                    size={18} 
                    className={"transition-colors group-hover:text-rose-600 " + (favDocs.includes(quickActionDoc.title) ? 'text-rose-500 fill-rose-500' : 'text-slate-400')} 
                  />
                  <div>
                    <p className="text-[13px] font-black text-slate-800">
                      {favDocs.includes(quickActionDoc.title) ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় তালিকায় যোগ করুন'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">সহজে খুঁজে পাওয়ার জন্য সংরক্ষণ করুন</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-rose-400" />
              </button>

              {/* Copy Link */}
              <button
                onClick={() => {
                  handleCopyLink(quickActionDoc.title);
                  setQuickActionDoc(null);
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/70 rounded-2xl border border-slate-100 hover:border-blue-100/60 transition-all flex items-center justify-between text-left group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <Copy size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <div>
                    <p className="text-[13px] font-black text-slate-800">শেয়ারিং লিংক কপি করুন</p>
                    <p className="text-[10px] font-bold text-slate-400">সরাসরি কপি করে যেকোনো জায়গায় পাঠান</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  handleShareDoc(quickActionDoc.title);
                  setQuickActionDoc(null);
                }}
                className="w-full p-3.5 bg-slate-50 hover:bg-amber-50/70 rounded-2xl border border-slate-100 hover:border-amber-100/60 transition-all flex items-center justify-between text-left group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  <div>
                    <p className="text-[13px] font-black text-slate-800">বন্ধুদের সাথে শেয়ার করুন</p>
                    <p className="text-[10px] font-bold text-slate-400">সোশ্যাল মিডিয়া বা চ্যাট গ্রুপে শেয়ার করুন</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500" />
              </button>

              {/* Direct Download */}
              <button
                onClick={() => {
                  handleDownloadFile(quickActionDoc.title, quickActionDoc.type || "PDF");
                  setQuickActionDoc(null);
                }}
                className="w-full p-3.5 bg-[#009664]/5 hover:bg-[#009664]/10 rounded-2xl border border-[#009664]/10 hover:border-[#009664]/20 transition-all flex items-center justify-between text-left group active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-[#009664]" />
                  <div>
                    <p className="text-[13px] font-black text-slate-800">সরাসরি ডাউনলোড</p>
                    <p className="text-[10px] font-bold text-slate-400">এক ক্লিকে ফাইলটি ডিভাইসে সংরক্ষণ করুন</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#009664]/50 group-hover:text-[#009664]" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default ResourcesHubPage;

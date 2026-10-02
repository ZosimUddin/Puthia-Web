import React, { useState, useEffect } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ClipboardList, BookOpen, 
  Book, BadgeCheck, MoreHorizontal, DownloadCloud, FileDown,
  ChevronDown, ShieldCheck, ChevronRight, Lock, File, FileCode2, Archive,
  AlertCircle, RefreshCw, Download, X, MapPin, CheckSquare, Heart, Copy, ExternalLink, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import Skeleton from "../../components/home/Skeleton";
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { UnifiedHeroHeader, UnifiedBottomCTA } from '../../components/common/UnifiedDesignSystem';

// Icon mapping for categories
const iconMap: { [key: string]: React.ReactNode } = {
  'FileText': <FileText size={20} />,
  'ClipboardList': <ClipboardList size={20} />,
  'BookOpen': <BookOpen size={20} />,
  'Book': <Book size={20} />,
  'BadgeCheck': <BadgeCheck size={20} />,
  'MoreHorizontal': <MoreHorizontal size={20} />,
};

interface DownloadCategory {
  id: string;
  label: string;
  iconName: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  size: string;
  color: string;
  textColor: string;
  bgLight: string;
  updatedAt: any;
  downloadUrl: string;
}

const DownloadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Read query parameter for search if present to support shareable deep-links
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    } catch {
      return '';
    }
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('latest');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Details Modal States & Helper functions
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

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
    const link = `${window.location.origin}/downloads?search=${encodeURIComponent(title)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `পুঠিয়া ডিজিটাল পোর্টাল থেকে ডাউনলোড করুন: ${title}`,
          url: link
        });
      } catch (err) {
        handleCopyLink(title);
      }
    } else {
      handleCopyLink(title);
    }
  };

  // Long press event handlers for touch and mouse
  const [quickActionDoc, setQuickActionDoc] = useState<any | null>(null);
  const longPressTimeoutRef = React.useRef<any>(null);
  const isDraggingRef = React.useRef(false);

  const startLongPress = (item: any) => {
    isDraggingRef.current = false;
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    longPressTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setQuickActionDoc(item);
        if (navigator.vibrate) {
          try { navigator.vibrate(50); } catch (_) {}
        }
      }
    }, 650);
  };

  const cancelLongPress = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const handleTouchMove = () => {
    isDraggingRef.current = true;
    cancelLongPress();
  };

  // Scroll Retention
  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem("scroll_downloads_page");
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
      sessionStorage.setItem("scroll_downloads_page", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getResourceDetails = (title: string) => {
    if (title.includes("কৃষি")) {
      return {
        description: "উপজেলার প্রান্তিক কৃষকদের জন্য সরকারি সার, বীজ ও কৃষি যন্ত্রপাতি ক্রয়ে আর্থিক অনুদান বা ভর্তুকি প্রাপ্তির অফিশিয়াল আবেদন ফরম।",
        fee: "বিনামূল্যে (Free)",
        submitTo: "উপজেলা কৃষি সম্প্রসারণ কর্মকর্তার কার্যালয়, পুঠিয়া",
        requirements: [
          "কৃষক তথ্য কার্ডের ফটোকপি (প্রযোজ্য ক্ষেত্রে)",
          "জাতীয় পরিচয়পত্র (NID) এবং ব্যাংক অ্যাকাউন্ট নম্বর",
          "২ কপি পাসপোর্ট সাইজের ছবি",
          "জমি চাষ বা চাষাবাদের খতিয়ান/রশিদ"
        ],
        steps: [
          "ফরমটি সঠিকভাবে পূরণ করে প্রয়োজনীয় কাগজপত্র সংযুক্ত করুন।",
          "সংশ্লিষ্ট উপ-সহকারী কৃষি কর্মকর্তার স্বাক্ষর গ্রহণ করুন।",
          "উপজেলা কৃষি অফিসে ফরমটি জমা দিন।"
        ]
      };
    } else if (title.includes("পরচা") || title.includes("খতিয়ান") || title.includes("ভূমি")) {
      return {
        description: "অনলাইনে বা সরাসরি আর.এস/সি.এস খতিয়ান বা জমির পরচার সার্টিফাইড কপি বা রেকর্ড অব রাইটস উত্তোলনের আবেদন পত্র।",
        fee: "কোর্ট ফি ২০ টাকা ও ডেলিভারি ফি ৫০ টাকা",
        submitTo: "উপজেলা সহকারী কমিশনার (ভূমি) বা ই-সেবা কেন্দ্র, পুঠিয়া",
        requirements: [
          "জাতীয় পরিচয়পত্র (NID) কপি",
          "মৌজা, খতিয়ান নম্বর ও দাগ নম্বর সংক্রান্ত সঠিক বিবরণ",
          "হালনাগাদ ভূমি উন্নয়ন কর প্রদানের রশিদ"
        ],
        steps: [
          "আবেদনকারী কর্তৃক ফরমটি পূরণ পূর্বক কোর্ট ফি সংযুক্ত করতে হবে।",
          "উপজেলা ভূমি অফিসের সংশ্লিষ্ট শাখায় আবেদনটি জমা দিন বা ডাকযোগে গ্রহণের বিকল্প সিলেক্ট করুন।"
        ]
      };
    } else if (title.includes("বিদ্যুৎ")) {
      return {
        description: "নতুন আবাসিক, বাণিজ্যিক বা সেচ লাইনের বিদ্যুৎ সংযোগের জন্য আবেদন নির্দেশিকা ও প্রয়োজনীয় শর্তাবলীর বিস্তারিত বিবরণী।",
        fee: "সংযোগ ফি ও জামানত (ক্যাটাগরি অনুযায়ী ভিন্ন)",
        submitTo: "পুঠিয়া পল্লী বিদ্যুৎ জোনাল অফিস / অভিযোগ কেন্দ্র",
        requirements: [
          "জমি মালিকানার দলিল বা নামজারি কপি",
          "জাতীয় পরিচয়পত্র ও ১ কপি পাসপোর্ট সাইজ ছবি",
          "সার্টিফিকেট অব ওয়্যারিং (অনুমোদিত ইলেক্ট্রিশিয়ান কর্তৃক)",
          "নিকটতম খুঁটি থেকে দূরত্বের নকশা"
        ],
        steps: [
          "অনলাইনে বা জোনাল অফিসে আবেদন দাখিল করুন।",
          "কারিগরি সার্ভে সম্পন্ন হবার পর প্রাক্কলিত ফি জমা দিন।",
          "ওয়্যারিং পরিদর্শনের পর সংযোগ প্রদান করা হবে।"
        ]
      };
    } else if (title.includes("জন্ম নিবন্ধন")) {
      return {
        description: "নতুন জন্ম নিবন্ধন সনদ বা জন্ম তথ্য সংশোধনের জন্য ইউনিয়ন পরিষদ বা পৌরসভা কার্যালয়ে দাখিল করার নির্দেশিকা ও ফরম।",
        fee: "বয়স অনুযায়ী বিনামূল্যে থেকে ৫০ টাকা",
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
        description: "নতুন ই-পাসপোর্ট (e-Passport) পাওয়ার জন্য আবেদন নির্দেশিকা ও সোনালী ব্যাংকে চালানের ফি হিসাব বিবরণী।",
        fee: "৫ বছর মেয়াদি ৫,৭ ১৫০ টাকা এবং ১০ বছর মেয়াদি ৮,০৫০ টাকা",
        submitTo: "আঞ্চলিক পাসপোর্ট অফিস, রাজশাহী (পুঠিয়ার নাগরিকদের জন্য)",
        requirements: [
          "অনলাইন আবেদনের প্রিন্ট কপি ও পেমেন্ট স্লিপ",
          "স্মার্ট জাতীয় পরিচয়পত্র (NID) বা ডিজিটাল জন্ম সনদ",
          "অফিসিয়াল এনওএস বা জিও (সরকারি চাকুরিজীবীদের ক্ষেত্রে)"
        ],
        steps: [
          "অনলাইনে ফরম পূরণ ও ফি পরিশোধ সম্পন্ন করুন।",
          "পাসপোর্ট অফিসে বায়োমেট্রিক ও ছবি তোলার জন্য নির্ধারিত তারিখে উপস্থিত তারিখে উপস্থিত থাকুন।"
        ]
      };
    } else if (title.includes("ট্রেড লাইসেন্স")) {
      return {
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
        description: "পুঠিয়া উপজেলার নাগরিকদের জন্য জরুরি সেবামূলক এবং দাপ্তরিক কাজের প্রয়োজনীয় আবেদন বা নির্দেশিকা পত্র।",
        fee: "বিনামূল্যে / ডাউনলোডেবল ডকুমেন্ট",
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
      return `bg-${base}-500`;
    }
    return colorClass;
  };

  const handleDownloadFile = (title: string, type: string) => {
    toast.loading(`"${title}" ডাউনলোড শুরু হচ্ছে...`, { id: "download-toast" });
    
    setTimeout(() => {
      try {
        const content = `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nপুঠিয়া উপজেলা প্রশাসন, রাজশাহী\n\nডকুমেন্ট: ${title}\nফাইল টাইপ: ${type}\n\nএটি একটি নমুনা বা অফিসিয়াল ফরম ফাইল। পুঠিয়া উপজেলার ডিজিটাল নাগরিক সেবা পোর্টাল থেকে সংগৃহীত।\n\nডাউনলোডের সময়: ${new Date().toLocaleString('bn-BD')}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}.${type.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`"${title}" সফলভাবে ডাউনলোড হয়েছে!`, { id: "download-toast" });
      } catch (err) {
        toast.error("ডাউনলোড করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।", { id: "download-toast" });
      }
    }, 1200);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Fetch Categories
    const catQuery = query(collection(db, "download_categories"), orderBy("order", "asc"));
    const unsubCats = onSnapshot(catQuery, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DownloadCategory));
      // Prepend 'All' category if not present
      if (!cats.find(c => c.id === 'all')) {
        cats.unshift({ id: 'all', label: 'সব ডকুমেন্ট', iconName: 'FileText' });
      }
      setCategories(cats);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "download_categories");
      setError("ক্যাটেগরি লোড করতে সমস্যা হয়েছে।");
      setLoading(false);
    });

    return () => unsubCats();
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch Documents based on category and search
    let docsQuery = query(collection(db, "download_documents"), orderBy("updatedAt", "desc"));
    
    if (activeCategory !== 'all') {
      docsQuery = query(collection(db, "download_documents"), where("category", "==", activeCategory), orderBy("updatedAt", "desc"));
    }

    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "download_documents");
      setLoading(false);
    });

    return () => unsubDocs();
  }, [activeCategory]);

  const tabs = [
    { id: 'latest', label: 'সর্বশেষ আপডেট' },
    { 
      id: 'popular', 
      label: 'সর্বাধিক ডাউনলোড' 
    },
    { 
      id: 'trending', 
      label: 'জনপ্রিয় ডকুমেন্ট' 
    },
  ];

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText size={16} strokeWidth={2.5} className="text-white" />;
      case 'DOC': return <File size={16} strokeWidth={2.5} className="text-white" />;
      case 'XLS': return <FileCode2 size={16} strokeWidth={2.5} className="text-white" />;
      case 'ZIP': return <Archive size={16} strokeWidth={2.5} className="text-white" />;
      default: return <FileText size={16} strokeWidth={2.5} className="text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24 pt-0">
        <UnifiedHeroHeader
          title="ডাউনলোড সেন্টার"
          subtitle="প্রয়োজনীয় ফরম, নির্দেশিকা ও অন্যান্য গুরুত্বপূর্ণ ডকুমেন্ট এক জায়গায় সহজে ডাউনলোড করুন"
          rightAction={
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={showSearch ? searchQuery : undefined}
          onSearchChange={showSearch ? setSearchQuery : undefined}
          searchPlaceholder="ডকুমেন্ট খুঁজুন..."
        />

        <div className="px-4 space-y-4">

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-[13px] font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-white text-[#009664] border-[#009664] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document List */}
        <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={`sk-doc-${i}`} className="p-4 flex items-center gap-3 border-b border-slate-100 last:border-0">
                  <Skeleton className="w-10 h-10 rounded-[10px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="w-12 h-6 rounded-md" />
                </div>
              ))
            ) : documents.length === 0 ? (
              <div className="p-10 text-center">
                <FileText size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-slate-500">কোন ডকুমেন্ট পাওয়া যায়নি</p>
              </div>
            ) : (
              documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((doc, idx) => {
                const isFav = favDocs.includes(doc.title);
                return (
                  <motion.button 
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.97 }}
                    onTouchStart={() => startLongPress({
                      title: doc.title,
                      dept: "উপজেলা প্রশাসন",
                      type: doc.type,
                      size: doc.size,
                      color: doc.color,
                      ...getResourceDetails(doc.title)
                    })}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={handleTouchMove}
                    onMouseDown={() => startLongPress({
                      title: doc.title,
                      dept: "উপজেলা প্রশাসন",
                      type: doc.type,
                      size: doc.size,
                      color: doc.color,
                      ...getResourceDetails(doc.title)
                    })}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onClick={() => setSelectedResource({
                      title: doc.title,
                      dept: "উপজেলা প্রশাসন",
                      type: doc.type,
                      size: doc.size,
                      color: doc.color,
                      ...getResourceDetails(doc.title)
                    })}
                    className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-slate-50/60 relative ${idx < documents.length - 1 ? 'border-b border-slate-100/80' : ''}`}
                  >
                    {isFav && (
                      <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-rose-500 border-r-rose-500" />
                        <Heart size={7} className="text-white fill-white absolute top-0.5 right-0.5 z-10" />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-[10px] ${doc.color || 'bg-[#009664]'} flex flex-col items-center justify-center shrink-0`}>
                      {getFileIcon(doc.type)}
                      <span className="text-[8px] font-black text-white mt-0.5">{doc.type}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-black text-slate-800 truncate mb-1 pr-4">{doc.title}</h3>
                      <p className="text-[11px] font-bold text-slate-400">
                        আপডেট: {doc.updatedAt?.toDate ? new Intl.DateTimeFormat('bn-BD').format(doc.updatedAt.toDate()) : 'অজানা'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${doc.bgLight || 'bg-emerald-50'} ${doc.textColor || 'text-[#009664]'}`}>{doc.type}</span>
                        <p className="text-[11px] font-bold text-slate-500 w-[50px] text-right">{doc.size}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-[#009664] flex items-center justify-center transition-colors border border-slate-100 hover:border-emerald-200">
                        <FileDown size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
          {!loading && documents.length > 5 && (
            <button className="w-full p-3.5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#009664] hover:bg-slate-50 transition-colors border-t border-slate-100">
              আরও দেখুন <ChevronDown size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Support Banner */}
        <UnifiedBottomCTA
          icon={<ShieldCheck size={26} />}
          title="ডকুমেন্ট খুঁজে পাচ্ছেন না?"
          description="আমাদের সাথে যোগাযোগ করুন, আমরা আপনাকে সাহায্য করব।"
          buttonText="যোগাযোগ করুন"
          onButtonClick={() => navigate('/contact')}
          className="mt-6"
        />

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <Lock size={14} className="text-slate-400" strokeWidth={2.5} />
          <p className="text-[11px] font-bold text-slate-500">নিরাপদ ডাউনলোড <span className="mx-1">|</span> ১০০% অফিসিয়াল ডকুমেন্ট</p>
        </div>

        </div>
      </main>

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
                <div className={`w-12 h-12 rounded-2xl ${getSolidColor(selectedResource.color)} text-white flex flex-col items-center justify-center shrink-0 shadow-md`}>
                  <FileText size={20} strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase mt-0.5">{selectedResource.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-black text-slate-800 leading-snug truncate">
                    {selectedResource.title}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate">
                    {selectedResource.dept}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedResource(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border border-slate-100 ml-2"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
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
                    className={`transition-colors group-hover:text-rose-600 ${favDocs.includes(quickActionDoc.title) ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} 
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

export default DownloadsPage;

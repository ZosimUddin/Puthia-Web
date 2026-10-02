import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Search, 
  X, 
  ArrowLeft,
  Users, 
  Building2, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  HelpCircle, 
  MapPin, 
  Phone, 
  Tag, 
  ChevronRight,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export type SearchCategoryType = "all" | "people" | "organizations" | "services" | "posts";

export interface SearchResultItem {
  id: string;
  title: string;
  category: "people" | "organizations" | "services" | "posts";
  subtitle: string;
  details?: string;
  location?: string;
  phone?: string;
  path: string;
  badge?: string;
  tags?: string[];
  score?: number;
}

const POPULAR_SEARCHES = [
  "উপজেলা চেয়ারম্যান",
  "পুঠিয়া হাসপাতাল",
  "জরুরি রক্তদান",
  "বানেশ্বর বাজার দর",
  "ট্রেন সময়সূচী",
  "পৌরসভা মেয়র",
  "কৃষি কর্মকর্তা",
  "ফায়ার সার্ভিস"
];

const SEARCH_DATABASE: SearchResultItem[] = [
  // People
  {
    id: "p1",
    title: "ড. মো: আনিসুল ইসলাম",
    category: "people",
    subtitle: "উপজেলা চেয়ারম্যান, পুঠিয়া উপজেলা পরিষদ",
    details: "পাবলিক প্রতিনিধি ও উপজেলা নির্বাহী কার্যালয়",
    location: "পুঠিয়া সদর",
    phone: "01711-889900",
    path: "/administration",
    badge: "জনপ্রতিনিধি",
    tags: ["চেয়ারম্যান", "ইউপি", "প্রশাসন", "কর্মকর্তা"]
  },
  {
    id: "p2",
    title: "ডা. ফারহানা ইয়াসমিন",
    category: "people",
    subtitle: "মেডিকেল অফিসার (শিশু বিশেষজ্ঞ)",
    details: "উপজেলা স্বাস্থ্য কমপ্লেক্স, পুঠিয়া",
    location: "পুঠিয়া স্বাস্থ্য কমপ্লেক্স",
    phone: "01812-334455",
    path: "/doctors",
    badge: "ডাক্তার",
    tags: ["ডাক্তার", "মেডিকেল", "হাসপাতাল", "শিশু"]
  },
  {
    id: "p3",
    title: "মো: রফিকুল ইসলাম",
    category: "people",
    subtitle: "উপজেলা কৃষি কর্মকর্তা",
    details: "কৃষি সম্প্রসারণ অধিদপ্তর, পুঠিয়া",
    location: "উপজেলা চত্বর, পুঠিয়া",
    phone: "01715-667788",
    path: "/agriculture",
    badge: "কর্মকর্তা",
    tags: ["কৃষি", "অফিসার", "কৃষক", "পরামর্শ"]
  },
  {
    id: "p4",
    title: "তানভীর আহমেদ (O+ রক্তদাতা)",
    category: "people",
    subtitle: "স্বেচ্ছাসেবক রক্তদাতা ও সমাজকর্মী",
    details: "রক্তের গ্রুপ: O+ (পজিটিভ) | শেষ রক্তদান: ৩ মাস পূর্বে",
    location: "বানেশ্বর ইউনিয়ন",
    phone: "01911-223344",
    path: "/blood-donation",
    badge: "রক্তদাতা",
    tags: ["রক্ত", "রক্তদাতা", "blood", "জরুরি"]
  },

  // Organizations
  {
    id: "o1",
    title: "পুঠিয়া উপজেলা পরিষদ কার্যালয়",
    category: "organizations",
    subtitle: "উপজেলা প্রশাসনিক হেডকোয়ার্টার",
    details: "সকল সরকারি সেবা ও উন্নয়নমূলক কাজের সমন্বয় কেন্দ্র",
    location: "রাজশাহী-নাটোর মহাসড়ক, পুঠিয়া",
    phone: "01700-112233",
    path: "/administration",
    badge: "সরকারি দপ্তর",
    tags: ["উপজেলা", "পরিষদ", "ইউএনও", "সরকারি"]
  },
  {
    id: "o2",
    title: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স (৫০ শয্যা)",
    category: "organizations",
    subtitle: "সরকারি জেনারেল হাসপাতাল ও জরুরি চিকিৎসা",
    details: "২৪/৭ জরুরি বিভাগ, অ্যাম্বুলেন্স ও প্যাথলজি সেবা",
    location: "হাসপাতাল রোড, পুঠিয়া",
    phone: "01712-998877",
    path: "/hospitals",
    badge: "হাসপাতাল",
    tags: ["হাসপাতাল", "স্বাস্থ্য", "জরুরি", "চিকিৎসা"]
  },
  {
    id: "o3",
    title: "বানেশ্বর ইউনিয়ন পরিষদ কার্যালয়",
    category: "organizations",
    subtitle: "১নং বানেশ্বর ইউনিয়ন পরিষদ",
    details: "নাগরিক সনদ, জন্ম নিবন্ধীকরণ ও ডিজিটাল সেবা কেন্দ্র",
    location: "বানেশ্বর বাজার, পুঠিয়া",
    phone: "01722-334455",
    path: "/unions",
    badge: "ইউনিয়ন পরিষদ",
    tags: ["বানেশ্বর", "ইউনিয়ন", "পরিষদ", "সনদ"]
  },
  {
    id: "o4",
    title: "পুঠিয়া ফায়ার সার্ভিস ও সিভিল ডিফেন্স স্টেশন",
    category: "organizations",
    subtitle: "জরুরি অগ্নিনির্বাপণ ও উদ্ধারকারী দল",
    details: "২৪ ঘণ্টা ফায়ার ও এম্বুলেন্স কল রেসপন্স",
    location: "পুঠিয়া বাসস্ট্যান্ডের নিকটে",
    phone: "01713-001122",
    path: "/emergency",
    badge: "জরুরি সেবা",
    tags: ["ফায়ার", "আগুন", "জরুরি", "উদ্ধার"]
  },
  {
    id: "o5",
    title: "বানেশ্বর মিছরিপাড়া আম বাজার ব্যবসায়ী সমিতি",
    category: "organizations",
    subtitle: "উত্তরবঙ্গের বৃহত্তম পাইকারি আম বাজার",
    details: "আম কেনাবেচা, পরিবহন ও কুরিয়ার সাপোর্ট সেন্ট্রাল",
    location: "বানেশ্বর হাট, পুঠিয়া",
    phone: "01819-887766",
    path: "/marketplace",
    badge: "ব্যবসায়ী সমিতি",
    tags: ["বানেশ্বর", "আম", "বাজার", "ব্যবসায়ী"]
  },

  // Services
  {
    id: "s1",
    title: "অনলাইন ভূমি উন্নয়ন কর ও নামজারি আবেদন",
    category: "services",
    subtitle: "ভূমি মন্ত্রণালয় ও উপজেলা ভূমি অফিস ই-সেবা",
    details: "অনলাইনে খতিয়ান অনুসন্ধান, হোল্ডিং ট্যাক্স ও মিউটেশন আবেদন",
    location: "ডিজিটাল সেবা কেন্দ্র ও ইউনিয়ন পরিষদ",
    path: "/services",
    badge: "ই-গভর্ন্যান্স",
    tags: ["ভূমি", "খতিয়ান", "নামজারি", "ট্যাক্স", "জমি"]
  },
  {
    id: "s2",
    title: "২৪/৭ ফ্রি অ্যাম্বুলেন্স ও জরুরি রোগী পরিবহন",
    category: "services",
    subtitle: "উপজেলা রেড ক্রিসেন্ট ও পৌর অ্যাম্বুলেন্স সার্ভিস",
    details: "রাজশাহী মেডিকেল কলেজ ও পুঠিয়া স্বাস্থ্য কমপ্লেক্সে যাতায়াত",
    location: "সমগ্র পুঠিয়া উপজেলা",
    phone: "01711-009988",
    path: "/ambulance",
    badge: "জরুরি পরিবহন",
    tags: ["অ্যাম্বুলেন্স", "রোগী", "জরুরি", "হাসপাতাল"]
  },
  {
    id: "s3",
    title: "বানেশ্বর ও পুঠিয়া দৈনিক কাঁচাবাজারের দরদাম",
    category: "services",
    subtitle: "কৃষি বিপণন অধিদপ্তর ও স্থানীয় বাজার তথ্য",
    details: "চাল, ডাল, আলু, পেঁয়াজ, আম ও তরকারীর আপডেট পাইকারি ও খুচরা মূল্য",
    location: "বানেশ্বর হাট ও পুঠিয়া বাজার",
    path: "/market-price",
    badge: "বাজার দর",
    tags: ["বাজার", "দরদাম", "কাঁচাবাজার", "বানেশ্বর", "আম"]
  },
  {
    id: "s4",
    title: "রাজশাহী-ঢাকা আন্তঃনগর ট্রেন ও বাস সময়সূচী",
    category: "services",
    subtitle: "পুঠিয়া কাউন্টার ও নন্দনগাছী রেলওয়ে স্টেশন",
    details: "একতা, ধূমকেতু, বনলতা এক্সপ্রেক্স এবং হানিফ, শ্যামলী বাসের সময়সূচী",
    location: "নন্দনগাছী স্টেশন ও পুঠিয়া কাউন্টার",
    path: "/trains",
    badge: "পরিবহন",
    tags: ["ট্রেন", "বাস", "সময়সূচী", "কাউন্টার", "ভাড়া"]
  },

  // Posts & News
  {
    id: "n1",
    title: "পুঠিয়া রাজবাড়ি ও শিব মন্দির প্রাঙ্গণে ঐতিহাসিক বার্ষিক মেলা শুরু",
    category: "posts",
    subtitle: "সংস্কৃতি বিষয়ক মন্ত্রণালয় ও উপজেলা প্রশাসন",
    details: "ঐতিহাসিক পুঠিয়া রাজবাড়ি মাঠে ১৫ দিনব্যাপী লোকজ মেলার আয়োজন।",
    location: "পুঠিয়া রাজবাড়ি প্রাঙ্গণ",
    path: "/news",
    badge: "সংবাদ ও পোস্ট",
    tags: ["রাজবাড়ি", "মেলা", "শিব মন্দির", "সংবাদ", "ইভেন্ট"]
  },
  {
    id: "n2",
    title: "পুঠিয়া উপজেলায় মডেল মসজিদ ও ইসলামিক সাংস্কৃতিক কেন্দ্র উদ্বোধন",
    category: "posts",
    subtitle: "ইসলামিক ফাউন্ডেশন ও গণপূর্ত অধিদপ্তর",
    details: "আধুনিক অবকাঠামো বিশিষ্ট ৫ তলা মডেল মসজিদ প্রাঙ্গণে পাঠাগার ও গবেষণা কেন্দ্র সুবিধা।",
    location: "পুঠিয়া সদর",
    path: "/news",
    badge: "সংবাদ",
    tags: ["মসজিদ", "মডেল", "উদ্বোধন", "সংবাদ"]
  },
  {
    id: "n3",
    title: "বানেশ্বর হাটে নতুন মৌসুমের আম কেনাবেচা জমে উঠেছে",
    category: "posts",
    subtitle: "কৃষি ও বাণিজ্য প্রতিবেদন",
    details: "গোপালভোগ ও খীরসাপাত আমের বাম্পার ফলন ও সরবরাহ বাড়ায় ব্যবসায়ীদের উচ্ছ্বাস।",
    location: "বানেশ্বর হাট",
    path: "/news",
    badge: "কৃষি সংবাদ",
    tags: ["আম", "বানেশ্বর", "সংবাদ", "বাণিজ্য"]
  }
];

// Fuzzy Typo-Tolerant Match Helper
function computeFuzzyScore(text: string, query: string): number {
  const normText = text.toLowerCase();
  const normQuery = query.toLowerCase().trim();
  
  if (!normQuery) return 0;
  
  // Exact match
  if (normText === normQuery) return 100;
  // Contains full query
  if (normText.includes(normQuery)) return 80;
  
  // Token match
  const tokens = normQuery.split(/\s+/);
  let matchedTokens = 0;
  for (const token of tokens) {
    if (token.length > 1 && normText.includes(token)) {
      matchedTokens++;
    }
  }
  
  if (matchedTokens > 0) {
    return Math.round((matchedTokens / tokens.length) * 60);
  }

  // Character overlap fuzzy fallback for bangla typing typos
  let matchCount = 0;
  for (let i = 0; i < normQuery.length; i++) {
    if (normText.includes(normQuery[i])) matchCount++;
  }
  const ratio = matchCount / normQuery.length;
  return ratio > 0.65 ? Math.round(ratio * 30) : 0;
}

interface AdvancedGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedGlobalSearchModal: React.FC<AdvancedGlobalSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryType>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("puthia_recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      } else {
        setRecentSearches(["বানেশ্বর হাট", "পুঠিয়া হাসপাতাল", "জমি নামজারি"]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Execute Search
  useEffect(() => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const scored = SEARCH_DATABASE.map(item => {
      const titleScore = computeFuzzyScore(item.title, trimmed) * 2.5;
      const subScore = computeFuzzyScore(item.subtitle, trimmed) * 1.5;
      const detailsScore = computeFuzzyScore(item.details || "", trimmed);
      const tagScore = item.tags?.some(t => computeFuzzyScore(t, trimmed) > 40) ? 50 : 0;

      const maxScore = Math.max(titleScore, subScore, detailsScore, tagScore);
      return { ...item, score: maxScore };
    }).filter(item => (item.score || 0) > 15);

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));

    setResults(scored);
  }, [queryText]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("puthia_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    saveRecentSearch(queryText || item.title);
    onClose();
    navigate(item.path);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("puthia_recent_searches");
  };

  const filteredResults = results.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const categoryCounts = {
    all: results.length,
    people: results.filter(r => r.category === "people").length,
    organizations: results.filter(r => r.category === "organizations").length,
    services: results.filter(r => r.category === "services").length,
    posts: results.filter(r => r.category === "posts").length,
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-white text-slate-900 flex flex-col w-full h-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full flex flex-col bg-white overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Search Input */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative flex items-center gap-2 sm:gap-3 shrink-0 shadow-md">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0"
              title="ফিরে যান"
            >
              <ArrowLeft size={22} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex-1 flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-2xl px-3.5 py-2.5 sm:py-3 shadow-inner focus-within:bg-white focus-within:text-slate-900 focus-within:border-emerald-500 transition-all">
              <Search className="shrink-0 text-emerald-300 focus-within:text-emerald-600" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="পুরো পুঠিয়া একসাথে খুঁজুন... (মানুষ, হাসপাতাল, সার্ভিস, পোস্ট)"
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 ring-0 shadow-none text-xs sm:text-base font-bold w-full placeholder:text-emerald-200/70 focus-within:placeholder:text-slate-400"
              />
              {queryText && (
                <button
                  onClick={() => setQueryText("")}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white focus-within:bg-slate-200 focus-within:text-slate-700 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
              title="বন্ধ করুন"
            >
              <X size={22} />
            </button>
          </div>

          {/* Category Filter Tabs */}
          {queryText.trim().length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "সবকিছু", icon: Sparkles },
                { id: "people", label: "মানুষ/ব্যক্তি", icon: Users },
                { id: "organizations", label: "প্রতিষ্ঠানের তথ্য", icon: Building2 },
                { id: "services", label: "নাগরিক সেবা", icon: SlidersHorizontal },
                { id: "posts", label: "সংবাদ ও পোস্ট", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const count = categoryCounts[tab.id as SearchCategoryType];
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as SearchCategoryType)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#006a4e] text-white shadow-md shadow-emerald-900/20"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Body Content Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl w-full mx-auto">
            {/* NO QUERY STATE: Popular & Recent Searches */}
            {!queryText.trim() && (
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={14} className="text-emerald-600" />
                        সাম্প্রতিক সার্চ (Recent Searches)
                      </h4>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        মুছে ফেলুন
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setQueryText(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer border border-slate-200/60"
                        >
                          <Clock size={12} className="text-slate-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-500" />
                    জনপ্রিয় সার্চ (Popular Searches)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_SEARCHES.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQueryText(term)}
                        className="p-2.5 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 hover:from-emerald-100 hover:to-teal-100 rounded-2xl border border-emerald-100 text-left transition-all group cursor-pointer"
                      >
                        <p className="text-xs font-extrabold text-emerald-950 group-hover:text-emerald-700 truncate">
                          {term}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600/70 flex items-center gap-0.5 mt-0.5">
                          খুঁজুন <ChevronRight size={10} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl text-white space-y-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-black rounded-lg border border-emerald-400/30">
                    ⚡ ৬০+ পরিষেবা একত্রে
                  </span>
                  <h4 className="text-sm font-black">আমাদের পুঠিয়ার ডিজিটাল তথ্যকোষ</h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    যে কোনো সেবা, ডাক্তার, হাসপাতাল, ট্রেন সময়সূচী, সরকারি ফরম বা স্থানীয় সংবাদ এক সার্চে খুঁজে নিন।
                  </p>
                </div>
              </div>
            )}

            {/* RESULTS LIST */}
            {queryText.trim() && filteredResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500">
                  মোট <span className="font-black text-emerald-700">{filteredResults.length}টি</span> ফলাফল পাওয়া গিয়েছে:
                </p>

                <div className="space-y-2.5">
                  {filteredResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="p-3.5 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-sm"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            item.category === "people" ? "bg-blue-100 text-blue-800" :
                            item.category === "organizations" ? "bg-purple-100 text-purple-800" :
                            item.category === "services" ? "bg-emerald-100 text-emerald-800" :
                            "bg-orange-100 text-orange-800"
                          }`}>
                            {item.badge}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-emerald-900 truncate">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-xs font-extrabold text-slate-600 truncate">
                          {item.subtitle}
                        </p>
                        {item.details && (
                          <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                            {item.details}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-400">
                          {item.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin size={12} className="text-emerald-600" />
                              {item.location}
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
                              <Phone size={12} />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:bg-[#006a4e] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors shadow-sm">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NO RESULT SUGGESTIONS */}
            {queryText.trim() && filteredResults.length === 0 && (
              <div className="p-8 bg-slate-50 rounded-3xl text-center space-y-4 border border-slate-200/80 my-4">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-800">
                    "{queryText}" সম্পর্কিত কোনো তথ্য পাওয়া যায়নি
                  </h4>
                  <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
                    দয়া করে বানানের সঠিকতা নিশ্চিত করুন অথবা নিচের সম্পর্কিত জনপ্রিয় সেবা ক্যাটাগরি বেছে নিন:
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {POPULAR_SEARCHES.slice(0, 5).map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQueryText(term)}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3.5 bg-slate-100 border-t border-slate-200/80 text-center flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>💡 টিপস: স্পেলিং ভুল হলেও সার্চ ইঞ্জিন তথ্য খুঁজে আনে।</span>
            <span className="text-emerald-700 font-black">আমাদের পুঠিয়া ডিজিটাল হাব</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AdvancedGlobalSearchModal;

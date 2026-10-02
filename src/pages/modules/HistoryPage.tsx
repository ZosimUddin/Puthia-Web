import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, History as HistoryIcon, Landmark, MapPin, Camera, 
  BookOpen, Users, Video, Download, Info, Share2, 
  ChevronDown, ChevronUp, Clock, CalendarDays, Award,
  Music, Flag, Map as MapIcon, Link as LinkIcon, Image as ImageIcon, ExternalLink,
  Facebook, MessageCircle, Link2, Building, Search, AlertCircle, Plus, SlidersHorizontal, ArrowUpDown, X, CheckCircle, Navigation, Heart, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import SEO from '../../components/SEO';
import { copyToClipboard } from '../../utils/clipboard';

const CATEGORIES = [
  "সকল বিষয়",
  "ইতিহাস",
  "স্থাপনা",
  "ঐতিহ্য ও সংস্কৃতি",
  "সময়রেখা",
  "মুক্তিযুদ্ধ"
];

const HISTORICAL_ITEMS = [
  {
    id: '1',
    title: 'পুঠিয়া রাজবাড়ি',
    category: 'স্থাপনা',
    subCategory: 'ইন্দো-ইউরোপীয় স্থাপত্য',
    year: '১৮৯৫ সাল',
    image: 'https://images.unsplash.com/photo-1599661046289-e3188768a417?auto=format&fit=crop&q=80&w=800',
    location: 'পুঠিয়া রাজবাড়ি প্রাঙ্গণ, পুঠিয়া সদর',
    desc: 'ইন্দো-ইউরোপীয় ও গ্রিক স্থাপত্যশৈলীতে নির্মিত রাজবাড়িটি পুঠিয়ার মূল আভিজাত্য ও ঐতিহ্যের প্রতীক। পাঁচআনী জমিদার বাড়ি নামেও এটি খ্যাত।',
    details: 'পাঁচআনী রাজবাড়ি নামে খ্যাত এই রাজ প্রাসাদটি ১৮৯৫ সালে মহারানী হেমন্তকুমারী দেবী তার শাশুড়ি মহারানী শরৎসুন্দরী দেবীর সম্মানে নির্মাণ করেন। প্রাসাদের সম্মুখভাগে আয়তাকার স্তম্ভ এবং চারপাশে বিশাল রাজদীঘি ও সবুজ উদ্যান অবস্থিত।',
    mapQuery: 'Puthia Rajbari, Rajshahi'
  },
  {
    id: '2',
    title: 'ভুবনেশ্বর শিব মন্দির',
    category: 'স্থাপনা',
    subCategory: 'পোড়ামাটির মন্দির',
    year: '১৮২৩ সাল',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab4?auto=format&fit=crop&q=80&w=800',
    location: 'শিব সরোবর দীঘির পাড়, পুঠিয়া',
    desc: 'বাংলাদেশের অন্যতম বৃহৎ ও দৃষ্টিনন্দন শিব মন্দির। ১৮২৩ সালে মহারানী ভুবনময়ী দেবী এটি প্রতিষ্ঠা করেন।',
    details: 'উঁচু বেদির ওপর নির্মিত এই মন্দিরের চূড়ায় ক্ষুদ্রাকৃতির বহু শিখর রয়েছে। শিব সরোবর নামে সুবিশাল দীঘির তীরে দাঁড়িয়ে থাকা এই পাঁচচুড়া মন্দিরটি প্রত্নতাত্ত্বিক ঐতিহ্যের অপূর্ব নিদর্শনাংশ।',
    mapQuery: 'Shiva Temple Puthia'
  },
  {
    id: '3',
    title: 'পাঁচআনী গোবিন্দ মন্দির',
    category: 'স্থাপনা',
    subCategory: 'টেরাকোটা অলঙ্করণ',
    year: '১৮০৪-১৮২৮',
    image: 'https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&q=80&w=800',
    location: 'রাজবাড়ি অভ্যন্তরীণ প্রাঙ্গণ',
    desc: 'পোড়ামাটির সুক্ষ্ম ও অপূর্ব অলঙ্করণে সমৃদ্ধ অনন্য নির্মাণশৈলীর একটি মন্দির। মহাভারত ও রামায়ণের কাহিনি টেরাকোটায় রূপায়িত।',
    details: 'মন্দিরটির চারদিকের দেয়ালে পোড়ামাটির ফলকে পৌরাণিক ও সামাজিক জীবনযাত্রার বিভিন্ন চিত্র চমৎকারভাবে ফুটিয়ে তোলা হয়েছে। বাংলাদেশের টেরাকোটা শিল্পের অন্যতম সেরা নিদর্শন।',
    mapQuery: 'Govinda Temple Puthia'
  },
  {
    id: '4',
    title: 'জগন্নাথ মন্দির (রথ মন্দির)',
    category: 'স্থাপনা',
    subCategory: 'রথ আকৃতির মন্দির',
    year: 'অষ্টাদশ শতাব্দী',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f41cb839?auto=format&fit=crop&q=80&w=800',
    location: 'শ্যামসাগর দীঘির নিকটবর্তী, পুঠিয়া',
    desc: 'দোতলা বিশিষ্ট অনন্য রথ আকৃতির জগন্নাথ দেবের মন্দির। প্রাচীন হিন্দু স্থাপত্যের বিরল এক শিল্পকর্ম।',
    details: 'জগন্নাথ মন্দিরের চারকোনা কাঠামোর ওপর ছোট ছোট শিখর ও রথের কোণ দৃশ্যমান। তৎকালীন কারিগরদের স্থাপত্য প্রতিভার সাক্ষ্য বহন করে এই প্রাচীন স্থাপনা।',
    mapQuery: 'Jagannath Temple Puthia'
  },
  {
    id: '5',
    title: 'পুঠিয়া নামকরণের ইতিহাস',
    category: 'ইতিহাস',
    subCategory: 'উৎপত্তি ও বিবর্তন',
    year: 'ষোড়শ শতাব্দী',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800',
    location: 'লস্করপুর পরগনা, পুঠিয়া',
    desc: 'লস্করপুর পরগনার অন্তর্ভুক্ত পুঠিয়া নামকরণের পেছনে প্রাচীন পুটি মাছের সমৃদ্ধ জলাশয় এবং পুঁথি পাঠের ঐতিহ্যবাহী স্থান থেকে নামকরণের ইতিহাস জড়িত।',
    details: 'মুঘল সম্রাট আকবরের আমলে পীতাম্বর গুpto এই রাজবংশের গোড়াপত্তন করেন। তৎকালীন লস্করপুর পরগনায় পুঠিয়া রাজবংশ অন্যতম বৃহৎ ও ধনী জমিদার পরিবার হিসেবে পরিচিতি লাভ করে।',
    mapQuery: 'Puthia Rajshahi'
  },
  {
    id: '6',
    title: 'ঐতিহাসিক রথযাত্রা ও গ্রামীণ মেলা',
    category: 'ঐতিহ্য ও সংস্কৃতি',
    subCategory: 'উৎসব ও মেলা',
    year: 'প্রতি বছর আসার মাস',
    image: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&q=80&w=800',
    location: 'পুঠিয়া রাজবাড়ি মাঠ',
    desc: 'পুঠিয়ার শত বছরের পুরনো ঐতিহ্যবাহী রথযাত্রা ও লোকমেলা। দেশ-বিদেশের হাজারো দর্শনার্থীর সমাগম ঘটে।',
    details: 'আষাঢ় মাসে অনুষ্ঠিত রথযাত্রায় সুসজ্জিত রথ টেনে রাজবাড়ি থেকে নিয়ে যাওয়া হয়। মেলার দিনগুলোতে লোকশিল্প, মাটির তৈরি খেলনা ও ঐতিহ্যবাহী মিষ্টির সমাহার ঘটে।',
    mapQuery: 'Puthia Rajbari Fair Ground'
  },
  {
    id: '7',
    title: 'মুক্তিযুদ্ধ ও পুঠিয়ার দামাল ছেলেরা',
    category: 'মুক্তিযুদ্ধ',
    subCategory: '১৯৭১ বীরত্বগাথা',
    year: '১৯৭১ সাল',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
    location: 'উপজেলা চত্বর ও ঝলমলিয়া',
    desc: '১৯৭১ সালের মুক্তিযুদ্ধে পুঠিয়ার দামাল সন্তানদের সাহসিকতা ও হানাদার বাহিনীর বিরুদ্ধে প্রতিরোধ সংগ্রাম।',
    details: 'পুঠিয়া ও ঝলমলিয়ার প্রতিরোধ যুদ্ধে অসংখ্য বীর মুক্তিযোদ্ধা জীবন বাজী রেখে লড়াই করেন। গণহত্যায় শহীদ হওয়া বীর সন্তানদের স্মরণে উপজেলা চত্বরে স্মৃতিস্তম্ভ নির্মিত হয়েছে।',
    mapQuery: 'Puthia Liberation War Monument'
  }
];

const TIMELINE_EVENTS = [
  { year: "প্রাচীন যুগ", title: "পুঠিয়ার গোড়াপত্তন", desc: "লস্করপুর পরগনায় বসতি ও কৃষির সুপ্রাচীন ইতিহাস।" },
  { year: "১৫৭৬-১৬০৫", title: "জমিদার বংশের প্রতিষ্ঠা", desc: "মুঘল আমলে পীতাম্বর দেব কর্তৃক পুঠিয়া রাজবংশ প্রতিষ্ঠা।" },
  { year: "১৮২৩", title: "শিব মন্দির নির্মাণ", desc: "মহারানী ভুবনময়ী দেবী কর্তৃক সর্ববৃহৎ শিব মন্দির নির্মাণ।" },
  { year: "১৮৯৫", title: "পুঠিয়া রাজবাড়ি নির্মাণ সমাপ্তি", desc: "মহারানী হেমন্তকুমারী দেবী কর্তৃক পাঁচআনী রাজপ্রাসাদ প্রতিষ্ঠা।" },
  { year: "১৯৭১", title: "মহান মুক্তিযুদ্ধ", desc: "পুঠিয়ার মুক্তিকামী মানুষের গৌরবদীপ্ত সংগ্রাম ও বিজয়।" },
  { year: "১৯৮৪", title: "উপজেলা প্রতিষ্ঠা", desc: "প্রশাসনিক সংস্কারে পুঠিয়াকে স্বাধীন উপজেলা হিসেবে মর্যাদা প্রদান।" }
];

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সকল বিষয়");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("puthia_history_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (id: string, title: string) => {
    setFavorites(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(item => item !== id);
        showToast(`"${title}" বুকমার্ক থেকে সরানো হয়েছে।`);
      } else {
        updated = [...prev, id];
        showToast(`"${title}" বুকমার্কে সংরক্ষণ করা হয়েছে।`);
      }
      try {
        localStorage.setItem("puthia_history_favorites", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleShare = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${item.title} - ইতিহাস ও ঐতিহ্য | আমাদের পুঠিয়া`,
        text: `${item.title}: ${item.desc}`,
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
        showToast("লিংক কপি করা হয়েছে!");
      });
    } else {
      copyToClipboard(shareUrl);
      showToast("লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
    }
  };

  const filteredItems = useMemo(() => {
    return HISTORICAL_ITEMS.filter(item => {
      // Category filter
      if (selectedCategory !== "সকল বিষয়" && item.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesDesc = item.desc.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc && !matchesLoc) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Hind_Siliguri'] text-slate-800 pb-20 lg:pb-0">
      <SEO 
        title="ইতিহাস ও ঐতিহ্য - পুঠিয়া, রাজশাহী | আমাদের পুঠিয়া"
        description="পুঠিয়া রাজবাড়ি, প্রাচীন গোবিন্দ মন্দির, শিব মন্দির, জগন্নাথ মন্দির, জমিদার আমল ও মহান মুক্তিযুদ্ধের ঐতিহাসিক নিদর্শন।"
      />

      <Header />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs md:text-sm font-bold"
          >
            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pb-24">
        {/* Banner Section - Exact Doctor Page Standard (#006a4e Emerald Green) */}
        <div className="bg-[#006a4e] text-white pt-4 pb-14 px-4 sm:px-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-3.5 relative z-10">
            {/* Top Navigation Row inside Banner */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="ফিরে যান"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all border-none cursor-pointer backdrop-blur-md"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = window.location.href;
                    copyToClipboard(url);
                    showToast("লিংক শেয়ারের জন্য কপি করা হয়েছে!");
                  }}
                  className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
                >
                  <Share2 size={15} className="text-[#006a4e] stroke-[2.5]" />
                  <span>শেয়ার করুন</span>
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>🏛️ ইতিহাস ও ঐতিহ্য</span>
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  ২০+ তথ্য
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/95 font-medium leading-relaxed mt-1">
                পুঠিয়া উপজেলার গৌরবময় ইতিহাস, রাজবাড়ি, মন্দির ও প্রাচীন ঐতিহ্যের প্রাচীন নিদর্শন।
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 relative z-20 space-y-5">
          
          {/* Search Bar & Category Dropdown */}
          <div className="flex items-center gap-2 pt-1">
            {/* Search Box */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl h-11 px-3 shadow-md border border-slate-100 flex items-center gap-2">
              <Search size={17} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="রাজবাড়ি, মন্দির বা ঐতিহাসিক ঘটনা খুঁজুন..."
                className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 outline-none truncate"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="h-11 px-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-100 shadow-md cursor-pointer appearance-none outline-none pr-7"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ArrowUpDown size={13} className="text-[#006a4e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Horizontal Scrolling Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border-none cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-[#006a4e] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Featured Heritage Card */}
          {!searchQuery && selectedCategory === "সকল বিষয়" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-md border border-slate-100 group"
            >
              <img 
                src="https://images.unsplash.com/photo-1599661046289-e3188768a417?auto=format&fit=crop&q=80&w=1200" 
                alt="Puthia Rajbari" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent flex flex-col justify-end p-5 sm:p-7 text-white space-y-2">
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full w-fit">
                  🏛️ প্রধান প্রত্নতাত্ত্বিক ঐতিহ্য
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white">পুঠিয়া রাজবাড়ি ও মন্দির কমপ্লেক্স</h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2 max-w-xl">
                  ইন্দো-ইউরোপীয় স্থাপত্য ও প্রাচীন টেরাকোটা শিল্পের এক মহিমান্বিত তীর্থক্ষেত্র। মহারানী হেমন্তকুমারী দেবীর অমর কীর্তি।
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(HISTORICAL_ITEMS[0])}
                    className="py-2 px-4 bg-[#006a4e] hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    বিস্তারিত ইতিহাস পড়ুন
                  </button>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Puthia+Rajbari+Rajshahi"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-xs rounded-xl text-decoration-none flex items-center gap-1.5 transition-all"
                  >
                    <Navigation size={13} />
                    <span>ম্যাপ দেখুন</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Historical Items Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Landmark size={18} className="text-[#006a4e]" />
              <span>ঐতিহাসিক নিদর্শন ও ঘটনাবলি ({filteredItems.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="h-44 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1">
                        <span className="bg-[#006a4e] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          {item.category}
                        </span>
                        <span className="bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                          {item.year}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id, item.title)}
                        className={`absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-all ${
                          favorites.includes(item.id)
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-white/80 text-slate-700 border-white/50 hover:bg-white'
                        }`}
                      >
                        <Heart size={15} className={favorites.includes(item.id) ? 'fill-white' : ''} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-base font-black text-slate-900 group-hover:text-[#006a4e] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 pt-1">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="py-2 px-3 bg-[#006a4e] hover:bg-[#00523d] text-white text-xs font-black rounded-xl border-none cursor-pointer transition-colors text-center"
                    >
                      বিস্তারিত দেখুন
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl text-decoration-none flex items-center justify-center gap-1 transition-colors"
                    >
                      <Navigation size={13} className="text-rose-500" />
                      <span>অবস্থান</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
                <Landmark size={44} className="mx-auto text-slate-300" />
                <h3 className="text-sm font-bold text-slate-700">কোনো তথ্য পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  আপনার অনুসন্ধান বা বিষয় পরিবর্তন করে পুনরায় চেষ্টা করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("সকল বিষয়");
                    setSearchQuery("");
                  }}
                  className="py-2 px-4 bg-[#006a4e] text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="text-[#006a4e]" size={20} /> ইতিহাস ও সময়রেখা (Timeline)
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-emerald-100">
              {TIMELINE_EVENTS.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-9">
                  <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-[#006a4e] border-4 border-white shadow-xs" />
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex-1 space-y-0.5">
                    <span className="text-[10px] font-black text-[#006a4e] bg-emerald-100 px-2 py-0.5 rounded-md">
                      {item.year}
                    </span>
                    <h4 className="font-black text-slate-900 text-xs pt-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liberation War Special Section */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden space-y-3">
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <Flag size={180} />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase backdrop-blur-md">
              <ShieldCheck size={13} className="text-emerald-300" /> ৭১-এর বীরত্বগাথা
            </div>
            <h3 className="text-lg font-black text-white">মুক্তিযুদ্ধ ও পুঠিয়ার দামাল ছেলেরা</h3>
            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
              ১৯৭১ সালের মহান মুক্তিযুদ্ধে পুঠিয়ার দামাল ছেলেরা বীরত্বের সাথে অংশগ্রহণ করেছিল। পাক হানাদার বাহিনীর বিরুদ্ধে ঝলমলিয়া ও পুঠিয়ার রক্তক্ষয়ী প্রতিরোধ যুদ্ধে অগণিত শহীদের রক্তে রঞ্জিত হয় এই মাটি।
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg font-black text-white">১২+</div>
                <div className="text-[11px] font-bold text-emerald-200">স্মরণীয় গণহত্যাস্থল</div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-lg font-black text-white">স্মৃতিস্তম্ভ</div>
                <div className="text-[11px] font-bold text-emerald-200">উপজেলা পরিষদ প্রাঙ্গণ</div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-[#006a4e]" size={20} /> সাধারণ প্রশ্নোত্তর (FAQ)
            </h3>
            <div className="space-y-3">
              {[
                { q: "পুঠিয়ার নাম কেন পুঠিয়া?", a: "লস্করপুর পরগনার প্রাচীন ইতিহাস ও লোককথা অনুসারে পুটি মাছ ও প্রাচীন পুঁথি চর্চার স্থান থেকে এই অঞ্চলের নাম পুঠিয়া হয়েছে।" },
                { q: "সবচেয়ে প্রাচীন মন্দির কোনটি?", a: "১৮২৩ সালে মহারানী ভুবনময়ী দেবী নির্মিত ভুবনেশ্বর শিব মন্দির এবং ১৮০৪ সালের গোবিন্দ মন্দির অন্যতম প্রাচীন।" },
                { q: "দর্শনার্থীদের আসার সময়সূচি কী?", a: "রাজবাড়ি প্রাঙ্গণ ও মন্দিরসমূহ প্রতিদিন সকাল ৯:০০ থেকে বিকাল ৫:০০ পর্যন্ত দর্শনার্থীদের জন্য উন্মুক্ত থাকে।" }
              ].map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button 
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                    className="flex justify-between items-center w-full font-bold text-xs text-slate-900 p-3.5 hover:bg-slate-100/50 transition-colors border-none cursor-pointer text-left"
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={16} className={`text-[#006a4e] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-3.5 pt-0 text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-100">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-[#006a4e] text-xs font-black rounded-full border border-emerald-100">
                  {selectedItem.category} • {selectedItem.year}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleShare(selectedItem, e)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border-none cursor-pointer"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-none"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  className="w-full h-56 rounded-2xl object-cover shadow-sm" 
                />
                
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedItem.title}</h2>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-1">
                    <MapPin size={14} className="text-rose-500" />
                    <span>{selectedItem.location}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <h4 className="text-xs font-black text-[#006a4e] uppercase tracking-wider">ঐতিহাসিক বিবরণ</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{selectedItem.details || selectedItem.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedItem.mapQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white font-black text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 text-decoration-none"
                  >
                    <Navigation size={15} />
                    <span>ম্যাপে দিকনির্দেশনা দেখুন</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default HistoryPage;

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, MapPin, Search, Building2, Clock, 
  Calendar, Filter, Heart, Share2, ExternalLink, ChevronRight,
  Trophy, Users, Target, DollarSign, CheckCircle2, Bell,
  FileText, Upload, Globe, Phone, Mail, Award, Bookmark,
  TrendingUp, Zap, Timer, Star, GraduationCap, Scissors,
  ZapIcon, Car, Cpu, BookOpen, Laptop, Sprout, ChefHat,
  MessageSquare, BarChart3, Layout, Layers, ShieldCheck,
  HelpCircle, Info, Download, CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { useFavorites } from "./FavoriteContext";

interface Training {
  id: string;
  title: string;
  organizer: string;
  location: string;
  startDate: string;
  duration: string;
  fee: string;
  seats: number;
  certification: boolean;
  description: string;
  curriculum: string[];
  instructor: string;
  schedule: string;
  eligibility: string;
  requirements: string[];
  image?: string;
  isFeatured?: boolean;
  category: string;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: any;
}

const TRAINING_CATEGORIES = [
  { id: "all", label: "সব", icon: "🎓" },
  { id: "it", label: "আইটি ও কম্পিউটার", icon: "💻" },
  { id: "agri", label: "কৃষি প্রশিক্ষণ", icon: "🌾" },
  { id: "fashion", label: "সেলাই ও ডিজাইন", icon: "🧵" },
  { id: "elec", label: "ইলেকট্রিক্যাল", icon: "⚡" },
  { id: "driving", label: "ড্রাইভিং", icon: "🚗" },
  { id: "business", label: "উদ্যোক্তা উন্নয়ন", icon: "💼" },
  { id: "livestock", label: "প্রাণিসম্পদ", icon: "🐄" },
  { id: "cooking", label: "রান্না ও বেকিং", icon: "👩‍🍳" },
  { id: "language", label: "ভাষা শিক্ষা", icon: "🗣️" },
  { id: "digital", label: "ডিজিটাল মার্কেটিং", icon: "📱" },
];

export function TrainingHub({ onGoBack }: { onGoBack: () => void }) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const { toggleSave, isSaved } = useFavorites();

  useEffect(() => {
    const q = query(collection(db, "trainings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training));
      setTrainings(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trainings:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    return {
      total: trainings.length,
      ongoing: trainings.filter(t => t.status === "ongoing").length,
      new: trainings.filter(t => {
        const created = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
        const now = new Date();
        return (now.getTime() - created.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
      }).length,
      organizers: new Set(trainings.map(t => t.organizer)).size,
      certified: trainings.filter(t => t.certification).length
    };
  }, [trainings]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const matchesFilter = activeFilter === "all" || 
                          (activeFilter === "free" && t.fee.toLowerCase().includes("ফ্রি")) ||
                          (activeFilter === "certified" && t.certification);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [trainings, searchQuery, activeCategory, activeFilter]);

  const featuredTrainings = useMemo(() => trainings.filter(t => t.isFeatured), [trainings]);

  if (view === "detail" && selectedTraining) {
    return <TrainingDetail training={selectedTraining} onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={onGoBack}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-3">
              <button className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
                <Bell className="w-5 h-5 text-emerald-500" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight font-sans">🎓 প্রশিক্ষণ</h1>
            <p className="text-lg font-medium text-indigo-100 opacity-90 max-w-md">
              দক্ষতা অর্জন করুন, কর্মজীবনে এগিয়ে যান
            </p>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="প্রশিক্ষণ খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/15 border border-white/20 rounded-3xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all backdrop-blur-lg"
            />
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "মোট প্রশিক্ষণ", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-50", icon: <BookOpen className="w-4 h-4" /> },
          { label: "চলমান প্রশিক্ষণ", value: stats.ongoing, color: "text-emerald-600", bg: "bg-emerald-50", icon: <ActivityIcon className="w-4 h-4" /> },
          { label: "নতুন কোর্স", value: stats.new, color: "text-blue-600", bg: "bg-blue-50", icon: <ZapIcon className="w-4 h-4" /> },
          { label: "প্রশিক্ষণ প্রতিষ্ঠান", value: stats.organizers, color: "text-amber-600", bg: "bg-amber-50", icon: <Building2 className="w-4 h-4" /> },
          { label: "সনদপ্রাপ্ত কোর্স", value: stats.certified, color: "text-teal-600", bg: "bg-teal-50", icon: <Award className="w-4 h-4" /> },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} p-4 rounded-3xl border border-white shadow-sm flex flex-col items-center justify-center text-center space-y-1 group hover:scale-105 transition-transform cursor-default`}>
            <div className={`${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>{stat.icon}</div>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 3. Category Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 font-sans">প্রশিক্ষণের ক্যাটাগরি</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-11 gap-3">
          {TRAINING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-3xl transition-all duration-300 border shadow-sm ${
                activeCategory === cat.id 
                  ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-200" 
                  : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-[10px] font-black text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm">
        {[
          { id: "all", label: "সব প্রশিক্ষণ" },
          { id: "free", label: "ফ্রি প্রশিক্ষণ" },
          { id: "certified", label: "সনদপ্রাপ্ত" },
          { id: "upcoming", label: "আসন্ন" },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
              activeFilter === filter.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 5. Featured Section */}
      {featuredTrainings.length > 0 && activeCategory === "all" && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-xl font-black text-slate-800 font-sans">প্রিমিয়াম প্রশিক্ষণ</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {featuredTrainings.map(t => (
              <FeaturedTrainingCard 
                key={t.id} 
                training={t} 
                onClick={() => { setSelectedTraining(t); setView("detail"); }}
                onToggleFav={() => toggleSave({ id: t.id, type: 'news', title: t.title, subtitle: t.organizer })}
                isFav={isSaved(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Main List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 font-sans">নতুন প্রশিক্ষণ</h3>
          <span className="text-xs font-bold text-slate-400">{filteredTrainings.length} টি পাওয়া গেছে</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTrainings.map((t) => (
              <TrainingCard 
                key={t.id} 
                training={t} 
                onClick={() => { setSelectedTraining(t); setView("detail"); }}
                onToggleFav={() => toggleSave({ id: t.id, type: 'news', title: t.title, subtitle: t.organizer })}
                isFav={isSaved(t.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredTrainings.length === 0 && !loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-800">কোনো প্রশিক্ষণ পাওয়া যায়নি</p>
              <p className="text-sm font-medium text-slate-500">অন্য কোনো ক্যাটাগরি বা সার্চ দিয়ে চেষ্টা করুন</p>
            </div>
          </div>
        )}
      </div>

      {/* 7. Bottom CTA */}
      <div className="bg-indigo-900 rounded-[40px] p-10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-white leading-tight">🚀 নতুন দক্ষতা অর্জন করুন</h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto">
            সরকারি ও বেসরকারি বিভিন্ন প্রশিক্ষণে অংশ নিয়ে নিজেকে দক্ষ করে তুলুন।
          </p>
          <button className="px-8 py-4 bg-amber-400 text-slate-950 rounded-[20px] font-black shadow-xl shadow-amber-400/20 flex items-center gap-2 mx-auto hover:scale-105 transition-transform">
             📝 এখনই আবেদন করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function TrainingCard({ training, onClick, onToggleFav, isFav }: { training: Training, onClick: () => void, onToggleFav: (e: any) => void, isFav: boolean }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={training.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"} 
          alt={training.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {training.status === "upcoming" && (
            <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">আসন্ন</span>
          )}
          {training.certification && (
            <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">সনদপ্রাপ্ত</span>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(e); }}
          className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all backdrop-blur-md border ${isFav ? "bg-rose-500 border-rose-500 text-white" : "bg-white/20 border-white/20 text-white hover:bg-white/40"}`}
        >
          <Bookmark className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {training.title}
          </h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{training.organizer}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            {training.startDate}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase text-right justify-end">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {training.duration}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-emerald-600">{training.fee}</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-600 font-black text-xs">
            বিস্তারিত দেখুন <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedTrainingCard({ training, onClick, onToggleFav, isFav }: { training: Training, onClick: () => void, onToggleFav: () => void, isFav: boolean }) {
  return (
    <div 
      onClick={onClick}
      className="min-w-[320px] bg-white rounded-[40px] border-2 border-indigo-50 shadow-xl shadow-indigo-100/20 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform group"
    >
      <div className="relative h-40">
        <img src={training.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{training.organizer}</p>
          <h4 className="text-lg font-black leading-tight line-clamp-1">{training.title}</h4>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
          <Zap className="w-4 h-4" />
          <span>এখনই আবেদন করুন</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          className={`p-2.5 rounded-xl transition-all ${isFav ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300 hover:text-rose-500"}`}
        >
          <Bookmark className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function TrainingDetail({ training, onBack }: { training: Training, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"desc" | "apply">("desc");
  const { toggleSave, isSaved } = useFavorites();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 -mx-4 -mt-4 px-4 pt-4 pb-20 space-y-6"
    >
      {/* Header with Image */}
      <div className="relative h-[400px] -mx-4 -mt-4 rounded-b-[60px] overflow-hidden shadow-2xl">
        <img src={training.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="p-4 rounded-3xl bg-white/20 hover:bg-white/30 transition-all border border-white/20 backdrop-blur-xl text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            <button className="p-4 rounded-3xl bg-white/20 hover:bg-white/30 transition-all border border-white/20 backdrop-blur-xl text-white">
              <Share2 className="w-6 h-6" />
            </button>
            <button 
              onClick={() => toggleSave({ id: training.id, type: 'news', title: training.title, subtitle: training.organizer })}
              className={`p-4 rounded-3xl transition-all border backdrop-blur-xl ${isSaved(training.id) ? "bg-rose-500 border-rose-500 text-white" : "bg-white/20 border-white/20 text-white"}`}
            >
              <Bookmark className={`w-6 h-6 ${isSaved(training.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-8 right-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              {TRAINING_CATEGORIES.find(c => c.id === training.category)?.label}
            </span>
            {training.certification && (
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                সনদপ্রাপ্ত কোর্স
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">{training.title}</h1>
          <div className="flex items-center gap-2 text-indigo-200">
             <Building2 className="w-5 h-5" />
             <p className="font-bold text-lg">{training.organizer}</p>
          </div>
        </div>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-10 relative z-20 px-2">
        {[
          { label: "কোর্স ফি", value: training.fee, icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
          { label: "সময়কাল", value: training.duration, icon: <Clock className="w-4 h-4 text-blue-500" /> },
          { label: "শুরু হবে", value: training.startDate, icon: <Calendar className="w-4 h-4 text-amber-500" /> },
          { label: "আসন সংখ্যা", value: `${training.seats} টি`, icon: <Users className="w-4 h-4 text-indigo-500" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center space-y-1">
            <div className="p-2 bg-slate-50 rounded-xl mb-1">{item.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-black text-slate-800 leading-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm">
        <button
          onClick={() => setActiveTab("desc")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-sm font-black transition-all ${
            activeTab === "desc" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" /> কোর্স পরিচিতি
        </button>
        <button
          onClick={() => setActiveTab("apply")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[24px] text-sm font-black transition-all ${
            activeTab === "apply" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Zap className="w-4 h-4" /> আবেদন পদ্ধতি
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {activeTab === "desc" ? (
            <div className="space-y-6">
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800">কোর্স পরিচিতি</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{training.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-500" /> কী কী শেখানো হবে
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {training.curriculum.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                   <div className="p-5 bg-indigo-50 rounded-[32px] border border-indigo-100 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <Users className="w-5 h-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest">প্রশিক্ষকের তথ্য</p>
                      </div>
                      <p className="text-slate-800 font-black">{training.instructor}</p>
                   </div>
                   <div className="p-5 bg-amber-50 rounded-[32px] border border-amber-100 space-y-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <CalendarCheck className="w-5 h-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest">সময়সূচি</p>
                      </div>
                      <p className="text-slate-800 font-black">{training.schedule}</p>
                   </div>
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xl font-black text-slate-800">যোগ্যতা ও প্রয়োজনীয়তা</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">যোগ্যতা</p>
                    <p className="text-slate-800 font-bold">{training.eligibility}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">প্রয়োজনীয় কাগজপত্র</p>
                    <div className="flex flex-wrap gap-2">
                      {training.requirements.map((req, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">আবেদন করুন</h3>
                  <p className="text-slate-500 font-medium">নিচের তথ্যগুলো ব্যবহার করে সরাসরি যোগাযোগ করুন অথবা অনলাইনে আবেদন করুন</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                   <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-indigo-50 transition-colors border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">যোগাযোগ</p>
                      <p className="text-lg font-black text-slate-800">০১৭০০-০০০০০০</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-indigo-50 transition-colors border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">প্রশিক্ষণ কেন্দ্র</p>
                      <p className="text-sm font-black text-slate-800">{training.location}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform group">
                     📝 অনলাইনে আবেদন করুন <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                     <button className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                        <Download className="w-5 h-5" /> প্রসপেক্টাস
                     </button>
                     <button className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                        <Globe className="w-5 h-5" /> ওয়েবসাইট
                     </button>
                  </div>
                </div>
              </section>

              <div className="bg-amber-50 rounded-[40px] p-8 border border-amber-100 space-y-3">
                 <div className="flex items-center gap-2 text-amber-700">
                   <Info className="w-5 h-5" />
                   <h4 className="font-black">গুরুত্বপূর্ণ তথ্য</h4>
                 </div>
                 <p className="text-sm font-medium text-amber-800 leading-relaxed">
                   আবেদন করার আগে অবশ্যই আপনার সকল তথ্যের সত্যতা যাচাই করে নিন। প্রশিক্ষণের সময়সূচি আয়োজক প্রতিষ্ঠান পরিবর্তন করার অধিকার সংরক্ষণ করে।
                 </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

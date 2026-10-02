import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, MapPin, Phone, Info, Search, School, GraduationCap, 
  BookOpen, Users, Calendar, Clock, Globe, Mail, ChevronRight, 
  Heart, Share2, Download, FileText, LayoutDashboard, Filter,
  Trophy, Bell, Map as MapIcon, Award, Star, History, Building2,
  CheckCircle2, Languages, Microscope, Laptop, Disc, Library
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, where, limit } from "firebase/firestore";
import { useFavorites } from "./FavoriteContext";

interface EduInstitution {
  id: string;
  name: string;
  type: string; // primary_govt, primary_pvt, secondary, college, madrasa, technical, kindergarten, coaching
  category: "govt" | "private";
  union: string;
  location: string;
  principal: string;
  phone: string;
  email?: string;
  website?: string;
  image?: string;
  establishedYear?: string;
  history?: string;
  students?: { total: number; boys: number; girls: number };
  facilities?: string[];
  academic?: { classes: string; depts: string; shifts: string };
  isFeatured?: boolean;
  sscPassRate?: number;
  hscPassRate?: number;
  createdAt?: any;
}

const CATEGORIES = [
  { id: "all", label: "সব", icon: "📚" },
  { id: "primary_govt", label: "সরকারি প্রাথমিক", icon: "🏫" },
  { id: "primary_pvt", label: "বেসরকারি প্রাথমিক", icon: "📚" },
  { id: "secondary", label: "মাধ্যমিক বিদ্যালয়", icon: "🎓" },
  { id: "college", label: "কলেজ", icon: "🏛️" },
  { id: "madrasa", label: "মাদ্রাসা", icon: "🕌" },
  { id: "technical", label: "কারিগরি ও ভোকেশনাল", icon: "⚙️" },
  { id: "kindergarten", label: "কিন্ডারগার্টেন", icon: "🧒" },
  { id: "coaching", label: "কোচিং সেন্টার", icon: "📖" },
];

const UNIONS = [
  "সব ইউনিয়ন", "পুঠিয়া সদর", "বানেশ্বর", "বেলপুকুর", "ভালুকগাছি", "জিলানিয়া", "শিলমাড়িয়া", "জিউপাড়া"
];

export function EduInstInfo({ onGoBack }: { onGoBack: () => void }) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedInst, setSelectedInst] = useState<EduInstitution | null>(null);
  const [institutions, setInstitutions] = useState<EduInstitution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [selectedUnion, setSelectedUnion] = useState("সব ইউনিয়ন");
  const [selectedGovtType, setSelectedGovtType] = useState<"all" | "govt" | "private">("all");
  const [loading, setLoading] = useState(true);

  const { toggleSave, isSaved } = useFavorites();

  useEffect(() => {
    const q = query(collection(db, "education_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EduInstitution));
      setInstitutions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching institutions:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    return {
      total: institutions.length,
      primary: institutions.filter(i => i.type.startsWith("primary")).length,
      secondary: institutions.filter(i => i.type === "secondary").length,
      college: institutions.filter(i => i.type === "college").length,
      madrasa: institutions.filter(i => i.type === "madrasa").length,
      technical: institutions.filter(i => i.type === "technical").length,
    };
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inst.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeType === "all" || inst.type === activeType;
      const matchesUnion = selectedUnion === "সব ইউনিয়ন" || inst.union === selectedUnion;
      const matchesGovt = selectedGovtType === "all" || inst.category === selectedGovtType;
      return matchesSearch && matchesType && matchesUnion && matchesGovt;
    });
  }, [institutions, searchQuery, activeType, selectedUnion, selectedGovtType]);

  const featuredInsts = useMemo(() => institutions.filter(i => i.isFeatured), [institutions]);

  if (view === "detail" && selectedInst) {
    return <InstitutionDetail inst={selectedInst} onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 p-8 text-white shadow-2xl">
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
            <h1 className="text-4xl font-black tracking-tight font-sans">🎓 শিক্ষা প্রতিষ্ঠান</h1>
            <p className="text-lg font-medium text-blue-100 opacity-90 max-w-md">
              পুঠিয়া উপজেলার সকল শিক্ষা প্রতিষ্ঠানের তথ্য এক জায়গায়
            </p>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="প্রতিষ্ঠানের নাম বা এলাকা দিয়ে খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/15 border border-white/20 rounded-3xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all backdrop-blur-lg"
            />
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "মোট প্রতিষ্ঠান", value: stats.total, color: "text-blue-600", bg: "bg-blue-50", icon: <Building2 className="w-4 h-4" /> },
          { label: "প্রাথমিক", value: stats.primary, color: "text-emerald-600", bg: "bg-emerald-50", icon: <BookOpen className="w-4 h-4" /> },
          { label: "মাধ্যমিক", value: stats.secondary, color: "text-indigo-600", bg: "bg-indigo-50", icon: <GraduationCap className="w-4 h-4" /> },
          { label: "কলেজ", icon: <School className="w-4 h-4" />, value: stats.college, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "মাদ্রাসা", icon: <Building2 className="w-4 h-4" />, value: stats.madrasa, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "কারিগরি", icon: <Microscope className="w-4 h-4" />, value: stats.technical, color: "text-purple-600", bg: "bg-purple-50" },
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
          <h3 className="text-xl font-black text-slate-800 font-sans">ক্যাটাগরি</h3>
          <button className="text-xs font-bold text-indigo-600 hover:underline">সব দেখুন</button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveType(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-3xl transition-all duration-300 border shadow-sm ${
                activeType === cat.id 
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
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="w-full md:w-auto flex-1 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={selectedUnion || ""}
            onChange={(e) => setSelectedUnion(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none"
          >
            {UNIONS.map(u => <option key={u} value={u || ""}>{u}</option>)}
          </select>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {[
            { id: "all", label: "সব" },
            { id: "govt", label: "সরকারি" },
            { id: "private", label: "বেসরকারি" }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedGovtType(type.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                selectedGovtType === type.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Featured Section */}
      {featuredInsts.length > 0 && activeType === "all" && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-xl font-black text-slate-800 font-sans">সেরা শিক্ষা প্রতিষ্ঠান</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {featuredInsts.map(inst => (
              <FeaturedCard 
                key={inst.id} 
                inst={inst} 
                onClick={() => { setSelectedInst(inst); setView("detail"); }}
                onToggleFav={() => toggleSave({ id: inst.id, type: 'service', title: inst.name, subtitle: inst.type })}
                isFav={isSaved(inst.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Main List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 font-sans">প্রতিষ্ঠানের তালিকা</h3>
          <span className="text-xs font-bold text-slate-400">{filteredInstitutions.length} টি পাওয়া গেছে</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredInstitutions.map((inst) => (
              <InstitutionCard 
                key={inst.id} 
                inst={inst} 
                onClick={() => { setSelectedInst(inst); setView("detail"); }}
                onToggleFav={() => toggleSave({ id: inst.id, type: 'service', title: inst.name, subtitle: inst.type })}
                isFav={isSaved(inst.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredInstitutions.length === 0 && !loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-800">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-sm font-medium text-slate-500">অন্য কোনো নাম বা ফিল্টার দিয়ে চেষ্টা করুন</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setActiveType("all"); setSelectedUnion("সব ইউনিয়ন"); setSelectedGovtType("all"); }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        )}

        {loading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>

      {/* 7. Bottom CTA */}
      <div className="bg-indigo-950 rounded-[40px] p-10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-black text-white leading-tight">🎓 আপনার পছন্দের শিক্ষা প্রতিষ্ঠান খুঁজুন</h2>
          <p className="text-indigo-200 font-medium max-w-md mx-auto">
            ভর্তি, যোগাযোগ, অবস্থান ও অন্যান্য তথ্য এক জায়গায়। উপজেলা শিক্ষা প্রসারে আমরা বদ্ধপরিকর।
          </p>
          <button className="px-8 py-4 bg-amber-400 text-indigo-950 rounded-[20px] font-black shadow-xl shadow-amber-400/20 flex items-center gap-2 mx-auto hover:scale-105 transition-transform">
            <MapIcon className="w-5 h-5" /> প্রতিষ্ঠান দেখুন
          </button>
        </div>
      </div>
    </div>
  );
}

function InstitutionCard({ inst, onClick, onToggleFav, isFav }: { inst: EduInstitution, onClick: () => void, onToggleFav: (e: any) => void, isFav: boolean }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden shrink-0 relative group-hover:scale-105 transition-transform duration-500">
          {inst.image ? (
            <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <School className="w-8 h-8" />
            </div>
          )}
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-white/80 backdrop-blur-md rounded-lg text-[8px] font-black text-slate-800 uppercase tracking-tighter">
            {inst.category === "govt" ? "Govt" : "Pvt"}
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
              {inst.name}
            </h4>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFav(e); }}
              className={`p-2 rounded-xl transition-all ${isFav ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400 hover:text-rose-500"}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span>{inst.union}, {inst.location}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
             <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
               {CATEGORIES.find(c => c.id === inst.type)?.label || inst.type}
             </span>
             {inst.sscPassRate && (
               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                 SSC: {inst.sscPassRate}%
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-3">
        <a 
          href={`tel:${inst.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-black transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-500" /> কল করুন
        </a>
        <button 
          onClick={onClick}
          className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-black transition-all"
        >
          বিস্তারিত <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function FeaturedCard({ inst, onClick, onToggleFav, isFav }: { inst: EduInstitution, onClick: () => void, onToggleFav: () => void, isFav: boolean }) {
  return (
    <div 
      onClick={onClick}
      className="min-w-[280px] bg-white rounded-[40px] p-6 border-2 border-indigo-50 shadow-xl shadow-indigo-100/20 space-y-4 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Award className="w-8 h-8" />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          className={`p-3 rounded-2xl transition-all ${isFav ? "bg-rose-50 text-rose-500 shadow-rose-100" : "bg-white border text-slate-300 hover:text-rose-500 shadow-slate-100"}`}
        >
          <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="space-y-1 relative z-10">
        <h4 className="text-xl font-black text-slate-800 leading-tight line-clamp-2">{inst.name}</h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{CATEGORIES.find(c => c.id === inst.type)?.label}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 relative z-10">
        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>ভর্তি চলছে</span>
        </div>
        <button className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function InstitutionDetail({ inst, onBack }: { inst: EduInstitution, onBack: () => void }) {
  const [activeDetailTab, setActiveDetailTab] = useState<"info" | "academic" | "stats" | "gallery">("info");
  const { toggleSave, isSaved } = useFavorites();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 -mx-4 -mt-4 px-4 pt-4 pb-20 space-y-6"
    >
      {/* Detail Header */}
      <div className="relative h-64 -mx-4 -mt-4 rounded-b-[60px] overflow-hidden shadow-2xl">
        {inst.image ? (
          <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center">
             <School className="w-20 h-20 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
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
              onClick={() => toggleSave({ id: inst.id, type: 'service', title: inst.name, subtitle: inst.type })}
              className={`p-4 rounded-3xl transition-all border backdrop-blur-xl ${isSaved(inst.id) ? "bg-rose-500 border-rose-500 text-white" : "bg-white/20 border-white/20 text-white"}`}
            >
              <Heart className={`w-6 h-6 ${isSaved(inst.id) ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-8 right-8 space-y-2">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-amber-400 text-indigo-950 rounded-full text-[10px] font-black uppercase tracking-wider">
              {inst.category === "govt" ? "সরকারি" : "বেসরকারি"}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
              {CATEGORIES.find(c => c.id === inst.type)?.label}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight font-sans">{inst.name}</h1>
          <p className="flex items-center gap-1.5 text-blue-100 text-sm font-bold opacity-80">
            <MapPin className="w-4 h-4" /> {inst.location}
          </p>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="flex bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
        {[
          { id: "info", label: "পরিচিতি", icon: <Info className="w-4 h-4" /> },
          { id: "academic", label: "শিক্ষা কার্যক্রম", icon: <BookOpen className="w-4 h-4" /> },
          { id: "stats", label: "পরিসংখ্যান", icon: <Users className="w-4 h-4" /> },
          { id: "gallery", label: "গ্যালারি", icon: <LayoutDashboard className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDetailTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] text-sm font-black transition-all whitespace-nowrap ${
              activeDetailTab === tab.id 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDetailTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {activeDetailTab === "info" && (
            <div className="space-y-6">
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-indigo-600">
                  <History className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">সংক্ষিপ্ত ইতিহাস ও পরিচিতি</h3>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {inst.history || "এই প্রতিষ্ঠানের ইতিহাস ও পরিচিতি এখনো যোগ করা হয়নি। পুঠিয়া উপজেলার একটি অন্যতম শিক্ষা প্রতিষ্ঠান হিসেবে এটি শিক্ষার মান উন্নয়নে কাজ করে যাচ্ছে।"}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">প্রতিষ্ঠা সাল</p>
                    <p className="text-lg font-black text-slate-800">{inst.establishedYear || "জানানো হয়নি"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">প্রধান শিক্ষক / অধ্যক্ষ</p>
                    <p className="text-lg font-black text-slate-800">{inst.principal || "জানানো হয়নি"}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Phone className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">যোগাযোগ ও অবস্থান</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-indigo-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">ফোন নম্বর</p>
                      <p className="text-lg font-black text-slate-800">{inst.phone}</p>
                    </div>
                  </div>
                  {inst.email && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-indigo-50 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">ইমেইল</p>
                        <p className="text-lg font-black text-slate-800">{inst.email}</p>
                      </div>
                    </div>
                  )}
                  {inst.website && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group cursor-pointer hover:bg-indigo-50 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">ওয়েবসাইট</p>
                        <p className="text-lg font-black text-slate-800">{inst.website}</p>
                      </div>
                    </div>
                  )}
                  <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 group">
                    <MapIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Google Map-এ দেখুন
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeDetailTab === "academic" && (
            <div className="space-y-6">
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">শিক্ষা কার্যক্রম</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "শ্রেণি", value: inst.academic?.classes || "১ম - ১০ম", icon: <LayoutDashboard className="w-5 h-5" /> },
                    { label: "বিভাগ", value: inst.academic?.depts || "বিজ্ঞান, মানবিক, ব্যবসায়", icon: <Languages className="w-5 h-5" /> },
                    { label: "শিফট", value: inst.academic?.shifts || "দিবা", icon: <Clock className="w-5 h-5" /> }
                  ].map((item, i) => (
                    <div key={i} className="p-5 bg-slate-50 rounded-[32px] space-y-2 border border-slate-50">
                      <div className="text-indigo-500">{item.icon}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{item.label}</p>
                        <p className="text-base font-black text-slate-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Building2 className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">সুবিধা</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "library", label: "লাইব্রেরি", icon: <Library className="w-5 h-5" /> },
                    { key: "lab", label: "ল্যাব", icon: <Microscope className="w-5 h-5" /> },
                    { key: "computer_lab", label: "কম্পিউটার ল্যাব", icon: <Laptop className="w-5 h-5" /> },
                    { key: "playground", label: "খেলার মাঠ", icon: <Disc className="w-5 h-5" /> },
                    { key: "multimedia", label: "মাল্টিমিডিয়া ক্লাসরুম", icon: <Laptop className="w-5 h-5" /> }
                  ].map((facility) => {
                    const hasFacility = inst.facilities?.includes(facility.key);
                    return (
                      <div key={facility.key} className={`p-4 rounded-3xl flex items-center gap-3 border transition-all ${hasFacility ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-50 text-slate-300 grayscale"}`}>
                        <div className={`p-2 rounded-xl ${hasFacility ? "bg-white" : "bg-slate-100"}`}>{facility.icon}</div>
                        <span className="text-xs font-black">{facility.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
              
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Download className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">ডাউনলোড ও ফর্ম</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "ভর্তি ফরম ২০২৪", type: "PDF", size: "1.2 MB" },
                    { label: "স্কুল রুটিন", type: "JPG", size: "800 KB" },
                    { label: "প্রসপেক্টাস", type: "PDF", size: "5.4 MB" }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{file.label}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <button className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeDetailTab === "stats" && (
            <div className="space-y-6">
              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Users className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">শিক্ষার্থী পরিসংখ্যান</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "মোট শিক্ষার্থী", value: inst.students?.total || "১২৫০", color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "ছেলে", value: inst.students?.boys || "৬০০", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "মেয়ে", value: inst.students?.girls || "৬৫০", color: "text-rose-600", bg: "bg-rose-50" }
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-6 rounded-[32px] text-center space-y-1 border border-white shadow-sm`}>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                   <h4 className="font-black text-slate-800">পাশের হার (গড়)</h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase">
                          <span className="text-slate-500">SSC পাশের হার</span>
                          <span className="text-emerald-600">{inst.sscPassRate || 98}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${inst.sscPassRate || 98}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          ></motion.div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase">
                          <span className="text-slate-500">HSC পাশের হার</span>
                          <span className="text-blue-600">{inst.hscPassRate || 95}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${inst.hscPassRate || 95}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          ></motion.div>
                        </div>
                      </div>
                   </div>
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Trophy className="w-6 h-6" />
                  <h3 className="text-xl font-black text-slate-800">অর্জন ও পুরস্কার</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "২০২৩ সালের উপজেলা পর্যায়ে শ্রেষ্ঠ বিদ্যালয়",
                    "রাজশাহী বিভাগীয় পর্যায়ে সাংস্কৃতিক প্রতিযোগিতায় ২য় স্থান",
                    "ডিজিটাল উদ্ভাবনী মেলা ২০২২-এ পুরস্কৃত"
                  ].map((award, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-amber-50 rounded-3xl border border-amber-100">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-amber-900">{award}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeDetailTab === "gallery" && (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:scale-105 transition-transform duration-500 cursor-pointer">
                  <img src={`https://picsum.photos/seed/edu-${i}/400/400`} alt="Gallery" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Detail CTA */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
         <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95 transition-transform">
           <Bell className="w-6 h-6" /> ভর্তি সংক্রান্ত তথ্য জানুন
         </button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-sm space-y-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-100 rounded-full w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-slate-50 rounded-lg w-16"></div>
            <div className="h-4 bg-slate-50 rounded-lg w-16"></div>
          </div>
        </div>
      </div>
      <div className="h-10 bg-slate-50 rounded-2xl w-full"></div>
    </div>
  );
}


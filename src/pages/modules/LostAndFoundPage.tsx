import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Plus, MapPin, Calendar, 
  ChevronDown, Filter, HelpCircle, 
  Smartphone, Wallet, CreditCard, 
  FileText, Briefcase, Key, Bike, 
  Dog, Package, Info, CheckCircle2, 
  Mail, Phone, Send, Image as ImageIcon,
  ArrowRight, X, AlertTriangle, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";

// Mock Data
const MOCK_ITEMS = [
  {
    id: 1,
    type: "lost",
    category: "mobile",
    title: "স্যামসাং গ্যালাক্সি এ৫৪ হারিয়েছে",
    desc: "নীল রঙের ফোন, পিছনে একটি কালো কভার লাগানো ছিল। পুঠিয়া রাজবাড়ি এলাকা থেকে হারিয়েছে।",
    location: "পুঠিয়া রাজবাড়ি",
    date: "১৭ জুলাই ২০২৬",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400",
    status: "active"
  },
  {
    id: 2,
    type: "found",
    category: "wallet",
    title: "একটি কালো মানিব্যাগ পাওয়া গেছে",
    desc: "বানেশ্বর বাজারের মসজিদের পাশে পাওয়া গেছে। ভেতরে কিছু টাকা ও একটি এনআইডি কার্ড আছে।",
    location: "বানেশ্বর বাজার",
    date: "১৬ জুলাই ২০২৬",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400",
    status: "active"
  },
  {
    id: 3,
    type: "lost",
    category: "documents",
    title: "জরুরি ফাইল ও সার্টিফিকেট হারিয়েছে",
    desc: "বেলপুকুর থেকে পুঠিয়া আসার পথে একটি নীল ফাইলে কিছু গুরুত্বপূর্ণ কাগজপত্র হারিয়েছে।",
    location: "বেলপুকুর - পুঠিয়া রাস্তা",
    date: "১৫ জুলাই ২০২৬",
    image: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=400",
    status: "active"
  }
];

const CATEGORIES = [
  { id: "mobile", label: "মোবাইল ফোন", icon: Smartphone },
  { id: "wallet", label: "মানিব্যাগ", icon: Wallet },
  { id: "nid", label: "এনআইডি/কার্ড", icon: CreditCard },
  { id: "docs", label: "কাগজপত্র", icon: FileText },
  { id: "bag", label: "ব্যাগ/লাগেজ", icon: Briefcase },
  { id: "key", label: "চাবি", icon: Key },
  { id: "cycle", label: "সাইকেল/বাইক", icon: Bike },
  { id: "pet", label: "পোষা প্রাণী", icon: Dog },
  { id: "other", label: "অন্যান্য", icon: Package }
];

export default function LostAndFoundPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [searchQuery, filterType, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header />

      <UnifiedHeroHeader
        badgeText="পাবলিক সাপোর্ট"
        title="হারানো ও পাওয়া"
        subtitle="হারিয়ে যাওয়া বা পাওয়া যাওয়া জিনিসের তথ্য প্রকাশ করুন, যাতে প্রকৃত মালিক বা সন্ধানদাতা সহজেই যোগাযোগ করতে পারেন।"
        icon={<HelpCircle size={20} />}
        rightAction={
          <div className="flex items-center gap-2">
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
            <button 
              onClick={() => setIsFormOpen(true)}
              className="w-10 h-10 rounded-full bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="হারানো বা পাওয়ার পোস্ট দিন"
            >
              <Plus size={18} />
            </button>
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="কী খুঁজছেন? (যেমন: মানিব্যাগ, ফোন...)"
      />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Search & Filter Section */}
        <section className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="কী খুঁজছেন? (যেমন: মানিব্যাগ, ফোন...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-slate-800 font-bold border border-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterType("lost")}
                className={`flex-1 lg:w-32 py-4 rounded-2xl font-black text-xs transition-all border ${filterType === "lost" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}
              >
                হারিয়েছে
              </button>
              <button 
                onClick={() => setFilterType("found")}
                className={`flex-1 lg:w-32 py-4 rounded-2xl font-black text-xs transition-all border ${filterType === "found" ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm" : "bg-white border-slate-200 text-slate-500"}`}
              >
                পাওয়া গেছে
              </button>
              <button 
                onClick={() => setFilterType("all")}
                className={`w-12 h-full flex items-center justify-center rounded-2xl border transition-all ${filterType === "all" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-500"}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              সব ক্যাটাগরি
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === cat.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"}`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Latest Posts Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800">সর্বশেষ পোস্ট</h2>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredItems.length} টি পোস্ট পাওয়া গেছে</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === "lost" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"}`}>
                      {item.type === "lost" ? "হারিয়েছে" : "পাওয়া গেছে"}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-bold line-clamp-2">{item.desc}</p>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <MapPin size={14} className="text-emerald-500" />
                        {item.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={14} className="text-emerald-500" />
                        {item.date}
                      </div>
                    </div>

                    <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-black text-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                      বিস্তারিত দেখুন <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800">কোনো পোস্ট পাওয়া যায়নি</h3>
              <p className="text-sm font-bold text-slate-400">আপনার ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}
        </section>

        {/* Guidelines & Safety */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-emerald-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform duration-700"></div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <ShieldCheck size={28} className="text-emerald-400" />
              গুরুত্বপূর্ণ নির্দেশনা
            </h3>
            <ul className="space-y-4 text-emerald-100 font-bold text-sm">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>শুধুমাত্র সত্য ও সঠিক তথ্য প্রকাশ করুন।</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>মালিকানা যাচাই ছাড়া কোনো বস্তু গ্রহণ বা হস্তান্তর করবেন না।</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>মূল্যবান জিনিসের ক্ষেত্রে প্রয়োজনে স্থানীয় প্রশাসনের সহায়তা নিন।</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>প্রতারণামূলক বা বিভ্রান্তিকর পোস্ট প্রকাশ করা যাবে না।</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6"
          >
            <h3 className="text-2xl font-black text-slate-800">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h3>
            <div className="space-y-2">
              {[
                { q: "পোস্ট করতে কি অ্যাকাউন্ট লাগবে?", a: "হ্যাঁ, হারানো বা পাওয়া জিনিসের তথ্য পোস্ট করার জন্য আপনার অ্যাকাউন্টে লগইন করতে হবে।" },
                { q: "পোস্ট কতদিন থাকবে?", a: "আপনার পোস্টটি ৩০ দিন পর্যন্ত সক্রিয় থাকবে। এরপর আপনি চাইলে এটি রিনিউ করতে পারবেন।" },
                { q: "জিনিস ফিরে পেলে কী করব?", a: "জিনিস ফিরে পেলে আপনার পোস্টটি 'সমাধান হয়েছে' হিসেবে চিহ্নিত করুন যাতে অন্যরা জানতে পারে।" }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-slate-50 last:border-none">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full py-4 flex items-center justify-between text-left group"
                  >
                    <span className="text-sm font-black text-slate-700 group-hover:text-emerald-600 transition-colors">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${expandedFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 text-xs font-bold text-slate-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Support Section */}
        <section className="bg-emerald-50 rounded-[40px] p-10 text-center space-y-6 border border-emerald-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-600">
            <Phone size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">সহায়তা প্রয়োজন?</h2>
            <p className="text-sm font-bold text-slate-500 max-w-md mx-auto">
              কোনো সমস্যা বা প্রশ্ন থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm font-black text-emerald-700">
              <Mail size={18} /> support@amaderputhia.com
            </div>
            <div className="bg-[#009664] px-8 py-3 rounded-xl text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer">
              সরাসরি কল করুন
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Post Modal Form (Abstracted for brevity) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-800">নতুন পোস্ট করুন</h3>
                  <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">🔘 ধরন নির্বাচন করুন</label>
                    <div className="flex gap-4">
                      <button type="button" className="flex-1 py-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-600 font-black text-sm flex items-center justify-center gap-2">
                        <AlertTriangle size={18} /> হারিয়েছে
                      </button>
                      <button type="button" className="flex-1 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-black text-sm flex items-center justify-center gap-2 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <CheckCircle2 size={18} /> পাওয়া গেছে
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📂 ক্যাটাগরি</label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                        <option>নির্বাচন করুন</option>
                        {CATEGORIES.map(c => <option key={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📝 শিরোনাম</label>
                      <input type="text" placeholder="যেমন: মানিব্যাগ হারিয়েছে" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📄 বিস্তারিত বিবরণ</label>
                    <textarea placeholder="জিনিসটির বর্ণনা দিন..." rows={4} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📍 স্থান</label>
                      <input type="text" placeholder="কোথায় হারিয়েছে/পাওয়া গেছে?" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📅 তারিখ</label>
                      <input type="date" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📞 যোগাযোগের তথ্য</label>
                    <input type="text" placeholder="মোবাইল নম্বর" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button type="button" className="flex-1 py-4.5 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                      <ImageIcon size={20} /> ছবি সংযুক্ত করুন
                    </button>
                    <button type="submit" className="flex-[1.5] py-4.5 rounded-2xl bg-[#009664] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">
                      <Send size={20} /> পোস্ট প্রকাশ করুন
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

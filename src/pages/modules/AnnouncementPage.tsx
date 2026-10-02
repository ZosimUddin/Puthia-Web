import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, Search, Filter, Calendar, MapPin, 
  ChevronDown, Plus, Info, ShieldCheck, Mail, 
  ArrowRight, X, User, Building, Send, 
  ImageIcon, Clock, Bell, Share2, Flag,
  Music, GraduationCap, Sprout, Heart, 
  Users, Trash2, HelpCircle, LayoutGrid
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { UnifiedHeroHeader } from "../../components/common/UnifiedDesignSystem";
import SEO from "../../components/SEO";

// Categories Data
const CATEGORIES = [
  { id: "culture", label: "সামাজিক ও সাংস্কৃতিক", icon: Music, color: "bg-pink-50 text-pink-600" },
  { id: "religion", label: "ধর্মীয় অনুষ্ঠান", icon: Heart, color: "bg-amber-50 text-amber-600" },
  { id: "education", label: "শিক্ষা প্রতিষ্ঠান", icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
  { id: "volunteer", label: "স্বেচ্ছাসেবী কার্যক্রম", icon: Users, color: "bg-emerald-50 text-emerald-600" },
  { id: "environment", label: "পরিচ্ছন্নতা ও বৃক্ষরোপণ", icon: Sprout, color: "bg-green-50 text-green-600" },
  { id: "blood", label: "রক্তদান কর্মসূচি", icon: Heart, color: "bg-rose-50 text-rose-600" },
  { id: "awareness", label: "জনসচেতনতা", icon: Bell, color: "bg-indigo-50 text-indigo-600" },
  { id: "meeting", label: "কমিউনিটি সভা", icon: Users, color: "bg-slate-50 text-slate-600" }
];

// Areas/Unions of Puthia
const AREAS = [
  "পুঠিয়া সদর", "বানেশ্বর", "বেলপুকুর", "ভালুকগাছি", "জিলপাড়া", "শিলমাড়িয়া"
];

// Mock Announcements
const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "পুঠিয়া রাজবাড়িতে আগামী শুক্রবার বিশাল সাংস্কৃতিক সন্ধ্যা",
    desc: "পুঠিয়া সাংস্কৃতিক পরিষদের উদ্যোগে রাজবাড়ি প্রাঙ্গণে এক বর্ণাঢ্য সাংস্কৃতিক অনুষ্ঠানের আয়োজন করা হয়েছে। স্থানীয় শিল্পীদের পাশাপাশি আমন্ত্রিত অতিথি শিল্পীরাও উপস্থিত থাকবেন।",
    date: "২১ জুলাই ২০২৬",
    time: "সন্ধ্যা ৬:০০ টা",
    location: "পুঠিয়া রাজবাড়ি প্রাঙ্গণ",
    category: "culture",
    publisher: "সাংস্কৃতিক পরিষদ, পুঠিয়া",
    pinned: true,
    isUpcoming: true,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    title: "বিনামূল্যে রক্তদান ও স্বাস্থ্য পরীক্ষা কর্মসূচি",
    desc: "বানেশ্বর বাজারের ডিজিটাল ক্লিনিকের সহযোগিতায় আগামী রবিবার একটি ফ্রি মেডিকেল ক্যাম্প এবং রক্তদান কর্মসূচি পরিচালিত হবে।",
    date: "২৩ জুলাই ২০২৬",
    time: "সকাল ১০:০০ টা - বিকাল ৪:০০ টা",
    location: "বানেশ্বর বাজার মাদ্রাসা মাঠ",
    category: "blood",
    publisher: "সেবা ফাউন্ডেশন",
    pinned: false,
    isUpcoming: true,
    image: "https://images.unsplash.com/photo-1615461066841-6116ecaabb04?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    title: "বর্ষা মৌসুমে বৃক্ষরোপণ অভিযান - পুঠিয়া মডেল স্কুল",
    desc: "সবুজ পুঠিয়া গড়ার লক্ষ্যে পুঠিয়া মডেল হাই স্কুলের উদ্যোগে আগামী সোমবার ৫০০টি ফলদ ও বনজ বৃক্ষরোপণ করা হবে। আগ্রহী ছাত্রছাত্রী ও নাগরিকদের অংশগ্রহণের জন্য অনুরোধ করা হচ্ছে।",
    date: "২৪ জুলাই ২০২৬",
    time: "সকাল ৯:০০ টা",
    location: "পুঠিয়া মডেল হাই স্কুল চত্বর",
    category: "environment",
    publisher: "মডেল স্কুল ম্যানেজিং কমিটি",
    pinned: false,
    isUpcoming: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=600"
  }
];

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeArea, setActiveArea] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredAnnouncements = useMemo(() => {
    return MOCK_ANNOUNCEMENTS.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.publisher.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || a.category === activeCategory;
      const matchesArea = activeArea === "all" || a.location.includes(activeArea);
      return matchesSearch && matchesCategory && matchesArea;
    });
  }, [searchQuery, activeCategory, activeArea]);

  const pinnedAnnouncement = MOCK_ANNOUNCEMENTS.find(a => a.pinned);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <SEO 
        title="কমিউনিটি নোটিশ ও ঘোষণা - আমাদের পুঠিয়া"
        description="পুঠিয়া উপজেলার সামাজিক, সাংস্কৃতিক, শিক্ষামূলক ও ধর্মীয় গুরুত্বপূর্ণ নোটিশ ও ঘোষণা।"
      />

      <Header />

      {/* Full-width Unified Hero Header */}
      <UnifiedHeroHeader
        title="কমিউনিটি ঘোষণা"
        subtitle='পুঠিয়া উপজেলার বিভিন্ন সামাজিক, সাংস্কৃতিক, শিক্ষামূলক ও ধর্মীয় গুরুত্বপূর্ণ নোটিশ ও ঘোষণা জানুন।'
        badgeText="কমিউনিটি নোটিশ বোর্ড"
        icon={<Megaphone size={24} />}
        showBack={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="ঘোষণা খুঁজুন..."
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-[#006a4e] text-xs font-black rounded-xl flex items-center gap-1 shadow-md border-none cursor-pointer transition-all active:scale-95"
            >
              <Plus size={15} className="text-[#006a4e] stroke-[2.5]" />
              <span>নতুন ঘোষণা</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("লিংক শেয়ারের জন্য কপি করা হয়েছে!");
              }}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center border border-white/20 cursor-pointer transition-all active:scale-95"
              aria-label="Share"
            >
              <Share2 size={16} />
            </button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-40 space-y-16 relative z-10">
        
        {/* Important/Pinned Announcement */}
        {pinnedAnnouncement && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#009664] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  <Bell size={12} className="animate-bounce" /> আজকের গুরুত্বপূর্ণ ঘোষণা
                </div>
                <h2 className="text-2xl md:text-4xl font-black leading-tight">{pinnedAnnouncement.title}</h2>
                <p className="text-emerald-50 font-bold leading-relaxed line-clamp-3">{pinnedAnnouncement.desc}</p>
                
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Calendar size={18} className="text-emerald-300" />
                    {pinnedAnnouncement.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <MapPin size={18} className="text-emerald-300" />
                    {pinnedAnnouncement.location}
                  </div>
                </div>

                <button className="bg-white text-emerald-800 px-8 py-3.5 rounded-xl font-black text-sm shadow-lg hover:bg-emerald-50 transition-all active:scale-95 flex items-center gap-2">
                  বিস্তারিত দেখুন <ArrowRight size={18} />
                </button>
              </div>
              <div className="w-full md:w-1/3 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                <img src={pinnedAnnouncement.image} className="w-full h-full object-cover" alt="pinned announcement" />
              </div>
            </div>
          </motion.section>
        )}

        {/* Search & Filter Section */}
        <section className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ঘোষণা খুঁজুন... (যেমন: অনুষ্ঠান, মেলা, রক্তদান)" 
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 rounded-2xl py-4 pl-14 pr-6 text-slate-800 font-bold border border-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative flex-1 lg:w-48">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={activeArea || ""}
                  onChange={(e) => setActiveArea(e.target.value)}
                  className="w-full bg-slate-50 rounded-2xl py-4 pl-12 pr-6 text-slate-800 font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  <option value="all">সব এলাকা</option>
                  {AREAS.map(area => <option key={area} value={area || ""}>{area}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              সব বিভাগ
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

        {/* Latest Announcements Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800">সর্বশেষ ঘোষণা</h2>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredAnnouncements.length} টি পাওয়া গেছে</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredAnnouncements.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-md shadow-sm ${CATEGORIES.find(c => c.id === item.category)?.color}`}>
                        {CATEGORIES.find(c => c.id === item.category)?.label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-6 flex-grow flex flex-col">
                    <div className="space-y-2">
                      <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-500 font-bold line-clamp-2 leading-relaxed">{item.desc}</p>
                    </div>
                    
                    <div className="space-y-3 mt-auto">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                          <Calendar size={14} className="text-emerald-500" />
                          {item.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                          <Clock size={14} className="text-emerald-500" />
                          {item.time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pl-1">
                        <MapPin size={14} className="text-rose-500" />
                        {item.location}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 pl-1 pt-2 border-t border-slate-50">
                        <User size={12} />
                        {item.publisher}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                        বিস্তারিত <ArrowRight size={14} />
                      </button>
                      <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Megaphone size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800">কোনো ঘোষণা পাওয়া যায়নি</h3>
              <p className="text-sm font-bold text-slate-400">আপনার ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          )}
        </section>

        {/* Guidelines & FAQ Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Guidelines */}
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
            <ul className="space-y-5 text-emerald-100 font-bold text-sm">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>শুধুমাত্র জনস্বার্থসংশ্লিষ্ট ঘোষণা প্রকাশ করুন।</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>মিথ্যা, বিভ্রান্তিকর বা ব্যক্তিগত প্রচারণামূলক ঘোষণা গ্রহণযোগ্য নয়।</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>রাজনৈতিক, উসকানিমূলক বা আইনবিরোধী কনটেন্ট প্রকাশ করা যাবে না।</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>সকল ঘোষণা প্রকাশের আগে মডারেশন টিম দ্বারা যাচাই করা হবে।</span>
              </li>
            </ul>
          </motion.div>

          {/* FAQ */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-slate-800">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h3>
            <div className="space-y-1">
              {[
                { q: "কে ঘোষণা প্রকাশ করতে পারবেন?", a: "নিবন্ধিত ব্যবহারকারী, সামাজিক সংগঠন, শিক্ষা প্রতিষ্ঠান বা অনুমোদিত কর্তৃপক্ষ পুঠিয়া ডিজিটাল সেবার মাধ্যমে ঘোষণা প্রকাশ করতে পারবেন।" },
                { q: "ঘোষণা কত সময়ে প্রকাশ হবে?", a: "আপনার ঘোষণার আবেদনটি আমাদের টিম যাচাই করবে। সাধারণত ১-৩ ঘণ্টার মধ্যে যাচাই সম্পন্ন হয়ে প্রকাশ করা হয়।" },
                { q: "ভুল ঘোষণা দেখলে কী করব?", a: "যদি কোনো ঘোষণায় ভুল তথ্য দেখেন, তবে 'রিপোর্ট' অপশন ব্যবহার করুন অথবা সরাসরি আমাদের সাথে যোগাযোগ করুন।" }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-slate-50 last:border-none">
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full py-4.5 flex items-center justify-between text-left group"
                  >
                    <span className="text-sm font-black text-slate-700 group-hover:text-emerald-600 transition-colors">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${expandedFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-xs font-bold text-slate-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact/Support */}
        <section className="bg-emerald-50 rounded-[40px] p-10 md:p-16 text-center space-y-8 border border-emerald-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-600">
            <HelpCircle size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">কোনো প্রশ্ন বা সহায়তার প্রয়োজন?</h2>
            <p className="text-sm md:text-base font-bold text-slate-500 max-w-2xl mx-auto">
              কমিউনিটি ঘোষণা সম্পর্কে কোনো প্রশ্ন থাকলে সরাসরি আমাদের সাথে যোগাযোগ করুন। আমরা আপনাকে সাহায্য করতে প্রস্তুত।
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="bg-white px-8 py-4 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm font-black text-emerald-700">
              <Mail size={18} /> support@amaderputhia.com
            </div>
            <button className="bg-[#009664] px-10 py-4 rounded-xl text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">
              অভিযোগ ও পরামর্শ
            </button>
          </div>
        </section>

      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />

      {/* New Announcement Form Modal */}
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
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                      <Megaphone size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">নতুন ঘোষণা প্রকাশ</h3>
                  </div>
                  <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">👤 প্রকাশকারীর নাম</label>
                      <input type="text" placeholder="আপনার নাম" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">🏢 সংগঠন (যদি থাকে)</label>
                      <input type="text" placeholder="সংগঠনের নাম" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📂 বিভাগ</label>
                      <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                        <option>নির্বাচন করুন</option>
                        {CATEGORIES.map(c => <option key={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📝 শিরোনাম</label>
                      <input type="text" placeholder="ঘোষণার মূল বিষয়" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📄 বিস্তারিত বিবরণ</label>
                    <textarea placeholder="ঘোষণার বিস্তারিত বিবরণ দিন..." rows={4} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📍 স্থান</label>
                      <input type="text" placeholder="অনুষ্ঠান বা ঘোষণার স্থান" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📅 তারিখ ও সময়</label>
                      <input type="text" placeholder="যেমন: ২১ জুলাই, বিকাল ৪টা" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">📞 যোগাযোগের তথ্য</label>
                    <input type="text" placeholder="মোবাইল নম্বর" className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <Info size={18} className="text-amber-600 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                      আপনার ঘোষণাটি প্রশাসনিক যাচাইয়ের পর ওয়েবসাইটে প্রকাশ করা হবে। সঠিক তথ্য প্রদান নিশ্চিত করুন।
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <button type="button" className="flex-1 py-4.5 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                      <ImageIcon size={20} /> পোস্টার সংযুক্ত করুন
                    </button>
                    <button type="submit" className="flex-[1.5] py-4.5 rounded-2xl bg-[#009664] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">
                      <Send size={20} /> প্রকাশের জন্য জমা দিন
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

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldCheck, FileText, PhoneCall, MapPin, 
  Clock, Loader2, ArrowRight, Globe, MessageCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';
import { Search } from 'lucide-react';

const DEFAULT_INSURANCE = [
  {
    id: "i1",
    name: "জীবন বীমা কর্পোরেশন",
    branch: "পুঠিয়া শাখা",
    category: "life",
    type: "govt",
    address: "পুঠিয়া বাজার, পুঠিয়া সদর",
    phone: "01700-000001",
    schedule: "সকাল ১০:০০ - বিকাল ০৪:০০",
    desc: "রাষ্ট্রীয় মালিকানাধীন জীবন বীমা সেবা প্রদানকারী প্রতিষ্ঠান।",
    bgColor: "from-blue-500 to-indigo-600",
    services: ["মেয়াদী বীমা", "পেনশন বীমা"],
    website: "https://jbc.gov.bd"
  },
  {
    id: "i2",
    name: "ডেল্টা লাইফ ইন্স্যুরেন্স",
    branch: "পুঠিয়া শাখা",
    category: "life",
    type: "private",
    address: "বানেশ্বর বাজার, পুঠিয়া",
    phone: "01700-000002",
    schedule: "সকাল ১০:০০ - বিকাল ০৪:০০",
    desc: "বেসরকারি খাতে জনপ্রিয় জীবন বীমা প্রতিষ্ঠান।",
    bgColor: "from-emerald-500 to-green-600",
    services: ["চাইল্ড প্রোটেকশন", "স্বাস্থ্য বীমা"],
    website: "https://deltalife.org"
  }
];

export const InsuranceServices: React.FC<{ onGoBack?: () => void }> = ({ onGoBack }) => {
  const [insurance, setInsurance] = useState<any[]>(DEFAULT_INSURANCE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedInsurance, setSelectedInsurance] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "insurance_companies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data(), isUserPost: true });
      });
      setInsurance([...list, ...DEFAULT_INSURANCE]);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading insurance:", error);
      setInsurance(DEFAULT_INSURANCE);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredInsurance = insurance.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "all") return true;
    return item.category === activeFilter;
  });

  return (
    <div className="font-sans space-y-6 pb-12 animate-fade-in text-left">
      <AnimatePresence mode="wait">
        {selectedInsurance ? (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-3xl border shadow-sm space-y-6"
          >
            <button onClick={() => setSelectedInsurance(null)} className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> ফিরে যান
            </button>
            <h2 className="text-2xl font-black">{selectedInsurance.name}</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">{selectedInsurance.desc}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">শাখা</p>
                  <p className="text-sm font-black">{selectedInsurance.branch}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase">সময়</p>
                  <p className="text-sm font-black">{selectedInsurance.schedule}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-teal-600" /> {selectedInsurance.address}</p>
                <p className="flex items-center gap-2 text-sm"><PhoneCall className="w-4 h-4 text-teal-600" /> {selectedInsurance.phone}</p>
              </div>
              {selectedInsurance.services && (
                <div>
                  <h4 className="font-black text-sm mb-2">সেবা:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInsurance.services.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-2xl font-black text-sm">
                  <PhoneCall className="w-4 h-4" /> কল করুন
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-teal-600 text-teal-700 rounded-2xl font-black text-sm">
                  <Globe className="w-4 h-4" /> ওয়েবসাইট
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <UnifiedHeroHeader
              title="বীমা সেবা"
              subtitle="আপনার ভবিষ্যৎ সুরক্ষায় নির্ভরযোগ্য বীমা প্রতিষ্ঠান ও তথ্য নির্দেশিকা।"
              showBack={!!onGoBack}
              onBack={onGoBack}
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
              searchPlaceholder="বীমা প্রতিষ্ঠান বা তথ্য খুঁজুন..."
              className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
            />

            {/* Quick Categories */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-800">ক্যাটাগরি</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "life", label: "❤️ জীবন" },
                  { id: "health", label: "🏥 স্বাস্থ্য" },
                  { id: "vehicle", label: "🚗 যানবাহন" },
                  { id: "property", label: "🏠 সম্পত্তি" },
                  { id: "agri", label: "🌾 কৃষি" },
                  { id: "business", label: "💼 ব্যবসা" },
                ].map((cat) => (
                  <button key={cat.id} onClick={() => setActiveFilter(cat.id)} className="flex flex-col items-center justify-center p-4 bg-white border rounded-3xl text-xs font-bold shadow-sm">
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? <Loader2 className="w-10 h-10 animate-spin text-teal-600" /> : filteredInsurance.map((item) => (
                <motion.div key={item.id} className="bg-white rounded-3xl border p-5 shadow-sm space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.bgColor} flex items-center justify-center text-white`}>
                    <ShieldCheck />
                  </div>
                  <h3 className="text-lg font-black">{item.name}</h3>
                  <p className="text-xs font-medium text-slate-500">{item.address}</p>
                  <button onClick={() => setSelectedInsurance(item)} className="w-full py-3 rounded-2xl bg-teal-50 text-teal-700 font-black text-xs">বিস্তারিত দেখুন</button>
                </motion.div>
              ))}
            </div>
            
            {/* Online Services & Information (Static Mockup sections for now) */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <h3 className="font-black">অনলাইন সেবা</h3>
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl text-sm font-bold">
                বীমার জন্য আবেদন <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl text-sm font-bold">
                ক্লেইম আবেদন <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

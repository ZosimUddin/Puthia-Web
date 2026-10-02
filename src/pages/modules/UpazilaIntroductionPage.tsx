import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Users, Ruler, Building, Wheat, Info, 
  BookOpen, HeartPulse, Landmark, 
  Camera, Briefcase, ImageIcon, Video, ArrowLeft, ChevronDown, ChevronUp,
  History as HistoryIcon, Navigation, Phone, Download, Share2, Link as LinkIcon, ExternalLink, MessageCircle, Map as MapIcon, Facebook, Link2, ShieldAlert,
  Sparkles, Search, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { UnifiedHeroHeader } from '../../components/common/UnifiedDesignSystem';

const PUTHIA_STATS = [
  { icon: <MapPin size={24} />, label: "অবস্থান", value: "রাজশাহী" },
  { icon: <Users size={24} />, label: "জনসংখ্যা", value: "২,০৭,৪৯০+" },
  { icon: <Ruler size={24} />, label: "আয়তন", value: "১৯২.৬৪ কিমি²" },
  { icon: <Building size={24} />, label: "ইউনিয়ন সংখ্যা", value: "৬টি" },
  { icon: <Wheat size={24} />, label: "প্রধান ফসল", value: "ধান, গম, ভুট্টা" },
  { icon: <MapIcon size={24} />, label: "মানচিত্র", value: "দেখুন" },
];

const UpazilaIntroductionPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [data, setData] = useState<any>({});
  const [imgError, setImgError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        const collections = ['upazila_info', 'history', 'administration', 'tourist_places', 'gallery', 'videos', 'health', 'education', 'agriculture', 'emergency_contacts', 'downloads', 'faq'];
        const newData: any = {};
        for (const colName of collections) {
            try {
                const querySnapshot = await getDocs(collection(db, colName));
                newData[colName] = querySnapshot.docs.map(doc => doc.data());
            } catch (error) {
                console.error(`Error loading ${colName}`);
            }
        }
        setData(newData);
    };
    fetchData();
  }, []);

  // Search filtering logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{ category: string; title: string; desc?: string; type: string }> = [];

    // 1. Stats
    PUTHIA_STATS.forEach(stat => {
      if (stat.label.toLowerCase().includes(query) || stat.value.toLowerCase().includes(query)) {
        results.push({ category: "পরিসংখ্যান", title: stat.label, desc: stat.value, type: "stat" });
      }
    });

    // 2. History
    const historyText = "পুঠিয়া বাংলাদেশের অন্যতম প্রাচীন জমিদার পরিবারের স্মৃতিবিজড়িত স্থান। পুঠিয়া রাজবংশ রাজশাহীর প্রাচীনতম রাজবংশগুলোর একটি। এখানে রয়েছে অপূর্ব স্থাপত্যশৈলীর নিদর্শন অসংখ্য মঠ ও মন্দির।";
    if (historyText.toLowerCase().includes(query)) {
      results.push({ category: "ইতিহাস ও ঐতিহ্য", title: "ইতিহাস ও ঐতিহ্য", desc: historyText, type: "history" });
    }
    if ("জমিদার পরিবার".toLowerCase().includes(query) || "পুঠিয়া জমিদার বাড়ি মুঘল সম্রাট আকবরের আমলে প্রতিষ্ঠিত হয়। এই জমিদাররা রাজশাহী অঞ্চলে শিক্ষা ও সংস্কৃতির প্রসারে গুরুত্বপূর্ণ ভূমিকা রাখেন।".toLowerCase().includes(query)) {
      results.push({ category: "ইতিহাস - জমিদার পরিবার", title: "জমিদার পরিবার", desc: "পুঠিয়া জমিদার বাড়ি মুঘল সম্রাট আকবরের আমলে প্রতিষ্ঠিত হয়। এই জমিদাররা রাজশাহী অঞ্চলে শিক্ষা ও সংস্কৃতির প্রসারে গুরুত্বপূর্ণ ভূমিকা রাখেন।", type: "history" });
    }
    if ("গুরুত্বপূর্ণ ঘটনা".toLowerCase().includes(query) || "১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী কর্তৃক পুঠিয়া রাজবাড়ি নির্মিত হয়। ১৯৭১ সালে মুক্তিযুদ্ধে পুঠিয়ার বীর সন্তানেরা অসামান্য অবদান রাখেন।".toLowerCase().includes(query)) {
      results.push({ category: "ইতিহাস - গুরুত্বপূর্ণ ঘটনা", title: "গুরুত্বপূর্ণ ঘটনা", desc: "১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী কর্তৃক পুঠিয়া রাজবাড়ি নির্মিত হয়। ১৯৭১ সালে মুক্তিযুদ্ধে পুঠিয়ার বীর সন্তানেরা অসামান্য অবদান রাখেন।", type: "history" });
    }

    // 3. Admin Info
    const adminItems = [
      { label: "উপজেলা নির্বাহী কর্মকর্তা (UNO)", value: "উপজেলা পরিষদ কার্যালয়" },
      { label: "উপজেলা চেয়ারম্যান", value: "উপজেলা পরিষদ" },
      { label: "থানার তথ্য", value: "পুঠিয়া থানা, রাজশাহী" },
      { label: "ডাকঘর", value: "পুঠিয়া (৬২৮০)" },
      { label: "পৌরসভা", value: "১টি (পুঠিয়া পৌরসভা)" },
      { label: "ইউনিয়ন", value: "৬টি (পুঠিয়া, বেলপুকুর, বানেশ্বর, ভালুকগাছী, শিলমাড়িয়া, জিউপাড়া)" },
    ];
    adminItems.forEach(item => {
      if (item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)) {
        results.push({ category: "প্রশাসনিক তথ্য", title: item.label, desc: item.value, type: "admin" });
      }
    });

    // 4. Sightseeing places
    const sightseeing = [
      { name: "পুঠিয়া রাজবাড়ি", desc: "ঐতিহাসিক পুঠিয়া রাজবাড়ি বা মহারানী হেমন্তকুমারী দেবীর প্রাসাদ।" },
      { name: "গোবিন্দ মন্দির", desc: "টেরাকোটা কারুকার্য খচিত ঐতিহাসিক গোবিন্দ মন্দির।" },
      { name: "শিব মন্দির", desc: "বাংলাদেশের অন্যতম বৃহৎ শিব মন্দির স্থাপত্য।" },
      { name: "জগন্নাথ মন্দির", desc: "ঐতিহাসিক রথ মন্দির বা জগন্নাথ মন্দির।" },
    ];
    sightseeing.forEach(site => {
      if (site.name.toLowerCase().includes(query) || site.desc.toLowerCase().includes(query)) {
        results.push({ category: "দর্শনীয় স্থান", title: site.name, desc: site.desc, type: "tourist" });
      }
    });

    // 5. Education
    const education = [
      "পুঠিয়া পি.এন. সরকারি মডেল উচ্চ বিদ্যালয়",
      "বানেশ্বর সরকারি কলেজ",
      "পুঠিয়া সরকারি বালিকা উচ্চ বিদ্যালয়",
      "শিলমাড়িয়া داখিল মাদ্রাসা"
    ];
    education.forEach(edu => {
      if (edu.toLowerCase().includes(query)) {
        results.push({ category: "শিক্ষা প্রতিষ্ঠান", title: edu, type: "education" });
      }
    });

    // 6. Health
    const health = [
      "উপজেলা স্বাস্থ্য কমপ্লেক্স (৫০ শয্যা)",
      "ইউনিয়ন স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র",
      "প্রাইভেট ক্লিনিক ও ডায়াগনস্টিক সেন্টার",
      "জরুরি অ্যাম্বুলেন্স সেবা"
    ];
    health.forEach(h => {
      if (h.toLowerCase().includes(query)) {
        results.push({ category: "স্বাস্থ্যসেবা", title: h, type: "health" });
      }
    });

    // 7. Economy
    const economy = [
      { label: "বানেশ্বর হাট", desc: "উত্তরাঞ্চলের অন্যতম বৃহৎ আমের বাজার" },
      { label: "প্রধান ফসল", desc: "ধান, গম, আম, কাঁঠাল, পেঁপে" },
      { label: "ক্ষুদ্র ও কুটির শিল্প", desc: "তাঁত, মৃৎশিল্প ও অন্যান্য কুটির শিল্প" }
    ];
    economy.forEach(item => {
      if (item.label.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)) {
        results.push({ category: "অর্থনীতি ও কৃষি", title: item.label, desc: item.desc, type: "economy" });
      }
    });

    // 8. Emergency Contacts
    const contacts = [
      { label: "পুলিশ (থানা)", num: "01320-112233" },
      { label: "ফায়ার সার্ভিস", num: "017XX-XXXXXX" },
      { label: "হাসপাতাল", num: "017XX-XXXXXX" },
      { label: "উপজেলা অফিস", num: "017XX-XXXXXX" },
    ];
    contacts.forEach(contact => {
      if (contact.label.toLowerCase().includes(query) || contact.num.toLowerCase().includes(query)) {
        results.push({ category: "জরুরি যোগাযোগ নম্বর", title: contact.label, desc: contact.num, type: "contact" });
      }
    });

    // 9. FAQ
    const faqs = [
      { q: "পুঠিয়া উপজেলা কোথায় অবস্থিত?", a: "রাজশাহী জেলা সদর হতে ৩২ কি.মি. পূর্বে ঢাকা-রাজশাহী মহাসড়কের পাশে অবস্থিত।" },
      { q: "পুঠিয়ার বিখ্যাত খাবার কী?", a: "বানেশ্বরের আম এবং স্থানীয় বিভিন্ন মিষ্টান্ন বিখ্যাত।" },
      { q: "উপজেলা স্বাস্থ্য কমপ্লেক্সে কি জরুরি সেবা পাওয়া যায়?", a: "হ্যাঁ, ২৪ ঘণ্টা জরুরি সেবা চালু থাকে।" }
    ];
    faqs.forEach(faq => {
      if (faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)) {
        results.push({ category: "সাধারণ প্রশ্নোত্তর", title: faq.q, desc: faq.a, type: "faq" });
      }
    });

    return results;
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex-1 relative">
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-emerald-50/20 pb-36 relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          {/* Unified Hero Header */}
          <UnifiedHeroHeader
            title="উপজেলা পরিচিতি"
            subtitle="ঐতিহ্য ও আধুনিকতার এক অপূর্ব সমন্বয়"
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
            searchPlaceholder="উপজেলা পরিচিতি খুঁজুন... (যেমন: রাজবাড়ি, বানেশ্বর, ফসল)"
          />

          <div className="max-w-4xl mx-auto px-4 py-2 space-y-6 relative z-10">
            {searchQuery.trim() !== "" ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    <Search size={20} className="text-emerald-600" />
                    <span>অনুসন্ধানের ফলাফল ({searchResults.length})</span>
                  </h3>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline"
                  >
                    ফলাফল পরিষ্কার করুন
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all animate-fadeIn"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/50">
                            {result.category}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-800 text-sm mb-1">{result.title}</h4>
                        {result.desc && (
                          <p className="text-xs font-medium text-slate-600 leading-relaxed">{result.desc}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 border border-emerald-100 shadow-sm text-center">
                    <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-700 mb-1">কোনো ফলাফল পাওয়া যায়নি</p>
                    <p className="text-xs font-medium text-slate-500">অন্য কোনো শব্দ দিয়ে পুনরায় চেষ্টা করুন।</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <>

        {/* 2. সংক্ষিপ্ত পরিচিতি */}
        <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-3">
            <span className="bg-emerald-50 p-2.5 rounded-full text-emerald-600 shadow-sm border border-emerald-100/50"><Info size={20} strokeWidth={2.5}/></span> 
            সংক্ষিপ্ত পরিচিতি
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium text-gray-700 leading-relaxed">
            <div className="space-y-4">
              <p><strong className="text-emerald-900">উপজেলার ইতিহাস:</strong> পুঠিয়া রাজশাহী জেলার একটি অত্যন্ত প্রাচীন ও ঐতিহ্যবাহী উপজেলা। ১৬শ শতকে মুঘল আমলে এর গোড়াপত্তন ঘটে।</p>
              <p><strong className="text-emerald-900">প্রতিষ্ঠাকাল:</strong> পুঠিয়া থানা গঠিত হয় ১৮৬৯ সালে এবং উপজেলা হিসেবে আত্মপ্রকাশ করে ১৫ এপ্রিল ১৯৮৪ সালে।</p>
            </div>
            <div className="space-y-4">
              <p><strong className="text-emerald-900">অবস্থান:</strong> রাজশাহী সদর হতে ৩২ কি.মি. পূর্বে ঢাকা-রাজশাহী মহাসড়কের পাশে অবস্থিত।</p>
              <p><strong className="text-emerald-900">মোট আয়তন:</strong> ১৯২.৬৪ বর্গ কিলোমিটার।</p>
              <p><strong className="text-emerald-900">জনসংখ্যা:</strong> প্রায় ২,০৭,৪৯০ জন (২০১১ সালের আদমশুমারি অনুযায়ী)।</p>
            </div>
          </div>
        </motion.section>

        {/* 3. Quick Information Cards */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PUTHIA_STATS.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center text-center hover:border-emerald-300 transition-colors group cursor-pointer">
              <div className="text-emerald-600 mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="font-black text-emerald-950 text-base">{stat.value}</div>
            </div>
          ))}
        </motion.section>

        {/* 4. ইতিহাস */}
        <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-black text-emerald-950 mb-4 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><HistoryIcon size={24}/></span> 
                ইতিহাস ও ঐতিহ্য
            </h3>
            <p className="text-sm font-medium text-gray-700 leading-relaxed mb-4">
                পুঠিয়া বাংলাদেশের অন্যতম প্রাচীন জমিদার পরিবারের স্মৃতিবিজড়িত স্থান। পুঠিয়া রাজবংশ রাজশাহীর প্রাচীনতম রাজবংশগুলোর একটি। এখানে রয়েছে অপূর্ব স্থাপত্যশৈলীর নিদর্শন অসংখ্য মঠ ও মন্দির।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                     <h4 className="font-bold text-emerald-900 text-sm mb-2">জমিদার পরিবার</h4>
                     <p className="text-xs text-gray-600 leading-relaxed">পুঠিয়া জমিদার বাড়ি মুঘল সম্রাট আকবরের আমলে প্রতিষ্ঠিত হয়। এই জমিদাররা রাজশাহী অঞ্চলে শিক্ষা ও সংস্কৃতির প্রসারে গুরুত্বপূর্ণ ভূমিকা রাখেন।</p>
                 </div>
                 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                     <h4 className="font-bold text-emerald-900 text-sm mb-2">গুরুত্বপূর্ণ ঘটনা</h4>
                     <p className="text-xs text-gray-600 leading-relaxed">১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী কর্তৃক পুঠিয়া রাজবাড়ি নির্মিত হয়। ১৯৭১ সালে মুক্তিযুদ্ধে পুঠিয়ার বীর সন্তানেরা অসামান্য অবদান রাখেন।</p>
                 </div>
            </div>
        </motion.section>

        {/* 5. প্রশাসনিক তথ্য */}
        <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Landmark size={24}/></span> 
                প্রশাসনিক তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: "উপজেলা নির্বাহী কর্মকর্তা (UNO)", value: "উপজেলা পরিষদ কার্যালয়" },
                    { label: "উপজেলা চেয়ারম্যান", value: "উপজেলা পরিষদ" },
                    { label: "থানার তথ্য", value: "পুঠিয়া থানা, রাজশাহী" },
                    { label: "ডাকঘর", value: "পুঠিয়া (৬২৮০)" },
                    { label: "পৌরসভা", value: "১টি (পুঠিয়া পৌরসভা)" },
                    { label: "ইউনিয়ন", value: "৬টি (পুঠিয়া, বেলপুকুর, বানেশ্বর, ভালুকগাছী, শিলমাড়িয়া, জিউপাড়া)" },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 mb-1">{item.label}</span>
                        <span className="text-sm font-black text-emerald-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </motion.section>

        {/* 6. মানচিত্র */}
        <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-black text-emerald-950 mb-4 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><MapIcon size={24}/></span> 
                মানচিত্র ও অবস্থান
            </h3>
            <div className="h-64 bg-gray-200 rounded-2xl overflow-hidden relative group">
                {/* Mock map image for now */}
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" alt="Map" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                     <MapPin size={48} className="text-emerald-400 drop-shadow-lg mb-2" />
                     <button className="bg-white text-emerald-900 px-6 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-emerald-50 transition-colors">
                         <Navigation size={16} /> দিকনির্দেশনা (Directions)
                     </button>
                </div>
            </div>
        </motion.section>

        {/* 7. দর্শনীয় স্থান */}
        <motion.section variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-black text-emerald-950 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Camera size={24}/></span> 
                দর্শনীয় স্থান
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                    { name: "পুঠিয়া রাজবাড়ি", img: "https://images.unsplash.com/photo-1599661046289-e3188768a417?auto=format&fit=crop&q=80&w=600" },
                    { name: "গোবিন্দ মন্দির", img: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&q=80&w=600" },
                    { name: "শিব মন্দির", img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab4?auto=format&fit=crop&q=80&w=600" },
                    { name: "জগন্নাথ মন্দির", img: "https://images.unsplash.com/photo-1600100397608-f010f41cb839?auto=format&fit=crop&q=80&w=600" },
                ].map((site, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 group">
                        <div className="h-40 overflow-hidden relative">
                            <img src={site.img} alt={site.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <h4 className="text-lg font-black text-white">{site.name}</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>

        {/* 8, 9, 10. Education, Health, Economy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.section variants={itemVariants} className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                    <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-black text-indigo-950 mb-3">শিক্ষা</h3>
                <ul className="space-y-2 text-sm font-medium text-indigo-900/80">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/> পুঠিয়া পি.এন. সরকারি মডেল উচ্চ বিদ্যালয়</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/> বানেশ্বর সরকারি কলেজ</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/> পুঠিয়া সরকারি বালিকা উচ্চ বিদ্যালয়</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"/> শিলমাড়িয়া দাখিল মাদ্রাসা</li>
                </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
                    <HeartPulse size={24} />
                </div>
                <h3 className="text-lg font-black text-rose-950 mb-3">স্বাস্থ্যসেবা</h3>
                <ul className="space-y-2 text-sm font-medium text-rose-900/80">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"/> উপজেলা স্বাস্থ্য কমপ্লেক্স (৫০ শয্যা)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"/> ইউনিয়ন স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"/> প্রাইভেট ক্লিনিক ও ডায়াগনস্টিক সেন্টার</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"/> জরুরি অ্যাম্বুলেন্স সেবা</li>
                </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
                    <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-black text-amber-950 mb-3">অর্থনীতি ও কৃষি</h3>
                <ul className="space-y-2 text-sm font-medium text-amber-900/80">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> বানেশ্বর হাট (উত্তরাঞ্চলের অন্যতম বৃহৎ আমের বাজার)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> প্রধান ফসল: ধান, গম, আম, কাঁঠাল, পেঁপে</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"/> ক্ষুদ্র ও কুটির শিল্প</li>
                </ul>
            </motion.section>
        </div>

        {/* 11. গুরুত্বপূর্ণ নম্বর */}
        <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Phone size={24}/></span> 
                জরুরি যোগাযোগ নম্বর
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "পুলিশ (থানা)", num: "01320-112233", icon: <ShieldAlert/>, color: "text-blue-600" },
                    { label: "ফায়ার সার্ভিস", num: "017XX-XXXXXX", icon: <Building/>, color: "text-red-600" },
                    { label: "হাসপাতাল", num: "017XX-XXXXXX", icon: <HeartPulse/>, color: "text-rose-600" },
                    { label: "উপজেলা অফিস", num: "017XX-XXXXXX", icon: <Landmark/>, color: "text-emerald-600" },
                ].map((contact, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center gap-2">
                        <div className={`${contact.color}`}>{contact.icon}</div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 mb-1">{contact.label}</div>
                            <div className="text-sm font-black text-gray-900">{contact.num}</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.section>

        {/* 12. Photo Gallery & 13. Video */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.section variants={itemVariants} className="bg-emerald-900 p-6 rounded-3xl shadow-xl text-white">
                <h3 className="text-xl font-black mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-3"><ImageIcon size={24} className="text-emerald-300"/> গ্যালারি</span>
                    <button className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">সব দেখুন</button>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-square bg-emerald-800 rounded-xl overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&q=80&w=200&sig=${i}`} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt="Gallery"/>
                        </div>
                    ))}
                </div>
            </motion.section>
            
            <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <h3 className="text-xl font-black text-emerald-950 mb-4 flex items-center gap-3">
                    <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Video size={24}/></span> 
                    ভিডিও ডকুমেন্টারি
                </h3>
                <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1599661046289-e3188768a417?auto=format&fit=crop&q=80&w=800" alt="Video cover" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-600/30 cursor-pointer hover:bg-red-700 transition-colors">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </motion.section>
        </div>

        {/* 14. FAQ & 15, 16. Links/Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-3">
                <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><MessageCircle size={24}/></span> 
                সাধারণ প্রশ্নোত্তর
              </h3>
              <div className="space-y-4">
                {[
                    { q: "পুঠিয়া উপজেলা কোথায় অবস্থিত?", a: "রাজশাহী জেলা সদর হতে ৩২ কি.মি. পূর্বে ঢাকা-রাজশাহী মহাসড়কের পাশে অবস্থিত।" },
                    { q: "পুঠিয়ার বিখ্যাত খাবার কী?", a: "বানেশ্বরের আম এবং স্থানীয় বিভিন্ন মিষ্টান্ন বিখ্যাত।" },
                    { q: "উপজেলা স্বাস্থ্য কমপ্লেক্সে কি জরুরি সেবা পাওয়া যায়?", a: "হ্যাঁ, ২৪ ঘণ্টা জরুরি সেবা চালু থাকে।" }
                ].map((item: any, i: number) => (
                  <div key={i} className="border border-emerald-50 rounded-2xl overflow-hidden bg-emerald-50/30">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex justify-between items-center w-full font-bold text-sm text-emerald-950 p-4 hover:bg-emerald-50 transition-colors">
                      <span className="text-left pr-4">{item.q}</span>
                      <div className={`p-1 rounded-full bg-white shadow-sm transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                          <ChevronDown size={16} className="text-emerald-600"/>
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="overflow-hidden">
                            <div className="p-4 pt-0 text-sm font-medium text-gray-600 leading-relaxed border-t border-emerald-100/50">
                                {item.a}
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            <div className="space-y-6">
                <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <h3 className="text-xl font-black text-emerald-950 mb-4 flex items-center gap-3">
                        <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><LinkIcon size={24}/></span> 
                        গুরুত্বপূর্ণ লিংক
                    </h3>
                    <ul className="space-y-3">
                        {["রাজশাহী জেলা বাতায়ন", "উপজেলা প্রশাসন, পুঠিয়া", "জাতীয় তথ্য বাতায়ন"].map((ref, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer">
                                <ExternalLink size={14} /> {ref}
                            </li>
                        ))}
                    </ul>
                </motion.section>
                
                <motion.section variants={itemVariants} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
                    <h3 className="text-xl font-black text-emerald-950 mb-4 flex items-center gap-3">
                        <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Download size={24}/></span> 
                        ডাউনলোড সেন্টার
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
                            <span className="flex items-center gap-2"><BookOpen size={16}/> উপজেলা প্রোফাইল (PDF)</span>
                            <Download size={16} className="opacity-50" />
                        </button>
                        <button className="w-full flex items-center justify-between bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
                            <span className="flex items-center gap-2"><MapIcon size={16}/> পুঠিয়ার মানচিত্র (PDF)</span>
                            <Download size={16} className="opacity-50" />
                        </button>
                    </div>
                </motion.section>
            </div>
        </div>

        {/* 17. Share Section */}
        <motion.section variants={itemVariants} className="flex flex-col items-center justify-center gap-4 p-6">
            <h4 className="font-bold text-gray-500 text-sm">এই পেজটি শেয়ার করুন</h4>
            <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm hover:bg-blue-100 hover:scale-110 transition-all">
                    <Facebook size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm hover:bg-green-100 hover:scale-110 transition-all">
                    <Share2 size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shadow-sm hover:bg-gray-200 hover:scale-110 transition-all">
                    <Link2 size={20} />
                </button>
            </div>
        </motion.section>
            </>
          )}
      </div>
    </motion.div>
    <Footer />
    <BottomNavigation activeTab="services" onTabChange={() => {}} />
      </div>
    </div>
  );
};

export default UpazilaIntroductionPage;

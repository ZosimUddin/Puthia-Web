import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Clock, Phone, BookOpen, Heart, Compass, Shield, MapPin, PlusCircle, Trash2, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Mosque {
  id: string;
  name: string;
  type: "historical" | "central" | "local";
  union: string;
  location: string;
  imam: string;
  imamPhone: string;
  capacity: string;
  features: string[];
  history?: string;
}

const MOSQUE_LIST: Mosque[] = [
  {
    id: "m1",
    name: "পুঠিয়া মডেল মসজিদ ও ইসলামিক সাংস্কৃতিক কেন্দ্র",
    type: "central",
    union: "পুঠিয়া সদর",
    location: "উপজেলা সদর, পুঠিয়া",
    imam: "মাওলানা মুফতি আব্দুর রহমান",
    imamPhone: "01712345681",
    capacity: "১২০০ জন",
    features: ["মহিলাদের আলাদা নামাজ কক্ষ", "ইসলামিক লাইব্রেরি", "অজুখানা ও গাড়ি পার্কিং", "শীতাতপ নিয়ন্ত্রিত"],
    history: "মাননীয় প্রধানমন্ত্রী শেখ হাসিনা কর্তৃক দেশব্যাপী নির্মিত দৃষ্টিনন্দন মডেল মসজিদ প্রকল্পের আওতায় পুঠিয়ায় আধুনিক সুযোগ-সুবিধা সম্বলিত এই মসজিদটি নির্মাণ করা হয়।"
  },
  {
    id: "m2",
    name: "পুঠিয়া রাজবাড়ী শাহী জামে মসজিদ",
    type: "historical",
    union: "পুঠিয়া সদর",
    location: "পুঠিয়া রাজবাড়ী লেকের পূর্ব পার্শ্বে",
    imam: "হাফেজ মাওলানা কারী মো: সোলায়মান",
    imamPhone: "01723456892",
    capacity: "৩০০ জন",
    features: ["প্রাচীন টেরাকোটা ও সুরকি নকশা", "ঐতিহাসিক মোগল স্থাপত্য", "এক গম্বুজ বিশিষ্ট"],
    history: "পুঠিয়া রাজপরিবারের তত্ত্বাবধানে মোঘল স্থাপত্য রীতিতে এটি নির্মিত হয়। এক গম্বুজ বিশিষ্ট এই পুঠিয়া শাহী মসজিদটি প্রত্নতত্ত্ব অধিদপ্তরের তালিকাভুক্ত একটি প্রাচীন ঐতিহ্য।"
  },
  {
    id: "m3",
    name: "বানেশ্বর বাজার কেন্দ্রীয় জামে মসজিদ",
    type: "central",
    union: "বানেশ্বর",
    location: "বানেশ্বর বাজার আড়ত রোড",
    imam: "মাওলানা মো: নূরুল ইসলাম",
    imamPhone: "01734567893",
    capacity: "১৫০০ জন",
    features: ["বহুতল বিশিষ্ট ভবন", "বাজারের ব্যবসায়ীদের প্রধান জামাত", "বিশাল অজুখান"],
    history: "উত্তরবঙ্গের অন্যতম বৃহৎ আম ও ফসলের আড়ত বানেশ্বর বাজারের প্রাণকেন্দ্রে অবস্থিত এই মসজিদটি। ব্যবসা ও দূর-দূরান্ত থেকে আসা মানুষের নামাজের প্রধান আশ্রয়স্থল।"
  },
  {
    id: "m4",
    name: "ঝলমলিয়া হাট জামে মসজিদ",
    type: "local",
    union: "জিউপাড়া",
    location: "ঝলমলিয়া বাজার, পুঠিয়া",
    imam: "মাওলানা মো: আব্দুল হালিম",
    imamPhone: "01745678904",
    capacity: "৮০০ জন",
    features: ["মহাসড়ক সংলগ্ন", "মুসাফিরদের নামাজ আদায়ের বিশেষ সুবিধা", "সুপেয় ঠান্ডা পানির ব্যবস্থা"]
  },
  {
    id: "m5",
    name: "শিলমাড়িয়া ইউনিয়ন কেন্দ্রীয় জামে মসজিদ",
    type: "local",
    union: "শিলমাড়িয়া",
    location: "শিলমাড়িয়া বাজার",
    imam: "মাওলানা মো: আশরাফ আলী",
    imamPhone: "01756789015",
    capacity: "৬০০ জন",
    features: ["গ্রামীণ মনোরম পরিবেশ", "মক্তব ও হেফজখানা সংলগ্ন", "যৌথ কবরস্থান পাশে অবস্থিত"]
  },
  {
    id: "m6",
    name: "জিউপাড়া মধ্যপাড়া জামে মসজিদ",
    type: "local",
    union: "জিউপাড়া",
    location: "জিউপাড়া ইউনিয়ন পরিষদ সংলগ্ন",
    imam: "হাফেজ মো: ইব্রাহিম খলিল",
    imamPhone: "01767890126",
    capacity: "৫০০ জন",
    features: ["মসজিদ ভিত্তিক শিশু শিক্ষা কার্যক্রম", "ইসলামিক বইয়ের ছোট সংগ্রহ", "ইফতার আয়োজনের ব্যবস্থা"]
  },
  {
    id: "m7",
    name: "ভালুকগাছী বাজার জুম্মা মসজিদ",
    type: "local",
    union: "ভালুকগাছী",
    location: "ভালুকগাছী বাজার",
    imam: "মাওলানা মো: সাইদুর রহমান",
    imamPhone: "01778901237",
    capacity: "৭০০ জন",
    features: ["বড় বারান্দা ও সুন্দর বাগান", "জুমার নামাজের বড় জমায়েত"]
  }
];

const PRAYER_SCHEDULES = [
  { name: "ফজর", time: "০৪:১৫", jamat: "০৪:৪৫" },
  { name: "জোহর", time: "১২:১৫", jamat: "০১:৩০" },
  { name: "আসর", time: "০৪:১৫", jamat: "০৫:০০" },
  { name: "মাগরিব", time: "০৬:৫২", jamat: "০৭:০০" },
  { name: "ইশা", time: "০৮:১৫", jamat: "০৮:৪৫" },
  { name: "জুমা", time: "১২:১৫", jamat: "০১:৩০" }
];

export function MosqueInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unionFilter, setUnionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"list" | "prayer" | "historical" | "directory">("list");
  
  // DB States
  const [dbMosques, setDbMosques] = useState<Mosque[]>([]);
  
  // Create Mosque form state
  const [showMosqueForm, setShowMosqueForm] = useState(false);
  const [mName, setMName] = useState("");
  const [mType, setMType] = useState<"historical" | "central" | "local">("local");
  const [mUnion, setMUnion] = useState("পুঠিয়া সদর");
  const [mLocation, setMLocation] = useState("");
  const [mImam, setMImam] = useState("");
  const [mImamPhone, setMImamPhone] = useState("");
  const [mCapacity, setMCapacity] = useState("");
  const [mFeatures, setMFeatures] = useState("");
  const [mHistory, setMHistory] = useState("");
  const [mosqueSubmitSuccess, setMosqueSubmitSuccess] = useState(false);

  // Fetch from DB
  useEffect(() => {
    const q = query(collection(db, "mosque_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Mosque[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Mosque);
      });
      setDbMosques(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "mosque_posts");
    });
    return () => unsubscribe();
  }, []);

  const handleCreateMosque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mLocation || !mImam || !mImamPhone) {
      alert("দয়া করে নাম, অবস্থান, ইমাম ও ইমামের মোবাইল নাম্বার দিন।");
      return;
    }

    try {
      const parsedFeatures = mFeatures ? mFeatures.split(",").map(f => f.trim()) : ["অজুখানা", "শীতাতপ নিয়ন্ত্রিত"];
      await addDoc(collection(db, "mosque_posts"), {
        name: mName,
        type: mType,
        union: mUnion,
        location: mLocation,
        imam: mImam,
        imamPhone: mImamPhone,
        capacity: mCapacity || "৫০০ জন",
        features: parsedFeatures,
        history: mHistory || "",
        userId: user ? user.uid : "guest",
        createdAt: new Date().toISOString()
      });

      setMosqueSubmitSuccess(true);
      setMName("");
      setMLocation("");
      setMImam("");
      setMImamPhone("");
      setMCapacity("");
      setMFeatures("");
      setMHistory("");

      setTimeout(() => {
        setMosqueSubmitSuccess(false);
        setShowMosqueForm(false);
      }, 2500);
    } catch (err) {
      alert("মসজিদ সাবমিট করা সম্ভব হয়নি।");
    }
  };

  const mosqueList = [...dbMosques, ...MOSQUE_LIST];

  // State for dynamic countdown logic
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayerMessage, setNextPrayerMessage] = useState("");

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // Simple next prayer logic for dynamic dashboard feel
  useEffect(() => {
    const hrs = currentTime.getHours();
    const mins = currentTime.getMinutes();
    const totalMinutes = hrs * 60 + mins;

    let nextName = "ফজর";
    let diffMins = 0;

    if (totalMinutes < 285) {
      nextName = "ফজর (০৪:৪৫ AM)";
      diffMins = 285 - totalMinutes;
    } else if (totalMinutes < 810) {
      nextName = "জোহর (০১:৩০ PM)";
      diffMins = 810 - totalMinutes;
    } else if (totalMinutes < 1020) {
      nextName = "আসর (০৫:০০ PM)";
      diffMins = 1020 - totalMinutes;
    } else if (totalMinutes < 1140) {
      nextName = "মাগরিব (০৭:০০ PM)";
      diffMins = 1140 - totalMinutes;
    } else if (totalMinutes < 1245) {
      nextName = "ইশা (০৮:৪৫ PM)";
      diffMins = 1245 - totalMinutes;
    } else {
      nextName = "ফজর (আগামীকাল ০৪:৪৫ AM)";
      diffMins = (1440 - totalMinutes) + 285;
    }

    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    
    // Convert to Bengali digits
    const toBengaliNumber = (num: number) => {
      const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
      return num.toString().split("").map(d => bengaliDigits[parseInt(d)] || d).join("");
    };

    let timeStr = "";
    if (h > 0) {
      timeStr += `${toBengaliNumber(h)} ঘণ্টা `;
    }
    timeStr += `${toBengaliNumber(m)} মিনিট`;

    setNextPrayerMessage(`পরবর্তী জামাত: ${nextName} - আর মাত্র ${timeStr} বাকি রয়েছে ভাই।`);
  }, [currentTime]);

  // Filter mosques
  const filteredMosques = mosqueList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.imam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnion = unionFilter === "all" || m.union === unionFilter;
    return matchesSearch && matchesUnion;
  });

  return (
    <div className="font-sans space-y-6 pb-12 text-left animate-fade-in" id="mosque-info-view">
      {/* 1. Header Hero Banner - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="মসজিদ ও নামাজের সময়সূচী"
        subtitle="পুঠিয়া উপজেলা মডেল মসজিদ, ঐতিহাসিক শাহী মসজিদ ও সকল ইউনিয়নের মসজিদের সময়সূচী, ইমাম ডিরেক্টরি এবং ইসলামিক গাইডলাইন।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              ধর্মীয় ঐতিহ্য ও সেবা
            </span>
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
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="মসজিদ বা ইমামের নাম লিখে খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      {/* Real-time Prayer Banner Notification */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 shadow-sm animate-pulse">
        <span className="text-2xl">🕌</span>
        <div>
          <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">লাইভ জামাত কাউন্টডাউন</h4>
          <p className="text-xs text-emerald-700 leading-relaxed font-bold mt-0.5">{nextPrayerMessage}</p>
        </div>
      </div>

      {/* Tabs Menu Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: "list", label: "🕌 সব মসজিদ", icon: "📢" },
          { id: "prayer", label: "⏰ নামাজের সময়", icon: "📅" },
          { id: "historical", label: "🧱 ইতিহাস ও ঐতিহ্য", icon: "🏛️" },
          { id: "directory", label: "📞 ইমাম ডিরেক্টরি", icon: "📖" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery("");
            }}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-base block mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT BLOCKS */}

      {/* TAB 1: ALL MOSQUES */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-teal-50/50 p-3 rounded-2xl border border-teal-600/10">
            <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider">মসজিদ ও ইসলামিক ডিরেক্টরি</span>
            <button
              onClick={() => {
                setShowMosqueForm(!showMosqueForm);
                setMosqueSubmitSuccess(false);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition border-none shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {showMosqueForm ? "ফর্ম বন্ধ করুন" : "নতুন মসজিদ যোগ করুন"}
            </button>
          </div>

          {showMosqueForm && (
            <form onSubmit={handleCreateMosque} className="bg-white border border-teal-600/10 p-5 rounded-3xl space-y-4 shadow-sm text-xs">
              <h4 className="font-extrabold text-sm text-teal-800">নতুন মসজিদ তালিকাভুক্ত করুন</h4>
              {mosqueSubmitSuccess && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-2xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-teal-600" /> সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">মসজিদের নাম *</label>
                  <input type="text" required placeholder="যেমন: বানেশ্বর উত্তরপাড়া জামে মসজিদ" value={mName || ""} onChange={e => setMName(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ধরন *</label>
                  <select value={mType || ""} onChange={e => setMType(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="local">🕌 স্থানীয় জামে মসজিদ</option>
                    <option value="central">🕌 কেন্দ্রীয় মডেল/বড় মসজিদ</option>
                    <option value="historical">🧱 ঐতিহাসিক প্রাচীন মসজিদ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ইউনিয়ন *</label>
                  <select value={mUnion || ""} onChange={e => setMUnion(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                    <option value="বানেশ্বর">বানেশ্বর</option>
                    <option value="বেলপুকুর">বেলপুকুর</option>
                    <option value="জিউপাড়া">জিউপাড়া</option>
                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ধারণক্ষমতা (জন)</label>
                  <input type="text" placeholder="যেমন: ৫০০ জন" value={mCapacity || ""} onChange={e => setMCapacity(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">সম্মানিত ইমামের নাম *</label>
                  <input type="text" required placeholder="যেমন: মাওলানা আব্দুর রহিম" value={mImam || ""} onChange={e => setMImam(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ইমামের মোবাইল নাম্বার *</label>
                  <input type="tel" required placeholder="যেমন: 017xxxxxxxx" value={mImamPhone || ""} onChange={e => setMImamPhone(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">ঠিকানা ও সুনির্দিষ্ট অবস্থান *</label>
                  <input type="text" required placeholder="যেমন: বাজার রোড, সরকারি স্কুলের পিছনে, পুঠিয়া" value={mLocation || ""} onChange={e => setMLocation(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">প্রদত্ত সুবিধা (কমা দিয়ে লিখুন)</label>
                  <input type="text" placeholder="যেমন: অজুখানা, গাড়ি পার্কিং, মহিলাদের আলাদা নামাজ কক্ষ" value={mFeatures || ""} onChange={e => setMFeatures(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">সংক্ষিপ্ত ইতিহাস বা বিবরণ</label>
                  <textarea rows={2} placeholder="ঐতিহাসিক গুরুত্ব বা বিবরণ থাকলে লিখুন..." value={mHistory || ""} onChange={e => setMHistory(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border-none">
                <PlusCircle className="w-4 h-4" /> নতুন মসজিদ যুক্ত করুন
              </button>
            </form>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 inset-y-0 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মসজিদ বা ইমামের নাম লিখে খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
              />
            </div>
            
            {/* Filter */}
            <select
              value={unionFilter || ""}
              onChange={(e) => setUnionFilter(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="all">সব ইউনিয়ন</option>
              <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
              <option value="বানেশ্বর">বানেশ্বর ইউনিয়ন</option>
              <option value="জিউপাড়া">জিউপাড়া ইউনিয়ন</option>
              <option value="শিলমাড়িয়া">শিলমাড়িয়া ইউনিয়ন</option>
              <option value="ভালুকগাছী">ভালুকগাছী ইউনিয়ন</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredMosques.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-3xl block mb-2">🕌</span>
                <h5 className="text-sm font-bold text-gray-700">কোনো মসজিদ খুঁজে পাওয়া যায়নি ভাই</h5>
                <p className="text-gray-400 text-xs mt-1">দয়া করে ভিন্ন বানান ব্যবহার করে পুনরায় চেষ্টা করুন।</p>
              </div>
            ) : (
              filteredMosques.map(m => (
                <div key={m.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F766E]"></div>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-2 inline-block">
                        📍 {m.union}
                      </span>
                      {user && (m as any).userId === user.uid && (
                        <button
                          onClick={async () => {
                            if (confirm("আপনি কি নিশ্চিতভাবে এই মসজিদ তথ্যটি মুছে ফেলতে চান?")) {
                              try {
                                await deleteDoc(doc(db, "mosque_posts", m.id));
                              } catch (err) {
                                alert("মুছে ফেলা সম্ভব হয়নি।");
                              }
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border-none cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-extrabold text-gray-800 text-base leading-snug">{m.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {m.location}
                    </p>
                  </div>

                  {m.history && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed text-justify">
                      {m.history}
                    </p>
                  )}

                  {/* Feature Pill Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {m.features.map((f, i) => (
                      <span key={i} className="bg-teal-50/50 border border-teal-100/30 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        ✅ {f}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs font-bold text-gray-600 bg-gray-50/50 -mx-5 -mb-5 p-4 rounded-b-3xl">
                    <div>
                      <span className="text-gray-400 text-[9px] block">ইমাম / খতিব</span>
                      <span className="text-gray-800">{m.imam}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[9px] block text-right">ধারণক্ষমতা</span>
                      <span className="text-gray-800 text-right block">{m.capacity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRAYER SCHEDULE */}
      {activeTab === "prayer" && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-teal-600" /> পুঠিয়া এলাকার নামাজের সাধারণ সময়সূচী
            </h3>
            <span className="text-[9px] text-gray-400 font-extrabold bg-gray-100 px-2 py-0.5 rounded-full">আজকের তারিখ</span>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/50 p-3 rounded-2xl text-[11px] text-amber-800 leading-relaxed text-justify">
            <b>গুরুত্বপূর্ণ নোটিশ:</b> নামাজের আজান এবং জামাত আদায়ের সঠিক সময় ঋতু পরিবর্তনের সাথে সাথে ৫-১০ মিনিট পরিবর্তন হতে পারে। এছাড়া একেক মসজিদে জুমার নামাজ আদায়ের সময়ে সামান্য পার্থক্য থাকে। স্থানীয় জামাতের সময় মসজিদের নোটিশ বোর্ডে যাচাই করুন ভাই।
          </div>

          <div className="divide-y divide-gray-50">
            {PRAYER_SCHEDULES.map((p, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">{p.name} নামাজ</span>
                <div className="flex gap-6 text-xs font-bold">
                  <div>
                    <span className="text-gray-400 text-[9px] block">ওয়াক্ত শুরু</span>
                    <span className="text-gray-600">{p.time}</span>
                  </div>
                  <div className="border-l border-gray-100 pl-4 text-right">
                    <span className="text-emerald-700 text-[9px] block">জামাত শুরু</span>
                    <span className="text-emerald-800 text-sm font-extrabold">{p.jamat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY & HERITAGE */}
      {activeTab === "historical" && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-800 text-sm">🏛️ পুঠিয়ার প্রাচীন ঐতিহাসিক মোঘল মসজিদ</h3>
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="aspect-video w-full rounded-2xl bg-zinc-100 relative overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
              <span className="text-5xl">🕌</span>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                পুঠিয়া রাজবাড়ী শাহী মসজিদ
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600 leading-relaxed text-justify">
              <h4 className="font-extrabold text-gray-800 text-sm">এক অনন্য ঐতিহাসিক প্রত্নতাত্ত্বিক নিদর্শন</h4>
              <p>
                রাজশাহী জেলার পুঠিয়া রাজবাড়ী সংলগ্ন এলাকায় প্রাচীন মোগল ও সুলতানি আমলে নির্মিত অসাধারণ কারুকার্যমণ্ডিত পুঠিয়া শাহী মসজিদ অবস্থিত। এটি প্রধানত এক গম্বুজ বিশিষ্ট এবং চমৎকার বর্গাকার পরিকল্পনায় তৈরি। দেয়ালের পুরুত্ব প্রায় ৪ ফুট এবং প্রাচীন পোড়ামাটি ও সুরকি গাঁথুনির চমৎকার সমন্বয়ে এটি তৈরি।
              </p>
              <p>
                মসজিদটির মেহরাব ও খিলানসমূহে রয়েছে চমৎকার মোগল নকশার ছাপ। প্রত্নতাত্ত্বিক গবেষণা অনুসারে, এটি আনুমানিক সপ্তদশ শতাব্দীতে রাজপরিবারের মুসলিম রাজকর্মচারী এবং প্রজাদের নামাজের সুবিধার জন্য নির্মিত হয়েছিল। পুঠিয়ায় অবস্থিত মন্দিরসমূহের পাশে প্রাচীন এই মসজিদটির সহাবস্থান এ অঞ্চলের ধর্মীয় ও সাম্প্রদায়িক সম্প্রীতির এক চমৎকার ঐতিহাসিক সাক্ষী বহন করে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMAM DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-800 text-sm">📖 পুঠিয়ার বিশিষ্ট উলামায়ে কেরাম ও খতিব ডিরেক্টরি</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            মাসলা-মাসায়েল জিজ্ঞাসা, ইসলামী ফতোয়া, বিবাহ শরিয়াহ বা ঘরোয়া মিলাদ-মাহফিল আয়োজনের জন্য পুঠিয়ার সম্মানিত আলেমদের সাথে সরাসরি যোগাযোগ করুন।
          </p>

          <div className="space-y-3">
            {MOSQUE_LIST.map(m => (
              <div key={m.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{m.imam}</h4>
                  <p className="text-[11px] font-bold text-emerald-600 mt-0.5">খতিব: {m.name}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">📍 {m.location}</span>
                </div>

                <a 
                  href={`tel:${m.imamPhone}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> কল করুন ({m.imamPhone})
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masjid Donation Notice */}
      <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400 animate-pulse fill-red-400" />
          <h4 className="text-sm font-bold text-white">মসজিদ ও মাদ্রাসায় সদকা করুন</h4>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed text-justify">
          আপনার দান হোক পরকালের পাথেয়। পুঠিয়া মডেল মসজিদ কমপ্লেক্সের স্থায়ী সংস্কার, এতিম ও দরিদ্র হাফেজ ছাত্রদের খোরপোষে এবং গ্রামীণ ছোট ছোট মসজিদের উন্নয়নে আপনি আপনার সদকার অর্থ প্রদান করতে পারেন ভাই। যেকোনো দানের পূর্বে মসজিদের অফিশিয়াল ক্যাশিয়ার বা সরাসরি ইমাম সাহেবের সাথে যোগাযোগ করে রশিদ সংগ্রহ করুন।
        </p>
      </div>
    </div>
  );
}

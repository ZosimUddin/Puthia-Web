import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  BookOpen, 
  Clock, 
  HeartHandshake,
  Compass,
  Trash2,
  Loader2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface LibraryType {
  id: string;
  name: string;
  category: "public" | "academic" | "personal";
  village: string;
  location: string;
  timing: string;
  collection: string;
  phone: string;
  mapLink: string;
  isVerified?: boolean;
  isUserPost?: boolean;
}

export function LibraryInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "public" | "academic" | "personal">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localLibraries, setLocalLibraries] = useState<LibraryType[]>([]);
  
  // New Library Form State
  const [newLibName, setNewLibName] = useState("");
  const [newLibCategory, setNewLibCategory] = useState<"public" | "academic" | "personal">("public");
  const [newLibVillage, setNewLibVillage] = useState("");
  const [newLibLocation, setNewLibLocation] = useState("");
  const [newLibTiming, setNewLibTiming] = useState("");
  const [newLibCollection, setNewLibCollection] = useState("");
  const [newLibPhone, setNewLibPhone] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultLibraries: LibraryType[] = [
    {
      id: "lib_1",
      name: "পুঠিয়া পাবলিক লাইব্রেরি (উপজেলা পরিষদ সংলগ্ন)",
      category: "public",
      village: "পুঠিয়া সদর",
      location: "উপজেলা পরিষদ কমপ্লেক্সের পাশে, পুঠিয়া সদর, রাজশাহী",
      timing: "সকাল ১০:০০ - বিকাল ০৫:০০ (সরকারি ছুটির দিন বন্ধ)",
      collection: "৫,০০০+ সাহিত্য, ইতিহাস, সরকারি গেজেট ও সাধারণ জ্ঞান বই",
      phone: "০১৭১২-৩৪৫৬৭৮",
      mapLink: "https://maps.google.com/?q=Puthia+Upazila+Parishad",
      isVerified: true
    },
    {
      id: "lib_2",
      name: "পুঠিয়া পি.এন. সরকারি উচ্চ বিদ্যালয় কেন্দ্রীয় লাইব্রেরি",
      category: "academic",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া পি.এন. হাইস্কুল একাডেমিক ভবন, পুঠিয়া",
      timing: "স্কুল চলাকালীন (সকাল ১০:০০ - বিকাল ৪:০০)",
      collection: "পাঠ্যপুস্তক, বিজ্ঞান প্রজেক্ট বুক, বাংলা সাহিত্য ও শিশুতোষ গল্প",
      phone: "০১৭৩০-১২২২৩৩",
      mapLink: "https://maps.google.com/?q=Puthia+PN+Government+High+School",
      isVerified: true
    },
    {
      id: "lib_3",
      name: "আলোড়ন স্মৃতি সামাজিক পাঠাগার",
      category: "personal",
      village: "জিউপাড়া",
      location: "জিউপাড়া বাজার, পুঠিয়া, রাজশাহী",
      timing: "প্রতিদিন বিকেল ৪:০০ - সন্ধ্যা ৭:০০ (সবার জন্য উন্মুক্ত)",
      collection: "ইসলামিক বই, সমকালীন উপন্যাস, আত্মউন্নয়নমূলক বই ও ম্যাগাজিন",
      phone: "০১৭২৫-৩৩৪৪৫৫",
      mapLink: "https://maps.google.com/?q=Jiupara+Bazar+Puthia",
      isVerified: true
    },
    {
      id: "lib_4",
      name: "পুঠিয়া সরকারি কলেজ লাইব্রেরি ও সেমিনার কক্ষ",
      category: "academic",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া সরকারি কলেজ ভবন (২য় তলা), পুঠিয়া",
      timing: "কলেজ চলাকালীন (সকাল ০৯:০০ - দুপুর ২:৩০)",
      collection: "উচ্চমাধ্যমিক, ডিগ্রি এবং অনার্স কোর্সের রেফারেন্স বুক ",
      phone: "০১৭১২-৫৫৬৬৭৭",
      mapLink: "https://maps.google.com/?q=Puthia+Government+College",
      isVerified: true
    },
    {
      id: "lib_5",
      name: "শহীদ মিনার স্মৃতি পাঠাগার (বানেশ্বর)",
      category: "public",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার কলেজ রোড সংলগ্ন, পুঠিয়া",
      timing: "বিকেল ৩:০০ - রাত ৮:০০ (শুক্র-শনি সহ প্রতিদিন খোলা)",
      collection: "৩,৫০০+ মুক্তিযুদ্ধ বিষয়ক গ্রন্থ, জীবনীগ্রন্থ এবং দৈনিক পত্রিকা",
      phone: "০১৭১৫-৯৮৭৬৫৪",
      mapLink: "https://maps.google.com/?q=Baneswar+Bazar+Puthia",
      isVerified: true
    }
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load user submitted libraries from Firestore
  useEffect(() => {
    const q = query(collection(db, "educational_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: LibraryType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "library") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            category: data.libraryCategory || "public",
            village: data.village || "",
            location: data.fullAddress || data.location || "",
            timing: data.timing || "বিকেল ৪:০০ - সন্ধ্যা ৭:০০",
            collection: data.courses || data.collection || "সাধারণ সাহিত্য ও পত্রিকা",
            phone: data.contact || data.phone || "",
            mapLink: data.mapLink || "#",
            isVerified: data.isVerified ?? false,
            isUserPost: true
          });
        }
      });
      setLocalLibraries(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading libraries:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allLibraries = [...defaultLibraries, ...localLibraries];

  const handleAddLibrarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLibName || !newLibVillage || !newLibLocation || !newLibPhone) {
      alert("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "educational_institutions"), {
        name: newLibName.trim(),
        category: "library",
        libraryCategory: newLibCategory,
        village: newLibVillage.trim(),
        fullAddress: newLibLocation.trim(),
        timing: newLibTiming.trim() || "বিকেল ৪:০০ - সন্ধ্যা ৭:০০",
        courses: newLibCollection.trim() || "সাধারণ সাহিত্য ও পত্রিকা", // Courses maps to collection under dynamic structure
        contact: newLibPhone.trim(),
        isVerified: false,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      // Reset inputs
      setNewLibName("");
      setNewLibVillage("");
      setNewLibLocation("");
      setNewLibTiming("");
      setNewLibCollection("");
      setNewLibPhone("");

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddModal(false);
      }, 2500);
    } catch (err) {
      console.error("Error adding library:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই লাইব্রেরিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "educational_institutions", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting library:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredLibraries = allLibraries.filter((lib) => {
    const matchesTab = activeTab === "all" || lib.category === activeTab;
    const matchesSearch = 
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.collection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "public": return "পাবলিক লাইব্রেরি";
      case "academic": return "একাডেমিক পাঠাগার";
      case "personal": return "ব্যক্তিগত ও সামাজিক উদ্যোগ";
      default: return "জ্ঞান ভাণ্ডার ও লাইব্রেরি";
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="উপজেলা শিক্ষা ও সাহিত্য সেবা"
        title="লাইব্রেরি ও পাঠাগার"
        subtitle="পুঠিয়া উপজেলার সকল পাবলিক লাইব্রেরি, শিক্ষা প্রতিষ্ঠান ভিত্তিক পাঠাগার এবং বইপ্রেমীদের সমাজকল্যাণমূলক মিনি পাঠাগারের ডিরেক্টরি।"
        icon={<BookOpen size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="লাইব্রেরির নাম, এলাকা বা বইয়ের ধরন দিয়ে খুঁজুন..."
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
                  ? "bg-[#374151] text-white border-[#374151] hover:bg-[#252c38]" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-white text-[#374151] hover:bg-gray-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন লাইব্রেরি যুক্ত করুন"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: "all", label: "সব লাইব্রেরি", emoji: "📚" },
          { id: "public", label: "পাবলিক লাইব্রেরি", emoji: "🏛️" },
          { id: "academic", label: "একাডেমিক পাঠাগার", emoji: "🎓" },
          { id: "personal", label: "ব্যক্তিগত ও সামাজিক", emoji: "🏠" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Library Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-gray-800 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredLibraries.map((lib) => (
          <div 
            key={lib.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            {/* Delete button for custom entries */}
            {lib.isUserPost && (
              <button
                onClick={() => handleDelete(lib.id)}
                className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status / Verified Badges */}
            <div className="flex justify-between items-start mb-4 pr-6">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                lib.category === 'public' ? 'bg-blue-50 text-blue-700' :
                lib.category === 'academic' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {getCategoryLabel(lib.category)}
              </span>
              
              {lib.isVerified ? (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200/50">
                  যাচাইকৃত <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-50" />
                </span>
              ) : (
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200/50">
                  অনুমোদন অপেক্ষমান
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1 mb-5">
              <h3 className="text-lg font-black text-gray-900 leading-snug hover:text-slate-800 transition-colors">
                {lib.name}
              </h3>
              
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📍 অবস্থান:</span>
                  <span>{lib.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> সময়সূচী:
                  </span>
                  <span className="text-gray-900 leading-relaxed font-medium flex-1">{lib.timing}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0 mt-0.5 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-indigo-500" /> বই কালেকশন:
                  </span>
                  <span className="text-gray-900 leading-relaxed font-normal flex-1">{lib.collection}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-100">
              <a 
                href={lib.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100/70 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                ম্যাপে দেখুন
              </a>
              <a 
                href={`tel:${lib.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-900 transition border border-gray-100"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                কল করুন
              </a>
            </div>
          </div>
        ))}

        {filteredLibraries.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <div className="text-4xl mb-3 opacity-50">📚</div>
             <p className="text-lg text-gray-500 font-bold">এই ক্যাটাগরিতে কোনো লাইব্রেরি খুঁজে পাওয়া যায়নি।</p>
             <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে অন্য কোনো ফিল্টার নির্বাচন করুন বা নতুন পাঠাগারের আবেদন করুন।</p>
          </div>
        )}
      </div>

      {/* Form Submission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {formSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-950">পাঠাগার তথ্য সফলভাবে জমা হয়েছে!</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  আপনার দেওয়া লাইব্রেরির তথ্য সাময়িকভাবে ডিরেক্টরিতে সেভ হয়েছে। রিভিউ ও ভেরিফিকেশন প্যানেল এটি অ্যাপ্রুভ করার পর সম্পূর্ণ লাইভ করে দিবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddLibrarySubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <HeartHandshake className="w-6 h-6 text-slate-700" />
                    নতুন পাঠাগার তথ্য ফর্ম
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">সবগুলো প্রয়োজনীয় তথ্য পূরণ করে সাবমিট করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">লাইব্রেরির নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: বানেশ্বর জনকল্যাণ পাঠাগার" 
                      value={newLibName || ""}
                      onChange={e => setNewLibName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">লাইব্রেরির ধরন *</label>
                      <select 
                        value={newLibCategory || ""}
                        onChange={e => setNewLibCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition cursor-pointer"
                      >
                        <option value="public">পাবলিক লাইব্রেরি</option>
                        <option value="academic">একাডেমিক পাঠাগার (স্কুল/কলেজ)</option>
                        <option value="personal">ব্যক্তিগত বা সামাজিক পাঠাগার</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">গ্রাম/এলাকা *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: বানেশ্বর" 
                        value={newLibVillage || ""}
                        onChange={e => setNewLibVillage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">বিস্তারিত ঠিকানা (অবস্থান) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: কলেজের পূর্ব পাশে, বানেশ্বর বাজার, পুঠিয়া" 
                      value={newLibLocation || ""}
                      onChange={e => setNewLibLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">পড়ার সময়সূচী</label>
                      <input 
                        type="text" 
                        placeholder="উদা: বিকেল ৪:০০ - সন্ধ্যা ৭:০০" 
                        value={newLibTiming || ""}
                        onChange={e => setNewLibTiming(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">বই কালেকশন বিবরণ</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ইসলামিক বই ও মুক্তিযুদ্ধ উপন্যাস" 
                        value={newLibCollection || ""}
                        onChange={e => setNewLibCollection(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="উদা: ০১৭১৫-xxxxxx" 
                      value={newLibPhone || ""}
                      onChange={e => setNewLibPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-slate-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-3 bg-[#1F2937] hover:bg-[#111827] disabled:bg-gray-400 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সাবমিট হচ্ছে...
                      </>
                    ) : (
                      "লাইব্রেরি তথ্য সাবমিট করুন"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

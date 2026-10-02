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
  FileText, 
  Globe, 
  Sparkles,
  Trash2,
  Loader2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface CoachingType {
  id: string;
  name: string;
  category: "academic" | "admission" | "skill";
  village: string;
  location: string;
  courses: string;
  established: string;
  director: string;
  phone: string;
  mapLink: string;
  isVerified?: boolean;
  isUserPost?: boolean;
}

export function CoachingInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "academic" | "admission" | "skill">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localCoachings, setLocalCoachings] = useState<CoachingType[]>([]);
  
  // New Coaching Form State
  const [newCoachName, setNewCoachName] = useState("");
  const [newCoachCategory, setNewCoachCategory] = useState<"academic" | "admission" | "skill">("academic");
  const [newCoachVillage, setNewCoachVillage] = useState("");
  const [newCoachLocation, setNewCoachLocation] = useState("");
  const [newCoachCourses, setNewCoachCourses] = useState("");
  const [newCoachEst, setNewCoachEst] = useState("");
  const [newCoachDirector, setNewCoachDirector] = useState("");
  const [newCoachPhone, setNewCoachPhone] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultCoachings: CoachingType[] = [
    {
      id: "coach_1",
      name: "উদ্ভাস-উন্মেষ একাডেমিক ও এডমিশন কেয়ার (পুঠিয়া শাখা)",
      category: "admission",
      village: "কানাইপাড়া",
      location: "কানাইপাড়া, থানা রোড সংলগ্ন, পুঠিয়া",
      courses: "এইচএসসি ও এসএসসি বিজ্ঞান বিভাগ, প্রকৌশল ও মেডিকেল ভর্তি প্রস্তুতি",
      established: "২০১৫ খ্রিঃ",
      director: "মোঃ মোস্তাফিজুর রহমান (শাখা পরিচালক)",
      phone: "০১৭৮৯-১২৩৪৫৬",
      mapLink: "https://maps.google.com/?q=Udvash+Unmesh+Puthia",
      isVerified: true
    },
    {
      id: "coach_2",
      name: "প্রাইম একাডেমি",
      category: "academic",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া মডেল হাই স্কুল মোড়, পুঠিয়া সদর",
      courses: "৬ষ্ঠ থেকে ১০ম শ্রেণী এবং এইচএসসি একাডেমিক ব্যাচ (সকল বিভাগ)",
      established: "২০১৮ খ্রিঃ",
      director: "মোঃ মাহফুজুল হক",
      phone: "০১৭১২-৫৫৬৬৭৭",
      mapLink: "https://maps.google.com/?q=Prime+Academy+Puthia",
      isVerified: true
    },
    {
      id: "coach_3",
      name: "ফোকাস বিশ্ববিদ্যালয় ভর্তি কোচিং",
      category: "admission",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার, ঢাকা-রাজশাহী মহাসড়ক সংলগ্ন",
      courses: "বিশ্ববিদ্যালয় ক, খ ও গ ইউনিট এবং গুচ্ছ ভর্তি পরীক্ষা প্রস্তুতি",
      established: "২০১৩ খ্রিঃ",
      director: "মোঃ আতিকুর রহমান",
      phone: "০১৭১৫-৯৮৭৬৫৪",
      mapLink: "https://maps.google.com/?q=Focus+Admission+Coaching+Baneswar",
      isVerified: true
    },
    {
      id: "coach_4",
      name: "রিয়া আইটি অ্যান্ড কম্পিউটার ট্রেনিং সেন্টার",
      category: "skill",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া সদর (থানার পাশে), পুঠিয়া",
      courses: "কম্পিউটার অফিস অ্যাপ্লিকেশন, গ্রাফিক ডিজাইন, ওয়েব ডিজাইন ও ফ্রিল্যান্সিং আউটসোর্সিং",
      established: "২০১৬ খ্রিঃ",
      director: "মোঃ আশরাফুল আলম (আইটি ট্রেইনার)",
      phone: "০১৭১১-২২৩৩৪৪",
      mapLink: "https://maps.google.com/?q=Ria+IT+Puthia",
      isVerified: true
    },
    {
      id: "coach_5",
      name: "মেধা সিঁড়ি একাডেমিক হোম",
      category: "academic",
      village: "বানেশ্বর",
      location: "কলেজ রোড, বানেশ্বর, পুঠিয়া",
      courses: "জেএসসি, এসএসসি ও এইচএসসি গণিত ও ইংরেজি স্পেশাল কেয়ার",
      established: "২০২০ খ্রিঃ",
      director: "মোঃ জাকির হোসেন",
      phone: "০১৭২২-৩৩৪৪৫৫",
      mapLink: "https://maps.google.com/?q=Medha+Siri+Academic+Baneswar",
      isVerified: true
    }
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load user submitted coachings from Firestore
  useEffect(() => {
    const q = query(collection(db, "educational_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CoachingType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "coaching") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            category: data.coachingCategory || "academic",
            village: data.village || "",
            location: data.fullAddress || data.location || "",
            courses: data.courses || "সকল সাধারণ কোর্স",
            established: data.establishmentYear || data.established || "অজানা",
            director: data.headmaster || data.director || "পরিচালক",
            phone: data.contact || data.phone || "",
            mapLink: data.mapLink || "#",
            isVerified: data.isVerified ?? false,
            isUserPost: true
          });
        }
      });
      setLocalCoachings(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading coachings:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allCoachings = [...defaultCoachings, ...localCoachings];

  const handleAddCoachingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachName || !newCoachVillage || !newCoachLocation || !newCoachPhone) {
      alert("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "educational_institutions"), {
        name: newCoachName.trim(),
        category: "coaching",
        coachingCategory: newCoachCategory,
        village: newCoachVillage.trim(),
        fullAddress: newCoachLocation.trim(),
        courses: newCoachCourses.trim() || "সকল সাধারণ কোর্স",
        establishmentYear: newCoachEst ? `${newCoachEst} খ্রিঃ` : "অজানা",
        headmaster: newCoachDirector.trim() || "পরিচালক",
        contact: newCoachPhone.trim(),
        isVerified: false,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      // Reset inputs
      setNewCoachName("");
      setNewCoachVillage("");
      setNewCoachLocation("");
      setNewCoachCourses("");
      setNewCoachEst("");
      setNewCoachDirector("");
      setNewCoachPhone("");

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddModal(false);
      }, 2500);
    } catch (err) {
      console.error("Error adding coaching:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কোচিং সেন্টারটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "educational_institutions", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting coaching:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredCoachings = allCoachings.filter((coaching) => {
    const matchesTab = activeTab === "all" || coaching.category === activeTab;
    const matchesSearch = 
      coaching.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coaching.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coaching.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coaching.courses.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "academic": return "একাডেমিক কোচিং";
      case "admission": return "ভর্তি প্রস্তুতি কোচিং";
      case "skill": return "আইটি ও দক্ষতা উন্নয়ন";
      default: return "কোচিং ও ট্রেনিং সেন্টার";
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="উপজেলা কোচিং ডিরেক্টরি"
        title="কোচিং ও স্কিল সেন্টার"
        subtitle="পুঠিয়া উপজেলার সকল বিখ্যাত একাডেমিক, বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি এবং কম্পিউটার আইটি ট্রেনিং সেন্টারগুলোর বিস্তারিত বিবরণ ও যোগাযোগ ডিরেক্টরি।"
        icon={<BookOpen size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="কোচিং সেন্টারের নাম, কোর্স বা এলাকা দিয়ে খুঁজুন..."
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
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] hover:bg-[#3b33bd]" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-white text-[#4F46E5] hover:bg-indigo-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন কোচিং যুক্ত করুন"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: "all", label: "সব সেন্টার", emoji: "🏫" },
          { id: "academic", label: "একাডেমিক", emoji: "📚" },
          { id: "admission", label: "ভর্তি প্রস্তুতি", emoji: "🎓" },
          { id: "skill", label: "আইটি ও স্কিলস", emoji: "💻" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Coaching Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredCoachings.map((coaching) => (
          <div 
            key={coaching.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            {/* Delete button for custom entries */}
            {coaching.isUserPost && (
              <button
                onClick={() => handleDelete(coaching.id)}
                className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status / Verified Badges */}
            <div className="flex justify-between items-start mb-4 pr-6">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                coaching.category === 'academic' ? 'bg-amber-50 text-amber-700' :
                coaching.category === 'admission' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {getCategoryLabel(coaching.category)}
              </span>
              
              {coaching.isVerified ? (
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
              <h3 className="text-lg font-black text-gray-900 leading-snug hover:text-[#4F46E5] transition-colors">
                {coaching.name}
              </h3>
              
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📍 অবস্থান:</span>
                  <span>{coaching.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0 mt-0.5">📚 কোর্সসমূহ:</span>
                  <span className="text-gray-900 leading-relaxed font-medium flex-1">{coaching.courses}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📅 স্থাপন সাল:</span>
                  <span>{coaching.established}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">👨‍💼 পরিচালক:</span>
                  <span className="font-medium text-gray-950">{coaching.director}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-100">
              <a 
                href={coaching.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100/70 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                ম্যাপে দেখুন
              </a>
              <a 
                href={`tel:${coaching.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] transition"
              >
                <Phone className="w-3.5 h-3.5" />
                কল করুন
              </a>
            </div>
          </div>
        ))}

        {filteredCoachings.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <div className="text-4xl mb-3 opacity-50">📝</div>
             <p className="text-lg text-gray-500 font-bold">এই ফিল্টারে কোনো কোচিং সেন্টার খুঁজে পাওয়া যায়নি।</p>
             <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে অন্য কোনো ফিল্টার ট্রাই করুন অথবা নতুন সেন্টারের আবেদন করুন।</p>
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
                <h3 className="text-xl font-black text-gray-950">কোচিংটি সফলভাবে যুক্ত হয়েছে!</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  আপনার দেওয়া কোচিং সেন্টারের তথ্য সাময়িকভাবে আমাদের তালিকায় সেভ হয়েছে। অ্যাডমিন থেকে তথ্য রিভিউ শেষে এটি সম্পূর্ণ পাবলিশ হবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddCoachingSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#4F46E5] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                    নতুন কোচিং যুক্ত করার ফর্ম
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">সবগুলো প্রয়োজনীয় তথ্য পূরণ করে সাবমিট করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">কোচিং/ইনস্টিটিউটের নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: প্রাইম একাডেমি" 
                      value={newCoachName || ""}
                      onChange={e => setNewCoachName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">কোচিংয়ের ধরন *</label>
                      <select 
                        value={newCoachCategory || ""}
                        onChange={e => setNewCoachCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition cursor-pointer"
                      >
                        <option value="academic">একাডেমিক (৬ষ্ঠ - এইচএসসি)</option>
                        <option value="admission">ভর্তি প্রস্তুতি (বিশ্ববিদ্যালয়/মেডিকেল)</option>
                        <option value="skill">দক্ষতা ও আইটি ট্রেনিং সেন্টার</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">গ্রাম/এলাকার নাম *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: পুঠিয়া সদর" 
                        value={newCoachVillage || ""}
                        onChange={e => setNewCoachVillage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">বিস্তারিত ঠিকানা (অবস্থান) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: মডেল স্কুল মোড়, পুঠিয়া সদর, রাজশাহী" 
                      value={newCoachLocation || ""}
                      onChange={e => setNewCoachLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">প্রদত্ত কোর্স ও সেবাসমূহ (Courses Offer) *</label>
                    <textarea 
                      required
                      placeholder="উদা: এস.এস.সি ও এইচ.এস.সি বিজ্ঞান একাডেমিক স্পেশাল কেয়ার" 
                      value={newCoachCourses || ""}
                      onChange={e => setNewCoachCourses(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">স্থাপিত সাল (খ্রিঃ)</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ২০১৮" 
                        value={newCoachEst || ""}
                        onChange={e => setNewCoachEst(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">পরিচালকের নাম</label>
                      <input 
                        type="text" 
                        placeholder="উদা: মোঃ মাহফুজুল হক" 
                        value={newCoachDirector || ""}
                        onChange={e => setNewCoachDirector(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="উদা: ০১৭১২-xxxxxx" 
                      value={newCoachPhone || ""}
                      onChange={e => setNewCoachPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#4F46E5] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-indigo-300 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সাবমিট হচ্ছে...
                      </>
                    ) : (
                      "কোচিং তথ্য সাবমিট করুন"
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

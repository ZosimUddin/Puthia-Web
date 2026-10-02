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
  School, 
  BookOpen, 
  GraduationCap,
  Globe,
  Trash2,
  Loader2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface CollegeType {
  id: string;
  name: string;
  category: "govt" | "degree" | "women" | "technical" | "general";
  village: string;
  location: string;
  eiin: string;
  established: string;
  principal: string;
  phone: string;
  mapLink: string;
  isVerified?: boolean;
  isUserPost?: boolean;
}

export function CollegeInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "govt" | "degree" | "women" | "technical">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localColleges, setLocalColleges] = useState<CollegeType[]>([]);
  
  // New College Form State
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeCategory, setNewCollegeCategory] = useState<"govt" | "degree" | "women" | "technical" | "general">("general");
  const [newCollegeVillage, setNewCollegeVillage] = useState("");
  const [newCollegeLocation, setNewCollegeLocation] = useState("");
  const [newCollegeEiin, setNewCollegeEiin] = useState("");
  const [newCollegeEst, setNewCollegeEst] = useState("");
  const [newCollegePrincipal, setNewCollegePrincipal] = useState("");
  const [newCollegePhone, setNewCollegePhone] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultColleges: CollegeType[] = [
    {
      id: "coll_1",
      name: "পুঠিয়া সরকারি কলেজ",
      category: "govt",
      village: "পুঠিয়া সদর",
      location: "রাজবাড়ী মেইন গেটের পূর্ব পাশে, পুঠিয়া সদর",
      eiin: "১৩২৯৫০",
      established: "১৯৬৮ খ্রিঃ",
      principal: "প্রফেসর ড. মোঃ আশরাফুল ইসলাম",
      phone: "০১৭১২-৩৪৫৬৭৮",
      mapLink: "https://maps.google.com/?q=Puthia+Government+College",
      isVerified: true
    },
    {
      id: "coll_2",
      name: "বানেশ্বর শহীদ সেমাজুল হক ডিগ্রি কলেজ",
      category: "degree",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার, পুঠিয়া, রাজশাহী",
      eiin: "১৩২৮৪৪",
      established: "১৯৬৯ খ্রিঃ",
      principal: "মোঃ কামাল উদ্দিন",
      phone: "০১৭১৫-৯৮৭৬৫৪",
      mapLink: "https://maps.google.com/?q=Baneswar+Shaheed+Semajul+Haque+Degree+College",
      isVerified: true
    },
    {
      id: "coll_3",
      name: "ধোপাপাড়া ডিগ্রি কলেজ",
      category: "degree",
      village: "ধোপাপাড়া",
      location: "ধোপাপাড়া বাজার সংলগ্ন, পুঠিয়া",
      eiin: "১৩২৮৪৫",
      established: "১৯৯৫ খ্রিঃ",
      principal: "মোঃ আমিনুল ইসলাম",
      phone: "০১৭২২-৩৩৪৪৫৫",
      mapLink: "https://maps.google.com/?q=Dhopapara+Degree+College",
      isVerified: true
    },
    {
      id: "coll_4",
      name: "পুঠিয়া মহিলা কলেজ",
      category: "women",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া মডেল হাই স্কুল মোড়, পুঠিয়া",
      eiin: "১৩২৮৪৬",
      established: "১৯৯৭ খ্রিঃ",
      principal: "মোসাঃ মেহের নিগার",
      phone: "০১৭৩-৯৯৮৮৭৭",
      mapLink: "https://maps.google.com/?q=Puthia+Mohila+College",
      isVerified: true
    },
    {
      id: "coll_5",
      name: "বিড়ালদহ কলেজ",
      category: "degree",
      village: "বিড়ালদহ",
      location: "বিড়ালদহ মাজার সংলগ্ন, পুঠিয়া",
      eiin: "১৩২৮৪৭",
      established: "১৯৯৪ খ্রিঃ",
      principal: "মোঃ আবদুর রহমান",
      phone: "০১৭১৮-১২৩৪৫৬",
      mapLink: "https://maps.google.com/?q=Biraldah+College+Puthia",
      isVerified: true
    },
    {
      id: "coll_6",
      name: "পঙ্গু শিশু নিকেতন সমন্বিত অবৈতনিক কলেজ",
      category: "technical",
      village: "কানাইপাড়া",
      location: "থানা রোড, কানাইপাড়া, পুঠিয়া",
      eiin: "১৩৮১৫১",
      established: "২০০৫ খ্রিঃ",
      principal: "মোঃ গোলাম মোস্তফা",
      phone: "০১৭১১-২২৩৩৪৪",
      mapLink: "https://maps.google.com/?q=Pangu+Shishu+Niketan+Puthia",
      isVerified: true
    },
    {
      id: "coll_7",
      name: "বানেশ্বর মহিলা কলেজ",
      category: "women",
      village: "বানেশ্বর",
      location: "ঢাকা-রাজশাহী মহাসড়ক সংলগ্ন, বানেশ্বর",
      eiin: "১৩২৮৪৮",
      established: "১৯৯৮ খ্রিঃ",
      principal: "মোসাঃ শামীমা নাসরিন",
      phone: "০১৭১২-৫৫৬৬৭৭",
      mapLink: "https://maps.google.com/?q=Baneswar+Mohila+College",
      isVerified: true
    }
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load user submitted colleges from Firestore
  useEffect(() => {
    const q = query(collection(db, "educational_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CollegeType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "college") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            category: data.collegeCategory || "general",
            village: data.village || "",
            location: data.fullAddress || data.location || "",
            eiin: data.eiinCode || data.eiin || "প্রক্রিয়াধীন",
            established: data.establishmentYear || data.established || "অজানা",
            principal: data.headmaster || data.principal || "অধ্যক্ষ",
            phone: data.contact || data.phone || "",
            mapLink: data.mapLink || "#",
            isVerified: data.isVerified ?? false,
            isUserPost: true
          });
        }
      });
      setLocalColleges(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading colleges:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allColleges = [...defaultColleges, ...localColleges];

  const handleAddCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName || !newCollegeVillage || !newCollegeLocation || !newCollegePhone) {
      alert("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "educational_institutions"), {
        name: newCollegeName.trim(),
        category: "college",
        collegeCategory: newCollegeCategory,
        village: newCollegeVillage.trim(),
        fullAddress: newCollegeLocation.trim(),
        eiinCode: newCollegeEiin.trim() || "প্রক্রিয়াধীন",
        establishmentYear: newCollegeEst ? `${newCollegeEst} খ্রিঃ` : "অজানা",
        headmaster: newCollegePrincipal.trim() || "অধ্যক্ষ",
        contact: newCollegePhone.trim(),
        isVerified: false,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      // Reset inputs
      setNewCollegeName("");
      setNewCollegeVillage("");
      setNewCollegeLocation("");
      setNewCollegeEiin("");
      setNewCollegeEst("");
      setNewCollegePrincipal("");
      setNewCollegePhone("");

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddModal(false);
      }, 2500);
    } catch (err) {
      console.error("Error adding college:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কলেজটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "educational_institutions", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting college:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredColleges = allColleges.filter((college) => {
    const matchesTab = 
      activeTab === "all" || 
      college.category === activeTab ||
      (activeTab === "degree" && college.category === "general"); // Fallback for general

    const matchesSearch = 
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.eiin.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "govt": return "সরকারি কলেজ";
      case "degree": return "ডিগ্রি ও অনার্স";
      case "women": return "মহিলা কলেজ";
      case "technical": return "কারিগরি ও বিএম";
      default: return "বেসরকারি সাধারণ কলেজ";
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="উপজেলা শিক্ষা ডিরেক্টরি"
        title="কলেজ ও উচ্চশিক্ষা"
        subtitle="পুঠিয়া উপজেলার সকল সরকারি, বেসরকারি, মহিলা এবং কারিগরি ডিগ্রি ও অনার্স কলেজের বিস্তারিত তথ্য ও যোগাযোগ ডিরেক্টরি।"
        icon={<GraduationCap size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="কলেজের নাম, গ্রাম বা EIIN দিয়ে খুঁজুন..."
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
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-[#172e6e]" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-white text-[#1E3A8A] hover:bg-blue-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন কলেজ যুক্ত করুন"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: "all", label: "সব কলেজ", emoji: "🏫" },
          { id: "govt", label: "সরকারি কলেজ", emoji: "🏛️" },
          { id: "degree", label: "ডিগ্রি ও অনার্স", emoji: "🎓" },
          { id: "women", label: "মহিলা কলেজ", emoji: "👩‍🎓" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of College Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredColleges.map((college) => (
          <div 
            key={college.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            {/* Delete button for custom entries */}
            {college.isUserPost && (
              <button
                onClick={() => handleDelete(college.id)}
                className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status / Verified Badges */}
            <div className="flex justify-between items-start mb-4 pr-6">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                college.category === 'govt' ? 'bg-amber-50 text-amber-700' :
                college.category === 'degree' ? 'bg-blue-50 text-blue-700' :
                college.category === 'women' ? 'bg-pink-50 text-pink-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {getCategoryLabel(college.category)}
              </span>
              
              {college.isVerified ? (
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
              <h3 className="text-lg font-black text-gray-900 leading-snug hover:text-[#1E3A8A] transition-colors">
                {college.name}
              </h3>
              
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📍 অবস্থান:</span>
                  <span>{college.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">🔢 EIIN কোড:</span>
                  <span className="font-mono font-bold bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">{college.eiin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📅 স্থাপন সাল:</span>
                  <span>{college.established}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">👨‍🏫 প্রধান/অধ্যক্ষ:</span>
                  <span className="font-medium text-gray-900">{college.principal}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-100">
              <a 
                href={college.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100/70 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                ম্যাপে দেখুন
              </a>
              <a 
                href={`tel:${college.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#1E3A8A]/5 hover:bg-[#1E3A8A]/10 text-[#1E3A8A] transition"
              >
                <Phone className="w-3.5 h-3.5" />
                কল করুন
              </a>
            </div>
          </div>
        ))}

        {filteredColleges.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <div className="text-4xl mb-3 opacity-50">🎓</div>
             <p className="text-lg text-gray-500 font-bold">এই ক্যাটাগরিতে কোনো কলেজ খুঁজে পাওয়া যায়নি।</p>
             <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে ভিন্ন কোনো ক্যাটাগরি ট্রাই করুন বা নতুন কলেজ এড করুন।</p>
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
                <h3 className="text-xl font-black text-gray-950">আবেদনটি সফলভাবে জমা হয়েছে!</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  আপনার দেওয়া কলেজের তথ্য আমাদের ডিরেক্টরি ডাটাবেজে সাময়িকভাবে যুক্ত করা হয়েছে। অ্যাডমিন প্যানেল থেকে যাচাইকরণের পর এটি স্থায়ীভাবে লাইভ করা হবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddCollegeSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-[#1E3A8A]" />
                    নতুন কলেজ যুক্ত করার ফর্ম
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">সবগুলো প্রয়োজনীয় তথ্য পূরণ করে সাবমিট করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">কলেজের নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: পুঠিয়া ডিগ্রি কলেজ" 
                      value={newCollegeName || ""}
                      onChange={e => setNewCollegeName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">কলেজের ধরন *</label>
                      <select 
                        value={newCollegeCategory || ""}
                        onChange={e => setNewCollegeCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition cursor-pointer"
                      >
                        <option value="degree">ডিগ্রি ও অনার্স কলেজ</option>
                        <option value="govt">সরকারি কলেজ</option>
                        <option value="women">মহিলা কলেজ</option>
                        <option value="technical">কারিগরি ও বিএম কলেজ</option>
                        <option value="general">সাধারণ উচ্চমাধ্যমিক কলেজ</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">গ্রাম/এলাকার নাম *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: বানেশ্বর" 
                        value={newCollegeVillage || ""}
                        onChange={e => setNewCollegeVillage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">বিস্তারিত ঠিকানা (অবস্থান) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: বানেশ্বর বাজার, পুঠিয়া, রাজশাহী" 
                      value={newCollegeLocation || ""}
                      onChange={e => setNewCollegeLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">EIIN কোড (যদি থাকে)</label>
                      <input 
                        type="number" 
                        placeholder="উদা: ১৩২৮৪৪" 
                        value={newCollegeEiin || ""}
                        onChange={e => setNewCollegeEiin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">স্থাপিত সাল (খ্রিঃ)</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ১৯৬৯" 
                        value={newCollegeEst || ""}
                        onChange={e => setNewCollegeEst(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">অধ্যক্ষ / দায়িত্বশীল ব্যক্তির নাম</label>
                      <input 
                        type="text" 
                        placeholder="উদা: মোঃ কামাল উদ্দিন" 
                        value={newCollegePrincipal || ""}
                        onChange={e => setNewCollegePrincipal(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">যোগাযোগ নম্বর *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="উদা: ০১৭১৫-xxxxxx" 
                        value={newCollegePhone || ""}
                        onChange={e => setNewCollegePhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-3 bg-[#1E3A8A] hover:bg-[#1E3075] disabled:bg-blue-300 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সাবমিট হচ্ছে...
                      </>
                    ) : (
                      "আবেদন সাবমিট করুন"
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

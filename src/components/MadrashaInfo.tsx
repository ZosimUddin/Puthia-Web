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
  ShieldCheck,
  Award,
  Trash2,
  Loader2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface MadrashaType {
  id: string;
  name: string;
  category: "alia" | "qawmi_hifz" | "women";
  village: string;
  location: string;
  eiin: string;
  established: string;
  headTeacher: string;
  phone: string;
  mapLink: string;
  isVerified?: boolean;
  isUserPost?: boolean;
}

export function MadrashaInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "alia" | "qawmi_hifz" | "women">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localMadrashas, setLocalMadrashas] = useState<MadrashaType[]>([]);
  
  // New Madrasha Form State
  const [newMadName, setNewMadName] = useState("");
  const [newMadCategory, setNewMadCategory] = useState<"alia" | "qawmi_hifz" | "women">("alia");
  const [newMadVillage, setNewMadVillage] = useState("");
  const [newMadLocation, setNewMadLocation] = useState("");
  const [newMadEiin, setNewMadEiin] = useState("");
  const [newMadEst, setNewMadEst] = useState("");
  const [newMadHead, setNewMadHead] = useState("");
  const [newMadPhone, setNewMadPhone] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultMadrashas: MadrashaType[] = [
    {
      id: "mad_1",
      name: "পুঠিয়া আনোয়ারুল উলুম আলিম মাদ্রাসা",
      category: "alia",
      village: "পুঠিয়া সদর",
      location: "ডাকঘর: পুঠিয়া সদর, রাজশাহী",
      eiin: "১২৬৭৯৫",
      established: "১৯৭২ খ্রিঃ",
      headTeacher: "মাওলানা মোঃ আব্দুর রশিদ (অধ্যক্ষ)",
      phone: "০১৭১২-১১২২৩৩",
      mapLink: "https://maps.google.com/?q=Puthia+Anwarul+Ulum+Alim+Madrasah",
      isVerified: true
    },
    {
      id: "mad_2",
      name: "পুঠিয়া কেন্দ্রীয় কওমি মাদ্রাসা ও হাফিজিয়া এতিমখানা",
      category: "qawmi_hifz",
      village: "পুঠিয়া বাজার",
      location: "পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া সদর",
      eiin: "প্রযোজ্য নয়",
      established: "১৯৫৮ খ্রিঃ",
      headTeacher: "মুফতি মোহাম্মদুল্লাহ আল-হাসান",
      phone: "০১৭২৫-৩৩৪৪৫৫",
      mapLink: "https://maps.google.com/?q=Puthia+Central+Qawmi+Madrasah",
      isVerified: true
    },
    {
      id: "mad_3",
      name: "বানেশ্বর ইসলামিয়া দাখিল মাদ্রাসা",
      category: "alia",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার মোড়, পুঠিয়া",
      eiin: "১২৬৭৯৬",
      established: "১৯৭৮ খ্রিঃ",
      headTeacher: "মাওলানা মোঃ ইউনুস আলী",
      phone: "০১৭১৮-৪৫৬৭৮৯",
      mapLink: "https://maps.google.com/?q=Baneswar+Islamia+Dakhil+Madrasah",
      isVerified: true
    },
    {
      id: "mad_4",
      name: "পুঠিয়া হযরত ফাতেমা (রা:) মহিলা কওমি মাদ্রাসা",
      category: "women",
      village: "কানাইপাড়া",
      location: "থানা সংলগ্ন রোড, কানাইপাড়া, পুঠিয়া",
      eiin: "প্রযোজ্য নয়",
      established: "১৯৯৪ খ্রিঃ",
      headTeacher: "হাফেজা মোসাঃ ফাতেমা খাতুন",
      phone: "০১৭১১-২২৩৩৪৪",
      mapLink: "https://maps.google.com/?q=Puthia+Hazrat+Fatima+Women+Madrasah",
      isVerified: true
    },
    {
      id: "mad_5",
      name: "ধোপাপাড়া আলিম মাদ্রাসা",
      category: "alia",
      village: "ধোপাপাড়া",
      location: "ধোপাপাড়া হাইস্কুল সংলগ্ন, পুঠিয়া",
      eiin: "১২৬৭৯৭",
      established: "১৯৮২ খ্রিঃ",
      headTeacher: "মাওলানা মোঃ জয়নাল আবেদীন",
      phone: "০১৭২৩-৬৬৭৭৮৮",
      mapLink: "https://maps.google.com/?q=Dhopapara+Alim+Madrasah",
      isVerified: true
    },
    {
      id: "mad_6",
      name: "বিড়ালদহ দারুল উলুম কওমি মাদ্রাসা",
      category: "qawmi_hifz",
      village: "বিড়ালদহ",
      location: "বিড়ালদহ শাহী মসজিদ সংলগ্ন, পুঠিয়া",
      eiin: "প্রযোজ্য নয়",
      established: "১৯৬৫ খ্রিঃ",
      headTeacher: "হাফেজ মাওলানা মোঃ কুতুব উদ্দিন",
      phone: "০১৭১২-৩৪৫৬৭৮",
      mapLink: "https://maps.google.com/?q=Biraldah+Darul+Ulum+Qawmi+Madrasah",
      isVerified: true
    }
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load user submitted madrashas from Firestore
  useEffect(() => {
    const q = query(collection(db, "educational_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: MadrashaType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "madrasa") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            category: data.madrasaCategory || "alia",
            village: data.village || "",
            location: data.fullAddress || data.location || "",
            eiin: data.eiinCode || data.eiin || "প্রক্রিয়াধীন/নাই",
            established: data.establishmentYear || data.established || "অজানা",
            headTeacher: data.headmaster || data.headTeacher || "প্রধান শিক্ষক/মুহতামিম",
            phone: data.contact || data.phone || "",
            mapLink: data.mapLink || "#",
            isVerified: data.isVerified ?? false,
            isUserPost: true
          });
        }
      });
      setLocalMadrashas(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading madrashas:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allMadrashas = [...defaultMadrashas, ...localMadrashas];

  const handleAddMadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMadName || !newMadVillage || !newMadLocation || !newMadPhone) {
      alert("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "educational_institutions"), {
        name: newMadName.trim(),
        category: "madrasa",
        madrasaCategory: newMadCategory,
        village: newMadVillage.trim(),
        fullAddress: newMadLocation.trim(),
        eiinCode: newMadEiin.trim() || "প্রক্রিয়াধীন/নাই",
        establishmentYear: newMadEst ? `${newMadEst} খ্রিঃ` : "অজানা",
        headmaster: newMadHead.trim() || "প্রধান শিক্ষক/মুহতামিম",
        contact: newMadPhone.trim(),
        isVerified: false,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      // Reset inputs
      setNewMadName("");
      setNewMadVillage("");
      setNewMadLocation("");
      setNewMadEiin("");
      setNewMadEst("");
      setNewMadHead("");
      setNewMadPhone("");

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddModal(false);
      }, 2500);
    } catch (err) {
      console.error("Error adding madrasha:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই মাদ্রাসাটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "educational_institutions", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting madrasha:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredMadrashas = allMadrashas.filter((mad) => {
    const matchesTab = activeTab === "all" || mad.category === activeTab;
    const matchesSearch = 
      mad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mad.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mad.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mad.eiin.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "alia": return "আলিয়া ও দাখিল মাদ্রাসা";
      case "qawmi_hifz": return "কওমি ও হিফজখানা";
      case "women": return "মহিলা মাদ্রাসা (বালিকা)";
      default: return "ইসলামী শিক্ষা প্রতিষ্ঠান";
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="উপজেলা ইসলামী শিক্ষা ডিরেক্টরি"
        title="মাদ্রাসা ও হিফজখানা"
        subtitle="পুঠিয়া উপজেলার সকল দাখিল, আলিম, ফাজিল (আলিয়া) এবং দ্বীনি কওমি হাফিজিয়া ও মহিলা মাদ্রাসার বিস্তারিত তথ্য ও প্রশাসনিক কন্টাক্ট ডিরেক্টরি।"
        icon={<BookOpen size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="মাদ্রাসার নাম, গ্রাম বা EIIN দিয়ে খুঁজুন..."
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
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-white text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন মাদ্রাসা যুক্ত করুন"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: "all", label: "সব মাদ্রাসা", emoji: "🕌" },
          { id: "alia", label: "আলিয়া/দাখিল", emoji: "📖" },
          { id: "qawmi_hifz", label: "কওমি/হিফজ", emoji: "🕋" },
          { id: "women", label: "মহিলা মাদ্রাসা", emoji: "🧕" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#047857] text-white border-[#047857] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Madrasha Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredMadrashas.map((mad) => (
          <div 
            key={mad.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-emerald-100 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            {/* Delete button for custom entries */}
            {mad.isUserPost && (
              <button
                onClick={() => handleDelete(mad.id)}
                className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status / Verified Badges */}
            <div className="flex justify-between items-start mb-4 pr-6">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                mad.category === 'alia' ? 'bg-emerald-50 text-emerald-800' :
                mad.category === 'qawmi_hifz' ? 'bg-amber-50 text-amber-800' : 'bg-pink-50 text-pink-700'
              }`}>
                {getCategoryLabel(mad.category)}
              </span>
              
              {mad.isVerified ? (
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
              <h3 className="text-lg font-black text-gray-900 leading-snug hover:text-[#047857] transition-colors">
                {mad.name}
              </h3>
              
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📍 অবস্থান:</span>
                  <span>{mad.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">🔢 EIIN কোড:</span>
                  <span className="font-mono font-bold bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">{mad.eiin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📅 স্থাপন সাল:</span>
                  <span>{mad.established}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">🕌 প্রধান/মুহতামিম:</span>
                  <span className="font-medium text-gray-900">{mad.headTeacher}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-gray-100">
              <a 
                href={mad.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-100/70 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                ম্যাপে দেখুন
              </a>
              <a 
                href={`tel:${mad.phone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-[#047857] transition"
              >
                <Phone className="w-3.5 h-3.5" />
                কল করুন
              </a>
            </div>
          </div>
        ))}

        {filteredMadrashas.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <div className="text-4xl mb-3 opacity-50">🕌</div>
             <p className="text-lg text-gray-500 font-bold">এই ক্যাটাগরিতে কোনো মাদ্রাসা খুঁজে পাওয়া যায়নি।</p>
             <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে অন্য কোনো ফিল্টার নির্বাচন করুন বা নতুন মাদ্রাসা তথ্য যোগ করুন।</p>
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
                <h3 className="text-xl font-black text-gray-950">মাদ্রাসাটি সফলভাবে জমা হয়েছে!</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  আপনার দেওয়া মাদ্রাসার তথ্য সাময়িকভাবে আমাদের তালিকায় যুক্ত হয়েছে। অ্যাডমিন প্যানেল থেকে রিভিও করার পর এটি সাধারণ ইউজারদের জন্য লাইভ করা হবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddMadSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-[#047857] flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    নতুন মাদ্রাসা যুক্ত করার ফর্ম
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">সবগুলো প্রয়োজনীয় তথ্য পূরণ করে ডাটাবেজে যুক্ত করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">মাদ্রাসার নাম *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: পুঠিয়া কওমি মাদ্রাসা" 
                      value={newMadName || ""}
                      onChange={e => setNewMadName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">ক্যাটাগরি *</label>
                      <select 
                        value={newMadCategory || ""}
                        onChange={e => setNewMadCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition cursor-pointer"
                      >
                        <option value="alia">আলিয়া / দাখিল মাদ্রাসা</option>
                        <option value="qawmi_hifz">কওমি ও হিফজ বিভাগ</option>
                        <option value="women">মহিলা মাদ্রাসা (বালিকা শাখা)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">গ্রাম/পাড়া *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="উদা: পুঠিয়া বাজার" 
                        value={newMadVillage || ""}
                        onChange={e => setNewMadVillage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-gray-700">বিস্তারিত ঠিকানা (অবস্থান) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="উদা: কানাইপাড়া, থানা সংলগ্ন রোড, পুঠিয়া" 
                      value={newMadLocation || ""}
                      onChange={e => setNewMadLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">EIIN কোড (যদি থাকে)</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ১২৬৭৯৫" 
                        value={newMadEiin || ""}
                        onChange={e => setNewMadEiin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">স্থাপিত সাল (খ্রিঃ)</label>
                      <input 
                        type="text" 
                        placeholder="উদা: ১৯৭২" 
                        value={newMadEst || ""}
                        onChange={e => setNewMadEst(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">মুহতামিম / প্রধান শিক্ষকের নাম</label>
                      <input 
                        type="text" 
                        placeholder="উদা: মাওলানা মোঃ আব্দুর রশিদ" 
                        value={newMadHead || ""}
                        onChange={e => setNewMadHead(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-gray-700">মোবাইল নম্বর *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="উদা: ০১৭১২-xxxxxx" 
                        value={newMadPhone || ""}
                        onChange={e => setNewMadPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#047857] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-3 bg-[#047857] hover:bg-[#065F46] disabled:bg-emerald-300 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সাবমিট হচ্ছে...
                      </>
                    ) : (
                      "মাদ্রাসা তথ্য সাবমিট করুন"
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

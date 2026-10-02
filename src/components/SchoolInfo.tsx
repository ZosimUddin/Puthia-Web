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
  Trash2,
  Loader2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface SchoolType {
  id: string;
  name: string;
  category: "primary" | "high_school" | "mpo" | "technical";
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

export function SchoolInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "primary" | "high_school" | "mpo" | "technical">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localSchools, setLocalSchools] = useState<SchoolType[]>([]);
  
  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCategory, setNewSchoolCategory] = useState<"primary" | "high_school" | "mpo" | "technical">("primary");
  const [newSchoolVillage, setNewSchoolVillage] = useState("");
  const [newSchoolLocation, setNewSchoolLocation] = useState("");
  const [newSchoolEiin, setNewSchoolEiin] = useState("");
  const [newSchoolEst, setNewSchoolEst] = useState("");
  const [newSchoolHead, setNewSchoolHead] = useState("");
  const [newSchoolPhone, setNewSchoolPhone] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const defaultSchools: SchoolType[] = [
    {
      id: "sch_1",
      name: "পুঠিয়া পি. এন. সরকারি উচ্চ বিদ্যালয়",
      category: "high_school",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া",
      eiin: "১৩৮০০১",
      established: "১৯১০ খ্রিঃ",
      headTeacher: "এস. এম. এ. রাজ্জাক (প্রধান শিক্ষক)",
      phone: "০১৭৩-৪৫৬৭৮৯",
      mapLink: "https://maps.google.com/?q=Puthia+PN+Government+High+School",
      isVerified: true
    },
    {
      id: "sch_2",
      name: "পুঠিয়া মডেল সরকারি প্রাথমিক বিদ্যালয়",
      category: "primary",
      village: "পুঠিয়া সদর",
      location: "পুঠিয়া সদর, রাজশাহী",
      eiin: "১২৩৪৫৬",
      established: "১৯২০ খ্রিঃ",
      headTeacher: "মোসাঃ আফরোজা খাতুন",
      phone: "০১৭৩-২২৩৩৪৪",
      mapLink: "https://maps.google.com/?q=Puthia+Model+Govt+Primary+School",
      isVerified: true
    },
    {
      id: "sch_3",
      name: "বানেশ্বর সরকারি প্রাথমিক বিদ্যালয়",
      category: "primary",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার, পুঠিয়া",
      eiin: "১২৩৪৫৭",
      established: "১৯৩৫ খ্রিঃ",
      headTeacher: "মোঃ কামরুজ্জামান",
      phone: "০১৭১-৯৮৭৬৫৪",
      mapLink: "https://maps.google.com/?q=Baneswar+Govt+Primary+School",
      isVerified: true
    },
    {
      id: "sch_4",
      name: "বানেশ্বর বহুমুখী উচ্চ বিদ্যালয়",
      category: "mpo",
      village: "বানেশ্বর",
      location: "বানেশ্বর বাজার মেইন রোড, পুঠিয়া",
      eiin: "১৩৮০০৫",
      established: "১৯৬৪ খ্রিঃ",
      headTeacher: "মোঃ মাইনুল ইসলাম",
      phone: "০১৭১-১১২২৩৩",
      mapLink: "https://maps.google.com/?q=Baneswar+Multi+High+School",
      isVerified: true
    },
    {
      id: "sch_5",
      name: "ধোপাপাড়া বহুমুখী উচ্চ বিদ্যালয়",
      category: "mpo",
      village: "ধোপাপাড়া",
      location: "ধোপাপাড়া বাজার, পুঠিয়া",
      eiin: "১৩৮০১২",
      established: "১৯৭৩ খ্রিঃ",
      headTeacher: "মোঃ জাহাঙ্গীর আলম",
      phone: "০১৭২-৩৪৫৬৭৮",
      mapLink: "https://maps.google.com/?q=Dhopapara+High+School",
      isVerified: true
    },
    {
      id: "sch_6",
      name: "পুঠিয়া বালিকা উচ্চ বিদ্যালয়",
      category: "mpo",
      village: "পুঠিয়া সদর",
      location: "গার্লস স্কুল রোড, পুঠিয়া",
      eiin: "১৩৮০০২",
      established: "১৯৮৪ খ্রিঃ",
      headTeacher: "মোসাঃ সেলিনা বানু",
      phone: "০১৭৩-৯৯৮৮৭৭",
      mapLink: "https://maps.google.com/?q=Puthia+Girls+High+School",
      isVerified: true
    },
    {
      id: "sch_7",
      name: "পুঠিয়া টেকনিক্যাল অ্যান্ড বিএম স্কুল",
      category: "technical",
      village: "কানাইপাড়া",
      location: "থানা রোড সংলগ্ন, পুঠিয়া",
      eiin: "১৩৮১৫০",
      established: "২০০২ খ্রিঃ",
      headTeacher: "মোঃ আবুল কালাম আজাদ",
      phone: "০১৭১-৫৫৬৬৭৭",
      mapLink: "https://maps.google.com/?q=Puthia+Technical+and+BM+College",
      isVerified: true
    },
    {
      id: "sch_8",
      name: "জিউপাড়া দ্বিমুখী উচ্চ বিদ্যালয়",
      category: "mpo",
      village: "জিউপাড়া",
      location: "জিউপাড়া বাজার, পুঠিয়া",
      eiin: "১৩৮০০৯",
      established: "১৯৯১ খ্রিঃ",
      headTeacher: "মোঃ রিয়াজুল ইসলাম",
      phone: "০১৭২-৯৯০০১১",
      mapLink: "https://maps.google.com/?q=Jiupara+High+School",
      isVerified: true
    }
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Load user submitted schools from Firestore
  useEffect(() => {
    const q = query(collection(db, "educational_institutions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SchoolType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.category === "school") {
          list.push({
            id: docSnap.id,
            name: data.name || "",
            category: data.schoolCategory || "primary",
            village: data.village || "",
            location: data.fullAddress || data.location || "",
            eiin: data.eiinCode || data.eiin || "প্রক্রিয়াধীন",
            established: data.establishmentYear || data.established || "অজানা",
            headTeacher: data.headmaster || data.headTeacher || "প্রধান শিক্ষক",
            phone: data.contact || data.phone || "",
            mapLink: data.mapLink || "#",
            isVerified: data.isVerified ?? false,
            isUserPost: true
          });
        }
      });
      setLocalSchools(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading schools:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const allSchools = [...defaultSchools, ...localSchools];

  const handleAddSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolVillage || !newSchoolLocation || !newSchoolPhone) {
      alert("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্যগুলো পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "educational_institutions"), {
        name: newSchoolName.trim(),
        category: "school",
        schoolCategory: newSchoolCategory,
        village: newSchoolVillage.trim(),
        fullAddress: newSchoolLocation.trim(),
        eiinCode: newSchoolEiin.trim() || "প্রক্রিয়াধীন",
        establishmentYear: newSchoolEst ? `${newSchoolEst} খ্রিঃ` : "অজানা",
        headmaster: newSchoolHead.trim() || "প্রধান শিক্ষক",
        contact: newSchoolPhone.trim(),
        isVerified: false,
        createdAt: serverTimestamp()
      });

      setFormSuccess(true);
      // Reset inputs
      setNewSchoolName("");
      setNewSchoolVillage("");
      setNewSchoolLocation("");
      setNewSchoolEiin("");
      setNewSchoolEst("");
      setNewSchoolHead("");
      setNewSchoolPhone("");

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddModal(false);
      }, 2500);
    } catch (err) {
      console.error("Error adding school:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই স্কুলটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "educational_institutions", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting school:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const filteredSchools = allSchools.filter((school) => {
    const matchesTab = activeTab === "all" || school.category === activeTab;
    const matchesSearch = 
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.eiin.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case "primary": return "সরকারি প্রাথমিক";
      case "high_school": return "মাধ্যমিক ও উচ্চ";
      case "mpo": return "এমপিоভুক্ত";
      case "technical": return "কারিগরি ও ভোকেশনাল";
      default: return "বিদ্যালয়সমূহ";
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="উপজেলা শিক্ষা ডিরেক্টরি"
        title="স্কুল ও বিদ্যালয়সমূহ"
        subtitle="পুঠিয়া উপজেলার সকল সরকারি প্রাথমিক, মাধ্যমিক ও উচ্চ মাধ্যমিক বিদ্যালয়সমূহ, এমপিওভুক্ত প্রতিষ্ঠান এবং কারিগরি বিদ্যালয়সমূহের বিবরণ ও ফোন ডিরেক্টরি।"
        icon={<School size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="স্কুলের নাম, গ্রাম বা EIIN দিয়ে খুঁজুন..."
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
                  ? "bg-[#B71C1C] text-white border-[#B71C1C] hover:bg-[#961515]" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-full bg-white text-[#B71C1C] hover:bg-red-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন স্কুল যুক্ত করুন"
            >
              <PlusCircle size={18} />
            </button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: "all", label: "সব স্কুল", emoji: "🏫" },
          { id: "primary", label: "প্রাথমিক", emoji: "🏢" },
          { id: "high_school", label: "মাধ্যমিক", emoji: "🎓" },
          { id: "mpo", label: "এমপিওভুক্ত", emoji: "🏛️" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#B71C1C] text-white border-[#B71C1C] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of School Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredSchools.map((school) => (
          <div 
            key={school.id} 
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-red-100 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            {/* Delete button for custom entries */}
            {school.isUserPost && (
              <button
                onClick={() => handleDelete(school.id)}
                className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent z-10"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status / Verifed Badges */}
            <div className="flex justify-between items-start mb-4 pr-6">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                school.category === 'primary' ? 'bg-amber-50 text-amber-700' :
                school.category === 'high_school' ? 'bg-red-50 text-red-700' :
                school.category === 'mpo' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {getCategoryLabel(school.category)}
              </span>
              
              {school.isVerified ? (
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
              <h3 className="text-lg font-black text-gray-900 leading-snug hover:text-[#B71C1C] transition-colors">
                {school.name}
              </h3>
              
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📍 অবস্থান:</span>
                  <span>{school.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">🔢 EIIN কোড:</span>
                  <span className="font-mono font-bold bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">{school.eiin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">👨‍🏫 প্রধান শিক্ষক:</span>
                  <span>{school.headTeacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-24 shrink-0">📅 স্থাপন কাল:</span>
                  <span>{school.established}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <a 
                href={school.phone !== "০১৭৩-৪৫৬৭৮৯" && school.phone !== "০১৭৩-২২৩৩৪৪" ? `tel:${school.phone}` : "#"}
                onClick={() => (school.phone === "০১৭৩-৪৫৬৭৮৯" || school.phone === "০১৭৩-২২৩৩৪৪") && alert("এটি একটি ডেমো নম্বর।")}
                className="flex-1 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-[#B71C1C] rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                কল করুন
              </a>
              <a 
                href={school.mapLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all border border-gray-100"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                মানচিত্রে দেখুন
              </a>
            </div>
          </div>
        ))}

        {filteredSchools.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
               <School className="w-8 h-8" />
              </div>
             <p className="text-base text-gray-600 font-bold">এই তালিকা বা অনুসন্ধানে কোনো তথ্য পাওয়া যায়নি।</p>
             <p className="text-xs text-gray-400 mt-1 max-w-xs">বানান পরিবর্তন করে পুনরায় অনুসন্ধান করতে পারেন অথবা নতুন স্কুল যোগ করতে পারেন।</p>
          </div>
        )}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {formSuccess ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-950">আবেদনটি সফল হয়েছে!</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                  আপনার পাঠানো স্কুলের তথ্য সফলভাবে ডিরেক্টরিতে যুক্ত করা হয়েছে এবং বর্তমানে অনুমোদন অপেক্ষমান রয়েছে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddSchoolSubmit} className="space-y-4 pt-2">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <School className="w-6 h-6 text-[#B71C1C]" />
                    নতুন শিক্ষা প্রতিষ্ঠান সংযুক্তি
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">পুঠিয়া উপজেলার যেকোনো বাদ পড়া স্কুল বা তথ্য এখানে যুক্ত করুন।</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">প্রতিষ্ঠানের নাম (School Name) *</label>
                    <input 
                      type="text"
                      required
                      placeholder="উদা: পুঠিয়া রাজবাড়ি প্রাথমিক বিদ্যালয়"
                      value={newSchoolName || ""}
                      onChange={e => setNewSchoolName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#B71C1C] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">ক্যাটাগরি *</label>
                      <select 
                        value={newSchoolCategory || ""}
                        onChange={e => setNewSchoolCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="primary">সরকারি প্রাথমিক</option>
                        <option value="high_school">মাধ্যমিক ও উচ্চ</option>
                        <option value="mpo">এমপিওভুক্ত</option>
                        <option value="technical">কারিগরি</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">গ্রাম/এলাকা *</label>
                      <input 
                        type="text"
                        required
                        placeholder="উদা: কানাইপাড়া"
                        value={newSchoolVillage || ""}
                        onChange={e => setNewSchoolVillage(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#B71C1C] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">সম্পূর্ণ ঠিকানা (Full Location) *</label>
                    <input 
                      type="text"
                      required
                      placeholder="উদা: থানা মোড়, পুঠিয়া সদর, পুঠিয়া"
                      value={newSchoolLocation || ""}
                      onChange={e => setNewSchoolLocation(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#B71C1C] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">EIIN কোড (ঐচ্ছিক)</label>
                      <input 
                        type="text"
                        placeholder="উদা: ১৩৮১২৩"
                        value={newSchoolEiin || ""}
                        onChange={e => setNewSchoolEiin(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">প্রতিষ্ঠাকাল (ঐচ্ছিক)</label>
                      <input 
                        type="text"
                        placeholder="উদা: ১৯৯৫"
                        value={newSchoolEst || ""}
                        onChange={e => setNewSchoolEst(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">প্রধান শিক্ষক (ঐচ্ছিক)</label>
                      <input 
                        type="text"
                        placeholder="প্রধান শিক্ষকের নাম"
                        value={newSchoolHead || ""}
                        onChange={e => setNewSchoolHead(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">মোবাইল নম্বর *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="যোগাযোগ নম্বর"
                        value={newSchoolPhone || ""}
                        onChange={e => setNewSchoolPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-[#B71C1C] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none"
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

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Phone, Heart, MapPin, Building, Users, BookOpen, Sparkles, Gift, Send, Check, Trash2, PlusCircle, Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Orphanage {
  id: string;
  name: string;
  type: "boys" | "girls" | "mixed" | "heafz";
  union: string;
  location: string;
  superintendent: string;
  phone: string;
  established: string;
  studentsCount: number;
  facilities: string[];
  description: string;
}

const ORPHANAGE_LIST: Orphanage[] = [
  {
    id: "o1",
    name: "পুঠিয়া সদর হাফেজিয়া এতিমখানা ও লিল্লাহ বোর্ডিং",
    type: "heafz",
    union: "পুঠিয়া সদর",
    location: "পুঠিয়া রাজবাড়ী মাঠের উত্তর পার্শ্বে",
    superintendent: "মাওলানা হাফেজ মুফতি আব্দুল কাইয়ুম",
    phone: "01712345681",
    established: "১৯৯৪",
    studentsCount: 85,
    facilities: ["ফ্রি আবাসন ও উন্নত খাবার", "হিফজুল কুরআন কোর্স", "বিনামূল্যে পাঠ্যপুস্তক ও পোশাক", "প্রাথমিক চিকিৎসা"],
    description: "উপজেলা সদরে অবস্থিত অন্যতম প্রাচীন এবং স্বনামধন্য লিল্লাহ বোর্ডিং ও হাফেজিয়া মাদ্রাসা। এখানে স্থানীয় ও বিভিন্ন অঞ্চল থেকে আসা অনাথ ও দরিদ্র শিশুদের সম্পূর্ণ বিনামূল্যে দ্বীনি শিক্ষা ও ভরণপোষণের ব্যবস্থা করা হয়।"
  },
  {
    id: "o2",
    name: "বানেশ্বর বেলপুকুর হামিউস সুন্নাহ্ কওমী মাদ্রাসা ও বালিকা এতিমখানা",
    type: "girls",
    union: "বেলপুকুর",
    location: "বেলপুকুর বাজার রেল ক্রসিং সংলগ্ন",
    superintendent: "হাফেজ কারী মোছা: মরিয়ম খাতুন",
    phone: "01723456892",
    established: "২০০৮",
    studentsCount: 65,
    facilities: ["মহিলাদের দ্বারা পরিচালিত নিরাপদ পরিবেশ", "নুরানি ও হিফজ শিক্ষা", "দর্জি বিজ্ঞান ও কারিগরি শিক্ষা", "সম্পূর্ণ ফ্রি আবাসন"],
    description: "দরিদ্র ও অভিভাবকহীন বালিকাদের জন্য এটি একটি অত্যন্ত নিরাপদ ও নির্ভরযোগ্য আশ্রয়স্থল। দ্বীনি শিক্ষার পাশাপাশি এদের স্বাবলম্বী করার জন্য বিশেষ সেলাই প্রশিক্ষণ প্রদান করা হয়।"
  },
  {
    id: "o3",
    name: "ঝলমলিয়া বায়তুল আমান এতিমখানা ও শিশু পরিবার",
    type: "boys",
    union: "জিউপাড়া",
    location: "ঝলমলিয়া বাজার, ঢাকা-রাজশাহী মহাসড়কের দক্ষিণ পাশ",
    superintendent: "মাওলানা মো: মোস্তফা কামাল",
    phone: "01734567893",
    established: "২০০১",
    studentsCount: 110,
    facilities: ["আধুনিক বহুতল একাডেমিক ভবন", "সাধারণ সরকারি প্রাথমিক শিক্ষা", "সুবিশাল খেলার মাঠ ও ক্রীড়া সামগ্রী", "ইসলামিক লাইব্রেরি"],
    description: "এই শিশু পরিবারটি সমাজসেবা অধিদপ্তর এবং স্থানীয় শুভাকাঙ্ক্ষীদের যৌথ সহায়তায় পরিচালিত হয়। এখানে সাধারণ শিক্ষার পাশাপাশি শিশুদের খেলাধুলা ও মানসিক বিকাশে বিশেষ মনোযোগ দেওয়া হয়।"
  },
  {
    id: "o4",
    name: "ভালুকগাছী দারুল উলুম এতিমখানা ও ল্লিাহ বোর্ডিং",
    type: "boys",
    union: "ভালুকগাছী",
    location: "ভালুকগাছী বাজার হাই স্কুল রোড",
    superintendent: "মাওলানা মো: সাইদুর রহমান",
    phone: "01745678904",
    established: "২০১২",
    studentsCount: 45,
    facilities: ["নুরানি শিক্ষা কার্যক্রম", "ফ্রি খাবার ও শীতকালীন গরম পোশাক", "সুন্দর গ্রামীণ মনোরম পরিবেশ"],
    description: "ভালুকগাছী ইউনিয়নের একটি প্রত্যন্ত ও শান্ত পরিবেশে অবস্থিত এতিমখানা। স্থানীয় দাতাদের দানে চাল-ডাল এবং অর্থের যোগান দিয়ে সুশৃঙ্খলভাবে এতিমদের লালন-পালন করা হচ্ছে।"
  },
  {
    id: "o5",
    name: "শিলমাড়িয়া আল-হেরা সমাজকল্যাণ হাফেজিয়া এতিমখানা",
    type: "mixed",
    union: "শিলমাড়িয়া",
    location: "শিলমাড়িয়া বাজার ক্যানেল রোড",
    superintendent: "মাওলানা মো: আশরাফুল ইসলাম",
    phone: "01756789015",
    established: "২০১৫",
    studentsCount: 55,
    facilities: ["আধুনিক হিফজ শিক্ষা", "নিয়মিত পুষ্টিকর খাদ্য সরবরাহ", "সৃজনশীল প্রতিভার বিকাশ ও কুইজ প্রতিযোগিতা"],
    description: "শিক্ষা ও সমাজসেবামূলক লক্ষ্য নিয়ে আল-হেরা এতিমখানাটি কাজ করছে। পড়াশোনার পাশাপাশি এখানকার শিশুরা সুন্দর আচরণ, নিয়মানুবর্তিতা ও আধুনিক নৈতিক শিক্ষায় দীক্ষিত হচ্ছে।"
  }
];

export function OrphanageInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unionFilter, setUnionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"directory" | "donate" | "apply">("directory");

  // DB States
  const [dbOrphanages, setDbOrphanages] = useState<Orphanage[]>([]);
  
  // Create Orphanage form state
  const [showOrphanageForm, setShowOrphanageForm] = useState(false);
  const [oName, setOName] = useState("");
  const [oType, setOType] = useState<"boys" | "girls" | "mixed" | "heafz">("heafz");
  const [oUnion, setOUnion] = useState("পুঠিয়া সদর");
  const [oLocation, setOLocation] = useState("");
  const [oSuper, setOSuper] = useState("");
  const [oPhone, setOPhone] = useState("");
  const [oEstablished, setOEstablished] = useState("");
  const [oStudents, setOStudents] = useState("");
  const [oFacilities, setOFacilities] = useState("");
  const [oDesc, setODesc] = useState("");
  const [orphSubmitSuccess, setOrphSubmitSuccess] = useState(false);

  const orphanageList = [...dbOrphanages, ...ORPHANAGE_LIST];

  const [donationSuccess, setDonationSuccess] = useState("");
  const [selectedOrphanage, setSelectedOrphanage] = useState(ORPHANAGE_LIST[0].id);
  const [donationPoints, setDonationPoints] = useState(10);
  const [physicalGood, setPhysicalGood] = useState("খাবার ও খাদ্যসামগ্রী");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childGender, setChildGender] = useState("ছেলে");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [reason, setReason] = useState("");
  const [appSuccess, setAppSuccess] = useState("");

  useEffect(() => {
    const q = query(collection(db, "orphanage_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Orphanage[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Orphanage);
      });
      setDbOrphanages(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orphanage_posts");
    });
    return () => unsubscribe();
  }, []);

  const handleCreateOrphanage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oName || !oLocation || !oPhone) {
      alert("দয়া করে নাম, অবস্থান এবং মোবাইল নাম্বার দিন।");
      return;
    }

    try {
      const parsedFacilities = oFacilities ? oFacilities.split(",").map(f => f.trim()) : ["ফ্রি আবাসন ও দ্বীনি শিক্ষা"];
      await addDoc(collection(db, "orphanage_posts"), {
        name: oName,
        type: oType,
        union: oUnion,
        location: oLocation,
        superintendent: oSuper || "স্থানীয় কমিটি",
        phone: oPhone,
        established: oEstablished || "২০২৬",
        studentsCount: oStudents ? parseInt(oStudents) : 50,
        facilities: parsedFacilities,
        description: oDesc || "একটি সমাজসেবামূলক প্রতিষ্ঠান যা অনাথ শিশুদের সেবায় নিয়োজিত।",
        userId: user ? user.uid : "guest",
        createdAt: new Date().toISOString()
      });

      setOrphSubmitSuccess(true);
      setOName("");
      setOLocation("");
      setOSuper("");
      setOPhone("");
      setOEstablished("");
      setOStudents("");
      setOFacilities("");
      setODesc("");

      setTimeout(() => {
        setOrphSubmitSuccess(false);
        setShowOrphanageForm(false);
      }, 2500);
    } catch (err) {
      alert("এতিমখানা সাবমিট করা সম্ভব হয়নি।");
    }
  };

  useEffect(() => {
    if (userProfile) {
      setDonorName(userProfile.name || "");
      setDonorPhone(userProfile.phone || "");
      setGuardianName(userProfile.name || "");
      setGuardianPhone(userProfile.phone || "");
    }
  }, [userProfile]);

  const handlePointDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("দুঃখিত, আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট সংযোগ থাকলে আবার চেষ্টা করুন।");
      return;
    }
    if (!user || !userProfile) {
      alert("ইস্টার অনুদান করতে দয়া করে আগে লগইন করুন।");
      return;
    }
    const currentPoints = userProfile.points || 0;
    if (currentPoints < donationPoints) {
      alert("দুঃখিত, আপনার পর্যাপ্ত সিভিক ইস্টার নেই। সমাজসেবামূলক কাজে অংশ নিয়ে আরও ইস্টার অর্জন করুন!");
      return;
    }
    try {
      await addDoc(collection(db, "orphanage_donations"), {
        userId: user.uid,
        userName: donorName || userProfile.name,
        userPhone: donorPhone || userProfile.phone,
        orphanageId: selectedOrphanage,
        orphanageName: orphanageList.find(o => o.id === selectedOrphanage)?.name || "",
        pointsDeducted: donationPoints,
        type: "points",
        createdAt: new Date().toISOString()
      });
      await updateUserProfile({ points: currentPoints - donationPoints });
      setDonationSuccess(`আপনার ${donationPoints} সিভিক ইস্টার পুঠিয়া এতিমখানা ফান্ডে সফলভাবে অনুদান করা হয়েছে। অসহায় এতিম শিশুদের পাশে দাঁড়ানোর জন্য আপনাকে অনেক ধন্যবাদ!`);
      setTimeout(() => setDonationSuccess(""), 8000);
    } catch (err: any) {
      console.error("Firebase error details:", err.code, err.message, err);
      alert(`অনুদান প্রক্রিয়াটি সম্পন্ন করা যায়নি। বিস্তারিত: ${err.message}`);
    }
  };

  const handlePhysicalDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("দুঃখিত, আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট সংযোগ থাকলে আবার চেষ্টা করুন।");
      return;
    }
    if (!donorName || !donorPhone) {
      alert("দয়া করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন।");
      return;
    }
    try {
      await addDoc(collection(db, "orphanage_donations"), {
        userId: user ? user.uid : "guest",
        userName: donorName,
        userPhone: donorPhone,
        orphanageId: selectedOrphanage,
        orphanageName: orphanageList.find(o => o.id === selectedOrphanage)?.name || "",
        item: physicalGood,
        type: "physical",
        createdAt: new Date().toISOString()
      });
      setDonationSuccess(`আপনার '${physicalGood}' উপহার দেওয়ার অঙ্গীকার বা দানবার্তা সংশ্লিষ্ট এতিমখানা কর্তৃপক্ষের নিকট সফলভাবে পাঠানো হয়েছে। তারা আপনার সাথে দ্রুত মোবাইল নাম্বারে যোগাযোগ করবেন। জাজাকাল্লাহ খায়ের!`);
      setTimeout(() => setDonationSuccess(""), 8000);
      if (!userProfile) { setDonorName(""); setDonorPhone(""); }
    } catch (err: any) {
      console.error("Firebase error details:", err.code, err.message, err);
      alert(`অনুদান অঙ্গীকার পাঠানো সম্ভব হয়নি। বিস্তারিত: ${err.message}`);
    }
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("দুঃখিত, আপনি বর্তমানে অফলাইনে আছেন। ইন্টারনেট সংযোগ থাকলে আবার চেষ্টা করুন।");
      return;
    }
    if (!childName || !childAge || !guardianName || !guardianPhone || !reason) {
      alert("দয়া করে ফর্মের সব তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }
    try {
      await addDoc(collection(db, "orphanage_admissions"), {
        userId: user ? user.uid : "guest",
        childName, childAge, childGender, guardianName, guardianPhone, reason,
        preferredOrphanageId: selectedOrphanage,
        preferredOrphanageName: orphanageList.find(o => o.id === selectedOrphanage)?.name || "",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setAppSuccess("এতিম শিশু আশ্রয় বা ভর্তির আবেদনটি সাফল্যের সাথে সমাজসেবা ডিরেক্টরি ও সংশ্লিষ্ট এতিমখানায় দাখিল করা হয়েছে। কর্তৃপক্ষ দ্রুত আপনার সাথে মোবাইলে যোগাযোগ করবে।");
      setChildName(""); setChildAge(""); setReason("");
      setTimeout(() => setAppSuccess(""), 8000);
    } catch (err: any) {
      console.error("Firebase error details:", err.code, err.message, err);
      alert(`আবেদন সাবমিট করা সম্ভব হয়নি। বিস্তারিত: ${err.message}`);
    }
  };

  const filteredOrphanages = orphanageList.filter((o) => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.superintendent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnion = unionFilter === "all" || o.union === unionFilter;
    const matchesType = typeFilter === "all" || o.type === typeFilter;
    return matchesSearch && matchesUnion && matchesType;
  });

  return (
    <div className="space-y-6 font-sans pb-10" id="orphanage-info-view">
      <UnifiedHeroHeader
        badgeText="পুঠিয়া সামাজিক ও মানবসেবা উইং"
        title="উপজেলা এতিমখানা ডিরেক্টরি"
        subtitle="পুঠিয়া উপজেলার সমাজসেবা অধিদপ্তর অনুমোদিত এতিমখানা ও লিল্লাহ বোর্ডিংয়ের তালিকা, অনুদান সহায়তার সুযোগ এবং অসহায় শিশুদের জন্য আশ্রয় আবেদন কেন্দ্র।"
        icon={<Heart size={20} />}
        showBack={true}
        onBack={onGoBack}
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
              onClick={() => {
                setShowOrphanageForm(!showOrphanageForm);
                setOrphSubmitSuccess(false);
              }}
              className="w-10 h-10 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
              title="নতুন এতিমখানা যুক্ত করুন"
            >
              <Plus size={18} />
            </button>
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="এতিমখানার নাম বা ঠিকানা দিয়ে খুঁজুন..."
      />

      <div className="grid grid-cols-3 gap-2 px-1">
        {[
          { id: "directory", label: "এতিমখানা তালিকা", emoji: "🏢" },
          { id: "donate", label: "অনুদান ও উপহার", emoji: "💖" },
          { id: "apply", label: "আশ্রয় আবেদন", emoji: "📝" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#10b981] text-white border-[#10b981] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[10px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "directory" && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-2xl border border-emerald-600/10">
            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">এতিমখানা ও লিল্লাহ বোর্ডিং নির্দেশিকা</span>
            <button
              onClick={() => {
                setShowOrphanageForm(!showOrphanageForm);
                setOrphSubmitSuccess(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition border-none shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {showOrphanageForm ? "ফর্ম বন্ধ করুন" : "নতুন এতিমখানা যোগ করুন"}
            </button>
          </div>

          {showOrphanageForm && (
            <form onSubmit={handleCreateOrphanage} className="bg-white border border-emerald-600/10 p-5 rounded-3xl space-y-4 shadow-sm text-xs">
              <h4 className="font-extrabold text-sm text-emerald-800">নতুন এতিমখানা বা লিল্লাহ বোর্ডিং তালিকাভুক্ত করুন</h4>
              {orphSubmitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">এতিমখানার নাম *</label>
                  <input type="text" required placeholder="যেমন: পুঠিয়া সদর বালিকা এতিমখানা" value={oName || ""} onChange={e => setOName(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">শাখা/ধরন *</label>
                  <select value={oType || ""} onChange={e => setOType(e.target.value as any)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="heafz">🕌 হাফেজিয়া ও লিল্লাহ বোর্ডিং</option>
                    <option value="boys">👦 বালক এতিমখানা</option>
                    <option value="girls">👧 বালিকা এতিমখানা</option>
                    <option value="mixed">👥 বালক ও বালিকা (যৌথ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ইউনিয়ন *</label>
                  <select value={oUnion || ""} onChange={e => setOUnion(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                    <option value="বানেশ্বর">বানেশ্বর</option>
                    <option value="বেলপুকুর">বেলপুকুর</option>
                    <option value="জিউপাড়া">জিউপাড়া</option>
                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">স্থাপিত সন</label>
                  <input type="text" placeholder="যেমন: ১৯৯৮" value={oEstablished || ""} onChange={e => setOEstablished(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">মোট এতিম শিশুর সংখ্যা</label>
                  <input type="number" placeholder="যেমন: ৬০" value={oStudents || ""} onChange={e => setOStudents(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">তদারককারী / সুপারের নাম *</label>
                  <input type="text" required placeholder="যেমন: মাওলানা হাফেজ মোস্তফা কামাল" value={oSuper || ""} onChange={e => setOSuper(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">ঠিকানা ও সুনির্দিষ্ট অবস্থান *</label>
                  <input type="text" required placeholder="যেমন: রাজবাড়ী মাঠের পূর্ব পার্শ্বে, পুঠিয়া বাজার" value={oLocation || ""} onChange={e => setOLocation(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">প্রদত্ত সুবিধা (কমা দিয়ে লিখুন)</label>
                  <input type="text" placeholder="যেমন: ফ্রি আবাসন, হিফজুল কুরআন কোর্স, কারিগরি শিক্ষা" value={oFacilities || ""} onChange={e => setOFacilities(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea rows={2} placeholder="এতিমখানাটি সম্পর্কে বিস্তারিত বিবরণ লিখুন..." value={oDesc || ""} onChange={e => setODesc(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">মোবাইল নাম্বার *</label>
                  <input type="tel" required placeholder="যেমন: 017xxxxxxxx" value={oPhone || ""} onChange={e => setOPhone(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border-none">
                <PlusCircle className="w-4 h-4" /> এতিমখানা ডিরেক্টরিতে যোগ করুন
              </button>
            </form>
          )}

          <div className="bg-white border border-emerald-600/10 p-4 rounded-2xl shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="এতিমখানা বা সুপারের নাম দিয়ে খুঁজুন..." value={searchQuery || ""} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <select value={unionFilter || ""} onChange={(e) => setUnionFilter(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="all">সব ইউনিয়ন (পুঠিয়া)</option>
                <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                <option value="বানেশ্বর">বানেশ্বর</option>
                <option value="বেলপুকুর">বেলপুকুর</option>
                <option value="জিউপাড়া">জিউপাড়া</option>
              </select>
              <select value={typeFilter || ""} onChange={(e) => setTypeFilter(e.target.value)} className="py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="all">সব ধরন</option>
                <option value="boys">ছেলেদের এতিমখানা</option>
                <option value="girls">বালিকাদের এতিমখানা</option>
                <option value="heafz">হাফেজিয়া ও লিল্লাহ বোর্ডিং</option>
                <option value="mixed">যৌথ এতিমখানা</option>
              </select>
            </div>
            <div className="text-center md:text-left text-[11px] text-gray-400 font-bold px-1">মোট {filteredOrphanages.length}টি এতিমখানা খুঁজে পাওয়া গেছে।</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrphanages.map((orphanage) => (
              <div key={orphanage.id} className="bg-white border border-emerald-600/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">{orphanage.union}</span>
                    <span className="text-[10px] px-2 py-0.5 font-black rounded-full bg-amber-500/10 text-amber-600">
                      {orphanage.type === "boys" && "👦 বালক শাখা"}
                      {orphanage.type === "girls" && "👧 বালিকা শাখা"}
                      {orphanage.type === "heafz" && "🕌 হাফেজিয়া ও লিল্লাহ"}
                      {orphanage.type === "mixed" && "👥 বালক ও বালিকা"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-800 leading-tight">{orphanage.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{orphanage.description}</p>
                  <div className="space-y-1 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> <span>{orphanage.location}</span></div>
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /> <span>বর্তমান এতিম শিশু: <strong className="text-emerald-600">{orphanage.studentsCount} জন</strong></span></div>
                    <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> <span>স্থাপিত: {orphanage.established} সাল</span></div>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-extrabold text-gray-400 block mb-1">প্রদত্ত সুবিধা:</span>
                    <div className="flex flex-wrap gap-1">
                      {orphanage.facilities.map((fac, idx) => (
                        <span key={idx} className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">✓ {fac}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-[10px] text-gray-400 block font-medium">তত্ত্বাবধায়ক / সুপার:</span>
                    <strong className="text-gray-700 font-extrabold">{orphanage.superintendent}</strong>
                  </div>
                  <div className="flex gap-2">
                    {user && (orphanage as any).userId === user.uid && (
                      <button
                        onClick={async () => {
                          if (confirm("আপনি কি নিশ্চিতভাবে এই এতিমখানা তথ্যটি মুছে ফেলতে চান?")) {
                            try {
                              await deleteDoc(doc(db, "orphanage_posts", orphanage.id));
                            } catch (err) {
                              alert("মুছে ফেলা সম্ভব হয়নি।");
                            }
                          }
                        }}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition cursor-pointer border-none"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a href={`tel:${orphanage.phone}`} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm cursor-pointer"><Phone className="w-3 h-3" /> কল করুন</a>
                    <button onClick={() => { setSelectedOrphanage(orphanage.id); setActiveTab("donate"); }} className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 active:scale-95 transition-all shadow-sm cursor-pointer"><Heart className="w-3 h-3 fill-white" /> দান করুন</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "donate" && (
        <div className="bg-white border border-emerald-600/10 p-6 rounded-[28px] shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-1.5"><Gift className="w-5 h-5 text-rose-500" /> এতিমদের উদ্দেশ্যে সাহায্য ও ভালোবাসা প্রেরণ</h2>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">পুঠিয়া নাগরিক পোর্টালের মাধ্যমে আপনি সরাসরি যেকোনো এতিমখানায় আপনার কষ্টার্জিত সিভিক ইস্টার অনুদান দিতে পারেন অথবা খাদ্য ও পোশাক দান করার অঙ্গীকার করতে পারেন।</p>
          </div>
          {donationSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span>{donationSuccess}</span></div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handlePointDonation} className="p-5 border border-emerald-600/10 bg-emerald-50/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wide flex items-center gap-1">⭐ সিভিক ইস্টার অনুদান</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold">আপনার ইস্টার: {userProfile?.points || 0}</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">এতিমখানা নির্বাচন করুন:</label>
                  <select value={selectedOrphanage || ""} onChange={(e) => setSelectedOrphanage(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-white text-gray-700">{orphanageList.map((o) => <option key={o.id} value={o.id || ""}>{o.name}</option>)}</select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">ইস্টারের পরিমাণ:</label>
                  <div className="grid grid-cols-4 gap-2">{[10, 20, 50, 100].map((pts) => <button key={pts} type="button" onClick={() => setDonationPoints(pts)} className={`py-2 text-center rounded-xl font-black transition-all ${donationPoints === pts ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-white text-gray-700 border border-gray-200"}`}>{pts} pts</button>)}</div>
                </div>
                <div className="bg-white p-3 rounded-xl text-[10px] text-gray-500 leading-snug">📌 <strong>উল্লেখ্য:</strong> এই ইস্টার আপনার প্রোফাইল থেকে বিয়োগ করা হবে এবং এই এতিমখানার জন্য সংরক্ষিত ফান্ডের নাগরিক স্কোরে যুক্ত হবে। আপনার এতিমদের প্রতি ভালোবাসার বহিঃপ্রকাশ আমাদের ডিজিটাল নাগরিক লীডারবোর্ডে সম্মাননা এনে দিবে।</div>
              </div>
              <button type="submit" className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"><Heart className="w-3.5 h-3.5 fill-white" /> ইস্টার অনুদান করুন</button>
            </form>
            <form onSubmit={handlePhysicalDonation} className="p-5 border border-rose-600/10 bg-rose-50/5 rounded-2xl space-y-4">
              <span className="text-xs font-black text-rose-700 uppercase tracking-wide flex items-center gap-1">🎁 পোশাক, খাদ্য বা অন্যান্য উপহার দান</span>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">এতিমখানা নির্বাচন করুন:</label>
                  <select value={selectedOrphanage || ""} onChange={(e) => setSelectedOrphanage(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-white text-gray-700">{orphanageList.map((o) => <option key={o.id} value={o.id || ""}>{o.name}</option>)}</select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">উপহারের ধরন:</label>
                  <select value={physicalGood || ""} onChange={(e) => setPhysicalGood(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-white text-gray-700">
                    <option value="খাবার ও খাদ্যসামগ্রী">চাল, ডাল, তেল ও খাদ্যসামগ্রী</option>
                    <option value="শীতবস্ত্র ও সাধারণ পোশাক">শীতকালীন গরম কাপড় ও জামা-কাপড়</option>
                    <option value="পড়াশোনার বই ও খাতা">বই, খাতা, কলম ও শিক্ষা সামগ্রী</option>
                    <option value="ওষুধ ও ফার্স্ট এইড বক্স">প্রয়োজনীয় ওষুধ ও চিকিৎসা সাহায্য</option>
                    <option value="নগদ আর্থিক দান">নগদ অর্থ দান (সরাসরি দেখা করে)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">আপনার নাম:</label>
                    <input type="text" required value={donorName || ""} onChange={(e) => setDonorName(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-white text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">মোবাইল নম্বর:</label>
                    <input type="tel" required value={donorPhone || ""} onChange={(e) => setDonorPhone(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-white text-gray-700" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"><Send className="w-3.5 h-3.5" /> উপহার পাঠানোর বার্তা পাঠান</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "apply" && (
        <div className="bg-white border border-emerald-600/10 p-6 rounded-[28px] shadow-sm space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-1.5"><Users className="w-5 h-5 text-emerald-600" /> অসহায় বা এতিম শিশুর আশ্রয় আবেদন</h2>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">পুঠিয়া উপজেলায় কোনো নিঃস্ব, দরিদ্র অথবা পিতৃহীন বা মাতৃহীন অসহায় শিশু থাকলে, তাকে এতিমখানায় ভর্তি ও ফ্রি লালন-পালনের আশ্রয়ের জন্য আবেদন দাখিল করুন। সমাজসেবা অফিসার এবং মাদ্রাসার দায়িত্বশীলগণ আবেদনটি যাচাই করে ব্যবস্থা নেবেন।</p>
          </div>
          {appSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span>{appSuccess}</span></div>
          )}
          <form onSubmit={handleAdmissionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 mb-1">১. শিশুর নাম:</label>
                <input type="text" required placeholder="যেমন: মো: আরিফুল ইসলাম" value={childName || ""} onChange={(e) => setChildName(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 mb-1">২. বয়স (বৎসর):</label>
                <input type="number" required placeholder="যেমন: ৯" value={childAge || ""} onChange={(e) => setChildAge(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 mb-1">৩. লিঙ্গ:</label>
                <select value={childGender || ""} onChange={(e) => setChildGender(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option value="ছেলে">ছেলে</option>
                  <option value="মেয়ে">মেয়ে</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-gray-500 mb-1">৪. পছন্দের এতিমখানা (যদি থাকে):</label>
                <select value={selectedOrphanage || ""} onChange={(e) => setSelectedOrphanage(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  {orphanageList.map((o) => <option key={o.id} value={o.id || ""}>{o.name} ({o.union})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-500 mb-1">৫. আবেদনকারীর নাম:</label>
                <input type="text" required placeholder="যেমন: মো: আকরাম হোসেন" value={guardianName || ""} onChange={(e) => setGuardianName(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 mb-1">৬. আবেদনকারীর সচল মোবাইল নম্বর:</label>
                <input type="tel" required placeholder="যেমন: 017xxxxxxxx" value={guardianPhone || ""} onChange={(e) => setGuardianPhone(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-gray-500 mb-1">৭. ভর্তির কারণ ও বর্তমান অবস্থা:</label>
                <input type="text" required placeholder="যেমন: পিতৃহীন অসহায় শিশু, মা অন্যের বাড়ীতে কাজ করেন এবং পড়াশোনা করাতে অক্ষম।" value={reason || ""} onChange={(e) => setReason(e.target.value)} className="w-full py-2 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-[10px] text-gray-500 leading-snug">⚠️ <strong>সতর্কতা:</strong> ভুল বা অসত্য তথ্য দিয়ে আবেদন করা আইনত দণ্ডনীয়। প্রতিটি আবেদন স্থানীয় মেম্বার ও সংশ্লিষ্ট মাদ্রাসার কমিটির মাধ্যমে সরজমিনে তদন্ত করে সত্যতা প্রমাণ সাপেক্ষে ভর্তি নিশ্চিত করা হবে।</div>
            <button type="submit" className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"><Send className="w-3.5 h-3.5" /> আশ্রয় ও ভর্তি আবেদন প্রেরণ করুন</button>
          </form>
        </div>
      )}
    </div>
  );
}

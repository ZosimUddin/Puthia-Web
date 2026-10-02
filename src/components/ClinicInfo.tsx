import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Send, Sparkles, Building2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Clinic {
  id: string;
  name: string;
  location: string;
  time: string;
  services: string;
  phone: string;
  icon: string;
  tabs: string[];
}

const staticClinics: Clinic[] = [
  {
    id: "maternity_clinic",
    name: "পুঠিয়া মা ও শিশু জেনারেল ক্লিনিক",
    location: "থানা রোড, পুঠিয়া সদর।",
    time: "প্রতিদিন সকাল ৯:০০ — রাত ৯:০০",
    services: "গর্ভবতী মায়েদের নিয়মিত চেকআপ, নরমাল ও সিজারিয়ান ডেলিভারি, অভিজ্ঞ গাইনি সার্জন এবং নবজাতক শিশুদের বিশেষ চিকিৎসা সেবা।",
    phone: "01712112233",
    icon: "🤰",
    tabs: ["all", "maternity", "helpline"]
  },
  {
    id: "diabetic_clinic",
    name: "বানেশ্বর ডায়াবেটিক ও সেবা ক্লিনিক",
    location: "বানেশ্বর বাজার (কাঁচা বাজারের পশ্চিমে), পুঠিয়া।",
    time: "সকাল ৮:০০ — বিকেল ৪:০০",
    services: "ডায়াবেটিস রোগীদের নিয়মিত সাশ্রয়ী চেকআপ, ইনসুলিন গাইডলাইন, হরমোন টেস্ট এবং অভিজ্ঞ মেডিসিন বিশেষজ্ঞ ডাক্তারের পরামর্শ।",
    phone: "01713445566",
    icon: "🩺",
    tabs: ["all", "diagnostic", "helpline"]
  },
  {
    id: "padma_clinic",
    name: "পদ্মা ক্লিনিক ও নার্সিং হোম",
    location: "ঝলমলিয়া ট্রাফিক মোড়, পুঠিয়া।",
    time: "২৪ ঘণ্টা (জরুরি কেয়ার)",
    services: "যেকোনো ধরনের মাইনর ও মেজর অপারেশন পরবর্তী ২৪ ঘণ্টা নার্সিং কেয়ার, পোস্ট-অপারেティブ বেড সুবিধা এবং পেইন ম্যানেজমেন্ট থেরাপি।",
    phone: "01714778899",
    icon: "🏢",
    tabs: ["all", "helpline"]
  }
];

export const ClinicInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<"all" | "maternity" | "diagnostic" | "helpline">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Post states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newServices, setNewServices] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<"maternity" | "diagnostic" | "general">("general");
  const [isPosting, setIsPosting] = useState(false);

  // Firestore states
  const [dbClinics, setDbClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const q = query(collection(db, "clinics"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Clinic[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const typeTag = data.type || "general";
        const tabs = ["all", "helpline"];
        if (typeTag === "maternity") tabs.push("maternity");
        if (typeTag === "diagnostic") tabs.push("diagnostic");

        list.push({
          id: docSnap.id,
          name: data.name || "",
          location: data.location || "",
          time: data.time || "",
          services: data.services || "",
          phone: data.phone || "",
          icon: typeTag === "maternity" ? "🤰" : typeTag === "diagnostic" ? "🔬" : "🏢",
          tabs: tabs
        });
      });
      setDbClinics(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading clinics:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim() || !newTime.trim() || !newServices.trim() || !newPhone.trim()) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "clinics"), {
        name: newName.trim(),
        location: newLocation.trim(),
        time: newTime.trim(),
        services: newServices.trim(),
        phone: newPhone.trim(),
        type: newType,
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewName("");
      setNewLocation("");
      setNewTime("");
      setNewServices("");
      setNewPhone("");
      setNewType("general");
      setShowPostForm(false);
      alert("ক্লিনিক তথ্যটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting clinic:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ক্লিনিকটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "clinics", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting clinic:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const allClinics = [...dbClinics, ...staticClinics];
  const filteredClinics = allClinics.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.services.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    return c.tabs.includes(activeTab);
  });

  return (
    <div className="font-sans pb-10 space-y-6">
      <UnifiedHeroHeader
        badgeText="विशेषায়িত চিকিৎসা কেয়ার"
        title="ক্লিনিক ও নার্সিং হোম"
        subtitle="পুঠিয়া উপজেলার বিভিন্ন প্রাইভেট ক্লিনিক, মেটারনিটি হোম এবং বিশেষায়িত নার্সিং হোমগুলোর অবস্থান, সেবামূলক তথ্য ও সিরিয়াল বুকিং নম্বর।"
        icon={<Building2 size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="ক্লিনিকের নাম, সেবা বা এলাকা দিয়ে খুঁজুন..."
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
              onClick={() => setShowPostForm(!showPostForm)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showPostForm 
                  ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-400" 
                  : "bg-white text-[#004D40] hover:bg-teal-50 border-white/20"
              }`}
              title={showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন ক্লিনিক যোগ করুন"}
            >
              {showPostForm ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        }
      />

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 px-1">
        {[
          { id: 'all', label: 'সব ক্লিনিক', emoji: '🏢' },
          { id: 'maternity', label: 'মা ও শিশু কেয়ার', emoji: '🤰' },
          { id: 'diagnostic', label: 'টেস্ট/ডায়াগনস্টিক', emoji: '🔬' },
          { id: 'helpline', label: 'সিরিয়াল হেল্পলাইন', emoji: '📞' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#4DB6AC] text-zinc-900 border-[#4DB6AC] shadow-md font-bold"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm font-semibold"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Post Form */}
      <AnimatePresence>
        {showPostForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handlePostSubmit}
            className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md space-y-4 overflow-hidden mb-5 mx-1"
          >
            <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" /> নতুন ক্লিনিক ডিরেক্টরি এন্ট্রি
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              পুঠিয়া উপজেলার যেকোনো প্রাইভেট ক্লিনিক বা নার্সিং হোম সেন্টারের সেবা এবং ঠিকানা পোস্ট করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্লিনিকের ধরন: *</label>
                <select
                  value={newType || ""}
                  onChange={(e) => setNewType(e.target.value as "maternity" | "diagnostic" | "general")}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                >
                  <option value="general">🏢 সাধারণ ক্লিনিক/নার্সিং হোম (General)</option>
                  <option value="maternity">🤰 মা ও শিশু কেয়ার (Maternity Care)</option>
                  <option value="diagnostic">🔬 টেস্ট ও ডায়াগনস্টিক কেয়ার (Diagnostic)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্লিনিকের নাম: *</label>
                <input
                  type="text"
                  required
                  value={newName || ""}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: পুঠিয়া আল-মদিনা ক্লিনিক"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">অবস্থান/ঠিকানা: *</label>
                <input
                  type="text"
                  required
                  value={newLocation || ""}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="যেমন: ঝলমলিয়া ট্রাফিক মোড়, পুঠিয়া।"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">সাক্ষাৎ/খোলার সময়: *</label>
                <input
                  type="text"
                  required
                  value={newTime || ""}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="যেমন: সকাল ৯:০০ — রাত ৯:০০"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">মোবাইল/সিরিয়াল নম্বর: *</label>
              <input
                type="text"
                required
                value={newPhone || ""}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">উপলব্ধ সেবা: *</label>
              <textarea
                required
                rows={3}
                value={newServices || ""}
                onChange={(e) => setNewServices(e.target.value)}
                placeholder="যেমন: নবজাতক ও মায়েদের বিশেষ চিকিৎসা কেয়ার, ডিজিটাল এক্স-রে..."
                className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPosting}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-300 text-white text-xs font-black rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-teal-700/10"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  সাবমিট হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> সাবমিট করুন
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Clinics Directory Feed Section */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-teal-50 shadow-sm">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredClinics.length > 0 ? (
          filteredClinics.map((clinic) => {
            let buttonLabel = "📞 সিরিয়াল নিন";
            if (activeTab === "helpline") {
              buttonLabel = "📞 সিরিয়াল হেল্পলাইন";
            } else if (clinic.id === "diabetic_clinic") {
              buttonLabel = "📞 যোগাযোগ করুন";
            } else if (clinic.id === "padma_clinic") {
              buttonLabel = "📞 হেল্পলাইন";
            }

            const isCustom = !staticClinics.some(sc => sc.id === clinic.id);

            return (
              <div key={clinic.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition relative overflow-hidden">
                {/* Delete button for custom clinics */}
                {isCustom && (
                  <button
                    onClick={() => handleDelete(clinic.id)}
                    className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="w-16 h-16 rounded-full bg-[#E0F2F1] text-[#00695C] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner">
                   {clinic.icon}
                </div>
                <div className="flex flex-col justify-between py-1 flex-1 pr-8">
                  <div>
                    <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-2">{clinic.name}</h4>
                    <div className="space-y-1.5 mb-3">
                       <p className="text-sm text-gray-600 font-medium flex items-start gap-1">
                          <span className="shrink-0">📍</span> 
                          <span>{clinic.location}</span>
                       </p>
                       <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <span className="shrink-0">⏱️</span> 
                          <span>{clinic.time}</span>
                       </p>
                    </div>
                    <p className="text-sm text-gray-600 font-sans leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700">উপলব্ধ সেবা:</span> {clinic.services}
                    </p>
                  </div>
                  <a 
                    href={`tel:${clinic.phone}`}
                    className="text-sm font-bold text-center mt-4 flex items-center justify-center gap-2 w-full md:w-fit bg-[#E0F2F1] hover:bg-[#B2DFDB] px-5 py-2.5 rounded-xl transition text-[#00695C]"
                  >
                    {buttonLabel}
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-8 bg-white border border-gray-100 rounded-3xl shadow-sm mx-1">কোনো ক্লিনিক পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Send, Sparkles, Pill, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Pharmacy {
  id: string;
  name: string;
  tagline: string;
  location: string;
  time: string;
  details: string;
  phone: string;
  icon: string;
  tabs: string[];
  buttonLabel: string;
  isEmergency?: boolean;
}

const staticPharmacies: Pharmacy[] = [
  {
    id: "puthia_model",
    name: "পুঠিয়া মডেল ফার্মা",
    tagline: "সরকার অনুমোদিত মডেল ড্রাগ শপ",
    location: "উপজেলা স্বাস্থ্য কমপ্লেক্স গেটের বিপরীতে, পুঠিয়া সদর।",
    time: "সকাল ৭:০০ — রাত ১২:০০ (জরুরি হোম ডেলিভারি উপলব্ধ)",
    details: "এখানে সকল প্রকার দেশী-বিদেশী জীবনরক্ষাকারী ইনসুলিন, ভ্যাকসিন ও ওষুধ সঠিক তাপমাত্রায় সংরক্ষিত থাকে। প্রেসক্রিপশন অনুযায়ী অভিজ্ঞ এ-গ্রেড ফার্মাসিস্ট দ্বারা ওষুধ দেওয়া হয়।",
    phone: "01711223355",
    icon: "🏛️",
    tabs: ["all", "model_shop", "delivery"],
    buttonLabel: "📞 কল/ওষুধ অর্ডার"
  },
  {
    id: "janani_pharma",
    name: "জননী ফার্মেসি ও সার্জিক্যাল",
    tagline: "জরুরি সাপোর্ট (২৪ ঘণ্টা খোলা)",
    location: "ঝলমলিয়া বাজার (হাসপাতাল মোড়), পুঠিয়া।",
    time: "২৪ ঘণ্টা খোলা (দিন-রাত যেকোনো সময়)",
    details: "যেকোনো জরুরি দুর্ঘটনার প্রয়োজনীয় সার্জিক্যাল আইটেম, অক্সিজেন সিলিন্ডার সাপ্লাই এবং সব ধরনের জীবনরক্ষাকারী জরুরি ওষুধ এখানে গভীর রাতেও পাওয়া যায়।",
    phone: "01712223355",
    icon: "⏱️",
    tabs: ["all", "24_hours"],
    buttonLabel: "📞 জরুরি যোগাযোগ",
    isEmergency: true
  },
  {
    id: "baneshwar_drug",
    name: "বানেশ্বর ড্রাগ হাউজ",
    tagline: "রিটেইল ও হোলসেল ফার্মেসি",
    location: "বানেশ্বর বাজার (থানার সামনে), পুঠিয়া।",
    time: "সকাল ৮:০০ — রাত ১০:৩০",
    details: "বানেশ্বর অঞ্চলের অন্যতম বৃহৎ খুচরা ও পাইকারী ওষুধের দোকান। প্রেসক্রিপশনের ওষুধে বিশেষ ছাড়ের সুবিধা রয়েছে।",
    phone: "01713223355",
    icon: "📦",
    tabs: ["all", "delivery"],
    buttonLabel: "📞 যোগাযোগ করুন"
  }
];

export const PharmacyInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Post states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<string>("model-pharmacy");
  const [isPosting, setIsPosting] = useState(false);

  // Firestore states
  const [dbPharmacies, setDbPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const q = query(collection(db, "pharmacies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Pharmacy[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const typeVal = data.category || data.type || "other";
        
        const tabs = ["all", typeVal];
        if (typeVal === "24_hours" || typeVal === "24-hours-pharmacy" || typeVal === "২৪ ঘণ্টার ফার্মেসি") {
          tabs.push("24-hours-pharmacy", "24_hours");
        }
        if (typeVal === "model_shop" || typeVal === "model-pharmacy" || typeVal === "মডেল ফার্মেসি") {
          tabs.push("model-pharmacy", "model_shop");
        }
        if (typeVal === "delivery" || typeVal === "home-delivery-pharmacy" || typeVal === "হোম ডেলিভারি ফার্মেসি") {
          tabs.push("home-delivery-pharmacy", "delivery");
        }
        if (typeVal === "হাসপাতাল সংযুক্ত ফার্মেসি" || typeVal === "hospital-attached-pharmacy") {
          tabs.push("hospital-attached-pharmacy");
        }
        if (typeVal === "ইউনানি ফার্মেসি" || typeVal === "unani-pharmacy") {
          tabs.push("unani-pharmacy");
        }
        if (typeVal === "আয়ুর্বেদিক ফার্মেসি" || typeVal === "ayurvedic-pharmacy") {
          tabs.push("ayurvedic-pharmacy");
        }
        if (typeVal === "হোমিওপ্যাথিক ফার্মেসি" || typeVal === "homeopathic-pharmacy") {
          tabs.push("homeopathic-pharmacy");
        }
        if (typeVal === "ভেটেরিনারি ওষুধের দোকান" || typeVal === "veterinary-pharmacy") {
          tabs.push("veterinary-pharmacy");
        }

        let icon = "💊";
        if (tabs.includes("24-hours-pharmacy")) icon = "🌙";
        else if (tabs.includes("model-pharmacy")) icon = "🏪";
        else if (tabs.includes("hospital-attached-pharmacy")) icon = "🏥";
        else if (tabs.includes("home-delivery-pharmacy")) icon = "🛵";
        else if (tabs.includes("unani-pharmacy")) icon = "🌿";
        else if (tabs.includes("ayurvedic-pharmacy")) icon = "🍃";
        else if (tabs.includes("homeopathic-pharmacy")) icon = "💧";
        else if (tabs.includes("veterinary-pharmacy")) icon = "🐾";

        const isEmergency = tabs.includes("24-hours-pharmacy");

        list.push({
          id: docSnap.id,
          name: data.name || "",
          tagline: data.tagline || data.category || "ফার্মেসি ও ড্রাগ হাউস",
          location: data.address || data.location || "",
          time: data.openHours || data.time || "",
          details: data.details || data.description || "",
          phone: data.phone || "",
          icon: icon,
          tabs: tabs,
          buttonLabel: isEmergency ? "📞 জরুরি যোগাযোগ" : "📞 কল/ওষুধ অর্ডার",
          isEmergency: isEmergency
        });
      });
      setDbPharmacies(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading pharmacies:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim() || !newTime.trim() || !newDetails.trim() || !newPhone.trim()) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "pharmacies"), {
        name: newName.trim(),
        tagline: newTagline.trim() || "ফার্মেসি ও সার্জিক্যাল",
        location: newLocation.trim(),
        time: newTime.trim(),
        details: newDetails.trim(),
        phone: newPhone.trim(),
        type: newType,
        category: newType,
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewName("");
      setNewTagline("");
      setNewLocation("");
      setNewTime("");
      setNewDetails("");
      setNewPhone("");
      setNewType("model-pharmacy");
      setShowPostForm(false);
      alert("ফার্মেসি তথ্যটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting pharmacy:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ফার্মেসিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "pharmacies", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting pharmacy:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const allPharmacies = [...dbPharmacies, ...staticPharmacies];
  const filteredPharmacies = allPharmacies.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    return p.tabs.includes(activeTab);
  });

  return (
    <div className="font-sans pb-10 space-y-6">
      <UnifiedHeroHeader
        badgeText="২৪ ঘণ্টা মেডিসিন সাপোর্ট"
        title="ফার্মেসি ও ওষুধ"
        subtitle="পুঠিয়া উপজেলার প্রধান প্রধান ফার্মেসি, মডেল ড্রাগ শপ এবং ২৪ ঘণ্টা খোলা থাকা ওষুধের দোকানের তালিকা ও জরুরি যোগাযোগ নম্বর।"
        icon={<Pill size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="ফার্মেসির নাম, ধরন বা এলাকা দিয়ে খুঁজুন..."
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
              title={showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন ফার্মেসি যোগ করুন"}
            >
              {showPostForm ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {[
          { id: 'all', label: 'সব ফার্মেসি', emoji: '💊' },
          { id: 'model-pharmacy', label: 'মডেল ফার্মেসি', emoji: '🏪' },
          { id: 'hospital-attached-pharmacy', label: 'হাসপাতাল সংযুক্ত', emoji: '🏥' },
          { id: '24-hours-pharmacy', label: '২৪ ঘণ্টার ফার্মেসি', emoji: '🌙' },
          { id: 'home-delivery-pharmacy', label: 'হোম ডেলিভারি', emoji: '🛵' },
          { id: 'unani-pharmacy', label: 'ইউনানি ফার্মেসি', emoji: '🌿' },
          { id: 'ayurvedic-pharmacy', label: 'আয়ুর্বেদিক ফার্মেসি', emoji: '🍃' },
          { id: 'homeopathic-pharmacy', label: 'হোমিওপ্যাথিক', emoji: '💧' },
          { id: 'veterinary-pharmacy', label: 'ভেটেরিনারি', emoji: '🐾' },
          { id: 'other', label: 'অন্যান্য', emoji: '❓' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer border whitespace-nowrap text-xs font-bold ${
                isActive
                  ? "bg-teal-700 text-white border-teal-700 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
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
              <Sparkles className="w-5 h-5 text-teal-600" /> নতুন ফার্মেসি ডিরেক্টরি এন্ট্রি
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              পুঠিয়া উপজেলায় অবস্থিত যেকোনো খুচরা বা পাইকারী ওষুধের দোকান বা ড্রাগ স্টোরের বিস্তারিত ডিরেক্টরি পোস্ট করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ফার্মেসির ধরন: *</label>
                <select
                  value={newType || ""}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                >
                  <option value="model-pharmacy">🏪 মডেল ফার্মেসি</option>
                  <option value="hospital-attached-pharmacy">🏥 হাসপাতাল সংযুক্ত ফার্মেসি</option>
                  <option value="24-hours-pharmacy">🌙 ২৪ ঘণ্টার ফার্মেসি</option>
                  <option value="home-delivery-pharmacy">🛵 হোম ডেলিভারি ফার্মেসি</option>
                  <option value="unani-pharmacy">🌿 ইউনানি ফার্মেসি</option>
                  <option value="ayurvedic-pharmacy">🍃 আয়ুর্বেদিক ফার্মেসি</option>
                  <option value="homeopathic-pharmacy">💧 হোমিওপ্যাথিক ফার্মেসি</option>
                  <option value="veterinary-pharmacy">🐾 ভেটেরিনারি ওষুধের দোকান</option>
                  <option value="other">❓ অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ফার্মেসির নাম: *</label>
                <input
                  type="text"
                  required
                  value={newName || ""}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: পুঠিয়া ড্রাগ শপ"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ট্যাগলাইন/সংক্ষিপ্ত বার্তা (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={newTagline || ""}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="যেমন: সরকার অনুমোদিত মডেল ড্রাগ শপ"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">অবস্থান/ঠিকানা: *</label>
                <input
                  type="text"
                  required
                  value={newLocation || ""}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="যেমন: হাসপাতাল গেটের বিপরীতে, পুঠিয়া সদর"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">খোলার সময়সূচী: *</label>
                <input
                  type="text"
                  required
                  value={newTime || ""}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="যেমন: ২৪ ঘণ্টা খোলা অথবা সকাল ৭:০০ - রাত ১০:০০"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">সিরিয়াল/অর্ডার ফোন নম্বর: *</label>
                <input
                  type="text"
                  required
                  value={newPhone || ""}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">বিস্তারিত বিবরণ (ওষুধ সংরক্ষণ ও ডেলিভারি সম্পর্কে): *</label>
              <textarea
                required
                rows={3}
                value={newDetails || ""}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="যেমন: এখানে সকল প্রকার জীবনরক্ষাকারী ইনসুলিন ও ওষুধ সঠিক তাপমাত্রায় সংরক্ষিত থাকে..."
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

      {/* Pharmacy Directory Feed Section */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-teal-50 shadow-sm">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredPharmacies.length > 0 ? (
          filteredPharmacies.map((pharmacy) => {
            const isCustom = !staticPharmacies.some(sp => sp.id === pharmacy.id);

            return (
              <div key={pharmacy.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
                {/* Delete button for custom pharmacies */}
                {isCustom && (
                  <button
                    onClick={() => handleDelete(pharmacy.id)}
                    className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex gap-4 pr-6">
                  <div className="w-16 h-16 rounded-full bg-[#E0F2F1] text-[#00695C] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#4DB6AC]">
                     {pharmacy.icon}
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">{pharmacy.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{pharmacy.tagline}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                   <div className="flex items-start gap-2">
                      <span className="shrink-0 text-sm mt-0.5">📍</span> 
                      <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">ঠিকানা:</span> {pharmacy.location}</p>
                   </div>
                   <div className="flex items-start gap-2">
                      <span className="shrink-0 text-sm mt-0.5">⏱️</span> 
                      <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">সেবা সময়:</span> {pharmacy.time}</p>
                   </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-600 font-sans leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <span className="font-bold text-gray-700">বিবরণ:</span> {pharmacy.details}
                </p>
                
                <a 
                  href={`tel:${pharmacy.phone}`}
                  className={`text-sm font-bold text-center mt-5 flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl shadow-sm transition ${
                    pharmacy.isEmergency
                      ? "bg-[#EF5350] hover:bg-[#D32F2F] text-white"
                      : "bg-[#00695C] hover:bg-[#004D40] text-white"
                  }`}
                >
                  {pharmacy.buttonLabel}
                </a>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-8 bg-white border border-gray-100 rounded-3xl shadow-sm mx-1">কোনো ফার্মেসি পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
};

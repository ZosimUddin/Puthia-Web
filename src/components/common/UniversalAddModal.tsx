import React, { useState, useRef } from "react";
import { X, Plus, Shield, Heart, Home, Phone, FileText, Calendar, ShoppingBag, AlertCircle, CheckCircle2, Loader2, Award, Image as ImageIcon, Camera, Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

interface UniversalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

type AddCategory = 
  | "emergency" 
  | "notice" 
  | "tolet" 
  | "blood" 
  | "lostfound" 
  | "complaint" 
  | "event" 
  | "shop";

export const UniversalAddModal: React.FC<UniversalAddModalProps> = ({ isOpen, onClose, defaultCategory }) => {
  const [activeCategory, setActiveCategory] = useState<AddCategory>((defaultCategory as AddCategory) || "emergency");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && defaultCategory) {
      setActiveCategory(defaultCategory as AddCategory);
    }
  }, [isOpen, defaultCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("ছবিটির সাইজ ১০ মেগাবাইটের কম হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setUploadedImage(compressedDataUrl);
          setError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form States
  const [emergencyData, setEmergencyData] = useState({ label: "", phone: "", color: "indigo", bgColor: "indigo" });
  const [noticeData, setNoticeData] = useState({ title: "", content: "", category: "সাধারণ", isPinned: false });
  const [toletData, setToletData] = useState({ title: "", category: "ফ্ল্যাট", description: "", rent: "", location: "", ownerName: "", ownerPhone: "", details: "" });
  const [bloodData, setBloodData] = useState({ name: "", phone: "", bloodGroup: "A+", union: "", village: "", lastDonated: "" });
  const [lostFoundData, setLostFoundData] = useState({ type: "lost", title: "", description: "", contactPhone: "", reporterName: "", location: "", date: "" });
  const [complaintData, setComplaintData] = useState({ title: "", complainantName: "", complainantPhone: "", complainantEmail: "", category: "সাধারণ", unionName: "", description: "" });
  const [eventData, setEventData] = useState({ title: "", description: "", eventDate: "", eventTime: "", venue: "", category: "সামাজিক", organizer: "", contactPhone: "" });
  const [shopData, setShopData] = useState({ name: "", category: "মুদি দোকান", location: "", area: "পুঠিয়া বাজার", owner: "", desc: "", phone: "" });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let collectionName = "";
      let payload: any = {};

      const nowStr = new Date().toISOString();

      switch (activeCategory) {
        case "emergency":
          collectionName = "emergency_contacts";
          payload = {
            ...emergencyData,
            createdAt: nowStr
          };
          if (!payload.label || !payload.phone) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "notice":
          collectionName = "notices";
          payload = {
            ...noticeData,
            date: new Date().toLocaleDateString("bn-BD"),
            createdAt: nowStr
          };
          if (!payload.title || !payload.content) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "tolet":
          collectionName = "tolet_ads";
          payload = {
            ...toletData,
            createdAt: nowStr
          };
          if (!payload.title || !payload.rent || !payload.ownerPhone) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "blood":
          collectionName = "blood_donors";
          payload = {
            ...bloodData,
            status: "active",
            createdAt: nowStr
          };
          if (!payload.name || !payload.phone || !payload.bloodGroup) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "lostfound":
          collectionName = "lost_found";
          payload = {
            ...lostFoundData,
            createdAt: nowStr
          };
          if (!payload.title || !payload.description || !payload.contactPhone) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "complaint":
          collectionName = "complaints";
          payload = {
            ...complaintData,
            status: "Pending",
            actionLog: [],
            evidenceUrls: [],
            createdAt: nowStr
          };
          if (!payload.title || !payload.complainantName || !payload.complainantPhone || !payload.description) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "event":
          collectionName = "social_events";
          payload = {
            ...eventData,
            createdAt: nowStr
          };
          if (!payload.title || !payload.eventDate || !payload.venue || !payload.contactPhone) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;

        case "shop":
          collectionName = "local_shops";
          payload = {
            ...shopData,
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
            createdAt: nowStr
          };
          if (!payload.name || !payload.location || !payload.phone) throw new Error("অনুগ্রহ করে সব তারকা চিহ্নিত (*) তথ্য পূরণ করুন।");
          break;
      }

      if (uploadedImage) {
        payload.image = uploadedImage;
        payload.imageUrl = uploadedImage;
        payload.photo = uploadedImage;
        if (activeCategory === "complaint") {
          payload.evidenceUrls = [uploadedImage];
        }
      }

      await addDoc(collection(db, collectionName), payload);
      setSuccess(true);
    } catch (err: any) {
      console.error("Firestore Error in Universal Add Modal:", err);
      setError(err?.message || "তথ্যটি সংরক্ষণ করার সময় একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setError(null);
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEmergencyData({ label: "", phone: "", color: "indigo", bgColor: "indigo" });
    setNoticeData({ title: "", content: "", category: "সাধারণ", isPinned: false });
    setToletData({ title: "", category: "ফ্ল্যাট", description: "", rent: "", location: "", ownerName: "", ownerPhone: "", details: "" });
    setBloodData({ name: "", phone: "", bloodGroup: "A+", union: "", village: "", lastDonated: "" });
    setLostFoundData({ type: "lost", title: "", description: "", contactPhone: "", reporterName: "", location: "", date: "" });
    setComplaintData({ title: "", complainantName: "", complainantPhone: "", complainantEmail: "", category: "সাধারণ", unionName: "", description: "" });
    setEventData({ title: "", description: "", eventDate: "", eventTime: "", venue: "", category: "সামাজিক", organizer: "", contactPhone: "" });
    setShopData({ name: "", category: "মুদি দোকান", location: "", area: "পুঠিয়া বাজার", owner: "", desc: "", phone: "" });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className={`bg-white rounded-[24px] sm:rounded-[32px] ${defaultCategory ? 'max-w-xl' : 'max-w-2xl'} w-full overflow-hidden shadow-2xl border border-emerald-50 my-auto animate-scale-up max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#065f46] to-[#047857] text-white shrink-0">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">নাগরিক সংযুক্তি পোর্টাল</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            {activeCategory === "emergency" && "নতুন জরুরি নম্বর যুক্ত করুন"}
            {activeCategory === "notice" && "নতুন নোটিশ / ঘোষণা যুক্ত করুন"}
            {activeCategory === "tolet" && "নতুন বাসা ভাড়া / টু-লেট বিজ্ঞাপন দিন"}
            {activeCategory === "blood" && "নতুন রক্তদাতা নিবন্ধন করুন"}
            {activeCategory === "lostfound" && "নতুন হারানো / প্রাপ্তি বিজ্ঞপ্তি দিন"}
            {activeCategory === "complaint" && "নতুন অভিযোগ জমা দিন"}
            {activeCategory === "event" && "নতুন সামাজিক অনুষ্ঠান যুক্ত করুন"}
            {activeCategory === "shop" && "নতুন দোকান / ব্যবসা যুক্ত করুন"}
            {!activeCategory && "উপজেলা তথ্য ডিরেক্টরিতে নতুন তথ্য যুক্ত করুন"}
          </h3>
          <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium mt-1">
            {activeCategory === "emergency" && "ফায়ার সার্ভিস, পুলিশ বা অন্যান্য জরুরি সরকারি হেল্পলাইনের তথ্য প্রদান করুন।"}
            {activeCategory === "notice" && "পুঠিয়ার নাগরিকদের উদ্দেশ্যে জরুরি ঘোষণা বা নোটিশ দিন।"}
            {activeCategory === "tolet" && "বাসা, ফ্ল্যাট, মেস বা দোকান ভাড়ার বিবরণ দিন।"}
            {activeCategory === "blood" && "রক্তদাতা হিসেবে নিবন্ধন করুন বা নতুন দাতার তথ্য যুক্ত করুন।"}
            {activeCategory === "lostfound" && "যেকোনো হারানো বা প্রাপ্ত জিনিসপত্রের বিবরণ এখানে প্রকাশ করুন।"}
            {activeCategory === "complaint" && "নাগরিক সমস্যা ও যেকোনো অনিয়মের ব্যাপারে সরাসরি অভিযোগ জানান।"}
            {activeCategory === "event" && "সামাজিক, সাংস্কৃতিক বা কোনো মেলা-উৎসবের তথ্য প্রচার করুন।"}
            {activeCategory === "shop" && "পুঠিয়ার স্থানীয় দোকান, ব্যবসা প্রতিষ্ঠান বা সার্ভিসের তথ্য যুক্ত করুন।"}
            {!activeCategory && "আপনার প্রদান করা তথ্য পুঠিয়ার নাগরিকদের সেবা প্রদান করবে।"}
          </p>
        </div>

        {/* Inner layout split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Category Tabs (Sidebar on MD, top bar on small) */}
          {!defaultCategory && (
            <div className="w-full md:w-56 bg-slate-50 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 shrink-0 no-scrollbar">
              <button
                onClick={() => { setActiveCategory("emergency"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "emergency" ? "bg-indigo-50 border border-indigo-200/50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Phone size={14} className={activeCategory === "emergency" ? "text-indigo-600" : "text-slate-400"} />
                জরুরি নম্বর
              </button>

              <button
                onClick={() => { setActiveCategory("notice"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "notice" ? "bg-emerald-50 border border-emerald-200/50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText size={14} className={activeCategory === "notice" ? "text-emerald-600" : "text-slate-400"} />
                নোটিশ / ঘোষণা
              </button>

              <button
                onClick={() => { setActiveCategory("tolet"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "tolet" ? "bg-amber-50 border border-amber-200/50 text-amber-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home size={14} className={activeCategory === "tolet" ? "text-amber-600" : "text-slate-400"} />
                বাসা ভাড়া / টু-লেট
              </button>

              <button
                onClick={() => { setActiveCategory("blood"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "blood" ? "bg-rose-50 border border-rose-200/50 text-rose-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Heart size={14} className={activeCategory === "blood" ? "text-rose-600" : "text-slate-400"} />
                রক্তদাতা নিবন্ধন
              </button>

              <button
                onClick={() => { setActiveCategory("lostfound"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "lostfound" ? "bg-sky-50 border border-sky-200/50 text-sky-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Shield size={14} className={activeCategory === "lostfound" ? "text-sky-600" : "text-slate-400"} />
                হারানো / প্রাপ্তি
              </button>

              <button
                onClick={() => { setActiveCategory("complaint"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "complaint" ? "bg-red-50 border border-red-200/50 text-red-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <AlertCircle size={14} className={activeCategory === "complaint" ? "text-red-600" : "text-slate-400"} />
                অভিযোগ জমা দিন
              </button>

              <button
                onClick={() => { setActiveCategory("event"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "event" ? "bg-teal-50 border border-teal-200/50 text-teal-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Calendar size={14} className={activeCategory === "event" ? "text-teal-600" : "text-slate-400"} />
                সামাজিক অনুষ্ঠান
              </button>

              <button
                onClick={() => { setActiveCategory("shop"); setError(null); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === "shop" ? "bg-violet-50 border border-violet-200/50 text-violet-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShoppingBag size={14} className={activeCategory === "shop" ? "text-violet-600" : "text-slate-400"} />
                দোকান / ব্যবসা
              </button>
            </div>
          )}

          {/* Content panel */}
          <div className="flex-1 p-5 overflow-y-auto">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 shadow-sm">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <h4 className="text-base font-black text-slate-800">তথ্যটি সফলভাবে সংরক্ষিত হয়েছে!</h4>
                <p className="text-xs font-bold text-slate-500 max-w-sm mt-1.5">পুঠিয়া তথ্য পোর্টালে আপনার অবদান সফলভাবে ডিরেক্টরিতে সংরক্ষণ করা হয়েছে। অন্যান্য নাগরিকরা এখন এটি দেখতে পাবেন।</p>
                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#065f46] to-[#047857] hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-700/10 active:scale-95"
                >
                  আরেকটি তথ্য যোগ করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-red-700 animate-fade-in text-xs font-bold leading-relaxed">
                    <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* EMERGENCY FORM */}
                {activeCategory === "emergency" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 text-[11px] font-bold text-indigo-800">
                      ফায়ার সার্ভিস, পুলিশ, হাসপাতাল, বা যেকোনো সরকারি সাহায্যকারী টিমের গুরুত্বপূর্ণ বা জরুরি মোবাইল বা ল্যান্ডলাইন নম্বরটি এখানে দিন।
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">প্রতিষ্ঠানের নাম বা পদের নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: পুঠিয়া ফায়ার সার্ভিস স্টেশন"
                        value={emergencyData.label || ""}
                        onChange={(e) => setEmergencyData({ ...emergencyData, label: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">মোবাইল বা টেলিফোন নম্বর *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: +৮৮০১৭১২-৩৪৫৬৭৮"
                        value={emergencyData.phone || ""}
                        onChange={(e) => setEmergencyData({ ...emergencyData, phone: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* NOTICE FORM */}
                {activeCategory === "notice" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">নোটিশের শিরোনাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: পুঠিয়া রাজবাড়ি মাঠে কৃষি প্রদর্শনী মেলা শুরু"
                        value={noticeData.title || ""}
                        onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">নোটিশের ধরণ / ক্যাটাগরি</label>
                      <select
                        value={noticeData.category || ""}
                        onChange={(e) => setNoticeData({ ...noticeData, category: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="সাধারণ">সাধারণ নোটিশ</option>
                        <option value="জরুরি">জরুরি ঘোষণা</option>
                        <option value="নিয়োগ">নিয়োগ বিজ্ঞপ্তি</option>
                        <option value="প্রশিক্ষণ">প্রশিক্ষণ ঘোষণা</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিস্তারিত বিবরণ *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="নোটিশের বিস্তারিত তথ্য এখানে লিখুন..."
                        value={noticeData.content || ""}
                        onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* TO-LET FORM */}
                {activeCategory === "tolet" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিজ্ঞাপনের শিরোনাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: পুঠিয়া বাজারের নিকটে দুই রুমের ফ্যামিলি বাসা ভাড়া"
                        value={toletData.title || ""}
                        onChange={(e) => setToletData({ ...toletData, title: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ভাড়ার ধরণ</label>
                        <select
                          value={toletData.category || ""}
                          onChange={(e) => setToletData({ ...toletData, category: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="ফ্ল্যাট">ফ্ল্যাট বাসা</option>
                          <option value="মেস">মেস / সাবলেট</option>
                          <option value="দোকান">দোকান ঘর</option>
                          <option value="অফিস">অফিস স্পেস</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ভাড়ার পরিমাণ (টাকা/মাস) *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ৮,৫০০ টাকা"
                          value={toletData.rent || ""}
                          onChange={(e) => setToletData({ ...toletData, rent: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">ঠিকানা / অবস্থান *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: কলেজ রোড, পুঠিয়া পৌরসভা"
                        value={toletData.location || ""}
                        onChange={(e) => setToletData({ ...toletData, location: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">মালিক / যোগাযোগের নাম</label>
                        <input
                          type="text"
                          placeholder="যেমন: মো: কামরুজ্জামান"
                          value={toletData.ownerName || ""}
                          onChange={(e) => setToletData({ ...toletData, ownerName: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">যোগাযোগের মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ০১৭XXXXXXXX"
                          value={toletData.ownerPhone || ""}
                          onChange={(e) => setToletData({ ...toletData, ownerPhone: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিস্তারিত বিবরণ (ফ্ল্যাট সাইজ, রুম সংখ্যা ইত্যাদি)</label>
                      <textarea
                        rows={2}
                        placeholder="যেমন: ৩টি বেডরুম, ২টি বাথরুম এবং বড় বারান্দা সহ সম্পূর্ণ টাইলস করা বাসা।"
                        value={toletData.details || ""}
                        onChange={(e) => setToletData({ ...toletData, details: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* BLOOD DONOR REGISTER */}
                {activeCategory === "blood" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/30 text-[11px] font-bold text-rose-800">
                      রক্তদাতা হিসেবে নিবন্ধন করে যেকোনো জরুরি পরিস্থিতিতে মানুষের জীবন বাঁচাতে আপনার নাম যুক্ত করুন।
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">রক্তদাতার নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: সায়মন আহমেদ"
                          value={bloodData.name || ""}
                          onChange={(e) => setBloodData({ ...bloodData, name: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">রক্তের গ্রুপ *</label>
                        <select
                          value={bloodData.bloodGroup || ""}
                          onChange={(e) => setBloodData({ ...bloodData, bloodGroup: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer text-rose-700"
                        >
                          <option value="A+">A+ (এ পজিটিভ)</option>
                          <option value="A-">A- (এ নেগেটিভ)</option>
                          <option value="B+">B+ (বি পজিটিভ)</option>
                          <option value="B-">B- (বি নেগেটিভ)</option>
                          <option value="AB+">AB+ (এবি পজিটিভ)</option>
                          <option value="AB-">AB- (এবি নেগেটিভ)</option>
                          <option value="O+">O+ (ও পজিটিভ)</option>
                          <option value="O-">O- (ও নেগেটিভ)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ০১৭XXXXXXXX"
                        value={bloodData.phone || ""}
                        onChange={(e) => setBloodData({ ...bloodData, phone: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ইউনিয়ন</label>
                        <input
                          type="text"
                          placeholder="যেমন: পুঠিয়া ইউনিয়ন"
                          value={bloodData.union || ""}
                          onChange={(e) => setBloodData({ ...bloodData, union: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">গ্রাম</label>
                        <input
                          type="text"
                          placeholder="যেমন: রাজবাড়ি পাড়া"
                          value={bloodData.village || ""}
                          onChange={(e) => setBloodData({ ...bloodData, village: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-rose-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* LOST & FOUND FORM */}
                {activeCategory === "lostfound" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিজ্ঞপ্তির ধরণ</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLostFoundData({ ...lostFoundData, type: "lost" })}
                          className={`p-2.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            lostFoundData.type === "lost" ? "bg-red-50 border-red-300 text-red-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <AlertCircle size={14} /> হারিয়ে গেছে
                        </button>
                        <button
                          type="button"
                          onClick={() => setLostFoundData({ ...lostFoundData, type: "found" })}
                          className={`p-2.5 rounded-xl border text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            lostFoundData.type === "found" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle2 size={14} /> খুঁজে পেয়েছি
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিজ্ঞপ্তির বিষয় / শিরোনাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: রাজবাড়ি মাঠে একটি গুরুত্বপূর্ণ ফাইল হারানো গিয়েছে"
                        value={lostFoundData.title || ""}
                        onChange={(e) => setLostFoundData({ ...lostFoundData, title: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">বিস্তারিত বিবরণ *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="কোথায় হারিয়েছে/পাওয়া গেছে, বস্তুর বিবরণ ইত্যাদি সুন্দরভাবে লিখুন..."
                        value={lostFoundData.description || ""}
                        onChange={(e) => setLostFoundData({ ...lostFoundData, description: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">যোগাযোগকারী ব্যক্তির নাম</label>
                        <input
                          type="text"
                          placeholder="যেমন: মো: শাহীন রেজা"
                          value={lostFoundData.reporterName || ""}
                          onChange={(e) => setLostFoundData({ ...lostFoundData, reporterName: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">যোগাযোগের মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ০১৭XXXXXXXX"
                          value={lostFoundData.contactPhone || ""}
                          onChange={(e) => setLostFoundData({ ...lostFoundData, contactPhone: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPLAINT FORM */}
                {activeCategory === "complaint" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">অভিযোগের প্রধান বিষয় *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: রাস্তায় ময়লা ফেলা বা স্ট্রিট লাইট নষ্ট হওয়া"
                        value={complaintData.title || ""}
                        onChange={(e) => setComplaintData({ ...complaintData, title: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ক্যাটাগরি</label>
                        <select
                          value={complaintData.category || ""}
                          onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="সড়ক ও যোগাযোগ">সড়ক ও যোগাযোগ</option>
                          <option value="বর্জ্য ব্যবস্থাপনা">বর্জ্য ব্যবস্থাপনা</option>
                          <option value="বিদ্যুৎ / পানি">বিদ্যুৎ / পানি সরবরাহ</option>
                          <option value="আইন-শৃঙ্খলা">আইন-শৃঙ্খলা সমস্যা</option>
                          <option value="অন্যান্য">অন্যান্য সমস্যা</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ইউনিয়ন / এলাকা</label>
                        <input
                          type="text"
                          placeholder="যেমন: পুঠিয়া পৌরসভা"
                          value={complaintData.unionName || ""}
                          onChange={(e) => setComplaintData({ ...complaintData, unionName: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">অভিযোগকারীর নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: মো: আরিফুল ইসলাম"
                          value={complaintData.complainantName || ""}
                          onChange={(e) => setComplaintData({ ...complaintData, complainantName: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ০১৭XXXXXXXX"
                          value={complaintData.complainantPhone || ""}
                          onChange={(e) => setComplaintData({ ...complaintData, complainantPhone: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">অভিযোগের বিস্তারিত বিবরণ *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="অভিযোগটির বিবরণ ও এর প্রভাব সম্পর্কে বিস্তারিত লিখুন..."
                        value={complaintData.description || ""}
                        onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* SOCIAL EVENTS FORM */}
                {activeCategory === "event" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">অনুষ্ঠানের শিরোনাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: রক্তদান কর্মসূচী ও ফ্রী মেডিকেল ক্যাম্প"
                        value={eventData.title || ""}
                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">অনুষ্ঠানের তারিখ *</label>
                        <input
                          type="date"
                          required
                          value={eventData.eventDate || ""}
                          onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">অনুষ্ঠানের সময়</label>
                        <input
                          type="text"
                          placeholder="যেমন: সকাল ৯:০০ টা"
                          value={eventData.eventTime || ""}
                          onChange={(e) => setEventData({ ...eventData, eventTime: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">অনুষ্ঠানের স্থান / ভেন্যু *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: পুঠিয়া পি. এন. সরকারি উচ্চ বিদ্যালয় মাঠ"
                        value={eventData.venue || ""}
                        onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">আয়োজক সংস্থা</label>
                        <input
                          type="text"
                          placeholder="যেমন: পুঠিয়া যুব কল্যাণ সংঘ"
                          value={eventData.organizer || ""}
                          onChange={(e) => setEventData({ ...eventData, organizer: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">আয়োজকের মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ০১৭XXXXXXXX"
                          value={eventData.contactPhone || ""}
                          onChange={(e) => setEventData({ ...eventData, contactPhone: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* LOCAL SHOP / BUSINESS */}
                {activeCategory === "shop" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">দোকান বা ব্যবসার নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ভাই ভাই কুটির শিল্প ও মিষ্টান্ন ভাণ্ডার"
                        value={shopData.name || ""}
                        onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">ব্যবসার ধরণ</label>
                        <select
                          value={shopData.category || ""}
                          onChange={(e) => setShopData({ ...shopData, category: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="মুদি দোকান">মুদি ও কসমেটিক্স</option>
                          <option value="মিষ্টান্ন ভাণ্ডার">মিষ্টান্ন ও হোটেল</option>
                          <option value="হার্ডওয়্যার">হার্ডওয়্যার ও ইলেকট্রনিক্স</option>
                          <option value="ফার্মেসী">মেডিসিন ও ফার্মেসী</option>
                          <option value="পোশাক ঘর">পোশাক ও টেইলার্স</option>
                          <option value="অন্যান্য">অন্যান্য ব্যবসা</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">এলাকা / বাজার</label>
                        <input
                          type="text"
                          placeholder="যেমন: পুঠিয়া বাজার"
                          value={shopData.area || ""}
                          onChange={(e) => setShopData({ ...shopData, area: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">মালিকের নাম</label>
                        <input
                          type="text"
                          placeholder="যেমন: আলহাজ্ব মো: আব্দুল কুদ্দুস"
                          value={shopData.owner || ""}
                          onChange={(e) => setShopData({ ...shopData, owner: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">যোগাযোগের মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ০১৭XXXXXXXX"
                          value={shopData.phone || ""}
                          onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 block mb-1">সঠিক ঠিকানা / অবস্থান *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: তিন কোনা মোড়, রাজবাড়ী গেট সংলগ্ন, পুঠিয়া"
                        value={shopData.location || ""}
                        onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200/90 p-3 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Universal Image Upload Box */}
                <div className="space-y-1.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 my-3">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-[#065f46]" />
                    <span>ছবি আপলোড করুন (ঐচ্ছিক)</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {uploadedImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-200 mt-2 bg-white p-2 flex items-center gap-3">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0 text-xs font-bold text-slate-700">
                        <p className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 size={14} /> ছবি প্রস্তুত রয়েছে
                        </p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          সংরক্ষণের সাথে ছবিটি প্রকাশ হবে
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none cursor-pointer"
                        title="ছবি মুছে ফেলুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50/50 border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-xl text-xs font-black text-[#065f46] flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                    >
                      <Camera size={16} />
                      <span>গ্যালারি বা ক্যামেরা থেকে ছবি সংযুক্ত করুন</span>
                    </button>
                  )}
                </div>

                {/* Bottom submit buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleReset();
                      onClose();
                    }}
                    className="px-4.5 py-2.5 rounded-2xl text-xs font-black bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer border border-slate-200/60"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#065f46] to-[#047857] hover:from-emerald-700 hover:to-emerald-800 text-white transition-all cursor-pointer shadow-lg shadow-emerald-700/10 flex items-center justify-center gap-2 min-w-[110px] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>সংরক্ষণ...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className="text-white" />
                        <span>সংরক্ষণ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

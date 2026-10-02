import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, GraduationCap, MapPin, Phone, BookOpen, Home, 
  Plus, Send, X, Loader2, Trash2, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface Props { onGoBack: () => void; }

interface EduItem {
  id: string;
  category: "tuition" | "private" | "coaching";
  type: string;
  title: string;
  subtitle: string;
  details: string[];
  location: string;
  phone: string;
}

const staticItems: EduItem[] = [
  // 1. হোম টিউশনি (Home Tuition)
  {
    id: "t1",
    category: "tuition",
    type: "হোম টিউটর",
    title: "মোঃ শরিফুল ইসলাম",
    subtitle: "এমএসসি (গণিত), রাজশাহী বিশ্ববিদ্যালয়",
    details: ["শ্রেণী: ৮ম - ১০ম শ্রেণী", "বিষয়: গণিত ও উচ্চতর গণিত", "অভিজ্ঞতা: ৫ বছরের বেশি"],
    location: "পুঠিয়া সদর, কানাইপাড়া, বাশপুকুরিয়া",
    phone: "01712345678"
  },
  {
    id: "t2",
    category: "tuition",
    type: "হোম টিউটর",
    title: "মোসাম্মৎ ফাতেমা খাতুন",
    subtitle: "বিএ (ইংরেজি), রাজশাহী কলেজ",
    details: ["শ্রেণী: ১ম - ৫ম শ্রেণী (সকল বিষয়)", "শ্রেণী: ৬ষ্ঠ - ৮ম শ্রেণী (ইংরেজি)", "মহিলা ও শিশু ব্যাচ অগ্রাধিকার"],
    location: "বানেশ্বর বাজার, খুটিপাড়া",
    phone: "01723456789"
  },
  {
    id: "t3",
    category: "tuition",
    type: "হোম টিউটর",
    title: "তানভীর আহমেদ",
    subtitle: "বিএসসি ইন সিএসই, রুয়েট (RUET)",
    details: ["শ্রেণী: একাদশ - দ্বাদশ শ্রেণী", "বিষয়: আইসিটি (ICT) ও পদার্থবিজ্ঞান", "এইচএসসি জিপিএ ৫ প্রাপ্ত টিউটর"],
    location: "পুঠিয়া রাজবাড়ী সংলগ্ন এলাকা",
    phone: "01734567890"
  },
  // 2. প্রাইভেট রুম (Private Room / Private Batches)
  {
    id: "p1",
    category: "private",
    type: "প্রাইভেট ব্যাচ",
    title: "রফিক স্যারের ইংরেজি প্রাইভেট কেয়ার",
    subtitle: "মোঃ রফিকুল ইসলাম (সিনিয়র সহকারী শিক্ষক, পিএন স্কুল)",
    details: ["শ্রেণী: ৯ম - দ্বাদশ শ্রেণী (ইংরেজি ১ম ও ২য় পত্র)", "বৈশিষ্ট্য: ব্যাচ ভিত্তিক বিশেষ লেকচার শিট", "সময়: সকাল ৭টা - ৯টা এবং বিকাল ৪টা - ৬টা"],
    location: "পুঠিয়া গার্লস স্কুল রোড, পুঠিয়া সদর",
    phone: "01745678901"
  },
  {
    id: "p2",
    category: "private",
    type: "প্রাইভেট ব্যাচ",
    title: "ম্যাথ হ্যাক্স (Math Hacks) প্রাইভেট রুম",
    subtitle: "ইঞ্জি. এ. কে. আজাদ (রুয়েট)",
    details: ["শ্রেণী: এসএসসি ও এইচএসসি", "বিষয়: উচ্চতর গণিত ও পদার্থবিজ্ঞান", "বৈশিষ্ট্য: ওএমআর ভিত্তিক নিয়মিত পরীক্ষা ও মূল্যায়ন"],
    location: "বানেশ্বর কলেজ রোড, বানেশ্বর",
    phone: "01756789012"
  },
  // 3. কোচিং সেন্টার (Coaching Center)
  {
    id: "c1",
    category: "coaching",
    type: "কোচিং সেন্টার",
    title: "ইউনিক এডমিশন কেয়ার (Unique Admission Care)",
    subtitle: "এইচ এম তারেক ও টিম",
    details: ["কোর্স : বিশ্ববিদ্যালয় ভর্তি (ক, খ, গ ইউনিট)", "কোর্স : মেডিকেল ও ডেন্টাল প্রস্তুতি ব্যাচ", "সরাসরি অভিজ্ঞ মেন্টর দ্বারা ক্লাস পরিচালনা"],
    location: "বানেশ্বর ট্রাফিক মোড়, পুঠিয়া",
    phone: "01767890123"
  },
  {
    id: "c2",
    category: "coaching",
    type: "ক্যাডেট ও একাডেমিক কেয়ার",
    title: "সূর্যমুখী ক্যাডেট অ্যাকাডেমি",
    subtitle: "ক্যাডেট কলেজ ও ৩য়-৮ম শ্রেণী একাডেমিক প্রস্তুতি",
    details: ["ক্যাডেট কলেজ ভর্তি পরীক্ষার স্পেশাল গাইডলাইন", "বিষয়ভিত্তিক রিভিশন ও ওএমআর টেস্ট", "দুর্বল শিক্ষার্থীদের জন্য বিশেষ কেয়ার"],
    location: "পুঠিয়া ডাকবাংলোর পেছনে, পুঠিয়া সদর",
    phone: "01778901234"
  },
  {
    id: "c3",
    category: "coaching",
    type: "আইটি অ্যান্ড ট্রেনিং সেন্টার",
    title: "আইটি স্কিলস লার্নিং সেন্টার",
    subtitle: "বেসিক কম্পিউটার, গ্রাফিক্স ডিজাইন ও ফ্রিল্যান্সিং",
    details: ["কোর্স: কম্পিউটার অফিস অ্যাপ্লিকেশন", "কোর্স: প্রফেশনাল গ্রাফিক্স ও আউটসোর্সিং", "বৈশিষ্ট্য: প্রতিটি শিক্ষার্থীর জন্য আলাদা পিসি"],
    location: "আর কে প্লাজা, ২য় তলা, বানেশ্বর বাজার",
    phone: "01789012345"
  }
];

export const EducationCoachingHub: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"tuition" | "private" | "coaching">("tuition");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbItems, setDbItems] = useState<EduItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState<"tuition" | "private" | "coaching">("tuition");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from Firestore
  useEffect(() => {
    const q = query(collection(db, "education_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: EduItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          category: data.category || "tuition",
          type: data.type || "",
          title: data.title || "",
          subtitle: data.subtitle || "",
          details: Array.isArray(data.details) ? data.details : [],
          location: data.location || "",
          phone: data.phone || "",
        });
      });
      setDbItems(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading education posts:", error);
      setIsLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "education_posts");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Post a listing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !location.trim() || !phone.trim()) {
      alert("দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      // Split details text by line break to make bullet points
      const detailsList = detailsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const defaultType = type.trim() || (
        formCategory === "tuition" ? "হোম টিউটর" : 
        formCategory === "private" ? "প্রাইভেট ব্যাচ" : "কোচিং সেন্টার"
      );

      await addDoc(collection(db, "education_posts"), {
        category: formCategory,
        type: defaultType,
        title: title.trim(),
        subtitle: subtitle.trim(),
        details: detailsList,
        location: location.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp(),
      });

      // Clear states
      setTitle("");
      setSubtitle("");
      setDetailsText("");
      setLocation("");
      setPhone("");
      setType("");
      setShowForm(false);
      alert("বিজ্ঞপ্তিটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      handleFirestoreError(err, OperationType.CREATE, "education_posts");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a listing
  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "education_posts", id));
      alert("বিজ্ঞপ্তিটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
      handleFirestoreError(err, OperationType.DELETE, `education_posts/${id}`);
    }
  };

  const allItems = [...dbItems, ...staticItems];

  const filteredItems = allItems.filter(
    (item) =>
      item.category === filter &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans pb-10 min-h-screen bg-gray-50">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #0f172a, #0f766e)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border-none"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-cyan-400 text-sm font-medium mb-2 uppercase tracking-wide">পুঠিয়ার শ্রেষ্ঠ শিক্ষা জ্ঞানভাণ্ডার</p>
          <h1 className="text-4xl font-black mb-1 text-white">শিক্ষা ও কোচিং</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়া উপজেলার সকল স্কুল, college, মাদ্রাসা, কোচিং সেন্টার এবং লাইব্রেরির তালিকা, অবস্থান ও যোগাযোগ তথ্য।
          </p>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <GraduationCap className="w-48 h-48 text-white rotate-12" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Post Button */}
        <div className="px-1">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-[#0f766e] hover:bg-[#0d5c56] text-white font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 active:scale-[0.99] border-none"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন তথ্য / বিজ্ঞপ্তি পোস্ট করুন"}
          </button>
        </div>

        {/* Post Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md space-y-4 overflow-hidden"
            >
              <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" /> নতুন টিউটর বা প্রতিষ্ঠানের তথ্য দিন
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                আপনার টিউটরিং সার্ভিস, প্রাইভেট ব্যাচ বা কোচিং সেন্টারের তথ্য দিয়ে শিক্ষার্থীদের সাহায্য করুন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ধাপ / ক্যাটাগরি: *</label>
                  <select
                    value={formCategory || ""}
                    onChange={(e) => {
                      setFormCategory(e.target.value as "tuition" | "private" | "coaching");
                      setType(""); // reset type to use placeholder
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="tuition">🏠 হোম টিউশনি (Tuition)</option>
                    <option value="private">📖 প্রাইভেট রুম (Private Batches)</option>
                    <option value="coaching">🏫 কোচিং সেন্টার (Coaching Center)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ধরন (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={type || ""}
                    onChange={(e) => setType(e.target.value)}
                    placeholder={formCategory === "tuition" ? "যেমন: হোম টিউটর" : formCategory === "private" ? "যেমন: প্রাইভেট ব্যাচ" : "যেমন: কোচিং সেন্টার"}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {formCategory === "tuition" ? "শিক্ষক/টিউটরের নাম: *" : formCategory === "private" ? "প্রাইভেট ব্যাচের নাম: *" : "কোচিং সেন্টারের নাম: *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={title || ""}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={formCategory === "tuition" ? "যেমন: মোঃ শরিফুল ইসলাম" : "যেমন: ইউনিক এডমিশন কেয়ার"}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">পদবী/উপাধি/যোগ্যতা/পরিচালক: *</label>
                  <input
                    type="text"
                    required
                    value={subtitle || ""}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="যেমন: এমএসসি (গণিত), রাজশাহী বিশ্ববিদ্যালয়"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">বিস্তারিত বিবরণ (প্রতি লাইনে ১টি করে তথ্য দিন): *</label>
                <textarea
                  required
                  rows={3}
                  value={detailsText || ""}
                  onChange={(e) => setDetailsText(e.target.value)}
                  placeholder="যেমন:&#10;শ্রেণী: ৮ম - ১০ম শ্রেণী&#10;বিষয়: গণিত ও উচ্চতর গণিত&#10;অভিজ্ঞতা: ৫ বছরের বেশি"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">লোকেশন/ঠিকানা: *</label>
                  <input
                    type="text"
                    required
                    value={location || ""}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: পুঠিয়া সদর, কানাইপাড়া"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">যোগাযোগের মোবাইল নম্বর: *</label>
                  <input
                    type="tel"
                    required
                    value={phone || ""}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-black rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-teal-600/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    বিজ্ঞপ্তি সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> সার্কুলার পোস্ট করুন
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${filter === "tuition" ? "শিক্ষক বা বিষয়ের নাম দিয়ে খুঁজুন..." : filter === "private" ? "প্রাইভেট ব্যাচ বা শিক্ষকের নাম দিয়ে খুঁজুন..." : "কোচিং সেন্টারের নাম দিয়ে খুঁজুন..."}`} 
            className="w-full bg-white border border-slate-200 shadow-sm rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] transition-all"
          />
        </div>

        {/* Category Tabs (3 Options grid) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          <button
            onClick={() => { setFilter("tuition"); setSearchQuery(""); }}
            className={`py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "tuition"
                ? "bg-[#0f172a] text-[#22d3ee] border border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-slate-50"
            }`}
          >
            <Home className={`w-3.5 h-3.5 ${filter === "tuition" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            <span>হোম টিউশনি</span>
          </button>
          
          <button
            onClick={() => { setFilter("private"); setSearchQuery(""); }}
            className={`py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "private"
                ? "bg-[#0f172a] text-[#22d3ee] border border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-slate-50"
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${filter === "private" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            <span>প্রাইভেট রুম</span>
          </button>
          
          <button
            onClick={() => { setFilter("coaching"); setSearchQuery(""); }}
            className={`py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "coaching"
                ? "bg-[#0f172a] text-[#22d3ee] border border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-slate-50"
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${filter === "coaching" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            <span>কোচিং সেন্টার</span>
          </button>
        </div>

        {/* List of filtered cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">বিজ্ঞপ্তি লোড করা হচ্ছে...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isUserPost = !staticItems.some(si => si.id === item.id);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl p-5 shadow-lg border border-teal-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in group hover:border-[#22d3ee]/50 transition-colors"
                    >
                      {/* Post Type Tag & Delete button for User Submitted items */}
                      <div className="absolute top-0 right-0 flex items-center">
                        {isUserPost && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-bl-xl border-l border-b border-red-100 transition cursor-pointer border-none"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="py-1 px-3 bg-[#0f766e]/10 text-[#0f766e] text-[10px] font-black rounded-bl-xl tracking-wider">
                          {item.type}
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start pr-16 mt-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                          {item.category === "tuition" ? (
                            <Home className="w-6 h-6 text-[#0f766e]" />
                          ) : item.category === "private" ? (
                            <BookOpen className="w-6 h-6 text-[#0f766e]" />
                          ) : (
                            <GraduationCap className="w-6 h-6 text-[#0f766e]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800 leading-tight">{item.title}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>

                      {/* Details bullet/points block */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 mt-1">
                        {item.details.map((detail, index) => (
                          <p key={index} className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                            {detail}
                          </p>
                        ))}
                        <p className="text-xs text-slate-600 font-medium flex items-start gap-1.5 pt-1 border-t border-slate-200/60 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
                          <span>লোকেশন: {item.location}</span>
                        </p>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex gap-2 w-full mt-1">
                        <a 
                          href={`tel:${item.phone}`}
                          className="flex-1 py-2.5 text-xs font-bold text-slate-900 bg-[#22d3ee] rounded-xl hover:bg-cyan-300 transition-colors shadow-sm flex items-center justify-center gap-1.5 outline-none text-center"
                        >
                          <Phone className="w-3.5 h-3.5" /> সরাসরি যোগাযোগ
                        </a>
                        <button className="flex-1 py-2.5 text-xs font-bold text-[#0f766e] bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors border border-teal-100 flex items-center justify-center gap-1.5 outline-none">
                          <MapPin className="w-3.5 h-3.5" /> লোকেশন ম্যাপ
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center py-12 animate-fade-in shadow-lg">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">কোনো তথ্য পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SubMenuDetailLayout } from "./common/SubMenuDetailLayout";
import { 
  Phone, Mail, MapPin, Search, Landmark, Building, 
  Award, Shield, User, ExternalLink, ChevronRight, Check,
  Sparkles, PhoneCall, CheckCircle, Info, Edit, Trash2, Plus, X
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export interface Representative {
  id: string;
  name: string;
  designation: string;
  office: string;
  phone: string;
  email?: string;
  address: string;
  imageUrl?: string;
  category: 'national' | 'upazila_parishad' | 'municipality' | 'union_parishad' | 'admin_officer';
  unionName?: string;
}

const INITIAL_REPRESENTATIVES: Representative[] = [
  {
    id: "rep-1",
    name: "আলহাজ্ব মোঃ আবুল কালাম আজাদ",
    designation: "মাননীয় জাতীয় সংসদ সদস্য (রাজশাহী-৫)",
    office: "বাংলাদেশ জাতীয় সংসদ",
    phone: "01711-542385",
    email: "mp.rajshahi5@parliament.gov.bd",
    address: "সংসদ সদস্য কার্যালয়, পুঠিয়া ও দুর্গাপুর, রাজশাহী",
    category: "national",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-2",
    name: "আলহাজ্ব মোঃ আবদুস সামাদ",
    designation: "উপজেলা চেয়ারম্যান",
    office: "উপজেলা পরিষদ, পুঠিয়া",
    phone: "01711-825470",
    email: "upazila.chairman.puthia@gmail.com",
    address: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া, রাজশাহী",
    category: "upazila_parishad",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-3",
    name: "মোছাঃ শামীমা সুলতানা",
    designation: "উপজেলা নির্বাহী অফিসার (UNO)",
    office: "উপজেলা প্রশাসন, পুঠিয়া",
    phone: "01711-122334",
    email: "unoputhia@mopa.gov.bd",
    address: "উপজেলা নির্বাহী কর্মকর্তার কার্যালয়, পুঠিয়া, রাজশাহী",
    category: "admin_officer",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-4",
    name: "আলহাজ্ব মোঃ আল মামুন খান",
    designation: "পৌর মেয়র",
    office: "পুঠিয়া পৌরসভা কার্যালয়",
    phone: "01711-534210",
    email: "mayor.puthiamunicipality@gmail.com",
    address: "পৌরসভা ভবন, পুঠিয়া সদর, রাজশাহী",
    category: "municipality",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-5",
    name: "মোঃ জাহিদ হাসান",
    designation: "সহকারী কমিশনার (ভূমি) - AC Land",
    office: "উপজেলা ভূমি অফিস, পুঠিয়া",
    phone: "01713-373374",
    email: "aclandputhia@mopa.gov.bd",
    address: "উপজেলা ভূমি অফিস ভবন, পুঠিয়া, রাজশাহী",
    category: "admin_officer",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-6",
    name: "মোঃ সোহরাওয়ার্দী হোসেন",
    designation: "থানার ভারপ্রাপ্ত কর্মকর্তা (OC)",
    office: "পুঠিয়া থানা পুলিশ কার্যালয়",
    phone: "01713-373375",
    email: "ocputhiaps@police.gov.bd",
    address: "পুঠিয়া থানা ভবন, পুঠিয়া সদর, রাজশাহী",
    category: "admin_officer",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-7",
    name: "মোঃ আশরাফ খান ঝন্টু",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "১নং পুঠিয়া ইউনিয়ন পরিষদ",
    phone: "01712-456789",
    address: "ইউনিয়ন পরিষদ ভবন, পুঠিয়া সদর, রাজশাহী",
    category: "union_parishad",
    unionName: "পুঠিয়া ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-8",
    name: "মোঃ বদিউজ্জামান বদি",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "২নং বেলপুকুরিয়া ইউনিয়ন পরিষদ",
    phone: "01715-987654",
    address: "ইউনিয়ন পরিষদ ভবন, বেলপুকুরিয়া, পুঠিয়া",
    category: "union_parishad",
    unionName: "বেলপুকুরিয়া ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-9",
    name: "মোঃ সুলতান আলী",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "৩নং বানেশ্বর ইউনিয়ন পরিষদ",
    phone: "01716-112233",
    address: "ইউনিয়ন পরিষদ ভবন, বানেশ্বর বাজার, পুঠিয়া",
    category: "union_parishad",
    unionName: "বানেশ্বর ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-10",
    name: "মোঃ একরামুল হক",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "৪নং ভালুকগাছী ইউনিয়ন পরিষদ",
    phone: "01718-445566",
    address: "ইউনিয়ন পরিষদ ভবন, ভালুকগাছী, পুঠিয়া",
    category: "union_parishad",
    unionName: "ভালুকগাছী ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-11",
    name: "মোঃ রুহুল আমিন",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "৫নং জিউপাড়া ইউনিয়ন পরিষদ",
    phone: "01720-778899",
    address: "ইউনিয়ন পরিষদ ভবন, জিউপাড়া, পুঠিয়া",
    category: "union_parishad",
    unionName: "জিউপাড়া ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "rep-12",
    name: "মোঃ সাজ্জাদ হোসেন মুকুল",
    designation: "ইউনিয়ন পরিষদ চেয়ারম্যান",
    office: "৬নং শিলমাড়িয়া ইউনিয়ন পরিষদ",
    phone: "01725-334455",
    address: "ইউনিয়ন পরিষদ ভবন, শিলমাড়িয়া, পুঠিয়া",
    category: "union_parishad",
    unionName: "শিলমাড়িয়া ইউনিয়ন",
    imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face"
  }
];

export const RepresentativesProfile: React.FC = () => {
  const { user } = useAuth();
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);

  // Edit/Add Form state
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formOffice, setFormOffice] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCategory, setFormCategory] = useState<'national' | 'upazila_parishad' | 'municipality' | 'union_parishad' | 'admin_officer'>('union_parishad');
  const [formUnion, setFormUnion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Sync with Firestore, merge with INITIAL_REPRESENTATIVES
    const q = query(collection(db, "representatives"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbReps: Representative[] = [];
      snapshot.forEach((doc) => {
        dbReps.push({ id: doc.id, ...doc.data() } as Representative);
      });

      // Filter out INITIAL items that are overridden by DB updates or just merge
      const merged = [...dbReps];
      
      // If DB is completely empty (first time), write initial representatives to DB to pre-seed
      if (snapshot.empty && dbReps.length === 0) {
        setRepresentatives(INITIAL_REPRESENTATIVES);
        // Pre-seed Firestore asynchronously without blocking
        INITIAL_REPRESENTATIVES.forEach(async (rep) => {
          try {
            await setDoc(doc(db, "representatives", rep.id), {
              name: rep.name,
              designation: rep.designation,
              office: rep.office,
              phone: rep.phone,
              email: rep.email || "",
              address: rep.address,
              category: rep.category,
              unionName: rep.unionName || "",
              imageUrl: rep.imageUrl || ""
            });
          } catch (e) {
            console.error("Error pre-seeding rep:", e);
          }
        });
      } else {
        setRepresentatives(merged);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error reading representatives:", error);
      setRepresentatives(INITIAL_REPRESENTATIVES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormName("");
    setFormDesignation("");
    setFormOffice("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormCategory("union_parishad");
    setFormUnion("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rep: Representative) => {
    setEditingId(rep.id);
    setFormName(rep.name);
    setFormDesignation(rep.designation);
    setFormOffice(rep.office);
    setFormPhone(rep.phone);
    setFormEmail(rep.email || "");
    setFormAddress(rep.address);
    setFormCategory(rep.category);
    setFormUnion(rep.unionName || "");
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই প্রোফাইলটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "representatives", id));
      showToast("প্রোফাইলটি সফলভাবে ডিলিট করা হয়েছে।");
    } catch (e) {
      console.error(e);
      alert("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDesignation || !formPhone) {
      alert("দয়া করে নাম, পদবি এবং ফোন নম্বর পূরণ করুন।");
      return;
    }

    const docData = {
      name: formName,
      designation: formDesignation,
      office: formOffice,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      category: formCategory,
      unionName: formCategory === 'union_parishad' ? formUnion : "",
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
    };

    try {
      if (editingId) {
        await setDoc(doc(db, "representatives", editingId), docData);
        showToast("প্রতিনিধি প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
      } else {
        const newId = doc(collection(db, "representatives")).id;
        await setDoc(doc(db, "representatives", newId), docData);
        showToast("নতুন প্রতিনিধি প্রোফাইল সফলভাবে যুক্ত করা হয়েছে!");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      alert("তথ্য সংরক্ষণে ত্রুটি ঘটেছে।");
    }
  };

  // Filter and search logic
  const filteredReps = representatives.filter((rep) => {
    const matchesSearch = 
      rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.unionName && rep.unionName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeCategory === "all") return matchesSearch;
    return rep.category === activeCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "national": return <Award className="w-5 h-5 text-red-600 animate-pulse" />;
      case "upazila_parishad": return <Landmark className="w-5 h-5 text-indigo-600" />;
      case "municipality": return <Building className="w-5 h-5 text-emerald-600" />;
      case "union_parishad": return <Building className="w-5 h-5 text-teal-600" />;
      default: return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "national": return "জাতীয় প্রতিনিধি (MP)";
      case "upazila_parishad": return "উপজেলা পরিষদ";
      case "municipality": return "পৌরসভা";
      case "union_parishad": return "ইউনিয়ন পরিষদ (ইউপি চেয়ারম্যান)";
      case "admin_officer": return "প্রশাসনিক কর্মকর্তা";
      default: return "অন্যান্য কর্মকর্তা";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cover Banner with visual aesthetics */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 rounded-[32px] relative overflow-hidden border border-white/5 shadow-xl">
        <div className="absolute right-0 bottom-0 w-80 h-80 text-white/[0.03] -mb-16 -mr-16">
          <Landmark size={320} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4 text-left">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-400 animate-spin" /> পুঠিয়া উপজেলা জনপ্রতিনিধি ও প্রশাসন হাব
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-white">
            জনপ্রতিনিধি ও প্রশাসনের সাথে সরাসরি যোগাযোগের ডিজিটাল মঞ্চ!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-semibold leading-relaxed">
            উপজেলার মাননীয় সংসদ সদস্য, উপজেলা চেয়ারম্যান, পৌর মেয়র, ইউনিয়ন পরিষদের চেয়ারম্যানগণ এবং গুরুত্বপূর্ণ প্রশাসনিক কর্মকর্তাদের অফিসিয়াল ফোন নম্বর ও ইমেইল ঠিকানা। যেকোনো দরকারে নাগরিকদের সরাসরি সরকারি সেবার আওতাভুক্ত করতে এই উদ্যোগ।
          </p>
        </div>
      </div>

      {/* Control Row: Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, পদবি বা ইউনিয়নের নাম লিখে খুঁজুন..."
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-gray-100/80 rounded-2xl shadow-sm self-stretch md:self-auto overflow-x-auto">
          {[
            { id: "all", label: "সব প্রোফাইল" },
            { id: "national", label: "এমপি (MP)" },
            { id: "upazila_parishad", label: "উপজেলা পরিষদ" },
            { id: "municipality", label: "পৌরসভা" },
            { id: "union_parishad", label: "ইউপি চেয়ারম্যান" },
            { id: "admin_officer", label: "প্রশাসনিক কর্মকর্তা" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Admin actions */}
        {user?.email === "mdzosimuddin47@gmail.com" && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 px-4.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all shrink-0 cursor-pointer border-none"
          >
            <Plus size={16} />
            নতুন প্রতিনিধি যুক্ত করুন
          </button>
        )}
      </div>

      {/* Success Notification Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 font-bold text-xs shadow-sm"
          >
            <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Overlay Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-left"
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Landmark className="text-indigo-600" />
                {editingId ? "প্রতিনিধি তথ্য সংশোধন করুন" : "নতুন প্রতিনিধি তথ্য যুক্ত করুন"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 font-extrabold bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">নাম (পূর্ণ নাম বাংলায়)</label>
                <input
                  type="text"
                  required
                  value={formName || ""}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: আলহাজ্ব মোঃ আবদুস সামাদ"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">ক্যাটাগরি</label>
                  <select
                    value={formCategory || ""}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                  >
                    <option value="national">জাতীয় (MP)</option>
                    <option value="upazila_parishad">উপজেলা পরিষদ</option>
                    <option value="municipality">পৌরসভা</option>
                    <option value="union_parishad">ইউনিয়ন পরিষদ</option>
                    <option value="admin_officer">প্রশাসনিক কর্মকর্তা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">ইউনিয়ন (প্রযোজ্য ক্ষেত্রে)</label>
                  <input
                    type="text"
                    value={formUnion || ""}
                    onChange={(e) => setFormUnion(e.target.value)}
                    placeholder="যেমন: বানেশ্বর ইউনিয়ন"
                    disabled={formCategory !== 'union_parishad'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">পদবি (Designation)</label>
                  <input
                    type="text"
                    required
                    value={formDesignation || ""}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="যেমন: ইউনিয়ন পরিষদ চেয়ারম্যান"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">কার্যালয় / অফিস</label>
                  <input
                    type="text"
                    required
                    value={formOffice || ""}
                    onChange={(e) => setFormOffice(e.target.value)}
                    placeholder="যেমন: ৩নং বানেশ্বর ইউনিয়ন পরিষদ"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">অফিসিয়াল ফোন নম্বর</label>
                  <input
                    type="text"
                    required
                    value={formPhone || ""}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="যেমন: 01711-xxxxxx"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={formEmail || ""}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="office@puthia.gov.bd"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-bold text-gray-700 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">কার্যালয়ের ঠিকানা</label>
                <textarea
                  value={formAddress || ""}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="যেমন: বানেশ্বর বাজার, পুঠিয়া, রাজশাহী"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold text-gray-700 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black rounded-xl transition-all border-none cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-100 border-none cursor-pointer"
                >
                  {editingId ? "সংরক্ষণ করুন" : "যুক্ত করুন"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Main Grid View */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredReps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredReps.map((rep) => (
            <motion.div
              key={rep.id}
              layout
              onClick={() => setSelectedRep(rep)}
              className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-5 hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              {/* Top Accent line or indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-600 opacity-80" />

              <div>
                {/* Header Information */}
                <div className="flex items-start gap-4">
                  {/* Photo or beautiful letter avatar placeholder */}
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 relative overflow-hidden">
                    {rep.imageUrl ? (
                      <img 
                        src={rep.imageUrl} 
                        alt={rep.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" 
                      />
                    ) : (
                      <User className="w-8 h-8 text-indigo-400" />
                    )}
                    
                    {/* Floating badge for Category */}
                    <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-tl-lg shadow-sm">
                      {getCategoryIcon(rep.category)}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black text-indigo-600 tracking-wider bg-indigo-50/70 border border-indigo-100 px-2.5 py-0.5 rounded-full inline-block uppercase">
                      {getCategoryTitle(rep.category)}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm lg:text-base leading-tight truncate">
                      {rep.name}
                    </h3>
                    <p className="text-xs font-black text-emerald-600 leading-snug">
                      {rep.designation}
                    </p>
                  </div>
                </div>

                {/* Meta details list */}
                <div className="mt-5 space-y-3.5 pt-4 border-t border-gray-100/70">
                  <div className="flex items-start gap-2.5 text-xs text-gray-600">
                    <Landmark className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider">দপ্তর / কার্যালয়</span>
                      <span className="font-bold text-slate-700">{rep.office}</span>
                    </div>
                  </div>

                  {rep.unionName && (
                    <div className="flex items-start gap-2.5 text-xs text-gray-600">
                      <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider">ইউনিয়ন</span>
                        <span className="font-bold text-slate-700">{rep.unionName}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider">ঠিকানা</span>
                      <span className="font-medium text-slate-500 leading-relaxed">{rep.address}</span>
                    </div>
                  </div>

                  {rep.email && (
                    <div className="flex items-start gap-2.5 text-xs text-gray-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-400 block text-[9px] uppercase tracking-wider">অফিসিয়াল ইমেইল</span>
                        <a href={`mailto:${rep.email}`} className="font-semibold text-indigo-600 hover:underline truncate block">
                          {rep.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row at bottom */}
              <div className="mt-6 pt-4 border-t border-gray-100/70 flex items-center justify-between gap-3">
                
                {/* Admin specific controls */}
                {user?.email === "mdzosimuddin47@gmail.com" ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditForm(rep)}
                      className="p-2.5 bg-gray-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer border border-gray-100 hover:border-indigo-100"
                      title="তথ্য সংশোধন"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="p-2.5 bg-gray-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all cursor-pointer border border-gray-100 hover:border-rose-100"
                      title="ডিলিট করুন"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ভেরিফাইড নম্বর</span>
                  </div>
                )}

                {/* Phone Call Link button */}
                <a
                  href={`tel:${rep.phone}`}
                  className="flex-1 max-w-[200px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] cursor-pointer decoration-none"
                >
                  <PhoneCall size={13} fill="currentColor" />
                  <span>সরাসরি কল করুন</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-black text-gray-800 mb-1">কোনো প্রতিনিধি পাওয়া যায়নি</h3>
          <p className="text-gray-400 text-sm font-medium">আপনার খোঁজা শব্দের সাথে মিল রয়েছে এমন কোনো কর্মকর্তা বা প্রতিনিধি নেই।</p>
        </div>
      )}

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedRep && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white min-h-screen sm:min-h-0 sm:rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setSelectedRep(null)}
                className="absolute top-6 left-6 z-[10001] p-3 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/30 transition-all cursor-pointer shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="h-full overflow-y-auto p-6 sm:p-10 pt-20 sm:pt-10">
                <SubMenuDetailLayout 
                  title={selectedRep.name}
                  description={`${selectedRep.name} একজন অভিজ্ঞ জনপ্রতিনিধি/কর্মকর্তা যিনি বর্তমানে ${selectedRep.office}-এ ${selectedRep.designation} হিসেবে দায়িত্বরত আছেন। তিনি পুঠিয়া উপজেলার উন্নয়ন এবং সাধারণ নাগরিকদের নাগরিক সেবা প্রদানে নিবেদিত প্রাণ।\n\nবিভাগ: ${getCategoryTitle(selectedRep.category)}\nঠিকানা: ${selectedRep.address}`}
                  coverImage={selectedRep.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200"}
                  contactInfo={[
                    { label: "পদবি", value: selectedRep.designation, icon: <Award size={16} /> },
                    { label: "অফিস", value: selectedRep.office, icon: <Building size={16} /> },
                    { label: "ফোন", value: selectedRep.phone, icon: <Phone size={16} /> },
                    { label: "ইমেইল", value: selectedRep.email || "উপলব্ধ নেই", icon: <Mail size={16} /> },
                    { label: "ঠিকানা", value: selectedRep.address, icon: <MapPin size={16} /> }
                  ]}
                  callNumber={selectedRep.phone}
                  mapLocation={selectedRep.address}
                  isFeatured={selectedRep.category === 'national' || selectedRep.category === 'admin_officer'}
                  featuredText="ভেরিফাইড প্রোফাইল"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Administrative Note */}
      <div className="bg-amber-50/50 rounded-3xl border border-amber-100/50 p-6 flex flex-col sm:flex-row items-start gap-4 text-left">
        <div className="p-3 bg-amber-100/70 text-amber-800 rounded-2xl shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-950 mb-1">প্রশাসনিক সহায়তা ও অভিযোগ সেল</h4>
          <p className="text-xs font-bold text-amber-800/80 leading-relaxed">
            কোনো জনপ্রতিনিধি বা কর্মকর্তার ফোন নম্বর বা তথ্য পরিবর্তন হলে অথবা নতুন কোনো কর্মকর্তার তথ্য যুক্ত করতে চাইলে নাগরিকরা পুঠিয়া উপজেলা অভিযোগ সেল বা ও UNO অফিসের হেল্পডেস্কে মেইল বা যোগাযোগ করতে পারেন। সঠিক তথ্য সাধারণ নাগরিকদের প্রশাসনিক জটিলতা থেকে মুক্ত রাখতে সহায়তা করে।
          </p>
        </div>
      </div>

    </div>
  );
};

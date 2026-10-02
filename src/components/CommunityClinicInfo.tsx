import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Loader2, X, Send, Sparkles, Building2, MapPin, Clock, Stethoscope, Phone, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';

interface Clinic {
  id: string;
  name: string;
  union: string;
  address: string;
  chcp: string; // Community Health Care Provider
  phone: string;
  time?: string;
  isCustom?: boolean;
}

const staticClinics: Clinic[] = [
  {
    id: "puthia_haldarpara",
    name: "হালদারপাড়া কমিউনিটি ক্লিনিক",
    union: "পুঠিয়া",
    address: "হালদারপাড়া গ্রাম, পুঠিয়া ইউনিয়ন, পুঠিয়া।",
    chcp: "মোসাঃ ফাতেমা খাতুন",
    phone: "01712000011",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "puthia_kandra",
    name: "কান্দ্রা কমিউনিটি ক্লিনিক",
    union: "পুঠিয়া",
    address: "কান্দ্রা গ্রাম, পুঠিয়া ইউনিয়ন, পুঠিয়া।",
    chcp: "মোঃ রেজাউল করিম",
    phone: "01712000022",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "baneshwar_sodor",
    name: "বানেশ্বর কমিউনিটি ক্লিনিক",
    union: "বানেশ্বর",
    address: "বানেশ্বর বাজার সংলগ্ন, বানেশ্বর ইউনিয়ন।",
    chcp: "মোঃ আব্দুল মান্নান",
    phone: "01712000033",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "baneshwar_digholkandi",
    name: "দীঘলকান্দি কমিউনিটি ক্লিনিক",
    union: "বানেশ্বর",
    address: "দীঘলকান্দি গ্রাম, বানেশ্বর ইউনিয়ন।",
    chcp: "মোসাঃ শামীমা আক্তার",
    phone: "01712000044",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "belpukur_sodor",
    name: "বেলপুকুরিয়া কমিউনিটি ক্লিনিক",
    union: "বেলপুকুরিয়া",
    address: "বেলপুকুরিয়া বাজার সংলগ্ন, বেলপুকুরিয়া ইউনিয়ন।",
    chcp: "মোঃ জাকির হোসেন",
    phone: "01712000055",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "belpukur_tarash",
    name: "তাড়াশ কমিউনিটি ক্লিনিক",
    union: "বেলpুকুরিয়া",
    address: "তাড়াশ গ্রাম, বেলপুকুরিয়া ইউনিয়ন।",
    chcp: "মোসাঃ নাসরিন সুলতানা",
    phone: "01712000066",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "bhalukgachhi_sodor",
    name: "ভালুকগাছী কমিউনিটি ক্লিনিক",
    union: "ভালুকগাছী",
    address: "ভালুকগাছী গ্রাম, ভালুকগাছী ইউনিয়ন।",
    chcp: "মোঃ রবিউল ইসলাম",
    phone: "01712000077",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "bhalukgachhi_dhokrakul",
    name: "ধোকড়াকুল কমিউনিটি ক্লিনিক",
    union: "ভালুকগাছী",
    address: "ধোকড়াকুল গ্রাম, ভালুকগাছী ইউনিয়ন।",
    chcp: "মোসাঃ মৌসুমী খাতুন",
    phone: "01712000088",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "jeupara_sodor",
    name: "জিউপাড়া কমিউনিটি ক্লিনিক",
    union: "জিউপাড়া",
    address: "জিউপাড়া গ্রাম, জিউপাড়া ইউনিয়ন।",
    chcp: "মোঃ কামরুজ্জামান",
    phone: "01712000099",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  },
  {
    id: "shilmaria_sodor",
    name: "শিলমাড়িয়া কমিউনিটি ক্লিনিক",
    union: "শিলমাড়িয়া",
    address: "শিলমাড়ী গ্রাম, শিলমাড়ী ইউনিয়ন।",
    chcp: "মোসাঃ আয়েশা সিদ্দিকা",
    phone: "01712000100",
    time: "সকাল ৯:০০ — দুপুর ৩:০০"
  }
];

const UNIONS = [
  'সব ইউনিয়ন',
  'পুঠিয়া',
  'বানেশ্বর',
  'বেলপুকুরিয়া',
  'ভালুকগাছী',
  'জিউপাড়া',
  'শিলমাড়িয়া'
];

export const CommunityClinicInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const { user } = useAuth();
  const [selectedUnion, setSelectedUnion] = useState('সব ইউনিয়ন');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Form states for adding new clinic
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnion, setNewUnion] = useState("পুঠিয়া");
  const [newAddress, setNewAddress] = useState("");
  const [newChcp, setNewChcp] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTime, setNewTime] = useState("সকাল ৯:০০ — দুপুর ৩:০০");
  const [isPosting, setIsPosting] = useState(false);

  // Firestore states
  const [dbClinics, setDbClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const q = query(collection(db, "community_clinics"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Clinic[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || "",
          union: data.union || "",
          address: data.address || "",
          chcp: data.chcp || "",
          phone: data.phone || "",
          time: data.time || "সকাল ৯:০০ — দুপুর ৩:০০",
          isCustom: true
        });
      });
      setDbClinics(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading community clinics:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim() || !newChcp.trim() || !newPhone.trim()) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "community_clinics"), {
        name: newName.trim(),
        union: newUnion,
        address: newAddress.trim(),
        chcp: newChcp.trim(),
        phone: newPhone.trim(),
        time: newTime.trim(),
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewName("");
      setNewAddress("");
      setNewChcp("");
      setNewPhone("");
      setNewTime("সকাল ৯:০০ — দুপুর ৩:০০");
      setShowPostForm(false);
      alert("কমিউনিটি ক্লিনিকের তথ্যটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting community clinic:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ক্লিনিকের তথ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "community_clinics", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting community clinic:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const allClinics = useMemo(() => {
    return [...dbClinics, ...staticClinics];
  }, [dbClinics]);

  const filteredClinics = useMemo(() => {
    return allClinics.filter(c => {
      const matchesUnion = selectedUnion === 'সব ইউনিয়ন' || c.union === selectedUnion;
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.chcp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesUnion && matchesSearch;
    });
  }, [allClinics, selectedUnion, searchTerm]);

  return (
    <div className="font-sans pb-10 space-y-6">
      <UnifiedHeroHeader
        badgeText="তৃণমূল স্বাস্থ্যসেবা"
        title="কমিউনিটি ক্লিনিক"
        subtitle="পুঠিয়া উপজেলার প্রত্যন্ত অঞ্চলের সাধারণ মানুষের দোরগোড়ায় প্রাথমিক স্বাস্থ্যসেবা পৌঁছে দিতে সকল গ্রামীণ কমিউনিটি ক্লিনিকের অবস্থান ও হেল্পলাইন।"
        icon={<Building2 size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchTerm : undefined}
        onSearchChange={showSearch ? setSearchTerm : undefined}
        searchPlaceholder="ক্লিনিকের নাম, ঠিকানা বা সিএইচসিপি..."
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchTerm("");
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
                  : "bg-white text-[#047857] hover:bg-emerald-50 border-white/20"
              }`}
              title={showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন ক্লিনিক যোগ করুন"}
            >
              {showPostForm ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        }
      />

      {/* Union Selector row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-bold">ইউনিয়ন ফিল্টার করুন:</span>
          <select
            value={selectedUnion || ""}
            onChange={(e) => setSelectedUnion(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold outline-none cursor-pointer hover:border-emerald-500 transition shadow-sm"
          >
            {UNIONS.map(union => (
              <option key={union} value={union || ""}>{union}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-neutral-500 font-bold">
          মোট {filteredClinics.length}টি ক্লিনিক পাওয়া গেছে
        </span>
      </div>

      {/* Add New Clinic Form */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <form onSubmit={handlePostSubmit} className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-emerald-800">নতুন কমিউনিটি ক্লিনিকের তথ্য দিন</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">ক্লিনিকের নাম <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="উদাঃ কান্দ্রা কমিউনিটি ক্লিনিক"
                    value={newName || ""}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">ইউনিয়ন <span className="text-rose-500">*</span></label>
                  <select 
                    value={newUnion || ""}
                    onChange={(e) => setNewUnion(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500 font-bold"
                  >
                    {UNIONS.filter(u => u !== 'সব ইউনিয়ন').map(union => (
                      <option key={union} value={union || ""}>{union}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">ঠিকানা <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="উদাঃ কান্দ্রা গ্রাম, পুঠিয়া ইউনিয়ন।"
                  value={newAddress || ""}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">সিএইচসিপি (CHCP) নাম <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="উদাঃ মোঃ রেজাউল করিম"
                    value={newChcp || ""}
                    onChange={(e) => setNewChcp(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">মোবাইল নম্বর <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    placeholder="উদাঃ 01712XXXXXX"
                    value={newPhone || ""}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">সেবার সময়</label>
                <input 
                  type="text" 
                  placeholder="উদাঃ সকাল ৯:০০ — দুপুর ৩:০০"
                  value={newTime || ""}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={isPosting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {isPosting ? "পোস্ট করা হচ্ছে..." : "তথ্য জমা দিন"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinic Cards List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold">ক্লিনিকের তথ্য লোড হচ্ছে...</span>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="col-span-full bg-white py-16 rounded-2xl border border-neutral-100 text-center text-neutral-500">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <span className="text-sm font-bold">কোনো কমিউনিটি ক্লিনিক খুঁজে পাওয়া যায়নি।</span>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <motion.div
              layout
              key={clinic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border border-neutral-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                    {clinic.union} ইউনিয়ন
                  </span>
                  
                  {clinic.isCustom && (
                    <button
                      onClick={() => handleDelete(clinic.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition border-none cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  {clinic.name}
                </h3>

                <div className="space-y-2.5 text-sm text-neutral-600 mt-4">
                  <p className="flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span><strong>ঠিকানা:</strong> {clinic.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span>সিএইচসিপি: <strong className="text-neutral-800">{clinic.chcp}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span>সময়: {clinic.time || "সকাল ৯:০০ — দুপুর ৩:০০"}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-50">
                <a
                  href={`tel:${clinic.phone}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-900/10"
                >
                  <Phone className="w-4 h-4" />
                  কল করুন ({clinic.phone})
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Services summary note */}
      <div className="mt-8 bg-neutral-50 px-5 py-4 rounded-2xl border border-neutral-100 text-sm text-neutral-500 leading-relaxed">
        <span className="font-bold text-neutral-800">🏥 কমিউনিটি ক্লিনিক ে উপলব্ধ বিনামূল্যে সেবা:</span>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>মা ও শিশুর প্রসব-পূর্ব ও প্রসব-পরবর্তী সাধারণ স্বাস্থ্য পরীক্ষা ও পরামর্শ।</li>
          <li>সরকার নির্ধারিত ইপিআই (EPI) টিকাদান কর্মসূচি পরিচালনা।</li>
          <li>নবজাতক ও অনূর্ধ্ব ৫ বছর বয়সী শিশুদের নিউমোনিয়া ও পুষ্টিহীনতার প্রাথমিক চিকিৎসা।</li>
          <li>জ্বর, সর্দি, পেটের রোগ, এলার্জি ও সাধারণ কাটার জন্য জরুরি প্রাথমিক চিকিৎসা এবং বিনামূল্যে ওষুধ বিতরণ।</li>
        </ul>
      </div>
    </div>
  );
};

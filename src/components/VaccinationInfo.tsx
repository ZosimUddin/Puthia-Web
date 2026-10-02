import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Phone, Clock, Calendar, ShieldCheck, Plus, Trash2, Loader2, Sparkles, Send, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface VaccinationCenter {
  id: string;
  name: string;
  union: string;
  location: string;
  schedule: string;
  services: string;
  contact: string;
  category: 'govt' | 'clinic' | 'outreach';
  icon?: string;
}

const staticCenters: VaccinationCenter[] = [
  {
    id: "vax-1",
    name: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স (কেন্দ্রীয় ইপিআই সেন্টার)",
    union: "পুঠিয়া সদর",
    location: "উপজেলা স্বাস্থ্য কমপ্লেক্স রোড, পুঠিয়া সদর",
    schedule: "প্রতি রবি, মঙ্গল ও বৃহস্পতিবার (সকাল ৯:০০ — দুপুর ১:০০)",
    services: "শিশুদের বিনামূল্যে ইপিআই (EPI) ১০টি মারাত্মক রোগের প্রতিষেধক টিকা, এইচপিভি (HPV) টিকা, টাইফয়েড ও টিডি টিকা।",
    contact: "০১৭৩০-৩২৪৫৬৭ (ইপিআই ইনচার্জ)",
    category: "govt",
    icon: "🏥"
  },
  {
    id: "vax-2",
    name: "বানেশ্বর ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র ও টিকাদান বুথ",
    union: "বানেশ্বর",
    location: "বানেশ্বর বাজার সংলগ্ন, পুঠিয়া",
    schedule: "প্রতি সোমবার ও বুধবার (সকাল ৯:৩০ — দুপুর ১২:৩০)",
    services: "শিশুদের শূন্য থেকে ১৫ মাস বয়সী সব ধরণের ইপিআই টিকাদান ও গর্ভবতী মায়েদের টিডি (Td) ভ্যাকসিন।",
    contact: "০১৭১২-৮৮৯৯০০",
    category: "govt",
    icon: "💉"
  },
  {
    id: "vax-3",
    name: "জৈন্তাপুর কমিউনিটি ক্লিনিক টিকাদান কেন্দ্রসমূহ",
    union: "জৈন্তাপুর",
    location: "জৈন্তাপুর উত্তর পাড়া, পুঠিয়া",
    schedule: "সাপ্তাহিক রুটিন অনুযায়ী প্রতি মাসের ১ম ও ৩য় মঙ্গলবার",
    services: "মা ও শিশুর নিয়মিত টিকা প্রদান, পুষ্টি পরামর্শ এবং ডিজিটাল টিকাদান কার্ড বিতরণ।",
    contact: "০১৭৩৩-৪৪৩২৪৫",
    category: "outreach",
    icon: "🏡"
  },
  {
    id: "vax-4",
    name: "বেলপুকুরিয়া ইউনিয়ন স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র",
    union: "বেলপুকুরিয়া",
    location: "বেলপুকুরিয়া রেলগেট সংলগ্ন",
    schedule: "প্রতি রবিবার ও বুধবার (সকাল ৯:০০ — দুপুর ১:০০)",
    services: "বিনামূল্যে শিশু ইপিআই কার্ড বিতরণ, জরায়ুমুখ ক্যান্সার প্রতিরোধে এইচপিভি টিকা ক্যাম্পেইন।",
    contact: "০১৭৫৫-৬৬৭৭৮৮",
    category: "govt",
    icon: "🩺"
  },
  {
    id: "vax-5",
    name: "পুঠিয়া মা ও শিশু কল্যাণ কেন্দ্র (MCH)",
    union: "পুঠিয়া সদর",
    location: "রাজবাড়ী লেক রোড, পুঠিয়া",
    schedule: "প্রতিদিন (সরকারি কার্যদিবসে) সকাল ৮:৩০ — দুপুর ২:৩০",
    services: "গর্ভবতী মায়েদের ধনুষ্টঙ্কার প্রতিরোধে টিডি টিকা এবং নবজাতকের জন্মকালীন জন্ডিস ও হেপাটাইটিস-বি টিকা।",
    contact: "০১৭০০-১১২২৩৩",
    category: "clinic",
    icon: "🤱"
  }
];

export const VaccinationInfo: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [centers, setCenters] = useState<VaccinationCenter[]>(staticCenters);
  const [userCenters, setUserCenters] = useState<VaccinationCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [union, setUnion] = useState("পুঠিয়া সদর");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState("");
  const [services, setServices] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState<'govt' | 'clinic' | 'outreach'>("govt");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "vaccination_centers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: VaccinationCenter[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<VaccinationCenter, "id">)
      }));
      setUserCenters(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      handleFirestoreError(error, OperationType.READ, "vaccination_centers");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !schedule) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "vaccination_centers"), {
        name,
        union,
        location,
        schedule,
        services: services || "ইপিআই টিকাদান ও স্বাস্থ্য পরামর্শ।",
        contact,
        category,
        icon: category === 'govt' ? '🏥' : category === 'clinic' ? '🤱' : '🏡',
        createdAt: serverTimestamp()
      });

      setName("");
      setLocation("");
      setSchedule("");
      setServices("");
      setContact("");
      setShowForm(false);
    } catch (error) {
      console.error("Error adding center:", error);
      handleFirestoreError(error, OperationType.CREATE, "vaccination_centers");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি এই তথ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "vaccination_centers", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vaccination_centers/${id}`);
    }
  };

  const allCenters = [...userCenters, ...staticCenters];

  const filteredCenters = allCenters.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.union.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-sky-200 text-sm font-bold mb-1 uppercase tracking-wide">স্বাস্থ্য ও সুরক্ষা সেবা</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">💉 টিকাদান কেন্দ্রসমূহ</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-sky-300/60 pl-3 py-1">
            পুঠিয়া উপজেলা ও ইউনিয়নভিত্তিক সরকারি ইপিআই (EPI) টিকাদান কেন্দ্রসমূহ, কার্ড বিতরণ ও মা-শিশুর টিকাদান সূচি।
          </p>
        </div>
      </div>

      {/* EPI Schedule Quick Guide */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sky-900 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h3>শিশুদের সরকারি ইপিআই (EPI) টিকাদান সময়সূচি নির্দেশিকা</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs">
            <span className="font-extrabold text-sky-800 block mb-0.5">১. জন্মের পরপরই</span>
            <span className="text-gray-600">বিসিজি (BCG) ও হেপাটাইটিস-বি প্রথম ডোজ।</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs">
            <span className="font-extrabold text-sky-800 block mb-0.5">২. ৬, ১০ ও ১৪ সপ্তাহ</span>
            <span className="text-gray-600">পেন্টাভ্যালেন্ট, ওপিভি ও পিসিভি ৩টি ডোজ।</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs">
            <span className="font-extrabold text-sky-800 block mb-0.5">৩. ৯ মাস বয়সে</span>
            <span className="text-gray-600">হাম-রুবেলা (MR-১) ও পোলিও (fIPV-২)।</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-2xs">
            <span className="font-extrabold text-sky-800 block mb-0.5">৪. ১৫ মাস বয়সে</span>
            <span className="text-gray-600">হাম-রুবেলা ২য় ডোজ (MR-২)।</span>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="কেন্দ্রের নাম বা এলাকা খুঁজুন..."
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "all" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            সব কেন্দ্র
          </button>
          <button
            onClick={() => setSelectedCategory("govt")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "govt" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            সরকারি কেন্দ্র
          </button>
          <button
            onClick={() => setSelectedCategory("clinic")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "clinic" ? "bg-sky-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            মা ও শিশু ক্লিনিক
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> নতুন কেন্দ্র যোগ করুন
          </button>
        </div>
      </div>

      {/* Add Center Modal / Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 border border-sky-200 shadow-md space-y-4 overflow-hidden"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Sparkles className="w-5 h-5 text-sky-600" />
              নতুন টিকাদান কেন্দ্রসমূহের তথ্য যুক্ত করুন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">কেন্দ্রের নাম *</label>
                <input 
                  type="text" required placeholder="উদাঃ বিড়ালদহ ইপিআই আউটরিচ সেন্টার"
                  value={name || ""} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">ইউনিয়ন</label>
                <select 
                  value={union || ""} onChange={(e) => setUnion(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                  <option value="বানেশ্বর">বানেশ্বর</option>
                  <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                  <option value="জৈন্তাপুর">জৈন্তাপুর</option>
                  <option value="শালুয়া">শালুয়া</option>
                  <option value="ভালুকগাছি">ভালুকগাছি</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">ঠিকানা / অবস্থান *</label>
                <input 
                  type="text" required placeholder="উদাঃ পোস্ট অফিস গলি, বিড়ালদহ"
                  value={location || ""} onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">সময়সূচী ও বার *</label>
                <input 
                  type="text" required placeholder="উদাঃ প্রতি সোমবার ও বৃহস্পতিবার সকাল ৯টা"
                  value={schedule || ""} onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">যোগাযোগ নম্বর</label>
                <input 
                  type="text" placeholder="উদাঃ 01700-000000"
                  value={contact || ""} onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">ক্যাটাগরি</label>
                <select 
                  value={category || ""} onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="govt">সরকারি হেলথ সেন্টার</option>
                  <option value="clinic">মা ও শিশু কল্যাণ কেন্দ্র</option>
                  <option value="outreach">আউটরিচ টিকাদান সাব-সেন্টার</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1 block">প্রদেয় সেবা বিবরণ</label>
              <textarea 
                rows={2} placeholder="টিকাদান ও সেবা বিবরণ..."
                value={services || ""} onChange={(e) => setServices(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button 
                type="submit" disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} সংরক্ষণ করুন
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCenters.map((center) => {
          const isUserAdded = userCenters.some(u => u.id === center.id);
          return (
            <div key={center.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-2 h-full bg-sky-600"></div>
              <div>
                <div className="flex items-start justify-between gap-2 pl-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{center.icon || "💉"}</span>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 mb-0.5">
                        {center.union}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{center.name}</h3>
                    </div>
                  </div>
                  {isUserAdded && (
                    <button 
                      onClick={() => handleDelete(center.id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pl-2 space-y-2 my-3 text-xs text-gray-600">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span><b>অবস্থান:</b> {center.location}</span>
                  </p>
                  <p className="flex items-start gap-1.5 bg-amber-50/80 text-amber-900 p-2.5 rounded-xl border border-amber-100 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span><b>সময়সূচী:</b> {center.schedule}</span>
                  </p>
                  <p className="flex items-start gap-1.5 bg-sky-50/50 p-2.5 rounded-xl text-gray-700">
                    <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span>{center.services}</span>
                  </p>
                </div>
              </div>

              {center.contact && (
                <div className="pl-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-sky-600" /> {center.contact}
                  </span>
                  <a 
                    href={`tel:${center.contact.replace(/[^0-9]/g, '')}`} 
                    className="bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-3 py-1 rounded-xl transition"
                  >
                    কল করুন
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm font-medium">কোনো টিকাদান কেন্দ্রসমূহের তথ্য পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Dental {
  id: string;
  name: string;
  doctor: string;
  specialty: string;
  location: string;
  time: string;
  services: string;
  phone: string;
  icon: string;
  tabs: string[];
  buttonLabel: string;
}

const staticDentals: Dental[] = [
  {
    id: "puthia_dental",
    name: "পুঠিয়া ডেন্টাল কেয়ার অ্যান্ড সার্জারি",
    doctor: "ডাঃ মোঃ শামীম রেজা",
    specialty: "BDS, PGT (Dental Surgery)",
    location: "থানা রোড (রয়েল প্লাজার ২য় তলা), পুঠিয়া সদর।",
    time: "শনি থেকে বৃহস্পতি — বিকেল ৩:০০ — রাত ৮:৩০ (শুক্রবার বন্ধ)",
    services: "ব্যথামুক্ত দাঁত তোলা, রুট ক্যানেল থেরাপী (RCT), দাঁতের ক্যাভিটি ফিলিং, দাঁত সোজা করা ও কৃত্রিম দাঁত বাঁধানো।",
    phone: "01711225566",
    icon: "🦷",
    tabs: ["all", "surgery", "orthodontics", "scaling"],
    buttonLabel: "📞 সিরিয়াল বুক করুন"
  },
  {
    id: "baneshwar_dental",
    name: "বানেশ্বর মডার্ন ডেন্টাল কেয়ার",
    doctor: "ডাঃ মোছাঃ তানিয়া সুলতানা",
    specialty: "BDS (Dhaka Dental College)",
    location: "বানেশ্বর বাজার (ফায়ার সার্ভিস সংলগ্ন), পুঠিয়া।",
    time: "শনি, সোম ও বুধবার — সকাল ১০:০০ — দুপুর ১:০০",
    services: "দাঁতের আল্ট্রাসনিক স্কেলিং ও পলিশিং, লাইট কিউর ফিলিং, লেজার চিকিৎসা এবং ডেন্টাল এক্স-রে সুবিধা।",
    phone: "01712225566",
    icon: "🩺",
    tabs: ["all", "scaling"],
    buttonLabel: "📞 সিরিয়াল নিন"
  }
];

export const DentalInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<"all" | "surgery" | "orthodontics" | "scaling">("all");

  // Post states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDoctor, setNewDoctor] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newServices, setNewServices] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newType, setNewType] = useState<"surgery" | "orthodontics" | "scaling" | "all_services">("all_services");
  const [isPosting, setIsPosting] = useState(false);

  // Firestore states
  const [dbDentals, setDbDentals] = useState<Dental[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore
  useEffect(() => {
    const q = query(collection(db, "dentals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Dental[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const typeVal = data.type || "all_services";
        
        const tabs = ["all"];
        if (typeVal === "surgery" || typeVal === "all_services") tabs.push("surgery");
        if (typeVal === "orthodontics" || typeVal === "all_services") tabs.push("orthodontics");
        if (typeVal === "scaling" || typeVal === "all_services") tabs.push("scaling");

        list.push({
          id: docSnap.id,
          name: data.name || "",
          doctor: data.doctor || "",
          specialty: data.specialty || "ডেন্টাল সার্জন",
          location: data.location || "",
          time: data.time || "",
          services: data.services || "",
          phone: data.phone || "",
          icon: "🦷",
          tabs: tabs,
          buttonLabel: "📞 সিরিয়াল বুক করুন"
        });
      });
      setDbDentals(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading dentals:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDoctor.trim() || !newSpecialty.trim() || !newLocation.trim() || !newTime.trim() || !newServices.trim() || !newPhone.trim()) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "dentals"), {
        name: newName.trim(),
        doctor: newDoctor.trim(),
        specialty: newSpecialty.trim(),
        location: newLocation.trim(),
        time: newTime.trim(),
        services: newServices.trim(),
        phone: newPhone.trim(),
        type: newType,
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewName("");
      setNewDoctor("");
      setNewSpecialty("");
      setNewLocation("");
      setNewTime("");
      setNewServices("");
      setNewPhone("");
      setNewType("all_services");
      setShowPostForm(false);
      alert("ডেন্টাল ক্লিনিক তথ্য সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting dental:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ডেন্টাল তথ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "dentals", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting dental:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const allDentals = [...dbDentals, ...staticDentals];
  const filteredDentals = allDentals.filter(d => d.tabs.includes(activeTab));

  return (
    <div className="font-sans pb-10">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #00695C, #004D40)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border border-white/10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-[#4DB6AC] text-sm font-medium mb-2 uppercase tracking-wide">দন্ত ও মুখ গহ্বর চিকিৎসা</p>
          <h1 className="text-4xl font-black mb-1 text-white">ডেন্টাল কেয়ার</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
             পুঠিয়া উপজেলার অভিজ্ঞ ডেন্টাল সার্জন এবং দাঁতের সর্বাধুনিক চিকিৎসা কেয়ার সেন্টারের অবস্থান ও যোগাযোগের ডিরেক্টরি।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1">
        {[
          { id: 'all', label: 'সব ডেন্টাল', emoji: '🦷' },
          { id: 'surgery', label: 'দাঁতের সার্জারি', emoji: '🔪' },
          { id: 'orthodontics', label: 'দাঁত সোজা করা', emoji: '🦷' },
          { id: 'scaling', label: 'স্কেলিং ও পলিশ', emoji: '✨' }
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

      {/* Post Toggle Button */}
      <div className="px-1 mb-5">
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="w-full bg-[#00695C] hover:bg-[#004D40] text-white font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-900/20 active:scale-[0.99] border-none"
        >
          {showPostForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন ডেন্টাল কেয়ার পোস্ট করুন"}
        </button>
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
              <Sparkles className="w-5 h-5 text-teal-600" /> নতুন ডেন্টাল কেয়ার ডিরেক্টরি এন্ট্রি
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              পুঠিয়া উপজেলায় রোগীদের দাঁত ও মুখের আধুনিক চিকিৎসা প্রদানকারী যেকোনো ক্লিনিক বা ডাক্তারের তথ্য যুক্ত করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ল্যাবরেটরি স্পেশালিটি: *</label>
                <select
                  value={newType || ""}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                >
                  <option value="all_services">🦷 সাধারণ ও সম্পূর্ণ ডেন্টাল কেয়ার (All Services)</option>
                  <option value="surgery">🔪 দাঁতের সার্জারি ও রুট ক্যানেল (Surgery & RCT)</option>
                  <option value="orthodontics">🦷 দাঁত সোজা করা ও ব্রেইসেস (Orthodontics)</option>
                  <option value="scaling">✨ আল্ট্রাসনিক স্কেলিং ও পলিশ (Scaling & Polish)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্লিনিক/চেম্বারের নাম: *</label>
                <input
                  type="text"
                  required
                  value={newName || ""}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="যেমন: পুঠিয়া ডেন্টাল কেয়ার"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">বিশেষজ্ঞ ডাক্তারের নাম: *</label>
                <input
                  type="text"
                  required
                  value={newDoctor || ""}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  placeholder="যেমন: ডাঃ মোঃ আশিকুর রহমান"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">ডিগ্রী (Degrees): *</label>
                <input
                  type="text"
                  required
                  value={newSpecialty || ""}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="যেমন: BDS, PGT (Dental Surgery)"
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
                  placeholder="যেমন: থানা রোড, পুঠিয়া সদর"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">চেম্বার সময়সূচী: *</label>
                <input
                  type="text"
                  required
                  value={newTime || ""}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="যেমন: প্রতিদিন বিকেল ৩:০০ — রাত ৮:৩০"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">যোগাযোগ/সিরিয়াল বুকিং মোবাইল: *</label>
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
              <label className="text-[10px] font-bold text-slate-500 block mb-1">উপলব্ধ ডেন্টাল সেবা: *</label>
              <textarea
                required
                rows={3}
                value={newServices || ""}
                onChange={(e) => setNewServices(e.target.value)}
                placeholder="যেমন: ব্যথামুক্ত দাঁত তোলা, রুট ক্যানেল থেরাপী (RCT), দাঁতের আল্ট্রাসনিক স্কেলিং..."
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

      {/* Dental Directory Feed Section */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-teal-50 shadow-sm">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredDentals.length > 0 ? (
          filteredDentals.map((dental) => {
            const isCustom = !staticDentals.some(sd => sd.id === dental.id);

            return (
              <div key={dental.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
                {/* Delete button for custom dentals */}
                {isCustom && (
                  <button
                    onClick={() => handleDelete(dental.id)}
                    className="absolute top-4 right-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex gap-4 pr-6">
                  <div className="w-16 h-16 rounded-full bg-[#E0F2F1] text-[#00695C] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#4DB6AC]">
                     {dental.icon}
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">{dental.name}</h4>
                    <p className="text-sm text-[#00695C] font-bold mt-1">{dental.doctor}</p>
                    <p className="text-xs text-gray-500 font-medium">{dental.specialty}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                   <div className="flex items-start gap-2">
                      <span className="shrink-0 text-sm mt-0.5">📍</span> 
                      <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">ঠিকানা:</span> {dental.location}</p>
                   </div>
                   <div className="flex items-start gap-2">
                      <span className="shrink-0 text-sm mt-0.5">⏱️</span> 
                      <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">চেম্বার সময়:</span> {dental.time}</p>
                   </div>
                </div>
                
                <p className="mt-4 text-sm text-gray-600 font-sans leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <span className="font-bold text-gray-700">উপলব্ধ সেবা:</span> {dental.services}
                </p>
                
                <a 
                  href={`tel:${dental.phone}`}
                  className="text-sm font-bold text-center mt-5 flex items-center justify-center gap-2 w-full bg-[#E0F2F1] hover:bg-[#B2DFDB] px-5 py-3 rounded-xl shadow-sm transition text-[#00695C]"
                  style={{
                    backgroundColor: dental.id === "puthia_dental" ? "#00695C" : undefined,
                    color: dental.id === "puthia_dental" ? "white" : undefined,
                  }}
                >
                  {dental.buttonLabel}
                </a>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-8 bg-white border border-gray-100 rounded-3xl shadow-sm mx-1">কোনো ডেন্টাল কেয়ার পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
};

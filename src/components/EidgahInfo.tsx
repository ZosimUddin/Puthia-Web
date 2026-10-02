import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Calendar, Users, MapPin, Phone, Info, CheckCircle, PlusCircle, Trash2, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Eidgah {
  id: string;
  name: string;
  union: string;
  location: string;
  capacity: string;
  khatib: string;
  committeeHead: string;
  phone: string;
  timeFitr: string;
  timeAdha: string;
}

const EIDGAH_LIST: Eidgah[] = [
  {
    id: "e1",
    name: "পুঠিয়া উপজেলা কেন্দ্রীয় ঈদগাহ মাঠ",
    union: "পুঠিয়া সদর",
    location: "পুঠিয়া সরকারি কলেজ মাঠ সংলগ্ন, পুঠিয়া সদর",
    capacity: "১৫,০০০ জন",
    khatib: "মুফতি আব্দুর রহমান (খতিব, মডেল মসজিদ)",
    committeeHead: "উপজেলা নির্বাহী কর্মকর্তা (ইউএনও) - পদাধিকারবলে",
    phone: "01711223344",
    timeFitr: "সকাল ০৭:৪৫ মিনিট",
    timeAdha: "সকাল ০৭:৩০ মিনিট"
  },
  {
    id: "e2",
    name: "বানেশ্বর ইউনিয়ন কেন্দ্রীয় ঈদগাহ ময়দান",
    union: "বানেশ্বর",
    location: "বানেশ্বর বহুমুখী উচ্চ বিদ্যালয় মাঠ সংলগ্ন, বানেশ্বর বাজার",
    capacity: "১২,০০০ জন",
    khatib: "মাওলানা মো: নূরুল ইসলাম",
    committeeHead: "আলহাজ্ব মো: আব্দুল হামিদ (সভাপতি)",
    phone: "01722334455",
    timeFitr: "সকাল ০৮:০০ মিনিট",
    timeAdha: "সকাল ০৭:৪৫ মিনিট"
  },
  {
    id: "e3",
    name: "ঝলমলিয়া কেন্দ্রীয় ঈদগাহ মাঠ",
    union: "জিউপাড়া",
    location: "ঝলমলিয়া বাসস্ট্যান্ডের উত্তর পাশে",
    capacity: "৮,০০০ জন",
    khatib: "মাওলানা মো: আব্দুল হালিম",
    committeeHead: "মো: রফিকুল ইসলাম (সেক্রেটারি)",
    phone: "01733445566",
    timeFitr: "সকাল ০৮:১৫ মিনিট",
    timeAdha: "সকাল ০৮:০০ মিনিট"
  },
  {
    id: "e4",
    name: "শিলমাড়িয়া ইউনিয়ন ঈদগাহ ময়দান",
    union: "শিলমাড়িয়া",
    location: "শিলমাড়িয়া হাই স্কুল সংলগ্ন মাঠ",
    capacity: "৬,০০০ জন",
    khatib: "মাওলানা আশরাফ আলী",
    committeeHead: "মো: খলিলুর রহমান (সভাপতি)",
    phone: "01744556677",
    timeFitr: "সকাল ০৮:৩০ মিনিট",
    timeAdha: "সকাল ০৮:১৫ মিনিট"
  },
  {
    id: "e5",
    name: "ভালুকগাছী বাজার ঈদগাহ মাঠ",
    union: "ভালুকগাছী",
    location: "ভালুকগাছী বাজার হাই স্কুল মাঠ প্রাঙ্গণ",
    capacity: "৭,৫০০ জন",
    khatib: "মাওলানা সাইদুর রহমান",
    committeeHead: "মো: রেজাউল করিম (সাধারণ সম্পাদক)",
    phone: "01755667788",
    timeFitr: "সকাল ০৮:০০ মিনিট",
    timeAdha: "সকাল ০৭:৪৫ মিনিট"
  }
];

export function EidgahInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unionFilter, setUnionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"list" | "guidelines" | "volunteer">("list");
  
  // Eid tab toggle (Fitr vs Adha)
  const [eidMode, setEidMode] = useState<"fitr" | "adha">("fitr");

  // DB States
  const [dbEidgahs, setDbEidgahs] = useState<Eidgah[]>([]);

  // Add Eidgah Form state
  const [showEidgahForm, setShowEidgahForm] = useState(false);
  const [eName, setEName] = useState("");
  const [eUnion, setEUnion] = useState("পুঠিয়া সদর");
  const [eLocation, setELocation] = useState("");
  const [eCapacity, setECapacity] = useState("");
  const [eKhatib, setEKhatib] = useState("");
  const [eCommitteeHead, setECommitteeHead] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eTimeFitr, setETimeFitr] = useState("সকাল ০৭:৪৫ মিনিট");
  const [eTimeAdha, setETimeAdha] = useState("সকাল ০৭:৩০ মিনিট");
  const [eidgahSubmitSuccess, setEidgahSubmitSuccess] = useState(false);

  // Fetch from DB
  useEffect(() => {
    const q = query(collection(db, "eidgah_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Eidgah[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Eidgah);
      });
      setDbEidgahs(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "eidgah_posts");
    });
    return () => unsubscribe();
  }, []);

  const handleCreateEidgah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eName || !eLocation || !eKhatib || !ePhone) {
      alert("দয়া করে নাম, অবস্থান, খতিব ও মোবাইল নাম্বার দিন।");
      return;
    }

    try {
      await addDoc(collection(db, "eidgah_posts"), {
        name: eName,
        union: eUnion,
        location: eLocation,
        capacity: eCapacity || "৫,০০০ জন",
        khatib: eKhatib,
        committeeHead: eCommitteeHead || "স্থানীয় কমিটি",
        phone: ePhone,
        timeFitr: eTimeFitr,
        timeAdha: eTimeAdha,
        userId: user ? user.uid : "guest",
        createdAt: new Date().toISOString()
      });

      setEidgahSubmitSuccess(true);
      setEName("");
      setELocation("");
      setECapacity("");
      setEKhatib("");
      setECommitteeHead("");
      setEPhone("");

      setTimeout(() => {
        setEidgahSubmitSuccess(false);
        setShowEidgahForm(false);
      }, 2500);
    } catch (err) {
      alert("ঈদগাহ সাবমিট করা সম্ভব হয়নি।");
    }
  };

  const eidgahList = [...dbEidgahs, ...EIDGAH_LIST];

  // Volunteer state
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [selectedField, setSelectedField] = useState(eidgahList[0]?.name || "পুঠিয়া উপজেলা কেন্দ্রীয় ঈদগাহ মাঠ");
  const [volunteerSuccess, setVolunteerSuccess] = useState(false);
  const [volunteerList, setVolunteerList] = useState<{name: string, phone: string, field: string}[]>([
    { name: "মো: আরিফুল ইসলাম", phone: "01712345678", field: "পুঠিয়া উপজেলা केंद्रीय ঈদগাহ মাঠ" },
    { name: "সাকিব আল হাসান", phone: "01823456789", field: "বানেশ্বর ইউনিয়ন কেন্দ্রীয় ঈদগাহ ময়দান" }
  ]);

  const handleRegisterVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName || !volunteerPhone) return;

    const newVolunteer = {
      name: volunteerName,
      phone: volunteerPhone,
      field: selectedField
    };

    setVolunteerList([newVolunteer, ...volunteerList]);
    setVolunteerSuccess(true);
    setVolunteerName("");
    setVolunteerPhone("");
    
    setTimeout(() => {
      setVolunteerSuccess(false);
    }, 4000);
  };

  const filteredFields = eidgahList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.khatib.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnion = unionFilter === "all" || e.union === unionFilter;
    return matchesSearch && matchesUnion;
  });

  return (
    <div className="font-sans space-y-6 pb-12 text-left animate-fade-in" id="eidgah-info-view">
      
      {/* 1. Header Hero Banner - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="ঈদগাহ মাঠ ও ঈদ জামাত ডিরেক্টরি"
        subtitle="পুঠিয়া উপজেলার সকল কেন্দ্রীয় ও গ্রামীণ ঐতিহ্যবাহী ঈদগাহ মাঠের তালিকা, জামাতের সময়সূচী, ঈদ প্রস্তুতি এবং স্বেচ্ছাসেবক নেটওয়ার্ক।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              ঈদের জামাত নির্দেশিকা
            </span>
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
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="ঈদগাহ বা এলাকার নাম দিয়ে খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      {/* Tabs Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "list", label: "🕌 মাঠ ও সময়সূচী", icon: "🕌" },
          { id: "guidelines", label: "📋 ঈদ প্রস্তুতি নিয়ম", icon: "📋" },
          { id: "volunteer", label: "🤝 স্বেচ্ছাসেবক ফরম", icon: "🤝" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer flex flex-col items-center justify-center ${
              activeTab === tab.id 
                ? 'bg-teal-50 border-teal-300 text-teal-800' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EIDGAH LIST & TIMING */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-teal-50/50 p-3 rounded-2xl border border-teal-600/10">
            <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider">ঈদগাহ মাঠ ও ঈদ জামাত ডিরেক্টরি</span>
            <button
              onClick={() => {
                setShowEidgahForm(!showEidgahForm);
                setEidgahSubmitSuccess(false);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition border-none shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {showEidgahForm ? "ফর্ম বন্ধ করুন" : "নতুন ঈদগাহ মাঠ যোগ করুন"}
            </button>
          </div>

          {showEidgahForm && (
            <form onSubmit={handleCreateEidgah} className="bg-white border border-teal-600/10 p-5 rounded-3xl space-y-4 shadow-sm text-xs text-left">
              <h4 className="font-extrabold text-sm text-teal-850">নতুন ঈদগাহ মাঠ তালিকাভুক্ত করুন</h4>
              {eidgahSubmitSuccess && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-2xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-teal-600" /> সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ঈদগাহ মাঠের নাম *</label>
                  <input type="text" required placeholder="যেমন: বানেশ্বর বাজার বড় ঈদগাহ মাঠ" value={eName || ""} onChange={e => setEName(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ইউনিয়ন *</label>
                  <select value={eUnion || ""} onChange={e => setEUnion(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                    <option value="বানেশ্বর">বানেশ্বর</option>
                    <option value="বেলপুকুর">বেলপুকুর</option>
                    <option value="জিউপাড়া">জিউপাড়া</option>
                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ঈদগাহের ধারণক্ষমতা</label>
                  <input type="text" placeholder="যেমন: ৫,০০০ জন" value={eCapacity || ""} onChange={e => setECapacity(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">সম্মানিত ইমাম/খতিব *</label>
                  <input type="text" required placeholder="যেমন: হাফেজ মাওলানা মো: সোলায়মান" value={eKhatib || ""} onChange={e => setEKhatib(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">কমিটি প্রধান/সভাপতি</label>
                  <input type="text" placeholder="যেমন: মো: রফিকুল ইসলাম (সভাপতি)" value={eCommitteeHead || ""} onChange={e => setECommitteeHead(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">কমিটি মোবাইল নাম্বার *</label>
                  <input type="tel" required placeholder="যেমন: 017xxxxxxxx" value={ePhone || ""} onChange={e => setEPhone(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ঈদুল ফিতর জামাত সময়সূচী *</label>
                  <input type="text" required placeholder="যেমন: সকাল ০৭:৪৫ মিনিট" value={eTimeFitr || ""} onChange={e => setETimeFitr(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ঈদুল আজহা জামাত সময়সূচী *</label>
                  <input type="text" required placeholder="যেমন: সকাল ০৭:৩০ মিনিট" value={eTimeAdha || ""} onChange={e => setETimeAdha(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">ঠিকানা ও সুনির্দিষ্ট অবস্থান *</label>
                  <input type="text" required placeholder="যেমন: বানেশ্বর হাই স্কুল খেলার মাঠ সংলগ্ন, পুঠিয়া" value={eLocation || ""} onChange={e => setELocation(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border-none">
                <PlusCircle className="w-4 h-4" /> নতুন ঈদগাহ মাঠ যুক্ত করুন
              </button>
            </form>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 inset-y-0 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ঈদগাহের নাম বা স্থান লিখে খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition"
              />
            </div>
            
            {/* Filter */}
            <select
              value={unionFilter || ""}
              onChange={(e) => setUnionFilter(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="all">সব ইউনিয়ন</option>
              <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
              <option value="বানেশ্বর">বানেশ্বর ইউনিয়ন</option>
              <option value="জিউপাড়া">জিউপাড়া ইউনিয়ন</option>
              <option value="শিলমাড়িয়া">শিলমাড়িয়া ইউনিয়ন</option>
              <option value="ভালুকগাছী">ভালুকগাছী ইউনিয়ন</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredFields.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-3xl block mb-2">🌾</span>
                <h5 className="text-sm font-bold text-gray-700">কোনো ঈদগাহ পাওয়া যায়নি ভাই</h5>
                <p className="text-gray-400 text-xs mt-1">দয়া করে ভিন্ন বানান ব্যবহার করে পুনরায় চেষ্টা করুন।</p>
              </div>
            ) : (
              filteredFields.map(e => (
                <div key={e.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0D9488]"></div>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="bg-teal-50 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-2 inline-block">
                        📍 {e.union}
                      </span>
                      {user && (e as any).userId === user.uid && (
                        <button
                          onClick={async () => {
                            if (confirm("আপনি কি নিশ্চিতভাবে এই ঈদগাহ মাঠের তথ্যটি মুছে ফেলতে চান?")) {
                              try {
                                await deleteDoc(doc(db, "eidgah_posts", e.id));
                              } catch (err) {
                                alert("মুছে ফেলা সম্ভব হয়নি।");
                              }
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border-none cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-extrabold text-gray-800 text-base leading-snug">{e.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {e.location}
                    </p>
                  </div>

                  {/* Eid Times Info */}
                  <div className="grid grid-cols-2 gap-2 bg-teal-50/30 p-3 rounded-2xl border border-teal-100/30">
                    <div>
                      <span className="text-[10px] text-teal-700 font-bold block">ঈদুল ফিতর জামাত</span>
                      <span className="text-xs font-extrabold text-teal-900">{e.timeFitr}</span>
                    </div>
                    <div className="border-l border-teal-100/50 pl-3">
                      <span className="text-[10px] text-teal-700 font-bold block">ঈদুল আজহা জামাত</span>
                      <span className="text-xs font-extrabold text-teal-900">{e.timeAdha}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1.5 pt-1">
                    <p><b>খতিব/ইমাম:</b> {e.khatib}</p>
                    <p><b>ধারণক্ষমতা:</b> {e.capacity} মুসল্লি</p>
                    <p><b>কমিটি প্রধান:</b> {e.committeeHead}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex justify-between items-center -mx-5 -mb-5 p-4 bg-gray-50/50 rounded-b-3xl">
                    <span className="text-[10px] text-gray-400 font-bold">জরুরি ঈদ সমন্বয় কন্টাক্ট</span>
                    <a 
                      href={`tel:${e.phone}`}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> কল করুন ({e.phone})
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EID PREPARATION GUIDELINES */}
      {activeTab === "guidelines" && (
        <div className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button 
              onClick={() => setEidMode("fitr")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                eidMode === "fitr" ? "bg-white text-teal-800 shadow-sm" : "text-gray-500"
              }`}
            >
              🌸 ঈদুল ফিতর গাইডলাইন
            </button>
            <button 
              onClick={() => setEidMode("adha")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                eidMode === "adha" ? "bg-white text-teal-800 shadow-sm" : "text-gray-500"
              }`}
            >
              🐑 ঈদুল আজহা (কোরবানি)
            </button>
          </div>

          {eidMode === "fitr" ? (
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-600" /> পবিত্র ঈদুল ফিতরের সাধারণ নির্দেশনাবলী
              </h3>
              
              <ul className="space-y-2.5 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
                <li><b>সদকাতুল ফিতর (ফিতরা):</b> ঈদের নামাজে যাওয়ার পূর্বে ইসলামি ফাউন্ডেশন কর্তৃক নির্ধারিত নূন্যতম ফিতরার হার অনুযায়ী পরিবারের সবার ফিতরা আদায় করুন ভাই।</li>
                <li><b>ঈদগাহে যাতায়াত:</b> সুন্নাহ অনুযায়ী ঈদগাহে যাওয়ার সময় এক রাস্তা দিয়ে যাওয়া এবং ফেরার সময় অন্য রাস্তা ব্যবহার করা উত্তম।</li>
                <li><b>তাকবীর পাঠ:</b> বাসা থেকে ঈদগাহে যাওয়ার পথে অনুচ্চ স্বরে তাকবীর পাঠ করুন: <i>\"আল্লাহু আকবার, আল্লাহু আকবার, লা ইলাহা ইল্লাল্লাহু, ওয়াল্লাহু আকবার, আল্লাহু আকবার, ওয়ালিল্লাহিল হামদ\"</i>।</li>
                <li><b>আবহাওয়া সতর্কতা:</b> ঈদের দিন সকালে বৃষ্টি হওয়ার সম্ভাবনা থাকলে উপজেলা প্রশাসন কর্তৃক জামাত নিকটবর্তী কেন্দ্রীয় জামে মসজিদে স্থানান্তর করার সিদ্ধান্ত তাৎক্ষণিকভাবে মাইকিং করে জানিয়ে দেওয়া হবে।</li>
              </ul>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-teal-600" /> কোরবানি ও বর্জ্য অপসারণ নির্দেশিকা
              </h3>
              
              <ul className="space-y-2.5 text-xs text-gray-600 list-disc pl-4 leading-relaxed">
                <li><b>নির্দিষ্ট স্থানে কোরবানি:</b> পৌরসভার ড্রেনেজ বা খোলা জায়গায় পশুর রক্ত ও বর্জ্য ফেলা থেকে বিরত থাকুন। নির্ধারিত বা বালু চাপা দেওয়া স্থানে কোরবানি করুন ভাই।</li>
                <li><b>বর্জ্য অপসারণ ও ব্লিচিং:</b> পশু জবাইয়ের পর স্থানটি পানি দিয়ে ভালোভাবে ধুয়ে ব্লিচিং পাউডার বা স্যাভলন ছিটিয়ে জীবাণুমুক্ত রাখুন।</li>
                <li><b>পৌরসভার বর্জ্য ভ্যান:</b> পুঠিয়া পৌরসভার বর্জ্যবাহী বিশেষ ভ্যান ঈদের দিন দুপুর থেকে বর্জ্য সংগ্রহে বের হবে। কোনো ময়লা রাস্তায় ফেলবেন না।</li>
                <li><b>পশুর চামড়া বিক্রয়:</b> চামড়ার ন্যায্যমূল্য পেতে এবং এতিমখানার তহবিলে সহযোগিতার জন্য স্থানীয় লিল্লাহ বোর্ডিং বা এতিমখানায় চামড়া দান করুন।</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGISTER VOLUNTEER FOR PREPARATION */}
      {activeTab === "volunteer" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-sm mb-1.5">🤝 ঈদগাহ মাঠ প্রস্তুতি স্বেচ্ছাসেবক নেটওয়ার্ক</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              ঈদের দিন হাজার হাজার মুসল্লির ওজু, বসার কাতার এবং শৃঙ্খলা রক্ষার জন্য স্থানীয় যুবকদের স্বেচ্ছাসেবী অবদান প্রয়োজন। আপনার পছন্দের ঈদগাহ মাঠে যুক্ত হতে নিচের ফর্মটি পূরণ করুন ভাই।
            </p>

            {volunteerSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                আপনার স্বেচ্ছাসেবী নিবন্ধন সফল হয়েছে। কমিটির পক্ষ থেকে কল দেওয়া হবে ভাই!
              </div>
            )}

            <form onSubmit={handleRegisterVolunteer} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">আপনার নাম *</label>
                <input 
                  type="text"
                  required
                  value={volunteerName || ""}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="যেমন: মো: কামরুজ্জামান"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">মোবাইল নম্বর *</label>
                <input 
                  type="tel"
                  required
                  value={volunteerPhone || ""}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">পছন্দের ঈদগাহ মাঠ *</label>
                <select
                  value={selectedField || ""}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:bg-white outline-none cursor-pointer"
                >
                  {EIDGAH_LIST.map((e, idx) => (
                    <option key={idx} value={e.name || ""}>{e.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition active:scale-95 cursor-pointer text-center"
              >
                নিবন্ধন সম্পন্ন করুন
              </button>
            </form>
          </div>

          {/* Registered Volunteers list */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-xs mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" /> নিবন্ধিত তরুণ স্বেচ্ছাসেবক ভাইদের তালিকা ({volunteerList.length} জন)
            </h3>

            <div className="space-y-2.5">
              {volunteerList.map((v, idx) => (
                <div key={idx} className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50 text-xs flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-800">{v.name}</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">মাঠ: {v.field}</p>
                  </div>
                  <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-100/30">
                    📞 {v.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

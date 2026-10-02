import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, PlusCircle, Phone, Calendar, Heart, Shield, Check, Info, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface BurialGround {
  id: string;
  name: string;
  type: "graveyard" | "cremation";
  union: string;
  location: string;
  caretaker: string;
  phone: string;
  size: string;
}

interface JanazaNotice {
  id: string;
  deceasedName: string;
  age: string;
  passingTime: string;
  janazaTime: string;
  location: string;
  contactPerson: string;
  phone: string;
}

const BURIAL_GROUND_LIST: BurialGround[] = [
  {
    id: "bg1",
    name: "পুঠিয়া পৌরসভা কেন্দ্রীয় গোরস্থান",
    type: "graveyard",
    union: "পুঠিয়া সদর",
    location: "পৌরসভা ৫নং ওয়ার্ড, গোরস্থান মোড়",
    caretaker: "মো: আব্দুল কুদ্দুস (তদারককারী)",
    phone: "01712009988",
    size: "৪.৫ একর"
  },
  {
    id: "bg2",
    name: "বানেশ্বর ইউনিয়ন পাবলিক গোরস্থান",
    type: "graveyard",
    union: "বানেশ্বর",
    location: "বানেশ্বর দিঘীর উত্তর পাড়, বানেশ্বর",
    caretaker: "মো: মফিজ উদ্দিন (কমিটি সদস্য)",
    phone: "01723112233",
    size: "৩.০ একর"
  },
  {
    id: "bg3",
    name: "জিউপাড়া ইউনিয়ন সাধারণ গোরস্থান",
    type: "graveyard",
    union: "জিউপাড়া",
    location: "জিউপাড়া হাই স্কুল মাঠের কাছে",
    caretaker: "মো: জয়নাল আবেদীন",
    phone: "01734223344",
    size: "২.৫ একর"
  },
  {
    id: "bg4",
    name: "পুঠিয়া রাজবাড়ী শিব মন্দির সংলগ্ন মহাশ্মশান",
    type: "cremation",
    union: "পুঠিয়া সদর",
    location: "রাজবাড়ী দীঘির পূর্ব-দক্ষিণ কোণ, শিব মন্দির সংলগ্ন",
    caretaker: "শ্রী অনিল কুমার সরকার (কমিটি প্রধান)",
    phone: "01745334455",
    size: "১.৫ একর"
  },
  {
    id: "bg5",
    name: "বানেশ্বর ঘাট শ্মশানঘাট",
    type: "cremation",
    union: "বানেশ্বর",
    location: "বানেশ্বর বিলের পার, খেয়াঘাট সংলগ্ন",
    caretaker: "শ্রী নিমাই চন্দ্র ঘোষ",
    phone: "01756445566",
    size: "১.০ একর"
  }
];

const INITIAL_NOTICES: JanazaNotice[] = [
  {
    id: "n1",
    deceasedName: "হাজী মো: রফিকুল ইসলাম (৭৮)",
    age: "৭৮ বছর",
    passingTime: "আজ সকাল ০৬:৩০ মিনিট",
    janazaTime: "আজ বাদ জোহর (দুপুর ০২:০০ টা)",
    location: "পুঠিয়া মডেল মসজিদ প্রাঙ্গণ ও কেন্দ্রীয় গোরস্থান",
    contactPerson: "মো: কামাল হোসেন (পুত্র)",
    phone: "01712345678"
  },
  {
    id: "n2",
    deceasedName: "শ্রীমতী রাধিকা রানী দাস (৬৫)",
    age: "৬৫ বছর",
    passingTime: "গতকাল রাত ০৯:১৫ মিনিট",
    janazaTime: "আজ সকাল ০৯:৩০ টায় দাহকার্য সম্পন্ন",
    location: "পুঠিয়া শিব মন্দির মহাশ্মশানঘাট",
    contactPerson: "বিপ্লব দাস (পোদ্দার)",
    phone: "01812345679"
  }
];

const EMERGENCY_SERVICES = [
  { role: "দাফন ও খাটিয়া সহায়তা স্বেচ্ছাসেবী টিম", contact: "পুঠিয়া যুব কল্যাণ ক্লাব", phone: "01777889900", icon: "🤝" },
  { role: "প্রধান গোরখোদক (কবর খননকারী)", contact: "রহমত আলী (পৌর এলাকা)", phone: "01725456789", icon: "🛠️" },
  { role: "কাফন কাপড় ও শেষ সামগ্রী বিক্রেতা", contact: "বিসমিল্লাহ ক্লথ স্টোর, পুঠিয়া বাজার", phone: "01711556677", icon: "📦" },
  { role: "ফ্রি লাশবাহী ফ্রিজার ভ্যান ও অ্যাম্বুলেন্স", contact: "আঞ্জুমান মফিদুল ইসলাম (রাজশাহী শাখা)", phone: "01713008899", icon: "🚑" }
];

export function GraveyardInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "notices" | "emergency">("list");
  
  // DB states
  const [dbNotices, setDbNotices] = useState<JanazaNotice[]>([]);
  const [dbGrounds, setDbGrounds] = useState<BurialGround[]>([]);
  
  // Create Notice form state
  const [showForm, setShowForm] = useState(false);
  const [decName, setDecName] = useState("");
  const [decAge, setDecAge] = useState("");
  const [passTime, setPassTime] = useState("");
  const [janTime, setJanTime] = useState("");
  const [loc, setLoc] = useState("");
  const [conName, setConName] = useState("");
  const [conPhone, setConPhone] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Create Burial Ground form state
  const [showGroundForm, setShowGroundForm] = useState(false);
  const [gName, setGName] = useState("");
  const [gType, setGType] = useState<"graveyard" | "cremation">("graveyard");
  const [gUnion, setGUnion] = useState("পুঠিয়া সদর");
  const [gLocation, setGLocation] = useState("");
  const [gCaretaker, setGCaretaker] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gSize, setGSize] = useState("");
  const [groundSubmitSuccess, setGroundSubmitSuccess] = useState(false);

  useEffect(() => {
    // 1. Fetch Janaza Notices
    const qNotices = query(collection(db, "janaza_notices"), orderBy("createdAt", "desc"));
    const unsubNotices = onSnapshot(qNotices, (snapshot) => {
      const list: JanazaNotice[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as JanazaNotice);
      });
      setDbNotices(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "janaza_notices");
    });

    // 2. Fetch Burial Grounds
    const qGrounds = query(collection(db, "graveyard_posts"), orderBy("createdAt", "desc"));
    const unsubGrounds = onSnapshot(qGrounds, (snapshot) => {
      const list: BurialGround[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as BurialGround);
      });
      setDbGrounds(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "graveyard_posts");
    });

    return () => {
      unsubNotices();
      unsubGrounds();
    };
  }, []);
  
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decName || !janTime || !loc || !conPhone) return;

    try {
      await addDoc(collection(db, "janaza_notices"), {
        deceasedName: `${decName} (${decAge ? decAge + " বছর" : "বয়স জানা যায়নি"})`,
        age: decAge ? `${decAge} বছর` : "অপ্রকাশিত",
        passingTime: passTime || "সম্প্রতি",
        janazaTime: janTime,
        location: loc,
        contactPerson: conName || "পরিবারের সদস্য",
        phone: conPhone,
        userId: user ? user.uid : "guest",
        createdAt: new Date().toISOString()
      });

      setSubmitSuccess(true);
      
      // reset form
      setDecName("");
      setDecAge("");
      setPassTime("");
      setJanTime("");
      setLoc("");
      setConName("");
      setConPhone("");

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 2500);
    } catch (err) {
      alert("জানাজা নোটিশ তৈরি করা সম্ভব হয়নি।");
    }
  };

  const handleCreateGround = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName || !gLocation || !gPhone) {
      alert("দয়া করে নাম, অবস্থান এবং মোবাইল নাম্বার দিন।");
      return;
    }

    try {
      await addDoc(collection(db, "graveyard_posts"), {
        name: gName,
        type: gType,
        union: gUnion,
        location: gLocation,
        caretaker: gCaretaker || "স্থানীয় কমিটি",
        phone: gPhone,
        size: gSize || "উল্লেখ নেই",
        userId: user ? user.uid : "guest",
        createdAt: new Date().toISOString()
      });

      setGroundSubmitSuccess(true);
      
      // reset form
      setGName("");
      setGLocation("");
      setGCaretaker("");
      setGPhone("");
      setGSize("");

      setTimeout(() => {
        setGroundSubmitSuccess(false);
        setShowGroundForm(false);
      }, 2500);
    } catch (err) {
      alert("নতুন স্থান যুক্ত করা সম্ভব হয়নি।");
    }
  };

  const notices = [...dbNotices, ...INITIAL_NOTICES];
  const burialGrounds = [...dbGrounds, ...BURIAL_GROUND_LIST];

  // Filter grounds
  const filteredGrounds = burialGrounds.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.union.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans space-y-6 pb-12 text-left animate-fade-in" id="graveyard-info-view">
      
      {/* 1. Header Hero Banner - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="কবরস্থান ও শ্মশানঘাট নির্দেশিকা"
        subtitle="পুঠিয়া এলাকার সকল পাবলিক গোরস্থান ও শ্মশানঘাটের বিবরণ, সাম্প্রতিক জানাজার নোটিশ বোর্ড এবং দাফন সহায়তা স্বেচ্ছাসেবক ডিরেক্টরি।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              দাফন ও অন্ত্যেষ্টিক্রিয়া তথ্য
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
        searchPlaceholder="কবরস্থান বা এলাকা লিখে খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      {/* solemn thoughts indicator */}
      <div className="bg-zinc-50 border border-zinc-200/60 p-3.5 rounded-2xl text-[11px] text-zinc-600 leading-relaxed italic text-center">
        \"প্রতিটি প্রাণকেই মৃত্যুর স্বাদ গ্রহণ করতে হবে।\" — আমাদের এই ক্ষুদ্র উদ্যোগ বিপদের সময় প্রতিটি পুঠিয়াবাসীর পাশে দাঁড়ানোর জন্য।
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "list", label: "🪦 গোরস্থান ও শ্মশান", icon: "🪦" },
          { id: "notices", label: "📢 জানাজার নোটিশ", icon: "📢" },
          { id: "emergency", label: "📞 শেষ বিদায়ের সেবা", icon: "🚑" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery("");
            }}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer flex flex-col items-center justify-center ${
              activeTab === tab.id 
                ? 'bg-zinc-800 border-zinc-900 text-white' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BURIAL GROUNDS DIRECTORY */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">গোরস্থান ও শ্মশানঘাট ডিরেক্টরি</span>
            <button
              onClick={() => {
                setShowGroundForm(!showGroundForm);
                setGroundSubmitSuccess(false);
              }}
              className="bg-zinc-800 hover:bg-zinc-950 text-white text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm border-none"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {showGroundForm ? "ফর্ম বন্ধ করুন" : "নতুন স্থান যোগ করুন"}
            </button>
          </div>

          {showGroundForm && (
            <form onSubmit={handleCreateGround} className="bg-zinc-50 border border-zinc-200/50 p-5 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-sm text-zinc-800">নতুন কবরস্থান বা শ্মশানঘাট যুক্ত করুন</h4>
              {groundSubmitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> সফলভাবে যুক্ত করা হয়েছে!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">নাম *</label>
                  <input type="text" required placeholder="যেমন: পুঠিয়া সদর গোরস্থান" value={gName || ""} onChange={e => setGName(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ধরন *</label>
                  <select value={gType || ""} onChange={e => setGType(e.target.value as any)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl">
                    <option value="graveyard">🪦 কবরস্থান</option>
                    <option value="cremation">🔥 শ্মশানঘাট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">ইউনিয়ন *</label>
                  <select value={gUnion || ""} onChange={e => setGUnion(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl">
                    <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                    <option value="বানেশ্বর">বানেশ্বর</option>
                    <option value="বেলপুকুর">বেলপুকুর</option>
                    <option value="জিউপাড়া">জিউপাড়া</option>
                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">জমির পরিমাণ</label>
                  <input type="text" placeholder="যেমন: ২.৫ একর" value={gSize || ""} onChange={e => setGSize(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-500 font-bold mb-1">অবস্থান ও ঠিকানা *</label>
                  <input type="text" required placeholder="যেমন: ৫নং ওয়ার্ড, গোরস্থান মোড়" value={gLocation || ""} onChange={e => setGLocation(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">তদারককারী / সুপার</label>
                  <input type="text" placeholder="যেমন: মো: আব্দুল কুদ্দুস" value={gCaretaker || ""} onChange={e => setGCaretaker(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">মোবাইল নাম্বার *</label>
                  <input type="tel" required placeholder="যেমন: 017xxxxxxxx" value={gPhone || ""} onChange={e => setGPhone(e.target.value)} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 px-4 bg-zinc-800 text-white font-extrabold text-xs rounded-xl hover:bg-zinc-950 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm border-none">
                <PlusCircle className="w-4 h-4" /> ডাটাবেজে পোস্ট করুন
              </button>
            </form>
          )}

          <div className="relative">
            <span className="absolute left-3.5 inset-y-0 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কবরস্থান বা শ্মশানঘাটের নাম লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-zinc-800/10 focus:border-zinc-800 outline-none transition"
            />
          </div>

          <div className="space-y-4">
            {filteredGrounds.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-3xl block mb-2">🌳</span>
                <h5 className="text-sm font-bold text-gray-700">কোনো তথ্য পাওয়া যায়নি ভাই</h5>
              </div>
            ) : (
              filteredGrounds.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${b.type === "graveyard" ? "bg-emerald-600" : "bg-amber-600"}`}></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5 inline-block ${
                        b.type === "graveyard" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {b.type === "graveyard" ? "🪦 কবরস্থান" : "🔥 শ্মশানঘাট"} • {b.union}
                      </span>
                      <h3 className="font-extrabold text-gray-800 text-base leading-snug">{b.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {b.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p><b>দায়িত্বপ্রাপ্ত তদারককারী:</b> {b.caretaker}</p>
                    <p><b>মোট জমির পরিমাণ:</b> {b.size}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex justify-between items-center -mx-5 -mb-5 p-4 bg-gray-50/50 rounded-b-3xl">
                    <span className="text-[10px] text-gray-400 font-bold">অনুমতি ও বরাদ্দের জন্য কন্টাক্ট</span>
                    <div className="flex gap-2 items-center">
                      {user && (b as any).userId === user.uid && (
                        <button
                          onClick={async () => {
                            if (confirm("আপনি কি নিশ্চিতভাবে এই স্থানটি মুছে ফেলতে চান?")) {
                              try {
                                await deleteDoc(doc(db, "graveyard_posts", b.id));
                              } catch (err) {
                                alert("মুছে ফেলা সম্ভব হয়নি।");
                              }
                            }
                          }}
                          className="bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 p-1.5 rounded-xl transition cursor-pointer border-none"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a 
                        href={`tel:${b.phone}`}
                        className="bg-zinc-800 hover:bg-zinc-950 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition border-none"
                      >
                        <Phone className="w-3 h-3" /> কল করুন ({b.phone})
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JANAZA & CREMATION NOTICE BOARD */}
      {activeTab === "notices" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
              📢 সাম্প্রতিক শোক সংবাদ ও জানাজা নোটিশ বোর্ড
            </h3>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSubmitSuccess(false);
              }}
              className="bg-zinc-800 hover:bg-zinc-950 text-white text-[10.5px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {showForm ? "বন্ধ করুন" : "নতুন নোটিশ"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-md space-y-3.5 animate-fade-in">
              <h4 className="font-bold text-gray-800 text-xs border-b border-gray-100 pb-2">নতুন নোটিশ ফরম পূরণ করুন</h4>
              
              {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> নোটিশটি বোর্ড এ যুক্ত হয়েছে ভাই!
                </div>
              )}

              <form onSubmit={handleCreateNotice} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">মৃত ব্যক্তির নাম *</label>
                    <input 
                      type="text" required value={decName || ""} onChange={(e) => setDecName(e.target.value)}
                      placeholder="যেমন: হাজী আব্দুল কুদ্দুস"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">বয়স (ঐচ্ছিক)</label>
                    <input 
                      type="number" value={decAge || ""} onChange={(e) => setDecAge(e.target.value)}
                      placeholder="যেমন: ৭৫"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">মৃত্যুর সময় (ঐচ্ছিক)</label>
                    <input 
                      type="text" value={passTime || ""} onChange={(e) => setPassTime(e.target.value)}
                      placeholder="যেমন: আজ ভোর ৪:৩০ মিনিটে"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">জানাজা বা শেষকৃত্যের সময় *</label>
                    <input 
                      type="text" required value={janTime || ""} onChange={(e) => setJanTime(e.target.value)}
                      placeholder="যেমন: আজ বাদ আসর"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">জানাজা বা শেষকৃত্যের স্থান *</label>
                  <input 
                    type="text" required value={loc || ""} onChange={(e) => setLoc(e.target.value)}
                    placeholder="যেমন: পুঠিয়া পাইলট স্কুল মাঠ প্রাঙ্গণ"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">যোগাযোগকারী সদস্য</label>
                    <input 
                      type="text" value={conName || ""} onChange={(e) => setConName(e.target.value)}
                      placeholder="যেমন: মো: কামরুল (পুত্র)"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">মোবাইল নম্বর *</label>
                    <input 
                      type="tel" required value={conPhone || ""} onChange={(e) => setConPhone(e.target.value)}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-950 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  বোর্ডে প্রকাশ করুন
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {notices.map(n => (
              <div key={n.id} className="bg-white p-5 rounded-3xl border border-red-100/50 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-50 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl border-l border-b border-red-100/40">
                  শোক সংবাদ
                </div>

                <div className="pr-16">
                  <h4 className="font-extrabold text-gray-800 text-base">{n.deceasedName}</h4>
                  <p className="text-[11px] text-gray-400 mt-1"><b>মৃত্যু:</b> {n.passingTime}</p>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl space-y-1 text-xs text-zinc-700">
                  <p><b>⏰ জানাজা / শেষকৃত্য সময়:</b> <span className="font-bold text-red-800">{n.janazaTime}</span></p>
                  <p><b>📍 স্থান:</b> <span className="font-bold text-zinc-800">{n.location}</span></p>
                </div>

                <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-gray-50">
                  <span className="text-gray-400 text-[10px]">পরিবারের কন্টাক্ট: {n.contactPerson}</span>
                  <div className="flex gap-2 items-center">
                    {user && (n as any).userId === user.uid && (
                      <button
                        onClick={async () => {
                          if (confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?")) {
                            try {
                              await deleteDoc(doc(db, "janaza_notices", n.id));
                            } catch (err) {
                              alert("মুছে ফেলা সম্ভব হয়নি।");
                            }
                          }
                        }}
                        className="bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 p-1.5 rounded-xl transition cursor-pointer border-none"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a 
                      href={`tel:${n.phone}`}
                      className="text-zinc-800 hover:text-emerald-700 flex items-center gap-1 border border-zinc-200 px-3 py-1.5 rounded-xl bg-zinc-50 cursor-pointer"
                    >
                      📞 কল করুন ({n.phone})
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY BURIAL & CREMATION SUPPORT SERVICES */}
      {activeTab === "emergency" && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-gray-800 text-sm">📞 শেষ বিদায়ের সেবা ও জরুরি কন্টাক্ট ডিরেক্টরি</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            বিপদের মুহূর্তে দাফনের কাপড় (কাফন), দাফন করানোর স্বেচ্ছাসেবক দল, কবর খনন বা সনাতন সম্প্রদায়ের চিতা সাজানোর কাঠ ও ধর্মীয় জিনিসপত্রের প্রয়োজনে নিচে সরাসরি যোগাযোগ করতে পারেন ভাই।
          </p>

          <div className="space-y-3">
            {EMERGENCY_SERVICES.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-gray-50 rounded-2xl border border-gray-100/50">{s.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">{s.role}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">যোগাযোগ: {s.contact}</p>
                  </div>
                </div>

                <a 
                  href={`tel:${s.phone}`}
                  className="bg-zinc-800 hover:bg-zinc-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> কল দিন ({s.phone})
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

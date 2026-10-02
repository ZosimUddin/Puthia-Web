import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, PlusCircle, Phone, Calendar, Heart, Share2, MapPin, Check, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";

interface ReligiousEvent {
  id: string;
  title: string;
  religion: "islam" | "hindu" | "all";
  date: string;
  time: string;
  location: string;
  speaker: string;
  organizer: string;
  phone: string;
  description: string;
}

const UPCOMING_EVENTS: ReligiousEvent[] = [
  {
    id: "re1",
    title: "বাৎসরিক তাফসিরুল কোরআন তাফসির মাহফিল",
    religion: "islam",
    date: "১৬ই অক্টোবর, ২০২৬",
    time: "বাদ আসর হতে মধ্যরাত পর্যন্ত",
    location: "পুঠিয়া উপজেলা মডেল স্কুল খেলার মাঠ",
    speaker: "মুফতি আমির হামজা (ঢাকা) ও অন্যান্য ওলামায়ে কেরাম",
    organizer: "উপজেলা ইমাম ও মোয়াজ্জিন কল্যাণ পরিষদ, পুঠিয়া",
    phone: "01712112233",
    description: "ইসলামের আলো ছড়িয়ে দেওয়ার বাৎসরিক প্রধান সম্মেলন। বিশাল প্যান্ডেলে পুরুষ ও মহিলাদের পৃথক পর্দা সহকারে বসার সুব্যবস্থা থাকবে।"
  },
  {
    id: "re2",
    title: "ঐতিহাসিক শ্রী শ্রী শারদীয় দুর্গাপূজা উৎসব",
    religion: "hindu",
    date: "১৯-২৩শে অক্টোবর, ২০২৬",
    time: "সারাদিন ব্যাপী (বিশেষ অঞ্জলি ও আরতি সন্ধ্যা ৬ টায়)",
    location: "পুঠিয়া রাজবাড়ী মন্দির প্রাঙ্গণ (পৌর এলাকা)",
    speaker: "শ্রী অনিল রায় (পুরোহিত প্রধান)",
    organizer: "পুঠিয়া রাজবাড়ী পূজা উদযাপন কমিটি",
    phone: "01722334455",
    description: "পুঠিয়ার ঐতিহাসিক রাজবাড়ী গোবিন্দ মন্দিরে জমকালো আলোকসজ্জা ও সাংস্কৃতিক অনুষ্ঠানের মাধ্যমে ৫ দিন ব্যাপী আনন্দ উৎসব।"
  },
  {
    id: "re3",
    title: "পবিত্র ঈদে মিলাদুন্নবী (সা:) র‍্যালি ও আলোচনা সভা",
    religion: "islam",
    date: "১২ই রবিউল আউয়াল (সম্ভাব্য সেপ্টেম্বর ২০২৬)",
    time: "সকাল ০৯:০০ ঘটিকা",
    location: "পুঠিয়া ত্রিমোহনী বাজার হতে উপজেলা পরিষদ অডিটোরিয়াম",
    speaker: "আলহাজ্ব মাওলানা মো: হাসানুজ্জামান",
    organizer: "আশেকানে মোস্তফা সুন্নী যুব সংঘ, পুঠিয়া",
    phone: "01733445566",
    description: "মানবতার মুক্তির দূত হযরত মুহাম্মদ (সা:) এর আগমনী উপলক্ষে শান্তি শোভাযাত্রা, নাতে রাসুল প্রতিযোগিতা এবং তবারক বিতরণ।"
  },
  {
    id: "re4",
    title: "মহাবতার শ্রীকৃষ্ণের শুভ জন্মাষ্টমী শোভাযাত্রা",
    religion: "hindu",
    date: "আগস্ট, ২০২৬ (নির্ধারিত তিথিতে)",
    time: "দুপুর ০২:৩০ মিনিট",
    location: "পুঠিয়া জগন্নাথ রথ মন্দির মোড় হতে পৌর সদর প্রদক্ষিণ",
    speaker: "শ্রী শ্যামল চক্রবর্তী (উপদেষ্টা)",
    organizer: "বাংলাদেশ পূজা উদযাপন পরিষদ, পুঠিয়া শাখা",
    phone: "01744556677",
    description: "বর্ণাঢ্য র‍্যালি, শঙ্খধ্বনি এবং মঙ্গল শোভাযাত্রার মাধ্যমে জন্মাষ্টমী উৎসব উদযাপন।"
  }
];

export function ReligiousEventsInfo({ onGoBack }: { onGoBack: () => void }) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [religionFilter, setReligionFilter] = useState<"all" | "islam" | "hindu">("all");
  const [activeTab, setActiveTab] = useState<"calendar" | "announce" | "harmony">("calendar");

  // State for posted announcements
  const [dbEvents, setDbEvents] = useState<ReligiousEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [evtTitle, setEvtTitle] = useState("");
  const [evtRel, setEvtRel] = useState<"islam" | "hindu">("islam");
  const [evtDate, setEvtDate] = useState("");
  const [evtTime, setEvtTime] = useState("");
  const [evtLoc, setEvtLoc] = useState("");
  const [evtSpeaker, setEvtSpeaker] = useState("");
  const [evtOrg, setEvtOrg] = useState("");
  const [evtPhone, setEvtPhone] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "religious_event_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: ReligiousEvent[] = [];
      snapshot.forEach((doc) => {
        eventsData.push({
          id: doc.id,
          ...doc.data()
        } as ReligiousEvent);
      });
      setDbEvents(eventsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "religious_event_posts");
    });
    return () => unsubscribe();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!evtTitle || !evtDate || !evtLoc || !evtPhone) return;

    try {
      await addDoc(collection(db, "religious_event_posts"), {
        title: evtTitle,
        religion: evtRel,
        date: evtDate,
        time: evtTime || "সময় যথাসময়ে জানানো হবে",
        location: evtLoc,
        speaker: evtSpeaker || "আমন্ত্রিত গুণী ব্যক্তিবর্গ",
        organizer: evtOrg || "স্থানীয় এলাকাবাসী",
        phone: evtPhone,
        description: evtDesc || "সকলকে উপস্থিত থাকার জন্য বিনীতভাবে আহ্বান জানানো যাচ্ছে।",
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      setSubmitSuccess(true);

      // reset fields
      setEvtTitle("");
      setEvtDate("");
      setEvtTime("");
      setEvtLoc("");
      setEvtSpeaker("");
      setEvtOrg("");
      setEvtPhone("");
      setEvtDesc("");

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
        setActiveTab("calendar");
      }, 2500);
    } catch (err) {
      alert("আবেদন সাবমিট করা সম্ভব হয়নি।");
    }
  };

  const announcedEvents = [...dbEvents, ...UPCOMING_EVENTS];

  const filteredEvents = announcedEvents.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReligion = religionFilter === "all" || e.religion === religionFilter;
    return matchesSearch && matchesReligion;
  });

  return (
    <div className="font-sans space-y-6 pb-12 text-left animate-fade-in" id="religious-events-view">
      
      {/* 1. Header Hero Banner - Festive Gold & Purple Indigo gradient theme */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #4F46E5, #312E81)" }}
      >
        <button 
          onClick={onGoBack} 
          id="religious-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-indigo-500/30 text-indigo-100 border border-indigo-400/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            ধর্মীয় অনুষ্ঠানসূচী
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">ধর্মীয় অনুষ্ঠান ও ওয়াজ-পূজা ডিরেক্টরি</h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-indigo-400/50 pl-3 py-1">
            পুঠিয়া উপজেলার বিভিন্ন ওয়াজ মাহফিল, তাফসির সম্মেলন, শারদীয় দুর্গাপূজা উৎসব, মিলাদ মাহফিল এবং বাৎসরিক ধর্মীয় অনুষ্ঠানের খোঁজ-খবর।
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400 opacity-20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-300 opacity-15 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: "calendar", label: "📅 উৎসব ক্যালেন্ডার", icon: "📅" },
          { id: "announce", label: "📢 নতুন ঘোষণা দিন", icon: "📢" },
          { id: "harmony", label: "🤝 ধর্মীয় সম্প্রীতি", icon: "🤝" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer flex flex-col items-center justify-center ${
              activeTab === tab.id 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
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
                placeholder="অনুষ্ঠান বা বক্তার নাম লিখে খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
              />
            </div>
            
            {/* Filter */}
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button 
                onClick={() => setReligionFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  religionFilter === "all" ? "bg-white text-indigo-800 shadow-sm" : "text-gray-500"
                }`}
              >
                সব
              </button>
              <button 
                onClick={() => setReligionFilter("islam")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  religionFilter === "islam" ? "bg-white text-indigo-800 shadow-sm" : "text-gray-500"
                }`}
              >
                ইসলামিক
              </button>
              <button 
                onClick={() => setReligionFilter("hindu")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  religionFilter === "hindu" ? "bg-white text-indigo-800 shadow-sm" : "text-gray-500"
                }`}
              >
                সনাতন
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                <span className="text-3xl block mb-2">🕌</span>
                <h5 className="text-sm font-bold text-gray-700">কোনো অনুষ্ঠান পাওয়া যায়নি ভাই</h5>
                <p className="text-gray-400 text-xs mt-1">দয়া করে অন্য কোনো উৎসবের নাম অনুসন্ধান করুন।</p>
              </div>
            ) : (
              filteredEvents.map(e => (
                <div key={e.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${e.religion === "islam" ? "bg-emerald-500" : "bg-indigo-500"}`}></div>
                  
                  <div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full mb-1.5 inline-block ${
                      e.religion === "islam" ? "bg-emerald-50 text-emerald-800" : "bg-indigo-50 text-indigo-800"
                    }`}>
                      {e.religion === "islam" ? "🕌 ওয়াজ / ইসলামিক" : "🕉️ সনাতন / হিন্দু উৎসব"}
                    </span>
                    <h3 className="font-extrabold text-gray-800 text-base leading-snug">{e.title}</h3>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed text-justify bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    {e.description}
                  </p>

                  <div className="text-xs text-gray-600 space-y-1.5 pt-1">
                    <p className="flex items-center gap-1.5 font-semibold text-indigo-900">
                      <Calendar className="w-4 h-4 text-indigo-600 shrink-0" /> তারিখ: {e.date}
                    </p>
                    <p className="pl-5"><b>সময়:</b> {e.time}</p>
                    <p className="pl-5"><b>স্থান:</b> {e.location}</p>
                    <p className="pl-5"><b>বক্তা/পুরোহিত:</b> {e.speaker}</p>
                    <p className="pl-5"><b>আয়োজক:</b> {e.organizer}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-3 flex justify-between items-center -mx-5 -mb-5 p-4 bg-gray-50/50 rounded-b-3xl">
                    <span className="text-[10px] text-gray-400 font-bold">যোগাযোগ ও সহযোগিতা কন্টাক্ট</span>
                    <div className="flex gap-2 items-center">
                      {user && (e as any).userId === user.uid && (
                        <button
                          onClick={async () => {
                            if (confirm("আপনি কি নিশ্চিতভাবে এই ঘোষণাটি মুছে ফেলতে চান?")) {
                              try {
                                await deleteDoc(doc(db, "religious_event_posts", e.id));
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
                        href={`tel:${e.phone}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3 h-3" /> কল করুন ({e.phone})
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT FORM */}
      {activeTab === "announce" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-sm mb-1.5">📢 নতুন ধর্মীয় অনুষ্ঠানের ঘোষণা দিন (ফ্রি মাইকিং)</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              আপনার এলাকার মসজিদে ওয়াজ মাহফিল, রাসুল মিলাদ অথবা মন্দিরে বাৎসরিক পুজো ও কীর্তন অনুষ্ঠানের কথা উপজেলার হাজার হাজার মানুষের কাছে পৌঁছে দিতে এই সহজ ফর্মটি পূরণ করুন ভাই।
            </p>

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4.5 h-4.5 text-emerald-600" />
                আপনার অনুষ্ঠানের ঘোষণা সফলভাবে যুক্ত হয়েছে ভাই!
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">অনুষ্ঠানের নাম *</label>
                  <input 
                    type="text" required value={evtTitle || ""} onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="যেমন: ওয়াজ মাহফিল"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">ধর্মীয় ক্যাটাগরি *</label>
                  <select
                    value={evtRel || ""}
                    onChange={(e) => setEvtRel(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="islam">🕌 ইসলামিক</option>
                    <option value="hindu">🕉️ সনাতন (হিন্দু)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">তারিখ *</label>
                  <input 
                    type="text" required value={evtDate || ""} onChange={(e) => setEvtDate(e.target.value)}
                    placeholder="যেমন: ১৫ই সেপ্টেম্বর"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">সময়</label>
                  <input 
                    type="text" value={evtTime || ""} onChange={(e) => setEvtTime(e.target.value)}
                    placeholder="যেমন: বাদ আসর"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">অনুষ্ঠানের স্থান *</label>
                  <input 
                    type="text" required value={evtLoc || ""} onChange={(e) => setEvtLoc(e.target.value)}
                    placeholder="যেমন: বাণেশ্বর বাজার মাঠ"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">বক্তা বা প্রধান পুরোহিত</label>
                  <input 
                    type="text" value={evtSpeaker || ""} onChange={(e) => setEvtSpeaker(e.target.value)}
                    placeholder="যেমন: মাওলানা আব্দুল লতিফ"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">আয়োজক কমিটি</label>
                  <input 
                    type="text" value={evtOrg || ""} onChange={(e) => setEvtOrg(e.target.value)}
                    placeholder="যেমন: বাজার যুব সংঘ"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">মোবাইল কন্টাক্ট *</label>
                  <input 
                    type="tel" required value={evtPhone || ""} onChange={(e) => setEvtPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                <textarea 
                  value={evtDesc || ""} onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="যেমন: মহিলাদের জন্য পর্দার পৃথক ব্যবস্থা আছে..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition active:scale-95 cursor-pointer text-center"
              >
                ঘোষণাটি প্রচার করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HARMONY & PEACE */}
      {activeTab === "harmony" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-gray-800 text-sm">পুঠিয়ার ঐতিহ্যবাহী সাম্প্রদায়িক সম্প্রীতি</h3>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed text-justify">
              রাজশাহীর পুঠিয়া উপজেলা ঐতিহাসিক কাল থেকেই হিন্দু-মুসলিম ভাতৃত্বের ও শান্তির অনন্য মূর্ত প্রতীক। এখানে একই মাঠের একদিকে রাজবাড়ী শিব মন্দির ও অন্য পাশে বাৎসরিক ওয়াজ মাহফিল বা নামাজ শান্ত ও আনন্দঘন পরিবেশে যুগ যুগ ধরে পরিচালিত হয়ে আসছে।
            </p>

            <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl space-y-2.5">
              <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">🤝 সম্প্রীতি বজায় রাখতে আমাদের পালনীয় নীতি:</h4>
              <ul className="text-xs text-amber-800 space-y-2 list-disc pl-4 leading-relaxed">
                <li>ধর্মীয় ভিন্নতা সত্ত্বেও একে অপরের উৎসবকে শ্রদ্ধা করুন এবং প্রয়োজনে একে অপরকে সার্বিক সহযোগিতা দিন।</li>
                <li>পূজার আনন্দ ও ধর্মীয় মিলাদ-মাহফিলে কোনো ধরণের বিভ্রান্তি ছড়াবেন না। যেকোনো গুজবে কান দেওয়ার পূর্বে স্থানীয় মুরব্বী বা প্রশাসনের সাথে যোগাযোগ করুন।</li>
                <li>যেকোনো সংকটে শান্ত থাকুন এবং পুঠিয়া মডেল থানা (ডিউটি অফিসার নম্বর: <b>01320122485</b>)-তে তাৎক্ষণিক খবর দিন।</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

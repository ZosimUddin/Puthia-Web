import React, { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Activity, Table, Phone, X, Award, ShieldAlert, User, Users, Plus, Trash2, Calendar, MapPin, PhoneCall } from "lucide-react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { addSocialEvent, deleteSocialEvent } from "../api";

interface Props { onGoBack: () => void; hideHeader?: boolean; }

export const SportsActivities: React.FC<Props> = ({ onGoBack, hideHeader }) => {
  const [filter, setFilter] = useState<"active" | "results">("active");
  const [showPoints, setShowPoints] = useState(false);
  const [showCommittee, setShowCommittee] = useState(false);

  // Firestore events
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [categoryType, setCategoryType] = useState<"active" | "results">("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "social_events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category === "sports_active" || data.category === "sports_results") {
          list.push({ id: doc.id, ...data });
        }
      });
      setDbEvents(list);
    }, (error) => {
      console.error("Error loading sports events:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !eventDate.trim() || !venue.trim() || !organizer.trim() || !contactPhone.trim()) {
      alert("দয়া করে সব কয়টি তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    // Merge teams into the description
    const fullDesc = team1.trim() && team2.trim() 
      ? `ম্যাচ: ${team1} বনাম ${team2}\n\n${description}`
      : description;

    try {
      await addSocialEvent({
        title,
        description: fullDesc,
        eventDate,
        eventTime: eventTime || "বিকাল ৪:০০ টা",
        venue,
        category: categoryType === "active" ? "sports_active" : "sports_results",
        organizer,
        contactPhone,
        createdAt: new Date().toISOString()
      });

      // Reset
      setTitle("");
      setTeam1("");
      setTeam2("");
      setDescription("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setOrganizer("");
      setContactPhone("");
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই ক্রীড়া আপডেটটি ডিলিট করতে চান?")) {
      try {
        await deleteSocialEvent(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const pointsTable = [
    { rank: 1, team: "বানেশ্বর একাদশ", played: 3, won: 2, drawn: 1, lost: 0, points: 7 },
    { rank: 2, team: "শিলমাড়িয়া স্পোর্টিং", played: 3, won: 2, drawn: 0, lost: 1, points: 6 },
    { rank: 3, team: "জিউপাড়া ইউনিয়ন এফসি", played: 3, won: 1, drawn: 1, lost: 1, points: 4 },
    { rank: 4, team: "পুঠিয়া সদর যুব সংঘ", played: 3, won: 0, drawn: 0, lost: 3, points: 0 },
  ];

  const committeeMembers = [
    { name: "আলহাজ্ব মো: রফিকুল ইসলাম", role: "সভাপতি, ক্রীড়া উপ-কমিটি", phone: "০১৭১১-২২৩৩৪৪" },
    { name: "মোহাম্মদ আলী রেজা", role: "সাধারণ সম্পাদক", phone: "০১৭১২-৫৫৬৬৭৭" },
    { name: "সোহেল রানা", role: "যুগ্ম সাধারণ সম্পাদক", phone: "০১৭১৩-৮৮৯৯০০" },
    { name: "মো: আরিফুল হক", role: "মাঠ ও ভেন্যু ইনচার্জ", phone: "০১৭১৪-১১২২৩৩" },
  ];

  // Merge dynamic events
  const activeList = [
    {
      id: "static_active_1",
      title: "পুঠিয়া গোল্ড কাপ ফুটবল টুর্নামেন্ট ২০২৬",
      team1: "বানেশ্বর একাদশ",
      team2: "শিলমাড়িয়া স্পোর্টিং",
      venue: "পুঠিয়া পিএন হাই স্কুল মাঠ",
      isLive: true,
      isStatic: true
    },
    ...dbEvents
      .filter(e => e.category === "sports_active")
      .map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        venue: e.venue,
        date: `${e.eventDate}, ${e.eventTime}`,
        organizer: e.organizer,
        contactPhone: e.contactPhone,
        isLive: false,
        isStatic: false
      }))
  ];

  const resultsList = [
    ...dbEvents
      .filter(e => e.category === "sports_results")
      .map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        venue: e.venue,
        date: e.eventDate,
        organizer: e.organizer,
        contactPhone: e.contactPhone,
        isStatic: false
      }))
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
          style={{ background: "linear-gradient(135deg, #7A1C28, #A82C35)" }}
        >
          <button 
            onClick={onGoBack} 
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
          >
            ← ফিরে যান
          </button>  
          <div className="mt-6 relative z-10">
            <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">মাঠের লড়াই ও ক্রীড়াঙ্গন</p>
            <h1 className="text-4xl font-black mb-1 text-white">স্থানীয় খেলাধুলা ও টুর্নামেন্ট</h1>
            <div className="w-10 h-1 bg-white rounded-full my-3"></div>
            <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
              পুঠিয়া সরকারি কলেজ মাঠ বা পিএন স্কুল মাঠে চলমান বিভিন্ন টুর্নামেন্টের লাইভ স্কোর ও ফিক্সচার।
            </p>
          </div>
        </div>
      )}

      <div className={`${!hideHeader ? 'px-4 ' : ''}space-y-4`}>
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={() => setFilter("active")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "active"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Activity className={`w-4 h-4 ${filter === "active" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              চলমান টুর্নামেন্ট
            </button>
            <button
              onClick={() => setFilter("results")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "results"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Trophy className={`w-4 h-4 ${filter === "results" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              ফলাফল ও ট্রফি
            </button>
          </div>

          <button
            onClick={() => {
              setCategoryType(filter);
              setShowAddModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> আপডেট পোস্ট করুন
          </button>
        </div>

        <div className="space-y-4">
          {filter === "active" && (
            <div className="space-y-4">
              {activeList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-4 relative overflow-hidden animate-fade-in text-left"
                >
                  {!item.isStatic && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition cursor-pointer"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex justify-between items-start pr-8">
                    <h3 className="text-base font-black text-gray-800 leading-tight">{item.title}</h3>
                    <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100 flex-shrink-0">⚽</span>
                  </div>

                  {item.isLive ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center relative">
                      <div className="absolute top-2 left-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-600 animate-ping"></span> লাইভ
                      </div>
                      <div className="flex items-center gap-4 w-full justify-between mt-2">
                        <div className="text-center flex-1">
                          <div className="font-bold text-gray-800 text-xs">{(item as any).team1}</div>
                        </div>
                        <div className="px-3 py-1 bg-[#7A1C28] text-emerald-600 rounded-lg font-black text-lg">
                          VS
                        </div>
                        <div className="text-center flex-1">
                          <div className="font-bold text-gray-800 text-xs">{(item as any).team2}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {(item as any).description}
                    </div>
                  )}

                  <div className="bg-red-50/30 p-3 rounded-xl border border-red-100/50 space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#7A1C28]" />
                      <span>ভেন্যু: {item.venue}</span>
                    </div>
                    {(item as any).date && (
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7A1C28]" />
                        <span>তারিখ ও সময়: {(item as any).date}</span>
                      </div>
                    )}
                    {(item as any).organizer && (
                      <div className="flex items-center gap-2 font-medium">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>আয়োজক: {(item as any).organizer}</span>
                      </div>
                    )}
                    {(item as any).contactPhone && (
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>মোবাইল: <a href={`tel:${(item as any).contactPhone}`} className="text-emerald-700 hover:underline">{(item as any).contactPhone}</a></span>
                      </div>
                    )}
                  </div>
                  
                  {item.isStatic && (
                    <div className="flex gap-2 w-full mt-1">
                      <button 
                        onClick={() => setShowPoints(true)}
                        className="flex-1 py-3 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                      >
                        <Table className="w-4 h-4" /> ইস্টার টেবিল
                      </button>
                      <button 
                        onClick={() => setShowCommittee(true)}
                        className="flex-[0.8] py-3 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                      >
                        <Phone className="w-4 h-4" /> আয়োজক কমিটি
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filter === "results" && (
            <div className="space-y-4">
              {/* Static past champion */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-8 animate-fade-in shadow-lg">
                <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800 mb-1">গত সিজনের চ্যাম্পিয়ন</p>
                <p className="text-xs text-[#7A1C28] font-bold bg-emerald-500/10 px-3 py-1 rounded-full w-fit mx-auto border border-emerald-500/30">🏆 বানেশ্বর একাদশ (২০২৫)</p>
                <div className="w-full h-px bg-gray-100 my-4" />
                <p className="text-xs font-semibold text-gray-500">চলতি সিজনের ফাইনাল আগামী আগস্ট ২০ ২৬-এ অনুষ্ঠিত হবে।</p>
              </div>

              {/* Dynamic results */}
              {resultsList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 relative overflow-hidden animate-fade-in text-left"
                >
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition cursor-pointer"
                    title="ডিলিট করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">খেলার ফলাফল</span>
                  </div>

                  <h4 className="text-sm font-extrabold text-gray-800 pr-8">{item.title}</h4>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5 mb-2.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </p>

                  <div className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/60 mb-3">
                    {item.description}
                  </div>

                  <div className="border-t border-gray-100 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                    {item.venue && <span>📍 ভেন্যু: {item.venue}</span>}
                    {item.organizer && <span>👤 আয়োজক: {item.organizer}</span>}
                    {item.contactPhone && <span>📞 মোবাইল: {item.contactPhone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Update Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black">নতুন ক্রীড়া আপডেট যোগ করুন</h3>
              <p className="text-xs text-red-200 mt-1">খেলার ফিক্সচার, চলমান ম্যাচের স্কোর বা অতীতের কোনো টুর্নামেন্ট ফলাফল প্রকাশ করুন</p>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">আপডেটের ধরণ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryType("active")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      categoryType === "active" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    ⚽ চলমান টুর্নামেন্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType("results")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      categoryType === "results" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    🏆 খেলা ও ট্রফি ফলাফল
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">টুর্নামেন্ট বা ম্যাচের শিরোনাম *</label>
                <input 
                  type="text" 
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ৩ নং ওয়ার্ড বনাম ৪ নং ওয়ার্ড ক্রিকেট ম্যাচ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              {categoryType === "active" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-red-50/50 rounded-2xl border border-red-100">
                  <div>
                    <label className="block text-[10px] font-black text-gray-700 mb-1">দল ১ (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      value={team1 || ""}
                      onChange={(e) => setTeam1(e.target.value)}
                      placeholder="যেমন: বানেশ্বর যুব সংঘ"
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-700 mb-1">দল ২ (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      value={team2 || ""}
                      onChange={(e) => setTeam2(e.target.value)}
                      placeholder="যেমন: শিলমাড়িয়া এফসি"
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">তারিখ *</label>
                  <input 
                    type="text" 
                    value={eventDate || ""}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="যেমন: ১৫ আগস্ট ২০২৬"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সময়</label>
                  <input 
                    type="text" 
                    value={eventTime || ""}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="যেমন: বিকাল ৪:০০ টা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">খেলার মাঠ (ভেন্যু) *</label>
                <input 
                  type="text" 
                  value={venue || ""}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="যেমন: পুঠিয়া পি.এন. হাই স্কুল মাঠ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">খেলার বিস্তারিত বিবরণ বা ফলাফল আপডেট *</label>
                <textarea 
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: হাফ টাইম পর্যন্ত ১-১ গোলে সমতা। দ্বিতীয়ার্ধের খেলা শুরু হতে যাচ্ছে..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আয়োজক *</label>
                  <input 
                    type="text" 
                    value={organizer || ""}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="যেমন: ক্রীড়া উপ-কমিটি পুঠিয়া"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">মোবাইল নম্বর *</label>
                  <input 
                    type="tel" 
                    value={contactPhone || ""}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "ক্রীড়া আপডেট পোস্ট করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Points Table Modal */}
      {showPoints && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowPoints(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Table className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">টুর্নামেন্ট স্ট্যান্ডিংস</span>
              </div>
              <h3 className="text-base font-black pr-8">গ্রুপ পর্বের ইস্টার টেবিল</h3>
            </div>

            <div className="p-4 overflow-x-auto text-left">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase font-bold">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5">দল</th>
                    <th className="py-2.5 text-center">ম্যাচ</th>
                    <th className="py-2.5 text-center">জয়</th>
                    <th className="py-2.5 text-center">ইস্টার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                  {pointsTable.map((team) => (
                    <tr key={team.rank} className="hover:bg-gray-50/50">
                      <td className="py-3 px-2 font-bold text-gray-400">{team.rank}</td>
                      <td className="py-3 font-bold text-gray-800">{team.team}</td>
                      <td className="py-3 text-center">{team.played}</td>
                      <td className="py-3 text-center text-emerald-600">{team.won}</td>
                      <td className="py-3 text-center font-black text-[#7A1C28]">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => setShowPoints(false)}
                className="w-full py-2.5 bg-[#7A1C28] text-emerald-600 text-xs font-black rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizing Committee Modal */}
      {showCommittee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-slate-800 to-slate-950 text-white">
              <button 
                onClick={() => setShowCommittee(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">কমিটি পরিচিতি</span>
              </div>
              <h3 className="text-base font-black pr-8">টুর্নামেন্ট আয়োজক কমিটি</h3>
            </div>

            <div className="p-5 space-y-3">
              {committeeMembers.map((member, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{member.name}</h4>
                    <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{member.role}</p>
                  </div>
                  <a 
                    href={`tel:${member.phone}`} 
                    className="p-2 bg-[#7A1C28]/10 text-[#7A1C28] rounded-xl hover:bg-[#7A1C28]/20 transition flex items-center gap-1 text-[10px] font-bold"
                  >
                    📞 কল করুন
                  </a>
                </div>
              ))}
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setShowCommittee(false)}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, CalendarCheck, MapPin, Navigation, X, Compass, Bus, Info, CheckCircle2, Map, Plus, Trash2, User, PhoneCall, Users } from "lucide-react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { addSocialEvent, deleteSocialEvent, registerForEvent, getEventUserRegistration } from "../api";

interface Props { onGoBack: () => void; hideHeader?: boolean; }

export const CommunityPrograms: React.FC<Props> = ({ onGoBack, hideHeader }) => {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [showMap, setShowMap] = useState(false);
  const [showRouteGuide, setShowRouteGuide] = useState(false);
  const [selectedPastEvent, setSelectedPastEvent] = useState<any | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, boolean>>({});

  // Firestore events
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [categoryType, setCategoryType] = useState<"upcoming" | "past">("upcoming");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "social_events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category === "programs_upcoming" || data.category === "programs_past") {
          list.push({ id: doc.id, ...data });
        }
      });
      setDbEvents(list);
    }, (error) => {
      console.error("Error loading programs:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!auth.currentUser) return;
      const regs: Record<string, boolean> = {};
      for (const event of dbEvents) {
        const reg = await getEventUserRegistration(event.id, auth.currentUser.uid);
        if (reg) {
          regs[event.id] = true;
        }
      }
      setUserRegistrations(regs);
    };

    if (dbEvents.length > 0 && auth.currentUser) {
      fetchRegistrations();
    }
  }, [dbEvents]);

  const handleRegister = async (eventId: string) => {
    if (!auth.currentUser) {
      alert("ইভেন্টে রেজিস্ট্রেশন করতে দয়া করে লগইন করুন।");
      return;
    }

    try {
      await registerForEvent({
        eventId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "ব্যবহারকারী",
        userPhone: "", // Could prompt for phone if needed
        createdAt: new Date().toISOString()
      });
      setUserRegistrations(prev => ({ ...prev, [eventId]: true }));
      alert("রেজিস্ট্রেশন সফল হয়েছে!");
    } catch (err) {
      console.error(err);
      alert("রেজিস্ট্রেশন করতে সমস্যা হয়েছে।");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !eventDate.trim() || !venue.trim() || !organizer.trim() || !contactPhone.trim()) {
      alert("দয়া করে সব কয়টি তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      await addSocialEvent({
        title,
        description,
        eventDate,
        eventTime: eventTime || "বিকেল ৩:০০ টা",
        venue,
        category: categoryType === "upcoming" ? "programs_upcoming" : "programs_past",
        organizer,
        contactPhone,
        createdAt: new Date().toISOString()
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setOrganizer("");
      setContactPhone("");
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি ডিলিট করতে চান?")) {
      try {
        await deleteSocialEvent(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const upcomingEvent = {
    title: "পুঠিয়ার ঐতিহাসিক রথযাত্রা উৎসব",
    date: "১০ জুলাই ২০২৬, বিকেল ৩:০০ টা",
    location: "মূল মন্দির প্রাঙ্গণ, পুঠিয়া রাজবাড়ী",
    daysLeft: "৩ দিন",
    description: "আষাঢ়ের শুক্লা দ্বিতীয় তিথিতে অনুষ্ঠিত হতে যাচ্ছে পুঠিয়ার শত বছরের ঐতিহ্যবাহী রথযাত্রা উৎসব। রথটান, ধর্মীয় পূজা-অর্চনা এবং মাসব্যাপী মেলাসহ নানা আয়োজনে মুখরিত থাকবে মন্দির প্রাঙ্গণ।"
  };

  const pastEvents = [
    {
      id: "p1",
      title: "ঐতিহাসিক পুঠিয়া বৈশাখী মেলা ২০২৬",
      date: "১৪ এপ্রিল ২০২৬",
      location: "পুঠিয়া রাজবাড়ী মাঠ",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80",
      description: "বাঙালির ঐতিহ্য ও লোকসংস্কৃতি ছড়িয়ে দিতে পুঠিয়া রাজবাড়ী মাঠে ৩ দিনব্যাপী বৈশাখী মেলা ও লোকজ উৎসব উদযাপিত হয়েছে। এতে ঐতিহ্যবাহী পুতুল নাচ, নাগরদোলা এবং হস্তশিল্পের কুটির শিল্প প্রদর্শনীর আয়োজন ছিল।"
    },
    {
      id: "p2",
      title: "উপজেলা বার্ষিক ক্রীড়া প্রতিযোগিতা ও যুব উৎসব",
      date: "১০ মার্চ ২০২৬",
      location: "পুঠিয়া পিএন হাই স্কুল মাঠ",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80",
      description: "পুঠিয়ার তরুণদের শারীরিক ও মানসিক বিকাশে উপজেলা প্রশাসনের উদ্যোগে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হয়েছে। এতে বিভিন্ন উচ্চ বিদ্যালয় ও কলেজের প্রায় ৫০০ শিক্ষার্থী অংশ নেয়।"
    },
    {
      id: "p3",
      title: "বসন্তকালীন সাংস্কৃতিক সন্ধ্যা ও পিঠা উৎসব",
      date: "১৫ ফেব্রুয়ারি ২০২৬",
      location: "উপজেলা অডিটোরিয়াম",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80",
      description: "ঋতুরাজ বসন্তকে বরণ করে নিতে পুঠিয়া শিল্পকলা একাডেমির উদ্যোগে মনোজ্ঞ সাংস্কৃতিক সন্ধ্যা এবং বিভিন্ন গ্রামীণ ঐতিহ্যবাহী পিঠার সমাহারে পিঠা উৎসবের আয়োজন করা হয়েছিল।"
    }
  ];

  // Merge static with db events
  const mergedUpcoming = [
    {
      id: "static_upcoming",
      title: upcomingEvent.title,
      date: upcomingEvent.date,
      location: upcomingEvent.location,
      daysLeft: upcomingEvent.daysLeft,
      description: upcomingEvent.description,
      isStatic: true
    },
    ...dbEvents
      .filter(e => e.category === "programs_upcoming")
      .map(e => ({
        id: e.id,
        title: e.title,
        date: `${e.eventDate}, ${e.eventTime}`,
        location: e.venue,
        daysLeft: "",
        description: e.description,
        organizer: e.organizer,
        contactPhone: e.contactPhone,
        isStatic: false
      }))
  ];

  const mergedPast = [
    ...pastEvents.map(e => ({ ...e, isStatic: true })),
    ...dbEvents
      .filter(e => e.category === "programs_past")
      .map(e => ({
        id: e.id,
        title: e.title,
        date: e.eventDate,
        location: e.venue,
        description: e.description,
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80",
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
            <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">আসন্ন ইভেন্ট ও উৎসব</p>
            <h1 className="text-4xl font-black mb-1 text-white">পুঠিয়ার ইভেন্ট ক্যালেন্ডার</h1>
            <div className="w-10 h-1 bg-white rounded-full my-3"></div>
            <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
              পুঠিয়া উপজেলায় চলতি মাসে আয়োজিত সকল ধর্মীয়, সামাজিক ও সরকারি অনুষ্ঠানের সময়সূচী।
            </p>
          </div>
        </div>
      )}

      <div className={`${!hideHeader ? 'px-4 ' : ''}space-y-4`}>
        {/* Post Button & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={() => setFilter("upcoming")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "upcoming"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Calendar className={`w-4 h-4 ${filter === "upcoming" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              আসন্ন অনুষ্ঠান
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "past"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <CalendarCheck className={`w-4 h-4 ${filter === "past" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              বিগত অনুষ্ঠান
            </button>
          </div>

          <button
            onClick={() => {
              setCategoryType(filter);
              setShowAddModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> অনুষ্ঠান পোস্ট করুন
          </button>
        </div>

        <div className="space-y-4">
          {filter === "upcoming" && (
            <div className="space-y-4">
              {mergedUpcoming.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in"
                >
                  {item.daysLeft && (
                    <div className="absolute top-0 right-0 py-1 px-3 bg-red-100 text-[#7A1C28] text-[10px] font-black rounded-bl-xl tracking-wider">
                      ⏳ আর মাত্র {item.daysLeft} বাকি
                    </div>
                  )}

                  {!item.isStatic && (
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <h3 className="text-lg font-black text-gray-800 leading-tight pr-20">{item.title}</h3>
                  
                  <p className="text-xs text-gray-600 font-medium leading-relaxed my-1 text-justify">
                    {item.description}
                  </p>

                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-[#7A1C28]" />
                        <span>{item.date}</span>
                      </div>
                      {((item as any).registrationCount || 0) > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Users size={12} /> {(item as any).registrationCount} জন রেজিস্ট্রেশন করেছেন
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-[#7A1C28]" />
                      <span>{item.location}</span>
                    </div>
                    {(item as any).organizer && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 pt-0.5 border-t border-red-100/30">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>আয়োজক: {(item as any).organizer}</span>
                      </div>
                    )}
                    {(item as any).contactPhone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>যোগাযোগ: <a href={`tel:${(item as any).contactPhone}`} className="text-emerald-700 hover:underline">{(item as any).contactPhone}</a></span>
                      </div>
                    )}
                  </div>

                  {!item.isStatic && (
                    <div className="mt-2">
                      {userRegistrations[item.id] ? (
                        <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={16} /> আপনি রেজিস্টার করেছেন
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleRegister(item.id)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={16} /> ইভেন্টে অংশগ্রহণ করুন (রেজিস্ট্রেশন)
                        </button>
                      )}
                    </div>
                  )}

                  {item.isStatic && (
                    <div className="grid grid-cols-2 gap-2 w-full mt-1">
                      <button 
                        onClick={() => setShowMap(true)}
                        className="py-3 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 animate-pulse" /> ম্যাপ ডিরেকশন
                      </button>
                      <button 
                        onClick={() => setShowRouteGuide(true)}
                        className="py-3 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                      >
                        📢 রুট গাইড
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {filter === "past" && (
            <div className="space-y-4 animate-fade-in">
              {mergedPast.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedPastEvent(event)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:border-red-200 transition active:scale-[0.99] relative"
                >
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight hover:text-red-700 transition-colors line-clamp-1 pr-8">{event.title}</h4>
                      <p className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-500" /> {event.date}
                      </p>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-1 leading-snug">{event.description}</p>
                    </div>
                  </div>

                  {!event.isStatic && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(event.id);
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Post Modal */}
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
              <h3 className="text-lg font-black">নতুন অনুষ্ঠান পোস্ট করুন</h3>
              <p className="text-xs text-red-200 mt-1">কমিউনিটির উদ্দেশ্যে গুরুত্বপূর্ণ উৎসব বা ঘোষণা প্রকাশ করুন</p>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পোস্টের ধরণ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryType("upcoming")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      categoryType === "upcoming" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    📅 আসন্ন অনুষ্ঠান
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType("past")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      categoryType === "past" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    🏆 বিগত অনুষ্ঠান
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">শিরোনাম *</label>
                <input 
                  type="text" 
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: পুঠিয়া পিএন স্কুল পুনর্মিলনী উৎসব"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">তারিখ *</label>
                  <input 
                    type="text" 
                    value={eventDate || ""}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="যেমন: ১৫ জুলাই ২০২৬"
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
                    placeholder="যেমন: সকাল ১০:০০ টা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">স্থান (ভেন্যু) *</label>
                <input 
                  type="text" 
                  value={venue || ""}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="যেমন: পুঠিয়া রাজবাড়ী চত্বর"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea 
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="অনুষ্ঠানের বিস্তারিত সূচী, আকর্ষণ বা তথ্যাবলী..."
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
                    placeholder="যেমন: পুঠিয়া যুব ক্লাব"
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
                    placeholder="যেমন: ০১৯১১-২২৩৩৪৪"
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
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "পোস্টটি সাবমিট করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Map Direction Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">ম্যাপ ও অবস্থান</span>
              </div>
              <h3 className="text-lg font-black pr-8">পুঠিয়া রাজবাড়ী অবস্থান গাইড</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Visual Map Mockup */}
              <div className="w-full h-44 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex flex-col justify-between p-3">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80')" }}></div>
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent, rgba(0,0,0,0.05))" }}></div>
                
                {/* Visual road/destination elements */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-[10px] bg-[#7A1C28] text-emerald-600 px-2 py-0.5 rounded-full font-bold">পুঠিয়া বাসস্ট্যান্ড</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">রাজবাড়ী লেক</span>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce border-2 border-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800 bg-white/95 px-2.5 py-1 rounded-full shadow border border-slate-100 mt-1">পুঠিয়া রাজবাড়ী (রথ মেলা)</span>
                </div>

                <div className="relative z-10 flex justify-between items-end text-[10px] text-slate-500 font-semibold bg-white/80 p-1.5 rounded-lg border border-slate-200">
                  <span>📍 ঢাকা-রাজশাহী মহাসড়ক থেকে মাত্র ১ কি.মি. ভেতরে</span>
                </div>
              </div>

              {/* Navigation instructions */}
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-red-100">১</div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">ঢাকা-রাজশাহী মহাসড়কের পুঠিয়া বাসস্ট্যান্ড মোড়ে নামুন।</p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-red-100">২</div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">সেখান থেকে দক্ষিণ দিকে রাজবাড়ীমুখী পিচঢালা সড়ক ধরে সরাসরি এগিয়ে যান (ভ্যান/অটোতে মাত্র ৫ মিনিট)।</p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-red-100">৩</div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">বড় শিব মন্দির পেরিয়ে সরাসরি রাজবাড়ী মাঠ এবং উৎসবের মূল ফটক দেখা যাবে।</p>
                </div>
              </div>

              <div className="w-full h-px bg-slate-100" />

              <a 
                href="https://www.google.com/maps/place/Puthia+Rajbari/@24.3644788,88.8415504,17z" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl text-xs font-black text-center transition shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Map className="w-4 h-4" /> গুগল ম্যাপে অবস্থান দেখুন (Google Maps)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Route Guide Modal */}
      {showRouteGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white">
              <button 
                onClick={() => setShowRouteGuide(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-5 h-5 text-yellow-300" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-300">যাতায়াত ও রুট গাইড</span>
              </div>
              <h3 className="text-lg font-black pr-8">কিভাবে আসবেন পুঠিয়া রাজবাড়ীতে?</h3>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Route Option: Rajshahi */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> রাজশাহী সদর থেকে:
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  রাজশাহী শিরোইল বাস টার্মিনাল অথবা ভদ্রা মোড় থেকে নাটোর/গোপালগঞ্জগামী যে কোনো লোকাল বা গেট লক বাসে উঠুন। পুঠিয়া বাসস্ট্যান্ড নামবেন। 
                  <br />
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded-md mt-1 inline-block">⏱️ সময়: ৪৫ মিনিট | ভাড়া: ৪০-৫০ টাকা</span>
                </p>
              </div>

              {/* Route Option: Natore */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> নাটোর সদর থেকে:
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  নাটোর হরিশপুর বাইপাস মোড় থেকে রাজশাহীগামী যে কোনো বাসে উঠে পুঠিয়া বাসস্ট্যান্ডে নামবেন। 
                  <br />
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded-md mt-1 inline-block">⏱️ সময়: ২৫ মিনিট | ভাড়া: ৩০ টাকা</span>
                </p>
              </div>

              {/* Route Option: Dhaka */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span> ঢাকা থেকে সরাসরি:
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  গাবতলী বা কল্যাণপুর থেকে রাজশাহীগামী যে কোনো দূরপাল্লার এসি/নন-এসি বাসে (যেমন: হানিফ, শ্যামলী, ন্যাশনাল, দেশ ট্রাভেলস) উঠে সরাসরি পুঠিয়া বাসস্ট্যান্ডে নেমে যাবেন। 
                  <br />
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded-md mt-1 inline-block">⏱️ সময়: ৫-৬ ঘণ্টা | ভাড়া: ৭০০-১২০০ টাকা</span>
                </p>
              </div>

              {/* Local Travel */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 leading-snug font-medium">
                  পুঠিয়া বাসস্ট্যান্ডে নামার পর রাজবাড়ী যাওয়ার জন্য প্রচুর ইজি-বাইক, ভ্যান বা চার্জার রিকশা পাবেন। জনপ্রতি ভাড়া মাত্র ১০ টাকা।
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => setShowRouteGuide(false)}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl text-xs font-black transition shadow-lg shadow-amber-700/15"
              >
                ঠিক আছে, ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Event Detail Modal */}
      {selectedPastEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-950 to-slate-900 text-white">
              <button 
                onClick={() => setSelectedPastEvent(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">সম্পন্ন অনুষ্ঠান</span>
              </div>
              <h3 className="text-base font-black pr-8 leading-snug">{selectedPastEvent.title}</h3>
            </div>

            <div className="w-full h-44 overflow-hidden bg-gray-100 border-b border-gray-100">
              <img src={selectedPastEvent.image} alt={selectedPastEvent.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> {selectedPastEvent.date}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedPastEvent.location}
                </span>
              </div>

              {selectedPastEvent.organizer && (
                <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <User className="w-4 h-4 text-emerald-600" /> <span>আয়োজক: {selectedPastEvent.organizer}</span>
                </div>
              )}
              {selectedPastEvent.contactPhone && (
                <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <PhoneCall className="w-4 h-4 text-emerald-600" /> <span>যোগাযোগ: {selectedPastEvent.contactPhone}</span>
                </div>
              )}

              <div className="w-full h-px bg-gray-100" />

              <p className="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100 text-justify">
                {selectedPastEvent.description}
              </p>
            </div>

            <div className="p-6 pt-0">
              <button
                type="button"
                onClick={() => setSelectedPastEvent(null)}
                className="w-full py-3 bg-[#7A1C28] text-emerald-600 font-black rounded-2xl text-xs hover:bg-[#63141E] transition cursor-pointer"
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

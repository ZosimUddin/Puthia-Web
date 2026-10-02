import React, { useState, useEffect } from "react";
import { ArrowLeft, Palette, Music, MapPin, PenTool, X, CheckCircle2, Compass, Map, Bus, Info, Navigation, Plus, Trash2, User, PhoneCall, Calendar } from "lucide-react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { addSocialEvent, deleteSocialEvent } from "../api";

interface Props { onGoBack: () => void; hideHeader?: boolean; }

export const CulturalActivities: React.FC<Props> = ({ onGoBack, hideHeader }) => {
  const [filter, setFilter] = useState<"academy" | "evening">("academy");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", age: "", branch: "music" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

  // Firestore events
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for posting an event
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [categoryType, setCategoryType] = useState<"academy" | "evening">("academy");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "social_events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category === "cultural_academy" || data.category === "cultural_evening") {
          list.push({ id: doc.id, ...data });
        }
      });
      setDbEvents(list);
    }, (error) => {
      console.error("Error loading cultural events:", error);
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
    try {
      await addSocialEvent({
        title,
        description,
        eventDate,
        eventTime: eventTime || "সন্ধ্যা ৬:০০ টা",
        venue,
        category: categoryType === "academy" ? "cultural_academy" : "cultural_evening",
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
    title: "রবীন্দ্র-নজরুল সন্ধ্যা ও বসন্ত উৎসব ২০২৬",
    date: "১৫ আগস্ট ২০২৬, সন্ধ্যা ৬:০০ টা",
    venue: "উপজেলা অডিটোরিয়াম, পুঠিয়া",
    description: "পুঠিয়া উপজেলা শিল্পকলা একাডেমির শিক্ষার্থীদের অংশগ্রহণে মনোজ্ঞ রবীন্দ্র-নজরুল সংগীতানুষ্ঠান ও বসন্ত বরণ উৎসব। স্থানীয় ও জাতীয় শিল্পীদের উপস্থিতিতে অনুষ্ঠানটি অনুষ্ঠিত হবে।"
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setFormSubmitted(false);
      setFormData({ name: "", phone: "", age: "", branch: "music" });
    }, 2500);
  };

  const mergedAcademy = [
    {
      id: "static_academy",
      title: "পুঠিয়া উপজেলা শিল্পকলা একাডেমি",
      description: "প্রতি সপ্তাহে গান, নাচ ও চিত্রাঙ্কন প্রশিক্ষণ দেওয়া হয়ে থাকে। পুঠিয়া উপজেলার সকল আগ্রহী শিক্ষার্থী ও সংস্কৃতিমনা নাগরিকদের জন্য ভর্তি উন্মুক্ত।",
      venue: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া।",
      date: "",
      organizer: "উপজেলা প্রশাসন, পুঠিয়া",
      contactPhone: "০১৭০৪-৫৬৭৮৯০",
      isStatic: true
    },
    ...dbEvents
      .filter(e => e.category === "cultural_academy")
      .map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        venue: e.venue,
        date: `${e.eventDate}${e.eventTime ? `, ${e.eventTime}` : ""}`,
        organizer: e.organizer,
        contactPhone: e.contactPhone,
        isStatic: false
      }))
  ];

  const mergedEvening = [
    {
      id: "static_evening",
      title: upcomingEvent.title,
      description: upcomingEvent.description,
      venue: upcomingEvent.venue,
      date: upcomingEvent.date,
      organizer: "পুঠিয়া উপজেলা শিল্পকলা একাডেমি",
      contactPhone: "০১৭০৪-৫৬৭৮৯০",
      isStatic: true
    },
    ...dbEvents
      .filter(e => e.category === "cultural_evening")
      .map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        venue: e.venue,
        date: `${e.eventDate}${e.eventTime ? `, ${e.eventTime}` : ""}`,
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
            <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">শিল্প, সাহিত্য ও সংস্কৃতি</p>
            <h1 className="text-4xl font-black mb-1 text-white">সাংস্কৃতিক কার্যক্রম ও ফোরাম</h1>
            <div className="w-10 h-1 bg-white rounded-full my-3"></div>
            <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
              পুঠিয়ার স্থানীয় সাংস্কৃতিক সংগঠন, নাট্যমঞ্চ এবং কবিতা ও গানের আসরের বিস্তারিত তথ্য।
            </p>
          </div>
        </div>
      )}

      <div className={`${!hideHeader ? 'px-4 ' : ''}space-y-4`}>
        {/* Post Button & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={() => setFilter("academy")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "academy"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Palette className={`w-4 h-4 ${filter === "academy" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              সাংস্কৃতিক একাডেমি
            </button>
            <button
              onClick={() => setFilter("evening")}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "evening"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Music className={`w-4 h-4 ${filter === "evening" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              সাংস্কৃতিক সন্ধ্যা
            </button>
          </div>

          <button
            onClick={() => {
              setCategoryType(filter);
              setShowAddModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> কার্যক্রম পোস্ট করুন
          </button>
        </div>

        <div className="space-y-4">
          {filter === "academy" && (
            <div className="space-y-4">
              {mergedAcademy.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in text-left"
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

                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-black text-gray-800 leading-tight pr-8">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    {item.description}
                  </p>
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 space-y-2 mt-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-[#7A1C28]" />
                      <span className="font-medium">স্থান: {item.venue}</span>
                    </div>
                    {item.date && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-[#7A1C28]" />
                        <span className="font-medium">সময়: {item.date}</span>
                      </div>
                    )}
                    {item.organizer && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 pt-0.5 border-t border-red-100/30">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>আয়োজক: {item.organizer}</span>
                      </div>
                    )}
                    {item.contactPhone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>যোগাযোগ: <a href={`tel:${item.contactPhone}`} className="text-emerald-700 hover:underline">{item.contactPhone}</a></span>
                      </div>
                    )}
                  </div>
                  
                  {item.isStatic && (
                    <button 
                      onClick={() => setShowForm(true)}
                      className="w-full mt-2 py-3 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" /> ভর্তি ও সদস্য ফরম
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {filter === "evening" && (
            <div className="space-y-4">
              {mergedEvening.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5 shadow-lg border border-red-50 flex flex-col gap-3 relative overflow-hidden animate-fade-in text-left"
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

                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-black text-gray-800 leading-tight pr-8">{item.title}</h3>
                    {item.isStatic && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 shrink-0">নতুন ইভেন্ট</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {item.description}
                  </p>

                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50 space-y-2 mt-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <span className="text-[#7A1C28] font-bold">⏱️ সময়:</span>
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <span className="text-[#7A1C28] font-bold">📍 ভেন্যু:</span>
                      <span>{item.venue}</span>
                    </div>
                    {item.organizer && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 pt-0.5 border-t border-red-100/30">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>আয়োজক: {item.organizer}</span>
                      </div>
                    )}
                    {item.contactPhone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>যোগাযোগ: <a href={`tel:${item.contactPhone}`} className="text-emerald-700 hover:underline">{item.contactPhone}</a></span>
                      </div>
                    )}
                  </div>

                  {item.isStatic && (
                    <div className="grid grid-cols-2 gap-2 w-full mt-2">
                      <button 
                        onClick={() => setShowMap(true)}
                        className="py-2.5 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-1.5 outline-none shadow-sm cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" /> ম্যাপ ডিরেকশন
                      </button>
                      <button 
                        onClick={() => setShowRoute(true)}
                        className="py-2.5 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none shadow-sm cursor-pointer"
                      >
                        📢 রুট গাইড
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black">নতুন সাংস্কৃতিক কার্যক্রম পোস্ট করুন</h3>
              <p className="text-xs text-red-200 mt-1">কমিউনিটির উদ্দেশ্যে গুরুত্বপূর্ণ সাংস্কৃতিক ফোরাম বা উৎসব প্রকাশ করুন</p>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">পোস্টের ধরণ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryType("academy")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      categoryType === "academy" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    🎨 একাডেমী কার্যক্রম
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType("evening")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      categoryType === "evening" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    🎶 সাংস্কৃতিক সন্ধ্যা
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">শিরোনাম *</label>
                <input 
                  type="text" 
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: বসন্ত উৎসব ও আবৃত্তি মেলা ২০২৬"
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
                    placeholder="যেমন: সন্ধ্যা ৬:০০ টা"
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
                  placeholder="যেমন: উপজেলা অডিটোরিয়াম, পুঠিয়া"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ *</label>
                <textarea 
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="সাংস্কৃতিক অনুষ্ঠানের বিস্তারিত বিষয়াদি, অতিথি বা কর্মসূচি..."
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
                    placeholder="যেমন: পুঠিয়া আবৃত্তি পরিষদ"
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

      {/* Membership Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-950 text-white">
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <PenTool className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">অনলাইন আবেদন</span>
              </div>
              <h3 className="text-base font-black pr-8">একাডেমি ভর্তি ও সদস্য ফরম</h3>
            </div>

            {formSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
                <h4 className="text-base font-bold text-gray-800">আবেদন সফলভাবে জমা হয়েছে!</h4>
                <p className="text-xs text-gray-500 font-medium">আমরা দ্রুত আপনার সাথে মোবাইল নম্বরে যোগাযোগ করব।</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">শিক্ষার্থীর নাম</label>
                  <input 
                    type="text" 
                    required
                    placeholder="যেমন: মো: আরিফ হোসাইন"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">মোবাইল নম্বর</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="যেমন: ০১৭১১-২২৩৩৪৪"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">বয়স</label>
                    <input 
                      type="number" 
                      required
                      placeholder="যেমন: ১২"
                      value={formData.age || ""}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">প্রশিক্ষণ বিভাগ</label>
                    <select
                      value={formData.branch || ""}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                    >
                      <option value="music">সংগীত (গান)</option>
                      <option value="dance">নৃত্য (নাচ)</option>
                      <option value="drawing">চিত্রাঙ্কন (আঁকা)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#7A1C28] text-emerald-600 text-xs font-black rounded-xl transition mt-2 shadow-md shadow-[#7A1C28]/10 cursor-pointer"
                >
                  আবেদন সম্পন্ন করুন
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">অবস্থান ম্যাপ</span>
              </div>
              <h3 className="text-sm font-black pr-8">উপজেলা অডিটোরিয়াম অবস্থান</h3>
            </div>
            <div className="p-5 space-y-4 text-center">
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center space-y-1">
                <MapPin className="w-8 h-8 text-[#7A1C28] mx-auto mb-1 animate-bounce" />
                <h4 className="text-xs font-black text-gray-800">উপজেলা পরিষদ চত্বর</h4>
                <p className="text-[10px] text-gray-500 font-bold">পুঠিয়া, রাজশাহী</p>
              </div>
              <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                📍 পুঠিয়া রাজবাড়ি মাঠের ঠিক পাশে উপজেলা পরিষদ কমপ্লেক্সের মূল অডিটোরিয়াম ভবনে অনুষ্ঠানটি অনুষ্ঠিত হবে।
              </p>
              <button
                onClick={() => setShowMap(false)}
                className="w-full py-2.5 bg-slate-950 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Modal */}
      {showRoute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="relative p-6 pb-4 bg-gradient-to-r from-amber-800 to-amber-950 text-white">
              <button 
                onClick={() => setShowRoute(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Bus className="w-5 h-5 text-yellow-300" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-300">রুট গাইড</span>
              </div>
              <h3 className="text-sm font-black pr-8">কিভাবে ভেন্যুতে পৌঁছাবেন?</h3>
            </div>
            <div className="p-5 space-y-3.5">
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                <h4 className="text-xs font-bold text-amber-900">🚌 স্থানীয় বাসস্ট্যান্ড থেকে:</h4>
                <p className="text-[11px] text-gray-600 leading-normal font-medium">
                  পুঠিয়া বাসস্ট্যান্ড মোড় থেকে ইজি-বাইক বা অটোরিকশায় চড়ে সরাসরি উপজেলা পরিষদ চত্বর (ভাড়া ১০ টাকা)।
                </p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1">
                <h4 className="text-xs font-bold text-amber-900">🏍️ নিজস্ব মোটরসাইকেল বা গাড়িতে:</h4>
                <p className="text-[11px] text-gray-600 leading-normal font-medium">
                  মহাসড়ক মোড় থেকে দক্ষিণ দিক ধরে সোজা পুঠিয়া রাজবাড়ী রোড অভিমুখে ১ কিলোমিটার গেলেই বামপাশে উপজেলা পরিষদ চত্বর।
                </p>
              </div>
              <button
                onClick={() => setShowRoute(false)}
                className="w-full py-2.5 bg-amber-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                ঠিক আছে, ধন্যবাদ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { ArrowLeft, Search, MapPin, Phone, Baby, School, Clock, User, Calendar, Award } from "lucide-react";

interface Kindergarten {
  id: string;
  name: string;
  location: string;
  phone: string;
  head: string;
  established: string;
  classes: string;
  shift: string;
  status: "ভর্তি চলছে" | "ভর্তি বন্ধ";
  features: string[];
}

const KINDERGARTEN_LIST: Kindergarten[] = [
  {
    id: "kg_1",
    name: "পুঠিয়া মডেল কিন্ডারগার্টেন",
    location: "পুঠিয়া সদর (উপজেলা সংলগ্ন), রাজশাহী",
    phone: "01712-987654",
    head: "মোছাঃ আসমা বেগম",
    established: "১৯৯৮",
    classes: "প্লে থেকে ৫ম শ্রেণী",
    shift: "মর্নিং ও ডে শিফট",
    status: "ভর্তি চলছে",
    features: ["অভিজ্ঞ শিক্ষক মন্ডলী", "মাল্টিমিডিয়া ক্লাস", "মনোরম খেলার মাঠ", "সাপ্তাহিক মূল্যায়ন পরীক্ষা"]
  },
  {
    id: "kg_2",
    name: "ফুলকুঁড়ি কিন্ডারগার্টেন ও জুনিয়র স্কুল",
    location: "পুঠিয়া বাজার, পুঠিয়া, রাজশাহী",
    phone: "01725-112233",
    head: "মোঃ আব্দুল বারী",
    established: "২০০৫",
    classes: "প্লে থেকে ৮ম শ্রেণী",
    shift: "ডে শিফট",
    status: "ভর্তি চলছে",
    features: ["কম্পিউটার ল্যাব", "ডিবেটিং ক্লাব", "বার্ষিক ক্রীড়া প্রতিযোগিতা", "সিসিটিভি নিরাপত্তা"]
  },
  {
    id: "kg_3",
    name: "সানরাইজ কেজি এন্ড একাডেমি",
    location: "শিবপুর বাজার, পুঠিয়া, রাজশাহী",
    phone: "01716-445566",
    head: "মোছাঃ শামীমা নাসরিন",
    established: "২০১২",
    classes: "প্লে থেকে ৫ম শ্রেণী",
    shift: "মর্নিং শিফট",
    status: "ভর্তি চলছে",
    features: ["প্লে-গ্রুপ স্পেশাল কেয়ার", "চিত্রাঙ্কন ক্লাস", "নৈতিক শিক্ষা প্রোগ্রাম"]
  },
  {
    id: "kg_4",
    name: "আল-হেরা ইসলামিক ক্যাডেট একাডেমি",
    location: "ঝলমলিয়া বাজার রোড, পুঠিয়া, রাজশাহী",
    phone: "01732-556677",
    head: "মাওলানা হাফেজ মোঃ ইব্রাহিম",
    established: "২০০৮",
    classes: "প্লে থেকে ৫ম শ্রেণী (আরবি শিক্ষাসহ)",
    shift: "মর্নিং ও ডে শিফট",
    status: "ভর্তি চলছে",
    features: ["হিফজুল কুরআন বিভাগ", "স্মার্ট ক্লাস রুম", "বিশুদ্ধ উচ্চারণ চর্চা"]
  },
  {
    id: "kg_5",
    name: "বেলপুকুর আইডিয়াল কিন্ডারগার্টেন",
    location: "বেলপুকুর রোড, পুঠিয়া, রাজশাহী",
    phone: "01718-990011",
    head: "মোঃ কামরুজ্জামান",
    established: "২০১৫",
    classes: "প্লে থেকে ৫ম শ্রেণী",
    shift: "মর্নিং শিফট",
    status: "ভর্তি বন্ধ",
    features: ["সহজ পাঠ্যপদ্ধতি", "বিনোদনমূলক শিক্ষা", "মাসিক অভিভাবক সভা"]
  }
];

export function KindergartenInfo({ onGoBack }: { onGoBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShift, setSelectedShift] = useState<"all" | "মর্নিং" | "ডে">("all");

  const filtered = KINDERGARTEN_LIST.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          k.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.head.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesShift = selectedShift === "all" || k.shift.includes(selectedShift);
    
    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white rounded-3xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 pointer-events-none" />

        <button 
          onClick={onGoBack} 
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer mb-6 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Baby className="w-8 h-8 text-white animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-100 font-bold bg-amber-500/30 px-2 py-0.5 rounded-md">প্রাথমিক শিক্ষা ও পরিচর্যা</span>
            <h1 className="text-2xl font-black mt-1">কিন্ডারগার্টেন তালিকা</h1>
          </div>
        </div>
      </div>
      
      <div className="px-4 space-y-4">
        {/* Search & Filter Buttons */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="কিন্ডারগার্টেনের নাম বা এলাকা দিয়ে খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-white shadow-xs focus:ring-2 focus:ring-amber-500 text-sm placeholder-gray-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-3 gap-2 px-1">
            {[
              { id: "all", label: "সব শিফট", emoji: "🏫" },
              { id: "মর্নিং", label: "মর্নিং শিফট", emoji: "🌅" },
              { id: "ডে", label: "ডে শিফট", emoji: "☀️" }
            ].map(tab => {
              const isActive = selectedShift === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedShift(tab.id as any)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                    isActive
                      ? "bg-amber-500 text-white border-amber-500 shadow-md"
                      : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                  <span className="font-extrabold text-[10px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Institution Cards */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map(k => (
              <div key={k.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-xs flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Floating Status and Shift Badges */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                    {k.shift}
                  </span>
                  
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                    k.status === "ভর্তি চলছে" 
                      ? "bg-green-500 text-white animate-pulse" 
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    ● {k.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-800 leading-snug flex items-start gap-2">
                    <School className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    {k.name}
                  </h3>
                  
                  <div className="mt-3 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{k.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>অধ্যক্ষ/পরিচালক: <span className="font-semibold text-gray-700">{k.head}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>শ্রেণী: <span className="font-semibold text-gray-700">{k.classes}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>স্থাপিত: <span className="font-semibold text-gray-700">{k.established} খ্রি.</span></span>
                    </div>
                  </div>
                </div>

                {/* Features Badges */}
                <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50">
                  <span className="text-[10px] uppercase font-bold text-amber-600/70 block mb-1.5 flex items-center gap-1">
                    <Award className="w-3 h-3" /> বিদ্যালয়ের সুযোগ-সুবিধা
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {k.features.map((feat, idx) => (
                      <span key={idx} className="bg-white text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-amber-100">
                        ✨ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call Action Button */}
                <a 
                  href={`tel:${k.phone}`}
                  className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-bold text-xs transition border border-amber-100 mt-1"
                >
                  <Phone className="w-3.5 h-3.5 animate-wiggle" /> যোগাযোগ করুন: {k.phone}
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm font-semibold text-gray-500">কোন কিন্ডারগার্টেন পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে ভিন্ন কোনো নাম বা এলাকা লিখে খুঁজুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Info, BookOpen, Map, Users, Clock, Compass, 
  MapPin, Sparkles, TrendingUp, Building2, GraduationCap, 
  Milestone, Calendar, ArrowRight, ChevronRight, Eye, ShieldAlert,
  Heart, Bus, Train, Phone, MapPinOff
} from "lucide-react";
import { upazilaIntroData } from "../data/upazilaIntroData";

interface UpazilaIntroGridProps {
  onGoBack: () => void;
}

export function UpazilaIntroGrid({ onGoBack }: UpazilaIntroGridProps) {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialKey = tabParam && tabParam in upazilaIntroData ? (tabParam as keyof typeof upazilaIntroData) : "about";
  const [activeKey, setActiveKey] = useState<keyof typeof upazilaIntroData>(initialKey);
  const data = upazilaIntroData[activeKey];

  const items = [
    { id: "about", label: "পুঠিয়া সম্পর্কে", icon: "🏛️", bg: "from-rose-500 to-pink-600", border: "border-rose-100", text: "text-rose-600" },
    { id: "history", label: "ঐতিহাসিক পটভূমি", icon: "📜", bg: "from-amber-600 to-orange-700", border: "border-amber-100", text: "text-amber-700" },
    { id: "geo", label: "ভৌগোলিক অবস্থান", icon: "🗺️", bg: "from-blue-500 to-indigo-600", border: "border-blue-100", text: "text-blue-600" },
    { id: "population", label: "জনসংখ্যা ও পরিসংখ্যান", icon: "👥", bg: "from-purple-500 to-fuchsia-600", border: "border-purple-100", text: "text-purple-600" },
  ];

  // Selected places to visit in Puthia (Interactive details)
  const [selectedPlaceIdx, setSelectedPlaceIdx] = useState<number>(0);
  const placesToVisit = [
    {
      name: "পাঁচ আনি রাজবাড়ী (মহারানী হেমন্তকুমারী প্যালেস)",
      desc: "গ্রীক-রোমান ইন্দো-সারাসেনিক স্থাপত্যের এক মহিমান্বিত কীর্তি। ১৮৯৫ সালে তৈরি রাজকীয় স্তম্ভে ঘেরা এই প্রধান প্রাসাদটি পুঠিয়া রাজবংশের আভিজাত্যের প্রতীক।",
      time: "সকাল ৯:০০ - বিকেল ৫:০০",
      ticket: "২০ টাকা (প্রবেশ ফি)",
      rating: "৪.৮/৫ (ঐতিহাসিক)",
      tag: "স্থাপত্য কীর্তি",
      imgPlaceholder: "🏛️"
    },
    {
      name: "ভুবনমোহিনী বড় শিব মন্দির",
      desc: "১৮২৩ সালে রানী ভুবনময়ী দেবী দ্বারা নির্মিত বাংলাদেশের অন্যতম বৃহৎ ও দৃষ্টিনন্দন শিব মন্দির। এর সুউচ্চ শিবলিঙ্গ ও রাজকীয় শিবসাগর দিঘির ঘাট পুঠিয়ার শোভা বর্ধন করেছে।",
      time: "২৪ ঘণ্টা উন্মুক্ত",
      ticket: "বিনামূল্যে প্রবেশ",
      rating: "৪.৯/৫ (আধ্যাত্মিক)",
      tag: "বৃহত্তম মন্দির",
      imgPlaceholder: "🛕"
    },
    {
      name: "টেরাকোটা পঞ্চরত্ন গোবিন্দ মন্দির",
      desc: "উনিশ শতকে রানী প্রেমকুমারী দেবীর উদ্যোগে তৈরি এই মন্দিরটি পুঠিয়ার পোড়ামাটির সূক্ষ্ম ফলকচিত্রের সেরা নিদর্শন। এর দেওয়ালে রামায়ণ ও মহাভারতের চিত্রাবলী চমৎকারভাবে খোদাই করা।",
      time: "সকাল ৯:০০ - বিকেল ৫:০০",
      ticket: "রাজবাড়ী টিকিটে অন্তর্ভুক্ত",
      rating: "৪.৭/৫ (টেরাকোটা শিল্প)",
      tag: "সূক্ষ্ম কারুকাজ",
      imgPlaceholder: "🧱"
    },
    {
      name: "তারাপুর হাওয়াখানা (জলটুঙ্গি)",
      desc: "তারাপুর বিলে অবস্থিত রাজাদের গ্রীষ্মকালীন জলটুঙ্গি ঘর। দিঘির পানির ঠিক মাঝখানে নির্মিত এই দ্বিতল ভবনটিতে রাজারা মনোরম প্রাকৃতিক বাতাস উপভোগ করতেন।",
      time: "বিকেলের ভ্রমণ উপযোগী",
      ticket: "ফ্রি (বাইরে থেকে দর্শনীয়)",
      rating: "৪.৬/৫ (প্রাকৃতিক)",
      tag: "জলটুঙ্গি",
      imgPlaceholder: "🌅"
    }
  ];

  return (
    <div className="p-4 space-y-6 bg-[#FAF9F6] min-h-screen font-sans pb-24">
      
      {/* 1. Interactive Header Banner with Theme Synced Background */}
      <div 
        style={{ background: data.gradient }} 
        className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div className="absolute right-0 bottom-0 w-36 h-36 text-white/5 -mb-6 -mr-6 pointer-events-none">
          {activeKey === "about" && <Building2 className="w-full h-full" />}
          {activeKey === "history" && <Calendar className="w-full h-full" />}
          {activeKey === "geo" && <Compass className="w-full h-full" />}
          {activeKey === "population" && <Users className="w-full h-full" />}
        </div>

        <div className="relative z-10">
          <span className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3 border border-white/20">
             {data.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight leading-tight">
            {data.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-100/90 max-w-2xl leading-relaxed text-justify">
            {data.subtitle}
          </p>
          
          <div className="mt-5">
            <button 
              onClick={onGoBack}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
              <span>ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 2. Selection Categories Grid */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
        {items.map((item) => {
          const isActive = activeKey === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setActiveKey(item.id as keyof typeof upazilaIntroData)}
              style={{ 
                flex: 1, 
                minWidth: 0, 
                background: isActive ? "#eff6ff" : "#ffffff", 
                color: isActive ? "#1e3a8a" : "#1e293b", 
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                padding: "10px 2px", 
                borderRadius: "16px", 
                textAlign: "center", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                <span className={`text-sm sm:text-base ${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
              </div>
              <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Sub Items Grid */}
      <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> প্রধান গুরুত্বপূর্ণ উপাত্ত
        </h4>
        <div id="below-cards-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.subItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#FAF9F6] p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors flex flex-col items-center text-center shadow-2xs"
                >
                    <span className="text-2xl mb-1.5">{item.icon}</span>
                    <h5 className="text-[12px] font-black text-neutral-800 mb-0.5">{item.label}</h5>
                    <p className="text-[10.5px] text-neutral-500 font-medium leading-tight">{item.detail}</p>
                </div>
            ))}
        </div>
      </div>

      {/* 4. Interactive Insight Expansion (Detailed tabs) */}
      <div className="bg-white rounded-2xl border border-neutral-150 p-6 shadow-xs space-y-6">
        
        {/* TAB A: ABOUT DETAILED EXPLORER */}
        {activeKey === "about" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                দর্শনীয় স্থান ও ভ্রমণ নির্দেশিকা
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">পুঠিয়ার ঐতিহ্যবাহী স্থাপত্য ও দর্শনীয় স্থানগুলোর সংক্ষিপ্ত রূপরেখা।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Places List (Left Column) */}
              <div className="md:col-span-5 space-y-2">
                {placesToVisit.map((place, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPlaceIdx(idx)}
                    className={`w-full p-3.5 rounded-xl text-left font-bold text-xs flex items-center justify-between transition-all duration-200 cursor-pointer border ${
                      selectedPlaceIdx === idx 
                        ? "bg-rose-50/70 text-rose-700 border-rose-200 shadow-2xs" 
                        : "bg-white text-neutral-600 hover:bg-neutral-50/50 border-neutral-150"
                    }`}
                  >
                    <span className="truncate pr-2">{place.name}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedPlaceIdx === idx ? 'text-rose-600 translate-x-0.5' : 'text-neutral-300'}`} />
                  </button>
                ))}
              </div>

              {/* Place Detail Card (Right Column) */}
              <div className="md:col-span-7 bg-neutral-50 border border-neutral-150 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-xl bg-white text-rose-600 border border-neutral-150 flex items-center justify-center text-xl shadow-2xs">
                      {placesToVisit[selectedPlaceIdx].imgPlaceholder}
                    </span>
                    <div>
                      <span className="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                        {placesToVisit[selectedPlaceIdx].tag}
                      </span>
                      <h4 className="font-extrabold text-neutral-800 text-[13px] mt-1">
                        {placesToVisit[selectedPlaceIdx].name}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                    {placesToVisit[selectedPlaceIdx].desc}
                  </p>
                </div>

                {/* Meta details */}
                <div className="border-t border-neutral-200/70 pt-3.5 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 font-bold">
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase">⏱️ সময়সূচী</span>
                    <span className="text-neutral-700 block mt-0.5">{placesToVisit[selectedPlaceIdx].time}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase">🎫 টিকেট ফি</span>
                    <span className="text-neutral-700 block mt-0.5">{placesToVisit[selectedPlaceIdx].ticket}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-neutral-400 font-bold uppercase">⭐ ট্যুরিস্ট রেটিং</span>
                    <span className="text-rose-600 block mt-0.5">{placesToVisit[selectedPlaceIdx].rating}</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex items-start gap-3">
              <span className="text-base text-rose-600 shrink-0">💡</span>
              <p className="text-[11px] text-rose-900 leading-normal text-justify">
                <strong>ভ্রমণ টিপস:</strong> পুঠিয়া রাজবাড়ী ও মন্দির চত্বরটি খুবই সুবিন্যস্ত এবং কাছাকাছি দূরত্বে অবস্থিত। আপনি পায়ে হেঁটেই সবকটি মন্দির ঘুরে দেখতে পারবেন। পুরো এলাকার টেরাকোটার চমৎকার ছবি তোলার জন্য সকালের বা পড়ন্ত বিকেলের নরম আলো সবচেয়ে উপযোগী।
              </p>
            </div>

          </div>
        )}

        {/* TAB B: HISTORY TIMELINE */}
        {activeKey === "history" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                পুঠিয়া রাজবংশের গৌরবময় ইতিহাস
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">মুঘল রাজন্য শাসন থেকে শুরু করে আধুনিক প্রত্নতাত্ত্বিক স্মৃতিময় বিবর্তন ধারা।</p>
            </div>

            {/* Timeline element */}
            <div className="relative pl-6 border-l-2 border-amber-100 space-y-6 ml-2">
              
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-xs" />
                <span className="text-[10px] text-amber-700 font-black tracking-wider bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">১৬শ শতাব্দী (মুঘল আমল)</span>
                <h4 className="font-extrabold text-neutral-800 text-xs mt-1">রাজা পীতাম্বর কর্তৃক রাজবংশের সূচনা</h4>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal text-justify">
                  লস্করপুর পরগনার জমিদার রাজা পীতাম্বর মুঘল সম্রাট আকবরের সুদৃষ্টি লাভ করে পুঠিয়া রাজবংশের প্রতিষ্ঠা করেন। তাঁর সময়ে পুঠিয়াকে রাজধানী বানিয়ে শাসনকাজ শুরু হয়।
                </p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-xs" />
                <span className="text-[10px] text-amber-700 font-black tracking-wider bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">১৭শ-১৮শ শতাব্দী</span>
                <h4 className="font-extrabold text-neutral-800 text-xs mt-1">মন্দির নির্মাণ ও স্থাপত্য বিকাশ</h4>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal text-justify">
                  রাজা অনুপনারায়ণ ও রাজা আনন্দ নারায়ণের আমলে পুঠিয়ার জগন্নাথ মন্দির ও প্রাচীন দোলমঞ্চ সহ একের পর এক অসাধারণ সব ধর্মীয় উপাসনালয় ও রাজকীয় ভবন নির্মিত হতে থাকে।
                </p>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-xs" />
                <span className="text-[10px] text-amber-700 font-black tracking-wider bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">১৯শ শতাব্দী (মহারানীদের সোনালী যুগ)</span>
                <h4 className="font-extrabold text-neutral-800 text-xs mt-1">রানী শরৎসুন্দরী ও মহারানী হেমন্তকুমারীর দানশীল রাজত্ব</h4>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal text-justify">
                  মহারানী শরৎসুন্দরী দেবীর শিক্ষা ও সুপেয় পানির জন্য পুণ্যময় কৃপা এবং তাঁর পুত্রবধূ হেমন্তকুমারী দেবীর আমলে ১৮৯৫ সালে বর্তমান সুরম্য পাঁচ আনি রাজপ্রাসাদটি নির্মাণ সম্পন্ন হয়। তাদের গৌরবময় সামাজিক কার্যাবলীর জন্য পুঠিয়া এক উচ্চাসনে আরোহণ করে।
                </p>
              </div>

              {/* Event 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-xs" />
                <span className="text-[10px] text-amber-700 font-black tracking-wider bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">২০শ শতাব্দী - বর্তমান</span>
                <h4 className="font-extrabold text-neutral-800 text-xs mt-1">জাতীয় প্রত্নতাত্ত্বিক ঐতিহ্য ঘোষণা</h4>
                <p className="text-[11px] text-neutral-500 mt-1 leading-normal text-justify">
                  জমিদারী উচ্ছেদের পর মন্দির পরিত্যক্ত হয়ে যায়। বর্তমানে বাংলাদেশ সরকারের প্রত্নতত্ত্ব অধিদপ্তর পুঠিয়ার রাজবাড়ী ও মন্দির চত্বরের সংস্কার ও রক্ষণা-বেক্ষণের দায়িত্ব নিয়ে একে আন্তর্জাতিক পর্যটন কেন্দ্র হিসেবে প্রতিষ্ঠিত করেছে।
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB C: GEOGRAPHY & BOUNDARIES */}
        {activeKey === "geo" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                চতুর্দশ সীমানা ও যোগাযোগ ব্যবস্থা
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">চারদিকের সীমানা এবং বিভিন্ন রুটে যাতায়াত করার সংক্ষিপ্ত নকশা।</p>
            </div>

            {/* Geographical borders visualizer compass */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Compass Layout */}
              <div className="flex flex-col items-center justify-center bg-[#FAF9F6] border border-neutral-100 p-6 rounded-2xl">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-4">ভৌগোলিক সীমানা কাঠামো</span>
                
                <div className="relative w-48 h-48 rounded-full border border-neutral-200/80 bg-white flex items-center justify-center shadow-inner">
                  
                  {/* Center Hub */}
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center text-[10px] font-black shadow-md z-10">
                    <span>পুঠিয়া</span>
                  </div>

                  {/* North Indicator */}
                  <div className="absolute top-2 text-center text-[10px] font-black text-neutral-700">
                    <span className="block text-blue-600 font-extrabold">উত্তরে</span>
                    <span>দুর্গাপুর ও বাগমারা</span>
                  </div>

                  {/* South Indicator */}
                  <div className="absolute bottom-2 text-center text-[10px] font-black text-neutral-700">
                    <span className="block text-blue-600 font-extrabold">দক্ষিণে</span>
                    <span>চারঘাট ও বাঘা</span>
                  </div>

                  {/* East Indicator */}
                  <div className="absolute right-2 text-center text-[10px] font-black text-neutral-700">
                    <span className="block text-blue-600 font-extrabold">পূর্বে</span>
                    <span>নাটোর জেলা</span>
                  </div>

                  {/* West Indicator */}
                  <div className="absolute left-2 text-center text-[10px] font-black text-neutral-700">
                    <span className="block text-blue-600 font-extrabold">পশ্চিমে</span>
                    <span>পবা ও রাজশাহী</span>
                  </div>

                </div>
              </div>

              {/* Transportation detail cards */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-neutral-800 text-xs flex items-center gap-1.5 pb-1 border-b border-neutral-100">
                    <Bus className="w-4 h-4 text-blue-600" /> মহাসড়ক যোগাযোগ নেটওয়ার্ক
                  </h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed text-justify">
                    পুঠিয়ার বুক চিরে সোজাসুজি অতিক্রম করেছে ঐতিহাসিক <strong>ঢাকা-রাজশাহী মহাসড়ক (N6)</strong>। এটি পুঠিয়াকে সড়কপথে রাজশাহী জেলা শহর ও রাজধানী ঢাকার সাথে সরাসরি যুক্ত করেছে।
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-neutral-800 text-xs flex items-center gap-1.5 pb-1 border-b border-neutral-100">
                    <Train className="w-4 h-4 text-blue-600" /> রেলওয়ে যোগাযোগ
                  </h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed text-justify">
                    পুঠিয়ার অন্তর্গত ২নং বেলপুকুর ইউনিয়নের ভেতর দিয়ে রাজশাহী-নাটোর রেল সেকশন অতিক্রম করেছে এবং সেখানে <strong>বেলপুকুর রেলওয়ে স্টেশন</strong> অবস্থিত যা অন্যতম গুরুত্বপূর্ণ একটি যোগাযোগের সংযোগ।
                  </p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl text-[11px] text-blue-800 font-bold leading-normal">
                  📌 <strong>দূরত্ব:</strong> পুঠিয়া উপজেলা পরিষদ ভবন থেকে নাটোর জেলা সদরের দূরত্ব মাত্র ১৭ কিমি এবং রাজশাহী বিভাগীয় সদরের দূরত্ব প্রায় ৩০ কিমি।
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB D: DEMOGRAPHICS & POPULATION STATS */}
        {activeKey === "population" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                প্রশাসনিক ও জনসংখ্যা বিষয়ক উপাত্ত
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">সর্বশেষ শুমারি ভিত্তিক নির্ভরযোগ্য গ্রামীণ ও নাগরিক পরিসংখ্যান সূচক।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stats meter progress bars (Left) */}
              <div className="space-y-4">
                <h4 className="font-bold text-neutral-700 text-xs uppercase tracking-wider">গুরুত্বপূর্ণ উন্নয়ন সূচক</h4>
                
                {/* Literacy Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <span>গড় শিক্ষার হার (স্বাক্ষরতা)</span>
                    <span className="text-purple-600">৫৫.৫%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-[55.5%] rounded-full"></div>
                  </div>
                </div>

                {/* Male/Female ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <span>লিঙ্গ অনুপাত (পুরুষ বনাম নারী)</span>
                    <span>৫১.২% / ৪৮.৮%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-purple-600 h-full w-[51.2%]"></div>
                    <div className="bg-fuchsia-400 h-full w-[48.8%]"></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-400 font-bold uppercase mt-1">
                    <span>👨 পুরুষ: ৫১.২%</span>
                    <span>👩 নারী: ৪৮.৮%</span>
                  </div>
                </div>

                {/* Livelihood breakdown */}
                <div className="space-y-1 pt-2">
                  <span className="block text-xs font-bold text-neutral-700 mb-2">প্রধান জীবিকার উৎস এবং অর্থনৈতিক চালিকাশক্তি</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-600 font-semibold">
                    <div className="bg-[#FAF9F6] border border-neutral-100 p-2 rounded-lg text-center">
                      <span className="block text-base">🌾</span>
                      <span className="font-bold text-neutral-800">কৃষি ও চাষ</span>
                      <span className="text-[9.5px] text-neutral-400">প্রায় ৬৫%</span>
                    </div>
                    <div className="bg-[#FAF9F6] border border-neutral-100 p-2 rounded-lg text-center">
                      <span className="block text-base">🥭</span>
                      <span className="font-bold text-neutral-800">আম ও ফল</span>
                      <span className="text-[9.5px] text-neutral-400">প্রায় ২০%</span>
                    </div>
                    <div className="bg-[#FAF9F6] border border-neutral-100 p-2 rounded-lg text-center">
                      <span className="block text-base">💼</span>
                      <span className="font-bold text-neutral-800">চাকুরি/ব্যবসা</span>
                      <span className="text-[9.5px] text-neutral-400">প্রায় ১৫%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Administrative units list (Right) */}
              <div className="bg-[#FAF9F6] border border-neutral-150 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-neutral-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                    🏠 পুঠিয়া প্রশাসনিক কাঠামো
                  </h4>
                  
                  <div className="space-y-3.5 text-xs text-neutral-600">
                    <div className="flex items-center justify-between font-bold border-b border-neutral-100/50 pb-1.5">
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-600" /> ইউনিয়ন সংখ্যা</span>
                      <span className="text-neutral-850 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full">৬টি</span>
                    </div>
                    <div className="flex items-center justify-between font-bold border-b border-neutral-100/50 pb-1.5">
                      <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-600" /> পৌরসভা</span>
                      <span className="text-neutral-850 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full">১টি (পুঠিয়া সদর)</span>
                    </div>
                    <div className="flex items-center justify-between font-bold border-b border-neutral-100/50 pb-1.5">
                      <span className="flex items-center gap-1.5"><Milestone className="w-4 h-4 text-purple-600" /> মৌজা সংখ্যা</span>
                      <span className="text-neutral-850 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full">২৩টি</span>
                    </div>
                    <div className="flex items-center justify-between font-bold pb-1">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-purple-600" /> গ্রাম ও পাড়া-মহল্লা</span>
                      <span className="text-neutral-850 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full">১২৮টি</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/50 border border-purple-100/70 p-3.5 rounded-xl text-[10.5px] text-purple-900 leading-relaxed text-justify mt-4">
                  💡 <strong>প্রশাসনিক কেন্দ্র:</strong> পুঠিয়া উপজেলার সকল মূল প্রশাসনিক কাজ পুঠিয়া সদরে অবস্থিত উপজেলা পরিষদ কমপ্লেক্স ও মিনি সচিবালয় থেকে পরিচালিত হয়ে থাকে।
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}

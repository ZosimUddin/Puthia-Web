import React, { useState } from "react";
import { ArrowLeft, Calendar, Map, Train, AlertTriangle, Compass, Clock, CreditCard, Users, Plus, Minus, CheckCircle, HelpCircle } from "lucide-react";

interface ItineraryStep {
  time: string;
  title: string;
  details: string;
  icon: string;
}

const ITINERARIES: Record<string, ItineraryStep[]> = {
  "half": [
    { time: "সকাল ০৯:০০ - ১০:০০", title: "পুঠিয়া ত্রিমোহনী বাসস্ট্যান্ড আগমন ও নাস্তা", details: "বাসস্ট্যান্ডে নেমে স্থানীয় আদি মিষ্টি ভাণ্ডারে ঐতিহ্যবাহী দই ও গরম গরম লুচি-সবজি দিয়ে চমৎকার নাস্তা সারুন।", icon: "☕" },
    { time: "সকাল ১০:১৫ - ১১:৪৫", title: "বড় শিব মন্দির ও রাজপ্রাসাদ চত্বর", details: "প্রথমে বিশাল দিঘির পাড়ে দাঁড়িয়ে শিব মন্দির ঘুরে দেখুন। এরপর টিকিট কেটে মূল পাঁচআনি রাজপ্রাসাদের ভেতর ও রানীমহল ঘুরে দেখুন।", icon: "🏛️" },
    { time: "দুপুর ১২:০০ - ০১:০০", title: "গোবিন্দ মন্দির ও দোলমঞ্চ", details: "প্রাসাদের পশ্চিম চত্বরে থাকা পোড়ামাটির অলৌকিক কারুকাজসমৃদ্ধ গোবিন্দ মন্দির এবং খেলার মাঠের মধ্যিখানে অবস্থিত দোলমঞ্চ পরিদর্শন করুন।", icon: "🧱" },
    { time: "দুপুর ০১:১৫ - ০২:০০", title: "দুপুরের খাবার ও বিখ্যাত কাঁচাগোল্লা", details: "রাজবাড়ী বাজারের যেকোনো দেশি রেস্টুরেন্টে ঐতিহ্যবাহী দেশি শোল বা রুই মাছের ঝোল দিয়ে ভাত খেয়ে নিন। এরপর আদি মিষ্টির দোকান থেকে কাঁচাগোল্লার স্বাদ গ্রহণ করুন।", icon: "🍽️" }
  ],
  "full": [
    { time: "সকাল ০৯:০০ - ১০:৩০", title: "শিব মন্দির, দিঘি ও দোলমঞ্চ", details: "সকালে শিব সরোবর দিঘির শান্ত স্নিগ্ধ পরিবেশে বড় শিব মন্দির, দোলমঞ্চ এবং জগন্নাথ রথ মন্দির ঘুরে দেখুন।", icon: "🛕" },
    { time: "সকাল ১০:৪৫ - ১২:৩০", title: "পুঠিয়া পাঁচআনি রাজবাড়ী ভবন", details: "সিংহদুয়ার দিয়ে প্রবেশ করে ঐতিহাসিক গ্রিক-রোমান স্থাপত্যের দোতলা ভবন, নাচঘর, কোষাগার ও পেছনের রানীমহল ঘুরে ছবি তুলুন।", icon: "🏛️" },
    { time: "দুপুর ১২:৪৫ - ০২:০০", title: "টেরাকোটা গোবিন্দ মন্দির ও মধ্যাহ্নভোজ", details: "মহাভারত-রামায়ণের পোড়ামাটির ফলকচিত্র খচিত গোবিন্দ মন্দির ঘুরে বাজারে দুপুরের খাবার গ্রহণ ও মিষ্টির স্বাদ নেওয়া।", icon: "🍽️" },
    { time: "দুপুর ০২:১৫ - ০৩:৩০", title: "বড় ও ছোট আহ্নিক মন্দির এবং চারআনি রাজবাড়ী", details: "কাছেই অবস্থিত বিরল দোচালা ঘরানার ছোট-বড় আহ্নিক মন্দির এবং চারআনি রাজবাড়ী ধ্বংসাবশেষের সীমানা প্রাচীন ঘুরে দেখুন।", icon: "🧱" },
    { time: "বিকেল ০৩:৪৫ - ০৫:১৫", title: "তারাপুর হাওয়াখানা (জলটুঙ্গি সফর)", details: "অটোরিকশা রিজার্ভ করে তারাপুর গ্রামে দিঘির পানির মাঝখানে নির্মিত রাজাদের চমৎকার হাওয়াখানা ও সূর্যাস্ত দর্শন।", icon: "🌅" },
    { time: "সন্ধ্যা ০৫:৩০+", title: "বানেশ্বর বাজারের বিখ্যাত চমচম ও বিদায়", details: "নিকটবর্তী এশিয়ার অন্যতম বৃহৎ হাট বানেশ্বর বাজার ঘুরে বিখ্যাত ক্ষীর চমচম খেয়ে রাজশাহীর বাসে সরাসরি ঢাকার উদ্দেশ্যে রওনা।", icon: "🚌" },
  ],
  "two": [
    { time: "দিন ১: সকাল ও দুপুর", title: "পুঠিয়া আগমন ও রাজবাড়ী স্কয়ার", details: "পুঠিয়া পৌঁছে হোটেল বা ডাকবাংলোতে চেক-ইন। দুপুরে রাজবাড়ীর মূল চত্বর, বড় শিব মন্দির, শ্যামসাগর দিঘি ঘুরে দেখা ও দুপুরের খাবার সারুন।", icon: "🎒" },
    { time: "দিন ১: বিকেল ও সন্ধ্যা", title: "টেরাকোটা মন্দির ও রাজ চত্বরের গোধূলি", details: "পঞ্চরত্ন গোবিন্দ মন্দির, গোপাল মন্দির, ছোট আহ্নিক মন্দির এবং দোলমঞ্চের সামনে গোধূলি আলোয় আড্ডা। রাতে পুঠিয়া বাজারে স্থানীয় খাবার উপভোগ।", icon: "🌟" },
    { time: "দিন ২: সকাল", title: "শিলমাড়িয়া গ্রাম্য কুটির ও বানেশ্বর আমের বাগান", details: "পরদিন সকালে বানেশ্বরের বিশাল আমের বাগান (আমের মৌসুমে) অথবা শিলমাড়িয়া ইউনিয়নের চমৎকার গ্রামীণ মেঠো পথ ও ধানক্ষেতের সৌন্দর্য উপভোগ।", icon: "🌳" },
    { time: "দিন ২: বিকেল ও বিদায়", title: "তারাপুর হাওয়াখানা, নীলকুঠি ও শপিং", details: "দুপুরের পর তারাপুর গ্রামে চমৎকার পানির মাঝের হাওয়াখানা এবং নীলকুঠি কুঠি ধ্বংসাবশেষ ঘুরে দেখা। বানেশ্বর বাজার থেকে স্থানীয় ঐতিহ্যবাহী মিষ্টি ও মাটির তৈরি সামগ্রী কিনে বিদায় গ্রহণ।", icon: "🛍️" }
  ]
};

interface BudgetConfig {
  label: string;
  multiplier: number;
  description: string;
}

const BUDGET_CATEGORIES: Record<string, BudgetConfig> = {
  "budget": { label: "বাজেট / ব্যাকপ্যাকার (লোকাল বাস ও সাধারণ খাওয়া)", multiplier: 1200, description: "কম খরচে লোকাল বাস, ইজিবাইক শেয়ারিং এবং সাধারণ ঐতিহ্যবাহী ভাতের হোটেলে খাওয়া।" },
  "mid": { label: "ফ্যামিলি / মিডিয়াম (মানসম্মত বাস ও ভালো খাবার)", multiplier: 2500, description: "আরামদায়ক এসি/নন-এসি বাস, রিজার্ভ ইজিবাইক, এবং পুঠিয়ার সেরা মিষ্টি ও উন্নত রেস্টুরেন্টে খাওয়া।" },
  "luxury": { label: "লাক্সারি / প্রিমিয়াম (প্রাইভেট কার ও বিলাসবহুল খাওয়া)", multiplier: 5000, description: "রাজশাহী থেকে রেন্ট-এ-কার নিয়ে পুঠিয়া সফর, স্পেশাল গাইড ফি, এবং রাজশাহীর ৪-স্টার রেস্টুরেন্টে রাজকীয় ভূরিভোজ।" }
};

interface TravelGuideInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function TravelGuideInfo({ onGoBack, hideHeader = false }: TravelGuideInfoProps) {
  const [activeItinerary, setActiveItinerary] = useState<string>("full");
  const [activeBudgetCat, setActiveBudgetCat] = useState<string>("mid");
  const [touristCount, setTouristCount] = useState<number>(2);

  const steps = ITINERARIES[activeItinerary] || ITINERARIES["full"];
  const currentBudget = BUDGET_CATEGORIES[activeBudgetCat] || BUDGET_CATEGORIES["mid"];

  const handleIncrement = () => {
    if (touristCount < 10) setTouristCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (touristCount > 1) setTouristCount(prev => prev - 1);
  };

  // Cost break down calculations
  const totalCost = currentBudget.multiplier * touristCount;
  const transportCost = Math.round(totalCost * 0.45);
  const foodCost = Math.round(totalCost * 0.35);
  const ticketAndLocalCost = Math.round(totalCost * 0.20);

  return (
    <div className="space-y-6 pb-8 font-sans" id="travel-guide-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #0284C7, #1E3A8A)" }}
        >
          <div className="space-y-3 max-w-2xl text-left">
            <span className="bg-white/20 backdrop-blur-md text-sky-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              স্মার্ট ট্রাভেল প্ল্যানার
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-white">
              ভ্রমণ গাইড ও ক্যালকুলেটর
            </h1>
            <p className="text-white/95 text-sm md:text-base leading-relaxed text-justify">
              আপনার পুঠিয়া ভ্রমণকে নিখুঁত, পরিকল্পিত ও সহজ করতে আমাদের বিশেষ ট্যুর প্ল্যানার এবং নির্ভরযোগ্য বাজেট ক্যালকুলেটর। ঢাকা বা অন্যান্য শহর থেকে যাতায়াতের নিখুঁত উপায় ও ভ্রমণ নির্দেশনা।
            </p>
            
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={onGoBack}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border border-white/25 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </button>
              <div className="bg-white/15 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-sky-200">
                🎒 দিনব্যাপী রাজকীয় ভ্রমণ পরিকল্পনা
              </div>
            </div>
          </div>

          {/* Dynamic floating badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[150px] shrink-0 self-stretch flex flex-col justify-center">
            <p className="text-xs text-sky-200 uppercase font-semibold">ভ্রমণের সেরা সময়</p>
            <p className="text-2xl font-serif font-black text-yellow-300">অক্টোবর - মার্চ</p>
            <p className="text-[10px] text-white/80 mt-1">শীতকাল ও আমের মৌসুম</p>
          </div>
        </div>
      )}

      {/* 2. Interactive Tour Planner (Day Selector & Timeline) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 justify-between flex-wrap gap-y-3">
          <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="text-sky-600 w-5 h-5" /> সময়ভিত্তিক ভ্রমণ পরিকল্পনা (Itinerary)
          </h3>
          
          <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", overflowX: "auto" }}>
            {[
              { id: "half", label: "⏱️ হাফ-ডে সফর" },
              { id: "full", label: "🎒 সম্পূর্ণ ১ দিন" },
              { id: "two", label: "🌟 রাজকীয় ২ দিন" }
            ].map((tab) => {
              const isActive = activeItinerary === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveItinerary(tab.id)}
                  style={{
                    flex: 1,
                    minWidth: "100px",
                    background: isActive ? "#eff6ff" : "#ffffff",
                    color: isActive ? "#1e3a8a" : "#1e293b",
                    border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                    padding: "8px 2px",
                    borderRadius: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  className="hover:border-blue-400 hover:shadow-sm flex items-center justify-center group"
                >
                  <div style={{ fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {tab.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Render Vertical Timeline */}
        <div className="space-y-6 relative pl-4 sm:pl-6">
          <div className="absolute left-[13px] sm:left-[17px] top-4 bottom-4 w-0.5 bg-sky-200"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              
              {/* Point Indicator */}
              <div className="absolute left-[-16px] sm:left-[-22px] w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-100 border-2 border-sky-600 flex items-center justify-center text-xs z-10 text-sky-800">
                {step.icon || "📍"}
              </div>

              {/* Time Label */}
              <div className="sm:w-[150px] text-sky-700 font-extrabold text-xs sm:text-sm shrink-0 pt-0.5">
                {step.time}
              </div>

              {/* Detail Card */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex-1 hover:bg-slate-50 transition-colors duration-200">
                <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
                  {step.title}
                </h4>
                <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed text-justify font-medium">
                  {step.details}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 3. Interactive Tour Budget Calculator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Parameters Configuration */}
        <div className="space-y-5 text-left">
          <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <CreditCard className="text-emerald-600 w-5 h-5" /> স্মার্ট বাজেট ক্যালকুলেটর
          </h3>

          {/* 1. Tourist Count Parameter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> দর্শনার্থী সংখ্যা (জন):
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 transition cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black text-slate-800 min-w-[30px] text-center">
                {touristCount}
              </span>
              <button
                onClick={handleIncrement}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-semibold">(সর্বোচ্চ ১০ জন একত্রে হিসাবযোগ্য)</span>
            </div>
          </div>

          {/* 2. Budget Category Parameter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-500 uppercase">ভ্রমণ ক্যাটাগরি বা স্টাইল:</label>
            <div className="flex flex-col gap-2">
              {Object.entries(BUDGET_CATEGORIES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setActiveBudgetCat(key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeBudgetCat === key
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-sm"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs md:text-sm">
                      {key === "budget" && "🚌"} {key === "mid" && "🚗"}{key === "luxury" && "✨"} {config.label}
                    </span>
                    <span className="text-xs font-black text-emerald-700 font-mono">৳ {config.multiplier} / জন</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {config.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Expense Breakdowns Receipt */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-serif font-bold text-base text-yellow-400">ব্যয়ের হিসাব বিবরণী (আনুমানিক)</h4>
            <p className="text-[11px] text-slate-400 font-medium">ঢাকা থেকে আসা-যাওয়া, থাকা ও খাওয়ার হিসাবের একটি নির্ভরযোগ্য সারসংক্ষেপ।</p>
          </div>

          <div className="space-y-3 font-mono text-xs md:text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-medium">১. যাতায়াত ও লোকাল অটো:</span>
              <span className="text-white font-extrabold">৳ {transportCost}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-medium">২. খাবার ও ঐতিহ্যবাহী দই-মিষ্টি:</span>
              <span className="text-white font-extrabold">৳ {foodCost}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-medium">৩. প্রবেশ টিকেট ও বিবিধ খরচ:</span>
              <span className="text-white font-extrabold">৳ {ticketAndLocalCost}</span>
            </div>
          </div>

          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">মোট আনুমানিক বাজেট:</span>
              <span className="text-yellow-400 text-2xl font-black font-sans">৳ {totalCost}</span>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase">
              {touristCount} জনের জন্য মোট
            </span>
          </div>

          <p className="text-[10px] text-slate-500 text-justify leading-relaxed font-semibold">
            * এটি একটি নির্ভরযোগ্য বাজারভিত্তিক পর্যটন ব্যয় প্রাক্কলন। উৎসবের দিন, সরকারি ছুটির দিন বা বিশেষ মৌসুমে যাতায়াত ভাড়া এবং মিষ্টির বাজারদর সামান্য পরিবর্তিত হতে পারে।
          </p>
        </div>

      </div>

      {/* 4. Travel Warning & Guidelines Checklist */}
      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex flex-col md:flex-row gap-5 items-start">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl shrink-0">
          ⚠️
        </div>
        
        <div className="space-y-2 text-left">
          <h4 className="font-bold text-amber-900 text-sm md:text-base">ট্যুরিস্ট সতর্কতা ও পুঠিয়া ভ্রমণ নীতিমালা</h4>
          <p className="text-xs text-amber-800 font-medium leading-relaxed text-justify">
            ঐতিহাসিক স্থানগুলোর পবিত্রতা বজায় রাখতে এবং নিজের নিরাপত্তা রক্ষা করতে নিম্নলিখিত বিষয়গুলো অবশ্যই পালন করুন:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 text-xs text-amber-700/90 font-medium">
            <div className="flex items-start gap-1.5 leading-relaxed text-justify">
              <span className="text-amber-500">✔</span>
              <span>মন্দির ও রাজপ্রাসাদের পোড়ামাটির অলংকরণে কোনো হাত দেবেন না বা নোংরা করবেন না।</span>
            </div>
            <div className="flex items-start gap-1.5 leading-relaxed text-justify">
              <span className="text-amber-500">✔</span>
              <span>প্লাস্টিক চিপসের প্যাকেট, পানির বোতল নির্দিষ্ট ডাস্টবিন বা ময়লা ফেলার ঝুড়িতে ফেলুন।</span>
            </div>
            <div className="flex items-start gap-1.5 leading-relaxed text-justify">
              <span className="text-amber-500">✔</span>
              <span>স্থানীয় নির্ভরযোগ্য মিষ্টির দোকান ও অটোরিকশার চালকদের সাথে আগে থেকেই ভাড়া ঠিক করে নিন।</span>
            </div>
            <div className="flex items-start gap-1.5 leading-relaxed text-justify">
              <span className="text-amber-500">✔</span>
              <span>যেকোনো বিপদে পুঠিয়া থানা বা ট্যুরিস্ট পুলিশ বা উপজেলা স্বাস্থ্য কমপ্লেক্সে সরাসরি যোগাযোগ করুন।</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

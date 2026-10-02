import React, { useState } from "react";
import { ArrowLeft, Waves, Compass, HelpCircle, Map, MapPin, Navigation, Info, ShieldAlert, Car, Footprints } from "lucide-react";

interface Site {
  id: string;
  name: string;
  banglaName: string;
  history: string;
  keyFeature: string;
  distance: string;
  howToGo: string;
  estimatedCost: string;
  tips: string;
  icon: string;
}

const HISTORICAL_SITES: Site[] = [
  {
    id: "hawakhana",
    name: "Tarapur Hawa Khana",
    banglaName: "তারাপুর হাওয়াখানা (জলটুঙ্গি গ্রীষ্মকালীন প্যালেস)",
    history: "পুঠিয়া রাজাদের গ্রীষ্মকালীন বিনোদন কেন্দ্র ও জলটুঙ্গি হিসেবে এটি পুকুরের মাঝখানে পিলারের ওপর চমৎকার দ্বিতল কাঠামোর আদলে নির্মিত হয়েছিল। গরমের সময় ঠান্ডা হাওয়া উপভোগ করার জন্য চারপাশ খোলা রেখে বিশেষ প্রকৌশল নকশায় এটি তৈরি করা হয়।",
    keyFeature: "বিশাল দিঘির মাঝখানে পানির ওপরে দাঁড়িয়ে থাকা রাজকীয় দ্বিতল জলটুঙ্গি ভবন।",
    distance: "পুঠিয়া সদর রাজবাড়ী থেকে ৩ কিমি দূরে তারাপুর গ্রামে অবস্থিত।",
    howToGo: "পুঠিয়া বাসস্ট্যান্ড বা রাজবাড়ী বাজার থেকে লোকাল ইজিবাইক বা ভ্যান ভাড়া করে সরাসরি যাওয়া যায়।",
    estimatedCost: "লোকাল ভাড়া জনপ্রতি ১৫-২০ টাকা। পুরো অটো রিজার্ভ করলে ৫০-৮০ টাকা।",
    tips: "বিকেলের দিকে এখানে গেলে দিঘির শান্ত বাতাস ও সূর্যাস্তের অসাধারণ রূপ দেখা যায়। দীঘির পানিতে কোনো আবর্জনা ফেলবেন না।",
    icon: "🏛️"
  },
  {
    id: "shyam_sagar",
    name: "Shyam Sagar Lake",
    banglaName: "ঐতিহাসিক শ্যামসাগর দিঘি",
    history: "পুঠিয়া রাজবাড়ীর ঠিক পূর্ব পাশে অবস্থিত উত্তরবঙ্গের অন্যতম প্রাচীন ও বিশালাকার দিঘি, যা প্রায় ১৫ একর জায়গা জুড়ে বিস্তৃত। রাজপরিবারের স্নান, নিরাপত্তা ও প্রাসাদের সৌন্দর্যের উদ্দেশ্যে মুঘল আমলেই এই জলাশয়ের খননকাজ শুরু করা হয়েছিল।",
    keyFeature: "দিঘির চারপাশের ঘাট বাঁধাই করা সবুজ মনোরম ওয়াকওয়ে ও রাজকীয় ভিউ।",
    distance: "পুঠিয়া রাজবাড়ী কমপ্লেক্সের সাথেই অবস্থিত।",
    howToGo: "হেঁটে যাওয়ার পথ, রাজবাড়ী তোরণের ঠিক পাশেই এর মনোরম পাড় শুরু হয়েছে।",
    estimatedCost: "প্রবেশ সম্পূর্ণ ফ্রি। কোনো টিকিটের প্রয়োজন নেই।",
    tips: "দিঘির পাড়ে বসার বেঞ্চ রয়েছে, যেখানে পর্যটকেরা শান্ত সময় কাটাতে পারেন। রাতে দিঘির পাড়ে একাকী ঘোরাঘুরি করা এড়িয়ে চলুন।",
    icon: "🌊"
  },
  {
    id: "charaani",
    name: "Charaani Rajbari Complex",
    banglaName: "চারআনি রাজবাড়ী ও কাচারি প্রাঙ্গণ",
    history: "মূল পাঁচআনি রাজবাড়ীর সামান্য উত্তরে অবস্থিত পুঠিয়া জমিদার বংশের আরেকটি শরিকের জমিদারি প্রশাসনিক কেন্দ্র। যদিও এটি পাঁচআনি রাজবাড়ীর মতো সুরক্ষিত বা বিশাল নয়, তবে এর জরাজীর্ণ প্রাচীন তোরণ ও দেয়াল অনন্য ইতিহাসের সাক্ষী।",
    keyFeature: "পুরোনো চুন-সুরকির ভাঙা খিলান তোরণ এবং মুঘল রীতির জরাজীর্ণ সীমানা দেয়াল।",
    distance: "মূল রাজবাড়ী থেকে হাঁটা দূরত্বে মাত্র ৪০০ মিটার দূরে অবস্থিত।",
    howToGo: "সহজ পায়ে হাঁটা পথ। স্থানীয়দের জিজ্ঞাসা করলেই দেখিয়ে দেবেন।",
    estimatedCost: "প্রবেশ সম্পূর্ণ ফ্রি ও উন্মুক্ত।",
    tips: "প্রাচীন জরাজীর্ণ দেয়ালগুলোর পাশে বা ওপরে ওঠার চেষ্টা করবেন না, যেকোনো সময় ধসে পড়ার ঝুঁকি থাকে।",
    icon: "🧱"
  },
  {
    id: "shib_sarobar",
    name: "Shib Sarobar Lake",
    banglaName: "শিব সরোবর দিঘি",
    history: "পুঠিয়ার মহিমান্বিত বড় শিব মন্দিরের ঠিক সামনে অবস্থিত চমৎকার ঘাট বাঁধানো পুণ্য দিঘি। শিব মন্দিরে পূজা দেওয়ার আগে ভক্তদের স্নান ও আচমনের জন্য এই দিঘিটি রাজ পরিবার নির্মাণ করিয়েছিল।",
    keyFeature: "শিব মন্দিরের সিঁড়ি বরাবর চমৎকার চওড়া ঘাট এবং পানিতে শিব মন্দিরের প্রতিচ্ছবি।",
    distance: "শিব মন্দিরের ঠিক সামনেই অবস্থিত।",
    howToGo: "হেঁটে যাওয়ার পথ, রাজবাড়ী চত্বর থেকেই সরাসরি দেখা যায়।",
    estimatedCost: "প্রবেশ সম্পূর্ণ ফ্রি।",
    tips: "দীঘির ঘাটগুলো শ্যাওলা পড়ার কারণে পিছল হতে পারে, তাই দীঘির ঘাটে নামার সময় পা সাবধানে ফেলুন।",
    icon: "💧"
  },
  {
    id: "indigo",
    name: "Tarapur Indigo Factory Ruins",
    banglaName: "তারাপুর নীলকুঠি ও প্রাচীন ধ্বংসাবশেষ",
    history: "মুঘল আমলের পর ইস্ট ইন্ডিয়া কোম্পানির আমলে তারাপুর এলাকায় একটি বড় নীলকুঠি ও কাচারি ঘর স্থাপন করা হয়েছিল। পুঠিয়ার রাজারা ব্রিটিশদের নীল চাষের বিরুদ্ধেও লড়াই করেছিলেন। এখানকার কিছু প্রাচীন ভাঙা অংশ আজও রয়ে গেছে।",
    keyFeature: "ব্রিটিশ আমলের নীল চাষের কাচারির ধ্বংসাবশেষ ও প্রাচীন ইটের নিদর্শন।",
    distance: "পুঠিয়া সদর থেকে প্রায় ৩.৫ কিমি দূরে তারাপুর হাওয়াখানার সন্নিকটে।",
    howToGo: "হাওয়াখানা দেখার সাথে সাথে একই ইজিবাইকে এই জায়গাটি ঘুরে দেখা যায়।",
    estimatedCost: "অটোভাড়ার সাথেই অন্তর্ভুক্ত থাকে। আলাদা কোনো ফি নেই।",
    tips: "এটি লোকালয়ের মধ্যে ঝোপঝাড়ের কাছে অবস্থিত, তাই বন্য গাছপালা বা সাপের উপদ্রব সম্পর্কে সতর্ক থাকুন।",
    icon: "🛡️"
  }
];

interface RouteStep {
  point: string;
  mode: string;
  fare: string;
  time: string;
  details: string;
}

const TOURISM_ROUTES: Record<string, RouteStep[]> = {
  "route1": [
    { point: "পুঠিয়া ত্রিমোহনী বাসস্ট্যান্ড", mode: "যাত্রা শুরু (পায়ে হাঁটা বা রিকশা)", fare: "০-১০ টাকা", time: "৫ মিনিট", details: "ঢাকা-রাজশাহী হাইওয়েতে নামার পর সরাসরি রিকশায় রাজবাড়ী চত্বর।" },
    { point: "বড় শিব মন্দির ও দিঘি", mode: "পায়ে হাঁটা", fare: "ফ্রি", time: "২ মিনিট", details: "দিঘির পাড়ে দাঁড়িয়ে শিব মন্দিরের নান্দনিক সৌন্দর্য উপভোগ।" },
    { point: "পাঁচআনি রাজপ্রাসাদ", mode: "পায়ে হাঁটা", fare: "৩০ টাকা (টিকিট)", time: "৫ মিনিট", details: "সিংহদুয়ার পেরিয়ে মূল প্রাসাদের কাচারি ঘর ও নাচঘর পরিদর্শন।" },
    { point: "গোবিন্দ মন্দির ও দোলমঞ্চ", mode: "পায়ে হাঁটা", fare: "ফ্রি", time: "৩ মিনিট", details: "প্রাসাদের ভেতরের চমৎকার টেরাকোটা ফলকচিত্র দর্শন।" }
  ],
  "route2": [
    { point: "পুঠিয়া রাজবাড়ী বাজার", mode: "ইজিবাইক / অটোরিকশা (রিজার্ভ বা লোকাল)", fare: "২০ টাকা (লোকাল)", time: "১০ মিনিট", details: "রাজবাড়ী বাজার থেকে তারাপুরগামী লিংক রোড দিয়ে সরাসরি যাত্রা।" },
    { point: "তারাপুর হাওয়াখানা", mode: "নৌকা (দিঘি পারাপার - ঐচ্ছিক)", fare: "১০-২০ টাকা", time: "৫ মিনিট", details: "দিঘির মাঝখানে পানির ওপরের দ্বিতল জলটুঙ্গি দর্শন।" },
    { point: "নীলকুঠি ধ্বংসাবশেষ", mode: "পায়ে হাঁটা", fare: "ফ্রি", time: "৩ মিনিট", details: "তারাপুর গ্রামের প্রাচীন কাচারি ও কুঠির ধ্বংসাবশেষ ঘুরে দেখা।" }
  ]
};

interface HistoricalSitesInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function HistoricalSitesInfo({ onGoBack, hideHeader = false }: HistoricalSitesInfoProps) {
  const [activeSiteTab, setActiveSiteTab] = useState<string>("hawakhana");
  const [activeRouteTab, setActiveRouteTab] = useState<string>("route1");

  const currentSite = HISTORICAL_SITES.find((s) => s.id === activeSiteTab) || HISTORICAL_SITES[0];

  return (
    <div className="space-y-6 pb-8 font-sans" id="historical-sites-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #881337, #4C0519)" }}
        >
          <div className="space-y-3 max-w-2xl text-left">
            <span className="bg-white/20 backdrop-blur-md text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              প্রাচীন ধ্বংসাবশেষ ও দিঘি শহর
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-white">
              ঐতিহাসিক স্থান
            </h1>
            <p className="text-white/95 text-sm md:text-base leading-relaxed text-justify">
              পুঠিয়া রাজবাড়ী চত্বরের বাইরে চারপাশের ছড়িয়ে ছিটিয়ে থাকা প্রাচীন হাওয়াখানা, রাজকীয় দিঘি, নীলকুঠি এবং অন্য জমিদারি শরিকদের ধ্বংসাবশেষের পূর্ণাঙ্গ ম্যাপ ও গাইড।
            </p>
            
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={onGoBack}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border border-white/25 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </button>
              <div className="bg-white/15 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-rose-200">
                🛶 তারাপুর জলটুঙ্গি গ্রীষ্মকালীন কুঠি
              </div>
            </div>
          </div>

          {/* Total stats card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[150px] shrink-0 self-stretch flex flex-col justify-center">
            <p className="text-xs text-rose-200 uppercase font-semibold">মোট ঐতিহাসিক সাইট</p>
            <p className="text-4xl font-serif font-black text-yellow-300">০৫ +</p>
            <p className="text-[10px] text-white/80 mt-1">পুঠিয়া সদরে ও তারাপুরে</p>
          </div>
        </div>
      )}

      {/* 2. Horizontal site selector */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px", overflowX: "auto" }}>
        <div className="flex gap-2 min-w-max pb-1 w-full">
          {HISTORICAL_SITES.map((site) => {
            const isActive = activeSiteTab === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setActiveSiteTab(site.id)}
                style={{
                  flex: 1,
                  minWidth: "75px",
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
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-slate-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <span className="text-lg">{site.icon}</span>
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {site.banglaName.split(" (")[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Site Detail Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Detail Content */}
        <div className="md:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">{currentSite.icon}</span> {currentSite.banglaName}
            </h3>
            <span className="text-xs text-rose-700 font-extrabold flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {currentSite.distance}
            </span>
          </div>

          <p className="text-slate-650 text-xs md:text-sm font-medium leading-relaxed text-justify">
            {currentSite.history}
          </p>

          <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100/30">
            <h5 className="text-xs font-bold text-rose-900 block mb-1">⭐ প্রধান আকর্ষণ:</h5>
            <p className="text-xs text-slate-700 font-medium leading-normal text-justify">
              {currentSite.keyFeature}
            </p>
          </div>
        </div>

        {/* Navigation & Safety Tips card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            
            {/* Travel instruction */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">কিভাবে পৌঁছাবেন:</span>
              <p className="text-xs text-slate-700 font-semibold leading-normal">
                {currentSite.howToGo}
              </p>
            </div>

            {/* Price list */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">আনুমানিক খরচ:</span>
              <p className="text-xs text-rose-800 font-extrabold">
                {currentSite.estimatedCost}
              </p>
            </div>

            {/* Caution/Tip list */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold block uppercase flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> ভ্রমণকারীর নিরাপত্তা টিপস:
              </span>
              <p className="text-[11px] text-slate-500 font-medium leading-normal text-justify">
                {currentSite.tips}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Interactive Tourism Routes Map Planner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2">
          <Compass className="text-rose-400 w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-lg md:text-xl font-serif font-bold text-white">স্মার্ট ভ্রমণ রুট ম্যাপ</h3>
            <p className="text-slate-400 text-xs font-medium">পুঠিয়া বাসস্ট্যান্ডে নামার পর থেকে কীভাবে সময় বাঁচিয়ে সবগুলো দর্শনীয় স্থান ঘুরে দেখবেন তার নিখুঁত রুট গাইড।</p>
          </div>
        </div>

        {/* Route Selectors */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveRouteTab("route1")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRouteTab === "route1" 
                ? "bg-rose-800 text-white shadow-md border border-rose-700" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-750"
            }`}
          >
            🗺️ রুট ১: রাজবাড়ী ও মন্দির স্কয়ার (পায়ে হাঁটা রুট)
          </button>
          <button
            onClick={() => setActiveRouteTab("route2")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRouteTab === "route2" 
                ? "bg-rose-800 text-white shadow-md border border-rose-700" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-750"
            }`}
          >
            🧭 রুট ২: তারাপুর হাওয়াখানা ও নীলকুঠি লিংক (রিকশা/অটো রুট)
          </button>
        </div>

        {/* Steps Display */}
        <div className="space-y-4">
          {TOURISM_ROUTES[activeRouteTab].map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              
              {/* Vertical line connector */}
              {idx < TOURISM_ROUTES[activeRouteTab].length - 1 && (
                <div className="absolute left-[13px] top-7 bottom-[-20px] w-0.5 bg-rose-800/60 z-0"></div>
              )}

              {/* Step number badge */}
              <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-700 flex items-center justify-center text-xs font-black text-rose-300 z-10 shrink-0 shadow-inner">
                {idx + 1}
              </div>

              {/* Step description */}
              <div className="bg-slate-800/75 p-4 rounded-2xl border border-slate-700/50 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2 space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {step.point}
                  </h4>
                  <p className="text-slate-400 text-xs font-medium text-justify">
                    {step.details}
                  </p>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-xl text-right text-xs space-y-1 shrink-0 border border-slate-700/35">
                  <p className="text-slate-400 font-semibold"><span className="text-rose-400 font-bold">যানবাহন:</span> {step.mode}</p>
                  <p className="text-yellow-400 font-black"><span className="text-slate-400 font-bold">ভাড়া:</span> {step.fare}</p>
                  <p className="text-slate-400 font-semibold"><span className="text-slate-400 font-bold">সময়:</span> {step.time}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

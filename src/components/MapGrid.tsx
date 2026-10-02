import React, { useState } from "react";
import { 
  ArrowLeft, MapPin, Map, Info, Compass,
  Layers, RotateCcw, Landmark, Eye
} from "lucide-react";
import { MAP_SECTORS, mapSectionData, MapSector } from "../data/mapData";

interface MapGridProps {
  onGoBack: () => void;
}

export function MapGrid({ onGoBack }: MapGridProps) {
  const [selectedSector, setSelectedSector] = useState<MapSector>(MAP_SECTORS[0]);
  const [activeTab, setActiveTab] = useState<"visual" | "borders">("visual");

  const handleResetMap = () => {
    setSelectedSector(MAP_SECTORS[0]);
  };

  return (
    <div className="p-4 bg-[#FAF9F6] min-h-screen font-sans space-y-6">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#EA580C] to-[#991B1B]">
        <div className="absolute right-0 bottom-0 w-32 h-32 text-white/5 -mb-4 -mr-4">
          <Map className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3 border border-white/20">
            ভৌগোলিক তথ্য ও সীমানা
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight leading-tight">
            মানচিত্র ও সীমানা নির্দেশিকা
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200/90 max-w-2xl leading-relaxed text-justify">
            পুঠিয়া উপজেলার প্রশাসনিক ডিজিটাল মানচিত্র, ৬টি ইউনিয়ন সীমানা, ঢাকা-রাজশাহী মহাসড়কের মহাসড়ক রুট এবং সংলগ্ন নদী-দিঘির ভৌগোলিক অবস্থান।
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

      {/* 2. Sub Navigation Tabs */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab("visual")}
          className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm ${
            activeTab === "visual"
              ? "bg-orange-50 border-orange-300 text-orange-800"
              : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="text-base block mb-1">🗺️</span>
          ইন্টারঅ্যাক্টিভ ডিজিটাল ম্যাপ
        </button>
        <button
          onClick={() => setActiveTab("borders")}
          className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm ${
            activeTab === "borders"
              ? "bg-orange-50 border-orange-300 text-orange-800"
              : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="text-base block mb-1">🧭</span>
          সীমানা ও মহাসড়ক নেটওয়ার্ক
        </button>
      </div>

      {/* 3. Panel Content */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 min-h-[400px]">
        
        {/* PANEL A: INTERACTIVE VISUAL MAP */}
        {activeTab === "visual" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Side: CSS Vector Map Layout */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  ম্যাপে ক্লিক করে ইউনিয়ন ট্র্যাকিং করুন
                </span>
              </div>

              {/* Map Border Wrapper */}
              <div className="relative w-full max-w-[420px] aspect-square bg-[#F8FAFC] border-2 border-neutral-100 rounded-[32px] p-8 flex flex-col items-center justify-between shadow-inner overflow-hidden select-none">
                
                {/* Surrounding Boundary Landmarks */}
                {/* NORTH BORDER */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-400 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1">
                  <span>⬆️ দুর্গাপুর ও বাগমারা উপজেলা</span>
                </div>
                {/* SOUTH BORDER */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-400 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1">
                  <span>⬇️ চারঘাট ও বাঘা উপজেলা</span>
                </div>
                {/* EAST BORDER */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 rotate-90 origin-right text-[10px] font-bold text-neutral-400 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1">
                  <span>➡️ নাটোর জেলা সীমানা</span>
                </div>
                {/* WEST BORDER */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] font-bold text-neutral-400 bg-white border border-neutral-150 px-2.5 py-0.5 rounded-full z-10 flex items-center gap-1">
                  <span>⬅️ পবা উপজেলা</span>
                </div>

                {/* THE HIGHWAY ROAD (S-Curve Gold Dotted Line) */}
                <div className="absolute top-[52%] left-0 w-full h-1.5 pointer-events-none z-15 flex items-center">
                  <div className="w-full h-1 bg-amber-500 border-t border-b border-dashed border-white shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"></div>
                  <span className="absolute left-10 -top-4 text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded border border-amber-200">ঢাকা-রাজশাহী মহাসড়ক</span>
                </div>

                {/* SHIB RIVER (Blue Curved Line) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 opacity-45" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50,30 Q 180,110 240,190 T 350,380" stroke="#3B82F6" strokeWidth="4.5" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
                  <text x="180" y="115" fill="#2563EB" fontSize="8" fontWeight="bold" transform="rotate(18, 180, 115)">মুসাখান ও শিব নদী</text>
                </svg>

                {/* SECTOR CELLS IN GRID LAYOUT */}
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-3 relative z-10 py-4 px-2">
                  
                  {/* CELL 1: 6নং ভালুকগাছী (North-West) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[5])}
                    className={`col-span-1 row-span-1 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "bhalukgachi"
                        ? "bg-rose-600 scale-98 ring-4 ring-rose-300 z-20"
                        : "bg-rose-500 hover:bg-rose-550 border-rose-400"
                    }`}
                  >
                    <span className="text-sm">🍃</span>
                    <span className="font-extrabold text-[10px] tracking-tight leading-tight mt-1">ভালুকগাছী</span>
                    <span className="text-[7.5px] opacity-75 mt-0.5">৬নং ইউপি</span>
                  </div>

                  {/* CELL 2: 4নং জিউপাড়া (North-Center) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[3])}
                    className={`col-span-1 row-span-1 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "jeupara"
                        ? "bg-indigo-600 scale-98 ring-4 ring-indigo-300 z-20"
                        : "bg-indigo-500 hover:bg-indigo-550 border-indigo-400"
                    }`}
                  >
                    <span className="text-sm">🌾</span>
                    <span className="font-extrabold text-[10px] tracking-tight leading-tight mt-1">জিউপাড়া</span>
                    <span className="text-[7.5px] opacity-75 mt-0.5">৪নং ইউপি</span>
                  </div>

                  {/* CELL 3: 5নং শিলমাড়িয়া (North-East / Large Area) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[4])}
                    className={`col-span-1 row-span-2 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "shilmaria"
                        ? "bg-purple-600 scale-98 ring-4 ring-purple-300 z-20"
                        : "bg-purple-500 hover:bg-purple-550 border-purple-400"
                    }`}
                  >
                    <span className="text-base">🐟</span>
                    <span className="font-extrabold text-[10.5px] tracking-tight leading-tight mt-1">শিলমাড়িয়া</span>
                    <span className="text-[7.5px] opacity-75 mt-0.5">৫নং ইউপি</span>
                    <span className="text-[7px] text-purple-100 bg-purple-700/55 px-1 py-0.5 rounded mt-1">বৃহত্তম</span>
                  </div>

                  {/* CELL 4: 3নং বানেশ্বর (West/Mid-Left) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[2])}
                    className={`col-span-1 row-span-1 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "baneshwar"
                        ? "bg-sky-600 scale-98 ring-4 ring-sky-300 z-20"
                        : "bg-sky-500 hover:bg-sky-550 border-sky-400"
                    }`}
                  >
                    <span className="text-sm">🥭</span>
                    <span className="font-extrabold text-[10px] tracking-tight leading-tight mt-1">বানেশ্বর</span>
                    <span className="text-[7.5px] opacity-75 mt-0.5">৩নং ইউপি</span>
                  </div>

                  {/* CELL 5: 1নং পুঠিয়া সদর (Center) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[0])}
                    className={`col-span-1 row-span-2 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "puthia_sadar"
                        ? "bg-emerald-600 scale-98 ring-4 ring-emerald-300 z-20"
                        : "bg-emerald-500 hover:bg-emerald-550 border-emerald-400"
                    }`}
                  >
                    <span className="text-base">🏛️</span>
                    <span className="font-extrabold text-[11px] tracking-tight leading-tight mt-1">পুঠিয়া সদর</span>
                    <span className="text-[8px] opacity-80 mt-0.5 font-bold">১নং (উপজেলা সদর)</span>
                  </div>

                  {/* CELL 6: blank placeholder block */}
                  <div className="col-span-1 row-span-1 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-350 select-none">
                    মৌজা বিল
                  </div>

                  {/* CELL 7: 2নং বেলপুকুর (Southwest / Gateway) */}
                  <div 
                    onClick={() => setSelectedSector(MAP_SECTORS[1])}
                    className={`col-span-1 row-span-1 rounded-2xl flex flex-col items-center justify-center p-2.5 cursor-pointer text-white text-center shadow-md border-2 transition-all duration-300 select-none ${
                      selectedSector.id === "belpukur"
                        ? "bg-teal-600 scale-98 ring-4 ring-teal-300 z-20"
                        : "bg-teal-500 hover:bg-teal-550 border-teal-400"
                    }`}
                  >
                    <span className="text-sm">🚉</span>
                    <span className="font-extrabold text-[10px] tracking-tight leading-tight mt-1">বেলপুকুর</span>
                    <span className="text-[7.5px] opacity-75 mt-0.5">২নং ইউপি</span>
                  </div>

                  {/* CELL 8: blank placeholder block */}
                  <div className="col-span-1 row-span-1 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-350 select-none">
                    পদ্মা বাইপাস
                  </div>

                </div>

              </div>
              
              <button 
                onClick={handleResetMap}
                className="text-neutral-500 hover:text-neutral-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> ম্যাপ রিফ্রেশ করুন
              </button>
            </div>

            {/* Right Side: Info Drawer for Selected Sector */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-neutral-50 border border-neutral-150 rounded-[20px] p-5 space-y-4 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                    📍
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-orange-600 uppercase tracking-wide">ম্যাপ সিলেকশন ট্র্যাকার</span>
                    <h4 className="font-extrabold text-neutral-800 text-sm mt-0.5">
                      {selectedSector.name}
                    </h4>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  
                  {/* HQ */}
                  <div>
                    <span className="font-bold text-neutral-400 text-[10px] uppercase block">🏢 কার্যালয় কেন্দ্র</span>
                    <span className="font-extrabold text-neutral-800 block mt-0.5">{selectedSector.hqLocation}</span>
                  </div>

                  {/* Neighbors */}
                  <div>
                    <span className="font-bold text-neutral-400 text-[10px] uppercase block">🧭 পার্শ্ববর্তী ও চতুর্দশ সীমানা</span>
                    <p className="text-neutral-600 mt-0.5 leading-relaxed text-justify">{selectedSector.neighbors}</p>
                  </div>

                  {/* Highways */}
                  <div>
                    <span className="font-bold text-neutral-400 text-[10px] uppercase block">🛣️ প্রধান যোগাযোগ ও সড়ক</span>
                    <span className="font-bold text-neutral-700 block mt-0.5">{selectedSector.highways}</span>
                  </div>

                  {/* Rivers */}
                  <div>
                    <span className="font-bold text-neutral-400 text-[10px] uppercase block">💧 সংলগ্ন নদী ও জলাশয়</span>
                    <span className="font-semibold text-neutral-600 block mt-0.5">{selectedSector.rivers}</span>
                  </div>

                </div>
              </div>

              {/* Special highlight box */}
              <div className="bg-orange-50 border border-orange-100 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                <div className="text-base">✨</div>
                <div>
                  <h5 className="font-extrabold text-orange-850">দর্শনীয় ও ঐতিহ্যমণ্ডিত গৌরব</h5>
                  <p className="text-orange-750 mt-0.5 font-medium">{selectedSector.highlights}</p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PANEL B: TRANSPORT NETWORK & BORDERS DETAILS */}
        {activeTab === "borders" && (
          <div className="space-y-6">
            <h3 className="text-[16px] font-extrabold text-[#1A1A1A] border-b border-neutral-50 pb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-orange-600" /> উপজেলা সীমানা ও মহাসড়ক কানেক্টিভিটি
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-neutral-100 p-5 rounded-2xl space-y-3">
                <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 pb-2 border-b border-neutral-50">
                  <Compass className="w-4 h-4 text-orange-600" /> পুঠিয়ার চারপাশের সীমানা
                </h4>
                <div className="space-y-3 text-xs leading-relaxed text-neutral-600">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0">🧭</span>
                    <div>
                      <span className="font-bold text-neutral-800 block">উত্তর সীমানা</span>
                      <span>রাজশাহী জেলার দুর্গাপুর উপজেলা এবং বাগমারা উপজেলা।</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0">🧭</span>
                    <div>
                      <span className="font-bold text-neutral-800 block">দক্ষিণ সীমানা</span>
                      <span>রাজশাহী জেলার চারঘাট উপজেলা ও বাঘা উপজেলা।</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0">🧭</span>
                    <div>
                      <span className="font-bold text-neutral-800 block">পূর্ব সীমানা</span>
                      <span>নাটোর জেলার নাটোর সদর উপজেলা এবং বাগাতিপাড়া উপজেলা।</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base shrink-0">🧭</span>
                    <div>
                      <span className="font-bold text-neutral-800 block">পশ্চিম সীমানা</span>
                      <span>রাজশাহী জেলার পবা উপজেলা।</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-100 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 pb-2 border-b border-neutral-50">
                    🛣️ ঢাকা-রাজশাহী মহাসড়ক ও রেলপথ
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                    পুঠিয়া উপজেলার ওপর দিয়ে বাংলাদেশের অন্যতম প্রধান সড়কপথ <strong>ঢাকা-রাজশাহী মহাসড়ক (N6)</strong> অতিক্রম করেছে। এই মহাসড়কটি বেলপুকুর, বানেশ্বর ও পুঠিয়া সদরকে রাজধানী ঢাকা ও রাজশাহী বিভাগীয় সদরের সাথে সংযুক্ত করেছে। 
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed text-justify">
                    এছাড়াও, বেলপুকুর রেল ক্রসিংয়ের ওপর দিয়ে রাজশাহী-নাটোর সেকশনের রেলপথ অতিক্রম করেছে যা ট্রেন যোগাযোগের সংযোগ রক্ষা করে।
                  </p>
                </div>

                <div className="bg-orange-50/50 border border-orange-100/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                    i
                  </div>
                  <span className="text-[10px] text-orange-800 font-bold leading-normal">
                    উপজেলা পরিষদ থেকে নাটোর সদরের দূরত্ব প্রায় ১৭ কিমি এবং রাজশাহী জেলা সদরের দূরত্ব প্রায় ৩০ কিমি।
                  </span>
                </div>
              </div>

            </div>

            <div className="bg-[#125836]/5 rounded-2xl p-6 text-center border border-dashed border-[#125836]/20">
              <Landmark className="w-8 h-8 text-[#125836] mx-auto mb-2" />
              <h5 className="font-bold text-[#125836] text-xs">প্রত্নতাত্ত্বিক মানচিত্র নির্দেশক</h5>
              <p className="text-[10.5px] text-neutral-500 max-w-lg mx-auto mt-1 leading-normal">
                পুঠিয়া উপজেলার প্রত্নতাত্ত্বিক শিব ও গোবিন্দ মন্দির চত্বরের চারপাশে শ্যামসাগর দিঘি রয়েছে যা প্রাচীন মুঘল ও জমিদার আমলের অনন্য পানিনিষ্কাশন ও সৌন্দর্য বর্ধন সীমানার স্মারক বহন করে।
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

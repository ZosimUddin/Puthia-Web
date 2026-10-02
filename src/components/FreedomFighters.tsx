import React, { useState } from "react";
import { ArrowLeft, Medal, Heart, Phone } from "lucide-react";

interface Props { onGoBack: () => void; activeColor?: string; }

export const FreedomFighters: React.FC<Props> = ({ onGoBack, activeColor = '#1A237E' }) => {
  const [filter, setFilter] = useState<"martyred" | "living">("martyred");

  return (
    <div className="space-y-4 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-[32px] flex flex-col justify-center p-8 shadow-md overflow-hidden"
        style={{ background: 'linear-gradient(135deg, ' + activeColor + ', #000000)' }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-white/10 uppercase">
            জাতির শ্রেষ্ঠ সন্তান
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            বীর মুক্তিযোদ্ধা ডিরেক্টরি
          </h1>
          <p className="text-purple-100 text-xs font-medium max-w-[280px]">
            মহান মুক্তিযুদ্ধে পুঠিয়ার যেসব বীর কৃতি সন্তান নিজেদের জীবন বাজি রেখে যুদ্ধ করেছেন, তাদের সম্মাননা ও সংক্ষিপ্ত পরিচিতি।
          </p>
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("martyred")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "martyred"
                ? "text-white shadow-md border"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
             style={{ backgroundColor: filter === 'martyred' ? activeColor : undefined, borderColor: filter === 'martyred' ? activeColor : undefined }}
          >
            <Medal className={`w-4 h-4 ${filter === "martyred" ? 'text-white' : 'text-gray-400'}`}/>
            শহীদ বীর মুক্তিযোদ্ধা
          </button>
          <button
            onClick={() => setFilter("living")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "living"
                ? "text-white shadow-md border"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
             style={{ backgroundColor: filter === 'living' ? activeColor : undefined, borderColor: filter === 'living' ? activeColor : undefined }}
          >
            <Heart className={`w-4 h-4 ${filter === "living" ? 'text-white' : 'text-gray-400'}`}/>
            জীবিত বীর মুক্তিযোদ্ধা
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-[6px] flex gap-4 items-start relative overflow-hidden animate-fade-in" style={{ borderColor: activeColor }}>
             <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-purple-300 text-xs text-center font-medium leading-tight">ছবি<br/>নেই</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-0.5">[মুক্তিযোদ্ধার নাম]</h3>
              <p className="text-sm font-medium text-gray-600 mb-2 border-b border-gray-100 pb-2">
                <span className="font-bold" style={{ color: activeColor }}>গ্রাম/ইউনিয়ন:</span> জিউপাড়া, পুঠিয়া।
              </p>
              <p className="text-xs text-gray-600 leading-relaxed bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50 mb-3 block">
                <Medal className="w-3.5 h-3.5 inline-block mr-1" style={{ color: activeColor }} />
                <span className="font-bold text-gray-800">সেক্টর ও অবদান:</span> ১৯৭১ সালে ৭ নং সেক্টরের অধীনে পুঠিয়া ও তার আশেপাশের অঞ্চলের বিভিন্ন সম্মুখ সমরে অংশ নেন।
              </p>
              <div className="flex gap-2">
                <button className={`w-full py-2.5 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-colors border border-opacity-20 flex items-center justify-center gap-1.5 shadow-md`} style={{ backgroundColor: activeColor }}>
                  {filter === 'living' ? '📖 সাক্ষাৎকার ও স্মৃতি' : '📖 বীরত্বগাথা পড়ুন'}
                </button>
                {filter === 'living' && (
                  <button className="w-10 flex-shrink-0 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
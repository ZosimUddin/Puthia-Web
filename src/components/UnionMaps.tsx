import React, { useState } from "react";
import { ArrowLeft, Map, Navigation, Maximize } from "lucide-react";

interface Props { onGoBack: () => void; }

export const UnionMaps: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"official" | "live">("official");

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-3xl flex flex-col justify-center p-8 shadow-md overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-white/10 uppercase">
            ভৌগোলিক সীমানা
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            ইউনিয়ন ডিজিটাল ম্যাপ
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
            মৌজা ও গ্রামভিত্তিক সীমানা চিহ্নিতকরণের জন্য পুঠিয়া উপজেলার ইউনিয়নের মানচিত্র।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("official")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "official"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Map className={`w-4 h-4 ${filter === "official" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            অফিশিয়াল লেআউট ম্যাপ
          </button>
          <button
            onClick={() => setFilter("live")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "live"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Navigation className={`w-4 h-4 ${filter === "live" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            গুগল লাইভ লোকেশন
          </button>
        </div>

        <div className="space-y-4">
          {filter === "official" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-2">১নং পুঠিয়া ইউনিয়ন ভূ-চিত্র</h3>
              <p className="text-sm font-medium text-gray-600 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3 leading-relaxed">
                <span className="font-bold text-[#0D47A1]">বিবরণ:</span> উত্তর-দক্ষিণ সীমানা এবং পাশ্ববর্তী ইউনিয়নের সাথে সংযোগকারী সড়ক সম্বলিত হাই-রেজোলিউশন ম্যাপ ইমেজ।
              </p>
              
              <div className="w-full h-32 bg-blue-50/50 rounded-xl mb-4 border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
                 <Map className="w-10 h-10 text-blue-200 absolute opacity-50" />
                 <span className="text-blue-800 font-medium text-xs z-10 bg-white/80 px-4 py-1.5 rounded-full shadow-sm">ম্যাপ ইমেজ প্রিভিউ</span>
              </div>

              <div className="flex gap-2 w-full">
                <button className="flex-1 py-2.5 text-xs font-bold text-[#0D47A1] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center gap-1.5 w-[50%]">
                  <Maximize className="w-3.5 h-3.5" />
                  ম্যাপ জুম করুন
                </button>
              </div>
            </div>
          )}
          {filter === "live" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-10 animate-fade-in">
                <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">গুগল ম্যাপ লোড হচ্ছে...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
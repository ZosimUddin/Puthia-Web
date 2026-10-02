import React, { useState } from "react";
import { ArrowLeft, Users, UserCheck } from "lucide-react";

interface VillagePopulationInfoProps {
  onGoBack: () => void;
}

export const VillagePopulationInfo: React.FC<VillagePopulationInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"population" | "voters">("population");

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-3xl flex flex-col justify-center p-8 shadow-md overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B5E20, #2E7D32)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-white/10 uppercase">
            আঞ্চলিক পরিসংখ্যান
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামভিত্তিক জনসংখ্যা ও ভোটার
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            শুমারীর তথ্য অনুযায়ী পুঠিয়ার প্রতিটি গ্রামের মোট জনসংখ্যা, পরিবারের সংখ্যা ও সাধারণ পরিসংখ্যান।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("population")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "population"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            জনসংখ্যা গ্রিড
          </button>
          <button
            onClick={() => setFilter("voters")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "voters"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            ভোটার পরিসংখ্যান
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-3">গ্রাম: বানেশ্বর (প্যারাডাইস বা সদর অংশ)</h3>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 mb-4 space-y-2 relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Users className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 font-medium">
                <span className="font-bold text-blue-800">মোট জনসংখ্যা:</span> ৪,৫২০ জন
              </p>
              <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                <span>পুরুষ: ২,২৮০ জন</span>
                <span>মহিলা: ২,২৪০ জন</span>
              </div>
              <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-2 mb-2">
                <div className="h-full bg-[#4CAF50] w-1/2 rounded-full" />
              </div>
              <p className="text-sm text-gray-700 font-medium pt-1 border-t border-blue-100">
                <span className="font-bold text-blue-800">মোট পরিবার (খানার সংখ্যা):</span> ৯৮০টি
              </p>
            </div>
            <button className="w-full py-2.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-colors border border-blue-100/50">
              📈 চার্ট ভিউ দেখুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Medal } from "lucide-react";

interface VillageNotablePersonsInfoProps {
  onGoBack: () => void;
}

export const VillageNotablePersonsInfo: React.FC<VillageNotablePersonsInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"freedom_fighter" | "educator" | "social_worker" | "historical">("freedom_fighter");

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
            পুঠিয়ার কৃতি সন্তান
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামের উল্লেখযোগ্য ব্যক্তি
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            শিক্ষা, সমাজসেবা, রাজনীতি এবং মুক্তিযুদ্ধে পুঠিয়া উপজেলার বিভিন্ন গ্রামের গুণী ও কৃতি ব্যক্তিবর্গের সংক্ষিপ্ত পরিচিতি।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("freedom_fighter")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "freedom_fighter"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🎖️ বীর মুক্তিযোদ্ধা
          </button>
          <button
            onClick={() => setFilter("educator")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "educator"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🎓 শিক্ষাবিদ ও গুণীজন
          </button>
          <button
            onClick={() => setFilter("social_worker")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "social_worker"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🤝 সমাজসেবক
          </button>
          <button
            onClick={() => setFilter("historical")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "historical"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            👑 ঐতিহাসিক ব্যক্তিত্ব
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-start relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center font-medium leading-tight">ছবি<br/>নেই</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-0.5">[গুণী ব্যক্তির নাম]</h3>
              <p className="text-xs text-[#4CAF50] font-black uppercase tracking-wider mb-2">বীর মুক্তিযোদ্ধা</p>
              <p className="text-sm text-gray-700 font-medium mb-1 border-b border-gray-100 pb-2">
                <span className="font-bold">গ্রাম:</span> জিউপাড়া
              </p>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3">
                <span className="font-bold text-gray-800">অবদান:</span> ১৯৭১ সালের মহান মুক্তিযুদ্ধে পুঠিয়া অঞ্চলে সম্মুখ সমরে বীরত্বপূর্ণ অবদান।
              </p>
              <button className="w-full py-2 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors border border-green-100/50 flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                সম্পূর্ণ জীবনবৃত্তান্ত
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
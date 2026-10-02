import React, { useState } from "react";
import { ArrowLeft, Search, MapPin, Building, List } from "lucide-react";

interface VillageListInfoProps {
  onGoBack: () => void;
}

export const VillageListInfo: React.FC<VillageListInfoProps> = ({ onGoBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"union" | "all">("all");

  const villages = [
    { id: 1, name: "কান্দ্রা", union: "পুঠিয়া ইউনিয়ন", ward: "০৩" },
    { id: 2, name: "ধোকড়াকুল", union: "বেলপুকুর ইউনিয়ন", ward: "০১" },
    { id: 3, name: "জিউপাড়া", union: "জিউপাড়া ইউনিয়ন", ward: "০২" },
  ];

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
            ডিজিটাল ইনডেক্স
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            পুঠিয়ার গ্রামের তালিকা
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            পুঠিয়া উপজেলার ৬টি ইউনিয়ন এবং পৌরসভার অন্তর্ভুক্ত সকল গ্রামের বর্ণানুক্রমিক তালিকা ও সন্ধান কেন্দ্র।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="গ্রামের নাম দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-white shadow-sm"
            style={{ outlineColor: "#4CAF50" }}
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("union")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "union"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Building className="w-4 h-4" />
            ইউনিয়ন ভিত্তিক
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "all"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <List className="w-4 h-4" />
            সব গ্রাম একসাথে
          </button>
        </div>

        <div className="space-y-4">
          {villages.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-3xl opacity-50" />
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">গ্রাম: {v.name}</h3>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4CAF50]" />
                    অবস্থান: {v.union} | ওয়ার্ড নং: {v.ward}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 relative z-10">
                <button className="flex-1 py-2 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors">
                  📖 বিস্তারিত তথ্য
                </button>
                <button className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                  📍 ম্যাপে দেখুন
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
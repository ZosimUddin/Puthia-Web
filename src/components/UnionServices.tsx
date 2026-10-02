import React, { useState } from "react";
import { ArrowLeft, ScrollText, HeartHandshake, Download, MousePointer } from "lucide-react";

interface Props { onGoBack: () => void; }

export const UnionServices: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"certificates" | "social_safety">("certificates");

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
            নাগরিক সেবা ও অধিকার
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            ইউনিয়ন পরিষদ সেবা তালিকা
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
            পরিষদ থেকে সরাসরি ও অনলাইনে প্রাপ্ত বিভিন্ন সার্টিফিকেট এবং নাগরিক সুবিধা পাওয়ার সঠিক নির্দেশিকা।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("certificates")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "certificates"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <ScrollText className={`w-4 h-4 ${filter === "certificates" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            সনদপত্র সমূহ
          </button>
          <button
            onClick={() => setFilter("social_safety")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "social_safety"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <HeartHandshake className={`w-4 h-4 ${filter === "social_safety" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            সামাজিক নিরাপত্তা
          </button>
        </div>

        <div className="space-y-4">
          {filter === "certificates" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">নাগরিকত্ব ও চারিত্রিক সনদপত্র</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">
                  <span className="font-bold text-[#0D47A1]">প্রয়োজনীয় ডকুমেন্ট:</span> জাতীয় পরিচয়পত্র/জন্ম সনদের ফটোকপি এবং স্থানীয় মেম্বারের প্রত্যয়ন।
                </p>
                <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="font-bold text-[#0D47A1]">ফি:</span> সরকারি বিধি মোতাবেক।
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <button className="flex-1 py-2.5 text-[11px] font-bold text-white bg-[#0D47A1] rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1 w-[50%]">
                  <MousePointer className="w-3.5 h-3.5 text-[#00E5FF]" />
                  অনলাইনে আবেদন
                </button>
                <button className="flex-1 py-2.5 text-[11px] font-bold text-[#0D47A1] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center gap-1 w-[50%]">
                  <Download className="w-3.5 h-3.5" />
                  ফরম ডাউনলোড
                </button>
              </div>
            </div>
          )}
          {filter === "social_safety" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-10 animate-fade-in">
               <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
               <p className="text-sm font-medium text-gray-500">সামাজিক নিরাপত্তা কর্মসূচির তথ্য আপডেট করা হচ্ছে</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
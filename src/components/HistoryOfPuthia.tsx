import React, { useState } from "react";
import { ArrowLeft, BookOpen, Clock, ChevronRight } from "lucide-react";

interface Props { onGoBack: () => void; }

export const HistoryOfPuthia: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"origin" | "zamindari">("origin");

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-3xl flex flex-col justify-center p-8 shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4A0E17, #721C24)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-[#D4AF37]/30 uppercase">
            শত বছরের ঐতিহ্য
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-md mb-1 serif-font">
            পুঠিয়ার গৌরবময় ইতিহাস
          </h1>
          <p className="text-red-100/90 text-xs font-medium max-w-[280px]">
             পুঠিয়া রাজবংশের সূচনা, পাঁচআনি ও চারআনি এস্টেট এবং এই অঞ্চলের ঐতিহাসিক বিবর্তনের গল্প।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("origin")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm ${
              filter === "origin"
                ? "bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clock className={`w-4 h-4 ${filter === "origin" ? 'text-[#D4AF37]' : 'text-gray-400'}`}/>
            রাজবংশের সূচনা
          </button>
          <button
            onClick={() => setFilter("zamindari")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm ${
              filter === "zamindari"
                ? "bg-[#4A0E17] text-[#D4AF37] border border-[#D4AF37]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <BookOpen className={`w-4 h-4 ${filter === "zamindari" ? 'text-[#D4AF37]' : 'text-gray-400'}`}/>
            জমিদারী আমল ও যুদ্ধ
          </button>
        </div>

        <div className="space-y-4">
          {filter === "origin" && (
            <div className="bg-[#FAF8F5] rounded-2xl p-5 shadow-lg border border-[#E8DFC9] flex flex-col gap-3 relative overflow-hidden animate-fade-in group">
               <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#D4AF37]"></div>
               <div className="pl-3">
                  <h3 className="text-lg font-black text-[#4A0E17] leading-tight serif-font mb-2">ঐতিহাসিক বিবর্তন</h3>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      মোঘল সম্রাট আকবরের সময়ে পুঠিয়া রাজবংশের পত্তন থেকে শুরু করে মহারানী শরৎসুন্দরী দেবীর অবদান এবং ১৯৭১ সালের মুক্তিযুদ্ধ পর্যন্ত পুঠিয়ার ঐতিহাসিক টাইমলাইন অত্যন্ত সমৃদ্ধ।
                    </p>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed">
                      পুঠিয়ার জনপদ পাল ও সেন আমল থেকেই প্রসিদ্ধ ছিল, তবে মুঘল আমলে এটি পূর্ণাঙ্গ রাজকীয় মর্যাদা লাভ করে।
                    </p>
                  </div>
               </div>

              <button className="w-full mt-3 py-3 text-xs font-bold text-[#4A0E17] bg-[#D4AF37] rounded-xl hover:bg-[#E5C251] transition-colors shadow-md flex items-center justify-center gap-1.5 outline-none uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> বিস্তারিত ইতিহাস পড়ুন
              </button>
            </div>
          )}
          {filter === "zamindari" && (
             <div className="bg-[#FAF8F5] rounded-2xl p-5 shadow-sm border border-[#E8DFC9] text-center py-10 animate-fade-in">
              <BookOpen className="w-10 h-10 text-[#D4AF37] opacity-50 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">শীঘ্রই আপডেট করা হবে</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React from "react";
import { ArrowLeft, Users, User, GraduationCap } from "lucide-react";

interface Props { onGoBack: () => void; }

export const Demographics: React.FC<Props> = ({ onGoBack }) => {
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
            জনমিতি পরিসংখ্যান
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-md mb-1 serif-font">
            পুঠিয়ার জনসংখ্যা ও জনমিতি
          </h1>
          <p className="text-red-100/90 text-xs font-medium max-w-[280px]">
            সর্বশেষ আদমশুমারি অনুযায়ী পুঠিয়া উপজেলার জনসংখ্যা এবং শিক্ষার হার সংক্রান্ত অফিসিয়াল পরিসংখ্যান।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-[#FAF8F5] rounded-2xl p-5 shadow-lg border border-[#E8DFC9] space-y-4">
          <div className="text-center pb-4 border-b border-[#E8DFC9]/50">
            <div className="w-12 h-12 bg-[#4A0E17]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-[#4A0E17]">
               <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">মোট জনসংখ্যা</h3>
            <p className="text-2xl font-black text-[#4A0E17]">২,০৭,৪৯০<span className="text-sm text-gray-500 font-normal"> জন</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-white p-4 rounded-xl border border-[#E8DFC9] text-center shadow-sm">
               <User className="w-5 h-5 text-blue-600 mx-auto mb-1" />
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">পুরুষ</p>
               <p className="text-lg font-black text-slate-800">৫১%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E8DFC9] text-center shadow-sm">
               <User className="w-5 h-5 text-pink-600 mx-auto mb-1" />
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">নারী</p>
               <p className="text-lg font-black text-slate-800">৪৯%</p>
            </div>
          </div>

          <div className="pt-2">
             <div className="flex justify-between items-end mb-2">
               <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-bold text-gray-700">শিক্ষার হার</span>
               </div>
               <span className="text-sm font-black text-[#4A0E17]">৫৩.৬০%</span>
             </div>
             <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
               <div className="h-full bg-[#D4AF37]" style={{ width: "53.6%" }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
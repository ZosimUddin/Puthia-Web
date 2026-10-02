import React from "react";
import { ArrowLeft, Hash, Info, Lightbulb } from "lucide-react";

interface Props { onGoBack: () => void; }

export const KeyFacts: React.FC<Props> = ({ onGoBack }) => {
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
            এক নজরে পুঠিয়া
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-md mb-1 serif-font">
            গুরুত্বপূর্ণ তথ্য কণিকা
          </h1>
          <p className="text-red-100/90 text-xs font-medium max-w-[280px]">
            পুঠিয়া উপজেলা সম্পর্কে প্রয়োজনীয় কুইক ফ্যাক্টস এবং সাধারণ জ্ঞান।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-[#FAF8F5] rounded-2xl overflow-hidden shadow-lg border border-[#E8DFC9]">
           
           <div className="flex items-center gap-3 p-4 border-b border-[#E8DFC9]/70">
             <div className="w-8 h-8 rounded-full bg-[#4A0E17]/10 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-[#4A0E17]" />
             </div>
             <div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">পোস্টাল কোড / ডাককোড</p>
               <p className="text-sm font-bold text-gray-800">পুঠিয়া - ৬২৬০</p>
             </div>
           </div>

           <div className="flex items-center gap-3 p-4 border-b border-[#E8DFC9]/70">
             <div className="w-8 h-8 rounded-full bg-[#4A0E17]/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-[#4A0E17]" />
             </div>
             <div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">প্রধান অর্থনৈতিক উৎস</p>
               <p className="text-sm font-bold text-gray-800">কৃষি <span className="text-xs text-gray-500 font-medium">(আম, খাজা মিষ্টি, ধান, আখ)</span></p>
             </div>
           </div>

           <div className="flex items-center gap-3 p-4">
             <div className="w-8 h-8 rounded-full bg-[#4A0E17]/10 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-[#4A0E17]" />
             </div>
             <div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">নিকটবর্তী রেলওয়ে স্টেশন</p>
               <p className="text-sm font-bold text-gray-800">নন্দনগাছি বা নাটোর/রাজশাহী</p>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};
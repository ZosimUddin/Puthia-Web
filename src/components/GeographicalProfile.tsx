import React from "react";
import { ArrowLeft, Map, Compass, Maximize, Waves } from "lucide-react";

interface Props { onGoBack: () => void; }

export const GeographicalProfile: React.FC<Props> = ({ onGoBack }) => {
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
            অবস্থান ও সীমানা
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-md mb-1 serif-font">
            ভৌগোলিক পরিচিতি
          </h1>
          <p className="text-red-100/90 text-xs font-medium max-w-[280px]">
            রাজশাহী জেলা সদর থেকে পূর্বে অবস্থিত পুঠিয়া উপজেলার আয়তন এবং চারপাশের নদী ও সীমানার বিবরণ।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="bg-[#FAF8F5] rounded-2xl p-5 shadow-lg border border-[#E8DFC9] space-y-5 relative">
           <div className="absolute top-0 right-0 p-3 opacity-10">
             <Map className="w-20 h-20 text-[#4A0E17]" />
           </div>
           
           <div className="flex items-start gap-4 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-[#4A0E17]/10 flex items-center justify-center border border-[#4A0E17]/20 shrink-0">
               <Maximize className="w-5 h-5 text-[#4A0E17]" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-[#4A0E17] mb-1">মোট আয়তন</h3>
               <p className="text-xs text-gray-700 font-medium">প্রায় ১৯২.৬৪ বর্গ কিলোমিটার।</p>
             </div>
           </div>

           <div className="flex items-start gap-4 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-[#4A0E17]/10 flex items-center justify-center border border-[#4A0E17]/20 shrink-0">
               <Compass className="w-5 h-5 text-[#4A0E17]" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-[#4A0E17] mb-1">সীমানা</h3>
               <p className="text-xs text-gray-700 font-medium leading-relaxed">উত্তরে দুর্গাপুর ও বাগমারা, দক্ষিণে চারঘাট ও বাঘা, পূর্বে নাটোর সদর, পশ্চিমে পবা উপজেলা।</p>
             </div>
           </div>

           <div className="flex items-start gap-4 relative z-10">
             <div className="w-10 h-10 rounded-xl bg-[#4A0E17]/10 flex items-center justify-center border border-[#4A0E17]/20 shrink-0">
               <Waves className="w-5 h-5 text-[#4A0E17]" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-[#4A0E17] mb-1">নদ-নদী</h3>
               <p className="text-xs text-gray-700 font-medium tracking-tight">বারনই নদী ও বিভিন্ন ঐতিহাসিক দীঘি (শিবসাগর, শ্যামসাগর)।</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
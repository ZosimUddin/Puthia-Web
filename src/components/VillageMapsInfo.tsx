import React, { useState } from "react";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";

interface VillageMapsInfoProps {
  onGoBack: () => void;
}

export const VillageMapsInfo: React.FC<VillageMapsInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"boundary" | "roads">("boundary");

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
            ভৌগোলিক নেভিগেশন
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামের অবস্থান মানচিত্র
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            জিপিএস এবং গুগল ম্যাপের সহায়তায় পুঠিয়ার যেকোনো গ্রাম এবং এর প্রধান রাস্তাগুলো সহজে খুঁজে বের করুন।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("boundary")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "boundary"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            📍 গ্রামের সীমানা ম্যাপ
          </button>
          <button
            onClick={() => setFilter("roads")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "roads"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🛣️ প্রধান সংযোগ সড়ক
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">শিলমাড়িয়া ইউনিয়ন - গ্রামভিত্তিক ম্যাপ রুট</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
              <span className="font-bold text-gray-800 block mb-1">📝 গাইড:</span> পুঠিয়া সদর থেকে সড়ক পথে কীভাবে এই গ্রামের মূল বাজারে পৌঁছাবেন তার জিপিএস রুট নির্দেশিকা এই ম্যাপে প্রদর্শিত হয়েছে।
            </p>
            <div className="w-full h-32 bg-blue-50/50 rounded-xl mb-4 border border-blue-100 flex items-center justify-center relative overflow-hidden">
               <MapPin className="text-blue-200 w-16 h-16 absolute opacity-50" />
               <span className="text-blue-800 font-medium text-xs z-10 bg-white/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-blue-100">ম্যাপ প্রিভিউ</span>
            </div>
            <button className="w-full py-3 text-xs font-bold text-white bg-[#4CAF50] rounded-xl hover:bg-green-600 shadow-md shadow-green-200 transition-colors flex items-center justify-center gap-1.5">
              <Navigation className="w-4 h-4" />
              সরাসরি গুগল ম্যাপে দেখুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
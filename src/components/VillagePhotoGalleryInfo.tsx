import React, { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Download, Maximize } from "lucide-react";

interface VillagePhotoGalleryInfoProps {
  onGoBack: () => void;
}

export const VillagePhotoGalleryInfo: React.FC<VillagePhotoGalleryInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"nature" | "heritage">("nature");

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
            ক্যামেরায় গ্রাম বাংলা
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামীন চিত্রশালা
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            পুঠিয়ার গ্রামগুলোর সবুজ প্রকৃতি, ফসলের মাঠ, গ্রামীণ উৎসব এবং গ্রামীণ জীবনযাত্রার স্থিরচিত্র।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("nature")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "nature"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🌾 প্রকৃতি ও ফসলের মাঠ
          </button>
          <button
            onClick={() => setFilter("heritage")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "heritage"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            🏡 ঐতিহ্যবাহী বাড়িঘর
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="w-full h-40 bg-gray-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
              <span className="text-gray-400 font-medium text-sm z-10">[ছবি লোড হবে]</span>
              <ImageIcon className="absolute w-24 h-24 text-gray-300 opacity-20" />
            </div>
            <p className="text-sm font-bold text-gray-800 px-2 mb-3">গ্রামীণ মেঠো পথ ও দিগন্ত বিস্তৃত মাঠ</p>
            <div className="flex gap-2 relative z-10 px-1">
              <button className="flex-1 py-2 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors border border-green-100/50 flex items-center justify-center gap-1.5">
                <Maximize className="w-3.5 h-3.5" />
                ফুল স্ক্রিন ভিউ
              </button>
              <button className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-colors border border-blue-100/50 flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                ডাউনলোড
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
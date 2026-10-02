import React, { useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, Library, MapPin, Phone } from "lucide-react";

interface VillageEducationInfoProps {
  onGoBack: () => void;
}

export const VillageEducationInfo: React.FC<VillageEducationInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"primary" | "madrasa" | "highschool" | "library">("primary");

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
            শিক্ষা ও মেধা বিকাশ
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামের শিক্ষা প্রতিষ্ঠান
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            পুঠিয়ার বিভিন্ন গ্রামে গড়ে ওঠা প্রাথমিক, মাধ্যমিক বিদ্যালয়, ইবতেদায়ী মাদ্রাসা ও শিক্ষা কেন্দ্রের তালিকা।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("primary")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "primary"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            প্রাথমিক বিদ্যালয়
          </button>
          <button
            onClick={() => setFilter("madrasa")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "madrasa"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            মাদ্রাসা ও মক্তব
          </button>
          <button
            onClick={() => setFilter("highschool")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "highschool"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            উচ্চ বিদ্যালয়/কলেজ
          </button>
          <button
            onClick={() => setFilter("library")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "library"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Library className="w-4 h-4" />
            স্বেচ্ছাসেবী পাঠাগার
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-1">কান্দ্রা সরকারি প্রাথমিক বিদ্যালয়</h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#4CAF50]" />
              গ্রাম: কান্দ্রা | স্থাপিত: ১৯৭৩ খ্রি.
            </p>
            <p className="text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
              <span className="font-bold text-[#4CAF50]">টাইপ:</span> সরকারি প্রাথমিক বিদ্যালয়।
            </p>
            <div className="flex gap-2 relative z-10">
              <button className="flex-1 py-2 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors border border-green-100/50 flex items-center justify-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                প্রধান শিক্ষক
              </button>
              <button className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-colors border border-blue-100/50 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                লোকেশন ম্যাপ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
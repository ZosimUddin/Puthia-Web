import React, { useState } from "react";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

interface VillageHistoryInfoProps {
  onGoBack: () => void;
}

export const VillageHistoryInfo: React.FC<VillageHistoryInfoProps> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"history" | "lore">("history");

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
            আঞ্চলিক ইতিহাস ও ঐতিহ্য
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            গ্রামের ইতিহাস ও নামকরণ
          </h1>
          <p className="text-green-100 text-xs font-medium max-w-[280px]">
            পুঠিয়ার শতাব্দী প্রাচীন গ্রামগুলোর নামের উৎপত্তি, ঐতিহাসিক ঘটনা এবং লোকমুুখের ঐতিহ্যবাহী গল্প।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("history")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "history"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            নামকরণের ইতিহাস
          </button>
          <button
            onClick={() => setFilter("lore")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              filter === "lore"
                ? "bg-[#4CAF50] text-white shadow-md border border-[#4CAF50]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            প্রাচীন ঐতিহ্য
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2 border-gray-100">তারাপুর গ্রামের নামকরণ</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              <span className="font-bold text-gray-800">📝 ইতিহাস:</span> স্থানীয় পুঠিয়া রাজবাড়ির রাজাদের পুণ্যস্মৃতি এবং ঐতিহাসিক তারাপুর বিল বা হাওয়াখানার সাথে মিল রেখে এই গ্রামের নামকরণ ও পত্তন ঘটেছিল বলে জানা যায়।
            </p>
            <button className="w-full py-2.5 text-xs font-bold text-[#4CAF50] bg-green-50 rounded-xl hover:bg-[#4CAF50] hover:text-white transition-colors border border-green-100/50">
              📖 পুরো ইতিহাস পড়ুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
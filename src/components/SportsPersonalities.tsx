import React, { useState } from "react";
import { ArrowLeft, Trophy, Medal } from "lucide-react";

interface Props { onGoBack: () => void; }

export const SportsPersonalities: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"players" | "organizers">("players");

  return (
    <div className="space-y-4 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-[32px] flex flex-col justify-center p-8 shadow-md overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A237E, #4A148C)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-white/10 uppercase">
            খেলার মাঠের গৌরব
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            কৃতী ক্রীড়াবিদ ও সংগঠক
          </h1>
          <p className="text-purple-100 text-xs font-medium max-w-[280px]">
            জাতীয় ও জেলা ভিত্তিক ক্রীড়াঙ্গনে পুঠিয়ার প্রতিনিধিত্বকারী খেলোয়াড় এবং ক্রীড়া সংগঠকদের তালিকা।
          </p>
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("players")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "players"
                ? "bg-[#1A237E] text-white shadow-md border border-[#1A237E]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
             ⚽ ফুটবল ও ক্রিকেট
          </button>
          <button
            onClick={() => setFilter("organizers")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "organizers"
                ? "bg-[#1A237E] text-white shadow-md border border-[#1A237E]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Trophy className={`w-4 h-4 ${filter === "organizers" ? 'text-[#E040FB]' : 'text-gray-400'}`}/>
            ক্রীড়া সংগঠক
          </button>
        </div>

        <div className="space-y-4">
          <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-[6px] ${filter === 'players' ? 'border-l-blue-500' : 'border-l-orange-500'} flex gap-4 items-start relative overflow-hidden animate-fade-in`}>
             <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-purple-300 text-xs text-center font-medium leading-tight">ছবি<br/>নেই</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-0.5">[খেলোয়াড়ের নাম]</h3>
              <p className="text-sm font-medium text-gray-600 mb-2 border-b border-gray-100 pb-2">
                <span className="font-bold text-[#1A237E]">খেলা:</span> জাতীয় অনূর্ধ্ব-১৯ ক্রিকেট/ফুটবল দল।
              </p>
              <p className="text-xs text-gray-600 leading-relaxed bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50 mb-3 block">
                <span className="font-bold text-gray-800 inline-flex items-center gap-1"><Medal className="w-3.5 h-3.5 text-[#1A237E]"/> অর্জন:</span> ঢাকা প্রিমিয়ার লিগ বা জাতীয় অ্যাথলেটিক্সে পুঠিয়ার পক্ষে গৌরবময় অংশগ্রহণ।
              </p>
              <button className="w-full py-2.5 text-xs font-bold text-white bg-[#1A237E] rounded-xl hover:bg-indigo-900 transition-colors border border-indigo-900 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200">
                <Trophy className="w-3.5 h-3.5 text-[#E040FB]" /> অর্জন ও গ্যালারি
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
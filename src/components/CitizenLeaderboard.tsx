import React, { useState } from "react";
import { ArrowLeft, Trophy, Crown, Target } from "lucide-react";

interface Props { onGoBack: () => void; }

export const CitizenLeaderboard: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"monthly" | "all_time">("monthly");

  const board = [
    { id: 1, name: "মো. রফিকুল ইসলাম", points: 2450, badge: "গোল্ডেন সিটিজেন", color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
    { id: 2, name: "আব্দুল্যাহ আল নিবিড়", points: 1980, badge: "সিলভার নাগরিক", color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200" },
    { id: 3, name: "সাদিয়া আফরিন", points: 1540, badge: "ব্রোঞ্জ মেম্বার", color: "text-orange-400", bg: "bg-orange-50", border: "border-orange-200" },
  ];

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #2D1B4E, #1F1137)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-600 text-sm font-medium mb-2 uppercase tracking-wide">সেরা নাগরিক অবদান</p>
          <h1 className="text-4xl font-black mb-1 text-white">নাগরিক লিডারবোর্ড</h1>
          <div className="w-10 h-1 bg-white rounded-full my-3"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            তথ্য শেয়ার, রক্তদান এবং অ্যাপে সক্রিয় অবদানের ভিত্তিতে পুঠিয়ার সেরা নাগরিকদের তালিকা।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("monthly")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "monthly"
                ? "bg-[#2D1B4E] text-[#FFB300] shadow-md border border-[#FFB300]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Trophy className={`w-4 h-4 ${filter === "monthly" ? 'text-[#FFB300]' : 'text-gray-400'}`}/>
            চলতি মাসের সেরা
          </button>
          <button
            onClick={() => setFilter("all_time")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "all_time"
                ? "bg-[#2D1B4E] text-[#FFB300] shadow-md border border-[#FFB300]/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Crown className={`w-4 h-4 ${filter === "all_time" ? 'text-[#FFB300]' : 'text-gray-400'}`}/>
            সর্বকালের সেরা
          </button>
        </div>

        <div className="space-y-3">
          {filter === "monthly" && (
            <>
              {board.map((u, idx) => (
                <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden animate-fade-in group hover:shadow-md transition-shadow">
                   <div className="absolute -left-2 -top-2 w-12 h-12 bg-gray-50 rounded-full z-0 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
                   <div className="relative z-10 w-8 text-center text-lg font-black text-gray-300">
                     #{idx + 1}
                   </div>
                   <div className="flex-1 relative z-10">
                      <h3 className="text-sm font-bold text-[#1F1137]">{u.name}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${u.color}`}>• {u.badge}</p>
                   </div>
                   <div className={`relative z-10 ${u.bg} border ${u.border} rounded-xl px-3 py-1.5 flex flex-col items-center`}>
                     <span className="text-[10px] text-gray-500 font-bold uppercase">ইস্টার</span>
                     <span className={`text-sm font-black ${u.color}`}>{u.points.toLocaleString()}</span>
                   </div>
                </div>
              ))}
              <button className="w-full mt-4 py-3 text-xs font-bold text-[#FFB300] bg-[#2D1B4E] rounded-xl hover:bg-[#1F1137] transition-colors shadow-md flex items-center justify-center gap-1.5 outline-none">
                <Target className="w-4 h-4" /> কীভাবে ইস্টার বাড়াবেন?
              </button>
            </>
          )}
          {filter === "all_time" && (
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-10 animate-fade-in">
              <Crown className="w-10 h-10 text-[#FFB300] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-gray-500">লিডারবোর্ড রিফ্রেশ হচ্ছে...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
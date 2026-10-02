import React, { useState } from "react";
import { ArrowLeft, UserSquare2, Users, Phone, Mail, Award } from "lucide-react";

interface Props { onGoBack: () => void; }

export const ChairmanMembers: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"chairman" | "members">("chairman");

  return (
    <div className="space-y-6 font-sans pb-10">
      <div 
        className="relative w-full h-48 rounded-b-3xl flex flex-col justify-center p-8 shadow-md overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 flex flex-col items-center text-center">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-[11px] font-extrabold rounded-full mb-2 backdrop-blur-md tracking-wider border border-white/10 uppercase">
            পরিষদ গ্যালারি
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            জনপ্রতিনিধি প্যানেল
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
             ইউনিয়নের বর্তমান সম্মানিত চেয়ারম্যান এবং সকল ওয়ার্ডের মেম্বারদের দায়িত্ব বিবরণী।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("chairman")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "chairman"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Award className={`w-4 h-4 ${filter === "chairman" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            ইউপি চেয়ারম্যান
          </button>
          <button
            onClick={() => setFilter("members")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "members"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Users className={`w-4 h-4 ${filter === "members" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            ওয়ার্ড মেম্বারবৃন্দ
          </button>
        </div>

        <div className="space-y-4">
          {filter === "chairman" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserSquare2 className="w-8 h-8 text-[#0D47A1]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">জনাব মোঃ আশরাফ আলী</h3>
                  <p className="text-xs text-[#0D47A1] font-black uppercase tracking-wider mt-0.5">চেয়ারম্যান</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">১নং পুঠিয়া ইউপি</p>
                </div>
              </div>
              <div className="flex gap-2 relative z-10 w-full mt-4">
                <button className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0D47A1] rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1.5 w-[50%]">
                  <Phone className="w-3.5 h-3.5 text-[#00E5FF]" />
                  সরাসরি কল করুন
                </button>
                <button className="flex-1 py-2.5 text-xs font-bold text-[#0D47A1] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center gap-1.5 w-[50%]">
                  <Mail className="w-3.5 h-3.5" />
                  মেসেজ পাঠান
                </button>
              </div>
            </div>
          )}
          {filter === "members" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center py-10 animate-fade-in">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">সকল ওয়ার্ডের মেম্বারদের তালিকা আপডেট করা হচ্ছে</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
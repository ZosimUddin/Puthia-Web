import React, { useState } from "react";
import { ArrowLeft, Phone, UserCircle, ShieldAlert } from "lucide-react";

interface Props { onGoBack: () => void; }

export const UnionContact: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"secretary" | "police">("secretary");

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
            জরুরি যোগাযোগ ডেস্ক
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            ইউনিয়ন কন্টাক্ট ডিরেক্টরি
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
            যেকোনো সমস্যা বা স্থানীয় আইন-শৃঙ্খলার প্রয়োজনে সরাসরি পরিষদের কর্মকর্তাদের ফোন বুক।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("secretary")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "secretary"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <UserCircle className={`w-4 h-4 ${filter === "secretary" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            ইউপি সচিব
          </button>
          <button
            onClick={() => setFilter("police")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "police"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${filter === "police" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            গ্রাম পুলিশ ও দফাদার
          </button>
        </div>

        <div className="space-y-4">
          {filter === "secretary" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-1">ইউনিয়ন পরিষদ সচিব (১নং পুঠিয়া)</h3>
              <p className="text-sm font-medium text-gray-600 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3">
                <span className="font-bold text-[#0D47A1]">দায়িত্ব:</span> প্রশাসনিক ও দাপ্তরিক কাজের প্রধান সমন্বয়ক।
              </p>
              <button className="w-full py-3 text-xs font-bold text-white bg-[#0D47A1] rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4 text-[#00E5FF]" />
                সচিবকে কল করুন
              </button>
            </div>
          )}
          {filter === "police" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-1">মহল্লালদার ও দফাদার টিম</h3>
              <p className="text-sm font-medium text-gray-600 mb-4 bg-red-50 border border-red-100 rounded-xl p-3">
                <span className="font-bold text-red-600">সেবা:</span> ওয়ার্ড ভিত্তিক নৈশ প্রহরা ও স্থানীয় শান্তি-শৃঙ্খলা রক্ষা কন্টাক্ট।
              </p>
              <button className="w-full py-3 text-xs font-bold text-white bg-[#0D47A1] rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4 text-[#00E5FF]" />
                জরুরি টিম কন্টাক্ট
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
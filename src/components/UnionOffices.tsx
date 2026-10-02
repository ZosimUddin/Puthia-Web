import React, { useState } from "react";
import { ArrowLeft, Clock, Monitor, Phone, Info } from "lucide-react";

interface Props { onGoBack: () => void; }

export const UnionOffices: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"schedule" | "udc">("schedule");

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
            পরিষদ সচিবালয়
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            ইউনিয়ন পরিষদ কার্যালয়
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
            অফিসিয়াল সময়সূচী, ডিজিটাল সেন্টারের কর্মপরিবেশ এবং উদ্যোক্তাদের সাথে যোগাযোগের মাধ্যম।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("schedule")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "schedule"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clock className={`w-4 h-4 ${filter === "schedule" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            অফিস সময় ও নোটিশ
          </button>
          <button
            onClick={() => setFilter("udc")}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none ${
              filter === "udc"
                ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Monitor className={`w-4 h-4 ${filter === "udc" ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
            ডিজিটাল সেন্টার
          </button>
        </div>

        <div className="space-y-4">
          {filter === "schedule" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0D47A1]" /> পরিষদ অফিস নোটিশ
              </h3>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-700 mb-1">সময়সূচী:</p>
                <p className="text-sm text-gray-600">রবিবার থেকে বৃহস্পতিবার</p>
                <p className="text-sm text-gray-600 font-medium">(সকাল ৯:০০ - বিকাল ৫:০০)</p>
              </div>
            </div>
          )}
          {filter === "udc" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#0D47A1]" /> ইউনিয়ন ডিজিটাল সেন্টার
              </h3>
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 border-b border-blue-100 pb-2">
                  <span className="font-bold text-[#0D47A1]">উদ্যোক্তা:</span> [উদ্যোক্তার নাম]
                </p>
                <p className="text-sm font-medium text-gray-700 flex gap-1.5 items-start">
                  <Info className="w-4 h-4 text-[#0D47A1] mt-0.5 flex-shrink-0" />
                  <span><span className="font-bold text-gray-800">সেবা :</span> অনলাইন জন্ম নিবন্ধন, পর্চা আবেদন, জাতীয় পরিচয়পত্র সংশোধন সহায়তা।</span>
                </p>
              </div>
              <button className="w-full py-3 text-xs font-bold text-white bg-[#0D47A1] rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4 text-[#00E5FF]" />
                উদ্যোক্তাকে কল
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
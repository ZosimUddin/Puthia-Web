import React, { useState } from "react";
import { ArrowLeft, Building2, Map, Users, Info } from "lucide-react";

interface Props { onGoBack: () => void; }

export const UnionProfiles: React.FC<Props> = ({ onGoBack }) => {
  const [activeUnion, setActiveUnion] = useState(1);

  const unions = [
    { id: 1, name: "১নং পুঠিয়া ইউপি", area: "২৪.১৫ বর্গ কিমি", villages: "২২টি", wards: "০৯টি", desc: "পুঠিয়া সদর সংলগ্ন এই ইউনিয়নটি উপজেলার অন্যতম প্রধান প্রশাসনিক ও ঐতিহাসিক কেন্দ্রবিন্দু হিসেবে পরিচিত।" },
    { id: 2, name: "২নং বানেশ্বর ইউপি", area: "২৮.২০ বর্গ কিমি", villages: "২৫টি", wards: "০৯টি", desc: "বানেশ্বর ইউনিয়ন পুঠিয়া উপজেলার বৃহত্তর বাণিজ্যিক ও কৃষিপণ্য বিপনন কেন্দ্র।" },
    { id: 3, name: "৩নং বেলপুকুর ইউপি", area: "২০.৫০ বর্গ কিমি", villages: "১৮টি", wards: "০৯টি", desc: "বেলপুকুর ইউনিয়ন কৃষি ও গ্রামীণ জীবনযাত্রার নৈসর্গিক সৌন্দর্য্যে ভরপুর।" },
    { id: 4, name: "৪নং জিউপাড়া ইউপি", area: "২৬.৩০ বর্গ কিমি", villages: "২৩টি", wards: "০৯টি", desc: "জিউপাড়া ইউনিয়ন শিক্ষা ও সংস্কৃতির এক উজ্জ্বল দৃষ্টান্ত।" },
    { id: 5, name: "৫নং শিলমাড়িয়া ইউপি", area: "২২.১০ বর্গ কিমি", villages: "১৯টি", wards: "০৯টি", desc: "শিলমাড়িয়া ইউনিয়ন ঐতিহ্য ও আধুনিকতার মেলবন্ধন।" },
    { id: 6, name: "৬নং ভালুকগাছী ইউপি", area: "২৫.০০ বর্গ কিমি", villages: "২০টি", wards: "০৯টি", desc: "ভালুকগাছী ইউনিয়ন বিস্তীর্ণ ফসলের মাঠ ও সরল গ্রামীণ জীবনের চমৎকার উদাহরণ।" },
  ];

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
            স্থানীয় সরকার পরিচিতি
          </span>
          <h1 className="text-2xl font-black text-white drop-shadow-sm mb-1">
            ইউনিয়ন প্রোফাইল ডিরেক্টরি
          </h1>
          <p className="text-blue-100 text-xs font-medium max-w-[280px]">
            পুঠিয়া উপজেলার আওতাধীন সকল ইউনিয়ন পরিষদের মৌলিক পরিচিতি, আয়তন ও প্রশাসনিক কাঠামো।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {unions.map(u => (
            <button
              key={u.id}
              onClick={() => setActiveUnion(u.id)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-none ${
                activeUnion === u.id
                  ? "bg-[#0D47A1] text-white shadow-md border border-[#0D47A1]"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeUnion === u.id ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
              {u.name}
            </button>
          ))}
        </div>

        {unions.map(u => u.id === activeUnion && (
          <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden mt-2 animate-fade-in">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-3xl opacity-50" />
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-[#0D47A1]" />
              <h3 className="text-lg font-bold text-gray-800">{u.name}</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center justify-center text-center">
                <Map className="w-5 h-5 text-[#0D47A1] mb-1" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">আয়তন</span>
                <span className="text-xs font-black text-[#0D47A1]">{u.area}</span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center justify-center text-center">
                <Map className="w-5 h-5 text-[#0D47A1] mb-1" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">মোট গ্রাম</span>
                <span className="text-xs font-black text-[#0D47A1]">{u.villages}</span>
              </div>
              <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center justify-center text-center">
                <Users className="w-5 h-5 text-[#0D47A1] mb-1" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">মোট ওয়ার্ড</span>
                <span className="text-xs font-black text-[#0D47A1]">{u.wards}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
              <span className="font-bold text-gray-800 flex items-center gap-1.5 mb-1"><Info className="w-4 h-4 text-[#0D47A1]"/> সংক্ষিপ্ত পরিচিতি:</span> 
              {u.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
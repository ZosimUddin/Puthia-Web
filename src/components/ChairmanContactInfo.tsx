import React, { useState } from "react";
import { 
  ArrowLeft, Briefcase, Award, Building, Users, 
  Phone, Mail, CheckCircle, ShieldAlert, HeartPulse, GraduationCap
} from "lucide-react";

interface ChairmanContactInfoProps {
  onGoBack: () => void;
  onSimulateCall?: (phone: string, name: string) => void;
}

interface AdminProfile {
  name: string;
  designation: string;
  phone: string;
  email: string;
  office: string;
  avatarIcon: string;
  avatarBg: string;
}

const ADMIN_OFFICERS: AdminProfile[] = [
  {
    name: "মোছাঃ শামীমা সুলতানা",
    designation: "উপজেলা নির্বাহী কর্মকর্তা (UNO)",
    phone: "01711-122334",
    email: "unoputhia@mopa.gov.bd",
    office: "উপজেলা নির্বাহী অফিস ভবন, পুঠিয়া",
    avatarIcon: "🏛️",
    avatarBg: "bg-purple-100 text-purple-700"
  },
  {
    name: "মোঃ জাহিদ হাসান",
    designation: "সহকারী কমিশনার (ভূমি) (AC Land)",
    phone: "01712-223344",
    email: "aclandputhia@mopa.gov.bd",
    office: "উপজেলা ভূমি অফিস ভবন, পুঠিয়া",
    avatarIcon: "🗺️",
    avatarBg: "bg-amber-100 text-amber-700"
  },
  {
    name: "মোঃ শরিফুল ইসলাম",
    designation: "উপজেলা প্রকল্প বাস্তবায়ন কর্মকর্তা (PIO)",
    phone: "01713-334455",
    email: "pioputhia@ddmr.gov.bd",
    office: "ত্রাণ ও দুর্যোগ ব্যবস্থাপনা শাখা, পুঠিয়া",
    avatarIcon: "🛠️",
    avatarBg: "bg-blue-100 text-blue-700"
  }
];

const PARISHAD_LEADERS: AdminProfile[] = [
  {
    name: "মোঃ আশরাফুল ইসলাম",
    designation: "উপজেলা পরিষদের চেয়ারম্যান",
    phone: "01714-445566",
    email: "chairman.puthia@rajshahi.gov.bd",
    office: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া",
    avatarIcon: "👑",
    avatarBg: "bg-rose-100 text-rose-700"
  },
  {
    name: "মোঃ আব্দুল লতিফ",
    designation: "ভাইস চেয়ারম্যান (পুরুষ)",
    phone: "01715-556677",
    email: "vchairman.puthia@rajshahi.gov.bd",
    office: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া",
    avatarIcon: "🤝",
    avatarBg: "bg-teal-100 text-teal-700"
  },
  {
    name: "মোসাঃ মৌসুমি আক্তার",
    designation: "ভাইস চেয়ারম্যান (মহিলা)",
    phone: "01716-667788",
    email: "fvchairman.puthia@rajshahi.gov.bd",
    office: "উপজেলা परिषद কমপ্লেক্স, পুঠিয়া",
    avatarIcon: "👩",
    avatarBg: "bg-fuchsia-100 text-fuchsia-700"
  }
];

const UNION_CHAIRMEN: AdminProfile[] = [
  {
    name: "মোঃ খলিলুর রহমান",
    designation: "১নং পুঠিয়া ইউপি চেয়ারম্যান",
    phone: "01711-123456",
    email: "up1.puthia@gmail.com",
    office: "১নং পুঠিয়া ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "মোঃ রাজিবুল হক",
    designation: "২নং বেলপুকুর ইউপি চেয়ারম্যান",
    phone: "01711-234567",
    email: "up2.belpukur@gmail.com",
    office: "২নং বেলপুকুর ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "মোঃ আলিম উদ্দিন",
    designation: "৩নং বানেশ্বর ইউপি চেয়ারম্যান",
    phone: "01711-345678",
    email: "up3.baneshwar@gmail.com",
    office: "৩নং বানেশ্বর ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "মোঃ জিল্লুর রহমান",
    designation: "৪নং জিউপাড়া ইউপি চেয়ারম্যান",
    phone: "01711-456789",
    email: "up4.jeupara@gmail.com",
    office: "৪নং জিউপাড়া ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "মোঃ সাজ্জাদ হোসেন মুকুল",
    designation: "৫নং শিলমাড়িয়া ইউপি চেয়ারম্যান",
    phone: "01711-567890",
    email: "up5.shilmaria@gmail.com",
    office: "৫নং শিলমাড়িয়া ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  },
  {
    name: "মোঃ একরামুল হক",
    designation: "৬নং ভালুকগাছী ইউপি চেয়ারম্যান",
    phone: "01711-678901",
    email: "up6.bhalukgachi@gmail.com",
    office: "৬নং ভালুকগাছী ইউনিয়ন পরিষদ কার্যালয়",
    avatarIcon: "🏢",
    avatarBg: "bg-emerald-100 text-emerald-700"
  }
];

const DEPT_OFFICERS: AdminProfile[] = [
  {
    name: "ডাঃ নুসরাত জাহান",
    designation: "উপজেলা স্বাস্থ্য কর্মকর্তা (UH&FPO)",
    phone: "01717-778899",
    email: "uhfpo.puthia@dghs.gov.bd",
    office: "উপজেলা স্বাস্থ্য কমপ্লেক্স, পুঠিয়া",
    avatarIcon: "👨‍⚕️",
    avatarBg: "bg-rose-100 text-rose-700"
  },
  {
    name: "মোঃ শামসুল হক",
    designation: "উপজেলা কৃষি কর্মকর্তা (UAO)",
    phone: "01718-889900",
    email: "uaoputhia@dae.gov.bd",
    office: "উপজেলা কৃষি সম্পসারণ বিভাগ, পুঠিয়া",
    avatarIcon: "🚜",
    avatarBg: "bg-green-100 text-green-700"
  },
  {
    name: "মোঃ সাইদুর রহমান",
    designation: "থানা ভারপ্রাপ্ত কর্মকর্তা (OC Police)",
    phone: "01719-990011",
    email: "oc.puthiaps@police.gov.bd",
    office: "পুঠিয়া মডেল থানা কার্যালয়",
    avatarIcon: "👮",
    avatarBg: "bg-blue-100 text-blue-700"
  },
  {
    name: "মোঃ আশরাফুল আলম",
    designation: "মাধ্যমিক শিক্ষা অফিসার (USEO)",
    phone: "01720-112233",
    email: "useoputhia@dshe.gov.bd",
    office: "উপজেলা মাধ্যমিক শিক্ষা দপ্তর, পুঠিয়া",
    avatarIcon: "🎓",
    avatarBg: "bg-sky-100 text-sky-700"
  }
];

export function ChairmanContactInfo({ onGoBack, onSimulateCall }: ChairmanContactInfoProps) {
  const [activeTab, setActiveTab] = useState<"uno" | "council" | "unions" | "officers">("uno");

  const handleCall = (phone: string, name: string) => {
    if (onSimulateCall) {
      onSimulateCall(phone, name);
    } else {
      window.alert(`${name} কে কল করা হচ্ছে (${phone})...`);
    }
  };

  const getProfiles = () => {
    switch (activeTab) {
      case "uno": return ADMIN_OFFICERS;
      case "council": return PARISHAD_LEADERS;
      case "unions": return UNION_CHAIRMEN;
      case "officers": return DEPT_OFFICERS;
    }
  };

  return (
    <div className="p-4 space-y-6 bg-[#FAF9F6] min-h-screen font-sans">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]">
        <div className="absolute right-0 bottom-0 w-32 h-32 text-white/5 -mb-4 -mr-4">
          <Users className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3 border border-white/20">
            জনপ্রতিনিধি ও প্রশাসন ডিরেক্টরি
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight leading-tight">
            জনপ্রতিনিধি ও প্রশাসন
          </h2>
          <p className="text-xs sm:text-sm text-neutral-200/90 max-w-2xl leading-relaxed text-justify">
            পুঠিয়া উপজেলার সম্মানিত জনপ্রতিনিধিবৃন্দ এবং দাপ্তরিক কর্মকর্তাদের সরকারি যোগাযোগের নম্বর ও কার্যালয় পরিচিতির সম্পূর্ণ ডিরেক্টরি।
          </p>
          
          <div className="mt-5">
            <button 
              onClick={onGoBack}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
              <span>ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
        {[
          { id: "uno", label: "প্রশাসন (UNO)", emoji: "🏛️" },
          { id: "council", label: "উপজেলা পরিষদ", emoji: "👑" },
          { id: "unions", label: "চেয়ারম্যানগণ", emoji: "🏢" },
          { id: "officers", label: "দপ্তর প্রধান", emoji: "💼" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{ 
                flex: 1, 
                minWidth: 0, 
                background: isActive ? "#eff6ff" : "#ffffff", 
                color: isActive ? "#1e3a8a" : "#1e293b", 
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                padding: "10px 2px", 
                borderRadius: "16px", 
                textAlign: "center", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <span className={`text-sm sm:text-base ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{tab.label}</div>
            </div>
          );
        })}
      </div>

      {/* 3. Panel Content */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-6 min-h-[350px]">
        
        <div className="space-y-4">
          <h3 className="text-[15px] font-extrabold text-[#1A1A1A] border-b border-neutral-50 pb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#7C3AED]" /> 
            {activeTab === "uno" && "উপজেলা নির্বাহী কর্মকর্তা ও নির্বাহী প্রশাসন"}
            {activeTab === "council" && "উপজেলা পরিষদের নির্বাচিত জনপ্রতিনিধিবৃন্দ"}
            {activeTab === "unions" && "ইউনিয়ন পরিষদের সম্মানিত চেয়ারম্যানবৃন্দ"}
            {activeTab === "officers" && "সরকারি বিভিন্ন গুরুত্বপূর্ণ দপ্তরের প্রথম শ্রেণীর কর্মকর্তাগণ"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {getProfiles().map((profile, idx) => (
              <div 
                key={idx} 
                className="bg-neutral-50/50 border border-neutral-100 hover:border-[#7C3AED]/20 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xs hover:shadow-xs"
              >
                
                {/* Profile Top info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${profile.avatarBg} flex items-center justify-center text-2xl shrink-0 shadow-inner`}>
                    {profile.avatarIcon}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-neutral-400 block uppercase tracking-wide">
                      {profile.designation}
                    </span>
                    <h4 className="font-extrabold text-[#1A1A1A] text-[15px]">
                      {profile.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-semibold">{profile.office}</p>
                  </div>
                </div>

                {/* Profile contact rows */}
                <div className="border-t border-neutral-100/70 pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="flex items-center gap-1">📞 যোগাযোগের ফোন:</span>
                    <span className="font-extrabold text-neutral-800">{profile.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="flex items-center gap-1">✉️ অফিশিয়াল ইমেইল:</span>
                    <span className="font-semibold text-neutral-600 select-all">{profile.email}</span>
                  </div>
                </div>

                {/* Interactive Dial CTA */}
                <div className="pt-2 border-t border-neutral-100/50">
                  <button
                    onClick={() => handleCall(profile.phone, `${profile.name} (${profile.designation.split(" ")[0]})`)}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>সরাসরি কল করুন (সিমুলেটর)</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

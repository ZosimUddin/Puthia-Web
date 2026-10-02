import React, { useState } from "react";
import { ArrowLeft, Search, MapPin, Phone, GraduationCap, Clock, Building2, BookOpen } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface TechnicalEdu {
  id: string;
  name: string;
  location: string;
  phone: string;
  courses: string[];
  duration: string;
  type: "সরকারি" | "বেসরকারি";
  status: "ভর্তি চলছে" | "ভর্তি বন্ধ";
  established: string;
}

const TECHNICAL_LIST: TechnicalEdu[] = [
  {
    id: "tech_1",
    name: "পুঠিয়া কারিগরি প্রশিক্ষণ কেন্দ্র ও আইসিটি একাডেমি",
    location: "পুঠিয়া উপজেলা সদর, রাজশাহী",
    phone: "01712-345678",
    courses: ["কম্পিউটার অফিস অ্যাপ্লিকেশন", "গ্রাফিক্স ডিজাইন", "ডাটা এন্ট্রি ও ফ্রিল্যান্সিং", "দর্জি বিজ্ঞান ও সেলাই"],
    duration: "৩ থেকে ৬ মাস",
    type: "বেসরকারি",
    status: "ভর্তি চলছে",
    established: "২০১৬"
  },
  {
    id: "tech_2",
    name: "পুঠিয়া টেকনিক্যাল অ্যান্ড বিজনেস ম্যানেজমেন্ট কলেজ",
    location: "পুঠিয়া রাজবাড়ী সংলগ্ন, পুঠিয়া, রাজশাহী",
    phone: "01733-987654",
    courses: ["এইচএসসি (বিএম) - কম্পিউটার অপারেশন", "হিসাববিজ্ঞান", "সেক্রেটারিয়াল প্র্যাকটিস", "ডিজিটাল মার্কেটিং"],
    duration: "২ বছর (এইচএসসি বিএম)",
    type: "সরকারি",
    status: "ভর্তি চলছে",
    established: "২০০৪"
  },
  {
    id: "tech_3",
    name: "বন্ধু কম্পিউটার অ্যান্ড আইটি ট্রেনিং সেন্টার",
    location: "পুঠিয়া বাজার রোড, পুঠিয়া, রাজশাহী",
    phone: "01719-876543",
    courses: ["বেসিক কম্পিউটার কোর্স", "আইটি সাপোর্ট ও মেইনটেন্যান্স", "ওয়েব ডিজাইন ও ডেভেলপমেন্ট"],
    duration: "৩ মাস",
    type: "বেসরকারি",
    status: "ভর্তি চলছে",
    established: "২০১৮"
  },
  {
    id: "tech_4",
    name: "উপজেলা মহিলা বিষয়ক অধিদপ্তর (কারিগরি শাখা)",
    location: "উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া, রাজশাহী",
    phone: "01711-223344",
    courses: ["হস্তশিল্প ও বাটিক প্রিন্টিং", "দর্জি বিজ্ঞান ও ব্লক-ডিজাইন", "মোমবাতি ও সাবান প্রস্তুতকরণ"],
    duration: "১ থেকে ৩ মাস (ফ্রি কোর্স)",
    type: "সরকারি",
    status: "ভর্তি চলছে",
    established: "২০১০"
  },
  {
    id: "tech_5",
    name: "পুঠিয়া যুব উন্নয়ন যুব প্রশিক্ষণ কেন্দ্র",
    location: "উপজেলা যুব উন্নয়ন কার্যালয়, পুঠিয়া, রাজশাহী",
    phone: "01715-456789",
    courses: ["রেফ্রিজারেশন ও এসি মেরামত", "ইলেকট্রিক্যাল হাউজ ওয়ারিং", "মোবাইল ফোন সার্ভিসিং"],
    duration: "১ থেকে ৩ মাস",
    type: "সরকারি",
    status: "ভর্তি বন্ধ",
    established: "২০১২"
  }
];

export function TechnicalEduInfo({ onGoBack }: { onGoBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedType, setSelectedType] = useState<"all" | "সরকারি" | "বেসরকারি">("all");

  const filtered = TECHNICAL_LIST.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.courses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === "all" || t.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans pb-10 animate-in fade-in duration-300">
      <UnifiedHeroHeader
        badgeText="প্রশিক্ষণ ও ক্যারিয়ার"
        title="কারিগরি শিক্ষা প্রতিষ্ঠান"
        subtitle="পুঠিয়া উপজেলার সকল কারিগরি প্রশিক্ষণ কেন্দ্র, যুব উন্নয়ন প্রশিক্ষণ এবং পেশাদার আইটি শিক্ষাদানকারী প্রতিষ্ঠানের তালিকা ও বিস্তারিত কোর্স বিবরণী।"
        icon={<GraduationCap size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="প্রতিষ্ঠানের নাম বা প্রশিক্ষণ কোর্স দিয়ে খুঁজুন..."
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-500" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        }
      />
      
      <div className="px-4 space-y-4">
        {/* Search Bar & Filters */}
        <div className="space-y-3">
          {/* Quick Filters */}
          <div className="grid grid-cols-3 gap-2 px-1">
            {[
              { id: "all", label: "সব প্রতিষ্ঠান", emoji: "🏫" },
              { id: "সরকারি", label: "সরকারি", emoji: "🏛️" },
              { id: "বেসরকারি", label: "বেসরকারি", emoji: "🏢" }
            ].map(tab => {
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id as any)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                  <span className="font-extrabold text-[10px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Institution Cards */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map(t => (
              <div key={t.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-xs flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Floating Status and Type Badges */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                    t.type === "সরকারি" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {t.type} প্রতিষ্ঠান
                  </span>
                  
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                    t.status === "ভর্তি চলছে" 
                      ? "bg-green-500 text-white animate-pulse" 
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    ● {t.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-800 leading-snug flex items-start gap-2">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    {t.name}
                  </h3>
                  
                  <div className="mt-3 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{t.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>কোর্সের মেয়াদ: <span className="font-semibold text-gray-700">{t.duration}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>স্থাপিত: <span className="font-semibold text-gray-700">{t.established} খ্রি.</span></span>
                    </div>
                  </div>
                </div>

                {/* Courses Offered List */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">প্রশিক্ষণ কোর্স</span>
                  <div className="flex flex-wrap gap-1.5">
                    {t.courses.map((course, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-200">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call-to-action */}
                <a 
                  href={`tel:${t.phone}`}
                  className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl font-bold text-xs transition border border-blue-100 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" /> ভর্তির জন্য যোগাযোগ করুন: {t.phone}
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm font-semibold text-gray-500">কোন কারিগরি প্রতিষ্ঠান পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে ভিন্ন কিছু লিখে সার্চ করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


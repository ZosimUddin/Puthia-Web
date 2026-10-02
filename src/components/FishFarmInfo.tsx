import React, { useState } from "react";
import { ArrowLeft, Search, MapPin, Phone, Fish, User, Calendar, Layers, Award, Waves, Sparkles } from "lucide-react";

interface FishFarm {
  id: string;
  name: string;
  location: string;
  phone: string;
  owner: string;
  established: string;
  category: "হ্যাচারী ও পোনা" | "বাণিজ্যিক মাছ চাষ" | "উন্মুক্ত জলাশয়";
  fishTypes: string[];
  size: string;
  status: "পোনা ও মাছ বিক্রয় চলছে" | "মৌসুমি মাছ বিক্রয়" | "বুকিং চলছে";
  features: string[];
}

const FISH_FARM_LIST: FishFarm[] = [
  {
    id: "ff_1",
    name: "মেসার্স রূপালী মৎস্য হ্যাচারী ও খামার",
    location: "ঝলমলিয়া, পুঠিয়া, রাজশাহী",
    phone: "01711-409876",
    owner: "আলহাজ্ব মোঃ শফিকুল ইসলাম",
    established: "২০০২",
    category: "হ্যাচারী ও পোনা",
    fishTypes: ["রুই", "কাতলা", "মৃগেল", "সিলভার কার্প", "চিতল মাছের রেনু ও পোনা"],
    size: "২০ একর (৭টি বড় পুকুর ও আধুনিক হ্যাচারী কমপ্লেক্স)",
    status: "পোনা ও মাছ বিক্রয় চলছে",
    features: ["রাজশাহী বিভাগের অন্যতম বৃহৎ বেসরকারি হ্যাচারী", "আধুনিক মাটি ও পানি পরীক্ষাগার", "উন্নত ব্রুড ব্যাংক সুবিধা"]
  },
  {
    id: "ff_2",
    name: "মা আয়েশা ফিশারিজ ও অ্যাগ্রো প্রোজেক্ট",
    location: "বেলপুকুর বাজার সংলগ্ন, পুঠিয়া, রাজশাহী",
    phone: "01724-883399",
    owner: "মোঃ হাসিবুর রহমান",
    established: "২০১১",
    category: "বাণিজ্যিক মাছ চাষ",
    fishTypes: ["দেশি শিং", "মাগুর", "গুলশা", "ট্যাংরা", "পাবদা মাছ"],
    size: "৮ একর (৪টি বাণিজ্যিক নিবিড় চাষ পুকুর)",
    status: "বুকিং চলছে",
    features: ["আধুনিক ক্যাটফিশ চাষ পদ্ধতি", "উন্নত মানের পোনা সরবরাহ নিশ্চয়তা", "নিজস্ব ভাসমান ফিড বা খাদ্য উৎপাদন ইউনিট"]
  },
  {
    id: "ff_3",
    name: "ধোপাপাড়া মৎস্য খামার ও নার্সারি",
    location: "ধোপাপাড়া বিল রোড, পুঠিয়া, রাজশাহী",
    phone: "01715-334455",
    owner: "মোঃ আব্দুল আলিম",
    established: "২০০৯",
    category: "বাণিজ্যিক মাছ চাষ",
    fishTypes: ["থাই পাঙ্গাশ", "মনোসেক্স তেলাপিয়া", "কার্প জাতীয় মিশ্র মাছ"],
    size: "১২ একর (৫টি বড় দিঘি)",
    status: "পোনা ও মাছ বিক্রয় চলছে",
    features: ["স্বল্প খরচে বৈজ্ঞানিক উপায়ে অধিক ফলন", "উপজেলা পর্যায়ে শ্রেষ্ঠ মৎস্য চাষী পুরস্কারপ্রাপ্ত", "বিনামূল্যে মৎস্য চাষীদের কারিগরি পরামর্শ"]
  },
  {
    id: "ff_4",
    name: "গ্রীন অ্যাগ্রো অ্যান্ড ফিশারিজ প্রোজেক্ট",
    location: "শিবপুর, পুঠিয়া, রাজশাহী",
    phone: "01733-556611",
    owner: "ইঞ্জিনিয়ার মোঃ আশরাফুল হক",
    established: "২০১৫",
    category: "বাণিজ্যিক মাছ চাষ",
    fishTypes: ["রুই-কাতলা মিক্স চাষ", "থাই পাঙ্গাশ", "গ্রাস কার্প ও কার্পিও"],
    size: "১৫ একর (সংযুক্ত হাঁস ও মৎস্য সমন্বিত চাষ প্রকল্প)",
    status: "পোনা ও মাছ বিক্রয় চলছে",
    features: ["হাঁস ও মাছের পরিবেশবান্ধব সমন্বিত চাষ", "শতভাগ কেমিক্যালমুক্ত প্রাকৃতিক খাদ্য ব্যবহার", "বায়ো-সিকিউরিটি সম্বলিত আধুনিক খামার"]
  },
  {
    id: "ff_5",
    name: "বিল ঝলমলিয়া মৎস্য সমবায় সোসাইটি",
    location: "ঝলমলিয়া বিল এলাকা, পুঠিয়া, রাজশাহী",
    phone: "01712-113355",
    owner: "সমবায় সমিতি (সভাপতি: মোঃ আমিনুল ইসলাম)",
    established: "১৯৯৫",
    category: "উন্মুক্ত জলাশয়",
    fishTypes: ["দেশীয় রুই-কাতলা", "চিতল", "শোল", "গজার", "মলা-ডেলা ও পুঁটি মাছ"],
    size: "৮০ একর বিল জলাশয়",
    status: "মৌসুমি মাছ বিক্রয়",
    features: ["বিল নার্সারি ও প্রাকৃতিক প্রজনন পদ্ধতি", "দেশীয় বিলুপ্তপ্রায় প্রজাতির মাছ সংরক্ষণ", "স্থানীয় ১০০+ মৎস্যজীবী পরিবারের কর্মসংস্থান"]
  }
];

export function FishFarmInfo({ onGoBack }: { onGoBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "হ্যাচারী ও পোনা" | "বাণিজ্যিক মাছ চাষ" | "উন্মুক্ত জলাশয়">("all");

  const filtered = FISH_FARM_LIST.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.fishTypes.some(fish => fish.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Dynamic ocean gradient banner */}
      <div className="bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-700 p-6 text-white rounded-3xl shadow-lg relative overflow-hidden">
        {/* Decorative elements representing bubbles and waves */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 pointer-events-none" />
        <div className="absolute right-1/3 top-1/2 w-16 h-16 bg-white/10 rounded-full pointer-events-none animate-pulse" />

        <button 
          onClick={onGoBack} 
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer mb-6 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Fish className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cyan-100 font-bold bg-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
              <Waves className="w-3 h-3" /> নীল বিপ্লব ও মৎস্য সম্পদ
            </span>
            <h1 className="text-2xl font-black mt-1">মৎস্য খামার ও হ্যাচারী</h1>
          </div>
        </div>
      </div>
      
      <div className="px-4 space-y-4">
        {/* Search Bar & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="খামারের নাম, এলাকা বা উৎপাদিত মাছ দিয়ে খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-white shadow-xs focus:ring-2 focus:ring-sky-500 text-sm placeholder-gray-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-4 gap-2 px-1">
            {[
              { id: "all", label: "সব প্রকল্প", emoji: "🐟" },
              { id: "হ্যাচারী ও পোনা", label: "হ্যাচারী", emoji: "🐠" },
              { id: "বাণিজ্যিক মাছ চাষ", label: "মাছ চাষ", emoji: "🎣" },
              { id: "উন্মুক্ত জলাশয়", label: "জলাশয়", emoji: "🌊" }
            ].map(tab => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                    isActive
                      ? "bg-sky-600 text-white border-sky-600 shadow-md"
                      : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
                  <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fish Farm Cards Grid */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map(f => (
              <div 
                key={f.id} 
                className="p-5 bg-white border border-gray-100 rounded-3xl shadow-xs flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                {/* Floating Status & Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
                    <Waves className="w-3 h-3 text-sky-500" /> {f.category}
                  </span>
                  
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    f.status === "পোনা ও মাছ বিক্রয় চলছে" 
                      ? "bg-green-500 text-white animate-pulse" 
                      : f.status === "বুকিং চলছে"
                      ? "bg-amber-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}>
                    ● {f.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-800 leading-snug flex items-start gap-2">
                    <Fish className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    {f.name}
                  </h3>
                  
                  <div className="mt-3 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{f.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>উদ্যোক্তা/মালিক: <span className="font-semibold text-gray-700">{f.owner}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>মোট আয়তন: <span className="font-semibold text-gray-700">{f.size}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>স্থাপিত: <span className="font-semibold text-gray-700">{f.established} খ্রি.</span></span>
                    </div>
                  </div>
                </div>

                {/* Cultivated Fish Types */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                    🐟 উৎপাদিত মাছ ও পোনা
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {f.fishTypes.map((fish, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-slate-200">
                        {fish}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Outstanding Features */}
                <div className="bg-cyan-50/30 p-3 rounded-2xl border border-cyan-100/30">
                  <span className="text-[10px] uppercase font-bold text-cyan-700/80 block mb-1.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-cyan-600" /> খামারের বিশেষ বৈশিষ্ট্য
                  </span>
                  <div className="space-y-1">
                    {f.features.map((feat, idx) => (
                      <div key={idx} className="text-[10px] font-semibold text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Action Button */}
                <a 
                  href={`tel:${f.phone}`}
                  className="flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 py-2.5 rounded-xl font-bold text-xs transition border border-sky-100 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" /> যোগাযোগ ও বুকিং করতে কল করুন: {f.phone}
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm font-semibold text-gray-500">কোন মৎস্য প্রকল্প পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড লিখে অনুসন্ধান করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { ArrowLeft, Landmark, Grid, Compass, Sparkles, Search, MapPin, CheckCircle2, AlertTriangle, Eye, HelpCircle } from "lucide-react";

interface Temple {
  id: string;
  name: string;
  banglaName: string;
  builder: string;
  year: string;
  style: string;
  description: string;
  category: "terracotta" | "shiva" | "rath" | "other";
  details: string[];
  tips: string;
  location: string;
}

const ALL_TEMPLES: Temple[] = [
  {
    id: "shiva",
    name: "Bhubaneshwar Shiva Temple",
    banglaName: "ভুবনেশ্বর বড় শিব মন্দিরসমূহ",
    builder: "মহারানী ভুবনময়ী দেবী",
    year: "১৮২৩ খ্রিস্টাব্দ",
    style: "পঞ্চরত্ন (পাঁচ চূড়া বিশিষ্ট) স্থাপত্যশৈলী",
    category: "shiva",
    description: "বাংলাদেশের সবচেয়ে বড় এবং অন্যতম সুউচ্চ প্রাচীন শিব মন্দির। এটি একটি বিশাল দীঘির উত্তর-পশ্চিম পাড়ে চমৎকার উঁচুমঞ্চের ওপর নির্মিত।",
    details: [
      "এর গর্ভগৃহে কষ্টিপাথরের একটি প্রকাণ্ড রাজকীয় শিবলিঙ্গ রয়েছে যা দর্শনার্থীদের প্রধান আকর্ষণ।",
      "চার কোণায় ৪টি এবং কেন্দ্রে ১টি সহ মোট ৫টি সুউচ্চ অলংকৃত চূড়া বা রত্ন রয়েছে।",
      "ইটের তৈরি চমৎকার দেয়ালের গায়ে চমৎকার পলেস্তারা ও খিলান তোরণের নকশা রয়েছে।"
    ],
    tips: "মূল শিবলিঙ্গ প্রাঙ্গণে প্রবেশের সময় জুতো খুলে প্রবেশ করা বাধ্যতামূলক। গর্ভগৃহের ভেতরে ফ্ল্যাশ জ্বালিয়ে ছবি তোলা থেকে বিরত থাকুন।",
    location: "পুঠিয়া রাজবাড়ী কমপ্লেক্সের উত্তর-পূর্ব কোণে, শিব সরোবর দীঘির পাড়ে।"
  },
  {
    id: "govinda",
    name: "Pancharatna Govinda Temple",
    banglaName: "পাঁচআনি পঞ্চরত্ন গোবিন্দ মন্দিরসমূহ",
    builder: "মহারানী প্রেমকুমারী দেবী / শরৎসুন্দরী দেবী",
    year: "উনিশ শতকের মাঝামাঝি",
    style: "টেরাকোটা অলঙ্কৃত পঞ্চরত্ন স্থাপত্য",
    category: "terracotta",
    description: "পুঠিয়া রাজবাড়ীর ভেতরের চত্বরে অবস্থিত টেরাকোটা বা পোড়ামাটির ফলকচিত্রের বিস্ময়কর ও চোখধাঁধানো এক মাস্টারপিস স্থাপত্য।",
    details: [
      "মন্দিরের বাইরের চারদিকের দেওয়ালে রামায়ণ, মহাভারত ও শ্রীকৃষ্ণের লীলারীতির সূক্ষ্ম পোড়ামাটির ফলক খোদাই করা আছে।",
      "মুঘল আমলের সামাজিক জীবন, যুদ্ধজাহাজ ও হাতি-ঘোড়ার চমৎকার চিত্র ফুটিয়ে তোলা হয়েছে।",
      "কোণাকুণি ৫টি পিরামিড আকারের শিখর রয়েছে যা একে অনন্য আভিজাত্য দান করেছে।"
    ],
    tips: "টেরাকোটার দেয়ালে হাত দিয়ে স্পর্শ করা বা কোনো স্ক্র্যাচ কাটা আইনত দণ্ডনীয় অপরাধ। দূর থেকে ছবি তোলাই বাঞ্ছনীয়।",
    location: "পুঠিয়া পাঁচআনি রাজপ্রাসাদের মূল বাউন্ডারির ঠিক ভেতরে পশ্চিম প্রান্তে।"
  },
  {
    id: "jagannath",
    name: "Jagannath Rath Temple",
    banglaName: "জগন্নাথ রথ মন্দিরসমূহ",
    builder: "পুঠিয়ার রাজপরিবার",
    year: "১৮৩০ সালের দিকে",
    style: "উত্তরের ‘একবাংলা’ চালা ঘরানা শৈলী",
    category: "rath",
    description: "জগন্নাথ দেবের রথযাত্রা উৎসবের জন্য নির্মিত একটি অতি চমৎকার এবং বিরল কাঠামোর একবাংলা শৈলীর মন্দির।",
    details: [
      "এর ছাদটি সাধারণ কুঁড়েঘরের দোচালা খড়ের চালের মতো নান্দনিকভাবে বাঁকানো কার্নিশের আকারে গড়া।",
      "সম্মুখভাগে রাধাকৃষ্ণ ও গোপীদের পোড়ামাটির চমৎকার চিত্র খোদাই করা আছে।",
      "পুঠিয়ার মন্দিরসমূহের মধ্যে এটি এক কোণে অত্যন্ত শান্ত ও সবুজ ঘেরা পরিবেশে দাঁড়িয়ে আছে।"
    ],
    tips: "রথযাত্রা ও উৎসবের দিনে এখানে প্রচুর লোকসমাগম হয়। শান্ত পরিবেশে ছবি তুলতে চাইলে বিকালের দিকে যাওয়া উত্তম।",
    location: "প্রধান বড় শিব মন্দিরের ঠিক পূর্ব পাশে, পুকুর পাড়ের লিংক রোডে।"
  },
  {
    id: "dolmancha",
    name: "Pyramid Dol Mancha",
    banglaName: "পিরামিড আকৃতির দোলমঞ্চ মন্দিরসমূহ",
    builder: "রাজা আনন্দ নারায়ণ রায়",
    year: "১৭৭৮ খ্রিস্টাব্দ",
    style: "ধাপে ধাপে নির্মিত বহুতল পিরামিড স্টাইল",
    category: "other",
    description: "বসন্ত পূর্ণিমার দোল উৎসবে আবির খেলা এবং রাধাকৃষ্ণের প্রতিমা দোলানোর জন্য তৈরি একটি অনন্য বহুতল মঞ্চ স্থাপত্য।",
    details: [
      "এটি ধাপে ধাপে ওপরে উঠে যাওয়া ৪ তলা বিশিষ্ট একটি পিরামিড সদৃশ স্থাপত্য কর্ম।",
      "এর প্রতি তলায় খিলানযুক্ত তোরণ বা দরজা রয়েছে যাতে দর্শনার্থীরা চারপাশ থেকেই দৃশ্যমান হতে পারে।",
      "রাজবাড়ীর বিশাল খেলার মাঠের একেবারে কেন্দ্রস্থলে এটি রাজকীয় গৌরবে দৃশ্যমান।"
    ],
    tips: "দোলমঞ্চের ওপরে ওঠার সিঁড়িগুলো খুব খাড়া এবং সরু, তাই ওপরে ওঠার সময় সাবধানতা অবলম্বন করুন এবং বাচ্চাদের একা ছাড়বেন না।",
    location: "পুঠিয়া রাজপ্রাসাদের প্রধান সিংহ তোরণ গেটের ঠিক মুখোমুখি বিশাল খেলার মাঠের মধ্যিখানে।"
  },
  {
    id: "ahnik",
    name: "Bara Ahnik Temple",
    banglaName: "বড় আহ্নিক মন্দিরসমূহ",
    builder: "পুঠিয়ার রাজন্যবর্গ",
    year: "১৭-১৮ শতক",
    style: "ত্রিপল দোচালা ঘরানা শৈলী",
    category: "terracotta",
    description: "রাজপরিবারের দৈনিক পূজা-আহ্নিক ও প্রার্থনার জন্য নির্মিত একটি বিরল শৈলীর একতলা টেরাকোটা মন্দির।",
    details: [
      "পাশাপাশি ৩টি দোচালা ঘরের সমন্বয়ে গঠিত ছাদ বিশিষ্ট স্থাপত্য যা বাংলায় খুবই বিরল।",
      "দেওয়ালজুড়ে চমৎকার পোড়ামাটির অলংকরণ ও লতাপাতার মোটিফ রয়েছে।",
      "এটি রাজপরিবারের গভীর ধার্মিকতা ও সূক্ষ্ম শিল্পবোধ্যতার চমৎকার প্রমাণ।"
    ],
    tips: "মন্দিরের আশপাশে কোনো প্লাস্টিক বা ময়লা আবর্জনা ফেলবেন না, প্রত্নতাত্ত্বিক পবিত্রতা বজায় রাখুন।",
    location: "গোবিন্দ মন্দিরের উত্তর-পশ্চিম দিকে সামান্য হাঁটা দূরত্বে।"
  },
  {
    id: "gopal",
    name: "Gopal Mandir",
    banglaName: "গোপাল মন্দির (রাধাকৃষ্ণ মন্দির)",
    builder: "রানী শরৎসুন্দরী দেবী",
    year: "১৮ শতকের শেষভাগ",
    style: "সমতল ছাদ ও চমৎকার তোরণ বিশিষ্ট",
    category: "other",
    description: "রাজপ্রাসাদের অন্দরের ঠাকুরবাড়ির অঙ্গনে স্থাপিত শ্রীকৃষ্ণ বা গোপাল জীউয়ের নিত্য সেবাপূজার মন্দির।",
    details: [
      "এটি তুলনামূলক সাধারণ স্থাপত্যের সমতল ছাদ বিশিষ্ট এবং সামনে খিলান তোরণ যুক্ত।",
      "এখানে রাজপরিবারের মহিলারা অত্যন্ত নিরাপদে নিত্যপূজা সম্পন্ন করতেন।",
      "এর চারপাশের শান্ত রাজকীয় দেয়াল ও সবুজ প্রাঙ্গণ পর্যটকদের প্রশান্তি দেয়।"
    ],
    tips: "এটি বর্তমানেও অনেক ভক্তদের জন্য সক্রিয় পূজাস্থল, তাই নীরবতা ও শ্রদ্ধা বজায় রাখুন।",
    location: "পুঠিয়া রাজবাড়ীর অন্দরমহল চত্বরের একদম ভেতর পাশে অবস্থিত।"
  }
];

interface HeritageTemplesInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function HeritageTemplesInfo({ onGoBack, hideHeader = false }: HeritageTemplesInfoProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "terracotta" | "shiva" | "rath" | "other">("all");
  const [visitedChecklist, setVisitedChecklist] = useState<Record<string, boolean>>({});

  // Load visited checklist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("puthia_visited_temples_checklist");
      if (saved) {
        setVisitedChecklist(JSON.parse(saved));
      } else {
        // Initialize
        const initial: Record<string, boolean> = {};
        ALL_TEMPLES.forEach((t) => { initial[t.id] = false; });
        setVisitedChecklist(initial);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleVisited = (templeId: string) => {
    const updated = { ...visitedChecklist, [templeId]: !visitedChecklist[templeId] };
    setVisitedChecklist(updated);
    try {
      localStorage.setItem("puthia_visited_temples_checklist", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTemples = ALL_TEMPLES.filter((temple) => {
    const matchesSearch = 
      temple.banglaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.builder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      temple.style.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || temple.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const visitedCount = Object.values(visitedChecklist).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-8 font-sans" id="heritage-temples-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #6D28D9, #4C1D95)" }}
        >
          <div className="space-y-3 max-w-2xl text-left">
            <span className="bg-white/20 backdrop-blur-md text-pink-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              ঐতিহাসিক টেরাকোটা শহর
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-white">
              ঐতিহাসিক মন্দির
            </h1>
            <p className="text-white/95 text-sm md:text-base leading-relaxed text-justify">
              পুঠিয়া রাজবংশের শাসনামলে নির্মিত এশিয়া মহাদেশের অন্যতম চমৎকার পোড়ামাটির (টেরাকোটা) মন্দিরগুলোর পূর্ণাঙ্গ নির্দেশিকা। একই স্থানে শিব, গোবিন্দ, জগন্নাথ ও রাধাকৃষ্ণের এত সুন্দর বৈচিত্র্যময় মন্দির সমাবেশ পৃথিবীতে বিরল।
            </p>
            
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={onGoBack}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border border-white/25 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </button>
              <div className="bg-white/15 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-pink-200">
                🏰 ইউনেস্কো স্ট্যান্ডার্ড প্রত্নতাত্ত্বিক জোন
              </div>
            </div>
          </div>

          {/* Dynamic visited meter circle/card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[170px] shrink-0 self-stretch flex flex-col justify-center items-center">
            <p className="text-xs text-purple-200 uppercase font-semibold">আপনার ভ্রমণ অগ্রগতি</p>
            <p className="text-4xl font-black text-yellow-300 mt-1">{visitedCount} / {ALL_TEMPLES.length}</p>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-yellow-400 h-full transition-all duration-500" 
                style={{ width: `${(visitedCount / ALL_TEMPLES.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-white/80 mt-2">মন্দির ঘুরে চেকলিস্টে টিক দিন</p>
          </div>
        </div>
      )}

      {/* 2. Interactive Search & Category Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="মন্দিরের নাম, নির্মাতা বা স্থাপত্যশৈলী দিয়ে খুঁজুন..."
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
          />
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
        </div>

        {/* Categories Grid */}
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", overflowX: "auto" }}>
          {[
            { id: "all", label: `⭐ সব মন্দির (${ALL_TEMPLES.length})`, icon: "⭐" },
            { id: "terracotta", label: "🧱 পোড়ামাটির শিল্প বা টেরাকোটা", icon: "🧱" },
            { id: "shiva", label: "🛕 শিব উপাসনালয়", icon: "🛕" },
            { id: "rath", label: "🛖 একবাংলা ও রথ মন্দিরসমূহ", icon: "🛖" },
            { id: "other", label: "🎪 দোলমঞ্চ ও অন্যান্য", icon: "🎪" },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                style={{
                  flex: 1,
                  minWidth: "120px",
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
                <div style={{ fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                  {cat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Temples List */}
      <div className="space-y-6">
        {filteredTemples.length > 0 ? (
          filteredTemples.map((temple) => {
            const isVisited = !!visitedChecklist[temple.id];
            return (
              <div 
                key={temple.id} 
                className="bg-white rounded-3xl p-5 md:p-6 border border-slate-150/70 shadow-sm hover:shadow-md transition-all duration-350 relative overflow-hidden flex flex-col md:flex-row gap-5"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#6D28D9]"></div>

                {/* Left: General Info & Description */}
                <div className="flex-1 space-y-4 pl-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="font-serif font-black text-slate-900 text-lg md:text-xl leading-tight">
                        {temple.banglaName}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold tracking-wide uppercase font-mono">
                        {temple.name}
                      </p>
                    </div>

                    {/* Visited Checkbox */}
                    <button
                      onClick={() => toggleVisited(temple.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-inner border cursor-pointer ${
                        isVisited 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isVisited ? "text-emerald-600" : "text-slate-400"}`} />
                      <span>{isVisited ? "আমার ভ্রমণকৃত" : "ভ্রমণ করেছি?"}</span>
                    </button>
                  </div>

                  <p className="text-slate-650 text-xs md:text-sm font-medium leading-relaxed text-justify">
                    {temple.description}
                  </p>

                  {/* Fact sheet specs */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">নির্মাণকারী ও সাল</span>
                      <span className="text-xs text-slate-700 font-extrabold">{temple.builder} ({temple.year})</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">স্থাপত্যশৈলী</span>
                      <span className="text-xs text-slate-700 font-extrabold">{temple.style}</span>
                    </div>
                  </div>

                  {/* Bullet specifics */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-[#6D28D9] block">📌 প্রধান স্থাপত্য নিদর্শন ও বৈশিষ্ট্য:</span>
                    <ul className="space-y-1 pl-1">
                      {temple.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5 leading-relaxed text-justify">
                          <span className="text-[#6D28D9] mt-0.5 shrink-0">✦</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Tourist Tips & Action Area */}
                <div className="w-full md:w-[260px] bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">ভ্রমণকারীদের জন্য জরুরি পরামর্শ:</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed text-justify bg-white p-3 rounded-xl border border-slate-150/50">
                      {temple.tips}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500 font-semibold flex items-start gap-1.5 p-2 bg-slate-100 rounded-xl leading-normal text-justify">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{temple.location}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
            <span className="text-5xl block">🔍</span>
            <h4 className="font-serif font-bold text-lg text-slate-800">কোনো মন্দির খুঁজে পাওয়া যায়নি!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              আপনার অনুসন্ধানকৃত তথ্যের সাথে মেলে এমন কোনো প্রাচীন মন্দির পাওয়া যায়নি। দয়া করে সঠিক বানান বা ভিন্ন কীওয়ার্ড ব্যবহার করে চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>

      {/* 4. General Historical Advisory Panel */}
      <div className="bg-[#4C1D95] text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-serif font-black text-lg">আমাদের প্রত্নতাত্ত্বিক সম্পদ আমাদের গৌরব</h4>
          <p className="text-white/80 text-xs font-semibold">
            পুঠিয়ার ঐতিহাসিক টেরাকোটা মন্দিরগুলো এ দেশের জাতীয় সম্পদ। এগুলো সংরক্ষণ করা এবং পরিষ্কার রাখা প্রতিটি পর্যটকের দায়িত্ব।
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-full text-xs font-bold shrink-0 border border-white/10 text-pink-300">
          🛡️ বাংলাদেশ প্রত্নতত্ত্ব অধিদপ্তর কর্তৃক সংরক্ষিত
        </div>
      </div>

    </div>
  );
}

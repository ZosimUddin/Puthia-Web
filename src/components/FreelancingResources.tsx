import React, { useState } from "react";
import { 
  ArrowLeft, 
  Globe, 
  Wrench, 
  Download, 
  ChevronRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  ExternalLink, 
  Code, 
  Palette, 
  Megaphone, 
  Briefcase,
  Layers,
  FileText,
  UserCheck,
  Video,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface Props { onGoBack: () => void; }

interface ToolLink {
  name: string;
  category: "design" | "dev" | "marketing" | "marketplace" | "learning";
  desc: string;
  url: string;
  iconName: "Palette" | "Code" | "Megaphone" | "Briefcase" | "Video";
}

const toolsData: ToolLink[] = [
  {
    name: "Figma (ফিটমা)",
    category: "design",
    desc: "ইউজার ইন্টারফেস (UI/UX) ও গ্রাফিক্স ডিজাইনের আধুনিক স্ট্যান্ডার্ড ক্লাউড টুল।",
    url: "https://www.figma.com",
    iconName: "Palette"
  },
  {
    name: "Freepik (ফ্রিপিক)",
    category: "design",
    desc: "ডিজাইনের জন্য ফ্রি ভেক্টর, আইকন ও হাই-কোয়ালিটি পিএসডি স্টক ডাউনলোড সাইট।",
    url: "https://www.freepik.com",
    iconName: "Palette"
  },
  {
    name: "Visual Studio Code",
    category: "dev",
    desc: "ওয়েব ডেভেলপমেন্ট ও কোডিং শেখার জন্য বিশ্বের সবচেয়ে সেরা কোড এডিটর।",
    url: "https://code.visualstudio.com",
    iconName: "Code"
  },
  {
    name: "GitHub (গিটহাব)",
    category: "dev",
    desc: "ডেভেলপারদের জন্য কোড হোস্ট ও পোর্টফোলিও শেয়ার করার সবচেয়ে জনপ্রিয় প্ল্যাটফর্ম।",
    url: "https://github.com",
    iconName: "Code"
  },
  {
    name: "Canva (ক্যানভা)",
    category: "design",
    desc: "সহজ উপায়ে গ্রাফিক্স, সোশ্যাল মিডিয়া পোস্টার ও ব্যানার ডিজাইনের টুল।",
    url: "https://www.canva.com",
    iconName: "Palette"
  },
  {
    name: "Google Digital Garage",
    category: "marketing",
    desc: "গুগলের অফিসিয়াল ফ্রি ডিজিটাল মার্কেটিং কোর্স ও সার্টিফিকেট অর্জন।",
    url: "https://learndigital.withgoogle.com",
    iconName: "Megaphone"
  },
  {
    name: "Fiverr (ফাইভার)",
    category: "marketplace",
    desc: "নতুনদের জন্য ৫ ডলার থেকে শুরু হওয়া সবচেয়ে বড় গিগ-ভিত্তিক ফ্রিল্যান্সিং মার্কেটপ্লেস।",
    url: "https://www.fiverr.com",
    iconName: "Briefcase"
  },
  {
    name: "Upwork (আপওয়ার্ক)",
    category: "marketplace",
    desc: "প্রফেশনালদের জন্য আওয়ারলি রেট ও প্রজেক্ট-ভিত্তিক সবচেয়ে নির্ভরযোগ্য মার্কেটপ্লেস।",
    url: "https://www.upwork.com",
    iconName: "Briefcase"
  },
  {
    name: "ফ্রিল্যান্সিং টিউটোরিয়াল (YouTube)",
    category: "learning",
    desc: "বাংলাদেশী টপ মেন্টরদের সম্পূর্ণ বাংলা ফ্রিল্যান্সিং লার্নিং প্লে-লিস্ট ও গাইডলাইন।",
    url: "https://www.youtube.com/results?search_query=freelancing+course+bangla+for+beginners",
    iconName: "Video"
  }
];

export const FreelancingResources: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"guide" | "tools">("guide");
  const [activeRoadmapSkill, setActiveRoadmapSkill] = useState<"web" | "graphics" | "marketing">("web");
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredTools = toolsData.filter(tool => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.desc.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDownloadRoadmap = () => {
    showToast("রোডম্যাপ পিডিএফ/টেক্সট ফাইল প্রস্তুত হচ্ছে...");
    setTimeout(() => {
      const content = `===========================================================
  🖥️ পুঠিয়া উপজেলা দক্ষতা উন্নয়ন সেল - সম্পূর্ণ ফ্রিল্যান্সিং গাইডলাইন
===========================================================
  ধাপ ১: সঠিক স্কিল নির্বাচন (Choose Your Niche)
  ---------------------------------------------------------
  ১. ওয়েব ডিজাইন ও ডেভেলপমেন্ট (HTML, CSS, JS, React, Node.js)
  ২. গ্রাফিক্স ডিজাইন ও ইউআই/ইউএক্স (Photoshop, Illustrator, Figma)
  ৩. ডিজিটাল মার্কেটিং ও এসইও (SMM, SEO, Content Marketing)

  ধাপ ২: প্রফেশনাল পোর্টফোলিও তৈরি (Build a Strong Portfolio)
  ---------------------------------------------------------
  - আপনি যা শিখেছেন তার নুন্যতম ৫-১০টি বাস্তব কাজ/প্রজেক্ট তৈরি করুন।
  - ডিজাইনার হলে Behance/Dribbble এ এবং কোডার হলে GitHub এ শেয়ার করুন।
  - একটি নিজস্ব পোর্টফোলিও ওয়েবসাইট তৈরি করুন (যেমন: GitHub Pages দিয়ে ফ্রি)।

  ধাপ ৩: মার্কেটপ্লেস প্রস্তুতি (Marketplace Readiness)
  ---------------------------------------------------------
  - Fiverr এ প্রফেশনাল গিগ (Gig) ও ডেসক্রিপশন সেটআপ করুন।
  - Upwork এ আকর্ষণীয় কাভার লেটার ও প্রোফাইল ১০০% সম্পন্ন করুন।
  - সোশ্যাল মিডিয়া (LinkedIn) দিয়ে সরাসরি ক্লায়েন্ট খোঁজার চেষ্টা করুন।

  ধাপ ৪: ক্লায়েন্ট কমিউনিকেশন ও বিডিং (Client Communication)
  ---------------------------------------------------------
  - ইংরেজিতে সহজ ভাষায় কথা বলতে ও প্রজেক্ট বুঝতে পারার দক্ষতা অর্জন করুন।
  - ক্লায়েন্টকে কাজের বিস্তারিত ডেমো এবং কাজের সমাধান উপস্থাপন করুন।

  দরকারী লিঙ্ক:
  - ফাইভ স্টার প্রোফাইল টিপস: fiverr.com
  - কাজ খোঁজার গাইডলাইন: upwork.com
  - ফ্রি ভিডিও লার্নিং: YouTube Search "Freelancing Bangla Guide"

  অনুরোধে:
  উপজেলা নির্বাহী অফিসার ও পুঠিয়া উপজেলা আইসিটি সেল, রাজশাহী।
===========================================================`;

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Puthia_Freelancing_Roadmap.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("রোডম্যাপ সফলভাবে ডাউনলোড হয়েছে!");
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-full shadow-2xl z-50 flex items-center gap-2 border border-cyan-400"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <UnifiedHeroHeader
        badgeText="স্মার্ট কর্মসংস্থান"
        title="ফ্রিল্যান্সিং গাইড ও রিসোর্স"
        subtitle="গ্রাফিক্স ডিজাইন, ওয়েব ডেভেলপমেন্ট, ডিজিটাল মার্কেটিং ও ফ্রিল্যান্সিং শেখার ফ্রি গাইডলাইন ও দরকারি টুলের তালিকা।"
        icon={<Sparkles size={20} />}
        showBack={true}
        onBack={onGoBack}
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="টুলস বা ক্যাটাগরি দিয়ে খুঁজুন..."
        rightAction={
          <button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery("");
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
              showSearch 
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-[#172e6e]" 
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            }`}
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("guide")}
            id="tab-btn-guide"
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "guide"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Globe className={`w-4 h-4 ${filter === "guide" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            নতুনদের গাইডলাইন
          </button>
          <button
            onClick={() => setFilter("tools")}
            id="tab-btn-tools"
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "tools"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Wrench className={`w-4 h-4 ${filter === "tools" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            প্রয়োজনীয় টুলস ও লিংক
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="space-y-4">
          {filter === "guide" ? (
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-4 relative overflow-hidden animate-fade-in hover:border-[#22d3ee]/30 transition-all hover:shadow-lg">
              <span className="text-[10px] font-black text-[#0f766e] bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider self-start">
                ক্যারিয়ার রোডম্যাপ
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-800 leading-snug">কীভাবে ফ্রিল্যান্সিং শুরু করবেন?</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  সঠিক স্কিল নির্বাচন এবং মার্কেটপ্লেস (Fiverr/Upwork) প্রোফাইল সেটআপের সম্পূর্ণ রোডম্যাপ।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                  onClick={() => setShowRoadmapModal(true)}
                  id="btn-complete-roadmap"
                  className="py-3 px-2 text-xs font-extrabold text-slate-900 bg-[#22d3ee] rounded-xl hover:bg-cyan-300 transition-all shadow-md shadow-cyan-300/30 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                >
                  সম্পূর্ণ রোডম্যাপ <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownloadRoadmap}
                  id="btn-free-download"
                  className="py-3 px-2 text-xs font-extrabold text-[#0f766e] bg-teal-50 rounded-xl hover:bg-teal-100 transition-all border border-teal-100 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" /> ফ্রি ডাউনলোড
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-cyan-50/60 rounded-2xl p-4 border border-cyan-100 text-xs text-cyan-800 font-medium leading-relaxed">
                🚀 নিচে ফ্রিল্যান্সিং, গ্রাফিক্স ডিজাইন এবং ওয়েব ডেভেলপমেন্ট শেখার জন্য অত্যন্ত প্রয়োজনীয় ফ্রি ওয়েবসাইট ও অফিসিয়াল লিংক দেওয়া হলো।
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTools.map((tool, idx) => {
                  let Icon = Palette;
                  if (tool.iconName === "Code") Icon = Code;
                  if (tool.iconName === "Megaphone") Icon = Megaphone;
                  if (tool.iconName === "Briefcase") Icon = Briefcase;
                  if (tool.iconName === "Video") Icon = Video;

                  return (
                    <div 
                      key={idx}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-cyan-200 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex gap-3">
                        <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0 self-start">
                          <Icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800">{tool.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-normal">{tool.desc}</p>
                        </div>
                      </div>
                      <a 
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-xl transition-all flex items-center justify-center gap-1 text-center border border-teal-100/50"
                      >
                        ভিজিট করুন <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED INTERACTIVE ROADMAP MODAL */}
      <AnimatePresence>
        {showRoadmapModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#22d3ee]" />
                  <div>
                    <h3 className="text-sm font-black text-white">সম্পূর্ণ ফ্রিল্যান্সিং গাইড ও রোডম্যাপ</h3>
                    <p className="text-[10px] text-gray-300 font-medium">ক্যারিয়ার বিল্ডআপ ও সঠিক দিকনির্দেশনা</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRoadmapModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Skill Tabs Selector */}
              <div className="bg-slate-50 p-2 border-b border-slate-200/60 shrink-0 grid grid-cols-3 gap-1">
                <button
                  onClick={() => setActiveRoadmapSkill("web")}
                  className={`py-2 text-[10px] font-black rounded-lg transition-all outline-none cursor-pointer ${
                    activeRoadmapSkill === "web"
                      ? "bg-teal-600 text-white"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  💻 ওয়েব ডেভেলপমেন্ট
                </button>
                <button
                  onClick={() => setActiveRoadmapSkill("graphics")}
                  className={`py-2 text-[10px] font-black rounded-lg transition-all outline-none cursor-pointer ${
                    activeRoadmapSkill === "graphics"
                      ? "bg-teal-600 text-white"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🎨 গ্রাফিক্স ডিজাইন
                </button>
                <button
                  onClick={() => setActiveRoadmapSkill("marketing")}
                  className={`py-2 text-[10px] font-black rounded-lg transition-all outline-none cursor-pointer ${
                    activeRoadmapSkill === "marketing"
                      ? "bg-teal-600 text-white"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📢 ডিজিটাল মার্কেটিং
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-amber-50/10">
                {activeRoadmapSkill === "web" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">১</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">বেসিক ফ্রন্ট-এন্ড (১-২ মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          প্রথমে HTML5 এবং CSS3 ভালো করে শিখুন। এরপর আধুনিক CSS ফ্রেমওয়ার্ক হিসেবে <b>Tailwind CSS</b> আয়ত্ত করুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">২</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">জাভাস্ক্রিপ্ট ও রিয়্যাক্ট (২-৩ মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          জাভাস্ক্রিপ্ট (ES6+) এর বেসিক লজিক, DOM ম্যানিপুলেশন শিখুন এবং এরপর অত্যন্ত জনপ্রিয় <b>React.js</b> দিয়ে ইন্টারেক্টিভ অ্যাপস বানানো প্র্যাকটিস করুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৩</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">গিটহাব ও পোর্টফোলিও (৪র্থ মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          আপনার করা ৩-৫ টি প্রজেক্ট গিটহাবে আপলোড করুন এবং গিটহাব পেজেস দিয়ে ফ্রিতে লাইভ লিংক করুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৪</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">মার্কেটপ্লেস ও আর্নিং (৫ম মাস+)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          Fiverr এ "React Developer" হিসেবে প্রফেশনাল গিগ সাজান। Upwork-এ প্রজেক্ট ক্যাটালগ ও প্রপোজাল সাবমিট শুরু করুন।
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoadmapSkill === "graphics" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">১</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">সফটওয়্যার আয়ত্ত করা (১ম মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          Adobe Photoshop (ছবি এডিটিং/ম্যানিপুলেশন) এবং Adobe Illustrator (লোগো, ভেক্টর ও প্রিন্ট ডিজাইন) বেসিক ও অ্যাডভান্সড টুলস শিখুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">২</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">ডিজাইন থিওরি ও Figma (২য় মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          কালার কম্বিনেশন, টাইপোগ্রাফি ও লেআউট থিওরি জানুন। ওয়েব ও মোবাইল অ্যাপ ডিজাইনের জন্য অত্যন্ত ডিমান্ডিং Figma সফটওয়্যারটি শিখুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৩</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Behance পোর্টফোলিও (৩য় মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          আপনার সেরা কাজগুলো দিয়ে <b>Behance</b> অথবা Dribbble প্রোফাইল সুন্দর প্রেজেন্টেশনের মাধ্যমে সাজিয়ে তুলুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৪</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Fiverr গিগ ও কন্টেস্ট (৪র্থ মাস+)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          Freelancer.com এ লোগো/ব্যানার ডিজাইনের লাইভ কন্টেস্টে অংশ নিন। Fiverr ও Upwork এ পোর্টফোলিও দেখিয়ে প্রজেক্ট হান্টিং করুন।
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoadmapSkill === "marketing" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">১</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">সোশ্যাল মিডিয়া মার্কেটিং (১ম মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          Facebook, Instagram, LinkedIn অর্গানিক ও পেইড ক্যাম্পেইন সেটআপ করা শিখুন। বিজনেস পেজ অপ্টিমাইজেশন ও অ্যাড ম্যানেজার ব্যবহার শিখুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">২</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">সার্চ ইঞ্জিন অপ্টিমাইজেশন - SEO (২-৩ মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          On-Page SEO, Off-Page SEO (লিংক বিল্ডিং) এবং টেকনিক্যাল এসইও ভালোভাবে আয়ত্ত করুন। বিভিন্ন কি-ওয়ার্ড রিসার্চ টুলস ব্যবহার শিখুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৩</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">কনটেন্ট ও ইমেইল মার্কেটিং (৪র্থ মাস)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          আকর্ষণীয় সেলস কপিরাইটিং ও ইমেইল টেমপ্লেট ডিজাইন করে বাল্ক ইমেইল ক্যাম্পেইন সেটআপ করা প্র্যাকটিস করুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-teal-100 text-teal-800 font-black text-xs rounded-full flex items-center justify-center shrink-0">৪</div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">LinkedIn সরাসরি ক্লায়েন্ট ডিলিং (৫ম মাস+)</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          LinkedIn এ সরাসরি বিভিন্ন এজেন্সির ওনার বা ম্যানেজারদের পিচ করার মাধ্যমে পার্মানেন্ট বা ফ্রিল্যান্স রিমোট জব হাসিল করুন।
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button 
                  onClick={handleDownloadRoadmap}
                  className="flex-1 py-3 bg-teal-600 text-white font-extrabold text-xs rounded-xl hover:bg-teal-700 transition-colors cursor-pointer outline-none flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" /> অফলাইন গাইড ডাউনলোড করুন
                </button>
                <button 
                  onClick={() => setShowRoadmapModal(false)}
                  className="px-5 py-3 text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all cursor-pointer outline-none"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

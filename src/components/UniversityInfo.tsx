import React, { useState } from "react";
import { ArrowLeft, GraduationCap, MapPin, Phone, Globe, BookOpen, Clock, Award, ExternalLink } from "lucide-react";

export function UniversityInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"all" | "public" | "private" | "college_univ">("all");

  const universities = [
    {
      id: "u-1",
      name: "রাজশাহী বিশ্ববিদ্যালয় (Rajshahi University)",
      category: "public",
      location: "মতিহার, রাজশাহী (পুঠিয়া থেকে ২০ কি.মি.)",
      established: "১৯৫৩ খ্রিষ্টাব্দ",
      type: "পাবলিক সাধারণ বিশ্ববিদ্যালয়",
      faculties: "১২টি অনুষদ, ৫৯টি বিভাগ ও ৬টি ইনস্টিটিউট",
      phone: "০২৪৭৮৮৬০০০",
      website: "https://www.ru.ac.bd",
      details: "উত্তরবঙ্গের সর্বোচ্চ বিদ্যাপীঠ। পুঠিয়া উপজেলার সহস্রাধিক শিক্ষার্থী এখানে স্নাতক ও স্নাতকোত্তর পর্যায়ে অধ্যায়নরত।",
      image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "u-2",
      name: "রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (RUET)",
      category: "public",
      location: "কাজলা, রাজশাহী (পুঠিয়া থেকে ২১ কি.মি.)",
      established: "১৯৬৪ খ্রিষ্টাব্দ (বিশ্ববিদ্যালয় ২০০৩)",
      type: "পাবলিক প্রকৌশল বিশ্ববিদ্যালয়",
      faculties: "সিভিল, সিএসই, ট্রিপল-ই, মেকানিক্যালসহ ১৮টি বিভাগ",
      phone: "০২৫৮৮৮৬৫৫৫৫",
      website: "https://www.ruet.ac.bd",
      details: "দেশের অন্যতম শীর্ষস্থানীয় প্রকৌশল বিশ্ববিদ্যালয়।",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "u-3",
      name: "রাজশাহী কলেজ (অধিভুক্ত জাতীয় বিশ্ববিদ্যালয়)",
      category: "college_univ",
      location: "সাহেব বাজার, রাজশাহী",
      established: "১৮৭৩ খ্রিষ্টাব্দ",
      type: "জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত অনার্স-মার্স্টার্স কলেজ",
      faculties: "বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা (২৪টি বিষয়ে অনার্স ও মাস্টার্স)",
      phone: "০২৫৮৮৮৬২৬৬৬",
      website: "https://rc.edu.bd",
      details: "বাংলাদেশের শ্রেষ্ঠ ও ঐতিহ্যবাহী সরকারি কলেজ।",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "u-4",
      name: "বরেন্দ্র বিশ্ববিদ্যালয় (Varendra University)",
      category: "private",
      location: "বাইপাস ক্যাম্পাস, চন্দ্রিমা, রাজশাহী",
      established: "২০১২ খ্রিষ্টাব্দ",
      type: "বেসরকারি বিশ্ববিদ্যালয়",
      faculties: "সিএসই, ইইই, ইংরেজি, আইন, ফার্মেসি, বিজনেস ইত্যাদি",
      phone: "০১৭৩০-০৪৪৪৮৮",
      website: "https://vu.edu.bd",
      details: "রাজশাহী অঞ্চলের প্রথম অনুমোদিত আধুনিক প্রাইভেট ইউনিভার্সিটি।",
      image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "u-5",
      name: "পুঠিয়া ডিগ্রি কলেজ (ডিগ্রি ও অনার্স কোর্স)",
      category: "college_univ",
      location: "পুঠিয়া সদর, রাজশাহী",
      established: "১৯৭০ খ্রিষ্টাব্দ",
      type: "জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত কলেজ",
      faculties: "বিএ, বিএসএস, বিএসসি, বিবিএস ডিগ্রি এবং স্নাতক সম্মান কোর্স",
      phone: "০১৭২৪-৯৯৮৮৭৭",
      website: "http://puthiacollege.edu.bd",
      details: "পুঠিয়া উপজেলার প্রাণকেন্দ্রে অবস্থিত উচ্চশিক্ষার প্রধান কেন্দ্র।",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const filtered = universities.filter(u => activeTab === "all" || u.category === activeTab);

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-indigo-300 text-sm font-bold mb-1 uppercase tracking-wide">উচ্চশিক্ষা ও বিশ্ববিদ্যালয়</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">🎓 বিশ্ববিদ্যালয় ও মহাবিদ্যালয়</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-indigo-400/60 pl-3 py-1">
            পুঠিয়া শিক্ষার্থী ও আগ্রহীদের জন্য রাজশাহী বিশ্ববিদ্যালয়, রুয়েট, বরেন্দ্র বিশ্ববিদ্যালয় এবং অনার্স কলেজের বিস্তারিত তথ্য।
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          সকল বিশ্ববিদ্যালয়
        </button>
        <button
          onClick={() => setActiveTab("public")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "public" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          পাবলিক বিশ্ববিদ্যালয় (RU/RUET)
        </button>
        <button
          onClick={() => setActiveTab("college_univ")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "college_univ" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          অনার্স ও ডিগ্রি কলেজ
        </button>
        <button
          onClick={() => setActiveTab("private")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "private" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          বেসরকারি বিশ্ববিদ্যালয়
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
            <div className="flex flex-col sm:flex-row gap-4 items-start pl-2">
              <img 
                src={u.image} 
                alt={u.name}
                className="w-full sm:w-36 h-32 object-cover rounded-2xl flex-shrink-0 border border-gray-100"
              />
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 mb-1">
                  {u.type}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{u.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> {u.location}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl mb-3">
                  <b>অনুষদ ও বিভাগ:</b> {u.faculties} <br/>
                  <span className="text-gray-500">{u.details}</span>
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-gray-100">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" /> {u.phone}
                  </span>
                  <a 
                    href={u.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-xl hover:bg-indigo-100 transition"
                  >
                    ওয়েবসাইট দেখুন <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

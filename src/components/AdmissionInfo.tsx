import React, { useState } from "react";
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, ExternalLink, GraduationCap, HelpCircle, Info, Sparkles } from "lucide-react";

export function AdmissionInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeCategory, setActiveCategory] = useState<"all" | "xi_class" | "varsity" | "school">("all");

  const admissions = [
    {
      id: "adm-1",
      category: "xi_class",
      title: "একাদশ শ্রেণিতে অনলাইন ভর্তি আবেদন ২০২৬ (XI Class Admission)",
      authority: "বাংলাদেশ মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড",
      status: "চলতি আবেদন",
      startDate: "১ জুন ২০২৬",
      endDate: "২০ জুন ২০২৬",
      link: "http://xiclassadmission.gov.bd",
      description: "এসএসসি উত্তীর্ণ শিক্ষার্থীদের একাদশ শ্রেণিতে ভর্তির সেন্ট্রাল অনলাইন আবেদন। পছন্দক্রম অনুযায়ী পুঠিয়া মডেল স্কুল অ্যান্ড কলেজ, পুঠিয়া ডিগ্রি কলেজ ও পিএন সরকারি উচ্চ বিদ্যালয়ে আবেদন করা যাবে।",
      requirements: "এসএসসি/সমমান পাসের রোল, রেজিস্ট্রেশন নম্বর ও ১৫০ টাকা ফি সার্ভিস সুবিধায় প্রদান করতে হবে।"
    },
    {
      id: "adm-2",
      category: "varsity",
      title: "রাজশাহী বিশ্ববিদ্যালয় (RU) 'A', 'B', 'C' ইউনিট ভর্তি পরীক্ষা ২০২৬",
      authority: "রাজশাহী বিশ্ববিদ্যালয় ভর্তি কমিটি",
      status: "বিজ্ঞপ্তি প্রকাশিত",
      startDate: "১৫ জুলাই ২০২৬",
      endDate: "০৫ আগস্ট ২০২৬",
      link: "https://admission.ru.ac.bd",
      description: "গুচ্ছ ও সমন্বিত প্রক্রিয়ায় রাজশাহী বিশ্ববিদ্যালয়ের ৪ বছর মেয়াদী সম্মান (অনার্স) প্রথম বর্ষে ভর্তি বিজ্ঞপ্তি।",
      requirements: "এইচএসসি উত্তীর্ণ প্রার্থীরা ন্যূনতম জিপিএ ৩.৫০ (বিজ্ঞান/মানবিক/ব্যবসায় শিক্ষা) নিয়ে আবেদনযোগ্য।"
    },
    {
      id: "adm-3",
      category: "school",
      title: "পুঠিয়া উপজেলার সরকারি প্রাথমিক ও মাধ্যমিক বিদ্যালয় শিশু ভর্তি",
      authority: "উপজেলা প্রাথমিক ও মাধ্যমিক শিক্ষা অফিস, পুঠিয়া",
      status: "আসন্ন সেশন",
      startDate: "০১ ডিসেম্বর ২০২৬",
      endDate: "১৫ ডিসেম্বর ২০২৬",
      link: "https://gsa.teletalk.com.bd",
      description: "পুঠিয়ার সরকারি মাধ্যমিক বিদ্যালয়ে ৬ষ্ঠ থেকে ৯off শ্রেণিতে ডিজিটাল লটারির মাধ্যমে নতুন শিক্ষার্থী ভর্তি আবেদন।",
      requirements: "অনলাইন ফর্ম ও টেলিটক এসএমএস ফি ১১০ টাকা।"
    },
    {
      id: "adm-4",
      category: "varsity",
      title: "প্রকৌশল গুচ্ছ (RUET, CUET, KUET) বি.এসসি ইঞ্জিনিয়ারিং ভর্তি",
      authority: "কেন্দ্রীয় সমন্বয় কমিটি",
      status: "অনলাইন পোর্টাল উন্মুক্ত",
      startDate: "১০ মে ২০২৬",
      endDate: "৩০ মে ২০২৬",
      link: "https://ckruet.ac.bd",
      description: "রুয়েটসহ ৩ সরকারি প্রকৌশল বিশ্ববিদ্যালয়ে সমন্বিত ভর্তি পরীক্ষা।",
      requirements: "পদার্থ, রসায়ন ও গণিতে উচ্চ জিপিএ নম্বরধারী এসএসসি/এইচএসসি পাস শিক্ষার্থী।"
    }
  ];

  const filtered = admissions.filter(a => activeCategory === "all" || a.category === activeCategory);

  return (
    <div className="font-sans space-y-6 pb-8">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #047857, #065f46)" }}
      >
        <button 
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-emerald-200 text-sm font-bold mb-1 uppercase tracking-wide">শিক্ষার্থী তথ্য সেবা</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">📝 ভর্তি তথ্য পোর্টাল</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-emerald-300/60 pl-3 py-1">
            স্কুল, একাদশ শ্রেণি (XI Class), ডিগ্রি, অনার্সে ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার বিজ্ঞপ্তি ও অনলাইন লিংক।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "all" ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          সকল ভর্তি আপডেট
        </button>
        <button
          onClick={() => setActiveCategory("xi_class")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "xi_class" ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          একাদশ শ্রেণি ভর্তি (XI Class)
        </button>
        <button
          onClick={() => setActiveCategory("varsity")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "varsity" ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          বিশ্ববিদ্যালয় ও অনার্স ভর্তি
        </button>
        <button
          onClick={() => setActiveCategory("school")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeCategory === "school" ? "bg-emerald-700 text-white shadow-sm" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          স্কুল ও লটারি ভর্তি
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600"></div>
            <div className="pl-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                  {item.authority}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  {item.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl mb-3">
                {item.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 mb-3 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/50">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> <b>আবেদন শুরু:</b> {item.startDate}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> <b>শেষ তারিখ:</b> {item.endDate}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500 font-medium hidden sm:inline">
                  যোগ্যতা: {item.requirements}
                </span>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-4 py-1.5 rounded-xl transition inline-flex items-center gap-1 ml-auto"
                >
                  অনলাইনে আবেদন করুন <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

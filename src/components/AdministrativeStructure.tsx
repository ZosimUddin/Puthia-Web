import React, { useState } from "react";
import { ArrowLeft, Phone, MapPin, Mail, X, Check, Globe, Navigation, Shield, Award, Calendar, BookOpen, Star } from "lucide-react";

interface Props {
  onGoBack: () => void;
}

type AdminSectionType = "unions" | "villages" | "maps" | "leaders";

interface CardType {
  icon: string;
  label: string;
  detail: string;
}

interface SectionDataType {
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  cards: CardType[];
}

const adminSectionData: Record<AdminSectionType, SectionDataType> = {
  unions: {
    title: "সকল ইউনিয়ন",
    subtitle: "পুঠিয়া উপজেলার অন্তর্গত ৬টি ইউনিয়ন পরিষদের সামগ্রিক তথ্য, জনপ্রতিনিধি ও নাগরিক সেবা।",
    badge: "ইউনিয়ন পরিষদ তথ্য",
    gradient: "linear-gradient(135deg, #2563EB, #1E3A8A)",
    cards: [
      { icon: "🏛️", label: "ইউনিয়ন পরিষদ", detail: "স্থানীয় ৬টি ইউপির নাম ও তাদের নিজস্ব প্রশাসনিক ভবন" },
      { icon: "👑", label: "ইউপি চেয়ারম্যান", detail: "ইউনিয়নহের বর্তমান নির্বাচিত চেয়ারম্যানগণের প্রোফাইল" },
      { icon: "👥", label: "সাধারণ মেম্বার", detail: "প্রতিটি ইউনিয়নের ওয়ার্ড ভিত্তিক দায়িত্বরত সদস্যবৃন্দ" },
      { icon: "📱", label: "অনলাইন ডিজিটাল সেবা", detail: "ইউপি থেকে জন্ম নিবন্ধন ও নাগরিক সনদ প্রাপ্তির তথ্য" }
    ]
  },
  villages: {
    title: "গ্রাম তথ্যভাণ্ডার",
    subtitle: "উপজেলার বিভিন্ন ওয়ার্ডের অন্তর্ভুক্ত গ্রামহের নাম, জনসংখ্যা এবং ঐতিহাসিক পরিচিতি নির্দেশিকা।",
    badge: "ভৌগোলিক তথ্য",
    gradient: "linear-gradient(135deg, #F59E0B, #B45309)",
    cards: [
      { icon: "🏡", label: "মোট গ্রাম ও মৌজা", detail: "পুঠিয়ার ওয়ার্ড ভিত্তিক সকল নিবন্ধিত গ্রামের তালিকা" },
      { icon: "📊", label: "জনসংখ্যার উপাত্ত", detail: "সর্বশেষ আদমশুমারি অনুযায়ী নারী ও পুরুষের জনসংখ্যার অনুপাত" },
      { icon: "🌾", label: "পেশা ও জীবিকা", detail: "কৃষি, ব্যবসা ও বিভিন্ন কুটির শিল্পের সাথে যুক্ত জনবল" },
      { icon: "📈", label: "উন্নয়ন সূচক", detail: "শতভাগ বিদ্যুতায়ন ও শতভাগ স্যানিটেশন সমৃদ্ধ আদর্শ গ্রাম" }
    ]
  },
  maps: {
    title: "মানচিত্র ও সীমানা",
    subtitle: "পুঠিয়া উপজেলার অফিশিয়াল জিওগ্রাফিক ম্যাপ, চারদিকের সীমানা এবং ইউনিয়নের সীমানা নির্ধারণী তথ্য।",
    badge: "মানচিত্র গাইড",
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    cards: [
      { icon: "🗺️", label: "উপজেলা ম্যাপ", detail: "সরকারি এলজিইডি (LGED) অনুমোদিত উপজেলার ডিজিটাল মানচিত্র" },
      { icon: "🌐", label: "ভৌগোলিক সীমানা", detail: "উত্তরে দুর্গাপুর ও বাগমারা, দক্ষিণে চারঘাট ও বাঘা উপজেলা" },
      { icon: "🧭", label: "আয়তন ও এলাকা", detail: "উপজেলার মোট আয়তন ও আবাদি কৃষি জমির পরিমাপ" },
      { icon: "🛣️", label: "যোগাযোগ নেটওয়ার্ক", detail: "মহাসড়ক ও স্থানীয় পাকা রাস্তার সংযোগ চিত্র" }
    ]
  },
  leaders: {
    title: "জনপ্রতিনিধি ও প্রশাসন",
    subtitle: "উপজেলা পরিষদ, উপজেলা প্রশাসন (UNO) এবং স্থানীয় সরকারি দপ্তরের শীর্ষ কর্মকর্তাদের ডিরেক্টরি।",
    badge: "প্রশাসনিক তথ্য",
    gradient: "linear-gradient(135deg, #10B981, #064E3B)",
    cards: [
      { icon: "👨‍💼", label: "উপজেলা চেয়ারম্যান", detail: "উপজেলা পরিষদের বর্তমান প্রধান ও ভাইস-চেয়ারম্যানবৃন্দ" },
      { icon: "🏢", label: "ইউএনও (UNO) অফিস", detail: "উপজেলা নির্বাহী অফিসার ও প্রশাসনিক তদারকি সেল" },
      { icon: "👮", label: "থানা ও পুলিশ প্রশাসন", detail: "আইনশৃঙ্খলা রক্ষায় পুঠিয়া মডেল থানার দায়িত্বপ্রাপ্ত অফিসার" },
      { icon: "📞", label: "জরুরি সরকারি হটলাইন", detail: "যেকোনো আইনি বা দাপ্তরিক প্রয়োজনে সরাসরি যোগাযোগের নম্বর" }
    ]
  }
};

export const AdministrativeStructure: React.FC<Props> = ({ onGoBack }) => {
  const [activeSection, setActiveSection] = useState<AdminSectionType>("unions");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const data = adminSectionData[activeSection];

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
  };

  const handleSimulateCall = (phone: string, name: string) => {
    alert(`Calling ${name} at ${phone}... (Simulated call)`);
  };

  const handleSimulateWeb = (url: string, title: string) => {
    alert(`Opening official website of ${title}: ${url} ... (Simulated redirection)`);
  };

  // Content rendering based on clicked cards
  const renderCardDetails = (cardLabel: string) => {
    switch (cardLabel) {
      // 1. UNIONS CATEGORY DETAILED CONTENTS
      case "ইউনিয়ন পরিষদ":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলায় মোট ৬টি ইউনিয়ন রয়েছে। প্রতিটি ইউনিয়ন পরিষদ স্থানীয় ওয়ার্ড প্রতিনিধিদের মাধ্যমে পরিচালিত হয় এবং নিজস্ব কমপ্লেক্স ভবনে নাগরিক সেবা প্রদান করে থাকে।
            </p>
            <div className="space-y-2.5">
              {[
                { name: "১নং পুঠিয়া ইউনিয়ন", location: "পুঠিয়া সদর, রাজবাড়ি এলাকা", villages: "১৮টি", pop: "২৬,৫০০+", attraction: "রাজবাড়ি ও প্রাচীন দিঘি চত্বর", bg: "bg-blue-50/70 border-blue-100" },
                { name: "২নং বেলপুকুরিয়া ইউনিয়ন", location: "বেলপুকুরিয়া বাজার সংলগ্ন, পুঠিয়ার প্রবেশদ্বার", villages: "২৬টি", pop: "৩১,২০০+", attraction: "বেলপুকুর বাইপাস ও কৃষি অঞ্চল", bg: "bg-amber-50/70 border-amber-100" },
                { name: "৩নং বানেশ্বর ইউনিয়ন", location: "বানেশ্বর বাজার, মহাসড়ক সংলগ্ন", villages: "২১টি", pop: "৩৮,০০০+", attraction: "উত্তরবঙ্গের বৃহত্তম আমের হাট ও বাণিজ্য", bg: "bg-emerald-50/70 border-emerald-100" },
                { name: "৪নং জিউপাড়া ইউনিয়ন", location: "জিউপাড়া বাজার এলাকা", villages: "২৩টি", pop: "২৯,০০০+", attraction: "ব্যাপক মৎস্য চাষ ও পুকুর জলাশয়", bg: "bg-indigo-50/70 border-indigo-100" },
                { name: "৫নং শিলমাড়িয়া ইউনিয়ন", location: "শিলমাড়িয়া বাজার, পুঠিয়া", villages: "৩২টি (বৃহত্তম)", pop: "৩৫,৫০০+", attraction: "আখ, ধান ও পানের বিশাল চাষ", bg: "bg-pink-50/70 border-pink-100" },
                { name: "৬নং ভালুকগাছি ইউনিয়ন", location: "ভালুকগাছি মোড়", villages: "২৪টি", pop: "২৭,৮০০+", attraction: "ঐতিহ্যবাহী গ্রামীণ উৎসব ও সংস্কৃতি", bg: "bg-teal-50/70 border-teal-100" }
              ].map((item, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border ${item.bg} text-left transition hover:shadow-sm`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-extrabold text-[14px] text-slate-800">{item.name}</h4>
                    <span className="text-[10px] bg-white/80 border border-slate-200/50 px-2 py-0.5 rounded-full font-bold text-slate-600">গ্রাম: {item.villages}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                    <p className="flex items-center gap-1"><MapPin size={10} className="text-slate-400" /> <span className="font-semibold text-slate-700">অবস্থান:</span> {item.location}</p>
                    <p className="flex items-center gap-1"><Star size={10} className="text-amber-500" /> <span className="font-semibold text-slate-700">বৈশিষ্ট্য:</span> {item.attraction}</p>
                    <p className="text-[10.5px] text-slate-500 font-bold">জনসংখ্যা: প্রায় {item.pop} জন</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "ইউপি চেয়ারম্যান":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলার ইউনিয়ন পরিষদের বর্তমান নির্বাচিত চেয়ারম্যান মহোদয়গণের বিবরণ ও প্রোফাইল নির্দেশিকা:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { name: "মোঃ আশরাফ খান ঝন্টু", union: "১নং পুঠিয়া ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১২-০৫****" },
                { name: "মোঃ বদিউজ্জামান বদি", union: "২নং বেলপুকুরিয়া ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১৩-৪৭****" },
                { name: "মোঃ ফাজিল উদ্দিন", union: "৩নং বানেশ্বর ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১৫-১২****" },
                { name: "মোঃ রুহুল আমিন", union: "৪নং জিউপাড়া ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১১-৩৪****" },
                { name: "মোঃ সাজ্জাদ হোসেন মুকুল", union: "৫নং শিলমাড়িয়া ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১৬-৮৭****" },
                { name: "মোঃ তাকবীর হাসান", union: "৬নং ভালুকগাছি ইউনিয়ন পরিষদ", status: "বর্তমান নির্বাচিত চেয়ারম্যান", phone: "+৮৮০১৭১২-৯৫****" }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-left flex justify-between items-center hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">👑</span>
                      <h4 className="font-extrabold text-[13.5px] text-slate-800">{item.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold">{item.union}</p>
                    <p className="text-[10px] text-[#2563EB] font-bold mt-0.5">{item.status}</p>
                  </div>
                  <button
                    onClick={() => handleSimulateCall(item.phone, item.name)}
                    className="p-2 bg-white border border-slate-200 text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition rounded-full shadow-sm active:scale-95"
                    title="কল করুন"
                  >
                    <Phone size={13} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "সাধারণ মেম্বার":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              স্থানীয় সরকার আইন অনুসারে প্রতিটি ইউনিয়ন পরিষদ ৯টি ওয়ার্ডে বিভক্ত। ওয়ার্ড পর্যায়ে তৃণমূল উন্নয়ন ও জনসেবা নিশ্চিত করতে নির্বাচিত প্রতিনিধিরা নিয়োজিত থাকেন।
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-left space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">👥</span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">সাধারণ ওয়ার্ড মেম্বার (সদস্য)</h4>
                  <p className="text-[11px] text-slate-600 mt-1">প্রতিটি ইউনিয়নে ৯টি ওয়ার্ডের জন্য ৯ জন সাধারণ মেম্বার সরাসরি জনগণের ভোটে নির্বাচিত হন। তারা নিজ নিজ ওয়ার্ডের শিক্ষা, স্যানিটেশন, পয়ঃনিষ্কাশন ও রাস্তাঘাট রক্ষণাবেক্ষণের প্রধান সমন্বয়ক।</p>
                </div>
              </div>
              <div className="border-t border-slate-200 my-2"></div>
              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">👩</span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">সংরক্ষিত মহিলা মেম্বার (সদস্য)</h4>
                  <p className="text-[11px] text-slate-600 mt-1">নারী অধিকার, ক্ষমতায়ন ও পারিবারিক বিরোধ মীমাংসায় প্রতিটি ইউনিয়নে ৩টি সংরক্ষিত ওয়ার্ড আসন থাকে, যেখান থেকে ৩ জন নারী মেম্বার নির্বাচিত হন (প্রতি ৩টি সাধারণ ওয়ার্ড মিলে ১টি সংরক্ষিত আসন)।</p>
                </div>
              </div>
              <div className="border-t border-slate-200 my-2"></div>
              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">🤝</span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">পরিষদ সচিব ও উদ্যোক্তা</h4>
                  <p className="text-[11px] text-slate-600 mt-1">ইউনিয়নের যাবতীয় দাপ্তরিক কাজ পরিচালনা করেন সরকারি ১ জন সচিব। এছাড়াও ইউনিয়ন ডিজিটাল সেন্টারে (UDC) তথ্য প্রযুক্তি সেবা দেয়ার জন্য ২ জন উদ্যোক্তা সার্বক্ষণিক কাজ করেন।</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "অনলাইন ডিজিটাল সেবা":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              ইউনিয়ন ডিজিটাল সেন্টার (UDC) থেকে সরাসরি খুব সহজে ও দ্রুততম সময়ে অনলাইনে যেসব সরকারি ও স্থানীয় সেবা পাওয়া যায়, তার নির্দেশিকা:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { title: "জন্ম ও মৃত্যু নিবন্ধন আবেদন", detail: "নতুন জন্ম সনদ প্রাপ্তি, সংশোধন ও ইংরেজি কপির আবেদন প্রসেস", icon: "📜" },
                { title: "নাগরিক ও চারিত্রিক সনদপত্র", detail: "ইউপি চেয়ারম্যান স্বাক্ষরিত অনলাইন নাগরিকত্ব ও চারিত্রিক প্রত্যয়নপত্র", icon: "🤝" },
                { title: "ই-মিউটেশন (নামজারি আবেদন)", detail: "জমির নামজারি আবেদন ও ভূমি উন্নয়ন কর প্রদানের ডিজিটাল সাপোর্ট", icon: "🌾" },
                { title: "সরকারি সামাজিক নিরাপত্তা ভাতা", detail: "বয়স্ক ভাতা, বিধবা ভাতা ও প্রতিবন্ধী ভাতার অনলাইন আবেদন কেন্দ্র", icon: "👴" },
                { title: "বিশ্ববিদ্যালয় ভর্তি ও চাকরির আবেদন", detail: "যেকোনো প্রতিযোগিতামূলক পরীক্ষা ও সরকারি ফরম পূরণের সুব্যবস্থা", icon: "💻" }
              ].map((service, idx) => (
                <div key={idx} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl text-left flex gap-3 items-start">
                  <span className="text-xl">{service.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-[12.5px] text-slate-800 leading-tight mb-0.5">{service.title}</h5>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">{service.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 2. VILLAGES CATEGORY DETAILED CONTENTS
      case "মোট গ্রাম ও মৌজা":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলায় ওয়ার্ড ভিত্তিক মোট ১২৮টি সুসজ্জিত গ্রাম ও মৌজা এলাকা রয়েছে। নিচে ইউনিয়ন অনুসারে গ্রামের সংখ্যাগত সংক্ষিপ্ত রূপ দেয়া হলো:
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-left">
              {[
                { name: "১নং পুঠিয়া ইউনিয়ন", count: "১৮টি গ্রাম" },
                { name: "২নং বেলপুকুরিয়া ইউনিয়ন", count: "২৬টি গ্রাম" },
                { name: "৩নং বানেশ্বর ইউনিয়ন", count: "২১টি গ্রাম" },
                { name: "৪নং জিউপাড়া ইউনিয়ন", count: "২৩টি গ্রাম" },
                { name: "৫নং শিলমাড়িয়া ইউনিয়ন", count: "৩২টি গ্রাম" },
                { name: "৬নং ভালুকগাছি ইউনিয়ন", count: "২৪টি গ্রাম" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-amber-50/20">
                  <h4 className="font-extrabold text-[12px] text-slate-700">{item.name}</h4>
                  <p className="text-[11px] text-amber-700 font-bold mt-0.5">{item.count}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-left text-[11px] text-amber-800 leading-relaxed">
              🏡 <span className="font-bold">মৌজা ও গ্রাম বিন্যাস:</span> উপজেলার ৫নং শিলমাড়িয়া ইউনিয়ন হলো ভৌগোলিক ও গ্রামের সংখ্যার দিক থেকে বৃহত্তম এবং ১নং পুঠিয়া ইউনিয়ন হলো প্রশাসনিক ও বাণিজ্যিক কেন্দ্র সমৃদ্ধ সদর এলাকা।
            </div>
          </div>
        );

      case "জনসংখ্যার উপাত্ত":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              সর্বশেষ আদমশুমারি ও উপজেলা পরিসংখ্যান ব্যুরোর উপাত্ত অনুযায়ী পুঠিয়া উপজেলার জনসংখ্যা সংক্রান্ত মূল পরিসংখ্যান নিম্নরূপ:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">মোট জনসংখ্যা</span>
                <span className="text-base font-black text-slate-800">২,৫০,০০০+ জন</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">মোট ভোটার সংখ্যা</span>
                <span className="text-base font-black text-slate-800">১,৮২,৪০০+ জন</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">পুরুষ অনুপাত</span>
                <span className="text-base font-black text-[#2563EB]">৫১% (১,২৭,৫০০)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block">মহিলা অনুপাত</span>
                <span className="text-base font-black text-pink-600">৪৯% (১,২২,৫০০)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="flex justify-between"><span>📚 শিক্ষার গড় হার:</span> <span className="font-bold text-emerald-600">৫৫.৫%</span></p>
              <p className="flex justify-between"><span>👨‍🏫 পুরুষ শিক্ষার হার:</span> <span className="font-bold">৫৮.২%</span></p>
              <p className="flex justify-between"><span>👩‍🏫 মহিলা শিক্ষার হার:</span> <span className="font-bold">৫২.৮%</span></p>
              <p className="flex justify-between"><span>📈 বার্ষিক বৃদ্ধির হার:</span> <span className="font-bold">১.২%</span></p>
            </div>
          </div>
        );

      case "পেশা ও জীবিকা":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলার অর্থনৈতিক ভিত্তি মূলত কৃষিনির্ভর। তবে মহাসড়ক কেন্দ্রিক বাণিজ্যিক অগ্রগতি ও মৎস্য চাষে সাম্প্রতিক বিপ্লব জীবনযাত্রার মান বহুগুণ বাড়িয়ে দিয়েছে।
            </p>
            <div className="space-y-2.5">
              {[
                { title: "কৃষি ও উদ্যানপালন (৬৮%)", detail: "ধান, আলু, সরিষা, পানের বরজ এবং আমের বিশাল ফলন। বানেশ্বর ও বেলপুকুর অঞ্চলের কৃষকদের প্রধান চালিকাশক্তি।", icon: "🌾" },
                { title: "মৎস্য ও পশুপালন (১২%)", detail: "জিউপাড়া ও শিলমাড়িয়া ইউনিয়নের পুকুরগুলোতে বাণিজ্যিক মাছ চাষ এবং ডেইরি খামার স্থাপন।", icon: "🐟" },
                { title: "ব্যবসা ও ক্ষুদ্র বাণিজ্য (১৫%)", detail: "বানেশ্বর আমের বাজার কেন্দ্রিক পাইকারি আড়ত, পুঠিয়া বাজার ও নাটোর-রাজশাহী হাইওয়ে সংলগ্ন ব্যবসা।", icon: "🏪" },
                { title: "চাকরি ও কুটির শিল্প (৫%)", detail: "সরকারি-বেসরকারি চাকরিজীবী, শিক্ষক এবং বাঁশ, বেত ও মৃৎশিল্পের কারিগর জনবল।", icon: "👮" }
              ].map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50/70 border border-slate-150 rounded-xl flex gap-3 items-start">
                  <span className="text-lg mt-0.5">{p.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-[12.5px] text-slate-800">{p.title}</h5>
                    <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "উন্নয়ন সূচক":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              সরকারি ও স্থানীয় ইউপি উদ্যোগের মাধ্যমে পুঠিয়া উপজেলার গ্রামে সামাজিক জীবনমান উন্নয়নে প্রশংসনীয় অগ্রগতি অর্জিত হয়েছে:
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                <Check className="text-emerald-600 shrink-0" size={16} strokeWidth={3} />
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800">শতভাগ বিদ্যুতায়ন</h5>
                  <p className="text-[10px] text-slate-500">উপজেলার প্রতিটি ইউনিয়ন ও প্রত্যন্ত গ্রামে বিদ্যুৎ পৌঁছে দেওয়া হয়েছে।</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                <Check className="text-emerald-600 shrink-0" size={16} strokeWidth={3} />
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800">শতভাগ স্যানিটেশন কাভারেজ</h5>
                  <p className="text-[10px] text-slate-500">প্রতিটি বাড়িতে স্বাস্থ্যসম্মত শৌচাগার ও জনসচেতনতা শতভাগ উন্নীত হয়েছে।</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                <Check className="text-emerald-600 shrink-0" size={16} strokeWidth={3} />
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800">সুপেয় নিরাপদ পানি সরবরাহ</h5>
                  <p className="text-[10px] text-slate-500">৯৯% গ্রামবাসী বর্তমানে আর্সেনিকমুক্ত নিরাপদ পানির সুবিধা পাচ্ছেন।</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5">
                <Check className="text-emerald-600 shrink-0" size={16} strokeWidth={3} />
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800">উন্নত পাকা রাস্তা নেটওয়ার্ক</h5>
                  <p className="text-[10px] text-slate-500">৯৫% গ্রাম্য সড়ক এখন পিচঢালা ও টেকসই যোগাযোগ সম্পন্ন।</p>
                </div>
              </div>
            </div>
          </div>
        );

      // 3. MAPS CATEGORY DETAILED CONTENTS
      case "উপজেলা ম্যাপ":
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed text-left">
              পুঠিয়া উপজেলা নাটোর-রাজশাহী হাইওয়ের পার্শ্ববর্তী অত্যন্ত সুরক্ষিত ও সুবিধাজনক একটি ভৌগোলিক অবস্থানে অবস্থিত। নিচে উপজেলার প্রধান প্রশাসনিক ম্যাপ বিবরণী উপস্থাপন করা হলো:
            </p>
            <div className="rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner bg-slate-50 p-1.5">
              <iframe
                title="পুঠিয়া মানচিত্র"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116668.6117621111!2d88.75549019864273!3d24.375253164998877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbf25a66a1e3dd%3A0x6b74e64573177f0d!2sPuthia!5e0!3m2!1sen!2sbd!4v1718899888888!5m2!1sen!2sbd"
                width="100%"
                height="180"
                className="border-0 rounded-xl"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
            </div>
            <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-150">
              <span className="text-[11px] font-bold text-slate-700 block mb-0.5">🗺️ ম্যাপ গাইড তথ্য:</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                এই ডিজিটাল মানচিত্রের সাহায্যে আপনি পুঠিয়ার রাজবাড়ি চত্বর, স্থানীয় ৬টি ইউনিয়নের সীমানা এবং মহাসড়ক নেটওয়ার্কের সংযোগ সরাসরি দেখে নিতে পারবেন।
              </p>
            </div>
          </div>
        );

      case "ভৌগোলিক সীমানা":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              রাজশাহী জেলার পুঠিয়া উপজেলা জেলা সদরের পূর্বাংশে অবস্থিত। এর চতুর্দিক ঘিরে থাকা পার্শ্ববর্তী অঞ্চল  অত্যন্ত গুরুত্বপূর্ণ ভৌগোলিক সংযোগ রক্ষা করে:
            </p>
            <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3 font-semibold text-slate-700 text-xs">
              <p className="flex items-center gap-2 border-b border-slate-100 pb-1.5">🧭 <span className="text-slate-400">উত্তরে:</span> দুর্গাপুর উপজেলা ও বাগমারা উপজেলা (রাজশাহী)</p>
              <p className="flex items-center gap-2 border-b border-slate-100 pb-1.5">🧭 <span className="text-slate-400">দক্ষিণে:</span> চারঘাট উপজেলা ও বাঘা উপজেলা (রাজশাহী)</p>
              <p className="flex items-center gap-2 border-b border-slate-100 pb-1.5">🧭 <span className="text-slate-400">পূর্বে:</span> নাটোর সদর উপজেলা ও বাগাতিপাড়া উপজেলা (নাটোর জেলা)</p>
              <p className="flex items-center gap-2 pb-0.5">🧭 <span className="text-slate-400">পশ্চিমে:</span> পবা উপজেলা ও মোহনপুর উপজেলা (রাজশাহী)</p>
            </div>
          </div>
        );

      case "আয়তন ও এলাকা":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলা মোট ১৯২.৬৩ বর্গ কিলোমিটার বা ৪৭,৬০২ একর আয়তন নিয়ে গঠিত। উর্বর পলল মাটি সমৃদ্ধ এই এলাকায় আবাদি কৃষি জমির অনুপাত অনেক বেশি।
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>📐 মোট আয়তন:</span>
                <span className="font-bold text-slate-800">১৯২.৬৩ বর্গ কি.মি.</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>🌾 আবাদি জমি:</span>
                <span className="font-bold text-slate-800">১৬,৮৫০ হেক্টর (৮৭.৫%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>🍇 ফলজ উদ্যান:</span>
                <span className="font-bold text-slate-800">২,৪৫০ হেক্টর</span>
              </div>
              <div className="flex justify-between">
                <span>🌊 দিঘি ও জলাশয়:</span>
                <span className="font-bold text-slate-800">৮৫০ হেক্টর (শ্যামসাগর ও অন্যান্য)</span>
              </div>
            </div>
          </div>
        );

      case "যোগাযোগ নেটওয়ার্ক":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উন্নত যাতায়াত পরিকাঠামোর কারণে রাজশাহী ও সারা দেশের সাথে সহজে সংযুক্ত।
            </p>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h5 className="font-extrabold text-xs text-slate-800">🛣️ ঢাকা-রাজশাহী মহাসড়ক (N6)</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">উপজেলার মূল লাইফলাইন। ঢাকা থেকে রাজশাহী বিভাগীয় সদরে প্রবেশে পুঠিয়া থানা সদর ও বানেশ্বর বাজার পার হতে হয়।</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h5 className="font-extrabold text-xs text-slate-800">🚌 সড়ক যোগাযোগ</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">উপজেলার ২১০ কি.মি পাকা সড়ক রয়েছে। বানেশ্বর থেকে দুর্গাপুর ও বাগমারা এবং পুঠিয়া থেকে চারঘাটমুখী চমৎকার যোগাযোগ ব্যবস্থা বিদ্যমান।</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h5 className="font-extrabold text-xs text-slate-800">🚉 রেলওয়ে নেটওয়ার্ক</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">বেলপুকুরিয়া ইউনিয়ন সংলগ্ন রেলওয়ে স্টেশনের মাধ্যমে রাজশাহী ও অন্যান্য স্থানে ট্রেনে ভ্রমণের চমৎকার লোকাল সুযোগ রয়েছে।</p>
              </div>
            </div>
          </div>
        );

      // 4. LEADERS CATEGORY DETAILED CONTENTS
      case "উপজেলা চেয়ারম্যান":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলা পরিষদের জনপ্রতিনিধিবৃন্দ এবং তাদের মূল প্রশাসনিক সমন্বয়কারী প্যানেল নিম্নরূপ:
            </p>
            <div className="p-4 bg-slate-50/70 border border-slate-150 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">👨‍💼</div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">মোঃ আশরাফুল ইসলাম</h4>
                  <p className="text-[10.5px] text-[#059669] font-bold">উপজেলা পরিষদ চেয়ারম্যান (প্রধান নির্বাচিত জনপ্রতিনিধি)</p>
                  <p className="text-[10px] text-slate-400 font-bold">অফিস: উপজেলা পরিষদ কমপ্লেক্স ভবন</p>
                </div>
              </div>
              <div className="border-t border-slate-200"></div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700">মোঃ আব্দুল মজিদ</h5>
                  <p className="text-[10px] text-slate-500">উপজেলা ভাইস চেয়ারম্যান (পুরুষ)</p>
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700">মোছাঃ মৌসুমি রহমান</h5>
                  <p className="text-[10px] text-slate-500">উপজেলা ভাইস চেয়ারম্যান (মহিলা)</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => handleSimulateCall('+৮৮০১৭১১-******', 'উপজেলা চেয়ারম্যান')}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-emerald-700 shadow transition active:scale-95"
              >
                <Phone size={11} strokeWidth={3} /> সরাসরি কল করুন
              </button>
            </div>
          </div>
        );

      case "ইউএনও (UNO) অফিস":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              উপজেলা নির্বাহী অফিসার (UNO) পুঠিয়া উপজেলার শীর্ষ সরকারি কর্মকর্তা এবং প্রশাসনিক সমন্বয়কারী হিসেবে দায়িত্ব পালন করেন।
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-full flex items-center justify-center text-xl">🏢</div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">নূরজাহান আক্তার সাথী</h4>
                  <p className="text-[11px] text-slate-500 font-bold">উপজেলা নির্বাহী কর্মকর্তা (UNO), পুঠিয়া</p>
                  <p className="text-[10px] text-slate-400 font-semibold">রাজশাহী জেলা প্রশাসন, বিসিএস (প্রশাসন)</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                <p><span className="font-bold text-slate-800">📍 ঠিকানা:</span> উপজেলা পরিষদ কমপ্লেক্স (১ম তলা), পুঠিয়া সদর।</p>
                <p><span className="font-bold text-slate-800">📧 ইমেইল:</span> unoputhia@mopa.gov.bd</p>
                <p><span className="font-bold text-slate-800">📞 যোগাযোগ:</span> +৮৮০১৭১৩-******</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSimulateCall('+৮৮০১৭১৩-******', 'ইউএনও কার্যালয়')}
                className="bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 hover:bg-slate-900 transition flex-1 justify-center shadow"
              >
                <Phone size={12} strokeWidth={2.5} /> ইউএনও অফিস কল
              </button>
              <button 
                onClick={() => handleSimulateWeb('https://puthia.rajshahi.gov.bd', 'পুঠিয়া বাতায়ন')}
                className="border border-slate-200 text-slate-800 bg-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 hover:bg-slate-50 transition flex-1 justify-center"
              >
                <Globe size={12} /> পোর্টাল ভিজিট
              </button>
            </div>
          </div>
        );

      case "থানা ও পুলিশ প্রশাসন":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              পুঠিয়া উপজেলা মডেল থানা এলাকায় শান্তি-শৃঙ্খলা ও জনগণের আইনগত নিরাপত্তা নিশ্চিত করার প্রধান কেন্দ্রবিন্দু।
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center text-xl text-[#1E3A8A]">👮</div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">মোঃ আনোয়ার হোসেন</h4>
                  <p className="text-[11px] text-slate-500 font-bold">অফিসার ইনচার্জ (OC), পুঠিয়া মডেল থানা</p>
                  <p className="text-[10px] text-slate-400 font-semibold">বাংলাদেশ পুলিশ (রাজশাহী জেলা)</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2.5 space-y-1.5 text-xs text-slate-600 font-medium">
                <p><span className="font-bold text-slate-800">📍 ঠিকানা:</span> ঢাকা-রাজশাহী হাইওয়ে সংলগ্ন, পুঠিয়া মডেল থানা।</p>
                <p><span className="font-bold text-slate-800">📞 ডিউটি অফিসার হেল্পলাইন:</span> +৮৮০১৭১৩-৩৭৩***</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleSimulateCall('+৮৮০১৭১৩-৩৭৩***', 'পুঠিয়া থানা')}
                className="bg-[#1E3A8A] text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 hover:bg-blue-900 transition justify-center shadow"
              >
                <Phone size={12} strokeWidth={2.5} /> ডিউটি অফিসার কল
              </button>
              <button 
                onClick={() => alert('Emergency 999 dialing...')}
                className="bg-red-600 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 hover:bg-red-700 transition justify-center shadow"
              >
                🚨 ৯৯৯ ডায়াল
              </button>
            </div>
          </div>
        );

      case "জরুরি সরকারি হটলাইন":
        return (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 leading-relaxed">
              যেকোনো প্রয়োজনে বা জরুরি মুহূর্তে দেশের যেকোনো প্রান্ত থেকে টোল-ফ্রি (বিনামূল্যে) সরাসরি কথা বলতে সরকারি জরুরি হটলাইন  ব্যবহার করুন:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { number: "৯৯৯", label: "জাতীয় জরুরি সেবা (পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স)", color: "bg-red-50 text-red-700 border-red-100" },
                { number: "৩৩৩", label: "সরকারি তথ্য, সেবা প্রাপ্তির আবেদন ও সামাজিক সাহায্য", color: "bg-amber-50 text-amber-700 border-amber-100" },
                { number: "১০৯", label: "নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন", color: "bg-purple-50 text-purple-700 border-purple-100" },
                { number: "১০৯৮", label: "চাইল্ড হেল্পলাইন (শিশু সুরক্ষা ও আইনি সহায়তা)", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                { number: "১৬১২৩", label: "কৃষি বাতায়ন ও বিশেষজ্ঞ কৃষি পরামর্শ কেন্দ্র", color: "bg-emerald-50 text-emerald-700 border-emerald-100" }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${item.color} flex justify-between items-center transition hover:shadow-sm`}>
                  <div className="flex-1 pr-3">
                    <span className="font-black text-base tracking-wider block leading-tight mb-0.5">{item.number}</span>
                    <p className="text-[10.5px] text-slate-600 font-medium leading-tight">{item.label}</p>
                  </div>
                  <button 
                    onClick={() => handleSimulateCall(item.number, item.label)}
                    className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
                  >
                    <Phone size={13} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p className="text-xs text-slate-500 text-justify">{selectedCard?.detail}</p>;
    }
  };

  return (
    <div className="p-4 space-y-5 bg-white min-h-screen font-sans">
      {/* 1. Header Banner */}
      <div 
        id="admin-top-banner" 
        className="p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden transition-all duration-300"
        style={{ 
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)", 
          background: data.gradient 
        }}
      >
        <div className="mb-3.5 text-left">
          <div className="bg-white/20 backdrop-blur-[5px] px-3.5 py-1.5 rounded-full text-[11.5px] font-bold border border-white/15 text-white inline-block tracking-[0.2px]">
            {data.badge}
          </div>
        </div>
        
        <h2 className="m-0 mb-3 text-[25px] font-extrabold text-white leading-tight text-left">
          {data.title}
        </h2>
        
        <p className="m-0 mb-5 text-[13.5px] opacity-[0.88] leading-relaxed text-justify text-white">
          {data.subtitle}
        </p>
        
        <div className="block text-left">
          <button 
            onClick={onGoBack}
            className="bg-white/20 backdrop-blur-[5px] px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 text-xs font-bold text-white cursor-pointer border border-white/20 tracking-[0.3px] hover:bg-white/30 active:scale-95 transition-all outline-none"
          >
            <ArrowLeft size={12} strokeWidth={3} />
            <span>ফিরে যান</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Buttons */}
      <div className="admin-grid-buttons grid grid-cols-2 gap-3 mb-5">
        {[
          { id: "unions", label: "📍 ইউনিয়ন", bg: "#2563EB", activeBg: "from-[#2563EB] to-[#1E3A8A]", shadow: "rgba(37,99,235,0.15)" },
          { id: "villages", label: "🏡 গ্রাম তথ্যভাণ্ডার", bg: "#f59e0b", activeBg: "from-[#F59E0B] to-[#B45309]", shadow: "rgba(245,158,11,0.15)" },
          { id: "maps", label: "🗺️ মানচিত্র ও সীমানা", bg: "#3b82f6", activeBg: "from-[#3B82F6] to-[#1D4ED8]", shadow: "rgba(59,130,246,0.15)" },
          { id: "leaders", label: "👨‍💼 জনপ্রতিনিধি ও প্রশাসন", bg: "#10b981", activeBg: "from-[#10B981] to-[#064E3B]", shadow: "rgba(16,185,129,0.15)" }
        ].map((btn) => {
          const isActive = activeSection === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveSection(btn.id as AdminSectionType)}
              className={`p-5 rounded-[16px] text-white text-center font-bold text-[13.5px] cursor-pointer flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-none outline-none ${
                isActive 
                  ? "bg-gradient-to-br scale-[1.02] shadow-md ring-2 ring-white/50" 
                  : "bg-slate-800/90 hover:bg-slate-700"
              }`}
              style={{
                backgroundColor: isActive ? undefined : btn.bg,
                backgroundImage: isActive ? `linear-gradient(135deg, ${btn.id === 'unions' ? '#2563EB, #1E3A8A' : btn.id === 'villages' ? '#F59E0B, #B45309' : btn.id === 'maps' ? '#3B82F6, #1D4ED8' : '#10B981, #064E3B'})` : undefined,
                boxShadow: `0 4px 10px ${btn.shadow}`
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom Cards */}
      <div id="admin-bottom-cards" className="grid grid-cols-2 gap-3">
        {data.cards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => handleCardClick(card)}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center cursor-pointer hover:border-slate-300 hover:shadow-md transition active:scale-[0.98]"
            style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}
          >
            <span className="text-2xl mb-2.5 block">{card.icon}</span>
            <h5 className="margin-0 mb-1.5 text-slate-800 text-[14px] font-bold tracking-tight">{card.label}</h5>
            <p className="margin-0 text-slate-500 text-[11px] leading-[1.3] text-center font-medium">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* 4. Beautiful Interactive Details Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-slate-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCard.icon}</span>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-800 leading-tight">
                    {selectedCard.label}
                  </h3>
                  <span className="text-[10px] bg-slate-200/60 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {data.badge}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition outline-none"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 scrollbar-thin">
              {renderCardDetails(selectedCard.label)}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedCard(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow active:scale-95 outline-none"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

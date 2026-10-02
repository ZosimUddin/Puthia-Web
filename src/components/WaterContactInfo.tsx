import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Building,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Zap,
  Droplet,
  Activity,
  Flame,
} from "lucide-react";

export function WaterContactInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const onSimulateAction = (actionName: string) => {
    alert(`${actionName}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner Section */}
      <div
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #B71C1C, #212121)" }}
      >
        <button
          onClick={onGoBack}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <p className="text-[#EF5350] text-sm font-bold mb-2 uppercase tracking-wide">
            পৌরসভা ও জনস্বাস্থ্য প্রকৌশল
          </p>
          <h1 className="text-4xl font-black mb-3 text-white">
            পানি সরবরাহ ও কন্টাক্ট
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-[#EF5350]/50 pl-3 py-1">
            পৌর এলাকার সাপ্লাই পানির লাইন এবং গ্রামীণ সুপেয় পানি ও নলকূপ
            রক্ষণাবেক্ষণ টিমের যোগাযোগ।
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab("tab1")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab1" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">💧</span> পৌর পানি সরবরাহ
        </button>
        <button
          onClick={() => setActiveTab("tab2")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab2" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">🚰</span> জনস্বাস্থ্য প্রকৌশল
        </button>
        <button
          onClick={() => setActiveTab("tab3")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab3" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">🛠️</span> পাইপলাইন মেরামতকারী
        </button>
        <button
          onClick={() => setActiveTab("tab4")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab4" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">🧪</span> পানি পরীক্ষা ল্যাব
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        {activeTab === "tab1" && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#D32F2F]"></div>
            <div className="flex gap-4 items-start pl-2">
              <div className="w-16 h-16 rounded-full bg-[#D32F2F]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#D32F2F]/20">
                💧
              </div>
              <div>
                <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                  পুঠিয়া পৌরসভা পানি সরবরাহ শাখা
                </h4>
                <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                  <Building className="w-4 h-4 shrink-0 text-gray-400" /> পৌরসভা কার্যালয়, পুঠিয়া
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#FFF8F8] p-4 rounded-2xl border border-red-100 ml-2">
              <p className="text-sm text-gray-700 font-sans leading-relaxed flex items-start gap-2">
                <Droplet className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-[#D32F2F]">প্রধান সেবা:</span> পৌর এলাকার সুপেয় পানির লাইন সংযোগ, মিটার ও লাইন লিক সংক্রান্ত সমস্যার সমাধান।
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
              <a
                href="tel:01712889911"
                className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#D32F2F] hover:bg-[#B71C1C] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-center"
              >
                <Phone className="w-5 h-5" /> সুপারভাইজারকে কল করুন (01712-889911)
              </a>
            </div>
          </div>
        )}

        {activeTab === "tab2" && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1976D2]"></div>
            <div className="flex gap-4 items-start pl-2">
              <div className="w-16 h-16 rounded-full bg-[#1976D2]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#1976D2]/20">
                🚰
              </div>
              <div>
                <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                  জনস্বাস্থ্য প্রকৌশল অধিদপ্তর (DPHE)
                </h4>
                <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                  <Building className="w-4 h-4 shrink-0 text-gray-400" /> উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#F0F7FF] p-4 rounded-2xl border border-blue-100 ml-2">
              <p className="text-sm text-gray-700 font-sans leading-relaxed flex items-start gap-2">
                <Droplet className="w-4 h-4 text-[#1976D2] shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-[#1976D2]">প্রধান সেবা:</span> গ্রামীণ এলাকায় গভীর নলকূপ স্থাপন, আর্সেনিক নিরসন প্রকল্প এবং স্যানিটেশন।
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
              <a
                href="tel:01715223344"
                className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#1976D2] hover:bg-[#115293] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-center"
              >
                <Phone className="w-5 h-5" /> উপজেলা উপ-সহকারী প্রকৌশলী (01715-223344)
              </a>
            </div>
          </div>
        )}

        {activeTab === "tab3" && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#388E3C]"></div>
            <div className="flex gap-4 items-start pl-2">
              <div className="w-16 h-16 rounded-full bg-[#388E3C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#388E3C]/20">
                🛠️
              </div>
              <div>
                <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                  জরুরি পাইপলাইন ও প্লাম্বিং টেকনিশিয়ান
                </h4>
                <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400" /> পুঠিয়া উপজেলা (অন-কল অন ডিউটি)
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#F1F8E9] p-4 rounded-2xl border border-green-100 ml-2">
              <p className="text-sm text-gray-700 font-sans leading-relaxed flex items-start gap-2">
                <Droplet className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-[#388E3C]">প্রধান সেবা:</span> গৃহস্থালি বা বাণিজ্যিক লাইনের যেকোনো পানির পাইপ ফেটে যাওয়া বা ফিটিং নষ্টের জরুরি সমাধান।
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
              <a
                href="tel:01911554433"
                className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#388E3C] hover:bg-[#2E7D32] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-center"
              >
                <Phone className="w-5 h-5" /> প্লাম্বার (মোঃ মজিদ হাসান) (01911-554433)
              </a>
            </div>
          </div>
        )}

        {activeTab === "tab4" && (
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#7B1FA2]"></div>
            <div className="flex gap-4 items-start pl-2">
              <div className="w-16 h-16 rounded-full bg-[#7B1FA2]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#7B1FA2]/20">
                🧪
              </div>
              <div>
                <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                  জনস্বাস্থ্য পানি পরীক্ষা ল্যাবরেটরি
                </h4>
                <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                  <Building className="w-4 h-4 shrink-0 text-gray-400" /> জেলা জনস্বাস্থ্য ল্যাব, রাজশাহী
                </p>
              </div>
            </div>

            <div className="mt-4 bg-[#F3E5F5] p-4 rounded-2xl border border-purple-100 ml-2">
              <p className="text-sm text-gray-700 font-sans leading-relaxed flex items-start gap-2">
                <Droplet className="w-4 h-4 text-[#7B1FA2] shrink-0 mt-0.5" />
                <span>
                  <span className="font-bold text-[#7B1FA2]">প্রধান সেবা:</span> পানিতে আয়রন, আর্সেনিক বা ব্যাকটেরিয়ার উপস্থিতি পরীক্ষার জন্য স্যাম্পল টেস্ট ল্যাব।
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
              <a
                href="tel:01718665544"
                className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#7B1FA2] hover:bg-[#6A1B9A] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-center"
              >
                <Phone className="w-5 h-5" /> স্যাম্পল কালেক্টর অফিসার (01718-665544)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

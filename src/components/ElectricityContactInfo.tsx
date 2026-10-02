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

export function ElectricityContactInfo({ onGoBack }: { onGoBack: () => void }) {
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
            বিদ্যুৎ বিভ্রাট ও লাইন মেরামত
          </p>
          <h1 className="text-4xl font-black mb-3 text-white">
            বিদ্যুৎ অফিস ডিরেক্টরি
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-[#EF5350]/50 pl-3 py-1">
            পুঠিয়া ও বানেশ্বর অঞ্চলের পল্লী বিদ্যুৎ সমিতি এবং নেসকো (NESCO)
            জোনাল অফিসের জরুরি অভিযোগ কেন্দ্র।
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
          <span className="text-2xl">⚡</span> পুঠিয়া জোনাল অফিস
        </button>
        <button
          onClick={() => setActiveTab("tab2")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab2" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">⚡</span> বানেশ্বর সাব-স্টেশন
        </button>
        <button
          onClick={() => setActiveTab("tab3")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab3" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">🛠️</span> জরুরি লাইন টিম
        </button>
        <button
          onClick={() => setActiveTab("tab4")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab4" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">💳</span> বিলিং কন্টাক্ট
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#D32F2F]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#D32F2F]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#D32F2F]/20">
              ⚡
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                নাটোর পল্লী বিদ্যুৎ সমিতি-২ (পুঠিয়া জোনাল)
              </h4>
              <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 text-gray-400" /> পুঠিয়া
                সদর
              </p>
            </div>
          </div>

          <div className="mt-4 bg-[bg-red-50] p-4 rounded-2xl border border-red-100 ml-2">
            <p className="text-sm text-gray-700 font-sans leading-relaxed flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>
                <span className="font-bold text-[#D32F2F]">সেবা:</span>{" "}
                লোডশেডিং, ট্রান্সফর্মার সমস্যা ও নতুন সংযোগের অভিযোগ।
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            <button
              onClick={() => onSimulateAction("Calling Electric Office")}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#D32F2F] hover:bg-[#B71C1C] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-5 h-5" /> জরুরি অভিযোগ (কল)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export function UpContactInfo({ onGoBack }: { onGoBack: () => void }) {
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
            স্থানীয় সরকার কন্টাক্ট হাব
          </p>
          <h1 className="text-4xl font-black mb-3 text-white">
            ইউনিয়ন পরিষদ ডিরেক্টরি
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-[#EF5350]/50 pl-3 py-1">
            পুঠিয়া উপজেলার অন্তর্গত সকল ইউনিয়ন পরিষদের চেয়ারম্যান ও সচিবগণের
            অফিশিয়াল যোগাযোগ নম্বর।
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
          <span className="text-2xl">🏢</span> ইউনিয়ন তালিকা
        </button>
        <button
          onClick={() => setActiveTab("tab2")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab2" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">📜</span> ইউনিয়ন সচিবগণ
        </button>
        <button
          onClick={() => setActiveTab("tab3")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab3" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">🗺️</span> ডিজিটাল সেন্টার (UISC)
        </button>
        <button
          onClick={() => setActiveTab("tab4")}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === "tab4" ? "bg-[#D32F2F] text-white border-[#D32F2F] shadow-md" : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"}`}
        >
          <span className="text-2xl">📞</span> ইউপি মেম্বার ডিরেক্টরি
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#D32F2F]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#D32F2F]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#D32F2F]/20">
              🏢
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                ১নং পুঠিয়া ইউনিয়ন পরিষদ
              </h4>
              <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                <Building className="w-4 h-4 shrink-0 text-gray-400" />{" "}
                চেয়ারম্যান কার্যালয়, পুঠিয়া ইউপি
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pl-2">
            <button
              onClick={() => onSimulateAction("Calling UP Chairman")}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#D32F2F] hover:bg-[#B71C1C] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-5 h-5" /> চেয়ারম্যানকে কল
            </button>
            <button
              onClick={() => onSimulateAction("Calling UP Secretary")}
              className="text-sm font-bold text-[#D32F2F] flex items-center justify-center gap-2 w-full bg-[#D32F2F]/10 hover:bg-[#D32F2F]/20 border border-[#D32F2F]/20 px-4 py-3.5 rounded-xl transition"
            >
              <Phone className="w-5 h-5" /> সচিবকে কল
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-gray-400"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-gray-200">
              🏢
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">
                ২নং বানেশ্বর ইউনিয়ন পরিষদ
              </h4>
              <p className="text-sm mt-1 text-gray-600 font-medium flex items-center gap-1.5">
                <Building className="w-4 h-4 shrink-0 text-gray-400" />{" "}
                চেয়ারম্যান কার্যালয়, বানেশ্বর ইউপি
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pl-2">
            <button
              onClick={() => onSimulateAction("Calling Baneswar Chairman")}
              className="text-sm font-bold text-gray-700 flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 px-4 py-3.5 rounded-xl shadow-sm transition"
            >
              <Phone className="w-5 h-5" /> চেয়ারম্যানকে কল
            </button>
            <button
              onClick={() => onSimulateAction("Calling Baneswar Secretary")}
              className="text-sm font-bold text-gray-700 flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-3.5 rounded-xl transition"
            >
              <Phone className="w-5 h-5" /> সচিবকে কল
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

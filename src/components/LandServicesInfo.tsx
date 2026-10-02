import React, { useState } from "react";
import { ArrowLeft, ExternalLink, MapPin, Phone, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function LandServicesInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("khatian");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const onSimulateLink = (title: string) => {
    alert(`Opening ${title} in browser... (Simulated)`);
  };

  const onSimulateCall = (title: string) => {
    alert(`Calling ${title}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #B71C1C, #424242)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">স্মার্ট ভূমি সেবা ও ডিজিটাল রেকর্ড</p>
          <h1 className="text-4xl font-black mb-3 text-white">ভূমি সেবা ডিরেক্টরি</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলা ভূমি অফিস ও ইউনিয়ন ভূমি অফিসের নাগরিক সেবা, খতিয়ান বা পর্চা অনুসন্ধান, জমির ম্যাপ এবং ভূমি উন্নয়ন কর প্রদানের ডিজিটাল গাইডলাইন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('khatian')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'khatian' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🗺️</span> খতিয়ান/পর্চা
        </button>
        <button 
          onClick={() => setActiveTab('tax')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tax' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💰</span> ভূমি উন্নয়ন কর
        </button>
        <button 
          onClick={() => setActiveTab('office')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'office' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏢</span> উপজেলা ভূমি অফিস
        </button>
        <button 
          onClick={() => setActiveTab('law')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'law' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📜</span> আইন ও সহায়িকা
        </button>
      </div>

      {/* Main Land Services Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📜
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">ডিজিটাল খতিয়ান (CS, RS, SA, BRS) অনুসন্ধান</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">অনলাইন খতিয়ান অনুসন্ধান (Online Khatian / Porcha)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় তথ্য:</span> বিভাগ, জেলা, উপজেলা (পুঠিয়া), মৌজার নাম এবং খতিয়ান বা দাগ নম্বর।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               আপনার কাঙ্ক্ষিত জমির খতিয়ান বা পর্চা অনলাইনে তাৎক্ষণিকভাবে দেখতে এবং সার্টিফাইড কপির জন্য আবেদন করতে পারবেন। নিচের বাটন চেপে সরাসরি জাতীয় ভূমি তথ্য পোর্টালে প্রবেশ করুন।
             </p>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowApplyForm(true)}
              className="text-sm font-bold text-white flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> পোর্টাল থেকে সরাসরি আবেদন
            </button>
            <button 
              onClick={() => onSimulateLink('Digital Khatian Portal')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি ভূমি তথ্য পোর্টাল
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               💰
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">অনলাইনে জমির খাজনা ও হোল্ডিং আইডি</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">ভূমি উন্নয়ন কর বা খাজনা (Land Development Tax)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               এখন ঘরে বসেই আপনার জাতীয় পরিচয়পত্র ও মোবাইল নম্বর দিয়ে নাগরিক নিবন্ধন সম্পন্ন করে পুঠিয়া উপজেলার যেকোনো মৌজার জমির বকেয়া খাজনা হিসাব করতে ও অনলাইনে পেমেন্ট (বিকাশ/নগদ) করতে পারবেন।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('LDT Portal')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" /> অনলাইন খাজনা পোর্টাল
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🏢
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">সহকারী কমিশনার (ভূমি) এর কার্যালয়, পুঠিয়া</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">পুঠিয়া উপজেলা ভূমি অফিস (AC Land Office)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">লোকেশন:</span> পুঠিয়া রাজবাড়ি রোড (উপজেলা পরিষদের পূর্ব পাশে), পুঠিয়া।</p>
             </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               জমির মূল রেকর্ডপত্র সংশোধন, মিস কেস, ভিপি সম্পত্তি এবং ইউনিয়ন ভূমি সহকারী কর্মকর্তাদের (তহশিলদার) মাধ্যমে আসা স্থানীয় ভূমি সংক্রান্ত জটিলতা নিরসনের প্রধান কার্যালয়।
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            <button 
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/5 hover:bg-[#B71C1C]/10 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> ম্যাপে দেখুন
            </button>
            <button 
              onClick={() => onSimulateCall('ল্যান্ড অফিস')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <Phone className="w-4 h-4" /> ল্যান্ড অফিসে যোগাযোগ
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="other" 
            serviceName="ভূমি ও খতিয়ান সেবা" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

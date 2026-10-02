import React, { useState } from "react";
import { ArrowLeft, Edit, ExternalLink, FileText, Search, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function BirthRegistrationInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("new_application");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const onSimulateLink = (title: string) => {
    alert(`Opening ${title} in browser... (Simulated)`);
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">ডিজিটাল জন্ম নিবন্ধন সেবা</p>
          <h1 className="text-4xl font-black mb-3 text-white">জন্ম নিবন্ধন</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             নতুন জন্ম নিবন্ধনের আবেদন, সংশোধন, হারিয়ে যাওয়া সনদ ডাউনলোড এবং পুঠিয়া উপজেলার সকল ইউনিয়ন পরিষদের জন্ম নিবন্ধন সংক্রান্ত প্রয়োজনীয় তথ্যাদি।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('new_application')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'new_application' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📝</span> নতুন আবেদন
        </button>
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tracking' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🔍</span> আবেদন ট্র্যাকিং
        </button>
        <button 
          onClick={() => setActiveTab('correction')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'correction' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🛠️</span> তথ্য সংশোধন
        </button>
        <button 
          onClick={() => setActiveTab('fees')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'fees' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💰</span> ফি ও নিয়মাবলী
        </button>
      </div>

      {/* Main Birth Registration Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📝
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নতুন জন্ম নিবন্ধন আবেদন নির্দেশিকা</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নতুন জন্ম নিবন্ধনের আবেদন (New Application)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">⏳</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">বয়সসীমা:</span> ০ থেকে ৪৫ দিন এবং তদূর্ধ্ব।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> ইপিসির (EPI) কার্ড/টিকাদান কার্ড, পিতা-মাতার অনলাইন জন্ম নিবন্ধন ও এনআইডি (NID) কার্ডের কপি, বাসার হোল্ডিং ট্যাক্সের রসিদ।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               সরকারি নিয়ম অনুযায়ী শিশুর জন্মের ৪৫ দিনের মধ্যে সম্পূর্ণ বিনামূল্যে জন্ম নিবন্ধন করা যায়। অ্যাপের নিচের বাটনটি চেপে সরাসরি সরকারি বিডিআরআইএস (BDRIS) পোর্টালে গিয়ে ফর্ম পূরণ করতে পারবেন।
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
              onClick={() => onSimulateLink('BDRIS Portal for New Application')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি BDRIS পোর্টাল লিংক
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🔍
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">আবেদন ট্র্যাকিং ও ডাউনলোড</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">আবেদনের বর্তমান অবস্থা যাচাই (Track Status)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               আপনি যদি পুঠিয়া সদর বা যেকোনো ইউনিয়ন পরিষদে অলরেডি আবেদন করে থাকেন, তবে অ্যাপ্লিকেশন আইডি এবং জন্ম তারিখ দিয়ে আপনার আবেদনের লাইভ স্ট্যাটাস চেক করতে পারবেন। অনুমোদন হলে এখান থেকেই কপি প্রিন্ট করা যাবে।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('BDRIS Portal for Tracking')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <Search className="w-4 h-4" /> স্ট্যাটাস চেক করুন
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🛠️
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নাম, বয়স বা পিতা-মাতার তথ্য সংশোধন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">জন্ম নিবন্ধন সংশোধন (Correction Guide)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">সরকারি ফি:</span> বয়স সংশোধন ১০০ টাকা, অন্যান্য তথ্য সংশোধন ৫০ টাকা।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় প্রমাণপত্র:</span> শিক্ষাগত যোগ্যতার সার্টিফিকেট (JSC/SSC), পিএসসি সার্টিফিকেট অথবা উপযুক্ত ডাক্তারের মেডিকেল সার্টিফিকেট।</p>
             </div>
          </div>
          
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('BDRIS Portal for Correction rules')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <FileText className="w-4 h-4" /> সংশোধনের নিয়মাবলী
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="birth_registration" 
            serviceName="জন্ম নিবন্ধন" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Search, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function DeathRegistrationInfo({ onGoBack }: { onGoBack: () => void }) {
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">ডিজিটাল নাগরিক অধিকার ও রেকর্ড</p>
          <h1 className="text-4xl font-black mb-3 text-white">মৃত্যু নিবন্ধন</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলার যেকোনো নাগরিকের মৃত্যুর পর অনলাইন নিবন্ধন প্রক্রিয়া, সংশোধন, প্রয়োজনীয় সনদের আবেদন এবং ইউনিয়ন পরিষদের তথ্যাদি।
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
          onClick={() => setActiveTab('fees')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'fees' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💰</span> ফি ও সময়সীমা
        </button>
        <button 
          onClick={() => setActiveTab('union_contact')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'union_contact' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏛️</span> ইউনিয়ন যোগাযোগ
        </button>
      </div>

      {/* Main Death Registration Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📝
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নতুন মৃত্যু নিবন্ধন অনলাইন আবেদন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নতুন মৃত্যু নিবন্ধনের আবেদন (New Application Guide)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">⏳</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">সময়সীমা:</span> মৃত্যুর ৪৫ দিনের মধ্যে নিবন্ধন করা সম্পূর্ণ ফ্রি।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> মৃত ব্যক্তির অনলাইন জন্ম নিবন্ধন সার্টিফিকেট, এনআইডি (NID) কার্ডের কপি, মৃত্যুর সপক্ষে হাসপাতালের ডেথ সার্টিফিকেট অথবা স্থানীয় চৌকিদার/ইউপি সদস্যের প্রত্যয়নপত্র এবং আবেদনকারীর এনআইডি।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               মৃত ব্যক্তির মৃত্যুর রেকর্ড সরকারি ডাটাবেজে যুক্ত করতে এবং পারিবারিক পেনসন বা উত্তরাধিকার সনদের জন্য এটি প্রথম ধাপ। নিচের বাটন চেপে সরাসরি আবেদন ফর্ম পূরণ করুন।
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
              onClick={() => onSimulateLink('BDRIS Portal for Death Application')}
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
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">আবেদনের বর্তমান অবস্থা যাচাই</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">আবেদনের অবস্থা ও সার্টিফিকেট ডাউনলোড</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া পৌরসভা অথবা উপজেলার যেকোনো ইউনিয়ন পরিষদে জমা দেওয়া মৃত্যু নিবন্ধন আবেদনের বর্তমান অবস্থা (অনুমোদিত হয়েছে কি না) অ্যাপ্লিকেশন আইডি দিয়ে ট্র্যাক করুন।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('BDRIS Portal for Death Tracking')}
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
               💰
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">বিলম্বে মৃত্যু নিবন্ধনের ফি ও নিয়মাবলী</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">বিলম্বে নিবন্ধনের নিয়ম ও সরকারি ফি</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💵</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">সরকারি ফি:</span> মৃত্যুর ৪৫ দিনের মধ্যে ফ্রি। ৪৫ দিন থেকে ৫ বছর পর্যন্ত ২৫ টাকা। ৫ বছরের পর থেকে সরকারি ফি ৫০ টাকা।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">⚠️</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">বিশেষ নিয়ম:</span> মৃত্যুর বয়স ৫ বছরের বেশি হলে পুঠিয়া উপজেলা নির্বাহী অফিসার (UNO) বা সংশ্লিষ্ট কর্তৃপক্ষের বিশেষ অনুমতি এবং অতিরিক্ত কাগজপত্রের প্রয়োজন হয়。</p>
             </div>
          </div>
          
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('BDRIS Portal for Death Correction/Rules')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <FileText className="w-4 h-4" /> বিস্তারিত নিয়মাবলী
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="death_registration" 
            serviceName="মৃত্যু নিবন্ধন" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Search, FileText, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function EMutationInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("apply");
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">ডিজিটাল ল্যান্ড রেকর্ড ও ই-মিউটেশন</p>
          <h1 className="text-4xl font-black mb-3 text-white">ই-নামজারি সেবা</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলার যেকোনো মৌজার জমি কেনা বা উত্তরাধিকার সূত্রে পাওয়ার পর রেকর্ড সংশোধন, ই-নামজারি আবেদন প্রক্রিয়া, প্রয়োজনীয় ফি এবং ট্র্যাকিং নির্দেশিকা।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('apply')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'apply' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📜</span> নামজারি আবেদন
        </button>
        <button 
          onClick={() => setActiveTab('track')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'track' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🔍</span> আবেদন ট্র্যাকিং
        </button>
        <button 
          onClick={() => setActiveTab('fees')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'fees' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">💰</span> ফি ও পেমেন্ট
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'docs' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📑</span> প্রয়োজনীয় কাগজ
        </button>
      </div>

      {/* Main e-Mutation Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📜
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নতুন নামজারি ও জমাভাগ আবেদন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">ই-নামজারি অনলাইন আবেদন (Apply for e-Mutation)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> মূল দলিলের কপি, বায়া দলিলের কপি (প্রযোজ্য ক্ষেত্রে), সর্বশেষ খতিয়ান/পর্চা, ভূমি উন্নয়ন কর বা খাজনা পরিশোধের দাখিলা, ওয়ারিশান সনদ (উত্তরাধিকার সূত্রে হলে) এবং আবেদনকারীর জাতীয় পরিচয়পত্র ও ছবি।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               জমি কেনার পর মালিকানা স্থায়ী করতে এবং পরবর্তী খাজনা নিজের নামে দিতে ই-নামজারি আবশ্যিক। নিচের বাটন চেপে সরাসরি সরকারি ভূমি মন্ত্রণালয়ের নির্দিষ্ট পোর্টালে গিয়ে আবেদন সম্পন্ন করুন।
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
              onClick={() => onSimulateLink('e-Mutation Online Portal')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি ল্যান্ড পোর্টাল লিংক
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
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">আবেদনের সর্বশেষ অবস্থা ট্র্যাকিং</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নামজারি আবেদনের বর্তমান অবস্থা (Track e-Mutation)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলা ভূমি অফিসে আপনার করা আবেদনের বর্তমান অবস্থা (তহশিলদার রিপোর্ট, শুনানির তারিখ বা ডিসিআর কাটার অনুমতি) জানতে আপনার আবেদন আইডি ও মোবাইল নম্বর দিয়ে এখানে লাইভ ট্র্যাক করুন।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('e-Mutation Tracking Portal')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <Search className="w-4 h-4" /> লাইভ অবস্থা চেক করুন
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
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">ই-নামজারির নির্ধারিত সরকারি ফি</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">সরকারি নামজারি ফি (Mutation Fee Structure)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💵</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">মোট সরকারি ফি:</span> ২৮০ টাকা (আবেদন ফি ২০ টাকা + নোটিশ জারি ফি ৫০ টাকা + রেকর্ড সংশোধন ফি ২,০০০ টাকা + খতিয়ান সরবরাহ ফি ১০০ টাকা)।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">⚠️</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">বিশেষ সতর্কবার্তা:</span> ই-নামজারির জন্য সরকার নির্ধারিত মোট ফি ২৮০ টাকা। এই ফি সম্পূর্ণ অনলাইনে (বিকাশ/নগদ/রকেট বা ই-পেমেন্ট) দিতে হয়। কোনো অতিরিক্ত ক্যাশ লেনদেন করবেন না।</p>
             </div>
          </div>
          
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('e-Mutation Payment Guide')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <FileText className="w-4 h-4" /> পেমেন্ট গাইডলাইন দেখুন
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="e_mutation" 
            serviceName="ই-নামজারি" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

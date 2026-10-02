import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Download, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function NIDServicesInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("new_voter");
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">স্মার্ট বাংলাদেশ ও ডিজিটাল পরিচয়</p>
          <h1 className="text-4xl font-black mb-3 text-white">জাতীয় পরিচয়পত্র (NID)</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলা নির্বাচন অফিসের অধীনে নতুন ভোটার নিবন্ধন, এনআইডি কার্ড সংশোধন, স্মার্ট কার্ড বিতরণ আপডেট এবং অনলাইন কার্ড ডাউনলোডের সহজ গাইডলাইন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('new_voter')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'new_voter' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🪪</span> নতুন ভোটার
        </button>
        <button 
          onClick={() => setActiveTab('correction')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'correction' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🛠️</span> এনআইডি সংশোধন
        </button>
        <button 
          onClick={() => setActiveTab('download')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'download' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📥</span> কার্ড ডাউনলোড
        </button>
        <button 
          onClick={() => setActiveTab('office')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'office' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏢</span> নির্বাচন অফিস
        </button>
      </div>

      {/* Main NID Services Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🪪
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নতুন ভোটার হওয়ার নিয়ম ও আবেদন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নতুন ভোটার নিবন্ধন (New Voter Registration)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> অনলাইন জন্ম নিবন্ধন সনদ, শিক্ষাগত যোগ্যতার সার্টিফিকেট (JSC/SSC), পিতা-মাতার এনআইডি কার্ডের কপি, বাসার হোল্ডিং ট্যাক্সের রসিদ এবং নাগরিকত্ব প্রত্যয়নপত্র।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               ১৮ বছর বা তার বেশি বয়সী পুঠিয়ার নাগরিকরা অনলাইনে ফর্ম পূরণ করে প্রিন্ট কপিটি প্রয়োজনীয় কাগজপত্রসহ পুঠিয়া উপজেলা নির্বাচন অফিসে জমা দিয়ে ছবি ও আঙুলের ছাপ (Biometric) দিতে পারবেন।
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
              onClick={() => onSimulateLink('NID Portal for New Voter')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি NID পোর্টাল লিংক
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🛠️
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নাম, বয়স বা ঠিকানা সংশোধন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">এনআইডি কার্ডের তথ্য সংশোধন (NID Correction)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় প্রমাণপত্র:</span> এসএসসি/এইচএসসি সার্টিফিকেট, অনলাইন জন্ম নিবন্ধন, পাসপোর্ট বা পিতা-মাতার এনআইডি (সংশোধনের ক্যাটেগরি অনুযায়ী)।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💵</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">সরকারি ফি:</span> ক্যাটেগরি ভেদে ২৩০ টাকা থেকে ৪৬০ টাকা পর্যন্ত (বিকাশ/রকেটের মাধ্যমে সরকারি কোডে পে করা যায়)।</p>
             </div>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('NID Portal for Correction')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <ExternalLink className="w-4 h-4" /> অনলাইন সংশোধন পোর্টাল
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📥
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">ভোটার স্লিপ বা এনআইডি নম্বর দিয়ে ডাউনলোড</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">অনলাইন এনআইডি কপি ডাউনলোড (Instant Download)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               যারা নতুন ছবি তুলেছেন কিন্তু এখনো অরিজিনাল কার্ড পাননি, তারা ভোটার নিবন্ধনের ফর্ম নম্বর (Slip No) এবং জন্ম তারিখ ব্যবহার করে এনআইডি ওয়ালেট (NID Wallet) অ্যাপের ফেস ভেরিফিকেশনের মাধ্যমে তাৎক্ষণিকভাবে তাদের অনলাইন কপি ডাউনলোড করতে পারবেন।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('NID Portal for Download')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <Download className="w-4 h-4" /> আইডি কার্ড ডাউনলোড করুন
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="nid_service" 
            serviceName="এনআইডি ও ভোটার সেবা" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

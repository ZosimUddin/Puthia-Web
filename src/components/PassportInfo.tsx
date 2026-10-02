import React, { useState } from "react";
import { ArrowLeft, ExternalLink, Search, MapPin, Send } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ServiceApplicationForm } from "./ServiceApplicationForm";

export function PassportInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("online_application");
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
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">আন্তর্জাতিক ভ্রমণ ও ই-পাসপোর্ট সেবা</p>
          <h1 className="text-4xl font-black mb-3 text-white">ই-পাসপোর্ট সেবা</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             অনলাইনে ই-পাসপোর্ট আবেদন, ফি ও প্রয়োজনীয় কাগজপত্র, পুঠিয়া উপজেলার নাগরিকদের জন্য নির্ধারিত আঞ্চলিক পাসপোর্ট অফিস এবং জরুরি গাইডলাইন।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('online_application')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'online_application' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📝</span> অনলাইন আবেদন
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
          <span className="text-2xl">💰</span> পাসপোর্ট ফি
        </button>
        <button 
          onClick={() => setActiveTab('office')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'office' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏢</span> পাসপোর্ট অফিস
        </button>
      </div>

      {/* Main Passport Services Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               📝
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">নতুন ই-পাসপোর্ট আবেদন গাইডলাইন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নতুন ই-পাসপোর্ট আবেদন (e-Passport Online Application)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📂</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রয়োজনীয় কাগজপত্র:</span> অনলাইন জন্ম নিবন্ধন (BRC) অথবা এনআইডি (NID) কার্ডের কপি, পিতা-মাতার এনআইডি, পেশাগত প্রমাণপত্র (শিক্ষার্থী হলে স্টুডেন্ট আইডি/চাকরিজীবী হলে NOC), এবং পূর্ববর্তী পাসপোর্ট (যদি থাকে)।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               সরকারি অফিশিয়াল পোর্টালে গিয়ে ধাপ অনুযায়ী ফর্ম পূরণ করুন। পুঠিয়া উপজেলার স্থায়ী বাসিন্দাদের ছবি ও বায়োমেট্রিক প্রদানের জন্য রাজশাহী আঞ্চলিক পাসপোর্ট অফিসে যেতে হবে।
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
              onClick={() => onSimulateLink('e-Passport Portal')}
              className="text-sm font-bold text-gray-700 flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" /> সরকারি পাসপোর্ট পোর্টাল লিংক
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
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">আবেদনের লাইভ স্ট্যাটাস ট্র্যাক করুন</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">পাসপোর্টের বর্তমান অবস্থা যাচাই (Check Status)</div>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               আপনি পাসপোর্ট অফিসে বায়োমেট্রিক (ছবি ও আঙুলের ছাপ) দেওয়ার পর যে ডেলিভারি স্লিপ পেয়েছেন, সেটির অ্যাপ্লিকেশন আইডি (যেমন: 4000-XXXXXXXX) এবং আপনার জন্ম তারিখ দিয়ে পাসপোর্টের বর্তমান অবস্থা লাইভ চেক করুন।
             </p>
          </div>
          <div className="mt-5">
            <button 
              onClick={() => onSimulateLink('e-Passport Tracking Portal')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <Search className="w-4 h-4" /> লাইভ স্ট্যাটাস চেক
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
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">আঞ্চলিক পাসপোর্ট অফিস, রাজশাহী</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">নির্ধারিত আঞ্চলিক পাসপোর্ট অফিস (Regional Passport Office)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">ঠিকানা:</span> শালবাগান (সড়ক ও জনপদ ভবনের বিপরীতে), রাজশাহী।</p>
             </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলার সকল নাগরিকের ই-পাসপোর্টের ছবি, আঙুলের ছাপ, চোখের আইরিশ স্ক্যান এবং অরিজিনাল পাসপোর্ট ডেলিভারি নেওয়ার জন্য এই নির্ধারিত আঞ্চলিক অফিসে যোগাযোগ করতে হবে।
             </p>
          </div>
          <div className="mt-5">
            <button 
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-5 py-3.5 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> ম্যাপে লোকেশন দেখুন
            </button>
          </div>
        </div>

      </div>
      <AnimatePresence>
        {showApplyForm && (
          <ServiceApplicationForm 
            serviceType="passport" 
            serviceName="ই-পাসপোর্ট" 
            onClose={() => setShowApplyForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

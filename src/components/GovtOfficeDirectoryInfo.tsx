import React, { useState } from "react";
import { ArrowLeft, Phone, MapPin, Mail, Briefcase, BookOpen } from "lucide-react";
import { CitizenCharter } from "./CitizenCharter";

export function GovtOfficeDirectoryInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("all_offices");
  const [showCharter, setShowCharter] = useState(false);

  const onSimulateCall = (title: string) => {
    alert(`Calling ${title}... (Simulated)`);
  };

  const onSimulateMap = (title: string) => {
    alert(`Opening map for ${title}... (Simulated)`);
  };

  if (showCharter) {
    return <CitizenCharter onGoBack={() => setShowCharter(false)} />;
  }

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
        
        <button 
          onClick={() => setShowCharter(true)}
          className="absolute top-4 right-4 bg-white text-[#B71C1C] rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 shadow-md"
        >
          <BookOpen className="w-3.5 h-3.5" /> সিটিজেন চার্টার
        </button>

        <div className="mt-12 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">উপজেলা প্রশাসন ও জনপ্রতিনিধি ডিরেক্টরি</p>
          <h1 className="text-4xl font-black mb-3 text-white">সরকারি অফিস ডিরেক্টরি</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া উপজেলার সকল সরকারি দপ্তর, কর্মকর্তা-কর্মচারীদের অফিসিয়াল যোগাযোগ নম্বর, ইমেইল এবং কার্যালয়ের অবস্থান।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Category Filter Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('all_offices')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'all_offices' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏢</span> সব অফিস
        </button>
        <button 
          onClick={() => setActiveTab('upazila_admin')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'upazila_admin' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">⚖️</span> উপজেলা প্রশাসন
        </button>
        <button 
          onClick={() => setActiveTab('law_order')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'law_order' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">👮</span> আইন-শৃঙ্খলা
        </button>
        <button 
          onClick={() => setActiveTab('union_parishad')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'union_parishad' ? 'bg-[#B71C1C] text-white border-[#B71C1C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏥</span> ইউনিয়ন পরিষদ
        </button>
      </div>

      {/* Main Office Directory Feed */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               ⚖️
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">উপজেলা নির্বাহী অফিসারের কার্যালয় (UNO), পুঠিয়া</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">উপজেলা প্রশাসন (Top Administrative Head)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><Briefcase className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রধান কর্মকর্তা:</span> উপজেলা নির্বাহী অফিসার (ইউএনও)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><MapPin className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">ঠিকানা:</span> উপজেলা পরিষদ ভবন (১ম তলা), পুঠিয়া সদর।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><Mail className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">ইমেইল:</span> unoputhia@mopa.gov.bd</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলার প্রধান প্রশাসনিক ও নির্বাহী কার্যালয়। উপজেলার সামগ্রিক আইনশৃঙ্খলা, দুর্যোগ ব্যবস্থাপনা, উন্নয়নমূলক প্রকল্প এবং সরকারি সিদ্ধান্ত বাস্তবায়নের মূল কেন্দ্রবিন্দু।
             </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button 
              onClick={() => onSimulateCall('ইউএনও অফিস')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#B71C1C] hover:bg-[#D32F2F] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-4 h-4" /> ইউএনও অফিস কল
            </button>
            <button 
              onClick={() => onSimulateMap('ইউএনও অফিস')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-4 py-3.5 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> ম্যাপে অফিস
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               👮
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">পুঠিয়া থানা (বাংলাদেশ পুলিশ)</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">আইন-শৃঙ্খলা ও নিরাপত্তা (Law & Order)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><Briefcase className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রধান কর্মকর্তা:</span> অফিসার ইনচার্জ (OC)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><MapPin className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">ঠিকানা:</span> পুঠিয়া মডেল থানা, নাটোর-রাজশাহী হাইওয়ে সংলগ্ন, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               পুঠিয়া উপজেলার নাগরিকদের আইনি সহায়তা, নিরাপত্তা নিশ্চিতকরণ, জিডি/মামলা গ্রহণ এবং যেকোনো জরুরি অপরাধ দমনে ২৪ ঘণ্টা নিয়োজিত প্রধান থানা কার্যালয়।
             </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button 
              onClick={() => onSimulateCall('ডিউটি অফিসার')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#B71C1C] hover:bg-[#D32F2F] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-4 h-4" /> ডিউটি অফিসারকে কল
            </button>
            <button 
              onClick={() => onSimulateMap('পুঠিয়া থানা')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-4 py-3.5 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> থানা লোকেশন
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#B71C1C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#B71C1C]/20">
               🏛️
            </div>
            <div>
              <h4 className="font-serif font-black text-[#B71C1C] text-xl leading-tight mb-1">বানেশ্বর ইউনিয়ন পরিষদ কার্যালয়</h4>
              <div className="text-xs text-gray-500 font-bold mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block">স্থানীয় সরকার (Local Government - Union)</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><Briefcase className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">প্রধান কর্মকর্তা:</span> ইউপি চেয়ারম্যান / সচিব</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5 text-[#B71C1C]"><MapPin className="w-4 h-4"/></span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-[#B71C1C]">ঠিকানা:</span> বানেশ্বর বাজার সংলগ্ন, পুঠিয়া, রাজশাহী।</p>
             </div>
          </div>
          
          <div className="mt-4 bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-[#B71C1C] block mb-1">📝 বিবরণ:</span> 
               স্থানীয় নাগরিকদের চারিত্রিক সনদ, নাগরিকত্ব সার্টিফিকেট, ওয়ারিশান সনদ এবং গ্রাম্য আদালতের মাধ্যমে তৃণমূল পর্যায়ের সেবা প্রদানের প্রধান কার্যালয়।
             </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button 
              onClick={() => onSimulateCall('ইউপি সচিব')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#B71C1C] hover:bg-[#D32F2F] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-4 h-4" /> ইউপি সচিবকে কল
            </button>
            <button 
              onClick={() => onSimulateMap('ইউপি কার্যালয়')}
              className="text-sm font-bold text-[#B71C1C] flex items-center justify-center gap-2 w-full bg-[#B71C1C]/10 hover:bg-[#B71C1C]/20 border border-[#B71C1C]/20 px-4 py-3.5 rounded-xl transition"
            >
              <MapPin className="w-4 h-4" /> ইউপি কার্যালয়
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

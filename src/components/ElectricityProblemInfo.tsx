import React, { useState } from "react";
import { ArrowLeft, Phone, Globe, Camera, Edit3, Search } from "lucide-react";

export function ElectricityProblemInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");

  const onSimulateAction = (actionName: string) => {
    alert(`${actionName}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      
      {/* Hero Banner Section */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #4A148C, #7B1FA2)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white/80 text-sm font-bold mb-2 uppercase tracking-wide">নিরবিচ্ছিন্ন বিদ্যুৎ সেবা</p>
          <h1 className="text-4xl font-black mb-3 text-white">বিদ্যুৎ সংক্রান্ত অভিযোগ</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white/50 pl-3 py-1">
             পুঠিয়া পল্লী বিদ্যুৎ/নেসকো জোনাল অফিসের অধীনে লোডশেডিং, ট্রান্সফর্মার সমস্যা বা জরুরি লাইন মেরামতের ডিরেক্টরি।
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-16 -mb-16 blur-xl"></div>
      </div>

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('tab1')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab1' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">⚡</span> লাইন অভিযোগ
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🔌</span> মিটার ও বিল সমস্যা
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🛠️</span> জরুরি মেরামত
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#4A148C] text-white border-[#4A148C] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🏢</span> বিদ্যুৎ অফিস কন্টাক্ট
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4A148C]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#4A148C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#4A148C]/20">
               ⚡
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">পুঠিয়া পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র</h4>
            </div>
          </div>
          
          <div className="mt-4 bg-[bg-purple-50] p-4 rounded-2xl border border-purple-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-[#4A148C] block mb-1">📝 বিবরণ:</span> 
               তার ছিঁড়ে যাওয়া, ট্রান্সফর্মার বিকল বা দীর্ঘক্ষণ লোডশেডিং থাকলে সরাসরি পুঠিয়া সাব-স্টেশনের ডিউটি অফিসারের সাথে যোগাযোগ করুন।
             </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            <button 
              onClick={() => onSimulateAction('Calling Puthia Palli Bidyut')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#4A148C] hover:bg-[#7B1FA2] px-4 py-3.5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Phone className="w-4 h-4" /> পুঠিয়া অভিযোগ কেন্দ্র (কল)
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#4A148C]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#4A148C]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#4A148C]/20">
               ⚡
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">বানেশ্বর বিদ্যুৎ অভিযোগ কেন্দ্র</h4>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-gray-900 block mb-1">📝 বিবরণ:</span> 
               বানেশ্বর ও আশেপাশের এলাকার বিদ্যুৎ বিভ্রাটের তাৎক্ষণিক সমাধান ও লাইন মেরামতের জরুরি কন্টাক্ট।
             </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-5 pl-2">
            <button 
              onClick={() => onSimulateAction('Calling Baneswar Bidyut')}
              className="text-sm font-bold text-[#4A148C] flex items-center justify-center gap-2 w-full bg-[#4A148C]/10 hover:bg-[#4A148C]/20 border border-[#4A148C]/20 px-4 py-3.5 rounded-xl transition"
            >
              <Phone className="w-4 h-4" /> বানেশ্বর অভিযোগ কেন্দ্র
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

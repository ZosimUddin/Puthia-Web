import React, { useState } from 'react';

export const JobAdsInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="font-sans">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #E53935, #FF7043)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-white text-sm font-bold mb-2 uppercase tracking-wide">ক্যারিয়ার ও কর্মসংস্থান</p>
          <h1 className="text-4xl font-black mb-3 text-white">চাকরি বিজ্ঞাপন</h1>
          <p className="text-gray-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white pl-3 py-1">
             পুঠিয়া উপজেলা এবং রাজশাহী অঞ্চলের সকল প্রকার সরকারি-বেসরকারি চাকরির বিজ্ঞপ্তি, ইন্টার্নশিপ এবং পার্ট-টাইম কাজের আপডেট।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'all', label: 'সব জবস', emoji: '💼' },
          { id: 'private', label: 'বেসরকারি প্রতিষ্ঠান', emoji: '🏢' },
          { id: 'education', label: 'শিক্ষা ও টিউটোরিয়াল', emoji: '🏫' },
          { id: 'recent', label: 'নতুন বিজ্ঞপ্তি', emoji: '📝' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#FF7043] text-white border-[#FF7043] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Job Listing Feed Section */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FBE9E7] text-[#D84315] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFAB91]">
               🏢
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">সেলস অ্যান্ড মার্কেটিং এক্সিকিউটিভ</h4>
              <p className="text-sm text-[#E53935] font-bold mt-1">পুঠিয়া ফুড এন্ড এগ্রো ইন্ডাস্ট্রিজ</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> বানেশ্বর শিল্প এলাকা, পুঠিয়া।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📅</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">শেষ তারিখ:</span> ৩০ জুন, ২০২৬</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">সংক্ষিপ্ত বিবরণ:</span> 
               পণ্য বিপণন এবং স্থানীয় ডিলারদের সাথে যোগাযোগ রক্ষার জন্য উদ্যমী ও স্মার্ট কর্মী প্রয়োজন। বেতন আলোচনার সাপেক্ষে, সাথে টিএ/ডিএ সুবিধা।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 সরাসরি আবেদন করুন
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🏫
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">সহকারী শিক্ষক (গণিত ও ইংরেজি)</h4>
              <p className="text-sm text-[#2E7D32] font-bold mt-1">পুঠিয়া আইডিয়াল একাডেমি</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> পুঠিয়া সদর, রাজশাহী।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📅</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">শেষ তারিখ:</span> ১৫ জুলাই, ২০২৬</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">সংক্ষিপ্ত বিবরণ:</span> 
               প্রাইমারি ও হাই স্কুল পর্যায়ের শিক্ষার্থীদের কোচিং ও টিউটোরিয়াল দেওয়ার জন্য দক্ষ শিক্ষক প্রয়োজন। সম্মানী আলোচনা সাপেক্ষে।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 কথা বলুন
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E3F2FD] text-[#1565C0] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#90CAF9]">
               📝
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">ফিল্ড অফিসার (প্রকল্পভিত্তিক)</h4>
              <p className="text-sm text-[#1565C0] font-bold mt-1">আশা / ব্র্যাক (পুঠিয়া শাখা)</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> সমগ্র পুঠিয়া উপজেলা।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📅</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">শেষ তারিখ:</span> দ্রুত যোগাযোগ করুন</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">সংক্ষিপ্ত বিবরণ:</span> 
               গ্রামীণ উন্নয়ন ও ঋণ কার্যক্রম পরিচালনার জন্য ফিল্ড অফিসার নিয়োগ চলছে। ন্যূনতম এইচএসসি পাস। বাইক থাকা আবশ্যক।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 ডিটেইলস জানতে কল
          </button>
        </div>

      </div>
    </div>
  );
};

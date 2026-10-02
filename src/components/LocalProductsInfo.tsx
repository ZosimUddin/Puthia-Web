import React, { useState } from 'react';

export const LocalProductsInfo = ({ onGoBack }: { onGoBack: () => void }) => {
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
          <p className="text-white text-sm font-bold mb-2 uppercase tracking-wide">আমাদের ঐতিহ্য ও খাঁটি পণ্য</p>
          <h1 className="text-4xl font-black mb-3 text-white">স্থানীয় পণ্য সম্ভার</h1>
          <p className="text-gray-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white pl-3 py-1">
             পুঠিয়ার বিখ্যাত আম, গুড়, খাঁটি সরিষার তেল এবং স্থানীয় উদ্যোক্তাদের তৈরি শতভাগ বিশুদ্ধ ও ঐতিহ্যবাহী পণ্যের সরাসরি বাজার।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'all', label: 'সব দেশি পণ্য', emoji: '🌾' },
          { id: 'fruits_sweets', label: 'ফল ও মিষ্টি', emoji: '🥭' },
          { id: 'pure_food', label: 'খাঁটি খাদ্য উপাদান', emoji: '🍯' },
          { id: 'handicraft', label: 'হস্তশিল্প ও কুটির শিল্প', emoji: '🧵' }
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

      {/* Local Products Feed Section */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FBE9E7] text-[#D84315] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFAB91]">
               🍯
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">পুঠিয়ার খাঁটি খেজুরের হাজারী গুড় / পাটালি</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Top Priority</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">👤</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">উদ্যোক্তা/বিক্রেতা:</span> পুঠিয়া পিওর ফুডস (মোঃ আশরাফুল ইসলাম)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> ৩৫০ টাকা (প্রতি কেজি)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> ঝলমলিয়া, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               কোনো প্রকার কৃত্রিম চিনি বা কেমিক্যাল ছাড়া শীতকালে সরাসরি গাছির কাছ থেকে সংগৃহীত খাঁটি রস দিয়ে তৈরি ঐতিহ্যবাহী খেজুরের পাটালি গুড়। শতভাগ সুঘ্রাণ ও স্বাদের নিশ্চয়তা।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 অর্ডার করতে কল করুন
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🥭
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">গাছপাকা ল্যাংড়া ও গোপালভোগ আম (ফরমালিন মুক্ত)</h4>
              <p className="text-sm text-[#E53935] font-bold mt-1">Seasonal Best</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">👤</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">উদ্যোক্তা/বিক্রেতা:</span> বানেশ্বর ম্যাঙ্গো ডাইরেক্ট (উদ্যোক্তা রিফাত হাসান)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> বর্তমান বাজার মূল্য অনুযায়ী (পাইকারি ও খুচরা)।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> বানেশ্বর বাজার (আমের আড়ৎ এলাকা), পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               সরাসরি পুঠিয়ার নিজস্ব বাগান থেকে ক্যারেট হিসেবে আম সংগ্রহ করে কুরিয়ারে বা সরাসরি সরবরাহ করা হয়। কার্বাইড বা কোনো ক্ষতিকর কেমিক্যাল মুক্ত ১০০% ন্যাচারাল আম।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 আমের অর্ডার বুক করুন
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FFF8E1] text-[#F57F17] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFE082]">
               🌾
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">কাঠের ঘানিতে ভাঙা খাঁটি সরিষার তেল</h4>
              <p className="text-sm text-[#F57F17] font-bold mt-1">খাঁটি খাদ্য উপাদান</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">👤</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">উদ্যোক্তা/বিক্রেতা:</span> সততা এগ্রো ফার্ম</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> ২৪০ টাকা (প্রতি লিটার)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> থানা রোড, পুঠিয়া সদর।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               স্থানীয়ভাবে উৎপাদিত বাছাইকৃত মাঘী সরিষা থেকে কাঠের ঘানির সাহায্যে কোল্ড প্রেস পদ্ধতিতে তৈরি ঝাজালো ও সুগন্ধি সরিষার তেল, যা স্বাস্থ্যের জন্য সম্পূর্ণ নিরাপদ।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 যোগাযোগ করুন
          </button>
        </div>

      </div>
    </div>
  );
};

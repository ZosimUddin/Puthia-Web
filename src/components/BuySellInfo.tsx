import React, { useState } from 'react';

export const BuySellInfo = ({ onGoBack }: { onGoBack: () => void }) => {
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
          <p className="text-white text-sm font-bold mb-2 uppercase tracking-wide">পুঠিয়ার নিজস্ব বাজার</p>
          <h1 className="text-4xl font-black mb-3 text-white">ক্রয়-বিক্রয় মার্কেট</h1>
          <p className="text-gray-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white pl-3 py-1">
             পুঠিয়া উপজেলার যেকোনো নতুন বা পুরাতন জিনিসপত্র সরাসরি কেনা-বেচা করার নির্ভরযোগ্য মাধ্যম। কোনো মধ্যস্বত্বভোগী ছাড়াই সরাসরি বিক্রেতার সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'all', label: 'সব পণ্য', emoji: '📱' },
          { id: 'vehicle', label: 'বাইক ও গাড়ি', emoji: '🏍️' },
          { id: 'electronics', label: 'ইলেকট্রনিক্স', emoji: '💻' },
          { id: 'property', label: 'জমি ও বাসা ভাড়া', emoji: '🏠' }
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

      {/* Marketplace Feed Section */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FBE9E7] text-[#D84315] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFAB91]">
               📱
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">Realme C55 (ব্যবহৃত / Used)</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Top Priority</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> ১২,৫০০ টাকা (আলোচনা সাপেক্ষ)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> পুঠিয়া বাজার, পুঠিয়া সদর।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               মাত্র ৫ মাস ব্যবহার করা হয়েছে, কোনো ইন্টারনাল বা এক্সটারনাল সমস্যা নেই। অফিশিয়াল বক্স এবং অরিজিনাল চার্জার সাথে দেওয়া হবে। টাকার জরুরি প্রয়োজনের কারণে বিক্রি করা হচ্ছে।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 বিক্রেতাকে কল করুন
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E3F2FD] text-[#1565C0] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#90CAF9]">
               🏍️
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">Bajaj Discover 125cc (২০২২ মডেল)</h4>
              <p className="text-sm text-[#1565C0] font-bold mt-1">যানবাহন / মোটরবাইক</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> ৯৫,০০০ টাকা</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> বানেশ্বর ট্রাফিক মোড়, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               নাটোর-ল নম্বর প্লেট, ডিজিটাল নম্বর প্লেট ও স্মার্ট কার্ড রেডি। ১ম মালিক, ১০,৫০০ কি.মি. রান করেছে। বাইক একদম ফ্রেশ কন্ডিশনে আছে, এসে দেখে নিতে পারেন।
             </p>
          </div>
          <button className="text-sm font-bold text-[#1565C0] mt-5 flex items-center justify-center gap-2 w-full bg-[#E3F2FD] hover:bg-[#BBDEFB] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 সরাসরি যোগাযোগ
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🏠
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">পুঠিয়া রাজবাড়ির পাশে ৩ শতক ডাঙ্গা জমি বিক্রয়</h4>
              <p className="text-sm text-[#2E7D32] font-bold mt-1">জমি / প্রোপার্টি</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">💰</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">মূল্য:</span> ৭,৫০,০০০ টাকা (প্রতি শতক)</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">লোকেশন:</span> রাজবাড়ি সংলগ্ন আবাসিক এলাকা, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">পণ্যের বিবরণ:</span> 
               একদম নিষ্কণ্টক এবং শতভাগ ফ্রেশ দলিল। চারপাশ বাউন্ডারি করা এবং প্রধান সড়কের সাথে সংযোগ রয়েছে। এখনই বাড়ি করার উপযোগী চমৎকার পরিবেশ।
             </p>
          </div>
          <button className="text-sm font-bold text-[#2E7D32] mt-5 flex items-center justify-center gap-2 w-full bg-[#E8F5E9] hover:bg-[#C8E6C9] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 মালিকের সাথে কথা বলুন
          </button>
        </div>

      </div>
    </div>
  );
};

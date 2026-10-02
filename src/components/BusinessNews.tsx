import React, { useState } from 'react';

export const BusinessNews = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState("latest");

  return (
    <div className="font-sans">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #B71C1C, #37474F)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6">
          <p className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wide">ব্যবসা ও অর্থনীতি</p>
          <h1 className="text-4xl font-black mb-3 text-white">ব্যবসা সংবাদ</h1>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            উপজেলার বাজার পরিস্থিতি, নতুন ব্যবসা উদ্যোগ, কৃষি অর্থনীতি এবং স্থানীয় বাজারের সর্বশেষ সংবাদ।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'latest', label: 'সর্বশেষ সংবাদ', emoji: '💼' },
          { id: 'market_price', label: 'বাজার দর', emoji: '📈' },
          { id: 'new_business', label: 'নতুন উদ্যোগ', emoji: '🏢' },
          { id: 'agri_economy', label: 'কৃষি অর্থনীতি', emoji: '🤝' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition cursor-pointer border ${
                isActive
                  ? "bg-[#EF5350] text-white border-[#EF5350] shadow-md"
                  : "bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`}>{tab.emoji}</span>
              <span className="font-extrabold text-[9px] sm:text-[11px] text-center leading-tight tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Business News Feed Section */}
      <div className="space-y-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
             <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=80" alt="নতুন উদ্যোগ" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">পুঠিয়ায় স্থানীয় উদ্যোক্তাদের নিয়ে ই-কমার্স প্রশিক্ষণ কর্মশালা সম্পন্ন</h4>
              <div className="flex gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ২ ঘণ্টা আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 পুঠিয়া সদর</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">বর্তমান ডিজিটাল যুগে ব্যবসাকে আরও প্রসারিত করার লক্ষ্যে স্থানীয় ক্ষুদ্র ও মাঝারি উদ্যোক্তাদের জন্য দিনব্যাপী ই-কমার্স বিষয়ক এক বিশেষ প্রশিক্ষণ কর্মশালা অনুষ্ঠিত হয়েছে।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
             <img src="https://images.unsplash.com/photo-1623192070732-20531cc20c57?auto=format&fit=crop&w=500&q=80" alt="বাজার দর ও কৃষি" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">বানেশ্বর হাটে আম ও গুড়ের ব্যাপক চাহিদা, দাম নিয়ে সন্তুষ্ট বিক্রেতারা</h4>
              <div className="flex gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ গতকাল</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 বানেশ্বর বাজার</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">রাজশাহীর অন্যতম বৃহৎ পাইকারি হাট বানেশ্বরে বর্তমানে আম ও খেজুরের গুড়ের ব্যাপক চাহিদা দেখা যাচ্ছে। দূরদূরান্ত থেকে আসা পাইকারদের কারণে এবার ভালো দাম পাচ্ছেন স্থানীয় ব্যবসায়ীরা।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
             <img src="https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&w=500&q=80" alt="আর্থিক সহায়তা" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">কৃষি ঋণ সহজীকরণে ব্যাংকগুলোর সাথে বণিক সমিতির বিশেষ মতবিনিময় সভা</h4>
              <div className="flex gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ৩ দিন আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 উপজেলা পরিষদ</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">স্থানীয় কৃষিনির্ভর ব্যবসা এবং খামারীদের জন্য ব্যাংক লোন পদ্ধতি সহজ করতে বণিক সমিতি এবং ব্যাংক কর্মকর্তাদের মধ্যে একটি গুরুত্বপূর্ণ আলোচনা সভা অনুষ্ঠিত হয়েছে।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

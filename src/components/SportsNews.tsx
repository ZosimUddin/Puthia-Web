import React, { useState } from 'react';

export const SportsNews = ({ onGoBack }: { onGoBack: () => void }) => {
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
          <p className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wide">মাঠের খবর</p>
          <h1 className="text-4xl font-black mb-3 text-white">খেলাধুলা সংবাদ</h1>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়া উপজেলার বিভিন্ন ইউনিয়নের ফুটবল, ক্রিকেট টুর্নামেন্ট, গ্রামীণ ঐতিহ্যবাহী খেলা এবং স্থানীয় খেলোয়াড়দের সফলতার সব খবর।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'latest', label: 'সর্বশেষ খেলা', emoji: '⚽' },
          { id: 'cricket_football', label: 'ক্রিকেট ও ফুটবল', emoji: '🏏' },
          { id: 'traditional', label: 'ঐতিহ্যবাহী খেলা', emoji: '🏹' },
          { id: 'player_profile', label: 'খেলোয়াড় প্রোফাইল', emoji: '🏅' }
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

      {/* Sports News Feed Section */}
      <div className="space-y-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1518605368461-1e1252277d70?auto=format&fit=crop&w=500&q=80" alt="লোকাল টুর্নামেন্ট" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">পুঠিয়া রাজবাড়ী মাঠে জমকালো ফুটবল টুর্নামেন্টের ফাইনাল সম্পন্ন</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ৫ ঘণ্টা আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 পুঠিয়া সদর</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">পুঠিয়া স্পোর্টিং ক্লাবের উদ্যোগে আয়োজিত ৮ দলীয় ফুটবল টুর্নামেন্টের ফাইনাল ম্যাচ আজ অনুষ্ঠিত হয়েছে। ট্রাইবেকারে বানেশ্বর একাদশকে হারিয়ে চ্যাম্পিয়ন ট্রফি লুফে নিয়েছে ভালুকগাছি ইউনিয়ন যুব সংঘ।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=500&q=80" alt="ঐতিহ্যবাহী গ্রামীণ খেলা" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">বেলপুকুরে ঐতিহ্যবাহী লাঠিখেলা দেখতে হাজারো মানুষের ঢল</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ গতকাল</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 বেলপুকুর ইউনিয়ন</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">গ্রামীণ ঐতিহ্য ধরে রাখতে বেলপুকুর হাই স্কুল মাঠে দিনব্যাপী এক বিশাল লাঠিখেলা প্রতিযোগিতার আয়োজন করা হয়। পুঠিয়া ও আশেপাশের উপজেলার বিভিন্ন লাঠিয়াল দল এই খেলায় অংশ নেয়।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=500&q=80" alt="কৃতি খেলোয়াড়" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">রাজশাহী অনূর্ধ্ব-১৯ ক্রিকেট দলে পুঠিয়ার শান্তর সুযোগ</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ২ দিন আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 জিউপাড়া</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">পুঠিয়া উপজেলার জিউপাড়া গ্রামের উদীয়মান পেস বোলার নাজমুল হুদা শান্ত অসাধারণ পারফরম্যান্সের সুবাদে রাজশাহী বিভাগীয় অনূর্ধ্ব-১৯ ক্রিকেট দলে ডাক পেয়েছেন। শান্তর এই সাফল্যে পুঠিয়ার ক্রীড়াঙ্গনে আনন্দের বন্যা।</p>
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


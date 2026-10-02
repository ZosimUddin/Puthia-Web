import React, { useState } from 'react';

export const EduNews = ({ onGoBack }: { onGoBack: () => void }) => {
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
          <p className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wide">শিক্ষা ও ক্যাম্পাস</p>
          <h1 className="text-4xl font-black mb-3 text-white">শিক্ষা সংবাদ</h1>
          <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
            পুঠিয়া উপজেলার সকল শিক্ষা প্রতিষ্ঠানের একাডেমিক নোটিশ, পরীক্ষার ফলাফল, সরকারি নির্দেশনা এবং শিক্ষা খাতের সর্বশেষ আপডেট।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'latest', label: 'সর্বশেষ শিক্ষা সংবাদ', emoji: '🎓' },
          { id: 'notice', label: 'স্কুল ও কলেজ নোটিশ', emoji: '🏫' },
          { id: 'result', label: 'পরীক্ষা ও ফলাফল', emoji: '📝' },
          { id: 'award', label: 'কৃতিত্ব ও পুরষ্কার', emoji: '🏅' }
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

      {/* Education News Feed Section */}
      <div className="space-y-5">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=500&q=80" alt="ফলাফল ও কৃতিত্ব" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">এসএসসি (SSC) পরীক্ষায় পুঠিয়া উপজেলায় পাসের হারে শীর্ষে সরকারি পি এন স্কুল</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ৩ ঘণ্টা আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 পুঠিয়া সদর</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">সদ্য প্রকাশিত এসএসসি পরীক্ষার ফলাফলে পুঠিয়া উপজেলার মধ্যে পাসের হার ও জিপিএ-৫ প্রাপ্তিতে সেরা সাফল্য অর্জন করেছে পুঠিয়া পি এন সরকারি উচ্চ বিদ্যালয়। এই সাফল্যে শিক্ষক, শিক্ষার্থী ও অভিভাবকদের মাঝে উৎসবের আমেজ।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=500&q=80" alt="সরকারি নির্দেশনা ও স্কলারশিপ" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">উপজেলার মাধ্যমিক স্তরের শিক্ষার্থীদের মাঝে বিনামূল্যে উপবৃত্তির ফরম বিতরণ শুরু</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ গতকাল</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 উপজেলা শিক্ষা অফিস</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">পুঠিয়া উপজেলার সকল সরকারি ও বেসরকারি মাধ্যমিক বিদ্যালয়ের যোগ্য ও অসচ্ছল শিক্ষার্থীদের মাঝে ২০২৬ সালের উপবৃত্তির আবেদন ফরম বিতরণ শুরু হয়েছে। আগামী সপ্তাহের মধ্যে ফরম পূরণ করে জমা দিতে হবে।</p>
            </div>
            <button className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl">
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition">
          <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
             <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=500&q=80" alt="সহ-শিক্ষা কার্যক্রম" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1 flex-1">
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3">পুঠিয়া মডেল সরকারি প্রাথমিক বিদ্যালয়ে দিনব্যাপী বিজ্ঞান মেলা ও পুরস্কার বিতরণী</h4>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-bold mb-3">
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ ২ দিন আগে</span>
                 <span className="bg-gray-100 px-2.5 py-1 rounded-full">📍 পুঠিয়া সদর</span>
              </div>
              <p className="text-sm text-gray-600 font-sans leading-relaxed">খুদে শিক্ষার্থীদের মাঝে বিজ্ঞানের আগ্রহ তৈরিতে পুঠিয়া মডেল সরকারি প্রাথমিক বিদ্যালয়ে একটি বিজ্ঞান মেলা অনুষ্ঠিত হয়েছে। মেলা শেষে বিজয়ী প্রজেক্টগুলোর মাঝে পুরস্কার বিতরণ করেন উপজেলা শিক্ষা অফিসার।</p>
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

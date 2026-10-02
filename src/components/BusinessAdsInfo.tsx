import React, { useState } from 'react';

export const BusinessAdsInfo = ({ onGoBack }: { onGoBack: () => void }) => {
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
          <p className="text-white text-sm font-bold mb-2 uppercase tracking-wide">লোকাল বিজনেস ও ব্র্যান্ড প্রমোশন</p>
          <h1 className="text-4xl font-black mb-3 text-white">ব্যবসায়িক বিজ্ঞাপন</h1>
          <p className="text-gray-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-white pl-3 py-1">
             পুঠিয়া উপজেলার সকল দোকানপাট, শোরুম, রেস্টুরেন্ট ও সেবামূলক প্রতিষ্ঠানের নতুন কালেকশন, বিশেষ ছাড় এবং অফারের ডিজিটাল ডিরেক্টরি।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mt-5 mb-5 px-1 font-sans">
        {[
          { id: 'all', label: 'সব বিজ্ঞাপন', emoji: '📢' },
          { id: 'shop_showroom', label: 'দোকান ও শোরুম', emoji: '🛍️' },
          { id: 'restaurant_food', label: 'রেস্টুরেন্ট ও ফুড', emoji: '🍽️' },
          { id: 'diagnostic', label: 'ডায়াগনস্টিক ও সেবা', emoji: '🏥' }
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

      {/* Business Ad Feed Section */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FBE9E7] text-[#D84315] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFAB91]">
               🛍️
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">লুনা ফ্যাশন গ্যালারি (Luna Fashion Gallery)</h4>
              <p className="text-sm text-[#E53935] font-bold mt-1">Top Priority</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">🏷️</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">অফার/বিজ্ঞাপন:</span> ঈদ ও উৎসব উপলক্ষে সব পোশাকে ২০% পর্যন্ত ফ্ল্যাট ডিসকাউন্ট!</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">ঠিকানা:</span> পুঠিয়া সুপার মার্কেট (২য় তলা), পুঠিয়া সদর।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">বিবরণ:</span> 
               আমাদের এখানে ছেলে ও মেয়েদের সব ধরনের আধুনিক ও ট্রেন্ডি থ্রি-পিস, লেহেঙ্গা, পাঞ্জাবি এবং কসমেটিকসের বিশাল কালেকশন রয়েছে। আজই ভিজিট করুন অথবা অনলাইনে অর্ডার করতে আমাদের সাথে যোগাযোগ করুন।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 সরাসরি যোগাযোগ করুন
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#FFF3E0] text-[#E65100] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#FFCC80]">
               🍽️
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">ক্যাফে ডি পুঠিয়া ও চাইনিজ রেস্টুরেন্ট</h4>
              <p className="text-sm text-[#E65100] font-bold mt-1">রেস্টুরেন্ট / ফুড কোড</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">🏷️</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">অফার/বিজ্ঞাপন:</span> যেকোনো ফ্যামিলি প্যাকেজে ফ্রি কোল্ড ড্রিংকস এবং ফ্রি হোম ডেলিভারি!</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">ঠিকানা:</span> রাজবাড়ি মেইন গেটের বিপরীতে, পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">বিবরণ:</span> 
               পুঠিয়া রাজবাড়ি ভ্রমণে আসা পর্যটক এবং স্থানীয় ভোজনরসিকদের জন্য মনোরম পরিবেশে চিলড্রেন জোনসহ একমাত্র লাক্সারি রেস্টুরেন্ট। আমাদের স্পেশাল কাচ্চি বিরিয়ানি ও ক্রিস্পি ফ্রাইড চিকেন চেখে দেখার আমন্ত্রণ রইল।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 খাবার অর্ডার করুন
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 border-white outline outline-2 outline-[#A5D6A7]">
               🏥
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">পুঠিয়া ডিজিটাল ডায়াগনস্টিক অ্যান্ড কনসালটেশন সেন্টার</h4>
              <p className="text-sm text-[#2E7D32] font-bold mt-1">স্বাস্থ্যসেবা / ডায়াগনস্টিক সেন্টার</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">🏷️</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">অফার/বিজ্ঞাপন:</span> অভিজ্ঞ ডক্টরস প্যানেল এবং ডিজিটাল ল্যাব টেস্ট সুবিধা।</p>
             </div>
             <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm mt-0.5">📍</span> 
                <p className="text-sm text-gray-600 font-medium"><span className="font-bold text-gray-800">ঠিকানা:</span> থানা রোড (সরকারি হাসপাতালের পাশে), পুঠিয়া।</p>
             </div>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-600 font-sans leading-relaxed">
               <span className="font-bold text-gray-700 block mb-1">বিবরণ:</span> 
               রাজশাহী মেডিকেল কলেজের অভিজ্ঞ কনসালট্যান্ট দ্বারা নিয়মিত রোগী দেখা হয়। এখানে আধুনিক ইসিজি, আল্ট্রাসোনোগ্রাফি ও সব ধরনের রক্ত পরীক্ষা নির্ভুলভাবে করা হয়।
             </p>
          </div>
          <button className="text-sm font-bold text-white mt-5 flex items-center justify-center gap-2 w-full bg-[#E53935] hover:bg-[#C62828] px-5 py-3.5 rounded-xl shadow-sm transition">
            📞 সিরিয়াল ও তথ্যের জন্য কল
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, LayoutGrid, MapPin, Users, Building, Phone } from 'lucide-react';

export function AdministrationUnions({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState('list');

  const unions = [
    { name: "১নং পুঠিয়া ইউনিয়ন", chair: "মোঃ খলিলুর রহমান" },
    { name: "২নং বেলপুকুর ইউনিয়ন", chair: "মোঃ আব্দুর রউফ" },
    { name: "৩নং বানেশ্বর ইউনিয়ন", chair: "মোঃ আব্দুল রাজ্জাক" },
    { name: "৪নং ভালুকগাছী ইউনিয়ন", chair: "মোঃ জিল্লুর রহমান" },
    { name: "৫নং শিলমাড়িয়া ইউনিয়ন", chair: "মোঃ সাজ্জাদ হোসেন" },
    { name: "৬নং জিউপাড়া ইউনিয়ন", chair: "হোসনে আরা খাতুন" }
  ];

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white relative overflow-hidden rounded-[40px] shadow-xl shadow-blue-900/10">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <LayoutGrid className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <button 
              onClick={onGoBack} 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all font-bold text-sm backdrop-blur-sm mb-6 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </button>

            <div className="text-emerald-500 text-sm font-black uppercase tracking-wider mb-2 drop-shadow-sm">
              ইউনিয়ন পরিষদ তথ্য
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">সকল ইউনিয়ন</h1>

            <div className="pl-4 border-l-4 border-amber-400 max-w-xl">
              <p className="text-blue-50 text-sm sm:text-base leading-relaxed opacity-90">
                পুঠিয়া উপজেলার ৬টি ইউনিয়ন পরিষদের সামগ্রিক তথ্য, জনপ্রতিনিধি ও নাগরিক সেবাসমূহ।
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: 'list', label: 'ইউনিয়ন তালিকা', icon: MapPin },
            { id: 'members', label: 'চেয়ারম্যান', icon: Users },
            { id: 'services', label: 'নাগরিক সেবা', icon: Building },
            { id: 'contact', label: 'যোগাযোগ', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm' : 'bg-transparent border border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                <Icon className={`w-6 h-6 mb-1.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-[11px] font-bold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {activeTab === 'list' && unions.map((union, idx) => (
           <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                    {idx + 1}
                 </div>
                 <h3 className="font-bold text-gray-800">{union.name}</h3>
              </div>
              <MapPin className="w-5 h-5 text-gray-300" />
           </div>
        ))}

        {activeTab === 'members' && unions.map((union, idx) => (
           <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-bold mb-1">{union.name}</p>
              <div className="flex items-center justify-between">
                 <h3 className="font-bold text-gray-800 text-lg">{union.chair}</h3>
                 <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">চেয়ারম্যান</span>
              </div>
           </div>
        ))}

        {activeTab === 'services' && (
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <Building className="w-12 h-12 text-blue-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-lg mb-2">ইউনিয়ন ডিজিটাল সেন্টার</h3>
              <p className="text-sm text-gray-600 mb-4">জন্ম নিবন্ধন, মৃত্যু নিবন্ধন, ট্রেড লাইসেন্স, ওয়ারিশ সনদ সহ সকল প্রকার নাগরিক সনদ এখান থেকে সংগ্রহ করা যায়।</p>
              <button className="bg-blue-50 text-blue-700 px-4 py-2 font-bold rounded-xl border border-blue-200">সার্ভিস সমূহ দেখুন</button>
           </div>
        )}

        {activeTab === 'contact' && (
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">ইউনিয়ন পরিষদ হেল্পলাইন</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">১নং পুঠিয়া ইউপি</span>
                    <a href="tel:01700000000" className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold">
                       <Phone className="w-3.5 h-3.5" /> কল করুন
                    </a>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">৩নং বানেশ্বর ইউপি</span>
                    <a href="tel:01700000000" className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold">
                       <Phone className="w-3.5 h-3.5" /> কল করুন
                    </a>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

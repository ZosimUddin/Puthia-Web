import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Map, MapPin, Users, Info } from 'lucide-react';

export function AdministrationIntro({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      <div className="w-full">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/10">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <MapPin className="w-48 h-48" />
          </div>
          <div className="relative z-10 px-4">
            <button 
              onClick={onGoBack} 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all font-bold text-sm backdrop-blur-sm mb-6 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </button>

            <div className="text-emerald-500 text-sm font-black uppercase tracking-wider mb-2 drop-shadow-sm">
              ইতিহাস ও মানচিত্র 
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">আমাদের পুঠিয়া</h1>

            <div className="pl-4 border-l-4 border-amber-400 max-w-xl">
              <p className="text-emerald-50 text-sm sm:text-base leading-relaxed opacity-90">
                রাজশাহী জেলার অন্যতম প্রাচীন ঐতিহ্যবাহী উপজেলা পুঠিয়ার ইতিহাস, ভৌগোলিক অবস্থান ও মানচিত্র সম্পর্কে বিস্তারিত।
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-[-20px] relative z-20 mb-6">
        <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
          {[
            { id: 'history', label: 'ইতিহাস', icon: BookOpen },
            { id: 'map', label: 'মানচিত্র', icon: Map },
            { id: 'geo', label: 'ভৌগোলিক', icon: MapPin },
            { id: 'demo', label: 'জনসংখ্যা', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                style={{ 
                  flex: 1, 
                  minWidth: 0, 
                  background: isActive ? "#eff6ff" : "#ffffff", 
                  color: isActive ? "#1e3a8a" : "#1e293b", 
                  border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                  padding: "10px 2px", 
                  borderRadius: "16px", 
                  textAlign: "center", 
                  cursor: "pointer", 
                  transition: "all 0.2s" 
                }}
                className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
              >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-gray-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{tab.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-3">পুঠিয়ার রাজবংশ ও ইতিহাস</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              পুঠিয়া রাজবংশ রাজশাহীর প্রাচীনতম রাজবংশগুলোর একটি। মুঘল সম্রাট আকবরের আমলে জনৈক পীতাম্বর এই জমিদারির প্রতিষ্ঠা করেন। পরবর্তী সময়ে এটি পাঁচআনি ও চারআনি এস্টেট নামে বিভক্ত হয়। পুঠিয়া রাজবাড়ী, শিব মন্দির ও গোবিন্দ মন্দির এ অঞ্চলের ঐতিহাসিক গুরুত্ব বহন করে।
            </p>
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 flex items-start gap-3">
               <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
               <p className="text-sm text-teal-800">
                 ১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী কর্তৃক নির্মিত বর্তমান রাজবাড়ীটি একটি অপূর্ব নিদর্শন।
               </p>
            </div>
          </div>
        )}
        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <h3 className="font-bold text-gray-800 text-lg mb-3">উপজেলার মানচিত্র</h3>
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 mb-4">
               <Map className="w-16 h-16 text-gray-300" />
            </div>
            <p className="text-sm text-gray-600 mb-3">পুঠিয়া উপজেলার বিস্তারিত মানচিত্র ও প্রশাসনিক সীমানার চিত্র।</p>
             <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm w-full hover:bg-gray-800">ম্যাপ বড় করে দেখুন</button>
          </div>
        )}
        {activeTab === 'geo' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg mb-3">ভৌগোলিক অবস্থান</h3>
            <div className="grid gap-3">
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-sm font-medium">আয়তন</span>
                  <span className="text-gray-800 font-bold text-sm">১৯২.৬৪ বর্গ কিঃমিঃ</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-sm font-medium">উত্তরে</span>
                  <span className="text-gray-800 font-bold text-sm">দুর্গাপুর উপজেলা</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-sm font-medium">দক্ষিণে</span>
                  <span className="text-gray-800 font-bold text-sm">চারঘাট উপজেলা</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-sm font-medium">পূর্বে</span>
                  <span className="text-gray-800 font-bold text-sm">নাটোর সদর</span>
               </div>
               <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-sm font-medium">পশ্চিমে</span>
                  <span className="text-gray-800 font-bold text-sm">পবা উপজেলা</span>
               </div>
            </div>
          </div>
        )}
        {activeTab === 'demo' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg mb-3">জনসংখ্যা ও জনমিতি</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-center">
                  <Users className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                  <div className="text-xl font-black text-teal-800">২,১৭,৫৩১</div>
                  <div className="text-xs text-teal-600 font-medium mt-1">মোট জনসংখ্যা</div>
               </div>
               <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <BookOpen className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <div className="text-xl font-black text-indigo-800">৫৬.৩%</div>
                  <div className="text-xs text-indigo-600 font-medium mt-1">শিক্ষার হার</div>
               </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed text-center">
              (তথ্যসূত্র: ২০১১ সালের আদমশুমারি অনুযায়ী)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

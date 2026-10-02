import React, { useState } from 'react';
import { ArrowLeft, Home, FileText, School, Landmark } from 'lucide-react';

export function AdministrationVillages({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState('list');

  const villages = [
    "তারাপুর", "পালোপাড়া", "বারইপাড়া", "গোপালহাটি", "ধোপাপাড়া", "কৃষ্ণপুর", "সৈয়দপুর"
  ];

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-r from-orange-600 to-red-700 p-8 text-white relative overflow-hidden rounded-[40px] shadow-xl shadow-red-900/10">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Home className="w-48 h-48" />
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
              পল্লী উন্নয়ন
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">গ্রামের তথ্য</h1>

            <div className="pl-4 border-l-4 border-amber-400 max-w-xl">
              <p className="text-orange-50 text-sm sm:text-base leading-relaxed opacity-90">
                পুঠিয়া উপজেলার সকল গ্রামের তালিকা, ইতিহাস, শিক্ষা প্রতিষ্ঠান ও ধর্মীয় প্রতিষ্ঠানগুলোর তথ্যভান্ডার।
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: 'list', label: 'গ্রামের তালিকা', icon: Home },
            { id: 'history', label: 'গ্রামের ইতিহাস', icon: FileText },
            { id: 'edu', label: 'শিক্ষা প্রতিষ্ঠান', icon: School },
            { id: 'religion', label: 'ধর্মীয় প্রতিষ্ঠান', icon: Landmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-orange-50 border border-orange-200 text-orange-700 shadow-sm' : 'bg-transparent border border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                <Icon className={`w-6 h-6 mb-1.5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className="text-[11px] font-bold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {activeTab === 'list' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-800 mb-3 ml-1 border-l-4 border-orange-500 pl-2">জনপ্রিয় গ্রাম</h3>
               <div className="grid grid-cols-2 gap-2">
                  {villages.map((v, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center font-medium text-gray-700">
                         {v}
                      </div>
                  ))}
               </div>
           </div>
        )}

        {activeTab !== 'list' && (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-500 font-bold text-lg mb-1">তথ্য সংরক্ষণ চলছে...</h3>
                <p className="text-sm text-gray-400">এই গ্রামের তথ্যাদি শীঘ্রই প্রকাশ করা হবে।</p>
            </div>
        )}
      </div>
    </div>
  );
}

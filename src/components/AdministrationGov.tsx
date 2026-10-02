import React, { useState } from 'react';
import { ArrowLeft, Building2, Phone, Briefcase, FileSignature, Landmark } from 'lucide-react';

export function AdministrationGov({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState('uno');

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-r from-slate-700 to-gray-900 p-8 text-white relative overflow-hidden rounded-[40px] shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Building2 className="w-48 h-48" />
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
              সরকারি সহায়তা
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight tracking-tight">প্রশাসনিক কাঠামো ও সেবা</h1>

            <div className="pl-4 border-l-4 border-amber-400 max-w-xl">
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed opacity-90">
                উপজেলা প্রশাসন, বিভিন্ন সরকারি দপ্তরের ডিরেক্টরি এবং প্রয়োজনীয় নাগরিক সেবা এক নজরে।
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 grid grid-cols-3 gap-2">
          {[
            { id: 'uno', label: 'উপজেলা প্রশাসন (UNO)', icon: Building2 },
            { id: 'council', label: 'উপজেলা পরিষদ', icon: Briefcase },
            { id: 'up_chairmen', label: 'ইউপি চেয়ারম্যানগণ', icon: Landmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 font-bold text-xs ${isActive ? 'bg-indigo-50 border border-indigo-200 text-indigo-800 shadow-sm' : 'bg-transparent border border-transparent text-gray-500 hover:bg-gray-50'}`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {activeTab === 'uno' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
             <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <Building2 className="w-7 h-7 text-slate-600" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-800">মোছাঃ শামীমা সুলতানা</h3>
                    <p className="text-sm text-gray-500">উপজেলা নির্বাহী কর্মকর্তা (UNO)</p>
                 </div>
             </div>
             <div className="text-sm text-gray-600 mt-1">উপজেলা নির্বাহী অফিস ভবন, পুঠিয়া</div>
             <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                   <Phone className="w-4 h-4 text-gray-400" />
                   <span>যোগাযোগের ফোন: 01711-122334</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                   <Briefcase className="w-4 h-4 text-gray-400" />
                   <span>অফিসিয়াল ইমেইল: unoputhia@mopa.gov.bd</span>
                </div>
             </div>
             <div className="mt-2">
                 <a href="tel:01711122334" className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm">
                    <Phone className="w-4 h-4" /> সরাসরি কল করুন (সিমুলেটর)
                 </a>
             </div>
           </div>
        )}
        
        {activeTab === 'council' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">উপজেলা পরিষদ</h3>
              <p className="text-sm text-gray-500">উপজেলা পরিষদ তথ্য শীঘ্রই আপডেট করা হবে।</p>
           </div>
        )}
        
        {activeTab === 'up_chairmen' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">ইউপি চেয়ারম্যানগণ</h3>
              <p className="text-sm text-gray-500">ইউপি চেয়ারম্যানগণের তালিকা শীঘ্রই আপডেট করা হবে।</p>
           </div>
        )}
      </div>
    </div>
  );
}

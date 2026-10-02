import React, { useState } from 'react';
import { ArrowLeft, Home, Building2, MapPin, Phone, Users, Package } from 'lucide-react';

export function RentToLet({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState('family_house');

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={onGoBack} className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">ভাড়া ও টু-লেট</h1>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-700 to-purple-800 px-4 py-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Home className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <span className="bg-white/20 text-purple-50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            আবাসন ও বাণিজ্যিক স্পেস
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">ভাড়া ও টু-লেট বোর্ড</h2>
          <p className="text-purple-100 text-sm sm:text-base leading-relaxed opacity-90">
            পুঠিয়া উপজেলার যেকোনো এলাকায় পরিবার বা ব্যাচেলরদের বাসা ভাড়া, ছাত্রদের মেস এবং বাণিজ্যিক দোকান বা গোডাউনের খোঁজ।
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="px-4 -mt-4 relative z-20 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: 'family_house', label: 'ফ্যামিলি বাসা', icon: Home },
            { id: 'bachelor_mess', label: 'ব্যাচেলর/মেস', icon: Users },
            { id: 'shop_office', label: 'দোকান ও অফিস', icon: Building2 },
            { id: 'godown_other', label: 'গোডাউন/অন্যান্য', icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-purple-50 border border-purple-200 text-purple-700 shadow-sm'
                    : 'bg-transparent border border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1.5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="text-[11px] font-bold text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 space-y-4">
        {activeTab === 'family_house' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">৩ রুমের ফ্ল্যাট ভাড়া</h3>
                <p className="text-sm text-gray-500 mt-0.5">ফ্যামিলি বাসা</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">৮,৫০০ ৳/মাস</span>
            </div>
            
            <div className="flex items-start gap-2 mt-1">
               <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">২ বেডরুম, ১ ড্রয়িং-ডাইনিং, ২ বাথরুম, ২ ব্যালকনি (নিচ তলা)। সম্পূর্ণ টাইলস করা।</p>
            </div>
            <div className="flex items-start gap-2">
               <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 font-medium">পুঠিয়া বাসস্ট্যান্ড এর পেছনে, পুঠিয়া।</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors">
                <Phone className="w-4 h-4" /> যোগাযোগ
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200">
                <MapPin className="w-4 h-4" /> ম্যাপ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bachelor_mess' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">২ সিট বা সিঙ্গেল রুম</h3>
                <p className="text-sm text-gray-500 mt-0.5">ছাত্র মেস (ব্যাচেলর)</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">১,২০০ ৳/সিট</span>
            </div>
            
            <div className="flex items-start gap-2 mt-1">
               <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">ফ্রি ওয়াইফাই, পানীয় জল ও উন্নত মিল সিস্টেম। শুধুমাত্র ছাত্রদের জন্য।</p>
            </div>
            <div className="flex items-start gap-2">
               <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 font-medium">পি এন সরকারি উচ্চ বিদ্যালয় সংলগ্ন।</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors">
                <Phone className="w-4 h-4" /> যোগাযোগ
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200">
                <MapPin className="w-4 h-4" /> ম্যাপ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'shop_office' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">পজিশনসহ দোকান ভাড়া</h3>
                <p className="text-sm text-gray-500 mt-0.5">দোকান / অফিস</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">৫,০০০ ৳/মাস</span>
            </div>
            
            <div className="flex items-start gap-2 mt-1">
               <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">১২০ স্কয়ার ফিট। ডেকোরেশন করা আছে। যেকোনো ব্যবসার জন্য উপযুক্ত।</p>
            </div>
            <div className="flex items-start gap-2">
               <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 font-medium">পুঠিয়া রাজবাড়ি মেইন গেইটের বিপরীতে।</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors">
                <Phone className="w-4 h-4" /> যোগাযোগ
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200">
                <MapPin className="w-4 h-4" /> ম্যাপ
              </button>
            </div>
          </div>
        )}

        {activeTab === 'godown_other' && (
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">বড় গোডাউন স্পেস</h3>
                <p className="text-sm text-gray-500 mt-0.5">গোডাউন / অন্যান্য</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">১৫,০০০ ৳/মাস</span>
            </div>
            
            <div className="flex items-start gap-2 mt-1">
               <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">৮০০ স্কয়ার ফিট পাকা গোডাউন। গাড়ি ঢোকার রাস্তা আছে। কৃষিপণ্য বা মালামাল রাখার উপযোগী।</p>
            </div>
            <div className="flex items-start gap-2">
               <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 font-medium">বানেশ্বর বাজার সংলগ্ন, পুঠিয়া।</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors">
                <Phone className="w-4 h-4" /> যোগাযোগ
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors border border-gray-200">
                <MapPin className="w-4 h-4" /> ম্যাপ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';
import { ArrowLeft, BookOpen, Clock, CheckCircle } from 'lucide-react';

const CHARTER_DATA = [
  { service: "নাগরিকত্ব সনদ", time: "১ কর্মদিবস" },
  { service: "ওয়ারিশান সনদ", time: "৩ কর্মদিবস" },
  { service: "জন্ম নিবন্ধন (নতুন)", time: "১০-১৫ কর্মদিবস" },
  { service: "ট্রেড লাইসেন্স ইস্যু", time: "২ কর্মদিবস" },
  { service: "কৃষি পরামর্শ সেবা", time: "তাৎক্ষণিক" },
  { service: "অভিযোগ নিষ্পত্তি", time: "৭-১৫ কর্মদিবস" },
];

export const CitizenCharter = ({ onGoBack }: { onGoBack: () => void }) => {
  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in" id="citizen-charter-view">
      {/* Header */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <h1 className="text-3xl font-black mb-3 text-white">নাগরিক সেবা সনদ</h1>
          <p className="text-blue-50 text-sm">সেবা গ্রহণ ও প্রাপ্তির সময়সীমা</p>
        </div>
      </div>

      {/* Charter List */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        {CHARTER_DATA.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">{item.service}</h4>
              <p className="text-xs text-blue-600 font-bold mt-1">প্রয়োজনীয় সময়: {item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

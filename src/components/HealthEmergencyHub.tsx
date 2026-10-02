import React, { useState } from 'react';
import { ArrowLeft, Ambulance, Video, Pill, MapPin, Stethoscope } from 'lucide-react';

export const HealthEmergencyHub = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('hub');

  const features = [
    { id: 'fire', title: 'ফায়ার সার্ভিস ট্র্যাকিং', icon: Ambulance, color: 'bg-red-500' },
    { id: 'tele', title: 'টেলিমেডিসিন সেবা', icon: Video, color: 'bg-emerald-500' },
    { id: 'pharm', title: 'ফার্মেসি ও ল্যাব টেস্ট', icon: Pill, color: 'bg-blue-500' },
  ];

  if (activeTab !== 'hub') {
    return (
      <div className="p-6">
        <button onClick={() => setActiveTab('hub')} className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-600">
          <ArrowLeft className="w-4 h-4" /> ফিরে যান
        </button>
        <h2 className="text-xl font-black mb-4">
          {features.find(f => f.id === activeTab)?.title}
        </h2>
        <div className="text-sm text-gray-500">
            {activeTab === 'fire' && "ফায়ার সার্ভিসের গাড়ির লাইভ ট্র্যাকিং শীঘ্রই আসছে।"}
            {activeTab === 'tele' && "ডাক্তারের সাথে ভিডিও কল সেবা শীঘ্রই যুক্ত হবে।"}
            {activeTab === 'pharm' && "ফার্মেসি ও ল্যাব টেস্ট বুকিং সিস্টেম শীঘ্রই আসছে।"}
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in">
      <div className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}>
        <button onClick={onGoBack} className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10">
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <div className="mt-6 relative z-10">
          <h1 className="text-3xl font-black mb-3 text-white">স্বাস্থ্য ও জরুরি নেটওয়ার্ক</h1>
          <p className="text-slate-300 text-sm">জরুরি প্রয়োজনে দ্রুত সেবা পেতে এখানে ক্লিক করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4">
        {features.map((f) => (
          <button 
            key={f.id} 
            onClick={() => setActiveTab(f.id)}
            className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-gray-100 shadow-sm transition hover:shadow-md"
          >
            <div className={`${f.color} text-white p-4 rounded-2xl`}>
              <f.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-gray-800">{f.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { ArrowLeft, MapPin, Phone, Clock, BookOpen, Calendar, Info, Sparkles } from "lucide-react";

export function PagodaInfo({ onGoBack }: { onGoBack: () => void }) {
  const pagodas = [
    {
      id: "pagoda-1",
      name: "মহাবোধি বৌদ্ধ বিহার ও প্যাগোডা",
      location: "রাজশাহী বিভাগীয় অঞ্চল (পুঠিয়া সংলগ্ন)",
      type: "বৌদ্ধ প্যাগোডা ও বিহার",
      established: "বৌদ্ধ কৃষ্টি ও ঐতিহ্য",
      details: "শান্তিময় পরিবেশের বৌদ্ধ প্রার্থনালয় ও প্যাগোডা। বুদ্ধ পূর্ণিমা ও বিশেষ উৎসবে পালি প্রার্থনা ও প্রদীপ প্রজ্জ্বলন অনুষ্ঠান হয়।",
      timing: "প্রতিদিন সকাল ৮:০০ - সন্ধ্যা ৬:০০",
      contact: "০১৭০০-০০০০০৩",
      image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "pagoda-2",
      name: "শান্তিনিকেতন বৌদ্ধ প্যাগোডা কেন্দ্র",
      location: "উত্তর বঙ্গীয় ঐতিহ্য এলাকা",
      type: "বৌদ্ধ মন্দির ও ধ্যান কেন্দ্র",
      established: "শান্তি উপাসনালয়",
      details: "আত্মিক শান্তি ও ধ্যানের জন্য নির্মিত প্যাগোডা কমপ্লেক্স। দর্শনার্থী ও উপাসকদের জন্য উন্মুক্ত।",
      timing: "সকাল ৯:০০ - বিকেল ৫:০০",
      contact: "০১৭০০-০০০০০৪",
      image: "https://images.unsplash.com/photo-1609946727707-4299834215f9?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="font-sans space-y-6 pb-6">
      {/* Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #78350f, #451a03)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-amber-300 text-sm font-bold mb-2 uppercase tracking-wide">ধর্মীয় প্রতিষ্ঠান ও ঐতিহ্য</p>
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-white">🛕 প্যাগোডা (বৌদ্ধ উপাসনালয়)</h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-amber-400/50 pl-3 py-1">
            পুঠিয়া ও আশেপাশের অঞ্চলের বৌদ্ধ বিহার, প্যাগোডা ও ধ্যান কেন্দ্রের তালিকা।
          </p>
        </div>
      </div>

      {/* List of Pagodas */}
      <div className="space-y-4">
        {pagodas.map((pagoda) => (
          <div key={pagoda.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-600"></div>
            <div className="flex flex-col sm:flex-row gap-4 items-start pl-2">
              <img 
                src={pagoda.image} 
                alt={pagoda.name}
                className="w-full sm:w-32 h-28 object-cover rounded-2xl flex-shrink-0 border border-gray-100"
              />
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 mb-1">
                  {pagoda.type}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{pagoda.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> {pagoda.location}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl mb-3">
                  {pagoda.details}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" /> {pagoda.timing}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-600" /> {pagoda.contact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

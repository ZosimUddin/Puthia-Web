import React, { useState } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

export const VillageNews = ({ onGoBack, hideHeader = false }: { onGoBack?: () => void, hideHeader?: boolean }) => {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const newsList = [
    {
      id: 1,
      title: "তারাপুর গ্রামে ড্রাগন ফল চাষে শিক্ষিত যুবকদের অভাবনীয় সাফল্য",
      time: "৫ ঘণ্টা আগে",
      loc: "তারাপুর গ্রাম",
      desc: "তারাপুর গ্রামের ৩ জন শিক্ষিত যুবক চাকরি না খুঁজে যৌথ উদ্যোগে শুরু করেছিলেন ড্রাগন ফলের চাষ। চলতি মরসুমে ফলন ভালো হওয়ায় এবং বাজারে চড়া দাম পাওয়ায় তারা এখন আর্থিকভাবে দারুণ স্বাবলম্বী।",
      image: "https://images.unsplash.com/photo-1596547609808-1f19fc13c3b0?auto=format&fit=crop&w=500&q=80",
      content: "তারাপুর গ্রামের ৩ জন শিক্ষিত যুবক চাকরি না খুঁজে যৌথ উদ্যোগে শুরু করেছিলেন ড্রাগন ফলের চাষ। চলতি মরসুমে ফলন ভালো হওয়ায় এবং বাজারে চড়া দাম পাওয়ায় তারা এখন আর্থিকভাবে দারুণ স্বাবলম্বী। তাদের এই সাফল্য দেখে এলাকার অন্যান্য যুবকরাও ড্রাগন চাষে আগ্রহী হচ্ছেন।"
    },
    {
      id: 2,
      title: "ধোপাপাড়া খালের ওপর ভাঙা সাঁকোই একমাত্র ভরসা, দুর্ভোগে শিক্ষার্থীরা",
      time: "গতকাল",
      loc: "ধোপাপাড়া",
      desc: "ধোপাপাড়া গ্রামের স্কুল ও কলেজগামী শিক্ষার্থীদের প্রতিদিন একটি নড়বড়ে বাঁশের সাঁকো পার হয়ে মূল রাস্তায় আসতে হয়। বর্ষা মৌসুমের আগেই এখানে একটি পাকা কালভার্ট নির্মাণের দাবি জানিয়েছেন এলাকাবাসী।",
      image: "https://images.unsplash.com/photo-1518552787834-3118cf97bd03?auto=format&fit=crop&w=500&q=80",
      content: "ধোপাপাড়া গ্রামের স্কুল ও কলেজগামী শিক্ষার্থীদের প্রতিদিন একটি নড়বড়ে বাঁশের সাঁকো পার হয়ে মূল রাস্তায় আসতে হয়। বর্ষা মৌসুমের আগেই এখানে একটি পাকা কালভার্ট নির্মাণের দাবি জানিয়েছেন এলাকাবাসী। স্থানীয় জনপ্রতিনিধি জানিয়েছেন শিগগিরই বরাদ্দ পাস করে কালভার্ট তৈরি হবে।"
    },
    {
      id: 3,
      title: "কাঁচুপাড়া তরুণ সংঘের উদ্যোগে বিনামূল্যে রক্তদান ও স্বাস্থ্য ক্যাম্প",
      time: "২ দিন আগে",
      loc: "কাঁচুপাড়া",
      desc: "গ্রামীণ সুবিধাবঞ্চিত মানুষের স্বাস্থ্যসেবা নিশ্চিত করতে কাঁচুপাড়া সরকারি প্রাথমিক বিদ্যালয় মাঠে দিনব্যাপী ফ্রি মেডিকেল ক্যাম্প অনুষ্ঠিত হয়েছে। এতে প্রায় দুই শতাধিক মানুষকে বিনামূল্যে ওষুধ দেওয়া হয়।",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=80",
      content: "গ্রামীণ সুবিধাবঞ্চিত মানুষের স্বাস্থ্যসেবা নিশ্চিত করতে কাঁচুপাড়া সরকারি প্রাথমিক বিদ্যালয় মাঠে দিনব্যাপী ফ্রি মেডিকেল ক্যাম্প অনুষ্ঠিত হয়েছে। এতে প্রায় দুই শতাধিক মানুষকে বিনামূল্যে ওষুধ দেওয়া হয়। রক্তদান কর্মসূচিতে স্থানীয় তরুণরা উৎসাহী হয়ে অংশগ্রহণ করেন।"
    }
  ];

  return (
    <div className="font-sans">
      {/* Hero Banner */}
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
          style={{ background: "linear-gradient(135deg, #B71C1C, #37474F)" }}
        >
          {onGoBack && (
            <button 
              onClick={onGoBack} 
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              ← ফিরে যান
            </button>  
          )}
          <div className="mt-6">
            <p className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wide">জনপদের কথা</p>
            <h1 className="text-4xl font-black mb-3 text-white">গ্রাম সংবাদ</h1>
            <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
              পুঠিয়া উপজেলার প্রত্যন্ত গ্রামের তৃণমূল মানুষের দৈনন্দিন খবর, সমস্যা, সম্ভাবনা এবং গ্রামীণ জনপদের টাটকা আপডেট জানুন।
            </p>
          </div>
        </div>
      )}

      {/* Village News Feed Section */}
      <div className="space-y-5 mt-4">
        {newsList.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedNews(item)}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md hover:border-teal-200 cursor-pointer transition active:scale-[0.99]"
          >
            <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
               <img src={item.image} alt="তারাপুর গ্রাম" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between py-1 flex-1">
              <div>
                <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3 hover:text-teal-600 transition-colors">{item.title}</h4>
                <div className="flex gap-2 text-[11px] text-gray-500 font-bold mb-3">
                   <span className="bg-gray-100 px-2.5 py-1 rounded-full">⏱️ {item.time}</span>
                   <span className="bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">📍 {item.loc}</span>
                </div>
                <p className="text-sm text-gray-600 font-sans leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNews(item);
                }}
                className="text-sm font-bold text-[#EF5350] hover:text-[#D32F2F] mt-4 md:mt-0 flex items-center gap-1 w-fit bg-[#EF5350]/10 px-4 py-2 rounded-xl transition"
              >
                📖 বিস্তারিত পড়ুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-200 border border-teal-500/20">
                  গ্রাম সংবাদ
                </span>
              </div>
              
              <h3 className="text-lg font-bold leading-snug pr-8 text-white">
                {selectedNews.title}
              </h3>
            </div>

            {/* Image in Modal */}
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
              <div className="flex flex-wrap gap-3 items-center text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  {selectedNews.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  {selectedNews.loc}
                </span>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="text-[14px] text-gray-700 leading-relaxed font-medium whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl border border-gray-100 text-justify">
                {selectedNews.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

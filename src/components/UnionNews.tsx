import React, { useState } from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

export const UnionNews = ({ onGoBack, hideHeader = false }: { onGoBack?: () => void, hideHeader?: boolean }) => {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const newsList = [
    {
      id: 1,
      title: "বানেশ্বর হাটে নতুন ড্রেনেজ ব্যবস্থার কাজ দ্রুত গতিতে এগিয়ে চলছে",
      time: "৪ ঘণ্টা আগে",
      loc: "বানেশ্বর ইউনিয়ন",
      desc: "এশিয়ার অন্যতম বৃহৎ আম ও গুড়ের হাট বানেশ্বর বাজারের দীর্ঘদিনের জলাবদ্ধতা দূর করতে নতুন ড্রেন নির্মাণ কাজ পরিদর্শন করেছেন স্থানীয় জনপ্রতিনিধিরা। ব্যবসায়ীরা এই উদ্যোগে সন্তোষ প্রকাশ করেছেন।",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80",
      content: "এশিয়ার অন্যতম বৃহৎ আম ও গুড়ের হাট বানেশ্বর বাজারের দীর্ঘদিনের জলাবদ্ধতা দূর করতে নতুন ড্রেন নির্মাণ কাজ পরিদর্শন করেছেন স্থানীয় জনপ্রতিনিধিরা। ব্যবসায়ীরা এই উদ্যোগে সন্তোষ প্রকাশ করেছেন। দীর্ঘদিনের জলাবদ্ধতা দূর হলে বানেশ্বর বাজারে ক্রেতা-বিক্রেতাদের সুবিধা হবে এবং ব্যবসার পরিবেশ উন্নত হবে।"
    },
    {
      id: 2,
      title: "জিউপাড়া ইউনিয়নে কাঁচা রাস্তা পাকাকরণের কাজ উদ্বোধন",
      time: "গতকাল",
      loc: "জিউপাড়া ইউনিয়ন",
      desc: "জিউপাড়া ইউনিয়নের প্রত্যন্ত অঞ্চলের কৃষকদের সুবিধার্থে প্রধান কাঁচা রাস্তাটি পাকাকরণ প্রকল্পের কাজ আনুষ্ঠানিকভাবে উদ্বোধন করা হয়েছে। এর ফলে বাজারে ফসল আনা সহজ হবে।",
      image: "https://images.unsplash.com/photo-1596547609808-1f19fc13c3b0?auto=format&fit=crop&w=500&q=80",
      content: "জিউপাড়া ইউনিয়নের প্রত্যন্ত অঞ্চলের কৃষকদের সুবিধার্থে প্রধান কাঁচা রাস্তাটি পাকাকরণ প্রকল্পের কাজ আনুষ্ঠানিকভাবে উদ্বোধন করা হয়েছে। এর ফলে বাজারে ফসল আনা সহজ হবে। গ্রাম্য সংযোগ উন্নত করার এই কর্মসূচি স্থানীয় জীবনযাত্রায় ইতিবাচক অবদান রাখবে।"
    },
    {
      id: 3,
      title: "শিলমাড়িয়া ইউনিয়নে কৃতি শিক্ষার্থীদের মাঝে বাইসাইকেল বিতরণ",
      time: "২ দিন আগে",
      loc: "শিলমাড়িয়া ইউনিয়ন",
      desc: "দূরবর্তী গ্রাম থেকে স্কুলে যাতায়াতে ছাত্রীদের উদ্বুদ্ধ করতে শিলমাড়িয়া ইউনিয়নের বিভিন্ন স্কুলের কৃতি ও দরিদ্র ছাত্রীদের মাঝে বিনামূল্যে বাইসাইকেল বিতরণ করা হয়েছে।",
      image: "https://images.unsplash.com/photo-1518552787834-3118cf97bd03?auto=format&fit=crop&w=500&q=80",
      content: "দূরবর্তী গ্রাম থেকে স্কুলে যাতায়াতে ছাত্রীদের উদ্বুদ্ধ করতে শিলমাড়িয়া ইউনিয়নের বিভিন্ন স্কুলের কৃতি ও দরিদ্র ছাত্রীদের মাঝে বিনামূল্যে বাইসাইকেল বিতরণ করা হয়েছে। এই উদ্যোগে শিলমাড়িয়া ইউনিয়ন পরিষদের সকল সদস্য এবং শিক্ষা কর্মকর্তাগণ উপস্থিত ছিলেন।"
    }
  ];

  return (
    <div className="font-sans">
      {/* Hero Banner */}
      {!hideHeader && (
        <div className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #B71C1C, #37474F)" }}>
          {onGoBack && (
            <button onClick={onGoBack} className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              ← ফিরে যান
            </button>  
          )}
          <div className="mt-6">
            <p className="text-red-200 text-sm font-medium mb-2">তৃণমূলের খবর</p>
            <h1 className="text-4xl font-black mb-3">ইউনিয়ন সংবাদ</h1>
            <p className="text-gray-100 text-base max-w-lg">পুঠিয়া উপজেলার সকল ইউনিয়নের স্থানীয় খবর, উন্নয়নমূলক কর্মকাণ্ড, কৃষি ও গ্রামীণ জনপদের টাটকা আপডেট জানুন একনজরে।</p>
          </div>
        </div>
      )}

      {/* News Feed */}
      <div className="space-y-4 mt-4">
        {newsList.map((n) => (
          <div 
            key={n.id} 
            onClick={() => setSelectedNews(n)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 transition-all active:scale-[0.99]"
          >
            <div className="h-40 bg-gray-100 rounded-2xl mb-4 overflow-hidden">
              <img src={n.image} alt={n.title} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-bold text-lg mb-2 hover:text-blue-600 transition-colors">{n.title}</h4>
            <div className="flex gap-2 text-xs text-gray-500 mb-3">
              <span className="bg-gray-100 px-2 py-1 rounded-md">⏱️ {n.time}</span>
              <span className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">📍 {n.loc}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{n.desc}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNews(n);
              }}
              className="w-full bg-gray-100 text-gray-800 p-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
            >
              📖 বিস্তারিত পড়ুন
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/20">
                  ইউনিয়ন সংবাদ
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
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {selectedNews.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-500" />
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
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
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

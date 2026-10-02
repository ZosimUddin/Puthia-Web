import React, { useState } from 'react';
import { X, Calendar, MapPin, ArrowLeft, QrCode } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { ShareButton } from './ShareButton';
import { QrCodeShare } from './QrCodeShare';
import { AnimatePresence } from 'motion/react';

export const SpecialNews = ({ onGoBack, hideHeader = false }: { onGoBack?: () => void, hideHeader?: boolean }) => {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [selectedQr, setSelectedQr] = useState<{ url: string; title: string } | null>(null);

  const newsList = [
    {
      id: 1,
      title: "পুঠিয়ার ঐতিহাসিক রাজবাড়ি: সঠিক রক্ষণাবেক্ষণের অভাবে হারাচ্ছে শত বছরের জৌলুস",
      time: "৪ দিন আগে",
      loc: "পুঠিয়া রাজবাড়ী",
      desc: "টেরাকোটা শিল্পের এক অপরূপ নিদর্শন পুঠিয়ার পঞ্চরত্ন গোবিন্দ মন্দির ও রাজবাড়ি। কিন্তু দীর্ঘদিন ধরে প্রয়োজনীয় সংস্কার না হওয়ায় এসব ঐতিহাসিক স্থাপনার গায়ে শ্যাওলা জমছে এবং কিছু কিছু অংশের অলঙ্করণ খসে পড়ছে।",
      image: "https://images.unsplash.com/photo-1596404987163-952b61512411?auto=format&fit=crop&w=500&q=80",
      content: "টেরাকোটা শিল্পের এক অপরূপ নিদর্শন পুঠিয়ার পঞ্চরত্ন গোবিন্দ মন্দির ও রাজবাড়ি। কিন্তু দীর্ঘদিন ধরে প্রয়োজনীয় সংস্কার না হওয়ায় এসব ঐতিহাসিক স্থাপনার গায়ে শ্যাওলা জমছে এবং কিছু কিছু অংশের অলঙ্করণ খসে পড়ছে। স্থানীয়রা জানান, সঠিক রক্ষণাবেক্ষণ এবং পর্যটন বান্ধব পরিবেশের অভাবে ঐতিহ্যবাহী এই গৌরব নষ্ট হতে চলেছে। সরকারি উদ্যোগে দ্রুত সংস্কার কাজ পরিচালনা করা প্রয়োজন।"
    },
    {
      id: 2,
      title: "শিবনদী খনন প্রকল্প: কাজের ধীরগতিতে আসন্ন বর্ষায় ফের জলাবদ্ধতার আশঙ্কা",
      time: "১ সপ্তাহ আগে",
      loc: "শিবনদী সংলগ্ন এলাকা",
      desc: "অঞ্চলটিতে বন্যার পানি নিষ্কাসনের জন্য কোটি টাকা ব্যয়ে নদী খননের কাজ শুরু হলেও কাজের গতি অত্যন্ত ধীর। স্থানীয় কৃষকরা আশঙ্কা করছেন এ বছরও পানি আটকে ফসলের ব্যাপক ক্ষতি হতে পারে।",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80",
      content: "অঞ্চলটিতে বন্যার পানি নিষ্কাসনের জন্য কোটি টাকা ব্যয়ে নদী খননের কাজ শুরু হলেও কাজের গতি অত্যন্ত ধীর। স্থানীয় কৃষকরা আশঙ্কা করছেন এ বছরও পানি আটকে ফসলের ব্যাপক ক্ষতি হতে পারে। সময়মতো নদী খনন সম্পন্ন না হলে হাজার হাজার একর ফসলি জমি পানির নিচে তলিয়ে যাওয়ার আশঙ্কা রয়েছে।"
    },
    {
      id: 3,
      title: "উদ্যোক্তাদের নতুন চমক: বিলুপ্তপ্রায় গ্রামীণ মৃৎশিল্পের ডিজিটাল বাজার তৈরি",
      time: "২ সপ্তাহ আগে",
      loc: "পালপাড়া, পুঠিয়া",
      desc: "প্লাস্টিকের ভিড়ে হারিয়ে যেতে বসা ঐতিহ্যবাহী মাটির জিনিসপত্রকে নতুন রূপে ফিরিয়ে আনছেন স্থানীয় কয়েকজন যুবক। ফেসবুক পেইজ ও ই-কমার্সের মাধ্যমে তারা এখন দেশের বিভিন্ন প্রান্তে এসব দৃষ্টিনন্দন পণ্য পৌঁছে দিচ্ছেন।",
      image: "https://images.unsplash.com/photo-1506526615594-5cb8d2cde542?auto=format&fit=crop&w=500&q=80",
      content: "প্লাস্টিকের ভিড়ে হারিয়ে যেতে বসা ঐতিহ্যবাহী মাটির জিনিসপত্রকে নতুন রূপে ফিরিয়ে আনছেন স্থানীয় কয়েকজন যুবক। ফেসবুক পেইজ ও ই-কমার্সের মাধ্যমে তারা এখন দেশের বিভিন্ন প্রান্তে এসব দৃষ্টিনন্দন পণ্য পৌঁছে দিচ্ছেন। এর ফলে স্থানীয় মৃৎশিল্পীদের কর্মসংস্থান ও গ্রামীণ অর্থনৈতিক উন্নয়ন হচ্ছে।"
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
            <p className="text-red-200 text-sm font-medium mb-2 uppercase tracking-wide">গভীরে দৃষ্টি</p>
            <h1 className="text-4xl font-black mb-3 text-white">বিশেষ প্রতিবেদন</h1>
            <p className="text-gray-100 text-sm md:text-base max-w-lg leading-relaxed">
              পুঠিয়ার অনুসন্ধানী প্রতিবেদন, ঐতিহাসিক ঐতিহ্য, সমস্যা-সম্ভাবনা এবং অজানা গল্পের বিস্তারিত विश्लेषण।
            </p>
          </div>
        </div>
      )}

      {/* Special News Feed Section */}
      <div className="space-y-5 mt-4">
        {newsList.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedNews(item)}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md hover:border-red-200 cursor-pointer transition active:scale-[0.99]"
          >
            <div className="w-full md:w-[220px] h-40 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
               <img src={item.image} alt="ঐতিহ্য" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between py-1 flex-1">
              <div className="relative">
                <div className="flex justify-between items-start">
                  <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-3 hover:text-red-600 transition-colors">{item.title}</h4>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQr({ url: `${window.location.origin}?newsId=${item.id}`, title: item.title });
                      }}
                      className="p-1.5 rounded-full bg-gray-50/80 text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <FavoriteButton 
                      item={{
                        id: `news-${item.id}`,
                        type: 'news',
                        title: item.title,
                        subtitle: item.time,
                        newsItem: item
                      }}
                    />
                  </div>
                </div>
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
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-red-500/30 text-red-200 border border-red-500/20">
                  বিশেষ প্রতিবেদন
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
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-3 items-center text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-red-500" />
                    {selectedNews.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {selectedNews.loc}
                  </span>
                </div>
                <div className="flex gap-2">
                  <ShareButton 
                    title={selectedNews.title}
                    text={selectedNews.desc}
                    url={`${window.location.origin}?newsId=${selectedNews.id}`}
                  />
                  <FavoriteButton 
                    item={{
                      id: `news-${selectedNews.id}`,
                      type: 'news',
                      title: selectedNews.title,
                      subtitle: selectedNews.time,
                      newsItem: selectedNews
                    }}
                  />
                </div>
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
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedQr && (
          <QrCodeShare 
            url={selectedQr.url}
            title={selectedQr.title}
            onClose={() => setSelectedQr(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

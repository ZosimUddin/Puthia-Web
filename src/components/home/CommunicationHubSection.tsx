import React, { useState } from "react";
import { Newspaper, ArrowRight, Clock, Eye, Bookmark, Sparkles, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const CommunicationHubSection: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const featuredNews = {
    id: "feat-1",
    title: "পুঠিয়ায় উন্নয়ন কাজের নতুন পরিকল্পনা গ্রহণ ও বাস্তবায়ন",
    category: "সরকারি",
    categoryBg: "bg-emerald-600 text-white",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800",
    date: "২০ মে",
    readTime: "২ মিনিট",
    views: "১.২K",
  };

  const smallNews = [
    {
      id: "small-1",
      title: "পুঠিয়া হাসপাতাল রোডে যানজট নিরসনে নতুন নির্দেশনা",
      category: "জরুরি",
      categoryBg: "bg-rose-600 text-white",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400",
      date: "১৯ মে",
      readTime: "১ মিনিট",
      views: "৯৫০",
    },
    {
      id: "small-2",
      title: "ঐতিহাসিক পুঠিয়া রাজবাড়িতে তিন দিনব্যাপী সাংস্কৃতিক মহোৎসব",
      category: "সংবাদ",
      categoryBg: "bg-blue-600 text-white",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400",
      date: "১৮ মে",
      readTime: "৩ মিনিট",
      views: "২.১K",
    },
    {
      id: "small-3",
      title: "পুঠিয়ায় চাষিদের মাঝে বিনামূল্যে ধান ও সার বিতরণ",
      category: "কৃষি",
      categoryBg: "bg-amber-600 text-white",
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=400",
      date: "১৭ মে",
      readTime: "২ মিনিট",
      views: "১.৫K",
    },
  ];

  return (
    <section className="pt-1 pb-4 sm:pt-2 sm:pb-5 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="max-w-4xl mx-auto">
        {/* News & Updates Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-emerald-50/40 rounded-2xl border border-emerald-100/80 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                <Newspaper size={22} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">সংবাদ ও খবর</h3>
                <p className="text-xs md:text-sm font-semibold text-slate-500">পুঠিয়ার সব আপডেট ও সংবাদ</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/news")}
              className="text-emerald-700 font-bold text-xs sm:text-sm md:text-base flex items-center gap-1 hover:underline cursor-pointer active:scale-95 transition-transform bg-emerald-100/60 hover:bg-emerald-100 px-3 md:px-5 py-1.5 md:py-2.5 rounded-2xl"
            >
              আরও সংবাদ <ArrowRight size={16} />
            </button>
          </div>

          {/* Featured News Card (Top) */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate("/news")}
            className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden mb-4 group"
          >
            {/* Big Image Section with Rounder Corners */}
            <div className="p-2.5 pb-0">
              <div className="relative h-52 sm:h-60 w-full overflow-hidden rounded-[16px] bg-slate-100">
                <img 
                  src={featuredNews.image} 
                  alt={featuredNews.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category Badge */}
                <div className={`absolute top-2.5 left-2.5 ${featuredNews.categoryBg} text-[11px] font-black px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1 border border-white/20`}>
                  <Sparkles size={11} className="animate-pulse text-amber-300" />
                  <span>{featuredNews.category}</span>
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1 border border-white/20">
                  <Calendar size={11} className="text-emerald-400" />
                  <span>{featuredNews.date}</span>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={(e) => toggleBookmark(e, featuredNews.id)}
                  className="absolute top-2.5 right-2.5 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:bg-white shadow-md transition-all active:scale-90 z-10"
                  title="বুকমার্ক করুন"
                >
                  <Bookmark 
                    size={18} 
                    className={bookmarkedIds[featuredNews.id] ? "fill-amber-500 text-amber-500" : ""} 
                  />
                </button>
              </div>
            </div>

            {/* Featured Content */}
            <div className="p-4 sm:p-5 md:p-7">
              <h4 className="text-base sm:text-lg md:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
                {featuredNews.title}
              </h4>
              
              <div className="flex items-center justify-between mt-3 md:mt-5 text-xs md:text-sm font-semibold text-slate-500 pt-3 md:pt-5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" />
                  <span>{featuredNews.date} • {featuredNews.readTime}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-slate-600">
                  <Eye size={13} className="text-slate-500" />
                  <span className="font-black text-[11px] md:text-xs">{featuredNews.views}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3 Smaller News Items (Below) */}
          <div className="space-y-3">
            {smallNews.map((news) => (
              <motion.div
                key={news.id}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/news")}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer flex gap-3 items-center group/item"
              >
                {/* Thumbnail Image with Rounded Corners */}
                <div className="relative w-24 sm:w-28 h-20 sm:h-24 min-w-[96px] sm:min-w-[112px] rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-xs border border-slate-100">
                  <img 
                    src={news.image} 
                    alt="" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400";
                    }}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className={`absolute top-1 left-1 ${news.categoryBg} text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs z-10`}>
                    {news.category}
                  </div>
                  {/* Date Badge */}
                  <div className="absolute bottom-1 left-1 bg-slate-900/85 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-xs z-10 flex items-center gap-0.5">
                    <Calendar size={8} className="text-emerald-400" />
                    <span>{news.date}</span>
                  </div>
                </div>

                {/* News Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <h5 className="font-bold text-slate-900 group-hover/item:text-emerald-600 transition-colors text-xs sm:text-sm md:text-lg line-clamp-2 leading-snug">
                    {news.title}
                  </h5>
                  
                  <div className="flex items-center justify-between mt-2 text-[11px] md:text-sm font-semibold text-slate-500">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock size={12} className="text-emerald-500" />
                      <span>{news.date} • {news.readTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-100/80 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                        <Eye size={11} className="text-slate-500" />
                        <span className="font-black text-[10px] md:text-xs text-slate-600">{news.views}</span>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(e, news.id)}
                        className="text-slate-400 hover:text-amber-500 p-1 transition-colors"
                        title="বুকমার্ক"
                      >
                        <Bookmark 
                          size={14} 
                          className={bookmarkedIds[news.id] ? "fill-amber-500 text-amber-500" : ""} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunicationHubSection;


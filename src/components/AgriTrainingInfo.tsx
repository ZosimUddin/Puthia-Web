import React, { useState } from "react";
import { ArrowLeft, Search, Video, PlayCircle, Clock, Eye, Youtube, BookOpen, Leaf, Sparkles } from "lucide-react";

interface AgriVideo {
  id: string;
  title: string;
  url: string;
  duration: string;
  category: "ফসল চাষ" | "খামার ও পশুপালন" | "জৈব কৃষি" | "আধুনিক প্রযুক্তি";
  source: string;
  views: string;
  date: string;
}

const VIDEO_LIST: AgriVideo[] = [
  {
    id: "v_1",
    title: "আধুনিক পদ্ধতিতে বোরো ধান চাষের সম্পূর্ণ গাইডলাইন",
    url: "#",
    duration: "১২:৪৫",
    category: "ফসল চাষ",
    source: "কৃষি তথ্য সার্ভিস (AIS)",
    views: "২৫ হাজার+",
    date: "২ মাস আগে"
  },
  {
    id: "v_2",
    title: "বাড়ির ছাদে মাল্টা চাষ পদ্ধতি ও পরিচর্যা",
    url: "#",
    duration: "০৮:৩০",
    category: "ফসল চাষ",
    source: "মাটি ও মানুষ",
    views: "১২ হাজার+",
    date: "৫ মাস আগে"
  },
  {
    id: "v_3",
    title: "লাভজনক উপায়ে দেশি মুরগি পালন পদ্ধতি",
    url: "#",
    duration: "১৫:২০",
    category: "খামার ও পশুপালন",
    source: "কৃষি সম্প্রসারণ অধিদপ্তর",
    views: "৪০ হাজার+",
    date: "১ বছর আগে"
  },
  {
    id: "v_4",
    title: "বাড়িতে বসে ট্রাইকোডার্মা বা জৈব সার তৈরির নিয়ম",
    url: "#",
    duration: "১০:১৫",
    category: "জৈব কৃষি",
    source: "কৃষি প্রযুক্তি",
    views: "৮ হাজার+",
    date: "৩ মাস আগে"
  },
  {
    id: "v_5",
    title: "স্মার্ট কৃষিতে সেন্সর ও ড্রোনের ব্যবহার",
    url: "#",
    duration: "১৪:১০",
    category: "আধুনিক প্রযুক্তি",
    source: "ডিজিটাল কৃষি",
    views: "৫ হাজার+",
    date: "১ মাস আগে"
  }
];

export function AgriTrainingInfo({ onGoBack }: { onGoBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ফসল চাষ" | "খামার ও পশুপালন" | "জৈব কৃষি" | "আধুনিক প্রযুক্তি">("all");

  const filtered = VIDEO_LIST.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-lime-500 via-green-600 to-emerald-700 p-6 text-white rounded-3xl shadow-lg relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 pointer-events-none" />
        <div className="absolute right-1/3 top-1/2 w-16 h-16 bg-white/10 rounded-full pointer-events-none animate-pulse" />

        <button 
          onClick={onGoBack} 
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer mb-6 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Video className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-lime-100 font-bold bg-lime-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
              <Leaf className="w-3 h-3" /> ডিজিটাল কৃষি শিক্ষা
            </span>
            <h1 className="text-2xl font-black mt-1">কৃষি ভিডিও ও প্রশিক্ষণ</h1>
          </div>
        </div>
      </div>
      
      <div className="px-4 space-y-4">
        {/* Search Bar & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ভিডিও শিরোনাম বা চ্যানেল দিয়ে খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl bg-white shadow-xs focus:ring-2 focus:ring-lime-500 text-sm placeholder-gray-400"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {[
              { id: "all", label: "সব ভিডিও" },
              { id: "ফসল চাষ", label: "ফসল চাষ" },
              { id: "খামার ও পশুপালন", label: "খামার ও পশুপালন" },
              { id: "জৈব কৃষি", label: "জৈব কৃষি" },
              { id: "আধুনিক প্রযুক্তি", label: "আধুনিক প্রযুক্তি" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition shrink-0 ${
                  selectedCategory === tab.id
                    ? "bg-lime-50 border-lime-200 text-lime-700"
                    : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map(v => (
              <a 
                href={v.url}
                key={v.id} 
                className="block p-4 bg-white border border-gray-100 rounded-3xl shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md group"
              >
                {/* Video Thumbnail Placeholder */}
                <div className="relative h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-lime-600 ml-1" />
                    </div>
                  </div>
                  
                  {/* Decorative Thumbnail Background Elements */}
                  <Video className="w-16 h-16 text-slate-300 opacity-50" />
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md z-20 flex items-center gap-1 backdrop-blur-sm">
                    <Clock className="w-3 h-3" /> {v.duration}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-lime-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-20 shadow-sm flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {v.category}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-gray-800 leading-snug group-hover:text-lime-600 transition-colors line-clamp-2">
                    {v.title}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-gray-700">{v.source}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" /> {v.views}
                      </span>
                      <span>{v.date}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-sm font-semibold text-gray-500">কোন ভিডিও পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 mt-1">অনুগ্রহ করে অন্য কোনো বিষয় লিখে অনুসন্ধান করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


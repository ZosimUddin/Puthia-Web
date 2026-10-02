import React, { useState } from 'react';
import { ArrowLeft, Building, Landmark, Home, Newspaper, Globe } from 'lucide-react';
import { SpecialNews } from './SpecialNews';
import { UnionNews } from './UnionNews';
import { VillageNews } from './VillageNews';
import { newsItems } from '../data/newsData';
import { FavoriteButton } from './FavoriteButton';

interface LocalNewsInfoProps {
  onGoBack: () => void;
  onNavigateToSubView: (viewId: string) => void;
  onSelectNews?: (newsItem: any) => void;
}

export function LocalNewsInfo({ onGoBack, onNavigateToSubView, onSelectNews }: LocalNewsInfoProps) {
  const [activeCategory, setActiveCategory] = useState('news_upazila');

  const topCategories = [
    { id: 'news_upazila', label: 'উপজেলা সংবাদ', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'news_union', label: 'ইউনিয়ন সংবাদ', icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'news_village', label: 'গ্রাম সংবাদ', icon: Home, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'news_special', label: 'বিশেষ প্রতিবেদন', icon: Newspaper, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const renderActiveComponent = () => {
    switch (activeCategory) {
      case 'news_upazila':
      case 'news_special':
        return <SpecialNews hideHeader={true} />;
      case 'news_union':
        return <UnionNews hideHeader={true} />;
      case 'news_village':
        return <VillageNews hideHeader={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in font-sans pb-10 space-y-6">
      <div 
        className="p-6 rounded-[24px] text-white mb-6 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #172554)', boxShadow: '0 4px 12px rgba(23, 37, 84, 0.15)' }}
      >
        <div className="block mb-4">
          <button 
            onClick={onGoBack} 
            className="border-none px-3.5 py-1.5 rounded-full text-white text-xs font-bold cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
          </button>
        </div>
        <span 
          className="text-[11px] px-3 py-1 rounded-xl inline-block mb-2 font-bold tracking-wide"
          style={{ color: '#93c5fd', background: 'rgba(147, 197, 253, 0.1)' }}
        >
          📰 নিউজ ডিরেক্টরি
        </span>
        <h2 className="m-0 mb-3 text-[26px] font-extrabold tracking-wide text-white">স্থানীয় সংবাদ</h2>
        <div className="w-10 h-1 rounded-sm mb-3.5" style={{ background: '#3b82f6' }}></div>
        <p className="m-0 text-[13px] opacity-85 leading-relaxed text-justify">
          উপজেলা, ইউনিয়ন এবং গ্রামের সকল সর্বশেষ খবর এবং বিশেষ প্রতিবেদনগুলো এখান থেকে পড়তে পারবেন।
        </p>
      </div>

      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
        {topCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <div 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)} 
              style={{ 
                flex: 1, 
                minWidth: 0, 
                background: isActive ? "#eff6ff" : "#ffffff", 
                color: isActive ? "#1e3a8a" : "#1e293b", 
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0", 
                padding: "10px 2px", 
                borderRadius: "16px", 
                textAlign: "center", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : cat.bg} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-600' : cat.color}`} />
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{cat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 px-1">
        {renderActiveComponent()}
      </div>
    </div>
  );
}

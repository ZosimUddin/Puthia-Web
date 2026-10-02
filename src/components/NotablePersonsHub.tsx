import React, { useState } from "react";
import { ArrowLeft, Quote, Award, BookOpen, Trophy, Briefcase } from "lucide-react";
import { FreedomFighters } from "./FreedomFighters";
import { Academicians } from "./Academicians";
import { SportsPersonalities } from "./SportsPersonalities";
import { Entrepreneurs } from "./Entrepreneurs";

interface Props { onGoBack: () => void; initialCategory?: string; }

export const NotablePersonsHub: React.FC<Props> = ({ onGoBack, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  
  const categoryThemes: Record<string, { gradient: string; label: string; activeColor: string }> = {
    'notable_freedom_fighters': { gradient: 'linear-gradient(135deg, #B71C1C, #5D1010)', label: 'বীর মুক্তিযোদ্ধা', activeColor: '#E53935' },
    'notable_academicians': { gradient: 'linear-gradient(135deg, #1B5E20, #0A3311)', label: 'প্রখ্যাত শিক্ষাবিদ', activeColor: '#43A047' },
    'notable_sports': { gradient: 'linear-gradient(135deg, #E65100, #7A2400)', label: 'কৃতী ক্রীড়াবিদ', activeColor: '#FB8C00' },
    'notable_entrepreneurs': { gradient: 'linear-gradient(135deg, #006064, #00363A)', label: 'সফল উদ্যোক্তা', activeColor: '#00838F' },
  };

  const categories = [
    { id: 'notable_freedom_fighters', label: 'বীর মুক্তিযোদ্ধা', sub: '৭১-এর বীর সেনানীদের তালিকা', icon: Award, component: FreedomFighters, color: 'text-red-700', bg: 'bg-red-50' },
    { id: 'notable_academicians', label: 'প্রখ্যাত শিক্ষাবিদ', sub: 'শিক্ষা বিস্তারে অবদান রাখা গুণীজন', icon: BookOpen, component: Academicians, color: 'text-green-700', bg: 'bg-green-50' },
    { id: 'notable_sports', label: 'কৃতী ক্রীড়াবিদ', sub: 'জাতীয় ও স্থানীয় ক্রীড়াঙ্গনের তারকা', icon: Trophy, component: SportsPersonalities, color: 'text-orange-700', bg: 'bg-orange-50' },
    { id: 'notable_entrepreneurs', label: 'সফল উদ্যোক্তা', sub: 'কৃষি ও শিল্পে সফল আইকনরা', icon: Briefcase, color: 'text-teal-700', bg: 'bg-teal-50', component: Entrepreneurs },
  ];

  const selectedCatTheme = selectedCategory ? categoryThemes[selectedCategory] : null;
  const bgGradient = selectedCatTheme ? selectedCatTheme.gradient : 'linear-gradient(135deg, #1A237E, #4A148C)';

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen pb-10">
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-2xl shadow-sm border text-left transition-all group ${isSelected ? 'bg-white ring-2 ring-offset-2' : 'bg-white/80 hover:bg-white border-gray-100'}`}
                style={isSelected ? { borderColor: selectedCatTheme?.activeColor, boxShadow: `0 0 0 2px ${selectedCatTheme?.activeColor}` } : {}}
              >
                <div className={`${cat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{cat.label}</h3>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {selectedCategory ? (
          <div className="p-0">
             <div className="px-4 mb-4">
               <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl transition-all font-bold text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ফিরে যান
                </button>
             </div>
             {React.createElement(categories.find(c => c.id === selectedCategory)!.component, { 
                 onGoBack: () => setSelectedCategory(null),
                 activeColor: selectedCatTheme!.activeColor 
             })}
          </div>
        ) : (
          <div className="w-full px-4 mt-6">
            <div 
              className={`p-8 text-white relative overflow-hidden shadow-xl shadow-gray-900/10 rounded-[32px] transition-all duration-300`}
              style={{ background: bgGradient }}
            >
              <div className="relative z-10">
                <button 
                  onClick={onGoBack} 
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 transition-all font-bold text-sm backdrop-blur-sm mb-6 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ফিরে যান
                </button>
                <div className="text-white/80 text-sm font-black uppercase tracking-wider mb-2 drop-shadow-sm">
                  পুঠিয়ার গৌরব
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight tracking-tight">
                  স্থানীয় কৃতী ব্যক্তিত্ব
                </h1>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed opacity-90 max-w-xl">
                  যাদের অবদান, ত্যাগ ও সাফল্যে সমৃদ্ধ হয়েছে পুঠিয়ার ইতিহাস ও সমাজ। তরুণ প্রজন্মের জন্য অনুপ্রেরণার এক ডিজিটাল নোটিশ বোর্ড।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

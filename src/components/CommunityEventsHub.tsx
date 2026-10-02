import React, { useState } from 'react';
import { ArrowLeft, Calendar, Trophy, Music } from 'lucide-react';
import { CommunityPrograms } from './CommunityPrograms';
import { SportsActivities } from './SportsActivities';
import { CulturalActivities } from './CulturalActivities';

interface Props {
  onGoBack: () => void;
}

export function CommunityEventsHub({ onGoBack }: Props) {
  const [activeTab, setActiveTab] = useState<'programs' | 'sports' | 'cultural'>('programs');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div 
        className="p-8 text-white rounded-b-3xl shadow-lg relative overflow-hidden mb-6" 
        style={{ background: "linear-gradient(135deg, #125836, #2d5a27)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-8 relative z-10 text-center">
          <p className="text-emerald-200 text-sm font-bold mb-2 uppercase tracking-wide">কমিউনিটি ও ইভেন্ট</p>
          <h1 className="text-3xl font-black mb-1 text-white">অনুষ্ঠান ও কার্যক্রম</h1>
          <div className="w-16 h-1 bg-emerald-400 rounded-full mx-auto my-4"></div>
          <p className="text-gray-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            পুঠিয়ার যাবতীয় স্থানীয় অনুষ্ঠান, খেলাধুলা ও সাংস্কৃতিক কার্যক্রমের সর্বশেষ আপডেট।
          </p>
        </div>
      </div>

      <div className="px-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('programs')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
              activeTab === 'programs'
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              activeTab === 'programs' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">অনুষ্ঠান</span>
          </button>
          
          <button
            onClick={() => setActiveTab('sports')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
              activeTab === 'sports'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              activeTab === 'sports' ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">খেলাধুলা</span>
          </button>

          <button
            onClick={() => setActiveTab('cultural')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
              activeTab === 'cultural'
                ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              activeTab === 'cultural' ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              <Music className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">সাংস্কৃতিক</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 min-h-[400px]">
          {activeTab === 'programs' && (
            <div className="relative h-full">
              <CommunityPrograms onGoBack={onGoBack} hideHeader={true} />
            </div>
          )}
          {activeTab === 'sports' && (
             <div className="relative h-full">
              <SportsActivities onGoBack={onGoBack} hideHeader={true} />
            </div>
          )}
          {activeTab === 'cultural' && (
             <div className="relative h-full">
              <CulturalActivities onGoBack={onGoBack} hideHeader={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

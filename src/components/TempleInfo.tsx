import React, { useState } from "react";
import { ArrowLeft, MapPin, Phone, BookOpen, Clock, Calendar, Users, Info, Search } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

export function TempleInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("tab1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const onSimulateAction = (actionName: string) => {
    alert(`${actionName}... (Simulated)`);
  };

  return (
    <div className="font-sans space-y-6 pb-6">
      
      {/* Hero Banner Section - Upazila Porichiti Style */}
      <UnifiedHeroHeader
        title="ঐতিহাসিক মন্দির"
        subtitle="পুঠিয়া রাজবংশের শাসনামলে নির্মিত বিশ্বখ্যাত টেরাকোটা মন্দিরসমূহের ইতিহাস, ছবি ও গাইড।"
        showBack={true}
        onBack={onGoBack}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-sm hidden sm:inline-block">
              ঐতিহাসিক প্রত্নতাত্ত্বিক ঐতিহ্য
            </span>
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        }
        searchQuery={showSearch ? searchQuery : undefined}
        onSearchChange={showSearch ? setSearchQuery : undefined}
        searchPlaceholder="মন্দিরের নাম লিখে খুঁজুন..."
        className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6"
      />

      {/* Quick Select Grid */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('tab1')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab1' ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🛕</span> টেরাকোটা মন্দির
        </button>
        <button 
          onClick={() => setActiveTab('tab2')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab2' ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">🛕</span> স্থানীয় উপাসনালয়
        </button>
        <button 
          onClick={() => setActiveTab('tab3')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab3' ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📖</span> ইতিহাস ও গাইড
        </button>
        <button 
          onClick={() => setActiveTab('tab4')}
          className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 font-bold shadow-sm border transition-all ${activeTab === 'tab4' ? 'bg-[#2E7D32] text-white border-[#2E7D32] shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'}`}
        >
          <span className="text-2xl">📷</span> ফটোগ্রাফি গ্যালারি
        </button>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#2E7D32]"></div>
          <div className="flex gap-4 items-start pl-2">
            <div className="w-16 h-16 rounded-full bg-[#2E7D32]/10 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-[#2E7D32]/20">
               🛕
            </div>
            <div>
              <h4 className="font-serif font-black text-gray-900 text-xl leading-tight mb-1">শিব মন্দির (ভুবনেশ্বর শিব মন্দির)</h4>
              <p className="text-sm mt-1 text-gray-600 font-medium flex items-start gap-1"><MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5"/> পুঠিয়া রাজবাড়ি লেকের কোল ঘেঁষে</p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 ml-2">
             <p className="text-sm text-gray-700 font-sans leading-relaxed">
               <span className="font-bold text-[#2E7D32] block mb-1">📝 বিবরণ:</span> 
               বাংলাদেশের সবচেয়ে বড় এবং অন্যতম উঁচু শিব মন্দির। এর পঞ্চরত্ন স্থাপত্যশৈলী এবং টেরাকোটার কাজ দেশ-বিদেশের পর্যটকদের আকর্ষণ করে।
             </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 pl-2">
            <button 
              onClick={() => onSimulateAction('Opening map')}
              className="text-sm font-bold text-white flex items-center justify-center gap-2 w-full bg-[#2E7D32] hover:bg-[#1B5E20] px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <MapPin className="w-4 h-4" /> ম্যাপে লোকেশন
            </button>
            <button 
              onClick={() => onSimulateAction('Reading History')}
              className="text-sm font-bold text-[#2E7D32] flex items-center justify-center gap-2 w-full bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 border border-[#2E7D32]/20 px-4 py-3 rounded-xl transition"
            >
              <BookOpen className="w-4 h-4" /> ইতিহাস পড়ুন
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

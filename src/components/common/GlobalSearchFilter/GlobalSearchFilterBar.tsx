import React, { useState } from 'react';
import { Search, Mic, MicOff, Filter, X, Sparkles, MapPin, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { GlobalFilterState } from './types';
import { parseSmartSearchQuery } from './smartSearchParser';
import { GlobalLocationModal } from './GlobalLocationModal';

interface GlobalSearchFilterBarProps {
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  onOpenFilterModal: () => void;
  placeholder?: string;
  categoryOptions?: { id: string; label: string }[];
  activeFilterCount: number;
}

export const GlobalSearchFilterBar: React.FC<GlobalSearchFilterBarProps> = ({
  filters,
  setFilters,
  onOpenFilterModal,
  placeholder = 'ডাক্তারের নাম, বিশেষজ্ঞতা, চেম্বার, স্থান বা বিষয় লিখে সার্ভিস খুঁজুন...',
  categoryOptions = [],
  activeFilterCount,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [smartFeedback, setSmartFeedback] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Compute active location text label for the bar button
  const activeLocationLabel = (() => {
    if (filters.location.village.trim() !== '') {
      return `🏡 ${filters.location.village}`;
    }
    if (filters.location.union !== 'all') {
      return `🌾 ${filters.location.union}`;
    }
    if (filters.location.thana !== 'all') {
      return `🚔 ${filters.location.thana}`;
    }
    if (filters.location.upazila !== 'all') {
      return `🏛️ ${filters.location.upazila}`;
    }
    return 'সকল এলাকা';
  })();

  const isLocationFilterActive =
    filters.location.upazila !== 'all' ||
    filters.location.thana !== 'all' ||
    filters.location.union !== 'all' ||
    filters.location.village.trim() !== '';

  // Handle Search Input Change
  const handleInputChange = (val: string) => {
    setFilters((prev) => ({ ...prev, searchInput: val }));

    // Run Smart Parser if input length >= 3
    if (val.trim().length >= 3) {
      const parsed = parseSmartSearchQuery(val, categoryOptions);
      if (Object.keys(parsed.updatedState).length > 0) {
        setFilters((prev) => ({
          ...prev,
          ...parsed.updatedState,
        }));
        setSmartFeedback(parsed.feedbackText);
      }
    } else {
      setSmartFeedback(null);
    }
  };

  // 🎙️ Voice Search Implementation (Bengali Language Support)
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('আপনার ব্রাউজারে বাংলা ভয়েস ইনপুট সাপোর্ট করছে না। অনুগ্রহ করে টাইপ করে লিখুন।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('🎙️ কথা বলুন... (যেমন: "পুঠিয়ায় শিশু বিশেষজ্ঞ ডাক্তার দেখাও")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        toast.success(`ভয়েস পেয়েছি: "${transcript}"`);
        handleInputChange(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        toast.error('ভয়েস সনাক্ত করা যায়নি। অনুগ্রহ করে স্পষ্ট করে আবার বলুন।');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Voice search failed:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-2 font-sans">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        
        {/* Main Text Input with Embedded Voice Mic 🎙️ */}
        <div className="flex-1 h-12 bg-white rounded-2xl shadow-sm border border-slate-200/90 flex items-center px-3.5 gap-2 transition-all focus-within:ring-2 focus-within:ring-[#006a4e] focus-within:border-[#006a4e]">
          <Search size={18} className="text-slate-400 shrink-0" />
          
          <input
            type="text"
            value={filters.searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />

          {filters.searchInput && (
            <button
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchInput: '' }));
                setSmartFeedback(null);
              }}
              className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer shrink-0 p-0.5"
              title="মুছে ফেলুন"
            >
              <X size={16} />
            </button>
          )}

          {/* 🎙️ Voice Search Mic Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`w-8 h-8 rounded-xl border-none cursor-pointer shrink-0 transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md ring-4 ring-red-200'
                : 'bg-emerald-50 text-[#006a4e] hover:bg-emerald-100'
            }`}
            title="🎙️ ভয়েস সার্চ (বাংলায় বলুন)"
          >
            {isListening ? (
              <MicOff size={15} className="animate-spin" />
            ) : (
              <Mic size={15} className="stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* 📍 Filter Modal Trigger Button */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`h-12 rounded-2xl shadow-sm border px-3.5 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer shrink-0 transition-all active:scale-95 ${
            activeFilterCount > 0
              ? 'bg-[#006a4e] text-white border-[#006a4e]'
              : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
          }`}
          title="ফিল্টার অপশন"
        >
          <Filter size={16} />
          <span className="hidden sm:inline">ফিল্টার</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* 📍 Primary Location System Button (Opens Upazila, Thana, Union, Village Selector Modal) */}
        <button
          type="button"
          onClick={() => setIsLocationModalOpen(true)}
          className={`h-12 rounded-2xl shadow-sm border px-3.5 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer shrink-0 transition-all active:scale-95 ${
            isLocationFilterActive
              ? 'bg-[#006a4e] text-white border-[#006a4e]'
              : 'bg-white text-[#006a4e] border-slate-200/90 hover:bg-emerald-50/60'
          }`}
          title="উপজেলা, থানা, ইউনিয়ন বা গ্রাম পরিবর্তন করুন"
        >
          <MapPin size={15} className={isLocationFilterActive ? 'text-white' : 'text-[#006a4e]'} />
          <span className="truncate max-w-[130px] sm:max-w-none">{activeLocationLabel}</span>
          <ChevronDown size={14} className={isLocationFilterActive ? 'text-white/80' : 'text-[#006a4e]/80'} />
        </button>

      </div>

      {/* 📍 Global Location Selector Modal (Upazila, Thana, Union, Village) */}
      <GlobalLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Smart Search Feedback Toast Banner */}
      {smartFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#006a4e] rounded-xl px-3 py-1.5 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500 animate-bounce" />
            <span>{smartFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSmartFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 bg-transparent border-none cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

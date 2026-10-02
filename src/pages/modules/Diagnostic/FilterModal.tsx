import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  category: string;
  union: string;
  area: string;
  open24Hours: boolean;
  onlineReport: boolean;
  homeCollection: boolean;
  maxFee: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  if (!isOpen) return null;

  const handleReset = () => {
    const resetState: FilterState = {
      category: 'all',
      union: 'all',
      area: 'all',
      open24Hours: false,
      onlineReport: false,
      homeCollection: false,
      maxFee: 5000
    };
    setFilters(resetState);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-slate-900">ফিল্টার</h2>
          <button 
            onClick={handleReset}
            className="text-xs font-bold text-[#006a4e] hover:text-emerald-700 transition"
          >
            রিসেট
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* 1. ডায়াগনস্টিক ধরন */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              ডায়াগনস্টিকের ধরন
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'সব' },
                { id: 'govt', label: 'সরকারি' },
                { id: 'private', label: 'বেসরকারি' },
                { id: 'pathology', label: 'প্যাথলজি' },
                { id: 'imaging', label: 'ইমেজিং' }
              ].map((chip) => {
                const isSelected = filters.category === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: chip.id }))}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      isSelected 
                        ? 'bg-[#006a4e] text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. বিভাগ */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              বিভাগ
            </label>
            <select
              value={filters.area}
              onChange={(e) => setFilters(prev => ({ ...prev, area: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            >
              <option value="all">সব বিভাগ</option>
              <option value="প্যাথলজি বিভাগ">প্যাথলজি বিভাগ</option>
              <option value="ইমেজিং ও এক্স-রে">ইমেজিং ও এক্স-রে</option>
              <option value="কার্ডিওলজি (ইসিজি/ইকো)">কার্ডিওলজি (ইসিজি/ইকো)</option>
              <option value="বায়োকেমিস্ট্রি">বায়োকেমিস্ট্রি</option>
            </select>
          </div>

          {/* 3. শাখার ধরন */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              শাখার ধরন
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            >
              <option value="all">সব শাখার ধরন</option>
              <option value="প্রধান শাখা">প্রধান শাখা</option>
              <option value="উপশাখা">উপশাখা</option>
              <option value="কালেকশন বুথ">কালেকশন বুথ</option>
            </select>
          </div>

          {/* 4. ইউনিয়ন */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              ইউনিয়ন
            </label>
            <select
              value={filters.union}
              onChange={(e) => setFilters(prev => ({ ...prev, union: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006a4e]"
            >
              <option value="all">সব ইউনিয়ন</option>
              <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
              <option value="বানেশ্বর">বানেশ্বর</option>
              <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
              <option value="জিউপাড়া">জিউপাড়া</option>
              <option value="ভালুকগাছি">ভালুকগাছি</option>
              <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* ২৪ ঘণ্টা খোলা */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">২৪ ঘণ্টা ইমার্জেন্সি খোলা</span>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, open24Hours: !prev.open24Hours }))}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  filters.open24Hours ? 'bg-[#006a4e]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  filters.open24Hours ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* অনলাইন রিপোর্ট */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">অনলাইন রিপোর্ট সার্ভিস</span>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, onlineReport: !prev.onlineReport }))}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  filters.onlineReport ? 'bg-[#006a4e]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  filters.onlineReport ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* হোম কালেকশন */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">হোম ব্লড কালেকশন</span>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, homeCollection: !prev.homeCollection }))}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  filters.homeCollection ? 'bg-[#006a4e]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                  filters.homeCollection ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* দূরত্ব (কিমি) Slider */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-slate-800">
                দূরত্ব (কিমি)
              </label>
              <span className="text-xs font-bold text-[#006a4e]">
                {filters.maxFee >= 5000 ? '২০+ কিমি' : `${Math.round(filters.maxFee / 250)} কিমি`}
              </span>
            </div>
            <input 
              type="range"
              min="200"
              max="5000"
              step="100"
              value={filters.maxFee}
              onChange={(e) => setFilters(prev => ({ ...prev, maxFee: Number(e.target.value) }))}
              className="w-full accent-[#006a4e] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>১ কিমি</span>
              <span>২০+ কিমি</span>
            </div>
          </div>

        </div>

        {/* Footer Button */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
          >
            ফিল্টার প্রয়োগ করুন
          </button>
        </div>

      </div>
    </div>
  );
};


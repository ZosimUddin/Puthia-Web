import React from "react";
import {
  Search,
  Filter,
  Calendar,
  Layers,
  MapPin,
  X,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { MemoryType, BENGALI_MONTHS, toBengaliNumber } from "../../services/memoryService";

interface MemorySearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: MemoryType | 'all';
  onTypeChange: (t: MemoryType | 'all') => void;
  selectedYear: number | 'all';
  onYearChange: (y: number | 'all') => void;
  selectedMonth: number | 'all';
  onMonthChange: (m: number | 'all') => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  onResetFilters: () => void;
}

const TYPE_OPTIONS: { id: MemoryType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'সব স্মৃতি', icon: '✨' },
  { id: 'post', label: 'পোস্ট', icon: '📝' },
  { id: 'photo', label: 'ছবি', icon: '📷' },
  { id: 'video', label: 'ভিডিও', icon: '🎥' },
  { id: 'album', label: 'অ্যালবাম', icon: '📁' },
  { id: 'event', label: 'ইভেন্ট', icon: '📅' },
  { id: 'story', label: 'স্টোরি', icon: '🕰️' }
];

const UNIONS = [
  "সকল এলাকা",
  "পুঠিয়া ইউনিয়ন",
  "বানেশ্বর ইউনিয়ন",
  "বেলপুকুরিয়া ইউনিয়ন",
  "জিউপাড়া ইউনিয়ন",
  "শিলমাড়িয়া ইউনিয়ন",
  "ভালুকগাছি ইউনিয়ন"
];

const AVAILABLE_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export const MemorySearchFilter: React.FC<MemorySearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  selectedLocation,
  onLocationChange,
  onResetFilters
}) => {
  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedType !== 'all' ||
    selectedYear !== 'all' ||
    selectedMonth !== 'all' ||
    selectedLocation !== 'সকল এলাকা';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      {/* 1. Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="স্মৃতি খুঁজুন (কীওয়ার্ড, বিষয়, অনুভূতি, ঘটনা)..."
          className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Type Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TYPE_OPTIONS.map(item => {
          const isActive = selectedType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTypeChange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#006a4e] text-white shadow-sm shadow-emerald-700/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Year, Month, Location Dropdown Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* Year */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">স্মৃতির বছর:</label>
          <select
            value={selectedYear}
            onChange={e => onYearChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">📅 সকল বছর</option>
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y}>{toBengaliNumber(y)} সাল</option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">স্মৃতির মাস:</label>
          <select
            value={selectedMonth}
            onChange={e => onMonthChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">🗓️ সকল মাস</option>
            {BENGALI_MONTHS.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>
        </div>

        {/* Location / Union */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">এলাকা:</label>
          <select
            value={selectedLocation}
            onChange={e => onLocationChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {UNIONS.map(u => (
              <option key={u} value={u}>📍 {u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Reset Filters Button */}
      {isFiltered && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>ফিল্টার রিসেট করুন</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MemorySearchFilter;

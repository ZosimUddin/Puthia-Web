import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Filter, MapPin, Star, ShieldCheck, Clock, Compass, DollarSign, 
  RotateCcw, Check, Navigation, Sparkles, ArrowUpDown, ArrowLeft
} from 'lucide-react';
import { 
  GlobalFilterState, 
  RatingFilterValue, 
  VerificationFilterValue, 
  AvailabilityFilterValue, 
  DistanceFilterValue, 
  FeeFilterValue, 
  SortOptionValue 
} from './types';
import { RAJSHAHI_UPAZILAS, PUTHIA_UNIONS } from '../../../config/servicesConfig';

interface GlobalSearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  onReset: () => void;
  totalResultsCount?: number;
  categoryOptions?: { id: string; label: string; icon?: string }[];
  serviceTitle?: string;
}

const THANA_OPTIONS = [
  { value: 'all', label: 'সকল থানা' },
  { value: 'পুঠিয়া থানা', label: '🚔 পুঠিয়া থানা' },
  { value: 'বাঘমারা থানা', label: '🚔 বাঘমারা থানা' },
  { value: 'চারঘাট থানা', label: '🚔 চারঘাট থানা' },
  { value: 'দুর্গাপুর থানা', label: '🚔 দুর্গাপুর থানা' },
  { value: 'বোয়ালিয়া থানা', label: '🚔 বোয়ালিয়া থানা (রাজশাহী)' },
  { value: 'রাজপাড়া থানা', label: '🚔 রাজপাড়া থানা (রাজশাহী)' },
  { value: 'মতিহার থানা', label: '🚔 মতিহার থানা (রাজশাহী)' },
  { value: 'শাহ মখদুম থানা', label: '🚔 শাহ মখদুম থানা (রাজশাহী)' },
  { value: 'কাশিয়াডাঙ্গা থানা', label: '🚔 কাশিয়াডাঙ্গা থানা (রাজশাহী)' },
  { value: 'কাটাখালী থানা', label: '🚔 কাটাখালী থানা (রাজশাহী)' },
  { value: 'অন্যান্য', label: '❓ অন্যান্য থানা' },
];

export const GlobalSearchFilterModal: React.FC<GlobalSearchFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onReset,
  totalResultsCount = 0,
  categoryOptions = [],
  serviceTitle = 'সেবা',
}) => {
  if (!isOpen) return null;

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFilters((prev) => ({
            ...prev,
            userCoords: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
            distance: prev.distance === 'all' ? '5km' : prev.distance,
            sortBy: 'distance',
          }));
        },
        (err) => {
          console.warn('Geolocation denied/error:', err);
        }
      );
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[99999] bg-white overflow-hidden flex flex-col w-full h-full animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col bg-white overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#006a4e] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <div className="pr-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white border-none cursor-pointer transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/15 rounded-xl hidden xs:block">
                  <Filter size={18} className="text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>ফিল্টার অপশন</span>
                    <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {serviceTitle}
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    রেটিং, ফি ও স্ট্যাটাস ফিল্টার করুন
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:block p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full p-5 space-y-6 text-slate-800">

            {/* SECTION: ⭐ Rating Filter */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">
                ⭐ ন্যূনতম রেটিং (Rating)
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { value: 'all', label: 'সব' },
                  { value: '5.0', label: '5.0 ⭐' },
                  { value: '4.5+', label: '4.5+ ⭐' },
                  { value: '4.0+', label: '4.0+ ⭐' },
                  { value: '3.0+', label: '3.0+ ⭐' },
                ].map((item) => {
                  const isActive = filters.rating === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, rating: item.value as RatingFilterValue }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: 🛡️ Verification Filter */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">
                🛡️ যাচাইকরণ স্ট্যাটাস (Verification)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'সব সেবা' },
                  { value: 'verified', label: '☑️ Verified' },
                  { value: 'officially_verified', label: '🏛️ Off. Verified' },
                ].map((item) => {
                  const isActive = filters.verification === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, verification: item.value as VerificationFilterValue }))}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: 🕐 Availability Filter */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">
                🕐 উপলব্ধতা (Availability)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'all', label: 'সবসময়' },
                  { value: 'open_today', label: 'আজ খোলা' },
                  { value: 'available_now', label: 'এখন Available' },
                  { value: 'chamber_today', label: 'আজ চেম্বার আছে' },
                  { value: '24_hours', label: '২৪ ঘণ্টা' },
                ].map((item) => {
                  const isActive = filters.availability === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, availability: item.value as AvailabilityFilterValue }))}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 6: 📏 Distance / Proximity */}
            <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Compass size={15} className="text-[#006a4e]" />
                  <span>📏 দূরত্ব / কাছাকাছি সেবা</span>
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-[11px] font-bold bg-[#006a4e] text-white px-2.5 py-1 rounded-lg flex items-center gap-1 border-none cursor-pointer hover:bg-emerald-800 transition-colors"
                >
                  <Navigation size={12} />
                  <span>{filters.userCoords ? '📍 সনাক্তকৃত' : 'আমার অবস্থান'}</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'all', label: 'সব দূরত্ব' },
                  { value: '1km', label: '১ কিমি' },
                  { value: '5km', label: '৫ কিমি' },
                  { value: '10km', label: '১০ কিমি' },
                ].map((item) => {
                  const isActive = filters.distance === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, distance: item.value as DistanceFilterValue }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 7: 💰 Fee / Price Filter */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                <DollarSign size={15} className="text-[#006a4e]" />
                <span>💰 ফি / মূল্য সীমা</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'সব ফি' },
                  { value: 'under_300', label: '৩০০৳ এর নিচে' },
                  { value: '300_500', label: '৩০০৳ - ৫০০৳' },
                  { value: '500_1000', label: '৫০০৳ - ১০০০৳' },
                  { value: 'above_1000', label: '১০০০৳ এর বেশি' },
                  { value: 'low_to_high', label: 'ফি: কম → বেশি' },
                ].map((item) => {
                  const isActive = filters.fee === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, fee: item.value as FeeFilterValue }))}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 8: 🔄 Sort System */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                <ArrowUpDown size={15} className="text-[#006a4e]" />
                <span>🔄 সর্টিং (Sort By)</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'rating', label: '⭐ সর্বোচ্চ রেটিং' },
                  { value: 'distance', label: '📍 কাছাকাছি' },
                  { value: 'newest', label: '🆕 নতুন যুক্ত' },
                  { value: 'popular', label: '🔥 জনপ্রিয়' },
                  { value: 'verified', label: '🛡️ Verified' },
                  { value: 'name_asc', label: '↕️ নাম অনুযায়ী' },
                ].map((item) => {
                  const isActive = filters.sortBy === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, sortBy: item.value as SortOptionValue }))}
                      className={`py-2 px-2.5 text-left rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <Check size={14} className="text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer transition-colors active:scale-95 shrink-0"
            >
              <RotateCcw size={15} />
              <span>রিসেট</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#006a4e] hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md border-none cursor-pointer transition-all active:scale-95"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>ফলাফল দেখুন ({totalResultsCount}টি সেবা)</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  ) : null;
};

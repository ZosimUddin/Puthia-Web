import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Navigation, Check, RotateCcw, ArrowLeft } from 'lucide-react';
import { GlobalFilterState } from './types';

// Location Options Data
export const RAJSHAHI_UPAZILAS = [
  { value: 'all', label: 'সকল উপজেলা' },
  { value: 'পুঠিয়া', label: 'পুঠিয়া উপজেলা' },
  { value: 'বাঘমারা', label: 'বাঘমারা উপজেলা' },
  { value: 'চারঘাট', label: 'চারঘাট উপজেলা' },
  { value: 'দুর্গাপুর', label: 'দুর্গাপুর উপজেলা' },
  { value: 'বাঘা', label: 'বাঘা উপজেলা' },
  { value: 'পবা', label: 'পবা উপজেলা' },
  { value: 'মোহনপুর', label: 'মোহনপুর উপজেলা' },
  { value: 'তানোর', label: 'তানোর উপজেলা' },
  { value: 'গোদাগাড়ী', label: 'গোদাগাড়ী উপজেলা' },
  { value: 'বোয়ালিয়া', label: 'বোয়ালিয়া (সিটি)' },
  { value: 'রাজপাড়া', label: 'রাজপাড়া (সিটি)' },
  { value: 'মতিহার', label: 'মতিহার (সিটি)' },
  { value: 'শাহ মখদুম', label: 'শাহ মখদুম (সিটি)' },
];

export const THANA_OPTIONS = [
  { value: 'all', label: 'সকল থানা' },
  { value: 'পুঠিয়া থানা', label: 'পুঠিয়া থানা' },
  { value: 'বাঘমারা থানা', label: 'বাঘমারা থানা' },
  { value: 'চারঘাট থানা', label: 'চারঘাট থানা' },
  { value: 'বোয়ালিয়া থানা', label: 'বোয়ালিয়া থানা' },
  { value: 'রাজশাহী সদর থানা', label: 'রাজশাহী সদর থানা' },
];

export const PUTHIA_UNIONS = [
  { value: 'all', label: 'সকল ইউনিয়ন/এলাকা' },
  { value: 'পুঠিয়া সদর', label: 'পুঠিয়া সদর ইউনিয়ন' },
  { value: 'বানেশ্বর', label: 'বানেশ্বর ইউনিয়ন' },
  { value: 'বেলপুকুরিয়া', label: 'বেলপুকুরিয়া ইউনিয়ন' },
  { value: 'ভালুকগাছি', label: 'ভালুকগাছি ইউনিয়ন' },
  { value: 'জিউপাড়া', label: 'জিউপাড়া ইউনিয়ন' },
  { value: 'শিলমাড়িয়া', label: 'শিলমাড়িয়া ইউনিয়ন' },
];

interface GlobalLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
}

export const GlobalLocationModal: React.FC<GlobalLocationModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
}) => {
  if (!isOpen) return null;

  // Compute current active location level
  const activeLocLevel = (() => {
    if (filters.location.village.trim() !== '') return 'village';
    if (filters.location.union !== 'all') return 'union';
    if (filters.location.thana !== 'all') return 'thana';
    if (filters.location.upazila !== 'all') return 'upazila';
    return 'all';
  })();

  // Handle clicking 🌐 সব (Reset all location levels)
  const handleSelectAllLocation = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: 'all',
        union: 'all',
        village: '',
      },
    }));
  };

  // Handle clicking 🏛️ উপজেলা tab
  const handleSelectUpazilaMode = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: prev.location.upazila !== 'all' ? prev.location.upazila : 'পুঠিয়া',
        thana: 'all',
        union: 'all',
        village: '',
      },
    }));
  };

  // Handle clicking 🚔 থানা tab
  const handleSelectThanaMode = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: prev.location.thana !== 'all' ? prev.location.thana : 'পুঠিয়া থানা',
        union: 'all',
        village: '',
      },
    }));
  };

  // Handle clicking 🌾 ইউনিয়ন tab
  const handleSelectUnionMode = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: 'all',
        union: prev.location.union !== 'all' ? prev.location.union : 'পুঠিয়া সদর',
        village: '',
      },
    }));
  };

  // Handle clicking 🏡 গ্রাম tab
  const handleSelectVillageMode = () => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: 'all',
        union: 'all',
        village: prev.location.village,
      },
    }));
  };

  // Select box changes - ensure ONLY the chosen level remains active
  const handleUpazilaChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: val,
        thana: 'all',
        union: 'all',
        village: '',
      },
    }));
  };

  const handleThanaChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: val,
        union: 'all',
        village: '',
      },
    }));
  };

  const handleUnionChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: 'all',
        union: val,
        village: '',
      },
    }));
  };

  const handleVillageChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      location: {
        district: 'রাজশাহী',
        upazila: 'all',
        thana: 'all',
        union: 'all',
        village: val,
      },
    }));
  };

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
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/15 rounded-xl hidden xs:block">
                    <MapPin size={18} className="text-emerald-200" />
                  </div>
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>📍 অবস্থান নির্বাচন</span>
                    <span className="text-xs bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      রাজশাহী জেলা
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  উপজেলা, থানা, ইউনিয়ন বা গ্রামের ভিত্তিতে এলাকা ফিল্টার করুন
                </p>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full p-4 sm:p-5 space-y-4">
            
            {/* Location Inputs */}
            <div className="space-y-3 pt-1">
              
              {/* 1. Upazila */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  🏛️ উপজেলা নির্বাচন করুন
                </label>
                <select
                  value={filters.location.upazila}
                  onChange={(e) => handleUpazilaChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#006a4e] focus:border-transparent transition-all"
                >
                  {RAJSHAHI_UPAZILAS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Thana */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  🚔 থানা নির্বাচন করুন
                </label>
                <select
                  value={filters.location.thana}
                  onChange={(e) => handleThanaChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#006a4e] focus:border-transparent transition-all"
                >
                  {THANA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Union */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  🌾 ইউনিয়ন / এলাকা নির্বাচন করুন
                </label>
                <select
                  value={filters.location.union}
                  onChange={(e) => handleUnionChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#006a4e] focus:border-transparent transition-all"
                >
                  {PUTHIA_UNIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Village */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  🏡 গ্রাম / মহল্লার নাম
                </label>
                <input
                  type="text"
                  placeholder="আপনার গ্রামের নাম টাইপ করুন (যেমন: বেলপুকুর)..."
                  value={filters.location.village}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-[#006a4e] focus:border-transparent placeholder:text-slate-400 transition-all"
                />
              </div>

            </div>

            {/* GPS Position */}
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full py-2.5 px-3 bg-emerald-50 text-[#006a4e] hover:bg-emerald-100 rounded-2xl border border-emerald-200 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Navigation size={15} />
              <span>📍 আমার নিকটস্থ জিপিএস অবস্থান সনাক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAllLocation}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 border-none bg-transparent cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>স্থান রিসেট</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl font-black text-xs shadow-md transition-all border-none cursor-pointer"
            >
              প্রয়োগ করুন
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  ) : null;
};

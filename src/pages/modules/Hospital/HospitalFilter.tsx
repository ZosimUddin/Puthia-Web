import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Check, ChevronDown, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { UNIONS, FACILITIES_LIST, HOSPITAL_TYPES } from './constants';

interface HospitalFilterProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  type: string;
  union: string;
  open24Hours: boolean;
  hasAmbulance: boolean;
  hasEmergencyDept: boolean;
  selectedFacilities: string[];
  acceptsGovtHealthCard: boolean;
  acceptsInsurance: boolean;
  sortBy: string;
}

export default function HospitalFilter({ onClose, onApply, initialFilters }: HospitalFilterProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    type: 'all',
    union: 'সকল এলাকা',
    open24Hours: false,
    hasAmbulance: false,
    hasEmergencyDept: false,
    selectedFacilities: [],
    acceptsGovtHealthCard: false,
    acceptsInsurance: false,
    sortBy: 'relevant'
  });

  const handleReset = () => {
    setFilters({
      type: 'all',
      union: 'সকল এলাকা',
      open24Hours: false,
      hasAmbulance: false,
      hasEmergencyDept: false,
      selectedFacilities: [],
      acceptsGovtHealthCard: false,
      acceptsInsurance: false,
      sortBy: 'relevant'
    });
  };

  const handleToggleFacility = (name: string) => {
    setFilters(prev => ({
      ...prev,
      selectedFacilities: prev.selectedFacilities.includes(name)
        ? prev.selectedFacilities.filter(f => f !== name)
        : [...prev.selectedFacilities, name]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm flex justify-end sm:items-center sm:justify-center p-0 sm:p-4"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="bg-white w-full sm:max-w-xl h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-[#006a4e] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={20} className="text-emerald-200" />
            <h2 className="text-base font-bold text-white">ফিল্টার অপশন</h2>
          </div>
          
          <button 
            onClick={handleReset}
            className="text-xs font-bold text-emerald-100 hover:text-white cursor-pointer border-none bg-transparent flex items-center gap-1"
          >
            <RotateCcw size={14} /> সব রিসেট করুন
          </button>
        </div>

        {/* Filter Scrollable Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* 1. হাসপাতালের ধরন */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">হাসপাতালের ধরন</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'সকল' },
                { id: 'सरकारी', label: 'সরকারি' },
                { id: 'বেসরকারি', label: 'বেসরকারি' },
                { id: 'বিশেষায়িত', label: 'বিশেষায়িত' },
                { id: 'ক্লিনিক', label: 'ক্লিনিক' },
                { id: 'মাতৃসদন', label: 'মাতৃসদন' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilters({ ...filters, type: item.id })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    filters.type === item.id 
                      ? 'bg-[#006a4e] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. অবস্থান / ইউনিয়ন */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">অবস্থান (ইউনিয়ন / এলাকা)</label>
            <div className="flex flex-wrap gap-2">
              {UNIONS.map(union => (
                <button
                  key={union}
                  onClick={() => setFilters({ ...filters, union })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    filters.union === union
                      ? 'bg-[#006a4e] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {union}
                </button>
              ))}
            </div>
          </div>

          {/* 3. জরুরি সেবা সুবিধা */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">জরুরি সেবা ও অ্যাম্বুলেন্স</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.open24Hours}
                  onChange={e => setFilters({ ...filters, open24Hours: e.target.checked })}
                  className="accent-[#006a4e] w-4 h-4"
                />
                <span>🚑 ২৪ ঘণ্টা জরুরি সেবা</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.hasAmbulance}
                  onChange={e => setFilters({ ...filters, hasAmbulance: e.target.checked })}
                  className="accent-[#006a4e] w-4 h-4"
                />
                <span>🚐 অ্যাম্বুলেন্স সুবিধা রয়েছে</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.hasEmergencyDept}
                  onChange={e => setFilters({ ...filters, hasEmergencyDept: e.target.checked })}
                  className="accent-[#006a4e] w-4 h-4"
                />
                <span>🏥 জরুরি বিভাগ বিদ্যমান</span>
              </label>
            </div>
          </div>

          {/* 4. হাসপাতালের সুবিধা (Facilities) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">হাসপাতালের সুবিধাসমূহ</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FACILITIES_LIST.map(fac => {
                const isSelected = filters.selectedFacilities.includes(fac.name);
                return (
                  <button
                    key={fac.id}
                    onClick={() => handleToggleFacility(fac.name)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-50 border-[#006a4e] text-[#006a4e]'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{fac.icon}</span>
                    <span className="truncate">{fac.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. বীমা ও সরকারি কার্ড */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">অন্যান্য গ্রহণযোগ্যতা</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.acceptsGovtHealthCard}
                  onChange={e => setFilters({ ...filters, acceptsGovtHealthCard: e.target.checked })}
                  className="accent-[#006a4e] w-4 h-4"
                />
                <span>সরকারি স্বাস্থ্যসেবা সুবিধা</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.acceptsInsurance}
                  onChange={e => setFilters({ ...filters, acceptsInsurance: e.target.checked })}
                  className="accent-[#006a4e] w-4 h-4"
                />
                <span>স্বাস্থ্য বীমা সুবিধা</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-[#006a4e] text-white rounded-2xl text-xs font-bold hover:bg-[#00553e] transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} />
            <span>ফিল্টার প্রয়োগ করুন</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal, RotateCcw, Check, Car, Users, MapPin, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import { VehicleFilterState } from './types';
import { CATEGORY_CHIPS, SERVICE_TYPES, PUTHIA_UNIONS } from './data';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: VehicleFilterState) => void;
  initialFilters: VehicleFilterState;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters
}) => {
  const [filters, setFilters] = useState<VehicleFilterState>(initialFilters);

  if (!isOpen) return null;

  const handleReset = () => {
    const resetState: VehicleFilterState = {
      category: 'all',
      serviceType: 'all',
      driverOption: 'all',
      seating: 'all',
      union: 'all',
      area: 'all',
      availability: 'all',
      minPrice: 0,
      maxPrice: 10000,
      isAC: false
    };
    setFilters(resetState);
    onApply(resetState);
    onClose();
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006a4e] flex items-center justify-center font-bold">
                <SlidersHorizontal size={18} />
              </div>
              <h2 className="text-base font-bold text-slate-900">গাড়ি ফিল্টার করুন</h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            
            {/* 1. Vehicle Type */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Car size={14} className="text-[#006a4e]" />
                গাড়ির ধরন (Vehicle Type)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_CHIPS.map(cat => {
                  const isSelected = filters.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Service Type */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#006a4e]" />
                সেবার ধরন (Service Type)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, serviceType: 'all' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                    filters.serviceType === 'all'
                      ? 'bg-[#006a4e] text-white border-[#006a4e]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  সকল সেবা
                </button>
                {SERVICE_TYPES.map(st => {
                  const isSelected = filters.serviceType === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setFilters(prev => ({ ...prev, serviceType: st.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#006a4e] text-white border-[#006a4e]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="mr-1">{st.icon}</span>
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Driver Option */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                👨‍✈️ ড্রাইভার অপশন
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'সকল' },
                  { id: 'with_driver', label: 'ড্রাইভারসহ' },
                  { id: 'without_driver', label: 'ড্রাইভার ছাড়া' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setFilters(prev => ({ ...prev, driverOption: d.id }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center cursor-pointer transition-all ${
                      filters.driverOption === d.id
                        ? 'bg-[#006a4e] text-white border-[#006a4e]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Seating Capacity */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Users size={14} className="text-[#006a4e]" />
                আসন সংখ্যা (Seating Capacity)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'সকল' },
                  { id: '1-4', label: '১–৪ আসন' },
                  { id: '5-7', label: '৫–৭ আসন' },
                  { id: '8-14', label: '৮–১৪ আসন' },
                  { id: '15+', label: '১৫+ আসন' }
                ].map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => setFilters(prev => ({ ...prev, seating: seat.id }))}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border text-center cursor-pointer transition-all ${
                      filters.seating === seat.id
                        ? 'bg-[#006a4e] text-white border-[#006a4e]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {seat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Location (Puthia Union) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#006a4e]" />
                ইউনিয়ন / এলাকা (Puthia Location)
              </label>
              <select
                value={filters.union}
                onChange={e => setFilters(prev => ({ ...prev, union: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
              >
                <option value="all">সকল ইউনিয়ন (পুঠিয়া উপজেলা)</option>
                {PUTHIA_UNIONS.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* 6. AC Feature Checkbox */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50/60 border border-cyan-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">❄️</span>
                <div>
                  <h4 className="text-xs font-bold text-cyan-900">শুধুমাত্র এসি (Air Conditioned)</h4>
                  <p className="text-[11px] text-cyan-700">শুধু এয়ারকন্ডিশনড গাড়ি ফিল্টার করুন</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={filters.isAC}
                onChange={e => setFilters(prev => ({ ...prev, isAC: e.target.checked }))}
                className="w-5 h-5 accent-[#006a4e] cursor-pointer"
              />
            </div>

            {/* 7. Max Daily Price Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-[#006a4e]" />
                  সর্বোচ্চ দৈনিক বাজেট
                </label>
                <span className="text-xs font-black text-[#006a4e]">
                  ৳{filters.maxPrice.toLocaleString('bn-BD')}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={500}
                value={filters.maxPrice}
                onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-[#006a4e] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>৳৫০০</span>
                <span>৳১৫,০০০+</span>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>রিসেট</span>
            </button>

            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Check size={16} />
              <span>ফিল্টার প্রয়োগ করুন</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FilterModal;

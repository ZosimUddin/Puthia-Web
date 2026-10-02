import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Filter, RotateCcw, Check, MapPin, Building, Award, Compass } from 'lucide-react';
import { UNIONS, NGO_TYPES, SERVICE_FIELDS, DISTANCE_OPTIONS } from './constants';

export interface FilterState {
  type: string;
  union: string;
  serviceField: string;
  distance: string;
}

interface NgoFilterModalProps {
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  onClose: () => void;
}

export const NgoFilterModal: React.FC<NgoFilterModalProps> = ({
  currentFilters,
  onApply,
  onReset,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState(currentFilters.type || 'সব ধরন');
  const [selectedUnion, setSelectedUnion] = useState(currentFilters.union || 'সব ইউনিয়ন');
  const [selectedServiceField, setSelectedServiceField] = useState(currentFilters.serviceField || 'সব ক্ষেত্র');
  const [selectedDistance, setSelectedDistance] = useState(currentFilters.distance || 'সব দূরত্ব');

  const handleApply = () => {
    onApply({
      type: selectedType,
      union: selectedUnion,
      serviceField: selectedServiceField,
      distance: selectedDistance
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedType('সব ধরন');
    setSelectedUnion('সব ইউনিয়ন');
    setSelectedServiceField('সব ক্ষেত্র');
    setSelectedDistance('সব দূরত্ব');
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10008] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Filter size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">এনজিও ফিল্টার</h3>
              <p className="text-xs font-bold text-slate-400">আপনার পছন্দ অনুযায়ী এনজিও খুঁজুন</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* NGO Type */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building size={14} className="text-emerald-600" /> এনজিওর ধরন
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NGO_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border cursor-pointer text-center ${
                    selectedType === t
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Union */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600" /> ইউনিয়ন নির্বাচন
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UNIONS.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUnion(u)}
                  className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border cursor-pointer text-center ${
                    selectedUnion === u
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Service Field */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Award size={14} className="text-emerald-600" /> সেবার ক্ষেত্র
            </label>
            <div className="flex flex-wrap gap-2">
              {['সব ক্ষেত্র', ...SERVICE_FIELDS].map((sf) => (
                <button
                  key={sf}
                  onClick={() => setSelectedServiceField(sf)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                    selectedServiceField === sf
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {sf}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-emerald-600" /> সর্বোচ্চ দূরত্ব
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {DISTANCE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistance(d)}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-black transition-all border cursor-pointer text-center ${
                    selectedDistance === d
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw size={16} /> রিসেট
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
          >
            <Check size={16} /> ফিল্টার প্রয়োগ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};

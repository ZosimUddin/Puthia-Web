import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, Check, Car, Star, Users } from 'lucide-react';
import { Vehicle } from './types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  vehicles
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    vehicles.slice(0, 2).map(v => v.id)
  );

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const comparedVehicles = vehicles.filter(v => selectedIds.includes(v.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-[#006a4e]" />
              <h3 className="text-sm font-bold text-slate-900">গাড়ি তুলনা করুন (Compare)</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            
            {/* Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">তুলনা করতে অন্তত ২টি গাড়ি নির্বাচন করুন (সর্বোচ্চ ৩টি)</label>
              <div className="flex flex-wrap gap-1.5">
                {vehicles.map(v => {
                  const isSel = selectedIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleSelect(v.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isSel ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {v.name.slice(0, 18)}...
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-3 text-slate-700 font-extrabold w-28">বৈশিষ্ট্য</th>
                    {comparedVehicles.map(v => (
                      <th key={v.id} className="p-3 font-bold text-slate-900 min-w-[140px]">
                        {v.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">ধরণ</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-medium text-slate-800">{v.typeLabel}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">আসন</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-medium text-slate-800">{v.seatCapacity} জন</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">এসি (AC)</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-medium text-slate-800">{v.isAC ? 'হ্যাঁ (AC)' : 'নন-এসি'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">ড্রাইভার</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-medium text-slate-800">
                        {v.driverOption === 'with_driver' ? 'ড্রাইভারসহ' : 'ড্রাইভার ছাড়া'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">দৈনিক ভাড়া</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-extrabold text-[#006a4e]">
                        {v.pricing.daily ? `৳${v.pricing.daily}` : 'কথা সাপেক্ষে'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-500 bg-slate-50/50">রেটিং</td>
                    {comparedVehicles.map(v => (
                      <td key={v.id} className="p-3 font-medium text-amber-600">
                        ★ {v.rating} ({v.reviewCount})
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompareModal;

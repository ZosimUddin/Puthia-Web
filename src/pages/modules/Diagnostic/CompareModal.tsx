import React, { useState } from 'react';
import { DiagnosticCenter } from './types';
import { ArrowLeft, Check, X, Phone, ArrowRightLeft } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  centers: DiagnosticCenter[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  centers
}) => {
  const [center1Id, setCenter1Id] = useState<string>(centers[0]?.id || '');
  const [center2Id, setCenter2Id] = useState<string>(centers[1]?.id || centers[0]?.id || '');

  if (!isOpen) return null;

  const center1 = centers.find(c => c.id === center1Id) || centers[0];
  const center2 = centers.find(c => c.id === center2Id) || centers[1] || centers[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <ArrowRightLeft size={16} className="text-[#006a4e]" />
            ডায়াগনস্টিক তুলনা
          </h2>
          <div className="w-9" />
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Selectors for comparison */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">প্রথম ডায়াগনস্টিক</label>
              <select
                value={center1Id}
                onChange={(e) => setCenter1Id(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-[#006a4e] outline-none"
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">দ্বিতীয় ডায়াগনস্টিক</label>
              <select
                value={center2Id}
                onChange={(e) => setCenter2Id(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-[#006a4e] outline-none"
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          {center1 && center2 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs">
              
              {/* Header Row */}
              <div className="grid grid-cols-3 bg-slate-100 p-3 font-bold text-slate-800 text-center border-b border-slate-200">
                <div className="text-left text-slate-500">বৈশিষ্ট্য</div>
                <div className="text-[#006a4e] truncate px-1">{center1.name}</div>
                <div className="text-[#006a4e] truncate px-1">{center2.name}</div>
              </div>

              {/* Rows */}
              {[
                {
                  label: 'ধরন',
                  val1: center1.type === 'govt' ? 'সরকারি' : 'বেসরকারি',
                  val2: center2.type === 'govt' ? 'সরকারি' : 'বেসরকারি'
                },
                {
                  label: 'দূরত্ব',
                  val1: center1.distance || '১.২ কিমি',
                  val2: center2.distance || '১.৮ কিমি'
                },
                {
                  label: 'রেটিং',
                  val1: `★ ${center1.rating}`,
                  val2: `★ ${center2.rating}`
                },
                {
                  label: '২৪/৭ খোলা',
                  bool1: center1.open24Hours,
                  bool2: center2.open24Hours
                },
                {
                  label: 'অনলাইন রিপোর্ট',
                  bool1: center1.onlineReport,
                  bool2: center2.onlineReport
                },
                {
                  label: 'হোম কালেকশন',
                  bool1: center1.homeCollection,
                  bool2: center2.homeCollection
                },
                {
                  label: 'ডিজিটাল পেমেন্ট',
                  bool1: center1.digitalPayment,
                  bool2: center2.digitalPayment
                },
                {
                  label: 'রিপোর্ট প্রদান',
                  val1: center1.reportTime,
                  val2: center2.reportTime
                }
              ].map((row, idx) => (
                <div 
                  key={idx}
                  className={`grid grid-cols-3 p-3 items-center text-center border-b border-slate-100 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="text-left font-semibold text-slate-600">{row.label}</div>
                  
                  {/* Val 1 */}
                  <div className="font-bold text-slate-800 flex items-center justify-center">
                    {row.bool1 !== undefined ? (
                      row.bool1 ? <Check size={16} className="text-[#006a4e]" /> : <X size={16} className="text-red-400" />
                    ) : (
                      <span>{row.val1}</span>
                    )}
                  </div>

                  {/* Val 2 */}
                  <div className="font-bold text-slate-800 flex items-center justify-center">
                    {row.bool2 !== undefined ? (
                      row.bool2 ? <Check size={16} className="text-[#006a4e]" /> : <X size={16} className="text-red-400" />
                    ) : (
                      <span>{row.val2}</span>
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* Bottom CTA */}
        <div className="p-3 border-t border-slate-100 bg-white grid grid-cols-2 gap-2">
          <a
            href={`tel:${center1?.phone}`}
            className="bg-[#006a4e] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Phone size={14} />
            {center1?.name.slice(0, 12)}...
          </a>

          <a
            href={`tel:${center2?.phone}`}
            className="bg-[#006a4e] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Phone size={14} />
            {center2?.name.slice(0, 12)}...
          </a>
        </div>

      </div>
    </div>
  );
};

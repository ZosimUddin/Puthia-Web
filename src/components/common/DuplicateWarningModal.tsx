import React from 'react';
import { AlertTriangle, Copy, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { DuplicateMatch } from '../../services/duplicateDetector';

interface DuplicateWarningModalProps {
  matches: DuplicateMatch[];
  onProceed: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  matches,
  onProceed,
  onCancel,
  isOpen
}) => {
  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header Icon */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Copy size={24} />
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-full border border-amber-200 inline-block">
              ⚠️ ডুপ্লিকেট তথ্য শনাক্তকরণ সিস্টেম
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              সম্ভবত এই প্রতিষ্ঠানটি ইতোমধ্যে রয়েছে!
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-extrabold leading-relaxed">
          আপনার সাবমিট করা তথ্যটির সাথে আমাদের ডাটাবেজে থাকা বিদ্যমান {matches.length}টি এন্ট্রির মিল পাওয়া গেছে। তথ্য ডুপ্লিকেশন এড়াতে অনুগ্রহ করে নিচের তালিকাটি চেক করুন:
        </p>

        {/* Matches List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {matches.map((match, idx) => (
            <div key={idx} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900">
                  {match.existingItem.title || match.existingItem.name}
                </h4>
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px] font-black">
                  {match.similarityScore}% মিল
                </span>
              </div>

              {match.existingItem.phone && (
                <p className="text-[11px] font-bold text-slate-600">
                  📞 ফোন: {match.existingItem.phone}
                </p>
              )}

              {match.existingItem.location && (
                <p className="text-[11px] font-bold text-slate-600">
                  📍 ঠিকানা: {match.existingItem.location}
                </p>
              )}

              <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-1">
                {match.matchReasons.map((reason, rIdx) => (
                  <span key={rIdx} className="text-[9px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    • {reason}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-colors cursor-pointer text-center"
          >
            বাতিল ও পরিবর্তন করুন
          </button>
          
          <button
            onClick={onProceed}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>তবুও সাবমিট করুন</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

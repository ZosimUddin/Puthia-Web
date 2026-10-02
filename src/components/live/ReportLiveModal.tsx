import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';

interface ReportLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string, details?: string) => Promise<void>;
}

export const ReportLiveModal: React.FC<ReportLiveModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState('Harassment');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    { id: 'Harassment', label: 'হয়রানি বা উসকানি (Harassment / Hate)' },
    { id: 'Violence', label: 'সহিংসতা বা ক্ষতিকারক বিষয়বস্তু (Violence)' },
    { id: 'Spam', label: 'স্প্যাম বা ভুয়া তথ্য (Spam / Fake Info)' },
    { id: 'Scam', label: 'প্রতারণা (Scam / Fraud)' },
    { id: 'Other', label: 'অন্যান্য (Other)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(reason, details);
      alert('আপনার রিপোর্ট গ্রহন করা হয়েছে। অ্যাডমিন টিম দ্রুত খতিয়ে দেখবে।');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm text-white shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-red-400">
            <AlertTriangle size={18} /> রিপোর্ট করুন (Report Live)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">রিপোর্টের কারণ নির্বাচন করুন</label>
            <div className="space-y-1.5">
              {reasons.map(r => (
                <label key={r.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10">
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-emerald-500"
                  />
                  <span className="text-slate-200 font-medium">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">বিস্তারিত (ঐচ্ছিক)</label>
            <textarea
              rows={2}
              placeholder="সংক্ষেপে লিখুন..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-300 hover:text-white cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isSubmitting ? 'প্রসেসিং...' : 'রিপোর্ট পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

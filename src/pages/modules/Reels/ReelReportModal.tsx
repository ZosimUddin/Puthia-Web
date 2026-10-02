import React, { useState } from 'react';
import { X, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Reel } from '../../../types';
import { reelService } from '../../../services/reelService';

interface ReelReportModalProps {
  reel: Reel;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'স্প্যাম বা প্রতারণামূলক প্রচার' },
  { id: 'harassment', label: 'ব্যক্তিগত আক্রমণ বা কটূক্তি' },
  { id: 'inappropriate', label: 'অশালীন বা আপত্তিকর বিষয়বস্তু' },
  { id: 'fake_news', label: 'ভুল বা বিভ্রান্তিকর সংবাদ/তথ্য' },
  { id: 'violence', label: 'সহিংসতা বা ক্ষতিকর আচরণ' },
  { id: 'copyright', label: 'কপিরাইট লঙ্ঘন' },
  { id: 'other', label: 'অন্যান্য কারণ' }
];

export const ReelReportModal: React.FC<ReelReportModalProps> = ({
  reel,
  currentUser,
  isOpen,
  onClose
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await reelService.reportReel({
        reelId: reel.id,
        reporterId: currentUser.uid,
        reason: selectedReason,
        details: details.trim()
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1800);
    } catch (error) {
      console.error("Failed to report reel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Flag size={20} />
            <h3 className="font-extrabold text-base text-white">রিল রিপোর্ট করুন</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle size={44} className="text-emerald-400 mb-3" />
            <h4 className="font-black text-lg text-white">রিপোর্ট জমা দেওয়া হয়েছে</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              আমাদের মডারেশন টিম দ্রুত এটি পর্যালোচনা করবে। আড্ডাকে নিরাপদ রাখতে সহায়তার জন্য ধন্যবাদ।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-300 mb-2">
                রিপোর্টের কারণ নির্বাচন করুন:
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label 
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors ${
                      selectedReason === r.id 
                        ? 'bg-rose-950/40 border-rose-500/50 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="reportReason" 
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="accent-rose-500"
                    />
                    <span className="text-xs font-bold">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 mb-1.5">
                অতিরিক্ত বিবরণ (ঐচ্ছিক):
              </label>
              <textarea 
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="সমস্যার ব্যাপারে বিস্তারিত লিখুন..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500 transition-colors"
                maxLength={200}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-slate-300 rounded-2xl text-xs font-black transition-colors cursor-pointer border-0"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black transition-colors cursor-pointer border-0 shadow-lg shadow-rose-600/30"
              >
                {isSubmitting ? 'জমা হচ্ছে...' : 'রিপোর্ট পাঠান'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Sparkles, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface UnlockPaidContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  creatorName: string;
  priceTk: number;
  onUnlockSuccess: () => void;
}

export const UnlockPaidContentModal: React.FC<UnlockPaidContentModalProps> = ({
  isOpen,
  onClose,
  contentTitle,
  creatorName,
  priceTk,
  onUnlockSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bkash' | 'nagad'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = () => {
    setIsProcessing(true);
    const toastId = toast.loading('কনটেন্ট আনলক করা হচ্ছে...');

    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success(`🎉 সফলভাবে ৳${priceTk} দিয়ে কনটেন্ট আনলক করা হয়েছে!`);
      setIsProcessing(false);
      onUnlockSuccess();
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-[#005a40] via-[#006a4e] to-[#008a64] text-white text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-14 h-14 rounded-full bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>

            <h3 className="text-lg font-extrabold text-white">প্রিমিয়াম কনটেন্ট আনলক করুন</h3>
            <p className="text-xs text-emerald-100 mt-0.5">ক্রিয়েটর এর এক্সক্লুসিভ পোস্ট ও ভিডিও সাপোর্ট করুন</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Content Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                প্রিমিয়াম পোস্ট / ভিডিও
              </span>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">{contentTitle}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ক্রিয়েটর: {creatorName}</p>
            </div>

            {/* Price Badge */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">এককালীন আনলক ফি:</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">৳{priceTk}.০০</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                পেমেন্ট মেথড:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wallet', label: 'আড্ডা ওয়ালেট', sub: 'ব্যালেন্স ৳২৮৫০' },
                  { id: 'bkash', label: 'bKash', sub: 'বিকাশ অ্যাপ' },
                  { id: 'nagad', label: 'Nagad', sub: 'নগদ অ্যাপ' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      paymentMethod === m.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">{m.label}</span>
                    <span className="block text-[10px] opacity-70">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleUnlock}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#006a4e] to-[#008a64] hover:from-[#005a42] text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>৳{priceTk} দিয়ে এখনই আনলক করুন</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

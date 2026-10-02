import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Calendar, Building2, UserCheck, X } from 'lucide-react';

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  verificationBadge?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  adminNote?: string;
}

export const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  verificationBadge = 'অফিসিয়ালি ভেরিফায়েড',
  verifiedDate = '১৫ আগস্ট ২০২৬',
  verifiedBy = 'উপজেলা স্বাস্থ্য বিভাগ ও আমাদের পুঠিয়া অ্যাডমিন টিম',
  adminNote = 'এই সেবা ও ব্যক্তির প্রাতিষ্ঠানিক ডিগ্রি, চেম্বার ঠিকানা ও যোগাযোগের ফোন নম্বরের সত্যতা সরজমিনে এবং কর্তৃপক্ষের মাধ্যমে নিশ্চিত করা হয়েছে।',
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#006a4e] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">যাচাইকরণের বিবরণ</h3>
                <p className="text-xs text-emerald-100 font-medium truncate max-w-[220px]">
                  {title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 text-xs font-bold text-slate-800">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-[#006a4e] shrink-0" />
              <div>
                <span className="text-xs font-black text-[#006a4e] block">{verificationBadge}</span>
                <span className="text-[11px] text-emerald-800 font-medium block">
                  পোর্টালে প্রদর্শিত সকল তথ্য পুঠিয়া পোর্টালে যাচাইকৃত
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-[#006a4e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 text-[10px] block">যাচাইয়ের সময়কাল:</span>
                  <span className="text-slate-800 font-bold">{verifiedDate}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                <Building2 size={16} className="text-[#006a4e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 text-[10px] block">যাচাইকারী কর্তৃপক্ষ:</span>
                  <span className="text-slate-800 font-bold">{verifiedBy}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                <UserCheck size={16} className="text-[#006a4e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 text-[10px] block">অ্যাডমিন নোট:</span>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                    {adminNote}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#006a4e] text-white font-black text-xs rounded-2xl border-none cursor-pointer hover:bg-[#00543e] transition-colors"
            >
              ঠিক আছে
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

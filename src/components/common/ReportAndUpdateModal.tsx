import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, RefreshCw, X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportAndUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'report' | 'update';
  title: string;
}

export const ReportAndUpdateModal: React.FC<ReportAndUpdateModalProps> = ({
  isOpen,
  onClose,
  mode,
  title,
}) => {
  const [reason, setReason] = useState<string>('phone_wrong');
  const [details, setDetails] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const isReport = mode === 'report';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      alert('সঠিক বিবরণ বা সংশোধিত তথ্যটি লিখুন');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleClose = () => {
    setSubmitted(false);
    setDetails('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div
            className={`p-5 text-white flex items-center justify-between ${
              isReport ? 'bg-rose-600' : 'bg-[#006a4e]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl shrink-0">
                {isReport ? <Flag size={20} /> : <RefreshCw size={20} />}
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isReport ? 'ভুল তথ্য রিপোর্ট করুন' : 'তথ্য আপডেটের অনুরোধ'}
                </h3>
                <p className="text-xs opacity-90 font-medium truncate max-w-[200px]">
                  {title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs font-bold text-slate-800">
            {submitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#006a4e] flex items-center justify-center mx-auto text-3xl">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {isReport ? 'রিপোর্ট জমা নেওয়া হয়েছে!' : 'আপডেট অনুরোধ পাঠানো হয়েছে!'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    তথ্যটি পর্যালোচনার জন্য আমাদের টিম ব্যাকএন্ডে বার্তা পাঠিয়েছে। সঠিকতা যাচাই করে অতি দ্রুত হালনাগাদ করা হবে।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 bg-[#006a4e] text-white font-black text-xs rounded-2xl border-none cursor-pointer hover:bg-[#00543e]"
                >
                  বন্ধ করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isReport ? (
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      সমস্যার ধরন নির্বাচন করুন:
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="phone_wrong">মোবাইল নম্বর ভুল বা সংযোগ পাওয়া যাচ্ছে না</option>
                      <option value="address_wrong">চেম্বারের ঠিকানা ভুল বা পরিবর্তিত হয়েছে</option>
                      <option value="time_wrong">রোগী দেখার সময়সূচি ভুল</option>
                      <option value="closed">এই চেম্বারটি বন্ধ বা স্থানান্তরিত হয়েছে</option>
                      <option value="other">অন্যান্য সমস্যা</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      কী তথ্য আপডেট করতে চান?
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                    >
                      <option value="new_phone">নতুন ফোন নম্বর যোগ / পরিবর্তন</option>
                      <option value="new_schedule">নতুন চেম্বার সময়সূচি আপডেট</option>
                      <option value="new_degree">শিক্ষাগত যোগ্যতা / ডিগ্রি যুক্তকরণ</option>
                      <option value="new_fee">ভিজিট ফি হালনাগাদ</option>
                      <option value="new_chamber">নতুন চেম্বার যোগকরণ</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    {isReport ? 'বিস্তারিত রিপোর্ট / বিবরণ' : 'সঠিক বা নতুন তথ্যের বিবরণ'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={
                      isReport
                        ? 'সঠিক তথ্যটি জানা থাকলে লিখুন (যেমন: নতুন ফোন নম্বর ০১৭...)'
                        : 'যেমন: নতুন সময়সূচি শনি-বৃহস্পতি বিকাল ৫টা থেকে রাত ৯টা...'
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    আপনার মোবাইল নম্বর (ঐচ্ছিক - যোগাযোগের জন্য)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="017........"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-white font-black text-xs rounded-2xl border-none cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50 ${
                    isReport ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#006a4e] hover:bg-[#00543e]'
                  }`}
                >
                  {loading ? 'জমা দেওয়া হচ্ছে...' : isReport ? 'রিপোর্ট সাবমিট করুন' : 'আপডেট অনুরোধ পাঠান'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

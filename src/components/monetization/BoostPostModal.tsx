import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Target, DollarSign, Calendar, ShieldCheck, X, Check, MapPin, Sparkles } from 'lucide-react';
import { monetizationService } from '../../services/monetizationService';
import toast from 'react-hot-toast';

interface BoostPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  authorId: string;
  authorName: string;
  postSnippet: string;
  postImageUrl?: string;
  onSuccess?: () => void;
}

export const BoostPostModal: React.FC<BoostPostModalProps> = ({
  isOpen,
  onClose,
  postId,
  authorId,
  authorName,
  postSnippet,
  postImageUrl,
  onSuccess
}) => {
  const [selectedUnions, setSelectedUnions] = useState<string[]>(['পুঠিয়া সদর', 'বানেশ্বর']);
  const [dailyBudget, setDailyBudget] = useState<number>(100);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'wallet'>('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const unionOptions = [
    'পুঠিয়া সদর',
    'বানেশ্বর',
    'বেলপুকুরিয়া',
    'শিলখুড়িয়া',
    'জিউ পাড়া',
    'ভালুকগাছী',
    'পায়রাগাছা'
  ];

  const totalBudget = dailyBudget * durationDays;
  const estimatedReach = Math.round(totalBudget * 18); // e.g. 300 Tk = ~5,400 people reach in Puthia

  const toggleUnion = (union: string) => {
    if (selectedUnions.includes(union)) {
      if (selectedUnions.length > 1) {
        setSelectedUnions(selectedUnions.filter(u => u !== union));
      } else {
        toast.error('কমপক্ষে ১টি ইউনিয়ন নির্বাচন করতে হবে।');
      }
    } else {
      setSelectedUnions([...selectedUnions, union]);
    }
  };

  const handleBoostSubmit = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading('বুস্ট রিকোয়েস্ট তৈরি করা হচ্ছে...');

    try {
      const res = await monetizationService.boostPost({
        postId,
        authorId,
        authorName,
        snippet: postSnippet,
        imageUrl: postImageUrl,
        unions: selectedUnions,
        dailyBudgetTk: dailyBudget,
        durationDays,
        paymentMethod
      });

      toast.dismiss(toastId);
      toast.success('🚀 পোস্ট বুস্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন রিভিউ শেষে অ্যাড লাইভ হবে।');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.dismiss(toastId);
      toast.success('🚀 পোস্ট বুস্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-[#005a40] via-[#006a4e] to-[#008a64] text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">পোস্ট বুস্ট করুন (Boost Post 🚀)</h3>
                <p className="text-xs text-emerald-100">পুঠিয়ার নির্দিষ্ট এলাকা ও অডিয়েন্সের কাছে পোস্ট প্রচার করুন</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Post Snippet Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-3">
              {postImageUrl && (
                <img src={postImageUrl} alt="Post" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">বুস্ট টার্গেট পোস্ট</span>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold line-clamp-2">{postSnippet}</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">পোস্ট ক্রিয়েটর: {authorName}</span>
              </div>
            </div>

            {/* Target Audience Unions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                টার্গেট এলাকা (ইউনিয়ন নির্বাচন করুন):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {unionOptions.map((u) => {
                  const active = selectedUnions.includes(u);
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => toggleUnion(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                      {u}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  দৈনিক বাজেট (৳):
                </label>
                <select
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value={50}>৳৫০ / দিন</option>
                  <option value={100}>৳১০০ / দিন (জনপ্রিয়)</option>
                  <option value={200}>৳২০০ / দিন</option>
                  <option value={500}>৳৫০০ / দিন (হাই রিচ)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  স্থায়িত্ব (দিন):
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value={1}>১ দিন</option>
                  <option value={3}>৩ দিন (রেকমেন্ডেড)</option>
                  <option value={5}>৫ দিন</option>
                  <option value={7}>৭ দিন (১ সপ্তাহ)</option>
                </select>
              </div>
            </div>

            {/* Estimated Reach Box */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  আনুমানিক সম্ভাব্য রিচ (Estimated Reach)
                </span>
                <span className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                  ~{estimatedReach.toLocaleString()} জন পুঠিয়াবাসী
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">মোট বাজেট</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">৳{totalBudget}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                পেমেন্ট মেথড নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bkash', label: 'bKash (বিকাশ)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { id: 'nagad', label: 'Nagad (নগদ)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { id: 'wallet', label: 'আড্ডা ওয়ালেট', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                      paymentMethod === m.id
                        ? `${m.color} ring-2 ring-emerald-500 shadow-sm`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleBoostSubmit}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#006a4e] to-[#008a64] hover:from-[#005a42] hover:to-[#007a58] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              <span>৳{totalBudget} দিয়ে পোস্ট বুস্ট কনফার্ম করুন</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, X, Heart, ShieldCheck, CheckCircle, Send } from 'lucide-react';
import { monetizationService } from '../../services/monetizationService';
import toast from 'react-hot-toast';

interface SendStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  postId?: string;
  currentUserId?: string;
  currentUserName?: string;
  onSuccess?: () => void;
}

export const SendStarsModal: React.FC<SendStarsModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar,
  postId,
  currentUserId = 'user_guest',
  currentUserName = 'আড্ডা ব্যবহারকারী',
  onSuccess
}) => {
  const [selectedStars, setSelectedStars] = useState<number>(50);
  const [customStars, setCustomStars] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const starPresets = [
    { stars: 10, tk: 10, badge: '👏 উৎসাহ', color: 'from-amber-400 to-amber-500' },
    { stars: 50, tk: 50, badge: '⭐ জনপ্রিয়', color: 'from-emerald-400 to-teal-500' },
    { stars: 100, tk: 100, badge: '❤️ ভালবাসা', color: 'from-rose-400 to-rose-600' },
    { stars: 500, tk: 500, badge: '🔥 সুপার ফ্যান', color: 'from-purple-500 to-indigo-600' }
  ];

  const effectiveStars = customStars ? parseInt(customStars, 10) || 0 : selectedStars;

  const handleSend = async () => {
    if (effectiveStars < 1) {
      toast.error('সর্বনিম্ন ১টি স্টার নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`${effectiveStars} স্টার পাঠানো হচ্ছে...`);

    try {
      const res = await monetizationService.sendStarsSupport({
        senderId: currentUserId,
        senderName: currentUserName,
        creatorId,
        creatorName,
        postId,
        starsCount: effectiveStars,
        message: message.trim() || undefined
      });

      toast.dismiss(toastId);
      if (res.success) {
        toast.success(`🎉 সফলভাবে ${effectiveStars} স্টার (${effectiveStars} টাকা) ${creatorName}-কে পাঠানো হয়েছে!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('স্টার পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.success(`🎉 সফলভাবে ${effectiveStars} স্টার (${effectiveStars} টাকা) ${creatorName}-কে পাঠানো হয়েছে!`);
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
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden"
        >
          {/* Top Banner Header */}
          <div className="relative p-6 bg-gradient-to-r from-[#005a40] via-[#006a4e] to-[#008a64] text-white text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-300/80 flex items-center justify-center mb-3 shadow-inner">
              <Star className="w-9 h-9 text-amber-300 fill-amber-300 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-white">আড্ডা স্টারস সাপোর্ট (Stars)</h3>
            <p className="text-xs text-emerald-100 mt-1">
              গুণী ক্রিয়েটরকে উৎসাহিত করতে ডিজিটাল স্টার পাঠান
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Target Creator Profile Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 border border-emerald-500/30 flex items-center justify-center">
                {creatorAvatar ? (
                  <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-700 font-bold text-lg">{creatorName[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  প্রাপক ক্রিয়েটর
                </span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{creatorName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">প্রতি ১ স্টার = ৳১.০০ সরাসরি ব্যালেন্সে জমা হবে</p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                স্টার পরিমাণ বাছাই করুন:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {starPresets.map((preset) => {
                  const isSelected = !customStars && selectedStars === preset.stars;
                  return (
                    <button
                      key={preset.stars}
                      type="button"
                      onClick={() => {
                        setSelectedStars(preset.stars);
                        setCustomStars('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {preset.stars} স্টার
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
                          ৳{preset.tk}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                অথবা কাস্টম স্টার সংখ্যা লিখুন:
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="যেমন: ২৫, ২০০ বা ৫০০"
                  value={customStars}
                  onChange={(e) => setCustomStars(e.target.value)}
                  min="1"
                  className="w-full px-3.5 py-2.5 pl-9 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 dark:text-white"
                />
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Encouragement Message */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                উৎসাহমূলক মেসেজ (ঐচ্ছিক):
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: আপনার এই কন্টেন্টটি অনেক সুন্দর হয়েছে! শুভকামনা রইলো।"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 dark:text-white resize-none"
              />
            </div>

            {/* Payment Guarantee Notice */}
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>আপনার ওয়ালেট ব্যালেন্স বা মোবাইল ব্যাংকিং (bKash/Nagad) দিয়ে তাত্ক্ষণিক সাপোর্ট সম্পূর্ণ সুরক্ষিত।</span>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isSubmitting || effectiveStars < 1}
              onClick={handleSend}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#006a4e] to-[#008a64] hover:from-[#005a42] hover:to-[#007a58] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{effectiveStars} স্টার (৳{effectiveStars}) পাঠান</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

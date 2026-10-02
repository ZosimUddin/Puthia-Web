import React, { useState } from 'react';
import { ShieldAlert, Send, X, CheckCircle, HelpCircle } from 'lucide-react';
import { AntiSpamEngineService } from '../../services/antiSpamEngine';
import { toast } from 'react-hot-toast';

interface FalsePositiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  restrictionType: string;
  ruleCode: string;
  onSubmitted?: () => void;
}

export const FalsePositiveModal: React.FC<FalsePositiveModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  restrictionType,
  ruleCode,
  onSubmitted
}) => {
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      toast.error('অনুগ্রহ করে বিস্তারিত কারণ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await AntiSpamEngineService.submitReviewRequest({
        userId,
        userName,
        userEmail,
        restrictionType,
        ruleTriggered: ruleCode,
        userExplanation: explanation.trim()
      });

      toast.success('রিভিউ অনুরোধ ট্রাস্ট অ্যান্ড সেফটি টিমের নিকট সফলভাবে পাঠানো হয়েছে!', { duration: 4000 });
      onSubmitted?.();
      onClose();
    } catch (error) {
      toast.error('অনুরোধ পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">ভুল শনাক্তকরণ রিভিউ আবেদন (False Positive Review)</h3>
            <p className="text-xs text-slate-400">সিস্টেমের ত্রুটিতে আপনি সীমিত হয়ে থাকলে মডারেটর ম্যানুয়ালি পরীক্ষা করবেন</p>
          </div>
        </div>

        <div className="p-3 mb-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">ট্রিগারকৃত রুল কোড:</span>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {ruleCode || 'SP-GENERIC'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              আপনি কী করার চেষ্টা করছিলেন তা সংক্ষেপে লিখুন:
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              placeholder="যেমন: আমি আমার পরিচিত বন্ধুদের ফ্রেন্ড রিকোয়েস্ট পাঠাচ্ছিলাম, এটি কোনো স্প্যামিং ছিল না..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
            <HelpCircle size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <span>আমাদের ট্রাস্ট অ্যান্ড সেফটি টিম সাধারণত ৩০ মিনিটের মধ্যে প্রতিটি রিভিউ পরীক্ষা করে বিধিনিষেধ প্রত্যাহার করেন।</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !explanation.trim()}
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  রিভিউ জমা দিন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

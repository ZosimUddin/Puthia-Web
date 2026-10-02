import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Share2, Copy, Check, Sparkles, ChevronRight } from 'lucide-react';
import { referralService, UserReferralCode } from '../../services/referralService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReferralInviteCardProps {
  compact?: boolean;
}

export const ReferralInviteCard: React.FC<ReferralInviteCardProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [refData, setRefData] = useState<UserReferralCode | null>(null);
  const [copied, setCopied] = useState(false);

  const userId = user?.uid || 'guest';
  const userName = userProfile?.name || user?.displayName || 'আড্ডা ইউজার';

  useEffect(() => {
    referralService.getOrCreateReferralCode(userId, userName).then(setRefData);
  }, [userId]);

  const shareUrl = `${window.location.origin}/register?ref=${refData?.code || 'ADDA2026'}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('রেফারেল লিঙ্ক কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <div 
        onClick={() => navigate('/referral')}
        className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-white">🎁 বন্ধুদের নিয়ে আসুন, রিওয়ার্ড পান</h4>
            <p className="text-[10px] text-emerald-100 font-medium">প্রতি রেফারেলে ৳১০ ক্যাশ বোনাস</p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden space-y-4 border border-emerald-500/30">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Gift className="w-32 h-32 text-white" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider inline-block">
            🎁 রেফারেল অ্যান্ড গ্রোথ
          </span>
          <h3 className="text-base font-black text-white mt-1">বন্ধুদের আড্ডায় ইনভাইট করুন</h3>
          <p className="text-xs text-emerald-100/90 mt-0.5">
            আপনার রেফারেল কোড দিয়ে বন্ধুদের সাইন-আপ করিয়ে রিওয়ার্ড ক্যাশ উপার্জন করুন!
          </p>
        </div>

        <button
          onClick={() => navigate('/referral')}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0 transition"
        >
          বিস্তারিত
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
        <div className="flex-1 px-2">
          <span className="text-[10px] text-slate-400 font-mono block">রেফারেল কোড:</span>
          <span className="text-sm font-black text-amber-300 font-mono tracking-wider">{refData?.code || 'ADDA2026'}</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'কপি' : 'কপি লিঙ্ক'}</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Sparkles, 
  Trophy, 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  ChevronRight, 
  Users, 
  Zap, 
  ArrowRight,
  Flame,
  Award,
  Coins,
  CheckCircle2,
  X
} from 'lucide-react';
import { referralService, ReferralCampaign, UserReferralCode } from '../../services/referralService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ReferralCampaignBannerProps {
  campaign?: ReferralCampaign | null;
  variant?: 'hero' | 'compact' | 'card';
  showUserProgress?: boolean;
  className?: string;
  onActionClick?: () => void;
}

export const ReferralCampaignBanner: React.FC<ReferralCampaignBannerProps> = ({
  campaign: propCampaign,
  variant = 'hero',
  showUserProgress = true,
  className = '',
  onActionClick
}) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [activeCampaign, setActiveCampaign] = useState<ReferralCampaign | null>(propCampaign || null);
  const [userCode, setUserCode] = useState<UserReferralCode | null>(null);
  const [loading, setLoading] = useState(!propCampaign);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Load campaign and user code if needed
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (!propCampaign) {
          const camp = await referralService.getActiveCampaign();
          if (isMounted) setActiveCampaign(camp);
        } else {
          setActiveCampaign(propCampaign);
        }

        if (user?.uid) {
          const codeObj = await referralService.getOrCreateReferralCode(
            user.uid, 
            userProfile?.name || user.displayName || 'আড্ডা ইউজার'
          );
          if (isMounted) setUserCode(codeObj);
        }
      } catch (err) {
        console.warn('Error fetching campaign banner data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [propCampaign, user?.uid, userProfile?.name]);

  // Timer countdown hook
  useEffect(() => {
    if (!activeCampaign?.endDate) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, activeCampaign.endDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCampaign?.endDate]);

  const code = userCode?.code || 'ADDA2026';
  const shareUrl = `${window.location.origin}/register?ref=${code}`;
  const campaignTitle = activeCampaign?.title || '🎉 ঈদ স্পেশাল রেফারেল মেগা ক্যাম্পেইন';
  const shareText = `👋 আসসালামু আলাইকুম! পুঠিয়ার ডিজিটাল কমিউনিটি অ্যাপ 'আড্ডা'-তে যোগ দিয়ে মেগা বোনাস জিতুন! আমার রেফারেল কোড: ${code}। আজই যোগ দিন: ${shareUrl}`;

  const handleCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('🎉 রেফারেল লিঙ্ক কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaignTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleShareWhatsApp = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleBannerClick = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      navigate('/referral');
    }
  };

  if (loading) {
    return (
      <div className={`w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 animate-pulse rounded-2xl h-44 my-4 shadow-lg ${className}`} />
    );
  }

  const rewardAmount = activeCampaign?.rewardPerReferralTk || 15;
  const welcomeCoins = activeCampaign?.welcomeRewardCoins || 15;
  const badgeTitle = activeCampaign?.badgeTitle || '🌟 রেফারেল স্টার';

  // Compact variant for secondary positions or inline listings
  if (variant === 'compact') {
    return (
      <div 
        onClick={handleBannerClick}
        className={`relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 shadow-md hover:shadow-xl transition-all border border-emerald-500/30 group ${className}`}
      >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-slate-900 font-extrabold shadow-md shrink-0 animate-bounce">
              <Gift className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-yellow-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  মেগা ক্যাম্পেইন
                </span>
                <span className="text-xs text-yellow-200 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeLeft.days} দিন বাকি
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{campaignTitle}</h4>
              <p className="text-xs text-emerald-100 font-medium">প্রতি রেফারেলে ৳{rewardAmount} ক্যাশব্যাক + {welcomeCoins} কয়েন!</p>
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleBannerClick(); }}
            className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            অংশ নিন <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Hero Variant (Default - High Impact Visuals)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl border border-yellow-400/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white ${className}`}
    >
      {/* Decorative festive background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-yellow-400/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Subtle festive pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-7 md:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left Column: Text & Hero Badges */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          
          {/* Top Pill Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              মেগা রেফারেল ধামাকা
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {badgeTitle}
            </span>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/40 text-yellow-300 border border-yellow-500/30 backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow" />
              <span>
                {timeLeft.days}দ : {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}ঘ : {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}মি : {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}সে
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm flex items-center gap-2 flex-wrap">
              {campaignTitle}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1.5 leading-relaxed max-w-2xl">
              {activeCampaign?.description || 'পুঠিয়ার সকল নাগরিককে আড্ডায় ইনভাইট করুন। প্রতি সফল যোগদানে পান তাৎক্ষণিক নগদ বোনাস ও আকর্ষণীয় পুরস্কার!'}
            </p>
          </div>

          {/* Offer Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            <div className="bg-emerald-900/60 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shrink-0 font-extrabold text-sm">
                ৳{rewardAmount}
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 font-semibold uppercase block">নগদ বোনাস</span>
                <span className="text-xs font-extrabold text-white">প্রতি রেফারেলে ৳{rewardAmount}</span>
              </div>
            </div>

            <div className="bg-emerald-900/60 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 font-extrabold text-sm">
                <Coins className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 font-semibold uppercase block">বোনাস কয়েন</span>
                <span className="text-xs font-extrabold text-white">+{welcomeCoins} রিওয়ার্ড কয়েন</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-emerald-900/60 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Trophy className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-200 font-semibold uppercase block">লিডারবোর্ড</span>
                <span className="text-xs font-extrabold text-white">স্পেশাল চ্যাম্পিয়ন ট্রফি</span>
              </div>
            </div>
          </div>

          {/* User Logged-in Referral Progress Bar */}
          {user && showUserProgress && userCode && (
            <div className="bg-black/30 border border-emerald-500/30 rounded-2xl p-3 backdrop-blur-md space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-200 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-yellow-400" /> আপনার বর্তমান রেফারেল সংখ্যা:
                </span>
                <span className="font-extrabold text-yellow-300">
                  {userCode.totalVerified || 0} জন সফল
                </span>
              </div>
              <div className="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-800">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((userCode.totalVerified || 0) / 5) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-300 text-right font-medium">
                {(userCode.totalVerified || 0) >= 5 ? '🎉 অভিনন্দন! আপনি মেগা মাইলস্টোন ব্যাজ অর্জন করেছেন!' : `আরেকটি বিশেষ ব্যাজ পেতে আর ${5 - Math.min(5, (userCode.totalVerified || 0))} জন দরকার`}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: CTA Actions & Quick Code Copy Box */}
        <div className="flex flex-col sm:flex-row lg:flex-col justify-center items-stretch gap-3 shrink-0 lg:w-72 border-t lg:border-t-0 lg:border-l border-emerald-700/50 pt-4 lg:pt-0 lg:pl-6">
          
          {/* Quick Code Display Box */}
          <div className="bg-black/40 border border-yellow-400/40 rounded-2xl p-3 text-center backdrop-blur-md">
            <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
              আপনার রেফারেল কোড
            </span>
            <div className="text-lg font-black text-yellow-300 tracking-wider my-1 bg-emerald-950/80 py-1.5 px-3 rounded-xl border border-yellow-400/20 flex items-center justify-center gap-2">
              <span>{code}</span>
              <button 
                onClick={handleCopy}
                className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 transition-colors"
                title="কপি করুন"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-400" />}
              </button>
            </div>
            <p className="text-[10px] text-emerald-300">বন্ধুকে সাইনআপের সময় কোডটি টাইপ করতে বলুন</p>
          </div>

          {/* Direct Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-200" /> হোয়াটসঅ্যাপ
            </button>

            <button
              onClick={handleCopy}
              className="bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600/50 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-400" />}
              {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
            </button>
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleBannerClick}
            className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-sm shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>রেফারেল ড্যাশবোর্ডে যান</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>

      {/* Share Modal Drawer for browsers without Native Share */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-emerald-950 border border-emerald-700 rounded-3xl max-w-md w-full p-6 text-white relative shadow-2xl"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-emerald-900 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 mx-auto flex items-center justify-center">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">বন্ধুদের ইনভাইট শেয়ার করুন</h3>
                <p className="text-xs text-emerald-200">নিচের লিংক কপি করুন অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ পাঠান</p>
                
                <div className="bg-slate-900 border border-emerald-800 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs font-mono text-yellow-300">
                  <span className="truncate">{shareUrl}</span>
                  <button 
                    onClick={handleCopy}
                    className="shrink-0 bg-yellow-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    {copied ? 'কপি হয়েছে' : 'কপি'}
                  </button>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2"
                  >
                    হোয়াটসঅ্যাপে পাঠান
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReferralCampaignBanner;

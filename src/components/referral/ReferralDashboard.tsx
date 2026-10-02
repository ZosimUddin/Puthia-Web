import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Gift, Award, Share2, Copy, Check, Sparkles, AlertCircle, 
  Clock, ShieldCheck, Trophy, ChevronRight, MessageSquare, PhoneCall, ExternalLink, RefreshCw, Send, DollarSign, FileText, CheckCircle2, Facebook, Info, HelpCircle, Smartphone
} from 'lucide-react';
import { 
  referralService, 
  UserReferralCode, 
  ReferralRecord, 
  ReferralLeaderboardEntry, 
  ReferralCampaign,
  ReferralMilestone,
  ReferralLedgerEntry
} from '../../services/referralService';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../home/Header';
import Footer from '../home/Footer';
import BottomNavigation from '../home/BottomNavigation';
import { Sidebar } from '../Sidebar';
import { ReferralCampaignBanner } from './ReferralCampaignBanner';
import { LottieSuccessModal } from '../common/LottieSuccessModal';
import toast from 'react-hot-toast';

export const ReferralDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'recharges' | 'milestones' | 'ledger' | 'leaderboard' | 'campaigns'>('overview');

  const [refCodeData, setRefCodeData] = useState<UserReferralCode | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [campaign, setCampaign] = useState<ReferralCampaign | null>(null);
  const [milestones, setMilestones] = useState<ReferralMilestone[]>([]);
  const [ledger, setLedger] = useState<ReferralLedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [showHowToShare, setShowHowToShare] = useState<boolean>(false);

  // Reward Tasks & Recharge Claiming states
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    likeFollowStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    postShareStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
    referralStatus: 'not_submitted' | 'approved';
    verifiedReferralsCount: number;
    likeFollowReason?: string;
    postShareReason?: string;
    likeFollowScreenshotUrl?: string;
    postShareScreenshotUrl?: string;
  } | null>(null);
  const [rechargeRequests, setRechargeRequests] = useState<any[]>([]);
  const [rechargeMobile, setRechargeMobile] = useState('');
  const [rechargeOperator, setRechargeOperator] = useState('Grameenphone');
  const [uploadingTask, setUploadingTask] = useState<'like_follow' | 'post_share' | null>(null);
  const [submittingRecharge, setSubmittingRecharge] = useState(false);

  // Lottie Success Celebration Modal State
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type: 'recharge' | 'withdrawal';
    amount: number;
    recipient: string;
    methodOrOperator: string;
    trackingId?: string;
    notes?: string;
  } | null>(null);

  const userId = user?.uid || 'guest_user';
  const userName = userProfile?.name || user?.displayName || 'আড্ডা ইউজার';

  const shareUrl = `${window.location.origin}/register?ref=${refCodeData?.code || 'ADDA2026'}`;
  const shareText = `👋 আসসালামু আলাইকুম! পুঠিয়ার স্থানীয় খবরাখবর, সার্ভিস ও সামাজিক যোগাযোগের অ্যাপ 'আড্ডা'-তে যোগ দিন। আমার রেফারেল কোড: ${refCodeData?.code || 'ADDA2026'} ব্যবহার করে ফ্রি বোনাস পান! ডাউনলোড করুন: ${shareUrl}`;

  const loadData = async () => {
    setLoading(true);
    try {
      const [codeObj, historyList, leaderList, activeCamp, ledgerList, eligStatus, rechargeList] = await Promise.all([
        referralService.getOrCreateReferralCode(userId, userName),
        referralService.getUserReferralHistory(userId),
        referralService.getReferralLeaderboard(),
        referralService.getActiveCampaign(),
        referralService.getReferralLedger(userId),
        referralService.checkUserTasksEligibility(userId),
        referralService.getUserRechargeRequests(userId)
      ]);
      setRefCodeData(codeObj);
      setReferrals(historyList);
      setLeaderboard(leaderList);
      setCampaign(activeCamp);
      setLedger(ledgerList);
      setEligibility(eligStatus);
      setRechargeRequests(rechargeList);

      const verifiedCount = codeObj.totalVerified || historyList.filter(r => r.status === 'verified' || r.status === 'rewarded').length || 0;
      setMilestones(referralService.getMilestonesForUser(verifiedCount));
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('🎉 রেফারেল লিঙ্ক কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCodeData?.code || 'ADDA2026');
    setCopiedCode(true);
    toast.success('🔑 রেফারেল কোড কপি হয়েছে!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCompleteMessage = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedMessage(true);
    toast.success('📝 ইনভাইটেশন মেসেজ কপি হয়েছে!');
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>, taskType: 'like_follow' | 'post_share') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate file size and type
    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি বা স্ক্রিনশট আপলোড করা যাবে।');
      return;
    }

    setUploadingTask(taskType);
    try {
      let downloadUrl = '';
      
      try {
        // 1. Try Firebase Storage with a strict 2-second timeout to prevent getting stuck
        const { uploadMediaFile } = await import('../../services/firebaseStorageService');
        const uploadPromise = uploadMediaFile(file, {
          category: 'documents',
          ownerId: userId,
          subFolder: `reward_tasks/${taskType}`,
          maxSizeMB: 3,
          compressImageBeforeUpload: true,
          imageQuality: 0.7
        }).then(res => res.downloadUrl)
          .catch(storageErr => {
            console.warn('Firebase Storage internal upload failed gracefully (handled silently):', storageErr);
            throw storageErr; // Rethrow to let race/catch block trigger the base64 fallback
          });

        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 2000)
        );

        downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      } catch (err) {
        console.warn('Firebase Storage upload failed/timed out, using local high-reliability fallback:', err);
        // Instant base64 fallback with canvas compression to keep it extremely lightweight (approx. 10-30KB)
        downloadUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const rawBase64 = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const MAX_WIDTH = 640;
              const MAX_HEIGHT = 480;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
              resolve(compressedBase64);
            };
            img.onerror = () => resolve(rawBase64); // Fallback to raw if canvas fails
            img.src = rawBase64;
          };
          reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে'));
          reader.readAsDataURL(file);
        });
      }

      // 3. Submit to Firestore via referralService
      const phone = userProfile?.phone || user?.phoneNumber || '';
      const submitRes = await referralService.submitTaskScreenshot(
        userId,
        userName,
        phone,
        taskType,
        downloadUrl
      );

      if (submitRes.success) {
        toast.success(submitRes.message);
        // Refresh eligibility
        const nextEligibility = await referralService.checkUserTasksEligibility(userId);
        setEligibility(nextEligibility);
      } else {
        toast.error(submitRes.message);
      }
    } catch (err: any) {
      console.error('Error uploading task screenshot:', err);
      toast.error(err?.message || 'স্ক্রিনশট আপলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setUploadingTask(null);
    }
  };

  const handleClaimRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeMobile) {
      toast.error('অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    setSubmittingRecharge(true);
    try {
      const res = await referralService.claimMobileRecharge(
        userId,
        userName,
        rechargeMobile,
        rechargeOperator
      );

      if (res.success) {
        setSuccessModalData({
          isOpen: true,
          title: '🎉 মোবাইল রিচার্জ আবেদন সফল হয়েছে!',
          subtitle: 'রেফারেল ও টাস্ক কমপ্লিট বোনাস হিসেবে আপনার রিচার্জ আবেদনটি গ্রহণ করা হয়েছে।',
          type: 'recharge',
          amount: 20,
          recipient: rechargeMobile,
          methodOrOperator: rechargeOperator,
          trackingId: res.requestId ? `REF-${res.requestId.slice(-6).toUpperCase()}` : undefined,
          notes: 'আমাদের টিম ভেরিফিকেশন সম্পন্ন করে দ্রুত আপনার সিমে ২০ টাকা রিচার্জ পাঠিয়ে দেবে।'
        });
        setRechargeMobile('');
        // Refresh eligibility and requests
        const [nextElig, nextRequests] = await Promise.all([
          referralService.checkUserTasksEligibility(userId),
          referralService.getUserRechargeRequests(userId)
        ]);
        setEligibility(nextElig);
        setRechargeRequests(nextRequests);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      console.error('Error claiming recharge:', err);
      toast.error(err?.message || 'মোবাইল রিচার্জ ক্লেইম করতে সমস্যা হয়েছে।');
    } finally {
      setSubmittingRecharge(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'আড্ডা - পুঠিয়া ডিজিটাল কমিউনিটি',
          text: shareText,
          url: shareUrl,
        });
        toast.success('🎉 সফলভাবে শেয়ার করা হয়েছে!');
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    toast.success('💬 WhatsApp-এ শেয়ার লিঙ্ক পাঠানো হচ্ছে...');
  };

  const handleShareMessenger = () => {
    const url = `https://www.facebook.com/dialog/send?app_id=1217983452011707&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(shareUrl)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    toast.success('⚡ Messenger-এ শেয়ার লিঙ্ক পাঠানো হচ্ছে...');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    toast.success('🔵 Facebook-এ শেয়ার করা হচ্ছে...');
  };

  const handleShareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
    toast.success('✉️ SMS-এর মাধ্যমে শেয়ার করা হচ্ছে...');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] dark:bg-[#001D14] text-slate-900 dark:text-emerald-50 flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#004d36] via-[#006a4e] to-[#008a64] text-white pt-8 pb-14 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30 flex items-center gap-1">
                  🎁 বন্ধু ইনভাইট করুন ও বোনাস ইনকাম করুন
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                আড্ডা রেফারেল ও ইনভাইট প্রোগ্রাম 🚀
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                আপনার বন্ধুদের আড্ডায় নিয়ে আসুন। প্রতি ভেরিফাইড নতুন বন্ধু যুক্ত হলেই ওয়ালেটে ক্যাশ রিওয়ার্ড ও কয়েন যোগ হবে!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                রিফ্রেশ
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                ওয়ালেট ব্যালেন্স দেখুন
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-6">
          {/* Navigation Tabs Bar */}
          <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-1.5 shadow-lg border border-slate-200 dark:border-emerald-800/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: '🎁 ইনভাইট ও ড্যাশবোর্ড', icon: Gift },
              { id: 'history', label: '📜 ইনভাইটের ইতিহাস', icon: Clock },
              { id: 'recharges', label: '📱 রিচার্জের ইতিহাস', icon: Smartphone },
              { id: 'milestones', label: '🏅 মাইলস্টোন ও ব্যাজ', icon: Award },
              { id: 'ledger', label: '🧾 ইস্টার ও ক্যাশ লেজার', icon: FileText },
              { id: 'leaderboard', label: '🏆 সেরা রেফারার (Leaderboard)', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-[#003825]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & INVITE CARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Unique Referral Link & Code Box */}
              <div className="bg-white dark:bg-[#002a1c] rounded-3xl p-6 border border-emerald-500/20 shadow-xl space-y-5">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-emerald-50 flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-emerald-600" />
                      <span>আপনার নিজস্ব রেফারেল কোড ও লিঙ্ক</span>
                      <button
                        onClick={() => setShowHowToShare(!showHowToShare)}
                        className="p-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-[#003825] transition cursor-pointer"
                        title="কিভাবে শেয়ার করবেন জানুন"
                      >
                        <HelpCircle className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      </button>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
                      এই লিঙ্ক বা কোড দিয়ে বন্ধু রেজিস্ট্রেশন করলেই আপনার একাউন্টে রিওয়ার্ড রিভিনিউ যোগ হবে
                    </p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    title="রেফারেল কোড কপি করতে ক্লিক করুন"
                    className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#003825] dark:hover:bg-[#004d36] border border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>কোড:</span>
                    <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono font-black tracking-wider">{refCodeData?.code || 'ADDA2026'}</span>
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> : <Copy className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>

                {showHowToShare && (
                  <div className="p-4 bg-emerald-50 dark:bg-[#003d29]/40 rounded-2xl border border-emerald-100 dark:border-[#004d36]/50 space-y-3 transition-all">
                    <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-600" />
                      <span>কিভাবে সফলভাবে ও সহজে রেফার করবেন?</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-emerald-200">
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">১. মেসেজ বাটন ব্যবহার করুন</span>
                        <p>নিচে থাকা "রেডিমেড ইনভাইটেশন মেসেজ" কপি করে সরাসরি WhatsApp বা Messenger-এ বন্ধুদের ইনবক্স বা গ্রুপে পাঠান।</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">২. ফেসবুক গ্রুপে কমেন্ট করুন</span>
                        <p>আপনার উপজেলার বা স্থানীয় বিভিন্ন সামাজিক ফেসবুক গ্রুপ ও কমেন্ট সেকশনে আপনার রেফারেল লিংকটি শেয়ার করুন।</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">৩. অ্যাপের সুবিধাগুলো বলুন</span>
                        <p>বন্ধুদের বলুন আমাদের পুঠিয়া ডিজিটাল অ্যাপের চমৎকার উপজেলা নাগরিক সেবা, ই-ডিরেক্টরি ও আড্ডার সব দারুণ সুবিধার কথা।</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Copy Link Input */}
                <div className="p-2 bg-slate-50 dark:bg-[#003825] rounded-2xl border border-slate-200 dark:border-emerald-800/30 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-700 dark:text-emerald-50 outline-none select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-white font-black text-xs shadow transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      copied 
                        ? 'bg-emerald-500 scale-105 ring-4 ring-emerald-500/30' 
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02]'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-100 animate-pulse" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}</span>
                  </button>
                </div>

                {/* Ready-made Full Invite Message Box */}
                <div className="p-4 bg-emerald-50/40 dark:bg-[#003825]/30 rounded-2xl border border-emerald-100/60 dark:border-[#004d36]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
                      <span>📝 রেডিমেড ইনভাইটেশন মেসেজ</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      রেফারেল কোড ও লিঙ্কসহ সুন্দর একটি প্রফেশনাল মেসেজ কপি করে শেয়ার করতে পারেন।
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCompleteMessage}
                    className={`px-3 py-2 rounded-xl font-extrabold text-xs shadow-2xs hover:shadow-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer sm:shrink-0 ${
                      copiedMessage 
                        ? 'bg-emerald-200 dark:bg-[#004d36] text-emerald-900 dark:text-emerald-100 scale-105 ring-4 ring-emerald-500/20' 
                        : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-[#003825] dark:hover:bg-[#004d36] text-emerald-800 dark:text-emerald-200'
                    }`}
                  >
                    {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMessage ? 'মেসেজ কপি হয়েছে' : 'মেসেজ কপি করুন'}</span>
                  </button>
                </div>

                 {/* Instant Share Social Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-emerald-300 block">সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={handleShareMessenger}
                      className="p-2.5 rounded-xl bg-[#00B2FF] hover:bg-[#009ed4] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Messenger</span>
                    </button>
                    <button
                      onClick={handleShareFacebook}
                      className="p-2.5 rounded-xl bg-[#1877F2] hover:bg-[#1565d8] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={handleShareSMS}
                      className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>SMS</span>
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>অন্যান্য শেয়ার</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* REWARD TASKS SECTION */}
              <div className="bg-white dark:bg-[#002a1c] rounded-3xl p-6 border border-amber-500/30 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 font-extrabold text-sm">🎁</span>
                    <h2 className="text-lg font-black text-slate-800 dark:text-emerald-50">
                      আপনার ৳২০ মোবাইল রিচার্জ পেতে ২টি কাজ সম্পন্ন করুন
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-1">
                    নিচের দুটি কাজ সফলভাবে সম্পন্ন করার পর আপনি সম্পূর্ণ ফ্রিতে যেকোনো নম্বরে ২০ টাকা রিচার্জ ব্যালেন্স ক্লেইম করতে পারবেন।
                  </p>
                </div>

                <div className="space-y-4">
                  {/* TASK 1: Like & Follow Facebook Page */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-[#003825]/40 rounded-2xl border border-emerald-100/40 dark:border-emerald-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">১</span>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-emerald-50">আমাদের পুঠিয়া Facebook Page লাইক ও ফলো করুন</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-emerald-300 pl-7">
                        আমাদের অফিসিয়াল ফেসবুক পেজে লাইক ও ফলো দিয়ে একটি স্ক্রিনশট নিচে আপলোড করুন।
                      </p>
                      {eligibility?.likeFollowScreenshotUrl && (
                        <div className="mt-2 pl-7 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">📷 আপলোডকৃত স্ক্রিনশট প্রিভিউ:</span>
                          <div className="relative rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800/40 max-w-[110px] bg-white dark:bg-[#003825]/60 shadow-xs hover:opacity-90 transition cursor-pointer">
                            <img 
                              src={eligibility.likeFollowScreenshotUrl} 
                              alt="Uploaded Proof" 
                              className="w-full h-auto object-cover max-h-[140px]" 
                              referrerPolicy="no-referrer"
                              onClick={() => window.open(eligibility.likeFollowScreenshotUrl, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {eligibility?.likeFollowReason && eligibility.likeFollowStatus === 'rejected' && (
                        <p className="text-xs text-rose-500 font-bold pl-7 mt-1">
                          ❌ রিজেক্টের কারণ: {eligibility.likeFollowReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center pl-7 md:pl-0">
                      <a 
                        href="https://facebook.com/OurPuthia" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        পেজ খুলুন
                      </a>

                      {eligibility?.likeFollowStatus !== 'approved' && (
                        <label className="relative px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-[#004d36] dark:hover:bg-[#005c40] text-emerald-900 dark:text-emerald-100 font-extrabold text-xs transition cursor-pointer shrink-0">
                          {uploadingTask === 'like_follow' ? 'আপলোড হচ্ছে...' : 'স্ক্রিনশট দিন'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleUploadScreenshot(e, 'like_follow')}
                            disabled={uploadingTask !== null}
                          />
                        </label>
                      )}

                      {eligibility?.likeFollowStatus === 'pending' && (
                        <span className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0 flex items-center gap-1">
                          ⏳ রিভিউ পেন্ডিং
                        </span>
                      )}

                      {eligibility?.likeFollowStatus === 'approved' && (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1">
                          ✅ অনুমোদিত
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TASK 2: Share Page Post */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-[#003825]/40 rounded-2xl border border-emerald-100/40 dark:border-emerald-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">২</span>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-emerald-50">আমাদের পুঠিয়া ফেসবুক পেজের যেকোনো পোস্ট শেয়ার করুন</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-emerald-300 pl-7">
                        যেকোনো একটি পোস্ট পাবলিকলি শেয়ার করে আপনার টাইমলাইন থেকে স্ক্রিনশট নিচে আপলোড করুন।
                      </p>
                      {eligibility?.postShareScreenshotUrl && (
                        <div className="mt-2 pl-7 flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">📷 আপলোডকৃত স্ক্রিনশট প্রিভিউ:</span>
                          <div className="relative rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800/40 max-w-[110px] bg-white dark:bg-[#003825]/60 shadow-xs hover:opacity-90 transition cursor-pointer">
                            <img 
                              src={eligibility.postShareScreenshotUrl} 
                              alt="Uploaded Proof" 
                              className="w-full h-auto object-cover max-h-[140px]" 
                              referrerPolicy="no-referrer"
                              onClick={() => window.open(eligibility.postShareScreenshotUrl, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      {eligibility?.postShareReason && eligibility.postShareStatus === 'rejected' && (
                        <p className="text-xs text-rose-500 font-bold pl-7 mt-1">
                          ❌ রিজেক্টের কারণ: {eligibility.postShareReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center pl-7 md:pl-0">
                      <a 
                        href="https://facebook.com/OurPuthia/posts" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        পোস্ট দেখুন
                      </a>

                      {eligibility?.postShareStatus !== 'approved' && (
                        <label className="relative px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-[#004d36] dark:hover:bg-[#005c40] text-emerald-900 dark:text-emerald-100 font-extrabold text-xs transition cursor-pointer shrink-0">
                          {uploadingTask === 'post_share' ? 'আপলোড হচ্ছে...' : 'স্ক্রিনশট দিন'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleUploadScreenshot(e, 'post_share')}
                            disabled={uploadingTask !== null}
                          />
                        </label>
                      )}

                      {eligibility?.postShareStatus === 'pending' && (
                        <span className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0 flex items-center gap-1">
                          ⏳ রিভিউ পেন্ডিং
                        </span>
                      )}

                      {eligibility?.postShareStatus === 'approved' && (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1">
                          ✅ অনুমোদিত
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ELIGIBILITY & RECHARGE CLAIM SYSTEM */}
                <div className="space-y-4">
                  {rechargeRequests.length > 0 ? (
                    <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-2 border-emerald-500 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <div>
                          <h3 className="font-black text-sm text-emerald-800 dark:text-emerald-300">
                            📱 আপনার ক্লেইম রিকোয়েস্টের অবস্থা:
                          </h3>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#002a1c] rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
                        {rechargeRequests.map(req => (
                          <div key={req.id} className="text-xs space-y-3 pt-2 first:pt-0">
                            {/* Special User Notification for Completed Recharge */}
                            {req.status === 'successful' && (
                              <div className="p-3 bg-emerald-50 dark:bg-[#004d36]/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-xl font-extrabold text-xs animate-bounce">
                                🎉 অভিনন্দন! আপনার ৳২০ মোবাইল রিচার্জ সফলভাবে দেওয়া হয়েছে।
                              </div>
                            )}

                            {req.status === 'failed' && (
                              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-xl font-bold text-xs">
                                ❌ দুঃখিত! আপনার রিচার্জ অনুরোধটি সফল হয়নি। কারণ: {req.rejectionReason || 'প্রদত্ত তথ্য সঠিক নয়।'}
                              </div>
                            )}

                            <div className="flex justify-between font-bold text-slate-800 dark:text-emerald-100 border-b border-slate-100 dark:border-[#003825] pb-2">
                              <span>মোবাইল: {req.mobileNumber} ({req.operator})</span>
                              <span>৳{req.amount}</span>
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-450 dark:text-emerald-400/60">তারিখ: {new Date(req.createdAt).toLocaleString('bn-BD')}</span>
                              <div className="flex items-center gap-1">
                                {req.status === 'processing' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-extrabold flex items-center gap-1">
                                    🕐 Recharge Request Pending
                                  </span>
                                )}
                                {req.status === 'successful' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold">
                                    ✅ Recharge Completed
                                  </span>
                                )}
                                {req.status === 'failed' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 font-extrabold">
                                    ❌ রিচার্জ বাতিল করা হয়েছে
                                  </span>
                                )}
                              </div>
                            </div>
                            {req.transactionId && (
                              <p className="text-[11px] text-slate-400 dark:text-emerald-400/50 font-mono">TRX ID: {req.transactionId}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Check if both tasks are submitted/uploaded */
                    eligibility?.likeFollowScreenshotUrl && eligibility?.postShareScreenshotUrl ? (
                      <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-2 border-emerald-500 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                          <div>
                            <h3 className="font-black text-sm text-emerald-800 dark:text-emerald-300">
                              🎉 অভিনন্দন! আপনি ২টি কাজই সম্পন্ন করে স্ক্রিনশট আপলোড করেছেন!
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                              আপনার ফ্রিতে ২০ টাকা মোবাইল রিচার্জ ক্লেইম করতে নিচের ফরমটি পূরণ করে সব তথ্য একসাথে সাবমিট করুন।
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleClaimRecharge} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-slate-500 dark:text-emerald-300 block">📱 মোবাইল নম্বর (১১ ডিজিট):</label>
                            <input 
                              type="text" 
                              placeholder="017XXXXXXXX"
                              value={rechargeMobile}
                              onChange={(e) => setRechargeMobile(e.target.value)}
                              maxLength={11}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#003825] border border-slate-300 dark:border-emerald-800/30 outline-none focus:border-emerald-500 font-mono text-sm font-bold text-slate-800 dark:text-emerald-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-slate-500 dark:text-emerald-300 block">অপারেটর নির্বাচন করুন:</label>
                            <select 
                              value={rechargeOperator}
                              onChange={(e) => setRechargeOperator(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#003825] border border-slate-300 dark:border-emerald-800/30 outline-none focus:border-emerald-500 text-sm font-bold text-slate-800 dark:text-emerald-100 animate-none"
                            >
                              <option value="Grameenphone">Grameenphone</option>
                              <option value="Robi">Robi</option>
                              <option value="Airtel">Airtel</option>
                              <option value="Banglalink">Banglalink</option>
                              <option value="Teletalk">Teletalk</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <button 
                              type="submit"
                              disabled={submittingRecharge}
                              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {submittingRecharge ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : 'সব তথ্য একসাথে Submit করুন 🚀'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-2.5 text-xs">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-extrabold text-amber-800 dark:text-amber-400 block">আপনি এখনো রিওয়ার্ডের ক্লেইম ফরমটি পাননি</span>
                          <p className="text-slate-600 dark:text-emerald-300 mt-0.5">
                            মোবাইল রিচার্জ ব্যালেন্স ক্লেইম করার জন্য প্রথমে উপরের দুটি কাজের স্ক্রিনশট আপলোড করুন। স্ক্রিনশট আপলোড করার সাথে সাথে আপনার রিচার্জ নম্বর দেওয়ার এই ফরমটি সচল হবে।
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Statistics Overview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-4 bg-white dark:bg-[#002a1c] rounded-2xl border border-slate-200 dark:border-emerald-800/20 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-emerald-300/70 uppercase tracking-wider block">👥 মোট Invited</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-emerald-50 mt-1 block">{refCodeData?.totalInvited || referrals.length || 0} জন</span>
                  <span className="text-[10px] text-slate-400 dark:text-emerald-400/50 block">রেজিস্ট্রেশনকৃত</span>
                </div>

                <div className="p-4 bg-white dark:bg-[#002a1c] rounded-2xl border border-slate-200 dark:border-emerald-800/20 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">✅ Verified</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{refCodeData?.totalVerified || referrals.filter(r=>r.status==='verified'||r.status==='rewarded').length || 0} জন</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block">অ্যাক্টিভিটি সম্পন্ন</span>
                </div>

                <div className="p-4 bg-white dark:bg-[#002a1c] rounded-2xl border border-slate-200 dark:border-emerald-800/20 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">🎁 Rewarded</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{refCodeData?.totalRewarded || referrals.filter(r=>r.status==='rewarded').length || 0} জন</span>
                  <span className="text-[10px] text-slate-400 dark:text-emerald-400/50 block">রিওয়ার্ড প্রদানকৃত</span>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#005a40] to-[#007a58] rounded-2xl text-white shadow-md">
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">💰 মোট Reward</span>
                  <span className="text-2xl font-black text-white mt-1 block">৳{refCodeData?.totalEarnedTk || 0}</span>
                  <span className="text-[10px] text-emerald-100 block">ওয়ালেটে জমা</span>
                </div>

                <div className="p-4 bg-white dark:bg-[#002a1c] rounded-2xl border border-slate-200 dark:border-emerald-800/20 shadow-sm">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">⏳ Pending</span>
                  <span className="text-2xl font-black text-indigo-500 mt-1 block">{referrals.filter(r=>r.status==='pending'||r.status==='suspicious').length || 0} টি</span>
                  <span className="text-[10px] text-slate-400 dark:text-emerald-400/50 block">রিভিউ ও ভেরিফিকেশনে</span>
                </div>
              </div>

              {/* Fraud Prevention & Reward Flow Rules Box */}
              <div className="p-5 bg-emerald-50/60 dark:bg-[#003825]/30 border border-emerald-200 dark:border-emerald-800/40 rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-200">
                    🛡️ কিভাবে রেফারেল রিওয়ার্ড ওয়ালেটে জমা হয়? (Fraud Prevention Rules)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 bg-white dark:bg-[#002e1f] rounded-xl border border-emerald-100/40 dark:border-emerald-800/20">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">১. রেফারেল লিঙ্ক ব্যবহার</span>
                    <p className="text-slate-500 dark:text-emerald-300/80 mt-0.5">বন্ধু আপনার লিঙ্ক দিয়ে অ্যাপে সাইন আপ করবে।</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#002e1f] rounded-xl border border-emerald-100/40 dark:border-emerald-800/20">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">২. একাউন্ট ভেরিফিকেশন</span>
                    <p className="text-slate-500 dark:text-emerald-300/80 mt-0.5">ফোন নম্বর ভেরিফাই ও নাম-ছবি প্রোফাইল সেট করা।</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#002e1f] rounded-xl border border-emerald-100/40 dark:border-emerald-800/20">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">৩. মিনিমাম অ্যাক্টিভিটি</span>
                    <p className="text-slate-500 dark:text-emerald-300/80 mt-0.5">কমপক্ষে ১টি সাধারণ পোস্ট বা কমেন্ট করা।</p>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#002e1f] rounded-xl border border-emerald-100/40 dark:border-emerald-800/20">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block">৪. ওয়ালেটে ক্যাশ প্রদান</span>
                    <p className="text-slate-500 dark:text-emerald-300/80 mt-0.5">ফ্রড চেকে পাস হলেই সাথে সাথে রিওয়ার্ড ওয়ালেটে জমা।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REFERRAL HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-6 border border-slate-200 dark:border-emerald-800/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-emerald-50 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  আমন্ত্রিত বন্ধুদের তালিকা ও স্টেটাস (Referral History)
                </h3>
                <span className="text-xs text-slate-400 dark:text-emerald-300/60 font-bold">মোট: {referrals.length} জন</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-emerald-800/20">
                {referrals.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-sm">
                        {item.refereeName.substring(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.refereeName}</span>
                        <span className="text-[10px] text-slate-400 block">
                          রেজিস্টার্ড: {new Date(item.registeredAt).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">৳{item.rewardAmountTk}</span>
                        <span className="text-[10px] text-slate-400 block">+{item.welcomeRewardCoins} Coins</span>
                      </div>

                      {item.status === 'rewarded' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300/30">
                          🎁 Rewarded
                        </span>
                      )}
                      {item.status === 'verified' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                          🟢 Verified
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                          🟡 Pending
                        </span>
                      )}
                      {item.status === 'suspicious' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-extrabold text-[10px]">
                          🚨 Review
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RECHARGE HISTORY */}
          {activeTab === 'recharges' && (
            <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-6 border border-slate-200 dark:border-emerald-800/20 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-emerald-800/20">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-emerald-50 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    📱 মোবাইল রিচার্জের ইতিহাস (Mobile Recharge History)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/60 mt-0.5">আপনার সকল ২০ টাকা রিচার্জ পুরস্কারের লাইভ আপডেট ও ইতিহাস</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-emerald-800/20">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>সর্বশেষ আপডেট: {new Date().toLocaleTimeString('bn-BD')}</span>
                </div>
              </div>

              {/* Recharge Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-emerald-950/20 rounded-xl border border-slate-100 dark:border-emerald-800/10 text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">মোট অনুরোধ</span>
                  <span className="text-lg font-black text-slate-800 dark:text-emerald-100 block mt-1">{rechargeRequests.length} টি</span>
                </div>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl border border-amber-100/55 dark:border-amber-900/10 text-center">
                  <span className="text-[10px] uppercase font-black text-amber-600/70 block">পেন্ডিং</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block mt-1">
                    {rechargeRequests.filter(r => r.status === 'processing').length} টি
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/55 dark:border-emerald-900/10 text-center">
                  <span className="text-[10px] uppercase font-black text-emerald-600/70 block">সফল রিচার্জ</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                    {rechargeRequests.filter(r => r.status === 'successful').length} টি
                  </span>
                </div>
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100/55 dark:border-rose-900/10 text-center">
                  <span className="text-[10px] uppercase font-black text-rose-500/70 block">বাতিলকৃত</span>
                  <span className="text-lg font-black text-rose-500 dark:text-rose-400 block mt-1">
                    {rechargeRequests.filter(r => r.status === 'failed').length} টি
                  </span>
                </div>
              </div>

              {/* Recharge List */}
              {rechargeRequests.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-755 dark:text-slate-200 text-sm">কোনো রিচার্জ হিস্ট্রি পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-500 dark:text-emerald-300/60 mt-1">
                      মোবাইল রিচার্জ বোনাস দাবি করতে প্রথমে ড্যাশবোর্ড ট্যাব থেকে পেজ লাইক ও পোস্ট শেয়ার করে স্ক্রিনশট আপলোড করুন!
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow cursor-pointer inline-block animate-none"
                  >
                    কাজগুলো সম্পন্ন করুন 🚀
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rechargeRequests.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-white dark:bg-[#002f1f]/50 rounded-xl border border-slate-100 dark:border-emerald-800/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md"
                    >
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 dark:text-emerald-100 text-sm select-all">📱 {item.mobileNumber}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#003825] text-slate-600 dark:text-emerald-300 text-[10px] font-black">
                            {item.operator}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-emerald-400/60 text-[11px]">
                          <span>৳{item.amount} রিচার্জ ক্লেইম</span>
                          <span>•</span>
                          <span>অনুরোধের সময়: {new Date(item.createdAt).toLocaleString('bn-BD')}</span>
                        </div>
                        
                        {/* Screenshots Uploaded Proof References */}
                        {(item.likeFollowScreenshotUrl || item.postShareScreenshotUrl) && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400 font-bold">আপলোড করা প্রমাণ:</span>
                            {item.likeFollowScreenshotUrl && (
                              <a 
                                href={item.likeFollowScreenshotUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] text-emerald-600 hover:underline font-extrabold flex items-center gap-0.5"
                              >
                                কাজ ১ 🔗
                              </a>
                            )}
                            {item.postShareScreenshotUrl && (
                              <a 
                                href={item.postShareScreenshotUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] text-emerald-600 hover:underline font-extrabold flex items-center gap-0.5"
                              >
                                কাজ ২ 🔗
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Request Status Column */}
                      <div className="flex flex-col sm:items-end justify-center gap-1.5 shrink-0">
                        {item.status === 'processing' && (
                          <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-black flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            ⏳ পেন্ডিং (Pending)
                          </span>
                        )}
                        {item.status === 'successful' && (
                          <div className="text-left sm:text-right space-y-1">
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs font-black inline-flex items-center gap-1">
                              ✅ রিচার্জ সম্পন্ন
                            </span>
                            {item.transactionId && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Trx ID: <span className="font-bold select-all">{item.transactionId}</span>
                              </p>
                            )}
                          </div>
                        )}
                        {item.status === 'failed' && (
                          <div className="text-left sm:text-right space-y-1 max-w-[250px]">
                            <span className="px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 text-xs font-black inline-flex items-center gap-1">
                              ❌ অনুরোধ বাতিল
                            </span>
                            <p className="text-[10px] text-rose-500 font-bold leading-relaxed">
                              কারণ: {item.rejectionReason || 'প্রদত্ত তথ্য সঠিক নয়।'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MILESTONES & BADGES */}
          {activeTab === 'milestones' && (
            <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-6 border border-slate-200 dark:border-emerald-800/20 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-emerald-50 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  🏅 রেফারেল মাইলস্টোন ও সম্মাননা ব্যাজ (Milestones & Badges)
                </h3>
                <p className="text-xs text-slate-500">বন্ধু ইনভাইট পূর্ণ করে অর্জন করুন বিশেষ ব্যাজ ও বোনাস ইস্টার</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                      m.isUnlocked
                        ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-50/50 dark:bg-[#003825]/40 border-emerald-100 dark:border-emerald-800/20 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-2xl shrink-0">
                        {m.badgeIcon}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-emerald-50">{m.title}</h4>
                          {m.isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Unlocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#004d36] text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                              {m.countRequired} জন বাকি
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-emerald-300">{m.description}</p>
                        <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                          <span>বোনাস: +{m.bonusPoints} Points</span>
                          <span>ব্যাজ: {m.badgeName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REFERRAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-6 border border-slate-200 dark:border-emerald-800/20 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-emerald-50 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  🧾 রেফারেল ইস্টার ও রিওয়ার্ড লেজর (Separate Referral Ledger)
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300">আপনার সমস্ত রেফারেল ইস্টার ও ক্রিয়েটর আর্নিং স্বতন্ত্রভাবে ট্র্যাক করা হয়</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-emerald-800/20">
                {ledger.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-emerald-50 block">{item.description}</span>
                      <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 block">{new Date(item.createdAt).toLocaleString('bn-BD')}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                        +{item.stars} ইস্টার {item.rewardTk > 0 ? `(৳${item.rewardTk})` : ''}
                      </span>
                      <span className={`text-[10px] font-bold ${item.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {item.status === 'approved' ? '✅ Approved' : '🟡 Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white dark:bg-[#002a1c] rounded-2xl p-6 border border-slate-200 dark:border-emerald-800/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-emerald-50 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    চলতি মাসের সেরা রেফারার (Monthly Leaderboard)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/80">সবচেয়ে বেশি ভেরিফাইড বন্ধু যুক্তকারী আড্ডাবাসীদের তালিকা</p>
                </div>
              </div>

              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition ${
                      entry.rank === 1
                        ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                        : entry.rank === 2
                        ? 'bg-emerald-50/50 dark:bg-[#003825]/40 border-emerald-100 dark:border-emerald-800/20'
                        : entry.rank === 3
                        ? 'bg-amber-900/10 border-amber-800/30'
                        : 'bg-white dark:bg-[#002e1f] border-slate-200 dark:border-emerald-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        entry.rank === 1 ? 'bg-amber-400 text-slate-950 shadow' :
                        entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-emerald-100 dark:bg-[#003825] text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </div>

                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-emerald-50 text-sm block">{entry.userName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 block">ভেরিফাইড রেফারেল: {entry.totalVerified} জন</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">৳{entry.totalEarnedTk}</span>
                      <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 block">মোট উপার্জিত</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </main>

      {/* Lottie Success Animation Modal */}
      {successModalData && (
        <LottieSuccessModal
          isOpen={successModalData.isOpen}
          onClose={() => setSuccessModalData(null)}
          title={successModalData.title}
          subtitle={successModalData.subtitle}
          type={successModalData.type}
          amount={successModalData.amount}
          recipient={successModalData.recipient}
          methodOrOperator={successModalData.methodOrOperator}
          trackingId={successModalData.trackingId}
          notes={successModalData.notes}
          onViewHistory={() => setActiveTab('recharges')}
        />
      )}

      <Footer />
      <BottomNavigation activeTab="profile" onTabChange={() => {}} />
    </div>
  );
};

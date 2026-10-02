import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wallet, Star, History, Smartphone, CheckCircle2, 
  Clock, XCircle, ChevronRight, Info, Gift, PlusCircle, AlertCircle, 
  Check, FileText, Users, Sparkles, ExternalLink, RefreshCw, X,
  CreditCard, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { 
  collection, query, where, onSnapshot, addDoc, doc, getDoc
} from 'firebase/firestore';
import { SERVICES_CONFIG } from '../../config/servicesConfig';
import { monetizationService, WithdrawalRequest } from '../../services/monetizationService';
import { LottieSuccessModal } from '../common/LottieSuccessModal';
import Header from '../home/Header';
import Footer from '../home/Footer';
import BottomNavigation from '../home/BottomNavigation';
import { Sidebar } from '../Sidebar';
import toast from 'react-hot-toast';

export interface WalletTransaction {
  id: string;
  type: 'contribution' | 'referral' | 'recharge' | 'withdrawal' | 'other';
  title: string;
  subTitle: string;
  stars: number; // positive or negative
  amountTk: number;
  dateTimeStr: string;
  rawDate: number;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Processing' | 'Completed' | 'paid' | 'pending' | 'rejected';
  category: 'income' | 'expense' | 'reward' | 'recharge' | 'withdrawal';
}

export interface RechargeItem {
  id: string;
  mobileNumber: string;
  operator: string;
  amount: number;
  status: 'Processing' | 'Completed' | 'Rejected';
  requestDateStr: string;
  rawDate: number;
  trxId?: string;
  rejectReason?: string;
}

/**
 * Smooth number count-up animation hook
 */
function useCountUp(target: number, duration: number = 1000): number {
  const [count, setCount] = useState<number>(0);
  const prevTargetRef = useRef<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = prevTargetRef.current;
    const difference = target - startVal;

    if (difference === 0) {
      setCount(target);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Smooth deceleration curve: easeOutCubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + difference * easeOut);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevTargetRef.current = target;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return count;
}

export const CreatorMonetizationHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const transactionSectionRef = useRef<HTMLDivElement>(null);

  // Real-time submissions states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState<boolean>(true);

  // Real-time recharge requests
  const [rechargeList, setRechargeList] = useState<RechargeItem[]>([]);

  // Real-time creator withdrawal requests
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);

  // Filter state for Section 6 (Transaction History)
  const [trxFilter, setTrxFilter] = useState<'all' | 'income' | 'expense' | 'reward' | 'recharge' | 'withdrawal'>('all');

  // Mobile Recharge Modal State
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [rechargePhone, setRechargePhone] = useState<string>(userProfile?.phone || '');
  const [rechargeOperator, setRechargeOperator] = useState<string>('Grameenphone');
  const [rechargeAmount, setRechargeAmount] = useState<number>(20);
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState<boolean>(false);

  // Cash / Mobile Banking Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState<string>(userProfile?.phone || '');
  const [withdrawBankDetails, setWithdrawBankDetails] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState<boolean>(false);

  // Lottie Success Celebration Modal State
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type: 'recharge' | 'withdrawal';
    amount: number;
    recipient: string;
    methodOrOperator: string;
    bankName?: string;
    trackingId?: string;
    notes?: string;
  } | null>(null);

  const userId = user?.uid || 'guest_user';
  const userName = userProfile?.name || user?.displayName || 'নাগরিক';

  // 1. Fetch live Submissions across all services
  useEffect(() => {
    if (!user) {
      setLoadingSubs(false);
      return;
    }

    setLoadingSubs(true);
    const unsubs: (() => void)[] = [];
    const serviceKeys = Object.keys(SERVICES_CONFIG);
    const submissionsMap: Record<string, any[]> = {};

    serviceKeys.forEach((key) => {
      const cfg = SERVICES_CONFIG[key];
      const colName = cfg.collectionName;
      try {
        const q = query(collection(db, colName), where('userId', '==', user.uid));
        const unsub = onSnapshot(
          q,
          (snap) => {
            const list: any[] = [];
            snap.forEach((docSnap) => {
              list.push({
                id: docSnap.id,
                _col: colName,
                _serviceTitle: cfg.title,
                ...docSnap.data()
              });
            });
            submissionsMap[colName] = list;

            const allSubs = Object.values(submissionsMap).flat();
            allSubs.sort((a, b) => {
              const tA = new Date(a.createdAt || a.date || 0).getTime();
              const tB = new Date(b.createdAt || b.date || 0).getTime();
              return tB - tA;
            });
            setSubmissions(allSubs);
            setLoadingSubs(false);
          },
          () => setLoadingSubs(false)
        );
        unsubs.push(unsub);
      } catch (err) {
        console.warn(err);
      }
    });

    // 2. Fetch live Recharge Requests for this user
    try {
      const qRecharge = query(collection(db, 'recharge_requests'), where('userId', '==', user.uid));
      const unsubRecharge = onSnapshot(qRecharge, (snap) => {
        const items: RechargeItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const d = data.createdAt ? new Date(data.createdAt) : new Date();
          const formatted = d.toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) + ' • ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

          let st: 'Processing' | 'Completed' | 'Rejected' = 'Processing';
          if (data.status === 'successful' || data.status === 'Completed') {
            st = 'Completed';
          } else if (data.status === 'failed' || data.status === 'Rejected') {
            st = 'Rejected';
          }

          items.push({
            id: docSnap.id,
            mobileNumber: data.mobileNumber || '01XXXXXXXXX',
            operator: data.operator || 'Grameenphone',
            amount: data.amount || 20,
            status: st,
            requestDateStr: formatted,
            rawDate: d.getTime(),
            trxId: data.trxId,
            rejectReason: data.rejectReason
          });
        });
        items.sort((a, b) => b.rawDate - a.rawDate);
        setRechargeList(items);
      });
      unsubs.push(unsubRecharge);
    } catch (e) {
      console.warn(e);
    }

    // 3. Fetch live Cash / Mobile Banking Withdrawals for this user
    try {
      const qWithdraw = query(collection(db, 'withdrawals'), where('userId', '==', user.uid));
      const unsubWithdraw = onSnapshot(qWithdraw, (snap) => {
        const items: WithdrawalRequest[] = [];
        snap.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRequest);
        });
        items.sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
        setWithdrawalsList(items);
      });
      unsubs.push(unsubWithdraw);
    } catch (e) {
      console.warn(e);
    }

    return () => {
      unsubs.forEach(u => u());
    };
  }, [user]);

  // Section 9 stats calculation
  const totalSubmissionsCount = submissions.length;
  const approvedSubmissions = useMemo(() => {
    return submissions.filter(s => s.status === 'Approved' || s.isVerified === true);
  }, [submissions]);
  const approvedSubmissionsCount = approvedSubmissions.length;
  
  const pendingSubmissionsCount = useMemo(() => {
    return submissions.filter(s => s.status === 'Pending' || (!s.status && !s.isVerified)).length;
  }, [submissions]);

  const rejectedSubmissionsCount = useMemo(() => {
    return submissions.filter(s => s.status === 'Rejected').length;
  }, [submissions]);

  // Stars & Balances:
  // Admin approved contribution = 5 stars each.
  // Profile stars baseline guarantee (e.g. 20)
  const storedUserStars = userProfile?.stars ?? userProfile?.points ?? 0;
  const contributionStars = useMemo(() => {
    const fromApproved = approvedSubmissionsCount * 5;
    return Math.max(fromApproved, storedUserStars > 0 ? storedUserStars : 0);
  }, [approvedSubmissionsCount, storedUserStars]);

  // Referral Reward
  const referralRewardStars = (userProfile as any)?.referralStars || 0;
  // Other Approved Reward
  const otherRewardStars = (userProfile as any)?.bonusStars || 0;

  // Total Earned
  const totalEarnedStars = contributionStars + referralRewardStars + otherRewardStars;

  // Total Used (Mobile recharge + Cash withdrawals completed or processing)
  const totalUsedStars = useMemo(() => {
    const rechargeSum = rechargeList
      .filter(r => r.status === 'Completed' || r.status === 'Processing')
      .reduce((sum, r) => sum + r.amount, 0);

    const withdrawalSum = withdrawalsList
      .filter(w => w.status === 'paid' || w.status === 'pending')
      .reduce((sum, w) => sum + (w.amountTk || 0), 0);

    return rechargeSum + withdrawalSum;
  }, [rechargeList, withdrawalsList]);

  // Available Balance (ব্যবহারযোগ্য ব্যালেন্স)
  const availableStars = Math.max(0, totalEarnedStars - totalUsedStars);
  const availableBalanceTk = availableStars; // 1 ইস্টার = ৳১
  const totalRewardStars = totalEarnedStars;

  // Smooth number-counting animation for Total Wallet Balance
  const animatedBalanceTk = useCountUp(availableBalanceTk, 1000);
  const animatedStars = useCountUp(availableStars, 1000);

  // Section 6: Unified Transaction History items
  const transactions: WalletTransaction[] = useMemo(() => {
    const list: WalletTransaction[] = [];

    // From approved submissions
    approvedSubmissions.forEach((sub, i) => {
      const d = sub.createdAt ? new Date(sub.createdAt) : new Date(Date.now() - (i + 1) * 86400000);
      const dateFormatted = d.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' • ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

      list.push({
        id: sub.id || `sub-${i}`,
        type: 'contribution',
        title: '⭐ Contribution Reward',
        subTitle: 'সঠিক তথ্য অনুমোদিত',
        stars: 5,
        amountTk: 5,
        dateTimeStr: dateFormatted,
        rawDate: d.getTime(),
        status: 'Approved',
        category: 'income'
      });
    });

    // If profile has baseline stars (e.g. 20) but no individual items in sandbox
    if (list.length === 0 && storedUserStars > 0) {
      const count = Math.ceil(storedUserStars / 5);
      for (let i = 0; i < count; i++) {
        const d = new Date(Date.now() - i * 86400000 * 1.5);
        list.push({
          id: `seed-contrib-${i}`,
          type: 'contribution',
          title: '⭐ Contribution Reward',
          subTitle: 'সঠিক তথ্য অনুমোদিত',
          stars: 5,
          amountTk: 5,
          dateTimeStr: d.toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) + ' • ১০:৩০ AM',
          rawDate: d.getTime(),
          status: 'Approved',
          category: 'income'
        });
      }
    }

    // Referral transactions
    if (referralRewardStars > 0) {
      const dRef = new Date(Date.now() - 86400000);
      list.push({
        id: 'ref-tx-1',
        type: 'referral',
        title: '🎁 Referral Reward',
        subTitle: 'Referral সফল',
        stars: referralRewardStars,
        amountTk: referralRewardStars,
        dateTimeStr: dRef.toLocaleDateString('bn-BD', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) + ' • ০৮:১৫ PM',
        rawDate: dRef.getTime(),
        status: 'Approved',
        category: 'reward'
      });
    }

    // Mobile recharge transactions
    rechargeList.forEach((rc) => {
      list.push({
        id: `rc-tx-${rc.id}`,
        type: 'recharge',
        title: '📱 Mobile Recharge',
        subTitle: `৳${rc.amount} রিচার্জ (${rc.mobileNumber})`,
        stars: -rc.amount,
        amountTk: -rc.amount,
        dateTimeStr: rc.requestDateStr,
        rawDate: rc.rawDate,
        status: rc.status,
        category: 'recharge'
      });
    });

    // Cash / Mobile Banking withdrawal transactions
    withdrawalsList.forEach((w) => {
      const d = new Date(w.requestedAt || Date.now());
      const dateFormatted = d.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' • ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

      const methodLabel = w.method === 'bkash' ? 'bKash' : w.method === 'nagad' ? 'Nagad' : w.method === 'rocket' ? 'Rocket' : 'Bank Transfer';
      list.push({
        id: `w-tx-${w.id}`,
        type: 'withdrawal',
        title: `💳 টাকা উত্তোলন (${methodLabel})`,
        subTitle: `${w.accountNo || w.accountNumber || 'Bank A/C'} • ৳${w.amountTk}${w.transactionRef ? ` (TRX: ${w.transactionRef})` : ''}`,
        stars: -w.amountTk,
        amountTk: -w.amountTk,
        dateTimeStr: dateFormatted,
        rawDate: d.getTime(),
        status: w.status === 'paid' ? 'Completed' : w.status === 'rejected' ? 'Rejected' : 'Processing',
        category: 'withdrawal'
      });
    });

    // Sort by latest
    list.sort((a, b) => b.rawDate - a.rawDate);
    return list;
  }, [approvedSubmissions, storedUserStars, referralRewardStars, rechargeList, withdrawalsList]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (trxFilter === 'all') return transactions;
    if (trxFilter === 'income') return transactions.filter(t => t.stars > 0);
    if (trxFilter === 'expense') return transactions.filter(t => t.stars < 0);
    if (trxFilter === 'reward') return transactions.filter(t => t.type === 'contribution' || t.type === 'referral' || t.type === 'other');
    if (trxFilter === 'recharge') return transactions.filter(t => t.type === 'recharge');
    if (trxFilter === 'withdrawal') return transactions.filter(t => t.type === 'withdrawal');
    return transactions;
  }, [transactions, trxFilter]);

  // Handle Mobile Recharge Submit
  const handleRequestRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = rechargePhone.trim().replace(/[^0-9]/g, '');

    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      toast.error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    if (availableBalanceTk < rechargeAmount) {
      toast.error(`আপনার ব্যবহারযোগ্য ব্যালেন্স অপর্যাপ্ত! বর্তমান ব্যালেন্স ৳${availableBalanceTk}, প্রয়োজনীয় ৳${rechargeAmount}`);
      return;
    }

    setIsSubmittingRecharge(true);
    try {
      const docRef = await addDoc(collection(db, 'recharge_requests'), {
        userId,
        userName,
        mobileNumber: cleanPhone,
        operator: rechargeOperator,
        amount: rechargeAmount,
        status: 'processing', // Admin sees processing
        adminVerification: 'যাচাই প্রক্রিয়াধীন (Processing)',
        createdAt: Date.now(),
        type: 'citizen_wallet_recharge',
        source: 'wallet_balance_page'
      });

      setIsRechargeModalOpen(false);
      setSuccessModalData({
        isOpen: true,
        title: '🎉 মোবাইল রিচার্জের আবেদন সফল হয়েছে!',
        subtitle: 'আপনার ওয়ালেট থেকে ২০ ইস্টার কর্তন করে রিচার্জ অনুরোধ জমা রাখা হয়েছে।',
        type: 'recharge',
        amount: rechargeAmount,
        recipient: cleanPhone,
        methodOrOperator: rechargeOperator,
        trackingId: `RC-${docRef.id.slice(-6).toUpperCase()}`,
        notes: 'পুঠিয়া প্ল্যাটফর্ম অ্যাডমিন খুব দ্রুত আপনার মোবাইল নম্বরে স্বয়ংক্রিয় রিচার্জ পাঠিয়ে ভেরিফিকেশন সম্পন্ন করবে।'
      });
    } catch (err) {
      console.error('Recharge submit error:', err);
      toast.error('অনুরোধ পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingRecharge(false);
    }
  };

  // Handle Cash / Mobile Banking Withdrawal Submit
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (withdrawAmount < 50) {
      toast.error('ন্যূনতম উত্তোলন পরিমাণ ৳৫০ হতে হবে।');
      return;
    }

    if (availableBalanceTk < withdrawAmount) {
      toast.error(`আপনার ব্যবহারযোগ্য ব্যালেন্স অপর্যাপ্ত! বর্তমান ব্যালেন্স ৳${availableBalanceTk}, প্রয়োজনীয় ৳${withdrawAmount}`);
      return;
    }

    if (!withdrawAccountNo.trim()) {
      toast.error('অনুগ্রহ করে অ্যাকাউন্ট নম্বর বা ফোন নম্বর দিন।');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const res = await monetizationService.requestWithdrawal({
        userId,
        userName,
        amountTk: withdrawAmount,
        method: withdrawMethod,
        accountNumber: withdrawAccountNo.trim(),
        bankDetails: withdrawMethod === 'bank' ? {
          bankName: withdrawBankDetails || 'City Bank',
          branchName: 'Main Branch',
          accountHolder: userName,
          accountNumber: withdrawAccountNo.trim()
        } : undefined
      });

      if (res.success) {
        setIsWithdrawModalOpen(false);
        const methodLabel = withdrawMethod === 'bkash' ? 'bKash' : withdrawMethod === 'nagad' ? 'Nagad' : withdrawMethod === 'rocket' ? 'Rocket' : 'Bank Transfer';
        setSuccessModalData({
          isOpen: true,
          title: '🎉 টাকা উত্তোলনের আবেদন গৃহীত হয়েছে!',
          subtitle: 'নিরাপদ গেটওয়ের মাধ্যমে আপনার ক্যাশ উইথড্রয়াল আবেদনটি জমা হয়েছে।',
          type: 'withdrawal',
          amount: withdrawAmount,
          recipient: withdrawAccountNo.trim(),
          methodOrOperator: methodLabel,
          bankName: withdrawMethod === 'bank' ? (withdrawBankDetails || 'ব্যাংক হিসাব') : undefined,
          trackingId: res.withdrawalId ? `WD-${res.withdrawalId.slice(-6).toUpperCase()}` : undefined,
          notes: 'পুঠিয়া অ্যাডমিন প্যানেল রিভিউ সম্পন্ন করে সরাসরি আপনার ওয়ালেট/ব্যাংক অ্যাকাউন্টে টাকা পাঠিয়ে ট্রানজেকশন আইডি আপডেট করবে।'
        });
      } else {
        toast.error(res.message || 'উইথড্রয়াল আবেদন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error('Withdrawal request error:', err);
      toast.error('উইথড্রয়াল আবেদন পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const scrollToTransactions = () => {
    transactionSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans text-slate-800">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }}
      />

      {/* ============================================================ */}
      {/* ২. Main Wallet Card (পুরো স্ক্রিন জুড়ে Full Width Header Banner) */}
      {/* ============================================================ */}
      <div className="w-full bg-gradient-to-br from-[#006a4e] via-[#005740] to-[#044030] text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative glow circles */}
        <div className="absolute -right-8 -bottom-8 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-36 h-36 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-100/90 text-xs sm:text-sm font-bold mb-1">
                <span>💰 আপনার ওয়ালেট ব্যালেন্স</span>
              </div>

              {/* ৳২০ */}
              <div className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight flex items-baseline gap-1">
                <span>৳{animatedBalanceTk}</span>
              </div>

              {/* ⭐ ২০ ইস্টার */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 font-black text-sm sm:text-base">
                  <Star size={15} className="fill-amber-400 text-amber-400 inline" />
                  <span>{animatedStars} ইস্টার</span>
                </span>
              </div>

              {/* ছোট লেখা: ১ ইস্টার = ৳১ */}
              <div className="mt-2 text-[11px] sm:text-xs font-semibold text-emerald-100/90">
                <span>১ ইস্টার = ৳১</span>
              </div>
            </div>

            {/* Action Buttons: Mobile Recharge & Cash Withdrawal */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto sm:min-w-[240px]">
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone size={16} className="stroke-[2.5]" />
                <span>মোবাইল রিচার্জ (৳২০)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/30 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <CreditCard size={16} className="stroke-[2.5]" />
                <span>টাকা উত্তোলন (bKash/নগদ)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-5 py-4 pb-24">

        {/* ============================================================ */}
        {/* ৩. Available Balance (ব্যবহারযোগ্য ব্যালেন্স Summary) */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            <div className="p-2">
              <span className="text-[11px] font-bold text-slate-500 block">ব্যবহারযোগ্য ব্যালেন্স</span>
              <span className="text-lg sm:text-xl font-black text-[#006a4e] mt-0.5 block">
                ৳{animatedBalanceTk}
              </span>
            </div>

            <div className="p-2 pt-3 sm:pt-2">
              <span className="text-[11px] font-bold text-slate-500 block">মোট অর্জিত ইস্টার</span>
              <span className="text-lg sm:text-xl font-black text-slate-800 mt-0.5 block">
                {totalEarnedStars} ⭐
              </span>
            </div>

            <div className="p-2 pt-3 sm:pt-2">
              <span className="text-[11px] font-bold text-slate-500 block">মোট ব্যবহৃত ইস্টার</span>
              <span className="text-lg sm:text-xl font-black text-slate-600 mt-0.5 block">
                {totalUsedStars} ⭐
              </span>
            </div>

            <div className="p-2 pt-3 sm:pt-2">
              <span className="text-[11px] font-bold text-slate-500 block">মোট Reward</span>
              <span className="text-lg sm:text-xl font-black text-amber-600 mt-0.5 block">
                {totalRewardStars} ⭐
              </span>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* ৪. 🎁 কীভাবে ইস্টার পাবেন */}
        {/* ============================================================ */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-lg">🎁</span>
            <h2 className="text-sm sm:text-base font-black text-slate-800">কীভাবে ইস্টার পাবেন</h2>
          </div>

          <div className="bg-[#f0f9f5] border border-emerald-200/80 rounded-xl p-3.5 mb-3">
            <div className="text-xs sm:text-sm font-black text-[#006a4e] mb-1">
              Contribution Reward
            </div>
            <div className="text-xs text-slate-700 font-bold flex items-center gap-1.5 flex-wrap">
              <span>সঠিক তথ্য জমা দিন</span>
              <span className="text-slate-400">→</span>
              <span>Admin অনুমোদন করুন</span>
              <span className="text-slate-400">→</span>
              <span className="text-amber-600 font-black">+৫ ইস্টার</span>
            </div>
          </div>

          {/* উদাহরণ */}
          <div className="space-y-1.5 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">উদাহরণ:</div>
            <div className="flex items-center justify-between py-0.5">
              <span>১টি অনুমোদিত তথ্য</span>
              <span className="font-black text-emerald-700">+৫ ইস্টার</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span>৫টি অনুমোদিত তথ্য</span>
              <span className="font-black text-emerald-700">+২৫ ইস্টার</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span>১০টি অনুমোদিত তথ্য</span>
              <span className="font-black text-emerald-700">+৫০ ইস্টার</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ৫. 📊 Reward Summary */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-sm sm:text-base font-black text-slate-800">Reward Summary</h2>
            </div>
            <span className="text-xs font-black text-[#006a4e] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
              মোট: {totalEarnedStars} ইস্টার
            </span>
          </div>

          {/* তিনটি ছোট Card */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
            {/* ⭐ Contribution */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 block truncate">
                ⭐ Contribution
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 mt-1 block">
                +{contributionStars} ইস্টার
              </span>
            </div>

            {/* 🎁 Referral */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 block truncate">
                🎁 Referral
              </span>
              <span className="text-base sm:text-lg font-black text-blue-700 mt-1 block">
                +{referralRewardStars} ইস্টার
              </span>
            </div>

            {/* 🎉 অন্যান্য Reward */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 block truncate">
                🎉 অন্যান্য Reward
              </span>
              <span className="text-base sm:text-lg font-black text-purple-700 mt-1 block">
                +{otherRewardStars} ইস্টার
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>সর্বমোট অর্জিত Reward:</span>
            <span className="text-sm font-black text-slate-900">{totalEarnedStars} ইস্টার (৳{totalEarnedStars})</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ৮. 🎁 Reward Claim (প্রস্তুত থাকলে ব্যানার) */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm sm:text-base font-black flex items-center gap-1.5">
                <span>🎉 আপনার Reward প্রস্তুত!</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                Reward Amount: <span className="font-black text-sm">৳২০</span>
              </div>
              <p className="text-[11px] text-slate-900/80 mt-1 leading-relaxed">
                আপনার নির্ধারিত Facebook Task-এর ক্ষেত্রে Wallet থেকে সরাসরি Claim নয়—Task সম্পন্ন করে Screenshot ও Mobile Number Submit করার পর Admin Verification → Recharge হবে।
              </p>
            </div>

            <button
              onClick={() => {
                if (availableBalanceTk >= 20) {
                  setIsRechargeModalOpen(true);
                } else {
                  navigate('/referral');
                }
              }}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer text-center"
            >
              [ Reward Claim করুন ]
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ৬. 📜 Transaction History */}
        {/* ============================================================ */}
        <div ref={transactionSectionRef} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <h2 className="text-sm sm:text-base font-black text-slate-800">Transaction History</h2>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {filteredTransactions.length} টি লেনদেন
            </span>
          </div>

          {/* Filter উপরে থাকবে: সব | আয় | খরচ | Reward | Recharge */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button
              onClick={() => setTrxFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                trxFilter === 'all'
                  ? 'bg-[#006a4e] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সব
            </button>
            <button
              onClick={() => setTrxFilter('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                trxFilter === 'income'
                  ? 'bg-[#006a4e] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              আয়
            </button>
            <button
              onClick={() => setTrxFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                trxFilter === 'expense'
                  ? 'bg-[#006a4e] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              খরচ
            </button>
            <button
              onClick={() => setTrxFilter('reward')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                trxFilter === 'reward'
                  ? 'bg-[#006a4e] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Reward
            </button>
            <button
              onClick={() => setTrxFilter('recharge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                trxFilter === 'recharge'
                  ? 'bg-[#006a4e] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Recharge
            </button>
          </div>

          {/* Transaction Cards List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-7 text-xs text-slate-500">
              কোনো লেনদেনের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.stars > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-900">
                          {tx.title}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {tx.subTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-1">
                          {tx.dateTimeStr}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-xs sm:text-sm font-black ${
                        isPositive ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {isPositive ? `+${tx.stars} ইস্টার` : `${tx.stars} ইস্টার`}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {isPositive ? `+৳${tx.amountTk}` : `-৳${Math.abs(tx.amountTk)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ৭. 📱 Mobile Recharge (Recharge History) */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <h2 className="text-sm sm:text-base font-black text-slate-800">Mobile Recharge</h2>
            </div>
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-[#006a4e] hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <PlusCircle size={13} />
              <span>রিচার্জ নিন</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 mb-2.5">
            Recharge History
          </div>

          {rechargeList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              এখনো কোনো রিচার্জ রিকোয়েস্ট নেই।
            </div>
          ) : (
            <div className="space-y-2.5">
              {rechargeList.map((rc) => (
                <div
                  key={rc.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-800">
                      ৳{rc.amount} Mobile Recharge
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span>📱 {rc.mobileNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-sans text-[10px]">{rc.operator}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {rc.requestDateStr}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {rc.status === 'Processing' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        <Clock size={12} className="text-amber-600" />
                        <span>🕐 Processing</span>
                      </span>
                    )}
                    {rc.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>✅ Completed</span>
                      </span>
                    )}
                    {rc.status === 'Rejected' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        <XCircle size={12} className="text-rose-600" />
                        <span>❌ Rejected</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            Admin যে রিচার্জগুলো হাতে/সিস্টেমের মাধ্যমে সম্পন্ন করবে, সেগুলো এখানেই দেখা যাবে।
          </div>
        </div>

        {/* ============================================================ */}
        {/* ৮. 💳 টাকা উত্তোলন হিস্ট্রি (Cash / Mobile Banking Withdrawals) */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <h2 className="text-sm sm:text-base font-black text-slate-800">টাকা উত্তোলন (Cash Out)</h2>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <PlusCircle size={13} />
              <span>টাকা উত্তোলন</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 mb-2.5">
            Withdrawal History
          </div>

          {withdrawalsList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              এখনো কোনো ক্যাশ উত্তোলন রিকোয়েস্ট নেই। (ন্যূনতম ৳৫০ ব্যালেন্স হলে bKash/Nagad/Rocket বা ব্যাংকে টাকা উত্তোলন করতে পারবেন)
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawalsList.map((w) => {
                const methodLabel = w.method === 'bkash' ? 'bKash' : w.method === 'nagad' ? 'Nagad' : w.method === 'rocket' ? 'Rocket' : 'Bank';
                const d = new Date(w.requestedAt || Date.now());
                const dateFormatted = d.toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) + ' • ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                        <span>৳{w.amountTk} Payout</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          {methodLabel}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                        {w.accountNo || w.accountNumber || 'Bank A/C'}
                        {w.bankDetails?.bankName && (
                          <span className="text-slate-400 font-sans text-[10px] ml-1">
                            ({w.bankDetails.bankName})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {dateFormatted}
                        {w.transactionRef && (
                          <span className="text-emerald-700 font-mono font-bold ml-1.5">
                            • TRX: {w.transactionRef}
                          </span>
                        )}
                      </div>
                      {(w.rejectionReason || w.rejectReason) && (
                        <div className="text-[10px] text-rose-600 mt-0.5">
                          কারণ: {w.rejectionReason || w.rejectReason}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      {w.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <Clock size={12} className="text-amber-600" />
                          <span>🕐 Processing</span>
                        </span>
                      )}
                      {w.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>✅ Paid</span>
                        </span>
                      )}
                      {w.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <XCircle size={12} className="text-rose-600" />
                          <span>❌ Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            উইথড্রয়াল আবেদনের পর অ্যাডমিন যাচাই করে আপনার বিকাশ/নগদ/রকেট বা ব্যাংক অ্যাকাউন্টে টাকা পাঠিয়ে ট্রানজেকশন রেফারেন্স প্রদান করবে।
          </div>
        </div>

        {/* ============================================================ */}
        {/* ৯. Contribution Details */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-800">
              আমার Contribution
            </h2>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
              অর্জিত: {approvedSubmissionsCount * 5} ইস্টার
            </span>
          </div>

          {/* মোট জমা / অনুমোদিত / Pending / Rejected */}
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3.5">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">মোট জমা</span>
              <span className="text-sm sm:text-base font-black text-slate-800">{totalSubmissionsCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block">অনুমোদিত</span>
              <span className="text-sm sm:text-base font-black text-emerald-700">{approvedSubmissionsCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 block">Pending</span>
              <span className="text-sm sm:text-base font-black text-amber-700">{pendingSubmissionsCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Rejected</span>
              <span className="text-sm sm:text-base font-black text-rose-700">{rejectedSubmissionsCount}</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-600 mb-2">
            Contribution থেকে অর্জিত: <strong className="text-emerald-700 font-black">{approvedSubmissionsCount * 5} ইস্টার</strong>
          </div>

          {/* Submissions list with Status Tag */}
          {submissions.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 rounded-xl">
              এখনো কোনো তথ্য জমা দেননি।
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {submissions.map((sub, idx) => {
                const isApp = sub.status === 'Approved' || sub.isVerified === true;
                const isRej = sub.status === 'Rejected';
                return (
                  <div
                    key={sub.id || idx}
                    className="p-2.5 rounded-lg border border-slate-200/70 bg-white flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">
                        {sub.title || sub.name || sub._serviceTitle || 'সেবা তথ্য'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {sub._serviceTitle || 'ডিরেক্টরি তথ্য'}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isApp ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                          🟢 Approved
                        </span>
                      ) : isRej ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 text-[11px] bg-rose-50 px-2 py-0.5 rounded-md">
                          🔴 Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 text-[11px] bg-amber-50 px-2 py-0.5 rounded-md">
                          🟡 Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ১০. Wallet Rules */}
        {/* ============================================================ */}
        <div className="bg-[#f2f8f5] border border-emerald-200/70 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-[#006a4e] font-black text-xs sm:text-sm">
            <Info size={16} />
            <span>ℹ️ Wallet সম্পর্কে</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-700 font-medium leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-[#006a4e] font-bold">•</span>
              <span>Admin অনুমোদিত Contribution-এর জন্য ৫ ইস্টার পাওয়া যাবে।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#006a4e] font-bold">•</span>
              <span>Rejected Contribution-এর জন্য কোনো ইস্টার পাওয়া যাবে না।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#006a4e] font-bold">•</span>
              <span>Reward/Recharge-এর প্রতিটি লেনদেন Wallet History-তে সংরক্ষিত হবে।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#006a4e] font-bold">•</span>
              <span>কোনো সন্দেহজনক বা প্রতারণামূলক কার্যক্রমের ক্ষেত্রে Reward বাতিল হতে পারে।</span>
            </li>
          </ul>
        </div>

      </main>

      {/* ============================================================ */}
      {/* Mobile Recharge Modal */}
      {/* ============================================================ */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRechargeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Smartphone size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800">মোবাইল রিচার্জ আবেদন</h3>
                <p className="text-[11px] text-slate-500">ওয়ালেট ব্যালেন্স থেকে উত্তোলন</p>
              </div>
            </div>

            <form onSubmit={handleRequestRecharge} className="space-y-3 mt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={rechargePhone}
                  onChange={(e) => setRechargePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  অপারেটর নির্বাচন করুন
                </label>
                <select
                  value={rechargeOperator}
                  onChange={(e) => setRechargeOperator(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-[#006a4e]"
                >
                  <option value="Grameenphone">Grameenphone (জিপি)</option>
                  <option value="Banglalink">Banglalink (বাংলালিংক)</option>
                  <option value="Robi">Robi (রবি)</option>
                  <option value="Airtel">Airtel (এয়ারটেল)</option>
                  <option value="Teletalk">Teletalk (টেলিটক)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  রিচার্জের পরিমাণ
                </label>
                <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>৳{rechargeAmount} (২০ ইস্টার)</span>
                  <span className="text-[10px] text-emerald-700 font-bold">স্থির পরিমাণ</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRecharge || availableBalanceTk < rechargeAmount}
                  className="w-full py-2.5 bg-[#006a4e] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmittingRecharge ? 'প্রসেসিং হচ্ছে...' : `৳${rechargeAmount} রিচার্জের অনুরোধ পাঠান`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Cash / Mobile Banking Withdrawal Modal */}
      {/* ============================================================ */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006a4e] flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800">টাকা উত্তোলন আবেদন</h3>
                <p className="text-[11px] text-slate-500">বিকাশ / নগদ / রকেট / ব্যাংক একাউন্টে</p>
              </div>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-3 mt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  পেমেন্ট মেথড
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['bkash', 'nagad', 'rocket', 'bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWithdrawMethod(m)}
                      className={`py-1.5 text-xs font-black rounded-xl border transition-all uppercase cursor-pointer ${
                        withdrawMethod === m
                          ? 'border-[#006a4e] bg-emerald-50 text-[#006a4e]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {withdrawMethod === 'bank' ? 'ব্যাংক একাউন্ট নম্বর' : 'মোবাইল ওয়ালেট নম্বর'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={withdrawMethod === 'bank' ? 'Account Number' : '01XXXXXXXXX'}
                  value={withdrawAccountNo}
                  onChange={(e) => setWithdrawAccountNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e]"
                />
              </div>

              {withdrawMethod === 'bank' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    ব্যাংক নাম ও ব্রাঞ্চ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Islami Bank, Gulshan Branch"
                    value={withdrawBankDetails}
                    onChange={(e) => setWithdrawBankDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#006a4e]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  উত্তোলনের পরিমাণ (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min="50"
                    max={availableBalanceTk}
                    step="10"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs font-black rounded-xl border border-slate-200 focus:outline-none focus:border-[#006a4e]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  ন্যূনতম ৳৫০ | বর্তমান উপলব্ধ ব্যালেন্স: ৳{availableBalanceTk}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawal || availableBalanceTk < 50 || withdrawAmount > availableBalanceTk}
                  className="w-full py-2.5 bg-[#006a4e] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmittingWithdrawal ? 'অনুরোধ পাঠানো হচ্ছে...' : `৳${withdrawAmount} উত্তোলন আবেদন পাঠান`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Lottie Success Animation Modal */}
      {/* ============================================================ */}
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
          bankName={successModalData.bankName}
          trackingId={successModalData.trackingId}
          notes={successModalData.notes}
          onViewHistory={scrollToTransactions}
        />
      )}

      <Footer />
      <BottomNavigation />
    </div>
  );
};

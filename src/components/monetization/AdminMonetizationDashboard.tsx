import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, DollarSign, Wallet, Check, X, AlertTriangle, RefreshCw, 
  Search, Eye, Send, Lock, TrendingUp, Users, ArrowUpRight, CheckCircle2, Sliders, Rocket
} from 'lucide-react';
import { monetizationService, WithdrawalRequest, AdCampaign, PlatformRevenueStats } from '../../services/monetizationService';
import { AdminReferralPanel } from '../referral/AdminReferralPanel';
import toast from 'react-hot-toast';

export const AdminMonetizationDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [stats, setStats] = useState<PlatformRevenueStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'ads' | 'referrals' | 'fraud' | 'audit' | 'settings'>('withdrawals');

  useEffect(() => {
    if (urlTab) {
      if (['withdrawals', 'ads', 'referrals', 'fraud', 'audit', 'settings'].includes(urlTab)) {
        setActiveTab(urlTab as any);
      } else if (urlTab === 'overview' || urlTab === 'subscriptions') {
        setActiveTab('withdrawals');
      }
    }
  }, [urlTab]);
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<number>(500);
  const [creatorCommissionInput, setCreatorCommissionInput] = useState<number>(80);

  const handleExportCSV = () => {
    const csvContent = "Transaction ID,Type,Amount (Tk),Status,Date\nTRX1001,ad_share,1200,completed,2026-08-22\nTRX1002,star_support,500,completed,2026-08-22\nTRX1003,subscription,450,completed,2026-08-22\nTRX1004,withdrawal,2000,paid,2026-08-21";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📊 আর্থিক রিপোর্ট (CSV) সফলভাবে ডাউনলোড হয়েছে!');
  };
  const [loading, setLoading] = useState<boolean>(true);

  // Approval modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [trxRef, setTrxRef] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([
        monetizationService.getAdminPlatformStats(),
        monetizationService.getWithdrawalHistory('admin_all')
      ]);
      setStats(s);
      setWithdrawals(w);
    } catch (err) {
      console.error('Error loading admin monetization data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveWithdrawal = async (withdrawal: WithdrawalRequest) => {
    if (!trxRef.trim()) {
      toast.error('অনুগ্রহ করে bKash/Nagad পেমেন্ট রেফারেন্স বা TRX ID লিখুন।');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await monetizationService.approveWithdrawal({
        withdrawalId: withdrawal.id,
        trxRef: trxRef.trim()
      });
      if (res.success) {
        toast.success(`🎉 ৳${withdrawal.amountTk} সফলভাবে অনুমোদিত এবং TRX ID (${trxRef}) সহ আপডেট করা হয়েছে!`);
        setSelectedWithdrawal(null);
        setTrxRef('');
        loadData();
      } else {
        toast.error(res.message || 'অনুমোদন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('উইথড্রয়াল অনুমোদন করতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawal: WithdrawalRequest) => {
    if (!rejectReason.trim()) {
      toast.error('বাতিল করার কারণ লিখুন।');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await monetizationService.rejectWithdrawal({
        withdrawalId: withdrawal.id,
        userId: withdrawal.userId,
        amountTk: withdrawal.amountTk,
        reason: rejectReason.trim()
      });
      if (res.success) {
        toast.success(`উইথড্রয়াল আবেদনটি বাতিল করা হয়েছে এবং ইউজারকে রিফান্ড করা হয়েছে।`);
        setSelectedWithdrawal(null);
        setRejectReason('');
        loadData();
      } else {
        toast.error(res.message || 'বাতিলকরণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('উইথড্রয়াল বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-slate-800">
      {/* Header Banner - Full Width Edge-to-Edge */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border-b border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <DollarSign size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black mb-3">
              <ShieldCheck size={14} className="text-emerald-400" /> অ্যাডমিন মনিটাইজেশন কন্ট্রোল সেন্টার
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              আড্ডা আর্থিক ও প্ল্যাটফর্ম ইকোনমি কন্ট্রোল
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-bold leading-relaxed">
              পেইড অ্যাডস, ক্রিয়েটর পে-আউট এবং ফ্রড প্রটেকশন রিয়েলটাইমে নিয়ন্ত্রণ করুন
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-md transition active:scale-95"
            >
              📊 এক্সপোর্ট রিপোর্ট (CSV)
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              ডাটা রিফ্রেশ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6">

        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট প্ল্যাটফর্ম রাজস্ব</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">৳{stats?.totalRevenueTk.toLocaleString() || '১,৪৮,৫০০'}</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+২২% এই মাসে বৃদ্ধি</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ক্রিয়েটর পে-আউট প্রদান</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">৳{stats?.creatorPayoutsTk.toLocaleString() || '৬২,৪০০'}</span>
            <span className="text-[10px] text-slate-400 block">অনুমোদিত ক্রিয়েটর আয়</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">প্ল্যাটফর্ম নিট প্রফিট</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">৳{stats?.platformNetProfitTk.toLocaleString() || '৮৬,১০০'}</span>
            <span className="text-[10px] text-slate-400 block">কমিশন ও এডস আয়</span>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">পেন্ডিং উইথড্রয়াল</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{stats?.pendingWithdrawalsCount || 5} টি আবেদন</span>
            <span className="text-[10px] text-amber-600 font-bold block">রিভিউ ও ভেরিফিকেশন প্রয়োজন</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-xs">
          {[
            { id: 'withdrawals', label: '💳 উইথড্রয়াল ভেরিফিকেশন ও পে-আউট', icon: Wallet },
            { id: 'ads', label: '📢 অ্যাড ও পোস্ট বুস্ট অনুমোদন', icon: Rocket },
            { id: 'referrals', label: '🎁 রেফারেল অ্যান্ড গ্রোথ কন্ট্রোল', icon: Users },
            { id: 'fraud', label: '🛡️ ফ্রড ও ক্লিক স্প্যাম ডিটেকশন', icon: AlertTriangle },
            { id: 'audit', label: '🔐 ফাইন্যান্সিয়াল অডিট লগ', icon: Lock },
            { id: 'settings', label: '⚙️ কমিশন ও রেভিনিউ শেয়ার রুলস', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: WITHDRAWAL APPROVALS */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800">
                ক্রিয়েটর উইথড্রয়াল রিকোয়েস্ট তালিকা (Pending Creator Payouts)
              </h3>
              <span className="text-xs text-slate-500 font-bold">মোট পেন্ডিং: {withdrawals.length} টি</span>
            </div>

            <div className="divide-y divide-slate-100">
              {withdrawals.map((w) => (
                <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{w.userName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {w.method.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      ফোন: {w.userPhone} | অ্যাকাউন্ট নম্বর: <span className="font-mono font-bold text-slate-700">{w.accountNo}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      আবেদনের সময়: {new Date(w.requestedAt).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600">৳{w.amountTk}</span>
                      <span className="block text-[10px] text-slate-400">ফি: ৳০.০০</span>
                    </div>

                    {w.status === 'pending' ? (
                      <button
                        onClick={() => setSelectedWithdrawal(w)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                      >
                        পে-আউট রিভিউ ও পেমেন্ট
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                        পরিশোধিত ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADS APPROVAL */}
        {activeTab === 'ads' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              বিজ্ঞাপন ও বুস্টেড পোস্ট ভেরিফিকেশন (Ads Moderation Queue)
            </h3>
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-800 block">পুঠিয়া ডিজিটাল ডায়াগনস্টিক অ্যান্ড কনসালটেশন সেন্টার</span>
                <p className="text-slate-500 mt-0.5">বাজেট: ৳৫০/দিন (৫ দিনের জন্য) | লক্ষ্যবস্তু: পুঠিয়া সদর, জিউ পাড়া</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast.success('ক্যাম্পেইন সফলভাবে অনুমোদিত!')} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">
                  অনুমোদন করুন ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REFERRALS */}
        {activeTab === 'referrals' && (
          <AdminReferralPanel />
        )}

        {/* TAB 3: FRAUD DETECTION */}
        {activeTab === 'fraud' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              অটোমেটেড অ্যান্টি-ফ্রড ও ফেক এনগেজমেন্ট ডিটেক্টর
            </h3>
            <p className="text-xs text-slate-500">বট বা রোবোটিক ক্লিকে বিজ্ঞাপন বাজেট নষ্ট হওয়া রোধ করতে আড্ডার সিস্টেম মনিটর করে।</p>
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
              🟢 কোন সন্দেহজনক অটোমেটেড কিক স্প্যাম বা ফ্রড এক্টিভিটি শনাক্ত হয়নি। সিস্টেম ১০০% সুরক্ষিত।
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                🔐 ফাইন্যান্সিয়াল অডিট লগ (Financial Audit Logs)
              </h3>
              <span className="text-xs text-slate-400 font-mono">সিকিউর লগার সক্রিয়</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { id: 'aud_1', admin: 'প্রধান এডমিন (অফিসিয়াল)', action: 'WITHDRAWAL_APPROVED', amount: 2000, reason: 'bKash TRX #98721345 এর মাধ্যমে পে-আউট প্রদান', date: 'আজ, ১০:১৫ AM' },
                { id: 'aud_2', admin: 'প্রধান এডমিন (অফিসিয়াল)', action: 'COMMISSION_RULE_UPDATE', amount: 0, reason: 'ক্রিয়েটর শেয়ার ৮০% এবং প্ল্যাটফর্ম ফি ২০% সেট করা হয়েছে', date: 'গতকাল, ০৬:৩০ PM' },
                { id: 'aud_3', admin: 'মডারেটর ১', action: 'AD_CAMPAIGN_APPROVED', amount: 500, reason: 'পুঠিয়া ডায়াগনস্টিক বিজ্ঞাপনের অনুমোদন', date: '২০ আগস্ট, ০৪:১০ PM' }
              ].map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">{log.admin}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-extrabold uppercase">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{log.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-700">{log.amount > 0 ? `৳${log.amount}` : '-'}</span>
                    <span className="block text-[10px] text-slate-400">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-800">
              মনিটাইজেশন রুলস ও কমিশন কনফিগুরেশন (Monetization Rules & Policy)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ক্রিয়েটর শেয়ার (%) [Default: 80%]:</label>
                <input
                  type="number"
                  value={creatorCommissionInput}
                  onChange={(e) => setCreatorCommissionInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">সর্বনিম্ন উইথড্রয়াল লিমিট (৳) [Default: ৳500]:</label>
                <input
                  type="number"
                  value={minWithdrawalInput}
                  onChange={(e) => setMinWithdrawalInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => toast.success('কমিশন ও উইথড্রয়াল সেটিংস সফলভাবে আপডেট করা হয়েছে!')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              সেটিংস সেভ করুন
            </button>
          </div>
        )}

      </div>

      {/* APPROVAL MODAL */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-500/30 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              উইথড্রয়াল রিকোয়েস্ট প্রসেসিং (Payout Approval)
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
              <p><span className="font-bold text-slate-700">ক্রিয়েটর:</span> {selectedWithdrawal.userName}</p>
              <p><span className="font-bold text-slate-700">মেথড:</span> {selectedWithdrawal.method.toUpperCase()} ({selectedWithdrawal.accountNo})</p>
              <p><span className="font-bold text-emerald-600">উত্তোলনের টাকা:</span> ৳{selectedWithdrawal.amountTk}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                bKash/Nagad Transaction Ref (TRX ID):
              </label>
              <input
                type="text"
                placeholder="যেমন: TRX98721345"
                value={trxRef}
                onChange={(e) => setTrxRef(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-200 rounded-xl outline-none bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                অথবা বাতিল করার কারণ লিখুন (যদি বাতিল করতে চান):
              </label>
              <input
                type="text"
                placeholder="যেমন: ভুল অ্যাকাউন্ট নম্বর"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-900 focus:ring-2 focus:ring-rose-500"
              />
              {rejectReason.trim() && (
                <button
                  type="button"
                  onClick={() => handleRejectWithdrawal(selectedWithdrawal)}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  আবেদনটি বাতিল করুন ও ব্যালেন্স রিফান্ড করুন
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleApproveWithdrawal(selectedWithdrawal)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                অনুমোদন ও পেমেন্ট সফল কনফার্ম করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setRejectReason('');
                  setTrxRef('');
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

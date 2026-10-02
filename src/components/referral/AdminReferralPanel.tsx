import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, CheckCircle2, XCircle, DollarSign, Award, Settings, 
  RefreshCw, AlertTriangle, Filter, Sparkles, Clock, Check, BarChart2, TrendingUp, FilterX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  referralService, 
  ReferralRecord, 
  ReferralSystemSettings, 
  ReferralCampaign,
  ReferralFunnelAnalytics 
} from '../../services/referralService';
import toast from 'react-hot-toast';

export const AdminReferralPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'task_review' | 'recharge_review' | 'analytics' | 'all' | 'campaigns' | 'settings'>('pending');
  
  const [stats, setStats] = useState({
    totalReferralsCount: 0,
    verifiedReferralsCount: 0,
    pendingReferralsCount: 0,
    suspiciousFraudCount: 0,
    totalRewardsPaidTk: 0
  });

  const [funnel, setFunnel] = useState<ReferralFunnelAnalytics | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [settings, setSettings] = useState<ReferralSystemSettings>({
    defaultRewardAmountTk: 10,
    defaultWelcomeCoins: 10,
    dailyLimitPerUser: 10,
    monthlyLimitPerUser: 100,
    minActivityPosts: 1,
    requirePhoneVerification: true,
    autoApproveClean: true,
    isReferralEnabled: true
  });

  const [loading, setLoading] = useState(true);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Task & Recharge state variables
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<any[]>([]);
  const [rechargeReviewingId, setRechargeReviewingId] = useState<string | null>(null);
  const [rechargeTrxId, setRechargeTrxId] = useState('');
  const [rechargeRejectReason, setRechargeRejectReason] = useState('');
  const [taskRejectModalId, setTaskRejectModalId] = useState<string | null>(null);
  const [taskRejectReason, setTaskRejectReason] = useState('');
  const [rechargeSuccessData, setRechargeSuccessData] = useState<{ amount: number; phone: string; operator: string; trxId: string } | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, settingsData, historyData, funnelData, taskSubs, recharges] = await Promise.all([
        referralService.getAdminReferralStats(),
        referralService.getSystemSettings(),
        referralService.getUserReferralHistory('admin_view'),
        referralService.getReferralFunnelAnalytics(),
        referralService.adminGetTaskSubmissions(),
        referralService.adminGetRechargeRequests()
      ]);
      setStats(statsData);
      setSettings(settingsData);
      setReferrals(historyData);
      setFunnel(funnelData);
      setTaskSubmissions(taskSubs);
      setRechargeRequests(recharges);
    } catch (err) {
      console.error('Error loading admin referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (refId: string) => {
    const res = await referralService.adminApproveReferral(refId);
    if (res.success) {
      toast.success(res.message);
      loadAdminData();
    } else {
      toast.error(res.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModalId) return;
    const res = await referralService.adminRejectReferral(rejectModalId, rejectReason);
    if (res.success) {
      toast.success(res.message);
      setRejectModalId(null);
      setRejectReason('');
      loadAdminData();
    } else {
      toast.error(res.message);
    }
  };

  const handleReviewTask = async (submissionId: string, status: 'approved' | 'rejected', reason?: string) => {
    const res = await referralService.adminReviewTaskSubmission(submissionId, status, reason);
    if (res.success) {
      toast.success(res.message);
      setTaskRejectModalId(null);
      setTaskRejectReason('');
      loadAdminData();
    } else {
      toast.error(res.message);
    }
  };

  const handleProcessRecharge = async (requestId: string, status: 'successful' | 'failed', trxId?: string, reason?: string) => {
    // Locate the request info before processing
    const requestDetails = rechargeRequests.find(r => r.id === requestId);
    const res = await referralService.adminProcessRechargeRequest(requestId, status, trxId, reason);
    if (res.success) {
      toast.success(res.message);
      setRechargeReviewingId(null);
      setRechargeTrxId('');
      setRechargeRejectReason('');
      
      if (status === 'successful') {
        setRechargeSuccessData({
          amount: requestDetails?.amount || 20,
          phone: requestDetails?.phone || 'অজানা নম্বর',
          operator: requestDetails?.operator || 'GP',
          trxId: trxId || 'AUTO_GP_' + Math.floor(Math.random() * 10000000)
        });
      }
      
      loadAdminData();
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveSettings = async () => {
    const success = await referralService.saveSystemSettings(settings);
    if (success) {
      toast.success('রেফারেল পলিসি ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } else {
      toast.error('সেটিংস সেভ হতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            👑 আড্ডা মনিটাইজেশন ও রেফারেল কন্ট্রোল প্যানেল
          </span>
          <h2 className="text-xl font-black text-white mt-1">রেফারেল ফ্রড অ্যান্ড গ্রোথ ম্যানেজমেন্ট</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ফেক রেফারেল ও বট রেজিস্ট্রেসন রোধ করে প্রকৃত ক্রিয়েটরদের সঠিক রিওয়ার্ড অনুমোদন করুন।
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          রিফ্রেশ লিস্ট
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট রেফারেল</span>
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{stats.totalReferralsCount}</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">ভেরিফাইড ও পেইড</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.verifiedReferralsCount}</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">পেন্ডিং রিভিউ</span>
          <span className="text-2xl font-black text-amber-500 mt-1 block">{stats.pendingReferralsCount}</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">🚨 ফ্ল্যাগড/সন্দেহজনক</span>
          <span className="text-2xl font-black text-rose-500 mt-1 block">{stats.suspiciousFraudCount}</span>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl shadow-md">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">মোট পেইড বোনাস</span>
          <span className="text-2xl font-black text-white mt-1 block">৳{stats.totalRewardsPaidTk}</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'pending', label: '⏳ ভেরিফিকেশন ও এপ্রুভাল কিউ', icon: ShieldAlert },
          { id: 'task_review', label: '📸 টাস্ক স্ক্রিনশট রিভিউ', icon: ShieldAlert },
          { id: 'recharge_review', label: '📱 রিচার্জ রিকোয়েস্ট', icon: DollarSign },
          { id: 'analytics', label: '📊 কনভার্সন ফানেল ও এনালিটিক্স', icon: BarChart2 },
          { id: 'all', label: '📜 সকল রেফারেল রেকর্ড', icon: Users },
          { id: 'campaigns', label: '🎯 ক্যাম্পেইন ম্যানেজার', icon: Award },
          { id: 'settings', label: '⚙️ ফ্রড অ্যান্ড রুলস সেটিংস', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: PENDING & SUSPICIOUS QUEUE */}
      {activeSubTab === 'pending' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            পেন্ডিং রেফারেল ও ফ্ল্যাগড অ্যাকাউন্ট সমূহের রিভিউ কিউ
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {referrals.map((item) => (
              <div key={item.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-200">
                      {item.refereeName.substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{item.refereeName}</span>
                        {item.status === 'suspicious' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-extrabold text-[10px]">
                            🚨 High Risk Fraud
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ইনভাইটার: <strong className="text-emerald-600">{item.referrerName}</strong> ({item.referrerCode})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      অনুমোদন করুন (৳{item.rewardAmountTk})
                    </button>
                    <button
                      onClick={() => setRejectModalId(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      বাতিল
                    </button>
                  </div>
                </div>

                {/* Fraud Flags Breakdown if any */}
                {item.fraudFlags && item.fraudFlags.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">সন্দেহজনক ফ্ল্যাগড কারণ:</span>
                      <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                        {item.fraudFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB: TASK REVIEW QUEUE */}
      {activeSubTab === 'task_review' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              টাস্ক স্ক্রিনশট রিভিউ কিউ (Task Verification Queue)
            </h3>
            <span className="text-xs text-slate-400 font-bold">মোট পেন্ডিং: {taskSubmissions.filter(s => s.status === 'pending').length} টি</span>
          </div>

          {taskSubmissions.length === 0 ? (
            <p className="text-xs text-slate-450 text-center py-6">কোন টাস্ক সাবমিশন রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {taskSubmissions.map((item) => (
                <div key={item.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{item.userName}</span>
                        <span className="text-[11px] font-mono text-slate-400">({item.userPhone || 'নম্বর নেই'})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.taskType === 'like_follow' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.taskType === 'like_follow' ? 'পেজ লাইক ও ফলো' : 'পোস্ট শেয়ার'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        সাবমিট করা হয়েছে: {new Date(item.submittedAt).toLocaleString('bn-BD')}
                      </p>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">প্রুফ স্টেটাস:</span>
                        {item.screenshotUrl && (item.screenshotUrl.startsWith('http') || item.screenshotUrl.startsWith('data:')) ? (
                          <a href={item.screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-w-[200px] hover:opacity-90">
                            <img src={item.screenshotUrl} alt="Proof" className="w-full object-contain" referrerPolicy="no-referrer" />
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold inline-block">
                            🔔 ব্যবহারকারী কাজটি সম্পূর্ণ করেছেন বলে দাবি করেছেন (কোনো স্ক্রিনশট প্রুফ নেই)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleReviewTask(item.id, 'approved')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            অনুমোদন করুন
                          </button>
                          <button
                            onClick={() => setTaskRejectModalId(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            রিজেক্ট
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full font-black text-xs ${
                          item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status === 'approved' ? '✅ অনুমোদিত' : '❌ বাতিল'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB: MOBILE RECHARGE QUEUE */}
      {activeSubTab === 'recharge_review' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              ৳২০ মোবাইল রিচার্জ রিকোয়েস্ট কিউ (Mobile Recharge Claims)
            </h3>
            <span className="text-xs text-slate-400 font-bold">মোট পেন্ডিং: {rechargeRequests.filter(r => r.status === 'processing').length} টি</span>
          </div>

          {rechargeRequests.length === 0 ? (
            <p className="text-xs text-slate-455 text-center py-6">কোন রিচার্জ ক্লেইম রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rechargeRequests.map((item) => (
                <div key={item.id} className="py-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-xs">
                    {/* Column 1: User & Referral Metadata (4 cols) */}
                    <div className="md:col-span-4 space-y-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{item.userName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold text-[10px]">
                            ৳{item.amount} ক্লেইম
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {item.userId}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">মোবাইল রিচার্জ নম্বর:</span>
                        <p className="font-extrabold text-slate-755 dark:text-slate-300">
                          📱 <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm select-all">{item.mobileNumber}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-bold">অপারেটর: {item.operator}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">ক্যাম্পেইন ও রেফার তথ্য:</span>
                        {item.referralInfo ? (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-slate-650 dark:text-slate-300">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">🔗 রেফারেল দ্বারা আমন্ত্রিত</span>
                            <div className="mt-1">
                              <p className="font-semibold">ইনভাইটার: {item.referralInfo.referrerName}</p>
                              <p className="font-mono text-[10px] text-slate-400">কোড: {item.referralInfo.referrerCode}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-medium">সরাসরি অর্গানিক ইউজার (কোনো রেফারেল নেই)</span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-450">
                        <span>তারিখ: {new Date(item.createdAt).toLocaleString('bn-BD')}</span>
                      </div>
                    </div>

                    {/* Column 2: Uploaded Proof Screenshots (5 cols) */}
                    <div className="md:col-span-5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">📸 টাস্ক স্ক্রিনশটস (Task Uploads):</span>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Task 1 Proof */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 block">১. পেজ লাইক ও ফলো:</span>
                          {item.likeFollowScreenshotUrl ? (
                            <a href={item.likeFollowScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:opacity-90 transition aspect-video bg-slate-100 dark:bg-slate-800">
                              <img src={item.likeFollowScreenshotUrl} alt="Like Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-[9px] text-white font-extrabold px-1.5 py-0.5 bg-black/60 rounded-md">বড় করে দেখুন</span>
                              </div>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic block">আপলোড করা হয়নি</span>
                          )}
                        </div>

                        {/* Task 2 Proof */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 block">২. পোস্ট শেয়ার:</span>
                          {item.postShareScreenshotUrl ? (
                            <a href={item.postShareScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 hover:opacity-90 transition aspect-video bg-slate-100 dark:bg-slate-800">
                              <img src={item.postShareScreenshotUrl} alt="Share Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                                <span className="text-[9px] text-white font-extrabold px-1.5 py-0.5 bg-black/60 rounded-md">বড় করে দেখুন</span>
                              </div>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic block">আপলোড করা হয়নি</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Processing Actions (3 cols) */}
                    <div className="md:col-span-3 flex flex-col justify-center items-end gap-2 self-stretch">
                      {item.status === 'processing' ? (
                        <div className="w-full space-y-2">
                          <button
                            onClick={() => {
                              setRechargeReviewingId(item.id);
                              setRechargeTrxId('');
                              setRechargeRejectReason('');
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            [ Verify & Recharge ]
                          </button>
                          <button
                            onClick={() => {
                              setRechargeReviewingId(item.id);
                              setRechargeRejectReason('অপারেটর বা মোবাইল নম্বরটি সঠিক নয়।');
                            }}
                            className="w-full py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            [ Reject Request ]
                          </button>
                        </div>
                      ) : (
                        <div className="text-right space-y-1.5">
                          <span className={`px-2.5 py-1 rounded-full font-black text-[10px] inline-block ${
                            item.status === 'successful' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status === 'successful' ? '✅ Recharge Completed' : '❌ রিচার্জ বাতিল'}
                          </span>
                          {item.transactionId && (
                            <p className="text-[10px] text-slate-500 font-mono">TRX: <span className="select-all font-bold">{item.transactionId}</span></p>
                          )}
                          {item.rejectionReason && (
                            <p className="text-[10px] text-rose-500 font-bold max-w-[150px] leading-relaxed">কারণ: {item.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB: ANALYTICS & CONVERSION FUNNEL */}
      {activeSubTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              📈 রেফারেল কনভার্সন ফানেল ও গ্রোথ এনালিটিক্স (Conversion Funnel & Performance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ইনভাইট লিঙ্ক ক্লিক থেকে শুরু করে রিওয়ার্ড বিতরণ পর্যন্ত প্রতিটি ধাপের ট্র্যাকিং
            </p>
          </div>

          {/* Funnel Steps Visual Display */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">১. লিঙ্ক ক্লিকস</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 block">{funnel?.linkClicks || 1000}</span>
              <span className="text-[10px] text-slate-400">100% Clicks</span>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 uppercase block">২. সাইন-আপ</span>
              <span className="text-xl font-black text-blue-600 block">{funnel?.registrations || 600}</span>
              <span className="text-[10px] text-blue-500 font-semibold">60% Signups</span>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase block">৩. ভেরিফাইড</span>
              <span className="text-xl font-black text-indigo-600 block">{funnel?.verifiedUsers || 450}</span>
              <span className="text-[10px] text-indigo-500 font-semibold">75% Verified</span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase block">৪. কোয়ালিফাইড</span>
              <span className="text-xl font-black text-emerald-600 block">{funnel?.qualifiedReferrals || 300}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">66% Qualified</span>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-200 uppercase block">৫. রিওয়ার্ডেড</span>
              <span className="text-xl font-black text-amber-600 block">{funnel?.rewardedReferrals || 280}</span>
              <span className="text-[10px] text-amber-600 font-semibold">93% Rewarded</span>
            </div>
          </div>

          {/* Key Metric Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 block">সামগ্রিক কনভার্সন রেট:</span>
                <span className="text-xl font-black text-emerald-600">{funnel?.conversionRatePercent || 28.0}%</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-rose-900 dark:text-rose-200 block">ফ্রড ও রিজেকশন রেট:</span>
                <span className="text-xl font-black text-rose-600">{funnel?.fraudRatePercent || 3.3}%</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-200 block">প্রতি কোয়ালিফাইড কস্ট (CPQR):</span>
                <span className="text-xl font-black text-amber-600">৳{funnel?.costPerQualifiedReferralTk || 10}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: SETTINGS & FRAUD RULES */}
      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            রেফারেল পলিসি, অ্যান্টি-ফ্রড এবং রিওয়ার্ড লিমিট সেটিংস
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ডিফল্ট রেফারেল রিওয়ার্ড (৳)</label>
              <input
                type="number"
                value={settings.defaultRewardAmountTk}
                onChange={(e) => setSettings({ ...settings, defaultRewardAmountTk: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">নতুন ইউজার ওয়েলকাম কয়েন (Coins)</label>
              <input
                type="number"
                value={settings.defaultWelcomeCoins}
                onChange={(e) => setSettings({ ...settings, defaultWelcomeCoins: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">দৈনিক একজন ইউজারের সর্বোচ্চ রেফারেল লিমিট</label>
              <input
                type="number"
                value={settings.dailyLimitPerUser}
                onChange={(e) => setSettings({ ...settings, dailyLimitPerUser: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ভেরিফিকেশনের জন্য প্রয়োজনীয় ন্যূনতম পোস্ট</label>
              <input
                type="number"
                value={settings.minActivityPosts}
                onChange={(e) => setSettings({ ...settings, minActivityPosts: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              সেটিংস সেভ করুন
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">রেফারেল বাতিল করুন</h3>
            <p className="text-xs text-slate-500">বাতিলের সঠিক কারণ প্রদান করুন যা ইউজারের ড্যাশবোর্ডে প্রদর্শিত হবে:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="যেমন: ফেক একাউন্ট অথবা একই ডিভাইসে একাধিক রেজিস্ট্রেসন"
              className="w-full h-24 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectModalId(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                বাতিল করুন
              </button>
              <button onClick={handleReject} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs">
                নিশ্চিত বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Reject Modal */}
      {taskRejectModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">টাস্ক সাবমিশন বাতিল করুন</h3>
            <p className="text-xs text-slate-500">বাতিলের সঠিক কারণ প্রদান করুন যা ইউজারের ড্যাশবোর্ডে প্রদর্শিত হবে:</p>
            <textarea
              value={taskRejectReason}
              onChange={(e) => setTaskRejectReason(e.target.value)}
              placeholder="যেমন: স্ক্রিনশটটি স্পষ্ট নয় বা নিয়মানুযায়ী পেইজে লাইক দেওয়া হয়নি"
              className="w-full h-24 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTaskRejectModalId(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                ফিরে যান
              </button>
              <button onClick={() => handleReviewTask(taskRejectModalId, 'rejected', taskRejectReason)} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs">
                নিশ্চিত বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Processing Modal */}
      {rechargeReviewingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">মোবাইল রিচার্জ প্রসেস</h3>
            
            {rechargeRejectReason ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">রিচার্জ ক্লেইমটি বাতিল করার কারণ লিখুন:</p>
                <textarea
                  value={rechargeRejectReason}
                  onChange={(e) => setRechargeRejectReason(e.target.value)}
                  placeholder="যেমন: মোবাইল নম্বরটি সচল নয় অথবা ভুল অপারেটর নির্বাচন করেছেন"
                  className="w-full h-24 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-rose-500"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRechargeReviewingId(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                    ফিরে যান
                  </button>
                  <button onClick={() => handleProcessRecharge(rechargeReviewingId, 'failed', undefined, rechargeRejectReason)} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs">
                    বাতিল নিশ্চিত করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">রিচার্জ সফল করার জন্য Transaction ID লিখুন (অথবা ফাকা রাখলে অটো-জেনারেট হবে):</p>
                <input
                  type="text"
                  value={rechargeTrxId}
                  onChange={(e) => setRechargeTrxId(e.target.value)}
                  placeholder="যেমন: GP84758379"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setRechargeReviewingId(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                    ফিরে যান
                  </button>
                  <button onClick={() => handleProcessRecharge(rechargeReviewingId, 'successful', rechargeTrxId)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs">
                    রিচার্জ সফল সম্পন্ন ✅
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recharge Success Animated Modal */}
      <AnimatePresence>
        {rechargeSuccessData && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Animated Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRechargeSuccessData(null)}
              className="absolute inset-0 bg-[#01412F]/40 backdrop-blur-md"
            />

            {/* Success Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-sm w-full border border-emerald-100 dark:border-emerald-950/40 shadow-2xl relative overflow-hidden text-center z-10"
            >
              {/* Confetti Style Sparkles */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-dashed border-emerald-500/10 pointer-events-none"
              />
              
              {/* Success Crown/Tick Icon Badge */}
              <div className="relative flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-900/40"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-14 h-14 rounded-full bg-[#01412F] flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-8 h-8 text-white stroke-[3.5]" />
                  </motion.div>
                </motion.div>
                
                {/* Small floating sparkles */}
                <motion.span 
                  animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  className="absolute top-2 left-1/4 text-lg"
                >
                  ✨
                </motion.span>
                <motion.span 
                  animate={{ y: [0, -12, 0], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: 0.7 }}
                  className="absolute bottom-2 right-1/4 text-lg"
                >
                  🎉
                </motion.span>
              </div>

              {/* Title Header */}
              <h3 className="text-xl font-black text-[#01412F] dark:text-emerald-400 mb-2">
                রিচার্জ সফল হয়েছে!
              </h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-6">
                মোবাইল রিচার্জ ক্লেইমটি অনুমোদিত ও পরিশোধিত হয়েছে
              </p>

              {/* Transaction Details Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2.5 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">মোবাইল নম্বর</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                    {rechargeSuccessData.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">অপারেটর</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#01412F] dark:text-emerald-300 font-black text-[10px] uppercase">
                    {rechargeSuccessData.operator}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">রিচার্জের পরিমাণ</span>
                  <span className="font-black text-[#01412F] dark:text-emerald-400 text-sm">
                    ৳{rechargeSuccessData.amount}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2.5 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400">Trx ID</span>
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {rechargeSuccessData.trxId}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setRechargeSuccessData(null)}
                className="w-full py-3 bg-[#01412F] hover:bg-[#013023] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                প্যানেলে ফিরে যান
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

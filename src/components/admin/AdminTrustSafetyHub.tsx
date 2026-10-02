import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Bot, 
  Sliders, 
  FileCheck2, 
  Users, 
  AlertTriangle, 
  Laptop, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Unlock, 
  Lock, 
  RefreshCw, 
  Eye, 
  UserX, 
  KeyRound, 
  Sparkles, 
  History,
  Activity,
  Smartphone,
  ChevronRight,
  Flame,
  Zap,
  HelpCircle,
  Save
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  getDocs,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserRiskProfile, 
  RiskEvent, 
  AntiSpamRule, 
  AntiSpamAuditLog, 
  SecurityReviewRequest
} from '../../types/antiSpam';
import { AntiSpamEngineService, DEFAULT_ANTI_SPAM_RULES } from '../../services/antiSpamEngine';
import { Security2FAModal } from './modals/Security2FAModal';
import { toast } from 'react-hot-toast';

export const AdminTrustSafetyHub: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'watchlist' | 'bot_signals' | 'rules' | 'appeals' | 'devices' | 'audit'>('watchlist');

  useEffect(() => {
    if (urlTab) {
      if (['watchlist', 'bot_signals', 'rules', 'appeals', 'devices', 'audit'].includes(urlTab)) {
        setActiveTab(urlTab as any);
      } else if (urlTab === 'overview') {
        setActiveTab('watchlist');
      }
    }
  }, [urlTab]);

  // Data States
  const [riskProfiles, setRiskProfiles] = useState<UserRiskProfile[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [spamRules, setSpamRules] = useState<AntiSpamRule[]>(DEFAULT_ANTI_SPAM_RULES);
  const [appeals, setAppeals] = useState<SecurityReviewRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AntiSpamAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  
  // Rule editor state
  const [editingRule, setEditingRule] = useState<AntiSpamRule | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(0);
  const [tempWindow, setTempWindow] = useState<number>(0);

  // 2FA modal state for high-risk actions
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => Promise<void>) | null>(null);
  const [actionTitle2FA, setActionTitle2FA] = useState('');
  const [actionDesc2FA, setActionDesc2FA] = useState('');

  useEffect(() => {
    // 1. Listen to Risk Profiles
    const qProfiles = query(collection(db, 'risk_profiles'), limit(100));
    const unsubProfiles = onSnapshot(qProfiles, (snap) => {
      const list: UserRiskProfile[] = [];
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
      setRiskProfiles(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'user_risk_profiles');
      setLoading(false);
    });

    // 2. Listen to Real-time Risk Events
    const qEvents = query(collection(db, 'risk_events'), limit(100));
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      const list: RiskEvent[] = [];
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRiskEvents(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'risk_events'));

    // 3. Listen to Configurable Rules
    const qRules = query(collection(db, 'spam_rules'));
    const unsubRules = onSnapshot(qRules, (snap) => {
      if (!snap.empty) {
        const list: AntiSpamRule[] = [];
        snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
        setSpamRules(list);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'spam_rules'));

    // 4. Listen to Security Review Appeals
    const qAppeals = query(collection(db, 'security_reviews'), limit(50));
    const unsubAppeals = onSnapshot(qAppeals, (snap) => {
      const list: SecurityReviewRequest[] = [];
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAppeals(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'security_reviews'));

    // 5. Listen to Anti-Spam Audit Logs
    const qAudit = query(collection(db, 'anti_spam_audit_logs'), limit(100));
    const unsubAudit = onSnapshot(qAudit, (snap) => {
      const list: AntiSpamAuditLog[] = [];
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAuditLogs(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'anti_spam_audit_logs'));

    return () => {
      unsubProfiles();
      unsubEvents();
      unsubRules();
      unsubAppeals();
      unsubAudit();
    };
  }, []);

  // Filtered Watchlist
  const filteredProfiles = riskProfiles.filter(p => {
    const matchSearch = !searchQuery || 
      p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchRisk = riskLevelFilter === 'all' || p.riskLevel === riskLevelFilter;
    return matchSearch && matchRisk;
  });

  // Admin Quick Actions
  const handleReleaseRestrictions = async (p: UserRiskProfile) => {
    try {
      await AntiSpamEngineService.executeAdminRiskAction({
        targetUserId: p.userId,
        targetUserName: p.displayName,
        action: 'release_restrictions',
        adminUser: { uid: user?.uid || 'admin', name: user?.displayName || 'অ্যাডমিন' },
        reason: 'অ্যাডমিন প্যানেল থেকে সমস্ত বিধিনিষেধ প্রত্যাহার'
      });
      toast.success(`${p.displayName}-এর বিধিনিষেধ প্রত্যাহার করা হয়েছে।`, { icon: '🔓' });
    } catch (e) {
      toast.error('ব্যর্থ হয়েছে।');
    }
  };

  const handleVerifyCitizenPhone = async (p: UserRiskProfile) => {
    try {
      await AntiSpamEngineService.executeAdminRiskAction({
        targetUserId: p.userId,
        targetUserName: p.displayName,
        action: 'verify_phone',
        adminUser: { uid: user?.uid || 'admin', name: user?.displayName || 'অ্যাডমিন' },
        reason: 'অ্যাডমিন কর্তৃক বিশ্বস্ত মোবাইল ভেরিফিকেশন মঞ্জুর'
      });
      toast.success('মোবাইল ট্রাস্ট ব্যাজ মঞ্জুর হয়েছে!');
    } catch (e) {
      toast.error('ব্যর্থ হয়েছে।');
    }
  };

  const handlePromptLockAccount = (p: UserRiskProfile) => {
    setActionTitle2FA(`অ্যাকাউন্ট সিকিউরিটি লক: ${p.displayName}`);
    setActionDesc2FA(`আপনি এই অ্যাকাউন্টে সাময়িক সিকিউরিটি লক প্রয়োগ করতে যাচ্ছেন। ইউজারকে পুনরায় ভেরিফাই করে আনলক করতে হবে।`);
    setPending2FAAction(() => async () => {
      await AntiSpamEngineService.executeAdminRiskAction({
        targetUserId: p.userId,
        targetUserName: p.displayName,
        action: 'lock_account',
        adminUser: { uid: user?.uid || 'admin', name: user?.displayName || 'অ্যাডমিন' },
        reason: 'সন্দেহভাজন ফেক অ্যাক্টিভিটির কারণে অ্যাডমিন সিকিউরিটি লক'
      });
      toast.success('অ্যাকাউন্টে সিকিউরিটি লক প্রয়োগ করা হয়েছে।');
    });
    setIs2FAModalOpen(true);
  };

  // Rule Save
  const handleSaveRule = async () => {
    if (!editingRule) return;
    try {
      await AntiSpamEngineService.updateRule(
        editingRule.id,
        {
          threshold: tempThreshold,
          timeWindowSeconds: tempWindow
        },
        { uid: user?.uid || 'admin', name: user?.displayName || 'অ্যাডমিন' }
      );
      toast.success(`রুল ${editingRule.ruleCode} সফলভাবে আপডেট হয়েছে!`);
      setEditingRule(null);
    } catch (e) {
      toast.error('রুল আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  // False Positive Resolution
  const handleResolveAppeal = async (appeal: SecurityReviewRequest, isApproved: boolean) => {
    try {
      await AntiSpamEngineService.resolveFalsePositive(
        appeal.id,
        appeal.userId,
        isApproved,
        { uid: user?.uid || 'admin', name: user?.displayName || 'অ্যাডমিন' },
        isApproved ? 'ব্যবহারকারীর আবেদন গ্রহণ করে বিধিনিষেধ প্রত্যাহার করা হয়েছে।' : 'আবেদন পর্যালোচনায় স্প্যামের প্রমাণ বহাল থাকায় বাতিল।'
      );
      toast.success(isApproved ? 'আবেদন অনুমোদিত ও রিলিজ সম্পন্ন!' : 'আবেদন বাতিল করা হয়েছে।');
    } catch (e) {
      toast.error('অ্যাকশন সম্পন্ন করা যায়নি।');
    }
  };

  // Counters
  const criticalCount = riskProfiles.filter(p => p.riskLevel === 'critical').length;
  const highCount = riskProfiles.filter(p => p.riskLevel === 'high').length;
  const restrictedCount = riskProfiles.filter(p => p.status === 'restricted' || p.status === 'locked').length;
  const pendingAppealsCount = appeals.filter(a => a.status === 'pending').length;

  return (
    <div className="w-full space-y-6 text-left pb-16 font-sans text-slate-800">
      
      {/* HEADER WITH REAL-TIME STATS - Cohesive Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 sm:p-8 md:p-10 shadow-xl rounded-3xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ShieldAlert size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-white/20 text-white rounded-2xl border border-white/20 shrink-0">
              <ShieldAlert size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">স্প্যাম, ফেক অ্যাকাউন্ট ও বট কমান্ড সেন্টার</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-emerald-200 border border-white/20 animate-pulse">
                  Trust & Safety Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">বহুস্তরের গতিবেগ নিরীক্ষা, অ্যাকাউন্ট রিস্ক স্কোর ও সার্বিক প্রটেকশন হাব</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('rules')}
              className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-extrabold border border-white/30 transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Sliders size={16} className="text-emerald-700" />
              স্প্যাম রুলস কনফিগার
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>ক্রিটিক্যাল রিস্ক অ্যাকাউন্ট</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-rose-600 font-mono">
              {criticalCount} <span className="text-xs font-normal text-slate-400">টি</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500 font-bold mb-1">হাই রিস্ক ওয়াচলিস্ট</div>
            <div className="text-2xl font-black text-amber-600 font-mono">
              {highCount} <span className="text-xs font-normal text-slate-400">টি</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500 font-bold mb-1">অ্যাক্টিভ রেস্ট্রিকশন</div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {restrictedCount} <span className="text-xs font-normal text-slate-400">টি</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="text-xs text-emerald-800 font-bold mb-1">অপেক্ষমান ভুল শনাক্তকরণ আপিল</div>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {pendingAppealsCount} <span className="text-xs font-normal text-slate-400">টি</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="w-full bg-white rounded-2xl p-1.5 border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shadow-xs">
          {[
            { id: 'watchlist', label: `হাই-রিস্ক ওয়াচলিস্ট (${riskProfiles.length})`, icon: Users },
            { id: 'bot_signals', label: `বট ও গতিবেগ লাইভ স্ট্রিম (${riskEvents.length})`, icon: Bot },
            { id: 'appeals', label: `ভুল শনাক্তকরণ ও আপিল কিউ (${pendingAppealsCount})`, icon: FileCheck2 },
            { id: 'rules', label: `স্প্যাম রুলস ইঞ্জিন (${spamRules.length})`, icon: Sliders },
            { id: 'audit', label: `প্রটেকটেড অডিট লগ (${auditLogs.length})`, icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shrink-0 min-w-max cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: HIGH RISK WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, ইমেইল বা ইউজার আইডি খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={riskLevelFilter}
                  onChange={(e) => setRiskLevelFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold outline-none cursor-pointer"
                >
                  <option value="all">সব রিস্ক লেভেল</option>
                  <option value="critical">🔴 Critical Risk</option>
                  <option value="high">🟠 High Risk</option>
                  <option value="medium">🟡 Medium Risk</option>
                  <option value="low">🟢 Low Risk</option>
                </select>
              </div>
            </div>

            {/* Profiles Grid */}
            <div className="space-y-3">
              {filteredProfiles.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 font-medium shadow-xs">
                  কোনো ঝুঁকিপূর্ণ অ্যাকাউন্ট পাওয়া যায়নি
                </div>
              ) : (
                filteredProfiles.map((prof) => (
                  <div 
                    key={prof.id} 
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition hover:border-slate-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-700 text-lg">
                          {prof.avatarUrl ? (
                            <img src={prof.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            prof.displayName?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          prof.riskLevel === 'critical' ? 'bg-rose-500 animate-pulse' :
                          prof.riskLevel === 'high' ? 'bg-amber-500' :
                          prof.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{prof.displayName}</h4>
                          <span className="text-xs font-mono text-slate-500">({prof.email || prof.userId.slice(0, 8)})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            prof.riskLevel === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            prof.riskLevel === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {prof.riskLevel} Risk
                          </span>
                          {prof.status === 'restricted' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              সীমাবদ্ধ 🚫
                            </span>
                          )}
                          {prof.status === 'locked' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              লকড 🔒
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span>রিস্ক স্কোর: <strong className="text-slate-900 font-mono">{prof.totalScore || 0}/১০০</strong></span>
                          <span>ডিভাইস: <strong className="text-slate-700">{prof.knownDevices?.length || 1} টি</strong></span>
                          <span>ফোন ভেরিফাইড: <strong className={prof.isPhoneVerified ? 'text-emerald-600' : 'text-amber-600'}>{prof.isPhoneVerified ? 'হ্যাঁ' : 'না'}</strong></span>
                          {prof.activeRestrictions?.ruleId && (
                            <span>রুল ট্রিগার: <strong className="text-amber-600 font-mono">{prof.activeRestrictions.ruleId}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                      {prof.status === 'restricted' || prof.status === 'locked' ? (
                        <button
                          onClick={() => handleReleaseRestrictions(prof)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Unlock size={14} />
                          সীমাবদ্ধতা মুক্ত করুন
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePromptLockAccount(prof)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-extrabold border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Lock size={14} />
                          অ্যাকাউন্ট লক
                        </button>
                      )}

                      {!prof.isPhoneVerified && (
                        <button
                          onClick={() => handleVerifyCitizenPhone(prof)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition flex items-center gap-1 cursor-pointer"
                          title="নাগরিক ফোন বিশ্বস্ত হিসেবে চিহ্নিত করুন"
                        >
                          <Smartphone size={14} />
                          ভেরিফাই
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOT & VELOCITY SIGNALS */}
        {activeTab === 'bot_signals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">রিয়েল-টাইম গতিবেগ ও বট ইভেন্ট ফিড</h3>
                <p className="text-xs text-slate-500">সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে শনাক্তকৃত সকল স্প্যাম ও ভেলোসিটি ট্রিগার</p>
              </div>
              <span className="text-xs text-emerald-600 font-mono flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                লাইভ ট্র্যাকিং সক্রিয়
              </span>
            </div>

            <div className="space-y-2">
              {riskEvents.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 font-medium shadow-xs">
                  কোনো বট বা ক্ষতিকর গতিবেগ ইভেন্ট নেই
                </div>
              ) : (
                riskEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        evt.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        evt.severity === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {evt.ruleId}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{evt.userDisplayName}</h4>
                          <span className="text-[11px] text-slate-500">({evt.eventType})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          +{evt.riskScoreAdded} রিস্ক ইস্টার • গতিবেগ: {evt.details?.velocityCount || 1} টি অ্যাকশন • {new Date(evt.createdAt).toLocaleTimeString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                      evt.severity === 'critical' ? 'bg-rose-600 text-white' :
                      evt.severity === 'high' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SPAM RULES CONFIGURATOR */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">অ্যান্টি-স্প্যাম রুলস কনফিগারেটর (Anti-Spam Rules Engine)</h3>
                <p className="text-xs text-slate-500">স্প্যাম ও বট প্রতিরোধের থ্রেশহোল্ড প্যারামিটারসমূহ লাইভ নিয়ন্ত্রণ করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spamRules.map((rule) => (
                <div key={rule.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {rule.ruleCode}
                        </span>
                        <h4 className="text-sm font-black text-slate-900">{rule.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">থ্রেশহোল্ড লিমিট:</span>
                    <span className="text-emerald-700 font-bold">{rule.threshold} বার / {rule.timeWindowSeconds} সেকেন্ড</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">পেনাল্টি: +{rule.penaltyScore} স্কোর</span>
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setTempThreshold(rule.threshold);
                        setTempWindow(rule.timeWindowSeconds);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders size={13} />
                      মান পরিবর্তন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FALSE POSITIVE APPEALS */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">ভুল শনাক্তকরণ ও ইউজার রিভিউ আবেদন</h3>
                <p className="text-xs text-slate-500">ব্যবহারকারীদের প্রদত্ত ব্যাখ্যা ও মডারেটর সিদ্ধান্ত কিউ</p>
              </div>
            </div>

            <div className="space-y-3">
              {appeals.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 font-medium shadow-xs">
                  বর্তমানে কোনো অপেক্ষমান রিভিউ আবেদন নেই
                </div>
              ) : (
                appeals.map((appeal) => (
                  <div key={appeal.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{appeal.userName}</h4>
                        <span className="text-xs text-slate-500">({appeal.userEmail})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
                          রুল: {appeal.ruleTriggered}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        appeal.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        appeal.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appeal.status === 'approved' ? 'মঞ্জুরকৃত ✓' : appeal.status === 'rejected' ? 'বাতিলকৃত ✕' : 'অপেক্ষমান ⏳'}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <strong className="text-rose-700 block mb-1">ব্যবহারকারীর ব্যাখ্যা:</strong>
                      "{appeal.userExplanation}"
                    </div>

                    {appeal.status === 'pending' && (
                      <div className="flex items-center gap-2 justify-end pt-2">
                        <button
                          onClick={() => handleResolveAppeal(appeal, false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
                        >
                          প্রত্যাখ্যান (Reject)
                        </button>
                        <button
                          onClick={() => handleResolveAppeal(appeal, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          অনুমোদন ও রেস্ট্রিকশন মুক্ত করুন
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">অ্যান্টি-স্প্যাম সিকিউরিটি অডিট ট্রেইল (Protected)</h3>
                <p className="text-xs text-slate-500">প্রতিটি স্বয়ংক্রিয় ও ম্যানুয়াল অ্যাকশনের অপরিবর্তনীয় প্রমাণ ও রুল কোড</p>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">[{log.ruleCode}]</span>
                      <span className="text-slate-900 font-bold">{log.actionTaken}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      কর্তা: <strong className="text-slate-700">{log.actorName}</strong> • লক্ষ্য: <strong className="text-slate-700">{log.targetUserName || log.targetUserId}</strong>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString('bn-BD')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              রুল কনফিগার: <span className="text-rose-600 font-mono">{editingRule.ruleCode}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সর্বোচ্চ অনুমোদিত অ্যাকশন (Threshold):</label>
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সময়সীমা উইন্ডো (Time Window in Seconds):</label>
                <input
                  type="number"
                  value={tempWindow}
                  onChange={(e) => setTempWindow(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveRule}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
              >
                <Save size={15} />
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA SECURITY MODAL */}
      <Security2FAModal
        isOpen={is2FAModalOpen}
        onClose={() => {
          setIs2FAModalOpen(false);
          setPending2FAAction(null);
        }}
        onConfirm={async () => {
          if (pending2FAAction) {
            await pending2FAAction();
          }
        }}
        actionTitle={actionTitle2FA}
        actionDescription={actionDesc2FA}
        isSensitive={true}
      />

    </div>
  );
};

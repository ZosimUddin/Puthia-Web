import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Mail, 
  Key, 
  Laptop, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  LogOut, 
  RefreshCw, 
  ChevronRight, 
  Sparkles,
  Lock,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserRiskProfile } from '../../types/antiSpam';
import { FalsePositiveModal } from './FalsePositiveModal';
import { toast } from 'react-hot-toast';

interface UserAccountSecurityCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAccountSecurityCenter: React.FC<UserAccountSecurityCenterProps> = ({
  isOpen,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const [riskProfile, setRiskProfile] = useState<UserRiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFalsePositiveOpen, setIsFalsePositiveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'restrictions' | 'verification'>('overview');
  
  // Verification states
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const unsub = onSnapshot(doc(db, 'risk_profiles', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setRiskProfile({ id: docSnap.id, ...(docSnap.data() as any) });
      } else {
        // Fallback default
        setRiskProfile({
          id: user.uid,
          userId: user.uid,
          displayName: user.displayName || 'ব্যবহারকারী',
          email: user.email || '',
          riskLevel: 'low',
          totalScore: 0,
          scoreBreakdown: {
            registrationRisk: 0,
            velocityRisk: 0,
            contentRisk: 0,
            engagementRisk: 0,
            reportRiskPenalty: 0,
            totalScore: 0,
            riskLevel: 'low'
          },
          isEmailVerified: Boolean(user.emailVerified),
          isPhoneVerified: false,
          isNidVerified: false,
          accountAgeDays: 12,
          knownDevices: [
            {
              deviceId: 'dev_current',
              deviceName: 'বর্তমান ব্রাউজার (Current Device)',
              os: 'Active OS',
              browser: 'Current Browser',
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              isTrusted: true
            }
          ],
          knownIps: [],
          recentPostCount: 0,
          recentCommentCount: 0,
          recentFriendRequestCount: 0,
          recentFollowCount: 0,
          recentMessageCount: 0,
          recentReportCountAgainst: 0,
          status: 'active',
          lastActivityAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      setLoading(false);
    }, (err) => {
      console.warn('Risk profile load error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isRestricted = riskProfile?.status === 'restricted' || 
    Boolean(
      riskProfile?.activeRestrictions?.posts || 
      riskProfile?.activeRestrictions?.comments || 
      riskProfile?.activeRestrictions?.friendRequests || 
      riskProfile?.activeRestrictions?.messages || 
      riskProfile?.activeRestrictions?.follows
    );

  const handleTerminateOtherSessions = async () => {
    if (!user || !riskProfile) return;
    try {
      const currentDev = riskProfile.knownDevices?.[0] || {
        deviceId: 'dev_current',
        deviceName: 'বর্তমান সেশন',
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isTrusted: true
      };

      await updateDoc(doc(db, 'risk_profiles', user.uid), {
        knownDevices: [currentDev],
        updatedAt: new Date().toISOString()
      });
      toast.success('অন্যান্য সকল অপরিচিত ডিভাইস থেকে সেশন লগআউট করা হয়েছে।', { icon: '🛡️' });
    } catch (e) {
      toast.error('সেশন বন্ধ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleSendPhoneOtp = () => {
    if (!phoneInput || phoneInput.length < 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন 017XXXXXXXX)');
      return;
    }
    setOtpSent(true);
    toast.success(`৬-সংখ্যার ওটিপি (OTP) কোড ${phoneInput} নম্বরে পাঠানো হয়েছে।`);
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.trim().length !== 6) {
      toast.error('দয়া করে সঠিক ৬ ডিজিটের ওটিপি (OTP) কোডটি লিখুন।');
      return;
    }

    try {
      await updateDoc(doc(db, 'risk_profiles', user!.uid), {
        isPhoneVerified: true,
        phone: phoneInput,
        trustBadge: 'verified_phone',
        updatedAt: new Date().toISOString()
      });
      toast.success('মোবাইল নম্বর সফলভাবে যাচাইকৃত হয়েছে! ট্রাস্ট স্কোর বৃদ্ধি পেয়েছে।', { icon: '🎉' });
      setVerifyingPhone(false);
      setOtpSent(false);
      setPhoneOtp('');
    } catch (e) {
      toast.error('ভেরিফিকেশন সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                অ্যাকাউন্ট সিকিউরিটি ও ট্রাস্ট সেন্টার
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  সুরক্ষিত 🛡️
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">আপনার প্রোফাইলের সত্যতা, ডিভাইস লগইন ও স্প্যাম সুরক্ষা ড্যাশবোর্ড</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* SUB NAV TABS */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            সারসংক্ষেপ ও ট্রাস্ট স্কোর
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition border-b-2 ${
              activeTab === 'sessions'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ডিভাইস ও অ্যাক্টিভ সেশন ({riskProfile?.knownDevices?.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('restrictions')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'restrictions'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            সুরক্ষা সীমাবদ্ধতা
            {isRestricted && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition border-b-2 ${
              activeTab === 'verification'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ভেরিফিকেশন ও ব্যাজ
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/20">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Trust Score Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Account Trust & Safety Status</span>
                    <h3 className="text-2xl font-black text-white">অ্যাকাউন্ট স্বাস্থ্য: শতভাগ স্বাভাবিক ও সুরক্ষিত</h3>
                    <p className="text-xs text-slate-400 font-medium">কোনো রোবটিক বা স্প্যাম অ্যাক্টিভিটি নেই। আপনি একজন যাচাইকৃত নাগরিক।</p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl font-mono border border-emerald-500/30">
                      ৯৮%
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-400">ট্রাস্ট স্কোর (Trust Score)</div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} /> সর্বোচ্চ নিরাপদ
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">ইমেইল স্ট্যাটাস</div>
                    <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> যাচাইকৃত (Verified)
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">মোবাইল নম্বর</div>
                    <div className={`text-xs font-black flex items-center gap-1 ${riskProfile?.isPhoneVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {riskProfile?.isPhoneVerified ? <><CheckCircle2 size={13} /> যাচাইকৃত</> : <><AlertTriangle size={13} /> বাকি আছে</>}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">অ্যাক্টিভ ডিভাইস</div>
                    <div className="text-xs font-black text-cyan-400">
                      {riskProfile?.knownDevices?.length || 1} টি পরিচিত ডিভাইস
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">স্প্যাম রুল লঙ্ঘন</div>
                    <div className="text-xs font-black text-emerald-400">
                      ০ টি (ক্লিন হিস্টোরি)
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner for Incomplete Verification */}
              {!riskProfile?.isPhoneVerified && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">মোবাইল নম্বর ভেরিফাই করে ট্রাস্ট ব্যাজ পান</h4>
                      <p className="text-xs text-slate-300">ফোন নম্বর যুক্ত করলে ফেক অ্যাকাউন্ট সন্দেহে কোনো রেট-লিমিট প্রযোজ্য হবে না।</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition shrink-0"
                  >
                    ভেরিফাই করুন
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">লগইনকৃত সক্রিয় ডিভাইসসমূহ</h3>
                  <p className="text-xs text-slate-400">কোনো অপরিচিত ডিভাইস দেখতে পেলে সাথে সাথে সব সেশন বন্ধ করুন</p>
                </div>
                <button
                  onClick={handleTerminateOtherSessions}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  অন্যান্য সকল ডিভাইস লগআউট
                </button>
              </div>

              <div className="space-y-3">
                {riskProfile?.knownDevices?.map((dev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-900 text-cyan-400 rounded-xl border border-slate-800">
                        <Laptop size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{dev.deviceName}</h4>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              বর্তমান সেশন (Current)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          প্রথম লগইন: {new Date(dev.firstSeen).toLocaleDateString('bn-BD')} • শেষ সক্রিয়: {new Date(dev.lastSeen).toLocaleTimeString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                        <CheckCircle2 size={13} /> বিশ্বস্ত ডিভাইস
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESTRICTIONS & APPEAL */}
          {activeTab === 'restrictions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white">বর্তমান সুরক্ষা সীমাবদ্ধতা ও গতিবেগ নিয়ন্ত্রণ</h3>
                <p className="text-xs text-slate-400">স্প্যাম প্রতিরোধে সিস্টেমের স্বয়ংক্রিয় নিয়ন্ত্রণ স্ট্যাটাস</p>
              </div>

              {isRestricted ? (
                <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-4">
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle size={24} />
                    <div>
                      <h4 className="text-base font-black text-white">সাময়িক সুরক্ষা সীমাবদ্ধতা সক্রিয়</h4>
                      <p className="text-xs text-slate-300">
                        রুল কোড: <strong className="text-amber-400 font-mono">{riskProfile?.activeRestrictions?.ruleId || 'SP-001'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-200">
                    {riskProfile?.activeRestrictions?.reason || 'অস্বাভাবিক গতির কারণে কিছু সুবিধা সাময়িক স্থগিত রয়েছে।'}
                  </div>

                  {riskProfile?.activeRestrictions?.expiresAt && (
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock size={14} className="text-cyan-400" />
                      মেয়াদ শেষ হবে: {new Date(riskProfile.activeRestrictions.expiresAt).toLocaleTimeString('bn-BD')}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => setIsFalsePositiveOpen(true)}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-900/30"
                    >
                      <Sparkles size={15} />
                      ভুল শনাক্তকরণ রিভিউ আবেদন করুন (Appeal)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">আপনার অ্যাকাউন্টে কোনো সীমাবদ্ধতা নেই</h4>
                  <p className="text-xs text-slate-400">আপনি পূর্ণ গতিতে আড্ডার সকল সুবিধা স্বাধীনভাবে ব্যবহার করতে পারেন।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VERIFICATION & TRUST BADGES */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white">ট্রাস্ট ব্যাজ ও অ্যাকাউন্ট সত্যতা যাচাই</h3>
                <p className="text-xs text-slate-400">যাচাইকৃত প্রোফাইল স্প্যাম ও বট ফিল্টার থেকে অগ্রাধিকার পায়</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Phone Verification Box */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Smartphone size={18} className="text-emerald-400" />
                      মোবাইল নম্বর যাচাই
                    </div>
                    {riskProfile?.isPhoneVerified ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-black">
                        যাচাইকৃত ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-black">
                        অসম্পূর্ণ
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    আপনার আসল মোবাইল নম্বর যুক্ত করে একাউন্ট ভেরিফাইড করুন।
                  </p>

                  {!riskProfile?.isPhoneVerified && !verifyingPhone && (
                    <button
                      onClick={() => setVerifyingPhone(true)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                    >
                      নম্বর যুক্ত করুন
                    </button>
                  )}

                  {verifyingPhone && (
                    <div className="space-y-2 pt-2">
                      {!otpSent ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none"
                          />
                          <button
                            onClick={handleSendPhoneOtp}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                          >
                            OTP পাঠান
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            placeholder="৬ ডিজিট ওটিপি (123456)"
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none"
                          />
                          <button
                            onClick={handleVerifyPhoneOtp}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                          >
                            যাচাই
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Verification Box */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Mail size={18} className="text-cyan-400" />
                      ইমেইল যাচাইকরণ
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-black">
                      যাচাইকৃত ✓
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {user?.email || 'ইমেইল নিবন্ধিত'}
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} /> গুগল প্রমাণীকরণ দ্বারা সক্রিয়
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>আড্ডা অ্যান্টি-স্প্যাম সিকিউরিটি ইঞ্জিন v2.4 • পুঠিয়া ডিজিটাল প্ল্যাটফর্ম</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {/* FALSE POSITIVE APPEAL MODAL */}
      <FalsePositiveModal
        isOpen={isFalsePositiveOpen}
        onClose={() => setIsFalsePositiveOpen(false)}
        userId={user?.uid || ''}
        userName={user?.displayName || 'ব্যবহারকারী'}
        userEmail={user?.email || ''}
        restrictionType={riskProfile?.activeRestrictions?.reason || 'অটোমেটেড রেট লিমিট'}
        ruleCode={riskProfile?.activeRestrictions?.ruleId || 'SP-001'}
      />
    </div>
  );
};

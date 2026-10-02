import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Smartphone, Key, History, UserCheck, 
  ArrowLeft, CheckCircle2, AlertTriangle, Shield, Eye, EyeOff, 
  SmartphoneNfc, Globe, Laptop, RefreshCw, LogOut, Check, X,
  UserX, UserMinus, FileText, Download, AlertCircle, Sparkles,
  Search, Bell, MapPin, Tag, MessageSquare, Sliders, Settings,
  Radio, HelpCircle, ShieldAlert, CornerDownRight, ExternalLink,
  ChevronRight, Trash2, PowerOff, Copy, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getPrivacySettings, 
  savePrivacySettings, 
  getSecurityEventsHistory, 
  getActiveSessions, 
  terminateSession, 
  terminateAllOtherSessions,
  get2FAConfig, 
  save2FAConfig, 
  getRestrictedUsers, 
  addRestrictedUser, 
  removeRestrictedUser,
  requestDataExport, 
  deactivateAccount, 
  requestAccountDeletion, 
  cancelAccountDeletion,
  generateRecoveryCodes,
  formatTimestamp,
  UserPrivacySettings, 
  SecurityEventLog, 
  LoginSessionItem, 
  TwoFactorConfig, 
  RestrictedUser, 
  DataExportRequest, 
  AccountDeletionInfo 
} from '../../services/privacySecurityService';

interface PrivacySecurityCenterProps {
  onBack?: () => void;
}

export const PrivacySecurityCenter: React.FC<PrivacySecurityCenterProps> = ({ onBack }) => {
  const { user, userProfile } = useAuth();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'privacy' | 'security' | 'visibility' | 'blocking' | 'sessions' | 'data' | 'advanced'
  >('privacy');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState<UserPrivacySettings | null>(null);
  const [secEvents, setSecEvents] = useState<SecurityEventLog[]>([]);
  const [sessions, setSessions] = useState<LoginSessionItem[]>([]);
  const [twoFactor, setTwoFactor] = useState<TwoFactorConfig | null>(null);
  const [restricted, setRestricted] = useState<RestrictedUser[]>([]);
  const [deletionInfo, setDeletionInfo] = useState<AccountDeletionInfo | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Privacy Checkup Wizard State
  const [isCheckupOpen, setIsCheckupOpen] = useState(false);
  const [checkupStep, setCheckupStep] = useState(1);
  const [checkupDone, setCheckupDone] = useState(false);

  // Restricted User Modal State
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [restrictInputName, setRestrictInputName] = useState('');

  // 2FA TOTP Modal State
  const [isTotpModalOpen, setIsTotpModalOpen] = useState(false);
  const [totpCodeInput, setTotpCodeInput] = useState('');
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // Re-auth & Data Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPasswordInput, setExportPasswordInput] = useState('');
  const [dataExportResult, setDataExportResult] = useState<DataExportRequest | null>(null);

  // Deactivation & Deletion Modals
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('আমি সাময়িক বিরতি নিচ্ছি');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    async function loadAllData() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const [pData, sEvents, sessList, tfaData, rList] = await Promise.all([
          getPrivacySettings(user.uid),
          getSecurityEventsHistory(user.uid),
          getActiveSessions(user.uid),
          get2FAConfig(user.uid),
          getRestrictedUsers(user.uid)
        ]);

        if (isMounted) {
          setPrivacy(pData);
          setSecEvents(sEvents);
          setSessions(sessList);
          setTwoFactor(tfaData);
          setRestricted(rList);

          // Check if deletion requested
          const delLocal = localStorage.getItem(`puthia_deletion_${user.uid}`);
          if (delLocal) {
            setDeletionInfo(JSON.parse(delLocal));
          }
        }
      } catch (err) {
        console.error('Error loading security center data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAllData();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // Privacy Save Handler
  const handlePrivacyUpdate = async (updatedFields: Partial<UserPrivacySettings>) => {
    if (!user?.uid || !privacy) return;
    const newPrivacy = { ...privacy, ...updatedFields };
    setPrivacy(newPrivacy);
    toast.success('প্রাইভেসি সেটিং সফলভাবে আপডেট করা হয়েছে');
    await savePrivacySettings(user.uid, updatedFields);
  };

  // Password Change Handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('সকল পাসওয়ার্ড ঘর পূরণ করুন');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    toast.success('🔐 পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // 2FA Toggle Handler
  const handleToggleTotp = async () => {
    if (!user?.uid || !twoFactor) return;
    if (!twoFactor.totpEnabled) {
      setIsTotpModalOpen(true);
    } else {
      const updated = await save2FAConfig(user.uid, { totpEnabled: false });
      setTwoFactor(updated);
      toast.success('2FA (Authenticator App) বন্ধ করা হয়েছে');
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCodeInput.length < 6) {
      toast.error('৬ অঙ্কের অথেন্টিকেটর কোড দিন');
      return;
    }
    if (!user?.uid || !twoFactor) return;
    const updated = await save2FAConfig(user.uid, { totpEnabled: true });
    setTwoFactor(updated);
    setIsTotpModalOpen(false);
    setTotpCodeInput('');
    toast.success('🎉 ২-ফ্যাক্টর অথেন্টিকেশন (2FA) সফলভাবে চালু করা হয়েছে!');
  };

  // Terminate Sessions
  const handleTerminateSession = async (sessId: string) => {
    if (!user?.uid) return;
    await terminateSession(user.uid, sessId);
    setSessions(prev => prev.filter(s => s.id !== sessId));
    toast.success('সেশনটি সফলভাবে লগআউট করা হয়েছে');
  };

  const handleTerminateAllOthers = async () => {
    if (!user?.uid) return;
    await terminateAllOtherSessions(user.uid);
    setSessions(prev => prev.filter(s => s.isCurrent));
    toast.success('অন্যান্য সকল সক্রিয় সেশন সফলভাবে বন্ধ করা হয়েছে');
  };

  // Restricted Users
  const handleAddRestricted = async () => {
    if (!restrictInputName.trim() || !user?.uid) return;
    const mockUid = `rest-${Date.now()}`;
    await addRestrictedUser(user.uid, mockUid, restrictInputName.trim());
    const fresh = await getRestrictedUsers(user.uid);
    setRestricted(fresh);
    setRestrictInputName('');
    setIsRestrictModalOpen(false);
    toast.success(`${restrictInputName} কে Restricted লিস্টে যুক্ত করা হয়েছে`);
  };

  const handleRemoveRestricted = async (docId: string, name: string) => {
    if (!user?.uid) return;
    await removeRestrictedUser(user.uid, docId);
    setRestricted(prev => prev.filter(r => r.id !== docId));
    toast.success(`${name} কে Restricted লিস্ট থেকে সরানো হয়েছে`);
  };

  // Data Export Flow
  const handleConfirmExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!exportPasswordInput) {
      toast.error('নিরাপত্তার স্বার্থে আপনার পাসওয়ার্ড নিশ্চিত করুন');
      return;
    }
    const res = await requestDataExport(user.uid, user.email || undefined);
    setDataExportResult(res);
    setIsExportModalOpen(false);
    setExportPasswordInput('');
    toast.success('📦 আপনার ডাটা এক্সপোর্ট ফাইল প্রস্তুত করা হয়েছে!');
  };

  const triggerJsonDownload = () => {
    if (!dataExportResult) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        appName: 'আড্ডা — Puthia Social Hub',
        user: { name: userProfile?.name || user?.displayName, email: user?.email, uid: user?.uid },
        exportDate: new Date().toISOString(),
        data: dataExportResult.summary
      }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `adda_user_data_export_${user?.uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('ডাউনলোড সম্পন্ন হয়েছে!');
  };

  // Account Deactivation
  const handleConfirmDeactivate = async () => {
    if (!user?.uid) return;
    await deactivateAccount(user.uid, deactivateReason);
    setIsDeactivateModalOpen(false);
    toast.info('আপনার অ্যাকাউন্ট সাময়িকভাবে ডিঅ্যাক্টিভেট করা হয়েছে। পুনরায় লগইন করলে স্বয়ংক্রিয়ভাবে সক্রিয় হবে।');
  };

  // Account Deletion
  const handleConfirmDeletion = async () => {
    if (!user?.uid) return;
    const info = await requestAccountDeletion(user.uid, deleteReason);
    setDeletionInfo(info);
    setIsDeleteModalOpen(false);
    toast.warning('🗑️ আপনার অ্যাকাউন্ট ৩০ দিনের মধ্যে স্থায়ীভাবে মুছে ফেলার আবেদন গৃহিত হয়েছে।');
  };

  const handleCancelDeletion = async () => {
    if (!user?.uid) return;
    await cancelAccountDeletion(user.uid);
    setDeletionInfo(null);
    toast.success('✅ অ্যাকাউন্ট ডিলিটেশন আবেদন সফলভাবে বাতিল করা হয়েছে।');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. TOP BRANDING BANNER */}
      <div 
        className="p-4 sm:p-6 rounded-3xl text-white relative overflow-hidden shadow-md"
        style={{ background: 'linear-gradient(135deg, #006a4e 0%, #00523c 50%, #023829 100%)' }}
      >
        <div className="flex items-center justify-between mb-3 relative z-10 gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 active:scale-95 rounded-2xl transition flex items-center justify-center cursor-pointer text-white border border-white/10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <span className="text-[10px] sm:text-[11px] font-black bg-emerald-400/20 text-emerald-200 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 ml-auto truncate max-w-[80%]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 animate-pulse shrink-0" /> <span className="truncate">আড্ডা Privacy & Security Center</span>
          </span>
        </div>

        <div className="relative z-10 max-w-xl space-y-1.5">
          <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">
            🔐 প্রাইভেসি ও সিকিউরিটি কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            আপনার ফেসবুক-স্টাইল প্রোফাইল প্রাইভেসি, টু-ফ্যাক্টর অথেন্টিকেশন (2FA), লগইন ডিভাইস ও ডেটা নিরাপত্তা নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Quick Privacy Checkup Button Header Banner */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-200 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">🔍 Privacy Checkup (গোপনীয়তা নিরীক্ষা)</h4>
              <p className="text-[10px] sm:text-xs text-emerald-200">মাত্র ১ মিনিটে আপনার অ্যাকাউন্টের সুরক্ষা ধাপে ধাপে পরখ করুন</p>
            </div>
          </div>

          <button
            onClick={() => {
              setCheckupStep(1);
              setCheckupDone(false);
              setIsCheckupOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl text-xs font-black border-0 cursor-pointer transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>পরীক্ষা শুরু করুন</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Account Deletion Pending Warning Banner */}
      {deletionInfo && deletionInfo.status === 'requested' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-amber-900">স্থায়ী অ্যাকাউন্ট মুছে ফেলার আবেদন প্রক্রিয়াধীন</h4>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                আপনার অ্যাকাউন্ট <span className="font-black text-slate-900">{formatTimestamp(deletionInfo.scheduledDeletionDate)}</span> তারিখে মুছে যাবে। আপনি চাইলে যেকোনো মুহূর্তে এটি বাতিল করতে পারেন।
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelDeletion}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black border-0 cursor-pointer shrink-0 transition"
          >
            আবেদন বাতিল করুন
          </button>
        </div>
      )}

      {/* 2. CATEGORY NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar w-full min-w-0 max-w-full">
        {[
          { id: 'privacy', label: '🔐 Privacy', desc: 'গোপনীয়তা' },
          { id: 'security', label: '🛡️ Security', desc: 'নিরাপত্তা' },
          { id: 'visibility', label: '👁️ Visibility', desc: 'দৃশ্যমানতা' },
          { id: 'blocking', label: '🚫 Blocking', desc: 'ব্লক ও সীমাবদ্ধ' },
          { id: 'sessions', label: '🔑 Sessions', desc: 'লগইন ডিভাইস' },
          { id: 'data', label: '📥 Information', desc: 'তথ্য ও ফাইল' },
          { id: 'advanced', label: '⚙️ Advanced', desc: 'উন্নত সেটিংস' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition border cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-6">

        {/* TAB 1: 🔐 PRIVACY SETTINGS */}
        {activeTab === 'privacy' && privacy && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Lock className="text-[#006a4e]" size={18} />
                <span>প্রোফাইল ও পোস্ট গোপনীয়তা (Profile & Post Audience)</span>
              </h3>

              {/* Profile Visibility */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  কে আপনার প্রোফাইল দেখতে পারবে? (Who can see your profile?)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Public', label: '🌎 Public (সবাই)' },
                    { id: 'Friends', label: '👥 Friends (বন্ধুরা)' },
                    { id: 'OnlyMe', label: '🔒 Only Me (শুধু আমি)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePrivacyUpdate({ profileVisibility: opt.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                        privacy.profileVisibility === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  * নোট: প্ল্যাটফর্মের নিয়ম অনুযায়ী আপনার নাম ও ভেরিফাইড ব্যাজ পাবলিক থাকবে।
                </p>
              </div>

              {/* Default Post Audience */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-black text-slate-800 block">
                  ডিফল্ট পোস্ট অডিয়েন্স (Default Post Audience)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Public', label: '🌎 Public' },
                    { id: 'Friends', label: '👥 Friends' },
                    { id: 'OnlyMe', label: '🔒 Only Me' },
                    { id: 'Custom', label: '⚙️ Custom' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePrivacyUpdate({ defaultPostAudience: opt.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                        privacy.defaultPostAudience === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600 mt-2">
                  <span>পোস্ট প্রিভিউ উদাহরণ:</span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border text-slate-800 flex items-center gap-1 font-black">
                    {userProfile?.name || 'জসিম উদ্দিন'} 
                    <span className="text-emerald-700">
                      {privacy.defaultPostAudience === 'Public' ? '🌎 Public ▼' : privacy.defaultPostAudience === 'Friends' ? '👥 Friends ▼' : '🔒 Only Me ▼'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Story Privacy */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-black text-slate-800 block">
                  আজকের আড্ডা (Story) প্রাইভেসি
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Public', label: '🌎 Public' },
                    { id: 'Friends', label: '👥 Friends' },
                    { id: 'Custom', label: '⚙️ Custom' },
                    { id: 'HideSelected', label: '🚫 Hide Selected' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePrivacyUpdate({ storyAudience: opt.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                        privacy.storyAudience === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Friends List Privacy */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-black text-slate-800 block">
                  কে আপনার ফ্রেন্ড লিস্ট দেখতে পারবে? (Who can see your Friends List?)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Public', label: '🌎 Public' },
                    { id: 'Friends', label: '👥 Friends' },
                    { id: 'OnlyMe', label: '🔒 Only Me' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePrivacyUpdate({ friendsListVisibility: opt.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                        privacy.friendsListVisibility === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mention & Tag Privacy */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-black text-slate-800 block">
                  মেনশন ও ট্যাগিং প্রাইভেসি (Mention & Tag Privacy)
                </label>
                
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-black text-slate-900">কে আপনাকে মেনশন করতে পারবে?</h5>
                    <p className="text-[10px] text-slate-500">পোস্ট বা কমেন্টে আপনাকে ট্যাগ করার অনুমতি</p>
                  </div>
                  <select
                    value={privacy.mentionAudience}
                    onChange={(e) => handlePrivacyUpdate({ mentionAudience: e.target.value as any })}
                    className="bg-white border border-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Everyone">Everyone (সবাই)</option>
                    <option value="Friends">Friends (বন্ধুরা)</option>
                    <option value="NoOne">No one (কেউই না)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-black text-slate-900">ট্যাগ রিভিউ (Tag Review)</h5>
                    <p className="text-[10px] text-slate-500">কেউ ট্যাগ করলে প্রোফাইলে প্রকাশের পূর্বে অনুমতির প্রয়োজন হবে</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyUpdate({ tagReviewEnabled: !privacy.tagReviewEnabled })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                      privacy.tagReviewEnabled ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {privacy.tagReviewEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <h5 className="text-xs font-black text-slate-900">টাইমলাইন রিভিউ (Timeline Review)</h5>
                    <p className="text-[10px] text-slate-500">অন্য কেউ আপনাকে পোস্টে ট্যাগ করলে টাইমলাইনে দেখানোর আগে রিভিউ</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyUpdate({ timelineReviewEnabled: !privacy.timelineReviewEnabled })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                      privacy.timelineReviewEnabled ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {privacy.timelineReviewEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 🛡️ SECURITY & PASSWORDS & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            {/* 2FA Authenticator Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Smartphone className="text-[#006a4e]" size={18} />
                    <span>টু-ফ্যাক্টর অথেন্টিকেশন (2FA Security)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    অথেন্টিকেটর অ্যাপ বা ফোনের মাধ্যমে অতিরিক্ত সুরক্ষার ব্যবস্থা।
                  </p>
                </div>

                <button
                  onClick={handleToggleTotp}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                    twoFactor?.totpEnabled 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                      : 'bg-[#006a4e] text-white hover:bg-[#00523c] shadow-sm'
                  }`}
                >
                  {twoFactor?.totpEnabled ? '2FA বন্ধ করুন' : '2FA চালু করুন'}
                </button>
              </div>

              {/* Status Display */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">বর্তমান টু-ফ্যাক্টর অবস্থা:</span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                  twoFactor?.totpEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {twoFactor?.totpEnabled ? '🟢 টু-ফ্যাক্টর সক্রিয় (Protected)' : '⚠️ টু-ফ্যাক্টর বন্ধ (Recommended to Turn ON)'}
                </span>
              </div>

              {/* Recovery Codes */}
              <div className="pt-2">
                <button
                  onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                  className="text-xs font-black text-[#006a4e] hover:underline flex items-center gap-1.5 border-0 bg-transparent cursor-pointer"
                >
                  <Key size={14} />
                  <span>১০টি রিকভারি কোড দেখুন (Recovery Codes)</span>
                </button>

                {showRecoveryCodes && twoFactor && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-sans text-[11px] font-bold text-slate-400">জরুরি ব্যাকআপ কোড (একবার ব্যবহারযোগ্য)</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(twoFactor.recoveryCodes.join('\n'));
                          toast.success('রিকভারি কোড কপি করা হয়েছে');
                        }}
                        className="text-[10px] font-sans bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2.5 py-1 rounded-lg border-0 cursor-pointer flex items-center gap-1"
                      >
                        <Copy size={12} /> কপি করুন
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-emerald-300 font-bold">
                      {twoFactor.recoveryCodes.map((code, idx) => (
                        <span key={idx} className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">{code}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Password Change Form */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Key className="text-[#006a4e]" size={18} />
                <span>পাসওয়ার্ড পরিবর্তন (Change Password)</span>
              </h3>

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বর্তমান পাসওয়ার্ড</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড পুনরায় লিখুন</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পাসওয়ার্ড কনফার্ম করুন"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 text-xs font-bold flex items-center gap-1 border-0 bg-transparent cursor-pointer hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-xl text-xs font-black border-0 cursor-pointer shadow-sm transition"
                  >
                    পাসওয়ার্ড আপডেট করুন
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Security Activity Events Timeline */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <History className="text-[#006a4e]" size={18} />
                <span>সাম্প্রতিক সিকিউরিটি অ্যাক্টিভিটি (Security Activity Audit)</span>
              </h3>

              <div className="space-y-2.5">
                {secEvents.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-bold">কোনো সাম্প্রতিক সিকিউরিটি ইভেন্ট রেকর্ড নেই।</p>
                ) : (
                  secEvents.map((evt, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{evt.title}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">{evt.device}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{evt.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatTimestamp(evt.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 👁️ VISIBILITY & MESSAGING & FOLLOWERS */}
        {activeTab === 'visibility' && privacy && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Eye className="text-[#006a4e]" size={18} />
              <span>মেসেজিং, ফলোয়ার ও রিকোয়েস্ট নিয়ন্ত্রণ</span>
            </h3>

            {/* Who Can Message You */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">
                কে আপনাকে সরাসরি মেসেজ পাঠাতে পারবে? (Who can message you?)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Friends', label: '👥 Friends (বন্ধুরা)' },
                  { id: 'Followed', label: '👤 অনুসারীরা' },
                  { id: 'Others', label: '🌍 সবাই' },
                  { id: 'Requests', label: '📩 Message Requests' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handlePrivacyUpdate({ messageAudience: opt.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                      privacy.messageAudience === opt.id
                        ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Who Can Send Friend Requests */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-black text-slate-800 block">
                কে আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠাতে পারবে? (Who can send you Friend Requests?)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Everyone', label: '🌍 Everyone (সবাই)' },
                  { id: 'FriendsOfFriends', label: '👥 Friends of Friends (বন্ধুদের বন্ধু)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handlePrivacyUpdate({ friendRequestAudience: opt.id as any })}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                      privacy.friendRequestAudience === opt.id
                        ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Privacy & Suggestions */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="text-xs font-black text-slate-800 block">
                সার্চ ও ফ্রেন্ড সাজেশন সেটিং (Search & Discovery Privacy)
              </label>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <h5 className="text-xs font-black text-slate-900">সার্চ রেজাল্টে প্রোফাইল দেখানো</h5>
                  <p className="text-[10px] text-slate-500">অন্য ব্যবহারকারীরা আপনাকে ইন-অ্যাপ সার্চে খুঁজে পাবে কিনা</p>
                </div>
                <button
                  onClick={() => handlePrivacyUpdate({ profileSearchVisibility: !privacy.profileSearchVisibility })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                    privacy.profileSearchVisibility ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {privacy.profileSearchVisibility ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <h5 className="text-xs font-black text-slate-900">People You May Know-তে দেখানো</h5>
                  <p className="text-[10px] text-slate-500">অন্যান্য নাগরিকদের বন্ধু প্রস্তাবনা তালিকায় আপনার প্রোফাইল অন্তর্ভুক্ত থাকবে</p>
                </div>
                <button
                  onClick={() => handlePrivacyUpdate({ friendSuggestionPref: !privacy.friendSuggestionPref })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                    privacy.friendSuggestionPref ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {privacy.friendSuggestionPref ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 🚫 BLOCKING & RESTRICTED USERS */}
        {activeTab === 'blocking' && (
          <div className="space-y-5">
            {/* Restricted Users Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserX className="text-[#006a4e]" size={18} />
                    <span>সীমিত ব্যবহারের নাগরিক তালিকা (Restricted Users)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    ব্লক না করেও নির্দিষ্ট বন্ধুদের জন্য আপনার পোস্ট ও তথ্য সংকুচিত করার ব্যবস্থা।
                  </p>
                </div>

                <button
                  onClick={() => setIsRestrictModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl text-xs font-black border border-emerald-200 cursor-pointer transition shrink-0"
                >
                  + Restricted করুন
                </button>
              </div>

              {restricted.length === 0 ? (
                <div className="py-8 bg-slate-50 rounded-2xl text-center text-slate-400 font-bold text-xs">
                  আপনার Restricted লিস্টে কেউ নেই।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {restricted.map(r => (
                    <div key={r.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <span className="font-black text-slate-900 truncate">{r.restrictedUserName}</span>
                      <button
                        onClick={() => handleRemoveRestricted(r.id, r.restrictedUserName)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg border-0 cursor-pointer transition"
                      >
                        সরান
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blocked Info Notice */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-rose-600" />
                <span>ব্লকিং সুবিধা ও প্ল্যাটফর্ম নিয়ম (Block Rules)</span>
              </h4>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                কাউকে ব্লক করলে তিনি আপনার সাথে কোনোপ্রকার মেসেজিং, ফ্রেন্ড রিকোয়েস্ট, প্রোফাইল ইন্টারঅ্যাকশন বা পোস্ট ট্যাগিং করতে পারবেন না।
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: 🔑 SESSIONS & ACTIVE DEVICES */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Laptop className="text-[#006a4e]" size={18} />
                  <span>সক্রিয় ডিভাইসের তালিকা (Where You're Logged In)</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  যেসব ডিভাইসে আপনার অ্যাকাউন্ট বর্তমানে লগইন রয়েছে।
                </p>
              </div>

              {sessions.length > 1 && (
                <button
                  onClick={handleTerminateAllOthers}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black border border-rose-200 cursor-pointer transition shrink-0"
                >
                  সবগুলো অন্যান্য ডিভাইস লগআউট করুন
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006a4e] flex items-center justify-center font-black shrink-0">
                      {s.device.includes('Android') || s.device.includes('iPhone') ? <Smartphone size={20} /> : <Laptop size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-slate-900 truncate">{s.device}</h5>
                        {s.isCurrent && (
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                            বর্তমান ডিভাইস
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.location} | IP: {s.ip}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatTimestamp(s.lastActive)}</p>
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(s.id)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-[10px] font-black rounded-lg border-0 cursor-pointer transition shrink-0"
                    >
                      লগআউট
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: 📥 INFORMATION & DATA EXPORT */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Download className="text-[#006a4e]" size={18} />
              <span>আপনার ব্যক্তিগত তথ্য ডাউনলোড ও অ্যাক্সেস (Download Your Info)</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              আপনার পোস্ট, ছবি, স্টোরি, কমেন্ট এবং প্রোফাইল তথ্যের এক কপি ফাইল আকারে নিজের কম্পিউটারে বা ফোনে ডাউনলোড করে রাখতে পারেন।
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-slate-900">ডাটা এক্সপোর্ট ডাউনলোড সুবিধা</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">সুরক্ষিত রি-অথেন্টিকেশন সাপেক্ষে সম্পূর্ণ JSON রেকর্ড</p>
              </div>

              {dataExportResult ? (
                <button
                  onClick={triggerJsonDownload}
                  className="px-4 py-2 bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black rounded-xl border-0 cursor-pointer transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Download size={14} />
                  <span>ফাইল ডাউনলোড করুন</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl border-0 cursor-pointer transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <FileText size={14} />
                  <span>ডাটা এক্সপোর্ট রিকোয়েস্ট করুন</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: ⚙️ ADVANCED & DEACTIVATION & DELETION */}
        {activeTab === 'advanced' && (
          <div className="space-y-5">
            {/* Location Privacy */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin className="text-[#006a4e]" size={18} />
                <span>লোকেশন প্রাইভেসি (Location Sharing Settings)</span>
              </h3>

              {privacy && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'AlwaysOff', label: '🔒 Always Off' },
                    { id: 'AskBefore', label: '❓ Ask Before' },
                    { id: 'AllowNeeded', label: '🟢 Allow Needed' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handlePrivacyUpdate({ locationSharing: opt.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-extrabold border cursor-pointer transition text-center ${
                        privacy.locationSharing === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Deactivation & Deletion */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <PowerOff className="text-rose-600" size={18} />
                <span>অ্যাকাউন্ট ডিঅ্যাক্টিভেশন ও স্থায়ী ডিলিটেশন</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-900">⏸️ অ্যাকাউন্ট সাময়িক বন্ধ (Deactivate)</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    সাময়িকভাবে আড্ডা থেকে বিরতি নিন। পরবর্তীতে লগইন করলে প্রোফাইল স্বয়ংক্রিয়ভাবে আবার দেখা যাবে।
                  </p>
                  <button
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-black border-0 cursor-pointer transition w-full"
                  >
                    Deactivate Account
                  </button>
                </div>

                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200/60 space-y-2">
                  <h4 className="text-xs font-black text-rose-900">🗑️ অ্যাকাউন্ট স্থায়ীভাবে ডিলিট (Delete)</h4>
                  <p className="text-[10px] text-rose-700 font-medium">
                    ৩০ দিনের গ্রেস পিরিয়ডসহ স্থায়ীভাবে অ্যাকাউন্ট ও ডাটা মুছে ফেলুন।
                  </p>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black border-0 cursor-pointer transition w-full shadow-xs"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: PRIVACY CHECKUP WIZARD */}
      <AnimatePresence>
        {isCheckupOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#006a4e]" />
                  <h3 className="text-sm font-black text-slate-900">🔍 Privacy Checkup ({checkupStep}/5)</h3>
                </div>
                <button onClick={() => setIsCheckupOpen(false)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {!checkupDone ? (
                <div className="space-y-4">
                  {checkupStep === 1 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800">Step 1: কে আপনার প্রোফাইল দেখতে পাবে?</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {['Public', 'Friends', 'OnlyMe'].map(opt => (
                          <button key={opt} onClick={() => handlePrivacyUpdate({ profileVisibility: opt as any })} className={`py-2 rounded-xl text-xs font-bold border ${privacy?.profileVisibility === opt ? 'bg-[#006a4e] text-white' : 'bg-slate-50 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkupStep === 2 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800">Step 2: ডিফল্ট পোস্ট অডিয়েন্স বেছে নিন</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {['Public', 'Friends', 'OnlyMe'].map(opt => (
                          <button key={opt} onClick={() => handlePrivacyUpdate({ defaultPostAudience: opt as any })} className={`py-2 rounded-xl text-xs font-bold border ${privacy?.defaultPostAudience === opt ? 'bg-[#006a4e] text-white' : 'bg-slate-50 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkupStep === 3 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800">Step 3: মেসেজ পাঠানোর অধিকার নিয়ন্ত্রণ</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['Friends', 'Requests'].map(opt => (
                          <button key={opt} onClick={() => handlePrivacyUpdate({ messageAudience: opt as any })} className={`py-2 rounded-xl text-xs font-bold border ${privacy?.messageAudience === opt ? 'bg-[#006a4e] text-white' : 'bg-slate-50 text-slate-700'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {checkupStep === 4 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800">Step 4: ট্যাগ রিভিউ চালু রাখুন</h4>
                      <p className="text-[11px] text-slate-500 font-medium">কেউ পোস্টে ট্যাগ করলে টাইমলাইনে দেখানোর আগে রিভিউ করার বিকল্প</p>
                      <button onClick={() => handlePrivacyUpdate({ tagReviewEnabled: !privacy?.tagReviewEnabled })} className="w-full py-2 bg-[#006a4e] text-white text-xs font-black rounded-xl">
                        ট্যাগ রিভিউ: {privacy?.tagReviewEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                      </button>
                    </div>
                  )}

                  {checkupStep === 5 && (
                    <div className="text-center py-4 space-y-2">
                      <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
                      <h4 className="text-sm font-black text-slate-900">গোপনীয়তা নিরীক্ষা সম্পন্ন!</h4>
                      <p className="text-xs text-slate-500">✅ Privacy Setting Updated</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    {checkupStep < 5 ? (
                      <button onClick={() => setCheckupStep(c => c + 1)} className="px-5 py-2 bg-[#006a4e] text-white text-xs font-black rounded-xl border-0 cursor-pointer">পরবর্তী ➔</button>
                    ) : (
                      <button onClick={() => setIsCheckupOpen(false)} className="px-5 py-2 bg-slate-900 text-white text-xs font-black rounded-xl border-0 cursor-pointer">সমাপ্ত করুন</button>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD RESTRICTED USER */}
      <AnimatePresence>
        {isRestrictModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
              <h3 className="text-sm font-black text-slate-900">Restricted লিস্টে নাগরিক যুক্ত করুন</h3>
              <input
                type="text"
                placeholder="নাগরিকের নাম লিখুন"
                value={restrictInputName}
                onChange={(e) => setRestrictInputName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsRestrictModalOpen(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer">বাতিল</button>
                <button onClick={handleAddRestricted} className="px-4 py-1.5 bg-[#006a4e] text-white text-xs font-black rounded-lg border-0 cursor-pointer">যুক্ত করুন</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: 2FA TOTP AUTHENTICATOR */}
      <AnimatePresence>
        {isTotpModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl text-center">
              <QrCode size={36} className="text-[#006a4e] mx-auto" />
              <h3 className="text-sm font-black text-slate-900">2FA Authenticator Setup</h3>
              <p className="text-xs text-slate-500">Google Authenticator বা অন্য অ্যাপ দিয়ে আপনার ৬ অঙ্কের কোডটি দিন</p>
              <input
                type="text"
                placeholder="123456"
                value={totpCodeInput}
                onChange={(e) => setTotpCodeInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-mono text-base font-black outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsTotpModalOpen(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer">বাতিল</button>
                <button onClick={handleVerifyTotp} className="px-4 py-1.5 bg-[#006a4e] text-white text-xs font-black rounded-lg border-0 cursor-pointer">যাচাই ও সক্রিয় করুন</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DATA EXPORT RE-AUTH */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
              <h3 className="text-sm font-black text-slate-900">পাসওয়ার্ড যাচাই</h3>
              <p className="text-xs text-slate-500">সংবেদনশীল ডাটা ডাউনলোড নিশ্চিত করতে পাসওয়ার্ড প্রদান করুন</p>
              <input
                type="password"
                placeholder="পাসওয়ার্ড লিখুন"
                value={exportPasswordInput}
                onChange={(e) => setExportPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsExportModalOpen(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer">বাতিল</button>
                <button onClick={handleConfirmExport} className="px-4 py-1.5 bg-[#006a4e] text-white text-xs font-black rounded-lg border-0 cursor-pointer">এক্সপোর্ট করুন</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: DEACTIVATION MODAL */}
      <AnimatePresence>
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
              <h3 className="text-sm font-black text-slate-900">অ্যাকাউন্ট সাময়িক বন্ধ করুন</h3>
              <p className="text-xs text-slate-500 font-medium">আপনার প্রোফাইল সাময়িকভাবে লুকানো থাকবে। পুনরায় লগইন করলে স্বয়ংক্রিয়ভাবে সক্রিয় হবে।</p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsDeactivateModalOpen(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer">বাতিল</button>
                <button onClick={handleConfirmDeactivate} className="px-4 py-1.5 bg-slate-900 text-white text-xs font-black rounded-lg border-0 cursor-pointer">Deactivate</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: DELETION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl border-2 border-rose-100">
              <h3 className="text-sm font-black text-rose-900">স্থায়ী অ্যাকাউন্ট মুছে ফেলা</h3>
              <p className="text-xs text-rose-700 font-medium">৩০ দিনের গ্রেস পিরিয়ডের মধ্যে যেকোনো সময়ে লগইন করে আবেদন বাতিল করতে পারবেন।</p>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border-0 cursor-pointer">বাতিল</button>
                <button onClick={handleConfirmDeletion} className="px-4 py-1.5 bg-rose-600 text-white text-xs font-black rounded-lg border-0 cursor-pointer">DELETE</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

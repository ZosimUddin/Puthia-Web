import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  Search, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  Clock, 
  User, 
  FileText, 
  MessageSquare, 
  Store, 
  Radio, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  RefreshCw, 
  RotateCcw, 
  AlertOctagon, 
  ExternalLink, 
  Plus, 
  Send, 
  BarChart2, 
  ListOrdered, 
  Layers, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Shield, 
  Award,
  Users,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminRole } from '../../types/admin';
import { 
  ModerationCase, 
  ReportStatus, 
  ReportPriority, 
  ReportCategory, 
  ReportableContentType, 
  ModerationActionType, 
  UserRestrictionFeature, 
  ModeratorNote, 
  UserEnforcementHistory, 
  Appeal, 
  ModerationAnalytics,
  ModerationActionRecord 
} from '../../types/moderation';
import { 
  fetchModerationCases, 
  fetchModerationCaseById, 
  assignModeratorToCase, 
  takeModerationAction, 
  issueUserWarning, 
  setUserRestriction, 
  liftUserRestriction, 
  suspendUserAccount, 
  banUserPermanently, 
  fetchAppeals, 
  reviewAppeal, 
  addModeratorNote, 
  fetchModeratorNotes, 
  getUserEnforcementHistory, 
  fetchModerationAnalytics 
} from '../../services/moderationService';
import { fetchAuditLogs } from '../../services/adminService';
import { AdminAuditLog } from '../../types/admin';
import { REPORT_CATEGORIES } from '../../data/reportReasons';
import { Security2FAModal } from './modals/Security2FAModal';
import { toast } from 'react-hot-toast';

type ModerationTab = 
  | 'new' 
  | 'critical' 
  | 'reviewing' 
  | 'assigned_to_me' 
  | 'resolved' 
  | 'appeals' 
  | 'user_enforcement' 
  | 'analytics' 
  | 'audit_logs';

export const AddaModerationCenter: React.FC = () => {
  const { user, userProfile } = useAuth();

  const currentUserRole: AdminRole = useMemo(() => {
    const r = (userProfile?.role as AdminRole) || 'user';
    if (r === 'super_admin' || user?.email === 'mdzosimuddin47@gmail.com') return 'super_admin';
    if (r === 'admin') return 'admin';
    if (r === 'moderator') return 'moderator';
    if (r === 'support') return 'support';
    return 'super_admin'; // Fallback for authorized staff
  }, [userProfile, user]);

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<ModerationTab>('new');

  useEffect(() => {
    if (urlTab) {
      if (['new', 'critical', 'reviewing', 'assigned_to_me', 'resolved', 'appeals', 'user_enforcement', 'analytics', 'audit_logs'].includes(urlTab)) {
        setActiveTab(urlTab as ModerationTab);
      } else if (urlTab === 'posts') {
        setActiveTab('new');
      }
    }
  }, [urlTab]);
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [analytics, setAnalytics] = useState<ModerationAnalytics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [filterContentType, setFilterContentType] = useState<ReportableContentType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<ReportPriority | 'all'>('all');

  // Active Selected Case for Detailed Review Drawer
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null);
  const [caseNotes, setCaseNotes] = useState<ModeratorNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [authorHistory, setAuthorHistory] = useState<UserEnforcementHistory | null>(null);

  // Action states inside Drawer
  const [actionReason, setActionReason] = useState('');
  const [actionDetails, setActionDetails] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<UserRestrictionFeature[]>([]);
  const [suspensionDuration, setSuspensionDuration] = useState<'1h' | '24h' | '7d' | '30d' | 'custom'>('24h');
  const [customSuspensionHours, setCustomSuspensionHours] = useState(48);

  // 2FA Modal state for Permanent Ban
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pendingBanExecution, setPendingBanExecution] = useState<{
    targetUid: string;
    targetName: string;
    reason: string;
    caseId?: string;
  } | null>(null);

  // User Enforcement lookup tab
  const [lookupUid, setLookupUid] = useState('');
  const [lookupResult, setLookupResult] = useState<UserEnforcementHistory | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load Main Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [casesData, appealsData, analyticsData, logsData] = await Promise.all([
        fetchModerationCases(),
        fetchAppeals(),
        fetchModerationAnalytics(),
        fetchAuditLogs()
      ]);
      setCases(casesData);
      setAppeals(appealsData);
      setAnalytics(analyticsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error loading moderation data:', err);
      toast.error('মডারেশন ডাটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When a case is selected, load its internal notes & author history
  useEffect(() => {
    if (selectedCase) {
      setActionReason(selectedCase.primaryReasonLabel || '');
      setActionDetails('');
      setWarningMessage('');
      setSelectedRestrictions([]);
      
      // Load notes
      fetchModeratorNotes(selectedCase.id).then(setCaseNotes);

      // Load author enforcement history
      if (selectedCase.contentAuthorUid) {
        getUserEnforcementHistory(selectedCase.contentAuthorUid).then(setAuthorHistory);
      } else {
        setAuthorHistory(null);
      }
    }
  }, [selectedCase]);

  // Tab Filtered Cases
  const tabFilteredCases = useMemo(() => {
    let list = [...cases];

    // Tab category filter
    if (activeTab === 'new') {
      list = list.filter(c => c.status === 'submitted');
    } else if (activeTab === 'critical') {
      list = list.filter(c => (c.priority === 'critical' || c.priority === 'high') && c.status !== 'resolved');
    } else if (activeTab === 'reviewing') {
      list = list.filter(c => c.status === 'under_review');
    } else if (activeTab === 'assigned_to_me') {
      list = list.filter(c => c.assignedModeratorUid === user?.uid && c.status !== 'resolved');
    } else if (activeTab === 'resolved') {
      list = list.filter(c => c.status === 'resolved' || c.status === 'no_violation' || c.status === 'action_taken');
    }

    // Top filters
    if (filterCategory !== 'all') {
      list = list.filter(c => c.primaryCategory === filterCategory);
    }
    if (filterContentType !== 'all') {
      list = list.filter(c => c.contentType === filterContentType);
    }
    if (filterPriority !== 'all') {
      list = list.filter(c => c.priority === filterPriority);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        (c.contentTitle || '').toLowerCase().includes(q) ||
        (c.contentSnippet || '').toLowerCase().includes(q) ||
        (c.contentAuthorName || '').toLowerCase().includes(q) ||
        c.reporters.some(r => r.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [cases, activeTab, filterCategory, filterContentType, filterPriority, searchQuery, user]);

  // Assign to Me Quick Action
  const handleAssignToMe = async (caseItem: ModerationCase) => {
    try {
      await assignModeratorToCase({
        caseId: caseItem.id,
        moderatorUid: user?.uid || 'mod-admin',
        moderatorName: userProfile?.name || user?.displayName || 'Moderator',
        moderatorRole: currentUserRole,
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Moderator'
      });
      toast.success(`কেস #${caseItem.id} আপনার কিউতে অ্যাসাইন করা হয়েছে`);
      loadData();
    } catch (err) {
      toast.error('অ্যাসাইন করতে সমস্যা হয়েছে');
    }
  };

  // Add Internal Staff Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteText.trim()) return;

    try {
      const note = await addModeratorNote({
        caseId: selectedCase.id,
        contentId: selectedCase.contentId,
        note: newNoteText.trim(),
        authorUid: user?.uid || 'mod-admin',
        authorName: userProfile?.name || user?.displayName || 'Moderator',
        authorRole: currentUserRole
      });
      setCaseNotes(prev => [...prev, note]);
      setNewNoteText('');
      toast.success('অভ্যন্তরীণ নোট যুক্ত করা হয়েছে');
    } catch (err) {
      toast.error('নোট যুক্ত করতে সমস্যা হয়েছে');
    }
  };

  // Execute Moderation Action (Hide, Remove, Restore, No Violation)
  const handleExecuteAction = async (action: ModerationActionType) => {
    if (!selectedCase) return;

    try {
      const res = await takeModerationAction({
        caseId: selectedCase.id,
        action,
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Moderator',
        actorRole: currentUserRole,
        reason: actionReason || selectedCase.primaryReasonLabel,
        details: actionDetails
      });

      toast.success(res.message);
      setSelectedCase(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে');
    }
  };

  // Issue Warning
  const handleIssueWarning = async () => {
    if (!selectedCase || !selectedCase.contentAuthorUid) {
      toast.error('কন্টেন্ট লেখকের তথ্য পাওয়া যায়নি');
      return;
    }

    try {
      await issueUserWarning({
        targetUid: selectedCase.contentAuthorUid,
        targetName: selectedCase.contentAuthorName || 'User',
        caseId: selectedCase.id,
        reason: actionReason || 'কমিউনিটি নীতিমালা লঙ্ঘন',
        violationCategory: selectedCase.primaryCategory,
        message: warningMessage || 'অনুগ্রহ করে পুঠিয়া কমিউনিটি নির্দেশিকা মেনে চলুন। অন্যথায় আপনার অ্যাকাউন্ট স্থগিত হতে পারে।',
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Moderator',
        actorRole: currentUserRole
      });

      toast.success(`ইউজার ${selectedCase.contentAuthorName}-কে সতর্কবার্তা পাঠানো হয়েছে`);
      if (selectedCase.contentAuthorUid) {
        getUserEnforcementHistory(selectedCase.contentAuthorUid).then(setAuthorHistory);
      }
    } catch (err) {
      toast.error('সতর্কবার্তা পাঠাতে সমস্যা হয়েছে');
    }
  };

  // Apply Restriction
  const handleApplyRestriction = async () => {
    if (!selectedCase || !selectedCase.contentAuthorUid) {
      toast.error('কন্টেন্ট লেখকের তথ্য পাওয়া যায়নি');
      return;
    }
    if (selectedRestrictions.length === 0) {
      toast.error('অন্তত একটি ফিচার সিলেক্ট করুন');
      return;
    }

    try {
      await setUserRestriction({
        targetUid: selectedCase.contentAuthorUid,
        targetName: selectedCase.contentAuthorName || 'User',
        features: selectedRestrictions,
        reason: actionReason || 'কমিউনিটি নীতি লঙ্ঘন',
        durationHours: 72, // 3 days default
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Moderator',
        actorRole: currentUserRole,
        caseId: selectedCase.id
      });

      toast.success('ফিচার সীমাবদ্ধতা সফলভাবে প্রয়োগ করা হয়েছে');
      if (selectedCase.contentAuthorUid) {
        getUserEnforcementHistory(selectedCase.contentAuthorUid).then(setAuthorHistory);
      }
    } catch (err) {
      toast.error('সীমাবদ্ধতা প্রয়োগ করতে সমস্যা হয়েছে');
    }
  };

  // Suspend Account
  const handleSuspendAccount = async () => {
    if (!selectedCase || !selectedCase.contentAuthorUid) {
      toast.error('কন্টেন্ট লেখকের তথ্য পাওয়া যায়নি');
      return;
    }

    try {
      await suspendUserAccount({
        targetUid: selectedCase.contentAuthorUid,
        targetName: selectedCase.contentAuthorName || 'User',
        durationType: suspensionDuration,
        customHours: customSuspensionHours,
        reason: actionReason || 'গুরুতর বা বারবার নীতিমালা লঙ্ঘন',
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Moderator',
        actorRole: currentUserRole,
        caseId: selectedCase.id
      });

      toast.success(`অ্যাকাউন্ট সফলভাবে স্থগিত করা হয়েছে (${suspensionDuration})`);
      if (selectedCase.contentAuthorUid) {
        getUserEnforcementHistory(selectedCase.contentAuthorUid).then(setAuthorHistory);
      }
    } catch (err) {
      toast.error('অ্যাকাউন্ট স্থগিত করতে সমস্যা হয়েছে');
    }
  };

  // Trigger Permanent Ban Flow (2FA Protected)
  const handleTriggerPermanentBan = () => {
    if (!selectedCase || !selectedCase.contentAuthorUid) {
      toast.error('কন্টেন্ট লেখকের তথ্য পাওয়া যায়নি');
      return;
    }
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      toast.error('শুধুমাত্র অ্যাডমিন বা সুপার অ্যাডমিন স্থায়ী ব্যান প্রয়োগ করতে পারেন');
      return;
    }

    setPendingBanExecution({
      targetUid: selectedCase.contentAuthorUid,
      targetName: selectedCase.contentAuthorName || 'User',
      reason: actionReason || 'চরম কমিউনিটি নীতিমালা লঙ্ঘন ও জালিয়াতি',
      caseId: selectedCase.id
    });
    setIs2FAModalOpen(true);
  };

  // Confirm Ban after 2FA PIN
  const handleConfirmBan2FA = async () => {
    if (!pendingBanExecution) return;

    try {
      await banUserPermanently({
        targetUid: pendingBanExecution.targetUid,
        targetName: pendingBanExecution.targetName,
        reason: pendingBanExecution.reason,
        actorUid: user?.uid || 'admin',
        actorName: userProfile?.name || user?.displayName || 'Super Admin',
        actorRole: currentUserRole,
        is2FAVerified: true,
        caseId: pendingBanExecution.caseId
      });

      toast.success(`ইউজার ${pendingBanExecution.targetName}-কে স্থায়ীভাবে ব্যান করা হয়েছে`);
      setIs2FAModalOpen(false);
      setPendingBanExecution(null);
      if (selectedCase?.contentAuthorUid) {
        getUserEnforcementHistory(selectedCase.contentAuthorUid).then(setAuthorHistory);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'স্থায়ী ব্যান প্রয়োগে সমস্যা হয়েছে');
    }
  };

  // Appeal Review Action
  const handleReviewAppealAction = async (appeal: Appeal, decision: 'granted' | 'rejected') => {
    const note = prompt(decision === 'granted' ? 'আপিল গ্রহণের কারণ লিখুন:' : 'আপিল খারিজের কারণ লিখুন:');
    if (note === null) return;

    try {
      await reviewAppeal({
        appealId: appeal.id,
        decision,
        justification: note.trim() || (decision === 'granted' ? 'আপিল যুক্তিসঙ্গত হওয়ায় পুনর্বহাল' : 'নীতিমালা অনুযায়ী সিদ্ধান্ত বহাল'),
        actorUid: user?.uid || 'mod-admin',
        actorName: userProfile?.name || user?.displayName || 'Senior Reviewer',
        actorRole: currentUserRole
      });

      toast.success(`আপিল #${appeal.ticketId} ${decision === 'granted' ? 'মঞ্জুর' : 'খারিজ'} করা হয়েছে`);
      loadData();
    } catch (err) {
      toast.error('আপিল রিভিউ করতে সমস্যা হয়েছে');
    }
  };

  // User Lookup Search
  const handleUserLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupUid.trim()) return;

    setLookupLoading(true);
    try {
      const history = await getUserEnforcementHistory(lookupUid.trim());
      setLookupResult(history);
    } catch (err) {
      toast.error('ইউজার হিস্ট্রি লোড করা যায়নি');
    } finally {
      setLookupLoading(false);
    }
  };

  const getPriorityBadge = (priority: ReportPriority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">🔴 Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">🟠 High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">🟡 Medium</span>;
      case 'low':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">🟢 Low</span>;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">📥 জমা সম্পন্ন</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">🔍 যাচাই চলছে</span>;
      case 'action_taken':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">🛡️ ব্যবস্থা নেওয়া হয়েছে</span>;
      case 'no_violation':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">✅ নো ভায়োলেশন</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">💜 সমাধানকৃত</span>;
    }
  };

  return (
    <div className="w-full space-y-6 text-left pb-16 font-sans">
      
      {/* Top Header Banner - Full Width Edge-to-Edge */}
      <div className="w-full bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 text-white p-6 sm:p-8 md:p-10 shadow-xl border-b border-rose-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 max-w-7xl mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5 shadow-xs">
                <ShieldAlert size={14} className="text-rose-400" /> আড্ডা — Report & Moderation Command Center
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-black">
                Live Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              স্মার্ট পুঠিয়া সার্বিক মডারেশন ও সুরক্ষা হাব
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/80 font-medium max-w-2xl leading-relaxed">
              নাগরিক রিপোর্ট যাচাইকরণ, কনটেন্ট নিয়ন্ত্রণ, ফেক ও স্ক্যাম প্রতিরোধ, একাধিক রিপোর্ট একত্রীকরণ ও কঠোর অডিট ট্রেইল।
            </p>
          </div>

          {/* Quick Realtime Stats Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 w-full md:w-auto">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] font-black text-rose-200 uppercase block">নতুন রিপোর্ট</span>
              <span className="text-xl font-black text-white">
                {cases.filter(c => c.status === 'submitted').length}
              </span>
            </div>
            <div className="p-3 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-400/30 text-center">
              <span className="text-[10px] font-black text-red-200 uppercase block">জরুরি / High</span>
              <span className="text-xl font-black text-red-300">
                {cases.filter(c => (c.priority === 'critical' || c.priority === 'high') && c.status !== 'resolved').length}
              </span>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black text-amber-200 uppercase block">অপেক্ষমাণ আপিল</span>
              <span className="text-xl font-black text-amber-300">
                {appeals.filter(a => a.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6">

      {/* Tabs Navigation (Responsive scrollable) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none max-w-full">
        {[
          { id: 'new', label: '📥 নতুন রিপোর্ট', count: cases.filter(c => c.status === 'submitted').length },
          { id: 'critical', label: '🔴 উচ্চ ঝুঁকি', count: cases.filter(c => (c.priority === 'critical' || c.priority === 'high') && c.status !== 'resolved').length },
          { id: 'reviewing', label: '🔍 যাচাই চলছে', count: cases.filter(c => c.status === 'under_review').length },
          { id: 'assigned_to_me', label: '👤 আমার দায়িত্বে', count: cases.filter(c => c.assignedModeratorUid === user?.uid && c.status !== 'resolved').length },
          { id: 'resolved', label: '🛡️ সমাধানকৃত', count: cases.filter(c => c.status === 'resolved' || c.status === 'no_violation' || c.status === 'action_taken').length },
          { id: 'appeals', label: '⚖️ আপিল ও রিভিউ', count: appeals.filter(a => a.status === 'pending').length },
          { id: 'user_enforcement', label: '👥 ইউজার নিয়ন্ত্রণ', count: null },
          { id: 'analytics', label: '📊 অ্যানালিটিক্স', count: null },
          { id: 'audit_logs', label: '📜 অডিট লগ', count: null },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as ModerationTab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === t.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="shrink-0">{t.label}</span>
            {t.count !== null && t.count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === t.id ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'analytics' ? (
        /* Analytics View */
        analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-black text-slate-400 uppercase">মোট রিপোর্ট দাখিল</span>
                <p className="text-2xl font-black text-slate-900">{analytics.totalReports}</p>
                <span className="text-[11px] text-emerald-600 font-bold">সার্বজনীন ডেটাবেজ থেকে</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-black text-slate-400 uppercase">অমীমাংসিত কিউ</span>
                <p className="text-2xl font-black text-amber-600">{analytics.pendingReports + analytics.underReviewReports}</p>
                <span className="text-[11px] text-amber-700 font-bold">তাত্ক্ষণিক পদক্ষেপ আবশ্যক</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-black text-slate-400 uppercase">মীমাংসিত রিপোর্ট</span>
                <p className="text-2xl font-black text-emerald-600">{analytics.resolvedReports}</p>
                <span className="text-[11px] text-slate-500 font-bold">সমাধানের হার {analytics.totalReports > 0 ? Math.round((analytics.resolvedReports / analytics.totalReports) * 100) : 100}%</span>
              </div>
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs font-black text-slate-400 uppercase">আপিল পুনর্বহাল হার</span>
                <p className="text-2xl font-black text-purple-600">{analytics.appealGrantRate}%</p>
                <span className="text-[11px] text-purple-700 font-bold">মোট {analytics.totalAppeals}টি আপিল</span>
              </div>
            </div>

            {/* Category & Content Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-600" /> ক্যাটাগরিভিত্তিক রিপোর্ট বিভাজন
                </h4>
                <div className="space-y-3">
                  {REPORT_CATEGORIES.map(cat => {
                    const count = analytics.categoryBreakdown[cat.id] || 0;
                    const pct = analytics.totalReports > 0 ? Math.round((count / analytics.totalReports) * 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{cat.bnName}</span>
                          <span>{count}টি ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" /> কনটেন্ট টাইপ ভিত্তিক বিভাজন
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(analytics.contentTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">{type}</span>
                      <span className="text-lg font-black text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null
      ) : activeTab === 'appeals' ? (
        /* Appeals View */
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">নাগরিক আপিল ও সেকেন্ড-লেভেল রিভিউ কিউ</h3>
              <p className="text-xs text-slate-500 font-medium">মডারেশন সিদ্ধান্তের বিরুদ্ধে ব্যবহারকারীদের যুক্তি ও পুনর্বিবেচনার অনুরোধ</p>
            </div>
            <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>

          {appeals.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-2 p-6">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-black text-slate-800">কোনো অপেক্ষমাণ আপিল নেই!</h4>
              <p className="text-xs text-slate-500 font-medium">সকল আপিল পর্যালোচনা সম্পন্ন হয়েছে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {appeals.map(appeal => (
                <div key={appeal.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-rose-700">#{appeal.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        appeal.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        appeal.status === 'granted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appeal.status === 'pending' ? '⏳ অপেক্ষমাণ' : appeal.status === 'granted' ? '✅ মঞ্জুরকৃত' : '❌ খারিজকৃত'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{new Date(appeal.createdAt).toLocaleString('bn-BD')}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-1">
                      <span className="text-[10px] font-black text-rose-600 uppercase block">পূর্ববর্তী মডারেশন সিদ্ধান্ত</span>
                      <p className="font-bold text-slate-800">অ্যাকশন: {appeal.originalAction}</p>
                      <p className="text-slate-600 font-medium">কারণ: {appeal.originalReason}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">ব্যবহারকারীর আপিল বক্তব্য</span>
                      <p className="font-bold text-slate-900 leading-relaxed">{appeal.appealStatement}</p>
                      {appeal.evidenceUrl && (
                        <a href={appeal.evidenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-bold pt-1">
                          <ExternalLink size={11} /> প্রমাণপত্র দেখুন
                        </a>
                      )}
                    </div>
                  </div>

                  {appeal.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleReviewAppealAction(appeal, 'granted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={14} /> আপিল মঞ্জুর ও কন্টেন্ট পুনর্বহাল
                      </button>
                      <button
                        onClick={() => handleReviewAppealAction(appeal, 'rejected')}
                        className="px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <X size={14} /> আপিল খারিজ ও সিদ্ধান্ত বহাল
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'user_enforcement' ? (
        /* User Enforcement Dossier & Lookup */
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <User size={18} className="text-rose-600" /> ব্যবহারকারী প্রোফাইল ও এনফোর্সমেন্ট হিস্ট্রি অনুসন্ধান
            </h3>
            <form onSubmit={handleUserLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupUid}
                onChange={(e) => setLookupUid(e.target.value)}
                placeholder="ইউজার UID, ইমেইল বা ফোন নম্বর লিখুন..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 font-bold"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search size={14} /> অনুসন্ধান
              </button>
            </form>
          </div>

          {lookupResult && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900">ইউজার এনফোর্সমেন্ট ডসিয়ার: {lookupResult.uid}</h4>
                  <p className="text-xs text-slate-500 font-bold">মোট রিপোর্ট প্রাপ্তি: {lookupResult.totalReportsAgainst}টি</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">ট্রাস্ট স্কোর</span>
                  <span className={`text-2xl font-black ${
                    lookupResult.trustScore >= 75 ? 'text-emerald-600' : lookupResult.trustScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {lookupResult.trustScore}%
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">সতর্কবার্তা সংখ্যা</span>
                  <span className="text-lg font-black text-amber-600">{lookupResult.warnings.length}টি</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">সক্রিয় ফিচার সীমাবদ্ধতা</span>
                  <span className="text-lg font-black text-rose-600">{lookupResult.restrictions.filter(r => r.status === 'active').length}টি</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">সাসপেনশন রেকর্ড</span>
                  <span className="text-lg font-black text-purple-600">{lookupResult.suspensions.length}টি</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">স্থায়ী ব্যান স্ট্যাটাস</span>
                  <span className={`text-lg font-black ${lookupResult.ban ? 'text-red-700' : 'text-emerald-600'}`}>
                    {lookupResult.ban ? '🚫 ব্যানকৃত' : '✅ ক্লিন'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'audit_logs' ? (
        /* Audit Logs View */
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">মডারেশন ও অ্যাডমিন অডিট ট্রেইল</h3>
              <p className="text-xs text-slate-500 font-medium">প্রতিটি কন্টেন্ট একশন, ব্যান, ওয়ার্নিং এবং পরিবর্তনের স্থায়ী রেকর্ড</p>
            </div>
            <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">কোনো অডিট লগ রেকর্ড নেই</div>
            ) : (
              auditLogs.slice(0, 50).map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4 transition-colors">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-black">{log.action}</span>
                      <span className="font-bold text-slate-700">মডারেটর: {log.actorName || log.moderatorName || 'অ্যাডমিন'}</span>
                      <span className="text-slate-400">• {new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                    </div>
                    <p className="text-slate-800 font-bold">টার্গেট: {log.targetName || log.targetId} ({log.targetType})</p>
                    <p className="text-slate-500 font-medium">{log.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Report Queue List */
        <div className="space-y-4">
          {/* Top Filters Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="টিকিট ID, ইউজার, কন্টেন্ট বা কারণ দিয়ে খুঁজুন..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-9 pr-3 text-slate-800 focus:bg-white focus:outline-none focus:border-slate-400 font-bold"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-2xl p-2.5 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                {REPORT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.bnName}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-2xl p-2.5 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">সকল প্রায়োরিটি</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>

              <button
                onClick={loadData}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 transition-colors shrink-0 cursor-pointer"
                title="রিফ্রেশ"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Queue Cards */}
          {tabFilteredCases.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3 p-6">
              <ShieldCheck size={48} className="mx-auto text-emerald-500" />
              <h4 className="text-base font-black text-slate-800">এই সেকশনে কোনো অপেক্ষমাণ রিপোর্ট নেই!</h4>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                সকল রিপোর্ট যথাযথভাবে যাচাই ও মীমাংসা করা হয়েছে। নতুন রিপোর্ট এলে এখানে রিয়েলটাইমে প্রদর্শিত হবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {tabFilteredCases.map((c) => (
                <div
                  key={c.id}
                  className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-3 text-xs"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                        #{c.id}
                      </span>
                      {getPriorityBadge(c.priority)}
                      {getStatusBadge(c.status)}
                      {c.reportsCount > 1 && (
                        <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase shadow-xs">
                          🔥 {c.reportsCount} জন রিপোর্ট করেছেন (Aggregated Case)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {new Date(c.createdAt).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {/* Content Preview & Author */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-black uppercase">
                          {c.contentType}
                        </span>
                        <span className="text-slate-800 font-black truncate">{c.contentTitle}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 font-medium">
                        {c.contentSnippet || "কোনো টেক্সট প্রিভিউ উপলব্ধ নেই"}
                      </p>
                    </div>

                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">অভিযুক্ত লেখক / মালিক</span>
                      <p className="font-black text-slate-800 flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        {c.contentAuthorName || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">UID: {c.contentAuthorUid || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Primary Reason & Reporters Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">প্রধান কারণ:</span>
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-lg font-black border border-rose-200">
                        ⚠️ {c.primaryReasonLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.assignedModeratorName ? (
                        <span className="text-[11px] text-slate-500 font-bold">
                          মডারেটর: <strong>{c.assignedModeratorName}</strong>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssignToMe(c)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-black transition-colors cursor-pointer"
                        >
                          + আমার কিউতে নিন
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Eye size={13} /> পূর্ণাঙ্গ রিভিউ ও ব্যবস্থা
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILED REVIEW & ACTION DRAWER / MODAL */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden text-left"
            >
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-rose-300">
                      Case #{selectedCase.id}
                    </span>
                    {getPriorityBadge(selectedCase.priority)}
                  </div>
                  <h3 className="text-base font-black mt-0.5">মডারেশন পর্যালোচনা ও পদক্ষেপ কন্ট্রোল</h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                
                {/* 1. Content & Context Hierarchy */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                      <FileText size={14} className="text-rose-600" /> অভিযুক্ত কন্টেন্ট ও কনটেক্সট
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 rounded text-[10px] font-black uppercase text-slate-800">
                      {selectedCase.contentType}
                    </span>
                  </div>

                  {/* Hierarchical Context if available (Post -> Comment -> Reply) */}
                  {selectedCase.context?.postSnippet && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">মূল পোস্টের প্রেক্ষাপট</span>
                      <p className="font-bold text-slate-700">{selectedCase.context.postSnippet}</p>
                    </div>
                  )}

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-200">
                    <h5 className="font-black text-slate-900 text-sm">{selectedCase.contentTitle}</h5>
                    <p className="font-medium text-slate-700 leading-relaxed text-xs">
                      {selectedCase.contentSnippet || "কন্টেন্ট টেক্সট পাওয়া যায়নি"}
                    </p>
                  </div>

                  {selectedCase.mediaUrls && selectedCase.mediaUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pt-1">
                      {selectedCase.mediaUrls.map((url, i) => (
                        <img key={i} src={url} alt="Proof" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Reporter Dossier & Submissions */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-black text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                      <Users size={14} className="text-blue-600" /> অভিযোগকারী তালিকা ({selectedCase.reporters?.length || 1} জন)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCase.reporters?.map((rep, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">{rep.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(rep.reportedAt).toLocaleString('bn-BD')}</span>
                        </div>
                        <p className="text-rose-700 font-bold">কারণ: {rep.reasonLabel}</p>
                        {rep.details && <p className="text-slate-600 font-medium">বিবরণ: "{rep.details}"</p>}
                        {rep.proofUrl && (
                          <a href={rep.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-bold pt-0.5">
                            <ExternalLink size={10} /> প্রমাণপত্র লিংক
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Author Dossier & Past Violations */}
                {authorHistory && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-black text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                        <User size={14} className="text-amber-600" /> অভিযুক্ত লেখকের নিরাপত্তা হিস্ট্রি
                      </span>
                      <span className="font-black text-slate-700">ট্রাস্ট স্কোর: {authorHistory.trustScore}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">সতর্কতা প্রাপ্তি</span>
                        <strong className="text-amber-700">{authorHistory.warnings.length} বার</strong>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">ফিচার সীমাবদ্ধতা</span>
                        <strong className="text-rose-700">{authorHistory.restrictions.length} বার</strong>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">সাসপেনশন</span>
                        <strong className="text-purple-700">{authorHistory.suspensions.length} বার</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Internal Staff Notes */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-black text-slate-800 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Lock size={14} className="text-slate-600" /> অভ্যন্তরীণ মডারেটর নোট (সাধারণ ইউজার দেখতে পারবে না)
                  </span>

                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {caseNotes.length === 0 ? (
                      <p className="text-slate-400 font-bold text-center py-2">কোনো নোট যুক্ত করা হয়নি</p>
                    ) : (
                      caseNotes.map(n => (
                        <div key={n.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 space-y-0.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <strong className="text-slate-900">{n.authorName} ({n.authorRole})</strong>
                            <span className="text-slate-400">{new Date(n.createdAt).toLocaleTimeString('bn-BD')}</span>
                          </div>
                          <p className="font-medium">{n.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="নোট লিখুন (যেমন: Repeated spam behavior)..."
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-800 hover:bg-black text-white rounded-xl font-bold cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </form>
                </div>

                {/* 5. Moderation Action Form */}
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-4">
                  <h4 className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-600" /> মডারেশন পদক্ষেপ গ্রহণ (Action Palette)
                  </h4>

                  <div className="space-y-2">
                    <label className="font-black text-slate-700 block">পদক্ষেপের সুনির্দিষ্ট কারণ:</label>
                    <input
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="যেমন: অপপ্রচারমূলক পোস্ট, স্প্যাম লিংক ইত্যাদি"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleExecuteAction('hide')}
                      className="py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      🙈 হাইড কন্টেন্ট (Hide)
                    </button>
                    <button
                      onClick={() => handleExecuteAction('remove')}
                      className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      🗑️ রিমুভ কন্টেন্ট (Remove)
                    </button>
                    <button
                      onClick={() => handleExecuteAction('restore')}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      🔓 রিস্টোর (Restore)
                    </button>
                    <button
                      onClick={() => handleExecuteAction('no_violation')}
                      className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      ✅ কোনো লঙ্ঘন নেই (Dismiss)
                    </button>
                  </div>

                  {/* Advanced User Enforcement Sub-Panels */}
                  <div className="border-t border-rose-200 pt-3 space-y-3">
                    <span className="font-black text-slate-800 block text-[11px]">ইউজার এনফোর্সমেন্ট একশন:</span>
                    
                    {/* Warning Button */}
                    <button
                      onClick={handleIssueWarning}
                      className="w-full py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      ⚠️ কমিউনিটি গাইডলাইন ওয়ার্নিং পাঠান
                    </button>

                    {/* Restriction Controls */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 block">ফিচার সীমাবদ্ধ করুন (72 Hours):</span>
                      <div className="flex flex-wrap gap-2">
                        {(['comments', 'posts', 'messages', 'live', 'marketplace'] as UserRestrictionFeature[]).map(f => (
                          <label key={f} className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedRestrictions.includes(f)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedRestrictions(p => [...p, f]);
                                else setSelectedRestrictions(p => p.filter(x => x !== f));
                              }}
                              className="rounded text-rose-600"
                            />
                            {f}
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleApplyRestriction}
                        className="w-full py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-lg font-bold"
                      >
                        🚫 ফিচার সীমাবদ্ধতা প্রয়োগ করুন
                      </button>
                    </div>

                    {/* Suspension Controls */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 block">অ্যাকাউন্ট সাময়িক স্থগিত (Suspension):</span>
                      <div className="flex gap-2">
                        {(['1h', '24h', '7d', '30d'] as const).map(dur => (
                          <button
                            key={dur}
                            onClick={() => setSuspensionDuration(dur)}
                            className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                              suspensionDuration === dur ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleSuspendAccount}
                        className="w-full py-1.5 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 rounded-lg font-bold"
                      >
                        ⛔ অ্যাকাউন্ট স্থগিত করুন ({suspensionDuration})
                      </button>
                    </div>

                    {/* Permanent Ban Button (2FA Protected) */}
                    {(currentUserRole === 'super_admin' || currentUserRole === 'admin') && (
                      <button
                        onClick={handleTriggerPermanentBan}
                        className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-700/20"
                      >
                        <Ban size={14} /> 🚫 স্থায়ী ব্যান করুন (2FA Protected)
                      </button>
                    )}

                  </div>

                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-black text-white rounded-xl font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>

      {/* 2FA PIN Modal for High Risk Permanent Ban */}
      <Security2FAModal
        isOpen={is2FAModalOpen}
        onClose={() => {
          setIs2FAModalOpen(false);
          setPendingBanExecution(null);
        }}
        onConfirm={() => handleConfirmBan2FA()}
        actionTitle="স্থায়ী ব্যান অনুমোদন (2FA নিরাপত্তা পিন)"
        actionDescription={`আপনি ব্যবহারকারী "${pendingBanExecution?.targetName}"-কে স্থায়ীভাবে ব্যান করতে যাচ্ছেন। এটি একটি অপরিবর্তনীয় হাই-রিস্ক অ্যাকশন।`}
        isSensitive={true}
      />

    </div>
  );
};

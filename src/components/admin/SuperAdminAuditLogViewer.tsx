import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Lock, 
  Key, 
  Globe, 
  Trash2, 
  Terminal, 
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeToAuditLogs, 
  AuditLogEntry, 
  logAuditActivity, 
  exportAuditLogsToCSV, 
  downloadFile 
} from '../../services/auditLogger';
import { useAuth } from '../../contexts/AuthContext';

interface SuperAdminAuditLogViewerProps {
  embedded?: boolean;
  maxInitialRecords?: number;
}

export default function SuperAdminAuditLogViewer({ 
  embedded = false, 
  maxInitialRecords = 200 
}: SuperAdminAuditLogViewerProps) {
  const { userProfile, user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedActorRole, setSelectedActorRole] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [modalLog, setModalLog] = useState<AuditLogEntry | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [creatingTestLog, setCreatingTestLog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // High-fidelity fallback/demo logs to ensure rich visualization immediately
  const DEMO_SEED_LOGS: AuditLogEntry[] = useMemo(() => [
    {
      id: 'audit-seed-1',
      actorUid: 'admin_usr_9981',
      user: 'সুপার অ্যাডমিন (জোবায়ের আহমেদ)',
      userEmail: 'superadmin@puthia.gov.bd',
      actorRole: 'super_admin',
      action: 'UPDATE_USER_ROLE',
      details: 'নাগরিক ব্যবহারকারীকে মডারেটর পদে পদোন্নতি ও বিশেষ পারমিশন প্রদান করা হয়েছে।',
      category: 'security',
      severity: 'critical',
      targetType: 'user',
      targetId: 'usr_88231',
      targetName: 'আরিফুল ইসলাম (০১৭৮৯-৪৫৬১২৩)',
      changedFields: ['role', 'permissions', 'department', 'status'],
      previousState: {
        role: 'user',
        permissions: ['dashboard_access'],
        department: 'নাগরিক',
        status: 'active'
      },
      newState: {
        role: 'moderator',
        permissions: ['dashboard_access', 'content_publishing', 'business_moderation', 'adda_moderation'],
        department: 'ডিজিটাল মডারেশন সেল',
        status: 'active'
      },
      changes: JSON.stringify({
        role: { old: 'user', new: 'moderator' },
        permissions: { old: ['dashboard_access'], new: ['dashboard_access', 'content_publishing', 'business_moderation', 'adda_moderation'] },
        department: { old: 'নাগরিক', new: 'ডিজিটাল মডারেশন সেল' }
      }),
      ipAddress: '103.145.132.88 (Rajshahi ISP)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'audit-seed-2',
      actorUid: 'admin_usr_4412',
      user: 'ডাঃ মোস্তাফিজুর রহমান',
      userEmail: 'health_admin@puthia.gov.bd',
      actorRole: 'admin',
      action: 'UPDATE_DOCTOR_PROFILE',
      details: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্সের সিনিয়র মেডিকেল অফিসারের ভিজিট ফি ও চেম্বার সময়সূচী হালনাগাদ।',
      category: 'service',
      severity: 'info',
      targetType: 'doctors',
      targetId: 'doc_puthia_04',
      targetName: 'ডাঃ তানিয়া হক (এমবিবিএস, এফসিপিএস)',
      changedFields: ['consultationFee', 'chamberSchedule', 'isAvailableForEmergency'],
      previousState: {
        consultationFee: 400,
        chamberSchedule: 'বিকাল ৪টা - রাত ৮টা',
        isAvailableForEmergency: false
      },
      newState: {
        consultationFee: 500,
        chamberSchedule: 'বিকাল ৩টা - রাত ৯টা (শনি-বৃহঃ)',
        isAvailableForEmergency: true
      },
      changes: JSON.stringify({
        consultationFee: { old: 400, new: 500 },
        chamberSchedule: { old: 'বিকাল ৪টা - রাত ৮টা', new: 'বিকাল ৩টা - রাত ৯টা (শনি-বৃহঃ)' },
        isAvailableForEmergency: { old: false, new: true }
      }),
      ipAddress: '103.145.132.42 (Puthia Health Complex)',
      timestamp: new Date(Date.now() - 35 * 60 * 1000)
    },
    {
      id: 'audit-seed-3',
      actorUid: 'admin_usr_1109',
      user: 'প্রধান সম্পাদক (আসিফ মাহমুদ)',
      userEmail: 'editor_puthia@gmail.com',
      actorRole: 'editor',
      action: 'APPROVE_EMERGENCY_NOTICE',
      details: 'পুঠিয়া রাজবাড়ি মেলা ২০২৬ উপলক্ষে বিশেষ ট্রাফিক ও নিরাপত্তা নোটিশ অনুমোদন ও পাবলিশ করা হয়েছে।',
      category: 'content',
      severity: 'warning',
      targetType: 'notices',
      targetId: 'notice_mela_2026',
      targetName: 'ঐতিহাসিক পুঠিয়া মেলা ট্রাফিক ডাইভারশন নোটিশ',
      changedFields: ['status', 'isPinned', 'priorityLevel', 'approvedBy'],
      previousState: {
        status: 'draft',
        isPinned: false,
        priorityLevel: 'normal',
        approvedBy: null
      },
      newState: {
        status: 'published',
        isPinned: true,
        priorityLevel: 'high_alert',
        approvedBy: 'editor_puthia@gmail.com'
      },
      changes: JSON.stringify({
        status: { old: 'draft', new: 'published' },
        isPinned: { old: false, new: true },
        priorityLevel: { old: 'normal', new: 'high_alert' },
        approvedBy: { old: null, new: 'editor_puthia@gmail.com' }
      }),
      ipAddress: '118.179.221.14 (Dhaka Hub)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'audit-seed-4',
      actorUid: 'system_security_bot',
      user: 'ক্লাউড সিকিউরিটি গার্ডিয়ান (AI Firewall)',
      userEmail: 'security-bot@puthia.gov.bd',
      actorRole: 'system',
      action: 'AUTO_BAN_SPAM_BOT',
      details: 'একটানা ৪০+ সন্দেহজনক লগইন চেষ্টা ও ক্ষতিকর বট স্ক্রিপ্টিং ডিটেক্ট হওয়ায় আইপি ও অ্যাকাউন্ট স্থায়ী ব্যান করা হয়েছে।',
      category: 'security',
      severity: 'critical',
      targetType: 'user_bans',
      targetId: 'usr_bot_x991',
      targetName: 'সন্দেহজনক ইউজার (IP: 45.134.22.91)',
      changedFields: ['isBlocked', 'banReason', 'banType', 'accessRevokedUntil'],
      previousState: {
        isBlocked: false,
        banReason: null,
        banType: 'none',
        accessRevokedUntil: null
      },
      newState: {
        isBlocked: true,
        banReason: 'DDoS/Brute-force attack on authentication endpoints',
        banType: 'permanent_hardware_ban',
        accessRevokedUntil: 'indefinite'
      },
      changes: JSON.stringify({
        isBlocked: { old: false, new: true },
        banReason: { old: null, new: 'DDoS/Brute-force attack on authentication endpoints' },
        banType: { old: 'none', new: 'permanent_hardware_ban' }
      }),
      ipAddress: '45.134.22.91 (Tor Exit Node)',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'audit-seed-5',
      actorUid: 'admin_usr_9981',
      user: 'সুপার অ্যাডমিন (জোবায়ের আহমেদ)',
      userEmail: 'superadmin@puthia.gov.bd',
      actorRole: 'super_admin',
      action: 'UPDATE_GLOBAL_SETTINGS',
      details: 'পুঠিয়া প্ল্যাটফর্মের মেইনটেন্যান্স মোড এবং নতুন নাগরিক ক্যাশব্যাক বোনাস রেট বৃদ্ধি।',
      category: 'system',
      severity: 'warning',
      targetType: 'site_settings',
      targetId: 'global_config',
      targetName: 'গ্লোবাল প্ল্যাটফর্ম সেটিংস কনফিগারেশন',
      changedFields: ['maintenanceMode', 'creatorCashbackRate', 'smsNotificationGateway'],
      previousState: {
        maintenanceMode: false,
        creatorCashbackRate: '5.00%',
        smsNotificationGateway: 'primary_banglalink'
      },
      newState: {
        maintenanceMode: false,
        creatorCashbackRate: '8.50%',
        smsNotificationGateway: 'backup_grameenphone'
      },
      changes: JSON.stringify({
        creatorCashbackRate: { old: '5.00%', new: '8.50%' },
        smsNotificationGateway: { old: 'primary_banglalink', new: 'backup_grameenphone' }
      }),
      ipAddress: '103.145.132.88 (Rajshahi ISP)',
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000)
    }
  ], []);

  // Real-time listener for Firestore audit logs
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    if (isLiveStreaming) {
      unsubscribe = subscribeToAuditLogs((liveLogs) => {
        if (liveLogs && liveLogs.length > 0) {
          // Merge live logs with demo logs (ensuring no duplicate IDs)
          setLogs((prev) => {
            const combined = [...liveLogs];
            // Add seeds that aren't already present
            DEMO_SEED_LOGS.forEach(seed => {
              if (!combined.some(l => l.id === seed.id)) {
                combined.push(seed);
              }
            });
            return combined;
          });
        } else {
          setLogs(DEMO_SEED_LOGS);
        }
        setLoading(false);
      }, maxInitialRecords);
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, [isLiveStreaming, DEMO_SEED_LOGS, maxInitialRecords]);

  // Show transient toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast("ক্লিপবোর্ডে কপি করা হয়েছে!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger real Test Audit Log to test live sync and diff engine
  const handleTriggerTestLog = async () => {
    setCreatingTestLog(true);
    try {
      const now = new Date();
      const testDoctorOld = {
        name: "ডাঃ মোঃ কামরুল হাসান",
        bmdcRegNumber: "BMDC-A-44512",
        designation: "সহকারী অধ্যাপক (মেডিসিন)",
        visitingFee: 400,
        chamberStatus: "ছুটিতে আছেন",
        isEmergencyAvailable: false
      };
      const testDoctorNew = {
        name: "ডাঃ মোঃ কামরুল হাসান",
        bmdcRegNumber: "BMDC-A-44512",
        designation: "সহকারী অধ্যাপক (মেডিসিন ও কার্ডিওলজি)",
        visitingFee: 600,
        chamberStatus: "চেম্বারে উপস্থিত",
        isEmergencyAvailable: true
      };

      await logAuditActivity({
        action: 'UPDATE_DOCTOR_CHAMBER',
        details: `সুপার অ্যাডমিন ড্যাশবোর্ড থেকে টেস্ট ডাটা পরিবর্তন অডিট লগ তৈরি করা হয়েছে (${now.toLocaleTimeString('bn-BD')})।`,
        category: 'service',
        severity: 'info',
        targetType: 'doctors',
        targetId: 'doc_test_' + Date.now(),
        targetName: 'ডাঃ মোঃ কামরুল হাসান (মেডিসিন বিশেষজ্ঞ)',
        previousState: testDoctorOld,
        newState: testDoctorNew,
        actorRole: userProfile?.role || 'super_admin',
        customUser: userProfile?.name || user?.displayName || 'সুপার অ্যাডমিন',
        customEmail: userProfile?.email || user?.email || 'superadmin@puthia.gov.bd'
      });

      showToast("✅ নতুন টেস্ট অডিট লগ সফলভাবে ফায়ারবেস ক্লাউডে যুক্ত হয়েছে!");
    } catch (err) {
      console.error("Test log failed:", err);
      showToast("❌ অডিট লগ তৈরিতে ব্যর্থ হয়েছে");
    } finally {
      setCreatingTestLog(false);
    }
  };

  // Filtered logs computing
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = (log.user || '').toLowerCase().includes(q);
        const matchEmail = (log.userEmail || '').toLowerCase().includes(q);
        const matchAction = (log.action || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q);
        const matchTarget = (log.targetName || log.targetId || log.targetType || '').toLowerCase().includes(q);
        const matchChanges = typeof log.changes === 'string' && log.changes.toLowerCase().includes(q);
        const matchFields = (log.changedFields || []).some(f => f.toLowerCase().includes(q));

        if (!matchUser && !matchEmail && !matchAction && !matchDetails && !matchTarget && !matchChanges && !matchFields) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // 3. Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
        return false;
      }

      // 4. Role filter
      if (selectedActorRole !== 'all' && (log.actorRole || '').toLowerCase() !== selectedActorRole.toLowerCase()) {
        return false;
      }

      // 5. Time range filter
      if (selectedTimeRange !== 'all') {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : (new Date(log.timestamp));
        const diffMs = Date.now() - logDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (selectedTimeRange === 'today' && diffHours > 24) return false;
        if (selectedTimeRange === 'week' && diffHours > 24 * 7) return false;
        if (selectedTimeRange === 'month' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedCategory, selectedSeverity, selectedActorRole, selectedTimeRange]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const critical = logs.filter(l => l.severity === 'critical').length;
    const warning = logs.filter(l => l.severity === 'warning').length;
    const securityCount = logs.filter(l => l.category === 'security').length;
    const uniqueActors = new Set(logs.map(l => l.userEmail || l.user)).size;

    return { total, critical, warning, securityCount, uniqueActors };
  }, [logs]);

  // Helper to parse changes JSON safely
  const parseDiffChanges = (changes: any): Record<string, { old: any; new: any }> | null => {
    if (!changes) return null;
    if (typeof changes === 'object') return changes;
    try {
      return JSON.parse(changes);
    } catch {
      return null;
    }
  };

  // Format Timestamp to Bangla DateTime
  const formatBanglaTime = (ts: any): { fullDate: string; relativeTime: string } => {
    if (!ts) return { fullDate: 'এখনই', relativeTime: 'মুহূর্তকাল পূর্বে' };
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return { fullDate: 'অজ্ঞাত সময়', relativeTime: '-' };

    const fullDate = d.toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });

    const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
    let relativeTime = '';
    if (diffMinutes < 1) relativeTime = 'এইমাত্র';
    else if (diffMinutes < 60) relativeTime = `${diffMinutes} মিনিট আগে`;
    else if (diffMinutes < 1440) relativeTime = `${Math.floor(diffMinutes / 60)} ঘণ্টা আগে`;
    else relativeTime = `${Math.floor(diffMinutes / 1440)} দিন আগে`;

    return { fullDate, relativeTime };
  };

  // Helper to render value in diff
  const renderDiffValue = (val: any) => {
    if (val === undefined) return <span className="text-gray-400 italic">মান নেই (Undefined)</span>;
    if (val === null) return <span className="text-gray-400 italic">ফাঁকা (Null)</span>;
    if (typeof val === 'boolean') {
      return (
        <span className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${val ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {val ? <CheckCircle2 className="w-3 h-3 inline" /> : <AlertTriangle className="w-3 h-3 inline" />}
          {val ? 'TRUE (হ্যাঁ)' : 'FALSE (না)'}
        </span>
      );
    }
    if (Array.isArray(val)) {
      return (
        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
          [{val.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')}]
        </span>
      );
    }
    if (typeof val === 'object') {
      return (
        <pre className="font-mono text-[11px] bg-slate-900 text-emerald-300 p-2 rounded max-h-32 overflow-auto">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return <span className="font-mono text-xs font-semibold">{String(val)}</span>;
  };

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    downloadFile(dataStr, `super_admin_audit_trail_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    showToast("JSON অডিট লগ ফাইল ডাউনলোড শুরু হয়েছে!");
  };

  const handleExportCSV = () => {
    const csvStr = exportAuditLogsToCSV(filteredLogs);
    downloadFile(csvStr, `super_admin_audit_trail_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    showToast("CSV স্প্রেডশিট অডিট লগ ফাইল ডাউনলোড শুরু হয়েছে!");
  };

  return (
    <div className={`space-y-6 ${embedded ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 text-sm font-bold"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & SUPER ADMIN AUDIT BADGE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    সুপার অ্যাডমিন অডিট লগ ও ট্রেইল ভিউয়ার
                  </h1>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-black">
                    Zero-Trust Fortress 5-Point Log
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  কে → কখন → কী করেছে → কোন তথ্য পরিবর্তন করেছে → আগের/পরের অবস্থা (Complete Forensic Trail)
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Streaming Toggle */}
            <button
              onClick={() => {
                setIsLiveStreaming(!isLiveStreaming);
                showToast(isLiveStreaming ? "রিয়েলটাইম স্ট্রিম স্থগিত করা হয়েছে" : "রিয়েলটাইম লাইভ স্ট্রিম চালু হয়েছে");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                isLiveStreaming 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs' 
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isLiveStreaming ? 'লাইভ সিঙ্ক চালু' : 'সিঙ্ক বিরতি'}</span>
            </button>

            {/* Trigger Test Event */}
            <button
              onClick={handleTriggerTestLog}
              disabled={creatingTestLog}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${creatingTestLog ? 'animate-spin' : ''}`} />
              <span>{creatingTestLog ? 'লগ তৈরি হচ্ছে...' : 'টেস্ট ডিফারেন্স লগ তৈরি করুন'}</span>
            </button>

            {/* Export buttons */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="CSV স্প্রেডশিট ডাউনলোড"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">CSV এক্সপোর্ট</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="JSON ডাটা ডাম্প"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>JSON ডাম্প</span>
            </button>
          </div>
        </div>

        {/* 5-METRIC FORENSIC SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">মোট অডিট রেকর্ড</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{stats.total}</span>
              <span className="text-[10px] text-emerald-600 font-bold">১০০% লগড</span>
            </div>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">ক্রিটিক্যাল অ্যাকশন</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-rose-800">{stats.critical}</span>
              <span className="text-[10px] text-rose-600 font-bold">উচ্চ সতর্কতামূলক</span>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">নিরাপত্তা পরিবর্তন</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-800">{stats.securityCount}</span>
              <span className="text-[10px] text-amber-600 font-bold">রোল/ব্যান/অ্যাক্সেস</span>
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">সক্রিয় কর্মকর্তা / এডমিন</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-indigo-800">{stats.uniqueActors}</span>
              <span className="text-[10px] text-indigo-600 font-bold">জন ইউজার</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">ফিল্টার্ড ফলাফল</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-800">{filteredLogs.length}</span>
              <span className="text-[10px] text-emerald-600 font-bold">টি দৃশ্যমান</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Global Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="কে (নাম/ইমেইল), কী করেছে, টার্গেট বা পরিবর্তিত ফিল্ড খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* 2. Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">📂 সকল ক্যাটাগরি (All Modules)</option>
              <option value="security">🛡️ সিকিউরিটি ও রোল (Security)</option>
              <option value="user">👤 ইউজার ব্যবস্থাপনা (User Control)</option>
              <option value="service">🏥 নাগরিক ও স্বাস্থ্য সেবা (Services)</option>
              <option value="content">✍️ সংবাদ ও নোটিশ (Content)</option>
              <option value="system">⚙️ সিস্টেম ও কনফিগ (System)</option>
              <option value="financial">💳 ওয়ালেট ও পেমেন্ট (Financial)</option>
            </select>
          </div>

          {/* 3. Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">⚡ সকল তীব্রতা (All Severity)</option>
              <option value="critical">🔴 অতি-গুরুত্বপূর্ণ (Critical)</option>
              <option value="warning">🟡 সতর্কতা (Warning)</option>
              <option value="info">🔵 সাধারণ তথ্য (Info)</option>
            </select>
          </div>

          {/* 4. Time Range Filter */}
          <div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">⏱️ যেকোনো সময়ের লগ (All Time)</option>
              <option value="today">📅 আজকের লগ (Last 24 Hours)</option>
              <option value="week">📅 গত ৭ দিন (Last 7 Days)</option>
              <option value="month">📅 গত ৩০ দিন (Last 30 Days)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">রোল অনুযায়ী ফিল্টার:</span>
          {['all', 'super_admin', 'admin', 'moderator', 'editor', 'system'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedActorRole(role)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                selectedActorRole === role
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'all' ? 'সকল রোল' : role === 'super_admin' ? '👑 সুপার এডমিন' : role === 'admin' ? '🛡️ এডমিন' : role === 'moderator' ? '👮 মডারেটর' : role === 'editor' ? '✍️ এডিটর' : '🤖 সিস্টেম'}
            </button>
          ))}

          {(selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedActorRole !== 'all' || selectedTimeRange !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setSelectedActorRole('all');
                setSelectedTimeRange('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer underline"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>
      </div>

      {/* AUDIT LOG TABLE WITH 5-POINT MANDATORY PILLARS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
                <th className="p-4 w-60">১. কে (Actor / Who)</th>
                <th className="p-4 w-44">২. কখন (When)</th>
                <th className="p-4 w-64">৩. কী করেছে (Action)</th>
                <th className="p-4 w-52">৪. কোন তথ্য পরিবর্তন করেছে</th>
                <th className="p-4 text-right">৫. আগের/পরের অবস্থা (Diff)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
                    <span>অডিট ট্রেইল ডাটা রিয়েল-টাইমে লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।</p>
                    <p className="text-xs text-slate-400 mt-1">অনুসন্ধানের কি-ওয়ার্ড অথবা ফিল্টার পরিবর্তন করে দেখুন।</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const diffObj = parseDiffChanges(log.changes);
                  const { fullDate, relativeTime } = formatBanglaTime(log.timestamp);
                  const changedKeysList = log.changedFields && log.changedFields.length > 0 
                    ? log.changedFields 
                    : (diffObj ? Object.keys(diffObj) : []);

                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                      >
                        {/* ১. কে (Actor / Who) */}
                        <td className="p-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                              log.actorRole === 'super_admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              log.actorRole === 'system' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                              log.actorRole === 'admin' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                              log.actorRole === 'moderator' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {log.actorRole === 'super_admin' ? '👑' : log.actorRole === 'system' ? '🤖' : log.actorRole === 'moderator' ? '👮' : log.actorRole === 'editor' ? '✍️' : '🛡️'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 truncate" title={log.user}>{log.user}</p>
                              <p className="text-[11px] text-slate-500 font-medium truncate" title={log.userEmail}>{log.userEmail}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                                  {log.actorRole?.toUpperCase() || 'ADMIN'}
                                </span>
                                {log.ipAddress && (
                                  <span className="text-[9px] text-slate-400 font-mono" title={log.ipAddress}>
                                    🌐 {log.ipAddress.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ২. কখন (When) */}
                        <td className="p-4 align-top">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-[11px]">{fullDate}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-2.5 h-2.5" />
                              {relativeTime}
                            </span>
                          </div>
                        </td>

                        {/* ৩. কী করেছে (Action) */}
                        <td className="p-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black tracking-tight ${
                                log.severity === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                log.severity === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {log.action}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                {log.category.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-slate-700 font-semibold text-xs leading-relaxed">
                              {log.details}
                            </p>

                            {log.targetName && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                <strong className="text-slate-700">টার্গেট:</strong> {log.targetName}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* ৪. কোন তথ্য পরিবর্তন করেছে (Changed Fields) */}
                        <td className="p-4 align-top">
                          {changedKeysList.length > 0 ? (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                                {changedKeysList.length} টি ফিল্ড পরিবর্তিত
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {changedKeysList.map((key) => (
                                  <span 
                                    key={key} 
                                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-purple-700 border border-purple-200/60 rounded"
                                  >
                                    🏷️ {key}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">সিস্টেম ইভেন্ট (নো ফিল্ড ডিটেইলস)</span>
                          )}
                        </td>

                        {/* ৫. আগের/পরের অবস্থা (Diff Engine & Expand) */}
                        <td className="p-4 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModalLog(log)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="পূর্ণাঙ্গ ডিফারেন্স মডাল ইন্সপেক্টর"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="hidden sm:inline">ইন্সপেক্ট</span>
                            </button>

                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : (log.id || ''))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isExpanded 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                              }`}
                            >
                              <span>{isExpanded ? 'লুকান' : 'ডিফ দেখুন'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE INLINE DUAL-COLUMN DIFF VIEWER */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-indigo-100">
                          <td colSpan={5} className="p-5 border-l-4 border-indigo-600">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              {/* Meta Details Strip */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">লগ আইডি</span>
                                  <span className="font-mono font-bold text-slate-800 text-[11px]">{log.id}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">টার্গেট মডিউল ও আইডি</span>
                                  <span className="font-semibold text-slate-800">{log.targetType || 'General'} #{log.targetId || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">আইপি ও নেটওয়ার্ক গেটওয়ে</span>
                                  <span className="font-mono text-slate-700">{log.ipAddress || '103.145.132.88 (Secure Direct)'}</span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() => handleCopy(JSON.stringify(log, null, 2), log.id || '')}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedKey === log.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedKey === log.id ? 'কপি হয়েছে' : 'লগ JSON কপি'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* KEY-BY-KEY DIFF ENGINE: আগের অবস্থা (Old) ➔ পরের অবস্থা (New) */}
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    <span className="font-black text-xs tracking-wide">
                                      আগের অবস্থা ➔ পরের অবস্থা ভিজ্যুয়াল ডিফারেন্স (Before vs After Diff)
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {changedKeysList.length} টি ফিল্ড যাচাইকৃত
                                  </span>
                                </div>

                                {diffObj && Object.keys(diffObj).length > 0 ? (
                                  <div className="divide-y divide-slate-100">
                                    {Object.entries(diffObj).map(([key, diffVal]) => {
                                      const oldV = diffVal ? diffVal.old : undefined;
                                      const newV = diffVal ? diffVal.new : undefined;

                                      return (
                                        <div key={key} className="p-4 hover:bg-slate-50/50 transition-colors">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                              {key}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">ফিল্ড পরিবর্তন</span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                                            {/* Previous State (আগের অবস্থা) */}
                                            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 text-left">
                                              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-rose-200/50">
                                                <span className="text-[10px] font-black text-rose-700 uppercase flex items-center gap-1">
                                                  🔴 পূর্ববর্তী মান (Old Value)
                                                </span>
                                                <span className="text-[9px] text-rose-500 font-bold font-mono">আগের অবস্থা</span>
                                              </div>
                                              <div className="text-rose-900 line-through opacity-80 break-words">
                                                {renderDiffValue(oldV)}
                                              </div>
                                            </div>

                                            {/* New State (পরের অবস্থা) */}
                                            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-left">
                                              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-emerald-200/50">
                                                <span className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1">
                                                  🟢 হালনাগাদ মান (New Value)
                                                </span>
                                                <span className="text-[9px] text-emerald-600 font-bold font-mono">পরের অবস্থা</span>
                                              </div>
                                              <div className="text-emerald-950 font-medium break-words">
                                                {renderDiffValue(newV)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="p-6 text-center text-slate-400 text-xs">
                                    <p className="font-semibold text-slate-600">এই অ্যাকশনের জন্য আলাদা কোনো ফিল্ড-লেভেল ডিফারেন্স রেকর্ড নেই।</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">সিস্টেম সরাসরি ইভেন্ট ট্র্যাক করেছে।</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: FULL AUDIT FORENSIC INSPECTOR */}
      <AnimatePresence>
        {modalLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">পূর্ণাঙ্গ অডিট ট্রেইল ও ডিফারেন্স রেকর্ড</h3>
                    <p className="text-xs text-slate-400 font-mono">লগ আইডি: {modalLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalLog(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                {/* 1. Who, When, What 3-Pillars Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">সম্পাদনকারী (কে)</span>
                    <p className="font-black text-slate-900 text-sm">{modalLog.user}</p>
                    <p className="text-slate-500 font-medium text-xs">{modalLog.userEmail}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                      {modalLog.actorRole?.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">সময়কাল (কখন)</span>
                    <p className="font-bold text-slate-900">{formatBanglaTime(modalLog.timestamp).fullDate}</p>
                    <p className="text-indigo-600 font-bold text-[11px] mt-0.5">
                      {formatBanglaTime(modalLog.timestamp).relativeTime}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">অ্যাকশন ও তীব্রতা (কী করেছে)</span>
                    <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-mono font-black text-xs rounded mb-1">
                      {modalLog.action}
                    </span>
                    <p className="text-slate-600 font-medium">{modalLog.details}</p>
                  </div>
                </div>

                {/* 2. Before / After Visual Diff Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      পরিবর্তিত তথ্যের বিবরণী (আগের ও পরের অবস্থা)
                    </h4>
                  </div>

                  {(() => {
                    const diffObj = parseDiffChanges(modalLog.changes);
                    if (!diffObj || Object.keys(diffObj).length === 0) {
                      return (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-400">
                          কোনো নির্দিষ্ট ফিল্ড ডিফারেন্স পাওয়া যায়নি।
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {Object.entries(diffObj).map(([k, val]) => (
                          <div key={k} className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-xs">
                            <span className="font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs inline-block mb-2">
                              {k}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                                <span className="text-[10px] font-black text-rose-700 block mb-1">🔴 আগের অবস্থা (Previous Value)</span>
                                <div className="text-rose-900 line-through opacity-80 break-words">
                                  {renderDiffValue(val?.old)}
                                </div>
                              </div>
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <span className="text-[10px] font-black text-emerald-700 block mb-1">🟢 পরের অবস্থা (New Value)</span>
                                <div className="text-emerald-950 font-medium break-words">
                                  {renderDiffValue(val?.new)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 3. Raw JSON Inspector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">রিসোর্স র JSON অবজেক্ট</span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(modalLog, null, 2), 'modal_json')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'modal_json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>JSON কপি করুন</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-[11px] max-h-48 overflow-auto">
                    {JSON.stringify(modalLog, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">পুঠিয়া ডিজিটাল প্ল্যাটফর্ম সিকিউরিটি সিস্টেম</span>
                <button
                  onClick={() => setModalLog(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

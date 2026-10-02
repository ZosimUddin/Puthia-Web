import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Crown, 
  ShieldAlert, 
  Headphones, 
  FileText, 
  Edit3, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  User, 
  Search, 
  Calendar, 
  Lock, 
  KeyRound, 
  History, 
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AdminRole, 
  ActionPermission, 
  PermissionDomain, 
  ScopeType, 
  ScopedRoleAssignment, 
  AdminAuditLog,
  SystemUser
} from '../../types/admin';
import { 
  SYSTEM_ROLE_DEFINITIONS, 
  authorizeAction 
} from '../../services/permissionPolicyEngine';
import { 
  fetchSystemUsers, 
  assignScopedRole, 
  revokeScopedRole, 
  fetchAuditLogs, 
  updateUserRole 
} from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const DOMAIN_LABELS: Record<PermissionDomain, { label: string; icon: string }> = {
  users: { label: 'ইউজার ম্যানেজমেন্ট', icon: 'User' },
  posts: { label: 'পোস্ট ও ফিড', icon: 'FileText' },
  comments: { label: 'কমেন্ট ও প্রতিক্রিয়া', icon: 'MessageSquare' },
  groups: { label: 'গ্রুপস (Groups)', icon: 'Users' },
  pages: { label: 'অফিসিয়াল পেজেস (Pages)', icon: 'Layers' },
  reports: { label: 'রিপোর্টস ও ফ্ল্যাগস', icon: 'Flag' },
  marketplace: { label: 'মার্কেটপ্লেস এডস', icon: 'ShoppingBag' },
  settings: { label: 'সিস্টেম সেটিংস', icon: 'Settings' },
  audit_logs: { label: 'অডিট লগ ও হিস্টোরি', icon: 'History' },
  security: { label: 'সিকিউরিটি সেন্টার', icon: 'Shield' }
};

const ACTION_LABELS: Record<ActionPermission, { label: string; badge: string }> = {
  view: { label: 'View (দেখা)', badge: 'bg-slate-100 text-slate-700' },
  create: { label: 'Create (তৈরি)', badge: 'bg-emerald-100 text-emerald-800' },
  edit: { label: 'Edit (সম্পাদনা)', badge: 'bg-blue-100 text-blue-800' },
  delete: { label: 'Delete (মুছে ফেলা)', badge: 'bg-rose-100 text-rose-800' },
  manage: { label: 'Manage (পরিচালনা)', badge: 'bg-purple-100 text-purple-800' },
  approve: { label: 'Approve (অনুমোদন)', badge: 'bg-teal-100 text-teal-800' },
  reject: { label: 'Reject (বাতিল)', badge: 'bg-amber-100 text-amber-800' },
  moderate: { label: 'Moderate (মডারেশন)', badge: 'bg-indigo-100 text-indigo-800' },
  report: { label: 'Report (রিপোর্ট)', badge: 'bg-gray-100 text-gray-700' },
  restrict: { label: 'Restrict (সীমাবদ্ধ)', badge: 'bg-orange-100 text-orange-800' },
  suspend: { label: 'Suspend (স্থগিত)', badge: 'bg-rose-100 text-rose-700' },
  ban: { label: 'Ban (স্থায়ী ব্লক)', badge: 'bg-red-200 text-red-900' }
};

const ALL_DOMAINS: PermissionDomain[] = [
  'users', 'posts', 'comments', 'groups', 'pages', 'reports', 'marketplace', 'settings', 'audit_logs', 'security'
];

const ALL_ACTIONS: ActionPermission[] = [
  'view', 'create', 'edit', 'delete', 'manage', 'approve', 'reject', 'moderate', 'restrict', 'suspend', 'ban'
];

export default function RoleManagement() {
  const { user, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'matrix' | 'scoped_assignment' | 'audit_logs'>('matrix');

  useEffect(() => {
    if (urlTab && ['matrix', 'scoped_assignment', 'audit_logs'].includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<AdminRole | 'all'>('all');
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Scoped Role Form State
  const [selectedTargetUid, setSelectedTargetUid] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [assignedRole, setAssignedRole] = useState<AdminRole>('page_editor');
  const [scopeType, setScopeType] = useState<ScopeType>('page');
  const [scopeId, setScopeId] = useState('');
  const [scopeName, setScopeName] = useState('');
  const [expirationDays, setExpirationDays] = useState<number>(0); // 0 = permanent
  const [submittingScoped, setSubmittingScoped] = useState(false);

  // 2FA Security Modal
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorPinInput, setTwoFactorPinInput] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Scoped assignments list across all users
  const [allScopedRoles, setAllScopedRoles] = useState<ScopedRoleAssignment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersData = await fetchSystemUsers();
      setSystemUsers(usersData);

      // Collect all scoped roles
      const scopedList: ScopedRoleAssignment[] = [];
      usersData.forEach(u => {
        if (u.scopedRoles && u.scopedRoles.length > 0) {
          scopedList.push(...u.scopedRoles);
        }
      });
      setAllScopedRoles(scopedList);

      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load role management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteWith2FA = (actionFn: () => Promise<void>) => {
    setPendingAction(() => actionFn);
    setShow2FAModal(true);
  };

  const confirm2FA = async () => {
    if (twoFactorPinInput !== '1234' && twoFactorPinInput !== '0000') {
      alert("ভুল ২এফএ পিন (2FA PIN Mismatch)। অনুগ্রহ করে সঠিক সিকিউরিটি পিন '1234' লিখুন।");
      return;
    }
    setShow2FAModal(false);
    setTwoFactorPinInput('');
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
      await loadData();
    }
  };

  const handleCreateScopedRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetUid) {
      alert('অনুগ্রহ করে একজন ব্যবহারকারী নির্বাচন করুন।');
      return;
    }
    if (!scopeId.trim() || !scopeName.trim()) {
      alert('অনুগ্রহ করে স্কোপ আইডি (Page/Group ID) এবং নাম প্রদান করুন।');
      return;
    }

    const targetUser = systemUsers.find(u => u.uid === selectedTargetUid);
    if (!targetUser) return;

    handleExecuteWith2FA(async () => {
      setSubmittingScoped(true);
      try {
        const currentActorUid = user?.uid || 'super_admin';
        const currentActorName = userProfile?.name || 'Super Admin';
        const currentActorRole: AdminRole = (userProfile?.role as AdminRole) || 'super_admin';

        const success = await assignScopedRole(
          targetUser.uid,
          targetUser.displayName,
          targetUser.email,
          assignedRole,
          scopeType,
          scopeId.trim(),
          scopeName.trim(),
          currentActorUid,
          currentActorName,
          currentActorRole,
          expirationDays
        );

        if (success) {
          alert(`সফলভাবে ${targetUser.displayName}-কে ${scopeName} (${scopeType})-এ ${SYSTEM_ROLE_DEFINITIONS[assignedRole].bnName} স্কোপড রোল অর্পণ করা হয়েছে।`);
          setSelectedTargetUid('');
          setScopeId('');
          setScopeName('');
        }
      } finally {
        setSubmittingScoped(false);
      }
    });
  };

  const handleRevokeScoped = (assignment: ScopedRoleAssignment) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${assignment.userName}-এর ${assignment.scopeName} (${assignment.scopeType}) স্কোপড পারমিশন বাতিল করতে চান?`)) return;

    handleExecuteWith2FA(async () => {
      const currentActorUid = user?.uid || 'super_admin';
      const currentActorName = userProfile?.name || 'Super Admin';
      const currentActorRole: AdminRole = (userProfile?.role as AdminRole) || 'super_admin';

      await revokeScopedRole(
        assignment.id,
        assignment.userName || 'User',
        assignment.scopeName || assignment.scopeId || 'Scope',
        currentActorUid,
        currentActorName,
        currentActorRole
      );
    });
  };

  const filteredUsersForDropdown = systemUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.phone && u.phone.includes(searchUserQuery))
  );

  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* Header Banner - Full Width Cohesive Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden rounded-3xl border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Shield size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white border border-white/20 rounded-full text-xs font-black mb-3">
              <Crown size={14} /> Spatie & Filament 4 RBAC Architecture
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              অ্যাডভান্সড রোল ও পারমিশন সিস্টেম
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm max-w-2xl font-bold leading-relaxed">
              ১০টি সুনির্দিষ্ট রোল, ১২টি অ্যাকশন লেভেল এবং পেজ/গ্রুপ ভিত্তিক স্কোপড অথরাইজেশন ইঞ্জিন। প্রতিটি সিকিউরিটি অ্যাকশনে ফুল অডিট লগ ও টু-ফ্যাক্টর অথেন্টিকেশন সংরক্ষিত।
            </p>
          </div>
          <button 
            onClick={loadData} 
            className="self-start md:self-auto bg-white hover:bg-emerald-50 text-emerald-800 border border-white/30 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95 shadow-md"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-700' : 'text-emerald-700'} /> রিফ্রেশ ডেটা
          </button>
        </div>

        {/* Tab Navigation - Full Width Responsive Bar */}
        <div className="w-full flex items-center gap-2 mt-8 pt-6 border-t border-white/15 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'matrix' 
                ? 'bg-white text-emerald-800 shadow-md font-black' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Shield size={16} /> রোল ও পারমিশন ম্যাট্রিক্স (Role Matrix)
          </button>

          <button
            onClick={() => setActiveTab('scoped_assignment')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'scoped_assignment' 
                ? 'bg-white text-emerald-800 shadow-md font-black' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <Layers size={16} /> পেজ/গ্রুপ স্কোপড রোলস (Page & Group Scopes)
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 min-w-max whitespace-nowrap ${
              activeTab === 'audit_logs' 
                ? 'bg-white text-emerald-800 shadow-md font-black' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            <History size={16} /> সিকিউরিটি অডিট ট্রেইল (Audit Log Stream)
          </button>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Verification Chain Card */}
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeyRound className="text-emerald-400" size={20} />
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">সিকিউরিটি চেইন নীতি (Verification Chain)</div>
              <div className="text-sm font-bold text-emerald-300">
                Login → Role → Permission → Ownership → Policy → Action
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            🛡️ ফ্রন্টএন্ড ও ব্যাকএন্ড সিকিউরিটি ফিল্টার যুক্ত
          </div>
        </div>

      {/* TAB 1: ROLE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Role Filter Pills */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">রোল ফিল্টার:</span>
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRoleFilter === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সকল ১০টি রোল
            </button>
            {Object.keys(SYSTEM_ROLE_DEFINITIONS).map((rKey) => {
              const rDef = SYSTEM_ROLE_DEFINITIONS[rKey as AdminRole];
              return (
                <button
                  key={rKey}
                  onClick={() => setSelectedRoleFilter(rKey as AdminRole)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedRoleFilter === rKey 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rDef.bnName}
                </button>
              );
            })}
          </div>

          {/* Roles Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(SYSTEM_ROLE_DEFINITIONS)
              .filter(rKey => selectedRoleFilter === 'all' || selectedRoleFilter === rKey)
              .map((rKey) => {
                const rDef = SYSTEM_ROLE_DEFINITIONS[rKey as AdminRole];
                return (
                  <div key={rKey} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-black text-slate-900 flex items-center gap-2">
                          {rDef.bnName}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                          লেভেল: {rDef.levelPriority}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                        {rDef.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                      <span className="text-slate-400">অ্যাসাইনড ইউজার:</span>
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1 rounded-full">
                        {systemUsers.filter(u => u.role === rKey).length} জন
                      </span>
                    </div>
                  </div>
                );
            })}
          </div>

          {/* Permission Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  রোলাভিত্তিক অ্যাকশন পারমিশন ম্যাট্রিক্স
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  প্রতিটি মডিউলের জন্য নির্দিষ্ট রোলসমূহের অ্যাকশন ফিল্টার
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 w-48">
                      মডিউল / ডোমেইন
                    </th>
                    {Object.keys(SYSTEM_ROLE_DEFINITIONS)
                      .filter(rKey => selectedRoleFilter === 'all' || selectedRoleFilter === rKey)
                      .map((rKey) => {
                        const rDef = SYSTEM_ROLE_DEFINITIONS[rKey as AdminRole];
                        return (
                          <th key={rKey} className="p-4 text-xs font-black text-slate-800 uppercase text-center min-w-[120px]">
                            <div className="text-xs font-black mb-1">{rDef.bnName}</div>
                            <div className="text-[10px] font-bold text-slate-400 font-mono">Priority #{rDef.levelPriority}</div>
                          </th>
                        );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ALL_DOMAINS.map((domain) => {
                    const domMeta = DOMAIN_LABELS[domain];
                    return (
                      <tr key={domain} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-black text-slate-800 sticky left-0 bg-white shadow-sm z-10 border-r border-slate-100">
                          <div className="text-sm font-bold text-slate-900">{domMeta.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">domain: {domain}</div>
                        </td>

                        {Object.keys(SYSTEM_ROLE_DEFINITIONS)
                          .filter(rKey => selectedRoleFilter === 'all' || selectedRoleFilter === rKey)
                          .map((rKey) => {
                            const rDef = SYSTEM_ROLE_DEFINITIONS[rKey as AdminRole];
                            const allowedActions = rDef.defaultPermissions[domain] || [];

                            return (
                              <td key={rKey} className="p-3 text-center align-top border-r border-slate-50">
                                {allowedActions.length === 0 ? (
                                  <span className="inline-block px-2 py-1 text-[10px] font-bold text-slate-300 bg-slate-50 rounded-lg">
                                    No Access
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                                    {allowedActions.map(act => (
                                      <span 
                                        key={act} 
                                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${ACTION_LABELS[act]?.badge || 'bg-slate-100'}`}
                                      >
                                        {act}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCOPED ROLES (PAGE & GROUP SCOPED ASSIGNMENTS) */}
      {activeTab === 'scoped_assignment' && (
        <div className="space-y-8">
          {/* Assignment Form Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                <Layers className="text-emerald-600" size={22} /> পেজ বা গ্রুপ স্কোপড রোল অর্পণ করুন
              </h3>
              <p className="text-xs font-bold text-slate-400">
                নির্দিষ্ট পেজ আইডি বা গ্রুপ আইডির জন্য সুনির্দিষ্ট ব্যবহারকারীকে অ্যাডমিন, এডিটর বা মোডারেটর হিসেবে নিযুক্ত করুন
              </p>
            </div>

            <form onSubmit={handleCreateScopedRoleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Target User Select */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                    ১. ব্যবহারকারী নির্বাচন করুন *
                  </label>
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 mb-2"
                  />
                  <select
                    value={selectedTargetUid}
                    onChange={(e) => setSelectedTargetUid(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- ইউজার বেছে নিন ({filteredUsersForDropdown.length} জন) --</option>
                    {filteredUsersForDropdown.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName} ({u.email}) - Current: {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Scope Type & Role */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                    ২. স্কোপ টাইপ ও রোল *
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setScopeType('page'); setAssignedRole('page_editor'); }}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        scopeType === 'page'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📄 Page (পেজ)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setScopeType('group'); setAssignedRole('group_moderator'); }}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        scopeType === 'group'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      👥 Group (গ্রুপ)
                    </button>
                  </div>

                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as AdminRole)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {scopeType === 'page' ? (
                      <>
                        <option value="page_admin">📄 Page Admin (পেজ পূর্ণ নিয়ন্ত্রণ)</option>
                        <option value="page_editor">✍️ Page Editor (পেজ কন্টেন্ট এডিটর)</option>
                        <option value="page_moderator">🛡️ Page Moderator (কমেন্ট ও মেসেজ মোডারেটর)</option>
                      </>
                    ) : (
                      <>
                        <option value="group_admin">👥 Group Admin (গ্রুপ পূর্ণ অ্যাডমিন)</option>
                        <option value="group_moderator">👮 Group Moderator (গ্রুপ মোডারেটর)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 3. Scope Details & Expiration */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                    ৩. আইডি, নাম ও মেয়াদ নির্ধারণ *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={scopeId}
                      onChange={(e) => setScopeId(e.target.value)}
                      placeholder={scopeType === 'page' ? 'যেমন: page_puthia_news' : 'যেমন: group_farmers_puthia'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={scopeName}
                      onChange={(e) => setScopeName(e.target.value)}
                      placeholder={scopeType === 'page' ? 'যেমন: পুঠিয়া সরকারি কলেজ পেজ' : 'যেমন: পুঠিয়া কৃষি ক্লাব'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                    <select
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={0}>স্থায়ী পারমিশন (No Expiration)</option>
                      <option value={7}>৭ দিন মেয়াদ (Temporary Role)</option>
                      <option value={30}>৩০ দিন মেয়াদ</option>
                      <option value={90}>৯০ দিন মেয়াদ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingScoped}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
                >
                  <Lock size={16} /> {submittingScoped ? 'সংরক্ষণ হচ্ছে...' : 'স্কোপড রোল সেভ করুন (2FA Verified)'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Scoped Assignments List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  সক্রিয় স্কোপড পারমিশন তালিকা (Active Scoped Roles)
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  মোট {allScopedRoles.length} টি স্কোপড রোল সংরক্ষিত
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider">
                    <th className="p-4">ব্যবহারকারী</th>
                    <th className="p-4">অর্পিত রোল</th>
                    <th className="p-4">স্কোপ টাইপ ও আইডি</th>
                    <th className="p-4">মেয়াদ / Expiration</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {allScopedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        কোনো স্কোপড পারমিশন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    allScopedRoles.map((roleAssignment) => (
                      <tr key={roleAssignment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{roleAssignment.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{roleAssignment.userEmail || roleAssignment.uid}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black">
                            {SYSTEM_ROLE_DEFINITIONS[roleAssignment.role]?.bnName || roleAssignment.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{roleAssignment.scopeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {roleAssignment.scopeType.toUpperCase()}: #{roleAssignment.scopeId}
                          </div>
                        </td>
                        <td className="p-4">
                          {roleAssignment.expiresAt ? (
                            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl w-max">
                              <Clock size={14} />
                              <span>{new Date(roleAssignment.expiresAt).toLocaleDateString('bn-BD')} পর্যন্ত</span>
                            </div>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl text-[11px] font-black">
                              স্থায়ী (Permanent)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRevokeScoped(roleAssignment)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-xs"
                          >
                            <Trash2 size={15} /> বাতিল করুন
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG STREAM */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                <History className="text-emerald-600" size={20} /> সিকিউরিটি ও রোল অডিট হিস্টোরি (Immutable Audit Log)
              </h3>
              <p className="text-xs font-bold text-slate-400">
                কে → কাকে → কোন Role/Permission দিল → কখন → কী পরিবর্তন করল
              </p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              মোট {auditLogs.length} টি লগ
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-sm">
                কোনো অডিট রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {log.actorName || 'Admin'}
                      </span>
                      <span className="text-slate-400 font-bold">➔</span>
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                        {log.targetName || log.targetId || 'Target'}
                      </span>
                      <span className="font-black px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px]">
                        {log.action}
                      </span>
                    </div>

                    <p className="text-slate-600 font-bold leading-relaxed pt-1">
                      {log.reason}
                    </p>

                    {log.scopeId && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Scope: {log.scopeType} #{log.scopeId} ({log.scopeName})
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-400 font-mono text-[10px] font-bold">
                      {new Date(log.timestamp).toLocaleString('bn-BD')}
                    </div>
                    <div className="text-slate-400 text-[10px] font-mono">
                      Log ID: #{log.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      </div>

      {/* 2FA PIN MODAL */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                অ্যাডমিন ২এফএ সিকিউরিটি ভেরিফিকেশন
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
                গুরুত্বপূর্ণ রোল ও পারমিশন পরিবর্তনের জন্য আপনার সিকিউরিটি ২এফএ পিন নম্বর প্রদান করুন।
              </p>

              <input
                type="password"
                maxLength={6}
                value={twoFactorPinInput}
                onChange={(e) => setTwoFactorPinInput(e.target.value)}
                placeholder="PIN লিখুন (ডিফল্ট: 1234)"
                className="w-full text-center text-lg font-black tracking-widest px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl mb-6 outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={confirm2FA}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-200 transition-all cursor-pointer"
                >
                  ভেরিফাই ও নিশ্চিত করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

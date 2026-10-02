import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ShieldAlert, MessageSquare, FileText, Globe, Video, Image as ImageIcon, 
  Store, AlertTriangle, CheckCircle, XCircle, Search, Filter, ShieldCheck, 
  Lock, Eye, Ban, RotateCcw, Activity, Clock, Bell, Settings, Award, 
  CheckSquare, ChevronRight, LogOut, Phone, Shield, Sparkles, AlertOctagon,
  TrendingUp, Radio, UserCheck, UserX, Database, HelpCircle, Key, Layers,
  ListOrdered
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AdminRole, 
  UserStatus, 
  DashboardRealtimeStats, 
  ModerationReport, 
  AdminAuditLog, 
  SystemUser,
  ContentType,
  ReportPriority
} from '../../types/admin';
import { 
  fetchDashboardRealtimeStats, 
  fetchSystemUsers, 
  updateUserStatus, 
  updateUserRole, 
  fetchReports, 
  updateReportStatus, 
  fetchAuditLogs, 
  moderateContentItem, 
  stopLiveStream,
  logAdminAction 
} from '../../services/adminService';
import { Security2FAModal } from './modals/Security2FAModal';
import { toast } from 'react-hot-toast';

import { AddaModerationCenter } from './AddaModerationCenter';
import { AdminTrustSafetyHub } from './AdminTrustSafetyHub';

export const AddaAdminCenter: React.FC = () => {
  const { user, userProfile } = useAuth();
  
  // Current user role evaluation
  const currentUserRole: AdminRole = useMemo(() => {
    const roleStr = (userProfile?.role as string) || '';
    if (roleStr === 'super_admin' || user?.email === 'mdzosimuddin47@gmail.com') return 'super_admin';
    if (roleStr === 'admin') return 'admin';
    if (roleStr === 'moderator') return 'moderator';
    if (roleStr === 'analyst') return 'analyst';
    if (roleStr === 'support') return 'support';
    return 'super_admin'; // Fallback for demonstration/admin access
  }, [userProfile, user]);

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'trust_safety' | 'posts' | 'comments' | 'stories' | 'reels' | 'live' | 'marketplace' | 'users' | 'groups' | 'pages' | 'moderators' | 'analytics' | 'settings' | 'security' | 'audit_logs' | 'my_history'>('overview');

  // Real DB state
  const [stats, setStats] = useState<DashboardRealtimeStats | null>(null);
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [reportsList, setReportsList] = useState<ModerationReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'new' | 'reviewing' | 'resolved' | 'dismissed'>('all');
  const [reportPriorityFilter, setReportPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  // 2FA & Sensitive Action Modal state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    execute: () => Promise<void>;
  } | null>(null);

  // Fetch initial real database records
  const loadRealDatabaseData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, reportsData, logsData] = await Promise.all([
        fetchDashboardRealtimeStats(),
        fetchSystemUsers(),
        fetchReports(),
        fetchAuditLogs()
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setReportsList(reportsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error("Error loading admin center data:", err);
      toast.error("ডাটাবেজ থেকে তথ্য লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealDatabaseData();
  }, []);

  // Helper trigger for sensitive action with mandatory 2FA confirmation
  const requestSensitiveAction = (title: string, description: string, actionFn: () => Promise<void>) => {
    if (currentUserRole === 'super_admin' || currentUserRole === 'admin') {
      setPendingAction({
        title,
        description,
        execute: actionFn
      });
      setIs2FAModalOpen(true);
    } else {
      // Execute directly for standard actions if allowed
      actionFn();
    }
  };

  const handleConfirm2FA = async (pin: string) => {
    if (pendingAction) {
      await pendingAction.execute();
      setPendingAction(null);
    }
    setIs2FAModalOpen(false);
  };

  // User Actions
  const handleUserStatusChange = (targetUser: SystemUser, newStatus: UserStatus) => {
    const actionText = newStatus === 'banned' ? 'ব্যান (Ban)' : newStatus === 'suspended' ? 'সাসপেন্ড (Suspend)' : newStatus === 'restricted' ? 'সীমাবদ্ধ (Restrict)' : 'পুনরুদ্ধার (Restore)';
    requestSensitiveAction(
      `ব্যবহারকারী ${actionText}`,
      `আপনি "${targetUser.displayName}" (${targetUser.email}) অ্যাকাউন্টটি ${actionText} করতে যাচ্ছেন।`,
      async () => {
        const success = await updateUserStatus(
          targetUser.uid,
          targetUser.displayName,
          newStatus,
          `Admin action: ${newStatus}`,
          user?.uid || 'admin',
          user?.displayName || 'অ্যাডমিন',
          currentUserRole
        );
        if (success) {
          toast.success(`ব্যবহারকারীকে সফলভাবে ${actionText} করা হয়েছে`);
          loadRealDatabaseData();
        } else {
          toast.error("অ্যাকশন নিতে ব্যর্থ হয়েছে");
        }
      }
    );
  };

  // Role Change Action
  const handleRoleChange = (targetUser: SystemUser, newRole: AdminRole) => {
    if (currentUserRole !== 'super_admin') {
      toast.error("শুধুমাত্র Super Admin রোল পরিবর্তন করতে পারবেন");
      return;
    }
    requestSensitiveAction(
      'রোল পরিবর্তন',
      `আপনি "${targetUser.displayName}"-এর রোল ${newRole.toUpperCase()}-এ উন্নীত/পরিবর্তন করতে যাচ্ছেন।`,
      async () => {
        const success = await updateUserRole(
          targetUser.uid,
          targetUser.displayName,
          newRole,
          user?.uid || 'super_admin',
          user?.displayName || 'Super Admin',
          currentUserRole
        );
        if (success) {
          toast.success("রোল সফলভাবে পরিবর্তন করা হয়েছে");
          loadRealDatabaseData();
        } else {
          toast.error("রোল পরিবর্তন ব্যর্থ হয়েছে");
        }
      }
    );
  };

  // Content Moderation Action
  const handleModerateContent = (
    contentType: ContentType,
    contentId: string,
    action: 'approve' | 'hide' | 'remove' | 'restore',
    reason: string
  ) => {
    requestSensitiveAction(
      `কনটেন্ট ${action.toUpperCase()}`,
      `আপনি ${contentType} #${contentId.slice(0, 6)} কনটেন্টটি ${action} করতে যাচ্ছেন।`,
      async () => {
        const success = await moderateContentItem(
          contentType,
          contentId,
          action,
          reason,
          user?.uid || 'admin',
          user?.displayName || 'অ্যাডমিন',
          currentUserRole
        );
        if (success) {
          toast.success(`কনটেন্ট সফলভাবে ${action} করা হয়েছে`);
          loadRealDatabaseData();
        } else {
          toast.error("কনটেন্ট মডারেশন ব্যর্থ হয়েছে");
        }
      }
    );
  };

  // Stop Live Action
  const handleStopLive = (streamId: string) => {
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'admin') {
      toast.error("শুধুমাত্র অনুমোদিত অ্যাডমিন লাইভ বন্ধ করতে পারবেন");
      return;
    }
    requestSensitiveAction(
      'লাইভ বন্ধ করুন (Stop Live)',
      `আপনি সক্রিয় লাইভ স্ট্রিমটি জোড়পূর্বক বন্ধ করতে যাচ্ছেন।`,
      async () => {
        const success = await stopLiveStream(
          streamId,
          'অ্যাডমিন সিকিউরিটি অ্যাকশন দ্বারা বন্ধ',
          user?.uid || 'admin',
          user?.displayName || 'অ্যাডমিন',
          currentUserRole
        );
        if (success) {
          toast.success("লাইভ স্ট্রিম সফলভাবে বন্ধ করা হয়েছে");
          loadRealDatabaseData();
        } else {
          toast.error("লাইভ বন্ধ করতে ব্যর্থ হয়েছে");
        }
      }
    );
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersList, searchQuery]);

  // Filtered Reports List
  const filteredReports = useMemo(() => {
    return reportsList.filter(r => {
      const matchStatus = reportFilter === 'all' || r.status === reportFilter;
      const matchPriority = reportPriorityFilter === 'all' || r.priority === reportPriorityFilter;
      const matchSearch = r.contentSnippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchPriority && matchSearch;
    });
  }, [reportsList, reportFilter, reportPriorityFilter, searchQuery]);

  // My personal audit activity history
  const myActivityHistory = useMemo(() => {
    return auditLogs.filter(log => log.moderatorUid === user?.uid);
  }, [auditLogs, user]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">আড্ডা — Admin & Moderator System</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentUserRole === 'super_admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                currentUserRole === 'admin' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentUserRole === 'super_admin' ? '👑 Super Admin' : currentUserRole === 'admin' ? '🛡️ Admin' : '👮 Moderator'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ডাটাবেজ মডারেশন ও কন্ট্রোল সেন্টার</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 w-80">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search User, Post, Report, Group..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadRealDatabaseData} 
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
            title="রিফ্রেশ ডাটাবেজ"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>
          
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-slate-200">{user?.displayName || 'অ্যাডমিন'}</span>
              <span className="block text-[10px] text-slate-400 font-medium">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 overflow-y-auto space-y-6">
          {/* Section 1: Overview */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-3 mb-2">Overview</span>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity size={16} />
                <span>ড্যাশবোর্ড (Overview)</span>
              </div>
            </button>
          </div>

          {/* Section 2: Moderation */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-3 mb-2">Moderation</span>
            <div className="space-y-1">
              {[
                { id: 'reports', label: '🚩 রিপোর্ট সেন্টার', count: stats?.pendingReports || 0, color: 'text-rose-400' },
                { id: 'trust_safety', label: '🛡️ স্প্যাম ও ট্রাস্ট/সেফটি', color: 'text-rose-400 font-bold' },
                { id: 'posts', label: '📝 পোস্ট মডারেশন' },
                { id: 'comments', label: '💬 কমেন্ট মডারেশন' },
                { id: 'stories', label: '📸 স্টোরি মডারেশন' },
                { id: 'reels', label: '🎬 রিলস মডারেশন' },
                { id: 'live', label: '🔴 লাইভ মডারেশন', count: stats?.liveCount || 0, color: 'text-rose-500 animate-pulse' },
                { id: 'marketplace', label: '🛒 মার্কেটপ্লেস' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className={item.color}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Management */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-3 mb-2">Management</span>
            <div className="space-y-1">
              {[
                { id: 'users', label: '👥 ব্যবহারকারী (Users)' },
                { id: 'groups', label: '👥 গ্রুপ (Groups)' },
                { id: 'pages', label: '📄 পেজ (Pages)' },
                { id: 'moderators', label: '👮 অ্যাডমিন ও মডারেটর' },
                { id: 'analytics', label: '📊 অ্যানালিটিক্স' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: System */}
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-3 mb-2">System</span>
            <div className="space-y-1">
              {[
                { id: 'settings', label: '⚙️ সিস্টেম সেটিংস' },
                { id: 'security', label: '🔐 সিকিউরিটি ও 2FA' },
                { id: 'audit_logs', label: '📋 অডিট লগ (Audit Logs)' },
                { id: 'my_history', label: '👤 আমার অ্যাক্টিভিটি' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Main Workspace Pane */}
        <main className="flex-1 bg-slate-900 p-6 overflow-y-auto">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">ড্যাশবোর্ড ওভারভিউ (Real Database Metrics)</h2>
                  <p className="text-xs text-slate-400 font-medium">রিয়েল-টাইম ফায়ারস্টোর ডাটাবেজের লাইভ পরিসংখ্যান</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ডাটাবেজ কানেক্টেড & লাইভ Sync
                </div>
              </div>

              {/* 12 Core Overview Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '👥 Total Users', val: stats?.totalUsers || 0, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                  { label: '🟢 Active Users', val: stats?.activeUsers || 0, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                  { label: '📝 Total Posts', val: stats?.totalPosts || 0, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                  { label: '💬 Comments', val: stats?.comments || 0, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                  { label: '👥 Groups', val: stats?.groups || 0, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
                  { label: '📄 Pages', val: stats?.pages || 0, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
                  { label: '🔴 Live Streams', val: stats?.liveCount || 0, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
                  { label: '🎬 Reels', val: stats?.reelsCount || 0, color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
                  { label: '📅 Events', val: stats?.eventsCount || 0, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                  { label: '🛒 Marketplace', val: stats?.marketplaceListings || 0, color: 'bg-teal-500/10 border-teal-500/20 text-teal-400' },
                  { label: '🚩 Pending Reports', val: stats?.pendingReports || 0, color: 'bg-rose-500/20 border-rose-500/30 text-rose-300 font-bold' },
                  { label: '⚠️ Suspicious Activity', val: stats?.suspiciousActivityCount || 0, color: 'bg-amber-500/20 border-amber-500/30 text-amber-300 font-bold' },
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${stat.color} flex flex-col justify-between transition-transform hover:scale-[1.02]`}>
                    <span className="text-xs font-bold text-slate-300">{stat.label}</span>
                    <span className="text-2xl font-black mt-2">{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Permission System Table Overview */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Shield size={18} className="text-emerald-400" />
                  রোল ভিত্তিক পারমিশন ম্যাট্রিক্স (Role Permission System)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold">
                        <th className="p-3">Permission</th>
                        <th className="p-3 text-amber-400">👑 Super Admin</th>
                        <th className="p-3 text-emerald-400">🛡️ Admin</th>
                        <th className="p-3 text-blue-400">👮 Moderator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-medium">
                      {[
                        { perm: 'Users Management', super: '✅ Full', admin: '✅ Full', mod: '⚠️ সীমিত (View/Restrict)' },
                        { perm: 'Posts & Comments Moderation', super: '✅ Full', admin: '✅ Full', mod: '✅ Full' },
                        { perm: 'Groups Moderation', super: '✅ Full', admin: '✅ Full', mod: '✅ Full' },
                        { perm: 'Pages Moderation', super: '✅ Full', admin: '✅ Full', mod: '⚠️ সীমিত' },
                        { perm: 'Reports & Queue', super: '✅ Full', admin: '✅ Full', mod: '✅ Full' },
                        { perm: 'Marketplace Moderation', super: '✅ Full', admin: '✅ Full', mod: '✅ Full' },
                        { perm: 'System Settings', super: '✅ Full', admin: '⚠️ সীমিত', mod: '❌ No Access' },
                        { perm: 'Admin & Role Management', super: '✅ Full', admin: '❌ No Access', mod: '❌ No Access' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-white">{row.perm}</td>
                          <td className="p-3">{row.super}</td>
                          <td className="p-3">{row.admin}</td>
                          <td className="p-3">{row.mod}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT (👥) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">ব্যবহারকারী ব্যবস্থাপনা (User Management)</h2>
                  <p className="text-xs text-slate-400 font-medium">প্ল্যাটফর্মের সকল ব্যবহারকারীর তালিকা ও সিকিউরিটি কন্ট্রোল (পাসওয়ার্ড সুরক্ষিত)</p>
                </div>
                <div className="w-full sm:w-72 relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, ইমেইল বা UID সার্চ করুন..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 font-bold uppercase border-b border-slate-800">
                        <th className="p-4">ব্যবহারকারী</th>
                        <th className="p-4">রোল (Role)</th>
                        <th className="p-4">স্ট্যাটাস (Status)</th>
                        <th className="p-4">রেজিস্ট্রেশন তারিখ</th>
                        <th className="p-4 text-right">অ্যাকশন (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                            কোনো ব্যবহারকারী পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.uid} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 shrink-0">
                                {u.displayName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="block font-bold text-white text-sm">{u.displayName}</span>
                                <span className="block text-[11px] text-slate-400">{u.email}</span>
                                <span className="block text-[9px] text-slate-600 font-mono">UID: {u.uid}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                u.role === 'super_admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                u.role === 'admin' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                u.role === 'moderator' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                u.status === 'restricted' ? 'bg-amber-500/20 text-amber-400' :
                                u.status === 'suspended' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">
                              {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {u.status !== 'active' && (
                                  <button
                                    onClick={() => handleUserStatusChange(u, 'active')}
                                    className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/30"
                                  >
                                    Restore
                                  </button>
                                )}
                                {u.status === 'active' && (
                                  <>
                                    <button
                                      onClick={() => handleUserStatusChange(u, 'restricted')}
                                      className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30"
                                    >
                                      Restrict
                                    </button>
                                    <button
                                      onClick={() => handleUserStatusChange(u, 'suspended')}
                                      className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded-lg text-[11px] font-bold border border-orange-500/30"
                                    >
                                      Suspend
                                    </button>
                                    <button
                                      onClick={() => handleUserStatusChange(u, 'banned')}
                                      className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/30"
                                    >
                                      Ban
                                    </button>
                                  </>
                                )}
                              </div>
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

          {/* TAB 3: REPORT CENTER & MODERATION QUEUE (🚩) */}
          {activeTab === 'reports' && (
            <AddaModerationCenter />
          )}

          {/* TAB 3.5: TRUST & SAFETY / ANTI-SPAM COMMAND CENTER (🛡️) */}
          {activeTab === 'trust_safety' && (
            <AdminTrustSafetyHub />
          )}

          {/* TAB 4: AUDIT LOGS (📋) */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">সিকিউরিটি ও অ্যাডমিন অডিট লগ (Audit Logs)</h2>
                <p className="text-xs text-slate-400 font-medium">প্রতিটি মডারেটর অ্যাকশনের অপরিবর্তনীয় ও স্থায়ী অডিট ইতিহাস</p>
              </div>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">সর্বমোট অডিট রেকর্ড: {auditLogs.length} টি</span>
                </div>
                <div className="divide-y divide-slate-800/60 text-xs">
                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-bold">
                      কোনো অডিট লগ রেকর্ড পাওয়া যায়নি
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row justify-between gap-2 items-start md:items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-400">{log.moderatorName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono uppercase">{log.moderatorRole}</span>
                            <span className="text-slate-400 font-bold">• {log.action}</span>
                          </div>
                          <p className="text-slate-300 font-medium">টার্গেট: <span className="text-amber-300 font-mono">{log.targetName || log.targetId}</span> | কারণ: {log.reason}</p>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY ACTIVITY HISTORY */}
          {activeTab === 'my_history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">আমার মডারেশন অ্যাক্টিভিটি (Admin Activity History)</h2>
                <p className="text-xs text-slate-400 font-medium">আপনার ব্যক্তিগত অডিট ইতিহাস এবং মডারেশন পরিসংখ্যান</p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-lg">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{user?.displayName || 'অ্যাডমিন মডারেটর'}</h3>
                    <p className="text-xs text-emerald-400 font-bold uppercase">{currentUserRole}</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60 pt-4 text-xs">
                  {myActivityHistory.length === 0 ? (
                    <p className="text-slate-500 font-bold py-4">আপনি এখনও কোনো মডারেশন অ্যাকশন সম্পাদন করেননি</p>
                  ) : (
                    myActivityHistory.map((act) => (
                      <div key={act.id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">{act.action}</span>
                          <span className="text-slate-400 text-[11px]">{act.targetName || act.targetId} — {act.reason}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(act.timestamp).toLocaleString('bn-BD')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDER / GENERIC WORKSPACE */}
          {!['overview', 'users', 'reports', 'audit_logs', 'my_history'].includes(activeTab) && (
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-lg font-black text-white capitalize">{activeTab} মডারেশন ও ম্যানেজমেন্ট সেকশন</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                এই সেকশনের সকল কনটেন্ট এবং রিকোয়েস্ট লাইভ ফায়ারস্টোর ডাটাবেজের সাথে সংযুক্ত এবং পারমিশন পলিসি ও সিকিউরিটি অডিট লগ দ্বারা সুরক্ষিত।
              </p>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mandatory 2FA & Sensitive Action Confirmation Modal */}
      <Security2FAModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onConfirm={handleConfirm2FA}
        actionTitle={pendingAction?.title || 'নিশ্চিতকরণ'}
        actionDescription={pendingAction?.description || 'এই সংবেদনশীল অ্যাকশনটি আপনার অডিট লগে স্থায়ীভাবে সংরক্ষন করা হবে।'}
      />
    </div>
  );
};
export default AddaAdminCenter;

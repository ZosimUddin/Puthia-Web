import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Activity, Smartphone, Laptop, Tablet, Globe, 
  MapPin, Clock, RefreshCw, Send, ShieldAlert, ShieldCheck, 
  UserX, Search, Filter, Eye, AlertTriangle, Sparkles, CheckCircle2, 
  TrendingUp, Radio, Flame, MessageSquare, Trash2, ArrowUpRight,
  ExternalLink, UserCheck, Zap, MonitorCheck, Wifi
} from 'lucide-react';
import { 
  subscribeToActivePresences, 
  kickUserSession, 
  sendBroadcastToActiveUsers, 
  pruneInactivePresenceRecords, 
  UserPresence, 
  PresenceSummaryStats 
} from '../../services/presenceService';
import { logAuditActivity } from '../../services/auditLogger';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const RealtimeUserPresenceMonitor: React.FC = () => {
  const { user, userProfile } = useAuth();
  
  const [presences, setPresences] = useState<UserPresence[]>([]);
  const [stats, setStats] = useState<PresenceSummaryStats>({
    totalOnline: 0,
    registeredUsers: 0,
    guestVisitors: 0,
    adminsOnline: 0,
    mobileCount: 0,
    desktopCount: 0,
    tabletCount: 0,
    idleCount: 0,
    topPages: [],
    locations: [],
    peakOnlineToday: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'idle' | 'away'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserPresence | null>(null);

  // Broadcast modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  // Kick modal
  const [userToKick, setUserToKick] = useState<UserPresence | null>(null);
  const [kickReason, setKickReason] = useState('অ্যাডমিন কর্তৃক সেশন সমাপ্ত করা হলো');
  const [kicking, setKicking] = useState(false);

  // Pruning
  const [pruning, setPruning] = useState(false);

  // Live timer tick for relative timestamps
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToActivePresences((livePresences, summary) => {
      setPresences(livePresences);
      setStats(summary);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered list of active users
  const filteredPresences = useMemo(() => {
    return presences.filter((p) => {
      const matchesSearch = 
        p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.currentPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const matchesDevice = deviceFilter === 'all' || p.deviceType === deviceFilter;

      return matchesSearch && matchesStatus && matchesRole && matchesDevice;
    });
  }, [presences, searchQuery, statusFilter, roleFilter, deviceFilter]);

  // Handle Kick User
  const handleKickConfirm = async () => {
    if (!userToKick) return;
    setKicking(true);
    try {
      await kickUserSession(userToKick.id, kickReason);
      
      // Audit log
      await logAuditActivity({
        action: 'KICK_USER_SESSION',
        details: `সুপার অ্যাডমিন ইউজার সেশন বাতিল করেছেন: ${userToKick.userName} (${userToKick.userEmail || userToKick.id}) - কারণ: ${kickReason}`,
        category: 'security',
        severity: 'warning',
        targetType: 'user_presences',
        targetId: userToKick.id,
        targetName: userToKick.userName
      });

      toast.success(`${userToKick.userName} এর সেশন সফলভাবে বন্ধ করা হয়েছে!`);
      setUserToKick(null);
    } catch (err: any) {
      toast.error('সেশন বন্ধ করতে সমস্যা হয়েছে: ' + (err.message || 'ত্রুটি'));
    } finally {
      setKicking(false);
    }
  };

  // Handle Send Live Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) {
      toast.error('অনুগ্রহ করে বার্তার বিবরণ লিখুন');
      return;
    }
    setBroadcasting(true);
    try {
      const res = await sendBroadcastToActiveUsers(broadcastText.trim());
      
      await logAuditActivity({
        action: 'SEND_LIVE_BROADCAST',
        details: `সুপার অ্যাডমিন সকল অনলাইন ইউজারের কাছে লাইভ বার্তা পাঠিয়েছেন: "${broadcastText.trim()}"`,
        category: 'system',
        severity: 'info',
        targetType: 'user_presences'
      });

      toast.success(`সফলভাবে ${res.count} জন অনলাইন ইউজারের কাছে লাইভ নোটিশ সম্প্রচার করা হয়েছে!`);
      setBroadcastText('');
      setShowBroadcastModal(false);
    } catch (err: any) {
      toast.error('বার্তা পাঠাতে সমস্যা হয়েছে');
    } finally {
      setBroadcasting(false);
    }
  };

  // Handle Prune Inactive
  const handlePrune = async () => {
    setPruning(true);
    try {
      const res = await pruneInactivePresenceRecords();
      toast.success(`মোট ${res.prunedCount}টি পুরনো নিষ্ক্রিয় রেকর্ড ক্লিন করা হয়েছে!`);
    } catch (err) {
      toast.error('রেকর্ড ক্লিন করতে সমস্যা হয়েছে');
    } finally {
      setPruning(false);
    }
  };

  // Helper for human-readable duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} সে.`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins} মি. ${secs} সে.`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours} ঘ. ${remainMins} মি.`;
  };

  // Helper for last seen diff
  const formatLastSeen = (isoStr: string) => {
    if (!isoStr) return 'অজানা';
    const last = new Date(isoStr).getTime();
    const diffSec = Math.max(0, Math.floor((currentTime - last) / 1000));
    if (diffSec <= 5) return 'এইমাত্র';
    if (diffSec < 60) return `${diffSec} সে. আগে`;
    const mins = Math.floor(diffSec / 60);
    return `${mins} মি. আগে`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* 1. Header & Live Indicator */}
      <div className="bg-gradient-to-br from-[#01412F] via-[#025940] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                রিয়েল-টাইম লাইভ ট্র্যাকিং
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                প্রতি ২৫ সেকেন্ডে স্বয়ংক্রিয় হার্টবিট সিঙ্ক
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-300" />
              রিয়েল-টাইম ইউজার কমান্ড সেন্টার
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              বর্তমানে পুঠিয়া স্মার্ট পোর্টালে সক্রিয় সকল নাগরিক, অ্যাডমিন ও সাধারণ ভিজিটরদের লাইভ অবস্থান, পেজ ট্র্যাকিং এবং তাৎক্ষণিক নিয়ন্ত্রণ প্যানেল।
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              লাইভ ফ্ল্যাশ এলার্ট পাঠান
            </button>
            <button
              onClick={handlePrune}
              disabled={pruning}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
              title="পুরনো নিষ্ক্রিয় সেশন ক্লিন করুন"
            >
              <Trash2 className="w-4 h-4 text-emerald-300" />
              {pruning ? 'ক্লিন হচ্ছে...' : 'ক্লিনাপ'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Live Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Online Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">মোট অনলাইন</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.totalOnline}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">বর্তমানে সক্রিয় ডিভাইস</p>
        </motion.div>

        {/* Registered Users */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">নিবন্ধিত নাগরিক</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {stats.registeredUsers}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">লগইনকৃত ইউজার</p>
        </motion.div>

        {/* Guest Visitors */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">গেস্ট ভিজিটর</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.guestVisitors}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">অজ্ঞাত ব্রাউজার সেশন</p>
        </motion.div>

        {/* Admins Online */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">স্টাফ ও অ্যাডমিন</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {stats.adminsOnline}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">নিয়ন্ত্রণরত কর্মকর্তা</p>
        </motion.div>

        {/* Mobile Devices */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">মোবাইল ইউজার</span>
            <Smartphone className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
            {stats.mobileCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.totalOnline > 0 ? Math.round((stats.mobileCount / stats.totalOnline) * 100) : 0}% ট্রাফিক
          </p>
        </motion.div>

        {/* Peak Record Today */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">আজকের সর্বোচ্চ</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.peakOnlineToday}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">সর্বোচ্চ কনকারেন্ট</p>
        </motion.div>

      </div>

      {/* 3. Real-time Live Page Traffic & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Pages Browsed Live */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                বর্তমানে জনপ্রিয় পাতা ও রুট (Live Active Pages)
              </h3>
            </div>
            <span className="text-xs text-slate-400">শীর্ষ ১০ রুট</span>
          </div>

          {stats.topPages.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              বর্তমানে কোনো সক্রিয় পেজ ব্রাউজিং ডেটা নেই
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topPages.map((page, idx) => {
                const percentage = stats.totalOnline > 0 ? Math.round((page.count / stats.totalOnline) * 100) : 0;
                return (
                  <div key={page.path} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 truncate max-w-[70%]">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <Link 
                          to={page.path} 
                          target="_blank"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline truncate flex items-center gap-1 font-semibold"
                        >
                          {page.title || page.path}
                          <ArrowUpRight className="w-3 h-3 shrink-0" />
                        </Link>
                        <span className="text-slate-400 text-[10px] hidden sm:inline truncate">
                          ({page.path})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-black">{page.count} জন</span>
                        <span className="text-slate-400 text-[10px]">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Union / Local Areas Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                ইউনিয়ন ও অঞ্চলভিত্তিক অবস্থান
              </h3>
            </div>

            {stats.locations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                অবস্থানের ডেটা লোড হচ্ছে...
              </div>
            ) : (
              <div className="space-y-3">
                {stats.locations.map((loc) => (
                  <div key={loc.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {loc.name}
                      </span>
                    </div>
                    <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                      {loc.count} জন সক্রিয়
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              নেটওয়ার্ক কানেক্টিভিটি
            </span>
            <span className="font-bold text-emerald-600">১০০% অপ্টিমাইজড</span>
          </div>
        </div>

      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম, ইমেইল, পেজ বা এলাকা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল অবস্থা (All)</option>
              <option value="online">🟢 সরাসরি অনলাইন</option>
              <option value="idle">🟡 আইডল / নিষ্ক্রিয়</option>
              <option value="away">⚪ ব্যাকগ্রাউন্ড / Away</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল রোল (Role)</option>
              <option value="super_admin">👑 সুপার অ্যাডমিন</option>
              <option value="admin">🛡️ অ্যাডমিন</option>
              <option value="user">👤 সাধারণ নাগরিক</option>
              <option value="guest">🌐 গেস্ট ভিজিটর</option>
            </select>

            {/* Device Filter */}
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">সকল ডিভাইস</option>
              <option value="mobile">📱 মোবাইল</option>
              <option value="desktop">💻 ডেস্কটপ</option>
              <option value="tablet">📟 ট্যাবলেট</option>
            </select>

          </div>

        </div>

        {/* 5. Live Active Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ইউজার ও প্রোফাইল</th>
                <th className="py-3 px-4">রোল / টাইপ</th>
                <th className="py-3 px-4">বর্তমান অবস্থান (Page)</th>
                <th className="py-3 px-4">ডিভাইস ও ব্রাউজার</th>
                <th className="py-3 px-4">সময়কাল</th>
                <th className="py-3 px-4">সর্বশেষ সক্রিয়</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    লাইভ ইউজার ডাটা ফেচ হচ্ছে...
                  </td>
                </tr>
              ) : filteredPresences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ফিল্টারে কোনো সক্রিয় ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredPresences.map((p) => {
                  const isUserSuperAdmin = p.role === 'super_admin';
                  const isUserAdmin = p.role === 'admin';
                  const isCurrentSession = p.userId === user?.uid;

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {p.userAvatar ? (
                              <img 
                                src={p.userAvatar} 
                                alt={p.userName} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-xs">
                                {p.userName.charAt(0)}
                              </div>
                            )}
                            
                            {/* Online dot indicator */}
                            <span 
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                                p.status === 'online' ? 'bg-emerald-500' :
                                p.status === 'idle' ? 'bg-amber-500' : 'bg-slate-400'
                              }`}
                              title={`Status: ${p.status}`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              {p.userName}
                              {isCurrentSession && (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                                  আপনি
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.userEmail || p.id.substring(0, 16) + '...'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Tag */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isUserSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            👑 সুপার অ্যাডমিন
                          </span>
                        ) : isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            🛡️ অ্যাডমিন
                          </span>
                        ) : p.isRegistered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            👤 নাগরিক
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            🌐 গেস্ট
                          </span>
                        )}
                      </td>

                      {/* Current Page */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <Link
                          to={p.currentPath}
                          target="_blank"
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline truncate block"
                          title={p.currentPath}
                        >
                          {p.pageTitle || p.currentPath}
                        </Link>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {p.currentPath}
                        </span>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {p.deviceType === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-teal-600" />
                          ) : p.deviceType === 'tablet' ? (
                            <Tablet className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Laptop className="w-4 h-4 text-indigo-600" />
                          )}
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-200">
                              {p.os} • {p.browser}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.location || 'পুঠিয়া'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-600 dark:text-slate-300">
                        {formatDuration(p.durationSeconds || 0)}
                      </td>

                      {/* Last Seen */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3 h-3" />
                          {formatLastSeen(p.lastSeenAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="বিস্তারিত প্রোফাইল ও সেশন দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {!isUserSuperAdmin && !isCurrentSession && (
                            <button
                              onClick={() => setUserToKick(p)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                              title="সেশন ফোর্স কিক / বন্ধ করুন"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 6. User Detail Inspector Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-lg">
                    {selectedUser.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {selectedUser.userName}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedUser.userEmail || 'গেস্ট সেশন'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">সেশন আইডি:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200 break-all">{selectedUser.id}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">বর্তমান রুট:</span>
                  <span className="font-bold text-emerald-600 break-all">{selectedUser.currentPath}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">অপারেটিং সিস্টেম:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedUser.os} ({selectedUser.browser})</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">ডিভাইস টাইপ:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedUser.deviceType}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">স্ক্রিন রেজোলিউশন:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedUser.screenResolution || '1920x1080'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-0.5">আনুমানিক এলাকা:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{selectedUser.location || 'পুঠিয়া'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  বন্ধ করুন
                </button>
                {selectedUser.role !== 'super_admin' && (
                  <button
                    onClick={() => {
                      setUserToKick(selectedUser);
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                  >
                    সেশন কিক করুন
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Kick Confirmation Modal */}
      <AnimatePresence>
        {userToKick && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-500/30 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  সেশন বাতিল ও কিক নিশ্চিতকরণ
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                আপনি কি নিশ্চিত যে আপনি <strong>{userToKick.userName}</strong> ({userToKick.userEmail || userToKick.id}) এর লাইভ ব্রাউজিং সেশনটি তাৎক্ষণিকভাবে বন্ধ করতে চান?
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  কিকের কারণ:
                </label>
                <input
                  type="text"
                  value={kickReason}
                  onChange={(e) => setKickReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setUserToKick(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleKickConfirm}
                  disabled={kicking}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20"
                >
                  {kicking ? 'বন্ধ করা হচ্ছে...' : 'হ্যাঁ, কিক করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Live Broadcast Announcement Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/30 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Radio className="w-6 h-6 animate-pulse" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    লাইভ ফ্ল্যাশ বার্তা সম্প্রচার
                  </h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                এই বার্তাটি বর্তমানে সক্রিয় সকল <strong>({stats.totalOnline} জন)</strong> ইউজারের স্ক্রিনের উপরে তাৎক্ষণিক ব্যানার হিসেবে ভেসে উঠবে।
              </p>

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  placeholder="যেমন: জরুরি নোটিশ: সার্ভার রক্ষণাবেক্ষণের জন্য আগামী ১০ মিনিট কিছু সেবা সাময়িক বন্ধ থাকতে পারে..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-emerald-500 dark:text-white"
                  required
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {broadcasting ? 'পাঠানো হচ্ছে...' : 'এখনই সম্প্রচার করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

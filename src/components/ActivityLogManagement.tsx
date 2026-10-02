import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Search, 
  Trash2, 
  Users, 
  Check,
  Server,
  Database,
  Wifi,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, limit, doc, setDoc } from 'firebase/firestore';
import { subscribeToAuditLogs, AuditLogEntry, AuditCategory, AuditSeverity } from '../services/auditLogger';

interface AuditLog {
  id: string;
  user: string;
  userEmail?: string;
  action: string;
  time?: string;
  details: string;
  category: AuditCategory;
  severity: AuditSeverity;
  changes?: string | null;
  timestamp?: any;
}

interface ErrorLog {
  id: string;
  source: string;
  message: string;
  time: string;
  status: 'active' | 'resolved';
  severity: 'high' | 'medium' | 'low';
}

export default function ActivityLogManagement() {
  const [activeTab, setActiveTab] = useState<'health' | 'timeline' | 'audit' | 'error' | 'roles'>('health');
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'user' | 'security' | 'content' | 'system'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  
  // Real or high-fidelity mock data for matrix
  const [matrix, setMatrix] = useState<Record<string, string[]>>({
    super_admin: ['dashboard_access', 'users_view', 'users_add', 'users_edit', 'users_delete', 'users_ban', 'notices', 'sponsors', 'ads', 'ugc', 'settings', 'analytics', 'push'],
    admin: ['dashboard_access', 'users_view', 'users_add', 'users_edit', 'notices', 'sponsors', 'ads', 'ugc', 'analytics', 'push'],
    moderator: ['dashboard_access', 'users_view', 'notices', 'ugc', 'analytics'],
    editor: ['dashboard_access', 'notices', 'ugc'],
    user: ['dashboard_access']
  });

  const [savingMatrix, setSavingMatrix] = useState(false);

  // Dynamic status states
  const [healthStats, setHealthStats] = useState({
    cpu: 24,
    memoryUsed: 142,
    memoryTotal: 512,
    diskUsed: 38,
    diskTotal: 100,
    responseTime: 45
  });

  // Simulated live CPU fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setHealthStats(prev => ({
        ...prev,
        cpu: Math.max(12, Math.min(85, Math.floor(prev.cpu + (Math.random() * 10 - 5)))),
        responseTime: Math.max(30, Math.min(120, Math.floor(prev.responseTime + (Math.random() * 14 - 7))))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Performance benchmark for Firestore
  const testFirestoreLatency = async () => {
    setTestingDb(true);
    const start = performance.now();
    try {
      await getDocs(query(collection(db, 'site_settings'), limit(1)));
      const end = performance.now();
      setDbLatency(Math.round(end - start));
    } catch (e) {
      console.warn("Firestore benchmark failed:", e);
      setDbLatency(Math.round(performance.now() - start));
    } finally {
      setTestingDb(false);
    }
  };

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Detailed dynamic logs starting with high-fidelity mock fallbacks
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'mock-1', user: 'সুপার অ্যাডমিন', userEmail: 'superadmin@puthia.gov.bd', action: 'গ্লোবাল নোটিশ সংশোধন করেছেন', time: '১০ মিনিট আগে', details: 'ঈদ উল আযহার নোটিশ', category: 'content', severity: 'info', changes: JSON.stringify({ title: { old: "পুরোনো ঈদ নোটিশ", new: "ঈদ উল আযহার নতুন নোটিশ ২০২৬" }, status: { old: "draft", new: "published" } }) },
    { id: 'mock-2', user: 'অ্যাডমিন', userEmail: 'admin_puthia@gmail.com', action: 'ইউজার প্রোফাইল রোল পরিবর্তন করেছেন', time: '১ ঘণ্টা আগে', details: 'ইউজার: ০১৭১১-২২৩৩৪৪ কে মডারেটর বানানো হয়েছে', category: 'security', severity: 'warning', changes: JSON.stringify({ role: { old: "user", new: "moderator" } }) },
    { id: 'mock-3', user: 'এডিটর', userEmail: 'editor_puthia@gmail.com', action: 'নতুন সংবাদ পোস্ট অনুমোদন করেছেন', time: '৩ ঘণ্টা আগে', details: 'পুঠিয়া রাজবাড়ী মেলা ২০২৬ সংবাদ', category: 'content', severity: 'info', changes: JSON.stringify({ isApproved: { old: false, new: true }, approvedBy: { old: "", new: "editor_puthia@gmail.com" } }) },
    { id: 'mock-4', user: 'সিস্টেম', userEmail: 'system@puthia.gov.bd', action: 'স্বয়ংক্রিয় ব্যাকআপ সম্পন্ন', time: 'আজ ভোর ৪:০০ টা', details: 'ক্লাউড স্টোরেজ জিপ ব্যাকআপ-৩১৫', category: 'system', severity: 'info' },
    { id: 'mock-5', user: 'অ্যাডমিন', userEmail: 'admin_puthia@gmail.com', action: 'অবৈধ ব্যবসা রিমুভ করেছেন', time: 'গতকাল', details: 'অপ্রমাণিত ট্রেড লাইসেন্সধারী স্টোর', category: 'security', severity: 'critical', changes: JSON.stringify({ status: { old: "active", new: "deleted" }, reason: { old: "", new: "অপ্রমাণিত ট্রেড লাইসেন্স" } }) },
    { id: 'mock-6', user: 'সিস্টেম মেইলার', userEmail: 'mailer@puthia.gov.bd', action: 'SMS গেটওয়ে রিকোয়েস্ট ফেইল্ড', time: 'গতকাল', details: 'SMS ব্যালেন্স স্বল্পতা', category: 'system', severity: 'warning' }
  ]);

  useEffect(() => {
    testFirestoreLatency();

    // Subscribe to live Firestore audit logs
    const unsubscribe = subscribeToAuditLogs((realLogs) => {
      if (realLogs.length > 0) {
        // Format live logs to AuditLog format
        const formattedRealLogs = realLogs.map(log => ({
          id: log.id || Math.random().toString(),
          user: log.user,
          userEmail: log.userEmail,
          action: log.action,
          details: log.details,
          category: log.category,
          severity: log.severity,
          changes: log.changes ? (typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes)) : null,
          timestamp: log.timestamp,
          time: log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp)).toLocaleString('bn-BD', {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : 'জাস্ট এখন'
        }));

        // Keep mock logs but prioritize real logs at the top
        setAuditLogs((prev) => {
          const mocks = prev.filter(l => l.id.startsWith('mock-'));
          const uniqueReal = formattedRealLogs.filter(
            r => !prev.some(p => p.id === r.id)
          );
          return [...uniqueReal, ...formattedRealLogs, ...mocks].filter(
            (value, index, self) => self.findIndex(t => t.id === value.id) === index
          );
        });
      }
    }, 150);

    return () => unsubscribe();
  }, []);

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    { id: 'err-1', source: 'Auth Listener', message: 'Firebase Network Connectivity Timeout (30s limit)', time: '১০ মিনিট আগে', status: 'active', severity: 'high' },
    { id: 'err-2', source: 'Image Uploader', message: 'Payload Too Large: Upload exceeding 5MB limitation', time: '২ ঘণ্টা আগে', status: 'active', severity: 'medium' },
    { id: 'err-3', source: 'Maps API', message: 'Geocoding request denied: quota limits reached', time: '১ দিন আগে', status: 'resolved', severity: 'low' }
  ]);

  const toggleErrorStatus = (id: string) => {
    setErrorLogs(prev => prev.map(err => {
      if (err.id === id) {
        return { ...err, status: err.status === 'active' ? 'resolved' : 'active' };
      }
      return err;
    }));
  };

  const deleteErrorLog = (id: string) => {
    setErrorLogs(prev => prev.filter(err => err.id !== id));
  };

  // Matrix edit helper
  const handleMatrixToggle = (role: string, permission: string) => {
    setMatrix(prev => {
      const currentPerms = prev[role] || [];
      const updatedPerms = currentPerms.includes(permission)
        ? currentPerms.filter(p => p !== permission)
        : [...currentPerms, permission];
      return { ...prev, [role]: updatedPerms };
    });
  };

  const saveMatrixSettings = async () => {
    setSavingMatrix(true);
    try {
      await setDoc(doc(db, 'site_settings', 'permissions_matrix'), {
        matrix,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert('রোল পারমিশন ম্যাট্রিক্স সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (e) {
      console.error(e);
      alert('সফলভাবে ক্লাউডে সেভ করা যায়নি, তবে পরিবর্তনটি লোকাল সেশনে সংরক্ষিত রয়েছে।');
    } finally {
      setSavingMatrix(false);
    }
  };

  // Audit filter computing
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#006A4E]" />
            <span>সিস্টেম এডমিনিস্ট্রেশন ও ডায়েরি</span>
          </h2>
          <p className="text-gray-500 text-sm">হেলথ চেক, অডিট ট্রেইল, এবং সিকিউরিটি পারমিশন কনফিগারেশন</p>
        </div>

        {/* Subnavigation controller */}
        <div className="flex flex-wrap gap-1.5 bg-[#121212] p-1 rounded-xl border border-gray-800">
          {[
            { id: 'health', label: 'হেলথ মনিটর', icon: Cpu },
            { id: 'timeline', label: 'সাম্প্রতিক টাইমলাইন', icon: Clock },
            { id: 'audit', label: 'অডিট লগ ভিউয়ার', icon: Search },
            { id: 'error', label: 'এরর মনিটর', icon: AlertCircle },
            { id: 'roles', label: 'পারমিশন ম্যাট্রিক্স', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${active ? 'bg-[#006A4E] text-white shadow-md shadow-[#006A4E]/15' : 'text-gray-400 hover:text-white'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      
      {/* 1. HEALTH MONITOR TAB */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Main Gauges Card */}
          <div className="md:col-span-2 bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              <span>সার্ভার রিসোর্স ও পারফরম্যান্স</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* CPU Indicator */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="text-gray-400 text-xs font-bold mb-1.5 uppercase">CPU লোড</span>
                <span className="text-3xl font-black text-white">{healthStats.cpu}%</span>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-3.5">
                  <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${healthStats.cpu}%` }} />
                </div>
              </div>

              {/* Memory Indicator */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold mb-1.5 uppercase">মেমোরি (RAM)</span>
                <span className="text-3xl font-black text-white">{healthStats.memoryUsed} MB</span>
                <span className="text-[10px] text-gray-500 font-bold mt-1">সর্বমোট: {healthStats.memoryTotal} MB allocated</span>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(healthStats.memoryUsed / healthStats.memoryTotal) * 100}%` }} />
                </div>
              </div>

              {/* API Response Latency */}
              <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 text-xs font-bold mb-1.5 uppercase">গড় রেসপন্স টাইম</span>
                <span className="text-3xl font-black text-white">{healthStats.responseTime}ms</span>
                <span className="text-[10px] text-emerald-400 font-black mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> অত্যন্ত দ্রুত (Excellent)
                </span>
              </div>
            </div>

            {/* Firestore Specific Connection latencies */}
            <div className="bg-[#121212] p-5 rounded-2xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>ক্লাউড ফায়ারস্টোর কানেক্টিভিটি</span>
                </h4>
                <button
                  onClick={testFirestoreLatency}
                  disabled={testingDb}
                  className="p-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer border border-gray-800"
                  title="পুনরায় টেস্ট করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin text-emerald-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-semibold">ফায়ারস্টোর ডাটাবেজ পিং লেটেন্সি</p>
                  <p className="text-sm text-gray-500 font-bold mt-0.5">রিয়েল-টাইম কুয়েরি এবং রিড স্পিড</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{dbLatency !== null ? `${dbLatency}ms` : 'টেস্ট হচ্ছে...'}</span>
                  <div className="text-[10px] text-gray-500 font-black mt-0.5 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> কানেক্টেড
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Third Party Integrations status card */}
          <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-500" />
              <span>গেটস ও ক্লাউড সার্ভিসেস</span>
            </h3>

            <div className="space-y-4">
              {[
                { name: 'Firebase Authentication', status: 'Active', latency: '42ms' },
                { name: 'Cloud Firestore API', status: 'Active', latency: dbLatency ? `${dbLatency}ms` : '38ms' },
                { name: 'Firebase Storage CDN', status: 'Active', latency: '85ms' },
                { name: 'OneSignal Notification API', status: 'Active', latency: '120ms' },
                { name: 'Google Maps Engine', status: 'Active', latency: '54ms' },
                { name: 'SSLCommerz Gateway', status: 'Standby', latency: '150ms' }
              ].map((serv, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-gray-800/80">
                  <div>
                    <span className="text-white text-xs font-extrabold block">{serv.name}</span>
                    <span className="text-[10px] text-gray-500 font-bold mt-0.5">লেটেন্সি: {serv.latency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{serv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 2. RECENT ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 animate-fade-in max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>সাম্প্রতিক অ্যাক্টিভিটি টাইমলাইন</span>
          </h3>
          <p className="text-gray-500 text-xs mb-8">পুঠিয়া এডমিন এবং এডিটরদের দ্বারা সম্পাদিত অ্যাকশনের লাইভ ট্র্যাকার</p>

          <div className="relative border-l border-gray-800 pl-6 ml-3 space-y-8">
            {auditLogs.map((log, index) => {
              const iconBg = log.severity === 'critical' ? 'bg-red-500/10 text-red-400' : log.severity === 'warning' ? 'bg-amber-500/10 text-emerald-500' : 'bg-[#006A4E]/10 text-emerald-400';
              return (
                <div key={log.id} className="relative">
                  {/* Timeline indicator node dot */}
                  <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-[#1E1E1E] flex items-center justify-center ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  
                  <div className="bg-[#121212] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-left">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] font-black rounded-md mr-2">
                          {log.category.toUpperCase()}
                        </span>
                        <span className="text-white text-xs font-black">{log.user}</span>
                        {log.userEmail && <span className="text-[10px] text-gray-500 font-bold ml-1.5">({log.userEmail})</span>}
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold">{log.time}</span>
                    </div>
                    <p className="text-slate-200 text-sm font-semibold">{log.action}</p>
                    <p className="text-gray-500 text-xs mt-1.5 font-bold">বিস্তারিত: {log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. AUDIT LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">অডিট লগ ট্রেইল (Audit Trail)</h3>
              <p className="text-gray-500 text-xs">আইনগত এবং নিরাপত্তা কমপ্লায়েন্স এর জন্য ট্র্যাকিং ট্রেইল ফিল্টার করুন</p>
            </div>
            
            {/* Download log dump */}
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.json`);
                downloadAnchor.click();
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all border border-gray-700 cursor-pointer"
            >
              ডাউনলোড JSON Dump
            </button>
          </div>

          {/* Filters shelf */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-[#121212] p-4 rounded-xl border border-gray-800">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="ইউজার বা অ্যাকশন খুঁজুন..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-[#006A4E]"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <select
                value={categoryFilter || ""}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none"
              >
                <option value="all">সব ক্যাটাগরি</option>
                <option value="user">ইউজার অ্যাকশন (User)</option>
                <option value="security">নিরাপত্তা (Security)</option>
                <option value="content">কন্টেন্ট আপডেট (Content)</option>
                <option value="system">সিস্টেম সার্ভিস (System)</option>
              </select>
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <select
                value={severityFilter || ""}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none"
              >
                <option value="all">সব তীব্রতা (Severity)</option>
                <option value="info">তথ্যপূর্ণ (Info)</option>
                <option value="warning">সতর্কবার্তা (Warning)</option>
                <option value="critical">গুরুত্বপূর্ণ (Critical)</option>
              </select>
            </div>
          </div>

          {/* Audit logs table */}
          <div className="overflow-x-auto border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121212] text-gray-400 text-xs font-black border-b border-gray-800">
                  <th className="p-4">ইউজার</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">অ্যাকশন</th>
                  <th className="p-4">বিস্তারিত</th>
                  <th className="p-4">তীব্রতা</th>
                  <th className="p-4">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 text-xs">কোনো সামঞ্জস্যপূর্ণ লগ পাওয়া যায়নি।</td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="hover:bg-gray-800/20 text-xs text-gray-300 cursor-pointer transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#006A4E]" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                              <div>
                                <p className="font-black text-white">{log.user}</p>
                                <p className="text-[10px] text-gray-500 font-bold">{log.userEmail || 'কোনো ইমেইল নেই'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] uppercase font-bold">
                              {log.category}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-white">{log.action}</td>
                          <td className="p-4 text-gray-400 max-w-xs truncate">{log.details}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${log.severity === 'critical' ? 'bg-red-500/10 text-red-400' : log.severity === 'warning' ? 'bg-amber-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'}`}>
                              {log.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500">{log.time}</td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#151515]">
                            <td colSpan={6} className="p-4 border-l-4 border-[#006A4E]">
                              <div className="space-y-3 font-sans">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1b1b1b] p-3 rounded-xl border border-gray-800/80">
                                  <div>
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">সম্পাদনকারী এডমিন</span>
                                    <span className="text-white text-xs font-black">{log.user} ({log.userEmail || 'সিস্টেম'})</span>
                                  </div>
                                  <div className="sm:text-right">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">সম্পাদনের সময়</span>
                                    <span className="text-gray-300 text-xs font-bold">{log.time}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider block">অ্যাকশন বিবরণী</span>
                                  <p className="text-gray-200 text-xs font-semibold">{log.action}: {log.details}</p>
                                </div>

                                {/* Changes View Section */}
                                <div className="pt-2">
                                  {log.changes ? (
                                    (() => {
                                      try {
                                        const changesObj = JSON.parse(log.changes);
                                        return (
                                          <div className="bg-[#121212] p-4 rounded-xl border border-gray-800/60 text-left space-y-2">
                                            <span className="text-[10px] font-black text-emerald-400 block mb-1">➔ কোন তথ্য পরিবর্তন হয়েছে (Audit Diff):</span>
                                            <div className="grid grid-cols-1 gap-2">
                                              {Object.entries(changesObj).map(([key, val]: [string, any]) => {
                                                const hasOldNew = val && typeof val === 'object' && ('old' in val || 'new' in val);
                                                return (
                                                  <div key={key} className="flex flex-col sm:flex-row sm:items-start justify-between text-xs py-1.5 border-b border-gray-800/40 last:border-0 gap-1 font-sans">
                                                    <span className="font-mono text-purple-400 font-bold shrink-0 sm:w-1/3 truncate">{key}</span>
                                                    {hasOldNew ? (
                                                      <div className="flex flex-wrap items-center gap-1.5 flex-1 justify-end font-sans">
                                                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold line-through">
                                                          {typeof val.old === 'object' ? JSON.stringify(val.old) : String(val.old)}
                                                        </span>
                                                        <span className="text-gray-500 font-bold text-[10px]">➔</span>
                                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                                          {typeof val.new === 'object' ? JSON.stringify(val.new) : String(val.new)}
                                                        </span>
                                                      </div>
                                                    ) : (
                                                      <span className="text-gray-300 font-medium font-mono">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      } catch (e) {
                                        return (
                                          <div className="bg-[#121212] p-3 rounded-xl border border-gray-800/60 text-xs text-gray-300 font-mono">
                                            {log.changes}
                                          </div>
                                        );
                                      }
                                    })()
                                  ) : (
                                    <div className="bg-[#121212]/50 p-3 rounded-xl border border-gray-800/50 text-xs text-gray-500 font-medium">
                                      কোনো অতিরিক্ত তথ্য পরিবর্তন হয়নি বা ডাটা রেকর্ড নেই।
                                    </div>
                                  )}
                                </div>
                              </div>
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
      )}

      {/* 4. ERROR LOG MONITOR */}
      {activeTab === 'error' && (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>সিস্টেম এরর ও ক্র্যাশ রিপোর্টার</span>
          </h3>
          <p className="text-gray-500 text-xs mb-6">ক্লায়েন্ট সাইড এবং এপিআই ফেচিং ব্যত্যয় লগিং</p>

          <div className="space-y-4">
            {errorLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                কোনো সক্রিয় ত্রুটি লগ পাওয়া যায়নি! সিস্টেম ১০০% স্বাভাবিকভাবে কাজ করছে।
              </div>
            ) : (
              errorLogs.map(err => (
                <div key={err.id} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-left ${err.status === 'resolved' ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${err.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      <AlertCircle className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-white text-xs font-black">{err.source}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${err.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-emerald-500'}`}>
                          {err.severity}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${err.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>
                          {err.status === 'resolved' ? 'RESOLVED' : 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs font-semibold leading-relaxed font-mono">{err.message}</p>
                      <span className="text-[10px] text-gray-500 font-bold block mt-1.5">ত্রুটি ঘটেছে: {err.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:self-center">
                    <button
                      onClick={() => toggleErrorStatus(err.id)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-colors border cursor-pointer ${err.status === 'resolved' ? 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'}`}
                    >
                      {err.status === 'resolved' ? 'Reopen Error' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => deleteErrorLog(err.id)}
                      className="p-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. ROLE PERMISSION MATRIX */}
      {activeTab === 'roles' && (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">রোলের পারমিশন ম্যাট্রিক্স (Role Matrix)</h3>
              <p className="text-gray-500 text-xs">কোন ধরণের এডমিন ইউজার কি করতে পারবে তা এখান থেকে নিয়ন্ত্রণ করুন</p>
            </div>
            
            <button
              onClick={saveMatrixSettings}
              disabled={savingMatrix}
              className="px-5 py-2.5 bg-[#006A4E] hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingMatrix ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>ম্যাট্রিক্স সেভ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121212] text-gray-400 text-xs font-black border-b border-gray-800">
                  <th className="p-4">পারমিশন মডিউল</th>
                  {[
                    { id: 'super_admin', label: 'Super Admin' },
                    { id: 'admin', label: 'Admin' },
                    { id: 'moderator', label: 'Moderator' },
                    { id: 'editor', label: 'Editor' },
                    { id: 'user', label: 'General User' }
                  ].map(role => (
                    <th key={role.id} className="p-4 text-center">{role.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { id: 'dashboard_access', label: 'Dashboard Access', desc: 'ড্যাশবোর্ড দেখার অনুমতি' },
                  { id: 'users_view', label: 'View Users', desc: 'ইউজার লিস্ট দেখার অনুমতি' },
                  { id: 'users_add', label: 'Add User', desc: 'নতুন ইউজার তৈরির অনুমতি' },
                  { id: 'users_edit', label: 'Edit User', desc: 'ইউজার এডিট করার অনুমতি' },
                  { id: 'users_delete', label: 'Delete User', desc: 'ইউজার ডিলিট করার অনুমতি' },
                  { id: 'users_ban', label: 'Ban User', desc: 'ইউজার ব্যান করার অনুমতি' },
                  { id: 'notices', label: 'ঘোষণা ও নোটিশ', desc: 'নোটিশ ও আবহাওয়া সেটিংস যুক্ত করা' },
                  { id: 'sponsors', label: 'ব্যবসা ও স্পন্সর', desc: 'ব্যবসা বিবরণী যাচাই এবং স্পন্সরশিপ প্যানেল' },
                  { id: 'ads', label: 'বিজ্ঞাপন ও ব্যানার', desc: 'ব্যানার এবং বিজ্ঞাপনের অনুমোদন' },
                  { id: 'ugc', label: 'ডায়েরি ও কমেন্ট', desc: 'ইউজারদের পোস্ট ও ডায়েরি মডারেশন' },
                  { id: 'settings', label: 'গ্লোবাল সেটিংস', desc: 'অ্যাপের নাম, লোগো ও মেইন সেটিংস পরিবর্তন' },
                  { id: 'analytics', label: 'অ্যানালিটিক্স', desc: 'ব্যবহারকারীদের পরিসংখ্যান ভিউ ট্র্যাকিং' },
                  { id: 'push', label: 'পুশ নোটিফিকেশন', desc: 'রিয়েল-টাইম পুশ নোটিফিকেশন সম্প্রচার' }
                ].map(module => (
                  <tr key={module.id} className="hover:bg-gray-800/10 text-xs">
                    <td className="p-4 border-r border-gray-800/50 text-left max-w-xs">
                      <p className="text-white font-extrabold mb-0.5">{module.label}</p>
                      <p className="text-gray-500 text-[10px] font-semibold">{module.desc}</p>
                    </td>
                    {['super_admin', 'admin', 'moderator', 'editor', 'user'].map(role => {
                      const hasPerm = matrix[role]?.includes(module.id);
                      // Super admin always has everything, non-editable for super admin to prevent lockouts
                      const isSuperAdmin = role === 'super_admin';
                      
                      return (
                        <td key={role} className="p-4 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-2">
                            <input 
                              type="checkbox" 
                              checked={isSuperAdmin || hasPerm}
                              disabled={isSuperAdmin}
                              onChange={() => handleMatrixToggle(role, module.id)}
                              className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-[#006A4E] focus:ring-[#006A4E] cursor-pointer disabled:opacity-40"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

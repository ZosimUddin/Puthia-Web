import React, { useState, useEffect } from "react";
import { History, LogIn, AlertOctagon, Activity, ShieldAlert, Monitor, Search, Shield, Chrome, Globe, User, Clock, AlertTriangle } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const SystemLogs = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'logins' | 'blocked'>('activity');
  const [realLogs, setRealLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const staticActivityLogs = [
    { id: 'mock-1', action: 'আপডেট', resource: 'সাইট সেটিংস', user: 'Admin User', ip: '192.168.1.1', time: '১০ মিনিট আগে', timestamp: new Date(Date.now() - 10*60*1000).toISOString() },
    { id: 'mock-2', action: 'ডিলিট', resource: 'নোটিশ #১৪২', user: 'Editor One', ip: '192.168.1.5', time: '১ ঘন্টা আগে', timestamp: new Date(Date.now() - 60*60*1000).toISOString() },
    { id: 'mock-3', action: 'ক্রিয়েট', resource: 'নতুন ইউজার', user: 'Admin User', ip: '192.168.1.1', time: '৩ ঘন্টা আগে', timestamp: new Date(Date.now() - 3*60*60*1000).toISOString() },
  ];

  const loginHistory = [
    { id: 1, user: 'Admin User', role: 'super_admin', ip: '192.168.1.1', device: 'Chrome / Windows', status: 'success', time: 'আজ সকাল ১০:১৫' },
    { id: 2, user: 'Unknown', role: 'unknown', ip: '103.45.12.9', device: 'Safari / iOS', status: 'failed', time: 'আজ সকাল ৯:৩০' },
    { id: 3, user: 'Editor One', role: 'editor', ip: '192.168.1.5', device: 'Firefox / Mac', status: 'success', time: 'গতকাল বিকাল ৪:০০' },
  ];

  const blockedIPs = [
    { id: 1, ip: '103.45.12.9', reason: 'Repeated failed logins', date: '১২ জুলাই ২০২৬' },
    { id: 2, ip: '45.22.10.1', reason: 'Suspicious activity', date: '১০ জুলাই ২০২৬' },
  ];

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealLogs(logs);
    }, (err) => {
      console.error("Error subscribing to activity logs:", err);
    });
    return () => unsubscribe();
  }, []);

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const getCombinedActivityLogs = () => {
    // Merge real logs (prioritized) with mock logs
    const merged = [...realLogs];
    
    // Add mock logs if they don't look repetitive
    staticActivityLogs.forEach(mock => {
      if (!realLogs.some(real => real.action === mock.action && real.resource === mock.resource)) {
        merged.push({
          id: mock.id,
          timestamp: mock.timestamp,
          role: 'Admin',
          action: mock.action,
          resource: mock.resource,
          userName: mock.user,
          ip: mock.ip,
          isMock: true
        });
      }
    });

    // Sort by timestamp desc
    return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredLogs = getCombinedActivityLogs().filter(log => {
    const text = `${log.action || ""} ${log.role || ""} ${log.userName || ""} ${log.ip || ""} ${log.device || ""} ${log.browser || ""} ${log.resource || ""}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">সিকিউরিটি ও লগ (Security & Logs)</h2>
          <p className="text-sm font-bold text-gray-400">সিস্টেম অ্যাক্টিভিটি, রোল পরিবর্তন এবং সিকিউরিটি মনিটর করুন</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden w-full max-w-full">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-6 py-5 font-black text-sm whitespace-nowrap transition-colors relative ${activeTab === 'activity' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Activity size={18} /> অ্যাক্টিভিটি লগ (Activity Log)
            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
          <button
            onClick={() => setActiveTab('logins')}
            className={`flex items-center gap-2 px-6 py-5 font-black text-sm whitespace-nowrap transition-colors relative ${activeTab === 'logins' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LogIn size={18} /> লগইন হিস্ট্রি (Login History)
            {activeTab === 'logins' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center gap-2 px-6 py-5 font-black text-sm whitespace-nowrap transition-colors relative ${activeTab === 'blocked' ? 'text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <AlertOctagon size={18} /> ব্লকড আইপি (Block IP)
            {activeTab === 'blocked' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />}
          </button>
        </div>

        <div className="p-6 md:p-8">
            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm || ""}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="সার্চ করুন..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                />
            </div>

            {/* Content */}
            <div className="overflow-x-auto scrollbar-hide">
                {activeTab === 'activity' && (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                <th className="p-4 rounded-l-2xl">সময় (Time)</th>
                                <th className="p-4">রোল (Role)</th>
                                <th className="p-4">অ্যাকশন (Action)</th>
                                <th className="p-4">আইপি (IP)</th>
                                <th className="p-4">ডিভাইস (Device)</th>
                                <th className="p-4 rounded-r-2xl">ব্রাউজার (Browser)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-xs font-black text-slate-500 font-mono">
                                        {formatLogTime(log.timestamp)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${
                                                log.role === 'Super Admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                log.role === 'Admin' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                log.role === 'Moderator' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                log.role === 'Editor' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                'bg-slate-50 text-slate-600 border border-slate-100'
                                            }`}>
                                                {log.role || 'User'}
                                            </span>
                                            {log.userName && (
                                                <span className="text-[11px] font-bold text-gray-400 block max-w-[120px] truncate" title={log.userName}>
                                                    ({log.userName})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-black text-slate-800">
                                        {log.type === "role_switch" ? (
                                            <span className="text-emerald-600 flex items-center gap-1.5 font-black bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100 w-max">
                                                <Shield size={13} className="shrink-0 text-emerald-500 fill-emerald-100" />
                                                {log.action}
                                            </span>
                                        ) : log.type === "panel_duration" ? (
                                            <span className="text-blue-600 flex items-center gap-1.5 font-black bg-blue-50 px-2 py-1 rounded-xl border border-blue-100 w-max">
                                                <Clock size={13} className="shrink-0 text-blue-500" />
                                                {log.action}
                                            </span>
                                        ) : log.type === "security_violation" ? (
                                            <span className="text-rose-600 flex items-center gap-1.5 font-black bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100 animate-pulse w-max">
                                                <AlertTriangle size={13} className="shrink-0 text-rose-500" />
                                                {log.action}
                                            </span>
                                        ) : (
                                            <span className="text-gray-700 font-bold">
                                                {log.action} {log.resource ? `- ${log.resource}` : ''}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-[11px] font-mono font-bold text-gray-500">
                                        {log.ip || "192.168.1.1"}
                                    </td>
                                    <td className="p-4 text-[11px] font-bold text-gray-500">
                                        {log.device || "Windows Desktop"}
                                    </td>
                                    <td className="p-4 text-[11px] font-bold text-gray-400">
                                        {log.browser || "Chrome"}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-sm font-semibold text-gray-400">
                                        কোনো অ্যাক্টিভিটি লগ পাওয়া যায়নি।
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {activeTab === 'logins' && (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                <th className="p-4 rounded-l-2xl">ইউজার</th>
                                <th className="p-4">স্ট্যাটাস</th>
                                <th className="p-4">ডিভাইস / ব্রাউজার</th>
                                <th className="p-4">আইপি (IP)</th>
                                <th className="p-4 rounded-r-2xl text-right">সময়</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loginHistory.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-sm font-black text-gray-900">{log.user}</td>
                                    <td className="p-4 text-sm font-bold">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 w-max ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {log.status === 'success' ? 'সফল' : 'ব্যর্থ'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[11px] font-bold text-gray-500 flex items-center gap-2 mt-2"><Monitor size={14} className="text-gray-400"/> {log.device}</td>
                                    <td className="p-4 text-[11px] font-mono font-bold text-gray-500">{log.ip}</td>
                                    <td className="p-4 text-[11px] font-bold text-gray-400 text-right">{log.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'blocked' && (
                    <div className="space-y-4">
                        {blockedIPs.map(ip => (
                            <div key={ip.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-rose-50/30 border border-rose-100 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-mono font-black text-rose-700">{ip.ip}</h4>
                                        <p className="text-[11px] font-bold text-gray-500 mt-1">কারণ: {ip.reason} | ব্লক করা হয়েছে: {ip.date}</p>
                                    </div>
                                </div>
                                <button className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-50 transition-all">
                                    আনব্লক করুন
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;

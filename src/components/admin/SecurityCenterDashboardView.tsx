import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Lock, LogOut, Smartphone, Globe, AlertTriangle, 
  Terminal, Eye, UserCheck, Key, FileCheck, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { 
  mockActiveSessions, mockSecurityLogs, terminateAllActiveSessions, 
  ActiveSession, SecurityEventLog 
} from '../../services/advancedSecurityService';

export const SecurityCenterDashboardView: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>(mockActiveSessions);
  const [logs] = useState<SecurityEventLog[]>(mockSecurityLogs);
  const [terminating, setTerminating] = useState(false);
  const [terminatedMessage, setTerminatedMessage] = useState<string | null>(null);

  const handleLogoutAllSessions = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি সকল সেশন (নিজেরটি ছাড়া) জোরপূর্বক লগআউট করতে চান?")) return;
    setTerminating(true);
    const res = await terminateAllActiveSessions();
    setTerminating(false);
    setSessions(sessions.filter(s => s.current));
    setTerminatedMessage(`সফলভাবে ${res.terminatedCount} টি সক্রিয় সেশন বন্ধ করা হয়েছে!`);
    setTimeout(() => setTerminatedMessage(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <Lock size={14} className="text-rose-400" /> Advanced Security Center 🔐
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">নিরাপত্তা ও থ্রেট মনিটরিং ড্যাশবোর্ড</h1>
          <p className="text-xs text-rose-100/90 font-medium max-w-xl">
            সক্রিয় সেশন ম্যানেজমেন্ট, লগইন অ্যাক্টিভিটি ট্র্যাকিং, IP ফায়ারওয়াল এবং ফোর্সেড লগআউট সিকিউরিটি সেন্টার
          </p>
        </div>

        <button
          onClick={handleLogoutAllSessions}
          disabled={terminating}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <LogOut size={16} />
          <span>{terminating ? "সেশন বন্ধ হচ্ছে..." : "Logout All Sessions (সব সেশন বন্ধ করুন)"}</span>
        </button>
      </div>

      {terminatedMessage && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl font-black text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-700" />
          <span>{terminatedMessage}</span>
        </div>
      )}

      {/* Active Sessions Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Smartphone size={18} className="text-emerald-700" />
            সক্রিয় ডিভাইস ও অ্যাক্টিভ সেশনসমূহ ({sessions.length} টি সেশন)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((sess) => (
            <div 
              key={sess.id} 
              className={`p-4 rounded-2xl border space-y-2 transition-all ${
                sess.current 
                  ? 'bg-emerald-50/60 border-emerald-300' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-black text-xs text-slate-900">{sess.userName}</span>
                {sess.current ? (
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[9px] font-black">
                    বর্তমান সেশন
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[9px] font-black">
                    সক্রিয়
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-slate-600 space-y-0.5">
                <div className="flex items-center gap-1">
                  <Smartphone size={12} className="text-slate-400" /> {sess.device}
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={12} className="text-slate-400" /> IP: {sess.ipAddress} ({sess.location})
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-bold flex justify-between">
                <span>সর্বশেষ সক্রিয়:</span>
                <span>{sess.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit & Threat Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Terminal size={18} className="text-rose-600" />
          সিকিউরিটি অডিট ও থ্রেট ইভেন্ট লগ (Security Audit Log)
        </h3>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    log.severity === 'critical' || log.severity === 'high' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {log.type}
                  </span>
                  <span className="font-bold text-slate-900">{log.user}</span>
                  <span className="text-slate-400 font-mono">({log.ip})</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">{log.details}</p>
              </div>

              <span className="text-[10px] text-slate-400 font-bold shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

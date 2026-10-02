import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Server, Database, 
  Search, Cpu, HardDrive, Wifi, Lock, Clock, Zap, AlertCircle, FileArchive 
} from 'lucide-react';
import { getPlatformHealthStatus, PlatformHealthSummary, SystemMetric } from '../../services/platformHealthService';

export const PlatformHealthView: React.FC = () => {
  const [healthData, setHealthData] = useState<PlatformHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = () => {
    setLoading(true);
    setTimeout(() => {
      setHealthData(getPlatformHealthStatus());
      setLoading(false);
    }, 400);
  };

  if (!healthData) return null;

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" /> Platform Self-Monitoring Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">প্ল্যাটফর্ম হেলথ ও সেলফ-মনিটরিং ড্যাশবোর্ড</h1>
          <p className="text-xs text-emerald-100/90 font-medium max-w-xl">
            রিয়েল-টাইম সিস্টেম হেলথ, ডাটাবেজ স্থিতি, সার্চ রেসপন্স টাইম, সার্ভার লোড এবং অটোমেটিক নিরাপত্তা ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-5 py-3 bg-white text-slate-900 hover:bg-emerald-50 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-emerald-700" : ""} /> হেলথ রিফ্রেশ করুন
        </button>
      </div>

      {/* Critical & Warning Alerts Section */}
      {healthData.activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-600" />
            সক্রিয় সিস্টেম অ্যালার্ট (Critical & Warning System Alerts)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthData.activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border shadow-sm flex items-start justify-between gap-3 ${
                  alert.level === 'CRITICAL' 
                    ? 'bg-rose-50 border-rose-300 text-rose-950' 
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    alert.level === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {alert.level}
                  </span>
                  <p className="text-xs font-black leading-relaxed pt-1">{alert.message}</p>
                </div>
                <span className="text-[10px] font-bold opacity-75 shrink-0">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Metrics Grid (12 Key Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Metric Cards */}
        {[
          { label: "System Core Engine", item: healthData.systemHealth, icon: Cpu },
          { label: "Database Status", item: healthData.databaseStatus, icon: Database },
          { label: "Public & Internal API", item: healthData.apiStatus, icon: Zap },
          { label: "Background Queue", item: healthData.queueStatus, icon: Clock },
          { label: "System Cache", item: healthData.cacheStatus, icon: RefreshCw },
          { label: "Storage Status", item: healthData.storageUsage, icon: HardDrive },
          { label: "Search Engine", item: healthData.searchEngineStatus, icon: Search },
          { label: "Error Rate", item: healthData.errorRate, icon: AlertCircle },
          { label: "Response Time", item: healthData.responseTime, icon: Wifi },
          { label: "Server CPU & Memory", item: healthData.serverHealth, icon: Server },
          { label: "Automated Backup Status", item: healthData.backupStatus, icon: FileArchive },
          { label: "Security & Threat Status", item: healthData.securityEvents, icon: Lock }
        ].map(({ label, item, icon: Icon }, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon size={18} className="text-slate-600" />
                <h4 className="text-xs font-black text-slate-900">{label}</h4>
              </div>
              
              {/* Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                item.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' :
                item.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {item.status === 'healthy' ? 'Healthy' : item.status === 'warning' ? 'Warning' : 'Critical'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-black text-slate-800">{item.value}</span>
              {item.threshold && (
                <span className="text-[10px] font-bold text-slate-400 block">থ্রেশহোল্ড: {item.threshold}</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>সর্বশেষ চেক:</span>
              <span>{item.lastChecked}</span>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

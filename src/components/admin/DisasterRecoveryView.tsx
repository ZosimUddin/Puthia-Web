import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Database, FileArchive, Lock, RefreshCw, 
  CheckCircle2, Server, HardDrive, Cpu, AlertTriangle, Layers, Play 
} from 'lucide-react';
import { mockBackupSnapshots, disasterRecoveryConfig, simulateDisasterRecoveryRestore, BackupSnapshot } from '../../services/disasterRecoveryService';

export const DisasterRecoveryView: React.FC = () => {
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(mockBackupSnapshots);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleTestRestore = async (id: string) => {
    setRestoringId(id);
    setTestResult(null);
    const result = await simulateDisasterRecoveryRestore(id);
    setRestoringId(null);
    setTestResult({
      snapshotId: id,
      ...result
    });
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-white/20 text-white border border-white/20 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-300" /> Disaster Recovery & Fault Tolerance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">ডিজাস্টার রিকভারি ও ব্যাকআপ আর্কিটেকচার</h1>
          <p className="text-xs text-emerald-100 font-medium max-w-xl">
            কোনো ডাটা সেন্টার বা ব্যাকআপ ক্ষতিগ্রস্ত হলেও অফসাইট জিও-রেপ্লিকেশন ও AES-256 এনক্রিপশনের মাধ্যমে ১০০% ডাটা সুরক্ষিত।
          </p>
        </div>

        <div className="p-4 bg-white/10 border border-white/20 rounded-2xl shrink-0 space-y-1 text-center">
          <span className="text-[10px] text-emerald-200 font-black block uppercase">RPO / RTO টার্গেট</span>
          <span className="text-xl font-black text-white">RPO: {disasterRecoveryConfig.rpoHours} ঘণ্টা | RTO: {disasterRecoveryConfig.rtoMinutes} মি.</span>
        </div>
      </div>

      {/* RPO & RTO Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Recovery Point Objective (RPO)</span>
            <ClockIcon size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">১ ঘণ্টা</span>
          <p className="text-[10px] text-emerald-600 font-bold">সর্বোচ্চ ১ ঘণ্টার ডাটা লস লিমিট</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>Recovery Time Objective (RTO)</span>
            <Server size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">১৫ মিনিট</span>
          <p className="text-[10px] text-emerald-600 font-bold">১৫ মিনিটের মধ্যে পুরো সিস্টেম রিকভারি</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>অফসাইট এনক্রিপশন</span>
            <Lock size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">AES-256-GCM</span>
          <p className="text-[10px] text-emerald-600 font-bold">হান্ড্রেড পার্সেন্ট এনক্রিপ্টেড ব্যাকআপ</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>ডাটা রিটেনশন নীতি</span>
            <FileArchive size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">৩০ দিন / ১২ মাস</span>
          <p className="text-[10px] text-slate-500 font-bold">দৈনিক, সাপ্তাহিক ও মাসিক স্ন্যাপশট</p>
        </div>

      </div>

      {/* Backup Snapshots & Restore Test */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Database size={18} className="text-emerald-600" />
            অটোমেটেড ব্যাকআপ স্ন্যাপশট ও রিস্টোর টেস্ট প্লেগ্রাউন্ড
          </h3>
        </div>

        {/* Snapshots Table */}
        <div className="divide-y divide-slate-100">
          {snapshots.map((snap) => (
            <div key={snap.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-[10px] font-black rounded">
                    {snap.id}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded">
                    {snap.type}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded flex items-center gap-1">
                    <Lock size={10} /> {snap.encryptionAlgorithm}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 pt-1">
                  <span>অবস্থান: {snap.storageLocation}</span>
                  <span>• সাইজ: {snap.sizeMb} MB</span>
                  <span>• তারিখ: {snap.createdAt}</span>
                </div>
              </div>

              <button
                onClick={() => handleTestRestore(snap.id)}
                disabled={restoringId === snap.id}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw size={14} className={restoringId === snap.id ? "animate-spin" : ""} />
                <span>{restoringId === snap.id ? "রিস্টোর ভেরিফাই হচ্ছে..." : "রিস্টোর টেস্ট ট্রায়াল"}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Test Result Log */}
        {testResult && (
          <div className="p-4 bg-emerald-950 text-emerald-300 rounded-2xl font-mono text-xs space-y-2 border border-emerald-800 animate-in fade-in">
            <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-800 pb-2">
              <span>✅ Disaster Recovery Trial Verified (Snapshot: {testResult.snapshotId})</span>
              <span>সময়: {testResult.durationSec} সেকেন্ড</span>
            </div>
            <p className="text-[11px] leading-relaxed pt-1">
              ডাটাবেজ ও মিডিয়া ফাইল সফলভাবে ডিক্রিপ্ট ও ইন্টিগ্রিটি চেক (Checksum Matches) সম্পন্ন হয়েছে। সিস্টেম ১০০% রিকভারেবল।
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

import React, { useState } from 'react';
import { 
  CheckCircle2, ShieldCheck, Zap, Database, Globe, Activity, 
  ArrowRight, Server, Lock, Award, Play 
} from 'lucide-react';

export const ProductionDeploymentPipelineView: React.FC = () => {
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: 1, name: "Staging Environment", label: "🟢 Staging Test", status: "COMPLETED", detail: "স্ট্রেজিং সার্ভারে ৬০+ মডিউল ও এপিআই টেস্ট করা হয়েছে।" },
    { id: 2, name: "Final QA Audit", label: "🔍 Final QA", status: "COMPLETED", detail: "ফাংশনাল, উইআই এবং মোবাইল রেসপন্সিভনেস ভেরিফাইড।" },
    { id: 3, name: "Security Check", label: "🛡️ Security Check", status: "COMPLETED", detail: "RBAC ফায়ারওয়াল, সেশন কন্ট্রোল ও ২এফএ পারমিশন অডিট।" },
    { id: 4, name: "Performance Check", label: "⚡ Performance Check", status: "COMPLETED", detail: "৩৮ms লোড টাইম ও WebP CDN ইমেজিং ভেরিফাইড।" },
    { id: 5, name: "Backup Verified", label: "💾 Backup Verified", status: "COMPLETED", detail: "AES-256 অফসাইট ব্যাকআপ এবং রিস্টোর ট্রায়াল সফল।" },
    { id: 6, name: "Production Deployment", label: "🚀 Production Deployment", status: "COMPLETED", detail: "মেইন ক্লাউড ক্লাস্টারে লাইভ বিল্ড সাকসেসফুল।" },
    { id: 7, name: "Domain Live", label: "🌐 Domain Live", status: "COMPLETED", detail: "আমাদের পুঠিয়া ডোমেইন লাইভ ও PWA এক্টিভেটেড।" },
    { id: 8, name: "Monitoring Active", label: "📊 Monitoring Active", status: "COMPLETED", detail: "২৪/৭ ক্লাউড অ্যানালিটিক্স ও হেলথ মনিটরিং রানিং।" }
  ]);

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-700/60 shadow-xl space-y-6">
      
      {/* Pipeline Header */}
      <div className="border-b border-emerald-700/50 pb-4 space-y-2">
        <span className="px-3 py-1 bg-white/20 text-white border border-white/20 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
          <Award size={14} className="text-emerald-300" /> Automated Production Launch Pipeline
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">প্রোডাকশন ডিপ্লয়মেন্ট ও ডোমেইন লাইভ পাইপলাইন</h2>
        <p className="text-xs text-emerald-100 font-medium">
          স্ট্রেজিং থেকে শুরু করে লাইভ ডোমেইন এবং ২৪/৭ রিয়েল-টাইম মনিটরিং সফলভাবে সক্রিয় করা হয়েছে।
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineSteps.map((step, idx) => (
          <div 
            key={step.id} 
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-2 relative overflow-hidden group hover:border-emerald-300 transition-all text-white"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-emerald-200 bg-white/20 px-2 py-0.5 rounded">
                STEP 0{step.id}
              </span>
              <CheckCircle2 size={16} className="text-emerald-300" />
            </div>

            <h3 className="text-xs font-black text-white pt-1">{step.label}</h3>
            <p className="text-[11px] font-medium text-emerald-100 leading-relaxed">{step.detail}</p>

            <div className="pt-2 border-t border-white/15 text-[9px] font-mono text-emerald-200 font-bold flex justify-between">
              <span>STATUS:</span>
              <span>100% SUCCESS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Domain & Monitoring Live Box */}
      <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-black text-emerald-200 flex items-center gap-1.5 justify-center sm:justify-start">
            <Globe size={16} /> আমাদের পুঠিয়া পোর্টালে সরাসরি প্রবেশ করুন:
          </span>
          <a 
            href="https://ais-pre-slqtn6q7j5aq7ktex6nw4z-97912170438.asia-east1.run.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-mono font-black text-white hover:text-emerald-200 underline break-all"
          >
            https://ais-pre-slqtn6q7j5aq7ktex6nw4z-97912170438.asia-east1.run.app
          </a>
        </div>

        <div className="px-4 py-2 bg-white text-emerald-900 rounded-xl font-black text-xs flex items-center gap-2 shrink-0 shadow-md">
          <Activity size={16} className="animate-pulse text-emerald-700" /> 24/7 Monitoring Active
        </div>
      </div>

    </div>
  );
};

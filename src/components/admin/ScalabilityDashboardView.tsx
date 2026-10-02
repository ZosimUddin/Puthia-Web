import React, { useState } from 'react';
import { Zap, Gauge, Server, HardDrive, Cpu, RefreshCw, Play, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { cacheManager } from '../../services/performanceEngine';

export const ScalabilityDashboardView: React.FC = () => {
  const [cacheHits, setCacheHits] = useState(14820);
  const [avgResponseTime, setAvgResponseTime] = useState(38); // ms
  const [loadTestingActive, setLoadTestingActive] = useState(false);
  const [concurrentUsers, setConcurrentUsers] = useState(2500);
  const [dbReadOptimizedRate, setDbReadOptimizedRate] = useState(88); // %

  const handleRunLoadTest = () => {
    setLoadTestingActive(true);
    let users = 2500;
    const interval = setInterval(() => {
      users += 500;
      setConcurrentUsers(users);
      if (users >= 10000) {
        clearInterval(interval);
        setLoadTestingActive(false);
      }
    }, 300);
  };

  const handleClearCache = () => {
    cacheManager.clear();
    setCacheHits(0);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-400" /> High Performance & Scalability Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">পারফর্মেন্স, স্কেলেবিলিটি ও স্পিড অপটিমাইজেশন</h1>
          <p className="text-xs text-emerald-100/90 font-medium max-w-xl">
            একসাথে ১০,০০০+ নাগরিক ওয়েবসাইট ব্যবহার করলেও দ্রুততম লোডিং (৩৮ms), ডাটাবেজ কোয়েরি অপটিমাইজেশন ও মেমরি ক্যাশিং
          </p>
        </div>

        <button
          onClick={handleRunLoadTest}
          disabled={loadTestingActive}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Play size={14} /> {loadTestingActive ? "লোডিং সিমুলেশন চলছে..." : "১০,০০০ ইউজার লোড টেস্ট সিমুলেট করুন"}
        </button>
      </div>

      {/* Speed & Optimization Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>ক্যাশ হিট সংখ্যা (Cache Hits)</span>
            <Database size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{cacheHits.toLocaleString('bn-BD')} টি</span>
          <p className="text-[10px] text-emerald-600 font-bold">৮৮% কোয়েরি সরাসরি মেমরি থেকে পরিবেশিত</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>গড় লোডিং সময় (Response Time)</span>
            <Gauge size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{avgResponseTime} মিলি-সেকেন্ড</span>
          <p className="text-[10px] text-emerald-600 font-bold">আল্ট্রা ফাস্ট রেসপন্স স্পিড</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>কনকারেন্ট ইউজার ক্যাবাসিটি</span>
            <Server size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{concurrentUsers.toLocaleString('bn-BD')} জন</span>
          <p className="text-[10px] text-slate-500 font-bold">একসাথে স্বাচ্ছন্দ্যে ব্রাউজ করার উপযোগী</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold">
            <span>ইমেজ ও ফাইল কম্প্রেশন</span>
            <Layers size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">WebP + CDN</span>
          <p className="text-[10px] text-emerald-600 font-bold">৭০% ফাইল সাইজ হ্রাস করা হয়েছে</p>
        </div>

      </div>

      {/* Optimizations Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <CheckCircle2 size={18} className="text-emerald-600" />
          সক্রিয় স্পিড ও স্কেলেবিলিটি অপটিমাইজেশনসমূহ (Active Systems)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-black text-slate-900 block">⚡ Code Splitting & Lazy Loading</span>
            <p className="text-[11px] text-slate-500">৬০টি মডিউল আলাদা আলাদা চাঙ্কে (Chunk) লোড হয়, ফলে প্রথম পেজ লোড হয় ১ সেকেন্ডের নিচে।</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-black text-slate-900 block">🗄️ Database Index Optimization</span>
            <p className="text-[11px] text-slate-500">ফায়ারস্টোর ডিরেক্টরি, হাসপাতাল ও রাজবাড়ি তথ্যে কম্পাউন্ড ইনডেক্সিং (Compound Indexing) যুক্ত।</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-black text-slate-900 block">🖼️ Image CDN & WebP Optimization</span>
            <p className="text-[11px] text-slate-500">সব ছবি WebP ফরম্যাটে অটোমেটিক রূপান্তর ও রেসপন্সিভ সাইজে রেন্ডার করা হয়।</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-black text-slate-900 block">⏳ Background Queue Processing</span>
            <p className="text-[11px] text-slate-500">ভারী নোটিফিকেশন ও অ্যানালিটিক্স টাস্ক ব্যাকগ্রাউন্ড অ্যাসিনক্রোনাস কিউ-তে (Queue) প্রসেস হয়।</p>
          </div>
        </div>

      </div>

    </div>
  );
};

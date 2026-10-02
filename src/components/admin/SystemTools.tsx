import React, { useState } from 'react';
import { Database, Trash2, HardDrive, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BackupRestore from './BackupRestore';

const SubManagerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[24px] text-center text-slate-400">
    <Database className="mx-auto mb-4" size={48} />
    <h3 className="text-lg font-black text-slate-700">{title} ম্যানেজমেন্ট মডিউল</h3>
    <p className="text-xs font-bold mt-1">এই মডিউলটি তৈরির কাজ চলছে।</p>
  </div>
);

export default function SystemTools() {
  const [activeTab, setActiveTab] = useState<'backup' | 'export' | 'cache' | 'storage'>('backup');

  const tabs = [
    { id: 'backup', label: 'ব্যাকআপ ও রিস্টোর', icon: Shield },
    { id: 'export', label: 'ডেটাবেস এক্সপোর্ট', icon: Database },
    { id: 'cache', label: 'ক্যাশ ক্লিয়ার', icon: RefreshCw },
    { id: 'storage', label: 'স্টোরেজ ম্যানেজার', icon: HardDrive },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800">সিস্টেম টুলস</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">সিস্টেমের রক্ষণাবেক্ষণ ও ডেটা ম্যানেজমেন্ট।</p>
      </div>

      <div className="w-full bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar touch-pan-x">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-xs font-black transition-all shrink-0 flex-shrink-0 min-w-max cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'backup' && <BackupRestore />}
            {activeTab === 'export' && <SubManagerPlaceholder title="ডেটাবেস এক্সপোর্ট" />}
            {activeTab === 'cache' && <SubManagerPlaceholder title="ক্যাশ ক্লিয়ার" />}
            {activeTab === 'storage' && <SubManagerPlaceholder title="স্টোরেজ ম্যানেজার" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Smartphone, RotateCcw, Image, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SubManagerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[24px] text-center text-slate-400">
    <Smartphone className="mx-auto mb-4" size={48} />
    <h3 className="text-lg font-black text-slate-700">{title} ম্যানেজমেন্ট মডিউল</h3>
    <p className="text-xs font-bold mt-1">এই মডিউলটি তৈরির কাজ চলছে।</p>
  </div>
);

export default function MobileAppManagement() {
  const [activeTab, setActiveTab] = useState<'version' | 'update' | 'banner' | 'changelog'>('version');

  const tabs = [
    { id: 'version', label: 'অ্যাপ ভার্সন', icon: Smartphone },
    { id: 'update', label: 'ফোর্স আপডেট', icon: RotateCcw },
    { id: 'banner', label: 'অ্যাপ ব্যানার', icon: Image },
    { id: 'changelog', label: 'চেঞ্জলগ', icon: List },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800">মোবাইল অ্যাপ ম্যানেজমেন্ট</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">মোবাইল অ্যাপের ভার্সন ও কনফিগারেশন নিয়ন্ত্রণ করুন।</p>
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
            {activeTab === 'version' && <SubManagerPlaceholder title="অ্যাপ ভার্সন" />}
            {activeTab === 'update' && <SubManagerPlaceholder title="ফোর্স আপডেট" />}
            {activeTab === 'banner' && <SubManagerPlaceholder title="অ্যাপ ব্যানার" />}
            {activeTab === 'changelog' && <SubManagerPlaceholder title="চেঞ্জলগ" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BarChart, Users, FileText, Search, Download, MessageSquare, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SubManagerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[24px] text-center text-slate-400">
    <BarChart className="mx-auto mb-4" size={48} />
    <h3 className="text-lg font-black text-slate-700">{title} রিপোর্ট</h3>
    <p className="text-xs font-bold mt-1">এই রিপোর্ট মডিউলটি তৈরির কাজ চলছে।</p>
  </div>
);

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<'visitor' | 'popular' | 'search' | 'download' | 'complaint' | 'business'>('visitor');

  const tabs = [
    { id: 'visitor', label: 'ভিজিটর অ্যানালিটিক্স', icon: Users },
    { id: 'popular', label: 'পপুলার পেজ', icon: FileText },
    { id: 'search', label: 'সার্চ অ্যানালিটিক্স', icon: Search },
    { id: 'download', label: 'ডাউনলোড পরিসংখ্যান', icon: Download },
    { id: 'complaint', label: 'অভিযোগ পরিসংখ্যান', icon: MessageSquare },
    { id: 'business', label: 'বিজনেস পরিসংখ্যান', icon: Briefcase },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800">রিপোর্ট ও অ্যানালিটিক্স</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">সিস্টেমের সকল ডেটা ও রিপোর্ট বিশ্লেষণ করুন।</p>
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
            {activeTab === 'visitor' && <SubManagerPlaceholder title="ভিজিটর অ্যানালিটিক্স" />}
            {activeTab === 'popular' && <SubManagerPlaceholder title="পপুলার পেজ" />}
            {activeTab === 'search' && <SubManagerPlaceholder title="সার্চ অ্যানালিটিক্স" />}
            {activeTab === 'download' && <SubManagerPlaceholder title="ডাউনলোড পরিসংখ্যান" />}
            {activeTab === 'complaint' && <SubManagerPlaceholder title="অভিযোগ পরিসংখ্যান" />}
            {activeTab === 'business' && <SubManagerPlaceholder title="বিজনেস পরিসংখ্যান" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

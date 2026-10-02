import React, { useState } from 'react';
import { QrCode, CreditCard, Calendar, Users, AlertTriangle, Heart, BarChart2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SubManagerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[24px] text-center text-slate-400">
    <QrCode className="mx-auto mb-4" size={48} />
    <h3 className="text-lg font-black text-slate-700">{title} ম্যানেজমেন্ট মডিউল</h3>
    <p className="text-xs font-bold mt-1">এই মডিউলটি তৈরির কাজ চলছে।</p>
  </div>
);

export default function FeaturesManagement() {
  const [activeTab, setActiveTab] = useState<'qr' | 'id_card' | 'appointment' | 'volunteer' | 'disaster' | 'donation' | 'poll' | 'newsletter'>('qr');

  const tabs = [
    { id: 'qr', label: 'QR কোড জেনারেটর', icon: QrCode },
    { id: 'id_card', label: 'ডিজিটাল আইডি কার্ড', icon: CreditCard },
    { id: 'appointment', label: 'অ্যাইস্টারমেন্ট', icon: Calendar },
    { id: 'volunteer', label: 'ভলান্টিয়ার ম্যানেজমেন্ট', icon: Users },
    { id: 'disaster', label: 'দুর্যোগ সতর্কতা', icon: AlertTriangle },
    { id: 'donation', label: 'ডোনেশন', icon: Heart },
    { id: 'poll', label: 'পোল ও সার্ভে', icon: BarChart2 },
    { id: 'newsletter', label: 'নিউজলেটার', icon: Mail },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-800">ফিচার ম্যানেজমেন্ট</h2>
        <p className="text-xs font-bold text-slate-400 mt-1">সিস্টেমের বিভিন্ন ফিচার ও সার্ভিস পরিচালনা করুন।</p>
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
            {activeTab === 'qr' && <SubManagerPlaceholder title="QR কোড জেনারেটর" />}
            {activeTab === 'id_card' && <SubManagerPlaceholder title="ডিজিটাল আইডি কার্ড" />}
            {activeTab === 'appointment' && <SubManagerPlaceholder title="অ্যাইস্টারমেন্ট" />}
            {activeTab === 'volunteer' && <SubManagerPlaceholder title="ভলান্টিয়ার ম্যানেজমেন্ট" />}
            {activeTab === 'disaster' && <SubManagerPlaceholder title="দুর্যোগ সতর্কতা" />}
            {activeTab === 'donation' && <SubManagerPlaceholder title="ডোনেশন" />}
            {activeTab === 'poll' && <SubManagerPlaceholder title="পোল ও সার্ভে" />}
            {activeTab === 'newsletter' && <SubManagerPlaceholder title="নিউজলেটার" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings, Layout, Menu, FileText, Search, MessageSquare, Folder, Sparkles, CheckCircle2, Shield, Globe, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SeoSettingsManagement } from './SeoSettingsManagement';
import { CitizenDrawerManagement } from './CitizenDrawerManagement';
import { toast } from 'sonner';

export default function SiteManagement() {
  const [activeTab, setActiveTab] = useState<'settings' | 'homepage' | 'menu' | 'footer' | 'seo' | 'popup'>('menu');

  // General site settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'আমাদের পুঠিয়া',
    tagline: 'রাজশাহী জেলার ঐতিহ্যবাহী ও স্মার্ট নাগরিক সেবা পোর্টাল',
    contactPhone: '০১৭০০-১২৩৪৫৬',
    contactEmail: 'info@puthiadiary.gov.bd',
    address: 'পুঠিয়া উপজেলা পরিষদ, রাজশাহী - ৬২৬০',
    maintenanceMode: false,
    welcomePopup: true,
    popupTitle: 'আমাদের পুঠিয়া সিটিজেন পোর্টালে স্বাগতম!',
    popupMessage: 'ঘরে বসেই সকল সরকারি ই-সেবা ও নাগরিক তথ্য পেতে অ্যাপটি ব্যবহার করুন।',
    copyrightText: '© ২০২৬ আমাদের পুঠিয়া ডিজিটাল ডায়েরি। সর্বস্বত্ব সংরক্ষিত।'
  });

  const handleSaveGeneral = () => {
    toast.success('সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
  };

  const tabs = [
    { id: 'menu', label: '📱 সিটিজেন ড্রয়ার ও পেজ মেনু', icon: Menu },
    { id: 'settings', label: 'সাইট সেটিংস ও পরিচিতি', icon: Settings },
    { id: 'homepage', label: 'হোমপেজ ও ব্যানার বিল্ডার', icon: Layout },
    { id: 'footer', label: 'ফুটার ও কপিরাইট', icon: FileText },
    { id: 'seo', label: 'SEO ও মেটাডাটা', icon: Search },
    { id: 'popup', label: 'পপআপ ও ঘোষণা অ্যালার্ট', icon: MessageSquare },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">সাইট ম্যানেজমেন্ট ও কন্ট্রোল হাব</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">সিটিজেন সাইড ড্রয়ার মেনু, পেজসমূহ ও পোর্টালের সার্বিক গঠন নিয়ন্ত্রণ করুন।</p>
        </div>
        <span className="text-xs font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60 self-start sm:self-center">
          সুপার অ্যাডমিন ক্ষমতাপ্রাপ্ত
        </span>
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
            {activeTab === 'menu' && <CitizenDrawerManagement />}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-800">ওয়েবসাইট জেনারেল সেটিংস</h3>
                  <button onClick={handleSaveGeneral} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">
                    সংরক্ষণ করুন
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">ওয়েবসাইট টাইটেল</label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">স্লোগান / ট্যাগলাইন</label>
                    <input
                      type="text"
                      value={siteSettings.tagline}
                      onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">যোগাযোগ হেল্পলাইন নম্বর</label>
                    <input
                      type="text"
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">অফিসিয়াল ইমেইল</label>
                    <input
                      type="text"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'homepage' && (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-emerald-900">হোমপেজ লেআউট ও হিরো সেকশন বিল্ডার</h4>
                    <p className="text-xs text-emerald-700 font-medium">হিরো ব্যানার, ৬৩টি সেবা গ্রিড ও নোটিশ উইজেট কাস্টমাইজ করুন।</p>
                  </div>
                  <button onClick={() => window.location.href = '/admin/banners'} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer">
                    হিরো ব্যানার ম্যানেজমেন্ট
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">ফুটার কপিরাইট টেক্সট</label>
                  <input
                    type="text"
                    value={siteSettings.copyrightText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, copyrightText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <button onClick={handleSaveGeneral} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">
                  ফুটার সংরক্ষণ করুন
                </button>
              </div>
            )}

            {activeTab === 'seo' && <SeoSettingsManagement />}

            {activeTab === 'popup' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">ওয়েলকাম পপআপ অ্যালার্ট সক্রিয়</h4>
                    <p className="text-[11px] text-slate-400 font-medium">প্রথমবার ওয়েবসাইটে ভিজিটকারীদের ওয়েলকাম বার্তা প্রদর্শন করুন।</p>
                  </div>
                  <button
                    onClick={() => setSiteSettings({ ...siteSettings, welcomePopup: !siteSettings.welcomePopup })}
                    className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer ${
                      siteSettings.welcomePopup ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {siteSettings.welcomePopup ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">পপআপ শিরোনাম</label>
                  <input
                    type="text"
                    value={siteSettings.popupTitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, popupTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">পপআপ বার্তা</label>
                  <textarea
                    rows={3}
                    value={siteSettings.popupMessage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, popupMessage: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <button onClick={handleSaveGeneral} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black">
                  পপআপ সেটিংস সংরক্ষণ
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

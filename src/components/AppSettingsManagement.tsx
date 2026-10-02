import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Smartphone, Facebook, Link as LinkIcon } from 'lucide-react';
import { AppSettings } from '../types';
import { getAppSettings, updateAppSettings } from '../api';

const AppSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getAppSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching app settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateAppSettings(settings);
      alert('সেটিংস সফলভাবে সেভ করা হয়েছে!');
    } catch (error) {
      console.error("Error saving app settings:", error);
      alert('সেটিংস সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="text-center py-12 text-gray-400">লোড হচ্ছে...</div>;
  }

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-500" />
            <span>গ্লোবাল অ্যাপ সেটিংস</span>
        </h3>
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#006A4E] hover:bg-[#005c43] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
        >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
      </div>

      <div className="space-y-8">
          {/* General Info */}
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" /> সাধারণ তথ্য
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">অ্যাপের নাম</label>
                      <input 
                          type="text" 
                          value={settings.appName || ""}
                          onChange={(e) => setSettings({...settings, appName: e.target.value})}
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">হেল্পলাইন নম্বর</label>
                      <input 
                          type="text" 
                          value={settings.helplineNumber || ""}
                          onChange={(e) => setSettings({...settings, helplineNumber: e.target.value})}
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">লোগো URL</label>
                      <input 
                          type="text" 
                          value={settings.logoUrl || ""}
                          onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
              </div>
          </div>

          {/* Update & Maintenance Settings */}
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-sky-400" /> রক্ষণাবেক্ষণ ও অ্যাপ আপডেট সেটিংস
              </h4>
              <div className="space-y-6">
                  {/* Maintenance Mode Toggle */}
                  <div className="flex items-center justify-between bg-red-950/10 border border-red-900/30 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="isMaintenanceMode"
                            checked={settings.isMaintenanceMode || false}
                            onChange={(e) => setSettings({...settings, isMaintenanceMode: e.target.checked})}
                            className="w-5 h-5 rounded bg-[#121212] border-gray-700 text-[#006A4E] focus:ring-[#006A4E]"
                        />
                        <div>
                          <label htmlFor="isMaintenanceMode" className="text-white font-bold cursor-pointer block">
                              রক্ষণাবেক্ষণ মোড (Maintenance Mode)
                          </label>
                          <span className="text-xs text-gray-500 font-semibold">চালু করলে সাধারণ ব্যবহারকারীরা সাইট বা অ্যাপে প্রবেশ করতে পারবে না (শুধুমাত্র এডমিনরা পারবে)</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${settings.isMaintenanceMode ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                        {settings.isMaintenanceMode ? 'ACTIVE' : 'OFF'}
                      </span>
                  </div>

                  <div className="flex items-center gap-3 bg-[#1E1E1E] border border-gray-700 p-4 rounded-xl">
                      <input 
                          type="checkbox" 
                          id="updatePopupEnabled"
                          checked={settings.updatePopupEnabled}
                          onChange={(e) => setSettings({...settings, updatePopupEnabled: e.target.checked})}
                          className="w-5 h-5 rounded bg-[#121212] border-gray-700 text-[#006A4E] focus:ring-[#006A4E]"
                      />
                      <label htmlFor="updatePopupEnabled" className="text-white font-medium cursor-pointer">
                          "Update App" পপ-আপ চালু করুন
                      </label>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">প্লে-স্টোর লিংক</label>
                      <div className="relative">
                          <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                              type="text" 
                              value={settings.playStoreLink || ""}
                              onChange={(e) => setSettings({...settings, playStoreLink: e.target.value})}
                              placeholder="https://play.google.com/..."
                              className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* Home Page Sections Management */}
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" /> হোমপেজ সেকশন ম্যানেজমেন্ট
              </h4>
              <div className="space-y-4">
                  {settings.homePageSections?.sort((a, b) => a.order - b.order).map((section, index) => (
                      <div key={section.id} className="flex items-center gap-4 bg-[#1E1E1E] border border-gray-700 p-4 rounded-xl">
                          <input 
                              type="checkbox" 
                              checked={section.enabled}
                              onChange={(e) => {
                                  const updatedSections = [...(settings.homePageSections || [])];
                                  updatedSections[updatedSections.findIndex(s => s.id === section.id)].enabled = e.target.checked;
                                  setSettings({...settings, homePageSections: updatedSections});
                              }}
                              className="w-5 h-5 rounded bg-[#121212] border-gray-700 text-[#006A4E] focus:ring-[#006A4E]"
                          />
                          <span className="text-white font-medium flex-grow">{section.name}</span>
                          <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-400">সীমা:</label>
                              <input 
                                type="number"
                                value={section.limit || ''}
                                onChange={(e) => {
                                    const updatedSections = [...(settings.homePageSections || [])];
                                    const val = parseInt(e.target.value);
                                    updatedSections[updatedSections.findIndex(s => s.id === section.id)].limit = isNaN(val) ? 0 : val;
                                    setSettings({...settings, homePageSections: updatedSections});
                                }}
                                className="w-16 bg-[#121212] border border-gray-700 text-white px-2 py-1 rounded-lg text-center"
                              />
                          </div>
                          <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => {
                                    if (index === 0) return;
                                    const updatedSections = [...(settings.homePageSections || [])];
                                    const temp = updatedSections[index].order;
                                    updatedSections[index].order = updatedSections[index-1].order;
                                    updatedSections[index-1].order = temp;
                                    setSettings({...settings, homePageSections: updatedSections});
                                }}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-white disabled:opacity-30"
                            >▲</button>
                            <button 
                                onClick={() => {
                                    const updatedSections = [...(settings.homePageSections || [])];
                                    if (index === updatedSections.length - 1) return;
                                    const temp = updatedSections[index].order;
                                    updatedSections[index].order = updatedSections[index+1].order;
                                    updatedSections[index+1].order = temp;
                                    setSettings({...settings, homePageSections: updatedSections});
                                }}
                                disabled={index === (settings.homePageSections?.length || 0) - 1}
                                className="text-gray-400 hover:text-white disabled:opacity-30"
                            >▼</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Today's Puthia Management */}
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📅</span> আজকের পুঠিয়া (হোমপেজ)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">আজকের আবহাওয়া</label>
                      <input 
                          type="text" 
                          value={settings.todaysPuthia?.weather || ''}
                          onChange={(e) => setSettings({
                              ...settings, 
                              todaysPuthia: { ...(settings.todaysPuthia || {prayerTime:'', event:'', news:'', notice:''}), weather: e.target.value }
                          })}
                          placeholder="৩২°C, রোদ"
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">প্রধান সংবাদ</label>
                      <input 
                          type="text" 
                          value={settings.todaysPuthia?.news || ''}
                          onChange={(e) => setSettings({
                              ...settings, 
                              todaysPuthia: { ...(settings.todaysPuthia || {weather:'', prayerTime:'', event:'', notice:''}), news: e.target.value }
                          })}
                          placeholder="উপজেলায় আইটি পার্ক"
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">জরুরি নোটিশ</label>
                      <input 
                          type="text" 
                          value={settings.todaysPuthia?.notice || ''}
                          onChange={(e) => setSettings({
                              ...settings, 
                              todaysPuthia: { ...(settings.todaysPuthia || {weather:'', prayerTime:'', event:'', news:'', marketPrice:''}), notice: e.target.value }
                          })}
                          placeholder="বিকেল ৫টায় লোডশেডিং"
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">বাজারদর</label>
                      <input 
                          type="text" 
                          value={settings.todaysPuthia?.marketPrice || ''}
                          onChange={(e) => setSettings({
                              ...settings, 
                              todaysPuthia: { ...(settings.todaysPuthia || {weather:'', prayerTime:'', event:'', news:'', notice:''}), marketPrice: e.target.value }
                          })}
                          placeholder="পেঁয়াজ: ১০০৳/কেজি"
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
              </div>
          </div>

          {/* Social Media */}
          <div className="bg-[#121212] p-5 rounded-xl border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-500" /> সোশ্যাল মিডিয়া লিংক
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">ফেসবুক পেজ লিংক</label>
                      <input 
                          type="text" 
                          value={settings.facebookPage || ""}
                          onChange={(e) => setSettings({...settings, facebookPage: e.target.value})}
                          placeholder="https://facebook.com/..."
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">ফেসবুক গ্রুপ লিংক</label>
                      <input 
                          type="text" 
                          value={settings.facebookGroup || ""}
                          onChange={(e) => setSettings({...settings, facebookGroup: e.target.value})}
                          placeholder="https://facebook.com/groups/..."
                          className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#006A4E]"
                      />
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default AppSettingsManagement;

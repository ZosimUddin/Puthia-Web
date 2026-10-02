import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { getAppSettings } from '../api';

const defaultSettings: AppSettings = {
  appName: 'আমাদের পুঠিয়া',
  helplineNumber: '০১৭০০-০০০০০০',
  logoUrl: '/logo.png',
  facebookPage: 'https://facebook.com',
  facebookGroup: 'https://facebook.com/groups',
  updatePopupEnabled: false,
  playStoreLink: 'https://play.google.com/store/apps',
  homePageSections: [
    { id: 'quickServices', name: 'দ্রুত সেবা', enabled: true, order: 1, limit: 8 },
    { id: 'announcements', name: 'গুরুত্বপূর্ণ ঘোষণা', enabled: true, order: 2, limit: 5 },
    { id: 'statistics', name: 'পরিসংখ্যান', enabled: true, order: 3, limit: 4 },
    { id: 'community', name: 'কমিউনিটি', enabled: true, order: 4, limit: 3 },
    { id: 'agriculture', name: 'কৃষি', enabled: true, order: 5, limit: 3 },
    { id: 'business', name: 'ব্যবসা ও বাজার', enabled: true, order: 6, limit: 5 },
    { id: 'tourism', name: 'ইতিহাস ও পর্যটন', enabled: true, order: 7, limit: 3 },
    { id: 'news', name: 'স্থানীয় সংবাদ', enabled: true, order: 8, limit: 3 },
    { id: 'heroSlider', name: 'Hero Slider', enabled: true, order: 9, limit: 3 },
    { id: 'govtNotice', name: 'সরকারি নোটিশ', enabled: true, order: 10, limit: 3 },
    { id: 'emergencyNotice', name: 'জরুরি ঘোষণা', enabled: true, order: 11, limit: 3 },
    { id: 'eventBanner', name: 'Event Banner', enabled: true, order: 12, limit: 3 },
    { id: 'advertisement', name: 'Advertisement', enabled: true, order: 13, limit: 3 },
  ]
};

const SettingsContext = createContext<{settings: AppSettings, loading: boolean}>({
  settings: defaultSettings,
  loading: true
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppSettings().then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(err => {
      console.warn("Error loading settings:", err?.message || err);
      setLoading(false);
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

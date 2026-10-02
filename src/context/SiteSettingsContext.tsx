import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SiteSettings } from '../types';
import defaultAppLogo from '../assets/images/puthia_official_icon_logo.jpg';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({ settings: null, loading: true });

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings({
          ...data,
          siteLogoUrl: data.siteLogoUrl || defaultAppLogo
        });
      } else {
        // Default settings fallback
        setSettings({
          id: 'main',
          siteName: "ঐতিহাসিক পুঠিয়া",
          siteLogoUrl: defaultAppLogo,
          headerText: "ঐতিহাসিক পুঠিয়া অনলাইন পোর্টাল",
          footerText: "© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত",
          showFooter: true,
          developerLabel: "ডেভেলপড বাই",
          developerName: "Josim Uddin",
          developerLink: "https://facebook.com/zosim.uddin001",
          developerHeartEmoji: "❤️",
          showDeveloperCredit: true,
          footerBgColor: "#022c22",
          footerTextColor: "#d1fae5",
          footerAccentColor: "#34d399",
          contactPhone: "017XXXXXXXX",
          contactEmail: "info@puthia.gov.bd",
          contactAddress: "পুঠিয়া, রাজশাহী",
          socialLinks: {
            facebook: "",
            twitter: "",
            youtube: "",
            instagram: ""
          },
          seoTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস, স্থান ও ডিজিটাল নাগরিক সেবা পোর্টাল",
          seoDescription: "পুঠিয়া উপজেলার সকল তথ্য, ঐতিহাসিক পুঠিয়া রাজবাড়ী মন্দির কমপ্লেক্স, পর্যটন গাইড, হাসপাতাল, ডাক্তার ডিরেক্টরি, রক্তের গ্রুপ, নোটিশ এবং অনলাইন নাগরিক সেবার ওয়ান-স্টপ পোর্টাল।",
          seoKeywords: "আমাদের পুঠিয়া, পুঠিয়া ডায়েরি, পুঠিয়া রাজবাড়ী, পুঠিয়া মন্দির কমপ্লেক্স, পুঠিয়া রাজশাহী, Puthia Rajbari, Puthia Upazila, Puthia Doctors, পুঠিয়া হাসপাতাল, বানেশ্বর বাজার, রাজশাহী পর্যটন",
          ogImageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630",
          ogTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি",
          ogDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য, পর্যটন স্থান এবং ডিজিটাল নাগরিক সেবা সম্বলিত একমাত্র অনলাইন হাব।",
          twitterCard: "summary_large_image",
          twitterTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি",
          twitterDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য, পর্যটন স্থান এবং ডিজিটাল নাগরিক সেবা সম্বলিত একমাত্র অনলাইন হাব।",
          twitterImage: "https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630",
          canonicalUrl: typeof window !== "undefined" ? window.location.origin : "https://amaderputhia.gov.bd",
          robotsIndex: true,
          robotsFollow: true,
          authorName: "আমাদের পুঠিয়া ওয়েব টিম",
          geoRegion: "BD-54",
          geoPlacename: "Puthia, Rajshahi",
          geoPosition: "24.3683;88.8358",
          googleSearchConsole: "",
          bingVerification: "",
          googleAnalyticsId: "",
          googleMapsApiKey: "",
          pushNotificationKey: "",
          showHeroSlider: true,
          heroSliderAutoplayDelay: 4,
          showNoticeTicker: true,
          noticeTickerBadgeText: "নোটিশ",
          noticeTickerBadgeIcon: "Megaphone",
          noticeTickerBadgeColor: "emerald",
          noticeTickerSpeed: 25,
          noticeTickerDestination: "/notice",
          noticeTickerPauseOnHover: true,
          isMaintenanceMode: false,
          updatedAt: new Date().toISOString()
        });
      }
      setLoading(false);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for site settings. Using default settings.");
      } else {
        console.warn("Error fetching settings realtime:", error?.message || error);
      }
      setSettings({
        id: 'main',
        siteName: "আমাদের পুঠিয়া",
        siteLogoUrl: "",
        headerText: "তথ্য ও সেবা এখন হাতের মুঠোয়",
        footerText: "© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত",
        showFooter: true,
        developerLabel: "ডেভেলপড বাই",
        developerName: "Josim Uddin",
        developerLink: "https://facebook.com/zosim.uddin001",
        developerHeartEmoji: "❤️",
        showDeveloperCredit: true,
        footerBgColor: "#022c22",
        footerTextColor: "#d1fae5",
        footerAccentColor: "#34d399",
        contactPhone: "017XXXXXXXX",
        contactEmail: "info@puthia.gov.bd",
        contactAddress: "পুঠিয়া, রাজশাহী",
        socialLinks: {
          facebook: "",
          twitter: "",
          youtube: "",
          instagram: ""
        },
        seoTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস, স্থান ও ডিজিটাল নাগরিক সেবা পোর্টাল",
        seoDescription: "পুঠিয়া উপজেলার সকল তথ্য, ঐতিহাসিক পুঠিয়া রাজবাড়ী মন্দির কমপ্লেক্স, পর্যটন গাইড, হাসপাতাল, ডাক্তার ডিরেক্টরি, রক্তের গ্রুপ, নোটিশ এবং অনলাইন নাগরিক সেবার ওয়ান-স্টপ পোর্টাল।",
        seoKeywords: "আমাদের পুঠিয়া, পুঠিয়া ডায়েরি, পুঠিয়া রাজবাড়ী, পুঠিয়া মন্দির কমপ্লেক্স, পুঠিয়া রাজশাহী, Puthia Rajbari, Puthia Upazila, Puthia Doctors, পুঠিয়া হাসপাতাল, বানেশ্বর বাজার, রাজশাহী পর্যটন",
        ogImageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630",
        ogTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি",
        ogDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য, পর্যটন স্থান এবং ডিজিটাল নাগরিক সেবা সম্বলিত একমাত্র অনলাইন হাব।",
        twitterCard: "summary_large_image",
        twitterTitle: "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি",
        twitterDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য, পর্যটন স্থান এবং ডিজিটাল নাগরিক সেবা সম্বলিত একমাত্র অনলাইন হাব।",
        twitterImage: "https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630",
        canonicalUrl: typeof window !== "undefined" ? window.location.origin : "https://amaderputhia.gov.bd",
        robotsIndex: true,
        robotsFollow: true,
        authorName: "আমাদের পুঠিয়া ওয়েব টিম",
        geoRegion: "BD-54",
        geoPlacename: "Puthia, Rajshahi",
        geoPosition: "24.3683;88.8358",
        googleSearchConsole: "",
        bingVerification: "",
        googleAnalyticsId: "",
        googleMapsApiKey: "",
        pushNotificationKey: "",
        showHeroSlider: true,
        heroSliderAutoplayDelay: 4,
        showNoticeTicker: true,
        noticeTickerBadgeText: "নোটিশ",
        noticeTickerBadgeIcon: "Megaphone",
        noticeTickerBadgeColor: "emerald",
        noticeTickerSpeed: 25,
        noticeTickerDestination: "/notice",
        noticeTickerPauseOnHover: true,
        isMaintenanceMode: false,
        updatedAt: new Date().toISOString()
      });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

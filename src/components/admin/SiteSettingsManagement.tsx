import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { 
  Globe, 
  ImageIcon, 
  Phone, 
  Share2, 
  Search, 
  Bell, 
  Wrench, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Youtube, 
  Instagram, 
  MessageSquare, 
  Send,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  Volume2,
  Shield,
  AlertTriangle,
  UserCheck,
  Eye,
  EyeOff,
  Trash2,
  UserX,
  RefreshCw,
  Filter,
  Download,
  Plus,
  Check,
  X,
  Laptop,
  Activity,
  Server,
  FileText,
  Sliders,
  Megaphone
} from "lucide-react";
import { motion } from "motion/react";
import { SeoSettingsManagement } from "./SeoSettingsManagement";
import { getSiteSettings, updateSiteSettings } from "../../api";
import { SiteSettings, LoginHistoryLog, SuspiciousActivityLog } from "../../types";
import HeroSliderManagement from "./HeroSliderManagement";
import NoticeManagement from "./NoticeManagement";

type SettingsTab = 'website' | 'logo' | 'hero' | 'notice' | 'footer' | 'contact' | 'social' | 'seo' | 'notification' | 'maintenance' | 'security';

const TAB_ITEMS: { id: SettingsTab; label: string; icon: any; desc: string }[] = [
  { id: 'website', label: 'Website', icon: Globe, desc: 'সাইটের নাম, লেআউট ও কালার স্কিম' },
  { id: 'logo', label: 'Logo', icon: ImageIcon, desc: 'লোগো, ব্র্য্যান্ডিং ও অ্যাপ আইকন' },
  { id: 'notice', label: 'Emergency Notice', icon: Megaphone, desc: 'হোমপেজ জরুরি নোটিশ বার ও স্ক্রলিং বার্তা নিয়ন্ত্রণ' },
  { id: 'footer', label: 'Footer & Copyright', icon: FileText, desc: 'কপিরাইট নোটিশ, ডেভেলপার ক্রেডিট ও ফুটার ডিজাইন' },
  { id: 'contact', label: 'Contact', icon: Phone, desc: 'ফোন, ইমেইল, হেল্পলাইন ও অফিসিয়াল ঠিকানা' },
  { id: 'social', label: 'Social Links', icon: Share2, desc: 'ফেসবুক, ইউটিউব, টুইটার ও মিডিয়া লিংক' },
  { id: 'seo', label: 'SEO', icon: Search, desc: 'সার্চ ইঞ্জিন মেটাডাটা ও এনালিটিক্স' },
  { id: 'notification', label: 'Notification', icon: Bell, desc: 'পুশ নোটিফিকেশন, এসএমএস ও অ্যালার্ট' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, desc: 'মেইনটেনেন্স মোড ও সাইট অফলাইন কন্ট্রোল' },
  { id: 'security', label: 'Security', icon: Lock, desc: 'সিকিউরিটি, পাসওয়ার্ড পলিসি, সেশন, 2FA ও লগ' },
];

const SECURITY_SUB_TABS = [
  { id: 'all', label: 'Security', icon: Lock },
  { id: 'password-policy', label: 'Password Policy', icon: Key },
  { id: 'login-security', label: 'Login Security', icon: Key },
  { id: '2fa', label: '2FA', icon: ShieldCheck },
  { id: 'session', label: 'Session Management', icon: Clock },
  { id: 'login-history', label: 'Login History', icon: FileText },
  { id: 'suspicious', label: 'Suspicious Activity', icon: ShieldAlert },
  { id: 'admin-security', label: 'Admin Security', icon: Shield },
];

const sampleLoginLogs: LoginHistoryLog[] = [
  {
    id: 'log-1',
    userEmail: 'mdzosimuddin47@gmail.com',
    userName: 'জসিম উদ্দিন',
    userRole: 'Super Admin',
    ipAddress: '103.14.22.1',
    deviceInfo: 'Chrome (Windows 11 Pro)',
    location: 'Dhaka, Bangladesh',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'success'
  },
  {
    id: 'log-2',
    userEmail: 'admin.puthia@gov.bd',
    userName: 'অ্যাডমিন পুঠিয়া',
    userRole: 'Admin',
    ipAddress: '103.14.22.45',
    deviceInfo: 'Firefox 125 (macOS Sonoma)',
    location: 'Rajshahi, Bangladesh',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'success'
  },
  {
    id: 'log-3',
    userEmail: 'unknown_hacker@test.com',
    userName: 'Unknown IP',
    userRole: 'Guest',
    ipAddress: '185.220.101.4',
    deviceInfo: 'Python-requests/2.28',
    location: 'Frankfurt, Germany',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    status: 'failed',
    failReason: 'Invalid Password (Attempt 3/5)'
  },
  {
    id: 'log-4',
    userEmail: 'editor@puthia.gov.bd',
    userName: 'কনটেন্ট এডিটর',
    userRole: 'Editor',
    ipAddress: '103.14.22.89',
    deviceInfo: 'Safari 17 (iPhone 14 Pro)',
    location: 'Puthia, Rajshahi',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    status: 'success'
  },
  {
    id: 'log-5',
    userEmail: 'bot_attack@proxy.net',
    userName: 'Bot Agent',
    userRole: 'Guest',
    ipAddress: '194.26.29.112',
    deviceInfo: 'Curl/7.68.0',
    location: 'Moscow, Russia',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    status: 'blocked',
    failReason: 'Blocked IP Address'
  }
];

const sampleSuspiciousLogs: SuspiciousActivityLog[] = [
  {
    id: 'sus-1',
    ipAddress: '185.220.101.4',
    userEmail: 'unknown_hacker@test.com',
    attemptType: 'brute_force',
    severity: 'high',
    details: '৫ মিনিটের মধ্যে ১০ বার ভুল পাসওয়ার্ড ও পাসওয়ার্ড রিসেট চেষ্টা করা হয়েছে।',
    location: 'Frankfurt, Germany',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'active'
  },
  {
    id: 'sus-2',
    ipAddress: '194.26.29.112',
    attemptType: 'unauthorized_admin_access',
    severity: 'critical',
    details: 'অননুমোদিত IP থেকে /admin/settings রাউটে ডিরেক্ট হিট করা হয়েছে।',
    location: 'Moscow, Russia',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    status: 'blocked'
  },
  {
    id: 'sus-3',
    ipAddress: '45.142.214.12',
    attemptType: 'rapid_requests',
    severity: 'medium',
    details: 'প্রতি মিনিটে ১৫০+ API রিকোয়েস্ট হিট করে রেট লিমিট অতিক্রম করা হয়েছে।',
    location: 'Amsterdam, Netherlands',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    status: 'investigated'
  }
];

const SiteSettingsManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') as SettingsTab;
  const isSecurityRoute = location.pathname.includes('/admin/security');
  const isSeoRoute = location.pathname.includes('/admin/seo');
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    if (isSecurityRoute) return 'security';
    if (isSeoRoute) return 'seo';
    return TAB_ITEMS.some(t => t.id === activeTabParam) ? activeTabParam : 'website';
  });

  useEffect(() => {
    if (isSecurityRoute) {
      if (activeTab !== 'security') {
        setActiveTab('security');
      }
    } else if (isSeoRoute) {
      if (activeTab !== 'seo') {
        setActiveTab('seo');
      }
    } else if (activeTabParam && TAB_ITEMS.some(t => t.id === activeTabParam) && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, location.pathname, isSecurityRoute, isSeoRoute]);

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    if (tabId === 'security') {
      navigate('/admin/security?secTab=' + secTab);
    } else {
      if (isSecurityRoute) {
        navigate('/admin/settings?tab=' + tabId);
      } else {
        setSearchParams({ tab: tabId });
      }
    }
  };

  const secTabParam = searchParams.get('secTab') || 'all';
  const [secTab, setSecTab] = useState<string>(secTabParam);

  useEffect(() => {
    if (secTabParam && secTabParam !== secTab) {
      setSecTab(secTabParam);
    }
  }, [secTabParam]);

  const handleSecTabChange = (sub: string) => {
    setSecTab(sub);
    if (isSecurityRoute) {
      setSearchParams({ secTab: sub });
    } else {
      setSearchParams({ tab: 'security', secTab: sub });
    }
  };

  const [newBlockIP, setNewBlockIP] = useState('');
  const [loginHistorySearch, setLoginHistorySearch] = useState('');
  const [loginHistoryFilter, setLoginHistoryFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all');
  const [loginLogs, setLoginLogs] = useState<LoginHistoryLog[]>(sampleLoginLogs);
  const [suspiciousLogs, setSuspiciousLogs] = useState<SuspiciousActivityLog[]>(sampleSuspiciousLogs);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings({
          ...data,
          footerText: data.footerText || "© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত",
          showFooter: data.showFooter !== undefined ? data.showFooter : true,
          developerLabel: data.developerLabel || "ডেভেলপড বাই",
          developerName: data.developerName || "Josim Uddin",
          developerLink: data.developerLink || "https://facebook.com/zosim.uddin001",
          developerHeartEmoji: data.developerHeartEmoji || "❤️",
          showDeveloperCredit: data.showDeveloperCredit !== undefined ? data.showDeveloperCredit : true,
          footerBgColor: data.footerBgColor || "#022c22",
          footerTextColor: data.footerTextColor || "#d1fae5",
          footerAccentColor: data.footerAccentColor || "#34d399",
          socialLinks: {
            facebook: "",
            twitter: "",
            youtube: "",
            instagram: "",
            linkedin: "",
            whatsapp: "",
            telegram: "",
            ...(data.socialLinks || {})
          }
        });
      } else {
        setSettings({
          id: 'main',
          siteName: "ঐতিহাসিক পুঠিয়া",
          siteLogoUrl: "",
          darkLogoUrl: "",
          faviconUrl: "",
          appIconUrl: "",
          heroBannerUrl: "",
          themeColor: "emerald",
          homeLayout: "default",
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
          helplineNumber: "999",
          contactEmail: "info@puthia.gov.bd",
          contactAddress: "পুঠিয়া, রাজশাহী",
          workingHours: "প্রতিদিন ৯:০০ - ৫:০০",
          mapCoordinates: "24.3667, 88.8500",
          socialLinks: {
            facebook: "",
            twitter: "",
            youtube: "",
            instagram: "",
            linkedin: "",
            whatsapp: "",
            telegram: ""
          },
          seoTitle: "ঐতিহাসিক পুঠিয়া - রাজশাহী",
          seoDescription: "পুঠিয়ার ইতিহাস, ঐতিহ্য এবং নাগরিক সেবার ডিজিটাল প্ল্যাটফর্ম।",
          seoKeywords: "পুঠিয়া, রাজবাড়ি, মন্দির, রাজশাহী, সেবা",
          ogImageUrl: "",
          googleSearchConsole: "",
          googleAnalyticsId: "",
          googleMapsApiKey: "",
          pushNotificationKey: "",
          senderId: "PUTHIA-GOV",
          smsGatewayKey: "",
          emailSmtpHost: "smtp.puthia.gov.bd",
          enableSoundAlerts: true,
          isMaintenanceMode: false,
          maintenanceMessage: "সিস্টেম আপডেট করার কাজ চলছে। কিছুক্ষণের মধ্যে আমরা ফিরে আসবো।",
          allowedIPs: "127.0.0.1",
          security2FAEnforced: false,
          securityRequireMobileVerification: true,
          securitySessionTimeoutMinutes: 60,
          securityRateLimitPerMin: 120,
          loginMaxAttempts: 5,
          loginLockoutDurationMinutes: 15,
          passwordMinLength: 8,
          passwordRequireSpecialChar: true,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumber: true,
          passwordExpirationDays: 90,
          preventPasswordReuseCount: 3,
          forcePasswordResetOnFirstLogin: true,
          enableLoginCaptcha: false,
          loginAlertEmailOnNewDevice: true,
          security2FAForUsers: false,
          twoFactorMethod: 'sms',
          require2FAForSensitiveActions: true,
          maxConcurrentSessionsPerUser: 3,
          forceLogoutOnPasswordChange: true,
          rememberMeDurationDays: 30,
          enableSuspiciousAlerts: true,
          autoBlockSuspiciousIPs: true,
          blockedIPsList: ['185.220.101.4', '194.26.29.112'],
          adminMasterPinRequired: true,
          adminMasterPin: '123456',
          adminIpWhitelistOnly: false,
          adminAuditLogLevel: 'detailed',
          notifyAdminOnNewAdminCreation: true,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateSiteSettings(settings);
      setMessage({ type: 'success', text: 'সিস্টেম সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!' });
      setTimeout(() => setMessage(null), 3500);
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: 'error', text: 'সেটিংস সংরক্ষণে ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-28 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-3 text-emerald-600" size={36} />
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">সিস্টেম সেটিংস লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider border border-white/20">
            <Lock size={12} />
            Super Admin Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">সিস্টেম সেটিংস কনফিগারেটর</h1>
          <p className="text-emerald-100 text-xs md:text-sm max-w-2xl font-medium">
            ওয়েবসাইট ব্র্যান্ডিং, লোগো, যোগাযোগ তথ্য, সোশ্যাল মিডিয়া লিংক, এসইও, নোটিফিকেশন ও সিকিউরিটি ব্যবস্থাপনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin text-emerald-700" /> : <Save size={16} className="text-emerald-700" />}
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-xs ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">বন্ধ করুন</button>
        </motion.div>
      )}

      {/* Tab Content Panels */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-8">
        
        {/* 1. WEBSITE SETTINGS */}
        {activeTab === 'website' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Globe size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">1. Website (ওয়েবসাইট সেটিং)</h2>
                <p className="text-xs text-slate-500 font-medium">সাইটের শিরোনাম, হেডার/ফুটার টেক্সট, লেআউট ও রঙ স্কিম কনফিগার করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">সাইটের মূল নাম (Site Title)</label>
                <input 
                  type="text" 
                  value={settings.siteName || ""}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="যেমন: ঐতিহাসিক পুঠিয়া"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">থিমের কালার স্কিম (Primary Theme)</label>
                <select 
                  value={settings.themeColor || 'emerald'}
                  onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                >
                  <option value="emerald">সবুজ (Emerald - Default)</option>
                  <option value="teal">টিাল (Teal)</option>
                  <option value="blue">নীল (Royal Blue)</option>
                  <option value="indigo">ইন্ডিগো (Indigo)</option>
                  <option value="purple">বেগুনি (Purple)</option>
                  <option value="rose">গোলাপি (Rose)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">হেডার টেক্সট (Sub-Title)</label>
                <input 
                  type="text" 
                  value={settings.headerText || ""}
                  onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                  placeholder="ঐতিহাসিক পুঠিয়া অনলাইন পোর্টাল"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">হোমপেজ লেআউট স্টাইল</label>
                <select 
                  value={settings.homeLayout || 'default'}
                  onChange={(e) => setSettings({ ...settings, homeLayout: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                >
                  <option value="default">ডিফল্ট স্মার্ট কার্ড লেআউট (Standard)</option>
                  <option value="minimal">মিনিমাল ক্লিন ড্যাশবোর্ড (Minimalist)</option>
                  <option value="modern">মডার্ন হাই-কন্টাক্ট পোর্টাল (Modern)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ফুটার কপিরাইট টেক্সট (Footer Copyright Notice)</label>
                <button
                  type="button"
                  onClick={() => handleTabChange('footer')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <FileText size={12} />
                  <span>ফুটার ও ক্রেডিট পূর্ণ নিয়ন্ত্রণ করুন &rarr;</span>
                </button>
              </div>
              <input 
                type="text" 
                value={settings.footerText || ""}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                placeholder="© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
              />
            </div>
          </motion.div>
        )}

        {/* 2. LOGO & BRANDING */}
        {activeTab === 'logo' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <ImageIcon size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">2. Logo & Branding (লোগো ও ব্র্যান্ডিং)</h2>
                <p className="text-xs text-slate-500 font-medium">লাইটরুম/ডার্করুম লোগো, ফেভিকন, অ্যাপ আইকন ও হিরো ব্যানার কন্ট্রোল করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Logo */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">প্রধান লোগো URL (Main Site Logo)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={settings.siteLogoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, siteLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.siteLogoUrl ? <img src={settings.siteLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon size={20} className="text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Dark Logo */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ডার্ক মোড লোগো URL (Dark Version)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={settings.darkLogoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, darkLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo-dark.png"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.darkLogoUrl ? <img src={settings.darkLogoUrl} alt="Dark Logo" className="w-full h-full object-contain p-1" /> : <ImageIcon size={20} className="text-slate-600" />}
                  </div>
                </div>
              </div>

              {/* Favicon URL */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ব্রাউজার ফেভিকন (Favicon Icon URL)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={settings.faviconUrl || ""}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.faviconUrl ? <img src={settings.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" /> : <Globe size={18} className="text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Mobile App Icon */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">মোবাইল অ্যাপ আইকন (Mobile Icon URL)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={settings.appIconUrl || ""}
                    onChange={(e) => setSettings({ ...settings, appIconUrl: e.target.value })}
                    placeholder="https://example.com/app-icon.png"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {settings.appIconUrl ? <img src={settings.appIconUrl} alt="App Icon" className="w-full h-full object-cover" /> : <Smartphone size={18} className="text-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Banner Image */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">হিরো ব্যানার ইমেজ URL (Main Cover Background Banner)</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={settings.heroBannerUrl || ""}
                  onChange={(e) => setSettings({ ...settings, heroBannerUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1541872703-74c5e44368f9"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>
              {settings.heroBannerUrl && (
                <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative mt-2">
                  <img src={settings.heroBannerUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-xs font-bold">
                    Banner Preview
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* HERO & SLIDER MANAGEMENT */}
        {activeTab === 'hero' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <HeroSliderManagement />
          </motion.div>
        )}

        {/* EMERGENCY NOTICE TICKER MANAGEMENT */}
        {activeTab === 'notice' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <NoticeManagement />
          </motion.div>
        )}

        {/* 3. FOOTER & COPYRIGHT */}
        {activeTab === 'footer' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">3. Footer & Copyright (ফুটার ও কপিরাইট নিয়ন্ত্রণ)</h2>
                  <p className="text-xs text-slate-500 font-medium">কপিরাইট নোটিশ, ডেভেলপার ক্রেডিট (Josim Uddin), সোশ্যাল লিঙ্ক এবং ফুটার স্টাইলিং কাস্টমাইজ করুন</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({
                    ...settings,
                    showFooter: true,
                    footerText: "© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত",
                    showDeveloperCredit: true,
                    developerLabel: "ডেভেলপড বাই",
                    developerName: "Josim Uddin",
                    developerLink: "https://facebook.com/zosim.uddin001",
                    developerHeartEmoji: "❤️",
                    footerBgColor: "#022c22",
                    footerTextColor: "#d1fae5",
                    footerAccentColor: "#34d399",
                  })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>ডিফল্ট রিস্টোর</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>সেভ করুন</span>
                </button>
              </div>
            </div>

            {/* LIVE REAL-TIME PREVIEW */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-emerald-400" />
                  <span>লাইভ প্রিভিউ (হোমপেজের ফুটার যেমন দেখাবে)</span>
                </span>
                {settings.showFooter === false ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                    ফুটার বর্তমানে নিষ্ক্রিয় (Hidden)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    লাইভ সক্রিয় (Active)
                  </span>
                )}
              </div>

              <div 
                className="w-full rounded-xl py-3.5 px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-bold text-xs sm:text-sm tracking-tight transition-all border border-white/5"
                style={{ 
                  backgroundColor: settings.footerBgColor || '#022c22', 
                  color: settings.footerTextColor || '#d1fae5',
                  opacity: settings.showFooter === false ? 0.35 : 1
                }}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.footerText || "© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত"}</span>
                </div>

                {settings.showDeveloperCredit !== false && (
                  <>
                    <span className="hidden sm:inline text-emerald-600/80">|</span>
                    <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0">
                      <span>{settings.developerLabel || "ডেভেলপড বাই"}</span>
                      {settings.developerLink ? (
                        <a 
                          href={settings.developerLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline font-extrabold transition-opacity"
                          style={{ color: settings.footerAccentColor || '#34d399' }}
                        >
                          {settings.developerName || "Josim Uddin"}
                        </a>
                      ) : (
                        <span className="font-extrabold" style={{ color: settings.footerAccentColor || '#34d399' }}>
                          {settings.developerName || "Josim Uddin"}
                        </span>
                      )}
                      <span className="text-rose-500 animate-pulse ml-0.5">
                        {settings.developerHeartEmoji || "❤️"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* TOGGLE SWITCHES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">ফুটার বার প্রদর্শন করুন (Show Main Footer)</p>
                  <p className="text-[11px] text-slate-500 font-medium">ওয়েবসাইটের নিচে ফুটার বারটি দৃশ্যমান থাকবে কিনা</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={settings.showFooter !== false}
                    onChange={(e) => setSettings({ ...settings, showFooter: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">ডেভেলপার ক্রেডিট প্রদর্শন (Show Developer Credit)</p>
                  <p className="text-[11px] text-slate-500 font-medium">"ডেভেলপড বাই JOSIM UDDIN" অংশটি ফুটার বারে থাকবে কিনা</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={settings.showDeveloperCredit !== false}
                    onChange={(e) => setSettings({ ...settings, showDeveloperCredit: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* INPUT FIELDS: COPYRIGHT & DEVELOPER ATTRIBUTION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                কপিরাইট ও টেক্সট কনফিগারেশন
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span>ফুটার কপিরাইট টেক্সট (Copyright Notice)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={settings.footerText || ""}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  placeholder="© ২০২৬ আমাদের পুঠিয়া | সকল অধিকার সংরক্ষিত"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 font-medium">বামপাশের মূল কপিরাইট এবং সংরক্ষিত নোটিশ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ডেভেলপার লেবেল (Attribution Label)</label>
                  <input 
                    type="text" 
                    value={settings.developerLabel || ""}
                    onChange={(e) => setSettings({ ...settings, developerLabel: e.target.value })}
                    placeholder="ডেভেলপড বাই"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">যেমন: "ডেভেলপড বাই" অথবা "তৈরি করেছেন" বা "Developed by"</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ডেভেলপারের নাম (Developer Name)</label>
                  <input 
                    type="text" 
                    value={settings.developerName || ""}
                    onChange={(e) => setSettings({ ...settings, developerName: e.target.value })}
                    placeholder="JOSIM UDDIN"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">ফুটার বারে প্রদর্শিত নাম (যেমন: JOSIM UDDIN)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ডেভেলপারের ফেসবুক / প্রোফাইল লিংক (URL)</label>
                  <input 
                    type="text" 
                    value={settings.developerLink || ""}
                    onChange={(e) => setSettings({ ...settings, developerLink: e.target.value })}
                    placeholder="https://facebook.com/zosim.uddin001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">ক্লিক করলে যে ফেসবুক পেজ বা প্রোফাইল ওপেন হবে</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ইমোজি বা ব্যাজ সিম্বল (Badge / Emoji)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={settings.developerHeartEmoji || ""}
                      onChange={(e) => setSettings({ ...settings, developerHeartEmoji: e.target.value })}
                      placeholder="❤️"
                      className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none text-center text-base"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['❤️', '⚡', '🔥', '✨', '🇧🇩', '👑'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSettings({ ...settings, developerHeartEmoji: emoji })}
                          className={`w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all border ${
                            settings.developerHeartEmoji === emoji
                              ? 'bg-emerald-50 border-emerald-500 scale-110'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLOR SCHEME */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                ফুটার রঙ ও ভিজ্যুয়াল স্টাইল (Colors)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ব্যাকগ্রাউন্ড রঙ (Background)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.footerBgColor || "#022c22"}
                      onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input 
                      type="text" 
                      value={settings.footerBgColor || "#022c22"}
                      onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">টেক্সট রঙ (Text Color)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.footerTextColor || "#d1fae5"}
                      onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input 
                      type="text" 
                      value={settings.footerTextColor || "#d1fae5"}
                      onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">অ্যাকসেন্ট / লিংক রঙ (Accent)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={settings.footerAccentColor || "#34d399"}
                      onChange={(e) => setSettings({ ...settings, footerAccentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input 
                      type="text" 
                      value={settings.footerAccentColor || "#34d399"}
                      onChange={(e) => setSettings({ ...settings, footerAccentColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Palette Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">রেডিমেড থিম প্রিসেট:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      footerBgColor: "#022c22",
                      footerTextColor: "#d1fae5",
                      footerAccentColor: "#34d399",
                    })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#022c22] text-emerald-200 border border-emerald-700/60 hover:scale-105 transition-all cursor-pointer"
                  >
                    ডিফল্ট পুঠিয়া গ্রিন
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      footerBgColor: "#09090b",
                      footerTextColor: "#f4f4f5",
                      footerAccentColor: "#38bdf8",
                    })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-zinc-200 border border-zinc-700 hover:scale-105 transition-all cursor-pointer"
                  >
                    ডার্ক স্লেট ও সায়ান
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      footerBgColor: "#0f172a",
                      footerTextColor: "#e2e8f0",
                      footerAccentColor: "#60a5fa",
                    })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-slate-200 border border-slate-700 hover:scale-105 transition-all cursor-pointer"
                  >
                    নেভি ব্লু
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      footerBgColor: "#1e1b4b",
                      footerTextColor: "#f5f3ff",
                      footerAccentColor: "#c084fc",
                    })}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-950 text-indigo-200 border border-indigo-700 hover:scale-105 transition-all cursor-pointer"
                  >
                    রয়্যাল পার্পল
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Save bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ফুটার পরিবর্তন সেভ করুন'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. CONTACT SETTINGS */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Phone size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">3. Contact Details (যোগাযোগ তথ্য)</h2>
                <p className="text-xs text-slate-500 font-medium">অফিসিয়াল ফোন, ইমেইল, হেল্পলাইন নম্বর, গুগল ম্যাপ ও কর্মঘণ্টা</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">প্রধান যোগাযোগ ফোন (Primary Phone)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={settings.contactPhone || ""}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">জরুরি হেল্পলাইন হটলাইন (Helpline Hotline)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" />
                  <input 
                    type="text" 
                    value={settings.helplineNumber || ""}
                    onChange={(e) => setSettings({ ...settings, helplineNumber: e.target.value })}
                    placeholder="999 অথবা 333"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">অফিসিয়াল ইমেইল (Official Email)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    value={settings.contactEmail || ""}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="info@puthia.gov.bd"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">কর্মঘণ্টা ও সেবা প্রদান সময় (Office Hours)</label>
                <div className="relative">
                  <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={settings.workingHours || ""}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    placeholder="রবিবার-বৃহস্পতিবার: ৯:০০ - ৫:০০"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">কার্যালয়ের পূর্ণাঙ্গ ঠিকানা (Address)</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-3 text-slate-400" />
                  <textarea 
                    rows={2}
                    value={settings.contactAddress || ""}
                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                    placeholder="উপজেলা পরিষদ কমপ্লেক্স, পুঠিয়া, রাজশাহী"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">গুগল ম্যাপ স্থানাঙ্ক (Map Latitude, Longitude)</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input 
                    type="text" 
                    value={settings.mapCoordinates || ""}
                    onChange={(e) => setSettings({ ...settings, mapCoordinates: e.target.value })}
                    placeholder="24.3667, 88.8500"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. SOCIAL LINKS */}
        {activeTab === 'social' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Share2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">4. Social Links (সোশ্যাল মিডিয়া লিংকস)</h2>
                <p className="text-xs text-slate-500 font-medium">অফিসিয়াল ফেসবুক, ইউটিউব, টুইটার, ওয়াটসঅ্যাপ ও অন্যান্য সোশ্যাল পেজ সংযুক্ত করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Facebook size={14} className="text-[#1877F2]" /> Facebook Page URL
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.facebook || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                  placeholder="https://facebook.com/PuthiaUpazila"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Youtube size={14} className="text-[#FF0000]" /> YouTube Channel URL
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.youtube || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
                  placeholder="https://youtube.com/@PuthiaOfficial"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Twitter size={14} className="text-[#1DA1F2]" /> Twitter / X Profile
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.twitter || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                  placeholder="https://twitter.com/PuthiaGov"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Instagram size={14} className="text-[#E4405F]" /> Instagram Profile
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.instagram || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                  placeholder="https://instagram.com/Puthia_Rajshahi"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={14} className="text-emerald-600" /> WhatsApp Support Number / Group
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.whatsapp || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, whatsapp: e.target.value } })}
                  placeholder="https://wa.me/8801700000000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Send size={14} className="text-sky-500" /> Telegram Channel Link
                </label>
                <input 
                  type="text" 
                  value={settings.socialLinks?.telegram || ""}
                  onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, telegram: e.target.value } })}
                  placeholder="https://t.me/PuthiaCitizenNews"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. SEO & METADATA */}
        {activeTab === 'seo' && (
          <div className="pt-2">
            <SeoSettingsManagement />
          </div>
        )}

        {/* 6. NOTIFICATION */}
        {activeTab === 'notification' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Bell size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">6. Notification Settings (নোটিফিকেশন সেটিং)</h2>
                <p className="text-xs text-slate-500 font-medium">ওয়েব পুশ, এসএমএস গেটওয়ে, ইমেইল সার্ভার ও সাইরেন অ্যালার্ট</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Firebase Web Push Public Key (VAPID)</label>
                <input 
                  type="text" 
                  value={settings.pushNotificationKey || ""}
                  onChange={(e) => setSettings({ ...settings, pushNotificationKey: e.target.value })}
                  placeholder="BXXXXXX..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">নোটিফিকেশন সেন্ডার আইডি (Sender Name)</label>
                <input 
                  type="text" 
                  value={settings.senderId || ""}
                  onChange={(e) => setSettings({ ...settings, senderId: e.target.value })}
                  placeholder="PUTHIA-GOV"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">SMS Gateway API Secret Key</label>
                <input 
                  type="password" 
                  value={settings.smsGatewayKey || ""}
                  onChange={(e) => setSettings({ ...settings, smsGatewayKey: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">SMTP Email Server Host</label>
                <input 
                  type="text" 
                  value={settings.emailSmtpHost || ""}
                  onChange={(e) => setSettings({ ...settings, emailSmtpHost: e.target.value })}
                  placeholder="smtp.puthia.gov.bd"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">জরুরি সিকিউরিটি ও স্প্যাম সাইরেন সাউন্ড অ্যালার্ট</h3>
                  <p className="text-[11px] text-slate-500 font-medium">নতুন জরুরি রিপোর্ট আসিলে অ্যাডমিন ড্যাশবোর্ডে সাউন্ড প্লে হবে</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, enableSoundAlerts: !settings.enableSoundAlerts })}
                className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.enableSoundAlerts ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.enableSoundAlerts ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
          </motion.div>
        )}

        {/* 7. MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <Wrench size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">7. Maintenance Mode (মেইনটেনেন্স মোড)</h2>
                <p className="text-xs text-slate-500 font-medium">জরুরি পরিস্থিতিতে অ্যাপ অফলাইন এবং মেইনটেনেন্স বার্তা সেট করুন</p>
              </div>
            </div>

            {/* Main Toggle Switch */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              settings.isMaintenanceMode ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${settings.isMaintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Wrench size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    মেইনটেনেন্স মোড status: <span className={settings.isMaintenanceMode ? 'text-rose-600' : 'text-emerald-600'}>
                      {settings.isMaintenanceMode ? 'চালু (Website Offline)' : 'বন্ধ (Website Live)'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    চালু থাকলে সাধারণ ব্যবহারকারীরা ওয়েবসাইট দেখতে পারবে না, শুধুমাত্র সুপার অ্যাডমিন লগইন করতে পারবে।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                className={`w-16 h-8 rounded-full relative transition-all shrink-0 cursor-pointer ${settings.isMaintenanceMode ? 'bg-rose-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${settings.isMaintenanceMode ? 'left-9' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">গ্রাহকদের জন্য মেইনটেনেন্স নোটিশ বার্তা (Maintenance Message)</label>
              <textarea 
                rows={3}
                value={settings.maintenanceMessage || ""}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="সিস্টেম রক্ষণাবেক্ষণ কাজ চলছে। অতিসত্বর সাইট পুনারায় চালু করা হবে।"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">অনুমোদিত অ্যাডমিন IP তালিকা (Allowed Whitelisted IPs - Comma Separated)</label>
              <input 
                type="text" 
                value={settings.allowedIPs || ""}
                onChange={(e) => setSettings({ ...settings, allowedIPs: e.target.value })}
                placeholder="127.0.0.1, 103.14.22.1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none font-mono"
              />
            </div>
          </motion.div>
        )}

        {/* 8. SECURITY & ACCESS CONTROL MODULE */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Lock size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">8. Security & Access Control (সিকিউরিটি ও সুরক্ষা হাব)</h2>
                  <p className="text-xs text-slate-500 font-medium">লগইন সিকিউরিটি, 2FA, সেশন কন্ট্রোল, অ্যাক্সেস লগ ও সন্দেহজনক থ্রেট সুরক্ষা</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                  <ShieldCheck size={14} className="text-emerald-600" /> সিস্টেম ডাবল গার্ড সক্রিয়
                </span>
              </div>
            </div>

            {/* SUB TAB 1: OVERVIEW */}
            {(secTab === 'all') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-700 uppercase">2FA স্ট্যাটাস</p>
                      <h4 className="text-base font-black text-emerald-950 mt-0.5">
                        {settings.security2FAEnforced ? 'বাধ্যতামূলক (Enforced)' : 'ঐচ্ছিক (Optional)'}
                      </h4>
                    </div>
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-indigo-700 uppercase">সর্বোচ্চ লগইন ট্রাই</p>
                      <h4 className="text-base font-black text-indigo-950 mt-0.5">
                        {settings.loginMaxAttempts || 5} বার পর্যন্ত
                      </h4>
                    </div>
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Key size={20} />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-purple-700 uppercase">সেশন টাইমআউট</p>
                      <h4 className="text-base font-black text-purple-950 mt-0.5">
                        {settings.securitySessionTimeoutMinutes || 60} মিনিট
                      </h4>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                      <Clock size={20} />
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-rose-700 uppercase">ব্লকড IP সংখ্যা</p>
                      <h4 className="text-base font-black text-rose-950 mt-0.5">
                        {(settings.blockedIPsList || []).length} টি IP
                      </h4>
                    </div>
                    <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                      <ShieldAlert size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSecTabChange('password-policy')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Key size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Password Policy</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">সর্বনিম্ন দৈর্ঘ্য, চরিত্র জটিলতা ও পাসওয়ার্ড মেয়াদের সময়সীমা।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('login-security')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Key size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Login Security</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">ভুল লগইন লকআউট, পাসওয়ার্ড পলিসি ও ক্যাপচা সুরক্ষার সেটিংস।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('2fa')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ShieldCheck size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">2FA Settings</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">অ্যাডমিন ও ইউজারদের জন্য OTP ভেরিফিকেশন চালু করুন।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('session')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <Clock size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Session Management</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">নিষ্ক্রিয় সেশন রিমুভ ও অ্যাক্টিভ লগইন ডিভাইস ম্যানেজ করুন।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('login-history')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Login History</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">কারা কখন কোন IP থেকে প্রবেশ করেছে তার রিয়েলটাইম ইতিহাস।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('suspicious')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <ShieldAlert size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Suspicious Activity</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">সন্দেহজনক হ্যাকিং বা ব্রুট-ফোর্স আক্রমণ ট্র্যাকিং ও IP ব্লকিং।</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSecTabChange('admin-security')}
                    className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-slate-200 text-slate-700 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Shield size={18} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900">Admin Security</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">মাস্টার সিকিউরিটি পিন, IP হোয়াইটলিস্ট ও অডিট লগিং সেটিং।</p>
                  </button>
                </div>
              </div>
            )}

            {/* SUB TAB: PASSWORD POLICY */}
            {(secTab === 'password-policy') && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                  <Key size={20} className="text-indigo-600 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-indigo-900">পাসওয়ার্ড পলিসি ও মেয়াদ উত্তীর্ণের সময়সীমা (Password Policy & Expiration)</h3>
                    <p className="text-[11px] text-indigo-700 font-medium">ব্যবহারকারী ও অ্যাডমিনদের পাসওয়ার্ডের সর্বনিম্ন আবশ্যকতা, জটিলতা এবং মেয়াদের সময়সীমা নির্ধারণ করুন</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Min Length */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">পাসওয়ার্ডের সর্বনিম্ন দৈর্ঘ্য (Min Password Length)</label>
                    <select
                      value={settings.passwordMinLength || 8}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value={6}>৬ টি অক্ষর (শিথিল)</option>
                      <option value={8}>৮ টি অক্ষর (সাধারণ - সুপারিশকৃত)</option>
                      <option value={10}>১০ টি অক্ষর (উচ্চ সুরক্ষা)</option>
                      <option value={12}>১২ টি অক্ষর (কঠোর ব্যাংক-লেভেল)</option>
                      <option value={16}>১৬ টি অক্ষর (সর্বোচ্চ নিরাপত্তা)</option>
                    </select>
                  </div>

                  {/* Password Expiration Days */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">পাসওয়ার্ড মেয়াদের সময়সীমা (Expiration Interval)</label>
                    <select
                      value={settings.passwordExpirationDays ?? 90}
                      onChange={(e) => setSettings({ ...settings, passwordExpirationDays: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value={0}>মেয়াদ নেই (Never Expires)</option>
                      <option value={30}>৩০ দিন (প্রতি মাসে পরিবর্ধন)</option>
                      <option value={60}>৬০ দিন (২ মাস পরপর)</option>
                      <option value={90}>৯০ দিন (৩ মাস - স্ট্যান্ডার্ড)</option>
                      <option value={180}>১৮০ দিন (৬ মাস)</option>
                      <option value={365}>৩৬৫ দিন (১ বছর)</option>
                    </select>
                  </div>

                  {/* Prevent Password Reuse */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">পুরাতন পাসওয়ার্ড পুনরাবৃত্তি নিষেধাজ্ঞা (Prevent Password Reuse)</label>
                    <select
                      value={settings.preventPasswordReuseCount ?? 3}
                      onChange={(e) => setSettings({ ...settings, preventPasswordReuseCount: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value={0}>পুনরাবৃত্তি নিষিদ্ধ নয় (No Restriction)</option>
                      <option value={3}>সর্বশেষ ৩ টি পাসওয়ার্ড (সুপারিশকৃত)</option>
                      <option value={5}>সর্বশেষ ৫ টি পাসওয়ার্ড</option>
                      <option value={10}>সর্বশেষ ১০ টি পাসওয়ার্ড</option>
                    </select>
                  </div>

                  {/* First Login Reset */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">প্রথমবার লগইনে পাসওয়ার্ড পরিবর্তন বাধ্য করা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">অ্যাডমিন বা সিস্টেম থেকে একাউন্ট তৈরি করলে প্রথমবার নতুন পাসওয়ার্ড সেট করা বাধ্যতামূলক</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, forcePasswordResetOnFirstLogin: !settings.forcePasswordResetOnFirstLogin })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.forcePasswordResetOnFirstLogin ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.forcePasswordResetOnFirstLogin ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Character Complexity Rules */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">পাসওয়ার্ড চরিত্র ও জটিলতা শর্তাবলী (Character Complexity Requirements)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-slate-900">বড় হাতের অক্ষর (Uppercase Letter A-Z)</h3>
                        <p className="text-[11px] text-slate-500 font-medium">অন্তত ১ টি বড় হাতের ইংরেজি অক্ষর আবশ্যক</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, passwordRequireUppercase: !settings.passwordRequireUppercase })}
                        className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.passwordRequireUppercase ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.passwordRequireUppercase ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-slate-900">ছোট হাতের অক্ষর (Lowercase Letter a-z)</h3>
                        <p className="text-[11px] text-slate-500 font-medium">অন্তত ১ টি ছোট হাতের ইংরেজি অক্ষর আবশ্যক</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, passwordRequireLowercase: !settings.passwordRequireLowercase })}
                        className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.passwordRequireLowercase ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.passwordRequireLowercase ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-slate-900">সংখ্যা/ডিজিট (Numbers 0-9)</h3>
                        <p className="text-[11px] text-slate-500 font-medium">অন্তত ১ টি গাণিতিক সংখ্যা আবশ্যক</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, passwordRequireNumber: !settings.passwordRequireNumber })}
                        className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.passwordRequireNumber ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.passwordRequireNumber ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-slate-900">বিশেষ চিহ্ন (Special Characters @,#,$,!)</h3>
                        <p className="text-[11px] text-slate-500 font-medium">অন্তত ১ টি প্রতীক বা বিশেষ চিহ্ন আবশ্যক</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, passwordRequireSpecialChar: !settings.passwordRequireSpecialChar })}
                        className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.passwordRequireSpecialChar ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.passwordRequireSpecialChar ? 'left-8' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 2: LOGIN SECURITY */}
            {(secTab === 'login-security') && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                  <Key size={20} className="text-indigo-600 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-indigo-900">লগইন সুরক্ষা ও পাসওয়ার্ড জটিলতা নীতি</h3>
                    <p className="text-[11px] text-indigo-700 font-medium">ভুল পাসওয়ার্ড চেষ্টার জন্য অটোমেটিক লকআউট ও ক্যাপচা সুরক্ষা চালু রাখুন</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">সর্বোচ্চ ভুল পাসওয়ার্ড চেষ্টা (Max Login Attempts)</label>
                    <select
                      value={settings.loginMaxAttempts || 5}
                      onChange={(e) => setSettings({ ...settings, loginMaxAttempts: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value={3}>৩ বার (কঠোর সুরক্ষা)</option>
                      <option value={5}>৫ বার (প্রস্তাবিত)</option>
                      <option value={10}>১০ বার (শিথিল)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">লকআউট সময়সীমা (Lockout Duration in Minutes)</label>
                    <input
                      type="number"
                      value={settings.loginLockoutDurationMinutes || 15}
                      onChange={(e) => setSettings({ ...settings, loginLockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                      placeholder="15"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">পাসওয়ার্ডের সর্বনিম্ন দৈর্ঘ্য (Min Password Length)</label>
                    <input
                      type="number"
                      value={settings.passwordMinLength || 8}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                      placeholder="8"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">বিশেষ অক্ষর ও সংখ্যা বাধ্য করা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">পাসওয়ার্ডে @,#,$ ও সংখ্যা থাকা আবশ্যিক</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, passwordRequireSpecialChar: !settings.passwordRequireSpecialChar })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.passwordRequireSpecialChar ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.passwordRequireSpecialChar ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">লগইনে ক্যাপচা যাচাই (reCAPTCHA v3)</h3>
                      <p className="text-[11px] text-slate-500 font-medium">বট লগইন ও স্প্যাম চেষ্টা ঠেকাতে</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, enableLoginCaptcha: !settings.enableLoginCaptcha })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.enableLoginCaptcha ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.enableLoginCaptcha ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">নতুন ডিভাইসে লগইনে ইমেইল অ্যালার্ট</h3>
                      <p className="text-[11px] text-slate-500 font-medium">অপরিচিত ব্রাউজার থেকে প্রবেশ করলে নোটিফিকেশন পাঠানো</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, loginAlertEmailOnNewDevice: !settings.loginAlertEmailOnNewDevice })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.loginAlertEmailOnNewDevice ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.loginAlertEmailOnNewDevice ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 3: 2FA SETTINGS */}
            {(secTab === '2fa') && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-emerald-900">দ্বিমাত্রিক নিরাপত্তা (2FA / OTP Verification)</h3>
                    <p className="text-[11px] text-emerald-700 font-medium">লগইনের অতিরিক্ত স্তর সুরক্ষা কনফিগার করুন</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900">অ্যাডমিন 2FA বাধ্য করা</h3>
                        <p className="text-[11px] text-slate-500 font-medium">সব অ্যাডমিনের জন্য OTP লগইন বাধ্যতামূলক</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, security2FAEnforced: !settings.security2FAEnforced })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.security2FAEnforced ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.security2FAEnforced ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900">সাধারণ ব্যবহারকারীদের 2FA অপশন</h3>
                        <p className="text-[11px] text-slate-500 font-medium">নাগরিক একাউন্টেও 2FA অন করার সুযোগ দেওয়া</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, security2FAForUsers: !settings.security2FAForUsers })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.security2FAForUsers ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.security2FAForUsers ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">প্রধান 2FA ভেরিফিকেশন মাধ্যম</label>
                    <select
                      value={settings.twoFactorMethod || 'sms'}
                      onChange={(e) => setSettings({ ...settings, twoFactorMethod: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value="sms">মোবাইল SMS (OTP Code)</option>
                      <option value="email">ইমেইল ভেরিফিকেশন (Email Code)</option>
                      <option value="authenticator">অথেনটিকেটর অ্যাপ (Google/Authy App)</option>
                      <option value="all">যেকোনো একটি নির্বাচনযোগ্য</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">গুরুত্বপূর্ণ অ্যাকশনে 2FA পিন যাচাই</h3>
                      <p className="text-[11px] text-slate-500 font-medium">ডিলিট বা সিস্টেম চেঞ্জে পুনরায় OTP বাধ্য করা</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, require2FAForSensitiveActions: !settings.require2FAForSensitiveActions })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.require2FAForSensitiveActions ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.require2FAForSensitiveActions ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 4: SESSION MANAGEMENT */}
            {(secTab === 'session') && (
              <div className="space-y-6">
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-purple-600 shrink-0" />
                    <div>
                      <h3 className="text-xs font-black text-purple-900">সেশন টাইমআউট ও অ্যাক্টিভ ডিভাইস কন্ট্রোল</h3>
                      <p className="text-[11px] text-purple-700 font-medium">অ্যাক্টিভ ডিভাইস ম্যানেজ করুন এবং অপ্রয়োজনীয় সেশন দূর করুন</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: 'success', text: 'বর্তমান অ্যাকাউন্ট ব্যতীত সকল অ্যাক্টিভ সেশন সফলভাবে সাইনআউট করা হয়েছে!' });
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UserX size={14} /> সকল ডিভাইস সাইনআউট করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">অ্যাডমিন ইন-অ্যাক্টিভিটি টাইমআউট (Minutes)</label>
                    <input
                      type="number"
                      value={settings.securitySessionTimeoutMinutes || 60}
                      onChange={(e) => setSettings({ ...settings, securitySessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                      placeholder="60"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">একক ব্যবহারকারীর সর্বোচ্চ সমসাময়িক সেশন (Max Concurrent Sessions)</label>
                    <input
                      type="number"
                      value={settings.maxConcurrentSessionsPerUser || 3}
                      onChange={(e) => setSettings({ ...settings, maxConcurrentSessionsPerUser: parseInt(e.target.value) || 3 })}
                      placeholder="3"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">পাসওয়ার্ড চেঞ্জে অটোমেটিক সেশন রিমুভ</h3>
                      <p className="text-[11px] text-slate-500 font-medium">পাসওয়ার্ড পরিবর্তন করলে বাকি সব ডিভাইসে অটো সাইনআউট</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, forceLogoutOnPasswordChange: !settings.forceLogoutOnPasswordChange })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.forceLogoutOnPasswordChange ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.forceLogoutOnPasswordChange ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Remember Me মেয়াদ (Days)</label>
                    <input
                      type="number"
                      value={settings.rememberMeDurationDays || 30}
                      onChange={(e) => setSettings({ ...settings, rememberMeDurationDays: parseInt(e.target.value) || 30 })}
                      placeholder="30"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Active Sessions List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">বর্তমানে লগইন করা অ্যাক্টিভ ডিভাইসসমূহ</h3>
                  
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="p-4 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                          <Laptop size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900">Chrome (Windows 11)</h4>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">এই ডিভাইস (Current)</span>
                          </div>
                          <p className="text-[11px] text-slate-500">IP: 103.14.22.1 • Dhaka, Bangladesh • শেষ সক্রিয়তা: এইমাত্র</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Safari (iPhone 14 Pro)</h4>
                          <p className="text-[11px] text-slate-500">IP: 103.14.22.89 • Rajshahi, Bangladesh • শেষ সক্রিয়তা: ২ ঘণ্টা আগে</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMessage({ type: 'success', text: 'ডিভাইস সেশন বাতিল করা হয়েছে।' });
                          setTimeout(() => setMessage(null), 3000);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        সেশন বাতিল
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 5: LOGIN HISTORY */}
            {(secTab === 'login-history') && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={loginHistorySearch}
                      onChange={(e) => setLoginHistorySearch(e.target.value)}
                      placeholder="ইমেইল বা IP সার্চ করুন..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select
                      value={loginHistoryFilter}
                      onChange={(e) => setLoginHistoryFilter(e.target.value as any)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="all">সব ফিল্টার (All)</option>
                      <option value="success">সফল (Success)</option>
                      <option value="failed">ব্যর্থ (Failed)</option>
                      <option value="blocked">ব্লকড (Blocked)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setMessage({ type: 'success', text: 'লগইন ইতিহাস CSV ফরম্যাটে ডাউনলোড হচ্ছে...' });
                        setTimeout(() => setMessage(null), 3000);
                      }}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="p-3.5 pl-5">সময় ও তারিখ</th>
                          <th className="p-3.5">ব্যবহারকারী</th>
                          <th className="p-3.5">IP ও লোকেশন</th>
                          <th className="p-3.5">ডিভাইস / ব্রাউজার</th>
                          <th className="p-3.5 pr-5">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {loginLogs
                          .filter((l) => {
                            if (loginHistoryFilter !== 'all' && l.status !== loginHistoryFilter) return false;
                            if (loginHistorySearch) {
                              const q = loginHistorySearch.toLowerCase();
                              return l.userEmail.toLowerCase().includes(q) || l.ipAddress.includes(q) || l.location.toLowerCase().includes(q);
                            }
                            return true;
                          })
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/60 transition-all">
                              <td className="p-3.5 pl-5 font-mono text-[11px] text-slate-500">
                                {new Date(log.timestamp).toLocaleString('bn-BD')}
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{log.userName}</div>
                                <div className="text-[11px] text-slate-500">{log.userEmail} ({log.userRole})</div>
                              </td>
                              <td className="p-3.5">
                                <span className="font-mono text-xs font-bold text-slate-800">{log.ipAddress}</span>
                                <div className="text-[11px] text-slate-400">{log.location}</div>
                              </td>
                              <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                                {log.deviceInfo}
                              </td>
                              <td className="p-3.5 pr-5">
                                {log.status === 'success' && (
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 size={12} /> সফল
                                  </span>
                                )}
                                {log.status === 'failed' && (
                                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                                    <AlertTriangle size={12} /> ব্যর্থ
                                  </span>
                                )}
                                {log.status === 'blocked' && (
                                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                                    <X size={12} /> ব্লকড
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 6: SUSPICIOUS ACTIVITY */}
            {(secTab === 'suspicious') && (
              <div className="space-y-6">
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={22} className="text-rose-600 shrink-0" />
                    <div>
                      <h3 className="text-xs font-black text-rose-900">সন্দেহজনক থ্রেট প্রতিরোধ ও IP ব্লকলিস্ট</h3>
                      <p className="text-[11px] text-rose-700 font-medium">অটো-ডিফেন্স চালু রাখুন এবং ক্ষতিকর বট/হ্যাকার IP নিষিদ্ধ করুন</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white text-rose-700 rounded-full text-xs font-black border border-rose-200 shadow-xs">
                      থ্রেট স্কোর: ৯৮% নিরাপদ
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">অটোমেটিক ক্ষতিকর IP ব্লকিং</h3>
                      <p className="text-[11px] text-slate-500 font-medium">৫ বার ব্যর্থ ট্রাই করলে স্বয়ংক্রিয় IP নিষিদ্ধ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, autoBlockSuspiciousIPs: !settings.autoBlockSuspiciousIPs })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.autoBlockSuspiciousIPs ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.autoBlockSuspiciousIPs ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">সন্দেহজনক ড্রাইভে ইমেইল নোটিফিকেশন</h3>
                      <p className="text-[11px] text-slate-500 font-medium">অস্বাভাবিক ট্রাফিকের সসংগে সসংগে নোটিফিকেশন</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, enableSuspiciousAlerts: !settings.enableSuspiciousAlerts })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.enableSuspiciousAlerts ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.enableSuspiciousAlerts ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* IP Blacklist Manager */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">IP ব্লকলিস্ট ম্যানেজমেন্ট (Blocked IP Addresses)</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlockIP}
                      onChange={(e) => setNewBlockIP(e.target.value)}
                      placeholder="যেমন: 194.26.29.112"
                      className="w-full max-w-xs px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBlockIP.trim()) return;
                        const current = settings.blockedIPsList || [];
                        if (!current.includes(newBlockIP.trim())) {
                          setSettings({ ...settings, blockedIPsList: [...current, newBlockIP.trim()] });
                          setMessage({ type: 'success', text: `${newBlockIP.trim()} IP টি সফলভাবে ব্লকলিস্টে যুক্ত হয়েছে।` });
                          setTimeout(() => setMessage(null), 3000);
                        }
                        setNewBlockIP('');
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> IP ব্লক করুন
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(settings.blockedIPsList || []).map((ip) => (
                      <span key={ip} className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold font-mono inline-flex items-center gap-2">
                        <span>{ip}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (settings.blockedIPsList || []).filter(item => item !== ip);
                            setSettings({ ...settings, blockedIPsList: updated });
                          }}
                          className="hover:text-rose-950 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suspicious Incidents Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-900">
                    সাম্প্রতিক সন্দেহজনক থ্রেট ইতিহাস
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                          <th className="p-3.5 pl-5">সময়</th>
                          <th className="p-3.5">IP & দেশ</th>
                          <th className="p-3.5">ঘটনার ধরন</th>
                          <th className="p-3.5">বিবরণ</th>
                          <th className="p-3.5 pr-5">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {suspiciousLogs.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="p-3.5 pl-5 font-mono text-[11px] text-slate-500">
                              {new Date(item.timestamp).toLocaleString('bn-BD')}
                            </td>
                            <td className="p-3.5 font-mono text-xs font-bold text-slate-800">
                              {item.ipAddress}
                              <div className="text-[11px] font-sans font-normal text-slate-400">{item.location}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold">
                                {item.attemptType}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600">{item.details}</td>
                            <td className="p-3.5 pr-5">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = settings.blockedIPsList || [];
                                  if (!current.includes(item.ipAddress)) {
                                    setSettings({ ...settings, blockedIPsList: [...current, item.ipAddress] });
                                    setMessage({ type: 'success', text: `IP ${item.ipAddress} ব্লকলিস্ট করা হয়েছে।` });
                                    setTimeout(() => setMessage(null), 3000);
                                  }
                                }}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                              >
                                ব্লক IP
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 7: ADMIN SECURITY */}
            {(secTab === 'admin-security') && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <Shield size={20} className="text-slate-800 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black text-slate-900">সুপার অ্যাডমিন নিবিড় নিরাপত্তা ও মাস্টার পিন</h3>
                    <p className="text-[11px] text-slate-600 font-medium">অ্যাডমিন ড্যাশবোর্ডের অভ্যন্তরীণ নিরাপত্তা কাস্টমাইজ করুন</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">মাস্টার অ্যাডমিন PIN বাধ্য করা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">সংবেদনশীল ফাইল ডিলিট বা রোল পরিবর্তনের জন্য PIN</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, adminMasterPinRequired: !settings.adminMasterPinRequired })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.adminMasterPinRequired ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.adminMasterPinRequired ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">মাস্টার সিকিউরিটি PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={settings.adminMasterPin || ''}
                      onChange={(e) => setSettings({ ...settings, adminMasterPin: e.target.value })}
                      placeholder="123456"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:bg-white focus:border-slate-900 transition-all outline-none"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">অ্যাডমিন অ্যাক্সেসে IP হোয়াইটলিস্ট বাধ্য করা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">নির্দিষ্ট অনুমোদিত IP ব্যতীত বাকিদের প্রবেশের বাধা</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, adminIpWhitelistOnly: !settings.adminIpWhitelistOnly })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.adminIpWhitelistOnly ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.adminIpWhitelistOnly ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">অডিট লগ ডিটেইল লেভেল (Audit Logging Level)</label>
                    <select
                      value={settings.adminAuditLogLevel || 'detailed'}
                      onChange={(e) => setSettings({ ...settings, adminAuditLogLevel: e.target.value as any })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                    >
                      <option value="basic">সাধারণ (Basic Changes Only)</option>
                      <option value="detailed">বিস্তারিত (Detailed Log - Recommended)</option>
                      <option value="verbose">সম্পূর্ণ ডিবাগ (Verbose API Level Logging)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">নতুন অ্যাডমিন ক্রিয়েশনে সুপার অ্যাডমিন ইমেইল অ্যালার্ট</h3>
                      <p className="text-[11px] text-slate-500 font-medium">নতুন যেকোনো অ্যাডমিন যুক্ত করা হলে তৎক্ষণাৎ মেইল</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, notifyAdminOnNewAdminCreation: !settings.notifyAdminOnNewAdminCreation })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.notifyAdminOnNewAdminCreation ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.notifyAdminOnNewAdminCreation ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">মোবাইল OTP যাচাই আবশ্যিক</h3>
                      <p className="text-[11px] text-slate-500 font-medium">নাগরিক সাবমিশনে মোবাইল ভেরিফিকেশন করা</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, securityRequireMobileVerification: !settings.securityRequireMobileVerification })}
                      className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${settings.securityRequireMobileVerification ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xs ${settings.securityRequireMobileVerification ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Key size={14} className="text-amber-500" /> Google Maps API Key
                  </label>
                  <input
                    type="password"
                    value={settings.googleMapsApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, googleMapsApiKey: e.target.value })}
                    placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none font-mono"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 font-medium">
            শেষ আপডেট: <span className="font-bold text-slate-600">{new Date(settings.updatedAt).toLocaleString('bn-BD')}</span>
          </p>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin text-emerald-200" /> : <Save size={16} className="text-emerald-200" />}
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsManagement;

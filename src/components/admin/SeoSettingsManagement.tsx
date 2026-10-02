import React, { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Copy,
  ExternalLink,
  Sliders,
  Smartphone,
  Monitor,
  Code,
  Sparkles,
  ShieldCheck,
  Tag,
  MapPin,
  Eye,
  Check,
  FileJson,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  getSeoSettings,
  updateSeoSettings,
  resetSeoSettingsToDefaults,
  calculateSeoHealthScore,
  DEFAULT_SEO_SETTINGS,
  SeoHealthReport
} from "../../services/seoService";
import { SeoSettings } from "../../types";

const KEYWORD_SUGGESTIONS = [
  "আমাদের পুঠিয়া",
  "পুঠিয়া ডায়েরি",
  "পুঠিয়া রাজবাড়ী",
  "পুঠিয়া মন্দির কমপ্লেক্স",
  "পুঠিয়া রাজশাহী",
  "Puthia Rajbari",
  "Puthia Upazila",
  "পুঠিয়া ডাক্তার তালিকা",
  "পুঠিয়া হাসপাতাল",
  "বানেশ্বর বাজার",
  "পুঠিয়া ব্লাড ব্যাংক",
  "রাজশাহী পর্যটন"
];

const PRESET_OG_IMAGES = [
  {
    label: "পুঠিয়া রাজবাড়ী ফ্রন্ট ভিউ (ডিফল্ট)",
    url: "https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630"
  },
  {
    label: "শিব মন্দির ও দিঘী",
    url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200&h=630"
  },
  {
    label: "ডিজিটাল নাগরিক সেবা ব্যানার",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=630"
  }
];

export const SeoSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"google_desktop" | "google_mobile" | "facebook" | "twitter">("google_desktop");
  const [activeTab, setActiveTab] = useState<"general" | "social" | "robots" | "webmaster" | "schema">("general");
  const [newKeyword, setNewKeyword] = useState("");
  const [healthReport, setHealthReport] = useState<SeoHealthReport | null>(null);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

  // Load SEO Settings
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSeoSettings();
      setSettings(data);
      setHealthReport(calculateSeoHealthScore(data));
    } catch (err) {
      console.error("Failed to load SEO settings:", err);
      toast.error("এসইও সেটিংস লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update health score on state change
  useEffect(() => {
    setHealthReport(calculateSeoHealthScore(settings));
  }, [settings]);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSeoSettings(settings, "Super Admin updated SEO configuration");
      toast.success("এসইও সেটিংস সফলভাবে ডাটাবেজে সংরক্ষিত ও লাইভ আপডেট হয়েছে!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("সেটিংস সংরক্ষণ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset to Defaults
  const handleReset = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে সকল এসইও সেটিংস অপ্টিমাইজড ডিফল্ট মানে রিসেট করতে চান?")) {
      return;
    }
    setSaving(true);
    try {
      await resetSeoSettingsToDefaults();
      setSettings(DEFAULT_SEO_SETTINGS);
      toast.success("এসইও সেটিংস ডিফল্ট মানে রিসেট করা হয়েছে");
    } catch (err) {
      toast.error("রিসেট ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  // Add keyword
  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    const currentList = settings.seoKeywords
      ? settings.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    if (!currentList.includes(trimmed)) {
      currentList.push(trimmed);
      setSettings({ ...settings, seoKeywords: currentList.join(", ") });
    }
    setNewKeyword("");
  };

  // Remove keyword
  const handleRemoveKeyword = (kwToRemove: string) => {
    const currentList = settings.seoKeywords
      ? settings.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];
    const updated = currentList.filter((k) => k !== kwToRemove);
    setSettings({ ...settings, seoKeywords: updated.join(", ") });
  };

  // Copy HTML Meta Tags
  const handleCopyMetaHtml = () => {
    const canonical = settings.canonicalUrl || (typeof window !== "undefined" ? window.location.origin : "https://amaderputhia.gov.bd");
    const snippet = `<!-- Primary Meta Tags -->
<title>${settings.seoTitle || "আমাদের পুঠিয়া"}</title>
<meta name="title" content="${settings.seoTitle || ""}" />
<meta name="description" content="${settings.seoDescription || ""}" />
<meta name="keywords" content="${settings.seoKeywords || ""}" />
<meta name="robots" content="${settings.robotsIndex !== false ? "index, follow" : "noindex, nofollow"}" />
<meta name="author" content="${settings.authorName || "আমাদের পুঠিয়া ওয়েব টিম"}" />
<link rel="canonical" href="${canonical}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${settings.ogType || "website"}" />
<meta property="og:title" content="${settings.ogTitle || settings.seoTitle || ""}" />
<meta property="og:description" content="${settings.ogDescription || settings.seoDescription || ""}" />
<meta property="og:image" content="${settings.ogImageUrl || ""}" />
<meta property="og:url" content="${canonical}" />

<!-- Twitter -->
<meta property="twitter:card" content="${settings.twitterCard || "summary_large_image"}" />
<meta property="twitter:title" content="${settings.twitterTitle || settings.seoTitle || ""}" />
<meta property="twitter:description" content="${settings.twitterDescription || settings.seoDescription || ""}" />
<meta property="twitter:image" content="${settings.twitterImage || settings.ogImageUrl || ""}" />
${settings.googleSearchConsole ? `<meta name="google-site-verification" content="${settings.googleSearchConsole}" />` : ""}`;

    navigator.clipboard.writeText(snippet);
    toast.success("মেটা ট্যাগ HTML কোড ক্লিপবোর্ডে কপি করা হয়েছে!");
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <RefreshCw className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
        <p className="text-sm font-bold text-slate-600">এসইও সেটিংস লোড হচ্ছে...</p>
      </div>
    );
  }

  const titleLength = (settings.seoTitle || "").length;
  const descLength = (settings.seoDescription || "").length;
  const keywordsList = settings.seoKeywords
    ? settings.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTION CONTROLS */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Search size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">এসইও ও মেটাডাটা ম্যানেজমেন্ট</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                লাইভ ডাটাবেজ সিঙ্ক
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              গুগল সার্চ র্যাঙ্কিং, মেটা ট্যাগ, সোশ্যাল ওপেন গ্রাফ (OG) ইমেজ ও সাইট ইন্ডেক্সিং রিয়েল-টাইম কনফিগারেশন
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            title="অপ্টিমাইজড ডিফল্ট মানে রিসেট করুন"
          >
            <RotateCcw size={14} />
            ডিফল্ট রিসেট
          </button>

          <button
            type="button"
            onClick={handleCopyMetaHtml}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            title="মেটা HTML কোড কপি করুন"
          >
            <Copy size={14} />
            HTML মেটা কোড
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
            {saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
          </button>
        </div>
      </div>

      {/* 2. SEO HEALTH SCORE & LIVE PREVIEWS (BENTO GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SEO HEALTH SCORE CARD */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 rounded-[28px] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-300" size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-200">এসইও হেলথ স্কোর</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                (healthReport?.totalScore || 0) >= 80 ? "bg-white/20 text-white border border-white/30" :
                (healthReport?.totalScore || 0) >= 60 ? "bg-amber-500/30 text-amber-200 border border-amber-400/40" :
                "bg-rose-500/30 text-rose-200 border border-rose-400/40"
              }`}>
                গ্রেড: {healthReport?.grade || "N/A"}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">{healthReport?.totalScore || 0}</span>
              <span className="text-sm font-bold text-emerald-200">/ ১০০ ইস্টার</span>
            </div>

            <div className="w-full bg-emerald-950/50 h-2.5 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthReport?.totalScore || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  (healthReport?.totalScore || 0) >= 80 ? "bg-emerald-400" :
                  (healthReport?.totalScore || 0) >= 60 ? "bg-amber-400" : "bg-rose-400"
                }`}
              />
            </div>

            {/* Quick check breakdown */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-100 pb-1 border-b border-emerald-700/60">
                <span>পাস করা অডিটসমূহ:</span>
                <span className="font-bold text-emerald-200">{healthReport?.passCount || 0} টি</span>
              </div>
              <div className="flex items-center justify-between text-slate-300 pb-1 border-b border-slate-700/60">
                <span>সতর্কতা / উন্নয়নযোগ্য:</span>
                <span className="font-bold text-amber-400">{healthReport?.warnCount || 0} টি</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>ত্রুটি / অনুপস্থিত:</span>
                <span className="font-bold text-rose-400">{healthReport?.failCount || 0} টি</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 relative z-10">
            <p className="text-[11px] text-slate-400 font-medium">
              💡 টিপস: মেটা টাইটেল ৫০-৬০ অক্ষর ও ডেসক্রিপশন ১২০-১৬০ অক্ষরের মধ্যে রাখলে গুগল সার্চে সর্বোচ্চ ক্লিকের সম্ভাবনা থাকে।
            </p>
          </div>
        </div>

        {/* INTERACTIVE LIVE PREVIEW BOX */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Eye size={16} className="text-emerald-600" />
                  রিয়েল-টাইম সার্চ ও সোশ্যাল কার্ড প্রিভিউ
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">ব্যবহারকারীরা যেভাবে গুগল ও সোশ্যাল মিডিয়ায় আপনার ওয়েবসাইট দেখতে পাবেন</p>
              </div>

              {/* Preview Mode Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 self-start">
                <button
                  type="button"
                  onClick={() => setPreviewMode("google_desktop")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === "google_desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Monitor size={13} />
                  Google PC
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("google_mobile")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === "google_mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone size={13} />
                  Google Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("facebook")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === "facebook" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Share2 size={13} />
                  Facebook OG
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("twitter")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    previewMode === "twitter" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Tag size={13} />
                  Twitter (X)
                </button>
              </div>
            </div>

            {/* PREVIEW RENDERING */}
            <div className="mt-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 min-h-[160px] flex items-center justify-center">
              {/* 1. GOOGLE DESKTOP SERP PREVIEW */}
              {previewMode === "google_desktop" && (
                <div className="w-full max-w-xl bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-black">
                      পু
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">আমাদের পুঠিয়া</div>
                      <div className="text-[11px] text-slate-500">{settings.canonicalUrl || "https://amaderputhia.gov.bd"}</div>
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                    {settings.seoTitle || "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি"}
                  </h4>
                  <p className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                    {settings.seoDescription || "পুঠিয়া উপজেলার সকল তথ্য, ইতিহাস, মন্দির কমপ্লেক্স, হাসপাতাল ও ডিজিটাল নাগরিক সেবার একমাত্র প্ল্যাটফর্ম।"}
                  </p>
                </div>
              )}

              {/* 2. GOOGLE MOBILE SERP PREVIEW */}
              {previewMode === "google_mobile" && (
                <div className="w-full max-w-sm bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-black">
                      পু
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-slate-800 truncate">আমাদের পুঠিয়া (Amader Puthia)</div>
                      <div className="text-[10px] text-slate-400 truncate">{settings.canonicalUrl || "https://amaderputhia.gov.bd"}</div>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1a0dab] line-clamp-2 leading-snug">
                    {settings.seoTitle || "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল নাগরিক সেবা"}
                  </h4>
                  <p className="text-[11px] text-[#4d5156] mt-1 line-clamp-3 leading-relaxed">
                    {settings.seoDescription || "পুঠিয়া উপজেলার সকল তথ্য, ইতিহাস, মন্দির কমপ্লেক্স, হাসপাতাল ও ডিজিটাল নাগরিক সেবার একমাত্র প্ল্যাটফর্ম।"}
                  </p>
                </div>
              )}

              {/* 3. FACEBOOK OPEN GRAPH CARD PREVIEW */}
              {previewMode === "facebook" && (
                <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
                  <div className="w-full h-44 bg-slate-200 relative overflow-hidden">
                    {settings.ogImageUrl ? (
                      <img
                        src={settings.ogImageUrl}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={32} />
                        <span className="text-[11px] font-bold mt-1">কোনো ইমেজ লিঙ্ক নেই</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded">
                      1200 x 630
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50/90 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {(settings.canonicalUrl || "AMADERPUTHIA.GOV.BD").replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                      {settings.ogTitle || settings.seoTitle || "আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি"}
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {settings.ogDescription || settings.seoDescription || "পুঠিয়ার ইতিহাস, ঐতিহ্য এবং নাগরিক সেবার ডিজিটাল প্ল্যাটফর্ম।"}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. TWITTER / X CARD PREVIEW */}
              {previewMode === "twitter" && (
                <div className="w-full max-w-md bg-black text-white rounded-2xl border border-slate-800 shadow-xs overflow-hidden text-left">
                  <div className="w-full h-40 bg-slate-900 relative overflow-hidden">
                    {settings.twitterImage || settings.ogImageUrl ? (
                      <img
                        src={settings.twitterImage || settings.ogImageUrl}
                        alt="Twitter Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <div className="text-[10px] text-zinc-400 font-medium truncate">
                      {(settings.canonicalUrl || "amaderputhia.gov.bd").replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </div>
                    <h5 className="text-xs font-bold text-zinc-100 mt-0.5 line-clamp-1">
                      {settings.twitterTitle || settings.seoTitle || "আমাদের পুঠিয়া - রাজকীয় ইতিহাস"}
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                      {settings.twitterDescription || settings.seoDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-[22px] border border-emerald-100/60 shadow-sm flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "general"
              ? "bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe size={15} />
          ১. প্রাইমারি মেটা ও কিওয়ার্ড
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "social"
              ? "bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Share2 size={15} />
          ২. সোশ্যাল ও Open Graph (OG)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("robots")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "robots"
              ? "bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck size={15} />
          ৩. ক্রলিং, রোবটস ও জিও ট্যাগ
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("webmaster")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "webmaster"
              ? "bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code size={15} />
          ৪. গুগল কনসোল ও এনালিটিক্স
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === "schema"
              ? "bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileJson size={15} />
          ৫. Schema.org JSON-LD
        </button>
      </div>

      {/* 4. FORM TAB CONTENT */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm">
        {/* TAB 1: GENERAL META TAGS */}
        {activeTab === "general" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">প্রাইমারি মেটা ট্যাগ ও কিওয়ার্ড কনফিগারেশন</h3>
              <p className="text-xs text-slate-500 font-medium">গুগল ও অন্যান্য সার্চ ইঞ্জিনের জন্য মেটা টাইটেল, বিবরণ এবং সার্চ কিওয়ার্ড নির্ধারণ করুন</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  গুগল মেটা টাইটেল (SEO Meta Title) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    titleLength >= 30 && titleLength <= 65
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {titleLength} / ৬০ অক্ষর (প্রস্তাবিত: ৩০-৬০)
                  </span>
                </div>
              </div>
              <input
                type="text"
                value={settings.seoTitle || ""}
                onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                placeholder="আমাদের পুঠিয়া - রাজকীয় ইতিহাস, স্থান ও ডিজিটাল নাগরিক সেবা পোর্টাল"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
              />
              <p className="text-[11px] text-slate-400 font-medium">
                এটি সার্চ রেজাল্টের নীল রঙের মূল শিরোনাম হিসেবে প্রদর্শিত হবে।
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  মেটা ডেসক্রিপশন (SEO Meta Description) <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  descLength >= 100 && descLength <= 165
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {descLength} / ১৬০ অক্ষর (প্রস্তাবিত: ১২০-১৬০)
                </span>
              </div>
              <textarea
                rows={3}
                value={settings.seoDescription || ""}
                onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                placeholder="পুঠিয়া উপজেলার সকল তথ্য, ঐতিহাসিক পুঠিয়া রাজবাড়ী মন্দির কমপ্লেক্স, পর্যটন গাইড, হাসপাতাল, ডাক্তার ডিরেক্টরি, রক্তের গ্রুপ, নোটিশ এবং অনলাইন নাগরিক সেবার ওয়ান-স্টপ পোর্টাল।"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                মেটা কিওয়ার্ডস (Meta Keywords - ট্যাগ তালিকা)
              </label>

              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword(newKeyword);
                    }
                  }}
                  placeholder="নতুন কিওয়ার্ড লিখুন ও Enter চাপুন..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddKeyword(newKeyword)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                >
                  যোগ করুন
                </button>
              </div>

              {/* Active Keywords Tags */}
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[50px]">
                {keywordsList.length > 0 ? (
                  keywordsList.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="text-slate-400 hover:text-rose-600 font-black text-sm leading-none ml-0.5"
                        title="রিমুভ করুন"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">কোনো কিওয়ার্ড যোগ করা হয়নি</span>
                )}
              </div>

              {/* Suggested Tags */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">💡 প্রস্তাবিত জনপ্রিয় কিওয়ার্ডসমূহ (ক্লিক করে যোগ করুন):</span>
                <div className="flex flex-wrap gap-1.5">
                  {KEYWORD_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddKeyword(sug)}
                      disabled={keywordsList.includes(sug)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        keywordsList.includes(sug)
                          ? "bg-slate-100 text-slate-400 cursor-default"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
                      }`}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Author & Canonical URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ক্যানোনিকাল ইউআরএল (Canonical URL)</label>
                <input
                  type="text"
                  value={settings.canonicalUrl || ""}
                  onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                  placeholder="https://amaderputhia.gov.bd"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">লেখক / সংস্থা (Author / Organization)</label>
                <input
                  type="text"
                  value={settings.authorName || ""}
                  onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                  placeholder="আমাদের পুঠিয়া ওয়েব টিম"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SOCIAL & OPEN GRAPH */}
        {activeTab === "social" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">সোশ্যাল মিডিয়া ও ওপেন গ্রাফ (OpenGraph) কনফিগারেশন</h3>
              <p className="text-xs text-slate-500 font-medium">ফেসবুক, হোয়াটসঅ্যাপ ও টুইটারে লিংক শেয়ার করলে যে ছবি, শিরোনাম ও বিবরণ দেখা যাবে</p>
            </div>

            {/* OG Image URL */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                সোশ্যাল শেয়ার কার্ড ব্যানার ইমেজ (OG Image URL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.ogImageUrl || ""}
                onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 transition-all outline-none"
              />
              <p className="text-[11px] text-slate-400 font-medium">
                সর্বোত্তম রেজাল্টের জন্য ১২০০ x ৬৩০ পিক্সেল (১.৯১:১ অ্যাসপেক্ট রেশিও) ল্যান্ডস্কেপ ইমেজ ব্যবহার করুন।
              </p>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">📸 রেডিমেড পুঠিয়া ব্যানার ইমেজ প্রিসেট:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESET_OG_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSettings({ ...settings, ogImageUrl: img.url, twitterImage: img.url })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        settings.ogImageUrl === img.url
                          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-12 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom OG Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ওপেন গ্রাফ কাস্টম শিরোনাম (OG Title)
                </label>
                <input
                  type="text"
                  value={settings.ogTitle || ""}
                  onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })}
                  placeholder="আমাদের পুঠিয়া - রাজকীয় ইতিহাস ও ডিজিটাল ডায়েরি"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[10px] text-slate-400 font-medium">ফাঁকা রাখলে প্রাইমারি এসইও টাইটেল ব্যবহার হবে</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  ওপেন গ্রাফ কাস্টম বিবরণ (OG Description)
                </label>
                <input
                  type="text"
                  value={settings.ogDescription || ""}
                  onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })}
                  placeholder="পুঠিয়ার ইতিহাস, ঐতিহ্য এবং নাগরিক সেবার ডিজিটাল প্ল্যাটফর্ম।"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[10px] text-slate-400 font-medium">ফাঁকা রাখলে প্রাইমারি এসইও ডেসক্রিপশন ব্যবহার হবে</p>
              </div>
            </div>

            {/* Twitter Card Details */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-slate-600" />
                Twitter (X) কার্ড কনফিগারেশন
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">কার্ড ফরম্যাট (Card Type)</label>
                  <select
                    value={settings.twitterCard || "summary_large_image"}
                    onChange={(e) => setSettings({ ...settings, twitterCard: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="summary_large_image">summary_large_image (বড় ব্যানার প্রিভিউ - রেকমেন্ডেড)</option>
                    <option value="summary">summary (ছোট থাম্বনেইল প্রিভিউ)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">টুইটার ইমেজ লিংক (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={settings.twitterImage || ""}
                    onChange={(e) => setSettings({ ...settings, twitterImage: e.target.value })}
                    placeholder="ফাঁকা থাকলে OG Image ব্যবহার হবে"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ROBOTS, INDEXING & GEO TAGS */}
        {activeTab === "robots" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">সার্চ ইঞ্জিন ক্রলিং ও লোকাল এসইও (Geo Tags)</h3>
              <p className="text-xs text-slate-500 font-medium">রোবটস ইনডেক্সিং পলিসি এবং ভৌগোলিক অবস্থান ট্যাগ নিয়ন্ত্রণ করুন</p>
            </div>

            {/* Indexing & Following Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">গুগল ইনডেক্সিং (robots: index)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">সার্চ ইঞ্জিন বটগুলোকে সাইট ক্রল ও ইনডেক্স করার অনুমতি দিন</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.robotsIndex !== false}
                    onChange={(e) => setSettings({ ...settings, robotsIndex: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">লিংক ফলো করা (robots: follow)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">সার্চ ইঞ্জিন বটগুলোকে পেজের ইন্টারনাল লিঙ্ক অনুসরণ করার নির্দেশ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.robotsFollow !== false}
                    onChange={(e) => setSettings({ ...settings, robotsFollow: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Geo Location Tags */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-emerald-600" />
                লোকাল এসইও ও ভৌগোলিক মেটা ট্যাগ (Geo Meta Tags)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">জিও রিজিওন (geo.region)</label>
                  <input
                    type="text"
                    value={settings.geoRegion || "BD-54"}
                    onChange={(e) => setSettings({ ...settings, geoRegion: e.target.value })}
                    placeholder="BD-54"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">প্লেস নাম (geo.placename)</label>
                  <input
                    type="text"
                    value={settings.geoPlacename || "Puthia, Rajshahi"}
                    onChange={(e) => setSettings({ ...settings, geoPlacename: e.target.value })}
                    placeholder="Puthia, Rajshahi"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">জিপিএস কোঅর্ডিনেট (geo.position)</label>
                  <input
                    type="text"
                    value={settings.geoPosition || "24.3683;88.8358"}
                    onChange={(e) => setSettings({ ...settings, geoPosition: e.target.value })}
                    placeholder="24.3683;88.8358"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: WEBMASTER & TRACKING */}
        {activeTab === "webmaster" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">গুগল সার্চ কনসোল ও এনালিটিক্স ভেরিফিকেশন</h3>
              <p className="text-xs text-slate-500 font-medium">ওয়েবসাইট ওনারশিপ ভেরিফাই করুন এবং ট্রাফিক এনালিটিক্স ট্র্যাক করুন</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Search Console */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={settings.googleSearchConsole || ""}
                  onChange={(e) => setSettings({ ...settings, googleSearchConsole: e.target.value })}
                  placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 font-medium">
                  গুগল সার্চ কনসোলে HTML Tag ভেরিফিকেশন মেথডের কন্টেন্ট কোডটি এখানে পেস্ট করুন।
                </p>
              </div>

              {/* Bing Webmaster */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Bing Webmaster Tools Verification (msvalidate.01)
                </label>
                <input
                  type="text"
                  value={settings.bingVerification || ""}
                  onChange={(e) => setSettings({ ...settings, bingVerification: e.target.value })}
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 font-medium">
                  মাইক্রোসফট বিং ওয়েবমাস্টার ভেরিফিকেশন মেটা কোড
                </p>
              </div>

              {/* Google Analytics ID */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Google Analytics 4 Measurement ID (GA4)
                </label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ""}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-slate-900 transition-all outline-none"
                />
                <p className="text-[11px] text-slate-400 font-medium">
                  আপনার গুগল এনালিটিক্স GA4 ট্র্যাকিং আইডি
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: SCHEMA.ORG JSON-LD */}
        {activeTab === "schema" && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Schema.org JSON-LD স্ট্রাকচার্ড ডেটা</h3>
                <p className="text-xs text-slate-500 font-medium">গুগলের রিচ স্ন্যাপেট ও নলেজ গ্রাফের জন্য স্ট্রাকচার্ড ডেটা</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(settings.schemaJsonLd || "{}");
                    setSettings({ ...settings, schemaJsonLd: JSON.stringify(parsed, null, 2) });
                    toast.success("JSON ফরম্যাট ঠিক করা হয়েছে");
                  } catch {
                    toast.error("ভুল JSON সিনট্যাক্স");
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              >
                Format JSON
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                JSON-LD স্কিমা স্ক্রিপ্ট কনটেন্ট
              </label>
              <textarea
                rows={12}
                value={settings.schemaJsonLd || ""}
                onChange={(e) => setSettings({ ...settings, schemaJsonLd: e.target.value })}
                className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl outline-none leading-relaxed border border-slate-800"
                spellCheck={false}
              />
              <p className="text-[11px] text-slate-400 font-medium">
                এটি সরাসরি `&lt;script type="application/ld+json" id="seo-json-ld"&gt;` হিসেবে পেজের হেডারে ইনজেক্ট হবে।
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. AUDIT DETAILED CHECKLIST */}
      {healthReport && (
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              এসইও অডিট ও অপ্টিমাইজেশন চেকলিস্ট
            </h3>
            <span className="text-xs text-slate-500 font-bold">মোট {healthReport.checks.length} টি অডিট</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthReport.checks.map((check) => (
              <div
                key={check.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  check.status === "pass"
                    ? "bg-emerald-50/40 border-emerald-200/60 text-emerald-900"
                    : check.status === "warn"
                    ? "bg-amber-50/40 border-amber-200/60 text-amber-900"
                    : "bg-rose-50/40 border-rose-200/60 text-rose-900"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {check.status === "pass" && <CheckCircle2 size={16} className="text-emerald-600" />}
                  {check.status === "warn" && <AlertTriangle size={16} className="text-amber-600" />}
                  {check.status === "fail" && <AlertTriangle size={16} className="text-rose-600" />}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-black">{check.label}</h5>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-black/5 rounded">
                      +{check.score} ইস্টার
                    </span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed opacity-90">{check.message}</p>
                  {check.recommendation && (
                    <p className="text-[10px] font-bold opacity-75 mt-1">💡 পরামর্শ: {check.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoSettingsManagement;

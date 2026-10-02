import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  Plus, 
  Pin, 
  Trash2, 
  Edit, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Megaphone, 
  ChevronRight, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Info, 
  Sliders, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Globe, 
  Check, 
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { NoticeItem, SiteSettings } from "../../types";
import { 
  subscribeNoticeItems, 
  createNoticeItem, 
  updateNoticeItemDoc, 
  deleteNoticeItemDoc, 
  toggleNoticeActiveStatus, 
  toggleNoticePinnedStatus, 
  reorderNoticeItems, 
  seedDefaultNoticeItems, 
  updateNoticeTickerBarSettings 
} from "../../services/noticeService";

type TickerColor = 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate';

const BADGE_ICONS = [
  { id: "Megaphone", label: "মাইক (Megaphone)", icon: Megaphone },
  { id: "Bell", label: "ঘণ্টা (Bell)", icon: Bell },
  { id: "AlertTriangle", label: "সতর্কতা (Alert)", icon: AlertTriangle },
  { id: "Sparkles", label: "স্পার্কল (Sparkles)", icon: Sparkles },
  { id: "Flame", label: "হট / ফ্লেম (Flame)", icon: Flame },
  { id: "Pin", label: "পিন (Pin)", icon: Pin },
  { id: "Info", label: "তথ্য (Info)", icon: Info }
];

const COLOR_THEMES: { id: TickerColor; label: string; bgClass: string; textClass: string; ringClass: string }[] = [
  { id: "emerald", label: "সবুজ (Emerald)", bgClass: "bg-emerald-500", textClass: "text-emerald-700", ringClass: "ring-emerald-400" },
  { id: "rose", label: "লাল (Rose / Urgent)", bgClass: "bg-rose-500", textClass: "text-rose-700", ringClass: "ring-rose-400" },
  { id: "amber", label: "হলুদ (Amber / Warning)", bgClass: "bg-amber-500", textClass: "text-amber-700", ringClass: "ring-amber-400" },
  { id: "blue", label: "নীল (Sky Blue)", bgClass: "bg-sky-500", textClass: "text-sky-700", ringClass: "ring-sky-400" },
  { id: "purple", label: "বেগুনী (Purple)", bgClass: "bg-purple-500", textClass: "text-purple-700", ringClass: "ring-purple-400" },
  { id: "slate", label: "ধূসর (Slate / Neutral)", bgClass: "bg-slate-600", textClass: "text-slate-700", ringClass: "ring-slate-400" }
];

const SPEED_OPTIONS = [
  { value: 15, label: "খুব দ্রুত (১৫ সেকেন্ড)" },
  { value: 25, label: "স্বাভাবিক (২৫ সেকেন্ড)" },
  { value: 35, label: "ধীরস্থির (৩৫ সেকেন্ড)" },
  { value: 50, label: "খুব ধীর (৫০ সেকেন্ড)" }
];

export const NoticeManagement: React.FC = () => {
  const { settings } = useSiteSettings();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Ticker Bar Global Settings State
  const [showTicker, setShowTicker] = useState(true);
  const [badgeText, setBadgeText] = useState("নোটিশ");
  const [badgeIcon, setBadgeIcon] = useState("Megaphone");
  const [badgeColor, setBadgeColor] = useState<TickerColor>("emerald");
  const [tickerSpeed, setTickerSpeed] = useState(25);
  const [tickerDestination, setTickerDestination] = useState("/notice");
  const [pauseOnHover, setPauseOnHover] = useState(true);

  // Form State for individual notice
  const [formData, setFormData] = useState<Partial<NoticeItem>>({
    title: "",
    text: "",
    content: "",
    color: "#007A5E",
    link: "/notice",
    isActive: true,
    isPinned: false,
    priority: "medium",
    status: "published",
    order: 0
  });

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setShowTicker(settings.showNoticeTicker !== false);
      setBadgeText(settings.noticeTickerBadgeText || "নোটিশ");
      setBadgeIcon(settings.noticeTickerBadgeIcon || "Megaphone");
      setBadgeColor((settings.noticeTickerBadgeColor as TickerColor) || "emerald");
      setTickerSpeed(settings.noticeTickerSpeed || 25);
      setTickerDestination(settings.noticeTickerDestination || "/notice");
      setPauseOnHover(settings.noticeTickerPauseOnHover !== false);
    }
  }, [settings]);

  // Subscribe to notices in real-time
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeNoticeItems((items) => {
      setNotices(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => setNotificationMessage(null), 4000);
  };

  const handleSaveBarSettings = async () => {
    setSettingsSaving(true);
    try {
      await updateNoticeTickerBarSettings({
        showNoticeTicker: showTicker,
        noticeTickerBadgeText: badgeText.trim() || "নোটিশ",
        noticeTickerBadgeIcon: badgeIcon,
        noticeTickerBadgeColor: badgeColor,
        noticeTickerSpeed: Number(tickerSpeed) || 25,
        noticeTickerDestination: tickerDestination.trim() || "/notice",
        noticeTickerPauseOnHover: pauseOnHover
      });
      showNotification("হোমপেজ নোটিশ বারের সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (error) {
      console.error("Failed to save notice bar settings:", error);
      alert("সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleOpenModal = (notice?: NoticeItem) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData(notice);
    } else {
      setEditingNotice(null);
      setFormData({
        title: "",
        text: "",
        content: "",
        color: "#007A5E",
        link: "/notice",
        isActive: true,
        isPinned: false,
        priority: "medium",
        status: "published",
        order: notices.length + 1
      });
    }
    setShowModal(true);
  };

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text?.trim()) {
      alert("স্ক্রলিং নোটিশের টেক্সট আবশ্যক!");
      return;
    }

    setActionLoading(true);
    try {
      if (editingNotice) {
        await updateNoticeItemDoc(editingNotice.id, formData);
        showNotification("নোটিশ সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await createNoticeItem({
          title: formData.title?.trim() || "সাধারণ নোটিশ",
          text: formData.text.trim(),
          content: formData.content?.trim() || "",
          color: formData.color || "#007A5E",
          link: formData.link?.trim() || "/notice",
          isActive: formData.isActive ?? true,
          isPinned: formData.isPinned ?? false,
          priority: formData.priority || "medium",
          status: formData.status || "published",
          order: formData.order || notices.length + 1,
          createdAt: new Date().toISOString()
        });
        showNotification("নতুন নোটিশ সফলভাবে তৈরি করা হয়েছে!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("নোটিশ সংরক্ষণ করা যায়নি।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, text: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে এই নোটিশটি মুছতে চান?\n"${text}"`)) return;
    setActionLoading(true);
    try {
      await deleteNoticeItemDoc(id, text);
      showNotification("নোটিশটি মুছে ফেলা হয়েছে।");
    } catch (error) {
      console.error("Error deleting notice:", error);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (notice: NoticeItem) => {
    try {
      await toggleNoticeActiveStatus(notice.id, notice.isActive, notice.title || notice.text);
      showNotification(notice.isActive ? "নোটিশটি নিষ্ক্রিয় করা হয়েছে।" : "নোটিশটি সক্রিয় করা হয়েছে।");
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleTogglePin = async (notice: NoticeItem) => {
    try {
      await toggleNoticePinnedStatus(notice.id, !!notice.isPinned, notice.title || notice.text);
      showNotification(notice.isPinned ? "পিন অপসারণ করা হয়েছে।" : "টপ পিন করা হয়েছে।");
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notices.length) return;

    const newNotices = [...notices];
    const temp = newNotices[index];
    newNotices[index] = newNotices[targetIndex];
    newNotices[targetIndex] = temp;

    setNotices(newNotices);
    try {
      await reorderNoticeItems(newNotices);
      showNotification("নোটিশের প্রদর্শন ক্রম পরিবর্তন করা হয়েছে।");
    } catch (error) {
      console.error("Failed to reorder:", error);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm("আপনি কি পোর্টালের মূল ৩টি ডিফল্ট নোটিশ ডাটাবেসে যোগ করতে চান?")) return;
    setActionLoading(true);
    try {
      await seedDefaultNoticeItems();
      showNotification("ডিফল্ট ৩টি নোটিশ সফলভাবে যুক্ত হয়েছে!");
    } catch (error) {
      console.error("Error seeding notices:", error);
      alert("ডিফল্ট নোটিশ যুক্ত করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesSearch = (n.title?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (n.text?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || n.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get active texts for live preview
  const activeNoticeTexts = notices.filter(n => n.isActive !== false).map(n => n.text || n.title || "");
  const previewTexts = activeNoticeTexts.length > 0 
    ? activeNoticeTexts 
    : ["পুঠিয়া উপজেলায় উন্নয়নের ধারা অব্যাহত রাখতে সবাইকে একসাথে কাজ করতে হবে।", "৫ বছর বয়স পর্যন্ত শিশুদের পোলিও টিকাদান ক্যাম্পেইন চলছে।"];

  const renderBadgeIconComponent = (iconName: string) => {
    const props = { size: 14, className: "shrink-0" };
    switch (iconName) {
      case "Bell": return <Bell {...props} />;
      case "AlertTriangle": return <AlertTriangle {...props} />;
      case "Sparkles": return <Sparkles {...props} />;
      case "Flame": return <Flame {...props} />;
      case "Pin": return <Pin {...props} />;
      case "Info": return <Info {...props} />;
      case "Megaphone":
      default: return <Megaphone {...props} />;
    }
  };

  const getPreviewThemeStyles = (themeId: TickerColor) => {
    switch (themeId) {
      case 'rose':
        return {
          container: "bg-rose-50/90 border-rose-200/80",
          badge: "bg-rose-100 text-rose-800 border-rose-200/80",
          icon: "text-rose-700"
        };
      case 'amber':
        return {
          container: "bg-amber-50/90 border-amber-200/80",
          badge: "bg-amber-100 text-amber-800 border-amber-200/80",
          icon: "text-amber-700"
        };
      case 'blue':
        return {
          container: "bg-sky-50/90 border-sky-200/80",
          badge: "bg-sky-100 text-sky-800 border-sky-200/80",
          icon: "text-sky-700"
        };
      case 'purple':
        return {
          container: "bg-purple-50/90 border-purple-200/80",
          badge: "bg-purple-100 text-purple-800 border-purple-200/80",
          icon: "text-purple-700"
        };
      case 'slate':
        return {
          container: "bg-slate-100/90 border-slate-200/80",
          badge: "bg-slate-200 text-slate-800 border-slate-300/80",
          icon: "text-slate-700"
        };
      case 'emerald':
      default:
        return {
          container: "bg-emerald-50/90 border-emerald-200/80",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200/80",
          icon: "text-emerald-700"
        };
    }
  };

  const currentPreviewTheme = getPreviewThemeStyles(badgeColor);

  return (
    <div className="space-y-8 pb-16" id="notice-ticker-super-admin-management">
      {/* Toast Notification */}
      <AnimatePresence>
        {notificationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100] flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 text-sm font-bold"
          >
            <Check className="text-emerald-400" size={18} />
            <span>{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Megaphone size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                জরুরি নোটিশ ও হোমপেজ টিকার কন্ট্রোল
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              হোমপেজের শীর্ষে প্রদর্শিত ব্রেকিং নোটিশ বার, স্ক্রলিং টেক্সট ও ঘোষণার পূর্ণাঙ্গ নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {notices.length === 0 && !loading && (
            <button
              onClick={handleSeedDefaults}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
            >
              <RefreshCw size={14} className={actionLoading ? "animate-spin" : ""} />
              ডিফল্ট ৩টি নোটিশ যুক্ত করুন
            </button>
          )}

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 active:scale-95 cursor-pointer"
          >
            <Plus size={18} />
            নতুন নোটিশ তৈরি করুন
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE LIVE PREVIEW FRAME */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">হোমপেজ নোটিশ বার লাইভ প্রিভিউ</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              showTicker 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {showTicker ? "● হোমপেজে সক্রিয়" : "○ হোমপেজে বন্ধ"}
            </span>
          </div>
        </div>

        {/* The Live Rendered Bar */}
        <div className="pt-2">
          {showTicker ? (
            <div className={`w-full rounded-2xl border ${currentPreviewTheme.container} py-2.5 px-4 flex items-center gap-3 overflow-hidden select-none shadow-2xs`}>
              {/* Badge */}
              <div className={`flex items-center gap-1.5 ${currentPreviewTheme.badge} px-3 py-1 rounded-full text-xs font-black shrink-0 border shadow-2xs`}>
                <div className={currentPreviewTheme.icon}>
                  {renderBadgeIconComponent(badgeIcon)}
                </div>
                <span>{badgeText || "নোটিশ"}</span>
              </div>

              {/* Scrolling ticker preview */}
              <div className="overflow-hidden relative flex-1 flex items-center h-5">
                <div 
                  className="animate-marquee flex whitespace-nowrap w-max gap-8 text-xs font-bold text-slate-800 items-center"
                  style={{ animationDuration: `${tickerSpeed}s` }}
                >
                  {previewTexts.map((text, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2">
                      <span>{text}</span>
                      {idx < previewTexts.length - 1 && <span className="text-slate-300">●</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 text-xs shrink-0 font-medium">
                <span>{tickerDestination}</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-bold">
              🚫 হোমপেজ নোটিশ বার বর্তমানে সুপার এডমিন দ্বারা বন্ধ করা রয়েছে (নিষ্ক্রিয়)।
            </div>
          )}
        </div>
      </div>

      {/* 2. GLOBAL TICKER BAR SETTINGS CARD */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">টিকার বারের কনফিগারেশন সেটিংস</h3>
              <p className="text-xs text-slate-400 font-medium">হোমপেজের ব্যানারটির রং, শিরোনাম, আইকন ও গতি নির্ধারণ করুন</p>
            </div>
          </div>

          <button
            onClick={handleSaveBarSettings}
            disabled={settingsSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {settingsSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            সেটিংস সেভ করুন
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Master Toggle */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase">হোমপেজে নোটিশ বার প্রদর্শন</label>
              <button
                type="button"
                onClick={() => setShowTicker(!showTicker)}
                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  showTicker ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform ${
                  showTicker ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              সুইচটি বন্ধ করলে হোমপেজের ওপর থেকে নোটিশ বারটি পুরোপুরি অদৃশ্য হয়ে যাবে।
            </p>
          </div>

          {/* Badge Label */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">ব্যাজ শিরোনাম (Badge Text)</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="যেমন: নোটিশ, ব্রেকিং নিউজ, জরুরি বার্তা"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1.5 flex-wrap">
              {["নোটিশ", "জরুরি নোটিশ", "ব্রেকিং", "ঘোষণা"].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBadgeText(preset)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                    badgeText === preset 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Icon Selector */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">ব্যাজ আইকন (Icon)</label>
            <select
              value={badgeIcon}
              onChange={(e) => setBadgeIcon(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {BADGE_ICONS.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">বর্তমান আইকন:</span>
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                {renderBadgeIconComponent(badgeIcon)}
              </div>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">রং / থিম (Color Theme)</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setBadgeColor(theme.id)}
                  className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    badgeColor === theme.id 
                      ? `border-slate-800 bg-white shadow-xs ring-2 ${theme.ringClass}` 
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${theme.bgClass} shrink-0`} />
                  <span className="truncate">{theme.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling Speed */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">স্ক্রলিং গতি (Marquee Speed)</label>
            <select
              value={tickerSpeed}
              onChange={(e) => setTickerSpeed(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {SPEED_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 font-medium">
              কম সময় মানে দ্রুত স্ক্রল, বেশি সময় মানে ধীরে শান্তভাবে স্ক্রল।
            </p>
          </div>

          {/* Destination Link */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">ক্লিক গন্তব্য লিংক (Click Route)</label>
            <input
              type="text"
              value={tickerDestination}
              onChange={(e) => setTickerDestination(e.target.value)}
              placeholder="ডিফল্ট: /notice"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <div className="flex gap-1.5 flex-wrap">
              {["/notice", "/news", "/emergency", "/hospital"].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTickerDestination(r)}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-colors ${
                    tickerDestination === r 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. NOTICE ITEMS LIST & CRUD */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              স্ক্রলিং নোটিশের তালিকাসমূহ ({notices.length} টি)
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              হোমপেজের নোটিশ বারে প্রদর্শিত সক্রিয় টেক্সটগুলোর ক্রম ও বিষয়বস্তু পরিচালনা করুন
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নোটিশ খুঁজুন..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="published">প্রকাশিত</option>
              <option value="draft">ড্রাফট</option>
            </select>
          </div>
        </div>

        {/* Notices Cards List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-3 text-emerald-600" size={32} />
            <p className="text-xs font-bold">নোটিশ লোড হচ্ছে...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 space-y-3">
            <AlertCircle size={32} className="mx-auto text-slate-400" />
            <p className="font-bold text-sm text-slate-600">কোনো নোটিশ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              নতুন নোটিশ তৈরি করতে ওপরের "নতুন নোটিশ তৈরি করুন" বাটনে ক্লিক করুন অথবা ডিফল্ট ৩টি নোটিশ রিস্টোর করুন।
            </p>
            <button
              onClick={handleSeedDefaults}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
            >
              <RefreshCw size={14} />
              ডিফল্ট ৩টি নোটিশ যুক্ত করুন
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                layout
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  notice.isPinned 
                    ? 'bg-amber-50/20 border-amber-200 shadow-2xs' 
                    : notice.isActive 
                      ? 'bg-white border-slate-100 hover:border-emerald-200 shadow-2xs' 
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Reorder Controls + Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Order Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20 rounded hover:bg-slate-100"
                        title="উপরে নিন"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="text-[11px] font-black text-slate-500">{index + 1}</span>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === notices.length - 1}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20 rounded hover:bg-slate-100"
                        title="নিচে নিন"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {notice.isPinned && (
                          <span className="flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                            <Pin size={10} className="fill-amber-800" />
                            টপ পিন
                          </span>
                        )}

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                          notice.priority === 'high' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : notice.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {notice.priority || 'medium'}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          notice.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {notice.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                        </span>

                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {notice.title || "নোটিশ"}
                        </h4>
                      </div>

                      {/* Ticker Text Preview */}
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50/90 px-3 py-1.5 rounded-xl border border-slate-100">
                        📢 {notice.text}
                      </p>

                      {notice.content && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {notice.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    {/* Pin toggle */}
                    <button
                      onClick={() => handleTogglePin(notice)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        notice.isPinned 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                      }`}
                      title={notice.isPinned ? "আনপিন করুন" : "টপ পিন করুন"}
                    >
                      <Pin size={16} className={notice.isPinned ? "fill-amber-600" : ""} />
                    </button>

                    {/* Active/Inactive toggle */}
                    <button
                      onClick={() => handleToggleStatus(notice)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        notice.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title="সক্রিয় বা নিষ্ক্রিয় করুন"
                    >
                      {notice.isActive ? <CheckCircle size={14} className="text-emerald-600" /> : <XCircle size={14} />}
                      <span>{notice.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenModal(notice)}
                      className="p-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(notice.id, notice.title || notice.text)}
                      className="p-2 bg-slate-50 text-rose-500 border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT NOTICE MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xl rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingNotice ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    হোমপেজের স্ক্রলিং বার এবং নোটিশ বোর্ডে এই তথ্য প্রদর্শিত হবে
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmitNotice} className="p-6 space-y-4 overflow-y-auto">
                {/* Ticker Text (Most important) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    স্ক্রলিং নোটিশের মূল টেক্সট (Ticker Text) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.text || ""}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="হোমপেজের শীর্ষে স্ক্রলিং ব্যানার হিসেবে যা দেখা যাবে..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    সংক্ষিপ্ত ও স্পষ্ট রাখুন (যেমন: পুঠিয়া উপজেলায় উন্নয়নের ধারা অব্যাহত রাখতে সবাইকে একসাথে কাজ করতে হবে।)
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    নোটিশের শিরোনাম (Title)
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: উন্নয়ন ও নাগরিক দায়িত্ব"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">প্রায়োরিটি</label>
                    <select
                      value={formData.priority || "medium"}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="low">সাধারণ (Low)</option>
                      <option value="medium">মাঝারি (Medium)</option>
                      <option value="high">জরুরি / শীর্ষ (High)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase">স্ট্যাটাস</label>
                    <select
                      value={formData.status || "published"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="published">প্রকাশিত (Published)</option>
                      <option value="draft">ড্রাফট (Draft)</option>
                    </select>
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    ক্লিক গন্তব্য লিংক (Link / Route)
                  </label>
                  <input
                    type="text"
                    value={formData.link || ""}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/notice, /hospital, /emergency ইত্যাদি"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Detailed Body (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    বিস্তারিত বিবরণ (ঐচ্ছিক - ফুল নোটিশ বডিতে দেখানোর জন্য)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="নোটিশের বিস্তারিত অংশ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Pin & Active Checkboxes */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>সরাসরি সক্রিয় করুন</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned ?? false}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>টপ পিন (সর্বপ্রথম দেখাবে)</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 size={14} className="animate-spin" />}
                    {editingNotice ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoticeManagement;

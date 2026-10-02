import React, { useState, useEffect, useRef } from "react";
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  Layers,
  Save,
  Clock,
  Check,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getHeroSlides, 
  onHeroSlidesSnapshot, 
  createHeroSlide, 
  updateHeroSlide, 
  deleteHeroSlide, 
  toggleHeroSlideStatus, 
  reorderHeroSlides,
  seedHeroSlidesIfEmpty,
  INITIAL_HERO_SLIDES 
} from "../../services/heroSliderService";
import { HeroSlide } from "../../types";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const SAMPLE_IMAGES = [
  {
    name: "পুঠিয়া রাজবাড়ী",
    url: "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=1200"
  },
  {
    name: "শিব মন্দির ও দিঘী",
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&fm=webp&q=75&w=1200"
  },
  {
    name: "ডিজিটাল অ্যাপ ও সেবা",
    url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&fm=webp&q=75&w=1200"
  },
  {
    name: "রক্তদান ও জরুরি সেবা",
    url: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&fm=webp&q=75&w=1200"
  },
  {
    name: "তথ্য সহযোগী ও সভা",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&fm=webp&q=75&w=1200"
  },
  {
    name: "কৃষি ও প্রাকৃতিক শোভা",
    url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&fm=webp&q=75&w=1200"
  }
];

const QUICK_ROUTES = [
  { label: "সংবাদ ও খবর", path: "/news" },
  { label: "নাগরিক ড্যাশবোর্ড", path: "/dashboard" },
  { label: "পুঠিয়া মোবাইল অ্যাপ", path: "/app" },
  { label: "রক্তদাতা ডিরেক্টরি", path: "/blood-donor" },
  { label: "ঐতিহাসিক পুঠিয়া", path: "/history" },
  { label: "জরুরি সেবা ও হটলাইন", path: "/helpline" },
  { label: "চাকরির খবর", path: "/jobs" },
  { label: "কৃষি সেবা", path: "/agri" }
];

export const HeroSliderManagement: React.FC = () => {
  const { settings } = useSiteSettings();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Global settings local state
  const [showSlider, setShowSlider] = useState<boolean>(true);
  const [autoplayDelay, setAutoplayDelay] = useState<number>(4);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    cta: "বিস্তারিত দেখুন",
    link: "/news",
    tag: "স্মার্ট ডিজিটাল হাব",
    category: "পুঠিয়া নিউজ ও আপডেট",
    emoji: "🏛️",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
    accentColor: "text-emerald-300",
    buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
    order: 1,
    isActive: true,
    stats: "সর্বশেষ সেবা"
  });

  // Selected slide index for live preview
  const [previewIndex, setPreviewIndex] = useState(0);

  // Sync settings
  useEffect(() => {
    if (settings) {
      setShowSlider(settings.showHeroSlider !== false);
      setAutoplayDelay(settings.heroSliderAutoplayDelay || 4);
    }
  }, [settings]);

  // Subscribe to slides
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onHeroSlidesSnapshot((data) => {
      setSlides(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      subtitle: "",
      image: SAMPLE_IMAGES[0].url,
      cta: "বিস্তারিত দেখুন",
      link: "/news",
      tag: "স্মার্ট ডিজিটাল হাব",
      category: "পুঠিয়া নিউজ ও আপডেট",
      emoji: "🏛️",
      badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
      gradient: "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
      accentColor: "text-emerald-300",
      buttonBg: "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
      order: slides.length + 1,
      isActive: true,
      stats: "নতুন আপডেট"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      image: slide.image || "",
      cta: slide.cta || "বিস্তারিত দেখুন",
      link: slide.link || "/news",
      tag: slide.tag || "স্মার্ট ডিজিটাল হাব",
      category: slide.category || "পুঠিয়া নিউজ ও আপডেট",
      emoji: slide.emoji || "🏛️",
      badgeColor: slide.badgeColor || "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
      gradient: slide.gradient || "from-emerald-950/95 via-emerald-900/80 to-teal-950/40",
      accentColor: slide.accentColor || "text-emerald-300",
      buttonBg: slide.buttonBg || "bg-white text-slate-900 hover:bg-slate-100 shadow-md",
      order: slide.order || 1,
      isActive: slide.isActive !== false,
      stats: slide.stats || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showNotification("স্লাইডারের শিরোনাম অবশ্যই দিতে হবে", "error");
      return;
    }
    if (!formData.image.trim()) {
      showNotification("স্লাইডারের ছবির লিংক দিন", "error");
      return;
    }

    setActionLoading(true);
    try {
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, formData);
        showNotification("স্লাইডার সফলভাবে আপডেট করা হয়েছে");
      } else {
        await createHeroSlide(formData);
        showNotification("নতুন স্লাইডার সফলভাবে যোগ করা হয়েছে");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "স্লাইডার সংরক্ষণে সমস্যা হয়েছে", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (slide: HeroSlide) => {
    try {
      const nextStatus = !slide.isActive;
      await toggleHeroSlideStatus(slide.id, nextStatus, slide.title);
      showNotification(`স্লাইডার "${slide.title.slice(0, 20)}..." ${nextStatus ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
    } catch (err: any) {
      showNotification("স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    setActionLoading(true);
    try {
      await deleteHeroSlide(id, title);
      setDeleteConfirmId(null);
      showNotification("স্লাইডারটি সফলভাবে মুছে ফেলা হয়েছে");
    } catch (err: any) {
      showNotification("মুছে ফেলতে ব্যর্থ হয়েছে", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    const payload = newSlides.map((s, idx) => ({
      id: s.id,
      order: idx + 1
    }));

    try {
      await reorderHeroSlides(payload);
      showNotification("স্লাইডারের ক্রম সফলভাবে সাজানো হয়েছে");
    } catch (err: any) {
      showNotification("ক্রম পরিবর্তনে সমস্যা হয়েছে", "error");
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm("আপনি কি পুঠিয়া পোর্টালের ডিফল্ট ৫টি স্লাইডার লোড করতে চান?")) {
      return;
    }
    setActionLoading(true);
    try {
      await seedHeroSlidesIfEmpty();
      showNotification("ডিফল্ট স্লাইডার সফলভাবে লোড হয়েছে");
    } catch (err: any) {
      showNotification("ডিফল্ট লোড করতে ব্যর্থ হয়েছে", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveGlobalSettings = async () => {
    setSettingsSaving(true);
    try {
      const settingsRef = doc(db, 'site_settings', 'main');
      await updateDoc(settingsRef, {
        showHeroSlider: showSlider,
        heroSliderAutoplayDelay: Number(autoplayDelay),
        updatedAt: new Date().toISOString()
      });
      showNotification("স্লাইডার গ্লোবাল সেটিংস সংরক্ষিত হয়েছে");
    } catch (err: any) {
      console.error(err);
      showNotification("সেটিংস সংরক্ষণ ব্যর্থ হয়েছে", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const activeSlides = slides.filter(s => s.isActive !== false);
  const currentPreviewSlide = activeSlides[previewIndex] || slides[0] || INITIAL_HERO_SLIDES[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  হিরো স্লাইডার ও ব্যানার কন্ট্রোল
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  সুপার এডমিন
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                হোমপেজের শীর্ষ ব্যানার স্লাইডার, শিরোনাম, উপশিরোনাম, ব্যাকগ্রাউন্ড ছবি, অ্যাকশন বাটন এবং লিঙ্ক সম্পূর্ণ নিয়ন্ত্রণ করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {slides.length === 0 && !loading && (
              <button
                onClick={handleSeedDefaults}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl inline-flex items-center gap-2 border border-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ডিফল্ট ৫টি স্লাইড লোড করুন</span>
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন স্লাইড তৈরি করুন</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
                feedbackMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Slider Master Switch & Duration */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              হোমপেজ স্লাইডার গ্লোবাল সেটিংস
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              হোমপেজে স্লাইডার দেখানো হবে কি না এবং প্রতি স্লাইডের অটো-রোটেশন সময় নির্ধারণ করুন।
            </p>
          </div>

          <button
            onClick={handleSaveGlobalSettings}
            disabled={settingsSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>সেটিংস সেভ করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-sm font-bold text-slate-800">হিরো স্লাইডার দৃশ্যমানতা</p>
              <p className="text-xs text-slate-500">হোমপেজের শীর্ষে স্লাইডার সক্রিয় রাখুন</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showSlider}
                onChange={(e) => setShowSlider(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Autoplay Duration */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div>
              <p className="text-sm font-bold text-slate-800">অটো-প্লে সময়কাল (সেকেন্ড)</p>
              <p className="text-xs text-slate-500">প্রতি স্লাইড কত সেকেন্ড স্থায়ী হবে</p>
            </div>
            <select
              value={autoplayDelay}
              onChange={(e) => setAutoplayDelay(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value={3}>৩ সেকেন্ড</option>
              <option value={4}>৪ সেকেন্ড (ডিফল্ট)</option>
              <option value={5}>৫ সেকেন্ড</option>
              <option value={6}>৬ সেকেন্ড</option>
              <option value={8}>৮ সেকেন্ড</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIVE VISUAL PREVIEW */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-300" />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
              হোমপেজ লাইভ প্রিভিউ (সুপার এডমিন ভিউ)
            </span>
          </div>
          <span className="text-[11px] font-medium text-emerald-200">
            স্লাইড: {previewIndex + 1} / {activeSlides.length || 1}
          </span>
        </div>

        {/* Mock Carousel Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-700/60 aspect-[16/7] min-h-[180px] sm:min-h-[250px] md:min-h-[290px] flex items-center">
          <img
            src={currentPreviewSlide.image}
            alt={currentPreviewSlide.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-10 z-10">
            <div className="max-w-md sm:max-w-xl space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 backdrop-blur-xs">
                <span>{currentPreviewSlide.emoji || "🏛️"}</span>
                <span>{currentPreviewSlide.category || "পুঠিয়া নিউজ ও আপডেট"}</span>
              </div>
              <h2 className="text-sm sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md whitespace-pre-line tracking-tight line-clamp-2 sm:line-clamp-none">
                {currentPreviewSlide.title}
              </h2>
              {currentPreviewSlide.subtitle && (
                <p className="text-[11px] sm:text-sm text-slate-200 font-medium drop-shadow-sm opacity-95 line-clamp-1 sm:line-clamp-none">
                  {currentPreviewSlide.subtitle}
                </p>
              )}
              <div className="pt-1 sm:pt-2">
                <span className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-sm rounded-full inline-flex items-center gap-1.5 shadow-md">
                  <span>{currentPreviewSlide.cta || "বিস্তারিত দেখুন"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-lg">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`transition-all duration-300 cursor-pointer ${
                    previewIndex === idx
                      ? "w-6 h-2 bg-emerald-400 rounded-full"
                      : "w-2 h-2 bg-white/70 hover:bg-white rounded-full"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SLIDES MANAGEMENT TABLE / LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              সকল স্লাইডার তালিকা ({slides.length} টি স্লাইড)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              স্লাইডারের ক্রম পরিবর্তন করতে তীর চিহ্ন ব্যবহার করুন, অথবা তথ্য এডিট করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              সক্রিয়: {activeSlides.length} / {slides.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-medium">স্লাইডার তথ্য লোড হচ্ছে...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Sliders className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">কোনো স্লাইডার পাওয়া যায়নি</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              ডিফল্ট স্লাইডার লোড করতে নিচের বাটনে ক্লিক করুন অথবা নতুন স্লাইড যোগ করুন।
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ডিফল্ট ৫টি স্লাইড লোড করুন</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  slide.isActive === false ? 'bg-slate-50/70 opacity-75' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                      {slide.order || index + 1}
                    </span>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="relative w-20 h-14 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-xs">
                      {slide.emoji || "🏛️"}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {slide.category || "পুঠিয়া"}
                      </span>
                      {slide.tag && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {slide.tag}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        slide.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {slide.isActive !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">
                      {slide.title.replace(/\n/g, ' ')}
                    </h4>
                    {slide.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        বাটন: "{slide.cta || 'বিস্তারিত দেখুন'}"
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <LinkIcon className="w-3 h-3 text-slate-400" />
                        {slide.link}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggleStatus(slide)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                      slide.isActive !== false 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {slide.isActive !== false ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(slide)}
                    className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200"
                    title="সম্পাদনা করুন"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(slide.id)}
                    className="p-2 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT SLIDE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingSlide ? "স্লাইডার সম্পাদনা করুন" : "নতুন স্লাইডার যোগ করুন"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      স্লাইডারের ছবি, টাইটেল, লিঙ্ক এবং বাটন পরিবর্তন করুন
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveSlide} className="space-y-4 pt-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    প্রধান শিরোনাম (Slide Title) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: পুঠিয়ার সব খবর, সেবা&#10;ও আপডেট এক জায়গায়"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enter চেপে নতুন লাইন দিলে স্লাইডারেও দুই লাইনে সাজিয়ে প্রদর্শিত হবে।
                  </p>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    উপশিরোনাম বা সংক্ষিপ্ত বিবরণ (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="যেমন: সহজে জানুন, দ্রুত সেবা নিন"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* CTA Button & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      বাটন টেক্সট (CTA Text) *
                    </label>
                    <input
                      type="text"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                      placeholder="যেমন: বিস্তারিত দেখুন"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      নেভিগেশন লিঙ্ক (Target Route / Link) *
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="যেমন: /news অথবা https://..."
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick Link Presets */}
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">দ্রুত লিঙ্ক নির্বাচন করুন:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ROUTES.map((r, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormData({ ...formData, link: r.path })}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          formData.link === r.path 
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r.label} ({r.path})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ব্যাকগ্রাউন্ড ছবির URL *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Preset Photo Picker */}
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">অথবা প্রস্তাবিত ছবি থেকে বেছে নিন:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {SAMPLE_IMAGES.map((img, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setFormData({ ...formData, image: img.url })}
                          className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all group ${
                            formData.image === img.url ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <span className="absolute inset-0 bg-black/40 text-white text-[9px] font-bold flex items-center justify-center p-1 text-center">
                            {img.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category & Emoji */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ইমোজি আইকন
                    </label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder="🏛️"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ক্যাটাগরি নাম (Category)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="যেমন: পুঠিয়া নিউজ ও আপডেট"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Tag & Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ট্যাগ বা ব্যাজ (Tag Badge)
                    </label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="যেমন: স্মার্ট ডিজিটাল হাব"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      ডিসপ্লে ক্রম (Order Index)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-800">সক্রিয় অবস্থা</p>
                    <p className="text-xs text-slate-500">হোমপেজের স্লাইডারে দৃশ্যমান থাকবে কি না</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Submit & Cancel */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingSlide ? "পরিবর্তন সংরক্ষণ করুন" : "স্লাইডার তৈরি করুন"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                স্লাইডার মুছে ফেলতে নিশ্চিত?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                এই স্লাইডারটি মুছে ফেললে হোমপেজ থেকে তা চিরতরে অপসারিত হবে।
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl"
                >
                  না, বাতিল
                </button>
                <button
                  onClick={() => {
                    const slide = slides.find(s => s.id === deleteConfirmId);
                    handleDelete(deleteConfirmId, slide?.title || deleteConfirmId);
                  }}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl inline-flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>হ্যাঁ, মুছে ফেলুন</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSliderManagement;

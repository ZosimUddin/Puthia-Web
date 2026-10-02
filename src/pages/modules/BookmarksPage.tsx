import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bookmark, 
  Stethoscope, 
  Building2, 
  Briefcase, 
  Utensils, 
  Store, 
  Landmark, 
  Newspaper, 
  Sparkles, 
  Search, 
  Phone, 
  MapPin, 
  Trash2, 
  Share2, 
  ExternalLink, 
  ArrowLeft, 
  Heart, 
  Star, 
  FileText, 
  Edit3, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Layers,
  HeartHandshake
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import Header from "../../components/home/Header";
import Footer from "../../components/home/Footer";
import BottomNavigation from "../../components/home/BottomNavigation";
import { Sidebar } from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites, SavedItem, BookmarkCategory } from "../../components/FavoriteContext";
import SEO from "../../components/SEO";

interface BookmarkCategoryTab {
  id: "all" | BookmarkCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
}

const CATEGORY_TABS: BookmarkCategoryTab[] = [
  { id: "all", label: "সবগুলো সংরক্ষিত", icon: Bookmark, color: "text-[#006a4e]", badgeBg: "bg-emerald-50 text-emerald-700" },
  { id: "doctor", label: "ডাক্তার", icon: Stethoscope, color: "text-blue-600", badgeBg: "bg-blue-50 text-blue-700" },
  { id: "hospital", label: "হাসপাতাল ও ক্লিনিক", icon: Building2, color: "text-rose-600", badgeBg: "bg-rose-50 text-rose-700" },
  { id: "job", label: "চাকরি ও ক্যারিয়ার", icon: Briefcase, color: "text-amber-600", badgeBg: "bg-amber-50 text-amber-700" },
  { id: "restaurant", label: "রেস্টুরেন্ট ও খাবার", icon: Utensils, color: "text-orange-600", badgeBg: "bg-orange-50 text-orange-700" },
  { id: "business", label: "ব্যবসা ও দোকান", icon: Store, color: "text-indigo-600", badgeBg: "bg-indigo-50 text-indigo-700" },
  { id: "tourism", label: "পর্যটন ও রাজবাড়ী", icon: Landmark, color: "text-emerald-600", badgeBg: "bg-emerald-50 text-emerald-700" },
  { id: "news", label: "সংবাদ ও বুলেটিন", icon: Newspaper, color: "text-cyan-600", badgeBg: "bg-cyan-50 text-cyan-700" },
  { id: "service", label: "অন্যান্য সার্ভিস", icon: Sparkles, color: "text-purple-600", badgeBg: "bg-purple-50 text-purple-700" },
];

export const BookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarks, removeBookmark, updateBookmarkNotes, clearAllBookmarks } = useFavorites();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | BookmarkCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((item) => {
      // Category filter
      const matchesCategory =
        activeCategory === "all" ||
        item.type === activeCategory ||
        (activeCategory === "service" && ["service", "blood_donor", "discussion", "other"].includes(item.type));

      // Search filter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [bookmarks, activeCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookmarks.length };
    CATEGORY_TABS.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = bookmarks.filter((b) => {
          if (cat.id === "service") {
            return ["service", "blood_donor", "discussion", "other"].includes(b.type);
          }
          return b.type === cat.id;
        }).length;
      }
    });
    return counts;
  }, [bookmarks]);

  // Share collection
  const handleShare = async (item: SavedItem) => {
    const shareUrl = window.location.origin + (item.link || `/p/search?q=${encodeURIComponent(item.title)}`);
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `পুঠিয়া স্মার্ট পোর্টাল থেকে সংরক্ষিত: ${item.title} (${item.subtitle || item.categoryLabel || ""})`,
          url: shareUrl,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("লিংক ক্লিপবোর্ডে কপি করা হয়েছে");
    }
  };

  // Start Note edit
  const startEditNote = (item: SavedItem) => {
    setEditingNoteId(item.id);
    setNoteText(item.notes || "");
  };

  // Save Note
  const saveNote = (id: string) => {
    updateBookmarkNotes(id, noteText);
    setEditingNoteId(null);
    toast.success("ব্যক্তিগত নোট সংরক্ষিত হয়েছে");
  };

  // Category Icon helper
  const getCategoryMeta = (type: BookmarkCategory) => {
    switch (type) {
      case "doctor":
        return { label: "ডাক্তার", icon: Stethoscope, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "hospital":
        return { label: "হাসপাতাল", icon: Building2, color: "text-rose-600 bg-rose-50 border-rose-200" };
      case "job":
        return { label: "চাকরি", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "restaurant":
        return { label: "রেস্টুরেন্ট", icon: Utensils, color: "text-orange-600 bg-orange-50 border-orange-200" };
      case "business":
        return { label: "ব্যবসা", icon: Store, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
      case "tourism":
        return { label: "পর্যটন", icon: Landmark, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "news":
        return { label: "সংবাদ", icon: Newspaper, color: "text-cyan-600 bg-cyan-50 border-cyan-200" };
      case "blood_donor":
        return { label: "রক্তদাতা", icon: HeartHandshake, color: "text-rose-600 bg-rose-50 border-rose-200" };
      default:
        return { label: "নাগরিক সেবা", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-200" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEO
        title="আমার সংরক্ষিত বুকমার্ক সমূহ | Global Bookmark System"
        description="পুঠিয়া স্মার্ট পোর্টালের সমস্ত সংরক্ষিত ডাক্তার, হাসপাতাল, চাকরি, রেস্টুরেন্ট, ব্যবসা, পর্যটন ও সংবাদ এক ছাতার নিচে।"
        path="/bookmarks"
      />

      <Header
        user={user}
        onMenuClick={() => setIsSidebarOpen(true)}
        onSearch={() => {}}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith("/") ? path : `/${path}`);
        }}
      />

      <main className="flex-1 pb-24">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#006a4e] via-[#00543e] to-[#004230] text-white pt-6 pb-12 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>

              {bookmarks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer active:scale-95 transition"
                >
                  <Trash2 size={13} />
                  <span>সব মুছে ফেলুন</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <Bookmark size={22} className="text-emerald-300 fill-emerald-300" />
                  <span>গ্লোবাল বুকমার্ক সেন্টার (Global Saved Items)</span>
                </h1>
                <p className="text-xs text-emerald-100 mt-1">
                  আপনার সংরক্ষিত ডাক্তার, হাসপাতাল, চাকরি, রেস্টুরেন্ট, পর্যটন ও সেবাসমূহ
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
                <Heart size={16} className="fill-rose-400 text-rose-400" />
                <span className="text-xs font-black text-white">মোট সংরক্ষিত: {bookmarks.length}টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="সংরক্ষিত ডাক্তার, হাসপাতাল, চাকরি, রেস্টুরেন্ট বা নোট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#006a4e]"
              />
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded-xl cursor-pointer border-none"
              >
                রিসেট
              </button>
            )}
          </div>

          {/* Category Tabs Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeCategory === tab.id;
              const count = categoryCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-none cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-[#006a4e] text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <TabIcon size={14} className={isActive ? "text-white" : tab.color} />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bookmarks Grid */}
          <div className="space-y-3">
            {filteredBookmarks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-[#006a4e] rounded-full flex items-center justify-center mx-auto">
                  <Bookmark size={28} className="text-[#006a4e]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {searchQuery ? "কোনো মিল পাওয়া যায়নি" : "এই ক্যাটাগরিতে কোনো বুকমার্ক নেই"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    যেকোনো ডাক্তার, হাসপাতাল, চাকরি, রেস্টুরেন্ট বা সার্ভিসের কার্ডে থাকা ❤️ হার্ট/বুকমার্ক বাটনে ক্লিক করে এক ক্লিকে সংরক্ষণ করুন।
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => navigate("/service/doctor")}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006a4e] rounded-xl text-xs font-black transition border-none cursor-pointer"
                  >
                    🩺 ডাক্তার ব্রাউজ করুন
                  </button>
                  <button
                    onClick={() => navigate("/service/hospital")}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006a4e] rounded-xl text-xs font-black transition border-none cursor-pointer"
                  >
                    🏥 হাসপাতাল ব্রাউজ করুন
                  </button>
                  <button
                    onClick={() => navigate("/service/job")}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#006a4e] rounded-xl text-xs font-black transition border-none cursor-pointer"
                  >
                    💼 চাকরির খবর দেখুন
                  </button>
                </div>
              </div>
            ) : (
              filteredBookmarks.map((item) => {
                const catMeta = getCategoryMeta(item.type);
                const IconComp = catMeta.icon;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group relative overflow-hidden"
                  >
                    {/* Top Row: Category Tag & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${catMeta.color}`}>
                          <IconComp size={11} />
                          <span>{item.categoryLabel || catMeta.label}</span>
                        </span>

                        {item.rating && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span>{item.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons (Share, Note, Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditNote(item)}
                          title="ব্যক্তিগত নোট যোগ করুন"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-[#006a4e] border-none cursor-pointer transition active:scale-95"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          title="শেয়ার করুন"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 border-none cursor-pointer transition active:scale-95"
                        >
                          <Share2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            removeBookmark(item.id);
                            toast.success("বুকমার্ক থেকে সরানো হয়েছে");
                          }}
                          title="বুকমার্ক মুছুন"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-none cursor-pointer transition active:scale-95"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Title, Subtitle, Location & Phone */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-[#006a4e] transition-colors">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-xs font-semibold text-slate-600">
                            {item.subtitle}
                          </p>
                        )}

                        {item.address && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium pt-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span>{item.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Quick Call or Detail Button */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl text-xs font-black flex items-center gap-1.5 transition no-underline shadow-xs border border-emerald-200"
                          >
                            <Phone size={13} />
                            <span>কল করুন</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (item.link) {
                              navigate(item.link);
                            } else if (item.linkId) {
                              navigate(`/service/${item.linkId}`);
                            } else {
                              navigate(`/p/search?q=${encodeURIComponent(item.title)}`);
                            }
                          }}
                          className="px-3.5 py-2 bg-[#006a4e] hover:bg-[#00543e] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition border-none cursor-pointer shadow-sm active:scale-95"
                        >
                          <span>বিস্তারিত</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Personal Note (if exists or editing) */}
                    {editingNoteId === item.id ? (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 space-y-2 mt-1">
                        <label className="block text-[11px] font-black text-amber-900">
                          ব্যক্তিগত নোট বা মন্তব্য:
                        </label>
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="যেমন: আগামী রবিবার চেম্বারে যেতে হবে / জরুরি সেভ"
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-600"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-bold border-none cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={() => saveNote(item.id)}
                            className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-black border-none cursor-pointer flex items-center gap-1"
                          >
                            <Check size={12} /> সেভ
                          </button>
                        </div>
                      </div>
                    ) : item.notes ? (
                      <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl px-3 py-2 text-xs font-medium text-amber-900 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-amber-700">📝 নোট:</span>
                          <span>{item.notes}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEditNote(item)}
                          className="text-[10px] text-amber-700 underline font-bold border-none bg-transparent cursor-pointer p-0"
                        >
                          সম্পাদনা
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-sans text-center"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  সব বুকমার্ক মুছে ফেলতে চান?
                </h3>
                <p className="text-xs text-slate-500">
                  আপনার সংরক্ষিত সমস্ত {bookmarks.length}টি ডাক্তার, হাসপাতাল ও সেবার তথ্য স্থায়ীভাবে মুছে যাবে।
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAllBookmarks();
                    setShowClearConfirm(false);
                    toast.success("সমস্ত বুকমার্ক মুছে ফেলা হয়েছে");
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs border-none cursor-pointer shadow-md"
                >
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default BookmarksPage;

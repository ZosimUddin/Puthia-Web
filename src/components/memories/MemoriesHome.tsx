import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Settings,
  Share2,
  Bell,
  BellOff,
  EyeOff,
  UserX,
  CalendarX,
  ShieldCheck,
  Plus,
  RefreshCw,
  Heart,
  MessageSquare,
  Globe,
  ChevronRight,
  BookOpen,
  Trophy,
  History,
  Info,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import {
  MemoryItem,
  MemoryPreferences,
  MemoryType,
  fetchTodayMemories,
  fetchArchiveMemories,
  getMemoryPreferences,
  toggleMemoryNotifications,
  toBengaliNumber,
  formatBengaliDate
} from "../../services/memoryService";
import { MemoryCard } from "./MemoryCard";
import { ShareMemoryModal } from "./ShareMemoryModal";
import { MemoryPreferencesModal } from "./MemoryPreferencesModal";
import { MemorySearchFilter } from "./MemorySearchFilter";
import { useNavigate } from "react-router-dom";

interface MemoriesHomeProps {
  onOpenCreatePostModal?: () => void;
  onNavigateToFeed?: () => void;
}

export const MemoriesHome: React.FC<MemoriesHomeProps> = ({
  onOpenCreatePostModal,
  onNavigateToFeed
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'today' | 'archive' | 'search' | 'preferences'>('today');

  // Data states
  const [todayMemories, setTodayMemories] = useState<MemoryItem[]>([]);
  const [archiveMemories, setArchiveMemories] = useState<MemoryItem[]>([]);
  const [prefs, setPrefs] = useState<MemoryPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>("সকল এলাকা");

  // Modals
  const [sharingMemory, setSharingMemory] = useState<MemoryItem | null>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  const loadAllMemories = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const userPrefs = await getMemoryPreferences(user.uid);
      setPrefs(userPrefs);

      const [today, archive] = await Promise.all([
        fetchTodayMemories(user.uid, new Date()),
        fetchArchiveMemories(user.uid, {
          year: selectedYear,
          month: selectedMonth,
          type: selectedType,
          keyword: searchQuery,
          location: selectedLocation === "সকল এলাকা" ? undefined : selectedLocation
        })
      ]);

      setTodayMemories(today);
      setArchiveMemories(archive);
    } catch (err) {
      console.error("Error loading memories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMemories();
  }, [user?.uid]);

  // Refetch archive on filter change
  useEffect(() => {
    if (!user?.uid || activeTab === 'today') return;
    const fetchFiltered = async () => {
      const archive = await fetchArchiveMemories(user.uid, {
        year: selectedYear,
        month: selectedMonth,
        type: selectedType,
        keyword: searchQuery,
        location: selectedLocation === "সকল এলাকা" ? undefined : selectedLocation
      });
      setArchiveMemories(archive);
    };
    fetchFiltered();
  }, [searchQuery, selectedType, selectedYear, selectedMonth, selectedLocation, activeTab, user?.uid]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllMemories();
    setIsRefreshing(false);
    toast.success("স্মৃতি রিফ্রেশ করা হয়েছে!");
  };

  const handleHideSuccess = (memoryId: string) => {
    setTodayMemories(prev => prev.filter(m => m.id !== memoryId));
    setArchiveMemories(prev => prev.filter(m => m.id !== memoryId));
  };

  // Group today's memories by yearsAgo
  const groupedTodayMemories = useMemo(() => {
    const groups: { [yearsAgo: number]: MemoryItem[] } = {};
    todayMemories.forEach(m => {
      if (!groups[m.yearsAgo]) {
        groups[m.yearsAgo] = [];
      }
      groups[m.yearsAgo].push(m);
    });
    return groups;
  }, [todayMemories]);

  const sortedYearsAgoKeys = useMemo(() => {
    return Object.keys(groupedTodayMemories)
      .map(Number)
      .sort((a, b) => a - b);
  }, [groupedTodayMemories]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user?.uid) return;
    try {
      await toggleMemoryNotifications(user.uid, enabled);
      setPrefs(prev => prev ? { ...prev, notificationsEnabled: enabled } : null);
      toast.success(enabled ? "স্মৃতি নোটিফিকেশন চালু করা হয়েছে 🔔" : "স্মৃতি নোটিফিকেশন বন্ধ করা হয়েছে 🔕");
    } catch {
      toast.error("নোটিফিকেশন সেটিংস আপডেট করা যায়নি");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. HERO BRANDING BANNER */}
      <div className="bg-gradient-to-r from-[#006a4e] via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-6 text-white/10 hidden sm:block pointer-events-none">
          <History size={120} />
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-black border border-white/10 shadow-sm">
            <Clock size={14} className="text-amber-300" />
            <span>আড্ডা স্মৃতি — অন দিস ডে (On This Day)</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
            পুরোনো মধুর স্মৃতি ফিরে দেখুন
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            পুঠিয়া আড্ডায় বিগত বছরগুলোতে আপনার শেয়ার করা পোস্ট, ছবি, ভিডিও এবং বিশেষ মুহূর্তগুলো আজকের দিনে ফিরে পান ও বন্ধুদের সাথে আবার শেয়ার করুন।
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span>রিফ্রেশ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreferencesModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Settings size={13} />
              <span>স্মৃতি সেটিংস</span>
            </button>

            {prefs && (
              <button
                type="button"
                onClick={() => handleToggleNotifications(!prefs.notificationsEnabled)}
                className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                {prefs.notificationsEnabled ? <Bell size={13} className="text-amber-300" /> : <BellOff size={13} />}
                <span>{prefs.notificationsEnabled ? "নোটিফিকেশন অন" : "নোটিফিকেশন অফ"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. TOP MAIN NAVIGATION TABS */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'today', label: '🕰️ আজকের স্মৃতি', count: todayMemories.length },
          { id: 'archive', label: '🗂️ স্মৃতি আর্কাইভ', count: archiveMemories.length },
          { id: 'search', label: '🔍 স্মৃতি সন্ধান' },
          { id: 'preferences', label: '⚙️ পছন্দ ও সেটিংস' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'preferences') {
                  setIsPreferencesModalOpen(true);
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#006a4e] text-white shadow-sm shadow-emerald-700/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {toBengaliNumber(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN 3-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================
            LEFT COLUMN (4 cols on lg): Summary & Navigation Shortcuts
           ========================================================= */}
        <aside className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
              আপনার স্মৃতি প্রোফাইল
            </span>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-3">
              <img
                src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.uid || 'guest'}`}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {userProfile?.name || user?.displayName || 'সম্মানিত নাগরিক'}
                </h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {userProfile?.union || 'পুঠিয়া ইউনিয়ন'}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black mt-0.5">
                  ⭐ {toBengaliNumber(userProfile?.stars || 150)} ইস্টার
                </p>
              </div>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-[#006a4e] dark:text-emerald-400 block">
                  {toBengaliNumber(todayMemories.length)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">আজকের স্মৃতি</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center border border-slate-100 dark:border-slate-800">
                <span className="text-lg font-black text-slate-700 dark:text-slate-300 block">
                  {toBengaliNumber(archiveMemories.length)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">মোট আর্কাইভ</span>
              </div>
            </div>

            {/* Left Nav Shortcuts */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'today'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock size={15} /> আজকের স্মৃতি
                </span>
                <span className="text-[10px] font-black">{toBengaliNumber(todayMemories.length)}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('archive')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'archive'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={15} /> সম্পূর্ণ আর্কাইভ
                </span>
                <span className="text-[10px] font-black">{toBengaliNumber(archiveMemories.length)}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'search'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Search size={15} /> স্মৃতি সন্ধান
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsPreferencesModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Settings size={15} /> পছন্দ ও গোপনীয়তা
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>১০০% সুরক্ষিত ও ব্যক্তিগত</span>
            </div>
            <p className="leading-relaxed">
              আপনার স্মৃতি শুধুমাত্র আপনি দেখতে পান। শেয়ার বাটনে ক্লিক না করা পর্যন্ত অন্য কেউ এই স্মৃতি দেখতে পাবেন না।
            </p>
          </div>
        </aside>

        {/* =========================================================
            CENTER COLUMN (8 cols on lg): Memory Stream & Feed
           ========================================================= */}
        <section className="lg:col-span-8 space-y-5 order-1 lg:order-2">
          {/* If Search Tab Active -> Render Search Filters */}
          {(activeTab === 'search' || activeTab === 'archive') && (
            <MemorySearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onResetFilters={() => {
                setSearchQuery("");
                setSelectedType('all');
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedLocation("সকল এলাকা");
              }}
            />
          )}

          {/* LOADING STATE */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">আপনার স্মৃতিগুলো স্ক্যান ও প্রস্তুত করা হচ্ছে...</p>
            </div>
          ) : activeTab === 'today' ? (
            /* =========================================================
               A. TODAY MEMORIES STREAM
               ========================================================= */
            todayMemories.length > 0 ? (
              <div className="space-y-6">
                {sortedYearsAgoKeys.map(yearsAgo => {
                  const items = groupedTodayMemories[yearsAgo] || [];
                  const sampleDate = items[0]?.formattedDateBn || "";
                  return (
                    <div key={yearsAgo} className="space-y-4">
                      {/* Section Anniversary Header */}
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          <span>{toBengaliNumber(yearsAgo)} বছর আগে আজকের দিনে</span>
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                          {sampleDate}
                        </span>
                      </div>

                      {/* Render memory cards for this year */}
                      <div className="space-y-4">
                        {items.map(memory => (
                          <MemoryCard
                            key={memory.id}
                            memory={memory}
                            onOpenShareModal={setSharingMemory}
                            onHideSuccess={handleHideSuccess}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =========================================================
                 EMPTY STATE — Clean, Beautiful, No Demo Data
                 ========================================================= */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                  <Clock size={32} />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    আজকের জন্য কোনো স্মৃতি পাওয়া যায়নি
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    বিগত বছরগুলোতে আজকের দিনে আপনার কোনো পোস্ট বা ছবি ছিল না। নিয়মিত আড্ডায় যুক্ত থাকুন, নতুন নতুন স্মৃতি তৈরি হতে থাকুক! 💚
                  </p>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCreatePostModal) {
                        onOpenCreatePostModal();
                      } else {
                        navigate('/adda');
                      }
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>নতুন আড্ডা পোস্ট করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('archive')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    <span>স্মৃতি আর্কাইভ দেখুন</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            /* =========================================================
               B. ARCHIVE / SEARCH RESULTS STREAM
               ========================================================= */
            archiveMemories.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    মোট {toBengaliNumber(archiveMemories.length)} টি স্মৃতি পাওয়া গেছে
                  </h3>
                </div>

                <div className="space-y-4">
                  {archiveMemories.map(memory => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onOpenShareModal={setSharingMemory}
                      onHideSuccess={handleHideSuccess}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <Search size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-800 dark:text-white">
                  নির্বাচিত ফিল্টারে কোনো স্মৃতি পাওয়া যায়নি
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                  অনুগ্রহ করে অন্য কোনো বছর, মাস বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType('all');
                    setSelectedYear('all');
                    setSelectedMonth('all');
                    setSelectedLocation("সকল এলাকা");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  ফিল্টার রিসেট
                </button>
              </div>
            )
          )}
        </section>
      </div>

      {/* MODALS */}
      <ShareMemoryModal
        isOpen={!!sharingMemory}
        onClose={() => setSharingMemory(null)}
        memory={sharingMemory}
        onShareSuccess={() => {
          if (onNavigateToFeed) onNavigateToFeed();
        }}
      />

      <MemoryPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onPreferencesUpdated={loadAllMemories}
      />
    </div>
  );
};

export default MemoriesHome;

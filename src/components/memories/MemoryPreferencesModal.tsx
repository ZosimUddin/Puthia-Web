import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  EyeOff,
  UserX,
  CalendarX,
  Bell,
  Trash2,
  Plus,
  Check,
  Shield,
  Search,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";
import {
  MemoryPreferences,
  getMemoryPreferences,
  saveMemoryPreferences,
  unhideMemory,
  hidePersonFromMemories,
  unhidePersonFromMemories,
  hideDateFromMemories,
  unhideDateFromMemories,
  toggleMemoryNotifications,
  BENGALI_MONTHS,
  toBengaliNumber
} from "../../services/memoryService";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

interface MemoryPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated?: () => void;
}

export const MemoryPreferencesModal: React.FC<MemoryPreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'hidden_memories' | 'hidden_people' | 'hidden_dates'>('notifications');
  const [prefs, setPrefs] = useState<MemoryPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Date hide state
  const [hideDateType, setHideDateType] = useState<'month' | 'range'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // People search state
  const [peopleSearch, setPeopleSearch] = useState("");
  const [communityUsers, setCommunityUsers] = useState<{ uid: string; name: string; photoURL?: string; union?: string }[]>([]);

  const loadPreferences = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const p = await getMemoryPreferences(user.uid);
      setPrefs(p);
    } catch (err) {
      console.warn("Error fetching memory preferences:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadPreferences();

      // Fetch users for person hiding selector
      getDocs(query(collection(db, "users"), limit(40)))
        .then(snap => {
          const list: any[] = [];
          snap.forEach(d => {
            const data = d.data();
            if (d.id !== user.uid && data.name) {
              list.push({
                uid: d.id,
                name: data.name,
                photoURL: data.photoURL,
                union: data.union
              });
            }
          });
          setCommunityUsers(list);
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen, user?.uid]);

  if (!isOpen) return null;

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user?.uid) return;
    try {
      await toggleMemoryNotifications(user.uid, enabled);
      setPrefs(prev => prev ? { ...prev, notificationsEnabled: enabled } : null);
      toast.success(enabled ? "স্মৃতি নোটিফিকেশন চালু করা হয়েছে 🔔" : "স্মৃতি নোটিফিকেশন বন্ধ করা হয়েছে 🔕");
      onPreferencesUpdated?.();
    } catch {
      toast.error("নোটিফিকেশন সেটিংস আপডেট করা যায়নি");
    }
  };

  const handleUnhideMemory = async (memoryId: string) => {
    if (!user?.uid) return;
    try {
      await unhideMemory(user.uid, memoryId);
      setPrefs(prev => prev ? { ...prev, hiddenMemories: prev.hiddenMemories.filter(id => id !== memoryId) } : null);
      toast.success("স্মৃতিটি পুনরায় দৃশ্যমান করা হয়েছে");
      onPreferencesUpdated?.();
    } catch {
      toast.error("স্মৃতি আনহাইড করতে সমস্যা হয়েছে");
    }
  };

  const handleHidePerson = async (targetUser: { uid: string; name: string; photoURL?: string }) => {
    if (!user?.uid) return;
    try {
      await hidePersonFromMemories(user.uid, {
        id: targetUser.uid,
        name: targetUser.name,
        avatar: targetUser.photoURL
      });
      await loadPreferences();
      toast.success(`"${targetUser.name}"-এর স্মৃতি আর প্রস্তাবিত হবে না`);
      onPreferencesUpdated?.();
    } catch {
      toast.error("সেটিংস সংরক্ষণ করা যায়নি");
    }
  };

  const handleUnhidePerson = async (personId: string) => {
    if (!user?.uid) return;
    try {
      await unhidePersonFromMemories(user.uid, personId);
      setPrefs(prev => prev ? { ...prev, hiddenPeople: prev.hiddenPeople.filter(p => p.id !== personId) } : null);
      toast.success("ব্যক্তিকে স্মৃতিতে পুনরায় অনুমোদন দেওয়া হয়েছে");
      onPreferencesUpdated?.();
    } catch {
      toast.error("আনহাইড করা যায়নি");
    }
  };

  const handleAddHiddenDate = async () => {
    if (!user?.uid) return;
    try {
      if (hideDateType === 'month') {
        const monthYear = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const label = `${BENGALI_MONTHS[selectedMonth]} ${toBengaliNumber(selectedYear)}`;
        await hideDateFromMemories(user.uid, {
          id: `month_${monthYear}`,
          type: 'month',
          label,
          monthYear
        });
        toast.success(`"${label}" মাসের স্মৃতি গোপন করা হয়েছে`);
      } else {
        if (!rangeStart || !rangeEnd) {
          toast.error("অনুগ্রহ করে শুরুর ও শেষের তারিখ নির্বাচন করুন");
          return;
        }
        const label = `${rangeStart} হতে ${rangeEnd}`;
        await hideDateFromMemories(user.uid, {
          id: `range_${rangeStart}_${rangeEnd}`,
          type: 'range',
          label,
          startDate: rangeStart,
          endDate: rangeEnd
        });
        toast.success(`"${label}" মেয়াদের স্মৃতি গোপন করা হয়েছে`);
      }
      await loadPreferences();
      onPreferencesUpdated?.();
    } catch {
      toast.error("তারিখ যোগ করা যায়নি");
    }
  };

  const handleUnhideDate = async (dateId: string) => {
    if (!user?.uid) return;
    try {
      await unhideDateFromMemories(user.uid, dateId);
      setPrefs(prev => prev ? { ...prev, hiddenDates: prev.hiddenDates.filter(d => d.id !== dateId) } : null);
      toast.success("তারিখ ফিল্টার মুছে ফেলা হয়েছে");
      onPreferencesUpdated?.();
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  };

  const filteredCommunityUsers = communityUsers.filter(u =>
    u.name.toLowerCase().includes(peopleSearch.toLowerCase()) ||
    (u.union && u.union.toLowerCase().includes(peopleSearch.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col my-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  স্মৃতি সেটিংস ও পছন্দ
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  আপনার স্মৃতি সুপারিশ ও গোপনীয়তা নিয়ন্ত্রণ করুন
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Sub-tabs */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-1 text-center">
            {[
              { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
              { id: 'hidden_memories', label: 'গোপন স্মৃতি', icon: EyeOff },
              { id: 'hidden_people', label: 'ব্যক্তি ফিল্টার', icon: UserX },
              { id: 'hidden_dates', label: 'তারিখ ফিল্টার', icon: CalendarX }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold">সেটিংস লোড হচ্ছে...</p>
              </div>
            ) : (
              <>
                {/* 1. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Bell size={15} className="text-emerald-600" />
                          দৈনিক স্মৃতির নোটিফিকেশন
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          প্রতিদিন আপনার পুরোনো স্মৃতি প্রস্তুত হলে নোটিফিকেশনের মাধ্যমে জানানো হবে।
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={prefs?.notificationsEnabled !== false}
                          onChange={e => handleToggleNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-medium">
                      <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Info size={13} className="text-emerald-600" />
                        স্মৃতি প্রাইভেসি নির্দেশিকা:
                      </p>
                      <p>• আপনার স্মৃতি শুধুমাত্র আপনি এবং যাদের সাথে শেয়ার করা হয়েছিল তারা দেখতে পাবেন।</p>
                      <p>• মূল পোস্ট বা কন্টেন্ট ডিলিট করা হলে স্মৃতিতেও আর কখনো দেখানো হবে না।</p>
                    </div>
                  </div>
                )}

                {/* 2. HIDDEN MEMORIES TAB */}
                {activeTab === 'hidden_memories' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium">
                      যেসব স্মৃতি আপনি হোম সুপারিশ থেকে লুকিয়ে রেখেছেন ({prefs?.hiddenMemories.length || 0} টি):
                    </p>

                    {prefs?.hiddenMemories && prefs.hiddenMemories.length > 0 ? (
                      <div className="space-y-2">
                        {prefs.hiddenMemories.map(id => (
                          <div
                            key={id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                          >
                            <div className="flex items-center gap-2">
                              <EyeOff size={14} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                গোপন স্মৃতি #{id.replace('mem_', '').slice(0, 12)}...
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnhideMemory(id)}
                              className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 hover:underline"
                            >
                              পুনরায় দেখান
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 space-y-1">
                        <p className="text-xs font-bold">কোনো স্মৃতি গোপন করা নেই</p>
                        <p className="text-[11px]">যে কোনো স্মৃতির ৩-ডট মেনু থেকে আপনি তা লুকাতে পারেন।</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HIDDEN PEOPLE TAB */}
                {activeTab === 'hidden_people' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        নির্দিষ্ট ব্যক্তির স্মৃতি গোপন রাখুন:
                      </label>
                      <p className="text-[11px] text-slate-400">
                        কাউকে যুক্ত করলে তাঁর সাথে থাকা স্মৃতি বা তাঁর ট্যাগ করা পোস্ট সুপারিশ করা হবে না।
                      </p>
                    </div>

                    {/* Currently hidden people list */}
                    {prefs?.hiddenPeople && prefs.hiddenPeople.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          বর্তমানে গোপনকৃত ব্যক্তিগণ:
                        </span>
                        <div className="space-y-1.5">
                          {prefs.hiddenPeople.map(p => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.id}`}
                                  alt={p.name}
                                  className="w-7 h-7 rounded-full object-cover border border-rose-200"
                                />
                                <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                                  {p.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnhidePerson(p.id)}
                                className="text-[11px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                              >
                                <Trash2 size={12} />
                                মুছুন
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add person search */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={peopleSearch}
                          onChange={e => setPeopleSearch(e.target.value)}
                          placeholder="নাগরিকদের নাম দিয়ে খুঁজুন..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {filteredCommunityUsers.map(u => {
                          const isAlreadyHidden = prefs?.hiddenPeople.some(p => p.id === u.uid);
                          if (isAlreadyHidden) return null;
                          return (
                            <div
                              key={u.uid}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.uid}`}
                                  alt={u.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {u.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleHidePerson({ uid: u.uid, name: u.name, photoURL: u.photoURL })}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-[10px] font-black text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                              >
                                <EyeOff size={10} />
                                গোপন করুন
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. HIDDEN DATES TAB */}
                {activeTab === 'hidden_dates' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        নির্দিষ্ট তারিখ বা মাস গোপন রাখুন:
                      </label>
                      <p className="text-[11px] text-slate-400">
                        সেই সময়কালের কোনো স্মৃতি হোম ফিডে সুপারিশ করা হবে না।
                      </p>
                    </div>

                    {/* Active date filters */}
                    {prefs?.hiddenDates && prefs.hiddenDates.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          বর্তমানে গোপনকৃত তারিখসমূহ:
                        </span>
                        <div className="space-y-1.5">
                          {prefs.hiddenDates.map(d => (
                            <div
                              key={d.id}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30"
                            >
                              <div className="flex items-center gap-2">
                                <CalendarX size={14} className="text-amber-600" />
                                <span className="text-xs font-bold text-slate-800 dark:text-white">
                                  {d.label}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUnhideDate(d.id)}
                                className="text-[11px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                              >
                                <Trash2 size={12} />
                                মুছুন
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add date selector form */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHideDateType('month')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            hideDateType === 'month'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          নির্দিষ্ট মাস গোপন
                        </button>
                        <button
                          type="button"
                          onClick={() => setHideDateType('range')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            hideDateType === 'range'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          তারিখ রেঞ্জ গোপন
                        </button>
                      </div>

                      {hideDateType === 'month' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">বছর:</label>
                            <select
                              value={selectedYear}
                              onChange={e => setSelectedYear(Number(e.target.value))}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                            >
                              {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                                <option key={y} value={y}>{toBengaliNumber(y)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">মাস:</label>
                            <select
                              value={selectedMonth}
                              onChange={e => setSelectedMonth(Number(e.target.value))}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                            >
                              {BENGALI_MONTHS.map((m, idx) => (
                                <option key={idx} value={idx}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">শুরু:</label>
                            <input
                              type="date"
                              value={rangeStart}
                              onChange={e => setRangeStart(e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">শেষ:</label>
                            <input
                              type="date"
                              value={rangeEnd}
                              onChange={e => setRangeEnd(e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAddHiddenDate}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus size={14} />
                        ফিল্টার যুক্ত করুন
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-[#006a4e] text-white text-xs font-black hover:bg-[#00523c] transition-all shadow-md shadow-emerald-700/10"
            >
              সম্পন্ন হয়েছে
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemoryPreferencesModal;

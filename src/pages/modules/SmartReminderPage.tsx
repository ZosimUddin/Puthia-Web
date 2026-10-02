import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CalendarClock, Plus, CheckCircle2, Clock, Trash2, Edit3, 
  Sparkles, ArrowLeft, Filter, AlertTriangle, Zap, Building2, 
  Cake, Pill, GraduationCap, BellRing, Check, Volume2, ShieldAlert, 
  Calendar, RotateCcw, Search, ChevronRight, X, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface ReminderItem {
  id: string;
  title: string;
  category: 'bill' | 'tax' | 'birthday' | 'medicine' | 'exam';
  categoryLabel: string;
  date: string;
  time: string;
  repeat: 'none' | 'daily' | 'monthly' | 'yearly';
  note?: string;
  isCompleted: boolean;
  notifyEnabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

const CATEGORIES = [
  { id: 'all', label: 'সবগুলো', icon: CalendarClock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'bill', label: 'বিলের তারিখ', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'tax', label: 'ট্যাক্স ও কর', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'birthday', label: 'জন্মদিন', icon: Cake, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'medicine', label: 'ওষুধের সময়', icon: Pill, color: 'text-[#009664]', bg: 'bg-emerald-50' },
  { id: 'exam', label: 'পরীক্ষার তারিখ', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'পল্লী বিদ্যুৎ বিল পরিশোধ (পুঠিয়া জোন)',
    category: 'bill',
    categoryLabel: 'বিলের তারিখ',
    date: '2026-07-28',
    time: '১০:০০ AM',
    repeat: 'monthly',
    note: 'বিকাশ বা নিকটস্থ ডিলার ইস্টারে বিল পরিশোধ করতে হবে।',
    isCompleted: false,
    notifyEnabled: true,
    priority: 'high'
  },
  {
    id: 'rem-2',
    title: 'পুঠিয়া পৌরসভা হোল্ডিং ট্যাক্স জমাদান',
    category: 'tax',
    categoryLabel: 'ট্যাক্স ও কর',
    date: '2026-08-15',
    time: '১১:৩০ AM',
    repeat: 'yearly',
    note: 'পৌরসভা কার্যালয়ে চালান মারফত প্রদান।',
    isCompleted: false,
    notifyEnabled: true,
    priority: 'medium'
  },
  {
    id: 'rem-3',
    title: 'সকালের প্রেশারের ওষুধ (Amlodipine 5mg)',
    category: 'medicine',
    categoryLabel: 'ওষুধের সময়',
    date: '2026-07-22',
    time: '০৮:০০ AM',
    repeat: 'daily',
    note: 'নাস্তার পর ১টি টেবলেট পানি দিয়ে সেবন করুন।',
    isCompleted: true,
    notifyEnabled: true,
    priority: 'high'
  },
  {
    id: 'rem-4',
    title: 'ছোট ভাই রহিমের ১৮তম জন্মদিন',
    category: 'birthday',
    categoryLabel: 'জন্মদিন',
    date: '2026-08-02',
    time: '১২:০০ AM',
    repeat: 'yearly',
    note: 'কেক ও শুভেচ্ছা বার্তা পাঠানো।',
    isCompleted: false,
    notifyEnabled: true,
    priority: 'low'
  },
  {
    id: 'rem-5',
    title: '৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষা',
    category: 'exam',
    categoryLabel: 'পরীক্ষার তারিখ',
    date: '2026-08-20',
    time: '১০:০০ AM',
    repeat: 'none',
    note: 'প্রবেশপত্র ও ব্ল্যাক বলপেন সাথে রাখা জরুরি।',
    isCompleted: false,
    notifyEnabled: true,
    priority: 'high'
  },
  {
    id: 'rem-6',
    title: 'ইন্টারনেট বিল (পুঠিয়া ব্রডব্যান্ড)',
    category: 'bill',
    categoryLabel: 'বিলের তারিখ',
    date: '2026-08-05',
    time: '০৬:০০ PM',
    repeat: 'monthly',
    note: 'মাসিক ৮০০ টাকা স্পিড প্যাক রিচার্জ।',
    isCompleted: false,
    notifyEnabled: false,
    priority: 'medium'
  }
];

export const SmartReminderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);

  // Reminders state loaded from LocalStorage
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_smart_reminders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_REMINDERS;
  });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'bill' | 'tax' | 'birthday' | 'medicine' | 'exam'>('bill');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('০৯:০০ AM');
  const [formRepeat, setFormRepeat] = useState<'none' | 'daily' | 'monthly' | 'yearly'>('none');
  const [formNote, setFormNote] = useState('');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('puthia_smart_reminders', JSON.stringify(reminders));
    } catch (e) {}
  }, [reminders]);

  // Handle Form Submit
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('অনুগ্রহ করে রিমাইন্ডারের শিরোনাম লিখুন');
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === formCategory);

    if (editingId) {
      setReminders(prev => prev.map(item => item.id === editingId ? {
        ...item,
        title: formTitle,
        category: formCategory,
        categoryLabel: catObj ? catObj.label : 'অন্যান্য',
        date: formDate || new Date().toISOString().split('T')[0],
        time: formTime,
        repeat: formRepeat,
        note: formNote,
        priority: formPriority
      } : item));
      toast.success('রিমাইন্ডার সফলভাবে আপডেট করা হয়েছে');
    } else {
      const newItem: ReminderItem = {
        id: `rem-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        categoryLabel: catObj ? catObj.label : 'অন্যান্য',
        date: formDate || new Date().toISOString().split('T')[0],
        time: formTime,
        repeat: formRepeat,
        note: formNote,
        isCompleted: false,
        notifyEnabled: true,
        priority: formPriority
      };
      setReminders(prev => [newItem, ...prev]);
      toast.success('নতুন রিমাইন্ডার যোগ করা হয়েছে!');
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('bill');
    setFormDate('');
    setFormTime('০৯:০০ AM');
    setFormRepeat('none');
    setFormNote('');
    setFormPriority('medium');
    setEditingId(null);
  };

  const handleEditClick = (item: ReminderItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDate(item.date);
    setFormTime(item.time);
    setFormRepeat(item.repeat);
    setFormNote(item.note || '');
    setFormPriority(item.priority);
    setIsAddModalOpen(true);
  };

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(item => {
      if (item.id === id) {
        const updatedStatus = !item.isCompleted;
        if (updatedStatus) {
          toast.success('রিমাইন্ডারটি সম্পন্ন করা হয়েছে!');
        }
        return { ...item, isCompleted: updatedStatus };
      }
      return item;
    }));
  };

  const toggleNotification = (id: string) => {
    setReminders(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.notifyEnabled;
        toast.info(nextState ? 'নোটিফিকেশন চালু করা হয়েছে' : 'নোটিফিকেশন বন্ধ করা হয়েছে');
        return { ...item, notifyEnabled: nextState };
      }
      return item;
    }));
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(i => i.id !== id));
    toast.success('রিমাইন্ডার মুছে ফেলা হয়েছে');
  };

  // Filtered List
  const filteredReminders = reminders.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (filterStatus === 'pending') matchesStatus = !item.isCompleted;
    if (filterStatus === 'completed') matchesStatus = item.isCompleted;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Calculate Counters
  const pendingCount = reminders.filter(r => !r.isCompleted).length;
  const billCount = reminders.filter(r => r.category === 'bill' && !r.isCompleted).length;
  const medicineCount = reminders.filter(r => r.category === 'medicine' && !r.isCompleted).length;

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
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
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #047857 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> স্মার্ট রিমাইন্ডার হাব
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                স্মার্ট রিমাইন্ডার অ্যালার্ট
              </h1>
              <p className="text-xs sm:text-sm text-teal-100 font-medium leading-relaxed">
                বিলের তারিখ, পৌরসভা ট্যাক্স, ওষুধ খাওয়ার সময়, পরীক্ষা ও জন্মদিনের অ্যালার্ট এক পলকে সেট করুন।
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
                <span className="block text-lg font-black text-amber-300">{pendingCount}</span>
                <span className="text-[10px] text-teal-100 font-medium">অপেক্ষমাণ রিমাইন্ডার</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
                <span className="block text-lg font-black text-amber-300">{billCount}</span>
                <span className="text-[10px] text-teal-100 font-medium">আসন্ন বিল/ট্যাক্স</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
                <span className="block text-lg font-black text-amber-300">{medicineCount}</span>
                <span className="text-[10px] text-teal-100 font-medium">দৈনিক ওষুধ সেবা</span>
              </div>
            </div>
          </div>

          <div className="px-4 max-w-3xl mx-auto space-y-5">

            {/* Notification Permission Card */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#009664] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BellRing size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">পুশ নোটিফিকেশন অ্যালার্ট</p>
                  <p className="text-[11px] text-emerald-800 font-medium">সময়মত আপনার মোবাইলে নোটিফিকেশন পেতে অ্যালার্ট চালু রাখুন।</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNotificationsAllowed(!notificationsAllowed);
                  toast.success(notificationsAllowed ? 'নোটিফিকেশন মিউট করা হয়েছে' : 'স্মার্ট অ্যালার্ট নোটিফিকেশন সক্রিয় করা হয়েছে!');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer shadow-2xs ${
                  notificationsAllowed 
                    ? 'bg-[#009664] text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {notificationsAllowed ? 'চালু আছে ✓' : 'চালু করুন'}
              </button>
            </div>

            {/* Action Bar: Search + Add New Reminder */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="রিমাইন্ডার খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Status Toggle filter */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center text-[11px] font-bold">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'}`}
                  >
                    সব
                  </button>
                  <button 
                    onClick={() => setFilterStatus('pending')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterStatus === 'pending' ? 'bg-white text-[#009664] shadow-2xs' : 'text-slate-500'}`}
                  >
                    অপেক্ষমাণ
                  </button>
                  <button 
                    onClick={() => setFilterStatus('completed')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterStatus === 'completed' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                  >
                    সম্পন্ন
                  </button>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#009664] hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                >
                  <Plus size={16} strokeWidth={2.5} /> নতুন রিমাইন্ডার
                </button>
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-[#009664] text-white border-[#009664] shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-white' : cat.color} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reminders List Section */}
            <div className="space-y-3">
              {filteredReminders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-100/80 shadow-2xs my-4 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <CalendarClock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">কোনো রিমাইন্ডার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">আপনার প্রয়োজনীয় বিষয়টির জন্য নতুন রিমাইন্ডার সেট করুন।</p>
                  </div>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#009664] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} /> নতুন যোগ করুন
                  </button>
                </div>
              ) : (
                filteredReminders.map((item) => {
                  const CategoryIcon = CATEGORIES.find(c => c.id === item.category)?.icon || CalendarClock;
                  const categoryBg = CATEGORIES.find(c => c.id === item.category)?.bg || 'bg-slate-100';
                  const categoryColor = CATEGORIES.find(c => c.id === item.category)?.color || 'text-slate-600';

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isCompleted 
                          ? 'border-slate-200 bg-slate-50/70 opacity-75' 
                          : 'border-slate-200/90 hover:border-emerald-300'
                      }`}
                    >
                      {/* Left Block: Checkbox + Title + Category */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer shrink-0 ${
                            item.isCompleted 
                              ? 'bg-[#009664] text-white' 
                              : 'border-2 border-slate-300 hover:border-[#009664]'
                          }`}
                          title={item.isCompleted ? 'অসম্পূর্ণ চিহ্নিত করুন' : 'সম্পন্ন চিহ্নিত করুন'}
                        >
                          {item.isCompleted && <Check size={14} strokeWidth={3} />}
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryBg} ${categoryColor} inline-flex items-center gap-1`}>
                              <CategoryIcon size={12} /> {item.categoryLabel}
                            </span>

                            {item.priority === 'high' && (
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-200">
                                🔴 জরুরি
                              </span>
                            )}

                            {item.repeat !== 'none' && (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                🔄 {item.repeat === 'daily' ? 'প্রতিদিন' : item.repeat === 'monthly' ? 'প্রতি মাসে' : 'প্রতি বছর'}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-sm font-black leading-snug ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item.title}
                          </h3>

                          {item.note && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Date, Time & Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs shrink-0">
                        <div className="flex items-center gap-2 text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                          <span className="flex items-center gap-1 text-[#009664] font-bold">
                            <Calendar size={13} /> {item.date}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 font-mono text-slate-700">
                            <Clock size={13} /> {item.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Toggle Bell */}
                          <button
                            onClick={() => toggleNotification(item.id)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              item.notifyEnabled 
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={item.notifyEnabled ? 'নোটিফিকেশন বন্ধ করুন' : 'নোটিফিকেশন চালু করুন'}
                          >
                            <Bell size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Quick Helper Tip Box */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-4 text-white space-y-2 shadow-md">
              <div className="flex items-center gap-2.5">
                <Zap size={18} className="text-emerald-500 shrink-0" />
                <h3 className="text-xs font-black text-white">স্মার্ট রিমাইন্ডার কেন ব্যবহার করবেন?</h3>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                পুঠিয়া উপজেলার বিদ্যুৎ বিল, পৌরসভা কর, পাসপোর্ট বা লাইসেন্স নবায়ন এবং পরিবারের ওষুধ সেবনের সঠিক সময় মনে রাখা এখন আরও সহজ।
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Add / Edit Reminder Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <CalendarClock size={18} className="text-[#009664]" /> 
                  {editingId ? 'রিমাইন্ডার আপডেট করুন' : 'নতুন রিমাইন্ডার সেট করুন'}
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveReminder} className="space-y-3.5 text-xs">
                
                {/* Category Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি নির্বাচন করুন</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => {
                      const CatIcon = c.icon;
                      const isSel = formCategory === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormCategory(c.id as any)}
                          className={`p-2 rounded-xl border text-center font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isSel 
                              ? 'bg-[#009664] text-white border-[#009664]' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <CatIcon size={14} /> {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reminder Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রিমাইন্ডারের বিষয় / টাইটেল *</label>
                  <input 
                    type="text"
                    placeholder="যেমন: বিদ্যুৎ বিল পরিশোধ, সকালের প্রেসার ওষুধ"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">তারিখ</label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সময়</label>
                    <input 
                      type="text"
                      placeholder="১০:০০ AM"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    />
                  </div>
                </div>

                {/* Repeat & Priority */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পুনরাবৃত্তি (Repeat)</label>
                    <select
                      value={formRepeat}
                      onChange={(e) => setFormRepeat(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    >
                      <option value="none">একবার (None)</option>
                      <option value="daily">প্রতিদিন (Daily)</option>
                      <option value="monthly">প্রতি মাসে (Monthly)</option>
                      <option value="yearly">প্রতি বছর (Yearly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">জরুরি মাত্রা</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    >
                      <option value="high">🔴 উচ্চ (High)</option>
                      <option value="medium">🟡 সাধারণ (Medium)</option>
                      <option value="low">🟢 কম (Low)</option>
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অতিরিক্ত নোট / বিবরণ</label>
                  <textarea 
                    rows={2}
                    placeholder="যেমন: চালান নম্বর, প্রেশারের মাত্রা, প্রয়োজনীয় কাগজপত্র..."
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#009664] text-white rounded-xl font-bold shadow-md cursor-pointer hover:bg-emerald-700 transition"
                  >
                    {editingId ? 'হালনাগাদ করুন' : 'সেভ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default SmartReminderPage;

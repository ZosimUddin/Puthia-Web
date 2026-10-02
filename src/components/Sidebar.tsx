import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Home, Landmark, User, Wallet, GraduationCap, Sprout, HeartPulse, 
  Bus, Train, Car, Bike, Map as MapIcon, Plane, Fuel, Briefcase, HandHelping, ShieldAlert, Users, Calendar, HelpCircle, 
  Settings, X, Search, ChevronDown, ChevronRight, Star,
  Info, History, Building2, MapPin, Baby, IdCard, FileText, LayoutGrid,
  Building, Smartphone, ShieldCheck, CreditCard, Receipt,
  Compass, BedDouble, Utensils, Cloud, CloudRain, Clock, Megaphone, Sparkles, Percent, Church, Moon,
  Stethoscope, Pill, PhoneCall, MessageSquare, FileSignature, Download, AlertTriangle, CalendarClock, FileCheck2, Wrench, Vote, Lock, Headset,
  Activity, Syringe, UserCheck, BookOpen, School, Award, FileSpreadsheet, Library, Store, ShoppingBag, Plus, Mic, MicOff,
  Newspaper, Tv, Globe, Image, Fish, Egg, Tractor, Calculator, DollarSign, Laptop, Sun, Trees, Wifi, Zap, Droplets, Flame, Cpu, Armchair, Monitor, Scale,
  Headphones, Shield, Crown, Edit, LayoutDashboard, Gift, LogOut, LogIn, AlertCircle, Bell, Leaf
} from 'lucide-react';
import { SiteContentService, CitizenDrawerMenuItem } from '../services/siteContentService';
import RoleBottomSheet from './home/RoleBottomSheet';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  activeItem?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Info,
  ShieldCheck,
  Headphones,
  Shield,
  FileSignature,
  FileText,
  Star,
  AlertTriangle,
  Download,
  Globe,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Smartphone,
  Landmark,
  Building,
  Store,
  GraduationCap
};

// Default Subtitles matching Image 2 design system
const DEFAULT_SUBTITLES: Record<string, string> = {
  dashboard: 'সবার জন্য এক জায়গায় সব তথ্য',
  about: 'ইতিহাস, পরিচিতি, মানচিত্র',
  guide: 'কিভাবে ব্যবহার করবেন',
  support: 'সহায়তা ও যোগাযোগ',
  privacy: 'আপনার তথ্য আমাদের সুরক্ষা',
  terms: 'ব্যবহারের নিয়ম ও শর্ত',
  'content-policy': 'তথ্য ব্যবহারের নীতি',
  reviews: 'আপনার মতামত আমাদের অনুপ্রেরণা',
  feedback: 'সমস্যা জানাতে ও সমাধান পেতে',
  download: 'অফলাইনে ব্যবহার করুন',
};

export function Sidebar({ isOpen, onClose, onNavigate, activeItem }: SidebarProps) {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  let unreadCount = 0;
  try {
    const notifContext = useNotifications();
    unreadCount = notifContext?.unreadCount || 0;
  } catch {
    unreadCount = 0;
  }

  let currentPath = '';
  try {
    const location = useLocation();
    currentPath = location?.pathname || '';
  } catch {
    currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  }

  const [drawerItems, setDrawerItems] = useState<CitizenDrawerMenuItem[]>(() => {
    return SiteContentService.getDrawerItems();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleBottomSheetOpen, setIsRoleBottomSheetOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Load active items
    const loadItems = () => {
      setDrawerItems(SiteContentService.getDrawerItems());
    };
    loadItems();

    // Listen for real-time drawer updates from Super Admin
    const handleDrawerUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CitizenDrawerMenuItem[]>;
      if (customEvent.detail) {
        setDrawerItems(customEvent.detail);
      } else {
        loadItems();
      }
    };

    window.addEventListener('citizen-drawer-updated', handleDrawerUpdate);
    window.addEventListener('storage', loadItems);

    return () => {
      window.removeEventListener('citizen-drawer-updated', handleDrawerUpdate);
      window.removeEventListener('storage', loadItems);
    };
  }, []);

  const activeMenuItems = useMemo(() => {
    return drawerItems
      .filter(item => item.enabled)
      .filter(item => item.id !== 'dashboard' && item.path !== '/' && item.label !== 'হোম');
  }, [drawerItems]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return activeMenuItems;
    const q = searchQuery.toLowerCase().trim();
    return activeMenuItems.filter(item => {
      const label = item.label.toLowerCase();
      const subtitle = (item.subtitle || DEFAULT_SUBTITLES[item.id] || '').toLowerCase();
      return label.includes(q) || subtitle.includes(q);
    });
  }, [activeMenuItems, searchQuery]);

  const handleItemClick = (item: CitizenDrawerMenuItem) => {
    onClose();
    if (item.path.startsWith('http')) {
      window.open(item.path, '_blank');
      return;
    }
    if (item.id === 'dashboard' || item.path === '/' || item.path === 'home') {
      onNavigate('home');
    } else {
      onNavigate(item.path);
    }
  };

  const isItemActive = (item: CitizenDrawerMenuItem) => {
    if (activeItem) {
      return activeItem === item.id || activeItem === item.path;
    }
    if (item.id === 'dashboard' || item.path === '/') {
      return currentPath === '/' || currentPath === '/home';
    }
    return currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      onClose();
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const role = userProfile?.role || 'user';
  const userInitial = (
    userProfile?.name?.trim()?.charAt(0) ||
    user?.displayName?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    'U'
  ).toUpperCase();

  return (
    <>
      {/* Sleek dark background overlay/backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 z-[998] backdrop-blur-[2px] transition-opacity duration-300" 
        />
      )}

      {/* Drawer Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-[999] w-[285px] sm:w-[315px] max-w-[76vw] bg-[#F7FFF9] flex flex-col rounded-r-[28px] border-r border-emerald-100/80 shadow-2xl transition-transform duration-300 ease-out select-none overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pt-3.5 pb-8 space-y-2.5">
          
          {/* ========================================================================= */}
          {/* 1. PROFILE SECTION DESIGN (১. প্রোফাইল সেকশন ডিজাইন)                      */}
          {/* ========================================================================= */}
          {user ? (
            <div className="p-3 bg-white rounded-2xl border border-emerald-100/90 shadow-2xs space-y-2.5 relative">
              <div className="flex items-center gap-2.5">
                {/* Avatar with Online Green Dot */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-[#0B7A3B] flex items-center justify-center text-white text-base font-black shadow-xs border-2 border-white overflow-hidden">
                    {userProfile?.photoURL || user?.photoURL ? (
                      <img
                        src={userProfile?.photoURL || user?.photoURL || ''}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#0B7A3B] border-2 border-white rounded-full"></span>
                </div>

                {/* Name & Email */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-black text-slate-900 truncate leading-tight">
                    {userProfile?.name || user?.displayName || 'ronivai'}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                    {userProfile?.email || user?.email || userProfile?.phone || 'ronivai@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Role Pill & Logout (in marked area) */}
              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (role === 'super_admin') {
                      setIsRoleBottomSheetOpen(true);
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider transition-all shadow-2xs shrink-0 ${
                    role === 'super_admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 cursor-pointer'
                      : role === 'admin'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      : role === 'moderator'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : role === 'editor'
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-emerald-50 text-[#0B7A3B] border border-emerald-200'
                  }`}
                >
                  <User size={10} className="text-[#0B7A3B]" />
                  <span>
                    {role === 'super_admin'
                      ? 'সুপার অ্যাডমিন ▼'
                      : role === 'admin'
                      ? 'অ্যাডমিন'
                      : role === 'moderator'
                      ? 'মডারেটর'
                      : role === 'editor'
                      ? 'এডিটর'
                      : 'সাধারণ ইউজার'}
                  </span>
                </button>

                {/* Logout Button in the marked area */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-[#E11D2E] rounded-full text-[10px] font-black border border-rose-200 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                  title="লগআউট"
                >
                  <LogOut size={11} strokeWidth={2.5} />
                  <span>➔ লগআউট</span>
                </button>
              </div>

              {/* Admin Command Center Link (If Staff) */}
              {role !== 'user' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    const path =
                      role === 'super_admin'
                        ? '/super-admin'
                        : role === 'admin'
                        ? '/admin'
                        : role === 'editor'
                        ? '/editor'
                        : '/moderator';
                    onNavigate(path);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#0B7A3B] text-white rounded-xl text-[11px] font-black transition-all hover:bg-emerald-800 cursor-pointer shadow-xs shadow-[#0B7A3B]/20"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span>
                      {role === 'super_admin'
                        ? 'সুপার অ্যাডমিন ড্যাশবোর্ড'
                        : role === 'admin'
                        ? 'অ্যাডমিন প্যানেল'
                        : role === 'editor'
                        ? 'এডিটর প্যানেল'
                        : 'মডারেটর প্যানেল'}
                    </span>
                  </span>
                  <ChevronRight size={14} className="text-white" />
                </button>
              )}
            </div>
          ) : (
            /* Non-Logged In User Banner */
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 text-center space-y-2.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#0B7A3B] text-white flex items-center justify-center mx-auto shadow-xs">
                <User size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">লগইন করুন</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">সকল নাগরিক সেবা ও ড্যাশবোর্ড সুবিধার জন্য</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) {
                    onNavigate('/login');
                  } else {
                    navigate('/login');
                  }
                  window.dispatchEvent(new CustomEvent('open-auth-modal'));
                }}
                className="w-full py-2 bg-[#0B7A3B] hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogIn size={13} />
                <span>লগইন / রেজিস্টার</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. FAST ACTION BUTTONS (২. ফাস্ট অ্যাকশন বাটন - ৩টি কার্ড)                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* হোম বাটন (মার্ক করা স্থানে হোম সিস্টেম) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('home');
              }}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl text-center cursor-pointer transition-all shadow-2xs group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0B7A3B] group-hover:bg-[#0B7A3B] group-hover:text-white flex items-center justify-center transition-colors">
                <Home size={15} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0B7A3B] truncate w-full">
                হোম
              </span>
            </button>

            {/* কোর্স ও আয় / রেফার ও আয় */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/referral');
              }}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-xl text-center cursor-pointer transition-all shadow-2xs group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#E11D2E] group-hover:bg-[#E11D2E] group-hover:text-white flex items-center justify-center transition-colors">
                <Gift size={15} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#E11D2E] truncate w-full">
                কোর্স ও আয়
              </span>
            </button>

            {/* সেটিংস */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/settings');
              }}
              className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl text-center cursor-pointer transition-all shadow-2xs group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0B7A3B] group-hover:bg-[#0B7A3B] group-hover:text-white flex items-center justify-center transition-colors">
                <Settings size={15} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-700 group-hover:text-[#0B7A3B] truncate w-full">
                সেটিংস
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 4, 5, 6. ACTIVE MENU HIGHLIGHT, ICONS & BADGES, MODERN CARD DESIGN        */}
          {/* ========================================================================= */}
          <div className="space-y-1.5">
            {filteredMenuItems.map((item) => {
              const IconComponent = ICON_MAP[item.iconName] || Globe;
              const isCurrentActive = isItemActive(item);
              const subtitle = item.subtitle || DEFAULT_SUBTITLES[item.id] || 'সবার জন্য এক জায়গায় সব তথ্য';

              return (
                <motion.div 
                  key={item.id} 
                  className={`rounded-xl transition-all duration-200 border ${
                    isCurrentActive 
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 shadow-xs' 
                      : 'bg-white border-slate-100 hover:border-emerald-200 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <button 
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-2.5 p-2 group cursor-pointer text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isCurrentActive 
                        ? 'bg-[#0B7A3B] text-white shadow-xs' 
                        : 'bg-emerald-50 text-[#0B7A3B] group-hover:bg-[#0B7A3B] group-hover:text-white'
                    }`}>
                      <IconComponent size={17} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-black tracking-tight block truncate ${
                        isCurrentActive ? 'text-[#0B7A3B]' : 'text-slate-900 group-hover:text-slate-950'
                      }`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] block truncate mt-0.5 ${
                        isCurrentActive ? 'text-emerald-700/80 font-bold' : 'text-slate-400 font-medium'
                      }`}>
                        {subtitle}
                      </span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9.5px] font-black text-white px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs ${
                        item.badgeColor || 'bg-[#0B7A3B]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className={`shrink-0 transition-all group-hover:translate-x-0.5 ${
                      isCurrentActive ? 'text-[#0B7A3B]' : 'text-slate-300 group-hover:text-[#0B7A3B]'
                    }`} />
                  </button>
                </motion.div>
              );
            })}

            {filteredMenuItems.length === 0 && (
              <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">কোনো মেনু বা সেবা পাওয়া যায়নি</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-[#0B7A3B] hover:underline cursor-pointer"
                >
                  সব মেনু দেখুন
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 7. FOOTER SECTION (৭. সুন্দর ফুটার সেকশন)                                  */}
          {/* ========================================================================= */}
          <div className="mt-4 pt-4 pb-0 text-center rounded-3xl bg-white border border-slate-100 space-y-1 relative overflow-hidden shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#0B7A3B] flex items-center justify-center mx-auto mb-1">
              <Leaf size={16} />
            </div>
            <p className="text-[11px] font-bold text-slate-500 tracking-tight">
              © ২০২৬ আমাদের পুঠিয়া সর্বস্বত্ব সংরক্ষিত
            </p>
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
              JOSIM UDDIN
            </p>
            <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1 pt-0.5">
              <span>ভালোবাসি পুঠিয়া</span>
              <span className="text-red-500 inline-block">❤️</span>
            </p>

            {/* Bottom Bangladesh / Puthia Flag Dual Wave Ribbon (#0B7A3B & #E11D2E) */}
            <div className="w-full h-4 relative overflow-hidden mt-3">
              <svg viewBox="0 0 340 24" className="w-full h-full object-cover" preserveAspectRatio="none">
                <path d="M0,4 C110,22 230,-4 340,16 L340,24 L0,24 Z" fill="#0B7A3B" />
                <path d="M0,12 C130,26 210,6 340,22 L340,24 L0,24 Z" fill="#E11D2E" opacity="0.95" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Role Bottom Sheet for Super Admin */}
      <RoleBottomSheet
        isOpen={isRoleBottomSheetOpen}
        onClose={() => setIsRoleBottomSheetOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-4 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">লগআউট নিশ্চিতকরণ</h4>
              <p className="text-xs text-slate-500 mt-1">
                আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl bg-[#E11D2E] text-white text-xs font-black hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoggingOut ? "লগআউট হচ্ছে..." : "হ্যাঁ, লগআউট"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef, Suspense } from "react";
import { InstallAppButton } from '../InstallAppButton';
import {
  Bell,
  Search,
  Menu,
  MapPin,
  User,
  ChevronDown,
  X,
  Settings,
  LogOut,
  HelpCircle,
  Smartphone,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Wrench,
  ShieldAlert,
  Edit,
  Globe,
  UserCheck,
  Phone,
  Mail,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  MessageSquare,
  ChevronRight,
  Clock,
  Sparkles,
  Crown,
  Gift,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "../Sidebar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import defaultAppLogo from "../../assets/images/puthia_official_icon_logo.jpg";
import fullOfficialLogo from "../../assets/images/puthia_official_full_logo.jpg";
import { NotificationPanel } from "../user/NotificationPanel";
import { useFavorites } from "../FavoriteContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { AuthModal } from "../AuthModal";
import RoleBottomSheet from "./RoleBottomSheet";
import AdvancedGlobalSearchModal from "../common/AdvancedGlobalSearchModal";

interface HeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  onChatClick?: () => void;
  onSearchClick?: () => void;
  onSearch?: (query: string) => void;
  user?: any;
  customTitle?: string;
  showBackBtn?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onProfileClick,
  onNotificationClick,
  onChatClick,
  onSearchClick,
  onSearch,
  user: initialUser,
  customTitle,
  showBackBtn,
  onBackClick,
}) => {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const { bookmarks } = useFavorites();
  const { settings } = useSiteSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const { unreadCount: realUnreadCount } = useNotifications();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRoleBottomSheetOpen, setIsRoleBottomSheetOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const avatarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAvatarLongPressActive = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleOpenRoleSwitcher = () => {
      setIsRoleBottomSheetOpen(true);
    };
    window.addEventListener("open-role-switcher", handleOpenRoleSwitcher);
    return () => {
      window.removeEventListener("open-role-switcher", handleOpenRoleSwitcher);
    };
  }, []);

  const startAvatarLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "mousedown" && "ontouchstart" in window) {
      return;
    }
    if (avatarTimerRef.current) {
      clearTimeout(avatarTimerRef.current);
    }
    isAvatarLongPressActive.current = false;
    avatarTimerRef.current = setTimeout(() => {
      setIsRoleBottomSheetOpen(true);
      isAvatarLongPressActive.current = true;
    }, 600);
  };

  const endAvatarLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "mouseup" && "ontouchstart" in window) {
      return;
    }
    if (e.type === "mouseleave" && "ontouchstart" in window) {
      return;
    }
    if (avatarTimerRef.current) {
      clearTimeout(avatarTimerRef.current);
      avatarTimerRef.current = null;
    }
    if (isAvatarLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setInternalSidebarOpen(true);
    }
  };

  const toBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => {
      const parsed = parseInt(digit);
      return isNaN(parsed) ? digit : bengaliDigits[parsed];
    }).join('');
  };

  const handleProfileClick = () => {
    if (isAvatarLongPressActive.current) {
      isAvatarLongPressActive.current = false;
      return;
    }
    if (user) {
      setIsProfileOpen(!isProfileOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle === "আড্ডা" && onSearchClick) {
      onSearchClick();
      return;
    }
    if (onSearch) onSearch(searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full max-w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-md" 
          : "bg-white border-b border-slate-100 shadow-xs"
      }`}>
        <div className="max-w-7xl mx-auto px-1.5 sm:px-4 md:px-6 flex items-center justify-between gap-1 sm:gap-4 md:gap-6 min-w-0 transition-all duration-300 h-[60px] sm:h-20 md:h-28">
          {/* Left Section: Menu & Logo */}
          <div className="flex items-center gap-1 sm:gap-2.5 md:gap-4 min-w-0 flex-1">
            {showBackBtn ? (
              <button
                onClick={onBackClick || (() => navigate(-1))}
                className="w-8 h-8 sm:w-10 md:w-16 sm:h-10 md:h-16 hover:bg-slate-100 bg-transparent rounded-xl transition-colors flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 32 : 20} className="text-emerald-800" />
              </button>
            ) : (
              <button
                onClick={handleMenuClick}
                className="w-8 h-8 sm:w-10 md:w-16 sm:h-10 md:h-16 hover:bg-slate-100 bg-transparent rounded-xl transition-colors md:hidden flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Menu"
              >
                <Menu size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 32 : 20} className="text-emerald-800" />
              </button>
            )}

            <div
              className="flex items-center gap-2 sm:gap-4 cursor-pointer min-w-0"
              onClick={showBackBtn ? (onBackClick || (() => navigate(-1))) : (() => navigate("/"))}
            >
              {customTitle ? (
                customTitle === "আড্ডা" ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`rounded-xl bg-[#006a4e] flex items-center justify-center text-white font-black shrink-0 transition-all duration-300 shadow-md ${
                      isScrolled ? "w-7 h-7 text-xs" : "w-10 h-10 sm:w-14 md:w-20 sm:h-14 md:h-20 text-lg sm:text-2xl md:text-4xl"
                    }`}>
                      আ
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <h1 className={`font-black text-[#006a4e] tracking-tight leading-none transition-all duration-300 whitespace-nowrap ${
                        isScrolled ? "text-xs sm:text-lg md:text-2xl" : "text-lg sm:text-3xl md:text-5xl"
                      }`}>
                        আড্ডা
                      </h1>
                      <p className={`font-bold text-slate-400 tracking-tight transition-all duration-300 whitespace-nowrap ${
                        isScrolled ? "text-[0px] h-0 opacity-0 overflow-hidden mt-0" : "text-[9px] sm:text-sm md:text-2xl h-auto opacity-100 mt-0.5"
                      }`}>
                        PUTHIA SOCIAL HUB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 flex flex-col justify-center">
                    <h1 className={`font-black text-[#006a4e] tracking-tight leading-none transition-all duration-300 whitespace-nowrap ${
                      isScrolled ? "text-sm sm:text-xl md:text-3xl" : "text-lg sm:text-2xl md:text-5xl"
                    }`}>
                      {customTitle}
                    </h1>
                    <p className={`font-bold text-slate-500 tracking-tight transition-all duration-300 whitespace-nowrap ${
                      isScrolled ? "text-[0px] h-0 opacity-0 overflow-hidden mt-0" : "text-[10px] sm:text-sm md:text-2xl h-auto opacity-100 mt-0.5"
                    }`}>
                      নাগরিক মতামত ও আলোচনা
                    </p>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 py-0.5">
                  <div className={`rounded-full overflow-hidden border-2 border-emerald-600/90 shadow-sm flex items-center justify-center bg-white shrink-0 p-0.5 transition-all duration-300 ${
                    isScrolled ? "w-8 h-8 sm:w-11 sm:h-11" : "w-11 h-11 sm:w-14 sm:h-14 md:w-20 md:h-20"
                  }`}>
                    <img 
                      src={settings?.siteLogoUrl || defaultAppLogo} 
                      alt="আমাদের পুঠিয়া লোগো" 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-baseline gap-1 leading-none">
                      <span className={`font-black text-[#006a4e] tracking-tight transition-all duration-300 ${
                        isScrolled ? "text-base sm:text-xl md:text-4xl" : "text-xl sm:text-2xl md:text-5xl"
                      }`}>
                        আমাদের
                      </span>
                      <span className={`font-black text-[#d32f2f] tracking-tight relative transition-all duration-300 ${
                        isScrolled ? "text-base sm:text-xl md:text-4xl" : "text-xl sm:text-2xl md:text-5xl"
                      }`}>
                        পুঠিয়া
                        <span className="inline-block text-emerald-600 ml-0.5 text-xs sm:text-base md:text-xl -translate-y-1 sm:-translate-y-1.5 font-bold">🌿</span>
                      </span>
                    </div>
                    <p className={`font-bold text-[#006a4e]/90 tracking-tight transition-all duration-300 whitespace-nowrap ${
                      isScrolled ? "text-[0px] h-0 opacity-0 overflow-hidden mt-0" : "text-[9.5px] sm:text-xs md:text-xl h-auto opacity-100 mt-0.5 sm:mt-1 font-semibold"
                    }`}>
                      — তথ্য ও সেবা এখন হাতের মুঠোয় —
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Section: Search Bar (Desktop) */}
          {!isScrolled && (
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xl relative animate-fade-in"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={32} className={customTitle === "আড্ডা" ? "text-[#006a4e]" : "text-slate-400"} />
              </div>
              <input
                type="text"
                placeholder={customTitle === "আড্ডা" ? "🔍 আড্ডায় খুঁজুন... (মানুষ, পেজ, গ্রুপ, পোস্ট, রিলস)" : "আপনি কি খুঁজছেন? (যেমন: হাসপাতাল, স্কুল, দোকান...)"}
                className={`w-full pl-14 pr-6 py-6 bg-slate-50 border rounded-full text-xs md:text-2xl font-bold focus:bg-white focus:ring-4 transition-all outline-none text-slate-800 ${
                  customTitle === "আড্ডা"
                    ? "border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-600 placeholder:text-emerald-700/60"
                    : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                }`}
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => {
                  if (customTitle === "আড্ডা" && onSearchClick) {
                    onSearchClick();
                  }
                }}
              />
            </form>
          )}

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1">
            {/* Search Icon Button */}
            <button
              onClick={() => {
                if (onSearchClick) {
                  onSearchClick();
                } else {
                  setIsSearchOpen(true);
                }
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer border bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80 ${
                customTitle === "আড্ডা"
                  ? "flex"
                  : (isScrolled ? "flex" : "flex md:hidden")
              }`}
              aria-label="Search"
            >
              <Search size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 16} className="text-emerald-800" />
            </button>

            {customTitle === "আড্ডা" ? (
              /* Custom Messenger icon for Adda page - Replacing Bell and Profile as requested */
              <div className="relative">
                <button
                  onClick={() => {
                    if (onChatClick) {
                      onChatClick();
                    } else {
                      navigate("/messages");
                    }
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors relative flex items-center justify-center shrink-0 cursor-pointer border border-emerald-200/80"
                  aria-label="Messages"
                >
                  <MessageSquare size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 16} className="text-emerald-700" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 bg-rose-600 text-white text-[8px] sm:text-[10px] md:text-base font-black rounded-full border-2 border-white flex items-center justify-center shadow-xs animate-bounce">
                    ৩
                  </span>
                </button>
              </div>
            ) : (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifPanelOpen(!isNotifPanelOpen)}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors relative flex items-center justify-center shrink-0 cursor-pointer border border-emerald-200/80"
                    aria-label="Notifications"
                  >
                    <Bell size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 16} className="text-emerald-800" />
                    {realUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 bg-rose-600 text-white text-[8px] sm:text-[10px] md:text-base font-black rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                        {realUnreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white p-4 flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-700" />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search
                  size={22}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="এখানে খুঁজুন..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-[20px] text-xs font-semibold placeholder:text-[11px] placeholder:font-normal outline-none"
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                জনপ্রিয় অনুসন্ধান
              </p>
              <div className="flex flex-wrap gap-2">
                {["হাসপাতাল", "বাসের সময়সূচী", "রক্তদান", "খ খবর", "চাকরি"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        if (onSearch) onSearch(tag);
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 rounded-full text-xs font-bold border border-gray-100 transition-colors"
                    >
                      {tag}
                    </button>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Center Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-md p-6 relative overflow-hidden border border-gray-100 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <HelpCircle size={20} className="text-emerald-600 animate-pulse" />
                  সাহায্য কেন্দ্র (Help Center)
                </h3>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto text-slate-600 text-sm leading-relaxed pr-1">
                <p className="font-bold text-emerald-700 text-sm">
                  আমাদের পুঠিয়া ডিজিটাল সেবা কেন্দ্রে আপনাকে স্বাগতম!
                </p>

                {/* FAQ section */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-emerald-50 pb-1 text-emerald-800">
                    সাধারণ জিজ্ঞাসা (FAQ)
                  </h4>

                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      কিভাবে আমাদের ব্যবসা বা সেবা যুক্ত করব?
                    </p>
                    <p className="text-xs text-slate-500 pl-3">
                      আপনার প্রোফাইল থেকে 'ড্যাশবোর্ড'-এ যান। তারপর 'আমার ব্যবসা' বা 'আমার সেবা' ক্যাটাগরিতে গিয়ে 'নতুন যুক্ত করুন' বাটনে ক্লিক করে ফর্মটি সাবমিট করুন।
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      জরুরী রক্ত প্রয়োজন হলে কি করব?
                    </p>
                    <p className="text-xs text-slate-500 pl-3">
                      আমাদের 'রক্তদাতা নেটওয়ার্ক' পেজে গিয়ে প্রয়োজনীয় রক্তদাতা খুঁজে সরাসরি কল দিতে পারেন অথবা 'রক্তের অনুরোধ' অপশনে গিয়ে তাত্ক্ষণিক পোস্ট করতে পারেন।
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      কোনো ভুল তথ্য বা সমস্যার অভিযোগ জানাব কিভাবে?
                    </p>
                    <p className="text-xs text-slate-500 pl-3">
                      পোর্টালে কোনো ভুল তথ্য দেখলে সরাসরি অভিযোগ বক্সে গিয়ে আমাদের জানাতে পারেন। অ্যাডমিন প্যানেল তথ্য যাচাই করে দ্রুত সংশোধন করবে।
                    </p>
                  </div>
                </div>

                {/* Support contact info */}
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60 space-y-3.5">
                  <h4 className="font-extrabold text-emerald-800 text-xs uppercase tracking-wider">
                    সরাসরি যোগাযোগ করুন
                  </h4>
                  
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">হটলাইন নম্বর</p>
                      <a href={`tel:${settings?.contactPhone || '01711223344'}`} className="text-sm font-extrabold text-[#15803d] hover:underline">
                        {settings?.contactPhone || '01711-223344'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">ইমেইল ঠিকানা</p>
                      <a href={`mailto:${settings?.contactEmail || 'info@amaderputhia.com'}`} className="text-sm font-extrabold text-[#15803d] hover:underline">
                        {settings?.contactEmail || 'info@amaderputhia.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-3 bg-[#15803d] hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider rounded-2xl cursor-pointer shadow-md transition-all text-center"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={onMenuClick ? false : internalSidebarOpen} 
        onClose={() => setInternalSidebarOpen(false)} 
        onNavigate={(path) => {
          setInternalSidebarOpen(false);
          if (path === 'home') {
            navigate('/');
          } else if (path.startsWith('/')) {
            navigate(path);
          } else {
            navigate(`/${path}`);
          }
        }}
      />

      <Suspense fallback={null}>
        <RoleBottomSheet 
          isOpen={isRoleBottomSheetOpen} 
          onClose={() => setIsRoleBottomSheetOpen(false)} 
        />
      </Suspense>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <AdvancedGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 max-w-[320px] w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="animate-pulse" />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-2">
                লগআউট নিশ্চিতকরণ
              </h3>
              <p className="text-sm font-bold text-slate-600 mb-6">
                লগআউট করতে চান?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 font-extrabold text-xs rounded-xl border border-gray-100 transition-all cursor-pointer"
                >
                  না
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

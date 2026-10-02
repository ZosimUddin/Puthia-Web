import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  ChevronRight, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Pin, 
  Info 
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { subscribeNoticeItems } from "../../services/noticeService";
import { NoticeItem } from "../../types";

const DEFAULT_NOTICES = [
  "পুঠিয়া উপজেলায় উন্নয়নের ধারা অব্যাহত রাখতে সবাইকে একসাথে কাজ করতে হবে।",
  "৫ বছর বয়স পর্যন্ত শিশুদের পোলিও টিকাদান ক্যাম্পেইন চলছে। নিকটস্থ কেন্দ্রে টিকা দিন।",
  "জরুরি অ্যাম্বুলেন্স, ফায়ার সার্ভিস ও পুলিশ সেবার অফিশিয়াল হটলাইন নম্বর অ্যাপে যুক্ত।"
];

export const NoticeTickerBar: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isNoticePaused, setIsNoticePaused] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNoticeItems((data) => {
      setNotices(data);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  // Check if ticker is disabled by Super Admin
  if (settings?.showNoticeTicker === false) {
    return null;
  }

  // Filter only active notices
  const activeNotices = notices.filter(n => n.isActive !== false && (!n.status || n.status === 'published'));

  const activeNoticeTexts = activeNotices.length > 0
    ? activeNotices.map(n => n.text || n.title || '')
    : DEFAULT_NOTICES;

  if (activeNoticeTexts.length === 0) {
    return null;
  }

  // Render badge icon dynamically
  const renderBadgeIcon = () => {
    const iconName = settings?.noticeTickerBadgeIcon || "Megaphone";
    const iconProps = { size: typeof window !== 'undefined' && window.innerWidth >= 768 ? 24 : 14, className: "shrink-0" };

    switch (iconName) {
      case "Bell":
        return <Bell {...iconProps} />;
      case "AlertTriangle":
        return <AlertTriangle {...iconProps} />;
      case "Sparkles":
        return <Sparkles {...iconProps} />;
      case "Flame":
        return <Flame {...iconProps} />;
      case "Pin":
        return <Pin {...iconProps} />;
      case "Info":
        return <Info {...iconProps} />;
      case "Megaphone":
      default:
        return <Megaphone {...iconProps} />;
    }
  };

  // Color theme styles
  const colorTheme = settings?.noticeTickerBadgeColor || 'emerald';
  const getThemeStyles = () => {
    switch (colorTheme) {
      case 'rose':
        return {
          container: "bg-rose-50/90 border-y border-rose-100/80",
          badge: "bg-rose-100 text-rose-800 border-rose-200/60",
          iconColor: "text-rose-700",
          textColor: "text-slate-800"
        };
      case 'amber':
        return {
          container: "bg-amber-50/90 border-y border-amber-100/80",
          badge: "bg-amber-100 text-amber-800 border-amber-200/60",
          iconColor: "text-amber-700",
          textColor: "text-slate-800"
        };
      case 'blue':
        return {
          container: "bg-sky-50/90 border-y border-sky-100/80",
          badge: "bg-sky-100 text-sky-800 border-sky-200/60",
          iconColor: "text-sky-700",
          textColor: "text-slate-800"
        };
      case 'purple':
        return {
          container: "bg-purple-50/90 border-y border-purple-100/80",
          badge: "bg-purple-100 text-purple-800 border-purple-200/60",
          iconColor: "text-purple-700",
          textColor: "text-slate-800"
        };
      case 'slate':
        return {
          container: "bg-slate-100/90 border-y border-slate-200/80",
          badge: "bg-slate-200 text-slate-800 border-slate-300/60",
          iconColor: "text-slate-700",
          textColor: "text-slate-800"
        };
      case 'emerald':
      default:
        return {
          container: "bg-emerald-50/90 border-y border-emerald-100/80",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200/60",
          iconColor: "text-emerald-700",
          textColor: "text-slate-800"
        };
    }
  };

  const theme = getThemeStyles();
  const badgeLabel = settings?.noticeTickerBadgeText || "নোটিশ";
  const destination = settings?.noticeTickerDestination || "/notice";
  const pauseOnHover = settings?.noticeTickerPauseOnHover !== false;

  // Animation duration calculation
  const totalLength = activeNoticeTexts.join("").length;
  const speedSetting = settings?.noticeTickerSpeed;
  const animationDuration = speedSetting 
    ? `${speedSetting}s` 
    : `${Math.max(12, Math.floor(totalLength * 0.08))}s`;

  const handleBarClick = () => {
    if (destination.startsWith("http")) {
      window.open(destination, "_blank", "noopener,noreferrer");
    } else {
      navigate(destination);
    }
  };

  return (
    <div className="w-full pt-0.5 pb-0.5" id="home-notice-ticker-bar">
      <div 
        className={`${theme.container} py-2 md:py-5 px-3 sm:px-6 rounded-none flex items-center gap-2 md:gap-6 overflow-hidden select-none cursor-pointer shadow-2xs w-full transition-colors`}
        onClick={handleBarClick}
        onMouseEnter={() => pauseOnHover && setIsNoticePaused(true)}
        onMouseLeave={() => pauseOnHover && setIsNoticePaused(false)}
        onTouchStart={() => pauseOnHover && setIsNoticePaused(true)}
        onTouchEnd={() => pauseOnHover && setIsNoticePaused(false)}
        role="region"
        aria-label="জরুরি নোটিশ স্ক্রলার"
      >
        {/* Left Tag with subtle animation */}
          <motion.div 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.35 }}
            className={`flex items-center gap-1.5 md:gap-3 ${theme.badge} px-3.5 py-1.5 md:px-8 md:py-4 rounded-full text-xs md:text-3xl font-black shrink-0 border shadow-2xs`}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
              className={theme.iconColor}
            >
              {renderBadgeIcon()}
            </motion.div>
            <span>{badgeLabel}</span>
          </motion.div>

          {/* Continuous Marquee Ticker */}
          <div className="overflow-hidden relative flex-1 flex items-center h-5 md:h-16">
            <div 
              className="animate-marquee flex whitespace-nowrap w-max gap-8 md:gap-20 text-xs md:text-4xl font-bold text-slate-800 items-center"
              style={{ 
                animationPlayState: isNoticePaused ? "paused" : "running",
                animationDuration
              }}
            >
            {activeNoticeTexts.map((text, i) => (
              <span key={i} className="inline-flex items-center gap-2 md:gap-6">
                <span>{text}</span>
                {i < activeNoticeTexts.length - 1 && (
                  <span className="text-slate-300 font-normal select-none">●</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight size={typeof window !== 'undefined' && window.innerWidth >= 768 ? 32 : 18} className="text-slate-400 shrink-0 hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
};

export default NoticeTickerBar;

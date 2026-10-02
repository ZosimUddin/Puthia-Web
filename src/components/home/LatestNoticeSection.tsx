import React, { useState, useEffect } from "react";
import { FileText, Bell, Calendar, ArrowUpRight } from "lucide-react";
import { onNoticesSnapshot } from "../../api";
import { NoticeItem } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import Skeleton from "./Skeleton";

const LatestNoticeSection: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onNoticesSnapshot((data) => {
      setNotices(data.filter(n => n.isActive).slice(0, 5));
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, []);

  useEffect(() => {
    if (notices.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [notices.length, isPaused]);

  useEffect(() => {
    return () => {
      if (touchTimeout) clearTimeout(touchTimeout);
    };
  }, [touchTimeout]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    setIsPaused(true);
    if (touchTimeout) clearTimeout(touchTimeout);
    
    const timeout = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
    setTouchTimeout(timeout);
  };

  if (loading) return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="bg-white p-4 rounded-[20px] border border-emerald-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-[12px] flex-shrink-0" />
        <Skeleton className="h-6 flex-grow rounded-full" />
        <Skeleton className="w-8 h-8 rounded-[12px] flex-shrink-0" />
      </div>
    </section>
  );

  if (notices.length === 0) return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="bg-white p-4 rounded-[20px] border border-emerald-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
        <div className="flex-shrink-0 p-2 bg-emerald-50 text-emerald-600 rounded-[12px]">
          <Bell size={18} />
        </div>
        <p className="text-sm font-bold text-slate-400">বর্তমানে কোনো নোটিশ নেই।</p>
      </div>
    </section>
  );

  const activeNotice = notices[currentIndex];
  const isNew = activeNotice ? new Date(activeNotice.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 : false;

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full overflow-hidden">
      <div 
        onClick={() => navigate("/notice")}
        className="bg-white p-4 rounded-[20px] border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-4px_rgba(5,150,105,0.08)] hover:border-emerald-200/50 transition-all duration-300 flex items-center gap-4 group cursor-pointer"
      >
        <div className="w-10 h-10 flex-shrink-0 bg-emerald-600 text-white rounded-[12px] shadow-lg shadow-emerald-100 flex items-center justify-center">
          <Bell size={18} className="animate-bounce" />
        </div>
        <div className="flex-shrink-0 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100 hidden sm:block">
          নোটিশ বোর্ড
        </div>
        
        <div 
          className="flex-grow overflow-hidden relative h-6 flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
          <AnimatePresence mode="wait">
            {activeNotice && (
              <motion.div
                key={activeNotice.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="absolute w-full flex items-center gap-3 cursor-pointer group/item truncate"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  {activeNotice.isPinned && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-md shrink-0">জরুরি</span>
                  )}
                  {isNew && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md shrink-0">নতুন</span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-700 group-hover/item:text-emerald-600 transition-colors tracking-tight truncate">
                  {activeNotice.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => navigate("/notice")}
          className="flex-shrink-0 p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default LatestNoticeSection;

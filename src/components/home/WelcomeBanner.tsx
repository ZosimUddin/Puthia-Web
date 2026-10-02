import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WELCOME_BANNER_KEY = 'puthia_welcome_banner_dismissed_v1';

export const WelcomeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isDismissed = localStorage.getItem(WELCOME_BANNER_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_BANNER_KEY, 'true');
    setIsVisible(false);
  };

  const handleExplore = () => {
    localStorage.setItem(WELCOME_BANNER_KEY, 'true');
    setIsVisible(false);
    navigate('/services');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: -15 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden px-4 pt-3 pb-1 max-w-7xl mx-auto"
        >
          <div className="relative bg-white text-slate-800 rounded-[24px] p-5 sm:p-6 shadow-xl shadow-emerald-900/5 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            
            {/* Background Decorative Blur */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Left Content */}
            <div className="flex items-start gap-4 z-10 max-w-2xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                <span className="text-2xl sm:text-3xl animate-bounce">👋</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100/50 border border-emerald-200/50 rounded-full text-[10px] font-black text-emerald-800 tracking-wider uppercase">
                    Welcome
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Sparkles size={12} /> স্মার্ট ডিজিটাল হাব
                  </span>
                </div>
                <h3 className="text-lg md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                  আমাদের পুঠিয়ায় স্বাগতম
                </h3>
                <p className="text-xs md:text-4xl text-slate-500 font-bold leading-relaxed mt-2.5 max-w-lg md:max-w-6xl">
                  পুঠিয়া উপজেলার সকল নাগরিক সেবা, জরুরি যোগাযোগ, রক্তদাতা ডিরেক্টরি ও সংবাদ এখন আপনার হাতের মুঠোয়।
                </p>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end z-10 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <button
                onClick={handleExplore}
                className="flex-1 sm:flex-none px-6 py-3 md:px-14 md:py-7 bg-[#006a4e] hover:bg-[#00543e] text-white font-black text-xs sm:text-sm md:text-4xl rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <span>সেবাসমূহ দেখুন</span>
                <ArrowRight size={16} className="md:w-10 md:h-10" />
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded-2xl transition-all"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBanner;

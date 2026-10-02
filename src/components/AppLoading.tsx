import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const AppLoading: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate premium smooth loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + step, 100);
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Map progress to Bangla numerals for an authentic, premium touch
  const toBanglaNumber = (n: number) => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return n.toString().split('').map(digit => banglaDigits[parseInt(digit)] || digit).join('');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#f9fafb] to-[#f3fbf7] flex flex-col items-center justify-center overflow-hidden font-sans select-none px-6">
      {/* Background elegant radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative clean borders for framing */}
      <div className="absolute inset-4 border border-emerald-500/5 rounded-[24px] pointer-events-none" />
      <div className="absolute inset-6 border border-emerald-500/[0.02] rounded-[20px] pointer-events-none" />

      {/* Top developer signature */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 whitespace-nowrap"
      >
        <span className="h-[1px] w-4 bg-emerald-600/20" />
        <span className="text-[11px] font-bold text-emerald-800/75 tracking-wide">
          ডেভেলপমেন্ট বাই জসিম উদ্দিন
        </span>
        <span className="h-[1px] w-4 bg-emerald-600/20" />
      </motion.div>

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center text-center">
        {/* Sleek Minimalist Emblem */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          {/* Pulsing outer accent ring */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-3 rounded-full border border-emerald-500/20"
          />
          
          {/* Rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1.5 rounded-full border-2 border-dashed border-emerald-500/10"
          />

          {/* Central circular icon holder */}
          <div className="w-20 h-20 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.06)] relative">
            <span className="text-3xl filter drop-shadow-sm select-none">🏛️</span>
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-2xl md:text-3xl font-extrabold text-[#115e3b] font-sans tracking-tight mb-2 select-none"
        >
          আমাদের পুঠিয়া
        </motion.h1>

        {/* Refined Subtitle */}
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-slate-500 font-medium text-xs md:text-sm tracking-wide mb-8 max-w-[280px]"
        >
          পুঠিয়ার ডিজিটাল নাগরিক সেবা ও তথ্য প্ল্যাটফর্ম
        </motion.p>

        {/* Minimal Progress Container */}
        <div className="w-full max-w-[240px] flex flex-col items-center">
          {/* Progress Bar */}
          <div className="w-full bg-emerald-100/40 rounded-full h-1.5 overflow-hidden p-0 mb-3 border border-emerald-200/20">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-600 to-[#10b981] rounded-full shadow-xs"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </div>

          {/* Loading status & percentage */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50/60 border border-emerald-100 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="tracking-wide">লোড হচ্ছে...</span>
            <span className="font-mono font-bold">({toBanglaNumber(progress)}%)</span>
          </div>
        </div>
      </div>

      {/* Subtle, beautiful minimalist signature */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-emerald-800/60 uppercase tracking-widest"
      >
        PUTHIA PORTAL • 2026
      </motion.div>
    </div>
  );
};

export default AppLoading;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0F1C15] z-[9999] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative Traditional Border Patterns */}
      <div className="absolute top-4 left-4 right-4 bottom-4 border border-emerald-900/30 rounded-[24px] pointer-events-none" />
      <div className="absolute top-6 left-6 right-6 bottom-6 border border-emerald-500/10 rounded-[20px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        {/* Animated Temple/Fort Emblem Wrapper */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Outer glowing ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-500/30 absolute -inset-2"
          />
          
          <div className="w-24 h-24 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.15)] relative">
            <span className="text-4xl filter drop-shadow-md">🏛️</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl md:text-3xl font-black text-white font-sans tracking-tight mb-2 uppercase"
        >
          Puthia Portal
        </motion.h1>

        {/* Subtitle in Bangla */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-emerald-400 font-bold text-sm tracking-wide mb-8 bg-emerald-950/40 px-4 py-1.5 rounded-full border border-emerald-800/20"
        >
          ঐতিহাসিক পুঠিয়া উপজেলা পোর্টাল
        </motion.p>

        {/* Progress Bar & Percentage */}
        <div className="w-64 bg-neutral-900/80 border border-emerald-950/60 rounded-full h-2.5 overflow-hidden p-0.5 mb-3 relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-emerald-500/80 font-mono font-bold flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          তথ্য ও ঐতিহ্য লোড হচ্ছে • {progress}%
        </motion.div>
      </div>
    </div>
  );
};

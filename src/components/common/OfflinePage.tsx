import React from "react";
import { motion } from "motion/react";
import { WifiOff, RefreshCw } from "lucide-react";

const OfflinePage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
      <div className="max-w-xs w-full text-center">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-100"
        >
          <WifiOff size={48} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-slate-800 mb-2"
        >
          অফলাইন আছেন
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 mb-8"
        >
          আপনার ইন্টারনেট সংযোগ নেই। দয়া করে সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleReload}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
        >
          <RefreshCw size={20} />
          আবার চেষ্টা করুন
        </motion.button>
      </div>
    </div>
  );
};

export default OfflinePage;

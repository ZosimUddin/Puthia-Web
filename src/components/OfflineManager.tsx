import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, AlertTriangle, RefreshCw, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineManager({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setIsMinimized(false);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setHasBeenOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      const btn = document.getElementById('offline-retry-btn');
      if (btn) {
        btn.classList.add('animate-spin');
        setTimeout(() => btn.classList.remove('animate-spin'), 1000);
      }
    }
  };

  return (
    <>
      {/* Top Banner Alert System for Offline Mode */}
      <div className="relative z-[9990]">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-lg sticky top-0 left-0 right-0 z-[9999]"
            >
              {!isMinimized ? (
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    {/* Main Alert Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl shrink-0 mt-0.5 sm:mt-0 animate-pulse">
                        <WifiOff className="w-5 h-5 text-amber-200" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm tracking-wide flex items-center gap-1.5">
                            ⚠️ অফলাইন মোড সক্রিয় (Offline Mode Active)
                          </span>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-amber-100 border border-white/10">
                            সীমিত সুবিধাসমূহ
                          </span>
                        </div>
                        <p className="text-xs text-amber-100/90 leading-relaxed max-w-3xl">
                          আপনার ডিভাইসটি বর্তমানে ইন্টারনেটের সাথে যুক্ত নেই। পূর্বে সেভকৃত ও ক্যাশড পেজসমূহ দেখা যাবে, তবে অনলাইন ডাটা সিঙ্ক ও লাইভ সেবা সীমিত হতে পারে।
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-white/15"
                        title="সীমিত সুবিধাসমূহ দেখুন"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">বিস্তারিত</span>
                        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={handleRetry}
                        className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-50 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <RefreshCw id="offline-retry-btn" className="w-3.5 h-3.5 text-amber-700" />
                        <span>পুনরায় চেষ্টা</span>
                      </button>

                      <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 text-amber-100 rounded-xl transition-all"
                        title="সংক্ষিপ্ত করুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-white/20 text-xs text-amber-50 space-y-2"
                      >
                        <p className="font-black text-white flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-300" /> অফলাইন মোডে সীমাবদ্ধতাসমূহ:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-medium text-amber-100">
                          <li className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                            ❌ নতুন তথ্য বা সেবা আবেদন জমা
                          </li>
                          <li className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                            ❌ লাইভ নোটিফিকেশন ও বার্তা
                          </li>
                          <li className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                            ❌ রিয়েল-টাইম ট্রেন ও বাস সিঙ্ক
                          </li>
                        </ul>
                        <p className="text-[10px] text-amber-200/80 italic">
                          💡 টিপস: ইন্টারনেট সংযোগ ফিরে আসলে স্বয়ংক্রিয়ভাবে স্বাভাবিক মোডে ফিরে যাবে।
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Minimized Floating Bar */
                <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                    <span>⚡ অফলাইন মোড (সীমিত সুবিধাসমূহ)</span>
                  </div>
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="text-amber-200 hover:text-white underline text-[11px] font-black"
                  >
                    বিস্তারিত দেখুন
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Connection Restored Success Alert */}
          {isOnline && showRestored && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="bg-emerald-600 text-white shadow-md sticky top-0 left-0 right-0 z-[9999]"
            >
              <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Wifi className="w-4 h-4 text-emerald-100" />
                  </div>
                  <span>✅ ইন্টারনেট সংযোগ পুনঃস্থাপিত হয়েছে! সম্পূর্ণ সুবিধা পুনরায় চালু রয়েছে।</span>
                </div>
                <button
                  onClick={() => setShowRestored(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-emerald-100" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render children so the app remains navigable offline */}
      {children}
    </>
  );
}


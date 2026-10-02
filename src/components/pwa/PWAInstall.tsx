import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after a short delay or user interaction
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-32 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[100] bg-emerald-950 text-white rounded-3xl shadow-2xl p-6 border border-emerald-800/50"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-800 rounded-2xl shrink-0 text-emerald-400">
              <Smartphone size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-black mb-1">হোম স্ক্রিনে যুক্ত করুন</h3>
              <p className="text-[10px] font-bold text-emerald-300 leading-relaxed mb-4">
                আমাদের পুঠিয়া অ্যাপটি মোবাইলে ইনস্টল করে যেকোনো সময় দ্রুত সেবা নিন।
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  ইন্সটল করুন
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-2 bg-emerald-900 hover:bg-emerald-800 text-emerald-400 rounded-xl transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstall;

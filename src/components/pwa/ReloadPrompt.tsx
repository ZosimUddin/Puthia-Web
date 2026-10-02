import React, { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SiteReloading from '../SiteReloading';

const isDev = 
  typeof window !== 'undefined' && (
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1') || 
    window.location.hostname.includes('ais-dev') || 
    window.location.hostname.includes('ais-pre') ||
    window.location.hostname.includes('webcontainer') ||
    window.location.hostname.includes('google.com')
  );

const ReloadPrompt: React.FC = () => {
  // If in preview or dev mode, do not register SW or show prompt
  if (isDev) {
    return null;
  }

  return <ActiveReloadPrompt />;
};

const ActiveReloadPrompt: React.FC = () => {
  const [isReloading, setIsReloading] = useState(false);
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    setIsReloading(true);
    setTimeout(() => {
      updateServiceWorker(true);
    }, 4000);
  };

  if (isReloading) {
    return <SiteReloading />;
  }

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100] bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${needRefresh ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {needRefresh ? <RefreshCw className="animate-spin" size={24} /> : <Download size={24} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-emerald-950 mb-1">
                {offlineReady ? 'অফলাইন সেবা প্রস্তুত!' : 'নতুন আপডেট পাওয়া গেছে!'}
              </h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-4">
                {offlineReady 
                  ? 'আমাদের পুঠিয়া এখন অফলাইনেও ব্যবহার করা যাবে।' 
                  : 'অ্যাপটির একটি নতুন সংস্করণ পাওয়া গেছে। আপডেট করতে নিচের বাটনে ক্লিক করুন।'}
              </p>
              
              <div className="flex items-center gap-3">
                {needRefresh && (
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    আপডেট করুন
                  </button>
                )}
                <button
                  onClick={close}
                  className="px-4 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 flex items-center gap-2"
                >
                  {needRefresh ? 'পরে' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>

            <button 
              onClick={close}
              className="text-gray-300 hover:text-gray-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReloadPrompt;

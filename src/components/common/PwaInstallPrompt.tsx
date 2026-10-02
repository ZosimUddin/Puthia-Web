import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, ShieldAlert } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99990] bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-800 text-emerald-300 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl border border-emerald-600">
          📱
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-100">অ্যাপ হিসেবে ইন্সটল করুন</h4>
          <p className="text-[10px] text-slate-300 font-bold leading-tight">
            হোমসক্রিনে অ্যাপ যুক্ত করে অফলাইনেও দ্রুত ব্রাউজ করুন
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
        >
          <Download size={14} /> ইন্সটল
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

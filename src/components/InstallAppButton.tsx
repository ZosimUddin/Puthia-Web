import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
    >
      <Download size={16} /> অ্যাপটি ইনস্টল করুন
    </button>
  );
};

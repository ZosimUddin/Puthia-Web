import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Settings, RefreshCw, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService } from '../../services/notificationService';

export const SystemNotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [showUnblockGuide, setShowUnblockGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (permission === 'granted' || dismissed) {
    return null;
  }

  const handleRequestPermission = async () => {
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        toast.success('🎉 ফোনের সিস্টেম নোটিফিকেশন চালু করা হয়েছে!');
        
        await notificationService.triggerBrowserPushNotification('আমাদের পুঠিয়া - নোটিফিকেশন সক্রিয়!', {
          body: 'মেসেজ, বন্ধুত্বের অনুরোধ ও কলের নোটিফিকেশন এখন থেকে আপনার ফোনের নোটিফিকেশন বারে ছবিসহ দেখাবে।',
          icon: '/pwa-192x192.png',
          url: '/notifications'
        });
      } else if (res === 'denied') {
        setShowUnblockGuide(true);
      }
    } catch (err) {
      console.error(err);
      setShowUnblockGuide(true);
    }
  };

  const isDenied = permission === 'denied';

  return (
    <>
      <div className={`px-4 py-3 shadow-md border-b transition-all ${
        isDenied 
          ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white border-rose-500/30' 
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/30'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-3 text-left w-full sm:w-auto">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isDenied ? 'bg-amber-100 text-amber-900' : 'bg-white/20 text-white'
            }`}>
              {isDenied ? (
                <AlertTriangle size={20} className="text-amber-800 animate-pulse" />
              ) : (
                <Bell size={20} className="text-white animate-bounce" />
              )}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-white">
                {isDenied ? (
                  <>
                    <AlertTriangle size={16} className="text-amber-200" />
                    ব্রাউজারে নোটিফিকেশন ব্লক (Blocked) করা রয়েছে
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-emerald-200" />
                    ফোনের সিস্টেম নোটিফিকেশন চালু করুন
                  </>
                )}
              </h4>
              <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 leading-snug">
                {isDenied ? (
                  'নোটিফিকেশন পারমিশন ডিসঅ্যাবল রয়েছে। আপনার ফোনের ব্রাউজার সেটিং থেকে Allow না করা পর্যন্ত মেসেজ ও কলের পপ-আপ আসবে না।'
                ) : (
                  'মেসেজ, বন্ধুত্বের অনুরোধ ও কলের নোটিফিকেশন আপনার ফোনের ডিসপ্লে ও স্ট্যাটাসবারে ছবিসহ পেতে অনুমতি দিন।'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              পরে
            </button>
            {isDenied ? (
              <button
                onClick={() => setShowUnblockGuide(true)}
                className="px-4 py-1.5 text-xs font-bold bg-white text-rose-800 rounded-lg shadow hover:bg-rose-50 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Settings size={15} className="text-rose-600" />
                কীভাবে আনব্লক করবেন?
              </button>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-1.5 text-xs font-bold bg-white text-emerald-800 rounded-lg shadow hover:bg-emerald-50 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 size={15} className="text-emerald-600" />
                অনুমোদন দিন (Allow)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unblock Instructions Modal for Chrome / Android */}
      {showUnblockGuide && (
        <div className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-slate-800 relative">
            <button
              onClick={() => setShowUnblockGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border-0 bg-transparent cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Lock size={22} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  কীভাবে নোটিফিকেশন আনব্লক করবেন?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  মোবাইল ক্রোম (Chrome) ব্রাউজারের সহজ ৪টি ধাপ
                </p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs font-medium text-slate-700">
              {/* Special Note for AI Studio Preview Frame */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-snug">
                <strong>💡 গুরুত্বপূর্ণ টিপস (গুগল আই স্টুডিও প্রিভিউ ব্যবহারকারীদের জন্য):</strong><br />
                আপনার স্ক্রিনশটের মতো শুধুমাত্র 'Sound Allowed' দেখানোর কারণ হলো আপনি আইফ্রেম (iframe) প্রিভিউয়ের মধ্যে আছেন। নোটিফিকেশন চালু করতে নিচে <strong>"ডিরেক্ট ট্যাবে অ্যাপ ওপেন করুন"</strong> বাটনে চাপ দিয়ে গুগল ক্রোমে সরাসরি অ্যাপটি চালু করুন অথবা <strong>"Reset permissions"</strong> অপশনে চাপ দিন।
              </div>

              {/* Step 1 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  ১
                </span>
                <div>
                  <p className="font-bold text-slate-900">তালা (Lock) আইকনে চাপ দিন</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    আপনার ফোনের ব্রাউজারের উপরে যেখানে ওয়েবসাইটের ঠিকানা লেখা থাকে, তার বামের 🔒 বা সেটিংস আইকনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  ২
                </span>
                <div>
                  <p className="font-bold text-slate-900">Site settings এ ঢুকুন</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    মেনু থেকে <strong>'Site settings'</strong> বা <strong>'Permissions'</strong> অপশনে চাপ দিন।
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  ৩
                </span>
                <div>
                  <p className="font-bold text-slate-900">Notifications অনুমোদন (Allow) করুন</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <strong>Notifications</strong> এ গিয়ে 'Blocked' লেখাটি পরিবর্তন করে <strong>'Allow' / 'অনুমোদন'</strong> সিলেক্ট করুন।
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                  ৪
                </span>
                <div>
                  <p className="font-bold text-slate-900">পেজ রিফ্রেশ করুন</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    সেটিংস বন্ধ করে ওয়েবসাইট পেজটি একবার রিফ্রেশ (Reload) করুন।
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href="https://ais-pre-pwr3ypxrlho4z43r7vzfkh-573344126666.asia-southeast1.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer border-0 text-center no-underline"
              >
                🌐 ক্রোমে ডিরেক্ট ট্যাবে অ্যাপ ওপেন করুন
              </a>
              <button
                onClick={() => {
                  setShowUnblockGuide(false);
                  window.location.reload();
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0"
              >
                <RefreshCw size={14} />
                বুঝেছি, পেজ রিফ্রেশ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

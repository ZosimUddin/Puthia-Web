import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  startPresenceTracking, 
  updatePresencePage, 
  onPresenceEvents 
} from '../../services/presenceService';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const GlobalPresenceTracker: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [kickedReason, setKickedReason] = useState<string | null>(null);

  // Initialize heartbeat engine
  useEffect(() => {
    const cleanupTracking = startPresenceTracking({
      name: userProfile?.name || (userProfile as any)?.fullName || user?.displayName || undefined,
      email: user?.email || undefined,
      role: (userProfile?.role as string) || undefined,
      avatar: user?.photoURL || undefined
    });

    onPresenceEvents({
      onBroadcast: (msg) => {
        if (msg) {
          setBroadcastMessage(msg);
        }
      },
      onKicked: (reason) => {
        setKickedReason(reason);
        toast.error(`সেশন সমাপ্ত: ${reason}`, { duration: 6000 });
        logout?.();
      }
    });

    return () => {
      cleanupTracking?.();
    };
  }, [user, userProfile]);

  // Sync route pathname on location change
  useEffect(() => {
    updatePresencePage(location.pathname, document.title);
  }, [location.pathname]);

  return (
    <>
      {/* Live Admin Broadcast Flash Alert Modal / Banner */}
      <AnimatePresence>
        {broadcastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[99999] bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    জরুরি অ্যাডমিন বার্তা
                  </span>
                  <span className="text-xs text-emerald-300 font-medium">সরাসরি সম্প্রচার</span>
                </div>
                <p className="text-sm font-medium text-emerald-100 whitespace-pre-line leading-relaxed">
                  {broadcastMessage}
                </p>
              </div>
              <button
                onClick={() => setBroadcastMessage(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kicked Session Modal */}
      <AnimatePresence>
        {kickedReason && (
          <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-red-500/30"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                সেশন সমাপ্ত করা হয়েছে
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                {kickedReason}
              </p>
              <button
                onClick={() => {
                  setKickedReason(null);
                  window.location.href = '/';
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                হোমে ফিরে যান
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onMessage } from "firebase/messaging";
import { db, initMessaging } from "../firebase";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, ShieldAlert, Zap, HeartHandshake, Eye, Volume2, VolumeX, PhoneCall } from "lucide-react";
import { useCall } from "../contexts/CallContext";
import { CallData, CallType } from "../services/webrtcService";

interface NoticeNotification {
  id: string;
  text: string;
  color?: string;
  category?: string;
  sender?: string;
  severity?: "critical" | "warning" | "info";
  createdAt: string;
}

export const playNotificationChime = (type: "critical" | "warning" | "info" = "info") => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioCtx.currentTime;

    const playTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gainNode.gain.setValueAtTime(vol, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    if (type === "critical") {
      // Urgent sirens/beeps
      playTone(587.33, now, 0.15, 0.25); // D5
      playTone(587.33, now + 0.2, 0.15, 0.25); // D5
      playTone(698.46, now + 0.4, 0.35, 0.3); // F5
    } else if (type === "warning") {
      // Staccato alert
      playTone(440, now, 0.12, 0.2); // A4
      playTone(554.37, now + 0.1, 0.12, 0.2); // C#5
      playTone(659.25, now + 0.2, 0.25, 0.2); // E5
    } else {
      // Gentle notification chime
      playTone(523.25, now, 0.12, 0.25); // C5
      playTone(659.25, now + 0.1, 0.25, 0.25); // E5
    }
  } catch (err) {
    console.warn("AudioContext chime failed:", err);
  }
};

export const PushNotificationListener: React.FC = () => {
  const { receiveCallInvite, openCallById } = useCall();
  const [activeAlert, setActiveAlert] = useState<NoticeNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("puthia_notif_sound") !== "disabled";
  });
  
  const isInitialLoad = useRef(true);
  const sessionStartTime = useRef(new Date().toISOString());

  useEffect(() => {
    // Save sound preference
    localStorage.setItem("puthia_notif_sound", soundEnabled ? "enabled" : "disabled");
  }, [soundEnabled]);

  // 1. Listen for background Service Worker & BroadcastChannel events (triggered when app was in background)
  useEffect(() => {
    // Handle messages posted from Service Worker (e.g., background message or notification click)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FCM_CALL_INVITE' && event.data?.payload) {
        console.log('[PushNotificationListener] Incoming call invite from Service Worker:', event.data.payload);
        receiveCallInvite(event.data.payload);
      } else if (event.data?.type === 'OPEN_CALL' && event.data?.callId) {
        openCallById(event.data.callId);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Handle cross-tab or worker communication via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel = new BroadcastChannel('puthia_calls_channel');
        broadcastChannel.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'FCM_CALL_INVITE' && event.data?.payload) {
            console.log('[PushNotificationListener] Incoming call invite from BroadcastChannel:', event.data.payload);
            receiveCallInvite(event.data.payload);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel setup error:', err);
      }
    }

    // Handle custom window events
    const handleCustomCallEvent = (event: any) => {
      if (event.detail) {
        receiveCallInvite(event.detail);
      }
    };
    window.addEventListener('fcm_incoming_call', handleCustomCallEvent);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('fcm_incoming_call', handleCustomCallEvent);
    };
  }, [receiveCallInvite, openCallById]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      // Live listen to notice events in Firestore
      const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const docData = change.doc.data();
            const createdAt = docData.createdAt;

            // Check if notice is created after the page load
            if (createdAt && createdAt > sessionStartTime.current && docData.isActive !== false) {
              const notice: NoticeNotification = {
                id: change.doc.id,
                text: docData.text || "",
                color: docData.color || "#10b981",
                category: docData.category || "সাধারণ নোটিশ",
                sender: docData.sender || "উপজেলা প্রশাসন",
                severity: docData.severity || "info",
                createdAt: createdAt
              };

              // Trigger beautiful in-app banner alert
              setActiveAlert(notice);

              // Play simulated chime
              if (soundEnabled) {
                playNotificationChime(notice.severity);
              }

              // Fire standard browser native notification if permitted
              if (Notification.permission === "granted") {
                try {
                  new Notification(`📢 ${notice.sender} - ${notice.category}`, {
                    body: notice.text,
                    icon: "/logo.png",
                    tag: notice.id
                  });
                } catch (e) {
                  console.warn("Could not dispatch native push notification:", e);
                }
              }
            }
          }
        });
      }, (error) => {
        console.warn("Error listening to live notices (offline/quota):", error?.message || error);
      });
    } catch (err) {
      console.warn("Failed to initialize push notification listener:", err);
    }

    // Also hook Firebase Cloud Messaging foreground message listener
    let unsubscribeMessaging: (() => void) | undefined;
    initMessaging().then((messaging) => {
      if (messaging) {
        try {
          unsubscribeMessaging = onMessage(messaging, (payload) => {
            const data = payload.data || {};
            
            // Check if this FCM payload is an incoming call invite
            const isCallInvite = data.type === 'call_invite' || 
                                 data.action === 'call' || 
                                 Boolean(data.callId) ||
                                 Boolean(data.callType);

            if (isCallInvite) {
              const callId = data.callId || payload.messageId || `call_${Date.now()}`;
              const callerName = data.callerName || payload.notification?.title?.replace(/^.*?:\s*/, '') || 'ব্যবহারকারী';
              const callerPhoto = data.callerPhoto || '';
              const callType: CallType = data.callType === 'video' || data.type === 'video' ? 'video' : 'audio';

              const callData: CallData = {
                id: callId,
                callerId: data.callerId || 'unknown',
                callerName: callerName,
                callerPhoto: callerPhoto,
                receiverId: data.receiverId || '',
                receiverName: data.receiverName || '',
                type: callType,
                status: 'ringing',
                createdAt: Date.now()
              };

              // Trigger CallModal immediately through CallContext
              receiveCallInvite(callData);

              // If tab is in the background or hidden, trigger native notification with ring info
              if (Notification.permission === 'granted' && document.hidden) {
                try {
                  new Notification(`📞 ইনকামিং ${callType === 'video' ? 'ভিডিও কল' : 'অডিও কল'}: ${callerName}`, {
                    body: 'কলের উত্তর দিতে ক্লিক করুন',
                    icon: callerPhoto || '/icon-192.png',
                    tag: `call-${callId}`
                  });
                } catch (e) {
                  console.warn("Native call notification failed:", e);
                }
              }
              return;
            }

            // Normal text notification payload
            if (payload.notification || payload.data) {
              const notice: NoticeNotification = {
                id: payload.messageId || String(Date.now()),
                text: payload.notification?.body || payload.data?.text || "নতুন নোটিশ প্রকাশিত হয়েছে",
                color: payload.data?.color || "#10b981",
                category: payload.data?.category || payload.notification?.title || "পুশ বার্তা",
                sender: payload.data?.sender || "উপজেলা প্রশাসন",
                severity: (payload.data?.severity as any) || "info",
                createdAt: new Date().toISOString()
              };

              setActiveAlert(notice);

              if (soundEnabled) {
                playNotificationChime(notice.severity);
              }
            }
          });
        } catch (fcmErr) {
          console.warn("FCM foreground listener setup skipped:", fcmErr);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe();
        } catch (_) {}
      }
      if (typeof unsubscribeMessaging === "function") {
        try {
          unsubscribeMessaging();
        } catch (_) {}
      }
    };
  }, [soundEnabled, receiveCallInvite]);

  const handleClose = () => {
    setActiveAlert(null);
  };

  const getSeverityStyles = (severity?: string) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-rose-50 border-rose-500",
          accent: "text-rose-600 bg-rose-100",
          badge: "bg-rose-600 text-white",
          icon: ShieldAlert
        };
      case "warning":
        return {
          bg: "bg-amber-50 border-amber-500",
          accent: "text-amber-600 bg-amber-100",
          badge: "bg-amber-500 text-white",
          icon: Zap
        };
      default:
        return {
          bg: "bg-emerald-50 border-emerald-500",
          accent: "text-emerald-600 bg-emerald-100",
          badge: "bg-emerald-600 text-white",
          icon: Bell
        };
    }
  };

  if (!activeAlert) return null;

  const styles = getSeverityStyles(activeAlert.severity);
  const IconComponent = styles.icon;

  return (
    <AnimatePresence>
      <div id="push-notification-banner-container" className="fixed top-24 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-[9999]">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`bg-white rounded-2xl border-2 ${styles.bg} shadow-2xl overflow-hidden p-5 flex flex-col gap-4`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${styles.badge} tracking-wider`}>
                {activeAlert.category}
              </span>
              <span className="text-xs font-bold text-gray-500">
                {activeAlert.sender}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-xl shrink-0 ${styles.accent}`}>
              <IconComponent size={24} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-gray-900 text-base leading-snug">
                জরুরী ঘোষণা!
              </h4>
              <p className="text-sm font-semibold text-gray-700 mt-1 leading-relaxed">
                {activeAlert.text}
              </p>
              <span className="text-[10px] font-medium text-gray-400 block mt-2">
                এইমাত্র সরাসরি নাগরিকদের ফোনে প্রেরিত
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-2 justify-end border-t border-gray-100 pt-3 mt-1">
            <button
              onClick={handleClose}
              className="px-4 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs transition-all"
            >
              বন্ধ করুন
            </button>
            <a
              href="/notice"
              onClick={handleClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-100"
            >
              <Eye size={12} />
              নোটিশ বোর্ড দেখুন
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

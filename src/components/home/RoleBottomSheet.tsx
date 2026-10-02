import React, { memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Globe,
  Shield,
  Edit,
  Wrench,
  Lock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Check
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

interface RoleBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleBottomSheet = memo(({
  isOpen,
  onClose,
}: RoleBottomSheetProps) => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [isSwitching, setIsSwitching] = React.useState(false);
  
  // Confirmation Modal State
  const [pendingSwitch, setPendingSwitch] = React.useState<{
    role: "super_admin" | "admin" | "editor" | "moderator" | "user";
    path: string;
    label: string;
  } | null>(null);

  // Access Denied Modal State
  const [accessDenied, setAccessDenied] = React.useState<boolean>(false);

  // Settings States
  const [showSettings, setShowSettings] = React.useState(false);

  const [animationEnabled, setAnimationEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("role_switch_animation_enabled") !== "false";
  });

  const [confirmationEnabled, setConfirmationEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("role_switch_confirmation_enabled") !== "false";
  });

  const [loggingEnabled, setLoggingEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("role_switch_logging_enabled") !== "false";
  });

  // Auto Return Persistent Toggle
  const [autoReturn, setAutoReturn] = React.useState<boolean>(() => {
    return localStorage.getItem("auto_return_enabled") !== "false";
  });

  const [soundVibrationEnabled, setSoundVibrationEnabled] = React.useState<boolean>(() => {
    return localStorage.getItem("role_switch_sound_vibration_enabled") !== "false";
  });

  const playSwitchSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15); 
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15); 
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.warn("Audio Context not supported or allowed yet:", err);
    }
  };

  const handleAnimationToggle = (checked: boolean) => {
    setAnimationEnabled(checked);
    localStorage.setItem("role_switch_animation_enabled", checked ? "true" : "false");
    window.dispatchEvent(new CustomEvent("role-settings-updated"));
  };

  const handleConfirmationToggle = (checked: boolean) => {
    setConfirmationEnabled(checked);
    localStorage.setItem("role_switch_confirmation_enabled", checked ? "true" : "false");
    window.dispatchEvent(new CustomEvent("role-settings-updated"));
  };

  const handleLoggingToggle = (checked: boolean) => {
    setLoggingEnabled(checked);
    localStorage.setItem("role_switch_logging_enabled", checked ? "true" : "false");
    window.dispatchEvent(new CustomEvent("role-settings-updated"));
  };

  const handleAutoReturnChange = (checked: boolean) => {
    setAutoReturn(checked);
    localStorage.setItem("auto_return_enabled", checked ? "true" : "false");
    window.dispatchEvent(new CustomEvent("role-settings-updated"));
  };

  const handleSoundVibrationToggle = (checked: boolean) => {
    setSoundVibrationEnabled(checked);
    localStorage.setItem("role_switch_sound_vibration_enabled", checked ? "true" : "false");
    window.dispatchEvent(new CustomEvent("role-settings-updated"));
    if (checked) {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      playSwitchSound();
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return "👑 সুপার এডমিন";
      case "admin":
        return "🛡️ এডমিন";
      case "moderator":
        return "🛠️ মডারেটর";
      case "editor":
        return "📝 সম্পাদক";
      default:
        return "👤 ইউজার";
    }
  };

  // Defined panels including Super Admin Panel for role switching test
  const panels = [
    {
      id: "super_admin",
      label: "সুপার অ্যাডমিন",
      icon: Shield,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      emoji: "👑",
      roleValue: "super_admin" as const,
      path: "/super-admin",
      description: "সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ ও সেটিংস পরিবর্তন",
    },
    {
      id: "admin",
      label: "অ্যাডমিন",
      icon: Shield,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      emoji: "🛡️",
      roleValue: "admin" as const,
      path: "/admin",
      description: "কনটেন্ট ও সার্ভিস ম্যানেজমেন্ট",
    },
    {
      id: "editor",
      label: "এডিটর",
      icon: Edit,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      emoji: "📝",
      roleValue: "editor" as const,
      path: "/editor",
      description: "সংবাদ ও তথ্য সম্পাদনা",
    },
    {
      id: "moderator",
      label: "মডারেটর",
      icon: ShieldAlert,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      emoji: "🛠️",
      roleValue: "moderator" as const,
      path: "/moderator",
      description: "পোস্ট ও মন্তব্য যাচাই",
    },
  ];

  const executeSwitchCheck = async (
    role: "super_admin" | "admin" | "editor" | "moderator" | "user",
    path: string,
    label: string
  ) => {
    // If target role is super_admin, check permission
    if (role === "super_admin") {
      const isOriginalSuperAdmin =
        userProfile?.role === "super_admin" ||
        localStorage.getItem("original_role") === "super_admin" ||
        user?.email === "mdzosimuddin47@gmail.com";

      if (!isOriginalSuperAdmin) {
        setAccessDenied(true);

        // Log a security incident to activity_logs if logging is enabled
        if (loggingEnabled) {
          try {
            const ua = navigator.userAgent;
            let browser = "Chrome";
            let device = "Windows Desktop";
            
            if (ua.includes("Firefox")) browser = "Firefox";
            else if (ua.includes("Chrome")) browser = "Chrome";
            else if (ua.includes("Safari")) browser = "Safari";

            if (ua.includes("Windows NT")) device = "Windows Desktop";
            else if (ua.includes("Android")) device = "Android Mobile";
            else if (ua.includes("iPhone")) device = "iPhone";

            await addDoc(collection(db, "activity_logs"), {
              timestamp: new Date().toISOString(),
              role: "Admin (Attempted Elevation)",
              action: "Access Denied: Unauthorized attempt to switch to Super Admin Panel",
              ip: "103.220.204.15",
              device,
              browser,
              userName: userProfile?.name || "ব্যবহারকারী",
              userEmail: userProfile?.email || "user@historicalputhia.com",
              type: "security_violation"
            });
          } catch (logErr) {
            console.error("Error writing security log:", logErr);
          }
        }
        return;
      }
    }

    // Permission check passed or not super_admin target: proceed
    await handleRoleAndNavigate(role, path);
  };

  const handleRoleAndNavigate = async (
    role: "super_admin" | "admin" | "editor" | "moderator" | "user",
    path: string
  ) => {
    try {
      if (soundVibrationEnabled) {
        if (navigator.vibrate) {
          navigator.vibrate([80, 50, 80]);
        }
        playSwitchSound();
      }

      if (animationEnabled) {
        setIsSwitching(true);
      }

      // Detect Browser and Device
      const ua = navigator.userAgent;
      let browser = "Chrome";
      let device = "Windows Desktop";
      
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
      else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
      else if (ua.includes("Trident")) browser = "Internet Explorer";
      else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";

      if (ua.includes("Windows NT")) device = "Windows Desktop";
      else if (ua.includes("Macintosh")) device = "Mac OS Desktop";
      else if (ua.includes("Android")) device = "Android Mobile";
      else if (ua.includes("iPhone")) device = "iPhone";
      else if (ua.includes("iPad")) device = "iPad";
      else if (ua.includes("Linux")) device = "Linux Desktop";

      // Get IP Address
      let ipAddress = "103.220.204.15"; // Realistic default/fallback
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        if (ipData.ip) {
          ipAddress = ipData.ip;
        }
      } catch (err) {
        console.warn("Could not fetch IP, using default:", err);
      }

      // Convert role key to friendly label
      const getRoleDisplay = (r: string) => {
        if (r === "super_admin") return "সুপার এডমিন";
        if (r === "admin") return "এডমিন";
        if (r === "moderator") return "মডারেটর";
        if (r === "editor") return "সম্পাদক";
        return "ইউজার";
      };

      const panelLabel = panels.find((p) => p.roleValue === role)?.label || "Main Website";
      const actionText = `Switched to ${panelLabel}`;

      // Save log to Firestore activity_logs if logging is enabled
      if (loggingEnabled) {
        await addDoc(collection(db, "activity_logs"), {
          timestamp: new Date().toISOString(),
          role: getRoleDisplay(userProfile?.role || "user"),
          action: actionText,
          ip: ipAddress,
          device,
          browser,
          userName: userProfile?.name || "অতিথি ব্যবহারকারী",
          userEmail: userProfile?.email || "guest@historicalputhia.com",
          type: "role_switch"
        });
      }

      // Handle Auto-Return timer setup if switching from super_admin to lower role
      if (role !== "super_admin" && autoReturn) {
        const targetTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem("auto_return_target_time", targetTime.toString());
      } else if (role === "super_admin") {
        localStorage.removeItem("auto_return_target_time");
      }

      // Wait if animation is enabled
      if (animationEnabled) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Switch the active profile role so the user can test the actual dashboard
      if (updateUserProfile) {
        await updateUserProfile({ role });
      }
      navigate(path);
      onClose();
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isSwitching ? undefined : onClose}
            className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-[100] cursor-pointer"
            id="role-bottom-sheet-backdrop"
          />

          {/* Immersive Loading Screen */}
          <AnimatePresence>
            {isSwitching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#F8FFFB]/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-6 text-center"
                id="role-switching-loader"
              >
                <div className="relative mb-6">
                  {/* Glowing core effect */}
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 border-r-emerald-600 rounded-full relative z-10"
                  />
                </div>
                <motion.h3
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-black text-emerald-950 tracking-tight mb-1"
                >
                  প্যানেল পরিবর্তন হচ্ছে...
                </motion.h3>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-mono text-emerald-700/60 uppercase tracking-widest mb-4"
                >
                  দয়া করে অপেক্ষা করুন...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#F8FFFB] rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,106,78,0.12)] border-t border-emerald-100 z-[110] overflow-hidden flex flex-col max-h-[70vh] md:max-h-[75vh] pb-10"
            id="role-bottom-sheet-content"
          >
            {/* Grabber Notch bar */}
            <div className="w-12 h-1.5 bg-emerald-100/60 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            <div className="px-6 pt-4 pb-4 flex flex-col items-center shrink-0">
              {/* Header Title */}
              <div className="flex flex-col items-center gap-1.5">
                <h2 className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span>✨</span> পুঠিয়া সার্ভিস ও নিয়ন্ত্রণ
                </h2>
                <div className="text-[11px] font-black text-emerald-800/70 flex items-center gap-1.5 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                  সক্রিয় রোল: 
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-700 font-black">সম্মানিত নাগরিক</span>
                    <div className="flex items-center justify-center bg-emerald-600 text-white rounded-full p-0.5 ml-0.5">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Wrapper */}
            <div className="flex-1 overflow-y-auto px-6 py-1.5 space-y-4">
              {/* Panel Buttons Navigation */}
              <div className="space-y-2.5">
                {panels.map((panel) => {
                  const isCurrent = userProfile?.role === panel.roleValue;

                  return (
                    <button
                      key={panel.id}
                      onClick={() => {
                        if (isCurrent) return;
                        if (confirmationEnabled) {
                          setPendingSwitch({
                            role: panel.roleValue,
                            path: panel.path,
                            label: panel.label,
                          });
                        } else {
                          executeSwitchCheck(panel.roleValue, panel.path, panel.label);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3.5 border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer rounded-2xl group ${
                        isCurrent
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-black shadow-sm cursor-default pointer-events-none"
                          : "bg-white border-gray-100 text-slate-700 font-bold hover:bg-slate-50"
                      }`}
                      id={`panel-button-${panel.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {isCurrent && <span className="text-xs shrink-0">🟢</span>}
                        <span className="text-xl shrink-0 filter drop-shadow-sm">
                          {panel.emoji}
                        </span>
                        <div className="flex flex-col text-left">
                          <span className="text-xs tracking-wide font-black">
                            {panel.label}
                          </span>
                          {isCurrent ? (
                            <span className="text-[9px] text-emerald-600 font-semibold uppercase mt-0.5 tracking-wider">
                              বর্তমান রোল
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 leading-tight">
                              {panel.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            সক্রিয়
                          </span>
                        ) : (
                          <ChevronRight
                            size={16}
                            className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Role Switcher Settings Collapsible Card */}
              <div className="pt-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer font-black text-xs text-slate-700 tracking-wide"
                  id="toggle-role-settings-btn"
                >
                  <div className="flex items-center gap-2">
                    <span>⚙️ রোল সুইচার সেটিংস</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {showSettings ? "লুকান ▲" : "কনফিগার করুন ▼"}
                  </span>
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3.5"
                      id="role-settings-box"
                    >
                      {/* Toggle: Confirmation Modal */}
                      <div className="flex items-center justify-between">
                        <div className="text-left pr-4">
                          <span className="text-xs font-bold text-slate-800 block">❓ নিশ্চিতকরণ ডায়ালগ</span>
                          <span className="text-[9px] text-slate-400 block leading-tight">অন্য প্যানেলে যাওয়ার আগে কনফার্মেশন ডায়ালগ দেখাবে</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={confirmationEnabled}
                            onChange={(e) => handleConfirmationToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Toggle: Switch Animation */}
                      <div className="flex items-center justify-between">
                        <div className="text-left pr-4">
                          <span className="text-xs font-bold text-slate-800 block">🎥 সুইচ অ্যানিমেশন</span>
                          <span className="text-[9px] text-slate-400 block leading-tight">সুইচ করার সময় চমৎকার লোডিং অ্যানিমেশন দেখাবে</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={animationEnabled}
                            onChange={(e) => handleAnimationToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Toggle: Activity Log */}
                      <div className="flex items-center justify-between">
                        <div className="text-left pr-4">
                          <span className="text-xs font-bold text-slate-800 block">📝 অ্যাক্টিভিটি লগ</span>
                          <span className="text-[9px] text-slate-400 block leading-tight">কে কখন কতক্ষণ কোন প্যানেলে ছিল তা ডাটাবেজে রেকর্ড করা হবে</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={loggingEnabled}
                            onChange={(e) => handleLoggingToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Toggle: Auto Return Timer */}
                      <div className="flex items-center justify-between">
                        <div className="text-left pr-4">
                          <span className="text-xs font-bold text-slate-800 block">⏱️ অটো রিটার্ন (১৫ মিনিট)</span>
                          <span className="text-[9px] text-slate-400 block leading-tight">১৫ মিনিট পর স্বয়ংক্রিয়ভাবে সুপার এডমিনে ফেরত নিয়ে যাবে</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={autoReturn}
                            onChange={(e) => handleAutoReturnChange(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Toggle: Sound/Vibration */}
                      <div className="flex items-center justify-between">
                        <div className="text-left pr-4">
                          <span className="text-xs font-bold text-slate-800 block">🔊 শব্দ ও কম্পন</span>
                          <span className="text-[9px] text-slate-400 block leading-tight">সুইচ করার সময় শব্দ ও কম্পনের মাধ্যমে ফিডব্যাক দেবে</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={soundVibrationEnabled}
                            onChange={(e) => handleSoundVibrationToggle(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sticky/Fixed Footer Wrapper */}
            <div className="shrink-0 bg-white border-t border-gray-50/50">
              {/* Security Badge Footer */}
              <div className="px-6 py-2.5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-slate-800 font-black text-sm">
                  <Lock size={15} className="text-slate-700" />
                  নিরাপদ লগইন
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-black text-xs mt-1">
                  <CheckCircle2 size={14} className="fill-emerald-50 text-emerald-600" />
                  রোল যাচাইকৃত
                </div>
              </div>

              {/* Close Button [ বন্ধ করুন ] */}
              <div className="px-6 pb-2 pt-1.5">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                  id="close-role-bottom-sheet-button"
                >
                  <X size={16} />
                  [ বন্ধ করুন ]
                </button>
              </div>

              {/* Version Info Footer */}
              <div className="text-center pb-4 text-[10px] font-bold text-slate-400 leading-normal">
                <p>ভার্সন ১.০.৪</p>
                <p className="text-[9px] text-slate-400/70 font-medium">সর্বশেষ আপডেট: জুলাই ২০২৬</p>
              </div>
            </div>

            {/* Confirmation Overlay Modal */}
            <AnimatePresence>
              {pendingSwitch && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-[120] flex items-center justify-center p-6 text-center"
                  id="confirm-modal-overlay"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 max-w-[320px] w-full"
                    id="confirm-modal-box"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Shield size={24} className="animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1">
                      নিশ্চিতকরণ
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 mb-4">
                      যদি ভুল করে চাপ দেন
                    </p>
                    {(() => {
                      const matchedPanel = panels.find(p => p.roleValue === pendingSwitch.role);
                      const panelEmoji = matchedPanel?.emoji || "🛡️";
                      const englishRoleName = 
                        pendingSwitch.role === "super_admin" ? "সুপার এডমিন" :
                        pendingSwitch.role === "admin" ? "এডমিন" :
                        pendingSwitch.role === "editor" ? "সম্পাদক" :
                        pendingSwitch.role === "moderator" ? "মডারেটর" : "ইউজার";
                      return (
                        <p className="text-sm font-bold text-slate-700 mb-6 px-1 leading-snug">
                          <span className="text-lg mr-1">{panelEmoji}</span>
                          <span className="text-blue-600 font-black text-base">
                            {englishRoleName} প্যানেল
                          </span>
                          -এ পরিবর্তন করতে চান?
                        </p>
                      );
                    })()}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPendingSwitch(null)}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
                        id="confirm-cancel-btn"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => {
                          const target = pendingSwitch;
                          setPendingSwitch(null);
                          executeSwitchCheck(target.role, target.path, target.label);
                        }}
                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
                        id="confirm-yes-btn"
                      >
                        পরিবর্তন করুন
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Access Denied Overlay Modal */}
            <AnimatePresence>
              {accessDenied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-[120] flex items-center justify-center p-6 text-center"
                  id="access-denied-overlay"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-6 shadow-md border border-rose-100 max-w-[320px] w-full"
                    id="access-denied-box"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                      <Lock size={22} className="animate-bounce" />
                    </div>
                    <h3 className="text-base font-black text-rose-600 mb-1">
                      প্রবেশাধিকার নেই
                    </h3>
                    <p className="text-[11px] font-bold text-rose-500 mb-4 uppercase tracking-widest">
                      অনুমতি নেই
                    </p>
                    <p className="text-xs font-bold text-slate-600 mb-6 px-1 leading-relaxed">
                      দুঃখিত! অ্যাডমিন থেকে সুপার অ্যাডমিন রোলে যাওয়ার অনুমতি আপনার নেই।
                    </p>
                    <button
                      onClick={() => setAccessDenied(false)}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                      id="access-denied-close-btn"
                    >
                      ঠিক আছে
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default RoleBottomSheet;

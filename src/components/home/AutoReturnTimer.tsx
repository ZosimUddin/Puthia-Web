import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ArrowRight, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export const AutoReturnTimer: React.FC = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("auto_return_enabled") !== "false";
  });

  // Track and count down the timer ONLY when role simulation is explicitly activated
  useEffect(() => {
    const isSimulationActive = localStorage.getItem("role_switch_simulation_active") === "true";
    const originalRole = localStorage.getItem("original_role");
    const isOriginalSuperAdmin = originalRole === "super_admin";
    const isSwitchedDown = userProfile?.role && userProfile.role !== "super_admin";

    // Only run when all strict conditions are met
    if (!user || !isOriginalSuperAdmin || !isSwitchedDown || !isEnabled || !isSimulationActive) {
      setTimeLeft(null);
      return;
    }

    // Do not run if already on super-admin or login page to prevent loop
    if (location.pathname.startsWith("/super-admin") || location.pathname.startsWith("/login")) {
      return;
    }

    // Load or initialize target time
    let targetStr = localStorage.getItem("auto_return_target_time");
    let targetTime = targetStr ? parseInt(targetStr, 10) : 0;
    const now = Date.now();
    
    if (!targetTime || targetTime < now || targetTime > now + 16 * 60 * 1000) {
      targetTime = now + 15 * 60 * 1000;
      localStorage.setItem("auto_return_target_time", targetTime.toString());
    }

    const initialDiff = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
    setTimeLeft(initialDiff);

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        triggerAutoReturn();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, userProfile?.role, isEnabled, location.pathname]);

  const triggerAutoReturn = async () => {
    if (isReturning) return;
    try {
      setIsReturning(true);
      localStorage.removeItem("auto_return_target_time");
      localStorage.removeItem("role_switch_simulation_active");
      
      // Save log to Firestore activity_logs safely
      try {
        await addDoc(collection(db, "activity_logs"), {
          timestamp: new Date().toISOString(),
          role: "System (Auto-Return)",
          action: "Auto-Returned to Super Admin Panel (15-min timeout)",
          ip: "127.0.0.1",
          device: "System Timer",
          browser: "System",
          userName: userProfile?.name || "Super Admin",
          userEmail: userProfile?.email || "admin@historicalputhia.com",
          type: "role_switch"
        });
      } catch {
        // Ignore log error
      }

      if (updateUserProfile) {
        await updateUserProfile({ role: "super_admin" });
      }
      
      if (!location.pathname.startsWith("/super-admin")) {
        navigate("/super-admin");
      }
    } catch (err) {
      console.error("Error auto-returning:", err);
    } finally {
      setIsReturning(false);
    }
  };

  const cancelTimer = () => {
    localStorage.removeItem("auto_return_target_time");
    localStorage.removeItem("role_switch_simulation_active");
    localStorage.setItem("auto_return_enabled", "false");
    setIsEnabled(false);
    setTimeLeft(null);
  };

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (timeLeft === null || timeLeft <= 0) return null;

  return (
    <>
      {/* Immersive Switching overlay when returning */}
      <AnimatePresence>
        {isReturning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-6 text-center"
            id="role-auto-return-loader"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-rose-500/25 blur-xl rounded-full" />
              <div className="w-16 h-16 border-4 border-rose-500/10 border-t-rose-500 border-r-rose-500 rounded-full animate-spin relative z-10" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mb-1">
              Super Admin Panel-এ ফিরে যাওয়া হচ্ছে...
            </h3>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
              Auto-Returning...
            </p>
            <p className="text-sm font-semibold text-rose-300">
              নিরাপত্তার স্বার্থে ১৫ মিনিট পর স্বয়ংক্রিয়ভাবে সুপার অ্যাডমিন প্যানেল সক্রিয় হচ্ছে।
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Timer UI */}
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[90] bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 flex flex-col gap-3 max-w-[280px]"
        id="auto-return-timer-pill"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-tight text-white">অটো-রিটার্ন কাউন্টডাউন</h4>
              <p className="text-[10px] font-bold text-slate-400">Super Admin Panel-এ ফিরে যাবে</p>
            </div>
          </div>
          <button 
            onClick={cancelTimer}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="বন্ধ করুন"
            id="cancel-auto-return-btn"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800/50">
          <span className="text-sm font-black font-mono text-rose-400 tracking-wider">
            ⏱️ {formatSeconds(timeLeft)}
          </span>
          <button
            onClick={triggerAutoReturn}
            className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer group"
            id="return-now-btn"
          >
            ফিরে যান
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default AutoReturnTimer;

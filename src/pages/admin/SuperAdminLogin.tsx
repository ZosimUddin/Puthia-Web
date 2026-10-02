import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getFriendlyAuthErrorMessage } from "../../utils/authErrors";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

export const SuperAdminLogin: React.FC = () => {
  const { user, userProfile, loginWithEmail, loginWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as super admin, automatically activate session and redirect to dashboard
  useEffect(() => {
    const isMasterEmail = user?.email === "mdzosimuddin31@gmail.com";
    const isSuperAdmin = user && (userProfile?.role === "super_admin" || (isMasterEmail && !userProfile?.role));
    if (isSuperAdmin) {
      sessionStorage.setItem("super_admin_session_active", "true");
      setSuccess("স্বাগতম! সুপার অ্যাডমিন ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
      const timer = setTimeout(() => {
        navigate("/super-admin");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, userProfile, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (!cleanEmail || !cleanPassword) {
        throw new Error("দয়া করে ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।");
      }

      // 1. Authenticate with real Firebase credentials
      await loginWithEmail(cleanEmail, cleanPassword, true);
      
      // Store super admin active session
      sessionStorage.setItem("super_admin_session_active", "true");
      setSuccess("স্বাগতম! সুপার অ্যাডমিন ভেরিফাইড। ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...");
      
      setTimeout(() => {
        navigate("/super-admin");
      }, 500);
    } catch (err: any) {
      console.error("Super Admin Login Error:", err);
      setError(getFriendlyAuthErrorMessage(err) || "লগইন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginWithGoogle();
      sessionStorage.setItem("super_admin_session_active", "true");
      setSuccess("গুগল অ্যাকাউন্ট ভেরিফাইড! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...");
      setTimeout(() => {
        navigate("/super-admin");
      }, 500);
    } catch (err: any) {
      console.error("Super Admin Google Login Error:", err);
      setError(getFriendlyAuthErrorMessage(err) || "গুগল দিয়ে লগইন সম্পন্ন হয়নি। ব্রাউজারের পপ-আপ অন আছে কিনা যাচাই করুন।");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUserSuperAdmin = user && (user.email === "mdzosimuddin47@gmail.com" || userProfile?.role === "super_admin");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Decorative background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-50/20 blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {/* Login Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200/80 rounded-[28px] shadow-xl p-7 relative overflow-hidden"
        >
          {/* Top Decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#01412F] via-emerald-500 to-[#01412F]" />

          {/* Central Logo Emblem */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-[78px] h-[78px] rounded-full bg-[#EBF5F1] border border-emerald-100 flex items-center justify-center shadow-inner mb-3">
              <div className="w-[62px] h-[62px] rounded-full bg-gradient-to-b from-emerald-100 to-emerald-50/30 flex items-center justify-center border border-emerald-200/50 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-[#01412F]" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-[#01412F] tracking-tight">
              সুপার অ্যাডমিন পোর্টাল
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 max-w-xs leading-relaxed">
              ঐতিহাসিক পুঠিয়া তথ্যকোষ - মাস্টার কন্ট্রোল প্যানেল
            </p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-ping shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* 1-Click Google Sign-in for Super Admin */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-600 rounded-xl font-bold text-xs text-slate-700 transition-all flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
            </button>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">অথবা পাসওয়ার্ড দিয়ে</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Core Credentials Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                ইমেইল বা মোবাইল নম্বর
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="admin@puthiadiary.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl font-bold text-xs text-slate-800 placeholder-slate-400/80 outline-hidden transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">
                সিকিউরিটি পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl font-bold text-xs text-slate-800 placeholder-slate-400/80 outline-hidden transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#01412F] hover:bg-[#013023] text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ShieldCheck size={16} />
              )}
              <span>সুপার অ্যাডমিন লগইন</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Send, CheckCircle2, Phone, User, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';
// @ts-ignore
import templeBg from "../assets/images/puthia_temple_bg_1783616072369.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return setError(`অনুগ্রহ করে আপনার ${method === 'email' ? 'ইমেইল' : 'মোবাইল নম্বর'} দিন।`);

    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // If we implement phone number reset in AuthContext in the future, we can branch here.
      // For now, Firebase standard reset is via email.
      if (method === 'mobile') {
        setError('মোবাইল নম্বর দ্বারা পাসওয়ার্ড রিসেট বর্তমানে বন্ধ আছে। অনুগ্রহ করে ইমেইল ব্যবহার করুন।');
        setLoading(false);
        return;
      }

      await resetPassword(emailOrPhone);
      setMessage('আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। অনুগ্রহ করে আপনার ইনবক্স চেক করুন।');
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2fcf9] via-[#f7fcfb] to-[#eaf5f2] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      
      {/* Puthia Silhouette watermark background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url(${templeBg})` }}
      />

      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main container wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] space-y-6 z-10 px-2"
      >
        
        {/* Back Button "ফিরে যান" */}
        <div className="flex items-center justify-start">
          <button 
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2.5 text-emerald-900/80 hover:text-emerald-700 font-bold text-sm transition-colors py-1 cursor-pointer"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
            <span>ফিরে যান</span>
          </button>
        </div>

        {/* Central Lock Refresh Emblem */}
        <div className="relative flex justify-center py-4">
          
          {/* Floating bird/leaf 1 */}
          <div className="absolute left-[30%] top-[35%] w-5 h-5 text-emerald-600/70 rotate-[-45deg] animate-pulse pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 2H14C7.37 2 2 7.37 2 14C2 14.83 2.08 15.64 2.24 16.43L11.57 7.1L12.99 8.51L3.65 17.85C4.9 19.8 7.07 21.1 9.61 21.1C10.15 21.1 10.68 21.04 11.19 20.93L13.1 19.02C13.84 19.33 14.65 19.5 15.5 19.5C17.43 19.5 19.16 18.72 20.44 17.44C21.41 16.47 22 15.15 22 13.7C22 7.24 17.22 2 17 2Z"/>
            </svg>
          </div>

          {/* Floating bird/leaf 2 */}
          <div className="absolute right-[28%] top-[12%] w-7 h-7 text-emerald-600/60 rotate-[25deg] animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 2H14C7.37 2 2 7.37 2 14C2 14.83 2.08 15.64 2.24 16.43L11.57 7.1L12.99 8.51L3.65 17.85C4.9 19.8 7.07 21.1 9.61 21.1C10.15 21.1 10.68 21.04 11.19 20.93L13.1 19.02C13.84 19.33 14.65 19.5 15.5 19.5C17.43 19.5 19.16 18.72 20.44 17.44C21.41 16.47 22 15.15 22 13.7C22 7.24 17.22 2 17 2Z"/>
            </svg>
          </div>

          {/* Glowing Circular container */}
          <div className="w-[105px] h-[105px] rounded-full bg-emerald-50/50 border border-emerald-100 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.12)]">
            <div className="w-[85px] h-[85px] rounded-full bg-[#E5FDF6] border-[2px] border-emerald-300/40 flex items-center justify-center shadow-inner">
              <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.06)] border border-white relative">
                {/* Custom Reset Lock SVG */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#009664" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="z-10">
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  {/* Arrow curving at bottom */}
                  <path d="M12 21a4.5 4.5 0 0 0 4.5-4.5h-2L16.5 13l2 3.5h-2A6.5 6.5 0 0 1 10 21.2" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Headings */}
        <div className="text-center space-y-2.5">
          <h1 className="text-[28px] font-black text-[#01412F] tracking-tight leading-tight">
            পাসওয়ার্ড রিসেট করুন
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed max-w-[90%] mx-auto">
            আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল বা মোবাইল নম্বর দিন। আমরা আপনাকে রিসেট লিঙ্ক পাঠাবো।
          </p>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-[20px] flex items-center gap-3 text-rose-600 text-xs sm:text-sm font-bold shadow-sm"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-[#E5FDF6] border border-emerald-200 rounded-[20px] flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-bold shadow-sm"
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </motion.div>
        )}

        {/* Form */}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Toggle tabs for Email / Mobile */}
            <div className="flex bg-white border border-slate-100 p-1.5 rounded-[20px] shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setEmailOrPhone('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs sm:text-sm font-black transition-all ${
                  method === 'email' 
                    ? 'bg-[#E5FDF6] text-[#009664]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Mail size={16} className={method === 'email' ? 'stroke-[2.5]' : ''} />
                <span>ইমেইল দ্বারা রিসেট</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('mobile');
                  setEmailOrPhone('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-xs sm:text-sm font-black transition-all ${
                  method === 'mobile' 
                    ? 'bg-[#E5FDF6] text-[#009664]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Phone size={16} className={method === 'mobile' ? 'stroke-[2.5]' : ''} />
                <span>মোবাইল দ্বারা রিসেট</span>
              </button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <label className="text-[13px] font-black text-slate-700 ml-2 block">
                {method === 'email' ? 'ইমেইল ঠিকানা' : 'মোবাইল নম্বর'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
                  {method === 'email' ? (
                    <Mail size={18} className="stroke-[2.5]" />
                  ) : (
                    <Phone size={18} className="stroke-[2.5]" />
                  )}
                </div>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={emailOrPhone || ""}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={method === 'email' ? 'example@mail.com' : '017xxxxxxxx'}
                  className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder-slate-300 text-xs sm:text-sm shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#E5FDF6]/60 border border-emerald-100 rounded-[20px] p-4 flex gap-3 shadow-sm">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[13px] text-emerald-900/80 font-bold leading-relaxed">
                আপনার {method === 'email' ? 'ইমেইল এ' : 'মোবাইল নম্বরে'} একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হবে। লিঙ্কটি ১৫ মিনিটের জন্য কার্যকর থাকবে।
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#009664] text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#007f54] hover:scale-[1.01] transition-all shadow-[0_6px_20px_rgba(0,150,100,0.18)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                  <span>রিসেট লিঙ্ক পাঠান</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider "অথবা" */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/60"></div>
          </div>
          <span className="relative px-4 bg-[#f7fcfb] text-xs font-bold text-slate-400">অথবা</span>
        </div>

        {/* Back to Account Button */}
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 bg-white border border-slate-100 text-[#01412F] rounded-[20px] font-black text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-slate-50 hover:scale-[1.01] transition-all shadow-sm cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            {/* Hexagon/Shield shape for user icon */}
            <svg className="w-5 h-5 text-[#009664]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
          </div>
          <span>অ্যাকাউন্টে ফিরে যান</span>
        </button>

        {/* Footer text */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            সমস্যা হচ্ছে?{" "}
            <Link to="/contact" className="text-[#009664] hover:text-emerald-700 transition-colors font-black">
              সাহায্য প্রয়োজন
            </Link>
          </p>
        </div>

      </motion.div>

      {/* Traditional Puthia Landmark Background Graphic at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] sm:h-[260px] pointer-events-none overflow-hidden z-0">
        <div 
          className="w-full h-full bg-bottom bg-cover opacity-[0.45] mix-blend-multiply"
          style={{ 
            backgroundImage: `url(${templeBg})`,
            backgroundPosition: "center bottom"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#eaf5f2] via-[#eaf5f2]/10 to-transparent" />
      </div>

    </div>
  );
};

export default ForgotPassword;

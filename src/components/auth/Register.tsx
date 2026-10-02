import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Users,
  MapPin,
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Droplet
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendlyAuthErrorMessage } from "../../utils/authErrors";
// @ts-ignore
import templeBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "সাধারণ ইউজার",
    agreedToTerms: true,
    // Sensible defaults for other DB fields
    village: "পুঠিয়া",
    union: "পুঠিয়া",
    gender: "পুরুষ",
    bloodGroup: "",
    isBloodDonor: false,
    isReadyToDonate: true,
    receiveBloodAlerts: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.emailOrPhone || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড দুটি মিলছে না");
      return;
    }
    if (formData.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (formData.isBloodDonor && (!formData.bloodGroup || formData.bloodGroup === "")) {
      setError("রক্তদাতা হিসেবে যুক্ত হতে অনুগ্রহ করে আপনার সঠিক রক্তের গ্রুপ নির্বাচন করুন");
      return;
    }
    if (!formData.agreedToTerms) {
      setError("শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হওয়া আবশ্যক");
      return;
    }

    setIsLoading(true);
    setError("");

    // Determine email & phone to register with
    const isEmail = formData.emailOrPhone.includes("@");
    const regEmail = isEmail ? formData.emailOrPhone : `${formData.phone}@puthiadiary.com`; // Fallback email format

    try {
      await registerWithEmail(
        regEmail,
        formData.password,
        formData.name,
        formData.phone,
        formData.village,
        formData.union,
        formData.gender,
        formData.bloodGroup,
        formData.role === "রক্তদাতা" // If they selected "রক্তদাতা" role, set donor as true
      );
      navigate("/profile");
    } catch (err: any) {
      console.error("Register error:", err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/profile");
    } catch (err: any) {
      console.error("Google register error:", err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2fcf9] via-[#f7fcfb] to-[#eaf5f2] flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden select-none font-sans">
      
      {/* Puthia Silhouette watermark background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url(${templeBg})` }}
      />

      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Register card container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[440px] space-y-6 z-10 px-1"
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

        {/* Central User+ Circle with Floating Leaves */}
        <div className="relative flex justify-center py-2">
          
          {/* Floating leaf 1 */}
          <div className="absolute left-[24%] top-[35%] w-5 h-5 text-emerald-600/70 rotate-[-45deg] animate-pulse pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 2H14C7.37 2 2 7.37 2 14C2 14.83 2.08 15.64 2.24 16.43L11.57 7.1L12.99 8.51L3.65 17.85C4.9 19.8 7.07 21.1 9.61 21.1C10.15 21.1 10.68 21.04 11.19 20.93L13.1 19.02C13.84 19.33 14.65 19.5 15.5 19.5C17.43 19.5 19.16 18.72 20.44 17.44C21.41 16.47 22 15.15 22 13.7C22 7.24 17.22 2 17 2Z"/>
            </svg>
          </div>

          {/* Floating leaf 2 */}
          <div className="absolute right-[22%] top-[12%] w-7 h-7 text-emerald-600/60 rotate-[25deg] animate-bounce pointer-events-none" style={{ animationDuration: '4s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 2H14C7.37 2 2 7.37 2 14C2 14.83 2.08 15.64 2.24 16.43L11.57 7.1L12.99 8.51L3.65 17.85C4.9 19.8 7.07 21.1 9.61 21.1C10.15 21.1 10.68 21.04 11.19 20.93L13.1 19.02C13.84 19.33 14.65 19.5 15.5 19.5C17.43 19.5 19.16 18.72 20.44 17.44C21.41 16.47 22 15.15 22 13.7C22 7.24 17.22 2 17 2Z"/>
            </svg>
          </div>

          {/* User Add Emblem */}
          <div className="w-[105px] h-[105px] rounded-full bg-emerald-50/50 border border-emerald-100 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.12)]">
            <div className="w-[85px] h-[85px] rounded-full bg-[#E5FDF6] border-[2px] border-emerald-300/40 flex items-center justify-center shadow-inner">
              <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center shadow-[0_4px_16px_rgba(16,185,129,0.06)] border border-white">
                <svg className="w-8 h-8 text-[#009664]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Headings */}
        <div className="text-center space-y-2.5">
          <h1 className="text-[28px] font-black text-[#01412F] tracking-tight leading-tight">
            নতুন একাউন্ট তৈরি করুন!
          </h1>
          <p className="text-xs sm:text-xs font-bold text-slate-400">
            আমাদের পুঠিয়া ডিজিটাল সেবায় যুক্ত হতে নিচের তথ্যগুলো দিন
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-[20px] text-rose-700 text-xs sm:text-sm font-medium shadow-sm space-y-2"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 text-slate-800 leading-relaxed font-semibold">
                {error}
              </div>
            </div>
            {error.includes("গুগল") && (
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <span>গুগল দিয়ে দ্রুত সাইন-আপ করুন</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Inputs Layout (Custom card-designed fields) */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Card 1: Your Name */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <User size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">আপনার নাম</span>
              <input 
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Card 2: Email Address (Optional) */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Mail size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">ইমেইল ঠিকানা (ঐচ্ছিক)</span>
              <input 
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="example@mail.com"
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Card 3: Mobile Number */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Phone size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">মোবাইল নম্বর</span>
              <input 
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="017xxxxxxxxx"
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Card 4: Password */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all relative">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Lock size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0 pr-6">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">পাসওয়ার্ড (অন্তত ৮ অক্ষর) *</span>
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password || ""}
                onChange={handleInputChange}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {/* Card 5: Confirm Password */}
          <div className="space-y-1">
            <div className={`flex items-center gap-4 px-4 py-2.5 bg-white border rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 transition-all relative ${
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? "border-rose-300 focus-within:ring-rose-200 focus-within:border-rose-500"
                : "border-slate-100 focus-within:ring-emerald-300 focus-within:border-emerald-500"
            }`}>
              <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Lock size={18} className="stroke-[2.5]" />
              </div>
              <div className="flex-1 text-left min-w-0 pr-6">
                <span className="text-[11px] font-black text-slate-400 block mb-0.5">পাসওয়ার্ড নিশ্চিত করুন *</span>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword || ""}
                  onChange={handleInputChange}
                  placeholder="পাসওয়ার্ডটি আবার লিখুন"
                  className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs font-bold text-rose-500 ml-3 mt-1">
                ⚠️ পাসওয়ার্ড মিলছে না
              </p>
            )}
          </div>

          {/* Card 6: Union / Location */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <MapPin size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">ইউনিয়ন / এলাকা</span>
              <select
                name="union"
                value={formData.union || "বানেশ্বর"}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              >
                <option value="বানেশ্বর">বানেশ্বর ইউনিয়ন</option>
                <option value="পুঠিয়া সদর">পুঠিয়া সদর ইউনিয়ন</option>
                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া ইউনিয়ন</option>
                <option value="ভালুকগাছি">ভালুকগাছি ইউনিয়ন</option>
                <option value="জিউপাড়া">জিউপাড়া ইউনিয়ন</option>
                <option value="শিলমাড়িয়া">শিলমাড়িয়া ইউনিয়ন</option>
                <option value="রাজশাহী সিটি">রাজশাহী সিটি করপোরেশন</option>
                <option value="অন্যান্য">অন্যান্য এলাকা</option>
              </select>
            </div>
          </div>

          {/* Card 7: Village / Area */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <MapPin size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">গ্রাম / বর্তমান ঠিকানা</span>
              <input 
                type="text"
                name="village"
                value={formData.village || ""}
                onChange={handleInputChange}
                placeholder="যেমন: বানেশ্বর বাজার / তারাপুর / শিবপুর"
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Voluntary Blood Donor Card */}
          <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-[20px] p-3.5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isBloodDonor"
                checked={formData.isBloodDonor}
                onChange={handleInputChange}
                className="w-4.5 h-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-black text-[#01412F] flex items-center gap-1.5">
                <Droplet size={16} className="text-rose-500 fill-rose-500 shrink-0" />
                আমি স্বেচ্ছায় রক্তদাতা হিসেবে যুক্ত হতে চাই
              </span>
            </label>

            {/* Donor-Specific Options */}
            {formData.isBloodDonor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2.5 border-t border-emerald-200/50 text-left"
              >
                {/* Blood Group Select for Donor */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> আপনার রক্তের গ্রুপ নির্বাচন করুন *
                  </label>
                  <div className="relative">
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 font-bold text-slate-700 text-xs cursor-pointer shadow-xs appearance-none ${
                        !formData.bloodGroup ? "border-rose-300" : "border-slate-200"
                      }`}
                    >
                      <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-600 block">
                    রক্তদানের জন্য প্রস্তুত? *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isReadyToDonate: true }))}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        formData.isReadyToDonate 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      হ্যাঁ, প্রস্তুত
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isReadyToDonate: false }))}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        !formData.isReadyToDonate 
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      সাময়িক বিরতি
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                  <input
                    type="checkbox"
                    name="receiveBloodAlerts"
                    checked={formData.receiveBloodAlerts}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    কাছাকাছি রক্তের অনুরোধের Notification পাবেন?
                  </span>
                </label>
              </motion.div>
            )}
          </div>

          {/* Card 8: Role Select ("আপনি কে?") */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white border border-slate-100 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.015)] focus-within:ring-2 focus-within:ring-emerald-300 focus-within:border-emerald-500 transition-all">
            <div className="w-11 h-11 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Users size={18} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-[11px] font-black text-slate-400 block mb-0.5">আপনি কে?</span>
              <select
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              >
                <option value="সাধারণ ইউজার">সাধারণ ইউজার (Citizen)</option>
                <option value="সেবা প্রদানকারী">সেবা প্রদানকারী (Provider)</option>
                <option value="উদ্যোক্তা">উদ্যোক্তা / ব্যবসায়ী (Merchant)</option>
                <option value="কন্টেন্ট ক্রিয়েটর">সংবাদদাতা / কন্টেন্ট ক্রিয়েটর</option>
                <option value="রক্তদাতা">রক্তদাতা (Blood Donor)</option>
              </select>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 px-1 py-1">
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="peer sr-only"
                />
                <div className="w-[18px] h-[18px] border-2 border-slate-300 rounded-[6px] peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 leading-snug">
                আমি{" "}
                <Link 
                  to="/terms" 
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#009664] font-black hover:underline cursor-pointer"
                >
                  ব্যবহারের শর্তাবলি
                </Link>
                {" "}ও{" "}
                <Link 
                  to="/privacy" 
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#009664] font-black hover:underline cursor-pointer"
                >
                  গোপনীয়তা নীতি
                </Link>
                {" "}মেনে অ্যাকাউন্ট তৈরি করতে সম্মত।
              </span>
            </label>
          </div>

          {/* Create Account Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#009664] text-white rounded-[20px] font-black text-sm flex items-center justify-center gap-2 hover:bg-[#007f54] hover:scale-[1.01] transition-all shadow-[0_6px_20px_rgba(0,150,100,0.18)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>একাউন্ট তৈরি করুন</span>
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
              </>
            )}
          </button>

        </form>

        {/* Divider "অথবা" */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/60"></div>
          </div>
          <span className="relative px-4 bg-[#f7fcfb] text-xs font-bold text-slate-400">অথবা</span>
        </div>

        {/* Google Signup Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full py-4 bg-white border border-slate-100 text-slate-700 rounded-[20px] font-black text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-slate-50 hover:scale-[1.01] transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>গুগল দিয়ে সাইন আপ করুন</span>
        </button>

        {/* Existing account login redirect */}
        <div className="text-center pt-2">
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            ইতিমধ্যে একাউন্ট আছে?{" "}
            <Link to="/login" className="text-[#009664] hover:text-emerald-700 transition-colors font-black">
              লগইন করুন
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

export default Register;

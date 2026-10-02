import React from "react";
import { 
  Smartphone, 
  Download, 
  Star, 
  Rocket, 
  Cloud, 
  Shield, 
  Bell, 
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
// @ts-ignore
import templeBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

const AppDownloadSection: React.FC = () => {
  return (
    <section className="py-3 md:py-4 px-4 max-w-lg mx-auto font-sans" id="app-download-section">
      
      {/* 1. Header Banner (Dark Green Canvas with Temple BG Overlay) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-[16px] p-8 sm:p-12 text-white relative overflow-hidden shadow-[0_4px_24px_-4px_rgba(148,163,184,0.12)] flex flex-col items-center select-none text-center border border-emerald-950/20"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(2, 44, 34, 0.88), rgba(2, 44, 34, 0.98)), url(${templeBg})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        
        {/* Background Dots Pattern Overlay */}
        <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
          <div className="grid grid-cols-4 gap-1.5">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] shadow-inner">
          <Smartphone size={14} className="text-emerald-500 stroke-[2.5] animate-bounce" />
          <span>মোবাইল অ্যাপ</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mt-8 max-w-2xl drop-shadow-md">
          পুঠিয়া ডিজিটাল সেবা <br />
          <span className="text-emerald-400">আপনার হাতের মুঠোয়</span>
        </h2>

        {/* Subtitle */}
        <p className="text-emerald-50/80 font-bold text-sm md:text-xl leading-relaxed max-w-2xl mt-6 opacity-90 px-4">
          সহজ ইন্টারফেস, অফলাইন সাপোর্ট এবং নিয়মিত আপডেটের মাধ্যমে পুঠিয়ার সকল তথ্য এখন আরও দ্রুত পাবেন আমাদের মোবাইল অ্যাপে।
        </p>

        {/* Get It On Google Play Button */}
        <div className="mt-10">
          <motion.a 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="#" 
            className="flex items-center justify-between bg-white rounded-[16px] px-5 py-3.5 shadow-[0_10px_20px_-4px_rgba(2,44,34,0.3)] hover:shadow-[0_15px_30px_-6px_rgba(2,44,34,0.5)] transition-all duration-300 select-none cursor-pointer border border-emerald-50 max-w-sm w-full"
          >
            {/* Google Play Logo (Exact Custom SVG Representation) */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                <path d="M7.4 5.3c-.3.4-.4 1-.4 1.8v33.8c0 .8.1 1.4.4 1.8L24.3 24 7.4 5.3z" fill="#00C0FF"/>
                <path d="M34.7 13.9L24.3 24 7.4 5.3c.3-.3.9-.3 1.6.1L34.7 13.9z" fill="#00E676"/>
                <path d="M34.7 34.1L9 42.6c-.7.4-1.3.4-1.6.1L24.3 24l10.4 10.1z" fill="#FF3C30"/>
                <path d="M40.2 21.6l-5.5-3.1-10.4 5.5 10.4 10.1 5.5-3.1c1.2-.7 1.2-1.9 0-2.6v-6.8z" fill="#FFC107"/>
              </svg>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">ডাউনলোড করুন</span>
                <span className="block text-sm sm:text-base font-black text-slate-900 tracking-tight">গুগল প্লে স্টোরে</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-[1px] h-10 bg-slate-100 mx-4 shrink-0"></div>

            {/* Download Icon with margin on the right to position it slightly leftward */}
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 mr-1 sm:mr-2">
              <Download className="w-5 h-5 stroke-[3]" />
            </div>
          </motion.a>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 text-emerald-500 mt-10">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="currentColor" className="stroke-none" />
          ))}
        </div>

        {/* Rating Stats */}
        <p className="text-xs font-black text-emerald-100/60 mt-3 uppercase tracking-widest">
          ৪.৯ রেটিং • ১০কে+ ডাউনলোড
        </p>

      </motion.div>

      {/* 2. Feature Grid (4 Cards Matching the Image Exactly) */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        
        {/* Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-100/80 rounded-[16px] p-4 relative flex flex-col items-start gap-3 shadow-[0_4px_12px_-2px_rgba(148,163,184,0.06)] hover:shadow-[0_12px_20px_-4px_rgba(5,150,105,0.08)] hover:border-emerald-200/50 transition-all duration-300 select-none"
        >
          {/* Top-Right Check Badge */}
          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {/* Icon */}
          <div className="w-11 h-11 rounded-[12px] bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Rocket className="w-5 h-5 stroke-[2.5]" />
          </div>
          {/* Texts */}
          <div className="text-left mt-1">
            <h4 className="text-slate-800 font-black text-[16px] tracking-tight leading-normal mb-0.5">দ্রুত ও সহজ</h4>
            <p className="text-slate-400 font-bold text-[14px] leading-tight">বিনা বাধায় ব্রাউজিং অভিজ্ঞতা উপভোগ করুন</p>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-slate-100/80 rounded-[16px] p-4 relative flex flex-col items-start gap-3 shadow-[0_4px_12px_-2px_rgba(148,163,184,0.06)] hover:shadow-[0_12px_20px_-4px_rgba(5,150,105,0.08)] hover:border-emerald-200/50 transition-all duration-300 select-none"
        >
          {/* Top-Right Check Badge */}
          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {/* Icon */}
          <div className="w-11 h-11 rounded-[12px] bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Cloud className="w-5 h-5 stroke-[2.5]" />
          </div>
          {/* Texts */}
          <div className="text-left mt-1">
            <h4 className="text-slate-800 font-black text-[16px] tracking-tight leading-normal mb-0.5">অফলাইন মোড</h4>
            <p className="text-slate-400 font-bold text-[14px] leading-tight">ইন্টারনেট ছাড়াই সেবা ব্যবহার করুন</p>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white border border-slate-100/80 rounded-[16px] p-4 relative flex flex-col items-start gap-3 shadow-[0_4px_12px_-2px_rgba(148,163,184,0.06)] hover:shadow-[0_12px_20px_-4px_rgba(5,150,105,0.08)] hover:border-emerald-200/50 transition-all duration-300 select-none"
        >
          {/* Top-Right Check Badge */}
          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {/* Icon */}
          <div className="w-11 h-11 rounded-[12px] bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          {/* Texts */}
          <div className="text-left mt-1">
            <h4 className="text-slate-800 font-black text-[16px] tracking-tight leading-normal mb-0.5">ডার্ক মোড</h4>
            <p className="text-slate-400 font-bold text-[14px] leading-tight">চোখের আরামের জন্য ডার্ক মোড সাপোর্ট</p>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-slate-100/80 rounded-[16px] p-4 relative flex flex-col items-start gap-3 shadow-[0_4px_12px_-2px_rgba(148,163,184,0.06)] hover:shadow-[0_12px_20px_-4px_rgba(5,150,105,0.08)] hover:border-emerald-200/50 transition-all duration-300 select-none"
        >
          {/* Top-Right Check Badge */}
          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          {/* Icon */}
          <div className="w-11 h-11 rounded-[12px] bg-emerald-50/80 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </div>
          {/* Texts */}
          <div className="text-left mt-1">
            <h4 className="text-slate-800 font-black text-[16px] tracking-tight leading-normal mb-0.5">নোটিফিকেশন</h4>
            <p className="text-slate-400 font-bold text-[14px] leading-tight">গুরুত্বপূর্ণ পান আপডেট এবং নোটিফিকেশন</p>
          </div>
        </motion.div>

      </div>

      {/* 3. Bottom Dynamic App Download Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#022c22] to-[#013c2f] rounded-[16px] p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 w-full shadow-[0_8px_24px_-6px_rgba(2,44,34,0.4)] mt-5 relative overflow-hidden select-none"
      >
        
        {/* Subtle decorative grid/overlay in footer bar */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-4 gap-0.5">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 min-w-0 z-10 text-left w-full sm:w-auto">
          
          {/* Premium Device Mockup Display with Tick */}
          <div className="relative w-11 h-16 bg-[#032f25] border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            {/* Speaker Line */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-500/20 rounded-full"></div>
            {/* Shiny screen tick */}
            <div className="w-7 h-11 bg-gradient-to-br from-emerald-500/25 to-emerald-600/25 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {/* Small subtle base button */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500/10"></div>
          </div>

          <div className="min-w-0 text-left flex-1">
            <h4 className="text-white font-black text-[16px] tracking-tight leading-none">আজই ডাউনলোড করুন</h4>
            <p className="text-[#a7f3d0] font-bold text-[15px] sm:text-[16px] mt-2 leading-normal">
              পুঠিয়ার সকল তথ্য, সেবা এবং আপডেট এক অ্যাপেই পান।
            </p>
          </div>

        </div>

        {/* Download Button */}
        <a 
          href="#" 
          className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#022c22] px-6 h-12 min-h-[48px] rounded-[16px] font-black text-[16px] transition-colors shadow-md shrink-0 z-10 cursor-pointer active:scale-95 w-full sm:w-auto text-center"
        >
          <span>এখনই ডাউনলোড করুন</span>
          <ArrowRight size={20} className="stroke-[3]" />
        </a>

      </motion.div>

    </section>
  );
};

export default AppDownloadSection;

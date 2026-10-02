import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, RotateCw } from 'lucide-react';

const SiteReloading: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f9fafb] flex items-center justify-center p-4 font-sans overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[48px] p-10 md:p-14 max-w-[560px] w-full shadow-[0_30px_100px_rgba(0,0,0,0.06)] border border-white relative"
      >
        {/* Background Decorative Shapes */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-50/40 rounded-full blur-3xl pointer-events-none" />

        {/* Illustration Section */}
        <div className="relative h-[240px] flex items-center justify-center mb-10">
          {/* Soft Background Blobs and Leaves */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="absolute w-[360px] h-[220px] bg-emerald-50/60 rounded-full blur-2xl"></div>
             
             {/* Left Plant */}
             <div className="absolute left-0 bottom-4 opacity-90 scale-125 z-20">
               <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                 <path d="M50 120C50 120 15 85 5 55C25 45 45 75 45 75" fill="#34D399" />
                 <path d="M50 120C50 120 35 65 20 35C45 25 50 65 50 65" fill="#059669" />
                 <path d="M50 120C50 120 45 90 60 65C45 55 40 85 40 85" fill="#10B981" />
               </svg>
             </div>
             
             {/* Right Plant */}
             <div className="absolute right-0 bottom-4 opacity-90 scale-125 z-20">
               <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                 <path d="M50 120C50 120 85 85 95 55C75 45 55 75 55 75" fill="#10B981" />
                 <path d="M50 120C50 120 65 65 80 35C55 25 50 65 50 65" fill="#059669" />
                 <path d="M50 120C50 120 55 90 40 65C55 55 60 85 60 85" fill="#34D399" />
               </svg>
             </div>
          </div>
          
          {/* Browser Window Mockup */}
          <div className="relative z-10 w-[260px] h-[180px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,100,60,0.1)] border border-emerald-50/50 flex flex-col overflow-hidden">
            <div className="h-10 bg-[#009664] flex items-center px-4 gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/90"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-white/90"></div>
            </div>
            <div className="flex-1 p-5 flex flex-col gap-4 bg-[#f8fdfc] relative">
               <div className="h-3 bg-emerald-100/60 rounded-full w-full"></div>
               <div className="h-3 bg-emerald-100/60 rounded-full w-[85%]"></div>
               <div className="h-3 bg-emerald-100/60 rounded-full w-[60%]"></div>
               
               <div className="flex gap-3 mt-auto">
                 <div className="h-12 bg-white rounded-xl flex-1 shadow-sm border border-emerald-50"></div>
                 <div className="h-12 bg-white rounded-xl flex-1 shadow-sm border border-emerald-50"></div>
               </div>
               
               {/* Center Refresh Icon Overlay */}
               <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
                 <div className="w-[100px] h-[100px] bg-white rounded-full shadow-[0_10px_25px_rgba(0,150,100,0.15)] flex items-center justify-center border border-emerald-50">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCw size={52} className="text-[#009664]" strokeWidth={2.5} />
                    </motion.div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-10">
          <h1 className="text-[36px] font-black text-[#01412F] mb-4 leading-tight tracking-tight">সাইট রিলোড হচ্ছে</h1>
          <p className="text-[18px] font-bold text-slate-500 leading-relaxed max-w-[400px] mx-auto opacity-80">
            আপনাকে আরও ভালো অভিজ্ঞতা দিতে<br />আমরা সাইটটি রিলোড করছি...
          </p>
        </div>

        {/* Progress Bar Section */}
        <div className="flex items-center gap-6 mb-12 px-2">
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-[#009664] rounded-full shadow-[0_0_15px_rgba(0,150,100,0.3)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
          <span className="text-[18px] font-black text-[#009664] w-14 text-right shrink-0">{progress}%</span>
        </div>

        {/* Security Alert Box */}
        <div className="bg-[#f2faf7] border border-emerald-100/60 rounded-[32px] p-7 flex gap-6 mb-12 items-start">
          <div className="w-16 h-16 rounded-[22px] bg-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-emerald-50 text-[#009664]">
            <ShieldCheck size={36} strokeWidth={2.5} />
          </div>
          <div className="pt-1">
            <h3 className="text-[20px] font-black text-[#01412F] mb-1.5">নিরাপদ ও নির্ভরযোগ্য</h3>
            <p className="text-[15px] font-bold text-slate-500 leading-[1.6]">
              আপনার তথ্য নিরাপদ আছে। সাইট রিলোডের পরে আপনি আগের জায়গা থেকেই কাজ চালিয়ে যেতে পারবেন।
            </p>
          </div>
        </div>

        {/* Footer Spinner */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 border-2 border-[#009664]/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-[#009664] rounded-full animate-spin"></div>
          </div>
          <span className="text-[16px] font-bold text-slate-400">কিছুক্ষণ অপেক্ষা করুন...</span>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteReloading;


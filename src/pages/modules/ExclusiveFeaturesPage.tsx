import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, IdCard, HelpCircle, Megaphone, CalendarClock,
  FileCheck2, MapPin, Bell, ShieldCheck, Diamond, Gift,
  ShieldAlert, Users, Headset, ArrowRight, ChevronRight, Sparkles, Lock, Wrench, Vote, Percent
} from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const ExclusiveFeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const popularFeatures = [
    { title: 'ডিজিটাল পরিচিতি', desc: 'আপনার ডিজিটাল আইডি কার্ড তৈরি ও ব্যবস্থাপনা', icon: <IdCard size={24} strokeWidth={1.5} />, color: 'text-teal-600', bg: 'bg-teal-50', path: '/digital-id' },
    { title: 'হারানো-পাওয়া', desc: 'হারানো জিনিস খুঁজুন ও জমা দিন', icon: <HelpCircle size={24} strokeWidth={1.5} />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/lost-found' },
    { title: 'জরুরি সেবা', desc: 'জরুরি প্রয়োজনে দ্রুত সহায়তা নিন', icon: <Megaphone size={24} strokeWidth={1.5} />, color: 'text-rose-600', bg: 'bg-rose-50', path: '/emergency' },
    { title: 'স্মার্ট রিমাইন্ডার', desc: 'গুরুত্বপূর্ণ তারিখ ও কাজের রিমাইন্ডার সেট করুন', icon: <CalendarClock size={24} strokeWidth={1.5} />, color: 'text-amber-600', bg: 'bg-amber-50', path: '/reminder' },
    { title: 'ই-ডকুমেন্ট ভল্ট', desc: 'গুরুত্বপূর্ণ ডকুমেন্ট নিরাপদে সংরক্ষণ করুন', icon: <FileCheck2 size={24} strokeWidth={1.5} />, color: 'text-purple-600', bg: 'bg-purple-50', path: '/e-document-vault' },
    { title: 'স্থানীয় সহযোগী', desc: 'প্লাম্বার, ইলেকট্রিশিয়ান, মিস্ত্রি, টিউটর ও রংমিস্ত্রি', icon: <Wrench size={24} strokeWidth={1.5} />, color: 'text-sky-600', bg: 'bg-sky-50', path: '/local-services' },
    { title: 'ভোট সহায়ক', desc: 'ভোটার তথ্য, ভোটকেন্দ্র ও নির্বাচন কমিশন লিংক', icon: <Vote size={24} strokeWidth={1.5} />, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/vote-assistant' },
    { title: 'সেফ গাইড', desc: 'সাইবার নিরাপত্তা, প্রতারণা থেকে বাঁচার উপায় ও জরুরি টিপস', icon: <Lock size={24} strokeWidth={1.5} />, color: 'text-teal-600', bg: 'bg-teal-50', path: '/safe-guide' },
    { title: 'কমিউনিটি বোর্ড', desc: 'প্রশ্ন করুন, মতামত দিন, সমস্যা জানান ও স্থানীয় আলোচনা', icon: <Users size={24} strokeWidth={1.5} />, color: 'text-blue-600', bg: 'bg-blue-50', path: '/community-board' },
    { title: 'বিশেষ অফার ও ডিসকাউন্ট', desc: 'স্থানীয় ব্যবসার ডিসকাউন্ট, কুপন ও স্পেশাল অফার', icon: <Percent size={24} strokeWidth={1.5} />, color: 'text-amber-600', bg: 'bg-amber-50', path: '/special-offers' },
    { title: 'লাইভ সাপোর্ট', desc: 'অ্যাডমিন চ্যাট, মেসেঞ্জার, হোয়াটসঅ্যাপ ও সাপোর্ট টিকিট', icon: <Headset size={24} strokeWidth={1.5} />, color: 'text-sky-600', bg: 'bg-sky-50', path: '/live-support' },
    { title: 'স্থানীয় সংযোগ', desc: 'আপনার এলাকার গুরুত্বপূর্ণ সেবার সাথে সংযুক্ত থাকুন', icon: <MapPin size={24} strokeWidth={1.5} />, color: 'text-orange-600', bg: 'bg-orange-50', path: '/unions' },
    { title: 'নোটিফিকেশন সেন্টার', desc: 'সকল আপডেট ও নোটিশ এক জায়গায়', icon: <Bell size={24} strokeWidth={1.5} />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/notice' },
    { title: 'ডেটা সুরক্ষা ও অ্যাকাউন্ট নিরাপত্তা', desc: 'পাসওয়ার্ড পরিবর্তন, 2FA, লগইন ইতিহাস ও প্রাইভেসি সেটিংস', icon: <ShieldCheck size={24} strokeWidth={1.5} />, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/account-security' },
  ];

  const newFeatures = [
    { title: 'সেফটি গার্ড', desc: 'ব্যক্তিগত নিরাপত্তা বৃদ্ধিতে সহায়তা', icon: <ShieldAlert size={28} strokeWidth={1.5} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'কমিউনিটি বোর্ড', desc: 'স্থানীয় কমিউনিটির সাথে যোগাযোগ করুন', icon: <Users size={28} strokeWidth={1.5} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'বিশেষ অফার', desc: 'সকল সরকারি ও বেসরকারি অফার এক জায়গায়', icon: <Gift size={28} strokeWidth={1.5} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'লাইভ সাপোর্ট', desc: 'রিয়েল টাইমে সহায়তা পান আমাদের কাছ থেকে', icon: <Headset size={28} strokeWidth={1.5} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">এক্সক্লুসিভ ফিচার</h1>
              <p className="text-[14px] font-bold text-slate-500 mt-0.5">ডিজিটাল পরিচিতি ও অন্যান্য বিশেষ সেবা</p>
            </div>
          </div>

          <div className="space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#e6f7ef] to-[#f0fcf7] rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden border border-emerald-100/50 shadow-sm">
          <div className="relative z-10 w-[72px] h-[72px] shrink-0 flex items-center justify-center">
             <div className="absolute inset-0 bg-[#009664] opacity-20 rounded-full blur-md"></div>
             <div className="absolute inset-0 bg-[#009664] rounded-[16px] flex items-center justify-center shadow-lg shadow-emerald-500/30">
               <ShieldCheck size={36} className="text-white" strokeWidth={1.5} />
             </div>
             <div className="absolute -top-2 -left-2 bg-amber-400 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#e6f7ef] shadow-sm">
               <Star size={12} className="text-white fill-white" />
             </div>
          </div>
          <div className="relative z-10 flex-1 py-1">
            <h3 className="text-[16px] font-black text-[#01412F] leading-tight mb-1.5">বিশেষ সেবার মাধ্যমে<br/>সহজ হোক আপনার জীবন</h3>
            <p className="text-xs font-bold text-slate-500 leading-snug">
              ডিজিটাল পরিচিতি, জরুরি সেবা, হারানো-পাওয়া এবং অন্যান্য বিশেষ ফিচার উপভোগ করুন।
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100 rounded-full blur-[40px] opacity-50 pointer-events-none"></div>
        </div>

        {/* Popular Features */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-[#009664] fill-[#009664]" strokeWidth={1} />
            <h2 className="text-[16px] font-black text-slate-800">জনপ্রিয় ফিচার</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularFeatures.map((feature, idx) => (
              <motion.button 
                key={idx}
                onClick={() => feature.path && navigate(feature.path)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[20px] p-4 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 hover:border-emerald-100 hover:shadow-md transition-all relative group cursor-pointer"
              >
                <div className={`w-[60px] h-[60px] rounded-full ${feature.bg} flex items-center justify-center shrink-0 mb-3 group-hover:scale-110 transition-transform`}>
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                
                <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-1.5 group-hover:text-[#009664] transition-colors">{feature.title}</h3>
                <p className="text-xs font-bold text-slate-400 leading-snug mb-6">{feature.desc}</p>
                
                <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-[#009664]" strokeWidth={2.5} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-[#f2faf7] border border-emerald-100 rounded-[20px] p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#009664] flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <Diamond size={20} className="text-white fill-white" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-slate-800 leading-tight">এক্সক্লুসিভ সুবিধা উপভোগ করুন</h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5 line-clamp-2 pr-2">বিশেষ সব সেবা এক জায়গায় পেয়ে আপনার সময় ও পরিশ্রম বাঁচান, জীবনকে করুন আরও সহজ।</p>
            </div>
          </div>
          <button className="px-4 py-2.5 bg-[#009664] text-white rounded-full text-xs font-black flex items-center gap-1 shadow-sm hover:bg-emerald-700 whitespace-nowrap shrink-0 min-h-[44px]">
            সব ফিচার দেখুন <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* New Features */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift size={20} className="text-[#009664]" strokeWidth={2.5} />
              <h2 className="text-[16px] font-black text-slate-800">নতুন সংযোজিত ফিচার</h2>
            </div>
            <button className="text-[12px] font-bold text-[#009664] flex items-center gap-1">
              সব দেখুন <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {newFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-[20px] p-4 pt-5 relative shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-slate-100/80 flex flex-col items-center text-center group cursor-pointer hover:border-emerald-100 transition-colors">
                <span className="absolute top-2 left-2 bg-[#e6f7ef] text-[#009664] text-[11px] font-black px-2.5 py-0.5 rounded-full">নতুন</span>
                <div className={`w-[60px] h-[60px] rounded-full ${feature.bg} flex items-center justify-center shrink-0 mb-3 group-hover:scale-110 transition-transform`}>
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-[13px] font-black text-slate-800 leading-tight mb-1 group-hover:text-[#009664] transition-colors">{feature.title}</h3>
                <p className="text-xs font-bold text-slate-400 leading-snug">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Security Banner */}
        <div className="bg-[#f2faf7] border border-emerald-100 rounded-[20px] p-4 flex items-center justify-between gap-3 shadow-sm relative overflow-hidden">
           <div className="relative z-10 w-12 h-12 rounded-[14px] bg-[#009664] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Lock size={20} className="text-white" strokeWidth={2} />
           </div>
           <div className="relative z-10 flex-1 pl-1">
             <h2 className="text-[13px] font-black text-[#01412F]">আপনার নিরাপত্তা, আমাদের অঙ্গীকার</h2>
             <p className="text-xs font-bold text-slate-500 mt-1 leading-snug">আমরা উন্নত প্রযুক্তি ব্যবহার করে আপনার সকল তথ্য নিরাপদ ও গোপনীয় রাখি।</p>
           </div>
           <button className="relative z-10 px-4 py-2.5 bg-white border border-emerald-200 text-[#009664] rounded-[10px] text-xs font-black flex items-center gap-1 shadow-sm hover:bg-emerald-50 shrink-0 min-h-[44px]">
              <Lock size={12} strokeWidth={2.5} /> গোপনীয়তা নীতি <ChevronRight size={12} strokeWidth={2.5} />
           </button>
        </div>

        </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default ExclusiveFeaturesPage;


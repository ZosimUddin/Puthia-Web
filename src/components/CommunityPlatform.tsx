import React, { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { useNavigate } from 'react-router-dom';
import { 
  Users, HandHeart, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, 
  MessageSquare, Megaphone, Gift, Heart, Share2, X, Check, Copy, Sparkles, User, Mail, Phone, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './home/Header';
import Footer from './home/Footer';
import BottomNavigation from './home/BottomNavigation';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// @ts-ignore
import heroImage from '../assets/images/puthia_hero_banner_1783661670566.jpg';
// @ts-ignore
import footerImage from '../assets/images/puthia_footer_banner_1783661685409.jpg';

type SubViewType = 'home' | 'feedback' | 'service' | 'cooperation' | 'connect' | 'share';

const CommunityPlatform: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSubView, setActiveSubView] = useState<SubViewType>('home');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [feedbackForm, setFeedbackForm] = useState({ name: '', phone: '', email: '', subject: 'উন্নয়নমূলক পরামর্শ', text: '' });
  const [serviceForm, setServiceForm] = useState({ serviceType: 'স্বেচ্ছাসেবী', description: '', experience: '', phone: '' });
  const [cooperationForm, setCooperationForm] = useState({ cooperationType: 'স্বেচ্ছাসেবী সহযোগিতা', amount: '', isFinancial: false });
  const [connectForm, setConnectForm] = useState({ name: '', phone: '', email: '', waGroup: true, emailUpdates: false, smsUpdates: false });

  const categories = [
    { label: 'ঐক্যবদ্ধ সম্প্রদায়', icon: <Users size={24} className="text-emerald-600" /> },
    { label: 'সেবা ও সহযোগিতা', icon: <HandHeart size={24} className="text-emerald-600" /> },
    { label: 'উন্নয়ন ও অগ্রগতি', icon: <TrendingUp size={24} className="text-emerald-600" /> },
    { label: 'স্বচ্ছতা ও জবাবদিহিতা', icon: <CheckCircle2 size={24} className="text-emerald-600" /> },
    { label: 'সুরক্ষা ও নিরাপত্তা', icon: <ShieldCheck size={24} className="text-emerald-600" /> },
  ];

  const checklist = [
    'নিজ এলাকার উন্নয়নে অংশ নিন',
    'সেবামূলক কাজে এগিয়ে আসুন',
    'স্বচ্ছ ও দুর্নীতিমুক্ত পুঠিয়া গড়ুন',
    'নতুন প্রজন্মের জন্য সুন্দর ভবিষ্যৎ তৈরি করুন',
    'একই সাথে, এক পদক্ষেপে পরিবর্তন আনুন',
  ];

  const participationWays = [
    { id: 'feedback', label: 'মতামত দিন', sub: 'আপনার মতামত জানান', icon: <User size={24} /> },
    { id: 'service', label: 'সেবা দিন', sub: 'সমাজের মানুষের জন্য কাজ করুন', icon: <Megaphone size={24} /> },
    { id: 'cooperation', label: 'সহযোগিতা করুন', sub: 'উন্নয়নমূলক কাজে সাহায্য করুন', icon: <Gift size={24} /> },
    { id: 'connect', label: 'সংযুক্ত থাকুন', sub: 'আপডেট পেতে আমাদের সাথে থাকুন', icon: <Users size={24} /> },
    { id: 'share', label: 'শেয়ার করুন', sub: 'অন্যদের জানাতে শেয়ার করুন', icon: <Share2 size={24} /> },
  ];

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.origin + '/community');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'community_feedback'), {
        ...feedbackForm,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveSubView('home');
        setFeedbackForm({ name: '', phone: '', email: '', subject: 'উন্নয়নমূলক পরামর্শ', text: '' });
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'community_services'), {
        ...serviceForm,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveSubView('home');
        setServiceForm({ serviceType: 'স্বেচ্ছাসেবী', description: '', experience: '', phone: '' });
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCooperation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'community_cooperations'), {
        ...cooperationForm,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveSubView('home');
        setCooperationForm({ cooperationType: 'স্বেচ্ছাসেবী সহযোগিতা', amount: '', isFinancial: false });
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'community_connections'), {
        ...connectForm,
        createdAt: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setActiveSubView('home');
        setConnectForm({ name: '', phone: '', email: '', waGroup: true, emailUpdates: false, smsUpdates: false });
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header user={user} onSearch={() => {}} />

      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          {activeSubView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Hero Banner with Custom-Shaped images collage and flying leaves */}
              <div className="relative bg-emerald-900 text-white px-6 py-10 md:py-16 rounded-b-[40px] overflow-hidden shadow-md">
                <img src={heroImage} alt="Puthia Banner" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="max-w-xl space-y-4 text-center lg:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-800/60 border border-emerald-700/50 rounded-full text-[11px] font-bold tracking-wide uppercase text-emerald-300">
                      <Sparkles size={12} className="text-emerald-500" /> পুঠিয়া ডিজিটাল কমিউনিটি
                    </div>
                    <h1 className="text-2xl md:text-4xl font-extrabold leading-tight text-white">
                      আমাদের পুঠিয়ার সাথে থাকুন, <br className="hidden md:inline" />পুঠিয়া উন্নয়নে অংশ নিন 💚
                    </h1>
                    <p className="text-xs md:text-sm text-emerald-100/90 font-medium leading-relaxed">
                      একসাথে গড়ি স্মার্ট, উন্নত ও আধুনিক পুঠিয়া। আপনার অবদানই পারে পুঠিয়ার ভবিষ্যৎ পরিবর্তন করতে।
                    </p>
                  </div>

                  {/* Collage Style Images representing image shapes */}
                  <div className="relative w-full max-w-sm h-48 hidden md:block">
                    <div className="absolute top-4 left-4 w-32 h-32 rounded-3xl overflow-hidden border-4 border-emerald-800 shadow-xl rotate-[-6deg] bg-emerald-950">
                      <img src={heroImage} className="w-full h-full object-cover" alt="Collage Item 1" />
                    </div>
                    <div className="absolute top-12 right-4 w-36 h-36 rounded-[32px] overflow-hidden border-4 border-emerald-800 shadow-xl rotate-[8deg] bg-emerald-950">
                      <img src={footerImage} className="w-full h-full object-cover" alt="Collage Item 2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core categories list */}
              <div className="max-w-7xl mx-auto px-4 overflow-hidden">
                <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 pb-2 lg:pb-0 hide-scrollbar snap-x snap-mandatory">
                  {categories.map((cat, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-2 hover:shadow-md transition duration-300 shrink-0 w-[140px] lg:w-auto snap-start">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                        {cat.icon}
                      </div>
                      <span className="text-[11px] font-black text-slate-700 leading-snug">{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Green Card: "একসাথে এগিয়ে যাই" */}
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[#01412F] text-white p-6 md:p-8 rounded-[36px] shadow-lg flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-800 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
                  <div className="w-16 h-16 rounded-full bg-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
                    <Users size={32} className="text-emerald-300" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-xl md:text-2xl font-extrabold">একসাথে এগিয়ে যাই</h2>
                    <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                      পুঠিয়ার প্রতিটি মানুষ, প্রতিষ্ঠান ও সংগঠনকে নিয়ে আমরা গড়ব একটি উন্নত, সমৃদ্ধ ও সুন্দর পুঠিয়া।
                    </p>
                  </div>
                  <button onClick={() => setActiveSubView('connect')} className="px-6 py-3 bg-[#009664] hover:bg-[#007f54] text-white font-extrabold text-xs sm:text-sm rounded-full flex items-center gap-1.5 transition shadow-md shrink-0">
                    যোগ দিন আমাদের সাথে <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Checklist Block */}
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white border border-slate-100/80 p-6 md:p-8 rounded-[36px] shadow-sm space-y-4">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      </div>
                      <p className="text-[13px] md:text-[14px] font-extrabold text-slate-700 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wide banner: "আপনার অংশগ্রহণই আমাদের শক্তি" */}
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-[#e6f7ef] border border-emerald-100 p-6 rounded-[36px] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <HandHeart size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-black text-emerald-950 leading-tight">আপনার অংশগ্রহণই আমাদের শক্তি</h3>
                      <p className="text-[11px] md:text-xs text-emerald-800 font-bold mt-1">আপনার মতামত, পরামর্শ ও সহযোগিতা পুঠিয়ার উন্নয়নে গুরুত্বপূর্ণ ভূমিকা রাখবে।</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveSubView('cooperation')} className="px-5 py-2.5 bg-[#009664] hover:bg-[#007f54] text-white font-black text-xs rounded-full flex items-center gap-1 shadow-sm transition shrink-0">
                    অংশ নিন এখনই <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Grid: "আপনি যেভাবে অংশ নিতে পারেন" */}
              <div className="max-w-7xl mx-auto px-4 space-y-4 overflow-hidden">
                <h3 className="text-base font-black text-slate-800 pl-1">আপনি যেভাবে অংশ নিতে পারেন</h3>
                <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 pb-4 hide-scrollbar snap-x snap-mandatory">
                  {participationWays.map((way) => (
                    <button 
                      key={way.id}
                      onClick={() => setActiveSubView(way.id as SubViewType)}
                      className="bg-white border border-slate-100 p-4 rounded-[24px] flex items-center text-left gap-3.5 hover:border-emerald-200 hover:shadow-md transition duration-300 shadow-sm group shrink-0 w-[240px] lg:w-auto snap-start"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                        {way.icon}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{way.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate">{way.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Custom Footer Banner */}
              <div className="max-w-7xl mx-auto px-4">
                <div className="relative bg-[#009664] text-white p-8 md:p-12 rounded-[36px] text-center overflow-hidden shadow-lg">
                  <img src={footerImage} alt="Bottom Banner" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent"></div>
                  
                  <div className="relative z-10 space-y-3 max-w-lg mx-auto">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center text-emerald-200">
                      <Sparkles size={24} />
                    </div>
                    <p className="text-[14px] font-bold uppercase tracking-wider text-emerald-200">চলুন, সবাই মিলে গড়ি</p>
                    <h2 className="text-xl md:text-3xl font-extrabold leading-tight text-white">
                      “উন্নত পুঠিয়া, স্মার্ট পুঠিয়া”
                    </h2>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form: মতামত দিন */}
          {activeSubView === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto px-4 mt-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-emerald-800 text-white p-6 flex items-center gap-3">
                  <button onClick={() => setActiveSubView('home')} className="p-2 hover:bg-emerald-700 rounded-full transition text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-black">মতামত দিন</h2>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    আপনার মতামত ও পরামর্শ আমাদের জন্য অত্যন্ত মূল্যবান। আপনার প্রতিটি সুচিন্তিত মতামত পুঠিয়ার উন্নয়নে সহায়ক হবে।
                  </p>

                  {isSubmitted ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                        <Check size={32} />
                      </div>
                      <h3 className="text-base font-black text-emerald-900">মতামত সফলভাবে পাঠানো হয়েছে</h3>
                      <p className="text-xs font-bold text-slate-400">ধন্যবাদ! আপনার গুরুত্বপূর্ণ মতামত আমাদের কাছে পৌঁছেছে।</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">আপনার নাম</label>
                        <input 
                          type="text" 
                          required
                          value={feedbackForm.name || ""}
                          onChange={(e) => setFeedbackForm({...feedbackForm, name: e.target.value})}
                          placeholder="আপনার নাম লিখুন" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">মোবাইল নাম্বার</label>
                        <input 
                          type="tel" 
                          required
                          value={feedbackForm.phone || ""}
                          onChange={(e) => setFeedbackForm({...feedbackForm, phone: e.target.value})}
                          placeholder="মোবাইল নাম্বার লিখুন" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">ইমেইল (ঐচ্ছিক)</label>
                        <input 
                          type="email" 
                          value={feedbackForm.email || ""}
                          onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                          placeholder="ইমেইল লিখুন" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">বিষয় নির্বাচন করুন</label>
                        <select 
                          value={feedbackForm.subject || ""}
                          onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none bg-white"
                        >
                          <option value="উন্নয়নমূলক পরামর্শ">উন্নয়নমূলক পরামর্শ</option>
                          <option value="সমস্যা / অভিযোগ">সমস্যা / অভিযোগ</option>
                          <option value="সামাজিক উদ্যোগ">সামাজিক উদ্যোগ</option>
                          <option value="অন্যান্য">অন্যান্য</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">আপনার মতামত লিখুন</label>
                        <textarea 
                          required
                          rows={4}
                          value={feedbackForm.text || ""}
                          onChange={(e) => setFeedbackForm({...feedbackForm, text: e.target.value})}
                          placeholder="মতামত বা পরামর্শ এখানে বিস্তারিত লিখুন..." 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none resize-none" 
                        />
                      </div>

                      <button type="submit" className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-2xl shadow-md transition duration-300">
                        মতামত পাঠান
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form: সেবা দিন */}
          {activeSubView === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto px-4 mt-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-emerald-800 text-white p-6 flex items-center gap-3">
                  <button onClick={() => setActiveSubView('home')} className="p-2 hover:bg-emerald-700 rounded-full transition text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-black">সেবা দিন</h2>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    আপনি যদি কোনো সেবা দিয়ে পুঠিয়ার উন্নয়নে অবদান রাখতে চান, তাহলে আমাদের সাথে যুক্ত হোন।
                  </p>

                  {isSubmitted ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                        <Check size={32} />
                      </div>
                      <h3 className="text-base font-black text-emerald-900">আবেদন সফলভাবে পাঠানো হয়েছে</h3>
                      <p className="text-xs font-bold text-slate-400">ধন্যবাদ! আমাদের টিম আপনার সাথে শীঘ্রই যোগাযোগ করবে।</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitService} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">সেবার ধরন নির্বাচন করুন</label>
                        <select 
                          value={serviceForm.serviceType || ""}
                          onChange={(e) => setServiceForm({...serviceForm, serviceType: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none bg-white"
                        >
                          <option value="স্বেচ্ছাসেবী">স্বেচ্ছাসেবী কাজ</option>
                          <option value="রক্তদান">রক্তদান</option>
                          <option value="দুর্যোগ ব্যবস্থাপনা">দুর্যোগ ব্যবস্থাপনা</option>
                          <option value="শিক্ষা ও কারিগরি সহায়তা">শিক্ষা ও কারিগরি সহায়তা</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">সেবার বিবরণ লিখুন</label>
                        <textarea 
                          required
                          rows={4}
                          value={serviceForm.description || ""}
                          onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                          placeholder="আপনার সেবামূলক কাজের বিবরণ লিখুন..." 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none resize-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">অভিজ্ঞতা (ঐচ্ছিক)</label>
                        <input 
                          type="text" 
                          value={serviceForm.experience || ""}
                          onChange={(e) => setServiceForm({...serviceForm, experience: e.target.value})}
                          placeholder="আপনার যদি কোনো কাজের অভিজ্ঞতা থাকে তা লিখুন" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">যোগাযোগ নাম্বার</label>
                        <input 
                          type="tel" 
                          required
                          value={serviceForm.phone || ""}
                          onChange={(e) => setServiceForm({...serviceForm, phone: e.target.value})}
                          placeholder="যোগাযোগ নাম্বার লিখুন" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <button type="submit" className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-2xl shadow-md transition duration-300">
                        সেবা দিতে চাই
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form: সহযোগিতা করুন */}
          {activeSubView === 'cooperation' && (
            <motion.div
              key="cooperation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto px-4 mt-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-emerald-800 text-white p-6 flex items-center gap-3">
                  <button onClick={() => setActiveSubView('home')} className="p-2 hover:bg-emerald-700 rounded-full transition text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-black">সহযোগিতা করুন</h2>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    পুঠিয়ার উন্নয়নে আর্থিক বা অন্য কোনো সহযোগিতার মাধ্যমে আপনার অংশগ্রহণ আমাদের শক্তি বাড়াবে।
                  </p>

                  {isSubmitted ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                        <Check size={32} />
                      </div>
                      <h3 className="text-base font-black text-emerald-900">সহযোগিতা সফলভাবে নিবন্ধিত হয়েছে</h3>
                      <p className="text-xs font-bold text-slate-400">ধন্যবাদ! সমাজের উন্নয়নে আপনার এই অংশগ্রহণ অনন্য প্রশংসার দাবিদার।</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitCooperation} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">সহযোগিতার ধরন নির্বাচন করুন</label>
                        <select 
                          value={cooperationForm.cooperationType || ""}
                          onChange={(e) => setCooperationForm({...cooperationForm, cooperationType: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none bg-white"
                        >
                          <option value="স্বেচ্ছাসেবী সহযোগিতা">স্বেচ্ছাসেবী সহযোগিতা</option>
                          <option value="আর্থিক সহায়তা">আর্থিক সহায়তা</option>
                          <option value="অন্য কিছু">অন্য কিছু</option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={cooperationForm.isFinancial}
                            onChange={(e) => setCooperationForm({...cooperationForm, isFinancial: e.target.checked})}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200"
                          />
                          <span className="text-xs font-extrabold text-slate-700">অর্থ সহায়তা দিতে চান?</span>
                        </label>
                      </div>

                      {cooperationForm.isFinancial && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">পরিমাণ (৳)</label>
                          <input 
                            type="number" 
                            required
                            value={cooperationForm.amount || ""}
                            onChange={(e) => setCooperationForm({...cooperationForm, amount: e.target.value})}
                            placeholder="সহযোগিতার পরিমাণ লিখুন" 
                            className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                          />
                        </div>
                      )}

                      <button type="submit" className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-2xl shadow-md transition duration-300">
                        সহযোগিতা করতে চাই
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form: সংযুক্ত থাকুন */}
          {activeSubView === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto px-4 mt-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-emerald-800 text-white p-6 flex items-center gap-3">
                  <button onClick={() => setActiveSubView('home')} className="p-2 hover:bg-emerald-700 rounded-full transition text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-black">সংযুক্ত থাকুন</h2>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    আমাদের সাথে সংযুক্ত থাকুন এবং নিয়মিত আপডেট পান পুঠিয়ার উন্নয়ন কার্যক্রম সম্পর্কে।
                  </p>

                  {isSubmitted ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                        <Check size={32} />
                      </div>
                      <h3 className="text-base font-black text-emerald-900">সফলভাবে সংযুক্ত হয়েছেন</h3>
                      <p className="text-xs font-bold text-slate-400">ধন্যবাদ! এখন থেকে পুঠিয়ার সকল আপডেট নিয়মিত আপনার কাছে পাঠানো হবে।</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitConnect} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">নাম</label>
                        <input 
                          type="text" 
                          required
                          value={connectForm.name || ""}
                          onChange={(e) => setConnectForm({...connectForm, name: e.target.value})}
                          placeholder="আপনার নাম" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">মোবাইল নাম্বার</label>
                        <input 
                          type="tel" 
                          required
                          value={connectForm.phone || ""}
                          onChange={(e) => setConnectForm({...connectForm, phone: e.target.value})}
                          placeholder="আপনার মোবাইল নাম্বার" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">ইমেইল</label>
                        <input 
                          type="email" 
                          required
                          value={connectForm.email || ""}
                          onChange={(e) => setConnectForm({...connectForm, email: e.target.value})}
                          placeholder="আপনার ইমেইল" 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">কোথায় আপডেট পেতে চান?</label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={connectForm.waGroup}
                              onChange={(e) => setConnectForm({...connectForm, waGroup: e.target.checked})}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200"
                            />
                            <span className="text-xs font-extrabold text-slate-700">হোয়াটসঅ্যাপ গ্রুপ</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={connectForm.emailUpdates}
                              onChange={(e) => setConnectForm({...connectForm, emailUpdates: e.target.checked})}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200"
                            />
                            <span className="text-xs font-extrabold text-slate-700">ইমেইল আপডেট</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={connectForm.smsUpdates}
                              onChange={(e) => setConnectForm({...connectForm, smsUpdates: e.target.checked})}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-200"
                            />
                            <span className="text-xs font-extrabold text-slate-700">এসএমএস আপডেট</span>
                          </label>
                        </div>
                      </div>

                      <button type="submit" className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs rounded-2xl shadow-md transition duration-300">
                        সংযুক্ত থাকুন
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form: শেয়ার করুন */}
          {activeSubView === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto px-4 mt-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-emerald-800 text-white p-6 flex items-center gap-3">
                  <button onClick={() => setActiveSubView('home')} className="p-2 hover:bg-emerald-700 rounded-full transition text-white">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-black">শেয়ার করুন</h2>
                </div>

                <div className="p-6 space-y-6">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    পুঠিয়ার উন্নয়নের এই উদ্যোগটি আপনার বন্ধুদের সাথে শেয়ার করুন।
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/community')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-sky-800 hover:bg-sky-100 transition"
                    >
                      <Share2 size={24} className="text-sky-600" />
                      <span className="text-xs font-black">ফেসবুক</span>
                    </a>

                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent('আমাদের পুঠিয়ার সাথে থাকুন, পুঠিয়া উন্নয়নে অংশ নিন: ' + window.location.origin + '/community')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center text-emerald-800 hover:bg-emerald-100 transition"
                    >
                      <Share2 size={24} className="text-emerald-600" />
                      <span className="text-xs font-black">হোয়াটসঅ্যাপ</span>
                    </a>
                  </div>

                  <div className="space-y-1 pt-4 border-t border-slate-50">
                    <label className="text-[11px] font-bold text-slate-500">কপি লিংক</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly
                        value={window.location.origin + '/community'}
                        className="flex-1 px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-[11px] font-bold outline-none" 
                      />
                      <button 
                        onClick={handleCopyLink}
                        className="px-5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black transition flex items-center gap-1 shrink-0"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default CommunityPlatform;

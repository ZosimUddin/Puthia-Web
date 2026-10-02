import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Vote, UserCheck, MapPin, Hash, Calendar, ExternalLink, Search, 
  ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Building2, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export const VoteAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [nidInput, setNidInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);

  const handleSearchVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidInput.trim()) {
      toast.error('অনুগ্রহ করে আপনার এনআইডি নম্বর বা ভোটার নম্বর লিখুন');
      return;
    }

    // Mock voter search result for Puthia
    setSearchResult({
      name: 'মো. রফিকুল ইসলাম',
      fatherName: 'মরহুম আব্দুল জব্বার',
      motherName: 'মোসা. আমেনা খাতুন',
      nid: nidInput,
      voterNo: 'VOTER-BD-2026-88992',
      centerName: 'পুঠিয়া মডেল সরকারি প্রাথমিক বিদ্যালয়, কেন্দ্র নং-৪২',
      centerLocation: 'পুঠিয়া সদর, পুঠিয়া, রাজশাহী',
      area: 'পুঠিয়া পৌরসভা (ওয়ার্ড নং - ০৩)',
      serialNo: '১৫৬',
      electionDate: 'আসন্ন উপজেলা ও জাতীয় নির্বাচন',
      status: 'সক্রিয় ভোটার'
    });
    toast.success('ভোটার তথ্য সফলভাবে পাওয়া গেছে!');
  };

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
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-amber-300" /> নির্বাচন কমিশন সহায়তা
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                ভোট সহায়ক (Vote Assistant)
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                আপনার ভোটার তথ্য, ভোটকেন্দ্র, ভোটার নম্বর এবং নির্বাচনের তারিখ এক ক্লিকে যাচাই করুন।
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <UserCheck size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">ভোটার তথ্য</span>
                  <span className="text-[10px] text-indigo-200">সরাসরি যাচাই</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <MapPin size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">ভোটকেন্দ্র</span>
                  <span className="text-[10px] text-indigo-200">নিকটস্থ কেন্দ্র</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <Hash size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">ভোটার নম্বর</span>
                  <span className="text-[10px] text-indigo-200">ক্রমিক নম্বর</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <Calendar size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">নির্বাচনের তারিখ</span>
                  <span className="text-[10px] text-indigo-200">আপডেট সূচি</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 max-w-3xl mx-auto space-y-6">

            {/* Search Box Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Search size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">ভোটার তথ্য ও কেন্দ্র অনুসন্ধান</h3>
                  <p className="text-xs text-slate-500">আপনার জাতীয় পরিচয়পত্র বা জন্মতারিখ দিয়ে তথ্য খুঁজুন</p>
                </div>
              </div>

              <form onSubmit={handleSearchVoter} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">জাতীয় পরিচয়পত্র (NID) নম্বর / স্মার্ট কার্ড *</label>
                    <input 
                      type="text"
                      placeholder="যেমন: 1995804561234"
                      value={nidInput}
                      onChange={(e) => setNidInput(e.target.value)}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">জন্মতারিখ (দিন-মাস-বছর)</label>
                    <input 
                      type="date"
                      value={dobInput}
                      onChange={(e) => setDobInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search size={16} /> ভোটার তথ্য যাচাই করুন
                </button>
              </form>
            </div>

            {/* Search Result Card */}
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-200 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <h3 className="text-base font-black text-slate-800">ভোটার নিবন্ধন তথ্য</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {searchResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">ভোটার নাম</span>
                    <strong className="text-sm text-slate-800">{searchResult.name}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">পিতার নাম</span>
                    <strong className="text-sm text-slate-800">{searchResult.fatherName}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">ভোটার নম্বর / ক্রমিক</span>
                    <strong className="text-indigo-600 font-mono">{searchResult.voterNo} (ক্রমিক: {searchResult.serialNo})</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">এলাকা ও ওয়ার্ড</span>
                    <strong className="text-slate-800">{searchResult.area}</strong>
                  </div>
                </div>

                {/* Voting Center Box */}
                <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                    <MapPin size={18} className="text-indigo-600" /> আপনার নির্ধারিত ভোটকেন্দ্র
                  </div>
                  <p className="text-xs font-bold text-slate-800 pl-6">{searchResult.centerName}</p>
                  <p className="text-xs text-slate-600 pl-6">{searchResult.centerLocation}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span>নির্ধারিত নির্বাচন: <strong>{searchResult.electionDate}</strong></span>
                  <button
                    onClick={() => {
                      toast.success('ভোটার স্লিপ প্রিন্ট বা ডাউনলোড সফল হয়েছে');
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition"
                  >
                    ভোটার স্লিপ ডাউনলোড
                  </button>
                </div>
              </motion.div>
            )}

            {/* Official Links & Election Commission Info */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-500" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">বাংলাদেশ নির্বাচন কমিশন (EC)</h3>
                  <p className="text-xs text-slate-300">অফিশিয়াল পোর্টাল ও সেবা লিংক</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="https://services.nidw.gov.bd"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-white">এনআইডি পোর্টাল (NID Services)</span>
                  <ExternalLink size={16} className="text-amber-300" />
                </a>

                <a
                  href="https://www.ecs.gov.bd"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="text-xs font-bold text-white">নির্বাচন কমিশন বাংলাদেশ</span>
                  <ExternalLink size={16} className="text-amber-300" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default VoteAssistantPage;

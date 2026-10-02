import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Send, ChevronRight,
  AlertCircle, CheckCircle2, ShieldCheck,
  Lightbulb, Image as ImageIcon, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { addComplaint } from '../../api';

const ComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaint'); // complaint or suggestion
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [complainantPhone, setComplainantPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg("বিষয় এবং বিবরণ পূরণ করুন।");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await addComplaint({
        title,
        description,
        complainantName: complainantName || "বেনামী ব্যবহারকারী",
        complainantPhone: complainantPhone || "প্রদান করা হয়নি",
        category: activeTab === 'complaint' ? 'Complaint' : 'Suggestion',
        unionName: 'পুঠিয়া সদর',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        actionLog: []
      });

      setIsSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting:", err);
      setErrorMsg("জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fafcfb] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[24px] p-8 max-w-md w-full text-center shadow-xl shadow-emerald-500/10 border border-emerald-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#009664]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">ধন্যবাদ!</h2>
          <p className="text-[14px] font-bold text-slate-500 mb-6 leading-relaxed">
            আপনার {activeTab === 'complaint' ? 'অভিযোগটি' : 'পরামর্শটি'} সফলভাবে জমা দেওয়া হয়েছে। সংশ্লিষ্ট কর্তৃপক্ষ শীঘ্রই ব্যবস্থা গ্রহণ করবে।
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3.5 bg-[#009664] text-white rounded-[16px] font-bold text-[15px] hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
          >
            ফিরে যান
          </button>
        </motion.div>
      </div>
    );
  }

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
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'complaint' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <MessageSquare size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">অভিযোগ ও পরামর্শ</h1>
              <p className="text-[14px] font-bold text-slate-500 mt-0.5">আপনার মতামত বা অভিযোগ সরাসরি জানান</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-white border border-slate-200 rounded-[20px] shadow-sm mb-6">
            <button
              onClick={() => setActiveTab('complaint')}
              className={`flex-1 py-3 text-[14px] font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'complaint'
                  ? 'bg-rose-50 text-rose-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <AlertCircle size={18} strokeWidth={2.5} />
              অভিযোগ
            </button>
            <button
              onClick={() => setActiveTab('suggestion')}
              className={`flex-1 py-3 text-[14px] font-bold rounded-[16px] transition-all flex items-center justify-center gap-2 ${
                activeTab === 'suggestion'
                  ? 'bg-emerald-50 text-[#009664] shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Lightbulb size={18} strokeWidth={2.5} />
              পরামর্শ
            </button>
          </div>

          <div className="space-y-6">
        
        {/* Banner */}
        <div className={`rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden border shadow-sm ${
          activeTab === 'complaint' 
            ? 'bg-gradient-to-r from-rose-50 to-red-50/50 border-rose-100/50' 
            : 'bg-gradient-to-r from-[#e6f7ef] to-[#f0fcf7] border-emerald-100/50'
        }`}>
          <div className="relative z-10 w-[64px] h-[64px] shrink-0">
             <div className={`absolute inset-0 opacity-20 rounded-[16px] rotate-[-6deg] ${
               activeTab === 'complaint' ? 'bg-rose-500' : 'bg-[#009664]'
             }`}></div>
             <div className={`absolute inset-0 rounded-[16px] flex items-center justify-center shadow-lg ${
               activeTab === 'complaint' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-[#009664] shadow-emerald-500/30'
             }`}>
               <MessageSquare size={32} className="text-white" strokeWidth={1.5} />
             </div>
          </div>
          <div className="relative z-10 flex-1 py-1">
            <h3 className={`text-[16px] font-black leading-tight mb-1.5 ${
              activeTab === 'complaint' ? 'text-rose-900' : 'text-[#01412F]'
            }`}>
              {activeTab === 'complaint' ? 'আপনার অভিযোগ জানান' : 'আপনার পরামর্শ দিন'}
            </h3>
            <p className="text-[11px] font-bold text-slate-500 leading-snug pr-4">
              {activeTab === 'complaint' 
                ? 'যেকোনো অনিয়ম বা সমস্যার কথা আমাদের জানান। তথ্য গোপন রাখা হবে।' 
                : 'সেবার মান উন্নয়নে আপনার মূল্যবান পরামর্শ আমাদের একান্ত কাম্য।'}
            </p>
          </div>
          <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-[40px] opacity-50 pointer-events-none ${
            activeTab === 'complaint' ? 'bg-rose-200' : 'bg-emerald-100'
          }`}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-[12px] text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-1.5">বিষয় <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'complaint' ? 'অভিযোগের মূল বিষয়...' : 'পরামর্শের মূল বিষয়...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-1.5">বিস্তারিত বিবরণ <span className="text-rose-500">*</span></label>
            <textarea 
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={activeTab === 'complaint' ? 'বিস্তারিতভাবে আপনার অভিযোগ লিখুন...' : 'বিস্তারিতভাবে আপনার পরামর্শ লিখুন...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-black text-slate-700 mb-1.5">আপনার নাম <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
              <input 
                type="text" 
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
                placeholder="নাম"
                className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-black text-slate-700 mb-1.5">মোবাইল নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></label>
              <input 
                type="tel" 
                value={complainantPhone}
                onChange={(e) => setComplainantPhone(e.target.value)}
                placeholder="০১৭..."
                className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-black text-slate-700 mb-1.5">প্রমাণক / ছবি <span className="text-slate-400 font-normal">(যদি থাকে)</span></label>
            <div className="border-2 border-dashed border-slate-200 rounded-[16px] p-6 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer hover:bg-slate-50 hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ImageIcon size={20} className="text-slate-400 group-hover:text-[#009664]" />
              </div>
              <p className="text-[12px] font-bold text-slate-500">ছবি বা ডকুমেন্ট আপলোড করুন</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">সর্বোচ্চ ৫ MB (JPG, PNG, PDF)</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-[16px] font-black text-[15px] flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none ${
              activeTab === 'complaint' 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' 
                : 'bg-[#009664] hover:bg-emerald-700 shadow-emerald-500/30'
            }`}
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} strokeWidth={2.5} />
            )}
            {submitting ? "প্রক্রিয়াধীন..." : "সাবমিট করুন"}
          </button>
        </form>

        {/* Policy Info */}
        <div className="flex items-start gap-3 bg-slate-50 rounded-[16px] p-4 border border-slate-100">
          <ShieldCheck size={20} className="text-slate-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            আপনার প্রদানকৃত সকল তথ্য সম্পূর্ণ সুরক্ষিত ও গোপন রাখা হবে। শুধুমাত্র যথাযথ কর্তৃপক্ষ এই তথ্য দেখতে পারবেন।
          </p>
        </div>

        </div>
      </div>
    </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
    </div>
  );
};

export default ComplaintPage;

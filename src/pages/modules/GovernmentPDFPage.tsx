import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, ExternalLink, Filter, Search, BookOpen, AlertCircle, FileCheck, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GovernmentPDFPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'circular' | 'notice' | 'guideline' | 'gazette' | 'handbook'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pdfs = [
    {
      id: 1,
      title: 'ডিজিটাল নিরাপত্তা আইন ২০১৮',
      type: 'gazette',
      description: 'ডিজিটাল নিরাপত্তা আইন ২০১৮ এর বাংলাদেশ গেজেট।',
      link: '#',
      category: 'গেজেট'
    },
    {
      id: 2,
      title: 'সরকারি কর্মচারী আচরণ বিধিমালা',
      type: 'circular',
      description: 'সরকারি কর্মচারীদের আচরণ ও শৃঙ্খলা সংক্রান্ত পরিপত্র।',
      link: '#',
      category: 'পরিপত্র'
    },
    {
      id: 3,
      title: 'তথ্য অধিকার আইন - নির্দেশিকা',
      type: 'guideline',
      description: 'তথ্য অধিকার আইন ২০০৯ বাস্তবায়নের নির্দেশিকা।',
      link: '#',
      category: 'নির্দেশিকা'
    },
    {
      id: 4,
      title: 'ই-নথি ব্যবহার ম্যানুয়াল',
      type: 'handbook',
      description: 'সরকারি অফিসে ই-নথি ব্যবহারের বিস্তারিত হ্যান্ডবুক।',
      link: '#',
      category: 'হ্যান্ডবুক'
    },
    {
      id: 5,
      title: 'জাতীয় শুদ্ধাচার কৌশল',
      type: 'notice',
      description: 'জাতীয় শুদ্ধাচার কৌশল বাস্তবায়ন সম্পর্কিত নোটিশ।',
      link: '#',
      category: 'নোটিশ'
    },
    {
      id: 6,
      title: 'সাইবার নিরাপত্তা আইন ২০২৩',
      type: 'gazette',
      description: 'সাইবার নিরাপত্তা আইন ২০২৩ এর গেজেট।',
      link: '#',
      category: 'গেজেট'
    }
  ];

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesTab = activeTab === 'all' || pdf.type === activeTab;
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pdf.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-indigo-600 px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">সরকারি PDF</h1>
        </div>

        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input 
              type="text" 
              placeholder="পিডিএফ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-xl py-3 pl-10 pr-4 outline-none focus:bg-white/20 transition-colors backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-2 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layers size={16} /> সকল
          </button>
          <button 
            onClick={() => setActiveTab('circular')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'circular' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={16} /> পরিপত্র
          </button>
          <button 
            onClick={() => setActiveTab('notice')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'notice' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <AlertCircle size={16} /> নোটিশ
          </button>
          <button 
            onClick={() => setActiveTab('guideline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'guideline' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileCheck size={16} /> নির্দেশিকা
          </button>
          <button 
            onClick={() => setActiveTab('gazette')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'gazette' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen size={16} /> গেজেট
          </button>
          <button 
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'handbook' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen size={16} /> হ্যান্ডবুক
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredPdfs.length > 0 ? (
              filteredPdfs.map((pdf) => (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl shrink-0 mt-0.5 bg-indigo-50 text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{pdf.title}</h3>
                        <p className="text-xs text-slate-500 mb-2">{pdf.description}</p>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          {pdf.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-3 flex justify-end">
                    <a 
                      href={pdf.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      ডাউনলোড করুন <Download size={16} />
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-bold">কোনো PDF পাওয়া যায়নি</p>
                <p className="text-sm text-slate-500 mt-1">অন্য কিছু লিখে খুঁজুন</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

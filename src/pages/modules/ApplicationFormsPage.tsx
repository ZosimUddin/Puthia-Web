import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, ExternalLink, Filter, Search, BookOpen, FileCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ApplicationFormsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const forms = [
    {
      id: 1,
      title: 'জন্ম নিবন্ধন আবেদন ফরম',
      type: 'online',
      description: 'নতুন জন্ম নিবন্ধনের জন্য অনলাইনে আবেদন করুন।',
      link: 'https://bdris.gov.bd/br/application',
      category: 'নাগরিক সেবা'
    },
    {
      id: 2,
      title: 'পাসপোর্ট আবেদন ফরম (PDF)',
      type: 'offline',
      description: 'ই-পাসপোর্টের অফলাইন বা ম্যানুয়াল আবেদন ফরম।',
      link: 'http://www.passport.gov.bd/Reports/Machine%20Readable%20Passport%20Application%20Form.pdf',
      category: 'পাসপোর্ট'
    },
    {
      id: 3,
      title: 'ট্রেড লাইসেন্স আবেদন ফরম',
      type: 'offline',
      description: 'ব্যবসা প্রতিষ্ঠানের ট্রেড লাইসেন্সের জন্য আবেদন ফরম।',
      link: '#',
      category: 'ব্যবসা'
    },
    {
      id: 4,
      title: 'ই-নামজারি আবেদন',
      type: 'online',
      description: 'অনলাইনে জমির নামজারির জন্য আবেদন করুন।',
      link: 'https://mutation.land.gov.bd/',
      category: 'ভূমি সেবা'
    },
    {
      id: 5,
      title: 'পুলিশ ক্লিয়ারেন্স আবেদন',
      type: 'online',
      description: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেটের জন্য অনলাইনে আবেদন।',
      link: 'https://pcc.police.gov.bd/en/',
      category: 'জরুরি সেবা'
    },
    {
      id: 6,
      title: 'বয়স্ক ভাতা আবেদন ফরম',
      type: 'offline',
      description: 'সমাজসেবা অধিদপ্তর কর্তৃক প্রদত্ত বয়স্ক ভাতার আবেদন ফরম।',
      link: '#',
      category: 'ভাতা'
    }
  ];

  const filteredForms = forms.filter(form => {
    const matchesTab = activeTab === 'all' || form.type === activeTab;
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          form.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-emerald-600 px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">আবেদন ফরম</h1>
        </div>

        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input 
              type="text" 
              placeholder="আবেদন ফরম খুঁজুন..."
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={16} /> সকল আবেদন ফরম
          </button>
          <button 
            onClick={() => setActiveTab('online')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'online' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <ExternalLink size={16} /> অনলাইন আবেদন
          </button>
          <button 
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'offline' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Download size={16} /> অফলাইন আবেদন ফরম
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredForms.length > 0 ? (
              filteredForms.map((form) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${form.type === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {form.type === 'online' ? <ExternalLink size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{form.title}</h3>
                        <p className="text-xs text-slate-500 mb-2">{form.description}</p>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          {form.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-3 flex justify-end">
                    {form.type === 'online' ? (
                      <a 
                        href={form.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        আবেদন করুন <ExternalLink size={16} />
                      </a>
                    ) : (
                      <a 
                        href={form.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        ডাউনলোড করুন <Download size={16} />
                      </a>
                    )}
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
                <p className="text-slate-600 font-bold">কোনো ফরম পাওয়া যায়নি</p>
                <p className="text-sm text-slate-500 mt-1">অন্য কিছু লিখে খুঁজুন</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

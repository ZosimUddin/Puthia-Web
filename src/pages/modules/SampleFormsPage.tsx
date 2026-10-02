import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Search, FileCheck, PenTool, FileSignature, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SampleFormsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'filled' | 'application' | 'affidavit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const samples = [
    {
      id: 1,
      title: 'পূরণকৃত জন্ম নিবন্ধন ফরম',
      type: 'filled',
      description: 'কীভাবে নির্ভুলভাবে জন্ম নিবন্ধনের আবেদন ফরম পূরণ করবেন তার একটি ডেমো।',
      category: 'পূরণকৃত নমুনা'
    },
    {
      id: 2,
      title: 'নাম সংশোধনের হলফনামা',
      type: 'affidavit',
      description: 'জাতীয় পরিচয়পত্র বা সনদে নাম সংশোধনের জন্য নোটারি পাবলিকের হলফনামার নমুনা।',
      category: 'হলফনামা'
    },
    {
      id: 3,
      title: 'ইউএনও বরাবর ছুটির আবেদন',
      type: 'application',
      description: 'উপজেলা নির্বাহী অফিসার বরাবর নৈমিত্তিক ছুটির আবেদন লেখার নিয়ম।',
      category: 'আবেদনপত্র'
    },
    {
      id: 4,
      title: 'পূরণকৃত পাসপোর্ট ফরম (অফলাইন)',
      type: 'filled',
      description: 'অফলাইন পাসপোর্ট আবেদন ফরম কীভাবে হাতে পূরণ করতে হয় তার নমুনা।',
      category: 'পূরণকৃত নমুনা'
    },
    {
      id: 5,
      title: 'জন্ম তারিখ সংশোধনের হলফনামা',
      type: 'affidavit',
      description: 'সার্টিফিকেট বা আইডি কার্ডে জন্ম তারিখ সংশোধনের এফিডেভিট ফরম্যাট।',
      category: 'হলফনামা'
    },
    {
      id: 6,
      title: 'চেয়ারম্যান বরাবর প্রত্যয়নপত্রের আবেদন',
      type: 'application',
      description: 'ইউনিয়ন পরিষদ চেয়ারম্যানের নিকট নাগরিকত্ব বা চারিত্রিক সনদের জন্য আবেদন।',
      category: 'আবেদনপত্র'
    }
  ];

  const filteredSamples = samples.filter(sample => {
    const matchesTab = activeTab === 'all' || sample.type === activeTab;
    const matchesSearch = sample.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sample.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-pink-600 px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">নমুনা ফরম</h1>
        </div>

        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input 
              type="text" 
              placeholder="নমুনা খুঁজুন (যেমন: হলফনামা)..."
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'all' ? 'bg-pink-50 text-pink-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Layers size={16} /> সকল
          </button>
          <button 
            onClick={() => setActiveTab('filled')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'filled' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileCheck size={16} /> পূরণকৃত নমুনা
          </button>
          <button 
            onClick={() => setActiveTab('application')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'application' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <PenTool size={16} /> আবেদন লেখা
          </button>
          <button 
            onClick={() => setActiveTab('affidavit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-bold ${activeTab === 'affidavit' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileSignature size={16} /> হলফনামা
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredSamples.length > 0 ? (
              filteredSamples.map((sample) => (
                <motion.div
                  key={sample.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        sample.type === 'filled' ? 'bg-blue-50 text-blue-600' : 
                        sample.type === 'application' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {sample.type === 'filled' ? <FileCheck size={20} /> : 
                         sample.type === 'application' ? <PenTool size={20} /> : 
                         <FileSignature size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-tight mb-1">{sample.title}</h3>
                        <p className="text-xs text-slate-500 mb-2">{sample.description}</p>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wide">
                          {sample.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-3 flex justify-end">
                    <button 
                      className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                        sample.type === 'filled' ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 
                        sample.type === 'application' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 
                        'text-orange-600 bg-orange-50 hover:bg-orange-100'
                      }`}
                    >
                      ডাউনলোড করুন <Download size={16} />
                    </button>
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
                <p className="text-slate-600 font-bold">কোনো নমুনা পাওয়া যায়নি</p>
                <p className="text-sm text-slate-500 mt-1">অন্য কিছু লিখে খুঁজুন</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

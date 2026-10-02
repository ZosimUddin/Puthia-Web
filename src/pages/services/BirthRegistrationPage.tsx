import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Clock, Download, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BirthRegistrationPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "জন্ম নিবন্ধনের জন্য কত দিন সময় লাগে?",
      answer: "সাধারণত আবেদন করার পর ১৫-৩০ কর্মদিবসের মধ্যে জন্ম নিবন্ধন সনদ পাওয়া যায়।"
    },
    {
      question: "আবেদন ফি কত?",
      answer: "বয়স অনুযায়ী ফি ভিন্ন হয়। ৪৫ দিন পর্যন্ত বিনামূল্যে, ৪৫ দিনের পর থেকে ৫ বছর পর্যন্ত ২৫ টাকা (দেশী) এবং ৫ বছরের বেশি হলে ৫০ টাকা ফি নির্ধারিত আছে।"
    },
    {
      question: "ভুল সংশোধন করতে কী করতে হবে?",
      answer: "ভুল সংশোধনের জন্য অনলাইনে 'জন্ম নিবন্ধন সংশোধন' অপশন থেকে আবেদন করতে হবে এবং প্রয়োজনীয় প্রমাণাদি আপলোড করতে হবে।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#006847] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">জন্ম নিবন্ধন</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            জন্ম নিবন্ধন হলো একজন মানুষের রাষ্ট্রীয় স্বীকৃতি। এটি রাষ্ট্র কর্তৃক একজন নাগরিকের নাম, পরিচয়, এবং বয়স নিশ্চিত করার প্রথম ধাপ।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "নতুন আবেদন", icon: <FileText size={20} className="text-blue-500" />, link: "https://bdris.gov.bd/br/application", bg: "bg-blue-50" },
            { title: "সংশোধন আবেদন", icon: <CheckCircle size={20} className="text-orange-500" />, link: "https://bdris.gov.bd/br/correction", bg: "bg-orange-50" },
            { title: "অনলাইন যাচাই", icon: <CheckCircle size={20} className="text-green-500" />, link: "https://everify.bdris.gov.bd/", bg: "bg-green-50" },
            { title: "কপি ডাউনলোড", icon: <Download size={20} className="text-purple-500" />, link: "https://bdris.gov.bd/br/reprint/add", bg: "bg-purple-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#009664]/30 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center`}>
                {action.icon}
              </div>
              <span className="text-sm font-bold text-slate-800">{action.title}</span>
            </a>
          ))}
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <Info size={18} className="text-[#009664]" /> প্রয়োজনীয় কাগজপত্র
          </h2>
          <ul className="space-y-3">
            {[
              "চিকিৎসকের ছাড়পত্র বা হাসপাতালের ছাড়পত্র",
              "পিতা ও মাতার জাতীয় পরিচয়পত্রের কপি",
              "পিতা ও মাতার জন্ম নিবন্ধনের কপি (যদি থাকে)",
              "বাড়ির ট্যাক্স রশিদ বা বিদ্যুৎ বিলের কপি",
              "বিদ্যালয়ের সার্টিফিকেট (যদি থাকে)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#009664] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#009664] mb-2">
              <AlertCircle size={18} />
              <h3 className="font-bold text-sm text-slate-800">আবেদন ফি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ৪৫ দিন পর্যন্ত: বিনামূল্যে<br/>
              ৫ বছর পর্যন্ত: ২৫ টাকা<br/>
              ৫ বছরের বেশি: ৫০ টাকা
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#009664] mb-2">
              <Clock size={18} />
              <h3 className="font-bold text-sm text-slate-800">সময়সীমা</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              আবেদনের পর সাধারণত ১৫-৩০ কর্মদিবসের মধ্যে সম্পন্ন হয়।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://bdris.gov.bd/br/application"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#009664] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          অনলাইনে আবেদন করুন <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#009664]" /> সাধারণ জিজ্ঞাসা (FAQ)
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-3 flex items-center justify-between bg-slate-50/50"
                >
                  <span className="text-sm font-bold text-slate-800">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={16} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 text-sm text-slate-600 bg-slate-50/50 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, RefreshCw, Calculator, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PassportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "ই-পাসপোর্ট পেতে কতদিন সময় লাগে?",
      answer: "বিতরণের ধরন অনুযায়ী সময় লাগে: রেগুলার (সাধারণ) - ২১ দিন, এক্সপ্রেস (জরুরি) - ১০ দিন, এবং সুপার এক্সপ্রেস (অতি জরুরি) - ২ দিন।"
    },
    {
      question: "ই-পাসপোর্টের ফি কত?",
      answer: "পৃষ্ঠা সংখ্যা (৪৮ বা ৬৪) এবং মেয়াদ (৫ বা ১০ বছর) এর উপর ভিত্তি করে ফি নির্ধারিত হয়। যেমন: ৪৮ পৃষ্ঠা ৫ বছর মেয়াদের সাধারণ ফি ৪,০২৫ টাকা (ভ্যাট সহ)।"
    },
    {
      question: "পুলিশ ভেরিফিকেশন কি নিজে করতে হয়?",
      answer: "না, নতুন পাসপোর্টের ক্ষেত্রে পাসপোর্ট অফিস থেকেই পুলিশের কাছে ভেরিফিকেশনের জন্য স্বয়ংক্রিয়ভাবে পাঠানো হয়।"
    },
    {
      question: "পাসপোর্ট নবায়নের (Renewal) নিয়ম কী?",
      answer: "পুরোনো পাসপোর্ট (MRP বা e-Passport) থাকলে রি-ইস্যু বা নবায়নের আবেদন করতে হয়। এক্ষেত্রে সাধারণত পুলিশ ভেরিফিকেশন লাগে না, যদি না তথ্যে বড় কোনো পরিবর্তন থাকে।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#4338ca] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">ই-পাসপোর্ট সেবা</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            ই-পাসপোর্ট হলো বায়োমেট্রিক তথ্য সম্বলিত আধুনিক পাসপোর্ট, যা আন্তর্জাতিক ভ্রমণে বাংলাদেশীদের জন্য একটি নিরাপদ ও দ্রুত ব্যবস্থা।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "নতুন আবেদন", icon: <Plane size={20} className="text-indigo-500" />, link: "https://www.epassport.gov.bd/onboarding", bg: "bg-indigo-50" },
            { title: "পাসপোর্ট নবায়ন", icon: <RefreshCw size={20} className="text-orange-500" />, link: "https://www.epassport.gov.bd/onboarding", bg: "bg-orange-50" },
            { title: "স্ট্যাটাস চেক", icon: <Search size={20} className="text-teal-500" />, link: "https://www.epassport.gov.bd/authorization/application-status", bg: "bg-teal-50" },
            { title: "ফি ক্যালকুলেটর", icon: <Calculator size={20} className="text-rose-500" />, link: "https://www.epassport.gov.bd/instructions/passport-fees", bg: "bg-rose-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#4338ca]/30 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center`}>
                {action.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">{action.title}</span>
            </a>
          ))}
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <FileText size={18} className="text-[#4338ca]" /> প্রয়োজনীয় কাগজপত্র
          </h2>
          <ul className="space-y-3">
            {[
              "জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন (অপ্রাপ্তবয়স্কদের জন্য)",
              "পুরোনো পাসপোর্ট (যদি থাকে)",
              "পেশার প্রমাণপত্র (GO, NOC, Trade License, Student ID)",
              "ইউটিলিটি বিলের কপি (বিদ্যুৎ/গ্যাস/পানি)",
              "বিবাহিত হলে কাবিননামা (প্রযোজ্য ক্ষেত্রে)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#4338ca] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#4338ca] mb-2">
              <Calculator size={18} />
              <h3 className="font-bold text-sm text-slate-800">আবেদন ফি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              মেয়াদ (৫/১০ বছর) এবং পৃষ্ঠা (৪৮/৬৪) অনুযায়ী ফি ৪,০২৫ টাকা থেকে শুরু করে ১৩,৮০০ টাকা পর্যন্ত।
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#4338ca] mb-2">
              <AlertCircle size={18} />
              <h3 className="font-bold text-sm text-slate-800">পেমেন্ট পদ্ধতি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              এ-চালানের মাধ্যমে অনলাইনে ক্রেডিট কার্ড, বিকাশ, রকেট বা নির্দিষ্ট ব্যাংকে সরাসরি ফি জমা দেওয়া যায়।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://www.epassport.gov.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#4338ca] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
        >
          ই-পাসপোর্ট ওয়েবসাইটে যান <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#4338ca]" /> সাধারণ জিজ্ঞাসা (FAQ)
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-3 flex items-center justify-between bg-slate-50/50 cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-800 pr-4">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={16} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500 shrink-0" />
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, Search, RefreshCw, BookOpen, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ETinPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "ই-টিন (e-TIN) কী এবং কেন প্রয়োজন?",
      answer: "e-TIN হলো Electronic Tax Identification Number. ব্যাংক ঋণ, ট্রেড লাইসেন্স, জমি ক্রয়-বিক্রয়, গাড়ি রেজিস্ট্রেশন সহ বিভিন্ন সরকারি ও আর্থিক সেবার জন্য এটি বাধ্যতামূলক।"
    },
    {
      question: "ই-টিন করতে কী কী লাগে?",
      answer: "নতুন ই-টিন করতে শুধুমাত্র আবেদনকারীর জাতীয় পরিচয়পত্র (NID) নম্বর, জন্ম তারিখ এবং একটি সচল মোবাইল নম্বর প্রয়োজন।"
    },
    {
      question: "ই-টিন খুলতে কত টাকা লাগে?",
      answer: "ই-টিন সম্পূর্ণ বিনামূল্যে খোলা যায়। বাংলাদেশ জাতীয় রাজস্ব বোর্ড (NBR) এর ওয়েবসাইটে নিজে নিজেই এটি করা সম্ভব।"
    },
    {
      question: "টিন থাকলে কি আয়কর রিটার্ন দেওয়া বাধ্যতামূলক?",
      answer: "হ্যাঁ, নতুন নিয়ম অনুযায়ী যাদের টিন আছে তাদের বছর শেষে আয়কর রিটার্ন (Zero Return হলেও) জমা দেওয়া বাধ্যতামূলক।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#b91c1c] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">ই-টিন (e-TIN)</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            জাতীয় রাজস্ব বোর্ড (NBR) কর্তৃক ইস্যুকৃত ১২ ডিজিটের ই-টিন নম্বর প্রতিটি করদাতার জন্য একটি অনন্য পরিচয়পত্র।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "নতুন e-TIN", icon: <FileText size={20} className="text-red-600" />, link: "https://secure.incometax.gov.bd/Registration/Home", bg: "bg-red-50" },
            { title: "TIN যাচাই", icon: <Search size={20} className="text-blue-500" />, link: "https://secure.incometax.gov.bd/TINCheck", bg: "bg-blue-50" },
            { title: "তথ্য হালনাগাদ", icon: <RefreshCw size={20} className="text-orange-500" />, link: "https://secure.incometax.gov.bd/Registration/Login", bg: "bg-orange-50" },
            { title: "গাইড / ম্যানুয়াল", icon: <BookOpen size={20} className="text-green-500" />, link: "https://secure.incometax.gov.bd/Content/Documents/User_Manual_eTIN.pdf", bg: "bg-green-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#b91c1c]/30 hover:shadow-md transition-all"
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
            <Info size={18} className="text-[#b91c1c]" /> আবেদন করতে যা যা লাগবে
          </h2>
          <ul className="space-y-3">
            {[
              "আবেদনকারীর জাতীয় পরিচয়পত্র (NID) নম্বর",
              "NID অনুযায়ী জন্ম তারিখ",
              "সচল একটি মোবাইল নম্বর (NID দিয়ে নিবন্ধিত হলে ভালো)",
              "পিতার নাম ও মাতার নাম (NID অনুযায়ী)",
              "বর্তমান ও স্থায়ী ঠিকানা (NID অনুযায়ী)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#b91c1c] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#b91c1c] mb-2">
              <Fingerprint size={18} />
              <h3 className="font-bold text-sm text-slate-800">বায়োমেট্রিক যাচাই</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              NID ডেটাবেসের সাথে সংযুক্ত থাকায় তাৎক্ষণিকভাবে স্বয়ংক্রিয়ভাবে তথ্য যাচাই হয়ে যায়।
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#b91c1c] mb-2">
              <AlertCircle size={18} />
              <h3 className="font-bold text-sm text-slate-800">ফ্রি রেজিস্ট্রেশন</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ই-টিন সার্টিফিকেট তৈরি করতে কোনো ফি দিতে হয় না। এটি সম্পূর্ণ সরকারি ফ্রি সার্ভিস।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://secure.incometax.gov.bd/Registration/Home"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#b91c1c] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-red-900/20 active:scale-95 transition-all"
        >
          অফিসিয়াল NBR ওয়েবসাইটে যান <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#b91c1c]" /> সাধারণ জিজ্ঞাসা (FAQ)
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, RefreshCw, Calculator, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TradeLicensePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "ট্রেড লাইসেন্স করতে কোথায় আবেদন করতে হয়?",
      answer: "সিটি কর্পোরেশন, পৌরসভা অথবা ইউনিয়ন পরিষদ অফিসে (আপনার ব্যবসা প্রতিষ্ঠানের অবস্থান অনুযায়ী) ট্রেড লাইসেন্সের জন্য আবেদন করতে হয়। বর্তমানে অনেক সিটি কর্পোরেশন ও পৌরসভায় অনলাইনে ই-ট্রেড লাইসেন্স প্রদান করা হচ্ছে।"
    },
    {
      question: "ট্রেড লাইসেন্স নবায়ন না করলে কী হবে?",
      answer: "প্রতি বছর ৩০ জুনের মধ্যে ট্রেড লাইসেন্স নবায়ন করতে হয়। নবায়ন না করলে ব্যবসা অবৈধ বলে গণ্য হতে পারে এবং জরিমানা বা আইনানুগ ব্যবস্থা নেওয়া হতে পারে।"
    },
    {
      question: "ই-কমার্স বা অনলাইন ব্যবসার জন্য কি ট্রেড লাইসেন্স লাগে?",
      answer: "হ্যাঁ, যেকোনো ধরনের বৈধ ব্যবসার জন্য ট্রেড লাইসেন্স বাধ্যতামূলক। ই-কমার্স বা এফ-কমার্সের ক্ষেত্রেও সংশ্লিষ্ট সিটি কর্পোরেশন/ইউনিয়ন পরিষদ থেকে লাইসেন্স নিতে হবে।"
    },
    {
      question: "আবেদন ফি কত?",
      answer: "ব্যবসার ধরন ও মূলধনের ওপর ভিত্তি করে ট্রেড লাইসেন্স ফি নির্ধারিত হয়। এর সাথে সাইনবোর্ড কর, ১৫% ভ্যাট এবং অন্যান্য ফি যুক্ত হতে পারে।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#059669] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">ট্রেড লাইসেন্স</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            ট্রেড লাইসেন্স হলো ব্যবসা পরিচালনার আইনি অনুমতিপত্র। যেকোনো বৈধ ব্যবসা শুরু করার আগে এটি সংগ্রহ করা বাধ্যতামূলক।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "নতুন লাইসেন্স", icon: <FileText size={20} className="text-emerald-600" />, link: "#", bg: "bg-emerald-50" },
            { title: "নবায়ন", icon: <RefreshCw size={20} className="text-orange-500" />, link: "#", bg: "bg-orange-50" },
            { title: "আবেদন ফি", icon: <Calculator size={20} className="text-blue-500" />, link: "#", bg: "bg-blue-50" },
            { title: "ই-ট্রেড পোর্টাল", icon: <Globe size={20} className="text-purple-500" />, link: "https://ekpay.gov.bd/", bg: "bg-purple-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#059669]/30 hover:shadow-md transition-all"
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
            <Info size={18} className="text-[#059669]" /> প্রয়োজনীয় কাগজপত্র
          </h2>
          <ul className="space-y-3">
            {[
              "আবেদনকারীর ৩ কপি পাসপোর্ট সাইজ ছবি",
              "জাতীয় পরিচয়পত্র (NID) অথবা জন্ম নিবন্ধন সনদের কপি",
              "ব্যবসা প্রতিষ্ঠানের ভাড়ার চুক্তিপত্র (ভাড়া হলে) অথবা জমির পর্চা/দলিল (নিজস্ব হলে)",
              "হোল্ডিং ট্যাক্স পরিশোধের রশিদ",
              "অংশীদারি ব্যবসা হলে পার্টনারশিপ ডিড (Partnership Deed)",
              "কোম্পানি হলে মেমোরেন্ডাম অব আর্টিকেলস (MoA) ও ইনকর্পোরেশন সার্টিফিকেট"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#059669] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#059669] mb-2">
              <Calculator size={18} />
              <h3 className="font-bold text-sm text-slate-800">ফি ও চার্জ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ব্যবসার ধরন, এলাকা ও মূলধনের ওপর ভিত্তি করে ফি ২০০ টাকা থেকে শুরু করে সর্বোচ্চ কয়েক হাজার টাকা হতে পারে। সাথে ১৫% ভ্যাট প্রযোজ্য।
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#059669] mb-2">
              <RefreshCw size={18} />
              <h3 className="font-bold text-sm text-slate-800">নবায়ন</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রতি বছর ১ জুলাই থেকে ৩০ জুনের মধ্যে পূর্ববর্তী লাইসেন্স ও নবায়ন ফি জমা দিয়ে লাইসেন্স নবায়ন করতে হয়।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://bdris.gov.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#059669] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
        >
          সংশ্লিষ্ট কর্তৃপক্ষের পোর্টালে যান <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#059669]" /> সাধারণ জিজ্ঞাসা (FAQ)
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

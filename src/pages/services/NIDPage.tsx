import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, CreditCard, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NIDPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "নতুন ভোটার হতে কী কী লাগে?",
      answer: "জন্ম নিবন্ধন সনদ (অনলাইন কপি), নাগরিকত্ব সনদ, বাবা-মায়ের NID কপি, শিক্ষাগত যোগ্যতার সনদ (যদি থাকে), এবং ইউটিলিটি বিলের কপি।"
    },
    {
      question: "হারানো NID কার্ড কিভাবে তুলবো?",
      answer: "প্রথমে থানায় জিডি (GD) করতে হবে। এরপর অনলাইনে রি-ইস্যু বা হারানো কার্ড উত্তোলনের আবেদন করে ফি জমা দিলে নতুন কার্ড পাওয়া যাবে।"
    },
    {
      question: "NID কার্ড সংশোধন করতে কত দিন লাগে?",
      answer: "সংশোধনের ধরন অনুযায়ী সময় ভিন্ন হয়। সাধারণ ভুলের ক্ষেত্রে ১৫-৩০ কর্মদিবস এবং জটিল পরিবর্তনের ক্ষেত্রে ১-৩ মাস পর্যন্ত সময় লাগতে পারে।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#1e40af] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">জাতীয় পরিচয়পত্র (NID)</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            জাতীয় পরিচয়পত্র বা NID হলো বাংলাদেশের নাগরিকদের একটি অপরিহার্য পরিচয়পত্র, যা ভোটদান থেকে শুরু করে সকল রাষ্ট্রীয় ও নাগরিক সেবায় প্রয়োজন।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: "নতুন NID", icon: <User size={20} className="text-blue-500" />, link: "https://services.nidw.gov.bd/nid-pub/register-account", bg: "bg-blue-50" },
            { title: "সংশোধন", icon: <FileText size={20} className="text-orange-500" />, link: "https://services.nidw.gov.bd/nid-pub/claim-account", bg: "bg-orange-50" },
            { title: "হারানো NID", icon: <RefreshCw size={20} className="text-red-500" />, link: "https://services.nidw.gov.bd/nid-pub/claim-account", bg: "bg-red-50" },
            { title: "ঠিকানা পরিবর্তন", icon: <MapPin size={20} className="text-teal-500" />, link: "https://services.nidw.gov.bd/nid-pub/claim-account", bg: "bg-teal-50" },
            { title: "NID যাচাই", icon: <CheckCircle size={20} className="text-green-500" />, link: "https://services.nidw.gov.bd/nid-pub/voter-info", bg: "bg-green-50" },
            { title: "স্মার্ট কার্ড", icon: <CreditCard size={20} className="text-purple-500" />, link: "https://services.nidw.gov.bd/nid-pub/card-status", bg: "bg-purple-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#1e40af]/30 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center`}>
                {action.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">{action.title}</span>
            </a>
          ))}
        </div>

        {/* Required Documents for New NID */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <Info size={18} className="text-[#1e40af]" /> নতুন ভোটার হওয়ার শর্ত ও কাগজ
          </h2>
          <ul className="space-y-3">
            {[
              "বয়স ন্যূনতম ১৮ বছর হতে হবে",
              "জন্ম নিবন্ধন সনদ (অনলাইন/ডিজিটাল কপি)",
              "পিতা ও মাতার NID কার্ডের কপি",
              "নাগরিকত্ব সনদ (চেয়ারম্যান/মেয়র কর্তৃক)",
              "ইউটিলিটি বিলের কপি (বিদ্যুৎ/পানি/গ্যাস)",
              "শিক্ষাগত যোগ্যতার সনদ (যদি থাকে)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#1e40af] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#1e40af] mb-2">
              <AlertCircle size={18} />
              <h3 className="font-bold text-sm text-slate-800">ফি ও চার্জ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              নতুন নিবন্ধন: বিনামূল্যে<br/>
              সংশোধন: ধরন অনুযায়ী ২৩৫-৩৪৫ টাকা<br/>
              হারানো রি-ইস্যু: ৩৪৫ টাকা
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#1e40af] mb-2">
              <CreditCard size={18} />
              <h3 className="font-bold text-sm text-slate-800">স্মার্ট কার্ড স্ট্যাটাস</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ১০৫ নম্বরে কল করে অথবা অনলাইনে NID নম্বর দিয়ে স্মার্ট কার্ড তৈরি হয়েছে কি না জানা যাবে।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://services.nidw.gov.bd/nid-pub/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#1e40af] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          অফিসিয়াল ওয়েবসাইটে যান <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#1e40af]" /> সাধারণ জিজ্ঞাসা (FAQ)
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

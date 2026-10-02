import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, FileBadge, RefreshCw, Calculator, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DrivingLicensePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "লার্নার ড্রাইভিং লাইসেন্স পেতে কতদিন লাগে?",
      answer: "অনলাইনে বিএসপি পোর্টালে (BSP) সঠিকভাবে আবেদন করে ফি জমা দিলে সাথে সাথেই লার্নার ড্রাইভিং লাইসেন্স প্রিন্ট করা যায়।"
    },
    {
      question: "স্মার্ট কার্ড পেতে কি পরীক্ষা দিতে হয়?",
      answer: "হ্যাঁ, লার্নার লাইসেন্স পাওয়ার পর নির্ধারিত তারিখে লিখিত, মৌখিক এবং ফিল্ড টেস্ট (ড্রাইভিং পরীক্ষা) দিতে হয়। পরীক্ষায় উত্তীর্ণ হলে স্মার্ট কার্ডের জন্য আবেদন করা যায়।"
    },
    {
      question: "পেশাদার এবং অপেশাদার লাইসেন্সের পার্থক্য কী?",
      answer: "অপেশাদার লাইসেন্স শুধু ব্যক্তিগত গাড়ি চালানোর জন্য (মেয়াদ ১০ বছর)। পেশাদার লাইসেন্স দিয়ে ভাড়ায় চালিত বা বাণিজ্যিক গাড়ি চালানো যায়, এর জন্য বয়স কমপক্ষে ২০ (হালকা যানের ক্ষেত্রে) বা ২১ (ভারী যানের ক্ষেত্রে) হতে হয় এবং পুলিশ ভেরিফিকেশন লাগে (মেয়াদ ৫ বছর)।"
    },
    {
      question: "ড্রাইভিং লাইসেন্স নবায়ন করতে কী লাগে?",
      answer: "মেয়াদ শেষ হওয়ার আগেই নবায়নের আবেদন করতে হয়। এর জন্য ডোপ টেস্ট (পেশাদারদের জন্য), মেডিকেল সার্টিফিকেট এবং নির্ধারিত ফি জমা দিতে হয়।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#ea580c] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">ড্রাইভিং লাইসেন্স</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            BRTA কর্তৃক ইস্যুকৃত ড্রাইভিং লাইসেন্স যেকোনো মোটরযান চালানোর জন্য আইনত বাধ্যতামূলক। এটি আপনার দক্ষতা ও নাগরিক দায়িত্বের পরিচয়।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "লার্নার লাইসেন্স", icon: <FileText size={20} className="text-orange-500" />, link: "https://bsp.brta.gov.bd/login", bg: "bg-orange-50" },
            { title: "স্মার্ট লাইসেন্স", icon: <FileBadge size={20} className="text-blue-500" />, link: "https://bsp.brta.gov.bd/login", bg: "bg-blue-50" },
            { title: "নবায়ন", icon: <RefreshCw size={20} className="text-teal-500" />, link: "https://bsp.brta.gov.bd/login", bg: "bg-teal-50" },
            { title: "আবেদন ফি", icon: <Calculator size={20} className="text-rose-500" />, link: "http://www.brta.gov.bd/site/page/89b14de2-628f-4ed7-aef8-0cd0e2d31c4b", bg: "bg-rose-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#ea580c]/30 hover:shadow-md transition-all"
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
            <Info size={18} className="text-[#ea580c]" /> নতুন আবেদনের প্রয়োজনীয় কাগজপত্র
          </h2>
          <ul className="space-y-3">
            {[
              "জাতীয় পরিচয়পত্র (NID)",
              "রেজিস্টার্ড চিকিৎসকের দেওয়া মেডিকেল সার্টিফিকেট",
              "শিক্ষাগত যোগ্যতার সনদ (ন্যূনতম ৮ম শ্রেণি পাশ)",
              "পাসপোর্ট সাইজের ছবি (লার্নারের জন্য অনলাইনে আপলোড)",
              "ডোপ টেস্ট রিপোর্ট (পেশাদার লাইসেন্সের ক্ষেত্রে)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#ea580c] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#ea580c] mb-2">
              <Calculator size={18} />
              <h3 className="font-bold text-sm text-slate-800">লার্নার ফি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              একটি ক্যাটাগরি (যেমন শুধু মোটরসাইকেল): ৩৪৫ টাকা<br/>
              দুটি ক্যাটাগরি (মোটরসাইকেল ও হালকা যান): ৫১৮ টাকা
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#ea580c] mb-2">
              <FileCheck size={18} />
              <h3 className="font-bold text-sm text-slate-800">পরীক্ষা পদ্ধতি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              লার্নারে উল্লেখিত তারিখে লিখিত, মৌখিক এবং প্র্যাকটিক্যাল টেস্ট দিতে হবে।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://bsp.brta.gov.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#ea580c] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          BSP পোর্টালে আবেদন করুন <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#ea580c]" /> সাধারণ জিজ্ঞাসা (FAQ)
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

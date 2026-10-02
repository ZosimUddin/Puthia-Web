import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Info, FileText, Search, Download, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PoliceClearancePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "পুলিশ ক্লিয়ারেন্স পেতে কত দিন লাগে?",
      answer: "সাধারণত আবেদন করার পর ৭-১৫ কর্মদিবসের মধ্যে পুলিশ ক্লিয়ারেন্স সার্টিফিকেট পাওয়া যায়। তবে বিশেষ ক্ষেত্রে আরও কিছু সময় লাগতে পারে।"
    },
    {
      question: "আবেদন ফি কত এবং কীভাবে জমা দেব?",
      answer: "পুলিশ ক্লিয়ারেন্স এর সরকারি ফি ৫০০ টাকা। এই ফি বাংলাদেশ ব্যাংক অথবা সোনালী ব্যাংকের যেকোনো শাখায় ট্রেজারি চালানের মাধ্যমে অথবা অনলাইনে এ-চালান এর মাধ্যমে জমা দেওয়া যায়।"
    },
    {
      question: "প্রবাসী বাংলাদেশীরা কীভাবে আবেদন করবেন?",
      answer: "প্রবাসী বাংলাদেশীরা বাংলাদেশ দূতাবাস বা হাই কমিশনের মাধ্যমে অথবা দেশে অবস্থানরত আত্মীয়ের মাধ্যমে প্রয়োজনীয় কাগজপত্র (পাসপোর্টের সত্যায়িত কপি) জমা দিয়ে আবেদন করতে পারবেন।"
    },
    {
      question: "পুলিশ ক্লিয়ারেন্স এর মেয়াদ কতদিন থাকে?",
      answer: "পুলিশ ক্লিয়ারেন্স সার্টিফিকেটের মেয়াদ সাধারণত ইস্যুর তারিখ থেকে ৬ মাস পর্যন্ত কার্যকর থাকে।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafcfb] pb-20 font-sans">
      {/* Header */}
      <div className="bg-[#1e3a8a] px-4 pt-4 pb-12 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-black text-white">পুলিশ ক্লিয়ারেন্স</h1>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white">
          <p className="text-sm opacity-90 leading-relaxed">
            বিদেশে যাওয়া, চাকরি বা অন্যান্য সরকারি-বেসরকারি কাজে আপনার নামে কোনো অপরাধমূলক রেকর্ড নেই, তা প্রমাণের জন্য পুলিশ ক্লিয়ারেন্স সার্টিফিকেট প্রয়োজন হয়।
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: "নতুন আবেদন", icon: <FileText size={20} className="text-blue-600" />, link: "https://pcc.police.gov.bd/en/", bg: "bg-blue-50" },
            { title: "আবেদন ট্র্যাকিং", icon: <Search size={20} className="text-orange-500" />, link: "https://pcc.police.gov.bd/en/check_status.php", bg: "bg-orange-50" },
            { title: "ডাউনলোড", icon: <Download size={20} className="text-green-600" />, link: "https://pcc.police.gov.bd/en/check_status.php", bg: "bg-green-50" },
            { title: "এ-চালান পেমেন্ট", icon: <CreditCard size={20} className="text-purple-500" />, link: "https://echallan.gov.bd/", bg: "bg-purple-50" },
          ].map((action, idx) => (
            <a 
              key={idx} 
              href={action.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2 hover:border-[#1e3a8a]/30 hover:shadow-md transition-all"
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
            <Info size={18} className="text-[#1e3a8a]" /> প্রয়োজনীয় কাগজপত্র
          </h2>
          <ul className="space-y-3">
            {[
              "আবেদনকারীর পাসপোর্টের তথ্য পাতার স্ক্যান কপি (যাতে মেয়াদ উল্লেখ আছে)",
              "জাতীয় পরিচয়পত্র (NID) অথবা জন্ম নিবন্ধন সনদের কপি",
              "প্রথম শ্রেণীর গেজেটেড কর্মকর্তা দ্বারা সত্যায়িত ছবি (অনলাইনে আপলোড)",
              "ঠিকানার প্রমাণপত্র (যেমন: বিদ্যুৎ/গ্যাস বিলের কপি, চেয়ারম্যানের সনদ)",
              "ব্যাংকে বা এ-চালানে ফি জমার রসিদের স্ক্যান কপি",
              "প্রবাসী হলে দূতাবাসের সত্যায়ন (প্রযোজ্য ক্ষেত্রে)"
            ].map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle size={16} className="text-[#1e3a8a] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#1e3a8a] mb-2">
              <CreditCard size={18} />
              <h3 className="font-bold text-sm text-slate-800">আবেদন ফি</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              সরকারি ফি ৫০০ টাকা (ভ্যাট/ট্যাক্স বাদে)। কোড নম্বর: ১-৭৩০১-০০০১-২৬৮১ এ চালান করতে হবে।
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-[#1e3a8a] mb-2">
              <ShieldCheck size={18} />
              <h3 className="font-bold text-sm text-slate-800">ভেরিফিকেশন</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              পুলিশ আপনার প্রদত্ত ঠিকানা এবং নথিপত্র যাচাই করবে, এরপর আপনার ক্লিয়ারেন্স অনুমোদন হবে।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href="https://pcc.police.gov.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#1e3a8a] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
        >
          অফিসিয়াল পোর্টালে যান <ExternalLink size={16} />
        </a>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-[#1e3a8a]" /> সাধারণ জিজ্ঞাসা (FAQ)
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

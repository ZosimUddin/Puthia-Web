import React, { useState } from 'react';
import { ArrowLeft, Leaf, AlertCircle, Calendar, Sparkles, PhoneCall, HelpCircle, CheckCircle2 } from 'lucide-react';

interface CropAdvice {
  title: string;
  symptoms: string;
  remedy: string;
  period: string;
  fertilizer: string;
}

const CROP_ADVICE_DATA: Record<string, CropAdvice[]> = {
  paddy: [
    {
      title: "🌾 ধানের পাতা ব্লাস্ট রোগ (Blast Disease)",
      symptoms: "পাতায় চোখের মতো ধূসর দাগ দেখা দেয় এবং দাগগুলোর চারপাশ বাদামী রঙের হয়। পরবর্তীতে ধান গাছের গিঁট ও শীষ পচে ভেঙে পড়ে।",
      remedy: "আক্রান্ত জমিতে ৫ গ্রাম ট্রাইসাইক্লাজল জাতীয় ছত্রাকনাশক (যেমন: ট্রুপার বা ট্রাইসাইক্লোল) প্রতি ১০ লিটার পানিতে মিশিয়ে ৫ শতাংশ জমিতে স্প্রে করুন। জমিতে পটাশ সারের মাত্রা বাড়াতে হবে।",
      period: "রোপণের ৩০-৬০ দিন পর (আর্দ্র আবহাওয়া ও ঠান্ডা বাতাসে বেশি ছড়ায়)",
      fertilizer: "ইউরিয়া: ১৫ কেজি, টিএসপি: ৮ কেজি, এমওপি: ১২ কেজি প্রতি বিঘা।"
    },
    {
      title: "🐛 ধানের মাজরা পোকা দমন (Stem Borer)",
      symptoms: "মাজরা পোকা ধানের কুশির ভেতরের কচি অংশ খেয়ে ফেলে। ফলে শীষ সাদা হয়ে যায় (মরা শীষ বা ডেড হার্ট)।",
      remedy: "মাঠে হেক্টর প্রতি ৫০টি ডালপালা বা বাঁশের কঞ্চি পুঁতে পোকাখেকো পাখি বসার ব্যবস্থা (পার্চিং) করুন। আক্রমণ তীব্র হলে কার্টাপ বা ফিপ্রোনিল জাতীয় দানাদার কীটনাশক ব্যবহার করুন।",
      period: "কুশি গজানোর সময় থেকে দুধ আসা পর্যন্ত",
      fertilizer: "জৈব সার ব্যবহারের পাশাপাশি পরিমিত মাত্রায় দস্তা ও জিপসাম প্রয়োগ করুন।"
    }
  ],
  mango: [
    {
      title: "🥭 আমের হপার পোকা ও অ্যানথ্রাকনোজ দমন",
      symptoms: "মুকুল আসার পর ছোট হপার পোকা রস চুষে নেয়, ফলে মুকুল শুকিয়ে যায়। অ্যানথ্রাকনোজের কারণে কচি আমে কালো দাগ পড়ে ও ঝরে যায়।",
      remedy: "আমের মুকুল যখন কুঁড়ি অবস্থায় থাকে তখন প্রথমবার এবং আম মোটরদানা সমান হলে দ্বিতীয়বার ইমিডাক্লোপ্রিড (যেমন: এডমায়ার) ও ম্যানকোজেব জাতীয় ছত্রাকনাশক একত্রে স্প্রে করুন।",
      period: "জানুয়ারি থেকে এপ্রিল (মুকুল ও কচি গুটি আসার সময়)",
      fertilizer: "গাছের বয়স ভেদে ১০-১৫ কেজি গোবর সার, ২ কেজি ইউরিয়া, ১.৫ কেজি টিএসপি, ২ কেজি পটাশ গাছের চারপাশের বৃত্তাকার নালায় দিন।"
    },
    {
      title: "🥭 আমের গুটি বা ফল ঝরে যাওয়া রোধ",
      symptoms: "আমের কচি গুটি অতিরিক্ত তাপ বা খরায় বোঁটা শুকিয়ে কালচে হয়ে নিজে থেকেই ঝরে পড়ে।",
      remedy: "গুটি মার্বেল আকৃতির হলে গাছের গোড়ায় পর্যাপ্ত সেচ দিন। ভোরে বা সন্ধ্যায় প্রতি লিটার পানিতে ২ মিলি লিটোসেন বা প্ল্যানোফিক্স হরমোন মিশিয়ে হালকা স্প্রে করতে পারেন।",
      period: "মার্চ থেকে মে (ফল পুষ্ট হওয়ার সময়)",
      fertilizer: "বোরন সার বিঘা প্রতি ১.৫ কেজি হারে প্রয়োগ করলে গুটি ঝরে যাওয়া অনেক কমে যায়।"
    }
  ],
  vegetable: [
    {
      title: "🥒 করলা ও লাউয়ের ফল ছিদ্রকারী পোকা (Fruit Fly)",
      symptoms: "স্ত্রী মাছি পোকা কচি ফলের নিচে ডিম পাড়ে। কীড়া বের হয়ে ভেতরের অংশ খেয়ে ফেলায় ফল পচে অকালেই হলুদ হয়ে ঝরে পড়ে।",
      remedy: "সবচেয়ে নিরাপদ ও কার্যকর পদ্ধতি হলো বিষটোপ ও সেক্স ফেরোমন ফাঁদ ব্যবহার করা। প্রতি বিঘা জমিতে ১০-১২টি ফেরোমন ফাঁদ সমান দূরত্বে স্থাপন করুন।",
      period: "বারোমাসি ফলন চলাকালীন",
      fertilizer: "কম্পোস্ট ও ট্রাইকো-কম্পোস্টের ব্যবহার বাড়ান যা মাটির উর্বরতা বাড়ায় ও সবজি সুস্বাদু করে।"
    }
  ],
  betel: [
    {
      title: "🍃 পানের লতা পচা ও গোড়া পচা রোগ",
      symptoms: "পানের গোড়ায় ছত্রাকের আক্রমণে লতা পচে যায় ও পাতা দ্রুত ঝরে পড়ে। পুরো বরজ বা পান ক্ষেত বিনষ্ট হওয়ার ঝুঁকি থাকে।",
      remedy: "বরজের চারপাশ পরিষ্কার রাখুন এবং পানি নিষ্কাশন ব্যবস্থা উন্নত করুন। আক্রান্ত গাছে প্রতি লিটার পানিতে ২ গ্রাম অটোস্টিন বা প্রোভ্যাক্স মিশিয়ে লতা ও গোড়ায় স্প্রে করুন।",
      period: "বর্ষাকাল ও আর্দ্র ঠান্ডা আবহাওয়া",
      fertilizer: "পানের বরজে খৈল পচা পানি ও পরিমিত ছাই ব্যবহার অত্যন্ত উপকারী।"
    }
  ]
};

const COMMON_FARM_QUESTIONS = [
  {
    q: "আমার ধানের পাতা কেন হলুদ হয়ে যাচ্ছে ভাই?",
    a: "ধানের পাতা হলুদ হওয়ার প্রধান দুটি কারণ হতে পারে: নাইট্রোজেনের (ইউরিয়া) অভাব অথবা শিকড় পচা রোগ। যদি নিচে থেকে পাতা হলুদ হওয়া শুরু করে তবে হালকা ইউরিয়া সার ছিটিয়ে সেচ দিন। আর যদি গোড়ায় কালো পচন দেখা যায়, তবে পানি সরিয়ে দিয়ে জমিতে কার্বেন্ডাজিম জাতীয় ছত্রাকনাশক স্প্রে করুন।"
  },
  {
    q: "আমের মুকুল ঝরে পড়া রুখতে কী করতে পারি?",
    a: "আমের মুকুল যখন কুঁড়ির মতো বের হয়, তখন হালকা কুয়াশা ও মেঘলা আবহাওয়ায় পাউডারি মিলডিউ ও হপার পোকা মারাত্মক ক্ষতি করে। এজন্য মুকুল ফোটার আগে একবার ইমিডাক্লোপ্রিড ও সালফার জাতীয় ছত্রাকনাশক মিশিয়ে হালকাভাবে পুরো গাছে স্প্রে করুন। মনে রাখবেন, ফুল ফোটা অবস্থায় কখনো স্প্রে করবেন না।"
  },
  {
    q: "সবজি চাষে বিষমুক্ত জৈব কীটনাশক কীভাবে তৈরি করব?",
    a: "আপনার বাড়িতেই সহজে নিম পাতার নির্যাস দিয়ে জৈব বালাইনাশক তৈরি করতে পারেন। ১ কেজি নিম পাতা ১০ লিটার পানিতে সিদ্ধ করে ঠাণ্ডা করুন। এর সাথে সামান্য সাবানের গুঁড়ো মিশিয়ে সবজি গাছে স্প্রে করলে জাবপোকা, থ্রিপস ও কচি লতার ল্যাদা পোকা দূর হয়ে যাবে।"
  }
];

export const AgriAdviceInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'paddy' | 'mango' | 'vegetable' | 'betel'>('paddy');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Chatbot states
  const [chatQuestion, setChatQuestion] = useState<string | null>(null);
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);

  const selectedAdvice = CROP_ADVICE_DATA[activeTab];

  const handleAskQuestion = (q: string, a: string) => {
    setChatQuestion(q);
    setChatAnswer(null);
    // Add a slight typing delay for realistic interaction
    setTimeout(() => {
      setChatAnswer(a);
    }, 450);
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in" id="agri-advice-view">
      {/* Premium Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}
      >
        <button 
          onClick={onGoBack} 
          id="agri-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            আধুনিক কৃষি ও প্রযুক্তি
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">ফসল চাষের বিশেষজ্ঞ পরামর্শ</h1>
          <p className="text-emerald-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-emerald-400 pl-3 py-1">
             পুঠিয়ার মাটি ও আবহাওয়ার উপযোগী ফসল, রোগবালাই প্রতিকার, সুষম সার ব্যবহার এবং বৈজ্ঞানিক চাষাবাদের ফ্রি ডিজিটাল পরামর্শ কেন্দ্র।
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      {/* Grid Filter Icons */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { id: 'paddy', label: 'ধান চাষ', icon: '🌾' },
          { id: 'mango', label: 'আম-লিচু', icon: '🥭' },
          { id: 'vegetable', label: 'সবজি চাষ', icon: '🥒' },
          { id: 'betel', label: 'পান বরজ', icon: '🍃' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery('');
            }}
            className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg block mb-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Advice Display */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-gray-800 text-base px-1 flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-emerald-600 animate-pulse" /> রোগবালাই লক্ষণ ও বিশেষজ্ঞ প্রতিকার
        </h3>

        <div className="space-y-4">
          {selectedAdvice.map((advice, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
              
              <div className="flex flex-col gap-3.5 pl-2">
                <h4 className="font-bold text-gray-800 text-base">{advice.title}</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                    <span className="font-bold text-red-800 flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" /> রোগের লক্ষণসমূহ:
                    </span>
                    <p className="text-gray-600 leading-relaxed text-justify">{advice.symptoms}</p>
                  </div>

                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> বিজ্ঞানসম্মত সমাধান ও ওষুধ:
                    </span>
                    <p className="text-gray-700 leading-relaxed text-justify">{advice.remedy}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-400 text-[10px]">⏰ আক্রমণের সময়</span>
                      <span>{advice.period}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                      <span className="text-gray-400 text-[10px]">🧪 সার মাত্রা (বিঘা প্রতি)</span>
                      <span>{advice.fertilizer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Farm Advisory Consultation Block */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-4 border border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-zinc-950 p-1.5 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">ডিজিটাল কৃষি মৈত্রী</h3>
            <span className="text-[10px] text-emerald-400 font-bold block">২৪/৭ কুইক এগ্রি অ্যাসিস্ট্যান্ট</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          আপনার ফসলের সাধারণ রোগ বা কোনো সমস্যার দ্রুত উত্তরের জন্য নিচের যেকোনো একটি প্রশ্নে ট্যাপ করুন ভাই:
        </p>

        {/* Dynamic Buttons */}
        <div className="flex flex-col gap-2">
          {COMMON_FARM_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(item.q, item.a)}
              className="text-left text-xs bg-zinc-800 hover:bg-zinc-700/80 p-3 rounded-xl transition border border-zinc-800 font-medium flex items-start gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item.q}</span>
            </button>
          ))}
        </div>

        {/* Animated Question & Response box */}
        {chatQuestion && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <div className="bg-zinc-800 p-3 rounded-xl text-xs font-semibold text-zinc-200">
              👤 আপনি জিজ্ঞাসা করেছেন: "{chatQuestion}"
            </div>

            <div className="bg-emerald-950/40 border border-emerald-900/40 p-4 rounded-xl text-xs leading-relaxed space-y-2">
              <span className="font-bold text-emerald-400 block">🌿 কৃষি পরামর্শক সমাধান:</span>
              {chatAnswer ? (
                <p className="text-zinc-300 text-justify animate-fade-in">{chatAnswer}</p>
              ) : (
                <div className="flex items-center gap-2 text-zinc-400 font-bold">
                  <span className="animate-pulse">মৈত্রী লিখছে...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

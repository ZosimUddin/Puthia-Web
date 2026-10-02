import React, { useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { ArrowLeft, Building2, History, Clock, Ticket, Trophy, CheckCircle2, AlertCircle, Copy, Share2, HelpCircle } from "lucide-react";

const palaceSections = [
  {
    id: "overview",
    label: "🏛️ প্রাসাদ পরিচিতি",
    title: "পুঠিয়া রাজবাড়ী (পাঁচআনি প্রাসাদ)",
    description: "১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী তাঁর শাশুড়ি শরৎসুন্দরী দেবীর প্রতি সম্মান জানিয়ে এই অনবদ্য দ্বিতল রাজপ্রাসাদটি নির্মাণ করেন। এটি ইন্দো-ইউরোপীয় স্থাপত্য ও প্রাচীন গ্রিক-রোমান কলাম শৈলীর সংমিশ্রণে তৈরি এক অনন্য সৃষ্টি।",
    highlights: [
      { title: "স্থাপত্যশৈলী", value: "গ্রিক রেনেসাঁ ও করিন্থিয়ান কলাম বিশিষ্ট তোরণ" },
      { title: "বেষ্টনী দিঘি", value: "নিরাপত্তা ও সৌন্দর্যের জন্য চারপাশের বিশাল লেক" },
      { title: "অন্দরমহল", value: "রানী মহল, সিংহ দুয়ার ও সুরক্ষিত কোষাগার কক্ষ" },
      { title: "নির্মাণ উপাদান", value: "চুন-সুরকি, পোড়ামাটির ইট ও লোহার মজবুত গার্ডার" }
    ],
    funFact: "প্রাসাদের সম্মুখভাগের বিশাল কলামগুলো প্রাচীন গ্রিক ‘করিন্থিয়ান’ শৈলীর আদলে তৈরি, যা তৎকালীন জমিদারি স্থাপত্যে অত্যন্ত বিরল ছিল।"
  },
  {
    id: "history",
    label: "👑 রাজবংশের ইতিহাস",
    title: "পুঠিয়া রাজবংশের গৌরবগাথা",
    description: "মুঘল সম্রাট আকবরের আমলে রাজা পিতাম্বর কর্তৃক পুঠিয়া রাজবংশের গোড়াপত্তন ঘটে। তৎকালীন রাজশাহী অঞ্চলের সবচেয়ে প্রাচীন এবং প্রভাবশালী জমিদার পরিবার ছিল এটি। পরবর্তীতে জমিদারি পাঁচআনি ও এগারোআনি এই দুই ভাগে বিভক্ত হয়।",
    highlights: [
      { title: "প্রতিষ্ঠাতা", value: "রাজা পিতাম্বর (১৫৮০ সালের দিকে জমিদারি লাভ)" },
      { title: "মহারানী শরৎসুন্দরী", value: "পরম দয়ালু ও প্রজাবৎসল রানী, ব্রিটিশ সরকার কর্তৃক ‘মহারানী’ উপাধি প্রাপ্ত" },
      { title: "শেষ জমিদার", value: "রাজা যোগেন্দ্রনাথ রায় বাহাদুর (১৯৫০ সালে জমিদারি বিলুপ্তি)" },
      { title: "ঐতিহাসিক দান", value: "উত্তরবঙ্গের শিক্ষা ও জনকল্যাণে রাজপরিবারের অতুলনীয় ভূমিকা" }
    ],
    funFact: "মহারানী শরৎসুন্দরী দেবীকে তাঁর অতুলনীয় সমাজসেবা ও দানশীলতার জন্য প্রজারা ‘জীবন্ত দেবী’ বলে মনে করত।"
  },
  {
    id: "rooms",
    label: "🚪 কক্ষ ও অভ্যন্তরীণ ট্যুর",
    title: "প্রাসাদের অভ্যন্তরীণ কক্ষ",
    description: "বিশাল রাজপ্রাসাদের ভেতরে রয়েছে অনেকগুলো সুসজ্জিত কক্ষ, যা রাজকীয় কাচারি, বিনোদন এবং প্রশাসনিক কাজের জন্য ব্যবহৃত হতো। অন্দরমহলে রয়েছে রানীদের জন্য বিশেষ সুরক্ষিত মহল।",
    highlights: [
      { title: "কাচারি ঘর", value: "যেখানে প্রজাদের অভিযোগ শোনা হতো এবং খাজনা আদায় চলত" },
      { title: "জলসা ঘর / নাচঘর", value: "সাংস্কৃতিক অনুষ্ঠান ও বাঈজি নাচের জন্য ব্যবহৃত বিশেষ হলরুম" },
      { title: "কোষাগার", value: "রাজ্যের সোনা, রুপা ও মহামূল্যবান দলিল রাখার গুপ্ত কক্ষ" },
      { title: "সিংহ তোরণ", value: "প্রাসাদের মূল ফটক যা হাতি ও ঘোড়া নিয়ে প্রবেশের উপযোগী ছিল" }
    ],
    funFact: "প্রাসাদের নিচে একটি গোপন সুড়ঙ্গ পথ ছিল যা দিয়ে জরুরি মুহূর্তে রানীরা ও রাজপরিবারের সদস্যরা দিঘি পেরিয়ে নিরাপদ স্থানে যেতে পারতেন।"
  },
  {
    id: "timing",
    label: "⏰ সময় ও প্রবেশ মূল্য",
    title: "পরিদর্শন সময় ও টিকিট তথ্য",
    description: "প্রত্নতত্ত্ব অধিদপ্তর কর্তৃক পুঠিয়া রাজবাড়ী সংরক্ষিত ঐতিহাসিক স্থান হিসেবে ঘোষিত হয়েছে। এটি সপ্তাহের প্রায় সবদিনই দর্শনার্থীদের জন্য উন্মুক্ত থাকে।",
    highlights: [
      { title: "গ্রীষ্মকালীন সময়", value: "সকাল ১০:০০ টা থেকে বিকেল ৬:০০ টা (মঙ্গলবার-শনিবার)" },
      { title: "শীতকালীন সময়", value: "সকাল ৯:০০ টা থেকে বিকেল ৫:০০ টা (মঙ্গলবার-শনিবার)" },
      { title: "সাপ্তাহিক বন্ধ", value: "প্রতি রবিবার পূর্ণ দিবস এবং সোমবার অর্ধ-দিবস (দুপুর ২টা পর্যন্ত বন্ধ)" },
      { title: "টিকিট মূল্য", value: "দেশি দর্শনার্থী: ৩০ টাকা, শিক্ষার্থী: ১০ টাকা, সার্কভুক্ত দেশ: ১০০ টাকা, বিদেশি: ৫০০ টাকা" }
    ],
    funFact: "৫ বছরের কম বয়সী শিশুদের জন্য কোনো প্রবেশ টিকিটের প্রয়োজন হয় না এবং রাজবাড়ী চত্বরে প্রবেশের জন্য কোনো ফি নেই, শুধু মূল প্রাসাদে ঢুকতেই টিকিটের প্রয়োজন।"
  }
];

const quizQuestions = [
  {
    question: "পুঠিয়া রাজবাড়ীর মূল প্রাসাদটি (পাঁচআনি প্রাসাদ) কত সালে নির্মিত হয়?",
    options: ["১৮২০ সালে", "১৮৯৫ সালে", "১৯১০ সালে", "১৫৮০ সালে"],
    correctIndex: 1,
    explanation: "১৮৯৫ সালে মহারানী হেমন্ত কুমারী দেবী তাঁর শাশুড়ি শরৎসুন্দরী দেবীর স্মৃতি স্মারক হিসেবে এই মূল রাজপ্রাসাদটি নির্মাণ করান।"
  },
  {
    question: "পুঠিয়া রাজবংশের প্রতিষ্ঠাতা কে ছিলেন?",
    options: ["রাজা পিতাম্বর", "রাজা যোগেন্দ্রনাথ", "মহারানী শরৎসুন্দরী", "রাজা আনন্দ নারায়ণ"],
    correctIndex: 0,
    explanation: "মুঘল আমলে (১৫৮০ সালের দিকে) রাজা পিতাম্বর লস্করপুরের জমিদারি লাভ করে পুঠিয়া রাজবংশের গোড়াপত্তন করেন।"
  },
  {
    question: "প্রাসাদের কলামগুলো কোন প্রাচীন স্থাপত্যশৈলীর আদলে নির্মিত?",
    options: ["মুঘল শৈলী", "গ্রিক করিন্থিয়ান শৈলী", "পারসিয়ান শৈলী", "পাল রাজবংশ শৈলী"],
    correctIndex: 1,
    explanation: "পুঠিয়া রাজবাড়ীর সামনের তোরণের বিশাল কলামগুলো গ্রিক রেনেসাঁ ও করিন্থিয়ান শৈলীর আদলে তৈরি।"
  }
];

interface PuthiaRajbariInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function PuthiaRajbariInfo({ onGoBack, hideHeader = false }: PuthiaRajbariInfoProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentSection = palaceSections.find((s) => s.id === activeTab) || palaceSections[0];

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === quizQuestions[quizIndex].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleCopyShare = async () => {
    const text = `পুঠিয়া রাজবাড়ী (পাঁচআনি প্রাসাদ) - বাংলাদেশের অন্যতম প্রাচীন ও নান্দনিক গ্রিক-রোমান স্থাপত্য।\nপরিদর্শন সময়: সকাল ১০:০০ - বিকাল ৬:০০ টা (রবিবার বন্ধ)। প্রবেশ টিকিট ৩০ টাকা।`;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8 font-sans" id="puthia-rajbari-section">
      {/* 1. Enhanced Hero Banner */}
      {!hideHeader && (
        <div 
          className="p-8 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #15803D, #064E3B)" }}
        >
          <div className="space-y-3 max-w-2xl text-left">
            <span className="bg-white/20 backdrop-blur-md text-yellow-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              ঐতিহাসিক রাজকীয় স্থাপত্য
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-white">
              পুঠিয়া রাজবাড়ী
            </h1>
            <p className="text-white/95 text-sm md:text-base leading-relaxed text-justify">
              করিন্থিয়ান স্তম্ভ, সিংহদ্বারি গেট এবং সুগভীর পরিখার মেলবন্ধনে রচিত উত্তরবঙ্গের এক অনুপম রাজপ্রাসাদ। পুঠিয়া উপজেলার প্রাণকেন্দ্রে অবস্থিত এই পাঁচআনি রাজবাড়ী আজও জমিদারি আমলের প্রাচীন শাসন ও ঐশ্বর্যের পরিচয় বহন করে।
            </p>
            
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={onGoBack}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border border-white/25 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </button>
              <button 
                onClick={handleCopyShare}
                className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> কপি হয়েছে!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> তথ্য কপি করুন
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Floating Stat Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[150px] shrink-0 self-stretch flex flex-col justify-center">
            <p className="text-xs text-green-200 uppercase font-semibold">প্রতিষ্ঠিত</p>
            <p className="text-3xl font-serif font-black text-yellow-300">১৮৯৫</p>
            <p className="text-[10px] text-white/80 mt-1">মহারানী হেমন্ত কুমারী</p>
          </div>
        </div>
      )}

      {/* 2. Custom Styled Tabs */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 4px", marginBottom: "20px" }}>
        {palaceSections.map((sec) => {
          const isActive = activeTab === sec.id;
          return (
            <div
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              style={{
                flex: 1,
                minWidth: 0,
                background: isActive ? "#eff6ff" : "#ffffff",
                color: isActive ? "#1e3a8a" : "#1e293b",
                border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                padding: "10px 2px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover:border-blue-400 hover:shadow-sm flex flex-col items-center justify-center group"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isActive ? 'bg-blue-100' : 'bg-slate-50'} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                <span className="text-lg">
                  {sec.id === "overview" && "🏛️"}
                  {sec.id === "history" && "👑"}
                  {sec.id === "rooms" && "🚪"}
                  {sec.id === "timing" && "⏰"}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                {sec.label.replace(/^[^\s]+\s+/, '')}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Tab Specific Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="text-[#15803D] w-6 h-6" /> {currentSection.title}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed text-justify font-medium">
            {currentSection.description}
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentSection.highlights.map((item, idx) => (
            <div key={idx} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors duration-200">
              <h4 className="font-bold text-[#15803D] text-sm md:text-base flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {item.title}
              </h4>
              <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed font-medium">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Fun Fact Area */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">
            💡
          </div>
          <div>
            <h5 className="font-bold text-amber-800 text-sm">আপনি কি জানেন? (আকর্ষণীয় তথ্য)</h5>
            <p className="text-xs text-amber-700/90 mt-1 leading-relaxed font-medium text-justify">
              {currentSection.funFact}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Quick Quiz (Gamification) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400 w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-white">স্মার্ট কুইজ: রাজবাড়ীর ইতিহাস</h3>
              <p className="text-slate-400 text-xs font-medium">পুঠিয়া রাজপরিবার ও প্রাসাদের গৌরবময় ইতিহাস কতটুকু জানেন? পরীক্ষা করুন!</p>
            </div>
          </div>

          {!quizCompleted ? (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b border-slate-700/50 pb-2">
                <span>প্রশ্ন: {quizIndex + 1} / {quizQuestions.length}</span>
                <span className="text-yellow-400">অর্জিত স্কোর: {score}</span>
              </div>

              <h4 className="font-bold text-sm md:text-base text-slate-100 leading-relaxed text-justify">
                {quizQuestions[quizIndex].question}
              </h4>

              <div className="space-y-2 pt-2">
                {quizQuestions[quizIndex].options.map((opt, idx) => {
                  let optStyle = "bg-slate-700/40 hover:bg-slate-700 border-slate-600 text-slate-200";
                  if (isAnswered) {
                    if (idx === quizQuestions[quizIndex].correctIndex) {
                      optStyle = "bg-green-900/60 border-green-500 text-green-100 font-bold";
                    } else if (idx === selectedOption) {
                      optStyle = "bg-red-900/60 border-red-500 text-red-100";
                    } else {
                      optStyle = "bg-slate-800 border-slate-700 text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full p-3.5 text-left text-xs md:text-sm rounded-xl border transition-all flex items-center justify-between font-medium cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === quizQuestions[quizIndex].correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== quizQuestions[quizIndex].correctIndex && (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="p-3.5 bg-slate-850 rounded-xl border border-slate-700/40 mt-3 text-xs text-slate-300 leading-relaxed text-justify font-medium">
                  <span className="font-bold text-yellow-400 block mb-1">ব্যাখ্যা:</span>
                  {quizQuestions[quizIndex].explanation}
                  <button
                    onClick={handleNextQuestion}
                    className="mt-4 w-full bg-[#15803D] hover:bg-green-700 text-white font-bold py-2 rounded-lg transition text-xs shadow-md cursor-pointer"
                  >
                    {quizIndex === quizQuestions.length - 1 ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 text-center space-y-4">
              <span className="text-5xl block">🎉</span>
              <h4 className="font-serif font-bold text-xl">কুইজ সম্পন্ন হয়েছে!</h4>
              <p className="text-slate-300 text-sm font-semibold">
                আপনার স্কোর: <span className="text-yellow-400 text-xl font-bold">{score} / {quizQuestions.length}</span>
              </p>
              
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                {score === quizQuestions.length 
                  ? "চমৎকার! আপনি পুঠিয়া রাজবাড়ীর ইতিহাস সম্পর্কে অত্যন্ত নিখুঁত জ্ঞান রাখেন।" 
                  : "ভালো চেষ্টা! আরও একবার খেলে পুঠিয়া রাজবাড়ীর সমৃদ্ধ ইতিহাস শিখে নিতে পারেন।"
                }
              </p>

              <button
                onClick={handleRestartQuiz}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-lg transition cursor-pointer"
              >
                আবার খেলুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

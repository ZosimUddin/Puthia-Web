import React from 'react';
import { Trophy } from 'lucide-react';

interface UpazilaQuizProps {
  quizSubTab: string;
  setQuizSubTab: (tab: string) => void;
  interactiveQuizActive: boolean;
  setInteractiveQuizActive: (active: boolean) => void;
  currentQuizQuestionIndex: number;
  setCurrentQuizQuestionIndex: (index: number | ((prev: number) => number)) => void;
  selectedQuizAnswers: Record<number, number>;
  setSelectedQuizAnswers: (answers: Record<number, number> | ((prev: Record<number, number>) => Record<number, number>)) => void;
  quizScore: number | null;
  setQuizScore: (score: number | null) => void;
  photoContestName: string;
  setPhotoContestName: (name: string) => void;
  photoContestPhone: string;
  setPhotoContestPhone: (phone: string) => void;
  photoContestTitle: string;
  setPhotoContestTitle: (title: string) => void;
  photoContestDesc: string;
  setPhotoContestDesc: (desc: string) => void;
  megaContestRegistered: boolean;
  setMegaContestRegistered: (registered: boolean) => void;
  showMegaRegModal: boolean;
  setShowMegaRegModal: (show: boolean) => void;
  onGoBack: () => void;
}

export function UpazilaQuiz({
  quizSubTab,
  setQuizSubTab,
  interactiveQuizActive,
  setInteractiveQuizActive,
  currentQuizQuestionIndex,
  setCurrentQuizQuestionIndex,
  selectedQuizAnswers,
  setSelectedQuizAnswers,
  quizScore,
  setQuizScore,
  photoContestName,
  setPhotoContestName,
  photoContestPhone,
  setPhotoContestPhone,
  photoContestTitle,
  setPhotoContestTitle,
  photoContestDesc,
  setPhotoContestDesc,
  megaContestRegistered,
  setMegaContestRegistered,
  showMegaRegModal,
  setShowMegaRegModal,
  onGoBack
}: UpazilaQuizProps) {
  const PUTHIA_QUESTIONS = [
    {
      question: "১. পুঠিয়া মন্দির কমপ্লেক্সটি বাংলাদেশের কোন জেলায় অবস্থিত?",
      options: ["নাটোর", "রাজশাহী", "নওগাঁ", "পাবনা"],
      answer: 1, // রাজশাহী
    },
    {
      question: "২. পুঠিয়ার বিখ্যাত শিব মন্দিরটি কার দ্বারা নির্মিত হয়েছিল?",
      options: ["রানী ভুবনময়ী", "রাজা পীতাম্বর", "রানী শরৎসুন্দরী", "রাজা জগন্নারায়ণ"],
      answer: 0, // রানী ভুবনময়ী
    },
    {
      question: "৩. পুঠিয়ার বিখ্যাত শিব মন্দিরটি কোন বৃহৎ দীঘির তীরে অবস্থিত?",
      options: ["শিবসাগর দীঘি", "গৌরী দীঘি", "শ্যামসাগর দীঘি", "রামসাগর দীঘি"],
      answer: 0, // শিবসাগর দীঘি
    },
    {
      question: "৪. পুঠিয়ার কোন রাজকীয় প্রসাদকে রাজশাহী অঞ্চলের সবচেয়ে বর্ণিল মুঘল-ইউরোপীয় স্থাপত্য শৈলীর অনন্য নিদর্শন বলা হয়?",
      options: ["হাতিখানা প্রাসাদ", "পাঁচআনি রাজবাড়ী (পুঠিয়া রাজবাড়ী)", "ছোট তরফ রাজবাড়ী", "রানী দুর্গাবতী রাজবাড়ী"],
      answer: 1, // পাঁচআনি রাজবাড়ী
    },
    {
      question: "৫. পোড়ামাটির কারুকার্যের জন্য পুঠিয়ার কোন মন্দিরটি সবচেয়ে সুপরিচিত এবং অনন্য?",
      options: ["দোল মন্দির", "পঞ্চরত্ন গোবিন্দ মন্দির", "শিব মন্দির", "গোপাল মন্দির"],
      answer: 1, // পঞ্চরত্ন গোবিন্দ মন্দির
    },
  ];

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    PUTHIA_QUESTIONS.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.answer) {
        score += 1;
      }
    });
    setQuizScore(score);
  };

  const resetQuiz = () => {
    setSelectedQuizAnswers({});
    setQuizScore(null);
    setCurrentQuizQuestionIndex(0);
    setInteractiveQuizActive(false);
  };

  const handleMegaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoContestName && photoContestPhone && photoContestTitle) {
      setMegaContestRegistered(true);
      setShowMegaRegModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        style={{ background: "linear-gradient(135deg, #1B5E20, #004D40)" }}
        className="p-6 sm:p-8 text-white relative rounded-3xl overflow-hidden shadow-md"
      >
        <div className="absolute right-0 bottom-0 w-48 h-48 text-white/10 -mb-8 -mr-8 pointer-events-none">
          <Trophy className="w-full h-full" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left font-sans col-span-1">
            <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
              মেধা ও পুরস্কার
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight mt-2.5">
              কুইজ ও প্রতিযোগিতা
            </h1>
            <p className="mt-1.5 text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed font-semibold">
              পুঠিয়ার ইতিহাস ও সাধারণ জ্ঞানে আপনার মেধা যাচাই করুন, কুইজে অংশ নিন এবং প্রতি সপ্তাহে জিতে নিন আকর্ষণীয় পুরস্কার!
            </p>
          </div>
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/25 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto font-sans"
          >
            ← ফিরে যান
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-100/60 p-2 rounded-2xl border border-neutral-200">
        <button
          onClick={() => setQuizSubTab("live")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            quizSubTab === "live"
              ? "bg-[#2E7D32] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">🎮</span>
          <span className="text-xs font-black">লাইভ কুইজ</span>
        </button>

        <button
          onClick={() => setQuizSubTab("ongoing")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            quizSubTab === "ongoing"
              ? "bg-[#2E7D32] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">📜</span>
          <span className="text-xs font-black">চলমান প্রতিযোগিতা</span>
        </button>

        <button
          onClick={() => setQuizSubTab("leaderboard")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            quizSubTab === "leaderboard"
              ? "bg-[#2E7D32] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">🏆</span>
          <span className="text-xs font-black">লিডারবোর্ড/বিজয়ী</span>
        </button>

        <button
          onClick={() => setQuizSubTab("rules")}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer text-center ${
            quizSubTab === "rules"
              ? "bg-[#2E7D32] text-white shadow-sm font-sans"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-100/80 font-sans"
          }`}
        >
          <span className="text-2xl mb-1">ℹ️</span>
          <span className="text-xs font-black">নিয়মাবলী</span>
        </button>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {quizSubTab === "live" && (
          <div className="space-y-4 font-sans text-left">
            {interactiveQuizActive ? (
              <div className="bg-white p-5 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs animate-fade-in text-left">
                {quizScore === null ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-500 border-b pb-3 border-neutral-100 font-sans">
                      <span>পুঠিয়া মেধা যাচাই কুইজ</span>
                      <span className="bg-green-50 text-[#2E7D32] px-2.5 py-1 rounded-full border border-green-100">
                        প্রশ্ন: {(currentQuizQuestionIndex + 1).toLocaleString("bn-BD")} / {PUTHIA_QUESTIONS.length.toLocaleString("bn-BD")}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-serif font-black text-gray-800 text-lg sm:text-xl">
                        {PUTHIA_QUESTIONS[currentQuizQuestionIndex].question}
                      </h3>
                      <div className="grid grid-cols-1 gap-2.5 pt-2">
                        {PUTHIA_QUESTIONS[currentQuizQuestionIndex].options.map((opt, oIdx) => {
                          const isSelected = selectedQuizAnswers[currentQuizQuestionIndex] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerSelect(currentQuizQuestionIndex, oIdx)}
                              className={`w-full text-left p-4 rounded-2xl border text-sm font-bold transition flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-green-50/50 border-[#2E7D32] text-[#2E7D32] shadow-xs"
                                  : "bg-neutral-50/50 hover:bg-neutral-50 text-gray-700 border-neutral-200"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <span className="text-lg text-[#2E7D32]">✔</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                      <button
                        disabled={currentQuizQuestionIndex === 0}
                        onClick={() => setCurrentQuizQuestionIndex((prev) => prev - 1)}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold border border-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        পূর্ববর্তী
                      </button>
                      {currentQuizQuestionIndex < PUTHIA_QUESTIONS.length - 1 ? (
                        <button
                          disabled={selectedQuizAnswers[currentQuizQuestionIndex] === undefined}
                          onClick={() => setCurrentQuizQuestionIndex((prev) => prev + 1)}
                          className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed shadow-xs"
                        >
                          পরবর্তী প্রশ্ন
                        </button>
                      ) : (
                        <button
                          disabled={selectedQuizAnswers[currentQuizQuestionIndex] === undefined}
                          onClick={calculateScore}
                          className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md"
                        >
                          ফলাফল দেখুন 📊
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-20 h-20 bg-green-50 text-[#2E7D32] mx-auto rounded-full flex items-center justify-center text-4xl shadow-xs border border-green-100">
                      {quizScore >= 3 ? "🏆" : "👍"}
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-neutral-850 text-2xl mb-1">
                        {quizScore === PUTHIA_QUESTIONS.length ? "চমৎকার! আপনি ৫-এ ৫ পেয়েছেন।" : "কুইজ সম্পন্ন হয়েছে!"}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 font-bold">
                        আপনার প্রাপ্ত স্কোর: <span className="text-lg text-[#2E7D32] font-black">{quizScore.toLocaleString("bn-BD")} / {PUTHIA_QUESTIONS.length.toLocaleString("bn-BD")}</span>
                      </p>
                    </div>
                    <p className="text-xs text-neutral-600 font-semibold max-w-sm mx-auto leading-relaxed">
                      {quizScore >= 3
                        ? "অসাধারণ কুইজ পারফরম্যান্স! আপনার সঠিক উত্তর প্রদানের জন্য উপজেলা কুইজ লিডারবোর্ড তালিকায় ইস্টার যোগ করা হলো।"
                        : "চমৎকার চেষ্টা! পুঠিয়ার ইতিহাস ও সংস্কৃতি সম্পর্কে আরও বিস্তারিত জানতে চাইলে উপজেলা পরিচিতি ও ইতিহাস মডিউলগুলো ঘুরে দেখুন।"}
                    </p>
                    <div className="flex gap-3 justify-center pt-4">
                      <button
                        onClick={resetQuiz}
                        className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold border border-neutral-200 cursor-pointer"
                      >
                        পুনরায় খেলুন
                      </button>
                      <button
                        onClick={() => setQuizSubTab("leaderboard")}
                        className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer"
                      >
                        লিডারবোর্ড দেখুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 hover:border-[#2E7D32]/30 shadow-xs flex flex-col sm:flex-row items-dark justify-between gap-5 relative overflow-hidden transition duration-200 group animate-fade-in text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 text-[#2E7D32] rounded-2xl flex items-center justify-center shrink-0 border border-green-100 shadow-xs text-xl select-none mt-1">
                    ⚡
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-[#2E7D32] font-extrabold uppercase bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                        Daily Quiz Challenge
                      </span>
                      <h4 className="font-serif font-black text-gray-850 text-base sm:text-lg w-full mt-1 sm:mt-0">
                        আজকের পুঠিয়া কুইজ (পর্ব - ৪২)
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 font-sans">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                        পুরস্কার: ৫০ ইস্টার
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-[#2E7D32] border border-green-100">
                        ⏱️ সময়: ৫ মিনিট
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-semibold leading-relaxed pt-1">
                      আজকের কুইজের বিষয়: "পুঠিয়ার বিখ্যাত পাঁচআনি রাজবাড়ীর ইতিহাস"। ৫টি সহজ প্রশ্নের সঠিক উত্তর দিয়ে আপনার ইস্টার ব্যালেন্স বাড়িয়ে নিন।
                    </p>
                  </div>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0 w-full sm:w-auto shrink-0 flex items-center sm:items-end justify-between sm:justify-start">
                  <button
                    onClick={() => setInteractiveQuizActive(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold rounded-xl text-xs transition duration-150 shadow-xs cursor-pointer min-w-[140px]"
                  >
                    কুইজ শুরু করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {quizSubTab === "ongoing" && (
          <div className="space-y-4 font-sans text-left">
            {megaContestRegistered ? (
              <div className="bg-green-50/50 p-6 rounded-3xl border border-green-200 text-center space-y-3 animate-fade-in font-sans">
                <div className="text-3xl">🎉</div>
                <h4 className="text-base font-serif font-black text-green-850">
                  নিবন্ধন সফল হয়েছে!
                </h4>
                <p className="text-xs text-green-700 font-bold max-w-sm mx-auto">
                  "আমার চোখে পুঠিয়া" আলোকচিত্র ও রচনা প্রতিযোগিতায় আপনার নিবন্ধন ও কন্টেন্ট জমা গ্রহণ করা হয়েছে। যাচাইয়ের পর ফলাফল লিডারবোর্ডে প্রকাশ করা হবে।
                </p>
                <button
                  onClick={() => setMegaContestRegistered(false)}
                  className="px-4 py-2 bg-white border border-green-200 text-[#2E7D32] hover:bg-neutral-50 rounded-xl text-xs font-bold shadow-xs cursor-pointer mt-2 font-sans"
                >
                  নতুন কন্টেন্ট জমা দিন
                </button>
              </div>
            ) : (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 hover:border-[#2E7D32]/30 shadow-xs flex flex-col sm:flex-row items-dark justify-between gap-5 relative overflow-hidden transition duration-200 group animate-fade-in text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 text-[#2E7D32] rounded-2xl flex items-center justify-center shrink-0 border border-green-100 shadow-xs text-xl select-none mt-1">
                    🎨
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-[#2E7D32] font-extrabold bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                        Mega Competition
                      </span>
                      <h4 className="font-serif font-black text-gray-850 text-base sm:text-lg w-full mt-1 sm:mt-0">
                        "আমার চোখে পুঠিয়া" - আলোকচিত্র ও রচনা প্রতিযোগিতা
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 font-sans">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        ⏱️ শেষ সময়: ৩০ জুন
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-[#2E7D32] border border-green-100">
                        🏆 আকর্ষণীয় মেডেল ও সার্টিফিকেট
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 font-semibold leading-relaxed pt-1">
                      পুঠিয়ার যেকোনো ঐতিহাসিক স্থানের ছবি তুলে অথবা পুঠিয়ার ঐতিহ্য নিয়ে ৫০০ শব্দের একটি প্রবন্ধ লিখে জমা দিন। সেরা ৩ জনকে আকর্ষণীয় মেডেল ও উপজেলা ডিজিটাল সার্টিফিকেট দেয়া হবে।
                    </p>
                  </div>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 border-neutral-100 pt-3 sm:pt-0 w-full sm:w-auto shrink-0 flex items-center sm:items-end justify-between sm:justify-start font-sans">
                  <button
                    onClick={() => setShowMegaRegModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold rounded-xl text-xs transition duration-150 shadow-xs cursor-pointer min-w-[140px]"
                  >
                    নিবন্ধন/জমা দিন
                  </button>
                </div>
              </div>
            )}

            {showMegaRegModal && (
              <div className="bg-neutral-50 p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-inner mt-4 animate-fade-in font-sans">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4 font-sans">
                  <h4 className="font-serif font-black text-neutral-800 text-sm sm:text-base">
                    🎨 প্রতিযোগিতার জন্য আপনার তথ্য ও ফাইল সাবমিট করুন
                  </h4>
                  <button
                    onClick={() => setShowMegaRegModal(false)}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-700 cursor-pointer"
                  >
                    বন্ধ করুন ❌
                  </button>
                </div>
                <form onSubmit={handleMegaSubmit} className="space-y-4 font-sans text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                    <div>
                      <label className="block text-neutral-600 mb-1">আপনার নাম *</label>
                      <input
                        type="text"
                        required
                        value={photoContestName || ""}
                        onChange={(e) => setPhotoContestName(e.target.value)}
                        placeholder="যেমন: মোঃ রাশেদুল ইসলাম"
                        className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="tel"
                        required
                        value={photoContestPhone || ""}
                        onChange={(e) => setPhotoContestPhone(e.target.value)}
                        placeholder="যেমন: ০১৭০০-০০০০০০"
                        className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="text-xs font-bold col-span-1">
                    <label className="block text-neutral-600 mb-1">আপনার ছবি বা রচনার শিরোনাম *</label>
                    <input
                      type="text"
                      required
                      value={photoContestTitle || ""}
                      onChange={(e) => setPhotoContestTitle(e.target.value)}
                      placeholder="যেমন: আমার লেন্সে রাজবাড়ী দীঘির সৌন্দর্য / পুঠিয়ার ইতিহাস ঐতিহ্য"
                      className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-hidden"
                    />
                  </div>
                  <div className="text-xs font-bold col-span-1">
                    <label className="block text-neutral-600 mb-1">প্রবন্ধ বিবরণ / ছবির ক্যাপশন (ঐচ্ছিক)</label>
                    <textarea
                      rows={3}
                      value={photoContestDesc || ""}
                      onChange={(e) => setPhotoContestDesc(e.target.value)}
                      placeholder="এখানে বিবরণ লিখুন..."
                      className="w-full px-3 py-2 border rounded-xl bg-white font-sans text-xs focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-hidden"
                    />
                  </div>
                  <div className="text-xs font-bold col-span-1">
                    <label className="block text-neutral-600 mb-1">ছবি আপলোড করুন (JPEG/PNG) / রচনা ফাইল পিডিএফ</label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-4 bg-white text-center cursor-pointer hover:bg-neutral-50 transition">
                      <span className="text-xl">📁</span>
                      <span className="block text-[11px] text-neutral-500 mt-1">ফাইল সিলেক্ট করতে এখানে ক্লিক করুন (ড্রাগ এন্ড ড্রপ সমর্থিত)</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setShowMegaRegModal(false)}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl shadow-xs cursor-pointer"
                    >
                      জমা দিন নিশ্চিত করুন
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {quizSubTab === "leaderboard" && (
          <div className="space-y-4 font-sans text-left animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 font-sans">
                <span className="text-2xl">🎉</span>
                <div>
                  <span className="text-xs text-[#2E7D32] font-black uppercase">গত সপ্তাহের কুইজ চ্যাম্পিয়নস</span>
                  <h4 className="font-serif font-black text-gray-850 text-base">ইতিহাস কুইজ (পর্ব - ৪১) এর বিজয়ী তালিকা</h4>
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <h5 className="text-xs font-black text-neutral-850">মোঃ রাশেদুল ইসলাম (বানেশ্বর)</h5>
                      <p className="text-[11px] text-neutral-500 font-bold">পুঠিয়া ইতিহাস কুইজ ২০২৬</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-[#2E7D32]">স্কোর: ৫/৫</span>
                    <span className="text-[10px] text-neutral-500 font-bold">⏱️ সময়: ১২ সেকেন্ড</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <h5 className="text-xs font-black text-neutral-850">ফারিহা আনজুম (পুঠিয়া সদর)</h5>
                      <p className="text-[11px] text-neutral-500 font-bold">পুঠিয়া ইতিহাস কুইজ ২০২৬</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-[#2E7D32]">স্কোর: ৫/৫</span>
                    <span className="text-[10px] text-neutral-500 font-bold">⏱️ সময়: ১৮ সেকেন্ড</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50 text-left font-sans">
                <p className="text-[11px] sm:text-xs text-neutral-500 font-bold flex items-center gap-1">
                  <span className="text-xs text-[#2E7D32]">📢</span> স্ট্যাটাস: বিজয়ীদের প্রোফাইলে অলরেডি কুইজ বোনাস ইস্টার ও ডিজিটাল রিওয়ার্ড ব্যাজ যোগ করা হয়েছে।
                </p>
              </div>
            </div>
          </div>
        )}

        {quizSubTab === "rules" && (
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 bg-linear-to-b from-white to-neutral-50/20 space-y-4 text-left font-sans animate-fade-in font-sans">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">ℹ️</span>
              <h3 className="font-serif font-black text-neutral-850 text-base sm:text-lg">কুইজে ও মেগা প্রতিযোগিতায় অংশ নেওয়ার নিয়মাবলী</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50">
                <span className="text-sm bg-green-100 text-[#2E7D32] w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0">১</span>
                <p className="text-xs sm:text-sm text-neutral-600 font-bold leading-relaxed">প্রতিটি কুইজে অংশ নেওয়ার জন্য একবার সুযোগ পাবেন। ভুল উত্তরের কারণে কোনো ইস্টার কাটা যাবে না।</p>
              </div>
              <div className="flex gap-3 items-start p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50">
                <span className="text-sm bg-green-100 text-[#2E7D32] w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0">২</span>
                <p className="text-xs sm:text-sm text-neutral-600 font-bold leading-relaxed">কুইজে আপনার পারফরম্যান্স ও সঠিক উত্তরের গতিশীলতার উপর নির্ভর করে আপনার ইউজার প্রোফাইলে মেধা ইস্টার যোগ করা হবে।</p>
              </div>
              <div className="flex gap-3 items-start p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50">
                <span className="text-sm bg-green-100 text-[#2E7D32] w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0">৩</span>
                <p className="text-xs sm:text-sm text-neutral-600 font-bold leading-relaxed">প্রতি সপ্তাহে সর্বোচ্চ ইস্টার অর্জনকারীদের বিজয়ী তালিকায় যুক্ত করে আকর্ষণীয় উপহার ও রিচার্জ কোড দেওয়া হবে।</p>
              </div>
              <div className="flex gap-3 items-start p-3 bg-neutral-50 rounded-2xl border border-neutral-200/50">
                <span className="text-sm bg-green-100 text-[#2E7D32] w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0">৪</span>
                <p className="text-xs sm:text-sm text-neutral-600 font-bold leading-relaxed">আলোকচিত্র প্রতিযোগিতায় ছবি অবশ্যই নিজস্ব ক্যামেরা বা ফোনে পুঠিয়া উপজেলা এলাকা থেকে ধারণকৃত হতে হবে।</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

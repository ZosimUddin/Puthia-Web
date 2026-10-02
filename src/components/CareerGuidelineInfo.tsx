import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Lightbulb, Briefcase, BookOpen, Laptop, Target, ArrowRight, 
  CheckCircle2, XCircle, Award, HelpCircle, Send, MessageSquare, User, 
  Clock, Loader2, Link as LinkIcon, ExternalLink, RefreshCw 
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export function CareerGuidelineInfo({ onGoBack }: { onGoBack: () => void }) {
  const [activeTab, setActiveTab] = useState("govt");

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Q&A State
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [askerName, setAskerName] = useState("");
  const [questionCategory, setQuestionCategory] = useState("বিসিএস ও ব্যাংক");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [replyName, setReplyName] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const guidelines = [
    {
      id: 1,
      title: "বিসিএস ও সরকারি চাকরির প্রস্তুতি",
      category: "govt",
      icon: Briefcase,
      content: "সরকারি চাকরির জন্য প্রস্তুতি শুরু করার সেরা সময় স্নাতক ২য়/৩য় বর্ষ। নিয়মিত পত্রিকা পড়া, বিগত বছরের প্রশ্ন সমাধান এবং বেসিক গণিত ও ইংরেজির ভিত্তি মজবুত করা অত্যন্ত জরুরি।",
      steps: ["সিলেবাস বিশ্লেষণ ও প্রশ্ন প্যাটার্ন বুঝা", "বিগত ১০ বছরের প্রিলিমিনারি প্রশ্ন সমাধান করা", "প্রয়োজনীয় গাইড বই ও সহায়ক টেক্সট বুক সংগ্রহ", "দৈনিক ৩-৪ ঘণ্টা পরিকল্পিত পড়াশোনা"]
    },
    {
      id: 2,
      title: "প্রাথমিক শিক্ষক নিয়োগ প্রস্তুতি",
      category: "govt",
      icon: BookOpen,
      content: "প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার জন্য ৬ষ্ঠ থেকে ১০ম শ্রেণির বোর্ড বইগুলো খুব ভালোভাবে আয়ত্ত করতে হবে। বিশেষ করে গণিত, বাংলা ব্যাকরণ ও সাধারণ জ্ঞান অংশ থেকে সরাসরি প্রশ্ন আসে।",
      steps: ["৬ষ্ঠ-১০ম শ্রেণির বোর্ড বই রিভিশন", "নিয়মিত গণিত শর্টকাট সূত্র অনুশীলন", "বিগত প্রাইমারী নিয়োগ পরীক্ষার প্রশ্ন সমাধান", "সময় ধরে বাসায় মডেল টেস্ট দেওয়া"]
    },
    {
      id: 3,
      title: "বেসরকারি ব্যাংক ও কর্পোরেট জব",
      category: "private",
      icon: Briefcase,
      content: "বেসরকারি ব্যাংকে আইবিএ (IBA) প্যাটার্নের প্রশ্ন বেশি হয়। এখানে ইংরেজি ভোকাবুলারি, রিডিং কমপ্রিহেনশন এবং এনালিটিক্যাল স্কিল অনেক বেশি গুরুত্বপূর্ণ। পাশাপাশি আইটি স্কিল আবশ্যক।",
      steps: ["ইংরেজি ভোকাবুলারি ও গ্রামার জোরদার করা", "এনালিটিক্যাল ও ম্যাথ পাজল সমাধান", "মাইক্রোসফট এক্সেল ও প্রেজেন্টেশন স্কিল রপ্ত করা", "প্রফেশনাল ও আকর্ষণীয় সিভি তৈরি"]
    },
    {
      id: 4,
      title: "ফ্রিল্যান্সিং ও আউটসোর্সিং গাইডলাইন",
      category: "freelance",
      icon: Laptop,
      content: "ফ্রিল্যান্সিং শুরু করার আগে নির্দিষ্ট একটি স্কিল অন্তত ৬ মাস সময় দিয়ে শিখতে হবে। যেমন: গ্রাফিক্স ডিজাইন, ওয়েব ডেভেলপমেন্ট বা ডিজিটাল মার্কেটিং। শুধু ইউটিউব দেখে তাড়াহুড়ো করে একাউন্ট খোলা উচিত নয়।",
      steps: ["নিজের ভালো লাগা অনুযায়ী ১টি নির্দিষ্ট স্কিল নির্বাচন", "কমপক্ষে ৫-১০টি ডেমো প্রজেক্ট নিয়ে পোর্টফোলিও তৈরি", "আপওয়ার্ক/ফাইভার মার্কেটপ্লেসের গাইডলাইন ভালোভাবে জানা", "কমিউনিকেশন স্কিল ও বায়ার হ্যান্ডলিং শেখা"]
    },
    {
      id: 5,
      title: "উচ্চশিক্ষা ও গবেষণা গাইডলাইন",
      category: "study",
      icon: Target,
      content: "দেশের বাইরে উচ্চশিক্ষার জন্য আইইএলটিএস (IELTS) বা জিআরই (GRE) স্কোর প্রয়োজন। উত্তর আমেরিকা, ইউরোপ ও এশিয়ায় বিভিন্ন বিশ্ববিদ্যালয়ে ফুল-ফান্ডেড স্কলারশিপের সুযোগ রয়েছে।",
      steps: ["স্নাতক শেষ বর্ষ থেকেই IELTS/GRE প্রস্তুতি নেওয়া", "আগ্রহী ফিল্ডের প্রফেসরদের খুঁজে ইমেইল (Cold Mailing) করা", "রিসার্চ পেপার বা থিসিস করার চেষ্টা করা", "পাসপোর্ট ও রিকমেন্ডেশন লেটার প্রস্তুত রাখা"]
    }
  ];

  // Useful links database
  const usefulLinks = [
    { title: "বাংলাদেশ সরকারী কর্ম কমিশন (BPSC)", url: "https://bpsc.gov.bd", desc: "বিসিএস ও অন্যান্য নন-ক্যাডার চাকরির বিজ্ঞপ্তি ও আপডেট।" },
    { title: "প্রাথমিক শিক্ষা অধিদপ্তর (DPE)", url: "https://dpe.gov.bd", desc: "প্রাইমারি শিক্ষক নিয়োগ ও ফলাফল সংক্রান্ত তথ্য।" },
    { title: "সহজ ইংরেজি গ্রামার ও ভোকাবুলারি (BBC Janala)", url: "https://www.bbcjanala.com", desc: "ইংরেজি শেখার চমৎকার ফ্রি প্ল্যাটফর্ম।" },
    { title: "ফ্রি ওয়েব ডেভেলপমেন্ট কোর্স (w3schools)", url: "https://www.w3schools.com", desc: "আইটি স্কিল ও কোডিং শেখার সেরা ওয়েবসাইট।" },
    { title: "ইউরোপীয় স্কলারশিপ পোর্টাল (Erasmus+)", url: "https://erasmus-plus.ec.europa.eu", desc: "উচ্চশিক্ষার জন্য ইউরোপের সবচেয়ে বড় স্কলারশিপ পোর্টাল।" }
  ];

  // Quiz Questions Data
  const quizQuestions = [
    {
      question: "১. বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?",
      options: ["ক) গীতাঞ্জলি", "খ) চর্যাপদ", "গ) শ্রীকৃষ্ণকীর্তন", "ঘ) মেঘনাদবধ কাব্য"],
      correctIndex: 1,
      explanation: "চর্যাপদ বাংলা সাহিত্যের আদি বা প্রাচীনতম নিদর্শন। এটি পাল আমলে বৌদ্ধ সহজিয়াদের দ্বারা রচিত হয়েছিল।"
    },
    {
      question: "২. কোন সংখ্যার ৬০% থেকে ৬০ বিয়োগ করলে ফলাফল ৬০ হবে?",
      options: ["ক) ২০০", "খ) ১২০", "গ) ১০০", "ঘ) ৩০০"],
      correctIndex: 0,
      explanation: "ধরি সংখ্যাটি x। প্রশ্নানুযায়ী, (x × ৬০%) - ৬০ = ৬০ => ০.৬x = ১২০ => x = ২০০।"
    },
    {
      question: "৩. ঐতিহাসিক পুঠিয়া রাজবাড়ী কোন জেলায় অবস্থিত?",
      options: ["ক) নাটোর", "খ) রাজশাহী", "গ) নওগাঁ", "ঘ) পাবনা"],
      correctIndex: 1,
      explanation: "পুঠিয়া রাজবাড়ী রাজশাহী জেলার পুঠিয়া উপজেলায় অবস্থিত একটি বিখ্যাত ঐতিহাসিক রাজপ্রাসাদ।"
    },
    {
      question: "৪. What is the synonym of 'Prudent'?",
      options: ["ক) Wise", "খ) Careless", "গ) Foolish", "ঘ) Impulsive"],
      correctIndex: 0,
      explanation: "'Prudent' শব্দের অর্থ বিচক্ষণ বা দূরদর্শী, যার সমার্থক শব্দ 'Wise'।"
    },
    {
      question: "৫. কম্পিউটার মেমরির স্থায়ী বা অনুদ্বায়ী (Non-volatile) অংশ কোনটি?",
      options: ["ক) RAM", "খ) ROM", "গ) Cache", "ঘ) Register"],
      correctIndex: 1,
      explanation: "ROM (Read-Only Memory) একটি স্থায়ী মেমরি, যা কম্পিউটার বন্ধ করলেও ভেতরের তথ্য বা প্রোগ্রাম মুছে যায় না।"
    },
    {
      question: "৬. বাংলাদেশের স্বাধীনতা যুদ্ধে কত নম্বর সেক্টরটি কোনো স্থায়ী কমান্ডার ছাড়া পরিচালিত হয়েছিল?",
      options: ["ক) ৭ নম্বর সেক্টর", "খ) ১০ নম্বর সেক্টর", "গ) ১১ নম্বর সেক্টর", "ঘ) ২ নম্বর সেক্টর"],
      correctIndex: 1,
      explanation: "১০ নম্বর সেক্টরটি নৌ-কমান্ডোদের নিয়ে গঠিত হয়েছিল। এর কোনো নির্দিষ্ট আঞ্চলিক সীমানা বা স্থায়ী সেক্টর কমান্ডার ছিল না।"
    },
    {
      question: "৭. বানেশ্বর হাট পুঠিয়া উপজেলার কিসের জন্য দেশজুড়ে বিখ্যাত?",
      options: ["ক) রেশম কাপড়", "খ) আম ও কাঁচাবাজার", "গ) তাঁত শিল্প", "ঘ) চিনি উৎপাদন"],
      correctIndex: 1,
      explanation: "বানেশ্বর হাট উত্তরবঙ্গের অন্যতম বৃহত্তম আমের হাট এবং এটি পুঠিয়া উপজেলার ঐতিহ্য ও অর্থনৈতিক প্রাণকেন্দ্র।"
    },
    {
      question: "৮. 'কবর' কবিতাটির রচয়িতা কে?",
      options: ["ক) কাজী নজরুল ইসলাম", "খ) জসীমউদ্দীন", "গ) রবীন্দ্রনাথ ঠাকুর", "ঘ) জীবনানন্দ দাশ"],
      correctIndex: 1,
      explanation: "পল্লীকবি জসীমউদ্দীন রচিত অত্যন্ত জনপ্রিয় এবং হৃদয়স্পর্শী কবিতা হচ্ছে 'কবর'।"
    },
    {
      question: "৯. মানবদেহে সাধারণ ক্রোমোজোমের সংখ্যা কতটি?",
      options: ["ক) ২৩টি", "খ) ৪৬টি", "গ) ২২টি", "ঘ) ৪৪টি"],
      correctIndex: 1,
      explanation: "মানুষের প্রতিটি দেহকোষে ২৩ জোড়া বা মোট ৪৬টি ক্রোমোজোম থাকে।"
    },
    {
      question: "১০. Choose the correct sentence:",
      options: ["ক) He is unique boy.", "খ) He is an unique boy.", "গ) He is a unique boy.", "ঘ) He is most unique boy."],
      correctIndex: 2,
      explanation: "'U'-এর উচ্চারণ যদি 'ইউ'-এর মতো হয়, তবে তার পূর্বে 'an' না বসে 'a' বসে। তাই 'a unique boy' সঠিক।"
    }
  ];

  // Static/Default questions to combine with Firestore
  const staticQuestions = [
    {
      id: "static_q_1",
      name: "মোহাম্মদ হাবিব",
      question: "বিসিএস প্রিলির জন্য প্রস্তুতি কোন বইগুলো দিয়ে শুরু করা ভালো? আমি নতুন শুরু করতে চাচ্ছি।",
      category: "বিসিএস ও ব্যাংক",
      answer: "বিসিএস প্রস্তুতির শুরুতে আপনি ৯ম-১০ম শ্রেণির বোর্ড বইগুলো (বিশেষ করে ইতিহাস, ভূগোল, সাধারণ বিজ্ঞান ও ব্যাকরণ) রিভিশন করতে পারেন। পাশাপাশি একটি ভালো মানের প্রিলি ডাইজেস্ট ও বিগত বছরের প্রশ্ন ব্যাংক সংগ্রহ করে নিতে পারেন।",
      answererName: "সাদিয়া নাসরিন (৩৬তম বিসিএস ক্যাডার)",
      createdAt: { seconds: Date.now() / 1000 - 86400 }
    },
    {
      id: "static_q_2",
      name: "সুমাইয়া খাতুন",
      question: "এইচএসসির পর ফ্রিল্যান্সিং শুরু করতে চাইলে কোন স্কিল নিয়ে আগালে দ্রুত কাজ পাওয়ার সম্ভাবনা আছে?",
      category: "ফ্রিল্যান্সিং",
      answer: "শুরু করার জন্য ডিজিটাল মার্কেটিং (যেমন: সোশ্যাল মিডিয়া ম্যানেজমেন্ট, এসইও) বা গ্রাফিক্স ডিজাইন (ক্যানভা এবং ইলাস্ট্রেটর) দিয়ে শুরু করা তুলনামূলক সহজ। তবে আপনার কোডিং ভালো লাগলে ওয়েব ডেভেলপমেন্টে অনেক ভালো ক্যারিয়ার রয়েছে।",
      answererName: "তরিকুল ইসলাম (টপ রেটেড ফ্রিল্যান্সার, পুঠিয়া)",
      createdAt: { seconds: Date.now() / 1000 - 172800 }
    }
  ];

  // Load questions from Firestore
  useEffect(() => {
    const q = query(collection(db, "career_queries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setQuestions(list);
      setIsLoadingQuestions(false);
    }, (error) => {
      console.error("Error loading career queries:", error);
      setIsLoadingQuestions(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "career_queries");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const allQuestions = [...questions, ...staticQuestions];

  const handleOptionSelect = (optionIdx: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIdx);
    setHasAnswered(true);
    if (optionIdx === quizQuestions[currentQuestionIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setHasAnswered(false);
    setQuizStarted(true);
  };

  // Submit new Career Question to Firestore
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      alert("দয়া করে আপনার প্রশ্নটি লিখুন।");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      await addDoc(collection(db, "career_queries"), {
        name: askerName.trim() || "বেনামী শুভাকাঙ্ক্ষী",
        question: newQuestion.trim(),
        category: questionCategory,
        answer: "",
        answererName: "",
        createdAt: serverTimestamp()
      });
      setNewQuestion("");
      setAskerName("");
      alert("আপনার প্রশ্নটি সফলভাবে প্রকাশ করা হয়েছে! আমাদের টিম শীঘ্রই উত্তর প্রদান করবে।");
    } catch (err) {
      console.error("Error adding question:", err);
      alert("দুঃখিত, প্রশ্ন যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      handleFirestoreError(err, OperationType.CREATE, "career_queries");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Submit Answer/Advice to a question
  const handleGiveAdvice = async (questionId: string) => {
    if (!replyText.trim()) {
      alert("দয়া করে পরামর্শের বিবরণ লিখুন।");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const docRef = doc(db, "career_queries", questionId);
      await updateDoc(docRef, {
        answer: replyText.trim(),
        answererName: replyName.trim() || "কমিউনিটি মেন্টর",
        answeredAt: serverTimestamp()
      });
      setReplyText("");
      setReplyName("");
      setActiveReplyId(null);
      alert("আপনার পরামর্শটি সফলভাবে যুক্ত হয়েছে!");
    } catch (err) {
      console.error("Error updating question answer:", err);
      alert("পরামর্শ প্রকাশ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      handleFirestoreError(err, OperationType.UPDATE, `career_queries/${questionId}`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredGuidelines = guidelines.filter(item => {
    return item.category === activeTab;
  });

  return (
    <div className="space-y-6 font-sans pb-10 animate-fade-in">
      {/* Header Banner */}
      <div 
        className="p-6 md:p-8 text-white rounded-3xl relative overflow-hidden" 
        style={{ 
          background: "linear-gradient(135deg, #f59e0b, #d97706)", 
          boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)" 
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl translate-x-10 -translate-y-10"></div>
        <button 
          onClick={onGoBack} 
          className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border border-white/10 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>
        <h1 className="text-2xl md:text-3xl font-black mt-6 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 md:w-8 md:h-8" /> ক্যারিয়ার গাইডলাইন
        </h1>
        <p className="mt-2 text-white/95 text-sm md:text-base leading-relaxed opacity-90 max-w-2xl text-justify">
          সঠিক লক্ষ্য নির্ধারণ এবং ক্যারিয়ার গড়তে পুঠিয়ার সকল চাকরিপ্রার্থী, শিক্ষার্থী ও ফ্রিল্যান্সারদের জন্য প্রয়োজনীয় পরামর্শ, অনলাইন মডেল টেস্ট এবং কমিউনিটি সাপোর্ট।
        </p>
      </div>

      {/* Navigation Tabs with Smooth Horizontal Scrolling */}
      <div style={{ display: "flex", gap: "6px", width: "100%", boxSizing: "border-box", padding: "2px 0", marginBottom: "20px", overflowX: "auto" }} className="no-scrollbar">
        {[
          { id: "govt", icon: "🏛️", label: "সরকারি" },
          { id: "private", icon: "🏢", label: "বেসরকারি" },
          { id: "freelance", icon: "💻", label: "ফ্রিল্যান্সিং" },
          { id: "study", icon: "🎓", label: "উচ্চশিক্ষা" },
          { id: "quiz", icon: "✍️", label: "মডেল টেস্ট" },
          { id: "qna", icon: "❓", label: "ক্যারিয়ার জিজ্ঞাসা" }
        ].map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            style={{ 
              flex: "0 0 auto", 
              width: "105px", 
              background: activeTab === tab.id ? "#fef3c7" : "#ffffff", 
              color: activeTab === tab.id ? "#b45309" : "#1e293b", 
              border: activeTab === tab.id ? "1.5px solid #f59e0b" : "1px solid #e2e8f0", 
              padding: "10px 4px", 
              borderRadius: "16px", 
              textAlign: "center", 
              cursor: "pointer", 
              transition: "all 0.2s" 
            }}
            className="hover:border-amber-400 select-none"
          >
            <div style={{ fontSize: "16px", marginBottom: "2px" }}>{tab.icon}</div>
            <div style={{ fontSize: "10.5px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Dynamic Tab Content rendering */}
      {activeTab !== "quiz" && activeTab !== "qna" ? (
        <div className="space-y-6">
          {/* Main guidelines view */}
          <div className="flex flex-col gap-5 px-1">
            {filteredGuidelines.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition flex flex-col gap-4 animate-scale-up">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 mt-1 shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="m-0 text-base md:text-lg font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed text-justify">
                      {item.content}
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/60">
                  <span className="text-xs font-bold text-amber-800 mb-2.5 block uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" /> সফল প্রস্তুতির প্রাথমিক ধাপ:
                  </span>
                  <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
                    {item.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 font-medium leading-relaxed">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> 
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Useful resources card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="m-0 text-base font-bold text-slate-800 flex items-center gap-2">
              <LinkIcon className="w-4.5 h-4.5 text-amber-600" /> গুরুত্বপূর্ণ ক্যারিয়ার ওয়েবসাইট ও লিংক
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {usefulLinks.map((link, idx) => (
                <a 
                  key={idx} 
                  href={link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/10 flex flex-col justify-between gap-1.5 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">{link.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium leading-relaxed">{link.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === "quiz" ? (
        /* QUIZ TAB */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-scale-up">
          {!quizStarted && !quizCompleted ? (
            <div className="p-8 text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <Award className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">চাকরি প্রস্তুতি মক টেস্ট</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার জন্য গুরুত্বপূর্ণ ১০টি সাধারণ ও বাংলা বিষয়ের বহুনির্বাচনী প্রশ্ন দিয়ে নিজেকে যাচাই করুন।
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> মোট প্রশ্ন সংখ্যা: ১০টি
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> প্রতিটি সঠিক উত্তরে: ১ ইস্টার
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ভুল উত্তরে কোনো নেতিবাচক মার্ক নেই
                </div>
              </div>
              <button
                onClick={() => setQuizStarted(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer border-none"
              >
                টেস্ট শুরু করুন
              </button>
            </div>
          ) : quizCompleted ? (
            /* Quiz Score Card */
            <div className="p-8 text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300">
                <span className="text-2xl font-black text-amber-600">{quizScore}/১০</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800">অভিনন্দন! আপনি পরীক্ষা সম্পন্ন করেছেন</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {quizScore >= 8 
                    ? "চমৎকার প্রস্তুতি! আপনার পড়াশোনার ভিত্তি খুবই মজবুত।" 
                    : quizScore >= 5 
                    ? "ভালো স্কোর! একটু রিভিশন দিলেই আপনার প্রস্তুতি আরো চমৎকার হবে।" 
                    : "প্রস্তুতি আরও বাড়াতে হবে। নিয়মিত গাইডলাইন অনুসরণ করুন ও আবার চেষ্টা করুন।"}
                </p>
              </div>

              {/* Progress and Level visualizer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">আপনার বর্তমান লেভেল:</span>
                <div className="flex justify-between items-center text-xs font-extrabold text-amber-700">
                  <span>{quizScore >= 8 ? "🏆 এডভান্সড মাস্টার" : quizScore >= 5 ? "🥈 ইন্টারমিডিয়েট রানার" : "🥉 বিগিনার লার্নার"}</span>
                  <span>{quizScore * 10}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000" 
                    style={{ width: `${quizScore * 10}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                >
                  <RefreshCw className="w-4 h-4" /> আবার দিন
                </button>
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setQuizCompleted(false);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setHasAnswered(false);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black active:scale-[0.98] transition cursor-pointer border-none"
                >
                  মূল পাতায় ফিরুন
                </button>
              </div>
            </div>
          ) : (
            /* Active Quiz Interface */
            <div className="p-6 md:p-8 space-y-6">
              {/* Progress and Question Counter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">মডেল টেস্ট চলছে</span>
                  <span className="text-xs font-extrabold text-slate-500">প্রশ্ন: {currentQuestionIndex + 1}/১০</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80">
                <h4 className="m-0 text-sm md:text-base font-bold text-slate-800 leading-relaxed">
                  {quizQuestions[currentQuestionIndex].question}
                </h4>
              </div>

              {/* Options list */}
              <div className="space-y-2.5">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === quizQuestions[currentQuestionIndex].correctIndex;
                  
                  let optionStyle = "border-slate-150 bg-white text-slate-700 hover:border-amber-300";
                  if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold";
                    } else if (isSelected) {
                      optionStyle = "border-red-500 bg-red-50 text-red-800 font-semibold";
                    } else {
                      optionStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-70";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs md:text-sm font-medium transition flex items-center justify-between cursor-pointer focus:outline-none ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section shown after answering */}
              {hasAnswered && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/60 space-y-1.5 animate-scale-up">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> সঠিক উত্তর ব্যাখ্যা:
                  </span>
                  <p className="m-0 text-xs text-slate-600 leading-relaxed font-medium text-justify">
                    {quizQuestions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {hasAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/10 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5 border-none"
                >
                  {currentQuestionIndex === quizQuestions.length - 1 ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Q&A FORUM TAB */
        <div className="space-y-6">
          {/* Ask Question Form */}
          <div className="bg-white p-5 rounded-3xl border border-amber-100/60 shadow-sm space-y-4">
            <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" /> ক্যারিয়ার জিজ্ঞাসা ফোরাম
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার পড়াশোনা, বিসিএস বা অন্যান্য চাকরি পরীক্ষা এবং ফ্রিল্যান্সিং ক্যারিয়ার সংক্রান্ত যেকোনো প্রশ্ন পুঠিয়া অঞ্চলের বিশেষজ্ঞ মেন্টর ও কমিউনিটির কাছে জিজ্ঞেস করুন।
            </p>

            <form onSubmit={handleAskQuestion} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আপনার নাম (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={askerName || ""}
                    onChange={(e) => setAskerName(e.target.value)}
                    placeholder="যেমন: তৌহিদ হাসান"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-amber-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">প্রশ্নের বিভাগ:</label>
                  <select
                    value={questionCategory || ""}
                    onChange={(e) => setQuestionCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-amber-500 transition font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="বিসিএস ও ব্যাংক">বিসিএস ও ব্যাংক</option>
                    <option value="প্রাইমারি ও শিক্ষক">প্রাইমারি ও শিক্ষক</option>
                    <option value="বেসরকারি ও কর্পোরেট">বেসরকারি ও কর্পোরেট</option>
                    <option value="ফ্রিল্যান্সিং">ফ্রিল্যান্সিং</option>
                    <option value="উচ্চশিক্ষা">উচ্চশিক্ষা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">আপনার প্রশ্নটি বিস্তারিত লিখুন: *</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestion || ""}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="যেমন: বিসিএস প্রিলির গণিত ভীতি দূর করার উপায় কী?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none focus:border-amber-500 transition font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingQuestion}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
              >
                {isSubmittingQuestion ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    প্রশ্ন সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> প্রশ্নটি প্রকাশ করুন
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Asked Questions list */}
          <div className="space-y-4 px-1">
            <h4 className="m-0 text-sm font-extrabold text-slate-700">জিজ্ঞাসাকৃত প্রশ্ন ({allQuestions.length})</h4>
            
            {isLoadingQuestions ? (
              <div className="text-center py-8 flex flex-col items-center gap-1.5">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">প্রশ্ন লোড হচ্ছে...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {allQuestions.map((q) => {
                  const isStatic = q.id.toString().startsWith("static_");
                  const dateStr = q.createdAt 
                    ? new Date(q.createdAt.seconds * 1000).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
                    : "আজ";

                  return (
                    <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-scale-up">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-700 block">{q.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> {dateStr}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          {q.category}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="m-0 text-xs md:text-sm font-bold text-slate-800 leading-relaxed text-justify">
                        {q.question}
                      </p>

                      {/* Verified Advice / Answer */}
                      {q.answer ? (
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60 space-y-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
                              ✓ নির্ভরযোগ্য মেন্টর পরামর্শ
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">প্রদানকারী: {q.answererName}</span>
                          </div>
                          <p className="m-0 text-xs text-slate-600 leading-relaxed font-medium text-justify">
                            {q.answer}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50/30 p-3.5 rounded-xl border border-amber-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <span className="text-[10px] text-amber-700 font-extrabold">পরামর্শের জন্য অপেক্ষা করছে... আপনি কি কোনো তথ্য দিয়ে সাহায্য করতে পারবেন?</span>
                          
                          {!isStatic && activeReplyId !== q.id && (
                            <button
                              onClick={() => {
                                setActiveReplyId(q.id);
                                setReplyText("");
                                setReplyName("");
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition cursor-pointer border-none shadow-sm"
                            >
                              পরামর্শ দিন
                            </button>
                          )}
                        </div>
                      )}

                      {/* Inline advice form */}
                      {activeReplyId === q.id && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 animate-fade-in">
                          <h5 className="m-0 text-xs font-black text-slate-700">আপনার অভিজ্ঞ পরামর্শ দিন</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={replyName || ""}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="আপনার নাম/পদবী (যেমন: জাহিদ, ফ্রিল্যান্সার)"
                              className="text-xs bg-white border border-slate-200 p-2 rounded-lg outline-none focus:border-amber-500 transition font-medium"
                            />
                          </div>
                          <textarea
                            rows={3}
                            value={replyText || ""}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="আপনার পরামর্শ বা উত্তরটি এখানে লিখুন..."
                            className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg outline-none focus:border-amber-500 transition font-medium"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setActiveReplyId(null)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer border-none"
                            >
                              বাতিল
                            </button>
                            <button
                              onClick={() => handleGiveAdvice(q.id)}
                              disabled={isSubmittingReply}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-[10px] font-black transition cursor-pointer border-none flex items-center gap-1"
                            >
                              {isSubmittingReply ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  প্রকাশ হচ্ছে...
                                </>
                              ) : (
                                "পরামর্শ প্রকাশ করুন"
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

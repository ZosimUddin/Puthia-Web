import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  ScrollText, 
  CalendarClock, 
  Download, 
  PenLine, 
  X, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Building2, 
  Printer, 
  FileText, 
  Sparkles,
  Check,
  Plus,
  Trash2,
  Loader2,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Props { onGoBack: () => void; }

interface Workshop {
  id: string;
  title: string;
  organizer: string;
  duration: string;
  eligibility: string;
  status: "ongoing" | "upcoming";
  timeLeft?: string;
  startDate?: string;
  type: string;
  location: string;
  interviewDate: string;
  allowance: string;
}

const workshopsData: Workshop[] = [
  {
    id: "computer-6m",
    title: "কম্পিউটার প্রশিক্ষণ কোর্স (অফিস অ্যাপ্লিকেশন ও গ্রাফিক্স)",
    organizer: "উপজেলা যুব উন্নয়ন কার্যালয়, পুঠিয়া",
    duration: "৬ মাস (ফ্রি ফি)",
    eligibility: "এসএসসি পাস (কমপক্ষে দ্বিতীয় বিভাগ বা জিপিএ ২.৫)",
    status: "ongoing",
    timeLeft: "৩ দিন বাকি",
    type: "সরকারি যুব উন্নয়ন",
    location: "উপজেলা ডিজিটাল আইসিটি ল্যাব, পুঠিয়া",
    interviewDate: "প্রতি রবিবার সকাল ১০:০০ টা",
    allowance: "দৈনিক ১০০ টাকা হাজিরা ভাতা ও ফ্রি টিফিন সুবিধা"
  },
  {
    id: "tailoring-3m",
    title: "আধুনিক সেলাই ও দর্জি বিজ্ঞান প্রশিক্ষণ",
    organizer: "উপজেলা মহিলা বিষয়ক কর্মকর্তার কার্যালয়, পুঠিয়া",
    duration: "৩ মাস (সম্পূর্ণ বিনামূল্যে)",
    eligibility: "অষ্টম শ্রেণী পাস",
    status: "upcoming",
    startDate: "১ জুলাই, ২০২৬",
    type: "মহিলা বিষয়ক অধিদপ্তর",
    location: "উপজেলা পরিষদ মহিলা প্রশিক্ষণ কেন্দ্র, পুঠিয়া",
    interviewDate: "২৭ জুন থেকে ৩০ জুন সকাল ১১:০০ টা",
    allowance: "উপস্থিতি সাপেক্ষে মাসে ১,৫০০ টাকা যাতায়াত ভাতা"
  },
  {
    id: "freelancing-3d",
    title: "ফ্রি ফ্রিল্যান্সিং ও আউটসোর্সিং কর্মশালা",
    organizer: "পুঠিয়া আইটি পার্ক ও আইসিটি সেল",
    duration: "৩ দিন (সার্টিফিকেটসহ)",
    eligibility: "এইচএসসি পাস/চলমান স্নাতক শিক্ষার্থী",
    status: "upcoming",
    startDate: "১৫ জুলাই, ২০২৬",
    type: "আইসিটি ও যুব সেল",
    location: "পুঠিয়া মডেল স্কুল অডিটোরিয়াম",
    interviewDate: "আবেদনকারীদের মধ্য থেকে মেধার ভিত্তিতে সরাসরি নির্বাচন",
    allowance: "ফ্রি লাঞ্চ, টিফিন ও আকর্ষণীয় স্টার্টআপ মেটেরিয়ালস"
  },
  {
    id: "dairy-farming-7d",
    title: "আধুনিক দুগ্ধ খামার ও মৎস্য চাষ ব্যবস্থাপনা",
    organizer: "উপজেলা প্রাণিসম্পদ ও মৎস্য অধিদপ্তর, পুঠিয়া",
    duration: "৭ দিন (সার্টিফিকেটসহ)",
    eligibility: "কৃষক, গৃহিণী ও নতুন খামারি উদ্যোক্তা",
    status: "upcoming",
    startDate: "১০ আগস্ট, ২০২৬",
    type: "উপজেলা প্রাণিসম্পদ ও মৎস্য বিভাগ",
    location: "উপজেলা প্রাণিসম্পদ প্রশিক্ষণ হলরুম, পুঠিয়া",
    interviewDate: "সরাসরি প্রথম ১০০ জন আবেদনকারীকে সুযোগ দেওয়া হবে",
    allowance: "দৈনিক ৫০০ টাকা যাতায়াত ও খাবার ভাতা (মোট ৩,৫০০ টাকা)"
  }
];

export const TrainingWorkshops: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"ongoing" | "upcoming">("ongoing");
  const [selectedRegWorkshop, setSelectedRegWorkshop] = useState<Workshop | null>(null);
  const [selectedNoticeWorkshop, setSelectedNoticeWorkshop] = useState<Workshop | null>(null);
  
  // Post Workshop form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrganizer, setNewOrganizer] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newEligibility, setNewEligibility] = useState("");
  const [newStatus, setNewStatus] = useState<"ongoing" | "upcoming">("ongoing");
  const [newTimeLeft, setNewTimeLeft] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [newAllowance, setNewAllowance] = useState("");
  const [isPostingWorkshop, setIsPostingWorkshop] = useState(false);

  // Firestore local workshops state
  const [dbWorkshops, setDbWorkshops] = useState<Workshop[]>([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  // Load workshops from Firestore
  useEffect(() => {
    const q = query(collection(db, "local_workshops"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Workshop[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          organizer: data.organizer || "",
          duration: data.duration || "",
          eligibility: data.eligibility || "",
          status: data.status || "ongoing",
          timeLeft: data.timeLeft || "",
          startDate: data.startDate || "",
          type: data.type || "",
          location: data.location || "",
          interviewDate: data.interviewDate || "",
          allowance: data.allowance || "",
        });
      });
      setDbWorkshops(list);
      setIsLoadingWorkshops(false);
    }, (error) => {
      console.error("Error loading local workshops:", error);
      setIsLoadingWorkshops(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "local_workshops");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Post a new workshop notice
  const handlePostWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newTitle.trim() || 
      !newOrganizer.trim() || 
      !newDuration.trim() || 
      !newEligibility.trim() || 
      !newType.trim() || 
      !newLocation.trim() || 
      !newInterviewDate.trim() || 
      !newAllowance.trim() ||
      (newStatus === "ongoing" && !newTimeLeft.trim()) ||
      (newStatus === "upcoming" && !newStartDate.trim())
    ) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPostingWorkshop(true);
    try {
      await addDoc(collection(db, "local_workshops"), {
        title: newTitle.trim(),
        organizer: newOrganizer.trim(),
        duration: newDuration.trim(),
        eligibility: newEligibility.trim(),
        status: newStatus,
        timeLeft: newStatus === "ongoing" ? newTimeLeft.trim() : "",
        startDate: newStatus === "upcoming" ? newStartDate.trim() : "",
        type: newType.trim(),
        location: newLocation.trim(),
        interviewDate: newInterviewDate.trim(),
        allowance: newAllowance.trim(),
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewTitle("");
      setNewOrganizer("");
      setNewDuration("");
      setNewEligibility("");
      setNewTimeLeft("");
      setNewStartDate("");
      setNewType("");
      setNewLocation("");
      setNewInterviewDate("");
      setNewAllowance("");
      setShowPostForm(false);
      alert("প্রশিক্ষণ নোটিশটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting local workshop:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      try {
        handleFirestoreError(err, OperationType.CREATE, "local_workshops");
      } catch (e) {
        console.warn(e);
      }
    } finally {
      setIsPostingWorkshop(false);
    }
  };

  // Delete a workshop notice posting
  const handleWorkshopDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই নোটিশটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "local_workshops", id));
      alert("নোটিশটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting workshop:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
      try {
        handleFirestoreError(err, OperationType.DELETE, `local_workshops/${id}`);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Form states
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantQualification, setApplicantQualification] = useState("এসএসসি পাস");
  const [applicantUnion, setApplicantUnion] = useState("পুঠিয়া পৌরসভা");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regReceipt, setRegReceipt] = useState<any>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      showToast("দয়া করে আপনার নাম লিখুন");
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.length < 11) {
      showToast("সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন");
      return;
    }
    if (!selectedRegWorkshop) return;

    setIsSubmitting(true);
    const appId = `PUTHIA-TR-${Math.floor(10000 + Math.random() * 90000)}`;
    const regData = {
      appId,
      name: applicantName,
      phone: applicantPhone,
      qualification: applicantQualification,
      union: applicantUnion,
      address: applicantAddress,
      courseId: selectedRegWorkshop.id,
      courseTitle: selectedRegWorkshop.title,
      organizer: selectedRegWorkshop.organizer,
      createdAt: new Date().toISOString(),
      status: "অনুমোদনের অপেক্ষায় (Pending)"
    };

    try {
      // Real Firebase Firestore integration
      await addDoc(collection(db, "training_registrations"), regData);
    } catch (err) {
      console.warn("Firestore save failed, falling back to localStorage:", err);
    }

    // Save to local storage as fallback/redundancy
    try {
      const existing = JSON.parse(localStorage.getItem("training_registrations") || "[]");
      existing.push(regData);
      localStorage.setItem("training_registrations", JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    setIsSubmitting(false);
    setRegReceipt(regData);
    setSelectedRegWorkshop(null);
    
    // Clear form
    setApplicantName("");
    setApplicantPhone("");
    setApplicantAddress("");
  };

  const allWorkshops = [...dbWorkshops, ...workshopsData];
  const activeWorkshops = allWorkshops.filter(w => w.status === filter);

  const handlePrint = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick refresh to restore app state safely
  };

  const handleDownloadNoticeFile = (workshop: Workshop) => {
    showToast("নোটিশ পিডিএফ ডাউনলোড শুরু হচ্ছে...");
    setTimeout(() => {
      const content = `
=============================================
  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
  উপজেলা নির্বাহী অফিসারের কার্যালয়, পুঠিয়া, রাজশাহী
=============================================
মেমো নং: ইউএনও/পুঠিয়া/প্রশিক্ষণ-২০২৬/${Math.floor(100 + Math.random() * 900)}
তারিখ: ২৭ জুন, ২০২৬

বিষয়: "${workshop.title}" সংক্রান্ত বিশেষ বিজ্ঞপ্তি।

এতদ্বারা পুঠিয়া উপজেলার সর্বসাধারণের অবগতির জন্য জানানো যাচ্ছে যে, "${workshop.organizer}" এর ব্যবস্থাপনায় নিম্নবর্ণিত কোর্সটিতে ভর্তির জন্য আগ্রহী প্রার্থীদের কাছ থেকে দরখাস্ত আহ্বান করা যাচ্ছে।

১. কোর্সের নাম: ${workshop.title}
২. কোর্সের মেয়াদ: ${workshop.duration}
৩. শিক্ষাগত যোগ্যতা: ${workshop.eligibility}
৪. ক্লাস ভেন্যু: ${workshop.location}
৫. সাক্ষাৎকারের তারিখ: ${workshop.interviewDate}
৬. বিশেষ সুবিধা: ${workshop.allowance}

শর্তাবলী:
- আবেদনকারীকে অবশ্যই পুঠিয়া উপজেলার স্থায়ী বাসিন্দা হতে হবে।
- প্রশিক্ষণ চলাকালীন নূন্যতম ৮০% উপস্থিতি বাধ্যতামূলক।

আদেশক্রমে,
উপজেলা নির্বাহী অফিসার, পুঠিয়া, রাজশাহী।
=============================================
      `;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Notice_${workshop.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("নোটিশ সফলভাবে ডাউনলোড হয়েছে!");
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2 border border-cyan-400">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #0f172a, #0f766e)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-cyan-400 text-sm font-medium mb-2 uppercase tracking-wide flex items-center gap-1">
            <GraduationCap className="w-4 h-4" /> দক্ষতা উন্নয়ন ও আত্মকর্মসংস্থান
          </p>
          <h1 className="text-4xl font-black mb-1 text-white tracking-tight leading-tight">প্রশিক্ষণ ও কর্মশালা নোটিশ</h1>
          <div className="w-12 h-1 bg-[#22d3ee] rounded-full my-3"></div>
          <p className="text-gray-200 text-sm md:text-base max-w-lg leading-relaxed">
            কম্পিউটার ট্রেইনিং, সেলাই, ড্রাইভিং, আধুনিক কৃষি এবং ফ্রিল্যান্সিং-এর উপর পুঠিয়ায় চলমান ও আপকামিং প্রশিক্ষণ কর্মশালা।
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <GraduationCap className="w-48 h-48 text-white" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("ongoing")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "ongoing"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${filter === "ongoing" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            চলমান কোর্স
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "upcoming"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <ScrollText className={`w-4 h-4 ${filter === "upcoming" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            আগামী কর্মশালা
          </button>
        </div>

        {/* Post Button */}
        <div className="px-1">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 active:scale-[0.99] border-none"
          >
            {showPostForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন প্রশিক্ষণ/কর্মশালা নোটিশ পোস্ট করুন"}
          </button>
        </div>

        {/* Post Form */}
        <AnimatePresence>
          {showPostForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handlePostWorkshopSubmit}
              className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md space-y-4 overflow-hidden"
            >
              <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" /> নতুন প্রশিক্ষণ বা কর্মশালা বিজ্ঞপ্তি
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                উপজেলা যুব উন্নয়ন, মহিলা বিষয়ক বা যেকোনো প্রতিষ্ঠানের দক্ষতা উন্নয়নমূলক কোর্সের বিবরণ দিয়ে বিজ্ঞপ্তি পোস্ট করুন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">কোর্সের ক্যাটাগরি (স্ট্যাটাস): *</label>
                  <select
                    value={newStatus || ""}
                    onChange={(e) => setNewStatus(e.target.value as "ongoing" | "upcoming")}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="ongoing">🔴 চলমান কোর্স (Ongoing)</option>
                    <option value="upcoming">🟢 আগামী কর্মশালা (Upcoming)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">প্রশিক্ষণের নাম/কোর্সের শিরোনাম: *</label>
                  <input
                    type="text"
                    required
                    value={newTitle || ""}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="যেমন: ড্রাইভিং ও অটোমেকানিক্স প্রশিক্ষণ"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আয়োজক/ব্যবস্থাপনা প্রতিষ্ঠান: *</label>
                  <input
                    type="text"
                    required
                    value={newOrganizer || ""}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="যেমন: উপজেলা যুব উন্নয়ন কার্যালয়, পুঠিয়া"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আয়োজনের ধরন/সংস্থা: *</label>
                  <input
                    type="text"
                    required
                    value={newType || ""}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="যেমন: সরকারি যুব উন্নয়ন"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">কোর্সের মেয়াদ: *</label>
                  <input
                    type="text"
                    required
                    value={newDuration || ""}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="যেমন: ৩ মাস (সম্পূর্ণ বিনামূল্যে)"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">শিক্ষাগত যোগ্যতা: *</label>
                  <input
                    type="text"
                    required
                    value={newEligibility || ""}
                    onChange={(e) => setNewEligibility(e.target.value)}
                    placeholder="যেমন: অষ্টম শ্রেণী পাস"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              {newStatus === "ongoing" ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আবেদনের সময়সীমা (চলমান কোটার জন্য): *</label>
                  <input
                    type="text"
                    required
                    value={newTimeLeft || ""}
                    onChange={(e) => setNewTimeLeft(e.target.value)}
                    placeholder="যেমন: ৫ দিন বাকি"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">শুরুর তারিখ (আগামী কর্মশালার জন্য): *</label>
                  <input
                    type="text"
                    required
                    value={newStartDate || ""}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    placeholder="যেমন: ১০ জুলাই, ২০২৬"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্লাস ভেন্যু/ঠিকানা: *</label>
                  <input
                    type="text"
                    required
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="যেমন: উপজেলা কারিগরি প্রশিক্ষণ কেন্দ্র, পুঠিয়া"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">বাছাই সাক্ষাৎকার/নির্বাচন তথ্য: *</label>
                  <input
                    type="text"
                    required
                    value={newInterviewDate || ""}
                    onChange={(e) => setNewInterviewDate(e.target.value)}
                    placeholder="যেমন: প্রতি রবিবার সকাল ১০:০০ টা"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">সুবিধা ও দৈনিক ভাতা: *</label>
                <input
                  type="text"
                  required
                  value={newAllowance || ""}
                  onChange={(e) => setNewAllowance(e.target.value)}
                  placeholder="যেমন: দৈনিক ১৫০ টাকা হাজিরা ভাতা ও ফ্রি দুপুরের খাবার"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isPostingWorkshop}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-black rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-teal-600/10"
              >
                {isPostingWorkshop ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    বিজ্ঞপ্তি সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> নোটিশ পোস্ট করুন
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Dynamic List */}
        <div className="space-y-4">
          {isLoadingWorkshops ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
            </div>
          ) : activeWorkshops.length > 0 ? (
            activeWorkshops.map((workshop) => (
              <div 
                key={workshop.id}
                className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-4 relative overflow-hidden animate-fade-in hover:border-[#22d3ee]/50 transition-all hover:shadow-lg"
              >
                {/* Status Badge & Delete Button */}
                <div className="absolute top-0 right-0 flex items-center">
                  {!workshopsData.some(sw => sw.id === workshop.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkshopDelete(workshop.id);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors mr-1 cursor-pointer border-none bg-transparent"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {workshop.status === "ongoing" ? (
                    <div className="py-1.5 px-4 bg-red-50 text-red-600 text-[10px] font-extrabold rounded-bl-2xl flex items-center gap-1 border-l border-b border-red-100">
                      <CalendarClock className="w-3.5 h-3.5 animate-pulse text-red-500" /> {workshop.timeLeft}
                    </div>
                  ) : (
                    <div className="py-1.5 px-4 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold rounded-bl-2xl flex items-center gap-1 border-l border-b border-emerald-100">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" /> শুরু: {workshop.startDate}
                    </div>
                  )}
                </div>

                <div className="pr-16">
                  <span className="text-[10px] font-black text-[#0f766e] bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    {workshop.type}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 leading-snug tracking-tight mt-1">
                    {workshop.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {workshop.organizer}
                  </p>
                </div>
                
                {/* Details card inside */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-500 shrink-0">কোর্সের মেয়াদ:</span>
                    <span className="text-xs font-extrabold text-slate-800 text-right">{workshop.duration}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-500 shrink-0">আবেদনের যোগ্যতা:</span>
                    <span className="text-xs font-extrabold text-slate-800 text-right">{workshop.eligibility}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-slate-500 shrink-0">সুবিধা ও ভাতা:</span>
                    <span className="text-xs font-extrabold text-emerald-600 text-right">{workshop.allowance}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 w-full mt-1">
                  <button 
                    onClick={() => setSelectedRegWorkshop(workshop)}
                    className="flex-1 py-3 text-xs font-extrabold text-slate-900 bg-[#22d3ee] rounded-xl hover:bg-cyan-300 transition-all shadow-md shadow-cyan-300/30 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                  >
                    <PenLine className="w-4 h-4" /> অনলাইন রেজিস্ট্রেশন
                  </button>
                  <button 
                    onClick={() => setSelectedNoticeWorkshop(workshop)}
                    className="flex-[0.8] py-3 text-xs font-extrabold text-[#0f766e] bg-teal-50 rounded-xl hover:bg-teal-100 transition-all border border-teal-100 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> নোটিশ ডাউনলোড
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-12 animate-fade-in">
              <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">এই ক্যাটাগরিতে বর্তমানে কোনো কর্মশালা উপলব্ধ নেই</p>
            </div>
          )}
        </div>
      </div>

      {/* ONLINE REGISTRATION MODAL */}
      {selectedRegWorkshop && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#22d3ee]" />
                <div>
                  <h3 className="text-sm font-black text-white">অনলাইন আবেদন ফরম</h3>
                  <p className="text-[10px] text-gray-300 font-medium">দক্ষতা উন্নয়ন ও কর্মসংস্থান উদ্যোগ</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRegWorkshop(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-cyan-50/80 p-3.5 rounded-2xl border border-cyan-100/60 mb-2">
                <span className="text-[9px] font-extrabold text-[#0f766e] uppercase tracking-wider block">নির্বাচিত কোর্স:</span>
                <h4 className="text-xs font-black text-slate-800 leading-snug mt-0.5">{selectedRegWorkshop.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" /> {selectedRegWorkshop.organizer}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-400" /> আবেদনকারীর সম্পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="যেমন: মোঃ জসিম উদ্দিন"
                  value={applicantName || ""}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50/50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-slate-400" /> সচল মোবাইল নম্বর (SMS পাওয়ার জন্য) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  maxLength={11}
                  placeholder="যেমন: 017XXXXXXXX"
                  value={applicantPhone || ""}
                  onChange={(e) => setApplicantPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50/50"
                />
                <p className="text-[9px] text-slate-400 font-semibold">আপনার মোবাইল নম্বরে সাক্ষাৎকারের সময় ও স্থান এসএমএস করে জানানো হবে।</p>
              </div>

              {/* Qualification & Union Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> শিক্ষাগত যোগ্যতা <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={applicantQualification || ""}
                    onChange={(e) => setApplicantQualification(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50"
                  >
                    <option value="অষ্টম শ্রেণী পাস">অষ্টম শ্রেণী পাস</option>
                    <option value="এসএসসি পাস">এসএসসি পাস</option>
                    <option value="এইচএসসি পাস">এইচএসসি পাস</option>
                    <option value="স্নাতক/ডিগ্রি">স্নাতক/ডিগ্রি</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" /> ইউনিয়ন <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={applicantUnion || ""}
                    onChange={(e) => setApplicantUnion(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50"
                  >
                    <option value="পুঠিয়া পৌরসভা">পুঠিয়া পৌরসভা</option>
                    <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                    <option value="বানেশ্বর">বানেশ্বর</option>
                    <option value="বেলপুকুর">বেলপুকুর</option>
                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                    <option value="জিউপাড়া">জিউপাড়া</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> গ্রাম ও ডাকঘর <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="যেমন: গ্রাম- চেরাগ্রাহ, ডাকঘর- পুঠিয়া"
                  value={applicantAddress || ""}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50/50"
                />
              </div>

              {/* Warning/Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 items-start text-[10px] text-amber-800 leading-normal font-medium">
                <span className="text-amber-500 mt-0.5 font-bold">⚠️</span>
                <span>আবেদন জমা দেওয়ার পর তথ্য পরিবর্তন করা যাবে না। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।</span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#0f766e] text-white font-extrabold text-xs rounded-xl hover:bg-teal-800 transition-colors cursor-pointer outline-none shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    আবেদন প্রসেস হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> আবেদন জমা দিন (Submit Application)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION RECEIPT SUCCESS MODAL */}
      {regReceipt && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 text-center border-b border-slate-100 relative">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800">আবেদন সফলভাবে জমা হয়েছে!</h3>
              <p className="text-xs text-slate-500 mt-1">আপনার আবেদনের বিস্তারিত বিবরণ নিচে দেওয়া হলো।</p>
              <button 
                onClick={() => setRegReceipt(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print Area */}
            <div id="receipt-print-area" className="p-6 bg-slate-50/50 space-y-4">
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 space-y-3 relative">
                {/* Decorative cutouts for ticket look */}
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border-r border-dashed border-slate-200 rounded-full"></div>
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border-l border-dashed border-slate-200 rounded-full"></div>
                
                <div className="text-center pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-700 tracking-wider">আমাদের পুঠিয়া - ডিজিটাল রসিদ</h4>
                  <span className="inline-block bg-cyan-50 text-cyan-700 font-extrabold text-[10px] px-3 py-1 rounded-full border border-cyan-100 mt-1.5">
                    ID: {regReceipt.appId}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">আবেদনকারীর নাম:</span>
                    <span className="text-slate-800 font-extrabold text-right">{regReceipt.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>
                    <span className="text-slate-800 font-extrabold text-right">{regReceipt.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ইউনিয়ন ও গ্রাম:</span>
                    <span className="text-slate-800 font-extrabold text-right">{regReceipt.union}, {regReceipt.address}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100/60 pt-2">
                    <span className="text-slate-500 font-medium">মনোনীত কোর্স:</span>
                    <span className="text-cyan-700 font-extrabold text-right max-w-[200px] leading-snug">{regReceipt.courseTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">ব্যবস্থাপনা:</span>
                    <span className="text-slate-700 font-bold text-right">{regReceipt.organizer}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100/60 pt-2">
                    <span className="text-slate-500 font-medium">আবেদনের সময়:</span>
                    <span className="text-slate-600 font-semibold">{new Date(regReceipt.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">বর্তমান স্ট্যাটাস:</span>
                    <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> {regReceipt.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed px-4">
                * অনুগ্রহ করে রসিদটি সংরক্ষণ করুন। আপনার তথ্য যাচাইয়ের পর ৩টি কার্যদিবসের মধ্যে এসএমএস পাঠানো হবে।
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <button 
                onClick={() => handlePrint("receipt-print-area")}
                className="flex-1 py-3 text-xs font-black text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট করুন (Print)
              </button>
              <button 
                onClick={() => setRegReceipt(null)}
                className="flex-[0.8] py-3 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED NOTICE VISUAL BOARD MODAL */}
      {selectedNoticeWorkshop && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-black text-white">অফিসিয়াল সার্কুলার / বিজ্ঞপ্তি</h3>
                  <p className="text-[9px] text-gray-300 font-medium">উপজেলা আইসিটি ও দক্ষতা উন্নয়ন সেল</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNoticeWorkshop(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Paper Area */}
            <div className="overflow-y-auto p-6 bg-amber-50/20 flex-1">
              <div 
                id="notice-board-print-area" 
                className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm text-slate-800 space-y-6 relative overflow-hidden"
                style={{
                  boxShadow: "inset 0 0 40px rgba(251, 191, 36, 0.03)"
                }}
              >
                {/* Embedded subtle watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                  <GraduationCap className="w-96 h-96 text-slate-900 rotate-12" />
                </div>

                {/* Gov Headings */}
                <div className="text-center space-y-1 relative z-10">
                  <div className="w-10 h-10 bg-[#0f766e]/10 text-[#0f766e] rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-black border border-[#0f766e]/20">
                    🇧🇩
                  </div>
                  <h2 className="text-sm font-black text-slate-950 tracking-wider">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h2>
                  <h3 className="text-xs font-black text-slate-900">উপজেলা নির্বাহী অফিসারের কার্যালয়</h3>
                  <p className="text-[10px] text-slate-600 font-bold">পুঠিয়া, রাজশাহী।</p>
                  <p className="text-[9px] text-[#0f766e] font-extrabold uppercase tracking-widest mt-1">আইসিটি ও দক্ষতা উন্নয়ন সেল</p>
                </div>

                {/* Memo & Date row */}
                <div className="flex justify-between text-[10px] text-slate-500 font-extrabold border-b border-dashed border-slate-200 pb-3 relative z-10">
                  <span>মেমো নং: ইউএনও/পুঠিয়া/প্রশিক্ষণ-২০২৬/৩৭১</span>
                  <span>তারিখ: ২৭ জুন, ২০২৬</span>
                </div>

                {/* Circular Title */}
                <div className="text-center py-2 relative z-10">
                  <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-200 uppercase tracking-wide">
                    জরুরী ভর্তি বিজ্ঞপ্তি
                  </span>
                </div>

                {/* Notice Text */}
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-medium relative z-10">
                  <p>
                    এতদ্বারা পুঠিয়া উপজেলার সর্বসাধারণ ও যুবক-যুবতীদের অবগতির জন্য জানানো যাচ্ছে যে, উপজেলার বেকারত্ব দূরীকরণ ও আত্মকর্মসংস্থান সৃষ্টির লক্ষ্যে <b>"${selectedNoticeWorkshop.organizer}"</b> এর ব্যবস্থাপনায় নিম্নবর্ণিত কোর্সে সম্পূর্ণ সরকারি খরচে ও বৃত্তিসহ প্রশিক্ষণ প্রদানের জন্য আগ্রহী প্রার্থীদের নিকট হতে দরখাস্ত আহ্বান করা যাচ্ছে।
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2 text-[11px]">
                    <div>
                      📍 <b>১. কোর্সের নাম:</b> <span className="text-slate-950 font-extrabold">{selectedNoticeWorkshop.title}</span>
                    </div>
                    <div>
                      ⏰ <b>২. কোর্সের মেয়াদ:</b> <span className="text-slate-950 font-extrabold">{selectedNoticeWorkshop.duration}</span>
                    </div>
                    <div>
                      🎓 <b>৩. শিক্ষাগত যোগ্যতা:</b> <span className="text-slate-950 font-extrabold">{selectedNoticeWorkshop.eligibility}</span>
                    </div>
                    <div>
                      🏫 <b>৪. ভেন্যু/শ্রেণীকক্ষ:</b> <span className="text-[#0f766e] font-extrabold">{selectedNoticeWorkshop.location}</span>
                    </div>
                    <div>
                      📅 <b>৫. বাছাই সাক্ষাৎকার:</b> <span className="text-red-600 font-extrabold">{selectedNoticeWorkshop.interviewDate}</span>
                    </div>
                    <div>
                      💰 <b>৬. ভাতা ও অন্যান্য সুবিধা:</b> <span className="text-emerald-700 font-extrabold">{selectedNoticeWorkshop.allowance}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <h4 className="font-extrabold text-slate-900 border-l-2 border-[#0f766e] pl-1.5">আবেদনের শর্তাবলী ও নিয়ম:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 font-semibold">
                      <li>আবেদনকারীকে অবশ্যই পুঠিয়া উপজেলার স্থায়ী নাগরিক হতে হবে।</li>
                      <li>সাক্ষাৎকারের দিন সকল শিক্ষাগত যোগ্যতার মূল সনদ ও জাতীয় পরিচয়পত্র/জন্ম সনদের ফটোকপি সাথে আনতে হবে।</li>
                      <li>প্রশিক্ষণ চলাকালীন নিয়মিত ও কঠোর শৃঙ্খলা মেনে ক্লাসে অংশ নিতে হবে।</li>
                    </ul>
                  </div>
                </div>

                {/* Authority Sign */}
                <div className="pt-6 flex justify-end text-right relative z-10">
                  <div className="space-y-1">
                    <div className="w-24 h-8 border-b border-dashed border-slate-300 ml-auto opacity-40"></div>
                    <p className="text-[11px] font-black text-slate-950">মোহাম্মদ আনিসুর রহমান</p>
                    <p className="text-[9px] text-slate-500 font-bold">উপজেলা নির্বাহী অফিসার (ইউএনও)</p>
                    <p className="text-[9px] text-slate-400 font-semibold">পুঠিয়া, রাজশাহী।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
              <button 
                onClick={() => handlePrint("notice-board-print-area")}
                className="flex-1 py-3 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট নোটিশ (Print)
              </button>
              <button 
                onClick={() => handleDownloadNoticeFile(selectedNoticeWorkshop)}
                className="flex-1 py-3 text-xs font-black text-white bg-[#0f766e] hover:bg-teal-800 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> পিডিএফ ডাউনলোড (Download)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

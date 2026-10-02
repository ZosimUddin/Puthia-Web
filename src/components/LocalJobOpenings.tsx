import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  Send, 
  Briefcase, 
  GraduationCap, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Check,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Props { onGoBack: () => void; }

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "full" | "part";
  qualification: string;
  experience: string;
  deadline: string;
  contactPerson: string;
  phone: string;
  description: string;
  responsibilities: string[];
}

const jobsData: Job[] = [
  {
    id: "yamaha-sales",
    title: "সেলস এক্সিকিউটিভ (Sales Executive)",
    company: "যমহা মোটরসাইকেল শোরুম (মোল্লা মটরস)",
    location: "বানেশ্বর বাজার ট্রাফিক মোড়, পুঠিয়া",
    salary: "৳১২,০০০ - ৳১৫,০০০ (টিএ/ডিএ ও কমিশনসহ)",
    type: "full",
    qualification: "এইচএসসি (HSC) অথবা স্নাতক পাস",
    experience: "মোটরসাইকেল বা অটোমোবাইল সেলস-এ ১ বছরের অভিজ্ঞতা অগ্রাধিকার পাবে (নতুনরাও আবেদন করতে পারবে)",
    deadline: "১৫ জুলাই, ২০২৬",
    contactPerson: "মোঃ আল-আমিন (ম্যানেজার)",
    phone: "01711223344",
    description: "শোরুমে আগত কাস্টমারদের মোটরসাইকেল সম্পর্কে বিস্তারিত তথ্য প্রদান করা এবং সেলস বৃদ্ধিতে ভূমিকা রাখা।",
    responsibilities: [
      "কাস্টমারদের বন্ধুত্বপূর্ণভাবে রিসিভ করা ও বাইকের স্পেসিফিকেশন বুঝিয়ে বলা।",
      "নিয়মিত কাস্টমার ফলো-আপ এবং দৈনিক সেলস রিপোর্ট এন্ট্রি করা।",
      "ফেসবুক পেইজে আসা কাস্টমারদের ইনবক্সে রেসপন্স করা।"
    ]
  },
  {
    id: "hospital-cc",
    title: "রিসেপশনিস্ট ও কাস্টমার কেয়ার (Receptionist)",
    company: "পুঠিয়া ডিজিটাল ডায়াগনস্টিক অ্যান্ড ক্লিনিক",
    location: "পুঠিয়া সদর হাসপাতাল রোড, পুঠিয়া",
    salary: "৳১০,০০০ - ৳১২,০০০",
    type: "full",
    qualification: "এইচএসসি (HSC) পাস (মহিলা প্রার্থীদের অগ্রাধিকার)",
    experience: "বেসিক কম্পিউটার ও এমএস অফিস চালনায় পারদর্শী হতে হবে",
    deadline: "১০ জুলাই, ২০২৬",
    contactPerson: "ডাঃ এস. কে. রায় (পরিচালক)",
    phone: "01722334455",
    description: "রোগীদের সিরিয়াল ম্যানেজমেন্ট, বিলিং সিস্টেম পরিচালনা এবং ডাক্তারদের শিডিউল নিয়ন্ত্রণ করা।",
    responsibilities: [
      "রোগীদের অভ্যর্থনা জানানো এবং প্রয়োজনীয় সেবা কাউন্টারে পাঠানো।",
      "ল্যাব টেস্ট বিলিং সফটওয়্যার পরিচালনা করা (ট্রেনিং দেওয়া হবে)।",
      "হাসপাতালের হেল্পলাইন ফোন রিসিভ করা এবং তথ্য প্রদান করা।"
    ]
  },
  {
    id: "math-tutor",
    title: "হোম টিউটর (শ্রেণী: ৮ম ও ৯ম, গণিত ও বিজ্ঞান)",
    company: "শিক্ষার্থী অভিভাবক সরাসরি",
    location: "পুঠিয়া রাজবাড়ী সংলগ্ন (থানার পেছনে)",
    salary: "৳৩,৫০০ (প্রতি মাসে, সপ্তাহে ৩ দিন)",
    type: "part",
    qualification: "বিশ্ববিদ্যালয়/কলেজে অনার্স অধ্যয়নরত শিক্ষার্থী",
    experience: "পূর্বে নূন্যতম ১ বছর পড়ানোর অভিজ্ঞতা থাকতে হবে",
    deadline: "০৫ জুলাই, ২০২৬",
    contactPerson: "মোছাঃ ফাতেমা বেগম (অভিভাবক)",
    phone: "01733445566",
    description: "৮ম ও ৯ম শ্রেণীর একজন ছাত্রকে গণিত ও সাধারণ বিজ্ঞান বিষয়ে নিয়মিত পাঠদান ও হোমওয়ার্ক তদারকি করা।",
    responsibilities: [
      "সপ্তাহে ৩ দিন (বিকাল ৪:০০ টা থেকে ৫:৩০ টা) পড়ানো।",
      "সাপ্তাহিক পরীক্ষার মাধ্যমে মেধা মূল্যায়ন করা।",
      "পড়ালেখার অগ্রগতি অভিভাবককে নিয়মিত জানানো।"
    ]
  },
  {
    id: "delivery-rider",
    title: "ডেলিভারি রাইডার (Delivery Rider)",
    company: "পুঠিয়া এক্সপ্রেস কুরিয়ার অ্যান্ড ফুড",
    location: "পুঠিয়া ও বানেশ্বর পৌরসভা এলাকা",
    salary: "৳৮,০০০ + প্রতিটি ডেলিভারিতে ২০ টাকা কমিশন",
    type: "part",
    qualification: "ন্যূনতম এসএসসি পাস",
    experience: "নিজস্ব বাইসাইকেল/মোটরসাইকেল ও এন্ড্রয়েড মোবাইল থাকতে হবে",
    deadline: "২০ জুলাই, ২০২৬",
    contactPerson: "নিলয় রহমান (অপারেশন হেড)",
    phone: "01744556677",
    description: "পুঠিয়া ও বানেশ্বর বাজার এলাকার কাস্টমারদের ঠিকানায় খাবার ও ই-কমার্স পার্সেল দ্রুত এবং নিরাপদে ডেলিভারি করা।",
    responsibilities: [
      "অফিস থেকে পার্সেল বুঝে নিয়ে কাস্টমারের কাছে পৌঁছে দেওয়া।",
      "কাস্টমারের কাছ থেকে ক্যাশ অন ডেলিভারি (COD) টাকা সংগ্রহ করা।",
      "মার্জিত আচরণ বজায় রাখা এবং সময়ের গুরুত্ব দেওয়া।"
    ]
  }
];

export const LocalJobOpenings: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"full" | "part">("full");
  const [selectedContactJob, setSelectedContactJob] = useState<Job | null>(null);
  const [selectedApplyJob, setSelectedApplyJob] = useState<Job | null>(null);
  
  // Submit CV form states
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantEdu, setApplicantEdu] = useState("এইচএসসি পাস");
  const [applicantExp, setApplicantExp] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobReceipt, setJobReceipt] = useState<any>(null);

  // Post Job form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newType, setNewType] = useState<"full" | "part">("full");
  const [newQualification, setNewQualification] = useState("");
  const [newExperience, setNewExperience] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newResponsibilities, setNewResponsibilities] = useState("");
  const [isPostingJob, setIsPostingJob] = useState(false);

  // Firestore local jobs state
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Load jobs from Firestore
  useEffect(() => {
    const q = query(collection(db, "local_jobs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Job[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          salary: data.salary || "",
          type: data.type || "full",
          qualification: data.qualification || "",
          experience: data.experience || "",
          deadline: data.deadline || "",
          contactPerson: data.contactPerson || "",
          phone: data.phone || "",
          description: data.description || "",
          responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
        });
      });
      setDbJobs(list);
      setIsLoadingJobs(false);
    }, (error) => {
      console.error("Error loading local jobs:", error);
      setIsLoadingJobs(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "local_jobs");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Post a new job
  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newTitle.trim() || 
      !newCompany.trim() || 
      !newLocation.trim() || 
      !newSalary.trim() || 
      !newQualification.trim() || 
      !newDeadline.trim() || 
      !newContactPerson.trim() || 
      !newPhone.trim() ||
      !newDescription.trim()
    ) {
      alert("দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setIsPostingJob(true);
    try {
      const responsibilitiesList = newResponsibilities
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      await addDoc(collection(db, "local_jobs"), {
        title: newTitle.trim(),
        company: newCompany.trim(),
        location: newLocation.trim(),
        salary: newSalary.trim(),
        type: newType,
        qualification: newQualification.trim(),
        experience: newExperience.trim(),
        deadline: newDeadline.trim(),
        contactPerson: newContactPerson.trim(),
        phone: newPhone.trim(),
        description: newDescription.trim(),
        responsibilities: responsibilitiesList,
        createdAt: serverTimestamp(),
      });

      // Clear fields
      setNewTitle("");
      setNewCompany("");
      setNewLocation("");
      setNewSalary("");
      setNewQualification("");
      setNewExperience("");
      setNewDeadline("");
      setNewContactPerson("");
      setNewPhone("");
      setNewDescription("");
      setNewResponsibilities("");
      setShowPostForm(false);
      alert("কর্মসংস্থান বিজ্ঞপ্তিটি সফলভাবে পোস্ট করা হয়েছে!");
    } catch (err) {
      console.error("Error posting local job:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      try {
        handleFirestoreError(err, OperationType.CREATE, "local_jobs");
      } catch (e) {
        console.warn(e);
      }
    } finally {
      setIsPostingJob(false);
    }
  };

  // Delete a job posting
  const handleJobDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কর্মসংস্থান বিজ্ঞপ্তিটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "local_jobs", id));
      alert("বিজ্ঞপ্তিটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
      try {
        handleFirestoreError(err, OperationType.DELETE, `local_jobs/${id}`);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const allJobs = [...dbJobs, ...jobsData];
  const activeJobs = allJobs.filter(job => job.type === filter);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      showToast("দয়া করে আপনার নাম লিখুন");
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.length < 11) {
      showToast("সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন");
      return;
    }
    if (!selectedApplyJob) return;

    setIsSubmitting(true);
    const appId = `PUTHIA-JOB-${Math.floor(10000 + Math.random() * 90000)}`;
    const applicationData = {
      appId,
      name: applicantName,
      phone: applicantPhone,
      qualification: applicantEdu,
      experience: applicantExp,
      address: applicantAddress,
      jobId: selectedApplyJob.id,
      jobTitle: selectedApplyJob.title,
      company: selectedApplyJob.company,
      createdAt: new Date().toISOString(),
      status: "আবেদন প্রাপ্ত হয়েছে (Under Review)"
    };

    try {
      // Real Firebase integration
      await addDoc(collection(db, "job_applications"), applicationData);
    } catch (err) {
      console.warn("Firestore save failed, saving locally:", err);
    }

    // Save to local storage as fallback
    try {
      const existing = JSON.parse(localStorage.getItem("job_applications") || "[]");
      existing.push(applicationData);
      localStorage.setItem("job_applications", JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    setIsSubmitting(false);
    setJobReceipt(applicationData);
    setSelectedApplyJob(null);

    // Clear form
    setApplicantName("");
    setApplicantPhone("");
    setApplicantExp("");
    setApplicantAddress("");
    showToast("আপনার সিভি সফলভাবে জমা হয়েছে!");
  };

  const handlePrintReceipt = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick refresh to restore app state cleanly
  };

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-full shadow-2xl z-50 flex items-center gap-2 border border-cyan-400"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #0f172a, #0d9488)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <p className="text-cyan-400 text-sm font-medium mb-2 uppercase tracking-wide flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-cyan-300" /> স্থানীয় কর্মসংস্থান
          </p>
          <h1 className="text-4xl font-black mb-1 text-white tracking-tight leading-tight">পুঠিয়ার স্থানীয় কর্মসংস্থান</h1>
          <div className="w-12 h-1 bg-[#22d3ee] rounded-full my-3"></div>
          <p className="text-gray-200 text-xs md:text-sm max-w-lg leading-relaxed">
            পুঠিয়া, বানেশ্বর এবং এর আশেপাশের এলাকার স্থানীয় এনজিও, শোরুম, রাইস মিল বা ক্লিনিকে চাকরির শূন্যপদ।
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Briefcase className="w-48 h-48 text-white" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFilter("full")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "full"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Briefcase className={`w-4 h-4 ${filter === "full" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            ফুল-টাইম জব
          </button>
          <button
            onClick={() => setFilter("part")}
            className={`py-3.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
              filter === "part"
                ? "bg-[#0f172a] text-[#22d3ee] border-2 border-[#22d3ee]/30"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Clock className={`w-4 h-4 ${filter === "part" ? 'text-[#22d3ee]' : 'text-gray-400'}`}/>
            পার্ট-টাইম/কন্ট্রাক্ট
          </button>
        </div>

        {/* Post Button */}
        <div className="px-1">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-700/20 active:scale-[0.99] border-none"
          >
            {showPostForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showPostForm ? "বিজ্ঞপ্তি ফরম বন্ধ করুন" : "নতুন নিয়োগ বিজ্ঞপ্তি পোস্ট করুন"}
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
              onSubmit={handlePostJobSubmit}
              className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md space-y-4 overflow-hidden"
            >
              <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" /> নতুন নিয়োগ বিজ্ঞপ্তি দিন
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                আপনার প্রতিষ্ঠান, শোরুম, ক্লিনিক বা প্রাইভেট সার্ভিসের জন্য নতুন কর্মী নিয়োগের বিজ্ঞপ্তি দিন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">কাজের ধরন: *</label>
                  <select
                    value={newType || ""}
                    onChange={(e) => setNewType(e.target.value as "full" | "part")}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="full">💼 ফুল-টাইম জব (Full-time)</option>
                    <option value="part">🕒 পার্ট-টাইম/কন্ট্রাক্ট (Part-time)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">পদের নাম: *</label>
                  <input
                    type="text"
                    required
                    value={newTitle || ""}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="যেমন: সেলস এক্সিকিউটিভ"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">প্রতিষ্ঠান/কোম্পানির নাম: *</label>
                  <input
                    type="text"
                    required
                    value={newCompany || ""}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="যেমন: যমহা মোটরসাইকেল শোরুম"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ঠিকানা/লোকেশন: *</label>
                  <input
                    type="text"
                    required
                    value={newLocation || ""}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="যেমন: বানেশ্বর বাজার ট্রাফিক মোড়, পুঠিয়া"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">মাসিক বেতন: *</label>
                  <input
                    type="text"
                    required
                    value={newSalary || ""}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="যেমন: ৳১২,০০০ - ৳১৫,০০০"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আবেদনের শেষ তারিখ: *</label>
                  <input
                    type="text"
                    required
                    value={newDeadline || ""}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="যেমন: ১৫ জুলাই, ২০২৬"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">শিক্ষাগত যোগ্যতা: *</label>
                  <input
                    type="text"
                    required
                    value={newQualification || ""}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="যেমন: এইচএসসি পাস"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">কাজের অভিজ্ঞতা (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={newExperience || ""}
                    onChange={(e) => setNewExperience(e.target.value)}
                    placeholder="যেমন: ১ বছরের অভিজ্ঞতা"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">যোগাযোগের ব্যক্তি: *</label>
                  <input
                    type="text"
                    required
                    value={newContactPerson || ""}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="যেমন: মোঃ আল-আমিন (ম্যানেজার)"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">মোবাইল নম্বর: *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone || ""}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">কাজের বিবরণ: *</label>
                <textarea
                  required
                  rows={2}
                  value={newDescription || ""}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="যেমন: শোরুমে আগত কাস্টমারদের মোটরসাইকেল সম্পর্কে বিস্তারিত তথ্য প্রদান করা এবং সেলস বৃদ্ধিতে ভূমিকা রাখা।"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">কাজের দায়িত্ব (প্রতি লাইনে ১টি করে তথ্য দিন):</label>
                <textarea
                  rows={3}
                  value={newResponsibilities || ""}
                  onChange={(e) => setNewResponsibilities(e.target.value)}
                  placeholder="যেমন:&#10;কাস্টমারদের বন্ধুত্বপূর্ণভাবে রিসিভ করা ও বাইকের স্পেসিফিকেশন বুঝিয়ে বলা।&#10;নিয়মিত কাস্টমার ফলো-আপ এবং দৈনিক সেলস রিপোর্ট এন্ট্রি করা।"
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-teal-500 transition font-medium text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPostingJob}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-xs font-black rounded-2xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-teal-600/10"
              >
                {isPostingJob ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    বিজ্ঞপ্তি সাবমিট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> নিয়োগ বিজ্ঞপ্তি পোস্ট করুন
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Job Listings */}
        <div className="space-y-4">
          {isLoadingJobs ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
            </div>
          ) : activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col gap-4 relative overflow-hidden animate-fade-in hover:border-[#22d3ee]/50 transition-all hover:shadow-lg"
              >
                {/* Job Tag */}
                <div className="absolute top-0 right-0 flex items-center">
                  {!jobsData.some(sj => sj.id === job.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobDelete(job.id);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors mr-1 cursor-pointer border-none bg-transparent"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="py-1.5 px-4 bg-teal-50 text-teal-700 text-[10px] font-extrabold rounded-bl-2xl border-l border-b border-teal-100">
                    {job.type === "full" ? "ফুল-টাইম" : "পার্ট-টাইম"}
                  </div>
                </div>

                <div className="pr-16">
                  <h3 className="text-lg font-black text-slate-800 leading-snug tracking-tight">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.company}
                  </p>
                </div>

                {/* Main Details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 space-y-2">
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><b>লোকেশন:</b> {job.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 border-t border-slate-200/50 pt-2">
                    <GraduationCap className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><b>যোগ্যতা:</b> {job.qualification}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 border-t border-slate-200/50 pt-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><b>বেতন:</b> <span className="text-teal-700 font-extrabold">{job.salary}</span></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-semibold text-slate-700 border-t border-slate-200/50 pt-2">
                    <Calendar className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span><b>আবেদনের শেষ তারিখ:</b> <span className="text-red-600 font-bold">{job.deadline}</span></span>
                  </div>
                </div>

                {/* Expandable/Extra details */}
                <div className="text-xs text-slate-600 leading-relaxed font-medium bg-cyan-50/30 p-3.5 rounded-2xl border border-cyan-100/30">
                  <p className="font-extrabold text-slate-700 mb-1">📋 কাজের বিবরণ ও দায়িত্ব:</p>
                  <p className="mb-2">{job.description}</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] font-semibold text-slate-600">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 w-full mt-1">
                  <button 
                    onClick={() => setSelectedContactJob(job)}
                    className="flex-1 py-3 text-xs font-extrabold text-slate-900 bg-[#22d3ee] rounded-xl hover:bg-cyan-300 transition-all shadow-md shadow-cyan-300/30 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4" /> সরাসরি যোগাযোগ
                  </button>
                  <button 
                    onClick={() => setSelectedApplyJob(job)}
                    className="flex-1 py-3 text-xs font-extrabold text-[#0f766e] bg-teal-50 rounded-xl hover:bg-teal-100 transition-all border border-teal-100 flex items-center justify-center gap-1.5 cursor-pointer outline-none active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" /> সিভি জমা দিন
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-12 animate-fade-in">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">বর্তমানে কোনো কর্মসংস্থান উপলব্ধ নেই</p>
            </div>
          )}
        </div>
      </div>

      {/* DIRECT CONTACT MODAL */}
      <AnimatePresence>
        {selectedContactJob && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-950 text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">নিয়োগকর্তার তথ্য</h3>
                    <p className="text-[9px] text-gray-300 font-medium">সরাসরি কল করে যোগাযোগ করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedContactJob(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-100 text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-[#0f766e] uppercase tracking-wider">{selectedContactJob.company}</span>
                  <h4 className="text-sm font-black text-slate-800 leading-tight">{selectedContactJob.title}</h4>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-bold">যোগাযোগের ব্যক্তি:</span>
                    <span className="text-slate-800 font-extrabold">{selectedContactJob.contactPerson}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <span className="text-slate-500 font-bold">মোবাইল নম্বর:</span>
                    <span className="text-cyan-700 font-black text-sm">{selectedContactJob.phone}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-500 font-bold">কল করার সময়:</span>
                    <span className="text-emerald-600 font-extrabold">সকাল ৯:০০ - সন্ধ্যা ৬:০০ টা</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 items-start text-[10px] text-amber-800 leading-normal font-medium">
                  <span className="text-amber-500 mt-0.5 font-bold">⚠️</span>
                  <span>কল করার সময় ভদ্রতা বজায় রাখুন। চাকরির রেফারেন্স হিসেবে "আমাদের পুঠিয়া" অ্যাপের কথা উল্লেখ করুন।</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-2">
                  <a 
                    href={`tel:${selectedContactJob.phone}`}
                    className="flex-1 py-3 bg-[#0f766e] text-white font-extrabold text-xs rounded-xl hover:bg-teal-800 transition-colors text-center shadow-lg shadow-teal-700/20 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" /> কল করুন (Call Now)
                  </a>
                  <button 
                    onClick={() => setSelectedContactJob(null)}
                    className="px-5 py-3 text-xs font-black text-slate-700 bg-slate-150 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBMIT CV / ONLINE APPLY MODAL */}
      <AnimatePresence>
        {selectedApplyJob && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">অনলাইন আবেদন ও সিভি সাবমিট</h3>
                    <p className="text-[10px] text-gray-300 font-medium">আপনার সঠিক তথ্য দিয়ে সরাসরি আবেদন করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApplyJob(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form */}
              <form onSubmit={handleApplySubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-teal-50/80 p-3.5 rounded-2xl border border-teal-100/60 mb-2">
                  <span className="text-[9px] font-extrabold text-[#0f766e] uppercase tracking-wider block">আবেদনকৃত পদ:</span>
                  <h4 className="text-xs font-black text-slate-800 leading-snug mt-0.5">{selectedApplyJob.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" /> {selectedApplyJob.company}
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" /> আপনার সম্পূর্ণ নাম <span className="text-red-500">*</span>
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
                    <Phone className="w-4 h-4 text-slate-400" /> সচল মোবাইল নম্বর <span className="text-red-500">*</span>
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
                </div>

                {/* Educational Qualification */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> শিক্ষাগত যোগ্যতা <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={applicantEdu || ""}
                    onChange={(e) => setApplicantEdu(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50"
                  >
                    <option value="এসএসসি পাস">এসএসসি (SSC) পাস</option>
                    <option value="এইচএসসি পাস">এইচএসসি (HSC) পাস</option>
                    <option value="অনার্স/স্নাতক">অনার্স / স্নাতক</option>
                    <option value="মাস্টার্স/স্নাতকোত্তর">মাস্টার্স / স্নাতকোত্তর</option>
                    <option value="অন্যান্য/ডিপ্লোমা">অন্যান্য / ডিপ্লোমা</option>
                  </select>
                </div>

                {/* Skill and Experience summary */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-slate-400" /> পূর্বের কাজের অভিজ্ঞতা ও সংক্ষিপ্ত সিভি <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="আপনার কাজের অভিজ্ঞতা, স্কিল এবং সংক্ষিপ্ত প্রোফাইল বিবরণ এখানে লিখুন..."
                    value={applicantExp || ""}
                    onChange={(e) => setApplicantExp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" /> গ্রাম ও ইউনিয়ন <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="যেমন: গ্রাম- চেরাগ্রাহ, ইউনিয়ন- ভালুকগাছী"
                    value={applicantAddress || ""}
                    onChange={(e) => setApplicantAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent outline-none transition-all font-medium bg-slate-50/50"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0f766e] text-white font-extrabold text-xs rounded-xl hover:bg-teal-800 transition-colors cursor-pointer outline-none shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      সিভি আপলোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> আবেদন জমা দিন (Submit CV)
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOB APPLICATION RECEIPT SUCCESS MODAL */}
      <AnimatePresence>
        {jobReceipt && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center border-b border-slate-100 relative">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
                </div>
                <h3 className="text-lg font-black text-slate-800">সিভি সফলভাবে জমা হয়েছে!</h3>
                <p className="text-xs text-slate-500 mt-1">আপনার ডিজিটাল রসিদ নিচে প্রস্তুত করা হলো।</p>
                <button 
                  onClick={() => setJobReceipt(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Receipt */}
              <div id="job-receipt-print-area" className="p-6 bg-slate-50/50 space-y-4">
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 space-y-3 relative">
                  <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border-r border-dashed border-slate-200 rounded-full"></div>
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 border-l border-dashed border-slate-200 rounded-full"></div>
                  
                  <div className="text-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black text-slate-700 tracking-wider">আমাদের পুঠিয়া - চাকুরি আবেদন</h4>
                    <span className="inline-block bg-teal-50 text-teal-700 font-extrabold text-[10px] px-3 py-1 rounded-full border border-teal-100 mt-1.5">
                      APPLICATION ID: {jobReceipt.appId}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">আবেদনকারীর নাম:</span>
                      <span className="text-slate-800 font-extrabold text-right">{jobReceipt.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">মোবাইল নম্বর:</span>
                      <span className="text-slate-800 font-extrabold text-right">{jobReceipt.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">গ্রাম ও ঠিকানা:</span>
                      <span className="text-slate-800 font-extrabold text-right">{jobReceipt.address}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/60 pt-2">
                      <span className="text-slate-500 font-medium">আবেদনকৃত পদ:</span>
                      <span className="text-[#0f766e] font-extrabold text-right max-w-[200px] leading-snug">{jobReceipt.jobTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">কোম্পানি:</span>
                      <span className="text-slate-700 font-bold text-right">{jobReceipt.company}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/60 pt-2">
                      <span className="text-slate-500 font-medium">জমার তারিখ:</span>
                      <span className="text-slate-600 font-semibold">{new Date(jobReceipt.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">বর্তমান অবস্থা:</span>
                      <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {jobReceipt.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed px-4">
                  * রসিদটি আপনার নিকট সংরক্ষণ করুন। নিয়োগকারী কর্তৃপক্ষ আপনার তথ্যাবলী যাচাই করে সরাসরি আপনার মোবাইলে যোগাযোগ করবে।
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-100 flex gap-2 bg-white">
                <button 
                  onClick={() => handlePrintReceipt("job-receipt-print-area")}
                  className="flex-1 py-3 text-xs font-black text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট রসিদ (Print)
                </button>
                <button 
                  onClick={() => setJobReceipt(null)}
                  className="flex-[0.8] py-3 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer outline-none flex items-center justify-center"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

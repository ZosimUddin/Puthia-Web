import React, { useState, useEffect, useMemo } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, where } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "./FavoriteContext";
import { Job, CVProfile, JobApplication } from "./jobs/types";
import { JobForm } from "./jobs/JobForm";
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  Trophy,
  Users,
  DollarSign,
  CheckCircle2,
  Bell,
  FileText,
  Phone,
  Mail,
  Award,
  Bookmark,
  Zap,
  Timer,
  AlertTriangle,
  Send,
  Check,
  Plus,
  ArrowLeft,
  ChevronDown,
  Lock,
  Eye,
  Flag,
  Search,
  Filter,
  X,
  Building2,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  ThumbsUp,
  ShieldAlert,
  UserCheck,
  RotateCcw,
  Globe,
  Radio,
  Share,
  Layers,
  Building,
  School,
  Hospital,
  Laptop,
  Wrench,
  ShoppingBag,
  Car,
  HardHat,
  UserCheck2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JobPortalProps {
  onGoBack?: () => void;
  initialType?: string;
  initialSearch?: string;
  initialCategory?: string;
}

// 12 Specific Category Cards with Icons & Matching Identifiers
export const JOB_CATEGORY_CARDS = [
  { id: "government", label: "🏛️ সরকারি চাকরি", key: "govt", icon: Building2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "private", label: "🏢 বেসরকারি চাকরি", key: "private", icon: Building, color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "bank", label: "🏦 ব্যাংক চাকরি", key: "bank", icon: DollarSign, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "teaching", label: "🏫 শিক্ষকতা", key: "education", icon: School, color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "healthcare", label: "🏥 স্বাস্থ্যসেবা চাকরি", key: "clinic", icon: Hospital, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "it", label: "💻 আইটি চাকরি", key: "it", icon: Laptop, color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "technical", label: "🛠️ কারিগরি চাকরি", key: "technician", icon: Wrench, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "sales", label: "🛒 দোকান/বিক্রয় চাকরি", key: "shop", icon: ShoppingBag, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "driver", label: "🚗 ড্রাইভার", key: "driver", icon: Car, color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "worker", label: "👷 শ্রমিক/মিস্ত্রি", key: "construction", icon: HardHat, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "office", label: "🧑‍💼 অফিস/প্রশাসনিক", key: "office", icon: UserCheck2, color: "bg-slate-100 text-slate-800 border-slate-200" },
  { id: "remote", label: "🌐 ফ্রিল্যান্সিং/রিমোট", key: "remote", icon: Globe, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export function JobPortal({ 
  onGoBack,
  initialType = "all",
  initialSearch = "",
  initialCategory = "all"
}: JobPortalProps = {}) {
  const { user, userProfile } = useAuth();
  const { isSaved, toggleSave } = useFavorites();

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSaveJob = (job: Job) => {
    const newlySaved = !isSaved(job.id);
    toggleSave({
      id: job.id,
      type: "job",
      title: job.title,
      subtitle: job.company
    });
    if (newlySaved) {
      showToast("🔖 চাকরিটি আপনার সংরক্ষিত তালিকায় যুক্ত হয়েছে।");
    } else {
      showToast("সংসংরক্ষিত তালিকা থেকে সরানো হয়েছে।");
    }
  };

  // State managers
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "expired" | "saved" | "pending" | "alert">("active");
  
  // Selected Job Detail View
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Modal controllers
  const [showPostForm, setShowPostForm] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Quick Filter Chip State
  const [quickFilter, setQuickFilter] = useState<string>("all");

  // Report fields
  const [reportReason, setReportReason] = useState("fake");
  const [reportComments, setReportComments] = useState("");
  const [reportingStatus, setReportingStatus] = useState<"idle" | "loading" | "success">("idle");

  // Notification Preferences
  const [notifCategories, setNotifCategories] = useState<{ [key: string]: boolean }>({
    government: true,
    bank: true,
    teaching: true,
    it: true,
    private: true,
  });
  const [notifContact, setNotifContact] = useState("");

  // Search & Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedSalary, setSelectedSalary] = useState("all");
  const [selectedEducation, setSelectedEducation] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  // Example search keywords
  const EXAMPLE_KEYWORDS = ["শিক্ষক", "কম্পিউটার অপারেটর", "হিসাবরক্ষক", "ড্রাইভার", "ফার্মাসিস্ট", "ম্যানেজার"];

  // Helper Deadline Calculator
  const getDeadlineInfo = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (isNaN(deadline.getTime()) || diff <= 0) {
      return { status: "expired", label: "🔴 আবেদন শেষ", daysLeft: 0, badgeBg: "bg-rose-100 text-rose-700 border-rose-200" };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 3) {
      return { status: "urgent", label: `🟡 শেষ সময়ের কাছাকাছি (${days === 0 ? "আজই শেষ" : days + " দিন বাকি"})`, daysLeft: days, badgeBg: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { status: "running", label: `🟢 আবেদন চলছে (${days} দিন বাকি)`, daysLeft: days, badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  // Sync Jobs from Firestore & Seed Sample Data
  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        const sampleJobsList: Omit<Job, "id">[] = [
          {
            title: "কম্পিউটার অপারেটর ও ফ্রন্ট ডেসক এক্সিকিউটিভ",
            company: "বানেশ্বর ইউপি ডিজিটাল সেবা কেন্দ্র",
            location: "বানেশ্বর ইউনিয়ন পরিষদ, পুঠিয়া",
            union: "baneshwar",
            salary: "৳ ১৫,০০০ – ২০,০০০",
            type: "full-time",
            category: "office",
            description: "বানেশ্বর ইউনিয়ন ডিজিটাল সেন্টারে সরকারি ই-সেবা, ডাটা এন্ট্রি, নাগরিক নিবন্ধন ও গ্রাহক সেবা কার্যক্রমে আগ্রহী কম্পিউটার অপারেটর আবশ্যক।",
            requirements: ["কম্পিউটার টাইপিং বাংলা ২০ ও ইংরেজি ৩০ wpm", "MS Word, Excel, Email ব্যবহার সক্ষমতা", "সৎ ও দায়িত্বশীল মনোভাব"],
            experience: "১ বছর",
            education: "hsc",
            ageLimit: "১৮ - ৩০ বছর",
            benefits: ["মোবাইল এলাউন্স", "ঈদ বোনাস", "উৎসব ভাতা"],
            phone: "01712-345678",
            email: "baneshwar.digital@gmail.com",
            deadline: "2026-09-10",
            postedDate: "2026-08-01",
            isFeatured: true,
            isUrgent: true,
            status: "active",
            views: 184,
            createdAt: new Date().toISOString()
          },
          {
            title: "সহকারী শিক্ষক (গণিত ও বিজ্ঞান)",
            company: "পুঠিয়া মডেল একাডেমি ও উচ্চ বিদ্যালয়",
            location: "রাজবাড়ী চত্বর রোড, পুঠিয়া সদর",
            union: "puthia",
            salary: "৳ ১২,০০০ – ১৮,০০০",
            type: "teaching",
            category: "education",
            description: "পুঠিয়া উপজেলার স্বনামধন্য মডেল একাডেমিতে মাধ্যমিক শাখার শিক্ষার্থীদের জন্য গণিত ও বিজ্ঞান বিষয়ে পাঠদানে অভিজ্ঞ সহকারী শিক্ষক আবশ্যক।",
            requirements: ["প্রাসঙ্গিক বিষয়ে অনার্স বা বিএসসি ডিগ্রি", "সুন্দর বাচনভঙ্গি ও শৃঙ্খলাবোধ", "শ্রেণিকক্ষে সৃজনশীল পদ্ধতিতে পাঠদানের যোগ্যতা"],
            experience: "১–২ বছর",
            education: "honours",
            benefits: ["বাৎসরিক বেতন বৃদ্ধি", "উৎসব বোনাস"],
            phone: "01787-654321",
            email: "puthiamodelacademy@gmail.com",
            deadline: "2026-08-28",
            postedDate: "2026-08-05",
            isFeatured: true,
            isUrgent: false,
            status: "active",
            views: 120,
            createdAt: new Date().toISOString()
          },
          {
            title: "জুনিয়র সেলস ও কালেকশন অফিসার",
            company: "ব্র্যাক ব্যাংক এনজিও শাখা - পুঠিয়া",
            location: "বানেশ্বর বাজার, পুঠিয়া, রাজশাহী",
            union: "baneshwar",
            salary: "৳ ২০,০০০ – ২৫,০০০",
            type: "bank",
            category: "bank",
            description: "পুঠিয়া উপজেলার বানেশ্বর ব্রাঞ্চে মাইক্রো-ফাইন্যান্স ও খুচরা ঋণ বিতরণের জন্য স্থানীয় উদ্যমী মাঠ কর্মকর্তা / ফিল্ড অফিসার প্রয়োজন।",
            requirements: ["মোটরসাইকেল বা বাইসাইকেল চালনায় পারদর্শী", "স্থানীয় ভৌগোলিক এলাকা সম্পর্কে স্পষ্ট ধারণা", "যোগাযোগে চটপটে হতে হবে"],
            experience: "অভিজ্ঞতা ছাড়াই আবেদনযোগ্য",
            education: "hsc",
            benefits: ["বাইক তেল খরচ", "মেডিকেল ইন্স্যুরেন্স", "পারফরম্যান্স বোনাস"],
            phone: "01711-223344",
            email: "hr.puthia@brac.net",
            deadline: "2026-08-25",
            postedDate: "2026-08-08",
            isFeatured: false,
            isUrgent: true,
            status: "active",
            views: 98,
            createdAt: new Date().toISOString()
          },
          {
            title: "পিকআপ ও ডেলিভারি ড্রাইভার",
            company: "কুরিয়ার অ্যান্ড লজিস্টিকস পুঠিয়া শাখা",
            location: "ঝলমলিয়া বাসস্ট্যান্ড, শিলমাড়িয়া, পুঠিয়া",
            union: "shilmaria",
            salary: "৳ ১৫,০০০",
            type: "driver",
            category: "driver",
            description: "পুঠিয়া এবং নাটোর রোডে লাইট পিকআপ চালিয়ে পার্সেল ও পণ্য নিরাপদে পৌঁছে দেওয়ার জন্য বৈধ ড্রাইভিং লাইসেন্সধারী ড্রাইভার প্রয়োজন।",
            requirements: ["বৈধ লাইট ড্রাইভিং লাইসেন্স", "পুঠিয়া ও পার্শ্ববর্তী রুট চেনা", "ভারী মালামাল লোড-আনলোডে সহায়তা"],
            experience: "২ বছর",
            education: "ssc",
            benefits: ["মোবাইল বিল", "ওভারটাইম সুবিধা"],
            phone: "01912-334455",
            deadline: "2026-08-20",
            postedDate: "2026-08-02",
            isFeatured: false,
            isUrgent: false,
            status: "active",
            views: 65,
            createdAt: new Date().toISOString()
          },
          {
            title: "সহকারী ফার্মাসিস্ট / ডিসপেনসার",
            company: "পুঠিয়া হেলথ কেয়ার ফার্মা",
            location: "হাসপাতাল রোড, পুঠিয়া সদর",
            union: "puthia",
            salary: "৳ ১০,০০০ – ১৫,০০০",
            type: "healthcare",
            category: "clinic",
            description: "উপজেলা স্বাস্থ্য কমপ্লেক্স মোড়ে পুঠিয়া হেলথ কেয়ার ফার্মেসি ডেসকে রোগী ও গ্রাহকদের ড্রাগস বিতরণের জন্য টেকনিশিয়ান ও ফার্মাসিস্ট আবশ্যক।",
            requirements: ["ফার্মেসি ফার্ম কোর্স করা অথবা সমমান অভিজ্ঞতা", "ঔষধের নাম ও ডোসেজ স্পষ্ট বোঝা"],
            experience: "১ বছর",
            education: "ssc",
            benefits: ["পার্ট টাইম ফ্রি মিল", "বোনাস"],
            phone: "01815-998877",
            deadline: "2026-08-30",
            postedDate: "2026-08-04",
            isFeatured: false,
            isUrgent: false,
            status: "active",
            views: 110,
            createdAt: new Date().toISOString()
          },
          {
            title: "রিমোট ডাটা এন্ট্রি ও ডিজিটাল মার্কেটিং সাপোর্ট",
            company: "পুঠিয়া আইটি হাব ও টেক সলিউশন",
            location: "বাসায় বসে কাজ (রিমোট / পুঠিয়া)",
            union: "puthia",
            salary: "৳ ১০,০০০ – ২৫,০০০ (কাজের গতি অনুযায়ী)",
            type: "remote",
            category: "remote",
            description: "ঘরে বসেই ইন্টারনেট ও ল্যাপটপ ব্যবহার করে সোশ্যাল মিডিয়া ম্যানেজমেন্ট ও ডাটা এন্ট্রি কাজের সুযোগ। নিজস্ব ল্যাপটপ থাকা আবশ্যক।",
            requirements: ["ইন্টারনেট ও সোশ্যাল মিডিয়া ব্যবহারে পটু", "গ্রাফিক্স ডিজাইন প্রাথমিক ধারণা থাকলে ভালো", "টাইপিং সক্ষমতা"],
            experience: "অভিজ্ঞতা ছাড়াই",
            education: "hsc",
            benefits: ["ফ্লেক্সিবল কাজের সময়", "অনলাইন ট্রেইনিং"],
            phone: "01755-667788",
            email: "jobs@puthiait.com",
            deadline: "2026-09-15",
            postedDate: "2026-08-10",
            isFeatured: true,
            isUrgent: false,
            status: "active",
            views: 210,
            createdAt: new Date().toISOString()
          }
        ];

        const sampleJobsWithIds = sampleJobsList.map((job, idx) => ({
          id: `sample-${idx + 1}`,
          ...job
        })) as Job[];

        setJobs(sampleJobsWithIds);
        setLoading(false);

        for (const job of sampleJobsList) {
          try {
            await addDoc(collection(db, "jobs"), job);
          } catch (e) {
            console.warn("Auto-seed store skipped:", e);
          }
        }
      } else {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Job));
        setJobs(docs);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error loading jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Increment views
  useEffect(() => {
    if (selectedJob?.id) {
      const sessionKey = `viewed_job_${selectedJob.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        const docRef = doc(db, "jobs", selectedJob.id);
        const newViews = (selectedJob.views || 0) + 1;
        updateDoc(docRef, { views: newViews }).catch(() => {});
      }
    }
  }, [selectedJob?.id]);

  // Calculate Dynamic Counts per Category Card
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    JOB_CATEGORY_CARDS.forEach(c => { counts[c.id] = 0; });

    jobs.filter(j => j.status === "active").forEach(j => {
      const typeLower = (j.type || "").toLowerCase();
      const catLower = (j.category || "").toLowerCase();
      const titleLower = (j.title || "").toLowerCase();
      const compLower = (j.company || "").toLowerCase();

      if (typeLower.includes("govt") || typeLower.includes("government") || titleLower.includes("সরকারি") || compLower.includes("ইউপি") || compLower.includes("উপজেলা")) {
        counts["government"] = (counts["government"] || 0) + 1;
      }
      if (typeLower.includes("private") || compLower.includes("সুপার") || compLower.includes("ফার্মা") || compLower.includes("কোম্পানি")) {
        counts["private"] = (counts["private"] || 0) + 1;
      }
      if (typeLower.includes("bank") || titleLower.includes("ব্যাংক") || titleLower.includes("অফিসার") || catLower.includes("bank")) {
        counts["bank"] = (counts["bank"] || 0) + 1;
      }
      if (typeLower.includes("teach") || titleLower.includes("শিক্ষক") || catLower.includes("education") || compLower.includes("স্কুল") || compLower.includes("একাডেমি")) {
        counts["teaching"] = (counts["teaching"] || 0) + 1;
      }
      if (typeLower.includes("health") || titleLower.includes("ফার্মাসিস্ট") || titleLower.includes("নার্স") || catLower.includes("clinic") || compLower.includes("হেলথ")) {
        counts["healthcare"] = (counts["healthcare"] || 0) + 1;
      }
      if (typeLower.includes("it") || titleLower.includes("কম্পিউটার") || catLower.includes("it") || titleLower.includes("ডেভেলপার") || titleLower.includes("ডাটা এন্ট্রি")) {
        counts["it"] = (counts["it"] || 0) + 1;
      }
      if (typeLower.includes("tech") || catLower.includes("technician") || titleLower.includes("মিস্ত্রি") || titleLower.includes("ইলেকট্রিশিয়ান")) {
        counts["technical"] = (counts["technical"] || 0) + 1;
      }
      if (typeLower.includes("sales") || catLower.includes("shop") || titleLower.includes("সেলস") || titleLower.includes("দোকান") || titleLower.includes("শোরুম")) {
        counts["sales"] = (counts["sales"] || 0) + 1;
      }
      if (typeLower.includes("driver") || titleLower.includes("ড্রাইভার") || titleLower.includes("চালক")) {
        counts["driver"] = (counts["driver"] || 0) + 1;
      }
      if (typeLower.includes("worker") || catLower.includes("construction") || titleLower.includes("শ্রমিক") || titleLower.includes("খামার")) {
        counts["worker"] = (counts["worker"] || 0) + 1;
      }
      if (typeLower.includes("office") || catLower.includes("office") || titleLower.includes("অফিস") || titleLower.includes("অপারেটর")) {
        counts["office"] = (counts["office"] || 0) + 1;
      }
      if (typeLower.includes("remote") || catLower.includes("remote") || titleLower.includes("রিমোট") || titleLower.includes("ফ্রিল্যান্স")) {
        counts["remote"] = (counts["remote"] || 0) + 1;
      }
    });

    return counts;
  }, [jobs]);

  // Main Filter Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const deadlineInfo = getDeadlineInfo(job.deadline);

      // Tab logic
      if (activeTab === "pending") {
        return job.status === "pending";
      }
      if (activeTab === "saved") {
        return isSaved(job.id);
      }
      if (activeTab === "expired") {
        return deadlineInfo.status === "expired";
      }
      // Default Active tab excludes expired jobs
      if (activeTab === "active") {
        if (job.status !== "active") return false;
        if (deadlineInfo.status === "expired") return false;
      }

      // Search Query
      if (search) {
        const term = search.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(term);
        const matchesCompany = job.company.toLowerCase().includes(term);
        const matchesDesc = job.description.toLowerCase().includes(term);
        const matchesLoc = job.location.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesLoc) return false;
      }

      // Quick Filter Chips
      if (quickFilter !== "all") {
        if (quickFilter === "new" && !job.isFeatured) return false;
        if (quickFilter === "near" && !job.location.includes("পুঠিয়া")) return false;
        if (quickFilter === "govt" && !(job.type === "government" || job.company.includes("ইউপি") || job.company.includes("উপজেলা"))) return false;
        if (quickFilter === "private" && (job.type === "government" || job.company.includes("ইউপি"))) return false;
        if (quickFilter === "remote" && !(job.type === "remote" || job.location.includes("রিমোট") || job.title.includes("রিমোট"))) return false;
        if (quickFilter === "high_salary" && job.salary.includes("১০,০০০")) return false;
        if (quickFilter === "unexpired" && deadlineInfo.status === "expired") return false;
      }

      // Category Selection
      if (selectedCategory !== "all") {
        const catObj = JOB_CATEGORY_CARDS.find(c => c.id === selectedCategory);
        if (catObj) {
          const typeLower = (job.type || "").toLowerCase();
          const catLower = (job.category || "").toLowerCase();
          const titleLower = (job.title || "").toLowerCase();
          const compLower = (job.company || "").toLowerCase();

          if (selectedCategory === "government" && !(typeLower.includes("govt") || titleLower.includes("সরকারি") || compLower.includes("ইউপি") || compLower.includes("উপজেলা"))) return false;
          if (selectedCategory === "private" && (typeLower.includes("govt") || compLower.includes("ইউপি"))) return false;
          if (selectedCategory === "bank" && !(typeLower.includes("bank") || titleLower.includes("ব্যাংক") || titleLower.includes("অফিসার"))) return false;
          if (selectedCategory === "teaching" && !(typeLower.includes("teach") || titleLower.includes("শিক্ষক") || compLower.includes("স্কুল"))) return false;
          if (selectedCategory === "healthcare" && !(typeLower.includes("health") || titleLower.includes("ফার্মাসিস্ট") || titleLower.includes("নার্স"))) return false;
          if (selectedCategory === "it" && !(typeLower.includes("it") || titleLower.includes("কম্পিউটার") || titleLower.includes("ডাটা এন্ট্রি"))) return false;
          if (selectedCategory === "remote" && !(typeLower.includes("remote") || titleLower.includes("রিমোট"))) return false;
        }
      }

      // Location / Union Filter
      if (selectedLocation !== "all" && job.union !== selectedLocation) return false;

      // Salary Filter
      if (selectedSalary !== "all") {
        if (selectedSalary === "negotiable" && !job.salary.includes("আলোচনা")) return false;
        if (selectedSalary === "10k-20k" && !job.salary.includes("১৫,০০০") && !job.salary.includes("১০,০০০")) return false;
        if (selectedSalary === "20k-30k" && !job.salary.includes("২০,০০০") && !job.salary.includes("২৫,০০০")) return false;
        if (selectedSalary === "30k+" && !job.salary.includes("৩০,০০০")) return false;
      }

      // Education Level Filter
      if (selectedEducation !== "all" && job.education !== selectedEducation) return false;

      // Experience Level Filter
      if (selectedExperience !== "all") {
        if (selectedExperience === "fresh" && !job.experience.includes("আই") && !job.experience.includes("নাই") && !job.experience.includes("ছাড়াই")) return false;
        if (selectedExperience === "1-2" && !job.experience.includes("১") && !job.experience.includes("২")) return false;
        if (selectedExperience === "3-5" && !job.experience.includes("৩") && !job.experience.includes("৫")) return false;
      }

      return true;
    });
  }, [jobs, activeTab, search, quickFilter, selectedCategory, selectedLocation, selectedSalary, selectedEducation, selectedExperience, isSaved]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearch("");
    setQuickFilter("all");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSalary("all");
    setSelectedEducation("all");
    setSelectedExperience("all");
    setShowAdvancedFiltersModal(false);
  };

  // Submit Fraud Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setReportingStatus("loading");

    try {
      await addDoc(collection(db, "reports"), {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        reason: reportReason,
        comments: reportComments,
        reportedBy: user?.uid || "guest",
        createdAt: new Date().toISOString()
      });
      setReportingStatus("success");
      setTimeout(() => {
        setReportingStatus("idle");
        setShowReportModal(false);
        setReportComments("");
        showToast("আপনার রিপোর্ট গ্রহণ করা হয়েছে। দ্রুত পর্যালোচিত হবে।");
      }, 1500);
    } catch (e) {
      console.error("Report submit error:", e);
      setReportingStatus("idle");
    }
  };

  // Submit Notification Subscription
  const handleNotificationSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifContact) {
      alert("অনুগ্রহ করে আপনার মোবাইল নম্বর অথবা ইমেইল লিখুন।");
      return;
    }
    showToast("আপনার পছন্দ সংরক্ষণ করা হয়েছে। নতুন চাকরির বিজ্ঞপ্তি পাঠানো হবে।");
    setShowNotificationModal(false);
  };

  // Share Job Link Handler
  const handleShareJob = async (job: Job) => {
    const shareUrl = `${window.location.origin}/jobs?id=${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} - ${job.company}`,
          text: `পুঠিয়া অ্যাপে ${job.company} এ ${job.title} পদের নিয়োগ বিজ্ঞপ্তি দেখুন:`,
          url: shareUrl
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    const success = await copyToClipboard(shareUrl);
    if (success) {
      showToast("লিংক কপি করা হয়েছে!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800">
      
      {/* Toast Popup Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs md:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Sticky Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onGoBack && (
              <button 
                onClick={onGoBack} 
                className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-1.5">
                <Briefcase size={22} className="text-emerald-700" />
                <span>চাকরি</span>
              </h1>
              <p className="text-[11px] md:text-xs text-slate-500 font-medium hidden sm:block">
                পুঠিয়া ও আশেপাশের এলাকার চাকরির সুযোগ খুঁজে নিন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded-xl flex items-center gap-1 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Bell size={16} />
              <span className="hidden md:inline">বিজ্ঞপ্তি পান</span>
            </button>
            <button 
              onClick={() => setShowPostForm(true)}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>চাকরি প্রকাশ করুন</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Subtitle Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white py-6 px-4 mb-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-bold tracking-wide mb-2">
              💼 Puthia Jobs & Employment Hub
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              পুঠিয়া ও আশেপাশের এলাকার নির্ভরযোগ্য চাকরির তথ্য
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-2xl">
              স্থানীয় সরকারি সেবা, দোকান, কারখানা, স্কুল, ড্রাইভিং, টেকনিক্যাল ও রিমোট কাজের শতভাগ যাচাইকৃত বিজ্ঞপ্তি।
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="p-2 bg-emerald-400 text-emerald-950 rounded-xl font-black">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-lg font-black text-white">{jobs.filter(j => j.status === "active").length} টি সক্রিয় বিজ্ঞপ্তি</div>
              <div className="text-[10px] text-blue-200">উপজেলার ৬টি ইউনিয়নে</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* 2. চাকরির ধরন (Service Cards Grid with Dynamic Job Counts) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-emerald-700" />
              <span>চাকরির ধরন</span>
            </h3>
            {selectedCategory !== "all" && (
              <button 
                onClick={() => setSelectedCategory("all")}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> সব দেখুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {JOB_CATEGORY_CARDS.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected 
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-md scale-[1.02]" 
                      : `bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl text-lg ${isSelected ? "bg-white/20 text-white" : cat.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {count} টি
                    </span>
                  </div>

                  <div>
                    <div className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {cat.label}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-600"}`}>
                      {count > 0 ? "আবেদন চলছে" : "নতুন আসবে"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. চাকরি খোঁজার Search & Keywords */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 চাকরি, প্রতিষ্ঠান বা পদের নাম লিখুন... (যেমন: শিক্ষক, ড্রাইভার)"
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition"
            />
            <button 
              onClick={() => setShowAdvancedFiltersModal(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">ফিল্টার</span>
            </button>
          </div>

          {/* Search Examples Tag Buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-slate-600">জনপ্রিয় খোঁজ:</span>
            {EXAMPLE_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => setSearch(kw)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                {kw}
              </button>
            ))}
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="text-[11px] font-bold text-rose-600 hover:underline ml-auto"
              >
                মুছে ফেলুন
              </button>
            )}
          </div>
        </section>

        {/* 4. Quick Filter Horizontal Chips */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "সব চাকরি" },
            { id: "new", label: "🆕 নতুন" },
            { id: "near", label: "📍 পুঠিয়া সদর/কাছাকাছি" },
            { id: "govt", label: "🏛️ সরকারি" },
            { id: "private", label: "🏢 বেসরকারি" },
            { id: "remote", label: "🏠 রিমোট" },
            { id: "high_salary", label: "💰 ভালো বেতন" },
            { id: "unexpired", label: "⏳ সময় বাকি আছে" }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(quickFilter === chip.id ? "all" : chip.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                quickFilter === chip.id 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs" 
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </section>

        {/* Tabs: Active / Expired / Saved / Pending */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "active" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>চাকরির সুযোগ</span>
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-md">{jobs.filter(j => j.status === "active" && getDeadlineInfo(j.deadline).status !== "expired").length}</span>
            </button>

            <button 
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "saved" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Bookmark size={14} />
              <span>সংরক্ষিত চাকরি</span>
            </button>

            <button 
              onClick={() => setActiveTab("expired")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "expired" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Clock size={14} />
              <span>মেয়াদ শেষ হওয়া চাকরি</span>
            </button>

            {jobs.some(j => j.status === "pending") && (
              <button 
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "pending" ? "bg-amber-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <AlertTriangle size={14} />
                <span>যাচাইাধীন ({jobs.filter(j => j.status === "pending").length})</span>
              </button>
            )}
          </div>

          <button 
            onClick={handleResetFilters}
            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <RotateCcw size={12} /> ফিল্টার রিসেট
          </button>
        </div>

        {/* 6. চাকরির তালিকা (Job List View) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              <span>
                {activeTab === "active" && "🧑‍💼 সকল চাকরির সুযোগ"}
                {activeTab === "saved" && "🔖 আপনার সংরক্ষিত চাকরির তালিকা"}
                {activeTab === "expired" && "🔴 মেয়াদ শেষ হওয়া চাকরি"}
                {activeTab === "pending" && "🟡 এডমিন যাচাইাধীন প্রস্তাবিত চাকরি"}
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              পাওয়া গেছে: <strong className="text-slate-900">{filteredJobs.length}টি</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold">চাকরির তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">কোনো চাকরি পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার খোঁজা ক্যাটাগরি বা শব্দে বর্তমানে কোনো সক্রিয় বিজ্ঞপ্তি নেই। অন্য শব্দ বা ফিল্টার রিসেট করে চেষ্টা করুন।
              </p>
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                সব ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => {
                const deadlineInfo = getDeadlineInfo(job.deadline);
                const saved = isSaved(job.id);

                return (
                  <div 
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                  >
                    {/* Top Row: Title, Company, Bookmark */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-black shrink-0 border border-blue-100">
                            {job.company ? job.company.charAt(0) : "🏢"}
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mb-1 ${deadlineInfo.badgeBg}`}>
                              {deadlineInfo.label}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                              {job.title}
                            </h4>
                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                              <Building2 size={13} className="text-slate-400" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleToggleSaveJob(job)}
                          className={`p-2 rounded-xl transition ${
                            saved 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                          }`}
                          title={saved ? "সংরক্ষণ করা হয়েছে" : "সংরক্ষণ করুন"}
                        >
                          <Bookmark size={18} className={saved ? "fill-amber-600" : ""} />
                        </button>
                      </div>

                      {/* Job Attributes Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin size={14} className="text-rose-500 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <DollarSign size={14} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <GraduationCap size={14} className="text-indigo-500 shrink-0" />
                          <span className="truncate uppercase">{job.education === "none" ? "যোগ্যতা প্রয়োজন নেই" : job.education}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate">শেষ: {job.deadline}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <span>বিস্তারিত</span>
                        <ChevronRight size={14} />
                      </button>

                      {job.phone ? (
                        <a 
                          href={`tel:${job.phone}`}
                          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <Phone size={14} />
                          <span>কল দিন</span>
                        </a>
                      ) : job.email ? (
                        <a 
                          href={`mailto:${job.email}`}
                          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <Mail size={14} />
                          <span>ইমেইল</span>
                        </a>
                      ) : (
                        <button 
                          onClick={() => setSelectedJob(job)}
                          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <span>আবেদন পদ্ধতি</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 7 & 8. JOB DETAILS FULL MODAL / SHEET */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto border border-slate-200">
            
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${getDeadlineInfo(selectedJob.deadline).badgeBg}`}>
                  {getDeadlineInfo(selectedJob.deadline).label}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  প্রকাশিত: {selectedJob.postedDate || "সাম্প্রতিক"}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                {selectedJob.title}
              </h2>

              <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 size={16} className="text-blue-600" />
                <span>{selectedJob.company}</span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => handleToggleSaveJob(selectedJob)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isSaved(selectedJob.id)
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <Bookmark size={16} className={isSaved(selectedJob.id) ? "fill-amber-600" : ""} />
                  <span>{isSaved(selectedJob.id) ? "সংরক্ষিত" : "সংরক্ষণ করুন"}</span>
                </button>

                <button 
                  onClick={() => handleShareJob(selectedJob)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Share2 size={16} />
                  <span>শেয়ার করুন</span>
                </button>

                <button 
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 ml-auto transition"
                >
                  <Flag size={14} />
                  <span className="hidden sm:inline">রিপোর্ট</span>
                </button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">📍 কর্মস্থল</span>
                <span className="font-bold text-slate-900">{selectedJob.location}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">💰 বেতন</span>
                <span className="font-bold text-emerald-700">{selectedJob.salary}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">🕐 চাকরির ধরন</span>
                <span className="font-bold text-slate-900 uppercase">{selectedJob.type}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">🎓 শিক্ষাগত যোগ্যতা</span>
                <span className="font-bold text-slate-900 uppercase">{selectedJob.education}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">💼 অভিজ্ঞতা</span>
                <span className="font-bold text-slate-900">{selectedJob.experience || "প্রযোজ্য নয়"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">⏳ শেষ তারিখ</span>
                <span className="font-bold text-amber-700">{selectedJob.deadline}</span>
              </div>
            </div>

            {/* 8. চাকরির বিবরণ */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <FileText size={16} className="text-blue-600" />
                <span>📋 চাকরির বিবরণ ও দায়িত্ব</span>
              </h3>
              
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                {selectedJob.description}
              </p>

              {/* Requirements List */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">প্রয়োজনীয় যোগ্যতা ও শর্তাবলী:</h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits List */}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">বেতন ও সুযোগ-সুবিধা:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.benefits.map((b, idx) => (
                      <span key={idx} className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 9. আবেদন পদ্ধতি (AUTHENTIC ACTION METHODS) */}
            <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl space-y-3">
              <h3 className="text-xs md:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <Send size={16} className="text-blue-600" />
                <span>📝 কীভাবে আবেদন করবেন</span>
              </h3>

              <div className="flex flex-col sm:flex-row gap-2">
                {selectedJob.phone && (
                  <a 
                    href={`tel:${selectedJob.phone}`}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Phone size={16} />
                    <span>📞 সরাসরি কল করুন ({selectedJob.phone})</span>
                  </a>
                )}

                {selectedJob.email && (
                  <a 
                    href={`mailto:${selectedJob.email}`}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Mail size={16} />
                    <span>✉️ ই-মেইলে আবেদন পাঠান</span>
                  </a>
                )}
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-normal">
                ⚠️ নোট: নিয়োগদাতার সত্যতা নিশ্চিত করতে ফোন অথবা ইমেইলের মাধ্যমে সরাসরি যোগাযোগ করুন।
              </p>
            </div>

            {/* Report Button Link */}
            <div className="text-center pt-2">
              <button 
                onClick={() => setShowReportModal(true)}
                className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1 mx-auto"
              >
                <ShieldAlert size={14} />
                <span>⚠️ এই চাকরির তথ্য ভুল বা ভুয়া মনে হচ্ছে? রিপোর্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADVANCED FILTER MODAL / BOTTOM SHEET */}
      {showAdvancedFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowAdvancedFiltersModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-blue-600" />
              <h3 className="text-base font-black text-slate-900">এডভান্সড ফিল্টার</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">চাকরির ধরন / ক্যাটাগরি</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">সব ক্যাটাগরি</option>
                  {JOB_CATEGORY_CARDS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">চাকরির স্থান (ইউনিয়ন)</label>
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">সকল স্থান / ইউনিয়ন</option>
                  <option value="puthia">পুঠিয়া সদর</option>
                  <option value="baneshwar">বানেশ্বর ইউনিয়ন</option>
                  <option value="belpukur">বেলপুকুর ইউনিয়ন</option>
                  <option value="jeupara">জিউপাড়া ইউনিয়ন</option>
                  <option value="shilmaria">শিলমাড়িয়া ইউনিয়ন</option>
                </select>
              </div>

              {/* Salary */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">বেতন পরিসর</label>
                <select 
                  value={selectedSalary} 
                  onChange={(e) => setSelectedSalary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">সব বেতন</option>
                  <option value="negotiable">বেতন উল্লেখ নেই / আলোচনা সাপেক্ষে</option>
                  <option value="10k-20k">৳১০,০০০ – ২০,০০০</option>
                  <option value="20k-30k">৳২০,০০০ – ৩০,০০০</option>
                  <option value="30k+">৳৩০,০০০+</option>
                </select>
              </div>

              {/* Education */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">শিক্ষাগত যোগ্যতা</label>
                <select 
                  value={selectedEducation} 
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">সব যোগ্যতা</option>
                  <option value="ssc">SSC</option>
                  <option value="hsc">HSC</option>
                  <option value="diploma">Diploma</option>
                  <option value="honours">Honours</option>
                  <option value="masters">Masters</option>
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">অভিজ্ঞতা</label>
                <select 
                  value={selectedExperience} 
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">সব অভিজ্ঞতা</option>
                  <option value="fresh">অভিজ্ঞতা ছাড়াই</option>
                  <option value="1-2">১–২ বছর</option>
                  <option value="3-5">৩–৫ বছর</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={handleResetFilters}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                সব রিসেট করুন
              </button>
              <button 
                onClick={() => setShowAdvancedFiltersModal(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
              >
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. NOTIFICATION SUBSCRIPTION MODAL */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">🔔 নতুন চাকরির বিজ্ঞপ্তি পেতে চান?</h3>
              <p className="text-xs text-slate-500">
                আপনার পছন্দের ক্যাটাগরিতে নতুন চাকরি এলে সরাসরি অ্যালার্ট পাবেন।
              </p>
            </div>

            <form onSubmit={handleNotificationSave} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">ক্যাটাগরি নির্বাচন করুন:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "government", label: "🏛️ সরকারি" },
                    { id: "bank", label: "🏦 ব্যাংক" },
                    { id: "teaching", label: "🏫 শিক্ষকতা" },
                    { id: "it", label: "💻 IT & রিমোট" },
                    { id: "private", label: "🏢 বেসরকারি" },
                  ].map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={!!notifCategories[cat.id]}
                        onChange={(e) => setNotifCategories({ ...notifCategories, [cat.id]: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-800">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">আপনার মোবাইল নম্বর / ইমেইল:</label>
                <input 
                  type="text" 
                  value={notifContact}
                  onChange={(e) => setNotifContact(e.target.value)}
                  placeholder="01712xxxxxx অথবা আপনার ইমেইল"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                বিজ্ঞপ্তি সাবস্ক্রাইব করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 13. + চাকরি প্রকাশ করুন (JOB SUBMISSION FORM MODAL) */}
      {showPostForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPostForm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
            >
              <X size={18} />
            </button>

            <JobForm 
              onClose={() => setShowPostForm(false)}
              onSuccess={() => {
                setShowPostForm(false);
                showToast("যাচাইয়ের জন্য পাঠানো হয়েছে। এডমিন যাচাই করার পর প্রকাশিত হবে।");
              }}
            />
          </div>
        </div>
      )}

      {/* 14. REPORT MODAL */}
      {showReportModal && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">⚠️ এই চাকরির তথ্য রিপোর্ট করুন</h3>
              <p className="text-xs text-slate-500">
                {selectedJob.title} - {selectedJob.company}
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">সমস্যার ধরণ:</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                >
                  <option value="fake">🔴 ভুয়া চাকরি</option>
                  <option value="salary">💰 ভুল বেতন তথ্য</option>
                  <option value="company">🏢 ভুল প্রতিষ্ঠান</option>
                  <option value="closed">🚫 আবেদন ইতিপূর্বে বন্ধ হয়ে গেছে</option>
                  <option value="contact">📞 ভুল যোগাযোগ নম্বর/ইমেইল</option>
                  <option value="expired">⏳ মেয়াদ শেষ</option>
                  <option value="other">📝 অন্যান্য</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">বিস্তারিত মন্তব্য (ঐচ্ছিক):</label>
                <textarea 
                  rows={3}
                  value={reportComments}
                  onChange={(e) => setReportComments(e.target.value)}
                  placeholder="আপনার পর্যবেক্ষণের সঠিক বিবরণ লিখুন..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={reportingStatus === "loading"}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                {reportingStatus === "loading" ? "পাঠানো হচ্ছে..." : "রিপোর্ট পাঠান"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

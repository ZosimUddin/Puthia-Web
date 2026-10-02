import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, ShieldCheck, MessageSquare, AlertTriangle, 
  Users, CheckCircle2, XCircle, Eye, RefreshCw, 
  Flag, Lock, Sparkles, ArrowUpRight, Clock, Ban, UserX,
  Search, Filter, Check, X, Store, FileText, UserCheck,
  AlertOctagon, CheckSquare, MessageCircle, MoreVertical,
  Activity, ArrowRight, Shield, Bell, Send, EyeOff, UserMinus,
  HelpCircle, ChevronRight, Layers, Tag, ExternalLink, ThumbsUp,
  ThumbsDown, AlertCircle, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

// Data types for Moderator Hub
interface ReportItem {
  id: string;
  ticketId: string;
  targetType: "post" | "comment" | "user" | "business" | "marketplace";
  targetTitle: string;
  targetAuthor: string;
  reporterName: string;
  category: string;
  reason: string;
  priority: "critical" | "high" | "medium" | "low";
  time: string;
  status: "pending" | "under_review" | "resolved" | "dismissed";
  details?: string;
}

interface UserReportItem {
  id: string;
  userName: string;
  userHandle: string;
  avatarUrl?: string;
  reportCount: number;
  reason: string;
  reporter: string;
  time: string;
  status: "pending" | "warned" | "suspended" | "cleared";
  bioSnippet: string;
}

interface PostReviewItem {
  id: string;
  title: string;
  content: string;
  author: string;
  authorHandle: string;
  channel: string;
  submittedAt: string;
  flagReason?: string;
  status: "pending" | "approved" | "rejected";
  images?: string[];
}

interface CommentReviewItem {
  id: string;
  commentText: string;
  postTitle: string;
  author: string;
  time: string;
  flagCount: number;
  reason: string;
  status: "pending" | "approved" | "removed" | "muted";
}

interface ProfileReviewItem {
  id: string;
  name: string;
  handle: string;
  joinedDate: string;
  bio: string;
  verificationRequested: boolean;
  flagReason?: string;
  isVerified: boolean;
  status: "pending" | "verified" | "restricted";
}

interface BusinessReviewItem {
  id: string;
  shopName: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  submittedAt: string;
  tradeLicenseInfo: string;
  status: "pending" | "approved" | "rejected";
}

interface FlaggedContentItem {
  id: string;
  contentType: "post" | "comment" | "link" | "image";
  contentSnippet: string;
  flagSource: "AI Auto-Filter" | "Community Flag" | "Keyword Trigger";
  confidence: string;
  detectedAt: string;
  status: "flagged" | "safe" | "deleted";
}

interface ModerationActivityLog {
  id: string;
  action: string;
  target: string;
  type: string;
  moderator: string;
  time: string;
  outcome: "Approved" | "Rejected" | "Warned" | "Resolved" | "Suspended";
}

export const ModeratorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "pending_reports" | "user_reports" | "post_review" | 
    "comment_review" | "profile_review" | "business_review" | 
    "content_flagged" | "pending_moderation" | "recent_activity"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modal State for Action Taking
  const [actionModalItem, setActionModalItem] = useState<{
    type: "report" | "user" | "post" | "comment" | "profile" | "business" | "flagged";
    id: string;
    title: string;
    author?: string;
  } | null>(null);
  const [moderatorNote, setModeratorNote] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Statistics State
  const [stats, setStats] = useState({
    pendingReports: 7,
    userReports: 4,
    postReview: 6,
    commentReview: 8,
    profileReview: 5,
    businessReview: 4,
    contentFlagged: 9,
    pendingModeration: 35,
    resolvedToday: 18,
    safetyScore: 98
  });

  // 1. Pending Reports List
  const [pendingReports, setPendingReports] = useState<ReportItem[]>([
    {
      id: "rep-1",
      ticketId: "RPT-2026-8912",
      targetType: "post",
      targetTitle: "ভুয়া লটারির লিংক সংবলিত আড্ডা পোস্ট",
      targetAuthor: "রফিকুল হাসান (@rafiq_bd)",
      reporterName: "মোস্তাফিজুর রহমান",
      category: "ফিশিং ও প্রতারণা",
      reason: "বাহ্যিক আর্থিক প্রতারণামূলক লিংক দিয়ে সাধারণ মানুষকে বিভ্রান্ত করা হচ্ছে।",
      priority: "critical",
      time: "১০ মিনিট আগে",
      status: "pending",
      details: "পোস্টটিতে বিকাশ/নগদ পেমেন্ট দিয়ে ২০ হাজার টাকা বোনাস পাওয়ার ভুয়া লিংক রয়েছে।"
    },
    {
      id: "rep-2",
      ticketId: "RPT-2026-8913",
      targetType: "user",
      targetTitle: "উসকানিমূলক বার্তা পাঠানো ইউজার",
      targetAuthor: "সাব্বির আহমেদ (@sabbir_p)",
      reporterName: "তানভীরুল হক",
      category: "সাইবার বুলিং",
      reason: "অন্যান্য ব্যবহারকারীদের ইনবক্সে ও কমেন্টে আপত্তিকর গালিগালাজ প্রদান।",
      priority: "high",
      time: "২৫ মিনিট আগে",
      status: "under_review",
      details: "একাধিক কমেন্টে অশালীন ভাষা ব্যবহার করায় ৫ জন ব্যবহারকারী রিপোর্ট করেছেন।"
    },
    {
      id: "rep-3",
      ticketId: "RPT-2026-8914",
      targetType: "business",
      targetTitle: "অননুমোদিত ফার্মেসির ভুল ঠিকানা লিস্টিং",
      targetAuthor: "মেসার্স পুঠিয়া হেলথ এইড",
      reporterName: "ডা. সাজিদুর রহমান",
      category: "ভুল তথ্য ও মিসলিডিং",
      reason: "দোকানের সরকারি ড্রাগ লাইসেন্স নেই এবং ভুল ডাক্তারের নাম ব্যবহার করেছে।",
      priority: "high",
      time: "১ ঘণ্টা আগে",
      status: "pending",
      details: "লাইসেন্স নম্বর যাচাই করে দেখা গেছে তা অন্য প্রতিষ্ঠানের।"
    },
    {
      id: "rep-4",
      ticketId: "RPT-2026-8915",
      targetType: "comment",
      targetTitle: "ধর্মীয় অনুভূতিতে আঘাতমূলক মন্তব্য",
      targetAuthor: "অচেনা পথিক (@pathik_99)",
      reporterName: "নাজমুল হোসেন",
      category: "বিদ্বেষমূলক বক্তব্য",
      reason: "পৌরসভা ইভেন্টের নিচে অপ্রাসঙ্গিক ও উসকানিমূলক মন্তব্য।",
      priority: "critical",
      time: "২ ঘণ্টা আগে",
      status: "pending",
      details: "উসকানিমূলক ভাষার কারণে দ্রুত হাইড করা প্রয়োজন।"
    },
    {
      id: "rep-5",
      ticketId: "RPT-2026-8916",
      targetType: "marketplace",
      targetTitle: "নিষিদ্ধ বন্যপ্রাণী বিক্রয়ের বিজ্ঞাপন",
      targetAuthor: "সবুজ অরণ্য ট্রেডার্স",
      reporterName: "পুঠিয়া বন সংরক্ষণ কর্মী",
      category: "অবৈধ পণ্য",
      reason: "সংরক্ষিত পাখি ও বন্যপ্রাণী বিক্রির পোস্ট দেওয়া হয়েছে।",
      priority: "critical",
      time: "৩ ঘণ্টা আগে",
      status: "pending",
      details: "বন্যপ্রাণী সংরক্ষণ আইন অনুযায়ী অবৈধ।"
    }
  ]);

  // 2. User Reports List
  const [userReports, setUserReports] = useState<UserReportItem[]>([
    {
      id: "urep-1",
      userName: "সাব্বির আহমেদ",
      userHandle: "@sabbir_p",
      reportCount: 5,
      reason: "বারংবার স্প্যামিং ও অশালীন কমেন্ট প্রদান",
      reporter: "তানভীরুল হক ও ৪ জন",
      time: "২৫ মিনিট আগে",
      status: "pending",
      bioSnippet: "পুঠিয়া বাজারের যেকোনো পাইকারি পণ্য হোম ডেলিভারি পেতে মেসেজ দিন।"
    },
    {
      id: "urep-2",
      userName: "আশিকুর রহমান ফেইক",
      userHandle: "@ashik_admin_fake",
      reportCount: 4,
      reason: "উপজেলা প্রশাসনের অফিসিয়াল পরিচয় দিয়ে প্রতারণা",
      reporter: "সহকারী কমিশনার ডেস্ক",
      time: "১ ঘণ্টা আগে",
      status: "pending",
      bioSnippet: "উপজেলা নির্বাহী অফিসারের স্পেশাল স্টাফ ও হেল্পডেস্ক অ্যাসিস্ট্যান্ট।"
    },
    {
      id: "urep-3",
      userName: "অনলাইন ইনকাম বিডি",
      userHandle: "@earn_easy_daily",
      reportCount: 8,
      reason: "অনলাইন জুয়া ও পঞ্জি স্কিমের লিংক প্রচার",
      reporter: "কমিউনিটি ইউজারগণ",
      time: "আজ সকাল ১০:১৫",
      status: "warned",
      bioSnippet: "ঘরে বসে প্রতিদিন ১০০০-৩০০০ টাকা আয় করতে টেলিগ্রামে জয়েন করুন।"
    },
    {
      id: "urep-4",
      userName: "মাহমুদ হাসান",
      userHandle: "@mahmud_puthia",
      reportCount: 2,
      reason: "বাজারের বিভিন্ন শপের নামে অপপ্রচার চালানো",
      reporter: "পুঠিয়া মার্চেন্ট সমিতি",
      time: "গতকাল",
      status: "pending",
      bioSnippet: "পুঠিয়ার সত্য খবর ও অনুসন্ধানী নাগরিক মতামত।"
    }
  ]);

  // 3. Post Review List
  const [postReviews, setPostReviews] = useState<PostReviewItem[]>([
    {
      id: "prev-1",
      title: "পুঠিয়া রাজবাড়ি মেলা ও পর্যটকদের আবাসন সুবিধা সংক্রান্ত আলোচনা",
      content: "আসন্ন মেলা উপলক্ষে দূর-দূরান্ত থেকে আগত পর্যটকদের জন্য পুঠিয়া বাজারে স্বল্প খরচে পারিবারিক গেস্ট হাউজ এবং নিরাপত্তা গাইডলাইন শেয়ার করা হলো...",
      author: "ইশতিয়াক আহমেদ",
      authorHandle: "@ishti_tour",
      channel: "ভ্রমণ ও ঐতিহ্য",
      submittedAt: "১৫ মিনিট আগে",
      flagReason: "নতুন ইউজারের প্রথম পোস্ট ও ফোন নম্বর সংযুক্ত",
      status: "pending"
    },
    {
      id: "prev-2",
      title: "বানেশ্বর হাটের আমের পাইকারি মূল্য তালিকা ও ট্রাকে পরিবহন বুকিং",
      content: "আজ সকালের ল্যাংড়া ও আম্রপালি আমের বাজার দর মণপ্রতি ২৪০০-২৮০০ টাকা। যেকোনো জেলায় সরাসরি ট্রাক পাঠানোর জন্য পরিবহন সহায়তায় যোগাযোগ করুন...",
      author: "আম ব্যবসায়ী কো-অপারেটিভ",
      authorHandle: "@baneshwar_mango",
      channel: "কৃষি ও বাজার",
      submittedAt: "৪০ মিনিট আগে",
      status: "pending"
    },
    {
      id: "prev-3",
      title: "পুঠিয়া ব্লাড ডোনার ক্লাবের নতুন স্বেচ্ছাসেবী রেজিস্ট্রেশন আহ্বান",
      content: "জরুরি প্রয়োজনে পুঠিয়া উপজেলার যেকোনো মুমূর্ষু রোগীর জন্য রক্ত সংগ্রহ ও ডোনার নেটওয়ার্কে যুক্ত হতে নতুন স্বেচ্ছাসেবীদের রেজিস্ট্রেশন লিংক নিচে দেওয়া হলো...",
      author: "পুঠিয়া রক্তসেবা",
      authorHandle: "@blood_puthia",
      channel: "সামাজিক সেবা",
      submittedAt: "১ ঘণ্টা আগে",
      status: "pending"
    },
    {
      id: "prev-4",
      title: "জরুরি রক্ত চাই: পুঠিয়া হাসপাতালে ও-পজিটিভ রক্ত প্রয়োজন",
      content: "উপজেলা স্বাস্থ্য কমপ্লেক্সে সিজারিয়ান ডেলিভারি রোগীর জন্য জরুরি ভিত্তিতে ২ ব্যাগ O+ রক্ত প্রয়োজন। কেউ দিতে পারলে দ্রুত যোগাযোগ করুন...",
      author: "ডা. শামীম রেজা",
      authorHandle: "@dr_shamim",
      channel: "জরুরি স্বাস্থ্য",
      submittedAt: "২ ঘণ্টা আগে",
      status: "pending"
    }
  ]);

  // 4. Comment Review List
  const [commentReviews, setCommentReviews] = useState<CommentReviewItem[]>([
    {
      id: "crev-1",
      commentText: "এই পোস্টে দেওয়া মোবাইল নম্বরটি ভুয়া, কেউ ফোন দিয়ে টাকা পাঠাবেন না!",
      postTitle: "বানেশ্বর হাটের পাইকারি গুড় ডেলিভারি বিজ্ঞাপন",
      author: "জাহিদুল ইসলাম (@jahid_9)",
      time: "১২ মিনিট আগে",
      flagCount: 2,
      reason: "পোস্টদাতার বিরুদ্ধে অভিযোগ মন্তব্য",
      status: "pending"
    },
    {
      id: "crev-2",
      commentText: "অফিসিয়াল পোস্টে উসকানিমূলক রাজনৈতিক মন্তব্য ও কুরুচিপূর্ণ ভাষার আক্রমণ।",
      postTitle: "উপজেলা প্রশাসনের স্মার্ট সেবা কেন্দ্র উদ্বোধন নোটিশ",
      author: "অজ্ঞাত ব্যবহারকারী (@anon_user1)",
      time: "৩০ মিনিট আগে",
      flagCount: 4,
      reason: "অশালীন ভাষা ও ট্রলিং",
      status: "pending"
    },
    {
      id: "crev-3",
      commentText: "টেলিগ্রাম গ্রুপে জয়েন করলেই পাবেন ফ্রি গেমিং কয়েন ও ক্রিপ্টো বোনাস: t.me/fake_link",
      postTitle: "পুঠিয়া তরুণ সমাজ যুব ক্রিকেট টুর্নামেন্ট",
      author: "বট স্প্যামার (@crypto_bot)",
      time: "৪৫ মিনিট আগে",
      flagCount: 7,
      reason: "অটো স্প্যাম বট ডিটেকশন",
      status: "pending"
    },
    {
      id: "crev-4",
      commentText: "ডাক্তার সাহেব তো চেম্বারেই বসেন না, রোগীদের সময় নষ্ট করেন।",
      postTitle: "পুঠিয়া চক্ষু বিশেষজ্ঞ শিডিউল ও ওপিডি",
      author: "মোজাম্মেল হক (@mojam_bd)",
      time: "২ ঘণ্টা আগে",
      flagCount: 1,
      reason: "সার্ভিস সংক্রান্ত ক্ষোভ প্রকাশ",
      status: "pending"
    }
  ]);

  // 5. Profile Review List
  const [profileReviews, setProfileReviews] = useState<ProfileReviewItem[]>([
    {
      id: "prof-1",
      name: "পুঠিয়া থানা পুলিশ ভেরিফিকেশন ডেস্ক",
      handle: "@puthia_police_desk",
      joinedDate: "আজ",
      bio: "যেকোনো আইনি সেবা ও পাসপোর্ট ভেরিফিকেশনে অগ্রিম ফি প্রদানের জন্য যোগাযোগ করুন।",
      verificationRequested: false,
      flagReason: "সরকারি পুলিশ পরিচয়ে ভুয়া প্রোফাইল তৈরি ও অর্থ দাবি",
      isVerified: false,
      status: "pending"
    },
    {
      id: "prof-2",
      name: "ডা. মাহমুদ হাসান (এমবিবিএস, বিসিএস)",
      handle: "@dr_mahmud_cardio",
      joinedDate: "গতকাল",
      bio: "সহকারী অধ্যাপক (কার্ডিওলজি), পুঠিয়া বিশেষজ্ঞ স্বাস্থ্য সেবা।",
      verificationRequested: true,
      flagReason: "অফিসিয়াল ব্লু টিক ভেরিফিকেশন ও বিএমডিসি সনদ রিভিউ",
      isVerified: false,
      status: "pending"
    },
    {
      id: "prof-3",
      name: "পুঠিয়া ডিজিটাল অনলাইন শপ",
      handle: "@puthia_digital_shop",
      joinedDate: "২৭ আগস্ট",
      bio: "মোবাইল, গ্যাজেট ও ইলেকট্রনিক্স পণ্য সাশ্রয়ী মূল্যে ক্যাশ অন ডেলিভারি।",
      verificationRequested: true,
      flagReason: "ভেরিফাইড মার্চেন্ট ব্যাজ আবেদন",
      isVerified: false,
      status: "pending"
    },
    {
      id: "prof-4",
      name: "স্পিড ক্যাশ লোন পুঠিয়া",
      handle: "@instant_loan_puthia",
      joinedDate: "২৬ আগস্ট",
      bio: "মাত্র ১০ মিনিটে বিনা জামানতে ৫০,০০০ টাকা লোন পেতে হোয়াটসঅ্যাপ করুন।",
      verificationRequested: false,
      flagReason: "অবৈধ মহাজনি ঋণ ও সুদের স্ক্যামিং প্রোফাইল",
      isVerified: false,
      status: "pending"
    }
  ]);

  // 6. Business Review List
  const [businessReviews, setBusinessReviews] = useState<BusinessReviewItem[]>([
    {
      id: "biz-1",
      shopName: "মেসার্স আল-মদিনা ইলেকট্রনিক্স ও সোলার",
      category: "ইলেকট্রনিক্স ও প্রযুক্তি",
      ownerName: "মো. কামরুল হাসান",
      phone: "০১৭৮৯-৪৫৬১২২",
      address: "পুঠিয়া কলেজ গেট সংলগ্ন, পুঠিয়া বাজার",
      submittedAt: "আজ সকাল ১১:২০",
      tradeLicenseInfo: "ট্রেড লাইসেন্স নং: TL-PUTHIA-2026-8812 (সংযুক্ত)",
      status: "pending"
    },
    {
      id: "biz-2",
      shopName: "বানেশ্বর এগ্রো ফিড ও বীজ ভাণ্ডার",
      category: "কৃষি ও খামার",
      ownerName: "মো. আনিসুর রহমান",
      phone: "০১৯১২-৩৩৪৫৫৬",
      address: "বানেশ্বর বাজার, মহাসড়ক সংলগ্ন",
      submittedAt: "গতকাল বিকাল ৪:০০",
      tradeLicenseInfo: "কৃষি সম্প্রসারণ অধিদপ্তর অনুমোদিত ডিলার সনদযুক্ত",
      status: "pending"
    },
    {
      id: "biz-3",
      shopName: "পুঠিয়া পিওর ঘি ও মধু কালেকশন",
      category: "খাদ্য ও পানীয়",
      ownerName: "মোছা. রোকসানা বেগম",
      phone: "০১৮২৫-৭৭৮৮৯৯",
      address: "রাজবাড়ি রোড, পুঠিয়া পৌরসভা",
      submittedAt: "২৮ আগস্ট",
      tradeLicenseInfo: "বিএসটিআই মান সনদ আবেদন প্রক্রিয়াধীন",
      status: "pending"
    },
    {
      id: "biz-4",
      shopName: "তাহেরপুর ফ্যাশন গ্যালারি ও ক্লোথিং",
      category: "পোশাক ও ফ্যাশন",
      ownerName: "মো. শফিকুল ইসলাম",
      phone: "০১৭২২-৬৬৫৫৪৪",
      address: "তাহেরপুর রোড, পুঠিয়া",
      submittedAt: "২৭ আগস্ট",
      tradeLicenseInfo: "পৌরসভা ট্রেড লাইসেন্স নং: ৩৪৯১",
      status: "pending"
    }
  ]);

  // 7. Content Flagged List
  const [contentFlagged, setContentFlagged] = useState<FlaggedContentItem[]>([
    {
      id: "flg-1",
      contentType: "link",
      contentSnippet: "http://win-bikas-cash-reward.top/claim-now?uid=9201",
      flagSource: "AI Auto-Filter",
      confidence: "৯৯% ফিশিং মেলওয়্যার",
      detectedAt: "৮ মিনিট আগে",
      status: "flagged"
    },
    {
      id: "flg-2",
      contentType: "comment",
      contentSnippet: "এখানে বাজে ও অশ্লীল শব্দ সংবলিত মন্তব্য...",
      flagSource: "Keyword Trigger",
      confidence: "৯২% আপত্তিজনক ভাষা",
      detectedAt: "২৫ মিনিট আগে",
      status: "flagged"
    },
    {
      id: "flg-3",
      contentType: "image",
      contentSnippet: "রক্তাক্ত দুর্ঘটনার গ্রাফিক ছবি (কোনো সেন্সর ছাড়া)",
      flagSource: "Community Flag",
      confidence: "৮৫% সংবেদনশীল মিডিয়া",
      detectedAt: "১ ঘণ্টা আগে",
      status: "flagged"
    },
    {
      id: "flg-4",
      contentType: "post",
      contentSnippet: "একই মেসেজ ১০টি ভিন্ন গ্রুপে বারংবার কপি-পেস্ট করা হয়েছে...",
      flagSource: "AI Auto-Filter",
      confidence: "৯৬% বাল্ক স্প্যামিং",
      detectedAt: "২ ঘণ্টা আগে",
      status: "flagged"
    }
  ]);

  // 8. Recent Moderation Activity Log
  const [activityLogs, setActivityLogs] = useState<ModerationActivityLog[]>([
    {
      id: "log-1",
      action: "পোস্ট অনুমোদন",
      target: "পুঠিয়া রাজবাড়ি মেলা ও পর্যটকদের আবাসন গাইড",
      type: "Post Review",
      moderator: user?.displayName || "কমিউনিটি মডারেটর",
      time: "৫ মিনিট আগে",
      outcome: "Approved"
    },
    {
      id: "log-2",
      action: "স্প্যাম লিংক ব্লক ও পোস্ট ডিলিট",
      target: "ভুয়া লটারির ফিশিং পোস্ট (#RPT-8912)",
      type: "Report Resolution",
      moderator: "সুপার মডারেটর",
      time: "২০ মিনিট আগে",
      outcome: "Resolved"
    },
    {
      id: "log-3",
      action: "ইউজারকে সতর্কবার্তা (Warning)",
      target: "অনলাইন ইনকাম বিডি (@earn_easy_daily)",
      type: "User Enforcement",
      moderator: user?.displayName || "কমিউনিটি মডারেটর",
      time: "১ ঘণ্টা আগে",
      outcome: "Warned"
    },
    {
      id: "log-4",
      action: "ব্যবসা অনুমোদন ও শপ ব্যাজ প্রদান",
      target: "মেসার্স আল-মদিনা ইলেকট্রনিক্স",
      type: "Business Review",
      moderator: user?.displayName || "কমিউনিটি মডারেটর",
      time: "২ ঘণ্টা আগে",
      outcome: "Approved"
    },
    {
      id: "log-5",
      action: "ফেইক প্রোফাইল পার্মানেন্ট ব্যান",
      target: "@puthia_police_desk (ভুয়া পুলিশ প্রোফাইল)",
      type: "Profile Enforcement",
      moderator: "সুপার মডারেটর",
      time: "আজ সকাল ৯:৩০",
      outcome: "Suspended"
    }
  ]);

  // Load Real Data from Firestore where available
  const loadModerationData = async () => {
    setLoading(true);
    try {
      let repCount = 0;
      let postCount = 0;
      let bizCount = 0;

      // Try fetching Firestore reports
      try {
        const repSnap = await getDocs(collection(db, "reports"));
        repCount = repSnap.size;
      } catch (e) {
        console.warn("Firestore reports fetch fallback:", e);
      }

      // Try fetching Firestore posts
      try {
        const postSnap = await getDocs(collection(db, "posts"));
        postCount = postSnap.size;
      } catch (e) {
        console.warn("Firestore posts fetch fallback:", e);
      }

      // Try fetching businesses
      try {
        const bizSnap = await getDocs(collection(db, "businesses"));
        bizCount = bizSnap.size;
      } catch (e) {
        console.warn("Firestore businesses fetch fallback:", e);
      }

      setStats(prev => ({
        ...prev,
        pendingReports: repCount || prev.pendingReports,
        postReview: postCount ? Math.min(postCount, 8) : prev.postReview,
        businessReview: bizCount ? Math.min(bizCount, 5) : prev.businessReview,
        pendingModeration: (repCount || 7) + 4 + (postCount || 6) + 8 + 5 + (bizCount || 4) + 9
      }));

    } catch (err) {
      console.error("Moderation load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, []);

  // Quick Action Handlers
  const handleResolveReport = (id: string, actionType: "resolve" | "dismiss") => {
    const report = pendingReports.find(r => r.id === id);
    if (!report) return;

    setPendingReports(prev => prev.filter(r => r.id !== id));
    setStats(prev => ({
      ...prev,
      pendingReports: Math.max(0, prev.pendingReports - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    // Log Activity
    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: actionType === "resolve" ? "রিপোর্ট নিষ্পত্তি ও কন্টেন্ট রিমুভ" : "রিপোর্ট খারিজ (ভিত্তিহীন)",
        target: `${report.ticketId} - ${report.targetTitle}`,
        type: "Report Moderation",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: actionType === "resolve" ? "Resolved" : "Rejected"
      },
      ...prev
    ]);
  };

  const handleApprovePost = (id: string) => {
    const post = postReviews.find(p => p.id === id);
    if (!post) return;

    setPostReviews(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({
      ...prev,
      postReview: Math.max(0, prev.postReview - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: "পোস্ট অনুমোদন ও পাবলিশ",
        target: post.title,
        type: "Post Review",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: "Approved"
      },
      ...prev
    ]);
  };

  const handleRejectPost = (id: string) => {
    const post = postReviews.find(p => p.id === id);
    if (!post) return;

    setPostReviews(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({
      ...prev,
      postReview: Math.max(0, prev.postReview - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: "পোস্ট বাতিল ও অযোগ্য ঘোষণা",
        target: post.title,
        type: "Post Review",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: "Rejected"
      },
      ...prev
    ]);
  };

  const handleApproveBusiness = (id: string) => {
    const biz = businessReviews.find(b => b.id === id);
    if (!biz) return;

    setBusinessReviews(prev => prev.filter(b => b.id !== id));
    setStats(prev => ({
      ...prev,
      businessReview: Math.max(0, prev.businessReview - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: "ব্যবসা ও দোকান অনুমোদন",
        target: `${biz.shopName} (${biz.ownerName})`,
        type: "Business Review",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: "Approved"
      },
      ...prev
    ]);
  };

  const handleUserEnforcement = (id: string, actionType: "warn" | "suspend" | "clear") => {
    const uItem = userReports.find(u => u.id === id);
    if (!uItem) return;

    setUserReports(prev => prev.filter(u => u.id !== id));
    setStats(prev => ({
      ...prev,
      userReports: Math.max(0, prev.userReports - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: actionType === "warn" ? "ইউজারকে সতর্কবার্তা প্রেরণ" : actionType === "suspend" ? "অ্যাকাউন্ট সাময়িক স্থগিত (Suspend)" : "রিপোর্ট ক্লিয়ার",
        target: `${uItem.userName} (${uItem.userHandle})`,
        type: "User Enforcement",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: actionType === "warn" ? "Warned" : actionType === "suspend" ? "Suspended" : "Resolved"
      },
      ...prev
    ]);
  };

  const handleCommentAction = (id: string, actionType: "approve" | "remove" | "mute") => {
    const cItem = commentReviews.find(c => c.id === id);
    if (!cItem) return;

    setCommentReviews(prev => prev.filter(c => c.id !== id));
    setStats(prev => ({
      ...prev,
      commentReview: Math.max(0, prev.commentReview - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: actionType === "approve" ? "মন্তব্য অনুমোদন" : actionType === "remove" ? "মন্তব্য ডিলিট" : "কমেন্টকারীকে ২৪ ঘণ্টার জন্য মিউট",
        target: `"${cItem.commentText.slice(0, 30)}..."`,
        type: "Comment Review",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: actionType === "approve" ? "Approved" : actionType === "remove" ? "Rejected" : "Warned"
      },
      ...prev
    ]);
  };

  const handleProfileVerification = (id: string, actionType: "verify" | "restrict") => {
    const prof = profileReviews.find(p => p.id === id);
    if (!prof) return;

    setProfileReviews(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({
      ...prev,
      profileReview: Math.max(0, prev.profileReview - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: actionType === "verify" ? "অফিসিয়াল প্রোফাইল ভেরিফিকেশন অনুমোদন" : "প্রোফাইল রেস্ট্রিক্ট ও লক",
        target: `${prof.name} (${prof.handle})`,
        type: "Profile Review",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: actionType === "verify" ? "Approved" : "Suspended"
      },
      ...prev
    ]);
  };

  const handleFlaggedTriage = (id: string, actionType: "safe" | "delete") => {
    const flg = contentFlagged.find(f => f.id === id);
    if (!flg) return;

    setContentFlagged(prev => prev.filter(f => f.id !== id));
    setStats(prev => ({
      ...prev,
      contentFlagged: Math.max(0, prev.contentFlagged - 1),
      pendingModeration: Math.max(0, prev.pendingModeration - 1),
      resolvedToday: prev.resolvedToday + 1
    }));

    setActivityLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action: actionType === "safe" ? "নিরাপদ হিসেবে চিহ্নিত (Mark Safe)" : "ফ্ল্যাগড কন্টেন্ট স্থায়ী রিমুভ",
        target: `${flg.contentType} - ${flg.contentSnippet.slice(0, 30)}`,
        type: "Content Flagged",
        moderator: user?.displayName || "কমিউনিটি মডারেটর",
        time: "এইমাত্র",
        outcome: actionType === "safe" ? "Approved" : "Rejected"
      },
      ...prev
    ]);
  };

  // Filter items matching search
  const isSearchMatch = (text: string) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="w-full bg-slate-50/60 pb-16 min-h-screen">
      
      {/* 1. HERO HEADER: Moderator Community & Review Center */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white border-b border-purple-500/20 shadow-xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-500/15 border border-purple-400/30 rounded-full text-xs font-bold text-purple-200 backdrop-blur-md">
              <ShieldAlert size={14} className="text-purple-300" />
              <span>কমিউনিটি ও রিভিউ কন্ট্রোল হাব (Community & Review Dashboard)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              মডারেটর ড্যাশবোর্ড
            </h1>
            
            <p className="text-xs sm:text-sm text-purple-100/80 max-w-2xl leading-relaxed">
              পুঠিয়া ডিজিটাল উপজেলার আড্ডা ও কমিউনিটিকে সুরক্ষিত, মানসম্মত এবং নিরাপদ রাখতে রিপোর্ট তদন্ত, পোস্ট-কমেন্ট রিভিউ, ইউজার ও ব্যবসা অনুমোদন পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("pending_moderation")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
            >
              <CheckSquare size={16} />
              পেন্ডিং কিউ ক্লিয়ার ({stats.pendingModeration})
            </button>
            <button
              onClick={() => navigate("/admin/moderation")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Shield size={15} />
              মডারেশন সেন্টার
            </button>
            <button
              onClick={loadModerationData}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all cursor-pointer hover:scale-105"
              title="রিফ্রেশ"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-purple-300" : ""} />
            </button>
          </div>
        </div>

        {/* Ambient Backlight */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">

        {/* 2. CORE KPI REVIEW METRICS CARDS: (All 8 Core Sections) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          
          {/* 1. Pending Reports */}
          <div 
            onClick={() => setActiveTab("pending_reports")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "pending_reports" 
                ? "bg-rose-50/90 border-rose-300 shadow-sm ring-2 ring-rose-400/30" 
                : "bg-white border-slate-200/80 hover:border-rose-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-rose-700">১. Pending Reports</span>
              <AlertTriangle size={14} className="text-rose-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.pendingReports}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">অপেক্ষমান রিপোর্ট</p>
          </div>

          {/* 2. User Reports */}
          <div 
            onClick={() => setActiveTab("user_reports")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "user_reports" 
                ? "bg-amber-50/90 border-amber-300 shadow-sm ring-2 ring-amber-400/30" 
                : "bg-white border-slate-200/80 hover:border-amber-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-amber-700">২. User Reports</span>
              <UserX size={14} className="text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.userReports}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ইউজার রিপোর্ট</p>
          </div>

          {/* 3. Post Review */}
          <div 
            onClick={() => setActiveTab("post_review")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "post_review" 
                ? "bg-blue-50/90 border-blue-300 shadow-sm ring-2 ring-blue-400/30" 
                : "bg-white border-slate-200/80 hover:border-blue-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-blue-700">৩. Post Review</span>
              <FileText size={14} className="text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.postReview}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">পোস্ট রিভিউ</p>
          </div>

          {/* 4. Comment Review */}
          <div 
            onClick={() => setActiveTab("comment_review")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "comment_review" 
                ? "bg-indigo-50/90 border-indigo-300 shadow-sm ring-2 ring-indigo-400/30" 
                : "bg-white border-slate-200/80 hover:border-indigo-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-indigo-700">৪. Comment Review</span>
              <MessageCircle size={14} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.commentReview}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">মন্তব্য রিভিউ</p>
          </div>

          {/* 5. Profile Review */}
          <div 
            onClick={() => setActiveTab("profile_review")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "profile_review" 
                ? "bg-purple-50/90 border-purple-300 shadow-sm ring-2 ring-purple-400/30" 
                : "bg-white border-slate-200/80 hover:border-purple-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-purple-700">৫. Profile Review</span>
              <UserCheck size={14} className="text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.profileReview}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">প্রোফাইল রিভিউ</p>
          </div>

          {/* 6. Business Review */}
          <div 
            onClick={() => setActiveTab("business_review")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "business_review" 
                ? "bg-emerald-50/90 border-emerald-300 shadow-sm ring-2 ring-emerald-400/30" 
                : "bg-white border-slate-200/80 hover:border-emerald-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-emerald-700">৬. Business Review</span>
              <Store size={14} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.businessReview}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ব্যবসা রিভিউ</p>
          </div>

          {/* 7. Content Flagged */}
          <div 
            onClick={() => setActiveTab("content_flagged")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "content_flagged" 
                ? "bg-orange-50/90 border-orange-300 shadow-sm ring-2 ring-orange-400/30" 
                : "bg-white border-slate-200/80 hover:border-orange-300 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-orange-700">৭. Content Flagged</span>
              <Flag size={14} className="text-orange-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.contentFlagged}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">ফ্ল্যাগড কন্টেন্ট</p>
          </div>

          {/* 8. Pending Moderation Total */}
          <div 
            onClick={() => setActiveTab("pending_moderation")}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "pending_moderation" 
                ? "bg-purple-900 text-white border-purple-800 shadow-md ring-2 ring-purple-500" 
                : "bg-slate-900 text-white border-slate-800 hover:border-purple-600 shadow-2xs"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-purple-300">৮. Pending Total</span>
              <Layers size={14} className="text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">{stats.pendingModeration}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">মোট অমীমাংসিত</p>
          </div>

        </div>

        {/* 3. WORKSPACE TABS & FILTER CONTROLS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            
            {/* Scrollable Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "overview", label: "সার্বিক ওভারভিউ", icon: Layers },
                { id: "pending_reports", label: `Pending Reports (${pendingReports.length})`, icon: AlertTriangle },
                { id: "user_reports", label: `User Reports (${userReports.length})`, icon: UserX },
                { id: "post_review", label: `Post Review (${postReviews.length})`, icon: FileText },
                { id: "comment_review", label: `Comment Review (${commentReviews.length})`, icon: MessageCircle },
                { id: "profile_review", label: `Profile Review (${profileReviews.length})`, icon: UserCheck },
                { id: "business_review", label: `Business Review (${businessReviews.length})`, icon: Store },
                { id: "content_flagged", label: `Content Flagged (${contentFlagged.length})`, icon: Flag },
                { id: "pending_moderation", label: `Pending Moderation (${stats.pendingModeration})`, icon: CheckSquare },
                { id: "recent_activity", label: "Recent Activity (৯)", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive 
                        ? "bg-purple-700 text-white shadow-xs" 
                        : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-purple-200" : "text-slate-400"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="রিপোর্ট, নাম বা কি-ওয়ার্ড খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* 4. MAIN CONTENT SECTIONS */}

          {/* OVERVIEW SECTION: Summary Hub with Quick Modules */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Community Health & Safety Banner */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      সুরক্ষিত ও সক্রিয় (Live Safety Guard)
                    </span>
                    <span className="text-xs text-purple-200">আজকের নিষ্পত্তি: <b>{stats.resolvedToday}টি</b></span>
                  </div>
                  <h3 className="text-base font-black">পুঠিয়া কমিউনিটি সেফটি স্কোর: ৯৮%</h3>
                  <p className="text-xs text-purple-200/80">
                    স্বয়ংক্রিয় স্প্যাম ডিটেক্টর ও কমিউনিটি রিপোর্ট দ্বারা ২৪ ঘণ্টা সার্বিক আড্ডা ফিড ও প্রোফাইল পর্যবেক্ষণ করা হচ্ছে।
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("pending_reports")}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    রিপোর্ট তদন্ত করুন
                  </button>
                  <button
                    onClick={() => setActiveTab("business_review")}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ব্যবসা অনুমোদন ({businessReviews.length})
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Critical Reports & Top Post Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Column 1: Priority Pending Reports */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-rose-600" />
                        জরুরি অপেক্ষমান রিপোর্ট (Pending Reports)
                      </h3>
                      <button 
                        onClick={() => setActiveTab("pending_reports")}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700"
                      >
                        সবগুলো ({pendingReports.length}) →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {pendingReports.slice(0, 3).map((rep) => (
                        <div key={rep.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col justify-between gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              {rep.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{rep.time}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 line-clamp-1">{rep.targetTitle}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{rep.reason}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-semibold">{rep.ticketId}</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => handleResolveReport(rep.id, "resolve")}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                সমাধান ও রিমুভ
                              </button>
                              <button 
                                onClick={() => handleResolveReport(rep.id, "dismiss")}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                খারিজ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Pending Post & Business Reviews */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        অপেক্ষমান পোস্ট ও ব্যবসা অনুমোদন
                      </h3>
                      <button 
                        onClick={() => setActiveTab("post_review")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        পোস্ট কিউ ({postReviews.length}) →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {postReviews.slice(0, 2).map((post) => (
                        <div key={post.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              {post.channel}
                            </span>
                            <span className="text-[11px] text-slate-400">{post.submittedAt}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">{post.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{post.content}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-semibold">{post.author}</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => handleApprovePost(post.id)}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                ✓ অনুমোদন
                              </button>
                              <button 
                                onClick={() => handleRejectPost(post.id)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {businessReviews.slice(0, 1).map((biz) => (
                        <div key={biz.id} className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {biz.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{biz.submittedAt}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">{biz.shopName}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-1">মালিক: {biz.ownerName} | {biz.address}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                            <span className="text-[10px] text-emerald-700 font-semibold">{biz.tradeLicenseInfo}</span>
                            <button 
                              onClick={() => handleApproveBusiness(biz.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              ✓ ব্যবসা অনুমোদন
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW 1: PENDING REPORTS */}
          {(activeTab === "pending_reports") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600" />
                    ১. অপেক্ষমান রিপোর্ট (Pending Reports)
                  </h3>
                  <p className="text-xs text-slate-500">ইউজারদের জমা দেওয়া কন্টেন্ট, প্রতারণা ও আপত্তিকর ভাষা সংক্রান্ত তদন্তাধীন অভিযোগ</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {pendingReports.length}টি রিপোর্ট সক্রিয়
                </span>
              </div>

              <div className="space-y-3">
                {pendingReports
                  .filter(r => isSearchMatch(r.targetTitle) || isSearchMatch(r.reason) || isSearchMatch(r.ticketId))
                  .map((rep) => (
                    <div 
                      key={rep.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 hover:bg-rose-50/20 hover:border-rose-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                            {rep.ticketId}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            {rep.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rep.priority === "critical" ? "bg-red-500 text-white" : "bg-amber-100 text-amber-800"
                          }`}>
                            {rep.priority === "critical" ? "জরুরি / Critical" : "উচ্চ / High"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{rep.time}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">{rep.targetTitle}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">অভিযোগের বিবরণ:</span> {rep.reason}</p>
                        {rep.details && (
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 font-mono">
                            প্রমাণ / কন্টেন্ট স্ন্যাপশট: {rep.details}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400">
                          অভিযুক্ত: <span className="font-semibold text-slate-600">{rep.targetAuthor}</span> | রিপোর্টকারী: <span className="font-semibold text-slate-600">{rep.reporterName}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">পদক্ষেপ গ্রহণ করুন:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(rep.id, "resolve")}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <Trash2 size={13} />
                            <span>কন্টেন্ট রিমুভ ও নিষ্পত্তি</span>
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, "dismiss")}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            রিপোর্ট খারিজ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 2: USER REPORTS */}
          {(activeTab === "user_reports") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserX size={16} className="text-amber-600" />
                    ২. ইউজার রিপোর্ট (User Reports)
                  </h3>
                  <p className="text-xs text-slate-500">নির্দিষ্ট ব্যবহারকারীর বিরুদ্ধে অসদাচরণ, ফেইক আইডি ও স্প্যামিংয়ের অভিযোগ</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {userReports.length} জন অভিযুক্ত
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userReports
                  .filter(u => isSearchMatch(u.userName) || isSearchMatch(u.userHandle) || isSearchMatch(u.reason))
                  .map((u) => (
                    <div 
                      key={u.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                              {u.userName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">{u.userName}</h4>
                              <p className="text-[10px] text-slate-400">{u.userHandle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            {u.reportCount}টি রিপোর্ট
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                          <p className="font-semibold text-slate-800 mb-0.5">অভিযোগের কারণ:</p>
                          <p>{u.reason}</p>
                        </div>

                        <p className="text-[11px] text-slate-500 italic">
                          বায়ো: "{u.bioSnippet}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">{u.time}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUserEnforcement(u.id, "warn")}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            ⚠️ ওয়ার্নিং
                          </button>
                          <button
                            onClick={() => handleUserEnforcement(u.id, "suspend")}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            ⛔ সাসপেন্ড
                          </button>
                          <button
                            onClick={() => handleUserEnforcement(u.id, "clear")}
                            className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            ক্লিয়ার
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 3: POST REVIEW */}
          {(activeTab === "post_review") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    ৩. পোস্ট রিভিউ (Post Review)
                  </h3>
                  <p className="text-xs text-slate-500">ইউজারদের জমা দেওয়া আড্ডা ও ফিড পোস্ট অনুমোদন বা প্রত্যাখ্যান</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {postReviews.length}টি পোস্ট অপেক্ষমান
                </span>
              </div>

              <div className="space-y-3">
                {postReviews
                  .filter(p => isSearchMatch(p.title) || isSearchMatch(p.content) || isSearchMatch(p.author))
                  .map((p) => (
                    <div 
                      key={p.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {p.channel}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{p.author} ({p.authorHandle})</span>
                        </div>
                        <span className="text-xs text-slate-400">{p.submittedAt}</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.content}</p>

                      {p.flagReason && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
                          <AlertCircle size={13} className="text-amber-600" />
                          <span><b>সতর্কবার্তা:</b> {p.flagReason}</span>
                        </div>
                      )}

                      <div className="pt-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprovePost(p.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Check size={14} />
                          <span>অনুমোদন ও লাইভ করুন</span>
                        </button>
                        <button
                          onClick={() => handleRejectPost(p.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          বাতিল করুন
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 4: COMMENT REVIEW */}
          {(activeTab === "comment_review") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <MessageCircle size={16} className="text-indigo-600" />
                    ৪. কমেন্ট রিভিউ (Comment Review)
                  </h3>
                  <p className="text-xs text-slate-500">ফ্ল্যাগড অথবা বিতর্কিত মন্তব্যের স্ক্রিনিং ও অ্যাকশন ডেস্ক</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {commentReviews.length}টি মন্তব্য রিভিউ
                </span>
              </div>

              <div className="space-y-3">
                {commentReviews
                  .filter(c => isSearchMatch(c.commentText) || isSearchMatch(c.postTitle) || isSearchMatch(c.author))
                  .map((c) => (
                    <div 
                      key={c.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-md">
                          মূল পোস্ট: <b className="text-slate-700">{c.postTitle}</b>
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          {c.flagCount}টি ফ্ল্যাগ
                        </span>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium">
                        "{c.commentText}"
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">
                          মন্তব্যকারী: <span className="text-slate-600 font-semibold">{c.author}</span> ({c.time}) - <i>কারণ: {c.reason}</i>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCommentAction(c.id, "approve")}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            ✓ বহাল রাখুন
                          </button>
                          <button
                            onClick={() => handleCommentAction(c.id, "remove")}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            ✕ কমেন্ট মুছুন
                          </button>
                          <button
                            onClick={() => handleCommentAction(c.id, "mute")}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            ইউজার মিউট
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 5: PROFILE REVIEW */}
          {(activeTab === "profile_review") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UserCheck size={16} className="text-purple-600" />
                    ৫. প্রোফাইল রিভিউ (Profile Review)
                  </h3>
                  <p className="text-xs text-slate-500">অফিসিয়াল ভেরিফিকেশন রিকুয়েস্ট ও সন্দেহজনক প্রোফাইল নিরীক্ষা</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {profileReviews.length}টি প্রোফাইল রিভিউ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileReviews
                  .filter(p => isSearchMatch(p.name) || isSearchMatch(p.handle) || isSearchMatch(p.bio))
                  .map((prof) => (
                    <div 
                      key={prof.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 hover:border-purple-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                              {prof.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900">{prof.name}</h4>
                              <p className="text-[10px] text-slate-400">{prof.handle}</p>
                            </div>
                          </div>
                          {prof.verificationRequested ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                              ভেরিফিকেশন রিকুয়েস্ট
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                              ফ্ল্যাগড প্রোফাইল
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          {prof.bio}
                        </p>

                        {prof.flagReason && (
                          <p className="text-[11px] text-rose-700 font-semibold">
                            ⚠️ রিভিউ কারণ: {prof.flagReason}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">যোগদান: {prof.joinedDate}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleProfileVerification(prof.id, "verify")}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            ✓ ভেরিফাই করুন
                          </button>
                          <button
                            onClick={() => handleProfileVerification(prof.id, "restrict")}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            রেস্ট্রিক্ট
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 6: BUSINESS REVIEW */}
          {(activeTab === "business_review") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Store size={16} className="text-emerald-600" />
                    ৬. ব্যবসা ও প্রতিষ্ঠান রিভিউ (Business Review)
                  </h3>
                  <p className="text-xs text-slate-500">নতুন দোকান, ব্যবসা প্রতিষ্ঠান ও সেবাদাতার তথ্য ও লাইসেন্স যাচাইকরণ</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {businessReviews.length}টি ব্যবসা অপেক্ষমান
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessReviews
                  .filter(b => isSearchMatch(b.shopName) || isSearchMatch(b.ownerName) || isSearchMatch(b.address))
                  .map((biz) => (
                    <div 
                      key={biz.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {biz.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{biz.submittedAt}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900">{biz.shopName}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">মালিক: <span className="font-semibold text-slate-800">{biz.ownerName}</span> ({biz.phone})</p>
                          <p className="text-xs text-slate-500 mt-0.5">ঠিকানা: {biz.address}</p>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700">লাইসেন্স ও প্রমাণপত্র:</p>
                          <p className="text-emerald-700 font-mono text-[11px] mt-0.5">{biz.tradeLicenseInfo}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveBusiness(biz.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        >
                          <Check size={14} />
                          <span>ব্যবসা অনুমোদন করুন</span>
                        </button>
                        <button
                          onClick={() => setBusinessReviews(prev => prev.filter(b => b.id !== biz.id))}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 7: CONTENT FLAGGED */}
          {(activeTab === "content_flagged") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Flag size={16} className="text-orange-600" />
                    ৭. ফ্ল্যাগড কন্টেন্ট (Content Flagged)
                  </h3>
                  <p className="text-xs text-slate-500">অটো-মডারেশন ফিল্টার ও কি-ওয়ার্ড ট্রিগার দ্বারা চিহ্নিত ঝুঁকিপূর্ণ উপাদান</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  {contentFlagged.length}টি ফ্ল্যাগড উপাদান
                </span>
              </div>

              <div className="space-y-3">
                {contentFlagged
                  .filter(f => isSearchMatch(f.contentSnippet) || isSearchMatch(f.flagSource))
                  .map((flg) => (
                    <div 
                      key={flg.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                            {flg.flagSource}
                          </span>
                          <span className="text-xs font-bold text-slate-700">টাইপ: {flg.contentType}</span>
                        </div>
                        <span className="text-xs text-slate-400">{flg.detectedAt}</span>
                      </div>

                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                        {flg.contentSnippet}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-orange-700 font-semibold">
                          শনাক্তকরণ স্কোর: {flg.confidence}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFlaggedTriage(flg.id, "safe")}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            ✓ সেফ হিসেবে চিহ্নিত
                          </button>
                          <button
                            onClick={() => handleFlaggedTriage(flg.id, "delete")}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            স্থায়ী রিমুভ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW 8: PENDING MODERATION TOTAL TRIAGE */}
          {(activeTab === "pending_moderation") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckSquare size={16} className="text-purple-600" />
                    ৮. মোট পেন্ডিং মডারেশন কিউ (Pending Moderation Queue)
                  </h3>
                  <p className="text-xs text-slate-500">সকল ক্যাটাগরির রিভিউ ও অপেক্ষমান মডারেশন আইটেমের সমন্বিত ওয়ার্কলিস্ট</p>
                </div>
                <button
                  onClick={() => {
                    // Bulk clear first items
                    if (pendingReports.length > 0) handleResolveReport(pendingReports[0].id, "resolve");
                    if (postReviews.length > 0) handleApprovePost(postReviews[0].id);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  কুইক ট্রায়াজ ক্লিয়ার
                </button>
              </div>

              {/* Triage Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { name: "অপেক্ষমান রিপোর্ট", count: pendingReports.length, tab: "pending_reports", color: "text-rose-600", bg: "bg-rose-50" },
                  { name: "ইউজার রিপোর্ট", count: userReports.length, tab: "user_reports", color: "text-amber-600", bg: "bg-amber-50" },
                  { name: "পোস্ট রিভিউ", count: postReviews.length, tab: "post_review", color: "text-blue-600", bg: "bg-blue-50" },
                  { name: "কমেন্ট রিভিউ", count: commentReviews.length, tab: "comment_review", color: "text-indigo-600", bg: "bg-indigo-50" },
                  { name: "প্রোফাইল রিভিউ", count: profileReviews.length, tab: "profile_review", color: "text-purple-600", bg: "bg-purple-50" },
                  { name: "ব্যবসা রিভিউ", count: businessReviews.length, tab: "business_review", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { name: "ফ্ল্যাগড কন্টেন্ট", count: contentFlagged.length, tab: "content_flagged", color: "text-orange-600", bg: "bg-orange-50" },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveTab(item.tab as any)}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-white hover:border-purple-300 transition-all cursor-pointer shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">ট্যাপ করে বিস্তারিত খুলুন</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${item.color}`}>{item.count}</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 9: RECENT MODERATION ACTIVITY */}
          {(activeTab === "recent_activity" || activeTab === "overview") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-purple-600" />
                    ৯. সাম্প্রতিক মডারেশন অ্যাক্টিভিটি (Recent Moderation Activity)
                  </h3>
                  <p className="text-xs text-slate-500">মডারেটরদের গৃহীত সর্বশেষ পদক্ষেপ ও অডিট হিস্টোরি লগ</p>
                </div>
                <button
                  onClick={() => navigate("/admin/moderation")}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                  সম্পূর্ণ অডিট লগ →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {activityLogs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                          {log.type}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{log.action}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-xl">{log.target}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.outcome === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        log.outcome === "Suspended" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        log.outcome === "Warned" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {log.outcome}
                      </span>
                      <span className="text-[11px] text-slate-400">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ModeratorDashboard;

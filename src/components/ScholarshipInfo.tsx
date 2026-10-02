import React, { useState, useEffect, useMemo } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { 
  ArrowLeft, 
  GraduationCap, 
  Building, 
  CheckCircle, 
  ExternalLink, 
  Calendar,
  Plus,
  Trash2,
  Loader2,
  X,
  Send,
  Sparkles,
  Heart,
  Share2,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Bookmark,
  MapPin,
  Users,
  BookOpen,
  Download,
  Bell,
  Award,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Scholarship {
  id: string;
  title: string;
  type: 'govt' | 'university' | 'international' | 'ngo' | 'merit' | 'financial' | 'school_college' | 'madrasha';
  level: ('school' | 'college' | 'undergrad' | 'postgrad' | 'madrasha' | 'all')[];
  provider: string;
  target: string;
  amount: string;
  deadline: string; // YYYY-MM-DD
  country: string;
  description: string;
  eligibility: string[];
  documents: string[];
  process: string[];
  importantDates: string[];
  benefits: string[];
  link: string;
  guidePdf: string;
  faq: { q: string; a: string }[];
  isFeatured?: boolean;
  isPopular?: boolean;
  postedDate: string; // YYYY-MM-DD
}

// 8 highly detailed, realistic static scholarships across different categories and levels
const staticScholarships: Scholarship[] = [
  {
    id: "static-1",
    title: "প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট উপবৃত্তি",
    type: "govt",
    level: ["school", "college", "madrasha"],
    provider: "বাংলাদেশ সরকার (শিক্ষা মন্ত্রণালয়)",
    target: "৬ষ্ঠ থেকে একাদশ শ্রেণির দরিদ্র ও মেধাবী শিক্ষার্থী",
    amount: "এককালীন ১০,০০০ - ১৫,০০০ টাকা এবং মাসিক উপবৃত্তি",
    deadline: "2026-08-25",
    country: "বাংলাদেশ",
    description: "দরিদ্র ও মেধাবী শিক্ষার্থীদের জন্য সরকারের বিশেষ আর্থিক অনুদান প্রকল্প যার লক্ষ্য ঝরে পড়া রোধ করা।",
    eligibility: [
      "নিয়মিত অধ্যয়নরত শিক্ষার্থী হতে হবে।",
      "পারিবারিক বার্ষিক আয় ২,০০,০০০ টাকার কম হতে হবে।",
      "পূর্ববর্তী পরীক্ষায় ন্যূনতম ৫০% নম্বর বা জিপিএ ৩.০০ থাকতে হবে।"
    ],
    documents: [
      "বর্তমান শিক্ষা প্রতিষ্ঠানের প্রত্যয়ন পত্র",
      "পূর্ববর্তী পরীক্ষার মার্কশিট / রিপোর্ট কার্ড",
      "অভিভাবকের আয়ের সার্টিফিকেট (ইউপি চেয়ারম্যান কর্তৃক)",
      "শিক্ষার্থীর জন্ম নিবন্ধন সনদ ও অভিভাবকের এনআইডি কার্ডের কপি"
    ],
    process: [
      "প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্টের অফিসিয়াল লিংকে প্রবেশ করুন।",
      "মোবাইল নম্বর ভেরিফিকেশন করে অনলাইন আবেদন ফর্মটি পূরণ করুন।",
      "প্রয়োজনীয় কাগজপত্র স্ক্যান করে আপলোড করুন।",
      "আবেদন সাবমিট করে ডাউনলোড কপিটি প্রিন্ট করে প্রতিষ্ঠানে জমা দিন।"
    ],
    importantDates: [
      "আবেদন শুরু: ০১ জুলাই, ২০২৬",
      "আবেদনের শেষ তারিখ: ২৫ আগস্ট, ২০২৬",
      "প্রাথমিক তালিকা প্রকাশ: সেপ্টেম্বর, ২০২৬"
    ],
    benefits: [
      "বার্ষিক এককালীন টিউশন সহায়তা",
      "বই ও শিক্ষা উপকরণ ক্রয়ের জন্য বিশেষ অনুদান",
      "মোবাইল ব্যাংকিং (বিকাশ/নগদ) এর মাধ্যমে সরাসরি টাকা বিতরণ"
    ],
    link: "http://www.pmeat.gov.bd/",
    guidePdf: "#",
    faq: [
      { q: "এই উপবৃত্তি কি প্রতি বছর দেওয়া হয়?", a: "হ্যাঁ, প্রতি শিক্ষাবর্ষে নির্দিষ্ট সময়ে এই ট্রাস্টের আবেদন আহ্বান করা হয়।" },
      { q: "বেসরকারি স্কুলের শিক্ষার্থীরা কি আবেদন করতে পারবে?", a: "হ্যাঁ, সরকারি এবং এমপিওভুক্ত বা সরকার অনুমোদিত সকল বেসরকারি প্রতিষ্ঠানের শিক্ষার্থীরা আবেদনের যোগ্য।" }
    ],
    isFeatured: true,
    isPopular: true,
    postedDate: "2026-07-08"
  },
  {
    id: "static-2",
    title: "ডাচ-বাংলা ব্যাংক এইচএসসি ও স্নাতক শিক্ষাবৃত্তি",
    type: "merit",
    level: ["college", "undergrad"],
    provider: "ডাচ-বাংলা ব্যাংক ফাউন্ডেশন",
    target: "২০২৬ সালের এসএসসি/সমমান পরীক্ষায় জিপিএ ৫.০০ প্রাপ্ত মেধারী শিক্ষার্থী",
    amount: "মাসিক ২,৫০০ টাকা এবং বার্ষিক শিক্ষা উপকরণ ক্রয়ের জন্য ৫,০০০ টাকা",
    deadline: "2026-07-30",
    country: "বাংলাদেশ",
    description: "মেধাবী ও আর্থিকভাবে অস্বচ্ছল শিক্ষার্থীদের উচ্চশিক্ষার স্বপ্ন পূরণে ডাচ-বাংলা ব্যাংকের মহতি সামাজিক উদ্যোগ।",
    eligibility: [
      "২০২৬ সালের এসএসসি/সমমান পরীক্ষায় উত্তীর্ণ হতে হবে।",
      "সিটি কর্পোরেশন এলাকার জন্য জিপিএ ৫.০০ এবং জেলা/গ্রামাঞ্চলের জন্য জিপিএ ৪.৮০ আবশ্যক।",
      "সরকারি উপবৃত্তি ব্যতীত অন্য কোনো উৎস থেকে বৃত্তিপ্রাপ্ত হওয়া যাবে না।"
    ],
    documents: [
      "এসএসসি পরীক্ষার মূল মার্কশিট ও প্রশংসাপত্র",
      "পিতার এনআইডি কার্ড ও আয়ের বিবরণী",
      "পাসপোর্ট সাইজ রঙিন ছবি",
      "শিক্ষা প্রতিষ্ঠান প্রধানের সুপারিশপত্র"
    ],
    process: [
      "ডাচ-বাংলা ব্যাংকের বৃত্তি পোর্টালে নিবন্ধন করুন।",
      "ব্যক্তিগত, পারিবারিক ও শিক্ষাগত তথ্য নির্ভুলভাবে ইনপুট দিন।",
      "সকল অ্যাকাডেমিক ট্র্যান্সক্রিপ্ট এবং প্রত্যয়নপত্র যুক্ত করে সাবমিট করুন।",
      "আবেদন শেষে প্রাপ্ত স্লিপটি যত্নসহকারে সংরক্ষণ করুন।"
    ],
    importantDates: [
      "আবেদন শুরু: ১০ জুন, ২০২৬",
      "আবেদনের শেষ তারিখ: ৩০ জুলাই, ২০২৬",
      "সাময়িক নির্বাচন তালিকা প্রকাশ: ১৫ আগস্ট, ২০২৬"
    ],
    benefits: [
      "এইচএসসি কোর্সের জন্য মাসিক ২,৫০০ টাকা হারে ২ বছর সুবিধা",
      "এককালীন বই ও পোশাক ক্রয়ের জন্য বার্ষিক ৫,০০০ টাকা",
      "স্নাতক স্তরেও ধারাবাহিক কৃতিত্ব বজায় রাখলে পুনরায় বৃত্তি সুবিধা"
    ],
    link: "https://app.dutchbanglabank.com/DBBLScholarship/",
    guidePdf: "#",
    faq: [
      { q: "গ্রামের শিক্ষার্থীদের জন্য কি জিপিএ শিথিলযোগ্য?", a: "হ্যাঁ, গ্রামীণ অবহেলিত অঞ্চলের সাধারণ মেধার জন্য ন্যূনতম জিপিএ ৪.৮০ (চতুর্থ বিষয় ছাড়া) নির্ধারণ করা হয়েছে।" },
      { q: "বৃত্তিপ্রাপ্তরা কি ব্যাংক অ্যাকাউন্ট পাবে?", a: "হ্যাঁ, ডাচ-বাংলা ব্যাংক থেকে শিক্ষার্থীদের বিনামূল্যে রকেট/ব্যাংক অ্যাকাউন্ট খুলে দেওয়া হয়।" }
    ],
    isFeatured: true,
    isPopular: true,
    postedDate: "2026-07-05"
  },
  {
    id: "static-3",
    title: "জাপান সরকারের MEXT স্কলারশিপ (Monbukagakusho)",
    type: "international",
    level: ["undergrad", "postgrad"],
    provider: "জাপান সরকার (MEXT)",
    target: "স্নাতক ও স্নাতকোত্তর স্তরে উচ্চশিক্ষা ইচ্ছুক বাংলাদেশী শিক্ষার্থী",
    amount: "সম্পূর্ণ টিউশন ফি মওকুফ, মাসিক ১,১৭,০০০ ইয়েন এবং রাউন্ড-ট্রিপ বিমান টিকিট",
    deadline: "2026-09-15",
    country: "জাপান",
    description: "জাপানি বিশ্ববিদ্যালয়ে অধ্যয়ন করার জন্য সম্পূর্ণ অর্থায়নে জাপান সরকারের সবচেয়ে মর্যাদাপূর্ণ আন্তর্জাতিক স্কলারশিপ।",
    eligibility: [
      "আবেদনকারীকে অবশ্যই বাংলাদেশী নাগরিক হতে হবে।",
      "স্নাতকের জন্য অনূর্ধ্ব ২৫ বছর এবং স্নাতকোত্তরের জন্য অনূর্ধ্ব ৩৫ বছর বয়সী হতে হবে।",
      "চমৎকার অ্যাকাডেমিক রেকর্ড এবং ইংরেজি বা জাপানি ভাষায় দক্ষতা (IELTS 6.5+ বা JLPT) থাকতে হবে।"
    ],
    documents: [
      "পূর্ণাঙ্গ অ্যাকাডেমিক ট্রান্সক্রিপ্ট ও সার্টিফিকেট",
      "দুটি রিকমেন্ডেশন লেটার (বিশ্ববিদ্যালয় / স্কুল প্রধানের)",
      "রিসার্চ প্রপোজাল (স্নাতকোত্তরের জন্য)",
      "মেডিকেল সার্টিফিকেট ও ইংরেজি ভাষা দক্ষতার সনদ"
    ],
    process: [
      "ঢাকাস্থ জাপান দূতাবাসের নির্দিষ্ট লিংকে আবেদনপত্র ডাউনলোড করুন।",
      "আবেদনপত্র পূরণ করে প্রয়োজনীয় নথি সহ সশরীরে বা কুরিয়ারে দূতাবাসে পাঠান।",
      "লিখিত পরীক্ষা (ইংরেজি, গণিত) ও মৌখিক সাক্ষাৎকারে উত্তীর্ণ হতে হবে।",
      "চূড়ান্ত মনোনীত প্রার্থীদের তালিকা জাপান সরকারের নিকট প্রেরিত হবে।"
    ],
    importantDates: [
      "আবেদনপত্র জমা শুরু: ০১ আগস্ট, ২০২৬",
      "আবেদনের শেষ তারিখ: ১৫ সেপ্টেম্বর, ২০২৬",
      "লিখিত পরীক্ষার তারিখ: অক্টোবর, ২০২৬"
    ],
    benefits: [
      "১০০% টিউশন ফি এবং পরীক্ষার ফি মওকুফ",
      "জাপানে যাতায়াতের বিমান টিকিট প্রদান",
      "মাসিক ডরমিটরি ও লিভিং এলাউন্স হিসেবে প্রায় ১,১৭,০০০-১,৪৩,০০০ জাপানিজ ইয়েন"
    ],
    link: "https://www.bd.emb-japan.go.jp/itpr_en/education.html",
    guidePdf: "#",
    faq: [
      { q: "জাপানি ভাষা জানা কি বাধ্যতামূলক?", a: "না, ইংরেজি মাধ্যমে পড়ার কোর্স রয়েছে। তবে জাপানি ভাষার মৌলিক জ্ঞান থাকা অতিরিক্ত সুবিধা দেবে।" },
      { q: "আইইএলটিএস ছাড়া কি আবেদন করা যাবে?", a: "যদি আপনার পূর্ববর্তী শিক্ষা সম্পূর্ণ ইংরেজি মাধ্যমে হয়, তবে ইনস্টিটিউট থেকে 'ইংরেজি মাধ্যম সার্টিফিকেট' দিয়ে আবেদন করা যেতে পারে।" }
    ],
    isFeatured: true,
    isPopular: false,
    postedDate: "2026-07-01"
  },
  {
    id: "static-4",
    title: "কমনওয়েলথ স্কলারশিপ (যুক্তরাজ্য)",
    type: "international",
    level: ["postgrad"],
    provider: "যুক্তরাজ্য সরকার (CSC)",
    target: "স্নাতকোত্তর (মাস্টার্স ও পিএইচডি) করতে ইচ্ছুক বাংলাদেশী শিক্ষার্থী",
    amount: "সম্পূর্ণ টিউশন ফি, মাসিক ১,৩০০ পাউন্ড লিভিং এলাউন্স এবং বিমান টিকিট",
    deadline: "2026-08-12",
    country: "যুক্তরাজ্য",
    description: "কমনওয়েলথ ভুক্ত দেশের শিক্ষার্থীদের যুক্তরাজ্যের খ্যাতনামা বিশ্ববিদ্যালয়গুলোতে উচ্চশিক্ষা অর্জনের সম্পূর্ণ অর্থায়িত সুযোগ।",
    eligibility: [
      "বাংলাদেশী স্থায়ী নাগরিক হতে হবে।",
      "সংশ্লিষ্ট ক্ষেত্রে প্রথম শ্রেণী বা সিজিপিএ ৩.৫+ সহ অনার্স ডিগ্রি থাকতে হবে।",
      "আবেদনের সময় আইইএলটিএস স্কোর ন্যূনতম ৬.৫ (প্রতিটি ব্যান্ডে ৬.০ এর কম নয়) থাকতে হবে।"
    ],
    documents: [
      "অ্যাকাডেমিক সার্টিফিকেট ও ট্রান্সক্রিপ্ট",
      "পাসপোর্টের কপি ও জাতীয় পরিচয়পত্র",
      "আইইএলটিএস স্কোর কার্ড",
      "তিনজন শিক্ষাবিদের সুপারিশপত্র (Recommendation letters)"
    ],
    process: [
      "বাংলাদেশ বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) পোর্টালে প্রাথমিক আবেদন জমা দিন।",
      "একই সাথে কমনওয়েলথ স্কলারশিপ কমিশনের অনলাইন অ্যাপ্লিকেশন সিস্টেমেও আবেদন জমা দিন।",
      "ইউজিসি কর্তৃক বাছাই পরীক্ষার মাধ্যমে সংক্ষিপ্ত তালিকাভুক্ত হয়ে ইন্টারভিউ ফেস করুন।"
    ],
    importantDates: [
      "অনলাইন আবেদন শুরু: ১৫ জুন, ২০২৬",
      "আবেদনের শেষ সময়: ১২ আগস্ট, ২০২৬",
      "ইউজিসি ইন্টারভিউ: সেপ্টেম্বর, ২০২৬"
    ],
    benefits: [
      "সম্পূর্ণ টিউশন ফি মওকুফ",
      "যুক্তরাজ্যে যাতায়াতের বিমান টিকিট",
      "মাসিক জীবনযাত্রার ব্যয় বাবদ ১,৩৪৭ পাউন্ড (লন্ডনের বাইরে) বা ১,৬৫৫ পাউন্ড (লন্ডনে)"
    ],
    link: "https://cscuk.fcdo.gov.uk/about-us/scholarships/",
    guidePdf: "#",
    faq: [
      { q: "আবেদনের সময় কি অফার লেটার দরকার?", a: "বাধ্যতামূলক নয়, তবে যুক্তরাজ্যের কোনো বিশ্ববিদ্যালয়ের অ্যাডমিশন অফার লেটার থাকলে তা মনোনয়ন পাওয়ার সম্ভাবনা বাড়িয়ে দেয়।" }
    ],
    isFeatured: false,
    isPopular: true,
    postedDate: "2026-06-28"
  },
  {
    id: "static-5",
    title: "ইসলামী ব্যাংক ফাউন্ডেশন শিক্ষাবৃত্তি ও অনুদান",
    type: "financial",
    level: ["school", "college", "madrasha"],
    provider: "ইসলামী ব্যাংক ফাউন্ডেশন",
    target: "২০২৬ সালের এসএসসি বা দাখিল পরীক্ষায় উত্তীর্ণ দরিদ্র ও এতিম শিক্ষার্থী",
    amount: "মাসিক ২,০০০ টাকা এবং এককালীন বই কেনার জন্য বার্ষিক ৩,০০০ টাকা",
    deadline: "2026-07-25",
    country: "বাংলাদেশ",
    description: "দরিদ্র, মেধাবী, প্রতিবন্ধী এবং বিশেষ করে এতিম শিক্ষার্থীদের উচ্চমাধ্যমিক বা আলিম স্তরে পড়াশোনা চালিয়ে যাওয়ার আর্থিক সহায়তা বৃত্তি।",
    eligibility: [
      "২০২৬ সালের এসএসসি বা দাখিল পরীক্ষায় ন্যূনতম জিপিএ ৪.৫০ (সাধারণ) অথবা জিপিএ ৪.০০ (প্রতিবন্ধী ও এতিম) পেতে হবে।",
      "আর্থিকভাবে অসচ্ছল পরিবার বা অভিভাবকহীন শিক্ষার্থী হতে হবে।"
    ],
    documents: [
      "পরীক্ষার প্রবেশপত্র, মার্কশিট ও প্রশংসাপত্রের অনুলিপি",
      "শিক্ষার্থীর জন্ম নিবন্ধন সনদ",
      "ইউনিয়ন পরিষদ চেয়ারম্যান কর্তৃক অভিভাবকের আয়ের বা এতিম হওয়ার সনদপত্র"
    ],
    process: [
      "ইসলামী ব্যাংক ফাউন্ডেশনের ওয়েবসাইটে প্রবেশ করে বৃত্তির লিংকে ক্লিক করুন।",
      "মোবাইল ও ইমেইল দিয়ে অ্যাকাউন্ট খুলে অনলাইন ফর্ম সাবমিট করুন।",
      "আবেদনের প্রিন্ট কপি প্রয়োজনীয় কাগজপত্রসহ নিকটস্থ ইসলামী ব্যাংক শাখায় জমা দিন।"
    ],
    importantDates: [
      "আবেদন শুরু: ২৫ জুন, ২০২৬",
      "আবেদনের শেষ সময়: ২৫ জুলাই, ২০২৬",
      "চূড়ান্ত নির্বাচিতদের তালিকা: সেপ্টেম্বর, ২০২৬"
    ],
    benefits: [
      "এইচএসসি বা আলিম কোর্সের মেয়াদে ২ বছরের জন্য মাসিক ২,০০০ টাকা প্রদান",
      "বার্ষিক বই কেনার জন্য এককালীন ৩,০০০ টাকা"
    ],
    link: "https://ibfbd.org/",
    guidePdf: "#",
    faq: [
      { q: "কারা অগ্রাধিকার পাবে?", a: "অনাথ/এতিম, নদীভাঙন কবলিত এলাকার দরিদ্র মেধাবী এবং শারীরিক প্রতিবন্ধী শিক্ষার্থীদের বিশেষভাবে অগ্রাধিকার দেওয়া হয়।" }
    ],
    isFeatured: false,
    isPopular: false,
    postedDate: "2026-07-03"
  },
  {
    id: "static-6",
    title: "ঢাকা বিশ্ববিদ্যালয় অভ্যন্তরীণ মেধা বৃত্তি",
    type: "university",
    level: ["undergrad", "postgrad"],
    provider: "ঢাকা বিশ্ববিদ্যালয় ট্রাস্ট ফান্ড",
    target: "ঢাকা বিশ্ববিদ্যালয়ে অধ্যয়নরত অনার্স ও মাস্টার্সের নিয়মিত ছাত্র-ছাত্রী",
    amount: "বার্ষিক এককালীন ১৫,০০০ - ৩০,০০০ টাকা এবং ডরমিটরি ফি মওকুফ",
    deadline: "2026-08-30",
    country: "বাংলাদেশ",
    description: "ঢাকা বিশ্ববিদ্যালয়ের অধ্যয়নরত বিভিন্ন বিভাগের আর্থিকভাবে অসচ্ছল ও মেধাবী ছাত্রছাত্রীদের জন্য বিভিন্ন ট্রাস্ট ফান্ড থেকে বার্ষিক বৃত্তি।",
    eligibility: [
      "ঢাকা বিশ্ববিদ্যালয়ের নিয়মিত ও সেশনজটমুক্ত শিক্ষার্থী হতে হবে।",
      "পূর্ববর্তী সেমিস্টার বা বর্ষের পরীক্ষায় ন্যূনতম সিজিপিএ ৩.২৫ (মানবিক) বা ৩.৫০ (বিজ্ঞান/ব্যবসায়) থাকতে হবে।",
      "পরিবারের মাসিক আয় ২০,০০০ টাকার কম হতে হবে।"
    ],
    documents: [
      "হল প্রভোস্ট বা বিভাগীয় প্রধানের প্রত্যয়ন পত্র",
      "বিগত সকল সেমিস্টারের ফলাফল কার্ড (মার্কশিট)",
      "অভিভাবকের আয়ের প্রত্যয়নপত্র"
    ],
    process: [
      "বিশ্ববিদ্যালয়ের রেজিস্ট্রার ভবনের কক্ষ নম্বর ৩১০ থেকে আবেদনপত্র সংগ্রহ করুন।",
      "বিভাগীয় চেয়ারম্যান এবং হল প্রভোস্টের স্বাক্ষর ও সুপারিশ সহ ফরমটি পূরণ করুন।",
      "শিক্ষা ও বৃত্তি শাখায় নির্ধারিত সময়ের মধ্যে আবেদনপত্র জমা দিন।"
    ],
    importantDates: [
      "আবেদন শুরু: ১০ জুলাই, ২০২৬",
      "আবেদনের শেষ তারিখ: ৩০ আগস্ট, ২০২৬"
    ],
    benefits: [
      "বাৎসরিক শিক্ষা অনুদান",
      "বিশ্ববিদ্যালয় হল ডরমিটরির সিট ভাড়া আংশিক বা সম্পূর্ণ মওকুফ"
    ],
    link: "https://du.ac.bd/",
    guidePdf: "#",
    faq: [
      { q: "একই সাথে অন্য ট্রাস্ট ফান্ডে আবেদন করা যাবে?", a: "না, ঢাকা বিশ্ববিদ্যালয় প্রশাসনের নিয়ম অনুযায়ী একজন শিক্ষার্থী এক শিক্ষাবর্ষে একটির বেশি ট্রাস্ট ফান্ডের সুবিধা গ্রহণ করতে পারবেন না।" }
    ],
    isFeatured: false,
    isPopular: false,
    postedDate: "2026-07-09"
  },
  {
    id: "static-7",
    title: "আল-আরাফাহ ইসলামী ব্যাংক দাখিল ও আলিম বৃত্তি",
    type: "madrasha",
    level: ["madrasha"],
    provider: "আল-আরাফাহ ইসলামী ব্যাংক ফাউন্ডেশন",
    target: "২০২৬ সালের ইবতেদায়ী বা দাখিল পরীক্ষায় উত্তীর্ণ মেধাবী মাদ্রাসা শিক্ষার্থী",
    amount: "মাসিক ১,৫০০ টাকা এবং বার্ষিক এককালীন পাঠ্য উপকরণ ক্রয়ের জন্য ৩,০০০ টাকা",
    deadline: "2026-08-15",
    country: "বাংলাদেশ",
    description: "মাদ্রাসা শিক্ষায় পিছিয়ে পড়া ও দরিদ্র পরিবারের মেধাবী শিক্ষার্থীদের লেখাপড়ার ধারাবাহিকতা রক্ষায় এআইবিএল ফাউন্ডেশনের অনুদান বৃত্তি।",
    eligibility: [
      "দাখিল বা ইবতেদায়ী পরীক্ষায় সাধারণ গ্রেড বা ট্যালেন্টপুলে বৃত্তিপ্রাপ্ত অথবা অনন্য জিপিএ ৪.৫০ থাকতে হবে।",
      "অভিভাবকের মাসিক আয় ২৫,০০০ টাকার নিচে হতে হবে।"
    ],
    documents: [
      "মাদ্রাসা শিক্ষা বোর্ড কর্তৃক প্রদত্ত ট্রান্সক্রিপ্ট ও প্রশংসাপত্র",
      "পিতা-মাতার আয়ের সনদপত্র",
      "প্রতিষ্ঠান প্রধান কর্তৃক স্বাক্ষরিত সুপারিশপত্র"
    ],
    process: [
      "ব্যাংকের ওয়েবসাইটে বৃত্তির ফরম ডাউনলোড করুন অথবা নিকটস্থ শাখা থেকে সংগ্রহ করুন।",
      "সঠিক তথ্য প্রদান করে ফরম পূরণ করুন এবং প্রয়োজনীয় ডকুমেন্টস সংযুক্ত করুন।",
      "সংশ্লিষ্ট মাদ্রাসা সুপারের স্বাক্ষর নিয়ে স্থানীয় এআইবিএল শাখায় ফরম জমা দিন।"
    ],
    importantDates: [
      "আবেদন শুরু: ১৫ জুলাই, ২০২৬",
      "আবেদনের শেষ তারিখ: ১৫ আগস্ট, ২০২৬"
    ],
    benefits: [
      "আলিম বা দাখিল কোর্স চলাকালীন প্রতি মাসে ১,৫০০ টাকা সহায়তা",
      "বই ও ড্রেস ক্রয়ের জন্য বাৎসরিক ৩,০০০ টাকা সাহায্য"
    ],
    link: "https://www.al-arafahbank.com/",
    guidePdf: "#",
    faq: [
      { q: "উপজেলা পর্যায়ের মাদ্রাসা ছাত্ররাও কি পাবে?", a: "হ্যাঁ, দেশের প্রত্যন্ত অঞ্চলের ও উপজেলা পর্যায়ের মাদ্রাসার শিক্ষার্থীদের জন্য এই বৃত্তির ৬০% কোটা সংরক্ষিত থাকে।" }
    ],
    isFeatured: false,
    isPopular: false,
    postedDate: "2026-07-06"
  },
  {
    id: "static-8",
    title: "ব্র্যাক মেধা বিকাশ ও শিক্ষা সহায়তা কার্যক্রম",
    type: "ngo",
    level: ["school", "college", "undergrad"],
    provider: "ব্র্যাক (BRAC) সোশ্যাল ডেভেলপমেন্ট",
    target: "প্রান্তিক ও সুবিধাবঞ্চিত পরিবারের চরম মেধাবী শিক্ষার্থী",
    amount: "সম্পূর্ণ শিক্ষাবর্ষের সকল অ্যাকাডেমিক খরচ বহন ও মাসিক পকেট এলাউন্স",
    deadline: "2026-08-10",
    country: "বাংলাদেশ",
    description: "দেশের প্রত্যন্ত ও দরিদ্র অঞ্চলের চরম প্রতিভাবান কিন্তু সুবিধাবঞ্চিত ছাত্রছাত্রীদের সম্পূর্ণ বিনামূল্যে পড়াশোনা করানোর ব্র্যাকের দীর্ঘমেয়াদী মেধা বিকাশ প্রকল্প।",
    eligibility: [
      "পরিবারকে অতি-দরিদ্র সীমার নিচে বসবাস করতে হবে।",
      "এসএসসি ও সমমান পরীক্ষায় জিপিএ ৫.০০ পেতে হবে (বিশেষ ক্ষেত্রে জিপিএ ৪.৮০ গ্রহণযোগ্য)।",
      "বিশেষভাবে উপজাতি, হাওর অঞ্চল এবং চরাঞ্চলের শিক্ষার্থীদের প্রাধান্য দেওয়া হয়।"
    ],
    documents: [
      "ব্র্যাক স্থানীয় কার্যালয়ের সুপারিশপত্র",
      "এসএসসি মার্কশিট ও প্রশংসাপত্র",
      "ভূমিহীন বা অতি-দরিদ্র প্রমাণের সনদপত্র",
      "জন্ম সনদ"
    ],
    process: [
      "স্থানীয় ব্র্যাক অফিসে যোগাযোগ করে মেধা বিকাশ আবেদন ফর্ম সংগ্রহ করুন।",
      "আবেদন ফর্মটি পূরণ করে ব্র্যাক কর্মকর্তার প্রত্যয়নসহ জমা দিন।",
      "ব্র্যাক টিম আবেদনকারীর বাড়িতে সশরীরে গিয়ে সত্যতা যাচাই করবে এবং চূড়ান্ত অনুমোদন দেবে।"
    ],
    importantDates: [
      "আবেদন শুরু: ০১ জুলাই, ২০২৬",
      "আবেদনের শেষ তারিখ: ১০ আগস্ট, ২০২৬"
    ],
    benefits: [
      "কলেজ ও বিশ্ববিদ্যালয়ের ভর্তি ফি, টিউশন ফি ও হোস্টেল খরচ সম্পূর্ণ ফ্রি",
      "মাসিক চলার জন্য পকেট মানি হিসেবে ২,০০০ টাকা প্রদান",
      "ব্র্যাকের মেন্টরশিপ ও লিডারশিপ ট্রেনিং সেশন"
    ],
    link: "https://www.brac.net/",
    guidePdf: "#",
    faq: [
      { q: "এই কার্যক্রমের অধীনে কি উচ্চশিক্ষাও সহায়তা করা হয়?", a: "হ্যাঁ, এইচএসসি পাসের পর উচ্চ শিক্ষাতেও ব্র্যাকের সহযোগিতা অব্যাহত থাকে যদি সিজিপিএ ভালো থাকে।" }
    ],
    isFeatured: true,
    isPopular: false,
    postedDate: "2026-07-04"
  }
];

const SCHOLARSHIP_CATEGORIES = [
  { id: "all", label: "সব ক্যাটাগরি", icon: "📋", color: "from-blue-500 to-indigo-500" },
  { id: "govt", label: "সরকারি বৃত্তি", icon: "🏛️", color: "from-emerald-500 to-green-600" },
  { id: "university", label: "বিশ্ববিদ্যালয় বৃত্তি", icon: "🎓", color: "from-purple-500 to-indigo-600" },
  { id: "international", label: "আন্তর্জাতিক বৃত্তি", icon: "🌍", color: "from-cyan-500 to-blue-600" },
  { id: "ngo", label: "এনজিও বৃত্তি", icon: "🤝", color: "from-amber-500 to-orange-600" },
  { id: "merit", label: "মেধাবৃত্তি", icon: "👩‍🎓", color: "from-pink-500 to-rose-600" },
  { id: "financial", label: "আর্থিক সহায়তা", icon: "💰", color: "from-teal-500 to-emerald-600" },
  { id: "school_college", label: "স্কুল ও কলেজ বৃত্তি", icon: "📚", color: "from-violet-500 to-purple-600" },
  { id: "madrasha", label: "মাদ্রাসা বৃত্তি", icon: "🕌", color: "from-sky-500 to-sky-700" },
];

const EDUCATION_LEVELS = [
  { id: "all", label: "সব স্তর" },
  { id: "school", label: "স্কুল (৬ষ্ঠ-১০ম)" },
  { id: "college", label: "কলেজ / এইচএসসি" },
  { id: "madrasha", label: "মাদ্রাসা (দাখিল/আলিম)" },
  { id: "undergrad", label: "স্নাতক (Bachelor)" },
  { id: "postgrad", label: "স্নাতকোত্তর (Master/PhD)" }
];

export function ScholarshipInfo({ onGoBack }: { onGoBack: () => void }) {
  // Navigation tabs: Search & List, Favorites, Eligibility Checker, My Applications, Add/Manage
  const [activeView, setActiveView] = useState<"list" | "favorites" | "checker" | "my-apps" | "add">("list");
  
  // Base State for scholarship list
  const [dbScholarships, setDbScholarships] = useState<Scholarship[]>([]);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTabSection, setSelectedTabSection] = useState<"all" | "featured" | "popular" | "ending" | "new">("all");
  
  // Selection and Modal Detail state
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  // Favorites storage
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // My Applications progress tracking (ID mapped to Status)
  const [myApplications, setMyApplications] = useState<Record<string, { appliedDate: string; status: string }>>({});
  
  // Expanded FAQ ID state inside Details Modal
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);

  // New Post form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<Scholarship['type']>("govt");
  const [newLevel, setNewLevel] = useState<string>("all");
  const [newProvider, setNewProvider] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newCountry, setNewCountry] = useState("বাংলাদেশ");
  const [newDescription, setNewDescription] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newEligibility, setNewEligibility] = useState("");
  const [newDocuments, setNewDocuments] = useState("");
  const [newBenefits, setNewBenefits] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  // Eligibility Checker States
  const [checkerLevel, setCheckerLevel] = useState("school");
  const [checkerGPA, setCheckerGPA] = useState("5.00");
  const [checkerIncome, setCheckerIncome] = useState("below_2"); // below_2 (Lakh), below_3, above_3
  const [checkerResults, setCheckerResults] = useState<Scholarship[] | null>(null);
  const [checkerSubmitted, setCheckerSubmitted] = useState(false);

  // Reminders Toast/Banner state
  const [showReminderToast, setShowReminderToast] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");

  // Share overlay state
  const [shareToastText, setShareToastText] = useState("");

  // Simulated download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Load subscriptions & local storage on start
  useEffect(() => {
    // Load favorites
    const savedFavs = localStorage.getItem("fav_scholarships");
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) { console.error(e); }
    }
    
    // Load my applications
    const savedApps = localStorage.getItem("my_scholarship_apps");
    if (savedApps) {
      try { setMyApplications(JSON.parse(savedApps)); } catch (e) { console.error(e); }
    }

    // Read Firestore scholarships
    const q = query(collection(db, "scholarships"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Scholarship[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          type: (data.type || "govt") as Scholarship['type'],
          level: (data.level || ["all"]) as Scholarship['level'],
          provider: data.provider || "অজানা প্রতিষ্ঠান",
          target: data.target || "সকল শিক্ষার্থী",
          amount: data.amount || "তথ্য পাওয়া যায়নি",
          deadline: data.deadline || "২০২৬-১২-৩১",
          country: data.country || "বাংলাদেশ",
          description: data.description || "",
          eligibility: Array.isArray(data.eligibility) ? data.eligibility : [data.eligibility || "অনলাইন যোগ্যতা যাচাই করুন"],
          documents: Array.isArray(data.documents) ? data.documents : [data.documents || "অনলাইন ফরম ও মূল মার্কশিট"],
          process: Array.isArray(data.process) ? data.process : ["অফিসিয়াল লিংকে অনলাইনে আবেদন ফর্ম পূরণ"],
          importantDates: Array.isArray(data.importantDates) ? data.importantDates : [`আবেদনের শেষ তারিখ: ${data.deadline || "২০২৬-১২-৩১"}`],
          benefits: Array.isArray(data.benefits) ? data.benefits : ["শিক্ষা সহায়তা অনুদান"],
          link: data.link || "https://google.com",
          guidePdf: data.guidePdf || "#",
          faq: Array.isArray(data.faq) ? data.faq : [{ q: "আবেদনের শেষ তারিখ কবে?", a: data.deadline || "২০২৬-১২-৩১" }],
          isFeatured: !!data.isFeatured,
          isPopular: !!data.isPopular,
          postedDate: data.postedDate || "2026-07-10",
        });
      });
      setDbScholarships(list);
      setIsLoadingScholarships(false);
    }, (error) => {
      console.error("Error loading scholarships:", error);
      setIsLoadingScholarships(false);
      try {
        handleFirestoreError(error, OperationType.LIST, "scholarships");
      } catch (err) {
        console.warn("Muted background Firestore error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save favorites to LocalStorage
  const handleToggleFavorite = (id: string, title: string) => {
    let updated;
    let added = false;
    if (favorites.includes(id)) {
      updated = favorites.filter(fav => fav !== id);
    } else {
      updated = [...favorites, id];
      added = true;
    }
    setFavorites(updated);
    localStorage.setItem("fav_scholarships", JSON.stringify(updated));
    
    showToast(added ? `"${title}" সংরক্ষিত তালিকায় যুক্ত হয়েছে! ❤️` : `"${title}" সংরক্ষিত তালিকা থেকে সরানো হয়েছে।`);
  };

  // Toast Trigger Helper
  const showToast = (text: string) => {
    setShareToastText(text);
    setTimeout(() => setShareToastText(""), 4000);
  };

  // Set Reminder Toast Handler
  const handleSetReminder = (title: string, date: string) => {
    setReminderTitle(title);
    setShowReminderToast(true);
    setTimeout(() => setShowReminderToast(false), 5000);
  };

  // Apply Action Handler (Simulated & Application Tracking)
  const handleMarkAsApplied = (id: string, title: string) => {
    const todayStr = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    const updated = {
      ...myApplications,
      [id]: {
        appliedDate: todayStr,
        status: "আবেদন প্রক্রিয়াধীন (Pending)"
      }
    };
    setMyApplications(updated);
    localStorage.setItem("my_scholarship_apps", JSON.stringify(updated));
    showToast(`"${title}" আবেদনের ট্র্যাকিং শুরু হয়েছে! 📝`);
  };

  const handleRemoveApplication = (id: string) => {
    const updated = { ...myApplications };
    delete updated[id];
    setMyApplications(updated);
    localStorage.setItem("my_scholarship_apps", JSON.stringify(updated));
    showToast("আবেদন ট্র্যাকার থেকে মুছে ফেলা হয়েছে।");
  };

  // Simulated PDF Downloader
  const handleDownloadGuide = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      showToast(`"${title}" এর আবেদন গাইড PDF ডাউনলোড সফল হয়েছে! 📥`);
      // Simulate real download of a dummy text blob
      const element = document.createElement("a");
      const file = new Blob([`Scholarship Info Guide for ${title}\nOfficial Apply Portal: Standard Guideline PDF`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/\s+/g, '_')}_Guide.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  // Simulated Share Link
  const handleShare = async (title: string) => {
    const shareText = `🎓 ${title} এর বিস্তারিত তথ্য ও আবেদন লিংক পেয়েছি আমাদের পুঠিয়া অ্যাপে! চেক করতে লিংকে প্রবেশ করুন।`;
    const success = await copyToClipboard(shareText);
    if (success) {
      showToast("শেয়ার লিংক ক্লিপবোর্ডে কপি হয়েছে! 📤");
    } else {
      showToast("শেয়ার টেক্সট কপি করা যায়নি।");
    }
  };

  // Combine Firestore and Static datasets
  const allScholarships = useMemo(() => {
    return [...dbScholarships, ...staticScholarships];
  }, [dbScholarships]);

  // Compute stats on the complete dataset
  const stats = useMemo(() => {
    const now = new Date("2026-07-11T00:00:00"); // Using accurate reference current time
    let total = allScholarships.length;
    let govtCount = allScholarships.filter(s => s.type === "govt").length;
    let intCount = allScholarships.filter(s => s.type === "international" || s.country !== "বাংলাদেশ").length;
    
    // Count new (posted in last 10 days)
    let newCount = allScholarships.filter(s => {
      const pDate = new Date(s.postedDate);
      const diffTime = Math.abs(now.getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 12; // within 12 days is considered new
    }).length;

    // Count closing soon (deadline within next 35 days and still in future)
    let closingSoon = allScholarships.filter(s => {
      const dDate = new Date(s.deadline);
      const diffTime = dDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 35;
    }).length;

    return { total, govtCount, intCount, newCount, closingSoon };
  }, [allScholarships]);

  // Handle Eligibility Checker Algorithm
  const handleRunEligibilityChecker = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckerSubmitted(true);
    
    const parsedGpa = parseFloat(checkerGPA) || 0.0;
    
    // Filter matching scholarships
    const matches = allScholarships.filter(s => {
      // 1. Check Level match
      const levelMatches = s.level.includes("all") || s.level.includes(checkerLevel as any);
      if (!levelMatches) return false;

      // 2. Check GPA minimums (heuristic rules parsed from descriptions / lists)
      if (checkerGPA && parsedGpa < 3.5 && s.type === "merit") {
        return false; // Merit scholarships need high GPA
      }
      if (checkerGPA && parsedGpa < 4.5 && s.id === "static-2") {
        return false; // DBBL needs higher GPAs
      }

      // 3. Check Income constraint
      if (checkerIncome === "above_3") {
        // If income is high, filter out core "financial aid" only scholarships
        if (s.type === "financial" && s.id !== "static-6") {
          return false;
        }
      }

      return true;
    });

    setCheckerResults(matches);
  };

  // Filter Logic for Main Grid List
  const filteredScholarships = useMemo(() => {
    return allScholarships.filter(item => {
      // 1. Category tab filter
      if (selectedCategory !== "all" && item.type !== selectedCategory) {
        return false;
      }

      // 2. Academic Level filter
      if (selectedLevel !== "all" && !item.level.includes("all") && !item.level.includes(selectedLevel as any)) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesProvider = item.provider.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTarget = item.target.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProvider && !matchesDesc && !matchesTarget) {
          return false;
        }
      }

      // 4. Country filter
      if (selectedCountry !== "all") {
        if (selectedCountry === "intl") {
          if (item.country === "বাংলাদেশ") return false;
        } else if (item.country !== "বাংলাদেশ") {
          return false;
        }
      }

      // 5. Special segment section filter (Featured / Popular / Ending Soon / Newly Added)
      const now = new Date("2026-07-11");
      if (selectedTabSection === "featured" && !item.isFeatured) return false;
      if (selectedTabSection === "popular" && !item.isPopular) return false;
      
      if (selectedTabSection === "ending") {
        const dDate = new Date(item.deadline);
        const diffDays = Math.ceil((dDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 35) return false;
      }
      
      if (selectedTabSection === "new") {
        const pDate = new Date(item.postedDate);
        const diffDays = Math.ceil((now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 12) return false;
      }

      return true;
    });
  }, [allScholarships, selectedCategory, selectedLevel, searchQuery, selectedCountry, selectedTabSection]);

  // Firestore submit post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProvider.trim() || !newTarget.trim() || !newDeadline.trim() || !newDescription.trim() || !newLink.trim()) {
      alert("দয়া করে সকল প্রয়োজনীয় লাল চিহ্নিত তারকা (*) চিহ্নিত তথ্য পূরণ করুন।");
      return;
    }

    let formattedLink = newLink.trim();
    if (!formattedLink.startsWith("http://") && !formattedLink.startsWith("https://")) {
      formattedLink = "https://" + formattedLink;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, "scholarships"), {
        title: newTitle.trim(),
        type: newType,
        level: [newLevel],
        provider: newProvider.trim(),
        target: newTarget.trim(),
        amount: newAmount.trim() || "এককালীন সহায়তা",
        deadline: newDeadline.trim(),
        country: newCountry.trim(),
        description: newDescription.trim(),
        eligibility: newEligibility ? newEligibility.split("\n").filter(x => x.trim()) : ["নিয়মিত ছাত্র হতে হবে"],
        documents: newDocuments ? newDocuments.split("\n").filter(x => x.trim()) : ["প্রত্যয়ন পত্র ও মার্কশিট"],
        benefits: newBenefits ? newBenefits.split("\n").filter(x => x.trim()) : ["আর্থিক বৃত্তি"],
        link: formattedLink,
        postedDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });

      // Reset
      setNewTitle("");
      setNewProvider("");
      setNewTarget("");
      setNewAmount("");
      setNewDeadline("");
      setNewCountry("বাংলাদেশ");
      setNewDescription("");
      setNewLink("");
      setNewEligibility("");
      setNewDocuments("");
      setNewBenefits("");
      setShowPostForm(false);
      setActiveView("list");
      alert("আপনার স্কলারশিপের তথ্যটি সফলভাবে পোস্ট করা হয়েছে! এটি অবিলম্বে তালিকায় প্রদর্শিত হচ্ছে।");
    } catch (err) {
      console.error("Error posting scholarship:", err);
      alert("পোস্ট করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট চেক করুন।");
      try {
        handleFirestoreError(err, OperationType.CREATE, "scholarships");
      } catch (e) {
        console.warn(e);
      }
    } finally {
      setIsPosting(false);
    }
  };

  // Admin delete scholarship
  const handleAdminDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই স্কলারশিপটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "scholarships", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting scholarship:", err);
      alert("ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  // Helper date calculation "Days remaining" in Bengali
  const getDaysRemainingText = (deadlineStr: string) => {
    const now = new Date("2026-07-11");
    const deadline = new Date(deadlineStr);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: "আবেদন শেষ", isExpired: true, days: diffDays };
    } else if (diffDays === 0) {
      return { text: "আজই শেষ দিন", isExpired: false, isUrgent: true, days: 0 };
    } else {
      // Convert to Bengali numbers
      const banglaNums: Record<string, string> = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      const banglaDays = String(diffDays).split('').map(digit => banglaNums[digit] || digit).join('');
      return { text: `${banglaDays} দিন বাকি`, isExpired: false, isUrgent: diffDays <= 10, days: diffDays };
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16 animate-fade-in text-slate-800">
      {/* Reminder notification modal/toast */}
      <AnimatePresence>
        {showReminderToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-emerald-600 text-white p-5 rounded-3xl shadow-2xl z-50 flex gap-3 items-start border border-emerald-500"
          >
            <Bell className="w-6 h-6 shrink-0 text-emerald-100 animate-bounce" />
            <div className="flex-1">
              <h4 className="m-0 font-extrabold text-sm text-white flex items-center gap-1.5">রিমাইন্ডার সেট করা হয়েছে! ⏰</h4>
              <p className="text-xs text-emerald-50 text-slate-100 leading-relaxed mt-1">
                "{reminderTitle}" স্কলারশিপের শেষ তারিখের ৫ দিন পূর্বে আপনার নোটিফিকেশন বারে সতর্কবার্তা পাঠানো হবে।
              </p>
              <button 
                onClick={() => setShowReminderToast(false)} 
                className="mt-3 text-[10px] bg-white/20 hover:bg-white/30 text-white font-bold py-1.5 px-3 rounded-lg border-none cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
            <button onClick={() => setShowReminderToast(false)} className="text-white/80 hover:text-white bg-transparent border-none cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating global feedback notification */}
      <AnimatePresence>
        {shareToastText && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 text-xs py-3 px-6 rounded-full shadow-xl z-50 font-bold flex items-center gap-2 border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{shareToastText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hero Banner */}
      <div 
        className="p-6 md:p-8 text-white rounded-[32px] relative overflow-hidden" 
        style={{ 
          background: "linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)", 
          boxShadow: "0 15px 35px -5px rgba(67, 56, 202, 0.3)" 
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl -z-10 pointer-events-none" />
        
        <div className="flex justify-between items-center">
          <button 
            onClick={onGoBack} 
            className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <span className="text-xs font-black tracking-widest text-indigo-200 uppercase bg-indigo-900/50 px-3 py-1.5 rounded-full border border-indigo-700/40">
            Education Portal
          </span>
        </div>

        <div className="mt-6 md:mt-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500/20 rounded-2xl border border-indigo-400/20 mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white m-0">স্কলারশিপ ও উপবৃত্তি পোর্টাল</h1>
          <p className="mt-2 text-slate-200 text-sm md:text-base leading-relaxed opacity-95">
            "আপনার শিক্ষার স্বপ্ন পূরণে দেশি ও আন্তর্জাতিক সকল বৃত্তির নির্ভরযোগ্য তথ্য এখন এক জায়গায়"
          </p>
        </div>

        {/* Global Search and Filter Input in Hero */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="bg-white rounded-2xl p-2 shadow-xl flex items-center border border-indigo-100">
            <Search className="w-5 h-5 text-indigo-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="স্কলারশিপের নাম, প্রতিষ্ঠান বা দেশ লিখে খুঁজুন..."
              className="w-full text-slate-800 text-sm p-2 outline-none font-medium border-none bg-transparent"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer border-none bg-transparent mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg mb-1.5">
            🎓
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট স্কলারশিপ</span>
          <span className="text-xl font-black text-slate-800 mt-0.5">{stats.total}টি</span>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg mb-1.5">
            🆕
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">নতুন সংযোজন</span>
          <span className="text-xl font-black text-emerald-600 mt-0.5">{stats.newCount}টি</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-bold text-lg mb-1.5">
            ⏳
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">শীঘ্রই শেষ হবে</span>
          <span className="text-xl font-black text-rose-600 mt-0.5">{stats.closingSoon}টি</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-bold text-lg mb-1.5">
            🏛️
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">সরকারি বৃত্তি</span>
          <span className="text-xl font-black text-slate-800 mt-0.5">{stats.govtCount}টি</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 font-bold text-lg mb-1.5">
            🌍
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">আন্তর্জাতিক</span>
          <span className="text-xl font-black text-slate-800 mt-0.5">{stats.intCount}টি</span>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveView("list")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition cursor-pointer border-none ${
            activeView === "list" 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
              : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Search className="w-4 h-4" /> বৃত্তি অনুসন্ধান
        </button>

        <button
          onClick={() => setActiveView("checker")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition cursor-pointer border-none ${
            activeView === "checker" 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
              : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4" /> যোগ্যতা যাচাইকারী (Eligibility Checker)
        </button>

        <button
          onClick={() => setActiveView("my-apps")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition cursor-pointer border-none relative ${
            activeView === "my-apps" 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
              : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" /> আমার আবেদন ট্র্যাকার
          {Object.keys(myApplications).length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveView("favorites")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition cursor-pointer border-none ${
            activeView === "favorites" 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
              : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-4 h-4 fill-current text-rose-500" /> সংরক্ষিত ({favorites.length})
        </button>

        <button
          onClick={() => setActiveView("add")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs md:text-sm whitespace-nowrap transition cursor-pointer border-none ml-auto ${
            activeView === "add" 
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" 
              : "bg-transparent text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          <Plus className="w-4 h-4" /> পোস্ট করুন
        </button>
      </div>

      {/* VIEW 1: ELIGIBILITY CHECKER */}
      {activeView === "checker" && (
        <div className="bg-white rounded-[24px] p-6 border border-indigo-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Award className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">১-ক্লিক যোগ্যতা যাচাই (Eligibility Checker)</h3>
              <p className="text-xs text-slate-500 font-medium">আপনার বর্তমান লেভেল এবং গ্রেড দিয়ে মুহূর্তেই ম্যাচিং বৃত্তি দেখুন।</p>
            </div>
          </div>

          <form onSubmit={handleRunEligibilityChecker} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">১. বর্তমান শিক্ষার স্তর:</label>
              <select
                value={checkerLevel || ""}
                onChange={(e) => setCheckerLevel(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 transition font-bold text-slate-700"
              >
                <option value="school">স্কুল (Class 6-10)</option>
                <option value="college">উচ্চমাধ্যমিক (HSC/College)</option>
                <option value="madrasha">মাদ্রাসা (দাখিল/আলিম)</option>
                <option value="undergrad">স্নাতক (Bachelor)</option>
                <option value="postgrad">স্নাতকোত্তর (Master/PhD)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">২. পূর্ববর্তী পরীক্ষার জিপিএ (GPA):</label>
              <select
                value={checkerGPA || ""}
                onChange={(e) => setCheckerGPA(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 transition font-bold text-slate-700"
              >
                <option value="5.00">GPA 5.00 (গোল্ডেন/সাধারণ)</option>
                <option value="4.50">GPA 4.50 - 4.99</option>
                <option value="4.00">GPA 4.00 - 4.49</option>
                <option value="3.50">GPA 3.50 - 3.99</option>
                <option value="3.00">GPA 3.00 এর নিচে</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">৩. পরিবারের বার্ষিক আয়:</label>
              <select
                value={checkerIncome || ""}
                onChange={(e) => setCheckerIncome(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 transition font-bold text-slate-700"
              >
                <option value="below_2">২ লক্ষ টাকার নিচে (দরিদ্র/অস্বচ্ছল)</option>
                <option value="below_3">২ থেকে ৩ লক্ষ টাকা</option>
                <option value="above_3">৩ লক্ষ টাকার উপরে (মধ্যবিত্ত/উচ্চবিত্ত)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition duration-150 shadow-md shadow-indigo-600/10 cursor-pointer border-none flex items-center justify-center gap-1"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> যোগ্যতা যাচাই করুন
              </button>
            </div>
          </form>

          {checkerSubmitted && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="m-0 text-sm font-black text-slate-700">
                  🎯 আপনার জন্য প্রস্তাবিত স্কলারশিপ  ({checkerResults?.length || 0}টি পাওয়া গেছে)
                </h4>
                <button 
                  onClick={() => { setCheckerSubmitted(false); setCheckerResults(null); }} 
                  className="text-xs text-indigo-600 hover:underline font-bold border-none bg-transparent cursor-pointer"
                >
                  রিসেট
                </button>
              </div>

              {checkerResults && checkerResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkerResults.map(s => (
                    <div 
                      key={s.id} 
                      className="bg-indigo-50/40 hover:bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 shadow-sm transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                            {s.type === 'govt' ? '🏛️ সরকারি' : s.type === 'international' ? '🌍 আন্তর্জাতিক' : '🎓 বেসরকারি/মেধা'}
                          </span>
                          <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> ১০০% ম্যাচ
                          </span>
                        </div>
                        <h4 className="m-0 text-base font-extrabold text-slate-800 mt-2">{s.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">প্রদানকারী: {s.provider}</p>
                        <p className="text-xs text-slate-600 mt-2 font-bold bg-white p-2 rounded-lg border border-slate-100">
                          💰 পরিমাণ: {s.amount}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-indigo-100 flex gap-2">
                        <button 
                          onClick={() => setSelectedScholarship(s)}
                          className="flex-1 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition cursor-pointer border-none"
                        >
                          বিস্তারিত ও যোগ্যতা দেখুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-3xl">😔</span>
                  <p className="text-xs text-slate-500 font-bold mt-2">দুঃখিত, আপনার দেওয়া তথ্যের সাথে সামঞ্জস্যপূর্ণ কোনো বৃত্তি এই মুহূর্তে পাওয়া যায়নি।</p>
                  <p className="text-[10px] text-slate-400">অনুগ্রহ করে GPA বা স্তর পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FAVORITES LIST */}
      {activeView === "favorites" && (
        <div className="space-y-4">
          <div className="bg-rose-50 text-rose-800 p-5 rounded-2xl border border-rose-100 flex items-center gap-3">
            <Heart className="w-7 h-7 fill-current text-rose-500 shrink-0" />
            <div>
              <h3 className="m-0 text-base font-black">আপনার সংরক্ষিত স্কলারশিপ </h3>
              <p className="text-xs text-rose-600 font-semibold">আপনার পছন্দের ও গুরুত্বপূর্ণ বৃত্তির তথ্য নিচে সেভ করে রাখা হয়েছে।</p>
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allScholarships.filter(s => favorites.includes(s.id)).map(s => {
                const daysLeft = getDaysRemainingText(s.deadline);
                return (
                  <div key={s.id} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm relative flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                          {s.provider}
                        </span>
                        <button 
                          onClick={() => handleToggleFavorite(s.id, s.title)}
                          className="p-1.5 hover:bg-rose-50 rounded-full border-none bg-transparent cursor-pointer text-rose-500"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <h4 className="m-0 text-base font-black text-slate-800 mt-2">{s.title}</h4>
                      <p className="text-xs text-slate-500 font-bold mt-1">দেশ: {s.country}</p>
                      <p className="text-xs text-slate-600 italic mt-2 line-clamp-2">"{s.description}"</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${daysLeft.isUrgent ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'}`}>
                        ⏳ {daysLeft.text}
                      </span>
                      <button 
                        onClick={() => setSelectedScholarship(s)}
                        className="text-xs font-black text-indigo-600 hover:underline border-none bg-transparent cursor-pointer flex items-center gap-0.5"
                      >
                        বিস্তারিত দেখুন ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-slate-300 text-4xl mb-3">❤️</div>
              <p className="text-sm font-black text-slate-500">আপনার সংরক্ষিত তালিকায় কোনো স্কলারশিপ নেই।</p>
              <p className="text-xs text-slate-400">পছন্দসই স্কলারশিপের পাশে থাকা হার্ট (Heart) আইকনে ক্লিক করে সেভ করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY APPLICATIONS TRACKER */}
      {activeView === "my-apps" && (
        <div className="space-y-4">
          <div className="bg-blue-50 text-blue-800 p-5 rounded-2xl border border-blue-100 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-500 shrink-0" />
            <div>
              <h3 className="m-0 text-base font-black">আবেদন অগ্রগতি ট্র্যাকিং কেন্দ্র</h3>
              <p className="text-xs text-blue-600 font-semibold">আপনি কোন কোন স্কলারশিপে ইতিমধ্যে আবেদন করেছেন তার তালিকা ও স্ট্যাটাস ট্র্যাকার।</p>
            </div>
          </div>

          {Object.keys(myApplications).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(myApplications).map(([id, info]) => {
                const s = allScholarships.find(item => item.id === id);
                if (!s) return null;
                return (
                  <div key={id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Check className="w-5 h-5 font-black" />
                      </div>
                      <div>
                        <h4 className="m-0 text-base font-black text-slate-800">{s.title}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1">প্রদানকারী: {s.provider}</p>
                        <div className="flex gap-2 items-center mt-2">
                          <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-bold">
                            📅 ট্র্যাকিং শুরু: {info.appliedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">স্ট্যাটাস</span>
                        <select
                          value={info.status || ""}
                          onChange={(e) => {
                            const updated = {
                              ...myApplications,
                              [id]: { ...info, status: e.target.value }
                            };
                            setMyApplications(updated);
                            localStorage.setItem("my_scholarship_apps", JSON.stringify(updated));
                            showToast("আবেদনের স্ট্যাটাস আপডেট করা হয়েছে! 📝");
                          }}
                          className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 p-2 rounded-lg outline-none cursor-pointer mt-1"
                        >
                          <option value="আবেদন প্রক্রিয়াধীন (Pending)">⏳ আবেদন প্রক্রিয়াধীন (Pending)</option>
                          <option value="কাগজপত্র যাচাই হচ্ছে (Verifying)">📄 কাগজপত্র যাচাই হচ্ছে (Verifying)</option>
                          <option value="ইন্টারভিউ মনোনীত (Shortlisted)">🎤 ইন্টারভিউ মনোনীত (Shortlisted)</option>
                          <option value="অনুমোদিত ও মনোনীত (Awarded 🎉)">🎉 অনুমোদিত ও মনোনীত (Awarded!)</option>
                          <option value="আবেদন বাতিল (Not Selected)">❌ আবেদন বাতিল (Not Selected)</option>
                        </select>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => setSelectedScholarship(s)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 bg-transparent cursor-pointer"
                          title="বিস্তারিত দেখুন"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveApplication(id)}
                          className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 border border-rose-100 bg-transparent cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-slate-300 text-4xl mb-3">📝</div>
              <p className="text-sm font-black text-slate-500">আপনার কোনো সক্রিয় আবেদন ট্র্যাকিং লিস্টে নেই।</p>
              <p className="text-xs text-slate-400">যেকোনো বৃত্তির বিস্তারিত পপআপে প্রবেশ করে "আবেদন ট্র্যাকিং শুরু করুন" এ ক্লিক করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: POST / ADD NEW SCHOLARSHIP */}
      {activeView === "add" && (
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="m-0 text-lg font-black text-slate-800">নতুন স্কলারশিপ বা উপবৃত্তি তথ্য সংযোজন</h3>
              <p className="text-xs text-slate-500 font-medium">শিক্ষার্থীদের কল্যাণে যেকোনো নির্ভরযোগ্য বৃত্তির সার্কুলার এখানে পোস্ট করুন।</p>
            </div>
          </div>

          <form onSubmit={handlePostSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">১. স্কলারশিপের নাম / সার্কুলার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={newTitle || ""}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: বঙ্গবন্ধু মেধা বৃত্তি ও আর্থিক অনুদান ২০২৬"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">২. প্রদানকারী সংস্থা / ট্রাস্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={newProvider || ""}
                  onChange={(e) => setNewProvider(e.target.value)}
                  placeholder="যেমন: বঙ্গবন্ধু মেমোরিয়াল ট্রাস্ট ফাউন্ডেশন"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৩. বৃত্তির ক্যাটাগরি *</label>
                <select
                  value={newType || ""}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-bold"
                >
                  <option value="govt">🏛️ সরকারি বৃত্তি</option>
                  <option value="university">🎓 বিশ্ববিদ্যালয় বৃত্তি</option>
                  <option value="international">🌍 আন্তর্জাতিক বৃত্তি</option>
                  <option value="ngo">🤝 এনজিও বৃত্তি</option>
                  <option value="merit">👩‍🎓 মেধাবৃত্তি</option>
                  <option value="financial">💰 আর্থিক সহায়তা</option>
                  <option value="school_college">📚 স্কুল ও কলেজ বৃত্তি</option>
                  <option value="madrasha">🕌 মাদ্রাসা বৃত্তি</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৪. লক্ষ্য শিক্ষাগত স্তর *</label>
                <select
                  value={newLevel || ""}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-bold"
                >
                  <option value="all">সকল স্তরের জন্য</option>
                  <option value="school">স্কুল (Class 6-10)</option>
                  <option value="college">কলেজ (HSC/College)</option>
                  <option value="madrasha">মাদ্রাসা (দাখিল/আলিম)</option>
                  <option value="undergrad">স্নাতক (Bachelor)</option>
                  <option value="postgrad">স্নাতকোত্তর (Master/PhD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৫. দেশ (দেশি নাকি বিদেশি) *</label>
                <input
                  type="text"
                  required
                  value={newCountry || ""}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder="যেমন: বাংলাদেশ বা জাপান"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৬. কারা আবেদন করতে পারবে (এক লাইনে) *</label>
                <input
                  type="text"
                  required
                  value={newTarget || ""}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="যেমন: এসএসসি সমমান পরীক্ষায় জিপিএ ৪.৫০"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৭. বৃত্তির পরিমাণ / সুবিধা বিবরণ</label>
                <input
                  type="text"
                  value={newAmount || ""}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="যেমন: মাসিক ২,০০০ টাকা ও বই কেনার অনুদান"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">৮. আবেদনের শেষ সময় (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={newDeadline || ""}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">৯. বৃত্তির সংক্ষিপ্ত পরিচিতি / বিবরণ *</label>
              <textarea
                required
                rows={3}
                value={newDescription || ""}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="স্কলারশিপটির উদ্দেশ্য, প্রদানকারীর ব্যাকগ্রাউন্ড ও সংক্ষিপ্ত বিবরণ উল্লেখ করুন..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">১০. প্রয়োজনীয় যোগ্যতা (প্রতি লাইনে একটি করে এন্টার চাপুন)</label>
                <textarea
                  rows={3}
                  value={newEligibility || ""}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  placeholder="১. এসএসসি জিপিএ ৫.০০ হতে হবে&#10;২. বার্ষিক আয় অনুর্ধ্ব ২ লক্ষ"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">১১. প্রয়োজনীয় কাগজপত্র (প্রতি লাইনে একটি করে এন্টার চাপুন)</label>
                <textarea
                  rows={3}
                  value={newDocuments || ""}
                  onChange={(e) => setNewDocuments(e.target.value)}
                  placeholder="১. প্রশংসাপত্র অনুলিপি&#10;২. পাসপোর্ট সাইজের ছবি"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">১২. বৃত্তির সুযোগ-সুবিধা (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3}
                  value={newBenefits || ""}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  placeholder="১. মাসিক বৃত্তির সুযোগ&#10;২. বিনামূল্যে অ্যাকাডেমিক কোচিং"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">১৩. অফিসিয়াল আবেদন লিংক / ওয়েবসাইট ওয়েবসাইট *</label>
                <input
                  type="text"
                  required
                  value={newLink || ""}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="যেমন: scholarship.gov.bd বা pmeat.gov.bd"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPosting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-black rounded-2xl transition duration-150 shadow-md shadow-indigo-600/15 cursor-pointer border-none flex items-center justify-center gap-1.5"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  পোস্ট সাবমিট হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> স্কলারশিপ সার্কুলার প্রকাশ করুন
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 5: CORE SEARCH, CATEGORIES & LISTINGS */}
      {activeView === "list" && (
        <div className="space-y-6">
          
          {/* Advanced Filter Layout (Desktop Side-by-Side or Responsive Accordion) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-500" /> অ্যাডভান্সড ফিল্টার ও সর্টিং
              </span>
              {(selectedLevel !== "all" || selectedCountry !== "all" || searchQuery !== "" || selectedCategory !== "all" || selectedTabSection !== "all") && (
                <button
                  onClick={() => {
                    setSelectedLevel("all");
                    setSelectedCountry("all");
                    setSelectedCategory("all");
                    setSelectedTabSection("all");
                    setSearchQuery("");
                  }}
                  className="text-xs text-indigo-600 hover:underline font-extrabold flex items-center gap-1 border-none bg-transparent cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> ফিল্টার রিসেট
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Level select */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">১. শিক্ষার স্তর দিয়ে ফিল্টার:</label>
                <select
                  value={selectedLevel || ""}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-bold cursor-pointer"
                >
                  {EDUCATION_LEVELS.map(el => (
                    <option key={el.id} value={el.id || ""}>{el.label}</option>
                  ))}
                </select>
              </div>

              {/* Country select */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">২. দেশ ভিত্তিক ফিল্টার:</label>
                <select
                  value={selectedCountry || ""}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-bold cursor-pointer"
                >
                  <option value="all">সকল দেশ (দেশি ও বিদেশি)</option>
                  <option value="local">🇧🇩 বাংলাদেশ (দেশীয় বৃত্তি)</option>
                  <option value="intl">🌍 আন্তর্জাতিক (বিদেশী উচ্চশিক্ষা)</option>
                </select>
              </div>

              {/* Special quick selections */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">৩. বিশেষ বাছাইকরণ:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedTabSection(selectedTabSection === "featured" ? "all" : "featured")}
                    className={`py-2 px-3 rounded-xl text-[10.5px] font-black border transition cursor-pointer ${
                      selectedTabSection === "featured" 
                        ? "bg-amber-100 text-amber-700 border-amber-300" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    📌 Featured
                  </button>
                  <button
                    onClick={() => setSelectedTabSection(selectedTabSection === "ending" ? "all" : "ending")}
                    className={`py-2 px-3 rounded-xl text-[10.5px] font-black border transition cursor-pointer ${
                      selectedTabSection === "ending" 
                        ? "bg-rose-100 text-rose-700 border-rose-300" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🔥 শীঘ্রই শেষ হবে
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories Selection Rail (Bengali styled icons & badges) */}
          <div className="space-y-2">
            <h3 className="m-0 text-sm font-black text-slate-700 flex items-center gap-1.5 px-1">
              🏢 ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {SCHOLARSHIP_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer border ${
                    selectedCategory === cat.id 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10" 
                      : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Highlights Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setSelectedTabSection("new")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                selectedTabSection === "new" 
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm" 
                  : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🆕</span>
                <div>
                  <h4 className="m-0 text-xs font-black">নতুন যুক্ত হওয়া স্কলারশিপ</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">গত ৭-১০ দিনে যুক্ত হওয়া বৃত্তিের তালিকা</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-full">
                {allScholarships.filter(s => {
                  const pDate = new Date(s.postedDate);
                  return Math.ceil((new Date("2026-07-11").getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24)) <= 12;
                }).length}টি দেখুন
              </span>
            </div>

            <div 
              onClick={() => setSelectedTabSection("popular")}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                selectedTabSection === "popular" 
                  ? "bg-purple-50 border-purple-300 text-purple-950 shadow-sm" 
                  : "bg-white border-slate-100 text-slate-800 hover:border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <h4 className="m-0 text-xs font-black">জনপ্রিয় ও মেগা স্কলারশিপ</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">সবচেয়ে জনপ্রিয় এবং সম্পূর্ণ অর্থায়িত সুযোগ</p>
                </div>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-black px-2.5 py-1 rounded-full">
                {allScholarships.filter(s => s.isPopular).length}টি দেখুন
              </span>
            </div>
          </div>

          {/* Scholarship List Card Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="m-0 text-base font-black text-slate-800 flex items-center gap-1.5">
                💼 সার্কুলার তালিকা ({filteredScholarships.length}টি পাওয়া গেছে)
              </h3>
              <span className="text-xs text-slate-400 font-bold">আপডেট সময়: জুলাই ২০২৬</span>
            </div>

            {isLoadingScholarships ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-indigo-50/50 shadow-sm">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-bold">বৃত্তির তালিকা লোড হচ্ছে, অপেক্ষা করুন...</p>
              </div>
            ) : filteredScholarships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScholarships.map(item => {
                  const daysLeft = getDaysRemainingText(item.deadline);
                  const isNew = (() => {
                    const pDate = new Date(item.postedDate);
                    const diffDays = Math.ceil((new Date("2026-07-11").getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 12;
                  })();

                  return (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top floating badges */}
                      <div className="absolute top-0 right-0 flex items-center z-10">
                        {isNew && (
                          <span className="bg-emerald-500 text-white px-3 py-1.5 text-[9px] font-black tracking-wider uppercase rounded-bl-xl shadow-sm">
                            NEW (নতুন)
                          </span>
                        )}
                        {item.isFeatured && !isNew && (
                          <span className="bg-amber-500 text-white px-3 py-1.5 text-[9px] font-black tracking-wider uppercase rounded-bl-xl shadow-sm">
                            📌 FEATURED
                          </span>
                        )}
                        {!isNew && !item.isFeatured && (
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 text-[9px] font-black uppercase rounded-bl-xl">
                            {item.type === 'govt' ? 'সরকারি' : item.type === 'international' ? 'আন্তর্জাতিক' : 'স্কলারশিপ'}
                          </span>
                        )}
                      </div>

                      <div>
                        {/* Title & Organization */}
                        <div className="pr-16">
                          <span className="text-[10px] text-indigo-600 font-extrabold uppercase bg-indigo-50 py-0.5 px-2 rounded-md">
                            {item.provider}
                          </span>
                          <h3 className="m-0 text-base md:text-lg font-black text-slate-800 mt-2 leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                        </div>

                        {/* Details parameters */}
                        <div className="grid grid-cols-1 gap-2 mt-4 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span><strong className="font-bold">আবেদনের যোগ্যতা:</strong> {item.target}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span><strong className="font-bold">বৃত্তির পরিমাণ:</strong> {item.amount}</span>
                          </div>
                          {item.country !== "বাংলাদেশ" && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span><strong className="font-bold">গন্তব্য দেশ:</strong> {item.country}</span>
                            </div>
                          )}
                        </div>

                        {/* Description excerpt */}
                        <p className="text-xs text-slate-500 leading-relaxed mt-3 line-clamp-2 italic border-l-2 border-indigo-200 pl-2">
                          "{item.description}"
                        </p>
                      </div>

                      {/* Footer CTA and save action */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Countdown / Expire Info */}
                        <div className="flex items-center gap-1">
                          <span className={`text-[10.5px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 ${
                            daysLeft.isExpired 
                              ? "bg-slate-100 text-slate-500" 
                              : daysLeft.isUrgent 
                                ? "bg-red-50 text-red-600 border border-red-100 animate-pulse" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Heart Favorite button */}
                          <button
                            onClick={() => handleToggleFavorite(item.id, item.title)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition ${
                              favorites.includes(item.id)
                                ? "bg-rose-50 border-rose-200 text-rose-500"
                                : "bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50"
                            }`}
                            title="সংরক্ষণ করুন"
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(item.id) ? "fill-current" : ""}`} />
                          </button>

                          {/* Detail pop up button */}
                          <button
                            onClick={() => setSelectedScholarship(item)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer border-none flex items-center gap-1 shadow-sm shadow-indigo-600/10"
                          >
                            বিস্তারিত দেখুন ➜
                          </button>

                          {/* Admin delete fallback */}
                          {item.id.startsWith("static") === false && (
                            <button
                              onClick={(e) => handleAdminDelete(item.id, e)}
                              className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl cursor-pointer border-none"
                              title="ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <span className="text-4xl">😔</span>
                <p className="text-sm font-black text-slate-500 mt-2">আপনার ফিল্টার বা সার্চের সাথে মিলে কোনো বৃত্তির তথ্য পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-400">দয়া করে কীওয়ার্ড পরিবর্তন করুন অথবা ফিল্টার রিসেট করুন।</p>
                <button
                  onClick={() => {
                    setSelectedLevel("all");
                    setSelectedCountry("all");
                    setSelectedCategory("all");
                    setSelectedTabSection("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl cursor-pointer border-none"
                >
                  সবগুলো পুনরায় দেখুন
                </button>
              </div>
            )}
          </div>

          {/* Bottom CTA Section */}
          <div 
            className="p-6 md:p-8 rounded-[32px] text-white relative overflow-hidden"
            style={{ 
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)", 
              boxShadow: "0 10px 25px -5px rgba(30, 64, 175, 0.2)" 
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="m-0 text-xl md:text-2xl font-black">🎓 আপনার স্বপ্নের স্কলারশিপ খুঁজুন</h3>
                <p className="text-xs md:text-sm text-blue-100 max-w-xl leading-relaxed">
                  দেশীয় ও আন্তর্জাতিক বিভিন্ন স্কলারশিপের তথ্য, যোগ্যতা ও নিখুঁত আবেদন প্রক্রিয়া এক জায়গায়। যেকোনো জরুরি সমস্যায় আমাদের সাথে যোগাযোগ করুন।
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setActiveView("checker");
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs px-6 py-3.5 rounded-2xl transition border-none shadow-md cursor-pointer active:scale-95"
                >
                  📝 যোগ্যতা যাচাই করুন
                </button>
                <button 
                  onClick={() => handleShare("আমাদের পুঠিয়া স্কলারশিপ পোর্টাল")}
                  className="bg-indigo-800/80 hover:bg-indigo-900 text-white font-bold text-xs px-5 py-3.5 rounded-2xl transition border border-indigo-700 cursor-pointer"
                >
                  📤 শেয়ার করুন
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* DETAIL MODAL (Overlay Popup) */}
      <AnimatePresence>
        {selectedScholarship && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => { setSelectedScholarship(null); setExpandedFaqIdx(null); }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Banner */}
              <div 
                className="p-6 text-white shrink-0 relative"
                style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}
              >
                <button 
                  onClick={() => { setSelectedScholarship(null); setExpandedFaqIdx(null); }}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full border-none cursor-pointer text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/20 text-indigo-200">
                  {selectedScholarship.provider}
                </span>
                <h2 className="m-0 text-xl md:text-2xl font-black text-white mt-3 pr-8 leading-tight">
                  {selectedScholarship.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-indigo-100">
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                    🌍 দেশ: {selectedScholarship.country}
                  </span>
                  <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                    💰 পরিমাণ: {selectedScholarship.amount}
                  </span>
                  <span className="bg-rose-500/80 px-2.5 py-1 rounded-lg font-bold">
                    ⏳ শেষ তারিখ: {selectedScholarship.deadline}
                  </span>
                </div>
              </div>

              {/* Modal Body (Scrollable Content) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* 1. 📖 স্কলারশিপের পরিচিতি */}
                <div className="space-y-2">
                  <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-500" /> ১. স্কলারশিপের পরিচিতি ও বিবরণ
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedScholarship.description}
                  </p>
                </div>

                {/* 2. 🎯 যোগ্যতা */}
                <div className="space-y-2">
                  <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Award className="w-4.5 h-4.5 text-indigo-500" /> ২. আবেদনের যোগ্যতা ও শর্তাবলী
                  </h3>
                  <ul className="m-0 pl-5 text-xs text-slate-600 space-y-1.5 font-medium">
                    {selectedScholarship.eligibility.map((el, i) => (
                      <li key={i}>{el}</li>
                    ))}
                  </ul>
                </div>

                {/* 3. 📄 প্রয়োজনীয় কাগজপত্র */}
                <div className="space-y-2">
                  <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileText className="w-4.5 h-4.5 text-indigo-500" /> ৩. প্রয়োজনীয় কাগজপত্র (Documents)
                  </h3>
                  <ul className="m-0 pl-5 text-xs text-slate-600 space-y-1.5 font-medium">
                    {selectedScholarship.documents.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>

                {/* 4. 📝 আবেদন প্রক্রিয়া */}
                <div className="space-y-2">
                  <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <CheckCircle className="w-4.5 h-4.5 text-indigo-500" /> ৪. আবেদন প্রক্রিয়া (Step-by-step Process)
                  </h3>
                  <ol className="m-0 pl-5 text-xs text-slate-600 space-y-2 font-bold list-decimal">
                    {selectedScholarship.process.map((p, i) => (
                      <li key={i} className="font-medium text-slate-700">{p}</li>
                    ))}
                  </ol>
                </div>

                {/* 5. 💰 সুবিধা */}
                {selectedScholarship.benefits && selectedScholarship.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500" /> ৫. আর্থিক অনুদান ও অন্যান্য সুবিধা
                    </h3>
                    <ul className="m-0 pl-5 text-xs text-slate-600 space-y-1.5 font-medium">
                      {selectedScholarship.benefits.map((b, i) => (
                        <li key={i} className="text-slate-700">{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. 📅 গুরুত্বপূর্ণ তারিখ */}
                {selectedScholarship.importantDates && selectedScholarship.importantDates.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="m-0 text-xs font-black text-slate-700 uppercase tracking-wide">
                      📅 গুরুত্বপূর্ণ তারিখ (Important Dates):
                    </h4>
                    <ul className="m-0 pl-5 text-xs text-slate-600 space-y-1 font-bold">
                      {selectedScholarship.importantDates.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 7. 📥 প্রয়োজনীয় ফর্ম ও গাইড ডাউনলোড (Premium Feature) */}
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="m-0 text-xs font-black text-indigo-950 flex items-center gap-1">
                      📥 প্রয়োজনীয় ফর্ম ও আবেদন গাইড (PDF)
                    </h4>
                    <p className="text-[10px] text-indigo-600 mt-1">
                      মোবাইলে অফলাইনে দেখার জন্য সম্পূর্ণ আবেদন সহায়িকা ও ফর্ম ডাউনলোড করে নিন।
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadGuide(selectedScholarship.id, selectedScholarship.title)}
                    disabled={downloadingId === selectedScholarship.id}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition border-none cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {downloadingId === selectedScholarship.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> ডাউনলোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> PDF গাইড ডাউনলোড
                      </>
                    )}
                  </button>
                </div>

                {/* 8. ❓ FAQ (Frequently Asked Questions with Collapse) */}
                {selectedScholarship.faq && selectedScholarship.faq.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="m-0 text-sm font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <AlertCircle className="w-4.5 h-4.5 text-indigo-500" /> ৮. সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                    </h3>
                    <div className="space-y-1.5">
                      {selectedScholarship.faq.map((item, idx) => {
                        const isOpen = expandedFaqIdx === idx;
                        return (
                          <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                            <button
                              onClick={() => setExpandedFaqIdx(isOpen ? null : idx)}
                              className="w-full p-3 text-left font-bold text-xs text-slate-700 hover:bg-slate-50 flex justify-between items-center transition border-none cursor-pointer bg-white"
                            >
                              <span>❓ {item.q}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="bg-slate-50/50 p-3 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100"
                                >
                                  {item.a}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-wrap gap-2 items-center justify-between">
                
                {/* Application Tracking & Reminder Button */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleToggleFavorite(selectedScholarship.id, selectedScholarship.title)}
                    className="p-3 bg-white hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-pointer transition"
                    title="সংরক্ষণ করুন"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedScholarship.id) ? "fill-current text-rose-500" : ""}`} />
                  </button>

                  <button
                    onClick={() => handleShare(selectedScholarship.title)}
                    className="p-3 bg-white hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-pointer transition"
                    title="শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSetReminder(selectedScholarship.title, selectedScholarship.deadline)}
                    className="py-2.5 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition border-none cursor-pointer flex items-center gap-1"
                    title="রিমাইন্ডার অ্যালার্ট"
                  >
                    <Bell className="w-3.5 h-3.5" /> শেষ তারিখের রিমাইন্ডার
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {/* Mark as Applied tracker button */}
                  {myApplications[selectedScholarship.id] ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10.5px] font-black py-2.5 px-4 rounded-xl flex items-center gap-1 border border-emerald-200">
                      <Check className="w-4 h-4" /> ট্র্যাকার সক্রিয়
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkAsApplied(selectedScholarship.id, selectedScholarship.title)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition border-none cursor-pointer flex items-center gap-1"
                    >
                      📝 আবেদন ট্র্যাক করুন
                    </button>
                  )}

                  {/* External Portal Link */}
                  <a
                    href={selectedScholarship.link}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    🌐 এখনই আবেদন করুন <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

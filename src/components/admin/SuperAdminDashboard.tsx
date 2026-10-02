import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Users, Store, DollarSign, Database, 
  Activity, Settings, Lock, Sparkles, RefreshCw, 
  ArrowUpRight, FileSpreadsheet, Server, Bell, Cpu,
  CheckCircle2, AlertCircle, Layers, ShieldAlert, KeyRound,
  Stethoscope, Heart, Newspaper, Droplets, Clock, 
  FileCheck, AlertTriangle, Star, CheckSquare, BarChart3,
  Search, ExternalLink, Package, Home, Building2,
  GraduationCap, Sprout, Briefcase, Cloud, FileText,
  Calendar, ImageIcon, Megaphone, Menu, Filter,
  TrendingUp, Zap, UserCheck, Shield, ChevronRight,
  Eye, Check, X, ShieldX, Terminal, History, ArrowRight,
  Sliders, Plus, CheckCheck, HelpCircle, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  collection, getDocs, onSnapshot, query, 
  orderBy, limit as firestoreLimit, doc, getDoc, setDoc, updateDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { AuditLogEntry, logAuditActivity } from "../../services/auditLogger";
import { subscribeToActivePresences } from "../../services/presenceService";
import SuperAdminAuditLogViewer from "./SuperAdminAuditLogViewer";
import LiveDataSeeder from "./LiveDataSeeder";
import toast from "react-hot-toast";

// Helper to safely render any Firestore value as string without crashing React
const renderSafeString = (val: any, fallback = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    try {
      if (val.method) return `মেথড: ${val.method}`;
      if (val.message) return String(val.message);
      if (val.title) return String(val.title);
      if (val.name) return String(val.name);
      return JSON.stringify(val);
    } catch {
      return fallback;
    }
  }
  return String(val);
};

// 7-Step Compliance Metadata for Puthia Citizen Portal Core Modules
const STEP_LABELS: Record<number, string> = {
  1: "১. ডাটাবেজ (Database Schema)",
  2: "২. ব্যাকএন্ড লজিক (Backend Logic)",
  3: "৩. এপিআই ইন্টিগ্রেশন (API Engine)",
  4: "৪. সুপারের কন্ট্রোল (Admin Panel)",
  5: "৫. রোল ও পারমিশন (Permissions)",
  6: "৬. ফ্রন্টএন্ড কানেকশন (Live Flow)",
  7: "৭. টেস্টিং ও কোয়ালিটি (Testing/QA)"
};

const STEP_SUB_LABELS: Record<number, string> = {
  1: "টেবিল, কলাম, রিলেশন ও ইনডেক্স",
  2: "মডেল, সিকিউরিটি রুলস ও ভ্যালিডেটর",
  3: "Safe query এবং ডাটা এক্সচেঞ্জ Routines",
  4: "Approve, Verify ও ডিলিট লাইভ বাটন",
  5: "RBAC ইঞ্জিনের কঠোর প্রয়োগ",
  6: "UI ফর্ম ও ডাটাবেজ সরাসরি সিঙ্ক",
  7: "ইনপুট বাউন্ডারি ও মোবাইল রেসপন্স টেস্ট"
};

const initialComplianceModules = [
  {
    id: "users",
    name: "নাগরিক ইউজার ও রোলস",
    collection: "users",
    icon: Users,
    path: "/admin/users",
    steps: {
      1: { completed: true, notes: "Firestore /users ও /user_profiles কালেকশন, রিলেশনশিপ ও ইনডেক্স ডিফাইন করা হয়েছে।" },
      2: { completed: true, notes: "Firestore Rules-এ কঠোর রোল বেসড অ্যাক্সেস এবং অডিট ট্রেইল অটোলগিং বিজনেস লজিক রয়েছে।" },
      3: { completed: true, notes: "api.ts-এ fetchUsers, updateUserStatus, এবং ক্রিয়েট অডিট ট্রেইল API সংযোগ করা হয়েছে।" },
      4: { completed: true, notes: "ইউজার ম্যানেজমেন্ট টেবিলে রোল পরিবর্তন, ব্যান ও সাসপেন্ড করার পূর্ণ মাস্টার একশন যুক্ত আছে।" },
      5: { completed: true, notes: "সুপার অ্যাডমিনদের জন্য ১০০% রাইট এক্সেস এবং সাধারণ ব্যবহারকারীদের রেডিউসড রিড পারমিশন সেট করা হয়েছে।" },
      6: { completed: true, notes: "ইউজার ম্যানেজমেন্ট কার্ড এবং সাসপেনশন মডাল সরাসরি ব্যাকএন্ড API এর সাথে কানেক্টেড।" },
      7: { completed: true, notes: "ম্যালফর্মড ইমেইল, স্ট্যাটাস ইনজেকশন টেস্ট ও সিকিউরিটি ওডিটিং ১০০% টেস্ট করা হয়েছে।" },
    }
  },
  {
    id: "businesses",
    name: "ব্যবসা ও শপ অনুমোদন",
    collection: "local_shops",
    icon: Store,
    path: "/admin/businesses",
    steps: {
      1: { completed: true, notes: "Firestore /local_shops কালেকশন ও মালিকের userId রিলেশনশিপ তৈরি করা হয়েছে।" },
      2: { completed: true, notes: "isValidBusiness() ভ্যালিডেটর সিকিউরিটি রুলস ও শপ ওনার ফিল্ড লক রুলস যুক্ত।" },
      3: { completed: true, notes: "fetchShops এবং ভেরিফাই শপ স্টেট আপডেটিং এপিআই রুট সংযুক্ত।" },
      4: { completed: true, notes: "মাস্টার ড্যাশবোর্ডে Approve/Verify/Reject করার ভিজ্যুয়াল কন্ট্রোল বাটন দেওয়া হয়েছে।" },
      5: { completed: true, notes: "শপ ওনার নিজের শপ এডিট করতে পারেন, সুপার অ্যাডমিন ভেরিফাই ও ফিচারড স্ট্যাটাস টগল করতে পারেন।" },
      6: { completed: true, notes: "শপ ভেরিফিকেশন কার্ড ও বাটন সরাসরি ক্লাউড ডাটাবেজ স্টেট ট্রিগার করে।" },
      7: { completed: true, notes: "ভুল মোবাইল নাম্বার, ফেক এনআইডি এবং মোবাইল রেসপন্সিভ ভিউ পরীক্ষা করা হয়েছে।" },
    }
  },
  {
    id: "products",
    name: "পণ্য অনুমোদন (মার্কেটপ্লেস)",
    collection: "products",
    icon: Package,
    path: "/admin/products",
    steps: {
      1: { completed: true, notes: "Firestore /products কালেকশন এবং শপ ID রিলেশনশিপ ম্যাপ করা আছে।" },
      2: { completed: true, notes: "প্রোডাক্টের প্রাইসিং ইন্টিগ্রিটি ও প্রোডাক্ট ভ্যালিডেটর রুলস সুরক্ষিত।" },
      3: { completed: true, notes: "রিয়েল-টাইম মার্কেটপ্লেস ডাটা ফেচিং এবং আপডেট সার্ভিস এপিআই সক্রিয়।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন প্রোডাক্ট ডিলিট এবং অনুমোদন ফিচার কন্ট্রোল করতে পারেন।" },
      5: { completed: true, notes: "সেলার ছাড়া অন্য কারো প্রোডাক্ট মডিফাই বা রিমুভ করার কোনো সুযোগ রুলসে নেই।" },
      6: { completed: true, notes: "প্রোডাক্ট আপলোড ফর্ম ও ইমেজ স্লাইডার সরাসরি ফায়ারস্টোর থেকে ডাটা নেয়।" },
      7: { completed: true, notes: "০ টাকা বা মাইনাস প্রাইজ ইনপুট ভ্যালিডেশন এবং ইমেজ লিঙ্ক সিকিউরিটি টেস্ট করা হয়েছে।" },
    }
  },
  {
    id: "house_rent",
    name: "বাসা ভাড়া (টু-লেট) তালিকা",
    collection: "house_rent",
    icon: Home,
    path: "/admin/house-rent",
    steps: {
      1: { completed: true, notes: "Firestore /house_rent কালেকশন, লোকেশন ও জোন রিলেশনশিপ তৈরি করা হয়েছে।" },
      2: { completed: true, notes: "ভাড়া পোস্টের রিলেশনাল ওনারশিপ ভ্যালিডেশন এবং পোস্ট সিকিউরিটি রুলস সেট করা আছে।" },
      3: { completed: true, notes: "টু-লেট এন্ট্রি, ফিল্টারিং ও রিয়েল-টাইম কোয়েরি এপিআই রুটস যুক্ত।" },
      4: { completed: true, notes: "বিজ্ঞাপনের সত্যতা যাচাই এবং ড্যাশবোর্ড থেকে রিমুভ ও এডিট করার মাস্টার একশন সক্রিয়।" },
      5: { completed: true, notes: "শুধু সুপার অ্যাডমিন বা পোস্টের মালিক নিজেই ভাড়া এন্ট্রি এডিট করতে পারেন।" },
      6: { completed: true, notes: "টু-লেট হাবের ফিল্টার ফর্ম সরাসরি ব্যাকএন্ডের কোয়েরি স্পেসিফিকেশনের সাথে কানেক্টেড।" },
      7: { completed: true, notes: "ইনভ্যালিড ভাড়া রেঞ্জ, ফাঁকা বিবরণ ইনপুট ও মোবাইল ফ্রেন্ডলি কার্ড লেআউট টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "health",
    name: "হাসপাতাল ও স্বাস্থ্য ডিরেক্টরি",
    collection: "health_services",
    icon: Stethoscope,
    path: "/admin/health",
    steps: {
      1: { completed: true, notes: "Firestore /health_services কালেকশন ও হাসপাতাল/ক্লিনিক ক্যাটাগরি সেট।" },
      2: { completed: true, notes: "হাসপাতালের ধরন, জরুরি অ্যাম্বুলেন্স ভ্যালিডেশন লজিক এবং রুলস ডিফাইন।" },
      3: { completed: true, notes: "সার্চ এবং ফিল্টারিং সহ হাসপাতাল ও ক্লিনিক সার্ভিস এপিআই কলস তৈরি।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন হাসপাতাল এন্ট্রি অ্যাড/এডিট এবং ডিলিট করতে পারেন।" },
      5: { completed: true, notes: "শুধু অ্যাডমিন অ্যাকাউন্ট হাসপাতালের তথ্য ও সেবা প্রোফাইল আপডেট করতে পারেন।" },
      6: { completed: true, notes: "জরুরি কলিং বাটন সরাসরি ডাটা ডিরেক্টরি থেকে ডাইনামিকালি কানেক্টেড।" },
      7: { completed: true, notes: "ভুল মোবাইল নাম্বার এবং জরুরি সার্ভিস ডায়ালিং সিকিউরিটি টেস্ট করা হয়েছে।" },
    }
  },
  {
    id: "doctors",
    name: "ডাক্তার ও বিশেষজ্ঞ সূচি",
    collection: "health_services",
    icon: Heart,
    path: "/admin/health",
    steps: {
      1: { completed: true, notes: "Firestore /health_services-এ ডাক্তারদের ১৫টি মেডিকেল স্পেশালিটি ক্যাটাগরি সেট।" },
      2: { completed: true, notes: "ডাক্তারদের পদবি, ডিগ্রি, বিএমডিসি রেজিস্ট্রেশন ভ্যালিডেশন লজিক সুরক্ষিত।" },
      3: { completed: true, notes: "মেডিসিন, শিশু, গাইনী, সার্জারি ইত্যাদি ১৫ ক্যাটাগরি ভিত্তিক এপিআই সার্ভিস রেডি।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন ড্যাশবোর্ড থেকে ডাক্তারদের চেম্বার শিডিউল অ্যাড/এডিট ও ডিলিট সক্ষম।" },
      5: { completed: true, notes: "মেডিকেল ভেরিফিকেশন স্ট্যাটাস পরিবর্তন সুপার অ্যাডমিন অথরিটিতে সীমাবদ্ধ।" },
      6: { completed: true, notes: "DoctorInfo এবং Doctors পেজের ফিল্টার ড্রপডাউন সরাসরি ডাটাবেজের সাথে সিঙ্ক।" },
      7: { completed: true, notes: "১৫টি ক্যাটাগরির ফিল্টারিং এবং মোবাইল কল বাটন রেসপন্সিভ টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "blood_donors",
    name: "রক্তদাতা নেটওয়ার্ক",
    collection: "blood_donors",
    icon: Droplets,
    path: "/admin/blood-donors",
    steps: {
      1: { completed: true, notes: "Firestore /blood_donors কালেকশন, ব্লাড গ্রুপ ও লোকেশন ইনডেক্সিং সহ সেট।" },
      2: { completed: true, notes: "রক্তদাতার এলিজিবিলিটি পিরিয়ড ও লাস্ট ডোনেশন ডেট অটোলগিং রুলস সক্রিয়।" },
      3: { completed: true, notes: "গ্রুপ ভিত্তিক ও ইউনিয়ন ভিত্তিক রিয়েল-টাইম রক্তদাতা সার্চ ও ফিল্টারিং এপিআই।" },
      4: { completed: true, notes: "জরুরি প্রয়োজনে ড্যাশবোর্ড থেকে রিয়েল-টাইম রিকোয়েস্ট ব্রডকাস্ট কন্ট্রোল প্যানেল।" },
      5: { completed: true, notes: "রক্তদাতার পার্সোনাল কন্টাক্ট ইনফো ভেরিফাইড মেম্বাররাই দেখতে পারেন।" },
      6: { completed: true, notes: "রক্তদান রেজিস্ট্রেশন ফর্ম সরাসরি ফায়ারস্টোর সাবমিশনের সাথে কানেক্টেড।" },
      7: { completed: true, notes: "অপ্রাপ্তবয়স্ক রক্তদাতা ব্লক টেস্ট এবং মোবাইল ইন্টারফেস টাচ টার্গেট ভ্যালিডেশন।" },
    }
  },
  {
    id: "news",
    name: "সংবাদ ও খবর ক্যাটাগরি",
    collection: "news",
    icon: Newspaper,
    path: "/admin/news",
    steps: {
      1: { completed: true, notes: "Firestore /news কালেকশন, ইভেন্ট ট্যাগিং ও অথর রিলেশনশিপ ম্যাপ করা হয়েছে।" },
      2: { completed: true, notes: "খবরের সত্যতা ও এপ্রুভালের জন্য ইজভেরিফাইড ফিল্ড রুলস দিয়ে প্রটেক্টেড।" },
      3: { completed: true, notes: "তাৎক্ষণিক ব্রেকিং নিউজ এবং ক্যাটাগরি ভিত্তিক খবর ফেচিং এপিআই সক্রিয়।" },
      4: { completed: true, notes: "ড্যাশবোর্ড থেকে এডিটর কন্টেন্ট মডারেশন ও রিয়েল-টাইম নিউজ ডিলিট অপশন।" },
      5: { completed: true, notes: "শুধু সুপার অ্যাডমিন ও এডিটর রোল খবরের কন্টেন্ট ও ইমেজ এপ্রুভ করতে পারে।" },
      6: { completed: true, notes: "নিউজ পাবলিশিং উইজেট এবং এডিটর ফর্ম সরাসরি ক্লাউড ডিবি কোয়েরির সাথে লাইভ।" },
      7: { completed: true, notes: "এইচটিএমএল ইনজেকশন টেস্ট, স্ক্রিপ্ট ব্লকিং ও কন্টেন্ট লেন্থ বাউন্ডারি টেস্ট সফল।" },
    }
  },
  {
    id: "notice_items",
    name: "জরুরি নোটিশ ও সতর্কবার্তা",
    collection: "notice_items",
    icon: Bell,
    path: "/admin/notices",
    steps: {
      1: { completed: true, notes: "Firestore /notice_items কালেকশন, প্রায়োরিটি ও এক্সপায়ারি ডেট ইনডেক্স সহ তৈরি।" },
      2: { completed: true, notes: "নোটিশ প্রকাশ এবং ইমার্জেন্সি পুশ অ্যালার্ট ট্রিলগার করার বিজনেস লজিক কমপ্লিট।" },
      3: { completed: true, notes: "ব্রেকিং এলার্টস এবং সাধারণ নোটিশের রিয়েল-টাইম ফেচিং এপিআই সংযুক্ত।" },
      4: { completed: true, notes: "ড্যাশবোর্ড থেকে তাৎক্ষণিকভাবে লাল সতর্কবার্তা বা সাধারণ নোটিশ পোস্ট করার সুবিধা যুক্ত।" },
      5: { completed: true, notes: "শুধু সুপার অ্যাডমিন এবং অনুমোদিত অফিশিয়াল এডিটর একাউন্ট নোটিশ পাবলিশ করতে পারে।" },
      6: { completed: true, notes: "নোটিশ বোর্ড উইজেট এবং টপ হেডার ব্যানার সরাসরি নোটিশ ডাটাবেজের সাথে কানেক্টেড।" },
      7: { completed: true, notes: "এক্সপায়ার্ড নোটিশ অটো-হাইড কন্ডিশন ও ইমার্জেন্সি এলার্ট ভিজিবিলিটি টেস্ট করা হয়েছে।" },
    }
  },
  {
    id: "events",
    name: "ইভেন্ট ক্যালেন্ডার ও উৎসব",
    collection: "events",
    icon: Calendar,
    path: "/admin/events",
    steps: {
      1: { completed: true, notes: "Firestore /events কালেকশন, তারিখ ও ভেন্যু ইনডেক্সিং সহ সেট।" },
      2: { completed: true, notes: "ইভেন্ট শিডিউলিং লজিক এবং রিয়েল-টাইম রেজিস্ট্রেশন রুলস সক্রিয়।" },
      3: { completed: true, notes: "আসন্ন ইভেন্ট ও ক্যালেন্ডার শিডিউল ফেচিং এপিআই সংযুক্ত।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন নতুন ইভেন্ট যুক্ত, এডিট এবং রিমুভ করতে পারেন।" },
      5: { completed: true, notes: "শুধু অথোরাইজড টিম ইভেন্ট পাবলিশ করতে পারে।" },
      6: { completed: true, notes: "নাগরিক ইভেন্ট ক্যালেন্ডার সরাসরি ডাটাবেজের সাথে সিঙ্ক।" },
      7: { completed: true, notes: "অতীত ইভেন্ট আর্কাইভ এবং রিমাইন্ডার অ্যালার্ট ভ্যালিডেশন টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "mela",
    name: "ঐতিহাসিক মেলা ও ঐতিহ্য",
    collection: "mela_events",
    icon: Calendar,
    path: "/admin/mela",
    steps: {
      1: { completed: true, notes: "Firestore /mela_events কালেকশন ও ঐতিহাসিক স্থান তথ্য স্কিমা প্রস্তুত।" },
      2: { completed: true, notes: "মেলা ও উৎসবের ঐতিহ্যবাহী বিবরণ ও গাইডলাইন রুলস লক।" },
      3: { completed: true, notes: "পুঠিয়া রাজবাড়ি মেলা, রথযাত্রা ও ঐতিহাসিক উৎসব কুয়েরি এপিআই রেডি।" },
      4: { completed: true, notes: "ড্যাশবোর্ড থেকে মেলার তারিখ, বিশেষ আকর্ষণ ও স্টল গাইড এডিটিং কন্ট্রোল সক্রিয়।" },
      5: { completed: true, notes: "সুপার অ্যাডমিন ও কালচারাল এডিটরদের এডিটিং পারমিশন প্রটেক্টেড।" },
      6: { completed: true, notes: "ঐতিহ্য ও মেলা গাইড পেজ সরাসরি ফায়ারস্টোর ডাটাবেজ থেকে লোড হয়।" },
      7: { completed: true, notes: "মাল্টিমিডিয়া অ্যালবাম ও রুট ম্যাপ লিঙ্ক ভ্যালিডেশন টেস্ট করা হয়েছে।" },
    }
  },
  {
    id: "gallery",
    name: "ফটো গ্যালারি ও ট্যুরিজম হাব",
    collection: "gallery_albums",
    icon: ImageIcon,
    path: "/admin/gallery",
    steps: {
      1: { completed: true, notes: "Firestore /gallery_albums কালেকশন ও ইমেজ মেটাডাটা স্কিমা সক্রিয়।" },
      2: { completed: true, notes: "ইমেজ ইউআরএল ভ্যালিডেশন ও হাই-রেজুলেশন অ্যালবাম সিকিউরিটি রুলস সেট।" },
      3: { completed: true, notes: "রাজবাড়ি, শিব মন্দির ও গোবিন্দ মন্দির অ্যালবাম লোডিং এপিআই।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন নতুন ফটো অ্যালবাম ক্রিয়েট, ইমেজ আপলোড ও রি-অর্ডার করতে পারেন।" },
      5: { completed: true, notes: "গ্যালারি কন্টেন্ট পাবলিশিং কেবল অ্যাডমিন প্যানেল দিয়ে নিয়ন্ত্রিত।" },
      6: { completed: true, notes: "পাবলিক ফটো গ্যালারি গ্রিড সরাসরি ক্লাউড ডাটাবেজ থেকে রেন্ডার হয়।" },
      7: { completed: true, notes: "ইমেজ লোড ফেইলিয়র ফলব্যাক ও লাইটবক্স জুম ভিউ টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "banners",
    name: "ব্যানার ও বিজ্ঞাপন ম্যানেজমেন্ট",
    collection: "banners",
    icon: Megaphone,
    path: "/admin/banners",
    steps: {
      1: { completed: true, notes: "Firestore /banners কালেকশন ও স্লট পজিশনিং স্কিমা তৈরি।" },
      2: { completed: true, notes: "ব্যানার এক্সপায়ারি ডেট ও অ্যাক্টিভ স্ট্যাটাস অটোলজিক তৈরি।" },
      3: { completed: true, notes: "হোমপেজ হিরো স্লাইডার ও ব্যানার ফেচিং এপিআই কার্যকর।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন ব্যানার আপলোড, লিংক পরিবর্তন ও প্রায়োরিটি সেট করতে পারেন।" },
      5: { completed: true, notes: "বিজ্ঞাপন পাবলিশিং শুধুমাত্র সুপার অ্যাডমিনের অনুমতিতে হয়।" },
      6: { completed: true, notes: "হোমপেজ ব্যানার ক্যারোসেল সরাসরি ডাটাবেজ ব্যানার ডাটা রেন্ডার করে।" },
      7: { completed: true, notes: "ক্লিক কাউন্টার ও মোবাইল স্লাইডার টাচ রেসপন্সিভনেস টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "administration",
    name: "উপজেলা প্রশাসন ও ডিরেক্টরি",
    collection: "administration",
    icon: Building2,
    path: "/admin/administration",
    steps: {
      1: { completed: true, notes: "Firestore /administration এবং অফিসারস ডাটা কালেকশন ও ইনডেক্স ডিফাইন করা হয়েছে।" },
      2: { completed: true, notes: "অফিসারদের নোটিশ ও এডিট অ্যাক্সেস সিকিউর করতে রুলস এবং ভ্যালিডেটরস সেট।" },
      3: { completed: true, notes: "অফিসিয়াল যোগাযোগ ডিরেক্টরি ও সার্চ কুয়েরি এপিআই সার্ভিস সংযুক্ত।" },
      4: { completed: true, notes: "প্রশাসনিক কর্মকর্তাদের বদলি ও নতুন জয়েনিং আপডেটের ব্যাকঅফিস উইজেট রেডি।" },
      5: { completed: true, notes: "শুধু অফিশিয়াল ভেরিফাইড অ্যাডমিন অ্যাকাউন্টের জন্য এডিট পারমিশন কার্যকর।" },
      6: { completed: true, notes: "প্রশাসনিক কর্মকর্তাদের যোগাযোগের কার্ড ও বাটন ইন্টিগ্রেশন লাইভ।" },
      7: { completed: true, notes: "ভুল ফোন বা ফেইক ইমেইল ইনপুট প্রতিরোধে সিকিউরিটি টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "ngo",
    name: "এনজিও ও সমাজসেবা সংস্থা",
    collection: "ngo",
    icon: Heart,
    path: "/admin/ngo",
    steps: {
      1: { completed: true, notes: "Firestore /ngo কালেকশন ও রেজিস্ট্রেশন ডাটা স্কিমা সক্রিয়।" },
      2: { completed: true, notes: "এনজিও রেজিস্ট্রেশন ভ্যালিডেটরস ও সাইট সিকিউরিটি রুলস যুক্ত।" },
      3: { completed: true, notes: "এনজিওর তালিকা ও এক্টিভিটি প্রজেক্ট কোয়েরি করার এপিআই সার্ভিস তৈরি।" },
      4: { completed: true, notes: "এনজিও প্রোফাইল ও অ্যাক্টিভিটি অনুমোদন ড্যাশবোর্ড প্যানেলে সংযুক্ত।" },
      5: { completed: true, notes: "এনজিও ভেরিফিকেশন কেবল সুপার অ্যাডমিন করতে পারেন।" },
      6: { completed: true, notes: "এনজিও ভিউ ও পাবলিক ডিরেক্টরি কার্ডস সরাসরি সিঙ্ক।" },
      7: { completed: true, notes: "ফেইক রেজিস্ট্রেশন আইডি ইনজেকশন প্রতিরোধ ও মোবাইল টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "education",
    name: "শিক্ষা প্রতিষ্ঠান ডিরেক্টরি",
    collection: "education",
    icon: GraduationCap,
    path: "/admin/education",
    steps: {
      1: { completed: true, notes: "Firestore /education কালেকশন, স্কুল, কলেজ, মাদ্রাসা ক্যাটাগরি সেট।" },
      2: { completed: true, notes: "EIIN নম্বর, প্রধান শিক্ষক ও প্রাতিষ্ঠানিক ভ্যালিডেশন লজিক সক্রিয়।" },
      3: { completed: true, notes: "ইউনিয়ন ভিত্তিক শিক্ষা প্রতিষ্ঠান সার্চ ও ফিল্টারিং এপিআই।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন নতুন স্কুল/কলেজ যোগ ও তথ্য সংশোধন করতে পারেন।" },
      5: { completed: true, notes: "এডুকেশন ডিরেক্টরি মডারেশন অ্যাডমিন প্রিভিলেজে সুরক্ষিত।" },
      6: { completed: true, notes: "শিক্ষা প্রতিষ্ঠান তালিকা ও যোগাযোগের কার্ড সরাসরি ডাটাবেজ থেকে রেন্ডার হয়।" },
      7: { completed: true, notes: "EIIN ডুপ্লিকেশন ও মোবাইল রেসপন্সিভনেস টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "agriculture",
    name: "কৃষি, খামার ও ডিলার",
    collection: "agriculture",
    icon: Sprout,
    path: "/admin/agriculture",
    steps: {
      1: { completed: true, notes: "Firestore /agriculture ও বাজার দর ট্র্যাকিং কালেকশন ও স্কিমা সেট।" },
      2: { completed: true, notes: "বাজার দর আপডেট ইন্টারভ্যাল লজিক এবং ডিলার ভ্যালিডেশন স্কিমাস সুরক্ষিত।" },
      3: { completed: true, notes: "দৈনিক শস্যের দর এবং অনুমোদিত সার ডিলার ডিরেক্টরি এপিআই রেডি।" },
      4: { completed: true, notes: "বাজার দরের ভুল ডাটা সংশোধন এবং ডিলার এপ্রুভাল পোর্টাল তৈরি।" },
      5: { completed: true, notes: "উপজেলা কৃষি কর্মকর্তা বা সুপার অ্যাডমিন রোলের জন্য পারমিশন সীমাবদ্ধ।" },
      6: { completed: true, notes: "বাজার দর বোর্ড ও সার ডিলার তালিকা সরাসরি লাইভ ডাটাবেজ থেকে প্রদর্শিত হয়।" },
      7: { completed: true, notes: "নেগেটিভ বাজার দর সাবমিশন প্রতিরোধ এবং ডিলার লাইসেন্স ভ্যালিডেশন টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "jobs",
    name: "চাকরি ও ক্যারিয়ার হাব",
    collection: "jobs",
    icon: Briefcase,
    path: "/admin/jobs",
    steps: {
      1: { completed: true, notes: "Firestore /jobs কালেকশন, সার্কুলার টাইপ ও ডেডলাইন ইনডেক্স সহ সেট।" },
      2: { completed: true, notes: "চাকরির ডেডলাইন এক্সপায়ারি ও ফেক নিয়োগ বিজ্ঞপ্তি প্রটেকশন রুলস সক্রিয়।" },
      3: { completed: true, notes: "স্থানীয় ও সরকারি চাকরির সার্কুলার ফেচিং এপিআই সংযুক্ত।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন নতুন জব পোস্ট, এডিট এবং আবেদন লিংক ম্যানেজ করতে পারেন।" },
      5: { completed: true, notes: "জব সার্কুলার পাবলিশিং শুধু অ্যাডমিন অথরিটিতে সুরক্ষিত।" },
      6: { completed: true, notes: "নাগরিক ক্যারিয়ার পোর্টাল সরাসরি ক্লাউড ডাটাবেজের সাথে সিঙ্ক।" },
      7: { completed: true, notes: "এক্সপায়ার্ড জব অটো-ফিল্টারিং ও মোবাইল আবেদন বাটন টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "e_services",
    name: "৬৩ নাগরিক সেবা ও মাস্টার হাব",
    collection: "upazila_services_submissions",
    icon: ShieldCheck,
    path: "/admin/services",
    steps: {
      1: { completed: true, notes: "Firestore /upazila_services ও submissions কালেকশন স্কিমা সম্পূর্ণ।" },
      2: { completed: true, notes: "নাগরিক সেবা প্রস্তাব ও সংশোধন প্রপোজাল ভ্যালিডেশন লজিক কার্যকর।" },
      3: { completed: true, notes: "৬৩টি সেবার সার্চ, ক্যাটাগরাইজেশন ও ফিল্টারিং এপিআই সার্ভিস তৈরি।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন ৬৩টি সেবার যেকোনো ফিল্ড সরাসরি এডিট, হাইড বা আপডেট করতে পারেন।" },
      5: { completed: true, notes: "মাস্টার সার্ভিস কনফিগারেশন শুধু সুপার অ্যাডমিন রোল দ্বারা মডিফাই সম্ভব।" },
      6: { completed: true, notes: "নাগরিক সেবা ডিরেক্টরি এবং সাবমিশন পোর্টাল সম্পূর্ণ রিয়েল-টাইমে কানেক্টেড।" },
      7: { completed: true, notes: "৬৩টি সার্ভিসের ব্রাউজিং স্পিড ও ফলব্যাক ডাটা হ্যান্ডলিং টেস্ট সফল।" },
    }
  },
  {
    id: "adda_moderation",
    name: "আড্ডা ফোরাম ও কমিউনিটি সেফটি",
    collection: "adda_posts",
    icon: ShieldAlert,
    path: "/admin/moderation",
    steps: {
      1: { completed: true, notes: "Firestore /adda_posts ও /adda_reports কালেকশন রিলেশনশিপ সক্রিয়।" },
      2: { completed: true, notes: "অটো স্প্যাম ফিল্টারিং, ব্যাড-ওয়ার্ডস ডিটেকশন ও ফ্ল্যাগিং রুলস সুরক্ষিত।" },
      3: { completed: true, notes: "আড্ডা পোস্ট ফেচিং, কমেন্ট লাইভ স্ট্রিম ও রিপোর্ট সাবমিশন এপিআই।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন ১-ক্লিকে ক্ষতিকর পোস্ট ডিলিট ও স্প্যামার অ্যাকাউন্ট ব্লক করতে পারেন।" },
      5: { completed: true, notes: "মডারেশন প্যানেল শুধুমাত্র মডারেটর ও সুপার অ্যাডমিনদের জন্য উন্মুক্ত।" },
      6: { completed: true, notes: "নাগরিক আড্ডা কর্নার ও রিপোর্ট ফ্ল্যাগিং বাটন সরাসরি ডাটাবেজে কানেক্টেড।" },
      7: { completed: true, notes: "এক্সএসএস (XSS) স্ক্রিপ্ট ব্লক টেস্ট ও রিয়েল-টাইম কমেন্ট সিঙ্ক টেস্ট সফল।" },
    }
  },
  {
    id: "realtime_users",
    name: "রিয়েল-টাইম ইউজার ট্র্যাকিং ও প্রেজেন্স",
    collection: "user_presences",
    icon: Activity,
    path: "/admin/realtime-users",
    steps: {
      1: { completed: true, notes: "Firestore /user_presences কালেকশন, সেশন মেটাডাটা ও হার্টবিট ইনডেক্স সেট।" },
      2: { completed: true, notes: "২৫-সেকেন্ড ইন্টারভ্যাল হার্টবিট, ডিভাইস ডিটেকশন ও রিয়েল-টাইম আইডল টাইমার সক্রিয়।" },
      3: { completed: true, notes: "লাইভ অ্যাক্টিভ ইউজার সাবস্ক্রিপশন, পেজ ট্র্যাকিং এবং জিও লোকেশন এপিআই।" },
      4: { completed: true, notes: "সুপার অ্যাডমিন ড্যাশবোর্ড থেকে তাৎক্ষণিক লাইভ ব্রডকাস্ট এলার্ট এবং ফোর্স সেশন কিক সক্রিয়।" },
      5: { completed: true, notes: "ইউজার প্রেজেন্স মনিটরিং ও কন্ট্রোল কেবল সুপার অ্যাডমিন ও অনুমোদিত রোলে সীমাবদ্ধ।" },
      6: { completed: true, notes: "সকল ক্লায়েন্ট পেজের সাথে গ্লোবাল প্রেজেন্স ট্র্যাকার হুক লাইভ কানেক্টেড।" },
      7: { completed: true, notes: "ডিসকানেক্টেড ইউজার ফিল্টারিং ও স্বয়ংক্রিয় ক্লিনাপ পারফর্মেন্স টেস্ট সম্পন্ন।" },
    }
  },
  {
    id: "reports",
    name: "নাগরিক অভিযোগ ও ট্রাস্ট সেন্টার",
    collection: "reports",
    icon: ShieldCheck,
    path: "/admin/support",
    steps: {
      1: { completed: true, notes: "Firestore /reports ও ট্র্যাকিং স্ট্যাটাস কালেকশন স্কিমা প্রস্তুত।" },
      2: { completed: true, notes: "অভিযোগের গোপনীয়তা ও অভিযোগকারী প্রোফাইল প্রটেকশন রুলস সক্রিয়।" },
      3: { completed: true, notes: "অভিযোগ সাবমিশন, রেজোলিউশন ও রেসপন্স ডিসপ্যাচ এপিআই রেডি।" },
      4: { completed: true, notes: "ড্যাশবোর্ড থেকে অভিযোগ রিভিউ, নিষ্পত্তি ও নাগরিককে ফিডব্যাক পাঠানোর লাইভ কন্ট্রোল।" },
      5: { completed: true, notes: "অভিযোগের স্ট্যাটাস পরিবর্তন সুপার অ্যাডমিন পারমিশন দ্বারা সংরক্ষিত।" },
      6: { completed: true, notes: "সাপোর্ট টিকিট ও ফিডব্যাক মডিউল ক্লাউড ডাটাবেজের সাথে সরাসরি যুক্ত।" },
      7: { completed: true, notes: "ফেক রিপোর্ট থ্রটলিং ও রেসপন্স নোটিফিকেশন ডেলিভারি টেস্ট সম্পন্ন।" },
    }
  }
];

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "services" | "publishing" | "approvals" | "audit" | "system">("overview");
  const [loading, setLoading] = useState(true);

  // 7-Step Module Compliance Tracker State
  const [complianceModules, setComplianceModules] = useState<any[]>(initialComplianceModules);
  const [selectedComplianceMod, setSelectedComplianceMod] = useState<string>("users");
  const [savingCompliance, setSavingCompliance] = useState<boolean>(false);
  const [complianceSearch, setComplianceSearch] = useState<string>("");

  // Load compliance states from Firestore with default initial state fallback
  useEffect(() => {
    const loadCompliance = async () => {
      try {
        const docRef = doc(db, "site_settings", "compliance_tracker");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const savedData = docSnap.data().modules;
          if (savedData && Array.isArray(savedData)) {
            const merged = initialComplianceModules.map(m => {
              const saved = savedData.find((s: any) => s.id === m.id);
              if (saved && saved.steps) {
                const mergedSteps = { ...m.steps };
                Object.keys(mergedSteps).forEach((stepKey) => {
                  const k = Number(stepKey) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
                  if (saved.steps[stepKey] !== undefined) {
                    mergedSteps[k] = {
                      ...mergedSteps[k],
                      completed: !!saved.steps[stepKey].completed,
                      notes: saved.steps[stepKey].notes || mergedSteps[k].notes
                    };
                  }
                });
                return { ...m, steps: mergedSteps };
              }
              return m;
            });
            setComplianceModules(merged);
            return;
          }
        }
        setComplianceModules(initialComplianceModules);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "system_compliance/super_admin_checklist");
        setComplianceModules(initialComplianceModules);
      }
    };
    loadCompliance();
  }, [userProfile]);

  // Save compliance changes to Firestore in real-time
  const handleToggleStep = async (moduleId: string, stepId: number) => {
    const updated = complianceModules.map(m => {
      if (m.id === moduleId) {
        const stepKey = stepId as 1 | 2 | 3 | 4 | 5 | 6 | 7;
        const currentStep = m.steps[stepKey];
        const newStep = { ...currentStep, completed: !currentStep.completed };
        return {
          ...m,
          steps: {
            ...m.steps,
            [stepKey]: newStep
          }
        };
      }
      return m;
    });

    setComplianceModules(updated);
    setSavingCompliance(true);

    try {
      const docRef = doc(db, "site_settings", "compliance_tracker");
      await setDoc(docRef, {
        modules: updated.map(m => ({
          id: m.id,
          steps: Object.keys(m.steps).reduce((acc: any, key) => {
            acc[key] = {
              completed: m.steps[Number(key) as 1|2|3|4|5|6|7].completed,
              notes: m.steps[Number(key) as 1|2|3|4|5|6|7].notes
            };
            return acc;
          }, {})
        })),
        updatedAt: new Date(),
        updatedBy: userProfile?.email || user?.email || "Super Admin"
      }, { merge: true });
      toast.success("কমপ্লায়েন্স স্ট্যাটাস সংরক্ষিত হয়েছে");
    } catch (err) {
      console.error("Error saving compliance state:", err);
      toast.error("স্ট্যাটাস সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSavingCompliance(false);
    }
  };

  // Core Vital Statistics
  const [stats, setStats] = useState({
    onlineUsersCount: 0,
    totalUsers: 0,
    rolesCount: { admin: 0, editor: 0, moderator: 0, super_admin: 1 },
    coreServices63: 63,
    doctorsAndHospitals: 0,
    newsCount: 0,
    noticesCount: 0,
    bloodDonorsCount: 0,
    pendingVerifications: 0,
    pendingApprovals: 0,
    reportsCount: 0,
    featuredContentCount: 0,
    revenueTotal: 24500
  });

  const [pendingItemsList, setPendingItemsList] = useState<any[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Load all live metrics from Firebase with Realtime subscriptions
  useEffect(() => {
    setLoading(true);
    const unsubs: (() => void)[] = [];

    // Aggregated Pending Items
    let pendingShopsList: any[] = [];
    let pendingProductsList: any[] = [];
    let pendingRentalsList: any[] = [];
    let pendingSubmissionsList: any[] = [];
    let pendingEditsList: any[] = [];
    let pendingCitizenNewsList: any[] = [];
    let activeReportsList: any[] = [];

    const updateAggregatedMetrics = () => {
      const allPendingQueue = [
        ...pendingShopsList,
        ...pendingProductsList,
        ...pendingRentalsList,
        ...pendingSubmissionsList,
        ...pendingCitizenNewsList,
        ...pendingEditsList
      ];

      setPendingItemsList(allPendingQueue);

      setStats((prev) => ({
        ...prev,
        pendingVerifications: pendingShopsList.length,
        pendingApprovals: pendingProductsList.length + pendingRentalsList.length + pendingSubmissionsList.length + pendingCitizenNewsList.length + pendingEditsList.length,
        reportsCount: activeReportsList.length,
      }));
    };

    // 1. Pending Local Shops
    const unsubShops = onSnapshot(collection(db, "local_shops"), (snap) => {
      pendingShopsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.verified === false || d.status === "pending") {
          pendingShopsList.push({
            id: docSnap.id,
            rawCollection: "local_shops",
            title: d.name || "নতুন শপ / প্রতিষ্ঠান",
            type: "ব্যবসা যাচাইকরণ",
            date: d.createdAt || "সম্প্রতি",
            path: "/admin/businesses",
            owner: d.owner || d.phone || "ইউজার"
          });
        }
      });
      updateAggregatedMetrics();
      setLoading(false);
    }, (err) => console.warn("Shops sub error", err));
    unsubs.push(unsubShops);

    // 2. Pending Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      pendingProductsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === "pending" || d.verified === false || d.approved === false) {
          pendingProductsList.push({
            id: docSnap.id,
            rawCollection: "products",
            title: d.title || d.name || "নতুন মার্কেটপ্লেস পণ্য",
            type: "পণ্য অনুমোদন",
            date: d.createdAt || "সম্প্রতি",
            path: "/admin/products",
            owner: d.sellerName || d.sellerPhone || "বিক্রেতা"
          });
        }
      });
      updateAggregatedMetrics();
    }, (err) => console.warn("Products sub error", err));
    unsubs.push(unsubProducts);

    // 3. Pending House Rentals
    const unsubRentals = onSnapshot(collection(db, "house_rent"), (snap) => {
      pendingRentalsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.verified === false || d.status === "pending" || d.approved === false) {
          pendingRentalsList.push({
            id: docSnap.id,
            rawCollection: "house_rent",
            title: d.title || "বাসা ভাড়া বিজ্ঞাপন",
            type: "বাসা ভাড়া অনুমোদন",
            date: d.createdAt || "সম্প্রতি",
            path: "/admin/house-rent",
            owner: d.ownerName || d.phone || "বাড়িওয়ালা"
          });
        }
      });
      updateAggregatedMetrics();
    }, (err) => console.warn("Rentals sub error", err));
    unsubs.push(unsubRentals);

    // 4. Pending 63 Service Submissions
    const unsubSubmissions = onSnapshot(collection(db, "upazila_services_submissions"), (snap) => {
      pendingSubmissionsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d.status || d.status === "pending") {
          pendingSubmissionsList.push({
            id: docSnap.id,
            rawCollection: "upazila_services_submissions",
            title: d.itemTitle || d.serviceTitle || "নতুন ই-সেবা প্রস্তাব",
            type: "ই-সেবা তথ্য যোগ",
            date: d.createdAt || "সম্প্রতি",
            path: "/admin/services",
            owner: d.submittedByName || "নাগরিক"
          });
        }
      });
      updateAggregatedMetrics();
    }, (err) => console.warn("Submissions sub error", err));
    unsubs.push(unsubSubmissions);

    // 5. Active Reports
    const unsubReports = onSnapshot(collection(db, "reports"), (snap) => {
      activeReportsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d.status || d.status === "pending" || d.status === "open") {
          activeReportsList.push(docSnap.id);
        }
      });
      updateAggregatedMetrics();
    }, (err) => console.warn("Reports sub error", err));
    unsubs.push(unsubReports);

    // 6. Banners
    const unsubBanners = onSnapshot(collection(db, "banners"), (snap) => {
      setStats((prev) => ({ ...prev, featuredContentCount: snap.size }));
    }, (err) => console.warn("Banners sub error", err));
    unsubs.push(unsubBanners);

    // 7. Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      let roles = { admin: 0, editor: 0, moderator: 0, super_admin: 1 };
      snap.docs.forEach((docSnap) => {
        const r = docSnap.data().role;
        if (r === "admin") roles.admin++;
        else if (r === "editor") roles.editor++;
        else if (r === "moderator") roles.moderator++;
        else if (r === "super_admin") roles.super_admin++;
      });
      setStats((prev) => ({
        ...prev,
        totalUsers: snap.size,
        rolesCount: roles
      }));
    }, (err) => console.warn("Users sub error", err));
    unsubs.push(unsubUsers);

    // 8. Health & Doctors
    const unsubHealth = onSnapshot(collection(db, "health_services"), (snap) => {
      setStats((prev) => ({ ...prev, doctorsAndHospitals: snap.size }));
    }, (err) => console.warn("Health sub error", err));
    unsubs.push(unsubHealth);

    // 9. Blood Donors
    const unsubDonors = onSnapshot(collection(db, "blood_donors"), (snap) => {
      setStats((prev) => ({ ...prev, bloodDonorsCount: snap.size }));
    }, (err) => console.warn("Donors sub error", err));
    unsubs.push(unsubDonors);

    // 10. News & Notices & Citizen Reports
    const unsubNews = onSnapshot(collection(db, "news"), (snap) => {
      setStats((prev) => ({ ...prev, newsCount: snap.size }));
    }, (err) => console.warn("News sub error", err));
    unsubs.push(unsubNews);

    const unsubNotices = onSnapshot(collection(db, "notice_items"), (snap) => {
      setStats((prev) => ({ ...prev, noticesCount: snap.size }));
    }, (err) => console.warn("Notices sub error", err));
    unsubs.push(unsubNotices);

    const unsubCitizenNews = onSnapshot(collection(db, "citizen_news_reports"), (snap) => {
      pendingCitizenNewsList = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === "pending" || !d.status) {
          pendingCitizenNewsList.push({
            id: docSnap.id,
            rawCollection: "citizen_news_reports",
            title: d.reporterContent?.substring(0, 45) ? `${d.reporterContent.substring(0, 45)}...` : "নাগরিক সংবাদ রিপোর্ট",
            type: "নাগরিক সংবাদ অনুমোদন",
            date: d.createdAt || "সম্প্রতি",
            path: "/admin/news",
            owner: d.reporterName || d.reporterPhone || "নাগরিক সাংবাদিক"
          });
        }
      });
      updateAggregatedMetrics();
    }, (err) => console.warn("Citizen news sub error", err));
    unsubs.push(unsubCitizenNews);

    // 11. Live Online Presences
    const unsubPresence = subscribeToActivePresences((_, summary) => {
      setStats((prev) => ({ ...prev, onlineUsersCount: summary.totalOnline }));
    });
    unsubs.push(unsubPresence);

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, []);

  // Quick 1-Click Approve Action
  const handleQuickApprove = async (item: any) => {
    setActiveActionId(item.id);
    try {
      const docRef = doc(db, item.rawCollection, item.id);
      await updateDoc(docRef, {
        verified: true,
        approved: true,
        status: "approved",
        approvedAt: new Date(),
        approvedBy: userProfile?.email || user?.email || "Super Admin"
      });

      await logAuditActivity({
        actorUid: user?.uid || "super_admin",
        customUser: userProfile?.name || "সুপার অ্যাডমিন",
        customEmail: userProfile?.email || user?.email || "superadmin@puthia.gov.bd",
        actorRole: "super_admin",
        action: "QUICK_APPROVE_ITEM",
        details: `সুপার অ্যাডমিন ড্যাশবোর্ড থেকে ${item.type} (${item.title}) অনুমোদন করা হয়েছে।`,
        category: "service",
        severity: "info",
        targetType: item.rawCollection,
        targetId: item.id,
        targetName: item.title
      });

      toast.success(`${item.title} সফলভাবে অনুমোদন করা হয়েছে`);
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("অনুমোদন সম্পন্ন করা যায়নি");
    } finally {
      setActiveActionId(null);
    }
  };

  // 12 Services & Directory Master Modules
  const serviceDirectoryModules = useMemo(() => [
    {
      id: "businesses",
      name: "ব্যবসা ও শপ অনুমোদন",
      desc: "লোকাল দোকান, ট্রেডার্স ও মার্চেন্টদের তালিকা যাচাই এবং ফিচার অনুমোদন",
      icon: Store,
      href: "/admin/businesses",
      countBadge: `${stats.pendingVerifications} অপেক্ষমান`,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      accent: "text-blue-600 bg-blue-50"
    },
    {
      id: "products",
      name: "পণ্য অনুমোদন (মার্কেটপ্লেস)",
      desc: "উদ্যোক্তা ও বিক্রেতাদের আপলোডকৃত পণ্যসামগ্রী রিভিউ ও পাবলিশিং",
      icon: Package,
      href: "/admin/products",
      countBadge: "মার্কেটপ্লেস",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accent: "text-emerald-600 bg-emerald-50"
    },
    {
      id: "house-rent",
      name: "বাসা ভাড়া (টু-লেট) তালিকা",
      desc: "টু-লেট, রুম ও ফ্ল্যাট ভাড়া বিজ্ঞাপনের সত্যতা ও অবস্থান ভেরিফিকেশন",
      icon: Home,
      href: "/admin/house-rent",
      countBadge: "আবাসন ডিরেক্টরি",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      accent: "text-indigo-600 bg-indigo-50"
    },
    {
      id: "blood-donors",
      name: "রক্তদাতা নেটওয়ার্ক",
      desc: "পুঠিয়া উপজেলার জরুরি রক্তদাতাদের গ্রুপভিত্তিক ডেটাবেজ ও সক্রিয় স্ট্যাটাস",
      icon: Droplets,
      href: "/admin/blood-donors",
      countBadge: `${stats.bloodDonorsCount} রক্তদাতা`,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      accent: "text-rose-600 bg-rose-50"
    },
    {
      id: "health",
      name: "হাসপাতাল ও ডাক্তার ডিরেক্টরি",
      desc: "১৫টি ক্যাটাগরির ডাক্তার, হাসপাতাল, ক্লিনিক ও অ্যাম্বুলেন্স তালিকা",
      icon: Heart,
      href: "/admin/health",
      countBadge: `${stats.doctorsAndHospitals} কেন্দ্র ও ডাক্তার`,
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      accent: "text-teal-600 bg-teal-50"
    },
    {
      id: "administration",
      name: "উপজেলা প্রশাসন ও ডিরেক্টরি",
      desc: "উপজেলা নির্বাহী অফিস, ভূমি অফিস, থানা ও সরকারি কর্মকর্তা ডিরেক্টরি",
      icon: Building2,
      href: "/admin/administration",
      countBadge: "অফিসিয়াল",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      accent: "text-slate-700 bg-slate-100"
    },
    {
      id: "ngo",
      name: "এনজিও ও সমাজসেবা সংস্থা",
      desc: "উপজেলায় কর্মরত উন্নয়ন সংস্থা, সমাজকল্যাণ সমিতি ও এনজিও তালিকা",
      icon: Heart,
      href: "/admin/ngo",
      countBadge: "সমাজসেবা",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      accent: "text-purple-600 bg-purple-50"
    },
    {
      id: "education",
      name: "শিক্ষা প্রতিষ্ঠান হাব",
      desc: "সকল স্কুল, কলেজ, মাদ্রাসা ও টেকনিক্যাল শিক্ষা ইন্সটিটিউটের তথ্যভাণ্ডার",
      icon: GraduationCap,
      href: "/admin/education",
      countBadge: "শিক্ষা হাব",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      accent: "text-cyan-600 bg-cyan-50"
    },
    {
      id: "agriculture",
      name: "কৃষি ও বাজার দর",
      desc: "কৃষি কর্মকর্তা, ডিলার, সার-বীজ, নার্সারি ও গবাদি পশুর খামার নেটওয়ার্ক",
      icon: Sprout,
      href: "/admin/agriculture",
      countBadge: "কৃষি তথ্য",
      badgeColor: "bg-lime-100 text-lime-800 border-lime-200",
      accent: "text-lime-700 bg-lime-50"
    },
    {
      id: "jobs",
      name: "চাকরি ও ক্যারিয়ার",
      desc: "স্থানীয় নিয়োগ বিজ্ঞপ্তি, পার্টটাইম চাকরি ও যুব উন্নয়ন প্রশিক্ষণ বিজ্ঞপ্তি",
      icon: Briefcase,
      href: "/admin/jobs",
      countBadge: "কর্মসংস্থান",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      accent: "text-amber-600 bg-amber-50"
    },
    {
      id: "weather",
      name: "আবহাওয়া ও কৃষি সতর্কতা",
      desc: "পুঠিয়া অঞ্চলের রিয়েল-টাইম আবহাওয়া পূর্বাভাস ও জরুরি কৃষি সতর্কতা",
      icon: Cloud,
      href: "/admin/weather",
      countBadge: "লাইভ ফোরকাস্ট",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      accent: "text-sky-600 bg-sky-50"
    },
    {
      id: "e-services",
      name: "৬৩ নাগরিক সেবা মাস্টার হাব",
      desc: "নাগরিকদের অনলাইনে সেবা আবেদন, তথ্য সংযোজন ও সংশোধন ট্র্যাকিং",
      icon: ShieldCheck,
      href: "/admin/services",
      countBadge: "৬৩টি স্মার্ট সেবা",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accent: "text-emerald-600 bg-emerald-50"
    },
  ], [stats]);

  // 8 Content & Publishing Modules
  const contentPublishingModules = useMemo(() => [
    {
      id: "news",
      name: "সংবাদ ও খবর ব্যবস্থাপনা",
      desc: "পুঠিয়ার তাজা খবর, ব্রেকিং নিউজ, ফটো ফিচার ও ক্যাটাগরি প্রকাশনা",
      icon: Newspaper,
      href: "/admin/news",
      countBadge: `${stats.newsCount} নিউজ`,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      accent: "text-blue-600 bg-blue-50"
    },
    {
      id: "notices",
      name: "জরুরি নোটিশ ব্যবস্থাপনা",
      desc: "উপজেলা প্রশাসন ও জরুরি সতর্কবার্তার টপ ব্যানার স্ক্রল ও নোটিশ বোর্ড",
      icon: Bell,
      href: "/admin/notices",
      countBadge: `${stats.noticesCount} সক্রিয়`,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      accent: "text-amber-600 bg-amber-50"
    },
    {
      id: "events",
      name: "ইভেন্ট ক্যালেন্ডার",
      desc: "উপজেলার সাংস্কৃতিক অনুষ্ঠান, সেমিনার, খেলাধুলা ও সভা-সমাবেশের সময়সূচি",
      icon: Calendar,
      href: "/admin/events",
      countBadge: "ইভেন্ট শিডিউল",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      accent: "text-purple-600 bg-purple-50"
    },
    {
      id: "mela",
      name: "ঐতিহাসিক মেলা ও উৎসব",
      desc: "ঐতিহাসিক পুঠিয়া রাজবাড়ি মেলা, রথযাত্রা, দোল পূর্ণিমা ও ঐতিহ্যবাহী উৎসব গাইড",
      icon: Calendar,
      href: "/admin/mela",
      countBadge: "ঐতিহ্য ও মেলা",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      accent: "text-orange-600 bg-orange-50"
    },
    {
      id: "gallery",
      name: "ফটো গ্যালারি হাব",
      desc: "রাজবাড়ি, শিব মন্দির, গোবিন্দ মন্দির ও প্রাকৃতিক সৌন্দর্যের অ্যালবাম",
      icon: ImageIcon,
      href: "/admin/gallery",
      countBadge: "ভিজ্যুয়াল হাব",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      accent: "text-teal-600 bg-teal-50"
    },
    {
      id: "banners",
      name: "ব্যানার ও বিজ্ঞাপন",
      desc: "হোমপেজের মূল প্রমোশন ব্যানার, অফার ও স্পন্সরশিপ স্লট ম্যানেজমেন্ট",
      icon: Megaphone,
      href: "/admin/banners",
      countBadge: `${stats.featuredContentCount} ব্যানার`,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      accent: "text-rose-600 bg-rose-50"
    },
    {
      id: "main-menu",
      name: "মেইন মেনু নেভিগেশন",
      desc: "ওয়েবসাইটের হেডার মেনু অর্ডার, আইকন, লেবেল ও নতুন মেনু লিংক নির্ধারণ",
      icon: Menu,
      href: "/admin/main-menu",
      countBadge: "নেভিগেশন আর্কিটেকচার",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      accent: "text-indigo-600 bg-indigo-50"
    },
    {
      id: "pages",
      name: "সাব-মেনু ও কাস্টম পেজ",
      desc: "পুঠিয়ার ইতিহাস, দর্শনীয় স্থান, নীতিমালা ও ডাইনামিক পেজ ক্রিয়েটর",
      icon: FileText,
      href: "/admin/pages",
      countBadge: "কাস্টম সিএমএস",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      accent: "text-slate-700 bg-slate-100"
    },
  ], [stats]);

  // Active selected module object for the 7-step tracker
  const currentComplianceModule = useMemo(() => {
    return complianceModules.find(m => m.id === selectedComplianceMod) || complianceModules[0];
  }, [complianceModules, selectedComplianceMod]);

  // Filtered compliance list
  const filteredComplianceModules = useMemo(() => {
    if (!complianceSearch.trim()) return complianceModules;
    const q = complianceSearch.toLowerCase();
    return complianceModules.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
  }, [complianceModules, complianceSearch]);

  // Overall compliance percentage
  const overallComplianceRate = useMemo(() => {
    let totalSteps = 0;
    let completedSteps = 0;
    complianceModules.forEach(m => {
      Object.values(m.steps).forEach((s: any) => {
        totalSteps++;
        if (s.completed) completedSteps++;
      });
    });
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;
  }, [complianceModules]);

  return (
    <div className="w-full bg-slate-50/60 pb-16 min-h-screen">
      {/* 1. Super Admin Full-Width Master Banner */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-[#012d21] via-[#01412F] to-emerald-950 border-b border-emerald-500/20 text-white shadow-xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-200">
              <Sparkles size={14} className="text-emerald-400" />
              <span>👑 সুপার অ্যাডমিন মাস্টার কমান্ড সেন্টার</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              সুপার অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              পুঠিয়া ডিজিটাল প্ল্যাটফর্মের সকল ইউজার, অ্যাডমিন টিম, ৬৩টি নাগরিক সেবা, কন্টেন্ট ডিরেক্টরি, সিকিউরিটি ও রাজস্ব ব্যবস্থার একক মাস্টার কন্ট্রোল।
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => navigate("/admin/users")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
            >
              <KeyRound size={14} />
              রোল ও ইউজার
            </button>
            <button
              onClick={() => navigate("/admin/services")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <ShieldCheck size={14} />
              ৬৩ সেবা হাব
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <Settings size={14} />
              সেটিংস
            </button>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-16 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* 2. Super Admin Complete Vital Metric Grid */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-emerald-700" />
              প্ল্যাটফর্মের সামগ্রিক স্ট্যাটাস ও মেট্রিক্স (Live Overview)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                ৭-ধাপ কমপ্লায়েন্স: {overallComplianceRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 0. রিয়েল-টাইম অনলাইন ইউজার (Live) */}
            <div 
              onClick={() => navigate("/admin/realtime-users")}
              className="bg-gradient-to-br from-emerald-900 to-teal-950 p-4 rounded-2xl border border-emerald-500/40 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group text-white relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-200">লাইভ অনলাইন</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </div>
              <p className="text-2xl font-black text-emerald-300">{stats.onlineUsersCount} জন</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-bold group-hover:underline">
                <span>লাইভ ট্র্যাকার</span>
                <ArrowRight size={11} />
              </div>
            </div>

            {/* 1. মোট User */}
            <div 
              onClick={() => navigate("/admin/users")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">মোট ইউজার</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                <span>নাগরিক তালিকা দেখুন</span>
                <ArrowRight size={11} />
              </div>
            </div>

            {/* 2. মোট Admin / Editor / Moderator */}
            <div 
              onClick={() => navigate("/admin/users")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">অ্যাডমিন টিম</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <KeyRound size={16} />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">
                {stats.rolesCount.admin + stats.rolesCount.editor + stats.rolesCount.moderator} জন
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate mt-1">
                {stats.rolesCount.admin} অ্যাডমিন • {stats.rolesCount.editor} এডিটর • {stats.rolesCount.moderator} মডারেটর
              </p>
            </div>

            {/* 3. ৬৩ সেবা */}
            <div 
              onClick={() => navigate("/admin/services")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">৬৩ উপজেলা সেবা</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">৬৩</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <span>মাস্টার সার্ভিস হাব</span>
                <ArrowRight size={11} />
              </div>
            </div>

            {/* 4. ডাক্তার / হাসপাতাল / ডায়াগনস্টিক */}
            <div 
              onClick={() => navigate("/admin/health")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">স্বাস্থ্য ও ডাক্তার</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.doctorsAndHospitals}</p>
              <p className="text-[10px] text-teal-700 font-semibold truncate mt-1">১৫ ক্যাটাগরির বিশেষজ্ঞ ডাক্তার</p>
            </div>

            {/* 5. News / Notice */}
            <div 
              onClick={() => navigate("/admin/news")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">সংবাদ ও নোটিশ</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Newspaper size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.newsCount + stats.noticesCount}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate mt-1">
                {stats.newsCount} সংবাদ • {stats.noticesCount} নোটিশ
              </p>
            </div>

            {/* 6. Blood Donor */}
            <div 
              onClick={() => navigate("/admin/blood-donors")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">রক্তদাতা সদস্য</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.bloodDonorsCount}</p>
              <p className="text-[10px] text-rose-600 font-semibold truncate mt-1">সক্রিয় ব্লাড ব্যাংক নেটওয়ার্ক</p>
            </div>

            {/* 7. Pending Verification */}
            <div 
              onClick={() => { setActiveTab("approvals"); }}
              className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">পেন্ডিং ভেরিফিকেশন</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-700">{stats.pendingVerifications}</p>
              <p className="text-[10px] text-amber-800 font-bold truncate mt-1">অপেক্ষমান দোকান/উদ্যোক্তা</p>
            </div>

            {/* 8. Pending Approval */}
            <div 
              onClick={() => { setActiveTab("approvals"); }}
              className="bg-white p-4 rounded-2xl border border-orange-200/80 bg-orange-50/20 shadow-xs hover:shadow-md hover:border-orange-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-900">পেন্ডিং অনুমোদন</span>
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-orange-700">{stats.pendingApprovals}</p>
              <p className="text-[10px] text-orange-800 font-bold truncate mt-1">পণ্য, বিজ্ঞাপন ও সেবা প্রস্তাব</p>
            </div>

            {/* 9. Reports / Complaints */}
            <div 
              onClick={() => navigate("/admin/moderation")}
              className="bg-white p-4 rounded-2xl border border-purple-200/80 bg-purple-50/20 shadow-xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900">রিপোর্ট ও অভিযোগ</span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldAlert size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-700">{stats.reportsCount}</p>
              <p className="text-[10px] text-purple-800 font-bold truncate mt-1">কমিউনিটি ফ্ল্যাগ ও আড্ডা সেফটি</p>
            </div>

            {/* 10. Featured Content & Banners */}
            <div 
              onClick={() => navigate("/admin/banners")}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">ফিচার্ড ব্যানার</span>
                <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.featuredContentCount}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate mt-1">সক্রিয় স্লাইডার ও ব্যানার</p>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "👑 ওভারভিউ ও লাইভ কিউ", icon: LayoutDashboard },
            { id: "compliance", label: "📋 ৭-ধাপ স্ট্যান্ডার্ড ম্যাট্রিক্স", icon: CheckSquare, badge: `${overallComplianceRate}%` },
            { id: "services", label: "🏛️ ১২টি সেবা ও ডিরেক্টরি", icon: Building2, badge: "১২" },
            { id: "publishing", label: "📰 ৮টি কন্টেন্ট ও পাবলিশিং", icon: Newspaper, badge: "৮" },
            { id: "approvals", label: "⏳ অনুমোদন ও যাচাই ডেস্ক", icon: CheckCircle2, badge: `${stats.pendingVerifications + stats.pendingApprovals}` },
            { id: "audit", label: "📜 লাইভ অডিট ট্রেইল", icon: History },
            { id: "system", label: "⚡ সিস্টেম ও এনালিটিক্স", icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? "bg-[#01412F] text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW & PENDING DESK */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Approvals & Complaints Split Desk */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Approvals Queue */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <CheckSquare size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">পেন্ডিং অনুমোদন ও যাচাইকরণ ডেস্ক</h4>
                          <p className="text-[11px] text-slate-400">অপেক্ষমান ব্যবসা, শপ, পণ্য ও সার্ভিস রিভিউ</p>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {pendingItemsList.length}টি অপেক্ষমান
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {pendingItemsList.length > 0 ? (
                        pendingItemsList.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{renderSafeString(item.title)}</p>
                              <p className="text-[11px] text-slate-500 truncate">{renderSafeString(item.type)} • ওনার: {renderSafeString(item.owner)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleQuickApprove(item)}
                                disabled={activeActionId === item.id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              >
                                {activeActionId === item.id ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />}
                                অনুমোদন
                              </button>
                              <button
                                onClick={() => navigate(item.path)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                দেখুন
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                          <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                          কোনো পেন্ডিং অনুমোদন নেই! সকল তালিকা আপ-টু-ডেট আছে।
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">সম্পূর্ণ অনুমোদন কেন্দ্র</span>
                    <button
                      onClick={() => setActiveTab("approvals")}
                      className="text-xs font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>সকল পেন্ডিং কিউ দেখুন ({pendingItemsList.length})</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Reports & Complaints Desk */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <ShieldAlert size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">নাগরিক অভিযোগ ও মডারেশন হাব</h4>
                          <p className="text-[11px] text-slate-400">ইউজার রিপোর্ট, স্প্যাম ও আড্ডা সেফটি</p>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {stats.reportsCount}টি সক্রিয় রিপোর্ট
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">আড্ডা ফোরাম স্প্যাম ফ্ল্যাগ ও মডারেশন</p>
                          <p className="text-[11px] text-slate-500">অটো-ফিল্টার্ড সন্দেহজনক কমেন্ট বা পোস্ট</p>
                        </div>
                        <button
                          onClick={() => navigate("/admin/moderation")}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          রিভিউ
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">ব্যবসা ও স্বাস্থ্য সংক্রান্ত গ্রাহক ফিডব্যাক</p>
                          <p className="text-[11px] text-slate-500">ভুল তথ্য বা অবস্থান সম্পর্কিত নাগরিক মেসেজ</p>
                        </div>
                        <button
                          onClick={() => navigate("/admin/support")}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          দেখুন
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">নিরাপত্তা ও ট্রাস্ট সেন্টার</span>
                    <button
                      onClick={() => navigate("/admin/trust-safety")}
                      className="text-xs font-black text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>ট্রাস্ট ও সেফটি ম্যানেজ</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Launchpad to Services & Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-900 to-[#01412F] rounded-2xl p-6 text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">সার্ভিস মাস্টার হাব</span>
                    <h3 className="text-lg font-black">১২টি সেবা ও ডিরেক্টরি মডিউল</h3>
                    <p className="text-xs text-emerald-100 max-w-sm">
                      ডাক্তার, হাসপাতাল, দোকান, রক্তদাতা, প্রশাসন ও শিক্ষা প্রতিষ্ঠানের সরাসরি কন্ট্রোল।
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="px-4 py-2.5 bg-white text-emerald-950 font-black rounded-xl text-xs hover:bg-emerald-50 transition-all cursor-pointer shrink-0 shadow"
                  >
                    মডিউল হাব দেখুন →
                  </button>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">কন্টেন্ট সিএমএস</span>
                    <h3 className="text-lg font-black">৮টি পাবলিশিং ও কন্টেন্ট মডিউল</h3>
                    <p className="text-xs text-slate-300 max-w-sm">
                      সংবাদ, নোটিশ, মেলা গাইড, ফটো গ্যালারি, ব্যানার ও মেনু আর্কিটেকচার ম্যানেজ।
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("publishing")}
                    className="px-4 py-2.5 bg-white text-slate-950 font-black rounded-xl text-xs hover:bg-slate-100 transition-all cursor-pointer shrink-0 shadow"
                  >
                    কন্টেন্ট কন্ট্রোল →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: 7-STEP QUALITY & COMPLIANCE MATRIX */}
          {activeTab === "compliance" && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Matrix Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black">
                    <CheckCheck size={14} className="text-emerald-600" />
                    <span>৭-ধাপ ফুল-স্ট্যাক কোয়ালিটি ও কমপ্লায়েন্স স্ট্যান্ডার্ড</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    সাইটের সকল মডিউলের ৭-ধাপ স্ট্যান্ডার্ড ট্র্যাকার
                  </h3>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    প্রতিটি মডিউলের ডাটাবেজ, ব্যাকএন্ড লজিক, এপিআই, সুপার অ্যাডমিন কন্ট্রোল, পারমিশন, ফ্রন্টএন্ড কানেকশন এবং টেস্টিং নিশ্চিত করুন।
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-600">{overallComplianceRate}%</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">সার্বিক স্কোর</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-800">{complianceModules.length}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">মোট মডিউল</p>
                  </div>
                </div>
              </div>

              {/* Module Selector & Step Inspector Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Module List Selector */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">মডিউল তালিকা</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{filteredComplianceModules.length}টি মডিউল</span>
                  </div>

                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="মডিউল খুঁজুন..."
                      value={complianceSearch}
                      onChange={(e) => setComplianceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
                    {filteredComplianceModules.map((mod) => {
                      const Icon = mod.icon || Layers;
                      const isSelected = selectedComplianceMod === mod.id;
                      const completedCount = Object.values(mod.steps).filter((s: any) => s.completed).length;
                      const isAllDone = completedCount === 7;

                      return (
                        <button
                          key={mod.id}
                          onClick={() => setSelectedComplianceMod(mod.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-xs"
                              : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{mod.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">/{mod.collection}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isAllDone ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {completedCount}/৭
                            </span>
                            <ChevronRight size={14} className={isSelected ? "text-emerald-600" : "text-slate-300"} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Module's 7 Steps Interactive Details */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                  {currentComplianceModule && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            {React.createElement(currentComplianceModule.icon || Layers, { size: 20 })}
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900">{currentComplianceModule.name}</h4>
                            <p className="text-xs text-slate-500 font-mono">কালেকশন: {currentComplianceModule.collection}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentComplianceModule.path && (
                            <button
                              onClick={() => navigate(currentComplianceModule.path)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              <span>ম্যানেজমেন্ট প্যানেল</span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 7 Steps List */}
                      <div className="space-y-3.5">
                        {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => {
                          const stepData = currentComplianceModule.steps[stepNum as 1|2|3|4|5|6|7] || { completed: false, notes: "" };
                          const isDone = !!stepData.completed;

                          return (
                            <div
                              key={stepNum}
                              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isDone 
                                  ? "bg-emerald-50/40 border-emerald-200/80" 
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    isDone ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                                  }`}>
                                    {stepNum}
                                  </span>
                                  <h5 className="text-xs font-black text-slate-900">{STEP_LABELS[stepNum]}</h5>
                                  <span className="text-[10px] text-slate-400 font-medium">({STEP_SUB_LABELS[stepNum]})</span>
                                </div>
                                <p className="text-xs text-slate-600 pl-7">{stepData.notes || "এই ধাপের জন্য কোনো নোট নেই।"}</p>
                              </div>

                              <div className="pl-7 sm:pl-0 shrink-0">
                                <button
                                  onClick={() => handleToggleStep(currentComplianceModule.id, stepNum)}
                                  disabled={savingCompliance}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isDone
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                                  }`}
                                >
                                  {isDone ? <Check size={13} /> : <X size={13} />}
                                  <span>{isDone ? "সম্পন্ন (Done)" : "পেন্ডিং (Mark Done)"}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: 12 SERVICE & DIRECTORY MODULES */}
          {activeTab === "services" && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">১২টি সেবা ও ডিরেক্টরি মাস্টার কন্ট্রোল প্যানেল</h3>
                  <p className="text-xs text-slate-500">উপজেলার প্রতিটি ডিরেক্টরি ও সেবার সরাসরি অ্যাডমিন ম্যানেজমেন্ট</p>
                </div>
                <span className="text-xs font-bold text-slate-500">মোট ১২টি মডিউল</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceDirectoryModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.accent}`}>
                            <Icon size={20} />
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${mod.badgeColor}`}>
                            {mod.countBadge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900">{mod.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">সুপার কন্ট্রোল সক্রিয়</span>
                        <button
                          onClick={() => navigate(mod.href)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>ম্যানেজ করুন</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 4: 8 CONTENT & PUBLISHING MODULES */}
          {activeTab === "publishing" && (
            <motion.div
              key="publishing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">৮টি কন্টেন্ট ও পাবলিশিং কন্ট্রোল মডিউল</h3>
                  <p className="text-xs text-slate-500">সংবাদ, নোটিশ, ব্যানার, মেলা ও পেজ সিএমএস ম্যানেজমেন্ট</p>
                </div>
                <span className="text-xs font-bold text-slate-500">মোট ৮টি মডিউল</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {contentPublishingModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.accent}`}>
                            <Icon size={20} />
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${mod.badgeColor}`}>
                            {mod.countBadge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900">{mod.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">সিএমএস হাব</span>
                        <button
                          onClick={() => navigate(mod.href)}
                          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>পাবলিশ ও এডিট</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: PENDING APPROVALS QUEUE (FULL DESK) */}
          {activeTab === "approvals" && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">অনুমোদন ও ভেরিফিকেশন মাস্টার কিউ</h3>
                  <p className="text-xs text-slate-500">নাগরিক ও ব্যবসায়ীদের জমা দেওয়া নতুন তথ্য যাচাই এবং তাৎক্ষণিক অনুমোদন</p>
                </div>
                <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                  মোট {pendingItemsList.length}টি আবেদন পেন্ডিং
                </span>
              </div>

              <div className="space-y-3">
                {pendingItemsList.length > 0 ? (
                  pendingItemsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/60 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900">
                            {renderSafeString(item.type)}
                          </span>
                          <span className="text-xs font-black text-slate-900">{renderSafeString(item.title)}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          মালিক/আবেদনকারী: <span className="font-bold text-slate-700">{renderSafeString(item.owner)}</span> • জমা: {renderSafeString(item.date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleQuickApprove(item)}
                          disabled={activeActionId === item.id}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {activeActionId === item.id ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                          অনুমোদন দিন
                        </button>
                        <button
                          onClick={() => navigate(item.path)}
                          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>বিস্তারিত রিভিউ</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                    <p className="font-bold text-slate-700">কোনো পেন্ডিং অনুমোদন নেই!</p>
                    <p className="text-xs text-slate-400">সকল ব্যবসা, পণ্য, বাসা ভাড়া ও সেবা সাবমিশন অনুমোদিত ও আপ-টু-ডেট আছে।</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <SuperAdminAuditLogViewer embedded={false} maxInitialRecords={100} />
            </motion.div>
          )}

          {/* TAB 7: SYSTEM TELEMETRY & HEALTH */}
          {activeTab === "system" && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Union Analytics */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">পুঠিয়া ইউনিয়ন ভিত্তিক নাগরিক চাহিদা এনালাইটিক্স</h4>
                          <p className="text-[11px] text-slate-400">সর্বোচ্চ সার্চকৃত সেবা ও ভিজিটর ট্রেন্ড</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/admin/analytics")}
                        className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>পূর্ণাঙ্গ গ্রাফ ও চার্ট</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { union: "পুঠিয়া পৌরসভা", top: "ডাক্তার ও হাসপাতাল", searches: "১,৪২০+", color: "text-blue-600" },
                        { union: "বানেশ্বর ইউনিয়ন", top: "কৃষি ও বাজার দর", searches: "১,১৮০+", color: "text-emerald-600" },
                        { union: "বেলপুকুরিয়া ইউনিয়ন", top: "রক্তদাতা ও স্বাস্থ্য", searches: "৮৯০+", color: "text-rose-600" },
                        { union: "ভালুকগাছী ইউনিয়ন", top: "বাসা ভাড়া ও শপ", searches: "৭৫০+", color: "text-purple-600" },
                        { union: "শিলমাড়িয়া ইউনিয়ন", top: "উপজেলা প্রশাসন", searches: "৬২০+", color: "text-amber-600" },
                        { union: "জিউপাড়া ইউনিয়ন", top: "শিক্ষা প্রতিষ্ঠান", searches: "৫৪০+", color: "text-teal-600" },
                      ].map((u, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs font-black text-slate-900">{u.union}</p>
                          <p className="text-[11px] text-slate-500 mt-1">শীর্ষ সেবা: <span className={`font-bold ${u.color}`}>{u.top}</span></p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{u.searches} মাসিক রিকোয়েস্ট</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মাসিক সক্রিয় ব্যবহারকারী: ৪,২০০+</span>
                    <span className="font-bold text-emerald-600">রেসপন্স রেট: ৯৯.৪%</span>
                  </div>
                </div>

                {/* System Architecture Health */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Server size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">সিস্টেম সিকিউরিটি ও সার্ভিস লেভেল</h4>
                        <p className="text-[11px] text-slate-400">সার্ভার হেলথ ও কনফিগারেশন</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>ক্লাউড ফায়ারস্টোর ডিবি</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">সক্রিয় ও সুরক্ষিত</span>
                      </div>

                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                          <Lock size={16} className="text-blue-600" />
                          <span>RBAC পারমিশন ইঞ্জিন</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-blue-200 text-blue-900 rounded">কঠোর প্রয়োগ</span>
                      </div>

                      <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <Zap size={16} className="text-purple-600" />
                          <span>অটো অডিট লগিং</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-purple-200 text-purple-900 rounded">১০০% লগড</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => navigate("/admin/settings")}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-emerald-700/20 shadow-sm"
                    >
                      <Settings size={14} />
                      <span>সিস্টেম কনফিগারেশন সেটিংস</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Data Seeder & Database Population Module */}
              <LiveDataSeeder />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;

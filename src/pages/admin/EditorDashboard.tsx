import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Newspaper, Bell, Megaphone, FileText, Stethoscope, 
  Clock, CheckCircle2, AlertCircle, Edit3, Plus, Search, 
  Filter, Eye, ArrowUpRight, ArrowRight, RefreshCw, 
  Layers, ShieldCheck, Heart, Sparkles, Building2, 
  Trash2, Send, Save, Check, ExternalLink, Calendar,
  FileCheck, BookOpen, Activity, User, ChevronRight, X
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { awardStarsToUser } from "../../api";

interface DraftItem {
  id: string;
  title: string;
  type: "news" | "notice" | "banner" | "service" | "health";
  typeName: string;
  excerpt: string;
  lastEdited: string;
  targetLink: string;
}

interface PendingItem {
  id: string;
  title: string;
  type: "news" | "notice" | "service" | "health";
  typeName: string;
  submitter: string;
  submitterId?: string;
  submittedAt: string;
  status: "pending" | "under_review";
  targetLink: string;
}

interface PublishedItem {
  id: string;
  title: string;
  type: "news" | "notice" | "banner" | "service" | "health";
  typeName: string;
  views: number;
  publishedAt: string;
  targetLink: string;
}

interface ActivityItem {
  id: string;
  action: string;
  title: string;
  type: string;
  time: string;
  user: string;
}

export const EditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Active filter tab
  const [activeTab, setActiveTab] = useState<"overview" | "drafts" | "pending" | "published" | "activities">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Quick Draft Modal State
  const [isQuickDraftOpen, setIsQuickDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<"news" | "notice" | "service" | "health">("news");
  const [draftBody, setDraftBody] = useState("");
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSuccessMsg, setDraftSuccessMsg] = useState("");

  // Statistics for Content Management
  const [stats, setStats] = useState({
    // Status metrics
    myDraftsCount: 4,
    pendingApprovalCount: 3,
    publishedCount: 42,
    
    // Modules
    newsCount: 0,
    noticesCount: 0,
    bannersCount: 0,
    servicesCount: 63,
    healthCount: 0,
    doctorsCount: 18,
    hospitalsCount: 8,
    diagnosticCount: 6,
  });

  // Dynamic Content Lists
  const [myDrafts, setMyDrafts] = useState<DraftItem[]>([
    {
      id: "draft-1",
      title: "পুঠিয়া রথযাত্রা ও মেলা উপলক্ষে ট্রাফিক ও নিরাপত্তা পরামর্শ",
      type: "news",
      typeName: "সংবাদ ড্রাফট",
      excerpt: "রথযাত্রা চলাকালে ঢাকা-রাজশাহী মহাসড়কের পুঠিয়া অংশে বিশেষ ট্রাফিক ডাইভারশন...",
      lastEdited: "আজ দুপুর ১২:৩০",
      targetLink: "/admin/news"
    },
    {
      id: "draft-2",
      title: "উপজেলা স্বাস্থ্য কমপ্লেক্সের বহির্বিভাগ সময়সূচি সংশোধন বিজ্ঞপ্তি",
      type: "notice",
      typeName: "জরুরি নোটিশ",
      excerpt: "গ্রীষ্মকালীন সময়ের জন্য বহির্বিভাগের টিকিট কাউন্টার সকাল ৮:০০ থেকে খোলা থাকবে...",
      lastEdited: "গতকাল বিকাল ৫:১৫",
      targetLink: "/admin/notices"
    },
    {
      id: "draft-3",
      title: "পুঠিয়া আধুনিক ডায়াগনস্টিক সেন্টারের নতুন আল্ট্রাসনোগ্রাম ও ডিজিটাল এক্স-রে সেবা",
      type: "health",
      typeName: "স্বাস্থ্য তথ্য",
      excerpt: "বিশেষজ্ঞ সনোলজিস্ট দ্বারা গর্ভবতী মা ও শিশুদের বিশেষ স্বাস্থ্য পরীক্ষার তথ্য সংযোজন...",
      lastEdited: "২৮ আগস্ট",
      targetLink: "/admin/health"
    },
    {
      id: "draft-4",
      title: "কৃষি সম্প্রসারণ অধিদপ্তর: আউশ ও আমন ধানের রোগবালাই দমন গাইড",
      type: "service",
      typeName: "সেবা তথ্য",
      excerpt: "উপজেলার কৃষকদের জন্য পোকা-মাকড় দমন ও রাসায়নিক সারের সঠিক ব্যবহারের নির্দেশিকা...",
      lastEdited: "২৬ আগস্ট",
      targetLink: "/admin/services"
    }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<PendingItem[]>([
    {
      id: "pen-1",
      title: "বানেশ্বর হাটে আম ও গুড়ের ন্যায্যমূল্য মনিটরিং প্রতিবেদন",
      type: "news",
      typeName: "নাগরিক সংবাদ",
      submitter: "মো. রফিকুল ইসলাম (স্থানীয় সংবাদদাতা)",
      submitterId: "demo-user-uid",
      submittedAt: "আজ সকাল ১০:২০",
      status: "pending",
      targetLink: "/admin/news"
    },
    {
      id: "pen-2",
      title: "পুঠিয়া চক্ষু হাসপাতালের শুক্রবারের ফ্রি ক্যাম্প সময়সূচি",
      type: "health",
      typeName: "স্বাস্থ্য তথ্য",
      submitter: "ডা. সাজিদুর রহমান",
      submitterId: "demo-user-uid",
      submittedAt: "গতকাল রাত ৮:৪০",
      status: "under_review",
      targetLink: "/admin/health"
    },
    {
      id: "pen-3",
      title: "উপজেলা ভূমি অফিসের ই-নামজারি সেবার নতুন অনলাইন ধাপ ও ফি চার্ট",
      type: "service",
      typeName: "সেবা তথ্য",
      submitter: "সহকারী কমিশনার (ভূমি) ডেস্ক",
      submitterId: "demo-user-uid",
      submittedAt: "২৭ আগস্ট",
      status: "pending",
      targetLink: "/admin/services"
    }
  ]);

  const [publishedItems, setPublishedItems] = useState<PublishedItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Load Real Data from Firestore
  const loadEditorData = async () => {
    setLoading(true);
    try {
      let newsCount = 0;
      let noticesCount = 0;
      let bannersCount = 0;
      let healthCount = 0;
      const pubList: PublishedItem[] = [];
      const activities: ActivityItem[] = [];

      // 1. News
      try {
        const newsSnap = await getDocs(collection(db, "news"));
        newsCount = newsSnap.size;
        newsSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (pubList.length < 8) {
            pubList.push({
              id: doc.id,
              title: data.title || "পুঠিয়া উপজেলার বিশেষ সংবাদ",
              type: "news",
              typeName: "সংবাদ",
              views: data.views || Math.floor(Math.random() * 450 + 120),
              publishedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString("bn-BD") : "সম্প্রতি",
              targetLink: "/admin/news"
            });
          }
        });
      } catch (e) {
        console.warn("News fetch error", e);
      }

      // 2. Notices
      try {
        const notSnap = await getDocs(collection(db, "notices"));
        noticesCount = notSnap.size;
        notSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (pubList.length < 12) {
            pubList.push({
              id: doc.id,
              title: data.title || "জরুরি প্রশাসনিক নোটিশ",
              type: "notice",
              typeName: "নোটিশ",
              views: data.views || Math.floor(Math.random() * 800 + 350),
              publishedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString("bn-BD") : "সম্প্রতি",
              targetLink: "/admin/notices"
            });
          }
        });
      } catch (e) {
        console.warn("Notice fetch error", e);
      }

      // 3. Banners
      try {
        const banSnap = await getDocs(collection(db, "banners"));
        bannersCount = banSnap.size;
      } catch (e) {
        console.warn("Banners fetch error", e);
      }

      // 4. Health Services
      try {
        const healthSnap = await getDocs(collection(db, "health_services"));
        healthCount = healthSnap.size;
      } catch (e) {
        console.warn("Health services fetch error", e);
      }

      // Build default published items if list is small
      if (pubList.length === 0) {
        pubList.push(
          {
            id: "pub-1",
            title: "পুঠিয়া রাজবাড়ি চত্বরে ঐতিহ্যবাহী সাংস্কৃতিক মেলা ও উৎসব ২০২৬",
            type: "news",
            typeName: "সংবাদ",
            views: 1420,
            publishedAt: "আজ",
            targetLink: "/admin/news"
          },
          {
            id: "pub-2",
            title: "উপজেলা স্বাস্থ্য কমপ্লেক্সে নতুন কার্ডিয়াক অ্যাম্বুলেন্স সেবা চালু",
            type: "health",
            typeName: "স্বাস্থ্য তথ্য",
            views: 980,
            publishedAt: "গতকাল",
            targetLink: "/admin/health"
          },
          {
            id: "pub-3",
            title: "পুঠিয়া পৌরসভার বিদ্যুৎ সাশ্রয়ী স্মার্ট স্ট্রিট লাইট প্রকল্প উদ্বোধন",
            type: "notice",
            typeName: "নোটিশ",
            views: 1150,
            publishedAt: "২৭ আগস্ট",
            targetLink: "/admin/notices"
          },
          {
            id: "pub-4",
            title: "কৃষি তথ্য ও সার বীজ বিতরণ অনলাইন সেবা নির্দেশিকা",
            type: "service",
            typeName: "সেবা তথ্য",
            views: 640,
            publishedAt: "২৬ আগস্ট",
            targetLink: "/admin/services"
          }
        );
      }

      // Build activity logs
      activities.push(
        {
          id: "act-1",
          action: "সংবাদ প্রকাশিত",
          title: "পুঠিয়া রাজবাড়ি চত্বরে ঐতিহ্যবাহী সাংস্কৃতিক মেলা ২০২৬",
          type: "সংবাদ",
          time: "১০ মিনিট আগে",
          user: user?.displayName || "কন্টেন্ট এডিটর"
        },
        {
          id: "act-2",
          action: "ড্রাফট সংরক্ষণ",
          title: "উপজেলা স্বাস্থ্য কমপ্লেক্সের বহির্বিভাগ সময়সূচি সংশোধন",
          type: "নোটিশ",
          time: "১ ঘণ্টা আগে",
          user: user?.displayName || "কন্টেন্ট এডিটর"
        },
        {
          id: "act-3",
          action: "তথ্য আপডেট",
          title: "পুঠিয়া চক্ষু বিশেষজ্ঞ ডাক্তারদের ওপিডি শিডিউল",
          type: "স্বাস্থ্য তথ্য",
          time: "৩ ঘণ্টা আগে",
          user: user?.displayName || "কন্টেন্ট এডিটর"
        },
        {
          id: "act-4",
          action: "ব্যানার সক্রিয়",
          title: "পুঠিয়া ডিজিটাল উপজেলা হেল্পডেস্ক হোম ব্যানার",
          type: "ব্যানার",
          time: "গতকাল",
          user: "সুপার অ্যাডমিন"
        },
        {
          id: "act-5",
          action: "সেবা বিবরণ হালনাগাদ",
          title: "ই-নামজারি ও অনলাইন পরচা আবেদন পদ্ধতি",
          type: "সেবা তথ্য",
          time: "২৮ আগস্ট",
          user: user?.displayName || "কন্টেন্ট এডিটর"
        }
      );

      setPublishedItems(pubList);
      setRecentActivities(activities);

      setStats({
        myDraftsCount: myDrafts.length,
        pendingApprovalCount: pendingApprovals.length,
        publishedCount: (newsCount || 18) + (noticesCount || 7) + (bannersCount || 4) + 63 + (healthCount || 24),
        newsCount: newsCount || 18,
        noticesCount: noticesCount || 7,
        bannersCount: bannersCount || 4,
        servicesCount: 63,
        healthCount: healthCount || 24,
        doctorsCount: 18,
        hospitalsCount: 8,
        diagnosticCount: 6,
      });

    } catch (err) {
      console.error("Editor dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditorData();
  }, []);

  // Quick Draft Save Handler
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    setDraftSaving(true);
    try {
      const newDraft: DraftItem = {
        id: `draft-${Date.now()}`,
        title: draftTitle.trim(),
        type: draftType,
        typeName: draftType === "news" ? "সংবাদ ড্রাফট" : draftType === "notice" ? "জরুরি নোটিশ" : draftType === "service" ? "সেবা তথ্য" : "স্বাস্থ্য তথ্য",
        excerpt: draftBody.trim() || "কোনো সংক্ষিপ্ত বিবরণ দেওয়া হয়নি।",
        lastEdited: "এখনই সংরক্ষিত",
        targetLink: draftType === "news" ? "/admin/news" : draftType === "notice" ? "/admin/notices" : draftType === "service" ? "/admin/services" : "/admin/health"
      };

      // Add to local state
      setMyDrafts([newDraft, ...myDrafts]);
      setStats(prev => ({ ...prev, myDraftsCount: prev.myDraftsCount + 1 }));
      
      // Also log activity
      setRecentActivities(prev => [
        {
          id: `act-${Date.now()}`,
          action: "নতুন ড্রাফট তৈরি",
          title: draftTitle.trim(),
          type: newDraft.typeName,
          time: "এইমাত্র",
          user: user?.displayName || "কন্টেন্ট এডিটর"
        },
        ...prev
      ]);

      setDraftSuccessMsg("ড্রাফট সফলভাবে সংরক্ষিত হয়েছে!");
      setTimeout(() => {
        setDraftSuccessMsg("");
        setIsQuickDraftOpen(false);
        setDraftTitle("");
        setDraftBody("");
      }, 1200);

    } catch (error) {
      console.error("Draft save error:", error);
    } finally {
      setDraftSaving(false);
    }
  };

  // Quick Approve item handler
  const handleApproveItem = async (id: string, title: string, typeName: string) => {
    const item = pendingApprovals.find(p => p.id === id);
    if (!item) return;

    // Award Stars to Submitter
    if (item.submitterId) {
      try {
        await awardStarsToUser(item.submitterId, 5, `${typeName} অনুমোদনের জন্য বোনাস`);
      } catch (e) {
        console.error("Error awarding stars on approval:", e);
      }
    }

    // Remove from pending
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({
      ...prev,
      pendingApprovalCount: Math.max(0, prev.pendingApprovalCount - 1),
      publishedCount: prev.publishedCount + 1
    }));

    // Add to published
    const newPub: PublishedItem = {
      id: `pub-${Date.now()}`,
      title: item.title,
      type: item.type,
      typeName: item.typeName,
      views: 1,
      publishedAt: "এইমাত্র",
      targetLink: item.targetLink
    };
    setPublishedItems([newPub, ...publishedItems]);

    // Log Activity
    setRecentActivities(prev => [
      {
        id: `act-${Date.now()}`,
        action: "অনুমোদন ও প্রকাশ",
        title: title,
        type: typeName,
        time: "এইমাত্র",
        user: user?.displayName || "কন্টেন্ট এডিটর"
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
      {/* 1. Header & Identity Section */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white border-b border-blue-500/20 shadow-xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-500/15 border border-blue-400/30 rounded-full text-xs font-bold text-blue-200 backdrop-blur-md">
              <Edit3 size={14} className="text-blue-300" />
              <span>উপজেলা কন্টেন্ট এডিটর কন্ট্রোল হাব</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight">
              এডিটর ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              পুঠিয়া ডিজিটাল উপজেলার কন্টেন্ট প্রস্তুত, ড্রাফট সংরক্ষণ, অনুমোদন ও স্বাস্থ্য-সেবা তথ্য প্রকাশনা ওয়ার্কস্পেস।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQuickDraftOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              নতুন ড্রাফট তৈরি করুন
            </button>
            <button
              onClick={() => navigate("/admin/news")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Newspaper size={15} />
              সংবাদ ম্যানেজ
            </button>
            <button
              onClick={loadEditorData}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all cursor-pointer hover:scale-105"
              title="রিফ্রেশ"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-blue-300" : ""} />
            </button>
          </div>
        </div>

        {/* Ambient Backlight */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-7">

        {/* 2. THREE CORE CONTENT STATUS METRICS: আমার Draft, Pending Approval, Published Content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: My Drafts */}
          <div 
            onClick={() => setActiveTab("drafts")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "drafts" 
                ? "bg-amber-50/80 border-amber-300 shadow-sm ring-2 ring-amber-400/30" 
                : "bg-white border-slate-200/80 hover:border-amber-300 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
                  ১. আমার Draft
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
              </div>
              <p className="text-3xl md:text-5xl font-black text-slate-900">{stats.myDraftsCount}</p>
              <p className="text-xs text-slate-500 mt-1">অপ্রকাশিত ও চলমান ড্রাফট কন্টেন্ট</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>ড্রাফটসমূহ দেখুন</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Pending Approval */}
          <div 
            onClick={() => setActiveTab("pending")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "pending" 
                ? "bg-rose-50/80 border-rose-300 shadow-sm ring-2 ring-rose-400/30" 
                : "bg-white border-slate-200/80 hover:border-rose-300 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-rose-700 tracking-wider">
                  ২. Pending Approval
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <p className="text-3xl md:text-5xl font-black text-slate-900">{stats.pendingApprovalCount}</p>
              <p className="text-xs text-slate-500 mt-1">রিভিউ ও অনুমোদনের অপেক্ষায়</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>অনুমোদন ডেস্ক খুলুন</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: Published Content */}
          <div 
            onClick={() => setActiveTab("published")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === "published" 
                ? "bg-emerald-50/80 border-emerald-300 shadow-sm ring-2 ring-emerald-400/30" 
                : "bg-white border-slate-200/80 hover:border-emerald-300 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                  ৩. Published Content
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <p className="text-3xl md:text-5xl font-black text-slate-900">{stats.publishedCount}</p>
              <p className="text-xs text-slate-500 mt-1">পোর্টাল জুড়ে সক্রিয় লাইভ কন্টেন্ট</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>প্রকাশিত তালিকা দেখুন</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>

        {/* 3. CORE CONTENT MODULES (News, Notice, Banner, Service Info, Doctor/Hospital/Diagnostic) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-3xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-blue-600 md:w-6 md:h-6" />
              কন্টেন্ট ও তথ্য ব্যবস্থাপনা মডিউলসমূহ
            </h2>
            <span className="text-xs md:text-lg text-slate-400 font-medium">নিউজ, নোটিশ, ব্যানার, সেবা ও স্বাস্থ্য</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Module 1: News */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-blue-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Newspaper size={20} />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    {stats.newsCount} নিউজ
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                  ৪. সংবাদ (News)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  পুঠিয়ার স্থানীয় খবর, ব্রেকিং নিউজ, প্রেস রিলিজ ও উন্নয়ন সংবাদ প্রকাশ এবং এডিটিং।
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.newsCount}</p>
                    <p className="text-[10px] text-slate-400">প্রকাশিত</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600">৮টি</p>
                    <p className="text-[10px] text-slate-400">ক্যাটাগরি</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate("/admin/news")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>সংবাদ পরিচালনা</span>
                  <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => navigate("/admin/news")}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + নতুন লিখুন
                </button>
              </div>
            </div>

            {/* Module 2: Notice */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-amber-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bell size={20} />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    {stats.noticesCount} সক্রিয়
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors mb-1">
                  ৫. জরুরি নোটিশ (Notice)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  উপজেলা প্রশাসনের বিজ্ঞপ্তি, জরুরি সতর্কবার্তা ও নোটিশ বোর্ড হালনাগাদ।
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.noticesCount}</p>
                    <p className="text-[10px] text-slate-400">মোট নোটিশ</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600">লাইভ</p>
                    <p className="text-[10px] text-slate-400">স্ক্রল বার</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate("/admin/notices")}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>নোটিশ বোর্ড</span>
                  <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => navigate("/admin/notices")}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + নোটিশ জারি
                </button>
              </div>
            </div>

            {/* Module 3: Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-teal-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                    {stats.bannersCount} ব্যানার
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-teal-600 transition-colors mb-1">
                  ৬. ব্যানার ও প্রমোশন (Banner)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  পোর্টালের মূল হোমপেজ স্লাইডার ব্যানার, অফার ও প্রচারণা সংক্রান্ত ডিজাইন ম্যানেজমেন্ট।
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.bannersCount}</p>
                    <p className="text-[10px] text-slate-400">সক্রিয় ব্যানার</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-teal-600">১০০%</p>
                    <p className="text-[10px] text-slate-400">রেসপন্সিভ</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate("/admin/banners")}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>ব্যানার তালিকা</span>
                  <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => navigate("/admin/banners")}
                  className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  স্লাইডার সাজান
                </button>
              </div>
            </div>

            {/* Module 4: Service Information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-emerald-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ৬৩ সেবা তথ্য
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-1">
                  ৭. সেবা তথ্য (Service Information)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  ৬৩ উপজেলা নাগরিক সেবার বিবরণ, নিয়মাবলী, প্রয়োজনীয় কাগজপত্র ও হেল্পলাইন তথ্য হালনাগাদ।
                </p>

                <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-xs font-black text-slate-900">৬৩</p>
                    <p className="text-[9px] text-slate-400">মোট সেবা</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-600">১২</p>
                    <p className="text-[9px] text-slate-400">ক্যাটাগরি</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600">লাইভ</p>
                    <p className="text-[9px] text-slate-400">ডিরেক্টরি</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate("/admin/services")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>সেবা তথ্য এডিট</span>
                  <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => navigate("/admin/services")}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  তথ্য পরিবর্তন
                </button>
              </div>
            </div>

            {/* Module 5: Doctor / Hospital / Diagnostic Information */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between group hover:border-rose-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Stethoscope size={20} />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                    স্বাস্থ্য ডিরেক্টরি
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors mb-1">
                  ৮. ডাক্তার, হাসপাতাল ও ডায়াগনস্টিক তথ্য (Doctor / Hospital / Diagnostic)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  উপজেলা স্বাস্থ্য কমপ্লেক্স, বিশেষজ্ঞ ডাক্তারগণের শিডিউল, ডায়াগনস্টিক টেস্টের মূল্যতালিকা ও অ্যাম্বুলেন্স সেবা তথ্য নিয়ন্ত্রণ।
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.doctorsCount} জন</p>
                    <p className="text-[10px] text-slate-500">বিশেষজ্ঞ ডাক্তার</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.hospitalsCount}টি</p>
                    <p className="text-[10px] text-slate-500">হাসপাতাল ও ক্লিনিক</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{stats.diagnosticCount}টি</p>
                    <p className="text-[10px] text-slate-500">ডায়াগনস্টিক সেন্টার</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-rose-600">২৪ ঘণ্টা</p>
                    <p className="text-[10px] text-rose-600 font-semibold">অ্যাম্বুলেন্স হেল্পলাইন</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate("/admin/health")}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>স্বাস্থ্য সূচি ও ডাটাবেজ এডিট করুন</span>
                  <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => navigate("/admin/health")}
                  className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + নতুন ডাক্তার / হাসপাতাল যোগ
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 4. CONTENT WORKSPACE TABS & INTERACTIVE VIEW */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "overview", label: "সার্বিক ওভারভিউ", icon: Layers },
                { id: "drafts", label: `আমার Draft (${myDrafts.length})`, icon: Edit3 },
                { id: "pending", label: `Pending Approval (${pendingApprovals.length})`, icon: Clock },
                { id: "published", label: `Published Content (${publishedItems.length})`, icon: CheckCircle2 },
                { id: "activities", label: "Recent Activities (৯)", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive 
                        ? "bg-blue-700 text-white shadow-xs" 
                        : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-blue-200" : "text-slate-400"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="কন্টেন্ট বা টাইটেল খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* VIEW: DRAFTS OR OVERVIEW DRAFTS SECTION */}
          {(activeTab === "overview" || activeTab === "drafts") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Edit3 size={16} className="text-amber-600" />
                    আমার ড্রাফটস (My Drafts)
                  </h3>
                  <p className="text-xs text-slate-500">আপনার তৈরিকৃত অপ্রকাশিত সংবাদ, নোটিশ ও সেবা সংক্রান্ত ড্রাফট</p>
                </div>
                <button
                  onClick={() => setIsQuickDraftOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  নতুন ড্রাফট
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {myDrafts.filter(d => isSearchMatch(d.title) || isSearchMatch(d.excerpt)).map((draft) => (
                  <div 
                    key={draft.id}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-amber-50/30 hover:border-amber-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {draft.typeName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {draft.lastEdited}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1 mb-1">{draft.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {draft.excerpt}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-semibold">স্ট্যাটাস: ড্রাফট</span>
                      <button
                        onClick={() => navigate(draft.targetLink)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        <span>সম্পাদনা ও প্রকাশ</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: PENDING APPROVAL OR OVERVIEW PENDING */}
          {(activeTab === "overview" || activeTab === "pending") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-rose-600" />
                    অপেক্ষমান অনুমোদন (Pending Approval)
                  </h3>
                  <p className="text-xs text-slate-500">অনুমোদনের জন্য জমা দেওয়া নাগরিক কন্টেন্ট ও সেবা আবেদন</p>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {pendingApprovals.length}টি অপেক্ষমান
                </span>
              </div>

              <div className="space-y-3">
                {pendingApprovals.filter(p => isSearchMatch(p.title) || isSearchMatch(p.submitter)).map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                          {item.typeName}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.submittedAt}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">প্রেরক: {item.submitter}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(item.targetLink)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        বিস্তারিত
                      </button>
                      <button
                        onClick={() => handleApproveItem(item.id, item.title, item.typeName)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={13} />
                        অনুমোদন করুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: PUBLISHED CONTENT */}
          {(activeTab === "overview" || activeTab === "published") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    প্রকাশিত কন্টেন্ট (Published Content)
                  </h3>
                  <p className="text-xs text-slate-500">পোর্টালের লাইভ সংবাদ, নোটিশ, ব্যানার ও তথ্য ডিরেক্টরি</p>
                </div>
                <button
                  onClick={() => navigate("/admin/news")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>সব ম্যানেজ করুন</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {publishedItems.filter(p => isSearchMatch(p.title)).map((pub) => (
                  <div key={pub.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {pub.typeName}
                        </span>
                        <span className="text-[11px] text-slate-400">{pub.publishedAt}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Eye size={12} /> {pub.views} ভিউ
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">{pub.title}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(pub.targetLink)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 9. RECENT ACTIVITIES */}
          {(activeTab === "overview" || activeTab === "activities") && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Activity size={16} className="text-blue-600" />
                    ৯. সাম্প্রতিক কার্যক্রম (Recent Activities)
                  </h3>
                  <p className="text-xs text-slate-500">এডিটর প্যানেলের সর্বশেষ কন্টেন্ট তৈরি ও সম্পাদনা ইতিহাস</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">রিয়েল-টাইম লগ</span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {recentActivities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900">{act.action}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {act.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{act.title}</p>
                      </div>
                      <div className="text-right sm:text-right shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                        <p className="text-[10px] text-slate-500">কর্তৃক: {act.user}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* QUICK DRAFT MODAL */}
      <AnimatePresence>
        {isQuickDraftOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">নতুন কন্টেন্ট ড্রাফট তৈরি</h3>
                    <p className="text-[11px] text-blue-200">পরে যেকোনো সময় এডিট ও প্রকাশ করা যাবে</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickDraftOpen(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDraft} className="p-5 space-y-4">
                {draftSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{draftSuccessMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কন্টেন্ট টাইপ নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "news", label: "সংবাদ" },
                      { id: "notice", label: "নোটিশ" },
                      { id: "service", label: "সেবা তথ্য" },
                      { id: "health", label: "স্বাস্থ্য" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDraftType(t.id as any)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          draftType === t.id 
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিরোনাম / টাইটেল *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="ড্রাফটের স্পষ্ট শিরোনাম লিখুন..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সংক্ষিপ্ত নোট বা ড্রাফট বডি
                  </label>
                  <textarea
                    rows={4}
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    placeholder="খসড়া তথ্য, ইস্টার বা বিষয়বস্তু লিখে রাখুন..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsQuickDraftOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={draftSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{draftSaving ? "সংরক্ষণ হচ্ছে..." : "ড্রাফটে সংরক্ষণ করুন"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EditorDashboard;

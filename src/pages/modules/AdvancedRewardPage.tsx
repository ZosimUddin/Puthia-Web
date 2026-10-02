import React, { useState, useEffect } from "react";
import { 
  Award, Trophy, Star, ShieldCheck, TrendingUp, AlertTriangle, 
  CheckCircle2, Flame, UserCheck, BarChart3, Users, Clock, 
  Lock, Check, AlertOctagon, Sparkles, Filter, ShieldAlert,
  Zap, Flag, Activity, Ban, CheckSquare, Layers, Target, RefreshCw
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export interface UserRewardProfile {
  userId: string;
  name: string;
  stars: number;
  contributionScore: number;
  verifiedContributionsCount: number;
  level: number;
  levelTitle: string;
  badge: string;
  badgeIcon: string;
  rank: number;
  spamScore: number; // 0 to 100
  isFlagged: boolean;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  starsReward: number;
  unlockedAt?: string;
  progress: number; // 0-100%
}

export interface FraudDetectionRule {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Warning" | "Strict";
  actionTaken: string;
}

const MOCK_LEADERBOARD: UserRewardProfile[] = [
  {
    userId: "u1",
    name: "শরিফুল ইসলাম",
    stars: 2450,
    contributionScore: 98,
    verifiedContributionsCount: 124,
    level: 5,
    levelTitle: "স্মার্ট নাগরিক প্রমেথিউস",
    badge: "👑 রয়াল পুঠিয়া লিজেন্ড",
    badgeIcon: "👑",
    rank: 1,
    spamScore: 2,
    isFlagged: false,
    achievements: [
      { id: "a1", title: "তথ্যপ্রযুক্তি পথিকৃৎ", description: "৫০টির বেশি নির্ভুল এন্ট্রি সাবমিট করেছেন", icon: "🚀", starsReward: 200, progress: 100, unlockedAt: "২০২৬-০১-১৫" },
      { id: "a2", title: "জরুরি সেবার বন্ধুমহল", description: "১০ জন রক্তদাতা তথ্য সরাসরি ভেরিফাই করেছেন", icon: "🩸", starsReward: 150, progress: 100, unlockedAt: "২০২৬-০২-০২" }
    ]
  },
  {
    userId: "u2",
    name: "নাজমুল হুদা",
    stars: 1890,
    contributionScore: 92,
    verifiedContributionsCount: 88,
    level: 4,
    levelTitle: "মাস্টার নাগরিক",
    badge: "🛡️ ভেরিফাইড এডিটর",
    badgeIcon: "🛡️",
    rank: 2,
    spamScore: 4,
    isFlagged: false,
    achievements: [
      { id: "a3", title: "ছবি ও স্পট ভেরিফায়ার", description: "২৫টি ঐতিহাসিক ও দর্শনীয় স্থানের অরিজিনাল ছবি যুক্ত করেছেন", icon: "📸", starsReward: 120, progress: 100, unlockedAt: "২০২৬-০২-১০" }
    ]
  },
  {
    userId: "u3",
    name: "ফাতেমা তুজ জোহরা",
    stars: 1540,
    contributionScore: 89,
    verifiedContributionsCount: 65,
    level: 3,
    levelTitle: "সিনিয়র ভলান্টিয়ার",
    badge: "⭐ গোল্ড নাগরিক",
    badgeIcon: "⭐",
    rank: 3,
    spamScore: 0,
    isFlagged: false,
    achievements: [
      { id: "a4", title: "কমিউনিটি হিরো", description: "স্থানীয় শিক্ষা তথ্য হালনাগাদ করেছেন", icon: "🎓", starsReward: 100, progress: 100, unlockedAt: "২০২৬-০২-১৫" }
    ]
  },
  {
    userId: "u4",
    name: "আব্দুল করিম",
    stars: 980,
    contributionScore: 78,
    verifiedContributionsCount: 42,
    level: 2,
    levelTitle: "সক্রিয় নাগরিক",
    badge: "🌱 সিলভার ইউজার",
    badgeIcon: "🌱",
    rank: 4,
    spamScore: 12,
    isFlagged: false,
    achievements: []
  },
  {
    userId: "u5",
    name: "রফিকুল ইসলাম (সন্দেহভাজন স্প্যামার)",
    stars: 420,
    contributionScore: 30,
    verifiedContributionsCount: 5,
    level: 1,
    levelTitle: "নবীন ব্যবহারকারী",
    badge: "⚠️ ফ্ল্যাগড প্রোফাইল",
    badgeIcon: "⚠️",
    rank: 5,
    spamScore: 88,
    isFlagged: true,
    achievements: []
  }
];

const FRAUD_RULES: FraudDetectionRule[] = [
  { id: "r1", name: "তথ্য সাবমিশন ও অনুমোদন রুলস", description: "প্রতি ১টি সঠিক ও ভেরিফাইড তথ্য সাবমিশনের জন্য এবং অ্যাডমিন কর্তৃক অনুমোদিত হলে ৫ ইস্টার পাবেন।", status: "Active", actionTaken: "Auto-Award on Approval" },
  { id: "r2", name: "ডুপ্লিকেট কন্টেন্ট অ্যান্ড ইমেজ হ্যাশিং", description: "অন্যের ছবি বা পূর্বে জমাকৃত হুবহু টেক্সট কপি মারলে ০ ইস্টার ও ফ্ল্যাগিং", status: "Strict", actionTaken: "Zero Star Penalty" },
  { id: "r3", name: "সেলফ-লাইকিং অ্যান্ড বট সার্কেল ডিটেকশন", description: "একই ডিভাইস বা আইপি থেকে ইস্টার ফার্মিং করলে একাউন্ট ব্যান হবে", status: "Strict", actionTaken: "Ip-Range Block" },
  { id: "r4", name: "ম্যানুয়াল অ্যাডমিন অ্যাডজুডিকেশন (Verified Stars)", description: "অ্যাডমিন অনুমোদন ব্যতিত কোনো ইস্টার যোগ হবে না (মোবাইল রিচার্জ ব্যতিত)", status: "Active", actionTaken: "Held for Approval" },
];

export default function AdvancedRewardPage() {
  const { userProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"leaderboard" | "my_points" | "fraud_rules" | "admin_panel">("leaderboard");
  const [leaderboard, setLeaderboard] = useState<UserRewardProfile[]>(MOCK_LEADERBOARD);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<UserRewardProfile | null>(null);

  // Admin Controls State
  const [rateLimitMax, setRateLimitMax] = useState(5);
  const [spamThreshold, setSpamThreshold] = useState(70);
  const [autoDeductStarsOnSpam, setAutoDeductStarsOnSpam] = useState(true);
  const [requireAdminForHighReward, setRequireAdminForHighReward] = useState(true);

  const filteredLeaderboard = leaderboard.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.levelTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myProfile = leaderboard.find(u => u.userId === user?.uid) || {
    userId: user?.uid || "current_user",
    name: userProfile?.name || user?.displayName || userProfile?.email || "সম্মানিত ব্যবহারকারী",
    stars: 650,
    contributionScore: 85,
    verifiedContributionsCount: 28,
    level: 3,
    levelTitle: "সক্রিয় মেম্বার",
    badge: "⭐ গোল্ড নাগরিক",
    badgeIcon: "⭐",
    rank: 6,
    spamScore: 5,
    isFlagged: false,
    achievements: [
      { id: "my_a1", title: "প্রথম সঠিক তথ্য সাবমিশন", description: "১টি ভেরিফাইড প্রতিষ্ঠান তথ্য প্রদান করেছেন", icon: "✨", starsReward: 5, progress: 100, unlockedAt: "২০২৬-০২-১২" },
      { id: "my_a2", title: "সমাজসেবা চ্যাম্পিয়ন", description: "রক্তদান নেটওয়ার্কে নিজের নাম আপডেট করেছেন", icon: "🩸", starsReward: 5, progress: 100, unlockedAt: "২০২৬-০২-১৪" },
      { id: "my_a3", title: "তথ্য দাতা (প্রোগ্রেস)", description: "১০টি স্থানীয় তথ্য নির্ভুলভাবে প্রদান করুন", icon: "💬", starsReward: 50, progress: 60 }
    ]
  };

  const handlePenaltyUser = (userId: string) => {
    setLeaderboard(prev => prev.map(u => {
      if (u.userId === userId) {
        toast.error(`${u.name}-এর একাউন্টে ৫০ ইস্টার স্প্যাম পেনাল্টি দেওয়া হয়েছে!`);
        return {
          ...u,
          stars: Math.max(0, u.stars - 50),
          spamScore: Math.min(100, u.spamScore + 25),
          isFlagged: true
        };
      }
      return u;
    }));
  };

  const handleVerifyUser = (userId: string) => {
    setLeaderboard(prev => prev.map(u => {
      if (u.userId === userId) {
        toast.success(`${u.name}-এর প্রোফাইল অ্যাডমিন কর্তৃক ভেরিফাইড ও ক্লিন ঘোষিত হয়েছে!`);
        return {
          ...u,
          spamScore: 0,
          isFlagged: false,
          verifiedContributionsCount: u.verifiedContributionsCount + 5,
          stars: u.stars + 100
        };
      }
      return u;
    }));
  };

  const handleSaveAdminRules = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("অ্যান্টি-স্প্যাম এবং অ্যাডমিন রিওয়ার্ড রুলস আপডেট হয়েছে!");
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn text-slate-800">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-[32px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <Trophy size={320} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-400 animate-pulse" /> Advanced Citizens Gamification & Anti-Spam Engine
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            অ্যাডভান্সড রিওয়ার্ড, লিডারবোর্ড ও অ্যান্টি-স্প্যাম সিস্টেম 🏆
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            পুঠিয়ার উন্নয়ন ও তথ্য সমৃদ্ধকরণে নাগরিকদের সততা ও কন্ট্রিবিউশন মূল্যায়নের প্লাটফর্ম। এখানে কোনো স্প্যাম বা ফেইক ইস্টার অর্জনের সুযোগ নেই—প্রতিটি ইস্টার ভেরিফাইড!
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { id: "leaderboard", label: "কমিউনিটি লিডারবোর্ড (Leaderboard)", icon: Trophy },
          { id: "my_points", label: "আমার ইস্টার ও অর্জন (My Rewards)", icon: Star },
          { id: "fraud_rules", label: "অ্যান্টি-স্প্যাম ও ফ্রড রুলস (Anti-Spam Shield)", icon: ShieldAlert },
          { id: "admin_panel", label: "অ্যাডমিন রুলস কন্ট্রোল (Admin Panel)", icon: Lock, adminOnly: true }
        ].map((tab) => {
          if (tab.adminOnly && userProfile?.role !== "admin" && userProfile?.role !== "super_admin") {
            return null;
          }
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#006a4e] text-white shadow-lg shadow-emerald-900/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Top 3 Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((top, idx) => (
              <div 
                key={top.userId}
                className={`relative bg-gradient-to-br rounded-3xl p-6 border shadow-md flex flex-col justify-between ${
                  idx === 0 ? "from-amber-500/10 via-amber-50/50 to-white border-amber-300" :
                  idx === 1 ? "from-slate-200/40 via-slate-50 to-white border-slate-300" :
                  "from-amber-800/10 via-amber-50/20 to-white border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-base ${
                    idx === 0 ? "bg-amber-500 text-white shadow-md shadow-amber-500/30" :
                    idx === 1 ? "bg-slate-400 text-white" : "bg-amber-700 text-white"
                  }`}>
                    #{top.rank}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-slate-700">
                    {top.badge}
                  </span>
                </div>

                <div className="my-4 space-y-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    {top.name}
                    {!top.isFlagged && <ShieldCheck size={18} className="text-emerald-600" />}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">{top.levelTitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">মোট ইস্টার</span>
                    <span className="text-base font-black text-emerald-800">{top.stars} Stars</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">ভেরিফাইড তথ্য</span>
                    <span className="text-sm font-black text-slate-700">{top.verifiedContributionsCount}টি</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">পুঠিয়া নাগরিক লিডারবোর্ড ও কন্ট্রিবিউশন র‍্যাংক</h3>
                <p className="text-xs text-slate-500 font-bold">প্রকৃত ও নির্ভরযোগ্য তথ্যদাতাদের তালিকা</p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা ব্যাজ সার্চ করুন..."
                  className="w-full px-4 py-2 pl-9 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100/70 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">র‍্যাংক</th>
                    <th className="py-3 px-4">নাগরিক ও ব্যাজ</th>
                    <th className="py-3 px-4 text-center">লেভেল</th>
                    <th className="py-3 px-4 text-center">কন্ট্রিবিউশন স্কোর</th>
                    <th className="py-3 px-4 text-center">ভেরিফাইড তথ্য</th>
                    <th className="py-3 px-4 text-right">ইস্টার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  {filteredLeaderboard.map((user) => (
                    <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">#{user.rank}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">{user.name}</span>
                          {user.isFlagged ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-black flex items-center gap-1">
                              <AlertTriangle size={10} /> ফ্ল্যাগড
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-black">
                              {user.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block font-normal">{user.levelTitle}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 text-[11px] font-black">
                          Lvl {user.level}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Activity size={14} className="text-emerald-600" />
                          <span className="font-black text-emerald-800">{user.contributionScore}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-black border border-emerald-200">
                          {user.verifiedContributionsCount}টি ভেরিফাইড
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-sm text-emerald-900">
                        {user.stars} Stars
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY POINTS & ACHIEVEMENTS */}
      {activeTab === "my_points" && (
        <div className="space-y-6">
          {/* User Score Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase">
                  Verified Citizen Status
                </span>
                <h2 className="text-2xl font-black text-slate-900">{myProfile.name}</h2>
                <p className="text-xs text-slate-500 font-bold">
                  বর্তমান র‍্যাংক: <span className="text-emerald-700 font-black">#{myProfile.rank}</span> | টাইটেল: <span className="text-slate-800 font-black">{myProfile.levelTitle}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center min-w-[120px]">
                  <span className="text-[11px] text-emerald-700 font-black uppercase block">মোট অর্জিত ইস্টার</span>
                  <span className="text-3xl font-black text-[#006a4e]">{myProfile.stars}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center min-w-[120px]">
                  <span className="text-[11px] text-amber-700 font-black uppercase block">স্প্যাম স্কোর</span>
                  <span className="text-3xl font-black text-amber-800">{myProfile.spamScore}%</span>
                </div>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">লেভেল {myProfile.level} প্রোগ্রেস</span>
                <span className="text-emerald-700">Level {myProfile.level + 1}-এ যেতে আরও ৩৫০ ইস্টার প্রয়োজন</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#006a4e] rounded-full transition-all" style={{ width: "65%" }}></div>
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                আপনার ব্যাজ ও অর্জনের তালিকা (Achievements & Badges)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myProfile.achievements.map((ach) => (
                  <div key={ach.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{ach.icon}</span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        +{ach.starsReward} ইস্টার
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{ach.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{ach.description}</p>
                    </div>

                    {ach.progress === 100 ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                        ✓ আনলকড: {ach.unlockedAt}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-500">
                          <span>প্রোগ্রেস</span>
                          <span>{ach.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${ach.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FRAUD RULES & ANTI-SPAM */}
      {activeTab === "fraud_rules" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-rose-600" size={20} />
              অ্যান্টি-স্প্যাম এবং ফ্রড ডিটেকশন পলিসি (Anti-Spam & Fraud Engine)
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              ইস্টার ফার্মিং, ভুয়া রিভিউ ও ডুপ্লিকেট তথ্য রোধে আমাদের স্বয়ংক্রিয় অ্যালগরিদম নিয়মাবলি
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAUD_RULES.map((rule) => (
              <div key={rule.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">{rule.name}</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    rule.status === "Strict" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {rule.status} Rule
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">{rule.description}</p>
                <div className="pt-2 text-[11px] font-black text-slate-500 flex items-center gap-1">
                  <span>⚡ সিস্টেম অ্যাকশন:</span>
                  <span className="text-slate-800">{rule.actionTaken}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
            <h4 className="font-black flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-600" />
              সতর্কবার্তা:
            </h4>
            <p className="leading-relaxed font-bold">
              ভুল বা বিভ্রান্তিকর তথ্য দিয়ে ইস্টার বাড়ানোর চেষ্টা করলে একাউন্টের অর্জিত ইস্টার কেটে নেওয়া হবে এবং প্রোফাইলটি চিরতরে ফ্ল্যাগড করা হবে।
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN CONTROL PANEL */}
      {activeTab === "admin_panel" && (userProfile?.role === "admin" || userProfile?.role === "super_admin") && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-emerald-700" />
                অ্যাডমিন রিওয়ার্ড রুলস ও স্প্যাম প্রিভেনশন সেটিংস
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                ইস্টার রুলস পরিবর্তন করুন এবং স্প্যামার ইউজারদের ম্যানুয়ালি পরিচালনা করুন
              </p>
            </div>

            <form onSubmit={handleSaveAdminRules} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  প্রতি মিনিটে সর্বোচ্চ সাবমিশন লিমিট (Rate Limit per minute)
                </label>
                <input
                  type="number"
                  value={rateLimitMax}
                  onChange={(e) => setRateLimitMax(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  অটো-ফ্ল্যাগিং স্প্যাম স্কোর লিমিট (%)
                </label>
                <input
                  type="number"
                  value={spamThreshold}
                  onChange={(e) => setSpamThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDeductStarsOnSpam}
                    onChange={(e) => setAutoDeductStarsOnSpam(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    স্প্যাম শনাক্ত হলে ইস্টার স্বয়ংক্রিয়ভাবে মাইনাস পেনাল্টি কাটুন
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireAdminForHighReward}
                    onChange={(e) => setRequireAdminForHighReward(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    ১০০ ইস্টারের উপরের কোনো পুরস্কার বা রিওয়ার্ড প্রদান করার আগে অ্যাডমিন ম্যানুয়াল ভেরিফিকেশন বাধ্যতামূলক করুন
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#006a4e] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  রুলস ও অ্যান্টি-স্প্যাম সেটিংস সেভ করুন
                </button>
              </div>
            </form>
          </div>

          {/* User Audit Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-black text-slate-900">ইউজার ইস্টার অডিট ও স্প্যাম পেনাল্টি অ্যাকশন</h3>
            
            <div className="divide-y divide-slate-100">
              {leaderboard.map((usr) => (
                <div key={usr.userId} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-black text-slate-900">{usr.name}</span>
                    <span className="text-slate-500 font-bold ml-2">({usr.stars} Stars)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold">স্প্যাম স্কোর: {usr.spamScore}%</span>
                      {usr.isFlagged && <span className="text-[10px] font-black text-rose-600">🚨 ফ্ল্যাগড ইউজার</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyUser(usr.userId)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-black transition-colors cursor-pointer"
                    >
                      ✓ ভেরিফাই করুন
                    </button>
                    <button
                      onClick={() => handlePenaltyUser(usr.userId)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-black transition-colors cursor-pointer"
                    >
                      -৫০ পেনাল্টি
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

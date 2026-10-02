import React, { useState, useEffect } from "react";
import { 
  User, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Globe, 
  Award, 
  Clock, 
  FileCheck, 
  Flag, 
  ChevronDown, 
  Sparkles, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Ban, 
  Activity, 
  Check, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Share2, 
  Shield, 
  HeartHandshake, 
  Plus, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { UserProfile, useAuth } from "../../contexts/AuthContext";
import { 
  getProfilePrivacy, 
  updateProfilePrivacy, 
  getFeaturedItems, 
  addFeaturedItem, 
  removeFeaturedItem, 
  VerificationStatusType, 
  ProfilePrivacySettings, 
  FeaturedItem 
} from "../../services/profileBackendService";
import { fetchReports, updateReportStatus } from "../../services/adminService";
import { ModerationReport } from "../../types/admin";
import { toast } from "sonner";

export interface ExtendedUserProfile extends UserProfile {
  status?: 'active' | 'suspended' | 'banned';
  statusReason?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  featuredReason?: string;
  featuredOrder?: number;
  nidNumber?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  verificationStatus?: VerificationStatusType;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
}

export const ProfileSystemManagement: React.FC = () => {
  const { userProfile: currentUser } = useAuth();

  // Active Main Tab: 1. Profiles, 2. Connections (Friend/Follow), 3. Privacy, 4. Featured Citizens, 5. Verification Requests, 6. Reports & Violations
  const [activeTab, setActiveTab] = useState<
    "profiles" | "connections" | "privacy" | "featured" | "verifications" | "reports"
  >("profiles");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnion, setFilterUnion] = useState("all");

  // Modals
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Featured Modal State
  const [featuredModalUser, setFeaturedModalUser] = useState<ExtendedUserProfile | null>(null);
  const [featuredReasonInput, setFeaturedReasonInput] = useState("");

  // User Privacy View State
  const [userPrivacySettings, setUserPrivacySettings] = useState<ProfilePrivacySettings | null>(null);

  // User Featured Items
  const [userFeaturedItems, setUserFeaturedItems] = useState<FeaturedItem[]>([]);

  // Fetch All Users & Reports
  useEffect(() => {
    fetchUsersData();
    fetchReportsData();
  }, []);

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: ExtendedUserProfile[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          uid: d.id,
          ...data,
          status: data.status || (data.isBlocked ? 'banned' : 'active'),
          nidStatus: data.nidStatus || 'unverified',
          verificationStatus: data.verificationStatus || (data.nidStatus === 'verified' ? 'verified' : 'not_verified'),
          isFeatured: data.isFeatured === true,
          followersCount: data.followers?.length || data.followersCount || 0,
          followingCount: data.following?.length || data.followingCount || 0,
          friendsCount: data.friends?.length || data.friendsCount || 0,
        } as ExtendedUserProfile);
      });
      setUsers(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsData = async () => {
    try {
      const reportList = await fetchReports();
      // Filter for profile related reports
      setReports(reportList.filter(r => (r.contentType as string) === 'profile' || r.contentSnippet?.toLowerCase().includes('profile')));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    }
  };

  // Toggle Featured Citizen
  const handleToggleFeatured = async (u: ExtendedUserProfile) => {
    setActionLoading(true);
    try {
      const newStatus = !u.isFeatured;
      await updateDoc(doc(db, "users", u.uid), {
        isFeatured: newStatus,
        featuredReason: newStatus ? (featuredReasonInput.trim() || "পুঠিয়া উপজেলার বিশিষ্ট নাগরিক ও সমাজসেবক") : "",
        featuredAt: newStatus ? serverTimestamp() : null
      });

      setUsers(prev => prev.map(item => item.uid === u.uid ? {
        ...item,
        isFeatured: newStatus,
        featuredReason: newStatus ? (featuredReasonInput.trim() || "পুঠিয়া উপজেলার বিশিষ্ট নাগরিক ও সমাজসেবক") : ""
      } : item));

      toast.success(newStatus ? `${u.name} কে ফিচার্ড নাগরিক হিসেবে যুক্ত করা হয়েছে!` : `${u.name} কে ফিচার্ড তালিকা থেকে সরানো হয়েছে।`);
      setFeaturedModalUser(null);
      setFeaturedReasonInput("");
    } catch (err) {
      console.error("Featured toggle error:", err);
      toast.error("ফিচার্ড স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  // Verification Approval / Rejection
  const handleVerificationStatusChange = async (uid: string, newStatus: VerificationStatusType) => {
    setActionLoading(true);
    try {
      const isVerified = newStatus === 'verified';
      await updateDoc(doc(db, "users", uid), {
        verificationStatus: newStatus,
        nidStatus: isVerified ? 'verified' : 'unverified',
        isVerified: isVerified,
        verifiedAt: isVerified ? serverTimestamp() : null
      });

      setUsers(prev => prev.map(u => u.uid === uid ? {
        ...u,
        verificationStatus: newStatus,
        nidStatus: isVerified ? 'verified' : 'unverified',
        isVerified
      } : u));

      if (selectedUser?.uid === uid) {
        setSelectedUser(prev => prev ? {
          ...prev,
          verificationStatus: newStatus,
          nidStatus: isVerified ? 'verified' : 'unverified',
          isVerified
        } : null);
      }

      toast.success(`ভেরিফিকেশন স্ট্যাটাস '${newStatus === 'verified' ? 'যাচাইকৃত (Verified)' : 'বাতিল করা হয়েছে'}' করা হলো`);
    } catch (err) {
      console.error("Verification change error:", err);
      toast.error("ভেরিফিকেশন আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  // Report Resolution
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed', note?: string) => {
    try {
      await updateReportStatus(
        reportId, 
        status, 
        note || "অ্যাডমিন মডারেশন সম্পন্ন হয়েছে",
        currentUser?.uid || "system_admin",
        currentUser?.name || "সিস্টেম অ্যাডমিন",
        (currentUser?.role as any) || "super_admin"
      );
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      toast.success(`রিপোর্ট '${status === 'resolved' ? 'নিষ্পত্তি করা হয়েছে' : 'বাতিল করা হয়েছে'}'`);
    } catch (err) {
      toast.error("রিপোর্ট আপডেট করা সম্ভব হয়নি");
    }
  };

  // Load Privacy & Featured Items when selecting user
  const handleOpenUserDetail = async (u: ExtendedUserProfile) => {
    setSelectedUser(u);
    setShowDetailModal(true);
    
    // Fetch privacy
    try {
      const privacy = await getProfilePrivacy(u.uid);
      setUserPrivacySettings(privacy);
    } catch (e) {
      setUserPrivacySettings(null);
    }

    // Fetch featured items
    try {
      const items = await getFeaturedItems(u.uid);
      setUserFeaturedItems(items);
    } catch (e) {
      setUserFeaturedItems([]);
    }
  };

  // Derived collections
  const featuredUsersList = users.filter(u => u.isFeatured);
  const pendingVerificationList = users.filter(u => u.verificationStatus === 'pending' || u.nidStatus === 'pending');
  const verifiedUsersList = users.filter(u => u.isVerified || u.verificationStatus === 'verified' || u.nidStatus === 'verified');

  // Search filter
  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || 
      (u.name?.toLowerCase().includes(q)) || 
      (u.phone?.includes(q)) || 
      (u.email?.toLowerCase().includes(q)) ||
      (u.union?.toLowerCase().includes(q));

    const matchesUnion = filterUnion === "all" || u.union === filterUnion;
    return matchesSearch && matchesUnion;
  });

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-slate-800">
      
      {/* Header Banner - Cohesive Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden rounded-3xl border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <User size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white border border-white/20 rounded-full text-xs font-black mb-3">
              <User size={14} className="text-emerald-300" /> Citizen Social & Profile Hub
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              নাগরিক প্রোফাইল ও সোশ্যাল সিস্টেম (Profile Engine)
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm max-w-2xl font-bold leading-relaxed">
              প্রোফাইল তথ্য, ফ্রেন্ড/ফলো সোশ্যাল নেটওয়ার্ক, প্রাইভেসি কন্ট্রোল, ফিচার্ড সিটিজেনস ও NID ভেরিফিকেশন ম্যানেজমেন্ট
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="px-4 py-2.5 bg-white/15 border border-white/20 rounded-2xl text-xs font-black text-white flex items-center gap-2 backdrop-blur-xs">
              <Users size={16} className="text-emerald-300" />
              <span>মোট নাগরিক: {users.length}</span>
            </div>
            <div className="px-4 py-2.5 bg-amber-500/30 border border-amber-400/40 rounded-2xl text-xs font-black text-amber-200 flex items-center gap-2 backdrop-blur-xs">
              <Star size={16} className="text-amber-300" />
              <span>ফিচার্ড নাগরিক: {featuredUsersList.length}</span>
            </div>
            <div className="px-4 py-2.5 bg-blue-500/30 border border-blue-400/40 rounded-2xl text-xs font-black text-blue-200 flex items-center gap-2 backdrop-blur-xs">
              <ShieldCheck size={16} className="text-blue-300" />
              <span>যাচাইকৃত: {verifiedUsersList.length}</span>
            </div>
          </div>
        </div>

        {/* Main 6 Tab Navigation - Full Width Responsive Bar */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 mt-8 pt-6 border-t border-white/15 scrollbar-none">
          {[
            { id: 'profiles', label: '👤 নাগরিক প্রোফাইল তালিকা', count: users.length, icon: Users },
            { id: 'connections', label: '🤝 ফ্রেন্ডস ও ফলো সোশ্যাল গ্রাফ', icon: HeartHandshake },
            { id: 'privacy', label: '🔒 প্রাইভেসি নিয়ন্ত্রণ কেন্দ্র', icon: Lock },
            { id: 'featured', label: '🌟 ফিচার্ড সিটিজেনস (Star Citizens)', count: featuredUsersList.length, icon: Star },
            { id: 'verifications', label: '📄 NID ভেরিফিকেশন রিকোয়েস্ট', count: pendingVerificationList.length, icon: ShieldCheck, badgeColor: 'bg-amber-500' },
            { id: 'reports', label: '🚩 প্রোফাইল রিপোর্ট ও মডারেশন', count: reports.filter(r => r.status === 'new').length, icon: Flag, badgeColor: 'bg-rose-500' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer shrink-0 min-w-max ${
                  isActive 
                    ? 'bg-white text-emerald-900 shadow-md font-black' 
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-800' : 'text-emerald-100'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-emerald-950 text-white' : (tab.badgeColor || 'bg-white/20 text-white')
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6">

      {/* SEARCH & FILTERS BAR */}
      {(activeTab === 'profiles' || activeTab === 'connections' || activeTab === 'featured') && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন নম্বর, ইমেইল অথবা ইউনিয়ন দিয়ে সার্চ করুন..." 
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 transition-all" 
            />
          </div>
          <div className="md:col-span-4 relative">
            <select 
              value={filterUnion}
              onChange={(e) => setFilterUnion(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">সকল ইউনিয়ন / এলাকা</option>
              <option value="পুঠিয়া পৌরসভা">পুঠিয়া পৌরসভা</option>
              <option value="বানেশ্বর ইউনিয়ন">বানেশ্বর ইউনিয়ন</option>
              <option value="বেলপুকুরিয়া ইউনিয়ন">বেলপুকুরিয়া ইউনিয়ন</option>
              <option value="ভালুকগাছী ইউনিয়ন">ভালুকগাছী ইউনিয়ন</option>
              <option value="শিলমাড়িয়া ইউনিয়ন">শিলমাড়িয়া ইউনিয়ন</option>
              <option value="জিউপাড়া ইউনিয়ন">জিউপাড়া ইউনিয়ন</option>
            </select>
            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* TAB 1: PROFILES MANAGEMENT LIST */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-3 text-[#006a4e]" size={36} />
              <p className="font-bold text-xs">নাগরিক প্রোফাইল ডেটা লোড হচ্ছে...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              কোনো প্রোফাইল পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div 
                  key={u.uid}
                  className="bg-white border border-slate-200/80 hover:border-emerald-300 rounded-3xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Banner / Avatar */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xl flex items-center justify-center overflow-hidden shadow-sm">
                            {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0) || "U"}
                          </div>
                          {u.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="যাচাইকৃত নাগরিক">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.isFeatured && <span title="ফিচার্ড নাগরিক"><Star size={14} className="text-amber-500 fill-amber-500" /></span>}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-400">{u.union || "পুঠিয়া"}, রাজশাহী</p>
                          <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {u.role === 'super_admin' ? '👑 সুপার অ্যাডমিন' : u.role === 'admin' ? '🛡️ অ্যাডমিন' : u.role === 'moderator' ? '👮 মডারেটর' : '👤 নাগরিক'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Contacts */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl mb-4 space-y-2 text-xs font-bold text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold text-[11px]">ফোন:</span>
                        <span>{u.phone || "তথ্য নেই"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold text-[11px]">ইস্টার / ট্রাস্ট:</span>
                        <span className="font-black text-emerald-700">{u.stars || 0} PTS</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">কানেকশনস:</span>
                        <span className="font-black text-slate-800">{u.friendsCount} বন্ধু • {u.followersCount} ফলোয়ার</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenUserDetail(u)}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Eye size={14} /> প্রোফাইল দেখুন
                    </button>
                    <button
                      onClick={() => {
                        setFeaturedModalUser(u);
                        setFeaturedReasonInput(u.featuredReason || "");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                        u.isFeatured 
                          ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' 
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                      }`}
                      title="ফিচার্ড নাগরিক স্ট্যাটাস পরিবর্তন"
                    >
                      <Star size={16} className={u.isFeatured ? 'fill-amber-600' : ''} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTIONS & SOCIAL GRAPH */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                <HeartHandshake className="text-emerald-400" size={22} />
                <span>পুঠিয়া নাগরিক সোশ্যাল নেটওয়ার্ক ও ফ্রেন্ডস গ্রাফ</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                নাগরিকদের মধ্যকার সোশ্যাল রিলেশনশিপ, ফ্রেন্ড রিকোয়েস্ট নেটওয়ার্ক এবং ফলোয়ার গ্রাফ মনিটর ও বিশ্লেষণ করুন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div key={u.uid} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center overflow-hidden">
                    {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{u.name}</h4>
                    <p className="text-[11px] font-bold text-slate-400">{u.union || "পুঠিয়া"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400">বন্ধুগন</p>
                    <p className="text-sm font-black text-emerald-700">{u.friendsCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">ফলোয়ার</p>
                    <p className="text-sm font-black text-blue-700">{u.followersCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400">ফলোয়িং</p>
                    <p className="text-sm font-black text-slate-800">{u.followingCount || 0}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenUserDetail(u)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black cursor-pointer transition-all"
                >
                  সোশ্যাল গ্রাফ বিস্তারিত
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY CONTROL CENTER */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white rounded-3xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                <Lock className="text-emerald-300" size={22} />
                <span>প্রাইভেসি নিয়ন্ত্রণ কেন্দ্র ও ডেটা নিরাপত্তা গাইডলাইন</span>
              </h3>
              <p className="text-xs text-emerald-100 max-w-2xl">
                স্মার্ট পুঠিয়া প্ল্যাটফর্মে নাগরিকদের ব্যক্তিগত ফোন নম্বর, ইমেইল, জন্মতারিখ এবং অ্যাক্টিভিটি ভিজিবিলিটি সেটিংস নিয়ন্ত্রণের স্ট্যান্ডার্ড নীতিমালা।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-emerald-50 text-[#006a4e] rounded-2xl flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <h4 className="text-sm font-black text-slate-900">পাবলিক মোড (Everyone)</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                যে সকল নাগরিক তাদের ব্যবসায়িক ও জরুরি সেবা সহজ করতে ফোন নম্বর ও ইমেইল উন্মুক্ত রাখতে চান।
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <h4 className="text-sm font-black text-slate-900">শুধুমাত্র বন্ধুগন (Friends Only)</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                শুধু মাত্র পারস্পরিক যুক্ত বন্ধুদের জন্য ফোন নম্বর ও ব্যক্তিগত কন্টেন্ট দৃশ্যমান থাকে।
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-bold">
                <Lock size={20} />
              </div>
              <h4 className="text-sm font-black text-slate-900">সম্পূর্ণ প্রাইভেট (Only Me)</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                ব্যক্তিগত তথ্য সম্পূর্ণরূপে সুরক্ষিত থাকে এবং সর্বসাধারণের কাছে গোপন থাকে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEATURED CITIZENS MANAGEMENT */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                <Star size={20} className="text-amber-600 fill-amber-600" />
                <span>ফিচার্ড সিটিজেনস (Star Citizens of Puthia)</span>
              </h3>
              <p className="text-xs font-bold text-amber-700 mt-1">
                পুঠিয়া উপজেলার বিশিষ্ট সমাজসেবক, কৃতি সন্তান, সর্বোচ্চ ইস্টারধারী ও স্টার নাগরিকদের তালিকা যা পোর্টালের হোমপেজে হাইলাইট করা হয়।
              </p>
            </div>
          </div>

          {featuredUsersList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              এখনো কোনো নাগরিককে ফিচার্ড হিসেবে চিহ্নিত করা হয়নি। তালিকা থেকে স্টার আইকনে ক্লিক করে ফিচার্ড করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredUsersList.map((u) => (
                <div key={u.uid} className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center overflow-hidden shadow-md">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1">
                        <span>{u.name}</span>
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">{u.union || "পুঠিয়া"}</p>
                      <p className="text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        🌟 স্টার সিটিজেন
                      </p>
                    </div>
                  </div>

                  {u.featuredReason && (
                    <p className="text-xs text-slate-700 font-bold bg-white p-3 rounded-2xl border border-amber-100 italic">
                      "{u.featuredReason}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFeatured(u)}
                      className="flex-1 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-black cursor-pointer transition-all"
                    >
                      আনফিচার্ড করুন
                    </button>
                    <button
                      onClick={() => handleOpenUserDetail(u)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-slate-800 transition-all"
                    >
                      প্রোফাইল
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VERIFICATION REQUESTS */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
            <h3 className="text-base font-black text-blue-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" />
              <span>নাগরিক NID ভেরিফিকেশন ও পরিচয় যাচাই হাব</span>
            </h3>
            <p className="text-xs font-bold text-blue-700 mt-1">
              নাগরিকদের জমাকৃত জাতীয় পরিচয়পত্র (NID) রিভিউ করুন এবং "যাচাইকৃত নাগরিক" এর ব্লু/গ্রিন ব্যাজ অনুমোদন দিন।
            </p>
          </div>

          {pendingVerificationList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              কোনো পেন্ডিং NID ভেরিফিকেশন আবেদন নেই।
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerificationList.map((u) => (
                <div key={u.uid} className="bg-white border border-blue-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center overflow-hidden">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{u.name}</h4>
                      <p className="text-xs font-bold text-slate-500">{u.phone || "ফোন নেই"} • {u.union || "পুঠিয়া"}</p>
                      <p className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        ⏳ পেন্ডিং ভেরিফিকেশন রিভিউ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleVerificationStatusChange(u.uid, 'verified')}
                      disabled={actionLoading}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      অনুমোদন ও ব্যাজ প্রদান
                    </button>
                    <button
                      onClick={() => handleVerificationStatusChange(u.uid, 'not_verified')}
                      disabled={actionLoading}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-black rounded-xl cursor-pointer transition-all"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROFILE REPORTS & MODERATION */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
            <h3 className="text-base font-black text-rose-900 flex items-center gap-2">
              <Flag size={20} className="text-rose-600" />
              <span>ইউজার ও প্রোফাইল রিপোর্ট মডারেশন ক্যু</span>
            </h3>
            <p className="text-xs font-bold text-rose-700 mt-1">
              ফেক অ্যাকাউন্ট, স্প্যাম বা আপত্তিকর আচরণের বিরুদ্ধে নাগরিকদের জমাকৃত রিপোর্ট রিভিউ ও ব্যবস্থা নিন।
            </p>
          </div>

          {reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              কোনো প্রোফাইল রিপোর্ট পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="bg-white border border-rose-100 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      r.priority === 'critical' || r.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.priority?.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('bn-BD') : "সাম্প্রতিক"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      রিপোর্টকৃত বিষয়: <span className="text-rose-600">{r.reportedUserName || r.contentSnippet || "নাগরিক প্রোফাইল"}</span>
                    </h4>
                    <p className="text-xs text-slate-600 font-bold mt-1">কারণ: {r.reason || "ভুয়া তথ্য / পলিসি লঙ্ঘন"}</p>
                    {r.contentSnippet && <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl mt-2">{r.contentSnippet}</p>}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'resolved')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 cursor-pointer transition-all"
                    >
                      সমাধান চিহ্নিত করুন
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'dismissed')}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 cursor-pointer transition-all"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl overflow-hidden">
                    {selectedUser.photoURL ? <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" /> : selectedUser.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-400">UID: {selectedUser.uid}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors cursor-pointer"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-bold text-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">মোবাইল নম্বর</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.phone || "তথ্য নেই"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">ইউনিয়ন / গ্রাম</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{selectedUser.union || "পুঠিয়া"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">সোশ্যাল ট্রাস্ট স্কোর</p>
                    <p className="text-sm font-bold text-emerald-700 mt-1">{selectedUser.stars || 0} PTS</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">ভেরিফিকেশন</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      {selectedUser.isVerified ? "✅ যাচাইকৃত নাগরিক" : "❌ আনভেরিফাইড"}
                    </p>
                  </div>
                </div>

                {userPrivacySettings && (
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                    <h4 className="text-xs font-black text-slate-900 uppercase">প্রাইভেসি মোড সংক্ষেপ</h4>
                    <p className="text-xs text-slate-600">প্রোফাইল ভিজিবিলিটি: <span className="font-black text-slate-900">{userPrivacySettings.profileVisibility}</span></p>
                    <p className="text-xs text-slate-600">ফ্রেন্ড রিকোয়েস্ট অনুমতি: <span className="font-black text-slate-900">{userPrivacySettings.whoCanFriendRequest}</span></p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-slate-800"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEATURED MODAL REASON INPUT */}
      <AnimatePresence>
        {featuredModalUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-600">
                <Star size={24} className="fill-amber-500" />
                <h3 className="text-base font-black text-slate-900">
                  {featuredModalUser.isFeatured ? 'ফিচার্ড নাগরিক স্ট্যাটাস পরিবর্তন' : 'নতুন ফিচার্ড নাগরিক যোগ করুন'}
                </h3>
              </div>

              <p className="text-xs text-slate-600 font-bold">
                নাগরিক <span className="font-black text-slate-900">{featuredModalUser.name}</span>-কে পোর্টালের হোমপেজ ও সিটিজেন ডিরেক্টরিতে ফিচার্ড হিসেবে প্রদর্শনের জন্য বিশেষ ট্যাগলাইন দিন।
              </p>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">বিশেষ পরিচিতি / ট্যাগলাইন</label>
                <input
                  type="text"
                  value={featuredReasonInput}
                  onChange={(e) => setFeaturedReasonInput(e.target.value)}
                  placeholder="যেমন: পুঠিয়া উপজেলার কৃতি শিক্ষক ও বিশিষ্ট সমাজসেবক"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleToggleFeatured(featuredModalUser)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "আপডেট হচ্ছে..." : (featuredModalUser.isFeatured ? "সংরক্ষণ করুন" : "ফিচার্ড নাগরিক হিসেবে যোগ করুন")}
                </button>
                <button
                  onClick={() => setFeaturedModalUser(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
};

export default ProfileSystemManagement;

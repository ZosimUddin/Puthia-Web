import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Users, 
  Search, 
  Plus, 
  ChevronDown, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  XCircle,
  Award,
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Eye,
  Shield,
  FileCheck,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllUsers, updateUserRole, deleteUserAccount, createUserAccount } from "../../api";
import { UserProfile } from "../../contexts/AuthContext";
import { toast } from "sonner";

type UserStatus = 'active' | 'suspended' | 'banned';

export interface ExtendedUserProfile extends UserProfile {
  status?: UserStatus;
  statusReason?: string;
  nidNumber?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  activityLog?: Array<{ id: string; action: string; time: string; details?: string }>;
}

const UserManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');
  const urlTab = searchParams.get('tab');

  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "suspended" | "banned" | "pending_kyc" | "verified_kyc">("all");

  useEffect(() => {
    if (urlRole) {
      setFilterRole(urlRole);
    }
    if (urlTab && ["all", "active", "suspended", "banned", "pending_kyc", "verified_kyc"].includes(urlTab)) {
      setFilterTab(urlTab as any);
    }
  }, [urlRole, urlTab]);
  
  const [selectedUser, setSelectedUser] = useState<ExtendedUserProfile | null>(null);
  const [profileTab, setProfileTab] = useState<"info" | "status" | "kyc" | "activity">("info");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Status Change Reason Modal State
  const [statusModalUser, setStatusModalUser] = useState<ExtendedUserProfile | null>(null);
  const [targetStatus, setTargetStatus] = useState<UserStatus>('active');
  const [statusReasonInput, setStatusReasonInput] = useState("");

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as UserProfile['role'],
    union: "পুঠিয়া পৌরসভা",
    village: "",
    nidStatus: "verified" as UserProfile['nidStatus']
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Normalize statuses if missing
      const normalizedData = data.map((u: any) => ({
        ...u,
        status: u.status || (u.isBlocked ? 'banned' : 'active'),
        nidStatus: u.nidStatus || 'unverified',
        activityLog: u.activityLog || [
          { id: '1', action: 'সিস্টেমে সাইন-ইন', time: 'আজ ১০:১৫ AM', details: 'ওয়েব ব্রাউজার' },
          { id: '2', action: 'প্রোফাইল আপডেট', time: 'গতকাল ৩:৩০ PM', details: 'ফোন নম্বর ও এনআইডি প্রদান' },
          { id: '3', action: 'নাগরিক সেবা আবেদন', time: '২ দিন আগে', details: 'চারিত্রিক সনদপত্র আবেদন' }
        ]
      }));
      setUsers(normalizedData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      if (error?.code === "resource-exhausted" || error?.message?.includes("quota")) {
        toast.error("ডাটাবেজ লিমিট শেষ হওয়ার কারণে ইউজার তালিকা লোড করা যায়নি।");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (uid: string, role: UserProfile['role']) => {
    setActionLoading(true);
    try {
      await updateUserRole(uid, { role });
      await fetchUsers();
      if (selectedUser?.uid === uid) {
        setSelectedUser(prev => prev ? { ...prev, role } : null);
      }
    } catch (error) {
      alert("রোল আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;
    setActionLoading(true);
    const isBlocked = targetStatus === 'banned' || targetStatus === 'suspended';
    try {
      await updateUserRole(statusModalUser.uid, { 
        status: targetStatus,
        isBlocked,
        statusReason: statusReasonInput.trim() || undefined
      });
      await fetchUsers();
      if (selectedUser?.uid === statusModalUser.uid) {
        setSelectedUser(prev => prev ? { 
          ...prev, 
          status: targetStatus, 
          isBlocked, 
          statusReason: statusReasonInput.trim() || undefined 
        } : null);
      }
      setStatusModalUser(null);
      setStatusReasonInput("");
      alert(`ইউজার স্ট্যাটাস '${targetStatus === 'active' ? 'সক্রিয়' : targetStatus === 'suspended' ? 'স্থগিত' : 'নিষিদ্ধ'}' করা হয়েছে।`);
    } catch (error) {
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateVerification = async (uid: string, status: UserProfile['nidStatus']) => {
    setActionLoading(true);
    try {
      await updateUserRole(uid, { nidStatus: status });
      await fetchUsers();
      if (selectedUser?.uid === uid) {
        setSelectedUser(prev => prev ? { ...prev, nidStatus: status } : null);
      }
      alert(`KYC ভেরিফিকেশন স্ট্যাটাস '${status === 'verified' ? 'ভেরিফাইড' : status === 'pending' ? 'পেন্ডিং' : 'আনভেরিফাইড'}' করা হয়েছে।`);
    } catch (error) {
      alert("ভেরিফিকেশন আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই অ্যাকাউন্টটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।")) return;
    setActionLoading(true);
    try {
      await deleteUserAccount(uid);
      await fetchUsers();
      if (selectedUser?.uid === uid) {
        setShowProfileModal(false);
        setSelectedUser(null);
      }
      alert("অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim()) {
      alert("ইউজারের নাম দিন");
      return;
    }
    setActionLoading(true);
    try {
      await createUserAccount({
        ...newUserData,
        status: 'active',
        isBlocked: false
      });
      await fetchUsers();
      setShowAddModal(false);
      setNewUserData({
        name: "",
        email: "",
        phone: "",
        role: "user",
        union: "পুঠিয়া পৌরসভা",
        village: "",
        nidStatus: "verified"
      });
      alert("নতুন ইউজার সফলভাবে তৈরি করা হয়েছে!");
    } catch (err) {
      console.error(err);
      alert("ইউজার তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter calculations
  const totalUsersCount = users.length;
  const activeCount = users.filter(u => u.status === 'active' || (!u.status && !u.isBlocked)).length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const bannedCount = users.filter(u => u.status === 'banned' || u.isBlocked).length;
  const pendingKycCount = users.filter(u => u.nidStatus === 'pending').length;
  const verifiedKycCount = users.filter(u => u.nidStatus === 'verified').length;

  const filteredUsers = users.filter(u => {
    const userStatus = u.status || (u.isBlocked ? 'banned' : 'active');
    
    // Tab filter
    let matchesTab = true;
    if (filterTab === 'active') matchesTab = userStatus === 'active';
    else if (filterTab === 'suspended') matchesTab = userStatus === 'suspended';
    else if (filterTab === 'banned') matchesTab = userStatus === 'banned' || u.isBlocked === true;
    else if (filterTab === 'pending_kyc') matchesTab = u.nidStatus === 'pending';
    else if (filterTab === 'verified_kyc') matchesTab = u.nidStatus === 'verified';

    // Role filter
    const matchesRole = filterRole === "all" || u.role === filterRole;

    // Search filter
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || 
      (u.name?.toLowerCase().includes(q)) || 
      (u.phone?.includes(q)) || 
      (u.email?.toLowerCase().includes(q)) ||
      (u.union?.toLowerCase().includes(q)) ||
      (u.village?.toLowerCase().includes(q));

    return matchesTab && matchesRole && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-slate-800">
      
      {/* Header Banner - Full Width Edge-to-Edge */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border-b border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Users size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black mb-3">
              <ShieldCheck size={14} className="text-emerald-400" /> Citizen Account & RBAC Engine
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              ইউজার অ্যান্ড রোল ম্যানেজমেন্ট (User Control)
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-bold leading-relaxed">
              সকল নিবন্ধিত নাগরিক, অ্যাডমিন, এডিটর ও মডারেটরের তালিকা ও অ্যাক্টিভিটি কনট্রোল
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#007A5E] hover:bg-[#00634B] text-white px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/50 cursor-pointer shrink-0 active:scale-95"
          >
            <Plus size={18} /> নতুন ইউজার / কর্মকর্তা তৈরি করুন
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6">

        {/* Top Vital Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            onClick={() => setFilterTab('all')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">মোট ইউজার</p>
            <h3 className="text-xl font-black mt-1">{totalUsersCount}</h3>
          </div>
          <div 
            onClick={() => setFilterTab('active')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'active' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">🟢 সক্রিয় (Active)</p>
            <h3 className="text-xl font-black mt-1">{activeCount}</h3>
          </div>
          <div 
            onClick={() => setFilterTab('suspended')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'suspended' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white text-amber-800 border-amber-100 hover:bg-amber-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">⏸️ স্থগিত (Suspended)</p>
            <h3 className="text-xl font-black mt-1">{suspendedCount}</h3>
          </div>
          <div 
            onClick={() => setFilterTab('banned')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'banned' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-rose-800 border-rose-100 hover:bg-rose-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">🚫 নিষিদ্ধ (Banned)</p>
            <h3 className="text-xl font-black mt-1">{bannedCount}</h3>
          </div>
          <div 
            onClick={() => setFilterTab('pending_kyc')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'pending_kyc' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-800 border-blue-100 hover:bg-blue-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">⏳ KYC পেন্ডিং</p>
            <h3 className="text-xl font-black mt-1">{pendingKycCount}</h3>
          </div>
          <div 
            onClick={() => setFilterTab('verified_kyc')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${filterTab === 'verified_kyc' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-indigo-800 border-indigo-100 hover:bg-indigo-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider opacity-70">✅ KYC ভেরিফাইড</p>
            <h3 className="text-xl font-black mt-1">{verifiedKycCount}</h3>
          </div>
        </div>

        {/* Navigation Filter Tabs */}
        <div className="w-full flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-100 no-scrollbar">
          {[
            { id: 'all', label: 'সকল ইউজার (All)' },
            { id: 'active', label: '🟢 সক্রিয় ইউজার' },
            { id: 'suspended', label: '⏸️ স্থগিত ইউজার' },
            { id: 'banned', label: '🚫 নিষিদ্ধ ইউজার' },
            { id: 'pending_kyc', label: '⏳ পেন্ডিং ভেরিফিকেশন' },
            { id: 'verified_kyc', label: '✅ ভেরিফাইড ইউজার' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer shrink-0 flex-shrink-0 ${
                filterTab === t.id 
                ? 'bg-emerald-700 text-white shadow-sm' 
                : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/80 border border-emerald-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

      {/* Search & Role Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ইউজারের নাম, ফোন নম্বর, ইমেইল বা ইউনিয়ন দিয়ে খুঁজুন..." 
            className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all" 
          />
        </div>
        <div className="md:col-span-4 relative">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full appearance-none bg-[#F8FAFC] border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-black text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">সকল ভূমিকা (All Roles)</option>
            <option value="super_admin">👑 সুপার অ্যাডমিন (Super Admin)</option>
            <option value="admin">🛡️ সিস্টেম অ্যাডমিন (Admin)</option>
            <option value="moderator">👮 মডারেটর (Moderator)</option>
            <option value="editor">📝 কন্টেন্ট এডিটর (Editor)</option>
            <option value="support">🎧 সাপোর্ট টিম (Support)</option>
            <option value="user">👤 সাধারণ নাগরিক (User)</option>
          </select>
          <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* User Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 rounded-xl mb-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
        <div className="col-span-4">ব্যবহারকারী তথ্য</div>
        <div className="col-span-3">যোগাযোগ ও স্থান</div>
        <div className="col-span-2">রোল ও স্ট্যাটাস</div>
        <div className="col-span-2">ভেরিফিকেশন (KYC)</div>
        <div className="col-span-1 text-right">অ্যাকশন</div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4 text-emerald-600" size={32} />
            <p className="font-bold">ইউজার ডেটা লোড হচ্ছে...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            কোন ব্যবহারকারী পাওয়া যায়নি
          </div>
        ) : (
          filteredUsers.map((u) => {
            const currentStatus: UserStatus = u.status || (u.isBlocked ? 'banned' : 'active');
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={u.uid} 
                className={`bg-white border rounded-[32px] p-5 hover:shadow-md transition-all duration-300 ${
                  currentStatus === 'banned' ? 'border-rose-200 bg-rose-50/10' :
                  currentStatus === 'suspended' ? 'border-amber-200 bg-amber-50/10' :
                  'border-gray-100 hover:border-emerald-200'
                }`}
              >
                <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-6">
                  
                  {/* User Basic Info */}
                  <div className="col-span-4 flex items-center gap-4 w-full">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-inner ${
                        currentStatus === 'banned' ? 'bg-rose-500' :
                        currentStatus === 'suspended' ? 'bg-amber-500' :
                        'bg-emerald-600'
                      }`}>
                        {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0) || "U"}
                      </div>
                      {currentStatus === 'banned' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center text-white" title="Banned">
                          <Ban size={12} />
                        </div>
                      )}
                      {currentStatus === 'suspended' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Suspended">
                          <AlertTriangle size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-900 mb-0.5 flex items-center gap-2">
                        {u.name}
                        {u.nidStatus === 'verified' && <span title="KYC Verified"><CheckCircle2 size={15} className="text-blue-500" /></span>}
                      </h4>
                      <p className="text-[11px] font-bold text-gray-400">{u.email || "ইমেইল যুক্ত করা হয়নি"}</p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                          u.role === 'super_admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          u.role === 'moderator' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          u.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {u.role === 'super_admin' ? '👑 সুপার অ্যাডমিন' : 
                           u.role === 'admin' ? '🛡️ সিস্টেম অ্যাডমিন' : 
                           u.role === 'moderator' ? '👮 মডারেটর' : 
                           u.role === 'editor' ? '📝 কন্টেন্ট এডিটর' : 
                           u.role === 'support' ? '🎧 সাপোর্ট কর্মকর্তা' : '👤 নাগরিক'}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          currentStatus === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          currentStatus === 'suspended' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {currentStatus === 'active' ? '🟢 সক্রিয়' :
                           currentStatus === 'suspended' ? '⏸️ স্থগিত' : '🚫 নিষিদ্ধ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Address */}
                  <div className="col-span-3 w-full flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
                      <Phone size={14} className="text-gray-400" />
                      <span>{u.phone || "ফোন দেওয়া নেই"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{u.village || 'পুঠিয়া'}, {u.union || 'পুঠিয়া পৌরসভা'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Calendar size={14} className="text-gray-300" />
                      <span>যোগদান: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : "তথ্য নেই"}</span>
                    </div>
                  </div>

                  {/* Role Selector & Quick Status Toggle */}
                  <div className="col-span-2 w-full flex flex-col gap-2">
                    <div className="relative">
                      <select 
                        value={u.role || 'user'}
                        onChange={(e) => handleUpdateRole(u.uid, e.target.value as any)}
                        disabled={actionLoading}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-[10px] font-black text-gray-700 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="user">👤 সাধারণ নাগরিক</option>
                        <option value="moderator">👮 মডারেটর</option>
                        <option value="editor">📝 এডিটর</option>
                        <option value="support">🎧 সাপোর্ট</option>
                        <option value="admin">🛡️ সিস্টেম অ্যাডমিন</option>
                        <option value="super_admin">👑 সুপার অ্যাডমিন</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          setStatusModalUser(u);
                          setTargetStatus(currentStatus === 'active' ? 'suspended' : 'active');
                          setStatusReasonInput(u.statusReason || "");
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 transition-all ${
                          currentStatus === 'suspended' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                        title="স্থগিত/সক্রিয় করুন"
                      >
                        {currentStatus === 'suspended' ? <UserCheck size={11} /> : <AlertTriangle size={11} />}
                        {currentStatus === 'suspended' ? 'সক্রিয়' : 'স্থগিত'}
                      </button>

                      <button 
                        onClick={() => {
                          setStatusModalUser(u);
                          setTargetStatus(currentStatus === 'banned' ? 'active' : 'banned');
                          setStatusReasonInput(u.statusReason || "");
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1 transition-all ${
                          currentStatus === 'banned' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                        title="ব্লক/আনব্লক"
                      >
                        {currentStatus === 'banned' ? <UserCheck size={11} /> : <Ban size={11} />}
                        {currentStatus === 'banned' ? 'আনব্যান' : 'ব্যান'}
                      </button>
                    </div>
                  </div>

                  {/* KYC Verification Status */}
                  <div className="col-span-2 w-full flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        u.nidStatus === 'verified' ? 'bg-blue-50 text-blue-600' :
                        u.nidStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {u.nidStatus === 'verified' ? <ShieldCheck size={18} /> : 
                         u.nidStatus === 'pending' ? <ShieldAlert size={18} /> : 
                         <Award size={18} />}
                      </div>
                      <div className="leading-tight">
                        <p className="text-[10px] font-black text-gray-600">KYC Verification</p>
                        <p className={`text-[9px] font-bold ${
                          u.nidStatus === 'verified' ? 'text-blue-600' :
                          u.nidStatus === 'pending' ? 'text-amber-600 font-black' :
                          'text-gray-400'
                        }`}>
                          {u.nidStatus === 'verified' ? '✅ ভেরিফাইড' : 
                           u.nidStatus === 'pending' ? '⏳ পেন্ডিং রিভিউ' : '❌ আনভেরিফাইড'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleUpdateVerification(u.uid, 'verified')}
                        disabled={actionLoading || u.nidStatus === 'verified'}
                        className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg flex items-center justify-center transition-all text-[10px] font-bold disabled:opacity-30 cursor-pointer"
                        title="ভেরিফাই অনুমোদন করুন"
                      >
                        <CheckCircle2 size={13} className="mr-1" /> অনুমোদন
                      </button>
                      <button 
                        onClick={() => handleUpdateVerification(u.uid, 'unverified')}
                        disabled={actionLoading || u.nidStatus === 'unverified'}
                        className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg flex items-center justify-center transition-all text-[10px] font-bold disabled:opacity-30 cursor-pointer"
                        title="বাতিল করুন"
                      >
                        <XCircle size={13} className="mr-1" /> বাতিল
                      </button>
                    </div>
                  </div>

                  {/* Actions & Detail View */}
                  <div className="col-span-1 w-full lg:w-auto flex lg:flex-col items-center justify-end gap-2">
                    <button 
                      onClick={() => { 
                        setSelectedUser(u); 
                        setProfileTab('info');
                        setShowProfileModal(true); 
                      }}
                      className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-1 font-bold text-xs cursor-pointer"
                      title="বিস্তারিত প্রোফাইল দেখুন"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                      title="অ্যাকাউন্ট ডিলিট করুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>

      </div>

      {/* Comprehensive User Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
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
                  onClick={() => setShowProfileModal(false)} 
                  className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors cursor-pointer"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Profile Sub Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-2 overflow-x-auto">
                {[
                  { id: 'info', label: '👤 প্রোফাইল তথ্য', icon: User },
                  { id: 'status', label: '🛡️ স্ট্যাটাস ও নিয়ন্ত্রণ', icon: Shield },
                  { id: 'kyc', label: '📄 KYC ভেরিফিকেশন', icon: FileCheck },
                  { id: 'activity', label: '⚡ অ্যাক্টিভিটি হিস্ট্রি', icon: Activity },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setProfileTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-t-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        profileTab === tab.id
                        ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {profileTab === 'info' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase">ফোন নম্বর</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedUser.phone || "তথ্য নেই"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase">ইমেইল ঠিকানা</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedUser.email || "তথ্য নেই"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase">ইউনিয়ন / পৌরসভা</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedUser.union || "পুঠিয়া"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase">গ্রাম / ওয়ার্ড</p>
                        <p className="text-sm font-bold text-gray-800 mt-1">{selectedUser.village || "পুঠিয়া"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-600 uppercase">ইউজার রোল বা সিস্টেম ভূমিকা পরিবর্তন</label>
                      <select 
                        value={selectedUser.role || "user"}
                        onChange={(e) => handleUpdateRole(selectedUser.uid, e.target.value as any)}
                        className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm font-black text-gray-800 focus:outline-none cursor-pointer"
                      >
                        <option value="user">👤 সাধারণ নাগরিক (User)</option>
                        <option value="moderator">👮 মডারেটর (Moderator)</option>
                        <option value="editor">📝 কন্টেন্ট এডিটর (Editor)</option>
                        <option value="support">🎧 সাপোর্ট টিম (Support)</option>
                        <option value="admin">🛡️ সিস্টেম অ্যাডমিন (Admin)</option>
                        <option value="super_admin">👑 সুপার অ্যাডমিন (Super Admin)</option>
                      </select>
                    </div>

                    {/* Admin Permission Grid */}
                    {['admin', 'editor', 'staff', 'super_admin'].includes(selectedUser.role || '') && (
                      <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                        <h5 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-wider">অ্যাডমিন অনুমতিপত্র (System Permissions)</h5>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'manage_users', label: 'ইউজার ও রোল কন্ট্রোল' },
                            { id: 'manage_notices', label: 'সংবাদ ও জরুরি নোটিশ' },
                            { id: 'manage_business', label: 'ব্যবসা ও ডিরেক্টরি' },
                            { id: 'manage_ads', label: 'বিজ্ঞাপন ও ব্যানার' },
                            { id: 'manage_settings', label: 'সিস্টেম সেটিংস পরিবর্তন' },
                          ].map(perm => (
                            <label key={perm.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-300">
                              <input 
                                type="checkbox" 
                                checked={selectedUser.permissions?.includes(perm.id) || selectedUser.role === 'super_admin'}
                                disabled={selectedUser.role === 'super_admin'}
                                onChange={async (e) => {
                                  const currentPerms = selectedUser.permissions || [];
                                  const newPerms = e.target.checked 
                                    ? [...currentPerms, perm.id]
                                    : currentPerms.filter(p => p !== perm.id);
                                  
                                  setSelectedUser({ ...selectedUser, permissions: newPerms });
                                  await updateUserRole(selectedUser.uid, { permissions: newPerms });
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                              />
                              <span className="text-xs font-bold text-gray-800">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {profileTab === 'status' && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                      <h4 className="text-xs font-black text-slate-700 uppercase mb-2">বর্তমান অ্যাকাউন্ট স্ট্যাটাস</h4>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${
                          (selectedUser.status || (selectedUser.isBlocked ? 'banned' : 'active')) === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          selectedUser.status === 'suspended' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {(selectedUser.status || (selectedUser.isBlocked ? 'banned' : 'active')) === 'active' ? '🟢 সক্রিয় (Active)' :
                           selectedUser.status === 'suspended' ? '⏸️ স্থগিত (Suspended)' : '🚫 নিষিদ্ধ (Banned)'}
                        </span>
                      </div>
                      {selectedUser.statusReason && (
                        <p className="text-xs text-rose-600 font-bold mt-3 bg-white p-3 rounded-xl border border-rose-100">
                          কারণ: {selectedUser.statusReason}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-700 uppercase">স্ট্যাটাস পরিবর্তন করুন</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => {
                            setStatusModalUser(selectedUser);
                            setTargetStatus('active');
                            setStatusReasonInput(selectedUser.statusReason || "");
                          }}
                          className="py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-black text-xs hover:bg-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck size={16} /> সক্রিয় করুন
                        </button>
                        <button
                          onClick={() => {
                            setStatusModalUser(selectedUser);
                            setTargetStatus('suspended');
                            setStatusReasonInput(selectedUser.statusReason || "");
                          }}
                          className="py-3 px-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl font-black text-xs hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle size={16} /> স্থগিত করুন
                        </button>
                        <button
                          onClick={() => {
                            setStatusModalUser(selectedUser);
                            setTargetStatus('banned');
                            setStatusReasonInput(selectedUser.statusReason || "");
                          }}
                          className="py-3 px-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-black text-xs hover:bg-rose-100 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Ban size={16} /> ব্যান করুন
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'kyc' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase">KYC স্ট্যাটাস</p>
                        <h4 className="text-sm font-black text-blue-900 mt-0.5">
                          {selectedUser.nidStatus === 'verified' ? '✅ অ্যাকাউন্ট ভেরিফাইড (NID Verified)' :
                           selectedUser.nidStatus === 'pending' ? '⏳ ভেরিফিকেশন আবেদন জমা পড়েছে' : '❌ ভেরিফাইড নয়'}
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateVerification(selectedUser.uid, 'verified')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => handleUpdateVerification(selectedUser.uid, 'unverified')}
                          className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3 border border-gray-100">
                      <p className="text-xs font-black text-gray-700">জাতীয় পরিচয়পত্র / ডকুমেন্ট নমুনা (NID Simulation)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                          <FileText size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-[11px] font-bold text-gray-600">NID সামনের অংশ</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                          <FileText size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-[11px] font-bold text-gray-600">NID পিছনের অংশ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'activity' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-700 uppercase">ইউজার অ্যাক্টিভিটি টাইমলাইন (Audit Feed)</h4>
                    <div className="space-y-3">
                      {(selectedUser.activityLog || []).map((log, index) => (
                        <div key={index} className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Activity size={14} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-black text-gray-800">{log.action}</h5>
                              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {log.time}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-[11px] text-gray-500 font-bold mt-1">{log.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Reason & Change Confirmation Modal */}
      <AnimatePresence>
        {statusModalUser && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 mb-4 text-rose-600">
                <AlertTriangle size={24} />
                <h3 className="text-base font-black text-gray-900">
                  ইউজার স্ট্যাটাস পরিবর্তন: <span className="underline">{targetStatus === 'active' ? 'সক্রিয়' : targetStatus === 'suspended' ? 'স্থগিত' : 'নিষিদ্ধ (Banned)'}</span>
                </h3>
              </div>

              <p className="text-xs text-gray-600 font-bold mb-4">
                ব্যবহারকারী <span className="font-black text-slate-900">{statusModalUser.name}</span>-এর স্ট্যাটাস পরিবর্তন করা হচ্ছে।
              </p>

              <form onSubmit={handleConfirmStatusChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">কারণ বা নোট (ঐচ্ছিক)</label>
                  <textarea
                    rows={3}
                    value={statusReasonInput}
                    onChange={(e) => setStatusReasonInput(e.target.value)}
                    placeholder="যেমন: কমিউনিটি গাইডলাইন ভঙ্গের কারণে ৭ দিন স্থগিত করা হলো..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "আপডেট হচ্ছে..." : "পরিবর্তন নিশ্চিত করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusModalUser(null)}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-amber-400" />
                  <h3 className="text-lg font-black">নতুন ইউজার বা কর্মকর্তা অ্যাকাউন্ট যোগ করুন</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-1 hover:bg-white/10 rounded-full text-slate-300 transition-colors cursor-pointer"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="যেমন: মোঃ কামরুল ইসলাম"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">ইমেইল (ঐচ্ছিক)</label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                      placeholder="017xxxxxxxx"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">রোল ও অধিকার নির্ধারণ *</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="user">👤 সাধারণ নাগরিক</option>
                      <option value="moderator">👮 মডারেটর</option>
                      <option value="editor">📝 কন্টেন্ট এডিটর</option>
                      <option value="support">🎧 সাপোর্ট কর্মকর্তা</option>
                      <option value="admin">🛡️ সিস্টেম অ্যাডমিন</option>
                      <option value="super_admin">👑 সুপার অ্যাডমিন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">KYC ভেরিফিকেশন স্ট্যাটাস</label>
                    <select
                      value={newUserData.nidStatus}
                      onChange={(e) => setNewUserData({ ...newUserData, nidStatus: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="verified">✅ ভেরিফাইড (Verified)</option>
                      <option value="pending">⏳ পেন্ডিং (Pending)</option>
                      <option value="unverified">❌ আনভেরিফাইড (Unverified)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">ইউনিয়ন / এলাকা</label>
                    <select
                      value={newUserData.union}
                      onChange={(e) => setNewUserData({ ...newUserData, union: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="পুঠিয়া পৌরসভা">পুঠিয়া পৌরসভা</option>
                      <option value="বানেশ্বর ইউনিয়ন">বানেশ্বর ইউনিয়ন</option>
                      <option value="বেলপুকুরিয়া ইউনিয়ন">বেলপুকুরিয়া ইউনিয়ন</option>
                      <option value="ভালুকগাছী ইউনিয়ন">ভালুকগাছী ইউনিয়ন</option>
                      <option value="শিলমাড়িয়া ইউনিয়ন">শিলমাড়িয়া ইউনিয়ন</option>
                      <option value="জিউপাড়া ইউনিয়ন">জিউপাড়া ইউনিয়ন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-600 mb-1">গ্রাম / মহল্লা</label>
                    <input
                      type="text"
                      value={newUserData.village}
                      onChange={(e) => setNewUserData({ ...newUserData, village: e.target.value })}
                      placeholder="যেমন: গন্ডগোয়াল"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি নিশ্চিত করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    বাতিল
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

export default UserManagement;

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Crown, 
  ShieldCheck, 
  Edit3, 
  ShieldAlert, 
  Headphones, 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Key, 
  Settings, 
  UserCheck, 
  UserX, 
  FileText, 
  Store, 
  DollarSign, 
  Activity, 
  Eye, 
  Trash2, 
  Check, 
  X,
  Loader2,
  ChevronDown,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllUsers, updateUserRole, deleteUserAccount, createUserAccount } from "../../api";
import { UserProfile } from "../../contexts/AuthContext";
import SuperAdminAuditLogViewer from "./SuperAdminAuditLogViewer";

export interface AdminUser extends UserProfile {
  department?: string;
  assignedScope?: string;
  statusReason?: string;
  isSuspended?: boolean;
}

const PERMISSION_MODULES = [
  { id: 'users_control', label: 'ইউজার ও রোল কনট্রোল', desc: 'ব্যবহারকারীদের অ্যাক্সেস, ব্যান ও রোল পরিবর্তন' },
  { id: 'content_publishing', label: 'সংবাদ ও কন্টেন্ট পাবলিশিং', desc: 'সংবাদ, নোটিশ, ইভেন্ট তৈরি ও এডিট' },
  { id: 'business_moderation', label: 'ব্যবসা ও প্রোডাক্ট অনুমোদন', desc: 'শপ, মার্কেটপ্লেস ও ডিরেক্টরি রিভিউ' },
  { id: 'adda_moderation', label: 'আড্ডা ও কমেন্ট মডারেশন', desc: 'স্প্যাম ফিল্টারিং ও পোস্ট ফ্লাগড রিভিউ' },
  { id: 'monetization_finance', label: 'মনিটাইজেশন ও ওয়ালেট', desc: 'বিজ্ঞাপন, পেমেন্ট ও প্রমোশন আয়' },
  { id: 'system_settings', label: 'সিস্টেম কনফিগারেশন', desc: 'সাইট টাইটেল, API কি ও সেটিংস পরিবর্তন' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['users_control', 'content_publishing', 'business_moderation', 'adda_moderation', 'monetization_finance', 'system_settings'],
  admin: ['users_control', 'content_publishing', 'business_moderation', 'adda_moderation', 'monetization_finance'],
  editor: ['content_publishing'],
  moderator: ['adda_moderation', 'business_moderation'],
  support: ['users_control'],
};

export default function AdminManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRoleTab, setActiveRoleTab] = useState<string>("all_staff");
  const [viewTab, setViewTab] = useState<"staff_list" | "permission_matrix" | "audit_trail">("staff_list");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "editor" as UserProfile['role'],
    union: "পুঠিয়া পৌরসভা",
    department: "সাধারণ প্রশাসন",
    permissions: DEFAULT_ROLE_PERMISSIONS['editor']
  });

  const [suspendReason, setSuspendReason] = useState("");

  useEffect(() => {
    fetchAdminStaff();

    // Check URL params for direct audit log navigation
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tab') === 'audit_logs') {
      setViewTab('audit_trail');
    }
  }, []);

  const fetchAdminStaff = async () => {
    setLoading(true);
    try {
      const all = await getAllUsers();
      // Filter users who have admin/staff roles or custom permissions
      const staffList = all.filter((u: any) => 
        ['super_admin', 'admin', 'editor', 'moderator', 'support'].includes(u.role) ||
        (u.permissions && u.permissions.length > 0)
      ).map((u: any) => ({
        ...u,
        isSuspended: u.status === 'suspended' || u.isBlocked === true,
        permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || []
      }));
      setAdminUsers(staffList);
    } catch (err) {
      console.error("Failed to load admin staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role: role as UserProfile['role'],
      permissions: DEFAULT_ROLE_PERMISSIONS[role] || []
    });
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      const newPerms = exists 
        ? prev.permissions.filter(p => p !== permId) 
        : [...prev.permissions, permId];
      return { ...prev, permissions: newPerms };
    });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("কর্মকর্তার নাম লিখুন");
      return;
    }
    setActionLoading(true);
    try {
      await createUserAccount({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        union: formData.union,
        department: formData.department,
        permissions: formData.permissions,
        status: 'active',
        isBlocked: false,
        nidStatus: 'verified'
      });
      await fetchAdminStaff();
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "editor",
        union: "পুঠিয়া পৌরসভা",
        department: "সাধারণ প্রশাসন",
        permissions: DEFAULT_ROLE_PERMISSIONS['editor']
      });
      alert("নতুন কর্মকর্তা/অ্যাডমিন সফলভাবে নিয়োগ করা হয়েছে!");
    } catch (err) {
      alert("অ্যাডমিন তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setActionLoading(true);
    try {
      await updateUserRole(selectedAdmin.uid, {
        name: selectedAdmin.name,
        role: selectedAdmin.role,
        department: selectedAdmin.department,
        union: selectedAdmin.union,
        permissions: selectedAdmin.permissions
      });
      await fetchAdminStaff();
      setShowEditModal(false);
      setSelectedAdmin(null);
      alert("কর্মকর্তার বিবরণ ও পারমিশন আপডেট করা হয়েছে!");
    } catch (err) {
      alert("আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspendPrivilege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setActionLoading(true);
    const newStatus = selectedAdmin.isSuspended ? 'active' : 'suspended';
    try {
      await updateUserRole(selectedAdmin.uid, {
        status: newStatus,
        isBlocked: newStatus === 'suspended',
        statusReason: suspendReason.trim() || undefined
      });
      await fetchAdminStaff();
      setShowSuspendModal(false);
      setSelectedAdmin(null);
      setSuspendReason("");
      alert(`কর্মকর্তার পাওয়ার '${newStatus === 'active' ? 'পুনর্বহাল (Active)' : 'স্থগিত (Suspended)'}' করা হয়েছে।`);
    } catch (err) {
      alert("স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteToUser = async (admin: AdminUser) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${admin.name}-কে অ্যাডমিন টিম থেকে সরিয়ে সাধারণ নাগরিক ভূমিকায় রিলিজ করবেন?`)) return;
    setActionLoading(true);
    try {
      await updateUserRole(admin.uid, {
        role: 'user',
        permissions: [],
        department: undefined
      });
      await fetchAdminStaff();
      alert("কর্মকর্তাকে সাধারণ নাগরিক রোল-এ ফিরিয়ে দেওয়া হয়েছে।");
    } catch (err) {
      alert("প্রসেস করতে সমস্যা হয়েছে");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalStaff = adminUsers.length;
  const superAdminCount = adminUsers.filter(a => a.role === 'super_admin').length;
  const adminCount = adminUsers.filter(a => a.role === 'admin').length;
  const editorCount = adminUsers.filter(a => a.role === 'editor').length;
  const moderatorCount = adminUsers.filter(a => a.role === 'moderator').length;
  const suspendedCount = adminUsers.filter(a => a.isSuspended).length;

  const filteredStaff = adminUsers.filter(a => {
    // Role Tab Filter
    let matchesRole = true;
    if (activeRoleTab === 'super_admin') matchesRole = a.role === 'super_admin';
    else if (activeRoleTab === 'admin') matchesRole = a.role === 'admin';
    else if (activeRoleTab === 'editor') matchesRole = a.role === 'editor';
    else if (activeRoleTab === 'moderator') matchesRole = a.role === 'moderator';
    else if (activeRoleTab === 'support') matchesRole = a.role === 'support';
    else if (activeRoleTab === 'suspended') matchesRole = a.isSuspended === true;

    // Search
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || 
      a.name?.toLowerCase().includes(q) || 
      a.email?.toLowerCase().includes(q) || 
      a.phone?.includes(q) ||
      a.department?.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-slate-800">
      
      {/* Header Banner - Full Width Edge-to-Edge */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden border-b border-emerald-500/20">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Shield size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black mb-3">
              <Shield size={14} className="text-amber-400" /> Administrative Access Control
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">
              অ্যাডমিন ও রোল কন্ট্রোল হাব (Admin Management)
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-bold leading-relaxed">
              সুপার অ্যাডমিন, অ্যাডমিন, কন্টেন্ট এডিটর, মডারেটর ও সাপোর্ট টিম মেম্বারদের নিয়োগ ও পারমিশন কন্ট্রোল
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={() => setViewTab('staff_list')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs border transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs ${
                viewTab === 'staff_list' 
                  ? 'bg-white text-slate-900 border-white shadow-md' 
                  : 'border-white/20 hover:bg-white/10 text-white'
              }`}
            >
              <Users size={16} className={viewTab === 'staff_list' ? 'text-emerald-600' : 'text-emerald-400'} />
              <span>কর্মকর্তাদের তালিকা</span>
            </button>

            <button 
              onClick={() => setViewTab('permission_matrix')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs border transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs ${
                viewTab === 'permission_matrix' 
                  ? 'bg-white text-slate-900 border-white shadow-md' 
                  : 'border-white/20 hover:bg-white/10 text-white'
              }`}
            >
              <Key size={16} className={viewTab === 'permission_matrix' ? 'text-amber-600' : 'text-amber-400'} />
              <span>পারমিশন ম্যাট্রিক্স</span>
            </button>

            <button 
              onClick={() => setViewTab('audit_trail')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs border transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs ${
                viewTab === 'audit_trail' 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md' 
                  : 'border-amber-400/40 hover:bg-amber-400/10 text-amber-300'
              }`}
            >
              <History size={16} className={viewTab === 'audit_trail' ? 'text-slate-950' : 'text-amber-300'} />
              <span>সুপার অডিট ট্রেইল</span>
            </button>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#007A5E] hover:bg-[#00634B] text-white px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/50 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus size={18} /> নতুন কর্মকর্তা নিয়োগ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">

        {/* Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            onClick={() => setActiveRoleTab('all_staff')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'all_staff' ? 'bg-emerald-700 text-white border-emerald-700 shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">মোট কর্মকর্তা</p>
            <h3 className="text-xl font-black mt-1">{totalStaff} জন</h3>
          </div>
          <div 
            onClick={() => setActiveRoleTab('super_admin')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'super_admin' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">👑 সুপার অ্যাডমিন</p>
            <h3 className="text-xl font-black mt-1">{superAdminCount} জন</h3>
          </div>
          <div 
            onClick={() => setActiveRoleTab('admin')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'admin' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">🛡️ সিস্টেম অ্যাডমিন</p>
            <h3 className="text-xl font-black mt-1">{adminCount} জন</h3>
          </div>
          <div 
            onClick={() => setActiveRoleTab('editor')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'editor' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">📝 কন্টেন্ট এডিটর</p>
            <h3 className="text-xl font-black mt-1">{editorCount} জন</h3>
          </div>
          <div 
            onClick={() => setActiveRoleTab('moderator')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'moderator' ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">👮 মডারেটর</p>
            <h3 className="text-xl font-black mt-1">{moderatorCount} জন</h3>
          </div>
          <div 
            onClick={() => setActiveRoleTab('suspended')} 
            className={`p-4 rounded-3xl border cursor-pointer transition-all ${activeRoleTab === 'suspended' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-50 shadow-xs'}`}
          >
            <p className="text-[10px] font-black uppercase opacity-70">⏸️ সাময়িক স্থগিত</p>
            <h3 className="text-xl font-black mt-1">{suspendedCount} জন</h3>
          </div>
        </div>

      {viewTab === 'staff_list' ? (
        <>
          {/* Role Navigation Filters */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-gray-100 no-scrollbar">
            {[
              { id: 'all_staff', label: 'সকল কর্মকর্তা' },
              { id: 'super_admin', label: '👑 সুপার অ্যাডমিন' },
              { id: 'admin', label: '🛡️ সিস্টেম অ্যাডমিন' },
              { id: 'editor', label: '📝 কন্টেন্ট এডিটর' },
              { id: 'moderator', label: '👮 কমিউনিটি মডারেটর' },
              { id: 'support', label: '🎧 সাপোর্ট টিম' },
              { id: 'suspended', label: '⏸️ স্থগিত ইউজারস' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveRoleTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer shrink-0 flex-shrink-0 ${
                  activeRoleTab === tab.id 
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20 shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="কর্মকর্তার নাম, ইমেইল, ফোন নম্বর বা ডিপার্টমেন্ট দিয়ে খুঁজুন..." 
              className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-emerald-500 transition-all" 
            />
          </div>

          {/* Staff Table / Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4 text-emerald-600" size={32} />
                <p className="font-bold">অ্যাডমিন টিম লোড হচ্ছে...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                কোন অ্যাডমিন কর্মকর্তা পাওয়া যায়নি
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <motion.div 
                  layout
                  key={staff.uid}
                  className={`p-6 bg-white border rounded-[32px] transition-all hover:shadow-md ${
                    staff.isSuspended ? 'border-rose-200 bg-rose-50/10' : 'border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    
                    {/* Basic Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 overflow-hidden shadow-inner ${
                        staff.role === 'super_admin' ? 'bg-amber-500' :
                        staff.role === 'admin' ? 'bg-purple-600' :
                        staff.role === 'editor' ? 'bg-blue-600' :
                        staff.role === 'moderator' ? 'bg-teal-600' : 'bg-slate-700'
                      }`}>
                        {staff.photoURL ? <img src={staff.photoURL} alt="" className="w-full h-full object-cover" /> : staff.name?.charAt(0) || "A"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-black text-gray-900">{staff.name}</h4>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                            staff.role === 'super_admin' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            staff.role === 'admin' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            staff.role === 'editor' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            staff.role === 'moderator' ? 'bg-teal-100 text-teal-900 border-teal-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            {staff.role === 'super_admin' ? '👑 সুপার অ্যাডমিন' :
                             staff.role === 'admin' ? '🛡️ সিস্টেম অ্যাডমিন' :
                             staff.role === 'editor' ? '📝 কন্টেন্ট এডিটর' :
                             staff.role === 'moderator' ? '👮 কমিউনিটি মডারেটর' : '🎧 সাপোর্ট অফিসার'}
                          </span>

                          {staff.isSuspended && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle size={12} /> পাওয়ার স্থগিত
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-gray-400 mt-1">
                          {staff.email || staff.phone || "ইমেইল প্রদান করা হয়নি"} • ডিপার্টমেন্ট: <span className="text-gray-700">{staff.department || "আইটি ও প্রশাসন"}</span>
                        </p>

                        {/* Assigned Permissions Badges */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black text-gray-400 mr-1">অনুমোদিত এলাকা:</span>
                          {(staff.permissions || []).map(p => {
                            const mod = PERMISSION_MODULES.find(m => m.id === p);
                            return (
                              <span key={p} className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                ✓ {mod?.label || p}
                              </span>
                            );
                          })}
                          {(!staff.permissions || staff.permissions.length === 0) && (
                            <span className="text-[10px] font-bold text-gray-400 italic">কোন বিশেষ পারমিশন দেওয়া নেই</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0">
                      <button 
                        onClick={() => {
                          setSelectedAdmin(staff);
                          setShowEditModal(true);
                        }}
                        className="px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 size={14} /> রোল ও পারমিশন এডিট
                      </button>

                      <button 
                        onClick={() => {
                          setSelectedAdmin(staff);
                          setSuspendReason(staff.statusReason || "");
                          setShowSuspendModal(true);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          staff.isSuspended 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {staff.isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                        {staff.isSuspended ? 'পাওয়ার পুনর্বহাল' : 'পাওয়ার স্থগিত'}
                      </button>

                      {staff.role !== 'super_admin' && (
                        <button 
                          onClick={() => handleDemoteToUser(staff)}
                          className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                          title="অ্যাডমিন পদ থেকে সরিয়ে সাধারণ নাগরিক বানান"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : viewTab === 'permission_matrix' ? (
        /* Role Permission Matrix View */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 rounded-3xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <Lock size={20} className="text-emerald-200" /> অ্যাডমিন রোল পারমিশন রেফারেন্স ম্যাট্রিক্স
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                কোন ভূমিকা কী কী ক্ষমতা পরিচালনা করতে পারবে তার স্থায়ী গাইডলাইন
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-200">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-black uppercase">
                  <th className="p-4 border-b">পারমিশন মডিউল / ক্ষমতা</th>
                  <th className="p-4 border-b text-center text-amber-800">👑 Super Admin</th>
                  <th className="p-4 border-b text-center text-purple-800">🛡️ Admin</th>
                  <th className="p-4 border-b text-center text-blue-800">📝 Editor</th>
                  <th className="p-4 border-b text-center text-teal-800">👮 Moderator</th>
                  <th className="p-4 border-b text-center text-gray-800">🎧 Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-800">
                {PERMISSION_MODULES.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-black text-gray-900">{m.label}</p>
                      <p className="text-[10px] text-gray-400 font-normal">{m.desc}</p>
                    </td>
                    <td className="p-4 text-center bg-amber-50/30">
                      <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      {DEFAULT_ROLE_PERMISSIONS['admin'].includes(m.id) ? (
                        <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {DEFAULT_ROLE_PERMISSIONS['editor'].includes(m.id) ? (
                        <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {DEFAULT_ROLE_PERMISSIONS['moderator'].includes(m.id) ? (
                        <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {DEFAULT_ROLE_PERMISSIONS['support'].includes(m.id) ? (
                        <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle size={18} className="text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Super Admin Audit Trail View */
        <div className="space-y-6">
          <SuperAdminAuditLogViewer embedded={true} maxInitialRecords={150} />
        </div>
      )}

      </div>

      {/* Create New Admin Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} className="text-emerald-200" />
                  <h3 className="text-lg font-black">নতুন কর্মকর্তা বা অ্যাডমিন নিয়োগ করুন</h3>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">পূর্ণ নাম *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: মোঃ কামরুল ইসলাম"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">ইমেইল ঠিকানা</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">মোবাইল নম্বর</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="017xxxxxxxx"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">প্রাথমিক রোল নিধারন *</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-gray-800 focus:outline-none"
                    >
                      <option value="editor">📝 কন্টেন্ট এডিটর (Editor)</option>
                      <option value="moderator">👮 কমিউনিটি মডারেটর (Moderator)</option>
                      <option value="support">🎧 সাপোর্ট অফিসার (Support)</option>
                      <option value="admin">🛡️ সিস্টেম অ্যাডমিন (Admin)</option>
                      <option value="super_admin">👑 সুপার অ্যাডমিন (Super Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">ডিপার্টমেন্ট / বিভাগ</label>
                    <input 
                      type="text" 
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="যেমন: নিউজ ও প্রেস বিভাগ"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Permissions Checklist */}
                <div className="pt-2">
                  <label className="block text-xs font-black text-gray-700 mb-2">বিশেষ পারমিশন অনুমোদন (Permissions)</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                    {PERMISSION_MODULES.map(m => (
                      <label key={m.id} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-300">
                        <input 
                          type="checkbox"
                          checked={formData.permissions.includes(m.id)}
                          onChange={() => handleTogglePermission(m.id)}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-[11px] font-black text-gray-800">{m.label}</p>
                          <p className="text-[9px] text-gray-400">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "নিয়োগ হচ্ছে..." : "কর্মকর্তা নিয়োগ নিশ্চিত করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {showEditModal && selectedAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 size={20} className="text-emerald-200" />
                  <h3 className="text-lg font-black">কর্মকর্তা রোল ও পারমিশন এডিট</h3>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">নাম</label>
                  <input 
                    type="text" 
                    value={selectedAdmin.name}
                    onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">রোল ও পদমর্যাদা</label>
                    <select 
                      value={selectedAdmin.role}
                      onChange={(e) => {
                        const newRole = e.target.value as any;
                        setSelectedAdmin({
                          ...selectedAdmin,
                          role: newRole,
                          permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || []
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="editor">📝 কন্টেন্ট এডিটর</option>
                      <option value="moderator">👮 কমিউনিটি মডারেটর</option>
                      <option value="support">🎧 সাপোর্ট অফিসার</option>
                      <option value="admin">🛡️ সিস্টেম অ্যাডমিন</option>
                      <option value="super_admin">👑 সুপার অ্যাডমিন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">ডিপার্টমেন্ট</label>
                    <input 
                      type="text" 
                      value={selectedAdmin.department || ""}
                      onChange={(e) => setSelectedAdmin({ ...selectedAdmin, department: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="pt-2">
                  <label className="block text-xs font-black text-gray-700 mb-2">পারমিশন সমন্বয় করুন</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 max-h-48 overflow-y-auto">
                    {PERMISSION_MODULES.map(m => {
                      const isChecked = selectedAdmin.permissions?.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-300">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = selectedAdmin.permissions || [];
                              const updated = e.target.checked 
                                ? [...current, m.id]
                                : current.filter(p => p !== m.id);
                              setSelectedAdmin({ ...selectedAdmin, permissions: updated });
                            }}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <p className="text-[11px] font-black text-gray-800">{m.label}</p>
                            <p className="text-[9px] text-gray-400">{m.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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

      {/* Suspend / Restore Modal */}
      <AnimatePresence>
        {showSuspendModal && selectedAdmin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`p-6 text-white flex items-center justify-between ${
                selectedAdmin.isSuspended ? 'bg-emerald-700' : 'bg-rose-700'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={22} className="text-amber-300" />
                  <h3 className="text-lg font-black">
                    {selectedAdmin.isSuspended ? 'অ্যাডমিন পাওয়ার পুনর্বহাল করুন' : 'অ্যাডমিন পাওয়ার স্থগিত করুন'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowSuspendModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <form onSubmit={handleToggleSuspendPrivilege} className="p-6 space-y-4">
                <p className="text-xs font-bold text-gray-600">
                  কর্মকর্তা: <span className="font-black text-gray-900">{selectedAdmin.name}</span> ({selectedAdmin.role})
                </p>

                {!selectedAdmin.isSuspended && (
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">স্থগিত করার কারণ (অডিট লগের জন্য)</label>
                    <textarea 
                      required
                      rows={3}
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="যেমন: নিরাপত্তা পর্যালোচনার জন্য সাময়িক স্থগিত রাখা হয়েছে..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`flex-1 py-3 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                      selectedAdmin.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {actionLoading ? "প্রসেস হচ্ছে..." : selectedAdmin.isSuspended ? "পুনর্বহাল নিশ্চিত করুন" : "স্থগিত নিশ্চিত করুন"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSuspendModal(false)}
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
}

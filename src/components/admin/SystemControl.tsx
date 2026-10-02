import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Shield, 
  UserPlus, 
  Trash2, 
  Search, 
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getAllUsers, updateUserRole, deleteUserAccount } from "../../api";
import { UserProfile } from "../../contexts/AuthContext";

const SystemControl = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'admins' | 'roles' | 'super_admins'>('admins');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (uid: string, role: UserProfile['role']) => {
    setActionLoading(true);
    try {
      // If setting to super_admin, confirm first
      if (role === 'super_admin' && !window.confirm("আপনি কি নিশ্চিত যে এই ইউজারকে সুপার অ্যাডমিন করতে চান?")) {
        setActionLoading(false);
        return;
      }
      
      await updateUserRole(uid, { role });
      await fetchUsers();
      if (selectedUser?.uid === uid) {
          setSelectedUser({ ...selectedUser, role });
      }
    } catch (error) {
      alert("রোল আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermissions = async (uid: string, permissions: string[]) => {
      setActionLoading(true);
      try {
        await updateUserRole(uid, { permissions });
        await fetchUsers();
        if (selectedUser?.uid === uid) {
            setSelectedUser({ ...selectedUser, permissions });
        }
      } catch (error) {
        alert("পারমিশন আপডেট করতে সমস্যা হয়েছে।");
      } finally {
        setActionLoading(false);
      }
  };

  const handleRemoveAdmin = async (uid: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই অ্যাডমিনকে সাধারণ ইউজার করতে চান?")) return;
    setActionLoading(true);
    try {
      await updateUserRole(uid, { role: 'user', permissions: [] });
      await fetchUsers();
      setShowManageModal(false);
    } catch (error) {
      alert("অ্যাডমিন রিমুভ করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'admins') return ['admin', 'editor', 'staff'].includes(u.role || '');
    if (activeTab === 'super_admins') return u.role === 'super_admin';
    return true; // roles tab shows all users for role management
  }).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" size={28} />
              সিস্টেম কন্ট্রোল
            </h2>
            <p className="text-sm font-bold text-gray-400">অ্যাডমিন পারমিশন, ইউজার রোল এবং সুপার অ্যাডমিন ম্যানেজমেন্ট</p>
          </div>
        </div>

        <div className="w-full flex items-center gap-4 mt-8 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
            <button 
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 font-black text-sm whitespace-nowrap border-b-2 transition-colors shrink-0 min-w-max cursor-pointer ${activeTab === 'admins' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                অ্যাডমিন ম্যানেজমেন্ট
            </button>
            <button 
                onClick={() => setActiveTab('super_admins')}
                className={`px-4 py-2 font-black text-sm whitespace-nowrap border-b-2 transition-colors shrink-0 min-w-max cursor-pointer ${activeTab === 'super_admins' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                সুপার অ্যাডমিন
            </button>
            <button 
                onClick={() => setActiveTab('roles')}
                className={`px-4 py-2 font-black text-sm whitespace-nowrap border-b-2 transition-colors shrink-0 min-w-max cursor-pointer ${activeTab === 'roles' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                ইউজার রোল
            </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..." 
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-400">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mb-6">
              <Shield className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">কোনো ইউজার পাওয়া যায়নি</h3>
            <p className="text-sm font-bold text-gray-400">অন্য কোনো নাম বা মোবাইল নম্বর দিয়ে চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ইউজার</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">যোগাযোগ</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">রোল</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">পারমিশন</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black text-sm shrink-0">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{user.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{user.email || 'ইমেইল নেই'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-600">
                        <p>{user.phone || 'মোবাইল নেই'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {activeTab === 'roles' ? (
                            <select 
                                value={user.role || 'user'}
                                onChange={(e) => handleUpdateRole(user.uid, e.target.value as any)}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-gray-700 outline-none focus:border-emerald-500"
                            >
                                <option value="user">সাধারণ ইউজার</option>
                                <option value="editor">এডিটর</option>
                                <option value="staff">স্টাফ</option>
                                <option value="admin">অ্যাডমিন</option>
                                <option value="super_admin">সুপার অ্যাডমিন</option>
                            </select>
                        ) : (
                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                                user.role === 'super_admin' ? 'bg-rose-100 text-rose-600' :
                                user.role === 'admin' ? 'bg-emerald-100 text-emerald-600' :
                                user.role === 'editor' ? 'bg-blue-100 text-blue-600' :
                                user.role === 'staff' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {user.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 
                                 user.role === 'admin' ? 'অ্যাডমিন' : 
                                 user.role === 'editor' ? 'এডিটর' : 
                                 user.role === 'staff' ? 'স্টাফ' : 'ইউজার'}
                              </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                            {user.role === 'super_admin' ? (
                                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-black rounded-md">ALL ACCESS</span>
                            ) : (user.permissions && user.permissions.length > 0) ? (
                                user.permissions.map(p => (
                                    <span key={p} className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 text-[9px] font-black rounded-md uppercase">
                                        {p.replace('manage_', '')}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400">কোনো পারমিশন নেই</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowManageModal(true);
                        }}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Modal */}
      <AnimatePresence>
        {showManageModal && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    onClick={() => setShowManageModal(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                >
                    <div className="p-6 md:p-8 bg-emerald-50 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center text-emerald-600 font-black text-xl shadow-sm shrink-0">
                            {selectedUser.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">{selectedUser.name}</h3>
                            <p className="text-sm font-bold text-gray-500 mt-1">{selectedUser.email || selectedUser.phone}</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-wider">রোল পরিবর্তন করুন</label>
                            <select 
                                value={selectedUser.role || 'user'}
                                onChange={(e) => handleUpdateRole(selectedUser.uid, e.target.value as any)}
                                disabled={actionLoading}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-emerald-500"
                            >
                                <option value="user">সাধারণ ইউজার</option>
                                <option value="editor">এডিটর</option>
                                <option value="staff">স্টাফ</option>
                                <option value="admin">অ্যাডমিন</option>
                                <option value="super_admin">সুপার অ্যাডমিন</option>
                            </select>
                        </div>

                        {['admin', 'editor', 'staff'].includes(selectedUser.role || '') && (
                            <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                                    <Shield size={14} />
                                    অ্যাডমিন পারমিশন
                                </h5>
                                <div className="space-y-3">
                                    {[
                                        { id: 'manage_users', label: 'ইউজার ম্যানেজমেন্ট' },
                                        { id: 'manage_notices', label: 'নোটিশ ম্যানেজমেন্ট' },
                                        { id: 'manage_business', label: 'বিজনেস ডিরেক্টরি' },
                                        { id: 'manage_ads', label: 'বিজ্ঞাপন মডারেশন' },
                                        { id: 'manage_settings', label: 'সাইট সেটিংস' },
                                    ].map(perm => (
                                        <label key={perm.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            selectedUser.permissions?.includes(perm.id) 
                                            ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                                            : 'bg-white border-gray-100 hover:border-emerald-100'
                                        }`}>
                                            <span className={`text-sm font-black ${
                                                selectedUser.permissions?.includes(perm.id) ? 'text-emerald-700' : 'text-gray-600'
                                            }`}>{perm.label}</span>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                                selectedUser.permissions?.includes(perm.id) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-transparent'
                                            }`}>
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={selectedUser.permissions?.includes(perm.id) || false}
                                                onChange={(e) => {
                                                    const currentPerms = selectedUser.permissions || [];
                                                    const newPerms = e.target.checked 
                                                        ? [...currentPerms, perm.id]
                                                        : currentPerms.filter(p => p !== perm.id);
                                                    handleUpdatePermissions(selectedUser.uid, newPerms);
                                                }}
                                                disabled={actionLoading}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {['admin', 'editor', 'staff'].includes(selectedUser.role || '') && (
                            <div className="pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => handleRemoveAdmin(selectedUser.uid)}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-black text-sm rounded-2xl hover:bg-rose-100 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    অ্যাডমিন রোল থেকে বাতিল করুন
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 flex gap-4 border-t border-gray-100">
                        <button 
                            onClick={() => setShowManageModal(false)}
                            className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-sm"
                        >
                            বন্ধ করুন
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemControl;

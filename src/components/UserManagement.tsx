import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Ban,
  User,
  Edit2,
  CheckCircle,
  Search,
  Trash2,
} from "lucide-react";
import { getAllUsers, updateUserRole, deleteUserAccount } from "../api";
import { ListSkeleton } from "./home/Skeleton";
import { UserProfile } from "../contexts/AuthContext";
import { AdminRole } from "../types/admin";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    role: AdminRole;
    isBlocked: boolean;
    permissions: string[];
  }>({
    role: "user",
    isBlocked: false,
    permissions: [],
  });

  const availablePermissions = [
    { id: "blood_donors", label: "রক্তদাতা" },
    { id: "sponsors", label: "স্পন্সর" },
    { id: "ads", label: "বিজ্ঞাপন" },
    { id: "ugc", label: "ইউজার কন্টেন্ট" },
    { id: "notices", label: "নোটিশ বোর্ড" },
    { id: "users", label: "ইউজার ম্যানেজমেন্ট" },
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserProfile[]);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: UserProfile) => {
    setEditingUserId(user.uid);
    setEditForm({
      role: user.role || "user",
      isBlocked: user.isBlocked || false,
      permissions: user.permissions || [],
    });
  };

  const handleSaveEdit = async (uid: string) => {
    try {
      await updateUserRole(uid, editForm);
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("ইউজার আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const handleTogglePermission = (permId: string) => {
    setEditForm((prev) => {
      const current = prev.permissions;
      if (current.includes(permId)) {
        return { ...prev, permissions: current.filter((p) => p !== permId) };
      } else {
        return { ...prev, permissions: [...current, permId] };
      }
    });
  };

  const handleDeleteUser = async (uid: string) => {
    if (
      window.confirm(
        "আপনি কি নিশ্চিত যে এই ইউজারকে ডিলিট করতে চান? এই কাজ বাতিল করা যাবে না।",
      )
    ) {
      try {
        await deleteUserAccount(uid);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("ইউজার ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "super_admin":
        return (
          <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">
            <ShieldCheck className="w-3 h-3" /> সুপার অ্যাডমিন
          </span>
        );
      case "admin":
        return (
          <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">
            <ShieldCheck className="w-3 h-3" /> অ্যাডমিন
          </span>
        );
      case "editor":
        return (
          <span className="flex items-center gap-1 text-xs bg-sky-500/10 text-sky-400 px-2 py-1 rounded-full border border-sky-500/20">
            <ShieldAlert className="w-3 h-3" /> এডিটর
          </span>
        );
      case "moderator":
        return (
          <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-emerald-500 px-2 py-1 rounded-full border border-amber-500/20">
            <Shield className="w-3 h-3" /> মডারেটর
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
            <User className="w-3 h-3" /> ইউজার
          </span>
        );
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || "").includes(searchQuery),
  );

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-500" />
          <span>ইউজার ম্যানেজমেন্ট (User List)</span>
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ইউজার বা ফোন নম্বর খুঁজুন..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-sky-500 text-sm"
            />
          </div>
          <div className="text-gray-400 text-sm whitespace-nowrap">
            মোট: {users.length}
          </div>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-[#121212] rounded-xl border border-gray-800 flex flex-col items-center">
          <UserX className="w-12 h-12 mb-4 opacity-20" />
          <p>কোনো ইউজার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.uid}
              className={`bg-[#121212] rounded-xl border ${user.isBlocked ? "border-red-900/50 opacity-75" : "border-gray-800"} overflow-hidden`}
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden shrink-0">
                    <img
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=006A4E&color=fff`
                      }
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold ${user.isBlocked ? "text-gray-400 line-through" : "text-white"}`}
                      >
                        {user.name || "নামহীন ইউজার"}
                      </h4>
                      {getRoleBadge(user.role)}
                      {user.isBlocked && (
                        <span className="flex items-center gap-1 text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-full border border-red-500/20">
                          <Ban className="w-3 h-3" /> ব্লকড
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {user.phone}{" "}
                      {user.village ? `• ${user.village}, ${user.union}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                  {editingUserId !== user.uid && (
                    <>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors font-medium text-sm"
                      >
                        <Edit2 className="w-4 h-4" /> এডিট রোল
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="flex items-center justify-center p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Panel */}
              {editingUserId === user.uid && (
                <div className="p-4 bg-[#1A1A1A] border-t border-gray-800 animate-fade-in">
                  <h5 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> রোল ও পারমিশন সেট করুন
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        রোল (Role)
                      </label>
                      <select
                        value={editForm.role || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            role: e.target.value as any,
                          })
                        }
                        className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-sky-500"
                      >
                        <option value="user">ইউজার (User)</option>
                        <option value="moderator">মডারেটর (Moderator)</option>
                        <option value="editor">এডিটর (Editor)</option>
                        <option value="staff">স্টাফ (Staff)</option>
                        <option value="admin">অ্যাডমিন (Admin)</option>
                        <option value="super_admin">
                          সুপার অ্যাডমিন (Super Admin)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        অ্যাকাউন্ট স্ট্যাটাস
                      </label>
                      <div
                        className="flex items-center gap-3 bg-[#121212] border border-gray-700 px-4 py-2 rounded-lg cursor-pointer h-[42px]"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            isBlocked: !editForm.isBlocked,
                          })
                        }
                      >
                        <input
                          type="checkbox"
                          id={`block-${user.uid}`}
                          checked={editForm.isBlocked}
                          onChange={() => {}} // Handle on parent
                          className="w-4 h-4 rounded bg-[#1E1E1E] border-gray-700 text-red-500 focus:ring-red-500 pointer-events-none"
                        />
                        <label
                          htmlFor={`block-${user.uid}`}
                          className="text-red-400 cursor-pointer pointer-events-none font-medium"
                        >
                          এই ইউজারকে ব্লক করুন (Block User)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium text-sm"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => handleSaveEdit(user.uid)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      সেভ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;

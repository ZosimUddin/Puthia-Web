import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Crown,
  ShieldCheck,
  Shield,
  Edit,
  User,
  LayoutDashboard,
  Gift,
  Settings,
  LogOut,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RoleBottomSheet from "./RoleBottomSheet";

interface ProfileMenuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileMenuBottomSheet: React.FC<ProfileMenuBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isRoleBottomSheetOpen, setIsRoleBottomSheetOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const userInitial = (
    userProfile?.name?.trim()?.charAt(0) ||
    user?.displayName?.trim()?.charAt(0) ||
    user?.email?.trim()?.charAt(0) ||
    "U"
  ).toUpperCase();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutConfirm(false);
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const role = userProfile?.role || "user";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={onClose}
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[90vh] flex flex-col pb-safe"
            >
              {/* Drag Handle & Close */}
              <div className="relative pt-3 pb-1 flex items-center justify-center border-b border-slate-100/80 bg-slate-50/50">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-2 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 pb-6 space-y-3">
                {/* Profile Header Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50/80 rounded-2xl border border-emerald-100/80 relative">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg font-black shadow-md shadow-emerald-700/20 border-2 border-white overflow-hidden uppercase">
                        {userProfile?.photoURL || user?.photoURL ? (
                          <img
                            src={userProfile?.photoURL || user?.photoURL || ""}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          userInitial
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-slate-900 truncate leading-tight">
                        {userProfile?.name || user?.displayName || "সম্মানিত ব্যবহারকারী"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {userProfile?.phone || userProfile?.email || user?.email || "পুঠিয়া, রাজশাহী"}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (role === "super_admin") {
                              setIsRoleBottomSheetOpen(true);
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all shadow-2xs ${
                            role === "super_admin"
                              ? "bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 cursor-pointer"
                              : role === "admin"
                              ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                              : role === "moderator"
                              ? "bg-purple-100 text-purple-900 border border-purple-200"
                              : role === "editor"
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {role === "super_admin" && <Crown size={13} className="text-amber-700" />}
                          {role === "admin" && <ShieldCheck size={13} className="text-indigo-700" />}
                          {role === "moderator" && <Shield size={13} className="text-purple-700" />}
                          {role === "editor" && <Edit size={13} className="text-blue-700" />}
                          {role === "user" && <User size={13} className="text-emerald-700" />}
                          <span>
                            {role === "super_admin"
                              ? "সুপার অ্যাডমিন ▼"
                              : role === "admin"
                              ? "অ্যাডমিন"
                              : role === "moderator"
                              ? "মডারেটর"
                              : role === "editor"
                              ? "এডিটর"
                              : "সাধারণ ইউজার"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Admin Banner */}
                  {role !== "user" && (
                    <button
                      type="button"
                      onClick={() => {
                        const path =
                          role === "super_admin"
                            ? "/super-admin"
                            : role === "admin"
                            ? "/admin"
                            : role === "editor"
                            ? "/editor"
                            : "/moderator";
                        handleNavigate(path);
                      }}
                      className="mt-3.5 w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-900 rounded-xl border border-emerald-200/80 text-xs font-black transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>
                          {role === "super_admin"
                            ? "সুপার অ্যাডমিন ড্যাশবোর্ড"
                            : role === "admin"
                            ? "অ্যাডমিন প্যানেল"
                            : role === "editor"
                            ? "এডিটর প্যানেল"
                            : "মডারেটর প্যানেল"}
                        </span>
                      </span>
                      <ChevronRight size={16} className="text-emerald-700" />
                    </button>
                  )}
                </div>

                {/* Navigation Menu List */}
                <div className="space-y-1.5 pt-1">
                  {/* Role Switcher (Super Admin) */}
                  {role === "super_admin" && (
                    <button
                      type="button"
                      onClick={() => setIsRoleBottomSheetOpen(true)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 rounded-2xl transition-all group cursor-pointer border border-amber-200/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-200 text-amber-800 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <Crown size={18} />
                        </div>
                        <div className="text-left">
                          <p className="leading-tight font-black">রোল পরিবর্তন করুন</p>
                          <p className="text-[10px] text-amber-700/90 font-medium">ইউজার রোল টেস্ট ও সুইচ</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-amber-600 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}

                  {/* User Dashboard */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/dashboard")}
                    className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-700 shrink-0 group-hover:scale-105 transition-transform border border-indigo-100 shadow-2xs">
                        <LayoutDashboard size={18} />
                      </div>
                      <div className="text-left">
                        <p className="leading-tight font-black text-slate-800">ইউজার ড্যাশবোর্ড</p>
                        <p className="text-[10px] text-slate-400 font-medium">আমার সাবমিশন ও অ্যাক্টিভিটি</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Referral and Earn */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/referral")}
                    className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-800 hover:bg-rose-50/50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-rose-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 shrink-0 group-hover:scale-105 transition-transform border border-rose-100 shadow-2xs">
                        <Gift size={18} />
                      </div>
                      <div className="text-left">
                        <p className="leading-tight font-black text-slate-800 group-hover:text-rose-700 transition-colors">রেফার ও ইনকাম</p>
                        <p className="text-[10px] text-slate-400 font-medium">বন্ধুদের ইনভাইট করে রিচার্জ জিতুন</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-rose-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/settings")}
                    className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-800 hover:bg-slate-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 shrink-0 group-hover:scale-105 transition-transform border border-slate-200/60 shadow-2xs">
                        <Settings size={18} />
                      </div>
                      <div className="text-left">
                        <p className="leading-tight font-black text-slate-800">সেটিংস ও নিরাপত্তা</p>
                        <p className="text-[10px] text-slate-400 font-medium">অ্যাপ ও অ্যাকাউন্ট পছন্দ</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Logout */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center justify-between p-3 text-xs font-black text-rose-600 bg-rose-50/60 hover:bg-rose-100/70 rounded-2xl transition-all group cursor-pointer border border-rose-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600 shrink-0 group-hover:scale-105 transition-transform border border-rose-200/70 shadow-2xs">
                          <LogOut size={18} />
                        </div>
                        <div className="text-left">
                          <p className="leading-tight font-black text-rose-700">লগআউট</p>
                          <p className="text-[10px] text-rose-500 font-medium">সেশন সমাপ্ত করুন</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-rose-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Role Bottom Sheet */}
      <RoleBottomSheet
        isOpen={isRoleBottomSheetOpen}
        onClose={() => setIsRoleBottomSheetOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-4 border border-slate-100"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">লগআউট নিশ্চিতকরণ</h4>
              <p className="text-xs text-slate-500 mt-1">
                আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-1.5"
              >
                {isLoggingOut ? "লগআউট হচ্ছে..." : "হ্যাঁ, লগআউট"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProfileMenuBottomSheet;

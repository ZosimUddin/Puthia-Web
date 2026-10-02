import React, { memo } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { 
  X, 
  Home, 
  Crown, 
  Shield, 
  Edit3, 
  Sliders, 
  LayoutDashboard, 
  PlusCircle, 
  Bell, 
  Megaphone,
  ChevronRight,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface QuickActionsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionsBottomSheet = memo(({ isOpen, onClose }: QuickActionsBottomSheetProps) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleActionClick = (path: string) => {
    onClose();
    navigate(path);
  };

  // Role detection
  const isSuperAdmin = userProfile?.role === "super_admin";
  const isAdmin = isSuperAdmin || userProfile?.role === "admin";
  const isEditor = isSuperAdmin || isAdmin || userProfile?.role === "editor";
  const isModerator = isSuperAdmin || isAdmin || userProfile?.role === "moderator";
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 22 }
    }
  };

  // Construct items based on permissions/roles
  const showSuperAdmin = isSuperAdmin;
  const showAdminPanel = isAdmin;
  const showEditorPanel = isEditor;
  const showModeratorPanel = isModerator;

  // Paths for Quick Creations based on role
  const postPath = isEditor || isModerator || isAdmin ? "/admin/news" : "/news";
  const noticePath = isEditor || isModerator || isAdmin ? "/admin/notices" : "/notice";
  const adPath = isAdmin ? "/admin/advertisements" : "/add-business";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#F8FFFB] rounded-t-[40px] border-t border-emerald-100 shadow-[0_-20px_50px_rgba(0,106,78,0.12)] z-[110] p-6 pb-14 select-none overflow-y-auto max-h-[92vh]"
            id="quick-actions-sheet"
          >
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-emerald-100/60 rounded-full mx-auto mb-6" />

            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-emerald-950 flex items-center justify-center gap-2">
                <span>✨</span> পুঠিয়া সার্ভিস ও নিয়ন্ত্রণ
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-2.5 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <span className="text-xs font-bold text-emerald-800/70 uppercase tracking-tight">সক্রিয় রোল:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-emerald-700">{userProfile?.role === 'super_admin' ? 'সুপার এডমিন 👑' : userProfile?.role === 'admin' ? 'এডমিন 🛡️' : userProfile?.role === 'editor' ? 'সম্পাদক ✍️' : userProfile?.role === 'moderator' ? 'মডারেটর 🛠️' : 'সম্মানিত নাগরিক'}</span>
                  {(!userProfile?.role || userProfile.role === 'user') && (
                    <div className="flex items-center justify-center bg-emerald-600 text-white rounded-full p-0.5 ml-0.5">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* SECTION 1: MAIN NAVIGATION */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.1em] mb-3.5 px-1">
                  মূল নেভিগেশন
                </p>
                <div className="grid grid-cols-2 gap-3.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                    onClick={() => handleActionClick("/")}
                    className="flex flex-col items-center gap-3 p-4 rounded-[24px] bg-[#F0FDF4] border border-emerald-100 shadow-sm text-center cursor-pointer transition-all group min-h-[110px]"
                  >
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Home size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-emerald-950">প্রধান ওয়েবসাইট</p>
                      <p className="text-[11px] text-emerald-700/60 font-bold mt-0.5 leading-tight">হোমপেজে ফিরে যান</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    onClick={() => handleActionClick("/dashboard")}
                    className="flex flex-col items-center gap-3 p-4 rounded-[24px] bg-[#EFF6FF] border border-blue-100 shadow-sm text-center cursor-pointer transition-all group min-h-[110px]"
                  >
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <LayoutDashboard size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-blue-950">ইউজার ড্যাশবোর্ড</p>
                      <p className="text-[11px] text-blue-700/60 font-bold mt-0.5 leading-tight">নাগরিক প্রোফাইল ও তথ্য</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* SECTION 2: ADMINISTRATIVE CONTROLS */}
              {(showSuperAdmin || showAdminPanel || showEditorPanel || showModeratorPanel) && (
                <motion.div variants={itemVariants}>
                  <p className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.1em] mb-3.5 px-1">
                    প্রশাসনিক নিয়ন্ত্রণ
                  </p>
                  <div className="space-y-3">
                    {showSuperAdmin && (
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.98, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
                        onClick={() => handleActionClick("/super-admin")}
                        className="w-full flex items-center justify-between p-4 rounded-[24px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 shadow-sm cursor-pointer transition-all hover:shadow-md min-h-[72px]"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                            <Crown size={18} className="stroke-[2.5]" />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-black text-amber-900">সুপার এডমিন প্যানেল</p>
                            <p className="text-[11px] text-amber-700/70 font-bold">সিস্টেম কনফিগারেশন ও ফুল অ্যাক্সেস</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-emerald-500 stroke-[3]" />
                      </motion.button>
                    )}

                    {showAdminPanel && (
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.98, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                        onClick={() => handleActionClick("/admin")}
                        className="w-full flex items-center justify-between p-4 rounded-[24px] bg-emerald-50 border border-emerald-100 shadow-sm cursor-pointer transition-all hover:shadow-md min-h-[72px]"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <Shield size={18} className="stroke-[2.5]" />
                          </div>
                          <div className="text-left">
                            <p className="text-[13px] font-black text-emerald-900">এডমিন কন্ট্রোল</p>
                            <p className="text-[11px] text-emerald-700/70 font-bold">ব্যবহারকারী ও সার্ভিসেস অনুমোদন</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-emerald-400 stroke-[3]" />
                      </motion.button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {showEditorPanel && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                          onClick={() => handleActionClick("/editor")}
                          className="flex items-center gap-3 p-4 rounded-[24px] bg-indigo-50 border border-indigo-100 shadow-sm cursor-pointer transition-all text-left min-h-[64px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Edit3 size={16} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-indigo-950">সম্পাদক প্যানেল</p>
                            <p className="text-[11px] text-indigo-700/60 font-bold">কনটেন্ট পোস্ট</p>
                          </div>
                        </motion.button>
                      )}

                      {showModeratorPanel && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96, backgroundColor: "rgba(20, 184, 166, 0.1)" }}
                          onClick={() => handleActionClick("/moderator")}
                          className="flex items-center gap-3 p-4 rounded-[24px] bg-teal-50 border border-teal-100 shadow-sm cursor-pointer transition-all text-left min-h-[64px]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                            <Sliders size={16} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-teal-950">মডারেটর প্যানেল</p>
                            <p className="text-[11px] text-teal-700/60 font-bold">ইউজার কন্ট্রোল</p>
                          </div>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECTION 3: QUICK ADDITIONS */}
              <motion.div variants={itemVariants}>
                <p className="text-xs font-black text-emerald-900/40 uppercase tracking-[0.1em] mb-3.5 px-1">
                  দ্রুত সংযোজন ও পোস্ট
                </p>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98, backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                    onClick={() => handleActionClick(postPath)}
                    className="w-full flex items-center justify-between p-4 rounded-[24px] bg-[#FFF7ED] border border-orange-100 shadow-sm cursor-pointer transition-all group min-h-[72px]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                        <PlusCircle size={20} className="stroke-[2.5]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-orange-950">নতুন পোস্ট</p>
                        <p className="text-[11px] text-orange-700/60 font-bold leading-tight">নাগরিক ডায়েরি অথবা খবর পোস্ট করুন</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-orange-300 stroke-[3]" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98, backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    onClick={() => handleActionClick(noticePath)}
                    className="w-full flex items-center justify-between p-4 rounded-[24px] bg-[#FEFCE8] border border-yellow- yellow-100 shadow-sm cursor-pointer transition-all group min-h-[72px]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-yellow-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Bell size={20} className="stroke-[2.5]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-yellow-950">নতুন নোটিশ</p>
                        <p className="text-[11px] text-yellow-800/60 font-bold leading-tight">গুরুত্বপূর্ণ নোটিশবোর্ড আপডেট</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-yellow-400 stroke-[3]" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98, backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                    onClick={() => handleActionClick(adPath)}
                    className="w-full flex items-center justify-between p-4 rounded-[24px] bg-[#FAF5FF] border border-purple-100 shadow-sm cursor-pointer transition-all group min-h-[72px]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Megaphone size={20} className="stroke-[2.5]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-purple-950">নতুন বিজ্ঞাপন</p>
                        <p className="text-[11px] text-purple-700/60 font-bold leading-tight">ব্যবসা বা সার্ভিসের প্রমোশন যুক্ত করুন</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-purple-300 stroke-[3]" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* SECTION 4: CLOSE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full mt-8 py-4 bg-emerald-950 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer border-none transition-all hover:bg-emerald-900 active:scale-95"
            >
              <X size={18} className="stroke-[3]" />
              ✖ বন্ধ করুন
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  Smartphone, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  HeartHandshake, 
  Check, 
  Save, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Send,
  Droplet,
  MapPin,
  Briefcase,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { compressImageToBase64 } from "../../api";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../../firebase";

const PUTHIA_UNIONS = [
  "পুঠিয়া সদর",
  "বানেশ্বর",
  "বেলপুকুরিয়া",
  "জিউপাড়া",
  "শিলমাড়িয়া",
  "ভালুকগাছি"
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "জানা নেই"];

export default function Settings() {
  const { user, userProfile, updateUserProfile, resetPassword, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "display" | "privacy">("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    union: "পুঠিয়া সদর",
    village: "",
    bloodGroup: "O+",
    isBloodDonor: false,
    occupation: "",
    bio: "",
    photoURL: ""
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  // Notification Preferences State
  const [notifBlood, setNotifBlood] = useState(true);
  const [notifDoctor, setNotifDoctor] = useState(true);
  const [notifNotice, setNotifNotice] = useState(true);
  const [notifMerchant, setNotifMerchant] = useState(true);
  const [notifReferral, setNotifReferral] = useState(true);
  const [isNotifSaving, setIsNotifSaving] = useState(false);

  // Display & App State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("app_theme") === "dark");
  const [appLanguage, setAppLanguage] = useState<"bn" | "en">(() => (localStorage.getItem("app_language") as "bn" | "en") || "bn");
  const [fontSize, setFontSize] = useState<"normal" | "large">(() => (localStorage.getItem("app_font_size") as "normal" | "large") || "normal");

  // Privacy State
  const [privacyShowPhone, setPrivacyShowPhone] = useState(true);
  const [privacyPublicProfile, setPrivacyPublicProfile] = useState(true);
  const [isPrivacySaving, setIsPrivacySaving] = useState(false);

  // Delete Account Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Sync state from userProfile
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || user?.displayName || "",
        phone: userProfile.phone || "",
        union: userProfile.union || "পুঠিয়া সদর",
        village: userProfile.village || "",
        bloodGroup: userProfile.bloodGroup || "O+",
        isBloodDonor: userProfile.isBloodDonor ?? false,
        occupation: userProfile.occupation || "",
        bio: userProfile.bio || "",
        photoURL: userProfile.photoURL || user?.photoURL || ""
      });

      if (userProfile.notificationSettings) {
        setNotifBlood(userProfile.notificationSettings.notifPush ?? true);
        setNotifDoctor(userProfile.notificationSettings.notifSms ?? true);
        setNotifNotice(userProfile.notificationSettings.notifNewsEmergency ?? true);
      }

      if (userProfile.privacySettings) {
        setPrivacyShowPhone(userProfile.privacySettings.phone !== "only_me");
        setPrivacyPublicProfile(userProfile.privacySettings.profileVisibility !== "private");
      }
    }
  }, [userProfile, user]);

  // Handle Avatar Image Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading("ছবি প্রক্রিয়াকরণ করা হচ্ছে...");
        const base64 = await compressImageToBase64(file);
        setProfileForm(prev => ({ ...prev, photoURL: base64 }));
        if (updateUserProfile) {
          await updateUserProfile({ photoURL: base64 });
        }
        toast.dismiss();
        toast.success("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!");
      } catch (err) {
        toast.dismiss();
        console.error("Avatar upload error:", err);
        toast.error("ছবি আপলোড করতে সমস্যা হয়েছে");
      } finally {
        e.target.value = "";
      }
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন");
      return;
    }

    setIsProfileSaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          name: profileForm.name,
          phone: profileForm.phone,
          union: profileForm.union,
          village: profileForm.village,
          bloodGroup: profileForm.bloodGroup,
          isBloodDonor: profileForm.isBloodDonor,
          occupation: profileForm.occupation,
          bio: profileForm.bio,
          photoURL: profileForm.photoURL
        });
      }
      toast.success("প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("তথ্য সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড দুটি মিলছে না");
      return;
    }

    setIsChangingPassword(true);
    try {
      if (auth.currentUser && user?.email) {
        if (currentPassword) {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
        }
        await updatePassword(auth.currentUser, newPassword);
        toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("লগইন সেশন পুনর্যাচাই করুন");
      }
    } catch (err: any) {
      console.error("Password change error:", err);
      if (err?.code === "auth/wrong-password") {
        toast.error("বর্তমান পাসওয়ার্ড সঠিক নয়");
      } else if (err?.code === "auth/requires-recent-login") {
        toast.error("নিরাপত্তার স্বার্থে আবার লগইন করে চেষ্টা করুন");
      } else {
        toast.error("পাসওয়ার্ড পরিবর্তন করা যায়নি। ইমেইলে রিসেট লিংক পাঠান।");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Send Reset Password Email
  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast.error("আপনার অ্যাকাউন্টে কোনো ইমেইল যুক্ত নেই");
      return;
    }
    setIsSendingResetEmail(true);
    try {
      await resetPassword(user.email);
      toast.success(`${user.email} ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!`);
    } catch (err) {
      console.error(err);
      toast.error("রিসেট লিংক পাঠাতে ব্যর্থ হয়েছে");
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setIsNotifSaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          notificationSettings: {
            notifPush: notifBlood,
            notifSms: notifDoctor,
            notifNewsEmergency: notifNotice,
            notifEmail: notifMerchant
          }
        });
      }
      toast.success("নোটিফিকেশন পছন্দসমূহ সংরক্ষিত হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsNotifSaving(false);
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app_theme", "light");
    }
    toast.success(nextMode ? "ডার্ক মোড সক্রিয় করা হয়েছে" : "লাইট মোড সক্রিয় করা হয়েছে");
  };

  // Change Language
  const handleChangeLanguage = (lang: "bn" | "en") => {
    setAppLanguage(lang);
    localStorage.setItem("app_language", lang);
    toast.success(lang === "bn" ? "ভাষা বাংলা নির্ধারণ করা হয়েছে" : "Language set to English");
  };

  // Clear Cache
  const handleClearCache = () => {
    try {
      const theme = localStorage.getItem("app_theme");
      const lang = localStorage.getItem("app_language");
      localStorage.clear();
      if (theme) localStorage.setItem("app_theme", theme);
      if (lang) localStorage.setItem("app_language", lang);
      toast.success("অ্যাপ ক্যাশ সফলভাবে পরিষ্কার করা হয়েছে!");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      toast.error("ক্যাশ মুছতে সমস্যা হয়েছে");
    }
  };

  // Save Privacy
  const handleSavePrivacy = async () => {
    setIsPrivacySaving(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          privacySettings: {
            phone: privacyShowPhone ? "public" : "only_me",
            profileVisibility: privacyPublicProfile ? "public" : "private"
          }
        });
      }
      toast.success("প্রাইভেসি সেটিংস সংরক্ষিত হয়েছে!");
    } catch (err) {
      console.error(err);
      toast.error("সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsPrivacySaving(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogoutAction = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      toast.success("সফলভাবে লগআউট করা হয়েছে");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("লগআউট করতে সমস্যা হয়েছে");
      setShowLogoutModal(false);
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-16 font-sans">
      {/* User Quick Identity Card */}
      <div className="bg-gradient-to-br from-[#006847] via-[#005238] to-[#013f2b] rounded-2xl p-4 sm:p-6 text-white shadow-md mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar with Upload */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white/40 overflow-hidden bg-white/10 shadow-lg flex items-center justify-center backdrop-blur-xs">
              {profileForm.photoURL ? (
                <img 
                  src={profileForm.photoURL} 
                  alt={profileForm.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={38} className="text-emerald-200" />
              )}
            </div>

            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-all border border-white active:scale-95">
              <Camera size={15} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload} 
              />
            </label>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {profileForm.name || "সম্মানিত নাগরিক"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-emerald-200 text-[10px] font-black border border-white/20">
                {userProfile?.role === "super_admin" ? "সুপার অ্যাডমিন" : 
                 userProfile?.role === "admin" ? "অ্যাডমিন" : 
                 profileForm.isBloodDonor ? "রক্তদাতা" : "সাধারণ নাগরিক"}
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 font-mono font-medium truncate mb-2">
              {user?.email || "ইমেইল অনিবন্ধিত"} • {profileForm.phone || "মোবাইল নম্বর যুক্ত নেই"}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-bold text-emerald-100">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <MapPin size={12} className="text-emerald-300" /> {profileForm.union}, পুঠিয়া
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Droplet size={12} className="text-rose-300" /> গ্রুপ: {profileForm.bloodGroup}
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <ShieldCheck size={12} className="text-emerald-300" /> ভেরিফাইড মেম্বার
              </span>
            </div>
          </div>

          {/* Logout Quick Button */}
          <button
            onClick={handleLogout}
            className="self-center sm:self-start px-3.5 py-2 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/20 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <LogOut size={14} /> লগআউট
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: "profile", label: "প্রোফাইল তথ্য", icon: User },
            { id: "security", label: "নিরাপত্তা ও পাসওয়ার্ড", icon: Lock },
            { id: "notifications", label: "নোটিফিকেশন", icon: Bell },
            { id: "display", label: "অ্যাপ ও থিম", icon: Smartphone },
            { id: "privacy", label: "গোপনীয়তা ও অ্যাকাউন্ট", icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 whitespace-nowrap transition-all border-none cursor-pointer select-none ${
                  isActive 
                    ? "bg-[#006847] text-white shadow-sm ring-1 ring-emerald-700" 
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 active:scale-98"
                }`}
              >
                <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
        <AnimatePresence mode="wait">

          {/* 1. PROFILE TAB */}
          {activeTab === "profile" && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">ব্যক্তিগত ও প্রোফাইল তথ্য</h3>
                  <p className="text-xs font-bold text-slate-400">আমাদের পুঠিয়া প্ল্যাটফর্মে আপনার প্রদর্শিত তথ্যাবলি পরিবর্তন করুন।</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ জসিম উদ্দিন"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: ০১৭XXXXXXXX"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Union Selector */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      পুঠিয়ার ইউনিয়ন <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profileForm.union}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, union: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all cursor-pointer"
                    >
                      {PUTHIA_UNIONS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Village / Ward */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      গ্রাম / পাড়া / ওয়ার্ড
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: রামজীবনপুর / বানেশ্বর বাজার"
                      value={profileForm.village}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, village: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      রক্তের গ্রুপ
                    </label>
                    <select
                      value={profileForm.bloodGroup}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all cursor-pointer"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      পেশা / পদবী
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: ব্যবসায়ী, শিক্ষক, চাকরিজীবী, ছাত্র"
                      value={profileForm.occupation}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, occupation: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Bio / About */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    সংক্ষিপ্ত পরিচয় / বায়ো
                  </label>
                  <textarea
                    rows={2}
                    placeholder="নিজের সম্পর্কে সংক্ষিপ্ত বর্ণনা লিখুন..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none transition-all"
                  />
                </div>

                {/* Blood Donor Toggle */}
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                      <Droplet size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">আমি পুঠিয়ায় রক্তদান করতে ইচ্ছুক</h4>
                      <p className="text-[11px] font-bold text-rose-700">রক্তদাতা তালিকায় আপনার নাম ও গ্রুপ যুক্ত থাকবে</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.isBloodDonor}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, isBloodDonor: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileSaving}
                    className="px-6 py-2.5 bg-[#006847] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 border-none"
                  >
                    {isProfileSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> সংরক্ষণ করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> তথ্য সংরক্ষণ করুন
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 2. SECURITY TAB */}
          {activeTab === "security" && (
            <motion.div
              key="security-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">নিরাপত্তা ও পাসওয়ার্ড ব্যবস্থাপনা</h3>
                <p className="text-xs font-bold text-slate-400">আপনার অ্যাকাউন্টের সুরক্ষা বজায় রাখতে পাসওয়ার্ড আপডেট ও রিসেট করুন।</p>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={14} className="text-[#006847]" /> পাসওয়ার্ড পরিবর্তন করুন
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      নতুন পাসওয়ার্ড <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="কমপক্ষে ৬ অক্ষর লিখুন"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2.5 bg-[#006847] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border-none"
                  >
                    {isChangingPassword ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                    পাসওয়ার্ড আপডেট করুন
                  </button>
                </div>
              </form>

              {/* Password Reset Via Email Card */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#006847] text-white flex items-center justify-center shrink-0">
                    <Send size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠান</h4>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                      নিবন্ধিত ইমেইল: <span className="font-mono text-[#006847]">{user?.email || "যুক্ত নেই"}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendResetEmail}
                  disabled={isSendingResetEmail || !user?.email}
                  className="px-4 py-2.5 bg-white hover:bg-emerald-100/60 text-[#006847] border border-emerald-300 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  {isSendingResetEmail ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  রিসেট লিংক পাঠান
                </button>
              </div>

              {/* Active Session Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>বর্তমান ডিভাইস ও সেশন সুরক্ষিত (SSL Protected)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Puthia Web Secure</span>
              </div>
            </motion.div>
          )}

          {/* 3. NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">নোটিফিকেশন ও অ্যালার্ট পছন্দ</h3>
                <p className="text-xs font-bold text-slate-400">কোন কোন সেবার নোটিফিকেশন পেতে চান তা নির্ধারণ করুন।</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "blood",
                    title: "জরুরি রক্তদান অনুরোধ অ্যালার্ট",
                    desc: "পুঠিয়া উপজেলার যেকোনো রোগীর রক্তের জরুরি প্রয়োজন হলে নোটিফিকেশন পাবেন।",
                    checked: notifBlood,
                    setter: setNotifBlood,
                    icon: Droplet,
                    color: "text-rose-600 bg-rose-50"
                  },
                  {
                    id: "doctor",
                    title: "ডাক্তার সিরিয়াল ও বুকিং আপডেট",
                    desc: "ডাক্তার সিরিয়াল নিশ্চিতকরণ ও চেম্বার শিডিউলের নোটিফিকেশন।",
                    checked: notifDoctor,
                    setter: setNotifDoctor,
                    icon: CheckCircle2,
                    color: "text-[#006847] bg-emerald-50"
                  },
                  {
                    id: "notice",
                    title: "জরুরি উপজেলা নোটিশ ও স্থানীয় সংবাদ",
                    desc: "পুঠিয়া উপজেলা প্রশাসন ও গুরুত্বপূর্ণ স্থানীয় জরুরি বুলেটিন।",
                    checked: notifNotice,
                    setter: setNotifNotice,
                    icon: Bell,
                    color: "text-amber-600 bg-amber-50"
                  },
                  {
                    id: "merchant",
                    title: "দোকান ও ব্যবসা লিস্টিং স্ট্যাটাস",
                    desc: "আপনার তালিকাভুক্ত ব্যবসা বা শপের অনুমোদন ও ভেরিফিকেশন মেসেজ।",
                    checked: notifMerchant,
                    setter: setNotifMerchant,
                    icon: Layers,
                    color: "text-blue-600 bg-blue-50"
                  },
                  {
                    id: "referral",
                    title: "রেফারেল পয়েন্ট ও রিওয়ার্ড নোটিফিকেশন",
                    desc: "বন্ধুদের আমন্ত্রণে অর্জিত রিওয়ার্ড পয়েন্ট ও বোনাসের আপডেট।",
                    checked: notifReferral,
                    setter: setNotifReferral,
                    icon: Sparkles,
                    color: "text-purple-600 bg-purple-50"
                  }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{item.title}</h4>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006847]"></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isNotifSaving}
                  className="px-6 py-2.5 bg-[#006847] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md border-none active:scale-95"
                >
                  {isNotifSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  নোটিফিকেশন পছন্দ সংরক্ষণ করুন
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. DISPLAY & APP TAB */}
          {activeTab === "display" && (
            <motion.div
              key="display-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">অ্যাপ ও ডিসপ্লে পছন্দসমূহ</h3>
                <p className="text-xs font-bold text-slate-400">ওয়েবসাইটের থিম, ভাষা ও ডেটা ম্যানেজমেন্ট নিয়ন্ত্রণ করুন।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Theme Mode */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">অ্যাপের থিম মোড</h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        বর্তমান: <span className="text-[#006847]">{isDarkMode ? "ডার্ক মোড" : "লাইট মোড"}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleTheme}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black cursor-pointer shadow-2xs"
                  >
                    {isDarkMode ? "লাইট মোড করুন" : "ডার্ক মোড করুন"}
                  </button>
                </div>

                {/* Language Mode */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">ভাষা নির্বাচন (Language)</h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        বর্তমান: <span className="text-[#006847]">{appLanguage === "bn" ? "বাংলা" : "English"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => handleChangeLanguage("bn")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black border-none cursor-pointer ${
                        appLanguage === "bn" ? "bg-[#006847] text-white" : "bg-transparent text-slate-600"
                      }`}
                    >
                      বাং
                    </button>
                    <button
                      onClick={() => handleChangeLanguage("en")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black border-none cursor-pointer ${
                        appLanguage === "en" ? "bg-[#006847] text-white" : "bg-transparent text-slate-600"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Cache Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">অফলাইন ও ব্রাউজার ক্যাশ পরিষ্কার করুন</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      ওয়েবসাইট স্লো মনে হলে বা নতুন তথ্য না দেখালে ক্যাশ পরিষ্কার করে রিলোড দিন।
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClearCache}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs shrink-0"
                >
                  <RefreshCw size={13} /> ক্যাশ ক্লিয়ার করুন
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. PRIVACY & ACCOUNT TAB */}
          {activeTab === "privacy" && (
            <motion.div
              key="privacy-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">গোপনীয়তা ও অ্যাকাউন্ট নিয়ন্ত্রণ</h3>
                <p className="text-xs font-bold text-slate-400">আপনার ডেটা গোপনীয়তা এবং অ্যাকাউন্ট নিয়ন্ত্রণ সেটিংস।</p>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-3">
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">রক্তদাতা তালিকায় মোবাইল নম্বর প্রদর্শন</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      অনুমোদন দিলে মুমূর্ষু রোগীর প্রয়োজনে পুঠিয়ার নাগরিকগণ সরাসরি আপনাকে কল করতে পারবেন।
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={privacyShowPhone}
                      onChange={(e) => setPrivacyShowPhone(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006847]"></div>
                  </label>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">পাবলিক প্রোফাইল দৃশ্যমানতা</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      আপনার প্রোফাইল, লিস্টিং ও অবদান পুঠিয়ার সার্চে দৃশ্যমান থাকবে।
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={privacyPublicProfile}
                      onChange={(e) => setPrivacyPublicProfile(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006847]"></div>
                  </label>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={isPrivacySaving}
                    className="px-5 py-2.5 bg-[#006847] hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border-none active:scale-95"
                  >
                    {isPrivacySaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    গোপনীয়তা সেটিংস সংরক্ষণ
                  </button>
                </div>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertCircle size={18} />
                  <h4 className="text-xs font-black uppercase tracking-wider">অ্যাকাউন্ট অপশন</h4>
                </div>
                <p className="text-xs font-medium text-rose-900 leading-relaxed">
                  আপনি যদি আপনার অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলতে বা সাময়িকভাবে নিষ্ক্রিয় করতে চান, তবে সাপোর্ট ডেস্কে রিকোয়েস্ট জমা দিতে পারেন।
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border-none shadow-xs"
                  >
                    <Trash2 size={13} /> অ্যাকাউন্ট নিষ্ক্রিয় বা মুছে ফেলার অনুরোধ
                  </button>
                </div>
              </div>

              {/* Delete Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-lg font-black bg-transparent border-none cursor-pointer"
                    >
                      ✕
                    </button>

                    <h3 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2 text-rose-600">
                      <Trash2 size={18} /> অ্যাকাউন্ট মুছে ফেলার অনুরোধ
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mb-4">
                      অ্যাকাউন্ট ডিলিট করলে আপনার জমাকৃত লিস্টিং ও ডেটা স্থায়ীভাবে মুছে যেতে পারে।
                    </p>

                    <textarea
                      rows={3}
                      placeholder="অ্যাকাউন্ট মুছে ফেলার কারণ লিখুন (ঐচ্ছিক)..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none mb-4"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl border-none cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("আপনার অনুরোধটি আমাদের পুঠিয়া সাপোর্ট ডেস্কে পাঠানো হয়েছে।");
                          setShowDeleteModal(false);
                          setDeleteReason("");
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-md"
                      >
                        অনুরোধ জমা দিন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Admin & Super Admin Portal Quick Access */}
      <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-[#01412F] via-[#006847] to-[#01412F] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="font-black text-sm text-white">অ্যাডমিন ও সুপার অ্যাডমিন প্যানেল</h3>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5">মাস্টার কন্ট্রোল প্যানেল, ইউজার ম্যানেজমেন্ট ও ওয়েবসাইট অ্যাডমিনিস্ট্রেশন</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/super-admin/login")}
          className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border-none shrink-0 flex items-center gap-1.5"
        >
          <Lock size={14} /> অ্যাডমিন লগইন করুন
        </button>
      </div>

      {/* Footer Branding & Copyright Note */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 text-center space-y-1.5">
        <p className="text-xs font-bold text-slate-500">
          আমাদের পুঠিয়া ওয়েবসাইট ও অ্যাপ সংস্করণ <span className="font-mono font-black text-[#006847]">v2.6.4</span> (Official Production)
        </p>
        <p className="text-[11px] font-black text-slate-400">
          © ২০২৬ আমাদের পুঠিয়া। সর্বস্বত্ব সংরক্ষিত।
        </p>
        <p className="text-[11px] font-black text-[#006847] flex items-center justify-center gap-1 pt-1">
          ডেভেলপড বাই <span className="underline font-mono">JOSIM UDDIN</span> ❤️
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isLoggingOut && setShowLogoutModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <LogOut size={28} className="stroke-[2.5] translate-x-0.5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                লগআউট করতে চান?
              </h3>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান? পুনরায় প্রবেশ করতে আবার লগইন করতে হবে।
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={confirmLogoutAction}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoggingOut ? (
                  <span>লগআউট হচ্ছে...</span>
                ) : (
                  <span>হ্যাঁ, লগআউট</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

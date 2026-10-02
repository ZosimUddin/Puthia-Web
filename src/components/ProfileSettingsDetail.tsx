import React, { useState, useEffect } from "react";
import { copyToClipboard } from "../utils/clipboard";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Phone, Mail, MapPin, Award, LogOut, CheckCircle, 
  ArrowLeft, Droplet, RefreshCcw, Sparkles, Lock, Check, 
  TrendingUp, Heart, QrCode, ExternalLink, ChevronRight,
  Camera, Smartphone, Gift, Newspaper, Bell, Settings, 
  Eye, BarChart3, HelpCircle, Shield, ShieldCheck, Download, FileText, 
  Star, Languages, Briefcase, Trash2
} from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

export default function ProfileSettingsDetail() {
  const { user, userProfile, updateUserProfile, addStars, resetPassword } = useAuth();
  
  // Tab Routing: activeSubSection can be null (menu) or one of the 10 sections
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Sub-section 1: Personal Info States ---
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editUnion, setEditUnion] = useState("বানেশ্বর");
  const [editBloodGroup, setEditBloodGroup] = useState("O+");
  const [editDob, setEditDob] = useState("১৯৯৮-০১-০১");
  const [editGender, setEditGender] = useState("পুরুষ");
  const [editAddress, setEditAddress] = useState("");
  const [editOccupation, setEditOccupation] = useState("ব্যবসায়ী");

  // --- Sub-section 2: Verification States ---
  const [mobileVerifyStatus, setMobileVerifyStatus] = useState("verified");
  const [emailVerifyStatus, setEmailVerifyStatus] = useState("unverified");
  const [nidNumber, setNidNumber] = useState("");
  const [nidStatus, setNidStatus] = useState<"unverified" | "pending" | "verified">("unverified");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // --- Sub-section 3: Privacy States ---
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [privacyHidePhone, setPrivacyHidePhone] = useState(false);
  const [privacyShareLocation, setPrivacyShareLocation] = useState(true);

  // --- Sub-section 4: Notification States ---
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifNewsEmergency, setNotifNewsEmergency] = useState(true);
  const [testNotifActive, setTestNotifActive] = useState(false);

  // --- Sub-section 5: Security States ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isPinSet, setIsPinSet] = useState(false);
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    { id: 1, name: "Windows PC • Chrome (ঢাকা, বাংলাদেশ)", active: true, time: "সক্রিয়" },
    { id: 2, name: "Android Phone • Chrome (রাজশাহী, বাংলাদেশ)", active: false, time: "২ ঘণ্টা আগে" }
  ]);

  // --- Sub-section 6: Appearance States ---
  const [fontSizeSetting, setFontSizeSetting] = useState<"sm" | "md" | "lg">("md");
  const [selectedLanguage, setSelectedLanguage] = useState<"bn" | "en">("bn");

  // --- Sub-section 7: Recent Activity States ---
  const [activities, setActivities] = useState([
    { id: 1, text: "📝 প্রোফাইলের তথ্য আপডেট করেছেন", time: "এইমাত্র" },
    { id: 2, text: "🪙 সিভিক ইস্টার রিওয়ার্ড অর্জন করেছেন (+৫ ইস্টার)", time: "১০ মিনিট আগে" },
    { id: 3, text: "📢 খবর পোস্ট করেছেন: বানেশ্বর বাজার সিসিটিভি ক্যামেরা স্থাপন", time: "৩ ঘণ্টা আগে" },
    { id: 4, text: "💬 জরুরি নোটিশে মন্তব্য করেছেন", time: "১ দিন আগে" }
  ]);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

  // --- Sub-section 8: Achievements & Badges States ---
  // Badges grid
  const badgesList = [
    { id: "historian", name: "ইতিহাস অনুরাগী", desc: "পুঠিয়া কুইজে অংশ নিয়ে ৮০% বা তার বেশি স্কোর পেয়েছেন", earned: true, icon: "🏛️" },
    { id: "blood_donor", name: "রক্তদাতা হিরো", desc: "রক্তদানে সম্মতি দিয়েছেন এবং সক্রিয় তালিকায় আছেন", earned: false, icon: "🩸" },
    { id: "entrepreneur", name: "উদ্যোক্তা নাগরিক", desc: "স্থানীয় ব্যবসা ডিরেক্টরিতে নিজের ব্যবসা যুক্ত করেছেন", earned: true, icon: "🚀" },
    { id: "civic_star", name: "আদর্শ সেবক", desc: "স্বেচ্ছাসেবক নেটওয়ার্কে একজন সক্রিয় ভলান্টিয়ার", earned: false, icon: "🤝" }
  ];

  // --- Sub-section 9: Support & Feedback States ---
  const [complainTitle, setComplainTitle] = useState("");
  const [complainCategory, setComplainCategory] = useState("সেবামূলক");
  const [complainDesc, setComplainDesc] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // --- Sub-section 10: Account Control States ---
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupPercent, setBackupPercent] = useState(0);

  // Image upload states
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // Calculate dynamic joinDate
  const joinDate = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

  // Load existing profile values when component mounts or userProfile updates
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name || "");
      setEditPhone(userProfile.phone || "");
      setEditVillage(userProfile.village || "");
      setEditUnion(userProfile.union || "বানেশ্বর");
      setEditBloodGroup(userProfile.bloodGroup || "O+");
      setEditDob(userProfile.dob || "১৯৯৮-০১-০১");
      setEditGender(userProfile.gender || "পুরুষ");
      setEditAddress(userProfile.address || "");
      setEditOccupation(userProfile.occupation || "ব্যবসায়ী");

      setMobileVerifyStatus(userProfile.mobileVerifyStatus || (userProfile.phone ? "verified" : "unverified"));
      setEmailVerifyStatus(userProfile.emailVerifyStatus || (user?.emailVerified ? "verified" : "unverified"));
      setNidStatus(userProfile.nidStatus || "unverified");
      setNidNumber(userProfile.nidNumber || "");

      if (userProfile.privacySettings) {
        setPrivacyPublic(userProfile.privacySettings.privacyPublic ?? true);
        setPrivacyHidePhone(userProfile.privacySettings.privacyHidePhone ?? false);
        setPrivacyShareLocation(userProfile.privacySettings.privacyShareLocation ?? true);
      }
      if (userProfile.notificationSettings) {
        setNotifPush(userProfile.notificationSettings.notifPush ?? true);
        setNotifEmail(userProfile.notificationSettings.notifEmail ?? true);
        setNotifSms(userProfile.notificationSettings.notifSms ?? false);
        setNotifNewsEmergency(userProfile.notificationSettings.notifNewsEmergency ?? true);
      }
      if (userProfile.securitySettings) {
        setIsPinSet(userProfile.securitySettings.isPinSet ?? false);
        setPinCode(userProfile.securitySettings.pinCode ?? "");
        setIs2FaEnabled(userProfile.securitySettings.is2FaEnabled ?? false);
      }
    }
  }, [userProfile, user]);

  if (!userProfile) return null;

  // Calculate profile completion percentage based on 10 fields (10% each)
  const completionFields = [
    editName, editPhone, editVillage, editUnion, editBloodGroup, 
    userProfile.photoURL, editDob, editGender, editAddress, editOccupation
  ];
  const filledFieldsCount = completionFields.filter(f => !!f).length;
  const completionPercent = filledFieldsCount * 10;

  // Helper: clear messages
  const clearMessages = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  // Profile image crop and compress
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 250;
          canvas.height = 250;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const size = Math.min(img.width, img.height);
            const xOffset = (img.width - size) / 2;
            const yOffset = (img.height - size) / 2;
            ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, 250, 250);
            resolve(canvas.toDataURL("image/jpeg", 0.75));
          } else {
            reject(new Error("Canvas failure"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("দয়া করে সঠিক ইমেজ ফাইল নির্বাচন করুন।");
      return;
    }
    setPhotoUploading(true);
    setPhotoError("");
    try {
      const base64 = await compressImage(file);
      await updateUserProfile({ photoURL: base64 });
      setSuccessMsg("প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!");
    } catch (err) {
      setPhotoError("ছবি প্রসেস করতে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  // Handle Save Personal Info
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!editName.trim()) return setErrorMsg("দয়া করে আপনার পুরো নাম লিখুন।");
    if (!editPhone.trim() || editPhone.trim().length < 11) return setErrorMsg("সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন।");
    if (!editVillage.trim()) return setErrorMsg("গ্রামের নাম প্রদান করা আবশ্যক।");

    setSaving(true);
    try {
      const isNowComplete = completionPercent === 100;
      const alreadyAwarded = userProfile.profileCompleteAwarded || false;
      const updates: any = {
        name: editName.trim(),
        phone: editPhone.trim(),
        village: editVillage.trim(),
        union: editUnion,
        bloodGroup: editBloodGroup,
        dob: editDob,
        gender: editGender,
        address: editAddress.trim(),
        occupation: editOccupation.trim(),
      };

      if (isNowComplete && !alreadyAwarded) {
        updates.profileCompleteAwarded = true;
        await addStars(5);
        setSuccessMsg("অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পন্ন হয়েছে এবং ৫ সিভিক ইস্টার বোনাস দেওয়া হয়েছে!");
      } else {
        setSuccessMsg("আপনার ব্যক্তিগত তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।");
      }

      await updateUserProfile(updates);
    } catch (err) {
      setErrorMsg("তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  // Toggle privacy toggles on database
  const savePrivacySettings = async (updates: any) => {
    try {
      await updateUserProfile({
        privacySettings: {
          privacyPublic,
          privacyHidePhone,
          privacyShareLocation,
          ...updates
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle notification toggles on database
  const saveNotificationSettings = async (updates: any) => {
    try {
      await updateUserProfile({
        notificationSettings: {
          notifPush,
          notifEmail,
          notifSms,
          notifNewsEmergency,
          ...updates
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate OTP Code triggers
  const triggerMobileVerification = () => {
    clearMessages();
    setShowOtpModal(true);
  };

  const handleVerifyOtp = async () => {
    if (otpCode !== "1234") {
      alert("ভুল ওটিপি (OTP) কোড! সঠিক কোড '1234' দিন।");
      return;
    }
    setVerifyingOtp(true);
    setTimeout(async () => {
      try {
        setMobileVerifyStatus("verified");
        await updateUserProfile({ mobileVerifyStatus: "verified" });
        await addStars(5);
        setShowOtpModal(false);
        setSuccessMsg("আপনার মোবাইল নম্বর সফলভাবে ভেরিফাই করা হয়েছে! ৫ সিভিক ইস্টার বোনাস যুক্ত হয়েছে।");
      } catch (err) {
        console.error(err);
      } finally {
        setVerifyingOtp(false);
      }
    }, 1200);
  };

  // Simulate NID Verification
  const handleSubmitNid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nidNumber.trim() || nidNumber.length < 10) {
      alert("দয়া করে সঠিক ১০ বা ১৭ ডিজিটের NID নম্বর প্রদান করুন।");
      return;
    }
    setSaving(true);
    setTimeout(async () => {
      try {
        setNidStatus("pending");
        await updateUserProfile({ nidStatus: "pending", nidNumber: nidNumber.trim() });
        await addStars(5);
        setSuccessMsg("আপনার NID তথ্য যাচাইয়ের জন্য সফলভাবে জমা দেওয়া হয়েছে! ৫ ইস্টার বোনাস যুক্ত হয়েছে।");
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    }, 1500);
  };

  // Simulate Push Notification
  const triggerTestNotification = () => {
    setTestNotifActive(true);
    setTimeout(() => {
      setTestNotifActive(false);
    }, 4000);
  };

  // Simulate PIN update
  const handleSavePin = async () => {
    if (pinCode.length !== 4) {
      alert("PIN অবশ্যই ৪ ডিজিটের হতে হবে!");
      return;
    }
    try {
      await updateUserProfile({
        securitySettings: {
          isPinSet: true,
          pinCode,
          is2FaEnabled
        }
      });
      setIsPinSet(true);
      alert("আপনার সিকিউরিটি PIN সফলভাবে সেট করা হয়েছে!");
    } catch (e) {
      console.error(e);
    }
  };

  // Simulating document download
  const startDownloadSimulator = (docName: string) => {
    setDownloadProgress(prev => ({ ...prev, [docName]: 1 }));
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[docName] || 0;
        if (current >= 100) {
          clearInterval(interval);
          alert(`"${docName}" ফাইলটি সফলভাবে ডাউনলোড হয়েছে!`);
          return { ...prev, [docName]: 100 };
        }
        return { ...prev, [docName]: current + 20 };
      });
    }, 300);
  };

  // Lodge complaint
  const handleLodgeComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complainTitle.trim() || !complainDesc.trim()) {
      alert("দয়া করে অভিযোগের শিরোনাম ও বর্ণনা সম্পূর্ণ করুন।");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        userName: userProfile.name,
        userPhone: userProfile.phone,
        title: complainTitle.trim(),
        category: complainCategory,
        description: complainDesc.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
      });
      await addStars(5);
      alert("আপনার নাগরিক অভিযোগটি সফলভাবে নিবন্ধিত হয়েছে এবং ৫ সিভিক ইস্টার বোনাস দেওয়া হয়েছে! আমাদের টিম দ্রুত পদক্ষেপ নেবে।");
      setComplainTitle("");
      setComplainDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("দয়া করে কিছু মতামত লিখুন।");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "citizen_feedbacks"), {
        userId: user.uid,
        userName: userProfile.name,
        rating: feedbackRating,
        feedback: feedbackText.trim(),
        createdAt: new Date().toISOString()
      });
      alert("আপনার মূল্যবান মতামতের জন্য ধন্যবাদ!");
      setFeedbackText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Backup Data Simulation
  const triggerBackupDownload = () => {
    setBackupDownloading(true);
    setBackupPercent(0);
    const interval = setInterval(() => {
      setBackupPercent(p => {
        if (p >= 100) {
          clearInterval(interval);
          setBackupDownloading(false);
          // Trigger actual JSON file download
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile, null, 2));
          const dlAnchorElem = document.createElement('a');
          dlAnchorElem.setAttribute("href", dataStr);
          dlAnchorElem.setAttribute("download", `puthia_citizen_backup_${userProfile.uid}.json`);
          dlAnchorElem.click();
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  // Simulated Account Delete
  const handleSimulatedDelete = () => {
    if (deleteConfirmationText !== "DELETE") {
      alert("দয়া করে সঠিকভাবে 'DELETE' শব্দটি লিখুন।");
      return;
    }
    alert("অ্যাকাউন্ট ডিলিট করার অনুরোধটি জমা হয়েছে। ৪৮ ঘণ্টার মধ্যে আমাদের হেল্পডেস্ক থেকে আপনার সাথে যোগাযোগ করা হবে।");
    setDeleteConfirmationText("");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Cover and Floating Avatar */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#125836] via-[#16653f] to-zinc-900 text-white p-6 shadow-xl border border-emerald-600/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-row items-center gap-4 sm:gap-6 relative z-10">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-yellow-500 via-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl sm:text-4xl font-black shadow-xl overflow-hidden relative border-3 border-white/10">
              {photoUploading ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <RefreshCcw className="w-8 h-8 text-white animate-spin" />
                </div>
              ) : userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                editName.charAt(0) || "U"
              )}
            </div>
            
            <label className="absolute -bottom-1 -right-1 bg-[#125836] hover:bg-[#1b4e33] text-white p-2 rounded-full border-2 border-zinc-900 shadow-md cursor-pointer transition-all hover:scale-110 flex items-center justify-center" title="ছবি পরিবর্তন করুন">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
            </label>
          </div>

          <div className="text-left space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 justify-start">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate max-w-full">{editName || "সম্মানিত নাগরিক"}</h2>
              <span className="p-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30 flex items-center justify-center shrink-0" title="ভেরিফাইড নাগরিক">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-300 font-extrabold bg-emerald-950/40 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-emerald-800/40 inline-block uppercase tracking-wider">
              🛡️ স্মার্ট পুঠিয়া নাগরিক ড্যাশবোর্ড
            </p>
            <div className="flex flex-wrap items-center gap-2 justify-start text-[10px] sm:text-xs text-gray-300">
              <span className="flex items-center gap-1"><MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" /> {editVillage}, {editUnion}</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full hidden sm:inline" />
              <span className="text-yellow-400 font-bold">⭐ {userProfile.points || 0} ইস্টার</span>
            </div>
          </div>
          
          <div className="hidden sm:block md:ml-auto bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0 min-w-[120px]">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">সিভিক ইস্টার</p>
            <p className="text-3xl font-black text-yellow-400">{userProfile.points || 0}</p>
            <p className="text-[9px] text-emerald-300 mt-1">লেভেল: {userProfile.points >= 150 ? "🏅 গোল্ড মেম্বার" : "🥈 সিলভার মেম্বার"}</p>
          </div>
        </div>

        {/* Dynamic Completion Score Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex justify-between items-center text-xs font-bold text-gray-200 mb-2">
            <span className="flex items-center gap-1.5">📊 প্রোফাইল সম্পূর্ণতা: <span className="text-yellow-400 font-extrabold">{completionPercent}%</span></span>
            {completionPercent < 100 && (
              <span className="text-[10px] text-emerald-300 animate-pulse">🎁 ১০০% করুন এবং ৫ ইস্টার জিতুন!</span>
            )}
          </div>
          <div className="w-full h-3 bg-zinc-800/80 rounded-full overflow-hidden p-[2px] border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </div>

      {photoError && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 font-bold">
          {photoError}
        </div>
      )}

      {/* 2. Error / Success Messages */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 font-bold shadow-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 font-bold shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* 3. Main Multi-Panel Settings Routing Block */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 3.1: Settings Sub-Section Panels */}
        {activeSubSection !== null ? (
          <motion.div
            key={activeSubSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-xl shadow-emerald-950/[0.02]"
          >
            {/* Header with Back button */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-zinc-800/80">
              <button
                onClick={() => {
                  setActiveSubSection(null);
                  clearMessages();
                }}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 bg-gray-50 hover:bg-emerald-50/50 dark:bg-zinc-800 dark:hover:bg-zinc-800/80 transition-all border border-gray-100 dark:border-zinc-700/50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ফিরে যান
              </button>
              
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {activeSubSection === "personal" && "ব্যক্তিগত তথ্য"}
                {activeSubSection === "verification" && "নাগরিক ভেরিফিকেশন"}
                {activeSubSection === "privacy" && "গোপনীয়তা সেটিংস"}
                {activeSubSection === "notifications" && "বার্তা ও বিজ্ঞপ্তি"}
                {activeSubSection === "security" && "নিরাপত্তা ও পাসওয়ার্ড"}
                {activeSubSection === "appearance" && "ডিসপ্লে ও থিম"}
                {activeSubSection === "activity" && "সাম্প্রতিক কর্মকাণ্ড"}
                {activeSubSection === "achievements" && "অর্জন ও মেম্বার লেভেল"}
                {activeSubSection === "support" && "সহায়তা ও অভিযোগ"}
                {activeSubSection === "account" && "অ্যাকাউন্ট ব্যবস্থাপনা"}
              </span>
            </div>

            {/* PANEL CONTENT 1: PERSONAL INFO */}
            {activeSubSection === "personal" && (
              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">নাম (বাংলায়)</label>
                    <input 
                      type="text" 
                      value={editName || ""} 
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">মোবাইল নম্বর (ভেরিফাইড)</label>
                    <input 
                      type="text" 
                      value={editPhone || ""} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ইমেইল ঠিকানা</label>
                    <input 
                      type="email" 
                      disabled 
                      value={user?.email || "তথ্য দেওয়া হয়নি"} 
                      className="w-full px-4 py-3 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 rounded-xl border border-gray-200 dark:border-zinc-800 cursor-not-allowed font-extrabold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">জন্ম তারিখ</label>
                    <input 
                      type="date" 
                      value={editDob || ""} 
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">লিঙ্গ</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["পুরুষ", "মহিলা", "অন্যান্য"].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditGender(g)}
                          className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${editGender === g ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20" : "bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">রক্তের গ্রুপ</label>
                    <select 
                      value={editBloodGroup || ""} 
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold cursor-pointer"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <option key={bg} value={bg || ""}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">গ্রাম</label>
                    <input 
                      type="text" 
                      value={editVillage || ""} 
                      onChange={(e) => setEditVillage(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ইউনিয়ন</label>
                    <select 
                      value={editUnion || ""} 
                      onChange={(e) => setEditUnion(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold cursor-pointer"
                    >
                      {["বানেশ্বর", "পুঠিয়া", "জিউপাড়া", "বেলপুকুরিয়া", "ভালুকগাছী", "শিলমাড়িয়া"].map(u => (
                        <option key={u} value={u || ""}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">পেশা</label>
                    <input 
                      type="text" 
                      value={editOccupation || ""} 
                      onChange={(e) => setEditOccupation(e.target.value)}
                      placeholder="যেমন: ব্যবসায়ী, শিক্ষক, চাকুরিজীবী"
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">পূর্ণাঙ্গ ঠিকানা</label>
                    <textarea 
                      rows={3}
                      value={editAddress || ""} 
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="বাড়ি নং, সড়ক নং, মহল্লা বা পাড়ার নাম উল্লেখ করুন..."
                      className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-extrabold resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="py-3.5 px-8 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-950/10 cursor-pointer flex items-center gap-1.5"
                  >
                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "💾 প্রোফাইল সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            )}

            {/* PANEL CONTENT 2: VERIFICATION */}
            {activeSubSection === "verification" && (
              <div className="space-y-6">
                
                {/* 1. Mobile Verification Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Smartphone className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">মোবাইল নম্বর যাচাইকরণ</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">আপনার ১১ ডিজিটের মোবাইল নম্বরটি অলরেডি ভেরিফাইড করা আছে।</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {mobileVerifyStatus === "verified" ? (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/40">
                        <CheckCircle className="w-4 h-4" /> ভেরিফাইড
                      </span>
                    ) : (
                      <button 
                        onClick={triggerMobileVerification}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition shadow cursor-pointer"
                      >
                        ভেরিফাই করুন
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Email Verification Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">ইমেইল ভেরিফিকেশন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">mdzosimuddin47@gmail.com - এ একটি ভেরিফিকেশন পাঠানো হয়েছে।</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {emailVerifyStatus === "verified" ? (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-900/40">
                        <CheckCircle className="w-4 h-4" /> ভেরিফাইড
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          setEmailVerifyStatus("verified");
                          addStars(5);
                          alert("আপনার ইমেইলটি সফলভাবে ভেরিফাই করা হয়েছে! ৫ সিভিক ইস্টার বোনাস যুক্ত হয়েছে।");
                        }}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition shadow cursor-pointer"
                      >
                        লিংক যাচাই করুন
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. NID / Birth Cert Status form */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">জাতীয় পরিচয়পত্র (NID) / জন্ম নিবন্ধন যাচাই</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">সরকারি নাগরিক সেবা পেতে সঠিক NID কার্ডের তথ্য ও ফটো আপলোড করুন।</p>
                    </div>
                  </div>

                  {nidStatus === "verified" ? (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> আপনার NID তথ্য সফলভাবে যাচাই করা হয়েছে! আপনি এখন একজন অনুমোদিত নাগরিক।
                    </div>
                  ) : nidStatus === "pending" ? (
                    <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900 rounded-xl text-xs font-extrabold text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 animate-spin" /> আপনার NID কার্ডের তথ্য বর্তমানে যাচাইধীন রয়েছে। ২৪ ঘণ্টার মধ্যে অনুমোদন দেওয়া হবে।
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitNid} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">NID / জন্ম নিবন্ধন নাম্বার</label>
                        <input 
                          type="text" 
                          placeholder="যেমন: ৩২৮৪৫৭৯৩১২"
                          value={nidNumber || ""} 
                          onChange={(e) => setNidNumber(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">NID ফ্রন্ট কপি (ছবি আপলোড)</label>
                        <div className="relative">
                          <input type="file" accept="image/*" className="hidden" id="nid-upload" />
                          <label htmlFor="nid-upload" className="w-full px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between font-bold">
                            <span>ছবি আপলোড করুন...</span>
                            <Camera className="w-4.5 h-4.5 text-gray-400" />
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <button 
                          type="submit"
                          disabled={saving}
                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow cursor-pointer"
                        >
                          যাচাইয়ের জন্য জমা দিন (+৫ ইস্টার)
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 4. Verified Badge status card */}
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 text-center space-y-3">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-md">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-gray-800 dark:text-white">স্মার্ট ভেরিফাইড ব্যাজ</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    ১০০% প্রোফাইল সম্পন্নতা এবং জেনুইন আইডি তথ্য জমা দেওয়ার পর আপনার প্রোফাইলে গোল্ডেন ভেরিফাইড ব্যাজ সক্রিয় হবে। এটি আপনাকে অগ্রাধিকার নাগরিক হেল্পলাইন প্রদান করে।
                  </p>
                </div>
              </div>
            )}

            {/* PANEL CONTENT 3: PRIVACY */}
            {activeSubSection === "privacy" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">প্রোফাইল পাবলিক রাখুন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">অন্যান্য নাগরিকরা আপনার পাবলিক কন্টাক্ট ও অবদানের স্কোর দেখতে পাবেন।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={privacyPublic} 
                        onChange={(e) => {
                          setPrivacyPublic(e.target.checked);
                          savePrivacySettings({ privacyPublic: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-zinc-800/80" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">মোবাইল নম্বর গোপন রাখুন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">রক্তের অনুরোধ বা জরুরি প্রয়োজন ছাড়া সবার জন্য মোবাইল নম্বর আড়াল করুন।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={privacyHidePhone} 
                        onChange={(e) => {
                          setPrivacyHidePhone(e.target.checked);
                          savePrivacySettings({ privacyHidePhone: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-zinc-800/80" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">লাইভ লোকেশন শেয়ারিং</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">সরকারি নাগরিক সেবা ও তাৎক্ষণিক উদ্ধারে আমাদের টিমকে আনুমানিক GPS দেখার সুবিধা দিন।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={privacyShareLocation} 
                        onChange={(e) => {
                          setPrivacyShareLocation(e.target.checked);
                          savePrivacySettings({ privacyShareLocation: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                </div>
              </div>
            )}

            {/* PANEL CONTENT 4: NOTIFICATIONS */}
            {activeSubSection === "notifications" && (
              <div className="space-y-6">
                
                {testNotifActive && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-[#125836] text-white rounded-2xl flex items-center gap-3 shadow-lg border border-emerald-500/30"
                  >
                    <Bell className="w-5 h-5 text-yellow-400 animate-bounce shrink-0" />
                    <div>
                      <h5 className="font-extrabold text-xs">🔔 পুঠিয়া টেস্ট নোটিফিকেশন</h5>
                      <p className="text-[10px] text-gray-200 mt-0.5">আপনার নোটিফিকেশন চ্যানেলটি সঠিকভাবে কাজ করছে!</p>
                    </div>
                  </motion.div>
                )}

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">🔔 ব্রাউজার পুশ নোটিফিকেশন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">যেকোনো নোটিশ বা রক্তের অনুরোধ এলে ইনস্ট্যান্ট ব্রাউজার পপআপ নোটিফিকেশন পান।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifPush} 
                        onChange={(e) => {
                          setNotifPush(e.target.checked);
                          saveNotificationSettings({ notifPush: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-zinc-800/80" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">📧 ইমেইল নিউজলেটার ও এলার্ট</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">পুঠিয়া পৌরসভার সাপ্তাহিক নাগরিক বুলেটিন ও জরুরি ইমেইল বিজ্ঞপ্তি পান।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifEmail} 
                        onChange={(e) => {
                          setNotifEmail(e.target.checked);
                          saveNotificationSettings({ notifEmail: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-zinc-800/80" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">📱 মোবাইল এসএমএস নোটিশ (SMS)</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">জরুরি দুর্যোগ সঙ্কেত বা সরকারি নোটিশ সরাসরি ফোনে SMS আকারে পান।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifSms} 
                        onChange={(e) => {
                          setNotifSms(e.target.checked);
                          saveNotificationSettings({ notifSms: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-zinc-800/80" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">🚨 ব্রেকিং নিউজ ও রেড এলার্ট নোটিশ</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">পুঠিয়া থানা বা উপজেলা প্রশাসনের কোনো অত্যন্ত জরুরি ঘোষণা মিস করবেন না।</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notifNewsEmergency} 
                        onChange={(e) => {
                          setNotifNewsEmergency(e.target.checked);
                          saveNotificationSettings({ notifNewsEmergency: e.target.checked });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={triggerTestNotification}
                    className="py-2.5 px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm border border-gray-200/50 dark:border-zinc-700"
                  >
                    🔊 টেস্ট নোটিফিকেশন পাঠান
                  </button>
                </div>
              </div>
            )}

            {/* PANEL CONTENT 5: SECURITY */}
            {activeSubSection === "security" && (
              <div className="space-y-6">
                
                {/* Password reset widget */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      <Lock className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">পাসওয়ার্ড পরিবর্তন করুন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">নিরাপত্তা বজায় রাখতে শক্তিশালী ও আলাদা পাসওয়ার্ড ব্যবহার করুন।</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          if (user?.email) {
                            await resetPassword(user.email);
                            alert("আপনার ইমেইলে পাসওয়ার্ড রিসেট করার লিংক পাঠানো হয়েছে। দয়া করে স্প্যাম ফোল্ডার সহ চেক করুন!");
                          }
                        } catch (e) {
                          alert("লিংক পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
                        }
                      }}
                      className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      📧 পাসওয়ার্ড রিসেট লিংক পাঠান
                    </button>
                  </div>
                </div>

                {/* PIN Code Numeric Pad (Showstopper!) */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 rounded-xl">
                      <Settings className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">৪ ডিজিটের সিকিউরিটি PIN কোড</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">টাকা উইথড্রয়াল বা মোবাইল রিচার্জ রিওয়ার্ড দাবি করতে এটি ব্যবহার হবে।</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 py-3">
                    <div className="text-lg font-mono font-black tracking-widest bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-6 py-3 rounded-2xl shadow-inner min-w-[140px] text-center text-gray-800 dark:text-yellow-400">
                      {pinCode ? "• ".repeat(pinCode.length) + "_ ".repeat(4 - pinCode.length) : "PIN কোড দিন"}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 max-w-[200px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (pinCode.length < 4) setPinCode(p => p + num);
                          }}
                          className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-sm"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPinCode("")}
                        className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-600 text-xs font-bold flex items-center justify-center transition active:scale-90 cursor-pointer shadow-sm"
                      >
                        মুছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (pinCode.length < 4) setPinCode(p => p + "0");
                        }}
                        className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-sm"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePin}
                        className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center transition active:scale-90 cursor-pointer shadow-md shadow-emerald-950/10"
                      >
                        সেট
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2FA Widget */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <QrCode className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">গুগল অথেনটিকেটর দিয়ে ওটিপি দিয়ে অ্যাকাউন্টকে সর্বোচ্চ সুরক্ষিত করুন।</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={is2FaEnabled} 
                        onChange={(e) => {
                          setIs2FaEnabled(e.target.checked);
                          updateUserProfile({
                            securitySettings: {
                              isPinSet,
                              pinCode,
                              is2FaEnabled: e.target.checked
                            }
                          });
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {is2FaEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
                    >
                      <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                        <span className="text-5xl">📱</span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-black text-gray-800 dark:text-white">গুগল অথেনটিকেটর সেটআপ</h5>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          আপনার ফোনে অথেনটিকেটর অ্যাপ খুলুন এবং সিক্রেট কোড স্ক্যান করুন। রিকভারি কোড: <code className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-yellow-600 font-mono text-[9px]">PUTHIA_SEC_92X4</code>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Active Devices */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">সক্রিয় ডিভাইস তালিকা</h4>
                  <div className="space-y-2.5">
                    {activeDevices.map(device => (
                      <div key={device.id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200">
                          <span className="text-emerald-500">•</span> {device.name}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${device.active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400"}`}>
                          {device.time}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-zinc-800">
                    <button 
                      onClick={() => {
                        alert("অন্যান্য সকল ডিভাইস থেকে সফলভাবে লগআউট করা হয়েছে!");
                        setActiveDevices([activeDevices[0]]);
                      }}
                      className="py-2 px-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-200 text-[10px] font-extrabold rounded-lg transition"
                    >
                      🚫 অন্যান্য সকল ডিভাইস লগআউট করুন
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* PANEL CONTENT 6: APPEARANCE */}
            {activeSubSection === "appearance" && (
              <div className="space-y-6">
                
                {/* Theme Selector */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3.5">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">🌙 ডিসপ্লে থিম (Theme)</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    আপনার চোখের সুরক্ষার্থে ডার্ক থিম অথবা লাইট থিম নির্বাচন করতে পারেন।
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button 
                      type="button"
                      onClick={() => {
                        document.documentElement.classList.remove("dark");
                        alert("লাইট থিম সক্রিয় হয়েছে!");
                      }}
                      className="py-3 px-4 bg-white hover:bg-gray-100 border border-gray-200 text-xs font-extrabold text-gray-700 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      ☀️ লাইট মোড
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        document.documentElement.classList.add("dark");
                        alert("ডার্ক থিম সক্রিয় হয়েছে!");
                      }}
                      className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-extrabold text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      🌙 ডার্ক মোড
                    </button>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">🌐 ভাষা (Language)</h4>
                  <div className="flex gap-2">
                    {["বাংলা", "English"].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang === "বাংলা" ? "bn" : "en");
                          alert(`ভাষা পরিবর্তন করা হয়েছে: ${lang}`);
                        }}
                        className={`py-2 px-5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${(lang === "বাংলা" && selectedLanguage === "bn") || (lang === "English" && selectedLanguage === "en") ? "bg-[#125836] border-[#125836] text-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Scaling */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">🅰️ অক্ষরের সাইজ (Font Size)</h4>
                  <div className="flex gap-2">
                    {[
                      { key: "sm", label: "ছোট (Small)" },
                      { key: "md", label: "মাঝারি (Medium)" },
                      { key: "lg", label: "বড় (Large)" }
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => {
                          setFontSizeSetting(f.key as "sm" | "md" | "lg");
                          alert(`অক্ষরের সাইজ সেট করা হয়েছে: ${f.label}`);
                        }}
                        className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${fontSizeSetting === f.key ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Realtime Font Size Preview */}
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl mt-3">
                    <p className="text-gray-400 text-[9px] mb-1 uppercase font-bold tracking-wider">টেক্সট প্রিভিউ</p>
                    <p className={`font-extrabold text-gray-700 dark:text-gray-200 ${fontSizeSetting === "sm" ? "text-xs" : fontSizeSetting === "md" ? "text-sm" : "text-base"}`}>
                      স্মার্ট পুঠিয়া অ্যাপে স্বাগতম। আপনি এখান থেকে অক্ষরের আকার নির্ধারণ করতে পারেন।
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* PANEL CONTENT 7: ACTIVITY */}
            {activeSubSection === "activity" && (
              <div className="space-y-6">
                
                {/* Interactive Activity timeline */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-4">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">📝 সাম্প্রতিক কার্যকলাপ</h4>
                  
                  <div className="relative border-l border-emerald-500/20 ml-2 pl-4 space-y-5">
                    {activities.map(act => (
                      <div key={act.id} className="relative">
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-extrabold text-gray-700 dark:text-gray-200">{act.text}</p>
                          <p className="text-[10px] text-gray-400">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Citizen Download Center */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3.5">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">📂 নাগরিক গাইড ও ডিরেক্টরি ডাউনলোড</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">আপনার প্রয়োজনে নিচের জরুরি নাগরিক গাইড PDF ফরম্যাটে সংগ্রহে রাখুন।</p>
                  
                  <div className="space-y-2.5 pt-1">
                    {[
                      "পুঠিয়া জরুরি সেবা ডিরেক্টরি ২০২৬.pdf",
                      "পৌর নাগরিক অধিকার ম্যানুয়াল.pdf"
                    ].map(docName => (
                      <div key={docName} className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-extrabold text-gray-700 dark:text-gray-200">{docName}</p>
                          {downloadProgress[docName] !== undefined && (
                            <div className="w-28 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${downloadProgress[docName]}%` }} />
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => startDownloadSimulator(docName)}
                          disabled={downloadProgress[docName] > 0 && downloadProgress[docName] < 100}
                          className="p-2 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-500 rounded-lg transition-all border border-gray-100 dark:border-zinc-700"
                        >
                          <Download className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PANEL CONTENT 8: ACHIEVEMENTS */}
            {activeSubSection === "achievements" && (
              <div className="space-y-6">
                
                {/* 1. Level & Reward Points Info */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent border border-yellow-500/20 flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 rounded-full flex items-center justify-center shrink-0 shadow">
                    <Award className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-white">পুঠিয়া সিভিক কন্ট্রিবিউশন স্কোর</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                      আপনি পৌর সেবামূলক কর্মকাণ্ডে নিয়মিত অবদান রেখে <span className="font-bold text-yellow-500">{userProfile.points || 0} ইস্টার</span> রিওয়ার্ড অর্জন করেছেন।
                    </p>
                  </div>
                </div>

                {/* 2. Badges List Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">অর্জন করা ব্যাজ ({badgesList.filter(b => b.earned).length})</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {badgesList.map(badge => (
                      <div 
                        key={badge.id}
                        className={`p-4 rounded-2xl border transition-all flex gap-3.5 ${badge.earned ? "bg-white dark:bg-zinc-900 border-emerald-500/20 shadow-sm" : "bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-800 grayscale opacity-60"}`}
                      >
                        <span className="text-3xl shrink-0 p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center w-12 h-12">{badge.icon}</span>
                        <div>
                          <h5 className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1.5">
                            {badge.name}
                            {badge.earned && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </h5>
                          <p className="text-[10px] text-gray-400 mt-1 leading-normal">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Rank stats */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-gray-500 dark:text-gray-400">আপনার গ্লোবাল র‍্যাঙ্ক</p>
                    <p className="text-[11px] text-gray-400">ইস্টার বাড়িয়ে নাগরিকদের র‍্যাঙ্কিংয়ে উপরে যান।</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">#২৪ তম</p>
                    <p className="text-[9px] text-emerald-500/80">শীর্ষ ৩% নাগরিক</p>
                  </div>
                </div>

              </div>
            )}

            {/* PANEL CONTENT 9: SUPPORT & COMPLAINTS */}
            {activeSubSection === "support" && (
              <div className="space-y-6">
                
                {/* 1. FAQ Accordion */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)</h4>
                  
                  {[
                    { q: "সিভিক রিওয়ার্ড ইস্টার কীভাবে উইথড্র বা রিচার্জ করব?", a: "আপনার অন্তত ১০০ ইস্টার সম্পন্ন হলে আপনি 'সিভিক উপহার' ট্যাব থেকে যেকোনো বাংলাদেশী নম্বরে সরাসরি মোবাইল রিচার্জ হিসেবে রিওয়ার্ড দাবি করতে পারেন।" },
                    { q: "ভেরিফাইড নাগরিক ব্যাজ কেন পাওয়া জরুরি?", a: "ভেরিফাইড ব্যাজ থাকলে আপনি সরকারি সেবা, ত্রাণের অগ্রাধিকার আবেদন, এবং উপজেলা প্রশাসনের সরাসরি হেল্পডেস্কের সুবিধা পাবেন।" }
                  ].map((faq, idx) => (
                    <div key={idx} className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                        className="w-full p-4 text-left font-extrabold text-xs text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-800 transition flex items-center justify-between cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight className={`w-4 h-4 transition-all ${faqOpen === idx ? "rotate-90" : ""}`} />
                      </button>
                      {faqOpen === idx && (
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 2. Civic Complain Lodger (অভিযোগ ফর্ম) */}
                <form onSubmit={handleLodgeComplaint} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">উপজেলা নির্বাহী অফিসারের কাছে অভিযোগ দায়ের</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">পৌরসভা বা স্থানীয় সেবা সংক্রান্ত যেকোনো অনিয়ম বা অভিযোগ সরাসরি ইউএনও বরাবর দাখিল করুন।</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">অভিযোগের শিরোনাম</label>
                      <input 
                        type="text" 
                        value={complainTitle || ""} 
                        onChange={(e) => setComplainTitle(e.target.value)}
                        placeholder="যেমন: বানেশ্বর বাজারে ড্রেনেজ ব্লক"
                        className="w-full px-4 py-2.5 text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">ধরণ / ক্যাটাগরি</label>
                      <select 
                        value={complainCategory || ""} 
                        onChange={(e) => setComplainCategory(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold cursor-pointer"
                      >
                        <option value="সেবামূলক">পরিচ্ছন্নতা ও ড্রেনেজ</option>
                        <option value="নিরাপত্তা">আইনশৃঙ্খলা ও নিরাপত্তা</option>
                        <option value="রাস্তাঘাট">সড়ক ও অবকাঠামো</option>
                        <option value="অন্যান্য">অন্যান্য স্থানীয় সমস্যা</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">সমস্যার বিস্তারিত বর্ণনা</label>
                      <textarea 
                        rows={3}
                        value={complainDesc || ""} 
                        onChange={(e) => setComplainDesc(e.target.value)}
                        placeholder="অভিযোগের বিস্তারিত স্থান ও বিবরণ দিন যাতে প্রশাসন দ্রুত ব্যবস্থা নিতে পারে..."
                        className="w-full px-4 py-2.5 text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="py-2 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-lg transition shadow cursor-pointer flex items-center gap-1"
                    >
                      {saving ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : "🚀 অভিযোগ দাখিল করুন (+৫ ইস্টার)"}
                    </button>
                  </div>
                </form>

                {/* 3. Star-Rating Dashboard Feedback Component (Extremely Premium!) */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3.5">
                  <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">⭐ স্মার্ট ড্যাশবোর্ড কেমন লাগছে? মতামত দিন</h4>
                  
                  <div className="flex items-center gap-2 justify-center py-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFeedbackRating(val)}
                        className="transition active:scale-90 cursor-pointer"
                      >
                        <Star className={`w-7 h-7 ${val <= feedbackRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-zinc-700"}`} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <textarea 
                      rows={2}
                      value={feedbackText || ""} 
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="আপনার কোনো পরামর্শ বা ড্যাশবোর্ড সংক্রান্ত মতামত লিখুন..."
                      className="w-full px-4 py-2.5 text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold resize-none"
                    />
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={handleSubmitFeedback}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition"
                      >
                        পাঠিয়ে দিন
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* PANEL CONTENT 10: ACCOUNT CONTROLS */}
            {activeSubSection === "account" && (
              <div className="space-y-6">
                
                {/* 1. Backup Citizen Profile Data */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Download className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">নাগরিক প্রোফাইল ব্যাকআপ (Backup JSON)</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">আপনার সকল নাগরিক পোস্ট, ইস্টার অর্জন এবং ড্যাশবোর্ড ডাটা এক ক্লিকে ব্যাকআপ নিন।</p>
                    </div>
                  </div>
                  
                  {backupDownloading && (
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-600 h-full transition-all duration-150" style={{ width: `${backupPercent}%` }} />
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      onClick={triggerBackupDownload}
                      disabled={backupDownloading}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-950/10 cursor-pointer flex items-center gap-1"
                    >
                      {backupDownloading ? `ব্যাকআপ হচ্ছে (${backupPercent}%)...` : "📂 ডাটা ব্যাকআপ ডাউনলোড করুন"}
                    </button>
                  </div>
                </div>

                {/* 2. Export Profile Summary Card */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-[#125836]/10 text-[#125836] dark:text-emerald-400 rounded-xl">
                      <ExternalLink className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-800 dark:text-white">নাগরিক আইডি সামারি কার্ড কপি করুন</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">অনলাইনে নাগরিক তথ্য সামারি কার্ড কপি বা শেয়ার করতে পারেন।</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={async () => {
                        await copyToClipboard(`স্মার্ট পুঠিয়া নাগরিক আইডি কার্ড:\nনাম: ${userProfile.name}\nমোবাইল: ${userProfile.phone}\nঅবস্থান: ${userProfile.village}, ${userProfile.union}\nরক্তের গ্রুপ: ${userProfile.bloodGroup}\nসিভিক ইস্টার: ${userProfile.points}`);
                        alert("আপনার নাগরিক আইডি সামারি ক্লিপবোর্ডে কপি করা হয়েছে!");
                      }}
                      className="py-2 px-4 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition"
                    >
                      📋 কার্ড কপি করুন
                    </button>
                  </div>
                </div>

                {/* 3. Dangerous account delete panel */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">নাগরিক অ্যাকাউন্ট নিষ্ক্রিয়করণ</h4>
                      <p className="text-[11px] text-rose-500/80 mt-0.5">অ্যাকাউন্ট নিষ্ক্রিয় করলে আপনার সকল কন্ট্রিবিউশন স্কোর, মেম্বার ব্যাজ ও অর্জন চিরতরে মুছে যাবে।</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 max-w-sm">
                    <label className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold uppercase">নিশ্চিত করতে বড় হাতের অক্ষরে 'DELETE' লিখুন</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={deleteConfirmationText || ""} 
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="যেমন: DELETE"
                        className="px-3 py-2 text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white rounded-lg border border-rose-200 dark:border-rose-900/40 focus:outline-none focus:ring-1 focus:ring-rose-500 font-bold"
                      />
                      <button 
                        onClick={handleSimulatedDelete}
                        disabled={deleteConfirmationText !== "DELETE"}
                        className="py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition"
                      >
                        অ্যাকাউন্ট ডিলিট করুন
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        ) : (
          
          /* VIEW 3.2: 10 Categories List Grid */
          <motion.div
            key="settings-list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {[
              { id: "personal", title: "ব্যক্তিগত তথ্য", desc: "নাম, ইমেইল, মোবাইল, রক্তের গ্রুপ, পেশা ও ঠিকানা", icon: <User className="w-5 h-5" />, color: "bg-blue-500 text-white shadow-blue-500/10" },
              { id: "verification", title: "নাগরিক ভেরিফিকেশন", desc: "আইডি কার্ড/জন্ম নিবন্ধন তথ্য যাচাই করুন", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-yellow-500 text-white shadow-yellow-500/10" },
              { id: "privacy", title: "গোপনীয়তা সেটিংস", desc: "পাবলিক ভিউ এবং মোবাইল নম্বর লুকানোর সেটিংস", icon: <Shield className="w-5 h-5" />, color: "bg-teal-500 text-white shadow-teal-500/10" },
              { id: "notifications", title: "বার্তা ও বিজ্ঞপ্তি", desc: "ব্রাউজার পুশ, মোবাইল এসএমএস ও জরুরি এলার্ট", icon: <Bell className="w-5 h-5" />, color: "bg-amber-500 text-white shadow-amber-500/10" },
              { id: "security", title: "নিরাপত্তা ও পাসওয়ার্ড", desc: "পাসওয়ার্ড পরিবর্তন, ট্রানজেকশন PIN সেট ও 2FA", icon: <Lock className="w-5 h-5" />, color: "bg-indigo-500 text-white shadow-indigo-500/10" },
              { id: "appearance", title: "ডিসপ্লে ও থিম", desc: "চোখের সুরক্ষায় ডার্ক মোড, ভাষা ও অক্ষরের আকার", icon: <Languages className="w-5 h-5" />, color: "bg-slate-500 text-white shadow-slate-500/10" },
              { id: "activity", title: "সাম্প্রতিক কর্মকাণ্ড", desc: "লগইন হিস্টোরি ও নাগরিক সেবা ডিরেক্টরি ডাউনলোড", icon: <BarChart3 className="w-5 h-5" />, color: "bg-sky-500 text-white shadow-sky-500/10" },
              { id: "achievements", title: "অর্জন ও মেম্বার লেভেল", desc: "মেম্বার ব্যাজ ও কন্ট্রিবিউশন স্কোর লিডারবোর্ড", icon: <Award className="w-5 h-5" />, color: "bg-yellow-600 text-white shadow-yellow-600/10" },
              { id: "support", title: "সহায়তা ও অভিযোগ", desc: "ইউএনও বরাবর অভিযোগ দায়ের ও পরামর্শ ফর্ম", icon: <HelpCircle className="w-5 h-5" />, color: "bg-purple-500 text-white shadow-purple-500/10" },
              { id: "account", title: "অ্যাকাউন্ট ব্যবস্থাপনা", desc: "ডাটা ব্যাকআপ ডাউনলোড ও নাগরিক আইডি সামারি", icon: <Settings className="w-5 h-5" />, color: "bg-rose-500 text-white shadow-rose-500/10" },
            ].map(item => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveSubSection(item.id);
                  clearMessages();
                }}
                className="p-4.5 bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[20px] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <span className={`p-3.5 rounded-2xl ${item.color} shrink-0 shadow-lg flex items-center justify-center w-12 h-12`}>
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-400/80 mt-1 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-zinc-650 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all transform group-hover:translate-x-1 shrink-0 ml-2" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Simulation OTP verification modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 bg-emerald-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl font-bold">
              📱
            </div>
            <h4 className="text-base font-black text-gray-800 dark:text-white">মোবাইল নম্বর ওটিপি (OTP) যাচাই</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              আপনার মোবাইল নম্বরে একটি ৪ ডিজিটের কোড পাঠানো হয়েছে। পরীক্ষার জন্য <code className="bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-600 font-mono text-xs">1234</code> কোডটি প্রদান করুন।
            </p>
            <input 
              type="text" 
              maxLength={4}
              placeholder="যেমন: 1234"
              value={otpCode || ""} 
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-32 px-4 py-3 text-center text-lg font-mono tracking-widest bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-white rounded-xl border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-black"
            />
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setShowOtpModal(false)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-gray-300 text-xs font-extrabold rounded-xl transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button 
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-950/10 cursor-pointer flex items-center justify-center"
              >
                {verifyingOtp ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "যাচাই করুন"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  ChevronRight,
  ShieldCheck,
  Pencil,
  X,
  Loader2,
  Camera,
  Globe,
  Phone,
  MapPin,
  Users,
  Award,
  Smartphone,
  Mail,
  Sprout,
  BadgeCheck,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Check,
  CheckCircle2,
  Circle,
  ArrowRight,
  HeartHandshake,
  Star,
  Sparkles,
  Info,
  GraduationCap,
  Briefcase,
  Share2,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Droplet,
  Building2,
  ExternalLink,
  Trophy,
  Medal,
  TrendingUp,
  Bookmark,
  MessageSquare,
  PlusCircle,
  Activity,
  History,
  Stethoscope,
  Hospital,
  Newspaper,
  Compass,
  Store,
  BookmarkCheck,
  Menu,
  Settings,
  Bell,
  Shield,
  FileText,
  Megaphone,
  HelpCircle,
  LogOut,
  Sliders,
  MoreVertical
} from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { compressImageToBase64 } from "../../api";
import { doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useSocial } from "../../hooks/useSocial";
import { BADGES, getBadgeForStars } from "../../utils/reputation";
import { cleanWardFromText } from "../../utils/cleanWard";

const Profile: React.FC = () => {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { acceptFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest, cancelFriendRequest } = useSocial();

  // Profile Action Menu (Dropdown/Modal) State
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // App settings state
  const [language] = useState<"bn" | "en">(() => {
    return (localStorage.getItem("app_language") as "bn" | "en") || "bn";
  });

  // Edit profile states
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  // Badge Details Modal state
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Activity Modal state
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Saved / Bookmark Modal state
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [activeSavedCategory, setActiveSavedCategory] = useState<string>("all");

  // Followers Modal state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Friends Modal state
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsTab, setFriendsTab] = useState<"friends" | "requests" | "find">("friends");
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load followers
  const openFollowersModal = async () => {
    setShowFollowersModal(true);
    const followers = userProfile?.followers || [];
    if (followers.length === 0) {
      setFollowersList([]);
      return;
    }
    setLoadingFollowers(true);
    try {
      const list: any[] = [];
      for (const uid of followers) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          list.push({ uid: snap.id, ...snap.data() });
        }
      }
      setFollowersList(list);
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Load friends and requests
  const openFriendsModal = async () => {
    setShowFriendsModal(true);
    setLoadingFriends(true);
    try {
      const friendsUids = userProfile?.friends || [];
      const requestsUids = userProfile?.friendRequestsReceived || [];

      // Fetch friends
      const fList: any[] = [];
      for (const uid of friendsUids) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          fList.push({ uid: snap.id, ...snap.data() });
        }
      }
      setFriendsList(fList);

      // Fetch requests
      const rList: any[] = [];
      for (const uid of requestsUids) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          rList.push({ uid: snap.id, ...snap.data() });
        }
      }
      setRequestsList(rList);

      // Fetch suggestions from users collection
      const usersSnap = await getDocs(query(collection(db, "users"), limit(20)));
      const suggestions: any[] = [];
      usersSnap.forEach((d) => {
        if (d.id !== user?.uid && !friendsUids.includes(d.id)) {
          suggestions.push({ uid: d.id, ...d.data() });
        }
      });
      setSuggestedUsers(suggestions);
    } catch (err) {
      console.error("Error loading friends data:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Handle Friend Actions
  const handleAccept = async (senderUid: string) => {
    if (!user?.uid) return;
    setActionLoadingId(senderUid);
    try {
      await acceptFriendRequest(user.uid, senderUid);
      setRequestsList(prev => prev.filter(r => r.uid !== senderUid));
      const acceptedUserSnap = await getDoc(doc(db, "users", senderUid));
      if (acceptedUserSnap.exists()) {
        setFriendsList(prev => [...prev, { uid: senderUid, ...acceptedUserSnap.data() }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (senderUid: string) => {
    if (!user?.uid) return;
    setActionLoadingId(senderUid);
    try {
      await rejectFriendRequest(user.uid, senderUid);
      setRequestsList(prev => prev.filter(r => r.uid !== senderUid));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnfriend = async (friendUid: string) => {
    if (!user?.uid) return;
    if (!window.confirm("আপনি কি নিশ্চিতভাবে আনফ্রেন্ড করতে চান?")) return;
    setActionLoadingId(friendUid);
    try {
      await removeFriend(user.uid, friendUid);
      setFriendsList(prev => prev.filter(f => f.uid !== friendUid));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendRequest = async (targetUid: string) => {
    if (!user?.uid) return;
    setActionLoadingId(targetUid);
    try {
      await sendFriendRequest(user.uid, targetUid);
      alert("ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে!");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    username: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    isBloodDonor: false,
    photoURL: "",
    coverURL: "",
    division: "",
    district: "",
    upazila: "",
    union: "",
    village: "",
    address: "",
    hometown: "",
    relationshipStatus: "",
    highSchool: "",
    collegeUniversity: "",
    workCompany: "",
    workPosition: "",
    workExperience: "",
    occupation: "",
    education: "",
    bio: "",
    facebook: "",
    twitter: "",
    youtube: "",
    privacySettings: {
      phone: "public" as "public" | "only_me",
      address: "public" as "public" | "only_me",
      dob: "public" as "public" | "only_me",
      email: "public" as "public" | "only_me",
      profileVisibility: "public" as "public" | "private",
    },
  });

  const [privacySavingKey, setPrivacySavingKey] = useState<string | null>(null);

  const handleQuickPrivacyToggle = async (
    key: "phone" | "address" | "dob" | "email" | "profileVisibility",
    value: "public" | "only_me" | "private"
  ) => {
    if (!userProfile || !updateUserProfile) return;
    setPrivacySavingKey(key);
    try {
      const updated = {
        ...(userProfile.privacySettings || {}),
        [key]: value,
      };
      await updateUserProfile({ privacySettings: updated });
    } catch (err) {
      console.error("Failed to update privacy:", err);
    } finally {
      setPrivacySavingKey(null);
    }
  };

  // Sync formData with userProfile
  useEffect(() => {
    if (userProfile || user) {
      const derivedPhone = userProfile?.phone || 
        (userProfile as any)?.phoneNumber || 
        (userProfile as any)?.mobile || 
        user?.phoneNumber || 
        (user?.email && /^01\d{9}@puthiadiary\.com$/.test(user.email) ? user.email.split('@')[0] : '') || 
        (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_phone') || '' : '') || 
        '';

      const rawVillage = cleanWardFromText((userProfile?.village && userProfile.village !== 'তথ্য নেই') ? userProfile.village : '');
      const rawUnion = (userProfile?.union && userProfile.union !== 'তথ্য নেই') ? userProfile.union : 'বানেশ্বর';
      const rawAddress = cleanWardFromText((userProfile?.address && userProfile.address !== 'তথ্য নেই') ? userProfile.address : '');
      
      const derivedLocation = cleanWardFromText(rawAddress || 
        (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_location') || '' : '') || 
        (rawVillage ? `${rawVillage}${rawUnion ? ', ' + rawUnion : ''}` : ''));
      const derivedVillage = cleanWardFromText(rawVillage || 
        (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_village') || '' : '') || 
        derivedLocation);
      const derivedUnion = rawUnion || 
        (typeof localStorage !== 'undefined' ? localStorage.getItem('auth_registered_union') || '' : '') || 
        'বানেশ্বর';

      setFormData({
        name: userProfile?.name || user?.displayName || "",
        nickname: userProfile?.nickname || "",
        username: (userProfile as any)?.username || "",
        email: userProfile?.email || user?.email || "",
        phone: derivedPhone,
        dob: userProfile?.dob || "",
        gender: userProfile?.gender || "",
        bloodGroup: userProfile?.bloodGroup || "",
        isBloodDonor: userProfile?.isBloodDonor || false,
        photoURL: userProfile?.photoURL || user?.photoURL || "",
        coverURL: userProfile?.coverURL || "",
        division: userProfile?.division || "রাজশাহী",
        district: userProfile?.district || "রাজশাহী",
        upazila: userProfile?.upazila || "পুঠিয়া",
        union: derivedUnion,
        village: derivedVillage,
        address: derivedLocation || (derivedVillage ? `${derivedVillage}, ${derivedUnion}` : (derivedUnion ? `${derivedUnion}, পুঠিয়া` : '')),
        hometown: (userProfile as any)?.hometown || "",
        relationshipStatus: (userProfile as any)?.relationshipStatus || "",
        highSchool: (userProfile as any)?.highSchool || "",
        collegeUniversity: (userProfile as any)?.collegeUniversity || "",
        workCompany: (userProfile as any)?.workCompany || "",
        workPosition: (userProfile as any)?.workPosition || "",
        workExperience: (userProfile as any)?.workExperience || "",
        occupation: userProfile?.occupation || (userProfile as any)?.workCompany || "",
        education: userProfile?.education || (userProfile as any)?.collegeUniversity || "",
        bio: userProfile?.bio || "",
        facebook: userProfile?.facebook || "",
        twitter: userProfile?.twitter || "",
        youtube: userProfile?.youtube || "",
        privacySettings: {
          phone: userProfile?.privacySettings?.phone || "public",
          address: userProfile?.privacySettings?.address || "public",
          dob: userProfile?.privacySettings?.dob || "public",
          email: userProfile?.privacySettings?.email || "public",
          profileVisibility: userProfile?.privacySettings?.profileVisibility || "public",
        },
      });
    }
  }, [userProfile, user]);

  // Cover photo changes
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        await updateUserProfile({ coverURL: base64 });
        alert(language === "bn" ? "কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!" : "Cover photo updated successfully!");
      } catch (err) {
        console.error(err);
        alert(language === "bn" ? "ছবি আপলোড করতে সমস্যা হয়েছে।" : "Failed to upload cover photo.");
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, photoURL: base64 }));
        if (updateUserProfile) {
          await updateUserProfile({ photoURL: base64 });
        }
        alert(language === "bn" ? "প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!" : "Profile photo updated successfully!");
      } catch (err) {
        console.error(err);
        alert(language === "bn" ? "ছবি আপলোড করতে সমস্যা হয়েছে।" : "Failed to upload image.");
      } finally {
        e.target.value = "";
      }
    }
  };

  // Profile Completion Checklist Items
  const checklistItems = [
    { id: "name", label: "নাম", done: Boolean(userProfile?.name?.trim() || user?.displayName?.trim()) },
    { id: "phone", label: "মোবাইল", done: Boolean(userProfile?.phone?.trim()) },
    { id: "photo", label: "প্রোফাইল ছবি", done: Boolean(userProfile?.photoURL?.trim() || user?.photoURL?.trim()) },
    { id: "address", label: "ঠিকানা", done: Boolean(userProfile?.address?.trim() || userProfile?.village?.trim() || userProfile?.union?.trim()) },
    { id: "bio", label: "পরিচিতি", done: Boolean(userProfile?.bio?.trim()) },
    { id: "occupation", label: "পেশা", done: Boolean(userProfile?.occupation?.trim()) },
  ];

  const completedItemsCount = checklistItems.filter(item => item.done).length;
  const completionPercentage = Math.round((completedItemsCount / checklistItems.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name?.trim()) {
      setEditError("দয়া করে আপনার পুরো নাম লিখুন।");
      return;
    }
    if (!formData.phone?.trim() || formData.phone.trim().length < 11) {
      setEditError("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন।");
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const updates: any = {
        name: formData.name?.trim() || "",
        nickname: formData.nickname?.trim() || "",
        email: formData.email?.trim() || "",
        phone: formData.phone?.trim() || "",
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        isBloodDonor: formData.isBloodDonor,
        photoURL: formData.photoURL,
        coverURL: formData.coverURL,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        union: formData.union,
        address: formData.address,
        hometown: formData.hometown,
        relationshipStatus: formData.relationshipStatus,
        highSchool: formData.highSchool,
        collegeUniversity: formData.collegeUniversity,
        workCompany: formData.workCompany,
        workPosition: formData.workPosition,
        workExperience: formData.workCompany ? `${formData.workPosition ? formData.workPosition + ' at ' : ''}${formData.workCompany}` : (formData.workExperience || formData.occupation),
        occupation: formData.workCompany || formData.occupation,
        education: formData.collegeUniversity || formData.highSchool || formData.education,
        bio: formData.bio,
        facebook: formData.facebook,
        twitter: formData.twitter,
        youtube: formData.youtube,
        privacySettings: formData.privacySettings,
      };

      await updateUserProfile(updates);
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setEditError("তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setEditLoading(false);
    }
  };

  const displayName = userProfile?.name || user?.displayName || "josim uddin";
  const displayPhone = userProfile?.phone || "01712-233444";
  const followersCount = userProfile?.followers?.length || userProfile?.followersCount || 0;
  const friendsCount = userProfile?.friends?.length || userProfile?.friendsCount || 0;
  const requestsCount = userProfile?.friendRequestsReceived?.length || 0;

  const filteredSuggestedUsers = suggestedUsers.filter(u => 
    !searchQuery || 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.phone && u.phone.includes(searchQuery)) ||
    (u.union && u.union.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full pb-8">
      {/* Main Full-Width Profile Container */}
      <div className="bg-white relative">
        
        {/* Top Forest Green Cover Banner with Organic Wave (Full Width) */}
        <div className="h-32 sm:h-40 md:h-48 relative overflow-hidden bg-gradient-to-br from-[#005a3e] via-[#004832] to-[#013525]">
          {/* Custom SVG Organic Wave Contour */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 320" 
            preserveAspectRatio="none"
          >
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>

          {userProfile?.coverURL && (
            <img 
              src={userProfile.coverURL} 
              alt="Cover" 
              className="w-full h-full object-cover relative z-10" 
            />
          )}

          {/* Top Left Action Button: Profile Menu (উপরে বাম পাশে) */}
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5 z-20">
            {/* Profile Menu Trigger (Hamburger / Action Menu) */}
            <button
              type="button"
              onClick={() => setShowProfileMenu(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center border border-white/30 backdrop-blur-xs shadow-md cursor-pointer transition-all active:scale-90"
              title="প্রোফাইল মেনু"
              aria-label="Profile Menu"
            >
              <Menu size={17} />
            </button>
          </div>

          {/* Cover Camera Button (Bottom Right) */}
          <label className="absolute right-3 bottom-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border border-white/20 shadow-md cursor-pointer transition-all active:scale-95 z-20" title="কভার ছবি পরিবর্তন">
            <Camera size={13} />
            <input 
              ref={coverInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleCoverUpload} 
              className="hidden" 
            />
          </label>
        </div>

        {/* Profile Header (Avatar + Information Row) */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-0 pb-3">
          <div className="flex items-start gap-3 sm:gap-5">
            
            {/* Left Avatar Container (Overlapping compact banner) */}
            <div className="relative -mt-10 sm:-mt-12 shrink-0">
              <div 
                onClick={() => avatarInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-md relative cursor-pointer group"
              >
                <div className="w-full h-full rounded-full bg-[#cbd5e1] overflow-hidden flex items-center justify-center relative">
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt={displayName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#cbd5e1] text-[#64748b]">
                      <User size={42} className="mt-1" />
                    </div>
                  )}
                </div>

                {/* Online Status Dot (Top-Left at ~10 o'clock) */}
                <span className="absolute top-0.5 left-1 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white shadow-xs" />

                {/* Avatar Camera Button (Bottom-Right at ~4 o'clock) */}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-emerald-800 border border-emerald-100 shadow-md flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer"
                  aria-label="Change profile photo"
                >
                  <Camera size={12} className="text-emerald-800" />
                </button>
                
                <input 
                  ref={avatarInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Right Side User Information */}
            <div className="flex-1 min-w-0 pt-1">
              {/* Name and Verified Badge */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">
                  {displayName}
                </h2>
                <BadgeCheck size={18} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium mt-1">
                <Phone size={13} className="text-slate-600 shrink-0" />
                <span className="tracking-tight">{displayPhone}</span>
              </div>

              {/* Pill Buttons: Public View & Edit (Single line) */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => navigate(`/profile/${userProfile?.uid || user?.uid || 'me'}`, { state: { from: '/profile' } })}
                  className="bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
                >
                  <Globe size={13} className="text-emerald-700 shrink-0" />
                  <span>পাবলিক ভিউ</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 border border-gray-200 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
                >
                  <Pencil size={13} className="text-slate-600 shrink-0" />
                  <span>সম্পাদনা</span>
                </button>
              </div>
            </div>
          </div>

          {/* Followers / Friends Row (2 Boxes side-by-side) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Box 1: Followers */}
            <button
              onClick={openFollowersModal}
              className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl py-3 px-3 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer group"
            >
              <Users size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">
                {followersCount} ফলোয়ার
              </span>
            </button>

            {/* Box 2: Friends */}
            <button
              onClick={openFriendsModal}
              className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl py-3 px-3 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer group relative"
            >
              <HeartHandshake size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-800">
                {friendsCount} ফ্রেন্ড
              </span>
              {requestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {requestsCount}
                </span>
              )}
            </button>
          </div>

          {/* Add Bio Button */}
          <div className="mt-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm shadow-2xs hover:bg-emerald-50/40 transition-all active:scale-98 cursor-pointer"
            >
              <Pencil size={14} className="text-emerald-600" />
              <span className="truncate">
                {userProfile?.bio ? userProfile.bio : "+ আপনার বায়ো বা পরিচিতি যোগ করুন"}
              </span>
            </button>
          </div>

          {/* Achievement / Reward Compact Card (আমার অর্জন) */}
          <div className="mt-3 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/70 border border-amber-200/90 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🏆</span>
                <h4 className="text-xs font-black text-amber-950 tracking-tight">আমার অর্জন</h4>
                <span className="text-[9px] font-extrabold bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded-md">
                  Rewards
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBadgeModal(true)}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-none p-0 transition-colors"
              >
                <span>সব অর্জন দেখুন</span>
                <ChevronRight size={13} className="text-amber-700 -ml-0.5" />
              </button>
            </div>

            {/* Compact Stats Grid (4 Mini Columns) */}
            <div className="grid grid-cols-4 gap-1.5 pt-2.5 text-center">
              {/* 1. Points */}
              <div 
                onClick={() => setShowBadgeModal(true)}
                className="bg-white/90 hover:bg-white rounded-xl p-2 border border-amber-100 shadow-2xs cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center min-h-[58px]"
              >
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-0.5 leading-none">
                  <span>⭐</span>
                  <span>{userProfile?.stars || 120}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 block">Points</span>
              </div>

              {/* 2. Badges */}
              <div 
                onClick={() => setShowBadgeModal(true)}
                className="bg-white/90 hover:bg-white rounded-xl p-2 border border-amber-100 shadow-2xs cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center min-h-[58px]"
              >
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-0.5 leading-none">
                  <span>🎖️</span>
                  <span>{userProfile?.badges?.length || 4}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 block">Badges</span>
              </div>

              {/* 3. Level */}
              <div 
                onClick={() => setShowBadgeModal(true)}
                className="bg-white/90 hover:bg-white rounded-xl p-2 border border-amber-100 shadow-2xs cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center min-h-[58px]"
              >
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-0.5 leading-none">
                  <span>🏅</span>
                  <span>Level {Math.max(1, Math.min(10, Math.floor((userProfile?.stars || 120) / 40) + 1))}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 block">লেভেল</span>
              </div>

              {/* 4. Rank */}
              <div 
                onClick={() => setShowBadgeModal(true)}
                className="bg-white/90 hover:bg-white rounded-xl p-2 border border-amber-100 shadow-2xs cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center min-h-[58px]"
              >
                <div className="text-[11px] font-black text-slate-800 flex items-center justify-center gap-0.5 leading-none">
                  <span>📊</span>
                  <span>#{userProfile?.rank || 125}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 mt-1 block">Rank</span>
              </div>
            </div>
          </div>

          {/* Citizen Status Badge (Interactive) */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowBadgeModal(true)}
              className="w-full bg-[#fefce8] hover:bg-[#fef9c3] border border-amber-200/80 rounded-2xl py-2.5 px-4 flex items-center justify-between text-[#92400e] font-bold text-sm shadow-2xs transition-all active:scale-98 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{userProfile?.role === "super_admin" ? "👑" : userProfile?.role === "admin" ? "🛡️" : getBadgeForStars(userProfile?.stars || 0).emoji}</span>
                <span>
                  {userProfile?.role === "super_admin" 
                    ? "সুপার এডমিন" 
                    : userProfile?.role === "admin" 
                      ? "এডমিন" 
                      : getBadgeForStars(userProfile?.stars || 0).label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800/80 bg-amber-100/80 px-2.5 py-0.5 rounded-full group-hover:bg-amber-200/80 transition-colors">
                <Info size={12} className="text-amber-700" />
                <span>বিস্তারিত</span>
                <ChevronRight size={13} className="text-amber-700 -ml-0.5" />
              </div>
            </button>
          </div>

          {/* Smart Profile Completion Card (প্রোফাইল সম্পূর্ণতা) */}
          <div 
            onClick={() => setIsEditModalOpen(true)}
            className="mt-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white rounded-2xl sm:rounded-3xl border border-emerald-200/90 p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-md transition-all space-y-3 relative overflow-hidden"
          >
            {/* Decorative glows */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Title with Percentage & Progress bar */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>প্রোফাইল সম্পূর্ণ করুন</span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {completionPercentage}%
                  </span>
                </h4>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {completedItemsCount}/{checklistItems.length} সম্পন্ন
                </span>
              </div>
              
              {/* Progress Bar Track */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-emerald-100/80 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full transition-all duration-700 shadow-xs" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Smart Checklist (2 Columns) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-emerald-100/60 relative z-10">
              {checklistItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    item.done ? "text-emerald-900 font-bold" : "text-slate-500 font-medium"
                  }`}
                >
                  {item.done ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                      <Check size={11} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 bg-white" />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Action Button: “প্রোফাইল সম্পূর্ণ করুন →” */}
            <div className="pt-1 relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>{completionPercentage === 100 ? "প্রোফাইল তথ্য আপডেট করুন" : "প্রোফাইল সম্পূর্ণ করুন"}</span>
                <ArrowRight size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 👤 আমার তথ্য Section (Personal, Contact, Address, Education, Profession, Social) */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>👤 আমার তথ্য</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    যে তথ্য আপনি পাবলিক করতে চান শুধু সেটাই প্রদর্শিত হবে
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              >
                <Pencil size={12} />
                <span>তথ্য পরিবর্তন</span>
              </button>
            </div>

            {/* 6 Structured Categories */}
            <div className="space-y-3">
              {/* 1. ব্যক্তিগত তথ্য */}
              <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <User size={13} className="text-emerald-600" />
                    ১. ব্যক্তিগত তথ্য
                  </span>
                  <div className="flex items-center gap-1.5">
                    {userProfile?.privacySettings?.dob === "only_me" && (
                      <span className="text-[9px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">
                        🔒 জন্মতারিখ গোপন
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                      🌐 পাবলিক
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">পুরো নাম</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.name || user?.displayName || "প্রদান করা হয়নি"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">ডাক নাম</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.nickname || "তথ্য নেই"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center justify-between">
                      <span>জন্মতারিখ</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {userProfile?.privacySettings?.dob === "only_me" ? "🔒 শুধু আমি" : "🌐 পাবলিক"}
                      </span>
                    </span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.dob ? userProfile.dob : "তথ্য নেই"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">লিঙ্গ</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.gender || "তথ্য নেই"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">রক্তের গ্রুপ</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span>{userProfile?.bloodGroup || "তথ্য নেই"}</span>
                      {userProfile?.isBloodDonor && (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md">
                          রক্তদাতা
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold block">পরিচিতি / বায়ো</span>
                    <span className="font-medium text-slate-700 italic block mt-0.5 text-[11px]">
                      {userProfile?.bio ? `"${userProfile.bio}"` : "নিজের সম্পর্কে কোনো বায়ো যুক্ত করেননি"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. যোগাযোগের তথ্য */}
              <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Phone size={13} className="text-emerald-600" />
                    ২. যোগাযোগের তথ্য
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                    প্রাইভেসি সুরক্ষিত
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">মোবাইল নম্বর</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        userProfile?.privacySettings?.phone === "only_me"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {userProfile?.privacySettings?.phone === "only_me" ? "🔒 শুধু আমি" : "🌐 পাবলিক"}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 font-mono truncate block mt-0.5">
                      {userProfile?.phone || "প্রদান করা হয়নি"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">ইমেইল ঠিকানা</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        userProfile?.privacySettings?.email === "only_me"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {userProfile?.privacySettings?.email === "only_me" ? "🔒 শুধু আমি" : "🌐 পাবলিক"}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.email || user?.email || "প্রদান করা হয়নি"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. ঠিকানা */}
              <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <MapPin size={13} className="text-emerald-600" />
                    ৩. ঠিকানা
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    userProfile?.privacySettings?.address === "only_me"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100/60 text-emerald-700"
                  }`}>
                    {userProfile?.privacySettings?.address === "only_me" ? "🔒 শুধু আমি (Private)" : "🌐 পাবলিক"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">গ্রাম / এলাকা</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {cleanWardFromText(userProfile?.village) || "তথ্য নেই"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-slate-400 font-bold block">ইউনিয়ন ও উপজেলা</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.union || "বানেশ্বর"}, পুঠিয়া
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold block">বিস্তারিত ঠিকানা</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {cleanWardFromText(userProfile?.address) || `${userProfile?.village ? cleanWardFromText(userProfile.village) + ", " : ""}${userProfile?.union || "পুঠিয়া"}, পুঠিয়া, রাজশাহী`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. শিক্ষা ও ৫. পেশা */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* শিক্ষা */}
                <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <GraduationCap size={14} className="text-emerald-600" />
                      ৪. শিক্ষা
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                      🌐 পাবলিক
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 text-xs min-h-[52px] flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold block">যোগ্যতা ও প্রতিষ্ঠান</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.education || "তথ্য যোগ করা হয়নি"}
                    </span>
                  </div>
                </div>

                {/* পেশা */}
                <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <Briefcase size={14} className="text-emerald-600" />
                      ৫. পেশা
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                      🌐 পাবলিক
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100 text-xs min-h-[52px] flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold block">পেশা ও কর্মক্ষেত্র</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                      {userProfile?.occupation || "তথ্য যোগ করা হয়নি"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. সামাজিক তথ্য */}
              <div className="bg-gray-50/70 rounded-2xl p-3.5 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Share2 size={13} className="text-emerald-600" />
                    ৬. সামাজিক তথ্য (সোশ্যাল মিডিয়া)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
                    🌐 পাবলিক
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-blue-600 font-bold block">ফেসবুক</span>
                    {userProfile?.facebook ? (
                      <a 
                        href={userProfile.facebook.startsWith("http") ? userProfile.facebook : `https://${userProfile.facebook}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-bold text-blue-600 hover:underline truncate block text-xs mt-0.5"
                      >
                        প্রোফাইল লিংক ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px] block mt-0.5">সংযুক্ত নেই</span>
                    )}
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-sky-600 font-bold block">টুইটার / X</span>
                    {userProfile?.twitter ? (
                      <a 
                        href={userProfile.twitter.startsWith("http") ? userProfile.twitter : `https://${userProfile.twitter}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-bold text-sky-600 hover:underline truncate block text-xs mt-0.5"
                      >
                        প্রোফাইল লিংক ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px] block mt-0.5">সংযুক্ত নেই</span>
                    )}
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] text-rose-600 font-bold block">ইউটিউব</span>
                    {userProfile?.youtube ? (
                      <a 
                        href={userProfile.youtube.startsWith("http") ? userProfile.youtube : `https://${userProfile.youtube}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-bold text-rose-600 hover:underline truncate block text-xs mt-0.5"
                      >
                        চ্যানেল লিংক ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[11px] block mt-0.5">সংযুক্ত নেই</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[11px] text-emerald-900 leading-relaxed">
              <Lock size={14} className="text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>গোপনীয়তার নিশ্চয়তা:</strong> আপনি নিজে যে তথ্যগুলো প্রদান করবেন শুধুমাত্র সেই তথ্যগুলোই আপনার পাবলিক প্রোফাইলে অন্যদের কাছে প্রদর্শিত হবে। কোনো তথ্য প্রদর্শন না করতে চাইলে তা নিচে বা সম্পাদনায় গোপন রাখুন।
              </span>
            </div>
          </div>

          {/* 🔒 গোপনীয়তা ও প্রাইভেসি কন্ট্রোল Section (Privacy Controls Card) */}
          <div className="mt-4 bg-gradient-to-br from-white via-slate-50/70 to-emerald-50/30 rounded-2xl border border-emerald-200/70 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>গোপনীয়তা ও প্রাইভেসি কন্ট্রোল</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.2 rounded-full">
                      Privacy
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    ১-ক্লিকে পাবলিক অথবা গোপন নির্ধারণ করুন
                  </p>
                </div>
              </div>
              {privacySavingKey && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Loader2 size={12} className="animate-spin text-emerald-600" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* Privacy Controls List */}
            <div className="space-y-2.5 text-xs">
              {/* 1. Profile Visibility */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Profile Visibility</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {userProfile?.privacySettings?.profileVisibility === "private"
                      ? "🔒 প্রোফাইল সম্পূর্ণ প্রাইভেট (অন্যরা দেখতে পাবে না)"
                      : "🌐 প্রোফাইল পাবলিক (সব নাগরিক দেখতে পারবে)"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 gap-1 border border-slate-200/50">
                  <button
                    type="button"
                    disabled={privacySavingKey === "profileVisibility"}
                    onClick={() => handleQuickPrivacyToggle("profileVisibility", "public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.profileVisibility !== "private"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    disabled={privacySavingKey === "profileVisibility"}
                    onClick={() => handleQuickPrivacyToggle("profileVisibility", "private")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.profileVisibility === "private"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* 2. Phone Number */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone size={14} className="text-emerald-600 shrink-0" />
                    <span>ফোন নম্বর</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {userProfile?.privacySettings?.phone === "only_me"
                      ? "🔒 শুধু আমি (পাবলিক প্রোফাইলে লুকানো থাকবে)"
                      : "🌐 Public (প্রোফাইলে নম্বর প্রদর্শিত হবে)"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 gap-1 border border-slate-200/50">
                  <button
                    type="button"
                    disabled={privacySavingKey === "phone"}
                    onClick={() => handleQuickPrivacyToggle("phone", "public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.phone !== "only_me"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    disabled={privacySavingKey === "phone"}
                    onClick={() => handleQuickPrivacyToggle("phone", "only_me")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.phone === "only_me"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    শুধু আমি
                  </button>
                </div>
              </div>

              {/* 3. Address */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                    <span>ঠিকানা</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {userProfile?.privacySettings?.address === "only_me"
                      ? "🔒 শুধু আমি (গ্রাম ও পূর্ণ ঠিকানা গোপন থাকবে)"
                      : "🌐 Public (পাবলিক প্রোফাইলে দেখা যাবে)"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 gap-1 border border-slate-200/50">
                  <button
                    type="button"
                    disabled={privacySavingKey === "address"}
                    onClick={() => handleQuickPrivacyToggle("address", "public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.address !== "only_me"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    disabled={privacySavingKey === "address"}
                    onClick={() => handleQuickPrivacyToggle("address", "only_me")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.address === "only_me"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    শুধু আমি
                  </button>
                </div>
              </div>

              {/* 4. Date of Birth */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Eye size={14} className="text-emerald-600 shrink-0" />
                    <span>জন্মতারিখ</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {userProfile?.privacySettings?.dob === "only_me"
                      ? "🔒 শুধু আমি (জন্মতারিখ গোপন থাকবে)"
                      : "🌐 Public (পাবলিক প্রোফাইলে দৃশ্যমান)"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 gap-1 border border-slate-200/50">
                  <button
                    type="button"
                    disabled={privacySavingKey === "dob"}
                    onClick={() => handleQuickPrivacyToggle("dob", "public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.dob !== "only_me"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    disabled={privacySavingKey === "dob"}
                    onClick={() => handleQuickPrivacyToggle("dob", "only_me")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.dob === "only_me"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    শুধু আমি
                  </button>
                </div>
              </div>

              {/* 5. Email */}
              <div className="p-3 bg-white rounded-xl border border-gray-200/90 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-200 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Mail size={14} className="text-emerald-600 shrink-0" />
                    <span>ইমেইল</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {userProfile?.privacySettings?.email === "only_me"
                      ? "🔒 শুধু আমি (ইমেইল ঠিকানা গোপন থাকবে)"
                      : "🌐 Public (পাবলিক প্রোফাইলে দৃশ্যমান)"}
                  </span>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 gap-1 border border-slate-200/50">
                  <button
                    type="button"
                    disabled={privacySavingKey === "email"}
                    onClick={() => handleQuickPrivacyToggle("email", "public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.email !== "only_me"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    disabled={privacySavingKey === "email"}
                    onClick={() => handleQuickPrivacyToggle("email", "only_me")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userProfile?.privacySettings?.email === "only_me"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    শুধু আমি
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ⚡ আমার কার্যক্রম (সাম্প্রতিক কার্যক্রম Section) */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#006a4e] flex items-center justify-center">
                  <Activity size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>আমার কার্যক্রম</span>
                    <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      সাম্প্রতিক
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">আপনার সাম্প্রতিক অবদান ও ইন্টার‍্যাকশন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowActivityModal(true)}
                className="text-xs font-bold text-[#006a4e] hover:text-emerald-800 flex items-center gap-1 bg-emerald-50/60 hover:bg-emerald-100/70 px-2.5 py-1 rounded-xl transition-all cursor-pointer border-none"
              >
                <span>সব কার্যক্রম</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Recent 4 Activities List */}
            <div className="space-y-2.5">
              {/* Activity 1: Bookmark */}
              <div 
                onClick={() => navigate("/service/hospital")}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Bookmark size={15} className="fill-rose-500/20" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors truncate">
                      একটি হাসপাতাল Bookmark করেছেন
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স • ২ ঘণ্টা আগে
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 -ml-1" />
              </div>

              {/* Activity 2: Added Info */}
              <div 
                onClick={() => navigate("/service/doctor")}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006a4e] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <PlusCircle size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors truncate">
                      একটি তথ্য যোগ করেছেন
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      নতুন বিশেষজ্ঞ চিকিৎসকের চেম্বার তথ্য • গতকাল
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 -ml-1" />
              </div>

              {/* Activity 3: Review */}
              <div 
                onClick={() => navigate("/service/bazar")}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Star size={15} className="fill-amber-400 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors truncate">
                      একটি Review দিয়েছেন
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      বানেশ্বর বাজার পাইকারি কাঁচাবাজার (⭐⭐⭐⭐⭐) • ৩ দিন আগে
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 -ml-1" />
              </div>

              {/* Activity 4: Community Post */}
              <div 
                onClick={() => navigate("/feed")}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare size={15} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors truncate">
                      একটি পোস্ট করেছেন
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      পুঠিয়ার রাজবাড়ি পুকুরপাড়ে পরিষ্কার-পরিচ্ছন্নতা উদ্যোগ • ৫ দিন আগে
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 shrink-0 -ml-1" />
              </div>
            </div>

            {/* Bottom mini link */}
            <div className="pt-2 text-center border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowActivityModal(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/60"
              >
                <History size={13} className="text-slate-500" />
                <span>সব কার্যক্রম দেখুন</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* 🔖 সংরক্ষিত (Saved / Bookmark Section) */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <BookmarkCheck size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>সংরক্ষিত আইটেম</span>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      🔖 Bookmark
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">আপনার প্রয়োজনীয় সংরক্ষিত সকল তথ্য ও ঠিকানা</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("all");
                  setShowSavedModal(true);
                }}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50/70 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer border-none"
              >
                <span>সব দেখুন</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* 6 Quick Category Pills / Interactive Badges */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* 1. ডাক্তার */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("doctor");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-emerald-700 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Stethoscope size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">ডাক্তার</span>
                <span className="text-[9px] text-emerald-700 font-extrabold mt-0.5">২টি সংরক্ষিত</span>
              </button>

              {/* 2. হাসপাতাল */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("hospital");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-rose-600 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Hospital size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">হাসপাতাল</span>
                <span className="text-[9px] text-rose-700 font-extrabold mt-0.5">১টি সংরক্ষিত</span>
              </button>

              {/* 3. চাকরি */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("job");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-blue-600 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Briefcase size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">চাকরি</span>
                <span className="text-[9px] text-blue-700 font-extrabold mt-0.5">৩টি সংরক্ষিত</span>
              </button>

              {/* 4. ব্যবসা */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("business");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-purple-600 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Store size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">ব্যবসা</span>
                <span className="text-[9px] text-purple-700 font-extrabold mt-0.5">৪টি সংরক্ষিত</span>
              </button>

              {/* 5. সংবাদ */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("news");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-sky-50/70 hover:bg-sky-100/80 border border-sky-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-sky-600 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Newspaper size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">সংবাদ</span>
                <span className="text-[9px] text-sky-700 font-extrabold mt-0.5">২টি সংরক্ষিত</span>
              </button>

              {/* 6. পর্যটন */}
              <button
                type="button"
                onClick={() => {
                  setActiveSavedCategory("tourism");
                  setShowSavedModal(true);
                }}
                className="p-2.5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100 rounded-xl flex flex-col items-center justify-center text-center group transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white text-amber-600 flex items-center justify-center shadow-2xs mb-1 group-hover:scale-110 transition-transform">
                  <Compass size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">পর্যটন</span>
                <span className="text-[9px] text-amber-700 font-extrabold mt-0.5">১টি সংরক্ষিত</span>
              </button>
            </div>

            {/* Quick Preview Cards */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div 
                onClick={() => navigate("/service/hospital")}
                className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-all border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm">🏥</span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স</h5>
                    <p className="text-[10px] text-slate-500 truncate">হাসপাতাল ও জরুরি সেবা • ২৪ ঘণ্টা খোলা</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                  হাসপাতাল
                </span>
              </div>

              <div 
                onClick={() => navigate("/service/doctor")}
                className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-all border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm">👨‍⚕️</span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">ডা. মো. রফিকুল ইসলাম (মেডিসিন বিশেষজ্ঞ)</h5>
                    <p className="text-[10px] text-slate-500 truncate">পুঠিয়া বাজার চেম্বার • প্রতিদিন বিকাল ৫টা</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                  ডাক্তার
                </span>
              </div>

              <div 
                onClick={() => navigate("/service/tourism")}
                className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-all border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm">🏛️</span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">পুঠিয়া রাজবাড়ি ও শিব মন্দির কমপ্লেক্স</h5>
                    <p className="text-[10px] text-slate-500 truncate">ঐতিহাসিক পর্যটন স্পট • পুঠিয়া সদর</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                  পর্যটন
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {showBadgeModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowBadgeModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                    🌱
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">নাগরিক ব্যাজ পরিচিতি</h3>
                    <p className="text-[11px] text-slate-500">অর্জিত ব্যাজ ও কমিউনিটি র‍্যাংক</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBadgeModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Active Badge Hero Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-emerald-50/40 to-teal-50 border border-amber-200/80 text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl border border-amber-100">
                    {userProfile?.role === "super_admin" ? "👑" : userProfile?.role === "admin" ? "🛡️" : getBadgeForStars(userProfile?.stars || 0).emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {userProfile?.role === "super_admin" ? "👑 সুপার এডমিন" : userProfile?.role === "admin" ? "🛡️ এডমিন" : getBadgeForStars(userProfile?.stars || 0).label}
                    </h4>
                    <p className="text-xs text-amber-900 font-medium mt-1 leading-relaxed">
                      আমাদের পুঠিয়ায় যোগ দিয়েছেন সম্প্রতি।
                    </p>
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 text-[11px] text-slate-600 leading-normal">
                    💡 পরবর্তীতে আপনার <strong>Activity ও অবদানের</strong> ভিত্তিতে ইস্টার বৃদ্ধি পাবে এবং স্বয়ংক্রিয়ভাবে Badge পরিবর্তন হবে।
                  </div>
                </div>

                {/* Badge Levels Timeline / Tiers */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-600" />
                    <span>সকল ব্যাজ লেভেল (Badge Tiers)</span>
                  </h5>

                  <div className="space-y-2 text-xs">
                    {Object.values(BADGES).map((badge) => {
                      const isCurrent = getBadgeForStars(userProfile?.stars || 0).id === badge.id;
                      return (
                        <div 
                          key={badge.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                            isCurrent 
                              ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/40" 
                              : "bg-gray-50/70 border-gray-100"
                          }`}
                        >
                          <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs">
                            {badge.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{badge.label}</span>
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-100 shadow-2xs">
                                {badge.minPoints}+ ইস্টার
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* How to Earn Points */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>ইস্টার ও ব্যাজ বাড়ানোর উপায়</span>
                  </h5>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li className="flex items-center justify-between">
                      <span>• নতুন সেবা বা দোকান তথ্য যোগ:</span>
                      <strong className="text-emerald-700 font-bold">+৫০ ইস্টার</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>• জরুরি রক্তদাতা হিসেবে তালিকাভুক্তি:</span>
                      <strong className="text-emerald-700 font-bold">+৩০ ইস্টার</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>• প্রোফাইল ১০০% সম্পূর্ণ করা:</span>
                      <strong className="text-emerald-700 font-bold">+২০ ইস্টার</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>• নাগরিক মন্তব্য ও সঠিক তথ্য রিপোর্ট:</span>
                      <strong className="text-emerald-700 font-bold">+১০ ইস্টার</strong>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleImageUpload={handleImageUpload}
        handleCoverUpload={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const base64 = await compressImageToBase64(file);
              setFormData((prev: any) => ({ ...prev, coverURL: base64 }));
              if (updateUserProfile) {
                await updateUserProfile({ coverURL: base64 });
              }
            } catch (err) {
              console.error(err);
            } finally {
              e.target.value = '';
            }
          }
        }}
        editLoading={editLoading}
        editSuccess={editSuccess}
        editError={editError}
      />

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowersModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFollowersModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">আমার ফলোয়ারগণ</h3>
                    <p className="text-[11px] text-slate-500">{followersList.length} জন আপনাকে অনুসরণ করছেন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFollowersModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {loadingFollowers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-emerald-600" size={26} />
                  </div>
                ) : followersList.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 font-semibold text-xs">
                    এখনও কোনো ফলোয়ার নেই
                  </div>
                ) : (
                  followersList.map((uItem) => (
                    <div 
                      key={uItem.uid} 
                      className="flex items-center justify-between p-3 bg-gray-50/80 hover:bg-emerald-50/40 rounded-2xl border border-gray-100 transition-all"
                    >
                      <div 
                        onClick={() => {
                          setShowFollowersModal(false);
                          navigate(`/profile/${uItem.uid}`, { state: { from: '/profile' } });
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <img 
                          src={uItem.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${uItem.uid}`} 
                          alt={uItem.name} 
                          className="w-11 h-11 rounded-full object-cover border border-emerald-100 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{uItem.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <MapPin size={10} className="text-emerald-600" />
                            <span>{uItem.union || "বানেশ্বর"}, পুঠিয়া</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowFollowersModal(false);
                          navigate(`/profile/${uItem.uid}`, { state: { from: '/profile' } });
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        প্রোফাইল
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Friends & Friend Request Modal */}
      <AnimatePresence>
        {showFriendsModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFriendsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HeartHandshake size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">ফ্রেন্ড সিস্টেম</h3>
                    <p className="text-[11px] text-slate-500">বন্ধু তালিকা ও নাগরিক নেটওয়ার্ক</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFriendsModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 3 Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl my-3 shrink-0">
                <button
                  onClick={() => setFriendsTab("friends")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    friendsTab === "friends" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ফ্রেন্ডস ({friendsList.length})
                </button>
                <button
                  onClick={() => setFriendsTab("requests")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all relative cursor-pointer ${
                    friendsTab === "requests" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  অনুরোধ ({requestsList.length})
                  {requestsList.length > 0 && (
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 ml-1" />
                  )}
                </button>
                <button
                  onClick={() => setFriendsTab("find")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    friendsTab === "find" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ফ্রেন্ড খুঁজুন
                </button>
              </div>

              {/* Tab 1: Friends List */}
              {friendsTab === "friends" && (
                <div className="flex-1 overflow-y-auto space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {loadingFriends ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-emerald-600" size={26} />
                    </div>
                  ) : friendsList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-semibold text-xs space-y-3">
                      <p>আপনার তালিকায় কোনো ফ্রেন্ড নেই</p>
                      <button
                        onClick={() => setFriendsTab("find")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs"
                      >
                        নতুন ফ্রেন্ড খুঁজুন
                      </button>
                    </div>
                  ) : (
                    friendsList.map((fItem) => (
                      <div 
                        key={fItem.uid}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                      >
                        <div 
                          onClick={() => {
                            setShowFriendsModal(false);
                            navigate(`/profile/${fItem.uid}`, { state: { from: '/profile' } });
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <img 
                            src={fItem.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fItem.uid}`} 
                            alt={fItem.name} 
                            className="w-11 h-11 rounded-full object-cover border border-emerald-100 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{fItem.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <MapPin size={10} className="text-emerald-600" />
                              <span>{fItem.union || "বানেশ্বর"}, পুঠিয়া</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setShowFriendsModal(false);
                              navigate(`/profile/${fItem.uid}`, { state: { from: '/profile' } });
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            ভিউ
                          </button>
                          <button
                            onClick={() => handleUnfriend(fItem.uid)}
                            disabled={actionLoadingId === fItem.uid}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {actionLoadingId === fItem.uid ? <Loader2 size={12} className="animate-spin" /> : "আনফ্রেন্ড"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Friend Requests */}
              {friendsTab === "requests" && (
                <div className="flex-1 overflow-y-auto space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {requestsList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-semibold text-xs">
                      নতুন কোনো ফ্রেন্ড রিকোয়েস্ট নেই
                    </div>
                  ) : (
                    requestsList.map((rItem) => (
                      <div 
                        key={rItem.uid}
                        className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={rItem.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rItem.uid}`} 
                            alt={rItem.name} 
                            className="w-11 h-11 rounded-full object-cover border border-emerald-100 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{rItem.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <MapPin size={10} className="text-emerald-600" />
                              <span>{rItem.union || "বানেশ্বর"}, পুঠিয়া</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/50">
                          <button
                            onClick={() => handleAccept(rItem.uid)}
                            disabled={actionLoadingId === rItem.uid}
                            className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                          >
                            {actionLoadingId === rItem.uid ? <Loader2 size={12} className="animate-spin" /> : <><Check size={13} /> গ্রহণ করুন</>}
                          </button>
                          <button
                            onClick={() => handleReject(rItem.uid)}
                            disabled={actionLoadingId === rItem.uid}
                            className="py-1.5 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <X size={13} /> বাতিল
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Find Friends */}
              {friendsTab === "find" && (
                <div className="flex-1 overflow-y-auto space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="নাম, ফোন বা ইউনিয়ন দিয়ে খুঁজুন..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {filteredSuggestedUsers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-semibold text-xs">
                      কোনো নাগরিক পাওয়া যায়নি
                    </div>
                  ) : (
                    filteredSuggestedUsers.map((sUser) => {
                      const isRequested = userProfile?.friendRequestsSent?.includes(sUser.uid);
                      return (
                        <div 
                          key={sUser.uid}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                        >
                          <div 
                            onClick={() => {
                              setShowFriendsModal(false);
                              navigate(`/profile/${sUser.uid}`, { state: { from: '/profile' } });
                            }}
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                          >
                            <img 
                              src={sUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${sUser.uid}`} 
                              alt={sUser.name} 
                              className="w-11 h-11 rounded-full object-cover border border-emerald-100 shadow-2xs"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">{sUser.name || "নাগরিক"}</h4>
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                <MapPin size={10} className="text-emerald-600" />
                                <span>{sUser.union || "পুঠিয়া"}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSendRequest(sUser.uid)}
                            disabled={isRequested || actionLoadingId === sUser.uid}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                              isRequested
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95"
                            }`}
                          >
                            {actionLoadingId === sUser.uid ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isRequested ? (
                              "পাঠানো হয়েছে"
                            ) : (
                              <><UserPlus size={13} /> রিকোয়েস্ট</>
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
        {/* Activity Timeline Modal */}
        {showActivityModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowActivityModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-[#006a4e] flex items-center justify-center">
                    <Activity size={17} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">আমার সকল কার্যক্রম</h3>
                    <p className="text-[11px] text-slate-500">আপনার অবদান, বুকমার্ক ও ইন্টার‍্যাকশন হিস্টোরি</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowActivityModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Activity Timeline List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white">
                      📌
                    </div>
                    <div 
                      onClick={() => {
                        setShowActivityModal(false);
                        navigate("/service/hospital");
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800">একটি হাসপাতাল Bookmark করেছেন</h4>
                        <span className="text-[10px] text-slate-400 font-medium">২ ঘণ্টা আগে</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স জরুরী যোগাযোগে সংরক্ষণ করা হয়েছে</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#006a4e] border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white">
                      ➕
                    </div>
                    <div 
                      onClick={() => {
                        setShowActivityModal(false);
                        navigate("/service/doctor");
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800">একটি নতুন তথ্য যোগ করেছেন</h4>
                        <span className="text-[10px] text-slate-400 font-medium">গতকাল</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">বিশেষজ্ঞ চিকিৎসকের চেম্বার তথ্য ও সময়সূচী সংযোজন (অনুমোদিত +৫০ ইস্টার)</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white">
                      ⭐
                    </div>
                    <div 
                      onClick={() => {
                        setShowActivityModal(false);
                        navigate("/service/bazar");
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800">একটি রিভিউ প্রদান করেছেন</h4>
                        <span className="text-[10px] text-slate-400 font-medium">৩ দিন আগে</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">বানেশ্বর বাজার পাইকারি কাঁচাবাজারের পরিষ্কার-পরিচ্ছন্নতা ও দাম নিয়ে পর্যালোচনা</p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white">
                      💬
                    </div>
                    <div 
                      onClick={() => {
                        setShowActivityModal(false);
                        navigate("/feed");
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800">কমিউনিটিতে পোস্ট করেছেন</h4>
                        <span className="text-[10px] text-slate-400 font-medium">৫ দিন আগে</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">পুঠিয়া রাজবাড়িতে আগামী শুক্রবারের পরিচ্ছন্নতা কর্মসূচির আহ্বান</p>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-xs flex items-center justify-center text-[8px] text-white">
                      🌱
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800">স্মার্ট পুঠিয়ায় যোগদান</h4>
                        <span className="text-[10px] text-slate-400 font-medium">নিবন্ধন</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">সফলভাবে নাগরিক একাউন্ট তৈরি ও প্রোফাইল সক্রিয়করণ সম্পন্ন</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="w-full py-2.5 bg-[#006a4e] hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer border-none"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Saved / Bookmark Items Modal */}
        {showSavedModal && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowSavedModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                    <BookmarkCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">সংরক্ষিত আইটেম ও বুকমার্ক</h3>
                    <p className="text-[11px] text-slate-500">আপনার সেভ করা গুরুত্বপূর্ণ সেবা, ঠিকানা ও তথ্য</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSavedModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 py-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {[
                  { id: "all", label: "সবগুলো" },
                  { id: "doctor", label: "🩺 ডাক্তার" },
                  { id: "hospital", label: "🏥 হাসপাতাল" },
                  { id: "job", label: "💼 চাকরি" },
                  { id: "business", label: "🏪 ব্যবসা" },
                  { id: "news", label: "📰 সংবাদ" },
                  { id: "tourism", label: "🏛️ পর্যটন" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSavedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none ${
                      activeSavedCategory === tab.id
                        ? "bg-[#006a4e] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Saved Items List */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* 1. Doctor */}
                {(activeSavedCategory === "all" || activeSavedCategory === "doctor") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/doctor");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#006a4e] truncate">
                            ডা. মো. রফিকুল ইসলাম
                          </h4>
                          <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                            মেডিসিন
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          পুঠিয়া বাজার চেম্বার • প্রতিদিন বিকাল ৫টা - রাত ৮টা
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-[#006a4e] shrink-0" />
                  </div>
                )}

                {/* 2. Hospital */}
                {(activeSavedCategory === "all" || activeSavedCategory === "hospital") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/hospital");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-rose-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0">
                        🏥
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700 truncate">
                            পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স
                          </h4>
                          <span className="text-[9px] font-extrabold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded-md">
                            হাসপাতাল
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          জরুরি বিভাগ ও অ্যাম্বুলেন্স সেবা ২৪ ঘণ্টা • পুঠিয়া সদর
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-rose-700 shrink-0" />
                  </div>
                )}

                {/* 3. Job */}
                {(activeSavedCategory === "all" || activeSavedCategory === "job") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/job");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                        💼
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                            সেলস ও মার্কেটিং এক্সিকিউটিভ নিয়োগ
                          </h4>
                          <span className="text-[9px] font-extrabold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded-md">
                            ফুল-টাইম
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          বানেশ্বর এগ্রো ফার্ম • বেতন: ২০,০০০ - ২৫,০০০ টাকা
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-700 shrink-0" />
                  </div>
                )}

                {/* 4. Business */}
                {(activeSavedCategory === "all" || activeSavedCategory === "business") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/bazar");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-purple-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg shrink-0">
                        🏪
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 truncate">
                            বানেশ্বর পাইকারি আমের আড়ৎ ও বাজার
                          </h4>
                          <span className="text-[9px] font-extrabold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded-md">
                            ব্যবসা
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          আম ও কৃষি পণ্যের উত্তরবঙ্গের বৃহত্তম পাইকারি বাজার
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-purple-700 shrink-0" />
                  </div>
                )}

                {/* 5. News */}
                {(activeSavedCategory === "all" || activeSavedCategory === "news") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/news");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-sky-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-lg shrink-0">
                        📰
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 truncate">
                            পুঠিয়া উপজেলায় নতুন আধুনিক ড্রেনেজ প্রকল্প উদ্বোধন
                          </h4>
                          <span className="text-[9px] font-extrabold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded-md">
                            সংবাদ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          উপজেলা প্রশাসন ও পৌরসভার যৌথ উদ্যোগে জলাবদ্ধতা নিরসন
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-sky-700 shrink-0" />
                  </div>
                )}

                {/* 6. Tourism */}
                {(activeSavedCategory === "all" || activeSavedCategory === "tourism") && (
                  <div 
                    onClick={() => {
                      setShowSavedModal(false);
                      navigate("/service/tourism");
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg shrink-0">
                        🏛️
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 truncate">
                            পুঠিয়া রাজবাড়ি ও শিব মন্দির কমপ্লেক্স
                          </h4>
                          <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                            ঐতিহ্যবাহী
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          টেরাকোটা কারুকার্য খচিত প্রত্নতাত্ত্বিক নিদর্শন • পুঠিয়া সদর
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-amber-700 shrink-0" />
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSavedModal(false)}
                  className="w-full py-2.5 bg-[#006a4e] hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer border-none"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Profile Action Menu Modal / Sheet (প্রোফাইল মেনু) */}
        {showProfileMenu && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
            onClick={() => setShowProfileMenu(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-5 relative overflow-hidden border border-gray-100 max-h-[88vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center font-bold">
                    <Menu size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">প্রোফাইল মেনু</h3>
                    <p className="text-[11px] text-slate-500">আপনার একাউন্ট, সেটিংস ও সেবা নিয়ন্ত্রণ</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Menu Items List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* 1. প্রোফাইল ও সেটিংস গ্রুপ */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block mb-2">
                    অ্যাকাউন্ট ও নিরাপত্তা
                  </span>
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {/* প্রোফাইল সম্পাদনা */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-100">
                          <Pencil size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">প্রোফাইল সম্পাদনা</h4>
                          <p className="text-[10px] text-slate-500">ব্যক্তিগত ও যোগাযোগের তথ্য পরিবর্তন</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* অ্যাকাউন্ট সেটিংস */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-2xs border border-slate-200">
                          <Settings size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">অ্যাকাউন্ট সেটিংস</h4>
                          <p className="text-[10px] text-slate-500">ভাষা ও ব্যক্তিগত পছন্দসমূহ</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* Privacy */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Scroll to privacy section or open settings
                        const el = document.getElementById("privacy-settings-section");
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate("/settings");
                        }
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-2xs border border-teal-100">
                          <Lock size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">Privacy (গোপনীয়তা)</h4>
                          <p className="text-[10px] text-slate-500">পাবলিক প্রোফাইল ও তথ্য প্রদর্শন নিয়ন্ত্রণ</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* Notification */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-indigo-700 flex items-center justify-center shadow-2xs border border-indigo-100">
                          <Bell size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">Notification (নোটিফিকেশন)</h4>
                          <p className="text-[10px] text-slate-500">পুশ, এসএমএস ও জরুরী এলার্ট</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* Security */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/settings");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-blue-700 flex items-center justify-center shadow-2xs border border-blue-100">
                          <Shield size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">Security (নিরাপত্তা)</h4>
                          <p className="text-[10px] text-slate-500">পাসওয়ার্ড ও দ্বি-স্তরীয় যাচাইকরণ</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* 2. আমার কার্যক্রম ও কন্টেন্ট গ্রুপ */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block mb-2">
                    আমার কার্যক্রম ও সেবা
                  </span>
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {/* আমার কার্যক্রম */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowActivityModal(true);
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-2xs border border-teal-100">
                          <Activity size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার কার্যক্রম</h4>
                          <p className="text-[10px] text-slate-500">সাম্প্রতিক সকল অবদান ও ইন্টারঅ্যাকশন</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* আমার পোস্ট */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/feed");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-2xs border border-blue-100">
                          <MessageSquare size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার পোস্ট</h4>
                          <p className="text-[10px] text-slate-500">কমিউনিটি ফিডে প্রকাশিত পোস্টসমূহ</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* আমার আবেদন */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/service/emergency");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-amber-700 flex items-center justify-center shadow-2xs border border-amber-100">
                          <FileText size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার আবেদন</h4>
                          <p className="text-[10px] text-slate-500">নাগরিক অভিযোগ ও সেবা আবেদন হিস্ট্রি</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* আমার ব্যবসা */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/service/bazar");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-purple-700 flex items-center justify-center shadow-2xs border border-purple-100">
                          <Store size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার ব্যবসা</h4>
                          <p className="text-[10px] text-slate-500">দোকান ও বাণিজ্যিক লিস্টিং পরিচালনা</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* আমার বিজ্ঞাপন */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/service/bazar");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-2xs border border-orange-100">
                          <Megaphone size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার বিজ্ঞাপন</h4>
                          <p className="text-[10px] text-slate-500">ক্রয়-বিক্রয় ও প্রচারমূলক বিজ্ঞাপন</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* আমার সেবা */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/service/hospital");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-100">
                          <Sprout size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">আমার সেবা</h4>
                          <p className="text-[10px] text-slate-500">যুক্ত করা নাগরিক সেবাসমূহ</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* 3. রিওয়ার্ড, হেল্প ও লগআউট */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 block mb-2">
                    রিওয়ার্ড ও সাপোর্ট
                  </span>
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {/* Reward & Points */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowBadgeModal(true);
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-amber-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-2xs border border-amber-200">
                          <Trophy size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-800 flex items-center gap-1.5">
                            <span>Reward & Points</span>
                            <span className="text-[9px] bg-amber-200/70 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-md">
                              {userProfile?.stars || 120} pts
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-500">অর্জিত ইস্টার, ব্যাজ ও লেভেল তালিকা</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* Help & Support */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/about");
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-emerald-50/60 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-2xs border border-teal-100">
                          <HelpCircle size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#006a4e]">Help & Support</h4>
                          <p className="text-[10px] text-slate-500">সাহায্য, হেল্পলাইন ও সাধারণ জিজ্ঞাসা</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700" />
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={async () => {
                        setShowProfileMenu(false);
                        if (window.confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
                          const isSuperAdmin = userProfile?.role === 'super_admin' || user?.email === 'mdzosimuddin47@gmail.com';
                          sessionStorage.removeItem("super_admin_session_active");
                          await logout();
                          if (isSuperAdmin) {
                            navigate("/super-admin/login");
                          } else {
                            navigate("/");
                          }
                        }
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-rose-50/80 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs border border-rose-200">
                          <LogOut size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-rose-700">Logout (লগআউট)</h4>
                          <p className="text-[10px] text-slate-500">অ্যাকাউন্ট থেকে সুরক্ষিতভাবে প্রস্থান করুন</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-rose-400 group-hover:text-rose-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Close */}
              <div className="pt-2 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer border-none"
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

export default Profile;

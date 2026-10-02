import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  LogOut,
  CheckCircle,
  ArrowLeft,
  Droplet,
  PlusCircle,
  Trash2,
  Building,
  RefreshCcw,
  Sparkles,
  Edit,
  X,
  Users,
  ShieldCheck,
  Calendar,
  Lock,
  Check,
  TrendingUp,
  Heart,
  QrCode,
  ExternalLink,
  ChevronRight,
  Camera,
  Upload,
  Smartphone,
  Gift,
  Newspaper,
  School,
  Bell,
  Settings,
  Eye,
  BarChart3,
  HelpCircle,
  Shield,
  Download,
  FileText,
  Star,
  Languages,
  Briefcase,
} from "lucide-react";
import EducationalInstitutions from "./EducationalInstitutions";
import { useFavorites } from "./FavoriteContext";
import { LottieSuccessModal } from "./common/LottieSuccessModal";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { ToLetAd } from "../types";
import { updateToLetAd } from "../api";
import ProfileSettingsDetail from "./ProfileSettingsDetail";

// Subview imports for Dashboard Tabs
import { SocialOrganizations } from "./SocialOrganizations";
import BloodDonorManagement from "./BloodDonorManagement";
import { FishFarmInfo } from "./FishFarmInfo";
import { LivestockPoultry } from "./LivestockPoultry";
import { LocalNurseryInfo } from "./LocalNurseryInfo";
import { LocalServiceProviderInfo } from "./LocalServiceProviderInfo";
import { BusCounterInfo } from "./BusCounterInfo";
import { EducationCoachingHub } from "./EducationCoachingHub";
import { CareerGuidelineInfo } from "./CareerGuidelineInfo";
import { TrainingWorkshops } from "./TrainingWorkshops";
import { HospitalInfo } from "./HospitalInfo";
import { ClinicInfo } from "./ClinicInfo";
import { DoctorInfo } from "./DoctorInfo";
import { PharmacyInfo } from "./PharmacyInfo";
import { DiagnosticInfo } from "./DiagnosticInfo";
import { DentalInfo } from "./DentalInfo";
import { PoliceInfo } from "./PoliceInfo";
import { FireServiceInfo } from "./FireServiceInfo";
import { AmbulanceInfo } from "./AmbulanceInfo";
import { CyberHelplineInfo } from "./CyberHelplineInfo";
import { NationalHelplineInfo } from "./NationalHelplineInfo";
import { VeterinaryDoctorInfo } from "./VeterinaryDoctorInfo";
import { NgoSocial } from "./NgoSocial";
import { BankingFinance } from "./BankingFinance";
import { LocalShopDirectoryInfo } from "./LocalShopDirectoryInfo";
import { BuySellInfo } from "./BuySellInfo";
import { MarketPriceInfo } from "./MarketPriceInfo";
import { UpazilaQuiz } from "./UpazilaQuiz";

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }

    const duration = 1000;
    const steps = 40;
    const stepTime = Math.round(duration / steps);
    const increment = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString("bn-BD")}</>;
}

interface Props {
  onGoBack: () => void;
  onNavigateToSubView?: (viewId: string) => void;
}

export const UserProfileView: React.FC<Props> = ({
  onGoBack,
  onNavigateToSubView,
}) => {
  const {
    user,
    userProfile,
    logout,
    updateUserProfile,
    addStars,
    resetPassword,
  } = useAuth();
  const { 
    savedItems, 
    followedItems, 
    toggleFollow, 
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearNotifications 
  } = useFavorites();

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "profile"
    | "followed"
    | "badges"
    | "services"
    | "my_ads"
    | "rewards"
    | "news_post"
    | "educational_institutions"
    | "social_organizations"
    | "blood_donor_network"
    | "agriculture_farm"
    | "service_providers"
    | "transport_info"
    | "career_education"
    | "healthcare_medical"
    | "emergency_services"
    | "ngo"
    | "banking_finance"
    | "business_market"
    | "explore_history"
  >("overview");

  // Subtab states for nested views
  const [agriSubTab, setAgriSubTab] = useState<
    "fish" | "livestock" | "nursery"
  >("fish");
  const [careerSubTab, setCareerSubTab] = useState<
    "coaching" | "guideline" | "training"
  >("coaching");
  const [healthSubTab, setHealthSubTab] = useState<
    "hospital" | "clinic" | "doctor" | "pharmacy" | "diagnostic" | "dental"
  >("hospital");
  const [emergencySubTab, setEmergencySubTab] = useState<
    "police" | "fire" | "ambulance" | "cyber" | "national" | "vet"
  >("police");
  const [businessSubTab, setBusinessSubTab] = useState<
    "shops" | "buysell" | "prices"
  >("shops");

  // Quiz states
  const [quizSubTab, setQuizSubTab] = useState("live");
  const [interactiveQuizActive, setInteractiveQuizActive] = useState(false);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<
    Record<number, number>
  >({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [photoContestName, setPhotoContestName] = useState("");
  const [photoContestPhone, setPhotoContestPhone] = useState("");
  const [photoContestTitle, setPhotoContestTitle] = useState("");
  const [photoContestDesc, setPhotoContestDesc] = useState("");
  const [megaContestRegistered, setMegaContestRegistered] = useState(false);
  const [showMegaRegModal, setShowMegaRegModal] = useState(false);

  // Award badge on quiz completion
  useEffect(() => {
    const awardBadge = async () => {
      if (user && quizScore !== null && quizScore >= 3 && userProfile) {
        if (!userProfile.badges.includes("ইতিহাস অনুরাগী")) {
          const updatedBadges = [...userProfile.badges, "ইতিহাস অনুরাগী"];
          await updateUserProfile({ badges: updatedBadges });
        }
      }
    };
    awardBadge();
  }, [quizScore, user, userProfile]);

  // Mobile Recharge Reward States
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);
  const [pointsRequired, setPointsRequired] = useState<number>(0);
  const [rechargeNumber, setRechargeNumber] = useState("");
  const [rechargeOperator, setRechargeOperator] = useState("Grameenphone");
  const [rechargeConnectionType, setRechargeConnectionType] =
    useState("Prepaid");
  const [submittingRecharge, setSubmittingRecharge] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [rechargeError, setRechargeError] = useState("");
  const [rechargeHistory, setRechargeHistory] = useState<any[]>([]);
  const [loadingRecharge, setLoadingRecharge] = useState(false);
  const [allRechargeRequests, setAllRechargeRequests] = useState<any[]>([]); // For developer/admin panel

  // Lottie Success Modal State
  const [profileSuccessModal, setProfileSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type: 'recharge' | 'withdrawal';
    amount: number;
    recipient: string;
    methodOrOperator: string;
    trackingId?: string;
  } | null>(null);

  const fetchRecharges = async () => {
    if (!user) return;
    setLoadingRecharge(true);
    try {
      // 1. Fetch user specific requests
      const q = query(
        collection(db, "recharge_requests"),
        where("uid", "==", user.uid),
      );
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by createdAt descending
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRechargeHistory(list);

      // 2. Fetch all requests for the Developer/Admin test panel
      const isPrivileged = userProfile?.role === 'admin' || 
                          userProfile?.role === 'super_admin' || 
                          userProfile?.role === 'staff' || 
                          (userProfile?.permissions && userProfile.permissions.length > 0);

      if (isPrivileged) {
        const qAll = query(collection(db, "recharge_requests"));
        const snapAll = await getDocs(qAll);
        const listAll: any[] = [];
        snapAll.forEach((docSnap) => {
          listAll.push({ id: docSnap.id, ...docSnap.data() });
        });
        listAll.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setAllRechargeRequests(listAll);
      }
    } catch (err) {
      console.error("Error fetching recharges:", err);
    } finally {
      setLoadingRecharge(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "rewards") {
      fetchRecharges();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) {
        let tab = e.detail;
        if (tab === "add_school") tab = "educational_institutions";

        if (tab === "profile") {
          setActiveTab("profile");
          setIsEditingProfile(false);
          setProfileSectionView("details");
        } else if (tab === "edit-profile") {
          setActiveTab("profile");
          setIsEditingProfile(true);
          setProfileSectionView("edit");
        } else if (tab === "change-password") {
          setActiveTab("profile");
          setIsEditingProfile(false);
          setProfileSectionView("password");
        } else if (tab === "settings") {
          setActiveTab("profile");
          setIsEditingProfile(false);
          setProfileSectionView("settings");
        } else if (tab === "notifications") {
          setActiveTab("profile");
          setIsEditingProfile(false);
          setProfileSectionView("notifications");
        } else {
          setActiveTab(tab);
        }
      }
    };
    window.addEventListener(
      "changeProfileTab",
      handleTabChange as EventListener,
    );
    return () =>
      window.removeEventListener(
        "changeProfileTab",
        handleTabChange as EventListener,
      );
  }, []);

  // Profile edit states
  const [profileSectionView, setProfileSectionView] = useState<
    "details" | "edit" | "password" | "settings" | "notifications"
  >("details");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editUnion, setEditUnion] = useState("বানেশ্বর");
  const [editBloodGroup, setEditBloodGroup] = useState("O+");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Premium settings interactive sub-section state
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [editDob, setEditDob] = useState("১৯৯৮-০১-০১");
  const [editGender, setEditGender] = useState("পুরুষ");
  const [editAddress, setEditAddress] = useState("");
  const [editOccupation, setEditOccupation] = useState("উদ্যোক্তা");

  // Verification states
  const [nidNumber, setNidNumber] = useState("");
  const [nidStatus, setNidStatus] = useState<
    "unverified" | "pending" | "verified"
  >("unverified");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [mobileVerifyStatus, setMobileVerifyStatus] = useState<
    "unverified" | "verified"
  >("unverified");
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<
    "unverified" | "verified"
  >("unverified");

  // Privacy toggles
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [privacyHidePhone, setPrivacyHidePhone] = useState(false);
  const [privacyShareLocation, setPrivacyShareLocation] = useState(true);

  // Notification toggles
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifNewsEmergency, setNotifNewsEmergency] = useState(true);

  // Security states
  const [pinCode, setPinCode] = useState("");
  const [isPinSet, setIsPinSet] = useState(false);
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    {
      id: 1,
      name: "Windows PC • Chrome (ঢাকা, বাংলাদেশ)",
      active: true,
      time: "সক্রিয়",
    },
    {
      id: 2,
      name: "Android Phone • Chrome (রাজশাহী, বাংলাদেশ)",
      active: false,
      time: "২ ঘণ্টা আগে",
    },
  ]);

  // Appearance states
  const [fontSizeSetting, setFontSizeSetting] = useState<"sm" | "md" | "lg">(
    "md",
  );
  const [selectedLanguage, setSelectedLanguage] = useState<"bn" | "en">("bn");

  // Support states
  const [complainTitle, setComplainTitle] = useState("");
  const [complainCategory, setComplainCategory] = useState("সেবামূলক");
  const [complainDesc, setComplainDesc] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  // Photo upload states
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // State for business verification form
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("দোকান");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessSuccess, setBusinessSuccess] = useState(false);
  const [registeringBusiness, setRegisteringBusiness] = useState(false);

  // User's rental ads
  const [userAds, setUserAds] = useState<ToLetAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  // Rental Ad Editing States
  const [editingAd, setEditingAd] = useState<ToLetAd | null>(null);
  const [editAdTitle, setEditAdTitle] = useState("");
  const [editAdCategory, setEditAdCategory] = useState<
    "house" | "mess" | "shop" | "other" | "flat" | "room" | "sublet"
  >("house");
  const [editAdDescription, setEditAdDescription] = useState("");
  const [editAdRent, setEditAdRent] = useState("");
  const [editAdLocation, setEditAdLocation] = useState("");
  const [editAdDetails, setEditAdDetails] = useState("");
  const [editAdOwnerName, setEditAdOwnerName] = useState("");
  const [editAdOwnerPhone, setEditAdOwnerPhone] = useState("");

  const [editAdError, setEditAdError] = useState("");
  const [editAdSuccess, setEditAdSuccess] = useState(false);
  const [updatingAd, setUpdatingAd] = useState(false);

  // Digital card preview state
  const [cardFlipped, setCardFlipped] = useState(false);
  const [isVolunteerRegistered, setIsVolunteerRegistered] = useState(false);

  // News posting states
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState("reports");
  const [newsContent, setNewsContent] = useState("");
  const [newsLocation, setNewsLocation] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [postingNews, setPostingNews] = useState(false);
  const [newsSuccessMsg, setNewsSuccessMsg] = useState("");
  const [newsErrorMsg, setNewsErrorMsg] = useState("");
  const [myNewsList, setMyNewsList] = useState<any[]>([]);
  const [loadingMyNews, setLoadingMyNews] = useState(false);

  const fetchMyNews = async () => {
    if (!user) return;
    setLoadingMyNews(true);
    try {
      const q = query(
        collection(db, "citizen_news"),
        where("uid", "==", user.uid),
      );
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setMyNewsList(list);
    } catch (err) {
      console.error("Error fetching user news:", err);
    } finally {
      setLoadingMyNews(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছে ফেলতে চান?"))
      return;
    try {
      await deleteDoc(doc(db, "citizen_news", id));
      setMyNewsList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting news:", err);
    }
  };

  const handleNewsImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewsImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image loading error:", err);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (
      !newsTitle.trim() ||
      !newsCategory.trim() ||
      !newsContent.trim() ||
      !newsLocation.trim()
    ) {
      setNewsErrorMsg("অনুগ্রহ করে সবগুলি বাধ্যতামূলক (*) ঘর পূরণ করুন।");
      return;
    }

    setPostingNews(true);
    setNewsSuccessMsg("");
    setNewsErrorMsg("");

    try {
      const docData = {
        uid: user.uid,
        title: newsTitle.trim(),
        category: newsCategory,
        content: newsContent.trim(),
        desc:
          newsContent.trim().substring(0, 150) +
          (newsContent.trim().length > 150 ? "..." : ""),
        loc: newsLocation.trim(),
        image:
          newsImageUrl ||
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=500&q=80",
        authorName: userProfile?.name || "সচেতন নাগরিক",
        authorPhone: userProfile?.phone || "N/A",
        status: "pending",
        createdAt: new Date().toISOString(),
        time: "এইমাত্র",
      };

      const docRef = await addDoc(collection(db, "citizen_news"), docData);

      // Award 15 Civic Points!
      await addStars(5);

      setNewsSuccessMsg(
        "আপনার সংবাদটি সফলভাবে পাঠানো হয়েছে এবং এটি অ্যাডমিনের অনুমোদনের অপেক্ষায় আছে! ৫ ইস্টার আপনার অ্যাকাউন্টে যোগ হয়েছে! 🎉",
      );
      setNewsTitle("");
      setNewsContent("");
      setNewsLocation("");
      setNewsImageUrl("");

      // Reset file input if any
      const fileInput = document.getElementById(
        "news-image-input",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh list
      fetchMyNews();
    } catch (err) {
      console.error("Error posting news:", err);
      setNewsErrorMsg(
        "সংবাদ পোস্ট করার সময় কোনো ত্রুটি ঘটেছে। আবার চেষ্টা করুন।",
      );
    } finally {
      setPostingNews(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === "news_post") {
      fetchMyNews();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    const checkVol = async () => {
      try {
        const snap = await getDoc(doc(db, "volunteers", user.uid));
        if (snap.exists()) {
          setIsVolunteerRegistered(true);
        }
      } catch (err) {
        console.error("Error checking volunteer status:", err);
      }
    };
    checkVol();
  }, [user]);

  // Sync profile editing states on load or profile change
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
      setEditOccupation(userProfile.occupation || "উদ্যোক্তা");

      // Load verification states
      setMobileVerifyStatus(
        (userProfile.mobileVerifyStatus as any) ||
          (userProfile.phone ? "verified" : "unverified"),
      );
      setEmailVerifyStatus(
        (userProfile.emailVerifyStatus as any) ||
          (user?.emailVerified ? "verified" : "unverified"),
      );
      setNidStatus(userProfile.nidStatus || "unverified");
      setNidNumber(userProfile.nidNumber || "");

      // Load privacy & notification settings if present
      if (userProfile.privacySettings) {
        setPrivacyPublic(userProfile.privacySettings.privacyPublic ?? true);
        setPrivacyHidePhone(
          userProfile.privacySettings.privacyHidePhone ?? false,
        );
        setPrivacyShareLocation(
          userProfile.privacySettings.privacyShareLocation ?? true,
        );
      }
      if (userProfile.notificationSettings) {
        setNotifPush(userProfile.notificationSettings.notifPush ?? true);
        setNotifEmail(userProfile.notificationSettings.notifEmail ?? true);
        setNotifSms(userProfile.notificationSettings.notifSms ?? false);
        setNotifNewsEmergency(
          userProfile.notificationSettings.notifNewsEmergency ?? true,
        );
      }
      if (userProfile.securitySettings) {
        setIsPinSet(userProfile.securitySettings.isPinSet ?? false);
        setPinCode(userProfile.securitySettings.pinCode ?? "");
        setIs2FaEnabled(userProfile.securitySettings.is2FaEnabled ?? false);
      }
    }
  }, [userProfile, user]);

  // Compress and crop profile image to 250x250 square JPEG base64
  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          // Crop to a square first (centered)
          const size = Math.min(width, height);
          const xOffset = (width - size) / 2;
          const yOffset = (height - size) / 2;

          canvas.width = MAX_WIDTH;
          canvas.height = MAX_HEIGHT;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              img,
              xOffset,
              yOffset,
              size,
              size,
              0,
              0,
              MAX_WIDTH,
              MAX_HEIGHT,
            );
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            resolve(dataUrl);
          } else {
            reject(new Error("Canvas context is not available"));
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
      setPhotoError(
        "দয়া করে একটি সঠিক ছবি নির্বাচন করুন (png, jpg, jpeg ইত্যাদি)।",
      );
      return;
    }

    setPhotoUploading(true);
    setPhotoError("");
    setProfileSuccessMsg("");

    try {
      const base64Image = await compressAndResizeImage(file);
      const isComplete =
        editName.trim() &&
        editPhone.trim() &&
        editVillage.trim() &&
        editUnion &&
        editBloodGroup &&
        base64Image;
      const alreadyAwarded = userProfile?.profileCompleteAwarded || false;

      const updates: any = { photoURL: base64Image };
      if (isComplete && !alreadyAwarded) {
        updates.profileCompleteAwarded = true;
        await addStars(5);
      }

      await updateUserProfile(updates);
      setProfileSuccessMsg("প্রোফাইল ছবি সফলভাবে পরিবর্তন করা হয়েছে!");
    } catch (err: any) {
      console.error(err);
      setPhotoError("ছবি আপলোড করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    if (!editName.trim()) {
      setProfileErrorMsg("দয়া করে আপনার নাম প্রদান করুন।");
      return;
    }
    if (!editPhone.trim() || editPhone.trim().length < 11) {
      setProfileErrorMsg("সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।");
      return;
    }
    if (!editVillage.trim()) {
      setProfileErrorMsg("দয়া করে গ্রামের নাম প্রদান করুন।");
      return;
    }

    setUpdatingProfile(true);
    try {
      const isComplete =
        editName.trim() &&
        editPhone.trim() &&
        editVillage.trim() &&
        editUnion &&
        editBloodGroup &&
        userProfile?.photoURL &&
        editDob &&
        editGender &&
        editAddress.trim() &&
        editOccupation.trim();
      const alreadyAwarded = userProfile?.profileCompleteAwarded || false;

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
        mobileVerifyStatus: mobileVerifyStatus,
        emailVerifyStatus: emailVerifyStatus,
        nidStatus: nidStatus,
        nidNumber: nidNumber,
        privacySettings: {
          privacyPublic,
          privacyHidePhone,
          privacyShareLocation,
        },
        notificationSettings: {
          notifPush,
          notifEmail,
          notifSms,
          notifNewsEmergency,
        },
        securitySettings: {
          isPinSet,
          pinCode,
          is2FaEnabled,
        },
      };

      if (isComplete && !alreadyAwarded) {
        updates.profileCompleteAwarded = true;
        await addStars(5);
      }

      await updateUserProfile(updates);
      setProfileSuccessMsg("আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
      setIsEditingProfile(false);
      setProfileSectionView("details");
      setActiveSubSection(null);
    } catch (err: any) {
      console.error(err);
      setProfileErrorMsg("প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleRequestRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    if (rechargeAmount <= 0 || pointsRequired <= 0) {
      setRechargeError("দয়া করে রিচার্জ অফার নির্বাচন করুন।");
      return;
    }

    const trimmedNumber = rechargeNumber.trim();
    if (!trimmedNumber) {
      setRechargeError("মোবাইল নাম্বার প্রদান করুন।");
      return;
    }

    const bangladeshiPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bangladeshiPhoneRegex.test(trimmedNumber)) {
      setRechargeError(
        "দয়া করে একটি সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নাম্বার দিন (যেমন: 01712345678)",
      );
      return;
    }

    if ((userProfile.points || 0) < pointsRequired) {
      setRechargeError("দুঃখিত, আপনার পর্যাপ্ত সিভিক ইস্টার নেই!");
      return;
    }

    setSubmittingRecharge(true);
    setRechargeError("");
    setRechargeSuccess(false);

    try {
      const currentPoints = userProfile.points || 0;
      const newPoints = currentPoints - pointsRequired;

      // Update points in auth state & Firestore
      await updateUserProfile({ points: newPoints });

      // Create recharge request doc
      const requestId =
        "REQ_" + Math.random().toString(36).substr(2, 9).toUpperCase();
      const requestDoc = {
        id: requestId,
        uid: user.uid,
        userName: userProfile.name || "সম্মানিত নাগরিক",
        userPhone: userProfile.phone || "",
        operator: rechargeOperator,
        connectionType: rechargeConnectionType,
        rechargeNumber: trimmedNumber,
        rechargeAmount: rechargeAmount,
        pointsDeducted: pointsRequired,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "recharge_requests", requestId), requestDoc);

      setRechargeSuccess(true);
      setProfileSuccessModal({
        isOpen: true,
        title: "🎉 মোবাইল রিচার্জের আবেদন সফল হয়েছে!",
        subtitle: `আপনার স্টার পয়েন্ট থেকে ${pointsRequired} পয়েন্ট কর্তন করে অনুরোধ জমা রাখা হয়েছে।`,
        type: "recharge",
        amount: rechargeAmount,
        recipient: trimmedNumber,
        methodOrOperator: rechargeOperator,
        trackingId: requestId,
      });
      setRechargeNumber("");
      setRechargeAmount(0);
      setPointsRequired(0);

      // Fetch fresh list
      await fetchRecharges();
    } catch (err: any) {
      console.error("Error creating recharge request:", err);
      setRechargeError(
        "অনুরোধ সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      );
    } finally {
      setSubmittingRecharge(false);
    }
  };

  const handleProcessRecharge = async (
    requestId: string,
    newStatus: "completed" | "cancelled",
  ) => {
    if (!user) return;
    try {
      const requestObj =
        allRechargeRequests.find((r) => r.id === requestId) ||
        rechargeHistory.find((r) => r.id === requestId);
      if (!requestObj) return;

      if (newStatus === "cancelled") {
        // Refund points to the target user
        const targetUserRef = doc(db, "users", requestObj.uid);
        const userSnap = await getDoc(targetUserRef);
        if (userSnap.exists()) {
          const currentPoints = userSnap.data().points || 0;
          const refundedPoints = currentPoints + requestObj.pointsDeducted;
          await updateDoc(targetUserRef, { points: refundedPoints });

          // If the target user is the current logged in user, sync their profile state
          if (requestObj.uid === user.uid && userProfile) {
            await updateUserProfile({
              points: userProfile.points + requestObj.pointsDeducted,
            });
          }
        }
      }

      // Update request status
      await updateDoc(doc(db, "recharge_requests", requestId), {
        status: newStatus,
      });

      // Refresh recharges
      await fetchRecharges();
    } catch (err) {
      console.error("Error processing recharge:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAds();
    }
  }, [user, userProfile?.phone]);

  const fetchUserAds = async () => {
    if (!user) return;
    setLoadingAds(true);
    try {
      const q = query(
        collection(db, "tolet_ads"),
        where("ownerPhone", "==", userProfile?.phone || ""),
      );
      const snap = await getDocs(q);
      const ads: ToLetAd[] = [];
      snap.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() } as ToLetAd);
      });
      setUserAds(ads);
    } catch (err) {
      console.error("Error fetching user ads:", err);
    } finally {
      setLoadingAds(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?"))
      return;
    try {
      await deleteDoc(doc(db, "tolet_ads", id));
      setUserAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (err) {
      console.error("Error deleting ad:", err);
    }
  };

  const handleStartEditAd = (ad: ToLetAd) => {
    setEditingAd(ad);
    setEditAdTitle(ad.title);
    setEditAdCategory(ad.category || "house");
    setEditAdDescription(ad.description || "");
    setEditAdRent(ad.rent || "");
    setEditAdLocation(ad.location || "");
    setEditAdDetails(ad.details || "");
    setEditAdOwnerName(ad.ownerName || "");
    setEditAdOwnerPhone(ad.ownerPhone || "");
    setEditAdError("");
    setEditAdSuccess(false);
  };

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    setEditAdError("");
    setEditAdSuccess(false);

    if (
      !editAdTitle.trim() ||
      !editAdDescription.trim() ||
      !editAdRent.trim() ||
      !editAdLocation.trim() ||
      !editAdOwnerName.trim() ||
      !editAdOwnerPhone.trim()
    ) {
      setEditAdError("অনুগ্রহ করে সবগুলি বাধ্যতামূলক (*) ঘর পূরণ করুন।");
      return;
    }

    if (editAdOwnerPhone.trim().length < 11) {
      setEditAdError("সঠিক ১১ ডিজিটের মোবাইল নম্বরটি প্রদান করুন।");
      return;
    }

    setUpdatingAd(true);
    try {
      const updatedData = {
        title: editAdTitle.trim(),
        category: editAdCategory,
        description: editAdDescription.trim(),
        rent: editAdRent.trim(),
        location: editAdLocation.trim(),
        ownerName: editAdOwnerName.trim(),
        ownerPhone: editAdOwnerPhone.trim(),
        details: editAdDetails.trim(),
      };

      await updateToLetAd(editingAd.id, updatedData);
      setEditAdSuccess(true);

      // Update local state list
      setUserAds((prev) =>
        prev.map((ad) =>
          ad.id === editingAd.id ? { ...ad, ...updatedData } : ad,
        ),
      );

      setTimeout(() => {
        setEditingAd(null);
        setEditAdSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Error updating To-Let ad:", err);
      setEditAdError("বিজ্ঞাপনটি আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setUpdatingAd(false);
    }
  };

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !businessPhone || !businessLocation) return;

    setRegisteringBusiness(true);
    try {
      const businessId = doc(collection(db, "marketplace_items")).id;
      const newBusiness = {
        id: businessId,
        category: "business_ads",
        title: businessName,
        description:
          businessDescription || "ভেরিফাইড স্থানীয় ব্যবসা প্রতিষ্ঠান।",
        price: 0,
        location: businessLocation,
        sellerName: userProfile?.name || "",
        sellerPhone: businessPhone,
        badge: "Verified",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "marketplace_items", businessId), newBusiness);

      // Award 30 points for verifying a business!
      await addStars(5);

      // Update profile
      const updatedBadges = [...(userProfile?.badges || [])];
      if (!updatedBadges.includes("উদ্যোক্তা")) {
        updatedBadges.push("উদ্যোক্তা");
      }
      await updateUserProfile({
        badges: updatedBadges,
      });

      setBusinessSuccess(true);
      setBusinessName("");
      setBusinessPhone("");
      setBusinessLocation("");
      setBusinessDescription("");
    } catch (err) {
      console.error(err);
    } finally {
      setRegisteringBusiness(false);
    }
  };

  const handleToggleBloodDonor = async () => {
    if (!userProfile) return;
    const nextDonorStatus = !userProfile.isBloodDonor;

    try {
      const updatedBadges = [...userProfile.badges];
      if (nextDonorStatus) {
        if (!updatedBadges.includes("রক্তবীর")) updatedBadges.push("রক্তবীর");
        await addStars(5); // 20 points for registering as a blood donor!
      } else {
        const idx = updatedBadges.indexOf("রক্তবীর");
        if (idx > -1) updatedBadges.splice(idx, 1);
      }

      await updateUserProfile({
        isBloodDonor: nextDonorStatus,
        badges: updatedBadges,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeActivityCount = async (
    field: "bloodDonationCount" | "complaintsCount" | "businessesCount",
    delta: number,
  ) => {
    if (!userProfile) return;
    const currentVal = userProfile[field] || 0;
    const newVal = Math.max(0, currentVal + delta);

    // Calculate points adjustment
    let pointsToAdd = 0;
    if (delta > 0) {
      if (field === "bloodDonationCount") pointsToAdd = 5;
      else if (field === "complaintsCount") pointsToAdd = 5;
      else if (field === "businessesCount") pointsToAdd = 5;
    } else if (delta < 0) {
      if (field === "bloodDonationCount") pointsToAdd = -5;
      else if (field === "complaintsCount") pointsToAdd = -5;
      else if (field === "businessesCount") pointsToAdd = -5;
    }

    try {
      const updatedPoints = Math.max(
        0,
        (userProfile.points || 0) + pointsToAdd,
      );
      await updateUserProfile({
        [field]: newVal,
        points: updatedPoints,
      });
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <User className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-800">আপনি লগইন করেননি</h2>
        <p className="text-gray-500 max-w-xs text-sm">
          নাগরিক প্রোফাইল, ইস্টার, ডিজিটাল আইডি কার্ড এবং টু-লেট পরিচালনার জন্য
          লগইন করুন।
        </p>
        <button
          onClick={onGoBack}
          className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  // Dynamic Greetings
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return "শুভ সকাল ☀️";
    if (hr >= 12 && hr < 17) return "শুভ দুপুর ☀️";
    if (hr >= 17 && hr < 19) return "শুভ বিকাল 🌅";
    return "শুভ সন্ধ্যা 🌙";
  };

  // Points & Levels calculation
  const points = userProfile.points || 0;
  let currentLevelName = "ব্রোঞ্জ নাগরিক (Bronze)";
  let nextLevelName = "সিলভার নাগরিক (Silver)";
  let levelColor = "from-amber-600 to-amber-800 text-amber-100";
  let levelProgressColor = "bg-amber-500";
  let badgeIcon = "🥉";
  let minPoints = 0;
  let maxPoints = 30;

  if (points >= 100) {
    currentLevelName = "প্লাটিনাম নাগরিক (Platinum)";
    nextLevelName = "সর্বোচ্চ স্তরে আছেন";
    levelColor = "from-[#7A1C28] to-[#CD5C5C] text-red-50";
    levelProgressColor = "bg-rose-500";
    badgeIcon = "👑";
    minPoints = 100;
    maxPoints = 100;
  } else if (points >= 60) {
    currentLevelName = "গোল্ড নাগরিক (Gold)";
    nextLevelName = "প্লাটিনাম নাগরিক (Platinum)";
    levelColor = "from-yellow-500 to-amber-600 text-yellow-50";
    levelProgressColor = "bg-yellow-400";
    badgeIcon = "🥇";
    minPoints = 60;
    maxPoints = 100;
  } else if (points >= 30) {
    currentLevelName = "সিলভার নাগরিক (Silver)";
    nextLevelName = "গোল্ড নাগরিক (Gold)";
    levelColor = "from-slate-400 to-slate-600 text-slate-100";
    levelProgressColor = "bg-slate-500";
    badgeIcon = "🥈";
    minPoints = 30;
    maxPoints = 60;
  }

  const levelProgress =
    maxPoints === minPoints
      ? 100
      : Math.min(
          100,
          Math.max(0, ((points - minPoints) / (maxPoints - minPoints)) * 100),
        );
  const pointsToNextLevel = maxPoints - points;

  // Digital card details
  const name = userProfile.name || "সম্মানিত নাগরিক";
  const bloodGroup = userProfile.bloodGroup || "O+";
  const locationText = `${userProfile.village || "জিউপাড়া"}, ${userProfile.union || "বানেশ্বর"}`;
  const idNumber = userProfile.uid
    ? `PUT-${userProfile.uid.substring(0, 6).toUpperCase()}`
    : user?.uid
      ? `PUT-${user.uid.substring(0, 6).toUpperCase()}`
      : "N/A";
  const joinDate = new Date(
    userProfile.createdAt || Date.now(),
  ).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Profile completeness calculation
  let completedFields = 0;
  if (userProfile?.name) completedFields++;
  if (userProfile?.phone && userProfile.phone.length >= 11) completedFields++;
  if (userProfile?.village && userProfile.village !== "তথ্য নেই")
    completedFields++;
  if (userProfile?.union) completedFields++;
  if (userProfile?.bloodGroup) completedFields++;
  if (userProfile?.photoURL) completedFields++;
  const completenessPercentage = Math.round((completedFields / 6) * 100);
  const isProfile100Percent = completenessPercentage === 100;

  // Custom Badges list categorized with descriptions and lock/unlock status
  const allBadgesList = [
    {
      id: "verified_citizen",
      category: "নাগরিক ব্যাজ",
      title: "✅ ভেরিফাইড নাগরিক",
      unlocked: isProfile100Percent,
      desc: "নাম, সচল মোবাইল নম্বর, রক্তের গ্রুপ, গ্রাম এবং প্রোফাইল ছবি দিয়ে প্রোফাইল ১০০% সম্পূর্ণ করে অর্জিত হয়েছে।",
      icon: "✅",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "first_blood_donation",
      category: "রক্তদান ব্যাজ",
      title: "🩸 প্রথম রক্তদান",
      unlocked:
        (userProfile?.bloodDonationCount || 0) >= 1 ||
        userProfile?.isBloodDonor ||
        userProfile?.badges?.includes("রক্তবীর") ||
        false,
      desc: "স্বেচ্ছায় অন্তত ১ বার রক্তদান করার মাধ্যমে এই বিশেষ সম্মাননা ব্যাজ অর্জিত হয়েছে।",
      icon: "🩸",
      color: "from-rose-500 to-red-600",
    },
    {
      id: "five_blood_donations",
      category: "রক্তদান ব্যাজ",
      title: "🩸🩸 ৫ বার রক্তদান",
      unlocked: (userProfile?.bloodDonationCount || 0) >= 5,
      desc: "৫ বার সফলভাবে রক্তদান করে অনেকের জীবন বাঁচানোর অনন্য কৃতিত্বের জন্য অর্জিত হয়েছে।",
      icon: "🩸🩸",
      color: "from-red-500 to-rose-600",
    },
    {
      id: "ten_blood_donations",
      category: "রক্তদান ব্যাজ",
      title: "🩸🩸🩸 ১০ বার রক্তদান",
      unlocked: (userProfile?.bloodDonationCount || 0) >= 10,
      desc: "১০ বার বা তার বেশি স্বেচ্ছায় রক্তদান সম্পন্ন করে পুঠিয়ার একজন আজীবন হিরো বা জীবনদাতা হিসেবে অর্জিত হয়েছে।",
      icon: "🩸🩸🩸",
      color: "from-red-600 to-rose-950 animate-pulse",
    },
    {
      id: "volunteer",
      category: "কমিউনিটি ব্যাজ",
      title: "🤝 স্বেচ্ছাসেবক",
      unlocked:
        isVolunteerRegistered ||
        userProfile?.badges?.includes("স্বেচ্ছাসেবক") ||
        userProfile?.badges?.includes("ভলান্টিয়ার") ||
        false,
      desc: "পুঠিয়া স্বেচ্ছাসেবী নেটওয়ার্কে সক্রিয় ভলান্টিয়ার হিসেবে নিবন্ধনের মাধ্যমে অর্জিত হয়েছে।",
      icon: "🤝",
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "community_hero",
      category: "কমিউনিটি ব্যাজ",
      title: "🤝 কমিউনিটি হিরো",
      unlocked:
        (isVolunteerRegistered &&
          (userProfile?.bloodDonationCount || 0) >= 1) ||
        points >= 100 ||
        userProfile?.badges?.includes("কমিউনিটি হিরো") ||
        false,
      desc: "ভলান্টিয়ার তালিকায় নিবন্ধিত থাকার পাশাপাশি রক্তদান বা ১০০ সিভিক ইস্টার অর্জনের মাধ্যমে অর্জিত হয়েছে।",
      icon: "🏆",
      color: "from-amber-500 to-yellow-600",
    },
    {
      id: "conscious_citizen",
      category: "রিপোর্টিং ব্যাজ",
      title: "📢 সচেতন নাগরিক",
      unlocked:
        (userProfile?.complaintsCount || 0) >= 1 ||
        userProfile?.badges?.includes("সচেতন নাগরিক") ||
        false,
      desc: "এলাকার কোনো জনদুর্ভোগ বা নাগরিক সমস্যা নিয়ে অন্তত ১টি অভিযোগ বা সমস্যা পোর্টালে সাফল্যের সাথে দাখিল করার জন্য অর্জিত।",
      icon: "📢",
      color: "from-teal-500 to-emerald-600",
    },
    {
      id: "public_servant",
      category: "রিপোর্টিং ব্যাজ",
      title: "📢 জনসেবক",
      unlocked:
        (userProfile?.complaintsCount || 0) >= 5 ||
        userProfile?.badges?.includes("জনসেবক") ||
        false,
      desc: "সামাজিক দায়িত্ব ও নাগরিক উন্নয়নে ৫টি বা তার বেশি অভিযোগ বা পরামর্শ পোর্টালে সাফল্যের সাথে দাখিল করার জন্য অর্জিত।",
      icon: "🌟",
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "verified_merchant",
      category: "ব্যবসা ব্যাজ",
      title: "🏪 ভেরিফাইড ব্যবসায়ী",
      unlocked:
        (userProfile?.businessesCount || 0) >= 1 ||
        userProfile?.badges?.includes("উদ্যোক্তা") ||
        false,
      desc: "পুঠিয়া উদ্যোক্তা ডিরেক্টরি বা ব্যবসায়ী তালিকায় নিজের ব্যবসা প্রতিষ্ঠান সফলভাবে ভেরিফাই ও নিবন্ধন করার জন্য অর্জিত।",
      icon: "🏪",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Main Dashboard Grid with Sidebar / Tabs Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side Menu / Mobile Navigation */}
        <div className="md:col-span-1 space-y-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-col space-y-1 bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
            <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ড্যাশবোর্ড মেনু
            </div>

            {[
              {
                id: "overview",
                label: "📊 ড্যাশবোর্ড ওভারভিউ",
                desc: "হোম ও কুইক সামারি",
              },
              {
                id: "profile",
                label: "👤 আমার প্রোফাইল",
                desc: "ব্যক্তিগত তথ্য ও পরিবর্তন",
              },
              {
                id: "followed",
                label: "🔔 আমার ফলো করা",
                desc: "প্রিয় ব্যবসা ও সেবাদাতাগণ",
              },
              {
                id: "educational_institutions",
                label: "🎓 শিক্ষা প্রতিষ্ঠান এড করুন",
                desc: "স্কুল, কলেজ ও মাদ্রাসা যোগ করুন",
              },
              {
                id: "social_organizations",
                label: "👥 সামাজিক প্রতিষ্ঠান",
                desc: "সামাজিক সংগঠন ও স্বেচ্ছাসেবী দল",
              },
              {
                id: "blood_donor_network",
                label: "🩸 রক্তদাতা নেটওয়ার্ক",
                desc: "রক্তদান ও রক্তদাতার তালিকা",
              },
              {
                id: "agriculture_farm",
                label: "🌾 কৃষি খামার ও প্রাণিসম্পদ",
                desc: "মৎস্য, প্রাণিসম্পদ ও নার্সারি তথ্য",
              },
              {
                id: "service_providers",
                label: "🛠️ সেবা প্রদানকারী",
                desc: "মেকানিক, আইনজীবী ও অন্যান্য সেবা",
              },
              {
                id: "transport_info",
                label: "🚌 পরিবহন তথ্য ও কাউন্টার",
                desc: "বাসের সময়সূচী ও টিকিট কাউন্টার",
              },
              {
                id: "career_education",
                label: "💼 ক্যারিয়ার ও শিক্ষা",
                desc: "শিক্ষা, ক্যারিয়ার গাইড ও কর্মশালা",
              },
              {
                id: "healthcare_medical",
                label: "🏥 স্বাস্থ্যসেবা ও চিকিৎসা",
                desc: "হাসপাতাল, ক্লিনিক ও ডাক্তারের তালিকা",
              },
              {
                id: "emergency_services",
                label: "🚨 জরুরি সেবা ও নম্বর",
                desc: "পুলিশ, ফায়ার সার্ভিস ও অ্যাম্বুলেন্স",
              },
              {
                id: "ngo",
                label: "🏢 এনজিও ও সামাজিক উন্নয়ন",
                desc: "এনজিওর তালিকা ও সামাজিক সেবা",
              },
              {
                id: "banking_finance",
                label: "💳 ব্যাংক ও আর্থিক সেবা",
                desc: "ব্যাংক, এজেন্ট ও ATM বুথ",
              },
              {
                id: "business_market",
                label: "🛒 ব্যবসা ও বাজার",
                desc: "মুদি দোকান, ফার্মেসি ও কেনাবেচা",
              },
              {
                id: "explore_history",
                label: "📜 পুঠিয়া ইতিহাস কুইজ",
                desc: "ইতিহাস জানুন ও ব্যাজ জিতুন",
              },
              {
                id: "rewards",
                label: "📱 মোবাইল রিচার্জ উপহার",
                desc: "ইস্টার দিয়ে মোবাইল রিচার্জ নিন",
              },
              {
                id: "badges",
                label: "🏅 র‍্যাংকিং ও ব্যাজ",
                desc: "অর্জিত ইস্টার ও পুরস্কার",
              },
              {
                id: "services",
                label: "🤝 নাগরিক সেবা",
                desc: "ভলান্টিয়ার ও রক্তদান",
              },
              {
                id: "my_ads",
                label: "🏬 আমার ব্যবসা ও বিজ্ঞাপন",
                desc: "দোকান ও টু-লেট বিজ্ঞাপন",
              },
              {
                id: "news_post",
                label: "📰 স্থানীয় সংবাদ পোস্ট",
                desc: "সংবাদ লিখে শেয়ার করুন",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsEditingProfile(false);
                  setProfileSectionView("details");
                }}
                className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col ${
                  activeTab === tab.id
                    ? "bg-[#125836] text-white shadow-md shadow-[#125836]/10"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="text-base font-bold">{tab.label}</span>
                <span
                  className={`text-xs mt-0.5 ${activeTab === tab.id ? "text-emerald-200" : "text-gray-400"}`}
                >
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Horizontal Pill Navigation removed as per request */}

          {/* Quick Level Widget (shown underneath menu on desktop) */}
          <div className="hidden md:block bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-5 border border-zinc-850 shadow-md relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${levelColor} opacity-10 rounded-full -mr-10 -mt-10`}
            />
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-gray-300">
                বর্তমান নাগরিক স্তর
              </span>
            </div>
            <div className="text-base font-black text-white flex items-center gap-1.5">
              <span>{badgeIcon}</span> {currentLevelName.split(" ")[0]}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              মোট অর্জিত ইস্টার:{" "}
              <strong className="text-yellow-400">{points}</strong>
            </p>

            {points < 100 && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>অগ্রগতি</span>
                  <span>{pointsToNextLevel} ইস্টার বাকি</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${levelProgressColor}`}
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Stat 1: Civic Points */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 flex items-center gap-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl shrink-0">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      সিভিক ইস্টার
                    </p>
                    <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">
                      {points}
                    </p>
                  </div>
                </div>

                {/* Stat 2: Active Role */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      নাগরিক ব্যাজ
                    </p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                      {userProfile.badges?.length || 1} টি অর্জিত
                    </p>
                  </div>
                </div>

                {/* Stat 3: Blood Donor Status */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${userProfile.isBloodDonor ? "bg-rose-50 dark:bg-rose-950/20" : "bg-gray-50 dark:bg-zinc-800"}`}
                  >
                    <Droplet
                      className={`w-5 h-5 ${userProfile.isBloodDonor ? "text-rose-500 animate-pulse" : "text-gray-400"}`}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      রক্তদাতা স্ট্যাটাস
                    </p>
                    <p
                      className={`text-sm font-black leading-tight ${userProfile.isBloodDonor ? "text-rose-600" : "text-gray-500"}`}
                    >
                      {userProfile.isBloodDonor
                        ? "নিবন্ধিত (Active)"
                        : "নিষ্ক্রিয়"}
                    </p>
                  </div>
                </div>

                {/* Stat 4: Service Requests & Favorites */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 flex items-center gap-3">
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-xl shrink-0">
                    <Heart className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      সেবা ও প্রিয়
                    </p>
                    <p className="text-sm font-black text-gray-800 dark:text-white leading-tight">
                      {userProfile.complaintsCount || 0} অনুরোধ |{" "}
                      {savedItems.length} প্রিয়
                    </p>
                  </div>
                </div>

                {/* Stat 5: Active To-let Ads */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300 flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl shrink-0">
                    <Building className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      টু-লেট বিজ্ঞাপন
                    </p>
                    <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">
                      {userAds.length} টি সক্রিয়
                    </p>
                  </div>
                </div>
              </div>

              {/* ID Card Display & Summary Split Row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Mini ID Card Flippable Mockup (3/5 width on desktop) */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-extrabold text-sm text-gray-800 dark:text-white flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" /> ডিজিটাল
                        নাগরিক কার্ড প্রিভিউ
                      </h3>
                      <span className="text-[10px] text-amber-500 font-black flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" /> ভেরিফাইড
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                      নিচের কার্ডটি ট্যাপ করে সামনে ও পিছনের অংশ প্রিভিউ করুন।
                      সম্পূর্ণ কার্ড ডাউনলোড করতে "ডিটেইল কার্ড" বাটনে ক্লিক
                      করুন।
                    </p>
                  </div>

                  {/* Flippable card preview */}
                  <div
                    className="relative w-full aspect-[1.58/1] cursor-pointer perspective-1000 max-w-sm mx-auto mb-4"
                    onClick={() => setCardFlipped(!cardFlipped)}
                  >
                    <div
                      className={`w-full h-full transition-transform duration-700 transform-style-3d ${cardFlipped ? "rotate-y-180" : ""}`}
                    >
                      {/* Front of card */}
                      <div
                        className="absolute w-full h-full backface-hidden rounded-2xl p-4 shadow-lg border border-white/10 flex flex-col justify-between"
                        style={{
                          background:
                            "linear-gradient(135deg, #125836, #0e3d25)",
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2.5">
                            <div className="w-11 h-11 rounded-full border border-amber-400 bg-emerald-800 flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden">
                              {userProfile.photoURL ? (
                                <img
                                  src={userProfile.photoURL}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                name.charAt(0)
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white leading-tight">
                                {name}
                              </h4>
                              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                                ভেরিফাইড নাগরিক
                              </p>
                            </div>
                          </div>
                          <QrCode className="w-8 h-8 text-white/30" />
                        </div>
                        <div className="text-[10px] text-emerald-100 space-y-0.5">
                          <p>
                            <span className="text-white/60">রক্তের গ্রুপ:</span>{" "}
                            <span className="text-emerald-500 font-bold">
                              {bloodGroup}
                            </span>
                          </p>
                          <p className="truncate">
                            <span className="text-white/60">গ্রাম/ইউনিয়ন:</span>{" "}
                            {locationText}
                          </p>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div
                        className="absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl p-4 shadow-lg border border-white/10 flex flex-col justify-center items-center text-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #0e3d25, #082114)",
                        }}
                      >
                        <div className="w-full flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-3">
                          <p className="text-[9px] text-white/50 mb-0.5">
                            মেম্বারশিপ আইডি
                          </p>
                          <p className="text-sm font-black text-emerald-500 tracking-wider mb-2 font-mono">
                            {idNumber}
                          </p>
                          <p className="text-[8px] text-white/40">
                            ইস্যু ডেট: {joinDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      onClick={() => onNavigateToSubView?.("digital_id_card")}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#125836] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      🪪 পূর্ণাঙ্গ কার্ড দেখুন ও ডাউনলোড
                    </button>
                  </div>
                </div>

                {/* Level Progress & Shortcuts (2/5 width on desktop) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Level & Points Summary */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
                    <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider mb-2">
                      নাগরিক র‍্যাংক ও অগ্রগতি
                    </h4>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-2xl">
                        {badgeIcon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">
                          বর্তমান স্তর
                        </p>
                        <h4 className="text-sm font-black text-gray-800 dark:text-white leading-tight">
                          {currentLevelName}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>
                          মোট ইস্টার:{" "}
                          <strong className="text-amber-600 font-bold">
                            {points}
                          </strong>
                        </span>
                        {points < 100 ? (
                          <span>
                            পরবর্তী স্তর: {pointsToNextLevel} ইস্টার বাকি
                          </span>
                        ) : (
                          <span className="text-rose-500 font-bold">
                            সর্বোচ্চ স্তর অর্জিত! ✨
                          </span>
                        )}
                      </div>

                      {points < 100 && (
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${levelProgressColor} transition-all duration-500`}
                            style={{ width: `${levelProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTab("badges")}
                      className="w-full text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-4 hover:underline cursor-pointer block"
                    >
                      কীভাবে ইস্টার বাড়াবেন দেখুন &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FOLLOWED BUSINESSES & SERVICE PROVIDERS */}
          {activeTab === "followed" &&
            (() => {
              const businesses = followedItems.filter(
                (item) => item.type === "business",
              );
              const providers = followedItems.filter(
                (item) => item.type === "provider",
              );

              return (
                <div className="space-y-6">
                  {/* Header card */}
                  <div
                    className="p-6 text-white rounded-[28px] shadow-lg relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #125836, #0e4429)",
                    }}
                  >
                    <div className="relative z-10">
                      <p className="text-emerald-200 text-xs font-bold mb-2 uppercase tracking-wide">
                        ফলোয়ার হাব / Follower Hub
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-black mb-1 text-white">
                        আমার ফলো করা তালিকা
                      </h2>
                      <p className="text-emerald-100 text-xs sm:text-sm max-w-lg leading-relaxed">
                        আপনার পছন্দের ব্যবসা প্রতিষ্ঠান ও বিশ্বস্ত সেবাদাতাদের
                        তালিকা এখানে সংরক্ষিত থাকবে। যেকোনো নতুন আপডেট বা
                        প্রয়োজনে সরাসরি যোগাযোগ করুন।
                      </p>
                    </div>
                  </div>

                  {followedItems.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-12 text-center shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔔</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-gray-800 dark:text-white mb-2">
                        আপনি এখনো কাউকে ফলো করেননি
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                        যেকোনো স্থানীয় দোকান, ফার্মেসি, অথবা পেশাদার সেবাদাতাদের
                        তালিকা থেকে "+ ফলো" বাটনে ক্লিক করে এখানে যুক্ত করতে
                        পারেন।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Followed Businesses */}
                      {businesses.length > 0 && (
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-50 dark:bg-zinc-800 rounded-lg text-emerald-700">
                              🛒
                            </span>
                            ফলো করা ব্যবসা ও দোকান ({businesses.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {businesses.map((biz) => (
                              <div
                                key={biz.id}
                                className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-3">
                                    <div>
                                      <h4 className="font-extrabold text-base text-gray-800 dark:text-white leading-tight">
                                        {biz.name}
                                      </h4>
                                      <span className="text-[10px] bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                                        {biz.category}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => toggleFollow(biz)}
                                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
                                      title="ফলো করা বাদ দিন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {biz.location && (
                                    <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <span>{biz.location}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-zinc-800/80 flex gap-2">
                                  <a
                                    href={`tel:${biz.phone}`}
                                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 text-center py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Phone className="w-3.5 h-3.5 fill-current" />{" "}
                                    কল করুন ({biz.phone})
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Followed Service Providers */}
                      {providers.length > 0 && (
                        <div>
                          <h3 className="text-base font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-sky-50 dark:bg-zinc-800 rounded-lg text-sky-700">
                              🛠️
                            </span>
                            ফলো করা সেবাদাতাগণ ({providers.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {providers.map((prov) => (
                              <div
                                key={prov.id}
                                className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-3">
                                    <div>
                                      <h4 className="font-extrabold text-base text-gray-800 dark:text-white leading-tight">
                                        {prov.name}
                                      </h4>
                                      <span className="text-[10px] bg-sky-50 dark:bg-zinc-800 text-sky-700 dark:text-sky-400 font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block">
                                        {prov.category}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => toggleFollow(prov)}
                                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
                                      title="ফলো করা বাদ দিন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {prov.location && (
                                    <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <span>{prov.location}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-zinc-800/80 flex gap-2">
                                  <a
                                    href={`tel:${prov.phone}`}
                                    className="flex-1 bg-sky-50 hover:bg-sky-100 dark:bg-zinc-800 text-sky-700 dark:text-sky-400 text-center py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Phone className="w-3.5 h-3.5 fill-current" />{" "}
                                    কল করুন ({prov.phone})
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* TAB 2: PROFILE PROFILE DETAILS & EDIT */}
          {activeTab === "profile" && <ProfileSettingsDetail />}
          {false && (
            <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-6">
              {profileSectionView === "details" && !isEditingProfile && (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100 dark:border-zinc-800/80">
                    <div className="relative group shrink-0">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-xl overflow-hidden relative border-3 border-emerald-500/20">
                        {photoUploading ? (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <RefreshCcw className="w-8 h-8 text-white animate-spin" />
                          </div>
                        ) : userProfile.photoURL ? (
                          <img
                            src={userProfile.photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          name.charAt(0)
                        )}
                      </div>

                      <label
                        className="absolute -bottom-1 -right-1 bg-[#125836] hover:bg-[#1b4e33] text-white p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-md cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                        title="ছবি পরিবর্তন করুন"
                      >
                        <Camera className="w-4.5 h-4.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={photoUploading}
                        />
                      </label>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h2 className="text-xl font-black text-gray-800 dark:text-white">
                          {name}
                        </h2>
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      </div>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/20 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                        স্মার্ট পুঠিয়া নাগরিক
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium block">
                        ছবি পরিবর্তন করতে ক্যামেরা আইকনে চাপ দিন
                      </p>
                    </div>
                  </div>

                  {photoError && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-100 dark:border-red-900 font-bold">
                      {photoError}
                    </div>
                  )}
                </>
              )}

              {profileSectionView === "edit" || isEditingProfile ? (
                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-4 max-w-xl"
                >
                  <h3 className="font-extrabold text-sm text-gray-800 dark:text-white mb-2 flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-emerald-600" /> প্রোফাইলের
                    তথ্য পরিবর্তন করুন
                  </h3>

                  {profileErrorMsg && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-100 dark:border-red-900 font-bold">
                      {profileErrorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        পুরো নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName || ""}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        মোবাইল নম্বর *
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone || ""}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        গ্রামের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={editVillage || ""}
                        onChange={(e) => setEditVillage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        ইউনিয়ন *
                      </label>
                      <select
                        value={editUnion || ""}
                        onChange={(e) => setEditUnion(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm cursor-pointer"
                      >
                        {[
                          "বানেশ্বর",
                          "শিলমাড়ী",
                          "পুঠিয়া পৌরসভা",
                          "জিউপাড়া",
                          "ভালুকগাছী",
                          "বেলপুকুরিয়া",
                          "পুঠিয়া ইউনিয়ন",
                        ].map((u) => (
                          <option key={u} value={u || ""}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        রক্তের গ্রুপ *
                      </label>
                      <select
                        value={editBloodGroup || ""}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm cursor-pointer"
                      >
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                          (bg) => (
                            <option key={bg} value={bg || ""}>
                              {bg}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updatingProfile}
                      className="px-6 py-3 bg-[#0E8F63] hover:bg-[#0c7a54] disabled:bg-emerald-800/40 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
                    >
                      {updatingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>তথ্য সংরক্ষণ করুন</span>
                          <Check className="w-4 h-4 stroke-[3]" />
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileSectionView("details");
                        setProfileErrorMsg("");
                      }}
                      className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
                    >
                      বাতিল
                    </motion.button>
                  </div>
                </form>
              ) : profileSectionView === "password" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">
                      পাসওয়ার্ড পরিবর্তন করুন
                    </h3>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-[22px] p-5 text-xs font-medium text-amber-700 dark:text-emerald-500 space-y-2 leading-[1.7] shadow-sm">
                    <p className="font-extrabold text-amber-800 dark:text-amber-300">
                      🔒 নিরাপত্তা পরামর্শ:
                    </p>
                    <p>
                      আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন
                      করুন। একটি শক্তিশালী পাসওয়ার্ডে অক্ষর, সংখ্যা ও বিশেষ
                      চিহ্ন ব্যবহার করুন।
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("আপনার পাসওয়ার্ডটি সফলভাবে পরিবর্তিত হয়েছে!");
                      setProfileSectionView("details");
                    }}
                    className="space-y-4 max-w-xl mt-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        বর্তমান পাসওয়ার্ড
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        নতুন পাসওয়ার্ড
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        নতুন পাসওয়ার্ড নিশ্চিত করুন
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white rounded-xl text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5 pt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-6 py-3 bg-[#0E8F63] hover:bg-[#0c7a54] text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
                      >
                        <span>পাসওয়ার্ড আপডেট করুন</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setProfileSectionView("details")}
                        className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
                      >
                        বাতিল
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : profileSectionView === "settings" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">
                      নাগরিক সেটিংস
                    </h3>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-white">
                          মোবাইল নোটিফিকেশন
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium leading-normal">
                          গুরুত্বপূর্ণ নোটিশ এবং রক্তদাতা নোটিফিকেশন এসএমএস-এর
                          মাধ্যমে পান
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-white">
                          প্রোফাইল দৃশ্যমানতা
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium leading-normal">
                          অন্যান্য নাগরিকদের জন্য আপনার রক্তের গ্রুপ ও যোগাযোগ
                          প্রদর্শন করুন
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-white">
                          ডার্ক মোড (Dark Mode)
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium leading-normal">
                          স্মার্টফোনের ডার্ক মোড সেটিংস অনুসরণ করুন বা জোরপূর্বক
                          অন রাখুন
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="pt-4 flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          alert("আপনার সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!");
                          setProfileSectionView("details");
                        }}
                        className="px-6 py-2.5 bg-[#125836] hover:bg-[#1b4e33] text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md"
                      >
                        সেটিংস সংরক্ষণ করুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileSectionView("details")}
                        className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
                      >
                        ফিরে যান
                      </button>
                    </div>
                  </div>
                </div>
              ) : profileSectionView === "notifications" ? (
                (() => {
                  const simulateNotification = (
                    type:
                      | "post_approved"
                      | "new_notice"
                      | "new_job"
                      | "blood_request"
                      | "event_reminder",
                  ) => {
                    const templates = {
                      post_approved: {
                        title: "পোস্ট Approved",
                        text: "অভিনন্দন! আপনার নাগরিক ফোরামের পোস্টটি এডমিন কর্তৃক যাচাইয়ের পর Approved করা হয়েছে।",
                      },
                      new_notice: {
                        title: "নতুন Notice",
                        text: "জরুরি নোটিশ: বানেশ্বর এলাকায় বিনামূল্যে উন্নত মানের ধান ও সবজি বীজ বিতরণ কার্যক্রম শুরু হয়েছে।",
                      },
                      new_job: {
                        title: "নতুন Job",
                        text: "নতুন চাকরির সুযোগ: পুঠিয়া বাজারের স্থানীয় ডিপার্টমেন্টাল স্টোরে ডেলিভারি ও সেলস পার্সন নিয়োগ দেওয়া হচ্ছে।",
                      },
                      blood_request: {
                        title: "রক্তের অনুরোধ",
                        text: "রক্তের জরুরি অনুরোধ! পুঠিয়া ক্লিনিকে একজন গর্ভবতী মায়ের সিজারিয়ানের জন্য জরুরি AB+ রক্তের সন্ধান চলছে।",
                      },
                      event_reminder: {
                        title: "Event Reminder",
                        text: 'ইভেন্ট রিমাইন্ডার: আগামী কাল পুঠিয়া রাজবাড়ী প্রাঙ্গণে "ডিজিটাল পুঠিয়া মেলা ২০২৬" সকাল ৯টায় শুরু হবে।',
                      },
                    };

                    const template = templates[type];
                    addNotification({
                      type,
                      title: template.title,
                      text: template.text,
                    });
                  };

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 gap-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-emerald-600 animate-bounce" />
                          <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">
                            নাগরিক নোটিফিকেশন (
                            {notifications.filter((n) => n.isNew).length} নতুন)
                          </h3>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => markAllAsRead()}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-emerald-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border-none"
                          >
                            সব পড়া হয়েছে মার্ক করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => clearNotifications()}
                            className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer bg-red-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border-none"
                          >
                            সব মুছুন
                          </button>
                        </div>
                      </div>

                      {/* Simulation buttons so user can instantly test all types of notifications */}
                      <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                          <span>🧪</span> নোটিফিকেশন সিমুলেশন প্যানেল (ক্লিক করে
                          নতুন নোটিফিকেশন টেস্ট করুন):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              simulateNotification("post_approved")
                            }
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-lg cursor-pointer transition-colors border-none"
                          >
                            👍 পোস্ট Approved
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateNotification("new_notice")}
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-emerald-500 border border-amber-200 dark:border-amber-900 rounded-lg cursor-pointer transition-colors border-none"
                          >
                            📢 নতুন Notice
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateNotification("new_job")}
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900 rounded-lg cursor-pointer transition-colors border-none"
                          >
                            💼 নতুন Job
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              simulateNotification("blood_request")
                            }
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg cursor-pointer transition-colors border-none"
                          >
                            🩸 রক্তের অনুরোধ
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              simulateNotification("event_reminder")
                            }
                            className="text-[10px] font-extrabold px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-900 rounded-lg cursor-pointer transition-colors border-none"
                          >
                            ⏰ Event Reminder
                          </button>
                        </div>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                          <p className="text-sm text-gray-500">
                            কোনো নোটিফিকেশন নেই। সিমুলেশন প্যানেল ব্যবহার করে
                            টেস্ট করুন!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {notifications.map((notif) => {
                            // Badge color/emoji depending on notification type
                            let typeBadge = "🔔 সাধারণ";
                            let typeStyle =
                              "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300";
                            if (notif.type === "post_approved") {
                              typeBadge = "👍 পোস্ট Approved";
                              typeStyle =
                                "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
                            } else if (notif.type === "new_notice") {
                              typeBadge = "📢 নতুন Notice";
                              typeStyle =
                                "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-emerald-500";
                            } else if (notif.type === "new_job") {
                              typeBadge = "💼 নতুন Job";
                              typeStyle =
                                "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400";
                            } else if (notif.type === "blood_request") {
                              typeBadge = "🩸 রক্তের অনুরোধ";
                              typeStyle =
                                "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
                            } else if (notif.type === "event_reminder") {
                              typeBadge = "⏰ Event Reminder";
                              typeStyle =
                                "bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400";
                            }

                            return (
                              <div
                                key={notif.id}
                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${notif.isNew ? "bg-emerald-500/[0.04] border-emerald-500/20 dark:border-emerald-500/10 shadow-sm" : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 opacity-80 hover:opacity-100"}`}
                              >
                                <div
                                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${notif.isNew ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-100 dark:bg-zinc-800 text-gray-400"}`}
                                >
                                  <Bell className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${typeStyle}`}
                                    >
                                      {typeBadge}
                                    </span>
                                    {notif.isNew && (
                                      <span className="text-[8px] bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded">
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs leading-relaxed ${notif.isNew ? "font-bold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                                  >
                                    {notif.text}
                                  </p>
                                  <span className="text-[9px] text-gray-400 font-bold block">
                                    {notif.date}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0 mt-1">
                                  {notif.isNew && (
                                    <button
                                      onClick={() => markAsRead(notif.id)}
                                      className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline px-2 py-1 bg-emerald-50 dark:bg-zinc-800 border-none rounded cursor-pointer"
                                      title="পড়া হয়েছে চিহ্নিত করুন"
                                    >
                                      পড়ুন
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => deleteNotification(notif.id)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setProfileSectionView("details")}
                          className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold rounded-xl text-xs transition cursor-pointer"
                        >
                          ফিরে যান
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-6">
                  {profileSuccessMsg && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 font-bold">
                      {profileSuccessMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5 text-sm">
                        <User className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            পুরো নাম
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100">
                            {userProfile.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 text-sm">
                        <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            মোবাইল নম্বর
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100">
                            {userProfile.phone || "তথ্য দেওয়া হয়নি"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 text-sm">
                        <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            ইমেইল এড্রেস
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5 text-sm">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            গ্রাম ও ইউনিয়ন
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100">
                            {userProfile.village}, {userProfile.union}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 text-sm">
                        <Droplet className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            রক্তের গ্রুপ
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100">
                            {userProfile.bloodGroup}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 text-sm">
                        <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">
                            নিবন্ধন তারিখ
                          </p>
                          <p className="font-extrabold text-gray-700 dark:text-gray-100">
                            {joinDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setProfileSectionView("edit");
                        setProfileSuccessMsg("");
                        setProfileErrorMsg("");
                      }}
                      className="py-3 px-5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900 shadow-sm"
                    >
                      📝 ব্যক্তিগত তথ্য পরিবর্তন করুন
                    </button>
                    <button
                      onClick={() => setProfileSectionView("password")}
                      className="py-3 px-5 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-teal-100 dark:border-teal-900 shadow-sm"
                    >
                      🔑 পাসওয়ার্ড পরিবর্তন
                    </button>
                    <button
                      onClick={() => setProfileSectionView("settings")}
                      className="py-3 px-5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-gray-100 dark:border-zinc-800 shadow-sm"
                    >
                      ⚙️ নাগরিক সেটিংস
                    </button>
                    <button
                      onClick={() => setProfileSectionView("notifications")}
                      className="py-3 px-5 text-xs font-bold text-amber-600 dark:text-emerald-500 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-amber-100 dark:border-amber-900 shadow-sm"
                    >
                      🔔 নোটিফিকেশন দেখুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MOBILE RECHARGE REWARD */}
          {activeTab === "rewards" && (
            <div className="space-y-6">
              {/* Point Reward Hero Header */}
              <div className="bg-gradient-to-br from-[#125836] to-zinc-900 text-white rounded-[28px] p-6 shadow-md relative overflow-hidden border border-emerald-600/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-700/10 rounded-full blur-2xl" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                      🎁 সিভিক উপহার ও রিচার্জ ক্যাম্পেইন
                    </span>
                    <h3 className="font-extrabold text-xl mt-2 text-white flex items-center gap-1.5">
                      📱 সিভিক ইস্টার দিয়ে মোবাইল রিচার্জ
                    </h3>
                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed max-w-xl">
                      আপনার পুঠিয়া নাগরিক ড্যাশবোর্ড সেবামূলক কাজে অংশ নিয়ে
                      অর্জিত ইস্টার দিয়ে যেকোনো বাংলাদেশী নাম্বারে ইনস্ট্যান্ট
                      মোবাইল রিচার্জ উপহার পান! যত বেশি সেবা ও অবদান, তত বেশি
                      ফ্রি রিচার্জ!
                    </p>
                  </div>

                  <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 shrink-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-emerald-200">
                      আপনার সিভিক ইস্টার
                    </span>
                    <span className="text-3xl font-black text-yellow-400 mt-1 flex items-center gap-1">
                      🪙 {userProfile?.points || 0}
                    </span>
                    <span className="text-[9px] text-gray-300 mt-1">
                      সর্বোচ্চ ব্যবহারকারী হোন!
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign Cards Selection and Request Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Offers selection */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-black text-sm text-gray-800 dark:text-white uppercase tracking-wider">
                    ধাপ ১: রিচার্জ অফার নির্বাচন করুন
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        amount: 10,
                        points: 50,
                        bgClass:
                          "bg-emerald-50/90 dark:bg-[#112a1d] border-emerald-200 dark:border-emerald-800/40",
                        textClass: "text-emerald-950 dark:text-emerald-100",
                        descClass:
                          "text-emerald-700/90 dark:text-emerald-300/80",
                        pillBg: "bg-emerald-600 text-white dark:bg-emerald-500",
                        badgeLabel: "১০ ৳ বোনাস",
                        pointTextClass:
                          "text-emerald-800 dark:text-emerald-400",
                        ringColor: "ring-emerald-600 dark:ring-emerald-400",
                      },
                      {
                        amount: 20,
                        points: 100,
                        bgClass:
                          "bg-teal-50/90 dark:bg-[#0c2a2b] border-teal-200 dark:border-teal-800/40",
                        textClass: "text-teal-950 dark:text-teal-100",
                        descClass: "text-teal-700/90 dark:text-teal-300/80",
                        pillBg: "bg-teal-600 text-white dark:bg-teal-500",
                        badgeLabel: "২০ ৳ রিচার্জ",
                        pointTextClass: "text-teal-800 dark:text-teal-400",
                        ringColor: "ring-teal-600 dark:ring-teal-400",
                      },
                      {
                        amount: 50,
                        points: 250,
                        bgClass:
                          "bg-indigo-50/90 dark:bg-[#161a3c] border-indigo-200 dark:border-indigo-800/40",
                        textClass: "text-indigo-950 dark:text-indigo-100",
                        descClass: "text-indigo-700/90 dark:text-indigo-300/80",
                        pillBg: "bg-indigo-600 text-white dark:bg-indigo-500",
                        badgeLabel: "৫০ ৳ গিফট",
                        pointTextClass: "text-indigo-800 dark:text-indigo-400",
                        ringColor: "ring-indigo-600 dark:ring-indigo-400",
                      },
                      {
                        amount: 100,
                        points: 500,
                        bgClass:
                          "bg-amber-50/90 dark:bg-[#2d220a] border-amber-200 dark:border-amber-800/40",
                        textClass: "text-amber-950 dark:text-amber-100",
                        descClass: "text-amber-800/90 dark:text-amber-300/80",
                        pillBg: "bg-amber-600 text-white dark:bg-amber-500",
                        badgeLabel: "১০০ ৳ স্পেশাল",
                        pointTextClass: "text-amber-850 dark:text-emerald-500",
                        ringColor: "ring-amber-600 dark:ring-amber-400",
                      },
                    ].map((offer, i) => {
                      const isSelected = rechargeAmount === offer.amount;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setRechargeAmount(offer.amount);
                            setPointsRequired(offer.points);
                          }}
                          className={`w-full text-left p-5 rounded-[22px] border ${offer.bgClass} transition-all duration-300 cursor-pointer flex justify-between items-center group relative overflow-hidden ${
                            isSelected
                              ? `ring-2.5 ${offer.ringColor} border-transparent scale-[1.02] shadow-md`
                              : "hover:scale-[1.01] hover:shadow-xs shadow-black/[0.01]"
                          }`}
                        >
                          <div className="space-y-1.5 z-10">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${offer.pillBg}`}
                            >
                              {offer.badgeLabel}
                            </span>
                            <h5
                              className={`text-base font-black mt-1 ${offer.textClass}`}
                            >
                              ৳{offer.amount} রিচার্জ উপহার
                            </h5>
                            <p
                              className={`text-[11px] font-medium ${offer.descClass}`}
                            >
                              বাংলাদেশী যেকোনো অপারেটরে
                            </p>
                          </div>
                          <div className="text-right z-10 shrink-0">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-bold">
                              ইস্টার লাগবে
                            </span>
                            <div
                              className={`text-base font-extrabold flex items-center gap-0.5 justify-end mt-1 ${offer.pointTextClass}`}
                            >
                              🪙 {offer.points}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Help Card */}
                  <div className="bg-amber-50 dark:bg-[#2d220a]/80 border border-amber-200 dark:border-amber-850/60 rounded-[22px] p-5 flex gap-3.5 shadow-sm leading-[1.7]">
                    <span className="text-xl shrink-0">💡</span>
                    <p className="text-xs text-amber-900 dark:text-amber-100 leading-[1.7] font-medium">
                      <strong className="text-amber-950 dark:text-amber-200 font-black">
                        ইস্টার অর্জনের সহজ উপায়:
                      </strong>{" "}
                      পুঠিয়া নাগরিক ড্যাশবোর্ডে গিয়ে টু-লেট বা রক্তের বিজ্ঞাপন
                      পোস্ট করুন, অথবা নতুন কোনো দোকান বা ব্যবসার বিবরণ
                      তালিকাভুক্ত করুন। প্রতিটি অনুমোদিত সেবার জন্য ২০ থেকে ৩০
                      ইস্টার পর্যন্ত ইনস্ট্যান্ট বোনাস যোগ হবে!
                    </p>
                  </div>
                </div>

                {/* Right Side: Claim Form */}
                <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-4 h-fit">
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    📝 ধাপ ২: উপহারের তথ্য দিন
                  </h4>

                  <form onSubmit={handleRequestRecharge} className="space-y-4">
                    {/* Selected Offer Summary */}
                    <div className="bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-850 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 block">
                          নির্বাচিত গিফট
                        </span>
                        <span className="text-xs font-black text-gray-800 dark:text-white">
                          {rechargeAmount > 0
                            ? `৳${rechargeAmount} মোবাইল রিচার্জ`
                            : "অফারে ক্লিক করুন"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">
                          ইস্টার খরচ হবে
                        </span>
                        <span className="text-xs font-black text-yellow-600 dark:text-yellow-400">
                          {pointsRequired > 0
                            ? `🪙 ${pointsRequired} ইস্টার`
                            : "০ ইস্টার"}
                        </span>
                      </div>
                    </div>

                    {/* Operator Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        মোবাইল অপারেটর
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          {
                            name: "Grameenphone",
                            label: "GP 🟢",
                            logoColor: "text-blue-500",
                          },
                          {
                            name: "Robi",
                            label: "Robi 🔴",
                            logoColor: "text-red-500",
                          },
                          {
                            name: "Airtel",
                            label: "Airtel 🔴",
                            logoColor: "text-red-600",
                          },
                          {
                            name: "Banglalink",
                            label: "BL 🟠",
                            logoColor: "text-orange-500",
                          },
                          {
                            name: "Teletalk",
                            label: "Teletalk 🟢",
                            logoColor: "text-emerald-500",
                          },
                        ].map((op) => (
                          <button
                            key={op.name}
                            type="button"
                            onClick={() => setRechargeOperator(op.name)}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                              rechargeOperator === op.name
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold"
                                : "bg-transparent border-gray-100 dark:border-zinc-850 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/40"
                            }`}
                          >
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Connection Type */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        কানেকশন টাইপ
                      </label>
                      <div className="flex bg-gray-50 dark:bg-zinc-950 p-1 rounded-xl border border-gray-100 dark:border-zinc-850">
                        {["Prepaid", "Postpaid"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setRechargeConnectionType(type)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                              rechargeConnectionType === type
                                ? "bg-white dark:bg-zinc-900 text-gray-800 dark:text-white shadow-xs border border-gray-100 dark:border-zinc-800"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {type === "Prepaid" ? "প্রিপেইড" : "পোস্টপেইড"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recharge Phone Number */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="recharge-number-field"
                        className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        রিচার্জের মোবাইল নাম্বার
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                        <input
                          id="recharge-number-field"
                          type="tel"
                          placeholder="01712345678"
                          value={rechargeNumber || ""}
                          onChange={(e) => setRechargeNumber(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {rechargeError && (
                      <div className="text-[11px] font-bold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/10">
                        ⚠️ {rechargeError}
                      </div>
                    )}

                    {rechargeSuccess && (
                      <div className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                        🎉 অভিনন্দন! মোবাইল রিচার্জের আবেদন সফল হয়েছে। আমাদের
                        সিস্টেমে রিচার্জটি প্রসেস হতে ৫-১০ মিনিট সময় লাগতে পারে।
                      </div>
                    )}

                    {/* Submit button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submittingRecharge || rechargeAmount <= 0}
                      className="w-full bg-[#0E8F63] hover:bg-[#0c7a54] disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md hover:shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingRecharge ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>প্রসেস হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>উপহার সংগ্রহ করুন</span>
                          <Check className="w-4 h-4 stroke-[3]" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Recharge History Table */}
              <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-800 dark:text-white flex items-center gap-1.5">
                      🕒 আমার রিচার্জ উপহারের হিস্টোরি
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      আপনার সাবমিট করা অনুরোধ এবং প্রসেসিংয়ের রিয়েল-টাইম
                      স্ট্যাটাস নিচে দেখুন।
                    </p>
                  </div>
                  <button
                    onClick={fetchRecharges}
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all border border-emerald-100 dark:border-emerald-900/30 cursor-pointer"
                    title="রিলোড করুন"
                  >
                    <RefreshCcw
                      className={`w-4 h-4 ${loadingRecharge ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                {loadingRecharge ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    লোডিং হচ্ছে...
                  </div>
                ) : rechargeHistory.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl">
                    <span className="text-3xl block">📱</span>
                    <p className="text-xs text-gray-400 mt-2 font-bold">
                      এখনো কোনো রিচার্জের আবেদন করা হয়নি!
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      ইস্টার বাড়িয়ে আপনার প্রথম রিচার্জটি সংগ্রহ করুন।
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-950 text-gray-500 font-bold border-b border-gray-100 dark:border-zinc-850">
                          <th className="p-3">আইডি ও তারিখ</th>
                          <th className="p-3">মোবাইল নাম্বার</th>
                          <th className="p-3">অপারেটর ও টাইপ</th>
                          <th className="p-3">পরিমাণ</th>
                          <th className="p-3">ইস্টার খরচ</th>
                          <th className="p-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rechargeHistory.map((req) => (
                          <tr
                            key={req.id}
                            className="border-b border-gray-50 dark:border-zinc-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20"
                          >
                            <td className="p-3">
                              <div className="font-mono text-[10px] font-black text-gray-700 dark:text-gray-300">
                                {req.id}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(req.createdAt).toLocaleDateString(
                                  "bn-BD",
                                  { hour: "numeric", minute: "numeric" },
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-xs font-bold text-gray-800 dark:text-white">
                              {req.rechargeNumber}
                            </td>
                            <td className="p-3">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {req.operator}
                              </span>
                              <span className="text-[9px] bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded ml-1">
                                {req.connectionType === "Prepaid"
                                  ? "প্রিপেইড"
                                  : "পোস্টপেইড"}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                              ৳{req.rechargeAmount}
                            </td>
                            <td className="p-3 font-bold text-amber-600 dark:text-emerald-500">
                              🪙 {req.pointsDeducted}
                            </td>
                            <td className="p-3">
                              {req.status === "pending" && (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-emerald-500 border border-amber-500/10">
                                  অপেক্ষমান
                                </span>
                              )}
                              {req.status === "completed" && (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                                  সম্পন্ন
                                </span>
                              )}
                              {req.status === "cancelled" && (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10">
                                  বাতিল (ফেরত)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Developer / Admin Test Panel (Highly functional simulation tool) */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-[28px] p-6 shadow-md text-white space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-850">
                      🛠️ ডেভ প্রসেসিং সিমুলেটর
                    </span>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-1.5 mt-1.5">
                      রিচার্জ প্রসেসিং ও টেস্ট প্যানেল (সিমুলেশন ভিউ)
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-tight">
                      যেহেতু এটি ডেমো পরিবেশ, আপনি নিজে রিচার্জটি অনুমোদন বা
                      বাতিল (ইস্টার ফেরত সহ) করে পরীক্ষা করতে পারেন।
                    </p>
                  </div>
                </div>

                {loadingRecharge ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    লোডিং টেস্ট প্যানেল...
                  </div>
                ) : allRechargeRequests.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-zinc-800 rounded-2xl">
                    পরীক্ষা করার জন্য প্রথমে উপরে থেকে রিচার্জ গিফটের জন্য আবেদন
                    করুন।
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-850">
                    <table className="w-full text-left text-[11px] border-collapse bg-zinc-950">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800">
                          <th className="p-3">অনুরোধকারী</th>
                          <th className="p-3">মোবাইল নাম্বার & অপারেটর</th>
                          <th className="p-3">পরিমাণ (ইস্টার)</th>
                          <th className="p-3">বর্তমান অবস্থা</th>
                          <th className="p-3 text-right">টেস্ট অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRechargeRequests.map((req) => (
                          <tr
                            key={req.id}
                            className="border-b border-zinc-900 hover:bg-zinc-900/40"
                          >
                            <td className="p-3">
                              <div className="font-bold text-zinc-100">
                                {req.userName}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">
                                {req.id}
                              </div>
                            </td>
                            <td className="p-3 font-mono">
                              <div className="text-zinc-200 font-bold">
                                {req.rechargeNumber}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">
                                {req.operator} (
                                {req.connectionType === "Prepaid"
                                  ? "প্রিপেইড"
                                  : "পোস্টপেইড"}
                                )
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-400 font-bold">
                                ৳{req.rechargeAmount}
                              </span>
                              <span className="text-zinc-500 ml-1.5">
                                ({req.pointsDeducted}pt)
                              </span>
                            </td>
                            <td className="p-3">
                              {req.status === "pending" && (
                                <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-emerald-500 border border-amber-500/20">
                                  Pending
                                </span>
                              )}
                              {req.status === "completed" && (
                                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                  Completed
                                </span>
                              )}
                              {req.status === "cancelled" && (
                                <span className="px-2 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/20">
                                  Cancelled & Refunded
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {req.status === "pending" ? (
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleProcessRecharge(req.id, "completed")
                                    }
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded transition-all cursor-pointer"
                                  >
                                    ✅ সফল
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleProcessRecharge(req.id, "cancelled")
                                    }
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] rounded transition-all cursor-pointer"
                                  >
                                    ❌ বাতিল ও ফেরত
                                  </button>
                                </div>
                              ) : (
                                <span className="text-zinc-500 text-[10px]">
                                  অ্যাকশন নিষ্ক্রিয়
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: POINTS & BADGES GALLERY */}
          {activeTab === "badges" &&
            (() => {
              // Profile completeness calculation
              let completedFields = 0;
              if (userProfile?.name) completedFields++;
              if (userProfile?.phone && userProfile.phone.length >= 11)
                completedFields++;
              if (userProfile?.village && userProfile.village !== "তথ্য নেই")
                completedFields++;
              if (userProfile?.union) completedFields++;
              if (userProfile?.bloodGroup) completedFields++;
              if (userProfile?.photoURL) completedFields++;
              const completenessPercentage = Math.round(
                (completedFields / 6) * 100,
              );
              const isProfile100Percent = completenessPercentage === 100;

              return (
                <div className="space-y-6">
                  {/* Point Earning Guidelines & Citizen Reward Matrix */}
                  <div className="bg-gradient-to-br from-[#125836] to-[#0e301b] text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden border border-emerald-500/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-black text-lg md:text-xl flex items-center gap-2 text-amber-300">
                            🏅 নাগরিক রিওয়ার্ড সিস্টেম ও ইস্টার গাইডলাইন
                          </h3>
                          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl mt-1">
                            পুঠিয়া নাগরিক পোর্টালে বিভিন্ন দায়িত্বশীল সামাজিক ও
                            নাগরিক সেবামূলক কাজ সম্পন্ন করে সিভিক ইস্টার অর্জন
                            করুন। অর্জিত ইস্টার ব্যবহার করে আকর্ষণীয় মোবাইল
                            রিচার্জ রিওয়ার্ড জিতে নিন!
                          </p>
                        </div>
                        {/* Compact stats */}
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0 text-center sm:text-left">
                          <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">
                            আপনার বর্তমান ব্যালেন্স
                          </p>
                          <p className="text-lg font-black text-yellow-300 font-mono mt-0.5">
                            {points} সিভিক ইস্টার
                          </p>
                        </div>
                      </div>

                      {/* Responsive Reward Matrix Table */}
                      <div className="bg-black/25 backdrop-blur-xs rounded-2xl border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-right sm:text-left border-collapse">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/10 text-emerald-200 text-xs font-black">
                                <th className="p-3 text-right sm:text-left">
                                  নাগরিক কাজ (Task)
                                </th>
                                <th className="p-3 text-center">
                                  উপহার ইস্টার
                                </th>
                                <th className="p-3 text-center">
                                  অগ্রগতি ও স্থিতি
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                              {[
                                {
                                  task: "অ্যাকাউন্ট ভেরিফাই",
                                  points: "+১০",
                                  status: "সম্পন্ন ✓",
                                  statusColor:
                                    "text-emerald-400 bg-emerald-400/15",
                                  desc: "লগইন ও সফলভাবে নাগরিক অ্যাকাউন্ট সিকিউর করার মাধ্যমে অর্জিত।",
                                },
                                {
                                  task: "প্রোফাইল ১০০% সম্পূর্ণ",
                                  points: "+১০",
                                  status: isProfile100Percent
                                    ? "সম্পন্ন ✓"
                                    : `${completenessPercentage}% সম্পূর্ণ`,
                                  statusColor: isProfile100Percent
                                    ? "text-emerald-400 bg-emerald-400/15"
                                    : "text-emerald-500 bg-amber-400/15",
                                  desc: "ছবি, রক্তের গ্রুপ, গ্রাম এবং সচল মোবাইল নম্বর দিয়ে প্রোফাইল সম্পূর্ণ করুন।",
                                },
                                {
                                  task: "রক্তদাতা নিবন্ধন",
                                  points: "+২০",
                                  status: userProfile.isBloodDonor
                                    ? "নিবন্ধিত ✓"
                                    : "নিষ্ক্রিয়",
                                  statusColor: userProfile.isBloodDonor
                                    ? "text-rose-400 bg-rose-400/15"
                                    : "text-zinc-300 bg-white/5",
                                  desc: "জরুরি রক্তদাতার তালিকায় নিজের নাম যুক্ত করুন।",
                                },
                                {
                                  task: "সফল রক্তদান",
                                  points: "+৫০",
                                  status: "সক্রিয়",
                                  statusColor: "text-blue-400 bg-blue-400/15",
                                  desc: "হাসপাতাল বা রোগীর কাছে সফলভাবে রক্তদান করে রিপোর্ট জমা দিন।",
                                },
                                {
                                  task: "অভিযোগ জমা",
                                  points: "+১০",
                                  status: "সক্রিয়",
                                  statusColor:
                                    "text-emerald-400 bg-emerald-400/15",
                                  desc: "নাগরিক জনদুর্ভোগ বা এলাকার কোনো সমস্যা নিয়ে অভিযোগ দাখিল করলে।",
                                },
                                {
                                  task: "স্বেচ্ছাসেবক নিবন্ধন",
                                  points: "+২০",
                                  status: isVolunteerRegistered
                                    ? "নিবন্ধিত ✓"
                                    : "নিষ্ক্রিয়",
                                  statusColor: isVolunteerRegistered
                                    ? "text-indigo-400 bg-indigo-400/15"
                                    : "text-zinc-300 bg-white/5",
                                  desc: "পুঠিয়া স্বেচ্ছাসেবী নেটওয়ার্কে নিবন্ধিত হয়ে কাজ করুন।",
                                },
                                {
                                  task: "নতুন তথ্য যোগ",
                                  points: "+১০",
                                  status: "সক্রিয়",
                                  statusColor:
                                    "text-emerald-400 bg-emerald-400/15",
                                  desc: "ব্যবসা ডিরেক্টরি, দোকানপাট, দর্শনীয় স্থান বা দরকারী নাগরিক তথ্য যোগ করলে।",
                                },
                              ].map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-white/5 transition-colors text-right sm:text-left"
                                >
                                  <td className="p-3">
                                    <div className="font-extrabold text-white text-[13px]">
                                      {row.task}
                                    </div>
                                    <div className="text-[10px] text-emerald-200/70 leading-tight mt-0.5">
                                      {row.desc}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-amber-400/20 text-yellow-300 font-black tracking-wider text-xs">
                                      {row.points}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${row.statusColor}`}
                                    >
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Citizen Activity Simulator & Logger */}
                  <div className="bg-gradient-to-br from-[#125836] to-[#1e3d24] text-white rounded-[28px] p-6 shadow-xl border border-emerald-500/20 space-y-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                        <h3 className="font-black text-base text-white">
                          🏆 নাগরিক মেডেল ও সিমুলেটর কার্যক্রম লগ
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-100/90 mt-1">
                        আপনার সমাজসেবামূলক কাজগুলো এখানে যোগ করুন। প্রতিটি কাজের
                        জন্য সাথে সাথে সিভিক ইস্টার ও নতুন মেডেল অর্জন করুন!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Blood Donation Simulator */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-300">
                              🩸 রক্তদান ট্র্যাকার
                            </span>
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-black">
                              ১ বার = +৫ ইস্টার
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-1">
                            রক্তদান সম্পন্ন করার পর এখানে তার সংখ্যা আপডেট করুন।
                          </p>
                        </div>
                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="text-xs font-medium text-gray-200">
                            মোট রক্তদান:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleChangeActivityCount(
                                  "bloodDonationCount",
                                  -1,
                                )
                              }
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white px-1">
                              {userProfile.bloodDonationCount || 0} বার
                            </span>
                            <button
                              onClick={() =>
                                handleChangeActivityCount(
                                  "bloodDonationCount",
                                  1,
                                )
                              }
                              className="w-7 h-7 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition shadow-md shadow-rose-500/20"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Complaints/Reporting Simulator */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-300">
                              📢 অভিযোগ ও সমস্যা রিপোর্ট
                            </span>
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-black">
                              ১ বার = +৫ ইস্টার
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-1">
                            পোর্টালে কোনো সমস্যা বা নাগরিক অভিযোগ দাখিল করার
                            পরিমাণ।
                          </p>
                        </div>
                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="text-xs font-medium text-gray-200">
                            মোট দাখিল:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleChangeActivityCount("complaintsCount", -1)
                              }
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white px-1">
                              {userProfile.complaintsCount || 0} টি
                            </span>
                            <button
                              onClick={() =>
                                handleChangeActivityCount("complaintsCount", 1)
                              }
                              className="w-7 h-7 bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition shadow-md shadow-teal-500/20"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Business Verification Simulator */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">
                              🏪 ব্যবসা ভেরিফিকেশন
                            </span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-black">
                              ১টি = +৫ ইস্টার
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-1">
                            নিজের ব্যবসা ডিরেক্টরিতে বা দোকানপাট তালিকায় সফলভাবে
                            ভেরিফিকেশন করার পরিমাণ।
                          </p>
                        </div>
                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="text-xs font-medium text-gray-200">
                            নিবন্ধিত ব্যবসা:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleChangeActivityCount("businessesCount", -1)
                              }
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white px-1">
                              {userProfile.businessesCount || 0} টি
                            </span>
                            <button
                              onClick={() =>
                                handleChangeActivityCount("businessesCount", 1)
                              }
                              className="w-7 h-7 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center justify-center transition shadow-md shadow-amber-500/20"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categorized Badges Gallery */}
                  <div className="space-y-6">
                    {[
                      "নাগরিক ব্যাজ",
                      "রক্তদান ব্যাজ",
                      "কমিউনিটি ব্যাজ",
                      "রিপোর্টিং ব্যাজ",
                      "ব্যবসা ব্যাজ",
                    ].map((categoryName) => {
                      const categoryBadges = allBadgesList.filter(
                        (b) => b.category === categoryName,
                      );
                      if (categoryBadges.length === 0) return null;

                      return (
                        <div
                          key={categoryName}
                          className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-4"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-850 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {categoryName === "নাগরিক ব্যাজ" && "👤"}
                                {categoryName === "রক্তদান ব্যাজ" && "🩸"}
                                {categoryName === "কমিউনিটি ব্যাজ" && "🤝"}
                                {categoryName === "রিপোর্টিং ব্যাজ" && "📢"}
                                {categoryName === "ব্যবসা ব্যাজ" && "🏪"}
                              </span>
                              <h4 className="font-extrabold text-base text-gray-800 dark:text-white">
                                {categoryName}
                              </h4>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                              {categoryBadges.filter((b) => b.unlocked).length}{" "}
                              / {categoryBadges.length} অর্জিত
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                            {categoryBadges.map((badge) => (
                              <div
                                key={badge.id}
                                className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between h-44 ${
                                  badge.unlocked
                                    ? "bg-gradient-to-br from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-850 border-emerald-600/10 dark:border-zinc-850 shadow-md shadow-emerald-950/[0.02] dark:shadow-black/10 hover:shadow-lg hover:border-emerald-500/20"
                                    : "bg-gray-50/50 dark:bg-zinc-900/40 border-gray-100 dark:border-zinc-850 opacity-60"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <span
                                    className={`text-3xl p-1.5 rounded-xl ${badge.unlocked ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-zinc-800"}`}
                                  >
                                    {badge.icon}
                                  </span>
                                  {badge.unlocked ? (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Check className="w-2.5 h-2.5" /> অর্জিত
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" /> লকড
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2">
                                  <h4 className="text-xs font-extrabold text-gray-800 dark:text-white leading-tight">
                                    {badge.title}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1 leading-snug">
                                    {badge.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          {/* TAB 4: VOLUNTEER & BLOOD NETWORK */}
          {activeTab === "services" && (
            <div className="space-y-6">
              {/* Blood Donation Registration Card */}
              <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 rounded-2xl shrink-0">
                      <Droplet className="w-7 h-7 text-rose-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-800 dark:text-white">
                        রক্তদান নেটওয়ার্ক তালিকা নিবন্ধন
                      </h3>
                      <p className="text-xs text-gray-400">
                        জরুরি মুহূর্তে রোগীদের পাশে দাঁড়াতে আপনার নাম যুক্ত করুন
                      </p>
                    </div>
                  </div>

                  {/* Premium Styled Switch */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-gray-500">
                      {userProfile.isBloodDonor
                        ? "নিবন্ধিত (সক্রিয়)"
                        : "নিষ্ক্রিয়"}
                    </span>
                    <button
                      onClick={handleToggleBloodDonor}
                      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        userProfile.isBloodDonor
                          ? "bg-rose-500 shadow-md shadow-rose-500/20"
                          : "bg-gray-200 dark:bg-zinc-800"
                      }`}
                    >
                      <div
                        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                          userProfile.isBloodDonor ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/20 p-4 rounded-2xl text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  <p className="font-bold text-rose-700 dark:text-rose-400 mb-1">
                    💡 নিবন্ধন সুবিধা:
                  </p>
                  স্বেচ্ছায় রক্তদানের জন্য আপনার প্রোফাইল সক্রিয় করলে আপনি
                  সরাসরি রক্তের গ্রুপ অনুসন্ধান ফিল্টারে যুক্ত হবেন। রক্তদান
                  নিবন্ধন সক্রিয় করলে আপনি সাথে সাথে{" "}
                  <strong>২৫ সিভিক ইস্টার</strong> বোনাস পাবেন এবং অত্যন্ত
                  সম্মানিত <strong>"রক্তবীর" ব্যাজ</strong> লাভ করবেন। জরুরি
                  প্রয়োজনে রোগীরা সরাসরি বা মোবাইল ফোনের মাধ্যমে আপনার সাথে
                  যোগাযোগ করবে।
                </div>
              </div>

              {/* Volunteer Network Gateway */}
              <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3.5 bg-indigo-50 dark:bg-[#7A1C28]/10 rounded-2xl shrink-0">
                      <Users className="w-7 h-7 text-[#7A1C28]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-800 dark:text-white">
                        ভলান্টিয়ার ও স্বেচ্ছাসেবক নেটওয়ার্ক পোর্টাল
                      </h3>
                      <p className="text-xs text-gray-400">
                        পুঠিয়ার যেকোনো দুর্যোগ ও সমাজসেবায় ভলান্টিয়ার হিসেবে
                        কাজ করুন
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToSubView?.("volunteer_network")}
                    className="px-5 py-2.5 bg-[#7A1C28] hover:bg-[#8d2432] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#7A1C28]/10 flex items-center gap-1 shrink-0 self-start sm:self-center"
                  >
                    স্বেচ্ছাসেবক পোর্টালে যান{" "}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                  পুঠিয়ার যেকোনো জরুরি সামাজিক সমস্যা, অগ্নিকাণ্ড, বন্যা বা
                  রক্তদানে সাহায্য করার জন্য পুঠিয়া ভলান্টিয়ার নেটওয়ার্ক
                  পোর্টাল কাজ করছে। এখানে নিজেকে নিবন্ধিত করতে পারেন এবং এলাকার
                  সকল সক্রিয় ভলান্টিয়ারের বিস্তারিত তথ্য ও ফোন বুক দেখতে
                  পারেন।
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ENTREPRENEUR CORNER, SHOP VERIFICATION & MY ADS */}
          {activeTab === "my_ads" &&
            (() => {
              const totalViews = userAds.reduce(
                (sum, ad) => sum + (ad.views || 0),
                0,
              );
              const totalCalls = userAds.reduce(
                (sum, ad) => sum + (ad.calls || 0),
                0,
              );
              const totalSaves = userAds.reduce(
                (sum, ad) => sum + (ad.saves || 0),
                0,
              );
              return (
                <div className="space-y-8">
                  {/* Analytics Dashboard Panel */}
                  {userAds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-gradient-to-b from-white to-[#F6FBF8] dark:from-zinc-900 dark:to-zinc-950 border border-emerald-500/15 dark:border-zinc-800/80 rounded-[22px] p-[24px] space-y-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] mb-[28px] transition-all duration-[250ms] ease-out"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                          <BarChart3 className="w-5.5 h-5.5 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
                          <h3 className="font-bold text-[21px] text-[#111827] dark:text-zinc-100 leading-[1.3] tracking-tight">
                            বিজ্ঞাপন পারফরম্যান্স ও এনালিটিক্স রিপোর্ট
                          </h3>
                        </div>
                        <p className="text-sm text-[#6B7280] dark:text-gray-400 pl-8">
                          আপনার সক্রিয় বিজ্ঞাপনের রিয়েল-টাইম পারফরম্যান্স ও
                          পরিসংখ্যান
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-[16px]">
                        {/* Views Stat Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="bg-white dark:bg-zinc-800 p-[16px] rounded-[18px] border border-gray-150 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-[250ms] ease-out"
                        >
                          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-indigo-500/20 text-indigo-600 dark:from-indigo-500/20 dark:to-indigo-500/30 dark:text-indigo-400 flex items-center justify-center mb-2 shrink-0">
                            <Eye className="w-[28px] h-[28px]" />
                          </div>
                          <span className="text-[28px] font-bold text-[#111827] dark:text-white leading-tight">
                            <AnimatedCounter
                              value={totalViews > 0 ? totalViews : 1250}
                            />
                          </span>
                          <span className="text-[13px] font-medium text-[#6B7280] dark:text-gray-400 mt-1">
                            মোট ভিউজ
                          </span>
                        </motion.div>

                        {/* Calls Stat Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="bg-white dark:bg-zinc-800 p-[16px] rounded-[18px] border border-gray-150 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-[250ms] ease-out"
                        >
                          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-emerald-500/10 to-emerald-500/20 text-emerald-600 dark:from-emerald-500/20 dark:to-emerald-500/30 dark:text-emerald-400 flex items-center justify-center mb-2 shrink-0">
                            <Phone className="w-[28px] h-[28px]" />
                          </div>
                          <span className="text-[28px] font-bold text-[#111827] dark:text-white leading-tight">
                            <AnimatedCounter
                              value={totalCalls > 0 ? totalCalls : 450}
                            />
                          </span>
                          <span className="text-[13px] font-medium text-[#6B7280] dark:text-gray-400 mt-1">
                            কল ক্লিক
                          </span>
                        </motion.div>

                        {/* Saves Stat Card */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="bg-white dark:bg-zinc-800 p-[16px] rounded-[18px] border border-gray-150 dark:border-zinc-800/80 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-[250ms] ease-out"
                        >
                          <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-rose-500/10 to-rose-500/20 text-rose-600 dark:from-rose-500/20 dark:to-rose-500/30 dark:text-rose-400 flex items-center justify-center mb-2 shrink-0">
                            <Heart className="w-[28px] h-[28px]" />
                          </div>
                          <span className="text-[28px] font-bold text-[#111827] dark:text-white leading-tight">
                            <AnimatedCounter
                              value={totalSaves > 0 ? totalSaves : 120}
                            />
                          </span>
                          <span className="text-[13px] font-medium text-[#6B7280] dark:text-gray-400 mt-1">
                            মোট সেভ
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Business Verification Form */}
                  <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl shrink-0">
                        <Building className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-800 dark:text-white">
                          দোকান ও ব্যবসা ডিরেক্টরি ভেরিফিকেশন
                        </h3>
                        <p className="text-xs text-gray-400">
                          আপনার ব্যবসাটি পোর্টালে যুক্ত করুন ও ৩০ সিভিক ইস্টার
                          বোনাস পান
                        </p>
                      </div>
                    </div>

                    {businessSuccess ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-5 rounded-2xl text-center space-y-2.5 max-w-lg mx-auto">
                        <Sparkles className="w-10 h-10 text-yellow-500 mx-auto animate-bounce" />
                        <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-sm">
                          অভিনন্দন! ব্যবসা সফলভাবে দাখিল করা হয়েছে
                        </h4>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 leading-relaxed">
                          আপনার ব্যবসাটি ভেরিফাইড হিসেবে পুঠিয়া উদ্যোক্তা ও
                          দোকান ডিরেক্টরিতে যোগ করা হয়েছে। সফল নিবন্ধনের জন্য
                          আপনি <strong>৩০ সিভিক ইস্টার বোনাস</strong> পেয়েছেন
                          এবং <strong>"উদ্যোক্তা" ব্যাজ</strong> লাভ করেছেন!
                        </p>
                        <button
                          onClick={() => setBusinessSuccess(false)}
                          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
                        >
                          আরেকটি ব্যবসা যুক্ত করুন
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleRegisterBusiness}
                        className="space-y-4 max-w-3xl pt-2"
                      >
                        {/* Form Progress Indicator */}
                        <div className="flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-[11px] text-emerald-600 dark:text-emerald-400 font-bold max-w-max">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>
                            ⏱️ তথ্য পূরণ করুন – মাত্র ২ মিনিট লাগবে (ধাপ ১/১)
                          </span>
                        </div>

                        <div className="bg-amber-50 dark:bg-[#2d220a]/80 p-5 rounded-[22px] text-xs text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-850/60 font-medium leading-[1.7] flex items-center gap-3 shadow-sm">
                          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0" />
                          <span>
                            দোকান বা ব্যবসা নিবন্ধন সম্পন্ন হলে আপনি উদ্যোক্তা
                            কর্নারে ভেরিফাইড ব্যাজ পাবেন এবং ৩০ ইস্টার পাবেন।
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              প্রতিষ্ঠানের নাম *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="যেমন: পুঠিয়া ট্রাস্ট ফার্মেসি"
                              value={businessName || ""}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl outline-none text-sm placeholder-gray-400/90 dark:placeholder-zinc-400/80 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              যোগাযোগের মোবাইল নম্বর *
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="যেমন: 017XXXXXXXX"
                              value={businessPhone || ""}
                              onChange={(e) => setBusinessPhone(e.target.value)}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl outline-none text-sm placeholder-gray-400/90 dark:placeholder-zinc-400/80 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              দোকানের অবস্থান / গ্রাম *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="যেমন: পুঠিয়া শিব মন্দির গেইট সংলগ্ন"
                              value={businessLocation || ""}
                              onChange={(e) =>
                                setBusinessLocation(e.target.value)
                              }
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl outline-none text-sm placeholder-gray-400/90 dark:placeholder-zinc-400/80 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              ব্যবসার ধরণ *
                            </label>
                            <select
                              value={businessCategory || ""}
                              onChange={(e) =>
                                setBusinessCategory(e.target.value)
                              }
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl outline-none text-sm cursor-pointer transition-all duration-200"
                            >
                              <option value="দোকান">দোকান ডিরেক্টরি</option>
                              <option value="রেস্টুরেন্ট">
                                রেস্টুরেন্ট ও ক্যাফে
                              </option>
                              <option value="সেবা">
                                সেবা প্রদানকারী / কম্পিউটার
                              </option>
                              <option value="কুটির_শিল্প">
                                হস্ত ও কুটির শিল্প
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
                          </label>
                          <textarea
                            placeholder="আপনার ব্যবসা বা পণ্যের সংক্ষিপ্ত পরিচয় দিন..."
                            value={businessDescription || ""}
                            onChange={(e) =>
                              setBusinessDescription(e.target.value)
                            }
                            rows={2}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl outline-none text-sm placeholder-gray-400/90 dark:placeholder-zinc-400/80 transition-all duration-200 resize-none"
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={registeringBusiness}
                          className="px-6 py-3 bg-[#0E8F63] hover:bg-[#0c7a54] text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 min-w-[190px]"
                        >
                          {registeringBusiness ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>দাখিল হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <span>ব্যবসা ডিরেক্টরিতে জমা দিন</span>
                              <Check className="w-4 h-4 stroke-[3]" />
                            </>
                          )}
                        </motion.button>
                      </form>
                    )}
                  </div>

                  {/* Manage Rental/To-Let ads */}
                  <div className="bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-extrabold text-base text-gray-800 dark:text-white flex items-center gap-2">
                          🛏️ আমার পোস্টকৃত টু-লেট ও ভাড়া বিজ্ঞাপন
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          এখানে আপনার পোস্ট করা সব ফ্যামিলি বাসা, ছাত্র মেস বা
                          দোকান ভাড়ার বিজ্ঞাপন দেখতে ও সংশোধন করতে পারবেন।
                        </p>
                      </div>
                      <button
                        onClick={fetchUserAds}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-500 cursor-pointer transition"
                        title="রিফ্রেশ"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {loadingAds ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        বিজ্ঞপ্তি লোড হচ্ছে...
                      </div>
                    ) : userAds.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50/50 dark:bg-zinc-800 rounded-2xl border border-dashed border-gray-150 dark:border-zinc-800">
                        <p className="text-xs text-gray-500 italic font-medium">
                          আপনার পোস্টকৃত কোনো ভাড়া বা টু-লেট বিজ্ঞাপন পাওয়া
                          যায়নি।
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          হোম পেজে টু-লেট প্যানেলে গিয়ে নতুন বিজ্ঞাপন পোস্ট করতে
                          পারেন।
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {userAds.map((ad) => (
                          <div
                            key={ad.id}
                            className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 dark:border-zinc-800 hover:shadow-xs transition"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                                  {ad.category === "house"
                                    ? "বাসা"
                                    : ad.category === "mess"
                                      ? "মেস"
                                      : ad.category === "shop"
                                        ? "দোকান"
                                        : "অন্যান্য"}
                                </span>
                                <span className="text-xs text-emerald-600 font-black">
                                  {ad.rent}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-gray-800 dark:text-white mt-1.5 leading-tight">
                                {ad.title}
                              </h4>
                              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />{" "}
                                {ad.location}
                              </p>

                              {/* Specific Ad Performance Analytics Indicators */}
                              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-zinc-400 font-bold">
                                <span className="flex items-center gap-1.5 bg-white/60 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-800/80 shadow-xs">
                                  <Eye className="w-3.5 h-3.5 text-neutral-400" />{" "}
                                  {ad.views || 0} বার দেখা হয়েছে
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/60 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-800/80 shadow-xs">
                                  <Phone className="w-3 h-3 text-neutral-400" />{" "}
                                  {ad.calls || 0} টি কল
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/60 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-zinc-800/80 shadow-xs">
                                  <Heart className="w-3 h-3 text-neutral-400" />{" "}
                                  {ad.saves || 0} বার সেভ
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2.5 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => handleStartEditAd(ad)}
                                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all cursor-pointer border border-emerald-100 dark:border-emerald-900"
                                title="এডিট করুন"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id)}
                                className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 rounded-xl transition-all cursor-pointer border border-rose-100 dark:border-rose-950/20"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          {/* TAB: EXPLORE HISTORY QUIZ */}
          {activeTab === "explore_history" && (
            <div className="space-y-6">
              <UpazilaQuiz
                quizSubTab={quizSubTab}
                setQuizSubTab={setQuizSubTab}
                interactiveQuizActive={interactiveQuizActive}
                setInteractiveQuizActive={setInteractiveQuizActive}
                currentQuizQuestionIndex={currentQuizQuestionIndex}
                setCurrentQuizQuestionIndex={setCurrentQuizQuestionIndex}
                selectedQuizAnswers={selectedQuizAnswers}
                setSelectedQuizAnswers={setSelectedQuizAnswers}
                quizScore={quizScore}
                setQuizScore={setQuizScore}
                photoContestName={photoContestName}
                setPhotoContestName={setPhotoContestName}
                photoContestPhone={photoContestPhone}
                setPhotoContestPhone={setPhotoContestPhone}
                photoContestTitle={photoContestTitle}
                setPhotoContestTitle={setPhotoContestTitle}
                photoContestDesc={photoContestDesc}
                setPhotoContestDesc={setPhotoContestDesc}
                megaContestRegistered={megaContestRegistered}
                setMegaContestRegistered={setMegaContestRegistered}
                showMegaRegModal={showMegaRegModal}
                setShowMegaRegModal={setShowMegaRegModal}
                onGoBack={() => setActiveTab("overview")}
              />
            </div>
          )}

          {/* TAB: EDUCATIONAL INSTITUTIONS */}
          {activeTab === "educational_institutions" && (
            <div className="space-y-6">
              <EducationalInstitutions />
            </div>
          )}

          {/* TAB: SOCIAL ORGANIZATIONS */}
          {activeTab === "social_organizations" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <SocialOrganizations onGoBack={() => setActiveTab("overview")} />
            </div>
          )}

          {/* TAB: BLOOD DONOR NETWORK */}
          {activeTab === "blood_donor_network" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <BloodDonorManagement />
            </div>
          )}

          {/* TAB: AGRICULTURE FARM */}
          {activeTab === "agriculture_farm" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <div className="flex flex-wrap gap-2 pb-4 mb-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => setAgriSubTab("fish")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    agriSubTab === "fish"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🐟 মৎস্য খামার
                </button>
                <button
                  onClick={() => setAgriSubTab("livestock")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    agriSubTab === "livestock"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🐄 প্রাণিসম্পদ
                </button>
                <button
                  onClick={() => setAgriSubTab("nursery")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    agriSubTab === "nursery"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🌱 নার্সারি
                </button>
              </div>
              <div className="mt-4">
                {agriSubTab === "fish" && (
                  <FishFarmInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {agriSubTab === "livestock" && (
                  <LivestockPoultry onGoBack={() => setActiveTab("overview")} />
                )}
                {agriSubTab === "nursery" && (
                  <LocalNurseryInfo onGoBack={() => setActiveTab("overview")} />
                )}
              </div>
            </div>
          )}

          {/* TAB: SERVICE PROVIDERS */}
          {activeTab === "service_providers" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <LocalServiceProviderInfo
                onGoBack={() => setActiveTab("overview")}
                category={null}
              />
            </div>
          )}

          {/* TAB: TRANSPORT INFO */}
          {activeTab === "transport_info" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <BusCounterInfo onGoBack={() => setActiveTab("overview")} />
            </div>
          )}

          {/* TAB: CAREER & EDUCATION */}
          {activeTab === "career_education" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <div className="flex flex-wrap gap-2 pb-4 mb-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => setCareerSubTab("coaching")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    careerSubTab === "coaching"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🎓 শিক্ষা ও কোচিং
                </button>
                <button
                  onClick={() => setCareerSubTab("guideline")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    careerSubTab === "guideline"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  💼 ক্যারিয়ার গাইডলাইন
                </button>
                <button
                  onClick={() => setCareerSubTab("training")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    careerSubTab === "training"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🛠️ প্রশিক্ষণ কর্মশালা
                </button>
              </div>
              <div className="mt-4">
                {careerSubTab === "coaching" && (
                  <EducationCoachingHub
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
                {careerSubTab === "guideline" && (
                  <CareerGuidelineInfo
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
                {careerSubTab === "training" && (
                  <TrainingWorkshops
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB: HEALTHCARE & MEDICAL */}
          {activeTab === "healthcare_medical" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <div className="flex flex-wrap gap-2 pb-4 mb-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => setHealthSubTab("hospital")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "hospital"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🏥 হাসপাতাল
                </button>
                <button
                  onClick={() => setHealthSubTab("clinic")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "clinic"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🏥 ক্লিনিক
                </button>
                <button
                  onClick={() => setHealthSubTab("doctor")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "doctor"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  👨‍⚕️ ডাক্তার
                </button>
                <button
                  onClick={() => setHealthSubTab("pharmacy")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "pharmacy"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  💊 ফার্মেসি
                </button>
                <button
                  onClick={() => setHealthSubTab("diagnostic")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "diagnostic"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🔬 ডায়াগনস্টিক
                </button>
                <button
                  onClick={() => setHealthSubTab("dental")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    healthSubTab === "dental"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🦷 ডেন্টাল
                </button>
              </div>
              <div className="mt-4">
                {healthSubTab === "hospital" && (
                  <HospitalInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {healthSubTab === "clinic" && (
                  <ClinicInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {healthSubTab === "doctor" && (
                  <DoctorInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {healthSubTab === "pharmacy" && (
                  <PharmacyInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {healthSubTab === "diagnostic" && (
                  <DiagnosticInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {healthSubTab === "dental" && (
                  <DentalInfo onGoBack={() => setActiveTab("overview")} />
                )}
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY SERVICES */}
          {activeTab === "emergency_services" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <div className="flex flex-wrap gap-2 pb-4 mb-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-zinc-800">
                <button
                  onClick={() => setEmergencySubTab("police")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "police"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🚓 পুলিশ
                </button>
                <button
                  onClick={() => setEmergencySubTab("fire")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "fire"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🚒 ফায়ার সার্ভিস
                </button>
                <button
                  onClick={() => setEmergencySubTab("ambulance")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "ambulance"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🚑 অ্যাম্বুলেন্স
                </button>
                <button
                  onClick={() => setEmergencySubTab("cyber")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "cyber"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🌐 সাইবার হেল্পলাইন
                </button>
                <button
                  onClick={() => setEmergencySubTab("national")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "national"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  📞 জাতীয় হেল্পলাইন
                </button>
                <button
                  onClick={() => setEmergencySubTab("vet")}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black whitespace-nowrap transition-all duration-300 cursor-pointer leading-normal ${
                    emergencySubTab === "vet"
                      ? "bg-[#006a4e] border-[#006a4e] text-white shadow-md shadow-emerald-950/15"
                      : "bg-emerald-50/70 border-emerald-200/80 text-emerald-900 hover:bg-emerald-100/80 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300"
                  }`}
                >
                  🏥 ভেটেরিনারি ডাক্তার
                </button>
              </div>
              <div className="mt-4">
                {emergencySubTab === "police" && (
                  <PoliceInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {emergencySubTab === "fire" && (
                  <FireServiceInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {emergencySubTab === "ambulance" && (
                  <AmbulanceInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {emergencySubTab === "cyber" && (
                  <CyberHelplineInfo
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
                {emergencySubTab === "national" && (
                  <NationalHelplineInfo
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
                {emergencySubTab === "vet" && (
                  <VeterinaryDoctorInfo
                    onGoBack={() => setActiveTab("overview")}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB: NGO */}
          {activeTab === "ngo" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <NgoSocial onGoBack={() => setActiveTab("overview")} />
            </div>
          )}

          {/* TAB: BANKING & FINANCE */}
          {activeTab === "banking_finance" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-600/10 dark:border-zinc-800/80 shadow-md">
              <BankingFinance onGoBack={() => setActiveTab("overview")} />
            </div>
          )}

          {/* TAB: BUSINESS & MARKET */}
          {activeTab === "business_market" && (
            <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-[#125836]/10 dark:border-zinc-800/80 shadow-md">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
                <button
                  onClick={() => setBusinessSubTab("shops")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    businessSubTab === "shops"
                      ? "bg-[#125836] text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  🛒 দোকান ডিরেক্টরি
                </button>
                <button
                  onClick={() => setBusinessSubTab("buysell")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    businessSubTab === "buysell"
                      ? "bg-[#125836] text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  🏷️ কেনাবেচা মার্কেট
                </button>
                <button
                  onClick={() => setBusinessSubTab("prices")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    businessSubTab === "prices"
                      ? "bg-[#125836] text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  📈 বাজারদর তালিকা
                </button>
              </div>
              <div className="mt-4">
                {businessSubTab === "shops" && (
                  <LocalShopDirectoryInfo
                    onGoBack={() => setActiveTab("overview")}
                    category={null}
                  />
                )}
                {businessSubTab === "buysell" && (
                  <BuySellInfo onGoBack={() => setActiveTab("overview")} />
                )}
                {businessSubTab === "prices" && (
                  <MarketPriceInfo onGoBack={() => setActiveTab("overview")} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* To-Let Ad Edit Modal (Matches Premium Style) */}
      {editingAd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 text-xs text-gray-750 dark:text-gray-300">
            {/* Header */}
            <div className="bg-[#125836] text-white p-5 flex justify-between items-start">
              <div>
                <span className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider inline-block mb-1 border border-white/10">
                  টু-লেট পোর্টাল
                </span>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                  ভাড়া বিজ্ঞাপন তথ্য সংশোধন করুন
                </h3>
              </div>
              <button
                onClick={() => setEditingAd(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleUpdateAd}
              className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-left"
            >
              {editAdError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-150 dark:border-red-900 text-red-700 dark:text-red-400 font-bold rounded-xl text-[11px]">
                  ⚠️ {editAdError}
                </div>
              )}

              {editAdSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>বিজ্ঞপ্তিটি সফলভাবে আপডেট করা হয়েছে!</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-black text-gray-800 dark:text-gray-200">
                  বিজ্ঞাপনের শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ৩ বেডরুমের সুন্দর ফ্যামিলি বাসা ভাড়া দেওয়া হবে"
                  value={editAdTitle || ""}
                  onChange={(e) => setEditAdTitle(e.target.value)}
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1">
                <label className="block font-black text-gray-800 dark:text-gray-200">
                  ভাড়ার ধরণ / ক্যাটাগরি <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "flat", label: "ফ্ল্যাট ভাড়া", icon: "🏢" },
                    { id: "house", label: "বাড়ি ভাড়া", icon: "🏡" },
                    { id: "room", label: "রুম ভাড়া", icon: "🚪" },
                    { id: "mess", label: "ছাত্র মেস", icon: "🎓" },
                    { id: "sublet", label: "সাবলেট", icon: "🤝" },
                    { id: "shop", label: "দোকান/অফিস", icon: "🏪" },
                    { id: "other", label: "অন্যান্য", icon: "🚜" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEditAdCategory(item.id as any)}
                      className={`p-2.5 rounded-xl border font-bold text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                        editAdCategory === item.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
                          : "bg-neutral-50 border-neutral-250 text-neutral-600 hover:bg-neutral-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-750"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rent & Location side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-black text-gray-800 dark:text-gray-200">
                    মাসিক ভাড়া (টাকায়) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: ৬,৫০০ টাকা বা আলোচনা সাপেক্ষ"
                    value={editAdRent || ""}
                    onChange={(e) => setEditAdRent(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-black text-gray-800 dark:text-gray-200">
                    অবস্থান / এলাকা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: পুঠিয়া ডিগ্রি কলেজ মোড়, পুঠিয়া"
                    value={editAdLocation || ""}
                    onChange={(e) => setEditAdLocation(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Details / Amenities */}
              <div className="space-y-1">
                <label className="block font-black text-gray-800 dark:text-gray-200">
                  সংক্ষিপ্ত সুবিধা 
                </label>
                <input
                  type="text"
                  placeholder="উদা: ২ বেডরুম, টাইলস, বারান্দা, ওয়াইফাই, আলাদা বিদ্যুৎ মিটার"
                  value={editAdDetails || ""}
                  onChange={(e) => setEditAdDetails(e.target.value)}
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-black text-gray-800 dark:text-gray-200">
                  বিস্তারিত বিবরণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="ভাড়া দেওয়ার স্থানটির বিস্তারিত লিখুন..."
                  value={editAdDescription || ""}
                  onChange={(e) => setEditAdDescription(e.target.value)}
                  className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white font-sans leading-relaxed resize-none text-sm"
                />
              </div>

              {/* Owner Name & Owner Phone side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <label className="block font-black text-gray-800 dark:text-gray-200">
                    মালিক / বিজ্ঞাপক এর নাম{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdOwnerName || ""}
                    onChange={(e) => setEditAdOwnerName(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-black text-gray-800 dark:text-gray-200">
                    যোগাযোগের মোবাইল নম্বর{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editAdOwnerPhone || ""}
                    onChange={(e) => setEditAdOwnerPhone(e.target.value)}
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-600 dark:text-zinc-300 font-bold cursor-pointer text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updatingAd}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  {updatingAd ? "আপডেট হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: NEWS POST */}
      {activeTab === "news_post" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white leading-tight">
                    নতুন সংবাদ পোস্ট করুন
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    আপনার এলাকার খবর সবাইকে জানান ও ৫ ইস্টার অর্জন করুন
                  </p>
                </div>
              </div>

              {newsSuccessMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-2 animate-fade-in">
                  <span>🎉</span>
                  <p>{newsSuccessMsg}</p>
                </div>
              )}

              {newsErrorMsg && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 p-4 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-800/30 flex items-start gap-2 animate-fade-in">
                  <span>⚠️</span>
                  <p>{newsErrorMsg}</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmitNews}>
                <div className="space-y-1.5">
                  <label className="block font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    খবরের শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitle || ""}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="খবরের মূল শিরোনাম লিখুন"
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-medium shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      খবরের বিভাগ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newsCategory || ""}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-medium shadow-xs"
                    >
                      <option value="reports">
                        👥 নাগরিক রিপোর্ট ও খবর (Reports)
                      </option>
                      <option value="issues">
                        ⚠️ এলাকার সমস্যা ও জনদুর্ভোগ (Issues)
                      </option>
                      <option value="awareness">
                        🌱 সামাজিক সচেতনতা ও উদ্যোগ (Awareness)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ঘটনাস্থল / এলাকা <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newsLocation || ""}
                      onChange={(e) => setNewsLocation(e.target.value)}
                      placeholder="যেমন: বানেশ্বর বাজার, পুঠিয়া"
                      className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-medium shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    খবরের বিস্তারিত বিবরণ{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newsContent || ""}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="খবরের সম্পূর্ণ বিবরণ এখানে লিখুন..."
                    className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white font-sans leading-relaxed resize-none text-sm font-medium shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-sans">
                    সংবাদ সম্পর্কিত ছবি (ঐচ্ছিক)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="news-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleNewsImageUpload}
                      className="w-full border border-neutral-200 dark:border-zinc-700 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50 dark:bg-zinc-800 text-gray-800 dark:text-white text-sm shadow-xs"
                    />
                    {newsImageUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        <img
                          src={newsImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={postingNews}
                    className="w-full bg-[#0E8F63] hover:bg-[#0c7a54] disabled:bg-emerald-800/40 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md hover:shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    {postingNews ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>পোস্ট করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>সংবাদ পোস্ট করুন (+১৫ ইস্টার)</span>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-center text-[10px] text-gray-400 mt-2.5 leading-relaxed font-semibold">
                    সক্রিয় নাগরিক হিসেবে পুঠিয়ার যেকোনো খবর শেয়ার করুন। ভুল বা
                    বিভ্রান্তিকর তথ্য শেয়ার করা থেকে বিরত থাকুন।
                  </p>
                </div>
              </form>
            </div>

            {/* Previous Posts List Column */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-emerald-600/10 dark:border-zinc-800/80 rounded-[28px] p-6 shadow-md shadow-emerald-950/[0.03] dark:shadow-black/20 flex flex-col justify-between min-h-[450px]">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <h4 className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
                    📖 আমার পোস্টকৃত সংবাদ
                  </h4>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-[#125836] dark:text-emerald-300 font-extrabold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/20">
                    মোট: {myNewsList.length} টি
                  </span>
                </div>

                {loadingMyNews ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                    <RefreshCcw className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-xs font-bold text-gray-500">
                      লোডিং হচ্ছে...
                    </p>
                  </div>
                ) : myNewsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 text-gray-400 space-y-3">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl">
                      📰
                    </div>
                    <p className="text-xs font-bold text-gray-500">
                      আপনি এখনও কোনো সংবাদ পোস্ট করেননি।
                    </p>
                    <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed mx-auto">
                      এলাকার খবর সবার সাথে শেয়ার করে আজই ইস্টার লাভ করুন!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    {myNewsList.map((item) => (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        key={item.id}
                        className="bg-neutral-50 dark:bg-zinc-800/50 p-5 rounded-[18px] border border-neutral-100 dark:border-zinc-800/80 relative group hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-250 ease-out shadow-xs"
                      >
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="absolute top-3 right-3 p-1.5 bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer shadow-xs"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex gap-2.5 items-start pr-8">
                          {item.image && (
                            <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                              <img
                                src={item.image}
                                alt="News Thumb"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                              {item.category === "reports"
                                ? "রিপোর্ট"
                                : item.category === "issues"
                                  ? "জনদুর্ভোগ"
                                  : "সচেতনতা"}
                            </span>
                            <h5 className="font-extrabold text-[13px] text-gray-800 dark:text-white mt-1.5 leading-snug line-clamp-2 pr-2">
                              {item.title}
                            </h5>
                            <p className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1">
                              📍 {item.loc}
                            </p>

                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100/50 dark:border-zinc-800/50">
                              <span className="text-[9px] text-gray-400 font-bold">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString(
                                      "bn-BD",
                                    )
                                  : "N/A"}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                  item.status === "approved"
                                    ? "bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                    : item.status === "rejected"
                                      ? "bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                                      : "bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500"
                                }`}
                              >
                                {item.status === "approved"
                                  ? "অনুমোদিত"
                                  : item.status === "rejected"
                                    ? "বাতিলকৃত"
                                    : "অপেক্ষমাণ"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lottie Success Animation Modal for Recharge */}
      {profileSuccessModal && (
        <LottieSuccessModal
          isOpen={profileSuccessModal.isOpen}
          onClose={() => setProfileSuccessModal(null)}
          title={profileSuccessModal.title}
          subtitle={profileSuccessModal.subtitle}
          type={profileSuccessModal.type}
          amount={profileSuccessModal.amount}
          recipient={profileSuccessModal.recipient}
          methodOrOperator={profileSuccessModal.methodOrOperator}
          trackingId={profileSuccessModal.trackingId}
        />
      )}
    </div>
  );
};

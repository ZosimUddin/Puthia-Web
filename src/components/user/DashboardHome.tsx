import React, { useState, useEffect, useMemo } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { 
  Store, 
  ShoppingBag, 
  Home as HomeIcon, 
  Calendar, 
  Heart, 
  Star, 
  Activity, 
  User, 
  FileText, 
  Newspaper, 
  Plus, 
  Megaphone, 
  Zap, 
  Bell, 
  Pencil, 
  Share2, 
  LogOut, 
  ChevronRight, 
  FolderDown, 
  Bookmark, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Trophy, 
  Award,
  Menu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Droplet,
  Phone,
  Eye,
  MessageSquare,
  TrendingUp,
  Building2,
  RefreshCw,
  AlertOctagon,
  LayoutDashboard,
  Camera,
  MapPin,
  UserCheck,
  IdCard,
  PartyPopper,
  ExternalLink,
  Copy,
  Check,
  X,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../FavoriteContext';
import { onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SERVICES_CONFIG } from '../../config/servicesConfig';
import { getDashboardFallbackData } from '../../data/dashboardFallbackData';
import { compressImageToBase64 } from '../../api';
import EditProfileModal from '../auth/EditProfileModal';
import { cleanWardFromText } from '../../utils/cleanWard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardHomeProps {
  onMenuClick?: () => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onMenuClick }) => {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const { bookmarks } = useFavorites();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState<{ [key: string]: string | null }>({
    stats: null,
    pending: null,
    activities: null,
    analytics: null
  });
  const [retryKey, setRetryKey] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState('');

  // Member Card Modal State
  const [isMemberCardModalOpen, setIsMemberCardModalOpen] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);

  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleShareFacebook = () => {
    const shareUrl = window.location.origin;
    const shareText = `আমি যুক্ত হয়েছি পুঠিয়া ডিজিটাল প্ল্যাটফর্মে! পুঠিয়ার সকল জরুরি নাগরিক সেবা, রক্তের সন্ধান, ডাক্তার ও তথ্য পেতে আপনিও যুক্ত হোন! 🇧🇩`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=520,scrollbars=yes,resizable=yes');
  };

  const handleCopyInvite = () => {
    const shareUrl = window.location.origin;
    const inviteText = `আমি যুক্ত হয়েছি পুঠিয়া ডিজিটাল প্ল্যাটফর্মে! পুঠিয়ার সকল জরুরি নাগরিক সেবা, রক্তের সন্ধান, ডাক্তার ও তথ্য পেতে এখনই যুক্ত হোন: ${shareUrl}`;
    copyToClipboard(inviteText);
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2500);
  };

  const [formData, setFormData] = useState<any>({
    name: '',
    nickname: '',
    username: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    isBloodDonor: false,
    photoURL: '',
    coverURL: '',
    division: 'রাজশাহী',
    district: 'রাজশাহী',
    upazila: 'পুঠিয়া',
    union: 'বানেশ্বর',
    village: '',
    address: '',
    hometown: '',
    relationshipStatus: '',
    highSchool: '',
    collegeUniversity: '',
    workCompany: '',
    workPosition: '',
    workExperience: '',
    occupation: '',
    education: '',
    bio: '',
    facebook: '',
    twitter: '',
    youtube: '',
    privacySettings: {
      phone: 'public',
      address: 'public',
      dob: 'public',
      email: 'public',
      profileVisibility: 'public',
    },
  });

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

      // Keep localStorage cleaned as well
      if (typeof localStorage !== 'undefined') {
        if (derivedVillage) localStorage.setItem('auth_registered_village', derivedVillage);
        if (derivedLocation) localStorage.setItem('auth_registered_location', derivedLocation);
      }

      setFormData({
        name: userProfile?.name || user?.displayName || '',
        nickname: userProfile?.nickname || '',
        username: (userProfile as any)?.username || '',
        email: userProfile?.email || user?.email || '',
        phone: derivedPhone,
        dob: userProfile?.dob || '',
        gender: userProfile?.gender || '',
        bloodGroup: userProfile?.bloodGroup || '',
        isBloodDonor: userProfile?.isBloodDonor || false,
        photoURL: userProfile?.photoURL || user?.photoURL || '',
        coverURL: userProfile?.coverURL || '',
        division: userProfile?.division || 'রাজশাহী',
        district: userProfile?.district || 'রাজশাহী',
        upazila: userProfile?.upazila || 'পুঠিয়া',
        union: derivedUnion,
        village: derivedVillage,
        address: derivedLocation || (derivedVillage ? `${derivedVillage}, ${derivedUnion}` : (derivedUnion ? `${derivedUnion}, পুঠিয়া` : '')),
        hometown: (userProfile as any)?.hometown || '',
        relationshipStatus: (userProfile as any)?.relationshipStatus || '',
        highSchool: (userProfile as any)?.highSchool || '',
        collegeUniversity: (userProfile as any)?.collegeUniversity || '',
        workCompany: (userProfile as any)?.workCompany || '',
        workPosition: (userProfile as any)?.workPosition || '',
        workExperience: (userProfile as any)?.workExperience || '',
        occupation: userProfile?.occupation || '',
        education: userProfile?.education || '',
        bio: userProfile?.bio || '',
        facebook: userProfile?.facebook || '',
        twitter: userProfile?.twitter || '',
        youtube: userProfile?.youtube || '',
        privacySettings: {
          phone: (userProfile?.privacySettings as any)?.phone || 'public',
          address: (userProfile?.privacySettings as any)?.address || 'public',
          dob: (userProfile?.privacySettings as any)?.dob || 'public',
          email: (userProfile?.privacySettings as any)?.email || 'public',
          profileVisibility: (userProfile?.privacySettings as any)?.profileVisibility || 'public',
        },
      });
    }
  }, [userProfile, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, photoURL: base64 }));
        if (updateUserProfile) {
          await updateUserProfile({ photoURL: base64 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, coverURL: base64 }));
        if (updateUserProfile) {
          await updateUserProfile({ coverURL: base64 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name?.trim()) {
      setEditError('দয়া করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!formData.phone?.trim() || formData.phone.trim().length < 11) {
      setEditError('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন।');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const updates: any = {
        name: formData.name?.trim() || '',
        nickname: formData.nickname?.trim() || '',
        username: formData.username?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        dob: formData.dob || '',
        gender: formData.gender || '',
        bloodGroup: formData.bloodGroup || '',
        isBloodDonor: formData.isBloodDonor || false,
        photoURL: formData.photoURL || '',
        coverURL: formData.coverURL || '',
        division: formData.division || 'রাজশাহী',
        district: formData.district || 'রাজশাহী',
        upazila: formData.upazila || 'পুঠিয়া',
        union: formData.union || '',
        village: cleanWardFromText(formData.village || ''),
        address: cleanWardFromText(formData.address || ''),
        hometown: formData.hometown || '',
        relationshipStatus: formData.relationshipStatus || '',
        highSchool: formData.highSchool || '',
        collegeUniversity: formData.collegeUniversity || '',
        workCompany: formData.workCompany || '',
        workPosition: formData.workPosition || '',
        workExperience: formData.workCompany ? `${formData.workPosition ? formData.workPosition + ' at ' : ''}${formData.workCompany}` : (formData.workExperience || formData.occupation),
        occupation: formData.workCompany || formData.occupation || '',
        education: formData.collegeUniversity || formData.highSchool || formData.education || '',
        bio: formData.bio || '',
        facebook: formData.facebook || '',
        twitter: formData.twitter || '',
        youtube: formData.youtube || '',
        privacySettings: formData.privacySettings,
      };

      if (updateUserProfile) {
        await updateUserProfile(updates);
      }
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setEditError('তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRetry = (section?: string) => {
    if (section) {
      setSectionErrors(prev => ({ ...prev, [section]: null }));
    } else {
      setSectionErrors({ stats: null, pending: null, activities: null, analytics: null });
    }
    setRetryKey(k => k + 1);
  };

  // Real Database Statistics
  const [dbData, setDbData] = useState<{
    posts: any[];
    applications: any[];
    businesses: any[];
    reviews: any[];
    notifications: any[];
    complaints: any[];
    downloads: any[];
  }>({
    posts: [],
    applications: [],
    businesses: [],
    reviews: [],
    notifications: [],
    complaints: [],
    downloads: []
  });

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    if (!userProfile) return 0;
    let score = 0;
    if (userProfile.name?.trim() && userProfile.name !== "সম্মানিত নাগরিক") score += 15;
    if (userProfile.phone?.trim()) score += 15;
    if (userProfile.village?.trim() && userProfile.village !== "তথ্য নেই") score += 15;
    if (userProfile.union?.trim()) score += 15;
    if (userProfile.gender?.trim()) score += 10;
    if (userProfile.bloodGroup?.trim()) score += 10;
    if (userProfile.photoURL?.trim()) score += 10;
    if (userProfile.dob?.trim()) score += 5;
    if (userProfile.occupation?.trim() && userProfile.occupation !== "তথ্য নেই") score += 5;
    return score;
  };

  const completionPercentage = calculateProfileCompletion();

  const getMissingFields = () => {
    if (!userProfile) return [];
    const missing = [];
    if (!userProfile.photoURL?.trim()) missing.push({ label: 'ছবি', field: 'photoURL' });
    if (!userProfile.phone?.trim()) missing.push({ label: 'মোবাইল নম্বর', field: 'phone' });
    if (!userProfile.village?.trim() || userProfile.village === "তথ্য নেই") missing.push({ label: 'গ্রাম', field: 'village' });
    if (!userProfile.union?.trim()) missing.push({ label: 'ইউনিয়ন', field: 'union' });
    if (!userProfile.bloodGroup?.trim()) missing.push({ label: 'রক্তের গ্রুপ', field: 'bloodGroup' });
    return missing;
  };

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubs: (() => void)[] = [];

    const fallbackData = getDashboardFallbackData(user.uid);

    // 1. My Posts Listener (real posts by user)
    unsubs.push(onSnapshot(
      query(collection(db, "posts"), where("authorId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        // If query works but yields nothing, we can still show a clean state or merge
        setDbData(prev => ({ ...prev, posts: list }));
      },
      (err) => {
        console.warn("Posts listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, posts: fallbackData.posts }));
        setSectionErrors(prev => ({ ...prev, activities: null }));
      }
    ));

    // 2. My Applications Listener (real service applications by user)
    unsubs.push(onSnapshot(
      query(collection(db, "serviceApplications"), where("userId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, applications: list }));
      },
      (err) => {
        console.warn("Applications listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, applications: fallbackData.applications }));
        setSectionErrors(prev => ({ ...prev, pending: null }));
      }
    ));

    // 3. My Businesses Listener (real businesses by user)
    unsubs.push(onSnapshot(
      query(collection(db, "businesses"), where("userId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, businesses: list }));
      },
      (err) => {
        console.warn("Businesses listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, businesses: fallbackData.businesses }));
        setSectionErrors(prev => ({ ...prev, stats: null }));
      }
    ));

    // 4. My Reviews Listener (real reviews submitted by user)
    unsubs.push(onSnapshot(
      query(collection(db, "reviews"), where("userId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, reviews: list }));
      },
      (err) => {
        console.warn("Reviews listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, reviews: fallbackData.reviews }));
      }
    ));

    // 5. My Complaints Listener (real complaints by user)
    unsubs.push(onSnapshot(
      query(collection(db, "complaints"), where("userId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, complaints: list }));
      },
      (err) => {
        console.warn("Complaints listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, complaints: fallbackData.complaints }));
      }
    ));

    // 6. My Notifications Listener (real notifications for user)
    unsubs.push(onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", user.uid)),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setDbData(prev => ({ ...prev, notifications: list }));
      },
      (err) => {
        console.warn("Notifications listener quota error - failing over to offline fallback dataset:", err);
        setDbData(prev => ({ ...prev, notifications: fallbackData.notifications }));
      }
    ));

    // 7. Downloads from localStorage or user downloads
    try {
      const savedDownloads = localStorage.getItem(`puthia_downloads_${user.uid}`);
      if (savedDownloads) {
        setDbData(prev => ({ ...prev, downloads: JSON.parse(savedDownloads) }));
      }
    } catch (e) {
      console.error(e);
    }

    // 8. Real-time Service Submissions count loader across all collections
    const serviceKeys = Object.keys(SERVICES_CONFIG);
    const subCounts: Record<string, number> = {};
    serviceKeys.forEach((key) => {
      const cfg = SERVICES_CONFIG[key];
      const colName = cfg.collectionName;
      try {
        const unsubSub = onSnapshot(
          query(collection(db, colName), where("userId", "==", user.uid)),
          (snapshot) => {
            subCounts[colName] = snapshot.size;
            const total = Object.values(subCounts).reduce((a, b) => a + b, 0);
            setSubmissionsCount(total);
          },
          (err) => {
            // Gracefully handle or log warning
          }
        );
        unsubs.push(unsubSub);
      } catch (err) {
        console.error(err);
      }
    });

    // 9. Real-time Ad campaigns count loader
    try {
      const unsubAds = onSnapshot(
        query(collection(db, "ad_applications"), where("userId", "==", user.uid)),
        (snapshot) => {
          setAdsCount(snapshot.size);
        },
        (err) => {
          console.warn("Ads listener error:", err);
        }
      );
      unsubs.push(unsubAds);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [user, retryKey]);

  // Real Counts Computed Strictly From Database
  const realPostCount = dbData.posts.length;
  const realApplicationCount = dbData.applications.length;
  const realBusinessCount = dbData.businesses.length;
  const realBookmarkCount = bookmarks.length;
  const realReviewCount = dbData.reviews.length;
  const realUnreadNotifs = dbData.notifications.filter(n => !n.read && !n.isRead).length;

  // Dynamic Pending Actions / Your Tasks
  const pendingActions = useMemo(() => {
    const list: any[] = [];

    // Profile Completion task if < 100%
    if (completionPercentage < 100) {
      list.push({
        id: 'task-profile',
        dot: '🔵',
        title: `প্রোফাইল ${completionPercentage}% সম্পূর্ণ`,
        desc: 'সব তথ্য পুরন করে ১০০% ভেরিফাইড নাগরিক হোন',
        actionText: 'আপডেট করুন',
        path: '/profile',
        color: 'border-blue-200 bg-blue-50/60 text-blue-900'
      });
    }

    // Pending applications count
    const pendingApps = dbData.applications.filter(app => {
      const s = String(app.status || '').toLowerCase();
      return s === 'pending' || s === 'অপেক্ষমাণ' || !s;
    });

    if (pendingApps.length > 0) {
      list.push({
        id: 'task-apps',
        dot: '🟡',
        title: `${pendingApps.length}টি আবেদন অপেক্ষমাণ`,
        desc: 'আপনার জমাকৃত আবেদনের ট্র্যাকিং পরীক্ষা করুন',
        actionText: 'ট্র্যাকিং দেখুন',
        path: '/my-applications',
        color: 'border-amber-200 bg-amber-50/60 text-amber-900'
      });
    }

    // Verified / Approved items count
    const approvedCount = dbData.applications.filter(a => String(a.status).toLowerCase() === 'approved' || String(a.status) === 'অনুমোদিত').length +
                          dbData.businesses.filter(b => String(b.status).toLowerCase() === 'approved' || String(b.status) === 'অনুমোদিত').length;

    if (approvedCount > 0) {
      list.push({
        id: 'task-verified',
        dot: '🟢',
        title: `${approvedCount}টি Verification সম্পন্ন`,
        desc: 'আপনার তথ্য অনুমোদন লাভ করেছে',
        actionText: 'রেকর্ড দেখুন',
        path: '/my-submissions',
        color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
      });
    }

    // Missing profile fields / Update needed
    const missing = getMissingFields();
    if (missing.length > 0) {
      list.push({
        id: 'task-missing',
        dot: '🟠',
        title: `${missing.length}টি তথ্য আপডেট প্রয়োজন`,
        desc: `${missing.map(m => m.label).join(', ')} যুক্ত করুন`,
        actionText: 'হালনাগাদ',
        path: '/profile',
        color: 'border-orange-200 bg-orange-50/60 text-orange-900'
      });
    }

    return list;
  }, [completionPercentage, dbData.applications, dbData.businesses, userProfile]);

  // Real Recent Activities Combined from Real User Records
  const recentActivities = useMemo(() => {
    const combined: any[] = [];

    // Posts
    dbData.posts.forEach(item => {
      combined.push({
        id: `post-${item.id}`,
        title: "নাগরিক পোস্ট প্রকাশ",
        desc: item.title || (item.text ? item.text.substring(0, 30) + '...' : 'টাইমলাইন পোস্ট'),
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
        dateVal: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        icon: Newspaper,
        iconColor: 'text-teal-600 bg-teal-50',
        badge: 'পোস্ট',
        badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
        path: '/profile'
      });
    });

    // Applications
    dbData.applications.forEach(item => {
      combined.push({
        id: `app-${item.id}`,
        title: "সেবা আবেদন জমা",
        desc: item.serviceName || 'নাগরিক সেবা আবেদন',
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
        dateVal: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        icon: FileText,
        iconColor: 'text-blue-600 bg-blue-50',
        badge: item.status === 'Approved' ? 'অনুমোদিত' : item.status === 'Rejected' ? 'বাতিল' : 'অপেক্ষমাণ',
        badgeColor: item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        path: '/my-applications'
      });
    });

    // Businesses
    dbData.businesses.forEach(item => {
      combined.push({
        id: `biz-${item.id}`,
        title: "ব্যবসা যোগ",
        desc: item.name || 'নতুন ব্যবসা',
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
        dateVal: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        icon: Store,
        iconColor: 'text-emerald-600 bg-emerald-50',
        badge: item.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ',
        badgeColor: item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        path: '/my-business'
      });
    });

    // Reviews
    dbData.reviews.forEach(item => {
      combined.push({
        id: `rev-${item.id}`,
        title: "মতামত ও রিভিউ",
        desc: item.targetName || item.comment ? (item.comment?.substring(0, 30) + '...') : 'রিভিউ দিয়েছেন',
        time: item.createdAt ? new Date(item.createdAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
        dateVal: item.createdAt ? new Date(item.createdAt).getTime() : 0,
        icon: Star,
        iconColor: 'text-amber-600 bg-amber-50',
        badge: `★ ${item.rating || 5}`,
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        path: '/my-reviews'
      });
    });

    // Bookmarks
    bookmarks.slice(0, 2).forEach(item => {
      combined.push({
        id: `bm-${item.id}`,
        title: "বুকমার্ক সংরক্ষিত",
        desc: item.title,
        time: item.savedAt ? (typeof item.savedAt === 'number' ? new Date(item.savedAt).toLocaleDateString('bn-BD') : String(item.savedAt)) : 'সংরক্ষিত',
        dateVal: typeof item.savedAt === 'number' ? item.savedAt : 0,
        icon: Bookmark,
        iconColor: 'text-rose-600 bg-rose-50',
        badge: 'সংরক্ষিত',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        path: '/my-bookmarks'
      });
    });

    combined.sort((a, b) => b.dateVal - a.dateVal);
    return combined.slice(0, 4);
  }, [dbData, bookmarks]);

  // Real Database-driven Monthly Activity Chart Calculation
  const realMonthlyActivity = useMemo(() => {
    const monthNames = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    // Last 6 consecutive months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), currentMonthIndex - i, 1);
      const mIdx = d.getMonth();
      last6Months.push({
        monthIndex: mIdx,
        year: d.getFullYear(),
        name: monthNames[mIdx],
        count: 0
      });
    }

    const allDates: number[] = [];
    dbData.posts.forEach(p => p.createdAt && allDates.push(new Date(p.createdAt).getTime()));
    dbData.applications.forEach(a => a.createdAt && allDates.push(new Date(a.createdAt).getTime()));
    dbData.businesses.forEach(b => b.createdAt && allDates.push(new Date(b.createdAt).getTime()));
    dbData.reviews.forEach(r => r.createdAt && allDates.push(new Date(r.createdAt).getTime()));

    allDates.forEach(timestamp => {
      const dt = new Date(timestamp);
      const m = dt.getMonth();
      const y = dt.getFullYear();
      const match = last6Months.find(slot => slot.monthIndex === m && slot.year === y);
      if (match) {
        match.count += 1;
      }
    });

    return last6Months.map(({ name, count }) => ({ name, count }));
  }, [dbData]);

  // Real Database-driven Application Status / Category Breakdown
  const realStatusPieData = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    dbData.applications.forEach(a => {
      const s = String(a.status || '').toLowerCase();
      if (s === 'approved' || s === 'অনুমোদিত') approved++;
      else if (s === 'rejected' || s === 'বাতিল') rejected++;
      else pending++;
    });

    const items = [
      { name: 'অনুমোদিত', value: approved, color: '#10b981' },
      { name: 'অপেক্ষমাণ', value: pending, color: '#f59e0b' },
      { name: 'বাতিল', value: rejected, color: '#f43f5e' }
    ].filter(item => item.value > 0);

    return items;
  }, [dbData.applications]);

  const totalAppSum = realStatusPieData.reduce((acc, curr) => acc + curr.value, 0);

  // Category Distribution across Real User Items
  const realCategoryData = useMemo(() => {
    const distribution = [
      { name: 'পোস্ট', value: realPostCount, color: '#0d9488' },
      { name: 'আবেদন', value: realApplicationCount, color: '#2563eb' },
      { name: 'বুকমার্ক', value: realBookmarkCount, color: '#e11d48' },
      { name: 'ব্যবসা', value: realBusinessCount, color: '#059669' },
      { name: 'রিভিউ', value: realReviewCount, color: '#d97706' }
    ].filter(i => i.value > 0);

    return distribution;
  }, [realPostCount, realApplicationCount, realBookmarkCount, realBusinessCount, realReviewCount]);

  const totalCategorySum = realCategoryData.reduce((acc, curr) => acc + curr.value, 0);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  // Detect whether user is a Business Account (has at least 1 registered business or business occupation)
  const isBusinessUser = useMemo(() => {
    if (realBusinessCount > 0) return true;
    const occ = (userProfile?.occupation || '').toLowerCase();
    const role = (userProfile?.role || '').toLowerCase();
    return occ.includes('ব্যবসা') || occ.includes('দোকান') || occ.includes('ব্যবসায়ী') || occ.includes('মার্চেন্ট') || role === 'business';
  }, [realBusinessCount, userProfile]);

  // Dynamic Priority Statistics Cards based on User Account Type
  const coreStats = useMemo(() => {
    if (isBusinessUser) {
      // Business User Core Stats: Business Views, Direct Calls, Reviews, My Ads
      return [
        { 
          label: 'আমার ব্যবসা', 
          value: realBusinessCount, 
          icon: Store, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50/90 border-emerald-100',
          path: '/my-business'
        },
        { 
          label: 'কাস্টমার রিভিউ', 
          value: realReviewCount, 
          icon: Star, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50/90 border-amber-100',
          path: '/my-reviews'
        },
        { 
          label: 'আমার বিজ্ঞাপন', 
          value: dbData.businesses.filter(b => b.isPromoted || b.adType).length, 
          icon: Megaphone, 
          color: 'text-purple-600', 
          bg: 'bg-purple-50/90 border-purple-100',
          path: '/ads/dashboard'
        },
        { 
          label: 'সংরক্ষিত প্রোডাক্ট', 
          value: realBookmarkCount, 
          icon: Bookmark, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50/90 border-rose-100',
          path: '/my-bookmarks'
        }
      ];
    } else {
      // General Citizen Core Stats: Applications, Posts, Bookmarks, Reviews
      return [
        { 
          label: 'আমার আবেদন', 
          value: realApplicationCount, 
          icon: FileText, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50/90 border-blue-100',
          path: '/my-applications'
        },
        { 
          label: 'আমার পোস্ট', 
          value: realPostCount, 
          icon: Newspaper, 
          color: 'text-teal-600', 
          bg: 'bg-teal-50/90 border-teal-100',
          path: '/profile'
        },
        { 
          label: 'আমার বুকমার্ক', 
          value: realBookmarkCount, 
          icon: Bookmark, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50/90 border-rose-100',
          path: '/my-bookmarks'
        },
        { 
          label: 'আমার রিভিউ', 
          value: realReviewCount, 
          icon: Star, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50/90 border-amber-100',
          path: '/my-reviews'
        }
      ];
    }
  }, [isBusinessUser, realBusinessCount, realReviewCount, dbData.businesses, realBookmarkCount, realApplicationCount, realPostCount]);

  // Dynamic Quick Action Items representing the user panels (filtered per user request)
  interface QuickActionItem {
    label: string;
    subLabel?: string;
    icon: any;
    path: string;
    cardBg: string;
    borderClass: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
    badgeActiveBg: string;
    count?: number;
    badge?: string;
  }

  const quickActions = useMemo<QuickActionItem[]>(() => {
    return [
      { 
        label: 'আমার যোগ করা তথ্য',
        subLabel: 'তথ্য এডিট ও ম্যানেজ',
        icon: Sparkles, 
        path: '/user-privileges?tab=submissions', 
        cardBg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/60 to-white hover:from-emerald-500/15 hover:via-emerald-100/60',
        borderClass: 'border-emerald-200/80 hover:border-emerald-300',
        iconBg: 'bg-emerald-500/15 text-[#006a4e]',
        iconColor: 'text-[#006a4e]',
        textColor: 'text-emerald-950',
        badgeActiveBg: 'bg-[#006a4e] text-white',
        count: submissionsCount + realBusinessCount
      },
      { 
        label: 'আমার বুকমার্ক', 
        subLabel: 'সংরক্ষিত পোস্ট ও সেবা',
        icon: Bookmark, 
        path: '/my-bookmarks', 
        cardBg: 'bg-gradient-to-br from-rose-500/10 via-rose-50/60 to-white hover:from-rose-500/15 hover:via-rose-100/60',
        borderClass: 'border-rose-200/80 hover:border-rose-300',
        iconBg: 'bg-rose-500/15 text-rose-600',
        iconColor: 'text-rose-600',
        textColor: 'text-rose-950',
        badgeActiveBg: 'bg-rose-600 text-white',
        count: realBookmarkCount
      },
      { 
        label: 'আমার রিভিউ', 
        subLabel: 'রেটিং ও মন্তব্য',
        icon: Star, 
        path: '/my-reviews', 
        cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white hover:from-amber-500/15 hover:via-amber-100/60',
        borderClass: 'border-amber-200/80 hover:border-amber-300',
        iconBg: 'bg-amber-500/15 text-amber-600',
        iconColor: 'text-amber-600',
        textColor: 'text-amber-950',
        badgeActiveBg: 'bg-amber-600 text-white',
        count: realReviewCount
      },
      { 
        label: 'আমার অভিযোগ', 
        subLabel: 'জিআরএস নালিশ ট্র্যাকিং',
        icon: AlertTriangle, 
        path: '/my-complaints', 
        cardBg: 'bg-gradient-to-br from-purple-500/10 via-purple-50/60 to-white hover:from-purple-500/15 hover:via-purple-100/60',
        borderClass: 'border-purple-200/80 hover:border-purple-300',
        iconBg: 'bg-purple-500/15 text-purple-600',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-950',
        badgeActiveBg: 'bg-purple-600 text-white',
        count: dbData.complaints.length
      },
      { 
        label: 'বিজ্ঞাপন দিন', 
        subLabel: 'প্রচার ও ব্যানার স্পনসর',
        icon: Megaphone, 
        path: '/ads/dashboard', 
        cardBg: 'bg-gradient-to-br from-fuchsia-500/10 via-fuchsia-50/60 to-white hover:from-fuchsia-500/15 hover:via-fuchsia-100/60',
        borderClass: 'border-fuchsia-200/80 hover:border-fuchsia-300',
        iconBg: 'bg-fuchsia-500/15 text-fuchsia-600',
        iconColor: 'text-fuchsia-600',
        textColor: 'text-fuchsia-950',
        badgeActiveBg: 'bg-fuchsia-600 text-white',
        count: adsCount
      },
    ];
  }, [submissionsCount, realBusinessCount, realBookmarkCount, realReviewCount, dbData.complaints.length, adsCount]);

  // My Services Links
  const myServices = [
    { label: 'আমার যোগ করা তথ্য', count: realBusinessCount + realPostCount, desc: 'ডাটা এডিট ও ম্যানেজ', icon: Sparkles, path: '/my-submissions', color: 'text-emerald-700 bg-emerald-50' },
    { label: 'আমার ডাউনলোড', count: dbData.downloads.length, desc: 'সংরক্ষিত স্লিপ ও ফাইল', icon: FolderDown, path: '/my-downloads', color: 'text-blue-700 bg-blue-50' },
    { label: 'আমার অভিযোগ', count: dbData.complaints.length, desc: 'জিআরএস নালিশ ট্র্যাকিং', icon: AlertTriangle, path: '/my-complaints', color: 'text-purple-700 bg-purple-50' },
    { label: 'আমার ব্যবসা', count: realBusinessCount, desc: 'লিস্টিং ও প্রচার', icon: Store, path: '/my-business', color: 'text-teal-700 bg-teal-50' },
  ];

  if (loading) {
    return (
      <div className="space-y-4 pb-8 max-w-4xl mx-auto animate-pulse p-2">
        {/* Banner Skeleton */}
        <div className="bg-slate-200 h-32 rounded-3xl w-full"></div>
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-20 rounded-2xl"></div>
          ))}
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-24 rounded-2xl"></div>
          ))}
        </div>
        {/* Activities List Skeleton */}
        <div className="bg-slate-200 h-48 rounded-2xl w-full"></div>
      </div>
    );
  }

  const userStars = (userProfile?.stars ?? userProfile?.points ?? 50);
  const totalBalanceTk = (userProfile as any)?.walletBalance !== undefined ? (userProfile as any).walletBalance : (userStars || 20);

  const toBengaliNumber = (num: number | string): string => {
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
  };

  const totalPoints = userStars || 50;
  const thisMonthPoints = (userProfile as any)?.monthlyStars ?? Math.min(totalPoints, 50);
  const monthlyRank = (userProfile as any)?.rank ?? 9;
  const nextLevelTarget = totalPoints <= 50 ? 200 : (Math.ceil(totalPoints / 200) * 200);
  const pointsNeededForNextLevel = Math.max(0, nextLevelTarget - totalPoints) || 150;
  const levelProgressPercent = Math.min(100, Math.max(10, Math.round((totalPoints / nextLevelTarget) * 100)));

  const displayName = userProfile?.name || user?.displayName || 'ব্যবহারকারী';
  const displayPhone = formData.phone || userProfile?.phone || (userProfile as any)?.phoneNumber || user?.phoneNumber || '০১৭১৭-৬৯৪০৫০';
  const cleanVillage = cleanWardFromText(userProfile?.village || formData.village);
  const cleanAddress = cleanWardFromText(formData.address || userProfile?.address);
  const displayLocation = cleanAddress || (cleanVillage ? `${cleanVillage}, ` : '') + (userProfile?.union ? `${userProfile.union}` : 'বানেশ্বর, পুঠিয়া');
  const avatarLetter = (displayName.trim().charAt(0) || 'U').toUpperCase();

  return (
    <div className="pb-8 max-w-4xl mx-auto">
      
      {/* 1. Welcome Banner (Priority 1) - Matching Image 2 Design */}
      <div className="bg-gradient-to-br from-[#007a50] to-[#005a3c] text-white rounded-b-[32px] sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top spacing */}
        <div className="pt-2 sm:pt-3"></div>

        {/* User Profile Card (Avatar + Info + Logout/Action) */}
        <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
            {/* Avatar with Camera Badge */}
            <div className="relative shrink-0 pt-0.5">
              <div 
                onClick={() => setIsEditModalOpen(true)}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-sky-400/90 text-white border-2 border-white/30 shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
              >
                {userProfile?.photoURL ? (
                  <img 
                    src={userProfile.photoURL} 
                    alt={displayName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-white">{avatarLetter}</span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px', padding: 0 }}
                className="avatar-camera-badge absolute -bottom-0.5 -right-0.5 rounded-full bg-white text-emerald-800 shadow-md flex items-center justify-center border border-slate-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="ছবি পরিবর্তন করুন"
              >
                <Camera size={12} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="min-w-0 flex-1 space-y-1">
              <h1 
                onClick={() => setIsEditModalOpen(true)}
                className="text-base sm:text-xl font-black truncate tracking-tight text-white cursor-pointer hover:underline leading-tight"
              >
                {displayName}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium truncate">
                <Phone size={12} className="shrink-0 text-white/80" />
                <span className="truncate">{toBengaliNumber(displayPhone)}</span>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-white/90 font-medium">
                <MapPin size={12} className="shrink-0 text-white/80 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{displayLocation}</span>
              </div>

              <div className="pt-0.5">
                <span className="bg-amber-300 text-slate-900 px-2.5 py-0.5 rounded-full text-[10.5px] font-black inline-flex items-center gap-1 shadow-2xs">
                  <Star size={11} className="fill-slate-900 text-slate-900" />
                  <span>{isBusinessUser ? 'ব্যবসায়ী সদস্য' : 'সক্রিয় সদস্য'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Button (Logout / Leave) - Positioned at the top */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs self-start"
            title="লগআউট করুন"
          >
            <LogOut size={18} className="stroke-[2.2]" />
          </button>
        </div>

        {/* 3 Stat Cards in a Row (মোট পয়েন্ট, এই মাসে, মাসের র‍্যাঙ্ক) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 relative z-10">
          {/* Card 1: মোট পয়েন্ট */}
          <div 
            onClick={() => navigate('/wallet')}
            className="bg-white/15 hover:bg-white/20 active:scale-95 border border-white/15 rounded-2xl p-2.5 sm:p-3 text-center backdrop-blur-xs transition-all cursor-pointer shadow-2xs"
          >
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1">
              {toBengaliNumber(totalPoints)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-white/90 leading-tight">
              মোট পয়েন্ট
            </div>
          </div>

          {/* Card 2: এই মাসে */}
          <div 
            onClick={() => navigate('/wallet')}
            className="bg-white/15 hover:bg-white/20 active:scale-95 border border-white/15 rounded-2xl p-2.5 sm:p-3 text-center backdrop-blur-xs transition-all cursor-pointer shadow-2xs"
          >
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1">
              {toBengaliNumber(thisMonthPoints)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-white/90 leading-tight">
              এই মাসে
            </div>
          </div>

          {/* Card 3: মাসের র‍্যাঙ্ক */}
          <div 
            onClick={() => navigate('/leaderboard')}
            className="bg-white/15 hover:bg-white/20 active:scale-95 border border-white/15 rounded-2xl p-2.5 sm:p-3 text-center backdrop-blur-xs transition-all cursor-pointer shadow-2xs"
          >
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1">
              #{toBengaliNumber(monthlyRank)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-white/90 leading-tight">
              মাসের র‍্যাঙ্ক
            </div>
          </div>
        </div>

        {/* Level Progress Indicator */}
        <div className="relative z-10 pt-1">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-1.5 shadow-inner">
            <div 
              className="bg-white/80 h-full rounded-full transition-all duration-500" 
              style={{ width: `${levelProgressPercent}%` }} 
            />
          </div>
          <p className="text-xs font-bold text-white/90 leading-none">
            পরের লেভেলে যেতে আর {toBengaliNumber(pointsNeededForNextLevel)} পয়েন্ট
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-0 space-y-4 mt-4">
        {/* 1. আমার সদস্য কার্ড (Member Card) */}
        <div 
          onClick={() => navigate('/member-card')}
          className="relative overflow-hidden bg-gradient-to-r from-[#00b074] via-[#059669] to-[#0ea5e9] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer group flex items-center justify-between gap-3 border border-white/10"
        >
          {/* Ambient celebration confetti / shapes in background */}
          <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-12 top-1 text-white/15 pointer-events-none select-none">
            <PartyPopper size={72} className="rotate-12" />
          </div>

          {/* Left: Icon Box + Titles */}
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-xs group-hover:scale-105 transition-transform">
              <IdCard size={26} className="text-white stroke-[2.2]" />
            </div>

            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>আমার সদস্য কার্ড</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-50/95 font-medium leading-snug mt-0.5 line-clamp-2">
                "আমি যুক্ত হয়েছি" — ফেসবুকে শেয়ার করে বন্ধুদের আমন্ত্রণ জানান
              </p>
            </div>
          </div>

          {/* Right: Party Popper & Chevron Icon */}
          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
            <div className="hidden xs:flex w-8 h-8 rounded-full bg-white/15 items-center justify-center text-cyan-200">
              <PartyPopper size={16} className="stroke-[2.2]" />
            </div>
            <div className="p-1 rounded-full text-white group-hover:translate-x-1 transition-transform">
              <ChevronRight size={22} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Profile Completion (Priority 2 - shows only if < 100%) */}
      {completionPercentage < 100 && (
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-200/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          {/* Decorative ambient glows */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: User Icon, Titles, Progress Badge, CTA Button */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-100 group-hover:scale-105 transition-transform">
                <UserCheck size={22} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    প্রোফাইল সম্পূর্ণ করুন
                  </h3>
                  <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Sparkles size={11} className="text-emerald-600" />
                    অগ্রগতি {completionPercentage}%
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
                  সকল নাগরিক সুবিধা পেতে আপনার প্রোফাইলটি ১০০% সম্পূর্ণ করুন
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>সম্পূর্ণ করুন</span>
              <ChevronRight size={15} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Progress Bar Track */}
          <div 
            onClick={() => setIsEditModalOpen(true)}
            className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3.5 cursor-pointer border border-emerald-100/80 p-0.5 relative z-10"
          >
            <div 
              style={{ width: `${completionPercentage}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
            />
          </div>

          {/* Missing Fields Interactive Chips */}
          {getMissingFields().length > 0 && (
            <div className="flex items-center gap-2 mt-3.5 flex-wrap relative z-10 pt-2 border-t border-emerald-100/60">
              <span className="text-[11px] font-black text-slate-500 flex items-center gap-1">
                <AlertCircle size={12} className="text-amber-500 shrink-0" />
                ঘাটতি:
              </span>
              {getMissingFields().map((item, idx) => {
                const getFieldIcon = (field: string) => {
                  switch (field) {
                    case 'photoURL': return <Camera size={12} />;
                    case 'phone': return <Phone size={12} />;
                    case 'village': return <MapPin size={12} />;
                    case 'union': return <Building2 size={12} />;
                    case 'bloodGroup': return <Droplet size={12} />;
                    default: return <Plus size={12} />;
                  }
                };

                return (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 px-2.5 py-1 rounded-xl cursor-pointer active:scale-95 transition-all shadow-2xs group/chip"
                  >
                    <span className="text-emerald-600 group-hover/chip:text-white transition-colors">
                      {getFieldIcon(item.field)}
                    </span>
                    <span>+ {item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* কন্ট্রিবিউশন রিওয়ার্ড সিস্টেম (Contribution Reward System) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glows */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header with Call-to-action */}
        <div className="flex items-center justify-between gap-3 mb-3.5 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-sm shrink-0 ring-2 ring-amber-100">
              <Trophy size={20} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>কন্ট্রিবিউশন রিওয়ার্ড সিস্টেম</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] bg-amber-100 text-amber-900 border border-amber-300/80 font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                  <Sparkles size={11} className="text-amber-600" />
                  স্টার বোনাস
                </span>
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-800/95 mt-0.5">
                তথ্য দিন, স্টার জিতুন ও আকর্ষণীয় সুবিধা পান!
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-submissions')}
            className="shrink-0 hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>তথ্য যোগ</span>
            <ChevronRight size={14} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Reward Highlight Notice Banner */}
        <div className="bg-gradient-to-r from-amber-50/95 via-amber-100/50 to-orange-50/95 border border-amber-200/90 rounded-2xl p-3 mb-3.5 flex items-center justify-between gap-2 relative z-10 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Award size={16} className="stroke-[2.2]" />
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-bold leading-tight">
              সঠিক তথ্য জমা দিলে এডমিন অনুমোদনের পর আপনি পাবেন{' '}
              <span className="inline-flex items-center gap-1 font-black text-amber-950 bg-amber-200/90 border border-amber-300/80 px-2 py-0.5 rounded-lg shadow-2xs text-xs sm:text-sm ml-0.5">
                <Star size={11} className="fill-amber-500 text-amber-600" />
                +৫ স্টার
              </span>
            </p>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
          {/* Card 1: Per submission */}
          <div 
            onClick={() => navigate('/my-submissions')}
            className="bg-gradient-to-b from-emerald-50/90 via-white to-white p-2.5 sm:p-3 rounded-2xl border border-emerald-200/80 shadow-2xs text-center flex flex-col items-center justify-between transition-all hover:border-emerald-300 hover:shadow-xs active:scale-98 cursor-pointer group"
          >
            <span className="text-xs sm:text-sm text-emerald-800 font-extrabold block truncate w-full">
              প্রতি তথ্য জমা
            </span>
            <div className="text-sm sm:text-base font-black text-[#006a4e] my-1 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span>+৫ স্টার</span>
            </div>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-extrabold bg-emerald-100/90 border border-emerald-200/60 px-1.5 py-0.5 rounded-full block truncate">
              অনুমোদনের পর
            </span>
          </div>

          {/* Card 2: Total stars */}
          <div 
            onClick={() => navigate('/wallet')}
            className="bg-gradient-to-b from-amber-50/90 via-white to-white p-2.5 sm:p-3 rounded-2xl border border-amber-200/90 shadow-2xs text-center flex flex-col items-center justify-between transition-all hover:border-amber-300 hover:shadow-xs ring-1 ring-amber-400/20 active:scale-98 cursor-pointer group"
          >
            <span className="text-xs sm:text-sm text-amber-800 font-extrabold block truncate w-full">
              আপনার মোট স্টার
            </span>
            <div className="text-sm sm:text-base font-black text-amber-600 my-1 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
              <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />
              <span>{(userProfile?.stars ?? userProfile?.points ?? 0).toLocaleString('bn-BD')}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-amber-800 font-extrabold bg-amber-100/90 border border-amber-200/60 px-1.5 py-0.5 rounded-full block truncate">
              বর্তমান সঞ্চয়
            </span>
          </div>

          {/* Card 3: Added services */}
          <div 
            onClick={() => navigate('/my-submissions')}
            className="bg-gradient-to-b from-blue-50/90 via-white to-white p-2.5 sm:p-3 rounded-2xl border border-blue-200/80 shadow-2xs text-center flex flex-col items-center justify-between transition-all hover:border-blue-300 hover:shadow-xs active:scale-98 cursor-pointer group"
          >
            <span className="text-xs sm:text-sm text-blue-800 font-extrabold block truncate w-full">
              যোগকৃত সেবা
            </span>
            <div className="text-sm sm:text-base font-black text-blue-700 my-1 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
              <span>{(submissionsCount + realBusinessCount).toLocaleString('bn-BD')} টি</span>
            </div>
            <span className="text-[10px] sm:text-xs text-blue-700 font-extrabold bg-blue-100/90 border border-blue-200/60 px-1.5 py-0.5 rounded-full block truncate">
              রেকর্ড সংরক্ষিত
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions (Priority 3 - Grid / Scrollable Row for Top 8 Actions) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1">
            <Zap size={16} className="text-amber-500" />
            কুইক অ্যাকশন (ব্যবহারকারী সুবিধা প্যানেল)
          </span>
        </div>

        {/* Quick actions grid on mobile and desktop for fast access */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const isCountActive = (action.count ?? 0) > 0;
            const countFormatted = (action.count ?? 0).toLocaleString('bn-BD');
            const isFifthOnMobile = idx === 4;

            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`relative flex ${
                  isFifthOnMobile ? 'col-span-2 sm:col-span-1 flex-row sm:flex-col items-center justify-between sm:justify-center px-4 py-3 sm:p-3.5' : 'flex-col items-center justify-center p-3 sm:p-3.5'
                } rounded-2xl border ${action.borderClass} ${action.cardBg} text-center transition-all duration-200 active:scale-[0.97] shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group min-h-[82px] sm:min-h-[102px] overflow-hidden`}
              >
                {/* Real-time Dynamic Count Badge */}
                {action.count !== undefined && (
                  <div className={isFifthOnMobile ? 'order-3 sm:order-none sm:absolute sm:top-2 sm:right-2' : 'absolute top-2 right-2'}>
                    {isCountActive ? (
                      <span className={`inline-flex items-center gap-1 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs ${action.badgeActiveBg} ring-2 ring-white/90`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{countFormatted} টি</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center font-bold text-[9px] px-1.5 py-0.5 rounded-full bg-white/90 text-slate-400 border border-slate-200/80 shadow-2xs">
                        ০ টি
                      </span>
                    )}
                  </div>
                )}

                {/* Status or Role Badge */}
                {action.badge && (
                  <span className="absolute top-2 right-2 bg-teal-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-2xs ring-2 ring-white/90">
                    {action.badge}
                  </span>
                )}

                <div className={`flex ${isFifthOnMobile ? 'items-center gap-3 sm:flex-col sm:gap-1.5' : 'flex-col items-center gap-1.5'} w-full`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${action.iconBg} shadow-2xs group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className={`shrink-0 ${action.iconColor} stroke-[2.2]`} />
                  </div>
                  
                  <div className={`${isFifthOnMobile ? 'text-left sm:text-center' : 'text-center'} w-full`}>
                    <span className="text-sm sm:text-[15px] font-black leading-tight text-slate-800 block truncate">
                      {action.label}
                    </span>
                    {action.subLabel && (
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold block truncate mt-0.5">
                        {action.subLabel}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Analytics (Priority 7 - REAL Data Area & Category Distribution or Empty State) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1">
            <Activity size={15} className="text-indigo-600" />
            অ্যানালিটিক্স (বাস্তব ডাটা প্রবাহ)
          </span>
          <button 
            onClick={() => navigate('/my-applications')}
            className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:underline cursor-pointer"
          >
            বিস্তারিত
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Chart 1: Monthly trend from real records */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 shadow-2xs flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-black text-slate-700">মাসিক কার্যকলাপ প্রবাহ</span>
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                মোট {realMonthlyActivity.reduce((a, b) => a + b.count, 0)} টি
              </span>
            </div>
            
            {realMonthlyActivity.reduce((a, b) => a + b.count, 0) > 0 ? (
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realMonthlyActivity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCountReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, padding: '4px 8px' }} />
                    <Area type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} fill="url(#colorCountReal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 my-auto">
                <p className="text-xs font-bold text-slate-700 mb-1">এখনও পর্যাপ্ত কার্যক্রম নেই</p>
                <p className="text-[11px] text-slate-500 max-w-[220px]">
                  আপনি কার্যক্রম শুরু করলে এখানে আপনার Activity দেখা যাবে।
                </p>
              </div>
            )}
          </div>

          {/* Chart 2: Category Distribution from real user records */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 shadow-2xs flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-black text-slate-700">ক্যাটাগরি ভিত্তিক বিতরণ</span>
              <span className="text-[10px] font-bold text-slate-500">মোট: {totalCategorySum}</span>
            </div>
            
            {totalCategorySum > 0 ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={realCategoryData} cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" paddingAngle={3} dataKey="value">
                        {realCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {realCategoryData.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="truncate">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 ml-1">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 my-auto">
                <p className="text-xs font-bold text-slate-700 mb-1">এখনও পর্যাপ্ত কার্যক্রম নেই</p>
                <p className="text-[11px] text-slate-500 max-w-[220px]">
                  আপনি কার্যক্রম শুরু করলে এখানে আপনার Activity দেখা যাবে।
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleProfileSubmit}
        handleImageUpload={handleImageUpload}
        handleCoverUpload={handleCoverUpload}
        editLoading={editLoading}
        editSuccess={editSuccess}
        editError={editError}
      />

      {/* Member Card Modal (Matched to Red Box in Image) */}
      {isMemberCardModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsMemberCardModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-left border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IdCard size={18} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  আমার সদস্য কার্ড
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Digital Membership Card Preview */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#006a4e] via-[#008557] to-[#004d38] text-white rounded-2xl p-4.5 sm:p-5 shadow-lg border border-white/20 select-none">
                {/* Decorative background watermark */}
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute right-4 top-4 text-white/10 pointer-events-none">
                  <PartyPopper size={64} />
                </div>

                {/* Card Top Brand */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div>
                    <h4 className="text-xs font-black tracking-widest text-emerald-200 uppercase">
                      আমাদের পুঠিয়া ডিজিটাল
                    </h4>
                    <span className="text-[10px] text-white/80 font-bold block">
                      স্মার্ট নাগরিক কার্ড
                    </span>
                  </div>
                  <span className="bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 shadow-xs">
                    <Star size={10} className="fill-slate-950 text-slate-950" />
                    <span>সক্রিয় সদস্য</span>
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="flex items-center gap-3.5 relative z-10 mb-4">
                  {/* Photo / Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/60 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{avatarLetter}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-base font-black text-white truncate leading-tight">
                      {displayName}
                    </h5>
                    <p className="text-xs text-emerald-100 font-bold mt-0.5 truncate">
                      📞 {toBengaliNumber(displayPhone)}
                    </p>
                    <p className="text-xs text-emerald-100/90 font-medium truncate">
                      📍 {displayLocation}
                    </p>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] relative z-10 font-bold text-emerald-100">
                  <div>
                    <span className="text-white/70 block text-[9px]">সদস্য আইডি</span>
                    <span className="font-mono text-white font-black">
                      PID-{user?.uid ? user.uid.substring(0, 6).toUpperCase() : '2026'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/70 block text-[9px]">ইস্যু সাল</span>
                    <span className="text-white font-black">২০২৬</span>
                  </div>
                </div>
              </div>

              {/* Share & Invite Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
                <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                  🎉 <span className="font-black">"আমি যুক্ত হয়েছি"</span> — এই বার্তাটি আপনার ফেসবুকে শেয়ার করে পুঠিয়ার সকল বন্ধুদের আমন্ত্রণ জানান!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Facebook Share Button */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>ফেসবুকে শেয়ার করুন</span>
                </button>

                {/* View Full Digital ID Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMemberCardModalOpen(false);
                    navigate('/digital-id');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IdCard size={18} />
                  <span>সম্পূর্ণ ডিজিটাল আইডি কার্ড দেখুন</span>
                </button>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {cardCopied ? (
                    <>
                      <Check size={16} className="text-emerald-600" />
                      <span className="text-emerald-700 font-black">লিংক কপি করা হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>আমন্ত্রণ লিংক কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)}
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
                onClick={() => setIsLogoutModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={async () => {
                  try {
                    setIsLoggingOut(true);
                    await logout();
                    setIsLogoutModalOpen(false);
                    navigate('/');
                  } catch (err) {
                    console.error('Logout error:', err);
                    setIsLogoutModalOpen(false);
                    navigate('/');
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
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
};

export default DashboardHome;

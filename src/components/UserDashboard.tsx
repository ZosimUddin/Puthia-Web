import React, { useState, useEffect } from 'react';
import { 
    User, Settings, Bell, Activity, FileText, Briefcase, Building, 
    BookOpen, Newspaper, Award, Gift, Target, Zap, 
    Heart, Bookmark, HeartPulse, HelpCircle, AlertCircle, LogOut,
    ChevronLeft, ChevronDown, Menu, Search, Shield, MapPin, 
    ShoppingBag, PhoneCall, Stethoscope, Truck, MessageSquare, 
    Home, Headphones, LayoutGrid, CheckCircle2, UserCheck, Calendar, Trophy,
    Plus, Store, GraduationCap, Wrench, Smartphone, Share2, Sparkles, Send, Trash2, X, QrCode, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { BottomNav } from './BottomNav';
import { signOut } from 'firebase/auth';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { 
    getServiceApplicationsByUserId, 
    getUserPostsByUserId, 
    getBusinessesByUserId,
    getFavorites,
    UserPost
} from '../api';
import { Business, ServiceApplication } from '../types';

interface UserDashboardProps {
    onBack: () => void;
}

export default function UserDashboard({ onBack }: UserDashboardProps) {
    const { userProfile, updateUserProfile, addStars } = useAuth() || { userProfile: null, updateUserProfile: null, addStars: null };
    const [openMenus, setOpenMenus] = useState<string[]>(["👤 আমার অ্যাকাউন্ট"]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<'dashboard' | 'profile' | 'activities' | 'rewards' | 'info' | 'services' | 'help'>('dashboard');
    const [activeSub, setActiveSub] = useState<string>('');
    
    // Daily Check-in state
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [checkInSuccess, setCheckInSuccess] = useState(false);

    // Real Data States
    const [realApplications, setRealApplications] = useState<ServiceApplication[]>([]);
    const [realPosts, setRealPosts] = useState<UserPost[]>([]);
    const [realBusinesses, setRealBusinesses] = useState<Business[]>([]);
    const [realFavorites, setRealFavorites] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Profile form state (local edits before saving)
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [village, setVillage] = useState('');
    const [union, setUnion] = useState('বানেশ্বর');
    const [bloodGroup, setBloodGroup] = useState('O+');
    const [isBloodDonor, setIsBloodDonor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // দ্রুত কার্যক্রম Modals / Popups state
    const [activeActionModal, setActiveActionModal] = useState<'post' | 'business' | 'news' | 'education' | 'service' | 'recharge' | null>(null);
    const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

    const [dailyTasks, setDailyTasks] = useState([
        { id: 'blood', label: 'রক্তদাতা তথ্য আপডেট', completed: false },
        { id: 'news', label: 'নতুন সংবাদ পড়ুন', completed: false },
        { id: 'profile', label: 'প্রোফাইল সম্পূর্ণ করুন', completed: true },
    ]);

    const toggleTask = (id: string) => {
        setDailyTasks(prev => prev.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };
    
    // Quick Action Form Fields
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [postCategory, setPostCategory] = useState('সাধারণ');

    const [bizName, setBizName] = useState('');
    const [bizOwner, setBizOwner] = useState('');
    const [bizPhone, setBizPhone] = useState('');
    const [bizCategory, setBizCategory] = useState('মুদি দোকান');

    const [newsTitle, setNewsTitle] = useState('');
    const [newsDetail, setNewsDetail] = useState('');
    const [newsCategory, setNewsCategory] = useState('স্থানীয় সংবাদ');

    const [eduName, setEduName] = useState('');
    const [eduType, setEduType] = useState('স্কুল');
    const [eduLocation, setEduLocation] = useState('বানেশ্বর');

    const [srvName, setSrvName] = useState('');
    const [srvType, setSrvType] = useState('ডিল-সার্ভিস');
    const [srvPhone, setSrvPhone] = useState('');

    const [rechargeNum, setRechargeNum] = useState('');
    const [rechargeOperator, setRechargeOperator] = useState('Grameenphone');
    const [rechargeAmount, setRechargeAmount] = useState('২০');

    // Dynamic local lists to show the submissions immediately in "সাম্প্রতিক কার্যক্রম" or list tabs!
    const [myPostsList, setMyPostsList] = useState<Array<{title: string, content: string, date: string, category: string}>>([
        { title: "বানেশ্বর বাজারের সাপ্তাহিক পরিষ্কার পরিচ্ছন্নতা কার্যক্রম", content: "আসুন আমরা সবাই মিলে আমাদের প্রিয় বাজারটিকে পরিষ্কার রাখি।", date: "২৮ জুন, ২০২৬", category: "সমাজসেবা" }
    ]);
    const [myBizList, setMyBizList] = useState<Array<{name: string, owner: string, phone: string, category: string}>>([]);
    const [myNewsList, setMyNewsList] = useState<Array<{title: string, detail: string, category: string}>>([]);
    const [myEduList, setMyEduList] = useState<Array<{name: string, type: string, location: string}>>([]);
    const [mySrvList, setMySrvList] = useState<Array<{name: string, type: string, phone: string}>>([]);
    
    // Recent Activity Tabs
    const [recentActivityTab, setRecentActivityTab] = useState<'posts' | 'applications' | 'rewards' | 'points'>('posts');

    // New State for Dashboard Enhancements
    const [activities] = useState([
        { id: 1, text: '✅ জন্ম নিবন্ধনের আবেদন সম্পন্ন', date: '২ ঘণ্টা আগে' },
        { id: 2, text: '📢 নতুন পোস্ট প্রকাশ', date: '১ দিন আগে' },
        { id: 3, text: '❤️ রক্তদাতা হিসেবে যুক্ত হয়েছেন', date: '৩ দিন আগে' },
        { id: 4, text: '⭐ নতুন ব্যাজ পেয়েছেন: Bronze Member', date: '৪ দিন আগে' },
    ]);

    const [fabOpen, setFabOpen] = useState(false);

    // Notifications List
    const [notifications, setNotifications] = useState<Array<{id: string, text: string, date: string, read: boolean}>>([
        { id: "1", text: "স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে ডিজিটাল নাগরিক পোর্টালে যুক্ত হয়েছে।", date: "এইমাত্র", read: false },
        { id: "2", text: "বানেশ্বর ইউনিয়নের পক্ষ থেকে নতুন কৃষি বীজ বিতরণ নোটিশ প্রকাশিত হয়েছে।", date: "৩ ঘণ্টা আগে", read: false },
        { id: "3", text: "রক্তের প্রয়োজন! জরুরি ভিত্তিতে বানেশ্বর এলাকার জন্য ও-পজিটিভ (O+) রক্তদাতার অনুসন্ধান চলছে।", date: "১ দিন আগে", read: true }
    ]);

    // Default Fallbacks if no user profile exists
    const fallbackProfile: UserProfile = {
        name: "জসিম উদ্দিন",
        uid: "PUT-LLACRR",
        phone: "01712345678",
        village: "পুতুলিয়া গ্রাম",
        union: "বানেশ্বর",
        bloodGroup: "O+",
        isBloodDonor: true,
        stars: 150,
        points: 150,
        badges: ["সচেতন নাগরিক", "রক্তদাতা হিরো", "নিয়মিত ব্যবহারকারী"],
        createdAt: new Date().toISOString(),
        gender: "পুরুষ",
        photoURL: ""
    };

    const currentProfile = userProfile || fallbackProfile;

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setPhone(userProfile.phone || '');
            setVillage(userProfile.village || '');
            setUnion(userProfile.union || 'বানেশ্বর');
            setBloodGroup(userProfile.bloodGroup || 'O+');
            setIsBloodDonor(userProfile.isBloodDonor || false);
        } else {
            setName(fallbackProfile.name);
            setPhone(fallbackProfile.phone);
            setVillage(fallbackProfile.village);
            setUnion(fallbackProfile.union);
            setBloodGroup(fallbackProfile.bloodGroup);
            setIsBloodDonor(fallbackProfile.isBloodDonor);
        }
    }, [userProfile]);

    useEffect(() => {
        const fetchData = async () => {
            if (!auth.currentUser) return;
            setIsLoadingData(true);
            try {
                const [apps, posts, biz, favs] = await Promise.all([
                    getServiceApplicationsByUserId(auth.currentUser.uid),
                    getUserPostsByUserId(auth.currentUser.uid),
                    getBusinessesByUserId(auth.currentUser.uid),
                    getFavorites(auth.currentUser.uid)
                ]);
                setRealApplications(apps);
                setRealPosts(posts);
                setRealBusinesses(biz);
                setRealFavorites(favs);
            } catch (error) {
                console.error("Error fetching user dashboard data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [userProfile]);

    const checklistTasks = [
        {
            id: 'photo',
            label: 'ছবি আপলোড',
            isCompleted: !!currentProfile.photoURL,
            btnLabel: 'Complete',
            action: () => setActiveSection('profile')
        },
        {
            id: 'phone',
            label: 'মোবাইল নম্বর যুক্তকরণ',
            isCompleted: !!currentProfile.phone && currentProfile.phone.length >= 11,
            btnLabel: 'Verify Now',
            action: () => setActiveSection('profile')
        },
        {
            id: 'union',
            label: 'ইউনিয়ন নির্বাচন',
            isCompleted: !!currentProfile.union && currentProfile.union !== "তথ্য নেই" && currentProfile.union !== "",
            btnLabel: 'Complete',
            action: () => setActiveSection('profile')
        },
        {
            id: 'email',
            label: 'ইমেইল ভেরিফাই',
            isCompleted: !!auth.currentUser?.email || false,
            btnLabel: 'Verify Now',
            action: () => setActiveSection('profile')
        },
        {
            id: 'address',
            label: 'ঠিকানা সম্পূর্ণ করুন',
            isCompleted: !!currentProfile.village && currentProfile.village !== "তথ্য নেই" && currentProfile.village !== "",
            btnLabel: 'Complete',
            action: () => setActiveSection('profile')
        }
    ];

    const completedCount = checklistTasks.filter(t => t.isCompleted).length;
    const totalCount = checklistTasks.length;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    // Check localStorage if already checked-in today
    useEffect(() => {
        const checkedToday = localStorage.getItem(`daily_checkin_${new Date().toDateString()}`);
        if (checkedToday) {
            setHasCheckedIn(true);
        }
    }, []);

    // Prevent background body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    const toggleMenu = (title: string) => {
        setOpenMenus(prev => prev.includes(title) ? prev.filter(m => m !== title) : [...prev, title]);
    };

    const handleLinkClick = (section: any, sub: string = '') => {
        if (sub.includes('আমার বিজ্ঞাপন') || sub.includes('বিজ্ঞাপন')) {
            window.location.href = '/advertiser-dashboard';
            return;
        }
        setActiveSection(section);
        setActiveSub(sub);
        setIsSidebarOpen(false);
    };

    const handleBackClick = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        } else {
            onBack();
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleDailyCheckIn = async () => {
        if (hasCheckedIn) return;
        setHasCheckedIn(true);
        setCheckInSuccess(true);
        localStorage.setItem(`daily_checkin_${new Date().toDateString()}`, 'true');
        
        setTimeout(() => {
            setCheckInSuccess(false);
        }, 5000);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        if (updateUserProfile) {
            try {
                await updateUserProfile({
                    name,
                    phone,
                    village,
                    union,
                    bloodGroup,
                    isBloodDonor
                });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSaving(false);
            }
        } else {
            // Simulated update
            setTimeout(() => {
                setIsSaving(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }, 1000);
        }
    };

    const triggerActionSuccess = (msg: string) => {
        setActionSuccessMessage(msg);
        setTimeout(() => setActionSuccessMessage(null), 5000);
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postTitle || !postContent) return;
        
        const newPost = {
            title: postTitle,
            content: postContent,
            date: "এইমাত্র",
            category: postCategory
        };
        setMyPostsList(prev => [newPost, ...prev]);
        setPostTitle('');
        setPostContent('');
        setActiveActionModal(null);
        triggerActionSuccess("আপনার নতুন পোস্টটি সফলভাবে সাবমিট করা হয়েছে। অ্যাডমিন অনুমোদন করলে ৫ ইস্টার পাবেন।");
    };

    const handleAddBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bizName || !bizOwner || !bizPhone) return;

        const newBiz = {
            name: bizName,
            owner: bizOwner,
            phone: bizPhone,
            category: bizCategory
        };
        setMyBizList(prev => [newBiz, ...prev]);
        setBizName('');
        setBizOwner('');
        setBizPhone('');
        setActiveActionModal(null);
        triggerActionSuccess("আপনার ব্যবসা প্রতিষ্ঠানটি সফলভাবে সাবমিট করা হয়েছে। অ্যাডমিন অনুমোদন করলে ৫ ইস্টার পাবেন।");
    };

    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsTitle || !newsDetail) return;

        const newNews = {
            title: newsTitle,
            detail: newsDetail,
            category: newsCategory
        };
        setMyNewsList(prev => [newNews, ...prev]);
        setNewsTitle('');
        setNewsDetail('');
        setActiveActionModal(null);
        triggerActionSuccess("আপনার সংবাদটি সফলভাবে পাঠানো হয়েছে। অ্যাডমিন অনুমোদন করলে ৫ ইস্টার পাবেন।");
    };

    const handleAddEducation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eduName) return;

        const newEdu = {
            name: eduName,
            type: eduType,
            location: eduLocation
        };
        setMyEduList(prev => [newEdu, ...prev]);
        setEduName('');
        setActiveActionModal(null);
        triggerActionSuccess("শিক্ষা প্রতিষ্ঠানটি সফলভাবে সাবমিট করা হয়েছে। অ্যাডমিন অনুমোদন করলে ৫ ইস্টার পাবেন।");
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!srvName || !srvPhone) return;

        const newSrv = {
            name: srvName,
            type: srvType,
            phone: srvPhone
        };
        setMySrvList(prev => [newSrv, ...prev]);
        setSrvName('');
        setSrvPhone('');
        setActiveActionModal(null);
        triggerActionSuccess("সেবাদাতা তথ্য সফলভাবে সাবমিট করা হয়েছে। অ্যাডমিন অনুমোদন করলে ৫ ইস্টার পাবেন।");
    };

    const handleMobileRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rechargeNum || !rechargeAmount) return;

        const cost = parseInt(rechargeAmount);
        if (userPoints < cost) {
            triggerActionSuccess("দুঃখিত! এই রিচার্জটি সম্পন্ন করতে আপনার পর্যাপ্ত ইস্টার নেই।");
            return;
        }

        setActiveActionModal(null);
        triggerActionSuccess(`সফল! আপনার ${rechargeOperator} নম্বরে ${rechargeAmount} BDT রিচার্জের অনুরোধ পাঠানো হয়েছে।`);

        if (addStars) {
            try { await addStars(-cost, 'মোবাইল রিচার্জ বাবদ কর্তন'); } catch(e) {}
        }
    };

    const handleMarkNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    };

    // Level configuration
    const userPoints = currentProfile.points || 0;
    const currentLevel = Math.floor(userPoints / 100) + 1;
    const pointsForNextLevel = currentLevel * 100;
    const pointsInCurrentLevel = userPoints % 100;
    const levelProgress = Math.min((pointsInCurrentLevel / 100) * 100, 100);

    const sidebarItems = [
        { 
            title: "ড্যাশবোর্ড", 
            icon: Home, 
            section: 'dashboard',
            items: [] 
        },
        { 
            title: "আমার অ্যাকাউন্ট", 
            icon: User,
            section: 'profile',
            items: ["আমার প্রোফাইল", "প্রোফাইল সম্পাদনা", "সেটিংস", "নোটিফিকেশন"] 
        },
        { 
            title: "আমার কার্যক্রম", 
            icon: FileText,
            section: 'activities',
            items: ["আমার আবেদন", "বুকমার্ক", "ফেভারিট"] 
        },
        { 
            title: "রিওয়ার্ড ও উপহার", 
            icon: Gift,
            section: 'rewards',
            items: ["আমার ইস্টার", "অর্জন", "রিওয়ার্ড স্টোর"] 
        },
        { 
            title: "আমার তথ্য", 
            icon: Building,
            section: 'info',
            items: ["আমার ব্যবসা", "আমার বিজ্ঞাপন ও প্রচার 📢", "শিক্ষা প্রতিষ্ঠান"] 
        },
        { 
            title: "নাগরিক সেবা", 
            icon: Heart,
            section: 'services',
            items: ["রক্তদাতা সেবা", "জরুরি হেল্পলাইন", "কৃষি ও চাষাবাদ"] 
        },
        { 
            title: "সাহায্য", 
            icon: Headphones,
            section: 'help',
            items: ["অভিযোগ ও পরামর্শ", "FAQ ও সাহায্য কেন্দ্র"] 
        }
    ];

    // Dynamic Greetings
    const getGreeting = () => {
        const hr = new Date().getHours();
        if (hr >= 5 && hr < 12) return "শুভ সকাল ☀️";
        if (hr >= 12 && hr < 17) return "শুভ দুপুর 🌤️";
        if (hr >= 17 && hr < 19) return "শুভ বিকাল 🌅";
        return "শুভ সন্ধ্যা 🌙";
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
            {/* Overlay for mobile - Backdrop to close sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm z-[9998] md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <div className="flex relative">
                {/* Sidebar - Sleek Light Emerald Menu */}
                <aside className={`fixed inset-y-0 left-0 z-[9999] w-[85%] max-w-[320px] md:w-[280px] h-screen bg-white p-6 border-r border-gray-100 overflow-y-auto transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col justify-between shadow-xl shadow-emerald-900/5`}>
                    <div>
                        {/* Upper Brand / User Head */}
                        <div className="mb-8 flex items-center justify-between">
                            <button onClick={handleBackClick} className="p-2.5 hover:bg-emerald-50 rounded-2xl text-emerald-800 transition-all border border-transparent hover:border-emerald-100">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Citizen Dashboard
                            </span>
                        </div>

                        {/* Profile Card Header */}
                        <div className="p-5 bg-emerald-50/50 rounded-3xl mb-8 border border-emerald-100 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white flex items-center justify-center text-2xl font-black text-[#006a4e] shadow-md shrink-0">
                                    {currentProfile.name ? currentProfile.name.charAt(0) : 'U'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-emerald-950 truncate text-base">{currentProfile.name}</h3>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">ID: {currentProfile.uid ? currentProfile.uid.substring(0, 10).toUpperCase() : 'N/A'}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="md:hidden p-2 hover:bg-white rounded-xl text-emerald-800 transition-all border border-emerald-100 bg-white shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Interactive Menu List */}
                        <div className="space-y-2">
                            {sidebarItems.map((menu) => {
                                const isSelected = activeSection === menu.section;
                                return (
                                    <div key={menu.title} className="rounded-2xl overflow-hidden">
                                        <button 
                                            onClick={() => {
                                                if (menu.items.length === 0) {
                                                    handleLinkClick(menu.section);
                                                } else {
                                                    toggleMenu(menu.title);
                                                }
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                                isSelected && menu.items.length === 0
                                                    ? 'bg-[#006a4e] text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                                                    : 'hover:bg-emerald-50 text-slate-600 hover:text-[#006a4e] font-bold'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <menu.icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-emerald-700'}`} strokeWidth={2.5} />
                                                <span className="text-base font-black">{menu.title}</span>
                                            </div>
                                            {menu.items.length > 0 && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${openMenus.includes(menu.title) ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                        
                                        {/* Dropdowns */}
                                        {openMenus.includes(menu.title) && menu.items.length > 0 && (
                                            <div className="pl-12 space-y-2 mt-2 mb-4 border-l-2 border-emerald-100 ml-6">
                                                {menu.items.map(item => {
                                                    const isSubSelected = activeSub === item;
                                                    return (
                                                        <button 
                                                            key={item} 
                                                            onClick={() => handleLinkClick(menu.section, item)} 
                                                            className={`w-full text-left p-2.5 text-sm rounded-xl transition-all block ${
                                                                isSubSelected 
                                                                    ? 'text-[#006a4e] font-black bg-emerald-50 border-l-4 border-[#006a4e]' 
                                                                    : 'text-slate-500 hover:text-emerald-800 hover:bg-emerald-50/50'
                                                            }`}
                                                        >
                                                            {item}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>লগ আউট করুন</span>
                        </button>
                    </div>
                </aside>

                {/* Dashboard Main View Area */}
                <main className="flex-1 min-h-screen p-4 sm:p-8 md:ml-[280px]">
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between mb-10 md:justify-end gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-[#006a4e] hover:bg-emerald-50 transition-all shadow-sm">
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <div className="hidden md:flex items-center gap-4">
                            <div className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl flex items-center gap-2.5 shadow-sm">
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-black text-slate-700">লেভেল: {currentLevel}</span>
                            </div>
                            <div className="relative px-5 py-2.5 bg-white border border-gray-100 rounded-2xl flex items-center gap-2.5 shadow-sm group cursor-pointer hover:border-emerald-200 transition-all">
                                <Bell className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">নোটিফিকেশন</span>
                                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">৩</span>
                            </div>
                            <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5 shadow-sm">
                                <Gift className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-black text-emerald-700">{userPoints} ইস্টার</span>
                            </div>
                        </div>
                    </div>

                    {/* Section Router Container */}
                    <div className="max-w-5xl mx-auto pb-24">
                        
                        {/* ================= SECTION: DASHBOARD HOME ================= */}
                        {activeSection === 'dashboard' && (
                            <div className="space-y-8">
                                {/* Success toast overlay if action completes */}
                                {actionSuccessMessage && (
                                    <div className="fixed top-5 right-5 z-[10000] max-w-sm bg-emerald-950/95 border-2 border-emerald-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-down">
                                        <div className="p-2 bg-emerald-500 text-emerald-950 rounded-lg">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-400 font-bold">সফল বার্তা</p>
                                            <p className="text-sm font-semibold text-gray-200">{actionSuccessMessage}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Action Modals */}
                                {activeActionModal && (
                                    <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                        <div className="bg-[#1c1c1e] w-full max-w-lg rounded-3xl border border-gray-800 overflow-hidden shadow-2xl animate-scale-up">
                                            <div className="p-6 bg-gradient-to-r from-emerald-950/80 to-[#1c1c1e] border-b border-gray-800 flex items-center justify-between">
                                                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                                                    {activeActionModal === 'post' && <><Plus className="text-emerald-400 w-5 h-5" /> নতুন পোস্ট তৈরি করুন</>}
                                                    {activeActionModal === 'business' && <><Store className="text-emerald-400 w-5 h-5" /> ব্যবসা যোগ করুন</>}
                                                    {activeActionModal === 'news' && <><Newspaper className="text-emerald-400 w-5 h-5" /> সংবাদ বা খবর দিন</>}
                                                    {activeActionModal === 'education' && <><GraduationCap className="text-emerald-400 w-5 h-5" /> শিক্ষা প্রতিষ্ঠান যোগ করুন</>}
                                                    {activeActionModal === 'service' && <><Wrench className="text-emerald-400 w-5 h-5" /> সেবাদাতা তথ্য যোগ করুন</>}
                                                    {activeActionModal === 'recharge' && <><Smartphone className="text-emerald-400 w-5 h-5" /> মোবাইল রিচার্জ করুন</>}
                                                </h3>
                                                <button onClick={() => setActiveActionModal(null)} className="text-gray-400 hover:text-white font-bold p-1 hover:bg-gray-800 rounded-lg text-sm">বন্ধ করুন</button>
                                            </div>

                                            {/* Action Modal Forms */}
                                            <div className="p-6">
                                                {activeActionModal === 'post' && (
                                                    <form onSubmit={handleAddPost} className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">পোস্টের ক্যাটাগরি</label>
                                                            <select value={postCategory || ""} onChange={e => setPostCategory(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="সাধারণ">সাধারণ</option>
                                                                <option value="অভিযোগ">অভিযোগ</option>
                                                                <option value="সমাজসেবা">সমাজসেবা</option>
                                                                <option value="জরুরি নোটিশ">জরুরি নোটিশ</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">পোস্টের শিরোনাম</label>
                                                            <input type="text" value={postTitle || ""} onChange={e => setPostTitle(e.target.value)} required placeholder="যেমন: আমাদের পাড়ার পানির সমস্যা সমাধান" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">বিস্তারিত বর্ণনা</label>
                                                            <textarea rows={4} value={postContent || ""} onChange={e => setPostContent(e.target.value)} required placeholder="বিস্তারিত তথ্য এখানে লিখুন..." className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="pt-2 flex justify-between items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                                                            <span className="text-xs text-emerald-400 font-bold">🎁 পুরস্কার বোনাস:</span>
                                                            <span className="text-xs text-white font-black bg-emerald-600 px-2.5 py-1 rounded-full">+৫ ইস্টার</span>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" /> পোস্ট সাবমিট করুন
                                                        </button>
                                                    </form>
                                                )}

                                                {activeActionModal === 'business' && (
                                                    <form onSubmit={handleAddBusiness} className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">ব্যবসার ধরন</label>
                                                            <select value={bizCategory || ""} onChange={e => setBizCategory(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="মুদি দোকান">মুদি দোকান</option>
                                                                <option value="ফার্মেসী">ফার্মেসী</option>
                                                                <option value="খাবারের হোটেল">খাবারের হোটেল</option>
                                                                <option value="মোবাইল ও ইলেকট্রনিক্স">মোবাইল ও ইলেকট্রনিক্স</option>
                                                                <option value="অন্যান্য ব্যবসা">অন্যান্য ব্যবসা</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">ব্যবসা প্রতিষ্ঠানের নাম</label>
                                                            <input type="text" value={bizName || ""} onChange={e => setBizName(e.target.value)} required placeholder="যেমন: মা ফার্মেসী" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">মালিকের নাম</label>
                                                            <input type="text" value={bizOwner || ""} onChange={e => setBizOwner(e.target.value)} required placeholder="যেমন: মোঃ আব্দুল করিম" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">যোগাযোগ মোবাইল নম্বর</label>
                                                            <input type="tel" value={bizPhone || ""} onChange={e => setBizPhone(e.target.value)} required placeholder="যেমন: 017xxxxxxxx" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="pt-2 flex justify-between items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                                                            <span className="text-xs text-emerald-400 font-bold">🎁 অনুমোদনের পর ইস্টার:</span>
                                                            <span className="text-xs text-white font-black bg-emerald-600 px-2.5 py-1 rounded-full">+৫ ইস্টার</span>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" /> ব্যবসা যোগ করুন
                                                        </button>
                                                    </form>
                                                )}

                                                {activeActionModal === 'news' && (
                                                    <form onSubmit={handleAddNews} className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">খবরের ধরন</label>
                                                            <select value={newsCategory || ""} onChange={e => setNewsCategory(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="স্থানীয় সংবাদ">স্থানীয় সংবাদ</option>
                                                                <option value="খেলাধুলা">খেলাধুলা</option>
                                                                <option value="শিক্ষা ও সংস্কৃতি">শিক্ষা ও সংস্কৃতি</option>
                                                                <option value="উন্নয়ন কর্মকাণ্ড">উন্নয়ন কর্মকাণ্ড</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">সংবাদের শিরোনাম</label>
                                                            <input type="text" value={newsTitle || ""} onChange={e => setNewsTitle(e.target.value)} required placeholder="যেমন: বানেশ্বর বাজারে সিসিটিভি ক্যামেরা স্থাপন" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">সংবাদের বিবরণ</label>
                                                            <textarea rows={4} value={newsDetail || ""} onChange={e => setNewsDetail(e.target.value)} required placeholder="আজ বানেশ্বর বাজার কমিটির আয়োজনে বাজারের প্রধান সড়কগুলোতে..." className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="pt-2 flex justify-between items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                                                            <span className="text-xs text-emerald-400 font-bold">🎁 অনুমোদনের পর ইস্টার:</span>
                                                            <span className="text-xs text-white font-black bg-emerald-600 px-2.5 py-1 rounded-full">+৫ ইস্টার</span>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" /> খবর জমা দিন
                                                        </button>
                                                    </form>
                                                )}

                                                {activeActionModal === 'education' && (
                                                    <form onSubmit={handleAddEducation} className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">প্রতিষ্ঠানের ধরন</label>
                                                            <select value={eduType || ""} onChange={e => setEduType(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="স্কুল">স্কুল</option>
                                                                <option value="কলেজ">কলেজ</option>
                                                                <option value="মাদ্রাসা">মাদ্রাসা</option>
                                                                <option value="কোচিং সেন্টার">কোচিং সেন্টার</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">শিক্ষা প্রতিষ্ঠানের নাম</label>
                                                            <input type="text" value={eduName || ""} onChange={e => setEduName(e.target.value)} required placeholder="যেমন: বানেশ্বর মডেল পাইলট উচ্চ বিদ্যালয়" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">অবস্থান / ইউনিয়ন</label>
                                                            <select value={eduLocation || ""} onChange={e => setEduLocation(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="বানেশ্বর">বানেশ্বর</option>
                                                                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                                                                <option value="ভালুকগাছী">ভালুকগাছী</option>
                                                                <option value="জিউপাড়া">জিউপাড়া</option>
                                                                <option value="পুঠিয়া">পুঠিয়া</option>
                                                                <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                                                            </select>
                                                        </div>
                                                        <div className="pt-2 flex justify-between items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                                                            <span className="text-xs text-emerald-400 font-bold">🎁 অনুমোদনের পর ইস্টার:</span>
                                                            <span className="text-xs text-white font-black bg-emerald-600 px-2.5 py-1 rounded-full">+৫ ইস্টার</span>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" /> প্রতিষ্ঠান যোগ করুন
                                                        </button>
                                                    </form>
                                                )}

                                                {activeActionModal === 'service' && (
                                                    <form onSubmit={handleAddService} className="space-y-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">সেবার ধরন / পেশা</label>
                                                            <select value={srvType || ""} onChange={e => setSrvType(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="ডাক্তার">ডাক্তার</option>
                                                                <option value="অ্যাম্বুলেন্স">অ্যাম্বুলেন্স</option>
                                                                <option value="বৈদ্যুতিক মিস্ত্রী">বৈদ্যুতিক মিস্ত্রী</option>
                                                                <option value="কৃষি পরামর্শক">কৃষি পরামর্শক</option>
                                                                <option value="অন্যান্য সেবাদাতা">অন্যান্য সেবাদাতা</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">সেবাদাতার নাম</label>
                                                            <input type="text" value={srvName || ""} onChange={e => setSrvName(e.target.value)} required placeholder="যেমন: ডাঃ রফিকুল ইসলাম" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">যোগাযোগের নম্বর</label>
                                                            <input type="tel" value={srvPhone || ""} onChange={e => setSrvPhone(e.target.value)} required placeholder="যেমন: 018xxxxxxxx" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="pt-2 flex justify-between items-center bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                                                            <span className="text-xs text-emerald-400 font-bold">🎁 পুরস্কার বোনাস:</span>
                                                            <span className="text-xs text-white font-black bg-emerald-600 px-2.5 py-1 rounded-full">+৫ ইস্টার</span>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Send className="w-4 h-4" /> সেবাদাতা যোগ করুন
                                                        </button>
                                                    </form>
                                                )}

                                                {activeActionModal === 'recharge' && (
                                                    <form onSubmit={handleMobileRecharge} className="space-y-4">
                                                        <div className="bg-[#111] p-4 rounded-2xl border border-gray-850 mb-2">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="text-gray-400">আপনার উপলব্ধ ব্যালেন্স:</span>
                                                                <span className="text-emerald-400 font-extrabold">{userPoints} ইস্টার</span>
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 mt-1">ইস্টার ব্যবহার করে আপনি সরাসরি মোবাইল রিচার্জ ক্লেইম করতে পারবেন।</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">মোবাইল অপারেটর</label>
                                                            <select value={rechargeOperator || ""} onChange={e => setRechargeOperator(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="Grameenphone">Grameenphone</option>
                                                                <option value="Robi">Robi</option>
                                                                <option value="Banglalink">Banglalink</option>
                                                                <option value="Airtel">Airtel</option>
                                                                <option value="Teletalk">Teletalk</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">মোবাইল নম্বর</label>
                                                            <input type="tel" value={rechargeNum || ""} onChange={e => setRechargeNum(e.target.value)} required placeholder="01XXXXXXXXX" className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-gray-400 font-bold">রিচার্জের পরিমাণ (ইস্টার)</label>
                                                            <select value={rechargeAmount || ""} onChange={e => setRechargeAmount(e.target.value)} className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                                                                <option value="১০০">১০০ ইস্টার (২০ টাকা রিচার্জ)</option>
                                                                <option value="৫০০">৫০০ ইস্টার (মেডেল আনলক)</option>
                                                            </select>
                                                        </div>
                                                        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2">
                                                            <Smartphone className="w-4 h-4" /> রিচার্জ সম্পন্ন করুন
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Profile Overview Card */}
                                <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-gray-100 shadow-xl shadow-emerald-900/5 mb-8 relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative flex items-center gap-6">
                                        <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-emerald-50 border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-300">
                                            <img src={userProfile?.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Josim'} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-2xl font-black text-emerald-950 truncate">{userProfile?.name || 'জসিম উদ্দিন'}</h3>
                                                <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                                                    <CheckCircle2 size={12} strokeWidth={4} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                                <MapPin size={14} className="text-emerald-600" />
                                                <span className="truncate">{userProfile?.union || 'বানেশ্বর ইউনিয়ন'}, {userProfile?.village || 'পুত্থিয়া'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Verified Citizen</span>
                                                <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Level {currentLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contribution Reward System Card */}
                                <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white p-6 sm:p-8 rounded-[40px] border border-amber-200/60 shadow-xl shadow-amber-900/5 mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">কন্ট্রিবিউশন রিওয়ার্ড সিস্টেম</h3>
                                                <p className="text-xs font-bold text-amber-700">তথ্য দিন, স্টার জিতুন ও আকর্ষণীয় পুরস্কার পান!</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200 shadow-2xs">
                                            🌟 লাইভ রিওয়ার্ড
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">প্রতি সঠিক তথ্য</div>
                                            <div className="text-base font-black text-emerald-700 flex items-center gap-1">
                                                <span>+৫ স্টার</span>
                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">অনুমোদনের পর</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">আপনার বর্তমান স্টার</div>
                                            <div className="text-base font-black text-amber-700 flex items-center gap-1">
                                                <span>{userPoints} স্টার</span>
                                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">সঞ্চয়</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">মেম্বারশিপ লেভেল</div>
                                            <div className="text-base font-black text-blue-700 flex items-center gap-1">
                                                <span>Level {currentLevel} (Silver)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-amber-200/40 relative z-10">
                                        <p className="text-xs text-slate-600 font-medium">
                                            💡 হাসপাতালে, ব্যবসা, শিক্ষা বা জরুরি সেবা তথ্য যুক্ত করে আপনার এলাকার সেবা ডিজিটাল করুন।
                                        </p>
                                        <button 
                                            onClick={() => setActiveActionModal('post')}
                                            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                                        >
                                            <Sparkles size={14} />
                                            <span>নতুন তথ্য যোগ করুন (+৫ স্টার)</span>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* My Quick Services Grid */}
                                <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-emerald-900/5 mb-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-emerald-950 flex items-center gap-3">
                                            <LayoutGrid className="text-emerald-600" size={24} />
                                            আমার নাগরিক সেবা
                                        </h2>
                                        <button className="text-xs font-black text-emerald-700 uppercase tracking-widest hover:underline">সকল সেবা</button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                        {[
                                            { label: 'আমার আবেদন', icon: FileText, color: 'bg-emerald-50 text-emerald-600', action: () => handleLinkClick('activities', 'আমার আবেদন') },
                                            { label: 'আমার অভিযোগ', icon: AlertCircle, color: 'bg-rose-50 text-rose-600', action: () => handleLinkClick('help', 'অভিযোগ ও পরামর্শ') },
                                            { label: 'আমার বুকমার্ক', icon: Bookmark, color: 'bg-amber-50 text-amber-600', action: () => handleLinkClick('activities', 'বুকমার্ক') },
                                            { label: 'আমার পোস্ট', icon: Newspaper, color: 'bg-blue-50 text-blue-600', action: () => handleLinkClick('info', 'আমার বিজ্ঞাপন') },
                                            { label: 'আমার ব্যবসা', icon: Store, color: 'bg-indigo-50 text-indigo-600', action: () => handleLinkClick('info', 'আমার ব্যবসা') },
                                            { label: 'ডিজিটাল আইডি', icon: QrCode, color: 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20', action: () => setActiveSection('profile') },
                                        ].map((service) => (
                                            <button 
                                                key={service.label} 
                                                onClick={service.action}
                                                className={`flex flex-col items-center justify-center p-6 ${service.color.includes('bg-emerald-600') ? service.color : 'bg-white hover:bg-emerald-50/50'} rounded-[24px] border ${service.color.includes('bg-emerald-600') ? 'border-transparent' : 'border-gray-50'} shadow-sm hover:shadow-md transition-all gap-3 active:scale-95 group`}
                                            >
                                                <div className={`p-3 rounded-2xl ${service.color.includes('bg-emerald-600') ? 'bg-white/20' : 'bg-white shadow-inner'} group-hover:scale-110 transition-transform`}>
                                                    <service.icon className={`w-6 h-6 ${service.color.includes('bg-emerald-600') ? 'text-white' : ''}`} />
                                                </div>
                                                <span className={`text-xs font-black ${service.color.includes('bg-emerald-600') ? 'text-white' : 'text-slate-700'}`}>{service.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Contribution Reward System Card */}
                                <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-white p-6 sm:p-8 rounded-[40px] border border-amber-200/60 shadow-xl shadow-amber-900/5 mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900">কন্ট্রিবিউশন রিওয়ার্ড সিস্টেম</h3>
                                                <p className="text-xs font-bold text-amber-700">তথ্য দিন, স্টার জিতুন ও আকর্ষণীয় পুরস্কার পান!</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full border border-amber-200 shadow-2xs">
                                            🌟 লাইভ রিওয়ার্ড
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 relative z-10">
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">প্রতি সঠিক তথ্য</div>
                                            <div className="text-base font-black text-emerald-700 flex items-center gap-1">
                                                <span>+৫ স্টার</span>
                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">অনুমোদনের পর</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">আপনার বর্তমান স্টার</div>
                                            <div className="text-base font-black text-amber-700 flex items-center gap-1">
                                                <span>{userPoints} স্টার</span>
                                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">সঞ্চয়</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
                                            <div className="text-xs text-slate-500 font-bold">মেম্বারশিপ লেভেল</div>
                                            <div className="text-base font-black text-blue-700 flex items-center gap-1">
                                                <span>Level {currentLevel} (Silver)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-amber-200/40 relative z-10">
                                        <p className="text-xs text-slate-600 font-medium">
                                            💡 হাসপাতালে, ব্যবসা, শিক্ষা বা জরুরি সেবা তথ্য যুক্ত করে আপনার এলাকার সেবা ডিজিটাল করুন।
                                        </p>
                                        <button 
                                            onClick={() => setActiveActionModal('post')}
                                            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                                        >
                                            <Sparkles size={14} />
                                            <span>নতুন তথ্য যোগ করুন (+৫ স্টার)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 1. Premium Status Card */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative overflow-hidden bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-emerald-900/5 mb-10 group"
                                >
                                    <div className="h-48 bg-[#006a4e] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#00a86b_0%,transparent_60%)] opacity-40"></div>
                                        <div className="absolute top-6 left-8 right-8 flex items-center justify-between">
                                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Citizen Rank: Platinum</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                                    <Activity size={20} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-emerald-200 text-xs font-black uppercase tracking-[0.2em] mb-1">Total Stars</p>
                                                    <h4 className="text-4xl font-black text-white flex items-baseline gap-2">
                                                        {userPoints}
                                                        <span className="text-sm font-bold text-emerald-300">STARS</span>
                                                    </h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-1">Next Level</p>
                                                    <p className="text-white font-black text-sm">Level {currentLevel + 1}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${levelProgress}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 -mt-16 relative">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div 
                                                        onClick={() => setActiveSection('profile')}
                                                        title="প্রোফাইল দেখুন"
                                                        className="w-16 h-16 rounded-full border-[3.5px] border-[#D4AF37] hover:border-emerald-500 transition-all cursor-pointer overflow-hidden shadow-lg shadow-amber-500/15 hover:shadow-emerald-500/20 duration-300 relative group"
                                                    >
                                                        <img src={userProfile.photoURL || '/placeholder-avatar.png'} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                                                    </div>
                                                    {/* Verified Badge underneath */}
                                                    <div className="mt-1.5 bg-emerald-500/90 text-neutral-950 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm border border-emerald-400/30 select-none animate-pulse">
                                                        <span>Verified</span>
                                                        <span>✔️</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <h2 className="text-xl font-bold text-white leading-tight">{getGreeting().split(' ')[0]}, {userProfile.name}</h2>
                                                    <p className="text-emerald-400 font-medium text-sm mt-1">📍 {userProfile.union || 'বানেশ্বর ইউনিয়ন'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="flex flex-col items-end">
                                                    <span className="bg-amber-500/15 text-amber-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/20 shadow-sm select-none">
                                                      🥈 Silver Member
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold font-mono mt-1">Level 2 • 1450 XP</span>
                                                </div>
                                                <button className="relative p-2 bg-[#111112]/50 rounded-full border border-gray-800 hover:bg-gray-800 transition-all shrink-0">
                                                    <Bell className="w-4.5 h-4.5 text-emerald-400" />
                                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full select-none animate-pulse">৩</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Statistics Grid */}
                                        <div className="p-8 grid grid-cols-2 gap-6">
                                            <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                                                        <Zap size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Active Status</span>
                                                </div>
                                                <p className="text-lg font-black text-emerald-950">Excellent</p>
                                                <p className="text-[10px] font-bold text-emerald-600">Last 30 days activity</p>
                                            </div>
                                            <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600">
                                                        <Trophy size={18} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Total Badges</span>
                                                </div>
                                                <p className="text-lg font-black text-amber-950">{currentProfile.badges?.length || 0}</p>
                                                <p className="text-[10px] font-bold text-amber-600">Achievements earned</p>
                                            </div>
                                        </div>
                                    </div>

                                {/* Profile Completion Card */}
                                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-emerald-900/5 mb-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-xl font-black text-emerald-950 mb-1">প্রোফাইল আপডেট</h2>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">আপনার নাগরিক তথ্য সম্পূর্ণ করুন</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center border border-emerald-100">
                                            <span className="text-lg font-black text-emerald-700 leading-none">{completionPercentage}%</span>
                                            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter mt-1">DONE</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${completionPercentage}%` }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-[#006a4e] rounded-full"
                                            />
                                        </div>

                                             {/* Profile Completion Checklist */}
                                             <div className="pt-2 pb-1 space-y-2 text-xs">
                                                 <p className="font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">📋 প্রোফাইল সম্পন্ন করার চেকলিস্ট</p>
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                                                     {checklistTasks.map((task) => (
                                                         <div 
                                                             key={task.id}
                                                             className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all ${
                                                                 task.isCompleted 
                                                                     ? 'bg-emerald-500/5 border-emerald-500/10 text-gray-200' 
                                                                     : 'bg-neutral-900/40 border-gray-800/40 text-gray-400'
                                                             }`}
                                                         >
                                                             <div className="flex items-center gap-2">
                                                                 {task.isCompleted ? (
                                                                     <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] select-none shrink-0">
                                                                         ✔️
                                                                     </span>
                                                                 ) : (
                                                                     <span className="w-5 h-5 rounded-full bg-neutral-950/40 border border-gray-800 flex items-center justify-center font-bold text-[9px] text-gray-500 select-none shrink-0">
                                                                         
                                                                     </span>
                                                                 )}
                                                                 <span className={task.isCompleted ? 'text-gray-200 font-medium' : 'text-gray-400'}>
                                                                     {task.label}
                                                                 </span>
                                                             </div>
                                                             {!task.isCompleted && (
                                                                 <motion.button 
                                                                     whileHover={{ scale: 1.05 }}
                                                                     whileTap={{ scale: 0.95 }}
                                                                     onClick={task.action}
                                                                     className="px-2 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-emerald-950 to-neutral-900 hover:from-emerald-600 hover:to-emerald-500 text-emerald-400 hover:text-neutral-950 border border-emerald-500/20 hover:border-transparent rounded-lg transition-all duration-300 cursor-pointer shrink-0 shadow-sm"
                                                                 >
                                                                     {task.id === 'email' || task.id === 'phone' ? 'Verify Now' : 'Complete'}
                                                                 </motion.button>
                                                             )}
                                                         </div>
                                                     ))}
                                                 </div>
                                            </div>

                                            {/* 100% Complete Banner */}
                                            {completionPercentage === 100 && (
                                                <motion.div 
                                                  initial={{ opacity: 0, y: 10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center shadow-lg shadow-emerald-950/20 mt-2"
                                                >
                                                    <p className="text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5">
                                                        <span>🎉</span> অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পূর্ণ।
                                                    </p>
                                                </motion.div>
                                            )}

                                            <motion.button 
                                              whileHover={{ scale: 1.02 }}
                                              whileTap={{ scale: 0.98 }}
                                              onClick={() => setActiveSection('profile')}
                                              className="w-full mt-2 bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 text-center flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/10"
                                            >
                                              {completionPercentage === 100 ? 'প্রোফাইল দেখুন 👤' : 'Complete Now'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    {[
                                        { label: 'নতুন পোস্ট', icon: Plus, action: 'post' },
                                        { label: 'আবেদন', icon: FileText, action: 'service' },
                                        { label: 'রক্তদান', icon: Heart, action: 'service' },
                                        { label: 'জরুরি কল', icon: PhoneCall, action: 'service' },
                                    ].map(act => (
                                        <button key={act.label} onClick={() => setActiveActionModal(act.action as any)} className="flex flex-col items-center gap-2 group">
                                            <div className="w-14 h-14 rounded-full bg-[#1c1c1e] border border-gray-800 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md group-hover:shadow-emerald-900/20">
                                                <act.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">{act.label}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Citizen Score & QR Citizen ID & Daily Tasks */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Left Side: Citizen Score & QR ID Card */}
                                    <div className="space-y-6">
                                        {/* Citizen Score Widget */}
                                        <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Citizen Score</h3>
                                                    <p className="text-xs text-emerald-400 font-semibold">নাগরিক স্কোর</p>
                                                </div>
                                                <span className="bg-amber-500/10 text-emerald-500 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/20">
                                                    ★★★★☆ 82/100
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="text-3xl font-black text-white font-mono tracking-tight">82<span className="text-gray-500 text-lg">/100</span></div>
                                                <div className="flex gap-0.5 text-emerald-500 text-lg">
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span>★</span>
                                                    <span className="text-gray-600">★</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-xs text-gray-400 leading-relaxed bg-[#2a2a2a]/50 p-3 rounded-xl border border-gray-800/80">
                                                এটি ব্যবহারকারীর অবদানের ওপর ভিত্তি করে পরিবর্তন হবে।
                                            </p>
                                        </div>

                                        {/* QR Citizen ID Card Preview */}
                                        <div 
                                            onClick={() => {
                                                // Trigger digital id card subview if available
                                                setActiveSection('info' as any);
                                            }}
                                            className="bg-gradient-to-br from-emerald-950 via-[#162A1D] to-neutral-900 p-6 rounded-3xl border border-emerald-800/40 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg group relative overflow-hidden flex flex-col justify-between"
                                        >
                                            <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">QR Citizen ID</h3>
                                                    <p className="text-[10px] text-gray-400">ডিজিটাল নাগরিক পরিচয়পত্র</p>
                                                </div>
                                                <QrCode className="w-8 h-8 text-emerald-400 group-hover:rotate-12 transition-transform" />
                                            </div>

                                            <div className="bg-[#111112]/60 p-3.5 rounded-2xl border border-emerald-900/40 flex items-center gap-3.5 mb-4">
                                                <div className="w-10 h-10 bg-emerald-950/80 rounded-xl border border-emerald-500/20 flex items-center justify-center font-mono text-emerald-400 text-xs font-bold">
                                                    <QrCode className="w-6 h-6 animate-pulse" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{userProfile?.name || "জসিম উদ্দিন"}</p>
                                                    <p className="text-[9px] text-emerald-400 font-mono tracking-wider">PUT-8745 • ভেরিফাইড নাগরিক</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                            </div>

                                            <p className="text-[10px] text-gray-400 text-center font-semibold">
                                                প্রতিটি ইউজারের একটি QR Card থাকবে, যেটি স্ক্যান করে তার পাবলিক প্রোফাইল দেখা যাবে।
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Side: Daily Task */}
                                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-lg flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-white flex items-center gap-2 text-base">
                                                    <span>🎯</span> আজকের কাজ (Daily Task)
                                                </h3>
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/15">
                                                    {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} সম্পন্ন
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {dailyTasks.map((task) => (
                                                    <div 
                                                        key={task.id}
                                                        onClick={() => toggleTask(task.id)}
                                                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                                            task.completed 
                                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-300' 
                                                                : 'bg-[#262626] border-gray-800 text-gray-400 hover:border-gray-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex items-center justify-center w-5 h-5 rounded border transition-colors border-gray-600">
                                                                {task.completed ? (
                                                                    <div className="absolute inset-0 bg-emerald-500 rounded flex items-center justify-center text-neutral-950 font-black text-xs">
                                                                        ✓
                                                                    </div>
                                                                ) : (
                                                                    <div className="absolute inset-0 bg-transparent rounded"></div>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                                                {task.label}
                                                            </span>
                                                        </div>
                                                        {task.completed && (
                                                            <span className="text-[10px] text-emerald-500 font-bold">☑</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-gray-850 flex justify-between items-center text-[10px] text-gray-500">
                                            <span>প্রতিদিন রাত ১২ টায় নতুন কাজ যোগ হবে।</span>
                                            <span className="text-emerald-500/80 hover:underline">রিলোড করুন</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievement System Section */}
                                <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 shadow-lg mb-8">
                                    <div className="flex justify-between items-center mb-5">
                                        <div>
                                            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
                                                <span>🏆</span> অ্যাচিভমেন্ট সিস্টেম (Achievement System)
                                            </h3>
                                            <p className="text-[10px] text-gray-400 mt-0.5">আপনার অর্জিত ব্যাজ এবং পরবর্তী টার্গেট</p>
                                        </div>
                                        <span className="text-xs bg-amber-500/10 text-amber-500 font-bold px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                                            🥈 Silver Member
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 mb-6">
                                        {[
                                            { level: 'Bronze', emoji: '🥉', points: 0, label: 'Bronze' },
                                            { level: 'Silver', emoji: '🥈', points: 1000, label: 'Silver' },
                                            { level: 'Gold', emoji: '🥇', points: 5000, label: 'Gold' },
                                            { level: 'Platinum', emoji: '💎', points: 10000, label: 'Platinum' },
                                            { level: 'Ambassador', emoji: '👑', points: 25000, label: 'Ambassador' },
                                        ].map((ach) => {
                                            const isUnlocked = 1450 >= ach.points;
                                            const isActive = ach.level === 'Silver'; // Currently active level
                                            
                                            return (
                                                <div 
                                                    key={ach.level} 
                                                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                                                        isActive 
                                                            ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/5 scale-105' 
                                                            : isUnlocked 
                                                                ? 'bg-emerald-500/5 border-emerald-500/15' 
                                                                : 'bg-neutral-900/40 border-gray-850 opacity-40'
                                                    }`}
                                                >
                                                    <span className="text-2xl mb-1 filter drop-shadow-md">{ach.emoji}</span>
                                                    <span className={`text-[9px] font-black ${isActive ? 'text-emerald-500' : 'text-white'}`}>{ach.label}</span>
                                                    <span className="text-[8px] font-mono text-gray-500 mt-0.5">{ach.points > 0 ? `${ach.points}+` : '০'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress to next level (Gold) */}
                                    <div className="space-y-2 bg-[#2a2a2a]/40 p-4 rounded-xl border border-gray-800">
                                        <div className="flex justify-between text-xs font-bold text-gray-300">
                                            <span className="flex items-center gap-1">🥈 সিলভার মেম্বার <span className="text-gray-500">•</span> <span className="text-emerald-400">১,৪৫০ ইস্টার</span></span>
                                            <span className="text-amber-500">🥇 গোল্ড (৫,০০০ ইস্টার)</span>
                                        </div>
                                        <div className="w-full bg-neutral-850 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${Math.min(100, (1450 / 5000) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                                            <span>অর্জিত: ২৯%</span>
                                            <span>আর মাত্র ৩,৫৫০ ইস্টার প্রয়োজন</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity Timeline & Recent Notifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Activity Timeline */}
                                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800">
                                        <h3 className="font-bold text-white mb-4">সাম্প্রতিক কার্যক্রম</h3>
                                        <div className="space-y-4">
                                            {activities.map(a => (
                                                <div key={a.id} className="flex gap-3 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                                    <div>
                                                        <p className="text-gray-300 font-semibold">{a.text}</p>
                                                        <p className="text-xs text-gray-500">{a.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Recent Notifications */}
                                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800">
                                        <h3 className="font-bold text-white mb-4">বিজ্ঞপ্তি</h3>
                                        <div className="space-y-4">
                                            {notifications.slice(0, 3).map(n => (
                                                <div key={n.id} className="flex items-start gap-3 p-3 bg-[#262626] rounded-xl border border-gray-800">
                                                    <Bell className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-gray-200">{n.text}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">{n.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Quick Button */}
                                <div className="fixed bottom-6 right-6 z-[9999]">
                                    <button onClick={() => setFabOpen(!fabOpen)} className="bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-500 transition-all">
                                        <Plus className={`w-6 h-6 transition-transform ${fabOpen ? 'rotate-45' : ''}`} />
                                    </button>
                                    {fabOpen && (
                                        <div className="absolute bottom-16 right-0 bg-[#1c1c1e] p-2 rounded-2xl border border-gray-800 shadow-2xl flex flex-col gap-2 min-w-[200px]">
                                            {[
                                                { label: 'নতুন পোস্ট', icon: Plus },
                                                { label: 'অভিযোগ', icon: AlertCircle },
                                                { label: 'ব্যবসা যোগ', icon: Store },
                                                { label: 'রক্তদান', icon: Heart },
                                                { label: 'জরুরি কল', icon: PhoneCall },
                                            ].map(item => (
                                                <button key={item.label} className="flex items-center gap-3 p-3 text-white hover:bg-[#262626] rounded-xl text-sm font-bold">
                                                    <item.icon className="w-4 h-4 text-emerald-500" /> {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Quick Stats Grid */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-extrabold text-white tracking-wide border-l-4 border-emerald-500 pl-3">Quick Stats</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                        {/* Point Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">⭐</span>
                                            <span className="text-xs text-gray-400 font-bold block">ইস্টার (Star)</span>
                                            <span className="text-lg sm:text-xl font-black text-white">{userPoints} Stars</span>
                                        </div>

                                        {/* Badge Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">🏆</span>
                                            <span className="text-sm text-gray-400 font-bold block">ব্যাজ</span>
                                            <span className="text-xl sm:text-2xl font-black text-white">{currentProfile.badges?.length || 3} টি অর্জিত</span>
                                        </div>

                                        {/* Reward Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">🎁</span>
                                            <span className="text-sm text-gray-400 font-bold block">রিওয়ার্ড</span>
                                            <span className="text-xl sm:text-2xl font-black text-white">৩টি ক্লেইমযোগ্য</span>
                                        </div>

                                        {/* Recharge Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">📱</span>
                                            <span className="text-sm text-gray-400 font-bold block">রিচার্জ</span>
                                            <span className="text-xl sm:text-2xl font-black text-white">ইস্টার রিচার্জযোগ্য</span>
                                        </div>

                                        {/* Blood Donor Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">❤️</span>
                                            <span className="text-sm text-gray-400 font-bold block">রক্তদাতা</span>
                                            <span className="text-xl sm:text-2xl font-black text-white">{currentProfile.isBloodDonor ? "প্রস্তুত আছেন" : "সক্রিয় নয়"}</span>
                                        </div>

                                        {/* Applications Stat */}
                                        <div className="bg-[#1c1c1e] p-5 rounded-2xl border border-gray-800 shadow-md hover:border-gray-700 transition-all">
                                            <span className="text-2xl mb-2 block">📝</span>
                                            <span className="text-sm text-gray-400 font-bold block">আবেদন</span>
                                            <span className="text-xl sm:text-2xl font-black text-white">২টি প্রক্রিয়াধীন</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. দ্রুত কার্যক্রম Panel */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-extrabold text-white tracking-wide border-l-4 border-emerald-500 pl-3">দ্রুত কার্যক্রম</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Action 1: New Post */}
                                        <button onClick={() => setActiveActionModal('post')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">নতুন পোস্ট</span>
                                                <span className="text-[10px] text-gray-500">মতপ্রকাশ করুন (+২০)</span>
                                            </div>
                                        </button>

                                        {/* Action 2: Add Business */}
                                        <button onClick={() => setActiveActionModal('business')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <Store className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">ব্যবসা যোগ করুন</span>
                                                <span className="text-[10px] text-gray-500">ডিরেক্টরি বৃদ্ধি (+৩০)</span>
                                            </div>
                                        </button>

                                        {/* Action 3: Provide News */}
                                        <button onClick={() => setActiveActionModal('news')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <Newspaper className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">সংবাদ দিন</span>
                                                <span className="text-[10px] text-gray-500">তথ্য ভাগ করুন (+২৫)</span>
                                            </div>
                                        </button>

                                        {/* Action 4: Educational Institution */}
                                        <button onClick={() => setActiveActionModal('education')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">শিক্ষা প্রতিষ্ঠান</span>
                                                <span className="text-[10px] text-gray-500">ডাটাবেজে যুক্ত করুন (+১৫)</span>
                                            </div>
                                        </button>

                                        {/* Action 5: Add Service Provider */}
                                        <button onClick={() => setActiveActionModal('service')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <Wrench className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">সেবাদাতা যোগ করুন</span>
                                                <span className="text-[10px] text-gray-500">যোগাযোগের তালিকা (+২০)</span>
                                            </div>
                                        </button>

                                        {/* Action 6: Mobile Recharge */}
                                        <button onClick={() => setActiveActionModal('recharge')} className="p-4 bg-[#1c1c1e] hover:bg-[#252527] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-left flex items-center gap-4 transition-all hover:scale-[1.02] shadow-sm">
                                            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-extrabold text-white block">রিচার্জ করুন</span>
                                                <span className="text-[10px] text-gray-500">ইস্টার কুপন দিয়ে</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* 4. সাম্প্রতিক কার্যক্রম (Tabbed View) */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-extrabold text-white tracking-wide border-l-4 border-emerald-500 pl-3">সাম্প্রতিক কার্যক্রম</h3>
                                    <div className="bg-[#1c1c1e] rounded-3xl border border-gray-800 overflow-hidden shadow-md">
                                        <div className="flex border-b border-gray-800 scrollbar-none overflow-x-auto">
                                            <button onClick={() => setRecentActivityTab('posts')} className={`flex-1 py-4 px-4 text-xs font-bold transition-all border-b-2 text-center whitespace-nowrap ${recentActivityTab === 'posts' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-transparent text-gray-400 hover:text-white'}`}>সর্বশেষ পোস্ট</button>
                                            <button onClick={() => setRecentActivityTab('applications')} className={`flex-1 py-4 px-4 text-xs font-bold transition-all border-b-2 text-center whitespace-nowrap ${recentActivityTab === 'applications' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-transparent text-gray-400 hover:text-white'}`}>আবেদন</button>
                                            <button onClick={() => setRecentActivityTab('rewards')} className={`flex-1 py-4 px-4 text-xs font-bold transition-all border-b-2 text-center whitespace-nowrap ${recentActivityTab === 'rewards' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-transparent text-gray-400 hover:text-white'}`}>রিওয়ার্ড</button>
                                            <button onClick={() => setRecentActivityTab('points')} className={`flex-1 py-4 px-4 text-xs font-bold transition-all border-b-2 text-center whitespace-nowrap ${recentActivityTab === 'points' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10' : 'border-transparent text-gray-400 hover:text-white'}`}>ইস্টার</button>
                                        </div>

                                        <div className="p-6">
                                            {/* Tab: Latest Posts */}
                                            {recentActivityTab === 'posts' && (
                                                <div className="space-y-4">
                                                    {myPostsList.map((post, idx) => (
                                                        <div key={idx} className="p-4 bg-[#262626]/60 rounded-2xl border border-gray-800/80 flex justify-between items-start gap-4">
                                                            <div>
                                                                <span className="text-[10px] font-extrabold bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-2 py-0.5 rounded-full">{post.category}</span>
                                                                <h4 className="font-extrabold text-sm text-gray-200 mt-2">{post.title}</h4>
                                                                <p className="text-xs text-gray-400 mt-1">{post.content}</p>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500 font-mono shrink-0">{post.date}</span>
                                                        </div>
                                                    ))}
                                                    {myPostsList.length === 0 && <p className="text-xs text-gray-500 text-center py-4">এখনো কোনো নাগরিক পোস্ট করা হয়নি।</p>}
                                                </div>
                                            )}

                                            {/* Tab: Applications */}
                                            {recentActivityTab === 'applications' && (
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-[#262626]/60 rounded-2xl border border-gray-800/80 flex justify-between items-center">
                                                        <div>
                                                            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">অপেক্ষমান</span>
                                                            <h4 className="font-bold text-sm text-gray-200 mt-2">নাগরিক আইডি কার্ড ভেরিফিকেশন</h4>
                                                            <p className="text-xs text-gray-500">কোড: AP-8947A • ২৮ জুন, ২০২৬</p>
                                                        </div>
                                                        <span className="text-xs text-gray-400">পর্যবেক্ষণ চলছে</span>
                                                    </div>
                                                    <div className="p-4 bg-[#262626]/60 rounded-2xl border border-gray-800/80 flex justify-between items-center">
                                                        <div>
                                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">অনুমোদিত</span>
                                                            <h4 className="font-bold text-sm text-gray-200 mt-2">নতুন বিদ্যুৎ সংযোগ আবেদন</h4>
                                                            <p className="text-xs text-gray-500">কোড: AP-7643X • ২৫ জুন, ২০২৬</p>
                                                        </div>
                                                        <span className="text-xs text-emerald-400 font-bold">অনুমোদিত</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab: Rewards */}
                                            {recentActivityTab === 'rewards' && (
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-[#262626]/60 rounded-2xl border border-gray-800/80 flex justify-between items-center">
                                                        <div>
                                                            <span className="text-xs text-emerald-400 font-extrabold block">২০ টাকা মোবাইল রিচার্জ</span>
                                                            <p className="text-xs text-gray-500">১০০ ইস্টার কুপন ক্লেইম সম্পন্ন হয়েছে।</p>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-500">২৬ জুন, ২০২৬</span>
                                                    </div>
                                                    <div className="p-4 bg-[#262626]/60 rounded-2xl border border-gray-800/80 flex justify-between items-center">
                                                        <div>
                                                            <span className="text-xs text-emerald-500 font-extrabold block">সচেতন নাগরিক সম্মাননা মেডেল</span>
                                                            <p className="text-xs text-gray-500">৫০০ ইস্টারের মেডেল সফলভাবে প্রোফাইলে সিঙ্ক করা হয়েছে।</p>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-gray-500">২৪ জুন, ২০২৬</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tab: Points */}
                                            {recentActivityTab === 'points' && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-3 bg-[#262626]/30 border border-gray-850 rounded-xl">
                                                        <span className="text-xs text-gray-300">দৈনিক হাজিরা বোনাস ক্লেইম</span>
                                                        <span className="text-xs text-emerald-400 font-black font-mono">+১০ BDT</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-[#262626]/30 border border-gray-850 rounded-xl">
                                                        <span className="text-xs text-gray-300">নাগরিক প্রোফাইল সংশোধন ও সম্পূর্ণকরণ</span>
                                                        <span className="text-xs text-emerald-400 font-black font-mono">+২০ BDT</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-[#262626]/30 border border-gray-850 rounded-xl">
                                                        <span className="text-xs text-gray-300">উন্নয়ন কাজের জন্য মন্তব্য ও রেটিং প্রদান</span>
                                                        <span className="text-xs text-emerald-400 font-black font-mono">+১৫ BDT</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 5. বিজ্ঞপ্তি Panel */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-l-4 border-emerald-500 pl-3">
                                        <h3 className="text-lg font-extrabold text-white tracking-wide">বিজ্ঞপ্তি</h3>
                                        <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">নতুন নোটিফিকেশন</span>
                                    </div>
                                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-gray-800 space-y-4">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${notif.read ? 'bg-[#222]/30 border-gray-850 opacity-60' : 'bg-emerald-950/10 border-emerald-900/30 shadow-sm'}`}>
                                                <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${notif.read ? 'text-gray-500' : 'text-emerald-400 animate-swing'}`} />
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-xs font-semibold ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>{notif.text}</p>
                                                    <span className="text-[10px] text-gray-500 font-mono block">{notif.date}</span>
                                                </div>
                                                {!notif.read && (
                                                    <button onClick={() => handleMarkNotificationAsRead(notif.id)} className="text-[10px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors">
                                                        পঠিত হিসেবে চিহ্নিত করুন
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 6. Footer (Version 1.0) */}
                                <footer className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                                    <p>© ২০২৬ বানেশ্বর ইউনিয়ন ডিজিটাল পরিষদ। সর্বস্বত্ব সংরক্ষিত।</p>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 bg-gray-800/80 border border-gray-750 text-gray-400 font-mono rounded-lg">Version 1.0</span>
                                    </div>
                                </footer>
                            </div>
                        )}


                        {/* ================= SECTION: ACCOUNT / PROFILE ================= */}
                        {activeSection === 'profile' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                        <UserCheck className="w-6 h-6 text-emerald-400" />
                                        নাগরিক প্রোফাইল ও তথ্য সংশোধন
                                    </h2>
                                    <p className="text-xs text-gray-400 mb-6 border-b border-gray-800 pb-4">
                                        আপনার সঠিক নাগরিক তথ্য প্রদান করে অ্যাকাউন্টের সম্পূর্ণ অ্যাক্সেস ও বাড়তি ২০ ইস্টার বোনাস অর্জন করুন।
                                    </p>

                                    {saveSuccess && (
                                        <div className="p-4 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 rounded-xl mb-6 flex items-center gap-2 text-sm font-bold">
                                            <CheckCircle2 className="w-5 h-5" />
                                            অভিনন্দন! আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।
                                        </div>
                                    )}

                                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 block">নাগরিকের পুরো নাম</label>
                                                <input 
                                                    type="text" 
                                                    value={name || ""} 
                                                    onChange={e => setName(e.target.value)}
                                                    required
                                                    className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                    placeholder="যেমন: জসিম উদ্দিন"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 block">মোবাইল নম্বর</label>
                                                <input 
                                                    type="tel" 
                                                    value={phone || ""} 
                                                    onChange={e => setPhone(e.target.value)}
                                                    required
                                                    className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                    placeholder="যেমন: 017xxxxxxxx"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 block">গ্রামের নাম</label>
                                                <input 
                                                    type="text" 
                                                    value={village || ""} 
                                                    onChange={e => setVillage(e.target.value)}
                                                    required
                                                    className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                    placeholder="যেমন: পুতুলিয়া গ্রাম"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 block">ইউনিয়ন</label>
                                                <select 
                                                    value={union || ""} 
                                                    onChange={e => setUnion(e.target.value)}
                                                    className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="বানেশ্বর">বানেশ্বর</option>
                                                    <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                                                    <option value="ভালুকগাছী">ভালুকগাছী</option>
                                                    <option value="জিউপাড়া">জিউপাড়া</option>
                                                    <option value="পুঠিয়া">পুঠিয়া</option>
                                                    <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 block">রক্তের গ্রুপ</label>
                                                <select 
                                                    value={bloodGroup || ""} 
                                                    onChange={e => setBloodGroup(e.target.value)}
                                                    className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2 flex flex-col justify-end">
                                                <div className="p-3 bg-[#262626] border border-gray-800 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-white block">স্বেচ্ছায় রক্তদান সক্রিয় করুন</span>
                                                        <span className="text-[10px] text-gray-500">জরুরি সময়ে রক্তদানের জন্য প্রস্তুত আছেন?</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isBloodDonor} 
                                                        onChange={e => setIsBloodDonor(e.target.checked)}
                                                        className="w-5 h-5 text-emerald-500 rounded border-gray-800 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm shadow-md flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'তথ্য সেভ করুন'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}


                        {/* ================= SECTION: MY ACTIVITIES ================= */}
                        {activeSection === 'activities' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-4">আমার কার্যক্রম ও আবেদন ট্র্যাকার</h2>
                                    
                                    <div className="space-y-4">
                                        {isLoadingData ? (
                                            <div className="p-10 text-center text-gray-500">লোডিং হচ্ছে...</div>
                                        ) : realApplications.length > 0 ? (
                                            realApplications.map(app => (
                                                <div key={app.id} className="p-4 bg-[#262626] rounded-2xl border border-gray-800 flex justify-between items-center">
                                                    <div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                                            app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        }`}>
                                                            {app.status === 'Approved' ? 'অনুমোদিত' : app.status === 'Rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                                                        </span>
                                                        <h3 className="font-bold text-sm text-gray-200 mt-2">{app.serviceName}</h3>
                                                        <p className="text-xs text-gray-500">আবেদনের তারিখ: {app.createdAt} • আইডি: {app.id.substring(0, 8)}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{app.status === 'Approved' ? 'সম্পন্ন' : 'যাচাই চলছে'}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center border border-dashed border-gray-800 rounded-2xl">
                                                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                                <p className="text-gray-500">আপনার কোনো সক্রিয় আবেদন পাওয়া যায়নি।</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* ================= SECTION: REWARDS ================= */}
                        {activeSection === 'rewards' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                        <Gift className="w-6 h-6 text-amber-500" />
                                        রিওয়ার্ড ও পুরস্কার কেন্দ্র
                                    </h2>
                                    <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">
                                        বিভিন্ন তথ্য পড়ে এবং সঠিক মতামত প্রদান করে ইস্টার অর্জন করুন, এবং আকর্ষণীয় নাগরিক অফার ক্লেইম করুন।
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-5 bg-[#262626] rounded-2xl border border-gray-800 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <span className="text-xs text-emerald-500 font-bold">কูปন কোড</span>
                                                <h3 className="font-bold text-base text-white">ফ্রি মোবাইল রিচার্জ কুপন</h3>
                                                <p className="text-xs text-gray-400">১০০ ইস্টার দিয়ে ২০ টাকা সরাসরি মোবাইল রিচার্জ অফার ক্লেইম করুন।</p>
                                            </div>
                                            <button className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors">
                                                ১০০ ইস্টারে ক্লেইম করুন
                                            </button>
                                        </div>

                                        <div className="p-5 bg-[#262626] rounded-2xl border border-gray-800 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <span className="text-xs text-amber-500 font-bold">অফিসিয়াল গিফট</span>
                                                <h3 className="font-bold text-base text-white">আমার গ্রাম ডিজিটাল মেডেল</h3>
                                                <p className="text-xs text-gray-400">৫০০ ইস্টারে আপনার প্রোফাইলে যুক্ত করুন বিশেষ সম্মানিত সোনার মেডেল ব্যাজ।</p>
                                            </div>
                                            <button className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors">
                                                ৫০০ ইস্টারে ক্লেইম করুন
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* ================= SECTION: CITIZEN SERVICES ================= */}
                        {activeSection === 'services' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                                        <Heart className="w-6 h-6 text-rose-500" />
                                        নাগরিক সেবা ও হেল্পলাইন
                                    </h2>
                                    <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">
                                        জরুরি স্বাস্থ্যসেবা, রক্তদাতার তালিকা এবং সরকারি হেল্পলাইনের নাম্বার সরাসরি এখান থেকে পান।
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#262626] rounded-2xl border border-gray-800 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-sm text-white">জাতীয় জরুরি সেবা</h3>
                                                <p className="text-xs text-gray-500">ফ্রি কল করুন যেকোনো সময়</p>
                                            </div>
                                            <a href="tel:999" className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                                                <PhoneCall className="w-3.5 h-3.5" />
                                                ৯৯৯
                                            </a>
                                        </div>

                                        <div className="p-4 bg-[#262626] rounded-2xl border border-gray-800 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-sm text-white">সরকারি তথ্য ও সেবা</h3>
                                                <p className="text-xs text-gray-500">তথ্য ও পরামর্শ হাব</p>
                                            </div>
                                            <a href="tel:333" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                                                <PhoneCall className="w-3.5 h-3.5" />
                                                ৩৩৩
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* ================= SECTION: HELP / COMPLAINTS ================= */}
                        {activeSection === 'help' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-2">সাহায্য, অভিযোগ ও পরামর্শ হাব</h2>
                                    <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-800">
                                        আমাদের পোর্টালের সেবার মান বৃদ্ধিতে আপনার অভিযোগ বা মূলবান পরামর্শ সরাসরি উপজেলা প্রশাসনের কাছে জমা দিন।
                                    </p>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 block">বিষয় / টপিক</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                placeholder="যেমন: রাস্তার সংস্কারের অনুরোধ"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 block">আপনার অভিযোগ বা পরামর্শটি বিস্তারিত লিখুন</label>
                                            <textarea 
                                                rows={4}
                                                className="w-full bg-[#262626] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                                                placeholder="আপনার কথা এখানে সুন্দরভাবে ব্যাখ্যা করুন..."
                                            ></textarea>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => window.alert('আপনার অভিযোগ/পরামর্শটি সিস্টেমে নথিবদ্ধ করা হয়েছে। ধন্যবাদ!')}
                                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                                        >
                                            মতামত পাঠান
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= SECTION: MY INFO ================= */}
                        {activeSection === 'info' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-[#1c1c1e] rounded-3xl border border-gray-850 shadow-lg">
                                    <h2 className="text-2xl font-black text-white mb-6">আমার তথ্য ও এন্ট্রি</h2>
                                    
                                    <div className="space-y-8">
                                        {/* Businesses Sub-section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                                <Store className="w-5 h-5" />
                                                আমার ব্যবসা প্রতিষ্ঠান
                                            </h3>
                                            <div className="grid gap-4">
                                                {isLoadingData ? (
                                                    <div className="p-4 text-center text-gray-500">লোডিং...</div>
                                                ) : realBusinesses.length > 0 ? (
                                                    realBusinesses.map(biz => (
                                                        <div key={biz.id} className="p-4 bg-[#262626] rounded-2xl border border-gray-800 flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-bold text-white">{biz.name}</h4>
                                                                <p className="text-xs text-gray-500">{biz.category} • {biz.address}</p>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                                biz.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                            }`}>
                                                                {biz.status === 'approved' ? 'Active' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-[#262626] rounded-2xl border border-dashed border-gray-800 text-gray-500 text-sm">
                                                        আপনার কোনো ব্যবসা প্রতিষ্ঠান তালিকাভুক্ত নেই।
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Posts Sub-section */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                                <Newspaper className="w-5 h-5" />
                                                আমার পোস্ট ও বিজ্ঞাপন
                                            </h3>
                                            <div className="grid gap-4">
                                                {isLoadingData ? (
                                                    <div className="p-4 text-center text-gray-500">লোডিং...</div>
                                                ) : realPosts.length > 0 ? (
                                                    realPosts.map(post => (
                                                        <div key={post.id} className="p-4 bg-[#262626] rounded-2xl border border-gray-800">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-white text-sm line-clamp-1">{post.category || 'সাধারণ'}</h4>
                                                                <span className="text-[10px] text-gray-500">{post.createdAt}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 line-clamp-2">{post.text}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center bg-[#262626] rounded-2xl border border-dashed border-gray-800 text-gray-500 text-sm">
                                                        আপনার কোনো পোস্ট পাওয়া যায়নি।
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
                <BottomNav />
            </div>
        </div>
    );
}


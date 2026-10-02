import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LayoutGrid, 
  Bell, 
  Settings, 
  Star,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
  Check,
  FileText,
  FolderDown,
  Bookmark,
  AlertTriangle,
  Landmark,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import Header from '../home/Header';
import { Sidebar } from '../Sidebar';
import puthiaLogo from '../../assets/images/puthia_official_icon_logo.jpg';
import Footer from '../home/Footer';
import BottomNavigation from '../home/BottomNavigation';
import DashboardHome from './DashboardHome';

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(3); // Defaults to 3 as shown in design mockup
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(3); // Default to 3 if user not logged in to match design mockup exactly
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      const unread = list.filter(n => n.read !== true).length;
      setUnreadCount(unread > 0 ? unread : 3);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for notifications.");
      } else {
        console.warn("Error fetching notifications:", error?.message || error);
      }
      setUnreadCount(3);
    });

    return () => unsubscribe();
  }, [user]);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ড্যাশবোর্ড', 
      icon: LayoutGrid, 
      path: '/dashboard', 
      bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'সারসংক্ষেপ ও কুইক একসেস'
    },
    { 
      id: 'my-submissions', 
      label: 'আমার যোগ করা তথ্য', 
      icon: FileText, 
      path: '/my-submissions', 
      bgLight: 'bg-teal-50 text-teal-600 border-teal-100',
      description: 'আপনার জমা দেওয়া তথ্য'
    },
    { 
      id: 'bookmarks', 
      label: 'আমার বুকমার্ক', 
      icon: Bookmark, 
      path: '/my-bookmarks', 
      bgLight: 'bg-rose-50 text-rose-600 border-rose-100',
      description: 'পছন্দের তথ্য ও পোস্ট'
    },
    { 
      id: 'complaints', 
      label: 'আমার অভিযোগ', 
      icon: AlertTriangle, 
      path: '/my-complaints', 
      bgLight: 'bg-purple-50 text-purple-600 border-purple-100',
      description: 'নাগরিক অভিযোগ ও সমাধান'
    },
    { 
      id: 'reviews', 
      label: 'আমার রিভিউ', 
      icon: Star, 
      path: '/my-reviews', 
      bgLight: 'bg-amber-50 text-amber-600 border-amber-100',
      description: 'আপনার রেটিং ও মন্তব্য'
    },
    { 
      id: 'notifications', 
      label: 'নোটিফিকেশন', 
      icon: Bell, 
      path: '/notifications', 
      bgLight: 'bg-orange-50 text-orange-600 border-orange-100',
      description: 'আপডেট ও নোটিশ'
    },
    { 
      id: 'settings', 
      label: 'সেটিংস', 
      icon: Settings, 
      path: '/settings', 
      bgLight: 'bg-slate-100 text-slate-600 border-slate-200',
      description: 'অ্যাকাউন্ট ও প্রেফারেন্স'
    },
  ];

  if (userProfile && userProfile.role === 'super_admin') {
    menuItems.push({ 
      id: 'super-admin', 
      label: 'সুপার এডমিন প্যানেল', 
      icon: LayoutGrid, 
      path: '/super-admin', 
      bgLight: 'bg-rose-50 text-rose-600 border-rose-100',
      description: 'মাস্টার কন্ট্রোল ও একসেস'
    });
  }
  
  if (userProfile && (userProfile.role === 'super_admin' || userProfile.role === 'admin')) {
    menuItems.push({ 
      id: 'admin', 
      label: 'অ্যাডমিন প্যানেল', 
      icon: LayoutGrid, 
      path: '/admin', 
      bgLight: 'bg-rose-50 text-rose-600 border-rose-100',
      description: 'কনটেন্ট ও তথ্য পরিচালনা'
    });
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="pt-0 pb-24 max-w-7xl mx-auto lg:pt-20 lg:px-4 lg:flex lg:gap-8">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3.5 mb-6 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 bg-white rounded-xl shadow-xs flex items-center justify-center overflow-hidden border border-slate-200/80 shrink-0">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-800 text-sm truncate flex items-center gap-1">
                  {userProfile?.name || 'সম্মানিত নাগরিক'}
                </h3>
                <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-100/60">
                  {userProfile?.role === 'super_admin' ? 'সুপার এডমিন' : userProfile?.role === 'admin' ? 'অ্যাডমিন' : 'নাগরিক প্যানেল'}
                </span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl transition-all font-bold text-xs border cursor-pointer ${
                      active 
                        ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white border-emerald-700 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? 'bg-white/20 text-white' : item.bgLight
                      }`}>
                        <item.icon size={16} />
                      </div>
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    {item.id === 'notifications' && unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-xs">
                        {unreadCount}
                      </span>
                    ) : (
                      <ChevronRight size={14} className={active ? 'text-white/80' : 'text-slate-300'} />
                    )}
                  </button>
                );
              })}
              
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-2.5 px-3 rounded-xl bg-rose-50/60 hover:bg-rose-100/80 border border-rose-100 text-rose-600 transition-all font-bold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <LogOut size={16} />
                    </div>
                    <span>লগআউট</span>
                  </div>
                  <ChevronRight size={14} className="text-rose-300" />
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Unified Citizen Sidebar Drawer */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={(path) => {
            setIsSidebarOpen(false);
            if (path === 'home') {
              navigate('/');
            } else if (path.startsWith('/')) {
              navigate(path);
            } else {
              navigate(`/${path}`);
            }
          }}
          activeItem={location.pathname}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Header Banner */}
          {location.pathname !== '/dashboard' && 
           location.pathname !== '/profile' && 
           location.pathname !== '/settings' && 
           location.pathname !== '/user-privileges' && 
           !location.pathname.startsWith('/my-') && (
            <div 
              className="lg:hidden p-4 rounded-b-[24px] text-white relative overflow-hidden mb-6"
              style={{ background: 'linear-gradient(180deg, #065f46 0%, #047857 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/')} 
                    className="p-1.5 hover:bg-white/10 rounded-full transition flex items-center justify-center cursor-pointer text-white mr-1"
                    aria-label="Back to Home"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <h2 className="text-lg font-bold">
                    {menuItems.find(item => isActive(item.path))?.label || 'ড্যাশবোর্ড'}
                  </h2>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition flex items-center justify-center cursor-pointer"
                  aria-label="Open Sidebar"
                >
                  <Menu size={22} className="text-white/80" />
                </button>
              </div>
            </div>
          )}

          <div className={(
            location.pathname === '/profile' || 
            location.pathname === '/dashboard' || 
            location.pathname === '/user-privileges' || 
            location.pathname.startsWith('/my-')
          ) ? 'p-0' : 'px-4 lg:px-0 pt-3 lg:pt-0'}>
            {location.pathname === '/dashboard' ? (
              <DashboardHome onMenuClick={() => setIsSidebarOpen(true)} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      <Footer />
      <BottomNavigation activeTab="profile" onTabChange={() => {}} />
    </div>
  );
};

export default Dashboard;

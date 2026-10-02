import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Menu,
  Home,
  Tv,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AddaSearchModal } from './search/AddaSearchModal';
import { NotificationPanel } from '../user/NotificationPanel';
import { AuthModal } from '../AuthModal';
import { Sidebar } from '../Sidebar';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface AddaFacebookHeaderProps {
  onOpenCreateModal?: (action?: 'photo' | 'video' | 'general') => void;
  activeTab?: 'feed' | 'friends' | 'reels' | 'marketplace' | 'notifications' | 'menu' | string;
  onTabChange?: (tab: string) => void;
}

export const AddaFacebookHeader: React.FC<AddaFacebookHeaderProps> = ({
  onOpenCreateModal,
  activeTab = 'feed',
  onTabChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { unreadCount: notifUnreadCount } = useNotifications();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);
  const [unreadPostsCount, setUnreadPostsCount] = useState(0);
  const [unreadReelsCount, setUnreadReelsCount] = useState(0);

  // Real-time friend requests count for friends tab badge
  useEffect(() => {
    if (!user) {
      setIncomingRequestsCount(0);
      return;
    }
    try {
      const q = query(
        collection(db, 'friend_requests'),
        where('receiverId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setIncomingRequestsCount(snapshot.size);
      }, () => {});
      return () => unsubscribe();
    } catch (e) {
      console.warn("Friend reqs count listener error", e);
    }
  }, [user]);

  // Real-time unread messages count
  useEffect(() => {
    if (!user) {
      setUnreadMsgCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let totalUnread = 0;
        snapshot.docs.forEach(d => {
          const data = d.data();
          if (data.unreadCounts && data.unreadCounts[user.uid]) {
            totalUnread += Number(data.unreadCounts[user.uid]) || 0;
          }
        });
        setUnreadMsgCount(totalUnread);
      }, () => {});
      return () => unsubscribe();
    } catch (e) {
      console.warn("Unread msg count error", e);
    }
  }, [user]);

  // Top Tabs Configuration (Facebook Style with Site Design System Color: Emerald Green #0B7A3B)
  const isFeedActive = location.pathname === '/adda' || location.pathname === '/discussion';
  const isFriendsActive = location.pathname === '/friends' || location.pathname === '/adda/friends';
  const isReelsActive = location.pathname === '/reels';

  // Clear feed unread count when visiting feed
  useEffect(() => {
    if (isFeedActive) {
      setUnreadPostsCount(0);
    }
  }, [isFeedActive]);

  // Clear reels unread count when visiting reels
  useEffect(() => {
    if (isReelsActive) {
      setUnreadReelsCount(0);
    }
  }, [isReelsActive]);

  const tabs = [
    {
      id: 'feed',
      label: 'হোম',
      icon: Home,
      isActive: isFeedActive && !isNotifOpen,
      badge: unreadPostsCount > 0 ? (unreadPostsCount > 99 ? '99+' : unreadPostsCount) : null,
      action: () => {
        setIsNotifOpen(false);
        setUnreadPostsCount(0);
        if (onTabChange) onTabChange('feed');
        if (!isFeedActive) navigate('/adda');
      }
    },
    {
      id: 'friends',
      label: 'বন্ধু',
      icon: Users,
      isActive: isFriendsActive,
      badge: incomingRequestsCount > 0 ? (incomingRequestsCount > 99 ? '99+' : incomingRequestsCount) : null,
      action: () => {
        setIsNotifOpen(false);
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          if (onTabChange) onTabChange('friends');
          navigate('/friends');
        }
      }
    },
    {
      id: 'messages',
      label: 'মেসেঞ্জার',
      icon: MessageCircle,
      isActive: location.pathname === '/messages',
      badge: unreadMsgCount > 0 ? (unreadMsgCount > 99 ? '99+' : unreadMsgCount) : null,
      action: () => {
        setIsNotifOpen(false);
        navigate('/messages');
      }
    },
    {
      id: 'reels',
      label: 'ভিডিও',
      icon: Tv,
      isActive: isReelsActive,
      badge: unreadReelsCount > 0 ? (unreadReelsCount > 99 ? '99+' : unreadReelsCount) : null,
      action: () => {
        setIsNotifOpen(false);
        setUnreadReelsCount(0);
        navigate('/reels');
      }
    },
    {
      id: 'notifications',
      label: 'নোটিফিকেশন',
      icon: Bell,
      isActive: isNotifOpen || activeTab === 'notifications' || location.pathname === '/notifications',
      badge: notifUnreadCount > 0 ? (notifUnreadCount > 99 ? '99+' : notifUnreadCount) : null,
      action: () => {
        setIsNotifOpen(false);
        navigate('/notifications');
      }
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white select-none shadow-sm" id="adda-facebook-header">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: VIBRANT GRADIENT HEADER (GREEN THEME)                        */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#0B7A3B] via-[#059669] to-[#10B981] shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Logo: White square with green 'প' and leaf */}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative shadow-sm shrink-0">
              <span className="text-[#0B7A3B] text-xl font-black">প</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 text-[#82C91E]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11,20 13.85,18.08 15,15C16.59,10.72 19.97,8.53 22,7C16.73,7 17,8 17,8Z" />
                </svg>
              </div>
            </div>
            
            <Link to="/adda" className="no-underline">
              <span className="text-2xl font-black text-white tracking-tight">আড্ডা</span>
            </Link>
          </div>

          {/* Right: Action Buttons (Circular, semi-transparent) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer border-0"
              title="অনুসন্ধান"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer border-0"
              title="মেসেঞ্জার"
              aria-label="Messages"
            >
              <div className="relative">
                <MessageCircle size={20} strokeWidth={2.5} />
                {unreadMsgCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECOND ROW: TABS NAVIGATION                                           */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isActive;

            return (
              <button
                key={tab.id}
                onClick={tab.action}
                className={`flex-1 flex flex-col items-center justify-center h-10 mx-1 rounded-xl relative transition-all duration-300 border-0 ${
                  active 
                    ? 'bg-gradient-to-r from-[#0B7A3B] to-[#059669] text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 bg-transparent'
                }`}
                title={tab.label}
                aria-label={tab.label}
              >
                <div className="relative flex items-center justify-center">
                  <Icon 
                    size={22} 
                    strokeWidth={active ? 2.5 : 2} 
                  />
                  
                  {/* Badge (only if not active, or small dot if active) */}
                  {tab.badge && !active && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                      {tab.badge}
                    </span>
                  )}
                </div>
                
                {/* Active text label like in screenshot (হোম) */}
                {active && (
                  <span className="text-[11px] font-black ml-1.5 hidden xs:block">{tab.label}</span>
                )}
              </button>
            );
          })}
          
          {/* Menu button at the end like in screenshot */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex-1 flex items-center justify-center h-10 mx-1 rounded-xl text-slate-500 hover:bg-slate-50 transition-all border-0 bg-transparent"
            aria-label="Menu"
          >
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-slate-100" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0091FF] text-white flex items-center justify-center font-bold text-[10px]">
                {userProfile?.name?.charAt(0) || user?.email?.charAt(0) || 'M'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Global Modals */}
      {isSearchOpen && (
        <AddaSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          currentUserId={user?.uid}
        />
      )}

      {isNotifOpen && (
        <NotificationPanel
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Citizen Sidebar Drawer */}
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
        activeItem="/adda"
      />
    </header>
  );
};

export default AddaFacebookHeader;

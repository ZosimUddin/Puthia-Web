import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Tv, 
  MessageCircle, 
  Bell, 
  Menu,
  Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NotificationPanel } from '../user/NotificationPanel';
import { AuthModal } from '../AuthModal';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface AddaFacebookBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AddaFacebookBottomNav: React.FC<AddaFacebookBottomNavProps> = ({
  activeTab = 'feed',
  onTabChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { unreadCount: notifUnreadCount } = useNotifications();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // Unread messages count
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
      console.warn("Unread msg count error in bottom nav", e);
    }
  }, [user]);

  const userAvatar = userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`;

  const navItems = [
    {
      id: 'feed',
      label: 'ফিড',
      icon: Home,
      action: () => {
        if (onTabChange) onTabChange('feed');
        navigate('/adda');
      },
      isActive: location.pathname === '/adda' || location.pathname === '/discussion'
    },
    {
      id: 'friends',
      label: 'বন্ধুরা',
      icon: Users,
      action: () => {
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          navigate('/friends');
        }
      },
      isActive: location.pathname === '/friends' || location.pathname === '/adda/friends'
    },
    {
      id: 'reels',
      label: 'ভিডিও',
      icon: Tv,
      action: () => navigate('/reels'),
      isActive: location.pathname === '/reels'
    },
    {
      id: 'notifications',
      label: 'নোটিফিকেশন',
      icon: Bell,
      badge: notifUnreadCount,
      action: () => {
        navigate('/notifications');
      },
      isActive: isNotifOpen || location.pathname === '/notifications'
    },
    {
      id: 'menu',
      label: 'মেনু',
      isAvatar: true,
      action: () => {
        if (!user) {
          setIsAuthModalOpen(true);
        } else {
          navigate('/dashboard');
        }
      },
      isActive: location.pathname === '/dashboard' || location.pathname === '/profile'
    }
  ];

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 w-full h-[58px] pb-[env(safe-area-inset-bottom,0px)] z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] px-1 flex items-center justify-around"
        id="adda-facebook-bottom-navigation"
      >
        <div className="flex-1 flex items-center justify-around h-full max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex-1 flex flex-col items-center justify-center h-full px-0.5 relative cursor-pointer focus:outline-none select-none min-h-[44px] transition-colors border-0 bg-transparent"
                title={item.label}
              >
                {/* Active Indicator Top Line */}
                {active && (
                  <div className="absolute top-0 left-2 right-2 h-[3px] bg-[#1877F2] rounded-b-full" />
                )}

                <div className="relative flex items-center justify-center">
                  {item.isAvatar ? (
                    <div className={`w-7 h-7 rounded-full overflow-hidden border ${active ? 'border-[#1877F2] ring-2 ring-blue-100' : 'border-slate-300'}`}>
                      <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  ) : Icon ? (
                    <Icon 
                      size={22} 
                      strokeWidth={active ? 2.5 : 2} 
                      className={`transition-transform duration-150 ${active ? 'text-[#1877F2] scale-105' : 'text-slate-500'}`} 
                    />
                  ) : null}

                  {/* Badge */}
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                      {item.badge! > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'text-[#1877F2] font-black' : 'text-slate-500 font-semibold'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Global Modals */}
      {isNotifOpen && (
        <NotificationPanel
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          mode="modal"
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
};

export default AddaFacebookBottomNav;

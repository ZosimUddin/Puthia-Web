import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, MessagesSquare, Newspaper, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const userInitial = (
    userProfile?.name?.trim()?.charAt(0) || 
    user?.displayName?.trim()?.charAt(0) || 
    user?.email?.trim()?.charAt(0) || 
    "U"
  ).toUpperCase();

  const startLongPress = useCallback(() => {
    isLongPressActive.current = false;
    timerRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-role-switcher'));
      isLongPressActive.current = true;
    }, 600);
  }, []);

  const endLongPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between items-center z-[1000] pb-safe shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] px-4 h-16" id="bottom-navigation-bar">
      {[
        { label: 'হোম', icon: Home, path: '/' },
        { label: 'সেবা সমূহ', icon: Search, path: '/services' },
        { label: 'আড্ডা', icon: MessagesSquare, isAction: true, path: '/messages' },
        { label: 'স্থানীয় সংবাদ', icon: Newspaper, path: '/news' },
        { label: 'প্রোফাইল', icon: User, path: '/dashboard' },
      ].map((item) => {
        const longPressProps = item.isAction ? {
          onMouseDown: startLongPress,
          onMouseUp: endLongPress,
          onMouseLeave: endLongPress,
          onTouchStart: startLongPress,
          onTouchEnd: endLongPress,
        } : {};

        return (
          <motion.button 
            key={item.label}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center justify-center p-2 transition-all ${item.isAction ? 'w-14 h-14 bg-[#006a4e] text-white rounded-full -mt-10 border-[6px] border-[#f8fafc] shadow-lg shadow-emerald-900/20 active:scale-95' : 'text-gray-400 hover:text-emerald-700'}`}
            {...longPressProps}
            id={item.isAction ? "fab-plus-button" : `bottom-nav-item-${item.label.toLowerCase()}`}
            onClick={() => {
              if (item.label === 'ড্যাশবোর্ড' || item.label === 'প্রোফাইল') {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/login');
                  window.dispatchEvent(new CustomEvent('open-auth-modal'));
                }
              } else if (item.path) {
                navigate(item.path);
              }
            }}
          >
            {(item.label === 'ড্যাশবোর্ড' || item.label === 'প্রোফাইল') && user ? (
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-emerald-600/40 shadow-xs mb-0.5">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#006a4e] text-white flex items-center justify-center font-black text-[11px]">
                    {userInitial}
                  </div>
                )}
              </div>
            ) : (
              <item.icon className={`w-6 h-6 ${item.isAction ? 'text-white' : ''}`} strokeWidth={2.3} />
            )}
            <span className={`text-[10px] ${item.isAction ? 'text-white font-bold' : 'text-gray-500'}`}>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

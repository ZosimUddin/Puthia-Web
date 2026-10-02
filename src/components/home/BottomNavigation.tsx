import React, { useRef, useCallback } from "react";
import { Home, LayoutGrid, MessagesSquare, Newspaper, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavProps> = ({
  activeTab: initialActiveTab = "home",
  onTabChange = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

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

  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/news" || location.pathname === "/news-portals" || location.pathname === "/notice") return "news";
    if (location.pathname === "/services") return "services";
    if (location.pathname === "/discussion" || location.pathname === "/adda" || location.pathname.startsWith("/adda/")) return "adda";
    if (location.pathname === "/dashboard" || location.pathname === "/profile") return "profile";
    return initialActiveTab;
  };

  const activeTab = getActiveTab();

  const handleTabClick = (id: string) => {
    if (onTabChange) onTabChange(id);
    
    switch (id) {
      case "home":
        navigate("/");
        break;
      case "services":
        navigate("/services");
        break;
      case "adda":
        navigate("/adda");
        break;
      case "news":
      case "notices":
        navigate("/news");
        break;
      case "profile":
        if (user) {
          navigate("/dashboard");
        } else {
          navigate("/login");
          window.dispatchEvent(new CustomEvent('open-auth-modal'));
        }
        break;
      default:
        break;
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    isAction?: boolean;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: "home", label: "হোম", icon: Home },
    { id: "services", label: "সেবা সমূহ", icon: LayoutGrid },
    { id: "adda", label: "আড্ডা", icon: MessagesSquare, isAction: true },
    { id: "news", label: "স্থানীয় সংবাদ", icon: Newspaper },
    { id: "profile", label: "প্রোফাইল", icon: User },
  ];

  const userInitial = (
    userProfile?.name?.trim()?.charAt(0) || 
    user?.displayName?.trim()?.charAt(0) || 
    user?.email?.trim()?.charAt(0) || 
    "U"
  ).toUpperCase();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full h-[66px] pb-[env(safe-area-inset-bottom,0px)] z-[60] bg-white border-t border-slate-200/80 px-2 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
      id="bottom-navigation-bar"
    >
      <div className="flex-1 flex items-center justify-around h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="flex-1 flex flex-col items-center justify-center h-full relative cursor-pointer select-none focus:outline-none min-h-[48px]"
                aria-label="আড্ডা"
              >
                <div className={`w-12 h-12 -mt-4 rounded-full ${isActive ? 'bg-[#00523c] ring-4 ring-emerald-200' : 'bg-[#006a4e] hover:bg-[#00543e]'} text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border-2 border-white active:scale-95 transition-all`}>
                  <MessagesSquare size={22} strokeWidth={2.3} className="text-white" />
                </div>
                <span className={`text-[10px] ${isActive ? 'text-[#006a4e] font-black' : 'font-black text-slate-700'} mt-1 tracking-tight`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full px-1 cursor-pointer focus:outline-none select-none min-h-[48px] active:scale-95 transition-transform"
            >
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 relative ${
                  isActive
                    ? "bg-emerald-100 text-[#006a4e]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.id === "profile" && user ? (
                  <div
                    className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                      isActive
                        ? "ring-2 ring-[#006a4e] ring-offset-1 shadow-sm"
                        : "border border-emerald-600/30 shadow-xs"
                    }`}
                  >
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#006a4e] text-white flex items-center justify-center font-black text-xs">
                        {userInitial}
                      </div>
                    )}
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                )}
                
                {/* Notification Badge */}
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] tracking-tight truncate max-w-[64px] text-center ${isActive ? "text-[#006a4e] font-black" : "text-slate-500 font-bold"}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="w-4 h-0.5 bg-[#006a4e] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

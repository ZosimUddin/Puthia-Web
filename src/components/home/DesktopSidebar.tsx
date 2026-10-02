import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Stethoscope, 
  GraduationCap, 
  Users, 
  Newspaper, 
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  Wrench,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import defaultAppLogo from '../../assets/images/puthia_official_icon_logo.jpg';
import fullOfficialLogo from '../../assets/images/puthia_official_full_logo.jpg';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
          isActive 
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50' 
            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
        }`
      }
    >
      <div className="shrink-0">
        {icon}
      </div>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-black text-2xl whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[70] whitespace-nowrap shadow-xl">
          {label}
        </div>
      )}
    </NavLink>
  );
};

export const DesktopSidebar: React.FC<{ isCollapsed: boolean; onToggle: () => void }> = ({ 
  isCollapsed, 
  onToggle 
}) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '300px' }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 z-[65] transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0"
    >
      {/* Sidebar Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-50 min-h-[96px]">
        {!isCollapsed ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center min-w-0"
          >
            <img 
              src={fullOfficialLogo} 
              alt="আমাদের পুঠিয়া" 
              className="h-10 w-auto max-w-[200px] object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ) : (
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-emerald-600/30 flex items-center justify-center p-0.5 bg-white shrink-0 mx-auto">
            <img 
              src={defaultAppLogo} 
              alt="আমাদের পুঠিয়া" 
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-hide">
        <SidebarItem to="/" icon={<Home size={26} />} label="হোম" isCollapsed={isCollapsed} />
        
        <div className="py-3">
          {!isCollapsed && (
            <p className="px-3 text-sm font-black text-slate-400 uppercase tracking-widest mb-3">কোর মডিউল</p>
          )}
          <SidebarItem to="/marketplace" icon={<ShoppingBag size={28} />} label="মার্কেটপ্লেস" isCollapsed={isCollapsed} />
          <SidebarItem to="/health" icon={<Stethoscope size={28} />} label="স্বাস্থ্য সেবা" isCollapsed={isCollapsed} />
          <SidebarItem to="/education" icon={<GraduationCap size={28} />} label="শিক্ষা ও ক্যারিয়ার" isCollapsed={isCollapsed} />
          <SidebarItem to="/services" icon={<Wrench size={28} />} label="সেবা ডিরেক্টরি" isCollapsed={isCollapsed} />
          <SidebarItem to="/it-centers" icon={<Globe size={28} />} label="ডিজিটাল সেন্টার" isCollapsed={isCollapsed} />
        </div>

        <div className="py-3 border-t border-slate-50">
          {!isCollapsed && (
            <p className="px-3 text-sm font-black text-slate-400 uppercase tracking-widest mb-3">কমিউনিটি</p>
          )}
          <SidebarItem to="/adda" icon={<Users size={26} />} label="আড্ডা ও আলোচনা" isCollapsed={isCollapsed} />
          <SidebarItem to="/news" icon={<Newspaper size={26} />} label="সর্বশেষ সংবাদ" isCollapsed={isCollapsed} />
        </div>

        <div className="py-3 border-t border-slate-50">
          {!isCollapsed && (
            <p className="px-3 text-sm font-black text-slate-400 uppercase tracking-widest mb-3">ইউজার</p>
          )}
          <SidebarItem to="/dashboard" icon={<LayoutDashboard size={26} />} label="ড্যাশবোর্ড" isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Footer / App Version */}
      {!isCollapsed && (
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-lg shadow-2xs">
              v1
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-800">ডিজিটাল পুঠিয়া</span>
              <span className="text-sm text-slate-500 font-bold">পুঠিয়া, রাজশাহী</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

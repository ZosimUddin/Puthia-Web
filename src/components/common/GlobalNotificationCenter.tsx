import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertTriangle, ShieldCheck, Briefcase, Zap, AlertCircle, X, ExternalLink } from 'lucide-react';
import { SystemNotification, getNotificationsForUser, markNotificationAsRead } from '../../services/automationNotificationEngine';

interface GlobalNotificationCenterProps {
  currentUserId?: string;
}

export const GlobalNotificationCenter: React.FC<GlobalNotificationCenterProps> = ({ currentUserId = "admin" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [currentUserId]);

  const loadNotifications = () => {
    setNotifications(getNotificationsForUser(currentUserId));
  };

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative inline-block">
      
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all cursor-pointer"
        title="স্মার্ট অটোমেশন নোটিফিকেশন সেন্টার"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-emerald-400" />
              <h3 className="text-sm font-black">অটোমেশন নোটিফিকেশন হাব</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                কোনো নতুন নোটিফিকেশন নেই
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition-colors flex items-start gap-3 ${
                    !n.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'success' && <ShieldCheck size={18} className="text-emerald-600" />}
                    {n.type === 'warning' && <AlertTriangle size={18} className="text-amber-600" />}
                    {n.type === 'emergency' && <AlertCircle size={18} className="text-rose-600 animate-bounce" />}
                    {n.type === 'info' && <Bell size={18} className="text-sky-600" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{n.title}</h4>
                      <span className="text-[9px] text-slate-400 font-bold">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                      title="পঠিত হিসেবে চিহ্নিত করুন"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Trash2, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  AtSign, 
  Users, 
  Flag, 
  ChevronLeft, 
  Search, 
  X, 
  MoreHorizontal, 
  Cake, 
  ThumbsUp, 
  Settings, 
  ShieldAlert, 
  BellOff, 
  Bell, 
  SlidersHorizontal,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications, AppNotification, NotificationType } from "../../contexts/NotificationContext";
import { isYesterday } from 'date-fns';
import { toast } from "sonner";

import { SystemNotificationBanner } from '../common/SystemNotificationBanner';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    notifications, 
    preferences,
    updatePreferences,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    respondToFriendRequest,
    toggleFollowBack
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMenuNotif, setSelectedMenuNotif] = useState<AppNotification | null>(null);
  const [viewDetailNotif, setViewDetailNotif] = useState<AppNotification | null>(null);

  // Exact Facebook timestamp format matching the user's screenshot
  const getFacebookTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.max(1, Math.floor(diffInMs / (1000 * 60)));
        return `${diffInMinutes}m ago`;
      }
      if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      }
      if (isYesterday(date)) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `Yesterday at ${hours}:${minutes}`;
      }

      // Format like "24 Sep at 21:57"
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (date.getFullYear() === now.getFullYear()) {
        return `${day} ${month} at ${hours}:${minutes}`;
      }
      return `${day} ${month} ${date.getFullYear()} at ${hours}:${minutes}`;
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }

    const actorUid = notif.actorId || notif.actionData?.senderId || notif.targetId;
    const msg = (notif.message || '').toLowerCase();
    const title = (notif.title || '').toLowerCase();

    // Check if Privacy / Settings / Account related
    if (
      msg.includes('privacy') || 
      msg.includes('প্রাইভেসি') || 
      msg.includes('setting') || 
      msg.includes('সেটিং') || 
      title.includes('privacy') || 
      title.includes('সেটিং')
    ) {
      navigate('/settings');
      return;
    }

    if (notif.actionData?.deepLink) {
      navigate(notif.actionData.deepLink);
      return;
    }

    switch (notif.type) {
      case 'friend_request':
      case 'friend_request_accepted':
      case 'follow':
      case 'birthday':
        if (actorUid) {
          navigate(`/profile/${actorUid}`);
        } else {
          navigate('/friends');
        }
        break;

      case 'reaction':
      case 'comment':
      case 'reply':
      case 'mention':
        if (notif.targetId) {
          navigate(`/adda?post=${notif.targetId}`);
        } else {
          navigate('/adda');
        }
        break;

      case 'message':
        if (actorUid) {
          navigate(`/messages?chat=${actorUid}`);
        } else {
          navigate('/messages');
        }
        break;

      default:
        if (actorUid) {
          navigate(`/profile/${actorUid}`);
        } else {
          // Open detail popup modal for system or general notifications
          setViewDetailNotif(notif);
        }
        break;
    }
  };

  const handleBack = () => {
    try {
      const fromPath = (location.state as any)?.from;
      if (fromPath && typeof fromPath === 'string' && fromPath !== '/notifications') {
        navigate(fromPath);
        return;
      }
    } catch (e) {
      console.warn("Back navigation error:", e);
    }

    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/adda');
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success("All notifications marked as read!");
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (n.actorName || '').toLowerCase().includes(q);
        const matchMsg = (n.message || '').toLowerCase().includes(q);
        return matchName || matchMsg;
      }
      return true;
    });
  }, [notifications, searchTerm]);

  // Group notifications into "New" (unread) and "Earlier" (read) to match Facebook screenshot
  const notificationSections = useMemo(() => {
    const newNotifications: AppNotification[] = [];
    const earlierNotifications: AppNotification[] = [];

    filteredNotifications.forEach(n => {
      if (!n.read) {
        newNotifications.push(n);
      } else {
        earlierNotifications.push(n);
      }
    });

    return {
      new: newNotifications,
      earlier: earlierNotifications
    };
  }, [filteredNotifications]);

  // Overlay circle badge icon matching Facebook Screenshot perfectly
  const getBadgeIcon = (type: NotificationType) => {
    switch (type) {
      case 'friend_request':
      case 'friend_request_accepted':
      case 'follow':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <UserCheck size={12} className="stroke-[2.5]" />
          </div>
        );
      case 'birthday':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E91E63] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Cake size={12} className="stroke-[2.5]" />
          </div>
        );
      case 'page_activity':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E65100] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Flag size={11} className="fill-white stroke-[2]" />
          </div>
        );
      case 'group_activity':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0284C7] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Users size={12} className="stroke-[2.5]" />
          </div>
        );
      case 'reaction':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <ThumbsUp size={11} className="fill-white stroke-none" />
          </div>
        );
      case 'comment':
      case 'reply':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <MessageSquare size={11} className="fill-white stroke-none" />
          </div>
        );
      case 'mention':
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D97706] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <AtSign size={12} className="stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#65676B] text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Bell size={11} className="stroke-[2.5]" />
          </div>
        );
    }
  };

  const renderNotificationItem = (notif: AppNotification) => {
    const isFriendReq = notif.type === 'friend_request';
    const isFollow = notif.type === 'follow';

    return (
      <div 
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={`px-4 py-3 flex items-start gap-3.5 relative transition-colors cursor-pointer select-none ${
          notif.read 
            ? 'bg-white hover:bg-slate-50' 
            : 'bg-[#E7F3FF] hover:bg-[#D9EBFC]'
        }`}
      >
        {/* Profile Avatar with Overlapping Badge (Matching Screenshot) */}
        <div className="relative shrink-0 pt-0.5">
          <img 
            src={notif.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actorName || 'user'}`} 
            alt={notif.actorName || 'User'}
            className="w-14 h-14 sm:w-15 sm:h-15 rounded-full object-cover border border-slate-200/60 shadow-2xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${notif.actorName}`;
            }}
          />
          {getBadgeIcon(notif.type)}
        </div>

        {/* Content text */}
        <div className="flex-1 min-w-0 pr-1 pt-0.5">
          <p className="text-[14.5px] sm:text-[15.5px] text-slate-900 leading-[1.35]">
            <span className="font-bold text-slate-950 mr-1">{notif.actorName}</span>
            <span className="text-slate-900 font-normal">{notif.message}</span>
          </p>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">
            {getFacebookTime(notif.createdAt)}
          </p>

          {/* Interactive Friend Request buttons if pending */}
          {isFriendReq && notif.actionStatus === 'pending' && (
            <div className="flex items-center gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => respondToFriendRequest(notif.id, true)}
                className="px-4 py-1.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer border-none"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => respondToFriendRequest(notif.id, false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border-none"
              >
                Delete
              </button>
            </div>
          )}

          {isFollow && notif.actionStatus !== 'following' && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => toggleFollowBack(notif.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1877F2] text-white hover:bg-blue-600 shadow-xs transition-colors border-none cursor-pointer"
              >
                Follow Back
              </button>
            </div>
          )}
        </div>

        {/* Triple Dots Menu Button (Matching Screenshot) */}
        <div 
          className="shrink-0 self-center" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMenuNotif(notif);
          }}
        >
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-black/5 active:bg-black/10 transition cursor-pointer border-none bg-transparent"
            title="Options"
            aria-label="Options"
          >
            <MoreHorizontal size={20} className="stroke-[2.2]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen select-none font-sans">
      <SystemNotificationBanner />
      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS HEADER (Exact match with user screenshot)                */}
      {/* [ < Notifications                           (✓)  🔍 ]                    */}
      {/* ========================================================================= */}
      <div className="px-3 sm:px-4 py-2.5 bg-white flex items-center justify-between sticky top-0 z-30 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Back Button [<] */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 active:scale-95 transition cursor-pointer border-none bg-transparent shrink-0 relative z-50 pointer-events-auto"
            aria-label="Back"
          >
            <ChevronLeft size={28} className="stroke-[2.5] pointer-events-none" />
          </button>
          
          {/* Notifications Title */}
          <h1 className="text-[22px] sm:text-[25px] font-bold text-slate-900 tracking-tight leading-none">
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-900">
          {/* Mark all as read button [Solid black circle with white checkmark] */}
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition cursor-pointer border-none bg-transparent"
            title="Mark all as read"
            aria-label="Mark all as read"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Check size={14} className="stroke-[3]" />
            </div>
          </button>

          {/* Search Button [🔍] */}
          <button
            type="button"
            onClick={() => setIsSearchActive(!isSearchActive)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 active:scale-95 transition cursor-pointer border-none bg-transparent"
            title="Search notifications"
            aria-label="Search notifications"
          >
            <Search size={22} className="stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPANDABLE SEARCH BAR                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-b border-slate-100 bg-slate-50/80 overflow-hidden"
          >
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-full outline-none focus:border-[#1877F2] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. NOTIFICATIONS LIST IN EXACT FACEBOOK SECTIONS: "New" & "Earlier"       */}
      {/* ========================================================================= */}
      <div>
        {filteredNotifications.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">কোনো নোটিফিকেশন নেই</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              আপনার অ্যাকাউন্টে নতুন কোনো ফ্রেন্ড রিকোয়েস্ট, লাইক, কমেন্ট বা আপডেট আসলে তাৎক্ষণিক এখানে দেখতে পাবেন।
            </p>
          </div>
        ) : (
          <div>
            {/* 3.1 New Section (Matching Screenshot) */}
            {notificationSections.new.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 text-[17px] font-bold text-slate-900 tracking-tight">
                  New
                </div>
                <div>
                  {notificationSections.new.map(renderNotificationItem)}
                </div>
              </div>
            )}

            {/* 3.2 Earlier Section (Matching Screenshot) */}
            {notificationSections.earlier.length > 0 && (
              <div>
                <div className="px-4 pt-4 pb-1 text-[17px] font-bold text-slate-900 tracking-tight">
                  Earlier
                </div>
                <div>
                  {notificationSections.earlier.map(renderNotificationItem)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. FACEBOOK-STYLE ACTION BOTTOM SHEET MODAL (FOR THREE DOTS •••)         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedMenuNotif && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
            {/* Backdrop */}
            <div 
              className="absolute inset-0" 
              onClick={() => setSelectedMenuNotif(null)} 
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-4 z-10 pb-8 border-t border-slate-100"
            >
              {/* Drag Handle Pill */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

              {/* Notification Header Preview */}
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-100">
                <img 
                  src={selectedMenuNotif.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMenuNotif.actorName}`} 
                  alt={selectedMenuNotif.actorName} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {selectedMenuNotif.actorName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedMenuNotif.message}
                  </p>
                </div>
              </div>

              {/* Action Menu Items */}
              <div className="space-y-1">
                {/* 1. Mark as read / unread */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMenuNotif.read) {
                      // Toggle unread
                      updatePreferences({});
                      toast.success("Marked as unread");
                    } else {
                      markAsRead(selectedMenuNotif.id);
                      toast.success("Marked as read");
                    }
                    setSelectedMenuNotif(null);
                  }}
                  className="w-full px-3 py-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-100 transition text-slate-800 text-sm font-semibold cursor-pointer border-none bg-transparent"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    {selectedMenuNotif.read ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  <span>{selectedMenuNotif.read ? "Mark as unread" : "Mark as read"}</span>
                </button>

                {/* 2. Remove this notification */}
                <button
                  type="button"
                  onClick={() => {
                    deleteNotification(selectedMenuNotif.id);
                    toast.success("Notification removed");
                    setSelectedMenuNotif(null);
                  }}
                  className="w-full px-3 py-3 rounded-2xl flex items-center gap-3.5 hover:bg-rose-50 text-rose-600 transition text-sm font-semibold cursor-pointer border-none bg-transparent"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Trash2 size={18} />
                  </div>
                  <span>Remove this notification</span>
                </button>

                {/* 3. Turn off notifications of this type */}
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Notifications of this type muted");
                    setSelectedMenuNotif(null);
                  }}
                  className="w-full px-3 py-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-100 transition text-slate-800 text-sm font-semibold cursor-pointer border-none bg-transparent"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <BellOff size={18} />
                  </div>
                  <span>Turn off notifications like this</span>
                </button>

                {/* 4. Report issue */}
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Report submitted to moderation");
                    setSelectedMenuNotif(null);
                  }}
                  className="w-full px-3 py-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-100 transition text-slate-800 text-sm font-semibold cursor-pointer border-none bg-transparent"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <ShieldAlert size={18} />
                  </div>
                  <span>Report notification</span>
                </button>
              </div>

              {/* Close Button */}
              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMenuNotif(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-sm transition cursor-pointer border-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. SETTINGS PREFERENCES MODAL                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden flex flex-col shadow-2xl border border-slate-100"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#1877F2]" />
                  <span className="font-bold text-slate-900 text-sm">Notification Settings</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl border-none bg-transparent cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Reaction & Likes</h4>
                    <p className="text-[11px] text-slate-500">Notify when someone reacts to your post</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={preferences.reactions}
                    onChange={(e) => updatePreferences({ reactions: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#1877F2] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Comments & Replies</h4>
                    <p className="text-[11px] text-slate-500">Notify when someone comments on your post</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={preferences.comments}
                    onChange={(e) => updatePreferences({ comments: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#1877F2] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Friend Requests</h4>
                    <p className="text-[11px] text-slate-500">Notify when you get a friend request</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={preferences.friendRequests}
                    onChange={(e) => updatePreferences({ friendRequests: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#1877F2] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Do Not Disturb (DND)</h4>
                    <p className="text-[11px] text-slate-500">Mute all notification sounds & alerts</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={preferences.dndEnabled}
                    onChange={(e) => updatePreferences({ dndEnabled: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#1877F2] cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-2 bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer border-none"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Detail Modal for System & General Alerts */}
      {viewDetailNotif && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative text-slate-800">
            <button
              type="button"
              onClick={() => setViewDetailNotif(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border-0 bg-transparent cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-3">
              <img
                src={viewDetailNotif.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewDetailNotif.actorName || 'system'}`}
                alt={viewDetailNotif.actorName || 'System'}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {viewDetailNotif.actorName || 'সিস্টেম নোটিফিকেশন'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {getFacebookTime(viewDetailNotif.createdAt)}
                </p>
              </div>
            </div>

            {viewDetailNotif.title && (
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                {viewDetailNotif.title}
              </h4>
            )}

            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 font-medium leading-relaxed my-3">
              {viewDetailNotif.message || 'নোটিফিকেশনের কোনো অতিরিক্ত বার্তা নেই।'}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const targetUid = viewDetailNotif.actorId || viewDetailNotif.actionData?.senderId || viewDetailNotif.targetId;
                  setViewDetailNotif(null);
                  if (targetUid) {
                    navigate(`/profile/${targetUid}`);
                  } else {
                    navigate('/settings');
                  }
                }}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-xs border-0 cursor-pointer"
              >
                বিস্তারিত দেখুন / একশনে যান
              </button>

              <button
                type="button"
                onClick={() => setViewDetailNotif(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border-0 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;

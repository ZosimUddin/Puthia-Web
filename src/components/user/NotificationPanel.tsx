import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  X, 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  MessageSquare, 
  AtSign, 
  Users, 
  Flag, 
  ShoppingBag, 
  Radio, 
  Sparkles, 
  CornerDownRight,
  Pin,
  ShieldAlert,
  Send,
  ExternalLink,
  Layers,
  Settings,
  Flame,
  Calendar,
  AlertTriangle,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useNotifications, AppNotification, NotificationType } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'sonner';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'dropdown' | 'modal';
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, mode = 'dropdown' }) => {
  const { 
    notifications, 
    groupedNotifications,
    unreadCount, 
    preferences,
    isGroupingEnabled,
    setIsGroupingEnabled,
    updatePreferences,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    respondToFriendRequest,
    toggleFollowBack,
    togglePinNotification,
    sendQuickReply
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'security'>('all');
  const [quickReplyId, setQuickReplyId] = useState<string | null>(null);
  const [quickReplyText, setQuickReplyText] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'modal') return; // Handled by backdrop overlay

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, mode]);

  const activeList = isGroupingEnabled ? groupedNotifications : notifications;

  const filteredList = useMemo(() => {
    return activeList.filter(n => {
      if (activeFilter === 'unread') return !n.read;
      if (activeFilter === 'security') return n.type === 'security_alert' || n.priority === 'critical';
      return true;
    });
  }, [activeList, activeFilter]);

  // Group by Date: Today, Yesterday, Earlier
  const dateBuckets = useMemo(() => {
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    filteredList.forEach(n => {
      const d = new Date(n.createdAt);
      if (isToday(d)) {
        today.push(n);
      } else if (isYesterday(d)) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredList]);

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) markAsRead(notif.id);
    onClose();

    if (notif.actionData?.deepLink) {
      navigate(notif.actionData.deepLink);
      return;
    }

    switch (notif.type) {
      case 'reaction':
      case 'comment':
      case 'reply':
      case 'mention':
        navigate(`/adda?post=${notif.targetId}`);
        break;
      case 'friend_request':
      case 'friend_request_accepted':
      case 'follow':
        navigate(`/profile?uid=${notif.targetId}`);
        break;
      case 'message':
        navigate(`/chat?user=${notif.targetId}`);
        break;
      case 'group_activity':
        navigate(`/group/${notif.targetId}`);
        break;
      case 'page_activity':
        navigate(`/page/${notif.targetId}`);
        break;
      case 'reel_interaction':
        navigate(`/adda?tab=reels&reel=${notif.targetId}`);
        break;
      case 'story_interaction':
        navigate(`/adda?story=${notif.targetId}`);
        break;
      case 'marketplace':
        navigate(`/marketplace/item/${notif.targetId}`);
        break;
      case 'live':
        navigate(`/live`);
        break;
      case 'event':
        navigate(`/events?event=${notif.targetId}`);
        break;
      case 'security_alert':
        navigate(`/profile?tab=security`);
        break;
      default:
        navigate('/notifications');
        break;
    }
  };

  const toBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(digit => {
      const parsed = parseInt(digit);
      return isNaN(parsed) ? digit : bengaliDigits[parsed];
    }).join('');
  };

  const getRelativeTime = (time: number) => {
    try {
      return formatDistanceToNow(time, { addSuffix: true, locale: bn });
    } catch {
      return 'কিছুক্ষণ আগে';
    }
  };

  const getIconForType = (type: NotificationType, priority?: string) => {
    if (type === 'security_alert' || priority === 'critical') {
      return <ShieldAlert size={14} className="text-red-500" />;
    }
    switch(type) {
      case 'reaction': return <Heart size={14} className="text-rose-500 fill-rose-500" />;
      case 'comment': return <MessageCircle size={14} className="text-emerald-600 fill-emerald-100" />;
      case 'reply': return <CornerDownRight size={14} className="text-indigo-600" />;
      case 'friend_request': return <UserPlus size={14} className="text-blue-600" />;
      case 'friend_request_accepted': return <UserCheck size={14} className="text-teal-600" />;
      case 'follow': return <UserCheck size={14} className="text-teal-600" />;
      case 'mention': return <AtSign size={14} className="text-amber-600" />;
      case 'message': return <MessageSquare size={14} className="text-purple-600" />;
      case 'group_activity': return <Users size={14} className="text-cyan-600" />;
      case 'page_activity': return <Flag size={14} className="text-emerald-700" />;
      case 'reel_interaction': return <Flame size={14} className="text-orange-500" />;
      case 'story_interaction': return <Sparkles size={14} className="text-fuchsia-600" />;
      case 'live': return <Radio size={14} className="text-red-600 animate-pulse" />;
      case 'event': return <Calendar size={14} className="text-blue-600" />;
      case 'marketplace': return <ShoppingBag size={14} className="text-orange-600" />;
      case 'moderation': return <AlertTriangle size={14} className="text-amber-500" />;
      default: return <Bell size={14} className="text-slate-500" />;
    }
  };

  const renderNotificationCard = (notif: AppNotification) => {
    const isSecurity = notif.type === 'security_alert' || notif.priority === 'critical';
    const isFriendReq = notif.type === 'friend_request';
    const isFollow = notif.type === 'follow';
    const isMessage = notif.type === 'message';

    return (
      <div 
        key={notif.id}
        onClick={() => handleNotificationClick(notif)}
        className={`group relative p-3 sm:p-3.5 transition-all border-b border-slate-100/90 cursor-pointer ${
          notif.read 
            ? 'bg-white hover:bg-slate-50/90' 
            : isSecurity 
              ? 'bg-red-50/60 hover:bg-red-50/80 border-l-4 border-l-red-500' 
              : 'bg-emerald-50/40 hover:bg-emerald-50/60 border-l-4 border-l-[#006a4e]'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with type badge */}
          <div className="relative shrink-0">
            <img 
              src={notif.actorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={notif.actorName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${notif.actorName}`;
              }}
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs ${
              isSecurity ? 'bg-red-100' : 'bg-slate-100'
            }`}>
              {getIconForType(notif.type, notif.priority)}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {notif.actorName}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                <Clock size={10} />
                {getRelativeTime(notif.createdAt)}
              </span>
            </div>

            <p className={`text-xs mt-0.5 leading-relaxed ${
              notif.read ? 'text-slate-600' : 'text-slate-900 font-semibold'
            }`}>
              {notif.message}
            </p>

            {/* If there's an aggregation badge */}
            {notif.actionData?.aggregateCount && notif.actionData.aggregateCount > 1 && (
              <div className="mt-1.5 flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                <Layers size={11} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600">
                  {toBengaliNumber(notif.actionData.aggregateCount)} টি সম্মিলিত প্রতিক্রিয়া
                </span>
              </div>
            )}

            {/* Friend Request Interactive Action Buttons */}
            {isFriendReq && notif.actionStatus === 'pending' && (
              <div 
                className="flex items-center gap-2 mt-2.5" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => respondToFriendRequest(notif.id, true)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Check size={13} />
                  অনুমোদন করুন
                </button>
                <button
                  onClick={() => respondToFriendRequest(notif.id, false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  মুছে ফেলুন
                </button>
              </div>
            )}

            {isFriendReq && notif.actionStatus === 'accepted' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md mt-2">
                <Check size={12} />
                অনুরোধ অনুমোদিত হয়েছে
              </span>
            )}

            {/* Follow Interactive Action Button */}
            {isFollow && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleFollowBack(notif.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    notif.actionStatus === 'following'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <UserPlus size={12} />
                  {notif.actionStatus === 'following' ? 'ফলো করা হচ্ছে' : 'ফলো ব্যাক করুন'}
                </button>
              </div>
            )}

            {/* Message Quick Reply Button & Inline Form */}
            {isMessage && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                {quickReplyId === notif.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (quickReplyText.trim()) {
                        sendQuickReply(notif.id, quickReplyText);
                        setQuickReplyText("");
                        setQuickReplyId(null);
                      }
                    }}
                    className="flex items-center gap-1.5 mt-1"
                  >
                    <input 
                      type="text"
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      placeholder="দ্রুত উত্তর লিখুন..."
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Send size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickReplyId(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setQuickReplyId(notif.id)}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    <MessageSquare size={11} />
                    দ্রুত উত্তর দিন
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions on hover: Read/Delete */}
          <div className="flex flex-col items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!notif.read && (
              <button
                onClick={() => markAsRead(notif.id)}
                title="পঠিত হিসেবে চিহ্নিত করুন"
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 flex items-center justify-center text-slate-400 transition-colors"
              >
                <Check size={12} />
              </button>
            )}
            <button
              onClick={() => deleteNotification(notif.id)}
              title="মুছে ফেলুন"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const panelBody = (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[99999] bg-[#f8fafc] text-slate-900 flex flex-col w-full h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white relative flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0"
            title="ফিরে যান"
          >
            <ArrowLeft size={22} className="sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/10 text-emerald-300 flex items-center justify-center font-bold shrink-0">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2 min-w-0">
                <span className="truncate">নোটিফিকেশন</span>
                {unreadCount > 0 && (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shrink-0">
                    {toBengaliNumber(unreadCount)} নতুন
                  </span>
                )}
              </h3>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {/* Sound Toggle */}
          <button
            onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
            title={preferences.soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            className={`p-2 rounded-xl text-xs transition-colors shrink-0 ${
              preferences.soundEnabled ? 'text-emerald-300 bg-white/20' : 'text-emerald-100/60 hover:bg-white/10'
            }`}
          >
            {preferences.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Grouping Toggle */}
          <button
            onClick={() => {
              setIsGroupingEnabled(!isGroupingEnabled);
              toast.info(isGroupingEnabled ? "গ্রুপিং বন্ধ করা হয়েছে" : "সম্মিলিত নোটিফিকেশন গ্রুপিং চালু হয়েছে");
            }}
            title={isGroupingEnabled ? "গ্রুপিং বন্ধ করুন" : "একই নোটিফিকেশন গ্রুপ করুন"}
            className={`p-2 rounded-xl text-xs transition-colors shrink-0 ${
              isGroupingEnabled ? 'text-emerald-300 bg-white/20' : 'text-emerald-100/60 hover:bg-white/10'
            }`}
          >
            <Layers size={16} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="সব পঠিত করুন"
              className="p-2 rounded-xl text-emerald-100/80 hover:bg-white/10 text-xs font-bold shrink-0"
            >
              <Check size={16} />
            </button>
          )}

          <button
            onClick={onClose}
            title="বন্ধ করুন"
            className="p-2 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Sub Navigation / Filters */}
      <div className="px-4 py-2.5 border-b border-slate-200/80 bg-white shrink-0 shadow-xs">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-[#006a4e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব ({toBengaliNumber(activeList.length)})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeFilter === 'unread'
                ? 'bg-[#006a4e] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            অপঠিত ({toBengaliNumber(unreadCount)})
          </button>
          <button
            onClick={() => setActiveFilter('security')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              activeFilter === 'security'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <ShieldAlert size={12} />
            নিরাপত্তা
          </button>
        </div>
      </div>

      {/* Chronological List of Notifications */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center my-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell size={28} />
            </div>
            <p className="text-base font-bold text-slate-700">কোনো নোটিফিকেশন নেই</p>
            <p className="text-xs text-slate-400 mt-1">সব নতুন কার্যকলাপের নোটিফিকেশন এখানে দেখা যাবে।</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            {/* 1. TODAY */}
            {dateBuckets.today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100">
                  <span>আজকে (Today)</span>
                  <span className="text-slate-400 font-normal">({toBengaliNumber(dateBuckets.today.length)})</span>
                </div>
                {dateBuckets.today.map(renderNotificationCard)}
              </div>
            )}

            {/* 2. YESTERDAY */}
            {dateBuckets.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100">
                  <span>গতকাল (Yesterday)</span>
                  <span className="text-slate-400 font-normal">({toBengaliNumber(dateBuckets.yesterday.length)})</span>
                </div>
                {dateBuckets.yesterday.map(renderNotificationCard)}
              </div>
            )}

            {/* 3. EARLIER */}
            {dateBuckets.earlier.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 border-b border-slate-100">
                  <span>পূর্বে (Earlier)</span>
                  <span className="text-slate-400 font-normal">({toBengaliNumber(dateBuckets.earlier.length)})</span>
                </div>
                {dateBuckets.earlier.map(renderNotificationCard)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer View All */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 shrink-0 shadow-xs">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              navigate('/notifications?tab=settings');
            }}
            className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Settings size={15} />
            সেটিংস
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/notifications');
            }}
            className="text-xs sm:text-sm font-extrabold text-[#006a4e] hover:text-[#00523d] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            সব নোটিফিকেশন সেন্টার
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && panelBody}
    </AnimatePresence>,
    document.body
  );
};

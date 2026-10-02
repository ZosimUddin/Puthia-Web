import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  X, 
  MessageCircle, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  UserMinus,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  limit, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { toast } from 'sonner';
import { AddaFacebookHeader } from '../../components/adda/AddaFacebookHeader';
import { SEO } from '../../components/SEO';
import { AuthModal } from '../../components/AuthModal';
import { chatService } from '../../services/chatService';
import { UserInfo } from '../../types';

export interface FriendRequestItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderUnion?: string;
  receiverId: string;
  receiverName?: string;
  receiverAvatar?: string;
  receiverUnion?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

import { SystemNotificationBanner } from '../../components/common/SystemNotificationBanner';

export const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'suggestions' | 'friends' | 'requests' | 'sent'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Real-time Firestore state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<FriendRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Unfriend modal confirm
  const [unfriendModalTarget, setUnfriendModalTarget] = useState<any | null>(null);

  // 1. Subscribe to all registered users in Firestore
  useEffect(() => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(100));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const uList: any[] = [];
        snapshot.forEach((d) => {
          uList.push({ uid: d.id, id: d.id, ...d.data() });
        });
        setAllUsers(uList);
        setLoading(false);
      }, (err) => {
        console.warn("Failed to subscribe users:", err);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Users subscription error", e);
      setLoading(false);
    }
  }, []);

  // 2. Subscribe to incoming friend requests for current user
  useEffect(() => {
    if (!user) {
      setIncomingRequests([]);
      return;
    }
    try {
      const q = query(
        collection(db, 'friend_requests'),
        where('receiverId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const incoming: FriendRequestItem[] = [];
        const accepted: FriendRequestItem[] = [];
        snapshot.forEach((d) => {
          const data = { id: d.id, ...d.data() } as FriendRequestItem;
          if (data.status === 'pending') {
            incoming.push(data);
          } else if (data.status === 'accepted') {
            accepted.push(data);
          }
        });
        setIncomingRequests(incoming);
      }, (err) => {
        console.warn("Failed to subscribe incoming requests:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Incoming requests error", e);
    }
  }, [user]);

  // 3. Subscribe to outgoing friend requests by current user
  useEffect(() => {
    if (!user) {
      setOutgoingRequests([]);
      setAcceptedRequests([]);
      return;
    }
    try {
      const q = query(
        collection(db, 'friend_requests'),
        where('senderId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const outgoing: FriendRequestItem[] = [];
        const accepted: FriendRequestItem[] = [];
        snapshot.forEach((d) => {
          const data = { id: d.id, ...d.data() } as FriendRequestItem;
          if (data.status === 'pending') {
            outgoing.push(data);
          } else if (data.status === 'accepted') {
            accepted.push(data);
          }
        });
        setOutgoingRequests(outgoing);
        setAcceptedRequests(prev => {
          const map = new Map<string, FriendRequestItem>();
          [...prev, ...accepted].forEach(item => map.set(item.id, item));
          return Array.from(map.values());
        });
      }, (err) => {
        console.warn("Failed to subscribe outgoing requests:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Outgoing requests error", e);
    }
  }, [user]);

  // 100% Real Registered Firestore Users Only (No Demo / Mock Citizens)
  const realUsers = useMemo(() => {
    const map = new Map<string, any>();
    allUsers.forEach(u => {
      const id = u.uid || u.id;
      if (id && (u.name || u.displayName || u.email || u.username)) {
        map.set(id, u);
      }
    });
    return Array.from(map.values());
  }, [allUsers]);

  // Derived: Current User's Accepted Friends List
  const friendsList = useMemo(() => {
    if (!user) return [];
    
    // Set of friend UIDs from accepted requests & profile.friends
    const friendUids = new Set<string>();
    
    // From accepted requests
    acceptedRequests.forEach(req => {
      if (req.senderId === user.uid) friendUids.add(req.receiverId);
      if (req.receiverId === user.uid) friendUids.add(req.senderId);
    });

    // From userProfile friends array if available
    if (Array.isArray(userProfile?.friends)) {
      userProfile.friends.forEach((fId: string) => friendUids.add(fId));
    }

    return realUsers.filter(u => friendUids.has(u.uid || u.id) && (u.uid || u.id) !== user.uid);
  }, [user, userProfile, acceptedRequests, realUsers]);

  // Derived: Suggested Users (People You May Know - 100% Real Users)
  const suggestionsList = useMemo(() => {
    const friendUids = new Set(friendsList.map(f => f.uid || f.id));
    const outgoingTargetUids = new Set(outgoingRequests.map(r => r.receiverId));
    const incomingSenderUids = new Set(incomingRequests.map(r => r.senderId));

    return realUsers.filter(u => {
      const uId = u.uid || u.id;
      if (user && uId === user.uid) return false;
      if (friendUids.has(uId)) return false;
      if (outgoingTargetUids.has(uId)) return false;
      if (incomingSenderUids.has(uId)) return false;
      return true;
    });
  }, [user, realUsers, friendsList, outgoingRequests, incomingRequests]);

  // Filtered lists based on search
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return suggestionsList;
    const q = searchQuery.toLowerCase();
    return suggestionsList.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.displayName?.toLowerCase().includes(q) ||
      u.union?.toLowerCase().includes(q) ||
      u.village?.toLowerCase().includes(q)
    );
  }, [suggestionsList, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friendsList;
    const q = searchQuery.toLowerCase();
    return friendsList.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.displayName?.toLowerCase().includes(q) ||
      u.union?.toLowerCase().includes(q) ||
      u.village?.toLowerCase().includes(q)
    );
  }, [friendsList, searchQuery]);

  // Action: Send Friend Request
  const handleSendRequest = async (targetUser: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const targetUid = targetUser.uid || targetUser.id;
    if (!targetUid || targetUid === user.uid) return;

    setActionLoadingId(targetUid);
    const requestId = `${user.uid}_${targetUid}`;

    try {
      // 1. Create document in friend_requests collection
      await setDoc(doc(db, 'friend_requests', requestId), {
        id: requestId,
        senderId: user.uid,
        senderName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
        senderAvatar: userProfile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
        senderUnion: userProfile?.union || 'পুঠিয়া',
        receiverId: targetUid,
        receiverName: targetUser.name || targetUser.displayName || 'সম্মানিত নাগরিক',
        receiverAvatar: targetUser.photoURL || targetUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${targetUid}`,
        receiverUnion: targetUser.union || 'পুঠিয়া',
        status: 'pending',
        createdAt: Date.now()
      });

      // 2. Synchronize user docs arrays
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          friendRequestsSent: arrayUnion(targetUid)
        });
        await updateDoc(doc(db, 'users', targetUid), {
          friendRequestsReceived: arrayUnion(user.uid)
        });
      } catch (e) {
        // Safe fallback if user doc rules restrict
      }

      // 3. Dispatch real notification to target user
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: targetUid,
          title: '👤 নতুন ফ্রেন্ড রিকোয়েস্ট',
          message: `${userProfile?.name || user.displayName || 'একজন পুঠিয়াবাসী'} আপনাকে বন্ধুত্বের অনুরোধ পাঠিয়েছেন।`,
          type: 'friend_request',
          link: '/friends',
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Notification dispatch skipped:", e);
      }

      toast.success(`${targetUser.name || 'ব্যবহারকারী'}-কে বন্ধুত্বের অনুরোধ পাঠানো হয়েছে!`);
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error("অনুরোধ পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Cancel Outgoing Friend Request
  const handleCancelRequest = async (targetUid: string) => {
    if (!user) return;
    setActionLoadingId(targetUid);
    const requestId = `${user.uid}_${targetUid}`;

    try {
      await deleteDoc(doc(db, 'friend_requests', requestId));

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          friendRequestsSent: arrayRemove(targetUid)
        });
        await updateDoc(doc(db, 'users', targetUid), {
          friendRequestsReceived: arrayRemove(user.uid)
        });
      } catch (e) {}

      toast.success("অনুরোধ প্রত্যাহার করা হয়েছে।");
    } catch (err) {
      console.error("Error canceling request:", err);
      toast.error("অনুরোধ বাতিল করা যায়নি।");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Accept / Confirm Incoming Friend Request
  const handleAcceptRequest = async (req: FriendRequestItem) => {
    if (!user) return;
    setActionLoadingId(req.senderId);

    try {
      // 1. Update request status to accepted
      await updateDoc(doc(db, 'friend_requests', req.id), {
        status: 'accepted',
        acceptedAt: Date.now()
      });

      // 2. Add each other to friends array
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          friends: arrayUnion(req.senderId),
          friendsCount: increment(1),
          friendRequestsReceived: arrayRemove(req.senderId)
        });
        await updateDoc(doc(db, 'users', req.senderId), {
          friends: arrayUnion(user.uid),
          friendsCount: increment(1),
          friendRequestsSent: arrayRemove(user.uid)
        });
      } catch (e) {}

      // 3. Dispatch notification to sender
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: req.senderId,
          title: '🤝 বন্ধুত্বের অনুরোধ গৃহীত হয়েছে!',
          message: `${userProfile?.name || user.displayName || 'আপনার বন্ধু'} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন।`,
          type: 'friend_accepted',
          link: `/profile/${user.uid}`,
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {}

      toast.success(`🤝 আপনি এখন ${req.senderName}-এর সাথে সংযুক্ত!`);
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error("রিকোয়েস্ট গ্রহণ করতে সমস্যা হয়েছে।");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Delete / Decline Incoming Friend Request
  const handleRejectRequest = async (req: FriendRequestItem) => {
    if (!user) return;
    setActionLoadingId(req.senderId);

    try {
      await deleteDoc(doc(db, 'friend_requests', req.id));

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          friendRequestsReceived: arrayRemove(req.senderId)
        });
        await updateDoc(doc(db, 'users', req.senderId), {
          friendRequestsSent: arrayRemove(user.uid)
        });
      } catch (e) {}

      toast.info("অনুরোধ মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Unfriend Confirmation & Execution
  const handleExecuteUnfriend = async () => {
    if (!user || !unfriendModalTarget) return;
    const targetUid = unfriendModalTarget.uid || unfriendModalTarget.id;

    try {
      // Find request docs if any
      const reqId1 = `${user.uid}_${targetUid}`;
      const reqId2 = `${targetUid}_${user.uid}`;
      await deleteDoc(doc(db, 'friend_requests', reqId1)).catch(() => {});
      await deleteDoc(doc(db, 'friend_requests', reqId2)).catch(() => {});

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          friends: arrayRemove(targetUid),
          friendsCount: increment(-1)
        });
        await updateDoc(doc(db, 'users', targetUid), {
          friends: arrayRemove(user.uid),
          friendsCount: increment(-1)
        });
      } catch (e) {}

      toast.success(`${unfriendModalTarget.name || 'বন্ধু'}-কে ফ্রেন্ডলিস্ট থেকে সরানো হয়েছে।`);
      setUnfriendModalTarget(null);
    } catch (err) {
      console.error("Error unfriending:", err);
      toast.error("আনফ্রেন্ড করা সম্ভব হয়নি।");
    }
  };

  // Action: Open or Start Direct Chat with a Friend
  const handleOpenChatWithFriend = async (friend: any) => {
    const friendUid = friend.uid || friend.id;
    if (!friendUid) return;

    if (!user) {
      toast.error("মেসেজ পাঠাতে অনুগ্রহ করে লগইন করুন");
      return;
    }

    const friendUser: UserInfo = {
      uid: friendUid,
      name: friend.name || friend.displayName || 'বন্ধু',
      photoURL: friend.photoURL || friend.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friendUid}`,
      isOnline: Boolean(friend.isOnline ?? true)
    };

    const currentUserInfo: UserInfo = {
      uid: user.uid,
      name: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
      photoURL: userProfile?.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      isOnline: true
    };

    try {
      setActionLoadingId(friendUid);
      const convId = await chatService.startDirectConversation(currentUserInfo, friendUser);
      navigate(`/messages?chat=${convId}`, { state: { chatId: convId, targetUser: friendUser } });
    } catch (err) {
      console.error("Error starting conversation:", err);
      navigate('/messages');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans select-none">
      <SystemNotificationBanner />
      <SEO 
        title="বন্ধুরা - পুঠিয়া সোশ্যাল" 
        description="পুঠিয়া উপজেলার সহ-নাগরিকদের সাথে বন্ধুত্ব ও সংযোগ স্থাপন করুন।"
      />

      <AddaFacebookHeader />

      {/* Main Friends Canvas */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* ========================================================================= */}
        {/* 1. FACEBOOK STYLE FILTER PILLS                                           */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveFilter('requests')}
            className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-black transition-all border ${
              activeFilter === 'requests'
                ? 'bg-[#0B7A3B] text-white border-[#0B7A3B] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            অনুরোধ
            {incomingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('suggestions')}
            className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-black transition-all border ${
              activeFilter === 'suggestions'
                ? 'bg-[#0B7A3B] text-white border-[#0B7A3B] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            সাজেশন
          </button>

          <button
            onClick={() => setActiveFilter('friends')}
            className={`shrink-0 px-5 py-2 rounded-full text-[13px] font-black transition-all border ${
              activeFilter === 'friends'
                ? 'bg-[#0B7A3B] text-white border-[#0B7A3B] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            আমার বন্ধু
          </button>

          <button
            onClick={() => {}}
            className="shrink-0 px-5 py-2 rounded-full text-[13px] font-black bg-white text-slate-700 border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Search size={14} strokeWidth={3} />
            <span>খুঁজুন</span>
          </button>
        </div>

        {/* Section Title */}
        <div className="mb-4">
          <h2 className="text-[17px] font-black text-slate-800 flex items-center gap-2">
            <span>👋</span>
            <span>আপনি হয়তো চেনেন</span>
          </h2>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUGGESTIONS GRID (2-COLUMN)                                           */}
        {/* ========================================================================= */}
        {activeFilter === 'suggestions' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {loading ? (
              <div className="col-span-2 py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-[#0B7A3B]" />
                <span className="text-xs font-bold">লোড হচ্ছে...</span>
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-500 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                <p className="text-sm font-bold">এখনো কোনো সাজেশন নেই</p>
              </div>
            ) : (
              filteredSuggestions.map((targetUser) => {
                const targetUid = targetUser.uid || targetUser.id;
                const isPending = outgoingRequests.some(r => r.receiverId === targetUid);
                
                // Logic for matching context (village/union) like in screenshot
                const isSameUnion = userProfile?.union === targetUser.union;
                const matchText = isSameUnion ? "একই ইউনিয়ন/পৌরসভার" : "আপনার এলাকার";

                return (
                  <div 
                    key={targetUid}
                    className="bg-white rounded-[40px] p-5 border border-slate-100 shadow-xl shadow-slate-200/50 relative flex flex-col items-center text-center transition-transform active:scale-[0.98]"
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setAllUsers(prev => prev.filter(u => (u.uid || u.id) !== targetUid))}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-slate-100 hover:text-slate-400 transition cursor-pointer"
                    >
                      <X size={18} strokeWidth={2.5} />
                    </button>

                    {/* Profile Photo with Ring */}
                    <div className="relative mb-4 mt-1">
                       <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-full p-1 border-3 border-[#10B981]">
                          <img 
                            src={targetUser.photoURL || targetUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${targetUid}`} 
                            alt={targetUser.name}
                            className="w-full h-full rounded-full object-cover bg-slate-50"
                            referrerPolicy="no-referrer"
                          />
                       </div>
                    </div>

                    {/* Name & Info */}
                    <div className="mb-5 px-1 min-h-[90px] flex flex-col justify-center">
                       <h3 className="text-[16px] sm:text-[17px] font-black text-slate-900 leading-tight mb-1.5 line-clamp-2 px-1">
                         {targetUser.name || targetUser.displayName || 'নাগরিক'}
                       </h3>
                       <p className="text-[12px] font-black text-[#0B7A3B] mb-0.5">{matchText}</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                         {targetUser.union || targetUser.village || 'পুঠিয়া'} ইউনিয়ন
                       </p>
                    </div>

                    {/* Add Friend Button */}
                    <button
                      onClick={() => handleSendRequest(targetUser)}
                      disabled={isPending || actionLoadingId === targetUid}
                      className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all shadow-sm active:scale-95 ${
                        isPending 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-[#0B7A3B] text-white hover:bg-[#059669] shadow-emerald-200'
                      }`}
                    >
                      {isPending ? (
                        <span>অনুরোধ পাঠানো হয়েছে</span>
                      ) : (
                        <>
                          <UserPlus size={18} strokeWidth={3} />
                          <span>বন্ধু যোগ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SECTION CONTENT SWITCHER BY ACTIVE FILTER                              */}
        {/* ========================================================================= */}

        {/* TAB: YOUR FRIENDS */}
        {activeFilter === 'friends' && (
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                আপনার বন্ধুরা
              </h2>
              <span className="text-xs font-bold text-[#0B7A3B]">
                মোট {filteredFriends.length} জন
              </span>
            </div>

            {filteredFriends.length === 0 ? (
              <div className="py-14 text-center text-slate-500">
                <Users size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">আপনার এখনও কোনো বন্ধু যুক্ত নেই।</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  সাজেশন তালিকা থেকে পুঠিয়ার সহ-নাগরিকদের ফ্রেন্ড রিকোয়েস্ট পাঠিয়ে বন্ধুত্ব শুরু করুন!
                </p>
                <button
                  onClick={() => setActiveFilter('suggestions')}
                  className="mt-4 px-4 py-2 bg-[#0B7A3B] text-white text-xs font-black rounded-xl hover:bg-[#096330] transition cursor-pointer"
                >
                  বন্ধু সাজেশন দেখুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => {
                  const friendUid = friend.uid || friend.id;
                  return (
                    <div 
                      key={friendUid}
                      className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition"
                    >
                      <Link 
                        to={`/profile/${friendUid}`}
                        state={{ from: '/friends' }}
                        className="flex items-center gap-3 no-underline group flex-1 min-w-0"
                      >
                        <img 
                          src={friend.photoURL || friend.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friendUid}`} 
                          alt={friend.name || friend.displayName}
                          className="w-13 h-13 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B7A3B] transition truncate">
                            {friend.name || friend.displayName || 'বন্ধু'}
                          </div>
                          <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{friend.union ? `${friend.union} ইউনিয়ন` : 'পুঠিয়া'}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Chat & Unfriend Buttons */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenChatWithFriend(friend)}
                          disabled={actionLoadingId === (friend.uid || friend.id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0B7A3B] text-xs font-black rounded-lg sm:rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          title="মেসেজ পাঠান"
                        >
                          <MessageCircle size={14} />
                          <span>মেসেজ</span>
                        </button>

                        <button
                          onClick={() => setUnfriendModalTarget(friend)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition cursor-pointer"
                          title="আনফ্রেন্ড করুন"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: REQUESTS (INCOMING) */}
        {activeFilter === 'requests' && (
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                আগত ফ্রেন্ড রিকোয়েস্ট
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {incomingRequests.length}টি পেন্ডিং
              </span>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="py-14 text-center text-slate-500">
                <UserCheck size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">কোনো নতুন ফ্রেন্ড রিকোয়েস্ট নেই।</p>
                <p className="text-xs text-slate-400 mt-1">কেউ আপনাকে বন্ধুত্বের অনুরোধ পাঠালে তা এখানে প্রদর্শিত হবে।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition">
                    <Link 
                      to={`/profile/${req.senderId}`}
                      state={{ from: '/friends' }}
                      className="flex items-center gap-3 no-underline group flex-1 min-w-0"
                    >
                      <img 
                        src={req.senderAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.senderId}`} 
                        alt={req.senderName}
                        className="w-13 h-13 rounded-full object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B7A3B] transition truncate">
                          {req.senderName}
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{req.senderUnion || 'পুঠিয়া, রাজশাহী'}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        disabled={actionLoadingId === req.senderId}
                        className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#0B7A3B] hover:bg-[#096330] text-white text-xs font-black rounded-lg sm:rounded-xl transition shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        নিশ্চিত করুন
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req)}
                        disabled={actionLoadingId === req.senderId}
                        className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black rounded-lg sm:rounded-xl transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SENT REQUESTS */}
        {activeFilter === 'sent' && (
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                পাঠানো ফ্রেন্ড রিকোয়েস্ট
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {outgoingRequests.length}টি অনুরোধ অপেক্ষমান
              </span>
            </div>

            {outgoingRequests.length === 0 ? (
              <div className="py-14 text-center text-slate-500">
                <Clock size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">বর্তমানে কোনো পাঠানো অনুরোধ নেই।</p>
                <p className="text-xs text-slate-400 mt-1">আপনি কাউকে ফ্রেন্ড রিকোয়েস্ট পাঠালে তা এখানে দেখতে পারবেন।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition">
                    <Link 
                      to={`/profile/${req.receiverId}`}
                      state={{ from: '/friends' }}
                      className="flex items-center gap-3 no-underline group flex-1 min-w-0"
                    >
                      <img 
                        src={req.receiverAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.receiverId}`} 
                        alt={req.receiverName}
                        className="w-13 h-13 rounded-full object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#0B7A3B] transition truncate">
                          {req.receiverName || 'সম্মানিত নাগরিক'}
                        </div>
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-slate-400 shrink-0" />
                          <span>অনুরোধ পাঠানো হয়েছে</span>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleCancelRequest(req.receiverId)}
                      disabled={actionLoadingId === req.receiverId}
                      className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-black rounded-lg sm:rounded-xl transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Unfriend Confirm Modal */}
      {unfriendModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <UserMinus size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {unfriendModalTarget.name || 'বন্ধু'}-কে আনফ্রেন্ড করতে চান?
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              আনফ্রেন্ড করলে উনি আপনার ফ্রেন্ডলিস্ট থেকে অপসারিত হবেন।
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setUnfriendModalTarget(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleExecuteUnfriend}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
              >
                হ্যাঁ, আনফ্রেন্ড করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default FriendsPage;

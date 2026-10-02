import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserCheck, UserPlus, UserX, UserMinus, ShieldAlert, 
  Search, CheckCircle2, MessageCircle, Send, Cake, Lock, Globe, 
  Settings, ChevronRight, X, AlertTriangle, Filter, Sparkles, Ban, Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
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
  getDocs,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderUnion?: string;
  senderRole?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface UserPrivacySettings {
  userId: string;
  whoCanSendRequest?: 'Everyone' | 'FriendsOfFriends' | 'Nobody';
  whoCanViewFriends?: 'Everyone' | 'Friends' | 'OnlyMe';
  whoCanFollowMe?: 'Everyone' | 'Friends' | 'Nobody';
  whoCanSeeBirthday?: 'Everyone' | 'Friends' | 'OnlyMe';
}

export interface FriendCategory {
  id: string;
  userId: string;
  friendId: string;
  category: 'Close Friends' | 'Family' | 'Work' | 'School' | 'Other';
}

interface FriendsManagerProps {
  user: any;
  userProfile: any;
  firestoreUsers: any[];
  onSelectProfile: (user: any) => void;
  onStartDirectMessage: (user: any) => void;
}

const CATEGORY_OPTIONS = [
  { id: 'All', label: 'সব বন্ধু' },
  { id: 'Close Friends', label: '⭐ বিশেষ বন্ধু (Close)' },
  { id: 'Family', label: '👨‍👩‍👧 পরিবার (Family)' },
  { id: 'Work', label: '💼 কর্মক্ষেত্র (Work)' },
  { id: 'School', label: '🏫 বিদ্যালয়/কলেজ (School)' },
  { id: 'Other', label: '📌 অন্যান্য (Other)' }
];

export function FriendsManager({
  user,
  userProfile,
  firestoreUsers,
  onSelectProfile,
  onStartDirectMessage
}: FriendsManagerProps) {
  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'all_friends' | 'requests' | 'suggestions' | 'sent_requests' | 'birthdays' | 'following' | 'blocked' | 'settings'
  >('all_friends');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Real-time Firestore Datasets
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [follows, setFollows] = useState<{ id: string; followerId: string; followingId: string }[]>([]);
  const [blocks, setBlocks] = useState<{ id: string; blockedBy: string; blockedUser: string }[]>([]);
  const [privacySettingsMap, setPrivacySettingsMap] = useState<{ [uid: string]: UserPrivacySettings }>({});
  const [friendCategoriesMap, setFriendCategoriesMap] = useState<{ [friendId: string]: string }>({});

  // Modals & Action Confirmation State
  const [unfriendConfirmTarget, setUnfriendConfirmTarget] = useState<any | null>(null);
  const [reportTarget, setReportTarget] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState('Harassment');
  const [mutualFriendsModalUser, setMutualFriendsModalUser] = useState<any | null>(null);

  // Rate Limiting Protection (Anti-Spam)
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);

  // Internal users fallback
  const [internalUsers, setInternalUsers] = useState<any[]>([]);

  useEffect(() => {
    if (firestoreUsers && firestoreUsers.length > 0) {
      setInternalUsers(firestoreUsers);
      return;
    }
    const q = query(collection(db, "users"), limit(80));
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ uid: d.id, id: d.id, ...d.data() }));
      setInternalUsers(list);
    }, () => {});
    return () => unsub();
  }, [firestoreUsers]);

  const effectiveUsers = useMemo(() => {
    return (firestoreUsers && firestoreUsers.length > 0) ? firestoreUsers : internalUsers;
  }, [firestoreUsers, internalUsers]);

  // Privacy Settings Form State
  const [privacyRequestControl, setPrivacyRequestControl] = useState<'Everyone' | 'FriendsOfFriends' | 'Nobody'>('Everyone');
  const [privacyViewControl, setPrivacyViewControl] = useState<'Everyone' | 'Friends' | 'OnlyMe'>('Everyone');
  const [privacyFollowControl, setPrivacyFollowControl] = useState<'Everyone' | 'Friends' | 'Nobody'>('Everyone');
  const [privacyBirthdayControl, setPrivacyBirthdayControl] = useState<'Everyone' | 'Friends' | 'OnlyMe'>('Everyone');

  // 1. Subscribe to Friend Requests
  useEffect(() => {
    if (!user) return;
    const q1 = query(collection(db, "friend_requests"), where("senderId", "==", user.uid));
    const q2 = query(collection(db, "friend_requests"), where("receiverId", "==", user.uid));

    const handleSnap = (snap1: any, snap2: any) => {
      const list: FriendRequest[] = [];
      const seen = new Set<string>();
      snap1.forEach((doc: any) => {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          list.push({ id: doc.id, ...doc.data() } as FriendRequest);
        }
      });
      snap2.forEach((doc: any) => {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          list.push({ id: doc.id, ...doc.data() } as FriendRequest);
        }
      });
      setFriendRequests(list);
    };

    const unsub1 = onSnapshot(q1, (snap1) => {
      getDocs(q2).then(snap2 => handleSnap(snap1, snap2)).catch(() => {});
    });
    const unsub2 = onSnapshot(q2, (snap2) => {
      getDocs(q1).then(snap1 => handleSnap(snap1, snap2)).catch(() => {});
    });

    return () => { unsub1(); unsub2(); };
  }, [user]);

  // 2. Subscribe to Follows
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "follows"), (snap) => {
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setFollows(list);
    });
    return unsub;
  }, []);

  // 3. Subscribe to Blocks
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "blocks"), (snap) => {
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setBlocks(list);
    });
    return unsub;
  }, [user]);

  // 4. Subscribe to Privacy Settings
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "privacy_settings"), (snap) => {
      const map: { [uid: string]: UserPrivacySettings } = {};
      snap.forEach(doc => {
        map[doc.id] = { userId: doc.id, ...doc.data() } as UserPrivacySettings;
      });
      setPrivacySettingsMap(map);
      if (user && map[user.uid]) {
        const myPriv = map[user.uid];
        if (myPriv.whoCanSendRequest) setPrivacyRequestControl(myPriv.whoCanSendRequest);
        if (myPriv.whoCanViewFriends) setPrivacyViewControl(myPriv.whoCanViewFriends);
        if (myPriv.whoCanFollowMe) setPrivacyFollowControl(myPriv.whoCanFollowMe);
        if (myPriv.whoCanSeeBirthday) setPrivacyBirthdayControl(myPriv.whoCanSeeBirthday);
      }
    });
    return unsub;
  }, [user]);

  // 5. Subscribe to Friend Categories
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "friend_categories"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const map: { [friendId: string]: string } = {};
      snap.forEach(doc => {
        const data = doc.data();
        map[data.friendId] = data.category;
      });
      setFriendCategoriesMap(map);
    });
    return unsub;
  }, [user]);

  // Audit Logger Helper
  const logAudit = async (action: string, targetId: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "friendship_audit_logs"), {
        actorId: user.uid,
        targetId,
        action,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  };

  // Accepted Friends List
  const friendsList = useMemo(() => {
    if (!user) return [];
    return effectiveUsers.filter(u => {
      if (u.uid === user.uid) return false;
      return friendRequests.some(r => 
        r.status === 'accepted' && 
        ((r.senderId === user.uid && r.receiverId === u.uid) ||
         (r.receiverId === user.uid && r.senderId === u.uid))
      );
    });
  }, [user, effectiveUsers, friendRequests]);

  // Helper to get mutual friends with a target user
  const getMutualFriends = (targetUid: string) => {
    if (!user) return [];
    const targetFriends = effectiveUsers.filter(u => {
      if (u.uid === targetUid || u.uid === user.uid) return false;
      return friendRequests.some(r => 
        r.status === 'accepted' && 
        ((r.senderId === targetUid && r.receiverId === u.uid) ||
         (r.receiverId === targetUid && r.senderId === u.uid))
      );
    });
    const myFriendUids = new Set(friendsList.map(f => f.uid));
    return targetFriends.filter(f => myFriendUids.has(f.uid));
  };

  // Incoming & Outgoing Requests
  const incomingRequests = useMemo(() => {
    return friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.uid);
  }, [friendRequests, user]);

  const outgoingRequests = useMemo(() => {
    return friendRequests.filter(r => r.status === 'pending' && r.senderId === user?.uid);
  }, [friendRequests, user]);

  // Suggestions Scoring Engine (People You May Know)
  const suggestionsList = useMemo(() => {
    if (!user) return [];
    const myFriendUids = new Set(friendsList.map(f => f.uid));
    const pendingTargetUids = new Set(friendRequests.filter(r => r.status === 'pending').map(r => r.senderId === user.uid ? r.receiverId : r.senderId));
    const blockedUids = new Set(blocks.map(b => b.blockedBy === user.uid ? b.blockedUser : b.blockedBy));

    return effectiveUsers.filter(u => {
      if (u.uid === user.uid) return false;
      if (myFriendUids.has(u.uid)) return false;
      if (pendingTargetUids.has(u.uid)) return false;
      if (blockedUids.has(u.uid)) return false;
      return true;
    }).map(u => {
      const mutuals = getMutualFriends(u.uid);
      const isSameUnion = u.union && userProfile?.union && u.union === userProfile.union;
      return {
        ...u,
        mutualFriends: mutuals,
        mutualCount: mutuals.length,
        isSameUnion
      };
    }).sort((a, b) => b.mutualCount - a.mutualCount);
  }, [user, effectiveUsers, friendsList, friendRequests, blocks, userProfile]);

  // Following list
  const followingList = useMemo(() => {
    if (!user) return [];
    return effectiveUsers.filter(u => follows.some(f => f.followerId === user.uid && f.followingId === u.uid));
  }, [user, effectiveUsers, follows]);

  // Blocked list
  const blockedList = useMemo(() => {
    if (!user) return [];
    return effectiveUsers.filter(u => blocks.some(b => b.blockedBy === user.uid && b.blockedUser === u.uid));
  }, [user, effectiveUsers, blocks]);

  // Birthday List Filter
  const birthdayList = useMemo(() => {
    return effectiveUsers.filter(u => {
      const targetPriv = privacySettingsMap[u.uid];
      if (targetPriv?.whoCanSeeBirthday === 'OnlyMe' && u.uid !== user?.uid) return false;
      if (targetPriv?.whoCanSeeBirthday === 'Friends') {
        const isFriend = friendsList.some(f => f.uid === u.uid);
        if (!isFriend && u.uid !== user?.uid) return false;
      }
      return !!u.birthday || !!u.dob;
    });
  }, [effectiveUsers, privacySettingsMap, user, friendsList]);

  // Send Friend Request (with Anti-Spam Rate Limiter)
  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) {
      toast.error("অনুরোধ পাঠাতে লগইন করুন।");
      return;
    }

    // Rate Limiting Check (Max 5 requests in 30 seconds)
    const now = Date.now();
    const recentRequests = requestTimestamps.filter(t => now - t < 30000);
    if (recentRequests.length >= 5) {
      toast.error("⚠️ নিরাপত্তা অ্যালার্ট: অল্প সময়ে অনেকগুলো ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে কিছু সময় অপেক্ষা করুন।");
      return;
    }
    setRequestTimestamps([...recentRequests, now]);

    // Target Privacy Check
    const targetPriv = privacySettingsMap[targetUserId];
    if (targetPriv) {
      if (targetPriv.whoCanSendRequest === 'Nobody') {
        toast.error("⚠️ এই ব্যবহারকারীর সেটিংসে ফ্রেন্ড রিকোয়েস্ট গ্রহণ বন্ধ রয়েছে।");
        return;
      }
      if (targetPriv.whoCanSendRequest === 'FriendsOfFriends') {
        const mutuals = getMutualFriends(targetUserId);
        if (mutuals.length === 0) {
          toast.error("⚠️ শুধুমাত্র বন্ধুদের বন্ধুরাই (Friends of Friends) অনুরোধ পাঠাতে পারবেন।");
          return;
        }
      }
    }

    const requestId = `${user.uid}_${targetUserId}`;
    try {
      await setDoc(doc(db, "friend_requests", requestId), {
        id: requestId,
        senderId: user.uid,
        senderName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
        senderAvatar: userProfile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
        senderUnion: userProfile?.union || 'পুঠিয়া ইউনিয়ন',
        senderRole: userProfile?.role || 'user',
        receiverId: targetUserId,
        status: 'pending',
        createdAt: Date.now()
      });

      // Auto-follow
      await setDoc(doc(db, "follows", `${user.uid}_${targetUserId}`), {
        id: `${user.uid}_${targetUserId}`,
        followerId: user.uid,
        followingId: targetUserId,
        createdAt: Date.now()
      });

      // Notification
      await addDoc(collection(db, "notifications"), {
        userId: targetUserId,
        title: "👤 নতুন ফ্রেন্ড রিকোয়েস্ট",
        message: `${userProfile?.name || 'একজন ব্যবহারকারী'} আপনাকে Friend Request পাঠিয়েছেন।`,
        read: false,
        createdAt: serverTimestamp()
      });

      await logAudit("REQUEST_SENT", targetUserId);
      toast.success("✅ বন্ধুত্বের অনুরোধ পাঠানো হয়েছে!");
    } catch (err) {
      console.error("Error sending request:", err);
      toast.error("অনুরোধ পাঠাতে সমস্যা হয়েছে।");
    }
  };

  // Confirm Request
  const handleConfirmRequest = async (req: FriendRequest) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "friend_requests", req.id), { status: 'accepted' });
      
      // Mutual Follow
      await setDoc(doc(db, "follows", `${req.senderId}_${req.receiverId}`), {
        id: `${req.senderId}_${req.receiverId}`,
        followerId: req.senderId,
        followingId: req.receiverId,
        createdAt: Date.now()
      });
      await setDoc(doc(db, "follows", `${req.receiverId}_${req.senderId}`), {
        id: `${req.receiverId}_${req.senderId}`,
        followerId: req.receiverId,
        followingId: req.senderId,
        createdAt: Date.now()
      });

      // Notification
      await addDoc(collection(db, "notifications"), {
        userId: req.senderId,
        title: "🤝 রিকোয়েস্ট গৃহীত!",
        message: `${userProfile?.name || 'একজন ব্যবহারকারী'} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন।`,
        read: false,
        createdAt: serverTimestamp()
      });

      await logAudit("REQUEST_ACCEPTED", req.senderId);
      toast.success(`🤝 আপনি এখন ${req.senderName}-এর সাথে সংযুক্ত!`);
    } catch (err) {
      console.error("Error confirming request:", err);
      toast.error("অনুরোধ গ্রহণ করা যায়নি।");
    }
  };

  // Delete Request (Decline or Cancel Outgoing)
  const handleDeleteRequest = async (reqId: string, targetUid: string, isCancel = false) => {
    try {
      await deleteDoc(doc(db, "friend_requests", reqId));
      await logAudit(isCancel ? "REQUEST_CANCELLED" : "REQUEST_REJECTED", targetUid);
      toast.success(isCancel ? "📤 অনুরোধ বাতিল করা হয়েছে।" : "অনুরোধ মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  // Unfriend
  const handleExecuteUnfriend = async () => {
    if (!user || !unfriendConfirmTarget) return;
    const targetUid = unfriendConfirmTarget.uid;

    const req = friendRequests.find(r => 
      r.status === 'accepted' && 
      ((r.senderId === user.uid && r.receiverId === targetUid) ||
       (r.receiverId === user.uid && r.senderId === targetUid))
    );

    try {
      if (req) await deleteDoc(doc(db, "friend_requests", req.id));
      await deleteDoc(doc(db, "follows", `${user.uid}_${targetUid}`));
      await deleteDoc(doc(db, "follows", `${targetUid}_${user.uid}`));

      await logAudit("UNFRIENDED", targetUid);
      toast.success(` unfriend সম্পূর্ণ হয়েছে।`);
      setUnfriendConfirmTarget(null);
    } catch (err) {
      console.error("Error unfriending:", err);
      toast.error("Unfriend করা সম্ভব হয়নি।");
    }
  };

  // Assign Friend Category
  const handleSetCategory = async (friendId: string, category: 'Close Friends' | 'Family' | 'Work' | 'School' | 'Other') => {
    if (!user) return;
    try {
      const docId = `${user.uid}_${friendId}`;
      await setDoc(doc(db, "friend_categories", docId), {
        id: docId,
        userId: user.uid,
        friendId,
        category,
        updatedAt: Date.now()
      });
      toast.success(`🏷️ ক্যাটাগরি "${category}" সেট করা হয়েছে!`);
    } catch (err) {
      console.error("Error setting category:", err);
    }
  };

  // Block User
  const handleBlockUser = async (targetUid: string) => {
    if (!user) return;
    try {
      const blockId = `${user.uid}_${targetUid}`;
      await setDoc(doc(db, "blocks", blockId), {
        id: blockId,
        blockedBy: user.uid,
        blockedUser: targetUid,
        createdAt: Date.now()
      });

      // Remove any requests or follows
      const req = friendRequests.find(r => 
        (r.senderId === user.uid && r.receiverId === targetUid) ||
        (r.senderId === targetUid && r.receiverId === user.uid)
      );
      if (req) await deleteDoc(doc(db, "friend_requests", req.id));
      await deleteDoc(doc(db, "follows", `${user.uid}_${targetUid}`));
      await deleteDoc(doc(db, "follows", `${targetUid}_${user.uid}`));

      await logAudit("BLOCKED", targetUid);
      toast.success("🚫 ব্যবহারকারীকে সফলভাবে ব্লক করা হয়েছে।");
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };

  // Unblock User
  const handleUnblockUser = async (targetUid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "blocks", `${user.uid}_${targetUid}`));
      toast.success("✅ ব্যবহারকারীকে আনব্লক করা হয়েছে।");
    } catch (err) {
      console.error("Error unblocking:", err);
    }
  };

  // Save Privacy Settings
  const handleSavePrivacy = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "privacy_settings", user.uid), {
        userId: user.uid,
        whoCanSendRequest: privacyRequestControl,
        whoCanViewFriends: privacyViewControl,
        whoCanFollowMe: privacyFollowControl,
        whoCanSeeBirthday: privacyBirthdayControl,
        updatedAt: Date.now()
      }, { merge: true });

      toast.success("🔒 প্রাইভেসি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    } catch (err) {
      console.error("Error saving privacy:", err);
      toast.error("সেটিংস সংরক্ষণ করা সম্ভব হয়নি।");
    }
  };

  // Send Birthday Wish
  const handleSendBirthdayWish = (targetUser: any) => {
    onStartDirectMessage({
      id: targetUser.uid,
      name: targetUser.name,
      avatar: targetUser.avatarUrl,
      initialText: "🎂 শুভ জন্মদিন! আপনার জীবন সাফল্য, আনন্দ ও সমৃদ্ধিতে ভরে উঠুক। 🎉✨"
    });
  };

  // Filtered Friends List by Search & Category
  const filteredFriends = useMemo(() => {
    return friendsList.filter(f => {
      const matchSearch = !searchQuery || 
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.union?.toLowerCase().includes(searchQuery.toLowerCase());

      const cat = friendCategoriesMap[f.uid] || 'Other';
      const matchCat = selectedCategory === 'All' || cat === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [friendsList, searchQuery, selectedCategory, friendCategoriesMap]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006a4e] flex items-center justify-center font-black shadow-xs">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-none flex items-center gap-2">
                আমার পরিচিতি ও বন্ধুমহল (Friends & Connections)
              </h3>
              <p className="text-[11px] text-slate-500 font-bold mt-1.5">
                সহ-নাগরিকদের সাথে বন্ধুত্ব, ফলোয়ার্স ও প্রাইভেসি সরাসরি পরিচালনা করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-black">
            <span className="px-3 py-1 bg-emerald-50 text-[#006a4e] rounded-full border border-emerald-100">
              🤝 {friendsList.length} বন্ধুরা
            </span>
            {incomingRequests.length > 0 && (
              <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100 animate-pulse">
                📩 {incomingRequests.length} নতুন অনুরোধ
              </span>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        {activeTab !== 'settings' && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="🔍 নাম, গ্রাম বা ইউনিয়ন দিয়ে অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter on All Friends Tab */}
            {activeTab === 'all_friends' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-extrabold text-slate-700 outline-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Horizontal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: 'all_friends', label: '🤝 সব বন্ধুরা', count: friendsList.length },
            { id: 'requests', label: '📩 ফ্রেন্ড রিকোয়েস্ট', count: incomingRequests.length, badge: incomingRequests.length > 0 },
            { id: 'suggestions', label: '👥 People You May Know', count: suggestionsList.length },
            { id: 'sent_requests', label: '📤 পাঠানো অনুরোধ', count: outgoingRequests.length },
            { id: 'birthdays', label: '🎂 জন্মদিনের তালিকা', count: birthdayList.length },
            { id: 'following', label: '👤 অনুসরণ করছেন', count: followingList.length },
            { id: 'blocked', label: '🚫 ব্লকড লিস্ট', count: blockedList.length },
            { id: 'settings', label: '🔒 প্রাইভেসি সেটিংস' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition border cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.id !== 'settings' && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : tab.badge ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="space-y-4">
        {/* 1. ALL FRIENDS TAB */}
        {activeTab === 'all_friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFriends.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400 font-bold text-xs space-y-2">
                <p>কোনো বন্ধু পাওয়া যায়নি।</p>
                <button 
                  onClick={() => setActiveTab('suggestions')} 
                  className="text-xs font-black text-[#006a4e] border-0 bg-transparent underline cursor-pointer"
                >
                  + নতুন বন্ধু সুপারিশ দেখুন
                </button>
              </div>
            ) : (
              filteredFriends.map(friend => {
                const mutuals = getMutualFriends(friend.uid);
                const currentCat = friendCategoriesMap[friend.uid] || 'Other';

                return (
                  <div key={friend.uid} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={friend.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${friend.uid}`} 
                          alt={friend.name} 
                          onClick={() => onSelectProfile(friend)}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 cursor-pointer"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Active Now"></span>
                      </div>

                      <div className="min-w-0">
                        <h4 
                          onClick={() => onSelectProfile(friend)}
                          className="text-xs font-black text-slate-900 truncate hover:text-[#006a4e] cursor-pointer flex items-center gap-1"
                        >
                          {friend.name}
                          <CheckCircle2 size={12} className="text-blue-500 fill-blue-500 text-white shrink-0" />
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold">{friend.union || "পুঠিয়া ইউনিয়ন"}</p>
                        
                        {mutuals.length > 0 && (
                          <button
                            onClick={() => setMutualFriendsModalUser(friend)}
                            className="text-[10px] text-[#006a4e] font-extrabold hover:underline mt-0.5 border-0 bg-transparent p-0 cursor-pointer block"
                          >
                            👥 {mutuals.length} জন Mutual Friends
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Category Selector */}
                      <select
                        value={currentCat}
                        onChange={(e) => handleSetCategory(friend.uid, e.target.value as any)}
                        className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer"
                        title="ক্যাটাগরি সেট করুন"
                      >
                        <option value="Close Friends">⭐ Close</option>
                        <option value="Family">👨‍👩‍👧 Family</option>
                        <option value="Work">💼 Work</option>
                        <option value="School">🏫 School</option>
                        <option value="Other">📌 Other</option>
                      </select>

                      <button
                        onClick={() => onStartDirectMessage({ id: friend.uid, name: friend.name, avatar: friend.avatarUrl })}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl border-0 cursor-pointer transition"
                        title="বার্তা পাঠান"
                      >
                        <MessageCircle size={15} />
                      </button>

                      <button
                        onClick={() => setUnfriendConfirmTarget(friend)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border-0 cursor-pointer transition"
                        title="Unfriend করুন"
                      >
                        <UserMinus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. FRIEND REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-[#006a4e]" />
              <span>আগত বন্ধুত্বের অনুরোধ সমূহ ({incomingRequests.length})</span>
            </h4>

            {incomingRequests.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400 font-bold">কোনো নতুন ফ্রেন্ড রিকোয়েস্ট নেই।</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {incomingRequests.map(req => {
                  const reqUser = firestoreUsers.find(u => u.uid === req.senderId);
                  const mutuals = reqUser ? getMutualFriends(reqUser.uid) : [];

                  return (
                    <div key={req.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={req.senderAvatar} 
                          alt={req.senderName} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-slate-900 truncate">{req.senderName}</h5>
                          <p className="text-[10px] text-slate-400 font-bold">{req.senderUnion || "পুঠিয়া"}</p>
                          {mutuals.length > 0 && (
                            <p className="text-[10px] text-[#006a4e] font-extrabold mt-0.5">👥 {mutuals.length} Mutual Friends</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleConfirmRequest(req)}
                          className="px-3 py-1.5 bg-[#006a4e] hover:bg-emerald-800 text-white text-[10px] font-black rounded-xl border-0 cursor-pointer shadow-xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(req.id, req.senderId)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-xl border-0 cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleBlockUser(req.senderId)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border-0 cursor-pointer"
                          title="Block User"
                        >
                          <Ban size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SUGGESTIONS (PEOPLE YOU MAY KNOW) TAB */}
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {suggestionsList.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400 font-bold text-xs">
                কোনো নতুন নাগরিকের প্রস্তাবনা পাওয়া যায়নি।
              </div>
            ) : (
              suggestionsList.map(sug => (
                <div key={sug.uid} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={sug.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${sug.uid}`} 
                      alt={sug.name} 
                      onClick={() => onSelectProfile(sug)}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 cursor-pointer shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 
                        onClick={() => onSelectProfile(sug)}
                        className="text-xs font-black text-slate-900 truncate cursor-pointer hover:text-[#006a4e]"
                      >
                        {sug.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold">{sug.union || "পুঠিয়া ইউনিয়ন"}</p>
                      {sug.mutualCount > 0 ? (
                        <p className="text-[10px] text-[#006a4e] font-extrabold mt-0.5">👥 {sug.mutualCount} জন Mutual Friends</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">📍 কাছাকাছি নাগরিক</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button 
                      onClick={() => handleSendFriendRequest(sug.uid)}
                      className="px-3.5 py-1.5 bg-[#006a4e] hover:bg-emerald-800 text-white text-[10px] font-black rounded-xl border-0 cursor-pointer transition shadow-xs flex items-center gap-1"
                    >
                      <UserPlus size={12} /> Add Friend
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. SENT REQUESTS TAB */}
        {activeTab === 'sent_requests' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Send size={14} className="text-[#006a4e]" />
              <span>পাঠানো অনুরোধ সমূহ ({outgoingRequests.length})</span>
            </h4>

            {outgoingRequests.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400 font-bold">আপনি সম্প্রতি কোনো বন্ধুত্বের অনুরোধ পাঠাননি।</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {outgoingRequests.map(req => {
                  const targetUser = firestoreUsers.find(u => u.uid === req.receiverId);
                  return (
                    <div key={req.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={targetUser?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${req.receiverId}`} 
                          alt="Avatar" 
                          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" 
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-slate-900 truncate">{targetUser?.name || "সম্মানিত নাগরিক"}</h5>
                          <p className="text-[10px] text-slate-400 font-bold">{targetUser?.union || "পুঠিয়া"}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteRequest(req.id, req.receiverId, true)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-[10px] font-black rounded-xl border-0 cursor-pointer transition flex items-center gap-1"
                      >
                        <Undo2 size={11} /> Cancel Request
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. BIRTHDAYS TAB */}
        {activeTab === 'birthdays' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cake size={16} className="text-amber-500" />
              <span>আজ ও আসন্ন জন্মদিন</span>
            </h4>

            {birthdayList.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400 font-bold">সম্প্রতি কোনো বন্ধুর জন্মদিন নেই।</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {birthdayList.map(bUser => (
                  <div key={bUser.uid} className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img src={bUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${bUser.uid}`} className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" alt="Avatar" />
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full text-[9px]">🎂</span>
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-900 truncate">{bUser.name}</h5>
                        <p className="text-[10px] text-amber-700 font-extrabold mt-0.5">
                          🎂 {bUser.birthday || bUser.dob || 'আজকের শুভ জন্মদিন'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendBirthdayWish(bUser)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-xl border-0 cursor-pointer shadow-xs transition"
                    >
                      শুভেচ্ছা বার্তা পাঠান 🎈
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. FOLLOWING TAB */}
        {activeTab === 'following' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {followingList.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400 font-bold text-xs">
                আপনি কোনো নাগরিককে অনুসরণ করছেন না।
              </div>
            ) : (
              followingList.map(fUser => (
                <div key={fUser.uid} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={fUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fUser.uid}`} className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" alt="Avatar" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{fUser.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{fUser.union || "পুঠিয়া"}</p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, "follows", `${user.uid}_${fUser.uid}`));
                      toast.success("আনফলো করা হয়েছে।");
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-xl border-0 cursor-pointer"
                  >
                    আনফলো
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 7. BLOCKED TAB */}
        {activeTab === 'blocked' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {blockedList.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center text-slate-400 font-bold text-xs">
                আপনার ব্লক লিস্টে কোনো নাগরিক নেই।
              </div>
            ) : (
              blockedList.map(bUser => (
                <div key={bUser.uid} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={bUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${bUser.uid}`} className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" alt="Avatar" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{bUser.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{bUser.union || "পুঠিয়া"}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblockUser(bUser.uid)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-xl border border-rose-200 cursor-pointer"
                  >
                    আনব্লক করুন
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 8. PRIVACY SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Lock size={16} className="text-[#006a4e]" />
              <span>গোপনীয়তা ও বন্ধুমহল সেটিংস (Privacy Controls)</span>
            </h4>

            <div className="space-y-5">
              {/* Request Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">কে আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠাতে পারবে?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Everyone', label: '🌍 সবাই (Everyone)' },
                    { id: 'FriendsOfFriends', label: '👥 বন্ধুদের বন্ধু' },
                    { id: 'Nobody', label: '🔒 কেউই না' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrivacyRequestControl(opt.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        privacyRequestControl === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Friend list visibility */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">আপনার ফ্রেন্ড লিস্ট কে দেখতে পারবে?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Everyone', label: '🌍 সবাই (Everyone)' },
                    { id: 'Friends', label: '👥 বন্ধুরা (Friends)' },
                    { id: 'OnlyMe', label: '🔒 শুধুমাত্র আমি' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrivacyViewControl(opt.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        privacyViewControl === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">কে আপনাকে ফলো করতে পারবে?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Everyone', label: '🌍 সবাই (Everyone)' },
                    { id: 'Friends', label: '👥 শুধুমাত্র বন্ধুরা' },
                    { id: 'Nobody', label: '🔒 কেউই না' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrivacyFollowControl(opt.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        privacyFollowControl === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday Visibility */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">আপনার জন্ম তারিখ কে দেখতে পারবে?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Everyone', label: '🌍 সবাই (Everyone)' },
                    { id: 'Friends', label: '👥 শুধুমাত্র বন্ধুরা' },
                    { id: 'OnlyMe', label: '🔒 শুধুমাত্র আমি' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrivacyBirthdayControl(opt.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        privacyBirthdayControl === opt.id
                          ? 'bg-emerald-50 text-[#006a4e] border-emerald-300 font-black'
                          : 'bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSavePrivacy}
                className="px-6 py-2.5 bg-[#006a4e] hover:bg-emerald-800 text-white rounded-2xl text-xs font-black border-0 cursor-pointer shadow-md transition"
              >
                প্রাইভেসি সেভ করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UNFRIEND CONFIRMATION MODAL */}
      <AnimatePresence>
        {unfriendConfirmTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <UserX size={24} />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Unfriend নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  আপনি কি নিশ্চিত যে <span className="font-bold text-slate-900">{unfriendConfirmTarget.name}</span>-কে ফ্রেন্ড লিস্ট থেকে সরাতে চান?
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  গোপনীয় সামগ্রী ও ফ্রেন্ড-অনলি অ্যাক্সেস সীমাবদ্ধ হবে। কোনো নোটিফিকেশন পাঠানো হবে না।
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setUnfriendConfirmTarget(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl border-0 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleExecuteUnfriend}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl border-0 cursor-pointer shadow-sm"
                >
                  Unfriend করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MUTUAL FRIENDS LIST MODAL */}
      <AnimatePresence>
        {mutualFriendsModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Users size={16} className="text-[#006a4e]" />
                  <span>{mutualFriendsModalUser.name}-এর সাথে পারস্পরিক পরিচিতি</span>
                </h3>
                <button onClick={() => setMutualFriendsModalUser(null)} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {getMutualFriends(mutualFriendsModalUser.uid).map(mUser => (
                  <div key={mUser.uid} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={mUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${mUser.uid}`} className="w-9 h-9 rounded-full object-cover shrink-0" alt="Avatar" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-900 truncate">{mUser.name}</h5>
                        <p className="text-[10px] text-slate-400">{mUser.union || "পুঠিয়া"}</p>
                      </div>
                    </div>
                    <button onClick={() => { setMutualFriendsModalUser(null); onSelectProfile(mUser); }} className="px-2.5 py-1 bg-emerald-50 text-[#006a4e] text-[10px] font-black rounded-lg border-0 cursor-pointer">
                      প্রোফাইল
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

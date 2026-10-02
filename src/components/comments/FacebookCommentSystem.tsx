import React, { useState, useEffect, useRef } from 'react';
import { FacebookVerifiedBadge } from '../common/FacebookVerifiedBadge';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  ImageIcon, 
  SendHorizontal, 
  MoreHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp, 
  BadgeCheck, 
  CornerDownRight, 
  Pencil, 
  Trash2, 
  Flag, 
  EyeOff, 
  Eye, 
  ShieldAlert, 
  Lock
} from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { cleanUndefined } from '../../utils/firestoreUtils';
const hotToast = toast;

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorId: string;
  authorBadge: boolean;
  authorPhotoUrl?: string;
  content: string;
  createdAt: any;
  parentId?: string | null;
  likes?: number;
  likedBy?: string[];
  isEdited?: boolean;
  imageUrl?: string | null;
  mentions?: string[];
  reactions?: { [type: string]: string[] };
  hidden?: boolean;
  reported?: boolean;
}

export interface MentionUser {
  uid: string;
  name: string;
  username?: string;
  village?: string;
  union?: string;
  role?: string;
  avatarUrl?: string;
  profession?: string;
}

export const REACTION_TYPES = [
  { id: "like", label: "Like", bnLabel: "লাইক", emoji: "👍", color: "text-[#1877F2]", bg: "bg-[#1877F2]" },
  { id: "love", label: "Love", bnLabel: "লাভ", emoji: "❤️", color: "text-[#f02849]", bg: "bg-[#f02849]" },
  { id: "haha", label: "Haha", bnLabel: "হা হা", emoji: "😂", color: "text-[#f7b125]", bg: "bg-[#f7b125]" },
  { id: "wow", label: "Wow", bnLabel: "ওয়াও", emoji: "😮", color: "text-[#f7b125]", bg: "bg-[#f7b125]" },
  { id: "sad", label: "Sad", bnLabel: "স্যাড", emoji: "😢", color: "text-[#f7b125]", bg: "bg-[#f7b125]" },
  { id: "angry", label: "Angry", bnLabel: "এংরি", emoji: "😡", color: "text-[#e95950]", bg: "bg-[#e95950]" }
];

// Preset Facebook Stickers
export const FB_STICKERS = [
  { id: 'heart_love', title: 'Love Heart', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=150&q=80' },
  { id: 'cute_bear', title: 'Cute Hug', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80' },
  { id: 'celebrate', title: 'Celebrate', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=150&q=80' },
  { id: 'flower_gift', title: 'Flower Gift', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=150&q=80' }
];

interface FacebookCommentSystemProps {
  postId: string;
  post: any;
  currentUser: any;
  userProfile: any;
  firestoreUsers: MentionUser[];
  followedUsers?: string[];
  onSelectProfileUser: (user: any) => void;
  onReportComment?: (commentId: string, text: string) => void;
  onBlockUser?: (userId: string, userName: string) => void;
  onToggleDisablePostComments?: (postId: string, disabled: boolean) => void;
  isModal?: boolean;
  className?: string;
}

export const FacebookCommentSystem: React.FC<FacebookCommentSystemProps> = ({
  postId,
  post,
  currentUser,
  userProfile,
  firestoreUsers,
  followedUsers = [],
  onSelectProfileUser,
  onReportComment,
  onBlockUser,
  onToggleDisablePostComments,
  isModal = false,
  className = ""
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Input states
  const [newCommentText, setNewCommentText] = useState("");
  const [commentImageUrl, setCommentImageUrl] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [commentId: string]: string }>({});
  const [activeReplyInputId, setActiveReplyInputId] = useState<string | null>(null);

  // Expanded replies map { commentId: boolean }
  const [expandedRepliesMap, setExpandedRepliesMap] = useState<{ [commentId: string]: boolean }>({});

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Reaction Selector Popover
  const [activeReactionHoverId, setActiveReactionHoverId] = useState<string | null>(null);

  // Options Menu Popover
  const [openMenuCommentId, setOpenMenuCommentId] = useState<string | null>(null);

  // Emoji & GIF Drawers
  const [isEmojiDrawerOpen, setIsEmojiDrawerOpen] = useState(false);
  const [isGifDrawerOpen, setIsGifDrawerOpen] = useState(false);

  // Mention Suggestions
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionUser[]>([]);
  const [activeMentionTarget, setActiveMentionTarget] = useState<{ targetId: string; query: string } | null>(null);

  // Sort Type
  const [sortType, setSortType] = useState<'latest' | 'top' | 'oldest'>('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------
  // REAL-TIME FIRESTORE COMMENTS LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    const q = query(
      collection(db, "discussion_comments"),
      where("postId", "==", postId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Comment[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        fetched.push({
          id: docSnap.id,
          postId: d.postId,
          parentId: d.parentId || null,
          author: d.author || "সম্মানিত নাগরিক",
          authorId: d.authorId || "",
          authorBadge: !!d.authorBadge,
          authorPhotoUrl: d.authorPhotoUrl || d.photoURL || "",
          content: d.content || "",
          createdAt: d.createdAt,
          likes: d.likes || 0,
          likedBy: d.likedBy || [],
          reactions: d.reactions || {},
          imageUrl: d.imageUrl || null,
          isEdited: !!d.isEdited,
          hidden: !!d.hidden,
          reported: !!d.reported,
          mentions: d.mentions || []
        });
      });

      // Sort in-memory to prevent missing composite index errors
      fetched.sort((a, b) => {
        const aTime = (a.createdAt?.seconds || (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0)) || 0;
        const bTime = (b.createdAt?.seconds || (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0)) || 0;
        return aTime - bTime;
      });

      setComments(fetched);
      setLoading(false);
    }, (err: any) => {
      if (err?.message?.includes("Quota") || err?.code === "resource-exhausted" || err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.warn("Firestore quota limit reached while reading comments.");
      } else {
        console.warn("Error reading comments:", err?.message || err);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [postId]);

  // ----------------------------------------------------
  // MENTION AUTOCOMPLETE HANDLER
  // ----------------------------------------------------
  const handleInputChange = (text: string, targetId: string) => {
    if (targetId === 'main') {
      setNewCommentText(text);
    } else {
      setReplyTexts(prev => ({ ...prev, [targetId]: text }));
    }

    const words = text.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    if (lastWord.startsWith('@')) {
      const queryStr = lastWord.slice(1).toLowerCase();
      const filtered = firestoreUsers.filter(u => 
        u.name.toLowerCase().includes(queryStr) || 
        (u.username && u.username.toLowerCase().includes(queryStr))
      ).slice(0, 5);

      setMentionSuggestions(filtered);
      setActiveMentionTarget({ targetId, query: queryStr });
    } else {
      setMentionSuggestions([]);
      setActiveMentionTarget(null);
    }
  };

  const handleSelectMention = (user: MentionUser, targetId: string) => {
    const text = targetId === 'main' ? newCommentText : (replyTexts[targetId] || '');
    const words = text.split(/\s+/);
    words[words.length - 1] = `@${user.name} `;
    const updatedText = words.join(' ');

    if (targetId === 'main') {
      setNewCommentText(updatedText);
    } else {
      setReplyTexts(prev => ({ ...prev, [targetId]: updatedText }));
    }

    setMentionSuggestions([]);
    setActiveMentionTarget(null);
  };

  // ----------------------------------------------------
  // ADD COMMENT OR REPLY
  // ----------------------------------------------------
  const handleSendComment = async (parentId: string | null = null) => {
    const textToSend = parentId ? replyTexts[parentId] : newCommentText;
    const imgToSend = commentImageUrl;

    if (!textToSend?.trim() && !imgToSend) return;
    if (!currentUser) {
      hotToast.error("কমেন্ট করতে অনুগ্রহ করে লগইন করুন");
      return;
    }

    if (post?.commentsDisabled) {
      hotToast.error("🔒 এই পোস্টের মন্তব্য অপশন বন্ধ রাখা হয়েছে।");
      return;
    }

    // Extract mention user IDs
    const mentionMatches: string[] = (textToSend ? textToSend.match(/@([a-zA-Z0-9\u0980-\u09FF\s]+)/g) : null) || [];
    const mentionedUids: string[] = [];

    mentionMatches.forEach((m: string) => {
      const cleanName = m.replace('@', '').trim().toLowerCase();
      const foundUser = firestoreUsers.find(u => u.name.toLowerCase().includes(cleanName));
      if (foundUser && !mentionedUids.includes(foundUser.uid)) {
        mentionedUids.push(foundUser.uid);
      }
    });

    try {
      const senderName = userProfile?.name || currentUser.displayName || "সম্মানিত নাগরিক";
      const payload = {
        postId,
        parentId: parentId || null,
        author: senderName,
        authorId: currentUser.uid,
        authorBadge: userProfile?.role === "super_admin" || userProfile?.role === "admin" || userProfile?.role === "moderator",
        authorPhotoUrl: userProfile?.photoURL || currentUser.photoURL || "",
        content: textToSend?.trim() || "",
        imageUrl: imgToSend || null,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        reactions: {},
        isEdited: false,
        hidden: false,
        mentions: mentionedUids
      };

      const docRef = await addDoc(collection(db, "discussion_comments"), cleanUndefined(payload));

      // Increment post comments count
      await updateDoc(doc(db, "discussions", postId), {
        commentsCount: increment(1)
      });

      // Clear input & auto expand replies
      if (parentId) {
        setExpandedRepliesMap(prev => ({ ...prev, [parentId]: true }));
        setReplyTexts(prev => ({ ...prev, [parentId]: "" }));
        setActiveReplyInputId(null);
      } else {
        setNewCommentText("");
        setCommentImageUrl("");
      }

      // Notifications: Mention
      for (const mUid of mentionedUids) {
        if (mUid !== currentUser.uid) {
          await addDoc(collection(db, "notifications"), cleanUndefined({
            recipientId: mUid,
            senderId: currentUser.uid,
            senderName,
            senderPhotoUrl: userProfile?.photoURL || currentUser.photoURL || '',
            type: 'comment_mention',
            targetType: 'comment',
            targetId: docRef.id,
            postId,
            message: `🏷️ ${senderName} আপনাকে একটি Comment-এ Mention করেছেন।`,
            read: false,
            createdAt: serverTimestamp()
          }));

          await addDoc(collection(db, "comment_mentions"), cleanUndefined({
            commentId: docRef.id,
            postId,
            mentionedUserId: mUid,
            mentionerUserId: currentUser.uid,
            createdAt: serverTimestamp()
          }));
        }
      }

      // Notification: Reply
      if (parentId) {
        const parentComment = comments.find(c => c.id === parentId);
        if (parentComment && parentComment.authorId && parentComment.authorId !== currentUser.uid) {
          await addDoc(collection(db, "notifications"), cleanUndefined({
            recipientId: parentComment.authorId,
            senderId: currentUser.uid,
            senderName,
            senderPhotoUrl: userProfile?.photoURL || currentUser.photoURL || '',
            type: 'comment_reply',
            targetType: 'comment',
            targetId: docRef.id,
            postId,
            message: `💬 ${senderName} আপনার Comment-এ Reply করেছেন।`,
            read: false,
            createdAt: serverTimestamp()
          }));
        }
      } else {
        const postAuthorId = post?.authorId || post?.userId || post?.authorUid || post?.uid;
        if (postAuthorId && postAuthorId !== currentUser.uid) {
          // Notification: Top level comment
          const senderPhotoUrl = userProfile?.photoURL || currentUser.photoURL || '';
          await addDoc(collection(db, "notifications"), cleanUndefined({
            userId: postAuthorId,
            recipientId: postAuthorId,
            actorId: currentUser.uid,
            senderId: currentUser.uid,
            actorName: senderName,
            senderName,
            actorAvatar: senderPhotoUrl,
            senderPhotoUrl,
            type: 'comment',
            targetType: 'post',
            targetId: postId,
            postId,
            title: '💬 পোস্টে মন্তব্য এসেছে',
            message: `${senderName} আপনার পোস্টে মন্তব্য করেছেন।`,
            read: false,
            createdAt: serverTimestamp()
          })).catch(() => {});
        }
      }

      hotToast.success("কমেন্ট পোস্ট করা হয়েছে!");
    } catch (e: any) {
      if (e?.message?.includes("Quota") || e?.code === "resource-exhausted" || e?.message?.includes("quota")) {
        console.warn("Firestore quota reached when posting comment:", e);
        hotToast.error("আজকের ফায়ারস্টোর ফ্রি কোটা সীমা পূর্ণ হয়ে গেছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।");
      } else {
        console.warn("Error adding comment:", e);
        hotToast.error("কমেন্ট পোস্ট করতে সমস্যা হয়েছে।");
      }
    }
  };

  // ----------------------------------------------------
  // COMMENT REACTION HANDLER
  // ----------------------------------------------------
  const handleCommentReaction = async (comment: Comment, reactionType: string) => {
    if (!currentUser) {
      hotToast.error("রিঅ্যাক্ট দিতে লগইন করুন");
      return;
    }

    const currentReactions = comment.reactions || {};
    const updatedReactions: { [key: string]: string[] } = {};
    let removed = false;

    Object.keys(currentReactions).forEach(type => {
      const filtered = (currentReactions[type] || []).filter(uid => uid !== currentUser.uid);
      if (filtered.length > 0) {
        updatedReactions[type] = filtered;
      }
      if (type === reactionType && (currentReactions[type] || []).includes(currentUser.uid)) {
        removed = true;
      }
    });

    if (!removed) {
      if (!updatedReactions[reactionType]) updatedReactions[reactionType] = [];
      updatedReactions[reactionType].push(currentUser.uid);
    }

    const totalLikes = Object.values(updatedReactions).reduce((sum, uids) => sum + uids.length, 0);

    try {
      const commentRef = doc(db, "discussion_comments", comment.id);
      await updateDoc(commentRef, {
        reactions: updatedReactions,
        likes: totalLikes,
        likedBy: Object.values(updatedReactions).flat()
      });

      if (!removed && comment.authorId && comment.authorId !== currentUser.uid) {
        const reactObj = REACTION_TYPES.find(r => r.id === reactionType) || REACTION_TYPES[0];
        const senderName = userProfile?.name || currentUser.displayName || 'সম্মানিত নাগরিক';

        await addDoc(collection(db, "notifications"), cleanUndefined({
          recipientId: comment.authorId,
          senderId: currentUser.uid,
          senderName,
          senderPhotoUrl: userProfile?.photoURL || currentUser.photoURL || '',
          type: 'comment_reaction',
          reactionType,
          targetType: 'comment',
          targetId: comment.id,
          postId: comment.postId,
          message: `${reactObj.emoji} ${senderName} আপনার Comment-এ ${reactObj.bnLabel} Reaction দিয়েছেন।`,
          read: false,
          createdAt: serverTimestamp()
        }));

        await addDoc(collection(db, "comment_reactions"), cleanUndefined({
          commentId: comment.id,
          postId: comment.postId,
          reactionType,
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        }));
      }
    } catch (e) {
      console.warn("Error updating comment reaction:", e);
    }
  };

  // ----------------------------------------------------
  // DELETE COMMENT & REPLIES
  // ----------------------------------------------------
  const handleDeleteComment = async (comment: Comment) => {
    if (!currentUser) return;

    const isCommentOwner = comment.authorId === currentUser.uid;
    const isPostOwner = post?.authorId === currentUser.uid;
    const isAdminOrMod = userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'moderator';

    if (!isCommentOwner && !isPostOwner && !isAdminOrMod) {
      hotToast.error("আপনার এই কমেন্ট মুছার অনুমতি নেই।");
      return;
    }

    if (!window.confirm("আপনি কি নিশ্চিত যে এই কমেন্টটি এবং এর উত্তরসমূহ মুছে ফেলতে চান?")) return;

    try {
      // Delete main comment
      await deleteDoc(doc(db, "discussion_comments", comment.id));

      // Find and delete replies
      const childReplies = comments.filter(r => r.parentId === comment.id);
      for (const reply of childReplies) {
        await deleteDoc(doc(db, "discussion_comments", reply.id));
      }

      const totalDeleted = 1 + childReplies.length;

      await updateDoc(doc(db, "discussions", postId), {
        commentsCount: increment(-totalDeleted)
      });

      hotToast.success("কমেন্টটি মুছে ফেলা হয়েছে।");
      setOpenMenuCommentId(null);
    } catch (e) {
      console.warn("Error deleting comment:", e);
      hotToast.error("কমেন্ট মুছতে সমস্যা হয়েছে।");
    }
  };

  // ----------------------------------------------------
  // EDIT COMMENT SUBMIT
  // ----------------------------------------------------
  const handleEditCommentSubmit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;

    try {
      await updateDoc(doc(db, "discussion_comments", commentId), {
        content: editingCommentText.trim(),
        isEdited: true,
        editedAt: serverTimestamp()
      });
      setEditingCommentId(null);
      setEditingCommentText("");
      hotToast.success("কমেন্ট সম্পাদনা করা হয়েছে!");
    } catch (e) {
      console.warn("Error editing comment:", e);
      hotToast.error("সম্পাদনা ব্যর্থ হয়েছে।");
    }
  };

  // ----------------------------------------------------
  // HIDE / UNHIDE COMMENT
  // ----------------------------------------------------
  const handleToggleHideComment = async (comment: Comment) => {
    try {
      await updateDoc(doc(db, "discussion_comments", comment.id), {
        hidden: !comment.hidden
      });
      hotToast.success(comment.hidden ? "কমেন্ট দৃশ্যমান করা হয়েছে" : "কমেন্ট লুকানো হয়েছে");
      setOpenMenuCommentId(null);
    } catch (e) {
      console.warn("Error toggling hide comment:", e);
    }
  };

  // ----------------------------------------------------
  // IMAGE ATTACHMENT FILE CHANGE
  // ----------------------------------------------------
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for formatting time
  const formatTime = (ts: any) => {
    if (!ts) return "এইমাত্র";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "এইমাত্র";
    if (diff < 3600) return `${Math.floor(diff / 60)} মি`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ঘ`;
    return `${Math.floor(diff / 86400)} দিন`;
  };

  // Helper to format text with mentions
  const renderTextWithMentions = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(@[a-zA-Z0-9_\.\-\u0980-\u09FF\s]+|@\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const cleanName = part.replace(/^@\[?|\]?$/g, '').trim();
        const matched = firestoreUsers.find(u => 
          u.name.toLowerCase() === cleanName.toLowerCase() || 
          (u.username && u.username.toLowerCase() === cleanName.toLowerCase()) ||
          u.uid === cleanName
        );
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (matched) {
                onSelectProfileUser({
                  id: matched.uid,
                  name: matched.name,
                  avatar: matched.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(matched.uid)}`,
                  union: matched.union || 'পুঠিয়া',
                  role: matched.role || 'নাগরিক',
                  postsCount: 5,
                  followersCount: 10,
                  followingCount: 5,
                  isFollowing: followedUsers.includes(matched.uid)
                });
              } else {
                window.location.href = `/profile/${encodeURIComponent(cleanName)}`;
              }
            }}
            className="text-[#1877F2] font-bold cursor-pointer hover:underline bg-blue-50/90 hover:bg-blue-100 px-1.5 py-0.5 rounded-md border border-blue-200/80 inline-flex items-center gap-0.5 my-0.5 text-xs sm:text-sm"
            title={`@${cleanName}-এর প্রোফাইল দেখুন`}
          >
            <span className="font-extrabold text-[#1877F2]">@</span>
            <span>{cleanName}</span>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Filter top-level comments
  const topComments = comments.filter(c => !c.parentId);

  // Sorting top comments
  const sortedComments = [...topComments].sort((a, b) => {
    if (sortType === 'top') return (b.likes || 0) - (a.likes || 0);
    if (sortType === 'oldest') return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); // latest
  });

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Header Bar: Filter Sort & Comment Count */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1 select-none">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <span>💬</span>
            <span>মন্তব্যসমূহ ({comments.length})</span>
          </span>
          {post?.commentsDisabled && (
            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock size={12} />
              <span>বন্ধ রয়েছে</span>
            </span>
          )}
        </div>

        {/* Sort Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1 rounded-full border-0 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>
              {sortType === 'top' ? 'সবচেয়ে প্রাসঙ্গিক' : sortType === 'oldest' ? 'পুরাতন আগে' : 'নতুন আগে'}
            </span>
            <ChevronDown size={14} />
          </button>

          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-40 text-xs font-semibold text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => { setSortType('latest'); setShowSortMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between border-0 bg-transparent cursor-pointer ${sortType === 'latest' ? 'text-[#006a4e] font-bold bg-emerald-50/50' : ''}`}
                >
                  <span>নতুন আগে</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSortType('top'); setShowSortMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between border-0 bg-transparent cursor-pointer ${sortType === 'top' ? 'text-[#006a4e] font-bold bg-emerald-50/50' : ''}`}
                >
                  <span>সবচেয়ে প্রাসঙ্গিক</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSortType('oldest'); setShowSortMenu(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between border-0 bg-transparent cursor-pointer ${sortType === 'oldest' ? 'text-[#006a4e] font-bold bg-emerald-50/50' : ''}`}
                >
                  <span>পুরাতন আগে</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Disabled Banner if Post Comments Closed */}
      {post?.commentsDisabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2">
          <Lock size={16} className="text-amber-700 shrink-0" />
          <span>এই পোস্টের মন্তব্য অপশন পোস্টকারী অথবা মডারেটর কর্তৃক বন্ধ রাখা হয়েছে।</span>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">মন্তব্য লোড হচ্ছে...</div>
        ) : sortedComments.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center text-2xl font-bold">💬</div>
            <p className="font-bold text-slate-700">এখনও কোনো মন্তব্য নেই!</p>
            <p className="text-xs text-slate-500">প্রথম মন্তব্যটি করে আড্ডা আলোচনা শুরু করুন।</p>
          </div>
        ) : (
          sortedComments.map(comment => {
            const replies = comments.filter(r => r.parentId === comment.id);
            const isCommentOwner = comment.authorId === currentUser?.uid;
            const isPostOwner = post?.authorId === currentUser?.uid;
            const isAdminOrMod = userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'moderator';

            // Reaction summary
            const commentReactions = comment.reactions || {};
            const userReactionId = currentUser ? Object.keys(commentReactions).find(type => commentReactions[type]?.includes(currentUser.uid)) : null;
            const userReaction = userReactionId ? REACTION_TYPES.find(r => r.id === userReactionId) : null;

            const isExpanded = expandedRepliesMap[comment.id];

            return (
              <div key={comment.id} className="space-y-2 group/comment-thread">
                
                {/* Top Level Comment Card */}
                <div className="flex gap-2.5 items-start relative">
                  
                  {/* Author Avatar */}
                  <img
                    src={comment.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(comment.authorId)}`}
                    alt={comment.author}
                    onClick={() => {
                      onSelectProfileUser({
                        id: comment.authorId,
                        name: comment.author,
                        avatar: comment.authorPhotoUrl,
                        union: 'পুঠিয়া',
                        role: comment.authorBadge ? 'অ্যাডমিন' : 'নাগরিক',
                        postsCount: 5,
                        followersCount: 15,
                        followingCount: 10,
                        isFollowing: followedUsers.includes(comment.authorId)
                      });
                    }}
                    className="w-9 h-9 rounded-full object-cover bg-slate-100 shrink-0 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-emerald-50"
                  />

                  <div className="flex-1 min-w-0">
                    
                    {/* Comment Bubble & Actions Container */}
                    <div className="relative inline-block max-w-full group/bubble">
                      
                      {/* Editing View or Normal View */}
                      {editingCommentId === comment.id ? (
                        <div className="bg-slate-100 rounded-2xl p-2.5 space-y-2 w-full min-w-[260px] border border-slate-300">
                          <textarea
                            value={editingCommentText}
                            onChange={e => setEditingCommentText(e.target.value)}
                            className="w-full bg-white rounded-xl p-2 text-xs text-slate-900 outline-none border border-slate-200 resize-none font-normal"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 border-0 bg-transparent cursor-pointer"
                            >
                              বাতিল
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditCommentSubmit(comment.id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-[#006a4e] text-white hover:bg-[#00543e] border-0 cursor-pointer shadow-xs"
                            >
                              সংরক্ষণ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`rounded-[20px] px-3.5 py-2.5 inline-block max-w-full text-left break-words shadow-2xs border ${
                          comment.hidden 
                            ? 'bg-slate-100 text-slate-500 border-slate-200' 
                            : 'bg-[#f0f2f5] text-[#050505] border-transparent hover:border-slate-200/80'
                        }`}>
                          {/* Author Name Header */}
                          <div className="flex items-center gap-1.5 leading-snug">
                            <span
                              onClick={() => {
                                onSelectProfileUser({
                                  id: comment.authorId,
                                  name: comment.author,
                                  avatar: comment.authorPhotoUrl,
                                  union: 'পুঠিয়া',
                                  role: comment.authorBadge ? 'অ্যাডমিন' : 'নাগরিক',
                                  postsCount: 5,
                                  followersCount: 15,
                                  followingCount: 10,
                                  isFollowing: followedUsers.includes(comment.authorId)
                                });
                              }}
                              className="text-[13.5px] font-bold text-[#050505] hover:underline cursor-pointer"
                            >
                              {comment.author}
                            </span>
                            {comment.authorBadge && (
                              <FacebookVerifiedBadge name={comment.author} size={14} />
                            )}
                            {comment.authorId === post?.authorId && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-[#006a4e] px-1.5 py-0.2 rounded-md">
                                লেখক
                              </span>
                            )}
                          </div>

                          {/* Comment Content */}
                          {comment.hidden ? (
                            <p className="text-xs italic text-slate-400 mt-1 flex items-center gap-1">
                              <EyeOff size={13} />
                              <span>[এই মন্তব্যটি মডারেটর বা পোস্টকারী লুকিয়েছেন]</span>
                            </p>
                          ) : (
                            <div className="text-[14px] text-[#050505] font-normal leading-relaxed mt-0.5 whitespace-pre-wrap">
                              {renderTextWithMentions(comment.content)}
                            </div>
                          )}

                          {/* Image Attachment */}
                          {comment.imageUrl && !comment.hidden && (
                            <img
                              src={comment.imageUrl}
                              alt="attached"
                              className="rounded-xl max-h-60 w-auto mt-2 border border-slate-200 shadow-2xs"
                            />
                          )}
                        </div>
                      )}

                      {/* Floating Reaction Counts Badge on Bubble Right */}
                      {Object.keys(commentReactions).some(k => (commentReactions[k]?.length || 0) > 0) && (
                        <div className="absolute -bottom-2 right-2 bg-white rounded-full px-2 py-0.5 shadow-xs border border-slate-200 flex items-center gap-1 text-[11px] font-bold text-slate-700 select-none">
                          {Object.keys(commentReactions).map(type => {
                            const count = commentReactions[type]?.length || 0;
                            if (count === 0) return null;
                            const emoji = REACTION_TYPES.find(r => r.id === type)?.emoji || '👍';
                            return (
                              <span key={type} className="flex items-center gap-0.5">
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Bar Under Bubble: Time, Like, Reply, Reaction Badge */}
                    <div className="flex items-center justify-between pt-1 pl-2 text-[12px] font-bold text-slate-500 select-none">
                      <div className="flex items-center gap-3">
                        {/* Time Ago */}
                        <span className="text-slate-400 font-medium">
                          {formatTime(comment.createdAt)}
                        </span>

                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleCommentReaction(comment, userReactionId ? userReactionId : 'like')}
                          className={`hover:underline border-0 bg-transparent cursor-pointer p-0 transition-colors ${
                            userReaction ? `${userReaction.color} font-black` : 'hover:text-slate-900'
                          }`}
                        >
                          {userReaction ? userReaction.bnLabel : 'Like'}
                        </button>

                        {/* Reply Button */}
                        {!post?.commentsDisabled && (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeReplyInputId === comment.id) {
                                setActiveReplyInputId(null);
                              } else {
                                setActiveReplyInputId(comment.id);
                                setReplyTexts(prev => ({
                                  ...prev,
                                  [comment.id]: `@${comment.author} `
                                }));
                              }
                            }}
                            className="hover:underline hover:text-slate-900 border-0 bg-transparent cursor-pointer p-0"
                          >
                            Reply
                          </button>
                        )}

                        {/* Options Menu Toggle & Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuCommentId(openMenuCommentId === comment.id ? null : comment.id)}
                            className="text-slate-400 hover:text-slate-700 border-0 bg-transparent cursor-pointer p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {/* Options Dropdown */}
                          {openMenuCommentId === comment.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setOpenMenuCommentId(null)} />
                              <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-semibold text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                                
                                {/* Edit Option */}
                                {isCommentOwner && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditingCommentText(comment.content);
                                      setOpenMenuCommentId(null);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                                  >
                                    <Pencil size={14} className="text-blue-600" />
                                    <span>✏️ সম্পাদনা করুন</span>
                                  </button>
                                )}

                              {/* Delete Option */}
                              {(isCommentOwner || isPostOwner || isAdminOrMod) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment)}
                                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-bold"
                                >
                                  <Trash2 size={14} />
                                  <span>🗑️ মুছে ফেলুন</span>
                                </button>
                              )}

                              {/* Hide Option */}
                              {(isPostOwner || isAdminOrMod) && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleHideComment(comment)}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                                >
                                  {comment.hidden ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-amber-600" />}
                                  <span>{comment.hidden ? '👁️ প্রকাশ করুন' : '👁️ মন্তব্য লুকান'}</span>
                                </button>
                              )}

                              {/* Report Option */}
                              {!isCommentOwner && onReportComment && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onReportComment(comment.id, comment.content);
                                    setOpenMenuCommentId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-amber-700 flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                                >
                                  <Flag size={14} />
                                  <span>🚩 রিপোর্ট করুন</span>
                                </button>
                              )}

                              {/* Block User Option */}
                              {!isCommentOwner && onBlockUser && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onBlockUser(comment.authorId, comment.author);
                                    setOpenMenuCommentId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-600 flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                                >
                                  <ShieldAlert size={14} />
                                  <span>🚫 ইউজার ব্লক</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Reaction Badge Counter on Right */}
                    {Object.keys(commentReactions).some(k => (commentReactions[k]?.length || 0) > 0) && (
                      <div className="flex items-center gap-1 text-[12px] font-bold text-slate-700 bg-white shadow-2xs rounded-full px-1.5 py-0.5 border border-slate-200/80">
                        <span>{comment.likes || 1}</span>
                        <span>
                          {(() => {
                            const firstReactType = Object.keys(commentReactions).find(k => (commentReactions[k]?.length || 0) > 0);
                            return REACTION_TYPES.find(r => r.id === firstReactType)?.emoji || '❤️';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                    {/* Inline Reply Input Field if Active */}
                    {activeReplyInputId === comment.id && !post?.commentsDisabled && (
                      <div className="mt-2.5 pl-2 flex items-center gap-2 relative">
                        <img
                          src={userProfile?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser?.uid || 'user')}`}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        
                        <div className="flex-1 relative bg-[#f0f2f5] rounded-full px-3 py-1.5 flex items-center border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
                          <input
                            type="text"
                            placeholder={`${comment.author} এর কমেন্টে রিপ্লাই লিখুন...`}
                            value={replyTexts[comment.id] || ''}
                            onChange={e => handleInputChange(e.target.value, comment.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendComment(comment.id);
                              }
                            }}
                            className="w-full bg-transparent text-xs text-slate-900 outline-none font-normal placeholder-slate-500"
                          />

                          {/* Mention Suggestions Floating Dropdown */}
                          {activeMentionTarget?.targetId === comment.id && mentionSuggestions.length > 0 && (
                            <div className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-48 overflow-y-auto">
                              {mentionSuggestions.map(u => (
                                <button
                                  key={u.uid}
                                  type="button"
                                  onClick={() => handleSelectMention(u, comment.id)}
                                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">{u.name}</div>
                                    <div className="text-[10px] text-slate-500">{u.union || 'পুঠিয়া'}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSendComment(comment.id)}
                          disabled={!replyTexts[comment.id]?.trim()}
                          className="w-7 h-7 rounded-full bg-[#006a4e] text-white disabled:opacity-40 flex items-center justify-center shrink-0 border-0 cursor-pointer shadow-xs transition-transform active:scale-90"
                        >
                          <SendHorizontal size={14} />
                        </button>
                      </div>
                    )}

                    {/* View Replies Toggle Button ("View 12 replies" / "12 টি উত্তর দেখুন") */}
                    {replies.length > 0 && (
                      <div className="mt-2 pl-2">
                        {!isExpanded ? (
                          <button
                            type="button"
                            onClick={() => setExpandedRepliesMap(prev => ({ ...prev, [comment.id]: true }))}
                            className="text-[12.5px] font-bold text-[#006a4e] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0"
                          >
                            <span className="text-slate-400">↳</span>
                            <span>{replies.length} টি উত্তর দেখুন (View {replies.length} {replies.length === 1 ? 'reply' : 'replies'})</span>
                            <ChevronDown size={14} className="text-[#006a4e]" />
                          </button>
                        ) : (
                          <div className="mt-2 pl-3 border-l-2 border-emerald-200/80 space-y-3">
                            {/* Nested Replies List */}
                            {replies.map(reply => {
                              const isReplyOwner = reply.authorId === currentUser?.uid;
                              const replyReactions = reply.reactions || {};
                              const userReplyReactionId = currentUser ? Object.keys(replyReactions).find(type => replyReactions[type]?.includes(currentUser.uid)) : null;
                              const userReplyReaction = userReplyReactionId ? REACTION_TYPES.find(r => r.id === userReplyReactionId) : null;

                              return (
                                <div key={reply.id} className="flex gap-2 items-start relative group/reply">
                                  <img
                                    src={reply.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(reply.authorId)}`}
                                    alt={reply.author}
                                    onClick={() => {
                                      onSelectProfileUser({
                                        id: reply.authorId,
                                        name: reply.author,
                                        avatar: reply.authorPhotoUrl,
                                        union: 'পুঠিয়া',
                                        role: reply.authorBadge ? 'অ্যাডমিন' : 'নাগরিক',
                                        postsCount: 3,
                                        followersCount: 8,
                                        followingCount: 4,
                                        isFollowing: followedUsers.includes(reply.authorId)
                                      });
                                    }}
                                    className="w-7 h-7 rounded-full object-cover bg-slate-100 shrink-0 mt-0.5 cursor-pointer hover:opacity-90 transition-opacity ring-1 ring-emerald-100"
                                  />

                                  <div className="flex-1 min-w-0">
                                    <div className="bg-[#f0f2f5] text-[#050505] rounded-[18px] px-3 py-2 inline-block max-w-full text-left break-words">
                                      <div className="flex items-center gap-1.5 leading-snug">
                                        <span
                                          onClick={() => {
                                            onSelectProfileUser({
                                              id: reply.authorId,
                                              name: reply.author,
                                              avatar: reply.authorPhotoUrl,
                                              union: 'পুঠিয়া',
                                              role: reply.authorBadge ? 'অ্যাডমিন' : 'নাগরিক',
                                              postsCount: 3,
                                              followersCount: 8,
                                              followingCount: 4,
                                              isFollowing: followedUsers.includes(reply.authorId)
                                            });
                                          }}
                                          className="text-[12.5px] font-bold text-[#050505] hover:underline cursor-pointer"
                                        >
                                          {reply.author}
                                        </span>
                                        {reply.authorBadge && (
                                          <FacebookVerifiedBadge name={reply.author} size={13} />
                                        )}
                                      </div>

                                      <div className="text-[13px] text-[#050505] font-normal leading-snug mt-0.5 whitespace-pre-wrap">
                                        {renderTextWithMentions(reply.content)}
                                      </div>
                                    </div>

                                    {/* Action Bar for Reply */}
                                    <div className="flex items-center gap-3 pt-1 pl-2 text-[11px] font-bold text-slate-500 select-none">
                                      <button
                                        type="button"
                                        onClick={() => handleCommentReaction(reply, userReplyReactionId ? userReplyReactionId : 'love')}
                                        className={`hover:underline border-0 bg-transparent cursor-pointer p-0 ${
                                          userReplyReaction ? `${userReplyReaction.color} font-black` : 'hover:text-slate-800'
                                        }`}
                                      >
                                        {userReplyReaction ? userReplyReaction.emoji : '❤️ Reaction'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveReplyInputId(comment.id);
                                          setReplyTexts(prev => ({
                                            ...prev,
                                            [comment.id]: `@${reply.author} `
                                          }));
                                        }}
                                        className="hover:underline hover:text-[#006a4e] border-0 bg-transparent cursor-pointer p-0"
                                      >
                                        Reply
                                      </button>

                                      <span className="text-slate-400 font-normal">
                                        · {formatTime(reply.createdAt)}
                                      </span>

                                      {(isReplyOwner || isPostOwner || isAdminOrMod) && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(reply)}
                                          className="text-slate-400 hover:text-rose-600 border-0 bg-transparent cursor-pointer p-0"
                                          title="মুছে ফেলুন"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => setExpandedRepliesMap(prev => ({ ...prev, [comment.id]: false }))}
                              className="text-[11.5px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer bg-transparent border-0 pt-1"
                            >
                              <ChevronUp size={13} />
                              <span>উত্তরগুলো লুকান (Hide replies)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Main Comment Input Bar (Facebook Style Capsule) */}
      {!post?.commentsDisabled && (
        <div className="border-t border-slate-200 pt-3 select-none relative space-y-2">
          
          {/* Image Preview if attached */}
          {commentImageUrl && (
            <div className="relative inline-block ml-2">
              <img src={commentImageUrl} alt="attachment" className="w-16 h-16 object-cover rounded-2xl border border-slate-200 shadow-xs" />
              <button
                type="button"
                onClick={() => setCommentImageUrl("")}
                className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold border-0 cursor-pointer shadow-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Capsule Field */}
          <div className="relative bg-[#f0f2f5] text-[#050505] rounded-[24px] px-4 py-2.5 flex items-center border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-2xs">
            <input
              type="text"
              placeholder={`Write a comment as ${userProfile?.name || currentUser?.displayName || 'সম্মানিত নাগরিক'}...`}
              value={newCommentText}
              onChange={e => handleInputChange(e.target.value, 'main')}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment(null);
                }
              }}
              className="w-full bg-transparent text-[14px] text-slate-900 placeholder-[#65676b] outline-none font-normal"
            />

            {/* Mention Suggestions Floating Dropdown */}
            {activeMentionTarget?.targetId === 'main' && mentionSuggestions.length > 0 && (
              <div className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 max-h-52 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">নাগরিক উল্লেখ্য করুন</div>
                {mentionSuggestions.map(u => (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => handleSelectMention(u, 'main')}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer border-0 bg-transparent transition-colors"
                  >
                    <img src={u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(u.uid)}`} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.union || 'পুঠিয়া'} • {u.profession || 'নাগরিক'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Emoji Bar */}
          {isEmojiDrawerOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 flex items-center gap-2 overflow-x-auto select-none animate-in fade-in duration-150">
              {['👍', '❤️', '🥰', '😂', '😮', '😢', '😡', '👏', '🙏', '🔥', '✨', '💐', '🇧🇩', '💯', '🤝', '🌸'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setNewCommentText(prev => prev + emoji);
                  }}
                  className="text-xl hover:scale-125 transition-transform bg-transparent border-0 cursor-pointer p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Quick GIF Bar */}
          {isGifDrawerOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 animate-in fade-in duration-150">
              {[
                { title: 'Good Job', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif' },
                { title: 'Applause', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
                { title: 'Thumbs Up', url: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif' },
                { title: 'Celebrate', url: 'https://media.giphy.com/media/ely3apij36BJhoZ234/giphy.gif' }
              ].map((gif, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCommentImageUrl(gif.url);
                    setIsGifDrawerOpen(false);
                  }}
                  className="h-14 w-20 rounded-xl overflow-hidden border border-slate-300 hover:opacity-80 transition-opacity shrink-0 bg-slate-200 cursor-pointer p-0"
                >
                  <img src={gif.url} alt={gif.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Hidden Image Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Toolbar: GIF, Emoji, Image Attachment & Send */}
          <div className="flex items-center justify-between px-2 pt-0.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsGifDrawerOpen(!isGifDrawerOpen);
                  setIsEmojiDrawerOpen(false);
                }}
                className={`px-2 py-0.5 text-xs font-black rounded-md border transition-colors cursor-pointer bg-transparent ${
                  isGifDrawerOpen ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-100'
                }`}
              >
                GIF
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEmojiDrawerOpen(!isEmojiDrawerOpen);
                  setIsGifDrawerOpen(false);
                }}
                className={`border-0 bg-transparent cursor-pointer p-0.5 transition-colors ${
                  isEmojiDrawerOpen ? 'text-amber-500 scale-110' : 'text-[#006a4e]'
                }`}
                title="Emoji"
              >
                <Smile size={21} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-600 hover:text-[#006a4e] border-0 bg-transparent cursor-pointer p-0.5 transition-colors"
                title="ছবি যুক্ত করুন"
              >
                <ImageIcon size={21} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSendComment(null)}
              disabled={!newCommentText.trim() && !commentImageUrl}
              className="text-[#006a4e] hover:text-[#00543e] disabled:text-slate-300 border-0 bg-transparent cursor-pointer p-1 transition-colors flex items-center justify-center"
              title="Send"
            >
              <SendHorizontal size={22} className={newCommentText.trim() ? "fill-[#006a4e]/20" : ""} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default FacebookCommentSystem;

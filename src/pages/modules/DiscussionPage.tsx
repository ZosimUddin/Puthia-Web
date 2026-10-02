import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreVertical,
  Flag,
  Sparkles,
  MapPin,
  Smile,
  ShieldCheck,
  Search,
  Globe,
  Bookmark,
  BookmarkCheck,
  Copy,
  Link as LinkIcon,
  Edit3,
  Trash2,
  EyeOff,
  Check,
  X,
  Facebook,
  MessageCircle,
  Send,
  AlertTriangle,
  Users,
  UserCheck,
  UserPlus,
  Link2,
  MoreHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { notificationService } from "../../services/notificationService";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  limit, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  serverTimestamp, 
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  deleteField
} from "firebase/firestore";
import { toast } from "sonner";
import { AddaFacebookHeader } from "../../components/adda/AddaFacebookHeader";
import { StoriesBar } from "../../components/StoriesBar";
import { FbReactionPicker } from "../../components/common/FbReactionPicker";
import { SEO } from "../../components/SEO";
import { CreatePostBox } from "../../components/CreatePostBox";
import { AdvancedCreatePostModal } from "../../components/AdvancedCreatePostModal";
import { PostPhotoGallery } from "../../components/PostPhotoGallery";
import { PostVideoPlayer } from "../../components/PostVideoPlayer";
import { FacebookCommentSystem } from "../../components/comments/FacebookCommentSystem";
import { ImageLightbox } from "../../components/ImageLightbox";
import { AuthModal } from "../../components/AuthModal";
import { useFavorites } from "../../components/FavoriteContext";
import { copyToClipboard } from "../../utils/clipboard";
import { sendNotification } from "../../utils/notificationService";
import { cleanUndefined } from "../../utils/firestoreUtils";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorBadge?: string;
  authorPhotoUrl?: string;
  union?: string;
  category?: string;
  imageUrl?: string;
  videoUrl?: string;
  gallery?: string[];
  images?: string[];
  location?: string;
  feeling?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  userLiked?: boolean;
  userReaction?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  reactions?: Record<string, string>;
  likedBy?: string[];
  isSharedPost?: boolean;
  sharedPostId?: string;
  sharedPostAuthor?: string;
  sharedPostAuthorPhotoUrl?: string;
  sharedPostAuthorId?: string;
  sharedPostContent?: string;
  sharedPostImageUrl?: string;
  sharedPostVideoUrl?: string;
  sharedPostGallery?: string[];
  sharesCount?: number;
}

export default function DiscussionPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useFavorites();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createAction, setCreateAction] = useState<'photo'|'video'|'general'>('general');
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hidden posts for session
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  // Expanded long posts
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  // User profiles cache to show latest real-time names & profile pictures
  const [profilesCache, setProfilesCache] = useState<Record<string, { photoURL?: string; name?: string }>>({});

  // Post 3-Dots Menu
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContentText, setEditContentText] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);

  // Delete Post Confirmation
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Report Modal
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState("স্প্যাম বা বিভ্রান্তিকর তথ্য");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Share Modal
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareCaptionText, setShareCaptionText] = useState("");
  const [sharePrivacy, setSharePrivacy] = useState<"Public" | "Friends" | "Only me">("Public");
  const [isSharingProcess, setIsSharingProcess] = useState(false);
  const [showShareTagSelector, setShowShareTagSelector] = useState(false);
  const [showFriendProfileSelector, setShowFriendProfileSelector] = useState(false);
  const [shareTagSearch, setShareTagSearch] = useState("");
  const [shareFriendSearch, setShareFriendSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    if (showShareTagSelector || showFriendProfileSelector) {
      const fetchUsersForSharing = async () => {
        try {
          const snap = await getDocs(collection(db, 'users'));
          const list: any[] = [];
          snap.forEach(docSnap => {
            const data = docSnap.data();
            if (data.uid && data.name) {
              list.push({
                uid: data.uid,
                name: data.name,
                union: data.union || 'পুঠিয়া',
                avatarUrl: data.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.uid)}`
              });
            }
          });
          setAvailableUsers(list);
        } catch (e) {
          console.error("Error fetching users for share dialog:", e);
          setAvailableUsers([]);
        }
      };
      fetchUsersForSharing();
    }
  }, [showShareTagSelector, showFriendProfileSelector]);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuPostId(null);
      }
    };
    if (activeMenuPostId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuPostId]);

  useEffect(() => {
    // Real-time listener for posts
    const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"), limit(40));
    const unsubscribe = onSnapshot(
      q, 
      async (snapshot) => {
        try {
          const postsPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            let userLiked = false;
            let userReaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null = null;
            
            const reactionsMap = data.reactions && typeof data.reactions === 'object' ? data.reactions : {};
            const likedByArray = Array.isArray(data.likedBy) ? data.likedBy : [];

            if (user) {
              if (reactionsMap[user.uid]) {
                userLiked = true;
                userReaction = reactionsMap[user.uid] as any;
              } else if (likedByArray.includes(user.uid)) {
                userLiked = true;
                userReaction = 'like';
              } else {
                // Fallback query to likes collection
                const likeId = `${docSnap.id}_${user.uid}`;
                try {
                  const likeDoc = await getDoc(doc(db, "likes", likeId));
                  if (likeDoc.exists()) {
                    userLiked = true;
                    userReaction = (likeDoc.data()?.reaction as any) || 'like';
                  }
                } catch (e) {
                  // ignore
                }
              }
            }

            // Calculate real total likes count
            const computedCount = Object.keys(reactionsMap).length > 0 
              ? Object.keys(reactionsMap).length 
              : (data.reactionsCount ?? data.likesCount ?? data.likes ?? likedByArray.length ?? 0);

            return {
              id: docSnap.id,
              content: data.content || "",
              author: data.author || "নাগরিক",
              authorId: data.authorId || "",
              authorBadge: data.authorBadge,
              authorPhotoUrl: data.authorPhotoUrl,
              union: data.union,
              category: data.category,
              imageUrl: data.imageUrl,
              videoUrl: data.videoUrl,
              gallery: data.gallery || [],
              location: data.location,
              feeling: data.feeling,
              likesCount: computedCount,
              commentsCount: data.commentsCount || 0,
              createdAt: data.createdAt,
              userLiked,
              userReaction,
              reactions: reactionsMap,
              likedBy: likedByArray,
              isSharedPost: !!data.isSharedPost,
              sharedPostId: data.sharedPostId || "",
              sharedPostAuthor: data.sharedPostAuthor || "",
              sharedPostAuthorPhotoUrl: data.sharedPostAuthorPhotoUrl || "",
              sharedPostAuthorId: data.sharedPostAuthorId || "",
              sharedPostContent: data.sharedPostContent || "",
              sharedPostImageUrl: data.sharedPostImageUrl || "",
              sharedPostVideoUrl: data.sharedPostVideoUrl || "",
              sharedPostGallery: data.sharedPostGallery || [],
              sharesCount: data.sharesCount || 0
            } as Post;
          });

          const postsData = await Promise.all(postsPromises);
          
          // Sort posts by date descending
          postsData.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime() || 0);
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime() || 0);
            return timeB - timeA;
          });

          setPosts(postsData);
          setLoading(false);
        } catch (err) {
          console.warn("Error reading discussions onSnapshot:", err);
          setLoading(false);
        }
      },
      (error: any) => {
        console.warn("Discussions subscription failed:", error);
        if (error?.code === "resource-exhausted" || error?.message?.includes("quota")) {
          toast.error("ডাটাবেজ লিমিট শেষ হওয়ার কারণে পোস্টগুলো দেখা যাচ্ছে না।");
        }
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (_) {}
      }
    };
  }, [user]);

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    
    // Get unique authorIds
    const uids = Array.from(new Set(posts.map(p => p.authorId).filter(Boolean))) as string[];
    
    // Find uids that are not in cache yet
    const uidsToFetch = uids.filter(uid => !profilesCache[uid]);
    if (uidsToFetch.length === 0) return;

    // Fetch them in batch or individually
    uidsToFetch.forEach(async (uid) => {
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          setProfilesCache(prev => ({
            ...prev,
            [uid]: {
              photoURL: uData.photoURL || uData.avatarUrl || '',
              name: uData.name || uData.displayName || ''
            }
          }));
        }
      } catch (err) {
        console.warn(`Error fetching user profile for cache: ${uid}`, err);
      }
    });
  }, [posts, profilesCache]);

  const handleCreatePost = async (postData: any) => {
    try {
      const { videoFile, ...rawPayload } = postData || {};
      const payload = cleanUndefined({
        ...rawPayload,
        title: rawPayload.title || '',
        content: rawPayload.content || '',
        author: userProfile?.name || user?.displayName || rawPayload.author || "নাগরিক",
        authorId: user?.uid || rawPayload.authorId || "",
        authorPhotoUrl: userProfile?.photoURL || user?.photoURL || rawPayload.authorPhotoUrl || "",
        createdAt: serverTimestamp(),
        likes: 0,
        likesCount: 0,
        reactionsCount: 0,
        reactions: {},
        likedBy: [],
        commentsCount: 0
      });
      await addDoc(collection(db, "discussions"), payload);
      setShowCreateModal(false);
      // Success toast is handled by the modal caller usually, but we keep it here for direct calls
    } catch (error: any) {
      console.error("Post publication failed:", error);
      let errorMsg = "পোস্ট প্রকাশ করতে সমস্যা হয়েছে।";
      
      if (error?.message?.includes("document is too large")) {
        errorMsg = "পোস্টটি অনেক বড় হয়ে গেছে। অনুগ্রহ করে ছবির সংখ্যা বা সাইজ কমান।";
      } else if (error?.code === "resource-exhausted" || error?.message?.includes("quota")) {
        errorMsg = "দুঃখিত, বর্তমানে ডাটাবেজের লিমিট শেষ হয়ে গেছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
      } else if (error?.code === "permission-denied") {
        errorMsg = "আপনার পোস্ট করার অনুমতি নেই। অনুগ্রহ করে আবার লগ-ইন করুন।";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleLike = async (post: Post, reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' = 'like') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const likeId = `${post.id}_${user.uid}`;
    const isSameReaction = post.userLiked && post.userReaction === reaction;
    const isNewLike = !post.userLiked;
    
    // Calculate new state for instant optimistic UI update
    let nextUserLiked = !isSameReaction;
    let nextUserReaction = isSameReaction ? null : reaction;
    let nextLikesCount = post.likesCount;
    if (isSameReaction) {
      nextLikesCount = Math.max(0, post.likesCount - 1);
    } else if (isNewLike) {
      nextLikesCount = post.likesCount + 1;
    }

    const nextReactions = { ...(post.reactions || {}) };
    if (isSameReaction) {
      delete nextReactions[user.uid];
    } else {
      nextReactions[user.uid] = reaction;
    }

    // 1. Instant Optimistic State Update
    setPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      userLiked: nextUserLiked,
      userReaction: nextUserReaction,
      likesCount: nextLikesCount,
      reactions: nextReactions
    } : p));

    // 2. Persist to Firestore Discussions, Likes, and Post_Reactions
    try {
      const postRef = doc(db, "discussions", post.id);
      const likeDocRef = doc(db, "likes", likeId);
      const postReactionRef = doc(db, "post_reactions", `${post.id}_${user.uid}`);

      if (isSameReaction) {
        // Unlike
        await Promise.all([
          deleteDoc(likeDocRef).catch(() => {}),
          deleteDoc(postReactionRef).catch(() => {}),
          updateDoc(postRef, {
            likes: Math.max(0, nextLikesCount),
            likesCount: Math.max(0, nextLikesCount),
            reactionsCount: Math.max(0, nextLikesCount),
            [`reactions.${user.uid}`]: deleteField(),
            likedBy: arrayRemove(user.uid)
          }).catch(async () => {
            await updateDoc(postRef, {
              likes: Math.max(0, nextLikesCount),
              likesCount: Math.max(0, nextLikesCount),
              reactions: nextReactions
            });
          })
        ]);
      } else {
        // Add or Switch Reaction
        const payload = {
          postId: post.id,
          userId: user.uid,
          reaction,
          userName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
          userPhotoUrl: userProfile?.photoURL || user.photoURL || '',
          createdAt: serverTimestamp()
        };

        await Promise.all([
          setDoc(likeDocRef, payload, { merge: true }),
          setDoc(postReactionRef, payload, { merge: true }),
          updateDoc(postRef, {
            likes: nextLikesCount,
            likesCount: nextLikesCount,
            reactionsCount: nextLikesCount,
            [`reactions.${user.uid}`]: reaction,
            likedBy: arrayUnion(user.uid)
          }).catch(async () => {
            await updateDoc(postRef, {
              likes: nextLikesCount,
              likesCount: nextLikesCount,
              reactions: nextReactions
            });
          })
        ]);

        const postAuthorId = post.authorId || (post as any).userId || (post as any).authorUid || (post as any).uid;
        if (postAuthorId && postAuthorId !== user.uid && isNewLike) {
          const actorName = userProfile?.name || user.displayName || 'সম্মানিত নাগরিক';
          const actorAvatar = userProfile?.photoURL || user.photoURL || '';
          
          sendNotification(
            postAuthorId,
            user.uid,
            actorName,
            actorAvatar,
            'POST_REACTION',
            post.id,
            'post',
            `আপনার পোস্টে রিয়্যাক্ট দিয়েছেন।`
          ).catch(() => {});

          notificationService.dispatchNotification({
            recipientId: postAuthorId,
            actorId: user.uid,
            actorName,
            actorAvatar,
            type: 'reaction',
            targetId: post.id,
            targetType: 'post',
            title: '❤️ পোস্টে রিয়্যাক্ট এসেছে',
            message: `${actorName} আপনার পোস্টে রিয়্যাক্ট করেছেন।`,
            actionData: { postId: post.id }
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const handleToggleBookmark = (post: Post) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const currentlySaved = isBookmarked(post.id);
    toggleBookmark({
      id: post.id,
      type: 'discussion',
      title: post.content.slice(0, 60) || 'আড্ডা পোস্ট',
      subtitle: `${post.author}-এর পোস্ট`,
      authorName: post.author,
      postContent: post.content,
      postId: post.id,
      image: post.gallery?.[0] || post.imageUrl || '',
      link: '/adda'
    });
    setActiveMenuPostId(null);
    if (currentlySaved) {
      toast.info("সংরক্ষিত তালিকা থেকে সরানো হয়েছে");
    } else {
      toast.success("পোস্টটি সফলভাবে সংরক্ষণ করা হয়েছে");
    }
  };

  const handleCopyLink = async (postId: string) => {
    const shareUrl = `${window.location.origin}/adda#post-${postId}`;
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success("পোস্টের লিংক কপি করা হয়েছে!");
    } else {
      toast.error("লিংক কপি করা যায়নি");
    }
    setActiveMenuPostId(null);
  };

  const handleSaveEditedPost = async () => {
    if (!editingPost || !editContentText.trim()) return;
    setIsUpdatingPost(true);
    try {
      await updateDoc(doc(db, "discussions", editingPost.id), {
        content: editContentText.trim(),
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, content: editContentText.trim() } : p));
      toast.success("পোস্ট সফলভাবে সম্পাদনা করা হয়েছে");
      setEditingPost(null);
    } catch (err) {
      console.error("Edit post error:", err);
      toast.error("পোস্ট সম্পাদনা করতে সমস্যা হয়েছে");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    try {
      await deleteDoc(doc(db, "discussions", postToDelete.id));
      setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
      toast.success("পোস্টটি সফলভাবে মুছে ফেলা হয়েছে");
      setPostToDelete(null);
    } catch (err) {
      console.error("Delete post error:", err);
      toast.error("পোস্ট মুছতে সমস্যা হয়েছে");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportingPost) return;
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "reports"), cleanUndefined({
        targetId: reportingPost.id,
        targetType: "discussion",
        targetAuthorId: reportingPost.authorId || '',
        targetAuthorName: reportingPost.author || '',
        reason: reportReason,
        details: reportDetails.trim(),
        reporterId: user?.uid || "anonymous",
        reporterName: userProfile?.name || user?.displayName || "নাগরিক",
        createdAt: serverTimestamp(),
        status: "pending"
      }));
      toast.success("আপনার রিপোর্ট গ্রহণ করা হয়েছে। পর্যালোচনা করে ব্যবস্থা নেওয়া হবে।");
      setReportingPost(null);
      setReportDetails("");
    } catch (err) {
      console.error("Report error:", err);
      toast.error("রিপোর্ট জমা দিতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleShareClick = (post: Post) => {
    setShareCaptionText("");
    setSharingPost(post);
  };

  const openLightbox = (post: Post, index: number, images: string[]) => {
    setLightboxPost(post);
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Handler when clicking a user mention tag like @mdzosimuddin47
  const handleMentionClick = async (mentionText: string) => {
    const cleanHandle = mentionText.replace(/^@\[?|\]?$/g, '').trim();
    if (!cleanHandle) return;

    const toastId = toast.loading(`@${cleanHandle}-এর প্রোফাইল খোঁজা হচ্ছে...`);

    try {
      // 1. Query Firestore users by username (case-insensitive)
      const usersRef = collection(db, "users");
      const qUsername = query(usersRef, where("username", "==", cleanHandle.toLowerCase()), limit(1));
      const snapUsername = await getDocs(qUsername);

      if (!snapUsername.empty) {
        toast.dismiss(toastId);
        navigate(`/profile/${snapUsername.docs[0].id}`);
        return;
      }

      // 2. Query Firestore users by display name
      const qName = query(usersRef, where("name", "==", cleanHandle), limit(1));
      const snapName = await getDocs(qName);

      if (!snapName.empty) {
        toast.dismiss(toastId);
        navigate(`/profile/${snapName.docs[0].id}`);
        return;
      }

      // 3. Fallback: navigate directly to profile by username or handle
      toast.dismiss(toastId);
      navigate(`/profile/${encodeURIComponent(cleanHandle)}`);
    } catch (err) {
      console.warn("Mention navigation fallback error:", err);
      toast.dismiss(toastId);
      navigate(`/profile/${encodeURIComponent(cleanHandle)}`);
    }
  };

  // Helper to parse and format post text with interactive @mentions, #hashtags, and links
  const renderFormattedPostContent = (text: string) => {
    if (!text) return null;

    // Split text by @mentions, #hashtags, or URLs
    const regex = /(@\[[^\]]+\]|@[a-zA-Z0-9_\.\-\u0980-\u09FF]+|#[a-zA-Z0-9_\u0980-\u09FF]+|https?:\/\/[^\s]+)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Render @mentions
      if (part.startsWith('@')) {
        const cleanName = part.replace(/^@\[?|\]?$/g, '');
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              handleMentionClick(part);
            }}
            className="inline-flex items-center font-bold text-[#1877F2] bg-blue-50/90 hover:bg-blue-100 hover:text-blue-700 px-2 py-0.5 rounded-lg cursor-pointer transition-all border border-blue-200/80 mx-0.5 my-0.5 shadow-2xs text-[13.5px] sm:text-[14.5px] active:scale-95 border-blue-300/50"
            title={`@${cleanName}-এর প্রোফাইল দেখুন`}
          >
            <span className="text-[#1877F2] font-black mr-0.5">@</span>
            <span>{cleanName}</span>
          </span>
        );
      }

      // Render #hashtags
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              toast.info(`'${part}' ট্যাগের পোস্ট খুঁজছেন`);
            }}
            className="font-bold text-[#1877F2] hover:underline cursor-pointer mx-0.5 text-[14px] sm:text-[15px]"
          >
            {part}
          </span>
        );
      }

      // Render URLs
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#1877F2] underline hover:text-blue-700 font-medium break-all mx-0.5"
          >
            {part}
          </a>
        );
      }

      return <span key={i}>{part}</span>;
    });
  };

  const renderPostReactionIcons = (post: Post) => {
    // Collect all unique reactions
    const presentReactions = new Set<string>();
    if (post.reactions && typeof post.reactions === 'object') {
      Object.values(post.reactions).forEach((r) => {
        if (r) presentReactions.add(r);
      });
    }
    if (post.userReaction) {
      presentReactions.add(post.userReaction);
    }
    if (presentReactions.size === 0 && (post.likesCount > 0 || post.userLiked)) {
      presentReactions.add('like');
    }

    const emojiConfig: Record<string, { emoji: string; bg: string }> = {
      like: { emoji: '👍', bg: 'bg-[#1877F2]' },
      love: { emoji: '❤️', bg: 'bg-[#E41E3F]' },
      haha: { emoji: '😆', bg: 'bg-[#F7B125]' },
      wow: { emoji: '😮', bg: 'bg-[#F7B125]' },
      sad: { emoji: '😢', bg: 'bg-[#F7B125]' },
      angry: { emoji: '😡', bg: 'bg-[#E44D3A]' },
    };

    const reactionList = Array.from(presentReactions).slice(0, 3);

    return (
      <div className="flex items-center -space-x-1">
        {reactionList.map((rKey, idx) => {
          const item = emojiConfig[rKey] || emojiConfig.like;
          return (
            <div
              key={rKey}
              style={{ zIndex: 10 - idx }}
              className={`w-5 h-5 rounded-full ${item.bg} flex items-center justify-center text-white text-[10px] border border-white font-bold shadow-2xs`}
            >
              {item.emoji}
            </div>
          );
        })}
      </div>
    );
  };

  const visiblePosts = posts.filter(p => !hiddenPostIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans pb-12">
      <SEO 
        title="আড্ডা – পুঠিয়ার মানুষের নিজস্ব সামাজিক প্ল্যাটফর্ম" 
        description="পোস্ট করুন, ছবি ও ভিডিও শেয়ার করুন, মতামত জানান এবং পুঠিয়ার মানুষের সঙ্গে যুক্ত থাকুন।"
        path="/adda"
      />
      <AddaFacebookHeader 
        onOpenCreateModal={(action) => {
          setCreateAction(action || 'general');
          setShowCreateModal(true);
        }}
      />
      
      <main className="flex-1 w-full max-w-2xl mx-auto md:py-3 px-0 sm:px-2">
        <CreatePostBox 
          onOpenCreateModal={(action) => {
            setCreateAction(action || 'general');
            setShowCreateModal(true);
          }} 
        />

        <div className="mb-2 sm:mb-3">
          <StoriesBar />
        </div>

        <div className="flex flex-col space-y-2 sm:space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-9 w-9 border-3 border-emerald-600 border-t-transparent"></div>
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-none sm:rounded-2xl mx-0 sm:mx-2 p-8 shadow-xs border border-slate-200">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">এখনও কোনো পোস্ট নেই</p>
              <p className="text-xs text-slate-400 mt-1">প্রথম পোস্টটি আপনিই প্রকাশ করুন!</p>
            </div>
          ) : (
            visiblePosts.map(post => {
              const allImages = post.gallery?.length 
                ? post.gallery 
                : (post.images?.length 
                    ? post.images 
                    : (post.imageUrl ? [post.imageUrl] : [])
                  );
              const isAuthor = Boolean(user && post.authorId && user.uid === post.authorId);
              const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';
              const canEditOrDelete = isAuthor || isAdmin;
              const postBookmarked = isBookmarked(post.id);

              const authorPhoto = profilesCache[post.authorId]?.photoURL || post.authorPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId || post.author}`;
              const authorName = profilesCache[post.authorId]?.name || post.author;

              return (
                <div 
                  key={post.id} 
                  id={`post-${post.id}`}
                  className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-slate-200/80 shadow-2xs relative overflow-visible transition-all"
                >
                  {/* Post Header */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (post.authorId) {
                            navigate(`/profile/${post.authorId}`, { state: { from: '/discussion' } });
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 hover:ring-2 hover:ring-[#1877F2] active:scale-95 transition cursor-pointer p-0 text-left"
                        title={`${authorName}-এর প্রোফাইল দেখুন`}
                      >
                        <img 
                          src={authorPhoto} 
                          alt={authorName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => {
                              if (post.authorId) {
                                navigate(`/profile/${post.authorId}`, { state: { from: '/discussion' } });
                              }
                            }}
                            className="font-bold text-slate-900 text-sm hover:underline hover:text-[#1877F2] transition cursor-pointer p-0 border-0 bg-transparent text-left"
                          >
                            {authorName}
                          </button>
                          {post.authorBadge && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1877F2]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>
                            {post.createdAt?.seconds 
                              ? formatDistanceToNow(post.createdAt.seconds * 1000, { addSuffix: true, locale: bn })
                              : 'কিছুক্ষণ আগে'}
                          </span>
                          <span className="text-[10px]">•</span>
                          <Globe className="w-3 h-3 text-slate-400" />
                          {post.location && (
                            <>
                              <span className="text-[10px]">•</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400"/> {post.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3-Dots Post Options Menu */}
                    <div className="relative" ref={activeMenuPostId === post.id ? menuRef : null}>
                      <button 
                        onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer p-0"
                        title="পোস্ট বিকল্প"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuPostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -6 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs font-semibold text-slate-700"
                          >
                            {/* Save / Bookmark */}
                            <button
                              onClick={() => handleToggleBookmark(post)}
                              className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                            >
                              {postBookmarked ? (
                                <>
                                  <BookmarkCheck size={16} className="text-amber-600 fill-amber-600" />
                                  <span className="text-amber-700 font-bold">সংরক্ষণ থেকে সরান</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark size={16} className="text-slate-500" />
                                  <span>পোস্ট সংরক্ষণ করুন</span>
                                </>
                              )}
                            </button>

                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(post.id)}
                              className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                            >
                              <Copy size={16} className="text-slate-500" />
                              <span>লিংক কপি করুন</span>
                            </button>

                            {/* Hide Post */}
                            <button
                              onClick={() => {
                                setHiddenPostIds(prev => [...prev, post.id]);
                                setActiveMenuPostId(null);
                                toast.info("পোস্টটি লুকানো হয়েছে");
                              }}
                              className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition text-left cursor-pointer"
                            >
                              <EyeOff size={16} className="text-slate-500" />
                              <span>পোস্ট লুকান</span>
                            </button>

                            {/* Edit Post (Author/Admin) */}
                            {canEditOrDelete && (
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setEditContentText(post.content);
                                  setActiveMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-blue-50 text-blue-700 transition text-left cursor-pointer font-bold border-t border-slate-100"
                              >
                                <Edit3 size={16} className="text-blue-600" />
                                <span>পোস্ট সম্পাদনা করুন</span>
                              </button>
                            )}

                            {/* Delete Post (Author/Admin) */}
                            {canEditOrDelete && (
                              <button
                                onClick={() => {
                                  setPostToDelete(post);
                                  setActiveMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer font-bold border-t border-slate-100"
                              >
                                <Trash2 size={16} className="text-red-600" />
                                <span>পোস্ট মুছে ফেলুন</span>
                              </button>
                            )}

                            {/* Report Post (Others) */}
                            {!isAuthor && (
                              <button
                                onClick={() => {
                                  setReportingPost(post);
                                  setActiveMenuPostId(null);
                                }}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition text-left cursor-pointer border-t border-slate-100"
                              >
                                <Flag size={16} className="text-red-500" />
                                <span>রিপোর্ট করুন</span>
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-3.5 sm:px-4 pb-2">
                    {post.feeling && (
                      <div className="text-xs text-slate-700 mb-2 font-medium flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg w-fit border border-amber-100">
                        <Smile className="w-3.5 h-3.5 text-amber-600" />
                        <span>অনুভব করছেন: <strong>{post.feeling}</strong></span>
                      </div>
                    )}
                    <div className="text-slate-800 text-[14px] sm:text-[15px] whitespace-pre-wrap leading-relaxed">
                      {(() => {
                        const shouldTruncate = post.content && post.content.length > 200;
                        const isExpanded = expandedPosts[post.id];
                        const textToShow = shouldTruncate && !isExpanded 
                          ? post.content.slice(0, 180) 
                          : post.content;
                        
                        return (
                          <>
                            {renderFormattedPostContent(textToShow)}
                            {shouldTruncate && !isExpanded && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPosts(prev => ({ ...prev, [post.id]: true }));
                                }}
                                className="font-bold text-slate-500 hover:text-slate-800 ml-1 transition-colors cursor-pointer inline-block"
                              >
                                ...see more
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                   {/* Media (Photos / Video) or Nested Shared Post */}
                  {post.isSharedPost ? (
                    <div className="mx-3 mb-2.5 p-2.5 border border-slate-200/70 rounded-xl bg-slate-50/30 hover:bg-slate-50/60 transition shadow-2xs">
                      {/* Shared Post Author info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7.5 h-7.5 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                          <img 
                            src={post.sharedPostAuthorPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.sharedPostAuthor || 'user'}`} 
                            alt={post.sharedPostAuthor}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs leading-none">{post.sharedPostAuthor || "নাগরিক"}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">শেয়ারকৃত পোস্ট</p>
                        </div>
                      </div>

                      {/* Shared Content */}
                      {post.sharedPostContent && (
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mb-2.5">
                          {renderFormattedPostContent(post.sharedPostContent)}
                        </p>
                      )}

                      {/* Shared Images/Video inside nested */}
                      {post.sharedPostGallery && post.sharedPostGallery.length > 0 ? (
                        <div className="rounded-lg overflow-hidden border border-slate-100">
                          <PostPhotoGallery 
                            images={post.sharedPostGallery} 
                            onImageClick={(idx) => openLightbox(post, idx, post.sharedPostGallery || [])} 
                          />
                        </div>
                      ) : post.sharedPostImageUrl ? (
                        <div className="rounded-lg overflow-hidden border border-slate-100">
                          <PostPhotoGallery 
                            images={[post.sharedPostImageUrl]} 
                            onImageClick={(idx) => openLightbox(post, idx, [post.sharedPostImageUrl || ""])} 
                          />
                        </div>
                      ) : null}

                      {post.sharedPostVideoUrl && (!post.sharedPostGallery || !post.sharedPostGallery.length) && !post.sharedPostImageUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-100">
                          <PostVideoPlayer src={post.sharedPostVideoUrl} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {allImages.length > 0 && (
                        <div className="mt-1">
                          <PostPhotoGallery 
                            images={allImages} 
                            onImageClick={(idx) => openLightbox(post, idx, allImages)} 
                          />
                        </div>
                      )}
                      {post.videoUrl && !allImages.length && (
                        <div className="mt-1">
                          <PostVideoPlayer src={post.videoUrl} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Post Stats (Only shown if likes > 0, comments > 0, or shares > 0) */}
                  {((post.likesCount || 0) > 0 || (post.commentsCount || 0) > 0 || (post.sharesCount || 0) > 0) && (
                    <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-slate-500 mx-2 border-b border-slate-100/60 mb-1">
                      <div className="flex items-center gap-1.5">
                        {post.likesCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            {renderPostReactionIcons(post)}
                            <span className="font-bold text-slate-700 dark:text-slate-200">{post.likesCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-400">
                        {post.commentsCount > 0 && (
                          <span 
                            onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                            className="hover:underline cursor-pointer"
                          >
                            {post.commentsCount}টি মন্তব্য
                          </span>
                        )}
                        {post.sharesCount && post.sharesCount > 0 ? (
                          <span 
                            onClick={() => handleShareClick(post)}
                            className="hover:underline cursor-pointer"
                          >
                            {post.sharesCount}টি শেয়ার
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Facebook Lite Style Action Pills */}
                  <div className="px-2 pb-2 pt-1 flex items-center justify-between gap-2">
                    {/* Pill 1: Reaction Button */}
                    <div className="flex-1">
                      <FbReactionPicker
                        userLiked={post.userLiked}
                        userReaction={post.userReaction}
                        likesCount={post.likesCount}
                        showPillWithCount={true}
                        onToggleLike={() => handleLike(post, post.userReaction || 'like')}
                        onSelectReaction={(rId) => handleLike(post, rId)}
                        className="w-full"
                      />
                    </div>

                    {/* Pill 2: Comment Button */}
                    <button 
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      className={`flex-1 py-2 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-[13px] border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        activeCommentPost === post.id 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'bg-[#f0f2f5] text-[#050505] border-slate-200/80 hover:bg-[#e4e6eb]'
                      }`}
                    >
                      <MessageSquare size={16} />
                      <span>কমেন্ট</span>
                      {post.commentsCount > 0 && <span>({post.commentsCount})</span>}
                    </button>

                    {/* Pill 3: Share Button */}
                    <button 
                      onClick={() => handleShareClick(post)}
                      className="flex-1 py-2 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-[13px] border bg-[#f0f2f5] text-[#050505] border-slate-200/80 hover:bg-[#e4e6eb] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Share2 size={16} />
                      <span>শেয়ার</span>
                      {post.sharesCount && post.sharesCount > 0 ? <span>({post.sharesCount})</span> : null}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Facebook Style Bottom Sheet Comments Modal */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setActiveCommentPost(null)} 
          />
          <div className="relative z-10 bg-white w-full max-w-2xl mx-auto rounded-t-[28px] shadow-2xl max-h-[88vh] h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 overflow-hidden">
            {/* Drag Handle Bar */}
            <div className="pt-2.5 pb-1 bg-white cursor-pointer flex justify-center" onClick={() => setActiveCommentPost(null)}>
              <div className="w-12 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Header (Matching Screenshot) */}
            <div className="px-4 py-2 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-1.5">
                {(posts.find(p => p.id === activeCommentPost)?.likesCount || 0) > 0 ? (
                  <>
                    {renderPostReactionIcons(posts.find(p => p.id === activeCommentPost)!)}
                    <span className="text-xs font-bold text-slate-800">
                      {posts.find(p => p.id === activeCommentPost)?.likesCount}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-slate-800">কমেন্টসমূহ</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    const p = posts.find(p => p.id === activeCommentPost);
                    if (p) handleLike(p, p.userReaction || 'like');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
                  title="লাইক"
                >
                  <ThumbsUp size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const p = posts.find(p => p.id === activeCommentPost);
                    if (p) handleShareClick(p);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
                  title="শেয়ার"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveCommentPost(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Comment System Container */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-white">
              {(() => {
                const activePost = posts.find(p => p.id === activeCommentPost);
                if (!activePost) return null;
                return (
                  <FacebookCommentSystem 
                    postId={activePost.id}
                    post={activePost}
                    currentUser={user}
                    userProfile={userProfile}
                    firestoreUsers={[]}
                    onSelectProfileUser={(pUser) => {
                      setActiveCommentPost(null);
                      navigate(`/profile/${pUser.id || pUser.uid}`, { state: { from: '/discussion' } });
                    }}
                    isModal={true}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="text-blue-600" size={18} />
                <span>পোস্ট সম্পাদনা করুন</span>
              </h3>
              <button 
                onClick={() => setEditingPost(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <textarea
                value={editContentText}
                onChange={(e) => setEditContentText(e.target.value)}
                rows={5}
                placeholder="আপনার পোস্ট লিখুন..."
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isUpdatingPost || !editContentText.trim()}
                  onClick={handleSaveEditedPost}
                  className="px-5 py-2 text-xs font-bold bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {isUpdatingPost ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-5 flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">পোস্ট মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500 mb-5">
              এই পোস্টটি মুছে ফেললে তা আর পুনরুদ্ধার করা যাবে না।
            </p>
            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={handleDeletePost}
                className="flex-1 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition"
              >
                {isDeletingPost ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flag className="text-red-500" size={18} />
                <span>পোস্ট রিপোর্ট করুন</span>
              </h3>
              <button 
                onClick={() => setReportingPost(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-700">রিপোর্টের কারণ নির্বাচন করুন:</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 bg-white"
              >
                <option value="স্প্যাম বা বিভ্রান্তিকর তথ্য">স্প্যাম বা বিভ্রান্তিকর তথ্য</option>
                <option value="অনুপযুক্ত বা আপত্তিকর বিষয়বস্তু">অনুপযুক্ত বা আপত্তিকর বিষয়বস্তু</option>
                <option value="মিথ্যা বা গুজব ছড়ানো">মিথ্যা বা গুজব ছড়ানো</option>
                <option value="হয়রানি বা ঘৃণামূলক বক্তব্য">হয়রানি বা ঘৃণামূলক বক্তব্য</option>
                <option value="কপিরাইট লঙ্ঘন">কপিরাইট লঙ্ঘন</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>

              <label className="text-xs font-bold text-slate-700 mt-1">অতিরিক্ত বিবরণ (ঐচ্ছিক):</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="সমস্যাটি সম্পর্কে সংক্ষেপে বলুন..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReport}
                  onClick={handleSubmitReport}
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition"
                >
                  {isSubmittingReport ? 'জমা হচ্ছে...' : 'রিপোর্ট জমা দিন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Mobile Style Share Bottom Sheet Drawer */}
      {sharingPost && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setSharingPost(null)} 
          />
          
          <div className="relative z-10 bg-[#f7f8fa] w-full max-w-2xl mx-auto rounded-t-[28px] shadow-2xl p-4 flex flex-col animate-in slide-in-from-bottom duration-250 max-h-[90vh] overflow-y-auto">
            {/* Top Sheet Drag Handle Bar */}
            <div className="pt-1 pb-3 flex justify-center cursor-pointer" onClick={() => setSharingPost(null)}>
              <div className="w-12 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Inner White Post Share Card */}
            <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-slate-200/80 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'user'}`}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {userProfile?.name || user?.displayName || "Riya Islam"}
                    </h3>
                    <div className="relative inline-block mt-0.5">
                      <button 
                        type="button"
                        onClick={() => setSharePrivacy(sharePrivacy === 'Public' ? 'Friends' : sharePrivacy === 'Friends' ? 'Only me' : 'Public')}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700 transition"
                      >
                        <Globe size={11} />
                        <span>{sharePrivacy}</span>
                        <span className="text-[10px]">▾</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setSharingPost(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition"
                >
                  ✕
                </button>
              </div>

              {/* Textarea for "Say something about this..." */}
              <textarea
                value={shareCaptionText}
                onChange={(e) => setShareCaptionText(e.target.value)}
                placeholder="Say something about this..."
                rows={2}
                className="w-full text-sm outline-none border-0 resize-none py-1 text-slate-800 placeholder:text-slate-400 font-normal bg-transparent"
              />

              {/* Tag Selector for Share */}
              {showShareTagSelector && (
                <div className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">ট্যাগ করার জন্য নাগরিক নির্বাচন করুন:</span>
                    <button 
                      type="button" 
                      onClick={() => setShowShareTagSelector(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-transparent border-0 cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="নাম দিয়ে খুঁজুন..."
                    value={shareTagSearch}
                    onChange={(e) => setShareTagSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold"
                  />
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-1 rounded-lg border border-slate-100">
                    {availableUsers
                      .filter(u => !shareTagSearch || u.name.toLowerCase().includes(shareTagSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(u => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setShareCaptionText(prev => prev ? `${prev} @${u.name} ` : `@${u.name} `);
                            setShowShareTagSelector(false);
                            setShareTagSearch("");
                            toast.success(`@${u.name} ট্যাগ করা হয়েছে!`);
                          }}
                          className="w-full flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded transition text-left border-0 bg-transparent cursor-pointer"
                        >
                          <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                          </div>
                        </button>
                      ))}
                    {availableUsers.filter(u => !shareTagSearch || u.name.toLowerCase().includes(shareTagSearch.toLowerCase())).length === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold py-2 text-center">কোনো নাগরিক পাওয়া যায়নি</p>
                    )}
                  </div>
                </div>
              )}

              {/* Friend Profile Selector for Share */}
              {showFriendProfileSelector && (
                <div className="p-3 border border-slate-100 rounded-xl bg-blue-50/30 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <UserCheck size={14} className="text-blue-600" />
                      বন্ধুর প্রোফাইল নির্বাচন করুন (Share to wall)
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowFriendProfileSelector(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-transparent border-0 cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="বন্ধুর নাম দিয়ে খুঁজুন..."
                    value={shareFriendSearch}
                    onChange={(e) => setShareFriendSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold"
                  />
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-1 rounded-lg border border-slate-100">
                    {availableUsers
                      .filter(u => !shareFriendSearch || u.name.toLowerCase().includes(shareFriendSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(u => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={async () => {
                            setIsSharingProcess(true);
                            try {
                              await addDoc(collection(db, "discussions"), cleanUndefined({
                                title: '',
                                content: shareCaptionText,
                                author: userProfile?.name || user?.displayName || "নাগরিক",
                                authorId: user?.uid || "",
                                authorPhotoUrl: userProfile?.photoURL || user?.photoURL || "",
                                createdAt: serverTimestamp(),
                                likes: 0,
                                commentsCount: 0,
                                isSharedPost: true,
                                sharedPostId: sharingPost.id,
                                sharedPostAuthor: sharingPost.author,
                                sharedPostAuthorPhotoUrl: sharingPost.authorPhotoUrl || "",
                                sharedPostAuthorId: sharingPost.authorId || "",
                                sharedPostContent: sharingPost.content || "",
                                sharedPostImageUrl: sharingPost.imageUrl || (sharingPost.gallery && sharingPost.gallery[0]) || "",
                                sharedPostVideoUrl: sharingPost.videoUrl || "",
                                sharedPostGallery: sharingPost.gallery || [],
                                union: userProfile?.union || "পুঠিয়া"
                              }));

                              await updateDoc(doc(db, "discussions", sharingPost.id), {
                                sharesCount: increment(1)
                              }).catch(() => {});

                              toast.success(`@${u.name}-এর ওয়ালে পোস্টটি শেয়ার করা হয়েছে!`);
                              setShowFriendProfileSelector(false);
                              setShareFriendSearch("");
                              setSharingPost(null);
                            } catch (e) {
                              console.error("Share on friend wall error", e);
                              toast.error("শেয়ার করতে সমস্যা হয়েছে");
                            } finally {
                              setIsSharingProcess(false);
                            }
                          }}
                          className="w-full flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded transition text-left border-0 bg-transparent cursor-pointer"
                        >
                          <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                            <p className="text-[9px] text-slate-400">{u.union}</p>
                          </div>
                        </button>
                      ))}
                    {availableUsers.filter(u => !shareFriendSearch || u.name.toLowerCase().includes(shareFriendSearch.toLowerCase())).length === 0 && (
                      <p className="text-[10px] text-slate-400 font-bold py-2 text-center">কোনো বন্ধু পাওয়া যায়নি</p>
                    )}
                  </div>
                </div>
              )}

              {/* Card Footer: Tag Icon + Share Now Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowShareTagSelector(!showShareTagSelector);
                    setShowFriendProfileSelector(false);
                  }}
                  className={`p-1.5 rounded-full transition cursor-pointer ${showShareTagSelector ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                  title="Tag people"
                >
                  <UserPlus size={18} />
                </button>

                 <button
                  type="button"
                  disabled={isSharingProcess}
                  onClick={async () => {
                    setIsSharingProcess(true);
                    try {
                      await addDoc(collection(db, "discussions"), cleanUndefined({
                        title: '',
                        content: shareCaptionText,
                        author: userProfile?.name || user?.displayName || "নাগরিক",
                        authorId: user?.uid || "",
                        authorPhotoUrl: userProfile?.photoURL || user?.photoURL || "",
                        createdAt: serverTimestamp(),
                        likes: 0,
                        commentsCount: 0,
                        isSharedPost: true,
                        sharedPostId: sharingPost.id,
                        sharedPostAuthor: sharingPost.author,
                        sharedPostAuthorPhotoUrl: sharingPost.authorPhotoUrl || "",
                        sharedPostAuthorId: sharingPost.authorId || "",
                        sharedPostContent: sharingPost.content || "",
                        sharedPostImageUrl: sharingPost.imageUrl || (sharingPost.gallery && sharingPost.gallery[0]) || "",
                        sharedPostVideoUrl: sharingPost.videoUrl || "",
                        sharedPostGallery: sharingPost.gallery || [],
                        union: userProfile?.union || "পুঠিয়া"
                      }));

                      await updateDoc(doc(db, "discussions", sharingPost.id), {
                        sharesCount: increment(1)
                      }).catch(() => {});

                      toast.success("Share Now: আপনার টাইমলাইনে পোস্টটি শেয়ার হয়েছে!");
                      setSharingPost(null);
                      setShareCaptionText("");
                    } catch (e) {
                      console.error("Share now error", e);
                      toast.error("শেয়ার করতে সমস্যা হয়েছে");
                    } finally {
                      setIsSharingProcess(false);
                    }
                  }}
                  className="bg-[#1877F2] hover:bg-blue-600 active:scale-95 text-white font-bold text-sm px-5 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSharingProcess ? 'Sharing...' : 'Share Now'}
                </button>
              </div>
            </div>

            {/* "Share to" Heading */}
            <h4 className="font-bold text-slate-900 text-base mb-3 px-1">Share to</h4>

            {/* Share Options Grid (Circular icons with text underneath) */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-y-4 gap-x-2 mb-2 px-1">
              {/* 2. Friend's profile */}
              <button
                type="button"
                onClick={() => {
                  setShowFriendProfileSelector(!showFriendProfileSelector);
                  setShowShareTagSelector(false);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white shadow-xs border flex items-center justify-center text-slate-800 group-hover:bg-slate-100 transition ${showFriendProfileSelector ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200/80'}`}>
                  <UserCheck size={22} className={showFriendProfileSelector ? 'text-blue-600' : 'text-slate-800'} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">Friend's profile</span>
              </button>

              {/* 3. WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://our-puthia-app.vercel.app';
                  const url = `${origin}/adda#post-${sharingPost.id}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent((sharingPost.content || 'আড্ডা পোস্ট') + '\n' + url)}`, '_blank');
                  setSharingPost(null);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-[#25D366] group-hover:bg-emerald-50 transition">
                  <MessageCircle size={22} fill="#25D366" className="text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">WhatsApp</span>
              </button>

              {/* 4. Messages */}
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://our-puthia-app.vercel.app';
                  const url = `${origin}/adda#post-${sharingPost.id}`;
                  window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`, '_blank');
                  setSharingPost(null);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-[#0084FF] group-hover:bg-blue-50 transition">
                  <MessageSquare size={22} fill="#0084FF" className="text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">Messages</span>
              </button>

              {/* 5. Copy link */}
              <button
                type="button"
                onClick={async () => {
                  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://our-puthia-app.vercel.app';
                  const url = `${origin}/adda#post-${sharingPost.id}`;
                  const success = await copyToClipboard(url);
                  if (success) {
                    toast.success("লিংক কপি করা হয়েছে!");
                  }
                  setSharingPost(null);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:bg-slate-100 transition">
                  <Link2 size={22} className="rotate-45" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">Copy link</span>
              </button>

              {/* 6. More */}
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://our-puthia-app.vercel.app';
                  const postUrl = `${origin}/adda#post-${sharingPost.id}`;
                  if (navigator.share) {
                    navigator.share({
                      title: `${sharingPost.author}-এর আড্ডা পোস্ট`,
                      text: sharingPost.content || 'পুঠিয়া আড্ডা পোস্ট',
                      url: postUrl
                    }).catch(() => {});
                  } else {
                    toast.info("অতিরিক্ত অপশন সম্বলিত তালিকা তৈরি করা হয়েছে");
                  }
                  setSharingPost(null);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:bg-slate-100 transition">
                  <MoreHorizontal size={22} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 text-center leading-tight">More</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Create Post Modal */}
      <AdvancedCreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        initialAction={createAction}
      />

      {/* Image Lightbox */}
      {lightboxOpen && lightboxImages.length > 0 && lightboxPost && (
        <ImageLightbox 
          isOpen={lightboxOpen}
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          userName={profilesCache[lightboxPost.authorId]?.name || lightboxPost.author}
          authorPhotoUrl={profilesCache[lightboxPost.authorId]?.photoURL || lightboxPost.authorPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lightboxPost.authorId || lightboxPost.author}`}
          caption={lightboxPost.content}
          likesCount={lightboxPost.likesCount}
          commentsCount={lightboxPost.commentsCount}
          userLiked={lightboxPost.userLiked}
          userReaction={lightboxPost.userReaction}
          onLike={() => handleLike(lightboxPost, lightboxPost.userReaction || 'like')}
          onComment={() => {
            setLightboxOpen(false);
            setActiveCommentPost(lightboxPost.id);
          }}
          postDateText={lightboxPost.createdAt?.seconds 
            ? formatDistanceToNow(lightboxPost.createdAt.seconds * 1000, { addSuffix: true, locale: bn })
            : 'কিছুক্ষণ আগে'}
        />
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
}

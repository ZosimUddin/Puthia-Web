import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  orderBy, 
  limit, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteField
} from "firebase/firestore";
import { db } from "../../firebase";
import { UserProfile, useAuth } from "../../contexts/AuthContext";
import { Reel } from "../../types";
import { useSocial } from "../../hooks/useSocial";
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Briefcase, 
  Share2, 
  Check, 
  AlertCircle, 
  UserCheck, 
  GraduationCap, 
  Lock, 
  Video, 
  Play, 
  Eye, 
  MessageCircle,
  Search,
  MoreVertical,
  MoreHorizontal,
  Camera,
  Edit2,
  Edit3,
  Plus,
  Home,
  Cake,
  Heart,
  Smile,
  LayoutDashboard,
  LayoutGrid,
  Info,
  PlaySquare,
  Image as ImageIcon,
  FilePlus2,
  FileEdit,
  Copy,
  Settings,
  Shield,
  Sparkles,
  X,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Trash2,
  User,
  Mail,
  Smartphone,
  Globe,
  Building2,
  Award,
  Droplet
} from "lucide-react";
import { FbReactionPicker } from "../../components/common/FbReactionPicker";
import { FacebookCommentSystem } from "../../components/comments/FacebookCommentSystem";
import { PostPhotoGallery } from "../../components/PostPhotoGallery";
import { PostVideoPlayer } from "../../components/PostVideoPlayer";
import { ImageLightbox } from "../../components/ImageLightbox";
import { copyToClipboard } from "../../utils/clipboard";
import { sendNotification } from "../../utils/notificationService";
import { chatService } from "../../services/chatService";
import { UserInfo } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import SEO from "../../components/SEO";
import { useCall } from "../../contexts/CallContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import EditProfileModal from "../../components/auth/EditProfileModal";

interface UserContribution {
  id: string;
  title: string;
  category: string;
  categoryTitle?: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string | number;
  phone?: string;
  address?: string;
  imageUrl?: string;
  serviceKey?: string;
}

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { userProfile: currentUserProfile, user } = useAuth();
  const [targetUserProfile, setTargetUserProfile] = useState<any | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<any[]>([]);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "friends" | "scrolle" | "photos">("posts");
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [copied, setCopied] = useState(false);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  const { followUser, unfollowUser, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, removeFriend } = useSocial();
  const navigate = useNavigate();
  const location = useLocation();
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const { initiateCall } = useCall();

  // Hidden file inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modals State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editModalType, setEditModalType] = useState<"details" | "education" | "note" | "bio">("details");
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [statusNoteInput, setStatusNoteInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [hometownInput, setHometownInput] = useState("");
  const [birthdayInput, setBirthdayInput] = useState("");
  const [professionalCategoryInput, setProfessionalCategoryInput] = useState("");
  const [educationInput, setEducationInput] = useState("");

  // Post Card Interactions State
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxPost, setLightboxPost] = useState<any | null>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);

  // Followers & Following Modal State
  const [socialModalType, setSocialModalType] = useState<"followers" | "following" | null>(null);
  const [socialModalUsers, setSocialModalUsers] = useState<any[]>([]);
  const [socialModalLoading, setSocialModalLoading] = useState(false);
  const [socialSearchQuery, setSocialSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setActiveMenuPostId(null);
      }
    };
    if (activeMenuPostId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuPostId]);

  const handleStartAudioCall = () => {
    if (!targetUserProfile) return;
    initiateCall(
      {
        uid: targetUserProfile.uid,
        name: targetUserProfile.name || 'নাগরিক',
        photoURL: targetUserProfile.photoURL || '',
        phone: targetUserProfile.phone || ''
      },
      'audio'
    );
  };

  const handleStartVideoCall = () => {
    if (!targetUserProfile) return;
    initiateCall(
      {
        uid: targetUserProfile.uid,
        name: targetUserProfile.name || 'নাগরিক',
        photoURL: targetUserProfile.photoURL || '',
        phone: targetUserProfile.phone || ''
      },
      'video'
    );
  };

  const handleOpenChat = async () => {
    if (!targetUserProfile) return;
    if (!user) {
      navigate('/login');
      return;
    }
    const targetUser: UserInfo = {
      uid: targetUserProfile.uid,
      name: targetUserProfile.name || 'সম্মানিত নাগরিক',
      photoURL: targetUserProfile.photoURL || '',
      isOnline: true
    };
    const currentUserInfo: UserInfo = {
      uid: user.uid,
      name: currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
      photoURL: currentUserProfile?.photoURL || user.photoURL || '',
      isOnline: true
    };

    try {
      const convId = await chatService.startDirectConversation(currentUserInfo, targetUser);
      navigate(`/messages?chat=${convId}`, { state: { chatId: convId, targetUser } });
    } catch (err) {
      console.error("Failed to start chat from profile:", err);
      navigate('/messages');
    }
  };

  // Image compressor helper (zero-dependency HTML Canvas base64 compiler)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // Optimal profile/cover sizing
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const toastId = toast.loading("⏳ কভার ফটো অপ্টিমাইজ ও আপলোড করা হচ্ছে...");
    try {
      const compressed = await compressImage(file);
      await updateDoc(doc(db, "users", user.uid), {
        coverURL: compressed
      });
      toast.success("📷 কভার ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("কভার ফটো আপলোড ব্যর্থ হয়েছে।", { id: toastId });
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const toastId = toast.loading("⏳ প্রোফাইল ফটো অপ্টিমাইজ ও আপলোড করা হচ্ছে...");
    try {
      const compressed = await compressImage(file);
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: compressed
      });
      toast.success("📷 প্রোফাইল ফটো সফলভাবে পরিবর্তন করা হয়েছে!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("প্রোফাইল ফটো আপলোড ব্যর্থ হয়েছে।", { id: toastId });
    }
  };

  // Edit Profile Modal (Facebook Full Profile Editor System)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [showReadOnlyDetailsModal, setShowReadOnlyDetailsModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  const checkIsOwnProfile = () => {
    return Boolean(
      user && targetUserProfile && (
        user.uid === targetUserProfile.uid || 
        (userId && (user.uid === userId || userId === 'me'))
      )
    );
  };

  const handleOpenEditProfileModal = () => {
    if (!checkIsOwnProfile()) {
      setShowReadOnlyDetailsModal(true);
      return;
    }
    const profile = targetUserProfile || currentUserProfile || {};
    setEditFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      username: profile.username || profile.nickname || "",
      birthDate: profile.birthDate || profile.birthday || "",
      birthday: profile.birthday || profile.birthDate || "",
      gender: profile.gender || "",
      bloodGroup: profile.bloodGroup || "",
      location: profile.location || profile.address || "",
      address: profile.address || profile.location || "",
      union: profile.union || "",
      hometown: profile.hometown || "",
      relationshipStatus: profile.relationshipStatus || "",
      workCompany: profile.workCompany || profile.workExperience || "",
      workExperience: profile.workExperience || profile.workCompany || "",
      workRole: profile.workRole || "",
      highSchool: profile.highSchool || "",
      collegeUniversity: profile.collegeUniversity || profile.education || "",
      education: profile.education || profile.collegeUniversity || "",
      photoURL: profile.photoURL || "",
      coverURL: profile.coverURL || ""
    });
    setEditSuccess(false);
    setEditError("");
    setIsEditProfileModalOpen(true);
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!user) return;
    setEditLoading(true);
    setEditError("");
    try {
      const userRef = doc(db, "users", user.uid);
      const cleanedData: any = {
        name: editFormData.name?.trim() || targetUserProfile?.name || "",
        phone: editFormData.phone?.trim() || targetUserProfile?.phone || "",
        bio: editFormData.bio?.trim() || "",
        username: editFormData.username ? editFormData.username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '') : "",
        birthday: editFormData.birthday || editFormData.birthDate || "",
        birthDate: editFormData.birthDate || editFormData.birthday || "",
        gender: editFormData.gender || "",
        bloodGroup: editFormData.bloodGroup || "",
        location: editFormData.location || editFormData.address || "",
        address: editFormData.address || editFormData.location || "",
        union: editFormData.union || "",
        hometown: editFormData.hometown || "",
        relationshipStatus: editFormData.relationshipStatus || "",
        workCompany: editFormData.workCompany || editFormData.workExperience || "",
        workExperience: editFormData.workExperience || editFormData.workCompany || "",
        workRole: editFormData.workRole || "",
        highSchool: editFormData.highSchool || "",
        collegeUniversity: editFormData.collegeUniversity || editFormData.education || "",
        education: editFormData.education || editFormData.collegeUniversity || "",
        updatedAt: serverTimestamp()
      };
      if (editFormData.photoURL) cleanedData.photoURL = editFormData.photoURL;
      if (editFormData.coverURL !== undefined) cleanedData.coverURL = editFormData.coverURL;

      await updateDoc(userRef, cleanedData);
      setEditSuccess(true);
      toast.success("✅ প্রোফাইল সফলভাবে আপডেট হয়েছে!");
      setTimeout(() => {
        setIsEditProfileModalOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setEditError(err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
      toast.error("প্রোফাইল আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const base64 = await compressImage(file);
      setEditFormData((prev: any) => ({ ...prev, photoURL: base64 }));
      await updateDoc(doc(db, "users", user.uid), { photoURL: base64 });
      toast.success("প্রোফাইল ছবি পরিবর্তন করা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
    }
  };

  const handleEditProfileCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const base64 = await compressImage(file);
      setEditFormData((prev: any) => ({ ...prev, coverURL: base64 }));
      await updateDoc(doc(db, "users", user.uid), { coverURL: base64 });
      toast.success("কভার ছবি পরিবর্তন করা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("কভার ছবি আপলোড ব্যর্থ হয়েছে");
    }
  };

  const handleEditNoteClick = () => {
    if (!checkIsOwnProfile()) return;
    handleOpenEditProfileModal();
  };

  const handleEditBioClick = () => {
    if (!checkIsOwnProfile()) return;
    handleOpenEditProfileModal();
  };

  const handleEditDetailsClick = () => {
    if (!checkIsOwnProfile()) {
      setShowReadOnlyDetailsModal(true);
      return;
    }
    handleOpenEditProfileModal();
  };

  const handleEditEducationClick = () => {
    if (!checkIsOwnProfile()) {
      setShowReadOnlyDetailsModal(true);
      return;
    }
    handleOpenEditProfileModal();
  };

  // Load target user profile
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const actualId = userId === 'me' && user ? user.uid : userId;
    const userRef = doc(db, "users", actualId);
    
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setTargetUserProfile({ uid: snap.id, ...snap.data() } as any);
          setLoading(false);
        } else {
          // Fallback if this is the currently logged-in user
          if (user && (actualId === user.uid)) {
            const fallbackObj = {
              uid: user.uid,
              name: currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
              phone: currentUserProfile?.phone || '',
              village: currentUserProfile?.village || '',
              union: currentUserProfile?.union || 'বানেশ্বর',
              address: currentUserProfile?.address || '',
              gender: currentUserProfile?.gender || 'পুরুষ',
              bloodGroup: currentUserProfile?.bloodGroup || 'O+',
              stars: currentUserProfile?.stars || 20,
              role: currentUserProfile?.role || 'user',
              badges: currentUserProfile?.badges || ["সচেতন নাগরিক"],
              createdAt: currentUserProfile?.createdAt || new Date().toISOString()
            };
            setTargetUserProfile(fallbackObj);
            setLoading(false);
            // Auto-repair/save the missing user profile doc in Firestore
            setDoc(doc(db, "users", user.uid), fallbackObj, { merge: true }).catch(() => {});
          } else {
            // Fallback search by username
            getDocs(query(collection(db, "users"), where("username", "==", actualId.toLowerCase().trim()), limit(1)))
              .then((qSnap) => {
                if (!qSnap.empty) {
                  const uDoc = qSnap.docs[0];
                  setTargetUserProfile({ uid: uDoc.id, ...uDoc.data() } as any);
                } else {
                  setTargetUserProfile(null);
                }
                setLoading(false);
              })
              .catch(() => {
                setTargetUserProfile(null);
                setLoading(false);
              });
          }
        }
      },
      (error) => {
        console.warn("Error loading user profile:", error);
        if (user && (actualId === user.uid)) {
          setTargetUserProfile({
            uid: user.uid,
            name: currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
            phone: currentUserProfile?.phone || '',
            village: currentUserProfile?.village || '',
            union: currentUserProfile?.union || 'বানেশ্বর',
            address: currentUserProfile?.address || '',
            gender: currentUserProfile?.gender || 'পুরুষ',
            bloodGroup: currentUserProfile?.bloodGroup || 'O+',
            stars: currentUserProfile?.stars || 20,
            role: currentUserProfile?.role || 'user',
            badges: currentUserProfile?.badges || ["সচেতন নাগরিক"],
            createdAt: currentUserProfile?.createdAt || new Date().toISOString()
          });
        } else {
          setTargetUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, user, currentUserProfile]);

  // Load user businesses if any
  useEffect(() => {
    if (!targetUserProfile?.uid) return;
    const fetchBusinesses = async () => {
      try {
        const q = query(collection(db, "businesses"), where("ownerId", "==", targetUserProfile.uid));
        const snap = await getDocs(q);
        const bList: any[] = [];
        snap.forEach(d => bList.push({ id: d.id, ...d.data() }));
        setUserBusinesses(bList);
      } catch (err) {
        console.warn("User businesses load error:", err);
      }
    };
    fetchBusinesses();
  }, [targetUserProfile?.uid]);

  // Load user Reels
  useEffect(() => {
    if (!userId) return;
    try {
      const q = query(
        collection(db, "reels"),
        where("authorId", "==", userId),
        limit(20)
      );
      const unsub = onSnapshot(q, (snap) => {
        const rList: Reel[] = [];
        snap.forEach((d) => {
          const data = d.data();
          if (data.status === 'published' || !data.status) {
            rList.push({ id: d.id, ...data } as Reel);
          }
        });
        setUserReels(rList);
      }, (err) => {
        console.warn("Reels load skipped:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Reels fetch error:", e);
    }
  }, [userId]);

  // Load user's discussions/posts count and photos
  useEffect(() => {
    const targetUid = targetUserProfile?.uid || userId;
    if (!targetUid) return;

    const q = query(
      collection(db, "discussions"), 
      where("authorId", "==", targetUid)
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const postsPromises = snap.docs.map(async (docSnap) => {
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
            try {
              const likeDoc = await getDoc(doc(db, "likes", `${docSnap.id}_${user.uid}`));
              if (likeDoc.exists()) {
                userLiked = true;
                userReaction = (likeDoc.data()?.reaction as any) || 'like';
              }
            } catch (e) {
              // ignore
            }
          }
        }

        const computedCount = Object.keys(reactionsMap).length > 0
          ? Object.keys(reactionsMap).length
          : (data.reactionsCount ?? data.likesCount ?? data.likes ?? likedByArray.length ?? 0);

        return {
          id: docSnap.id,
          content: data.content || "",
          author: data.author || targetUserProfile?.name || "নাগরিক",
          authorId: data.authorId || targetUid,
          authorBadge: data.authorBadge,
          authorPhotoUrl: data.authorPhotoUrl || targetUserProfile?.photoURL || "",
          union: data.union || targetUserProfile?.union || "",
          category: data.category || "",
          imageUrl: data.imageUrl || "",
          videoUrl: data.videoUrl || "",
          gallery: data.gallery || [],
          location: data.location || "",
          feeling: data.feeling || "",
          likesCount: computedCount,
          commentsCount: data.commentsCount || 0,
          createdAt: data.createdAt,
          userLiked,
          userReaction,
          reactions: reactionsMap,
          likedBy: likedByArray,
          sharesCount: data.sharesCount || 0
        };
      });

      const posts = await Promise.all(postsPromises);
      posts.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });

      const photos: string[] = [];
      posts.forEach((p: any) => {
        if (p.imageUrl) photos.push(p.imageUrl);
        if (p.gallery && Array.isArray(p.gallery)) photos.push(...p.gallery);
      });

      setUserPostsCount(posts.length);
      setRecentPosts(posts);
      setUserPhotos(photos);
    }, (err) => {
      console.warn("Discussions loader query error:", err);
    });

    return () => unsubscribe();
  }, [targetUserProfile?.uid, targetUserProfile?.username, targetUserProfile?.name, userId, user]);

  // Load real friend profiles from Firestore
  useEffect(() => {
    const rawFriends = targetUserProfile?.friends || [];
    if (!rawFriends || rawFriends.length === 0) {
      setFriendsList([]);
      return;
    }

    let isMounted = true;
    setFriendsLoading(true);

    const fetchFriendsData = async () => {
      try {
        const uidsToFetch: string[] = [];
        const preLoadedObjects: any[] = [];

        rawFriends.forEach((item: any) => {
          if (typeof item === 'string' && item.trim()) {
            uidsToFetch.push(item.trim());
          } else if (item && typeof item === 'object' && (item.uid || item.id)) {
            preLoadedObjects.push(item);
          }
        });

        const fetchedProfiles: any[] = [...preLoadedObjects];

        if (uidsToFetch.length > 0) {
          // Batch fetch up to 10 friends per query chunk (Firestore in query limit)
          const chunks: string[][] = [];
          for (let i = 0; i < uidsToFetch.length; i += 10) {
            chunks.push(uidsToFetch.slice(i, i + 10));
          }

          for (const chunk of chunks) {
            try {
              const q = query(collection(db, "users"), where("__name__", "in", chunk));
              const snap = await getDocs(q);
              snap.forEach((docSnap) => {
                const data = docSnap.data();
                fetchedProfiles.push({
                  uid: docSnap.id,
                  id: docSnap.id,
                  name: data.name || data.displayName || 'সম্মানিত নাগরিক',
                  displayName: data.displayName || data.name || 'সম্মানিত নাগরিক',
                  username: data.username || data.nickname || '',
                  photoURL: data.photoURL || data.avatarUrl || data.avatar || '',
                  role: data.role || 'citizen',
                  verified: !!data.verified || !!data.isVerified,
                  union: data.union || data.unionName || data.location || '',
                  village: data.village || '',
                  bio: data.bio || data.statusNote || '',
                  phone: data.phone || data.phoneNumber || ''
                });
              });
            } catch (err) {
              console.warn("Error fetching chunk of friends:", err);
            }
          }
        }

        // If any UID was not found in users collection, provide structured profile
        uidsToFetch.forEach((uid) => {
          if (!fetchedProfiles.some((p) => p.uid === uid || p.id === uid)) {
            fetchedProfiles.push({
              uid: uid,
              id: uid,
              name: 'নাগরিক ব্যবহারকারী',
              displayName: 'নাগরিক ব্যবহারকারী',
              photoURL: '',
              union: 'পুঠিয়া',
              role: 'citizen',
              verified: false
            });
          }
        });

        if (isMounted) {
          setFriendsList(fetchedProfiles);
          setFriendsLoading(false);
        }
      } catch (err) {
        console.error("Error loading friends:", err);
        if (isMounted) {
          setFriendsLoading(false);
        }
      }
    };

    fetchFriendsData();

    return () => {
      isMounted = false;
    };
  }, [targetUserProfile?.friends]);

  const handleStartFriendChat = async (friend: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const targetUser: UserInfo = {
      uid: friend.uid || friend.id,
      name: friend.name || friend.displayName || 'সম্মানিত নাগরিক',
      photoURL: friend.photoURL || '',
      isOnline: true
    };
    const currentUserInfo: UserInfo = {
      uid: user.uid,
      name: currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
      photoURL: currentUserProfile?.photoURL || user.photoURL || '',
      isOnline: true
    };

    try {
      const convId = await chatService.startDirectConversation(currentUserInfo, targetUser);
      navigate(`/messages?chat=${convId}`, { state: { chatId: convId, targetUser } });
    } catch (err) {
      console.error("Failed to start chat with friend:", err);
      navigate('/messages');
    }
  };

  const handleUnfriendFriend = async (friendUid: string) => {
    if (!currentUserProfile || !user) return;
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই বন্ধুকে আপনার তালিকা থেকে সরাতে চান?")) {
      try {
        await removeFriend(currentUserProfile.uid || user.uid, friendUid);
        setFriendsList(prev => prev.filter(f => f.uid !== friendUid && f.id !== friendUid));
        toast.success("বন্ধু তালিকা থেকে সফলভাবে সরানো হয়েছে।");
      } catch (err) {
        console.error("Unfriend error:", err);
        toast.error("আনফ্রেন্ড করতে ত্রুটি হয়েছে।");
      }
    }
  };

  const handleOpenSocialModal = async (type: "followers" | "following") => {
    setSocialModalType(type);
    setSocialSearchQuery("");
    setSocialModalLoading(true);
    try {
      const uidsToFetch: string[] = type === "followers" 
        ? (targetUserProfile?.followers || [])
        : (targetUserProfile?.following || []);

      if (!uidsToFetch || uidsToFetch.length === 0) {
        setSocialModalUsers([]);
        setSocialModalLoading(false);
        return;
      }

      const fetched: any[] = [];
      const chunks: string[][] = [];
      for (let i = 0; i < uidsToFetch.length; i += 10) {
        chunks.push(uidsToFetch.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        try {
          const qSnap = await getDocs(query(collection(db, "users"), where("__name__", "in", chunk)));
          qSnap.forEach(d => {
            fetched.push({ uid: d.id, ...d.data() });
          });
        } catch (e) {
          // ignore
        }
      }

      const foundUids = new Set(fetched.map(f => f.uid));
      for (const uId of uidsToFetch) {
        if (!foundUids.has(uId) && typeof uId === 'string' && uId.trim()) {
          try {
            const userSnap = await getDoc(doc(db, "users", uId.trim()));
            if (userSnap.exists()) {
              fetched.push({ uid: userSnap.id, ...userSnap.data() });
            }
          } catch (e) {
            // ignore
          }
        }
      }

      setSocialModalUsers(fetched);
    } catch (err) {
      console.error("Failed to load social users:", err);
      toast.error("তালিকা লোড করতে সমস্যা হয়েছে");
    } finally {
      setSocialModalLoading(false);
    }
  };

  const handleToggleFollowInModal = async (modalTargetUid: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isCurrentlyFollowing = currentUserProfile?.following?.includes(modalTargetUid);
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(user.uid, modalTargetUid);
        toast.success("আনফলো করা হয়েছে");
      } else {
        await followUser(user.uid, modalTargetUid);
        toast.success("ফলো করা হয়েছে");
      }
    } catch (e) {
      console.error(e);
      toast.error("কার্যক্রম সম্পন্ন করা যায়নি");
    }
  };

  const handleLike = async (post: any, reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' = 'like') => {
    if (!user) {
      navigate('/login');
      return;
    }
    const likeId = `${post.id}_${user.uid}`;
    const userLiked = post.userLiked;
    const userReaction = post.userReaction;
    const isSameReaction = userLiked && userReaction === reaction;
    const isNewLike = !userLiked;
    
    let nextUserLiked = !isSameReaction;
    let nextUserReaction = isSameReaction ? null : reaction;
    let nextLikesCount = post.likesCount || 0;
    if (isSameReaction) {
      nextLikesCount = Math.max(0, nextLikesCount - 1);
    } else if (isNewLike) {
      nextLikesCount = nextLikesCount + 1;
    }

    const nextReactions = { ...(post.reactions || {}) };
    if (isSameReaction) {
      delete nextReactions[user.uid];
    } else {
      nextReactions[user.uid] = reaction;
    }

    // Instant optimistic state update
    setRecentPosts(prev => prev.map(p => p.id === post.id ? {
      ...p,
      userLiked: nextUserLiked,
      userReaction: nextUserReaction,
      likesCount: nextLikesCount,
      reactions: nextReactions
    } : p));

    try {
      const postRef = doc(db, "discussions", post.id);
      const likeDocRef = doc(db, "likes", likeId);
      const postReactionRef = doc(db, "post_reactions", `${post.id}_${user.uid}`);

      if (isSameReaction) {
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
        const payload = {
          postId: post.id,
          userId: user.uid,
          reaction,
          userName: currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
          userPhotoUrl: currentUserProfile?.photoURL || user.photoURL || '',
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

        if (post.authorId && post.authorId !== user.uid && isNewLike) {
          sendNotification(
            post.authorId,
            user.uid,
            currentUserProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
            currentUserProfile?.photoURL || user.photoURL || '',
            'POST_REACTION',
            post.id,
            'post',
            `আপনার পোস্টে রিয়্যাক্ট দিয়েছেন।`
          ).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Profile post like error:", e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "discussions", postId));
      setRecentPosts(prev => prev.filter(p => p.id !== postId));
      setUserPostsCount(prev => Math.max(0, prev - 1));
      toast.success("পোস্ট সফলভাবে মুছে ফেলা হয়েছে");
    } catch (err) {
      console.error("Delete post error:", err);
      toast.error("পোস্ট মুছতে সমস্যা হয়েছে");
    }
    setActiveMenuPostId(null);
  };

  const handleCopyPostLink = async (postId: string) => {
    const shareUrl = `${window.location.origin}/adda#post-${postId}`;
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success("পোস্টের লিংক কপি করা হয়েছে!");
    } else {
      toast.error("লিংক কপি করা যায়নি");
    }
    setActiveMenuPostId(null);
  };

  const handleSharePost = async (post: any) => {
    const shareUrl = `${window.location.origin}/adda#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.author}-এর পোস্ট`,
          text: post.content?.slice(0, 100),
          url: shareUrl
        });
      } catch (err) {
        // fallback
        await handleCopyPostLink(post.id);
      }
    } else {
      await handleCopyPostLink(post.id);
    }
  };

  const renderFormattedPostContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={i} 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/adda');
            }}
            className="text-[#1877F2] font-bold hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-[#1877F2] font-bold bg-blue-50 px-1 py-0.5 rounded cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] underline font-medium break-all">
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderPostReactionIcons = (post: any) => {
    const presentReactions = new Set<string>();
    if (post.reactions && typeof post.reactions === 'object') {
      Object.values(post.reactions).forEach((r: any) => {
        if (r) presentReactions.add(r);
      });
    }
    if (post.userReaction) presentReactions.add(post.userReaction);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-bold text-sm">নাগরিক প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!targetUserProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <AlertCircle size={36} />
        </div>
        <h2 className="text-xl font-black text-slate-800">নাগরিক প্রোফাইল পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          এই ব্যবহারকারী অ্যাকাউন্টটি নিষ্ক্রিয় অথবা আইডি নম্বরটি ভুল।
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2.5 bg-[#006a4e] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer border-none"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUserProfile?.uid === targetUserProfile.uid || user?.uid === targetUserProfile.uid;
  const isFollowing = currentUserProfile?.following?.includes(targetUserProfile.uid);
  const isFriend = currentUserProfile?.friends?.includes(targetUserProfile.uid);
  const isRequested = currentUserProfile?.friendRequestsSent?.includes(targetUserProfile.uid);
  const hasPendingRequest = currentUserProfile?.friendRequestsReceived?.includes(targetUserProfile.uid);

  const handleFollowToggle = async () => {
    if (!currentUserProfile) {
      navigate("/login");
      return;
    }
    if (isFollowing) {
      await unfollowUser(currentUserProfile.uid, targetUserProfile.uid);
    } else {
      await followUser(currentUserProfile.uid, targetUserProfile.uid);
    }
  };

  const handleFriendAction = async () => {
    if (!currentUserProfile) {
      navigate("/login");
      return;
    }
    setFriendActionLoading(true);
    try {
      if (isFriend) {
        if (window.confirm("আপনি কি আনফ্রেন্ড করতে চান?")) {
          await removeFriend(currentUserProfile.uid, targetUserProfile.uid);
        }
      } else if (hasPendingRequest) {
        await acceptFriendRequest(currentUserProfile.uid, targetUserProfile.uid);
      } else if (isRequested) {
        await cancelFriendRequest(currentUserProfile.uid, targetUserProfile.uid);
      } else {
        await sendFriendRequest(currentUserProfile.uid, targetUserProfile.uid);
      }
    } catch (err) {
      console.error("Friend action error:", err);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${targetUserProfile.name} - স্মার্ট পুঠিয়া প্রোফাইল`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("প্রোফাইল লিংক কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toBengali = (num: number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
  };

  const followersCount = targetUserProfile.followersCount || targetUserProfile.followers?.length || 0;
  const followingCount = targetUserProfile.followingCount || targetUserProfile.following?.length || 0;
  const friendsCount = targetUserProfile.friendsCount || targetUserProfile.friends?.length || 0;

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. If explicit origin path is passed in router state
    const stateFrom = (location.state as { from?: string } | null)?.from;
    if (stateFrom && typeof stateFrom === "string") {
      navigate(stateFrom);
      return;
    }

    // 2. If history stack within our app exists and has prior routes
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    // 3. Fallback when opened directly, reloaded, or history stack is 0
    if (isOwnProfile) {
      navigate("/profile");
    } else {
      navigate("/adda");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      {/* SEO metadata */}
      <SEO
        title={`${targetUserProfile.name} - নাগরিক প্রোফাইল`}
        description={`${targetUserProfile.name} - পুঠিয়া উপজেলার নিবন্ধিত নাগরিক। অবস্থান: ${targetUserProfile.union || "পুঠিয়া"}, রাজশাহী।`}
        image={targetUserProfile.photoURL || undefined}
        path={`/profile/${targetUserProfile.uid}`}
        type="profile"
      />

      <div className="max-w-xl mx-auto">
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={coverInputRef} 
          onChange={handleCoverUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={profileInputRef} 
          onChange={handleProfileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* 2. Cover Photo Section with Floating Back Button */}
        <div className="h-44 sm:h-56 w-full bg-slate-100 relative overflow-hidden">
          {/* Floating Back Button on Cover */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="ফিরে যান"
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 active:scale-95 text-white flex items-center justify-center backdrop-blur-xs transition z-30 border-none cursor-pointer"
          >
            <ArrowLeft size={20} className="stroke-[2.5]" />
          </button>

          {targetUserProfile.coverURL ? (
            <img 
              src={targetUserProfile.coverURL} 
              alt="Cover Banner" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-700 to-sky-900 flex items-center justify-center opacity-85">
              <span className="text-white/40 font-bold text-xs tracking-widest">স্মার্ট পুঠিয়া</span>
            </div>
          )}

          {/* Camera Icon Overlay on Cover (Only for Own Profile) */}
          {isOwnProfile && (
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition border border-slate-200 cursor-pointer"
              title="কভার ছবি পরিবর্তন"
            >
              <Camera size={15} />
            </button>
          )}
        </div>

        {/* 3. Profile Avatar & Name beside it (Directly in marked box area) */}
        <div className="px-4 relative flex items-end gap-3.5 -mt-10 sm:-mt-12 z-20">
          <div className="relative shrink-0">
            {/* Circular Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-white bg-slate-200 overflow-hidden shadow-md relative">
              {targetUserProfile.photoURL ? (
                <img 
                  src={targetUserProfile.photoURL} 
                  alt={targetUserProfile.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1877F2] to-indigo-600 flex items-center justify-center text-white font-black text-2xl">
                  {targetUserProfile.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* Camera Icon Overlay on Avatar (Only for Own Profile) */}
            {isOwnProfile && (
              <button 
                onClick={() => profileInputRef.current?.click()}
                className="avatar-camera-badge absolute bottom-0 right-0 !w-7 !h-7 !min-w-7 !min-h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center shadow-md transition border border-white cursor-pointer z-10"
                title="প্রোফাইল ছবি পরিবর্তন"
              >
                <Camera size={13} />
              </button>
            )}
          </div>

          {/* Profile Name & Username in Marked Box Area */}
          <div className="pb-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight truncate">
                {targetUserProfile.name}
              </h2>
              {targetUserProfile.isVerified && (
                <span className="inline-flex items-center text-blue-500 shrink-0" title="যাচাইকৃত নাগরিক">
                  <CheckCircle2 size={18} className="fill-blue-500 text-white" />
                </span>
              )}
              {targetUserProfile.role === "super_admin" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  👑 এডমিন
                </span>
              )}
            </div>

            {/* Username */}
            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5 truncate">
              @{targetUserProfile.username || targetUserProfile.nickname || (targetUserProfile.name ? targetUserProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '') : "user")}
            </p>
          </div>
        </div>

        {/* 4. Bio Section (if present or if own profile) */}
        {(targetUserProfile.bio || isOwnProfile) && (
          <div className="px-4.5 pt-2.5 pb-1">
            <div 
              onClick={isOwnProfile ? handleEditBioClick : undefined}
              className={`text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg ${
                isOwnProfile ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl p-2.5 transition border border-dashed border-slate-200 dark:border-slate-700' : ''
              }`}
            >
              {targetUserProfile.bio ? (
                <p className="font-medium whitespace-pre-wrap text-slate-800 dark:text-slate-200">{targetUserProfile.bio}</p>
              ) : (
                isOwnProfile && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">✏️ আপনার বায়ো (Bio) যুক্ত করতে এখানে ট্যাপ করুন...</p>
              )}
            </div>
          </div>
        )}

        {/* 5. Social Stats Bar (Posts | Friends | Followers | Following) */}
        <div className="px-4.5 pt-2">
          <div className="flex items-center justify-between py-2.5 px-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* 1. Posts */}
            <button 
              type="button"
              onClick={() => setActiveTab("posts")}
              className="flex-1 text-center border-0 bg-transparent cursor-pointer py-1 hover:opacity-80 transition active:scale-95"
            >
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {userPostsCount}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">Posts</p>
            </button>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* 2. Friends */}
            <button 
              type="button"
              onClick={() => setActiveTab("friends")}
              className="flex-1 text-center border-0 bg-transparent cursor-pointer py-1 hover:opacity-80 transition active:scale-95"
            >
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {friendsCount}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">Friends</p>
            </button>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* 3. Followers */}
            <button 
              type="button"
              onClick={() => handleOpenSocialModal("followers")}
              className="flex-1 text-center border-0 bg-transparent cursor-pointer py-1 hover:opacity-80 transition active:scale-95 group"
            >
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-[#1877F2] transition-colors">
                {followersCount}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5 group-hover:text-[#1877F2] transition-colors">Followers</p>
            </button>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* 4. Following */}
            <button 
              type="button"
              onClick={() => handleOpenSocialModal("following")}
              className="flex-1 text-center border-0 bg-transparent cursor-pointer py-1 hover:opacity-80 transition active:scale-95 group"
            >
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-[#1877F2] transition-colors">
                {followingCount}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5 group-hover:text-[#1877F2] transition-colors">Following</p>
            </button>
          </div>
        </div>

        {/* 5. Action Buttons (Facebook Style - Aligned with Screenshot 2) */}
        <div className="px-4.5 pt-4.5 flex items-center gap-2 w-full">
          {isOwnProfile ? (
            <>
              {/* 1. Edit Profile Button */}
              <button 
                onClick={handleEditDetailsClick}
                className="flex-1 py-2.5 px-4 bg-[#f0f2f5] hover:bg-[#e4e6eb] active:bg-[#d8dadf] text-[#050505] font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-slate-200/80 shadow-2xs transition active:scale-[0.98] cursor-pointer"
              >
                <Edit2 size={16} className="text-slate-800 shrink-0" />
                <span>Edit Profile</span>
              </button>

              {/* 2. Share Icon Button */}
              <button 
                onClick={handleShare}
                className="w-11 h-11 bg-[#f0f2f5] hover:bg-[#e4e6eb] active:bg-[#d8dadf] text-[#050505] rounded-xl flex items-center justify-center border border-slate-200/80 shadow-2xs transition active:scale-[0.98] cursor-pointer shrink-0"
                title="Share Profile"
                aria-label="Share Profile"
              >
                <Share2 size={18} className="text-slate-800" />
              </button>

              {/* 3. Three Dots / More Options Button */}
              <button 
                onClick={() => setShowMoreMenu(true)}
                className="w-11 h-11 bg-[#f0f2f5] hover:bg-[#e4e6eb] active:bg-[#d8dadf] text-[#050505] rounded-xl flex items-center justify-center border border-slate-200/80 shadow-2xs transition active:scale-[0.98] cursor-pointer shrink-0"
                title="More Options"
                aria-label="More Options"
              >
                <MoreHorizontal size={20} className="text-slate-800" />
              </button>
            </>
          ) : (
            <>
              {/* Message blue button */}
              <button 
                onClick={handleOpenChat}
                className="flex-1 py-2.5 px-4 bg-[#1877F2] text-white hover:bg-blue-600 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer border-none"
              >
                <MessageCircle size={15} />
                <span>Message</span>
              </button>

              {/* Add/Accept Friend / Unfriend Actions */}
              <button 
                onClick={handleFriendAction}
                disabled={friendActionLoading}
                className="flex-1 py-2.5 px-4 bg-[#e4e6eb] text-[#050505] hover:bg-slate-300 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border-none"
              >
                <Users size={15} />
                <span>
                  {isFriend 
                    ? "✓ Friends" 
                    : hasPendingRequest 
                    ? "Accept Request" 
                    : isRequested 
                    ? "Request Sent" 
                    : "Add Friend"}
                </span>
              </button>

              {/* Share */}
              <button 
                onClick={handleShare}
                className="w-11 h-11 bg-[#f0f2f5] hover:bg-[#e4e6eb] active:bg-[#d8dadf] text-[#050505] rounded-xl flex items-center justify-center border border-slate-200/80 shadow-2xs transition active:scale-[0.98] cursor-pointer shrink-0"
                title="Share Profile"
                aria-label="Share Profile"
              >
                <Share2 size={18} className="text-slate-800" />
              </button>

              {/* More */}
              <button 
                onClick={() => setShowMoreMenu(true)}
                className="w-11 h-11 bg-[#f0f2f5] hover:bg-[#e4e6eb] active:bg-[#d8dadf] text-[#050505] rounded-xl flex items-center justify-center border border-slate-200/80 shadow-2xs transition active:scale-[0.98] cursor-pointer shrink-0"
                title="More Options"
                aria-label="More Options"
              >
                <MoreHorizontal size={20} className="text-slate-800" />
              </button>
            </>
          )}
        </div>

        {/* 6. Tabs Section: Posts | About | Friends | Scrolle | Photos */}
        <div className="mt-4 border-t border-b border-slate-200/80 bg-white flex relative z-10 justify-between items-center px-1">
          {[
            { id: "posts", label: "Posts", icon: LayoutGrid },
            { id: "about", label: "About", icon: Info },
            { id: "friends", label: "Friends", icon: Users },
            { id: "scrolle", label: "Scrolle", icon: PlaySquare },
            { id: "photos", label: "Photos", icon: ImageIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 px-1 flex flex-col items-center justify-center relative transition-all border-none bg-transparent cursor-pointer ${
                  isActive ? "text-[#1877F2]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={22} className={isActive ? "text-[#1877F2]" : "text-slate-400"} />
                <span className={`text-[11px] sm:text-xs mt-1 ${isActive ? "font-extrabold text-[#1877F2]" : "font-semibold text-slate-500"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.75 bg-[#1877F2] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 7. Tab Contents */}
        <div className="p-4 space-y-4 min-h-[300px]">
          {/* TAB 1: POSTS (Full Facebook Style Cards) */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200/80">
                  <FilePlus2 className="w-14 h-14 text-slate-300 stroke-[1.5] mb-2" />
                  <p className="text-slate-500 font-bold text-sm">কোনো পোস্ট নেই</p>
                  {isOwnProfile && (
                    <button 
                      onClick={() => navigate("/adda")}
                      className="mt-3 px-4 py-2 bg-[#1877F2] text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition cursor-pointer"
                    >
                      আড্ডায় পোস্ট করুন
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentPosts.map((post) => {
                    const allImages = (post.gallery && post.gallery.length > 0)
                      ? post.gallery 
                      : (post.imageUrl ? [post.imageUrl] : []);
                    const isAuthor = user && (user.uid === post.authorId || user.email === 'mdzosimuddin31@gmail.com' || currentUserProfile?.role === 'super_admin');

                    return (
                      <div 
                        key={post.id}
                        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                      >
                        {/* Post Header */}
                        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                              {post.authorPhotoUrl || targetUserProfile?.photoURL ? (
                                <img 
                                  src={post.authorPhotoUrl || targetUserProfile?.photoURL}
                                  alt={post.author}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#1877F2] to-blue-700 flex items-center justify-center text-white text-sm font-black">
                                  {(post.author || 'ন')[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-extrabold text-slate-900 truncate">
                                  {targetUserProfile?.name || post.author || 'নাগরিক'}
                                </span>
                                {(targetUserProfile?.isVerified || targetUserProfile?.role === 'admin' || targetUserProfile?.role === 'super_admin') && (
                                  <CheckCircle2 size={14} className="text-[#1877F2] shrink-0 fill-blue-50" />
                                )}
                                {post.category && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                    {post.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <span>
                                  {post.createdAt?.seconds 
                                    ? formatDistanceToNow(post.createdAt.seconds * 1000, { addSuffix: true, locale: bn })
                                    : 'কিছুক্ষণ আগে'}
                                </span>
                                {post.union && (
                                  <>
                                    <span>•</span>
                                    <span>{post.union}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 3-Dot Post Options Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                              title="অপশন"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {activeMenuPostId === post.id && (
                              <div 
                                ref={postMenuRef}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleCopyPostLink(post.id)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Copy size={14} className="text-slate-500" />
                                  <span>পোস্টের লিংক কপি</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSharePost(post)}
                                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                                >
                                  <Share2 size={14} className="text-slate-500" />
                                  <span>শেয়ার করুন</span>
                                </button>
                                {isAuthor && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post.id)}
                                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer bg-transparent"
                                  >
                                    <Trash2 size={14} />
                                    <span>পোস্ট ডিলিট করুন</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="px-3.5 sm:px-4 pb-2">
                          <p className="text-[13.5px] sm:text-[14px] text-slate-800 font-normal leading-relaxed whitespace-pre-wrap">
                            {renderFormattedPostContent(post.content)}
                          </p>
                        </div>

                        {/* Post Media: Photos / Video */}
                        {allImages.length > 0 && (
                          <div className="px-3.5 sm:px-4 pb-2">
                            <PostPhotoGallery 
                              images={allImages} 
                              onImageClick={(idx) => {
                                setLightboxImages(allImages);
                                setLightboxIndex(idx);
                                setLightboxPost(post);
                                setLightboxOpen(true);
                              }} 
                            />
                          </div>
                        )}

                        {post.videoUrl && allImages.length === 0 && (
                          <div className="px-3.5 sm:px-4 pb-2">
                            <PostVideoPlayer src={post.videoUrl} />
                          </div>
                        )}

                        {/* Post Stats Summary Bar */}
                        {((post.likesCount || 0) > 0 || (post.commentsCount || 0) > 0 || (post.sharesCount || 0) > 0) && (
                          <div className="px-3.5 sm:px-4 py-1.5 flex items-center justify-between text-xs text-slate-500 mx-2 border-b border-slate-100 mb-1">
                            <div className="flex items-center gap-1.5">
                              {post.likesCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                  {renderPostReactionIcons(post)}
                                  <span className="font-bold text-slate-700">{post.likesCount}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 font-medium text-slate-600">
                              {post.commentsCount > 0 && (
                                <span 
                                  onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                                  className="hover:underline cursor-pointer"
                                >
                                  {post.commentsCount}টি মন্তব্য
                                </span>
                              )}
                              {post.sharesCount > 0 && (
                                <span 
                                  onClick={() => handleSharePost(post)}
                                  className="hover:underline cursor-pointer"
                                >
                                  {post.sharesCount}টি শেয়ার
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Facebook Lite Style Action Pills */}
                        <div className="px-2.5 pb-2.5 pt-1 flex items-center justify-between gap-2 border-t border-slate-100/80">
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
                            type="button"
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
                            type="button"
                            onClick={() => handleSharePost(post)}
                            className="flex-1 py-2 px-3 sm:px-4 rounded-full font-bold text-xs sm:text-[13px] border bg-[#f0f2f5] text-[#050505] border-slate-200/80 hover:bg-[#e4e6eb] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <Share2 size={16} />
                            <span>শেয়ার</span>
                            {post.sharesCount > 0 ? <span>({post.sharesCount})</span> : null}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABOUT - COMPLETE 10 SECTIONS */}
          {activeTab === "about" && (
            <div className="space-y-4">

              {/* 1. 👤 ব্যক্তিগত তথ্য (Personal Details) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">ব্যক্তিগত তথ্য</h3>
                      <p className="text-[11px] text-slate-500 font-medium">নাম, ঠিকানা ও নিজস্ব পরিচিতি</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800 font-semibold">
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <User size={16} className="text-[#1877F2] shrink-0" />
                    <div>
                      <p className="text-[10.5px] text-slate-400 font-bold">পূর্ণ নাম</p>
                      <p className="text-slate-900 font-extrabold">{targetUserProfile.name || "সম্মানিত নাগরিক"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <MapPin size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10.5px] text-slate-400 font-bold">Lives in (বর্তমান বাসস্থান)</p>
                      <p className="text-slate-900 font-extrabold">{targetUserProfile.location || targetUserProfile.address || targetUserProfile.union || "পুঠিয়া, রাজশাহী"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <Home size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10.5px] text-slate-400 font-bold">From (স্থায়ী এলাকা)</p>
                      <p className="text-slate-900 font-extrabold">{targetUserProfile.hometown || "রাজশাহী"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <Cake size={16} className="text-rose-500 shrink-0" />
                    <div>
                      <p className="text-[10.5px] text-slate-400 font-bold">জন্মদিন</p>
                      <p className="text-slate-900 font-extrabold">{targetUserProfile.birthday || targetUserProfile.birthDate || "১২ অক্টোবর"}</p>
                    </div>
                  </div>

                  {targetUserProfile.gender && (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <Sparkles size={16} className="text-purple-600 shrink-0" />
                      <div>
                        <p className="text-[10.5px] text-slate-400 font-bold">লিঙ্গ</p>
                        <p className="text-slate-900 font-extrabold">{targetUserProfile.gender === 'male' ? 'পুরুষ' : targetUserProfile.gender === 'female' ? 'নারী' : targetUserProfile.gender}</p>
                      </div>
                    </div>
                  )}

                  {targetUserProfile.bloodGroup && (
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <Droplet size={16} className="text-rose-600 shrink-0" />
                      <div>
                        <p className="text-[10.5px] text-slate-400 font-bold">রক্তের গ্রুপ</p>
                        <p className="text-rose-700 font-extrabold">{targetUserProfile.bloodGroup}</p>
                      </div>
                    </div>
                  )}
                </div>

                {targetUserProfile.bio && (
                  <div className="mt-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100/60">
                    <p className="text-[11px] text-[#1877F2] font-black uppercase tracking-wider mb-0.5">নিজের সম্পর্কে (Bio)</p>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{targetUserProfile.bio}</p>
                  </div>
                )}
              </div>

              {/* 2. 📞 যোগাযোগ ও প্রাথমিক তথ্য (Contact Info) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">যোগাযোগ ও অনলাইন মাধ্যম</h3>
                      <p className="text-[11px] text-slate-500 font-medium">মোবাইল, ইমেইল ও সোশ্যাল মাধ্যম</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  {/* Phone */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10.5px] text-slate-400 font-bold">মোবাইল নম্বর</p>
                        <p className="text-slate-900 font-extrabold">
                          {isOwnProfile || !targetUserProfile?.privacySettings?.privacyHidePhone
                            ? (targetUserProfile.phone || "তথ্য দেওয়া হয়নি")
                            : "•••••••••• (গোপনীয়)"}
                        </p>
                      </div>
                    </div>
                    {(isOwnProfile || !targetUserProfile?.privacySettings?.privacyHidePhone) && targetUserProfile.phone && (
                      <a 
                        href={`tel:${targetUserProfile.phone}`}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition"
                      >
                        কল করুন
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  {targetUserProfile.email && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-blue-600 shrink-0" />
                        <div>
                          <p className="text-[10.5px] text-slate-400 font-bold">ইমেইল ঠিকানা</p>
                          <p className="text-slate-900 font-extrabold truncate max-w-[200px] sm:max-w-xs">
                            {isOwnProfile || targetUserProfile?.privacySettings?.email !== 'only_me'
                              ? targetUserProfile.email
                              : "•••••••••• (গোপনীয়)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {targetUserProfile.whatsapp && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Smartphone size={16} className="text-green-600 shrink-0" />
                        <div>
                          <p className="text-[10.5px] text-slate-400 font-bold">WhatsApp</p>
                          <p className="text-slate-900 font-extrabold">{targetUserProfile.whatsapp}</p>
                        </div>
                      </div>
                      <a 
                        href={`https://wa.me/${targetUserProfile.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700 transition"
                      >
                        মেসেজ
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {targetUserProfile.website && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-sky-600 shrink-0" />
                        <div>
                          <p className="text-[10.5px] text-slate-400 font-bold">ওয়েবসাইট</p>
                          <p className="text-slate-900 font-extrabold truncate max-w-[200px] sm:max-w-xs">{targetUserProfile.website}</p>
                        </div>
                      </div>
                      <a 
                        href={targetUserProfile.website.startsWith('http') ? targetUserProfile.website : `https://${targetUserProfile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-[11px] font-bold hover:bg-sky-700 transition"
                      >
                        ভিজিট
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. 🎓 শিক্ষা (Education) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">শিক্ষা ও যোগ্যতা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">বিদ্যালয়, কলেজ ও শিক্ষাগত ডিগ্রি</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditEducationClick}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {targetUserProfile.collegeUniversity || targetUserProfile.education || "N.S. Government College, Natore"}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {targetUserProfile.major || targetUserProfile.degree || "উচ্চ মাধ্যমিক / ডিগ্রি"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        পুঠিয়া স্মার্ট পোর্টাল নিবন্ধিত নাগরিক
                      </p>
                    </div>
                  </div>

                  {targetUserProfile.highSchool && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{targetUserProfile.highSchool}</h4>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">মাধ্যমিক স্কুল</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. 💼 কাজ ও পেশা (Work & Profession) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">কাজ ও পেশা</h3>
                      <p className="text-[11px] text-slate-500 font-medium">কর্মসংস্থান, প্রতিষ্ঠান ও পদবি</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {targetUserProfile.workCompany || targetUserProfile.workExperience || targetUserProfile.occupation || "স্বাধীন পেশাজীবী / নাগরিক"}
                    </h4>
                    {targetUserProfile.workRole && (
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        পদবি: {targetUserProfile.workRole}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      কর্মস্থল: {targetUserProfile.workLocation || targetUserProfile.location || "পুঠিয়া, রাজশাহী"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. 🏠 ঠিকানা ও এলাকা (Address & Area) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Home size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">ঠিকানা ও ভৌগোলিক এরিয়া</h3>
                      <p className="text-[11px] text-slate-500 font-medium">জেলা, উপজেলা, ইউনিয়ন ও গ্রাম</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold text-slate-800">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">জেলা</p>
                    <p className="text-slate-900 font-extrabold mt-0.5">{targetUserProfile.district || "রাজশাহী"}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">উপজেলা</p>
                    <p className="text-slate-900 font-extrabold mt-0.5">{targetUserProfile.upazila || "পুঠিয়া"}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">ইউনিয়ন / পৌরসভা</p>
                    <p className="text-slate-900 font-extrabold mt-0.5">{targetUserProfile.union || "পুঠিয়া ইউনিয়ন"}</p>
                  </div>
                  {targetUserProfile.village && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">গ্রাম / এলাকা</p>
                      <p className="text-slate-900 font-extrabold mt-0.5">{targetUserProfile.village}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. 🏢 ব্যবসা ও প্রতিষ্ঠান (Businesses) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">আমার ব্যবসা ও প্রতিষ্ঠান</h3>
                      <p className="text-[11px] text-slate-500 font-medium">নিবন্ধিত ব্যবসায়িক প্রতিষ্ঠানসমূহ</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={() => navigate("/businesses")}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Plus size={13} />
                      <span>ব্যবসা যোগ করুন</span>
                    </button>
                  )}
                </div>

                {userBusinesses.length > 0 ? (
                  <div className="space-y-2.5">
                    {userBusinesses.map((b) => (
                      <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center shrink-0">
                            🏢
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">{b.title || b.name}</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">{b.category} • {b.address || "পুঠিয়া"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/businesses/${b.id}`)}
                          className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shrink-0 border-0 cursor-pointer"
                        >
                          প্রোফাইল
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>এখনো কোনো ব্যবসা তালিকাভুক্ত করা হয়নি</p>
                  </div>
                )}
              </div>

              {/* 7. 🛠️ দক্ষতা ও সেবা (Skills & Services) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">দক্ষতা ও সেবা (Skills)</h3>
                      <p className="text-[11px] text-slate-500 font-medium">যেসব সেবা বা স্কিল প্রদান করা সম্ভব</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(targetUserProfile.skills && Array.isArray(targetUserProfile.skills) && targetUserProfile.skills.length > 0) ? (
                    targetUserProfile.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-cyan-50 text-cyan-800 font-extrabold text-xs rounded-xl border border-cyan-200/80 shadow-2xs">
                        ⚡ {skill}
                      </span>
                    ))
                  ) : (
                    ["ফটোগ্রাফি", "কম্পিউটার সেবা", "শিক্ষকতা", "স্মার্ট সিটিজেন"].map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* 8. 🌐 সোশ্যাল লিংক (Social Links) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">সোশ্যাল মিডিয়া অ্যাকাউন্ট</h3>
                      <p className="text-[11px] text-slate-500 font-medium">ফেসবুক, ইউটিউব, ইনস্টাগ্রাম ইত্যাদি</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1877F2] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {targetUserProfile.facebook && (
                    <a 
                      href={targetUserProfile.facebook.startsWith('http') ? targetUserProfile.facebook : `https://facebook.com/${targetUserProfile.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-blue-50 text-[#1877F2] hover:bg-blue-100 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
                    >
                      <Share2 size={14} />
                      <span>Facebook</span>
                    </a>
                  )}

                  {targetUserProfile.youtube && (
                    <a 
                      href={targetUserProfile.youtube.startsWith('http') ? targetUserProfile.youtube : `https://youtube.com/${targetUserProfile.youtube}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
                    >
                      <Share2 size={14} />
                      <span>YouTube</span>
                    </a>
                  )}

                  {targetUserProfile.instagram && (
                    <a 
                      href={targetUserProfile.instagram.startsWith('http') ? targetUserProfile.instagram : `https://instagram.com/${targetUserProfile.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
                    >
                      <Share2 size={14} />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 9. 🏆 অর্জন ও সামাজিক সংগঠন (Achievements & Organizations) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Award size={18} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-extrabold text-base leading-tight">অর্জন ও সামাজিক সংগঠন</h3>
                      <p className="text-[11px] text-slate-500 font-medium">পুরস্কার, পদক ও সামাজিক কাজের স্বীকৃতি</p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      type="button"
                      onClick={handleEditDetailsClick}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Edit2 size={13} />
                      <span>এডিট করুন</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Award size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-900">স্মার্ট পুঠিয়া নাগরিক অ্যাওয়ার্ড</p>
                      <p className="text-[11px] text-slate-500">পোর্টাল সক্রিয় অংশগ্রহণের বিশেষ স্বীকৃতি</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 10. 📅 পোর্টাল সদস্যতা ও এক্টিভিটি তথ্য (Profile Meta & Activity) */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4.5 text-white shadow-md">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white">পোর্টাল সদস্যতা স্ট্যাটাস</h3>
                  </div>
                  {targetUserProfile.isVerified && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                      Verified ✓
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-300 font-medium">যোগদানের সময়</p>
                    <p className="text-emerald-300 font-extrabold mt-0.5">
                      {targetUserProfile.createdAt
                        ? (typeof targetUserProfile.createdAt === 'string' ? targetUserProfile.createdAt : 'জানুয়ারি ২০২৬')
                        : 'জানুয়ারি ২০২৬'}
                    </p>
                  </div>

                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-300 font-medium">মোট পোস্ট</p>
                    <p className="text-white font-extrabold mt-0.5">{toBengali(userPostsCount)}টি</p>
                  </div>

                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-300 font-medium">মোট বন্ধু</p>
                    <p className="text-white font-extrabold mt-0.5">{toBengali(friendsCount)} জন</p>
                  </div>

                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-300 font-medium">Followers</p>
                    <p className="text-white font-extrabold mt-0.5">{toBengali(followersCount)} জন</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: FRIENDS */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                  <div>
                    <h3 className="text-slate-900 font-black text-base flex items-center gap-2">
                      <span>Friends</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#1877F2] font-black border border-blue-100">
                        {toBengali(friendsList.length || targetUserProfile.friends?.length || 0)}
                      </span>
                    </h3>
                    {!isOwnProfile && (
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {toBengali(
                          (currentUserProfile?.friends || []).filter((fId: any) => {
                            const id = typeof fId === 'string' ? fId : fId?.uid;
                            return (targetUserProfile.friends || []).includes(id);
                          }).length
                        )} mutual friends
                      </p>
                    )}
                  </div>
                  
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate("/friends")}
                      className="text-xs text-[#1877F2] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>সকল ফ্রেন্ড রিকোয়েস্ট দেখুন</span>
                      <ArrowLeft className="rotate-180 w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Search Bar if friends > 2 */}
                {friendsList.length > 2 && (
                  <div className="relative mb-4">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={friendSearchQuery}
                      onChange={(e) => setFriendSearchQuery(e.target.value)}
                      placeholder="বন্ধু খুঁজুন (নাম বা ইউনিয়ন দিয়ে)..."
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-semibold pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    {friendSearchQuery && (
                      <button
                        onClick={() => setFriendSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                {friendsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-3 animate-pulse flex flex-col items-center gap-2 border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200" />
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                        <div className="h-2 w-14 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (friendsList.length === 0 || !targetUserProfile.friends || targetUserProfile.friends.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                    <Users className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">
                      এখনো কোনো ফ্রেন্ড তালিকায় যুক্ত হয়নি
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/friends")}
                        className="mt-3 px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition shadow-xs cursor-pointer"
                      >
                        নতুন বন্ধু খুঁজুন
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {friendsList
                      .filter((f) => {
                        if (!friendSearchQuery.trim()) return true;
                        const q = friendSearchQuery.toLowerCase().trim();
                        return (
                          (f.name && f.name.toLowerCase().includes(q)) ||
                          (f.displayName && f.displayName.toLowerCase().includes(q)) ||
                          (f.username && f.username.toLowerCase().includes(q)) ||
                          (f.union && f.union.toLowerCase().includes(q)) ||
                          (f.village && f.village.toLowerCase().includes(q))
                        );
                      })
                      .map((friend: any, idx: number) => {
                        const friendName = friend.name || friend.displayName || 'সম্মানিত নাগরিক';
                        const initial = friendName.trim()[0] || 'ন';
                        const friendPhoto = friend.photoURL;
                        const friendUnion = friend.union || friend.location || 'পুঠিয়া';

                        return (
                          <div
                            key={friend.uid || idx}
                            onClick={() => navigate(`/citizen/${friend.uid || friend.id}`)}
                            className="group relative bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-2xl p-3 flex flex-col items-center text-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            {/* Avatar */}
                            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-2xs mb-2 group-hover:scale-105 transition-transform duration-200">
                              {friendPhoto ? (
                                <img
                                  src={friendPhoto}
                                  alt={friendName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                  {initial}
                                </div>
                              )}
                            </div>

                            {/* Name & Badge */}
                            <div className="w-full px-1">
                              <div className="flex items-center justify-center gap-1">
                                <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-[#1877F2] transition">
                                  {friendName}
                                </h4>
                                {friend.verified && (
                                  <CheckCircle2 size={12} className="text-blue-500 fill-blue-50 shrink-0" />
                                )}
                              </div>

                              {/* Union / Location */}
                              <p className="text-[10.5px] font-semibold text-slate-500 truncate mt-0.5">
                                📍 {friendUnion}
                              </p>
                            </div>

                            {/* Interactive Action Buttons */}
                            <div className="w-full flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartFriendChat(friend);
                                }}
                                className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-600 hover:text-white text-[#1877F2] border border-blue-200 text-[10.5px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                title="মেসেজ পাঠান"
                              >
                                <MessageCircle size={11} className="stroke-[2.5]" />
                                <span>মেসেজ</span>
                              </button>

                              {isOwnProfile && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnfriendFriend(friend.uid || friend.id);
                                  }}
                                  className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 text-[10.5px] font-bold rounded-xl transition cursor-pointer"
                                  title="আনফ্রেন্ড করুন"
                                >
                                  <X size={12} className="stroke-[2.5]" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SCROLLE / REELS */}
          {activeTab === "scrolle" && (
            <div className="space-y-4">
              {userReels.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 font-semibold">
                  এখনো কোনো স্ক্রল বা রিলস ভিডিও আপলোড করা হয়নি।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {userReels.map((reel) => (
                    <div 
                      key={reel.id} 
                      onClick={() => navigate("/reels")}
                      className="aspect-[9/16] rounded-2xl overflow-hidden relative bg-slate-900 shadow-sm cursor-pointer group hover:shadow-md transition"
                    >
                      {reel.thumbnailUrl ? (
                        <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                          <Video size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white line-clamp-2">
                        {reel.title || "রিলস ভিডিও"}
                      </div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-[9px] text-white font-extrabold flex items-center gap-1">
                        <Play size={8} className="fill-current text-white" />
                        <span>{reel.viewsCount || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PHOTOS */}
          {activeTab === "photos" && (
            <div className="space-y-4">
              {userPhotos.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 font-semibold">
                  গ্যালারিতে এখনো কোনো ছবি নেই।
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {userPhotos.map((photo, index) => (
                    <div 
                      key={index}
                      className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-102 transition"
                    >
                      <img src={photo} alt={`User uploaded ${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 8. Facebook Profile Editor Modal (Screenshot 2) */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        formData={editFormData}
        setFormData={setEditFormData}
        handleSubmit={handleEditProfileSubmit}
        handleImageUpload={handleEditProfileImageUpload}
        handleCoverUpload={handleEditProfileCoverUpload}
        editLoading={editLoading}
        editSuccess={editSuccess}
        editError={editError}
      />

      {/* 9. Profile Options / More Menu Bottom Sheet */}
      <AnimatePresence>
        {showMoreMenu && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h4 className="text-slate-900 dark:text-white font-black text-base">
                    প্রোফাইল অপশন ও সেটিংস
                  </h4>
                </div>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center text-sm border-0 bg-transparent cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1.5 py-1">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <LayoutDashboard size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">নাগরিক ড্যাশবোর্ড</p>
                        <p className="text-[10px] text-slate-500">আপনার ব্যক্তিগত প্রোফাইল ও অ্যাক্টিভিটি হাব</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        navigate("/adda");
                      }}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Plus size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">স্টোরি বা পোস্ট যোগ করুন</p>
                        <p className="text-[10px] text-slate-500">আড্ডা ফিডে নতুন ছবি, স্ট্যাটাস বা নোটিশ শেয়ার করুন</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleEditDetailsClick();
                      }}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Edit3 size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">প্রোফাইল এডিট করুন</p>
                        <p className="text-[10px] text-slate-500">নাম, বায়ো, ছবি ও তথ্য হালনাগাদ</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        navigate("/security-center");
                      }}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Shield size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">সিকিউরিটি ও ডিভাইস লগ</p>
                        <p className="text-[10px] text-slate-500">অ্যাকাউন্ট নিরাপত্তা ও সাম্প্রতিক লগইন হিস্টোরি</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        handleOpenChat();
                      }}
                      className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">ইনবক্সে বার্তা পাঠান</p>
                        <p className="text-[10px] text-slate-500">সরাসরি লাইভ চ্যাট শুরু করুন</p>
                      </div>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleShare();
                  }}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 text-left transition cursor-pointer border-0 bg-transparent"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Copy size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">প্রোফাইল লিংক কপি ও শেয়ার</p>
                    <p className="text-[10px] text-slate-500">সোশ্যাল মিডিয়ায় প্রোফাইল শেয়ার করুন</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer border-0"
              >
                বন্ধ করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

            {/* Header */}
            <div className="px-4 py-2 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-1.5">
                {(recentPosts.find(p => p.id === activeCommentPost)?.likesCount || 0) > 0 ? (
                  <>
                    {renderPostReactionIcons(recentPosts.find(p => p.id === activeCommentPost)!)}
                    <span className="text-xs font-bold text-slate-800">
                      {recentPosts.find(p => p.id === activeCommentPost)?.likesCount}
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
                    const p = recentPosts.find(p => p.id === activeCommentPost);
                    if (p) handleLike(p, p.userReaction || 'like');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  title="লাইক"
                >
                  <ThumbsUp size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveCommentPost(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Comments Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-white">
              {(() => {
                const activePost = recentPosts.find(p => p.id === activeCommentPost);
                if (!activePost) return null;
                return (
                  <FacebookCommentSystem
                    postId={activePost.id}
                    post={activePost}
                    currentUser={user}
                    userProfile={currentUserProfile}
                    firestoreUsers={[]}
                    onSelectProfileUser={(pUser) => {
                      setActiveCommentPost(null);
                      navigate(`/profile/${pUser.id || pUser.uid}`);
                    }}
                    isModal={true}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Followers & Following Modal (Interactive List) */}
      <AnimatePresence>
        {socialModalType && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div 
              className="fixed inset-0" 
              onClick={() => setSocialModalType(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {socialModalType === "followers" ? "Followers (অনুসারী)" : "Following (অনুসরণ)"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      মোট {socialModalType === "followers" ? followersCount : followingCount} জন
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSocialModalType(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition cursor-pointer border-0"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={socialSearchQuery}
                    onChange={(e) => setSocialSearchQuery(e.target.value)}
                    placeholder="নাম বা ইউজারনেম দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1877F2] transition"
                  />
                  {socialSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSocialSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Users List Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-50">
                {socialModalLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-500 font-bold">তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : (() => {
                  const filtered = socialModalUsers.filter(uItem => {
                    if (!socialSearchQuery.trim()) return true;
                    const q = socialSearchQuery.toLowerCase();
                    const nameMatch = (uItem.name || "").toLowerCase().includes(q);
                    const usernameMatch = (uItem.username || uItem.nickname || "").toLowerCase().includes(q);
                    return nameMatch || usernameMatch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center">
                        <Users size={36} className="mx-auto text-slate-300 stroke-[1.5] mb-2" />
                        <p className="text-xs font-bold text-slate-500">
                          {socialSearchQuery ? "কোনো ব্যবহারকারী পাওয়া যায়নি" : "তালিকায় এখনো কেউ নেই"}
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((uItem) => {
                    const isFollowingThisUser = currentUserProfile?.following?.includes(uItem.uid);
                    const isSelf = user && user.uid === uItem.uid;

                    return (
                      <div
                        key={uItem.uid}
                        className="pt-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50/80 p-2 rounded-2xl transition"
                      >
                        {/* Profile Info - Clicking goes to user profile */}
                        <div
                          onClick={() => {
                            setSocialModalType(null);
                            navigate(`/profile/${uItem.uid}`);
                          }}
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            {uItem.photoURL ? (
                              <img src={uItem.photoURL} alt={uItem.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                                {(uItem.name || 'ন')[0]}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {uItem.name || "সম্মানিত নাগরিক"}
                              </p>
                              {(uItem.isVerified || uItem.role === 'admin' || uItem.role === 'super_admin') && (
                                <CheckCircle2 size={13} className="text-[#1877F2] shrink-0 fill-blue-50" />
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-400 font-semibold truncate">
                              @{uItem.username || uItem.nickname || "user"}
                              {uItem.union && ` • ${uItem.union}`}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        {!isSelf && user && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSocialModalType(null);
                                handleStartFriendChat(uItem);
                              }}
                              className="w-8 h-8 rounded-full bg-blue-50 text-[#1877F2] hover:bg-blue-100 flex items-center justify-center transition cursor-pointer border-0"
                              title="মেসেজ পাঠান"
                            >
                              <MessageCircle size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleFollowInModal(uItem.uid)}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer border-0 ${
                                isFollowingThisUser
                                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  : "bg-[#1877F2] text-white hover:bg-blue-600 shadow-xs"
                              }`}
                            >
                              {isFollowingThisUser ? "Following" : "Follow"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      {lightboxOpen && lightboxPost && (
        <ImageLightbox
          isOpen={lightboxOpen}
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          userName={targetUserProfile?.name || lightboxPost.author}
          authorPhotoUrl={targetUserProfile?.photoURL || lightboxPost.authorPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lightboxPost.authorId || lightboxPost.author}`}
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

      {/* Read-Only Profile Details Modal for viewing other citizens' details */}
      {showReadOnlyDetailsModal && targetUserProfile && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative text-slate-800 space-y-4">
            <button
              type="button"
              onClick={() => setShowReadOnlyDetailsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border-0 bg-transparent cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {targetUserProfile.photoURL ? (
                  <img src={targetUserProfile.photoURL} alt={targetUserProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1877F2] text-white font-black flex items-center justify-center text-lg">
                    {(targetUserProfile.name || 'U')[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {targetUserProfile.name || "সম্মানিত নাগরিক"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  @{targetUserProfile.username || targetUserProfile.nickname || "user"} • ব্যক্তিগত তথ্য
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 font-semibold max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin size={18} className="text-[#1877F2] shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold">বর্তমান ঠিকানা</p>
                  <p className="text-slate-900 font-extrabold">{targetUserProfile.location || targetUserProfile.address || targetUserProfile.union || "পুঠিয়া, রাজশাহী"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Home size={18} className="text-[#1877F2] shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold">স্থায়ী বাসস্থান / হোমটাউন</p>
                  <p className="text-slate-900 font-extrabold">{targetUserProfile.hometown || "রাজশাহী"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Cake size={18} className="text-[#1877F2] shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold">জন্ম তারিখ</p>
                  <p className="text-slate-900 font-extrabold">{targetUserProfile.birthday || targetUserProfile.birthDate || "১২ অক্টোবর"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <GraduationCap size={18} className="text-[#1877F2] shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold">শিক্ষা প্রতিষ্ঠান</p>
                  <p className="text-slate-900 font-extrabold">{targetUserProfile.education || targetUserProfile.collegeUniversity || "N.S. Government College, Natore"}</p>
                </div>
              </div>

              {targetUserProfile.bio && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[11px] text-slate-500 font-bold">বায়ো (Bio)</p>
                  <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">{targetUserProfile.bio}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowReadOnlyDetailsModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition border-0 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Plus, X, ChevronLeft, ChevronRight, Heart, Send, Image as ImageIcon, 
  Sparkles, ThumbsUp, MapPin, Film, AlignLeft, RotateCw, Music, 
  Volume2, VolumeX, Eye, UserPlus, Tag, Settings, MoreVertical, 
  ShieldAlert, Bookmark, Share2, Sparkle, Lock, Globe, Users, 
  UserX, Trash2, Clock, Check, AlertTriangle, MessageSquare, Video,
  Camera, CheckSquare, ChevronDown, Upload, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  arrayUnion, 
  getDocs,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  compressImageToSafeFirestoreDataUrl, 
  generateVideoThumbnail 
} from '../services/mediaProcessingService';
import { 
  MusicLibraryModal 
} from './adda/music/MusicLibraryModal';
import { 
  AdminMusicManagerModal 
} from './adda/music/AdminMusicManagerModal';
import { 
  MusicAttachment, 
  musicLibraryService 
} from '../services/musicLibraryService';
import { cleanUndefined } from '../utils/firestoreUtils';

export interface AddaStoryView {
  userId: string;
  userName: string;
  userAvatar: string;
  viewedAt: number;
}

export interface AddaStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'video' | 'text';
  storyImage?: string;
  storyVideo?: string;
  textBio?: string;
  location?: string;
  feeling?: string;
  mentionId?: string;
  mentionName?: string;
  musicTrack?: {
    id: string;
    title: string;
    url: string;
    artist?: string;
    coverImage?: string;
    startTime?: number;
    duration?: number;
    musicVolume?: number;
    originalVolume?: number;
    isPuthiaSpecial?: boolean;
  };
  bgColor?: string;
  textColor?: string;
  fontSize?: string;
  rotation?: number;
  overlayText?: string;
  sticker?: string;
  privacy: 'public' | 'friends' | 'followers' | 'custom' | 'hide_selected';
  hideFromUsers?: string[];
  createdAt: number; // timestamp ms
  expiresAt: number; // createdAt + 24 hours
  viewsCount?: number;
  viewedBy?: string[]; // array of user UIDs
  viewersList?: AddaStoryView[];
  reactions?: { [emoji: string]: number };
  isArchived?: boolean;
}

export interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  coverImage?: string;
  category: string;
  storyIds: string[];
  createdAt: number;
}

export interface StorySettingsData {
  userId: string;
  defaultPrivacy: 'public' | 'friends' | 'followers' | 'custom';
  allowReplies: 'everyone' | 'friends' | 'no_one';
  allowMentions: 'everyone' | 'friends' | 'no_one';
  autoArchiveEnabled: boolean;
  hiddenFromUsers: string[];
  mutedUsers: string[];
}

const PRESET_BG_COLORS = [
  'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900',
  'bg-gradient-to-br from-[#006a4e] via-emerald-800 to-black',
  'bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900',
  'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-900',
  'bg-gradient-to-br from-amber-500 via-orange-600 to-red-800',
  'bg-gradient-to-br from-slate-900 via-gray-800 to-black',
];

const PRESET_TEXT_COLORS = [
  'text-white',
  'text-yellow-300',
  'text-emerald-300',
  'text-rose-200',
  'text-cyan-200',
];

const MUSIC_PRESETS = [
  { id: 'track_1', title: '🌾 পুঠিয়ার মেঠো সুর (ফ্লুট)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'track_2', title: '🎻 আড্ডা ঘরের গান (বেহালা)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'track_3', title: '🌧️ শ্রাবণের ঝিরিঝিরি বৃষ্টি', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'track_4', title: '🍉 নতুন বৈশাখী উৎসব', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

const FEELING_PRESETS = [
  { emoji: '😊', label: 'আনন্দিত' },
  { emoji: '🌾', label: 'শান্ত' },
  { emoji: '🍉', label: 'উৎসবমুখর' },
  { emoji: '🔥', label: 'রোমাঞ্চিত' },
  { emoji: '💖', label: 'ভালোবাসাময়' },
  { emoji: '☕', label: 'চা পিপাসু' },
];

const STICKER_PRESETS = [
  '✨', '🔥', '👑', '💯', '❤️', '📍 PUTHIA', '🟢 আড্ডা', '🎉 উৎসব', '🌻 শুভ সকাল'
];

const HIGHLIGHT_CATEGORIES = [
  { id: 'puthia', label: '🏞️ Puthia', icon: '🏞️' },
  { id: 'family', label: '👨‍👩‍👧 Family', icon: '👨‍👩‍👧' },
  { id: 'work', label: '💼 Work', icon: '💼' },
  { id: 'events', label: '🎉 Events', icon: '🎉' },
  { id: 'memories', label: '📷 Memories', icon: '📷' },
];

const DEFAULT_COMMUNITY_STORIES: AddaStory[] = [
  {
    id: 'story_default_1',
    userId: 'puthia_heritage',
    userName: 'পুঠিয়া রাজবাড়ী',
    userAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    type: 'image',
    storyImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600&auto=format&fit=crop&q=80',
    feeling: '🏛️',
    privacy: 'public',
    createdAt: Date.now() - 2 * 3600 * 1000,
    expiresAt: Date.now() + 22 * 3600 * 1000,
    viewsCount: 142,
    viewedBy: []
  },
  {
    id: 'story_default_2',
    userId: 'puthia_nature',
    userName: 'শিব সাগর দিঘী',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'image',
    storyImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    feeling: '🌿',
    privacy: 'public',
    createdAt: Date.now() - 4 * 3600 * 1000,
    expiresAt: Date.now() + 20 * 3600 * 1000,
    viewsCount: 98,
    viewedBy: []
  },
  {
    id: 'story_default_3',
    userId: 'puthia_food',
    userName: 'পুঠিয়ার মিষ্টি ও আড্ডা',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'image',
    storyImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    feeling: '☕',
    privacy: 'public',
    createdAt: Date.now() - 6 * 3600 * 1000,
    expiresAt: Date.now() + 18 * 3600 * 1000,
    viewsCount: 215,
    viewedBy: []
  }
];

const GALLERY_SAMPLES = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', title: 'Lake' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80', title: 'Heart' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', title: 'Beach' },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80', title: 'Nature' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1511497584788-876761c11969?auto=format&fit=crop&w=600&q=80', title: 'Forest' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80', title: 'Mountain' },
  { id: 'g7', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80', title: 'Night' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80', title: 'Sunset' },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80', title: 'Garden' },
];

export function StoriesBar() {
  const { user, userProfile } = useAuth();
  const [stories, setStories] = useState<AddaStory[]>([]);
  const [archivedStories, setArchivedStories] = useState<AddaStory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeUserStoryIndex, setActiveUserStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isViewersListOpen, setIsViewersListOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isUserSelectionOpen, setIsUserSelectionOpen] = useState(false);

  // Custom Story Builder State
  const [storyStep, setStoryStep] = useState<'picker' | 'editor'>('picker');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [storyType, setStoryType] = useState<'image' | 'video' | 'text'>('image');
  const [newStoryImageUrl, setNewStoryImageUrl] = useState('');
  const [newStoryVideoUrl, setNewStoryVideoUrl] = useState('');
  const [newStoryText, setNewStoryText] = useState('');
  
  // Customizations
  const [newStoryLocation, setNewStoryLocation] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState(PRESET_BG_COLORS[0]);
  const [selectedTextColor, setSelectedTextColor] = useState(PRESET_TEXT_COLORS[0]);
  const [selectedMusicId, setSelectedMusicId] = useState('');
  const [selectedMusicAttachment, setSelectedMusicAttachment] = useState<MusicAttachment | null>(null);
  const [isMusicLibraryOpen, setIsMusicLibraryOpen] = useState(false);
  const [isAdminMusicManagerOpen, setIsAdminMusicManagerOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [rotation, setRotation] = useState(0);
  const [fontSize, setFontSize] = useState('text-xl');
  const [selectedMentionUid, setSelectedMentionUid] = useState('');
  const [selectedMentionName, setSelectedMentionName] = useState('');
  const [privacyOption, setPrivacyOption] = useState<'public' | 'friends' | 'followers' | 'custom' | 'hide_selected'>('public');
  const [selectedHideUserIds, setSelectedHideUserIds] = useState<string[]>([]);

  // Story Settings
  const [userSettings, setUserSettings] = useState<StorySettingsData>({
    userId: user?.uid || '',
    defaultPrivacy: 'public',
    allowReplies: 'everyone',
    allowMentions: 'everyone',
    autoArchiveEnabled: true,
    hiddenFromUsers: [],
    mutedUsers: []
  });

  // Report Form
  const [reportReason, setReportReason] = useState<'Spam' | 'Harassment' | 'Offensive Content' | 'Scam' | 'False Information' | 'Other'>('Spam');
  const [reportDetails, setReportDetails] = useState('');

  // Highlight Form
  const [highlightTitle, setHighlightTitle] = useState('');
  const [highlightCategory, setHighlightCategory] = useState(HIGHLIGHT_CATEGORIES[0].label);

  // All Users List for Mentions & Privacy Selection
  const [allUsers, setAllUsers] = useState<{ uid: string; name: string; photoURL?: string }[]>([]);

  // Playback & Interaction
  const [progress, setProgress] = useState(0);
  const [storyMessage, setStoryMessage] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number }[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Real-time Active Stories from Firestore
  useEffect(() => {
    const now = Date.now();
    const cutoff24h = now - 24 * 60 * 60 * 1000;
    const storiesRef = collection(db, "stories");
    const q = query(storiesRef, where("createdAt", ">=", cutoff24h));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeStories: AddaStory[] = [];
      const userExpiredStories: AddaStory[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AddaStory;
        const storyItem = { id: docSnap.id, ...data };

        // Expiration check (24 hours)
        if (data.createdAt >= cutoff24h) {
          // Check privacy / hide rules
          if (!data.hideFromUsers || !user || !data.hideFromUsers.includes(user.uid)) {
            activeStories.push(storyItem);
          }
        } else if (data.userId === user?.uid) {
          userExpiredStories.push(storyItem);
        }
      });

      // Filter out muted users' stories
      const filteredStories = activeStories.filter(s => !userSettings.mutedUsers.includes(s.userId));
      filteredStories.sort((a, b) => b.createdAt - a.createdAt);

      setStories(filteredStories);
      setArchivedStories(userExpiredStories);
      try { localStorage.setItem("cached_active_stories", JSON.stringify(filteredStories)); } catch {}
      setLoading(false);
    }, (error) => {
      if (error?.message?.includes("Quota") || error?.code === "resource-exhausted") {
        console.warn("Firestore quota limit reached for stories. Loading default community stories.");
      } else {
        console.warn("Error subscribing to stories:", error?.message || error);
      }
      let fallbackStories = DEFAULT_COMMUNITY_STORIES;
      try {
        const cached = localStorage.getItem("cached_active_stories");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            fallbackStories = parsed;
          }
        }
      } catch {}
      setStories(fallbackStories);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (_) {}
      }
    };
  }, [user, userSettings.mutedUsers]);

  // Load User Story Settings with local cache and resilient offline fallback
  useEffect(() => {
    if (!user) return;
    try {
      const cached = localStorage.getItem(`story_settings_${user.uid}`);
      if (cached) {
        setUserSettings(JSON.parse(cached));
      }
    } catch {}

    const settingsDocRef = doc(db, "story_settings", user.uid);
    getDoc(settingsDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as StorySettingsData;
          setUserSettings(data);
          try {
            localStorage.setItem(`story_settings_${user.uid}`, JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => {
        // Graceful offline fallback
        console.warn("Note: Offline or cached story settings in use:", err?.message || err);
      });
  }, [user]);

  // Fetch Users for Mentions & Hide List
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const usersList: { uid: string; name: string; photoURL?: string }[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (docSnap.id && docSnap.id !== user?.uid) {
            usersList.push({ 
              uid: docSnap.id, 
              name: data.name || data.displayName || 'ব্যবহারকারী',
              photoURL: data.photoURL
            });
          }
        });
        setAllUsers(usersList);
      } catch (err) {
        console.warn("Users list offline fallback:", err);
      }
    };
    fetchUsers();
  }, [user]);

  // Group Stories By Author for Seamless Segmented Browsing
  const groupedUserStories = useMemo(() => {
    const activeList = stories.length > 0 ? stories : DEFAULT_COMMUNITY_STORIES;
    const groups: { [userId: string]: AddaStory[] } = {};
    activeList.forEach(s => {
      if (!groups[s.userId]) groups[s.userId] = [];
      groups[s.userId].push(s);
    });
    // Ensure array of user story groups
    return Object.values(groups).map(group => group.sort((a, b) => a.createdAt - b.createdAt));
  }, [stories]);

  const scrollStories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Active Story & Group Computation
  const activeUserGroup = activeUserStoryIndex !== null ? groupedUserStories[activeUserStoryIndex] : null;
  const activeStory = activeUserGroup ? activeUserGroup[activeSegmentIndex] || activeUserGroup[0] : null;

  // Story Viewer Playback & Progress Timer
  useEffect(() => {
    if (!activeStory || isPaused) {
      return;
    }

    setProgress(0);

    // Audio Track Management
    if (activeStory.musicTrack?.url) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(activeStory.musicTrack.url);
      audio.loop = true;
      audio.muted = isAudioMuted;
      audio.volume = activeStory.musicTrack.musicVolume ?? 0.8;
      if (activeStory.musicTrack.startTime) {
        audio.currentTime = activeStory.musicTrack.startTime;
      }
      audioRef.current = audio;
      audio.play().catch(e => {
        console.warn("Audio autoplay fallback note:", e);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    // Story Duration (5s for images/text)
    const intervalMs = 100;
    const totalSteps = 50; // 50 * 100ms = 5000ms

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Next Segment or Next User
          if (activeUserGroup && activeSegmentIndex < activeUserGroup.length - 1) {
            setActiveSegmentIndex(prevSeg => prevSeg + 1);
          } else if (activeUserStoryIndex !== null && activeUserStoryIndex < groupedUserStories.length - 1) {
            setActiveUserStoryIndex(prevUser => prevUser + 1);
            setActiveSegmentIndex(0);
          } else {
            // End of all stories
            setActiveUserStoryIndex(null);
            setActiveSegmentIndex(0);
          }
          return 0;
        }
        return prev + (100 / totalSteps);
      });
    }, intervalMs);

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeStory, activeSegmentIndex, activeUserStoryIndex, isPaused, isAudioMuted]);

  // Record View in Database when viewing someone else's story
  useEffect(() => {
    if (!activeStory || !user || activeStory.userId === user.uid) return;
    // Skip remote database update for default initial sample stories
    if (activeStory.id.startsWith("story_default_") || activeStory.id.startsWith("default_")) return;

    const alreadyViewed = activeStory.viewedBy?.includes(user.uid);
    if (!alreadyViewed) {
      const recordView = async () => {
        try {
          const storyRef = doc(db, "stories", activeStory.id);
          const newViewerObj: AddaStoryView = {
            userId: user.uid,
            userName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
            userAvatar: userProfile?.photoURL || user.photoURL || '',
            viewedAt: Date.now()
          };

          await setDoc(storyRef, {
            viewedBy: arrayUnion(user.uid),
            viewersList: arrayUnion(newViewerObj),
            viewsCount: (activeStory.viewsCount || 0) + 1
          }, { merge: true });
        } catch (err) {
          console.warn("Could not record story view remotely:", err);
        }
      };
      recordView();
    }
  }, [activeStory, user, userProfile]);

  // Navigation Handlers
  const handleNextStory = () => {
    if (!activeUserGroup) return;
    if (activeSegmentIndex < activeUserGroup.length - 1) {
      setActiveSegmentIndex(prev => prev + 1);
    } else if (activeUserStoryIndex !== null && activeUserStoryIndex < groupedUserStories.length - 1) {
      setActiveUserStoryIndex(prev => prev + 1);
      setActiveSegmentIndex(0);
    } else {
      setActiveUserStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (!activeUserGroup) return;
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex(prev => prev - 1);
    } else if (activeUserStoryIndex !== null && activeUserStoryIndex > 0) {
      setActiveUserStoryIndex(prev => prev - 1);
      const prevGroup = groupedUserStories[activeUserStoryIndex - 1];
      setActiveSegmentIndex(prevGroup ? prevGroup.length - 1 : 0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeUserStoryIndex === null) return;
      if (e.key === 'ArrowRight') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === 'Escape') setActiveUserStoryIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeUserStoryIndex, activeSegmentIndex, activeUserGroup]);

  // Open Create Story
  const handleAddStoryClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setStoryStep('picker');
    setStoryType('image');
    setNewStoryImageUrl('');
    setNewStoryVideoUrl('');
    setNewStoryText('');
    setNewStoryLocation('');
    setSelectedFeeling('');
    setSelectedBgColor(PRESET_BG_COLORS[0]);
    setSelectedTextColor(PRESET_TEXT_COLORS[0]);
    setSelectedMusicId('');
    setSelectedSticker('');
    setOverlayText('');
    setRotation(0);
    setFontSize('text-xl');
    setSelectedMentionUid('');
    setSelectedMentionName('');
    setPrivacyOption(userSettings.defaultPrivacy || 'public');
    setSelectedHideUserIds([]);
    setIsAddStoryOpen(true);
  };

  // File Upload Handlers (Photo / Video) with Auto-Compression & EXIF Stripping
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        toast.error("শুধুমাত্র ছবি আপলোড করা যাবে!");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("ছবির সাইজ সর্বোচ্চ ১৫ মেগাবাইট হতে পারে!");
        return;
      }
      
      const loadingToast = toast.loading("⏳ ছবিটি অপ্টিমাইজ ও কম্প্রেস করা হচ্ছে...");
      try {
        // Compress image using HTML Canvas & strip EXIF to guarantee payload < 200KB
        const compressedDataUrl = await compressImageToSafeFirestoreDataUrl(file, 1080, 180000);
        setNewStoryImageUrl(compressedDataUrl);
        toast.dismiss(loadingToast);
        toast.success("📷 ছবিটি সফলভাবে অপ্টিমাইজ ও লোড হয়েছে!");
      } catch (err) {
        toast.dismiss(loadingToast);
        console.error("Image compression error:", err);
        toast.error("ছবি প্রসেসিংয়ে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।");
      }
    } else {
      if (!file.type.startsWith('video/')) {
        toast.error("শুধুমাত্র ভিডিও আপলোড করা যাবে!");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("ভিডিওর সাইজ সর্বোচ্চ ৫০ মেগাবাইট হতে হবে!");
        return;
      }
      
      const loadingToast = toast.loading("⏳ ভিডিও যাচাই ও থাম্বনেইল প্রস্তুত হচ্ছে...");
      try {
        // Generate a lightweight thumbnail
        const thumb = await generateVideoThumbnail(file, 0.5);
        if (thumb) {
          setNewStoryImageUrl(thumb);
        }
        
        // For video playback in browser session
        const videoBlobUrl = URL.createObjectURL(file);
        setNewStoryVideoUrl(videoBlobUrl);
        
        toast.dismiss(loadingToast);
        toast.success("🎥 ভিডিও ও থাম্বনেইল প্রস্তুত হয়েছে!");
      } catch (err) {
        toast.dismiss(loadingToast);
        console.error("Video processing error:", err);
        toast.error("ভিডিও প্রসেসিংয়ে সমস্যা হয়েছে।");
      }
    }
  };

  // Create Story Submission
  const handleCreateStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (storyType === 'image' && !newStoryImageUrl.trim()) {
      toast.error('একটি ছবি নির্বাচন করুন বা আপলোড করুন');
      return;
    }
    if (storyType === 'video' && !newStoryVideoUrl.trim() && !newStoryImageUrl.trim()) {
      toast.error('একটি ভিডিও নির্বাচন করুন বা আপলোড করুন');
      return;
    }
    if (storyType === 'text' && !newStoryText.trim()) {
      toast.error('স্টোরি বা ভাবনাসমূহ লিখুন');
      return;
    }

    const submitToast = toast.loading('স্টোরি পোস্ট করা হচ্ছে...');

    try {
      const musicTrackPayload = selectedMusicAttachment ? {
        id: selectedMusicAttachment.trackId,
        title: selectedMusicAttachment.title,
        url: selectedMusicAttachment.url,
        artist: selectedMusicAttachment.artist,
        coverImage: selectedMusicAttachment.coverImage,
        startTime: selectedMusicAttachment.startTime,
        duration: selectedMusicAttachment.duration,
        musicVolume: selectedMusicAttachment.musicVolume,
        originalVolume: selectedMusicAttachment.originalVolume,
        isPuthiaSpecial: selectedMusicAttachment.isPuthiaSpecial
      } : (selectedMusicId ? {
        id: selectedMusicId,
        title: 'পুঠিয়া অডিও',
        url: 'https://cdn.freesound.org/previews/563/563812_11861866-lq.mp3'
      } : undefined);

      const now = Date.now();

      // Ensure final image is strictly compressed under 200KB for Firestore document limits
      let finalStoryImage = storyType === 'image' ? newStoryImageUrl : (newStoryImageUrl || undefined);
      if (finalStoryImage && finalStoryImage.startsWith('data:') && finalStoryImage.length > 200000) {
        finalStoryImage = await compressImageToSafeFirestoreDataUrl(finalStoryImage, 1080, 180000);
      }

      // Ensure video URL is clean and doesn't inject massive base64 payload into Firestore doc
      let finalStoryVideo = storyType === 'video' ? newStoryVideoUrl : undefined;
      if (finalStoryVideo && finalStoryVideo.startsWith('data:video/') && finalStoryVideo.length > 250000) {
        // If huge base64 was pasted, keep video thumbnail in storyImage and reset video URL
        finalStoryVideo = undefined;
      }

      const newStoryData: Omit<AddaStory, 'id'> = {
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
        userAvatar: userProfile?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        type: storyType,
        storyImage: finalStoryImage,
        storyVideo: finalStoryVideo,
        textBio: storyType === 'text' ? newStoryText : undefined,
        location: newStoryLocation.trim() || undefined,
        feeling: selectedFeeling || undefined,
        mentionId: selectedMentionUid || undefined,
        mentionName: selectedMentionName || undefined,
        musicTrack: musicTrackPayload,
        bgColor: storyType === 'text' ? selectedBgColor : undefined,
        textColor: selectedTextColor || undefined,
        fontSize: fontSize || undefined,
        rotation: rotation || undefined,
        overlayText: overlayText.trim() || undefined,
        sticker: selectedSticker || undefined,
        privacy: privacyOption,
        hideFromUsers: selectedHideUserIds,
        createdAt: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        viewsCount: 1,
        viewedBy: [user.uid],
        viewersList: [{
          userId: user.uid,
          userName: userProfile?.name || 'আপনি',
          userAvatar: userProfile?.photoURL || '',
          viewedAt: now
        }]
      };

      const cleanedData = cleanUndefined(newStoryData);
      
      // Document safety size check (Firestore limit is 1,048,576 bytes)
      const estimatedSizeBytes = JSON.stringify(cleanedData).length;
      if (estimatedSizeBytes > 800000) {
        if (cleanedData.storyImage && cleanedData.storyImage.startsWith('data:')) {
          cleanedData.storyImage = await compressImageToSafeFirestoreDataUrl(cleanedData.storyImage, 720, 100000);
        }
      }

      const docRef = await addDoc(collection(db, "stories"), cleanedData);

      // Trigger Mention Notification if mentioned
      if (selectedMentionUid) {
        try {
          await addDoc(collection(db, "notifications"), {
            userId: selectedMentionUid,
            type: "story_mention",
            title: "স্টোরিতে মেনশন!",
            message: `📸 ${userProfile?.name || 'একজন ব্যক্তি'} আপনাকে একটি Story-তে Mention করেছেন।`,
            senderId: user.uid,
            senderName: userProfile?.name || 'ব্যবহারকারী',
            senderAvatar: userProfile?.photoURL || '',
            storyId: docRef.id,
            read: false,
            createdAt: serverTimestamp()
          });
        } catch (notifErr) {
          console.warn("Mention notification non-critical error:", notifErr);
        }
      }

      toast.dismiss(submitToast);
      toast.success('🎉 আপনার আড্ডা স্টোরি সফলভাবে শেয়ার হয়েছে! এটি ২৪ ঘণ্টা সচল থাকবে।');
      setSelectedMusicAttachment(null);
      setSelectedMusicId('');
      setIsAddStoryOpen(false);
    } catch (err: any) {
      toast.dismiss(submitToast);
      console.error("Error creating story:", err);
      toast.error(err?.message || "দুঃখিত, স্টোরি শেয়ার করতে সমস্যা হয়েছে।");
    }
  };

  // Send Floating Reaction
  const handleSendReaction = async (emoji: string) => {
    if (!activeStory || !user) return;

    // Trigger local animation
    const id = Math.random().toString();
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingEmojis(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 1500);

    try {
      if (activeStory.id.startsWith("story_default_") || activeStory.id.startsWith("default_")) {
        return;
      }

      // Record reaction in story
      const storyRef = doc(db, "stories", activeStory.id);
      const currentReactions = activeStory.reactions || {};
      const newCount = (currentReactions[emoji] || 0) + 1;

      await setDoc(storyRef, {
        [`reactions.${emoji}`]: newCount
      }, { merge: true });

      // Send Notification to Story Owner
      if (activeStory.userId !== user.uid) {
        await addDoc(collection(db, "notifications"), {
          userId: activeStory.userId,
          type: "story_reaction",
          title: "স্টোরিতে প্রতিক্রিয়া!",
          message: `${emoji} ${userProfile?.name || 'একজন ব্যবহারকারী'} আপনার স্টোরিতে একটি প্রতিক্রিয়া দিয়েছেন।`,
          senderId: user.uid,
          senderName: userProfile?.name || 'ব্যবহারকারী',
          senderAvatar: userProfile?.photoURL || '',
          storyId: activeStory.id,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  };

  // Send Story Reply directly into Messages/Chat
  const handleSendStoryReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMessage.trim() || !activeStory || !user) return;

    const replyText = storyMessage.trim();
    setStoryMessage('');

    try {
      // Add message record to 'messages' collection
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        senderName: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
        senderPhoto: userProfile?.photoURL || user.photoURL || '',
        recipientId: activeStory.userId,
        type: 'story_reply',
        content: `💬 আপনি Story-তে Reply করেছেন: “${replyText}”`,
        storyData: {
          storyId: activeStory.id,
          type: activeStory.type,
          previewUrl: activeStory.storyImage || activeStory.storyVideo || activeStory.textBio
        },
        createdAt: serverTimestamp(),
        read: false
      });

      // Send Notification
      await addDoc(collection(db, "notifications"), {
        userId: activeStory.userId,
        type: "story_reply",
        title: "স্টোরিতে বার্তা উত্তর!",
        message: `💬 ${userProfile?.name || 'একজন ব্যক্তি'} আপনার স্টোরিতে রিপ্লাই দিয়েছেন: "${replyText}"`,
        senderId: user.uid,
        senderName: userProfile?.name || 'ব্যবহারকারী',
        senderAvatar: userProfile?.photoURL || '',
        storyId: activeStory.id,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success('💬 বার্তা সফলভাবে ইনবক্সে পাঠানো হয়েছে!');
    } catch (err) {
      console.error("Error sending story reply:", err);
      toast.error("দুঃখিত, রিপ্লাই পাঠাতে সমস্যা হয়েছে।");
    }
  };

  // Add Story to Highlights
  const handleAddToHighlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory || !user || !highlightTitle.trim()) return;

    try {
      await addDoc(collection(db, "story_highlights"), {
        userId: user.uid,
        title: highlightTitle.trim(),
        category: highlightCategory,
        coverImage: activeStory.storyImage || activeStory.userAvatar,
        storyIds: [activeStory.id],
        createdAt: Date.now()
      });

      toast.success(`⭐ Highlighting "${highlightTitle}" প্রোফাইলে যুক্ত হয়েছে!`);
      setIsHighlightModalOpen(false);
      setHighlightTitle('');
    } catch (err) {
      console.error("Error creating highlight:", err);
      toast.error("হাইলাইট যুক্ত করতে সমস্যা হয়েছে।");
    }
  };

  // Report Story
  const handleReportStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory || !user) return;

    try {
      await addDoc(collection(db, "story_reports"), {
        storyId: activeStory.id,
        storyOwnerId: activeStory.userId,
        reporterId: user.uid,
        reporterName: userProfile?.name || 'রিপোর্টার',
        reason: reportReason,
        details: reportDetails.trim(),
        createdAt: Date.now()
      });

      toast.success("🚩 আপনার রিপোর্ট অ্যাডমিন টিমের কাছে জমা দেওয়া হয়েছে। ধন্যবাদ!");
      setIsReportModalOpen(false);
      setReportDetails('');
    } catch (err) {
      console.error("Error reporting story:", err);
      toast.error("রিপোর্ট জমা দিতে ব্যর্থ হয়েছে।");
    }
  };

  // Mute User Stories
  const handleMuteUser = async (targetUserId: string, targetUserName: string) => {
    if (!user) return;
    try {
      const updatedMuted = [...userSettings.mutedUsers, targetUserId];
      const newSettings = {
        ...userSettings,
        userId: user.uid,
        mutedUsers: updatedMuted
      };
      setUserSettings(newSettings);
      try {
        localStorage.setItem(`story_settings_${user.uid}`, JSON.stringify(newSettings));
      } catch {}

      const settingsDocRef = doc(db, "story_settings", user.uid);
      await setDoc(settingsDocRef, newSettings, { merge: true });

      toast.success(`🔇 ${targetUserName}-এর স্টোরি হাইড করা হয়েছে।`);
      setActiveUserStoryIndex(null);
    } catch (err) {
      console.warn("Mute user saved locally:", err);
    }
  };

  // Delete Story (Owner)
  const handleDeleteStory = async (storyId: string) => {
    if (!user) return;
    if (!window.confirm("আপনি কি নিশ্চিত যে এই স্টোরিটি চিরতরে ডিলিট করতে চান?")) return;

    try {
      await deleteDoc(doc(db, "stories", storyId));
      toast.success("🗑️ স্টোরিটি সফলভাবে মুছে ফেলা হয়েছে!");
      setActiveUserStoryIndex(null);
    } catch (err) {
      console.error("Error deleting story:", err);
      toast.error("স্টোরি ডিলিট করা যায়নি।");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      try {
        localStorage.setItem(`story_settings_${user.uid}`, JSON.stringify(userSettings));
      } catch {}
      await setDoc(doc(db, "story_settings", user.uid), userSettings, { merge: true });
      toast.success("⚙️ স্টোরি সেটিংস সংরক্ষিত হয়েছে!");
      setIsSettingsOpen(false);
    } catch (err) {
      console.warn("Settings saved locally:", err);
      toast.success("⚙️ স্টোরি সেটিংস সংরক্ষিত হয়েছে!");
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-2.5 sm:p-3 mb-2.5 sm:mb-3.5 select-none relative group/stories">
      {/* Facebook Style Story Cards Reel with Desktop Chevrons */}
      <div className="relative">
        {/* Left Arrow Button for Desktop */}
        <button 
          type="button"
          onClick={() => scrollStories('left')}
          className="hidden md:flex absolute -left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:bg-white hover:text-black shadow-md border border-slate-200/90 items-center justify-center cursor-pointer transition-all hover:scale-105"
          title="পূর্ববর্তী"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Right Arrow Button for Desktop */}
        <button 
          type="button"
          onClick={() => scrollStories('right')}
          className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:bg-white hover:text-black shadow-md border border-slate-200/90 items-center justify-center cursor-pointer transition-all hover:scale-105"
          title="পরবর্তী"
        >
          <ChevronRight size={18} />
        </button>

        {/* Horizontal Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar snap-x scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* 1. Standard Facebook Style Create Story Card */}
          {(() => {
            const myAvatar = userProfile?.photoURL || (userProfile as any)?.photoUrl || (userProfile as any)?.avatarUrl || user?.photoURL || '';
            const myName = userProfile?.name || user?.displayName || 'M';
            return (
              <div 
                onClick={handleAddStoryClick}
                className="w-[100px] sm:w-[110px] h-[142px] sm:h-[160px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200 flex flex-col flex-shrink-0 group cursor-pointer hover:shadow-md transition-all duration-300 snap-start select-none relative"
              >
                {/* Top 70% - Profile Picture */}
                <div className="h-[70%] w-full bg-slate-100 overflow-hidden relative">
                  {myAvatar ? (
                    <img 
                      src={myAvatar}
                      alt="Me"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-3xl font-black">
                      {myName[0]}
                    </div>
                  )}
                  {/* Overlay for better blending */}
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>

                {/* Bottom 30% - Label area */}
                <div className="h-[30%] w-full bg-white flex flex-col items-center justify-end pb-2 relative">
                   {/* Floating Plus Button (Centered on the line) */}
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0B7A3B] flex items-center justify-center border-3 border-white shadow-sm group-hover:scale-110 transition-transform">
                      <Plus size={16} className="text-white" strokeWidth={3} />
                   </div>
                   <span className="text-slate-800 text-[10px] font-black tracking-tight">স্টোরি দিন</span>
                </div>
              </div>
            );
          })()}

          {/* 2. Loading State */}
          {loading ? (
            <div className="flex gap-2 sm:gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div 
                  key={n} 
                  className="w-[100px] sm:w-[110px] h-[142px] sm:h-[160px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200 flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            /* 3. Facebook Style Full Height Story Cards */
            groupedUserStories.map((group, groupIdx) => {
              const firstStory = group[0];
              const isMyOwn = firstStory.userId === user?.uid;
              const hasUnviewed = group.some(s => !user || !s.viewedBy?.includes(user.uid));

              return (
                <div 
                  key={firstStory.userId || groupIdx}
                  onClick={() => {
                    setActiveUserStoryIndex(groupIdx);
                    setActiveSegmentIndex(0);
                  }}
                  className="w-[100px] sm:w-[110px] h-[142px] sm:h-[160px] rounded-2xl overflow-hidden bg-slate-900 shadow-xs border border-slate-200/80 flex-shrink-0 group cursor-pointer hover:shadow-md transition-all duration-300 snap-start select-none relative"
                >
                  {/* Background Media */}
                  {firstStory.storyImage ? (
                    <img 
                      src={firstStory.storyImage}
                      alt={firstStory.userName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                    />
                  ) : (
                    <div 
                      className="w-full h-full p-2.5 flex items-center justify-center text-center font-bold text-xs bg-gradient-to-br from-[#006a4e] to-emerald-900 text-white"
                      style={firstStory.bgColor ? { background: firstStory.bgColor } : undefined}
                    >
                      <span className="line-clamp-4 text-[11px] leading-snug drop-shadow-xs">
                        {firstStory.textBio || firstStory.overlayText || 'আড্ডা স্টোরি'}
                      </span>
                    </div>
                  )}

                  {/* Facebook Top & Bottom Shadow Gradient for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

                  {/* Top-Left Avatar with Story Ring (Gradient Border) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <div className={`w-8.5 h-8.5 rounded-full p-0.5 ${
                      hasUnviewed ? 'bg-gradient-to-tr from-[#0B7A3B] to-[#10B981]' : 'bg-slate-400'
                    }`}>
                      <img 
                        src={firstStory.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstStory.userId}`} 
                        alt={firstStory.userName} 
                        className="w-full h-full rounded-full object-cover border-2 border-white bg-slate-100" 
                      />
                    </div>
                  </div>

                  {/* Top-Right Category Icon (White square with icon) */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <div className="w-6.5 h-6.5 bg-white/95 backdrop-blur-md rounded-lg flex items-center justify-center shadow-md border border-white/50 text-slate-700">
                      {firstStory.feeling === '🏛️' || firstStory.userName.includes('রাজবাড়ী') ? (
                        <svg className="w-3.5 h-3.5 text-[#A124B5]" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12 7V3L2 12H5V21H9V15H15V21H19V12H22L12 7M12 11.5C10.6 11.5 9.5 10.4 9.5 9C9.5 7.6 10.6 6.5 12 6.5C13.4 6.5 14.5 7.6 14.5 9C14.5 10.4 13.4 11.5 12 11.5Z" />
                        </svg>
                      ) : firstStory.feeling === '🌿' || firstStory.userName.includes('দিঘী') ? (
                        <svg className="w-3.5 h-3.5 text-[#0B7A3B]" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11,20 13.85,18.08 15,15C16.59,10.72 19.97,8.53 22,7C16.73,7 17,8 17,8Z" />
                        </svg>
                      ) : (
                        <span className="text-xs">{firstStory.feeling || '✨'}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom User Name (Facebook Style) */}
                  <div className="absolute bottom-2 sm:bottom-2.5 inset-x-2 sm:inset-x-2.5 z-10 pointer-events-none">
                    <span className="text-white text-[11px] sm:text-xs font-black leading-tight line-clamp-2 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] block">
                      {isMyOwn ? 'আপনার স্টোরি' : firstStory.userName}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FULLSCREEN STORY VIEWER MODAL */}
      <AnimatePresence>
        {activeStory && activeUserGroup && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm h-screen sm:h-[88vh] sm:max-h-[720px] bg-black rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border-0 sm:border border-white/10"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Segmented Top Progress Bar */}
              <div className="absolute top-3 left-3 right-3 z-40 flex gap-1.5">
                {activeUserGroup.map((seg, idx) => (
                  <div key={seg.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all ease-linear"
                      style={{ 
                        width: idx < activeSegmentIndex ? '100%' : idx === activeSegmentIndex ? `${progress}%` : '0%' 
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Viewer Header */}
              <div className="absolute top-6 left-3 right-3 z-40 flex items-center justify-between text-white bg-gradient-to-b from-black/80 via-black/40 to-transparent p-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={activeStory.userAvatar} 
                    alt={activeStory.userName} 
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1 leading-tight">
                      {activeStory.userName}
                      {activeStory.feeling && <span className="text-xs">{activeStory.feeling}</span>}
                    </h4>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-white/80 mt-0.5">
                      <span>{new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {activeStory.location && (
                        <span className="text-emerald-300 flex items-center gap-0.5">
                          <MapPin size={8} /> {activeStory.location}
                        </span>
                      )}
                      {activeStory.mentionName && (
                        <span className="text-blue-300 flex items-center gap-0.5">
                          <Tag size={8} /> @{activeStory.mentionName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Music Mute Toggle */}
                  {activeStory.musicTrack && (
                    <button 
                      type="button"
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer border-0"
                      title={isAudioMuted ? "শব্দ চালু করুন" : "শব্দ বন্ধ করুন"}
                    >
                      {isAudioMuted ? <VolumeX size={12} className="text-rose-400" /> : <Volume2 size={12} className="text-emerald-400" />}
                    </button>
                  )}

                  {/* Options Menu Button */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                      className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer border-0"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {/* Options Dropdown Menu */}
                    {isOptionsMenuOpen && (
                      <div className="absolute right-0 top-8 z-50 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 text-xs font-bold text-white space-y-1">
                        {activeStory.userId === user?.uid ? (
                          <>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setIsHighlightModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 cursor-pointer border-0 text-amber-300"
                            >
                              ⭐ Add to Highlights
                            </button>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setIsArchiveOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 cursor-pointer border-0 text-slate-200"
                            >
                              <Clock size={13} className="text-emerald-400" /> স্টোরি আর্কাইভ ({archivedStories.length})
                            </button>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setIsSettingsOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 cursor-pointer border-0 text-slate-200"
                            >
                              <Settings size={13} className="text-blue-400" /> স্টোরি সেটিংস
                            </button>
                            <button 
                              onClick={() => handleDeleteStory(activeStory.id)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 cursor-pointer border-0"
                            >
                              <Trash2 size={13} /> Delete Story
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setIsSettingsOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 cursor-pointer border-0 text-slate-200"
                            >
                              <Settings size={13} className="text-blue-400" /> স্টোরি সেটিংস
                            </button>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                handleMuteUser(activeStory.userId, activeStory.userName);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 cursor-pointer border-0 text-slate-300"
                            >
                              <UserX size={13} /> Mute {activeStory.userName}
                            </button>
                            <button 
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setIsReportModalOpen(true);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 cursor-pointer border-0"
                            >
                              <ShieldAlert size={13} /> Report Story
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Close Viewer */}
                  <button 
                    type="button"
                    onClick={() => setActiveUserStoryIndex(null)}
                    className="w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer border-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Story Display Media Body */}
              <div className="relative flex-1 w-full h-full flex items-center justify-center bg-neutral-950 overflow-hidden">
                {activeStory.type === 'image' && activeStory.storyImage && (
                  <div 
                    className="w-full h-full flex items-center justify-center transition-transform"
                    style={{ transform: `rotate(${activeStory.rotation || 0}deg)` }}
                  >
                    <img 
                      src={activeStory.storyImage} 
                      alt="Story" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {activeStory.type === 'video' && activeStory.storyVideo && (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <video 
                      src={activeStory.storyVideo} 
                      autoPlay 
                      loop 
                      muted={isAudioMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {activeStory.type === 'text' && (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center text-white font-extrabold leading-relaxed ${activeStory.fontSize || 'text-xl'} ${activeStory.bgColor || PRESET_BG_COLORS[0]} ${activeStory.textColor || 'text-white'}`}>
                    <p className="max-w-xs">{activeStory.textBio}</p>
                  </div>
                )}

                {/* Overlaid Sticker / Floating Text */}
                {activeStory.overlayText && (
                  <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20 text-xs font-black shadow-xl max-w-[85%] text-center">
                    {activeStory.overlayText}
                  </div>
                )}

                {activeStory.sticker && (
                  <div className="absolute top-1/3 right-6 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-2xl shadow-xl border border-white/20 animate-bounce">
                    {activeStory.sticker}
                  </div>
                )}

                {/* Audio Track Badge */}
                {activeStory.musicTrack && (
                  <div className="absolute bottom-20 left-4 bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black text-emerald-300 flex items-center gap-1.5 shadow-lg">
                    <Music size={10} className="animate-spin" />
                    <span>{activeStory.musicTrack.title}</span>
                  </div>
                )}

                {/* Floating Reactions Canvas */}
                {floatingEmojis.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 1, y: 150, scale: 0.8 }}
                    animate={{ opacity: 0, y: -200, scale: 1.8 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute text-4xl pointer-events-none z-50"
                    style={{ left: `${e.x}%` }}
                  >
                    {e.emoji}
                  </motion.div>
                ))}

                {/* Left / Right Click Zones for Segment Nav */}
                <button 
                  type="button"
                  onClick={handlePrevStory}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 z-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <button 
                  type="button"
                  onClick={handleNextStory}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer border-0 z-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Story Viewer Footer */}
              <div className="p-3.5 bg-gradient-to-t from-black via-black/80 to-transparent z-40 space-y-2.5 shrink-0">
                {/* Floating Reaction Bar */}
                <div className="flex items-center justify-around text-xl px-1">
                  {['❤️', '👍', '😂', '😮', '😢', '😡'].map((emoji) => (
                    <button 
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="hover:scale-130 active:scale-90 transition-transform cursor-pointer border-0 bg-transparent p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Bottom Bar: Owner Viewers or Viewer Reply Box */}
                {activeStory.userId === user?.uid ? (
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-white">
                    <button 
                      onClick={() => setIsViewersListOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-black hover:text-emerald-300 cursor-pointer border-0 bg-transparent"
                    >
                      <Eye size={14} className="text-emerald-400" />
                      <span>Viewed by {activeStory.viewsCount || activeStory.viewedBy?.length || 1}</span>
                    </button>
                    <span className="text-[10px] text-white/60 font-semibold">আপনার নিজের গল্প</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendStoryReply} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={`${activeStory.userName}-কে বার্তা পাঠান...`}
                      value={storyMessage}
                      onChange={(e) => setStoryMessage(e.target.value)}
                      className="flex-1 bg-white/10 backdrop-blur-md text-white placeholder-white/60 text-xs px-4 py-2 rounded-full outline-none focus:ring-1 focus:ring-emerald-500 border border-white/15"
                    />
                    <button 
                      type="submit"
                      className="bg-[#006a4e] text-white p-2 rounded-full hover:bg-emerald-700 cursor-pointer border-0 shadow-md shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEWERS LIST MODAL */}
      <AnimatePresence>
        {isViewersListOpen && activeStory && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Eye size={16} className="text-emerald-400" />
                  স্টোরি দর্শকবৃন্দ (Viewer List)
                </h3>
                <button 
                  onClick={() => setIsViewersListOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 border-0 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {activeStory.viewersList && activeStory.viewersList.length > 0 ? (
                  activeStory.viewersList.map((viewer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={viewer.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewer.userId}`} 
                          alt={viewer.userName}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{viewer.userName}</p>
                          <p className="text-[9px] text-white/50">{new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">এখনো কেউ এই স্টোরিটি দেখেননি।</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE STORY MODAL (Facebook New Story Screen) */}
      <AnimatePresence>
        {isAddStoryOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[92vh]"
            >
              {storyStep === 'picker' ? (
                /* STEP 1: Facebook New Story Screen (Matching Screenshot) */
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Top Header */}
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setIsAddStoryOpen(false)}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="font-bold text-slate-900 text-lg">New story</h3>
                    <button 
                      type="button" 
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer"
                    >
                      <Settings size={20} />
                    </button>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto">
                    {/* Top 3 Action Cards Row (Text, Music, Camera) */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Card 1: Text */}
                      <button
                        type="button"
                        onClick={() => {
                          setStoryType('text');
                          setStoryStep('editor');
                        }}
                        className="border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:bg-slate-50 transition cursor-pointer h-28 bg-white group active:scale-95"
                      >
                        <span className="text-2xl font-black font-serif text-slate-800 mb-1.5 group-hover:scale-110 transition">Aa</span>
                        <span className="font-bold text-xs text-slate-900">Text</span>
                      </button>

                      {/* Card 2: Music */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMusicLibraryOpen(true);
                          setStoryType('text');
                          setStoryStep('editor');
                        }}
                        className="border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:bg-slate-50 transition cursor-pointer h-28 bg-white group active:scale-95"
                      >
                        <Music size={26} className="text-slate-800 mb-1.5 group-hover:scale-110 transition" />
                        <span className="font-bold text-xs text-slate-900">Music</span>
                      </button>

                      {/* Card 3: Camera */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:bg-slate-50 transition cursor-pointer h-28 bg-white group active:scale-95"
                      >
                        <Camera size={26} className="text-slate-800 mb-1.5 group-hover:scale-110 transition" />
                        <span className="font-bold text-xs text-slate-900">Camera</span>
                      </button>
                    </div>

                    {/* Gallery Filter Sub-Header */}
                    <div className="flex items-center justify-between pt-1">
                      <button 
                        type="button"
                        className="font-bold text-sm text-slate-900 flex items-center gap-1 cursor-pointer hover:opacity-80"
                      >
                        <span>Camera</span>
                        <ChevronDown size={16} />
                      </button>

                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#e4e6eb] hover:bg-slate-300 font-bold text-xs text-[#050505] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                      >
                        <CheckSquare size={14} />
                        <span>Select multiple</span>
                      </button>
                    </div>

                    {/* Hidden Camera & File Inputs */}
                    <input 
                      ref={cameraInputRef}
                      type="file" 
                      accept="image/*,video/*" 
                      capture="environment"
                      onChange={(e) => {
                        handleFileChange(e, 'image');
                        setStoryStep('editor');
                      }}
                      className="hidden"
                    />
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={(e) => {
                        handleFileChange(e, 'image');
                        setStoryStep('editor');
                      }}
                      className="hidden"
                    />

                    {/* 3-Column Photo Gallery Grid */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-1.5 pt-1">
                      {/* Tile 1: Custom Upload button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[3/4] rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-600 transition cursor-pointer"
                      >
                        <Upload size={20} />
                        <span className="text-[10px] font-bold">Upload</span>
                      </button>

                      {/* Sample Gallery Photo Tiles */}
                      {GALLERY_SAMPLES.map((sample) => (
                        <div 
                          key={sample.id}
                          onClick={() => {
                            setNewStoryImageUrl(sample.url);
                            setStoryType('image');
                            setStoryStep('editor');
                          }}
                          className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-slate-200/80 shadow-2xs hover:opacity-90 transition active:scale-95 bg-slate-100"
                        >
                          <img 
                            src={sample.url} 
                            alt={sample.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: Story Customize & Share Screen */
                <form onSubmit={handleCreateStorySubmit} className="p-4 space-y-4 overflow-y-auto max-h-[85vh]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStoryStep('picker')}
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to gallery</span>
                    </button>
                    <span className="font-bold text-sm text-slate-800">Customize story</span>
                    <button 
                      type="button"
                      onClick={() => setIsAddStoryOpen(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Story Preview Canvas */}
                  <div className={`relative aspect-[9/16] max-h-[340px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center mx-auto w-full max-w-xs ${storyType === 'text' ? selectedBgColor : 'bg-slate-900'}`}>
                    {storyType === 'image' && newStoryImageUrl && (
                      <img 
                        src={newStoryImageUrl} 
                        alt="Story preview" 
                        className="w-full h-full object-cover"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                    )}
                    {storyType === 'text' && (
                      <p className={`p-6 text-center font-bold ${selectedTextColor} ${fontSize} leading-relaxed`}>
                        {newStoryText || 'আজকের গল্প এখানে আসবে...'}
                      </p>
                    )}
                    {newStoryLocation && (
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                        <MapPin size={10} className="text-red-400" />
                        <span>{newStoryLocation}</span>
                      </div>
                    )}
                    {selectedMusicAttachment && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <Music size={10} className="animate-spin" />
                        <span className="truncate max-w-[140px]">{selectedMusicAttachment.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Customization Controls */}
                  <div className="space-y-3 pt-1">
                    {/* Caption / Text Input if Image */}
                    {storyType === 'image' && (
                      <div>
                        <input
                          type="text"
                          placeholder="Add a caption..."
                          value={overlayText}
                          onChange={(e) => setOverlayText(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </div>
                    )}

                    {/* Text input if text story */}
                    {storyType === 'text' && (
                      <div>
                        <textarea
                          rows={2}
                          placeholder="Write your story thoughts..."
                          value={newStoryText}
                          onChange={(e) => setNewStoryText(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                        <div className="flex gap-2 mt-2">
                          {PRESET_BG_COLORS.map((bg, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setSelectedBgColor(bg)}
                              className={`w-7 h-7 rounded-lg cursor-pointer transition-transform ${bg} ${
                                selectedBgColor === bg ? 'ring-2 ring-offset-2 ring-blue-600 scale-105' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location & Music Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMusicLibraryOpen(true)}
                        className="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Music size={14} className="text-emerald-600" />
                        <span className="truncate">{selectedMusicAttachment ? selectedMusicAttachment.title : 'Add music'}</span>
                      </button>

                      <input 
                        type="text"
                        placeholder="📍 Location"
                        value={newStoryLocation}
                        onChange={(e) => setNewStoryLocation(e.target.value)}
                        className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                      />
                    </div>

                    {/* Privacy Option */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Lock size={12} /> Privacy:
                      </span>
                      <select
                        value={privacyOption}
                        onChange={(e) => setPrivacyOption(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none"
                      >
                        <option value="public">🌎 Public</option>
                        <option value="friends">👥 Friends</option>
                        <option value="followers">👥 Followers</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Share to Story Button (Matching Facebook) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      <span>Share to story</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIGHLIGHT MODAL */}
      <AnimatePresence>
        {isHighlightModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                  ⭐ Add to Profile Highlights
                </h3>
                <button onClick={() => setIsHighlightModalOpen(false)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border-0 cursor-pointer">
                  <X size={12} />
                </button>
              </div>

              <form onSubmit={handleAddToHighlightSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">হাইলাইট শিরোনাম:</label>
                  <input 
                    type="text" 
                    placeholder="যেমন: Puthia Memories" 
                    value={highlightTitle}
                    onChange={(e) => setHighlightTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                  <select 
                    value={highlightCategory}
                    onChange={(e) => setHighlightCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    {HIGHLIGHT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 rounded-xl bg-[#006a4e] text-white text-xs font-black cursor-pointer border-0 shadow-md"
                >
                  Save Highlight
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-rose-700 text-xs flex items-center gap-1.5">
                  <ShieldAlert size={14} /> Report Story
                </h3>
                <button onClick={() => setIsReportModalOpen(false)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border-0 cursor-pointer">
                  <X size={12} />
                </button>
              </div>

              <form onSubmit={handleReportStorySubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">রিপোর্টের কারণ নির্বাচন করুন:</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    <option value="Spam">Spam</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Offensive Content">Offensive Content</option>
                    <option value="Scam">Scam</option>
                    <option value="False Information">False Information</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বিস্তারিত (ঐচ্ছিক):</label>
                  <textarea 
                    rows={2}
                    placeholder="কেন এই স্টোরিটি অসংগতিপূর্ণ মনে করছেন..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer border-0 shadow-md"
                >
                  Submit Report
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STORY SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                  ⚙️ Story Settings
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border-0 cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-black text-slate-700 mb-1">ডিফল্ট প্রাইভেসি (Who can see my story):</label>
                  <select 
                    value={userSettings.defaultPrivacy}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, defaultPrivacy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    <option value="public">🌎 Public (সকলের জন্য)</option>
                    <option value="friends">👥 Friends (শুধু বন্ধু)</option>
                    <option value="followers">👥 Followers (অনুসারী)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">কারা রিপ্লাই দিতে পারবে (Who can reply):</label>
                  <select 
                    value={userSettings.allowReplies}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, allowReplies: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    <option value="everyone">সবাই (Everyone)</option>
                    <option value="friends">শুধু বন্ধুরা (Friends only)</option>
                    <option value="no_one">কেউ না (No one)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-black text-slate-800">Story Auto-Archive</p>
                    <p className="text-[10px] text-slate-500">২৪ ঘণ্টা পর স্টোরি স্বয়ংক্রিয়ভাবে আর্কাভে সংরক্ষিত হবে</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={userSettings.autoArchiveEnabled}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, autoArchiveEnabled: e.target.checked }))}
                    className="w-4 h-4 accent-[#006a4e] cursor-pointer"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 rounded-xl bg-[#006a4e] text-white font-black cursor-pointer border-0 shadow-md"
                >
                  Save Settings
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STORY ARCHIVE MODAL */}
      <AnimatePresence>
        {isArchiveOpen && (
          <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 text-white rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  আপনার Story Archive (শুধু আপনার জন্য দৃশ্যমান)
                </h3>
                <button onClick={() => setIsArchiveOpen(false)} className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center border-0 cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto grid grid-cols-3 gap-2.5 pr-1">
                {archivedStories.length > 0 ? (
                  archivedStories.map((s) => (
                    <div key={s.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
                      <img 
                        src={s.storyImage || s.userAvatar} 
                        alt="archive" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 p-1.5 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-white/80">{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center text-xs text-slate-400">
                    কোনো আর্কাইভ করা পুরনো স্টোরি পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTH MODAL FALLBACK */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* MUSIC LIBRARY MODAL */}
      {isMusicLibraryOpen && (
        <MusicLibraryModal
          isOpen={isMusicLibraryOpen}
          onClose={() => setIsMusicLibraryOpen(false)}
          onSelectMusic={(attachment) => {
            setSelectedMusicAttachment(attachment);
            setSelectedMusicId(attachment.trackId);
          }}
          currentAttachment={selectedMusicAttachment}
          userId={user?.uid}
          isAdmin={userProfile?.role === 'admin' || userProfile?.role === 'super_admin'}
          onOpenAdminManager={() => {
            setIsMusicLibraryOpen(false);
            setIsAdminMusicManagerOpen(true);
          }}
          targetType="story"
        />
      )}

      {/* ADMIN MUSIC MANAGER MODAL */}
      {isAdminMusicManagerOpen && (
        <AdminMusicManagerModal
          isOpen={isAdminMusicManagerOpen}
          onClose={() => setIsAdminMusicManagerOpen(false)}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}

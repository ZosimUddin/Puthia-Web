import React, { useState, useEffect, useMemo } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Newspaper, Calendar, Clock, X, Edit, Trash2, Plus, Sparkles, ChevronRight, 
  Image as ImageIcon, GraduationCap, Trophy, ShieldAlert, TrendingUp, Users, 
  Palette, Globe, Eye, Bookmark, Search, Share2, Megaphone, Send, CheckCircle2, ArrowLeft,
  Facebook, MessageCircle, MoreHorizontal, Link, ThumbsUp, Heart, MessageSquare,
  AlertCircle, RefreshCw, Filter, Check, Tag, MapPin, UserCheck, Mic, MicOff, ChevronDown, Edit3, RotateCcw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from "../../firebase";
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import toast from 'react-hot-toast';
import {
  NewsItem,
  NewsComment,
  onNewsSnapshot,
  onSingleNewsSnapshot,
  onNewsCommentsSnapshot,
  addNewsComment,
  deleteNewsComment,
  toggleNewsLike,
  incrementNewsView,
  createNews,
  updateNews,
  deleteNews,
  submitCitizenReport,
  DEFAULT_NEWS_SEED
} from '../../services/newsService';

const toBengaliNumber = (num: number | string): string => {
  const englishToBengaliMap: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/[0-9]/g, (digit) => englishToBengaliMap[digit] || digit);
};

const PUTHIA_UNIONS_LIST = [
  { id: 'all', label: 'সকল এলাকা' },
  { id: 'পুঠিয়া সদর', label: '🏡 পুঠিয়া সদর' },
  { id: 'বেলপুকুরিয়া', label: '🏡 বেলপুকুরিয়া' },
  { id: 'বানেশ্বর', label: '🏡 বানেশ্বর' },
  { id: 'ভালুকগাছি', label: '🏡 ভালুকগাছি' },
  { id: 'জিউপাড়া', label: '🏡 জিউপাড়া' },
  { id: 'শিলমাড়িয়া', label: '🏡 শিলমাড়িয়া' },
  { id: 'রাজশাহী সিটি', label: '🏙️ রাজশাহী সিটি করপোরেশন' },
];

const CATEGORY_MAP = [
  { id: 'all', label: 'সব সংবাদ', icon: Newspaper },
  { id: 'রাজনীতি', label: 'রাজনীতি', icon: Globe },
  { id: 'শিক্ষা', label: 'শিক্ষা', icon: GraduationCap },
  { id: 'খেলা', label: 'খেলা', icon: Trophy },
  { id: 'অপরাধ', label: 'অপরাধ', icon: ShieldAlert },
  { id: 'উন্নয়ন', label: 'উন্নয়ন', icon: TrendingUp },
  { id: 'সামাজিক', label: 'সামাজিক', icon: Users },
  { id: 'সংস্কৃতি', label: 'সংস্কৃতি', icon: Palette },
];

const News: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  // Real-time news state
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedUnion, setSelectedUnion] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // Active Reading News Modal
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Real-time Comments for currently selected news
  const [liveComments, setLiveComments] = useState<NewsComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Likes & Bookmarks
  const [isLikedLocally, setIsLikedLocally] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('news_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Citizen Journalist Report Modal State
  const [showSendReportModal, setShowSendReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterLocation, setReporterLocation] = useState('');
  const [reporterContent, setReporterContent] = useState('');
  const [reporterImage, setReporterImage] = useState('');

  // Admin News Form Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("উন্নয়ন");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formAuthorName, setFormAuthorName] = useState("");
  const [formReporterLocation, setFormReporterLocation] = useState("পুঠিয়া, রাজশাহী");
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSetter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে সঠিক ছবি নির্বাচন করুন (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ছবি সর্বোচ্চ ১০ মেগাবাইট হতে পারবে");
      return;
    }

    setImageUploading(true);
    const toastId = toast.loading("ছবি আপলোড ও প্রসেস করা হচ্ছে...");

    try {
      const { uploadPostMedia } = await import('../../services/firebaseStorageService');
      const res = await uploadPostMedia(user?.uid || 'guest_news_reporter', file);
      if (res && res.downloadUrl) {
        targetSetter(res.downloadUrl);
        toast.success("ছবি সফলভাবে আপলোড হয়েছে!", { id: toastId });
        setImageUploading(false);
        return;
      }
    } catch (err) {
      console.warn("Firebase Storage upload fallback to client-side compression:", err);
    }

    // Client-side image compression & reader fallback
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
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
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL("image/jpeg", 0.82);
            targetSetter(compressedUrl);
            toast.success("ছবি সফলভাবে যুক্ত করা হয়েছে!", { id: toastId });
          } else {
            targetSetter(event.target?.result as string);
            toast.success("ছবি যুক্ত করা হয়েছে!", { id: toastId });
          }
          setImageUploading(false);
        };
        img.onerror = () => {
          targetSetter(event.target?.result as string);
          toast.success("ছবি যুক্ত করা হয়েছে!", { id: toastId });
          setImageUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      toast.error("ছবি প্রসেস করতে সমস্যা হয়েছে", { id: toastId });
      setImageUploading(false);
    }
  };

  // Share Modal
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("এইমাত্র");

  const isStaff = user?.email === 'mdzosimuddin31@gmail.com' || 
                  userProfile?.role === 'admin' || 
                  userProfile?.role === 'super_admin' || 
                  userProfile?.role === 'staff' ||
                  userProfile?.role === 'editor';

  // 1. Subscribe to Real-time News stream (Firebase Live Listener)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onNewsSnapshot((items) => {
      setNewsList(items);
      setLoading(false);
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Single News & Comments listener when modal is open
  useEffect(() => {
    if (!selectedNews) {
      setLiveComments([]);
      return;
    }

    // Increment view safely
    incrementNewsView(selectedNews.id);

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Initial like state
    const userUid = user?.uid || 'guest';
    const liked = selectedNews.likes?.includes(userUid) || false;
    setIsLikedLocally(liked);
    setCurrentLikesCount(selectedNews.likesCount || 0);

    // Live subscription for updates to the selected news document itself
    const unsubscribeSingle = onSingleNewsSnapshot(selectedNews.id, (liveItem) => {
      if (liveItem) {
        setSelectedNews(liveItem);
        setCurrentLikesCount(liveItem.likesCount || 0);
        setIsLikedLocally(liveItem.likes?.includes(userUid) || false);
      }
    });

    // Subscribe to live comments
    const unsubscribeComments = onNewsCommentsSnapshot(selectedNews.id, (comments) => {
      setLiveComments(comments);
    });

    return () => {
      document.body.style.overflow = '';
      unsubscribeSingle();
      unsubscribeComments();
    };
  }, [selectedNews?.id, user?.uid]);

  // Lock body scroll whenever any fullscreen modal is open
  useEffect(() => {
    if (Boolean(selectedNews) || showAdminModal || showSendReportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [Boolean(selectedNews), showAdminModal, showSendReportModal]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRefreshing(false);
      toast.success("তাজা সংবাদ লাইভ সিঙ্ক সম্পন্ন হয়েছে!", { icon: "⚡" });
    }, 500);
  };

  // Handle Like Toggle
  const handleToggleLike = async (newsItem: NewsItem) => {
    const userUid = user?.uid || (localStorage.getItem('anonymous_uid') || (() => {
      const newId = 'anon_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('anonymous_uid', newId);
      return newId;
    })());

    // Optimistic UI update
    const willBeLiked = !isLikedLocally;
    setIsLikedLocally(willBeLiked);
    setCurrentLikesCount(prev => willBeLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await toggleNewsLike(newsItem.id, userUid);
      setCurrentLikesCount(res.likesCount);
      setIsLikedLocally(res.liked);
      if (res.liked) {
        toast.success("পছন্দ করেছেন!", { icon: "❤️" });
      }
    } catch (err) {
      console.error("Like toggle error:", err);
      // Revert optimistic
      setIsLikedLocally(!willBeLiked);
      setCurrentLikesCount(prev => willBeLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews || !commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addNewsComment(
        selectedNews.id,
        commentInput.trim(),
        {
          uid: user?.uid || 'anon_' + Math.random().toString(36).substring(2, 8),
          name: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || "পুঠিয়ার নাগরিক",
          email: user?.email || "",
          photoURL: user?.photoURL || ""
        }
      );
      setCommentInput("");
      toast.success("আপনার মন্তব্য প্রকাশিত হয়েছে!");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("মন্তব্য যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedNews) return;
    if (!window.confirm("আপনি কি নিশ্চিত যে এই মন্তব্যটি মুছে ফেলতে চান?")) return;

    try {
      await deleteNewsComment(selectedNews.id, commentId);
      toast.success("মন্তব্য মুছে ফেলা হয়েছে");
    } catch (err) {
      toast.error("মন্তব্য মোছা যায়নি");
    }
  };

  // Bookmark Toggle
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      try {
        localStorage.setItem('news_bookmarks', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      toast.success(next.includes(id) ? "সংবাদটি বুকমার্কে সংরক্ষিত হয়েছে" : "বুকমার্ক থেকে সরানো হয়েছে", {
        icon: "🔖"
      });
      return next;
    });
  };

  // Citizen Report Submit
  const handleSendReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterPhone.trim() || !reporterContent.trim()) {
      toast.error("সবগুলো তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setReportSubmitting(true);
    try {
      await submitCitizenReport({
        reporterName,
        reporterPhone,
        reporterLocation: reporterLocation || "পুঠিয়া",
        reporterContent,
        imageUrl: reporterImage
      }, user ? { uid: user.uid, email: user.email || "" } : undefined);

      setReportSuccess(true);
      toast.success("আপনার সংবাদ সফলভাবে পাঠানো হয়েছে! যাচাই শেষে প্রকাশিত হবে।");
      setTimeout(() => {
        setReportSuccess(false);
        setShowSendReportModal(false);
        setReporterName('');
        setReporterPhone('');
        setReporterLocation('');
        setReporterContent('');
        setReporterImage('');
      }, 2000);
    } catch (err) {
      console.error("Report submit error:", err);
      toast.error("সংবাদ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setReportSubmitting(false);
    }
  };

  // Admin & Citizen News Submit (Create / Edit)
  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("শিরোনাম ও বিস্তারিত কন্টেন্ট দেওয়া আবশ্যক");
      return;
    }

    setAdminSubmitting(true);
    try {
      const isDirectPublish = Boolean(isStaff);
      const now = new Date();
      const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
      const autoDate = `${now.getDate().toLocaleString('bn-BD')} ${bnMonths[now.getMonth()]} ${now.getFullYear().toLocaleString('bn-BD').replace(/,/g, '')}`;
      const autoTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });

      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        date: formDate || autoDate,
        time: formTime || autoTime,
        content: formContent.trim(),
        summary: formContent.trim().slice(0, 140),
        image: formImage.trim() || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800",
        featured: isDirectPublish ? formFeatured : false,
        authorName: formAuthorName.trim() || userProfile?.name || user?.displayName || (isDirectPublish ? "আমাদের পুঠিয়া প্রতিনিধি" : "নাগরিক সাংবাদিক"),
        reporterLocation: formReporterLocation.trim() || "পুঠিয়া, রাজশাহী",
        status: isDirectPublish ? ("published" as const) : ("pending" as const),
        verified: isDirectPublish
      };

      if (editingId && isDirectPublish) {
        await updateNews(editingId, payload, { uid: user?.uid || "admin", email: user?.email || "", name: userProfile?.name });
        toast.success("সংবাদ সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await createNews(payload, { uid: user?.uid || "citizen", email: user?.email || "", name: userProfile?.name });
        if (isDirectPublish) {
          toast.success("নতুন সংবাদ রিয়েল-টাইমে প্রকাশিত হয়েছে!");
        } else {
          toast.success("আপনার সংবাদ সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর এটি মূল ফিডে প্রকাশিত হবে।", {
            duration: 4000,
            icon: "🎉"
          });
        }
      }

      setShowAdminModal(false);
      setEditingId(null);
      resetAdminForm();
    } catch (err) {
      console.error("Error saving news:", err);
      toast.error("সংবাদ সংরক্ষণ করা যায়নি");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const resetAdminForm = () => {
    setFormTitle("");
    setFormCategory("উন্নয়ন");
    const now = new Date();
    const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const bnDate = `${now.getDate().toLocaleString('bn-BD')} ${bnMonths[now.getMonth()]} ${now.getFullYear().toLocaleString('bn-BD').replace(/,/g, '')}`;
    const bnTime = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
    setFormDate(bnDate);
    setFormTime(bnTime);
    setFormContent("");
    setFormImage("");
    setFormFeatured(false);
    setFormAuthorName(userProfile?.name || user?.displayName || (isStaff ? "আমাদের পুঠিয়া প্রতিনিধি" : "নাগরিক সাংবাদিক"));
    setFormReporterLocation("পুঠিয়া, রাজশাহী");
    setEditingId(null);
  };

  const handleOpenEdit = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDate(item.date);
    setFormTime(item.time);
    setFormContent(item.content);
    setFormImage(item.image || "");
    setFormFeatured(Boolean(item.featured));
    setFormAuthorName(item.authorName || "");
    setFormReporterLocation(item.reporterLocation || "পুঠিয়া, রাজশাহী");
    setShowAdminModal(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিত যে এই সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;

    try {
      await deleteNews(id, { uid: user?.uid || "admin", email: user?.email || "" });
      toast.success("সংবাদ মুছে ফেলা হয়েছে");
      if (selectedNews?.id === id) {
        setSelectedNews(null);
      }
    } catch (err) {
      toast.error("সংবাদ মোছা সম্ভব হয়নি");
    }
  };

  // Share handlers
  const handleNativeShare = async (item: NewsItem) => {
    const shareUrl = window.location.origin + `/news?id=${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary || item.title,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      copyToClipboard(shareUrl);
      toast.success("সংবাদের লিঙ্ক কপি করা হয়েছে!");
    }
  };

  // 🎙️ Voice Search Implementation (Bengali Language Support)
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('আপনার ব্রাউজারে বাংলা ভয়েস ইনপুট সাপোর্ট করছে না। অনুগ্রহ করে লিখে খুঁজুন।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast('🎙️ স্পষ্ট করে কথা বলুন...', { icon: '🎤' });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        toast.success(`ভয়েস পেয়েছি: "${transcript}"`);
        setSearchTerm(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        toast.error('ভয়েস সনাক্ত করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Voice search failed:', err);
      setIsListening(false);
    }
  };

  // Filtered & Searched News
  const filteredItems = useMemo(() => {
    let list = newsList.filter(item => {
      const matchCategory = activeFilter === 'all' 
        ? true 
        : (activeFilter === 'খেলা' ? (item.category === 'খেলা' || item.category === 'খেলাধুলা') : item.category === activeFilter);
      
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        (item.authorName && item.authorName.toLowerCase().includes(query)) ||
        (item.reporterLocation && item.reporterLocation.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(query)));

      const matchUnion = selectedUnion === 'all' ||
        (item.reporterLocation && item.reporterLocation.toLowerCase().includes(selectedUnion.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(selectedUnion.toLowerCase())) ||
        (item.content && item.content.toLowerCase().includes(selectedUnion.toLowerCase()));

      return matchCategory && matchSearch && matchUnion;
    });

    if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [newsList, activeFilter, searchTerm, selectedUnion, sortBy]);

  const featuredNews = newsList.filter(item => item.featured || item.category === 'উন্নয়ন').slice(0, 5);
  const popularNews = [...newsList].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  // Dynamic Category Counts
  const categoryCounts = newsList.reduce((acc, curr) => {
    const cat = curr.category || 'অন্যান্য';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 md:pb-12 flex flex-col justify-between font-sans">
      <Header />

      <main className="flex-1 pb-6">
        
        {/* Banner Section - Brand Green Theme (Matching Doctors / Master Service Design) */}
        <div className="bg-[#006a4e] text-white pt-4 pb-10 px-4 sm:px-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-3 relative z-10">
            {/* Navigation & Action Row inside Banner */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                  title="রিয়েল-টাইম রিফ্রেশ করুন"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSendReportModal(true)}
                  className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95"
                  title="সংবাদ পাঠান / নাগরিক সাংবাদিকতা"
                >
                  <Edit3 size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAdminForm();
                    setShowAdminModal(true);
                  }}
                  className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#006a4e] border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-sm"
                  title="নতুন সংবাদ লিখুন"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>স্থানীয় সংবাদ</span>
                </h1>
                
                {/* Dynamic Item Count Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#00543e]/90 text-emerald-100 border border-emerald-300/30 shadow-2xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>
                    {toBengaliNumber(filteredItems.length)} টি
                  </span>
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-xl text-emerald-100 font-medium max-w-2xl leading-relaxed mt-1">
                পুঠিয়া উপজেলার সকল সংবাদ ও খবরাখবর একনজরে খুঁজুন ও পড়ুন
              </p>
            </div>
          </div>
        </div>

        {/* Floating Controls and Feed Layout */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 -mt-5 relative z-20 space-y-3.5 pb-8">
          
          {/* SECTION 1: Search & Filter & Location Bar */}
          <div className="flex items-center gap-2">
            {/* Main Text Input with Embedded Voice Mic 🎙️ */}
            <div className="flex-1 h-12 bg-white rounded-2xl shadow-sm border border-slate-200/90 flex items-center px-3.5 gap-2 transition-all focus-within:ring-2 focus-within:ring-[#006a4e] focus-within:border-[#006a4e]">
              <Search size={18} className="text-slate-400 shrink-0" />
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="সংবাদের শিরোনাম বা বিষয় লিখে খুঁজুন..."
                className="w-full text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer shrink-0 p-0.5"
                  title="মুছে ফেলুন"
                >
                  <X size={16} />
                </button>
              )}

              {/* 🎙️ Voice Search Mic Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`w-8 h-8 rounded-xl border-none cursor-pointer shrink-0 transition-all flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md ring-4 ring-red-200'
                    : 'bg-emerald-50 text-[#006a4e] hover:bg-emerald-100'
                }`}
                title="🎙️ ভয়েস সার্চ (বাংলায় বলুন)"
              >
                {isListening ? (
                  <MicOff size={15} className="animate-spin" />
                ) : (
                  <Mic size={15} className="stroke-[2.5]" />
                )}
              </button>
            </div>

            {/* 📍 Filter Modal Trigger Button */}
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className={`h-12 rounded-2xl shadow-sm border px-3.5 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer shrink-0 transition-all active:scale-95 ${
                sortBy !== 'newest' || activeFilter !== 'all'
                  ? 'bg-[#006a4e] text-white border-[#006a4e]'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
              }`}
              title="ফিল্টার অপশন"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">ফিল্টার</span>
              {(sortBy !== 'newest' || activeFilter !== 'all') && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                  {(sortBy !== 'newest' ? 1 : 0) + (activeFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* 📍 Location Dropdown Button */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className={`h-12 rounded-2xl shadow-sm border px-3.5 flex items-center justify-center gap-1.5 text-xs font-black cursor-pointer shrink-0 transition-all active:scale-95 ${
                selectedUnion !== 'all'
                  ? 'bg-[#006a4e] text-white border-[#006a4e]'
                  : 'bg-white text-[#006a4e] border-slate-200/90 hover:bg-emerald-50/60'
              }`}
              title="এলাকা পরিবর্তন করুন"
            >
              <MapPin size={15} className={selectedUnion !== 'all' ? 'text-white' : 'text-[#006a4e]'} />
              <span className="truncate max-w-[120px] sm:max-w-none">{selectedUnion === 'all' ? 'সকল এলাকা' : selectedUnion}</span>
              <ChevronDown size={14} className={selectedUnion !== 'all' ? 'text-white/80' : 'text-[#006a4e]/80'} />
            </button>
          </div>

          {/* SECTION 2: Horizontal Category Pills (Matching Doctors / Master Service Design) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_MAP.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(cat.id);
                    setVisibleCount(6);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black border transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#006a4e]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Grid: Feed + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pt-2">
          
          {/* Left Column: News Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Featured Hero Banner */}
            {featuredNews.length > 0 && activeFilter === 'all' && !searchTerm && (
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 group shadow-md border border-slate-200">
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  {featuredNews[currentFeaturedIndex]?.image ? (
                    <img 
                      src={featuredNews[currentFeaturedIndex].image} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-950 flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-emerald-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-lg shadow-md uppercase tracking-wider">
                    প্রধান সংবাদ
                  </div>

                  {/* Actions */}
                  {isStaff && (
                    <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                      <button
                        onClick={(e) => handleOpenEdit(featuredNews[currentFeaturedIndex], e)}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white space-y-2">
                    <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                      {featuredNews[currentFeaturedIndex]?.category}
                    </span>
                    <h2 
                      onClick={() => setSelectedNews(featuredNews[currentFeaturedIndex])}
                      className="text-lg sm:text-xl font-black text-white leading-snug hover:text-emerald-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      {featuredNews[currentFeaturedIndex]?.title}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {featuredNews[currentFeaturedIndex]?.summary || featuredNews[currentFeaturedIndex]?.content}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 text-[11px] font-semibold text-slate-300">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          {featuredNews[currentFeaturedIndex]?.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          {featuredNews[currentFeaturedIndex]?.views || 0} ভিউ
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedNews(featuredNews[currentFeaturedIndex])}
                        className="flex items-center gap-1 text-emerald-300 hover:text-white font-bold cursor-pointer transition-colors"
                      >
                        <span>সম্পূর্ণ পড়ুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slider Dots */}
                {featuredNews.length > 1 && (
                  <div className="flex justify-center gap-1.5 p-2 bg-slate-950/80">
                    {featuredNews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentFeaturedIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentFeaturedIndex === idx ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-600'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* News List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-emerald-700" />
                  {activeFilter === 'all' ? 'সর্বশেষ সংবাদ তালিকা' : `${activeFilter} সংক্রান্ত সংবাদ`}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  মোট {filteredItems.length}টি সংবাদ
                </span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-4 animate-pulse">
                      <div className="w-full sm:w-48 h-36 bg-slate-200 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 bg-slate-200 rounded w-1/4" />
                        <div className="h-6 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Newspaper className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">কোনো সংবাদ পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    আপনার নির্বাচিত ক্যাটাগরি বা অনুসন্ধানে বর্তমানে কোনো সংবাদ নেই।
                  </p>
                  <button
                    onClick={() => {
                      setActiveFilter('all');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    সকল সংবাদ দেখুন
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredItems.slice(0, visibleCount).map((item) => {
                    const isBookmarked = bookmarks.includes(item.id);

                    return (
                      <article
                        key={item.id}
                        onClick={() => setSelectedNews(item)}
                        className="group bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-3.5 sm:gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-full sm:w-44 h-40 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                              <Newspaper className="w-8 h-8" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-700/90 backdrop-blur-sm text-white text-[10px] font-black rounded-lg shadow-sm">
                            {item.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-600" />
                                  {item.date} {item.time && `• ${item.time}`}
                                </span>
                              </div>

                              {/* Staff Actions */}
                              {isStaff && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => handleOpenEdit(item, e)}
                                    className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100"
                                    title="সম্পাদনা"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <h4 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.summary || item.content}
                            </p>
                          </div>

                          {/* Footer Stats & Actions */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {item.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className={`w-3.5 h-3.5 ${item.likesCount > 0 ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                                {item.likesCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                {item.commentsCount || 0}
                              </span>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => toggleBookmark(item.id, e)}
                                className={`p-1.5 rounded-xl transition-colors ${
                                  isBookmarked ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                                title={isBookmarked ? "সংরক্ষিত" : "বুকমার্ক করুন"}
                              >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-700' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleNativeShare(item)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                title="শেয়ার করুন"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {filteredItems.length > visibleCount && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-full shadow-sm transition-all cursor-pointer"
                  >
                    আরও সংবাদ লোড করুন ({filteredItems.length - visibleCount} বাকি)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Popular & Citizen Reporter Box */}
          <div className="space-y-6">
            
            {/* Citizen Journalist Card */}
            <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-5 text-white shadow-md space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-200">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">আপনিও হোন নাগরিক সাংবাদিক</h4>
                <p className="text-xs text-emerald-100 leading-relaxed mt-1">
                  আপনার এলাকার যেকোনো সমস্যা, উন্নয়ন বা গুরুত্বপূর্ণ ঘটনার সংবাদ পাঠিয়ে পুঠিয়াবাসীকে জানান।
                </p>
              </div>
              <button
                onClick={() => setShowSendReportModal(true)}
                className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-2xl font-black text-xs shadow transition-all active:scale-95 cursor-pointer"
              >
                সংবাদ জমা দিন
              </button>
            </div>

            {/* Popular News Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                সর্বাধিক পঠিত সংবাদ
              </h4>

              <div className="space-y-3">
                {popularNews.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNews(item)}
                    className="flex gap-3 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Newspaper className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h5>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views || 0} ভিউ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 0. FILTER & LOCATION MODALS                                               */}
      {/* ========================================================================= */}

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#006a4e]" />
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">ফিল্টার ও সাজানোর অপশন</h3>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">সংবাদ সাজান</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSortBy('newest')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      sortBy === 'newest'
                        ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    সর্বশেষ সংবাদ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy('popular')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      sortBy === 'popular'
                        ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    জনপ্রিয় সংবাদ
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">ক্যাটাগরি</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_MAP.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveFilter(cat.id)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer truncate ${
                        activeFilter === cat.id
                          ? 'bg-emerald-100 text-[#006a4e] border-[#006a4e]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('newest');
                    setActiveFilter('all');
                    setSelectedUnion('all');
                  }}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  রিসেট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#006a4e] text-white font-black text-xs hover:bg-[#00543e] shadow-md transition-all cursor-pointer"
                >
                  ফিল্টার প্রয়োগ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#006a4e]" />
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">এলাকা / ইউনিয়ন নির্বাচন করুন</h3>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                পুঠিয়া উপজেলার নির্দিষ্ট ইউনিয়নের সংবাদ দেখতে এলাকা নির্বাচন করুন:
              </p>

              <div className="overflow-y-auto space-y-1.5 pr-1 max-h-64">
                {PUTHIA_UNIONS_LIST.map((union) => {
                  const isSelected = selectedUnion === union.id;
                  return (
                    <button
                      key={union.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnion(union.id);
                        setShowLocationModal(false);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-black text-left flex items-center justify-between transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-sm'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#006a4e]'}`} />
                        {union.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnion('all');
                    setShowLocationModal(false);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  সকল এলাকা প্রদর্শন করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation />

      {/* ========================================================================= */}
      {/* 1. NEWS DETAIL FULLSCREEN READER                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white w-full h-[100dvh] flex flex-col overflow-hidden"
            id="news-detail-fullscreen"
          >
            {/* Top Navigation / Action Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200/80 flex items-center justify-between z-20 shrink-0 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="p-2 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  title="ফিরে যান"
                  aria-label="ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline">ফিরে যান</span>
                </button>

                <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800 shrink-0">
                  {selectedNews.category}
                </span>

                <span className="text-xs text-slate-400 font-semibold truncate hidden md:inline">
                  {selectedNews.date} {selectedNews.time && `• ${selectedNews.time}`}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleLike(selectedNews)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black active:scale-95 ${
                    isLikedLocally 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isLikedLocally ? "পছন্দ হয়েছে" : "পছন্দ করুন"}
                >
                  <Heart className={`w-4 h-4 ${isLikedLocally ? 'fill-red-600 text-red-600' : 'text-slate-600'}`} />
                  <span className="text-xs">{currentLikesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleBookmark(selectedNews.id)}
                  className={`p-2 rounded-full transition-all cursor-pointer active:scale-95 ${
                    bookmarks.includes(selectedNews.id) 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={bookmarks.includes(selectedNews.id) ? "সংরক্ষিত" : "বুকমার্ক"}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(selectedNews.id) ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleNativeShare(selectedNews)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
                  title="শেয়ার"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer active:scale-95 ml-0.5"
                  aria-label="বন্ধ করুন"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto w-full overscroll-contain">
              <div className="max-w-3xl mx-auto px-4 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 pb-24 sm:pb-28">
                
                {/* Title */}
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                  {selectedNews.title}
                </h1>

                {/* Author & Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      {selectedNews.authorName?.[0] || 'পু'}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs sm:text-sm">{selectedNews.authorName || 'আমাদের পুঠিয়া প্রতিনিধি'}</p>
                      <p className="text-[11px] text-slate-400">{selectedNews.reporterLocation || 'পুঠিয়া, রাজশাহী'} • {selectedNews.date} {selectedNews.time && `(${selectedNews.time})`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {selectedNews.views || 0} ভিউ
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      {currentLikesCount} লাইক
                    </span>
                  </div>
                </div>

                {/* Cover Image */}
                {selectedNews.image && (
                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 bg-slate-100 shadow-xs">
                    <img 
                      src={selectedNews.image} 
                      alt={selectedNews.title} 
                      className="w-full max-h-[460px] object-cover" 
                    />
                  </div>
                )}

                {/* Article Text Content */}
                <div className="text-base sm:text-lg leading-relaxed text-slate-800 whitespace-pre-line font-medium space-y-4 pt-1">
                  {selectedNews.content}
                </div>

                {/* Tags */}
                {selectedNews.tags && selectedNews.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                    {selectedNews.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Like & Share Action Box */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(selectedNews)}
                      className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95 ${
                        isLikedLocally ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedLocally ? 'fill-white' : 'text-red-500'}`} />
                      <span>{isLikedLocally ? 'পছন্দ হয়েছে' : 'পছন্দ করুন'} ({currentLikesCount})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">শেয়ার করুন:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/news?id=' + selectedNews.id)}`;
                        window.open(url, '_blank');
                      }}
                      className="p-2.5 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="ফেসবুকে শেয়ার"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `${selectedNews.title}\n${window.location.origin}/news?id=${selectedNews.id}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-2.5 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="হোয়াটসঅ্যাপে শেয়ার"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNativeShare(selectedNews)}
                      className="p-2.5 rounded-xl sm:rounded-2xl bg-slate-200/80 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                      title="লিঙ্ক কপি বা শেয়ার"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Real-Time Comments Section */}
                <div className="pt-5 border-t border-slate-200 space-y-4">
                  <h4 className="font-black text-base sm:text-lg text-slate-900 flex items-center justify-between">
                    <span>মন্তব্য ({liveComments.length})</span>
                    <span className="text-xs text-slate-400 font-normal">রিয়েল-টাইম লাইভ সিঙ্ক</span>
                  </h4>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="আপনার গঠনমূলক মন্তব্য লিখুন..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentInput.trim()}
                      className="px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-700/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>পাঠান</span>
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3 pt-1">
                    {liveComments.length === 0 ? (
                      <p className="text-xs sm:text-sm text-slate-400 text-center py-5 bg-slate-50 rounded-2xl border border-slate-100">
                        এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
                      </p>
                    ) : (
                      liveComments.map((cmt) => (
                        <div key={cmt.id} className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 font-black text-xs flex items-center justify-center">
                                {cmt.userName[0]}
                              </div>
                              <div>
                                <h6 className="text-xs sm:text-sm font-black text-slate-800">{cmt.userName}</h6>
                                <span className="text-[10px] text-slate-400">
                                  {cmt.createdAt?.seconds 
                                    ? new Date(cmt.createdAt.seconds * 1000).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
                                    : 'এই মাত্র'}
                                </span>
                              </div>
                            </div>

                            {(isStaff || (user && user.uid === cmt.userId)) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(cmt.id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white cursor-pointer"
                                title="মন্তব্য মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 font-normal pl-10 leading-relaxed">
                            {cmt.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. CITIZEN JOURNALIST REPORT FULLSCREEN MODAL                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSendReportModal && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white w-full h-[100dvh] flex flex-col overflow-hidden"
            id="citizen-report-modal-fullscreen"
          >
            {/* Top Navigation Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200/80 flex items-center justify-between z-20 shrink-0 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowSendReportModal(false)}
                  className="p-2 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  title="ফিরে যান"
                  aria-label="ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline">ফিরে যান</span>
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        নাগরিক সংবাদ পাঠান
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-200">
                        নাগরিক সাংবাদিকতা
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                      আপনার প্রেরিত সংবাদ যাচাইয়ের পর প্রকাশিত হবে
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSendReportModal(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
                  aria-label="বন্ধ করুন"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full overscroll-contain">
              <div className="max-w-xl mx-auto px-4 sm:px-8 py-5 sm:py-7 space-y-4 sm:space-y-5 pb-28">
                {reportSuccess ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">ধন্যবাদ! সংবাদ জমা হয়েছে</h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      আমাদের পুঠিয়া প্রতিনিধি দল আপনার প্রেরিত তথ্য যাচাই করে দ্রুত সময়ের মধ্যে নিউজ পোর্টালে প্রকাশ করবে।
                    </p>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setReportSuccess(false);
                          setShowSendReportModal(false);
                        }}
                        className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                      >
                        সংবাদ পাতায় ফিরে যান
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendReportSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">আপনার নাম *</label>
                        <input
                          type="text"
                          required
                          placeholder="নাম লিখুন"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর *</label>
                        <input
                          type="tel"
                          required
                          placeholder="০১XXXXXXXXX"
                          value={reporterPhone}
                          onChange={(e) => setReporterPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">ঘটনার স্থান / এলাকা *</label>
                      <input
                        type="text"
                        required
                        placeholder="উদা: পুঠিয়া রাজবাড়ী মোড়, বানেশ্বর বাজার"
                        value={reporterLocation}
                        onChange={(e) => setReporterLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">সংবাদের বিস্তারিত বিবরণ *</label>
                      <textarea
                        required
                        rows={6}
                        placeholder="কী ঘটেছে, কখন ঘটেছে এবং বিস্তারিত লিখুন..."
                        value={reporterContent}
                        onChange={(e) => setReporterContent(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                      />
                    </div>

                    {/* Image Upload Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>সংবাদের ছবি (ছবি আপলোড করুন)</span>
                        </label>
                        {reporterImage && (
                          <button
                            type="button"
                            onClick={() => setReporterImage('')}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ছবি মুছুন</span>
                          </button>
                        )}
                      </div>

                      {reporterImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group shadow-xs">
                          <img
                            src={reporterImage}
                            alt="সংবাদের ছবি প্রিভিউ"
                            className="w-full h-44 object-cover rounded-2xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                            <label className="px-3 py-1.5 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-1.5 active:scale-95">
                              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ছবি পরিবর্তন</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageFileUpload(e, setReporterImage)}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setReporterImage('')}
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-rose-700 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>সরিয়ে ফেলুন</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-4 text-center transition-all">
                          <input
                            type="file"
                            id="citizen-reporter-image-input"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, setReporterImage)}
                            disabled={imageUploading}
                          />
                          <label
                            htmlFor="citizen-reporter-image-input"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                              {imageUploading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                              ) : (
                                <ImageIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-800">
                                {imageUploading ? "ছবি প্রসেস হচ্ছে..." : "গ্যালারি বা ক্যামেরা থেকে ছবি সিলেক্ট করুন"}
                              </p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                JPG, PNG, WEBP (সর্বোচ্চ ১০ মেগাবাইট)
                              </p>
                            </div>
                            <span className="mt-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95">
                              ছবি নির্বাচন করুন
                            </span>
                          </label>

                          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center gap-2 text-left">
                            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">অথবা লিঙ্ক:</span>
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/..."
                              value={reporterImage}
                              onChange={(e) => setReporterImage(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSendReportModal(false)}
                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={reportSubmitting}
                        className="flex-[2] py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {reportSubmitting ? "পাঠানো হচ্ছে..." : "সংবাদ জমা দিন"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. ADMIN / CITIZEN NEWS WRITE / EDIT FULLSCREEN MODAL                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white w-full h-[100dvh] flex flex-col overflow-hidden"
            id="admin-news-modal-fullscreen"
          >
            {/* Top Navigation Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200/80 flex items-center justify-between z-20 shrink-0 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="p-2 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  title="ফিরে যান"
                  aria-label="ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline">ফিরে যান</span>
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {editingId ? "সংবাদ সম্পাদনা" : (isStaff ? "নতুন সংবাদ তৈরি" : "নাগরিক সংবাদ লিখুন")}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                        isStaff ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isStaff ? 'অ্যাডমিন প্রকাশনা' : 'নাগরিক প্রতিবেদন'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                      {isStaff
                        ? "সংবাদ সরাসরি সকল ব্যবহারকারীর কাছে রিয়েল-টাইমে প্রকাশিত হবে"
                        : "আপনার সংবাদ জমা দিন, অ্যাডমিন যাচাই শেষে এটি মূল ফিডে প্রকাশিত হবে"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
                  aria-label="বন্ধ করুন"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto w-full overscroll-contain">
              <form onSubmit={handleAdminFormSubmit} className="max-w-2xl mx-auto px-4 sm:px-8 py-5 sm:py-7 space-y-4 sm:space-y-5 pb-28">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সংবাদের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আকর্ষণীয় ও সঠিক শিরোনাম লিখুন"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="উন্নয়ন">উন্নয়ন</option>
                    <option value="রাজনীতি">রাজনীতি</option>
                    <option value="শিক্ষা">শিক্ষা</option>
                    <option value="খেলা">খেলা</option>
                    <option value="অপরাধ">অপরাধ</option>
                    <option value="সামাজিক">সামাজিক</option>
                    <option value="সংস্কৃতি">সংস্কৃতি</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                {/* Image Upload Component */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>সংবাদের ফিচার্ড ছবি (Image Upload)</span>
                    </label>
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ছবি মুছুন</span>
                      </button>
                    )}
                  </div>

                  {formImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group shadow-xs">
                      <img
                        src={formImage}
                        alt="সংবাদের কভার ছবি প্রিভিউ"
                        className="w-full h-48 sm:h-56 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                        <label className="px-3.5 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-1.5 active:scale-95">
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ছবি পরিবর্তন করুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, setFormImage)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-rose-700 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>সরিয়ে ফেলুন</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 text-center transition-all">
                      <input
                        type="file"
                        id="news-admin-image-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, setFormImage)}
                        disabled={imageUploading}
                      />
                      <label
                        htmlFor="news-admin-image-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                          {imageUploading ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                          ) : (
                            <ImageIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">
                            {imageUploading ? "ছবি প্রসেস করা হচ্ছে..." : "গ্যালারি বা ক্যামেরা থেকে সরাসরি ছবি আপলোড করুন"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            JPG, PNG, WEBP ফরম্যাট (সর্বোচ্চ ১০ মেগাবাইট)
                          </p>
                        </div>
                        <span className="mt-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95">
                          ছবি নির্বাচন করুন
                        </span>
                      </label>

                      <div className="mt-3.5 pt-3 border-t border-emerald-200/60 flex items-center gap-2 text-left">
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">অথবা লিঙ্ক:</span>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সংবাদের মূল কন্টেন্ট *</label>
                  <textarea
                    required
                    rows={7}
                    placeholder="সংবাদের বিস্তারিত বিবরণ এখানে লিখুন..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">প্রতিবেদকের নাম</label>
                    <input
                      type="text"
                      placeholder="আমাদের পুঠিয়া প্রতিনিধি"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">স্থান / এলাকা</label>
                    <input
                      type="text"
                      placeholder="পুঠিয়া সদর, রাজশাহী"
                      value={formReporterLocation}
                      onChange={(e) => setFormReporterLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {isStaff && (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="featured-toggle"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <label htmlFor="featured-toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                      প্রধান সংবাদ (Featured Banner) হিসেবে প্রদর্শন করুন
                    </label>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={adminSubmitting}
                    className="flex-[2] py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {adminSubmitting ? "সংরক্ষণ হচ্ছে..." : (
                      editingId 
                        ? "সংবাদ আপডেট করুন" 
                        : (isStaff ? "সংবাদ প্রকাশ করুন" : "সংবাদ জমা দিন (যাচাইয়ের জন্য)")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default News;

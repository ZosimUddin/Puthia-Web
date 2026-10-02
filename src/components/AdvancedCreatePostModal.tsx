import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Image as ImageIcon, Video as VideoIcon, MapPin, Smile, 
  BarChart3, Globe, Users, Lock, ChevronDown, Sparkles, 
  Trash2, Plus, Calendar, Clock, Search, GripVertical, AlertTriangle, Link as LinkIcon, UserPlus, AlertCircle, FileText, Hash,
  ShieldCheck, ShieldAlert, Phone, Ambulance, Flame, Heart, Stethoscope, Zap, Shield, HardDrive,
  ArrowLeft, ChevronLeft, AtSign, Music, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { PostVideoPlayer } from './PostVideoPlayer';
import { EMERGENCY_CATEGORIES, EmergencyCategoryKey } from './EmergencyAlertBanner';
import { mediaProcessingService, MediaRecord } from '../services/mediaProcessingService';
import { MyMediaLibraryModal } from './adda/MyMediaLibraryModal';
import { cleanUndefined } from '../utils/firestoreUtils';

interface AdvancedCreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
  initialData?: any;
  initialAction?: 'photo' | 'video' | 'general';
}

type Audience = 'Public' | 'Local' | 'Only Me';

interface PollOption {
  id: string;
  text: string;
}

interface MentionUser {
  uid: string;
  name: string;
  union?: string;
  avatarUrl?: string;
}

export function AdvancedCreatePostModal({ isOpen, onClose, onSubmit, initialData, initialAction }: AdvancedCreatePostModalProps) {
  const { user, userProfile } = useAuth();
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPostBgColor, setSelectedPostBgColor] = useState('');
  const [category, setCategory] = useState('general');
  const [union, setUnion] = useState('পুঠিয়া ইউনিয়ন');
  const [audience, setAudience] = useState<Audience>('Public');
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // Document states
  const [docUrl, setDocUrl] = useState('');
  const [docName, setDocName] = useState('');
  
  // Custom Location Picker
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedPresetLocation, setSelectedPresetLocation] = useState('none');
  const [customLocation, setCustomLocation] = useState('');
  const [location, setLocation] = useState('');

  // Hashtag states
  const [showHashtagHelper, setShowHashtagHelper] = useState(false);
  const [activeHashtagQuery, setActiveHashtagQuery] = useState('');

  // Feelings
  const [feeling, setFeeling] = useState('');
  
  // Poll States
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDuration, setPollDuration] = useState('3_days');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  // Urgent / Emergency states
  const [isUrgent, setIsUrgent] = useState(false);
  const [emergencyCategory, setEmergencyCategory] = useState<string>('blood');
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyContactPerson, setEmergencyContactPerson] = useState('');
  const [emergencyTime, setEmergencyTime] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified'>('unverified');
  const [verifiedBy, setVerifiedBy] = useState('পুঠিয়া উপজেলা প্রশাসন');
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Link Preview states
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  // Schedule States
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Event States
  const [isEvent, setIsEvent] = useState(false);
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventContact, setEventContact] = useState('');

  // Advanced Settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowShare, setAllowShare] = useState(true);

  // Mention States
  const [usersList, setUsersList] = useState<MentionUser[]>([]);
  const [showMentionSelector, setShowMentionSelector] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  // Media Library Modal
  const [showMediaLibraryModal, setShowMediaLibraryModal] = useState(false);

  // Draft check
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audienceDropdownRef = useRef<HTMLDivElement>(null);

  // Preset location list for Puthiya
  const PUTHIYA_PRESET_LOCATIONS = [
    { id: 'rajbari', name: 'পুঠিয়া রাজবাড়ী' },
    { id: 'upazila', name: 'উপজেলা পরিষদ কার্যালয়' },
    { id: 'bazar', name: 'পুঠিয়া বাজার' },
    { id: 'baneswar', name: 'বানেশ্বর বাজার' },
    { id: 'belpukur', name: 'বেলপুকুরিয়া' },
    { id: 'hospital', name: 'উপজেলা স্বাস্থ্য কমপ্লেক্স' },
    { id: 'municipality', name: 'পৌরসভা কার্যালয়' },
    { id: 'temple', name: 'শিব মন্দির ও লেক' },
  ];

  // Popular / Recommended hashtags for Puthia
  const POPULAR_HASHTAGS = [
    'পুঠিয়া', 'উন্নয়ন', 'অভিযোগ', 'জরুরি', 'রাস্তা', 'পরিচ্ছন্নতা', 
    'শিক্ষা', 'স্বাস্থ্য', 'কৃষি', 'ব্যবসা', 'পুঠিয়া_রাজবাড়ী', 'বানেশ্বর', 'ধন্যবাদ', 'ইভেন্ট', 'প্রশ্নোত্তর'
  ];

  // Fetch users from Firestore for mentions on open
  useEffect(() => {
    if (isOpen && user) {
      const fetchUsers = async () => {
        try {
          // Use query and limit to avoid potential permission/quota issues with large scans
          const { query, collection, limit } = await import('firebase/firestore');
          const snap = await getDocs(query(collection(db, 'users'), limit(100)));
          const list: MentionUser[] = [];
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
          setUsersList(list);
          try {
            localStorage.setItem("cached_users_list", JSON.stringify(list.slice(0, 50)));
          } catch {}
        } catch (e: any) {
          if (e?.message?.includes("Quota") || e?.code === "resource-exhausted" || e?.message?.includes("quota")) {
            console.warn("Firestore quota exceeded for mentions. Falling back to cached users list.");
          } else if (e?.code === "permission-denied") {
            console.warn("Permission denied fetching users for mentions. This might be because the user is not fully logged in or rules are restrictive.");
          } else {
            console.error('Error fetching users for mentions, using fallback:', e);
          }
          
          let fallbackUsers: MentionUser[] = [];
          try {
            const cached = localStorage.getItem("cached_users_list");
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                fallbackUsers = parsed;
              }
            }
          } catch {}
          setUsersList(fallbackUsers);
        }
      };
      fetchUsers();
    }
  }, [isOpen, user]);

  // Handle outside click for audience dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (audienceDropdownRef.current && !audienceDropdownRef.current.contains(event.target as Node)) {
        setIsAudienceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check draft existence
  useEffect(() => {
    if (isOpen && !initialData) {
      const savedDraft = localStorage.getItem('post_draft');
      if (savedDraft) {
        setHasSavedDraft(true);
      } else {
        setHasSavedDraft(false);
      }
    }
  }, [isOpen, initialData]);

  // Handle auto-opening file select for initial action (Facebook-style shortcut trigger)
  useEffect(() => {
    if (isOpen && initialAction === 'photo') {
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 350);
      return () => clearTimeout(timer);
    } else if (isOpen && initialAction === 'video') {
      const timer = setTimeout(() => {
        videoInputRef.current?.click();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialAction]);

  // Initialize with initialData for edit mode
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCategory(initialData.category || 'general');
      setUnion(initialData.union || 'পুঠিয়া ইউনিয়ন');
      setAudience(initialData.audience || 'Public');
      setImages(initialData.gallery || (initialData.imageUrl ? [initialData.imageUrl] : []));
      setLocation(initialData.location || '');
      setFeeling(initialData.feeling || '');
      setIsUrgent(initialData.isUrgent || false);
      setEmergencyCategory(initialData.emergencyCategory || initialData.category || 'blood');
      setEmergencyLocation(initialData.emergencyLocation || initialData.location || '');
      setEmergencyContact(initialData.emergencyContact || initialData.contact || '');
      setEmergencyContactPerson(initialData.emergencyContactPerson || initialData.contactPerson || '');
      setEmergencyTime(initialData.emergencyTime || initialData.time || '');
      setVerificationStatus(initialData.verificationStatus || 'unverified');
      setVerifiedBy(initialData.verifiedBy || 'পুঠিয়া উপজেলা প্রশাসন');
      setLinkUrl(initialData.linkUrl || '');
      setLinkTitle(initialData.linkTitle || '');
      setDocUrl(initialData.docUrl || '');
      setDocName(initialData.docName || '');
      if (initialData.linkUrl) setShowLinkInput(true);
      
      if (initialData.location) {
        const matched = PUTHIYA_PRESET_LOCATIONS.find(p => p.name === initialData.location);
        if (matched) {
          setSelectedPresetLocation(matched.id);
        } else {
          setSelectedPresetLocation('other');
          setCustomLocation(initialData.location);
        }
      }

      if (initialData.poll) {
        setShowPoll(true);
        setPollOptions(initialData.poll.options.map((opt: any) => ({ id: opt.id.toString(), text: opt.label })));
      }
    } else if (isOpen && !initialData) {
      // Clear form
      resetForm();
    }
  }, [isOpen, initialData]);

  // Handle draft restoration
  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('post_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setCategory(draft.category || 'general');
        setUnion(draft.union || 'পুঠিয়া ইউনিয়ন');
        setAudience(draft.audience || 'Public');
        setLocation(draft.location || '');
        setFeeling(draft.feeling || '');
        setIsUrgent(draft.isUrgent || false);
        setEmergencyCategory(draft.emergencyCategory || draft.category || 'blood');
        setEmergencyLocation(draft.emergencyLocation || draft.location || '');
        setEmergencyContact(draft.emergencyContact || draft.contact || '');
        setEmergencyContactPerson(draft.emergencyContactPerson || draft.contactPerson || '');
        setEmergencyTime(draft.emergencyTime || draft.time || '');
        setVerificationStatus(draft.verificationStatus || 'unverified');
        setVerifiedBy(draft.verifiedBy || 'পুঠিয়া উপজেলা প্রশাসন');
        setLinkUrl(draft.linkUrl || '');
        setLinkTitle(draft.linkTitle || '');
        setDocUrl(draft.docUrl || '');
        setDocName(draft.docName || '');
        if (draft.linkUrl) setShowLinkInput(true);
        
        if (draft.location) {
          const matched = PUTHIYA_PRESET_LOCATIONS.find(p => p.name === draft.location);
          if (matched) {
            setSelectedPresetLocation(matched.id);
          } else {
            setSelectedPresetLocation('other');
            setCustomLocation(draft.location);
          }
        }
        toast.success('ড্রাফট রিকভার করা হয়েছে!');
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
    setHasSavedDraft(false);
  };

  const deleteDraft = () => {
    localStorage.removeItem('post_draft');
    setHasSavedDraft(false);
    toast.success('ড্রাফট মুছে ফেলা হয়েছে!');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let validCount = 0;
      const fileArr = Array.from(files);
      for (const file of fileArr) {
        if (!file.type.startsWith('image/')) {
          toast.error('শুধুমাত্র ছবি আপলোড করা যাবে।');
          continue;
        }
        if (file.size > 15 * 1024 * 1024) {
          toast.error('ছবির সাইজ ১৫MB এর বেশি হতে পারবে না।');
          continue;
        }

          try {
            // Process variants & strip EXIF
            const record = await mediaProcessingService.uploadMedia(file, {
              ownerId: user?.uid || 'guest',
              uploaderId: user?.uid || 'guest',
              uploaderName: userProfile?.name || user?.displayName || 'নাগরিক',
              target: 'post_photo',
              privacy: audience === 'Public' ? 'public' : audience === 'Local' ? 'friends' : 'only_me'
            });
            
            // Use mediumUrl (600px) instead of originalUrl for the post document to stay under 1MB limit
            setImages(prev => [...prev, record.mediumUrl || record.originalUrl]);
            validCount++;
          } catch (err: any) {
          toast.error(err.message || 'ছবি প্রসেসিংয়ে সমস্যা হয়েছে।');
        }
      }

      if (validCount > 0) {
        toast.success(`🛡️ ${validCount}টি ছবি অপ্টিমাইজড ও EXIF মুক্ত করে যুক্ত করা হয়েছে!`);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('শুধুমাত্র ভিডিও ফাইল আপলোড করা যাবে।');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('ভিডিওর সাইজ ১০০MB এর বেশি হতে পারবে না।');
        return;
      }

      try {
        toast.info('⏳ ভিডিও প্রসেসিং ও থাম্বনেইল তৈরি হচ্ছে...');
        const record = await mediaProcessingService.uploadMedia(file, {
          ownerId: user?.uid || 'guest',
          uploaderId: user?.uid || 'guest',
          uploaderName: userProfile?.name || user?.displayName || 'নাগরিক',
          target: 'post_video',
          privacy: audience === 'Public' ? 'public' : audience === 'Local' ? 'friends' : 'only_me'
        });

        setVideoFile(file);
        setVideoPreview(record.originalUrl);
        toast.success('🎬 ভিডিও এবং মাল্টি-কোয়ালিটি ভ্যারিয়েন্ট প্রস্তুত হয়েছে!');
      } catch (err: any) {
        toast.error(err.message || 'ভিডিও প্রসেসিং ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocUrl(reader.result as string);
        setDocName(file.name);
        toast.success(`দলিল "${file.name}" যুক্ত করা হয়েছে!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, { id: Date.now().toString(), text: '' }]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(opt => opt.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handlePresetLocationChange = (val: string) => {
    setSelectedPresetLocation(val);
    if (val === 'none') {
      setLocation('');
    } else if (val === 'other') {
      setLocation(customLocation);
    } else {
      const preset = PUTHIYA_PRESET_LOCATIONS.find(p => p.id === val);
      if (preset) setLocation(preset.name);
    }
  };

  const handleCustomLocationChange = (val: string) => {
    setCustomLocation(val);
    setLocation(val);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);

    // Dynamic hashtag check while typing
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = newText.slice(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    if (lastWord.startsWith('#')) {
      setActiveHashtagQuery(lastWord.slice(1));
      setShowHashtagHelper(true);
    } else {
      // If user typed away from #, close hashtag helper unless opened from toolbar
      if (activeHashtagQuery) {
        setShowHashtagHelper(false);
        setActiveHashtagQuery('');
      }
    }
  };

  const insertHashtag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    setContent(prev => {
      const cursorPos = textareaRef.current?.selectionStart ?? prev.length;
      const textBeforeCursor = prev.slice(0, cursorPos);
      const textAfterCursor = prev.slice(cursorPos);
      const lastHashIndex = textBeforeCursor.lastIndexOf('#');

      if (lastHashIndex !== -1 && lastHashIndex >= textBeforeCursor.lastIndexOf(' ')) {
        const beforeHash = textBeforeCursor.slice(0, lastHashIndex);
        return `${beforeHash}${formattedTag} ${textAfterCursor}`.replace(/\s+$/, ' ');
      }
      const space = prev.endsWith(' ') || prev.length === 0 ? '' : ' ';
      return `${prev}${space}${formattedTag} `;
    });
    setShowHashtagHelper(false);
    setActiveHashtagQuery('');
    toast.success(`${formattedTag} ট্যাগ যুক্ত করা হয়েছে!`);
    textareaRef.current?.focus();
  };

  const selectMention = (name: string) => {
    setContent(prev => {
      const space = prev.endsWith(' ') || prev.length === 0 ? '' : ' ';
      return `${prev}${space}@${name} `;
    });
    setShowMentionSelector(false);
    toast.success(`@${name} মেনশন করা হয়েছে!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !images.length && !videoPreview && !videoFile) {
      toast.error('অনুগ্রহ করে পোস্টের বিবরণ অথবা ছবি/ভিডিও যোগ করুন!');
      return;
    }
    
    setIsPublishing(true);

    try {
      // Simulate Validation & Upload Processing
      const toastId = toast.loading('ভ্যালিডেশন এবং আপলোড চলছে...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate Moderation Rule check
      toast.loading('মডারেশন পলিসি চেক করা হচ্ছে...', { id: toastId });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const rawPostData = {
        title: title.trim() || '',
        content: content.trim(),
        category: category || 'general',
        union: union || 'পুঠিয়া ইউনিয়ন',
        audience: audience || 'Public',
        isAnonymous: Boolean(isAnonymous),
        images: images || [],
        gallery: images || [],
        imageUrl: images?.[0] || '',
        videoPreview: videoPreview || '',
        videoUrl: videoPreview || '',
        docUrl: docUrl || '',
        docName: docName || '',
        location: location.trim() || '',
        feeling: feeling.trim() || '',
        isUrgent: Boolean(isUrgent),
        emergencyCategory: isUrgent ? (emergencyCategory || '') : '',
        emergencyLocation: isUrgent ? (emergencyLocation.trim() || location.trim() || '') : '',
        emergencyContact: isUrgent ? (emergencyContact.trim() || '') : '',
        emergencyContactPerson: isUrgent ? (emergencyContactPerson.trim() || '') : '',
        emergencyTime: isUrgent ? (emergencyTime.trim() || '') : '',
        verificationStatus: isUrgent ? (isAdmin ? verificationStatus : 'unverified') : '',
        verifiedBy: isUrgent && verificationStatus === 'verified' ? (verifiedBy.trim() || 'পুঠিয়া উপজেলা প্রশাসন') : '',
        linkUrl: linkUrl.trim() || '',
        linkTitle: linkTitle.trim() || '',
        poll: (() => {
          if (!showPoll) return null;
          const validOpts = pollOptions.filter(o => o.text.trim());
          if (validOpts.length < 2) return null;

          const now = Date.now();
          let endsAt: number | null = null;
          if (pollDuration === '1_day') endsAt = now + 1 * 24 * 60 * 60 * 1000;
          else if (pollDuration === '3_days') endsAt = now + 3 * 24 * 60 * 60 * 1000;
          else if (pollDuration === '7_days') endsAt = now + 7 * 24 * 60 * 60 * 1000;
          else if (pollDuration === '14_days') endsAt = now + 14 * 24 * 60 * 60 * 1000;

          return {
            question: pollQuestion.trim() || title.trim() || content.slice(0, 80) || "আপনার মূল্যবান মতামত দিন:",
            options: validOpts.map((opt, idx) => ({
              id: idx + 1,
              label: opt.text.trim(),
              votes: 0
            })),
            votedUsers: {},
            endsAt,
            durationDays: pollDuration === '1_day' ? 1 : pollDuration === '3_days' ? 3 : pollDuration === '7_days' ? 7 : pollDuration === '14_days' ? 14 : null,
            isClosed: false
          };
        })(),
        schedule: isScheduling ? { date: scheduleDate, time: scheduleTime } : null,
        event: isEvent ? {
          startDate: eventStartDate,
          endDate: eventEndDate,
          organizer: eventOrganizer,
          contact: eventContact
        } : null,
        settings: {
          allowComments,
          allowShare
        },
        author: isAnonymous ? 'গোপন নাগরিক' : (userProfile?.name || user?.displayName || 'সম্মানিত নাগরিক'),
        authorAvatar: isAnonymous ? '' : (userProfile?.photoURL || user?.photoURL || '')
      };

      const postData = cleanUndefined(rawPostData);

      // In real scenario this would save to DB. We call onSubmit
      await onSubmit(postData);

      // Check for Moderation trigger
      if (content.toLowerCase().includes('খারাপ') || isUrgent) {
        toast.success('🟡 আপনার পোস্ট যাচাইয়ের জন্য পাঠানো হয়েছে। (Pending Moderation)', { id: toastId, duration: 4000 });
      } else {
        toast.success('✅ আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে।', { id: toastId, duration: 3000 });
      }

      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Advanced post error:", error);
      let errorMsg = 'পোস্ট পাবলিশ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      
      if (error?.code === "resource-exhausted" || error?.message?.includes("quota")) {
        errorMsg = "🛑 ডাটাবেজের ফ্রি লিমিট শেষ। কিছুক্ষণ পর চেষ্টা করুন।";
      } else if (error?.code === "permission-denied") {
        errorMsg = "🚫 আপনার পোস্ট করার অনুমতি নেই।";
      } else if (error?.message?.includes("large")) {
        errorMsg = "🖼️ ছবির সাইজ অনেক বড়, দয়া করে ছোট ছবি দিন।";
      }

      toast.error(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  const saveDraftLocally = () => {
    const draft = {
      title,
      content,
      category,
      union,
      audience,
      location,
      feeling,
      isUrgent,
      emergencyCategory,
      emergencyLocation,
      emergencyContact,
      emergencyContactPerson,
      emergencyTime,
      verificationStatus,
      verifiedBy,
      linkUrl,
      linkTitle,
      docUrl,
      docName,
      isEvent,
      eventStartDate,
      eventEndDate,
      eventOrganizer,
      eventContact,
      allowComments,
      allowShare
    };
    localStorage.setItem('post_draft', JSON.stringify(draft));
    toast.success('ড্রাফট হিসেবে সেভ করা হয়েছে!');
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setUnion('পুঠিয়া ইউনিয়ন');
    setAudience('Public');
    setIsAnonymous(false);
    setImages([]);
    setVideoFile(null);
    setVideoPreview(null);
    setSelectedPresetLocation('none');
    setCustomLocation('');
    setLocation('');
    setFeeling('');
    setShowPoll(false);
    setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    setIsUrgent(false);
    setEmergencyCategory('blood');
    setEmergencyLocation('');
    setEmergencyContact('');
    setEmergencyContactPerson('');
    setEmergencyTime('');
    setVerificationStatus('unverified');
    setVerifiedBy('পুঠিয়া উপজেলা প্রশাসন');
    setShowLinkInput(false);
    setLinkUrl('');
    setLinkTitle('');
    setDocUrl('');
    setDocName('');
    setIsScheduling(false);
    setScheduleDate('');
    setScheduleTime('');
    setIsEvent(false);
    setEventStartDate('');
    setEventEndDate('');
    setEventOrganizer('');
    setEventContact('');
    setShowAdvancedSettings(false);
    setAllowComments(true);
    setAllowShare(true);
    setHasSavedDraft(false);
  };

  const filteredMentions = usersList.filter(u => 
    u.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        />

        <motion.div 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="bg-white md:rounded-[32px] w-full max-w-2xl relative shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[92vh]"
        >
          {/* Header (Matching Screenshot) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-full transition text-slate-800 cursor-pointer border-0 bg-transparent"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Create post</h2>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || isPublishing}
              className={`font-bold text-base transition cursor-pointer border-0 bg-transparent ${
                content.trim() && !isPublishing
                  ? 'text-[#1877F2] hover:opacity-80 font-black'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              {isPublishing ? 'POSTING...' : 'POST'}
            </button>
          </div>

          {/* Draft Notification Banner */}
          {hasSavedDraft && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-2">
                <span className="text-base">💾</span>
                <p className="text-[11px] sm:text-xs font-bold">Draft সংরক্ষিত আছে</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={restoreDraft}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[10px] font-black transition-all border-0 cursor-pointer"
                >
                  কন্টিনিউ
                </button>
                <button 
                  onClick={deleteDraft}
                  className="bg-white hover:bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[10px] font-black transition-all border border-rose-100 cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar bg-white p-5 space-y-5 pb-20">
            
            {/* Author details & privacy selector */}
            <div className="flex items-center gap-3">
              <img 
                src={isAnonymous ? `https://api.dicebear.com/7.x/bottts/svg?seed=anonymous` : (userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.uid || 'guest'}`)}
                alt="User Avatar"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />

              <div className="space-y-1">
                <div className="font-bold text-[#050505] text-base leading-tight flex items-center gap-1.5">
                  <span>{isAnonymous ? 'Riya Islam' : (userProfile?.name || user?.displayName || 'Riya Islam')}</span>
                  {feeling && <span className="font-normal text-slate-500 text-xs">— is {feeling}</span>}
                </div>

                {/* Privacy Selection Pill */}
                <div className="relative inline-block text-left" ref={audienceDropdownRef}>
                  <button 
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-[#e4e6eb] hover:bg-slate-300 text-slate-800 rounded-md transition text-xs font-semibold border-0 cursor-pointer"
                    onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                  >
                    <Globe size={12} />
                    <span>{audience === 'Public' ? 'Public' : audience === 'Local' ? 'Friends' : 'Only Me'}</span>
                    <span className="text-[10px]">▾</span>
                  </button>

                  {isAudienceDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        { value: 'Public' as Audience, label: 'Public (সবাই)', icon: <Globe size={14} className="text-emerald-600" /> },
                        { value: 'Local' as Audience, label: 'Friends (বান্ধবীরা)', icon: <Users size={14} className="text-blue-600" /> },
                        { value: 'Only Me' as Audience, label: 'Only Me (শুধু আমি)', icon: <Lock size={14} className="text-amber-600" /> }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setAudience(opt.value);
                            setIsAudienceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent ${
                            audience === opt.value ? 'text-[#1877F2] bg-blue-50/50' : 'text-slate-700'
                          }`}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="pt-2">
              <textarea 
                ref={textareaRef}
                placeholder="What's on your mind?"
                value={content}
                maxLength={2000}
                onChange={handleContentChange}
                className={`w-full min-h-[140px] text-lg font-normal outline-none border-0 resize-none transition-all p-3 rounded-2xl ${selectedPostBgColor || 'bg-transparent text-slate-800 placeholder:text-slate-400'}`}
              />
            </div>

            {/* Colored Background Presets Carousel Row (Exact Screenshot) */}
            <div className="flex items-center gap-2 py-2 border-t border-b border-slate-100/80 bg-white overflow-x-auto scrollbar-none">
              <button 
                type="button"
                onClick={() => setSelectedPostBgColor('')}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 hover:bg-slate-100 transition cursor-pointer bg-white"
              >
                <ChevronLeft size={16} />
              </button>

              {/* White Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('')}
                className={`w-8 h-8 rounded-lg bg-white border border-slate-300 cursor-pointer shrink-0 transition ${!selectedPostBgColor ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              />

              {/* Neon Pink/Magenta Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-[#d600d6] text-white')}
                className={`w-8 h-8 rounded-lg bg-[#d600d6] cursor-pointer shrink-0 transition ${selectedPostBgColor.includes('#d600d6') ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              />

              {/* Crimson Red Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-[#e41e3f] text-white')}
                className={`w-8 h-8 rounded-lg bg-[#e41e3f] cursor-pointer shrink-0 transition ${selectedPostBgColor.includes('#e41e3f') ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              />

              {/* Dark Black Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-[#111111] text-white')}
                className={`w-8 h-8 rounded-lg bg-[#111111] cursor-pointer shrink-0 transition ${selectedPostBgColor.includes('#111111') ? 'ring-2 ring-blue-500 scale-105' : ''}`}
              />

              {/* Magenta Gradient Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white')}
                className={`w-8 h-8 rounded-lg bg-gradient-to-r from-fuchsia-600 to-rose-600 cursor-pointer shrink-0 transition`}
              />

              {/* Violet Gradient Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-gradient-to-r from-purple-600 to-indigo-600 text-white')}
                className={`w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer shrink-0 transition`}
              />

              {/* Sunset Orange Gradient Tile */}
              <div 
                onClick={() => setSelectedPostBgColor('bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white')}
                className={`w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 cursor-pointer shrink-0 transition`}
              />

              {/* @ Mention Icon Tile */}
              <button 
                type="button"
                onClick={() => setShowMentionSelector(!showMentionSelector)}
                className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 hover:bg-slate-100 transition cursor-pointer bg-white"
              >
                <AtSign size={18} />
              </button>
            </div>

            {/* Dynamic Hashtag Suggestions */}
            {showHashtagHelper && (
              <div className="p-3.5 border border-emerald-100 rounded-2xl bg-emerald-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#006a4e] flex items-center gap-1.5">
                    <Hash size={14} /> হ্যাশট্যাগ (#) নির্বাচন করুন
                  </span>
                  <button 
                    type="button"
                    onClick={() => { setShowHashtagHelper(false); setActiveHashtagQuery(''); }}
                    className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_HASHTAGS.filter(tag => !activeHashtagQuery || tag.toLowerCase().includes(activeHashtagQuery.toLowerCase())).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertHashtag(tag)}
                      className="text-xs font-black text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-100/80 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Location Badge */}
            {location && !showLocationPicker && (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-black rounded-xl border border-blue-100 shadow-xs">
                  <MapPin size={13} className="text-blue-600" />
                  <span>{location}</span>
                  <button 
                    type="button" 
                    onClick={() => { setLocation(''); setSelectedPresetLocation('none'); setCustomLocation(''); }}
                    className="ml-1 text-blue-400 hover:text-rose-500 bg-transparent border-0 cursor-pointer p-0.5"
                    title="লোকেশন মুছুন"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Location Picker Section (Toggleable) */}
            {showLocationPicker && (
              <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-600" /> স্থান / লোকেশন যুক্ত করুন
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowLocationPicker(false)}
                    className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={selectedPresetLocation}
                    onChange={(e) => handlePresetLocationChange(e.target.value)}
                    className="bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="none">📍 কোনো লোকেশন নেই</option>
                    {PUTHIYA_PRESET_LOCATIONS.map(pres => (
                      <option key={pres.id} value={pres.id}>{pres.name}</option>
                    ))}
                    <option value="other">✍️ অন্যান্য স্থান লিখুন...</option>
                  </select>

                  {selectedPresetLocation === 'other' && (
                    <input 
                      type="text"
                      placeholder="স্থানের নাম লিখুন..."
                      value={customLocation}
                      onChange={(e) => handleCustomLocationChange(e.target.value)}
                      className="bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Rich Shared Link Input (Toggleable) */}
            {showLinkInput && (
              <div className="p-4 border border-indigo-100 rounded-2xl bg-indigo-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <LinkIcon size={14} className="text-indigo-600" /> পোস্টে লিংক যুক্ত করুন
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowLinkInput(false)}
                    className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-indigo-700 uppercase mb-1 block">লিংক ইউআরএল (Link URL)</label>
                  <input 
                    type="text"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-indigo-700 uppercase mb-1 block">লিংকের শিরোনাম (Link Title)</label>
                  <input 
                    type="text"
                    placeholder="লিংকের সংক্ষিপ্ত বিবরণ বা শিরোনাম..."
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            {/* GIF Preview or Single/Multiple Images Gallery Preview */}
            {images.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">ছবি গ্যালারি ({images.length} টি ছবি)</label>
                <div className="grid grid-cols-2 gap-2 border border-slate-100 p-2 rounded-2xl bg-slate-50/50">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group shadow-sm">
                      <img src={img} alt="Post image" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black opacity-100 transition-opacity border-0 cursor-pointer"
                        title="ছবি মুছে ফেলুন"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-white hover:border-emerald-500 hover:text-emerald-500 transition-all border-0 cursor-pointer"
                  >
                    <Plus size={24} />
                    <span className="text-xs font-black mt-1">আরও যুক্ত করুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-[#006a4e] uppercase tracking-wider block">ভিডিও ফাইল প্রিভিউ</label>
                  <button 
                    type="button"
                    onClick={() => { setVideoPreview(null); setVideoFile(null); }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                  >
                    <Trash2 size={13} />
                    <span>মুছে ফেলুন</span>
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-md">
                  <PostVideoPlayer 
                    src={videoPreview} 
                    autoPlay={false} 
                    title={title || "ভিডিও প্রিভিউ"}
                  />
                </div>
              </div>
            )}

            {/* Document Preview */}
            {docName && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#006a4e] uppercase tracking-wider block">সংযুক্ত দলিল (Document)</label>
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-500">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{docName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Document Attachment</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setDocUrl(''); setDocName(''); }}
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                    title="দলিল মুছে ফেলুন"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Poll Section */}
            {showPoll && (
              <div className="p-4.5 border border-emerald-200 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-100 text-[#006a4e]">
                      <BarChart3 size={16} />
                    </span>
                    <span>নাগরিক পোল (Poll) সেটিংস</span>
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setShowPoll(false)} 
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition border-0 bg-transparent cursor-pointer"
                    title="পোল বাতিল করুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Poll Question Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    পোলের প্রশ্ন (Question)
                  </label>
                  <input 
                    type="text"
                    placeholder="যেমন: পুঠিয়া রাজবাড়ি চত্বরের সার্বিক উন্নয়নে কোন পদক্ষেপটি জরুরি?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="w-full text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-[#006a4e] focus:ring-1 focus:ring-[#006a4e] outline-none transition shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">প্রশ্ন খালি রাখলে পোস্টের শিরোনামটিই প্রশ্ন হিসেবে গণ্য হবে।</p>
                </div>

                {/* Poll Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    অপশনসমূহ (Options)
                  </label>
                  {pollOptions.map((option, idx) => (
                    <div key={option.id} className="flex gap-2 items-center">
                      <div className="flex-grow flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#006a4e] focus-within:ring-1 focus-within:ring-[#006a4e] transition shadow-xs">
                        <span className="text-xs font-black text-slate-400 mr-2 shrink-0">{idx + 1}.</span>
                        <input 
                          type="text"
                          placeholder={`অপশন ${idx + 1}`}
                          value={option.text}
                          onChange={(e) => updatePollOption(option.id, e.target.value)}
                          className="w-full text-xs sm:text-sm font-bold text-slate-700 outline-none bg-transparent"
                        />
                      </div>
                      {pollOptions.length > 2 && (
                        <button 
                          type="button"
                          onClick={() => removePollOption(option.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-0 bg-transparent cursor-pointer shrink-0"
                          title="অপশন মুছুন"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <button 
                      type="button"
                      onClick={addPollOption}
                      className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-black text-[#006a4e] bg-emerald-50 hover:bg-emerald-100/70 rounded-xl transition-colors border border-dashed border-emerald-300 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>নতুন অপশন যোগ করুন (+৫ পর্যন্ত)</span>
                    </button>
                  )}
                </div>

                {/* Poll Duration / End Time Selection */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                    পোলের সময়সীমা (Poll Duration)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '1_day', label: '১ দিন (২৪ ঘণ্টা)' },
                      { id: '3_days', label: '৩ দিন (জনপ্রিয়)' },
                      { id: '7_days', label: '৭ দিন (১ সপ্তাহ)' },
                      { id: '14_days', label: '১৪ দিন (২ সপ্তাহ)' },
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => setPollDuration(dur.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          pollDuration === dur.id
                            ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            {isScheduling && (
              <div className="p-4 border border-emerald-100 rounded-2xl bg-emerald-50/20 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] font-black text-emerald-700 uppercase mb-1 block">তারিখ নির্বাচন</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-white border border-emerald-100 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] font-black text-emerald-700 uppercase mb-1 block">সময় নির্বাচন</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-white border border-emerald-100 rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setIsScheduling(false)} 
                  className="self-end mb-2 text-emerald-400 hover:text-rose-500 border-0 bg-transparent cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Event Section */}
            {isEvent && (
              <div className="p-4 border border-violet-100 rounded-2xl bg-violet-50/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-violet-800 flex items-center gap-1.5">
                    <Calendar size={16} /> ইভেন্ট তৈরি করুন
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setIsEvent(false)} 
                    className="text-violet-400 hover:text-rose-500 border-0 bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-violet-700 uppercase mb-1 block">শুরুর তারিখ ও সময়</label>
                    <input 
                      type="datetime-local" 
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      className="w-full bg-white border border-violet-100 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-violet-700 uppercase mb-1 block">শেষের তারিখ ও সময়</label>
                    <input 
                      type="datetime-local" 
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full bg-white border border-violet-100 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-violet-700 uppercase mb-1 block">আয়োজক (Organizer)</label>
                    <input 
                      type="text" 
                      placeholder="আয়োজকের নাম"
                      value={eventOrganizer}
                      onChange={(e) => setEventOrganizer(e.target.value)}
                      className="w-full bg-white border border-violet-100 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-violet-700 uppercase mb-1 block">যোগাযোগ (Contact)</label>
                    <input 
                      type="text" 
                      placeholder="ফোন নম্বর বা ইমেইল"
                      value={eventContact}
                      onChange={(e) => setEventContact(e.target.value)}
                      className="w-full bg-white border border-violet-100 rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {showAdvancedSettings && (
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    ⚙️ অ্যাডভান্সড সেটিংস
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setShowAdvancedSettings(false)} 
                    className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">কমেন্ট করার অনুমতি দিন</span>
                      <span className="text-[10px] text-slate-500">অন্যান্য ব্যবহারকারীরা পোস্টে কমেন্ট করতে পারবেন</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">শেয়ার করার অনুমতি দিন</span>
                      <span className="text-[10px] text-slate-500">অন্যান্য ব্যবহারকারীরা পোস্ট শেয়ার করতে পারবেন</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={allowShare}
                      onChange={(e) => setAllowShare(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Dynamic Mentions overlay or list */}
            {showMentionSelector && (
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <UserPlus size={14} className="text-emerald-600" />
                    নাগরিক উল্লেখ করুন (Mention)
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setShowMentionSelector(false)}
                    className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer text-xs font-bold"
                  >
                    বন্ধ করুন
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="নাগরিকের নাম দিয়ে খুজুন..."
                  value={mentionSearch}
                  onChange={(e) => setMentionSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                />
                <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-1 rounded-xl border border-slate-100">
                  {filteredMentions.slice(0, 8).map(u => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => selectMention(u.name)}
                      className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-lg transition text-left border-0 cursor-pointer"
                    >
                      <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-400">{u.union}</p>
                      </div>
                    </button>
                  ))}
                  {filteredMentions.length === 0 && (
                    <p className="text-[10px] text-slate-400 font-bold py-4 text-center">কোনো নাগরিক পাওয়া যায়নি</p>
                  )}
                </div>
              </div>
            )}

            {/* Emergency details form (Only shown if isUrgent is active via the bottom scroll bar) */}
            {isUrgent && (
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70 shadow-sm shadow-rose-100 mb-3 space-y-4">
                {/* Emergency Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                    <span>🏷️</span>
                    <span>জরুরি ক্যাটাগরি নির্বাচন করুন (Category)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EMERGENCY_CATEGORIES.map(cat => {
                      const isSelected = emergencyCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setEmergencyCategory(cat.id)}
                          className={`p-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50/50 hover:border-rose-200'
                          }`}
                        >
                          <span className="text-base shrink-0">{cat.icon}</span>
                          <span className="truncate">{cat.label.split('(')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Location Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      ঘটনাস্থল / এলাকা (Location) *
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500">
                      <MapPin size={15} className="text-rose-500 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                        value={emergencyLocation}
                        onChange={(e) => setEmergencyLocation(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                      />
                    </div>
                    {/* Location suggestions */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {['পুঠিয়া সদর হাসপাতাল', 'পুঠিয়া বাজার', 'বানেশ্বর বাজার', 'মহাসড়ক'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setEmergencyLocation(chip)}
                          className="text-[10px] font-bold text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 cursor-pointer"
                        >
                          +{chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time / Urgency Duration */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      ঘটনার সময় / সময়সীমা (Time) *
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500">
                      <Clock size={15} className="text-blue-500 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="যেমন: আজ দুপুর ২:০০ / অবিলম্বে রক্ত প্রয়োজন"
                        value={emergencyTime}
                        onChange={(e) => setEmergencyTime(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      {['আজ দুপুর', 'আজ সকাল', 'অবিলম্বে জরুরি', 'গত ২৪ ঘণ্টা'].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setEmergencyTime(chip)}
                          className="text-[10px] font-bold text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 cursor-pointer"
                        >
                          +{chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Number & Contact Person */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      জরুরি ফোন নম্বর (Contact Phone) *
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                      <Phone size={15} className="text-[#006a4e] mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="যেমন: 01712-345678"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      যোগাযোগের ব্যক্তি / দায়িত্বশীল (Contact Person)
                    </label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                      <UserPlus size={15} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="যেমন: ডা. মাহফুজ / রোগীর ভাই"
                        value={emergencyContactPerson}
                        onChange={(e) => setEmergencyContactPerson(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Status Settings */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={16} className={verificationStatus === 'verified' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="text-xs font-black text-slate-800">তথ্য যাচাইকরণ স্ট্যাটাস (Verification Status)</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {verificationStatus === 'verified' ? '🛡️ যাচাইকৃত (Verified)' : '⚠️ অপুনঃযাচাইকৃত (Unverified)'}
                    </span>
                  </div>

                  {isAdmin ? (
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVerificationStatus('verified')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black border cursor-pointer transition ${
                            verificationStatus === 'verified'
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          ✓ যাচাইকৃত মার্ক করুন (Verified)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerificationStatus('unverified')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black border cursor-pointer transition ${
                            verificationStatus === 'unverified'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          ⚠️ অপুনঃযাচাইকৃত (Unverified)
                        </button>
                      </div>
                      {verificationStatus === 'verified' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                            যাচাইকারী কর্তৃপক্ষ (Verified By):
                          </label>
                          <input
                            type="text"
                            value={verifiedBy}
                            onChange={(e) => setVerifiedBy(e.target.value)}
                            placeholder="যেমন: পুঠিয়া উপজেলা প্রশাসন / পুঠিয়া থানা পুলিশ"
                            className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-snug">
                      💡 সাধারণ ব্যবহারকারীর পোস্ট প্রথমে <strong className="text-amber-700">অপুনঃযাচাইকৃত (Unverified)</strong> হিসেবে প্রকাশিত হবে এবং উপজেলা প্রশাসন বা দায়িত্বপ্রাপ্ত মডারেটর সত্যতা নিশ্চিত করে <strong className="text-emerald-700">যাচাইকৃত (Verified)</strong> স্ট্যাটাস প্রদান করবেন।
                    </p>
                  )}
                </div>

                {/* Warning Notice */}
                <div className="flex gap-2 items-start text-rose-800 bg-rose-100/60 p-2.5 rounded-xl border border-rose-200/60">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <p className="text-[10px] font-extrabold leading-snug">
                    সতর্কতা: জরুরি ফিচারটির অপব্যবহার করলে আপনার অ্যাকাউন্ট মডারেট বা সাসপেন্ড করা হতে পারে। অনুগ্রহ করে শুধুমাত্র প্রকৃত জরুরি পরিস্থিতিতে ব্যবহার করুন।
                  </p>
                </div>
              </div>
            )}

            {/* Attachment Options Vertical List (Matching Screenshot) */}
            <div className="pt-2 px-1 divide-y divide-slate-100">
              {/* Photos/Videos */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3.5 py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer text-left border-0 bg-transparent"
              >
                <ImageIcon size={24} className="text-[#45bd62]" />
                <span className="font-semibold text-slate-800 text-base">Photos/Videos</span>
              </button>

              {/* Music */}
              <button 
                type="button"
                onClick={() => setShowMediaLibraryModal(true)}
                className="w-full flex items-center gap-3.5 py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer text-left border-0 bg-transparent"
              >
                <Music size={24} className="text-[#f3425f]" />
                <span className="font-semibold text-slate-800 text-base">Music</span>
              </button>

              {/* Tag people */}
              <button 
                type="button"
                onClick={() => setShowMentionSelector(!showMentionSelector)}
                className="w-full flex items-center gap-3.5 py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer text-left border-0 bg-transparent"
              >
                <UserPlus size={24} className="text-[#1877f2]" />
                <span className="font-semibold text-slate-800 text-base">Tag people</span>
              </button>

              {/* Add location */}
              <button 
                type="button"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="w-full flex items-center gap-3.5 py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer text-left border-0 bg-transparent"
              >
                <MapPin size={24} className="text-[#f5533d]" />
                <span className="font-semibold text-slate-800 text-base">Add location</span>
              </button>

              {/* Feeling/activity */}
              <button 
                type="button"
                onClick={() => {
                  const feelings = ['সুখী 😊', 'উৎসাহিত 🔥', 'আনন্দিত 🎉', 'শান্ত 🌾', 'গর্বিত 👑'];
                  setFeeling(feelings[Math.floor(Math.random() * feelings.length)]);
                  toast.success('অনুভূতি যোগ করা হয়েছে!');
                }}
                className="w-full flex items-center gap-3.5 py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer text-left border-0 bg-transparent"
              >
                <Smile size={24} className="text-[#f7b125]" />
                <span className="font-semibold text-slate-800 text-base">Feeling/activity</span>
              </button>
            </div>

            {/* Hidden Input Refs */}
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleDocUpload} />
          </form>

          {/* Footer POST Button (Matching Screenshot) */}
          <div className="p-4 bg-white sticky bottom-0 z-20 border-t border-slate-100 shrink-0">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={(!content.trim() && !images.length && !videoPreview && !videoFile) || isPublishing}
              className={`w-full py-3.5 rounded-xl font-black text-base transition-all cursor-pointer shadow-md text-center border-0 ${
                (content.trim() || images.length > 0 || videoPreview || videoFile) && !isPublishing
                  ? 'bg-[#1877F2] hover:bg-blue-600 text-white active:scale-98'
                  : 'bg-[#1877F2]/40 text-white cursor-not-allowed'
              }`}
            >
              {isPublishing ? 'POSTING...' : 'POST'}
            </button>
          </div>
        </motion.div>
      </div>

      {showMediaLibraryModal && user && (
        <MyMediaLibraryModal
          userId={user.uid}
          userName={userProfile?.name || user.displayName || 'নাগরিক'}
          isOpen={showMediaLibraryModal}
          selectMode={true}
          onClose={() => setShowMediaLibraryModal(false)}
          onSelectMedia={(selectedMedia) => {
            if (selectedMedia.mediaType === 'image') {
              setImages(prev => [...prev, selectedMedia.originalUrl]);
              toast.success(`"${selectedMedia.originalFileName}" ছবিটি পোস্টে যুক্ত করা হয়েছে!`);
            } else if (selectedMedia.mediaType === 'video') {
              setVideoPreview(selectedMedia.originalUrl);
              toast.success(`"${selectedMedia.originalFileName}" ভিডিওটি পোস্টে যুক্ত করা হয়েছে!`);
            }
            setShowMediaLibraryModal(false);
          }}
        />
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Clock,
  MapPin, 
  X, 
  Trash2, 
  Reply, 
  Edit,
  Flag,
  Copy,
  Play, 
  Pause, 
  PhoneOff, 
  MicOff, 
  VideoOff, 
  ShieldCheck, 
  Shield,
  Archive,
  Radio,
  ArchiveRestore,
  Sparkles, 
  Settings, 
  MessageSquare,
  ChevronRight,
  ThumbsUp, 
  Heart, 
  MessageSquarePlus, 
  Info, 
  Volume2, 
  Bell, 
  Moon, 
  Lock,
  Bot,
  ChevronLeft,
  Film,
  Share2,
  ExternalLink,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  AlertCircle,
  FileText,
  Download,
  Activity,
  Paperclip,
  User,
  Mail,
  BellOff,
  Eye,
  Ban,
  AlertTriangle
} from 'lucide-react';
import { Conversation, ChatMessage, UserInfo } from '../../types';
import { chatService, ExtendedChatMessage, INITIAL_DEMO_CONVERSATIONS } from '../../services/chatService';
import { TypingIndicator, TypingUser } from './TypingIndicator';
import { MessagesTestLabModal } from './MessagesTestLabModal';
import { useAuth } from '../../contexts/AuthContext';
import { useCall } from '../../contexts/CallContext';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { collection, getDocs, query, limit, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { BlockBusinessService } from '../../services/businessLogic/services/blockService';
import { submitUserReport } from '../../services/moderationService';

import { SystemNotificationBanner } from '../common/SystemNotificationBanner';

interface AddaMessengerHubProps {
  initialChatId?: string;
  onClose?: () => void;
  isEmbedded?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '💐', '🤝', '💯'];

export const AddaMessengerHub: React.FC<AddaMessengerHubProps> = ({ 
  initialChatId, 
  onClose,
  isEmbedded = false 
}) => {
  const { user, userProfile, loginWithGoogle, logout } = useAuth();
  const { initiateCall } = useCall();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messageSearchResults, setMessageSearchResults] = useState<ExtendedChatMessage[]>([]);
  const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
  
  // Note state (Messenger Notes feature)
  const [userNote, setUserNote] = useState<string>(() => {
    return localStorage.getItem('messenger_user_note') || '';
  });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  // Settings & Assistant Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Settings toggles & Privacy Controls
  const [activeStatusEnabled, setActiveStatusEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [usersPresenceMap, setUsersPresenceMap] = useState<Record<string, { isOnline: boolean; lastSeen: number }>>({});
  const lastMsgTimesRef = useRef<Record<string, number>>({});
  const activeChatIdRef = useRef<string | null>(null);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [allowMessagesFrom, setAllowMessagesFrom] = useState<'everyone' | 'friends_only' | 'nobody'>('everyone');
  const [blockedUsersList, setBlockedUsersList] = useState<{ id: string; name: string; photoURL?: string }[]>([]);
  const [chatPermission, setChatPermission] = useState<{ allowed: boolean; reason?: string }>({ allowed: true });
  const [isTargetBlocked, setIsTargetBlocked] = useState(false);
  const [activeChatTab, setActiveChatTab] = useState<'chats' | 'requests' | 'archived'>('chats');
  const [settingsSubView, setSettingsSubView] = useState<'menu' | 'active_status' | 'notifications' | 'requests' | 'archive' | 'privacy'>('menu');
  const [messagePreviewsEnabled, setMessagePreviewsEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [archivedChatIds, setArchivedChatIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('messenger_archived_chats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleArchiveChat = (chatId: string) => {
    setArchivedChatIds(prev => {
      const updated = prev.includes(chatId) ? prev : [...prev, chatId];
      try {
        localStorage.setItem('messenger_archived_chats', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success('চ্যাটটি আর্কাইভে সরানো হয়েছে (Archived)');
  };

  const handleUnarchiveChat = (chatId: string) => {
    setArchivedChatIds(prev => {
      const updated = prev.filter(id => id !== chatId);
      try {
        localStorage.setItem('messenger_archived_chats', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success('চ্যাটটি আনআর্কাইভ করা হয়েছে (Unarchived)');
  };

  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState(false);
  const [chatSearchText, setChatSearchText] = useState('');

  // Conversation Details / Customisation states (Messenger style)
  const [customQuickReaction, setCustomQuickReaction] = useState('👍');
  const [showQuickReactionPicker, setShowQuickReactionPicker] = useState(false);
  const [customNickname, setCustomNickname] = useState('');
  const [disappearingTimer, setDisappearingTimer] = useState('Off');
  const [isChatMuted, setIsChatMuted] = useState(false);
  const [showEncryptionDetailsModal, setShowEncryptionDetailsModal] = useState(false);
  const [showCitizenProfileCard, setShowCitizenProfileCard] = useState(false);

  // Rich Messaging UI states
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<ExtendedChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ExtendedChatMessage | null>(null);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);
  const [reportingMessage, setReportingMessage] = useState<ExtendedChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  
  // Real registered users list from Firestore for "New Chat" modal
  const [registeredUsers, setRegisteredUsers] = useState<UserInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Calling states
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; partnerName: string; partnerAvatar: string; status: 'ringing' | 'connected' } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  // Real-time typing indicators state
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [chatTypingMap, setChatTypingMap] = useState<Record<string, TypingUser[]>>({});
  const typingTimeoutRef = useRef<any>(null);

  // Group creation form
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupDescInput, setGroupDescInput] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Group editing / management states
  const [isEditingGroupInfo, setIsEditingGroupInfo] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupPhoto, setEditGroupPhoto] = useState('');
  const [isAddingGroupMembers, setIsAddingGroupMembers] = useState(false);
  const [addMembersSelected, setAddMembersSelected] = useState<string[]>([]);

  // Profile & Media view modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isProfileModalOpen && activeChat && activeChat.type === 'group') {
      setEditGroupName(activeChat.name || '');
      setEditGroupDesc(activeChat.description || '');
      setEditGroupPhoto(activeChat.photoURL || '');
      setIsEditingGroupInfo(false);
      setIsAddingGroupMembers(false);
      setAddMembersSelected([]);
    }
  }, [isProfileModalOpen, activeChat]);
  const [selectedVideoModalUrl, setSelectedVideoModalUrl] = useState<string | null>(null);
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  const currentUserId = user?.uid || 'guest_user';
  const currentUserInfo: UserInfo = {
    uid: currentUserId,
    name: userProfile?.name || user?.displayName || 'সম্মানিত নাগরিক',
    photoURL: userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    isOnline: true
  };

  // Synthesize a beautiful, clean messenger chime using Web Audio API
  const playMessageChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First high tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.06, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);
      
      // Second higher tone, slightly delayed for a harmonious chime
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6 note
          gain2.gain.setValueAtTime(0.06, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.22);
        } catch {}
      }, 70);
    } catch (e) {
      console.warn("Chime playback error:", e);
    }
  };

  // Real-time Presence Sync & Visibility Change handler
  useEffect(() => {
    if (!currentUserId || currentUserId === 'guest_user') return;

    const setOnlineStatus = async (isOnline: boolean) => {
      try {
        await setDoc(doc(db, 'users', currentUserId), {
          uid: currentUserId,
          name: currentUserInfo.name,
          displayName: currentUserInfo.name,
          photoURL: currentUserInfo.photoURL,
          isOnline: isOnline,
          lastSeen: Date.now(),
          updatedAt: Date.now()
        }, { merge: true });
      } catch (err) {
        console.warn("Error setting presence status:", err);
      }
    };

    // Mark online on mount
    setOnlineStatus(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnlineStatus(true);
      } else {
        setOnlineStatus(false);
      }
    };

    const handleBeforeUnload = () => {
      setOnlineStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setOnlineStatus(false);
    };
  }, [currentUserId, currentUserInfo.name, currentUserInfo.photoURL]);

  // Subscribe to `/users` collection for real-time presence states of all citizens
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const presence: Record<string, { isOnline: boolean; lastSeen: number }> = {};
      snapshot.forEach((doc) => {
        const d = doc.data();
        presence[doc.id] = {
          isOnline: d.isOnline ?? false,
          lastSeen: d.lastSeen || Date.now()
        };
      });
      setUsersPresenceMap(presence);
    }, (err) => {
      console.warn("Users presence subscription note:", err);
    });
    return () => unsub();
  }, []);

  // Update activeChatIdRef for message incoming checking
  useEffect(() => {
    activeChatIdRef.current = activeChat?.id || null;
  }, [activeChat?.id]);

  // Synchronize failed messages when internet connection returns
  useEffect(() => {
    if (!currentUserId) return;

    const handleOnline = () => {
      toast.success('নেটওয়ার্ক সংযোগ ফিরে এসেছে! অফলাইন বার্তাগুলো সিঙ্ক করা হচ্ছে...');
      chatService.syncFailedMessages(currentUserId);
    };

    const handleOffline = () => {
      toast.error('ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। আপনি অফলাইন মুডে আছেন।');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check in case we just loaded and are online
    if (navigator.onLine) {
      chatService.syncFailedMessages(currentUserId);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUserId]);

  // Detect new incoming messages and trigger chimes & toast notifications
  useEffect(() => {
    if (conversations.length === 0) return;

    const isFirstLoad = Object.keys(lastMsgTimesRef.current).length === 0;

    conversations.forEach((chat) => {
      const chatTime = chat.lastMessageTime || 0;
      const prevTime = lastMsgTimesRef.current[chat.id];

      // If a message has arrived after our previous recorded timestamp
      if (prevTime !== undefined && chatTime > prevTime) {
        // Ensure it is not sent by ourselves
        if (chat.lastMessageSenderId && chat.lastMessageSenderId !== currentUserId) {
          playMessageChime();

          const isActiveChat = activeChatIdRef.current === chat.id;
          const isTabHidden = typeof document !== 'undefined' && document.hidden;

          // If the user is currently in a different chat OR the tab is hidden
          if (!isActiveChat || isTabHidden) {
            const senderDetail = chat.participantDetails?.[chat.lastMessageSenderId];
            const senderName = senderDetail?.name || (chat as any).lastMessageSenderName || 'নাগরিক';
            const senderPhoto = senderDetail?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
            const messageSnippet = chat.lastMessage || 'নতুন একটি মেসেজ পাঠিয়েছেন';

            toast.custom((t) => {
              const formattedTime = new Date(chatTime).toLocaleTimeString('bn-BD', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
              });
              const unreadNum = getUnreadCount(chat) || 1;

              return (
                <div
                  onClick={() => {
                    toast.dismiss(t.id);
                    setActiveChat(chat);
                  }}
                  className={`max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all duration-300 transform translate-y-0 active:scale-98 relative overflow-hidden`}
                >
                  {/* Premium top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                  <div className="flex-1 w-0">
                    <div className="flex items-start">
                      {/* Avatar with dynamic Unread Count Badge */}
                      <div className="shrink-0 pt-0.5 relative">
                        <img
                          className="h-11 w-11 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                          src={senderPhoto}
                          alt={senderName}
                        />
                        {/* Unread badge on top-right of avatar */}
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border border-white shadow-sm animate-pulse">
                          {unreadNum}
                        </span>
                      </div>

                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span className="text-blue-600">🔔</span>
                            {senderName}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                            {formattedTime}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-600 line-clamp-2 leading-relaxed">
                          {messageSnippet}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                            নতুন বার্তা এসেছে (পড়তে ট্যাপ করুন)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 shrink-0 flex items-center border-l border-slate-100 pl-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t.id);
                      }}
                      className="border-0 bg-transparent rounded-lg px-2 py-1 flex items-center justify-center text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none transition cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              );
            }, {
              duration: 5000,
              position: 'top-right'
            });
          }
        }
      }

      // Track last handled message timestamp
      lastMsgTimesRef.current[chat.id] = chatTime;
    });

    if (isFirstLoad) {
      // Warm up ref on first load so we don't display old historic messages as new notifications
      conversations.forEach((chat) => {
        lastMsgTimesRef.current[chat.id] = chat.lastMessageTime || 0;
      });
    }
  }, [conversations, currentUserId]);

  // 1. Subscribe to conversations from Firestore and publish active presence
  useEffect(() => {
    fetchRegisteredUsers();

    const unsub = chatService.subscribeToConversations(currentUserId, (data) => {
      setConversations(data);
      if (initialChatId) {
        const found = data.find(c => c.id === initialChatId);
        if (found) {
          setActiveChat(found);
        }
      }
    });
    return () => unsub();
  }, [currentUserId, initialChatId]);

  // Keep activeChat synchronized with latest conversations data (including groups, participant details, etc.)
  useEffect(() => {
    if (activeChat) {
      const updated = conversations.find(c => c.id === activeChat.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(activeChat)) {
        setActiveChat(updated);
      }
    }
  }, [conversations, activeChat?.id]);

  // 2. Select initial chat if available or fetch from Firestore/local if not in list
  useEffect(() => {
    if (!initialChatId) return;

    const match = conversations.find(c => c.id === initialChatId);
    if (match) {
      if (activeChat?.id !== match.id) {
        setActiveChat(match);
      }
      return;
    }

    // Fallback: check localStorage
    try {
      const localSaved: Conversation[] = JSON.parse(localStorage.getItem(`adda_conversations_${currentUserId}`) || '[]');
      const localMatch = localSaved.find(c => c.id === initialChatId);
      if (localMatch) {
        setActiveChat(localMatch);
        setConversations(prev => prev.some(c => c.id === localMatch.id) ? prev : [localMatch, ...prev]);
        return;
      }
    } catch {}

    // Fallback: fetch from Firestore doc directly
    const fetchDirect = async () => {
      try {
        const snap = await getDoc(doc(db, 'conversations', initialChatId));
        if (snap.exists()) {
          const convData = { id: snap.id, ...snap.data() } as Conversation;
          setActiveChat(convData);
          setConversations(prev => prev.some(c => c.id === convData.id) ? prev : [convData, ...prev]);
        }
      } catch (err) {
        console.warn("Could not load direct conversation doc:", err);
      }
    };
    fetchDirect();
  }, [conversations, initialChatId, currentUserId]);

  // 3. Subscribe to active chat messages
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const isPendingRequestForUs = activeChat.requestStatus === 'pending' && activeChat.requestedBy !== currentUserId;

    if (!isPendingRequestForUs) {
      // Mark as read
      chatService.markAsRead(activeChat.id, currentUserId);
      setConversations(prev => prev.map(c => c.id === activeChat.id ? {
        ...c,
        unreadCount: { ...c.unreadCount, [currentUserId]: 0 }
      } : c));
    }

    const unsub = chatService.subscribeToMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
      
      // Auto-mark as read if we are looking at this active conversation in real-time
      const hasUnread = msgs.some(m => m.senderId !== currentUserId && m.status !== 'seen');
      if (hasUnread && !isPendingRequestForUs) {
        chatService.markAsRead(activeChat.id, currentUserId);
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    });

    return () => unsub();
  }, [activeChat?.id, currentUserId]);

  // 3.1. Subscribe to real-time typing status for active chat
  useEffect(() => {
    if (!activeChat) {
      setTypingUsers([]);
      setIsPartnerTyping(false);
      return;
    }

    const unsubTyping = chatService.subscribeToTyping(activeChat.id, currentUserId, (users) => {
      setTypingUsers(users);
      setIsPartnerTyping(users.length > 0);
      if (users.length > 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    });

    return () => {
      unsubTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      chatService.setTypingStatus(
        activeChat.id,
        currentUserId,
        currentUserInfo.name,
        false,
        currentUserInfo.photoURL
      );
    };
  }, [activeChat?.id, currentUserId, currentUserInfo.name, currentUserInfo.photoURL]);

  // 3.2. Global typing listener for conversation list live indicators
  useEffect(() => {
    const handleGlobalTyping = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.conversationId || detail.userId === currentUserId) return;

      setChatTypingMap(prev => {
        const existing = prev[detail.conversationId] || [];
        if (detail.isTyping) {
          const filtered = existing.filter(u => u.uid !== detail.userId);
          return {
            ...prev,
            [detail.conversationId]: [
              ...filtered, 
              { uid: detail.userId, name: detail.userName, photoURL: detail.userPhoto }
            ]
          };
        } else {
          return {
            ...prev,
            [detail.conversationId]: existing.filter(u => u.uid !== detail.userId)
          };
        }
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('adda_typing_event', handleGlobalTyping);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('adda_typing_event', handleGlobalTyping);
      }
    };
  }, [currentUserId]);

  // 4. Voice Recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // 5. Call duration timer
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall?.status]);

  // Fetch registered users for new chat modal
  const fetchRegisteredUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(30));
      const snapshot = await getDocs(q);
      const userList: UserInfo[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (docSnap.id !== currentUserId) {
          userList.push({
            uid: docSnap.id,
            name: d.displayName || d.name || 'পুঠিয়ার নাগরিক',
            photoURL: d.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            isOnline: d.isOnline ?? true
          });
        }
      });
      setRegisteredUsers(userList);
    } catch (e) {
      console.warn("Could not load users collection:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Helper to reliably find the conversation partner
  const getOtherParticipant = (chat: Conversation): UserInfo | null => {
    if (!chat.participantDetails) return null;
    const detailKeys = Object.keys(chat.participantDetails);
    if (detailKeys.length === 0) return null;
    const partnerKey = detailKeys.find(id => id !== currentUserId && id !== 'guest_or_user') 
      || detailKeys.find(id => id !== currentUserId) 
      || detailKeys[0];
    return chat.participantDetails[partnerKey] || null;
  };

  // Load privacy and blocked users
  const loadPrivacyAndBlockedUsers = async () => {
    if (!currentUserId) return;
    try {
      const uSnap = await getDoc(doc(db, 'users', currentUserId));
      if (uSnap.exists()) {
        const data = uSnap.data();
        if (data.privacySettings?.allowMessagesFrom) {
          setAllowMessagesFrom(data.privacySettings.allowMessagesFrom);
        }
        if (data.privacySettings?.activeStatusEnabled !== undefined) {
          setActiveStatusEnabled(data.privacySettings.activeStatusEnabled);
        }
        if (data.privacySettings?.soundEnabled !== undefined) {
          setSoundEnabled(data.privacySettings.soundEnabled);
        }
        
        const blockedIds: string[] = data.blockedUserIds || [];
        if (blockedIds.length > 0) {
          const list: { id: string; name: string; photoURL?: string }[] = [];
          for (const bId of blockedIds) {
            try {
              const bSnap = await getDoc(doc(db, 'users', bId));
              if (bSnap.exists()) {
                const bData = bSnap.data();
                list.push({
                  id: bId,
                  name: bData.displayName || bData.name || 'ব্লকড ব্যবহারকারী',
                  photoURL: bData.photoURL
                });
              } else {
                list.push({ id: bId, name: 'ব্যবহারকারী (' + bId.slice(0, 6) + ')' });
              }
            } catch {}
          }
          setBlockedUsersList(list);
        } else {
          setBlockedUsersList([]);
        }
      }
    } catch (e) {
      console.warn("Could not load privacy settings:", e);
    }
  };

  const handleUpdatePrivacySetting = async (val: 'everyone' | 'friends_only' | 'nobody') => {
    setAllowMessagesFrom(val);
    if (!currentUserId) return;
    try {
      await setDoc(doc(db, 'users', currentUserId), {
        privacySettings: {
          allowMessagesFrom: val,
          activeStatusEnabled,
          soundEnabled
        }
      }, { merge: true });
      toast.success('মেসেজিং প্রাইভেসি সফলভাবে সেভ করা হয়েছে');
    } catch (e) {
      toast.error('সেটিংস সেভ করতে সমস্যা হয়েছে');
    }
  };

  const handleUpdateActiveStatus = async (val: boolean) => {
    setActiveStatusEnabled(val);
    if (!currentUserId) return;
    try {
      await setDoc(doc(db, 'users', currentUserId), {
        privacySettings: {
          allowMessagesFrom,
          activeStatusEnabled: val,
          soundEnabled
        }
      }, { merge: true });
      toast.success(val ? 'অনলাইন স্ট্যাটাস চালু করা হয়েছে' : 'অনলাইন স্ট্যাটাস বন্ধ করা হয়েছে');
    } catch (e) {
      toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleUpdateSoundEnabled = async (val: boolean) => {
    setSoundEnabled(val);
    if (!currentUserId) return;
    try {
      await setDoc(doc(db, 'users', currentUserId), {
        privacySettings: {
          allowMessagesFrom,
          activeStatusEnabled,
          soundEnabled: val
        }
      }, { merge: true });
      toast.success(val ? 'নোটিফিকেশন শব্দ চালু করা হয়েছে' : 'নোটিফিকেশন শব্দ বন্ধ করা হয়েছে');
    } catch (e) {
      toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleBlockUser = async (targetId: string, targetName?: string) => {
    if (!currentUserId) return;
    try {
      const res = await BlockBusinessService.blockUser(currentUserId, targetId, targetName);
      if (res.success) {
        toast.success(`${targetName || 'ব্যবহারকারী'} কে ব্লক করা হয়েছে`);
        setIsTargetBlocked(true);
        setChatPermission({ allowed: false, reason: 'আপনি এই ব্যবহারকারীকে ব্লক করেছেন। মেসেজ পাঠাতে আনব্লক করুন।' });
        setIsProfileModalOpen(false);
        loadPrivacyAndBlockedUsers();
      } else {
        toast.error(res.error || 'ব্লক করতে সমস্যা হয়েছে');
      }
    } catch (e) {
      toast.error('ব্লক করার সময় ত্রুটি ঘটেছে');
    }
  };

  const handleUnblockUser = async (targetId: string, targetName?: string) => {
    if (!currentUserId) return;
    try {
      const res = await BlockBusinessService.unblockUser(currentUserId, targetId);
      if (res.success) {
        toast.success(`${targetName || 'ব্যবহারকারী'} কে আনব্লক করা হয়েছে`);
        setIsTargetBlocked(false);
        setChatPermission({ allowed: true });
        setBlockedUsersList(prev => prev.filter(b => b.id !== targetId));
      } else {
        toast.error(res.error || 'আনব্লক করতে সমস্যা হয়েছে');
      }
    } catch (e) {
      toast.error('আনব্লক করার সময় ত্রুটি ঘটেছে');
    }
  };

  // Check messaging permission when activeChat or currentUserId changes
  useEffect(() => {
    if (!activeChat || activeChat.type === 'group') {
      setChatPermission({ allowed: true });
      setIsTargetBlocked(false);
      return;
    }

    const partner = getOtherParticipant(activeChat);
    if (!partner?.uid) {
      setChatPermission({ allowed: true });
      setIsTargetBlocked(false);
      return;
    }

    const verifyPermission = async () => {
      const perm = await chatService.canUserMessage(currentUserId, partner.uid);
      setChatPermission(perm);
      
      const blockStatus = await chatService.isUserBlocked(currentUserId, partner.uid);
      setIsTargetBlocked(blockStatus.isBlocked);
    };

    verifyPermission();
  }, [activeChat?.id, currentUserId]);

  useEffect(() => {
    if (isSettingsModalOpen) {
      loadPrivacyAndBlockedUsers();
    }
  }, [isSettingsModalOpen, currentUserId]);

  // Get chat display name
  const getChatName = (chat: Conversation) => {
    if (chat.type === 'group') return chat.name || 'গ্রুপ চ্যাট';
    const other = getOtherParticipant(chat);
    return other?.name || chat.name || 'পুঠিয়ার নাগরিক';
  };

  // Get chat photo
  const getChatPhoto = (chat: Conversation) => {
    if (chat.type === 'group') return chat.photoURL || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200';
    const other = getOtherParticipant(chat);
    return other?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
  };

  // Check online status
  const isChatOnline = (chat: Conversation) => {
    if (chat.type === 'group') return false;
    const other = getOtherParticipant(chat);
    if (!other) return false;
    
    // Look up dynamic status from usersPresenceMap if available
    const dynamicPresence = usersPresenceMap[other.uid];
    if (dynamicPresence) {
      return Boolean(dynamicPresence.isOnline || (dynamicPresence.lastSeen && Date.now() - dynamicPresence.lastSeen < 5 * 60 * 1000));
    }
    
    return Boolean(other.isOnline || (other.lastSeen && Date.now() - other.lastSeen < 10 * 60 * 1000));
  };

  // Helper to get formatted last seen status text
  const getLastSeenText = (chat: Conversation) => {
    if (chat.type === 'group') return '';
    const other = getOtherParticipant(chat);
    if (!other) return 'Offline';
    
    const dynamicPresence = usersPresenceMap[other.uid];
    if (dynamicPresence) {
      if (dynamicPresence.isOnline) {
        return '🟢 Active now';
      } else if (dynamicPresence.lastSeen) {
        try {
          return `⚪ Last seen: ${formatDistanceToNow(new Date(dynamicPresence.lastSeen), { locale: bn, addSuffix: true })}`;
        } catch (e) {
          return '⚪ Offline';
        }
      }
    }
    
    if (other.isOnline) {
      return '🟢 Active now';
    } else if (other.lastSeen) {
      try {
        return `⚪ Last seen: ${formatDistanceToNow(new Date(other.lastSeen), { locale: bn, addSuffix: true })}`;
      } catch (e) {
        return '⚪ Offline';
      }
    }
    
    return '⚪ Offline';
  };

  // Helper to get unread count
  const getUnreadCount = (chat: Conversation) => {
    if (!chat.unreadCount) return 0;
    if (chat.unreadCount[currentUserId] !== undefined) return chat.unreadCount[currentUserId];
    return chat.unreadCount['guest_or_user'] || 0;
  };

  // Filter conversations based on tab (Chats vs Requests vs Archived) and Search term
  const filteredConversations = conversations.filter(chat => {
    // 1. Tab check
    if (activeChatTab === 'chats') {
      const isRequestForUs = chat.requestStatus === 'pending' && chat.requestedBy !== currentUserId;
      if (isRequestForUs) return false;
      if (archivedChatIds.includes(chat.id)) return false;
    } else if (activeChatTab === 'requests') {
      const isRequestForUs = chat.requestStatus === 'pending' && chat.requestedBy !== currentUserId;
      if (!isRequestForUs) return false;
    } else if (activeChatTab === 'archived') {
      if (!archivedChatIds.includes(chat.id)) return false;
    }

    // 2. Search check
    const name = getChatName(chat).toLowerCase();
    const lastMsg = (chat.lastMessage || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || lastMsg.includes(searchTerm.toLowerCase());
  });

  const archivedConversations = useMemo(() => {
    return conversations.filter(c => archivedChatIds.includes(c.id));
  }, [conversations, archivedChatIds]);

  const pendingRequestsConversations = useMemo(() => {
    return conversations.filter(chat => chat.requestStatus === 'pending' && chat.requestedBy !== currentUserId);
  }, [conversations, currentUserId]);

  // Search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMessageSearchResults([]);
      setIsGlobalSearchLoading(false);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsGlobalSearchLoading(true);
      if (currentUserId) {
        const { messages } = await chatService.searchConversationsAndMessages(searchTerm, currentUserId);
        setMessageSearchResults(messages as ExtendedChatMessage[]);
      }
      setIsGlobalSearchLoading(false);
    }, 500);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentUserId]);

  const pendingRequestsCount = useMemo(() => {
    return conversations.filter(chat => chat.requestStatus === 'pending' && chat.requestedBy !== currentUserId).length;
  }, [conversations, currentUserId]);

  // Handle Input text changes and emit typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (activeChat) {
      chatService.setTypingStatus(
        activeChat.id,
        currentUserId,
        currentUserInfo.name,
        val.length > 0,
        currentUserInfo.photoURL
      );

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (val.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          chatService.setTypingStatus(
            activeChat.id,
            currentUserId,
            currentUserInfo.name,
            false,
            currentUserInfo.photoURL
          );
        }, 3000);
      }
    }
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || !activeChat) return;

    if (editingMessage) {
      await chatService.editMessage(activeChat.id, editingMessage.id, textToSend);
      setEditingMessage(null);
      if (customText === undefined) setInputText('');
      toast.success('বার্তা সফলভাবে সম্পাদন করা হয়েছে');
      return;
    }

    if (customText === undefined) setInputText('');
    const replyData = replyingMessage ? {
      id: replyingMessage.id,
      senderName: replyingMessage.senderId === currentUserId ? 'আপনি' : getChatName(activeChat),
      text: replyingMessage.text
    } : undefined;
    setReplyingMessage(null);
    setIsEmojiPickerOpen(false);

    // Clear typing status immediately upon sending
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatService.setTypingStatus(
      activeChat.id,
      currentUserId,
      currentUserInfo.name,
      false,
      currentUserInfo.photoURL
    );

    await chatService.sendMessage(
      activeChat.id,
      currentUserId,
      textToSend,
      activeChat.participants,
      {
        type: 'text',
        replyToMessage: replyData
      }
    );

    // Auto-scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    // Smart simulated Bengali response for interactive feel if partner is standalone demo bot
    const otherParticipantId = activeChat.participants.find(p => p !== currentUserId);
    if (otherParticipantId && otherParticipantId.startsWith('demo_bot_')) {
      setTimeout(() => {
        chatService.setTypingStatus(
          activeChat.id,
          otherParticipantId,
          getChatName(activeChat),
          true,
          getChatPhoto(activeChat)
        );
      }, 700);

      setTimeout(async () => {
        chatService.setTypingStatus(
          activeChat.id,
          otherParticipantId,
          getChatName(activeChat),
          false,
          getChatPhoto(activeChat)
        );
        const replyBank = [
          'জি ভাই, পেয়েছি! ধন্যবাদ আপনাকে।',
          'ইনশাআল্লাহ, বিকেলে বিস্তারিত কথা হচ্ছে।',
          'অনেক ধন্যবাদ আপডেট দেওয়ার জন্য!',
          'হ্যাঁ ভাই, একদম সঠিক কথা বলেছেন। 👍',
          'ঠিক আছে ভাইয়া, আমি বিষয়টি দেখছি।'
        ];
        const randomReply = replyBank[Math.floor(Math.random() * replyBank.length)];
        
        await chatService.sendMessage(
          activeChat.id,
          otherParticipantId,
          randomReply,
          activeChat.participants,
          { type: 'text' }
        );
      }, 2500);
    }
  };

  // Quick Thumbs Up / Custom Reaction Like
  const handleSendThumbsUp = async () => {
    if (!activeChat) return;
    await handleSendMessage(undefined, customQuickReaction || '👍');
  };

  // Send Voice note
  const handleStopAndSendVoice = async () => {
    if (!activeChat) return;
    setIsRecordingVoice(false);
    const duration = recordingSeconds || 3;
    
    await chatService.sendMessage(
      activeChat.id,
      currentUserId,
      '🎙️ ভয়েস বার্তা',
      activeChat.participants,
      {
        type: 'voice',
        audioDuration: duration
      }
    );
    toast.success('ভয়েস বার্তা পাঠানো হয়েছে');
  };

  // Send Image, Video or File attachment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    // Check size limit (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('ফাইলের সাইজ ২৫ মেগাবাইটের বেশি হতে পারবে না');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      let msgType: 'image' | 'video' | 'file' = 'file';
      let defaultText = `📄 ${file.name}`;

      if (isImage) {
        msgType = 'image';
        defaultText = '📷 ছবি পাঠানো হয়েছে';
      } else if (isVideo) {
        msgType = 'video';
        defaultText = `🎬 ভিডিও: ${file.name}`;
      }

      await chatService.sendMessage(
        activeChat.id,
        currentUserId,
        defaultText,
        activeChat.participants,
        {
          type: msgType as any,
          mediaUrl: base64Url,
          fileName: file.name,
          fileSize: file.size
        }
      );
      toast.success(isImage ? 'ছবি পাঠানো হয়েছে' : isVideo ? 'ভিডিও পাঠানো হয়েছে' : 'ফাইল পাঠানো হয়েছে');
    };
    reader.readAsDataURL(file);
    // Reset file input value so user can re-select same file if needed
    if (e.target) e.target.value = '';
  };

  // Share Live Location
  const handleShareLocation = async () => {
    if (!activeChat) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await chatService.sendMessage(
            activeChat.id,
            currentUserId,
            '📍 আমার লোকেশন: পুঠিয়া, রাজশাহী',
            activeChat.participants,
            {
              type: 'location',
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: 'পুঠিয়া রাজবাড়ি চত্বর, পুঠিয়া'
              }
            }
          );
          toast.success('লোকেশন শেয়ার করা হয়েছে');
        },
        async () => {
          await chatService.sendMessage(
            activeChat.id,
            currentUserId,
            '📍 আমার লোকেশন: পুঠিয়া বাজার চত্বর',
            activeChat.participants,
            {
              type: 'location',
              location: {
                lat: 24.3686,
                lng: 88.8354,
                address: 'পুঠিয়া বাজার চত্বর, পুঠিয়া'
              }
            }
          );
          toast.success('লোকেশন শেয়ার করা হয়েছে');
        }
      );
    }
  };

  // Start Call Handler
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeChat) return;
    const partnerName = getChatName(activeChat);
    const partnerAvatar = getChatPhoto(activeChat);
    const otherId = activeChat.participants.find(p => p !== currentUserId) || '';

    // Initiate in CallContext
    initiateCall({
      uid: otherId,
      name: partnerName,
      photoURL: partnerAvatar
    }, type);

    setActiveCall({
      type,
      partnerName,
      partnerAvatar,
      status: 'ringing'
    });

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2500);
  };

  // Save Note
  const handleSaveNote = () => {
    const trimmed = noteInput.trim();
    setUserNote(trimmed);
    localStorage.setItem('messenger_user_note', trimmed);
    setIsNoteModalOpen(false);
    toast.success(trimmed ? 'নোট শেয়ার করা হয়েছে!' : 'নোট মুছে ফেলা হয়েছে');
  };

  // Create Direct Chat with active citizen or user
  const handleStartChatWithCitizen = async (citizen: { id: string; name: string; avatar: string; online: boolean }) => {
    const targetUser: UserInfo = {
      uid: citizen.id,
      name: citizen.name,
      photoURL: citizen.avatar,
      isOnline: citizen.online
    };
    const convId = await chatService.startDirectConversation(currentUserInfo, targetUser);
    setIsNewChatModalOpen(false);
    
    // Find or set active chat
    const updatedList = await new Promise<Conversation[]>((resolve) => {
      chatService.subscribeToConversations(currentUserId, (list) => resolve(list));
    });
    const found = updatedList.find(c => c.id === convId);
    if (found) {
      setActiveChat(found);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async () => {
    if (!groupNameInput.trim()) {
      toast.error('অনুগ্রহ করে গ্রুপের নাম লিখুন');
      return;
    }

    const members: UserInfo[] = registeredUsers
      .filter(u => selectedGroupMembers.includes(u.uid))
      .map(u => ({ uid: u.uid, name: u.name, photoURL: u.photoURL, isOnline: u.isOnline }));

    await chatService.createGroupConversation(
      currentUserInfo,
      groupNameInput.trim(),
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200',
      groupDescInput.trim() || 'পুঠিয়া আড্ডা গ্রুপ',
      members
    );

    toast.success(`"${groupNameInput}" গ্রুপ তৈরি হয়েছে!`);
    setIsNewGroupModalOpen(false);
    setGroupNameInput('');
    setGroupDescInput('');
    setSelectedGroupMembers([]);
  };

  // Group Management Event Handlers
  const handleUpdateGroupInfo = async () => {
    if (!activeChat || !editGroupName.trim()) {
      toast.error('অনুগ্রহ করে গ্রুপের নাম দিন');
      return;
    }
    try {
      await chatService.updateGroupConversation(
        activeChat.id,
        currentUserInfo,
        editGroupName.trim(),
        editGroupPhoto.trim(),
        editGroupDesc.trim()
      );
      toast.success('গ্রুপের তথ্য সফলভাবে পরিবর্তন করা হয়েছে!');
      setIsEditingGroupInfo(false);
    } catch (e) {
      toast.error('গ্রুপের তথ্য পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleAddGroupMembers = async () => {
    if (!activeChat || addMembersSelected.length === 0) return;
    try {
      const usersToAdd = registeredUsers
        .filter(u => addMembersSelected.includes(u.uid))
        .map(u => ({ uid: u.uid, name: u.name, photoURL: u.photoURL, isOnline: u.isOnline }));

      await chatService.addGroupMembers(activeChat.id, currentUserInfo, usersToAdd);
      toast.success('নতুন সদস্য যুক্ত করা হয়েছে!');
      setIsAddingGroupMembers(false);
      setAddMembersSelected([]);
    } catch (e) {
      toast.error('সদস্য যুক্ত করতে সমস্যা হয়েছে');
    }
  };

  const handleRemoveGroupMember = async (memberId: string, memberName: string) => {
    if (!activeChat) return;
    try {
      await chatService.removeGroupMember(activeChat.id, currentUserInfo, memberId, memberName);
      toast.success(`${memberName}-কে সরানো হয়েছে`);
    } catch (e) {
      toast.error('সদস্য সরাতে সমস্যা হয়েছে');
    }
  };

  const handleToggleGroupAdmin = async (memberId: string, memberName: string, makeAdmin: boolean) => {
    if (!activeChat) return;
    try {
      await chatService.toggleGroupAdmin(activeChat.id, currentUserInfo, memberId, memberName, makeAdmin);
      toast.success(`${memberName}-কে ${makeAdmin ? 'এডমিন বানানো হয়েছে' : 'এডমিন পদ থেকে সরানো হয়েছে'}`);
    } catch (e) {
      toast.error('এডমিন পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeChat) return;
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই গ্রুপটি ত্যাগ করতে চান?')) {
      try {
        await chatService.leaveGroup(activeChat.id, currentUserInfo);
        toast.success('আপনি সফলভাবে গ্রুপ ত্যাগ করেছেন');
        setIsProfileModalOpen(false);
        setActiveChat(null);
      } catch (e) {
        toast.error('গ্রুপ ত্যাগ করতে সমস্যা হয়েছে');
      }
    }
  };

  // AI Assistant Ask
  const handleAskAi = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      const text = aiPrompt.toLowerCase();
      if (text.includes('মেসেজ') || text.includes('বার্তা')) {
        setAiResponse(`পরামর্শকৃত খসড়া:\n"আসসালামু আলাইকুম! কেমন আছেন? পুঠিয়ার নাগরিক সেবা সংক্রান্ত বিষয়ে একটু জানতে চেয়েছিলাম। সময় হলে জানাবেন।"`);
      } else if (text.includes('রাজবাড়ি') || text.includes('ঘুরতে')) {
        setAiResponse(`পুঠিয়া রাজবাড়ি কমপ্লেক্স প্রতিদিন সকাল ৯টা থেকে বিকেল ৫টা পর্যন্ত খোলা থাকে। শিব মন্দির ও দোলে মঞ্চে চমৎকার আবহাওয়া রয়েছে!`);
      } else {
        setAiResponse(`আপনার বার্তার প্রেক্ষিতে খসড়া:\n"ধন্যবাদ আপনার বার্তার জন্য! পুঠিয়া আড্ডায় যুক্ত থাকতে পেরে আনন্দিত।"`);
      }
    }, 1000);
  };

  // Helper to parse arbitrary timestamp formats safely
  const parseTimestamp = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp === 'object' && timestamp?.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    return null;
  };

  // Human-readable message time (e.g. "10:45 AM" or "7:12 PM")
  const formatMessageTime = (timestamp: any): string => {
    const date = parseTimestamp(timestamp);
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Full detailed timestamp for hover tooltip (e.g. "Thursday, Sep 17, 2026, 7:44 PM")
  const formatFullMessageDateTime = (timestamp: any): string => {
    const date = parseTimestamp(timestamp);
    if (!date) return '';
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Day separator indicator between different message dates
  const getMessageDateDivider = (currTimestamp: any, prevTimestamp?: any): string | null => {
    const currDate = parseTimestamp(currTimestamp);
    if (!currDate) return null;

    if (prevTimestamp) {
      const prevDate = parseTimestamp(prevTimestamp);
      if (prevDate && currDate.toDateString() === prevDate.toDateString()) {
        return null;
      }
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (currDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (currDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (currDate.getFullYear() === today.getFullYear()) {
      return currDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return currDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Highlight matching search text
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(search)})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 font-bold px-0.5 rounded-xs shadow-3xs select-all">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-white h-[100dvh] md:h-[calc(100dvh-20px)] w-full flex flex-col md:flex-row relative overflow-hidden">
      <div className="w-full shrink-0 z-30">
        <SystemNotificationBanner />
      </div>

      {/* =========================================================================
          LEFT PANEL / MAIN CONVERSATION LIST (EXACT FACEBOOK MESSENGER LAYOUT)
         ========================================================================= */}
      <div className={`w-full md:w-[380px] lg:w-[420px] md:border-r border-slate-200 flex flex-col h-full bg-white shrink-0 overflow-hidden ${
        activeChat ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* =======================================================================
            1. MESSENGER SUB-HEADER: [<] Arrow | "Messages" | [⚙️] Gear | [🔍] Search
           ======================================================================= */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            {onClose ? (
              <button 
                onClick={onClose}
                className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 cursor-pointer border-0 transition"
                title="ফিরে যান"
              >
                <ArrowLeft size={22} className="stroke-[2.5]" />
              </button>
            ) : (
              <button 
                onClick={() => window.history.back()}
                className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 cursor-pointer border-0 transition"
                title="ফিরে যান"
              >
                <ArrowLeft size={22} className="stroke-[2.5]" />
              </button>
            )}
            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight select-none">
              Messages
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* QA Testing Lab Button [🧪] */}
            <button 
              onClick={() => setIsTestLabOpen(true)}
              className="h-10 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 active:scale-95 flex items-center gap-1.5 cursor-pointer border border-blue-200/80 transition text-xs font-black shadow-2xs"
              title="মেসেঞ্জার কিউএ টেস্ট ল্যাব (QA Simulator)"
            >
              <Activity size={16} className="text-blue-600 stroke-[2.5]" />
              <span className="hidden sm:inline">টেস্ট ল্যাব</span>
            </button>

            {/* Settings Gear Button [⚙️] */}
            <button 
              onClick={() => {
                setSettingsSubView('menu');
                setIsSettingsModalOpen(true);
              }}
              className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center cursor-pointer border-0 transition shadow-2xs"
              title="Messaging settings"
            >
              <Settings size={20} className="stroke-[2.2]" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-pulse shadow-xs">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Search Button [🔍] */}
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-0 transition shadow-2xs active:scale-95 ${
                isSearchOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
              title="খুঁজুন"
            >
              <Search size={20} className="stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Expandable / Collapsible Search Input */}
        {isSearchOpen && (
          <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search messages or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-100 rounded-full text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition border border-transparent focus:border-blue-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-0.5"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* If Active Tab is 'requests', show a clean top sub-banner with back button to normal chats */}
        {activeChatTab === 'requests' && (
          <div className="px-4 py-2.5 bg-blue-50/90 border-y border-blue-100/90 flex items-center justify-between select-none animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveChatTab('chats')}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-blue-700 border border-blue-200 cursor-pointer transition shadow-2xs"
                title="আড্ডায় ফিরে যান"
              >
                <ArrowLeft size={14} className="stroke-[2.5]" />
              </button>
              <div>
                <h3 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <span>মেসেজ রিকোয়েস্ট (Requests)</span>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                      {pendingRequestsCount}
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-blue-700 font-medium">
                  অপরিচিত ব্যক্তিদের থেকে আসা মেসেজ তালিকা
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveChatTab('chats')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-transparent border-0 cursor-pointer underline"
            >
              আড্ডায় ফিরুন
            </button>
          </div>
        )}

        {/* =======================================================================
            2. HORIZONTAL "NOTES / STORIES" ROW (EXACT SECOND PICTURE LOOK)
           ======================================================================= */}
        <div className="px-3 pt-2.5 pb-1 overflow-x-auto no-scrollbar scrollbar-hide flex items-start gap-3 bg-white select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* USER'S OWN NOTE BUBBLE & AVATAR */}
          <div 
            onClick={() => {
              setNoteInput(userNote);
              setIsNoteModalOpen(true);
            }}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group relative pt-5"
          >
            {/* Thought bubble over user's avatar */}
            <div className="absolute top-0 transform -translate-y-1 bg-white border border-slate-200/90 rounded-2xl px-2.5 py-0.5 shadow-xs flex items-center gap-1 max-w-[85px] z-10">
              <span className="text-[10px] font-medium text-slate-600 truncate">
                {userNote ? userNote : 'Share a note...'}
              </span>
              {/* Little speech bubble tail */}
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45"></div>
            </div>

            {/* Profile Avatar with Plus Badge */}
            <div className="relative mt-2">
              <img 
                src={currentUserInfo.photoURL} 
                alt="Your note" 
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
              />
              <span className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black border-2 border-white shadow-xs">
                +
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[62px] text-center">
              Your note
            </span>
          </div>

          {/* ACTIVE REGISTERED USERS FROM FIRESTORE */}
          {registeredUsers.map(citizen => (
            <div 
              key={citizen.uid} 
              onClick={() => handleStartChatWithCitizen({ id: citizen.uid, name: citizen.name, avatar: citizen.photoURL, online: citizen.isOnline ?? true })}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group pt-7"
            >
              <div className="relative">
                <img 
                  src={citizen.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${citizen.uid}`} 
                  alt={citizen.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 group-hover:scale-105 transition-transform"
                />
                {(citizen.isOnline ?? true) && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-800 truncate max-w-[58px] text-center">
                {citizen.name}
              </span>
            </div>
          ))}
        </div>

        {/* =======================================================================
            3. MESSENGER CONVERSATION LIST (FACEBOOK MESSENGER EXACT THREAD STYLE)
           ======================================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                {activeChatTab === 'requests' ? <MessageSquare size={24} className="text-blue-500" /> : <Search size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-600">
                {activeChatTab === 'requests' ? 'কোনো পেন্ডিং মেসেজ রিকোয়েস্ট নেই' : 'কোনো বার্তা পাওয়া যায়নি'}
              </p>
              {activeChatTab === 'requests' ? (
                <button 
                  onClick={() => setActiveChatTab('chats')}
                  className="text-xs text-blue-600 font-bold underline cursor-pointer bg-transparent border-0"
                >
                  আড্ডায় ফিরে যান
                </button>
              ) : (
                <button 
                  onClick={() => {
                    fetchRegisteredUsers();
                    setIsNewChatModalOpen(true);
                  }}
                  className="text-xs text-blue-600 font-bold underline cursor-pointer bg-transparent border-0"
                >
                  নতুন বার্তা শুরু করুন
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map(chat => {
              const name = getChatName(chat);
              const photo = getChatPhoto(chat);
              const online = isChatOnline(chat);
              const unread = getUnreadCount(chat);
              const isSelected = activeChat?.id === chat.id;
              const isSentByMe = chat.lastMessageSenderId === currentUserId || chat.lastMessageSenderId === 'me' || chat.lastMessageSenderId === 'guest_or_user';

              return (
                <div 
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    setIsInfoOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors duration-150 select-none ${
                    isSelected 
                      ? 'bg-slate-100' 
                      : 'hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  {/* Left: Contact Avatar with Online Dot */}
                  <div className="relative shrink-0">
                    <img 
                      src={photo} 
                      alt={name} 
                      className="w-14 h-14 rounded-full object-cover bg-slate-100 ring-1 ring-slate-900/5" 
                    />
                    {online && (
                      <span 
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs ring-1 ring-emerald-500/20" 
                        title="Active now (অনলাইনে আছেন)"
                      ></span>
                    )}
                    {chat.type === 'group' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-xs">
                        <Users size={11} />
                      </span>
                    )}
                  </div>

                  {/* Center: Name & Subtitle Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-[15px] truncate ${
                        unread > 0 ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                      }`}>
                        {name}
                      </h3>
                      {chat.lastMessageTime && (
                        <span className={`text-xs whitespace-nowrap ml-2 ${
                          unread > 0 ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
                        }`}>
                          {formatDistanceToNow(new Date(chat.lastMessageTime), { locale: bn, addSuffix: false })
                            .replace('প্রায় ', '')
                            .replace(' মিনিট', 'm')
                            .replace(' ঘন্টা', 'h')
                            .replace(' দিন', 'd')}
                        </span>
                      )}
                    </div>

                    {/* Preview Line (Red badge for unread, checkmark / thumbnail for sent, or Live Typing) */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate text-[13px]">
                        {/* Red unread badge like Screenshot 2 (e.g. 9+ or 1) */}
                        {unread > 0 && (
                          <span className="min-w-4.5 h-4.5 px-1.5 flex items-center justify-center bg-rose-600 text-white text-[10px] font-black rounded-full shadow-xs shrink-0">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}

                        {chatTypingMap[chat.id]?.length > 0 ? (
                          <TypingIndicator variant="list" typingUsers={chatTypingMap[chat.id]} />
                        ) : (
                          <p className={`truncate ${
                            unread > 0 ? 'text-slate-950 font-black' : 'text-slate-500 font-normal'
                          }`}>
                            {isSentByMe && !unread ? <span className="text-slate-500 font-medium">You: </span> : ''}
                            {chat.lastMessage || 'Start a conversation'}
                          </p>
                        )}
                      </div>

                      {/* Right Indicator: tiny sent profile pic or seen icon */}
                      {isSentByMe && !unread && !chatTypingMap[chat.id]?.length && (
                        <img 
                          src={currentUserInfo.photoURL} 
                          alt="Sent" 
                          className="w-3.5 h-3.5 rounded-full object-cover shrink-0 ml-1 border border-slate-200" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Messages Search Results */}
          {searchTerm.trim() && (
            <div className="pt-2 pb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">বার্তা ফলাফল (Message Results)</h4>
              {isGlobalSearchLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messageSearchResults.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">কোনো মেসেজ পাওয়া যায়নি</p>
              ) : (
                messageSearchResults.map(msg => {
                   const chat = conversations.find(c => c.id === msg.conversationId);
                   const chatName = chat ? getChatName(chat) : 'Unknown Chat';
                   const chatPhoto = chat ? getChatPhoto(chat) : 'https://via.placeholder.com/40';
                   return (
                    <div 
                      key={`search_msg_${msg.id}`}
                      onClick={() => {
                        if (chat) {
                          setActiveChat(chat);
                          setSearchTerm('');
                          setIsSearchOpen(false);
                          // Optionally open in-chat search to highlight
                          setIsInChatSearchOpen(true);
                          setChatSearchText(searchTerm);
                        }
                      }}
                      className="flex items-center gap-3 p-3 mx-2 rounded-2xl cursor-pointer hover:bg-slate-50 transition border border-transparent"
                    >
                      <div className="relative">
                        <img 
                          src={chatPhoto} 
                          alt={chatName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{chatName}</h3>
                          <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(msg.timestamp), { locale: bn }).replace('প্রায় ', '')}</span>
                        </div>
                        <p className="text-xs text-slate-600 truncate bg-amber-50 p-1 rounded mt-1 border border-amber-100">
                          {highlightText(msg.text, searchTerm)}
                        </p>
                      </div>
                    </div>
                   );
                })
              )}
            </div>
          )}
        </div>

        {/* =======================================================================
            4. FLOATING ACTION BUTTON (BOTTOM RIGHT [+])
           ======================================================================= */}
        <div className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 z-30">
          {/* Blue Plus Button for New Message / Group */}
          <button 
            onClick={() => {
              fetchRegisteredUsers();
              setIsNewChatModalOpen(true);
            }}
            className="w-14 h-14 rounded-full bg-[#0084FF] text-white shadow-xl flex items-center justify-center hover:bg-[#0073e6] active:scale-95 hover:scale-105 transition cursor-pointer border-0"
            title="নতুন বার্তা শুরু করুন"
          >
            <Plus size={28} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: ACTIVE CHAT CONVERSATION WINDOW
         ========================================================================= */}
      <div className={`flex-1 flex flex-col h-full min-h-0 bg-white relative overflow-hidden ${
        !activeChat ? 'hidden md:flex' : 'flex'
      }`}>
        {activeChat ? (
          <>
            {/* Top Bar: Back with badge "< 16" | Avatar & Dot | Name & Active now | Phone, Video, Settings */}
            <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back button */}
                <button 
                  onClick={() => setActiveChat(null)}
                  className="flex items-center text-slate-900 hover:text-[#0084FF] cursor-pointer border-0 bg-transparent transition shrink-0 p-1 -ml-1 active:scale-95 group"
                  title="চ্যাট তালিকায় ফিরে যান"
                >
                  <ChevronLeft size={28} className="stroke-[2.5]" />
                </button>

                <div className="relative cursor-pointer shrink-0" onClick={() => setIsProfileModalOpen(true)}>
                  <img 
                    src={getChatPhoto(activeChat)} 
                    alt={getChatName(activeChat)} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                  />
                  {isChatOnline(activeChat) ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs" title="🟢 Online"></span>
                  ) : activeChat.type !== 'group' ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-400 rounded-full border-2 border-white shadow-xs" title="⚪ Offline"></span>
                  ) : null}
                </div>

                <div className="min-w-0 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 leading-tight truncate flex items-center gap-1.5">
                    <span className="truncate">{getChatName(activeChat)}</span>
                    {activeChat.type === 'group' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md font-bold shrink-0">গ্রুপ</span>}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 leading-tight truncate">
                    {typingUsers.length > 0 ? (
                      <TypingIndicator typingUsers={typingUsers} variant="header" />
                    ) : (
                      getLastSeenText(activeChat)
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Call (📞), Video Call (📹) */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button 
                  onClick={() => handleStartCall('audio')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
                  title="অডিও কল"
                >
                  <Phone size={22} className="stroke-[2.3]" />
                </button>
                <button 
                  onClick={() => handleStartCall('video')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 transition cursor-pointer border-0 bg-transparent"
                  title="ভিডিও কল"
                >
                  <Video size={23} className="stroke-[2.3]" />
                </button>
              </div>
            </div>

            {/* Main Messages Scroll Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-white">
              
              {/* TOP PROFILE INTRO SECTION (EXACT REPLICA OF SCREENSHOT) */}
              <div className="flex flex-col items-center justify-center pt-6 pb-2 text-center select-none">
                {/* Large Avatar with Green Online Dot */}
                <div className="relative mb-3 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                  <img 
                    src={getChatPhoto(activeChat)} 
                    alt={getChatName(activeChat)} 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-sm" 
                  />
                  {isChatOnline(activeChat) ? (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white shadow-xs" title="🟢 Online"></span>
                  ) : activeChat.type !== 'group' ? (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-slate-400 rounded-full border-3 border-white shadow-xs" title="⚪ Offline"></span>
                  ) : null}
                </div>

                {/* Bold Name */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {getChatName(activeChat)}
                </h2>

                {/* View profile button */}
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-bold text-sm transition cursor-pointer border-0 shadow-2xs mb-5 active:scale-95"
                >
                  View profile
                </button>

                {/* End-to-end encryption text */}
                <div className="max-w-md mx-auto text-xs text-slate-500 font-medium leading-relaxed px-4 mb-2">
                  Messages and calls are secured with end-to-end encryption. Only people in this chat can read, listen to or share them.{' '}
                  <span onClick={() => toast('চ্যাট অ্যান্ড-টু-অ্যান্ড এনক্রিপ্টেড ও সম্পূর্ণ সুরক্ষিত')} className="text-[#0084FF] font-bold hover:underline cursor-pointer">
                    Learn more.
                  </span>
                </div>

                {/* Connected subtext */}
                <p className="text-xs text-slate-500 font-medium mb-3">
                  You are now connected on Messenger.
                </p>
              </div>

              {/* Message loop */}
              {(() => {
                const otherParticipant = activeChat ? Object.values(activeChat.participantDetails || {}).find(p => p.uid !== currentUserId) : null;
                return messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const dateDivider = getMessageDateDivider(msg.timestamp, prevMsg ? prevMsg.timestamp : undefined);
                const isMe = msg.senderId === currentUserId || msg.senderId === 'me' || msg.senderId === 'guest_or_user';
                const isVoice = msg.type === 'voice';
                const isVideoOrReel = msg.type === 'video' || Boolean(msg.caption);
                const isImage = msg.type === 'image' && !isVideoOrReel;
                const isLocation = msg.type === 'location';

                if (msg.type === 'system') {
                  return (
                    <React.Fragment key={msg.id}>
                      {dateDivider && (
                        <div className="flex justify-center my-3 select-none">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200/80 transition px-3.5 py-1 rounded-full shadow-2xs border border-slate-200/50">
                            {dateDivider}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-center my-2 select-none">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40 text-center max-w-xs block leading-normal">
                          {msg.text}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {/* Day / Date separator badge */}
                    {dateDivider && (
                      <div className="flex justify-center my-3 select-none">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200/80 transition px-3.5 py-1 rounded-full shadow-2xs border border-slate-200/50">
                          {dateDivider}
                        </span>
                      </div>
                    )}

                    <div 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative my-1.5`}
                    >
                    {/* Quoted reply reference */}
                    {msg.replyToMessage && (
                      <div className={`text-[11px] px-2.5 py-1 rounded-xl mb-1 max-w-xs border-l-3 border-blue-500 bg-slate-100 text-slate-700 font-medium ${
                        isMe ? 'mr-1' : 'ml-1'
                      }`}>
                        <span className="text-[#0084FF] font-bold block">{msg.replyToMessage.senderName}</span>
                        <p className="truncate">{msg.replyToMessage.text}</p>
                      </div>
                    )}

                    {/* REEL / VIDEO ATTACHMENT CARD */}
                    {isVideoOrReel ? (
                      <div className="relative group/reel my-2 max-w-[280px] sm:max-w-[320px] self-center sm:self-start">
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/60">
                          {/* Video Thumbnail Frame */}
                          <img 
                            src={msg.mediaUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'} 
                            alt="Reel attachment" 
                            className="w-full h-80 sm:h-96 object-cover"
                          />

                          {/* Reel Icon Badge in Top Right */}
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                            <Film size={15} />
                          </div>

                          {/* Center Large Play Button */}
                          <button 
                            onClick={() => setSelectedVideoModalUrl(msg.mediaUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800')}
                            className="absolute inset-0 m-auto w-15 h-15 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer border-0 shadow-xl"
                            title="Play Video"
                          >
                            <Play size={26} className="fill-white translate-x-0.5" />
                          </button>

                          {/* Bengali Caption Overlay on Video */}
                          {msg.caption && (
                            <div className="absolute top-24 left-0 right-0 px-4 text-center pointer-events-none">
                              <p className="text-amber-300 font-black text-base sm:text-lg leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                                {msg.caption}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Share Button to Left of Card */}
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: 'পুঠিয়া আড্ডা ভিডিও', text: msg.caption || '', url: window.location.href });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              toast.success('ভিডিও লিঙ্ক কপি করা হয়েছে');
                            }
                          }}
                          className="absolute -left-10 bottom-1/3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer border-0 shadow-xs transition active:scale-95"
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>

                        {/* Video Card Timestamp & Delivery Status */}
                        <div 
                          className={`flex items-center gap-1 mt-1 px-1 text-[10.5px] font-medium tracking-tight select-none ${
                            isMe ? 'text-slate-500 justify-end' : 'text-slate-400 justify-start'
                          }`}
                          title={formatFullMessageDateTime(msg.timestamp)}
                        >
                          <span className="tabular-nums">{formatMessageTime(msg.timestamp)}</span>
                          {isMe && (
                            <span className="inline-flex items-center">
                              {msg.status === 'sending' && (
                                <span title="পাঠানো হচ্ছে..."><Clock size={11} className="text-slate-400 animate-spin" /></span>
                              )}
                              {msg.status === 'failed' && (
                                <button
                                  onClick={() => chatService.retryMessage(activeChat.id, msg.id, currentUserId, activeChat.participants)}
                                  className="border-0 bg-transparent p-0 m-0 cursor-pointer flex items-center text-rose-500 hover:text-rose-700 active:scale-95 transition"
                                  title="বার্তাটি ব্যর্থ হয়েছে! পুনরায় চেষ্টা করতে ক্লিক করুন।"
                                >
                                  <AlertCircle size={12} className="stroke-[2.5]" />
                                </button>
                              )}
                              {msg.status === 'sent' && (
                                <span title="পাঠানো হয়েছে (Sent)"><Check size={12.5} className="text-slate-400 stroke-[2.2]" /></span>
                              )}
                              {msg.status === 'delivered' && (
                                <span title="পৌঁছেছে (Delivered)"><CheckCheck size={13} className="text-slate-500 stroke-[2.2]" /></span>
                              )}
                              {msg.status === 'seen' && (
                                <span 
                                  className="inline-flex items-center text-[#0084FF] drop-shadow-[0_0_2px_rgba(0,132,255,0.4)] transition-all" 
                                  title={msg.seenAt ? `দেখা হয়েছে (${new Date(msg.seenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })})` : 'দেখা হয়েছে (Seen)'}
                                >
                                  <CheckCheck size={13.5} className="stroke-[2.7]" />
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Standard Message Bubble */
                      <div className="flex items-end gap-1.5 max-w-[82%] sm:max-w-[75%]">
                        {/* Receiver Avatar */}
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 mb-0.5 shadow-2xs border border-slate-200/60">
                            <img
                              src={otherParticipant?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${otherParticipant?.uid || activeChat?.id}`}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className={`px-3.5 py-2.5 rounded-[18px] text-[15px] leading-[1.35] shadow-2xs relative transition-all max-w-full break-words ${
                          isMe 
                            ? 'bg-[#0084FF] text-white rounded-br-[4px]' 
                            : 'bg-[#e4e6eb] text-[#050505] rounded-bl-[4px]'
                        }`}>

                          {/* Image Preview */}
                          {isImage && msg.mediaUrl && (
                            <div className="mb-1.5 rounded-xl overflow-hidden max-h-64 border border-black/10">
                              <img src={msg.mediaUrl} alt="attachment" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Voice Note Player */}
                          {isVoice && (
                            <div className="flex items-center gap-3 min-w-[180px] py-0.5">
                              <button 
                                onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-0 transition ${
                                   isMe ? 'bg-white text-[#0084FF]' : 'bg-[#0084FF] text-white'
                                }`}
                              >
                                {playingVoiceId === msg.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                              </button>

                              {/* Voice Wave Animation */}
                              <div className="flex-1 flex items-center gap-0.5 h-5">
                                {[35, 70, 25, 90, 45, 80, 55, 100, 40, 65, 30].map((h, i) => (
                                  <span 
                                    key={i} 
                                    style={{ height: `${playingVoiceId === msg.id ? h : 30}%` }}
                                    className={`w-1 rounded-full transition-all duration-200 ${
                                      isMe ? 'bg-blue-200' : 'bg-blue-600'
                                    }`}
                                  ></span>
                                ))}
                              </div>

                              <span className={`text-[10px] font-bold ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                0:{msg.audioDuration ? (msg.audioDuration < 10 ? `0${msg.audioDuration}` : msg.audioDuration) : '10'}
                              </span>
                            </div>
                          )}

                          {/* Location Preview */}
                          {isLocation && msg.location && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                <MapPin size={15} className={isMe ? 'text-blue-100' : 'text-rose-500'} />
                                <span>{msg.location.address || 'পুঠিয়া, রাজশাহী'}</span>
                              </div>
                              <a 
                                href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`text-[11px] block py-1 px-3 rounded-lg text-center font-bold no-underline ${
                                  isMe ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-white text-slate-800 hover:bg-slate-50'
                                }`}
                              >
                                Open Map ↗
                              </a>
                            </div>
                          )}

                          {/* Video Preview */}
                          {(msg.type === 'video' || (msg.mediaUrl && (msg.mediaUrl.includes('video') || msg.fileName?.endsWith('.mp4')))) && msg.mediaUrl && (
                            <div className="mb-1.5 rounded-xl overflow-hidden max-h-64 border border-black/10 bg-black">
                              <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="w-full max-h-60 rounded-xl"
                              />
                            </div>
                          )}

                          {/* File/Document Attachment Card */}
                          {msg.type === 'file' && (
                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 border transition ${
                              isMe ? 'bg-white/15 border-white/25 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                            }`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isMe ? 'bg-white text-[#0084FF]' : 'bg-blue-50 text-blue-600'
                              }`}>
                                <FileText size={17} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate leading-tight">{msg.fileName || 'ডকুমেন্ট ফাইল'}</p>
                                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {msg.fileSize ? `${Math.round(msg.fileSize / 1024)} KB` : 'ডকুমেন্ট'}
                                </p>
                              </div>
                              {msg.mediaUrl ? (
                                <a 
                                  href={msg.mediaUrl} 
                                  download={msg.fileName || 'document'} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                                    isMe ? 'bg-white text-[#0084FF] hover:bg-blue-50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title="ডাউনলোড"
                                >
                                  <Download size={13} />
                                </a>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => toast.success('ফাইল ডাউনলোড সফল')}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition border-0 cursor-pointer ${
                                    isMe ? 'bg-white text-[#0084FF] hover:bg-blue-50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title="ডাউনলোড"
                                >
                                  <Download size={13} />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Text Content */}
                          {!isVoice && !isLocation && (
                            <span className="whitespace-pre-wrap break-words font-normal text-[15px] leading-[1.35]">
                              {highlightText(msg.text, chatSearchText)}
                            </span>
                          )}

                          {/* Message Time & Delivery Status (Inline Float) */}
                          <span 
                            className={`inline-flex items-center gap-1 float-right ml-2.5 mt-1 text-[10px] select-none font-medium tabular-nums ${
                              isMe ? 'text-white/80' : 'text-slate-500'
                            }`}
                            title={formatFullMessageDateTime(msg.timestamp)}
                          >
                            {msg.isEdited && (
                              <span className="text-[9px] opacity-80 italic font-semibold mr-0.5">
                                (সম্পাদিত)
                              </span>
                            )}
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {isMe && (
                              <span className="inline-flex items-center">
                                {msg.status === 'sending' && (
                                  <span title="পাঠানো হচ্ছে..."><Clock size={10} className="text-white/70 animate-spin" /></span>
                                )}
                                {msg.status === 'failed' && (
                                  <button
                                    onClick={() => chatService.retryMessage(activeChat.id, msg.id, currentUserId, activeChat.participants)}
                                    className="border-0 bg-transparent p-0 m-0 cursor-pointer flex items-center text-rose-300 hover:text-rose-400 active:scale-95 transition"
                                    title="বার্তাটি ব্যর্থ হয়েছে! পুনরায় চেষ্টা করতে ক্লিক করুন।"
                                  >
                                    <AlertCircle size={11} className="stroke-[2.5]" />
                                  </button>
                                )}
                                {msg.status === 'sent' && (
                                  <span title="পাঠানো হয়েছে (Sent)"><Check size={11} className="text-white/90 stroke-[2.2]" /></span>
                                )}
                                {msg.status === 'delivered' && (
                                  <span title="পৌঁছেছে (Delivered)"><CheckCheck size={12} className="text-white/95 stroke-[2.2]" /></span>
                                )}
                                {msg.status === 'seen' && (
                                  <span 
                                    className="inline-flex items-center text-cyan-200 drop-shadow-[0_0_4px_rgba(34,211,238,0.95)] transition-all scale-110" 
                                    title={msg.seenAt ? `দেখা হয়েছে (${new Date(msg.seenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })})` : 'দেখা হয়েছে (Seen)'}
                                  >
                                    <CheckCheck size={13} className="stroke-[3.0]" />
                                  </span>
                                )}
                              </span>
                            )}
                          </span>

                          <div className="clear-both" />

                          {/* Reaction Badges */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="absolute -bottom-2.5 right-2 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 text-xs">
                              {Object.values(msg.reactions).map((emoji, idx) => (
                                <span key={idx}>{emoji}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Modern Options Dropdown (Supports Reply, Copy, Edit, Report, Delete, Reactions) */}
                        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 relative self-center">
                          <button
                            type="button"
                            onClick={() => setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id)}
                            className="text-slate-400 hover:text-slate-700 bg-white border border-slate-200 shadow-xs rounded-full p-1.5 cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            title="বিকল্পসমূহ"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activeMenuMessageId === msg.id && (
                            <div className={`absolute z-30 bottom-8 ${isMe ? 'right-0' : 'left-0'} bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1.5 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-150`}>
                              {/* Reactions Panel */}
                              <div className="flex items-center justify-around px-2 py-1 border-b border-slate-100">
                                {['❤️', '👍', '😂', '😮', '😢', '🙏'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      chatService.toggleReaction(activeChat.id, msg.id, currentUserId, emoji);
                                      setActiveMenuMessageId(null);
                                    }}
                                    className="hover:scale-130 transition text-[15px] p-0.5 bg-transparent border-0 cursor-pointer"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              {/* Action Options list */}
                              <button
                                onClick={() => {
                                  setReplyingMessage(msg);
                                  setActiveMenuMessageId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold"
                              >
                                <Reply size={13} className="text-blue-500" />
                                উত্তর দিন (Reply)
                              </button>

                              {!isVoice && !isLocation && !isImage && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.text || '');
                                    toast.success('বার্তা কপি করা হয়েছে!');
                                    setActiveMenuMessageId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold"
                                >
                                  <Copy size={13} className="text-slate-500" />
                                  কপি করুন (Copy)
                                </button>
                              )}

                              {isMe && !isVoice && !isLocation && !isImage && (
                                <button
                                  onClick={() => {
                                    setEditingMessage(msg);
                                    setInputText(msg.text || '');
                                    setActiveMenuMessageId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold"
                                >
                                  <Edit size={13} className="text-amber-500" />
                                  সম্পাদনা করুন (Edit)
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setReportingMessage(msg);
                                  setReportReason('');
                                  setIsReportModalOpen(true);
                                  setActiveMenuMessageId(null);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold"
                              >
                                <Flag size={13} className="text-rose-500" />
                                রিপোর্ট করুন (Report)
                              </button>

                              {isMe && (
                                <button
                                  onClick={() => {
                                    chatService.deleteMessage(activeChat.id, msg.id);
                                    setActiveMenuMessageId(null);
                                    toast.success('বার্তা মুছে ফেলা হয়েছে');
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-0 bg-transparent cursor-pointer font-bold border-t border-slate-50"
                                >
                                  <Trash2 size={13} className="text-rose-500" />
                                  মুছে ফেলুন (Delete)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Messenger signature mini-avatar seen badge under the latest seen message */}
                    {msg.status === 'seen' && isMe && index === messages.length - 1 && activeChat?.type === 'direct' && (
                      <div className="flex justify-end mt-1 mr-1 animate-in fade-in zoom-in-75 duration-200 select-none">
                        <div className="flex items-center gap-1" title={msg.seenAt ? `দেখা হয়েছে (${new Date(msg.seenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })})` : 'দেখা হয়েছে'}>
                          <img 
                            src={otherParticipant?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={otherParticipant?.name || 'Seen'} 
                            className="w-3.5 h-3.5 rounded-full object-cover border border-white shadow-2xs" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Group Chat multi-member seen avatars badge */}
                    {isMe && index === messages.length - 1 && activeChat?.type === 'group' && msg.seenBy && msg.seenBy.length > 0 && (
                      <div className="flex justify-end mt-1 mr-1 animate-in fade-in zoom-in-75 duration-200 select-none">
                        <div className="flex items-center -space-x-1.5" title={`পড়েছেন: ${msg.seenBy.length} জন সদস্য`}>
                          {msg.seenBy.slice(0, 4).map((uid, i) => {
                            const p = activeChat.participantDetails?.[uid];
                            return (
                              <img 
                                key={i}
                                src={p?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`}
                                alt={p?.name || 'Member'}
                                className="w-4 h-4 rounded-full object-cover border border-white shadow-2xs"
                                title={p?.name || 'সদস্য'}
                              />
                            );
                          })}
                          {msg.seenBy.length > 4 && (
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold text-slate-700 flex items-center justify-center border border-white">
                              +{msg.seenBy.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
                );
              });
              })()}

              {/* Real-time Typing Indicator Bubble */}
              {typingUsers.length > 0 && (
                <TypingIndicator 
                  typingUsers={typingUsers} 
                  variant="bubble" 
                  userName={getChatName(activeChat)} 
                  userAvatar={getChatPhoto(activeChat)} 
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Replying Preview Banner */}
            {replyingMessage && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Reply size={14} className="text-[#0084FF]" />
                  <span className="font-bold">Replying to {replyingMessage.senderId === currentUserId ? 'yourself' : getChatName(activeChat)}:</span>
                  <span className="text-slate-500 truncate max-w-xs">{replyingMessage.text}</span>
                </div>
                <button 
                  onClick={() => setReplyingMessage(null)}
                  className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Editing Preview Banner */}
            {editingMessage && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Edit size={14} className="text-amber-600" />
                  <span className="font-bold">বার্তা সম্পাদনা করছেন:</span>
                  <span className="text-slate-500 truncate max-w-xs">{editingMessage.text}</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingMessage(null);
                    setInputText('');
                  }}
                  className="text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Emoji Quick Picker Drawer */}
            {isEmojiPickerOpen && (
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-bottom-2">
                {EMOJI_LIST.map((emoji, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInputText(prev => prev + emoji)}
                    className="text-2xl p-1.5 hover:scale-125 transition-transform bg-slate-50 rounded-xl border border-slate-200/60 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* BOTTOM MESSAGE INPUT BAR (EXACT REPLICA OF SCREENSHOT) */}
            <div className="px-3 pt-2 pb-2 sm:pb-3 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-20 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {/* Floating typing status bar directly above input */}
              {typingUsers.length > 0 && chatPermission.allowed && (
                <TypingIndicator
                  typingUsers={typingUsers}
                  variant="floating"
                  userName={getChatName(activeChat)}
                  userAvatar={getChatPhoto(activeChat)}
                />
              )}

              {activeChat.requestStatus === 'pending' && activeChat.requestedBy !== currentUserId ? (
                /* Message Request Panel */
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-center space-y-3.5 shadow-2xs animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800 flex items-center justify-center gap-1.5">
                      <span>📩</span>
                      <span>মেসেজ রিকোয়েস্ট (Message Request)</span>
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      আপনি <strong>{getChatName(activeChat)}</strong>-এর মেসেজ রিকোয়েস্ট গ্রহণ না করা পর্যন্ত তিনি জানতে পারবেন না যে আপনি মেসেজটি পড়েছেন এবং তিনি আপনাকে আর কোনো কল বা মেসেজ পাঠাতে পারবেন না।
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await chatService.acceptMessageRequest(activeChat.id);
                          toast.success('মেসেজ রিকোয়েস্ট গ্রহণ করা হয়েছে!');
                          setActiveChat(prev => prev ? { ...prev, requestStatus: 'accepted' } : null);
                        } catch {
                          toast.error('রিকোয়েস্ট গ্রহণ করতে সমস্যা হয়েছে।');
                        }
                      }}
                      className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer border-0 shadow-sm flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Check size={14} className="stroke-[2.5]" /> গ্রহণ করুন (Accept)
                    </button>
                    
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await chatService.declineMessageRequest(activeChat.id);
                          toast.success('মেসেজ রিকোয়েস্ট মুছে ফেলা হয়েছে।');
                          setActiveChat(null);
                        } catch {
                          toast.error('রিকোয়েস্ট মুছতে সমস্যা হয়েছে।');
                        }
                      }}
                      className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Trash2 size={13} /> মুছে ফেলুন (Delete)
                    </button>
                    
                    <button
                      type="button"
                      onClick={async () => {
                        const partner = getOtherParticipant(activeChat);
                        if (partner) {
                          await handleBlockUser(partner.uid, partner.name);
                          await chatService.declineMessageRequest(activeChat.id);
                          setActiveChat(null);
                        }
                      }}
                      className="px-4 py-2 rounded-full hover:bg-rose-50 text-rose-600 font-black text-xs cursor-pointer border border-transparent hover:border-rose-200 transition active:scale-95"
                    >
                      ব্লক (Block)
                    </button>
                    
                    <button
                      type="button"
                    onClick={() => {
                      const partner = getOtherParticipant(activeChat);
                      if (partner) {
                        setReportingMessage({
                          id: 'user_report',
                          conversationId: activeChat.id,
                          senderId: partner.uid,
                          text: activeChat.lastMessage || 'User Account Report',
                          type: 'text',
                          timestamp: Date.now(),
                          status: 'sent'
                        });
                        setReportReason('');
                        setIsReportModalOpen(true);
                      }
                    }}
                      className="px-4 py-2 rounded-full hover:bg-amber-50 text-amber-600 font-black text-xs cursor-pointer border border-transparent hover:border-amber-200 transition active:scale-95"
                    >
                      রিপোর্ট (Report)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeChat.requestStatus === 'pending' && activeChat.requestedBy === currentUserId && (
                    <div className="bg-blue-50/70 border border-blue-100/70 rounded-2xl p-2.5 text-center mb-2 animate-in fade-in slide-in-from-bottom-1">
                      <p className="text-[11px] font-bold text-blue-800 flex items-center justify-center gap-1">
                        <span>📨</span>
                        <span>আপনার মেসেজ রিকোয়েস্টটি পাঠানো হয়েছে এবং উত্তর পাওয়ার অপেক্ষায় রয়েছে।</span>
                      </p>
                    </div>
                  )}

                  {!chatPermission.allowed ? (
                /* Permission or block restricted banner */
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-center space-y-2 shadow-xs">
                  <p className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                    <span>{chatPermission.reason || 'মেসেজ পাঠানো সম্ভব নয়।'}</span>
                  </p>
                  {isTargetBlocked && (
                    <button
                      type="button"
                      onClick={() => {
                        const partner = getOtherParticipant(activeChat);
                        if (partner?.uid) handleUnblockUser(partner.uid, partner.name);
                      }}
                      className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer border-0 shadow-xs transition active:scale-95"
                    >
                      আনব্লক করুন
                    </button>
                  )}
                </div>
              ) : isRecordingVoice ? (
                /* Voice recording active mode */
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-full px-4 py-2">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                    <span>Recording... 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsRecordingVoice(false)}
                      className="px-3 py-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer border-0"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleStopAndSendVoice}
                      className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer border-0 flex items-center gap-1 shadow-xs"
                    >
                      <Send size={13} /> Send
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Messenger Message Input form */
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*,video/*,application/pdf,.doc,.docx,.zip,.txt" 
                    className="hidden" 
                  />

                  {/* Left Action Buttons: Media/File (🖼️, 📎) & Mic (🎙️) */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center text-[#0084FF] hover:bg-blue-50 rounded-full transition cursor-pointer border-0 bg-transparent shrink-0"
                    title="ছবি বা ভিডিও যোগ করুন"
                  >
                    <ImageIcon size={22} className="stroke-[2.2]" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center text-[#0084FF] hover:bg-blue-50 rounded-full transition cursor-pointer border-0 bg-transparent shrink-0"
                    title="ফাইল বা ডকুমেন্ট পাঠান"
                  >
                    <Paperclip size={20} className="stroke-[2.2]" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsRecordingVoice(true)}
                    className="w-9 h-9 flex items-center justify-center text-[#0084FF] hover:bg-blue-50 rounded-full transition cursor-pointer border-0 bg-transparent shrink-0"
                    title="ভয়েস মেসেজ"
                  >
                    <Mic size={24} className="stroke-[2.2]" />
                  </button>

                  {/* Message Input Capsule */}
                  <div className="flex-1 min-w-0 bg-[#f0f2f5] hover:bg-[#e4e6eb] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 rounded-full px-4 py-2 flex items-center justify-between border border-transparent focus-within:border-blue-500 transition">
                    <input 
                      type="text" 
                      placeholder="Message"
                      value={inputText}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 text-[15px] font-normal text-slate-900 placeholder:text-slate-500 focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className="text-[#0084FF] hover:opacity-80 transition cursor-pointer border-0 bg-transparent shrink-0 ml-1 p-0.5"
                      title="ইমোজি বা স্টিকার"
                    >
                      <Smile size={23} className="stroke-[2.2]" />
                    </button>
                  </div>

                  {/* Right Action: Send Button or Blue Thumbs Up Like Button */}
                  {inputText.trim() ? (
                    <button 
                      type="submit"
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#0084FF] hover:bg-blue-50 transition cursor-pointer border-0 shrink-0 active:scale-95"
                      title="Send"
                    >
                      <Send size={22} className="stroke-[2.2] fill-[#0084FF]" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSendThumbsUp}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-[#0084FF] hover:bg-blue-50 transition cursor-pointer border-0 shrink-0 active:scale-125"
                      title="Quick reaction পাঠান"
                    >
                      {customQuickReaction === '👍' ? (
                        <ThumbsUp size={24} className="fill-[#0084FF] stroke-[#0084FF]" />
                      ) : (
                        <span className="text-2xl select-none leading-none">{customQuickReaction}</span>
                      )}
                    </button>
                  )}
                </form>
              )}
                </>
              )}
            </div>
          </>
        ) : (
          /* Empty placeholder state */
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0084FF] flex items-center justify-center shadow-inner">
              <MessageSquarePlus size={36} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-bold text-slate-900">Facebook Messenger</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Select a conversation from the left to start real-time messaging, audio/video calls, and media sharing.
              </p>
            </div>
            <button 
              onClick={() => {
                fetchRegisteredUsers();
                setIsNewChatModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-full bg-[#0084FF] text-white text-xs font-bold hover:bg-[#0073e6] transition shadow-md cursor-pointer border-0"
            >
              + New Message
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: SHARE A NOTE MODAL (Messenger Notes Feature)
         ========================================================================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Share a Note</h3>
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Note Bubble Preview with Avatar */}
            <div className="flex flex-col items-center gap-2 py-3 bg-slate-50 rounded-2xl">
              <div className="relative bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs max-w-[200px] text-center">
                <p className="text-xs font-medium text-slate-800">
                  {noteInput.trim() || 'Share what’s on your mind...'}
                </p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45"></div>
              </div>
              <img 
                src={currentUserInfo.photoURL} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs mt-1" 
              />
            </div>

            {/* Text Input */}
            <div className="space-y-1">
              <input 
                type="text" 
                maxLength={60}
                placeholder="Share a thought (up to 60 chars)..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
              />
              <div className="flex justify-between text-[11px] text-slate-400 px-1 font-medium">
                <span>Notes are visible to friends for 24 hours</span>
                <span>{noteInput.length}/60</span>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {['শুভ সকাল! ☕', 'পুঠিয়া রাজবাড়ি 🏰', 'Busy at work 💻', 'Good vibes ✨', 'বানেশ্বর বাজার 🌿'].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNoteInput(sug)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-full border border-slate-200/60 cursor-pointer font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {userNote && (
                <button 
                  onClick={() => {
                    setNoteInput('');
                    setUserNote('');
                    localStorage.removeItem('messenger_user_note');
                    setIsNoteModalOpen(false);
                    toast.success('নোট মুছে ফেলা হয়েছে');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-rose-600 font-bold text-xs hover:bg-rose-50 cursor-pointer border-0"
                >
                  Delete Note
                </button>
              )}
              <button 
                onClick={handleSaveNote}
                className="flex-1 py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0073e6] text-white font-bold text-xs shadow-md cursor-pointer border-0"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MESSAGING SETTINGS FULL-SCREEN VIEW (EXACT SCREENSHOT SPECIFICATION)
         ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-left duration-200 overflow-hidden">
          {/* Top Bar matching screenshot */}
          <div className="px-4 py-3.5 flex items-center gap-3 bg-white border-b border-slate-100 shrink-0">
            <button 
              type="button"
              onClick={() => {
                if (settingsSubView !== 'menu') {
                  setSettingsSubView('menu');
                } else {
                  setIsSettingsModalOpen(false);
                }
              }}
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-100 active:scale-95 transition cursor-pointer border-0 bg-transparent"
              title="Back"
            >
              <ArrowLeft size={24} className="stroke-[2.5]" />
            </button>
            <h2 className="text-[20px] font-bold text-slate-950 tracking-tight select-none">
              {settingsSubView === 'menu' && 'Messaging settings'}
              {settingsSubView === 'active_status' && 'Active Status'}
              {settingsSubView === 'notifications' && 'Messaging notifications'}
              {settingsSubView === 'requests' && 'Message requests'}
              {settingsSubView === 'archive' && 'Archive'}
              {settingsSubView === 'privacy' && 'Privacy & safety'}
            </h2>
          </div>

          {/* ==================== SUB-VIEW: MAIN MENU (MATCHES SCREENSHOT) ==================== */}
          {settingsSubView === 'menu' && (
            <div className="flex-1 overflow-y-auto bg-white divide-y divide-transparent pb-10">
              {/* Item 1: Active Status */}
              <div 
                onClick={() => setSettingsSubView('active_status')}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7a5 5 0 0 1 5 5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[16px] font-semibold text-slate-900">Active Status</span>
                </div>
                <span className="text-slate-400 text-[15px] font-normal mr-2">
                  {activeStatusEnabled ? 'On' : 'Off'}
                </span>
              </div>

              {/* Item 2: Messaging notifications */}
              <div 
                onClick={() => setSettingsSubView('notifications')}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Bell size={21} className="text-slate-900 stroke-[2.2]" />
                  </div>
                  <span className="text-[16px] font-semibold text-slate-900">Messaging notifications</span>
                </div>
                <span className="text-slate-400 text-[15px] font-normal mr-2">
                  {soundEnabled ? 'On' : 'Muted'}
                </span>
              </div>

              {/* Item 3: Message requests */}
              <div 
                onClick={() => setSettingsSubView('requests')}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <MessageSquare size={21} className="text-slate-900 stroke-[2.2]" />
                  </div>
                  <span className="text-[16px] font-semibold text-slate-900">Message requests</span>
                </div>
                {pendingRequestsCount > 0 ? (
                  <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-xs font-black animate-pulse mr-2 shadow-2xs">
                    {pendingRequestsCount}
                  </span>
                ) : (
                  <ChevronRight size={18} className="text-slate-300 mr-2" />
                )}
              </div>

              {/* Item 4: Archive */}
              <div 
                onClick={() => setSettingsSubView('archive')}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Archive size={21} className="text-slate-900 stroke-[2.2]" />
                  </div>
                  <span className="text-[16px] font-semibold text-slate-900">Archive</span>
                </div>
                {archivedChatIds.length > 0 ? (
                  <span className="text-slate-400 text-sm font-medium mr-2">
                    {archivedChatIds.length}
                  </span>
                ) : (
                  <ChevronRight size={18} className="text-slate-300 mr-2" />
                )}
              </div>

              {/* Item 5: Privacy & safety */}
              <div 
                onClick={() => setSettingsSubView('privacy')}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Shield size={21} className="text-slate-900 stroke-[2.2]" />
                  </div>
                  <span className="text-[16px] font-semibold text-slate-900">Privacy & safety</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 mr-2" />
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW 1: ACTIVE STATUS ==================== */}
          {settingsSubView === 'active_status' && (
            <div className="flex-1 overflow-y-auto bg-white p-5 space-y-6">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-[16px] font-bold text-slate-900">Show when you're active</span>
                <button 
                  type="button"
                  onClick={() => handleUpdateActiveStatus(!activeStatusEnabled)}
                  className={`w-12 h-7 rounded-full p-1 transition cursor-pointer border-0 ${
                    activeStatusEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    activeStatusEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>

              <div className="space-y-4 text-[14px] text-slate-600 leading-relaxed">
                <p>
                  Your friends and contacts will see when you're active or were recently active on this profile. You can see when they're active too. If you want to change this setting, turn it off whenever you're using Messenger.
                </p>
                <p className="text-slate-500 text-[13px]">
                  You'll still appear active or recently active unless you turn off the setting every place you're using Messenger.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${activeStatusEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {activeStatusEnabled ? 'স্ট্যাটাস: সক্রিয় (Online status visible)' : 'স্ট্যাটাস: লুকানো (Invisible)'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {activeStatusEnabled ? 'অন্যরা দেখতে পাচ্ছেন আপনি মেসেঞ্জারে সক্রিয় আছেন' : 'কেউ জানতে পারবে না আপনি এখন অনলাইনে আছেন'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW 2: MESSAGING NOTIFICATIONS ==================== */}
          {settingsSubView === 'notifications' && (
            <div className="flex-1 overflow-y-auto bg-white p-5 space-y-5">
              <div className="space-y-4 divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-2">
                  <div className="pr-4">
                    <p className="text-[15px] font-bold text-slate-900">Notification sounds</p>
                    <p className="text-xs text-slate-500">Play sounds for incoming and outgoing messages</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleUpdateSoundEnabled(!soundEnabled)}
                    className={`w-12 h-7 rounded-full p-1 transition cursor-pointer border-0 shrink-0 ${
                      soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <p className="text-[15px] font-bold text-slate-900">Message previews</p>
                    <p className="text-xs text-slate-500">Show message text and sender name in alerts</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setMessagePreviewsEnabled(!messagePreviewsEnabled)}
                    className={`w-12 h-7 rounded-full p-1 transition cursor-pointer border-0 shrink-0 ${
                      messagePreviewsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      messagePreviewsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="pr-4">
                    <p className="text-[15px] font-bold text-slate-900">Vibrate</p>
                    <p className="text-xs text-slate-500">Vibrate device on incoming messages and call rings</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setVibrateEnabled(!vibrateEnabled)}
                    className={`w-12 h-7 rounded-full p-1 transition cursor-pointer border-0 shrink-0 ${
                      vibrateEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      vibrateEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-VIEW 3: MESSAGE REQUESTS ==================== */}
          {settingsSubView === 'requests' && (
            <div className="flex-1 overflow-y-auto bg-white flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-slate-600 text-xs leading-relaxed">
                Open a chat to get more info about who's messaging you. They won't know you've seen it until you accept.
              </div>

              {pendingRequestsConversations.length > 0 ? (
                <div className="divide-y divide-slate-100 p-2">
                  {pendingRequestsConversations.map(chat => {
                    const otherUser = getOtherParticipant(chat);
                    return (
                      <div 
                        key={chat.id}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition flex items-center justify-between gap-3"
                      >
                        <div 
                          onClick={() => {
                            setActiveChat(chat);
                            setIsSettingsModalOpen(false);
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <img 
                            src={getChatPhoto(chat)} 
                            alt={getChatName(chat)}
                            className="w-12 h-12 rounded-full object-cover shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{getChatName(chat)}</h4>
                            <p className="text-xs text-slate-500 truncate">
                              {chat.lastMessage || 'Sent a message request'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await chatService.acceptMessageRequest(chat.id);
                                setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, requestStatus: 'accepted' } : c));
                                toast.success('মেসেজ রিকোয়েস্ট গ্রহণ করা হয়েছে');
                              } catch {
                                toast.error('সমস্যা হয়েছে');
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-0 shadow-2xs transition active:scale-95"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await chatService.declineMessageRequest(chat.id);
                                setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, requestStatus: 'declined' } : c));
                                toast.success('রিকোয়েস্ট ডিলিট করা হয়েছে');
                              } catch {
                                toast.error('সমস্যা হয়েছে');
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0 transition active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <MessageSquare size={32} className="stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">No message requests</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      You don't have any message requests right now. Messages from people who aren't your friends will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== SUB-VIEW 4: ARCHIVE ==================== */}
          {settingsSubView === 'archive' && (
            <div className="flex-1 overflow-y-auto bg-white flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 text-slate-600 text-xs leading-relaxed">
                Archived chats stay hidden until you receive a new message or unarchive them.
              </div>

              {archivedConversations.length > 0 ? (
                <div className="divide-y divide-slate-100 p-2">
                  {archivedConversations.map(chat => (
                    <div 
                      key={chat.id}
                      className="p-3 hover:bg-slate-50 rounded-2xl transition flex items-center justify-between gap-3"
                    >
                      <div 
                        onClick={() => {
                          setActiveChat(chat);
                          setIsSettingsModalOpen(false);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <img 
                          src={getChatPhoto(chat)} 
                          alt={getChatName(chat)}
                          className="w-12 h-12 rounded-full object-cover shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{getChatName(chat)}</h4>
                          <p className="text-xs text-slate-500 truncate">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnarchiveChat(chat.id)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs cursor-pointer border-0 transition flex items-center gap-1.5 shrink-0"
                        title="Unarchive"
                      >
                        <ArchiveRestore size={14} className="stroke-[2.2]" />
                        <span>Unarchive</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Archive size={32} className="stroke-[1.8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">No archived chats</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Archived chats will appear here. To archive a chat, use the archive button inside the chat header.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== SUB-VIEW 5: PRIVACY & SAFETY ==================== */}
          {settingsSubView === 'privacy' && (
            <div className="flex-1 overflow-y-auto bg-white p-5 space-y-6">
              {/* Who can message you */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Message delivery</h3>
                <p className="text-xs text-slate-500">Who can send you direct messages:</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleUpdatePrivacySetting('everyone')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                      allowMessagesFrom === 'everyone'
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Everyone</p>
                      <p className="text-xs text-slate-500 font-normal">Any registered user can send you messages</p>
                    </div>
                    {allowMessagesFrom === 'everyone' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdatePrivacySetting('friends_only')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                      allowMessagesFrom === 'friends_only'
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Friends only</p>
                      <p className="text-xs text-slate-500 font-normal">Only people in your connection list</p>
                    </div>
                    {allowMessagesFrom === 'friends_only' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdatePrivacySetting('nobody')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition ${
                      allowMessagesFrom === 'nobody'
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Nobody</p>
                      <p className="text-xs text-slate-500 font-normal">Pause receiving new messages</p>
                    </div>
                    {allowMessagesFrom === 'nobody' && <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>}
                  </button>
                </div>
              </div>

              {/* Blocked Accounts */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Blocked accounts ({blockedUsersList.length})
                </h3>

                {blockedUsersList.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3.5 rounded-2xl text-center">
                    No blocked accounts
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {blockedUsersList.map(blocked => (
                      <div key={blocked.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={blocked.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                            alt={blocked.name} 
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                          <span className="text-xs font-bold text-slate-800">{blocked.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblockUser(blocked.id, blocked.name)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-xl border-0 cursor-pointer transition"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Read Receipts */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-[15px] font-bold text-slate-900">Read receipts</p>
                    <p className="text-xs text-slate-500">Let people know when you've seen their messages</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setReadReceiptsEnabled(!readReceiptsEnabled)}
                    className={`w-12 h-7 rounded-full p-1 transition cursor-pointer border-0 shrink-0 ${
                      readReceiptsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      readReceiptsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* End-to-end encryption notice */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
                <ShieldCheck size={24} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">End-to-end encryption</p>
                  <p className="text-[11px] text-slate-500">Your messages and calls are protected with secure end-to-end encryption.</p>
                </div>
              </div>

              {/* Account Info & Logout */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={currentUserInfo.photoURL} alt="User" className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shadow-2xs" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{currentUserInfo.name}</h4>
                      <p className="text-xs text-blue-600 font-medium">
                        {user ? (user.email || user.phoneNumber || 'Verified Account') : 'Guest Account'}
                      </p>
                    </div>
                  </div>

                  {user ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        toast.success('Logged out');
                        setIsSettingsModalOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer border-0 transition"
                    >
                      Log Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await loginWithGoogle();
                        toast.success('Logged in');
                        setIsSettingsModalOpen(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-0 shadow-2xs transition"
                    >
                      Log In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 3: AI MESSENGER ASSISTANT MODAL
         ========================================================================= */}
      {isAiAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Messenger Assistant</h3>
                  <p className="text-[11px] text-slate-500">Auto-draft messages & smart replies</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiAssistantOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <textarea 
                rows={3}
                placeholder="What message would you like to draft? (e.g. পুঠিয়া রাজবাড়িতে দেখা করার প্রস্তাব, সৌজন্যমূলক বার্তা)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-3 bg-slate-100 rounded-2xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 border border-transparent"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAskAi}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer border-0"
                >
                  <Sparkles size={14} />
                  {isAiLoading ? 'Writing...' : 'Generate Draft'}
                </button>
              </div>
            </div>

            {aiResponse && (
              <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-2 animate-in fade-in">
                <p className="text-xs font-medium text-indigo-950 whitespace-pre-wrap">{aiResponse}</p>
                {activeChat && (
                  <button 
                    onClick={() => {
                      const cleanText = aiResponse.replace(/পরামর্শকৃত খসড়া:\n"|"/g, '');
                      setInputText(cleanText);
                      setIsAiAssistantOpen(false);
                      toast.success('ইনপুট বক্সে কপি করা হয়েছে!');
                    }}
                    className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer border-0"
                  >
                    Insert into Chat Input
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: NEW MESSAGE / CITIZEN DIRECTORY MODAL
         ========================================================================= */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-900">New Message</h3>
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search citizen or friend..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
              />
            </div>

            {/* Create Group Action button */}
            <button 
              onClick={() => {
                setIsNewChatModalOpen(false);
                setIsNewGroupModalOpen(true);
              }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer border-0 font-bold text-xs shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Create a New Group</p>
                <p className="text-[11px] text-blue-600/80 font-normal">Add friends and chat together</p>
              </div>
            </button>

            {/* Users list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">Suggested Contacts</p>
              
              {/* Registered Firestore users */}
              {registeredUsers
                .map(u => ({ id: u.uid, name: u.name, avatar: u.photoURL, online: u.isOnline ?? true }))
                .filter((u, i, arr) => arr.findIndex(x => x.id === u.id || x.name.trim().toLowerCase() === u.name.trim().toLowerCase()) === i)
                .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()))
                .map(item => {
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleStartChatWithCitizen({ id: item.id, name: item.name, avatar: item.avatar, online: item.online })}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 cursor-pointer transition select-none"
                    >
                      <div className="relative">
                        <img src={item.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.id}`} alt={item.name} className="w-11 h-11 rounded-full object-cover" />
                        {item.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500 truncate font-medium">পুঠিয়া নাগরিক আড্ডা</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: NEW GROUP MODAL
         ========================================================================= */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-900">Create New Group</h3>
              <button 
                onClick={() => setIsNewGroupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 shrink-0">
              <input 
                type="text" 
                placeholder="Group Name (e.g. পুঠিয়া যুব সমাজ)..."
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
              />
              <input 
                type="text" 
                placeholder="Group description (optional)..."
                value={groupDescInput}
                onChange={(e) => setGroupDescInput(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
              />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Select Members</p>
              {registeredUsers.map(citizen => {
                const isSelected = selectedGroupMembers.includes(citizen.uid);
                return (
                  <div 
                    key={citizen.uid}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedGroupMembers(prev => prev.filter(id => id !== citizen.uid));
                      } else {
                        setSelectedGroupMembers(prev => [...prev, citizen.uid]);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition select-none ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={citizen.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${citizen.uid}`} alt={citizen.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{citizen.name}</h4>
                        <p className="text-[10px] text-slate-500">পুঠিয়া নাগরিক</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={handleCreateGroup}
              disabled={!groupNameInput.trim() || selectedGroupMembers.length === 0}
              className="w-full py-2.5 rounded-xl bg-[#0084FF] hover:bg-[#0073e6] disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer border-0"
            >
              Create Group ({selectedGroupMembers.length} members)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: LIVE AUDIO / VIDEO CALL OVERLAY
         ========================================================================= */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-6 text-white animate-in fade-in">
          <div className="pt-8 text-center space-y-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase">
              {activeCall.type === 'video' ? 'ভিডিও কল' : 'অডিও কল'}
            </span>
            <p className="text-xs text-slate-400">
              {activeCall.status === 'ringing' ? 'রিং হচ্ছে...' : `সংযুক্ত (0:${callDuration < 10 ? `0${callDuration}` : callDuration})`}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <img 
                src={activeCall.partnerAvatar} 
                alt={activeCall.partnerName} 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-500 shadow-2xl animate-pulse" 
              />
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{activeCall.partnerName}</h2>
          </div>

          {/* Call Controls */}
          <div className="pb-10 flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`w-13 h-13 rounded-full flex items-center justify-center cursor-pointer border-0 transition ${
                isMicMuted ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {activeCall.type === 'video' && (
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-13 h-13 rounded-full flex items-center justify-center cursor-pointer border-0 transition ${
                  isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}

            <button 
              onClick={() => {
                setActiveCall(null);
                setCallDuration(0);
                toast.error('কল সমাপ্ত করা হয়েছে');
              }}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 cursor-pointer border-0 transition-transform hover:scale-105 active:scale-95"
            >
              <PhoneOff size={26} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: CONVERSATION DETAILS & USER PROFILE VIEW
         ========================================================================= */}
      {isProfileModalOpen && activeChat && (
        activeChat.type === 'group' ? (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            /* ==================== GROUP CHAT MODAL ==================== */
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100 max-h-[90vh] flex flex-col">
              {/* Header with Background */}
              <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative shrink-0">
                <button 
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setIsEditingGroupInfo(false);
                    setIsAddingGroupMembers(false);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="absolute -bottom-10 left-6">
                  <img 
                    src={getChatPhoto(activeChat)} 
                    alt={getChatName(activeChat)} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-12 pb-6 space-y-5">
                {/* Mode 1: Editing Group Info */}
                {isEditingGroupInfo ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">গ্রুপের তথ্য পরিবর্তন করুন</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">গ্রুপের নাম</label>
                        <input 
                          type="text"
                          value={editGroupName}
                          onChange={(e) => setEditGroupName(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">গ্রুপের বিবরণ</label>
                        <textarea 
                          value={editGroupDesc}
                          onChange={(e) => setEditGroupDesc(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent h-20 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">গ্রুপের ছবি (URL)</label>
                        <input 
                          type="text"
                          value={editGroupPhoto}
                          onChange={(e) => setEditGroupPhoto(e.target.value)}
                          className="w-full mt-1 px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleUpdateGroupInfo}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                      >
                        সংরক্ষণ করুন
                      </button>
                      <button 
                        onClick={() => setIsEditingGroupInfo(false)}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                ) : isAddingGroupMembers ? (
                  /* Mode 2: Adding Members */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">নতুন সদস্য যুক্ত করুন</h3>
                      <button 
                        onClick={() => setIsAddingGroupMembers(false)}
                        className="text-xs font-bold text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
                      >
                        তালিকায় ফিরুন
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {registeredUsers.filter(citizen => !activeChat.participants?.includes(citizen.uid)).length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400 font-medium">যুক্ত করার মতো আর কোনো নাগরিক নেই।</p>
                      ) : (
                        registeredUsers.filter(citizen => !activeChat.participants?.includes(citizen.uid)).map(citizen => {
                          const isSelected = addMembersSelected.includes(citizen.uid);
                          return (
                            <div 
                              key={citizen.uid}
                              onClick={() => {
                                if (isSelected) {
                                  setAddMembersSelected(prev => prev.filter(id => id !== citizen.uid));
                                } else {
                                  setAddMembersSelected(prev => [...prev, citizen.uid]);
                                }
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img src={citizen.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${citizen.uid}`} alt={citizen.name} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{citizen.name}</h4>
                                  <p className="text-[10px] text-slate-500">পুঠিয়া নাগরিক</p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <Check size={10} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleAddGroupMembers}
                        disabled={addMembersSelected.length === 0}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer border-0 shadow-sm"
                      >
                        সদস্য যুক্ত করুন ({addMembersSelected.length})
                      </button>
                      <button 
                        onClick={() => {
                          setIsAddingGroupMembers(false);
                          setAddMembersSelected([]);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Mode 3: Group Info Display + Members List */
                  <div className="space-y-5">
                    {/* Basic Info */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-snug">
                            {getChatName(activeChat)}
                          </h3>
                          <p className="text-xs text-blue-600 font-bold">
                            কমিউনিটি চ্যাট গ্রুপ • {activeChat.participants?.length || 0} সদস্য
                          </p>
                        </div>
                        {activeChat.admins?.includes(currentUserId) && (
                          <button 
                            onClick={() => setIsEditingGroupInfo(true)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 border-0 bg-transparent cursor-pointer"
                            title="গ্রুপের তথ্য পরিবর্তন করুন"
                          >
                            <Settings size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                        {activeChat.description || 'পুঠিয়া আড্ডা গ্রুপ'}
                      </p>
                    </div>

                    {/* Group Members List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">সদস্যবৃন্দ</h4>
                        {activeChat.admins?.includes(currentUserId) && (
                          <button 
                            onClick={() => setIsAddingGroupMembers(true)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 border-0 bg-transparent cursor-pointer"
                          >
                            <UserPlus size={14} />
                            <span>সদস্য যোগ করুন</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {activeChat.participants?.map(participantId => {
                          const detail = activeChat.participantDetails?.[participantId];
                          const name = detail?.name || 'পুঠিয়া নাগরিক';
                          const avatar = detail?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                          const isAdmin = activeChat.admins?.includes(participantId);
                          const isSelf = participantId === currentUserId;

                          return (
                            <div key={participantId} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                              <div className="flex items-center gap-2.5">
                                <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-800">{name}</span>
                                    {isSelf && <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-black">আপনি</span>}
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    {isAdmin ? 'গ্রুপ অ্যাডমিন' : 'সদস্য'}
                                  </p>
                                </div>
                              </div>

                              {/* Admin Privileged Actions */}
                              {activeChat.admins?.includes(currentUserId) && !isSelf && (
                                <div className="flex items-center gap-1">
                                  {isAdmin ? (
                                    <button 
                                      onClick={() => handleToggleGroupAdmin(participantId, name, false)}
                                      className="px-2 py-1 text-[9px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border-0 cursor-pointer"
                                      title="এডমিন থেকে সরিয়ে দিন"
                                    >
                                      Dismiss
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleToggleGroupAdmin(participantId, name, true)}
                                      className="px-2 py-1 text-[9px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border-0 cursor-pointer"
                                      title="এডমিন বানান"
                                    >
                                      Make Admin
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleRemoveGroupMember(participantId, name)}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 border-0 bg-transparent cursor-pointer"
                                    title="গ্রুপ থেকে সরিয়ে দিন"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="pt-3 border-t border-slate-100">
                      <button 
                        onClick={handleLeaveGroup}
                        className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs flex items-center justify-center gap-2 border-0 cursor-pointer transition active:scale-95"
                      >
                        <Trash2 size={15} />
                        <span>গ্রুপ ত্যাগ করুন (Leave Group)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ==================== DIRECT USER CONVERSATION DETAILS VIEW (SCREENSHOT 2 SPECIFICATION) ==================== */
          <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="w-full max-w-xl mx-auto h-full flex flex-col bg-white">
              {/* Top Navigation Bar: Clean back arrow '<' */}
              <div className="px-3 py-3 flex items-center bg-white border-b border-slate-100 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 active:scale-95 transition cursor-pointer border-0 bg-transparent"
                  title="Back"
                >
                  <ChevronLeft size={28} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable details view */}
              <div className="flex-1 min-h-0 overflow-y-auto bg-white">
                {/* Center Profile Info */}
                <div className="flex flex-col items-center pt-3 pb-4 px-4 text-center">
                  <div className="relative inline-block">
                    <img 
                      src={getChatPhoto(activeChat)} 
                      alt={getChatName(activeChat)} 
                      className="w-28 h-28 rounded-full object-cover shadow-2xs border border-slate-100"
                    />
                    {isChatOnline(activeChat) ? (
                      <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 px-1.5 py-0.5 bg-white text-emerald-600 text-[11px] font-bold rounded-full border border-slate-200 shadow-2xs">
                        4m
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
                    {customNickname || getChatName(activeChat)}
                  </h2>

                  {/* End-to-end encrypted pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium mt-2">
                    <Lock size={12} className="stroke-[2.5]" />
                    <span>End-to-end encrypted</span>
                  </div>

                  {/* 4 Action Buttons Row: Call, Video chat, Profile, Mute */}
                  <div className="flex items-center justify-center gap-6 sm:gap-8 mt-5">
                    {/* Call */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        handleStartCall('audio');
                      }}
                      className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 group-active:scale-95 flex items-center justify-center text-slate-900 transition">
                        <Phone size={20} className="stroke-[2.2] fill-current" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">Call</span>
                    </button>

                    {/* Video chat */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        handleStartCall('video');
                      }}
                      className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 group-active:scale-95 flex items-center justify-center text-slate-900 transition">
                        <Video size={22} className="stroke-[2.2] fill-current" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">Video chat</span>
                    </button>

                    {/* Profile */}
                    <button 
                      type="button"
                      onClick={() => setShowCitizenProfileCard(true)}
                      className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 group-active:scale-95 flex items-center justify-center text-slate-900 transition">
                        <User size={20} className="stroke-[2.2]" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">Profile</span>
                    </button>

                    {/* Mute */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsChatMuted(!isChatMuted);
                        toast.success(isChatMuted ? 'Mute তুলে নেওয়া হয়েছে' : 'চ্যাট মিউট করা হয়েছে');
                      }}
                      className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-full ${isChatMuted ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-900'} group-hover:bg-slate-200 group-active:scale-95 flex items-center justify-center transition`}>
                        {isChatMuted ? <BellOff size={20} className="stroke-[2.2]" /> : <Bell size={20} className="stroke-[2.2] fill-current" />}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">
                        {isChatMuted ? 'Unmute' : 'Mute'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section: Actions */}
                <div className="space-y-0.5 px-2">
                  <div className="px-3 py-1.5 text-[13px] font-bold text-slate-900">Actions</div>

                  {/* Mark as unread */}
                  <button 
                    type="button"
                    onClick={() => {
                      toast.success('Conversation marked as unread');
                      setIsProfileModalOpen(false);
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Mail size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">Mark as unread</span>
                  </button>

                  {/* Share contact */}
                  <button 
                    type="button"
                    onClick={() => {
                      const name = getChatName(activeChat);
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`${name} - পুঠিয়া আড্ডা মেসেঞ্জার`);
                        toast.success('Contact copied to clipboard');
                      }
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Share2 size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">Share contact</span>
                  </button>

                  {/* Create group with [Name] */}
                  <button 
                    type="button"
                    onClick={() => {
                      const partner = getOtherParticipant(activeChat);
                      if (partner?.uid) {
                        setSelectedGroupMembers([partner.uid]);
                      }
                      setIsProfileModalOpen(false);
                      setIsNewGroupModalOpen(true);
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Users size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">
                      Create group with {getChatName(activeChat).split(' ')[0] || getChatName(activeChat)}
                    </span>
                  </button>
                </div>

                {/* Section: Customisation */}
                <div className="space-y-0.5 px-2 pt-2">
                  <div className="px-3 py-1.5 text-[13px] font-bold text-slate-900">Customisation</div>

                  {/* Quick reaction */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowQuickReactionPicker(!showQuickReactionPicker)}
                      className="w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#0084FF] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <ThumbsUp size={18} className="stroke-[2.2] fill-current" />
                        </div>
                        <span className="text-[15px] font-medium text-slate-900">Quick reaction</span>
                      </div>
                      <span className="text-xl mr-2">{customQuickReaction}</span>
                    </button>

                    {showQuickReactionPicker && (
                      <div className="mx-3 p-2 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-around my-1 animate-in fade-in zoom-in-95">
                        {['👍', '❤️', '🔥', '😂', '😮', '😢', '👏', '🎉'].map(emoji => (
                          <button 
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setCustomQuickReaction(emoji);
                              setShowQuickReactionPicker(false);
                              toast.success(`Quick reaction set to ${emoji}`);
                            }}
                            className="text-2xl hover:scale-125 transition p-1 border-0 bg-transparent cursor-pointer active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nicknames */}
                  <button 
                    type="button"
                    onClick={() => {
                      const partnerName = getChatName(activeChat);
                      const newNick = window.prompt(`Enter nickname for ${partnerName}:`, customNickname || partnerName);
                      if (newNick !== null) {
                        setCustomNickname(newNick.trim());
                        toast.success(newNick.trim() ? `Nickname set to "${newNick.trim()}"` : 'Nickname reset');
                      }
                    }}
                    className="w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0 font-serif font-bold text-sm">
                        Aa
                      </div>
                      <span className="text-[15px] font-medium text-slate-900">Nicknames</span>
                    </div>
                    {customNickname && (
                      <span className="text-xs font-semibold text-slate-500 mr-2">{customNickname}</span>
                    )}
                  </button>
                </div>

                {/* Section: Privacy & support */}
                <div className="space-y-0.5 px-2 pt-2 pb-12">
                  <div className="px-3 py-1.5 text-[13px] font-bold text-slate-900">Privacy & support</div>

                  {/* Verify end-to-end encryption */}
                  <button 
                    type="button"
                    onClick={() => setShowEncryptionDetailsModal(true)}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Lock size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">Verify end-to-end encryption</span>
                  </button>

                  {/* Message permissions */}
                  <button 
                    type="button"
                    onClick={() => {
                      setSettingsSubView('privacy');
                      setIsProfileModalOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Shield size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">Message permissions</span>
                  </button>

                  {/* Disappearing messages */}
                  <button 
                    type="button"
                    onClick={() => {
                      const timers = ['Off', '24 hours', '7 days', '90 days'];
                      const nextIdx = (timers.indexOf(disappearingTimer) + 1) % timers.length;
                      setDisappearingTimer(timers[nextIdx]);
                      toast.success(`Disappearing messages: ${timers[nextIdx]}`);
                    }}
                    className="w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                        <Clock size={18} className="stroke-[2.2]" />
                      </div>
                      <span className="text-[15px] font-medium text-slate-900">Disappearing messages</span>
                    </div>
                    <span className="text-sm text-slate-400 font-medium mr-2">{disappearingTimer}</span>
                  </button>

                  {/* Read receipts */}
                  <button 
                    type="button"
                    onClick={() => {
                      setReadReceiptsEnabled(!readReceiptsEnabled);
                      toast.success(readReceiptsEnabled ? 'Read receipts turned off' : 'Read receipts turned on');
                    }}
                    className="w-full px-3 py-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                        <Eye size={18} className="stroke-[2.2]" />
                      </div>
                      <span className="text-[15px] font-medium text-slate-900">Read receipts</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium mr-2">{readReceiptsEnabled ? 'On' : 'Off'}</span>
                  </button>

                  {/* Block [Name] */}
                  <button 
                    type="button"
                    onClick={() => {
                      const partner = getOtherParticipant(activeChat);
                      if (partner?.uid) {
                        if (isTargetBlocked) {
                          handleUnblockUser(partner.uid, partner.name);
                        } else {
                          handleBlockUser(partner.uid, partner.name);
                        }
                      }
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3.5 hover:bg-rose-50 active:bg-rose-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                      <Ban size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-[15px] font-medium text-slate-900">
                      {isTargetBlocked 
                        ? `Unblock ${getChatName(activeChat).split(' ')[0] || getChatName(activeChat)}` 
                        : `Block ${getChatName(activeChat).split(' ')[0] || getChatName(activeChat)}`}
                    </span>
                  </button>

                  {/* Report */}
                  <button 
                    type="button"
                    onClick={() => {
                      const partner = getOtherParticipant(activeChat);
                      if (partner) {
                        setIsProfileModalOpen(false);
                        setReportingMessage({
                          id: 'user_report',
                          conversationId: activeChat.id,
                          senderId: partner.uid,
                          text: `Profile Report: ${partner.name}`,
                          type: 'text',
                          timestamp: Date.now(),
                          status: 'sent'
                        });
                        setReportReason('');
                        setIsReportModalOpen(true);
                      }
                    }}
                    className="w-full px-3 py-3 flex items-start gap-3.5 hover:bg-slate-50 active:bg-slate-100 rounded-2xl transition cursor-pointer border-0 bg-transparent text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 shrink-0 mt-0.5">
                      <AlertTriangle size={18} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-slate-900 leading-tight">Report</p>
                      <p className="text-xs text-slate-500 mt-0.5">Give feedback and report conversation</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Citizen Profile Details Modal */}
      {showCitizenProfileCard && activeChat && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4 text-center">
            <img 
              src={getChatPhoto(activeChat)} 
              alt={getChatName(activeChat)} 
              className="w-20 h-20 rounded-full object-cover mx-auto shadow-md border-2 border-slate-100"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{getChatName(activeChat)}</h3>
              <p className="text-xs text-blue-600 font-bold mt-0.5">পুঠিয়া, রাজশাহী • অ্যাক্টিভ নাগরিক</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs border border-slate-100 text-left">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span>পুঠিয়া উপজেলা, রাজশাহী</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>ভেরিফাইড নাগরিক অ্যাকাউন্ট</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Lock size={14} className="text-slate-400" />
                <span>এন্ড-টু-এন্ড এনক্রিপ্টেড চ্যাট</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCitizenProfileCard(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition border-0"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}

      {/* End-to-end Encryption Safety Verification Modal */}
      {showEncryptionDetailsModal && activeChat && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Lock size={28} className="stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">End-to-End Encryption</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Messages and calls are secured with end-to-end encryption. Only you and {getChatName(activeChat)} can read or listen to them.
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono text-xs text-slate-700 tracking-wider">
              48291 03859 29481 02948<br />
              91823 84729 10928 37461<br />
              56102 93847 28190 38472
            </div>
            <button
              type="button"
              onClick={() => setShowEncryptionDetailsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition border-0"
            >
              ঠিক আছে (Done)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 8: REEL / VIDEO FULL SCREEN PLAYER MODAL
         ========================================================================= */}
      {selectedVideoModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in">
          <button 
            onClick={() => setSelectedVideoModalUrl(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer border-0 z-50"
          >
            <X size={20} />
          </button>

          <div className="max-w-md w-full relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
            <img 
              src={selectedVideoModalUrl} 
              alt="Video reel playing" 
              className="w-full h-auto max-h-[75vh] object-cover" 
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play size={28} className="fill-white translate-x-0.5" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent absolute bottom-0 left-0 right-0 text-white">
              <p className="text-amber-300 font-bold text-base">
                দুনিয়ার সবচেয়ে কঠোর পরিশ্রমী শ্রমিক হচ্ছে আপনার বউ
              </p>
              <p className="text-xs text-slate-300 mt-1">Facebook Messenger Reel • পুঠিয়া আড্ডা</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 9: REPORT MESSAGE MODAL
         ========================================================================= */}
      {isReportModalOpen && reportingMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag size={18} className="text-rose-500" />
                {reportingMessage.id === 'user_report' ? 'নাগরিক রিপোর্ট করুন (Report User)' : 'বার্তা রিপোর্ট করুন (Report Message)'}
              </h3>
              <button 
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportingMessage(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-1">
                {reportingMessage.id === 'user_report' ? 'রিপোর্ট করা প্রোফাইল:' : 'রিপোর্ট করা বার্তা:'}
              </span>
              <p className="italic truncate">
                {reportingMessage.id === 'user_report' ? `${getChatName(activeChat)} (নাগরিক প্রোফাইল)` : `"${reportingMessage.text}"`}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">রিপোর্ট করার कारण:</label>
              
              <div className="grid grid-cols-2 gap-2">
                {['স্প্যাম / Spam', 'হয়রানি / Harassment', 'অশ্লীলতা / Abusive', 'মিথ্যা তথ্য / Fake News'].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setReportReason(reason)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition active:scale-95 ${
                      reportReason === reason 
                        ? 'bg-rose-50 border-rose-500 text-rose-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">বিস্তারিত লিখুন (ঐচ্ছিক):</label>
                <textarea
                  value={reportReason.includes('/') ? '' : reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="রিপোর্ট সম্পর্কে কাস্টম তথ্য দিন..."
                  className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-white resize-none h-20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportingMessage(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0 transition"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!reportReason.trim()) {
                    toast.error('অনুগ্রহ করে রিপোর্ট করার একটি কারণ নির্বাচন বা টাইপ করুন');
                    return;
                  }
                  
                  // Map display reason to the standard system reasonId
                  let mappedReasonId = 'other_reason';
                  if (reportReason.includes('Spam') || reportReason.includes('স্প্যাম')) {
                    mappedReasonId = 'spam_content';
                  } else if (reportReason.includes('Harassment') || reportReason.includes('হয়রানি')) {
                    mappedReasonId = 'harassment';
                  } else if (reportReason.includes('Abusive') || reportReason.includes('অশ্লীলতা')) {
                    mappedReasonId = 'nudity_sexual';
                  }

                  // Submit to original chat reports
                  await chatService.reportMessage(
                    activeChat?.id || '',
                    reportingMessage.id,
                    currentUserId,
                    reportReason,
                    reportingMessage.text
                  );

                  // Submit to main Admin/Moderator reports collection
                  try {
                    const partner = activeChat ? getOtherParticipant(activeChat) : null;
                    await submitUserReport({
                      contentId: reportingMessage.id,
                      contentType: 'message',
                      contentSnippet: reportingMessage.text,
                      contentAuthorUid: reportingMessage.senderId,
                      contentAuthorName: partner?.name || 'Unknown User',
                      contentAuthorAvatar: partner?.photoURL || '',
                      reasonId: mappedReasonId,
                      details: reportReason,
                      reporterUid: currentUserId,
                      reporterName: userProfile?.name || user?.displayName || 'নাগরিক',
                      reporterAvatar: userProfile?.photoURL || user?.photoURL || ''
                    });
                  } catch (err: any) {
                    console.error('submitUserReport error:', err);
                  }

                  setIsReportModalOpen(false);
                  setReportingMessage(null);
                  toast.success('রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে। মডারেটর টিম এটি খতিয়ে দেখবে।');
                }}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer border-0 transition shadow-sm hover:shadow-md"
              >
                রিপোর্ট পাঠান (Submit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages QA Test Lab Diagnostic Suite Modal */}
      <MessagesTestLabModal 
        isOpen={isTestLabOpen}
        onClose={() => setIsTestLabOpen(false)}
        currentUserId={currentUserId}
        currentUserInfo={currentUserInfo}
      />

    </div>
  );
};

export default AddaMessengerHub;

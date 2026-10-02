import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Sliders, 
  Flame, 
  Sparkles, 
  Users, 
  MapPin, 
  ChevronUp, 
  ChevronDown, 
  Video,
  X,
  Volume2,
  VolumeX,
  Radio,
  Bookmark
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Reel, ReelRulesConfig } from '../../../types';
import { reelService } from '../../../services/reelService';
import { useAuth } from '../../../contexts/AuthContext';
import { ReelCard } from './ReelCard';
import { CreateReelModal } from './CreateReelModal';
import { ReelCommentsModal } from './ReelCommentsModal';
import { ReelShareModal } from './ReelShareModal';
import { ReelAnalyticsModal } from './ReelAnalyticsModal';
import { ReelReportModal } from './ReelReportModal';
import { ReelAdminRulesModal } from './ReelAdminRulesModal';
import { DEFAULT_REEL_RULES } from '../../../data/reelAudioData';
import { useSocial } from '../../../hooks/useSocial';

export const ReelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { followUser, unfollowUser } = useSocial();

  // Reels Data State
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending' | 'following' | 'puthia'>('for_you');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedCommentReel, setSelectedCommentReel] = useState<Reel | null>(null);
  const [selectedShareReel, setSelectedShareReel] = useState<Reel | null>(null);
  const [selectedAnalyticsReel, setSelectedAnalyticsReel] = useState<Reel | null>(null);
  const [selectedReportReel, setSelectedReportReel] = useState<Reel | null>(null);
  const [isAdminRulesModalOpen, setIsAdminRulesModalOpen] = useState<boolean>(false);
  const [rules, setRules] = useState<ReelRulesConfig>(DEFAULT_REEL_RULES);

  // Touch Swipe Gesture State
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  // User Follow state set
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.following) {
      setFollowingSet(new Set(user.following));
    }
  }, [user]);

  // Subscribe to real-time Reels from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = reelService.subscribeToReels(user?.uid, (fetchedReels) => {
      setReels(fetchedReels);
      setIsLoading(false);

      // Check if URL specifies a target reel ID
      const targetId = searchParams.get('id');
      if (targetId) {
        const foundIndex = fetchedReels.findIndex(r => r.id === targetId);
        if (foundIndex !== -1) {
          setCurrentIndex(foundIndex);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, searchParams]);

  // Filter Reels based on Tab, Search, and Hashtag
  const filteredReels = reels.filter((r) => {
    // 1. Hashtag filter
    if (selectedHashtag) {
      const matchTag = r.hashtags?.some(t => t.toLowerCase() === selectedHashtag.toLowerCase()) || 
                       r.caption.toLowerCase().includes(selectedHashtag.toLowerCase());
      if (!matchTag) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQuery = r.caption.toLowerCase().includes(query) ||
                         r.authorName.toLowerCase().includes(query) ||
                         r.authorUsername?.toLowerCase().includes(query) ||
                         r.location?.toLowerCase().includes(query) ||
                         r.audioTitle?.toLowerCase().includes(query);
      if (!matchQuery) return false;
    }

    // 3. Tab filter
    if (activeTab === 'following') {
      return user?.following?.includes(r.authorId);
    }
    if (activeTab === 'trending') {
      return (r.viewsCount || 0) >= 5 || (r.reactionsCount || 0) >= 3;
    }
    if (activeTab === 'puthia') {
      return r.location?.toLowerCase().includes('puthia') || 
             r.location?.includes('পুঠিয়া') || 
             r.caption.includes('#পুঠিয়া') || 
             r.caption.includes('পুঠিয়া');
    }

    return true; // 'for_you'
  });

  const activeReel = filteredReels[currentIndex];

  // Navigation Handlers
  const handleNext = useCallback(() => {
    if (currentIndex < filteredReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, filteredReels.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation (Arrow Up / Down, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Touch Swipe Handlers (Swipe Up -> Next, Swipe Down -> Prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    const distance = touchStartY.current - touchEndY.current;
    const SWIPE_THRESHOLD = 50;

    if (distance > SWIPE_THRESHOLD) {
      // Swipe Up -> Next
      handleNext();
    } else if (distance < -SWIPE_THRESHOLD) {
      // Swipe Down -> Prev
      handlePrev();
    }
  };

  // Wheel scroll with debounce
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 30) return;

    isScrollingRef.current = true;
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 450);
  };

  // Follow / Unfollow
  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isCurrentlyFollowing = followingSet.has(targetUserId);
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(user.uid, targetUserId);
        setFollowingSet((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        await followUser(user.uid, targetUserId);
        setFollowingSet((prev) => new Set(prev).add(targetUserId));
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  // Delete Reel
  const handleDeleteReel = async (reelId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই রিলটি মুছে ফেলতে চান?")) {
      try {
        await reelService.deleteReel(reelId);
        if (currentIndex >= filteredReels.length - 1 && currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } catch (err) {
        console.error("Failed to delete reel:", err);
      }
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div 
      className="fixed inset-0 bg-black text-white flex flex-col items-center justify-between overflow-hidden select-none z-[100]"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Header Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => navigate('/adda')}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white cursor-pointer border border-white/10 transition-colors"
            title="ফিরে যান"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              রিলস (Reels)
            </span>
          </div>
        </div>

        {/* Center: Tabs (Hidden when search active) */}
        {!isSearchOpen && (
          <div className="hidden md:flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
            <button
              onClick={() => { setActiveTab('for_you'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer border-0 ${
                activeTab === 'for_you' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              আপনার জন্য
            </button>
            <button
              onClick={() => { setActiveTab('trending'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer border-0 flex items-center gap-1 ${
                activeTab === 'trending' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame size={13} className="text-amber-400" /> ট্রেন্ডিং
            </button>
            <button
              onClick={() => { setActiveTab('following'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer border-0 ${
                activeTab === 'following' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              অনুসরণকৃত
            </button>
            <button
              onClick={() => { setActiveTab('puthia'); setCurrentIndex(0); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer border-0 flex items-center gap-1 ${
                activeTab === 'puthia' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin size={13} className="text-rose-400" /> পুঠিয়া
            </button>
          </div>
        )}

        {/* Right: Search, Admin Rules & Create Reel Button */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 animate-in fade-in duration-150">
              <Search size={16} className="text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="রিল বা ক্রিয়েটর খুঁজুন..."
                className="bg-transparent text-xs text-white placeholder:text-slate-400 outline-none w-32 sm:w-48"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white cursor-pointer border border-white/10"
              title="অনুসন্ধান"
            >
              <Search size={18} />
            </button>
          )}

          {/* Admin Policy Settings */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminRulesModalOpen(true)}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-amber-400 cursor-pointer border border-white/10"
              title="রিল পলিসি সেটিংস"
            >
              <Sliders size={18} />
            </button>
          )}

          {/* ＋ Create Reel Button */}
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer border-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">রিল তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Active Hashtag Pill indicator */}
      {selectedHashtag && (
        <div className="absolute top-16 left-4 z-40 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-emerald-300 shadow-lg">
          <span>ট্যাগ: <strong>{selectedHashtag}</strong></span>
          <button 
            onClick={() => setSelectedHashtag(null)}
            className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Main Center Video Feed Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">রিলস লোড হচ্ছে...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          /* Empty State: Real database, Zero mock reels */
          <div className="max-w-sm mx-auto text-center p-8 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg">
              <Video size={40} />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">এখনও কোনো Reel নেই</h3>
              <p className="text-xs text-slate-400 mt-1">
                আড্ডার প্রথম শর্ট ভিডিও তৈরি করুন এবং সবার সাথে শেয়ার করুন!
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                setIsCreateModalOpen(true);
              }}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer border-0"
            >
              <Plus size={16} />
              <span>রিল তৈরি করুন</span>
            </button>
          </div>
        ) : (
          /* Vertical Player Container */
          <div className="relative w-full h-full max-w-md mx-auto aspect-[9/16] bg-slate-950 flex items-center justify-center shadow-2xl">
            {activeReel && (
              <ReelCard
                key={activeReel.id}
                reel={activeReel}
                isActive={true}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                currentUser={user}
                onOpenComments={(r) => setSelectedCommentReel(r)}
                onOpenShare={(r) => setSelectedShareReel(r)}
                onOpenAnalytics={(r) => setSelectedAnalyticsReel(r)}
                onOpenReport={(r) => setSelectedReportReel(r)}
                onDeleteReel={handleDeleteReel}
                onHashtagClick={(tag) => setSelectedHashtag(tag)}
                onAuthorClick={(authorId) => navigate(`/profile/${authorId}`, { state: { from: '/reels' } })}
                onFollowToggle={handleFollowToggle}
                isFollowing={followingSet.has(activeReel.authorId)}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. Navigation Controls for Desktop (Next/Prev Arrows) */}
      {filteredReels.length > 1 && (
        <div className="hidden lg:flex fixed right-10 bottom-12 flex-col gap-3 z-40">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xl hover:scale-105"
            title="আগের রিল (Up Arrow)"
          >
            <ChevronUp size={24} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredReels.length - 1}
            className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xl hover:scale-105"
            title="পরের রিল (Down Arrow)"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      )}

      {/* 4. Modals */}
      {/* Create Reel Modal */}
      <CreateReelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={user}
        onSuccess={(newId) => {
          setCurrentIndex(0);
        }}
      />

      {/* Comments Modal */}
      {selectedCommentReel && (
        <ReelCommentsModal
          reel={selectedCommentReel}
          currentUser={user}
          isOpen={!!selectedCommentReel}
          onClose={() => setSelectedCommentReel(null)}
        />
      )}

      {/* Share Modal */}
      {selectedShareReel && (
        <ReelShareModal
          reel={selectedShareReel}
          isOpen={!!selectedShareReel}
          onClose={() => setSelectedShareReel(null)}
          onShareToFeed={() => navigate('/adda')}
          onShareToStory={() => navigate('/adda')}
          onSendMessage={() => navigate('/messages')}
        />
      )}

      {/* Analytics Modal */}
      {selectedAnalyticsReel && (
        <ReelAnalyticsModal
          reel={selectedAnalyticsReel}
          isOpen={!!selectedAnalyticsReel}
          onClose={() => setSelectedAnalyticsReel(null)}
        />
      )}

      {/* Report Modal */}
      {selectedReportReel && (
        <ReelReportModal
          reel={selectedReportReel}
          currentUser={user}
          isOpen={!!selectedReportReel}
          onClose={() => setSelectedReportReel(null)}
        />
      )}

      {/* Admin Rules Modal */}
      <ReelAdminRulesModal
        isOpen={isAdminRulesModalOpen}
        onClose={() => setIsAdminRulesModalOpen(false)}
        onSaveRules={(newRules) => setRules(newRules)}
        currentRules={rules}
      />
    </div>
  );
};

export default ReelsPage;

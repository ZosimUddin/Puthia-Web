import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Music, 
  CheckCircle2, 
  MapPin, 
  Eye, 
  UserPlus, 
  UserCheck, 
  Heart,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Reel, ReelReactionType } from '../../../types';
import { ReelActionBar } from './ReelActionBar';
import { reelService } from '../../../services/reelService';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  currentUser: any;
  onOpenComments: (reel: Reel) => void;
  onOpenShare: (reel: Reel) => void;
  onOpenAnalytics: (reel: Reel) => void;
  onOpenReport: (reel: Reel) => void;
  onDeleteReel: (reelId: string) => void;
  onHashtagClick?: (tag: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onFollowToggle?: (targetUserId: string) => void;
  isFollowing?: boolean;
}

const getFilterStyle = (filterName?: string) => {
  switch (filterName) {
    case 'vintage': return 'sepia(0.35) contrast(1.1) brightness(0.95)';
    case 'warm': return 'sepia(0.2) saturate(1.3) contrast(1.05)';
    case 'cool': return 'hue-rotate(180deg) saturate(1.1) contrast(1.05)';
    case 'grayscale': return 'grayscale(1)';
    case 'vivid': return 'saturate(1.6) contrast(1.2)';
    case 'sepia': return 'sepia(0.8)';
    case 'dramatic': return 'contrast(1.4) brightness(0.9)';
    default: return 'none';
  }
};

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  currentUser,
  onOpenComments,
  onOpenShare,
  onOpenAnalytics,
  onOpenReport,
  onDeleteReel,
  onHashtagClick,
  onAuthorClick,
  onFollowToggle,
  isFollowing = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<boolean>(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(reel.duration || 15);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const lastTapRef = useRef<number>(0);
  const watchTimerRef = useRef<number>(0);
  const isAuthor = !!currentUser && currentUser.uid === reel.authorId;

  // Sync Saved state with local storage / user
  useEffect(() => {
    if (currentUser?.uid && reel.id) {
      const savedKey = `saved_reel_${currentUser.uid}_${reel.id}`;
      setIsSaved(localStorage.getItem(savedKey) === 'true');
    }
  }, [currentUser, reel.id]);

  // Handle Play/Pause when isActive changes (Auto-play when in view)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            watchTimerRef.current = Date.now();
          })
          .catch((err) => {
            console.warn("Autoplay was prevented:", err);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      // If watched more than 3 seconds before moving, record view
      if (watchTimerRef.current > 0) {
        const elapsed = (Date.now() - watchTimerRef.current) / 1000;
        if (elapsed >= 3) {
          reelService.recordView(reel.id, currentUser?.uid, elapsed);
        }
        watchTimerRef.current = 0;
      }
    }

    return () => {
      if (video) video.pause();
    };
  }, [isActive, reel.id]);

  // Track progress and view threshold
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);

      // Record view after 3 seconds of continuous active watch
      if (current >= 3 && watchTimerRef.current > 0) {
        reelService.recordView(reel.id, currentUser?.uid, current);
      }
    }
  };

  // Video Screen Click & Double Tap Handler
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap Event -> Heart like animation & react
      setShowDoubleTapHeart(true);
      setTimeout(() => setShowDoubleTapHeart(false), 900);

      if (currentUser) {
        reelService.toggleReaction(reel.id, currentUser.uid, 'love', reel.reactions?.[currentUser.uid]);
      }
    } else {
      // Single Tap Event -> Toggle Play / Pause
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
        setShowPlayPauseIcon(true);
        setTimeout(() => setShowPlayPauseIcon(false), 600);
      }
    }
    lastTapRef.current = now;
  };

  // Reaction Handler
  const handleReact = async (reactionType: ReelReactionType) => {
    if (!currentUser) return;
    const currentReaction = reel.reactions?.[currentUser.uid];
    await reelService.toggleReaction(reel.id, currentUser.uid, reactionType, currentReaction);
  };

  // Toggle Save
  const handleToggleSave = async () => {
    if (!currentUser) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    localStorage.setItem(`saved_reel_${currentUser.uid}_${reel.id}`, nextSaved ? 'true' : 'false');
    await reelService.toggleSaveReel(reel.id, currentUser.uid, !nextSaved);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * (videoRef.current.duration || duration);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden group">
      {/* 1. Main Vertical Video */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            if (reel.playbackSpeed) {
              videoRef.current.playbackRate = reel.playbackSpeed;
            }
          }
        }}
        onClick={handleVideoClick}
        style={{ filter: getFilterStyle(reel.videoFilter) }}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* 2. Double Tap Animated Heart */}
      {showDoubleTapHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-in zoom-in-50 duration-200">
          <Heart size={90} className="text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce-short" />
        </div>
      )}

      {/* 3. Single Tap Play/Pause Indicator */}
      {showPlayPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in zoom-in-75 duration-150">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
            {isPlaying ? <Play size={36} className="ml-1" /> : <Pause size={36} />}
          </div>
        </div>
      )}

      {/* 4. Text Overlays from Creator */}
      {reel.textOverlays?.map((t) => (
        <div 
          key={t.id}
          className="absolute font-black drop-shadow-lg px-2 py-0.5 rounded pointer-events-none z-20"
          style={{ 
            color: t.color, 
            top: `${t.y}%`, 
            left: `${t.x}%`, 
            transform: 'translate(-50%, -50%)',
            fontSize: `${t.fontSize}px`,
            textShadow: '0 2px 5px rgba(0,0,0,0.85)'
          }}
        >
          {t.text}
        </div>
      ))}

      {/* 5. Top Controls (Mute / Sound Button) */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-transform active:scale-90 border border-white/10 cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* 6. Right Side Vertical Action Bar */}
      <div className="absolute right-3.5 bottom-20 z-30">
        <ReelActionBar
          reel={reel}
          currentUserId={currentUser?.uid}
          isSaved={isSaved}
          onReact={handleReact}
          onOpenComments={() => onOpenComments(reel)}
          onOpenShare={() => onOpenShare(reel)}
          onToggleSave={handleToggleSave}
          onOpenAnalytics={() => onOpenAnalytics(reel)}
          onOpenReport={() => onOpenReport(reel)}
          onNotInterested={() => console.log("Not interested in", reel.id)}
          onBlockAuthor={() => console.log("Block author", reel.authorId)}
          onDeleteReel={() => onDeleteReel(reel.id)}
          isAuthor={isAuthor}
        />
      </div>

      {/* 7. Bottom Overlay (Author Info, Caption, Audio, Hashtags) */}
      <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2.5 z-20 pointer-events-auto">
        {/* Creator Info & Follow */}
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => onAuthorClick && onAuthorClick(reel.authorId)}
            className="w-10 h-10 rounded-full border-2 border-emerald-400 overflow-hidden shrink-0 cursor-pointer shadow-md bg-slate-800"
          >
            {reel.authorAvatar ? (
              <img src={reel.authorAvatar} alt={reel.authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">
                {reel.authorName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span 
              onClick={() => onAuthorClick && onAuthorClick(reel.authorId)}
              className="text-xs font-black text-white truncate drop-shadow cursor-pointer hover:underline flex items-center gap-1"
            >
              @{reel.authorUsername || reel.authorName}
              {reel.isVerified && <CheckCircle2 size={13} className="text-emerald-400 fill-emerald-400 text-slate-900 shrink-0" />}
            </span>

            {/* Follow Button (if not author) */}
            {!isAuthor && onFollowToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFollowToggle(reel.authorId);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                  isFollowing
                    ? 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-sm'
                }`}
              >
                {isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
                <span>{isFollowing ? 'অনুসরণ করছেন' : 'ফলো'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Location Badge if exists */}
        {reel.location && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <MapPin size={12} className="text-rose-400 shrink-0" />
            <span className="truncate">{reel.location}</span>
          </div>
        )}

        {/* Caption with Hashtags */}
        {reel.caption && (
          <div className="text-xs text-white/95 font-medium leading-relaxed">
            <p className={isCaptionExpanded ? '' : 'line-clamp-2'}>
              {reel.caption.split(' ').map((word, i) => {
                if (word.startsWith('#')) {
                  return (
                    <span
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHashtagClick && onHashtagClick(word);
                      }}
                      className="font-bold text-emerald-300 hover:underline cursor-pointer mr-1 inline-block"
                    >
                      {word}
                    </span>
                  );
                }
                if (word.startsWith('@')) {
                  return (
                    <span key={i} className="font-bold text-sky-300 hover:underline cursor-pointer mr-1 inline-block">
                      {word}
                    </span>
                  );
                }
                return word + ' ';
              })}
            </p>
            {reel.caption.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded(!isCaptionExpanded);
                }}
                className="text-[10px] font-black text-slate-300 hover:text-white bg-transparent border-0 cursor-pointer mt-0.5"
              >
                {isCaptionExpanded ? 'সংক্ষেপ করুন' : '...আরও দেখুন'}
              </button>
            )}
          </div>
        )}

        {/* Music / Audio Ticker */}
        <div className="flex items-center gap-2 text-white/85 text-[11px] font-bold">
          <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
            <Music size={11} className="text-emerald-400" />
          </div>
          <span className="truncate">
            {reel.originalAudio 
              ? `অরিজিনাল অডিও · ${reel.audioAuthor || reel.authorName}` 
              : `${reel.audioTitle} · ${reel.audioAuthor || 'মিউজিক'}`}
          </span>
        </div>
      </div>

      {/* 8. Bottom Playback Scrubbing Bar */}
      <div 
        onClick={handleProgressBarClick}
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 hover:h-2 transition-all cursor-pointer z-30"
      >
        <div 
          className="h-full bg-emerald-500 relative transition-all duration-100"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
};

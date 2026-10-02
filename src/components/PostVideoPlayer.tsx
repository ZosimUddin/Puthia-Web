import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, Settings, PictureInPicture2, AlertCircle, 
  Check, Film, RefreshCw
} from 'lucide-react';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  author?: string;
  authorPhotoUrl?: string;
  autoPlay?: boolean;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
}

// Helper to extract YouTube ID
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Convert seconds to mm:ss or hh:mm:ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    const hStr = h.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

// Convert English digits to Bengali digits
function toBengaliDigits(str: string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
}

export function PostVideoPlayer({
  src,
  poster,
  title,
  author,
  authorPhotoUrl,
  autoPlay = false, // Default to FALSE as requested: "Autoplay ডিফল্টভাবে বন্ধ রাখা ভালো"
  className = "",
  aspectRatio = "16/9"
}: PostVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if it's YouTube
  const youtubeId = getYoutubeVideoId(src);
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);

  // States for HTML5 Video
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  // YouTube Poster fallback
  const resolvedPoster = React.useMemo(() => {
    if (poster) return poster;
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    return undefined;
  }, [poster, youtubeId]);

  // Handle Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (youtubeId) {
      setIsYoutubePlaying(prev => !prev);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (isEnded) {
      video.currentTime = 0;
      setIsEnded(false);
    }

    if (video.paused || video.ended) {
      video.play().then(() => {
        setIsPlaying(true);
        setIsEnded(false);
      }).catch(err => {
        console.warn("Video play interrupted:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [hasStarted, isEnded, youtubeId]);

  // Skip time (+/- 10s)
  const skipTime = useCallback((amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + amount));
  }, []);

  // Handle Volume & Mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted || volume === 0) {
      const restored = previousVolume > 0 ? previousVolume : 1;
      video.muted = false;
      video.volume = restored;
      setVolume(restored);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      video.muted = true;
      video.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, previousVolume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVol;
    video.muted = newVol === 0;
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (newVol > 0) {
      setPreviousVolume(newVol);
    }
  };

  // Fullscreen Handlers
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else {
          // Fallback to overlay mode if browser fullscreen blocked
          setIsFallbackFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFallbackFullscreen(false);
      }
    } catch (err) {
      // Fallback overlay mode
      setIsFallbackFullscreen(prev => !prev);
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFs = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(isDocFs || isFallbackFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFallbackFullscreen]);

  // Picture-in-Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("PiP not supported or failed:", err);
    }
  };

  // Change Playback Speed
  const handlePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  // Auto-hide controls timer
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings && !isHoveringProgress && !isDraggingProgress) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [isPlaying, showSettings, isHoveringProgress, isDraggingProgress]);

  // Mouse Move / User Activity in player
  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Progress bar Seek Logic
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    if (isEnded) setIsEnded(false);
  };

  // Hover over progress bar
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  // Keyboard accessibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when container is active or hovered
      if (!container.contains(document.activeElement) && !isFullscreen && !isFallbackFullscreen) {
        return;
      }

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFallbackFullscreen) {
        setIsFallbackFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipTime, toggleMute, toggleFullscreen, isFullscreen, isFallbackFullscreen]);

  // Video HTML5 Event Listeners
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Calculate buffer
    if (video.buffered.length > 0) {
      try {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / (video.duration || 1)) * 100);
      } catch {
        // Ignored
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setHasError(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowControls(true);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsWaiting(false);
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // ----------------------------------------------------
  // YOUTUBE VIDEO HANDLING
  // ----------------------------------------------------
  if (youtubeId) {
    if (isYoutubePlaying) {
      return (
        <div 
          className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800 ${
            aspectRatio === '16/9' ? 'aspect-video' : 'aspect-auto min-h-[300px]'
          } ${className}`}
        >
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || "YouTube Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    // YouTube Poster view before clicking Play
    return (
      <div 
        className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-800 group cursor-pointer ${
          aspectRatio === '16/9' ? 'aspect-video' : 'aspect-auto min-h-[260px]'
        } ${className}`}
        onClick={() => setIsYoutubePlaying(true)}
      >
        {/* Poster Image */}
        {resolvedPoster ? (
          <img 
            src={resolvedPoster} 
            alt={title || "YouTube Video Poster"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to hqdefault if maxresdefault 404s
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
            <Film size={48} className="text-slate-600 animate-pulse" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/70 group-hover:via-black/20 transition-all" />

        {/* Top Badges: Video Badge + Author */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/10">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>ইউটিউব ভিডিও</span>
          </div>
          {author && (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-xs font-semibold border border-white/10 truncate max-w-[150px]">
              {authorPhotoUrl && (
                <img src={authorPhotoUrl} alt={author} className="w-4 h-4 rounded-full object-cover" />
              )}
              <span className="truncate">{author}</span>
            </div>
          )}
        </div>

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-rose-600/30 blur-md group-hover:bg-rose-600/50 transition-all" />
            <button 
              type="button"
              className="relative w-16 h-16 sm:w-20 sm:h-20 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 border-2 border-white/40 cursor-pointer"
              title="ভিডিও প্লে করুন"
            >
              <Play size={28} className="ml-1 text-white fill-white" />
            </button>
          </div>
        </div>

        {/* Bottom Title bar */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-white text-sm font-bold truncate">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // DIRECT HTML5 VIDEO PLAYER
  // ----------------------------------------------------
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentlyFullscreen = isFullscreen || isFallbackFullscreen;

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-800/80 group select-none outline-none ${
        isCurrentlyFullscreen 
          ? 'fixed inset-0 z-[999999] rounded-none border-0 w-screen h-screen flex items-center justify-center bg-black' 
          : aspectRatio === '16/9' ? 'aspect-video' : 'aspect-auto max-h-[550px]'
      } ${className}`}
    >
      {/* HTML5 Video Tag */}
      <video
        ref={videoRef}
        src={src}
        poster={resolvedPoster}
        autoPlay={autoPlay} // Autoplay is false by default
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsWaiting(true)}
        onPlaying={() => { setIsWaiting(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleVideoError}
        onClick={togglePlay}
        className={`w-full h-full object-contain cursor-pointer ${
          isCurrentlyFullscreen ? 'max-h-screen' : ''
        }`}
      />

      {/* Poster & Play Overlay Before User Starts */}
      {!hasStarted && !isPlaying && (
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col justify-between p-4 cursor-pointer"
          onClick={togglePlay}
        >
          {/* Top Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ভিডিও প্লেয়ার</span>
            </div>
            {author && (
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white/90 text-xs font-semibold border border-white/15 truncate max-w-[160px]">
                {authorPhotoUrl && (
                  <img src={authorPhotoUrl} alt={author} className="w-4 h-4 rounded-full object-cover" />
                )}
                <span className="truncate">{author}</span>
              </div>
            )}
          </div>

          {/* Center Play Button */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative flex items-center justify-center group/btn">
              <div className="absolute -inset-3 rounded-full bg-emerald-500/25 blur-lg group-hover/btn:bg-emerald-500/40 transition-all duration-300" />
              <button
                type="button"
                className="relative w-16 h-16 sm:w-20 sm:h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover/btn:scale-110 border-2 border-white/40 cursor-pointer"
                title="ভিডিও প্লে করুন"
              >
                <Play size={30} className="ml-1 text-white fill-white" />
              </button>
            </div>
          </div>

          {/* Bottom Title / Duration */}
          <div className="flex items-center justify-between text-white text-xs font-medium">
            <span className="font-bold text-sm truncate max-w-[70%]">{title || "ভিডিও দেখুন"}</span>
            {duration > 0 && (
              <span className="bg-black/70 px-2.5 py-0.5 rounded-md font-mono text-[11px]">
                {toBengaliDigits(formatTime(duration))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isWaiting && hasStarted && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Video Ended Replay Overlay */}
      {isEnded && (
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 cursor-pointer z-20"
          onClick={togglePlay}
        >
          <button 
            type="button"
            className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 hover:scale-110 border-2 border-white/40 cursor-pointer"
            title="পুনরায় চালান"
          >
            <RefreshCw size={26} className="text-white" />
          </button>
          <p className="text-white text-sm font-bold">পুনরায় দেখুন</p>
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center z-20">
          <AlertCircle size={36} className="text-rose-500 mb-2" />
          <p className="text-white text-sm font-bold">ভিডিওটি লোড করা সম্ভব হয়নি</p>
          <p className="text-slate-400 text-xs mt-1">লিংকটি সঠিক নয় বা ফাইলটি সমর্থিত নয়।</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition cursor-pointer"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Custom Video Controls Bar (Progress, Play/Pause, Volume, Fullscreen, etc.) */}
      {hasStarted && !hasError && (
        <div 
          className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 flex flex-col gap-2 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar with Tooltip & Buffered track */}
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            onMouseMove={handleProgressMouseMove}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => { setIsHoveringProgress(false); setHoverTime(null); }}
            className="relative w-full h-2 group/progress cursor-pointer flex items-center py-2"
          >
            {/* Background track */}
            <div className="w-full h-1.5 group-hover/progress:h-2 bg-white/20 rounded-full overflow-hidden transition-all relative">
              {/* Buffered progress */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-150"
                style={{ width: `${buffered}%` }}
              />
              {/* Current Played progress */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Scrubber thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform duration-150 pointer-events-none border-2 border-emerald-600"
              style={{ left: `calc(${progressPercent}% - 7px)` }}
            />

            {/* Hover Timestamp Tooltip */}
            {hoverTime !== null && (
              <div 
                className="absolute -top-7 -translate-x-1/2 bg-black/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none border border-white/20 whitespace-nowrap"
                style={{ left: `${hoverPosition}%` }}
              >
                {toBengaliDigits(formatTime(hoverTime))}
              </div>
            )}
          </div>

          {/* Bottom Controls Row: Left controls (Play, Skip, Time) & Right controls (Volume, Speed, Fullscreen) */}
          <div className="flex items-center justify-between text-white gap-2">
            {/* Left Controls: Play/Pause, 10s Skip, Time Display */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white"
                title={isPlaying ? "পজ করুন (Space)" : "প্লে করুন (Space)"}
              >
                {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white ml-0.5" />}
              </button>

              {/* -10s Skip Back */}
              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="p-1.5 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white/80 hover:text-white"
                title="১০ সেকেন্ড পেছনে"
              >
                <RotateCcw size={17} />
              </button>

              {/* +10s Skip Forward */}
              <button
                type="button"
                onClick={() => skipTime(10)}
                className="p-1.5 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white/80 hover:text-white"
                title="১০ সেকেন্ড সামনে"
              >
                <RotateCw size={17} />
              </button>

              {/* Time Display */}
              <div className="text-[11px] sm:text-xs font-mono text-white/90 flex items-center gap-1 ml-1 select-none">
                <span>{toBengaliDigits(formatTime(currentTime))}</span>
                <span className="text-white/40">/</span>
                <span className="text-white/60">{toBengaliDigits(formatTime(duration))}</span>
              </div>
            </div>

            {/* Right Controls: Volume Slider, Speed Menu, PiP, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Volume & Mute control with slider */}
              <div className="flex items-center group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 sm:p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white/90 hover:text-white"
                  title={isMuted ? "শব্দ চালু করুন (M)" : "মিউট করুন (M)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={19} className="text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 size={19} />
                  ) : (
                    <Volume2 size={19} />
                  )}
                </button>

                {/* Volume Slider on hover */}
                <div className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-200 overflow-hidden flex items-center pr-1">
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    title={`ভলিউম: ${Math.round(volume * 100)}%`}
                  />
                </div>
              </div>

              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-transparent ${
                    playbackRate !== 1 
                      ? 'bg-emerald-600 text-white' 
                      : 'hover:bg-white/15 text-white/80 hover:text-white'
                  }`}
                  title="প্লেব্যাক স্পিড"
                >
                  {playbackRate}x
                </button>

                {/* Speed Dropdown Menu */}
                {showSettings && (
                  <div className="absolute bottom-9 right-0 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-1 shadow-2xl z-50 flex flex-col min-w-[110px]">
                    <div className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 border-b border-slate-800">
                      গতি (Speed)
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handlePlaybackRate(rate)}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer border-0 bg-transparent ${
                          playbackRate === rate 
                            ? 'bg-emerald-600/30 text-emerald-400 font-bold' 
                            : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <span>{rate === 1 ? 'স্বাভাবিক (1x)' : `${rate}x`}</span>
                        {playbackRate === rate && <Check size={13} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture Button */}
              {document.pictureInPictureEnabled && (
                <button
                  type="button"
                  onClick={togglePiP}
                  className="p-1.5 sm:p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white/80 hover:text-white hidden sm:block"
                  title="পিকচার-ইন-পিকচার (PiP)"
                >
                  <PictureInPicture2 size={18} />
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 sm:p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer border-0 bg-transparent text-white/90 hover:text-white"
                title={isCurrentlyFullscreen ? "ফুলস্ক্রিন বন্ধ করুন (F / Esc)" : "ফুলস্ক্রিন করুন (F)"}
              >
                {isCurrentlyFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostVideoPlayer;

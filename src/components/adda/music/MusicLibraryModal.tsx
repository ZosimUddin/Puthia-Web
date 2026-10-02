import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Search, 
  Play, 
  Pause, 
  Check, 
  Heart, 
  Flame, 
  Sparkles, 
  Clock, 
  Volume2, 
  Scissors, 
  X, 
  ShieldCheck, 
  MapPin, 
  Sliders, 
  RefreshCw,
  PlusCircle,
  FolderHeart,
  ChevronRight,
  Disc3,
  Layers
} from 'lucide-react';
import { 
  musicLibraryService, 
  MusicTrack, 
  MusicAttachment, 
  MusicCategoryType, 
  MUSIC_CATEGORIES, 
  MusicLicenseType 
} from '../../../services/musicLibraryService';

interface MusicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMusic: (attachment: MusicAttachment) => void;
  currentAttachment?: MusicAttachment | null;
  userId?: string;
  isAdmin?: boolean;
  onOpenAdminManager?: () => void;
  targetType?: 'story' | 'reel' | 'post' | 'video';
}

export const MusicLibraryModal: React.FC<MusicLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectMusic,
  currentAttachment,
  userId,
  isAdmin = false,
  onOpenAdminManager,
  targetType = 'story'
}) => {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'all' | 'puthia' | 'trending' | 'favorites' | 'recent' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MusicCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Audio Player & Preview
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trackDuration, setTrackDuration] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Selected Attachment Configuration
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [clipDuration, setClipDuration] = useState<number>(15); // 15s, 30s, or custom
  const [musicVolume, setMusicVolume] = useState<number>(0.8);
  const [originalVolume, setOriginalVolume] = useState<number>(1.0);
  const [isTrimmingActive, setIsTrimmingActive] = useState<boolean>(false);

  const progressIntervalRef = useRef<any>(null);

  // Load Tracks & Cache
  useEffect(() => {
    if (isOpen) {
      loadTracks();
    } else {
      handleStopAudio();
    }
    return () => {
      handleStopAudio();
    };
  }, [isOpen, activeTab, selectedCategory, searchQuery]);

  // Sync existing attachment if any
  useEffect(() => {
    if (currentAttachment && isOpen) {
      musicLibraryService.getAllTracks().then(all => {
        const found = all.find(t => t.id === currentAttachment.trackId);
        if (found) {
          setSelectedTrack(found);
          setStartTime(currentAttachment.startTime || 0);
          setClipDuration(currentAttachment.duration || 15);
          setMusicVolume(currentAttachment.musicVolume ?? 0.8);
          setOriginalVolume(currentAttachment.originalVolume ?? 1.0);
        }
      });
    }
  }, [currentAttachment, isOpen]);

  const loadTracks = async () => {
    setIsLoading(true);
    try {
      let puthiaOnly = activeTab === 'puthia';
      let trendingOnly = activeTab === 'trending';
      let favOnly = activeTab === 'favorites';

      let results: MusicTrack[] = [];
      if (activeTab === 'recent') {
        results = await musicLibraryService.getRecentlyUsedTracks();
        if (searchQuery.trim()) {
          results = results.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.artist.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      } else {
        results = await musicLibraryService.queryTracks({
          searchTerm: searchQuery,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          puthiaSpecialOnly: puthiaOnly,
          trendingOnly: trendingOnly,
          favoritesOnly: favOnly,
          userId
        });
      }

      setTracks(results);
    } catch (err) {
      console.error('Error loading music tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = (track: MusicTrack) => {
    if (playingTrackId === track.id && isPlaying) {
      handleStopAudio();
    } else {
      handleStopAudio();
      setPlayingTrackId(track.id);
      setIsPlaying(true);
      setTrackDuration(track.duration || 30);
      setCurrentTime(0);

      musicLibraryService.playPreview(track, {
        volume: musicVolume,
        startTime: 0,
        onTimeUpdate: (curr, dur) => {
          setCurrentTime(Math.floor(curr));
          if (dur) setTrackDuration(Math.floor(dur));
        },
        onEnded: () => {
          handleStopAudio();
        }
      });

      // Continuous timer fallback
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= (track.duration || 30)) {
            handleStopAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopAudio = () => {
    musicLibraryService.stopPlayback();
    setIsPlaying(false);
    setPlayingTrackId(null);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const isFav = musicLibraryService.toggleFavorite(trackId, userId);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    setStartTime(0);
    setClipDuration(Math.min(track.duration || 30, 30));
    setIsTrimmingActive(true);
    // Auto-preview track
    handleTogglePlay(track);
  };

  const handleConfirmAttachment = () => {
    if (!selectedTrack) return;

    musicLibraryService.recordTrackUsage(selectedTrack.id);

    const attachment: MusicAttachment = {
      id: `attached_music_${Date.now()}`,
      trackId: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      url: selectedTrack.audioUrl,
      coverImage: selectedTrack.coverImage,
      startTime: startTime,
      duration: clipDuration,
      musicVolume: musicVolume,
      originalVolume: originalVolume,
      isPuthiaSpecial: selectedTrack.isPuthiaSpecial,
      license: selectedTrack.license
    };

    handleStopAudio();
    onSelectMusic(attachment);
    onClose();
  };

  const handleRemoveTrack = () => {
    setSelectedTrack(null);
    handleStopAudio();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getLicenseBadge = (license: MusicLicenseType) => {
    switch (license) {
      case 'puthia_heritage':
        return { text: 'পুঠিয়া ঐতিহ্য', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'royalty_free':
        return { text: 'Royalty-Free', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'creative_commons':
        return { text: 'CC-BY লাইসেন্স', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'original':
        return { text: 'মৌলিক সৃষ্টি', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { text: 'অনুমোদিত', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800/90 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                মিউজিক লাইব্রেরি
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  {targetType === 'story' ? 'স্টোরি' : targetType === 'reel' ? 'রিল' : 'পোস্ট'} অডিও
                </span>
              </h2>
              <p className="text-xs text-slate-400">পুঠিয়ার ঐতিহ্যবাহী লোকসুর, সুরের আবহ ও কপিরাইট-মুক্ত সাউন্ডট্র্যাক</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenAdminManager && (
              <button
                type="button"
                onClick={onOpenAdminManager}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              >
                <PlusCircle className="w-4 h-4" />
                অ্যাডমিন ম্যানেজমেন্ট
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleStopAudio();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Primary Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-4 pb-2 bg-slate-900/90 border-b border-slate-800 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 গান, সুর, বাঁশি, বৃষ্টি বা শিল্পী খুঁজুন (যেমন: বৃষ্টি, পুঠিয়া, বাঁশি)..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-11 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Nav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => { setActiveTab('all'); setSelectedCategory('all'); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'all' && selectedCategory === 'all'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              🌟 সব
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('puthia'); setSelectedCategory('puthia_heritage'); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'puthia'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/25 font-bold'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700/80 border border-amber-500/20'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              📍 পুঠিয়া স্পেশাল
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('trending'); setSelectedCategory('trending'); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'trending'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 font-bold'
                  : 'bg-slate-800 text-rose-300 hover:bg-slate-700/80'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              🔥 ট্রেন্ডিং
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('favorites'); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 font-bold'
                  : 'bg-slate-800 text-pink-300 hover:bg-slate-700/80'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              ❤️ পছন্দের তালিকা
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('recent'); }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'recent'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-bold'
                  : 'bg-slate-800 text-indigo-300 hover:bg-slate-700/80'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              🕒 সম্প্রতি ব্যবহৃত
            </button>
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {MUSIC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (activeTab === 'favorites' || activeTab === 'recent') setActiveTab('all');
                }}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition flex items-center gap-1 border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-700 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Track Configuration Panel (Trimming & Volume Controls) */}
        {selectedTrack && (
          <div className="bg-emerald-950/40 border-b border-emerald-800/40 p-4 sm:px-6 transition-all duration-300 animate-in slide-in-from-top-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Selected Track Summary */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 border border-emerald-500/40 shadow-md">
                  {selectedTrack.coverImage ? (
                    <img src={selectedTrack.coverImage} alt={selectedTrack.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-900/60">
                      <Music className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> নির্বাচিত মিউজিক
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border ${getLicenseBadge(selectedTrack.license).bg}`}>
                      {getLicenseBadge(selectedTrack.license).text}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base line-clamp-1">{selectedTrack.title}</h4>
                  <p className="text-xs text-slate-400">{selectedTrack.artist}</p>
                </div>
              </div>

              {/* Trim & Volume Controls */}
              <div className="w-full md:w-auto flex flex-wrap items-center gap-4 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
                {/* Start Time Slider (Trim) */}
                <div className="flex items-center gap-2 text-xs">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">শুরু:</span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, (selectedTrack.duration || 30) - clipDuration)}
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-20 sm:w-28 accent-emerald-500"
                  />
                  <span className="font-mono text-emerald-300 font-bold">{formatTime(startTime)}</span>
                </div>

                {/* Duration Choice */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 mr-1">দৈর্ঘ্য:</span>
                  {[15, 30, 45].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setClipDuration(d)}
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                        clipDuration === d
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 text-xs">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="w-16 sm:w-20 accent-emerald-500"
                    title={`সাউন্ড ভলিউম: ${Math.round(musicVolume * 100)}%`}
                  />
                  <span className="font-mono text-slate-300">{Math.round(musicVolume * 100)}%</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleConfirmAttachment}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" />
                    যোগ করুন
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveTrack}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                    title="বাতিল করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tracks List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm font-medium">মিউজিক তালিকা লোড হচ্ছে...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Music className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-300">কোনো মিউজিক খুঁজে পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                অন্য কোনো নাম দিয়ে অনুসন্ধান করুন অথবা অন্য ক্যাটাগরি নির্বাচন করুন।
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setActiveTab('all'); }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition"
              >
                সব মিউজিক দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tracks.map((track) => {
                const isCurrentPlaying = playingTrackId === track.id && isPlaying;
                const isCurrentSelected = selectedTrack?.id === track.id;
                const isFav = favorites.has(track.id) || musicLibraryService.isFavorite(track.id);
                const licenseInfo = getLicenseBadge(track.license);

                return (
                  <div
                    key={track.id}
                    className={`group relative p-3 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isCurrentSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : isCurrentPlaying
                        ? 'bg-slate-800/90 border-slate-600 shadow-md'
                        : 'bg-slate-850 bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Cover, Title, Play & Badges */}
                    <div className="flex items-start gap-3">
                      {/* Cover with Play/Pause Button */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700/60 shadow group">
                        {track.coverImage ? (
                          <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-700">
                            <Music className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        
                        {/* Play/Pause Overlay */}
                        <button
                          type="button"
                          onClick={() => handleTogglePlay(track)}
                          className={`absolute inset-0 flex items-center justify-center transition ${
                            isCurrentPlaying ? 'bg-black/60 opacity-100' : 'bg-black/40 opacity-90 group-hover:opacity-100'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                          ) : (
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Track Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {track.isPuthiaSpecial && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> পুঠিয়া স্পেশাল
                            </span>
                          )}
                          {track.isTrending && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> ট্রেন্ডিং
                            </span>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${licenseInfo.bg}`}>
                            {licenseInfo.text}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm sm:text-base line-clamp-1 mt-0.5">
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{track.artist}</p>
                      </div>

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, track.id)}
                        className={`p-2 rounded-xl transition ${
                          isFav 
                            ? 'text-pink-500 bg-pink-500/10 hover:bg-pink-500/20' 
                            : 'text-slate-500 hover:text-pink-400 hover:bg-slate-800'
                        }`}
                        title={isFav ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-pink-500' : ''}`} />
                      </button>
                    </div>

                    {/* Middle Row: Waveform & Playback Progress */}
                    {isCurrentPlaying ? (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {formatTime(currentTime)}
                          </span>
                          <span>{formatTime(trackDuration)}</span>
                        </div>
                        
                        {/* Audio Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200"
                            style={{ width: `${Math.min(100, (currentTime / (trackDuration || 30)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Bottom Action Row */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>⏱️ {track.duration || 30} সে.</span>
                        {track.usesCount > 0 && (
                          <span>👥 {track.usesCount} বার ব্যবহৃত</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePlay(track)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition flex items-center gap-1"
                        >
                          {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isCurrentPlaying ? 'থামান' : 'শুনুন'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectTrack(track)}
                          className={`px-3.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isCurrentSelected
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                          }`}
                        >
                          {isCurrentSelected ? <Check className="w-3.5 h-3.5" /> : null}
                          {isCurrentSelected ? 'নির্বাচিত' : '✓ নির্বাচন'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info & Status Bar */}
        <div className="p-3 sm:px-6 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>সব অডিও কপিরাইট-মুক্ত ও পুঠিয়া প্ল্যাটফর্মে ব্যবহারের জন্য লাইসেন্সপ্রাপ্ত।</span>
          </div>

          <div className="flex items-center gap-3">
            {selectedTrack && (
              <button
                type="button"
                onClick={handleConfirmAttachment}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                স্টোরিতে যোগ করুন
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                handleStopAudio();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

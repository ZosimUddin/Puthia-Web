import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Eye, 
  Share2, 
  Flag, 
  Wifi, 
  Settings, 
  X, 
  ShieldCheck, 
  MapPin, 
  Users, 
  Heart, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize 
} from 'lucide-react';
import { 
  LiveStream, 
  LiveComment, 
  LiveReaction, 
  LIVE_REACTIONS, 
  LiveReactionType 
} from '../../types/live';
import { liveService } from '../../services/liveService';
import { LiveFloatingReactions } from './LiveFloatingReactions';
import { LiveCommentsTray } from './LiveCommentsTray';
import { LiveHostControls } from './LiveHostControls';
import { ShareLiveModal } from './ShareLiveModal';
import { ReportLiveModal } from './ReportLiveModal';
import { AddModeratorModal } from './AddModeratorModal';
import { LiveAnalyticsModal } from './LiveAnalyticsModal';

interface LivePlayerScreenProps {
  streamId: string;
  currentUser?: any;
  userProfile?: any;
  onClose: () => void;
}

export const LivePlayerScreen: React.FC<LivePlayerScreenProps> = ({
  streamId,
  currentUser,
  userProfile,
  onClose,
}) => {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [latestReaction, setLatestReaction] = useState<LiveReaction | null>(null);
  
  // Local Controls & State
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeFilter, setActiveFilter] = useState('none');
  const [quality, setQuality] = useState<'Auto' | 'Low' | 'Medium' | 'High'>('Auto');
  const [connectionStatus, setConnectionStatus] = useState<'excellent' | 'unstable' | 'reconnecting'>('excellent');
  
  // Modals State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAddModOpen, setIsAddModOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Stream & Local WebRTC MediaStream refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const isHost = currentUser?.uid === stream?.hostUid;
  const isModerator = stream?.moderatorUids?.includes(currentUser?.uid) || isHost;

  // 1. Subscribe to Live Stream Document
  useEffect(() => {
    const unsub = liveService.listenLiveStreamById(streamId, (data) => {
      setStream(data);
    });
    return () => unsub();
  }, [streamId]);

  // 2. Subscribe to Comments & Reactions
  useEffect(() => {
    const unsubComments = liveService.listenComments(streamId, setComments);
    const unsubReactions = liveService.listenReactions(streamId, setLatestReaction);

    return () => {
      unsubComments();
      unsubReactions();
    };
  }, [streamId]);

  // 3. Register as Viewer & Presence Heartbeat
  useEffect(() => {
    if (!currentUser?.uid || !streamId) return;

    liveService.joinAsViewer(streamId, {
      uid: currentUser.uid,
      name: userProfile?.fullName || currentUser.displayName || 'নাগরিক',
      avatar: userProfile?.photoURL || currentUser.photoURL,
    });

    return () => {
      liveService.leaveAsViewer(streamId, currentUser.uid);
    };
  }, [streamId, currentUser?.uid]);

  // 4. Initialize Local Host Video Preview (if host)
  useEffect(() => {
    if (!isHost || stream?.status !== 'live') return;

    async function initHostCamera() {
      try {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isCameraOn ? { facingMode } : false,
          audio: isMicOn,
        });

        localStreamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Host camera stream error fallback:', err);
      }
    }

    initHostCamera();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isHost, stream?.status, isCameraOn, facingMode]);

  // Network connection monitor simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.96) setConnectionStatus('unstable');
      else setConnectionStatus('excellent');
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!stream) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-3">
          <Radio size={32} className="text-red-500 animate-pulse" />
          <span className="font-bold text-sm">লাইভ কানেক্ট করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // Filter Styles Map
  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'warm': return 'sepia(30%) contrast(105%) saturate(120%)';
      case 'bright': return 'brightness(115%) contrast(110%)';
      case 'vintage': return 'sepia(50%) hue-rotate(-10deg) contrast(95%)';
      case 'bw': return 'grayscale(100%) contrast(120%)';
      default: return 'none';
    }
  };

  const handleSendReaction = (type: LiveReactionType) => {
    if (!currentUser?.uid) return;
    liveService.sendReaction(streamId, currentUser.uid, type);
  };

  const handleEndLive = async () => {
    setShowEndConfirm(false);
    await liveService.endLiveStream(streamId, true);
    setIsAnalyticsOpen(true);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-fade-in font-sans">
      
      {/* Top Header Navigation */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          {/* Live Badge */}
          {stream.status === 'live' ? (
            <div className="bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-black tracking-wider uppercase shadow-lg shadow-red-600/30 border border-red-400/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE
            </div>
          ) : (
            <div className="bg-slate-700 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
              REPLAY 🎥
            </div>
          )}

          {/* Viewers Counter */}
          <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-200 border border-white/10">
            <Eye size={14} className="text-emerald-400" />
            <span>{stream.viewerCount || 1} watching</span>
          </div>

          {/* Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <Wifi size={13} className={connectionStatus === 'excellent' ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-[11px] text-slate-300 capitalize">
              {connectionStatus === 'excellent' ? '🟢 এক্সেলেন্ট' : '🟡 আনস্ট্যাবল'}
            </span>
          </div>
        </div>

        {/* Right Actions Menu */}
        <div className="flex items-center gap-2">
          {/* Quality Selector */}
          <div className="hidden sm:flex items-center gap-1 text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            <Settings size={12} className="text-slate-400" />
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="Auto" className="bg-slate-900">Auto Quality</option>
              <option value="Low" className="bg-slate-900">Low (240p)</option>
              <option value="Medium" className="bg-slate-900">Medium (480p)</option>
              <option value="High" className="bg-slate-900">High (720p HD)</option>
            </select>
          </div>

          <button
            onClick={() => setIsShareOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="শেয়ার"
          >
            <Share2 size={16} />
          </button>

          {!isHost && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-red-400"
              title="রিপোর্ট"
            >
              <Flag size={16} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 bg-white/15 hover:bg-white/25 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Center Stage (Desktop: Grid 2-cols, Mobile: Stack) */}
      <div ref={playerContainerRef} className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden relative">
        
        {/* Left/Main Video Container */}
        <div className="lg:col-span-2 relative bg-black flex items-center justify-center overflow-hidden border-r border-white/10">
          
          {/* Video Feed Element */}
          {isHost && stream.status === 'live' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: getFilterStyle() }}
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : stream.coverUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={stream.coverUrl}
                alt={stream.title}
                className="w-full h-full object-cover opacity-80 filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <img
                src={stream.coverUrl}
                alt={stream.title}
                className="max-h-full max-w-full object-contain relative z-10 shadow-2xl rounded-2xl border border-white/10"
              />
            </div>
          ) : (
            /* Ambient Video Canvas Simulator for Viewers */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 p-6 text-center space-y-4">
              <div className="relative">
                <img
                  src={stream.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.hostUid}`}
                  alt={stream.hostName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/80 shadow-2xl ring-8 ring-emerald-500/20 animate-pulse"
                />
                <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-full text-white border-2 border-slate-950">
                  👑
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-white">{stream.hostName}</h4>
                <p className="text-xs text-emerald-400 font-semibold">{stream.title}</p>
              </div>
            </div>
          )}

          {/* Floating Reactions Canvas Overlay */}
          <LiveFloatingReactions streamId={streamId} activeReaction={latestReaction} />

          {/* Top Left Overlaid Host Info */}
          <div className="absolute top-4 left-4 z-20 bg-slate-950/70 backdrop-blur-md p-2 px-3 rounded-full border border-white/10 flex items-center gap-2.5 max-w-[80%] shadow-xl">
            <img
              src={stream.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.hostUid}`}
              alt={stream.hostName}
              className="w-8 h-8 rounded-full object-cover border border-emerald-400 shrink-0"
            />
            <div className="min-w-0 pr-1">
              <h4 className="font-extrabold text-xs text-white truncate flex items-center gap-1">
                {stream.hostName} {stream.hostVerified && <ShieldCheck size={12} className="text-emerald-400 fill-emerald-400" />}
              </h4>
              <p className="text-[10px] text-slate-300 truncate font-medium flex items-center gap-1">
                <MapPin size={10} className="text-emerald-400" /> {stream.location || 'পুঠিয়া'}
              </p>
            </div>
          </div>

          {/* Bottom Overlaid Title Banner */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 rounded-2xl">
            <h3 className="font-black text-sm text-white leading-snug drop-shadow-md">
              {stream.title}
            </h3>
            {stream.description && (
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">{stream.description}</p>
            )}
          </div>

          {/* Bottom Host Controls Floating Toolbar */}
          {isHost && stream.status === 'live' && (
            <div className="absolute bottom-16 left-4 right-4 z-30">
              <LiveHostControls
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                activeFilter={activeFilter}
                slowModeSeconds={stream.slowModeSeconds || 0}
                commentsDisabled={stream.commentsDisabled || false}
                onToggleCamera={() => setIsCameraOn(!isCameraOn)}
                onToggleMic={() => setIsMicOn(!isMicOn)}
                onSwitchCamera={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                onChangeFilter={setActiveFilter}
                onToggleSlowMode={(sec) => liveService.setSlowMode(streamId, sec)}
                onToggleCommentsDisabled={(dis) => liveService.setCommentsDisabled(streamId, dis)}
                onOpenAddModerator={() => setIsAddModOpen(true)}
                onOpenInviteGuest={() => alert('গেস্ট ইনভাইটেশন পাঠানো হয়েছে!')}
                onEndLiveClick={() => setShowEndConfirm(true)}
              />
            </div>
          )}
        </div>

        {/* Right Side Comments Tray & Reaction Floating Tray */}
        <div className="flex flex-col p-3 bg-slate-950 border-t lg:border-t-0 border-white/10 z-20 h-full overflow-hidden">
          
          {/* Reaction Buttons Tray */}
          <div className="mb-2.5 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-around gap-1">
            {LIVE_REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleSendReaction(r.type)}
                className="p-2 hover:bg-white/10 rounded-full text-xl sm:text-2xl transition-transform active:scale-125 cursor-pointer filter drop-shadow-sm"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>

          {/* Comments Feed Tray */}
          <div className="flex-1 min-h-0">
            <LiveCommentsTray
              streamId={streamId}
              comments={comments}
              currentUserId={currentUser?.uid}
              currentUserName={userProfile?.fullName || currentUser?.displayName}
              currentUserAvatar={userProfile?.photoURL || currentUser?.photoURL}
              hostUid={stream.hostUid}
              isHost={isHost}
              isModerator={isModerator}
              slowModeSeconds={stream.slowModeSeconds || 0}
              commentsDisabled={stream.commentsDisabled || false}
              blockedUserIds={stream.blockedUserIds || []}
              onSendComment={(text, mentions, replyToId) =>
                liveService.sendComment(streamId, {
                  authorUid: currentUser?.uid || 'guest',
                  authorName: userProfile?.fullName || currentUser?.displayName || 'নাগরিক',
                  authorAvatar: userProfile?.photoURL || currentUser?.photoURL,
                  authorBadge: isHost ? 'host' : isModerator ? 'moderator' : 'viewer',
                  text,
                  mentions,
                  replyToId,
                })
              }
              onDeleteComment={(cid) => liveService.deleteComment(streamId, cid)}
              onHideComment={(cid) => liveService.hideComment(streamId, cid)}
              onBlockUser={(targetUid) => liveService.blockUserFromLive(streamId, targetUid)}
              onReportStream={() => setIsReportOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* End Live Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 text-white shadow-2xl">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Radio size={24} className="animate-pulse" />
            </div>
            <h3 className="font-extrabold text-base">আপনি কি Live শেষ করতে চান?</h3>
            <p className="text-xs text-slate-300">লাইভ শেষ করলে রিপ্লে সেভ হবে এবং ভিউয়ার্সদের জন্য এনালাইটিক্স তৈরী হবে।</p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleEndLive}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                End Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareLiveModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        streamId={streamId}
        streamTitle={stream.title}
        onRecordShare={() => liveService.recordShare(streamId)}
      />

      {/* Report Modal */}
      <ReportLiveModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={(reason, details) => liveService.reportLiveStream(streamId, currentUser?.uid || 'guest', reason, details)}
      />

      {/* Add Moderator Modal */}
      <AddModeratorModal
        isOpen={isAddModOpen}
        onClose={() => setIsAddModOpen(false)}
        onAddModerator={(uid) => liveService.addModerator(streamId, uid)}
      />

      {/* Post-Live Analytics Insights Modal */}
      <LiveAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => {
          setIsAnalyticsOpen(false);
          onClose();
        }}
        stream={stream}
      />
    </div>
  );
};

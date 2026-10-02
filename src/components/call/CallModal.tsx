/**
 * Puthia Digital Platform — Responsive WebRTC Audio & Video Calling UI Modal
 * 
 * Fully responsive for mobile & desktop with:
 * - WebRTC video & audio stream playback
 * - Mute/unmute microphone toggles
 * - Camera enable/disable & switch front/back toggles
 * - Floating Picture-in-Picture (PiP) mini-window mode
 * - Modern incoming call notification with ringtone & haptic vibration
 * - Live audio waveform/speaking pulse for audio calls
 * - CallSignalingService & CallContext backed state management
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useCall } from "../../contexts/CallContext";
import { useCallRingtone } from "../../hooks/useCallRingtone";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Minimize2, 
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Signal,
  User,
  Radio
} from "lucide-react";

export const CallModal: React.FC = () => {
  const {
    incomingCall,
    activeCall,
    callStatus,
    callType,
    statusMessage,
    isMuted,
    isVideoOff,
    duration,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera
  } = useCall();

  // Manage incoming call ringtone & haptic vibration respecting silent/mute settings
  const { isMuted: isRingtoneMuted, toggleRingtoneMute } = useCallRingtone(
    incomingCall && !activeCall ? incomingCall : null
  );

  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isMinimized, callStatus, isVideoOff]);

  // Attach remote stream to video or audio element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn("Remote media play warning:", e));
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(e => console.warn("Remote audio play warning:", e));
    }
  }, [remoteStream, isMinimized, callStatus, callType]);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCallActive = activeCall && callStatus !== 'idle';
  const partnerName = activeCall?.receiverName || incomingCall?.callerName || "নাগরিক";
  const partnerPhoto = activeCall?.receiverPhoto || incomingCall?.callerPhoto || "";

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. INCOMING CALL NOTIFICATION DIALOG                           */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {incomingCall && !activeCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-white text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-24 -left-24 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Call Type Pill & Ringtone Mute Quick Action */}
              <div className="flex items-center justify-between gap-2 mb-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-black text-emerald-400">
                  {incomingCall.type === 'video' ? <Video size={13} /> : <PhoneCall size={13} />}
                  <span>ইনকামিং {incomingCall.type === 'video' ? 'ভিডিও কল' : 'অডিও কল'}</span>
                </div>

                <button
                  type="button"
                  onClick={toggleRingtoneMute}
                  className={`p-2 rounded-full border transition cursor-pointer flex items-center justify-center ${
                    isRingtoneMuted
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                  title={isRingtoneMuted ? "রিংটোন মিউট করা আছে (আনমিউট করতে চাপুন)" : "রিংটোন সাইলেন্ট করুন"}
                >
                  {isRingtoneMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>

              {/* Caller Avatar with Animated Waves */}
              <div className="relative w-28 h-28 mx-auto mb-5 z-10">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-500/40 animate-pulse"></div>
                
                {incomingCall.callerPhoto ? (
                  <img
                    src={incomingCall.callerPhoto}
                    alt={incomingCall.callerName}
                    className="w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-2xl relative z-10"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-black border-4 border-slate-800 shadow-2xl relative z-10">
                    {incomingCall.callerName?.charAt(0) || "না"}
                  </div>
                )}
              </div>

              {/* Caller Info */}
              <h3 className="text-xl font-black text-white tracking-wide mb-1 relative z-10">
                {incomingCall.callerName}
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-8 relative z-10">
                পুঠিয়া ডিজিটাল প্ল্যাটফর্ম থেকে কল করছেন...
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-8 relative z-10">
                {/* Reject Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={rejectCall}
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition cursor-pointer border-none"
                    title="বাতিল করুন"
                  >
                    <PhoneOff size={24} />
                  </button>
                  <span className="text-[11px] font-bold text-slate-400">বাতিল</span>
                </div>

                {/* Accept Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={acceptCall}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 transition animate-bounce cursor-pointer border-none"
                    title="রিসিভ করুন"
                  >
                    <Phone size={28} className="fill-current" />
                  </button>
                  <span className="text-[11px] font-black text-emerald-400">রিসিভ করুন</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. ACTIVE IN-CALL MODAL & FLOATING WINDOW                      */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isCallActive && (
          <>
            {isMinimized ? (
              /* Minimized Floating Window (Draggable feel / Bottom right) */
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-white overflow-hidden backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                      {partnerPhoto ? (
                        <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                      ) : (
                        partnerName?.charAt(0) || "ক"
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-black truncate">{partnerName}</p>
                      <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {callStatus === 'connected' ? formatDuration(duration) : statusMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsMinimized(false)}
                      className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      title="পূর্ণ স্ক্রিন"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={endCall}
                      className="p-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer shadow"
                      title="কল শেষ করুন"
                    >
                      <PhoneOff size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Full Screen Responsive Call Stage */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white select-none overflow-hidden"
              >
                {/* Top Ambient Gradient & Navigation Header */}
                <div className="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                      {callType === 'video' ? <Video size={15} /> : <Radio size={15} />}
                      {callType === 'video' ? 'ভিডিও কল' : 'অডিও কল'}
                    </span>
                    {callStatus === 'connected' && (
                      <span className="text-xs font-mono font-bold bg-slate-800/90 border border-slate-700 px-3 py-0.5 rounded-full text-emerald-300">
                        {formatDuration(duration)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 backdrop-blur-md transition cursor-pointer border border-slate-700/60"
                      title="মিনিমাইজ করুন"
                    >
                      <Minimize2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Main Video or Audio Stage */}
                <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                  {callType === 'video' ? (
                    <div className="w-full h-full max-w-6xl max-h-[82vh] relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
                      {/* Remote Stream Video */}
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      {/* Fallback Display if remote stream is pending or connecting */}
                      {(!remoteStream || callStatus !== 'connected') && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md p-6 text-center">
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-5">
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                            {partnerPhoto ? (
                              <img
                                src={partnerPhoto}
                                alt={partnerName}
                                className="w-full h-full rounded-full object-cover border-4 border-slate-700 shadow-2xl relative z-10"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-4xl font-black relative z-10">
                                {partnerName?.charAt(0) || "না"}
                              </div>
                            )}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-white">{partnerName}</h2>
                          <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-1.5 flex items-center gap-1.5">
                            <Signal size={14} className="animate-pulse" />
                            {statusMessage || 'সংযুক্ত হচ্ছে...'}
                          </p>
                        </div>
                      )}

                      {/* Local Stream (Responsive Floating PiP view) */}
                      <div className="absolute top-4 right-4 w-28 sm:w-44 aspect-[3/4] sm:aspect-video rounded-2xl overflow-hidden bg-slate-800/90 border-2 border-slate-700 shadow-2xl z-20 backdrop-blur-md">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
                        />
                        {isVideoOff && (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                            <VideoOff size={20} className="mb-1 text-slate-500" />
                            <span className="text-[10px] font-bold">ক্যামেরা বন্ধ</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={switchCamera}
                          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs transition cursor-pointer border-none"
                          title="ক্যামেরা পরিবর্তন (Front/Back)"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Audio Call Stage with Modern Speaking Visualizer Wave */
                    <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto px-4">
                      <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6">
                        {callStatus === 'connected' && (
                          <>
                            <div className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-ping"></div>
                            <div className="absolute -inset-8 rounded-full border border-emerald-500/15 animate-pulse"></div>
                          </>
                        )}
                        {partnerPhoto ? (
                          <img
                            src={partnerPhoto}
                            alt={partnerName}
                            className="w-full h-full rounded-full object-cover border-4 border-slate-800 shadow-2xl relative z-10"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-5xl font-black border-4 border-slate-800 shadow-2xl relative z-10">
                            {partnerName?.charAt(0) || "না"}
                          </div>
                        )}
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{partnerName}</h2>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">পুঠিয়া ডিজিটাল নাগরিক</p>

                      {/* Animated Audio Equalizer Bars when connected */}
                      {callStatus === 'connected' ? (
                        <div className="flex items-center gap-1.5 h-8 my-5">
                          {[35, 75, 45, 90, 60, 100, 50, 80, 40, 65].map((h, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${h}%` }}
                              className="w-1 bg-emerald-400 rounded-full animate-pulse"
                            ></div>
                          ))}
                        </div>
                      ) : (
                        <div className="my-5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Signal size={13} className="animate-pulse" />
                          <span>{statusMessage || 'রিং হচ্ছে...'}</span>
                        </div>
                      )}

                      {callStatus === 'connected' && (
                        <div className="px-5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-sm font-mono font-bold text-emerald-300">
                          {formatDuration(duration)}
                        </div>
                      )}

                      {/* Audio playback node for pure audio calls */}
                      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
                      <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                    </div>
                  )}
                </div>

                {/* Bottom Call Controls Floating Bar */}
                <div className="p-4 sm:p-6 pb-8 sm:pb-10 z-20 flex items-center justify-center bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                  <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl px-5 sm:px-8 py-3.5 rounded-full flex items-center gap-4 sm:gap-6 shadow-2xl">
                    {/* Mute/Unmute Mic Toggle */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer border-none ${
                        isMuted 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title={isMuted ? "মাইক্রোফোন আনমিউট করুন" : "মাইক্রোফোন মিউট করুন"}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    {/* Camera Video Toggle (Only for Video Calls) */}
                    {callType === 'video' && (
                      <button
                        type="button"
                        onClick={toggleVideo}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer border-none ${
                          isVideoOff 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                        title={isVideoOff ? "ক্যামেরা অন করুন" : "ক্যামেরা অফ করুন"}
                      >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                      </button>
                    )}

                    {/* Camera Flip (Mobile & Front/Rear toggle) */}
                    {callType === 'video' && (
                      <button
                        type="button"
                        onClick={switchCamera}
                        className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 flex items-center justify-center transition cursor-pointer border-none"
                        title="ক্যামেরা পরিবর্তন করুন"
                      >
                        <RefreshCw size={19} />
                      </button>
                    )}

                    {/* End Call Button */}
                    <button
                      type="button"
                      onClick={endCall}
                      className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition cursor-pointer border-none"
                      title="কল সমাপ্ত করুন"
                    >
                      <PhoneOff size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CallModal;

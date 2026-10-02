/**
 * Puthia Digital Platform — Call Context
 * 
 * Manages active audio/video calls, listens for incoming calls across the entire application,
 * and exposes controls to initiate calls from profile, chat, or direct services.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { 
  webrtcCallService, 
  callAudioEngine, 
  callSignalingService,
  CallData, 
  CallType, 
  CallStatus, 
  CallParticipant 
} from "../services/webrtcService";

interface CallContextType {
  incomingCall: CallData | null;
  activeCall: CallData | null;
  callStatus: CallStatus;
  callType: CallType;
  statusMessage: string;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  initiateCall: (receiver: CallParticipant, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  switchCamera: () => void;
  receiveCallInvite: (call: CallData) => void;
  openCallById: (callId: string) => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('audio');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const durationTimerRef = useRef<any>(null);

  // 1. Listen for incoming calls targeted to the current signed-in user
  useEffect(() => {
    if (!user?.uid) {
      setIncomingCall(null);
      return;
    }

    const unsubscribe = callSignalingService.listenToIncomingCalls(
      user.uid,
      (callData) => {
        // If not already in an active connected call with someone else
        if (callStatus === 'idle' || callStatus === 'ended' || callStatus === 'rejected') {
          setIncomingCall(callData);
          setCallType(callData.type);
        }
      },
      () => {
        // No active incoming ring
        if (incomingCall) {
          setIncomingCall(null);
        }
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe();
        } catch (_) {}
      }
    };
  }, [user?.uid, callStatus, incomingCall]);

  // Duration updater when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      if (callStatus === 'idle') {
        setDuration(0);
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [callStatus]);

  // Start outgoing call
  const initiateCall = useCallback(async (receiver: CallParticipant, type: CallType) => {
    if (!user?.uid) {
      alert("কল করার জন্য আপনাকে লগইন করতে হবে।");
      return;
    }

    if (user.uid === receiver.uid) {
      alert("নিজের আইডিতে কল করা সম্ভব নয়।");
      return;
    }

    try {
      setCallType(type);
      setCallStatus('initiating');
      setStatusMessage('কল শুরু হচ্ছে...');
      setIsMuted(false);
      setIsVideoOff(false);
      setDuration(0);

      const callerInfo: CallParticipant = {
        uid: user.uid,
        name: userProfile?.name || user.displayName || 'ব্যবহারকারী',
        photoURL: userProfile?.photoURL || user.photoURL || '',
        phone: userProfile?.phone || user.phoneNumber || ''
      };

      const callId = await webrtcCallService.startCall(
        callerInfo,
        receiver,
        type,
        {
          onLocalStream: (stream) => setLocalStream(stream),
          onRemoteStream: (stream) => setRemoteStream(stream),
          onStatusChange: (status, msg) => {
            setCallStatus(status);
            if (msg) setStatusMessage(msg);
            if (status === 'ended' || status === 'rejected' || status === 'failed' || status === 'missed') {
              setTimeout(() => {
                setCallStatus('idle');
                setActiveCall(null);
                setLocalStream(null);
                setRemoteStream(null);
              }, 2500);
            }
          },
          onError: (err) => {
            setStatusMessage(err.message || 'কল সংযোগে ত্রুটি');
            setCallStatus('failed');
            setTimeout(() => {
              setCallStatus('idle');
              setActiveCall(null);
            }, 3000);
          },
          onEnded: (dur) => {
            setDuration(dur);
          }
        }
      );

      setActiveCall({
        id: callId,
        callerId: callerInfo.uid,
        callerName: callerInfo.name,
        callerPhoto: callerInfo.photoURL,
        receiverId: receiver.uid,
        receiverName: receiver.name,
        receiverPhoto: receiver.photoURL,
        type,
        status: 'ringing',
        createdAt: Date.now()
      });

      // Dispatch high-priority FCM Call Invite to recipient device for Android System Ringing Notification
      try {
        fetch('/api/fcm/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: receiver.uid,
            title: `📞 ইনকামিং ${type === 'video' ? 'ভিডিও কল' : 'অডিও কল'}`,
            body: `${callerInfo.name} আপনাকে কল করছেন...`,
            icon: callerInfo.photoURL || '/pwa-192x192.png',
            type: type === 'video' ? 'video_call' : 'audio_call',
            priority: 'critical',
            data: {
              type: 'call_invite',
              action: 'call',
              callId: callId,
              callerId: callerInfo.uid,
              callerName: callerInfo.name,
              callerPhoto: callerInfo.photoURL,
              callType: type,
              receiverId: receiver.uid,
              url: `/?incoming_call=${callId}&type=${type}`
            },
            url: `/?incoming_call=${callId}&type=${type}`
          })
        }).catch(err => console.warn('[fcmCall] Background call push dispatch skipped:', err));
      } catch (e) {}
    } catch (err: any) {
      console.error("Initiate call error:", err);
      alert(err.message || "কল শুরু করা সম্ভব হয়নি।");
      setCallStatus('idle');
      setActiveCall(null);
    }
  }, [user, userProfile]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;

    callAudioEngine.stop();
    const current = incomingCall;
    setIncomingCall(null);
    setActiveCall(current);
    setCallType(current.type);
    setCallStatus('connecting');
    setStatusMessage('কল গ্রহণ করা হচ্ছে...');
    setIsMuted(false);
    setIsVideoOff(false);
    setDuration(0);

    try {
      await webrtcCallService.answerCall(current.id, {
        onLocalStream: (stream) => setLocalStream(stream),
        onRemoteStream: (stream) => setRemoteStream(stream),
        onStatusChange: (status, msg) => {
          setCallStatus(status);
          if (msg) setStatusMessage(msg);
          if (status === 'ended' || status === 'rejected' || status === 'failed') {
            setTimeout(() => {
              setCallStatus('idle');
              setActiveCall(null);
              setLocalStream(null);
              setRemoteStream(null);
            }, 2500);
          }
        },
        onError: (err) => {
          setStatusMessage(err.message || 'কল সংযোগে ত্রুটি');
          setCallStatus('failed');
          setTimeout(() => {
            setCallStatus('idle');
            setActiveCall(null);
          }, 3000);
        },
        onEnded: (dur) => {
          setDuration(dur);
        }
      });
    } catch (err: any) {
      console.error("Accept call error:", err);
      alert(err.message || "কল রিসিভ করা সম্ভব হয়নি।");
      setCallStatus('idle');
      setActiveCall(null);
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;
    callAudioEngine.stop();
    const current = incomingCall;
    setIncomingCall(null);
    await webrtcCallService.rejectCall(current.id);
  }, [incomingCall]);

  // End active call
  const endCall = useCallback(async () => {
    callAudioEngine.stop();
    await webrtcCallService.endCall();
    setCallStatus('ended');
    setStatusMessage('কল সমাপ্ত হয়েছে');
    setTimeout(() => {
      setCallStatus('idle');
      setActiveCall(null);
      setLocalStream(null);
      setRemoteStream(null);
      setDuration(0);
    }, 1500);
  }, []);

  const toggleMute = useCallback(() => {
    const muted = webrtcCallService.toggleMicrophone();
    setIsMuted(muted);
  }, []);

  const toggleVideo = useCallback(() => {
    const videoMuted = webrtcCallService.toggleVideo();
    setIsVideoOff(videoMuted);
  }, []);

  const switchCamera = useCallback(() => {
    webrtcCallService.switchCamera();
  }, []);

  // Programmatically trigger an incoming call invite (from FCM, Service Worker or BroadcastChannel)
  const receiveCallInvite = useCallback((call: CallData) => {
    if (!call || !call.id) return;
    if (callStatus === 'idle' || callStatus === 'ended' || callStatus === 'rejected') {
      setIncomingCall(call);
      setCallType(call.type || 'audio');
    }
  }, [callStatus]);

  // Open / listen to a specific call by document ID (e.g. from deep links or push notification clicks)
  const openCallById = useCallback(async (callId: string) => {
    if (!callId) return;
    try {
      const data = await callSignalingService.getCallData(callId);
      if (data && data.status === 'ringing') {
        receiveCallInvite(data);
      }
    } catch (err) {
      console.warn("Could not load call by ID:", err);
    }
  }, [receiveCallInvite]);

  // Handle URL incoming_call parameter on mount or navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingCallId = urlParams.get('incoming_call') || urlParams.get('call_id');
    if (incomingCallId) {
      openCallById(incomingCallId);
      // Clean query parameter from URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('incoming_call');
      url.searchParams.delete('call_id');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [openCallById]);

  return (
    <CallContext.Provider
      value={{
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
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        switchCamera,
        receiveCallInvite,
        openCallById
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export default CallContext;

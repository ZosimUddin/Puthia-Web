/**
 * Puthia Digital Platform — WebRTC Audio & Video Calling Service
 * 
 * Uses Firebase Firestore for real-time signaling, ICE candidate exchange,
 * and state management with Google STUN servers and browser Web Audio sounds.
 */

import { Unsubscribe } from "firebase/firestore";
import { 
  callSignalingService, 
  CallSignalingService, 
  NetworkInterruptionWatcher, 
  NetworkInterruptionWatcherOptions 
} from "./CallSignalingService";

export { 
  callSignalingService, 
  CallSignalingService, 
  type NetworkInterruptionWatcher, 
  type NetworkInterruptionWatcherOptions 
} from "./CallSignalingService";

export type CallType = 'audio' | 'video';
export type CallStatus = 
  | 'idle'
  | 'initiating'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'rejected'
  | 'ended'
  | 'missed'
  | 'busy'
  | 'failed';

export interface CallParticipant {
  uid: string;
  name: string;
  photoURL?: string;
  phone?: string;
}

export interface CallData {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
  type: CallType;
  status: CallStatus;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  restartOffer?: RTCSessionDescriptionInit;
  restartAnswer?: RTCSessionDescriptionInit;
  createdAt: number;
  connectedAt?: number;
  endedAt?: number;
  duration?: number; // seconds
  reconnectCount?: number;
}

export interface CallCallbacks {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStatusChange?: (status: CallStatus, message?: string) => void;
  onError?: (error: Error) => void;
  onEnded?: (duration: number) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

// -------------------------------------------------------------
// Web Audio Synthesizer for Ring tones & Beeps
// -------------------------------------------------------------
class CallAudioToneEngine {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private currentSource: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play outgoing ringing tone (US/standard cadence: 440Hz + 480Hz dual tone)
  startOutgoingRingtone() {
    this.stop();
    const ctx = this.initContext();
    if (!ctx) return;

    const playPulse = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      try {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.setValueAtTime(0.08, now + 1.8);
        gain.gain.linearRampToValueAtTime(0, now + 2.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } catch (e) {
        console.warn('Outgoing tone error:', e);
      }
    };

    playPulse();
    this.intervalId = setInterval(playPulse, 4000);
  }

  // Play incoming ring melody (Pleasant digital chime)
  startIncomingRingtone() {
    this.stop();
    const ctx = this.initContext();
    if (!ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const playChime = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      try {
        melody.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;

          const noteTime = this.ctx!.currentTime + idx * 0.18;
          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.45);
        });
      } catch (e) {
        console.warn('Incoming ringtone error:', e);
      }
    };

    playChime();
    this.intervalId = setInterval(playChime, 2500);
  }

  // Play connected affirmative beep
  playConnectedChime() {
    this.stop();
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // ignore
    }
  }

  // Play call end / rejected sound
  playEndChime() {
    this.stop();
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {}
      this.currentSource = null;
    }
  }
}

export const callAudioEngine = new CallAudioToneEngine();

// -------------------------------------------------------------
// Core WebRTC Call Manager Class
// -------------------------------------------------------------
class WebRTCCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private activeCallDocUnsubscribe: Unsubscribe | null = null;
  private candidatesUnsubscribe: Unsubscribe | null = null;
  private networkWatcher: NetworkInterruptionWatcher | null = null;
  private currentCallId: string | null = null;
  private currentCallData: CallData | null = null;
  private callbacks: CallCallbacks = {};
  private callTimerId: any = null;
  private callDurationSeconds = 0;
  private isAudioMuted = false;
  private isVideoMuted = false;

  public getCallData(): CallData | null {
    return this.currentCallData;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public getDuration(): number {
    return this.callDurationSeconds;
  }

  /**
   * Acquire local camera and microphone stream
   */
  async acquireMedia(type: CallType): Promise<MediaStream> {
    // Release existing stream if any
    this.releaseMedia();

    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: type === 'video' ? {
        facingMode: 'user',
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 }
      } : false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.isAudioMuted = false;
      this.isVideoMuted = false;
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(stream);
      }
      return stream;
    } catch (err: any) {
      console.error('Error acquiring user media:', err);
      let msg = 'মাইক্রোফোন বা ক্যামেরার অনুমতি পাওয়া যায়নি।';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'দয়া করে ব্রাউজারের ক্যামেরা ও মাইক্রোফোনের অনুমতি প্রদান করুন।';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'কোনো সক্রিয় মাইক্রোফোন বা ক্যামেরা খুঁজে পাওয়া যায়নি।';
      }
      throw new Error(msg);
    }
  }

  /**
   * Release media tracks
   */
  releaseMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.localStream = null;
    }
    this.remoteStream = null;
  }

  /**
   * Initialize RTCPeerConnection with listeners
   */
  private setupPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.closePeerConnection();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.remoteStream = new MediaStream();

    // Attach local stream tracks to PC
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      if (this.callbacks.onRemoteStream && this.remoteStream) {
        this.callbacks.onRemoteStream(this.remoteStream);
      }
    };

    // Connection state listeners
    pc.onconnectionstatechange = () => {
      console.log('PeerConnection State:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        callAudioEngine.playConnectedChime();
        this.startCallTimer();
        this.callbacks.onStatusChange?.('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.callbacks.onStatusChange?.('failed', 'কল সংযোগ বিচ্ছিন্ন হয়েছে');
      } else if (pc.connectionState === 'closed') {
        // handled in end
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        this.callbacks.onStatusChange?.('connected');
      }
    };

    this.peerConnection = pc;
    return pc;
  }

  private closePeerConnection() {
    if (this.peerConnection) {
      try {
        this.peerConnection.ontrack = null;
        this.peerConnection.onicecandidate = null;
        this.peerConnection.oniceconnectionstatechange = null;
        this.peerConnection.onconnectionstatechange = null;
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }
  }

  private startCallTimer() {
    this.stopCallTimer();
    this.callDurationSeconds = 0;
    this.callTimerId = setInterval(() => {
      this.callDurationSeconds += 1;
    }, 1000);
  }

  private stopCallTimer() {
    if (this.callTimerId) {
      clearInterval(this.callTimerId);
      this.callTimerId = null;
    }
  }

  /**
   * Initiate Outgoing Call (Caller Role)
   */
  async startCall(
    caller: CallParticipant,
    receiver: CallParticipant,
    type: CallType,
    callbacks: CallCallbacks
  ): Promise<string> {
    this.callbacks = callbacks;
    this.callbacks.onStatusChange?.('initiating', 'কল শুরু হচ্ছে...');

    try {
      // 1. Acquire Local Media
      await this.acquireMedia(type);

      // 2. Setup RTCPeerConnection
      const pc = this.setupPeerConnection();

      // 3. Create Firestore Call Session with Offer SDP via CallSignalingService
      const offerDescription = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      await pc.setLocalDescription(offerDescription);

      const { callId, callData } = await callSignalingService.createCallSession(
        caller,
        receiver,
        type,
        offerDescription
      );
      this.currentCallId = callId;
      this.currentCallData = callData;

      // 4. Stream Caller ICE candidates to Firestore via CallSignalingService
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callSignalingService.sendCallerCandidate(callId, event.candidate);
        }
      };

      // Start outgoing tone
      callAudioEngine.startOutgoingRingtone();
      this.callbacks.onStatusChange?.('ringing', 'রিং হচ্ছে...');

      // 5. Listen for Remote Answer, Status Changes & ICE Restarts via CallSignalingService
      this.activeCallDocUnsubscribe = callSignalingService.listenToCall(callId, {
        onUpdate: (updatedData) => {
          this.currentCallData = updatedData;
        },
        onStatusChange: (status) => {
          if (status === 'rejected') {
            callAudioEngine.playEndChime();
            this.callbacks.onStatusChange?.('rejected', 'কল প্রত্যাখ্যাত হয়েছে');
            this.cleanup();
          } else if (status === 'ended') {
            callAudioEngine.playEndChime();
            this.callbacks.onStatusChange?.('ended', 'কল সমাপ্ত হয়েছে');
            this.cleanup();
          } else if (status === 'busy') {
            callAudioEngine.playEndChime();
            this.callbacks.onStatusChange?.('busy', 'ব্যবহারকারী অন্য কলে ব্যস্ত আছেন');
            this.cleanup();
          } else if (status === 'missed') {
            callAudioEngine.playEndChime();
            this.callbacks.onStatusChange?.('missed', 'কল উত্তর দেওয়া হয়নি');
            this.cleanup();
          }
        },
        onAnswer: async (answer) => {
          if (!pc.currentRemoteDescription && pc.signalingState === 'have-local-offer') {
            // Received Answer SDP from Receiver
            callAudioEngine.stop();
            const answerDescription = new RTCSessionDescription(answer);
            await pc.setRemoteDescription(answerDescription);
            this.callbacks.onStatusChange?.('connecting', 'সংযুক্ত হচ্ছে...');
          }
        },
        onRestartAnswer: async (restartAnswer) => {
          try {
            if (pc.signalingState === 'have-local-offer') {
              const answerDescription = new RTCSessionDescription(restartAnswer);
              await pc.setRemoteDescription(answerDescription);
              console.log('[webrtcService] Caller received ICE restart answer and set remote description');
            }
          } catch (e) {
            console.warn('[webrtcService] Error handling restartAnswer on caller:', e);
          }
        }
      });

      // 6. Listen for Callee ICE Candidates via CallSignalingService
      this.candidatesUnsubscribe = callSignalingService.listenToCalleeCandidates(callId, (candidateInit) => {
        const candidate = new RTCIceCandidate(candidateInit);
        pc.addIceCandidate(candidate).catch(err => {
          console.warn('Error adding callee ICE candidate:', err);
        });
      });

      // 7. Attach Network Interruption and Automatic ICE Reconnection Watcher
      this.networkWatcher = callSignalingService.attachNetworkInterruptionWatcher({
        callId,
        peerConnection: pc,
        isCaller: true,
        onInterrupted: () => {
          this.callbacks.onStatusChange?.('reconnecting', 'নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে...');
        },
        onReconnecting: (attempt, max) => {
          this.callbacks.onStatusChange?.('reconnecting', `পুনরায় সংযোগের চেষ্টা চলছে (${attempt}/${max})...`);
        },
        onReconnected: () => {
          this.callbacks.onStatusChange?.('connected', 'সংযোগ পুনরায় স্থাপিত হয়েছে');
        },
        onReconnectionFailed: (reason) => {
          this.callbacks.onStatusChange?.('failed', reason);
        }
      });

      // Auto-timeout after 45 seconds if no answer
      setTimeout(async () => {
        if (this.currentCallData?.status === 'ringing') {
          await callSignalingService.updateCallStatus(callId, 'missed');
        }
      }, 45000);

      return callId;
    } catch (error: any) {
      callAudioEngine.stop();
      this.cleanup();
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Answer Incoming Call (Receiver Role)
   */
  async answerCall(callId: string, callbacks: CallCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.currentCallId = callId;
    this.callbacks.onStatusChange?.('connecting', 'কল গ্রহণ করা হচ্ছে...');
    callAudioEngine.stop();

    try {
      const callData = await callSignalingService.getCallData(callId);

      if (!callData) {
        throw new Error('কলটির কোনো অস্তিত্ব নেই বা সমাপ্ত হয়ে গেছে।');
      }

      this.currentCallData = callData;

      if (callData.status !== 'ringing') {
        throw new Error('কলটি আর সক্রিয় নেই।');
      }

      // 1. Acquire Local Media
      await this.acquireMedia(callData.type);

      // 2. Setup RTCPeerConnection
      const pc = this.setupPeerConnection();

      // 3. Send Callee ICE candidates to Firestore via CallSignalingService
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          callSignalingService.sendCalleeCandidate(callId, event.candidate);
        }
      };

      // 4. Set Remote Offer Description
      if (callData.offer) {
        const offerDescription = new RTCSessionDescription(callData.offer);
        await pc.setRemoteDescription(offerDescription);
      }

      // 5. Create Answer SDP & Update session via CallSignalingService
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      await callSignalingService.setAnswer(callId, answerDescription);

      // 6. Listen for Caller ICE candidates via CallSignalingService
      this.candidatesUnsubscribe = callSignalingService.listenToCallerCandidates(callId, (candidateInit) => {
        const candidate = new RTCIceCandidate(candidateInit);
        pc.addIceCandidate(candidate).catch(err => {
          console.warn('Error adding caller candidate on receiver:', err);
        });
      });

      // 7. Listen for call termination & ICE Restarts by Caller via CallSignalingService
      this.activeCallDocUnsubscribe = callSignalingService.listenToCall(callId, {
        onUpdate: (updatedData) => {
          this.currentCallData = updatedData;
        },
        onStatusChange: (status) => {
          if (status === 'ended' || status === 'rejected') {
            callAudioEngine.playEndChime();
            this.callbacks.onStatusChange?.('ended', 'কল সমাপ্ত হয়েছে');
            this.cleanup();
          }
        },
        onRestartOffer: async (restartOffer) => {
          try {
            console.log('[webrtcService] Callee received ICE restart offer, answering...');
            const offerDescription = new RTCSessionDescription(restartOffer);
            await pc.setRemoteDescription(offerDescription);
            const answerDescription = await pc.createAnswer();
            await pc.setLocalDescription(answerDescription);
            await callSignalingService.sendIceRestartAnswer(callId, answerDescription);
          } catch (e) {
            console.warn('[webrtcService] Error answering restart offer on callee:', e);
          }
        }
      });

      // 8. Attach Network Interruption Watcher on Receiver side
      this.networkWatcher = callSignalingService.attachNetworkInterruptionWatcher({
        callId,
        peerConnection: pc,
        isCaller: false,
        onInterrupted: () => {
          this.callbacks.onStatusChange?.('reconnecting', 'নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে...');
        },
        onReconnecting: (attempt, max) => {
          this.callbacks.onStatusChange?.('reconnecting', `পুনরায় সংযোগের চেষ্টা চলছে (${attempt}/${max})...`);
        },
        onReconnected: () => {
          this.callbacks.onStatusChange?.('connected', 'সংযোগ পুনরায় স্থাপিত হয়েছে');
        },
        onReconnectionFailed: (reason) => {
          this.callbacks.onStatusChange?.('failed', reason);
        }
      });
    } catch (error: any) {
      callAudioEngine.stop();
      this.cleanup();
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Reject Incoming Call
   */
  async rejectCall(callId: string): Promise<void> {
    callAudioEngine.stop();
    try {
      await callSignalingService.updateCallStatus(callId, 'rejected');
    } catch (e) {
      console.warn('Reject call error:', e);
    } finally {
      this.cleanup();
    }
  }

  /**
   * End ongoing or ringing call
   */
  async endCall(callId?: string): Promise<void> {
    const id = callId || this.currentCallId;
    const duration = this.callDurationSeconds;

    callAudioEngine.stop();
    callAudioEngine.playEndChime();

    if (id) {
      try {
        await callSignalingService.updateCallStatus(id, 'ended', { duration });
      } catch (e) {
        console.warn('End call update error:', e);
      }
    }

    if (this.callbacks.onEnded) {
      this.callbacks.onEnded(duration);
    }

    this.cleanup();
  }

  /**
   * Mute / Unmute Microphone
   */
  toggleMicrophone(mute?: boolean): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      this.isAudioMuted = mute !== undefined ? mute : !this.isAudioMuted;
      audioTrack.enabled = !this.isAudioMuted;
    }
    return this.isAudioMuted;
  }

  /**
   * Toggle Video Camera (Enable / Disable)
   */
  toggleVideo(mute?: boolean): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      this.isVideoMuted = mute !== undefined ? mute : !this.isVideoMuted;
      videoTrack.enabled = !this.isVideoMuted;
    }
    return this.isVideoMuted;
  }

  /**
   * Switch between front and back camera on mobile
   */
  async switchCamera(): Promise<void> {
    if (!this.localStream || !this.peerConnection) return;
    const currentVideoTrack = this.localStream.getVideoTracks()[0];
    if (!currentVideoTrack) return;

    try {
      const currentFacingMode = currentVideoTrack.getSettings()?.facingMode;
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender => sender.track?.kind === 'video');

      if (videoSender && newVideoTrack) {
        await videoSender.replaceTrack(newVideoTrack);
        currentVideoTrack.stop();
        this.localStream.removeTrack(currentVideoTrack);
        this.localStream.addTrack(newVideoTrack);
        if (this.callbacks.onLocalStream) {
          this.callbacks.onLocalStream(this.localStream);
        }
      }
    } catch (err) {
      console.warn('Failed to switch camera:', err);
    }
  }

  /**
   * Cleanup all listeners, streams, and state
   */
  cleanup() {
    this.stopCallTimer();
    callAudioEngine.stop();

    if (this.networkWatcher) {
      this.networkWatcher.cleanup();
      this.networkWatcher = null;
    }

    if (this.activeCallDocUnsubscribe) {
      this.activeCallDocUnsubscribe();
      this.activeCallDocUnsubscribe = null;
    }

    if (this.candidatesUnsubscribe) {
      this.candidatesUnsubscribe();
      this.candidatesUnsubscribe = null;
    }

    this.closePeerConnection();
    this.releaseMedia();
    this.currentCallId = null;
    this.currentCallData = null;
    this.callDurationSeconds = 0;
  }
}

export const webrtcCallService = new WebRTCCallService();
export default webrtcCallService;

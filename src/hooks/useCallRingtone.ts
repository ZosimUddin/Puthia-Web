/**
 * Puthia Digital Platform — Incoming Call Ringtone & Haptic Vibration Utility / Hook
 *
 * Plays pleasant digital chimes & handles vibration patterns for WebRTC incoming calls.
 * Respects user preferences, browser audio policies, and device mute/silent/vibration states.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { callAudioEngine, CallData } from "../services/webrtcService";

export interface RingtoneState {
  isRinging: boolean;
  isMuted: boolean;
  toggleRingtoneMute: () => void;
  stopRingtone: () => void;
}

const CALL_RINGTONE_MUTED_KEY = "puthia_call_ringtone_muted";

export function useCallRingtone(incomingCall: CallData | null): RingtoneState {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CALL_RINGTONE_MUTED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isRinging, setIsRinging] = useState(false);
  const vibrationIntervalRef = useRef<any>(null);

  // Toggle ringtone mute in state & local storage
  const toggleRingtoneMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(CALL_RINGTONE_MUTED_KEY, next ? "true" : "false");
      } catch {}
      if (next) {
        callAudioEngine.stop();
      } else if (incomingCall) {
        callAudioEngine.startIncomingRingtone();
      }
      return next;
    });
  }, [incomingCall]);

  const stopRingtone = useCallback(() => {
    callAudioEngine.stop();
    setIsRinging(false);
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!incomingCall) {
      stopRingtone();
      return;
    }

    setIsRinging(true);

    // 1. Play Web Audio Ringtone if not muted by user preference
    if (!isMuted) {
      try {
        callAudioEngine.startIncomingRingtone();
      } catch (err) {
        console.warn("Could not start incoming ringtone:", err);
      }
    }

    // 2. Trigger Haptic Vibration pattern for mobile devices (Standard incoming call pulse)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        const ringVibrationPattern = [500, 250, 500, 250, 1000]; // Vibrate-Pause-Vibrate-Pause-Long pause
        navigator.vibrate(ringVibrationPattern);

        vibrationIntervalRef.current = setInterval(() => {
          try {
            navigator.vibrate(ringVibrationPattern);
          } catch {}
        }, 2500);
      } catch (e) {
        console.warn("Vibration not permitted or supported:", e);
      }
    }

    return () => {
      stopRingtone();
    };
  }, [incomingCall, isMuted, stopRingtone]);

  return {
    isRinging,
    isMuted,
    toggleRingtoneMute,
    stopRingtone
  };
}

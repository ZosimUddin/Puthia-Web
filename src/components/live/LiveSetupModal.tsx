import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, RefreshCw, Radio, X, MapPin, Globe, Users, Shield, Image, Sparkles } from 'lucide-react';
import { LIVE_CATEGORIES, LiveCategory, LiveAudience } from '../../types/live';

interface LiveSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLive: (data: {
    title: string;
    description?: string;
    coverUrl?: string;
    category: LiveCategory;
    audience: LiveAudience;
    location?: string;
  }) => Promise<void>;
  currentUser?: any;
}

export const LiveSetupModal: React.FC<LiveSetupModalProps> = ({
  isOpen,
  onClose,
  onStartLive,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LiveCategory>('News');
  const [audience, setAudience] = useState<LiveAudience>('public');
  const [location, setLocation] = useState('পুঠিয়া রাজবাড়ী');
  const [coverUrl, setCoverUrl] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera preview
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isCameraOn ? { facingMode } : false,
          audio: isMicOn,
        });

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera preview not available, using fallback renderer:', err);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, isCameraOn, facingMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onStartLive({
        title: title.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim(),
        category,
        audience,
        location,
      });

      // Stop local preview tracks before modal close
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      onClose();
    } catch (error) {
      console.error('Error starting live:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-xl text-white shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-550 animate-ping" />
            <h3 className="font-bold text-base flex items-center gap-1.5 text-white">
              <Radio size={18} className="text-red-500 animate-pulse" /> গো লাইভ (Go Live Setup)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Camera Preview Player */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group shadow-inner">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <CameraOff size={36} />
                <span className="text-xs font-semibold">ক্যামেরা বন্ধ রয়েছে</span>
              </div>
            )}

            {/* Overlaid Camera Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isCameraOn ? 'bg-white/15 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {isCameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isMicOn ? 'bg-white/15 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {isMicOn ? <Mic size={14} /> : <MicOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="p-2 bg-white/15 hover:bg-white/25 rounded-full text-white cursor-pointer"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <span className="bg-emerald-600/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                <Sparkles size={11} /> ক্যামেরা তৈরি
              </span>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              লাইভের শিরোনাম / Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: আজকের পুঠিয়ার সর্বশেষ সংবাদ লাইভ..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>

          {/* Category & Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LiveCategory)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                {LIVE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameBangla}
                  </option>
                ))}
              </select>
            </div>

            {/* Audience Privacy Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">অডিয়েন্স প্রাইভেসি</label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value as LiveAudience)}
                className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="public">🌎 পাবলিক (সবাই দেখতে পাবে)</option>
                <option value="friends">👥 ফ্রেন্ডস (শুধু বন্ধুরা)</option>
                <option value="followers">⭐ ফলোয়ার্স (শুধু ফলোয়াররা)</option>
                <option value="group">🏘️ গ্রুপ মেম্বারস</option>
                <option value="custom">🔒 কাস্টম (প্রাইভেট)</option>
              </select>
            </div>
          </div>

          {/* Location & Cover Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-400" /> স্থান / লোকেশন
              </label>
              <input
                type="text"
                placeholder="যেমন: বানেশ্বর হাট, পুঠিয়া"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Image size={12} className="text-emerald-400" /> কভার ফটো URL (ঐচ্ছিক)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/15 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Radio size={16} className="animate-pulse" />
              {isSubmitting ? 'লাইভ শুরু হচ্ছে...' : 'Start Live Video (লাইভ শুরু করুন)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

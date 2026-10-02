import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Video as VideoIcon, 
  Music, 
  Scissors, 
  Type, 
  Smile, 
  MapPin, 
  Globe, 
  Users, 
  Lock, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Sparkles,
  AlertCircle,
  Hash,
  Volume2,
  VolumeX,
  FlipHorizontal
} from 'lucide-react';
import { ReelAudio } from '../../../types';
import { reelService } from '../../../services/reelService';
import { MusicLibraryModal } from './MusicLibraryModal';
import { DEFAULT_REEL_RULES } from '../../../data/reelAudioData';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSuccess: (newReelId: string) => void;
}

const QUICK_HASHTAGS = ['#পুঠিয়া', '#আড্ডা', '#রাজশাহী', '#শর্টস', '#রিলস', '#গ্রামবাংলা', '#সৌন্দর্য', '#সংস্কৃতি'];
const QUICK_LOCATIONS = ['পুঠিয়া রাজবাড়ি', 'শিব মন্দির পুঠিয়া', 'পুঠিয়া বাজার', 'রাজশাহী', 'পদ্মা পাড়'];

const FILTER_OPTIONS = [
  { id: 'none', label: 'স্বাভাবিক', css: 'none' },
  { id: 'vintage', label: 'ভিন্টেজ', css: 'sepia(0.35) contrast(1.1) brightness(0.95)' },
  { id: 'warm', label: 'ওয়ার্ম', css: 'sepia(0.2) saturate(1.3) contrast(1.05)' },
  { id: 'cool', label: 'কুল', css: 'hue-rotate(180deg) saturate(1.1) contrast(1.05)' },
  { id: 'vivid', label: 'ভাইব্র্যান্ট', css: 'saturate(1.6) contrast(1.2)' },
  { id: 'grayscale', label: 'ব্ল্যাক-হোয়াইট', css: 'grayscale(1)' },
  { id: 'sepia', label: 'সেপিয়া', css: 'sepia(0.8)' },
];

export const CreateReelModal: React.FC<CreateReelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess
}) => {
  // Step: 1 = Select/Record, 2 = Edit & Details, 3 = Uploading/Processing
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Camera Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reel Details
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'followers' | 'only_me'>('public');
  const [selectedAudio, setSelectedAudio] = useState<ReelAudio | null>(null);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [textOverlays, setTextOverlays] = useState<{ id: string; text: string; color: string; fontSize: number; x: number; y: number }[]>([]);
  const [newText, setNewText] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [textColor, setTextColor] = useState('#ffffff');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoFilter, setVideoFilter] = useState<string>('none');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Processing & Error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'uploading' | 'processing' | 'published'>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setVideoFile(null);
    setVideoSrc('');
    setVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(90);
    setCaption('');
    setLocation('');
    setSelectedAudio(null);
    setTextOverlays([]);
    setVideoFilter('none');
    setPlaybackSpeed(1);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordSeconds(0);
  };

  // Start Camera for Live Recording
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMessage("ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ভিডিও ফাইল আপলোড করুন।");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop
      mediaRecorderRef.current?.stop();
      stopCamera();
    } else {
      // Start
      if (!streamRef.current) return;
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `reel_${Date.now()}.webm`, { type: 'video/webm' });
        handleVideoSelected(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= DEFAULT_REEL_RULES.maxDuration - 1) {
            mediaRecorderRef.current?.stop();
            stopCamera();
            return DEFAULT_REEL_RULES.maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoSelected(file);
    }
  };

  const handleVideoSelected = (file: File) => {
    setErrorMessage(null);

    // Rule Check: File size
    const maxBytes = DEFAULT_REEL_RULES.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`ভিডিও সাইজ সর্বোচ্চ ${DEFAULT_REEL_RULES.maxFileSizeMB}MB হতে পারবে।`);
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSrc(url);

    // Get Video Duration and generate thumbnail
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.onloadedmetadata = () => {
      const dur = Math.round(tempVideo.duration) || 15;
      if (dur > DEFAULT_REEL_RULES.maxDuration) {
        setTrimEnd(DEFAULT_REEL_RULES.maxDuration);
      } else {
        setTrimEnd(dur);
      }
      setVideoDuration(dur);

      // Generate thumbnail canvas
      tempVideo.currentTime = 1;
    };

    tempVideo.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 854;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.8));
      }
      setStep(2);
    };
  };

  // Extract Hashtags & Mentions
  const extractTagsAndMentions = (text: string) => {
    const hashtagRegex = /#[^\s#]+/g;
    const mentionRegex = /@[^\s@]+/g;
    const hashtags = (text.match(hashtagRegex) || []).map(t => t.trim());
    const mentions = (text.match(mentionRegex) || []).map(m => m.trim());
    return { hashtags, mentions };
  };

  // Add Quick Hashtag
  const addHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption(prev => prev ? `${prev} ${tag}` : tag);
    }
  };

  // Add Text Overlay
  const handleAddTextOverlay = () => {
    if (!newText.trim()) return;
    setTextOverlays(prev => [
      ...prev,
      {
        id: `text_${Date.now()}`,
        text: newText.trim(),
        color: textColor,
        fontSize: 18,
        x: 50,
        y: 40 + (prev.length * 15)
      }
    ]);
    setNewText('');
    setIsAddingText(false);
  };

  // Submit and Publish Reel
  const handlePublishReel = async () => {
    if (!currentUser || !videoSrc) return;
    setStep(3);
    setProcessingStatus('uploading');
    setUploadProgress(15);

    try {
      // Simulate real-time progress steps for video encoding
      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(45);
      
      await new Promise(r => setTimeout(r, 600));
      setProcessingStatus('processing');
      setUploadProgress(80);

      const { hashtags, mentions } = extractTagsAndMentions(caption);

      const effectiveDuration = Math.min(
        DEFAULT_REEL_RULES.maxDuration,
        Math.max(3, trimEnd - trimStart)
      );

      // Create document in Firestore
      const newReelId = await reelService.createReel({
        authorId: currentUser.uid,
        authorName: currentUser.name || currentUser.displayName || 'আড্ডা ইউজার',
        authorUsername: currentUser.nickname || currentUser.email?.split('@')[0] || 'user',
        authorAvatar: currentUser.photoURL || '',
        isVerified: !!currentUser.accountVerifiedAwarded || !!currentUser.profileCompleteAwarded,
        videoUrl: videoSrc,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        caption: caption.trim(),
        hashtags: hashtags.length > 0 ? hashtags : ['#পুঠিয়া', '#আড্ডা'],
        mentions,
        location: location.trim() || undefined,
        audioTitle: selectedAudio ? selectedAudio.title : `Original Audio · ${currentUser.name || 'User'}`,
        audioUrl: selectedAudio?.audioUrl,
        originalAudio: !selectedAudio,
        audioAuthor: selectedAudio ? selectedAudio.artist : (currentUser.name || 'User'),
        duration: effectiveDuration,
        privacy,
        videoFilter: videoFilter !== 'none' ? videoFilter : undefined,
        playbackSpeed: playbackSpeed !== 1 ? playbackSpeed : undefined,
        status: 'published',
        textOverlays: textOverlays.length > 0 ? textOverlays : undefined
      });

      setUploadProgress(100);
      setProcessingStatus('published');

      setTimeout(() => {
        onSuccess(newReelId);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Reel publish error:", err);
      setErrorMessage("রিল প্রকাশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      setStep(2);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden my-auto flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <VideoIcon size={18} />
            </div>
            <h3 className="font-black text-base">
              {step === 1 ? 'নতুন রিল তৈরি করুন' : step === 2 ? 'রিল এডিটর ও বিবরণ' : 'রিল প্রসেসিং'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="px-4 py-2 bg-rose-500/20 border-b border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Select File or Live Record */}
        {step === 1 && (
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-6 flex-1 min-h-[400px]">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/mp4,video/webm,video/quicktime,video/ogg"
              onChange={handleFileChange}
              className="hidden" 
            />

            {/* Camera Viewfinder if live */}
            {streamRef.current ? (
              <div className="relative w-full max-w-xs aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                <video 
                  ref={cameraVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
                
                {/* Live Timer */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-red-600/80 backdrop-blur-md rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <span>{recordSeconds}s / {DEFAULT_REEL_RULES.maxDuration}s</span>
                </div>

                {/* Flip Camera */}
                <button
                  onClick={() => {
                    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                    startCamera();
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white cursor-pointer border-0"
                >
                  <FlipHorizontal size={18} />
                </button>

                {/* Record Button */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all cursor-pointer ${
                      isRecording ? 'bg-red-600 scale-110' : 'bg-red-500 hover:scale-105'
                    }`}
                  >
                    {isRecording ? <div className="w-6 h-6 bg-white rounded-md" /> : <div className="w-8 h-8 bg-white rounded-full" />}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="p-3 bg-white/20 rounded-full text-white cursor-pointer border-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg">
                  <VideoIcon size={38} />
                </div>

                <div>
                  <h4 className="font-black text-lg text-white">ভিডিও নির্বাচন করুন বা রেকর্ড করুন</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    সর্বোচ্চ {DEFAULT_REEL_RULES.maxDuration} সেকেন্ডের এবং {DEFAULT_REEL_RULES.maxFileSizeMB}MB সাইজের যেকোনো ভার্টিক্যাল ভিডিও আপলোড করুন
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer border-0"
                  >
                    <UploadCloud size={20} />
                    <span>গ্যালারি / ফাইল থেকে আপলোড</span>
                  </button>

                  <button
                    onClick={startCamera}
                    className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera size={20} className="text-emerald-400" />
                    <span>ক্যামেরা দিয়ে রেকর্ড</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Reel Editor & Metadata */}
        {step === 2 && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Video Preview & Overlay Tools */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[240px] aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-white/20 shadow-2xl group">
                <video
                  ref={previewVideoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted={false}
                  style={{ filter: FILTER_OPTIONS.find(f => f.id === videoFilter)?.css || 'none' }}
                  className="w-full h-full object-cover"
                  onClick={() => {
                    if (previewVideoRef.current) {
                      if (isPlaying) previewVideoRef.current.pause();
                      else previewVideoRef.current.play();
                      setIsPlaying(!isPlaying);
                    }
                  }}
                />

                {/* Text Overlays Render */}
                {textOverlays.map((t) => (
                  <div 
                    key={t.id} 
                    className="absolute font-black drop-shadow-lg px-2 py-0.5 rounded pointer-events-none"
                    style={{ 
                      color: t.color, 
                      top: `${t.y}%`, 
                      left: `${t.x}%`, 
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${t.fontSize}px`,
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {t.text}
                  </div>
                ))}

                {/* Play/Pause Button on hover */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <Play size={40} className="text-white fill-current opacity-80" />
                  </div>
                )}

                {/* Audio Badge preview */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold text-white border border-white/10">
                  <Music size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {selectedAudio ? selectedAudio.title : 'অরিজিনাল অডিও'}
                  </span>
                </div>
              </div>

              {/* Video Quick Controls */}
              <div className="w-full max-w-[240px] mt-3 space-y-2.5">
                <button
                  onClick={() => setIsMusicModalOpen(true)}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
                >
                  <Music size={14} className="text-emerald-400" />
                  <span>{selectedAudio ? 'গান পরিবর্তন করুন' : 'মিউজিক যোগ করুন'}</span>
                </button>

                <button
                  onClick={() => setIsAddingText(!isAddingText)}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
                >
                  <Type size={14} className="text-blue-400" />
                  <span>ভিডিওতে টেক্সট যোগ</span>
                </button>

                {/* Playback SpeedSelector */}
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span>প্লেব্যাক স্পিড</span>
                    <span className="text-emerald-400 font-bold">{playbackSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1, 1.5, 2].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(sp);
                          if (previewVideoRef.current) {
                            previewVideoRef.current.playbackRate = sp;
                          }
                        }}
                        className={`py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer border ${
                          playbackSpeed === sp
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {sp}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Filters Bar */}
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-[10px] font-extrabold text-slate-400 mb-1 flex items-center justify-between">
                    <span>ফিল্টার ও টোন</span>
                    <span className="text-amber-400 font-bold">
                      {FILTER_OPTIONS.find(f => f.id === videoFilter)?.label}
                    </span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {FILTER_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setVideoFilter(f.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                          videoFilter === f.id
                            ? 'bg-amber-500 border-amber-300 text-slate-950 font-black'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Input Popup */}
              {isAddingText && (
                <div className="w-full max-w-[240px] mt-2 p-2 bg-slate-800 rounded-2xl border border-white/10 space-y-2">
                  <input 
                    type="text" 
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="টেক্সট লিখুন..."
                    className="w-full px-2 py-1 bg-white/10 rounded-lg text-xs text-white outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {['#ffffff', '#22c55e', '#ef4444', '#eab308', '#38bdf8'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setTextColor(c)}
                          className={`w-5 h-5 rounded-full border border-white/20 cursor-pointer ${textColor === c ? 'ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleAddTextOverlay}
                      className="px-2 py-1 bg-emerald-600 rounded-lg text-[10px] font-black cursor-pointer border-0 text-white"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Caption, Hashtags, Privacy, Location */}
            <div className="md:col-span-7 space-y-4">
              {/* Caption & Hashtag input */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">
                  ক্যাপশন ও হ্যাশট্যাগ
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="আপনার রিল সম্পর্কে কিছু লিখুন... #পুঠিয়া #আড্ডা"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
                  maxLength={500}
                />

                {/* Quick Hashtag pills */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <Hash size={13} className="text-emerald-400" />
                  {QUICK_HASHTAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addHashtag(tag)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-emerald-600/30 hover:text-emerald-300 rounded-lg text-[11px] font-bold text-slate-300 transition-colors cursor-pointer border border-white/5"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin size={13} className="text-rose-400" />
                  <span>লোকেশন যুক্ত করুন</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="যেমন: পুঠিয়া রাজবাড়ি, রাজশাহী"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-bold text-slate-400 transition-colors cursor-pointer border border-white/5"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Selector */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">
                  প্রাইভেসি ও দর্শক
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      privacy === 'public' 
                        ? 'bg-emerald-950/60 border-emerald-500 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Globe size={16} className={privacy === 'public' ? 'text-emerald-400' : ''} />
                    <span className="text-[11px] font-bold">পাবলিক</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacy('friends')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      privacy === 'friends' 
                        ? 'bg-emerald-950/60 border-emerald-500 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Users size={16} className={privacy === 'friends' ? 'text-emerald-400' : ''} />
                    <span className="text-[11px] font-bold">বন্ধুরা</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacy('only_me')}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      privacy === 'only_me' 
                        ? 'bg-emerald-950/60 border-emerald-500 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Lock size={16} className={privacy === 'only_me' ? 'text-emerald-400' : ''} />
                    <span className="text-[11px] font-bold">শুধু আমি</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-2xl text-xs font-black transition-colors cursor-pointer border-0"
                >
                  পরিবর্তন করুন
                </button>
                <button
                  type="button"
                  onClick={handlePublishReel}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition-all cursor-pointer border-0 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>রিল শেয়ার করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Uploading & Video Processing */}
        {step === 3 && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1 min-h-[350px]">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-emerald-400">
                {uploadProgress}%
              </div>
            </div>

            <div>
              <h4 className="font-black text-lg text-white">
                {processingStatus === 'uploading' && 'ভিডিও আপলোড হচ্ছে...'}
                {processingStatus === 'processing' && 'ভিডিও প্রসেসিং ও অপটিমাইজেশন চলছে...'}
                {processingStatus === 'published' && '🎉 সফলভাবে প্রকাশিত হয়েছে!'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                অনুগ্রহ করে অপেক্ষা করুন, আপনার রিল শর্ট ভিডিওটি আড্ডায় যুক্ত হচ্ছে
              </p>
            </div>

            <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Music Library Submodal */}
        <MusicLibraryModal
          isOpen={isMusicModalOpen}
          onClose={() => setIsMusicModalOpen(false)}
          onSelectAudio={(audio) => setSelectedAudio(audio)}
          selectedAudioId={selectedAudio?.id}
        />
      </div>
    </div>
  );
};

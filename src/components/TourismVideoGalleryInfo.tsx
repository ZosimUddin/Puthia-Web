import React, { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Share2, Youtube, Clock, ExternalLink, Sparkles, Film, X, Search } from "lucide-react";
import { UnifiedHeroHeader } from "./common/UnifiedDesignSystem";

interface VideoItem {
  id: string;
  title: string;
  banglaTitle: string;
  duration: string;
  creator: string;
  description: string;
  youtubeUrl: string;
  embedId: string;
  scenes: string[]; // List of subtitles/scenes to show during mock playback
  category: "doc" | "vlog" | "aerial";
}

const VIDEOS: VideoItem[] = [
  {
    id: "vid1",
    title: "Puthia Heritage Documentary - Somoy TV",
    banglaTitle: "ইতিহাস ও ঐতিহ্যের পুঠিয়া রাজবাড়ী - সময় টিভি ডকুমেন্টারি",
    duration: "০৮:৪৫",
    creator: "সময় নিউজ (Somoy News)",
    description: "পুঠিয়া উপজেলার শত বছরের রাজকীয় স্থাপনা, রাজ পরিবারগুলোর উত্থান-পতন এবং ঐতিহাসিক মন্দির নিয়ে তৈরি বিশেষ অনুসন্ধান ও তথ্যচিত্র।",
    youtubeUrl: "https://www.youtube.com/results?search_query=Puthia+Rajbari+Somoy+TV",
    embedId: "zB9nN1LOnz8",
    scenes: [
      "[00:01] কুয়াশা ঘেরা ভোরের শান্ত শিব মন্দির ও তারাপুরের দৃশ্য...",
      "[00:15] রাজবাড়ী চত্বরের প্রধান সিংহ তোরণ গেট দিয়ে প্রবেশ...",
      "[00:45] ধারাভাষ্যকার পাঁচআনি রাজপ্রাসাদের চুন-সুরকি ও ইতিহাস তুলে ধরছেন...",
      "[01:30] পঞ্চরত্ন গোবিন্দ মন্দিরের সূক্ষ্ম টেরাকোটা ফলকের ক্লোজ শট...",
      "[02:45] দোলমঞ্চের সিঁড়ি বেয়ে ওপরে ওঠার রোমাঞ্চকর দৃশ্য...",
      "[05:00] ইতিহাসবেত্তা পুঠিয়া রাজবংশের সমাজসেবা নিয়ে কথা বলছেন...",
      "[08:00] অপরাহ্ণে দিঘির জলে মন্দিরের চমৎকার গোধূলি প্রতিচ্ছবি..."
    ],
    category: "doc"
  },
  {
    id: "vid2",
    title: "Travel Vlog: Terracotta Capital Puthia",
    banglaTitle: "টেরাকোটার শহর পুঠিয়া: একদিনের ট্রাভেল ভ্লগ",
    duration: "১২:১০",
    creator: "নাদিম ট্রাভেল ডায়েরি (Nadim Vlogs)",
    description: "ঢাকা থেকে মাত্র ১০০০ টাকা বাজেটে কীভাবে একদিনে পুঠিয়ার সবগুলো দর্শনীয় স্থান এবং তারাপুর হাওয়াখানা ঘুরে দেখা সম্ভব তার দুর্দান্ত ট্রাভেল গাইড।",
    youtubeUrl: "https://www.youtube.com/results?search_query=Puthia+Rajbari+Vlog",
    embedId: "f7I-zSOf4aU",
    scenes: [
      "[00:01] ঢাকা কল্যানপুর বাসস্ট্যান্ড থেকে রাতের বাসে রওনা...",
      "[01:20] সাতসকালে পুঠিয়া বাসস্ট্যান্ডে অবতরণ ও নাস্তা গ্রহণ...",
      "[03:00] রিকশায় প্রথম দর্শনেই বড় শিব মন্দিরের সৌন্দর্য দেখে মুগ্ধতা...",
      "[05:30] রাজবাড়ীর টিকিট কাউন্টার ও কাচারি ঘরের গাইড...",
      "[08:15] ঐতিহ্যবাহী আদি মিষ্টির দোকানে স্পেশাল খাসি দইয়ের রিভিউ...",
      "[10:00] তারাপুর হাওয়াখানায় ইজিবাইকে ভ্রমণের চমৎকার দৃশ্য..."
    ],
    category: "vlog"
  },
  {
    id: "vid3",
    title: "4K Cinematic Drone Tour of Puthia Temple Square",
    banglaTitle: "পুঠিয়া মন্দির চত্বরের ৪কে সিনেমাটিক ড্রোন শট",
    duration: "০৪:১৫",
    creator: "স্কাই ভিউ বিডি (Sky View BD)",
    description: "উচ্চ ক্ষমতাসম্পন্ন ড্রোনের মাধ্যমে সম্পূর্ণ ৪কে রেজোলিউশনে আকাশ থেকে ধারণকৃত পুঠিয়া রাজবাড়ী, শিব সরোবর এবং ঐতিহাসিক মন্দিরের সিনেমাটিক কোণ।",
    youtubeUrl: "https://www.youtube.com/results?search_query=Puthia+Rajbari+Drone+4K",
    embedId: "8yL0_7M6-xU",
    scenes: [
      "[00:01] ১০০০ ফুট উচ্চতায় বিশাল শ্যামসাগর দিঘির আকাশচুম্বী দৃশ্য...",
      "[01:00] রাজপ্রাসাদের ছাদ ও পেছনের রানীমহলের দুর্লভ কোণ...",
      "[02:15] শিব মন্দিরের পঞ্চরত্ন চূড়াগুলোর ওপর ড্রোনের নিখুঁত মোশন ফ্রেম...",
      "[03:30] দোলমঞ্চের জ্যামিতিক নকশার একটি চোখজুড়ানো উল্লম্ব শট..."
    ],
    category: "aerial"
  }
];

interface TourismVideoGalleryInfoProps {
  onGoBack: () => void;
  hideHeader?: boolean;
}

export function TourismVideoGalleryInfo({ onGoBack, hideHeader = false }: TourismVideoGalleryInfoProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Handle mock video player progression
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          // Increment progress
          const nextProg = prev + 1.5;
          
          // Calculate subtitle scene index based on progress
          const totalScenes = selectedVideo.scenes.length;
          const targetIndex = Math.floor((prev / 100) * totalScenes);
          if (targetIndex !== currentSceneIndex && targetIndex < totalScenes) {
            setCurrentSceneIndex(targetIndex);
          }
          
          return nextProg;
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedVideo, currentSceneIndex]);

  const handlePlayToggle = () => {
    if (!isPlaying && progress === 0) {
      // Show simulated loading spinner first
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }, 1000);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleResetVideo = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentSceneIndex(0);
  };

  const selectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setProgress(0);
    setCurrentSceneIndex(0);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 pb-8 font-sans" id="video-gallery-section">
      
      {/* 1. Header Banner */}
      {!hideHeader && (
        <UnifiedHeroHeader
          title="🎬 ভিডিও গ্যালারি (ডকুমেন্টারি)"
          subtitle="ঐতিহাসিক পুঠিয়া রাজবাড়ী ও পোড়ামাটির স্থান নিয়ে নির্মিত সেরা সিনেমাটিক ডকুমেন্টারি, ড্রোন ট্রাভেল শো ও ভ্লগ।"
          showBack={true}
          onBack={onGoBack}
          rightAction={
            <button 
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                }
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border shadow-sm ${
                showSearch 
                  ? "bg-[#FFC107] text-red-950 border-[#FFC107] hover:bg-amber-400" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/10"
              }`}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          }
          searchQuery={showSearch ? searchQuery : undefined}
          onSearchChange={showSearch ? setSearchQuery : undefined}
          searchPlaceholder="ভিডিও বা ডকুমেন্টারি খুঁজুন..."
          className="rounded-t-none rounded-b-[28px] sm:rounded-b-[36px] mb-6 pt-3.5 pb-5"
        />
      )}

      {/* 2. Interactive Video Player Dashboard */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-900 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-0">
        
        {/* Left 2 Columns: Video Player Interface */}
        <div className="md:col-span-2 flex flex-col justify-between h-[360px] md:h-[420px] bg-black relative select-none overflow-hidden">
          
          {isPlaying ? (
            <div className="absolute inset-0 w-full h-full z-20 animate-fade-in bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0`}
                title={selectedVideo.banglaTitle}
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
              {/* Overlay Exit Button */}
              <button 
                onClick={handleResetVideo}
                className="absolute top-4 right-4 bg-black/80 hover:bg-red-600 text-white rounded-full p-2.5 border border-white/10 shadow-lg transition-all cursor-pointer z-30 flex items-center justify-center hover:scale-105"
                title="প্লেব্যাক বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : null}

          {/* Top Info Bar */}
          <div className="relative z-10 flex justify-between items-center text-xs text-slate-300 font-bold bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 m-4">
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span> লাইভ সিমুলেশন
            </span>
            <span className="font-mono text-[11px]">{selectedVideo.duration}</span>
          </div>

          {/* Center Screen: Loader or Subtitles or Play Trigger */}
          <div className="flex flex-col items-center justify-center text-center px-4 flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-red-400 font-bold animate-pulse font-mono uppercase">BUFFING STREAM...</p>
              </div>
            ) : (
              <button 
                onClick={handlePlayToggle}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg cursor-pointer z-10"
              >
                <Play size={26} fill="white" className="ml-1" />
              </button>
            )}
          </div>

          {/* Bottom Player Controls */}
          <div className="relative z-10 space-y-3 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 m-4">
            
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="bg-red-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                <span>{isPlaying ? `${Math.round(progress)}%` : "০:০০"}</span>
                <span>{selectedVideo.duration}</span>
              </div>
            </div>

            {/* Icons row */}
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePlayToggle}
                  className="hover:text-red-500 transition cursor-pointer"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button 
                  onClick={handleResetVideo}
                  className="hover:text-slate-400 transition cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-slate-400 transition cursor-pointer"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Maximize2 size={16} className="text-slate-400 hover:text-white transition cursor-pointer" />
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: Videos List Sidebar */}
        <div className="bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between">
          
          <div className="p-4 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Film className="w-4 h-4 text-red-500" /> প্লেলিস্ট ও ভিডিও:
            </h4>
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[220px] md:max-h-full">
            {VIDEOS.map((vid) => {
              const isSelected = vid.id === selectedVideo.id;
              return (
                <div
                  key={vid.id}
                  onClick={() => selectVideo(vid)}
                  className={`p-3 rounded-2xl text-left border cursor-pointer transition ${
                    isSelected 
                      ? "bg-slate-800 border-red-600/50" 
                      : "bg-slate-950/40 border-slate-800/40 hover:bg-slate-800/30"
                  }`}
                >
                  <h5 className="font-bold text-xs text-slate-200 line-clamp-1 leading-tight mb-1">
                    {vid.banglaTitle}
                  </h5>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold font-mono">
                    <span>By {vid.creator.split(" (")[0]}</span>
                    <span className="flex items-center gap-1 text-red-400"><Clock size={10} /> {vid.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar CTA / Action */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <a
              href={selectedVideo.youtubeUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Youtube className="w-4 h-4" /> ইউটিউবে সরাসরি দেখুন <ExternalLink size={12} />
            </a>
          </div>

        </div>

      </div>

      {/* 3. Detail description of the actively selected video */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left space-y-3">
        <span className="bg-red-50 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
          চলতি ভিডিওর বিবরণ ও তথ্যচিত্র:
        </span>
        <h3 className="font-serif font-black text-slate-800 text-lg md:text-xl leading-tight">
          {selectedVideo.banglaTitle}
        </h3>
        <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify font-medium">
          {selectedVideo.description}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold font-mono border-t border-slate-100 pt-3">
          <span>আলোকচিত্র নির্মাতা: <strong className="text-slate-600">{selectedVideo.creator}</strong></span>
          <span>•</span>
          <span>ধরণ: <strong className="text-slate-600">{selectedVideo.category === "doc" ? "ঐতিহাসিক ডকুমেন্টারি" : selectedVideo.category === "vlog" ? "ট্রাভেল ভ্লগ" : "ড্রোন সিনেমাটিক শট"}</strong></span>
        </div>
      </div>

    </div>
  );
}

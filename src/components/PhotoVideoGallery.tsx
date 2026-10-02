import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Video, 
  Eye, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  Film
} from "lucide-react";

interface Props { onGoBack: () => void; }

interface PhotoAlbum {
  id: string;
  type: "photo";
  title: string;
  location: string;
  date: string;
  description: string;
  images: string[];
}

interface VideoHighlight {
  id: string;
  type: "video";
  title: string;
  location: string;
  date: string;
  description: string;
  duration: string;
  thumbnail: string;
  embedId?: string;
}

type GalleryItem = PhotoAlbum | VideoHighlight;

export const PhotoVideoGallery: React.FC<Props> = ({ onGoBack }) => {
  const [filter, setFilter] = useState<"photo" | "video">("photo");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Modal view states
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  const [selectedVideo, setSelectedVideo] = useState<VideoHighlight | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState<boolean>(false);

  // New Media Form state
  const [newMediaType, setNewMediaType] = useState<"photo" | "video">("photo");
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaLocation, setNewMediaLocation] = useState("");
  const [newMediaDetails, setNewMediaDetails] = useState("");
  const [newMediaCategory, setNewMediaCategory] = useState("festival");

  // Video progress timer ref
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unsplash preset links for different categories
  const categoryImages: Record<string, string[]> = {
    festival: [
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608958416717-3806fb76b813?auto=format&fit=crop&w=800&q=80"
    ],
    architecture: [
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
    ],
    sports: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"
    ],
    nature: [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"
    ]
  };

  const videoThumbnails: Record<string, string> = {
    festival: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    architecture: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    sports: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    nature: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80"
  };

  // Initial datasets
  const [photoAlbums, setPhotoAlbums] = useState<PhotoAlbum[]>([
    {
      id: "photo_1",
      type: "photo",
      title: "পুঠিয়া রথযাত্রা উৎসবের হাইলাইটস",
      location: "পুঠিয়া রাজবাড়ী ও রথ মন্দির",
      date: "১০ জুলাই ২০২৬",
      description: "শত বছরের ঐতিহ্যবাহী পুঠিয়া রথযাত্রা উৎসবের রাজকীয় আয়োজন ও সহস্রাধিক হিন্দু পুণ্যার্থীদের উৎসবমুখর উপস্থিতি। রথের বর্ণাঢ্য সাজসজ্জা এবং রাজপ্রাসাদের সামনের প্রাঙ্গণে বিশাল লোকজ মেলা।",
      images: [
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1608958416717-3806fb76b813?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "photo_2",
      type: "photo",
      title: "পুঠিয়া শিব মন্দির ও রাজবাড়ী স্থাপত্য",
      location: "পুঠিয়া ঐতিহাসিক মন্দির চত্বর",
      date: "১৫ জুন ২০২৬",
      description: "পুঠিয়ার বিখ্যাত পাঁচ আনি শিব মন্দির এবং রাজপ্রাসাদের নিখুঁত পোড়ামাটির কারুকার্য ও প্রাচীন স্থাপত্যশৈলী। প্রত্নতাত্ত্বিক নিদর্শনগুলো দেখার জন্য দূর-দূরান্ত থেকে আসা পর্যটকদের কোলাহল।",
      images: [
        "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
      ]
    },
    {
      id: "photo_3",
      type: "photo",
      title: "বিজয় দিবস কুচকাওয়াজ ও ক্রীড়া উৎসব",
      location: "পুঠিয়া মডেল হাই স্কুল মাঠ",
      date: "১৬ ডিসেম্বর ২০২৫",
      description: "পুঠিয়া উপজেলার বিভিন্ন প্রাইমারি ও হাই স্কুলের শিক্ষার্থীদের জমকালো ডিসপ্লে ও কুচকাওয়াজ। উপজেলা প্রশাসনের আয়োজনে মুক্তিযোদ্ধা সংবর্ধনা ও পুরস্কার বিতরণী অনুষ্ঠান।",
      images: [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ]);

  const [videoHighlights, setVideoHighlights] = useState<VideoHighlight[]>([
    {
      id: "video_1",
      type: "video",
      title: "পুঠিয়া রাজবাড়ী ড্রোন ভিউ ২০২৬",
      location: "পুঠিয়া উপজেলা আকাশপথ থেকে",
      date: "১৮ মে ২০২৬",
      description: "পাখির চোখে পুঠিয়ার ঐতিহাসিক রাজপ্রাসাদ, শ্যামসাগর দিঘি, গোবিন্দ মন্দির এবং পঞ্চরত্ন শিব মন্দিরের নয়নাভিরাম ৪কে ড্রোন ফুটেজ।",
      duration: "০৩:৪৫ মিনিট",
      thumbnail: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
      embedId: "8yL0_7M6-xU"
    },
    {
      id: "video_2",
      type: "video",
      title: "ঐতিহাসিক রথযাত্রা মেলার ভিডিও ডকুমেন্টারি",
      location: "পুঠিয়া রথ মেলা প্রাঙ্গণ",
      date: "১২ জুলাই ২০২৬",
      description: "গ্রামীণ ঐতিহ্যবাহী খেলনা, কাঠের আসবাবপত্র, ঐতিহ্যবাহী মিষ্টির দোকান এবং মেলায় আসা হাজারো মানুষের উৎসবমুখর অভিব্যক্তির রঙিন চিত্রায়ন।",
      duration: "০৫:২০ মিনিট",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
      embedId: "gUeKx-X0E7o"
    },
    {
      id: "video_3",
      type: "video",
      title: "পুঠিয়া রাজবংশ ও জমিদারদের গৌরবের ইতিহাস",
      location: "ইতিহাস গবেষণা ও তথ্য কেন্দ্র",
      date: "১০ এপ্রিল ২০২৬",
      description: "পুঠিয়ার হিন্দু জমিদার বংশের সূচনা, সমৃদ্ধ রাজপ্রাসাদ নির্মাণ এবং এই অঞ্চলের শত বছরের ঐতিহ্য নিয়ে নির্মিত একটি তথ্যবহুল ও আকর্ষণীয় প্রামাণ্যচিত্র।",
      duration: "১২:১৫ মিনিট",
      thumbnail: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
      embedId: "zB9nN1LOnz8"
    }
  ]);

  // Video progress controller simulator
  useEffect(() => {
    if (isVideoPlaying && selectedVideo) {
      progressIntervalRef.current = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isVideoPlaying, selectedVideo]);

  const handleSaveToGallery = (item: GalleryItem) => {
    setSavingId(item.id);
    
    // Simulate high-fidelity downloading sequence
    setTimeout(() => {
      setSavingId(null);
      setToastMessage(`"${item.title}" আপনার মোবাইল গ্যালারিতে সফলভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1800);
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaTitle.trim() || !newMediaLocation.trim() || !newMediaDetails.trim()) return;

    if (newMediaType === "photo") {
      const imagesArray = categoryImages[newMediaCategory] || categoryImages.festival;
      const newAlbum: PhotoAlbum = {
        id: `custom_photo_${Date.now()}`,
        type: "photo",
        title: newMediaTitle,
        location: newMediaLocation,
        date: "আজ সদ্য আপলোডকৃত",
        description: newMediaDetails,
        images: imagesArray
      };
      setPhotoAlbums([newAlbum, ...photoAlbums]);
    } else {
      const thumb = videoThumbnails[newMediaCategory] || videoThumbnails.festival;
      const newVideo: VideoHighlight = {
        id: `custom_video_${Date.now()}`,
        type: "video",
        title: newMediaTitle,
        location: newMediaLocation,
        date: "আজ সদ্য আপলোডকৃত",
        description: newMediaDetails,
        duration: "০২:৩০ মিনিট",
        thumbnail: thumb
      };
      setVideoHighlights([newVideo, ...videoHighlights]);
    }

    setShowAddMediaModal(false);
    setNewMediaTitle("");
    setNewMediaLocation("");
    setNewMediaDetails("");
    
    setToastMessage("আপনার মিডিয়া ফাইলটি গ্যালারিতে সফলভাবে যুক্ত করা হয়েছে!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activePhotoIndexNext = () => {
    if (!selectedAlbum) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedAlbum.images.length);
  };

  const activePhotoIndexPrev = () => {
    if (!selectedAlbum) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedAlbum.images.length) % selectedAlbum.images.length);
  };

  return (
    <div className="space-y-6 font-sans pb-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-xl z-[9999] flex items-center gap-2 border border-emerald-500 animate-fade-in max-w-[90%] text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {toastMessage}
        </div>
      )}

      {/* Saving Loader Overlay */}
      {savingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white p-6 rounded-3xl flex flex-col items-center gap-4 max-w-xs text-center shadow-2xl">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#7A1C28]/20 border-t-[#7A1C28] rounded-full animate-spin"></div>
              <Download className="w-5 h-5 text-[#7A1C28] absolute" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#7A1C28]">ডাউনলোড হচ্ছে...</h4>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">মিডিয়া ফাইলটি আপনার ডিভাইসে নিরাপদ করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Visual Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #7A1C28, #A82C35)" }}
      >
        <button 
          onClick={onGoBack} 
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10"
        >
          ← ফিরে যান
        </button>  
        <div className="mt-6 relative z-10">
          <span className="bg-white/25 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-3">ইভেন্ট আর্কাইভ</span>
          <h1 className="text-4xl font-black mb-1 text-white">মিডিয়া গ্যালারি</h1>
          <div className="w-10 h-1 bg-[#FFC107] rounded-full my-3"></div>
          <p className="text-red-100 text-sm md:text-base max-w-lg leading-relaxed font-medium">
            পুঠিয়ার বিভিন্ন ইভেন্ট, খেলাধুলা ও সামাজিক উৎসবের রঙিন মুহূর্তগুলোর ছবি ও ভিডিও কালেকশন।
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Toggle Filters and Upload Button */}
        <div className="flex gap-2">
          <div className="grid grid-cols-2 gap-2 flex-1">
            <button
              onClick={() => setFilter("photo")}
              className={`py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "photo"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ImageIcon className={`w-4 h-4 ${filter === "photo" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              ইভেন্ট ছবি
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all outline-none shadow-sm cursor-pointer ${
                filter === "video"
                  ? "bg-[#7A1C28] text-emerald-600 border border-emerald-500/30"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Video className={`w-4 h-4 ${filter === "video" ? 'text-emerald-600' : 'text-gray-400'}`}/>
              ভিডিও হাইলাইটস
            </button>
          </div>

          <button
            onClick={() => setShowAddMediaModal(true)}
            className="px-4 bg-[#FFC107] hover:bg-yellow-500 text-[#7A1C28] rounded-xl flex items-center gap-1.5 text-xs font-black transition-all shadow-md shadow-yellow-500/10 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> আপলোড
          </button>
        </div>

        {/* Content Listings Directory */}
        <div className="space-y-5">
          {filter === "photo" ? (
            photoAlbums.map((album) => (
              <div 
                key={album.id} 
                className="bg-white rounded-2xl p-4 shadow-md border border-red-50/50 flex flex-col gap-3 relative overflow-hidden animate-fade-in group hover:shadow-xl transition-all duration-300"
              >
                {/* Image Display Card Area - Clicking anywhere here opens detail view */}
                <div 
                  onClick={() => {
                    setSelectedAlbum(album);
                    setCurrentImageIndex(0);
                  }}
                  className="w-full h-48 bg-gray-100 rounded-xl relative overflow-hidden group cursor-pointer"
                >
                  <img 
                    src={album.images[0]} 
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <span className="bg-black/55 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      {album.images.length}টি ছবি
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 
                    onClick={() => {
                      setSelectedAlbum(album);
                      setCurrentImageIndex(0);
                    }}
                    className="text-base font-black text-gray-800 leading-tight hover:text-[#7A1C28] transition-colors cursor-pointer"
                  >
                    {album.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold pt-1">
                    <span className="flex items-center gap-1">⏱️ {album.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {album.location}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                  {album.description}
                </p>
                
                <div className="flex gap-2 w-full mt-2 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => {
                      setSelectedAlbum(album);
                      setCurrentImageIndex(0);
                    }}
                    className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> ভিউ করুন
                  </button>
                  <button 
                    onClick={() => handleSaveToGallery(album)}
                    className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-sm flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> গ্যালারিতে সেভ করুন
                  </button>
                </div>
              </div>
            ))
          ) : (
            videoHighlights.map((video) => (
              <div 
                key={video.id} 
                className="bg-white rounded-2xl p-4 shadow-md border border-red-50/50 flex flex-col gap-3 relative overflow-hidden animate-fade-in group hover:shadow-xl transition-all duration-300"
              >
                {/* Video Preview Image Card Area - Clicking anywhere opens video player */}
                <div 
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsVideoPlaying(true);
                    setVideoProgress(0);
                  }}
                  className="w-full h-48 bg-gray-100 rounded-xl relative overflow-hidden group cursor-pointer"
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 text-white fill-current translate-x-0.5" />
                    </div>
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {video.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 
                    onClick={() => {
                      setSelectedVideo(video);
                      setIsVideoPlaying(true);
                      setVideoProgress(0);
                    }}
                    className="text-base font-black text-gray-800 leading-tight hover:text-[#7A1C28] transition-colors cursor-pointer"
                  >
                    {video.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold pt-1">
                    <span className="flex items-center gap-1">⏱️ {video.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> {video.location}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
                
                <div className="flex gap-2 w-full mt-2 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => {
                      setSelectedVideo(video);
                      setIsVideoPlaying(true);
                      setVideoProgress(0);
                    }}
                    className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" /> প্লে করুন
                  </button>
                  <button 
                    onClick={() => handleSaveToGallery(video)}
                    className="flex-1 py-2.5 text-xs font-bold text-[#7A1C28] bg-[#FFC107] rounded-xl hover:bg-yellow-400 transition-colors shadow-sm flex items-center justify-center gap-1.5 outline-none cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> গ্যালারিতে সেভ করুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Photo Album Viewer Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">ফটো অ্যালবাম</span>
                <h3 className="text-sm font-black truncate">{selectedAlbum.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedAlbum(null)}
                className="text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Carousel Screen */}
            <div className="relative flex-1 bg-zinc-950 flex items-center justify-center p-4 min-h-[260px]">
              <img 
                src={selectedAlbum.images[currentImageIndex]} 
                alt={`${selectedAlbum.title} - ${currentImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-h-[350px] max-w-full object-contain rounded-lg shadow-lg select-none" 
              />
              
              {/* Left Selector Arrow */}
              <button 
                onClick={activePhotoIndexPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-900 text-white p-2.5 rounded-full border border-neutral-800 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Selector Arrow */}
              <button 
                onClick={activePhotoIndexNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-900 text-white p-2.5 rounded-full border border-neutral-800 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide index overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-white text-xs font-black px-3.5 py-1.5 rounded-full">
                {currentImageIndex + 1} / {selectedAlbum.images.length}
              </div>
            </div>

            {/* Description & Thumbnails */}
            <div className="p-5 bg-neutral-950 text-white shrink-0 space-y-4">
              <p className="text-xs text-neutral-300 font-medium leading-relaxed max-h-[60px] overflow-y-auto">
                {selectedAlbum.description}
              </p>

              {/* Thumbnails list */}
              <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                {selectedAlbum.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      idx === currentImageIndex ? "border-[#FFC107] scale-105 shadow-md shadow-yellow-500/10" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>

              {/* Save & Download Row inside modal */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleSaveToGallery(selectedAlbum)}
                  className="w-full py-3 bg-[#FFC107] text-[#7A1C28] hover:bg-yellow-400 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> সম্পূর্ণ অ্যালবাম ডাউনলোড করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-neutral-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-800 flex flex-col animate-scale-up">
            {/* Header */}
            <div className="p-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">ভিডিও প্লেয়ার</span>
                <h3 className="text-sm font-black truncate">{selectedVideo.title}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedVideo(null);
                  setIsVideoPlaying(false);
                }}
                className="text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 p-2 rounded-full transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immersive Video Screen Canvas */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
              {isVideoPlaying && selectedVideo.embedId ? (
                <div className="absolute inset-0 w-full h-full z-20 animate-fade-in bg-zinc-950">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&mute=${isVideoMuted ? 1 : 0}&rel=0`}
                    title={selectedVideo.title}
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                  {/* Floating overlay close button */}
                  <button 
                    onClick={() => setIsVideoPlaying(false)}
                    className="absolute top-3 right-3 bg-black/80 hover:bg-red-600 text-white rounded-full p-2 border border-white/10 shadow transition-all cursor-pointer z-30 flex items-center justify-center hover:scale-105"
                    title="প্লেব্যাক বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              <img 
                src={selectedVideo.thumbnail} 
                alt={selectedVideo.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-all duration-700 ${isVideoPlaying ? "scale-105 filter brightness-95" : "brightness-50"}`} 
              />
              
              {/* Scanline or subtle playing filter */}
              {isVideoPlaying && !selectedVideo.embedId && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/35 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1.5 shadow animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> লাইভ প্লে
                  </span>
                </div>
              )}

              {/* Big overlay play button when paused */}
              {!isVideoPlaying && (
                <button 
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute w-16 h-16 bg-[#FFC107] text-[#7A1C28] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </button>
              )}

              {/* Overlay Player Controls at bottom */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 space-y-3">
                {/* Progress bar timeline */}
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.min(Math.max((clickX / rect.width) * 100, 0), 100);
                    setVideoProgress(percent);
                  }}
                  className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                >
                  <div 
                    style={{ width: `${videoProgress}%` }}
                    className="h-full bg-[#FFC107] rounded-full transition-all duration-100 relative"
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-[#FFC107] shadow"></div>
                  </div>
                </div>

                {/* Left controls, time and volume */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                      className="hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {isVideoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    <button 
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <span className="text-[11px] font-bold font-mono text-gray-300">
                      {Math.floor((videoProgress / 100) * 3)}:{String(Math.floor(((videoProgress / 100) * 45) % 60)).padStart(2, '0')} / {selectedVideo.duration.split(' ')[0]}
                    </span>
                  </div>

                  <button className="hover:text-emerald-600 transition-colors cursor-pointer">
                    <Maximize2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video description footer */}
            <div className="p-6 bg-neutral-950 text-white space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>⏱️ {selectedVideo.date}</span>
                <span>•</span>
                <span>📍 {selectedVideo.location}</span>
              </div>
              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                {selectedVideo.description}
              </p>

              <button
                onClick={() => handleSaveToGallery(selectedVideo)}
                className="w-full py-3 bg-[#FFC107] text-[#7A1C28] hover:bg-yellow-400 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> এই ভিডিও ফাইলটি ডাউনলোড করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Add New Media Modal */}
      {showAddMediaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            {/* Modal Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-red-900 to-slate-900 text-white">
              <button 
                onClick={() => setShowAddMediaModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">নতুন মিডিয়া আপলোড</span>
              </div>
              <h3 className="text-base font-black">গ্যালারিতে যুক্ত করুন</h3>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleAddMediaSubmit} className="p-5 space-y-3.5 max-h-[380px] overflow-y-auto">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">মিডিয়ার ধরণ</label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setNewMediaType("photo")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      newMediaType === "photo" 
                        ? "bg-[#7A1C28] text-emerald-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ইভেন্ট ফটো
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMediaType("video")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      newMediaType === "video" 
                        ? "bg-[#7A1C28] text-emerald-600" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ভিডিও হাইলাইট
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">মিডিয়া ক্যাটাগরি (ছবির জন্য)</label>
                <select
                  value={newMediaCategory || ""}
                  onChange={(e) => setNewMediaCategory(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                >
                  <option value="festival">মেলা ও উৎসব</option>
                  <option value="architecture">ঐতিহাসিক রাজবাড়ী ও মন্দির</option>
                  <option value="sports">খেলাধুলা ও স্কুল ইভেন্ট</option>
                  <option value="nature">প্রাকৃতিক রূপ ও দিঘি</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">শিরোনাম</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: পুঠিয়া শিবরাত্রি মেলা ২০২৬"
                  value={newMediaTitle || ""}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">স্থান/ভেন্যু</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: পুঠিয়া রাজবাড়ী মাঠ"
                  value={newMediaLocation || ""}
                  onChange={(e) => setNewMediaLocation(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1">বিস্তারিত বিবরণ</label>
                <textarea 
                  required
                  placeholder="ইভেন্ট বা ভিডিও সম্পর্কে কিছু বিস্তারিত লিখুন..."
                  value={newMediaDetails || ""}
                  onChange={(e) => setNewMediaDetails(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#7A1C28] h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#7A1C28] hover:bg-red-800 text-emerald-600 text-xs font-black rounded-xl transition shadow-md shadow-[#7A1C28]/10 cursor-pointer"
              >
                গ্যালারিতে যুক্ত করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

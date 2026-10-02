import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Download, Share2, 
  ChevronLeft, ChevronRight, Image as ImageIcon,
  ThumbsUp, MessageSquare, Users, Tag, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  images?: string[];
  initialIndex?: number;
  userName?: string;
  authorPhotoUrl?: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  userLiked?: boolean;
  userReaction?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | null;
  onLike?: () => void;
  onComment?: () => void;
  postDateText?: string;
}

export function ImageLightbox({ 
  isOpen, 
  onClose, 
  imageUrl, 
  images: propImages, 
  initialIndex = 0, 
  userName,
  authorPhotoUrl,
  caption,
  likesCount = 0,
  commentsCount = 0,
  userLiked = false,
  userReaction = null,
  onLike,
  onComment,
  postDateText
}: ImageLightboxProps) {
  // Normalize images list
  const images = React.useMemo(() => {
    if (propImages && propImages.length > 0) return propImages;
    if (imageUrl) return [imageUrl];
    return [];
  }, [propImages, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync initialIndex when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setZoomLevel(1);
      setDragPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, images.length]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  }, [images.length]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setDragPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setDragPosition({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  // Share handler
  const handleShare = async () => {
    const currentImg = images[currentIndex];
    if (!currentImg) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: userName ? `${userName}-এর ছবি` : 'ছবি শেয়ার',
          text: caption || 'পুঠিয়া নাগরিক পোর্টাল থেকে ছবি',
          url: currentImg
        });
        toast.success('ছবি শেয়ার করা হয়েছে!');
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(currentImg);
      toast.success('ছবির লিংক কপি করা হয়েছে!');
    }
  };

  // Download handler
  const handleDownload = () => {
    const currentImg = images[currentIndex];
    if (!currentImg) return;
    try {
      const a = document.createElement('a');
      a.href = currentImg;
      a.download = `puthia_photo_${currentIndex + 1}.jpg`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('ছবি ডাউনলোড শুরু হয়েছে!');
    } catch {
      window.open(currentImg, '_blank');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Touch Swipe gestures for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || zoomLevel > 1) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Horizontal swipe threshold
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  // Pan / Drag when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setDragPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Bengali number converter
  const toBengali = (num: number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between select-none overflow-hidden"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Controls Bar (Matching Screenshot design: close on left, options on right) */}
        <div 
          className="relative z-50 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button on Left */}
          <button 
            onClick={onClose}
            className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            title="বন্ধ করুন (Esc)"
          >
            <X size={22} />
          </button>

          {/* Action Options on Right */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Tag Button */}
            <button 
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="ট্যাগ অপশনস"
            >
              <Tag size={18} />
            </button>

            {/* Zoom In/Out indicator */}
            {zoomLevel > 1 ? (
              <button 
                onClick={handleResetZoom}
                className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
                title="রিসেট জুম"
              >
                <RotateCcw size={18} />
              </button>
            ) : (
              <button 
                onClick={handleZoomIn}
                className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
                title="জুম ইন"
              >
                <ZoomIn size={18} />
              </button>
            )}

            {/* Download */}
            <button 
              onClick={handleDownload}
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="ডাউনলোড"
            >
              <Download size={18} />
            </button>

            {/* Share */}
            <button 
              onClick={handleShare}
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="শেয়ার"
            >
              <Share2 size={18} />
            </button>

            {/* Vertical Menu */}
            <button 
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="মেনু"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Center Main Image Canvas */}
        <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          {/* Previous Button */}
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 z-30 p-3 rounded-full bg-black/40 hover:bg-black/75 text-white/95 transition-all duration-200 border border-white/5 shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
              title="পূর্ববর্তী ছবি (Left)"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-30 p-3 rounded-full bg-black/40 hover:bg-black/75 text-white/95 transition-all duration-200 border border-white/5 shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
              title="পরবর্তী ছবি (Right)"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Active Image with Animated Transitions and Zoom/Pan */}
          <div 
            className={`relative max-w-full max-h-full flex items-center justify-center ${
              zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleZoom();
            }}
            onMouseDown={handleMouseDown}
          >
            <motion.img 
              key={currentImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ 
                opacity: 1, 
                scale: zoomLevel,
                x: dragPosition.x,
                y: dragPosition.y
              }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              src={currentImage} 
              alt={caption || `Gallery photo ${currentIndex + 1}`} 
              className="max-w-full max-h-[60vh] sm:max-h-[65vh] object-contain shadow-2xl pointer-events-auto select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Bottom Panel with Facebook Photo Viewer Style metadata & interactions */}
        <div 
          className="relative z-50 p-4 sm:p-5 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Author Details & Post Info (Aligned with screenshot) */}
          <div className="flex items-center gap-3">
            {authorPhotoUrl && (
              <img 
                src={authorPhotoUrl} 
                alt={userName || "Author"} 
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              />
            )}
            <div className="flex flex-col min-w-0">
              {userName && (
                <span className="text-white text-[15px] font-bold tracking-wide">
                  {userName}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
                <span>{postDateText || 'কিছুক্ষণ আগে'}</span>
                <span>•</span>
                <Users size={12} className="text-white/50" />
              </div>
            </div>
          </div>

          {/* Caption / Text */}
          {caption && (
            <p className="text-white text-[14px] leading-relaxed max-w-3xl font-normal whitespace-pre-wrap">
              {caption}
            </p>
          )}

          {/* Reactions summary row (e.g. ❤️👍 5) */}
          {((likesCount || 0) > 0 || (commentsCount || 0) > 0) && (
            <div className="flex items-center justify-between text-xs text-white/75 pt-1 border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 font-semibold">
                {(likesCount || 0) > 0 && (
                  <>
                    <div className="flex items-center -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] border border-black shadow-xs">
                        ❤️
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] border border-black shadow-xs z-10">
                        👍
                      </div>
                    </div>
                    <span>{toBengali(likesCount || 0)}</span>
                  </>
                )}
              </div>
              <div className="font-semibold text-white/65">
                {(commentsCount || 0) > 0 && (
                  <span>{toBengali(commentsCount || 0)}টি মন্তব্য</span>
                )}
              </div>
            </div>
          )}

          {/* Action Pills Section: Like & Comment */}
          <div className="flex items-center gap-3 pt-1 w-full max-w-md">
            {/* Like Pill */}
            <button
              onClick={() => onLike?.()}
              className={`flex-1 py-2.5 px-4 rounded-full font-bold text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                userLiked 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' 
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
              }`}
            >
              <ThumbsUp size={16} className={userLiked ? "fill-current" : ""} />
              <span>{toBengali(likesCount || 0)}</span>
            </button>

            {/* Comment Pill */}
            <button
              onClick={() => onComment?.()}
              className="flex-1 py-2.5 px-4 rounded-full font-bold text-sm border bg-white/10 text-white border-white/10 hover:bg-white/15 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>{toBengali(commentsCount || 0)}</span>
            </button>
          </div>

          {/* Thumbnails Row (when multiple images) */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 mt-1 scrollbar-none self-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                    setDragPosition({ x: 0, y: 0 });
                  }}
                  className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 transition-all duration-200 cursor-pointer border ${
                    currentIndex === idx 
                      ? 'border-blue-500 scale-105 opacity-100 ring-2 ring-blue-400/50' 
                      : 'border-white/10 opacity-45 hover:opacity-75'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumb ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

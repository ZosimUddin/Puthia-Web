import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp } from 'lucide-react';

export interface ReactionItem {
  id: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
}

export const FB_REACTIONS: ReactionItem[] = [
  { id: 'like', label: 'লাইক', emoji: '👍', color: 'text-[#1877F2]', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'love', label: 'লাভ', emoji: '❤️', color: 'text-[#E41E3F]', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'haha', label: 'হাহা', emoji: '😆', color: 'text-[#F7B125]', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'wow', label: 'ওয়াও', emoji: '😮', color: 'text-[#F7B125]', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'sad', label: 'স্যাড', emoji: '😢', color: 'text-[#F7B125]', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'angry', label: 'এংরি', emoji: '😡', color: 'text-[#E44D3A]', bg: 'bg-orange-50', border: 'border-orange-200' },
];

interface FbReactionPickerProps {
  userLiked?: boolean;
  userReaction?: string | null;
  likesCount?: number;
  showPillWithCount?: boolean;
  onSelectReaction: (reactionId: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => void;
  onToggleLike: () => void;
  className?: string;
}

export const FbReactionPicker: React.FC<FbReactionPickerProps> = ({
  userLiked = false,
  userReaction = 'like',
  likesCount = 0,
  showPillWithCount = true,
  onSelectReaction,
  onToggleLike,
  className = ''
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active reaction object
  const activeReaction = FB_REACTIONS.find(r => r.id === (userReaction || 'like')) || FB_REACTIONS[0];

  // Close reaction picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker]);

  const handleTouchStart = () => {
    pressTimerRef.current = setTimeout(() => {
      setShowPicker(true);
      if (navigator.vibrate) navigator.vibrate(15);
    }, 250);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleButtonClick = () => {
    if (showPicker) {
      setShowPicker(false);
      return;
    }
    onToggleLike();
  };

  const handleSelect = (rId: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    onSelectReaction(rId);
    setShowPicker(false);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Floating Facebook Lite Reaction Picker Bar */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 z-50 bg-white border border-slate-200/90 rounded-full shadow-2xl px-2.5 py-1.5 flex items-center gap-1.5 sm:gap-2 ring-1 ring-black/5"
          >
            {FB_REACTIONS.map((item) => (
              <div key={item.id} className="relative group">
                {/* Tooltip Label */}
                <AnimatePresence>
                  {hoveredReaction === item.id && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md pointer-events-none z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Emoji Reaction Button */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredReaction(item.id)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  onClick={() => handleSelect(item.id)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-2xl sm:text-3xl rounded-full transition-all hover:scale-130 hover:-translate-y-1.5 active:scale-110 cursor-pointer select-none"
                >
                  {item.emoji}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Like Button (FB Lite Pill Style or Standard with Spring Scale Bounce Animation) */}
      <motion.button
        type="button"
        whileTap={{ scale: 1.12 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => {
          handleButtonClick();
          if (navigator.vibrate) {
            navigator.vibrate(12); // Direct immediate haptic feedback
          }
        }}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => {
          // Hover timer for desktop
          pressTimerRef.current = setTimeout(() => setShowPicker(true), 400);
        }}
        onMouseLeave={() => {
          if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
        }}
        className={`w-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          showPillWithCount
            ? `py-2 px-4 rounded-full font-bold text-xs sm:text-sm border ${
                userLiked
                  ? `${activeReaction.color} ${activeReaction.bg} ${activeReaction.border}`
                  : 'bg-[#f0f2f5] text-[#050505] border-slate-200/80 hover:bg-[#e4e6eb]'
              }`
            : `py-2 px-3 rounded-xl font-bold text-xs sm:text-sm ${
                userLiked
                  ? `${activeReaction.color} ${activeReaction.bg} border ${activeReaction.border}`
                  : 'text-slate-700 hover:bg-[#f0f2f5]'
              }`
        }`}
      >
        {/* Animated Icon Block (Swells and bounces with spring feedback when liked!) */}
        <motion.div
          key={userLiked ? `liked_${activeReaction.id}` : 'unliked'}
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 12, mass: 0.8 }}
          className="flex items-center justify-center shrink-0"
        >
          {userLiked ? (
            activeReaction.id === 'like' ? (
              <ThumbsUp size={16} className="fill-[#1877F2] text-[#1877F2]" />
            ) : (
              <span className="text-base leading-none select-none">{activeReaction.emoji}</span>
            )
          ) : (
            <ThumbsUp size={16} className="text-slate-600" />
          )}
        </motion.div>

        {/* Label & Count */}
        <span className="font-bold text-xs sm:text-[13px] truncate">
          {userLiked ? activeReaction.label : 'লাইক'}
          {likesCount > 0 ? ` (${likesCount})` : ''}
        </span>
      </motion.button>
    </div>
  );
};

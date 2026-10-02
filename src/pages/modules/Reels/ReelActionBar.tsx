import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  BarChart2, 
  Flag, 
  EyeOff, 
  UserX, 
  Copy, 
  Trash2,
  Check
} from 'lucide-react';
import { Reel, ReelReactionType } from '../../../types';

interface ReelActionBarProps {
  reel: Reel;
  currentUserId?: string;
  isSaved?: boolean;
  onReact: (type: ReelReactionType) => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onToggleSave: () => void;
  onOpenAnalytics: () => void;
  onOpenReport: () => void;
  onNotInterested: () => void;
  onBlockAuthor: () => void;
  onDeleteReel: () => void;
  isAuthor: boolean;
}

const REACTIONS: { type: ReelReactionType; label: string; emoji: string; color: string }[] = [
  { type: 'like', label: 'লাইক', emoji: '👍', color: 'text-blue-500' },
  { type: 'love', label: 'লাভ', emoji: '❤️', color: 'text-rose-500' },
  { type: 'haha', label: 'হাহা', emoji: '😂', color: 'text-amber-500' },
  { type: 'wow', label: 'ওয়াও', emoji: '😮', color: 'text-yellow-500' },
  { type: 'sad', label: 'স্যাড', emoji: '😢', color: 'text-sky-500' },
  { type: 'angry', label: 'অ্যাংরি', emoji: '😡', color: 'text-orange-600' }
];

export const ReelActionBar: React.FC<ReelActionBarProps> = ({
  reel,
  currentUserId,
  isSaved,
  onReact,
  onOpenComments,
  onOpenShare,
  onToggleSave,
  onOpenAnalytics,
  onOpenReport,
  onNotInterested,
  onBlockAuthor,
  onDeleteReel,
  isAuthor
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const myReaction: ReelReactionType | undefined = currentUserId && reel.reactions 
    ? reel.reactions[currentUserId] 
    : undefined;

  const toBengaliNumber = (num: number = 0) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace('.', ' দশমিক ') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.', ' দশমিক ') + 'k';
    }
    return num.toString().replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
  };

  const handleTouchStartReact = () => {
    reactionTimerRef.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 400);
  };

  const handleTouchEndReact = () => {
    if (reactionTimerRef.current) {
      clearTimeout(reactionTimerRef.current);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/reels?id=${reel.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMoreMenu(false);
    }, 1500);
  };

  const currentReactionObj = REACTIONS.find(r => r.type === myReaction);

  return (
    <div className="flex flex-col items-center gap-4.5 text-white select-none z-30">
      {/* 1. Reaction / Like Button with Popup */}
      <div 
        className="relative flex flex-col items-center"
        onMouseEnter={() => setShowReactionPicker(true)}
        onMouseLeave={() => setShowReactionPicker(false)}
      >
        {/* Floating Facebook Reaction Bar */}
        {showReactionPicker && (
          <div 
            className="absolute right-12 bottom-0 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-xl px-3 py-2 rounded-full shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200 z-50"
            onTouchStart={(e) => e.stopPropagation()}
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={(e) => {
                  e.stopPropagation();
                  onReact(r.type);
                  setShowReactionPicker(false);
                }}
                className="w-9 h-9 flex items-center justify-center text-2xl hover:scale-130 transition-transform active:scale-95 cursor-pointer bg-transparent border-0"
                title={r.label}
              >
                <span>{r.emoji}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onReact(myReaction ? myReaction : 'love')}
          onTouchStart={handleTouchStartReact}
          onTouchEnd={handleTouchEndReact}
          className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border-0 cursor-pointer shadow-lg ${
            myReaction 
              ? 'bg-rose-500/25 text-rose-500 ring-2 ring-rose-500/50' 
              : 'bg-black/35 hover:bg-black/50 text-white'
          }`}
        >
          {currentReactionObj ? (
            <span className="text-2xl animate-bounce-short">{currentReactionObj.emoji}</span>
          ) : (
            <Heart size={26} className="transition-colors hover:text-rose-400" />
          )}
        </button>
        <span className="text-[11px] font-black mt-1 drop-shadow-md text-white/95">
          {toBengaliNumber(reel.reactionsCount || reel.likesCount || 0)}
        </span>
      </div>

      {/* 2. Comments Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onOpenComments}
          className="w-12 h-12 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border-0 cursor-pointer shadow-lg"
        >
          <MessageCircle size={25} />
        </button>
        <span className="text-[11px] font-black mt-1 drop-shadow-md text-white/95">
          {toBengaliNumber(reel.commentsCount || 0)}
        </span>
      </div>

      {/* 3. Share Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onOpenShare}
          className="w-12 h-12 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border-0 cursor-pointer shadow-lg"
        >
          <Share2 size={24} />
        </button>
        <span className="text-[10px] font-black mt-1 drop-shadow-md text-white/95">
          {toBengaliNumber(reel.sharesCount || 0)}
        </span>
      </div>

      {/* 4. Save Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleSave}
          className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 border-0 cursor-pointer shadow-lg ${
            isSaved 
              ? 'bg-amber-500 text-white ring-2 ring-amber-400' 
              : 'bg-black/35 hover:bg-black/50 text-white'
          }`}
        >
          <Bookmark size={24} className={isSaved ? 'fill-current' : ''} />
        </button>
        <span className="text-[10px] font-black mt-1 drop-shadow-md text-white/95">
          {isSaved ? 'সেভড' : 'সেভ'}
        </span>
      </div>

      {/* 5. Analytics Button (For Author) */}
      {isAuthor && (
        <div className="flex flex-col items-center">
          <button
            onClick={onOpenAnalytics}
            className="w-11 h-11 rounded-full bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border border-emerald-400/40 cursor-pointer shadow-lg"
            title="রিল অ্যানালিটিক্স"
          >
            <BarChart2 size={20} />
          </button>
          <span className="text-[9px] font-black mt-1 drop-shadow-md text-emerald-300">
            ইনসাইট
          </span>
        </div>
      )}

      {/* 6. More Options Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="w-10 h-10 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90 border-0 cursor-pointer"
        >
          <MoreVertical size={20} />
        </button>

        {showMoreMenu && (
          <div 
            className="absolute right-0 bottom-12 w-48 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 p-1.5 z-50 text-slate-200 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-white border-0 bg-transparent"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
            </button>

            <button
              onClick={() => {
                setShowMoreMenu(false);
                onNotInterested();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-white border-0 bg-transparent"
            >
              <EyeOff size={16} className="text-slate-400" />
              <span>আগ্রহী নই</span>
            </button>

            {!isAuthor && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onBlockAuthor();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-amber-300 border-0 bg-transparent"
              >
                <UserX size={16} />
                <span>ক্রিয়েটর ব্লক করুন</span>
              </button>
            )}

            {!isAuthor && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenReport();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 text-left transition-colors cursor-pointer border-0 bg-transparent"
              >
                <Flag size={16} />
                <span>রিপোর্ট করুন</span>
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onDeleteReel();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 text-left transition-colors cursor-pointer border-0 bg-transparent"
              >
                <Trash2 size={16} />
                <span>রিল মুছে ফেলুন</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

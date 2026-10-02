import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Radio, 
  Flame, 
  Share, 
  MessageSquare, 
  Layers
} from 'lucide-react';
import { Reel } from '../../../types';
import { reelService } from '../../../services/reelService';

interface ReelShareModalProps {
  reel: Reel;
  isOpen: boolean;
  onClose: () => void;
  onShareToFeed?: () => void;
  onShareToStory?: () => void;
  onSendMessage?: () => void;
}

export const ReelShareModal: React.FC<ReelShareModalProps> = ({
  reel,
  isOpen,
  onClose,
  onShareToFeed,
  onShareToStory,
  onSendMessage
}) => {
  const [copied, setCopied] = useState(false);
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const reelUrl = `${window.location.origin}/reels?id=${reel.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reelUrl);
    setCopied(true);
    reelService.recordShare(reel.id);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `আড্ডা রিল - ${reel.authorName}`,
          text: reel.caption || 'আড্ডায় দারুণ এই শর্ট ভিডিওটি দেখুন!',
          url: reelUrl
        });
        reelService.recordShare(reel.id);
        onClose();
      } catch (err) {
        console.warn("Share cancelled or failed");
      }
    } else {
      handleCopyLink();
    }
  };

  const handleActionClick = (actionName: string, callback?: () => void) => {
    reelService.recordShare(reel.id);
    setSharedToast(actionName);
    if (callback) callback();
    setTimeout(() => {
      setSharedToast(null);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Share size={20} className="text-emerald-400" />
            <h3 className="font-extrabold text-lg">রিল শেয়ার করুন</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {sharedToast ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Check size={32} />
            </div>
            <p className="font-bold text-lg text-emerald-400">{sharedToast}</p>
            <p className="text-xs text-slate-400 mt-1">শেয়ার সম্পন্ন হয়েছে</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Share Grid */}
            <div className="grid grid-cols-4 gap-3 text-center mb-4">
              <button
                onClick={() => handleActionClick('ফিডে শেয়ার করা হয়েছে', onShareToFeed)}
                className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
              >
                <div className="w-13 h-13 rounded-2xl bg-emerald-600/20 group-hover:bg-emerald-600/30 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-emerald-500/30 shadow-md">
                  <MessageSquare size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">ফিডে দিন</span>
              </button>

              <button
                onClick={() => handleActionClick('স্টোরিতে যুক্ত হয়েছে', onShareToStory)}
                className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
              >
                <div className="w-13 h-13 rounded-2xl bg-rose-600/20 group-hover:bg-rose-600/30 text-rose-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-rose-500/30 shadow-md">
                  <Radio size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">স্টোরি</span>
              </button>

              <button
                onClick={() => handleActionClick('মেসেঞ্জারে পাঠানো হয়েছে', onSendMessage)}
                className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
              >
                <div className="w-13 h-13 rounded-2xl bg-blue-600/20 group-hover:bg-blue-600/30 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-blue-500/30 shadow-md">
                  <Send size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">মেসেজ</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 group cursor-pointer border-0 bg-transparent"
              >
                <div className="w-13 h-13 rounded-2xl bg-purple-600/20 group-hover:bg-purple-600/30 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-105 border border-purple-500/30 shadow-md">
                  <Share size={22} />
                </div>
                <span className="text-[11px] font-bold text-slate-300">অন্যান্য</span>
              </button>
            </div>

            {/* Copy Link Bar */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
              <div className="truncate text-xs text-slate-400 font-mono flex-1">
                {reelUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border-0 shadow-md transition-all active:scale-95 shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

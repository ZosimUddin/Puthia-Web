import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare, Newspaper, Film, Users, Send } from 'lucide-react';

interface ShareLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  streamTitle: string;
  onRecordShare?: () => void;
}

export const ShareLiveModal: React.FC<ShareLiveModalProps> = ({
  isOpen,
  onClose,
  streamId,
  streamTitle,
  onRecordShare,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/live/${streamId}`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (onRecordShare) onRecordShare();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: streamTitle,
        text: `🔴 আড্ডায় লাইভ সরাসরি দেখুন: ${streamTitle}`,
        url: shareUrl,
      }).then(() => {
        if (onRecordShare) onRecordShare();
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm text-white shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Share2 size={16} className="text-emerald-400" /> শেয়ার করুন (Share Live)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
          <button
            onClick={handleNativeShare}
            className="p-3 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-2xl flex flex-col items-center gap-1.5 text-emerald-300 transition-colors cursor-pointer"
          >
            <Send size={20} /> নেটিভ শেয়ার
          </button>

          <button
            onClick={handleCopyLink}
            className="p-3 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 rounded-2xl flex flex-col items-center gap-1.5 text-blue-300 transition-colors cursor-pointer"
          >
            {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
            {copied ? 'কপি হয়েছে!' : 'লিংক কপি করুন'}
          </button>

          <button
            onClick={() => {
              alert('ফিডে শেয়ার করা হয়েছে!');
              if (onRecordShare) onRecordShare();
              onClose();
            }}
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex flex-col items-center gap-1.5 text-slate-200 transition-colors cursor-pointer"
          >
            <Newspaper size={20} className="text-amber-400" /> নিউজফিডে পোস্ট
          </button>

          <button
            onClick={() => {
              alert('স্টোরিতে যুক্ত করা হয়েছে!');
              if (onRecordShare) onRecordShare();
              onClose();
            }}
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex flex-col items-center gap-1.5 text-slate-200 transition-colors cursor-pointer"
          >
            <Film size={20} className="text-purple-400" /> স্টোরিতে শেয়ার
          </button>
        </div>

        {/* URL Box */}
        <div className="p-2.5 bg-slate-950 rounded-xl border border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate pr-2">{shareUrl}</span>
          <button
            onClick={handleCopyLink}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0"
          >
            {copied ? 'কপিড' : 'কপি'}
          </button>
        </div>
      </div>
    </div>
  );
};

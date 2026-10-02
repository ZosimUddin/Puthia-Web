import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, Trash2, EyeOff, UserX, Flag, CornerDownRight, Smile } from 'lucide-react';
import { LiveComment, LIVE_REACTIONS } from '../../types/live';

interface LiveCommentsTrayProps {
  streamId: string;
  comments: LiveComment[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  hostUid: string;
  isHost: boolean;
  isModerator: boolean;
  slowModeSeconds?: number;
  commentsDisabled?: boolean;
  blockedUserIds?: string[];
  onSendComment: (text: string, mentions?: string[], replyToId?: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onHideComment?: (commentId: string) => Promise<void>;
  onBlockUser?: (userUid: string) => Promise<void>;
  onReportStream?: () => void;
}

export const LiveCommentsTray: React.FC<LiveCommentsTrayProps> = ({
  comments,
  currentUserId,
  hostUid,
  isHost,
  isModerator,
  slowModeSeconds = 0,
  commentsDisabled = false,
  blockedUserIds = [],
  onSendComment,
  onDeleteComment,
  onHideComment,
  onBlockUser,
  onReportStream,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<LiveComment | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isBlocked = currentUserId ? blockedUserIds.includes(currentUserId) : false;

  // Auto-scroll to latest comment
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Cooldown countdown timer for Slow Mode
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || commentsDisabled || isBlocked || cooldownRemaining > 0) return;

    const textToSend = inputText.trim();
    setInputText('');
    const replyId = replyTo?.id;
    setReplyTo(null);

    await onSendComment(textToSend, [], replyId);

    if (slowModeSeconds > 0 && !isHost && !isModerator) {
      setCooldownRemaining(slowModeSeconds);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 text-white overflow-hidden">
      {/* Header / Notice */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          💬 লাইভ কমেন্ট ({comments.length})
        </span>
        {slowModeSeconds > 0 && (
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] border border-amber-500/30 font-semibold">
            ⏳ স্লো মোড ({slowModeSeconds} সেঃ)
          </span>
        )}
      </div>

      {/* Comments Scrollable Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[320px] sm:max-h-full scrollbar-thin scrollbar-thumb-white/20">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            এখনও কোনো কমেন্ট নেই। প্রথম কমেন্ট করুন!
          </div>
        ) : (
          comments.map(comment => {
            const isCommentHost = comment.authorUid === hostUid;
            const isCommentMod = comment.authorBadge === 'moderator';

            return (
              <div key={comment.id} className="relative group text-xs animate-fade-in">
                <div className="flex items-start gap-2 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all border border-white/5">
                  <img
                    src={comment.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.authorUid}`}
                    alt={comment.authorName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-emerald-500/50 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-100 truncate">{comment.authorName}</span>

                      {isCommentHost && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                          হোস্ট 👑
                        </span>
                      )}

                      {isCommentMod && !isCommentHost && (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <Shield size={10} /> মডারেটর
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 ml-auto">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {comment.replyToId && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                        <CornerDownRight size={10} /> উত্তর দেয়া হয়েছে
                      </div>
                    )}

                    <p className="text-slate-200 mt-1 break-words font-normal text-xs leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  {/* Actions Trigger */}
                  {(isHost || isModerator || comment.authorUid === currentUserId) && (
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                      className="text-slate-400 hover:text-white p-1 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      ⋯
                    </button>
                  )}
                </div>

                {/* Moderation Popup Menu */}
                {activeMenuId === comment.id && (
                  <div className="absolute right-2 top-8 z-30 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-1.5 text-[11px] font-semibold space-y-1 w-36 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        setReplyTo(comment);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-2 text-slate-200"
                    >
                      <CornerDownRight size={12} className="text-emerald-400" /> উত্তর দিন
                    </button>

                    {(isHost || isModerator || comment.authorUid === currentUserId) && onDeleteComment && (
                      <button
                        onClick={() => {
                          onDeleteComment(comment.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2"
                      >
                        <Trash2 size={12} /> ডিলিট করুন
                      </button>
                    )}

                    {(isHost || isModerator) && onHideComment && (
                      <button
                        onClick={() => {
                          onHideComment(comment.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-amber-500/20 text-amber-300 rounded-lg flex items-center gap-2"
                      >
                        <EyeOff size={12} /> হাইড করুন
                      </button>
                    )}

                    {(isHost || isModerator) && onBlockUser && comment.authorUid !== hostUid && (
                      <button
                        onClick={() => {
                          onBlockUser(comment.authorUid);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-red-600/30 text-red-300 rounded-lg flex items-center gap-2"
                      >
                        <UserX size={12} /> ইউজার ব্লক
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Reply Banner */}
      {replyTo && (
        <div className="bg-emerald-950/60 border-t border-emerald-500/30 p-2 px-3 flex items-center justify-between text-xs text-emerald-300">
          <span className="truncate">Replying to <span className="font-bold">{replyTo.authorName}</span></span>
          <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-white text-xs font-bold px-1">✕</button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-2.5 border-t border-white/10 bg-slate-950/50">
        {commentsDisabled ? (
          <div className="text-center py-2 text-xs text-amber-400 font-semibold bg-amber-500/10 rounded-xl border border-amber-500/20">
            🚫 হোস্ট এই লাইভের কমেন্ট বন্ধ রেখেছেন
          </div>
        ) : isBlocked ? (
          <div className="text-center py-2 text-xs text-red-400 font-semibold bg-red-500/10 rounded-xl border border-red-500/20">
            🚫 আপনাকে এই লাইভ থেকে ব্লক করা হয়েছে
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={cooldownRemaining > 0 ? `অপেক্ষা করুন (${cooldownRemaining} সেঃ)...` : "কমেন্ট লিখুন..."}
                disabled={cooldownRemaining > 0}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full bg-white/10 border border-white/15 focus:border-emerald-500 rounded-full px-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || cooldownRemaining > 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2.5 rounded-full transition-all shrink-0 cursor-pointer shadow-lg"
            >
              <Send size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, Trash2, CornerDownRight, Smile, MessageCircle } from 'lucide-react';
import { Reel, ReelComment } from '../../../types';
import { reelService } from '../../../services/reelService';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

interface ReelCommentsModalProps {
  reel: Reel;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_EMOJIS = ['❤️', '🔥', '😍', '👏', '😂', '🙌', '💯', '🌸'];

export const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({
  reel,
  currentUser,
  isOpen,
  onClose
}) => {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReelComment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !reel.id) return;
    const unsub = reelService.subscribeToComments(reel.id, (data) => {
      setComments(data);
    });
    return () => unsub();
  }, [isOpen, reel.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await reelService.addComment(
        reel.id,
        {
          uid: currentUser.uid,
          name: currentUser.name || currentUser.displayName || 'ব্যবহারকারী',
          photoURL: currentUser.photoURL
        },
        newComment.trim(),
        replyingTo ? replyingTo.id : undefined
      );
      setNewComment('');
      setReplyingTo(null);
      setTimeout(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error submitting reel comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await reelService.deleteComment(reel.id, commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] h-[600px] flex flex-col shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-emerald-400" />
            <h3 className="font-extrabold text-base tracking-wide">
              মন্তব্য ({comments.length})
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 text-2xl">
                💬
              </div>
              <p className="text-sm font-bold text-slate-300">এখনও কোনো মন্তব্য করা হয়নি</p>
              <p className="text-xs text-slate-500 mt-1">প্রথম মন্তব্যটি আপনিই করুন!</p>
            </div>
          ) : (
            comments.map((c) => {
              const isMine = currentUser && currentUser.uid === c.authorId;
              return (
                <div key={c.id} className="flex gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 overflow-hidden shrink-0 border border-white/10">
                    {c.authorAvatar ? (
                      <img src={c.authorAvatar} alt={c.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black">
                        {c.authorName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-emerald-400">
                          {c.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDistanceToNow(c.timestamp, { locale: bn, addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 break-words leading-relaxed">
                        {c.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 px-2 text-[11px] font-bold text-slate-400">
                      <button 
                        onClick={() => {
                          setReplyingTo(c);
                          inputRef.current?.focus();
                        }}
                        className="hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1"
                      >
                        <CornerDownRight size={12} /> উত্তর দিন
                      </button>

                      {isMine && (
                        <button 
                          onClick={() => handleDeleteComment(c.id)}
                          className="hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-0 flex items-center gap-1 text-slate-500"
                        >
                          <Trash2 size={12} /> মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={listEndRef} />
        </div>

        {/* Quick Emoji Pill Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setNewComment((prev) => prev + emoji)}
              className="text-lg hover:scale-125 transition-transform bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0 border-0 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-1.5 bg-emerald-950/80 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
            <span>
              <strong>@{replyingTo.authorName}</strong>-এর উত্তরে লিখছেন
            </span>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer text-xs"
            >
              বাতিল
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-white/10">
          {currentUser ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-full flex items-center px-4 py-2 border border-white/10 focus-within:border-emerald-500 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? `@${replyingTo.authorName} উত্তর দিন...` : 'একটি মন্তব্য লিখুন...'}
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                  maxLength={300}
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 flex items-center justify-center text-white transition-all cursor-pointer border-0 shadow-lg"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400">
              মন্তব্য করতে অনুগ্রহ করে সাইন ইন করুন
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

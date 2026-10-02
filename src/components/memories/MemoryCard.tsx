import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  EyeOff,
  UserX,
  CalendarX,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Send,
  Eye,
  Smile,
  Globe,
  Users,
  Lock,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { MemoryItem, reactToMemory, hideMemory, hidePersonFromMemories, hideDateFromMemories, toBengaliNumber } from "../../services/memoryService";
import { useAuth } from "../../contexts/AuthContext";
import { ImageLightbox } from "../ImageLightbox";
import { PostPhotoGallery } from "../PostPhotoGallery";
import { PostVideoPlayer } from "../PostVideoPlayer";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, addDoc, updateDoc, doc, increment } from "firebase/firestore";

const REACTION_TYPES = [
  { id: "like", label: "Like", bnLabel: "লাইক", emoji: "👍", color: "text-emerald-700" },
  { id: "love", label: "Love", bnLabel: "লাভ", emoji: "❤️", color: "text-[#f02849]" },
  { id: "haha", label: "Haha", bnLabel: "হা হা", emoji: "😂", color: "text-[#f7b125]" },
  { id: "wow", label: "Wow", bnLabel: "ওয়াও", emoji: "😮", color: "text-[#f7b125]" },
  { id: "sad", label: "Sad", bnLabel: "স্যাড", emoji: "😢", color: "text-[#f7b125]" },
  { id: "angry", label: "Angry", bnLabel: "এংরি", emoji: "😡", color: "text-[#e95950]" }
];

interface MemoryCardProps {
  memory: MemoryItem;
  onOpenShareModal: (memory: MemoryItem) => void;
  onHideSuccess?: (memoryId: string) => void;
}

interface LocalComment {
  id: string;
  author: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onOpenShareModal,
  onHideSuccess
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Local state for interactive reactions & comments
  const [reactions, setReactions] = useState<{ [uid: string]: string }>(memory.reactions || {});
  const [isReactionHovered, setIsReactionHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Comments state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<LocalComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const myReaction = user?.uid ? reactions[user.uid] : undefined;
  const currentReactionObj = REACTION_TYPES.find(r => r.id === myReaction);
  const totalReactionsCount = Object.keys(reactions).length;

  const handleReactionClick = async (reactionId: string) => {
    if (!user) {
      toast.error("প্রতিক্রিয়া জানাতে অনুগ্রহ করে লগইন করুন");
      return;
    }
    const previous = { ...reactions };
    const next = { ...reactions };
    if (next[user.uid] === reactionId) {
      delete next[user.uid];
    } else {
      next[user.uid] = reactionId;
    }
    setReactions(next);
    setIsReactionHovered(false);

    try {
      await reactToMemory(memory, user.uid, reactionId);
    } catch {
      setReactions(previous);
      toast.error("প্রতিক্রিয়া সংরক্ষণ করা যায়নি");
    }
  };

  const handleHideThisMemory = async () => {
    if (!user?.uid) return;
    try {
      await hideMemory(user.uid, memory.id);
      setIsMenuOpen(false);
      toast.success("স্মৃতিটি সুপারিশ থেকে গোপন করা হয়েছে");
      onHideSuccess?.(memory.id);
    } catch {
      toast.error("স্মৃতি গোপন করা যায়নি");
    }
  };

  const handleHideThisPerson = async () => {
    if (!user?.uid) return;
    try {
      await hidePersonFromMemories(user.uid, {
        id: memory.authorId,
        name: memory.author,
        avatar: memory.authorPhotoUrl
      });
      setIsMenuOpen(false);
      toast.success(`"${memory.author}"-এর স্মৃতি আর প্রস্তাবিত হবে না`);
      onHideSuccess?.(memory.id);
    } catch {
      toast.error("ব্যক্তি গোপন করা যায়নি");
    }
  };

  const handleHideThisDate = async () => {
    if (!user?.uid) return;
    try {
      const d = new Date(memory.originalDate);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      await hideDateFromMemories(user.uid, {
        id: `month_${monthYear}`,
        type: 'month',
        label: memory.formattedDateBn,
        monthYear
      });
      setIsMenuOpen(false);
      toast.success(`"${memory.formattedDateBn}" সময়কালের স্মৃতি গোপন করা হয়েছে`);
      onHideSuccess?.(memory.id);
    } catch {
      toast.error("তারিখ ফিল্টার সংরক্ষণ করা যায়নি");
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/adda/post/${memory.originalId}`;
      await navigator.clipboard.writeText(url);
      setIsMenuOpen(false);
      toast.success("স্মৃতির লিংক কপি হয়েছে!");
    } catch {
      toast.error("লিংক কপি করা যায়নি");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      if (!user) toast.error("মন্তব্য করতে লগইন করুন");
      return;
    }

    const commentText = newComment.trim();
    setNewComment("");
    setIsSubmittingComment(true);

    const tempComment: LocalComment = {
      id: `temp_${Date.now()}`,
      author: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
      authorPhotoUrl: userProfile?.photoURL || user.photoURL || undefined,
      content: commentText,
      createdAt: new Date().toISOString()
    };

    setCommentsList(prev => [...prev, tempComment]);

    try {
      if (memory.originalCollection === 'discussions') {
        await addDoc(collection(db, "discussion_comments"), {
          postId: memory.originalId,
          content: commentText,
          author: userProfile?.name || user.displayName || 'সম্মানিত নাগরিক',
          authorId: user.uid,
          authorPhotoUrl: userProfile?.photoURL || user.photoURL || '',
          authorBadge: true,
          createdAt: new Date().toISOString(),
          likes: 0,
          reactions: {},
          isMemoryComment: true
        });

        await updateDoc(doc(db, "discussions", memory.originalId), {
          commentsCount: increment(1)
        });
      }
      toast.success("মন্তব্য যুক্ত হয়েছে!");
    } catch (err) {
      console.warn("Could not save comment to firestore:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const galleryImages = memory.gallery || (memory.imageUrl ? [memory.imageUrl] : []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* 1. TOP ANNIVERSARY BRANDING BANNER (Facebook On This Day Style) */}
      <div className="bg-gradient-to-r from-emerald-600 via-[#006a4e] to-teal-700 px-4 sm:px-5 py-3 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm tracking-wide">
              <span>{memory.anniversaryLabelBn}</span>
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-100 font-medium">
              📅 {memory.formattedDateBn}
            </p>
          </div>
        </div>

        {/* 3-Dot Preferences / More Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="স্মৃতি অপশন"
          >
            <MoreHorizontal size={18} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute right-0 top-10 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-30 text-slate-700 dark:text-slate-200"
              >
                <button
                  type="button"
                  onClick={handleHideThisMemory}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <EyeOff size={15} className="text-slate-400" />
                  <span>এই স্মৃতি সুপারিশ থেকে লুকান</span>
                </button>
                <button
                  type="button"
                  onClick={handleHideThisPerson}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <UserX size={15} className="text-slate-400" />
                  <span>{memory.author}-এর স্মৃতি গোপন করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleHideThisDate}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <CalendarX size={15} className="text-slate-400" />
                  <span>এই তারিখের স্মৃতি আর দেখাবেন না</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <LinkIcon size={15} className="text-slate-400" />
                  <span>লিংক কপি করুন</span>
                </button>
                {memory.originalCollection === 'discussions' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(`/adda/post/${memory.originalId}`);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                  >
                    <ExternalLink size={15} />
                    <span>মূল পোস্টটি দেখুন</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. ORIGINAL POST AUTHOR HEADER */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={memory.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${memory.authorId}`}
              alt={memory.author}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {memory.author}
                </h4>
                {memory.authorBadge && (
                  <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/20" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                <span>{memory.formattedDateBn}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {memory.privacy === 'only_me' ? (
                    <><Lock size={10} /> শুধুমাত্র আমি</>
                  ) : memory.privacy === 'friends' ? (
                    <><Users size={10} /> বন্ধুগণ</>
                  ) : (
                    <><Globe size={10} /> পাবলিক</>
                  )}
                </span>
                {memory.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <MapPin size={10} /> {memory.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300 border border-emerald-200/50">
            {toBengaliNumber(memory.yearsAgo)} বছর পূর্বের
          </span>
        </div>

        {/* 3. POST CONTENT / TEXT */}
        {memory.content && (
          <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed space-y-1">
            <p className={!isContentExpanded && memory.content.length > 200 ? "line-clamp-3" : ""}>
              {memory.content}
            </p>
            {memory.content.length > 200 && (
              <button
                type="button"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="text-xs font-black text-emerald-600 hover:underline inline-block mt-1"
              >
                {isContentExpanded ? "কম দেখান" : "...সম্পূর্ণ লেখা দেখুন"}
              </button>
            )}
          </div>
        )}

        {/* 4. EVENT DETAILS CARD (IF EVENT TYPE) */}
        {memory.type === 'event' && memory.eventDetails && (
          <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
              <Calendar size={15} />
              <span>ইভেন্ট স্মৃতি বিবরণ</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              {memory.eventDetails.venue && <div>📍 স্থান: {memory.eventDetails.venue}</div>}
              {memory.eventDetails.organizer && <div>👥 আয়োজক: {memory.eventDetails.organizer}</div>}
              {memory.eventDetails.time && <div>⏰ সময়: {memory.eventDetails.time}</div>}
            </div>
          </div>
        )}

        {/* 5. MEDIA DISPLAY (GALLERY, SINGLE PHOTO, VIDEO) */}
        {memory.videoUrl ? (
          <div className="rounded-2xl overflow-hidden shadow-inner bg-black">
            <PostVideoPlayer src={memory.videoUrl} poster={memory.videoPoster} />
          </div>
        ) : galleryImages.length > 0 ? (
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <PostPhotoGallery
              images={galleryImages}
              onImageClick={(idx) => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
            />
          </div>
        ) : null}

        {/* 6. ORIGINAL METRICS SUMMARY */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-rose-500 font-black">
              ❤️ {toBengaliNumber(memory.originalLikes || totalReactionsCount)}
            </span>
            <span>•</span>
            <span>💬 {toBengaliNumber(memory.originalCommentsCount + commentsList.length)} টি মন্তব্য</span>
          </div>

          <span className="text-[10px] text-slate-400 font-medium">
            🕰️ মূল প্রকাশ: {memory.formattedDateBn}
          </span>
        </div>

        {/* 7. ACTION BUTTONS: REACTIONS, COMMENTS, SHARE */}
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-1 relative">
          {/* Reaction Button with Floating Hover Emoji Bar */}
          <div
            className="relative"
            onMouseEnter={() => setIsReactionHovered(true)}
            onMouseLeave={() => setIsReactionHovered(false)}
          >
            <button
              type="button"
              onClick={() => handleReactionClick(myReaction ? myReaction : 'love')}
              className={`w-full py-2 px-1 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                currentReactionObj
                  ? `${currentReactionObj.color} bg-rose-50 dark:bg-rose-950/30`
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {currentReactionObj ? (
                <>
                  <span className="text-base leading-none">{currentReactionObj.emoji}</span>
                  <span>{currentReactionObj.bnLabel}</span>
                </>
              ) : (
                <>
                  <Heart size={16} className="text-rose-500" />
                  <span>স্মৃতিতে ভালোবাসা</span>
                </>
              )}
            </button>

            {/* Floating Emojis */}
            <AnimatePresence>
              {isReactionHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: -45, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute left-0 bottom-full z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-2xl flex items-center gap-1.5"
                >
                  {REACTION_TYPES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReactionClick(r.id);
                      }}
                      className="text-xl p-1 hover:scale-125 transition-transform cursor-pointer"
                      title={r.bnLabel}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="w-full py-2 px-1 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageCircle size={16} className="text-blue-500" />
            <span>মন্তব্য ({toBengaliNumber(commentsList.length + memory.originalCommentsCount)})</span>
          </button>

          {/* Share Memory Button (Opens Share Modal) */}
          <button
            type="button"
            onClick={() => onOpenShareModal(memory)}
            className="w-full py-2 px-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-[#006a4e] dark:text-emerald-300 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 size={15} />
            <span>স্মৃতি শেয়ার</span>
          </button>
        </div>

        {/* 8. COMMENT DRAWER & FORM */}
        {isCommentsOpen && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <img
                src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.uid || 'guest'}`}
                alt="Me"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-500/30"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="এই স্মৃতির ব্যাপারে একটি সুন্দর মন্তব্য লিখুন..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 pr-10 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>

            {/* Render Comments */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {commentsList.length > 0 ? (
                commentsList.map(c => (
                  <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <img
                      src={c.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.author}`}
                      alt={c.author}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{c.author}</span>
                        <span className="text-[10px] text-slate-400">এখনই</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-normal mt-0.5">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 text-center py-2">
                  এই স্মৃতিতে প্রথম মন্তব্যটি আপনি করুন! 💬
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for full image zoom */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        initialIndex={lightboxIndex}
      />
    </div>
  );
};

export default MemoryCard;

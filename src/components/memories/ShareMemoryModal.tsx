import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Share2,
  Globe,
  Users,
  Lock,
  MessageCircle,
  Sparkles,
  Layers,
  Send,
  Check,
  Smile,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { MemoryItem, executeShareMemory, toBengaliNumber } from "../../services/memoryService";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

interface ShareMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: MemoryItem | null;
  onShareSuccess?: () => void;
}

export const ShareMemoryModal: React.FC<ShareMemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
  onShareSuccess
}) => {
  const { user, userProfile } = useAuth();
  const [caption, setCaption] = useState("");
  const [shareTarget, setShareTarget] = useState<'feed' | 'story' | 'group' | 'message'>('feed');
  const [privacy, setPrivacy] = useState<'Public' | 'Friends' | 'Only Me'>('Public');
  const [isSharing, setIsSharing] = useState(false);

  // Group share list
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  // Direct message recipients list
  const [chatUsers, setChatUsers] = useState<{ uid: string; name: string; photoURL?: string }[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      // Set default festive caption
      if (memory) {
        setCaption(`🕰️ ${memory.anniversaryLabelBn} — সুন্দর এই মুহূর্তটি আবার সবার সাথে শেয়ার করছি! 💚`);
      }

      // Fetch user groups
      getDocs(query(collection(db, "groups"), limit(20)))
        .then(snap => {
          const list: { id: string; name: string }[] = [];
          snap.forEach(d => {
            const data = d.data();
            list.push({ id: d.id, name: data.name || data.title || "আড্ডা ঘর" });
          });
          setGroups(list);
          if (list.length > 0) setSelectedGroup(list[0]);
        })
        .catch(err => console.warn(err));

      // Fetch active users for direct messaging
      getDocs(query(collection(db, "users"), limit(20)))
        .then(snap => {
          const uList: any[] = [];
          snap.forEach(d => {
            const data = d.data();
            if (d.id !== user.uid && data.name) {
              uList.push({ uid: d.id, name: data.name, photoURL: data.photoURL });
            }
          });
          setChatUsers(uList);
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen, memory, user]);

  if (!isOpen || !memory) return null;

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("স্মৃতি শেয়ার করতে অনুগ্রহ করে লগইন করুন");
      return;
    }

    if (shareTarget === 'group' && !selectedGroup) {
      toast.error("অনুগ্রহ করে একটি গ্রুপ নির্বাচন করুন");
      return;
    }

    if (shareTarget === 'message' && selectedRecipients.length === 0) {
      toast.error("অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন");
      return;
    }

    setIsSharing(true);
    try {
      await executeShareMemory({
        memory,
        user,
        userProfile,
        shareTarget,
        caption,
        privacy,
        selectedGroup: selectedGroup || undefined,
        selectedRecipients
      });

      toast.success(
        shareTarget === 'story'
          ? "স্মৃতিটি স্টোরিতে শেয়ার হয়েছে! 🕰️"
          : shareTarget === 'message'
          ? "মেসেজে স্মৃতি পাঠানো হয়েছে! 💬"
          : shareTarget === 'group'
          ? `"${selectedGroup?.name}" গ্রুপে শেয়ার হয়েছে! 👥`
          : "আপনার টাইমলাইনে স্মৃতি সফলভাবে শেয়ার হয়েছে! 💚"
      );

      onShareSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Share memory failed:", err);
      toast.error("স্মৃতি শেয়ার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSharing(false);
    }
  };

  const toggleRecipient = (uid: string) => {
    setSelectedRecipients(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  স্মৃতি শেয়ার করুন
                  <Sparkles size={14} className="text-amber-500" />
                </h3>
                <p className="text-[11px] font-bold text-slate-400">
                  {memory.anniversaryLabelBn}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleShareSubmit} className="p-5 space-y-4">
            {/* Share Destination Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                কোথায় শেয়ার করতে চান?
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                {[
                  { id: 'feed', label: 'ফিড / টাইমলাইন', icon: Globe },
                  { id: 'story', label: 'স্টোরি (২৪ ঘণ্টা)', icon: Sparkles },
                  { id: 'group', label: 'আড্ডা ঘর (গ্রুপ)', icon: Users },
                  { id: 'message', label: 'মেসেঞ্জার', icon: MessageCircle }
                ].map(t => {
                  const Icon = t.icon;
                  const isSelected = shareTarget === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setShareTarget(t.id as any)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#006a4e] text-white shadow-sm shadow-emerald-700/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate max-w-full text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy Selector (For Feed) */}
            {shareTarget === 'feed' && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500">প্রাইভেসি নির্বাচন:</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'Public', label: 'পাবলিক', icon: Globe },
                    { id: 'Friends', label: 'বন্ধুগণ', icon: Users },
                    { id: 'Only Me', label: 'শুধুমাত্র আমি', icon: Lock }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrivacy(p.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                        privacy === p.id
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-[#006a4e] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p.icon size={11} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Group Selector (For Group Share) */}
            {shareTarget === 'group' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  গ্রুপ নির্বাচন করুন:
                </label>
                {groups.length > 0 ? (
                  <select
                    value={selectedGroup?.id || ""}
                    onChange={e => {
                      const g = groups.find(x => x.id === e.target.value);
                      if (g) setSelectedGroup(g);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600">কোনো গ্রুপ পাওয়া যায়নি।</p>
                )}
              </div>
            )}

            {/* Message Recipient Multi-select (For Message Share) */}
            {shareTarget === 'message' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  প্রাপক নাগরিক নির্বাচন করুন ({selectedRecipients.length} জন নির্বাচিত):
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {chatUsers.map(u => {
                    const isChecked = selectedRecipients.includes(u.uid);
                    return (
                      <div
                        key={u.uid}
                        onClick={() => toggleRecipient(u.uid)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-bold transition-all ${
                          isChecked
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-[#006a4e] dark:text-emerald-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.uid}`}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span>{u.name}</span>
                        </div>
                        {isChecked && <Check size={14} className="text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                আপনার অনুভূতি বা বার্তা লিখুন:
              </label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="এই স্মৃতি নিয়ে কিছু লিখুন..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            {/* Embedded Memory Preview Card */}
            <div className="p-3 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {memory.anniversaryLabelBn}
                </span>
                <span>📅 {memory.formattedDateBn}</span>
              </div>

              {/* Memory Author Info */}
              <div className="flex items-center gap-2">
                <img
                  src={memory.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${memory.authorId}`}
                  alt={memory.author}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-300"
                />
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white block truncate">
                    {memory.author}
                  </span>
                </div>
              </div>

              {/* Memory Text Content Preview */}
              {memory.content && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                  {memory.content}
                </p>
              )}

              {/* Memory Image Preview */}
              {(memory.imageUrl || (memory.gallery && memory.gallery.length > 0)) && (
                <div className="rounded-xl overflow-hidden max-h-36 bg-slate-100">
                  <img
                    src={memory.imageUrl || memory.gallery?.[0]}
                    alt="Memory preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-200 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSharing}
                className="px-6 py-2.5 rounded-2xl bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>শেয়ার হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>এখনই শেয়ার করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareMemoryModal;

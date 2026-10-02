import React, { useState } from 'react';
import { 
  BarChart3, CheckCircle2, Clock, Users, AlertCircle, 
  Check, Trophy, Sparkles, Lock, ArrowRight, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PollOptionItem {
  id: number | string;
  label: string;
  votes: number;
}

export interface PollData {
  question: string;
  options: PollOptionItem[];
  votedUsers?: { [userId: string]: number | string };
  endsAt?: any; // Timestamp, number (millis), Date, or ISO string
  durationDays?: number;
  createdAt?: any;
  isClosed?: boolean;
}

interface PostPollWidgetProps {
  postId: string;
  poll: PollData;
  currentUserId?: string | null;
  onVote: (postId: string, optionId: number | string) => Promise<void> | void;
  onRequireAuth?: () => void;
  className?: string;
}

// Convert English numbers to Bengali numerals
function toBengaliDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
}

// Format End Date or calculate remaining time
function formatPollEndTime(endsAt: any): { text: string; isExpired: boolean } {
  if (!endsAt) {
    return { text: "চলমান পোল (কোনো নির্দিষ্ট সময়সীমা নেই)", isExpired: false };
  }

  let endTimeMillis: number;
  if (typeof endsAt === 'number') {
    endTimeMillis = endsAt;
  } else if (endsAt && typeof endsAt.toMillis === 'function') {
    endTimeMillis = endsAt.toMillis();
  } else if (endsAt && endsAt.seconds) {
    endTimeMillis = endsAt.seconds * 1000;
  } else if (typeof endsAt === 'string') {
    endTimeMillis = new Date(endsAt).getTime();
  } else if (endsAt instanceof Date) {
    endTimeMillis = endsAt.getTime();
  } else {
    return { text: "চলমান পোল", isExpired: false };
  }

  if (isNaN(endTimeMillis)) {
    return { text: "চলমান পোল", isExpired: false };
  }

  const now = Date.now();
  const diff = endTimeMillis - now;

  if (diff <= 0) {
    const dateObj = new Date(endTimeMillis);
    const dateStr = dateObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
    return { text: `পোল সমাপ্ত হয়েছে (${dateStr})`, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { text: `আর ${toBengaliDigits(days)} দিন ${toBengaliDigits(hours)} ঘণ্টা বাকি`, isExpired: false };
  }
  if (hours > 0) {
    return { text: `আর ${toBengaliDigits(hours)} ঘণ্টা ${toBengaliDigits(minutes)} মিনিট বাকি`, isExpired: false };
  }
  return { text: `আর মাত্র ${toBengaliDigits(Math.max(1, minutes))} মিনিট বাকি`, isExpired: false };
}

export function PostPollWidget({
  postId,
  poll,
  currentUserId,
  onVote,
  onRequireAuth,
  className = ""
}: PostPollWidgetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | string | null>(null);

  if (!poll || !poll.options || poll.options.length === 0) {
    return null;
  }

  // Calculate Total Votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + (Number(opt.votes) || 0), 0);

  // Check if current user has voted
  const votedUsers = poll.votedUsers || {};
  const userVotedOptionId = currentUserId && votedUsers[currentUserId] !== undefined
    ? votedUsers[currentUserId]
    : null;
  const hasUserVoted = userVotedOptionId !== null && userVotedOptionId !== undefined;

  // Check poll expiration
  const { text: endTimeText, isExpired: isPollExpired } = formatPollEndTime(poll.endsAt);
  const isClosed = poll.isClosed || isPollExpired;

  // If user has voted or poll is closed, SHOW RESULTS view
  const showResults = hasUserVoted || isClosed;

  // Find the winning/highest voted option
  const maxVotes = Math.max(...poll.options.map(o => Number(o.votes) || 0));

  const handleOptionClick = async (optionId: number | string) => {
    if (showResults || isSubmitting) return;

    if (!currentUserId) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setSelectedOptionId(optionId);
      await onVote(postId, optionId);
    } catch (err) {
      console.error("Poll vote error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200/80 shadow-sm space-y-3.5 ${className}`}>
      {/* 1. প্রশ্ন (Poll Question & Header Badge) */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[#006a4e] text-xs font-black uppercase tracking-wider">
            <BarChart3 size={15} className="text-[#006a4e]" />
            <span>নাগরিক পোল ও মতামত</span>
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
            {poll.question || "আপনার মতামত দিন:"}
          </h4>
        </div>

        {/* Status Badge (Active / Ended) */}
        {isClosed ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-200/80 text-slate-700 shrink-0 border border-slate-300">
            <Lock size={11} />
            <span>ভোট গ্রহণ সমাপ্ত</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100/80 text-emerald-800 shrink-0 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>চলমান</span>
          </span>
        )}
      </div>

      {/* 2. Options List & Voting / Results */}
      <div className="space-y-2.5">
        {poll.options.map((option, idx) => {
          const optVotes = Number(option.votes) || 0;
          const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
          const isUserPick = String(userVotedOptionId) === String(option.id);
          const isWinning = totalVotes > 0 && optVotes === maxVotes && optVotes > 0;
          const isCurrentlySubmitting = isSubmitting && selectedOptionId === option.id;

          // VIEW 1: RESULTS VIEW (After user votes OR when poll is closed)
          if (showResults) {
            return (
              <div
                key={option.id || idx}
                className={`relative overflow-hidden rounded-xl border p-3 transition-all duration-300 ${
                  isUserPick
                    ? 'border-[#006a4e] bg-emerald-50/40 shadow-sm ring-1 ring-[#006a4e]/20'
                    : isWinning && !isUserPick
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                {/* Animated Percentage Fill Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute inset-y-0 left-0 transition-colors ${
                    isUserPick
                      ? 'bg-emerald-500/20'
                      : isWinning
                      ? 'bg-amber-400/20'
                      : 'bg-slate-200/50'
                  }`}
                />

                {/* Option Content & Stats */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* User Vote / Check Indicator */}
                    {isUserPick ? (
                      <span className="w-5 h-5 rounded-full bg-[#006a4e] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : isWinning ? (
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Trophy size={11} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {toBengaliDigits(idx + 1)}
                      </span>
                    )}

                    <span className={`text-xs sm:text-sm font-bold truncate ${
                      isUserPick ? 'text-[#006a4e] font-extrabold' : 'text-slate-800'
                    }`}>
                      {option.label}
                    </span>

                    {/* "আপনার ভোট" Badge */}
                    {isUserPick && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white shrink-0">
                        আপনার ভোট
                      </span>
                    )}
                  </div>

                  {/* Percentage & Vote Count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-slate-500">
                      {toBengaliDigits(optVotes)} টি ভোট
                    </span>
                    <span className={`text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                      isUserPick
                        ? 'bg-emerald-600 text-white'
                        : isWinning
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {toBengaliDigits(percentage)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // VIEW 2: VOTING INTERFACE (Before user votes)
          return (
            <button
              key={option.id || idx}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOptionClick(option.id)}
              className="w-full relative group overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-[#006a4e] hover:bg-emerald-50/30 p-3 text-left transition-all duration-150 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Radio Selector Icon */}
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-[#006a4e] flex items-center justify-center transition-colors shrink-0 bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#006a4e] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#006a4e] transition-colors truncate">
                  {option.label}
                </span>
              </div>

              {/* Vote CTA */}
              <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 group-hover:text-[#006a4e] shrink-0 transition-colors">
                <span>{isCurrentlySubmitting ? "ভোট নেওয়া হচ্ছে..." : "ভোট দিন"}</span>
                <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper text before voting */}
      {!showResults && (
        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <span>💡</span>
          <span>ভোট দেওয়ার জন্য পছন্দের অপশনে ক্লিক করুন। ভোট দেওয়ার পর লাইভ ফলাফল দেখতে পাবেন।</span>
        </p>
      )}

      {/* 3. Bottom Summary Row: Total Votes & Poll End Time */}
      <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-semibold">
        {/* Total Votes Count */}
        <div className="flex items-center gap-1.5 text-slate-700">
          <Users size={14} className="text-slate-500" />
          <span>সর্বমোট ভোট:</span>
          <span className="font-extrabold text-[#006a4e]">{toBengaliDigits(totalVotes)} টি</span>
        </div>

        {/* Poll End Time / Remaining Countdown */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock size={14} className={isClosed ? "text-slate-400" : "text-amber-500"} />
          <span>{endTimeText}</span>
        </div>
      </div>
    </div>
  );
}

export default PostPollWidget;

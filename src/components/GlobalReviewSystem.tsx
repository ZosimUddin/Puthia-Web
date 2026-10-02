import React, { useState, useEffect, useMemo } from "react";
import { 
  Star, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  Filter, 
  Flag, 
  X, 
  AlertCircle, 
  Check, 
  Search, 
  Sparkles, 
  UserCheck, 
  Award,
  Image as ImageIcon
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove,
  increment
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export interface ReviewItem {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  isVerifiedUser?: boolean;
  userRole?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  recommend?: boolean;
  helpfulCount?: number;
  helpfulUserIds?: string[];
  reportCount?: number;
  status?: "approved" | "pending" | "reported" | "rejected";
  images?: string[];
  createdAt: string;
}

interface GlobalReviewSystemProps {
  itemId: string;
  itemName: string;
  itemCategory?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  onReviewAdded?: () => void;
}

const REPORT_REASONS = [
  "অসত্য বা বিভ্রান্তিকর তথ্য",
  "অশালীন বা কটু ভাষার ব্যবহার",
  "স্প্যাম বা অযাচিত বিজ্ঞাপন",
  "ব্যক্তিগত আক্রমণ বা হ্যারাসমেন্ট",
  "ভুল তথ্য বা অনধিকার চর্চা",
  "অন্যান্য কারণ",
];

const RATING_LABELS: Record<number, string> = {
  1: "অত্যন্ত বাজে (১/৫)",
  2: "সন্তোষজনক নয় (২/৫)",
  3: "মোটামুটি ভালো (৩/৫)",
  4: "খুব ভালো (৪/৫)",
  5: "অসাধারণ সেবা! (৫/৫)",
};

export const GlobalReviewSystem: React.FC<GlobalReviewSystemProps> = ({
  itemId,
  itemName,
  itemCategory = "general",
  title = "ফিডব্যাক, রেটিং ও নাগরিক মতামত",
  subtitle = "আপনার অভিজ্ঞতা শেয়ার করুন এবং ৫ সিভিক ইস্টার অর্জন করুন",
  compact = false,
  onReviewAdded,
}) => {
  const { user, userProfile, addStars } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<boolean>(true);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI Modals & Filters
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reportingReview, setReportingReview] = useState<ReviewItem | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Filter & Search states
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "highest" | "helpful">("latest");

  // Track user votes in local storage as backup
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`puthia_helpful_${itemId}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Listen to Firestore reviews
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "ratings_reviews"),
      where("itemId", "==", itemId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ReviewItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter out rejected reviews unless submitted by current user
          const status = data.status || "approved";
          if (status !== "rejected" || (user && user.uid === data.userId)) {
            list.push({
              id: docSnap.id,
              itemId: data.itemId,
              itemName: data.itemName || itemName,
              itemCategory: data.itemCategory || itemCategory,
              userId: data.userId,
              userName: data.userName || "সম্মানিত নাগরিক",
              userPhoto: data.userPhoto || "",
              isVerifiedUser: Boolean(data.isVerifiedUser),
              userRole: data.userRole || "",
              rating: Number(data.rating) || 5,
              title: data.title || "",
              comment: data.comment || "",
              recommend: data.recommend !== false,
              helpfulCount: Number(data.helpfulCount) || 0,
              helpfulUserIds: Array.isArray(data.helpfulUserIds) ? data.helpfulUserIds : [],
              reportCount: Number(data.reportCount) || 0,
              status: status,
              images: Array.isArray(data.images) ? data.images : [],
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        });

        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [itemId, user]);

  // Compute Overall Rating Metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const verifiedReviewsCount = reviews.filter((r) => r.isVerifiedUser).length;
  const recommendCount = reviews.filter((r) => r.recommend).length;
  const recommendPercentage = totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 100;

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, pct };
  });

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((rev) => {
        if (selectedStarFilter && Math.round(rev.rating) !== selectedStarFilter) return false;
        if (verifiedOnly && !rev.isVerifiedUser) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rev.userName.toLowerCase().includes(q);
          const matchComment = rev.comment.toLowerCase().includes(q);
          const matchTitle = (rev.title || "").toLowerCase().includes(q);
          if (!matchName && !matchComment && !matchTitle) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.rating - a.rating;
        if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [reviews, selectedStarFilter, verifiedOnly, searchQuery, sortBy]);

  // Check if current logged in user already left a review
  const userExistingReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.userId === user.uid) || null;
  }, [reviews, user]);

  // Add Image URL to form
  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    if (reviewImages.length >= 3) {
      toast.error("সর্বোচ্চ ৩টি ছবি যুক্ত করতে পারবেন");
      return;
    }
    setReviewImages([...reviewImages, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  // Remove Image URL from form
  const handleRemoveImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!comment.trim()) {
      toast.error("দয়া করে আপনার মতামত বা মন্তব্য টাইপ করুন");
      return;
    }

    if (userRating < 1 || userRating > 5) {
      toast.error("দয়া করে ১ থেকে ৫ স্টার রেটিং সিলেক্ট করুন");
      return;
    }

    setIsSubmitting(true);

    try {
      const isUserVerified = Boolean(
        (userProfile as any)?.isVerified || 
        user.emailVerified || 
        (userProfile?.role as string) === "verified_citizen" || 
        userProfile?.role === "admin"
      );

      const newReviewDoc = {
        itemId,
        itemName,
        itemCategory,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || "সম্মানিত নাগরিক",
        userPhoto: userProfile?.photoURL || user.photoURL || "",
        isVerifiedUser: isUserVerified,
        userRole: userProfile?.role || "citizen",
        rating: userRating,
        title: reviewTitle.trim(),
        comment: comment.trim(),
        recommend,
        helpfulCount: 0,
        helpfulUserIds: [],
        reportCount: 0,
        status: "approved",
        images: reviewImages,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "ratings_reviews"), newReviewDoc);

      // Award 5 Civic Points!
      if (addStars) {
        await addStars(5);
      }

      toast.success("আপনার রিভিউ ও রেটিং সফলভাবে গৃহীত হয়েছে! +৫ সিভিক ইস্টার অর্জিত 🎉");

      // Reset form
      setReviewTitle("");
      setComment("");
      setReviewImages([]);
      setUserRating(5);

      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("রিভিউ জমা দিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpful Upvote Click
  const handleToggleHelpful = async (review: ReviewItem) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const reviewRef = doc(db, "ratings_reviews", review.id);
    const hasVoted = review.helpfulUserIds?.includes(user.uid) || votedHelpful[review.id];

    try {
      if (hasVoted) {
        // Remove vote
        await updateDoc(reviewRef, {
          helpfulCount: increment(-1),
          helpfulUserIds: arrayRemove(user.uid),
        });
        const updatedLocal = { ...votedHelpful, [review.id]: false };
        setVotedHelpful(updatedLocal);
        localStorage.setItem(`puthia_helpful_${itemId}`, JSON.stringify(updatedLocal));
        toast.info("উপকারী ভোট প্রত্যাহার করা হয়েছে");
      } else {
        // Add vote
        await updateDoc(reviewRef, {
          helpfulCount: increment(1),
          helpfulUserIds: arrayUnion(user.uid),
        });
        const updatedLocal = { ...votedHelpful, [review.id]: true };
        setVotedHelpful(updatedLocal);
        localStorage.setItem(`puthia_helpful_${itemId}`, JSON.stringify(updatedLocal));
        toast.success("ধন্যবাদ! রিভিউটি 'উপকারী' হিসেবে মার্ক করা হয়েছে 👍");
      }
    } catch (e) {
      console.error("Helpful vote error:", e);
      toast.error("ভোট দিতে সমস্যা হয়েছে");
    }
  };

  // Submit Report against review
  const handleReportSubmit = async () => {
    if (!reportingReview) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedReportReason) {
      toast.error("দয়া করে রিপোর্টের কারণ নির্বাচন করুন");
      return;
    }

    setIsSubmittingReport(true);

    try {
      // 1. Add report to review_reports collection
      await addDoc(collection(db, "review_reports"), {
        reviewId: reportingReview.id,
        itemId: reportingReview.itemId,
        itemName: reportingReview.itemName,
        reporterId: user.uid,
        reporterName: userProfile?.name || user.displayName || "নাগরিক",
        reason: selectedReportReason,
        details: reportDetails.trim(),
        createdAt: new Date().toISOString(),
        status: "pending_moderation",
      });

      // 2. Increment reportCount on the review
      const reviewRef = doc(db, "ratings_reviews", reportingReview.id);
      const newReportCount = (reportingReview.reportCount || 0) + 1;

      await updateDoc(reviewRef, {
        reportCount: increment(1),
        // If 3 or more reports, flag review status for moderation
        ...(newReportCount >= 3 ? { status: "reported" } : {}),
      });

      toast.success("রিপোর্টটি এডমিন/মডারেটরের কাছে পাঠানো হয়েছে। ধন্যবাদ!");
      setReportingReview(null);
      setSelectedReportReason("");
      setReportDetails("");
    } catch (e) {
      console.error("Report submit error:", e);
      toast.error("রিপোর্ট পাঠাতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Delete own review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে আপনার এই রিভিউটি মুছে ফেলতে চান?")) return;

    try {
      await deleteDoc(doc(db, "ratings_reviews", reviewId));
      toast.success("রিভিউটি সফলভাবে মুছে ফেলা হয়েছে");
    } catch (e) {
      console.error("Delete review error:", e);
      toast.error("রিভিউ মুছতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 text-left font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#006a4e]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 bg-emerald-50 text-[#006a4e] border border-emerald-200 rounded-full text-xs font-black flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{avgRating} / ৫.০ ({totalReviews}টি ফিডব্যাক)</span>
          </span>
        </div>
      </div>

      {/* Summary Scorecard & Star Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
        {/* Score Column */}
        <div className="md:col-span-4 text-center md:border-r border-slate-200/80 pr-0 md:pr-4 py-2 space-y-2">
          <p className="text-4xl font-black text-slate-900 leading-none">{avgRating}</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(avgRating))
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] font-bold text-slate-600 space-y-1">
            <p>{totalReviews}টি নাগরিক রিভিউ</p>
            {verifiedReviewsCount > 0 && (
              <p className="text-emerald-700 flex items-center justify-center gap-1 text-[10px]">
                <UserCheck size={12} /> {verifiedReviewsCount}টি যাচাইকৃত নাগরিক রিভিউ
              </p>
            )}
            {totalReviews > 0 && (
              <p className="text-indigo-700 text-[10px]">
                👍 {recommendPercentage}% নাগরিক সেবাটি সুপারিশ করছেন
              </p>
            )}
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-8 space-y-1.5">
          {starCounts.map((sc) => (
            <div
              key={sc.stars}
              onClick={() => setSelectedStarFilter(selectedStarFilter === sc.stars ? null : sc.stars)}
              className={`flex items-center gap-2 text-xs font-bold cursor-pointer p-1 rounded-lg transition-colors ${
                selectedStarFilter === sc.stars ? "bg-emerald-100/70" : "hover:bg-slate-100"
              }`}
            >
              <span className="w-3 text-right text-slate-700">{sc.stars}</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${sc.pct}%` }}
                ></div>
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-slate-500">
                {sc.count} ({Math.round(sc.pct)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Form Section */}
      <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-black text-[#006a4e] flex items-center gap-1.5">
          <Sparkles size={15} />
          <span>আপনার নিজস্ব রিভিউ ও রেটিং যোগ করুন</span>
        </h4>

        {!user ? (
          <div className="text-center py-4 bg-white rounded-xl border border-emerald-100 space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              রিভিউ দিতে এবং ৫ সিভিক ইস্টার বোনাস পেতে অনুগ্রহ করে নাগরিক পোর্টালে লগইন করুন।
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-[#006a4e] hover:bg-[#00543e] text-white rounded-xl text-xs font-black transition border-none cursor-pointer shadow-xs"
            >
              লগইন / রেজিস্ট্রেশন করুন
            </button>
          </div>
        ) : userExistingReview ? (
          <div className="bg-white rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>আপনি ইতোমধ্যেই এই প্রতিষ্ঠানটির জন্য একটি রিভিউ দিয়েছেন।</span>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteReview(userExistingReview.id)}
              className="text-rose-600 hover:underline font-bold text-xs border-none bg-transparent cursor-pointer shrink-0"
            >
              মুছে নতুন করে দিন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                রেটিং নির্বাচন করুন:{" "}
                <span className="text-amber-600 font-extrabold">
                  {RATING_LABELS[hoverRating || userRating]}
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setUserRating(star)}
                    className="p-1 border-none bg-transparent cursor-pointer active:scale-90 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || userRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Recommendation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  শিরোনাম (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অসাধারণ সার্ভিস ও দ্রুত চিকিৎসা"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  অন্যদের জন্য সুপারিশ:
                </label>
                <div className="flex items-center gap-1 h-[38px]">
                  <button
                    type="button"
                    onClick={() => setRecommend(true)}
                    className={`flex-1 h-full rounded-xl text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer transition ${
                      recommend
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    👍 সুপারিশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommend(false)}
                    className={`flex-1 h-full rounded-xl text-xs font-bold flex items-center justify-center gap-1 border cursor-pointer transition ${
                      !recommend
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    👎 করবো না
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Area */}
            <div className="relative space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                আপনার বিস্তারিত অভিজ্ঞতা বা পরামর্শ:
              </label>
              <textarea
                placeholder="সেবার মান, ব্যবহার, সময় ব্যবস্থাপনা বা অন্যান্য মন্তব্য লিখুন..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={600}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006a4e]"
              ></textarea>
              <span className="absolute right-2 bottom-2 text-[10px] font-mono text-slate-400">
                {comment.length}/৬০০
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#006a4e] hover:bg-[#00543e] disabled:bg-slate-300 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition"
            >
              <Send size={14} />
              <span>{isSubmitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন (+৫ ইস্টার)"}</span>
            </button>
          </form>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="রিভিউ ও কমেন্ট খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006a4e]"
          />
        </div>

        {/* Filter Badges & Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 transition ${
              verifiedOnly
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <UserCheck size={13} />
            <span>শুধুমাত্র যাচাইকৃত</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="latest">সর্বশেষ রিভিউ</option>
            <option value="highest">সর্বোচ্চ রেটিং</option>
            <option value="helpful">সবচেয়ে উপকারী</option>
          </select>

          {selectedStarFilter && (
            <button
              type="button"
              onClick={() => setSelectedStarFilter(null)}
              className="px-2 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              {selectedStarFilter}★ ফিল্টার মুছুন
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 flex items-center justify-between">
          <span>রিভিউ তালিকা ({filteredReviews.length}টি)</span>
          {reviews.length !== filteredReviews.length && (
            <span className="text-[11px] font-normal text-slate-500">
              (মোট {reviews.length}টির মধ্যে)
            </span>
          )}
        </h4>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500 animate-pulse">
            রিভিউ ও রেটিং লোড হচ্ছে...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <MessageSquare size={24} className="text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">কোনো রিভিউ পাওয়া যায়নি</p>
            <p className="text-[11px] text-slate-500">
              {searchQuery || selectedStarFilter
                ? "ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।"
                : "প্রথম নাগরিক হিসেবে আপনার অভিজ্ঞতা শেয়ার করুন এবং ৫ সিভিক ইস্টার অর্জন করুন!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-none">
            {filteredReviews.map((rev) => {
              const isHelpfulByMe = Boolean(
                rev.helpfulUserIds?.includes(user?.uid || "") || votedHelpful[rev.id]
              );

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-emerald-300 transition-all space-y-2.5 relative group shadow-xs"
                >
                  {/* Top Header: Reviewer Info & Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#006a4e] font-black flex items-center justify-center text-xs overflow-hidden shrink-0">
                        {rev.userPhoto ? (
                          <img
                            src={rev.userPhoto}
                            alt={rev.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{rev.userName.charAt(0)}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900">
                            {rev.userName}
                          </span>

                          {rev.isVerifiedUser && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-0.5">
                              <CheckCircle2 size={10} className="fill-emerald-600 text-white" />
                              <span>যাচাইকৃত নাগরিক</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}

                          {rev.recommend ? (
                            <span className="text-[10px] font-bold text-emerald-700 ml-1">
                              • 👍 সুপারিশ করেছেন
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 ml-1">
                              • 👎 সুপারিশ করেননি
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(rev.createdAt).toLocaleDateString("bn-BD")}
                    </span>
                  </div>

                  {/* Title & Comment */}
                  {rev.title && (
                    <h5 className="text-xs font-black text-slate-800 leading-snug">
                      {rev.title}
                    </h5>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  {/* Images if attached */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90"
                        >
                          <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action Bar: Helpful & Report */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleHelpful(rev)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition border-none cursor-pointer ${
                          isHelpfulByMe
                            ? "bg-emerald-100 text-[#006a4e]"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        <ThumbsUp size={12} className={isHelpfulByMe ? "fill-emerald-700" : ""} />
                        <span>উপকারী ({rev.helpfulCount || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportingReview(rev)}
                        className="flex items-center gap-1 text-slate-400 hover:text-rose-600 font-bold border-none bg-transparent cursor-pointer transition"
                      >
                        <Flag size={11} />
                        <span>রিপোর্ট করুন</span>
                      </button>
                    </div>

                    {user && user.uid === rev.userId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 border-none bg-transparent cursor-pointer"
                        title="রিভিউ মুছুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                  <ShieldAlert size={18} />
                  <span>রিভিউ রিপোর্ট করুন</span>
                </div>
                <button
                  onClick={() => setReportingReview(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600">
                  রিভিউদাতা: <span className="font-bold text-slate-900">{reportingReview.userName}</span>
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    রিপোর্টের প্রধান কারণ নির্বাচন করুন:
                  </label>
                  <div className="space-y-1">
                    {REPORT_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          selectedReportReason === reason
                            ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={selectedReportReason === reason}
                          onChange={(e) => setSelectedReportReason(e.target.value)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    অতিরিক্ত বিবরণ (ঐচ্ছিক):
                  </label>
                  <textarea
                    placeholder="কেন এই রিভিউটি নীতিমালা পরিপন্থী..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  disabled={isSubmittingReport}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl font-black text-xs border-none cursor-pointer shadow-md"
                >
                  {isSubmittingReport ? "পাঠানো হচ্ছে..." : "রিপোর্ট জমা দিন"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default GlobalReviewSystem;

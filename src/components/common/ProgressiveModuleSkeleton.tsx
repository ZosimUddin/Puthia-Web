import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

/* ==========================================================================
   1. CORE PROGRESSIVE SHIMMER SKELETON PRIMITIVE
   ========================================================================== */
export interface ShimmerProps {
  className?: string;
  delayMs?: number;
  rounded?: string;
  aspectRatio?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  delayMs = 0,
  rounded = 'rounded-2xl',
  aspectRatio
}) => {
  return (
    <div
      style={{
        animationDelay: `${delayMs}ms`,
        aspectRatio: aspectRatio
      }}
      className={`relative overflow-hidden bg-slate-200/85 dark:bg-slate-800/85 ${rounded} ${className}`}
    >
      {/* Hardware-accelerated smooth progressive shimmer wave */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/55 dark:via-slate-700/50 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
          delay: delayMs / 1000
        }}
      />
    </div>
  );
};

/* ==========================================================================
   2. REELS MODULE PROGRESSIVE SKELETON (Full-screen 9:16 Vertical Video)
   ========================================================================== */
export const ReelsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 select-none overflow-hidden">
      <div className="relative w-full max-w-[420px] h-screen sm:h-[92vh] sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Shimmering Full-bleed Background Video container */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/70 to-slate-950">
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
          />
        </div>

        {/* Top Header Overlay Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" />
            <div className="flex items-center gap-2">
              <Shimmer className="w-24 h-4 rounded-md" />
              <Shimmer className="w-12 h-4 rounded-full" rounded="rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" />
          </div>
        </div>

        {/* Center Play Watermark Shimmer */}
        <div className="relative z-10 flex items-center justify-center my-auto">
          <Shimmer className="w-16 h-16 rounded-full opacity-40" rounded="rounded-full" />
        </div>

        {/* Floating Right Actions Stack */}
        <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-4">
          {/* Creator Profile Avatar with Follow plus badge */}
          <div className="relative">
            <Shimmer className="w-12 h-12 rounded-full border-2 border-slate-700" rounded="rounded-full" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500/60 flex items-center justify-center text-[10px] text-white font-bold" />
          </div>

          {/* Reaction Button */}
          <div className="flex flex-col items-center gap-1">
            <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" delayMs={50} />
            <Shimmer className="w-6 h-2.5 rounded-sm" delayMs={50} />
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center gap-1">
            <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" delayMs={100} />
            <Shimmer className="w-6 h-2.5 rounded-sm" delayMs={100} />
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" delayMs={150} />
            <Shimmer className="w-6 h-2.5 rounded-sm" delayMs={150} />
          </div>

          {/* Save / Bookmark Button */}
          <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" delayMs={200} />

          {/* Audio Spinning Vinyl */}
          <Shimmer className="w-9 h-9 rounded-full border border-slate-700" rounded="rounded-full" delayMs={250} />
        </div>

        {/* Bottom Metadata & Info Overlay */}
        <div className="relative z-10 p-4 pb-6 space-y-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pr-16">
          {/* Author handle & Follow button */}
          <div className="flex items-center gap-2">
            <Shimmer className="w-28 h-4 rounded-md" />
            <Shimmer className="w-16 h-6 rounded-full" rounded="rounded-full" />
          </div>

          {/* Caption text lines */}
          <div className="space-y-1.5">
            <Shimmer className="w-4/5 h-3.5 rounded-md" delayMs={75} />
            <Shimmer className="w-3/5 h-3 rounded-md" delayMs={125} />
          </div>

          {/* Audio & Location tags */}
          <div className="flex items-center gap-2 pt-1">
            <Shimmer className="w-32 h-4 rounded-full" rounded="rounded-full" delayMs={175} />
            <Shimmer className="w-20 h-4 rounded-full" rounded="rounded-full" delayMs={225} />
          </div>
        </div>

        {/* Video Scrubber Line Skeleton */}
        <div className="relative w-full h-1 bg-slate-800">
          <div className="h-full w-1/3 bg-emerald-500/70 rounded-r-full" />
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. DISCUSSION / SOCIAL FEED MODULE PROGRESSIVE SKELETON
   ========================================================================== */
export const DiscussionSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navigation Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shimmer className="w-9 h-9 rounded-full" rounded="rounded-full" />
            <div>
              <Shimmer className="w-28 h-4 rounded-md mb-1" />
              <Shimmer className="w-16 h-3 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="w-24 h-8 rounded-xl" />
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" />
          </div>
        </div>
      </div>

      {/* 3-Column Responsive Grid Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* User Mini Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <Shimmer className="w-12 h-12 rounded-full" rounded="rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Shimmer className="w-3/4 h-4 rounded-md" />
                <Shimmer className="w-1/2 h-3 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Shimmer className="h-8 rounded-xl" />
              <Shimmer className="h-8 rounded-xl" />
            </div>
          </div>

          {/* Categories Navigation List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
            <Shimmer className="w-28 h-4 rounded-md mb-3" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                <Shimmer className="w-7 h-7 rounded-lg shrink-0" delayMs={i * 40} />
                <Shimmer className="w-3/4 h-3.5 rounded-md" delayMs={i * 40} />
              </div>
            ))}
          </div>
        </div>

        {/* Center Feed Column (Matches DiscussionPage Feed) */}
        <div className="lg:col-span-6 space-y-3.5 max-w-[680px] w-full mx-auto">
          {/* Create Post Box Card Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-full shrink-0" rounded="rounded-full" />
              <Shimmer className="flex-1 h-11 rounded-2xl" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shimmer className="w-20 h-7 rounded-xl" delayMs={50} />
                <Shimmer className="w-20 h-7 rounded-xl" delayMs={100} />
                <Shimmer className="w-16 h-7 rounded-xl hidden sm:block" delayMs={150} />
              </div>
              <Shimmer className="w-20 h-8 rounded-xl" delayMs={200} />
            </div>
          </div>

          {/* Reels & Short Videos Tray Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Shimmer className="w-6 h-6 rounded-full" rounded="rounded-full" />
                <Shimmer className="w-32 h-4 rounded-md" />
              </div>
              <Shimmer className="w-16 h-3.5 rounded-md" />
            </div>
            {/* Horizontal Reels List */}
            <div className="flex gap-2.5 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-w-[110px] w-[110px] sm:min-w-[125px] sm:w-[125px] aspect-[9/16] rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0 p-2 flex flex-col justify-between overflow-hidden"
                >
                  <Shimmer className="w-6 h-6 rounded-full" rounded="rounded-full" delayMs={i * 60} />
                  <div className="space-y-1">
                    <Shimmer className="w-4/5 h-2.5 rounded-sm" delayMs={i * 60} />
                    <Shimmer className="w-1/2 h-2 rounded-sm" delayMs={i * 60} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Filter Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2">
            <Shimmer className="flex-1 h-9 rounded-xl" />
            <Shimmer className="flex-1 h-9 rounded-xl" delayMs={50} />
            <Shimmer className="flex-1 h-9 rounded-xl" delayMs={100} />
          </div>

          {/* Post Feed Cards Stream */}
          {[1, 2].map((postIdx) => (
            <div
              key={postIdx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5"
            >
              {/* Post Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shimmer className="w-10 h-10 rounded-full shrink-0" rounded="rounded-full" delayMs={postIdx * 80} />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Shimmer className="w-28 h-4 rounded-md" delayMs={postIdx * 80} />
                      <Shimmer className="w-12 h-3.5 rounded-full" rounded="rounded-full" />
                    </div>
                    <Shimmer className="w-20 h-3 rounded-md" delayMs={postIdx * 80} />
                  </div>
                </div>
                <Shimmer className="w-6 h-6 rounded-full" rounded="rounded-full" />
              </div>

              {/* Post Content Lines */}
              <div className="space-y-1.5">
                <Shimmer className="w-full h-3.5 rounded-md" delayMs={postIdx * 90} />
                <Shimmer className="w-5/6 h-3.5 rounded-md" delayMs={postIdx * 90 + 30} />
                <Shimmer className="w-2/3 h-3 rounded-md" delayMs={postIdx * 90 + 60} />
              </div>

              {/* Post Media Container (16:9) */}
              <Shimmer className="w-full h-56 sm:h-72 rounded-2xl" delayMs={postIdx * 100} />

              {/* Engagement Reaction & Stats Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <Shimmer className="w-5 h-5 rounded-full" rounded="rounded-full" />
                  <Shimmer className="w-12 h-3 rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                  <Shimmer className="w-14 h-3 rounded-md" />
                  <Shimmer className="w-14 h-3 rounded-md" />
                </div>
              </div>

              {/* Bottom Action Buttons (Like, Comment, Share, Save) */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Shimmer className="h-9 rounded-xl" delayMs={50} />
                <Shimmer className="h-9 rounded-xl" delayMs={100} />
                <Shimmer className="h-9 rounded-xl" delayMs={150} />
                <Shimmer className="h-9 rounded-xl" delayMs={200} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* Emergency Alert Mini Banner */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-3xl p-4 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <Shimmer className="w-24 h-4 rounded-md" />
            <Shimmer className="w-full h-3 rounded-md" />
            <Shimmer className="w-3/4 h-3 rounded-md" />
          </div>

          {/* Active Citizens / Top Contributors */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <Shimmer className="w-32 h-4 rounded-md mb-2" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" delayMs={i * 50} />
                  <div className="space-y-1">
                    <Shimmer className="w-20 h-3.5 rounded-md" delayMs={i * 50} />
                    <Shimmer className="w-12 h-2.5 rounded-sm" delayMs={i * 50} />
                  </div>
                </div>
                <Shimmer className="w-14 h-6 rounded-lg" delayMs={i * 50} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. DIRECTORY & SERVICE LISTING MODULE SKELETON (Doctors, Hospitals, Markets, etc.)
   ========================================================================== */
export const DirectorySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Unified Hero Header Container Matching Exact Header Height */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg overflow-hidden space-y-5">
          {/* Top row: Back button & Action pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shimmer className="w-9 h-9 rounded-xl bg-white/20" rounded="rounded-xl" />
              <Shimmer className="w-24 h-6 rounded-full bg-white/20" rounded="rounded-full" />
            </div>
            <Shimmer className="w-28 h-8 rounded-xl bg-white/20" rounded="rounded-xl" />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2 pt-2">
            <Shimmer className="w-64 sm:w-80 h-7 sm:h-9 rounded-xl bg-white/25" />
            <Shimmer className="w-48 sm:w-60 h-4 rounded-md bg-white/20" />
          </div>

          {/* Search bar inside hero */}
          <div className="pt-2">
            <Shimmer className="w-full h-12 rounded-2xl bg-white/20 backdrop-blur-md" />
          </div>
        </div>

        {/* Filter Pills & Area Selector Row */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Shimmer className="w-20 h-9 rounded-full" rounded="rounded-full" />
            <Shimmer className="w-24 h-9 rounded-full" rounded="rounded-full" delayMs={40} />
            <Shimmer className="w-28 h-9 rounded-full" rounded="rounded-full" delayMs={80} />
            <Shimmer className="w-22 h-9 rounded-full" rounded="rounded-full" delayMs={120} />
            <Shimmer className="w-24 h-9 rounded-full hidden sm:block" rounded="rounded-full" delayMs={160} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Shimmer className="w-32 h-9 rounded-xl" delayMs={200} />
            <Shimmer className="w-9 h-9 rounded-xl" delayMs={240} />
          </div>
        </div>

        {/* Stats / Counter bar */}
        <div className="flex items-center justify-between px-1">
          <Shimmer className="w-32 h-4 rounded-md" />
          <Shimmer className="w-24 h-4 rounded-md" />
        </div>

        {/* Directory Standard 3-Column Responsive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Top media / avatar row */}
                <div className="flex gap-3.5 items-start">
                  <Shimmer className="w-20 h-20 rounded-2xl shrink-0" delayMs={i * 50} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shimmer className="w-3/4 h-4 rounded-md" delayMs={i * 50} />
                      <Shimmer className="w-5 h-5 rounded-full" rounded="rounded-full" />
                    </div>
                    <Shimmer className="w-1/2 h-3 rounded-md" delayMs={i * 50} />
                    <Shimmer className="w-2/3 h-3 rounded-md" delayMs={i * 50} />
                  </div>
                </div>

                {/* Rating & Location Tag */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Shimmer key={star} className="w-3.5 h-3.5 rounded-xs" rounded="rounded-xs" delayMs={i * 30} />
                    ))}
                  </div>
                  <Shimmer className="w-20 h-4 rounded-full" rounded="rounded-full" delayMs={i * 40} />
                </div>
              </div>

              {/* Bottom Action Buttons (Call Now + View Details) */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Shimmer className="h-9 rounded-xl" delayMs={i * 50} />
                <Shimmer className="h-9 rounded-xl" delayMs={i * 50 + 30} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. DETAIL VIEW MODULE PROGRESSIVE SKELETON (Service / Doctor / Hospital / Place Detail)
   ========================================================================== */
export const DetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-2 py-1">
          <Shimmer className="w-16 h-3.5 rounded-md" />
          <span className="text-slate-300">/</span>
          <Shimmer className="w-24 h-3.5 rounded-md" />
          <span className="text-slate-300">/</span>
          <Shimmer className="w-32 h-3.5 rounded-md" />
        </div>

        {/* Large Media Banner Cover (16:9 or 21:9) */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md">
          <Shimmer className="w-full h-full" rounded="rounded-3xl" />
          {/* Overlay Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Shimmer className="w-10 h-10 rounded-full bg-white/40" rounded="rounded-full" />
            <div className="flex items-center gap-2">
              <Shimmer className="w-10 h-10 rounded-full bg-white/40" rounded="rounded-full" />
              <Shimmer className="w-10 h-10 rounded-full bg-white/40" rounded="rounded-full" />
            </div>
          </div>
        </div>

        {/* Header Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <Shimmer className="w-48 sm:w-64 h-6 sm:h-8 rounded-xl" />
                <Shimmer className="w-6 h-6 rounded-full" rounded="rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Shimmer className="w-28 h-4 rounded-md" />
                <Shimmer className="w-20 h-5 rounded-full" rounded="rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="w-28 h-10 rounded-2xl" />
              <Shimmer className="w-28 h-10 rounded-2xl" delayMs={50} />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <Shimmer className="w-16 h-3 rounded-md" delayMs={i * 40} />
                <Shimmer className="w-24 h-4 rounded-md" delayMs={i * 40} />
              </div>
            ))}
          </div>
        </div>

        {/* Tab Switcher Strip */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <Shimmer className="w-24 h-9 rounded-xl" />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={50} />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={100} />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={150} />
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview / Description Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <Shimmer className="w-32 h-5 rounded-md mb-2" />
              <Shimmer className="w-full h-3.5 rounded-md" />
              <Shimmer className="w-full h-3.5 rounded-md" delayMs={40} />
              <Shimmer className="w-4/5 h-3.5 rounded-md" delayMs={80} />
              <Shimmer className="w-2/3 h-3.5 rounded-md" delayMs={120} />
            </div>

            {/* Services / Feature List Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <Shimmer className="w-36 h-5 rounded-md mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <Shimmer className="w-8 h-8 rounded-xl shrink-0" delayMs={i * 40} />
                    <div className="flex-1 space-y-1">
                      <Shimmer className="w-3/4 h-3.5 rounded-md" delayMs={i * 40} />
                      <Shimmer className="w-1/2 h-2.5 rounded-sm" delayMs={i * 40} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Map Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <Shimmer className="w-28 h-5 rounded-md" />
              <Shimmer className="w-full h-48 rounded-2xl" delayMs={100} />
            </div>
          </div>

          {/* Right Sticky Sidebar (Contact, Timings, CTA) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 sticky top-20">
              <Shimmer className="w-32 h-5 rounded-md" />
              <Shimmer className="w-full h-12 rounded-2xl bg-emerald-600/30" />
              <Shimmer className="w-full h-11 rounded-2xl" delayMs={50} />
              <Shimmer className="w-full h-11 rounded-2xl" delayMs={100} />
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Shimmer className="w-full h-4 rounded-md" />
                <Shimmer className="w-3/4 h-4 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   6. PROFILE & USER DASHBOARD MODULE SKELETON
   ========================================================================== */
export const ProfileDashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-6">
        {/* Profile Banner & Avatar */}
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden pb-6">
          {/* Cover Photo */}
          <Shimmer className="w-full h-40 sm:h-52" rounded="rounded-none" />

          {/* Avatar & User Details */}
          <div className="px-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Shimmer
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 shadow-md shrink-0"
                rounded="rounded-full"
              />
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                  <Shimmer className="w-40 sm:w-52 h-6 rounded-xl" />
                  <Shimmer className="w-5 h-5 rounded-full" rounded="rounded-full" />
                </div>
                <Shimmer className="w-28 h-3.5 rounded-md" />
                <div className="flex items-center gap-2 pt-1">
                  <Shimmer className="w-20 h-5 rounded-full" rounded="rounded-full" />
                  <Shimmer className="w-24 h-5 rounded-full" rounded="rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shimmer className="w-28 h-10 rounded-2xl" />
              <Shimmer className="w-10 h-10 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 4-Card Stats Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <Shimmer className="w-16 h-3 rounded-md" delayMs={i * 40} />
                <Shimmer className="w-7 h-7 rounded-lg" delayMs={i * 40} />
              </div>
              <Shimmer className="w-12 h-6 rounded-lg" delayMs={i * 40} />
            </div>
          ))}
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Shimmer className="w-24 h-9 rounded-xl" />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={40} />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={80} />
          <Shimmer className="w-24 h-9 rounded-xl" delayMs={120} />
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <Shimmer className="w-full h-32 rounded-xl" delayMs={i * 40} />
              <Shimmer className="w-3/4 h-4 rounded-md" delayMs={i * 40} />
              <Shimmer className="w-1/2 h-3 rounded-md" delayMs={i * 40} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   7. FORM & DIGITAL SERVICE MODULE SKELETON (NID, Passport, Registration, etc.)
   ========================================================================== */
export const FormServiceSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Service Emblem & Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-3">
          <Shimmer className="w-16 h-16 rounded-full mx-auto" rounded="rounded-full" />
          <Shimmer className="w-56 h-6 rounded-xl mx-auto" />
          <Shimmer className="w-80 max-w-full h-3.5 rounded-md mx-auto" />

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" />
            <Shimmer className="flex-1 h-1 rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" delayMs={50} />
            <Shimmer className="flex-1 h-1 rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" rounded="rounded-full" delayMs={100} />
          </div>
        </div>

        {/* Form Fields Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <Shimmer className="w-36 h-5 rounded-md" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <Shimmer className="w-24 h-3.5 rounded-md" delayMs={i * 30} />
                <Shimmer className="w-full h-11 rounded-xl" delayMs={i * 30} />
              </div>
            ))}
          </div>

          {/* File Upload Dropzone */}
          <div className="space-y-1.5 pt-2">
            <Shimmer className="w-28 h-3.5 rounded-md" />
            <Shimmer className="w-full h-32 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Shimmer className="w-24 h-10 rounded-xl" />
            <Shimmer className="w-36 h-10 rounded-xl bg-emerald-600/40" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   8. MEDIA GALLERY SKELETON
   ========================================================================== */
export const MediaGallerySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <Shimmer className="w-48 h-7 rounded-xl" />
          <Shimmer className="w-64 h-4 rounded-md" />
          <div className="flex gap-2 pt-2 overflow-hidden">
            <Shimmer className="w-24 h-8 rounded-full" rounded="rounded-full" />
            <Shimmer className="w-28 h-8 rounded-full" rounded="rounded-full" delayMs={40} />
            <Shimmer className="w-20 h-8 rounded-full" rounded="rounded-full" delayMs={80} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xs space-y-2 p-2"
            >
              <Shimmer className="w-full aspect-[4/3] rounded-xl" delayMs={i * 30} />
              <Shimmer className="w-3/4 h-3.5 rounded-md" delayMs={i * 30} />
              <Shimmer className="w-1/2 h-2.5 rounded-sm" delayMs={i * 30} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   9. COMPONENT-LEVEL SECTION SKELETONS (FOR IN-PAGE LAZY SECTIONS)
   ========================================================================== */

/** 4-Column x 2-Row Services Grid Skeleton */
export const ServicesGridSkeleton: React.FC = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-3">
    <div className="flex items-center justify-between px-1">
      <Shimmer className="w-32 h-5 rounded-md" />
      <Shimmer className="w-16 h-3.5 rounded-md" />
    </div>
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col items-center gap-2 text-center"
        >
          <Shimmer className="w-12 h-12 rounded-2xl" delayMs={idx * 30} />
          <Shimmer className="w-14 h-3 rounded-md" delayMs={idx * 30} />
        </div>
      ))}
    </div>
  </div>
);

/** Blood Donation Section Skeleton */
export const BloodDonationSectionSkeleton: React.FC = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-4">
    <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-5 sm:p-6 border border-rose-100 dark:border-rose-900/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shimmer className="w-8 h-8 rounded-full bg-rose-200" rounded="rounded-full" />
          <Shimmer className="w-36 h-5 rounded-md bg-rose-200/80" />
        </div>
        <Shimmer className="w-24 h-7 rounded-xl bg-rose-200/80" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-rose-50 dark:border-rose-950 space-y-2">
            <Shimmer className="w-10 h-10 rounded-full" rounded="rounded-full" delayMs={i * 40} />
            <Shimmer className="w-20 h-4 rounded-md" delayMs={i * 40} />
            <Shimmer className="w-14 h-3 rounded-md" delayMs={i * 40} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** Communication Hub Section Skeleton */
export const CommunicationHubSectionSkeleton: React.FC = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-3">
    <div className="flex items-center justify-between px-1">
      <Shimmer className="w-36 h-5 rounded-md" />
      <Shimmer className="w-16 h-3.5 rounded-md" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-xl" delayMs={i * 50} />
            <div className="space-y-1 flex-1">
              <Shimmer className="w-3/4 h-4 rounded-md" delayMs={i * 50} />
              <Shimmer className="w-1/2 h-3 rounded-md" delayMs={i * 50} />
            </div>
          </div>
          <Shimmer className="w-full h-12 rounded-xl" delayMs={i * 50} />
        </div>
      ))}
    </div>
  </div>
);

/** Advertisement Section Skeleton */
export const AdvertisementSectionSkeleton: React.FC = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-4">
    <div className="w-full h-32 sm:h-40 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden relative">
      <Shimmer className="w-full h-full" rounded="rounded-3xl" />
    </div>
  </div>
);

/* ==========================================================================
   10. MAIN DYNAMIC ROUTE-AWARE PROGRESSIVE MODULE SKELETON
   ========================================================================== */
export const ProgressiveModuleSkeleton: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // 1. Match Reels
  if (path === '/reels' || path.startsWith('/reels/')) {
    return <ReelsSkeleton />;
  }

  // 2. Match Discussion / Social Feed / Community Board
  if (
    path === '/discussion' ||
    path === '/community-board' ||
    path === '/local-discussion' ||
    path === '/feed'
  ) {
    return <DiscussionSkeleton />;
  }

  // 3. Match Detail pages (URLs with nested slug or ID)
  if (
    /^\/service\/[^/]+\/[^/]+$/.test(path) ||
    /^\/doctors\/[^/]+$/.test(path) ||
    /^\/hospitals\/[^/]+$/.test(path) ||
    /^\/tourism\/[^/]+$/.test(path) ||
    /^\/mistri\/[^/]+$/.test(path) ||
    /^\/mistris\/[^/]+$/.test(path) ||
    /^\/lawyers\/[^/]+$/.test(path) ||
    /^\/lawyer\/[^/]+$/.test(path) ||
    /^\/trains\/[^/]+$/.test(path) ||
    /^\/railway-stations\/[^/]+$/.test(path) ||
    /^\/fire-services\/[^/]+$/.test(path) ||
    /^\/police\/[^/]+$/.test(path) ||
    /^\/bus-stands\/[^/]+$/.test(path) ||
    /^\/photo-gallery\/[^/]+$/.test(path) ||
    /^\/important-places\/[^/]+$/.test(path) ||
    /^\/union\/[^/]+$/.test(path) ||
    /^\/profile\/[^/]+$/.test(path) && path.includes('/edit')
  ) {
    return <DetailSkeleton />;
  }

  // 4. Match User Profile & Dashboards
  if (
    path.startsWith('/profile') ||
    path === '/my-business' ||
    path === '/business/dashboard' ||
    path === '/advertiser-dashboard' ||
    path === '/user-privileges' ||
    path === '/my-applications' ||
    path === '/my-downloads' ||
    path === '/my-bookmarks' ||
    path === '/my-complaints' ||
    path === '/my-reviews' ||
    path === '/favorites' ||
    path === '/notifications' ||
    path === '/settings' ||
    path.startsWith('/admin')
  ) {
    return <ProfileDashboardSkeleton />;
  }

  // 5. Match Forms, Government Services & Utilities
  if (
    path.startsWith('/services/') ||
    path.startsWith('/downloads') ||
    path === '/tools' ||
    path === '/vote-assistant' ||
    path === '/voter-info' ||
    path === '/complaint' ||
    path === '/smart-reminder' ||
    path === '/reminder' ||
    path === '/e-document-vault' ||
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password'
  ) {
    return <FormServiceSkeleton />;
  }

  // 6. Match Media Galleries
  if (
    path === '/photo-gallery' ||
    path === '/video-gallery' ||
    path === '/media-gallery'
  ) {
    return <MediaGallerySkeleton />;
  }

  // 7. Match Standard Directory Listing Pages
  // (Doctors, Hospitals, Emergency, Education, Business, Agriculture, Marketplace, Restaurants, Courier, Lawyers, etc.)
  return <DirectorySkeleton />;
};

export default ProgressiveModuleSkeleton;

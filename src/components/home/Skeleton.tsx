import React from "react";
import { motion } from "motion/react";
export {
  ProgressiveModuleSkeleton,
  ReelsSkeleton,
  DiscussionSkeleton,
  DirectorySkeleton,
  DetailSkeleton,
  ProfileDashboardSkeleton,
  FormServiceSkeleton,
  MediaGallerySkeleton,
  ServicesGridSkeleton,
  BloodDonationSectionSkeleton,
  CommunicationHubSectionSkeleton,
  AdvertisementSectionSkeleton,
  Shimmer
} from "../common/ProgressiveModuleSkeleton";

interface SkeletonProps {
  className?: string;
  delayMs?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, delayMs = 0 }) => {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 rounded-[16px] ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-700/50 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delayMs / 1000
        }}
      />
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3.5">
    <Skeleton className="w-full h-36 rounded-2xl" />
    <Skeleton className="w-3/4 h-4 rounded-md" />
    <Skeleton className="w-1/2 h-3 rounded-md" />
    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
      <Skeleton className="w-1/3 h-6 rounded-lg" />
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="flex flex-col gap-3 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 flex items-center gap-3.5"
      >
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" delayMs={i * 40} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="w-2/3 h-4 rounded-md" delayMs={i * 40} />
          <Skeleton className="w-1/2 h-3 rounded-md" delayMs={i * 40} />
        </div>
        <Skeleton className="w-6 h-6 rounded-md shrink-0" delayMs={i * 40} />
      </div>
    ))}
  </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-32 h-4 rounded-md" />
          <Skeleton className="w-20 h-3 rounded-md" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </div>

    {/* Banner / Hero Skeleton */}
    <Skeleton className="w-full h-44 sm:h-56 rounded-3xl" />

    {/* Search bar Skeleton */}
    <Skeleton className="w-full h-12 rounded-2xl" />

    {/* Filter / Tabs Skeleton */}
    <div className="flex gap-2 overflow-hidden">
      <Skeleton className="w-24 h-9 rounded-full shrink-0" />
      <Skeleton className="w-28 h-9 rounded-full shrink-0" />
      <Skeleton className="w-20 h-9 rounded-full shrink-0" />
      <Skeleton className="w-24 h-9 rounded-full shrink-0" />
    </div>

    {/* Content Cards Grid Skeleton */}
    <GridSkeleton count={6} />
  </div>
);

export default Skeleton;

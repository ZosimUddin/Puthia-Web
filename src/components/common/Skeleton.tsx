import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", count = 1 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`bg-slate-200 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm overflow-hidden space-y-4">
    <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
    <div className="space-y-3 px-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-24 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100">
        <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

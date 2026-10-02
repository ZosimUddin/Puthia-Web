import React from 'react';

export const GlobalSkeletonLoader: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/80 shadow-xs relative overflow-hidden space-y-3.5"
        >
          {/* Shimmer animated gradient overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-slate-100/70 to-transparent pointer-events-none" />

          <div className="flex gap-3.5 items-start">
            {/* Thumbnail Skeleton */}
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-slate-100 shrink-0 border border-slate-50 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-slate-200/70" />
            </div>

            {/* Content Lines */}
            <div className="flex-1 min-w-0 space-y-2.5 pt-0.5">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-slate-200 rounded-md w-3/5" />
                <div className="h-3.5 bg-emerald-100/60 rounded-full w-14 hidden sm:block" />
              </div>
              <div className="h-3 bg-slate-100 rounded-md w-2/5" />
              <div className="h-3 bg-slate-100 rounded-md w-4/5" />
              <div className="h-2.5 bg-slate-100/80 rounded-md w-1/3" />
            </div>

            {/* Right micro badge skeleton */}
            <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
              <div className="h-3.5 bg-amber-100/60 rounded-md w-10" />
              <div className="h-3 bg-slate-100 rounded-md w-16" />
            </div>
          </div>

          {/* Bottom Action Row Buttons Skeleton */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100">
            <div className="h-9 bg-slate-100 rounded-xl" />
            <div className="h-9 bg-slate-100 rounded-xl" />
            <div className="h-9 bg-slate-200/70 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

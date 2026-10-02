import React from 'react';
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl ${className}`}>
      {/* Moving Shimmer Bar */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
      />
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2.5 shadow-2xs">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title = "কোনো তথ্য পাওয়া যায়নি",
  description = "দুঃখিত, আপনার কাঙ্ক্ষিত তথ্যটি এই মুহূর্তে উপলব্ধ নেই।",
  icon,
  actionText,
  onAction
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl my-4 shadow-2xs"
    >
      <motion.div 
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/40 shadow-inner"
      >
        {icon || <Inbox className="w-8 h-8" />}
      </motion.div>
      
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};


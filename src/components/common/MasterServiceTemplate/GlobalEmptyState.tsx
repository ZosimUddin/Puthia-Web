import React from 'react';
import { Plus, Award } from 'lucide-react';

interface GlobalEmptyStateProps {
  title?: string;
  message?: string;
  onAddClick?: () => void;
}

export const GlobalEmptyState: React.FC<GlobalEmptyStateProps> = ({
  title = 'এখনও কোনো তথ্য পাওয়া যায়নি',
  message = 'আপনি প্রথম তথ্যটি যোগ করে এই সেবা ডিরেক্টরি সমৃদ্ধ করতে পারেন।',
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 my-4 shadow-sm space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
        📂
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-slate-800">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </div>

      {/* Reward Incentive Notice */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-center gap-2 text-amber-800 text-xs font-bold max-w-sm mx-auto shadow-2xs">
        <Award size={16} className="text-amber-600 shrink-0" />
        <span>সঠিক তথ্য জমা দিলে এডমিন অনুমোদনের পর আপনি পাবেন <strong className="text-amber-900 font-black">+৫ স্টার</strong>!</span>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="py-2.5 px-5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-md border-none cursor-pointer transition-all active:scale-95"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>তথ্য যোগ করুন</span>
          </button>
        )}
      </div>
    </div>
  );
};

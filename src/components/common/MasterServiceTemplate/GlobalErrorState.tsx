import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface GlobalErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const GlobalErrorState: React.FC<GlobalErrorStateProps> = ({
  message = 'তথ্য লোড করা সম্ভব হয়নি',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50/70 rounded-3xl p-8 text-center border border-rose-100 my-4 shadow-sm space-y-3 max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black text-rose-900">{message}</h3>
        <p className="text-xs text-rose-600 font-medium">
          দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 border-none cursor-pointer shadow-xs transition-all active:scale-95"
        >
          <RotateCcw size={14} />
          <span>আবার চেষ্টা করুন</span>
        </button>
      )}
    </div>
  );
};

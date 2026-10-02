import React from 'react';
import { X, BarChart2, Eye, Users, Heart, MessageCircle, Share2, Bookmark, Clock, CheckCircle } from 'lucide-react';
import { Reel } from '../../../types';
import { reelService } from '../../../services/reelService';

interface ReelAnalyticsModalProps {
  reel: Reel;
  isOpen: boolean;
  onClose: () => void;
}

export const ReelAnalyticsModal: React.FC<ReelAnalyticsModalProps> = ({
  reel,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const stats = reelService.getReelAnalytics(reel);

  const toBengaliNumber = (num: number = 0) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d)]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base">রিল অ্যানালিটিক্স</h3>
              <p className="text-[10px] text-slate-400">রিয়েল-টাইম পারফরম্যান্স ইনসাইট</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">মোট ভিউ</span>
              <Eye size={16} className="text-blue-400" />
            </div>
            <span className="text-2xl font-black text-white">
              {toBengaliNumber(stats.viewsCount)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">ভিউয়ার্স: {toBengaliNumber(stats.uniqueViewers)} জন</span>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">সম্পূর্ণ দেখার হার</span>
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400">
              {toBengaliNumber(stats.completionRate)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-1">গড় সময়: {toBengaliNumber(stats.averageWatchTime)} সেকেন্ড</span>
          </div>
        </div>

        {/* Engagement Grid */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
          <h4 className="text-xs font-black text-slate-300 mb-3 uppercase tracking-wider">এনগেজমেন্ট বিবরণ</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <Heart size={16} className="mx-auto mb-1 text-rose-500" />
              <span className="text-xs font-black block">{toBengaliNumber(stats.reactionsCount)}</span>
              <span className="text-[9px] text-slate-400">রিঅ্যাক্ট</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <MessageCircle size={16} className="mx-auto mb-1 text-blue-400" />
              <span className="text-xs font-black block">{toBengaliNumber(stats.commentsCount)}</span>
              <span className="text-[9px] text-slate-400">মন্তব্য</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <Share2 size={16} className="mx-auto mb-1 text-purple-400" />
              <span className="text-xs font-black block">{toBengaliNumber(stats.sharesCount)}</span>
              <span className="text-[9px] text-slate-400">শেয়ার</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <Bookmark size={16} className="mx-auto mb-1 text-amber-400" />
              <span className="text-xs font-black block">{toBengaliNumber(stats.savesCount)}</span>
              <span className="text-[9px] text-slate-400">সেভ</span>
            </div>
          </div>
        </div>

        {/* Audience / Discovery Sources */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <h4 className="text-xs font-black text-slate-300 mb-3 uppercase tracking-wider">ট্রাফিক সোর্স</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1 text-slate-300">
                <span>রিলস ফিড</span>
                <span>৪৫%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1 text-slate-300">
                <span>এক্সপ্লোর ও ট্রেন্ডিং</span>
                <span>৩০%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-[30%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1 text-slate-300">
                <span>প্রোফাইল থেকে</span>
                <span>২৫%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[25%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

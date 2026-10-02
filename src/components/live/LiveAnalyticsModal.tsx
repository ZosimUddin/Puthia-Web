import React from 'react';
import { BarChart3, Users, Heart, MessageSquare, Share2, Clock, Eye, CheckCircle2, Award } from 'lucide-react';
import { LiveStream } from '../../types/live';

interface LiveAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: LiveStream;
}

export const LiveAnalyticsModal: React.FC<LiveAnalyticsModalProps> = ({
  isOpen,
  onClose,
  stream,
}) => {
  if (!isOpen) return null;

  const durationMs = (stream.endedAt || Date.now()) - (stream.startedAt || stream.createdAt);
  const durationMins = Math.max(1, Math.round(durationMs / 60000));
  const avgWatchMins = Math.max(0.5, (durationMins * 0.65)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md text-white shadow-2xl p-5 sm:p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-1">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-extrabold text-lg text-white">লাইভ সফলভাবে সম্পন্ন হয়েছে!</h3>
          <p className="text-xs text-slate-400 line-clamp-1">{stream.title}</p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <Eye size={20} className="text-blue-400 mb-1" />
            <span className="text-lg font-black text-white">{stream.peakViewerCount || stream.viewerCount || 1}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">সর্বোচ্চ ভিউয়ার্স</span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <Heart size={20} className="text-red-400 mb-1" />
            <span className="text-lg font-black text-white">{stream.totalReactions || 0}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট রিঅ্যাকশন</span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <MessageSquare size={20} className="text-emerald-400 mb-1" />
            <span className="text-lg font-black text-white">{stream.totalComments || 0}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট কমেন্টস</span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <Share2 size={20} className="text-amber-400 mb-1" />
            <span className="text-lg font-black text-white">{stream.totalShares || 0}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">মোট শেয়ার</span>
          </div>
        </div>

        {/* Duration & Watch Time Bar */}
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-400" /> মোট লাইভ সময়:</span>
            <span className="font-extrabold text-white">{durationMins} মিনিট</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5"><Award size={14} className="text-amber-400" /> গড় ওয়াচ টাইম:</span>
            <span className="font-extrabold text-emerald-300">{avgWatchMins} মিনিট</span>
          </div>
        </div>

        {/* Replay Saved Badge */}
        <div className="text-center text-[11px] text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 font-medium">
          🎥 এই লাইভের Replay সংরক্ষিত হয়েছে। দর্শকরা রিপ্লে দেখতে পারবেন।
        </div>

        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl transition-all cursor-pointer shadow-lg active:scale-98"
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      </div>
    </div>
  );
};

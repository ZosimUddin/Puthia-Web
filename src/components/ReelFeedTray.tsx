import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Video, Play, Eye, Flame, ChevronRight } from 'lucide-react';
import { Reel } from '../types';
import { reelService } from '../services/reelService';
import { useAuth } from '../contexts/AuthContext';

export const ReelFeedTray: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = reelService.subscribeToReels(user?.uid, (fetchedReels) => {
      setReels(fetchedReels.slice(0, 10));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-100 shadow-sm space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Video size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>রিলস ও শর্ট ভিডিও</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">
                Reels
              </span>
            </h4>
          </div>
        </div>

        <button
          onClick={() => navigate('/reels')}
          className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer border-0 bg-transparent"
        >
          <span>সব দেখুন</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scrolling Card List */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {/* 1. Create Reel Action Card */}
        <div
          onClick={() => navigate('/reels')}
          className="relative min-w-[110px] w-[110px] sm:min-w-[125px] sm:w-[125px] aspect-[9/16] rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden flex flex-col justify-between p-2.5 cursor-pointer shrink-0 border border-slate-700 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
        >
          {/* User Photo background or Avatar */}
          <div className="relative w-full h-20 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
            {(userProfile?.photoURL || user?.photoURL) ? (
              <img 
                src={userProfile?.photoURL || user?.photoURL || undefined} 
                alt="Me" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-black text-sm">
                {(userProfile?.name || user?.displayName || 'U').charAt(0)}
              </div>
            )}
            
            {/* Plus Icon Overlay */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
          </div>

          <div className="text-center pt-3 pb-1">
            <span className="text-[11px] font-black text-white leading-tight block">
              রিল তৈরি করুন
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              শর্ট ভিডিও
            </span>
          </div>
        </div>

        {/* 2. Live Reels from Firestore */}
        {reels.map((reel) => (
          <div
            key={reel.id}
            onClick={() => navigate(`/reels?id=${reel.id}`)}
            className="relative min-w-[110px] w-[110px] sm:min-w-[125px] sm:w-[125px] aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer shrink-0 shadow-sm hover:shadow-lg transition-all group border border-slate-200"
          >
            <img
              src={reel.thumbnailUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"}
              alt={reel.caption || "Reel"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-900"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

            {/* Creator Avatar & Name */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full border border-emerald-400 overflow-hidden bg-slate-800 shadow">
                {reel.authorAvatar ? (
                  <img src={reel.authorAvatar} alt={reel.authorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                    {reel.authorName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-emerald-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                <Play size={16} className="ml-0.5 fill-white" />
              </div>
            </div>

            {/* Bottom Caption & Views */}
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <p className="text-[10px] font-bold truncate mb-0.5 text-white/95">
                {reel.caption || `@${reel.authorUsername || reel.authorName}`}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-300">
                <Eye size={10} className="text-emerald-400" />
                <span>{reel.viewsCount || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Play, Pause, Music, Check, Sparkles, Volume2 } from 'lucide-react';
import { ReelAudio } from '../../../types';
import { reelService } from '../../../services/reelService';

interface MusicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudio: (audio: ReelAudio | null) => void;
  selectedAudioId?: string;
}

export const MusicLibraryModal: React.FC<MusicLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectAudio,
  selectedAudioId
}) => {
  const [tracks, setTracks] = useState<ReelAudio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingTrackId(null);
      return;
    }
    reelService.getAudioTracks().then((data) => {
      setTracks(data);
    });
  }, [isOpen]);

  const handleTogglePlay = (track: ReelAudio) => {
    if (playingTrackId === track.id) {
      audioPlayerRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = track.audioUrl;
        audioPlayerRef.current.play().catch(e => console.warn("Audio play prevented:", e));
      }
      setPlayingTrackId(track.id);
    }
  };

  const categories = [
    { id: 'all', label: 'সব অডিও' },
    { id: 'popular', label: 'জনপ্রিয়' },
    { id: 'trending', label: 'ট্রেন্ডিং' },
    { id: 'folk', label: 'লোকগীতি' },
    { id: 'ambient', label: 'প্রকৃতি' },
    { id: 'islamic', label: 'ইসলামিক' }
  ];

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <audio ref={audioPlayerRef} onEnded={() => setPlayingTrackId(null)} />
      <div 
        className="w-full sm:max-w-md bg-slate-900 text-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] h-[580px] flex flex-col shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Music size={20} className="text-emerald-400" />
            <h3 className="font-extrabold text-base">মিউজিক ও অডিও লাইব্রেরি</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="গান বা শিল্পীর নাম দিয়ে খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 rounded-2xl text-xs text-white placeholder:text-slate-400 outline-none border border-white/5 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-0 ${
                  activeCategory === cat.id 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Tracks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Option for Original Sound */}
          <div 
            onClick={() => {
              onSelectAudio(null);
              onClose();
            }}
            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-colors ${
              !selectedAudioId ? 'bg-emerald-950/60 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-white/10">
                <Volume2 size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">অরিজিনাল ভিডিও অডিও</h4>
                <p className="text-[10px] text-slate-400">ভিডিওর নিজস্ব মূল শব্দ ব্যবহার করুন</p>
              </div>
            </div>
            {!selectedAudioId && <Check size={18} className="text-emerald-400" />}
          </div>

          {filteredTracks.map((track) => {
            const isPlaying = playingTrackId === track.id;
            const isSelected = selectedAudioId === track.id;

            return (
              <div 
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isSelected ? 'bg-emerald-950/60 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 group border border-white/10">
                    <img src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'} alt={track.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleTogglePlay(track)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer border-0"
                    >
                      {isPlaying ? <Pause size={18} className="text-emerald-400" /> : <Play size={18} className="ml-0.5" />}
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-white truncate">{track.title}</h4>
                      {track.isTrending && (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 text-[9px] font-black rounded-md flex items-center gap-0.5 shrink-0">
                          <Sparkles size={10} /> ট্রেন্ডিং
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist} · {track.duration} সে.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      onSelectAudio(track);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-0 ${
                      isSelected 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white/10 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isSelected ? 'যুক্ত আছে' : 'যোগ করুন'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

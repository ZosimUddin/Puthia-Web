import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Calendar, 
  Film, 
  UserCheck, 
  Plus, 
  Search, 
  Eye, 
  Heart, 
  MessageSquare, 
  Clock, 
  Bell, 
  BellRing, 
  MapPin, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  LiveStream, 
  LiveStreamStatus, 
  LIVE_CATEGORIES 
} from '../../types/live';
import { liveService } from '../../services/liveService';
import { LiveSetupModal } from './LiveSetupModal';
import { ScheduleLiveModal } from './ScheduleLiveModal';

interface LiveHomeViewProps {
  currentUser?: any;
  userProfile?: any;
  onSelectStream: (streamId: string) => void;
}

export const LiveHomeView: React.FC<LiveHomeViewProps> = ({
  currentUser,
  userProfile,
  onSelectStream,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled' | 'replays' | 'mine'>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  
  // Modals
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Subscribe to streams based on active tab and category
  useEffect(() => {
    let statusFilter: LiveStreamStatus | 'all' | 'replays' = 'live';
    if (activeTab === 'scheduled') statusFilter = 'scheduled';
    if (activeTab === 'replays') statusFilter = 'replays';
    if (activeTab === 'mine') statusFilter = 'all';

    const unsub = liveService.listenLiveStreams(statusFilter, selectedCategory, (list) => {
      let filtered = list;
      if (activeTab === 'mine' && currentUser?.uid) {
        filtered = list.filter(s => s.hostUid === currentUser.uid);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(s => 
          s.title.toLowerCase().includes(q) || 
          s.hostName.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q)
        );
      }
      setStreams(filtered);
    });

    return () => unsub();
  }, [activeTab, selectedCategory, searchQuery, currentUser?.uid]);

  const handleStartLive = async (data: any) => {
    if (!currentUser?.uid) return;
    const streamId = await liveService.createLiveStream({
      hostUid: currentUser.uid,
      hostName: userProfile?.fullName || currentUser.displayName || 'নাগরিক',
      hostAvatar: userProfile?.photoURL || currentUser.photoURL,
      hostVerified: userProfile?.isVerified || false,
      hostUnion: userProfile?.unionId || 'পুঠিয়া',
      title: data.title,
      description: data.description,
      coverUrl: data.coverUrl,
      category: data.category,
      audience: data.audience,
      location: data.location,
    });
    onSelectStream(streamId);
  };

  const handleScheduleLive = async (data: any) => {
    if (!currentUser?.uid) return;
    await liveService.scheduleLiveStream({
      hostUid: currentUser.uid,
      hostName: userProfile?.fullName || currentUser.displayName || 'নাগরিক',
      hostAvatar: userProfile?.photoURL || currentUser.photoURL,
      hostVerified: userProfile?.isVerified || false,
      hostUnion: userProfile?.unionId || 'পুঠিয়া',
      title: data.title,
      description: data.description,
      coverUrl: data.coverUrl,
      category: data.category,
      audience: data.audience,
      location: data.location,
      scheduledFor: data.scheduledFor,
    });
    setActiveTab('scheduled');
  };

  const handleToggleNotify = async (streamId: string) => {
    if (!currentUser?.uid) return;
    await liveService.toggleInterested(streamId, currentUser.uid);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      
      {/* Top Banner & Launch Actions */}
      <div className="bg-gradient-to-r from-red-900 via-slate-900 to-emerald-950 p-4 sm:p-6 rounded-3xl text-white border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Radio size={140} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600 rounded-full animate-ping" />
              <h2 className="font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                🔴 আড্ডা লাইভ (Live Video)
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              পুঠিয়ার যেকোনো খবর, অনুষ্ঠান ও সামাজিক আলোচনা সরাসরি সম্প্রচার করুন
            </p>
          </div>

          {/* Action Launch Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsGoLiveOpen(true)}
              className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Radio size={16} className="animate-pulse" /> 🔴 Go Live
            </button>

            <button
              onClick={() => setIsScheduleOpen(true)}
              className="flex-1 sm:flex-initial bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-3 rounded-2xl transition-all border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar size={15} /> শিডিউল
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-10">
          <input
            type="text"
            placeholder="লাইভ ভিডিও বা হোস্ট খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/15 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Radio size={14} className={activeTab === 'live' ? 'animate-pulse' : ''} />
            🔴 Live Now
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'scheduled'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar size={14} /> Upcoming Live
          </button>

          <button
            onClick={() => setActiveTab('replays')}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'replays'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Film size={14} /> Live Videos (Replays)
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'mine'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck size={14} /> Your Live Videos
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          সব ক্যাটাগরি
        </button>

        {LIVE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span>{cat.icon}</span> {cat.nameBangla.split(' ')[1] || cat.nameBangla}
          </button>
        ))}
      </div>

      {/* Streams Grid */}
      {streams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Radio size={32} />
          </div>
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
            {activeTab === 'live' && 'বর্তমানে কোনো লাইভ চলমান নেই'}
            {activeTab === 'scheduled' && 'কোনো আগাম শিডিউল করা লাইভ নেই'}
            {activeTab === 'replays' && 'কোনো রি-প্লে ভিডিও পাওয়া যায়নি'}
            {activeTab === 'mine' && 'আপনার কোনো ব্রডকাস্ট বা শিডিউল নেই'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনি নিজেই প্রথম লাইভ শুরু করতে পারেন অথবা একটি আগামী লাইভ শিডিউল করতে পারেন।
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsGoLiveOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-lg cursor-pointer"
            >
              🔴 Go Live Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map(stream => {
            const isInterested = currentUser?.uid ? stream.interestedUserIds?.includes(currentUser.uid) : false;

            return (
              <div
                key={stream.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
              >
                {/* Card Thumbnail Box */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onSelectStream(stream.id)}>
                  {stream.coverUrl ? (
                    <img
                      src={stream.coverUrl}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-950 p-4 text-center">
                      <img
                        src={stream.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.hostUid}`}
                        alt={stream.hostName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400"
                      />
                    </div>
                  )}

                  {/* Overlaid Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    {stream.status === 'live' && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                      </span>
                    )}

                    {stream.status === 'scheduled' && (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Calendar size={10} /> UPCOMING
                      </span>
                    )}

                    {stream.status === 'ended' && (
                      <span className="bg-slate-800/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                        🎥 REPLAY
                      </span>
                    )}
                  </div>

                  {/* Viewers Badge */}
                  {stream.status === 'live' && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Eye size={12} className="text-emerald-400" />
                      {stream.viewerCount || 1} watching
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Host Profile Bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={stream.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.hostUid}`}
                        alt={stream.hostName}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-500/50"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                          {stream.hostName} {stream.hostVerified && <ShieldCheck size={12} className="text-emerald-500 fill-emerald-500" />}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                          <MapPin size={10} className="text-emerald-500" /> {stream.location || 'পুঠিয়া'}
                        </p>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectStream(stream.id)}
                      className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {stream.title}
                    </h3>
                  </div>

                  {/* Stats or Scheduled Date */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    {stream.status === 'scheduled' ? (
                      <div className="text-emerald-600 font-extrabold flex items-center gap-1 text-[11px]">
                        <Clock size={12} />
                        {stream.scheduledFor ? new Date(stream.scheduledFor).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'শীঘ্রই'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">❤️ {stream.totalReactions || 0}</span>
                        <span className="flex items-center gap-1">💬 {stream.totalComments || 0}</span>
                      </div>
                    )}

                    {/* Button Action */}
                    {stream.status === 'scheduled' ? (
                      <button
                        onClick={() => handleToggleNotify(stream.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                          isInterested
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isInterested ? <BellRing size={12} /> : <Bell size={12} />}
                        {isInterested ? 'স্মারক সেটেড' : 'Notify Me'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectStream(stream.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-xl text-[10px] cursor-pointer shadow-sm"
                      >
                        {stream.status === 'live' ? 'সরাসরি দেখুন 🔴' : 'প্লে করুন 🎥'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Go Live Setup Modal */}
      <LiveSetupModal
        isOpen={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onStartLive={handleStartLive}
        currentUser={currentUser}
      />

      {/* Schedule Live Modal */}
      <ScheduleLiveModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduleLive={handleScheduleLive}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, User, FileText, Users, Hash, Clapperboard, 
  Calendar, ShoppingBag, Image as ImageIcon, Video as VideoIcon, 
  MapPin, Clock, Filter, CheckCircle2, ChevronRight, Share2, 
  ThumbsUp, MessageSquare, ExternalLink, Sparkles, Flame, 
  UserPlus, UserCheck, Shield, Heart, Eye, ArrowLeft, X,
  RotateCcw, SlidersHorizontal, Tag, Phone, MessageCircle, Play
} from 'lucide-react';
import { 
  AddaSearchCategory, 
  AddaSearchFilters, 
  AddaFullSearchResults,
  AddaPersonResult,
  AddaPageResult,
  AddaGroupResult,
  AddaPostResult,
  AddaMediaResult,
  AddaReelResult,
  AddaEventResult,
  AddaMarketplaceResult,
  AddaHashtagResult
} from '../../../services/addaSearchService';
import { PostPhotoGallery } from '../../PostPhotoGallery';
import { PostVideoPlayer } from '../../PostVideoPlayer';
import { ImageLightbox } from '../../ImageLightbox';

const UNIONS_LIST = [
  "সব ইউনিয়ন",
  "পুঠিয়া ইউনিয়ন",
  "বানেশ্বর ইউনিয়ন",
  "বেলপুকুরিয়া ইউনিয়ন",
  "জিউপাড়া ইউনিয়ন",
  "শিলমাড়িয়া ইউনিয়ন",
  "ভালুকগাছি ইউনিয়ন"
];

const CATEGORY_TABS: { id: AddaSearchCategory; label: string; icon: any }[] = [
  { id: 'all', label: 'সব (All)', icon: Sparkles },
  { id: 'people', label: 'মানুষ (People)', icon: User },
  { id: 'posts', label: 'পোস্ট (Posts)', icon: FileText },
  { id: 'pages', label: 'পেজ (Pages)', icon: FileText },
  { id: 'groups', label: 'গ্রুপ (Groups)', icon: Users },
  { id: 'photos', label: 'ছবি (Photos)', icon: ImageIcon },
  { id: 'videos', label: 'ভিডিও (Videos)', icon: VideoIcon },
  { id: 'reels', label: 'রিলস (Reels)', icon: Clapperboard },
  { id: 'events', label: 'ইভেন্ট (Events)', icon: Calendar },
  { id: 'marketplace', label: 'মার্কেট (Market)', icon: ShoppingBag },
  { id: 'hashtags', label: 'হ্যাশট্যাগ (#)', icon: Hash }
];

interface AddaSearchResultsViewProps {
  searchQuery: string;
  category: AddaSearchCategory;
  results: AddaFullSearchResults | null;
  isLoading: boolean;
  filters: AddaSearchFilters;
  trendingSearches: { tag: string; count: number; category: string }[];
  onCategoryChange: (cat: AddaSearchCategory) => void;
  onFilterChange: (filters: AddaSearchFilters) => void;
  onSearchChange: (q: string) => void;
  onSelectPerson?: (person: AddaPersonResult) => void;
  onSelectPage?: (page: AddaPageResult) => void;
  onSelectGroup?: (group: AddaGroupResult) => void;
  onSelectPost?: (post: AddaPostResult) => void;
  onSelectReel?: (reel: AddaReelResult) => void;
  onConnectPerson?: (personId: string) => void;
  onFollowPage?: (pageId: string) => void;
  onJoinGroup?: (groupId: string) => void;
  onBackToFeed?: () => void;
}

export const AddaSearchResultsView: React.FC<AddaSearchResultsViewProps> = ({
  searchQuery,
  category,
  results,
  isLoading,
  filters,
  trendingSearches,
  onCategoryChange,
  onFilterChange,
  onSearchChange,
  onSelectPerson,
  onSelectPage,
  onSelectGroup,
  onSelectPost,
  onSelectReel,
  onConnectPerson,
  onFollowPage,
  onJoinGroup,
  onBackToFeed,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [followedPages, setFollowedPages] = useState<{ [id: string]: boolean }>({});
  const [connectedUsers, setConnectedUsers] = useState<{ [id: string]: boolean }>({});
  const [joinedGroups, setJoinedGroups] = useState<{ [id: string]: boolean }>({});
  const [activeReelModal, setActiveReelModal] = useState<AddaReelResult | null>(null);

  // Toggle follow page
  const handleFollowPage = (pageId: string) => {
    setFollowedPages(prev => ({ ...prev, [pageId]: !prev[pageId] }));
    if (onFollowPage) onFollowPage(pageId);
  };

  // Toggle connect person
  const handleConnectPerson = (personId: string) => {
    setConnectedUsers(prev => ({ ...prev, [personId]: !prev[personId] }));
    if (onConnectPerson) onConnectPerson(personId);
  };

  // Toggle join group
  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    if (onJoinGroup) onJoinGroup(groupId);
  };

  // Format date helper
  const formatDate = (val: any): string => {
    if (!val) return 'সাম্প্রতিক';
    try {
      const date = val?.toDate ? val.toDate() : (val?.seconds ? new Date(val.seconds * 1000) : new Date(val));
      return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'সাম্প্রতিক';
    }
  };

  const hasAnyResults = results && results.totalCount > 0;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* 1. TOP HEADER & CATEGORY TABS */}
      <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-100 shadow-sm space-y-4">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-50">
          <div className="flex items-center gap-3">
            {onBackToFeed && (
              <button
                onClick={onBackToFeed}
                className="p-2 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
                title="আড্ডা হোমে ফিরে যান"
              >
                <ArrowLeft size={20} className="text-[#006a4e]" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <Search size={20} className="text-[#006a4e]" />
                {searchQuery ? (
                  <span>“<span className="text-[#006a4e]">{searchQuery}</span>” এর ফলাফল</span>
                ) : (
                  <span>আড্ডা ডিসকভার ও এক্সপ্লোর</span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {results ? `${results.totalCount} টি ফলাফল পাওয়া গেছে` : 'আড্ডার সকল তথ্য একসাথে'}
              </p>
            </div>
          </div>

          {/* Quick Filter button on mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#006a4e] font-bold text-xs border border-emerald-100 cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>ফিল্টার</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = category === tab.id;
            const Icon = tab.icon;
            let countBadge: number | undefined;

            if (results) {
              if (tab.id === 'people') countBadge = results.people.length;
              if (tab.id === 'posts') countBadge = results.posts.length;
              if (tab.id === 'pages') countBadge = results.pages.length;
              if (tab.id === 'groups') countBadge = results.groups.length;
              if (tab.id === 'photos') countBadge = results.photos.length;
              if (tab.id === 'videos') countBadge = results.videos.length;
              if (tab.id === 'reels') countBadge = results.reels.length;
              if (tab.id === 'events') countBadge = results.events.length;
              if (tab.id === 'marketplace') countBadge = results.marketplace.length;
              if (tab.id === 'hashtags') countBadge = results.hashtags.length;
            }

            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isActive
                    ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-md shadow-emerald-700/15'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{tab.label}</span>
                {countBadge !== undefined && countBadge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN BODY: 3-Column Desktop Grid (Left: Filter, Center: Results, Right: Trending/Discover) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================
            LEFT COLUMN: DYNAMIC FILTERS (Desktop & Mobile Drawer)
           ======================================================== */}
        <div className={`lg:col-span-3 lg:block space-y-4 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={14} className="text-[#006a4e]" />
                ফিল্টার সমূহ (Filters)
              </h3>
              <button
                onClick={() => onFilterChange({ date: 'all', location: 'সব ইউনিয়ন', authorFilter: 'all', condition: 'all', eventTimeFilter: 'all' })}
                className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                <RotateCcw size={11} />
                রিসেট
              </button>
            </div>

            {/* 📍 Location Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-600 block flex items-center gap-1">
                <MapPin size={12} className="text-[#006a4e]" /> এলাকা / ইউনিয়ন
              </label>
              <select
                value={filters.location || 'সব ইউনিয়ন'}
                onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#006a4e]"
              >
                {UNIONS_LIST.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* 📅 Date Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-600 block flex items-center gap-1">
                <Clock size={12} className="text-[#006a4e]" /> প্রকাশের সময়
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'all', label: 'যেকোনো সময়' },
                  { id: 'today', label: 'আজকে' },
                  { id: 'this_week', label: 'এই সপ্তাহে' },
                  { id: 'this_month', label: 'এই মাসে' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onFilterChange({ ...filters, date: d.id as any })}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                      (filters.date || 'all') === d.id
                        ? 'bg-emerald-50 text-[#006a4e] border-emerald-200 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 👤 Author Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-600 block flex items-center gap-1">
                <User size={12} className="text-[#006a4e]" /> পোস্টদাতা / অথর
              </label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'সকল নাগরিক থেকে' },
                  { id: 'verified', label: 'ভেরিফায়েড ও স্পেশাল' }
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onFilterChange({ ...filters, authorFilter: a.id as any })}
                    className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer border ${
                      (filters.authorFilter || 'all') === a.id
                        ? 'bg-emerald-50 text-[#006a4e] border-emerald-200 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Marketplace specific filters */}
            {category === 'marketplace' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-black text-slate-600 block">
                  পণ্যের অবস্থা (Condition)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'all', label: 'সকল' },
                    { id: 'new', label: 'নতুন' },
                    { id: 'used', label: 'ব্যবহৃত' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onFilterChange({ ...filters, condition: c.id as any })}
                      className={`py-1 px-2 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        (filters.condition || 'all') === c.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Events specific filters */}
            {category === 'events' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-black text-slate-600 block">
                  ইভেন্টের সময়কাল
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: 'সকল' },
                    { id: 'upcoming', label: 'আসন্ন' },
                    { id: 'today', label: 'আজকে' },
                    { id: 'this_week', label: 'এই সপ্তাহে' }
                  ].map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onFilterChange({ ...filters, eventTimeFilter: e.id as any })}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border cursor-pointer ${
                        (filters.eventTimeFilter || 'all') === e.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            CENTER COLUMN: SEARCH RESULTS STREAM
           ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          {/* Skeleton Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-200 rounded-full"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-2.5 bg-slate-100 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-slate-100 rounded-2xl"></div>
                </div>
              ))}
            </div>
          )}

          {/* Results Render */}
          {!isLoading && results && (
            <>
              {/* TAB 1: ALL RESULTS (Composite View) */}
              {category === 'all' && (
                <div className="space-y-5">
                  {/* Top Matching People preview */}
                  {results.people.length > 0 && (
                    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                        <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <User size={14} className="text-[#006a4e]" /> নাগরিক (People)
                        </h3>
                        <button
                          onClick={() => onCategoryChange('people')}
                          className="text-[11px] font-bold text-[#006a4e] hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-1"
                        >
                          সব দেখুন <ChevronRight size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {results.people.slice(0, 4).map((p) => (
                          <div key={p.id} className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 transition-all flex items-center gap-3">
                            <img
                              src={p.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.id}`}
                              alt={p.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                                {p.name}
                                {p.isVerified && <CheckCircle2 size={12} className="fill-blue-500 text-white shrink-0" />}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">{p.union || 'পুঠিয়া'}</p>
                            </div>
                            <button
                              onClick={() => handleConnectPerson(p.id)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black cursor-pointer transition-all border shrink-0 ${
                                connectedUsers[p.id]
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white text-[#006a4e] border-emerald-300 hover:bg-emerald-50'
                              }`}
                            >
                              {connectedUsers[p.id] ? 'যুক্ত' : '+ যুক্ত'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Matching Pages & Groups preview */}
                  {(results.pages.length > 0 || results.groups.length > 0) && (
                    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                        <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <Users size={14} className="text-indigo-600" /> পেজ ও আড্ডা ঘর (Pages & Groups)
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {results.pages.slice(0, 2).map((page) => (
                          <div key={page.id} className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-lg overflow-hidden shrink-0">
                              {page.logoUrl ? <img src={page.logoUrl} alt={page.name} className="w-full h-full object-cover" /> : '📄'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                                {page.name}
                                {page.isVerified && <CheckCircle2 size={11} className="fill-blue-500 text-white" />}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">{page.category}</p>
                            </div>
                            <button
                              onClick={() => handleFollowPage(page.id)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black cursor-pointer border shrink-0 ${
                                followedPages[page.id] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200'
                              }`}
                            >
                              {followedPages[page.id] ? 'ফলোয়িং' : 'ফলো'}
                            </button>
                          </div>
                        ))}
                        {results.groups.slice(0, 2).map((g) => (
                          <div key={g.id} className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                              👥
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate">{g.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate">{g.memberCount} সদস্য</p>
                            </div>
                            <button
                              onClick={() => handleJoinGroup(g.id)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black cursor-pointer border shrink-0 ${
                                joinedGroups[g.id] || g.isJoined ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-white text-[#006a4e] border-emerald-300'
                              }`}
                            >
                              {joinedGroups[g.id] || g.isJoined ? 'যুক্ত' : 'জয়েন'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Posts stream */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-500 px-2 tracking-wider">
                      📝 সম্পর্কিত পোস্ট সমূহ ({results.posts.length})
                    </h3>
                    {results.posts.length > 0 ? (
                      results.posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.authorId}`}
                                alt={post.author}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                                  {post.author}
                                  {post.authorBadge && <CheckCircle2 size={12} className="fill-blue-500 text-white" />}
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                  {formatDate(post.createdAt)} {post.union ? `• 📍 ${post.union}` : ''}
                                </p>
                              </div>
                            </div>
                            {post.category && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                {post.category}
                              </span>
                            )}
                          </div>

                          {post.title && (
                            <h3 className="text-sm font-black text-slate-800 leading-snug">{post.title}</h3>
                          )}

                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>

                          {/* Media attachments */}
                          {post.imageUrl && (
                            <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxImage(post.imageUrl!)}>
                              <img src={post.imageUrl} alt="post media" className="w-full max-h-80 object-cover hover:scale-[1.01] transition-transform" />
                            </div>
                          )}
                          {post.gallery && post.gallery.length > 0 && (
                            <PostPhotoGallery images={post.gallery} onImageClick={(idx) => setLightboxImage(post.gallery![idx])} />
                          )}
                          {post.videoUrl && (
                            <PostVideoPlayer src={post.videoUrl} title={post.title} />
                          )}

                          {/* Stats and Action Bar */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                            <span className="flex items-center gap-1">
                              👍 {post.likes} রিঅ্যাকশন
                            </span>
                            <span>{post.commentsCount} টি মন্তব্য</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-3xl p-6 text-center text-xs text-slate-400 font-bold">
                        কোনো সম্পর্কিত পোস্ট পাওয়া যায়নি।
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PEOPLE SEARCH */}
              {category === 'people' && (
                <div className="space-y-3">
                  {results.people.length > 0 ? (
                    results.people.map((p) => (
                      <div key={p.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={p.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.id}`}
                            alt={p.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-800 truncate flex items-center gap-1.5">
                              {p.name}
                              {p.isVerified && <CheckCircle2 size={14} className="fill-blue-500 text-white" />}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {p.username ? `@${p.username}` : ''} {p.profession ? `• ${p.profession}` : ''}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {p.union || 'পুঠিয়া'} {p.village ? `, ${p.village}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleConnectPerson(p.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all border ${
                              connectedUsers[p.id]
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-[#006a4e] text-white hover:bg-[#00523c] border-[#006a4e]'
                            }`}
                          >
                            {connectedUsers[p.id] ? '✓ কানেক্টেড' : '+ ফ্রেন্ড যুক্ত'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center space-y-2">
                      <p className="text-sm font-bold text-slate-700">কোনো নাগরিক খুঁজে পাওয়া যায়নি।</p>
                      <p className="text-xs text-slate-400">নাম বা ইউজারনেম দিয়ে আবার চেষ্টা করুন।</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: POSTS SEARCH */}
              {category === 'posts' && (
                <div className="space-y-4">
                  {results.posts.length > 0 ? (
                    results.posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.authorPhotoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.authorId}`}
                              alt={post.author}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                                {post.author}
                                {post.authorBadge && <CheckCircle2 size={12} className="fill-blue-500 text-white" />}
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {formatDate(post.createdAt)} {post.union ? `• 📍 ${post.union}` : ''}
                              </p>
                            </div>
                          </div>
                          {post.category && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                              {post.category}
                            </span>
                          )}
                        </div>

                        {post.title && <h3 className="text-sm font-black text-slate-800 leading-snug">{post.title}</h3>}
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {post.imageUrl && (
                          <div className="rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxImage(post.imageUrl!)}>
                            <img src={post.imageUrl} alt="post media" className="w-full max-h-80 object-cover" />
                          </div>
                        )}
                        {post.videoUrl && <PostVideoPlayer src={post.videoUrl} title={post.title} />}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                          <span>👍 {post.likes} রিঅ্যাকশন</span>
                          <span>{post.commentsCount} মন্তব্য</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো পোস্ট পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PAGES SEARCH */}
              {category === 'pages' && (
                <div className="space-y-3">
                  {results.pages.length > 0 ? (
                    results.pages.map((page) => (
                      <div key={page.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                            {page.logoUrl ? <img src={page.logoUrl} alt={page.name} className="w-full h-full object-cover" /> : '📄'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-800 truncate flex items-center gap-1.5">
                              {page.name}
                              {page.isVerified && <CheckCircle2 size={14} className="fill-blue-500 text-white" />}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{page.category}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">📍 {page.union || page.address || 'পুঠিয়া'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollowPage(page.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer border shrink-0 ${
                            followedPages[page.id] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-300'
                          }`}
                        >
                          {followedPages[page.id] ? '✓ ফলোয়িং' : '+ ফলো'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো পেজ পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: GROUPS SEARCH */}
              {category === 'groups' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {results.groups.length > 0 ? (
                    results.groups.map((g) => (
                      <div key={g.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                        <div className="h-24 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 flex items-center justify-center text-white text-3xl font-black relative overflow-hidden">
                          {g.banner ? <img src={g.banner} alt={g.name} className="w-full h-full object-cover" /> : '👥'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 truncate">{g.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{g.description}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2">👥 {g.memberCount} সদস্য • {g.category}</p>
                        </div>
                        <button
                          onClick={() => handleJoinGroup(g.id)}
                          className={`w-full py-2 rounded-xl text-xs font-black cursor-pointer border ${
                            joinedGroups[g.id] || g.isJoined ? 'bg-[#006a4e] text-white border-[#006a4e]' : 'bg-emerald-50 text-[#006a4e] border-emerald-200'
                          }`}
                        >
                          {joinedGroups[g.id] || g.isJoined ? '✓ জয়েন করা আছে' : 'গ্রুপে যোগ দিন'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো গ্রুপ পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: PHOTOS SEARCH */}
              {category === 'photos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.photos.length > 0 ? (
                    results.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setLightboxImage(photo.url)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer shadow-xs"
                      >
                        <img src={photo.url} alt={photo.caption || 'Photo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                          <p className="text-[10px] font-bold truncate">{photo.caption || photo.title}</p>
                          <p className="text-[9px] text-white/80">👤 {photo.author}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো ছবি পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: VIDEOS SEARCH */}
              {category === 'videos' && (
                <div className="space-y-4">
                  {results.videos.length > 0 ? (
                    results.videos.map((vid) => (
                      <div key={vid.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                        <h4 className="text-xs font-black text-slate-800">{vid.title}</h4>
                        <PostVideoPlayer src={vid.url} title={vid.title} />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                          <span>👤 {vid.author}</span>
                          <span>👁️ {vid.views || 0} ভিউ</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো ভিডিও পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: REELS SEARCH */}
              {category === 'reels' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.reels.length > 0 ? (
                    results.reels.map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => setActiveReelModal(reel)}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-md"
                      >
                        {reel.thumbnailUrl ? (
                          <img src={reel.thumbnailUrl} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <video src={reel.videoUrl} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between text-white">
                          <div className="flex justify-end">
                            <span className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-xs">
                              <Play size={12} className="fill-white" />
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold line-clamp-2 leading-tight">{reel.caption}</p>
                            <p className="text-[10px] text-white/80 truncate">👤 {reel.authorName}</p>
                            <p className="text-[9px] text-amber-300">👁️ {reel.viewsCount} ভিউ</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো রিলস পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: EVENTS SEARCH */}
              {category === 'events' && (
                <div className="space-y-3">
                  {results.events.length > 0 ? (
                    results.events.map((ev) => (
                      <div key={ev.id} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col items-center justify-center shrink-0">
                          <Calendar size={18} />
                          <span className="text-[10px] font-black mt-0.5">{ev.eventDate || 'আসন্ন'}</span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <h4 className="text-sm font-black text-slate-800">{ev.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                          <p className="text-[10px] text-slate-400 font-bold">📍 {ev.venue} • আয়োজক: {ev.organizer}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো ইভেন্ট পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 10: MARKETPLACE SEARCH */}
              {category === 'marketplace' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {results.marketplace.length > 0 ? (
                    results.marketplace.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
                        <div className="h-36 rounded-2xl bg-slate-100 overflow-hidden relative">
                          <img src={item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'} alt={item.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-700 text-white text-[10px] font-black">
                            ৳ {item.price}
                          </span>
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-white/90 text-slate-700 text-[9px] font-bold">
                            {item.condition === 'new' ? 'নতুন' : 'ব্যবহৃত'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-500">📍 {item.location} • {item.category}</p>
                          <p className="text-[10px] text-slate-400 mt-1">বিক্রেতা: {item.sellerName}</p>
                        </div>
                        {item.sellerPhone && (
                          <a
                            href={`tel:${item.sellerPhone}`}
                            className="w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] text-center font-bold text-xs flex items-center justify-center gap-1.5 no-underline"
                          >
                            <Phone size={12} /> কল দিন ({item.sellerPhone})
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো পণ্য খুঁজে পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 11: HASHTAGS SEARCH */}
              {category === 'hashtags' && (
                <div className="space-y-3">
                  {results.hashtags.length > 0 ? (
                    results.hashtags.map((h) => (
                      <div
                        key={h.tag}
                        onClick={() => onSearchChange(`#${h.tag}`)}
                        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006a4e] flex items-center justify-center text-xl font-black">
                            #
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800">#{h.tag}</h4>
                            <p className="text-xs text-slate-500 font-bold">{h.count} টি পোস্ট ও রিলস</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 font-bold">
                      কোনো হ্যাশট্যাগ পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* No Results Empty State across whole query */}
              {!hasAnyResults && (
                <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mx-auto text-2xl font-black">
                    🔍
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-800">
                      “{searchQuery}” এর জন্য কোনো ফলাফল পাওয়া যায়নি
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      বানান পরীক্ষা করুন বা অন্য কোনো কীওয়ার্ড (যেমন: পুঠিয়া, বানেশ্বর, চাকরি, বাজার) দিয়ে সার্চ করুন।
                    </p>
                  </div>

                  {/* Related Suggestions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-600">জনপ্রিয় কিছু অনুসন্ধান:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {trendingSearches.slice(0, 5).map((item) => (
                        <button
                          key={item.tag}
                          onClick={() => onSearchChange(`#${item.tag}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-[#006a4e] text-xs font-bold transition-colors cursor-pointer border-0"
                        >
                          #{item.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================
            RIGHT COLUMN: TRENDING ON আড্ডা & DISCOVER SECTION
           ======================================================== */}
        <div className="lg:col-span-3 space-y-4 hidden lg:block">
          {/* 🔥 Trending on আড্ডা */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <Flame size={15} className="text-amber-500 fill-amber-500" />
              আড্ডায় ট্রেন্ডিং (Trending)
            </h3>
            <div className="space-y-1">
              {trendingSearches.slice(0, 7).map((item, idx) => (
                <div
                  key={item.tag}
                  onClick={() => onSearchChange(`#${item.tag}`)}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-800 group-hover:text-[#006a4e] block truncate">
                      #{item.tag}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.count} আলোচনা • {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-slate-300 group-hover:text-amber-500">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ✨ Discover & Suggested Searches */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600" />
              ডিসকভার করুন
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              পুঠিয়ার বিভিন্ন ইউনিয়ন, স্বাস্থ্য সেবা, আমের বাজার এবং সামাজিক বিষয় নিয়ে নিয়মিত আড্ডা দেখুন।
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['পুঠিয়া_ইউনিয়ন', 'বানেশ্বর_বাজার', 'কৃষি_পণ্য', 'ডাক্তার', 'রক্তদান'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(`#${tag}`)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border-0"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage || ''}
        onClose={() => setLightboxImage(null)}
      />

      {/* Reel Modal Player */}
      {activeReelModal && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
          onClick={() => setActiveReelModal(null)}
        >
          <div className="relative max-w-sm w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <video 
              src={activeReelModal.videoUrl} 
              autoPlay 
              controls 
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setActiveReelModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer border-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

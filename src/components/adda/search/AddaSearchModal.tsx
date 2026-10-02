import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, ArrowLeft, X, Clock, Flame, Sparkles, 
  User, FileText, Users, Hash, Clapperboard, Calendar, 
  ShoppingBag, ChevronRight, SlidersHorizontal, CheckCircle2 
} from 'lucide-react';
import { 
  addaSearchService, 
  AddaSearchCategory, 
  AddaSearchFilters, 
  AddaSearchSuggestionGroup, 
  AddaFullSearchResults,
  AddaPersonResult,
  AddaPageResult,
  AddaGroupResult,
  AddaPostResult,
  AddaReelResult 
} from '../../../services/addaSearchService';
import { AddaSearchResultsView } from './AddaSearchResultsView';

interface AddaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialCategory?: AddaSearchCategory;
  currentUserId?: string | null;
  onSelectPerson?: (person: AddaPersonResult) => void;
  onSelectPage?: (page: AddaPageResult) => void;
  onSelectGroup?: (group: AddaGroupResult) => void;
  onSelectPost?: (post: AddaPostResult) => void;
}

export const AddaSearchModal: React.FC<AddaSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialCategory = 'all',
  currentUserId,
  onSelectPerson,
  onSelectPage,
  onSelectGroup,
  onSelectPost,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<AddaSearchCategory>(initialCategory);
  const [filters, setFilters] = useState<AddaSearchFilters>({ date: 'all', location: 'সব ইউনিয়ন', authorFilter: 'all' });
  const [viewMode, setViewMode] = useState<'suggestions' | 'results'>('suggestions');
  
  // Data states
  const [suggestions, setSuggestions] = useState<AddaSearchSuggestionGroup>({
    people: [], pages: [], groups: [], posts: [], reels: [], hashtags: [], totalMatches: 0
  });
  const [searchResults, setSearchResults] = useState<AddaFullSearchResults | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<{ tag: string; count: number; category: string }[]>([]);
  
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial query if updated
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performFullSearch(initialQuery, initialCategory, filters);
    }
  }, [initialQuery, initialCategory]);

  // Load Recent & Trending searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(addaSearchService.getRecentSearches());
      addaSearchService.getTrendingSearches().then(setTrendingSearches);
      
      // Auto-focus search input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle live suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions({ people: [], pages: [], groups: [], posts: [], reels: [], hashtags: [], totalMatches: 0 });
      setIsSuggestLoading(false);
      return;
    }

    setIsSuggestLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await addaSearchService.getLiveSuggestions(query, currentUserId);
        setSuggestions(res);
      } catch (err) {
        console.error("Error fetching live suggestions:", err);
      } finally {
        setIsSuggestLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, currentUserId, isOpen]);

  // Execute full search
  const performFullSearch = async (searchTerm: string, cat: AddaSearchCategory = activeCategory, f: AddaSearchFilters = filters) => {
    if (!searchTerm.trim()) return;
    setIsSearchLoading(true);
    setViewMode('results');

    // Save to recents
    const updated = addaSearchService.addRecentSearch(searchTerm);
    setRecentSearches(updated);

    try {
      const results = await addaSearchService.searchFull(searchTerm, cat, f, currentUserId);
      setSearchResults(results);
    } catch (err) {
      console.error("Error performing full search:", err);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performFullSearch(query);
    }
  };

  const handleSelectSuggestionTerm = (term: string, cat?: string) => {
    setQuery(term);
    const targetCat = (cat as AddaSearchCategory) || activeCategory;
    setActiveCategory(targetCat);
    performFullSearch(term, targetCat);
  };

  const handleCategoryChange = (cat: AddaSearchCategory) => {
    setActiveCategory(cat);
    if (query.trim()) {
      performFullSearch(query, cat, filters);
    }
  };

  const handleFilterChange = (newFilters: AddaSearchFilters) => {
    setFilters(newFilters);
    if (query.trim()) {
      performFullSearch(query, activeCategory, newFilters);
    }
  };

  const handleRemoveRecent = (term: string) => {
    const updated = addaSearchService.removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearRecents = () => {
    addaSearchService.clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-[#f8fafc] text-slate-900 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      <div 
        className="w-full h-full bg-[#f8fafc] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            TOP BAR: SEARCH INPUT & CONTROLS
           ======================================================== */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-3.5 border-b border-slate-100 flex items-center gap-2 sm:gap-3">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="text-[#006a4e]" />
          </button>

          {/* Search Input Form */}
          <form onSubmit={handleFormSubmit} className="flex-1 relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search size={18} className="text-[#006a4e]" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (viewMode === 'results') setViewMode('suggestions');
              }}
              onFocus={() => {
                if (!query) setViewMode('suggestions');
              }}
              placeholder="আড্ডায় খুঁজুন... (মানুষ, পেজ, গ্রুপ, পোস্ট, রিলস, #হ্যাশট্যাগ)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#006a4e] rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setViewMode('suggestions');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors border-0 bg-transparent"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Search Action Button */}
          <button
            onClick={() => {
              if (query.trim()) performFullSearch(query);
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black transition-all shadow-sm cursor-pointer border-0 shrink-0 hidden sm:flex items-center gap-1.5"
          >
            <Search size={14} />
            <span>খুঁজুন</span>
          </button>
        </div>

        {/* ========================================================
            BODY: SUGGESTIONS / RESULTS VIEW
           ======================================================== */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto max-h-[calc(88vh-70px)]">
          {viewMode === 'suggestions' ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* If query has text, show real-time suggestions */}
              {query.trim().length > 0 ? (
                <div className="space-y-4">
                  {isSuggestLoading && (
                    <div className="flex items-center gap-2.5 py-3 px-3 text-xs text-[#006a4e] font-bold">
                      <div className="w-4 h-4 border-2 border-[#006a4e] border-t-transparent rounded-full animate-spin"></div>
                      <span>আড্ডায় লাইভ খোঁজা হচ্ছে...</span>
                    </div>
                  )}

                  {/* People */}
                  {suggestions.people.length > 0 && (
                    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5 px-1">
                        <User size={13} className="text-[#006a4e]" /> নাগরিক (People)
                      </span>
                      <div className="divide-y divide-slate-50">
                        {suggestions.people.map((person) => (
                          <div
                            key={person.id}
                            onClick={() => {
                              if (onSelectPerson) {
                                onSelectPerson(person);
                                onClose();
                              } else {
                                handleSelectSuggestionTerm(person.name, 'people');
                              }
                            }}
                            className="flex items-center justify-between p-2 hover:bg-emerald-50/50 rounded-2xl cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={person.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${person.id}`}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-100"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                                  {person.name}
                                  {person.isVerified && <CheckCircle2 size={12} className="fill-blue-500 text-white" />}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {person.username ? `@${person.username}` : ''} {person.union ? `• 📍 ${person.union}` : ''}
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-[#006a4e]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pages & Groups */}
                  {(suggestions.pages.length > 0 || suggestions.groups.length > 0) && (
                    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
                      <span className="text-[11px] font-black uppercase text-slate-400 flex items-center gap-1.5 px-1">
                        <Users size={13} className="text-indigo-600" /> পেজ ও আড্ডা ঘর
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.pages.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (onSelectPage) {
                                onSelectPage(p);
                                onClose();
                              } else {
                                handleSelectSuggestionTerm(p.name, 'pages');
                              }
                            }}
                            className="p-2.5 bg-indigo-50/40 hover:bg-indigo-50 rounded-2xl border border-indigo-100 cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-base shrink-0 overflow-hidden">
                              {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="w-full h-full object-cover" /> : '📄'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate flex items-center gap-1">
                                {p.name}
                                {p.isVerified && <CheckCircle2 size={11} className="fill-blue-500 text-white" />}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate">{p.category}</p>
                            </div>
                          </div>
                        ))}

                        {suggestions.groups.map((g) => (
                          <div
                            key={g.id}
                            onClick={() => {
                              if (onSelectGroup) {
                                onSelectGroup(g);
                                onClose();
                              } else {
                                handleSelectSuggestionTerm(g.name, 'groups');
                              }
                            }}
                            className="p-2.5 bg-emerald-50/40 hover:bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                              👥
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-slate-800 truncate">{g.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate">{g.memberCount} সদস্য</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Hashtags */}
                  {suggestions.hashtags.length > 0 && (
                    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 block px-1">
                        সম্পর্কিত হ্যাশট্যাগ (#)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.hashtags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleSelectSuggestionTerm(`#${tag}`, 'hashtags')}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#006a4e] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200/80"
                          >
                            <Hash size={12} className="text-[#006a4e]" />
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full results CTA button */}
                  <div className="pt-2">
                    <button
                      onClick={() => performFullSearch(query)}
                      className="w-full py-3 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer border-0"
                    >
                      <Search size={15} />
                      <span>“{query}” এর সব ফলাফল দেখুন ({suggestions.totalMatches}+ টি)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* When empty: show Recents & Trending */
                <div className="space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Clock size={14} className="text-[#006a4e]" />
                          সাম্প্রতিক অনুসন্ধান (Recent Searches)
                        </span>
                        <button
                          onClick={handleClearRecents}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer bg-transparent border-0"
                        >
                          সব মুছুন
                        </button>
                      </div>

                      <div className="space-y-1">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-2xl group transition-colors"
                          >
                            <div
                              onClick={() => handleSelectSuggestionTerm(term)}
                              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                            >
                              <Search size={14} className="text-slate-400 group-hover:text-[#006a4e] shrink-0" />
                              <span className="text-xs font-bold text-slate-700 truncate group-hover:text-[#006a4e]">
                                {term}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRecent(term);
                              }}
                              className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors border-0 bg-transparent"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🔥 Trending on আড্ডা */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Flame size={15} className="text-amber-500 fill-amber-500" />
                      আড্ডায় ট্রেন্ডিং (Trending on আড্ডা)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {trendingSearches.map((item, idx) => (
                        <div
                          key={item.tag}
                          onClick={() => handleSelectSuggestionTerm(`#${item.tag}`, 'hashtags')}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 transition-all cursor-pointer group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-800 group-hover:text-[#006a4e] block truncate">
                              #{item.tag}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {item.count} টি আলোচনা • {item.category}
                            </span>
                          </div>
                          <Sparkles size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✨ Discover Quick Links */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-600" />
                      জনপ্রিয় ক্যাটাগরি এক্সপ্লোর করুন
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'নাগরিক নেটওয়ার্ক', cat: 'people', icon: '👤' },
                        { label: 'ব্যবসা ও পেজ', cat: 'pages', icon: '📄' },
                        { label: 'আড্ডা ঘর', cat: 'groups', icon: '👥' },
                        { label: 'মার্কেটপ্লেস', cat: 'marketplace', icon: '🛒' },
                        { label: 'বিনোদন ও রিলস', cat: 'reels', icon: '🎬' },
                        { label: 'সামাজিক ইভেন্ট', cat: 'events', icon: '📅' },
                        { label: 'ছবি গ্যালারি', cat: 'photos', icon: '📷' },
                        { label: 'ভিডিও গ্যালারি', cat: 'videos', icon: '🎥' }
                      ].map((item) => (
                        <button
                          key={item.cat}
                          onClick={() => {
                            setActiveCategory(item.cat as any);
                            performFullSearch(query || 'পুঠিয়া', item.cat as any);
                          }}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-[11px] font-black text-slate-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* RESULTS VIEW */
            <AddaSearchResultsView
              searchQuery={query}
              category={activeCategory}
              results={searchResults}
              isLoading={isSearchLoading}
              filters={filters}
              trendingSearches={trendingSearches}
              onCategoryChange={handleCategoryChange}
              onFilterChange={handleFilterChange}
              onSearchChange={(newQuery) => {
                setQuery(newQuery);
                performFullSearch(newQuery);
              }}
              onSelectPerson={onSelectPerson}
              onSelectPage={onSelectPage}
              onSelectGroup={onSelectGroup}
              onSelectPost={onSelectPost}
              onBackToFeed={() => setViewMode('suggestions')}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

import React from 'react';
import { 
  Search, User, FileText, Users, Hash, Clapperboard, 
  ArrowRight, X, Clock, Flame, ChevronRight, CheckCircle2,
  MapPin, Sparkles, ShoppingBag, Calendar
} from 'lucide-react';
import { 
  AddaSearchSuggestionGroup, 
  AddaPersonResult, 
  AddaPageResult, 
  AddaGroupResult, 
  AddaPostResult,
  AddaReelResult
} from '../../../services/addaSearchService';

interface AddaSearchDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  suggestions: AddaSearchSuggestionGroup;
  recentSearches: string[];
  trendingSearches: { tag: string; count: number; category: string }[];
  isLoading: boolean;
  onSelectSuggestion: (query: string, category?: string) => void;
  onSelectPerson?: (person: AddaPersonResult) => void;
  onSelectPage?: (page: AddaPageResult) => void;
  onSelectGroup?: (group: AddaGroupResult) => void;
  onSelectPost?: (post: AddaPostResult) => void;
  onSelectReel?: (reel: AddaReelResult) => void;
  onRemoveRecentSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  onSeeAllResults: () => void;
}

export const AddaSearchDropdown: React.FC<AddaSearchDropdownProps> = ({
  isOpen,
  searchQuery,
  suggestions,
  recentSearches,
  trendingSearches,
  isLoading,
  onSelectSuggestion,
  onSelectPerson,
  onSelectPage,
  onSelectGroup,
  onSelectPost,
  onSelectReel,
  onRemoveRecentSearch,
  onClearRecentSearches,
  onSeeAllResults,
}) => {
  if (!isOpen) return null;

  const hasQuery = searchQuery.trim().length > 0;
  const { people, pages, groups, posts, reels, hashtags, totalMatches } = suggestions;
  const hasResults = people.length > 0 || pages.length > 0 || groups.length > 0 || posts.length > 0 || reels.length > 0 || hashtags.length > 0;

  return (
    <div 
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[80vh] sm:max-h-[550px] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100/80 p-2 sm:p-3 space-y-3">
        {/* State A: User is typing and we have results */}
        {hasQuery ? (
          <>
            {isLoading && (
              <div className="flex items-center gap-2.5 py-3 px-3 text-xs text-[#006a4e] font-bold">
                <div className="w-4 h-4 border-2 border-[#006a4e] border-t-transparent rounded-full animate-spin"></div>
                <span>আড্ডায় তথ্য খোঁজা হচ্ছে...</span>
              </div>
            )}

            {/* People Suggestions */}
            {people.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User size={13} className="text-[#006a4e]" /> নাগরিক (People)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{people.length} জন</span>
                </div>
                {people.map((person) => (
                  <div
                    key={`p_${person.id}`}
                    onClick={() => {
                      if (onSelectPerson) onSelectPerson(person);
                      else onSelectSuggestion(person.name, 'people');
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-emerald-50/60 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={person.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${person.id}`}
                        alt={person.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-emerald-500"
                      />
                      {person.isVerified && (
                        <span className="absolute -bottom-0.5 -right-0.5 text-blue-500 bg-white rounded-full">
                          <CheckCircle2 size={12} className="fill-blue-500 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#006a4e] flex items-center gap-1">
                        {person.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {person.username ? `@${person.username}` : ''} {person.union ? `• ${person.union}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#006a4e] shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Pages Suggestions */}
            {pages.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} className="text-indigo-600" /> পেজ (Pages)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{pages.length} টি</span>
                </div>
                {pages.map((page) => (
                  <div
                    key={`page_${page.id}`}
                    onClick={() => {
                      if (onSelectPage) onSelectPage(page);
                      else onSelectSuggestion(page.name, 'pages');
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base shrink-0 overflow-hidden">
                      {page.logoUrl ? (
                        <img src={page.logoUrl} alt={page.name} className="w-full h-full object-cover" />
                      ) : (
                        '📄'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700 flex items-center gap-1">
                        {page.name}
                        {page.isVerified && <CheckCircle2 size={11} className="fill-blue-500 text-white shrink-0" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {page.category} {page.union ? `• 📍 ${page.union}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Groups Suggestions */}
            {groups.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users size={13} className="text-emerald-600" /> আড্ডা ঘর (Groups)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{groups.length} টি</span>
                </div>
                {groups.map((group) => (
                  <div
                    key={`g_${group.id}`}
                    onClick={() => {
                      if (onSelectGroup) onSelectGroup(group);
                      else onSelectSuggestion(group.name, 'groups');
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-emerald-50/60 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                      👥
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                        {group.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {group.memberCount} জন সদস্য • {group.category || 'কমিউনিটি'}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Posts Suggestions */}
            {posts.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> পোস্ট (Posts)
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{posts.length} টি</span>
                </div>
                {posts.slice(0, 3).map((post) => (
                  <div
                    key={`post_${post.id}`}
                    onClick={() => {
                      if (onSelectPost) onSelectPost(post);
                      else onSelectSuggestion(post.content.slice(0, 30), 'posts');
                    }}
                    className="flex items-start gap-2.5 p-2 hover:bg-amber-50/50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      📝
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-800">
                        {post.title || post.content.slice(0, 45)}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        লেখক: {post.author} • 👍 {post.likes} • 💬 {post.commentsCount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Hashtags */}
            {hashtags.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-2">
                  সম্পর্কিত হ্যাশট্যাগ (#)
                </span>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {hashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onSelectSuggestion(`#${tag}`, 'hashtags')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-[#006a4e] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Hash size={11} className="text-[#006a4e]" />
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results state for this query */}
            {!isLoading && !hasResults && (
              <div className="py-6 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg">
                  🔍
                </div>
                <p className="text-xs font-bold text-slate-700">
                  “{searchQuery}” এর জন্য তাৎক্ষণিক কোনো ফলাফল পাওয়া যায়নি।
                </p>
                <p className="text-[11px] text-slate-400">
                  সম্পূর্ণ সার্চ ফলাফলের জন্য নিচের বাটনে ক্লিক করুন।
                </p>
              </div>
            )}
          </>
        ) : (
          /* State B: Empty Query -> Show Recent Searches & Trending */
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#006a4e]" /> সাম্প্রতিক অনুসন্ধান (Recent)
                  </span>
                  <button
                    onClick={onClearRecentSearches}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer bg-transparent border-0"
                  >
                    সব মুছুন
                  </button>
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 rounded-xl group transition-colors"
                    >
                      <div
                        onClick={() => onSelectSuggestion(term)}
                        className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                      >
                        <Search size={13} className="text-slate-400 group-hover:text-[#006a4e] shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-[#006a4e]">
                          {term}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveRecentSearch(term);
                        }}
                        className="w-5 h-5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors border-0 bg-transparent"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending on আড্ডা */}
            {trendingSearches.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                  <Flame size={13} className="text-amber-500 fill-amber-500" /> আড্ডায় ট্রেন্ডিং (Trending on আড্ডা)
                </span>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {trendingSearches.slice(0, 6).map((item) => (
                    <button
                      key={item.tag}
                      onClick={() => onSelectSuggestion(`#${item.tag}`, 'hashtags')}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 text-left transition-all group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#006a4e] block truncate">
                          #{item.tag}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {item.count} টি আলোচনা • {item.category}
                        </span>
                      </div>
                      <Sparkles size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Bar: See all results */}
      {hasQuery && (
        <div className="p-2 sm:p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-bold pl-2">
            “{searchQuery}” দিয়ে সার্চ
          </span>
          <button
            onClick={onSeeAllResults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006a4e] hover:bg-[#00523c] text-white text-xs font-black shadow-sm transition-all cursor-pointer border-0"
          >
            <span>সব ফলাফল দেখুন</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

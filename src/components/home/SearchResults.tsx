import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Search, 
  User, 
  Building2, 
  Compass, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { getSpellingSuggestion, saveRecentSearch, getRecentSearches } from "../../utils/searchUtils";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category?: string;
  type: string;
  _collectionName?: string;
  imageUrl?: string;
  link?: string;
  phone?: string;
  location?: string;
  isMenu?: boolean;
  targetType?: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading?: boolean;
  onClose: () => void;
  onItemClick: (item: SearchResult) => void;
  onSearchUpdate?: (newQuery: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  query, 
  results, 
  isLoading, 
  onClose, 
  onItemClick,
  onSearchUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'institutions' | 'services' | 'posts'>('all');
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Map result item to 4 super-categories
  const getSuperCategory = (item: SearchResult): 'people' | 'institutions' | 'services' | 'posts' => {
    const colName = item._collectionName || '';
    const type = item.type;

    // 1. People / Members (মানুষ ও পেশাজীবী)
    if (
      colName === 'doctors' || colName === 'lawyers' || colName === 'journalists' || 
      colName === 'content_creators' || colName === 'mistris' || colName === 'blood_donors' || 
      colName === 'volunteers' || colName === 'entrepreneurs' || 
      type === 'doctor' || type === 'blood-donor'
    ) {
      return 'people';
    }

    // 2. Posts / News (খবর, পোস্ট ও নোটিশ)
    if (
      colName === 'news' || colName === 'notice_items' || colName === 'user_posts' || 
      colName === 'agri_notices' || colName === 'social_events' || colName === 'lost_found' ||
      type === 'news' || type === 'notice'
    ) {
      return 'posts';
    }

    // 3. Institutions / Places (প্রতিষ্ঠান ও স্থান)
    if (
      colName === 'hospitals' || colName === 'diagnostics' || colName === 'emergency_services' || 
      colName === 'fire_services' || colName === 'police_services' || colName === 'banks' || 
      colName === 'pharmacies' || colName === 'educational_institutions' || colName === 'ngos' || 
      colName === 'nurseries' || colName === 'hotels' || colName === 'tourist_spots' || 
      colName === 'restaurants' || colName === 'courier_services' || colName === 'parlors' || 
      colName === 'mosques' || 
      type === 'tourism' || type === 'health' || type === 'education'
    ) {
      return 'institutions';
    }

    // 4. Default to Services (সেবা ও ডিরেক্টরি)
    return 'services';
  };

  const categorizedResults = results.map(item => ({
    ...item,
    superCategory: getSuperCategory(item)
  }));

  const peopleResults = categorizedResults.filter(item => item.superCategory === 'people');
  const institutionsResults = categorizedResults.filter(item => item.superCategory === 'institutions');
  const servicesResults = categorizedResults.filter(item => item.superCategory === 'services');
  const postsResults = categorizedResults.filter(item => item.superCategory === 'posts');

  const filteredResults = activeTab === 'all' 
    ? categorizedResults 
    : categorizedResults.filter(item => item.superCategory === activeTab);

  const spellingSuggestion = getSpellingSuggestion(localQuery);

  const handleSuggestionClick = (suggested: string) => {
    setLocalQuery(suggested);
    if (onSearchUpdate) {
      onSearchUpdate(suggested);
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim() && onSearchUpdate) {
      onSearchUpdate(localQuery.trim());
    }
  };

  const popularSearches = [
    "ডাক্তার তালিকা",
    "জরুরী হটলাইন",
    "পুঠিয়া রাজবাড়ী",
    "রক্তদাতা",
    "বাস সময়সূচী",
    "শিক্ষা প্রতিষ্ঠান"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans"
    >
      {/* Top Search Input Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-all shrink-0 cursor-pointer"
            title="ফিরে যান"
          >
            <X size={20} className="text-slate-600" />
          </button>
          
          <form onSubmit={handleLocalSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="সারাদিন কি খুঁজছেন? নতুন করে টাইপ করুন..."
              className="w-full bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-600 rounded-full py-1.5 pl-10 pr-10 text-xs font-semibold text-slate-800 outline-none transition-all"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Spelling Correction Suggested Banner */}
        {spellingSuggestion && results.length === 0 && (
          <div className="mx-1 px-3 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] font-bold text-amber-800 flex items-center gap-2 animate-pulse">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>আপনি কি <button onClick={() => handleSuggestionClick(spellingSuggestion)} className="underline text-emerald-700 font-extrabold cursor-pointer">“{spellingSuggestion}”</button> বোঝাতে চেয়েছেন?</span>
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-none py-2 px-4 flex gap-1.5 shrink-0 z-20">
        {[
          { id: 'all', label: 'সব ফলাফল', count: results.length, icon: Compass },
          { id: 'people', label: '👥 মানুষ', count: peopleResults.length, icon: User },
          { id: 'institutions', label: '🏢 প্রতিষ্ঠান', count: institutionsResults.length, icon: Building2 },
          { id: 'services', label: '🛠️ সেবা', count: servicesResults.length, icon: Compass },
          { id: 'posts', label: '📰 পোস্ট', count: postsResults.length, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer border ${
                isActive 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200/60 flex gap-4 items-start animate-pulse">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    <div className="h-2 w-full bg-slate-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <AlertCircle size={28} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
            <p className="text-xs font-bold text-slate-400 max-w-xs mt-1 leading-relaxed">
              দুঃখিত, “{localQuery}” এর সাথে সামঞ্জস্যপূর্ণ কোনো তথ্য পাওয়া যায়নি। সঠিক বানান বা ভিন্ন শব্দ লিখে চেষ্টা করুন।
            </p>

            {/* Popular Searches Suggestion Section */}
            <div className="mt-8 w-full max-w-md bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3 px-1 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-600" />
                <span>জনপ্রিয় অনুসন্ধান করুন</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSuggestionClick(chip)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 rounded-full text-xs font-extrabold transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Subtitle */}
            <div className="px-1 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                {activeTab === 'all' ? 'সকল ফলাফল তালিকা' : `${activeTab.toUpperCase()} তালিকা`} ({filteredResults.length})
              </span>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
              {filteredResults.map((item) => {
                const isPerson = item.superCategory === 'people';
                const isPost = item.superCategory === 'posts';
                const isInst = item.superCategory === 'institutions';

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onItemClick(item)}
                    className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex gap-4 items-start relative overflow-hidden"
                  >
                    {/* Category indicator strip */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                      isPerson ? 'bg-indigo-500' : isPost ? 'bg-amber-500' : isInst ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />

                    {/* Image / Icon container */}
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center border ${
                        isPerson ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                        isPost ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        isInst ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}>
                        {isPerson ? <User size={22} /> : isPost ? <FileText size={22} /> : isInst ? <Building2 size={22} /> : <Compass size={22} />}
                      </div>
                    )}

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${
                          isPerson ? 'bg-indigo-100 text-indigo-700' :
                          isPost ? 'bg-amber-100 text-amber-700' :
                          isInst ? 'bg-rose-100 text-rose-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isPerson ? 'মানুষ / পেশা' : isPost ? 'পোস্ট ও খবর' : isInst ? 'প্রতিষ্ঠান' : 'সেবা / তথ্য'}
                        </span>
                        {item.category && (
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1 py-0.2 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-emerald-700 transition-colors mt-1.5">
                        {item.title}
                      </h4>
                      
                      <p className="text-[11px] font-bold text-slate-400 line-clamp-2 mt-1 leading-normal">
                        {item.description}
                      </p>

                      {/* Phone / Location footer */}
                      {(item.phone || item.location) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                          {item.location && (
                            <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-0.5">
                              <MapPin size={10} className="text-slate-400" />
                              <span className="truncate max-w-[120px]">{item.location}</span>
                            </span>
                          )}
                          {item.phone && (
                            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-0.5">
                              <Phone size={10} className="text-emerald-500" />
                              <span>{item.phone}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchResults;

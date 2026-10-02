import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Database, 
  Sliders, 
  MapPin, 
  Mic, 
  MicOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Cpu, 
  FileText, 
  Tag, 
  TrendingUp, 
  History, 
  Settings, 
  Activity,
  ArrowRight,
  Layers,
  SearchCode,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  universalSearchService, 
  MeilisearchConfig, 
  SearchFilterState, 
  UniversalSearchResultItem, 
  PUTHIA_AREAS, 
  SEARCH_CATEGORIES,
  VoiceSearchIntentResult
} from '../../services/universalSearchService';
import { useNavigate } from 'react-router-dom';

export const SearchManagementHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'meilisearch' | 'global' | 'filter' | 'area' | 'voice'>('overview');

  // Search Simulator State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilterState>({
    category: 'all',
    area: 'all',
    sortBy: 'relevance',
    verifiedOnly: false,
    featuredOnly: false,
    availableNowOnly: false
  });
  const [searchResults, setSearchResults] = useState<{ items: UniversalSearchResultItem[]; totalCount: number; tookMs: number }>({
    items: [],
    totalCount: 0,
    tookMs: 0
  });

  // Meilisearch Configuration State
  const [meiliConfig, setMeiliConfig] = useState<MeilisearchConfig>(universalSearchService.getMeiliConfig());
  const [isReindexing, setIsReindexing] = useState(false);
  const [customSynonymKey, setCustomSynonymKey] = useState('');
  const [customSynonymValues, setCustomSynonymValues] = useState('');

  // Voice Search Test State
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceSearchIntentResult | null>(null);

  // Search History
  const [historyList, setHistoryList] = useState(universalSearchService.getSearchHistory());

  // Execute Search
  useEffect(() => {
    const res = universalSearchService.searchUniversal(searchQuery, filters);
    setSearchResults(res);
  }, [searchQuery, filters]);

  // Handle Meilisearch Index Sync
  const handleTriggerReindex = async () => {
    setIsReindexing(true);
    try {
      const res = await universalSearchService.triggerFullMeiliReindex();
      setMeiliConfig(universalSearchService.getMeiliConfig());
      toast.success(`Meilisearch ইনডেক্স সফলভাবে রি-সিঙ্ক হয়েছে! মোট ${res.indexedCount} টি ডকুমেন্টস প্রসেস হয়েছে (${res.durationMs}ms)`);
    } catch (e) {
      toast.error('ইনডেক্সিং ব্যর্থ হয়েছে।');
    } finally {
      setIsReindexing(false);
    }
  };

  // Add Custom Synonym
  const handleAddSynonym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSynonymKey.trim() || !customSynonymValues.trim()) return;
    const values = customSynonymValues.split(',').map(s => s.trim()).filter(Boolean);
    const updated = {
      ...meiliConfig.synonyms,
      [customSynonymKey.trim()]: values
    };
    const newConf = universalSearchService.updateMeiliConfig({ synonyms: updated });
    setMeiliConfig(newConf);
    setCustomSynonymKey('');
    setCustomSynonymValues('');
    toast.success(`সমার্থক শব্দ যোগ করা হয়েছে: "${customSynonymKey}" -> ${values.join(', ')}`);
  };

  // Voice Search Simulation / Native API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback demo for unsupported browsers
      setIsListening(true);
      toast.info('মাইক্রোফোন চালু হচ্ছে... (বাংলা ভয়েস ডেমো)');
      setTimeout(() => {
        const demoTranscripts = [
          'জরুরি পুঠিয়া থানার ওসি ও ডিউটি অফিসারের নাম্বার দিন',
          'বানেশ্বর বাজারে মিষ্টির দোকান কোথায় আছে',
          'পুঠিয়া রাজবাড়ি ও শিব মন্দির দেখার নিয়ম কি',
          'বেলপুকুর এলাকায় ও পজিটিভ রক্তদাতা দরকার'
        ];
        const randomPick = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
        const parsed = universalSearchService.parseVoiceIntent(randomPick);
        setVoiceResult(parsed);
        setIsListening(false);
        setSearchQuery(parsed.cleanedQuery);
        if (parsed.suggestedArea) {
          setFilters(prev => ({ ...prev, area: parsed.suggestedArea! }));
        }
        toast.success(`ভয়েস রিকগনাইজড: "${parsed.rawTranscript}"`);
      }, 2000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('কথা বলুন... (বাংলা বা ইংলিশ)');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const parsed = universalSearchService.parseVoiceIntent(transcript);
        setVoiceResult(parsed);
        setSearchQuery(parsed.cleanedQuery);
        if (parsed.suggestedArea) {
          setFilters(prev => ({ ...prev, area: parsed.suggestedArea! }));
        }
        toast.success(`শনাক্তকৃত বাক্য: "${transcript}"`);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('ভয়েস ইনপুট নেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      toast.error('ভয়েস রিকগনিশন শুরু করতে সমস্যা হয়েছে।');
    }
  };

  const handleClearHistory = () => {
    universalSearchService.clearSearchHistory();
    setHistoryList([]);
    toast.success('অনুসন্ধান ইতিহাস মুছে ফেলা হয়েছে।');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="w-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-white text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>Meilisearch + AI Voice Search Integration Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              সার্চ ও গ্লোবাল ডিসকভারি হাব (Search Engine)
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl font-medium">
              পুঠিয়া ডিজিটাল সেবার সকল মডিউল, ইউনিয়ন ভিত্তিক এলাকা সার্চ, মেইলিসার্চ ইনডেক্সিং এবং বাংলা ভয়েস রিকগনিশন সিস্টেম কন্ট্রোল।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerReindex}
              disabled={isReindexing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-sm transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-700 ${isReindexing ? 'animate-spin' : ''}`} />
              <span>{isReindexing ? 'ইনডেক্সিং হচ্ছে...' : 'Meilisearch Re-index'}</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-white font-extrabold text-sm transition-all cursor-pointer backdrop-blur-sm active:scale-95"
            >
              <Mic className="w-4 h-4 text-emerald-200" />
              <span>ভয়েস সার্চ টেস্ট</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Protected against squishing on mobile */}
        <div className="w-full flex items-center gap-2.5 overflow-x-auto mt-6 pt-6 border-t border-white/15 pb-2 scrollbar-none no-scrollbar touch-pan-x">
          {[
            { id: 'overview', label: 'সার্চ কন্ট্রোল ওভারভিউ', icon: Activity },
            { id: 'meilisearch', label: 'Meilisearch কনফিগ & ইনডেক্স', icon: Database },
            { id: 'global', label: 'গ্লোবাল সার্চ সিমুলেটর', icon: Search },
            { id: 'filter', label: 'স্মার্ট ফিল্টারিং সিস্টেম', icon: Filter },
            { id: 'area', label: 'এলাকা/ইউনিয়ন ভিত্তিক সার্চ', icon: MapPin },
            { id: 'voice', label: 'বাংলা ভয়েস সার্চ ইঞ্জিন', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shrink-0 flex-shrink-0 min-w-max cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-md font-black'
                    : 'bg-white/15 text-white hover:bg-white/25 font-bold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-emerald-200'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Engine Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">ইনডেক্সড ডকুমেন্টস</div>
                <div className="text-2xl font-black text-slate-800">{meiliConfig.totalDocumentsIndexed} টি</div>
                <div className="text-[11px] text-emerald-600 font-medium">৭টি মডিউল লাইভ সিঙ্ক</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">সার্চ লেটেন্সি (স্পিড)</div>
                <div className="text-2xl font-black text-slate-800">{searchResults.tookMs || 4} ms</div>
                <div className="text-[11px] text-blue-600 font-medium">আল্ট্রা ফাস্ট রেসপন্স</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">কভার্ড এলাকা ও ইউনিয়ন</div>
                <div className="text-2xl font-black text-slate-800">৬ ইউনিয়ন + পৌর</div>
                <div className="text-[11px] text-teal-600 font-medium">১০০% পুঠিয়া উপজেলা</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">ভয়েস এআই সক্ষমতা</div>
                <div className="text-2xl font-black text-slate-800">বাংলা + English</div>
                <div className="text-[11px] text-purple-600 font-medium">স্মার্ট ইনটেন্ট রাউটিং</div>
              </div>
            </div>
          </div>

          {/* Core Architecture Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800">সার্চ ইঞ্জিন আর্কিটেকচার ও লাইভ মডিউল</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Meilisearch v1.6 + Firestore
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'নাগরিক সেবা ক্যাটালগ', count: '৬৩টি সেবা', status: 'Active Sync', icon: 'Building2' },
                  { name: 'ঐতিহাসিক পর্যটন ও রাজবাড়ি', count: '১২টি স্পট', status: 'Active Sync', icon: 'MapPin' },
                  { name: 'ডাক্তার, ফার্মেসি ও হাসপাতাল', count: '৭৪টি রেকর্ড', status: 'Active Sync', icon: 'Stethoscope' },
                  { name: 'জরুরি রক্তদাতা ডিরেক্টরি', count: '৩৫০+ রক্তদাতা', status: 'Active Sync', icon: 'Heart' },
                  { name: 'দোকান, মার্কেট ও ব্যবসা', count: '২১০টি শপ', status: 'Active Sync', icon: 'Store' },
                  { name: 'বাস ও ট্রেন পরিবহন সময়সূচি', count: '২৮টি রুট', status: 'Active Sync', icon: 'Truck' },
                  { name: 'জরুরি পুলিশ ও ফায়ার স্টেশন', count: '১৫টি জরুরি হটলাইন', status: 'Active Sync', icon: 'ShieldAlert' },
                  { name: 'কমিউনিটি আড্ডা ও সোশ্যাল পোস্ট', count: 'লাইভ স্ট্রিমিং', status: 'Auto Index', icon: 'MessageSquare' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.count}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Voice & History Bar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-800">সাম্প্রতিক অনুসন্ধান ইতিহাস</h3>
                  </div>
                  {historyList.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      মুছুন
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {historyList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      কোনো সার্চ ইতিহাস পাওয়া যায়নি।
                    </div>
                  ) : (
                    historyList.slice(0, 8).map((hist, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSearchQuery(hist.query);
                          setActiveTab('global');
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-medium text-slate-700 truncate">{hist.query}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(hist.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                <div className="text-xs font-bold text-emerald-900 mb-1">ভয়েস অনুসন্ধান চালু করুন</div>
                <p className="text-[11px] text-emerald-700 mb-3">মুখে বলে সরাসরি পুঠিয়ার যে কোনো তথ্য খুঁজে বের করুন</p>
                <button
                  onClick={() => setActiveTab('voice')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>ভয়েস সার্চ মোড</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEILISEARCH CONFIG & INDEX MANAGEMENT */}
      {activeTab === 'meilisearch' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <span>Meilisearch ক্লাউড ইনস্ট্যান্স ও ইনডেক্স কনফিগারেশন</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ইনস্ট্যান্স ইউআরএল, API কী, ফিল্টারেবল এট্রিবিউট এবং সমার্থক বাংলা শব্দ (Synonyms) ডিরেক্টরি।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Status: {meiliConfig.healthStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endpoint Config Form */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700">কানেকশন সেটিংস</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instance URL</label>
                  <input
                    type="text"
                    value={meiliConfig.instanceUrl}
                    onChange={(e) => setMeiliConfig({ ...meiliConfig, instanceUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Primary Master Index</label>
                  <input
                    type="text"
                    value={meiliConfig.primaryIndex}
                    onChange={(e) => setMeiliConfig({ ...meiliConfig, primaryIndex: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Public Search API Key</label>
                  <input
                    type="password"
                    value={meiliConfig.searchKey}
                    onChange={(e) => setMeiliConfig({ ...meiliConfig, searchKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-700">র‍্যাংকিং রুলস (Ranking Rules):</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {meiliConfig.rankingRules.join(' → ')}
                  </div>
                </div>
              </div>

              {/* Bangla Synonyms Matrix */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700">বাংলা সমার্থক শব্দ ডিকশনারি (Synonyms Matrix)</h4>
                
                <form onSubmit={handleAddSynonym} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <div className="text-xs font-semibold text-emerald-900">নতুন সমার্থক ম্যাপিং যোগ করুন</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="মূল শব্দ (উদা: ডাক্তার)"
                      value={customSynonymKey}
                      onChange={(e) => setCustomSynonymKey(e.target.value)}
                      className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="সমার্থক শব্দ কমা দিয়ে (চিকিৎসক, doctor)"
                      value={customSynonymValues}
                      onChange={(e) => setCustomSynonymValues(e.target.value)}
                      className="px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    + সমার্থক শব্দ সেভ করুন
                  </button>
                </form>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(meiliConfig.synonyms).map(([word, syns], idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{word}</span>
                        <span className="text-slate-400 mx-1.5">:</span>
                        <span className="text-slate-600">{syns.join(', ')}</span>
                      </div>
                      <Tag className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3 & 4: GLOBAL SEARCH SIMULATOR & FILTERING */}
      {(activeTab === 'global' || activeTab === 'filter' || activeTab === 'area') && (
        <div className="space-y-6">
          {/* Live Search Interactive Console */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-600" />
                  <span>গ্লোবাল সার্চ ও ফিল্টারিং সিমুলেটর</span>
                </h3>
                <p className="text-xs text-slate-500">
                  রিয়েল-টাইম কিওয়ার্ড, এলাকা এবং ক্যাটাগরি অনুসারে ফলাফল অনুসন্ধান করুন।
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                ফলাফল: <span className="font-bold text-emerald-700">{searchResults.totalCount} টি</span> ({searchResults.tookMs} ms)
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="পুঠিয়া রাজবাড়ি, বানেশ্বর মিষ্টি, জরুরি ডাক্তার, রক্তদাতা বা থানা পুলিশ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-xl transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  title="ভয়েস সার্চ"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="space-y-3 pt-2">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SEARCH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters({ ...filters, category: cat.id })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      filters.category === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Area & Sorting Selectors */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <select
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PUTHIA_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="relevance">প্রাসঙ্গিকতা (Relevance)</option>
                    <option value="rating">সর্বোচ্চ রেটিং</option>
                    <option value="name_asc">নাম অনুসারে (ক-হ)</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ভেরিফাইড শুধু</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.featuredOnly}
                    onChange={(e) => setFilters({ ...filters, featuredOnly: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ফিচার্ড শুধু</span>
                </label>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {searchResults.items.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <SearchCode className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-600">কোনো তথ্য পাওয়া যায়নি</div>
                  <p className="text-xs text-slate-400">অন্য কোনো কিওয়ার্ড বা ফিল্টার দিয়ে চেষ্টা করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {item.categoryLabel}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{item.title}</h4>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {item.area}
                          </span>
                          {item.phone && (
                            <span className="font-mono text-slate-700">📞 {item.phone}</span>
                          )}
                          {item.rating && (
                            <span className="text-amber-600 font-bold">★ {item.rating}</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-600 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => navigate(item.routeUrl)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <span>বিস্তারিত</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VOICE SEARCH ENGINE & TESTER */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce text-red-500' : ''}`} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">
                বাংলা ভয়েস সার্চ রিকগনিশন ইঞ্জিন
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                বাংলা বাক্য প্রসেস করে পুঠিয়ার ইউনিয়ন ও নির্দিষ্ট সরকারি/জরুরি সার্ভিসে স্বয়ংক্রিয়ভাবে নেভিগেট করার এআই ইঞ্জিন।
              </p>
            </div>

            {/* Mic Activation Button */}
            <div>
              <button
                onClick={handleToggleVoice}
                className={`px-8 py-4 rounded-3xl font-extrabold text-base transition-all shadow-xl flex items-center gap-3 mx-auto ${
                  isListening
                    ? 'bg-red-500 text-white scale-110 shadow-red-500/30 ring-4 ring-red-200 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                <span>{isListening ? 'শুনছি... কথা বলুন' : 'ভয়েস সার্চ চালু করুন'}</span>
              </button>
            </div>

            {/* Voice Result Feedback Box */}
            {voiceResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    শনাক্তকৃত ফলাফল (Voice Intent)
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Confidence: {(voiceResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold">আপনার বক্তব্য:</div>
                  <div className="text-sm font-bold text-slate-800">“{voiceResult.rawTranscript}”</div>
                </div>

                <div className="text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>{voiceResult.banglaVoiceFeedback}</span>
                </div>

                {voiceResult.suggestedArea && (
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শনাক্তকৃত এলাকা: <strong>{voiceResult.suggestedArea}</strong></span>
                  </div>
                )}

                <button
                  onClick={() => navigate(voiceResult.targetRoute)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>সরাসরি পেজে যান ({voiceResult.targetRoute})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Sample Bangla Voice Commands */}
            <div className="text-left pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-3">উদাহরণ ভয়েস কমান্ডসমূহ:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  '“পুঠিয়া রাজবাড়ি ও শিব মন্দির দেখার তথ্য”',
                  '“বানেশ্বর বাজারে মিষ্টির দোকান কোথায়”',
                  '“জরুরি পুঠিয়া থানার ওসির সাথে কথা বলতে চাই”',
                  '“উপজেলা স্বাস্থ্য কমপ্লেক্সের ডাক্তার তালিকা”',
                  '“বেলপুকুরিয়া ইউনিয়নে জরুরি রক্তদাতা লাগবে”',
                  '“ঢাকা টু পুঠিয়া বাসের টিকিট কাউন্টার”'
                ].map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const parsed = universalSearchService.parseVoiceIntent(sample.replace(/[“”]/g, ''));
                      setVoiceResult(parsed);
                      setSearchQuery(parsed.cleanedQuery);
                      if (parsed.suggestedArea) {
                        setFilters(prev => ({ ...prev, area: parsed.suggestedArea! }));
                      }
                      toast.info(`উদাহরণ কমান্ড টেস্ট করা হলো: ${sample}`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <span>{sample}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchManagementHub;

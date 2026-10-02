import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Clock, Sparkles, ChevronRight, Stethoscope, PhoneCall, MapPin, Store, Newspaper, ArrowUpRight, Trash2, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logSearchEvent } from "../../api";
import { auth } from "../../firebase";
import { 
  smartSearchMatch, 
  getRecentSearches, 
  saveRecentSearch, 
  clearRecentSearches 
} from "../../utils/searchUtils";

interface QuickSuggestion {
  title: string;
  category: string;
  type: 'doctor' | 'emergency' | 'place' | 'business' | 'news';
  path: string;
  icon: any;
}

const QUICK_SEARCH_DATABASE: QuickSuggestion[] = [
  { title: "অ্যাম্বুলেন্স ও ইমার্জেন্সি", category: "জরুরি সেবা", type: "emergency", path: "/emergency", icon: PhoneCall },
  { title: "পুঠিয়া মডেল থানা", category: "জরুরি সেবা", type: "emergency", path: "/emergency", icon: PhoneCall },
  { title: "ফায়ার সার্ভিস পুঠিয়া", category: "জরুরি সেবা", type: "emergency", path: "/emergency", icon: PhoneCall },
  { title: "পুঠিয়া রাজবাড়ী ও মন্দির কমপ্লেক্স", category: "দর্শনীয় স্থান", type: "place", path: "/important-places", icon: MapPin },
  { title: "শিবা মন্দির ও শিব দীঘি", category: "দর্শনীয় স্থান", type: "place", path: "/important-places", icon: MapPin },
  { title: "বানেশ্বর হাট ও আম বাজার", category: "ব্যবসা ও হাট", type: "business", path: "/local-services", icon: Store },
  { title: "উপজেলা স্বাস্থ্য কমপ্লেক্স ডাক্তারগণ", category: "স্বাস্থ্য সেবা", type: "doctor", path: "/doctors", icon: Stethoscope },
  { title: "মেডিসিন ও শিশু রোগ বিশেষজ্ঞ", category: "স্বাস্থ্য সেবা", type: "doctor", path: "/doctors", icon: Stethoscope },
  { title: "রক্তদাতা তালিকা (ব্লাড ব্যাংক)", category: "জরুরি সেবা", type: "emergency", path: "/blood-donor", icon: PhoneCall },
  { title: "বানেশ্বর সুপার মার্কেট", category: "ব্যবসা ডিরেক্টরি", type: "business", path: "/local-services", icon: Store },
  { title: "ভূমি অফিস ও খতিয়ান সেবা", category: "সরকারি সেবা", type: "place", path: "/land-services", icon: MapPin },
];

const HomeSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<QuickSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const matches = QUICK_SEARCH_DATABASE.filter((item) => 
      smartSearchMatch(item.title, query) || smartSearchMatch(item.category, query)
    );
    setFilteredSuggestions(matches.slice(0, 5));
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startVoiceSearch = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("আপনার ব্রাউজারে ভয়েস সার্চ সাপোর্ট করে না।");
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    try {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "bn-BD";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setQuery(transcript);

        // Check if the user finished speaking (isFinal is true for the last result)
        if (event.results[0].isFinal) {
          setIsListening(false);
          recognition.stop();
          if (transcript.trim()) {
            executeSearch(transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Voice recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError("মাইক্রোফোনের পারমিশন দিন।");
        } else {
          setVoiceError("ভয়েস চিনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
        setTimeout(() => setVoiceError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Fallback: If listening ends, and we have a query, wait a moment then search
        setTimeout(() => {
          setQuery((currentQuery) => {
             if (currentQuery.trim() && document.activeElement !== searchContainerRef.current?.querySelector('input')) {
                executeSearch(currentQuery);
             }
             return currentQuery;
          });
        }, 500);
      };

      recognition.start();
    } catch (err) {
      console.error("Voice search start error:", err);
      setIsListening(false);
    }
  };

  const executeSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = saveRecentSearch(searchTerm);
    setRecentSearches(updated);
    logSearchEvent(searchTerm, auth.currentUser?.uid);
    setIsFocused(false);
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <section className="w-full px-4 py-1 bg-white relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div ref={searchContainerRef} className="relative w-full text-left">
            <motion.form 
              onSubmit={handleFormSubmit} 
              className="relative w-full group"
              animate={{ 
                scale: isFocused ? 1.01 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="absolute inset-y-0 left-3 sm:left-3.5 flex items-center pointer-events-none z-10">
                <motion.div
                  animate={{ 
                    scale: isFocused ? 1.15 : 1,
                    rotate: isFocused ? -8 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} strokeWidth={2} />
                </motion.div>
              </div>

              <input
                type="text"
                value={query || ""}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? "বলুন, আমরা শুনছি..." : "আপনি কি খুঁজছেন? (যেমন: হাসপাতাল, স্কুল, দোকান...)"}
                className={`w-full h-8.5 sm:h-9.5 bg-slate-50/80 border ${isListening ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-500/20'} rounded-full pl-9 sm:pl-10 pr-14 text-xs font-medium text-slate-800 placeholder:text-[11px] sm:placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 transition-all duration-200 shadow-2xs outline-none`}
              />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                {/* Clear button */}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}

                {/* Voice Search Button */}
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse shadow-md"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  }`}
                  title={isListening ? "ভয়েস রেকর্ডিং থামান" : "ভয়েস সার্চ করুন"}
                >
                  <Mic size={14} className={isListening ? "animate-bounce" : ""} strokeWidth={2} />
                </button>
              </div>
            </motion.form>

            {/* Voice Error Message */}
            {voiceError && (
              <div className="mt-1 text-[11px] text-rose-600 font-medium px-3 flex items-center gap-1">
                <span>⚠️ {voiceError}</span>
              </div>
            )}

            {/* Voice Assistant Overlay */}
            <AnimatePresence>
              {isListening && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent"></div>
                        
                        <div className="mb-6 relative flex justify-center z-10">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50"
                            >
                                <Mic className="w-10 h-10 text-emerald-600" />
                            </motion.div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 relative z-10">বলুন, আমি শুনছি...</h3>
                        <p className="text-slate-500 text-sm mb-8 relative z-10">
                           {query ? `"${query}"` : "যেমন: পুঠিয়ায় ভালো রেস্টুরেন্ট কোথায়?"}
                        </p>
                        
                        <div className="flex gap-2 justify-center mb-8 relative z-10">
                            {[1, 2, 3, 4, 5].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ height: [12, 32, 12] }}
                                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                                    className="w-1.5 bg-emerald-500 rounded-full"
                                />
                            ))}
                        </div>

                        <button 
                            onClick={() => {
                              setIsListening(false);
                              if (recognitionRef.current) recognitionRef.current.stop();
                            }}
                            className="px-6 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full font-bold text-sm transition-colors relative z-10"
                        >
                            বন্ধ করুন
                        </button>
                    </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Dropdown Preview & Recent Searches */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-[380px] overflow-y-auto"
                >
                  {/* Live Suggestions matching query */}
                  {query.trim() !== "" && (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} className="text-emerald-600" />
                        <span>সরাসরি ফলাফল ({filteredSuggestions.length})</span>
                      </div>
                      
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                saveRecentSearch(item.title);
                                navigate(item.path);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors text-left group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                                  <Icon size={16} strokeWidth={2.2} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-800 truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400">
                                    {item.category}
                                  </div>
                                </div>
                              </div>
                              <ArrowUpRight size={15} className="text-slate-300 group-hover:text-emerald-600 shrink-0" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs font-bold text-slate-400">
                          "{query}" সম্পর্কিত কোনো সরাসরি ড্রপডাউন পরামর্শ পাওয়া যায়নি। ইন্টার চাপুন।
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {query.trim() === "" && recentSearches.length > 0 && (
                    <div className="p-3">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={12} />
                          <span>সাম্প্রতিক অনুসন্ধান</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearRecent}
                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 size={11} />
                          <span>মুছুন</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((item, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setQuery(item);
                              executeSearch(item);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches Chips */}
                  <div className="p-3 bg-slate-50/70">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2 px-1">
                      🔥 জনপ্রিয় অনুসন্ধান
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "ডাক্তার তালিকা",
                        "জরুরী হটলাইন",
                        "পুঠিয়া রাজবাড়ী",
                        "ব্যবসা ডিরেক্টরি",
                        "রক্তদাতা",
                        "বাস সময়সূচী"
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setQuery(chip);
                            executeSearch(chip);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-800 rounded-full text-[11px] font-extrabold transition-all shadow-2xs cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeSearch;


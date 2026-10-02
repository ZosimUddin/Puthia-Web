import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  BarChart3,
  ChevronRight,
  ArrowRight,
  Info,
  ThumbsUp,
  Send,
  Vote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

interface ParticipationItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: string;
  author?: string;
  type: 'complaint' | 'feedback' | 'review' | 'poll';
  rating?: number;
}

const TABS = [
  { id: 'complaint', label: 'অভিযোগ করুন', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'feedback', label: 'মতামত দিন', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'review', label: 'রিভিউ', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'poll', label: 'ভোট/জরিপ', icon: Vote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export const CitizenParticipationTabsSection = memo(() => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [items, setItems] = useState<ParticipationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    let q;
    
    // Attempt to fetch real data based on active tab
    if (activeTab === 'complaint') {
      q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(4));
    } else if (activeTab === 'feedback') {
      q = query(collection(db, "community_posts"), where("type", "==", "feedback"), limit(4));
    } else if (activeTab === 'review') {
      q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(4));
    } else if (activeTab === 'poll') {
      q = query(collection(db, "polls"), where("status", "==", "active"), limit(4));
    }

    if (!q) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ParticipationItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let item: ParticipationItem;

        if (activeTab === 'complaint') {
          item = {
            id: docSnap.id,
            title: data.title || data.subject || "নামহীন অভিযোগ",
            description: data.description || data.text,
            status: data.status,
            date: data.createdAt?.toDate?.()?.toLocaleDateString('bn-BD'),
            type: 'complaint'
          };
        } else if (activeTab === 'review') {
          item = {
            id: docSnap.id,
            title: data.businessName || "ব্যবসা রিভিউ",
            description: data.comment,
            rating: data.rating,
            author: data.userName,
            type: 'review'
          };
        } else {
          item = {
            id: docSnap.id,
            title: data.title || data.question,
            description: data.description,
            type: activeTab as any
          };
        }
        list.push(item);
      });
      setItems(list);
      setLoading(false);
    }, (error) => {
      console.error(`Error loading ${activeTab}:`, error);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [activeTab]);

  const handleAction = () => {
    switch (activeTab) {
      case 'complaint': navigate('/community?tab=report'); break;
      case 'feedback': navigate('/community'); break;
      case 'review': navigate('/business'); break;
      case 'poll': navigate('/community'); break;
      default: navigate('/community');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12 mb-16" id="citizen-participation-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">নাগরিক অংশগ্রহণ</h2>
            <p className="text-xs font-bold text-rose-600/60 uppercase tracking-widest">নাগরিক অংশগ্রহণ</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all text-sm font-black border cursor-pointer active:scale-95 leading-normal ${
                activeTab === tab.id 
                  ? `${tab.bg} ${tab.color} border-rose-300 shadow-md` 
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={16} strokeWidth={2.5} className="shrink-0" />
              <span className="leading-snug">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-[#FFF9F9] rounded-[40px] border border-rose-100/50 p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-rose-50/50 animate-pulse rounded-3xl" />
                  ))}
                </motion.div>
              ) : items.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center"
                >
                  <div className="w-16 h-16 bg-rose-50 text-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} />
                  </div>
                  <p className="text-rose-900/40 font-black mb-6">এই মুহূর্তে কোনো তথ্য পাওয়া যায়নি</p>
                  <button 
                    onClick={handleAction}
                    className="px-6 h-12 min-h-[48px] bg-white border-2 border-rose-100 text-rose-600 font-black rounded-[16px] hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 mx-auto text-[16px]"
                  >
                    নতুন যোগ করুন <Send size={20} />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-5 rounded-[32px] bg-white border border-rose-50 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {item.status && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              {item.status}
                            </span>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} className={i < (item.rating || 0) ? "text-emerald-500 fill-current" : "text-slate-200"} />
                              ))}
                            </div>
                          )}
                          {item.author && <span className="text-[10px] font-bold text-slate-400">@ {item.author}</span>}
                        </div>
                        <h3 className="text-sm md:text-base font-black text-slate-900 line-clamp-1 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} strokeWidth={3} />
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleAction}
                      className="w-full h-12 min-h-[48px] bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[16px] shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] text-[16px]"
                    >
                      আপনার মতামত দিন <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] border border-rose-100/50 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-xl">🤝</span> সহযোগিতা
            </h3>
            
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100/50 group hover:bg-emerald-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    <ThumbsUp size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">স্বেচ্ছাসেবী হন</h4>
                    <p className="text-[11px] font-medium text-slate-500">শহরের উন্নয়নে আমাদের সাথে কাজ করুন</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100/50 group hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">জরিপে অংশ নিন</h4>
                    <p className="text-[11px] font-medium text-slate-500">আপনার গুরুত্বপূর্ণ মতামত আমাদের জানান</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-rose-600 rounded-[32px] text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h4 className="text-base font-black mb-2 relative z-10">অভিযোগ কেন্দ্র</h4>
              <p className="text-[11px] text-rose-50/80 mb-4 relative z-10 leading-relaxed">
                পৌরসভার কোনো সমস্যা বা অসঙ্গতি নিয়ে দ্রুত অভিযোগ দাখিল করুন।
              </p>
              <button 
                onClick={() => navigate('/community?tab=report')}
                className="w-full h-12 min-h-[48px] bg-white text-rose-600 font-black text-[16px] rounded-[16px] relative z-10 hover:bg-rose-50 transition-colors"
              >
                এখনই অভিযোগ করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

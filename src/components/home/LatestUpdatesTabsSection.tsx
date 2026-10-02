import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Newspaper, 
  Bell, 
  Calendar, 
  Gavel, 
  Briefcase,
  ChevronRight,
  Clock,
  ArrowRight,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

interface UpdateItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  imageUrl?: string;
  link?: string;
  type: 'news' | 'notice' | 'event' | 'tender' | 'job';
}

const TABS = [
  { id: 'news', label: 'সর্বশেষ খবর', icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'notice', label: 'নোটিশ', icon: Bell, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'event', label: 'ইভেন্ট', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'tender', label: 'টেন্ডার', icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'job', label: 'চাকরির খবর', icon: Briefcase, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export const LatestUpdatesTabsSection = memo(() => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    let q;
    
    if (activeTab === 'news') {
      q = query(collection(db, "user_posts"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(5));
    } else if (activeTab === 'notice') {
      q = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(5));
    } else if (activeTab === 'event') {
      q = query(collection(db, "social_events"), orderBy("createdAt", "desc"), limit(5));
    } else if (activeTab === 'tender') {
      q = query(collection(db, "notices"), where("category", "==", "tender"), orderBy("createdAt", "desc"), limit(5));
    } else if (activeTab === 'job') {
      q = query(collection(db, "notices"), where("category", "==", "job"), orderBy("createdAt", "desc"), limit(5));
    }

    if (!q) return;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UpdateItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let item: UpdateItem;

        if (activeTab === 'news') {
          item = {
            id: docSnap.id,
            title: data.text?.substring(0, 60) + (data.text?.length > 60 ? "..." : ""),
            description: data.text,
            date: data.createdAt?.toDate?.() ? data.createdAt.toDate().toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD'),
            imageUrl: data.imageUrl,
            type: 'news'
          };
        } else if (activeTab === 'event') {
          item = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            date: data.eventDate || data.createdAt?.toDate?.()?.toLocaleDateString('bn-BD'),
            type: 'event'
          };
        } else {
          item = {
            id: docSnap.id,
            title: data.title || data.text?.substring(0, 50),
            description: data.text || data.content,
            date: data.createdAt?.toDate?.() ? data.createdAt.toDate().toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD'),
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

  const handleSeeAll = () => {
    switch (activeTab) {
      case 'news': navigate('/news'); break;
      case 'notice': navigate('/notice'); break;
      case 'event': navigate('/events'); break;
      case 'tender': navigate('/notice?category=tender'); break;
      case 'job': navigate('/notice?category=job'); break;
      default: navigate('/notice');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12 mb-16" id="latest-updates-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-950 tracking-tight">সর্বশেষ আপডেট</h2>
            <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest">পুঠিয়ার সর্বশেষ আপডেট</p>
          </div>
        </div>

        {/* Tab Switcher - Mobile Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all text-sm font-black border cursor-pointer active:scale-95 leading-normal ${
                activeTab === tab.id 
                  ? `${tab.bg} ${tab.color} border-emerald-300 shadow-md` 
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
          <div className="bg-[#F8FFFB] rounded-[40px] border border-emerald-100/50 p-6 md:p-8 shadow-sm">
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
                    <div key={i} className="h-24 bg-emerald-50/50 animate-pulse rounded-3xl" />
                  ))}
                </motion.div>
              ) : items.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} />
                  </div>
                  <p className="text-emerald-900/40 font-black">এই মুহূর্তে কোনো তথ্য পাওয়া যায়নি</p>
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
                      className="group flex flex-col sm:flex-row gap-4 p-4 rounded-[16px] bg-white border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(item.type === 'news' ? '/news' : '/notice')}
                    >
                      {item.imageUrl ? (
                        <div className="w-full sm:w-24 h-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-emerald-50">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className={`w-full sm:w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-50 ${TABS.find(t => t.id === activeTab)?.bg || 'bg-emerald-50'}`}>
                          {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Newspaper, { size: 32, className: TABS.find(t => t.id === activeTab)?.color || 'text-emerald-600' })}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[14px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${TABS.find(t => t.id === activeTab)?.bg} ${TABS.find(t => t.id === activeTab)?.color}`}>
                            {TABS.find(t => t.id === activeTab)?.label}
                          </span>
                          <span className="flex items-center gap-1 text-[14px] font-bold text-slate-400">
                            <Clock size={10} /> {item.date}
                          </span>
                        </div>
                        <h3 className="text-[18px] font-black text-emerald-950 line-clamp-2 leading-snug mb-1 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[16px] font-medium text-slate-500 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="hidden sm:flex items-center justify-center w-10 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <ChevronRight size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
 
            <div className="mt-8">
              <button 
                onClick={handleSeeAll}
                className="w-full h-12 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[16px] shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-[16px]"
              >
                সব দেখুন <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info - Quick Stats or Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] border border-emerald-100/50 p-8 shadow-sm">
            <h3 className="text-lg font-black text-emerald-950 mb-6 flex items-center gap-2">
              <span className="text-xl">📊</span> এক নজরে পুঠিয়া
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-blue-50/50 border border-blue-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Newspaper size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-800/60 uppercase">আজকের খবর</p>
                    <p className="text-lg font-black text-blue-950">০৫+</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-amber-50/50 border border-amber-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-800/60 uppercase">সক্রিয় নোটিশ</p>
                    <p className="text-lg font-black text-amber-950">১২</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-purple-50/50 border border-purple-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-800/60 uppercase">আসন্ন ইভেন্ট</p>
                    <p className="text-lg font-black text-purple-950">০৩</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-emerald-950 rounded-[32px] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 blur-3xl rounded-full" />
              <h4 className="text-base font-black mb-2 relative z-10">আপনার খবর জানান</h4>
              <p className="text-[11px] text-emerald-100/70 mb-4 relative z-10 leading-relaxed">
                আপনার এলাকার খবর বা কোনো সমস্যার কথা আমাদের জানাতে পারেন।
              </p>
              <button 
                onClick={() => navigate('/community')}
                className="w-full py-3 bg-white text-emerald-950 font-black text-xs rounded-2xl relative z-10 hover:bg-emerald-50 transition-colors"
              >
                রিপোর্ট করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

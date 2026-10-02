import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Star, 
  Tag, 
  Megaphone,
  ChevronRight,
  Phone,
  MapPin,
  ArrowRight,
  Info,
  TrendingUp,
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

interface BusinessItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  rating?: number;
  phone?: string;
  type: 'popular' | 'new' | 'offer' | 'ad';
  link?: string;
}

const TABS = [
  { id: 'popular', label: 'জনপ্রিয় ব্যবসা', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'new', label: 'নতুন ব্যবসা', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'offer', label: 'অফার', icon: Tag, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'ad', label: 'বিজ্ঞাপন', icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
];

export const BusinessServicesTabsSection = memo(() => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    let q;
    
    if (activeTab === 'popular') {
      q = query(collection(db, "businesses"), where("status", "==", "approved"), where("isFeatured", "==", true), limit(6));
    } else if (activeTab === 'new') {
      q = query(collection(db, "businesses"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(6));
    } else if (activeTab === 'offer') {
      q = query(collection(db, "special_offers"), limit(6));
    } else if (activeTab === 'ad') {
      q = query(collection(db, "ads"), orderBy("order", "asc"), limit(6));
    }

    if (!q) return;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: BusinessItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let item: BusinessItem;

        if (activeTab === 'popular' || activeTab === 'new') {
          item = {
            id: docSnap.id,
            title: data.name || data.title,
            description: data.description,
            category: data.category,
            imageUrl: data.logoUrl || data.imageUrl,
            rating: data.rating || 4.5,
            phone: data.phone,
            type: activeTab as any
          };
        } else if (activeTab === 'offer') {
          item = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            category: data.category,
            type: 'offer'
          };
        } else {
          item = {
            id: docSnap.id,
            title: data.title,
            imageUrl: data.imageUrl,
            link: data.link,
            type: 'ad'
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
      case 'popular':
      case 'new': navigate('/business'); break;
      case 'offer': navigate('/business'); break;
      case 'ad': navigate('/business'); break;
      default: navigate('/business');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12 mb-16" id="business-services-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">ব্যবসা ও সেবা</h2>
            <p className="text-xs font-bold text-amber-600/60 uppercase tracking-widest">ব্যবসা এবং সেবা</p>
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
                  ? `${tab.bg} ${tab.color} border-amber-300 shadow-md` 
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={16} strokeWidth={2.5} className="shrink-0" />
              <span className="leading-snug">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#FFFCF8] rounded-[40px] border border-amber-100/50 p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="min-h-64 bg-amber-50/30 animate-pulse rounded-[32px]" />
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
              <div className="w-16 h-16 bg-amber-50 text-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info size={32} />
              </div>
              <p className="text-amber-900/40 font-black">এই মুহূর্তে কোনো তথ্য পাওয়া যায়নি</p>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[32px] overflow-hidden border border-amber-100/50 hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() => {
                    if (item.type === 'ad' && item.link) {
                      window.open(item.link, '_blank');
                    } else {
                      navigate('/business');
                    }
                  }}
                >
                  <div className="relative min-h-[160px] overflow-hidden">
                    <img 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    {item.rating && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-amber-500 fill-current" />
                        <span className="text-[10px] font-black text-slate-800">{item.rating}</span>
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${TABS.find(t => t.id === activeTab)?.bg} ${TABS.find(t => t.id === activeTab)?.color}`}>
                      {TABS.find(t => t.id === activeTab)?.label}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      {item.category && (
                        <p className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                          {item.category}
                        </p>
                      )}
                      <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-2 h-[2.5rem] mb-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 flex flex-col gap-2.5 border-t border-slate-50">
                      {item.phone ? (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400">
                          <Phone size={11} /> {item.phone}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400">
                          <MapPin size={11} /> পুঠিয়া, রাজশাহী
                        </div>
                      )}

                      <button className="w-full h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer">
                        <span>আরও দেখুন</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <button 
            onClick={handleSeeAll}
            className="inline-flex items-center justify-center gap-1 px-6 h-12 min-h-[48px] bg-amber-500 hover:bg-amber-600 text-white font-black rounded-[16px] shadow-lg shadow-amber-100 transition-all hover:scale-[1.05] active:scale-95 group text-[16px] cursor-pointer"
          >
            সব দেখুন <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
});

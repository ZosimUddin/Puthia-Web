import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  Star, 
  Store, 
  Stethoscope, 
  Droplet, 
  Building2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export const QuickWidgetsSection: React.FC = () => {
  const navigate = useNavigate();
  const [featuredBusiness, setFeaturedBusiness] = useState<any>({
    name: "বানেশ্বর সুপার মার্কেট ও সার্ভিস",
    category: "শপিং ও ইলেকট্রনিক্স",
    rating: 4.9,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    id: "default-featured"
  });

  const [openCount, setOpenCount] = useState<number>(123);
  const [closedCount, setClosedCount] = useState<number>(17);

  useEffect(() => {
    // Try to fetch a top-rated featured business from firestore if available
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "businesses"), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setFeaturedBusiness({
            id: snap.docs[0].id,
            name: docData.title || docData.name || "পুঠিয়া মডেল শপিং সেন্টার",
            category: docData.category || "ব্যবসা প্রতিষ্ঠান",
            rating: docData.rating || 4.8,
            reviews: docData.reviews || 42,
            image: docData.image || docData.images?.[0] || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
          });
        }
      } catch (err) {
        // Fallback initialized in state
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 space-y-3">
      {/* Grid: Trending Now + Featured Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        
        {/* 🔥 Trending Now (আজ সবচেয়ে বেশি দেখা) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                  <Flame size={18} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    🔥 আজ সবচেয়ে বেশি দেখা
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500">জনপ্রিয় সেবা ও ডিরেক্টরি</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                ট্রেন্ডিং
              </span>
            </div>

            {/* Trending Items List */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { 
                  title: "ডাক্তার তালিকা", 
                  subtitle: "স্পেশালিস্ট", 
                  icon: Stethoscope, 
                  color: "text-blue-600 bg-blue-50 border-blue-100", 
                  path: "/doctors" 
                },
                { 
                  title: "ব্যবসা ডিরেক্টরি", 
                  subtitle: "শপ ও প্রতিষ্ঠান", 
                  icon: Store, 
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100", 
                  path: "/local-services" 
                },
                { 
                  title: "রক্তদাতা", 
                  subtitle: "জরুরী ব্লাড", 
                  icon: Droplet, 
                  color: "text-rose-600 bg-rose-50 border-rose-100", 
                  path: "/blood-donor" 
                },
              ].map((item, i) => {
                const IconComp = item.icon;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(item.path)}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs text-left flex flex-col items-center text-center justify-between group cursor-pointer transition-all"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 border ${item.color}`}>
                      <IconComp size={18} className="stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      • {item.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.subtitle}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ⭐ Featured Business (আজকের ফিচার ব্যবসা) */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-xs">
                <Star size={18} className="fill-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  ⭐ আজকের ফিচার ব্যবসা
                </h3>
                <p className="text-[11px] font-bold text-slate-500">বিশেষায়িত স্থানীয় প্রতিষ্ঠান</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              দিনের সেরা
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={featuredBusiness.image} 
                alt={featuredBusiness.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate leading-snug">
                  {featuredBusiness.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-slate-500 truncate">
                    {featuredBusiness.category}
                  </span>
                  <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 flex items-center gap-0.5 shrink-0">
                    <Star size={11} className="fill-amber-500 text-amber-500" />
                    {featuredBusiness.rating} ({featuredBusiness.reviews})
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/local-services")}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shrink-0 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>দেখুন</span>
              <ExternalLink size={13} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickWidgetsSection;

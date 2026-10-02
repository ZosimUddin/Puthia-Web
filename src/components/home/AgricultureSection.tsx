import React, { useState, useEffect } from "react";
import {
  Sprout,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Leaf,
  Wheat,
  Bell,
} from "lucide-react";
import { motion } from "motion/react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

import SectionHeader from "./SectionHeader";
import { Skeleton } from "../Skeleton";

import { useNavigate } from "react-router-dom";

const AgricultureSection: React.FC = () => {
  const navigate = useNavigate();
  const [livePrices, setLivePrices] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "market_prices"), orderBy("updatedAt", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          item: data.itemName,
          price: data.price,
          unit: data.unit,
          trend: data.trend || "stable"
        });
      });
      setLivePrices(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching market prices:", error);
      setLoading(false);
    });

    const nq = query(collection(db, "agri_notices"), limit(1));
    const unsubNotices = onSnapshot(nq, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotices(items);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try { unsubscribe(); } catch (_) {}
      }
      if (typeof unsubNotices === 'function') {
        try { unsubNotices(); } catch (_) {}
      }
    };
  }, []);

  const staticPrices = [
    { item: "চাল (মোটা)", price: "৫২.০০", unit: "কেজি", trend: "up" },
    { item: "পেঁয়াজ", price: "১১০.০০", unit: "কেজি", trend: "down" },
    { item: "আলু", price: "৫৫.০০", unit: "কেজি", trend: "stable" },
  ];

  const pricesToDisplay = livePrices.length > 0 ? livePrices : staticPrices;

  return (
    <section className="py-6 px-4 max-w-7xl mx-auto">
      <SectionHeader 
        title="কৃষি ও বাজার"
        subtitle="বাজার দর ও কৃষি আপডেট"
        icon={<Sprout size={24} />}
        buttonText="বিস্তারিত বাজার দর"
        onButtonClick={() => navigate("/agriculture")}
      />
      
      <div className="bg-gradient-to-b from-white to-[#f7fbf5] rounded-[20px] p-4 lg:p-6 border border-slate-100 mt-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Market Prices Card */}
          <div className="lg:w-1/3 bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-300 border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-emerald-50/30 rounded-full blur-3xl group-hover:bg-emerald-100/40 transition-colors" />
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">আজকের বাজার দর</h3>
                <p className="text-[10px] md:text-lg font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                   পুঠিয়া সদর বাজার
                </p>
              </div>
              <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center border border-emerald-100 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform shrink-0">
                <TrendingUp size={20} className="md:w-8 md:h-8" />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[28px] border border-slate-100/50">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 md:w-20 md:h-20 rounded-2xl" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16 rounded-full ml-auto" />
                      <Skeleton className="h-2 w-12 rounded-full ml-auto" />
                    </div>
                  </div>
                ))
              ) : pricesToDisplay.map((price, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-5 md:p-8 bg-slate-50/50 rounded-[16px] border border-slate-100/50 group/item hover:border-emerald-200 hover:bg-white transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-[12px] text-emerald-500 shadow-sm flex items-center justify-center border border-emerald-50 group-hover/item:scale-110 transition-transform shrink-0">
                      <Wheat size={20} className="md:w-8 md:h-8" />
                    </div>
                    <span className="text-sm md:text-2xl font-black text-slate-700 tracking-tight">
                      {price.item}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-base md:text-3xl font-black text-emerald-600 leading-none mb-1">
                      ৳{price.price}
                    </p>
                    <p className="text-[11px] md:text-lg font-bold text-slate-400">
                      প্রতি {price.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/agriculture")}
              className="w-full h-12 md:h-16 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-[16px] font-black text-[16px] md:text-2xl transition-all shadow-md shadow-emerald-600/10 relative z-10 active:scale-95 cursor-pointer flex items-center justify-center"
            >
              সব পণ্যের দাম দেখুন
            </motion.button>
          </div>

          {/* Agriculture Content */}
          <div className="lg:w-2/3 flex flex-col justify-center">
            {loading ? (
              <div className="mb-10 space-y-6">
                <Skeleton className="h-8 w-32 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-full" />
                  <Skeleton className="h-10 w-2/3 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-4/5 rounded-full" />
                </div>
              </div>
            ) : notices.length > 0 ? (
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[10px] md:text-lg font-black uppercase tracking-widest mb-6 border border-amber-100/50 shadow-sm">
                  <Bell size={12} className="animate-bounce md:w-5 md:h-5" /> গুরুত্বপূর্ণ নোটিশ
                </div>
                <h2 className="text-3xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                  {notices[0].title}
                </h2>
                <p className="text-sm md:text-2xl font-bold text-slate-500 mb-10 max-w-xl md:max-w-3xl leading-relaxed">
                  {notices[0].content}
                </p>
              </div>
            ) : (
              <div className="mb-10">
                <h2 className="text-3xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                  কৃষকদের জন্য ডিজিটাল
                  <br />
                  পরামর্শ কেন্দ্র
                </h2>
                <p className="text-sm md:text-2xl font-bold text-slate-500 mb-10 max-w-xl md:max-w-3xl leading-relaxed">
                  উন্নত চাষাবাদ পদ্ধতি, পোকা দমন কৌশল এবং কৃষি কর্মকর্তাদের সাথে সরাসরি যোগাযোগের সুযোগ।
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/agriculture?tab=tips")}
                className="flex items-center gap-4 p-4 md:p-8 bg-white rounded-[16px] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-300 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm border border-emerald-100/50 shrink-0">
                  <Leaf size={20} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="text-base md:text-2xl font-black text-slate-900 mb-1">
                    ফসল ও চাষ পদ্ধতি
                  </h4>
                  <p className="text-[11px] md:text-lg font-bold text-slate-400 uppercase tracking-wider">
                    মৌসুমী ফসলের গাইডলাইন
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/agriculture?tab=officers")}
                className="flex items-center gap-4 p-4 md:p-8 bg-white rounded-[16px] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-300 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-[12px] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm border border-emerald-100/50 shrink-0">
                  <UserCheck size={20} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="text-base md:text-2xl font-black text-slate-900 mb-1">
                    কৃষি কর্মকর্তা
                  </h4>
                  <p className="text-[11px] md:text-lg font-bold text-slate-400 uppercase tracking-wider">
                    পরামর্শ ও যোগাযোগ
                  </p>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgricultureSection;

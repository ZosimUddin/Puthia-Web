import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Tag,
  MapPin,
  ChevronRight,
  Plus,
  Package,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { getMarketplaceItems } from "../../api";
import { MarketplaceItem } from "../../types";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";

import { useNavigate } from "react-router-dom";

const BuySellSection: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getMarketplaceItems();
        setItems(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <SectionHeader
        title="কেনা-বেচা"
        subtitle="ডিজিটাল মার্কেটপ্লেস"
        icon={<ShoppingBag size={24} />}
        buttonText="সব পণ্য"
        onButtonClick={() => navigate("/marketplace")}
      />

      <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="w-[310px] sm:w-[350px] shrink-0 bg-white rounded-[20px] border border-slate-100 p-5 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <Skeleton className="h-[180px] w-full rounded-[20px] mb-5" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <div className="flex justify-between items-center pt-4 mt-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-[12px]" />
                </div>
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full w-full">
            <EmptyState 
              icon={Package} 
              title="কোনো পণ্য নেই" 
              message="বর্তমানে মার্কেটপ্লেসে কোনো পণ্য বিক্রয়ের জন্য পাওয়া যায়নি।" 
            />
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              onClick={() => navigate("/marketplace")}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="w-[310px] sm:w-[350px] h-[390px] shrink-0 snap-start bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-amber-200/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
                <img
                  src={
                    (item.images && item.images[0]) ||
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop&fm=webp"
                  }
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-[16px] text-[14px] font-black text-amber-600 shadow-sm">
                    {(() => {
                      const cond = item.condition || "নতুন";
                      const condLower = cond.toLowerCase();
                      if (condLower === "used" || condLower === "ব্যবহৃত") return "ব্যবহৃত";
                      if (condLower === "new" || condLower === "নতুন") return "নতুন";
                      return cond;
                    })()}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-3 justify-between">
                <div>
                  <h3 className="text-[17px] font-black text-gray-800 mb-1 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[2.6rem]">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-amber-600 tracking-tighter">
                      ৳{item.price.toLocaleString("bn-BD")}
                    </p>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-400">
                      <MapPin size={12} className="text-amber-500" />
                      <span className="truncate max-w-[100px]">
                        {item.location || "পুঠিয়া"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <button className="w-full h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer">
                    <span>আরও দেখুন</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

    </section>
  );
};

export default BuySellSection;

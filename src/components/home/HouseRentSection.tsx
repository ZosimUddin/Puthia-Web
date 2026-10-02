import React, { useState, useEffect } from "react";
import {
  Home,
  Bed,
  Bath,
  Maximize,
  ChevronRight,
  MapPin,
  Heart,
  ArrowRight
} from "lucide-react";
import { getToLetAds } from "../../api";
import { ToLetAd } from "../../types";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";
import { useFavorites } from "../FavoriteContext";

import { useNavigate } from "react-router-dom";

const HouseRentSection: React.FC = () => {
  const navigate = useNavigate();
  const { toggleSave, isSaved } = useFavorites();
  const [ads, setAds] = useState<ToLetAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getToLetAds();
        setAds(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <SectionHeader
        title="টু-লেট"
        subtitle="বাসা ও মেস ভাড়া"
        icon={<Home size={24} />}
        buttonText="সবগুলো টু-লেট"
        onButtonClick={() => navigate("/house-rent")}
      />

      <div className="flex overflow-x-auto gap-6 md:gap-8 pb-4 md:pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="w-[310px] sm:w-[350px] shrink-0 bg-white rounded-[20px] border border-emerald-100/20 p-6 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <Skeleton className="h-[180px] w-full rounded-[20px] mb-5" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-3.5 w-20 rounded-full" />
                <Skeleton className="h-6 w-full rounded-full" />
                <Skeleton className="h-3.5 w-1/2 rounded-full" />
                <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-4">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-10 w-16 rounded-[16px]" />
                </div>
              </div>
            </div>
          ))
        ) : ads.length === 0 ? (
          <div className="col-span-full w-full">
            <EmptyState 
              icon={Home} 
              title="কোনো বিজ্ঞাপন নেই" 
              message="বর্তমানে পুঠিয়াতে কোনো বাসা বা মেস ভাড়ার বিজ্ঞাপন পাওয়া যায়নি।" 
            />
          </div>
        ) : (
          ads.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate("/house-rent")}
              className="w-[310px] sm:w-[350px] h-[410px] shrink-0 snap-start bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-200/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
                <img
                  src={
                    (ad as any).imageUrl ||
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&fm=webp"
                  }
                  alt={ad.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave({
                        id: ad.id,
                        type: 'service',
                        title: ad.title,
                        subtitle: `ভাড়া: ${ad.rent} | অবস্থান: ${ad.location}`,
                        linkId: 'rent_to_let'
                      });
                    }}
                    className={`w-10 h-10 rounded-[14px] transition-all shadow-md flex items-center justify-center border cursor-pointer active:scale-95 ${
                      isSaved(ad.id)
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white/90 backdrop-blur-md text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-white/20"
                    }`}
                  >
                    <Heart size={16} className={isSaved(ad.id) ? "fill-current" : ""} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-emerald-900/80 backdrop-blur-md px-4 py-2 rounded-[14px] text-white shadow-md">
                  <p className="text-[12px] font-black uppercase tracking-widest opacity-70">
                    মাসিক ভাড়া
                  </p>
                  <p className="text-lg font-black tracking-tighter">
                    ৳{ad.rent}
                  </p>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[13px] font-black uppercase tracking-widest border border-emerald-100">
                      {(() => {
                        const cat = ad.category || "বাসা ভাড়া";
                        const catLower = cat.toLowerCase();
                        if (catLower === "house" || catLower === "বাসা") return "বাসা ভাড়া";
                        if (catLower === "mess" || catLower === "মেস") return "মেস ভাড়া";
                        if (catLower === "sublet" || catLower === "সাবলেট") return "সাবলেট";
                        if (catLower === "shop" || catLower === "দোকান") return "দোকান/অফিস";
                        return cat;
                      })()}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-black text-gray-800 mb-1 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[2.6rem]">
                    {ad.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-400">
                    <MapPin size={12} className="text-emerald-400" />
                    <span className="truncate">
                      {ad.location}, {ad.union || "পুঠিয়া"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-auto flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Bed size={13} />
                        <span>{(ad as any).beds || 0} বেড</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={13} />
                        <span>{(ad as any).baths || 0} বাথ</span>
                      </div>
                    </div>
                  </div>

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

export default HouseRentSection;

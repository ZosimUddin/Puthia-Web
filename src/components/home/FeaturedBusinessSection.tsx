import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Star,
  MapPin,
  ChevronRight,
  Heart,
  Phone,
  ShoppingBag,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { getSpecialOffers, getAdCampaigns, incrementAdImpression, incrementAdClick } from "../../api";
import { SpecialOffer, AdCampaign } from "../../api";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import EmptyState from "./EmptyState";
import { Skeleton } from "../Skeleton";
import { useFavorites } from "../FavoriteContext";

import { useNavigate } from "react-router-dom";

const FeaturedBusinessSection: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFollow, isFollowing } = useFavorites();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessesAndSponsored = async () => {
      try {
        const [offers, campaigns] = await Promise.all([
          getSpecialOffers(),
          getAdCampaigns()
        ]);

        const activeSponsored = campaigns.filter(c => c.status === 'active' && c.slotType === 'sponsored_listing');

        // Combine both sources. Place sponsored listings first!
        const combined = [
          ...activeSponsored.map(c => ({
            id: c.id,
            title: c.campaignName,
            description: "পুঠিয়ার একটি বিশেষ স্পনসরড অফার এবং আকর্ষণীয় সেবা। বিস্তারিত দেখতে আরও দেখুন চাপুন।",
            imageUrl: c.imageUrl,
            category: "স্পনসরড সেবা",
            link: c.link,
            isSponsored: true,
            cpc: c.cpc || 5
          })),
          ...offers.map(o => ({
            ...o,
            isSponsored: false
          }))
        ];

        setBusinesses(combined.slice(0, 4));

        // Record impressions for sponsored items
        activeSponsored.forEach(c => {
          incrementAdImpression(c.id).catch(err => console.error("Impression error:", err));
        });

      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessesAndSponsored();
  }, []);

  const handleItemClick = (biz: any) => {
    if (biz.isSponsored) {
      incrementAdClick(biz.id, biz.cpc || 5).catch(err => console.error("Click error:", err));
      window.open(biz.link, "_blank", "noopener,noreferrer");
    } else {
      navigate("/business");
    }
  };

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto w-full bg-gray-50/50 rounded-[20px] my-3 md:my-4">
      <SectionHeader
        title="ব্যবসা ও বাজার"
        subtitle="জনপ্রিয় ও বিশ্বস্ত প্রতিষ্ঠান"
        icon={<ShoppingBag size={24} />}
        count={businesses.length}
        buttonText="সব দেখুন"
        onButtonClick={() => navigate("/business")}
      />

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[20px] overflow-hidden border border-slate-100 p-6 w-[310px] sm:w-[350px] shrink-0 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              <Skeleton className="h-48 w-full rounded-[20px] mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-3.5 w-20 rounded-full" />
                <Skeleton className="h-6 w-full rounded-full" />
                <Skeleton className="h-3.5 w-3/4 rounded-full" />
                <div className="pt-4 border-t border-slate-50 mt-4">
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
                <div className="flex gap-4 mt-6">
                  <Skeleton className="h-12 flex-[2.5] rounded-[16px]" />
                  <Skeleton className="h-12 flex-1 rounded-[16px]" />
                </div>
              </div>
            </div>
          ))
        ) : businesses.length === 0 ? (
          <div className="w-full">
            <EmptyState 
              icon={Briefcase} 
              title="কোনো ফিচারড ব্যবসা নেই" 
              message="বর্তমানে পুঠিয়াতে কোনো সেরা বা ফিচারড ব্যবসায়িক প্রতিষ্ঠান খুঁজে পাওয়া যায়নি।" 
            />
          </div>
        ) : (
          businesses.map((biz, index) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleItemClick(biz)}
              className={`bg-white rounded-[20px] overflow-hidden border shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between w-[310px] sm:w-[350px] h-[400px] shrink-0 snap-start ${
                biz.isSponsored ? "border-amber-200/60 bg-amber-50/5 hover:border-amber-300" : "border-slate-100 hover:border-emerald-200/50"
              }`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={
                    biz.imageUrl ||
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&fm=webp"
                  }
                  alt={biz.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {biz.isSponsored ? (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-3 py-1.5 rounded-[12px] flex items-center gap-1 shadow-md border border-amber-400/30">
                    <Sparkles size={11} className="fill-slate-900" />
                    <span className="text-[10px] font-black uppercase tracking-wider">স্পনসরড</span>
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow({
                          id: biz.id,
                          type: 'business',
                          name: biz.title,
                          category: biz.category || "ব্যবসা",
                          location: "পুঠিয়া বাজার, পুঠিয়া",
                          phone: biz.phone
                        });
                      }}
                      className={`w-10 h-10 rounded-[14px] transition-all shadow-md flex items-center justify-center border cursor-pointer active:scale-95 ${
                        isFollowing(biz.id)
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white/90 backdrop-blur-md text-rose-500 hover:bg-rose-50 hover:text-rose-600 border-white/20"
                      }`}
                    >
                      <Heart size={16} className={isFollowing(biz.id) ? "fill-current" : ""} />
                    </button>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[12px] flex items-center gap-1 shadow-sm border border-white/20">
                  <Star size={12} className="text-amber-500 fill-current" />
                  <span className="text-[14px] font-black text-slate-800">
                    {biz.rating || "৪.৯"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <p className={`text-[12px] font-black uppercase tracking-[0.2em] mb-1 ${
                    biz.isSponsored ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {biz.category || "ব্যবসা"}
                  </p>
                  <h3 className="text-[17px] font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors tracking-tight line-clamp-1 mb-1">
                    {biz.title}
                  </h3>
                  <p className="text-[13px] font-medium text-slate-500 line-clamp-2 h-[2.5rem] leading-relaxed">
                    {biz.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-400 pt-3 border-t border-slate-100">
                  <MapPin size={12} className="text-emerald-500 shrink-0" />
                  <span className="truncate tracking-tight">পুঠিয়া বাজার, পুঠিয়া</span>
                </div>

                <div className="pt-1">
                  <button className={`w-full h-10 px-4 py-2 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border-none ${
                    biz.isSponsored ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                  }`}>
                    <span>{biz.isSponsored ? "অফারটি দেখুন" : "আরও দেখুন"}</span>
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

export default FeaturedBusinessSection;


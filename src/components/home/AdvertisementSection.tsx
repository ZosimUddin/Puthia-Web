import React, { useState, useEffect } from "react";
import { Megaphone, ExternalLink, ShieldCheck } from "lucide-react";
import { getAds, getAdCampaigns, incrementAdImpression, incrementAdClick } from "../../api";
import { Ad, AdCampaign } from "../../api";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import Skeleton from "./Skeleton";

const AdvertisementSection: React.FC = () => {
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const [oldAds, campaigns] = await Promise.all([
          getAds(),
          getAdCampaigns()
        ]);

        const activeCampaigns = campaigns.filter(c => c.status === 'active' && c.slotType === 'top_banner');
        
        // Combine both sources
        const combined = [
          ...activeCampaigns.map(c => ({
            id: c.id,
            title: c.campaignName,
            imageUrl: c.imageUrl,
            link: c.link,
            isCampaign: true,
            cpc: c.cpc || 8
          })),
          ...oldAds.filter(ad => ad.slotType === 'top_banner').map(ad => ({
            id: ad.id,
            title: ad.title,
            imageUrl: ad.imageUrl,
            link: ad.link,
            isCampaign: false
          }))
        ];

        setActiveAds(combined);

        // Record impressions for campaign ads that are shown
        activeCampaigns.forEach(c => {
          incrementAdImpression(c.id).catch(err => console.error("Error logging impression:", err));
        });

      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleAdClick = (ad: any) => {
    if (ad.isCampaign) {
      incrementAdClick(ad.id, ad.cpc || 8).catch(err => console.error("Error logging click:", err));
    }
  };

  if (!loading && activeAds.length === 0) return null;

  return (
    <section className="py-3 md:py-4 px-4 max-w-7xl mx-auto">
      <SectionHeader 
        title="স্পনসরড বিজ্ঞাপন"
        subtitle="সেরা ডিল এবং অফার"
      />

      <div className="grid grid-cols-1 gap-8 mt-8">
        {loading ? (
          <Skeleton className="h-48 sm:h-64" />
        ) : (
          activeAds.slice(0, 2).map((ad) => (
            <motion.a
              key={ad.id}
              href={ad.link}
              onClick={() => handleAdClick(ad)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              className="relative h-48 sm:h-64 rounded-[16px] overflow-hidden shadow-[0_4px_24px_-4px_rgba(148,163,184,0.08)] hover:shadow-[0_16px_32px_-4px_rgba(16,185,129,0.12)] group block border border-slate-100/80 hover:border-emerald-200/50 transition-all duration-300"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-transparent flex flex-col justify-center px-8 sm:px-12">
                <div className="flex items-center gap-2 text-emerald-400/80 mb-2">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Verified Sponsor
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white mb-4 leading-tight max-w-md">
                  {ad.title}
                </h3>
                <div className="flex">
                  <span className="px-6 py-3 bg-white text-emerald-600 rounded-[12px] font-black text-xs flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95">
                    বিস্তারিত জানুন <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </motion.a>
          ))
        )}
      </div>
    </section>
  );
};

export default AdvertisementSection;


import React, { useState, useEffect } from "react";
import { ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { getAdCampaigns, incrementAdImpression, incrementAdClick, AdCampaign } from "../../api";
import { motion } from "motion/react";

const HomepageAdSection: React.FC = () => {
  const [activeAd, setActiveAd] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageAd = async () => {
      try {
        const campaigns = await getAdCampaigns();
        const activeHomeAds = campaigns.filter(c => c.status === 'active' && c.slotType === 'homepage');
        if (activeHomeAds.length > 0) {
          // Select a random active homepage ad or the first one
          const selected = activeHomeAds[Math.floor(Math.random() * activeHomeAds.length)];
          setActiveAd(selected);

          // Log impression
          await incrementAdImpression(selected.id);
        }
      } catch (error) {
        console.error("Error loading homepage ad:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageAd();
  }, []);

  const handleAdClick = () => {
    if (activeAd) {
      incrementAdClick(activeAd.id, activeAd.cpc || 6).catch(err => console.error(err));
    }
  };

  if (loading || !activeAd) return null;

  return (
    <div className="py-4 px-4 max-w-7xl mx-auto">
      <motion.a
        href={activeAd.link}
        onClick={handleAdClick}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="relative block h-32 sm:h-44 rounded-[24px] overflow-hidden shadow-md border border-amber-200/40 bg-slate-900 group"
      >
        <img
          src={activeAd.imageUrl}
          alt={activeAd.campaignName}
          className="w-full h-full object-cover opacity-85 transition-transform duration-[12s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-center px-6 sm:px-12">
          <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
            <Sparkles size={12} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              পুঠিয়া পৌরসভা অংশীদার বিজ্ঞাপন
            </span>
          </div>
          <h3 className="text-sm sm:text-xl font-black text-white leading-tight max-w-xl group-hover:text-amber-300 transition-colors">
            {activeAd.campaignName}
          </h3>
          <p className="text-[10px] text-slate-300 mt-1 font-bold flex items-center gap-1">
            অফারটি বিস্তারিত দেখতে স্পর্শ করুন <ExternalLink size={10} />
          </p>
        </div>
      </motion.a>
    </div>
  );
};

export default HomepageAdSection;

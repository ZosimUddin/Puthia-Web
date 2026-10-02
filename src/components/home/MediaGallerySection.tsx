import React, { useState, useEffect } from "react";
import { Camera, ChevronRight, Play, Image as ImageIcon, Video, Activity } from "lucide-react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Skeleton from "./Skeleton";

const MediaGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const q = query(
          collection(db, "gallery_items"),
          limit(20)
        );
        const snapshot = await getDocs(q);
        
        const fetchedItems = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((data: any) => data.isActive === true || data.isActive === undefined)
          .sort((a: any, b: any) => {
            const getTime = (obj: any) => {
              if (!obj.createdAt) return 0;
              if (typeof obj.createdAt.toMillis === "function") return obj.createdAt.toMillis();
              if (obj.createdAt.seconds) return obj.createdAt.seconds * 1000;
              return new Date(obj.createdAt).getTime() || 0;
            };
            return getTime(b) - getTime(a);
          })
          .slice(0, 8);
          
        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const displayItems = items.length > 0 ? items : [
    { type: 'photo', url: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop", title: "পুঠিয়া রাজবাড়ি" },
    { type: 'video', url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop", title: "পুঠিয়ার ঐতিহ্য" },
    { type: 'photo', url: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800&auto=format&fit=crop", title: "উৎসবের আনন্দ" },
    { type: 'video', url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop", title: "বানেশ্বর আম হাট" },
  ];

  return (
    <section className="py-3 md:py-4 px-4 max-w-7xl mx-auto">
      <SectionHeader
        title="মিডিয়া গ্যালারি"
        subtitle="ঐতিহ্যের ছবি ও ভিডিও"
        icon={<Video size={24} />}
        count={loading ? 0 : displayItems.length}
        buttonText="সব দেখুন"
        onButtonClick={() => navigate("/media-gallery")}
      />

      <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="rounded-[16px] w-[280px] sm:w-[320px] h-[420px] shrink-0 border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)]" />
          ))
        ) : displayItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={() => navigate("/media-gallery")}
            className="relative group rounded-[16px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(148,163,184,0.08)] hover:shadow-[0_16px_32px_-4px_rgba(16,185,129,0.12)] border border-slate-100/80 hover:border-emerald-200/50 transition-all duration-300 cursor-pointer w-[280px] sm:w-[320px] h-[420px] shrink-0 snap-start"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Play/View Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {item.type === 'video' ? (
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <Play size={26} fill="white" className="text-white ml-1" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <ImageIcon size={26} className="text-white" />
                </div>
              )}
            </div>

            {/* Premium Gradient Bottom Title Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-6 px-6 flex flex-col justify-end text-white z-20">
              <div className="flex items-center gap-2 mb-1.5 opacity-90">
                {item.type === 'video' ? (
                  <Video size={14} className="text-red-400" />
                ) : (
                  <Camera size={14} className="text-emerald-400" />
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300">
                  {item.type === 'video' ? 'ভিডিও গ্যালারি' : 'ছবি গ্যালারি'}
                </span>
              </div>
              <h4 className="text-base font-black leading-tight tracking-tight drop-shadow-md">
                {item.title}
              </h4>
            </div>

            {item.type === 'video' && (
              <div className="absolute top-4 right-4 bg-red-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 z-20 shadow-sm">
                <Activity size={12} className="animate-pulse" /> Live
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MediaGallerySection;

import React, { useState, useEffect } from "react";
import { Play, Youtube, ChevronRight, Share2, Eye, Video } from "lucide-react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Skeleton from "./Skeleton";

interface VideoData {
  title: string;
  url: string;
  thumbnail: string;
}

const VideoGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(
          collection(db, "gallery_items"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        
        // Filter type and isActive in memory to avoid composite index requirement
        const activeDocs = snapshot.docs
          .map(doc => doc.data())
          .filter(data => data.type === "video" && (data.isActive === true || data.isActive === undefined))
          .sort((a, b) => {
            const getTime = (obj: any) => {
              if (!obj.createdAt) return 0;
              if (typeof obj.createdAt.toMillis === "function") return obj.createdAt.toMillis();
              if (obj.createdAt.seconds) return obj.createdAt.seconds * 1000;
              return new Date(obj.createdAt).getTime() || 0;
            };
            return getTime(b) - getTime(a);
          })
          .slice(0, 4);

        const fetchedVideos = activeDocs.map(data => {
          
          // Helper to extract YouTube video ID if possible
          const getYoutubeId = (url: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
          };
          
          const ytId = getYoutubeId(data.url);
          const defaultThumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800";

          return {
            title: data.title,
            url: data.url,
            thumbnail: data.thumbnail || defaultThumbnail
          };
        });
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Fallback
  const displayVideos = videos.length > 0 ? videos : [
    {
      title: "পুঠিয়া রাজবাড়ীর ড্রোন ভিউ",
      url: "#",
      thumbnail:
        "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=800",
    },
    {
      title: "ঐতিহাসিক বড় শিব মন্দির ভ্রমণ",
      url: "#",
      thumbnail:
        "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?auto=format&fit=crop&fm=webp&q=75&w=800",
    },
  ];

  return (
    <section className="py-6 px-4 max-w-7xl mx-auto">
      <SectionHeader
        title="ভিডিও গ্যালারী"
        subtitle="ভিডিওর মাধ্যমে পুঠিয়া"
        icon={<Video size={24} />}
        count={loading ? 0 : displayVideos.length}
        buttonText="সব ভিডিও"
        onButtonClick={() => navigate("/tourism")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-[32px] border border-slate-100 p-6 h-[420px]">
              <Skeleton className="h-64 w-full rounded-[32px] mb-8" />
              <div className="flex justify-between items-center gap-6">
                <Skeleton className="h-6 w-3/4 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
            </div>
          ))
        ) : displayVideos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-[420px]"
          >
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative h-64 sm:h-80 overflow-hidden block">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] transform transition-all group-hover:scale-110 group-active:scale-95 border-4 border-white/20">
                  <Play size={32} fill="currentColor" className="ml-1" />
                </div>
              </div>

              <div className="absolute top-6 left-6">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-md">
                  <Youtube size={14} className="text-red-500" /> ইউটিউব গ্যালারী
                </div>
              </div>
            </a>

            <div className="p-6 flex items-center justify-between gap-6 flex-1">
              <div className="flex-1">
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  <h3 className="text-xl font-black text-slate-900 leading-[1.3] group-hover:text-red-600 transition-colors tracking-tight">
                    {video.title}
                  </h3>
                </a>
              </div>
              <button className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-2xl transition-all border border-slate-100 shrink-0 active:scale-90 shadow-sm">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default VideoGallerySection;

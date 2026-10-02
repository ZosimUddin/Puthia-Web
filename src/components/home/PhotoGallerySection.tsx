import React, { useState, useEffect } from "react";
import { Camera, ChevronRight, Maximize2, Heart, Image } from "lucide-react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Skeleton from "./Skeleton";

const PhotoGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const q = query(
          collection(db, "gallery_items"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        
        // Filter type and isActive in memory to avoid needing composite index
        const fetchedPhotos = snapshot.docs
          .map(doc => doc.data())
          .filter(data => data.type === "photo" && (data.isActive === true || data.isActive === undefined))
          .sort((a, b) => {
            const getTime = (obj: any) => {
              if (!obj.createdAt) return 0;
              if (typeof obj.createdAt.toMillis === "function") return obj.createdAt.toMillis();
              if (obj.createdAt.seconds) return obj.createdAt.seconds * 1000;
              return new Date(obj.createdAt).getTime() || 0;
            };
            return getTime(b) - getTime(a);
          })
          .slice(0, 6)
          .map(data => data.url as string);
          
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Fallback if no photos in DB
  const displayPhotos = photos.length > 0 ? photos : [
    "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
  ];

  return (
    <section className="py-6 px-4 max-w-7xl mx-auto">
      <SectionHeader
        title="ফটোগ্যালারী"
        subtitle="রূপ ও ঐতিহ্যের স্থিরচিত্র"
        icon={<Image size={24} />}
        count={loading ? 0 : displayPhotos.length}
        buttonText="গ্যালারী দেখুন"
        onButtonClick={() => navigate("/tourism")}
      />

      <div className="columns-2 md:columns-3 lg:columns-4 gap-5 sm:gap-6 space-y-5 sm:space-y-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton 
              key={i} 
              className={`w-full rounded-[32px] break-inside-avoid ${
                i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-80" : "h-56"
              }`} 
            />
          ))
        ) : displayPhotos.map((photo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="relative group rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all break-inside-avoid border border-slate-100"
          >
            <img
              src={photo}
              alt="Puthia"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8 gap-4">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-xl text-white rounded-[18px] hover:bg-white hover:text-emerald-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 border border-white/20 flex items-center justify-center">
                <Maximize2 size={20} />
              </button>
              <button className="w-12 h-12 bg-white/20 backdrop-blur-xl text-white rounded-[18px] hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 border border-white/20 flex items-center justify-center">
                <Heart size={20} />
              </button>
            </div>

            <div className="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-black/30 backdrop-blur-xl border border-white/10 rounded-[14px] text-white flex items-center justify-center">
                <Camera size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PhotoGallerySection;

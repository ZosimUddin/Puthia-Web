import React from "react";
import {
  Palmtree,
  MapPin,
  Camera,
  ChevronRight,
  Compass,
  Sparkles,
  Navigation,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import SectionHeader from "./SectionHeader";

import { useNavigate } from "react-router-dom";

const TourismSection: React.FC = () => {
  const navigate = useNavigate();
  const spots = [
    {
      name: "পুঠিয়া রাজবাড়ী",
      image:
        "https://images.unsplash.com/photo-1621640786029-220e9ff8dd09?auto=format&fit=crop&fm=webp&q=75&w=800",
      lat: 24.369528,
      lng: 88.841528,
    },
    {
      name: "বড় শিব মন্দির",
      image:
        "https://images.unsplash.com/photo-1544860707-c352cc5a92e3?auto=format&fit=crop&fm=webp&q=75&w=800",
      lat: 24.369444,
      lng: 88.842778,
    },
    {
      name: "শ্যাম সাগর দীঘি",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&fm=webp&q=75&w=800",
      lat: 24.3703,
      lng: 88.8398,
    },
  ];

  return (
    <section className="py-5 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden text-left w-full">
      <SectionHeader
        title="পর্যটন"
        subtitle="ইতিহাস ও ঐতিহ্যের পুঠিয়া"
        icon={<MapPin size={24} />}
        count={spots.length}
        buttonText="পর্যটন গাইড"
        onButtonClick={() => navigate("/tourism")}
      />

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {spots.map((spot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => navigate("/tourism")}
            className="group relative h-[420px] w-[280px] sm:w-[320px] shrink-0 snap-start rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-100"
          >
            <img
              src={spot.image}
              alt={spot.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:via-black/50 transition-all"></div>

            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <MapPin size={14} className="animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
                    পুঠিয়া, রাজশাহী
                  </span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {spot.name}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/tourism");
                  }}
                  className="flex-1 h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>আরও দেখুন</span>
                  <ArrowRight size={16} />
                </button>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-md active:scale-95 cursor-pointer"
                >
                  <Navigation size={18} fill="currentColor" />
                </a>
              </div>
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4">
              <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 text-white text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} className="text-emerald-500" /> জনপ্রিয়
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TourismSection;

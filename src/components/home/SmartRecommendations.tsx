import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, MapPin, TrendingUp, Clock, Calendar, 
  ChevronRight, Heart, HeartPulse, UserCheck, Eye, Phone,
  Compass, RefreshCw, AlertCircle, Bookmark, Star, ArrowRight, Locate, ShieldCheck, Lock, Briefcase, Utensils, Hospital, Building2
} from "lucide-react";
import { getGenericCollection } from "../../api";
import { useFavorites, SavedItem } from "../FavoriteContext";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { getUserBrowsingContext, RecommendationCategory } from "../../services/recommendationEngine";

// Union Center Coords mapping for fallbacks
const UNION_COORDS: Record<string, { lat: number, lng: number }> = {
  'পুঠিয়া সদর': { lat: 24.369528, lng: 88.841528 },
  'বানেশ্বর': { lat: 24.3860, lng: 88.8040 },
  'বেলপুকুরিয়া': { lat: 24.3520, lng: 88.7650 },
  'ভালুকগাছি': { lat: 24.3980, lng: 88.8750 },
  'জিউপাড়া': { lat: 24.3410, lng: 88.8920 },
  'শিলমাড়িয়া': { lat: 24.4320, lng: 88.9150 }
};

// Default center coordinates
const DEFAULT_COORDS = { lat: 24.369528, lng: 88.841528 }; // Puthiya Rajbari

// Haversine Distance Calculator
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

interface RecommendationItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  categoryLabel: string;
  type: string; // collection name
  imageUrl?: string;
  lat: number;
  lng: number;
  distance?: number;
  phone?: string;
  location?: string;
  union?: string;
  createdAt?: any;
  rating?: number;
  views?: number;
  tags?: string[];
  recommendationReason?: string;
}

export const SmartRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { savedItems, toggleSave, isSaved } = useFavorites();
  
  const [activeTab, setActiveTab] = useState<'for_you' | 'nearby' | 'restaurants' | 'jobs' | 'popular' | 'recent'>('for_you');
  const [loading, setLoading] = useState<boolean>(true);
  const [allData, setAllData] = useState<RecommendationItem[]>([]);
  
  // User Location
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Load User location from cache or request if selected
  useEffect(() => {
    const cachedLoc = localStorage.getItem('puthia_user_gps_loc');
    if (cachedLoc) {
      try {
        setUserLocation(JSON.parse(cachedLoc));
      } catch (e) {}
    }
  }, []);

  const requestGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("জিপিএস সমর্থিত নয়");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        localStorage.setItem('puthia_user_gps_loc', JSON.stringify(loc));
        setGpsLoading(false);
      },
      (error) => {
        console.warn("GPS Notice:", error);
        setGpsError("জিপিএস অফ রয়েছে। পুঠিয়া চত্বর রেফারেন্স ব্যবহার করা হচ্ছে।");
        setGpsLoading(false);
      },
      { timeout: 6000 }
    );
  };

  // Dynamically compile items from multiple collections
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const collectionsToLoad = [
        { name: 'doctors', label: 'ডাক্তার', category: 'health' },
        { name: 'hospitals', label: 'কাছাকাছি হাসপাতাল', category: 'health' },
        { name: 'restaurants', label: 'রেস্টুরেন্ট & খাবার', category: 'restaurant' },
        { name: 'jobs', label: 'নতুন চাকরি', category: 'job' },
        { name: 'tourist_spots', label: 'পর্যটন স্থান', category: 'tourism' },
        { name: 'news', label: 'খবর', category: 'news' },
        { name: 'notice_items', label: 'নোটিশ', category: 'notices' },
        { name: 'user_posts', label: 'নাগরিক পোস্ট', category: 'posts' },
        { name: 'house_rents', label: 'বাড়ি ভাড়া', category: 'rents' },
        { name: 'marketplace_items', label: 'ক্রয়-বিক্রয়', category: 'marketplace' },
        { name: 'blood_requests', label: 'রক্তের আবেদন', category: 'blood' }
      ];

      const fetchPromises = collectionsToLoad.map(async (col) => {
        try {
          const docs = await getGenericCollection(col.name);
          return docs.map(doc => {
            // Smart Coordinates resolver
            let lat = parseFloat(doc.lat || doc.latitude || "0");
            let lng = parseFloat(doc.lng || doc.longitude || "0");
            
            // If coordinates are missing, resolve from union
            if (!lat || !lng) {
              const uCoords = UNION_COORDS[doc.union || 'পুঠিয়া সদর'] || DEFAULT_COORDS;
              const offsetIndex = (doc.id?.charCodeAt(0) || 0) % 10;
              lat = uCoords.lat + (offsetIndex - 5) * 0.0012;
              lng = uCoords.lng + (((doc.id?.charCodeAt(1) || 0) % 10) - 5) * 0.0012;
            }

            return {
              id: doc.id,
              title: doc.title || doc.name || doc.itemName || doc.jobTitle || doc.patientName || doc.spotName || (doc.text && doc.text.substring(0, 50)) || col.label,
              subtitle: doc.subtitle || doc.company || doc.speciality || doc.price || doc.category || "",
              description: doc.description || doc.details || doc.content || doc.text || doc.address || `${col.label} এর বিবরণী`,
              category: col.category,
              categoryLabel: col.label,
              type: col.name,
              imageUrl: doc.imageUrl || doc.image || (doc.images && doc.images[0]) || "",
              lat,
              lng,
              phone: doc.phone || doc.contactNumber || "",
              location: doc.location || doc.address || doc.union || "",
              union: doc.union || "পুঠিয়া সদর",
              createdAt: doc.createdAt || doc.date || "",
              rating: doc.rating ? parseFloat(doc.rating) : (4.2 + (doc.id.charCodeAt(0) % 8) * 0.1),
              views: doc.views ? parseInt(doc.views) : (35 + (doc.id.charCodeAt(0) % 120)),
              tags: doc.tags || []
            } as RecommendationItem;
          });
        } catch (e) {
          console.error(`Failed to fetch collection: ${col.name}`, e);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const flattened = results.flat();
      setAllData(flattened);
    } catch (err) {
      console.error("Error loading recommendation pool:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute calculated items with distances
  const processedData = useMemo(() => {
    const origin = userLocation || DEFAULT_COORDS;
    return allData.map(item => {
      const distance = calculateDistance(origin.lat, origin.lng, item.lat, item.lng);
      return { ...item, distance };
    });
  }, [allData, userLocation]);

  // Tab 1: Personalized (আপনার জন্য প্রস্তাবিত)
  const personalizedRecommendations = useMemo(() => {
    const userCtx = getUserBrowsingContext();
    const savedCategories = new Set<string>(savedItems.map(i => {
      if (i.type === 'doctor' || i.type === 'hospital') return 'health';
      if (i.type === 'tourism') return 'tourism';
      return 'news';
    }));

    if (userCtx.lastCategory && userCtx.lastCategory !== 'default') {
      savedCategories.add(userCtx.lastCategory as string);
    }

    return processedData.map(item => {
      let score = item.rating || 4.0;
      let reason = "আপনার সাম্প্রতিক ব্রাউজিং ও লাইভ ট্রেন্ডের ভিত্তিতে";

      if (savedCategories.has(item.category)) {
        score += 3.0;
        reason = "আপনার বুকমার্ক করা ক্যাটাগরির নতুন তথ্য";
      }

      if (userCtx.viewHistory.some(vh => vh.category === item.category)) {
        score += 2.0;
        reason = "আপনার সাম্প্রতিক দেখা তথ্যের সাথে মানানসই";
      }

      return { ...item, _score: score, recommendationReason: reason };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);
  }, [processedData, savedItems]);

  // Tab 2: কাছাকাছি হাসপাতাল (Nearby Hospitals & Clinics)
  const nearbyHospitals = useMemo(() => {
    return processedData
      .filter(item => item.category === 'health')
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 4);
  }, [processedData]);

  // Tab 3: পছন্দের রেস্টুরেন্ট (Restaurants)
  const favoriteRestaurants = useMemo(() => {
    return processedData
      .filter(item => item.category === 'restaurant')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [processedData]);

  // Tab 4: নতুন চাকরি (Jobs)
  const newJobsList = useMemo(() => {
    return processedData
      .filter(item => item.category === 'job')
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 4);
  }, [processedData]);

  // Tab 5: জনপ্রিয় সেবা (Popular)
  const popularRecommendations = useMemo(() => {
    return [...processedData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 4);
  }, [processedData]);

  const activeList = useMemo(() => {
    switch (activeTab) {
      case 'for_you': return personalizedRecommendations;
      case 'nearby': return nearbyHospitals;
      case 'restaurants': return favoriteRestaurants;
      case 'jobs': return newJobsList;
      case 'popular': return popularRecommendations;
      default: return personalizedRecommendations;
    }
  }, [activeTab, personalizedRecommendations, nearbyHospitals, favoriteRestaurants, newJobsList, popularRecommendations]);

  const handleNavigateItem = (item: RecommendationItem) => {
    if (item.category === 'health') {
      navigate('/health');
    } else if (item.category === 'restaurant') {
      navigate('/restaurants');
    } else if (item.category === 'job') {
      navigate('/jobs');
    } else if (item.category === 'tourism') {
      navigate('/tourism');
    } else if (item.category === 'news') {
      navigate('/news');
    } else if (item.category === 'notices') {
      navigate('/notice');
    } else if (item.category === 'rents') {
      navigate('/house-rent');
    } else if (item.category === 'marketplace') {
      navigate('/marketplace');
    } else {
      navigate('/all-services');
    }
  };

  return (
    <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 rounded-[32px] border border-emerald-200/60 shadow-xs my-5">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <span className="bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={12} className="text-emerald-700 animate-pulse" /> প্রাইভেসি-সুরক্ষিত পারসোনালাইজড ইঞ্জিন
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1.5">
            স্মার্ট প্রস্তাবনা ও লোকাল রিকমেন্ডেশন হাব
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-black flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600" /> Client-Side Privacy Safe
          </span>
          <button
            onClick={fetchAllData}
            className="text-xs font-black text-emerald-800 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> আপডেট করুন
          </button>
        </div>
      </div>

      {/* Tabs list selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-3 border-b border-slate-100/80 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        {[
          { id: 'for_you', label: '💖 আপনার জন্য প্রস্তাবিত', desc: 'সার্চ ও বুকমার্কের ভিত্তিতে' },
          { id: 'nearby', label: '🏥 কাছাকাছি হাসপাতাল', desc: 'লাইভ জিপিএস ডিরেকশন' },
          { id: 'restaurants', label: '🍽️ আপনার পছন্দের রেস্টুরেন্ট', desc: 'সেরা খাওয়া-দাওয়া' },
          { id: 'jobs', label: '💼 নতুন চাকরি', desc: 'পুঠিয়ার লোকাল নিয়োগ' },
          { id: 'popular', label: '🔥 ট্রেন্ডিং সেবা', desc: 'সর্বোচ্চ ভিউকৃত' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-2xl border transition-all shrink-0 text-left cursor-pointer ${
                isActive 
                  ? 'bg-[#006a4e] text-white border-[#006a4e] shadow-md shadow-emerald-900/20' 
                  : 'bg-white hover:bg-slate-100/70 text-slate-700 border-slate-200'
              }`}
            >
              <span className="text-xs font-black">{tab.label}</span>
              <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recommended Content Items Display Grid */}
      <div className="mt-4 min-h-[160px] relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-150 flex gap-4 items-start animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-2 bg-slate-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-700">তথ্য লোড করা হচ্ছে...</h3>
            <p className="text-xs font-medium text-slate-400 max-w-sm mt-1">
              অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন অথবা 'আপডেট করুন' বাটনে চাপ দিন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeList.map((item) => {
              const isItemSaved = isSaved(item.id);
              
              const bookmarkMap: SavedItem = {
                id: item.id,
                type: (item.type === 'doctors' ? 'doctor' : item.type === 'hospitals' ? 'hospital' : 'other') as any,
                title: item.title,
                subtitle: item.subtitle,
                image: item.imageUrl,
                phone: item.phone,
                address: item.location,
                categoryLabel: item.categoryLabel
              };

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex gap-4 items-start relative group"
                >
                  {/* Thumbnail Banner */}
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-3xs" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-800 font-black text-lg shadow-inner">
                      {item.categoryLabel?.substring(0, 1) || '✨'}
                    </div>
                  )}

                  {/* Body Info */}
                  <div className="flex-1 min-w-0 pr-12">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {item.categoryLabel}
                      </span>
                      
                      {/* DYNAMIC GPS DISTANCE BADGE */}
                      {item.distance !== undefined && (
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          📍 {item.distance < 1 ? `${Math.round(item.distance * 1000)} মিটার` : `${item.distance} কি.মি.`}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-slate-900 truncate mt-1.5 group-hover:text-emerald-800 transition-colors">
                      {item.title}
                    </h4>

                    {item.subtitle && (
                      <p className="text-[10px] font-extrabold text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}

                    <p className="text-[10px] font-bold text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {item.recommendationReason && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-1.5">
                        💡 {item.recommendationReason}
                      </span>
                    )}

                    {/* Meta info footer */}
                    <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-slate-100 flex-wrap text-[9px] font-bold text-slate-400">
                      {item.location && (
                        <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                          <MapPin size={10} className="text-slate-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                      
                      {item.rating && (
                        <span className="flex items-center gap-0.5 text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded font-black">
                          <Star size={10} fill="currentColor" />
                          <span>{item.rating}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(bookmarkMap);
                      }}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${
                        isItemSaved 
                          ? 'bg-rose-50 border-rose-200 text-rose-600' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isItemSaved ? "সংরক্ষিত থেকে মুছুন" : "সংরক্ষণ করুন"}
                    >
                      <Heart size={12} fill={isItemSaved ? "currentColor" : "none"} />
                    </button>
                    
                    <button
                      onClick={() => handleNavigateItem(item)}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 rounded-full transition-all cursor-pointer"
                      title="বিস্তারিত পেজে যান"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </section>
  );
};

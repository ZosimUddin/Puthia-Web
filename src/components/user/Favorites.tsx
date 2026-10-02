import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  Trash2,
  ShoppingBag,
  Home as HomeIcon,
  Store,
  Calendar,
  MessageSquare,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getFavorites, toggleFavorite } from "../../api";
import Header from "../home/Header";
import Footer from "../home/Footer";
import BottomNavigation from "../home/BottomNavigation";

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites(user!.uid);
      setFavorites(data);
    } catch (err) {
      console.error(err);
      setError("পছন্দের তালিকা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string, itemType: string) => {
    try {
      await toggleFavorite(user!.uid, itemId, itemType, {});
      setFavorites(prev => prev.filter(f => f.itemId !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'business': return <Store size={20} />;
      case 'product': return <ShoppingBag size={20} />;
      case 'property': return <HomeIcon size={20} />;
      case 'event': return <Calendar size={20} />;
      case 'post': return <MessageSquare size={20} />;
      default: return <Heart size={20} />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'business': return 'text-emerald-500 bg-emerald-50';
      case 'product': return 'text-blue-500 bg-blue-50';
      case 'property': return 'text-purple-500 bg-purple-50';
      case 'event': return 'text-indigo-500 bg-indigo-50';
      case 'post': return 'text-amber-500 bg-amber-50';
      default: return 'text-rose-500 bg-rose-50';
    }
  };

  const getItemLabel = (type: string) => {
    switch (type) {
      case 'business': return 'ব্যবসা';
      case 'product': return 'পণ্য';
      case 'property': return 'প্রপার্টি';
      case 'event': return 'ইভেন্ট';
      case 'post': return 'পোস্ট';
      default: return 'অন্যান্য';
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
          <button 
            onClick={() => navigate("/profile")}
            className="hidden lg:inline-flex items-center gap-2 text-gray-400 hover:text-rose-600 transition-colors mb-2 group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">ড্যাশবোর্ডে ফিরে যান</span>
          </button>
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            প্রিয় তালিকা <Heart size={28} className="text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-1">আপনার পছন্দের আইটেমগুলো এখানে সংরক্ষিত আছে</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="খুঁজুন..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-bold text-gray-700"
          />
        </div>

        {/* Favorites List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-rose-500" size={32} />
            <p className="text-sm font-black text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[32px] border border-gray-100 p-5 shadow-sm hover:shadow-2xl hover:shadow-rose-900/5 transition-all group flex items-center gap-5"
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 ${getItemColor(fav.itemType)}`}>
                    {getItemIcon(fav.itemType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${getItemColor(fav.itemType)}`}>
                        {getItemLabel(fav.itemType)}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-emerald-950 truncate">{fav.itemData?.title || fav.itemData?.name || "নামহীন"}</h3>
                    <p className="text-[10px] font-bold text-gray-400 truncate">{fav.itemData?.location || fav.itemData?.address || "স্থান তথ্য নেই"}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleRemove(fav.itemId, fav.itemType)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-sm mb-6 text-gray-300">
              <Heart size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">তালিকা ফাঁকা</h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mb-8">
              আপনি এখনো কোন কিছু পছন্দের তালিকায় যোগ করেননি।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-200"
            >
              ব্রাউজ শুরু করুন
            </motion.button>
          </div>
        )}
      </div>
    );
  };

export default Favorites;

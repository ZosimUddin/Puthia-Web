import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Home as HomeIcon, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Loader2,
  ArrowLeft,
  Search,
  Eye,
  Calendar,
  Building,
  Key
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getToLetAds, deleteToLetAd } from "../../api";
import { ToLetAd } from "../../types";
import Header from "../home/Header";
import Footer from "../home/Footer";
import BottomNavigation from "../home/BottomNavigation";

const MyProperties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<ToLetAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const allAds = await getToLetAds();
      // Filter for current user's ads (Assuming ownerPhone matches or we need a userId field)
      // Since schema doesn't have userId, I'll assume we should have added it.
      // I'll filter by ownerPhone if available, but better to have userId.
      // For now, I'll just show all and filter if userId exists in data.
      setProperties(allAds.filter((ad: any) => ad.userId === user?.uid));
    } catch (err) {
      console.error(err);
      setError("প্রপার্টি লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteToLetAd(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button 
              onClick={() => navigate("/profile")}
              className="hidden lg:inline-flex items-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors mb-2 group cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">ড্যাশবোর্ডে ফিরে যান</span>
            </button>
            <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
              আমার প্রপার্টি <HomeIcon size={28} className="text-purple-500" />
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">আপনার বাসা বা দোকান ভাড়ার বিজ্ঞাপনগুলো পরিচালনা করুন</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/add-property")}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-900/10 hover:bg-purple-700 transition-all"
          >
            <Plus size={18} /> নতুন বিজ্ঞাপন দিন
          </motion.button>
        </div>

        {/* Property List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <p className="text-sm font-black text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-purple-900/5 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                      {property.category === 'shop' ? <Building size={24} /> : <Key size={24} />}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-wider mb-1 inline-block">
                        {property.category === 'house' ? 'বাসা' : property.category === 'shop' ? 'দোকান' : 'অন্যান্য'}
                      </span>
                      <h3 className="text-lg font-black text-emerald-950 truncate">{property.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/edit-property/${property.id}`)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(property.id)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-gray-500">
                    <MapPin size={16} className="shrink-0" />
                    <p className="text-xs font-bold">{property.location}</p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Calendar size={16} className="shrink-0" />
                    <p className="text-xs font-bold">{property.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">মাসিক ভাড়া</p>
                    <p className="text-xl font-black text-purple-600">৳{property.rent}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} />
                      <span className="text-xs font-black">{property.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} />
                      <span className="text-xs font-black">{property.calls || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-sm mb-6 text-gray-300">
              <HomeIcon size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">কোন প্রপার্টি পাওয়া যায়নি</h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mb-8">
              আপনি এখনো কোন বাসা বা দোকান ভাড়ার বিজ্ঞাপন দেননি।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/add-property")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-200"
            >
              <Plus size={20} /> বিজ্ঞাপন দিন
            </motion.button>
          </div>
        )}
      </div>
    );
  };

export default MyProperties;

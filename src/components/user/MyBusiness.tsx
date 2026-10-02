import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Store, 
  MapPin, 
  Phone, 
  ChevronRight, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUsersBusinesses, deleteBusiness } from "../../api";
import { Business } from "../../types";
import Header from "../home/Header";
import Footer from "../home/Footer";
import BottomNavigation from "../home/BottomNavigation";

const MyBusiness: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getUsersBusinesses(user!.uid);
      setBusinesses(data);
    } catch (err) {
      console.error(err);
      setError("ব্যবসা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBusiness(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
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
              আমার ব্যবসা <Store size={28} className="text-emerald-600" />
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">আপনার নিবন্ধিত ব্যবসাগুলো পরিচালনা করুন</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/add-business")}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} /> নতুন ব্যবসা যোগ করুন
          </motion.button>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="ব্যবসা খুঁজুন..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
          />
        </div>

        {/* Business List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-sm font-black text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((business) => (
              <motion.div
                key={business.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${
                  business.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                  business.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                  'bg-rose-50 text-rose-600'
                }`}>
                  {business.status === 'approved' ? 'অনুমোদিত' : 
                   business.status === 'pending' ? 'অপেক্ষমান' : 'প্রত্যাখ্যাত'}
                </div>

                <div className="flex gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {business.logoUrl ? (
                      <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={32} className="text-emerald-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <h3 className="text-lg font-black text-emerald-950 truncate">{business.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        {business.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 text-gray-500">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{business.address}</p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Phone size={16} className="shrink-0" />
                    <p className="text-xs font-bold">{business.phone}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/edit-business/${business.id}`)}
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(business.id)}
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <button className="flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors">
                    সব পণ্য দেখুন <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-sm mb-6 text-gray-300">
              <Store size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">কোন ব্যবসা পাওয়া যায়নি</h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mb-8">
              আপনি এখনো কোন ব্যবসা যোগ করেননি। নতুন ব্যবসা যোগ করে ডিজিটাল সেবা শুরু করুন।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/add-business")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-200"
            >
              <Plus size={20} /> প্রথম ব্যবসা যোগ করুন
            </motion.button>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-center text-emerald-950 mb-2">আপনি কি নিশ্চিত?</h3>
              <p className="text-sm font-bold text-center text-gray-500 mb-8">
                এই ব্যবসাটি মুছে ফেললে এর সাথে থাকা সকল পণ্য এবং তথ্য চিরতরে হারিয়ে যাবে।
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-colors"
                >
                  ফিরে যান
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="py-4 bg-rose-500 text-white rounded-2xl font-black text-xs hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                >
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBusiness;

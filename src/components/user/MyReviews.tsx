import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  Store, 
  ShoppingBag, 
  Home as HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserReviews, deleteReview } from '../../api';
import { Review } from '../../types';

const MyReviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        const data = await getUserReviews(user.uid);
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?")) return;
    
    setDeletingId(id);
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      alert("রিভিউটি মুছতে সমস্যা হয়েছে।");
    } finally {
      setDeletingId(null);
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'business': return Store;
      case 'product': return ShoppingBag;
      case 'tolet': return HomeIcon;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">রিভিউ লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 rounded-none sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 w-full md:w-auto">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
              <Star size={16} />
              <span>আমার মতামত ও রেটিং • আমাদের পুঠিয়া</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer flex items-center justify-center transition-colors active:scale-95 shadow-xs shrink-0"
                title="পূর্ববর্তী পেজে ফিরে যান"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">আমার রিভিউ</h1>
            </div>

            <p className="text-xs md:text-sm text-emerald-100 max-w-xl">
              আপনার দেওয়া সকল মতামত ও রেটিং ইতিহাস দেখুন।
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-0">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm px-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-emerald-500 opacity-20" />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">কোনো রিভিউ পাওয়া যায়নি!</h3>
            <p className="text-gray-500 font-medium mb-8">
              আপনি এখনো কোনো ব্যবসা বা পণ্যে রিভিউ দেননি। রিভিউ দিলে এখানে তা দেখা যাবে।
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              ঘুরে দেখুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {reviews.map((review, idx) => {
                const TargetIcon = getTargetIcon(review.targetType);
                return (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <TargetIcon size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{review.targetType === 'business' ? 'ব্যবসা' : review.targetType === 'product' ? 'পণ্য' : 'বাসা ভাড়া'}</p>
                          <h4 className="font-black text-emerald-950 truncate max-w-[180px]">{review.targetName}</h4>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < review.rating ? "fill-amber-400 text-emerald-500" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                      <p className="text-gray-700 font-medium text-sm italic">"{review.comment}"</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{new Date(review.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        {deletingId === review.id ? (
                          <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;

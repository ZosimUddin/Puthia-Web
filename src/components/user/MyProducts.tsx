import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  ShoppingBag, 
  Tag, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Loader2,
  ArrowLeft,
  Search,
  Package,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Store
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUsersProducts, deleteProduct, getUsersBusinesses } from "../../api";
import { Product, Business } from "../../types";
import Header from "../home/Header";
import Footer from "../home/Footer";
import BottomNavigation from "../home/BottomNavigation";

const MyProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, businessesData] = await Promise.all([
        getUsersProducts(user!.uid),
        getUsersBusinesses(user!.uid)
      ]);
      setProducts(productsData);
      setBusinesses(businessesData);
    } catch (err) {
      console.error(err);
      setError("পণ্য লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return "ব্যক্তিগত পণ্য";
    const biz = businesses.find(b => b.id === businessId);
    return biz ? biz.name : "অজানা ব্যবসা";
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
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
              আমার পণ্য <ShoppingBag size={28} className="text-blue-500" />
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">আপনার বিক্রয়যোগ্য সকল পণ্য পরিচালনা করুন</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/add-product")}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all"
          >
            <Plus size={18} /> নতুন পণ্য যোগ করুন
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="পণ্য খুঁজুন..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm font-black text-gray-400">লোড হচ্ছে...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-100">
                      <Package size={64} />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-gray-700 shadow-sm uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                      className="p-3 bg-white/90 backdrop-blur-md text-gray-600 rounded-xl hover:text-blue-600 shadow-lg"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(product.id)}
                      className="p-3 bg-white/90 backdrop-blur-md text-gray-600 rounded-xl hover:text-rose-600 shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    <Store size={12} className="text-emerald-500" />
                    {getBusinessName(product.businessId)}
                  </div>
                  <h3 className="text-base font-black text-emerald-950 truncate mb-1">{product.name}</h3>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xl font-black text-blue-600">
                        ৳{product.price}
                        <span className="text-[10px] text-gray-400 ml-1 font-bold lowercase tracking-normal">/{product.unit}</span>
                      </p>
                    </div>
                    
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      product.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                    }`}>
                      {product.status === 'active' ? (
                        <><CheckCircle2 size={12} /> সচল</>
                      ) : (
                        <><XCircle size={12} /> অচল</>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-sm mb-6 text-gray-300">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 mb-2">কোন পণ্য পাওয়া যায়নি</h3>
            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto mb-8">
              আপনি এখনো কোন পণ্য যোগ করেননি। ডিজিটাল স্টোরে পণ্য যোগ করে বিক্রি শুরু করুন।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200"
            >
              <Plus size={20} /> প্রথম পণ্য যোগ করুন
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
              className="absolute inset-0 bg-blue-950/20 backdrop-blur-sm"
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
                এই পণ্যটি মুছে ফেললে এর সকল তথ্য চিরতরে হারিয়ে যাবে।
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

export default MyProducts;

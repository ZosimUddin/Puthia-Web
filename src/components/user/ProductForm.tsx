import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Tag, 
  Package, 
  Camera, 
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  DollarSign
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addProduct, updateProduct, compressImageToBase64, getUsersBusinesses } from "../../api";
import { db } from "../../firebase";
import { Product, Business } from "../../types";
import { doc, getDoc } from "firebase/firestore";
import Header from "../home/Header";

const ProductForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt">>({
    userId: user?.uid || "",
    businessId: "",
    name: "",
    description: "",
    price: 0,
    unit: "কেজি",
    category: "অন্যান্য",
    imageUrl: "",
    status: "active",
    stock: 0
  });

  const categories = [
    "শাক-সবজি",
    "ফলমূল",
    "মাছ-মাংস",
    "মুদি সামগ্রী",
    "প্রসাধনী",
    "পোশাক",
    "ইলেকট্রনিক্স",
    "গৃহস্থালী",
    "অন্যান্য"
  ];

  const units = ["কেজি", "গ্রাম", "লিটার", "পিচ", "ডজন", "হালি", "বস্তা", "প্যাকেট"];

  useEffect(() => {
    if (user) {
      fetchBusinesses();
      if (isEdit) {
        fetchProduct();
      }
    }
  }, [user, id]);

  const fetchBusinesses = async () => {
    try {
      const data = await getUsersBusinesses(user!.uid);
      setBusinesses(data);
      if (data.length > 0 && !isEdit) {
        setFormData(prev => ({ ...prev, businessId: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        if (data.userId !== user?.uid) {
          setError("আপনার এই পণ্য পরিবর্তনের অনুমতি নেই।");
          return;
        }
        const { id: _, createdAt: __, ...rest } = data;
        setFormData(rest);
      }
    } catch (err) {
      console.error(err);
      setError("তথ্য লোড করতে সমস্যা হয়েছে।");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "price" || name === "stock" ? Number(value) : value 
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      } catch (err) {
        console.error(err);
        alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await updateProduct(id!, formData);
      } else {
        await addProduct({ ...formData, userId: user.uid });
      }
      setSuccess(true);
      setTimeout(() => navigate("/my-products"), 2000);
    } catch (err) {
      console.error(err);
      setError("তথ্য সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
          <button 
            onClick={() => navigate("/my-products")}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">ফিরে যান</span>
          </button>
          <h1 className="text-3xl font-black text-emerald-950">
            {isEdit ? "পণ্যের তথ্য পরিবর্তন" : "নতুন পণ্য যোগ করুন"}
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2">
            আপনার বিক্রয়যোগ্য পণ্যের সঠিক তথ্য ও ছবি প্রদান করুন
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-emerald-950 uppercase tracking-widest ml-1 text-center">পণ্যের ছবি</label>
            <div className="relative group max-w-[240px] mx-auto">
              <div className="w-full aspect-square bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="text-gray-300 mb-2" size={32} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ছবি যোগ করুন</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Business Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ব্যবসা নির্বাচন করুন</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  name="businessId"
                  value={formData.businessId || ""}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="">ব্যক্তিগত (কোন ব্যবসা ছাড়াই)</option>
                  {businesses.map(biz => (
                    <option key={biz.id} value={biz.id || ""}>{biz.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">পণ্যের নাম</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="উদাঃ খাঁটি সরিষার তেল"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ক্যাটেগরি</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat || ""}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">পণ্যের বিবরণ</label>
              <textarea 
                required
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                placeholder="পণ্যের গুণাবলী ও বৈশিষ্ট্য সম্পর্কে বিস্তারিত লিখুন..."
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700 resize-none"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">মূল্য (৳)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-600">৳</div>
                  <input 
                    required
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">একক</label>
                <select 
                  name="unit"
                  value={formData.unit || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none"
                >
                  {units.map(u => (
                    <option key={u} value={u || ""}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">স্টক (ঐচ্ছিক)</label>
                <input 
                  type="number"
                  name="stock"
                  value={formData.stock || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">পণ্যের অবস্থা</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                    formData.status === 'active' 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-lg shadow-emerald-900/5" 
                      : "bg-gray-50 border-gray-100 text-gray-400"
                  }`}
                >
                  সচল (প্রদর্শিত হবে)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                    formData.status === 'inactive' 
                      ? "bg-gray-100 border-gray-200 text-gray-600" 
                      : "bg-gray-50 border-gray-100 text-gray-400"
                  }`}
                >
                  অচল (লুকানো থাকবে)
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || success}
            type="submit"
            className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
              success 
                ? "bg-blue-500 text-white" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            } disabled:opacity-70`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>সফলভাবে সম্পন্ন হয়েছে <CheckCircle2 size={20} /></>
            ) : (
              isEdit ? "পরিবর্তন সংরক্ষণ করুন" : "পণ্য যোগ সম্পন্ন করুন"
            )}
          </motion.button>
        </form>
      </div>
    );
  };

export default ProductForm;

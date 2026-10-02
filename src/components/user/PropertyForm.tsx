import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Home as HomeIcon, 
  MapPin, 
  Phone, 
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
  Info
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addToLetAd, updateToLetAd } from "../../api";
import { db } from "../../firebase";
import { ToLetAd } from "../../types";
import { doc, getDoc } from "firebase/firestore";
import Header from "../home/Header";

const PropertyForm: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<Omit<ToLetAd, "id" | "createdAt">>({
    title: "",
    category: "house",
    description: "",
    rent: "",
    location: "",
    ownerName: userProfile?.name || "",
    ownerPhone: userProfile?.phone || "",
    details: "",
    union: userProfile?.union || "পুঠিয়া",
  });

  useEffect(() => {
    if (isEdit) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const docRef = doc(db, "tolet_ads", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ToLetAd;
        // In a real app we'd check userId here
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const adData = {
        ...formData,
        userId: user.uid, // Explicitly add userId
        createdAt: new Date().toISOString().split('T')[0],
      };

      if (isEdit) {
        await updateToLetAd(id!, adData);
      } else {
        await addToLetAd(adData);
      }
      setSuccess(true);
      setTimeout(() => navigate("/my-properties"), 2000);
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
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
          <button 
            onClick={() => navigate("/my-properties")}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">ফিরে যান</span>
          </button>
          <h1 className="text-3xl font-black text-emerald-950">
            {isEdit ? "বিজ্ঞাপন পরিবর্তন করুন" : "ভাড়ার নতুন বিজ্ঞাপন"}
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2">
            আপনার বাসা বা দোকান ভাড়ার সঠিক তথ্য প্রদান করুন
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
          <div className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">প্রপার্টির ধরন</label>
              <div className="flex gap-4">
                {[
                  { id: 'house', label: 'বাসা', icon: HomeIcon },
                  { id: 'shop', label: 'দোকান', icon: Building },
                  { id: 'other', label: 'অন্যান্য', icon: Key }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: type.id as any }))}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border flex flex-col items-center gap-2 ${
                      formData.category === type.id 
                        ? "bg-purple-50 border-purple-200 text-purple-600 shadow-lg shadow-purple-900/5" 
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    }`}
                  >
                    <type.icon size={20} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">বিজ্ঞাপনের শিরোনাম</label>
              <input 
                required
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="উদাঃ দুই রুমের চমৎকার বাসা ভাড়া হবে"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">সংক্ষিপ্ত বিবরণ</label>
              <input 
                required
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="উদাঃ নিচতলায় দক্ষিণমুখী বড় বারান্দাসহ বাসা"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
              />
            </div>

            {/* Rent & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">মাসিক ভাড়া (৳)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-purple-600">৳</div>
                  <input 
                    required
                    name="rent"
                    value={formData.rent || ""}
                    onChange={handleChange}
                    placeholder="উদাঃ ৫০০০"
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">অবস্থান/ঠিকানা</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    placeholder="উদাঃ বিড়ালদহ বাজার, পুঠিয়া"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">বিস্তারিত বিবরণ</label>
              <textarea 
                required
                name="details"
                value={formData.details || ""}
                onChange={handleChange}
                rows={5}
                placeholder="প্রপার্টির সুযোগ-সুবিধা সম্পর্কে বিস্তারিত লিখুন (উদাঃ বিদ্যুৎ, পানি, গ্যাস, সিকিউরিটি ইত্যাদি)..."
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700 resize-none"
              />
            </div>

            {/* Owner Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">মালিকের নাম</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="ownerName"
                    value={formData.ownerName || ""}
                    onChange={handleChange}
                    placeholder="পূর্ণ নাম"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">যোগাযোগ নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="ownerPhone"
                    value={formData.ownerPhone || ""}
                    onChange={handleChange}
                    placeholder="০১XXX-XXXXXX"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
              আপনার বিজ্ঞাপনটি প্রকাশের আগে এডমিন দ্বারা যাচাই করা হতে পারে। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || success}
            type="submit"
            className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
              success 
                ? "bg-purple-500 text-white" 
                : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200"
            } disabled:opacity-70`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>সফলভাবে প্রকাশিত হয়েছে <CheckCircle2 size={20} /></>
            ) : (
              isEdit ? "পরিবর্তন সংরক্ষণ করুন" : "বিজ্ঞাপনটি প্রকাশ করুন"
            )}
          </motion.button>
        </form>
      </div>
    );
  };

export default PropertyForm;

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Camera, 
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { addBusiness, updateBusiness, compressImageToBase64 } from "../../api";
import { db } from "../../firebase";
import { Business } from "../../types";
import { doc, getDoc } from "firebase/firestore";
import Header from "../home/Header";

const BusinessForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<Omit<Business, "id" | "createdAt" | "status">>({
    userId: user?.uid || "",
    name: "",
    description: "",
    category: "অন্যান্য",
    address: "",
    union: "পুঠিয়া",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    imageUrl: "",
    logoUrl: "",
    ownerName: "",
    rating: 0,
    reviewCount: 0,
    images: [],
    location: { lat: 24.3683, lng: 88.8475 },
    openingHours: { open: "09:00 AM", close: "08:00 PM" }
  });

  const categories = [
    "মুদি ও কাঁচাবাজার",
    "রেস্টুরেন্ট ও ক্যাফে",
    "ইলেকট্রনিক্স",
    "পোশাক ও ফ্যাশন",
    "ফার্নিচার",
    "ডায়াগনস্টিক ও ফার্মেসী",
    "শিক্ষা ও কোচিং",
    "কৃষি উপকরণ",
    "অন্যান্য"
  ];

  useEffect(() => {
    if (isEdit) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const docRef = doc(db, "businesses", id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Business;
        if (data.userId !== user?.uid) {
          setError("আপনার এই ব্যবসা পরিবর্তনের অনুমতি নেই।");
          return;
        }
        const { id: _, createdAt: __, status: ___, ...rest } = data;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageToBase64(file);
        setFormData(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'imageUrl']: base64 }));
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
        await updateBusiness(id!, formData);
      } else {
        await addBusiness({ ...formData, userId: user.uid });
      }
      setSuccess(true);
      setTimeout(() => navigate("/my-business"), 2000);
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
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
          <button 
            onClick={() => navigate("/my-business")}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-600 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">ফিরে যান</span>
          </button>
          <h1 className="text-3xl font-black text-emerald-950">
            {isEdit ? "ব্যবসার তথ্য পরিবর্তন" : "নতুন ব্যবসা নিবন্ধন"}
          </h1>
          <p className="text-sm font-bold text-gray-400 mt-2">
            আপনার ব্যবসার সঠিক তথ্য প্রদান করুন যা ডিজিটাল ডিরেক্টরিতে প্রদর্শিত হবে
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
          {/* Visuals Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-black text-emerald-950 uppercase tracking-widest mb-4">ব্যবসার লোগো</label>
              <div className="relative group">
                <div className="w-full aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-gray-300 mb-2" size={24} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">আপলোড</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-emerald-950 uppercase tracking-widest mb-4">ব্যানার বা দোকানের ছবি</label>
              <div className="relative group h-[calc(100%-2rem)]">
                <div className="w-full h-full min-h-[120px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-gray-300 mb-2" size={24} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">কভার ফটো যোগ করুন</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ব্যবসার নাম</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="উদাঃ শফিক স্টোর"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ক্যাটেগরি</label>
                <select 
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat || ""}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ব্যবসার বিবরণ</label>
              <textarea 
                required
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                placeholder="আপনার ব্যবসার সংক্ষিপ্ত বিবরণ দিন..."
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ঠিকানা</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    placeholder="উদাঃ বাসস্ট্যান্ড, পুঠিয়া"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ফোন নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="০১৭০০-০০০০০০"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ইমেইল (ঐচ্ছিক)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">ওয়েবসাইট (ঐচ্ছিক)</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    placeholder="https://www.yoursite.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">খোলার সময়</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="open"
                    value={formData.openingHours?.open || "09:00 AM"}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      openingHours: { ...prev.openingHours!, open: e.target.value } 
                    }))}
                    placeholder="09:00 AM"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">বন্ধের সময়</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="close"
                    value={formData.openingHours?.close || "08:00 PM"}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      openingHours: { ...prev.openingHours!, close: e.target.value } 
                    }))}
                    placeholder="08:00 PM"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">বন্ধের দিন (ঐচ্ছিক)</label>
                <select 
                  name="offDay"
                  value={formData.openingHours?.offDay || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    openingHours: { ...prev.openingHours!, offDay: e.target.value } 
                  }))}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="">কোনো দিন বন্ধ নেই</option>
                  <option value="Friday">শুক্রবার</option>
                  <option value="Saturday">শনিবার</option>
                  <option value="Sunday">রবিবার</option>
                  <option value="Monday">সোমবার</option>
                  <option value="Tuesday">মঙ্গলবার</option>
                  <option value="Wednesday">বুধবার</option>
                  <option value="Thursday">বৃহস্পতিবার</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-950 uppercase tracking-widest ml-1">মালিকের নাম</label>
              <input 
                name="ownerName"
                value={formData.ownerName || ""}
                onChange={handleChange}
                placeholder="মালিকের পূর্ণ নাম"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || success}
            type="submit"
            className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
              success 
                ? "bg-emerald-500 text-white" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            } disabled:opacity-70`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : success ? (
              <>সফলভাবে সম্পন্ন হয়েছে <CheckCircle2 size={20} /></>
            ) : (
              isEdit ? "পরিবর্তন সংরক্ষণ করুন" : "ব্যবসা নিবন্ধন সম্পন্ন করুন"
            )}
          </motion.button>
        </form>
      </div>
    );
  };

export default BusinessForm;

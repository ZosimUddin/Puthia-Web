import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Sparkles, AlertCircle, CheckCircle2, Camera, Tag, MapPin, Phone, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { CATEGORIES, IMAGE_PRESETS } from './constants';
import { MarketplaceItem } from '../../../types';

interface MarketplaceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingItem?: MarketplaceItem | null;
  isSubmitting: boolean;
  onOpenUpgrade?: () => void;
}

const MarketplaceForm: React.FC<MarketplaceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isSubmitting,
  onOpenUpgrade
}) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'mobile',
    price: '',
    unit: 'পিস',
    condition: 'new' as 'new' | 'used',
    location: 'পুঠিয়া, রাজশাহী',
    description: '',
    images: [''],
    sellerName: '',
    sellerPhone: '',
    itemType: 'product' as 'product' | 'service',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        category: editingItem.category,
        price: editingItem.price.toString(),
        unit: editingItem.unit || 'পিস',
        condition: editingItem.condition || 'new',
        location: editingItem.location,
        description: editingItem.description,
        images: editingItem.images && editingItem.images.length > 0 ? editingItem.images : [''],
        sellerName: editingItem.sellerName,
        sellerPhone: editingItem.sellerPhone,
        itemType: editingItem.itemType || 'product',
      });
    } else if (userProfile) {
      setFormData(prev => ({
        ...prev,
        sellerName: userProfile.name || '',
        sellerPhone: userProfile.phone || '',
        location: userProfile.village ? `${userProfile.village}, ${userProfile.union || 'পুঠিয়া'}` : prev.location
      }));
    }
  }, [editingItem, userProfile, isOpen]);

  const subPlan = userProfile?.marketplaceSubscription || 'free';
  const maxImages = subPlan === 'free' ? 1 : subPlan === 'premium' ? 5 : 10;

  const addImageField = () => {
    if (formData.images.length >= maxImages) {
      if (onOpenUpgrade) {
        if (window.confirm(`আপনার ${subPlan === 'free' ? 'ফ্রি' : 'প্রিমিয়াম'} প্ল্যানে সর্বোচ্চ ${maxImages}টি ছবি দেওয়া সম্ভব। আরও ছবি যোগ করতে আপনার সাবস্ক্রিপশন প্ল্যান আপগ্রেড করুন!`)) {
          onClose();
          onOpenUpgrade();
        }
      } else {
        alert(`আপনার ${subPlan === 'free' ? 'ফ্রি' : 'প্রিমিয়াম'} প্ল্যানে সর্বোচ্চ ${maxImages}টি ছবি দেওয়া সম্ভব।`);
      }
      return;
    }
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = formData.itemType === 'service' ? 'সেবার নাম/শিরোনাম আবশ্যক' : 'পণ্যের নাম আবশ্যক';
    }
    if (!formData.price || isNaN(Number(formData.price))) newErrors.price = 'সঠিক মূল্য দিন';
    if (!formData.location.trim()) newErrors.location = 'অবস্থান আবশ্যক';
    if (!formData.description.trim()) newErrors.description = 'বিবরণ আবশ্যক';
    if (!formData.sellerName.trim()) newErrors.sellerName = 'নাম আবশ্যক';
    if (!formData.sellerPhone.trim()) newErrors.sellerPhone = 'ফোন নম্বর আবশ্যক';
    if (formData.images.every(img => !img.trim())) newErrors.images = 'অন্তত একটি ছবির ইউআরএল দিন';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Filter out empty images and use first one for compatibility if needed
    const validImages = formData.images.filter(img => img.trim());
    
    // Determine verification status
    const isVerifiedSeller = userProfile?.nidStatus === 'verified' || 
                             userProfile?.mobileVerifyStatus === 'verified' ||
                             (userProfile?.role === 'admin' || 
                              userProfile?.role === 'super_admin' || 
                              userProfile?.role === 'staff' ||
                              userProfile?.role === 'editor' || 
                              userProfile?.role === 'moderator');
    
    await onSubmit({
      ...formData,
      price: Number(formData.price),
      images: validImages,
      imageUrl: validImages[0], // For backward compatibility
      sellerVerified: isVerifiedSeller,
      sellerAvatar: userProfile?.photoURL || '',
      sellerSubscription: subPlan,
      sellerRating: 4.0 + ((userProfile?.uid?.charCodeAt(0) || 5) % 10) * 0.1, // Seeded dynamic rating
      sellerMemberSince: userProfile?.createdAt 
        ? new Date(userProfile.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' }) 
        : 'আগস্ট ২০২৬'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-none sm:rounded-[64px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[90vh]"
      >
        <div className="p-8 sm:p-10 bg-emerald-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-[28px] border border-white/20">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">{editingItem ? "বিজ্ঞাপন আপডেট করুন" : "নতুন বিজ্ঞাপন দিন"}</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">পুঠিয়া ডিজিটাল মার্কেটপ্লেস</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/20 rounded-3xl transition-all border border-transparent hover:border-white/20">
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-12 overflow-y-auto space-y-12 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={14} className="text-emerald-500" /> সাধারণ তথ্য
                </h4>

                {/* Item Type Switcher */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">বিজ্ঞাপনের ধরণ</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, itemType: 'product' })}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                        formData.itemType === 'product' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      📦 পণ্য (Product)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, itemType: 'service' })}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
                        formData.itemType === 'service' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      🛠️ সেবা (Service)
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {formData.itemType === 'service' ? 'সেবার নাম / বিবরণ শিরোনাম *' : 'পণ্যের নাম *'}
                  </label>
                  <input
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder={formData.itemType === 'service' ? "যেমন: গৃহস্থালি ইলেকট্রনিক্স মেরামত সেবা" : "যেমন: ফ্রেশ কন্ডিশন ল্যাপটপ"}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white focus:ring-0 transition-all outline-none"
                  />
                  {errors.title && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ক্যাটাগরি</label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id || ""}>{cat.emoji} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">অবস্থা</label>
                    <select
                      disabled={formData.itemType === 'service'}
                      value={formData.itemType === 'service' ? 'new' : formData.condition || ""}
                      onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
                      className={`w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none ${
                        formData.itemType === 'service' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="new">নতুন / প্রযোজ্য নয়</option>
                      <option value="used">ব্যবহৃত</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {formData.itemType === 'service' ? 'সার্ভিস চার্জ / মূল্য (৳) *' : 'মূল্য (৳) *'}
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">একক (চার্জিং রেট)</label>
                    <input
                      value={formData.unit || ""}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                      placeholder={formData.itemType === 'service' ? "যেমন: প্রতি ঘন্টা / আলোচনা সাপেক্ষে" : "যেমন: পিস / কেজি"}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" /> অবস্থান ও যোগাযোগ
                </h4>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">অবস্থান *</label>
                  <input
                    required
                    value={formData.location || ""}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="যেমন: ধোকড়াকুল, পুঠিয়া"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">আপনার নাম</label>
                    <input
                      required
                      value={formData.sellerName || ""}
                      onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ফোন নম্বর</label>
                    <input
                      required
                      value={formData.sellerPhone || ""}
                      onChange={(e) => setFormData({...formData, sellerPhone: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera size={14} className="text-emerald-500" /> পণ্যের ছবি (ইউআরএল)
                  </h4>
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg ${
                    subPlan === 'featured' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                    subPlan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {subPlan === 'featured' ? '🥇 ফিচার্ড (সর্বোচ্চ ১০টি)' :
                     subPlan === 'premium' ? '🥈 প্রিমিয়াম (সর্বোচ্চ ৫টি)' :
                     'ফ্রি প্ল্যান (সর্বোচ্চ ১টি)'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <input
                        value={img || ""}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        placeholder={`ছবির ইউআরএল ${index + 1}`}
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] font-black text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all pr-16"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addImageField}
                      className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-all group"
                    >
                      <Plus size={18} className="group-hover:scale-110 transition-transform" /> আরও ছবি যোগ করুন
                    </button>
                    {subPlan !== 'featured' && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenUpgrade) onOpenUpgrade();
                        }}
                        className="px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-black text-[10px] rounded-[24px] hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Sparkles size={12} /> আপগ্রেড
                      </button>
                    )}
                  </div>
                  {errors.images && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.images}</p>}
                </div>
                
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <div className="flex gap-3">
                    <AlertCircle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                      টিপস: ভালো মানের ছবি দিলে পণ্য দ্রুত বিক্রি হওয়ার সম্ভাবনা বেশি থাকে। ইন্টারনেটে থাকা কোনো ছবির লিংক এখানে দিতে পারেন।
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm space-y-6 flex-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-emerald-500" /> বিস্তারিত বিবরণ *
                </h4>
                <textarea
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={8}
                  placeholder="আপনার পণ্য সম্পর্কে বিস্তারিত লিখুন... যেমন: কতদিন ব্যবহার করেছেন, কোনো সমস্যা আছে কি না ইত্যাদি।"
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent rounded-[32px] font-black text-sm resize-none focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
                {errors.description && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-7 bg-emerald-600 text-white rounded-[40px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-emerald-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : (editingItem ? "বিজ্ঞাপন আপডেট করুন" : "বিজ্ঞাপন প্রকাশ করুন")}
            <Sparkles size={24} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default MarketplaceForm;

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Building2, Phone, MapPin, User, Clock, ShieldCheck, Truck, CreditCard, Star, FileText } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { PHARMACY_CATEGORIES, UNIONS, RAJSHAHI_UPAZILAS } from './constants';
import { useAuth } from '../../../contexts/AuthContext';

interface RegistrationFormProps {
  onClose: () => void;
}

export default function PharmacyRegistrationForm({ onClose }: RegistrationFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    contactNumber: '',
    address: '',
    upazila: 'পুঠিয়া',
    union: UNIONS[1],
    category: 'model-pharmacy',
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    is24Hours: false,
    hasHomeDelivery: false,
    hasPharmacist: false,
    paymentMethods: ['Cash'],
    services: '',
    tradeLicense: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, "pharmacies_list"), {
        ...formData,
        services: formData.services.split(',').map(s => s.trim()).filter(s => s !== ''),
        status: 'pending',
        views: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'anonymous'
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      alert("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-600 text-white">
          <div className="space-y-1">
            <h2 className="text-2xl font-black">নতুন ফার্মেসি যুক্ত করুন</h2>
            <p className="text-emerald-100 text-sm font-bold">সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {success ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">আবেদন সফলভাবে জমা হয়েছে!</h3>
              <p className="text-slate-500 font-bold max-w-md mx-auto">আমরা আপনার দেওয়া তথ্য যাচাই করে দ্রুত প্রকাশ করব। ধন্যবাদ।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ফার্মেসির নাম *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    value={formData.name || ""}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="ফার্মেসির নাম"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">মালিক/ব্যবস্থাপকের নাম *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    value={formData.ownerName || ""}
                    onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="মালিকের নাম"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">যোগাযোগ নম্বর *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    value={formData.contactNumber || ""}
                    onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="মোবাইল নম্বর"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ফার্মেসির ধরন *</label>
                <select 
                  required
                  value={formData.category || ""}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                >
                  {PHARMACY_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => <option key={cat.id} value={cat.id || ""}>{cat.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">উপজেলা / থানা *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required
                    value={formData.upazila || "পুঠিয়া"}
                    onChange={e => setFormData({...formData, upazila: e.target.value as any})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                  >
                    {RAJSHAHI_UPAZILAS.map(u => <option key={u} value={u || ""}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ইউনিয়ন / এলাকা *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    required
                    value={formData.union || ""}
                    onChange={e => setFormData({...formData, union: e.target.value as any})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                  >
                    {UNIONS.filter(u => u !== 'সব ইউনিয়ন').map(u => <option key={u} value={u || ""}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ট্রেড লাইসেন্স (ঐচ্ছিক)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={formData.tradeLicense || ""}
                    onChange={e => setFormData({...formData, tradeLicense: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="লাইসেন্স নম্বর"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">বিস্তারিত ঠিকানা *</label>
                <textarea 
                  required
                  value={formData.address || ""}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px]"
                  placeholder="রাস্তা, এলাকা বা ল্যান্ডমার্কসহ পূর্ণ ঠিকানা"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">সময়সূচী</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <input 
                      type="text"
                      value={formData.openingTime || ""}
                      onChange={e => setFormData({...formData, openingTime: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <span className="text-slate-300">-</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="text"
                      value={formData.closingTime || ""}
                      onChange={e => setFormData({...formData, closingTime: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">অন্যান্য সুবিধা</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.is24Hours}
                      onChange={e => setFormData({...formData, is24Hours: e.target.checked})}
                      className="w-5 h-5 rounded-lg accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">২৪ ঘণ্টা খোলা</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.hasHomeDelivery}
                      onChange={e => setFormData({...formData, hasHomeDelivery: e.target.checked})}
                      className="w-5 h-5 rounded-lg accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">হোম ডেলিভারি</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.hasPharmacist}
                      onChange={e => setFormData({...formData, hasPharmacist: e.target.checked})}
                      className="w-5 h-5 rounded-lg accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">ফার্মাসিস্ট আছে</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">সেবার বিবরণ (কমা দিয়ে লিখুন)</label>
                <input 
                  value={formData.services || ""}
                  onChange={e => setFormData({...formData, services: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="উদাঃ ইনসুলিন, প্রেসার চেকআপ, নেবুলাইজার"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  disabled={loading}
                  className="w-full py-5 rounded-[24px] bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>আবেদন জমা দিন <ShieldCheck size={18} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

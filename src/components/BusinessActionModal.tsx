import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, Camera, MapPin, Phone, Globe, MessageSquare, AlertCircle, Edit3, Image as ImageIcon, Flame, Package, Store } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface BusinessActionModalProps {
  action: { type: string; businessId: string } | null;
  onClose: () => void;
  showToast: (msg: string) => void;
  business?: any;
}

export const BusinessActionModal = ({ action, onClose, showToast, business }: BusinessActionModalProps) => {
  if (!action || !business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('আপডেট সফল হয়েছে!');
    onClose();
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "local_shops", business.id));
      showToast('ব্যবসা ডিলিট করা হয়েছে');
      onClose();
    } catch (error) {
      showToast('ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const renderContent = () => {
    switch (action.type) {
      case 'editProfile':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ব্যবসার নাম</label>
                <input type="text" defaultValue={business.name || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ক্যাটাগরি</label>
                <select defaultValue={business.category || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white">
                  <option value="shop_grocery">মুদি দোকান</option>
                  <option value="restaurant">রেস্টুরেন্ট</option>
                  <option value="shop_pharmacy">ফার্মেসি</option>
                  {/* Add more as needed */}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ঠিকানা</label>
                <input type="text" defaultValue={business.address || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ফোন নম্বর</label>
                <input type="tel" defaultValue={business.phone || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp</label>
                <input type="tel" placeholder="+8801..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Facebook Page</label>
                <input type="url" placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Website</label>
                <input type="url" placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Google Map Link</label>
                <input type="url" placeholder="https://maps.google.com/..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">লোগো / ছবি</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-400 group-hover:text-indigo-500 mb-2" />
                <p className="text-sm font-medium text-slate-600">লোগো আপলোড করতে ক্লিক করুন</p>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">বিস্তারিত বর্ণনা</label>
              <textarea rows={3} placeholder="আপনার ব্যবসার বর্ণনা..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white resize-none"></textarea>
            </div>

            <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> প্রোফাইল আপডেট করুন
            </button>
          </form>
        );

      case 'addOffer':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">অফারের নাম / ডিসকাউন্ট</label>
              <input type="text" placeholder="যেমন: ২০% ছাড়" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">শুরুর তারিখ</label>
                <input type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">শেষ তারিখ</label>
                <input type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ব্যানার আপলোড</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-rose-400 hover:bg-rose-50 transition-colors cursor-pointer group">
                <Flame className="w-10 h-10 mx-auto text-slate-300 group-hover:text-rose-500 mb-3" />
                <p className="text-sm font-medium text-slate-600">অফারের ব্যানার আপলোড করুন</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max: 2MB)</p>
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> অফার যোগ করুন
            </button>
          </form>
        );

      case 'addProducts':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পণ্যের নাম</label>
                <input type="text" placeholder="পণ্যের নাম লিখুন" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">মূল্য (৳)</label>
                <input type="number" placeholder="0.00" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ক্যাটাগরি</label>
                <input type="text" placeholder="যেমন: ইলেকট্রনিক্স" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">স্টক</label>
                <input type="number" placeholder="কত পিস আছে?" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">পণ্যের বর্ণনা</label>
              <textarea rows={2} placeholder="বিস্তারিত..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white resize-none"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">পণ্যের ছবি</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer group">
                <Package className="w-8 h-8 mx-auto text-slate-300 group-hover:text-amber-500 mb-2" />
                <p className="text-sm font-medium text-slate-600">ছবি আপলোড করতে ক্লিক করুন</p>
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> প্রোডাক্ট সেভ করুন
            </button>
          </form>
        );

      case 'uploadPhotos':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ফটো / ভিডিও টাইপ</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-slate-50 focus:bg-white">
                <option value="shop">দোকানের ছবি</option>
                <option value="product">পণ্যের ছবি</option>
                <option value="gallery">গ্যালারি</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ফটো / ভিডিও সিলেক্ট করুন</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                <Camera className="w-12 h-12 mx-auto text-slate-300 group-hover:text-blue-500 mb-3" />
                <p className="text-sm font-bold text-slate-600">Browse Files to Upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, MP4</p>
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" /> আপলোড করুন
            </button>
          </form>
        );

      case 'reviews':
        return (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">U{i}</div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 m-0">Customer {i}</h4>
                        <div className="flex text-emerald-500">
                          {'★★★★★'.split('').map((star, idx) => <span key={idx} className="text-xs">{star}</span>)}
                        </div>
                      </div>
                   </div>
                   <span className="text-xs text-slate-400 font-medium">২ দিন আগে</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed m-0">খুব ভালো সার্ভিস পেয়েছি। প্রোডাক্টের মানও অনেক ভালো ছিল।</p>
                <div className="flex items-center gap-2 mt-1 pt-3 border-t border-slate-200">
                   <button onClick={() => showToast('রিপ্লাই অপশন শীঘ্রই আসছে!')} className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                     রিপ্লাই দিন
                   </button>
                   <button onClick={() => showToast('রিপোর্ট করা হয়েছে')} className="flex-none py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                     রিপোর্ট
                   </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'delete':
        return (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              এই ব্যবসাটি মুছে ফেললে তা আর ফিরে পাওয়া যাবে না। আপনি চাইলে এটি সাময়িকভাবে আর্কাইভ করে রাখতে পারেন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onClose} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                বাতিল করুন
              </button>
              <button onClick={() => showToast('ব্যবসা আর্কাইভ করা হয়েছে')} className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-xl text-sm transition-colors">
                আর্কাইভ করুন
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-red-200">
                ডিলিট করুন
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (action.type) {
      case 'editProfile': return { text: 'প্রোফাইল আপডেট', icon: Edit3, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'addOffer': return { text: 'নতুন অফার', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50' };
      case 'addProducts': return { text: 'পণ্য যোগ করুন', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'uploadPhotos': return { text: 'ছবি/ভিডিও আপলোড', icon: Camera, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'reviews': return { text: 'কাস্টমার রিভিউ', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'delete': return { text: 'ব্যবসা মুছুন', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default: return { text: '', icon: Store, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  const titleData = getTitle();
  const Icon = titleData.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[24px] w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
           <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${titleData.bg} ${titleData.color}`}>
               <Icon className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-800 m-0">{titleData.text}</h3>
               <p className="text-xs font-medium text-slate-500 m-0 truncate max-w-[200px]">{business.name}</p>
             </div>
           </div>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
             <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

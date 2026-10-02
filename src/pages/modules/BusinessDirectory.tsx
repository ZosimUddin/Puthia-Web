import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, MapPin, Phone, Star, Trash2, Edit, X, Sparkles, Store as StoreIcon,
  Globe, Facebook, Mail, Clock, ShieldCheck, Camera, Plus
} from 'lucide-react';
import { ItemActions } from '../../components/common/ItemActions';
import { RatingModal } from '../../components/common/RatingModal';
import { GoogleMapEmbed } from '../../components/common/GoogleMapEmbed';
import ModulePageLayout from '../../components/common/ModulePageLayout';
import { useAuth } from "../../contexts/AuthContext";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, deleteDoc, doc, setDoc, serverTimestamp 
} from "firebase/firestore";

interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  rating?: number;
  ratingCount?: number;
  logoUrl?: string;
  status?: string;
  description?: string;
  email?: string;
  website?: string;
  facebook?: string;
  openingHours?: string;
  createdAt?: any;
}

const BusinessDirectory: React.FC = () => {
  const { userProfile } = useAuth();
  const user = userProfile;
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [ratingTarget, setRatingTarget] = useState<{id: string, name: string} | null>(null);

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    address: "",
    phone: "",
    description: "",
    email: "",
    website: "",
    facebook: "",
    openingHours: "",
    logoUrl: ""
  });

  const isStaff = userProfile?.role === 'admin' || userProfile?.role === 'staff' || userProfile?.role === 'super_admin';

  useEffect(() => {
    const q = query(collection(db, "businesses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Business[];
      setBusinesses(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "businesses");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        status: 'approved',
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      if (editingId) {
        await setDoc(doc(db, "businesses", editingId), data, { merge: true });
      } else {
        await addDoc(collection(db, "businesses"), {
          ...data,
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
      }

      resetForm();
    } catch (error) {
      handleFirestoreError(error as any, editingId ? OperationType.UPDATE : OperationType.CREATE, `businesses/${editingId || ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ব্যবসাটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "businesses", id));
    } catch (error) {
      handleFirestoreError(error as any, OperationType.DELETE, `businesses/${id}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      address: "",
      phone: "",
      description: "",
      email: "",
      website: "",
      facebook: "",
      openingHours: "",
      logoUrl: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (business: Business, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone,
      description: business.description || "",
      email: business.email || "",
      website: business.website || "",
      facebook: business.facebook || "",
      openingHours: business.openingHours || "",
      logoUrl: business.logoUrl || ""
    });
    setEditingId(business.id);
    setShowForm(true);
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = activeFilter === 'all' || b.category === activeFilter;
    if (activeFilter === 'nearby') {
      matchesFilter = b.address.includes(userProfile?.union || 'Banerswar');
    }
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // default newest
  });

  const categories = Array.from(new Set(businesses.map(b => b.category)));
  const filterOptions = [
    { id: 'all', label: 'সবগুলো' },
    { id: 'nearby', label: 'কাছাকাছি' },
    ...categories.map(cat => ({ id: cat, label: cat }))
  ];

  return (
    <ModulePageLayout
      title="ব্যবসা নির্দেশিকা"
      subtitle="পুঠিয়া উপজেলার সকল ব্যবসা প্রতিষ্ঠানের তথ্য ও যোগাযোগ"
      loading={loading}
      addCategory="shop"
      onAddClick={undefined} // Let it open the universal add modal for citizens
      onSearchChange={setSearchTerm}
      filters={filterOptions}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      itemCount={filteredBusinesses.length}
    >
      <div className="flex justify-end mb-6">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:border-emerald-500 bg-white"
        >
          <option value="newest">নতুন যোগ করা</option>
          <option value="rating">সর্বোচ্চ রেটিং</option>
          <option value="name">নাম (A-Z)</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBusinesses.map((business, index) => (
          <motion.div
            key={business.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
          >
            {/* Admin Controls */}
            {isStaff && (
              <div className="absolute top-6 right-6 flex gap-2 z-10">
                <button 
                  onClick={(e) => openEdit(business, e)}
                  className="p-3 bg-white/90 backdrop-blur-md border border-slate-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all shadow-sm"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => handleDelete(business.id, e)}
                  className="p-3 bg-white/90 backdrop-blur-md border border-slate-100 text-rose-600 rounded-2xl hover:bg-rose-50 transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 shrink-0 rounded-[24px] bg-emerald-50 flex items-center justify-center overflow-hidden">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 text-xl mb-1 truncate group-hover:text-emerald-600 transition-colors">
                  {business.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {business.category}
                  </span>
                </div>
                {business.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-emerald-500 fill-amber-400" />
                    <span className="text-sm font-black text-slate-700">{business.rating}</span>
                    <span className="text-xs font-bold text-slate-400">({business.ratingCount})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                  <MapPin size={16} />
                </div>
                <p className="text-sm font-bold text-slate-500 leading-relaxed pt-1">
                  {business.address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                  <Phone size={16} />
                </div>
                <p className="text-sm font-black text-slate-700">
                  {business.phone}
                </p>
              </div>
              {business.openingHours && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                    <Clock size={16} />
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    {business.openingHours}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-6 border-t border-slate-50">
              <a href={`tel:${business.phone}`} className="w-full sm:flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Phone size={16} /> যোগাযোগ করুন
              </a>
            </div>
            
            <button onClick={() => setRatingTarget({ id: business.id, name: business.name })} className="p-2 bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all" title="রিভিউ ও মতামত"><Star size={16} /></button>
                    <ItemActions 
              id={business.id} 
              type="business" 
              title={business.name} 
              phone={business.phone} 
              location={business.address} 
              url={`${window.location.origin}/business?id=${business.id}`} 
            />
          </motion.div>
        ))}
      </div>

      {/* Admin Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 bg-emerald-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-[20px]">
                    <StoreIcon size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{editingId ? "ব্যবসা আপডেট করুন" : "নতুন ব্যবসা যোগ করুন"}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">অ্যাডমিন কন্ট্রোল</p>
                  </div>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ব্যবসার নাম</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        placeholder="যেমন: পুঠিয়া স্টোর"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ক্যাটাগরি</label>
                      <input
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        placeholder="যেমন: মুদি দোকান, কাপড়ের দোকান"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ঠিকানা</label>
                      <input
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ফোন নম্বর</label>
                      <input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">লোগো ইউআরএল (ঐচ্ছিক)</label>
                      <div className="relative">
                        <input
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                          className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          placeholder="https://example.com/logo.png"
                        />
                        <Camera className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">খোলার সময়</label>
                      <input
                        value={formData.openingHours}
                        onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        placeholder="যেমন: সকাল ১০টা - রাত ৮টা"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">বর্ণনা (ঐচ্ছিক)</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-black text-sm resize-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ইমেইল</label>
                    <input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ওয়েবসাইট</label>
                    <input
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ফেসবুক পেজ</label>
                    <input
                      value={formData.facebook}
                      onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                      className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl font-black text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-emerald-600 text-white rounded-[32px] font-black text-lg flex items-center justify-center gap-4 shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : (editingId ? "ব্যবসা আপডেট করুন" : "ব্যবসা যোগ করুন")}
                  <Sparkles size={24} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <RatingModal 
        isOpen={!!ratingTarget} 
        onClose={() => setRatingTarget(null)} 
        targetId={ratingTarget?.id || ''} 
        targetType="business" 
        targetName={ratingTarget?.name || ''} 
      />
    </ModulePageLayout>
  );
};

export default BusinessDirectory;

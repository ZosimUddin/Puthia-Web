import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Star, 
  Trash2, 
  AlertTriangle, 
  MoreVertical,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  ExternalLink,
  Phone,
  MapPin,
  Plus,
  Loader2,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getAllBusinesses, 
  updateBusinessStatus, 
  toggleBusinessVerification, 
  toggleBusinessFeatured, 
  deleteBusiness,
  getBusinessCategories,
  addBusinessCategory,
  deleteBusinessCategory
} from "../../api";
import { Business, Category } from "../../types";

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'reported' | 'categories'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bizData, catData] = await Promise.all([
        getAllBusinesses(),
        getBusinessCategories()
      ]);
      setBusinesses(bizData);
      setCategories(catData);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateBusinessStatus(id, status);
      await fetchData();
    } catch (error) {
      alert("অ্যাকশন সম্পন্ন করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerification = async (biz: Business) => {
    setActionLoading(biz.id);
    try {
      await toggleBusinessVerification(biz.id, !biz.isVerified);
      await fetchData();
    } catch (error) {
      alert("ভেরিফিকেশন আপডেট করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (biz: Business) => {
    setActionLoading(biz.id);
    try {
      await toggleBusinessFeatured(biz.id, !biz.isFeatured);
      await fetchData();
    } catch (error) {
      alert("ফিচার্ড স্ট্যাটাস আপডেট করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ব্যবসাটি মুছে ফেলতে চান?")) return;
    setActionLoading(id);
    try {
      await deleteBusiness(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryLabel.trim()) return;
    setLoading(true);
    try {
      await addBusinessCategory(newCategoryLabel.trim());
      setNewCategoryLabel("");
      await fetchData();
    } catch (error) {
      alert("ক্যাটাগরি যোগ করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("এই ক্যাটাগরি মুছে ফেলতে চান?")) return;
    setLoading(true);
    try {
      await deleteBusinessCategory(id);
      await fetchData();
    } catch (error) {
      alert("ক্যাটাগরি মুছে ফেলা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'pending') return matchesSearch && b.status === 'pending';
    if (activeTab === 'reported') return matchesSearch && (b.reportCount || 0) > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">বিজনেস ডিরেক্টরি কন্ট্রোল</h2>
            <p className="text-xs font-bold text-gray-400">ব্যবসা অনুমোদন ও ব্যবস্থাপনা প্যানেল</p>
          </div>
          <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-100">
             {[
               { id: 'all', label: 'সকল ব্যবসা' },
               { id: 'pending', label: 'অনুমোদন পেন্ডিং', count: businesses.filter(b => b.status === 'pending').length },
               { id: 'reported', label: 'রিপোর্টেড', count: businesses.filter(b => (b.reportCount || 0) > 0).length },
               { id: 'categories', label: 'ক্যাটাগরি' }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {tab.label}
                 {tab.count !== undefined && tab.count > 0 && (
                   <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                     {tab.count}
                   </span>
                 )}
               </button>
             ))}
          </div>
        </div>

        {activeTab !== 'categories' && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="ব্যবসার নাম বা ক্যাটাগরি দিয়ে খুঁজুন..." 
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
              />
            </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-3.5 rounded-2xl border transition-all ${viewMode === 'list' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
               >
                 <List size={20} />
               </button>
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-3.5 rounded-2xl border transition-all ${viewMode === 'grid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
               >
                 <LayoutGrid size={20} />
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center text-gray-400"
          >
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">তথ্য লোড হচ্ছে...</p>
          </motion.div>
        ) : activeTab === 'categories' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8"
          >
            <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
              <input 
                type="text" 
                placeholder="নতুন ক্যাটাগরির নাম..." 
                value={newCategoryLabel || ""}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                className="flex-1 px-6 py-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
              />
              <button 
                type="submit"
                className="bg-[#007A5E] text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#00634B] transition-all shadow-lg shadow-emerald-100"
              >
                <Plus size={20} /> যোগ করুন
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-5 bg-[#F8FAFC] border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <Tag size={20} />
                    </div>
                    <span className="font-bold text-gray-700">{cat.label}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : filteredBusinesses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100"
          >
            কোন ব্যবসা পাওয়া যায়নি
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredBusinesses.map(biz => (
              <motion.div 
                layout
                key={biz.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white border rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-xl ${biz.status === 'pending' ? 'border-amber-100' : (biz.reportCount || 0) > 0 ? 'border-rose-100' : 'border-gray-50'}`}
              >
                <div className={viewMode === 'grid' ? "flex flex-col" : "flex flex-col lg:flex-row items-center p-4 gap-6"}>
                  {/* Image/Icon Section */}
                  <div className={viewMode === 'grid' ? "relative h-48 w-full" : "relative w-24 h-24 shrink-0"}>
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 rounded-2xl">
                        <Building2 size={viewMode === 'grid' ? 48 : 32} />
                      </div>
                    )}
                    {biz.isVerified && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                        <ShieldCheck size={14} />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className={`flex-1 ${viewMode === 'grid' ? "p-6" : "py-2"}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-wider">
                         {biz.category}
                       </span>
                       {biz.status === 'pending' && (
                         <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100">অনুমোদন প্রয়োজন</span>
                       )}
                       {(biz.reportCount || 0) > 0 && (
                         <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 flex items-center gap-1">
                           <AlertTriangle size={10} /> {biz.reportCount}টি রিপোর্ট
                         </span>
                       )}
                    </div>
                    
                    <h4 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
                      {biz.name}
                      {biz.isFeatured && <Star size={16} className="text-amber-500 fill-amber-500" />}
                    </h4>
                    
                    <p className="text-xs font-bold text-gray-400 line-clamp-1 mb-4">{biz.description}</p>
                    
                    <div className="space-y-2 mb-6">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                         <Phone size={14} className="text-gray-300" />
                         <span>{biz.phone}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                         <MapPin size={14} className="text-gray-300" />
                         <span className="truncate">{biz.address}</span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                      {biz.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(biz.id, 'approved')}
                            disabled={!!actionLoading}
                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all disabled:opacity-50"
                          >
                            অনুমোদন দিন
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(biz.id, 'rejected')}
                            disabled={!!actionLoading}
                            className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-all disabled:opacity-50"
                          >
                            রিজেক্ট
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleToggleVerification(biz)}
                            className={`p-2.5 rounded-xl transition-all ${biz.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                            title={biz.isVerified ? "ভেরিফিকেশন সরান" : "ভেরিফাই করুন"}
                          >
                            <ShieldCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleFeatured(biz)}
                            className={`p-2.5 rounded-xl transition-all ${biz.isFeatured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
                            title={biz.isFeatured ? "ফিচার্ড সরান" : "ফিচার্ড করুন"}
                          >
                            <Star size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(biz.id)}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all ml-auto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessManagement;

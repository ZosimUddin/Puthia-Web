import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Home, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Trash2, 
  AlertTriangle, 
  Filter,
  Loader2,
  Tag,
  Phone,
  User,
  MapPin,
  ExternalLink,
  ChevronRight,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getMarketplaceItems, 
  updateMarketplaceItemStatus, 
  toggleMarketplaceItemFeatured, 
  deleteMarketplaceItem,
  getToLetAds,
  updateToLetAdStatus,
  toggleToLetAdFeatured,
  deleteToLetAd
} from "../../api";
import { MarketplaceItem, ToLetAd } from "../../types";

const AdModeration = () => {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [toLetAds, setToLetAds] = useState<ToLetAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'tolet'>('marketplace');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketData, toletData] = await Promise.all([
        getMarketplaceItems(),
        getToLetAds()
      ]);
      setMarketplaceItems(marketData);
      setToLetAds(toletData);
    } catch (error) {
      console.error("Error fetching ads data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarketplaceStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateMarketplaceItemStatus(id, status);
      await fetchData();
    } catch (error) {
      alert("অ্যাকশন সম্পন্ন করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarketplaceFeatured = async (item: MarketplaceItem) => {
    setActionLoading(item.id);
    try {
      await toggleMarketplaceItemFeatured(item.id, !item.isFeatured);
      await fetchData();
    } catch (error) {
      alert("ফিচার্ড স্ট্যাটাস আপডেট করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarketplaceDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?")) return;
    setActionLoading(id);
    try {
      await deleteMarketplaceItem(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToLetStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateToLetAdStatus(id, status);
      await fetchData();
    } catch (error) {
      alert("অ্যাকশন সম্পন্ন করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToLetFeatured = async (ad: ToLetAd) => {
    setActionLoading(ad.id);
    try {
      await toggleToLetAdFeatured(ad.id, !ad.isFeatured);
      await fetchData();
    } catch (error) {
      alert("ফিচার্ড স্ট্যাটাস আপডেট করা যায়নি।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToLetDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই টু-লেট বিজ্ঞাপনটি মুছে ফেলতে চান?")) return;
    setActionLoading(id);
    try {
      await deleteToLetAd(id);
      await fetchData();
    } catch (error) {
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMarketplace = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredToLet = toLetAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ad.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderMarketplaceItem = (item: MarketplaceItem) => (
    <motion.div 
      layout
      key={item.id}
      className={`bg-white border rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-300 ${item.status === 'pending' ? 'border-amber-100' : 'border-gray-50'}`}
    >
      <div className="flex flex-col lg:flex-row items-center p-4 gap-6">
        <div className="relative w-full lg:w-32 h-32 shrink-0">
          {(item.images && item.images.length > 0) || item.imageUrl ? (
            <img src={item.images?.[0] || item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 rounded-2xl">
              <ShoppingBag size={32} />
            </div>
          )}
          {item.isFeatured && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
              <Star size={10} className="fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 py-2 w-full">
           <div className="flex items-center justify-between mb-2">
             <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-wider">
               {item.category.replace('_', ' ')}
             </span>
             {item.status === 'pending' && (
               <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100">অনুমোদন প্রয়োজন</span>
             )}
           </div>

           <h4 className="text-base font-black text-gray-900 mb-1">{item.title}</h4>
           <p className="text-xs font-bold text-gray-400 line-clamp-1 mb-3">{item.description}</p>
           
           <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <User size={14} className="text-gray-300" />
                <span>{item.sellerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <Phone size={14} className="text-gray-300" />
                <span>{item.sellerPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-600">
                <span>৳ {item.price.toLocaleString()}</span>
              </div>
           </div>

           <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
             {item.status === 'pending' ? (
               <>
                 <button 
                   onClick={() => handleMarketplaceStatus(item.id, 'approved')}
                   disabled={!!actionLoading}
                   className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                 >
                   অনুমোদন দিন
                 </button>
                 <button 
                   onClick={() => handleMarketplaceStatus(item.id, 'rejected')}
                   disabled={!!actionLoading}
                   className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-all"
                 >
                   রিজেক্ট
                 </button>
               </>
             ) : (
               <>
                 <button 
                   onClick={() => handleMarketplaceFeatured(item)}
                   className={`p-2.5 rounded-xl transition-all ${item.isFeatured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
                   title={item.isFeatured ? "ফিচার্ড থেকে সরান" : "ফিচার্ড করুন"}
                 >
                   <Star size={18} />
                 </button>
                 <button 
                   onClick={() => handleMarketplaceDelete(item.id)}
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
  );

  const renderToLetAd = (ad: ToLetAd) => (
    <motion.div 
      layout
      key={ad.id}
      className={`bg-white border rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-300 ${ad.status === 'pending' ? 'border-amber-100' : 'border-gray-50'}`}
    >
      <div className="flex flex-col lg:flex-row items-center p-4 gap-6">
        <div className="w-full lg:w-32 h-32 shrink-0 bg-rose-50 flex items-center justify-center text-rose-600 rounded-2xl relative">
          <Home size={32} />
          {ad.isFeatured && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
              <Star size={10} className="fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 py-2 w-full">
           <div className="flex items-center justify-between mb-2">
             <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full border border-gray-100 uppercase tracking-wider">
               {ad.category}
             </span>
             {ad.status === 'pending' && (
               <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100">অনুমোদন প্রয়োজন</span>
             )}
           </div>

           <h4 className="text-base font-black text-gray-900 mb-1">{ad.title}</h4>
           <p className="text-xs font-bold text-gray-400 line-clamp-1 mb-3">{ad.description}</p>
           
           <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <User size={14} className="text-gray-300" />
                <span>{ad.ownerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <Phone size={14} className="text-gray-300" />
                <span>{ad.ownerPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-600">
                <span>৳ {ad.rent}</span>
              </div>
           </div>

           <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
             {ad.status === 'pending' ? (
               <>
                 <button 
                   onClick={() => handleToLetStatus(ad.id, 'approved')}
                   disabled={!!actionLoading}
                   className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                 >
                   অনুমোদন দিন
                 </button>
                 <button 
                   onClick={() => handleToLetStatus(ad.id, 'rejected')}
                   disabled={!!actionLoading}
                   className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-all"
                 >
                   রিজেক্ট
                 </button>
               </>
             ) : (
               <>
                 <button 
                   onClick={() => handleToLetFeatured(ad)}
                   className={`p-2.5 rounded-xl transition-all ${ad.isFeatured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
                   title={ad.isFeatured ? "ফিচার্ড থেকে সরান" : "ফিচার্ড করুন"}
                 >
                   <Star size={18} />
                 </button>
                 <button 
                   onClick={() => handleToLetDelete(ad.id)}
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
  );

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">কেনা-বেচা ও টু-লেট মডারেশন</h2>
            <p className="text-xs font-bold text-gray-400">সকল বিজ্ঞাপনের তালিকা ও অনুমোদন প্যানেল</p>
          </div>
          <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-gray-100">
             {[
               { id: 'marketplace', label: 'কেনা-বেচা', icon: ShoppingBag },
               { id: 'tolet', label: 'টু-লেট', icon: Home }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="বিজ্ঞাপন খুঁজুন..." 
              value={searchTerm || ""}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 transition-all" 
            />
          </div>
          <div className="flex gap-2">
             <select 
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-5 py-3.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl text-xs font-black text-gray-600 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
             >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="pending">অনুমোদন পেন্ডিং</option>
                <option value="approved">অনুমোদিত</option>
                <option value="rejected">বাতিলকৃত</option>
             </select>
          </div>
        </div>
      </div>

      {/* List Area */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold">লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'marketplace' ? (
            filteredMarketplace.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">কোন কেনা-বেচা বিজ্ঞাপন পাওয়া যায়নি</div>
            ) : (
              filteredMarketplace.map(item => renderMarketplaceItem(item))
            )
          ) : (
            filteredToLet.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">কোন টু-লেট বিজ্ঞাপন পাওয়া যায়নি</div>
            ) : (
              filteredToLet.map(ad => renderToLetAd(ad))
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdModeration;

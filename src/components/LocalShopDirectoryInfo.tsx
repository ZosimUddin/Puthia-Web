import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Store, ShoppingCart, Utensils, Pill, Shirt, 
  Zap, Landmark, Stethoscope, Car, Star, Phone, Navigation, Heart, 
  Clock, ChevronRight, CheckCircle2, ChevronLeft, Filter, PhoneCall, Trash2, Plus,
  Map as MapIcon, BarChart2, Image as ImageIcon, Award, TrendingUp, LayoutDashboard, Edit3, MessageSquare,
  Share2, Camera, Truck, CreditCard, Globe, Flame, MessageCircle, Smartphone, Wheat, Hotel, Wrench, BookOpen, Package, Sparkles, Video, ShieldCheck, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from './FavoriteContext';
import { AuthModal } from './AuthModal';
import { BusinessDetailsModal } from './BusinessDetailsModal';
import { BusinessActionModal } from './BusinessActionModal';
import { SubscriptionModal } from './SubscriptionModal';
import { AdvertiseWithUsModal } from './AdvertiseWithUsModal';
import { UnifiedHeroHeader } from './common/UnifiedDesignSystem';

interface LocalShopDirectoryInfoProps {
  onGoBack?: () => void;
  category?: string | null;
}

const CATEGORIES = [
  { id: 'shop_grocery', label: 'মুদি দোকান', icon: ShoppingCart, color: 'bg-orange-50 text-orange-600' },
  { id: 'restaurant', label: 'রেস্টুরেন্ট', icon: Utensils, color: 'bg-red-50 text-red-600' },
  { id: 'shop_pharmacy', label: 'ফার্মেসি', icon: Pill, color: 'bg-teal-50 text-teal-600' },
  { id: 'shop_clothing', label: 'পোশাক', icon: Shirt, color: 'bg-pink-50 text-pink-600' },
  { id: 'shop_electronics', label: 'মোবাইল ও ইলেকট্রনিক্স', icon: Smartphone, color: 'bg-blue-50 text-blue-600' },
  { id: 'transport', label: 'পরিবহন', icon: Car, color: 'bg-purple-50 text-purple-600' },
  { id: 'agriculture', label: 'কৃষি', icon: Wheat, color: 'bg-green-50 text-green-600' },
  { id: 'hotel', label: 'হোটেল', icon: Hotel, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'service_center', label: 'সার্ভিস সেন্টার', icon: Wrench, color: 'bg-slate-50 text-slate-600' },
  { id: 'library_stationery', label: 'লাইব্রেরি ও স্টেশনারি', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
];

const UNIONS = ["পুঠিয়া সদর", "বানেশ্বর", "বেলপুকুরিয়া", "ভালুকগাছী", "জৈনপুর", "শিলমাড়িয়া"];

export const LocalShopDirectoryInfo = ({ onGoBack, category: initialCategory }: LocalShopDirectoryInfoProps) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnion, setSelectedUnion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory && initialCategory !== 'null' ? initialCategory : "all");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const [activeTab, setActiveTab] = useState<'directory' | 'map' | 'dashboard'>('directory');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  const { toggleFollow, isFollowing } = useFavorites();
  
  const [dynamicShops, setDynamicShops] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [newShopName, setNewShopName] = useState("");
  const [newShopCategory, setNewShopCategory] = useState("shop_grocery");
  const [newShopUnion, setNewShopUnion] = useState("পুঠিয়া সদর");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopOwner, setNewShopOwner] = useState("");
  const [newShopImage, setNewShopImage] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{type: 'editProfile' | 'addOffer' | 'addProducts' | 'uploadPhotos' | 'reviews' | 'delete', businessId: string} | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, "local_shops"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shopsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDynamicShops(shopsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching shops:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("ব্যবসা যোগ করতে লগইন করুন");
      return;
    }
    if (!newShopName.trim() || !newShopAddress.trim() || !newShopPhone.trim() || !newShopOwner.trim()) {
      alert("সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "local_shops"), {
        name: newShopName,
        owner: newShopOwner,
        image: newShopImage || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=400&q=80",
        logo: newShopImage || "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=400&q=80",
        category: newShopCategory,
        union: newShopUnion,
        address: newShopAddress,
        phone: newShopPhone,
        userId: user.uid,
        rating: "0.0",
        reviews: 0,
        createdAt: new Date().toISOString(),
        verified: false,
        isOpen: true,
      });
      setShowAddForm(false);
      setNewShopName("");
      setNewShopOwner("");
      setNewShopImage("");
      setNewShopAddress("");
      setNewShopPhone("");
      alert("আপনার ব্যবসা সফলভাবে যোগ করা হয়েছে এবং অ্যাডমিন অনুমোদনের অপেক্ষায় আছে!");
    } catch (error) {
      console.error("Error adding shop:", error);
      alert("দুঃখিত, ব্যবসা যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে এই ব্যবসাটি মুছে ফেলতে চান?")) {
      try {
        await deleteDoc(doc(db, "local_shops", id));
      } catch (error) {
        console.error("Error deleting shop:", error);
        alert("মুছে ফেলতে সমস্যা হয়েছে।");
      }
    }
  };

  const toggleBusinessStatus = async (id: string, currentStatus: boolean) => {
     try {
        await updateDoc(doc(db, "local_shops", id), {
            isOpen: !currentStatus
        });
     } catch (e) {
         console.error("Error updating status: ", e);
     }
  };

  // Dummy Data for Premium UI
  const featuredBusinesses = [
    {
      id: "feat_1",
      name: "পুঠিয়া রাজকীয় সুপার শপ",
      category: "shop_grocery",
      rating: 4.8,
      reviews: 124,
      address: "রাজবাড়ী রোড, পুঠিয়া সদর",
      union: "পুঠিয়া সদর",
      phone: "01712-345678",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
      logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Puthia+Rajbari",
      verified: true,
      featured: true,
      offerBanner: "১০% ছাড় (৳১০০০+ কেনাকাটায়)",
      homeDelivery: true,
      paymentMethods: ["bKash", "Nagad", "Card"],
      website: "https://example.com",
      whatsapp: "01712345678"
    },
    {
      id: "feat_2",
      name: "মদিনা ফার্মেসি",
      category: "shop_pharmacy",
      rating: 4.9,
      reviews: 89,
      address: "হাসপাতাল গেট, পুঠিয়া সদর",
      union: "পুঠিয়া সদর",
      phone: "01711-223344",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=600",
      logo: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Puthia+Hospital",
      verified: true,
      featured: true,
      offerBanner: "ওষুধে ৫% ছাড়",
      homeDelivery: true,
      paymentMethods: ["bKash"],
      whatsapp: "01711223344"
    },
    {
      id: "feat_3",
      name: "বানেশ্বর হাইওয়ে রেস্টুরেন্ট",
      category: "restaurant",
      rating: 4.7,
      reviews: 256,
      address: "ঢাকা-রাজশাহী মহাসড়ক, বানেশ্বর",
      union: "বানেশ্বর",
      phone: "01722-556677",
      isOpen: false,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
      logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Baneswar+Market",
      verified: true,
      featured: true,
      paymentMethods: ["bKash", "Nagad"]
    }
  ];

  const staticBusinesses = [
    {
      id: "biz_4",
      name: "ডিজিটাল ইলেকট্রনিক্স",
      category: "shop_electronics",
      rating: 4.5,
      reviews: 45,
      address: "মেইন বাজার, পুঠিয়া সদর",
      union: "পুঠিয়া সদর",
      phone: "01733-445566",
      isOpen: true,
      logo: "https://images.unsplash.com/photo-1550009158-9ebf6d170281?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Puthia+Bazar",
      verified: true,
      homeDelivery: true,
      paymentMethods: ["Card", "bKash"]
    },
    {
      id: "biz_5",
      name: "সোনালী ব্যাংক পিএলসি",
      category: "bank_atm",
      rating: 4.2,
      reviews: 112,
      address: "উপজেলা পরিষদ মোড়, পুঠিয়া সদর",
      union: "পুঠিয়া সদর",
      phone: "07228-56000",
      isOpen: true,
      logo: "https://images.unsplash.com/photo-1501167783336-11b058a96683?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Sonali+Bank+Puthia",
      verified: true
    },
    {
      id: "biz_6",
      name: "মডার্ন ডায়াগনস্টিক ও ক্লিনিক",
      category: "clinic",
      rating: 4.6,
      reviews: 78,
      address: "বানেশ্বর বাজার, রাজশাহী রোড",
      union: "বানেশ্বর",
      phone: "01755-112233",
      isOpen: true,
      logo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=100&h=100",
      mapLink: "https://maps.google.com/?q=Baneswar+Clinic",
      verified: true,
      whatsapp: "01755112233"
    }
  ];

  const allBusinesses = [
    ...featuredBusinesses,
    ...staticBusinesses,
    ...dynamicShops.map(shop => ({
      ...shop,
      logo: shop.logo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(shop.name) + "&background=random",
      mapLink: shop.mapLink || `https://maps.google.com/?q=${encodeURIComponent(shop.address || shop.name)}`,
      rating: shop.rating || "5.0",
      reviews: shop.reviews || 0,
      isOpen: shop.isOpen !== undefined ? shop.isOpen : true,
      isUserPost: true
    }))
  ];

  const filteredList = allBusinesses.filter(biz => {
    const searchString = `${biz.name} ${biz.address} ${biz.union}`.toLowerCase();
    const matchQuery = searchString.includes(searchQuery.toLowerCase());
    const matchUnion = selectedUnion === 'all' || biz.union === selectedUnion;
    const matchCategory = selectedCategory === 'all' || biz.category === selectedCategory;
    const matchOpen = showOpenOnly ? biz.isOpen : true;
    const matchVerified = showVerifiedOnly ? biz.verified : true;
    const matchRating = Number(biz.rating) >= minRating;
    return matchQuery && matchUnion && matchCategory && matchOpen && matchVerified && matchRating;
  });

  const userBusinesses = allBusinesses.filter(biz => biz.userId === user?.uid);

  // Business Statistics
  const stats = {
    total: allBusinesses.length,
    verified: allBusinesses.filter(b => b.verified).length,
    newBusiness: dynamicShops.length,
    topRated: allBusinesses.filter(b => Number(b.rating) >= 4.5).length
  };

  const featuredOfDay = featuredBusinesses[0];

  return (
    <div className="font-sans pb-24 bg-slate-50 min-h-screen text-left relative">
      <UnifiedHeroHeader
        badgeText="স্মার্ট বিজনেস হাব"
        title="লোকাল ব্যবসা ডিরেক্টরি"
        subtitle="পুঠিয়ার সকল দোকান, শোরুম ও পরিষেবা খুঁজুন এক জায়গায়।"
        icon={<Store size={20} />}
        showBack={!!onGoBack}
        onBack={onGoBack}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="দোকান বা ব্যবসার নাম খুঁজুন..."
        rightAction={
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-10 h-10 rounded-full bg-white text-indigo-950 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer border border-white/20 shadow-sm"
            title="নতুন ব্যবসা যুক্ত করুন"
          >
            <Plus size={18} />
          </button>
        }
      />

      {/* Navigation Tabs */}
      <div className="px-4 md:px-8 mt-4 max-w-7xl mx-auto">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full gap-1">
          <button 
            onClick={() => { setActiveTab('directory'); setSelectedBusiness(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === 'directory' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Search className="w-4 h-4" /> এক্সপ্লোর
          </button>
          <button 
            onClick={() => { setActiveTab('map'); setSelectedBusiness(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === 'map' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <MapIcon className="w-4 h-4" /> ম্যাপ ভিউ
          </button>
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedBusiness(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> আমার ব্যবসা
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 mt-5 max-w-7xl mx-auto mb-10">

        <AnimatePresence mode="wait">
          
          {/* ===================== DIRECTORY TAB ===================== */}
          {activeTab === 'directory' && (
            <motion.div 
              key="directory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 pb-8"
            >
              {/* 📊 Business Statistics */}
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                <div className="bg-white rounded-2xl md:rounded-[20px] p-3 md:p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 md:mb-2 shrink-0">
                    <Store className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 m-0 leading-tight">{stats.total}+</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5 mb-0 line-clamp-1">মোট ব্যবসা</p>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[20px] p-3 md:p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 md:mb-2 shrink-0">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 m-0 leading-tight">{stats.verified}</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5 mb-0 line-clamp-1">Verified</p>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[20px] p-3 md:p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 md:mb-2 shrink-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 m-0 leading-tight">{stats.newBusiness}</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5 mb-0 line-clamp-1">নতুন ব্যবসা</p>
                </div>
                <div className="bg-white rounded-2xl md:rounded-[20px] p-3 md:p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-1.5 md:mb-2 shrink-0">
                    <Award className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 m-0 leading-tight">{stats.topRated}</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5 mb-0 line-clamp-1">Top Rated</p>
                </div>
              </div>

              {/* 🌟 Featured Business Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full inline-block shadow-sm"></span>
                    Featured Businesses
                  </h2>
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {featuredBusinesses.map((biz, idx) => (
                    <motion.div 
                      whileTap={{ scale: 0.98 }}
                      key={biz.id}
                      onClick={() => setSelectedBusiness(biz as any)}
                      className="bg-white rounded-[20px] overflow-hidden border-2 border-amber-200/60 shadow-[0_4px_20px_-4px_rgba(251,191,36,0.15)] shrink-0 w-[280px] snap-center cursor-pointer group hover:border-amber-400 transition-all relative"
                    >
                      {/* Gradient Glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>

                      <div className="relative h-40 w-full overflow-hidden bg-slate-100 p-1">
                        <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                          <img src={biz.image || biz.logo} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
                          
                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                            <div className="flex flex-col gap-1.5">
                              {idx === 0 ? (
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[9px] font-black shadow-sm">
                                  <Star className="w-3 h-3 fill-current" /> Sponsored
                                </div>
                              ) : (
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[9px] font-black shadow-sm">
                                  <Star className="w-3 h-3 fill-current" /> Featured
                                </div>
                              )}
                            </div>
                            {biz.verified && (
                              <div className="bg-white/95 backdrop-blur-sm px-1 py-0.5 rounded-md flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                            )}
                          </div>

                          {/* Bottom Info overlay */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-white">
                               <img src={biz.logo || biz.image} alt={biz.name} className="w-full h-full object-cover" />
                             </div>
                             <h3 className="font-black text-white text-base leading-tight drop-shadow-md truncate">{biz.name}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-3 relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-sm font-bold border border-amber-100">
                            <Star className="w-3.5 h-3.5 fill-current" /> {Number(biz.rating).toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {biz.id === 'feat_1' ? '1.2 km' : '2.5 km'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <span className={`w-2.5 h-2.5 rounded-full ${biz.isOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`}></span>
                            <span className={biz.isOpen ? 'text-emerald-600' : 'text-slate-500'}>
                              {biz.isOpen ? 'Open Now' : 'Closed'}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                            {CATEGORIES.find(c => c.id === biz.category)?.label || biz.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Advanced Search & Filter */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 sticky top-4 z-20 flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="দোকান খুঁজুন..." 
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium placeholder:text-slate-400"
                  />
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>

                <div className="flex flex-nowrap overflow-x-auto hide-scrollbar items-center gap-2 w-full">
                  <select value={selectedUnion || ""} onChange={(e) => setSelectedUnion(e.target.value)} className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm cursor-pointer font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none">
                    <option value="all">📍 সব ইউনিয়ন</option>
                    {UNIONS.map(u => <option key={u} value={u || ""}>{u}</option>)}
                  </select>

                  <label className="shrink-0 flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={showOpenOnly} 
                      onChange={(e) => setShowOpenOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    🕒 Open
                  </label>

                  <label className="shrink-0 flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={showVerifiedOnly} 
                      onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    ✅ Verified
                  </label>

                  <select 
                    value={minRating || ""} 
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4.0}>⭐ 4.0+</option>
                    <option value={4.5}>⭐ 4.5+</option>
                    <option value={4.8}>⭐ 4.8+</option>
                  </select>
                </div>
              </div>

              {/* 📂 Category Scrollable Chips */}
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all border font-bold text-sm cursor-pointer shadow-sm active:scale-95 duration-200 shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  সবগুলো
                </button>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all border font-bold text-sm cursor-pointer shadow-sm active:scale-95 duration-200 shrink-0 ${
                        isSelected 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : cat.color}`}>
                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* 📢 বিজ্ঞাপন ব্যানার */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[20px] p-6 text-white shadow-lg relative overflow-hidden my-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">Advertisement</span>
                    <h3 className="text-xl font-black mb-1">আপনার ব্যবসাকে সবার কাছে পৌঁছে দিন</h3>
                    <p className="text-blue-100 text-sm m-0">আজই স্পন্সরড লিস্টিং এ যোগ দিন এবং আপনার ব্যবসাকে সবার উপরে রাখুন।</p>
                  </div>
                  <button 
                    onClick={() => setIsAdvertiseModalOpen(true)}
                    className="whitespace-nowrap px-6 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold text-sm transition-colors shadow-md cursor-pointer shrink-0"
                  >
                    যোগাযোগ করুন
                  </button>
                </div>
              </div>

              {/* 📋 Latest Businesses List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                    {searchQuery || selectedCategory !== 'all' || selectedUnion !== 'all' ? 'অনুসন্ধানের ফলাফল' : 'সর্বশেষ ব্যবসা'}
                  </h2>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {filteredList.length} টি ফলাফল
                  </span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm animate-pulse flex flex-col h-full">
                        <div className="flex gap-4 mb-4">
                          <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0"></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4 mt-2">
                          <div className="h-3 bg-slate-200 rounded w-full"></div>
                          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                          <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredList.map(biz => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={biz.id} 
                        onClick={() => setSelectedBusiness(biz)}
                        className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] hover:border-emerald-200 transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
                      >
                        {/* Cover Image */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100 shrink-0">
                          <img src={biz.image || biz.logo} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          
                          {/* Offer Banner */}
                          {biz.offerBanner && (
                            <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 flex items-center justify-center gap-1.5 z-10 shadow-sm">
                              <Flame className="w-3.5 h-3.5" />
                              {biz.offerBanner}
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className={`absolute left-3 flex flex-col gap-2 ${biz.offerBanner ? 'top-10' : 'top-3'}`}>
                            {biz.verified && (
                              <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px] font-bold text-slate-700 shadow-sm border border-white/50 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified
                              </div>
                            )}
                          </div>
                          
                          <div className={`absolute right-3 flex flex-col gap-2 ${biz.offerBanner ? 'top-10' : 'top-3'}`}>
                             <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFollow({ id: biz.id, type: 'business', name: biz.name, location: biz.address, phone: biz.phone, category: biz.category });
                              }}
                              className={`px-2.5 py-1.5 rounded-xl backdrop-blur-sm transition-all cursor-pointer border shadow-sm flex items-center gap-1.5 text-[10px] font-bold ${isFollowing(biz.id) ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-white/95 text-slate-600 border-white/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFollowing(biz.id) ? 'fill-current text-rose-500' : 'text-slate-400 group-hover:text-rose-500'}`} /> 
                              Saved by 847 users
                            </button>
                          </div>

                          {/* Media Count Badge */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-white font-medium text-[10px] tracking-wide border border-white/20">
                            <span className="flex items-center gap-1">
                              <Camera className="w-3 h-3" /> 45 Photos
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span 
                              onClick={(e) => { e.stopPropagation(); showToast("এই ব্যবসাটি প্রকৃত মালিক দ্বারা পরিচালিত ও ভেরিফাইড।"); }}
                              className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-indigo-100 transition-colors"
                            >
                              <UserCheck className="w-2.5 h-2.5" /> Claimed By Owner
                            </span>
                            {biz.featured && (
                              <span className="bg-purple-50 text-purple-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-purple-100 uppercase tracking-wider flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" /> Featured
                              </span>
                            )}
                            {Number(biz.rating) >= 4.5 && (
                              <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wider flex items-center gap-1">
                                <Award className="w-2.5 h-2.5" /> Top Rated
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white shadow-sm">
                              <img src={biz.logo || biz.image} alt={biz.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 m-0 leading-tight">
                              {biz.name}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <span className="flex items-center gap-1.5 text-amber-600 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50">
                              <Star className="w-4 h-4 fill-current" /> {Number(biz.rating).toFixed(1)} <span className="text-amber-600/60 text-xs ml-0.5 font-medium">({biz.reviews})</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {biz.id === 'feat_1' ? '1.2 km away' : '2.5 km away'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span className={`w-2.5 h-2.5 rounded-full ${biz.isOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`}></span>
                              <span className={biz.isOpen ? 'text-emerald-600' : 'text-slate-500'}>
                                {biz.isOpen ? 'Open Now' : 'Closed'}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
                              {CATEGORIES.find(c => c.id === biz.category)?.label || biz.category}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {biz.homeDelivery && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100/50">
                                <Truck className="w-3 h-3" /> হোম ডেলিভারি
                              </span>
                            )}
                            {biz.paymentMethods && biz.paymentMethods.length > 0 && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100/50">
                                <CreditCard className="w-3 h-3" /> {biz.paymentMethods.join(", ")}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto space-y-4">
                          
                          <div className="space-y-2">
                            <div className="flex gap-2">
                            <a 
                              href={`tel:${biz.phone}`} 
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 h-10 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 no-underline group/btn relative overflow-hidden shadow-sm hover:shadow-md"
                            >
                              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></span>
                              <PhoneCall className="w-4 h-4 relative z-10" /> 
                              <span className="relative z-10">কল করুন</span>
                            </a>
                            <a 
                              href={biz.mapLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 h-10 bg-blue-50 hover:bg-blue-500 text-blue-700 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 no-underline group/btn relative overflow-hidden shadow-sm hover:shadow-md"
                            >
                              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></span>
                              <Navigation className="w-4 h-4 relative z-10" /> 
                              <span className="relative z-10">দিকনির্দেশনা</span>
                            </a>
                          </div>
                          <div className="flex gap-2">
                            {biz.whatsapp && (
                              <a href={`https://wa.me/${biz.whatsapp}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 h-9 bg-green-50 hover:bg-green-500 text-green-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline border border-green-100">
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            )}
                            {biz.website && (
                              <a href={biz.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 h-9 bg-slate-50 hover:bg-slate-500 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 no-underline border border-slate-200">
                                <Globe className="w-3.5 h-3.5" /> ওয়েবসাইট
                              </a>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); showToast("চ্যাট ফিচারটি শীঘ্রই আসছে!"); }} className="flex-1 h-9 bg-indigo-50 hover:bg-indigo-500 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-100 cursor-pointer">
                              <MessageSquare className="w-3.5 h-3.5" /> চ্যাট
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); navigator.share ? navigator.share({ title: biz.name, text: 'এই ব্যবসাটি দেখুন!', url: window.location.href }).catch(() => {}) : showToast('শেয়ার ফিচারটি আপনার ব্রাউজারে সাপোর্ট করে না'); }} className="w-9 h-9 bg-slate-50 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 cursor-pointer transition-colors" title="Share">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>
                    </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[20px] border border-slate-100 shadow-sm text-center">
                    <span className="text-5xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">কোনো ব্যবসা পাওয়া যায়নি</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো ব্যবসা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedUnion('all'); setShowOpenOnly(false); setShowVerifiedOnly(false); setMinRating(0); }}
                      className="mt-6 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer border-none"
                    >
                      সব ফিল্টার মুছুন
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===================== MAP SECTION ===================== */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
               <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
                 {/* Fake Map Container */}
                 <div className="flex-1 h-[400px] md:h-[600px] bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center group cursor-crosshair border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map View" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"></div>
                    
                    {/* Simulated Map Markers */}
                    <div className="absolute top-1/4 left-1/3 p-2 bg-white rounded-full shadow-lg text-emerald-500 animate-bounce cursor-pointer hover:scale-110 transition-transform">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 p-2 bg-white rounded-full shadow-lg text-rose-500 animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{animationDelay: '0.2s'}}>
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 p-2 bg-white rounded-full shadow-lg text-blue-500 animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{animationDelay: '0.4s'}}>
                      <Pill className="w-5 h-5" />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3 w-[90%] md:w-auto">
                      <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 m-0">পুঠিয়া বাজার এরিয়া</h4>
                        <p className="text-xs text-slate-500 m-0">{allBusinesses.length}টি ব্যবসা প্রতিষ্ঠান</p>
                      </div>
                    </div>
                 </div>

                 {/* Nearby Businesses Sidebar */}
                 <div className="w-full md:w-80 flex flex-col h-[400px] md:h-[600px]">
                    <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-emerald-500" /> Nearby Business
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {allBusinesses.slice(0, 8).map((biz, idx) => (
                        <div key={idx} onClick={() => setSelectedBusiness(biz)} className="bg-slate-50 hover:bg-emerald-50 p-3 rounded-2xl border border-slate-100 transition-all cursor-pointer group active:scale-95 duration-200">
                          <h4 className="text-sm font-bold text-slate-800 m-0 group-hover:text-emerald-700 transition-colors line-clamp-1">{biz.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500 font-medium">{CATEGORIES.find(c => c.id === biz.category)?.label || biz.category}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              ~{(1.2 + idx * 0.4).toFixed(1)} km
                            </span>
                          </div>
                          <div className="mt-2.5 flex gap-2">
                             <a href={biz.mapLink} target="_blank" rel="noreferrer" className="flex-1 text-[11px] font-bold py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center gap-1.5 no-underline">
                               <Navigation className="w-3.5 h-3.5" /> Route
                             </a>
                             <a href={`tel:${biz.phone}`} className="w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                               <Phone className="w-3.5 h-3.5" />
                             </a>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {/* ===================== DASHBOARD TAB ===================== */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!user ? (
                <div className="bg-white p-12 rounded-[20px] text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-10">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Store className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">লগইন প্রয়োজন</h3>
                  <p className="text-slate-500 text-base mb-8 max-w-md mx-auto leading-relaxed">
                    আপনার ব্যবসা পরিচালনা করতে, নতুন ব্যবসা যোগ করতে এবং পারফরম্যান্স দেখতে অনুগ্রহ করে অ্যাকাউন্টে লগইন করুন।
                  </p>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 cursor-pointer text-base"
                  >
                    লগইন / রেজিস্টার করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
                  {/* Left Column: My Businesses */}
                  <div className="lg:col-span-2 space-y-5 lg:space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
                       <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 m-0 pl-2">
                         <Store className="w-5 h-5 text-indigo-500" /> আমার ব্যবসা প্রতিষ্ঠান
                       </h2>
                       <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-[14px] font-bold flex items-center gap-1.5 transition-colors text-sm cursor-pointer shadow-sm hover:shadow-md translate-y-[2px]"
                        >
                          {showAddForm ? 'বাতিল' : <><Plus className="w-4 h-4" /> নতুন ব্যবসা</>}
                        </button>
                    </div>

                    <AnimatePresence>
                      {showAddForm && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-emerald-100 mt-4">
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-800 m-0">নতুন ব্যবসার তথ্য</h3>
                                <p className="text-xs text-slate-500 m-0">সঠিক তথ্য দিয়ে আপনার ব্যবসা তালিকাভুক্ত করুন</p>
                              </div>
                            </div>
                            <form onSubmit={handlePostSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">ব্যবসার নাম *</label>
                                  <input type="text" value={newShopName || ""} onChange={e => setNewShopName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" required placeholder="দোকান বা প্রতিষ্ঠানের নাম" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">মালিকের নাম *</label>
                                  <input type="text" value={newShopOwner || ""} onChange={e => setNewShopOwner(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" required placeholder="মালিকের পূর্ণ নাম" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">দোকানের ছবি (URL)</label>
                                  <input type="url" value={newShopImage || ""} onChange={e => setNewShopImage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" placeholder="https://..." />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">ক্যাটাগরি *</label>
                                  <select value={newShopCategory || ""} onChange={e => setNewShopCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium">
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id || ""}>{c.label}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">ইউনিয়ন *</label>
                                  <select value={newShopUnion || ""} onChange={e => setNewShopUnion(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium">
                                    {UNIONS.map(u => <option key={u} value={u || ""}>{u}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-600">মোবাইল নম্বর *</label>
                                  <input type="tel" value={newShopPhone || ""} onChange={e => setNewShopPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" required placeholder="017XX..." />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                  <label className="text-xs font-bold text-slate-600">ঠিকানা (বিস্তারিত) *</label>
                                  <input type="text" value={newShopAddress || ""} onChange={e => setNewShopAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium" required placeholder="বাজারের নাম, রাস্তার নাম ইত্যাদি" />
                                </div>
                              </div>
                              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                                <p className="text-xs text-amber-700 m-0">
                                  <span className="font-bold">নোট:</span> ব্যবসা সাবমিট করার পর অ্যাডমিন দ্বারা যাচাই হয়ে সেটি ডিরেক্টরিতে প্রকাশিত হবে।
                                </p>
                              </div>
                              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer mt-4 shadow-md shadow-emerald-200">
                                {isSubmitting ? 'যোগ করা হচ্ছে...' : 'ব্যবসা যোগ করুন'}
                              </button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-4">
                      {userBusinesses.length > 0 ? (
                        userBusinesses.map(biz => (
                          <div key={biz.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-5 relative group">
                            <img src={biz.logo} alt={biz.name} className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0" />
                            <div className="flex-1">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-lg font-black text-slate-800 m-0">{biz.name}</h4>
                                    <p className="text-sm text-slate-500 m-0 mt-0.5 flex items-center gap-1.5 font-medium">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {biz.address}
                                    </p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${biz.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {biz.verified ? '✅ Verified' : '⏳ Pending'}
                                  </span>
                               </div>
                               
                               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                                  <button onClick={() => setActionModal({ type: 'editProfile', businessId: biz.id })} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 cursor-pointer transition-colors">
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                  </button>
                                  <button onClick={() => setActionModal({ type: 'addOffer', businessId: biz.id })} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-700 cursor-pointer transition-colors">
                                    <Flame className="w-4 h-4" /> Add Offer
                                  </button>
                                  <button onClick={() => setActionModal({ type: 'addProducts', businessId: biz.id })} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-700 cursor-pointer transition-colors">
                                    <Package className="w-4 h-4" /> Add Products
                                  </button>
                                  <button onClick={() => setActionModal({ type: 'uploadPhotos', businessId: biz.id })} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 cursor-pointer transition-colors">
                                    <Camera className="w-4 h-4" /> Upload Photos
                                  </button>
                                  <button 
                                    onClick={() => toggleBusinessStatus(biz.id, biz.isOpen)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-xs font-bold cursor-pointer transition-colors ${biz.isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                  >
                                    <Clock className="w-4 h-4" /> {biz.isOpen ? 'Open Now' : 'Closed'}
                                  </button>
                                  <button onClick={() => setActionModal({ type: 'reviews', businessId: biz.id })} className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 cursor-pointer transition-colors">
                                    <MessageSquare className="w-4 h-4" /> Reviews
                                  </button>
                                  <button 
                                    onClick={() => setActionModal({ type: 'delete', businessId: biz.id })}
                                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
                                    title="Delete Business"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                               </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white p-10 rounded-[20px] text-center border border-slate-200 border-dashed">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                             <Store className="w-8 h-8" />
                           </div>
                          <p className="text-slate-500 font-medium text-base">আপনার কোনো ব্যবসা তালিকাভুক্ত নেই।</p>
                          <button onClick={() => setShowAddForm(true)} className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none">
                            এখনই ব্যবসা যোগ করুন
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Analytics & Ads */}
                  <div className="space-y-5 lg:space-y-6">
                    <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-xl"></div>
                      <h3 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2 relative z-10">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Analytics Overview
                      </h3>
                      <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">মোট ভিজিট</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">1,248</h4>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                            <PhoneCall className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">ফোন কল</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">142</h4>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                            <Navigation className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Directions Click</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">89</h4>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Share Count</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">56</h4>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
                            <Heart className="w-4 h-4 fill-current" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Favorite Count</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">24</h4>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
                          <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-2">
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Review Rating</p>
                          <h4 className="text-lg font-black text-slate-800 m-0">4.8</h4>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[20px] shadow-sm text-white relative overflow-hidden">
                       <div className="absolute right-0 bottom-0 opacity-10">
                         <Store className="w-40 h-40 transform translate-x-1/4 translate-y-1/4" />
                       </div>
                       <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-md">Subscription</div>
                       <h3 className="text-lg font-black mb-2 relative z-10 text-white">Business Pro Plan</h3>
                       <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
                         Unlock advanced analytics, priority support, and premium features to grow your business on Puthia Smart City app.
                       </p>
                       <button 
                         onClick={() => setIsSubscriptionModalOpen(true)}
                         className="bg-white text-indigo-700 px-5 py-3 rounded-xl text-sm font-bold w-full cursor-pointer hover:bg-indigo-50 transition-colors relative z-10 shadow-lg shadow-indigo-900/50"
                       >
                         Manage Subscription
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 mb-8 text-center pb-8">
          <p className="text-slate-400 font-bold text-sm flex items-center justify-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-500" /> পুঠিয়া স্মার্ট সিটি
          </p>
          <p className="text-slate-400/80 text-xs mt-1.5 font-medium">সবচেয়ে বড় লোকাল শপ ডিরেক্টরি</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <AnimatePresence>
        {selectedBusiness && (
          <BusinessDetailsModal 
            business={selectedBusiness} 
            categories={CATEGORIES}
            allBusinesses={allBusinesses}
            onClose={() => setSelectedBusiness(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionModal && (
          <BusinessActionModal
            action={actionModal}
            business={allBusinesses.find(b => b.id === actionModal.businessId) || dynamicShops.find(b => b.id === actionModal.businessId)}
            onClose={() => setActionModal(null)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
      <AdvertiseWithUsModal isOpen={isAdvertiseModalOpen} onClose={() => setIsAdvertiseModalOpen(false)} />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-2xl z-[100] whitespace-nowrap border border-white/10 flex items-center gap-2"
          >
            <span className="text-emerald-400">✨</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

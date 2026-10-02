import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Percent, Tag, Gift, ShoppingBag, Store, MapPin, Phone, 
  Copy, Check, ExternalLink, Sparkles, ArrowLeft, Search, Clock, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

export interface OfferItem {
  id: string;
  category: 'restaurant' | 'grocery' | 'fashion' | 'electronics' | 'service';
  categoryLabel: string;
  businessName: string;
  title: string;
  discountBadge: string;
  description: string;
  couponCode: string;
  validUntil: string;
  location: string;
  phone: string;
  isClaimed?: boolean;
}

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'off-1',
    category: 'restaurant',
    categoryLabel: 'খাবার ও রেস্তোরাঁ',
    businessName: 'পুঠিয়া ঐতিহ্যবাহী সুইটস এন্ড রেস্টুরেন্ট',
    title: 'রাজশাহী স্পেশাল কালাই রুটি ও হাঁসের মাংস কম্বোতে ১৫% ছাড়',
    discountBadge: '১৫% ছাড়',
    description: 'আমাদের রেস্টুরেন্টে যেকোনো ফ্যামিলি কম্বো প্যাকেজে পাচ্ছেন ১৫% বিশেষ ডিসকাউন্ট। সাথে পুঠিয়ার ঐতিহ্যবাহী রসগোল্লা ফ্রি!',
    couponCode: 'PUTHIA15',
    validUntil: '২০২৬-০৭-৩১',
    location: 'পুঠিয়া বাজার বাসস্ট্যান্ড, পুঠিয়া',
    phone: '০১৭০০-১১২২৩৪',
    isClaimed: false
  },
  {
    id: 'off-2',
    category: 'grocery',
    categoryLabel: 'গ্রোসারি ও সুপারশপ',
    businessName: 'বানেশ্বর আম ও গ্রোসারি বাজার',
    title: 'আমের মৌসুমে খাঁটি মধু ও ঘিয়ে বিশেষ ক্যাশব্যাক',
    discountBadge: '১০০ টাকা ক্যাশব্যাক',
    description: '১০০০ টাকার বেশি কেনাকাটায় ১০০ টাকা ইনস্ট্যান্ট ক্যাশব্যাক এবং হোম ডেলিভারি একদম ফ্রি।',
    couponCode: 'BANESHWAR100',
    validUntil: '২০২৬-০৮-১৫',
    location: 'বানেশ্বর বাজার, পুঠিয়া',
    phone: '০১৮১১-২২৩৩৪৪',
    isClaimed: false
  },
  {
    id: 'off-3',
    category: 'fashion',
    categoryLabel: 'ফ্যাশন ও ক্লথিং',
    businessName: 'রাজশাহী সিল্ক ও শাড়ি হাউজ',
    title: 'ঈদ ও উৎসব উপলক্ষে সব সিল্ক শাড়িতে ২০% ছাড়',
    discountBadge: '২০% ছাড়',
    description: 'খাঁটি রাজশাহী সিল্ক ও কাতান শাড়ির উপর বিশেষ মূল্য ছাড়। কুপন কোড ব্যবহার করে উপভোগ করুন ডিসকাউন্ট।',
    couponCode: 'SILK20',
    validUntil: '২০২৬-০৭-২৮',
    location: 'পুঠিয়া পৌর মার্কেট, পুঠিয়া',
    phone: '০১৯২২-৩৩৪৪৫৫',
    isClaimed: false
  },
  {
    id: 'off-4',
    category: 'service',
    categoryLabel: 'ডিজিটাল ও আইটি সেবা',
    businessName: 'পুঠিয়া কম্পিউটার ট্রেনিং ও সেবা কেন্দ্র',
    title: 'কম্পিউটার ও ল্যাপটপ সার্ভিসিংয়ে ফ্রি ডায়াগনসিস',
    discountBadge: 'ফ্রি সার্ভিসিং',
    description: 'যেকোনো ল্যাপটপ বা ডেস্কটপ রিপেয়ারিংয়ে ডায়াগনসিস ফি সম্পূর্ণ ফ্রি এবং পার্টসে ১০% ছাড়।',
    couponCode: 'ITFREE',
    validUntil: '২০২৬-০৮-১০',
    location: 'কলেজ রোড, পুঠিয়া',
    phone: '০১৫৩৩-৪৪৫৫৬৬',
    isClaimed: false
  }
];

const CATEGORIES = [
  { id: 'all', label: 'সকল অফার ও ডিসকাউন্ট', icon: Gift },
  { id: 'restaurant', label: 'রেস্টুরেন্ট ও খাবার', icon: Store },
  { id: 'grocery', label: 'গ্রোসারি ও বাজার', icon: ShoppingBag },
  { id: 'fashion', label: 'ফ্যাশন ও শাড়ি', icon: Tag },
  { id: 'service', label: 'সেবা ও অন্যান্য', icon: Percent },
];

export const SpecialOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [offers, setOffers] = useState<OfferItem[]>(() => {
    try {
      const saved = localStorage.getItem('puthia_special_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_OFFERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('puthia_special_offers', JSON.stringify(offers));
    } catch (e) {}
  }, [offers]);

  const handleClaimCoupon = (id: string, code: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, isClaimed: true } : o));
    navigator.clipboard?.writeText(code);
    toast.success(`কুপন কোড [${code}] সফলভাবে কপি করা হয়েছে!`);
  };

  const filteredOffers = offers.filter(offer => {
    const matchesCat = activeCategory === 'all' || offer.category === activeCategory;
    const matchesSearch = offer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> এক্সক্লুসিভ ডিসকাউন্ট ও কুপন
                </span>
              </div>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                বিশেষ অফার ও কুপন (Special Offers & Discounts)
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
                পুঠিয়া ও আশপাশের স্থানীয় ব্যবসা প্রতিষ্ঠানে বিশেষ ছাড়, আকর্ষণীয় কুপন এবং ক্যাশব্যাক অফার উপভোগ করুন।
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/15 relative z-10">
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <Gift size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">বিশেষ অফার</span>
                  <span className="text-[10px] text-amber-200">সেরা ডিসকাউন্ট</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <Tag size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">কুপন কোড</span>
                  <span className="text-[10px] text-amber-200">এক ক্লিকে কপি</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <Store size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">স্থানীয় ব্যবসা</span>
                  <span className="text-[10px] text-amber-200">পুঠিয়া ও বানেশ্বর</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-2.5 flex items-center gap-2 border border-white/10">
                <ShieldCheck size={18} className="text-amber-300 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white">যাচাইকৃত</span>
                  <span className="text-[10px] text-amber-200">নিরাপদ ও বিশ্বস্ত</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 max-w-4xl mx-auto space-y-5">

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="ব্যবসার নাম, অফার বা কুপন কোড খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={15} className={isActive ? 'text-white' : 'text-amber-600'} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredOffers.length === 0 ? (
                <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xs space-y-3">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Gift size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">কোনো বিশেষ অফার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">অন্য ক্যাটাগরি নির্বাচন করুন অথবা অনুসন্ধান পরিবর্তন করুন।</p>
                  </div>
                </div>
              ) : (
                filteredOffers.map((offer) => {
                  return (
                    <motion.div
                      key={offer.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-300 transition-all shadow-2xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {/* Top ribbon badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-block mb-1">
                            {offer.categoryLabel}
                          </span>
                          <h3 className="text-xs font-bold text-slate-500">{offer.businessName}</h3>
                        </div>
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                          {offer.discountBadge}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-slate-800 leading-snug">
                          {offer.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {offer.description}
                        </p>
                      </div>

                      {/* Location & Phone */}
                      <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-amber-600 shrink-0" />
                          <span>{offer.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-emerald-600 shrink-0" />
                          <span className="font-mono">{offer.phone}</span>
                        </div>
                      </div>

                      {/* Coupon Box & Action */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">কুপন কোড:</span>
                          <span className="font-mono font-black text-sm text-slate-800 tracking-wider">{offer.couponCode}</span>
                        </div>

                        <button
                          onClick={() => handleClaimCoupon(offer.id, offer.couponCode)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            offer.isClaimed 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                          }`}
                        >
                          {offer.isClaimed ? (
                            <>
                              <Check size={14} /> কপি হয়েছে
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> কুপন নিন
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>মেয়াদ শেষ: {offer.validUntil}</span>
                        <span className="text-emerald-600 font-bold">অফারটি সক্রিয় আছে</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default SpecialOffersPage;

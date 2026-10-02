import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Landmark, Building, CreditCard, Users, Smartphone, Clock, MapPin, 
  PhoneCall, Wallet, PlusCircle, Trash2, Loader2, X, Send, Search, Phone, 
  ExternalLink, ArrowRight, Map as MapIcon, Navigation, ShieldCheck, HelpCircle, 
  CheckCircle, Copy, Info, Star, History, Compass, ArrowUpRight, Check,
  Briefcase, HandCoins, FileText, Percent, FileSpreadsheet, Globe, ChevronRight,
  Heart, Share2, Bookmark, SlidersHorizontal, Bell, Plus, CheckSquare, MessageSquare,
  ThumbsUp, Grid, Home, User, FlaskConical, Shield, Filter, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Bank Data Interface
export interface BankItem {
  id: string;
  name: string;
  branch: string;
  category: 'govt' | 'private' | 'islamic' | 'nbfi';
  typeLabel: string;
  address: string;
  union: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  distance: string;
  established: string;
  branchCode: string;
  hasAtm: boolean;
  hasInternetBanking: boolean;
  hasMobileBanking: boolean;
  imageUrl: string;
  schedule: string;
  services: string[];
}

// Initial Comprehensive Bank Dataset for Puthia Upazila
const INITIAL_BANKS: BankItem[] = [
  {
    id: "b1",
    name: "সোনালী ব্যাংক পিএলসি",
    branch: "প্রধান শাখা, পুঠিয়া",
    category: "govt",
    typeLabel: "সরকারি ব্যাংক",
    address: "পুঠিয়া বাজার মেইন রোড, পুঠিয়া সদর, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62019",
    whatsapp: "01700-000011",
    email: "puthia@sonalibank.com.bd",
    website: "www.sonalibank.com.bd",
    rating: 4.6,
    reviewCount: 128,
    distance: "১.২ কিমি",
    established: "১৯৭২ সাল",
    branchCode: "৬২০১",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: true,
    imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "সঞ্চয়ী ও চলতি হিসাব", "মেয়াদী আমানত (ডিপিএস/এফডিআর)", "ব্যবসায়িক ও ব্যক্তিগত ঋণ",
      "সরকারি ভাতা ও পেনশন", "বৈদেশিক রেমিট্যান্স", "এটিএম বুথ সেবা"
    ]
  },
  {
    id: "b2",
    name: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি",
    branch: "পুঠিয়া শাখা",
    category: "islamic",
    typeLabel: "ইসলামী ব্যাংক",
    address: "পুঠিয়া বাজার সেন্টার, পুঠিয়া, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62111",
    whatsapp: "01700-000111",
    email: "puthia@islamibankbd.com",
    website: "www.islamibankbd.com",
    rating: 4.5,
    reviewCount: 96,
    distance: "১.৮ কিমি",
    established: "১৯৮৩ সাল",
    branchCode: "৩৩১০",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: true,
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "মুদারাবা সঞ্চয়ী একাউন্ট", "ইসলামী ডিপিএস ও পেনশন", "মুরাবাহা বিনিয়োগ ও লোন",
      "সেলফিন অ্যাপ সার্ভিস", "সিআরএম ও এটিএম বুথ"
    ]
  },
  {
    id: "b3",
    name: "অগ্রণী ব্যাংক পিএলসি",
    branch: "পুঠিয়া শাখা",
    category: "govt",
    typeLabel: "সরকারি ব্যাংক",
    address: "ঢাকা-রাজশাহী মহাসড়ক, পুঠিয়া বাজার, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62013",
    whatsapp: "01700-000013",
    email: "puthia@agranibank.org",
    website: "www.agranibank.org",
    rating: 4.4,
    reviewCount: 78,
    distance: "২.১ কিমি",
    established: "১৯৭২ সাল",
    branchCode: "৪১০২",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: false,
    imageUrl: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "কৃষি ও সার ডিলার ঋণ", "সঞ্চয়ী ও চলতি হিসাব", "ওয়েস্টার্ন ইউনিয়ন রেমিট্যান্স",
      "ডিজিটাল এটিএম সার্ভিস"
    ]
  },
  {
    id: "b4",
    name: "ডাচ-বাংলা ব্যাংক পিএলসি",
    branch: "পুঠিয়া উপশাখা",
    category: "private",
    typeLabel: "বেসরকারি ব্যাংক",
    address: "বানেশ্বর বাজার ট্রাফিক মোড়, পুঠিয়া, রাজশাহী",
    union: "বানেশ্বর",
    phone: "02488-62125",
    whatsapp: "01700-000125",
    email: "baneshwar@dutchbanglabank.com",
    website: "www.dutchbanglabank.com",
    rating: 4.3,
    reviewCount: 65,
    distance: "২.৬ কিমি",
    established: "১৯৯৫ সাল",
    branchCode: "১১০৫",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: true,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "রকেট ক্যাশ ইন-আউট", "নেক্সাস কার্ড ইস্যু", "ফাস্ট ট্র্যাক এটিএম",
      "ব্যবসায়ী লোন ও ডিপোজিট"
    ]
  },
  {
    id: "b5",
    name: "ব্র্যাক ব্যাংক পিএলসি",
    branch: "পুঠিয়া উপশাখা",
    category: "private",
    typeLabel: "বেসরকারি ব্যাংক",
    address: "পুঠিয়া মডেল টাউন রোড, পুঠিয়া সদর, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62200",
    whatsapp: "01700-000200",
    email: "puthia@bracbank.com",
    website: "www.bracbank.com",
    rating: 4.3,
    reviewCount: 51,
    distance: "৩.০ কিমি",
    established: "২০০১ সাল",
    branchCode: "৫৫০১",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: true,
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "এসএমই ঋণ", "আস্থা অ্যাপ সার্ভিস", "ডিপিএস ও রিটেইল লোন", "এটিএম সার্ভিস"
    ]
  },
  {
    id: "b6",
    name: "পূবালী ব্যাংক পিএলসি",
    branch: "পুঠিয়া শাখা",
    category: "private",
    typeLabel: "বেসরকারি ব্যাংক",
    address: "পুঠিয়া বাজার বাস স্ট্যান্ড রোড, পুঠিয়া, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62310",
    whatsapp: "01700-000310",
    email: "puthia@pubalibankbd.com",
    website: "www.pubalibangla.com",
    rating: 4.2,
    reviewCount: 43,
    distance: "৩.৩ কিমি",
    established: "১৯৫৯ সাল",
    branchCode: "২২০৪",
    hasAtm: true,
    hasInternetBanking: true,
    hasMobileBanking: false,
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "চলতি ও সঞ্চয়ী একাউন্ট", "বাণিজ্যিক ঋণ", "ফরেন রেমিট্যান্স", "এটিএম"
    ]
  },
  {
    id: "b7",
    name: "রাজশাহী কৃষি উন্নয়ন ব্যাংক (রাকাব)",
    branch: "পুঠিয়া শাখা",
    category: "govt",
    typeLabel: "সরকারি ব্যাংক",
    address: "উপজেলা পরিষদ রোড, পুঠিয়া সদর, রাজশাহী",
    union: "পুঠিয়া সদর",
    phone: "02488-62015",
    whatsapp: "01700-000015",
    email: "puthia@rakub.org.bd",
    website: "www.rakub.org.bd",
    rating: 4.5,
    reviewCount: 82,
    distance: "১.০ কিমি",
    established: "১৯৮৭ সাল",
    branchCode: "১০১২",
    hasAtm: true,
    hasInternetBanking: false,
    hasMobileBanking: false,
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
    services: [
      "কৃষি ও শস্য ঋণ", "পোল্ট্রি ও মৎস্য চাষ ঋণ", "কৃষক সঞ্চয়ী একাউন্ট", "ডিপিএস"
    ]
  }
];

export const BankingFinance: React.FC<{ onGoBack?: () => void; initialCategory?: string }> = ({ onGoBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Management
  const [banks, setBanks] = useState<BankItem[]>(INITIAL_BANKS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'govt' | 'private' | 'islamic' | 'atm'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation / Active View Modes
  // 'home' | 'list' | 'detail' | 'reviews' | 'branches' | 'services' | 'map' | 'compare'
  const [viewMode, setViewMode] = useState<string>('home');
  const [selectedBank, setSelectedBank] = useState<BankItem>(INITIAL_BANKS[0]);
  const [compareBank, setCompareBank] = useState<BankItem>(INITIAL_BANKS[1]);
  
  // Sub-tabs in detail view
  const [detailTab, setDetailTab] = useState<'info' | 'branches' | 'services' | 'reviews' | 'map' | 'compare'>('info');

  // Modals
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [savedBanks, setSavedBanks] = useState<string[]>([]);

  // Filter Modal States
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterBranchType, setFilterBranchType] = useState<string>('all');
  const [filterUnion, setFilterUnion] = useState<string>('all');
  const [hasAtmToggle, setHasAtmToggle] = useState<boolean>(true);
  const [hasNetBankToggle, setHasNetBankToggle] = useState<boolean>(false);
  const [hasMobileBankToggle, setHasMobileBankToggle] = useState<boolean>(false);
  const [holidayToggle, setHolidayToggle] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  // Firestore Sync for custom user added banks
  useEffect(() => {
    try {
      const q = query(collection(db, 'banks'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseBanks: BankItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'নতুন ব্যাংক',
            branch: data.branch || 'পুঠিয়া শাখা',
            category: data.category || 'private',
            typeLabel: data.typeLabel || (data.type === 'govt' ? 'সরকারি ব্যাংক' : 'বেসরকারি ব্যাংক'),
            address: data.address || 'পুঠিয়া, রাজশাহী',
            union: data.union || 'পুঠিয়া সদর',
            phone: data.phone || '০২৪৮৮-৬২০১৯',
            whatsapp: data.whatsapp || data.phone,
            rating: data.rating || 5.0,
            reviewCount: data.reviewCount || 1,
            distance: data.distance || '১.৫ কিমি',
            established: data.established || '২০২৪ সাল',
            branchCode: data.branchCode || '৬২০০',
            hasAtm: data.hasAtm !== undefined ? data.hasAtm : true,
            hasInternetBanking: true,
            hasMobileBanking: true,
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&q=80&w=800',
            schedule: 'রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)',
            services: data.services || ['সঞ্চয়ী হিসাব', 'ডিপিএস', 'এটিএম সেবা']
          };
        });
        if (firebaseBanks.length > 0) {
          setBanks([...firebaseBanks, ...INITIAL_BANKS]);
        }
      }, (err) => console.log("Firebase bank load error", err));
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter Logic
  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bank.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bank.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory === 'govt') matchesCategory = bank.category === 'govt';
    if (activeCategory === 'private') matchesCategory = bank.category === 'private';
    if (activeCategory === 'islamic') matchesCategory = bank.category === 'islamic';
    if (activeCategory === 'atm') matchesCategory = bank.hasAtm;

    let matchesFilterModal = true;
    if (filterType !== 'all') {
      if (filterType === 'govt') matchesFilterModal = bank.category === 'govt';
      if (filterType === 'private') matchesFilterModal = bank.category === 'private';
      if (filterType === 'islamic') matchesFilterModal = bank.category === 'islamic';
    }
    if (filterUnion !== 'all') {
      matchesFilterModal = matchesFilterModal && bank.union === filterUnion;
    }

    return matchesSearch && matchesCategory && matchesFilterModal;
  });

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (savedBanks.includes(id)) {
      setSavedBanks(savedBanks.filter(item => item !== id));
    } else {
      setSavedBanks([...savedBanks, id]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-24 select-none">
      
      {/* Top Header Bar */}
      <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (viewMode !== 'home') {
                setViewMode('home');
              } else if (onGoBack) {
                onGoBack();
              } else {
                navigate(-1);
              }
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base leading-tight">ব্যাংক</h1>
            <p className="text-[10px] text-emerald-100">পুঠিয়া উপজেলা ব্যাংকিং ডিরেক্টরি</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('list')}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Main Content Area Based On View Mode */}
      <div className="flex-1">

        {/* ----------------- SCREEN 1: HOME VIEW ----------------- */}
        {viewMode === 'home' && (
          <div className="space-y-4">
            
            {/* Hero Banner Section */}
            <div className="relative bg-gradient-to-br from-[#006a4e] via-[#00523d] to-emerald-900 text-white p-5 overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-15 pointer-events-none">
                <img 
                  src="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&q=80&w=800" 
                  alt="Bank Building" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10 max-w-lg">
                <span className="inline-block bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 border border-emerald-400/30">
                  নিরাপদ ব্যাংকিং, সমৃদ্ধ আগামী
                </span>
                <h2 className="text-lg font-black leading-snug mb-1 text-white">
                  পুঠিয়া উপজেলার সকল ব্যাংকের তথ্য ও সেবা এক প্ল্যাটফর্মে
                </h2>
                <p className="text-xs text-emerald-100/90 mb-4 font-normal">
                  সরকারি, বেসরকারি ও ইসলামী ব্যাংকের অবস্থান, সেবা ও হটলাইন
                </p>

                {/* Hero Search Box */}
                <div className="bg-white rounded-xl p-1 flex items-center shadow-lg text-slate-800">
                  <Search size={18} className="text-slate-400 ml-2.5 shrink-0" />
                  <input 
                    type="text"
                    placeholder="ব্যাংকের নাম, শাখা বা সেবা লিখুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setViewMode('list')}
                    className="w-full text-xs bg-transparent px-2 py-2 outline-none"
                  />
                  <button 
                    onClick={() => setViewMode('list')}
                    className="bg-[#006a4e] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#00523d] transition shrink-0"
                  >
                    খুঁজুন
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Category Filters Horizontal Scroll */}
            <div className="px-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                <button
                  onClick={() => { setActiveCategory('all'); setViewMode('list'); }}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition ${
                    activeCategory === 'all' 
                      ? 'bg-emerald-100 text-[#006a4e] border-2 border-[#006a4e] font-bold' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building size={14} className="text-[#006a4e]" />
                  সব ব্যাংক
                </button>

                <button
                  onClick={() => { setActiveCategory('govt'); setViewMode('list'); }}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 transition"
                >
                  <Landmark size={14} className="text-blue-600" />
                  সরকারি ব্যাংক
                </button>

                <button
                  onClick={() => { setActiveCategory('private'); setViewMode('list'); }}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 transition"
                >
                  <CreditCard size={14} className="text-rose-600" />
                  বেসরকারি ব্যাংক
                </button>

                <button
                  onClick={() => { setActiveCategory('islamic'); setViewMode('list'); }}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 transition"
                >
                  <ShieldCheck size={14} className="text-purple-600" />
                  ইসলামী ব্যাংক
                </button>

                <button
                  onClick={() => { setActiveCategory('atm'); setViewMode('list'); }}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shrink-0 transition"
                >
                  <Smartphone size={14} className="text-teal-600" />
                  এটিএম বুথ
                </button>
              </div>
            </div>

            {/* Popular Banks Section ("জনপ্রিয় ব্যাংক") */}
            <div className="px-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  জনপ্রিয় ব্যাংক
                </h3>
                <button 
                  onClick={() => setViewMode('list')}
                  className="text-xs font-bold text-[#006a4e] hover:underline flex items-center gap-0.5"
                >
                  সব দেখুন &gt;
                </button>
              </div>

              {/* Bank Cards Grid */}
              <div className="space-y-3">
                {INITIAL_BANKS.slice(0, 4).map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => {
                      setSelectedBank(bank);
                      setDetailTab('info');
                      setViewMode('detail');
                    }}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-[#006a4e]/40 transition cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-[#006a4e] font-black overflow-hidden">
                        <img 
                          src={bank.imageUrl} 
                          alt={bank.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{bank.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            bank.category === 'govt' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            bank.category === 'islamic' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {bank.typeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{bank.branch}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span className="flex items-center gap-0.5 font-bold text-amber-600">
                            ★ {bank.rating} ({bank.reviewCount})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} className="text-slate-400" /> {bank.distance}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`tel:${bank.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center hover:bg-[#006a4e] hover:text-white transition"
                      >
                        <Phone size={14} />
                      </a>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency & ATM Quick Banner */}
            <div className="px-4">
              <div className="bg-emerald-900 text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-emerald-100">২৪/৭ এটিএম সেবা</h4>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">পুঠিয়া বাজারে সোনালী, অগ্রণী ও ইসলামী ব্যাংকের ফাস্ট ট্র্যাকিং এটিএম</p>
                </div>
                <button 
                  onClick={() => { setActiveCategory('atm'); setViewMode('list'); }}
                  className="bg-white text-[#006a4e] px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 shadow-xs"
                >
                  ম্যাপ দেখুন
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- SCREEN 3: ALL BANKS LIST VIEW ----------------- */}
        {viewMode === 'list' && (
          <div className="p-4 space-y-3">
            
            {/* Top Search & Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl p-2 flex items-center shadow-xs">
                <Search size={16} className="text-slate-400 ml-1 shrink-0" />
                <input 
                  type="text" 
                  placeholder="ব্যাংক অনুসন্ধান করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-2 outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 p-0.5">
                    <X size={14} />
                  </button>
                )}
              </div>

              <button 
                onClick={() => setIsFilterOpen(true)}
                className="bg-white border border-slate-200 rounded-xl p-2.5 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 text-xs font-bold shrink-0"
              >
                <SlidersHorizontal size={16} className="text-[#006a4e]" />
                ফিল্টার
              </button>
            </div>

            {/* Results Count Subtitle */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>মোট {filteredBanks.length} টি ব্যাংক পাওয়া গেছে</span>
              <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="text-[#006a4e]">
                রিসেট
              </button>
            </div>

            {/* Bank Cards List */}
            <div className="space-y-3">
              {filteredBanks.map((bank) => (
                <div 
                  key={bank.id}
                  onClick={() => {
                    setSelectedBank(bank);
                    setDetailTab('info');
                    setViewMode('detail');
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-[#006a4e]/50 transition cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0">
                        <img src={bank.imageUrl} alt={bank.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">{bank.name}</h3>
                        <p className="text-[11px] text-slate-500">{bank.branch}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      bank.category === 'govt' ? 'bg-blue-100 text-blue-800' :
                      bank.category === 'islamic' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bank.typeLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-600">★ {bank.rating} ({bank.reviewCount})</span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} /> {bank.distance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${bank.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-emerald-50 text-[#006a4e] font-bold px-3 py-1 rounded-lg text-xs hover:bg-[#006a4e] hover:text-white transition"
                      >
                        কল করুন
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------- SCREEN 4: BANK DETAILS VIEW ----------------- */}
        {viewMode === 'detail' && selectedBank && (
          <div className="space-y-4">
            
            {/* Bank Cover / Header Image */}
            <div className="relative h-44 bg-slate-900 text-white overflow-hidden">
              <img 
                src={selectedBank.imageUrl} 
                alt={selectedBank.name} 
                className="w-full h-full object-cover opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button 
                  onClick={(e) => toggleBookmark(selectedBank.id, e)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
                >
                  <Bookmark size={18} className={savedBanks.includes(selectedBank.id) ? "fill-amber-400 text-amber-400" : ""} />
                </button>
              </div>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-[#006a4e] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {selectedBank.typeLabel}
                  </span>
                  <span className="text-xs text-emerald-200 font-bold">★ {selectedBank.rating} ({selectedBank.reviewCount} রিভিও)</span>
                </div>
                <h2 className="text-lg font-black mt-0.5">{selectedBank.name}</h2>
                <p className="text-xs text-slate-200">{selectedBank.branch}</p>
              </div>
            </div>

            {/* Quick Actions Bar (4 Circular Buttons) */}
            <div className="px-4">
              <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl p-3 border border-slate-200 text-center text-[11px] font-bold text-slate-700 shadow-xs">
                <a href={`tel:${selectedBank.phone}`} className="flex flex-col items-center gap-1 hover:text-[#006a4e]">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <span>কল করুন</span>
                </a>

                <button onClick={() => setDetailTab('map')} className="flex flex-col items-center gap-1 hover:text-[#006a4e]">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Navigation size={18} />
                  </div>
                  <span>দিক নির্দেশনা</span>
                </button>

                <button onClick={() => toggleBookmark(selectedBank.id)} className="flex flex-col items-center gap-1 hover:text-[#006a4e]">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Bookmark size={18} className={savedBanks.includes(selectedBank.id) ? "fill-amber-500" : ""} />
                  </div>
                  <span>সংরক্ষণ করুন</span>
                </button>

                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: selectedBank.name, url: window.location.href });
                    }
                  }} 
                  className="flex flex-col items-center gap-1 hover:text-[#006a4e]"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Share2 size={18} />
                  </div>
                  <span>শেয়ার করুন</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="px-4">
              <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar text-xs font-bold text-slate-600">
                <button 
                  onClick={() => setDetailTab('info')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'info' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  তথ্য
                </button>
                <button 
                  onClick={() => setDetailTab('branches')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'branches' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  শাখা ও এটিএম
                </button>
                <button 
                  onClick={() => setDetailTab('services')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'services' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  সেবা সমূহ
                </button>
                <button 
                  onClick={() => setDetailTab('reviews')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'reviews' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  রিভিউ ({selectedBank.reviewCount})
                </button>
                <button 
                  onClick={() => setDetailTab('map')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'map' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  ম্যাপ
                </button>
                <button 
                  onClick={() => setDetailTab('compare')}
                  className={`py-2 px-3 border-b-2 transition shrink-0 ${detailTab === 'compare' ? 'border-[#006a4e] text-[#006a4e]' : 'border-transparent'}`}
                >
                  তুলনা
                </button>
              </div>
            </div>

            {/* TAB CONTENT: INFO */}
            {detailTab === 'info' && (
              <div className="px-4 space-y-3 text-xs">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">ব্যাংকের বিস্তারিত তথ্য</h3>
                  
                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">শাখার ধরন:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.branch}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">ব্যাংকের ধরন:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.typeLabel}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">যোগাযোগ নম্বর:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.phone}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">ইমেইল:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.email || 'তথ্য নেই'}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">ওয়েবসাইট:</span>
                    <a href={`https://${selectedBank.website}`} target="_blank" rel="noreferrer" className="col-span-2 font-semibold text-[#006a4e] hover:underline">
                      {selectedBank.website}
                    </a>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500">প্রতিষ্ঠিত:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.established}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 py-1">
                    <span className="text-slate-500">শাখা কোড:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedBank.branchCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BRANCHES & ATM (SCREEN 6) */}
            {detailTab === 'branches' && (
              <div className="px-4 space-y-3 text-xs">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 mb-2">পুঠিয়া উপজেলার সকল শাখা ও বুথ</h3>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">{selectedBank.branch}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{selectedBank.address}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold mt-1">সময়সূচী: {selectedBank.schedule}</p>
                    </div>
                    <a href={`tel:${selectedBank.phone}`} className="p-2 bg-emerald-100 text-[#006a4e] rounded-full">
                      <Phone size={16} />
                    </a>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">পুঠিয়া বাজার এটিএম বুথ</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">পুঠিয়া প্রধান সড়ক সংলগ্ন</p>
                      <p className="text-[10px] text-blue-700 font-semibold mt-1">২৪ ঘণ্টা খোলা</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-md">এটিএম</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SERVICES (SCREEN 7) */}
            {detailTab === 'services' && (
              <div className="px-4 space-y-3">
                <h3 className="font-bold text-xs text-slate-800 px-1">উপলব্ধ ব্যাংক সেবাসমূহ</h3>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {selectedBank.services.map((srv, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-xs">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS (SCREEN 5) */}
            {detailTab === 'reviews' && (
              <div className="px-4 space-y-3">
                {/* Score Summary Box */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-slate-900">{selectedBank.rating}</span>
                    <div className="flex items-center text-amber-500 my-0.5">
                      ★ ★ ★ ★ ★
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{selectedBank.reviewCount} টি রিভিও</span>
                  </div>

                  <button 
                    onClick={() => setIsWriteReviewOpen(true)}
                    className="bg-[#006a4e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#00523d] transition"
                  >
                    রিভিও লিখুন
                  </button>
                </div>

                {/* Sample Review Cards */}
                <div className="space-y-2.5">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">রাকিবুল ইসলাম</span>
                      <span className="text-[10px] text-slate-400">১০ মে, ২০২৪</span>
                    </div>
                    <div className="text-amber-500 font-bold">★ ★ ★ ★ ★</div>
                    <p className="text-slate-600">সেবা খুবই ভালো। স্টাফরা ভদ্র এবং সহযোগী। পরিবেশও সুন্দর ও পরিপাটি।</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">সুমি আক্তার</span>
                      <span className="text-[10px] text-slate-400">২৮ এপ্রিল, ২০২৪</span>
                    </div>
                    <div className="text-amber-500 font-bold">★ ★ ★ ★ ☆</div>
                    <p className="text-slate-600">সেবা ভালো তবে লাইনে একটু সময় বেশি লাগে।</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MAP (SCREEN 8) */}
            {detailTab === 'map' && (
              <div className="px-4">
                <div className="bg-white rounded-2xl p-2 border border-slate-200 space-y-2">
                  <div className="w-full h-64 rounded-xl overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                      alt="Puthia Map" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold text-[#006a4e]">
                        <MapPin size={16} /> {selectedBank.name}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-700 px-1">{selectedBank.address}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: COMPARE (SCREEN 9) */}
            {detailTab === 'compare' && (
              <div className="px-4 space-y-3 text-xs">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 border-b pb-2">ব্যাংক তুলনা</h3>

                  <div className="grid grid-cols-3 gap-2 text-center font-bold text-slate-700 pb-2 border-b">
                    <span>বৈশিষ্ট্য</span>
                    <span className="text-[#006a4e]">{selectedBank.name.split(' ')[0]}</span>
                    <span className="text-blue-600">{compareBank.name.split(' ')[0]}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1 border-b text-slate-600">
                    <span>ধরন</span>
                    <span>{selectedBank.typeLabel}</span>
                    <span>{compareBank.typeLabel}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1 border-b text-slate-600">
                    <span>দূরত্ব</span>
                    <span>{selectedBank.distance}</span>
                    <span>{compareBank.distance}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1 border-b text-slate-600">
                    <span>রেটিং</span>
                    <span>★ {selectedBank.rating}</span>
                    <span>★ {compareBank.rating}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1 text-slate-600">
                    <span>এটিএম</span>
                    <span>{selectedBank.hasAtm ? '✓' : '✗'}</span>
                    <span>{compareBank.hasAtm ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Floating Action Button (+) for Screen 10 (Add Bank) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 right-5 w-12 h-12 bg-[#006a4e] hover:bg-[#00523d] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40 border-2 border-white"
        title="নতুন ব্যাংক যুক্ত করুন"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Sticky Navigation Bar (Matching Reference Image) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 z-30 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-[10px] font-bold text-slate-500">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center py-1 hover:text-[#006a4e] transition"
          >
            <Home size={18} />
            <span className="mt-0.5">হোম</span>
          </button>

          <button 
            onClick={() => navigate('/services')}
            className="flex flex-col items-center py-1 hover:text-[#006a4e] transition"
          >
            <Grid size={18} />
            <span className="mt-0.5">সেবা সমূহ</span>
          </button>

          <button 
            onClick={() => setViewMode('home')}
            className="flex flex-col items-center py-1 text-[#006a4e]"
          >
            <Landmark size={18} />
            <span className="mt-0.5 font-extrabold">ব্যাংক</span>
          </button>

          <button 
            onClick={() => navigate('/notice')}
            className="flex flex-col items-center py-1 hover:text-[#006a4e] transition relative"
          >
            <Bell size={18} />
            <span className="mt-0.5">বিজ্ঞপ্তি</span>
            <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center py-1 hover:text-[#006a4e] transition"
          >
            <User size={18} />
            <span className="mt-0.5">প্রোফাইল</span>
          </button>
        </div>
      </div>

      {/* ----------------- SCREEN 2: FILTER MODAL ----------------- */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 text-xs">
            
            {/* Header */}
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-sm font-bold text-slate-900">ফিল্টার</h2>
              <button 
                onClick={() => {
                  setFilterType('all');
                  setFilterUnion('all');
                  setHasAtmToggle(true);
                }}
                className="text-xs font-bold text-[#006a4e]"
              >
                রিসেট
              </button>
            </div>

            {/* Form Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Type Chips */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">ব্যাংকের ধরন</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['all', 'govt', 'private', 'islamic'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-xl border transition ${
                        filterType === t 
                          ? 'bg-[#006a4e] text-white border-[#006a4e] font-bold' 
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t === 'all' ? 'সব' : t === 'govt' ? 'সরকারি' : t === 'private' ? 'বেসরকারি' : 'ইসলামী'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Union Dropdown */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">ইউনিয়ন</label>
                <select
                  value={filterUnion}
                  onChange={(e) => setFilterUnion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  <option value="all">সব ইউনিয়ন</option>
                  <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                  <option value="বানেশ্বর">বানেশ্বর</option>
                  <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                  <option value="জিউপাড়া">জিউপাড়া</option>
                  <option value="ভালুকগাছি">ভালুকগাছি</option>
                  <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
                </select>
              </div>

              {/* Switches */}
              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center justify-between text-slate-800 font-semibold cursor-pointer">
                  <span>এটিএম বুথ আছে</span>
                  <input 
                    type="checkbox" 
                    checked={hasAtmToggle} 
                    onChange={(e) => setHasAtmToggle(e.target.checked)} 
                    className="w-4 h-4 accent-[#006a4e]" 
                  />
                </label>

                <label className="flex items-center justify-between text-slate-800 font-semibold cursor-pointer">
                  <span>ইন্টারনেট ব্যাংকিং</span>
                  <input 
                    type="checkbox" 
                    checked={hasNetBankToggle} 
                    onChange={(e) => setHasNetBankToggle(e.target.checked)} 
                    className="w-4 h-4 accent-[#006a4e]" 
                  />
                </label>
              </div>

              {/* Distance Slider */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">দূরত্ব (কিমি)</span>
                  <span className="text-[#006a4e] font-bold">{maxDistance} কিমি</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={maxDistance} 
                  onChange={(e) => setMaxDistance(Number(e.target.value))} 
                  className="w-full accent-[#006a4e]"
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="p-3 border-t">
              <button 
                onClick={() => {
                  setIsFilterOpen(false);
                  setViewMode('list');
                }}
                className="w-full bg-[#006a4e] text-white py-3 rounded-xl font-bold hover:bg-[#00523d] transition"
              >
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- SCREEN 10: ADD BANK MODAL ----------------- */}
      {isAddModalOpen && (
        <AddBankModal 
          onClose={() => setIsAddModalOpen(false)}
          onBankAdded={(newBank) => setBanks([newBank, ...banks])}
        />
      )}

      {/* WRITE REVIEW MODAL */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">রিভিও লিখুন</h3>
            <textarea 
              placeholder="আপনার অভিজ্ঞতা বিস্তারিত লিখুন..." 
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setIsWriteReviewOpen(false)} className="px-3 py-1.5 text-slate-500 font-bold">বাতিল</button>
              <button onClick={() => setIsWriteReviewOpen(false)} className="px-4 py-1.5 bg-[#006a4e] text-white rounded-xl font-bold">জমা দিন</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ----------------- ADD BANK MODAL COMPONENT (SCREEN 10 MATCH) -----------------
const AddBankModal: React.FC<{ onClose: () => void; onBankAdded: (bank: BankItem) => void }> = ({ onClose, onBankAdded }) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'govt' | 'private' | 'islamic'>('private');
  const [union, setUnion] = useState('পুঠিয়া সদর');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !branch.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const newBankItem: BankItem = {
      id: `b_${Date.now()}`,
      name,
      branch,
      category,
      typeLabel: category === 'govt' ? 'সরকারি ব্যাংক' : category === 'islamic' ? 'ইসলামী ব্যাংক' : 'বেসরকারি ব্যাংক',
      address: `${branch}, ${union}, পুঠিয়া, রাজশাহী`,
      union,
      phone,
      whatsapp: phone,
      rating: 5.0,
      reviewCount: 1,
      distance: "১.৫ কিমি",
      established: `${new Date().getFullYear()} সাল`,
      branchCode: "৬২০০",
      hasAtm: true,
      hasInternetBanking: true,
      hasMobileBanking: true,
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&q=80&w=800",
      schedule: "রবিবার - বৃহস্পতিবার (১০:০০ - ৪:০০)",
      services: ["সঞ্চয়ী হিসাব", "ডিপিএস", "এটিএম সেবা"]
    };

    try {
      await addDoc(collection(db, 'banks'), {
        ...newBankItem,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      onBankAdded(newBankItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-900">নতুন ব্যাংক যোগ করুন</h2>
          <div className="w-9" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Logo Upload Dashed Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ব্যাংকের লোগো / ছবি
            </label>
            <div className="w-full h-28 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-3 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer text-slate-500">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mb-1 text-slate-600">
                <Plus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">ছবি আপলোড করুন (JPG, PNG)</span>
            </div>
            <input 
              type="url"
              placeholder="অথবা সরাসরি ছবি লিংক (URL) প্রদান করুন..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs mt-2 outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              ব্যাংকের নাম <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="ব্যাংকের নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Branch Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              শাখার নাম <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="শাখার নাম লিখুন"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              যোগাযোগ / মোবাইল নম্বর <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              required
              placeholder="০২৪৮৮-৬২০১৯"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
            />
          </div>

          {/* Type & Union Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ব্যাংকের ধরন <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'govt' | 'private' | 'islamic')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value="private">বেসরকারি</option>
                <option value="govt">সরকারি</option>
                <option value="islamic">ইসলামী</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                ইউনিয়ন <span className="text-red-500">*</span>
              </label>
              <select
                value={union}
                onChange={(e) => setUnion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-[#006a4e]"
              >
                <option value="পুঠিয়া সদর">পুঠিয়া সদর</option>
                <option value="বানেশ্বর">বানেশ্বর</option>
                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া</option>
                <option value="জিউপাড়া">জিউপাড়া</option>
                <option value="ভালুকগাছি">ভালুকগাছি</option>
                <option value="শিলমাড়িয়া">শিলমাড়িয়া</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

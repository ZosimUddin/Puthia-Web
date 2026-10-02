import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Info, Calculator, ShoppingBag, PlusCircle, Trash2, Loader2, Send, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { motion, AnimatePresence } from 'motion/react';

interface MarketItem {
  id?: string;
  name: string;
  retailPrice: string;
  wholesalePrice: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  marketName: string;
  category?: 'vegetable' | 'groceries' | 'protein' | 'crops';
  isUserPost?: boolean;
}

const MARKET_ITEMS_DATA: Record<string, MarketItem[]> = {
  vegetable: [
    { name: "আলু (নতুন দেশি)", retailPrice: "৩৫ - ৪০", wholesalePrice: "২৮ - ৩২", unit: "কেজি", trend: "down", marketName: "পুঠিয়া কাঁচাবাজার" },
    { name: "দেশি পেঁয়াজ", retailPrice: "৮০ - ৮৫", wholesalePrice: "৭২ - ৭৫", unit: "কেজি", trend: "up", marketName: "পুঠিয়া আড়ত" },
    { name: "কাঁচামরিচ", retailPrice: "১২ো - ১৩০", wholesalePrice: "১০০ - ১০৫", unit: "কেজি", trend: "down", marketName: "বানেশ্বর হাট" },
    { name: "বেগুন (গোল)", retailPrice: "৪০ - ৪৫", wholesalePrice: "৩২ - ৩৫", unit: "কেজি", trend: "stable", marketName: "পুঠিয়া কাঁচাবাজার" },
    { name: "টমেটো (দেশি)", retailPrice: "৫০ - ৬০", wholesalePrice: "৪০ - ৪৪", unit: "কেজি", trend: "down", marketName: "ঝলমলিয়া বাজার" },
    { name: "ফুলকপি", retailPrice: "২৫ - ৩০", wholesalePrice: "১৮ - ২০", unit: "পিস", trend: "down", marketName: "পুঠিয়া কাঁচাবাজার" }
  ],
  groceries: [
    { name: "মিনিকেট চাল (উন্নত)", retailPrice: "৬৮ - ৭২", wholesalePrice: "৬৪ - ৬৬", unit: "কেজি", trend: "stable", marketName: "বানেশ্বর হাট" },
    { name: "বিআর-২৮ চাল", retailPrice: "৫৮ - ৬০", wholesalePrice: "৫৫ - ৫৬", unit: "কেজি", trend: "up", marketName: "বানেশ্বর আড়ত" },
    { name: "মসুর ডাল (দেশি)", retailPrice: "১৩৫ - ১৪০", wholesalePrice: "১২৫ - ১২৮", unit: "কেজি", trend: "stable", marketName: "পুঠিয়া সদর" },
    { name: "সয়াবিন তেল (১ লিটার বোতল)", retailPrice: "১৬৫ - ১৬৮", wholesalePrice: "১৫৮ - ১৬০", unit: "লিটার", trend: "stable", marketName: "পুঠিয়া বাজার" },
    { name: "চিনি (সাদা)", retailPrice: "১৩২ - ১৩৫", wholesalePrice: "১২৬ - ১২৮", unit: "কেজি", trend: "up", marketName: "পুঠিয়া সদর" }
  ],
  protein: [
    { name: "ব্রয়লার মুরগি", retailPrice: "১৮০ - ১৯০", wholesalePrice: "১৭০ - ১৭২", unit: "কেজি", trend: "up", marketName: "পুঠিয়া কাঁচাবাজার" },
    { name: "সোনালী মুরগি", retailPrice: "২৮০ - ৩০০", wholesalePrice: "২৬৫ - ২৭০", unit: "কেজি", trend: "stable", marketName: "ঝলমলিয়া বাজার" },
    { name: "গরুর মাংস", retailPrice: "৭৫০ - ৭৮০", wholesalePrice: "৭২০ - ৭৩০", unit: "কেজি", trend: "stable", marketName: "পুঠিয়া সদর" },
    { name: "খাসির মাংস", retailPrice: "১০০০ - ১০৫০", wholesalePrice: "৯৫০ - ৯৭০", unit: "কেজি", trend: "stable", marketName: "পুঠিয়া সদর" },
    { name: "রুই মাছ (মাঝারি)", retailPrice: "৩২০ - ৩৫০", wholesalePrice: "২৮ো - ৩০০", unit: "কেজি", trend: "up", marketName: "ঝলমলিয়া আড়ত" },
    { name: "ফার্মের ডিম (লাল)", retailPrice: "৪৫ - ৪৮", wholesalePrice: "৪০ - ৪২", unit: "হালি", trend: "down", marketName: "পুঠিয়া বাজার" }
  ],
  crops: [
    { name: "মোটা ধান (শুকনা)", retailPrice: "১২০০ - ১২৫০", wholesalePrice: "১১৫০ - ১১৮০", unit: "মন (৪০ কেজি)", trend: "stable", marketName: "বানেশ্বর মোকাম" },
    { name: "দেশি লাল পাট (উন্নত)", retailPrice: "৩২০০ - ৩৫০০", wholesalePrice: "৩০০০ - ৩১৫০", unit: "মন (৪০ কেজি)", trend: "up", marketName: "বানেশ্বর মোকাম" },
    { name: "সরিষা (মাঘী)", retailPrice: "৩২০০ - ৩৩০০", wholesalePrice: "৩০০০ - ৩০৮০", unit: "মন (৪০ কেজি)", trend: "stable", marketName: "বানেশ্বর হাট" },
    { name: "আম (গোপালভোগ কচি)", retailPrice: "২৫০০ - ২৮০০", wholesalePrice: "২২০০ - ২৩৫০", unit: "মন (৪০ কেজি)", trend: "up", marketName: "বানেশ্বর আমের বাজার" }
  ]
};

export const MarketPriceInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'vegetable' | 'groceries' | 'protein' | 'crops'>('vegetable');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Traditional weight calculator state
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcUnit, setCalcUnit] = useState<'mon_to_kg' | 'kg_to_mon'>('mon_to_kg');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Post form states
  const [showPostForm, setShowPostForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newCategory, setNewCategory] = useState<'vegetable' | 'groceries' | 'protein' | 'crops'>('vegetable');
  const [newRetailPrice, setNewRetailPrice] = useState('');
  const [newWholesalePrice, setNewWholesalePrice] = useState('');
  const [newUnit, setNewUnit] = useState('কেজি');
  const [newTrend, setNewTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [newMarketName, setNewMarketName] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Firestore state
  const [dbPrices, setDbPrices] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load prices from Firestore
  useEffect(() => {
    const q = query(collection(db, "market_prices"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: MarketItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Map Admin Dashboard categories to standard categories
        let finalCategory: 'vegetable' | 'groceries' | 'protein' | 'crops' = 'vegetable';
        const rawCategory = data.category || "";
        if (rawCategory === "চাল ও ডাল" || rawCategory === "crops") {
          finalCategory = "crops";
        } else if (rawCategory === "শাকসবজি" || rawCategory === "vegetable") {
          finalCategory = "vegetable";
        } else if (rawCategory === "মাছ ও মাংস" || rawCategory === "protein") {
          finalCategory = "protein";
        } else if (rawCategory === "মসলা ও অন্যান্য" || rawCategory === "groceries") {
          finalCategory = "groceries";
        }

        list.push({
          id: docSnap.id,
          name: data.name || "",
          category: finalCategory,
          retailPrice: data.retailPrice || data.price || "",
          wholesalePrice: data.wholesalePrice || "",
          unit: data.unit || "কেজি",
          trend: data.trend || "stable",
          marketName: data.marketName || "পুঠিয়া বাজার",
          isUserPost: true
        });
      });
      setDbPrices(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading market prices:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const staticItems = MARKET_ITEMS_DATA[activeTab] || [];
  const dbItemsForTab = dbPrices.filter(item => item.category === activeTab);
  const selectedItems = [...dbItemsForTab, ...staticItems];

  // Filter items by search query
  const filteredItems = selectedItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch(trend) {
      case 'up':
        return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> ঊর্ধ্বমুখী</span>;
      case 'down':
        return <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> নিম্নমুখী</span>;
      default:
        return <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5"><Minus className="w-3 h-3" /> অপরিবর্তিত</span>;
    }
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(calcInput);
    if (isNaN(val) || val <= 0) {
      setCalcResult("দয়া করে সঠিক সংখ্যা লিখুন ভাই।");
      return;
    }

    if (calcUnit === 'mon_to_kg') {
      const result = val * 40;
      setCalcResult(`${val} মন = ${result.toFixed(1)} কেজি`);
    } else {
      const result = val / 40;
      setCalcResult(`${val} কেজি = ${result.toFixed(2)} মন`);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newProductName || !newRetailPrice || !newWholesalePrice || !newMarketName) {
      alert('দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।');
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'market_prices'), {
        name: newProductName.trim(),
        category: newCategory,
        retailPrice: newRetailPrice.trim(),
        wholesalePrice: newWholesalePrice.trim(),
        unit: newUnit.trim(),
        trend: newTrend,
        marketName: newMarketName.trim(),
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewProductName('');
      setNewRetailPrice('');
      setNewWholesalePrice('');
      setNewUnit('কেজি');
      setNewTrend('stable');
      setNewMarketName('');
      setShowPostForm(false);
      alert('🎉 বাজারদর তথ্যটি সফলভাবে প্রকাশ করা হয়েছে!');
    } catch (err) {
      console.error('Error adding market price:', err);
      alert('বাজারদর যোগ করতে সমস্যা হয়েছে।');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বাজারদর তথ্যটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "market_prices", id));
      alert("সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Error deleting market price:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="font-sans space-y-6 pb-6 text-left animate-fade-in" id="market-price-view">
      {/* Premium Hero Banner */}
      <div 
        className="p-8 text-white rounded-3xl shadow-lg relative overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}
      >
        <button 
          onClick={onGoBack} 
          id="market-back-btn"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer z-10 border-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> ফিরে যান
        </button>  
        
        <div className="mt-6 relative z-10">
          <span className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 inline-block">
            বাজার মনিটরিং ও দরদাম
          </span>
          <h1 className="text-3xl font-black mb-3 text-white">দৈনিক বাজারদর ডিরেক্টরি</h1>
          <p className="text-emerald-50 text-sm md:text-base max-w-lg leading-relaxed border-l-4 border-emerald-400 pl-3 py-1">
             পুঠিয়া সদর, ঝলমলিয়া ও বানেশ্বর হাটের কৃষি ফসল, শাকসবজি এবং নিত্যপ্রয়োজনীয় মালের আজকের তাজা বাজারমূল্য তালিকা।
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      {/* Post Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Grid Tabs Selection */}
        <div className="grid grid-cols-4 gap-2 flex-1 w-full">
          {[
            { id: 'vegetable', label: 'সবজি বাজার', icon: '🍅' },
            { id: 'groceries', label: 'নিত্যপণ্য', icon: '🍚' },
            { id: 'protein', label: 'মাছ-মাংস', icon: '🐟' },
            { id: 'crops', label: 'ফসলের মোকাম', icon: '🌾' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`py-3 px-1 rounded-2xl text-center border font-bold text-xs transition shadow-sm cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg block mb-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Post Button */}
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all shrink-0 cursor-pointer border-none w-full sm:w-auto"
        >
          {showPostForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showPostForm ? 'ফর্ম বন্ধ করুন' : 'নতুন বাজারদর যোগ করুন'}
        </button>
      </div>

      {/* Form Area */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handlePostSubmit} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                <PlusCircle className="w-5 h-5 text-emerald-500" /> নতুন পণ্যের বাজারদর পোস্ট করুন
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">১. পণ্যের নাম *</label>
                  <input
                    type="text"
                    required
                    value={newProductName || ""}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="উদাঃ দেশি গোল বেগুন বা কাঁচামরিচ"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">২. ক্যাটাগরি *</label>
                  <select
                    value={newCategory || ""}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none font-bold text-emerald-700"
                  >
                    <option value="vegetable">সবজি বাজার 🍅</option>
                    <option value="groceries">নিত্যপণ্য 🍚</option>
                    <option value="protein">মাছ-মাংস 🐟</option>
                    <option value="crops">ফসলের মোকাম 🌾</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৩. খুচরা দাম (টাকা) *</label>
                  <input
                    type="text"
                    required
                    value={newRetailPrice || ""}
                    onChange={(e) => setNewRetailPrice(e.target.value)}
                    placeholder="উদাঃ ৪০ - ৪৫"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৪. পাইকারি দাম (টাকা) *</label>
                  <input
                    type="text"
                    required
                    value={newWholesalePrice || ""}
                    onChange={(e) => setNewWholesalePrice(e.target.value)}
                    placeholder="উদাঃ ৩২ - ৩৫"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৫. পরিমাপ একক *</label>
                  <input
                    type="text"
                    required
                    value={newUnit || ""}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="উদাঃ কেজি, পিস, হালি, মন"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৬. মূল্য ট্রেন্ড *</label>
                  <select
                    value={newTrend || ""}
                    onChange={(e) => setNewTrend(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none font-bold"
                  >
                    <option value="stable">অপরিবর্তিত ➖</option>
                    <option value="up">ঊর্ধ্বমুখী 📈</option>
                    <option value="down">নিম্নমুখী 📉</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">৭. বাজারের নাম/অবস্থান *</label>
                  <input
                    type="text"
                    required
                    value={newMarketName || ""}
                    onChange={(e) => setNewMarketName(e.target.value)}
                    placeholder="উদাঃ পুঠিয়া কাঁচাবাজার, বানেশ্বর হাট"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPosting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer border-none"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    প্রকাশ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    বাজারদর পোস্ট প্রকাশ করুন
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Box */}
      <div className="relative">
        <span className="absolute left-3.5 inset-y-0 flex items-center text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${activeTab === 'vegetable' ? 'সবজি' : activeTab === 'groceries' ? 'নিত্যপণ্য' : activeTab === 'protein' ? 'মাংস/ডিম' : 'ফসল'} অনুসন্ধান করুন...`}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
        />
      </div>

      {/* Price Table list */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
            <ShoppingBag className="w-4.5 h-4.5 text-emerald-600" /> আজকের সর্বশেষ দাম তালিকা
          </h3>
          <span className="text-[10px] text-gray-400 font-bold">আপডেট: আজ সকাল ০৯:১৫ মি.</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
            <p className="text-xs text-gray-400 font-bold">লোডিং হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            "<b>{searchQuery}</b>" নামে কোনো মাল খুঁজে পাওয়া যায়নি ভাই।
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id || index} 
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 first:pt-1 last:pb-1 relative pr-8 md:pr-12"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                    📍 {item.marketName}
                  </span>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div className="text-left md:text-right">
                      <span className="text-gray-400 text-[9px] block">খুচরা দাম</span>
                      <span className="text-emerald-700">{item.retailPrice} ৳ / {item.unit}</span>
                    </div>
                    <div className="border-l border-gray-100 pl-4 text-left md:text-right">
                      <span className="text-gray-400 text-[9px] block">পাইকারি দাম</span>
                      <span className="text-gray-600">{item.wholesalePrice} ৳</span>
                    </div>
                  </div>

                  <div>
                    {renderTrendIcon(item.trend)}
                  </div>
                </div>

                {/* Delete button for user-submitted posts */}
                {item.isUserPost && (
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="absolute top-2 right-0 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maund ⇄ KG Converter (মন ⇄ কেজি কনভার্টার) */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-zinc-950 p-1.5 rounded-xl">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">ঐতিহ্যবাহী ফসলের ওজন কনভার্টার</h3>
            <span className="text-[10px] text-emerald-400 font-bold block">মন (Maund) ⇄ কেজি হিসাব করুন</span>
          </div>
        </div>

        <form onSubmit={handleConvert} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="number"
              step="any"
              value={calcInput || ""}
              onChange={(e) => setCalcInput(e.target.value)}
              placeholder="পরিমাণ লিখুন (উদাঃ ১০)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs outline-none text-white focus:border-emerald-500"
            />
            <select
              value={calcUnit || ""}
              onChange={(e) => {
                setCalcUnit(e.target.value as any);
                setCalcResult(null);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-bold"
            >
              <option value="mon_to_kg">মন থেকে কেজি (৪০ কেজি = ১ মন)</option>
              <option value="kg_to_mon">কেজি থেকে মন</option>
            </select>

            <button 
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-sm border-none"
            >
              হিসাব করুন
            </button>
          </div>
        </form>

        {calcResult && (
          <div className="bg-emerald-950/40 border border-emerald-900/40 p-4 rounded-xl text-center text-xs font-bold text-emerald-400 animate-fade-in">
            ⚖️ {calcResult}
          </div>
        )}
      </div>

      {/* Information Disclaimers */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed text-justify">
          <b>সতর্কতা নোটিশ:</b> উল্লিখিত বাজারমূল্য সর্বশেষ প্রাপ্ত তথ্যানুযায়ী নির্ধারিত। স্থানীয় বিক্রেতা, সময় এবং বিশেষ পরিস্থিতির উপর ভিত্তি করে বাজারদরে ৫%-১০% কম-বেশি হতে পারে ভাই। পাইকারি ক্রয়ের ক্ষেত্রে বানেশ্বর মোকাম বা ঝলমলিয়া হাটে গিয়ে যাচাই করে নেওয়া উত্তম।
        </p>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

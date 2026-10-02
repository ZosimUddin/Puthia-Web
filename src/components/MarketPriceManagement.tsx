import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Minus, Save, X, Search, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface MarketItem {
  id: string;
  name: string;
  retailPrice: string;
  wholesalePrice: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  marketName: string;
  category: 'vegetable' | 'groceries' | 'protein' | 'crops';
}

const MarketPriceManagement: React.FC = () => {
  const [prices, setPrices] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'vegetable' | 'groceries' | 'protein' | 'crops'>('all');

  const [formData, setFormData] = useState<Omit<MarketItem, 'id'>>({
    name: '',
    category: 'vegetable',
    retailPrice: '',
    wholesalePrice: '',
    unit: 'কেজি',
    trend: 'stable',
    marketName: 'পুঠিয়া কাঁচাবাজার'
  });

  useEffect(() => {
    const q = query(collection(db, "market_prices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: MarketItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || "",
          category: data.category || "vegetable",
          retailPrice: data.retailPrice || "",
          wholesalePrice: data.wholesalePrice || "",
          unit: data.unit || "",
          trend: data.trend || "stable",
          marketName: data.marketName || ""
        });
      });
      setPrices(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching market prices:", error);
      handleFirestoreError(error, OperationType.LIST, "market_prices");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.retailPrice.trim() || !formData.wholesalePrice.trim() || !formData.marketName.trim()) {
      alert('দয়া করে সব তথ্য পূরণ করুন');
      return;
    }

    try {
      if (editingId) {
        const itemRef = doc(db, 'market_prices', editingId);
        await updateDoc(itemRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        alert('বাজারদর তথ্য সফলভাবে আপডেট করা হয়েছে');
      } else {
        await addDoc(collection(db, 'market_prices'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        alert('নতুন বাজারদর সফলভাবে যোগ করা হয়েছে');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        name: '',
        category: 'vegetable',
        retailPrice: '',
        wholesalePrice: '',
        unit: 'কেজি',
        trend: 'stable',
        marketName: 'পুঠিয়া কাঁচাবাজার'
      });
    } catch (error) {
      console.error("Error saving market price:", error);
      handleFirestoreError(error, OperationType.WRITE, editingId ? `market_prices/${editingId}` : "market_prices");
    }
  };

  const handleEditClick = (item: MarketItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      retailPrice: item.retailPrice,
      wholesalePrice: item.wholesalePrice,
      unit: item.unit,
      trend: item.trend,
      marketName: item.marketName
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই বাজারদর তথ্যটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, 'market_prices', id));
        alert('বাজারদর তথ্য সফলভাবে মুছে ফেলা হয়েছে');
      } catch (error) {
        console.error("Error deleting market price:", error);
        handleFirestoreError(error, OperationType.DELETE, `market_prices/${id}`);
      }
    }
  };

  const filteredPrices = prices.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.marketName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch(trend) {
      case 'up':
        return <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-red-500/10"><TrendingUp className="w-3.5 h-3.5" /> ঊর্ধ্বমুখী</span>;
      case 'down':
        return <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-500/10"><TrendingDown className="w-3.5 h-3.5" /> নিম্নমুখী</span>;
      default:
        return <span className="bg-gray-500/10 text-gray-400 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-gray-500/10"><Minus className="w-3.5 h-3.5" /> অপরিবর্তিত</span>;
    }
  };

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-500" />
          <span>আজকের বাজার দর ম্যানেজমেন্ট</span>
        </h3>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({
                name: '',
                category: 'vegetable',
                retailPrice: '',
                wholesalePrice: '',
                unit: 'কেজি',
                trend: 'stable',
                marketName: 'পুঠিয়া কাঁচাবাজার'
              });
            } else {
              setIsAdding(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#006A4E] hover:bg-[#005c43]'}`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'বাতিল করুন' : 'নতুন বাজারদর যোগ করুন'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-[#121212] p-6 rounded-xl border border-gray-700 mb-6 space-y-4 text-left">
          <h4 className="font-bold text-white text-lg border-b border-gray-800 pb-2 mb-4">
            {editingId ? 'বাজারদর তথ্য আপডেট করুন' : 'নতুন বাজারদর তৈরি করুন'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">পণ্যের নাম *</label>
              <input 
                type="text" 
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ দেশি গোল বেগুন বা কাঁচামরিচ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">ক্যাটাগরি *</label>
              <select 
                value={formData.category || ""}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
              >
                <option value="vegetable">সবজি বাজার (Vegetable)</option>
                <option value="groceries">নিত্যপণ্য (Groceries)</option>
                <option value="protein">মাছ-মাংস (Protein)</option>
                <option value="crops">ফসলের মোকাম (Crops)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">খুচরা দাম (টাকা) *</label>
              <input 
                type="text" 
                required
                value={formData.retailPrice || ""}
                onChange={(e) => setFormData({...formData, retailPrice: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ ৪০ - ৪৫"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">পাইকারি দাম (টাকা) *</label>
              <input 
                type="text" 
                required
                value={formData.wholesalePrice || ""}
                onChange={(e) => setFormData({...formData, wholesalePrice: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ ৩২ - ৩৫"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">পরিমাপ একক *</label>
              <input 
                type="text" 
                required
                value={formData.unit || ""}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ কেজি, পিস, হালি, মন"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">মূল্য ট্রেন্ড *</label>
              <select 
                value={formData.trend || ""}
                onChange={(e) => setFormData({...formData, trend: e.target.value as any})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
              >
                <option value="stable">অপরিবর্তিত (➖)</option>
                <option value="up">ঊর্ধ্বমুখী (📈)</option>
                <option value="down">নিম্নমুখী (📉)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">বাজারের নাম/অবস্থান *</label>
              <input 
                type="text" 
                required
                value={formData.marketName || ""}
                onChange={(e) => setFormData({...formData, marketName: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ পুঠিয়া কাঁচাবাজার, বানেশ্বর হাট"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#006A4E] hover:bg-[#005c43] text-white rounded-xl font-bold text-sm transition-colors mt-4"
          >
            <Save className="w-4 h-4" /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </form>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'সব ক্যাটাগরি' },
            { id: 'vegetable', label: 'সবজি' },
            { id: 'groceries', label: 'নিত্যপণ্য' },
            { id: 'protein', label: 'মাছ-মাংস' },
            { id: 'crops', label: 'ফসলের মোকাম' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#006A4E]/20 border-[#006A4E]/50 text-emerald-400' 
                  : 'bg-[#121212] border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute left-3 inset-y-0 flex items-center text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পণ্য বা অবস্থান খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-gray-800 text-white rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#006A4E] animate-spin mb-2" />
          <p className="text-sm text-gray-400">বাজারদরের তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredPrices.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#121212] rounded-xl border border-gray-800 flex flex-col items-center">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-25" />
          <p>কোনো বাজারদর তথ্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-[#121212]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">পণ্যের নাম</th>
                <th className="px-4 py-3">খুচরা দাম</th>
                <th className="px-4 py-3">পাইকারি দাম</th>
                <th className="px-4 py-3">একক</th>
                <th className="px-4 py-3">ট্রেন্ড</th>
                <th className="px-4 py-3">বাজার</th>
                <th className="px-4 py-3 rounded-r-xl text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPrices.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-white">{item.name}</td>
                  <td className="px-4 py-3.5 text-emerald-400 font-bold">{item.retailPrice} ৳</td>
                  <td className="px-4 py-3.5 text-gray-400">{item.wholesalePrice} ৳</td>
                  <td className="px-4 py-3.5 text-gray-400">{item.unit}</td>
                  <td className="px-4 py-3.5">{renderTrendIcon(item.trend)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">{item.marketName}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketPriceManagement;

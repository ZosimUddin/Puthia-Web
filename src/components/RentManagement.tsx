import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit2, Trash2, Save, X, Search, Loader2, Phone, MapPin, DollarSign, User } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ToLetAd } from '../types';

const RentManagement: React.FC = () => {
  const [ads, setAds] = useState<ToLetAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'house' | 'mess' | 'shop' | 'other'>('all');

  const [formData, setFormData] = useState<Omit<ToLetAd, 'id' | 'createdAt'>>({
    title: '',
    category: 'house',
    description: '',
    rent: '',
    location: '',
    ownerName: 'অ্যাডমিন',
    ownerPhone: '01700000000',
    details: '',
    union: 'পুঠিয়া',
  });

  useEffect(() => {
    const q = query(collection(db, "tolet_ads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ToLetAd[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "",
          category: data.category || "house",
          description: data.description || "",
          rent: data.rent || "",
          location: data.location || "",
          ownerName: data.ownerName || "",
          ownerPhone: data.ownerPhone || "",
          details: data.details || "",
          createdAt: data.createdAt || "",
          union: data.union || "পুঠিয়া",
          views: data.views || 0,
          calls: data.calls || 0,
          saves: data.saves || 0,
        } as ToLetAd);
      });
      setAds(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tolet ads:", error);
      handleFirestoreError(error, OperationType.LIST, "tolet_ads");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.rent.trim() || !formData.location.trim() || !formData.ownerPhone.trim()) {
      alert('দয়া করে শিরোনাম, ভাড়া, ঠিকানা এবং মোবাইল নাম্বার পূরণ করুন');
      return;
    }

    try {
      const adData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        const adRef = doc(db, 'tolet_ads', editingId);
        await updateDoc(adRef, adData);
        alert('বিজ্ঞাপনটি সফলভাবে আপডেট করা হয়েছে');
      } else {
        const newAd = {
          ...adData,
          createdAt: new Date().toISOString().split('T')[0],
          views: 0,
          calls: 0,
          saves: 0
        };
        await addDoc(collection(db, 'tolet_ads'), newAd);
        alert('নতুন বিজ্ঞাপনটি সফলভাবে যোগ করা হয়েছে');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: '',
        category: 'house',
        description: '',
        rent: '',
        location: '',
        ownerName: 'অ্যাডমিন',
        ownerPhone: '01700000000',
        details: '',
        union: 'পুঠিয়া',
      });
    } catch (error) {
      console.error("Error saving rent ad:", error);
      handleFirestoreError(error, OperationType.WRITE, editingId ? `tolet_ads/${editingId}` : "tolet_ads");
    }
  };

  const handleEditClick = (ad: ToLetAd) => {
    setFormData({
      title: ad.title,
      category: ad.category,
      description: ad.description,
      rent: ad.rent,
      location: ad.location,
      ownerName: ad.ownerName,
      ownerPhone: ad.ownerPhone,
      details: ad.details,
      union: ad.union || 'পুঠিয়া',
    });
    setEditingId(ad.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই বাসা/মেস ভাড়ার বিজ্ঞাপনটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, 'tolet_ads', id));
        alert('বিজ্ঞাপনটি সফলভাবে মুছে ফেলা হয়েছে');
      } catch (error) {
        console.error("Error deleting rent ad:", error);
        handleFirestoreError(error, OperationType.DELETE, `tolet_ads/${id}`);
      }
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ad.ownerPhone.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || ad.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Home className="w-6 h-6 text-emerald-500" />
          <span>মেস ও বাসা ভাড়া ম্যানেজমেন্ট</span>
        </h3>
        <button 
          onClick={() => {
            if (isAdding) {
              setIsAdding(false);
              setEditingId(null);
              setFormData({
                title: '',
                category: 'house',
                description: '',
                rent: '',
                location: '',
                ownerName: 'অ্যাডমিন',
                ownerPhone: '01700000000',
                details: '',
                union: 'পুঠিয়া',
              });
            } else {
              setIsAdding(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-sm transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#006A4E] hover:bg-[#005c43]'}`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'বাতিল করুন' : 'নতুন বিজ্ঞাপন যোগ করুন'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-[#121212] p-6 rounded-xl border border-gray-700 mb-6 space-y-4 text-left">
          <h4 className="font-bold text-white text-lg border-b border-gray-800 pb-2 mb-4">
            {editingId ? 'বিজ্ঞাপন আপডেট করুন' : 'নতুন বিজ্ঞাপন তৈরি করুন'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">বিজ্ঞাপনের শিরোনাম *</label>
              <input 
                type="text" 
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ ছাত্রদের জন্য ৩ সীটের মেস ভাড়া বা ফ্যামিলি বাসা ভাড়া"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">ক্যাটাগরি *</label>
              <select 
                value={formData.category || ""}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
              >
                <option value="house">বাসা ভাড়া (House)</option>
                <option value="mess">মেস ভাড়া (Mess)</option>
                <option value="shop">দোকান ভাড়া (Shop)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">মাসিক ভাড়া (টাকা) *</label>
              <input 
                type="text" 
                required
                value={formData.rent || ""}
                onChange={(e) => setFormData({...formData, rent: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ ৫,০০০ বা ১৫০০/সীট"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">অবস্থান / ঠিকানা *</label>
              <input 
                type="text" 
                required
                value={formData.location || ""}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ পুঠিয়া রাজবাড়ী সংলগ্ন, পিটিআই মোড়"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">ইউনিয়ন *</label>
              <select 
                value={formData.union || ""}
                onChange={(e) => setFormData({...formData, union: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
              >
                <option value="পুঠিয়া">পুঠিয়া ইউনিয়ন</option>
                <option value="বানেশ্বর">বানেশ্বর ইউনিয়ন</option>
                <option value="বেলপুকুরিয়া">বেলপুকুরিয়া ইউনিয়ন</option>
                <option value="ভালুকগাছী">ভালুকগাছী ইউনিয়ন</option>
                <option value="জিউপাড়া">জিউপাড়া ইউনিয়ন</option>
                <option value="শিলমাড়িয়া">শিলমাড়িয়া ইউনিয়ন</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">মালিক / কেয়ারটেকার নাম *</label>
              <input 
                type="text" 
                required
                value={formData.ownerName || ""}
                onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ আব্দুর রহমান"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">মোবাইল নাম্বার *</label>
              <input 
                type="text" 
                required
                value={formData.ownerPhone || ""}
                onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm"
                placeholder="উদাঃ 017xxxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">সংক্ষিপ্ত বিবরণ *</label>
              <textarea 
                required
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm resize-none"
                placeholder="প্রপার্টির সুযোগ সুবিধা সম্পর্কে লিখুন..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">বিস্তারিত সুযোগ সুবিধা (ঐচ্ছিক)</label>
              <textarea 
                rows={3}
                value={formData.details || ""}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#006A4E] text-sm resize-none"
                placeholder="যেমন: ওয়াইফাই, পানির পাম্প, কার পার্কিং ব্যবস্থা আছে..."
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
            { id: 'all', label: 'সব প্রপার্টি' },
            { id: 'house', label: 'বাসা' },
            { id: 'mess', label: 'মেস' },
            { id: 'shop', label: 'দোকান' },
            { id: 'other', label: 'অন্যান্য' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                activeCategory === tab.id 
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
            placeholder="শিরোনাম বা ঠিকানা খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-gray-800 text-white rounded-xl text-xs focus:outline-none focus:border-[#006A4E]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#006A4E] animate-spin mb-2" />
          <p className="text-sm text-gray-400">বাসা/মেস ভাড়ার তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#121212] rounded-xl border border-gray-800 flex flex-col items-center">
          <Home className="w-12 h-12 mb-4 opacity-25" />
          <p>কোনো ভাড়ার বিজ্ঞাপন পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className="bg-[#121212] border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/10">
                    {ad.category === 'house' ? 'বাসা' : ad.category === 'mess' ? 'মেস' : ad.category === 'shop' ? 'দোকান' : 'অন্যান্য'}
                  </span>
                  <span className="text-xs text-gray-500">{ad.createdAt}</span>
                </div>
                <h4 className="text-base font-bold text-white">{ad.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ভাড়া: <strong className="text-white">{ad.rent} ৳</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>ঠিকানা: {ad.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>মালিক: {ad.ownerName} ({ad.ownerPhone})</span>
                  </div>
                </div>
                {ad.description && <p className="text-xs text-gray-500 line-clamp-1">{ad.description}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 sm:self-center shrink-0">
                <button 
                  onClick={() => handleEditClick(ad)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                  title="এডিট করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentManagement;

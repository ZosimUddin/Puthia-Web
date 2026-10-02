import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { getAds, saveAd, deleteAd, uploadFileToStorage, Ad } from '../api';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function BannerManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = collection(db, "ads");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adsData: Ad[] = [];
      snapshot.forEach((doc) => {
        adsData.push({ id: doc.id, ...doc.data() } as Ad);
      });
      setAds(adsData.sort((a, b) => a.order - b.order));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching ads:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editingAd?.title || !editingAd?.imageUrl) {
      alert('সবগুলো ঘর পূরণ করুন');
      return;
    }

    try {
      const adToSave: Ad = {
        id: editingAd.id || doc(collection(db, 'ads')).id,
        title: editingAd.title,
        imageUrl: editingAd.imageUrl,
        link: editingAd.link || '',
        slotType: editingAd.slotType || 'top_banner',
        order: editingAd.order || ads.length,
        createdAt: editingAd.createdAt || new Date().toISOString()
      };

      await saveAd(adToSave);
      setIsEditing(false);
      setEditingAd(null);
    } catch (error) {
      console.error("Error saving ad:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই বিজ্ঞাপনটি মুছতে চান?')) {
      try {
        await deleteAd(id);
      } catch (error) {
        console.error("Error deleting ad:", error);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const path = `ads/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage(file, path);
        setEditingAd(prev => ({ ...prev, imageUrl: url }));
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">ব্যানার/স্লাইডার ম্যানেজমেন্ট</h3>
          <p className="text-base text-gray-500">হোম পেজের স্লাইডার এবং ব্যানার পরিচালনা করুন</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setEditingAd({ slotType: 'top_banner', order: ads.length });
              setIsEditing(true);
            }}
            className="bg-[#006A4E] hover:bg-[#005A42] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>নতুন ব্যানার যোগ করুন</span>
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white">{editingAd?.id ? 'ব্যানার এডিট করুন' : 'নতুন ব্যানার যোগ করুন'}</h4>
            <button onClick={() => { setIsEditing(false); setEditingAd(null); }} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">শিরোনাম</label>
              <input 
                type="text" 
                value={editingAd?.title || ''}
                onChange={(e) => setEditingAd(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:border-emerald-500"
                placeholder="ব্যানারের শিরোনাম লিখুন"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">লিংক (ঐচ্ছিক)</label>
              <input 
                type="text" 
                value={editingAd?.link || ''}
                onChange={(e) => setEditingAd(prev => ({ ...prev, link: e.target.value }))}
                className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-2 rounded-lg outline-none focus:border-emerald-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">ছবি আপলোড করুন</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 bg-[#121212] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden relative"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              ) : editingAd?.imageUrl ? (
                <img src={editingAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                  <span className="text-xs text-gray-500">ছবি নির্বাচন করুন</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>সংরক্ষণ করুন</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>লোড হচ্ছে...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 bg-[#1E1E1E] rounded-2xl border border-gray-800">
            <ImageIcon className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500">কোনো ব্যানার পাওয়া যায়নি</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-[#1E1E1E] border border-gray-800 rounded-2xl overflow-hidden group">
              <div className="h-48 bg-gray-800 relative overflow-hidden">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md border border-white/10">
                  {ad.title}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-gradient-to-t from-black/20 to-transparent">
                <div className="text-gray-400 text-xs truncate max-w-[200px]">{ad.link || 'No link'}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingAd(ad); setIsEditing(true); }}
                    className="p-2.5 bg-gray-800 hover:bg-emerald-900/50 text-gray-400 hover:text-emerald-400 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id)}
                    className="p-2.5 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

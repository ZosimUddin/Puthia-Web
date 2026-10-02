import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Calendar, Users, MapPin, 
  Plus, Edit2, Trash2, Save, X, Search, Activity, Flag 
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'sonner';

export default function SportsManagement() {
  const [activeTab, setActiveTab] = useState('matches');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const TABS = [
    { id: 'matches', label: 'ম্যাচ ও স্কোর', icon: Activity },
    { id: 'tournaments', label: 'টুর্নামেন্ট', icon: Trophy },
    { id: 'teams', label: 'দল', icon: Users },
    { id: 'venues', label: 'মাঠ', icon: MapPin }
  ];

  useEffect(() => {
    const q = query(collection(db, `sports_${activeTab}`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, `sports_${activeTab}`, editingItem.id), dataToSave);
        toast.success('সফলভাবে আপডেট করা হয়েছে');
      } else {
        dataToSave.createdAt = new Date().toISOString();
        await addDoc(collection(db, `sports_${activeTab}`), dataToSave);
        toast.success('সফলভাবে যোগ করা হয়েছে');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error("Error saving:", error);
      toast.error('দুঃখিত, কোনো সমস্যা হয়েছে');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, `sports_${activeTab}`, id));
        toast.success('সফলভাবে মুছে ফেলা হয়েছে');
      } catch (error) {
        toast.error('দুঃখিত, কোনো সমস্যা হয়েছে');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Trophy className="text-blue-600" size={28} />
          খেলাধুলা ব্যবস্থাপনা
        </h1>
        <button 
          onClick={() => {
            setEditingItem(null);
            setFormData({});
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          নতুন যোগ করুন
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowForm(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800">
              {editingItem ? 'এডিট করুন' : 'নতুন যোগ করুন'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            {activeTab === 'matches' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">খেলার ধরন</label>
                    <select
                      value={formData.sport || ''}
                      onChange={e => setFormData({...formData, sport: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      required
                    >
                      <option value="">নির্বাচন করুন</option>
                      <option value="ফুটবল">ফুটবল</option>
                      <option value="ক্রিকেট">ক্রিকেট</option>
                      <option value="ভলিবল">ভলিবল</option>
                      <option value="কাবাডি">কাবাডি</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">টুর্নামেন্ট</label>
                    <input
                      type="text"
                      value={formData.tournament || ''}
                      onChange={e => setFormData({...formData, tournament: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">দল ১ (Team A)</label>
                    <input
                      type="text"
                      value={formData.teamA || ''}
                      onChange={e => setFormData({...formData, teamA: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">দল ২ (Team B)</label>
                    <input
                      type="text"
                      value={formData.teamB || ''}
                      onChange={e => setFormData({...formData, teamB: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">স্কোর ১</label>
                    <input
                      type="text"
                      value={formData.scoreA || ''}
                      onChange={e => setFormData({...formData, scoreA: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">স্কোর ২</label>
                    <input
                      type="text"
                      value={formData.scoreB || ''}
                      onChange={e => setFormData({...formData, scoreB: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">ম্যাচের অবস্থা (সময়/ইনিংস)</label>
                    <input
                      type="text"
                      value={formData.time || ''}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">মাঠ/ভেন্যু</label>
                    <input
                      type="text"
                      value={formData.venue || ''}
                      onChange={e => setFormData({...formData, venue: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isLive"
                    checked={formData.isLive || false}
                    onChange={e => setFormData({...formData, isLive: e.target.checked})}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isLive" className="text-sm font-bold text-slate-700 cursor-pointer">ম্যাচটি কি লাইভ চলছে?</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isCompleted"
                    checked={formData.isCompleted || false}
                    onChange={e => setFormData({...formData, isCompleted: e.target.checked})}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isCompleted" className="text-sm font-bold text-slate-700 cursor-pointer">ম্যাচটি কি শেষ হয়েছে?</label>
                </div>
              </>
            )}

            {/* General Fields Fallback (if any tab misses specific fields) */}
            {activeTab !== 'matches' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">নাম</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">বিবরণ</label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
              >
                <Save size={18} />
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-400 font-bold">লোড হচ্ছে...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              কোনো তথ্য পাওয়া যায়নি
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">বিবরণ</th>
                    <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="px-5 py-3.5 text-xs font-black text-slate-600 uppercase tracking-wider text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4">
                        {activeTab === 'matches' ? (
                          <div>
                            <div className="font-bold text-sm text-slate-800">{item.teamA} বনাম {item.teamB}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{item.tournament} • {item.sport}</div>
                          </div>
                        ) : (
                          <div className="font-bold text-sm text-slate-800">{item.name}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {item.isLive && <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase">Live</span>}
                        {item.isCompleted && <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">Completed</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData(item);
                              setShowForm(true);
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                          >
                            <Trash2 size={16} />
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
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, Edit2, Trash2, 
  Calendar, MapPin, Clock, Users, Star, Image, 
  Video, ShoppingBag, Utensils, ShieldCheck, 
  Bell, Save, X, ChevronRight, MoreVertical,
  PlusCircle, MinusCircle, AlertTriangle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

const MelaManagement: React.FC = () => {
  const navigate = useNavigate();
  const [fairs, setFairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    bannerUrl: '',
    status: 'আসন্ন',
    startDate: '',
    endDate: '',
    venue: '',
    organizer: '',
    history: '',
    entryFee: 'প্রবেশ ফ্রি',
    schedule: 'সকাল ১০:০০ - রাত ১০:০০',
    location: {
      lat: 24.37,
      lng: 88.84,
      address: '',
      parkingInfo: '',
      nearestBusStand: ''
    },
    attractions: [],
    stalls: [],
    events: [],
    gallery: [],
    security: {
      policeBooth: '',
      medicalCamp: '',
      lostFoundDesk: '',
      emergencyNumbers: []
    },
    food: [],
    weatherInfo: {
      today: 'রৌদ্রোজ্জ্বল',
      alert: ''
    }
  });

  useEffect(() => {
    const q = query(collection(db, 'fairs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fairsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFairs(fairsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'fairs', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'fairs'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Error saving fair:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই মেলাটি মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, 'fairs', id));
      } catch (error) {
        console.error("Error deleting fair:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bannerUrl: '',
      status: 'আসন্ন',
      startDate: '',
      endDate: '',
      venue: '',
      organizer: '',
      history: '',
      entryFee: 'প্রবেশ ফ্রি',
      schedule: 'সকাল ১০:০০ - রাত ১০:০০',
      location: {
        lat: 24.37,
        lng: 88.84,
        address: '',
        parkingInfo: '',
        nearestBusStand: ''
      },
      attractions: [],
      stalls: [],
      events: [],
      gallery: [],
      security: {
        policeBooth: '',
        medicalCamp: '',
        lostFoundDesk: '',
        emergencyNumbers: []
      },
      food: [],
      weatherInfo: {
        today: 'রৌদ্রোজ্জ্বল',
        alert: ''
      }
    });
  };

  const handleEdit = (fair: any) => {
    setFormData(fair);
    setEditingId(fair.id);
    setIsAdding(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">মেলা ব্যবস্থাপনা</h1>
              <p className="text-xs font-bold text-slate-400">ঐতিহ্যবাহী মেলার সকল তথ্য নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsAdding(true);
              setEditingId(null);
            }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus size={20} />
            নতুন মেলা যোগ করুন
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
            <p className="font-black text-slate-400">লোড হচ্ছে...</p>
          </div>
        ) : fairs.length === 0 && !isAdding ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[48px] p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Calendar size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">কোনো মেলা পাওয়া যায়নি</h2>
            <p className="text-slate-400 font-medium mb-8">এখনই প্রথম মেলাটি যোগ করুন</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all"
            >
              মেলা যোগ করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fairs.map((fair) => (
              <div key={fair.id} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden group hover:shadow-xl transition-all">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={fair.bannerUrl || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'} 
                    alt={fair.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-full text-emerald-600 border border-emerald-100 shadow-sm">
                      {fair.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleEdit(fair)}
                      className="p-2 bg-white/90 backdrop-blur text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(fair.id)}
                      className="p-2 bg-white/90 backdrop-blur text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-black text-slate-900 line-clamp-1">{fair.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <MapPin size={14} className="text-emerald-500" />
                    <span className="line-clamp-1">{fair.venue}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <Calendar size={14} />
                      {fair.startDate}
                    </div>
                    <button 
                      onClick={() => navigate(`/mela?id=${fair.id}`)}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                    >
                      View Live
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-t-[48px] sm:rounded-[48px] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{editingId ? 'মেলা সম্পাদনা' : 'নতুন মেলা যোগ করুন'}</h2>
                  <p className="text-xs font-bold text-slate-400">মেলার সকল তথ্য নির্ভুলভাবে প্রদান করুন</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Tabs */}
              <div className="px-8 pt-4 border-b border-slate-100 flex gap-6 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'basic', label: 'প্রাথমিক তথ্য', icon: Info },
                  { id: 'attractions', label: 'আকর্ষণ ও গ্যালারি', icon: Star },
                  { id: 'stalls', label: 'স্টল ও খাবার', icon: ShoppingBag },
                  { id: 'schedule', label: 'অনুষ্ঠান সূচি', icon: Calendar },
                  { id: 'location', label: 'লোকেশন ও নিরাপত্তা', icon: MapPin },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`pb-4 px-2 text-sm font-black whitespace-nowrap transition-all relative ${
                      activeFormTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon size={18} />
                      {tab.label}
                    </div>
                    {activeFormTab === tab.id && (
                      <motion.div layoutId="formTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {activeFormTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">মেলার নাম</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="মেলার নাম লিখুন"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ব্যানার ইমেজ URL</label>
                        <input 
                          type="text" 
                          value={formData.bannerUrl}
                          onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">শুরুর তারিখ</label>
                          <input 
                            type="text" 
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="১৫ আগস্ট ২০২৬"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">শেষ তারিখ</label>
                          <input 
                            type="text" 
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="২২ আগস্ট ২০২৬"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">স্থান</label>
                        <input 
                          type="text" 
                          value={formData.venue}
                          onChange={(e) => setFormData({...formData, venue: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="মেলার স্থান লিখুন"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">আয়োজনকারী</label>
                        <input 
                          type="text" 
                          value={formData.organizer}
                          onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                          placeholder="আয়োজনকারীর নাম"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">মেলার ইতিহাস ও পরিচিতি</label>
                        <textarea 
                          rows={4}
                          value={formData.history}
                          onChange={(e) => setFormData({...formData, history: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                          placeholder="মেলার ইতিহাস বর্ণনা করুন..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'attractions' && (
                  <div className="space-y-10">
                    {/* Attractions Manager */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900">মেলার প্রধান আকর্ষণ</h3>
                        <button 
                          onClick={() => setFormData({
                            ...formData, 
                            attractions: [...formData.attractions, { name: '', description: '', iconName: 'Star' }] as any
                          })}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.attractions.map((attr: any, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-[32px] space-y-4 relative group">
                            <button 
                              onClick={() => {
                                const newAttr = [...formData.attractions];
                                newAttr.splice(idx, 1);
                                setFormData({...formData, attractions: newAttr});
                              }}
                              className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MinusCircle size={20} />
                            </button>
                            <input 
                              type="text" 
                              value={attr.name}
                              onChange={(e) => {
                                const newAttr = [...formData.attractions] as any;
                                newAttr[idx].name = e.target.value;
                                setFormData({...formData, attractions: newAttr});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-sm outline-none"
                              placeholder="আকর্ষণের নাম (উদা: নাগরদোলা)"
                            />
                            <textarea 
                              value={attr.description}
                              onChange={(e) => {
                                const newAttr = [...formData.attractions] as any;
                                newAttr[idx].description = e.target.value;
                                setFormData({...formData, attractions: newAttr});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-xs outline-none resize-none"
                              placeholder="বিবরণ..."
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Manager */}
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900">ছবি ও ভিডিও গ্যালারি</h3>
                        <button 
                          onClick={() => setFormData({
                            ...formData, 
                            gallery: [...formData.gallery, { url: '', type: 'image', caption: '' }] as any
                          })}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.gallery.map((item: any, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-[32px] space-y-4 relative group">
                            <button 
                              onClick={() => {
                                const newGallery = [...formData.gallery];
                                newGallery.splice(idx, 1);
                                setFormData({...formData, gallery: newGallery});
                              }}
                              className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MinusCircle size={20} />
                            </button>
                            <div className="flex gap-2">
                              <select 
                                value={item.type}
                                onChange={(e) => {
                                  const newGallery = [...formData.gallery] as any;
                                  newGallery[idx].type = e.target.value;
                                  setFormData({...formData, gallery: newGallery});
                                }}
                                className="px-3 py-2 bg-white rounded-xl text-xs font-black outline-none"
                              >
                                <option value="image">ছবি</option>
                                <option value="video">ভিডিও</option>
                              </select>
                              <input 
                                type="text" 
                                value={item.url}
                                onChange={(e) => {
                                  const newGallery = [...formData.gallery] as any;
                                  newGallery[idx].url = e.target.value;
                                  setFormData({...formData, gallery: newGallery});
                                }}
                                className="flex-1 px-4 py-2 bg-white border-none rounded-xl font-bold text-xs outline-none"
                                placeholder="URL লিখুন"
                              />
                            </div>
                            <input 
                              type="text" 
                              value={item.caption}
                              onChange={(e) => {
                                const newGallery = [...formData.gallery] as any;
                                newGallery[idx].caption = e.target.value;
                                setFormData({...formData, gallery: newGallery});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-xs outline-none"
                              placeholder="ক্যাপশন..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'stalls' && (
                  <div className="space-y-12">
                    {/* Stalls Manager */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900">মেলার স্টল</h3>
                        <button 
                          onClick={() => setFormData({
                            ...formData, 
                            stalls: [...formData.stalls, { name: '', category: '', count: '' }] as any
                          })}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.stalls.map((stall: any, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-[32px] space-y-4 relative group">
                            <button 
                              onClick={() => {
                                const newStalls = [...formData.stalls];
                                newStalls.splice(idx, 1);
                                setFormData({...formData, stalls: newStalls});
                              }}
                              className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MinusCircle size={20} />
                            </button>
                            <input 
                              type="text" 
                              value={stall.name}
                              onChange={(e) => {
                                const newStalls = [...formData.stalls] as any;
                                newStalls[idx].name = e.target.value;
                                setFormData({...formData, stalls: newStalls});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-sm outline-none"
                              placeholder="স্টলের ধরণ (উদা: হস্তশিল্প)"
                            />
                            <input 
                              type="text" 
                              value={stall.count}
                              onChange={(e) => {
                                const newStalls = [...formData.stalls] as any;
                                newStalls[idx].count = e.target.value;
                                setFormData({...formData, stalls: newStalls});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-xs outline-none"
                              placeholder="সংখ্যা (উদা: ১০+)"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Food Manager */}
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900">জনপ্রিয় খাবার ও মূল্য</h3>
                        <button 
                          onClick={() => setFormData({
                            ...formData, 
                            food: [...formData.food, { name: '', price: '', shopName: '', imageUrl: '' }] as any
                          })}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.food.map((item: any, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 rounded-[32px] space-y-4 relative group">
                            <button 
                              onClick={() => {
                                const newFood = [...formData.food];
                                newFood.splice(idx, 1);
                                setFormData({...formData, food: newFood});
                              }}
                              className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MinusCircle size={20} />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text" 
                                value={item.name}
                                onChange={(e) => {
                                  const newFood = [...formData.food] as any;
                                  newFood[idx].name = e.target.value;
                                  setFormData({...formData, food: newFood});
                                }}
                                className="px-4 py-2 bg-white border-none rounded-xl font-bold text-sm outline-none"
                                placeholder="খাবারের নাম"
                              />
                              <input 
                                type="text" 
                                value={item.price}
                                onChange={(e) => {
                                  const newFood = [...formData.food] as any;
                                  newFood[idx].price = e.target.value;
                                  setFormData({...formData, food: newFood});
                                }}
                                className="px-4 py-2 bg-white border-none rounded-xl font-bold text-sm outline-none text-emerald-600"
                                placeholder="মূল্য (উদা: ৫০/-)"
                              />
                            </div>
                            <input 
                              type="text" 
                              value={item.shopName}
                              onChange={(e) => {
                                const newFood = [...formData.food] as any;
                                newFood[idx].shopName = e.target.value;
                                setFormData({...formData, food: newFood});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-xs outline-none"
                              placeholder="দোকানের নাম"
                            />
                            <input 
                              type="text" 
                              value={item.imageUrl}
                              onChange={(e) => {
                                const newFood = [...formData.food] as any;
                                newFood[idx].imageUrl = e.target.value;
                                setFormData({...formData, food: newFood});
                              }}
                              className="w-full px-4 py-2 bg-white border-none rounded-xl font-bold text-[10px] outline-none"
                              placeholder="ইমেজ URL"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === 'schedule' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900">অনুষ্ঠান সূচি</h3>
                      <button 
                        onClick={() => setFormData({
                          ...formData, 
                          events: [...formData.events, { time: '', eventName: '', type: 'সাংস্কৃতিক' }] as any
                        })}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        <PlusCircle size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.events.map((event: any, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-[32px] flex items-center gap-6 relative group">
                          <button 
                            onClick={() => {
                              const newEvents = [...formData.events];
                              newEvents.splice(idx, 1);
                              setFormData({...formData, events: newEvents});
                            }}
                            className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MinusCircle size={20} />
                          </button>
                          <input 
                            type="text" 
                            value={event.time}
                            onChange={(e) => {
                              const newEvents = [...formData.events] as any;
                              newEvents[idx].time = e.target.value;
                              setFormData({...formData, events: newEvents});
                            }}
                            className="w-32 px-4 py-2 bg-white border-none rounded-xl font-black text-xs outline-none text-indigo-600"
                            placeholder="১০:০০ AM"
                          />
                          <input 
                            type="text" 
                            value={event.eventName}
                            onChange={(e) => {
                              const newEvents = [...formData.events] as any;
                              newEvents[idx].eventName = e.target.value;
                              setFormData({...formData, events: newEvents});
                            }}
                            className="flex-1 px-4 py-2 bg-white border-none rounded-xl font-bold text-sm outline-none"
                            placeholder="অনুষ্ঠানের নাম"
                          />
                          <select 
                            value={event.type}
                            onChange={(e) => {
                              const newEvents = [...formData.events] as any;
                              newEvents[idx].type = e.target.value;
                              setFormData({...formData, events: newEvents});
                            }}
                            className="px-4 py-2 bg-white border-none rounded-xl font-black text-[10px] outline-none"
                          >
                            <option value="সাংস্কৃতিক">সাংস্কৃতিক</option>
                            <option value="প্রতিযোগিতা">প্রতিযোগিতা</option>
                            <option value="আনুষ্ঠানিক">আনুষ্ঠানিক</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeFormTab === 'location' && (
                  <div className="space-y-12">
                    {/* Location Manager */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className="font-black text-slate-900">ম্যাপ ও লোকেশন</h3>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">বিস্তারিত ঠিকানা</label>
                          <textarea 
                            rows={2}
                            value={formData.location.address}
                            onChange={(e) => setFormData({
                              ...formData, 
                              location: { ...formData.location, address: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none resize-none"
                            placeholder="মেলার পূর্ণ ঠিকানা লিখুন"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ল্যাটিটিউড</label>
                            <input 
                              type="number" 
                              step="any"
                              value={formData.location.lat}
                              onChange={(e) => setFormData({
                                ...formData, 
                                location: { ...formData.location, lat: parseFloat(e.target.value) }
                              })}
                              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">লঙ্গিটিউড</label>
                            <input 
                              type="number" 
                              step="any"
                              value={formData.location.lng}
                              onChange={(e) => setFormData({
                                ...formData, 
                                location: { ...formData.location, lng: parseFloat(e.target.value) }
                              })}
                              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="font-black text-slate-900">যাতায়াত ও পার্কিং</h3>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">পার্কিং তথ্য</label>
                          <textarea 
                            rows={2}
                            value={formData.location.parkingInfo}
                            onChange={(e) => setFormData({
                              ...formData, 
                              location: { ...formData.location, parkingInfo: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none resize-none"
                            placeholder="পার্কিং ব্যবস্থা সম্পর্কে লিখুন"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">নিকটস্থ বাসস্ট্যান্ড</label>
                          <input 
                            type="text" 
                            value={formData.location.nearestBusStand}
                            onChange={(e) => setFormData({
                              ...formData, 
                              location: { ...formData.location, nearestBusStand: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none"
                            placeholder="নিকটস্থ বাসস্ট্যান্ডের নাম"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security Manager */}
                    <div className="space-y-6 pt-10 border-t border-slate-100">
                      <h3 className="font-black text-slate-900">নিরাপত্তা ও জরুরি সেবা</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">পুলিশ বুথ</label>
                          <input 
                            type="text" 
                            value={formData.security.policeBooth}
                            onChange={(e) => setFormData({
                              ...formData, 
                              security: { ...formData.security, policeBooth: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                            placeholder="পুলিশ বুথের অবস্থান"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">মেডিকেল ক্যাম্প</label>
                          <input 
                            type="text" 
                            value={formData.security.medicalCamp}
                            onChange={(e) => setFormData({
                              ...formData, 
                              security: { ...formData.security, medicalCamp: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                            placeholder="মেডিকেল ক্যাম্পের অবস্থান"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">হারানো-পাওয়া ডেস্ক</label>
                          <input 
                            type="text" 
                            value={formData.security.lostFoundDesk}
                            onChange={(e) => setFormData({
                              ...formData, 
                              security: { ...formData.security, lostFoundDesk: e.target.value }
                            })}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                            placeholder="ডেস্কের অবস্থান"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between shrink-0">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-colors"
                >
                  বাতিল করুন
                </button>
                <button 
                  onClick={handleSave}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <Save size={20} />
                  সংরক্ষণ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MelaManagement;

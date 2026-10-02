import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Tractor, Plus, Edit2, Trash2, Save, X, Loader2, Banknote, Bug, Store, Calendar, MapPin, Phone, Info } from 'lucide-react';

type AgriCategory = 'agri_loans' | 'agri_diseases' | 'agri_machinery' | 'agri_dealers' | 'agri_calendar';

interface AgriService {
    id: string;
    name: string;
    category: AgriCategory;
    type: string;
    location: string;
    area: 'sadar' | 'baneswar' | 'online' | 'others';
    owner: string;
    description: string;
    phone: string;
    createdAt: any;
}

export default function AgricultureManagement() {
    const [activeTab, setActiveTab] = useState<AgriCategory | 'all'>('all');
    const [services, setServices] = useState<AgriService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<AgriService>>({
        name: '',
        category: 'agri_loans',
        type: '',
        location: '',
        area: 'sadar',
        owner: '',
        description: '',
        phone: ''
    });

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "agri_services"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: AgriService[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as AgriService);
            });
            
            if (activeTab === 'all') {
                setServices(data);
            } else {
                setServices(data.filter(service => service.category === activeTab));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching services:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.phone?.trim()) {
            alert('নাম এবং ফোন নম্বর আবশ্যক');
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp(),
                ...(editingId ? {} : { createdAt: serverTimestamp() })
            };

            if (editingId) {
                await updateDoc(doc(db, "agri_services", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "agri_services"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving service:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: activeTab === 'all' ? 'agri_loans' : activeTab,
            type: '',
            location: '',
            area: 'sadar',
            owner: '',
            description: '',
            phone: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (service: AgriService) => {
        setFormData(service);
        setEditingId(service.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই তথ্যটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "agri_services", id));
            } catch (error) {
                console.error("Error deleting service:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Tractor className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">কৃষি সেবা ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">উপজেলার কৃষি সেবা ও তথ্য নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন সেবা যুক্ত করুন'}</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-[#121212] p-1 rounded-xl w-fit border border-gray-800">
                {[
                    { id: 'all', label: 'সব তথ্য', icon: Tractor },
                    { id: 'agri_loans', label: 'কৃষি ঋণ', icon: Banknote },
                    { id: 'agri_diseases', label: 'রোগবালাই', icon: Bug },
                    { id: 'agri_machinery', label: 'যন্ত্রপাতি', icon: Tractor },
                    { id: 'agri_dealers', label: 'ডিলার', icon: Store },
                    { id: 'agri_calendar', label: 'ক্যালেন্ডার', icon: Calendar }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                resetForm();
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-700 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-500" />
                        {editingId ? 'সেবা তথ্য আপডেট করুন' : 'নতুন সেবা যোগ করুন'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">সেবার নাম *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="যেমন: উপজেলা কৃষি অফিস"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ক্যাটাগরি *</label>
                            <select 
                                value={formData.category || ""}
                                onChange={(e) => setFormData({...formData, category: e.target.value as AgriCategory})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                            >
                                <option value="agri_loans">কৃষি ঋণ ও প্রণোদনা</option>
                                <option value="agri_diseases">রোগবালাই পরামর্শ</option>
                                <option value="agri_machinery">কৃষি যন্ত্রপাতি</option>
                                <option value="agri_dealers">সার ও বীজের ডিলার</option>
                                <option value="agri_calendar">ফসল ক্যালেন্ডার</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">এলাকা (Area)</label>
                            <select 
                                value={formData.area || ""}
                                onChange={(e) => setFormData({...formData, area: e.target.value as any})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                            >
                                <option value="sadar">পুঠিয়া সদর</option>
                                <option value="baneswar">বানেশ্বর</option>
                                <option value="online">অনলাইন সেবা</option>
                                <option value="others">অন্যান্য</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">দায়িত্বপ্রাপ্ত/মালিক</label>
                            <input 
                                type="text" 
                                value={formData.owner || ""}
                                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="ব্যক্তি বা প্রতিষ্ঠানের নাম"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ফোন নম্বর *</label>
                            <input 
                                type="text" 
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="০১৭১১-XXXXXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঠিকানা/লোকেশন</label>
                            <input 
                                type="text" 
                                value={formData.location || ""}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="ঠিকানা লিখুন"
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">বিবরণ (Description)</label>
                            <textarea 
                                value={formData.description || ""}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors h-24"
                                placeholder="সেবার বিবরণ লিখুন"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</>}
                        </button>
                        <button 
                            onClick={resetForm}
                            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                        >
                            বাতিল
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                        <p className="font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <Tractor className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো তথ্য পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন তথ্য যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <div key={service.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(service)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                                        <Tractor className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16">
                                        <h4 className="font-bold text-white text-lg truncate">{service.name}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{service.phone}</span>
                                            </div>
                                            {service.owner && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Info className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{service.owner}</span>
                                                </div>
                                            )}
                                            {service.location && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{service.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                {service.category.replace('agri_', '')}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                {service.area}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Stethoscope, Plus, Edit2, Trash2, Save, X, Loader2, Building2, Phone, MapPin, Clock, Ambulance } from 'lucide-react';

type ItemType = 'hospital' | 'doctor' | 'ambulance';

interface ManagementItem {
    id: string;
    name: string;
    type?: string;
    location?: string;
    time?: string;
    services?: string;
    phone: string;
    ambulancePhone?: string;
    emergencyPhone?: string;
    degree?: string;
    specialty?: string;
    institution?: string;
    chamber?: string;
    tab?: string;
    createdAt: any;
}

export default function HospitalManagement() {
    const [activeTab, setActiveTab] = useState<ItemType>('hospital');
    const [items, setItems] = useState<ManagementItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<ManagementItem>>({
        name: '',
        type: 'private',
        location: '',
        time: '',
        services: '',
        phone: '',
        ambulancePhone: '',
        emergencyPhone: '',
        degree: '',
        specialty: '',
        institution: '',
        chamber: '',
        tab: 'medicine'
    });

    useEffect(() => {
        setIsLoading(true);
        const collectionName = activeTab === 'hospital' ? 'hospitals' : activeTab === 'doctor' ? 'doctors' : 'ambulances';
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: ManagementItem[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as ManagementItem);
            });
            setItems(data);
            setIsLoading(false);
        }, (error) => {
            console.error(`Error fetching ${activeTab}:`, error);
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
            const collectionName = activeTab === 'hospital' ? 'hospitals' : activeTab === 'doctor' ? 'doctors' : 'ambulances';
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp(),
                ...(editingId ? {} : { createdAt: serverTimestamp() })
            };

            if (editingId) {
                await updateDoc(doc(db, collectionName, editingId), dataToSave);
            } else {
                await addDoc(collection(db, collectionName), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving item:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'private',
            location: '',
            time: '',
            services: '',
            phone: '',
            ambulancePhone: '',
            emergencyPhone: '',
            degree: '',
            specialty: '',
            institution: '',
            chamber: '',
            tab: 'medicine'
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (item: ManagementItem) => {
        setFormData(item);
        setEditingId(item.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এটি মুছে ফেলতে চান?')) {
            try {
                const collectionName = activeTab === 'hospital' ? 'hospitals' : activeTab === 'doctor' ? 'doctors' : 'ambulances';
                await deleteDoc(doc(db, collectionName, id));
            } catch (error) {
                console.error("Error deleting item:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">হাসপাতাল ও ডাক্তার ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">সিস্টেমের সকল স্বাস্থ্য সেবা নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন যুক্ত করুন'}</span>
                </button>
            </div>

            <div className="flex gap-2 mb-8 bg-[#121212] p-1 rounded-xl w-fit border border-gray-800">
                {(['hospital', 'doctor', 'ambulance'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            resetForm();
                        }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        {tab === 'hospital' ? 'হাসপাতাল' : tab === 'doctor' ? 'ডাক্তার' : 'অ্যাম্বুলেন্স'}
                    </button>
                ))}
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-700 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-500" />
                        {editingId ? 'তথ্য আপডেট করুন' : 'নতুন তথ্য যোগ করুন'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">নাম (Name) *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="নাম লিখুন"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ফোন নম্বর (Phone) *</label>
                            <input 
                                type="text" 
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="০১৭১১-XXXXXX"
                            />
                        </div>

                        {activeTab === 'hospital' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">ক্যাটাগরি / প্রতিষ্ঠানের ধরন</label>
                                    <select 
                                        value={formData.type || ""}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="সরকারি হাসপাতাল">🏛️ সরকারি হাসপাতাল</option>
                                        <option value="বেসরকারি হাসপাতাল">🏥 বেসরকারি হাসপাতাল</option>
                                        <option value="ক্লিনিক">🩺 ক্লিনিক</option>
                                        <option value="মাতৃ ও শিশু হাসপাতাল">🤱 মাতৃ ও শিশু হাসপাতাল</option>
                                        <option value="জেনারেল হাসপাতাল">🏨 জেনারেল হাসপাতাল</option>
                                        <option value="বিশেষায়িত হাসপাতাল">⚕️ বিশেষায়িত হাসপাতাল</option>
                                        <option value="ডেন্টাল হাসপাতাল/ক্লিনিক">🦷 ডেন্টাল হাসপাতাল/ক্লিনিক</option>
                                        <option value="চক্ষু হাসপাতাল/ক্লিনিক">👁️ চক্ষু হাসপাতাল/ক্লিনিক</option>
                                        <option value="কমিউনিটি ক্লিনিক">🏡 কমিউনিটি ক্লিনিক</option>
                                        <option value="অন্যান্য">❓ অন্যান্য</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">অবস্থান (Location)</label>
                                    <input 
                                        type="text" 
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="ঠিকানা লিখুন"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">সময়সূচী (Time)</label>
                                    <input 
                                        type="text" 
                                        value={formData.time || ""}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="যেমন: ২৪ ঘণ্টা খোলা"
                                    />
                                </div>
                                <div className="lg:col-span-3 space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">সেবা (Services)</label>
                                    <textarea 
                                        value={formData.services || ""}
                                        onChange={(e) => setFormData({...formData, services: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors h-24"
                                        placeholder="সেবার বিবরণ লিখুন"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'doctor' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">ক্যাটাগরি (Category)</label>
                                    <select 
                                        value={formData.tab || ""}
                                        onChange={(e) => setFormData({...formData, tab: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                    >
                                        <option value="medicine">মেডিসিন ও হৃদরোগ</option>
                                        <option value="gynecology">গাইনি ও স্ত্রী রোগ</option>
                                        <option value="pediatrics">নবজাতক ও শিশু বিশেষজ্ঞ</option>
                                        <option value="orthopedics">হাড়জোড় ও অর্থোপেডিক্স</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">ডিগ্রী (Degree)</label>
                                    <input 
                                        type="text" 
                                        value={formData.degree || ""}
                                        onChange={(e) => setFormData({...formData, degree: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="MBBS, MD..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">বিশেষজ্ঞতা (Specialty)</label>
                                    <input 
                                        type="text" 
                                        value={formData.specialty || ""}
                                        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="যেমন: হৃদরোগ বিশেষজ্ঞ"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">চেম্বার (Chamber)</label>
                                    <input 
                                        type="text" 
                                        value={formData.chamber || ""}
                                        onChange={(e) => setFormData({...formData, chamber: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="চেম্বারের ঠিকানা"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">সময়সূচী (Time)</label>
                                    <input 
                                        type="text" 
                                        value={formData.time || ""}
                                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="বিকেল ৪টা - রাত ৮টা"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'ambulance' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঠিকানা (Location)</label>
                                    <input 
                                        type="text" 
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="ঠিকানা লিখুন"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্লাটফর্ম/মালিক</label>
                                    <input 
                                        type="text" 
                                        value={formData.institution || ""}
                                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                        placeholder="মালিক বা প্রতিষ্ঠানের নাম"
                                    />
                                </div>
                            </>
                        )}
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
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <Building2 className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো তথ্য পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন তথ্য যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                                        {activeTab === 'hospital' ? <Building2 className="w-6 h-6 text-emerald-500" /> : 
                                         activeTab === 'doctor' ? <Stethoscope className="w-6 h-6 text-blue-500" /> : 
                                         <Ambulance className="w-6 h-6 text-rose-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16">
                                        <h4 className="font-bold text-white text-lg truncate">{item.name}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{item.phone}</span>
                                            </div>
                                            {item.location && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{item.location}</span>
                                                </div>
                                            )}
                                            {item.time && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{item.time}</span>
                                                </div>
                                            )}
                                        </div>
                                        {activeTab === 'doctor' && item.specialty && (
                                            <p className="text-xs text-emerald-500 mt-2 font-bold bg-emerald-500/5 px-2 py-1 rounded-md w-fit">
                                                {item.specialty}
                                            </p>
                                        )}
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

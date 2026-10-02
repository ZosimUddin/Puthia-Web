import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Building, Plus, Edit2, Trash2, Save, X, Loader2, Briefcase, MapPin, Mail, Phone, Info } from 'lucide-react';

type OfficeType = 'upazila_admin' | 'law_order' | 'union_parishad' | 'others';

interface GovtOffice {
    id: string;
    name: string;
    type: OfficeType;
    headOfficer: string;
    location: string;
    email: string;
    phone: string;
    description: string;
    createdAt: any;
}

export default function GovtOfficeManagement() {
    const [activeTab, setActiveTab] = useState<OfficeType | 'all'>('all');
    const [offices, setOffices] = useState<GovtOffice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<GovtOffice>>({
        name: '',
        type: 'upazila_admin',
        headOfficer: '',
        location: '',
        email: '',
        phone: '',
        description: ''
    });

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "govt_offices"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: GovtOffice[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as GovtOffice);
            });
            
            if (activeTab === 'all') {
                setOffices(data);
            } else {
                setOffices(data.filter(office => office.type === activeTab));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching offices:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.phone?.trim()) {
            alert('অফিসের নাম এবং ফোন নম্বর আবশ্যক');
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
                await updateDoc(doc(db, "govt_offices", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "govt_offices"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving office:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'upazila_admin',
            headOfficer: '',
            location: '',
            email: '',
            phone: '',
            description: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (office: GovtOffice) => {
        setFormData(office);
        setEditingId(office.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই অফিসটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "govt_offices", id));
            } catch (error) {
                console.error("Error deleting office:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                        <Building className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">সরকারি অফিস ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">উপজেলার সকল সরকারি দপ্তর নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন অফিস'}</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-[#121212] p-1 rounded-xl w-fit border border-gray-800">
                {[
                    { id: 'all', label: 'সব অফিস' },
                    { id: 'upazila_admin', label: 'উপজেলা প্রশাসন' },
                    { id: 'law_order', label: 'আইন-শৃঙ্খলা' },
                    { id: 'union_parishad', label: 'ইউনিয়ন পরিষদ' },
                    { id: 'others', label: 'অন্যান্য' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            resetForm();
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-700 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-red-500" />
                        {editingId ? 'অফিস তথ্য আপডেট করুন' : 'নতুন অফিস যোগ করুন'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">অফিসের নাম *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="অফিসের নাম লিখুন"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">অফিসের ধরন *</label>
                            <select 
                                value={formData.type || ""}
                                onChange={(e) => setFormData({...formData, type: e.target.value as OfficeType})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                            >
                                <option value="upazila_admin">উপজেলা প্রশাসন</option>
                                <option value="law_order">আইন-শৃঙ্খলা</option>
                                <option value="union_parishad">ইউনিয়ন পরিষদ</option>
                                <option value="others">অন্যান্য</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রধান কর্মকর্তা</label>
                            <input 
                                type="text" 
                                value={formData.headOfficer || ""}
                                onChange={(e) => setFormData({...formData, headOfficer: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="কর্মকর্তার নাম ও পদবী"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ফোন নম্বর *</label>
                            <input 
                                type="text" 
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="০৭২২-XXXXXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ইমেইল</label>
                            <input 
                                type="email" 
                                value={formData.email || ""}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="example@gov.bd"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">অবস্থান (Location)</label>
                            <input 
                                type="text" 
                                value={formData.location || ""}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="অফিসের ঠিকানা"
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">বিবরণ (Description)</label>
                            <textarea 
                                value={formData.description || ""}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 transition-colors h-24"
                                placeholder="অফিসের কার্যক্রম সম্পর্কে সংক্ষেপে লিখুন"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
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
                        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                        <p className="font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : offices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <Building className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো অফিস পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন অফিস যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offices.map((office) => (
                            <div key={office.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(office)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(office.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                                        <Building className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16">
                                        <h4 className="font-bold text-white text-lg truncate">{office.name}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{office.phone}</span>
                                            </div>
                                            {office.headOfficer && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{office.headOfficer}</span>
                                                </div>
                                            )}
                                            {office.location && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[150px]">{office.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        {office.email && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                                                <Mail className="w-3 h-3" />
                                                <span>{office.email}</span>
                                            </div>
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

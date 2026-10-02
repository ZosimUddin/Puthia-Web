import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, Plus, Edit2, Trash2, Save, X, Loader2, School, BookOpen, Library, MapPin, Phone, History, Info } from 'lucide-react';

type EduType = 'school' | 'college' | 'madrasha' | 'coaching' | 'library';

interface EduInstitution {
    id: string;
    name: string;
    type: EduType;
    village: string;
    location: string;
    established: string;
    desc: string;
    phone: string;
    mapLink?: string;
    createdAt: any;
}

export default function EducationManagement() {
    const [activeTab, setActiveTab] = useState<EduType>('school');
    const [institutions, setInstitutions] = useState<EduInstitution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<EduInstitution>>({
        name: '',
        type: 'school',
        village: '',
        location: '',
        established: '',
        desc: '',
        phone: '',
        mapLink: ''
    });

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "educational_institutions"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: EduInstitution[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as EduInstitution);
            });
            setInstitutions(data.filter(inst => inst.type === activeTab));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching institutions:", error);
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
                type: activeTab,
                updatedAt: serverTimestamp(),
                ...(editingId ? {} : { createdAt: serverTimestamp() })
            };

            if (editingId) {
                await updateDoc(doc(db, "educational_institutions", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "educational_institutions"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving institution:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: activeTab,
            village: '',
            location: '',
            established: '',
            desc: '',
            phone: '',
            mapLink: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (inst: EduInstitution) => {
        setFormData(inst);
        setEditingId(inst.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই প্রতিষ্ঠানটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "educational_institutions", id));
            } catch (error) {
                console.error("Error deleting institution:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">শিক্ষা প্রতিষ্ঠান ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">উপজেলার সকল শিক্ষা প্রতিষ্ঠান নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন প্রতিষ্ঠান'}</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-[#121212] p-1 rounded-xl w-fit border border-gray-800">
                {[
                    { id: 'school', label: 'স্কুল', icon: School },
                    { id: 'college', label: 'কলেজ', icon: GraduationCap },
                    { id: 'madrasha', label: 'মাদ্রাসা', icon: BookOpen },
                    { id: 'coaching', label: 'কোচিং', icon: Info },
                    { id: 'library', label: 'লাইব্রেরি', icon: Library }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as EduType);
                                resetForm();
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
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
                        <Plus className="w-4 h-4 text-blue-500" />
                        {editingId ? 'প্রতিষ্ঠান তথ্য আপডেট করুন' : 'নতুন প্রতিষ্ঠান যোগ করুন'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রতিষ্ঠানের নাম *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="নাম লিখুন"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">গ্রাম/এলাকা</label>
                            <input 
                                type="text" 
                                value={formData.village || ""}
                                onChange={(e) => setFormData({...formData, village: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="গ্রামের নাম"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ফোন নম্বর *</label>
                            <input 
                                type="text" 
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="০১৭১১-XXXXXX"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রতিষ্ঠিত সাল</label>
                            <input 
                                type="text" 
                                value={formData.established || ""}
                                onChange={(e) => setFormData({...formData, established: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="যেমন: ১৯১০"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঠিকানা (Location)</label>
                            <input 
                                type="text" 
                                value={formData.location || ""}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="পুরো ঠিকানা"
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">বিবরণ (Description)</label>
                            <textarea 
                                value={formData.desc || ""}
                                onChange={(e) => setFormData({...formData, desc: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors h-24"
                                placeholder="প্রতিষ্ঠানের সংক্ষিপ্ত ইতিহাস বা বিবরণ"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
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
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : institutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <School className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো প্রতিষ্ঠান পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন তথ্য যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {institutions.map((inst) => (
                            <div key={inst.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(inst)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(inst.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16">
                                        <h4 className="font-bold text-white text-lg truncate">{inst.name}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{inst.phone}</span>
                                            </div>
                                            {inst.village && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{inst.village}</span>
                                                </div>
                                            )}
                                            {inst.established && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <History className="w-3.5 h-3.5" />
                                                    <span>স্থাপিত: {inst.established}</span>
                                                </div>
                                            )}
                                        </div>
                                        {inst.desc && (
                                            <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                                                {inst.desc}
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

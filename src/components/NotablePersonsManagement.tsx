import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Award, Plus, Edit2, Trash2, Save, X, Loader2, User, BookOpen, Trophy, Briefcase, Info, Star } from 'lucide-react';

type PersonCategory = 'notable_freedom_fighters' | 'notable_academicians' | 'notable_sports' | 'notable_entrepreneurs';

interface NotablePerson {
    id: string;
    name: string;
    category: PersonCategory;
    title: string;
    achievement: string;
    bio: string;
    imageUrl?: string;
    createdAt: any;
}

export default function NotablePersonsManagement() {
    const [persons, setPersons] = useState<NotablePerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<PersonCategory | 'all'>('all');

    const [formData, setFormData] = useState<Partial<NotablePerson>>({
        name: '',
        category: 'notable_freedom_fighters',
        title: '',
        achievement: '',
        bio: '',
        imageUrl: ''
    });

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "notable_persons"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: NotablePerson[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as NotablePerson);
            });
            
            if (activeTab === 'all') {
                setPersons(data);
            } else {
                setPersons(data.filter(p => p.category === activeTab));
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching persons:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    const handleSave = async () => {
        if (!formData.name?.trim() || !formData.title?.trim()) {
            alert('নাম এবং পদবী/উপাধি আবশ্যক');
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
                await updateDoc(doc(db, "notable_persons", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "notable_persons"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving person:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: activeTab === 'all' ? 'notable_freedom_fighters' : activeTab,
            title: '',
            achievement: '',
            bio: '',
            imageUrl: ''
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (person: NotablePerson) => {
        setFormData(person);
        setEditingId(person.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই গুণীজনের তথ্য মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "notable_persons", id));
            } catch (error) {
                console.error("Error deleting person:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">গুণীজন ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">উপজেলার গুণী ব্যক্তিত্বদের তথ্য নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-amber-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন গুণীজন'}</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-[#121212] p-1 rounded-xl w-fit border border-gray-800">
                {[
                    { id: 'all', label: 'সব তথ্য', icon: Award },
                    { id: 'notable_freedom_fighters', label: 'মুক্তিযোদ্ধা', icon: Star },
                    { id: 'notable_academicians', label: 'শিক্ষাবিদ', icon: BookOpen },
                    { id: 'notable_sports', label: 'ক্রীড়াবিদ', icon: Trophy },
                    { id: 'notable_entrepreneurs', label: 'উদ্যোক্তা', icon: Briefcase }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                resetForm();
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
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
                        <Plus className="w-4 h-4 text-amber-500" />
                        {editingId ? 'তথ্য আপডেট করুন' : 'নতুন গুণীজন যোগ করুন'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">নাম (Name) *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="নাম লিখুন"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ক্যাটাগরি *</label>
                            <select 
                                value={formData.category || ""}
                                onChange={(e) => setFormData({...formData, category: e.target.value as PersonCategory})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                            >
                                <option value="notable_freedom_fighters">বীর মুক্তিযোদ্ধা</option>
                                <option value="notable_academicians">প্রখ্যাত শিক্ষাবিদ</option>
                                <option value="notable_sports">কৃতী ক্রীড়াবিদ</option>
                                <option value="notable_entrepreneurs">সফল উদ্যোক্তা</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">পদবী/উপাধি *</label>
                            <input 
                                type="text" 
                                value={formData.title || ""}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="যেমন: বিশিষ্ট শিক্ষাবিদ"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রধান অর্জন (Achievement)</label>
                            <input 
                                type="text" 
                                value={formData.achievement || ""}
                                onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="যেমন: একুশে পদকপ্রাপ্ত"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ছবির লিঙ্ক (Optional)</label>
                            <input 
                                type="text" 
                                value={formData.imageUrl || ""}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                        <div className="lg:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">সংক্ষিপ্ত জীবনী (Bio)</label>
                            <textarea 
                                value={formData.bio || ""}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors h-32"
                                placeholder="ব্যক্তিত্বের সংক্ষিপ্ত জীবনী বা অবদান সম্পর্কে লিখুন"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20"
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
                        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                        <p className="font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : persons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <User className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো তথ্য পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন তথ্য যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {persons.map((person) => (
                            <div key={person.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-amber-500/30 transition-all group relative overflow-hidden flex gap-4">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(person)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(person.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden">
                                    {person.imageUrl ? (
                                        <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User className="w-8 h-8 text-amber-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <h4 className="font-bold text-white text-lg truncate">{person.name}</h4>
                                    <p className="text-xs text-amber-500 font-bold mt-0.5">{person.title}</p>
                                    {person.achievement && (
                                        <p className="text-[10px] text-gray-500 mt-1 italic">
                                            {person.achievement}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            {person.category.split('_')[1] || person.category}
                                        </span>
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

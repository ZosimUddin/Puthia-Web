import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Category {
  id: string;
  name: string;
  iconUrl: string;
  order: number;
}

export default function ContentCategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        iconFile: null as File | null,
        iconUrl: '',
        order: 0
    });

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "categories"), orderBy("order", "asc"));
            const snap = await getDocs(q);
            const data: Category[] = [];
            snap.forEach(d => {
                data.push({ id: d.id, ...d.data() } as Category);
            });
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, iconFile: e.target.files![0] }));
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('ক্যাটাগরির নাম দিন');
            return;
        }

        setIsSaving(true);
        try {
            let iconUrl = formData.iconUrl;

            if (formData.iconFile) {
                const storageRef = ref(storage, `categories/${Date.now()}_${formData.iconFile.name}`);
                const snapshot = await uploadBytes(storageRef, formData.iconFile);
                iconUrl = await getDownloadURL(snapshot.ref);
            } else if (!iconUrl) {
                // If no file and no existing url, set a default placeholder
                iconUrl = 'https://firebasestorage.googleapis.com/v0/b/aistudio-456c2b36.appspot.com/o/placeholder-icon.png?alt=media'; // fallback
            }

            const categoryData = {
                name: formData.name,
                iconUrl,
                order: formData.order || categories.length + 1
            };

            if (editingId) {
                await updateDoc(doc(db, "categories", editingId), categoryData);
            } else {
                await addDoc(collection(db, "categories"), categoryData);
            }

            setFormData({ name: '', iconFile: null, iconUrl: '', order: 0 });
            setEditingId(null);
            setIsAdding(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setFormData({
            name: cat.name,
            iconFile: null,
            iconUrl: cat.iconUrl,
            order: cat.order
        });
        setEditingId(cat.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই ক্যাটাগরিটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "categories", id));
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-emerald-500" />
                    <span>ক্যাটাগরি ম্যানেজমেন্ট (Category Management)</span>
                </h3>
                <button 
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setFormData({ name: '', iconFile: null, iconUrl: '', order: 0 });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isAdding ? 'বাতিল করুন' : 'নতুন ক্যাটাগরি'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-5 rounded-xl border border-gray-700 mb-6">
                    <h4 className="font-bold text-white mb-4">{editingId ? 'ক্যাটাগরি আপডেট করুন' : 'নতুন ক্যাটাগরি তৈরি করুন'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ক্যাটাগরির নাম *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder="যেমন: শিক্ষা প্রতিষ্ঠান"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ক্রম (Order)</label>
                            <input 
                                type="number" 
                                value={formData.order || ""}
                                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">আইকন (Icon Upload)</label>
                            <div className="flex items-center gap-4">
                                {formData.iconUrl && !formData.iconFile && (
                                    <img src={formData.iconUrl} alt="Icon Preview" className="w-12 h-12 rounded object-cover bg-gray-800" />
                                )}
                                {formData.iconFile && (
                                    <div className="w-12 h-12 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                                        <ImageIcon className="w-6 h-6 text-emerald-500" />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">1:1 অনুপাতের PNG বা SVG ছবি আপলোড করুন</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors mt-6"
                    >
                        {isSaving ? 'সংরক্ষণ হচ্ছে...' : <><Save className="w-4 h-4" /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</>}
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                    <Layers className="w-12 h-12 mb-4 opacity-20" />
                    <p>কোনো ক্যাটাগরি পাওয়া যায়নি</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-[#121212] p-4 rounded-xl border border-gray-800 flex items-center gap-4 group hover:border-emerald-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center p-2">
                                {cat.iconUrl ? (
                                    <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Layers className="w-6 h-6 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white truncate">{cat.name}</h4>
                                <p className="text-xs text-gray-500">ক্রম: {cat.order}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleEdit(cat)}
                                    className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
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
}

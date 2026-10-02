import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Info, Save, Loader2, Map, History, Users, Globe, Edit2, X } from 'lucide-react';
import { upazilaIntroData as initialData } from '../data/upazilaIntroData';

export default function UpazilaInfoManagement() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    
    // State for local editing
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);
        // We'll use a single document for all intro info
        const docRef = doc(db, "settings", "upazila_intro");
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data());
            } else {
                // If not in DB yet, use local initial data
                setData(initialData);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async (sectionKey: string) => {
        setIsSaving(true);
        try {
            const docRef = doc(db, "settings", "upazila_intro");
            const updatedData = {
                ...data,
                [sectionKey]: editData,
                updatedAt: serverTimestamp()
            };
            
            await updateDoc(docRef, updatedData).catch(async (err) => {
                // Handle case where document doesn't exist yet
                if (err.code === 'not-found') {
                    const { setDoc } = await import('firebase/firestore');
                    await setDoc(docRef, updatedData);
                } else {
                    throw err;
                }
            });

            setEditingSection(null);
            setEditData(null);
        } catch (error) {
            console.error("Error saving upazila info:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const startEditing = (key: string) => {
        setEditingSection(key);
        setEditData(JSON.parse(JSON.stringify(data[key])));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="font-medium">তথ্য লোড হচ্ছে...</p>
            </div>
        );
    }

    const sections = [
        { key: 'about', label: 'পুঠিয়া সম্পর্কে', icon: Info },
        { key: 'history', label: 'ঐতিহাসিক পটভূমি', icon: History },
        { key: 'geo', label: 'ভৌগোলিক অবস্থান', icon: Map },
        { key: 'population', label: 'জনসংখ্যা ও পরিসংখ্যান', icon: Users }
    ];

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <Globe className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">উপজেলা পরিচিতি ম্যানেজমেন্ট</h3>
                    <p className="text-sm text-gray-500 tracking-wide">পুঠিয়া উপজেলার মূল পরিচিতি তথ্য নিয়ন্ত্রণ করুন</p>
                </div>
            </div>

            <div className="space-y-6">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isEditing = editingSection === section.key;
                    const sectionData = isEditing ? editData : data[section.key];

                    return (
                        <div key={section.key} className="bg-[#121212] rounded-2xl border border-gray-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gray-800 text-blue-400">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-white text-lg">{section.label}</h4>
                                </div>
                                {!isEditing && (
                                    <button 
                                        onClick={() => startEditing(section.key)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-sm font-bold"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        এডিট করুন
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">শিরোনাম (Title)</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editData.title || ""}
                                                onChange={(e) => setEditData({...editData, title: e.target.value})}
                                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        ) : (
                                            <p className="text-white text-sm font-medium">{sectionData.title}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ব্যাজ (Badge)</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editData.badge || ""}
                                                onChange={(e) => setEditData({...editData, badge: e.target.value})}
                                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        ) : (
                                            <p className="text-white text-sm font-medium">{sectionData.badge}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">উপ-শিরোনাম (Subtitle)</label>
                                    {isEditing ? (
                                        <textarea 
                                            value={editData.subtitle || ""}
                                            onChange={(e) => setEditData({...editData, subtitle: e.target.value})}
                                            className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm h-20"
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm leading-relaxed">{sectionData.subtitle}</p>
                                    )}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-gray-800">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">সাব-আইটেম (Sub Items)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {sectionData.subItems.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-[#1E1E1E] p-3 rounded-xl border border-gray-800">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.icon || ""}
                                                                onChange={(e) => {
                                                                    const newSubItems = [...editData.subItems];
                                                                    newSubItems[idx].icon = e.target.value;
                                                                    setEditData({...editData, subItems: newSubItems});
                                                                }}
                                                                className="w-12 bg-black/20 border border-gray-700 text-white text-center rounded-lg py-1"
                                                                placeholder="Icon"
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={item.label || ""}
                                                                onChange={(e) => {
                                                                    const newSubItems = [...editData.subItems];
                                                                    newSubItems[idx].label = e.target.value;
                                                                    setEditData({...editData, subItems: newSubItems});
                                                                }}
                                                                className="flex-1 bg-black/20 border border-gray-700 text-white px-2 py-1 rounded-lg text-sm"
                                                                placeholder="Label"
                                                            />
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={item.detail || ""}
                                                            onChange={(e) => {
                                                                const newSubItems = [...editData.subItems];
                                                                newSubItems[idx].detail = e.target.value;
                                                                setEditData({...editData, subItems: newSubItems});
                                                            }}
                                                            className="w-full bg-black/20 border border-gray-700 text-white px-2 py-1 rounded-lg text-xs"
                                                            placeholder="Detail"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{item.icon}</span>
                                                        <div>
                                                            <p className="text-white text-xs font-bold">{item.label}</p>
                                                            <p className="text-gray-500 text-[10px]">{item.detail}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2 pt-4">
                                        <button 
                                            onClick={() => handleSave(section.key)}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            সেভ করুন
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditingSection(null);
                                                setEditData(null);
                                            }}
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

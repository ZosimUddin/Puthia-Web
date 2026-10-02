import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Building2, Plus, Edit2, Trash2, Save, X, Loader2, Phone, MapPin, Info } from 'lucide-react';

interface NGO {
    id: string;
    banglaName: string;
    englishName: string;
    phone: string;
    established: string;
    address: string;
    description: string;
    loans: string[];
    training: string[];
    social: string[];
    createdAt: any;
}

export default function NgoManagement() {
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<NGO>>({
        banglaName: '',
        englishName: '',
        phone: '',
        established: '',
        address: '',
        description: '',
        loans: [],
        training: [],
        social: []
    });

    // Helper states for list inputs
    const [loanInput, setLoanInput] = useState('');
    const [trainingInput, setTrainingInput] = useState('');
    const [socialInput, setSocialInput] = useState('');

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "local_ngos"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: NGO[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as NGO);
            });
            setNgos(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching NGOs:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!formData.banglaName?.trim() || !formData.phone?.trim()) {
            alert('এনজিওর নাম এবং ফোন নম্বর আবশ্যক');
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
                await updateDoc(doc(db, "local_ngos", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "local_ngos"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving NGO:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            banglaName: '',
            englishName: '',
            phone: '',
            established: '',
            address: '',
            description: '',
            loans: [],
            training: [],
            social: []
        });
        setLoanInput('');
        setTrainingInput('');
        setSocialInput('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (ngo: NGO) => {
        setFormData(ngo);
        setLoanInput(ngo.loans?.join(', ') || '');
        setTrainingInput(ngo.training?.join(', ') || '');
        setSocialInput(ngo.social?.join(', ') || '');
        setEditingId(ngo.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই এনজিওর তথ্য মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "local_ngos", id));
            } catch (error) {
                console.error("Error deleting NGO:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    const handleListUpdate = (type: 'loans' | 'training' | 'social', value: string) => {
        const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
        setFormData({ ...formData, [type]: items });
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">এনজিও ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">স্থানীয় এনজিওের তথ্য নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন এনজিও'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-700 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-500" />
                        {editingId ? 'এনজিও তথ্য আপডেট করুন' : 'নতুন এনজিও যোগ করুন'}
                    </h4>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">এনজিওর নাম (বাংলা) *</label>
                                <input 
                                    type="text" 
                                    value={formData.banglaName || ""}
                                    onChange={(e) => setFormData({...formData, banglaName: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="উদাঃ ব্র্যাক"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">এনজিওর নাম (ইংরেজি)</label>
                                <input 
                                    type="text" 
                                    value={formData.englishName || ""}
                                    onChange={(e) => setFormData({...formData, englishName: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. BRAC"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">ফোন নম্বর *</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.phone || ""}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                        placeholder="017XXXXXXXX"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রতিষ্ঠাকাল</label>
                                <input 
                                    type="text" 
                                    value={formData.established || ""}
                                    onChange={(e) => setFormData({...formData, established: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="উদাঃ ১৯৭২"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঠিকানা</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="পুঠিয়া উপজেলা সদর"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">বিবরণ</label>
                            <textarea 
                                value={formData.description || ""}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors h-24"
                                placeholder="এনজিও সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঋণ কর্মসূচি (কমা দিয়ে লিখুন)</label>
                                <textarea 
                                    value={loanInput || ""}
                                    onChange={(e) => {
                                        setLoanInput(e.target.value);
                                        handleListUpdate('loans', e.target.value);
                                    }}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors h-24"
                                    placeholder="উদাঃ দাবি ক্ষুদ্র ঋণ, প্রগতি লোন"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">প্রশিক্ষণ (কমা দিয়ে লিখুন)</label>
                                <textarea 
                                    value={trainingInput || ""}
                                    onChange={(e) => {
                                        setTrainingInput(e.target.value);
                                        handleListUpdate('training', e.target.value);
                                    }}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors h-24"
                                    placeholder="উদাঃ সেলাই প্রশিক্ষণ, কম্পিউটার প্রশিক্ষণ"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">সামাজিক সেবা (কমা দিয়ে লিখুন)</label>
                                <textarea 
                                    value={socialInput || ""}
                                    onChange={(e) => {
                                        setSocialInput(e.target.value);
                                        handleListUpdate('social', e.target.value);
                                    }}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors h-24"
                                    placeholder="উদাঃ বৃক্ষরোপণ, ত্রাণ বিতরণ"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
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
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                        <p className="font-medium">তথ্য লোড হচ্ছে...</p>
                    </div>
                ) : ngos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <Building2 className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো এনজিও তথ্য পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন এনজিও যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ngos.map((ngo) => (
                            <div key={ngo.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all group relative overflow-hidden flex gap-4">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(ngo)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(ngo.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <h4 className="font-bold text-white text-lg truncate">{ngo.banglaName}</h4>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {ngo.address}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {ngo.phone}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                            {ngo.established || 'N/A'}
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

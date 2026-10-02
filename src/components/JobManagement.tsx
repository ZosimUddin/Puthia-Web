import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Briefcase, Plus, Edit2, Trash2, Save, X, Loader2, Phone, MapPin, Building2, Calendar, DollarSign, GraduationCap } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: "full" | "part";
    qualification: string;
    experience: string;
    deadline: string;
    contactPerson: string;
    phone: string;
    description: string;
    responsibilities: string[];
    createdAt: any;
}

export default function JobManagement() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<Job>>({
        title: '',
        company: '',
        location: '',
        salary: '',
        type: 'full',
        qualification: '',
        experience: '',
        deadline: '',
        contactPerson: '',
        phone: '',
        description: '',
        responsibilities: []
    });

    const [respInput, setRespInput] = useState('');

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "local_jobs"), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Job[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() } as Job);
            });
            setJobs(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!formData.title?.trim() || !formData.company?.trim() || !formData.phone?.trim()) {
            alert('টাইটেল, কোম্পানি এবং ফোন নম্বর আবশ্যক');
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
                await updateDoc(doc(db, "local_jobs", editingId), dataToSave);
            } else {
                await addDoc(collection(db, "local_jobs"), dataToSave);
            }

            resetForm();
        } catch (error) {
            console.error("Error saving job:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            salary: '',
            type: 'full',
            qualification: '',
            experience: '',
            deadline: '',
            contactPerson: '',
            phone: '',
            description: '',
            responsibilities: []
        });
        setRespInput('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (job: Job) => {
        setFormData(job);
        setRespInput(job.responsibilities?.join('\n') || '');
        setEditingId(job.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই চাকরির বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "local_jobs", id));
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    const handleRespUpdate = (value: string) => {
        const items = value.split('\n').map(item => item.trim()).filter(item => item !== '');
        setFormData({ ...formData, responsibilities: items });
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">চাকরি ও কর্মসংস্থান ম্যানেজমেন্ট</h3>
                        <p className="text-sm text-gray-500 tracking-wide">স্থানীয় চাকরির বিজ্ঞপ্তিগুলো নিয়ন্ত্রণ করুন</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'বাতিল' : 'নতুন বিজ্ঞপ্তি'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-6 rounded-2xl border border-gray-700 mb-8 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-cyan-500" />
                        {editingId ? 'বিজ্ঞপ্তি আপডেট করুন' : 'নতুন বিজ্ঞপ্তি যোগ করুন'}
                    </h4>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">পদের নাম (Job Title) *</label>
                                <input 
                                    type="text" 
                                    value={formData.title || ""}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="উদাঃ সেলস এক্সিকিউটিভ"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">কোম্পানির নাম *</label>
                                <input 
                                    type="text" 
                                    value={formData.company || ""}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="প্রতিষ্ঠানের নাম লিখুন"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">কাজের ধরন</label>
                                <select 
                                    value={formData.type || ""}
                                    onChange={(e) => setFormData({...formData, type: e.target.value as "full" | "part"})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                >
                                    <option value="full">ফুল-টাইম (Full-time)</option>
                                    <option value="part">পার্ট-টাইম (Part-time)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">বেতন (Salary)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.salary || ""}
                                        onChange={(e) => setFormData({...formData, salary: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="১২,০০০ - ১৫,০০০"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">ঠিকানা/লোকেশন</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="পুঠিয়া বাজার, রাজশাহী"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">আবেদনের শেষ তারিখ</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.deadline || ""}
                                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="১৫ জুলাই, ২০২৬"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">শিক্ষাগত যোগ্যতা</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={formData.qualification || ""}
                                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="উদাঃ এইচএসসি পাস"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">অভিজ্ঞতা</label>
                                <input 
                                    type="text" 
                                    value={formData.experience || ""}
                                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="উদাঃ ১ বছরের অভিজ্ঞতা"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">যোগাযোগের ব্যক্তি</label>
                                <input 
                                    type="text" 
                                    value={formData.contactPerson || ""}
                                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="নাম লিখুন"
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
                                        className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                                        placeholder="017XXXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">কাজের বিবরণ</label>
                            <textarea 
                                value={formData.description || ""}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors h-24"
                                placeholder="সংক্ষিপ্ত বিবরণ লিখুন"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">দায়িত্ব (প্রতি লাইনে একটি)</label>
                            <textarea 
                                value={respInput || ""}
                                onChange={(e) => {
                                    setRespInput(e.target.value);
                                    handleRespUpdate(e.target.value);
                                }}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors h-32"
                                placeholder="কাজের দায়িত্বগুলো এখানে লিখুন..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
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
                        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
                        <p className="font-medium">বিজ্ঞপ্তি লোড হচ্ছে...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500">
                        <Briefcase className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">কোনো চাকরির বিজ্ঞপ্তি পাওয়া যায়নি</p>
                        <p className="text-sm">নতুন বিজ্ঞপ্তি যোগ করতে উপরের বাটনটি ব্যবহার করুন</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-[#121212] p-5 rounded-2xl border border-gray-800 hover:border-cyan-500/30 transition-all group relative overflow-hidden flex gap-4">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={() => handleEdit(job)}
                                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(job.id)}
                                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0 pr-12">
                                    <h4 className="font-bold text-white text-lg truncate">{job.title}</h4>
                                    <p className="text-xs text-cyan-500 font-bold mt-0.5">{job.company}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {job.location}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400">
                                            {job.type === 'full' ? 'ফুল-টাইম' : 'পার্ট-টাইম'}
                                        </span>
                                        <span className="text-[10px] text-rose-500 font-bold">
                                            Deadline: {job.deadline}
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

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, XCircle, Users, Save, X } from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface EventData {
    id: string;
    name: string;
    date: string;
    location: string;
    status: 'open' | 'closed';
    maxRegistrations: number;
    currentRegistrations: number;
}

export default function EventManagement() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        location: '',
        status: 'open' as 'open' | 'closed',
        maxRegistrations: 100
    });

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "events"), orderBy("date", "desc"));
            const snap = await getDocs(q);
            const data: EventData[] = [];
            snap.forEach(d => {
                data.push({ id: d.id, ...d.data() } as EventData);
            });
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.date.trim()) {
            alert('ইভেন্টের নাম এবং সময় আবশ্যক');
            return;
        }

        try {
            const eventData = {
                ...formData,
                currentRegistrations: 0 // initialize
            };

            if (editingId) {
                // Keep currentRegistrations same if editing
                const existing = events.find(e => e.id === editingId);
                await updateDoc(doc(db, "events", editingId), { ...formData, currentRegistrations: existing?.currentRegistrations || 0 });
            } else {
                await addDoc(collection(db, "events"), eventData);
            }

            setFormData({ name: '', date: '', location: '', status: 'open', maxRegistrations: 100 });
            setEditingId(null);
            setIsAdding(false);
            fetchEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        }
    };

    const handleEdit = (event: EventData) => {
        setFormData({
            name: event.name,
            date: event.date,
            location: event.location,
            status: event.status,
            maxRegistrations: event.maxRegistrations
        });
        setEditingId(event.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?')) {
            try {
                await deleteDoc(doc(db, "events", id));
                fetchEvents();
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("মুছে ফেলতে সমস্যা হয়েছে।");
            }
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-purple-500" />
                    <span>ইভেন্ট ম্যানেজমেন্ট (Event Management)</span>
                </h3>
                <button 
                    onClick={() => {
                        if (isAdding) {
                            setIsAdding(false);
                            setEditingId(null);
                            setFormData({ name: '', date: '', location: '', status: 'open', maxRegistrations: 100 });
                        } else {
                            setIsAdding(true);
                        }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${isAdding ? 'bg-gray-700 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isAdding ? 'বাতিল করুন' : 'নতুন ইভেন্ট'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#121212] p-5 rounded-xl border border-gray-700 mb-6">
                    <h4 className="font-bold text-white mb-4">{editingId ? 'ইভেন্ট আপডেট করুন' : 'নতুন ইভেন্ট তৈরি করুন'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ইভেন্টের নাম *</label>
                            <input 
                                type="text" 
                                value={formData.name || ""}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder="যেমন: বৈশাখী মেলা ২০২৭"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">সময় ও তারিখ *</label>
                            <input 
                                type="text" 
                                value={formData.date || ""}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder="যেমন: ১৪ এপ্রিল, সকাল ৯টা"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">স্থান</label>
                            <input 
                                type="text" 
                                value={formData.location || ""}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                placeholder="যেমন: পি.এন হাইস্কুল মাঠ"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">স্ট্যাটাস</label>
                                <select 
                                    value={formData.status || ""}
                                    onChange={(e) => setFormData({...formData, status: e.target.value as 'open' | 'closed'})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="open">ওপেন (Open)</option>
                                    <option value="closed">বন্ধ (Closed)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">সর্বোচ্চ সিট</label>
                                <input 
                                    type="number" 
                                    value={formData.maxRegistrations || ""}
                                    onChange={(e) => setFormData({...formData, maxRegistrations: parseInt(e.target.value) || 0})}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors mt-6"
                    >
                        <Save className="w-4 h-4" /> {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p>কোনো ইভেন্ট পাওয়া যায়নি</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#121212] text-gray-400">
                            <tr>
                                <th className="p-4 rounded-tl-xl font-medium">ইভেন্টের নাম</th>
                                <th className="p-4 font-medium">সময়</th>
                                <th className="p-4 font-medium">স্থান</th>
                                <th className="p-4 font-medium">Registration</th>
                                <th className="p-4 rounded-tr-xl font-medium">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-gray-800">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-[#1A1A1A] transition-colors">
                                    <td className="p-4 font-medium text-white">{event.name}</td>
                                    <td className="p-4">{event.date}</td>
                                    <td className="p-4">{event.location}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${event.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {event.status === 'open' ? 'Open' : 'Closed'}
                                            </span>
                                            <span className="text-gray-500 text-xs">({event.currentRegistrations || 0}/{event.maxRegistrations})</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(event)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(event.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

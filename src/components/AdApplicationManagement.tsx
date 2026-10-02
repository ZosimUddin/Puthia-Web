import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AdApplication, getAdApplications, updateAdApplicationStatus } from '../api';
import { Check, X, Clock, Loader2, Megaphone, Trash2, Edit } from 'lucide-react';

export default function AdApplicationManagement() {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
    const [applications, setApplications] = useState<AdApplication[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const q = collection(db, "ad_applications");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: AdApplication[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as AdApplication);
            });
            
            const filtered = data.filter(app => 
                activeTab === 'pending' ? app.status === 'pending' : app.status === 'approved'
            );
            setApplications(filtered);
            setIsLoading(false);
        }, (error) => {
            console.error('Failed to load apps:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        setUpdatingId(id);
        try {
            await updateAdApplicationStatus(id, status);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-orange-500" />
                    <span>বিজ্ঞাপন ম্যানেজমেন্ট (Advertisement List)</span>
                </h3>

                <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        অপেক্ষমান (Pending Ads)
                    </button>
                    <button 
                        onClick={() => setActiveTab('approved')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'approved' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        চলমান (Active)
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
            ) : applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                    <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                    <p>কোনো তথ্য পাওয়া যায়নি</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="bg-[#121212] p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-lg text-white mb-2">{app.businessName}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-400">
                                    <p><span className="text-gray-500">সময়সীমা:</span> {app.duration}</p>
                                    {activeTab === 'approved' && <p><span className="text-gray-500">Expiry Date:</span> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>}
                                    <p className="sm:col-span-2 text-emerald-400/80"><span className="text-gray-500">Payment Verification:</span> {app.paymentMethod} • Number: {app.senderNumber} • TxID: {app.txId}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {activeTab === 'pending' ? (
                                    <>
                                        <button onClick={() => handleStatusUpdate(app.id, 'approved')} disabled={updatingId === app.id} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg font-medium text-sm">
                                            {updatingId === app.id ? <Loader2 className="animate-spin w-4 h-4"/> : <Check className="w-4 h-4" />} অনুমোদন
                                        </button>
                                        <button onClick={() => handleStatusUpdate(app.id, 'rejected')} disabled={updatingId === app.id} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium text-sm">
                                            {updatingId === app.id ? <Loader2 className="animate-spin w-4 h-4"/> : <X className="w-4 h-4" />} বাতিল
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg font-medium text-sm">
                                            <Edit className="w-4 h-4" /> এডিট
                                        </button>
                                        <button onClick={() => handleStatusUpdate(app.id, 'rejected')} disabled={updatingId === app.id} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium text-sm">
                                            {updatingId === app.id ? <Loader2 className="animate-spin w-4 h-4"/> : <Trash2 className="w-4 h-4" />} ডিলিট
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

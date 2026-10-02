import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Users, Store, Megaphone, FileText, Download, Loader2 } from 'lucide-react';

export default function ReportManagement({ userProfile }: { userProfile: any }) {
    const [activeTab, setActiveTab] = useState<'business' | 'user' | 'ads'>('business');
    const [counts, setCounts] = useState({
        business: 0,
        user: 0,
        ads: 0,
        newBusiness: 0,
        newUser: 0,
        newAds: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const isStaff = userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'staff' || (userProfile?.permissions?.includes('ads'));

    useEffect(() => {
        setIsLoading(true);
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            setCounts(prev => ({ ...prev, user: snap.size }));
        });

        const unsubShops = onSnapshot(collection(db, "local_shops"), (snap) => {
            setCounts(prev => ({ ...prev, business: snap.size }));
        });

        let unsubAds = () => {};
        if (isStaff) {
            unsubAds = onSnapshot(collection(db, "ad_applications"), (snap) => {
                setCounts(prev => ({ ...prev, ads: snap.size }));
            });
        }

        setIsLoading(false);
        return () => {
            unsubUsers();
            unsubShops();
            unsubAds();
        };
    }, [isStaff]);

    const toBanglaNumber = (n: number) => {
        const banglaDigits: { [key: string]: string } = {
            '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
            '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
        };
        return n.toString().split('').map(d => banglaDigits[d] || d).join('');
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart className="w-6 h-6 text-emerald-500" />
                    <span>রিপোর্ট ও অ্যানালিটিক্স (Reports)</span>
                </h3>

                <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('business')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'business' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Store className="w-4 h-4 hidden sm:block" /> Business
                    </button>
                    <button 
                        onClick={() => setActiveTab('user')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'user' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4 hidden sm:block" /> User
                    </button>
                    <button 
                        onClick={() => setActiveTab('ads')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ads' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Megaphone className="w-4 h-4 hidden sm:block" /> Ads
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {activeTab === 'business' ? <Store className="w-24 h-24" /> : activeTab === 'user' ? <Users className="w-24 h-24" /> : <Megaphone className="w-24 h-24" />}
                            </div>
                            <p className="text-gray-400 font-medium mb-2">মোট সংখ্যা (Total)</p>
                            <h4 className="text-3xl font-black text-white">
                                {toBanglaNumber(counts[activeTab])}
                            </h4>
                            <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">+০% এই মাসে</p>
                        </div>
                        <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 relative overflow-hidden group">
                            <p className="text-gray-400 font-medium mb-2">নতুন যুক্ত (New This Month)</p>
                            <h4 className="text-3xl font-black text-white">
                                {toBanglaNumber(counts[`new${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof typeof counts])}
                            </h4>
                            <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">+০% বৃদ্ধি</p>
                        </div>
                        <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 relative overflow-hidden flex flex-col justify-center items-center group cursor-pointer hover:border-emerald-500/50 transition-colors">
                            <Download className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-white">ডাউনলোড পিডিএফ</span>
                            <span className="text-xs text-gray-500">সম্পূর্ণ রিপোর্ট (PDF)</span>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 h-64 flex flex-col items-center justify-center text-center">
                        <FileText className="w-12 h-12 text-gray-700 mb-4" />
                        <h4 className="text-lg font-bold text-gray-300 mb-2">বিস্তারিত চার্ট ও গ্রাফ</h4>
                        <p className="text-sm text-gray-500 max-w-sm">এই সেকশনে ডাটা ভিজ্যুয়ালাইজেশনের জন্য D3.js বা Recharts ব্যবহার করে ডায়নামিক গ্রাফ যুক্ত করা হবে।</p>
                    </div>
                </>
            )}
        </div>
    );
}


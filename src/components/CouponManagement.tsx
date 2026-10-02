import React, { useState } from 'react';
import { Tag, Plus, Copy, Trash2, Edit2, Search, CheckCircle } from 'lucide-react';

export default function CouponManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const coupons = [
        { id: 1, code: 'NEWUSER50', discount: '50৳', type: 'fixed', status: 'active', usage: '12/100', expiry: '31 Dec 2026' },
        { id: 2, code: 'EID20', discount: '20%', type: 'percentage', status: 'active', usage: '45/500', expiry: '15 Aug 2026' },
        { id: 3, code: 'FREEADS', discount: '100%', type: 'percentage', status: 'expired', usage: '50/50', expiry: '01 Jan 2026' },
    ];

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag className="w-6 h-6 text-fuchsia-500" />
                    <span>কুপন ম্যানেজমেন্ট (Coupons)</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="কুপন কোড খুঁজুন..."
                            value={searchQuery || ""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#121212] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-fuchsia-500 text-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> নতুন কুপন
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-[#121212] rounded-xl border border-gray-800 p-5 relative group overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-colors" />
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-black text-white tracking-wider bg-gray-800 px-3 py-1 rounded-md border border-gray-700">{coupon.code}</h4>
                                    <button className="text-gray-500 hover:text-white transition-colors" title="Copy Code">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-400">Discount: <span className="font-bold text-fuchsia-400">{coupon.discount}</span></p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {coupon.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                            <div className="bg-gray-800/50 p-2.5 rounded-lg border border-gray-700/50">
                                <p className="text-xs text-gray-500 mb-0.5">Usage</p>
                                <p className="text-sm font-bold text-gray-300">{coupon.usage}</p>
                            </div>
                            <div className="bg-gray-800/50 p-2.5 rounded-lg border border-gray-700/50">
                                <p className="text-xs text-gray-500 mb-0.5">Expires</p>
                                <p className="text-sm font-bold text-gray-300">{coupon.expiry}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Modal placeholder */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-6">নতুন কুপন যোগ করুন</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">কুপন কোড (Code)</label>
                                <input type="text" placeholder="e.g. SUMMER20" className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-fuchsia-500 uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">ডিসকাউন্টের ধরন</label>
                                    <select className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-fuchsia-500 appearance-none">
                                        <option>Percentage (%)</option>
                                        <option>Fixed Amount (৳)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">পরিমাণ</label>
                                    <input type="number" placeholder="20" className="w-full bg-[#121212] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-fuchsia-500" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors">বাতিল</button>
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-fuchsia-600 text-white rounded-xl font-bold hover:bg-fuchsia-700 transition-colors">সেভ করুন</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

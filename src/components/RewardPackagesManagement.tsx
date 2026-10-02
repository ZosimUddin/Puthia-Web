import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';

export default function RewardPackagesManagement() {
    const [packages] = useState([
        { id: 1, coins: 500, amount: 20, isPopular: false },
        { id: 2, coins: 1200, amount: 50, isPopular: true },
        { id: 3, coins: 2500, amount: 100, isPopular: false },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-500" />
                    <span>রিচার্জ প্যাকেজ</span>
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    নতুন প্যাকেজ
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6 relative">
                        {pkg.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                                Popular
                            </div>
                        )}
                        <div className="text-center mb-6">
                            <h4 className="text-3xl font-bold text-yellow-500 mb-1">{pkg.coins} <span className="text-base text-gray-400">Coins</span></h4>
                            <p className="text-emerald-500 font-medium">৳ {pkg.amount} রিচার্জ</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors text-sm font-medium">
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

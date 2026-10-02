import React, { useState } from 'react';
import { Coins, Search, Plus, Minus } from 'lucide-react';

export default function RewardCoinsManagement() {
    const [search, setSearch] = useState('');
    const [users] = useState([
        { id: 1, name: 'Rahim Uddin', phone: '01711223344', coins: 1250 },
        { id: 2, name: 'Karim Hasan', phone: '01811223344', coins: 840 },
        { id: 3, name: 'Abdul Jabbar', phone: '01911223344', coins: 450 },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Coins className="w-6 h-6 text-emerald-500" />
                <span>কয়েন ও ইস্টার ম্যানেজমেন্ট</span>
            </h3>
            
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ইউজার খুঁজুন (নাম বা নম্বর)..." 
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="py-4 px-4 font-medium">ইউজার নাম</th>
                            <th className="py-4 px-4 font-medium">মোবাইল নম্বর</th>
                            <th className="py-4 px-4 font-medium">বর্তমান কয়েন</th>
                            <th className="py-4 px-4 font-medium text-right">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-800/50 hover:bg-[#2A2A2A] transition-colors">
                                <td className="py-4 px-4 font-medium">{user.name}</td>
                                <td className="py-4 px-4">{user.phone}</td>
                                <td className="py-4 px-4 font-bold text-yellow-500">{user.coins}</td>
                                <td className="py-4 px-4 flex justify-end gap-2">
                                    <button className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Add Coins">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Deduct Coins">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { CheckCircle, Search } from 'lucide-react';

export default function RewardApprovalsManagement() {
    const [search, setSearch] = useState('');
    const [approvals] = useState([
        { id: '#REQ001', user: 'Rahim Uddin', phone: '01711223344', amount: 50, coins: 1200, operator: 'Grameenphone', date: '2023-10-25 10:30 AM', status: 'approved' },
        { id: '#REQ004', user: 'Sultana Begum', phone: '01811223344', amount: 20, coins: 500, operator: 'Robi', date: '2023-10-24 11:15 AM', status: 'rejected' },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <span>অনুমোদন/বাতিল লগ</span>
            </h3>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="রিকোয়েস্ট আইডি বা ইউজার খুঁজুন..." 
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="py-4 px-4 font-medium">রিকোয়েস্ট আইডি</th>
                            <th className="py-4 px-4 font-medium">ইউজার বিস্তারিত</th>
                            <th className="py-4 px-4 font-medium">প্যাকেজ</th>
                            <th className="py-4 px-4 font-medium">স্ট্যাটাস</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {approvals.map((req) => (
                            <tr key={req.id} className="border-b border-gray-800/50 hover:bg-[#2A2A2A] transition-colors">
                                <td className="py-4 px-4">
                                    <span className="font-medium text-white">{req.id}</span>
                                    <div className="text-xs text-gray-500 mt-1">{req.date}</div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="font-medium text-white">{req.user}</div>
                                    <div className="text-sm text-gray-400">{req.phone} ({req.operator})</div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="font-bold text-white">৳ {req.amount}</div>
                                    <div className="text-sm text-yellow-500">{req.coins} Coins</div>
                                </td>
                                <td className="py-4 px-4">
                                    {req.status === 'approved' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Approved
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Rejected
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { History, Download, Search } from 'lucide-react';

export default function RewardHistoryManagement() {
    const [search, setSearch] = useState('');
    const [history] = useState([
        { id: '#TRX881', user: 'Rahim Uddin', phone: '01711223344', amount: 50, date: '2023-10-25 10:30 AM', status: 'success' },
        { id: '#TRX882', user: 'Karim Hasan', phone: '01811223344', amount: 20, date: '2023-10-24 11:15 AM', status: 'success' },
        { id: '#TRX883', user: 'Abdul Jabbar', phone: '01911223344', amount: 100, date: '2023-10-23 01:45 PM', status: 'failed' },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-emerald-500" />
                    <span>রিচার্জ হিস্টোরি</span>
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] border border-gray-700 text-white rounded-lg transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ট্রানজেকশন আইডি বা ইউজার খুঁজুন..." 
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="py-4 px-4 font-medium">Trx ID</th>
                            <th className="py-4 px-4 font-medium">ইউজার নাম</th>
                            <th className="py-4 px-4 font-medium">মোবাইল নম্বর</th>
                            <th className="py-4 px-4 font-medium">পরিমাণ</th>
                            <th className="py-4 px-4 font-medium">তারিখ ও সময়</th>
                            <th className="py-4 px-4 font-medium">স্ট্যাটাস</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {history.map((item) => (
                            <tr key={item.id} className="border-b border-gray-800/50 hover:bg-[#2A2A2A] transition-colors">
                                <td className="py-4 px-4 font-medium">{item.id}</td>
                                <td className="py-4 px-4 text-emerald-400">{item.user}</td>
                                <td className="py-4 px-4">{item.phone}</td>
                                <td className="py-4 px-4 font-bold text-white">৳ {item.amount}</td>
                                <td className="py-4 px-4 text-sm">{item.date}</td>
                                <td className="py-4 px-4">
                                    {item.status === 'success' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Success
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Failed
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

import React, { useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentManagement() {
    const [activeTab, setActiveTab] = useState<'gateways' | 'history'>('gateways');

    const gateways = [
        { id: 'bkash', name: 'bKash', status: 'active', type: 'Mobile Banking', icon: '৳' },
        { id: 'nagad', name: 'Nagad', status: 'active', type: 'Mobile Banking', icon: '৳' },
        { id: 'rocket', name: 'Rocket', status: 'inactive', type: 'Mobile Banking', icon: '৳' },
        { id: 'sslcommerz', name: 'SSLCommerz', status: 'active', type: 'Payment Gateway', icon: '💳' },
    ];

    const history = [
        { id: 'TXN1029', date: '2023-10-27', user: 'Rahim Store', amount: '500', method: 'bKash', status: 'completed' },
        { id: 'TXN1030', date: '2023-10-27', user: 'Karim Pharmacy', amount: '1000', method: 'SSLCommerz', status: 'completed' },
        { id: 'TXN1031', date: '2023-10-28', user: 'Maa Telecom', amount: '500', method: 'Nagad', status: 'failed' },
        { id: 'TXN1032', date: '2023-10-28', user: 'Sultana Fashion', amount: '1500', method: 'bKash', status: 'pending' },
    ];

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-800 gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-indigo-500" />
                    <span>পেমেন্ট ও বিলিং (Payment Management)</span>
                </h3>

                <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
                    <button 
                        onClick={() => setActiveTab('gateways')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gateways' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        পেমেন্ট মেথড (Gateways)
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        লেনদেনের ইতিহাস (History)
                    </button>
                </div>
            </div>

            {activeTab === 'gateways' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {gateways.map(gateway => (
                        <div key={gateway.id} className="p-5 bg-[#121212] border border-gray-800 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-4xl">{gateway.icon}</span>
                            </div>
                            <h4 className="font-bold text-lg text-white mb-1">{gateway.name}</h4>
                            <p className="text-xs text-gray-500 mb-4">{gateway.type}</p>
                            
                            <div className="flex items-center justify-between mt-auto">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${gateway.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-400'}`}>
                                    {gateway.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <button className="text-indigo-400 text-sm hover:underline">Config</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#121212] text-gray-400">
                            <tr>
                                <th className="p-4 rounded-tl-xl font-medium">TrxID</th>
                                <th className="p-4 font-medium">তারিখ</th>
                                <th className="p-4 font-medium">ইউজার/ব্যবসা</th>
                                <th className="p-4 font-medium">পেমেন্ট মেথড</th>
                                <th className="p-4 font-medium">পরিমাণ</th>
                                <th className="p-4 rounded-tr-xl font-medium">স্ট্যাটাস</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-gray-800">
                            {history.map((txn) => (
                                <tr key={txn.id} className="hover:bg-[#1A1A1A] transition-colors">
                                    <td className="p-4 font-mono text-gray-400">{txn.id}</td>
                                    <td className="p-4">{txn.date}</td>
                                    <td className="p-4 font-medium text-white">{txn.user}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">{txn.method}</span>
                                    </td>
                                    <td className="p-4 font-bold text-white flex items-center gap-1">
                                        ৳ {txn.amount}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5">
                                            {txn.status === 'completed' && <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500">Completed</span></>}
                                            {txn.status === 'pending' && <><Clock className="w-4 h-4 text-amber-500" /> <span className="text-amber-500">Pending</span></>}
                                            {txn.status === 'failed' && <><XCircle className="w-4 h-4 text-rose-500" /> <span className="text-rose-500">Failed</span></>}
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

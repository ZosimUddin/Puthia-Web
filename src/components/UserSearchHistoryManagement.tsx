import React, { useState } from 'react';
import { History, Trash2 } from 'lucide-react';

export default function UserSearchHistoryManagement() {
    const [history] = useState([
        { id: 1, user: 'Rahim Uddin', query: 'Puthia Rajbari', date: '2023-10-25' },
        { id: 2, user: 'Karim Hasan', query: 'Emergency Doctor', date: '2023-10-24' },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <History className="w-6 h-6 text-emerald-500" />
                <span>Search History Manager</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="py-4 px-4 font-medium">User Name</th>
                            <th className="py-4 px-4 font-medium">Search Query</th>
                            <th className="py-4 px-4 font-medium">Date</th>
                            <th className="py-4 px-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {history.map((h) => (
                            <tr key={h.id} className="border-b border-gray-800/50 hover:bg-[#2A2A2A] transition-colors">
                                <td className="py-4 px-4 font-medium">{h.user}</td>
                                <td className="py-4 px-4">{h.query}</td>
                                <td className="py-4 px-4">{h.date}</td>
                                <td className="py-4 px-4 text-right">
                                    <button className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
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

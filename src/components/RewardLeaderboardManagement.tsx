import React, { useState } from 'react';
import { Trophy, Medal } from 'lucide-react';

export default function RewardLeaderboardManagement() {
    const [leaders] = useState([
        { id: 1, name: 'Rahim Uddin', phone: '01711***344', coins: 15200 },
        { id: 2, name: 'Karim Hasan', phone: '01811***344', coins: 12840 },
        { id: 3, name: 'Abdul Jabbar', phone: '01911***344', coins: 10450 },
        { id: 4, name: 'Sultana Begum', phone: '01511***344', coins: 9200 },
        { id: 5, name: 'Mamunur Rashid', phone: '01611***344', coins: 8150 },
    ]);

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-emerald-500" />
                <span>টপ আর্নার লিডারবোর্ড</span>
            </h3>
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-4 bg-emerald-500/10 border-b border-gray-800 flex items-center gap-3">
                        <Medal className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold text-emerald-500">সর্বোচ্চ কয়েন অর্জনকারী ইউজারগণ</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400">
                                <th className="py-4 px-6 font-medium w-24">Rank</th>
                                <th className="py-4 px-6 font-medium">ইউজার নাম</th>
                                <th className="py-4 px-6 font-medium">মোবাইল নম্বর</th>
                                <th className="py-4 px-6 font-medium text-right">মোট কয়েন</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {leaders.map((user, index) => (
                                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                            index === 0 ? 'bg-yellow-500 text-slate-950' :
                                            index === 1 ? 'bg-gray-300 text-slate-950' :
                                            index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400'
                                        }`}>
                                            #{index + 1}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-white">{user.name}</td>
                                    <td className="py-4 px-6 text-gray-400">{user.phone}</td>
                                    <td className="py-4 px-6 text-right font-bold text-yellow-500 text-lg">{user.coins.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

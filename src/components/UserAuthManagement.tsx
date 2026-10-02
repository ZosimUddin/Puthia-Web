import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, UserCog, UserCheck, UserMinus, Loader2, Search } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../contexts/AuthContext';

export default function UserAuthManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData: UserProfile[] = [];
            snapshot.forEach((doc) => {
                usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            setUsers(usersData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleBlock = async (uid: string, isCurrentlyBlocked: boolean) => {
        if (window.confirm(`আপনি কি এই ইউজারকে ${isCurrentlyBlocked ? 'আনব্লক' : 'ব্লক'} করতে চান?`)) {
            try {
                await updateDoc(doc(db, "users", uid), { isBlocked: !isCurrentlyBlocked });
            } catch (error) {
                console.error("Error blocking user:", error);
            }
        }
    };

    const changeRole = async (uid: string, currentRole: string) => {
        const roles = ['user', 'editor', 'admin', 'super_admin'];
        const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
        
        if (window.confirm(`রোল পরিবর্তন করে "${nextRole}" করতে চান?`)) {
            try {
                await updateDoc(doc(db, "users", uid), { role: nextRole });
            } catch (error) {
                console.error("Error changing role:", error);
            }
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.phone?.includes(searchQuery) ||
        user.uid?.includes(searchQuery)
    );

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    <span>ইউজার ও রোল ম্যানেজমেন্ট</span>
                </h3>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        value={searchQuery || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                        className="w-full bg-[#121212] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-400 text-sm">
                                <th className="py-4 px-4 font-medium">ব্যবহারকারীর নাম</th>
                                <th className="py-4 px-4 font-medium">ফোন নম্বর</th>
                                <th className="py-4 px-4 font-medium">রোল (Role)</th>
                                <th className="py-4 px-4 font-medium">স্ট্যাটাস</th>
                                <th className="py-4 px-4 font-medium text-right">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {filteredUsers.map((user) => (
                                <tr key={user.uid} className="border-b border-gray-800/50 hover:bg-[#2A2A2A] transition-colors text-sm">
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{user.uid}</div>
                                    </td>
                                    <td className="py-4 px-4">{user.phone || 'N/A'}</td>
                                    <td className="py-4 px-4">
                                        <button 
                                            onClick={() => changeRole(user.uid, user.role || 'user')}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded-lg hover:bg-emerald-900/30 transition-colors"
                                        >
                                            <UserCog className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="capitalize">{user.role || 'user'}</span>
                                        </button>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.isBlocked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                            {user.isBlocked ? 'ব্লকড' : 'সক্রিয়'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => toggleBlock(user.uid, !!user.isBlocked)}
                                                className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                                                title={user.isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                                            >
                                                {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                            </button>
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

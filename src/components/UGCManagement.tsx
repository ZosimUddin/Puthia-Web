import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserPost, getUserPosts, updateUserPost, deleteUserPost } from '../api';
import { Check, X, Trash2, Loader2, Star } from 'lucide-react';

const CATEGORIES = ['পুঠিয়া রাজবাড়ী', 'পুঠিয়ার প্রকৃতি', 'পুঠিয়ার ঐতিহ্য', 'অন্যান্য'];

export default function UGCManagement() {
    const [posts, setPosts] = useState<UserPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
            const postsData: UserPost[] = [];
            snapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() } as UserPost);
            });
            setPosts(postsData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setIsLoading(false);
        }, (error) => {
            console.error('Failed to load posts:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdate = async (id: string, data: Partial<UserPost>) => {
        setUpdatingId(id);
        try {
            await updateUserPost(id, data);
        } catch (error) {
            console.error('Failed to update post:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('পোস্টটি মুছে ফেলতে চান?')) return;
        setUpdatingId(id);
        try {
            await deleteUserPost(id);
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">গ্যালারি ম্যানেজার</h3>
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">কোনো পোস্ট নেই</div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <div key={post.id} className="bg-[#121212] p-4 rounded-xl border border-gray-800 space-y-3">
                                <div className="flex gap-3 items-center">
                                    <img src={post.userPhoto} className="w-10 h-10 rounded-full" alt={post.userName} />
                                    <div>
                                        <p className="font-bold text-white">{post.userName}</p>
                                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <select 
                                            value={post.category || ''} 
                                            onChange={(e) => handleUpdate(post.id, { category: e.target.value })}
                                            className="bg-[#1E1E1E] border border-gray-700 text-white text-xs rounded p-1"
                                        >
                                            <option value="">ক্যাটাগরি</option>
                                            {CATEGORIES.map(cat => <option key={cat} value={cat || ""}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <p className="text-gray-200">{post.text}</p>
                                {post.images && post.images.length > 0 && <img src={post.images[0]} className="w-full rounded-lg h-40 object-cover" />}
                                
                                <div className="flex gap-2 pt-2">
                                    {updatingId === post.id ? <Loader2 className="animate-spin text-white"/> : (
                                        <>
                                            <button onClick={() => handleUpdate(post.id, { status: 'approved', featured: false })} className={`flex-1 ${post.status === 'approved' && !post.featured ? 'bg-emerald-900/50' : 'bg-emerald-900/20'} text-emerald-500 py-2 rounded-lg flex items-center justify-center gap-2`}><Check className="w-4 h-4"/> অ্যাপ্রুভ</button>
                                            <button onClick={() => handleUpdate(post.id, { status: 'approved', featured: true })} className={`flex-1 ${post.featured ? 'bg-amber-900/50' : 'bg-amber-900/20'} text-amber-500 py-2 rounded-lg flex items-center justify-center gap-2`}><Star className="w-4 h-4"/> ফিচার</button>
                                            <button onClick={() => handleDelete(post.id)} className="bg-red-900/20 text-red-500 px-4 py-2 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

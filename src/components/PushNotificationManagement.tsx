import React, { useState } from 'react';
import { Bell, Send, Users, Image as ImageIcon, MessageSquare, Target } from 'lucide-react';

export default function PushNotificationManagement() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetAudience, setTargetAudience] = useState('all');
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => {
            alert('Push Notification Sent successfully!');
            setTitle('');
            setBody('');
            setIsSending(false);
        }, 1500);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">পুশ নোটিফিকেশন (Push Notifications)</h2>
                    <p className="text-gray-400 text-sm">সকল ইউজার বা নির্দিষ্ট টার্গেট অডিয়েন্সকে নোটিফিকেশন পাঠান</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-400" /> মেসেজ ডিটেইলস
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">টাইটেল (Title) *</label>
                                <input 
                                    type="text" 
                                    value={title || ""}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="নোটিফিকেশনের শিরোনাম"
                                    className="w-full bg-[#1A1A1A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">মেসেজ (Body) *</label>
                                <textarea 
                                    value={body || ""}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="নোটিফিকেশনের বিস্তারিত মেসেজ..."
                                    rows={4}
                                    className="w-full bg-[#1A1A1A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">ইমেজ URL (Optional)</label>
                                <div className="flex">
                                    <div className="bg-[#1A1A1A] border border-gray-700 border-r-0 rounded-l-xl px-4 flex items-center justify-center text-gray-500">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 bg-[#1A1A1A] border border-gray-700 text-white px-4 py-3 rounded-r-xl focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-gray-400" /> টার্গেট অডিয়েন্স
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${targetAudience === 'all' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'}`}>
                                <input type="radio" name="audience" value="all" checked={targetAudience === 'all'} onChange={() => setTargetAudience('all')} className="sr-only" />
                                <div className="flex items-center gap-2">
                                    <Users className={`w-5 h-5 ${targetAudience === 'all' ? 'text-indigo-400' : 'text-gray-500'}`} />
                                    <span className={`font-bold ${targetAudience === 'all' ? 'text-indigo-400' : 'text-gray-400'}`}>সব ইউজার</span>
                                </div>
                                <p className="text-xs text-gray-500">অ্যাপের সকল ইউজারকে পাঠানো হবে</p>
                            </label>
                            
                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${targetAudience === 'business' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'}`}>
                                <input type="radio" name="audience" value="business" checked={targetAudience === 'business'} onChange={() => setTargetAudience('business')} className="sr-only" />
                                <div className="flex items-center gap-2">
                                    <Users className={`w-5 h-5 ${targetAudience === 'business' ? 'text-indigo-400' : 'text-gray-500'}`} />
                                    <span className={`font-bold ${targetAudience === 'business' ? 'text-indigo-400' : 'text-gray-400'}`}>শুধু ব্যবসা মালিক</span>
                                </div>
                                <p className="text-xs text-gray-500">যারা ব্যবসা নিবন্ধন করেছেন</p>
                            </label>
                            
                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${targetAudience === 'premium' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'}`}>
                                <input type="radio" name="audience" value="premium" checked={targetAudience === 'premium'} onChange={() => setTargetAudience('premium')} className="sr-only" />
                                <div className="flex items-center gap-2">
                                    <Users className={`w-5 h-5 ${targetAudience === 'premium' ? 'text-indigo-400' : 'text-gray-500'}`} />
                                    <span className={`font-bold ${targetAudience === 'premium' ? 'text-indigo-400' : 'text-gray-400'}`}>প्रीमিয়াম ইউজার</span>
                                </div>
                                <p className="text-xs text-gray-500">যারা পেইড সাবস্ক্রিপশনে আছেন</p>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800 sticky top-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">প্রিভিউ (Preview)</h3>
                        
                        <div className="bg-white rounded-2xl p-4 shadow-xl mb-6 flex gap-3 relative overflow-hidden">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex shrink-0 items-center justify-center">
                                <img src="/icon.png" alt="App" className="w-6 h-6 object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-bold text-gray-900">আপনার শহর</span>
                                    <span className="text-[10px] text-gray-500">now</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 truncate">{title || 'নোটিফিকেশন টাইটেল'}</p>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-snug">{body || 'এখানে নোটিফিকেশনের বিস্তারিত মেসেজ দেখানো হবে...'}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleSend}
                            disabled={!title || !body || isSending}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!title || !body || isSending ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'}`}
                        >
                            {isSending ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    পাঠানো হচ্ছে...
                                </span>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> নোটিফিকেশন পাঠান
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-4">
                            নোটিফিকেশন পাঠানোর পর তা বাতিল করা যাবে না।
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

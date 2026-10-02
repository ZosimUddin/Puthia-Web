import React, { useState } from 'react';
import { Star, Save } from 'lucide-react';

export default function RevenueFeaturedManagement() {
    const [price, setPrice] = useState('250');
    const [duration, setDuration] = useState('7');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('ফিচারড লিস্টিং সেটিংস সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Star className="w-6 h-6 text-emerald-500" />
                <span>Featured Listing</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Price (৳)</label>
                        <input
                            type="number"
                            value={price || ""}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Duration (Days)</label>
                        <input
                            type="number"
                            value={duration || ""}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h5 className="font-medium text-blue-400 mb-1">How it works</h5>
                    <p className="text-sm text-blue-400/80 leading-relaxed">
                        When a user purchases a featured listing, their item will appear at the top of search results and category pages with a special "Featured" badge for the specified duration.
                    </p>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-500 flex items-center justify-center">
                        {successMessage}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>{isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

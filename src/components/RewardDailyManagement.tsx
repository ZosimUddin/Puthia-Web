import React, { useState } from 'react';
import { Sun, Save } from 'lucide-react';

export default function RewardDailyManagement() {
    const [dailyBonus, setDailyBonus] = useState('10');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('দৈনিক বোনাস সেটিংস সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Sun className="w-6 h-6 text-emerald-500" />
                <span>দৈনিক বোনাস সেটিংস</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-6">
                        ইউজাররা প্রতিদিন অ্যাপে লগইন করলে কত কয়েন উপহার পাবে তা নির্ধারণ করুন।
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">প্রতিদিনের বোনাস</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={dailyBonus || ""}
                                onChange={(e) => setDailyBonus(e.target.value)}
                                className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-4 pr-16 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-yellow-500">Coins</div>
                        </div>
                    </div>
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

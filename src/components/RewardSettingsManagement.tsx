import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function RewardSettingsManagement() {
    const [isEnabled, setIsEnabled] = useState(true);
    const [conversionRate, setConversionRate] = useState('100'); // 100 coins = 1 tk
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('রিওয়ার্ড সেটিংস সফলভাবে সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Settings className="w-6 h-6 text-emerald-500" />
                <span>রিওয়ার্ড ও কয়েন সেটিংস</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6 space-y-6">
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium mb-1">রিওয়ার্ড সিস্টেম চালু করুন</h4>
                            <p className="text-sm text-gray-400">পুরো অ্যাপে কয়েন ও রিচার্জ সিস্টেম চালু বা বন্ধ করুন</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isEnabled}
                                onChange={(e) => setIsEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-gray-800">
                        <label className="block text-sm font-medium text-gray-400 mb-2">কয়েন কনভার্সন রেট</label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    value={conversionRate || ""}
                                    onChange={(e) => setConversionRate(e.target.value)}
                                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white pl-4 pr-16 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-yellow-500">Coins</div>
                            </div>
                            <span className="text-white font-bold">=</span>
                            <div className="flex-1 bg-[#1E1E1E] border border-gray-700 text-white px-4 py-3 rounded-xl opacity-70">
                                ৳ 1 (এক টাকা)
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">১ টাকা সমান কত কয়েন হবে তা নির্ধারণ করুন।</p>
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

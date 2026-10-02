import React, { useState } from 'react';
import { Megaphone, Save } from 'lucide-react';

export default function RevenueAdsManagement() {
    const [adNetwork, setAdNetwork] = useState('admob');
    const [appId, setAppId] = useState('');
    const [bannerId, setBannerId] = useState('');
    const [interstitialId, setInterstitialId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('অ্যাড সেটিংস সফলভাবে সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-emerald-500" />
                <span>Ad Management</span>
            </h3>
            
            <div className="space-y-6 max-w-3xl">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ad Network</label>
                    <select
                        value={adNetwork || ""}
                        onChange={(e) => setAdNetwork(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value="admob">Google AdMob</option>
                        <option value="facebook">Facebook Audience Network</option>
                        <option value="applovin">AppLovin MAX</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">App ID</label>
                    <input
                        type="text"
                        value={appId || ""}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="e.g. ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Banner Ad Unit ID</label>
                        <input
                            type="text"
                            value={bannerId || ""}
                            onChange={(e) => setBannerId(e.target.value)}
                            placeholder="e.g. ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz"
                            className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Interstitial Ad Unit ID</label>
                        <input
                            type="text"
                            value={interstitialId || ""}
                            onChange={(e) => setInterstitialId(e.target.value)}
                            placeholder="e.g. ca-app-pub-xxxxxxxxxxxxxxxx/wwwwwwwwww"
                            className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
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

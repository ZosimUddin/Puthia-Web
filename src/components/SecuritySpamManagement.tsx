import React, { useState } from 'react';
import { ShieldAlert, Save } from 'lucide-react';

export default function SecuritySpamManagement() {
    const [spamLevel, setSpamLevel] = useState('medium');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-emerald-500" />
                <span>Spam Protection</span>
            </h3>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Spam Protection Level</label>
                <select value={spamLevel || ""} onChange={(e) => setSpamLevel(e.target.value)} className="w-full bg-[#2A2A2A] border border-gray-800 text-white p-3 rounded-xl">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div className="flex justify-end pt-6">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium transition-all">
                    {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}

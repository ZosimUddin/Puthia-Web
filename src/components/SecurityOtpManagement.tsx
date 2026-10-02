import React, { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';

export default function SecurityOtpManagement() {
    const [otpEnabled, setOtpEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-emerald-500" />
                <span>OTP Login Settings</span>
            </h3>
            <div className="flex items-center justify-between p-4 bg-[#2A2A2A] border border-gray-800 rounded-xl">
                <div>
                    <h4 className="text-white font-medium">OTP Login</h4>
                    <p className="text-sm text-gray-400">Enable OTP based login for users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={otpEnabled} onChange={(e) => setOtpEnabled(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500"></div>
                </label>
            </div>
            <div className="flex justify-end pt-6">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium transition-all">
                    {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}

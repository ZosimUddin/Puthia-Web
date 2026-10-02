import React, { useState } from 'react';
import { Database, Download, RefreshCw } from 'lucide-react';

export default function SecurityBackupManagement() {
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => setIsBackingUp(false), 2000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Database className="w-6 h-6 text-emerald-500" />
                <span>Data Backup & Restore</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleBackup} disabled={isBackingUp} className="flex items-center justify-center gap-2 p-4 bg-[#2A2A2A] hover:bg-[#333] border border-gray-800 rounded-xl text-white transition-all">
                    <Download className="w-5 h-5 text-emerald-500" />
                    {isBackingUp ? 'Creating Backup...' : 'Download Full Backup'}
                </button>
                <button className="flex items-center justify-center gap-2 p-4 bg-[#2A2A2A] hover:bg-[#333] border border-gray-800 rounded-xl text-white transition-all">
                    <RefreshCw className="w-5 h-5 text-emerald-500" />
                    Restore from Backup
                </button>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { RotateCw, Trash2, HardDrive, AlertCircle } from 'lucide-react';

export default function SettingsCacheManagement() {
    const [isClearing, setIsClearing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [cacheSize, setCacheSize] = useState('0 MB');

    useEffect(() => {
        // Mock calculating cache size
        const sizes = ['45.2 MB', '128.5 MB', '24.1 MB', '67.8 MB', '210.3 MB'];
        setCacheSize(sizes[Math.floor(Math.random() * sizes.length)]);
    }, []);

    const handleClearCache = () => {
        setIsClearing(true);
        setTimeout(() => {
            setIsClearing(false);
            setCacheSize('0 MB');
            setSuccessMessage('সিস্টেম ক্যাশ সফলভাবে ক্লিয়ার করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1500);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <RotateCw className="w-6 h-6 text-emerald-500" />
                <span>Cache Clear</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <HardDrive className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Current Cache Size</h4>
                            <p className="text-3xl font-bold text-emerald-500">{cacheSize}</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto text-right">
                        <button
                            onClick={handleClearCache}
                            disabled={isClearing || cacheSize === '0 MB'}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-medium transition-all disabled:opacity-50"
                        >
                            {isClearing ? (
                                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                            <span>{isClearing ? 'Clearing...' : 'Clear All Cache'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="font-medium text-blue-400 mb-1">Information</h5>
                        <p className="text-sm text-blue-400/80 leading-relaxed">
                            ক্যাশ ক্লিয়ার করলে অ্যাপের অস্থায়ী ডেটা মুছে যাবে, যার ফলে প্রথমবার লোড হতে কিছুটা সময় লাগতে পারে। তবে এটি অ্যাপের পারফরম্যান্স বাড়াতে সাহায্য করে।
                        </p>
                    </div>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-500 flex items-center justify-center">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

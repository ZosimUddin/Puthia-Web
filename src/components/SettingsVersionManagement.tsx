import React, { useState } from 'react';
import { Smartphone, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";

export default function SettingsVersionManagement() {
    const [isChecking, setIsChecking] = useState(false);
    const [status, setStatus] = useState<'idle' | 'checking' | 'up_to_date' | 'update_available'>('idle');

    const handleCheckUpdate = () => {
        setIsChecking(true);
        setStatus('checking');
        setTimeout(() => {
            setIsChecking(false);
            // Simulate random update status
            setStatus(Math.random() > 0.5 ? 'up_to_date' : 'update_available');
        }, 2000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-500" />
                <span>অ্যাপ আপডেট ও সংস্করণ</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Smartphone className="w-12 h-12 text-emerald-500" />
                    </div>
                    
                    <h4 className="text-2xl font-black text-white mb-2">পুঠিয়া ডিজিটাল ডিরেক্টরি</h4>
                    <p className="text-gray-500 mb-8 font-mono">বর্তমান সংস্করণ: v2.4.0 (Premium)</p>

                    <AnimatePresence mode="wait">
                        {status === 'up_to_date' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 w-full mb-8"
                            >
                                <CheckCircle2 className="w-8 h-8 animate-bounce" />
                                <span className="font-bold">আপনার অ্যাপটি সর্বশেষ সংস্করণে আপডেট আছে।</span>
                            </motion.div>
                        )}

                        {status === 'update_available' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-3 p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-400 w-full mb-8"
                            >
                                <RefreshCw className="w-8 h-8 animate-spin-slow" />
                                <span className="font-bold text-lg">নতুন আপডেট (v2.4.1) পাওয়া গেছে!</span>
                                <p className="text-xs text-blue-300 opacity-80">দ্রুত নতুন ফিচার পেতে আপডেট করুন।</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleCheckUpdate}
                        disabled={isChecking}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black transition-all text-lg shadow-xl shadow-emerald-900/20 active:scale-95 group"
                    >
                        {isChecking ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <RefreshCw className={`w-6 h-6 ${status === 'idle' ? 'group-hover:rotate-180 transition-transform duration-700' : ''}`} />
                        )}
                        <span>{isChecking ? 'চেক করা হচ্ছে...' : 'আপডেট চেক করুন'}</span>
                    </button>
                    
                    <p className="text-[10px] text-gray-600 mt-8 uppercase tracking-[0.2em]">
                        Developed by Puthia Tech Team © 2024
                    </p>
                </div>
            </div>
        </div>
    );
}

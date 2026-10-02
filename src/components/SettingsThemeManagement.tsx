import React, { useState } from 'react';
import { Palette, Moon, Sun, Monitor, Save } from 'lucide-react';

export default function SettingsThemeManagement() {
    const [theme, setTheme] = useState('dark');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('থিম সেটিংস সফলভাবে সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Palette className="w-6 h-6 text-emerald-500" />
                <span>Theme Settings</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dark Theme Option */}
                    <div 
                        onClick={() => setTheme('dark')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            theme === 'dark' 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-700'
                        }`}
                    >
                        <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${theme === 'dark' ? 'text-emerald-500' : 'text-gray-400'}`}>Dark Mode</span>
                    </div>

                    {/* Light Theme Option */}
                    <div 
                        onClick={() => setTheme('light')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            theme === 'light' 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-700'
                        }`}
                    >
                        <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${theme === 'light' ? 'text-emerald-500' : 'text-gray-400'}`}>Light Mode</span>
                    </div>

                    {/* System Theme Option */}
                    <div 
                        onClick={() => setTheme('system')}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            theme === 'system' 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-700'
                        }`}
                    >
                        <Monitor className={`w-8 h-8 ${theme === 'system' ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${theme === 'system' ? 'text-emerald-500' : 'text-gray-400'}`}>System Default</span>
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

import React, { useState } from 'react';
import { Languages, Save } from 'lucide-react';

export default function SettingsLanguageManagement() {
    const [language, setLanguage] = useState('bn');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('ভাষা সেটিংস সফলভাবে সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Languages className="w-6 h-6 text-emerald-500" />
                <span>Language (বাংলা/English)</span>
            </h3>
            
            <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bengali Option */}
                    <div 
                        onClick={() => setLanguage('bn')}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            language === 'bn' 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-700'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                            language === 'bn' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
                        }`}>
                            অ
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg ${language === 'bn' ? 'text-emerald-500' : 'text-gray-300'}`}>বাংলা</h4>
                            <p className="text-sm text-gray-500">ডিফল্ট ভাষা</p>
                        </div>
                    </div>

                    {/* English Option */}
                    <div 
                        onClick={() => setLanguage('en')}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            language === 'en' 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-700'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                            language === 'en' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
                        }`}>
                            A
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg ${language === 'en' ? 'text-emerald-500' : 'text-gray-300'}`}>English</h4>
                            <p className="text-sm text-gray-500">Secondary Language</p>
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

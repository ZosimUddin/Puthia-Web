import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CloudSun, Save, Loader2, Key, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

export default function WeatherConfigManagement() {
    const [config, setConfig] = useState<any>({
        apiKey: '',
        city: 'Puthia',
        country: 'BD',
        units: 'metric',
        updateInterval: 30 // minutes
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(db, "settings", "weather_config");
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setConfig(docSnap.data());
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const docRef = doc(db, "settings", "weather_config");
            await setDoc(docRef, {
                ...config,
                updatedAt: serverTimestamp()
            });
            alert("ওয়েদার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে।");
        } catch (error) {
            console.error("Error saving weather config:", error);
            alert("সংরক্ষণ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSaving(false);
        }
    };

    const testConnection = async () => {
        if (!config.apiKey) {
            alert("দয়া করে API Key প্রদান করুন।");
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${config.city},${config.country}&appid=${config.apiKey}&units=${config.units}`);
            const data = await response.json();
            
            if (response.ok) {
                setTestResult({
                    status: 'success',
                    temp: data.main.temp,
                    desc: data.weather[0].description,
                    city: data.name
                });
            } else {
                setTestResult({
                    status: 'error',
                    message: data.message || 'Connection failed'
                });
            }
        } catch (error) {
            setTestResult({
                status: 'error',
                message: 'Network error or invalid API key'
            });
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="font-medium">কনফিগারেশন লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-800">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                    <CloudSun className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">আবহাওয়া তথ্য কনফিগারেশন</h3>
                    <p className="text-sm text-gray-500 tracking-wide">OpenWeatherMap API এবং লোকেশন সেটিংস</p>
                </div>
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-200/70 leading-relaxed">
                        <p className="font-bold text-amber-500 mb-1">গুরুত্বপূর্ণ নির্দেশিকা:</p>
                        <p>আবহাওয়ার লাইভ তথ্য পেতে আপনার একটি <b>OpenWeatherMap</b> API Key প্রয়োজন। আপনি এটি openweathermap.org থেকে বিনামূল্যে সংগ্রহ করতে পারেন।</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">OpenWeatherMap API Key</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="password" 
                                value={config.apiKey || ""}
                                onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                                className="w-full bg-[#121212] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="আপনার API Key এখানে পেস্ট করুন"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">শহর (City Name)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={config.city || ""}
                                    onChange={(e) => setConfig({...config, city: e.target.value})}
                                    className="w-full bg-[#121212] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="e.g. Puthia"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">আপডেট ইন্টারভাল (মিনিট)</label>
                            <div className="relative">
                                <RefreshCw className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                                <input 
                                    type="number" 
                                    value={config.updateInterval || ""}
                                    onChange={(e) => setConfig({...config, updateInterval: parseInt(e.target.value) || 30})}
                                    className="w-full bg-[#121212] border border-gray-700 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                                    placeholder="30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> কনফিগারেশন সেভ করুন</>}
                    </button>
                    <button 
                        onClick={testConnection}
                        disabled={isTesting}
                        className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                        {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'টেস্ট কানেকশন'}
                    </button>
                </div>

                {testResult && (
                    <div className={`p-6 rounded-2xl border ${testResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                        {testResult.status === 'success' ? (
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-black text-white">{testResult.temp}°C</div>
                                <div>
                                    <div className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">সফলভাবে কানেক্ট হয়েছে</div>
                                    <div className="text-white font-medium text-sm">{testResult.city}: {testResult.desc}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-rose-400 font-medium">
                                <div className="font-bold text-xs uppercase mb-1">কানেকশন ফেইল্ড</div>
                                {testResult.message}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

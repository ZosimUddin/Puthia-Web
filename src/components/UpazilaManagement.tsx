import React, { useState } from 'react';
import { Map, MapPin, Building, Users, Landmark, HeartPulse, GraduationCap, PhoneCall, Building2 } from 'lucide-react';

export default function UpazilaManagement() {
    const modules = [
        { id: 'about', title: 'উপজেলা পরিচিতি', icon: Map, color: 'text-blue-500', desc: 'উপজেলার সাধারণ তথ্য' },
        { id: 'unions', title: 'ইউনিয়ন', icon: MapPin, color: 'text-emerald-500', desc: 'সকল ইউনিয়নের তালিকা' },
        { id: 'map', title: 'মানচিত্র', icon: Landmark, color: 'text-orange-500', desc: 'ভৌগোলিক মানচিত্র' },
        { id: 'reps', title: 'জনপ্রতিনিধি', icon: Users, color: 'text-purple-500', desc: 'চেয়ারম্যান, মেম্বার ইত্যাদি' },
        { id: 'tourism', title: 'পর্যটন', icon: Building, color: 'text-pink-500', desc: 'দর্শনীয় স্থান' },
        { id: 'education', title: 'শিক্ষা', icon: GraduationCap, color: 'text-cyan-500', desc: 'শিক্ষা প্রতিষ্ঠান' },
        { id: 'health', title: 'স্বাস্থ্য', icon: HeartPulse, color: 'text-red-500', desc: 'হাসপাতাল ও ক্লিনিক' },
        { id: 'banks', title: 'ব্যাংক', icon: Building2, color: 'text-amber-500', desc: 'ব্যাংক ও এনজিও' },
        { id: 'emergency', title: 'জরুরি সেবা', icon: PhoneCall, color: 'text-rose-500', desc: 'ফায়ার সার্ভিস, থানা ইত্যাদি' },
    ];

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Map className="w-6 h-6 text-sky-500" />
                    <span>উপজেলা তথ্য ম্যানেজমেন্ট (Upazila Data)</span>
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modules.map(mod => {
                    const Icon = mod.icon;
                    return (
                        <div key={mod.id} className="p-5 border border-gray-800 rounded-xl hover:border-sky-500/50 cursor-pointer transition-all bg-[#121212] group">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`p-3 rounded-lg bg-gray-800/50 group-hover:bg-gray-800 transition-colors ${mod.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg text-white group-hover:text-sky-400 transition-colors">{mod.title}</h3>
                            </div>
                            <p className="text-sm text-gray-400 pl-2 border-l-2 border-gray-700">{mod.desc}</p>
                            <button className="mt-4 w-full py-2 text-sm font-bold text-gray-400 bg-gray-800/30 rounded-lg group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-colors">
                                মডিউল এডিট করুন
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 p-6 border-2 border-dashed border-gray-800 rounded-xl text-center">
                <p className="text-gray-400">এই মডিউলগুলির ডাটাবেস এন্ট্রি পেজগুলি খুব শীঘ্রই যুক্ত করা হবে।</p>
            </div>
        </div>
    );
}

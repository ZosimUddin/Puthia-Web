import React, { useState } from 'react';
import { Award, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

interface PremiumPlan {
    id: string;
    name: string;
    price: string;
    duration: string;
    features: string[];
    isActive: boolean;
}

export default function RevenuePremiumManagement() {
    const [plans, setPlans] = useState<PremiumPlan[]>([
        {
            id: '1',
            name: 'Gold Premium',
            price: '৳ ৫০০',
            duration: '1 Month',
            features: ['Top visibility', 'Verified badge', 'Priority support'],
            isActive: true
        },
        {
            id: '2',
            name: 'Platinum Premium',
            price: '৳ ১২০০',
            duration: '3 Months',
            features: ['Everything in Gold', 'Home page feature', 'Dedicated account manager'],
            isActive: true
        }
    ]);

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const togglePlanStatus = (id: string) => {
        setPlans(plans.map(plan => 
            plan.id === id ? { ...plan, isActive: !plan.isActive } : plan
        ));
    };

    const deletePlan = (id: string) => {
        if(window.confirm('Are you sure you want to delete this plan?')) {
            setPlans(plans.filter(plan => plan.id !== id));
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSuccessMessage('প্রিমিয়াম লিস্টিং সেটিংস সেভ করা হয়েছে।');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-500" />
                    <span>Premium Listing Packages</span>
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Create Plan
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1">{plan.name}</h4>
                                <div className="text-2xl font-bold text-emerald-500">{plan.price}<span className="text-sm font-normal text-gray-400">/{plan.duration}</span></div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => togglePlanStatus(plan.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-300'}`}
                                >
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button onClick={() => deletePlan(plan.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <button className="w-full py-2 border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors font-medium text-sm">
                            Edit Plan
                        </button>
                    </div>
                ))}
            </div>

            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-500 flex items-center justify-center mb-6">
                    {successMessage}
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-800">
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
    );
}

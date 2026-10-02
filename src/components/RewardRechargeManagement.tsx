import React, { useState } from 'react';
import { Smartphone, Send, CheckCircle } from 'lucide-react';

export default function RewardRechargeManagement() {
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [operator, setOperator] = useState('grameenphone');
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSuccessMessage('রিচার্জ সফলভাবে পাঠানো হয়েছে!');
            setPhone('');
            setAmount('');
            setTimeout(() => setSuccessMessage(''), 3000);
        }, 1500);
    };

    return (
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 pb-6 border-b border-gray-800 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-500" />
                <span>মোবাইল রিচার্জ উপহার দিন</span>
            </h3>
            
            <div className="max-w-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">মোবাইল নম্বর</label>
                    <input
                        type="tel"
                        value={phone || ""}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">অপারেটর</label>
                    <select
                        value={operator || ""}
                        onChange={(e) => setOperator(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                        <option value="grameenphone">Grameenphone</option>
                        <option value="banglalink">Banglalink</option>
                        <option value="robi">Robi</option>
                        <option value="airtel">Airtel</option>
                        <option value="teletalk">Teletalk</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">পরিমাণ (৳)</label>
                    <input
                        type="number"
                        value={amount || ""}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10"
                        className="w-full bg-[#2A2A2A] border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-500 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={isSending || !phone || !amount}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
                >
                    {isSending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                    <span>{isSending ? 'পাঠানো হচ্ছে...' : 'রিচার্জ পাঠান'}</span>
                </button>
            </div>
        </div>
    );
}

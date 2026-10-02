import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string, timestamp?: number}[]>([
        { 
            sender: 'bot', 
            text: 'হ্যালো! আমি পুঠিয়া স্মার্ট সিটির AI অ্যাসিস্ট্যান্ট। আপনাকে কীভাবে সাহায্য করতে পারি?',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const now = Date.now();
        const userMessage = { sender: 'user' as const, text: input, timestamp: now };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await fetch('/api/upazila-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: input,
                    history: messages
                })
            });
            
            const data = await response.json();
            
            if (data.reply) {
                setMessages(prev => [...prev, { 
                    sender: 'bot', 
                    text: data.reply,
                    timestamp: Date.now()
                }]);
            } else if (data.isConfigError) {
                setMessages(prev => [...prev, { 
                    sender: 'bot', 
                    text: 'দুঃখিত, এআই ফিচারটি চালু করার জন্য অ্যাডমিন প্যানেল থেকে API Key সেট করতে হবে।',
                    timestamp: Date.now()
                }]);
            } else {
                throw new Error(data.error || 'Failed to get reply');
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { 
                sender: 'bot', 
                text: 'দুঃখিত, এই মুহূর্তে আমি সংযোগ করতে পারছি না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
                timestamp: Date.now()
            }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[450px] animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">পুঠিয়া AI হেল্প ডেস্ক</h3>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                        <div className="text-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm">আজ</span>
                        </div>
                        
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-100 text-teal-600'}`}>
                                        {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-tl-sm'}`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[10px] mt-1 text-right select-none ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <div className="relative flex items-center">
                            <input 
                                type="text"
                                value={input || ""}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="মেসেজ লিখুন..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="absolute right-2 p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                            <Sparkles className="w-3 h-3 text-emerald-500" /> Powered by Gemini AI
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 relative group"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                
                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>
        </div>
    );
}

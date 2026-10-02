import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search, Sparkles, Volume2, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface VoiceSearchProps {
    onResult?: (text: string) => void;
    className?: string;
    buttonText?: string;
}

// Sample Voice Queries & Smart Mappings for Puthia
const SAMPLE_VOICE_QUERIES = [
    { text: "🎙️ “পুঠিয়ায় ভালো রেস্টুরেন্ট কোথায়?”", category: "রেস্টুরেন্ট & খাবার", path: "/restaurants" },
    { text: "🎙️ “জরুরি এমবুলেন্স বা ডাক্তার লাগবে”", category: "স্বাস্থ্য সেবা", path: "/health" },
    { text: "🎙️ “রাজবাড়ি বা রাজবাড়ীর ইতিহাস দেখাও”", category: "পর্যটন স্থান", path: "/tourism" },
    { text: "🎙️ “বাসা ভাড়া বা জমি কেনাবেচা”", category: "মার্কেটপ্লেস", path: "/house-rent" },
];

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, className = '', buttonText }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [speakingText, setSpeakingText] = useState("");
    const [language, setLanguage] = useState<'bn-BD' | 'en-US'>('bn-BD');
    const [isBrowserSupported, setIsBrowserSupported] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsBrowserSupported(false);
        }
    }, []);

    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'bn-BD';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const processVoiceCommand = (rawTranscript: string) => {
        const query = rawTranscript.trim().toLowerCase();
        setRecognizedText(rawTranscript);

        // Smart route redirect engine based on Bangla intent
        let targetPath = "";
        let audioReply = "";

        if (query.includes("রেস্টুরেন্ট") || query.includes("খাবার") || query.includes("হোটেল") || query.includes("খাবো")) {
            targetPath = "/restaurants";
            audioReply = "পুঠিয়ার সেরা রেস্টুরেন্ট এবং হোটেল পেজে নিয়ে যাওয়া হচ্ছে।";
        } else if (query.includes("এমবুলেন্স") || query.includes("ডাক্তার") || query.includes("হাসপাতাল") || query.includes("ডাক্তারের")) {
            targetPath = "/health";
            audioReply = "স্বাস্থ্য সেবা, হাসপাতাল ও ডাক্তারদের তালিকা দেখানো হচ্ছে।";
        } else if (query.includes("রাজবাড়ি") || query.includes("রাজবাড়ি") || query.includes("ঘুরতে") || query.includes("দর্শনীয়") || query.includes("ট্যুর")) {
            targetPath = "/tourism";
            audioReply = "পুঠিয়ার ঐতিহাসিক রাজবাড়ি ও দর্শনীয় স্থানের তালিকা খোলা হচ্ছে।";
        } else if (query.includes("বাসা ভাড়া") || query.includes("ভাড়া") || query.includes("ফ্ল্যাট")) {
            targetPath = "/house-rent";
            audioReply = "পুঠিয়ার বাসা ভাড়া ও রেেন্ট সেকশনে নিয়ে যাওয়া হচ্ছে।";
        } else if (query.includes("জমি") || query.includes("প্লট")) {
            targetPath = "/land-sale";
            audioReply = "জমি কেনাবেচার পেজে প্রবেশ করা হচ্ছে।";
        } else if (query.includes("মার্কেট") || query.includes("কেনাকাটা") || query.includes("বাজার")) {
            targetPath = "/marketplace";
            audioReply = "পুঠিয়া ডিজিটাল মার্কেটপ্লেস খোলা হচ্ছে।";
        } else if (query.includes("বাস") || query.includes("গাড়ি") || query.includes("ট্রেন")) {
            targetPath = "/transport";
            audioReply = "পরিবহন ও সময়সূচির তথ্য প্রস্তুত।";
        } else {
            audioReply = `পাওয়া গেছে: "${rawTranscript}"। সার্চ করা হচ্ছে।`;
        }

        speakResponse(audioReply);
        toast.success(`ভয়েস রিকগনাইজড: "${rawTranscript}"`);

        if (onResult) {
            onResult(rawTranscript);
        }

        setTimeout(() => {
            setIsListening(false);
            if (targetPath) {
                navigate(targetPath);
            }
        }, 1500);
    };

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("আপনার ব্রাউজার বা ডিভাইসে বাংলা ভয়েস ইনপুট সাপোর্ট করছে না।");
            return;
        }

        try {
            window.speechSynthesis?.cancel();
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = language;

            recognition.onstart = () => {
                setIsListening(true);
                setRecognizedText("");
            };

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setRecognizedText(transcript);
                if (event.results[current].isFinal) {
                    processVoiceCommand(transcript);
                }
            };

            recognition.onerror = (event: any) => {
                console.warn("Speech recognition notice:", event.error);
                if (event.error === 'no-speech') {
                    toast.error("কোনো আওয়াজ শোনা যায়নি। আবার চেষ্টা করুন।");
                } else if (event.error === 'not-allowed') {
                    toast.error("মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি।");
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                // If final was not triggered automatically
            };

            recognition.start();
        } catch (err) {
            console.error(err);
            setIsListening(false);
        }
    };

    return (
        <div className={`inline-block ${className}`}>
            <button
                type="button"
                onClick={startListening}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isListening
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title="বাংলা ভয়েস সার্চ অ্যাসিস্ট্যান্ট"
            >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : 'text-emerald-700'}`} />
                {buttonText && <span>{buttonText}</span>}
            </button>

            <AnimatePresence>
                {isListening && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden space-y-6">
                            
                            {/* Pulse Circle */}
                            <div className="relative flex justify-center py-4">
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500/40"
                                >
                                    <Mic className="w-10 h-10 text-[#006a4e]" />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full uppercase">
                                    <Sparkles size={12} /> বাংলা ভয়েস কমান্ড এক্টিভ
                                </span>
                                <h3 className="text-xl font-black text-slate-900">
                                    {recognizedText ? `“${recognizedText}”` : "বলুন, আমি শুনছি..."}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold">
                                    টাইপ না করেই যা খুশি মুখ ফুটে পুঠিয়া পোর্টালকে বলুন!
                                </p>
                            </div>

                            {/* Live Soundwave Animation */}
                            <div className="flex gap-1.5 justify-center items-center h-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: [8, 28, 8] }}
                                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                                        className="w-2 bg-[#006a4e] rounded-full"
                                    />
                                ))}
                            </div>

                            {/* Sample Voice Hints */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase block">চেষ্টা করে দেখতে পারেন:</span>
                                <div className="space-y-1.5">
                                    {SAMPLE_VOICE_QUERIES.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => processVoiceCommand(item.text.replace(/[^অ-হa-zA-Z\s]/g, ''))}
                                            className="w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 p-2 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                                        >
                                            <span>{item.text}</span>
                                            <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-emerald-600" /> bn-BD Voice Enabled
                                </span>
                                <button 
                                    onClick={() => setIsListening(false)}
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs transition-colors cursor-pointer"
                                >
                                    বন্ধ করুন
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default VoiceSearch;

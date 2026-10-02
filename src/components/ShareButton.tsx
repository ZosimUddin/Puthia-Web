import React, { useState } from 'react';
import { Share2, Link, Check, X, Facebook, MessageCircle, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { copyToClipboard as safeCopyToClipboard } from '../utils/clipboard';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url = window.location.href, className = '' }) => {
    const [showToast, setShowToast] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
            } catch (error: any) {
                if (error.name !== 'AbortError' && !error.message.includes('Share canceled')) {
                    console.log('Error sharing:', error);
                    setShowOptions(true);
                }
            }
        } else {
            setShowOptions(true);
        }
    };

    const copyToClipboard = async () => {
        await safeCopyToClipboard(url);
        setShowToast(true);
        setShowOptions(false);
        setTimeout(() => setShowToast(false), 2000);
    };

    const sharePlatforms = [
        { name: 'Copy Link', icon: Link, action: copyToClipboard, color: 'text-blue-400' },
        { name: 'Facebook', icon: Facebook, action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'), color: 'text-blue-600' },
        { name: 'WhatsApp', icon: MessageCircle, action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'), color: 'text-green-500' },
        { name: 'Telegram', icon: Send, action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'), color: 'text-sky-500' },
        { name: 'Messenger', icon: MessageSquare, action: () => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}`, '_blank'), color: 'text-blue-500' },
    ];

    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
                onClick={handleShare}
                className={`p-1.5 rounded-full bg-gray-50/80 text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
                title="Share"
            >
                <Share2 className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 bottom-full mb-2 bg-white border border-gray-100 rounded-2xl p-2 shadow-2xl z-50 w-48"
                    >
                        <div className="flex justify-between items-center mb-2 px-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share Options</span>
                            <button onClick={() => setShowOptions(false)}><X className="w-3 h-3 text-gray-400" /></button>
                        </div>
                        {sharePlatforms.map((platform) => (
                            <motion.button 
                                key={platform.name}
                                whileTap={{ scale: 0.97 }}
                                onClick={platform.action}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50/60 rounded-xl text-sm text-gray-700 transition-colors cursor-pointer"
                            >
                                <platform.icon className={`w-4 h-4 ${platform.color}`} />
                                <span>{platform.name}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 25, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-[100] text-sm font-bold border border-emerald-400/30"
                    >
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.05, duration: 0.15 }}
                        >
                          <Check className="w-4 h-4 text-emerald-100" />
                        </motion.div>
                        লিঙ্ক কপি হয়েছে!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


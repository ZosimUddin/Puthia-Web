import React from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Share2, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QrCodeShareProps {
    url: string;
    title: string;
    onClose: () => void;
}

export const QrCodeShare: React.FC<QrCodeShareProps> = ({ url, title, onClose }) => {
    const downloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${title.replace(/\s+/g, '_')}_QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <QRCode 
                            id="qr-code-svg"
                            value={url || ""} 
                            size={200}
                            level="H"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{title}</h3>
                <p className="text-gray-500 text-sm mb-6">কিউআর কোডটি স্ক্যান করে শেয়ার করুন</p>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={downloadQR}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm transition-all"
                    >
                        <Download className="w-4 h-4" />
                        ডাউনলোড
                    </button>
                    <button 
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title, url }).catch(() => {});
                            }
                        }}
                        className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200"
                    >
                        <Share2 className="w-4 h-4" />
                        শেয়ার
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

import React from 'react';
import { Phone, MessageCircle, MapPin, Navigation } from 'lucide-react';

interface QuickActionsProps {
    phone?: string;
    whatsapp?: string;
    location?: string;
    label?: string;
    className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
    phone, 
    whatsapp, 
    location, 
    label = "অ্যাকশন", 
    className = "" 
}) => {
    const handleCall = () => {
        if (phone) window.open(`tel:${phone}`, '_self');
    };

    const handleWhatsApp = () => {
        const wpNum = whatsapp || phone;
        if (wpNum) {
            const cleanNum = wpNum.replace(/\D/g, '');
            const formattedNum = cleanNum.startsWith('88') ? cleanNum : `88${cleanNum}`;
            window.open(`https://wa.me/${formattedNum}`, '_blank');
        }
    };

    const handleNavigation = () => {
        if (location) {
            const query = encodeURIComponent(`${location}, Puthia, Rajshahi`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {phone && (
                <button
                    onClick={handleCall}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all text-xs font-bold border border-emerald-500/20 shadow-sm"
                >
                    <Phone className="w-3.5 h-3.5" />
                    কল করুন
                </button>
            )}
            
            {(whatsapp || phone) && (
                <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all text-xs font-bold border border-green-500/20 shadow-sm"
                >
                    <MessageCircle className="w-3.5 h-3.5" />
                    হোয়াটসঅ্যাপ
                </button>
            )}

            {location && (
                <button
                    onClick={handleNavigation}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold border border-blue-500/20 shadow-sm"
                >
                    <Navigation className="w-3.5 h-3.5" />
                    ম্যাপে দেখুন
                </button>
            )}
        </div>
    );
};

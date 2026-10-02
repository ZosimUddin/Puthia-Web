import React from 'react';
import { DiagnosticCenter } from './types';
import { ArrowLeft, MapPin, Navigation, Phone, Share2, Clock, Car } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: DiagnosticCenter | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  center
}) => {
  if (!isOpen || !center) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: center.name,
        text: `অবস্থান: ${center.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${center.name} - ${center.address}`);
    }
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-800">অবস্থান (Map Location)</h2>
          <div className="w-9" />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden">
          
          {/* Map Background Visual */}
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
            alt="Puthia Map" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=1200";
            }}
            className="w-full h-full object-cover"
          />

          {/* Overlay Grid / Pins */}
          <div className="absolute inset-0 bg-[#006a4e]/10 pointer-events-none" />

          {/* Map Pin Landmark Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <div className="bg-[#006a4e] text-white px-3 py-1 rounded-full shadow-lg text-xs font-bold flex items-center gap-1 border border-white">
              <MapPin size={12} />
              <span>{center.name}</span>
            </div>
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md -mt-1" />
          </div>

          {/* Nearby Pins */}
          <div className="absolute top-1/4 left-1/3 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border shadow-xs">
            📍 Puthia Bus Stand
          </div>
          <div className="absolute bottom-1/3 right-1/4 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border shadow-xs">
            📍 Puthia Upazila Parishad
          </div>

        </div>

        {/* Bottom Info Card */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3 z-10 shadow-lg">
          <div>
            <h3 className="text-base font-bold text-slate-900">{center.name}</h3>
            <p className="text-xs text-slate-500">{center.address}</p>
          </div>

          {/* 3 Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#006a4e] text-white font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-[#00523d] transition"
            >
              <Navigation size={14} />
              দিক নির্দেশনা
            </a>

            <a
              href={`tel:${center.phone}`}
              className="bg-slate-100 text-slate-800 font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-200 transition border border-slate-200"
            >
              <Phone size={14} />
              কল করুন
            </a>

            <button
              onClick={handleShare}
              className="bg-slate-100 text-slate-800 font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-slate-200 transition border border-slate-200"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#006a4e]" />
              দূরত্ব: {center.distance || '1.2 কিমি'}
            </span>
            <span className="flex items-center gap-1">
              <Car size={13} className="text-[#006a4e]" />
              আসার সময়: ৫ মিনিট (প্রায়)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

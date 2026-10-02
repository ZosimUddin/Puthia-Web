import React from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, Phone, CheckCircle, MapPin, Clock, Star, ArrowRight, FlaskConical, FileText, Home } from 'lucide-react';
import { DiagnosticCenter } from './types';

interface DiagnosticCardProps {
  center: DiagnosticCenter;
  savedCenters?: string[];
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onShare?: (center: DiagnosticCenter, e: React.MouseEvent) => void;
  onSelect: (center: DiagnosticCenter) => void;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  center,
  savedCenters = [],
  onToggleSave,
  onShare,
  onSelect
}) => {
  const isSaved = savedCenters.includes(center.id);
  const isGovt = center.type === 'govt';

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = center.phone || '01711224455';
    window.location.href = `tel:${num}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(center)}
      className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative mb-3.5 group"
    >
      {/* Top Badges & Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="bg-emerald-50 text-[#006a4e] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
            <CheckCircle size={12} className="fill-[#006a4e] text-white" />
            ✓ ভেরিফাইড
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isGovt 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-purple-50 text-purple-700 border-purple-100'
          }`}>
            🧪 {isGovt ? 'সরকারি ডায়াগনস্টিক' : 'বেসরকারি ডায়াগনস্টিক'}
          </span>

          {center.open24Hours && (
            <span className="bg-[#006a4e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              ২৪ ঘণ্টা খোলা
            </span>
          )}
        </div>

        {/* Favorite & Share */}
        <div className="flex items-center gap-1 shrink-0">
          {onShare && (
            <button
              onClick={(e) => onShare(center, e)}
              title="শেয়ার করুন"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          )}

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(center.id, e)}
              title={isSaved ? "সংরক্ষণ বাতিল" : "সংরক্ষণ করুন"}
              className="p-1.5 rounded-full transition-colors border-none bg-transparent cursor-pointer"
            >
              <Heart
                size={18}
                className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-500"}
              />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3.5 items-start">
        {/* Image Thumbnail */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-emerald-50 shrink-0 border border-slate-100 overflow-hidden relative shadow-inner flex items-center justify-center">
          <img
            src={center.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'}
            alt={center.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1581594693702-f2323b0463b8?auto=format&fit=crop&q=80&w=800';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#006a4e] transition-colors leading-snug line-clamp-1">
            {center.name}
          </h3>

          <p className="text-xs text-slate-600 flex items-center gap-1 leading-snug truncate">
            <MapPin size={13} className="text-[#006a4e] shrink-0" />
            <span className="truncate">{center.address || `${center.union}, পুঠিয়া`}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {center.rating}
              <span className="text-slate-400 font-normal">({center.reviewCount})</span>
            </span>

            {center.establishedYear && (
              <span className="text-slate-600 font-medium">
                🏛️ {center.establishedYear}
              </span>
            )}

            {center.distance && (
              <span className="text-slate-400 font-medium ml-auto">
                📍 {center.distance}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feature Badges (Home Collection, Online Report) */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
        {center.services?.slice(0, 3).map((service, idx) => (
          <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-100">
            {service}
          </span>
        ))}
        {center.homeCollection && (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
            <Home size={10} /> হোম স্যাম্পল
          </span>
        )}
        {center.onlineReport && (
          <span className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
            <FileText size={10} /> অনলাইন রিপোর্ট
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={handleCall}
          className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
        >
          <Phone size={14} />
          <span>📞 কল করুন</span>
        </button>

        <button
          onClick={() => onSelect(center)}
          className="flex-1 py-2 px-3 bg-[#006a4e] hover:bg-[#00553e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm"
        >
          <span>বিস্তারিত</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default DiagnosticCard;

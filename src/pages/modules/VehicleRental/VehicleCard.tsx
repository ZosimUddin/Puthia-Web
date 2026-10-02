import React from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, Phone, CheckCircle, MapPin, Star, Users, ArrowRight, ShieldCheck, Fuel, Car, Navigation, Shield } from 'lucide-react';
import { Vehicle } from './types';

interface VehicleCardProps {
  vehicle: Vehicle;
  savedIds?: string[];
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onShare?: (vehicle: Vehicle, e: React.MouseEvent) => void;
  onSelect: (vehicle: Vehicle) => void;
  onOpenBooking?: (vehicle: Vehicle, e: React.MouseEvent) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  savedIds = [],
  onToggleSave,
  onShare,
  onSelect,
  onOpenBooking
}) => {
  const isSaved = savedIds.includes(vehicle.id);
  const isVerified = vehicle.provider?.isVerified;

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = vehicle.provider?.phone || '01712345678';
    window.location.href = `tel:${phone}`;
  };

  // Determine main price string
  const displayPrice = () => {
    if (vehicle.pricing.daily) return `৳${vehicle.pricing.daily.toLocaleString('bn-BD')} / দিন`;
    if (vehicle.pricing.hourly) return `৳${vehicle.pricing.hourly.toLocaleString('bn-BD')} / ঘণ্টা`;
    if (vehicle.pricing.perKm) return `৳${vehicle.pricing.perKm.toLocaleString('bn-BD')} / কিমি`;
    return 'ভাড়া আলোচনা সাপেক্ষে';
  };

  const getDriverLabel = () => {
    if (vehicle.driverOption === 'with_driver') return '👨‍✈️ ড্রাইভারসহ';
    if (vehicle.driverOption === 'without_driver') return '🚗 ড্রাইভার ছাড়া';
    return '👨‍✈️ ড্রাইভারসহ/ছাড়া';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(vehicle)}
      className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative mb-3.5 group"
    >
      {/* Top Header Badges & Actions */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isVerified ? (
            <span className="bg-emerald-50 text-[#006a4e] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
              <CheckCircle size={12} className="fill-[#006a4e] text-white" />
              ✓ ভেরিফাইড প্রোভাইডার
            </span>
          ) : (
            <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
              তালিকাভুক্ত
            </span>
          )}

          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
            <Car size={10} />
            {vehicle.typeLabel}
          </span>

          {vehicle.isAC && (
            <span className="bg-cyan-50 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-100">
              ❄️ এসি (AC)
            </span>
          )}

          {vehicle.isFeatured && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              ★ ফিচারড
            </span>
          )}
        </div>

        {/* Favorite & Share Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onShare && (
            <button
              onClick={(e) => onShare(vehicle, e)}
              title="শেয়ার করুন"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          )}

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(vehicle.id, e)}
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

      {/* Main Row: Thumbnail + Details */}
      <div className="flex gap-3.5 items-start">
        {/* Vehicle Image */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 shrink-0 border border-slate-100 overflow-hidden relative shadow-inner flex items-center justify-center">
          <img
            src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'}
            alt={vehicle.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Users size={10} />
            <span>{vehicle.seatCapacity} সিট</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#006a4e] transition-colors leading-snug line-clamp-1">
            {vehicle.name}
          </h3>

          <p className="text-xs text-slate-600 font-medium leading-tight truncate">
            🏢 {vehicle.provider?.businessName || vehicle.provider?.name}
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-1 leading-tight truncate pt-0.5">
            <MapPin size={12} className="text-[#006a4e] shrink-0" />
            <span className="truncate">{vehicle.location?.address || `${vehicle.location?.union}, পুঠিয়া`}</span>
          </p>

          {/* Key Features Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-medium text-slate-600">
            <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              {getDriverLabel()}
            </span>
            <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              ⛽ {vehicle.fuelType}
            </span>
          </div>

          {/* Rating & Pricing Row */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-600">{vehicle.rating}</span>
              <span className="text-slate-400 text-[11px]">({vehicle.reviewCount})</span>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-extrabold text-[#006a4e]">
                {displayPrice()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services offered list preview */}
      {vehicle.serviceArea && vehicle.serviceArea.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400">কভারেজ:</span>
          {vehicle.serviceArea.slice(0, 3).map((area, idx) => (
            <span key={idx} className="bg-emerald-50/70 text-[#006a4e] text-[10px] font-medium px-2 py-0.5 rounded-md">
              {area}
            </span>
          ))}
          {vehicle.serviceArea.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">+{vehicle.serviceArea.length - 3}টি এলাকা</span>
          )}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={handleCall}
          className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
        >
          <Phone size={14} />
          <span>📞 কল করুন</span>
        </button>

        {onOpenBooking && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenBooking(vehicle, e);
            }}
            className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border-none cursor-pointer"
          >
            📅 বুকিং
          </button>
        )}

        <button
          onClick={() => onSelect(vehicle)}
          className="flex-1 py-2 px-3 bg-[#006a4e] hover:bg-[#00553e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm"
        >
          <span>বিস্তারিত</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default VehicleCard;

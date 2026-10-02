import React from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, Phone, CheckCircle, MapPin, Clock, Star, Shield, ArrowRight, Ambulance } from 'lucide-react';
import { Hospital } from '../../../types';

interface HospitalCardProps {
  hospital: Hospital;
  savedHospitals?: string[];
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onShare?: (hospital: Hospital, e: React.MouseEvent) => void;
  onSelect: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  savedHospitals = [],
  onToggleSave,
  onShare,
  onSelect
}) => {
  const isSaved = savedHospitals.includes(hospital.id);
  const isVerified = hospital.isVerified !== false && hospital.verificationStatus !== 'rejected' && hospital.verificationStatus !== 'pending';

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = hospital.emergencyHotline || hospital.phone || '01712345678';
    window.location.href = `tel:${num}`;
  };

  const isGovt = hospital.type === 'সরকারি' || hospital.description?.includes('সরকারি') || hospital.name?.includes('সরকারি') || hospital.name?.includes('উপজেলা');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(hospital)}
      className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative mb-3.5 group"
    >
      {/* Top badges & Secondary actions */}
      <div className="flex items-center justify-between mb-3">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isVerified ? (
            <span className="bg-emerald-50 text-[#006a4e] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
              <CheckCircle size={12} className="fill-[#006a4e] text-white" />
              ✓ ভেরিফাইড
            </span>
          ) : (
            <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100">
              যাচাইাধীন
            </span>
          )}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isGovt 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-purple-50 text-purple-700 border-purple-100'
          }`}>
            🏥 {hospital.type || (isGovt ? 'সরকারি হাসপাতাল' : 'বেসরকারি হাসপাতাল')}
          </span>

          {(hospital.hasEmergency24h || hospital.openingTime?.includes('২৪')) && (
            <span className="bg-[#006a4e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              🚑 ২৪ ঘণ্টা জরুরি সেবা
            </span>
          )}
        </div>

        {/* Favorite & Share buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onShare && (
            <button
              onClick={(e) => onShare(hospital, e)}
              title="শেয়ার করুন"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <Share2 size={16} />
            </button>
          )}

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(hospital.id, e)}
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

      {/* Main content body */}
      <div className="flex gap-3.5 items-start">
        {/* Hospital Thumbnail / Logo */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-emerald-50 shrink-0 border border-slate-100 overflow-hidden relative shadow-inner flex items-center justify-center">
          <img
            src={hospital.imageUrl || hospital.logoUrl || `https://picsum.photos/seed/${hospital.id}/400/400`}
            alt={hospital.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://picsum.photos/seed/${hospital.id}/400/400`;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#006a4e] transition-colors leading-snug line-clamp-1">
            {hospital.name}
          </h3>

          <p className="text-xs text-slate-600 flex items-center gap-1 leading-snug truncate">
            <MapPin size={13} className="text-[#006a4e] shrink-0" />
            <span className="truncate">{hospital.address || `ইউনিয়ন: ${hospital.union}, পুঠিয়া`}</span>
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {hospital.rating || 4.7}
              <span className="text-slate-400 font-normal">({hospital.reviewCount || 85})</span>
            </span>

            {hospital.bedCount && (
              <span className="text-slate-600 font-medium">
                🛏️ {hospital.bedCount} শয্যা
              </span>
            )}

            {hospital.distance && (
              <span className="text-slate-400 font-medium ml-auto">
                📍 {hospital.distance}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Facilities & Departments snippet */}
      {(hospital.departments?.length > 0 || hospital.facilities?.length > 0) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
          {hospital.departments?.slice(0, 3).map((dept, idx) => (
            <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-100">
              {dept}
            </span>
          ))}
          {hospital.hasAmbulance && (
            <span className="bg-red-50 text-red-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1">
              <Ambulance size={10} /> অ্যাম্বুলেন্স
            </span>
          )}
          {(hospital.departments?.length || 0) > 3 && (
            <span className="text-slate-400 text-[10px] font-medium px-1 py-0.5">
              +{(hospital.departments.length - 3)} আরও
            </span>
          )}
        </div>
      )}

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
          onClick={() => onSelect(hospital)}
          className="flex-1 py-2 px-3 bg-[#006a4e] hover:bg-[#00553e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-sm"
        >
          <span>বিস্তারিত</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default HospitalCard;

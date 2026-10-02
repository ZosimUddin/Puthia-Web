import React from 'react';
import { motion } from 'motion/react';
import { Heart, Phone, MapPin, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { Doctor } from '../../../types';

interface DoctorCardProps {
  doctor: Doctor;
  isAvailableToday?: boolean;
  savedDoctors?: string[];
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onShare?: (doctor: Doctor, e: React.MouseEvent) => void;
  onSelect: (doctor: Doctor) => void;
  onBookAppointment?: (doctor: Doctor, e: React.MouseEvent) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  savedDoctors = [],
  onToggleSave,
  onSelect,
}) => {
  const isSaved = savedDoctors.includes(doctor.id);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = doctor.contactNumber || doctor.phone;
    if (num) {
      window.location.href = `tel:${num}`;
    }
  };

  const isVerified = doctor.isVerified === true || doctor.verificationStatus === 'verified';
  const degrees = doctor.degrees || doctor.qualifications || doctor.degree;
  const workplace = doctor.workplace || doctor.chamberName;
  const address = doctor.chamberAddress || (doctor as Record<string, any>).address || 'পুঠিয়া, রাজশাহী';
  const specialityTitle = (doctor as Record<string, any>).specialityTitle || doctor.speciality || doctor.specialization || 'মেডিসিন বিশেষজ্ঞ';
  const chamberTimeStr = doctor.chamberTime || 'প্রতি দিন সন্ধ্যা ৬টা - ৯টা';
  const ratingVal = typeof doctor.rating === 'number' && doctor.rating > 0 ? doctor.rating : 4.8;
  const reviewCountVal = doctor.reviewCount && doctor.reviewCount > 0 ? doctor.reviewCount : 45;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(doctor)}
      className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 hover:shadow-md transition-all cursor-pointer relative mb-3.5 space-y-3"
    >
      {/* Top Main Section */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Doctor Photo */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-50/60 overflow-hidden border border-slate-100 flex items-center justify-center text-3xl">
            {doctor.imageUrl ? (
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>👨‍⚕️</span>
            )}
          </div>
        </div>

        {/* Doctor Info Middle */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight line-clamp-2">
              {doctor.name}
            </h3>
            {isVerified && (
              <span className="bg-emerald-50 text-[#006a4e] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 shrink-0">
                <ShieldCheck size={12} className="text-[#006a4e]" />
                যাচাইকৃত
              </span>
            )}
          </div>

          {degrees && (
            <p className="text-xs text-slate-500 font-medium line-clamp-2">
              {degrees}
            </p>
          )}

          <p className="text-xs font-bold text-[#006a4e] line-clamp-2">
            {specialityTitle}
          </p>

          {workplace && (
            <p className="text-xs font-bold text-slate-700 flex items-start gap-1 leading-snug line-clamp-2">
              <span className="text-sm shrink-0">🏥</span>
              <span className="line-clamp-2">{workplace}</span>
            </p>
          )}

          <p className="text-[11px] text-slate-500 flex items-start gap-1 font-medium leading-snug line-clamp-2">
            <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{address}</span>
          </p>
        </div>

        {/* Doctor Right Info (Rating & Save) */}
        <div className="text-right shrink-0 space-y-2">
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => onToggleSave(doctor.id, e)}
              className="p-1 rounded-full text-slate-300 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer inline-block"
            >
              <Heart
                size={18}
                className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-300"}
              />
            </button>
          )}

          <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
            <span>⭐</span>
            <span>{ratingVal.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({reviewCountVal})</span>
          </div>

          <div className="text-[10px] text-slate-500 max-w-[130px] leading-tight text-right font-medium">
            <span className="flex items-center justify-end gap-1 text-slate-600 font-bold">
              <Clock size={11} className="text-slate-400" />
              <span>চেম্বারের সময়</span>
            </span>
            <span className="block text-slate-500 mt-0.5">{chamberTimeStr}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleCall}
          className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Phone size={13} className="text-slate-600" />
          <span>কল করুন</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (doctor.googleMapUrl) {
              window.open(doctor.googleMapUrl, '_blank');
            } else {
              onSelect(doctor);
            }
          }}
          className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <MapPin size={13} className="text-slate-600" />
          <span>লোকেশন</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(doctor)}
          className="py-2 px-2 bg-[#006a4e] hover:bg-[#00523d] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 border-none cursor-pointer"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

export default DoctorCard;

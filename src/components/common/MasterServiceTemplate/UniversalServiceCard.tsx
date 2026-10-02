import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Heart, Phone, MapPin, Clock, Star, ShieldCheck, ArrowRight,
  Building2, CheckCircle2, AlertTriangle, XCircle, Stethoscope, Activity, Edit3,
  Play, Share2
} from 'lucide-react';
import { ServiceConfig } from '../../../config/servicesConfig';
import { UniversalReportButton } from '../UniversalReportButton';
import { SuggestCorrectionModal } from './SuggestCorrectionModal';

interface UniversalServiceCardProps {
  item: Record<string, any>;
  config: ServiceConfig;
  isSaved?: boolean;
  onToggleSave?: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: Record<string, any>) => void;
}

export const UniversalServiceCard: React.FC<UniversalServiceCardProps> = ({
  item,
  config,
  isSaved = false,
  onToggleSave,
  onSelect,
}) => {
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const schema = config.fieldsSchema;

  const title = item[schema.nameKey] || item.name || item.title || item.spotName || item.institutionName || 'শিরোনাম নেই';
  const speciality = schema.specialityKey ? item[schema.specialityKey] : (item.speciality || item.category || item.type);
  const workplace = schema.workplaceKey ? item[schema.workplaceKey] : (item.workplace || item.chamberName || item.companyName || item.ownerName);
  const address = schema.addressKey ? item[schema.addressKey] : (item.address || item.location || item.chamberAddress || 'পুঠিয়া, রাজশাহী');
  const phone = schema.phoneKey ? item[schema.phoneKey] : (item.phone || item.contactNumber);
  const rawTime = schema.timeKey ? item[schema.timeKey] : (item.chamberTime || item.openHours || item.visitingHours || item.availability || item.openingHours);
  const timeStr = typeof rawTime === 'object' && rawTime !== null
    ? `${rawTime.open || ''} - ${rawTime.close || ''}`.trim() || 'খোলা আছে'
    : (rawTime || 'সেবা সময় উপলব্ধ');
  const degrees = schema.degreesKey ? item[schema.degreesKey] : (item.degrees || item.experience || item.qualifications);
  const isVideoService = config.id === 'video' || config.collectionName === 'videos';
  const videoUrl = item.videoUrl || item.url;
  const youtubeThumbnail = useMemo(() => {
    if (!videoUrl) return null;
    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  }, [videoUrl]);

  const rawImage = schema.imageKey ? item[schema.imageKey] : (item.imageUrl || item.image || item.photo);
  const imageUrl = rawImage || youtubeThumbnail || (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
  const mapUrl = schema.mapUrlKey ? item[schema.mapUrlKey] : (item.googleMapUrl || item.mapUrl);

  const status = item.status;
  const isClosed = status === 'closed';
  const isNeedsVerification = status === 'needs_verification';
  const isVerified = status === 'verified' || item.isVerified === true || item.verificationStatus === 'verified' || item.status === 'approved';

  const doctorCount = Array.isArray(item.doctorsList) ? item.doctorsList.length : 0;
  const hasEmergency = item.hasEmergency24h === true || (item.emergency && String(item.emergency).includes('২৪'));

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      onSelect(item);
    }
  };

  const handleLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapUrl) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    } else {
      onSelect(item);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      aria-label={`${title} বিস্তারিত দেখুন`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border transition-all cursor-pointer relative mb-3.5 space-y-3 group focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/40 ${
        isClosed ? 'border-rose-100 bg-rose-50/20' : isNeedsVerification ? 'border-amber-100' : 'border-slate-100 hover:border-emerald-100'
      }`}
    >
      {/* Top Section */}
      <div className="flex gap-3.5 sm:gap-4.5 items-start">
        {/* Photo or Icon with smooth lazy load */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-slate-100/60 overflow-hidden border border-slate-100/90 flex items-center justify-center text-3xl shadow-2xs group-hover:border-emerald-200 transition-colors">
            {imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={imageUrl}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {isVideoService && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md">
                      <Play size={14} className="fill-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <span className="select-none text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110">
                {config.icon || '📌'}
              </span>
            )}
          </div>
        </div>

        {/* Middle Details */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Status and Badges Line */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm md:text-3xl font-black text-slate-900 leading-tight group-hover:text-[#006a4e] transition-colors line-clamp-2">
              {title}
            </h3>

            {isClosed ? (
              <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 shrink-0">
                <XCircle size={11} className="text-rose-600" />
                <span>🔴 বন্ধ/নিষ্ক্রিয়</span>
              </span>
            ) : isNeedsVerification ? (
              <span className="bg-amber-50 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 shrink-0">
                <AlertTriangle size={11} className="text-amber-600" />
                <span>🟡 তথ্য যাচাই প্রয়োজন</span>
              </span>
            ) : isVerified ? (
              <span className="bg-emerald-50 text-[#006a4e] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/70 shrink-0 shadow-2xs">
                <ShieldCheck size={12} className="text-[#006a4e]" />
                <span>🟢 {item.verificationBadge || 'যাচাইকৃত'}</span>
              </span>
            ) : null}
          </div>

          {degrees && (
            <p className="text-xs md:text-xl text-slate-600 font-medium leading-snug line-clamp-2">
              {degrees}
            </p>
          )}

          {speciality && (
            <p className="text-xs md:text-xl font-bold text-[#006a4e] leading-snug line-clamp-2">
              {speciality}
            </p>
          )}

          {workplace && (
            <p className="text-xs md:text-xl font-bold text-slate-700 flex items-start gap-1 leading-snug line-clamp-2">
              <Building2 size={13} className="text-slate-400 shrink-0 mt-0.5 md:mt-1.5" />
              <span className="line-clamp-2">{workplace}</span>
            </p>
          )}

          {address && (
            <p className="text-[11px] md:text-lg text-slate-500 flex items-start gap-1 font-medium leading-snug line-clamp-2">
              <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5 md:mt-1" />
              <span className="line-clamp-2">{address}</span>
            </p>
          )}

          {/* Quick Features Row (Doctor Count / Emergency / Verification Date / Correction) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {doctorCount > 0 && (
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                <Stethoscope size={11} className="text-blue-600" />
                <span>{doctorCount} জন কনসালটেন্ট</span>
              </span>
            )}

            {hasEmergency && (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-1">
                <Activity size={11} className="text-emerald-600" />
                <span>🚨 ২৪/৭ জরুরি সুবিধা</span>
              </span>
            )}

            {item.lastVerifiedDate && (
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-700" />
                <span>যাচাই: {item.lastVerifiedDate}</span>
              </span>
            )}


          </div>
        </div>

        {/* Right Info (Time Schedule if available) */}
        {timeStr && (
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-500 max-w-[120px] sm:max-w-[140px] leading-tight text-right font-medium hidden xs:block">
              <span className="flex items-center justify-end gap-1 text-slate-600 font-bold">
                <Clock size={11} className="text-slate-400" />
                <span>সময়সূচী</span>
              </span>
              <span className="block text-slate-500 mt-0.5 truncate">{timeStr}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Row with Micro-Interactions */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100/90">
        {isVideoService ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (videoUrl) {
                  window.open(videoUrl, '_blank', 'noopener,noreferrer');
                } else {
                  onSelect(item);
                }
              }}
              className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 active:scale-97 text-[#006a4e] font-bold text-xs md:text-sm rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/20"
            >
              <Play size={13} className="fill-[#006a4e] shrink-0" />
              <span>ভিডিও দেখুন</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: title,
                    text: `${title} - আমাদের পুঠিয়া`,
                    url: videoUrl || window.location.href,
                  }).catch(() => {});
                } else if (videoUrl) {
                  navigator.clipboard?.writeText(videoUrl);
                  alert('ভিডিও লিংক কপি করা হয়েছে!');
                }
              }}
              className="py-2.5 px-2 bg-slate-50/80 hover:bg-slate-100 active:scale-97 text-slate-700 font-bold text-xs md:text-sm rounded-xl border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/20"
            >
              <Share2 size={13} className="text-slate-600 shrink-0" />
              <span>শেয়ার</span>
            </button>

            <button
              type="button"
              onClick={() => onSelect(item)}
              className="py-2.5 px-2 bg-[#006a4e] hover:bg-[#00543e] active:scale-97 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1 border-none cursor-pointer group-hover:bg-[#00543e] focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/40"
            >
              <span>বিস্তারিত</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCall}
              className="py-2.5 px-2 bg-slate-50/80 hover:bg-slate-100 active:scale-97 text-slate-700 font-bold text-xs md:text-sm rounded-xl border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/20"
            >
              <Phone size={13} className="text-emerald-700 shrink-0" />
              <span>কল করুন</span>
            </button>

            <button
              type="button"
              onClick={handleLocation}
              className="py-2.5 px-2 bg-slate-50/80 hover:bg-slate-100 active:scale-97 text-slate-700 font-bold text-xs md:text-sm rounded-xl border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/20"
            >
              <MapPin size={13} className="text-blue-600 shrink-0" />
              <span>লোকেশন</span>
            </button>

            <button
              type="button"
              onClick={() => onSelect(item)}
              className="py-2.5 px-2 bg-[#006a4e] hover:bg-[#00543e] active:scale-97 text-white font-black text-xs md:text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1 border-none cursor-pointer group-hover:bg-[#00543e] focus:outline-hidden focus:ring-2 focus:ring-[#006a4e]/40"
            >
              <span>বিস্তারিত</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      {showCorrectionModal && (
        <SuggestCorrectionModal
          isOpen={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          target={{
            id: item.id,
            title: title,
            serviceId: config.id,
            serviceTitle: config.title,
            collectionName: config.collectionName,
            currentPhone: phone,
            currentAddress: address,
            currentHours: timeStr,
          }}
        />
      )}
    </motion.article>
  );
};

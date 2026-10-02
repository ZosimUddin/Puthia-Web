import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, MessageSquare, CheckCircle, MapPin, Star, Car, Shield, Building2 } from 'lucide-react';
import { Vehicle } from './types';

interface ProviderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  allVehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
}

export const ProviderProfileModal: React.FC<ProviderProfileModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  allVehicles,
  onSelectVehicle
}) => {
  if (!isOpen || !vehicle) return null;

  const provider = vehicle.provider;
  const providerVehicles = allVehicles.filter(v => v.provider?.businessName === provider?.businessName || v.provider?.id === provider?.id);

  const handleCall = () => {
    const phone = provider?.phone || '01712345678';
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    const wa = provider?.whatsapp || provider?.phone || '01712345678';
    const cleanWa = wa.replace(/[^\d]/g, '');
    window.open(`https://wa.me/88${cleanWa}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
            <h3 className="text-sm font-bold text-slate-900">প্রোভাইডার প্রোফাইল</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            
            {/* Top Profile Card */}
            <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3.5">
              <img
                src={provider?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                alt={provider?.businessName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                    {provider?.businessName}
                  </h2>
                  {provider?.isVerified && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <CheckCircle size={10} /> ভেরিফাইড
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  মালিক / প্রতিনিধি: {provider?.name}
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin size={12} className="text-[#006a4e]" />
                  <span>{provider?.address || provider?.serviceArea}</span>
                </p>

                <div className="flex items-center gap-3 text-xs pt-1">
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {provider?.rating || 4.8}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-bold">
                    মোট {providerVehicles.length} টি গাড়ি তালিকাভুক্ত
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCall}
                className="py-2.5 px-3 bg-[#006a4e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border-none cursor-pointer shadow-sm"
              >
                <Phone size={14} />
                <span>📞 সরাসরী কল</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border-none cursor-pointer shadow-sm"
              >
                <MessageSquare size={14} />
                <span>WhatsApp মেসেজ</span>
              </button>
            </div>

            {/* Available Vehicles Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Car size={15} className="text-[#006a4e]" />
                এই প্রোভাইডারের উপলব্ধ গাড়িসমূহ ({providerVehicles.length})
              </h3>

              <div className="space-y-2">
                {providerVehicles.map(v => (
                  <div
                    key={v.id}
                    onClick={() => {
                      onSelectVehicle(v);
                      onClose();
                    }}
                    className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#006a4e] flex items-center justify-between cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {v.typeLabel} • {v.seatCapacity} সিট {v.isAC ? '• এসি' : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-[#006a4e]">
                      {v.pricing.daily ? `৳${v.pricing.daily}/দিন` : 'বিস্তারিত'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProviderProfileModal;

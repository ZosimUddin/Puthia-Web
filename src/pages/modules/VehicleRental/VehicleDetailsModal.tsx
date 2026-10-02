import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Phone, MessageSquare, Calendar, MapPin, Star, Users, CheckCircle, 
  Share2, Heart, ShieldCheck, Fuel, Car, Info, AlertTriangle, ChevronRight, 
  Check, ExternalLink, Award, FileText, ArrowRight, User
} from 'lucide-react';
import { Vehicle } from './types';
import { sampleReviews } from './data';
import { toast } from 'sonner';

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenBooking: (vehicle: Vehicle) => void;
  onOpenReport: (vehicle: Vehicle) => void;
  onOpenProvider: (vehicle: Vehicle) => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  onClose,
  onOpenBooking,
  onOpenReport,
  onOpenProvider
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'reviews' | 'rules'>('info');

  if (!vehicle) return null;

  const images = vehicle.gallery && vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.imageUrl];

  const handleCall = () => {
    const phone = vehicle.provider?.phone || '01712345678';
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    const wa = vehicle.provider?.whatsapp || vehicle.provider?.phone || '01712345678';
    const cleanWa = wa.replace(/[^\d]/g, '');
    const msg = encodeURIComponent(`আসসালামু আলাইকুম, আমি ${vehicle.name} ভাড়া করার বিষয়ে তথ্য জানতে চাই।`);
    window.open(`https://wa.me/88${cleanWa}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: vehicle.name,
        text: `${vehicle.name} - ${vehicle.provider?.businessName}, পুঠিয়া।`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="bg-emerald-100 text-[#006a4e] text-xs font-bold px-2.5 py-1 rounded-lg">
                {vehicle.typeLabel}
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
                {vehicle.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition border-none bg-transparent cursor-pointer"
                title="শেয়ার"
              >
                <Share2 size={18} />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-slate-50/50">
            
            {/* Gallery Image Box */}
            <div className="space-y-2">
              <div className="w-full h-52 sm:h-64 rounded-2xl bg-slate-100 overflow-hidden relative shadow-inner">
                <img
                  src={images[activeImageIndex]}
                  alt={vehicle.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {vehicle.isAC && (
                  <span className="absolute top-3 left-3 bg-cyan-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                    ❄️ এসি (Air Conditioned)
                  </span>
                )}

                {vehicle.provider?.isVerified && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <CheckCircle size={12} /> ভেরিফাইড প্রোভাইডার
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#006a4e] scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Buttons Bar */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCall}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#006a4e] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border-none cursor-pointer"
              >
                <Phone size={15} />
                <span>কল করুন</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition border-none cursor-pointer shadow-xs"
              >
                <MessageSquare size={15} />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => onOpenBooking(vehicle)}
                className="py-2.5 px-3 bg-[#006a4e] hover:bg-[#00553e] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition border-none cursor-pointer shadow-md"
              >
                <Calendar size={15} />
                <span>বুকিং অনুরোধ</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-4">
              {[
                { id: 'info', label: 'গাড়ির বিবরণ' },
                { id: 'pricing', label: 'ভাড়ার রেট' },
                { id: 'rules', label: 'নিয়মকানুন' },
                { id: 'reviews', label: `রিভিউ (${vehicle.reviewCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 text-xs font-bold border-b-2 transition cursor-pointer bg-transparent border-none ${
                    activeTab === tab.id
                      ? 'border-[#006a4e] text-[#006a4e]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Info */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                
                {/* Provider Card Snippet */}
                <div
                  onClick={() => onOpenProvider(vehicle)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-200 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={vehicle.provider?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt="Provider"
                      className="w-11 h-11 rounded-full object-cover border border-emerald-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{vehicle.provider?.businessName}</h4>
                        {vehicle.provider?.isVerified && (
                          <CheckCircle size={13} className="text-[#006a4e] fill-emerald-100" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">মালিক: {vehicle.provider?.name} • {vehicle.provider?.serviceArea}</p>
                    </div>
                  </div>

                  <span className="text-xs text-[#006a4e] font-bold flex items-center gap-0.5">
                    প্রোফাইল <ChevronRight size={14} />
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Car size={15} className="text-[#006a4e]" />
                    গাড়ির স্পেসিফিকেশন
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">ব্র্যান্ড ও মডেল</span>
                      <span className="font-bold text-slate-800">{vehicle.brand} {vehicle.model}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">মডেল বছর</span>
                      <span className="font-bold text-slate-800">{vehicle.modelYear}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">আসন ক্ষমতা</span>
                      <span className="font-bold text-slate-800">{vehicle.seatCapacity} জন</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">এয়ারকন্ডিশন</span>
                      <span className="font-bold text-slate-800">{vehicle.isAC ? 'এসি (AC)' : 'নন-এসি (Non-AC)'}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">ফুয়েল টাইপ</span>
                      <span className="font-bold text-slate-800">{vehicle.fuelType}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">ড্রাইভার সুবিধা</span>
                      <span className="font-bold text-slate-800">
                        {vehicle.driverOption === 'with_driver' ? 'ড্রাইভারসহ' : 'ড্রাইভার ছাড়া'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                    <h3 className="text-xs font-bold text-slate-800">বিস্তারিত তথ্য</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{vehicle.description}</p>
                  </div>
                )}

                {/* Driver Info if exists */}
                {vehicle.driverInfo && (
                  <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#006a4e] text-white flex items-center justify-center font-bold">
                        👨‍✈️
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{vehicle.driverInfo.name}</h4>
                        <p className="text-[11px] text-slate-600">{vehicle.driverInfo.experience} • লাইসেন্স ভেরিফাইড</p>
                      </div>
                    </div>

                    <button
                      onClick={handleCall}
                      className="py-1.5 px-3 bg-[#006a4e] text-white rounded-xl text-xs font-bold border-none cursor-pointer"
                    >
                      ড্রাইভারকে কল
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Tab 2: Pricing */}
            {activeTab === 'pricing' && (
              <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-800">ভাড়ার তালিকা ও রেট</h3>
                
                <div className="space-y-2">
                  {vehicle.pricing.daily && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">দৈনিক চুক্তি (Full Day)</span>
                      <span className="text-xs font-black text-[#006a4e]">৳{vehicle.pricing.daily.toLocaleString('bn-BD')} / দিন</span>
                    </div>
                  )}

                  {vehicle.pricing.hourly && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">ঘণ্টাভিত্তিক ভাড়ার হার</span>
                      <span className="text-xs font-black text-[#006a4e]">৳{vehicle.pricing.hourly.toLocaleString('bn-BD')} / ঘণ্টা</span>
                    </div>
                  )}

                  {vehicle.pricing.perKm && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">প্রতি কিলোমিটার হিসাব</span>
                      <span className="text-xs font-black text-[#006a4e]">৳{vehicle.pricing.perKm.toLocaleString('bn-BD')} / কিমি</span>
                    </div>
                  )}

                  {vehicle.pricing.monthly && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">মাসিক চুক্তি</span>
                      <span className="text-xs font-black text-[#006a4e]">৳{vehicle.pricing.monthly.toLocaleString('bn-BD')} / মাস</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 italic pt-1">
                  * বিশেষ নোট: দূরত্ব, জ্বালানি ও রুটের ভিত্তিতে ভাড়া কিছুটা পরিবর্তিত হতে পারে। চূড়ান্ত ভাড়ার জন্য সরাসরি প্রোভাইডারের সাথে কথা বলুন।
                </p>
              </div>
            )}

            {/* Tab 3: Rules & Policies */}
            {activeTab === 'rules' && (
              <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="text-xs font-extrabold text-slate-800">গাড়ির নিয়মাবলী ও পলিসি</h3>

                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                  <li>ন্যূনতম বুকিং সময়: {vehicle.rules.minBookingHours || 2} ঘণ্টা।</li>
                  <li>সর্বোচ্চ যাত্রী ধারণক্ষমতা: {vehicle.seatCapacity} জন।</li>
                  <li>জ্বালানি খরচ: {vehicle.rules.fuelIncluded ? 'ভাড়ার অন্তর্ভুক্ত' : 'ভাড়ার অন্তর্ভুক্ত নয় (আলাদা প্রদান করতে হবে)'}</li>
                  <li>টোল ও পার্কিং চার্জ: {vehicle.rules.tollIncluded ? 'অন্তর্ভুক্ত' : 'যাত্রী কর্তৃক প্রদেয়'}</li>
                  <li>বাতিলকরণ পলিসি: {vehicle.rules.cancellationPolicy || 'যাত্রার ১২ ঘণ্টা পূর্বে বাতিলের সুযোগ রয়েছে।'}</li>
                </ul>

                {/* Safety Guidelines */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <ShieldCheck size={16} />
                    <span>নিরাপদ ভাড়ার টিপস</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    অগ্রিম লেনদেনের ক্ষেত্রে প্রোভাইডারের ভেরিফাইড ব্যাজ যাচাই করুন এবং ভাড়ার রসিদ ও রুট সংক্রান্ত বিষয়াবলি শুরুতেই আলোচনা করে নিন।
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">গ্রাহকদের মতামত</h3>
                    <div className="flex items-center gap-1 text-sm pt-0.5">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span className="font-extrabold text-amber-600">{vehicle.rating}</span>
                      <span className="text-xs text-slate-400">({vehicle.reviewCount} টি রিভিউ)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {sampleReviews.map(rev => (
                    <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Incorrect Info Button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => onOpenReport(vehicle)}
                className="text-xs text-rose-600 font-bold hover:underline border-none bg-transparent cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <AlertTriangle size={13} />
                <span>তথ্য ভুল মনে হচ্ছে? সংশোধনের অনুরোধ করুন</span>
              </button>
            </div>

          </div>

          {/* Sticky Bottom Bar */}
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-20 flex items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">ভাড়ার বিবরণ</span>
              <span className="text-sm sm:text-base font-black text-[#006a4e]">
                {vehicle.pricing.daily ? `৳${vehicle.pricing.daily} / দিন` : 'আলোচনা সাপেক্ষে'}
              </span>
            </div>

            <button
              onClick={() => onOpenBooking(vehicle)}
              className="py-3 px-6 bg-[#006a4e] hover:bg-[#00553e] text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>বুকিং অনুরোধ পাঠান</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VehicleDetailsModal;

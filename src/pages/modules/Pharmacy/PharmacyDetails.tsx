import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Phone, Clock, Truck, ShieldCheck, CreditCard, 
  Star, Share2, Heart, Info, CheckCircle, ExternalLink, User, ShoppingBag
} from 'lucide-react';
import { Pharmacy } from '../../../types';
import { PHARMACY_CATEGORIES } from './constants';

interface PharmacyDetailsProps {
  pharmacy: Pharmacy;
  onClose: () => void;
}

export default function PharmacyDetails({ pharmacy, onClose }: PharmacyDetailsProps) {
  const cat = PHARMACY_CATEGORIES.find(c => c.id === pharmacy.category);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[40px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side: Visuals */}
        <div className="w-full md:w-2/5 bg-slate-100 relative">
          <img 
            src={pharmacy.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(pharmacy.name)}&background=047857&color=fff&size=512`}
            alt={pharmacy.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 flex gap-2">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-emerald-700 uppercase tracking-widest shadow-sm">
              {cat?.label}
            </div>
            {pharmacy.is24Hours && (
              <div className="px-3 py-1 bg-rose-500/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                ২৪ ঘণ্টা খোলা
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 md:hidden w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-800 shadow-sm border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right Side: Info */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                {pharmacy.name}
                {pharmacy.rating > 4.5 && <CheckCircle size={20} className="text-blue-500 fill-blue-500/10" />}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < Math.floor(pharmacy.rating) ? "fill-amber-400 text-emerald-500" : "text-slate-200"} 
                    />
                  ))}
                  <span className="text-xs font-black text-slate-400 ml-1">{pharmacy.rating} ({pharmacy.reviewCount} রিভিউ)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {pharmacy.views} ভিউ
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:flex w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all border-none cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <User size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">মালিক/ব্যবস্থাপক</span>
                </div>
                <p className="text-sm font-black text-slate-800">{pharmacy.ownerName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Clock size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">সময়সূচী</span>
                </div>
                <p className="text-sm font-black text-slate-800">
                  {pharmacy.is24Hours ? "২৪ ঘণ্টা খোলা" : `${pharmacy.openingTime} - ${pharmacy.closingTime}`}
                </p>
              </div>
            </div>

            {/* Address & Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" /> অবস্থান ও যোগাযোগ
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-emerald-100">
                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                  {pharmacy.address}, {pharmacy.union}, পুঠিয়া, রাজশাহী।
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a 
                    href={`tel:${pharmacy.contactNumber}`}
                    className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:underline"
                  >
                    <Phone size={16} /> {pharmacy.contactNumber}
                  </a>
                  {pharmacy.googleMapUrl && (
                    <a 
                      href={pharmacy.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 font-black text-sm hover:underline"
                    >
                      <ExternalLink size={16} /> গুগল ম্যাপ
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Services & Facilities */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> সুবিধা ও সেবা
              </h3>
              <div className="flex flex-wrap gap-2">
                {pharmacy.hasPharmacist && (
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black flex items-center gap-2">
                    <CheckCircle size={14} /> নিবন্ধিত ফার্মাসিস্ট
                  </div>
                )}
                {pharmacy.hasHomeDelivery && (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black flex items-center gap-2">
                    <Truck size={14} /> হোম ডেলিভারি
                  </div>
                )}
                {pharmacy.paymentMethods.map(method => (
                  <div key={method} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black flex items-center gap-2">
                    <CreditCard size={14} /> {method} পেমেন্ট
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pharmacy.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {service}
                  </div>
                ))}
              </div>
            </div>

            {/* Instruction */}
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> গুরুত্বপূর্ণ নির্দেশনা
              </h4>
              <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">
                প্রেসক্রিপশন ছাড়া প্রেসক্রিপশন-নির্ভর ওষুধ গ্রহণ করবেন না। ওষুধ ব্যবহারের আগে চিকিৎসক বা নিবন্ধিত ফার্মাসিস্টের পরামর্শ নিন। কোনো তথ্য ভুল দেখলে আমাদের রিপোর্ট করুন।
              </p>
            </div>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex gap-4">
            <a 
              href={`tel:${pharmacy.contactNumber}`}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Phone size={18} /> কল করুন
            </a>
            <button 
              className="px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Eye({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

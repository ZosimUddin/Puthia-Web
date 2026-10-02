import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, 
  Phone, Globe, MapPin, Camera, Info, 
  ExternalLink, PhoneCall, CheckCircle, Share2, Star
} from 'lucide-react';
import { UniversalReportButton } from './UniversalReportButton';

interface ContactInfo {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SubMenuDetailLayoutProps {
  id?: string;
  category?: string;
  title: string;
  description: string;
  coverImage?: string;
  contactInfo?: ContactInfo[];
  mapLocation?: string; // Google Maps Embed URL or descriptive address
  photoGallery?: string[];
  callNumber?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  isFeatured?: boolean;
  featuredText?: string;
}

export const SubMenuDetailLayout: React.FC<SubMenuDetailLayoutProps> = ({
  id,
  category = "submenu_service",
  title,
  description,
  coverImage = "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=1200",
  contactInfo = [],
  mapLocation,
  photoGallery = [],
  callNumber,
  websiteUrl,
  facebookUrl,
  isFeatured = false,
  featuredText = "বিশেষ ফিচারড"
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* 🖼️ Cover Banner */}
      <div className="relative h-64 sm:h-96 rounded-[32px] overflow-hidden shadow-xl border border-white/10 group">
        <img 
          src={coverImage} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {isFeatured && (
              <span className="bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                <Star size={12} fill="currentColor" />
                {featuredText}
              </span>
            )}
            <span className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
              বিস্তারিত তথ্য
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-sm">{title}</h1>
        </div>

        {/* Floating Action Buttons over Banner */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 backdrop-blur-md border rounded-2xl transition-all cursor-pointer ${isFavorite ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            aria-label="Favorite"
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
          <button 
            onClick={() => navigator.share?.({ title, text: description, url: window.location.href }).catch(() => {})}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
          <div className="p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
            <UniversalReportButton
              contentId={id || title}
              contentType={category}
              contentTitle={title}
              variant="icon"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Description & Gallery */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 📖 পরিচিতি/বিবরণ */}
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Info size={20} />
              </div>
              পরিচিতি ও বিবরণ
            </h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </section>

          {/* 🖼️ Photo Gallery */}
          {photoGallery.length > 0 && (
            <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Camera size={20} />
                </div>
                ফটো গ্যালারি
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photoGallery.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                  >
                    <img 
                      src={img} 
                      alt={`${title} Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* 📍 Google Map Location */}
          {mapLocation && (
            <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin size={20} />
                </div>
                অবস্থান ও ম্যাপ
              </h3>
              <div className="rounded-[24px] overflow-hidden border border-slate-100 shadow-inner bg-slate-50 h-80 relative">
                {mapLocation.startsWith('http') ? (
                  <iframe 
                    title="Location Map"
                    src={mapLocation} 
                    className="w-full h-full border-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="p-4 bg-white rounded-full shadow-md text-blue-500 mb-4">
                      <MapPin size={32} />
                    </div>
                    <p className="text-slate-600 font-bold">{mapLocation}</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-200 no-underline"
                    >
                      গুগল ম্যাপে দেখুন
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar info & Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Card */}
          <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl shadow-slate-900/20 border border-slate-800 space-y-6">
            <h4 className="text-lg font-black text-white/90 border-b border-white/10 pb-4">সরাসরি যোগাযোগ</h4>
            
            <div className="space-y-4">
              {callNumber && (
                <a 
                  href={`tel:${callNumber}`}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 no-underline cursor-pointer group"
                >
                  <PhoneCall size={20} className="group-hover:animate-bounce" />
                  সরাসরি কল করুন
                </a>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {websiteUrl && (
                  <a 
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all no-underline cursor-pointer"
                  >
                    <Globe size={16} />
                    অফিসিয়াল ওয়েবসাইট
                  </a>
                )}
                {facebookUrl && (
                  <a 
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all no-underline cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    ফেসবুক পেজ
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">ভেরিফাইড তথ্য</span>
              </div>
            </div>
          </div>

          {/* 📇 Contact Information Details */}
          {contactInfo.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4">গুরুত্বপূর্ণ তথ্য</h4>
              <div className="space-y-5">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                      {info.icon || <Info size={16} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">{info.label}</span>
                      <span className="text-sm font-bold text-slate-700 leading-snug">{info.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

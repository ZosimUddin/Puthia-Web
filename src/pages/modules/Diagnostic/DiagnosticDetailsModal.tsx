import React, { useState } from 'react';
import { DiagnosticCenter } from './types';
import { 
  ArrowLeft, Heart, Share2, Phone, MapPin, Bookmark, 
  CheckCircle2, Clock, Calendar, Check, MessageSquare, 
  FileText, ShieldCheck, Stethoscope 
} from 'lucide-react';

interface DiagnosticDetailsModalProps {
  center: DiagnosticCenter | null;
  onClose: () => void;
  onOpenReviews: () => void;
  onOpenTests: () => void;
  onOpenLocation: () => void;
  onOpenBooking: () => void;
}

export const DiagnosticDetailsModal: React.FC<DiagnosticDetailsModalProps> = ({
  center,
  onClose,
  onOpenReviews,
  onOpenTests,
  onOpenLocation,
  onOpenBooking
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!center) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: center.name,
        text: `${center.name} - ${center.address}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${center.name} - ${center.phone}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Header Bar */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-800 truncate px-2">ডায়াগনস্টিক বিস্তারিত</h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                isBookmarked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart size={18} className={isBookmarked ? 'fill-red-500' : ''} />
            </button>
            <button 
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition relative"
            >
              <Share2 size={18} />
              {copied && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                  কপি হয়েছে
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-24">
          
          {/* Cover Banner Image */}
          <div className="relative w-full h-48 bg-slate-100">
            <img 
              src={center.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'} 
              alt={center.name} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1581594693702-f2323b0463b8?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover"
            />
            {center.open24Hours && (
              <span className="absolute bottom-3 left-3 bg-[#006a4e] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Clock size={12} />
                ২৪ ঘণ্টা খোলা
              </span>
            )}
          </div>

          {/* Title & Info Card */}
          <div className="p-4 border-b border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{center.name}</h1>
              <CheckCircle2 size={18} className="text-[#006a4e] fill-[#006a4e]/10 shrink-0" />
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              {center.address}
            </p>

            {/* Rating & Badge */}
            <div className="flex items-center gap-3 pt-1">
              <button 
                onClick={onOpenReviews}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 hover:bg-amber-100 transition"
              >
                <span>★</span>
                <span>{center.rating}</span>
                <span className="text-slate-500 font-normal">({center.reviewCount} রিভিউ)</span>
              </button>

              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                {center.open24Hours ? '২৪ ঘণ্টা খোলা' : 'খোলা আছে'}
              </span>
            </div>
          </div>

          {/* 4 Action Buttons */}
          <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-100 bg-slate-50/50">
            <a 
              href={`tel:${center.phone}`}
              className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#006a4e] transition text-center group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mb-1 group-hover:scale-105 transition">
                <Phone size={15} />
              </div>
              <span className="text-xs font-bold text-slate-700">কল করুন</span>
            </a>

            <button 
              onClick={onOpenLocation}
              className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#006a4e] transition text-center group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mb-1 group-hover:scale-105 transition">
                <MapPin size={15} />
              </div>
              <span className="text-xs font-bold text-slate-700">দিক নির্দেশনা</span>
            </button>

            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#006a4e] transition text-center group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mb-1 group-hover:scale-105 transition">
                <Bookmark size={15} className={isBookmarked ? 'fill-[#006a4e]' : ''} />
              </div>
              <span className="text-xs font-bold text-slate-700">সংরক্ষণ</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex flex-col items-center justify-center p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#006a4e] transition text-center group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a4e] flex items-center justify-center mb-1 group-hover:scale-105 transition">
                <Share2 size={15} />
              </div>
              <span className="text-xs font-bold text-slate-700">শেয়ার করুন</span>
            </button>
          </div>

          {/* সেন্টারের তথ্য Section */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#006a4e]" />
              সেন্টারের তথ্য
            </h3>

            <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">সেবা বিভাগ</span>
                <span className="font-bold text-slate-800">{center.services.slice(0, 3).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">প্রতিষ্ঠিত</span>
                <span className="font-bold text-slate-800">{center.establishedYear}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">রিপোর্ট সময়</span>
                <span className="font-bold text-slate-800">{center.reportTime}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">হোম কালেকশন</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {center.homeCollection ? 'আছে' : 'নাই'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">অনলাইন রিপোর্ট</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {center.onlineReport ? 'আছে' : 'নাই'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">ডিজিটাল পেমেন্ট</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {center.digitalPayment ? 'আছে' : 'নাই'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick links for Tests & Reviews */}
          <div className="px-4 space-y-2">
            <button 
              onClick={onOpenTests}
              className="w-full p-3 bg-emerald-50 hover:bg-emerald-100/80 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-[#006a4e] transition"
            >
              <div className="flex items-center gap-2">
                <Stethoscope size={16} />
                <span>পরীক্ষা ও ফি তালিকা দেখুন (Test Prices)</span>
              </div>
              <span className="text-emerald-700 font-extrabold">&rarr;</span>
            </button>

            <button 
              onClick={onOpenReviews}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-amber-500" />
                <span>রোগীদের রিভিউ ও অভিজ্ঞতা ({center.reviewCount})</span>
              </div>
              <span className="text-slate-400 font-bold">&rarr;</span>
            </button>
          </div>

        </div>

        {/* Sticky Bottom Action Buttons */}
        <div className="p-3 border-t border-slate-100 bg-white grid grid-cols-3 gap-2 shadow-lg z-10">
          <a
            href={`tel:${center.phone}`}
            className="bg-[#006a4e] hover:bg-[#00523d] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition"
          >
            <Phone size={14} />
            কল করুন
          </a>

          <a
            href={`https://wa.me/${center.whatsapp || center.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition"
          >
            <MessageSquare size={14} />
            WhatsApp
          </a>

          <button
            onClick={onOpenBooking}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition"
          >
            <FileText size={14} />
            রিপোর্ট দেখুন
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShieldCheck, MapPin, Heart, Phone, Mail, Globe, 
  Target, Briefcase, Users, Calendar, CheckCircle, Share2,
  AlertTriangle, Star, MessageSquare, ExternalLink, ArrowLeft,
  Send, Compass, ChevronRight, Info, Building2, User
} from 'lucide-react';
import { NGOData } from './constants';
import { ShareModal } from './ShareModal';
import { ReportInfoModal } from './ReportInfoModal';
import { AddReviewModal } from './AddReviewModal';

interface NgoDetailsProps {
  ngo: NGOData;
  isFavorite: boolean;
  onToggleFavorite: (ngoId: string) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function NgoDetails({ 
  ngo, 
  isFavorite, 
  onToggleFavorite, 
  onClose,
  onShowToast
}: NgoDetailsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeActivity, setActiveActivity] = useState<any | null>(null);

  const [reviewsList, setReviewsList] = useState(ngo.reviews || []);
  const [ratingVal, setRatingVal] = useState(ngo.rating || 4.5);
  const [reviewCountVal, setReviewCountVal] = useState(ngo.reviewCount || reviewsList.length);

  const handleAddReview = (newRating: number, newComment: string) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: 'একজন ইউজার',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: newRating,
      date: 'আজ',
      comment: newComment
    };
    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    const newCount = reviewCountVal + 1;
    const newAvg = Number(((ratingVal * reviewCountVal + newRating) / newCount).toFixed(1));
    setReviewCountVal(newCount);
    setRatingVal(newAvg);
    onShowToast("আপনার রিভিউটি যুক্ত করা হয়েছে, ধন্যবাদ!");
  };

  const defaultServices = [
    { title: '🎓 শিক্ষা সহায়তা', desc: 'দরিদ্র ও মেধাবী শিক্ষার্থীদের মেধা বিকাশ ও উপকরণ সহায়তা' },
    { title: '❤️ স্বাস্থ্যসেবা', desc: 'বিনামূল্যে স্বাস্থ্য পরীক্ষা ও ওষুধ বিতরণ' },
    { title: '👩 নারী উন্নয়ন', desc: 'নারী স্বাবলম্বিতা, কুটির শিল্প ও কারিগরি দক্ষতা উন্নয়ন' },
    { title: '👶 শিশু সহায়তা', desc: 'শিশুদের পুষ্টি, সুস্বাস্থ্য ও বিনোদনমূলক শিক্ষাদান' },
    { title: '🌱 কৃষি সহায়তা', desc: 'জৈব কৃষি প্রযুক্তি ও উন্নত বীজ সংক্রান্ত উঠান বৈঠক' },
    { title: '🌍 পরিবেশ উন্নয়ন', desc: 'বৃক্ষরোপণ কর্মসূচি ও জলবায়ু ঝুঁকি প্রশমন' },
    { title: '💼 কর্মসংস্থান', desc: 'কারিগরি ও যুব পেশাগত প্রশিক্ষণ' },
    { title: '🤝 মানবিক সহায়তা', desc: 'প্রাকৃতিক দুর্যোগে দ্রুত ত্রাণ ও সামাজিক নিরাপত্তা' }
  ];

  const currentServicesList = (ngo.services && ngo.services.length > 0)
    ? ngo.services
    : defaultServices.map(s => s.title);

  const breakdown = ngo.ratingBreakdown || { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 };
  const totalBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  const getFieldValue = (val?: string) => {
    return (val && val.trim().length > 0) ? val : 'তথ্য পাওয়া যায়নি';
  };

  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 30 }}
        className="bg-white rounded-none sm:rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800 shadow-sm z-30">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-black text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>ফিরে যান</span>
          </button>
          
          <h2 className="text-sm font-black truncate max-w-[200px] sm:max-w-md text-emerald-50">
            {ngo.name}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(ngo.id)}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="পছন্দের তালিকায় রাখুন"
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="শেয়ার করুন"
            >
              <Share2 size={18} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto space-y-8 pb-12 bg-slate-50">
          
          {/* Cover & Profile Banner */}
          <div className="relative bg-white shadow-sm">
            <div className="h-44 sm:h-64 relative bg-slate-200">
              <img
                src={ngo.coverUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80"}
                alt={ngo.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>

            <div className="max-w-3xl mx-auto px-6 pb-6 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 shadow-xl border-2 border-white shrink-0 overflow-hidden">
                  <img
                    src={ngo.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=047857&color=fff`}
                    alt={ngo.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="text-slate-800 space-y-1 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {ngo.type || 'এনজিও'}
                    </span>
                    {ngo.isVerified && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={12} fill="currentColor" className="opacity-90" /> ভেরিফাইড (✓)
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{ngo.name}</h1>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    {ngo.location || 'পুঠিয়া, রাজশাহী'}
                  </p>
                </div>
              </div>

              {/* Rating Pill */}
              <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <div>
                  <span className="text-sm font-black text-amber-900">{ratingVal}</span>
                  <span className="text-[10px] font-bold text-amber-700 ml-1">({reviewCountVal} টি রিভিউ)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="max-w-3xl mx-auto px-6 pb-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
              <a
                href={`tel:${ngo.phone}`}
                className="py-3 px-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone size={15} /> কল করুন
              </a>
              {ngo.whatsapp ? (
                <a
                  href={`https://wa.me/${ngo.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-[#25D366] text-white hover:opacity-90 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send size={15} /> WhatsApp
                </a>
              ) : null}
              {ngo.website ? (
                <a
                  href={ngo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-slate-800 text-white hover:bg-slate-900 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Globe size={15} /> ওয়েবসাইট
                </a>
              ) : null}
              <a
                href={ngo.mapLocationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.name + ' ' + ngo.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Compass size={15} /> দিকনির্দেশনা
              </a>
              <button
                onClick={() => setShowShareModal(true)}
                className="py-3 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 size={15} /> শেয়ার
              </button>
            </div>
          </div>

          {/* SECTION 9: NGO BASIC INFORMATION */}
          <div className="max-w-3xl mx-auto px-6 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">এনজিও সম্পর্কে</h3>
              </div>

              <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ngo.description || ngo.shortDescription}
              </p>

              {/* Data Grid Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">প্রতিষ্ঠার বছর</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.establishedYear)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">এনজিওর ধরন</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.type)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">প্রধান কার্যালয়</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.headOffice)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">পুঠিয়া অফিস</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.puthiaOffice)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">কার্যক্রমের এলাকা</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.workingArea)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">সদস্য/কর্মী সংখ্যা</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.membersCount)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">নিবন্ধন নম্বর</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.registrationNumber)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">যোগাযোগ ব্যক্তি</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.contactPerson)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ফোন</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.phone)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ই-মেইল</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.email)}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ওয়েবসাইট</span>
                  <span className="text-xs font-black text-slate-800">{getFieldValue(ngo.website)}</span>
                </div>
              </div>
            </div>

            {/* SECTION 10: NGO SERVICES */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">আমাদের সেবাসমূহ</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentServicesList.map((serv, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-start gap-3 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-950">{serv}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 11: NGO ACTIVITIES */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">কার্যক্রম ও উদ্যোগ</h3>
              </div>

              {ngo.activities && ngo.activities.length > 0 ? (
                <div className="space-y-4">
                  {ngo.activities.map((act) => (
                    <div 
                      key={act.id} 
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                    >
                      {act.image && (
                        <img 
                          src={act.image} 
                          alt={act.title} 
                          className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0" 
                        />
                      )}
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-black text-slate-800">{act.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                          <span>📍 {act.location}</span>
                          <span>•</span>
                          <span>📅 {act.date}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 line-clamp-2 mt-1">
                          {act.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveActivity(act)}
                        className="py-2 px-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-black text-xs shrink-0 self-end sm:self-center transition-colors cursor-pointer"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400 py-4 text-center">কোনো সাম্প্রতিক কার্যক্রম তথ্য সংযুক্ত নেই।</p>
              )}
            </div>

            {/* SECTION 12: PROJECTS */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Target size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">চলমান ও সম্পন্ন প্রকল্প</h3>
              </div>

              {ngo.projects && ngo.projects.length > 0 ? (
                <div className="space-y-4">
                  {ngo.projects.map((proj) => (
                    <div key={proj.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-slate-800">{proj.name}</h4>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          proj.status === 'চলমান'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.status === 'সম্পন্ন'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-500">
                        <span>📍 {proj.targetArea}</span>
                        <span>•</span>
                        <span>📅 {proj.startDate} - {proj.endDate}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed pt-1">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400 py-4 text-center">কোনো প্রকল্পের তথ্য সংযুক্ত নেই।</p>
              )}
            </div>

            {/* SECTION 13: LOCATION / MAP */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Compass size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">অবস্থান</h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-emerald-600 shrink-0" size={20} />
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ঠিকানা</span>
                    <p className="text-xs font-black text-slate-800">{ngo.puthiaOffice || ngo.location || 'পুঠিয়া, রাজশাহী'}</p>
                  </div>
                </div>

                <a
                  href={ngo.mapLocationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.name + ' ' + ngo.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Compass size={16} /> দিকনির্দেশনা নিন (Google Maps)
                </a>
              </div>
            </div>

            {/* SECTION 14: CONTACT */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Phone size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">যোগাযোগ করুন</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${ngo.phone}`}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-emerald-50 transition-colors"
                >
                  <Phone size={18} className="text-emerald-600" />
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block">ফোন করুন</span>
                    <span className="text-xs font-black text-slate-800">{ngo.phone}</span>
                  </div>
                </a>

                {ngo.whatsapp ? (
                  <a
                    href={`https://wa.me/${ngo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-emerald-50 transition-colors"
                  >
                    <Send size={18} className="text-[#25D366]" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 block">WhatsApp</span>
                      <span className="text-xs font-black text-slate-800">{ngo.whatsapp}</span>
                    </div>
                  </a>
                ) : null}

                {ngo.email ? (
                  <a
                    href={`mailto:${ngo.email}`}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-emerald-50 transition-colors"
                  >
                    <Mail size={18} className="text-blue-600" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 block">ই-মেইল</span>
                      <span className="text-xs font-black text-slate-800">{ngo.email}</span>
                    </div>
                  </a>
                ) : null}

                {ngo.website ? (
                  <a
                    href={ngo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-emerald-50 transition-colors"
                  >
                    <Globe size={18} className="text-slate-700" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 block">ওয়েবসাইট</span>
                      <span className="text-xs font-black text-slate-800 truncate block max-w-[180px]">{ngo.website}</span>
                    </div>
                  </a>
                ) : null}
              </div>
            </div>

            {/* SECTION 15: REVIEW & RATING */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Star size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">রিভিউ ও রেটিং</h3>
                    <p className="text-xs font-bold text-slate-400">{reviewCountVal} টি সাধারণ ব্যবহারকারীর রিভিউ</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-sm"
                >
                  রিভিউ দিন
                </button>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                <div className="text-center flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-amber-200/60 pb-4 sm:pb-0">
                  <div className="text-4xl font-black text-amber-900">{ratingVal}</div>
                  <div className="flex items-center justify-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className={s <= Math.round(ratingVal) ? "text-amber-500 fill-amber-500" : "text-slate-300"} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-amber-700">{reviewCountVal} টি রিভিউ</span>
                </div>

                <div className="sm:col-span-2 space-y-1.5 justify-center flex flex-col">
                  {[5, 4, 3, 2, 1].map((st) => {
                    const count = breakdown[st] || 0;
                    const pct = Math.round((count / totalBreakdown) * 100);
                    return (
                      <div key={st} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span className="w-6 text-right font-black">{st} ★</span>
                        <div className="flex-1 bg-amber-200/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-[10px] text-slate-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-black text-slate-800">{rev.userName}</h5>
                          <span className="text-[9px] font-bold text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= rev.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 18: REPORT INFORMATION */}
            <div className="p-6 bg-slate-100 rounded-[24px] border border-slate-200 text-center space-y-3">
              <h4 className="text-xs font-black text-slate-700">তথ্য ভুল মনে হচ্ছে?</h4>
              <p className="text-[11px] font-bold text-slate-500">
                আপনি যদি এই এনজিওর তথ্যে কোনো ভুল দেখতে পান, তবে সংশোধন অনুরোধ জমা দিয়ে সহায়তা করুন।
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="py-2.5 px-5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-xs transition-colors cursor-pointer"
              >
                তথ্য সংশোধনের অনুরোধ করুন
              </button>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Sub Modals */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            title={ngo.name}
            url={window.location.href}
            onClose={() => setShowShareModal(false)}
            onShowToast={onShowToast}
          />
        )}

        {showReportModal && (
          <ReportInfoModal
            ngoId={ngo.id}
            ngoName={ngo.name}
            onClose={() => setShowReportModal(false)}
            onShowToast={onShowToast}
          />
        )}

        {showReviewModal && (
          <AddReviewModal
            ngoName={ngo.name}
            onSubmit={handleAddReview}
            onClose={() => setShowReviewModal(false)}
          />
        )}

        {activeActivity && (
          <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-black text-slate-800">{activeActivity.title}</h3>
                <button onClick={() => setActiveActivity(null)} className="p-2 rounded-full hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              {activeActivity.image && (
                <img src={activeActivity.image} alt={activeActivity.title} className="w-full h-40 object-cover rounded-2xl" />
              )}
              <div className="text-xs font-bold text-slate-500 space-y-1">
                <p>📍 {activeActivity.location}</p>
                <p>📅 {activeActivity.date}</p>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                {activeActivity.description}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

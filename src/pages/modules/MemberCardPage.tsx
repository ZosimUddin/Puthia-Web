import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Camera, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Sparkles,
  Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { copyToClipboard } from '../../utils/clipboard';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas-pro';
// @ts-ignore
import domtoimage from 'dom-to-image-more';

const BLOOD_GROUPS = ['নেই', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MemberCardPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [bloodGroup, setBloodGroup] = useState<string>(userProfile?.bloodGroup || 'B+');
  const [customPhoto, setCustomPhoto] = useState<string>(userProfile?.photoURL || '');
  const [postTab, setPostTab] = useState<'detailed' | 'short'>('detailed');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Dynamic user data
  const userName = userProfile?.name || user?.displayName || 'MD Josim Uddin';
  const avatarLetter = (userName.trim()[0] || 'M').toUpperCase();
  const siteUrl = 'https://our-puthia-app.vercel.app/';
  const displayDomain = 'www.ourputhia.com';

  // Photo upload handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি আপলোড করা যাবে');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('ছবির সাইজ ১০MB এর কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomPhoto(event.target.result as string);
        toast.success('কার্ডে আপনার ছবি যুক্ত হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Download Card as high-res PNG image
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading('⏳ কার্ডের ছবি প্রস্তুত হচ্ছে...');

    try {
      const cardElement = cardRef.current;
      let dataUrl = '';

      // First attempt: dom-to-image-more (uses native browser rendering, immune to modern CSS oklab/oklch parser issues)
      try {
        dataUrl = await domtoimage.toPng(cardElement, {
          quality: 1,
          scale: 2,
        });
      } catch (domErr) {
        console.warn('dom-to-image conversion note:', domErr);
      }

      // Fallback: html2canvas-pro with modern CSS oklab/oklch sanitization
      if (!dataUrl) {
        const canvas = await html2canvas(cardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc: Document) => {
            clonedDoc.querySelectorAll('style').forEach((sTag) => {
              if (sTag.textContent) {
                sTag.textContent = sTag.textContent
                  .replace(/oklch\([^)]+\)/gi, '#059669')
                  .replace(/oklab\([^)]+\)/gi, '#059669');
              }
            });
          }
        });
        dataUrl = canvas.toDataURL('image/png', 1.0);
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      const cleanName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      link.download = `our_puthia_member_card_${cleanName || 'puthia'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('🎉 কার্ড সফলভাবে ডাউনলোড হয়েছে!', { id: toastId });
    } catch (error) {
      console.error('Member card download error:', error);
      toast.error('ডাউনলোড করতে সমস্যা হয়েছে। স্ক্রিনশট নিয়ে সেভ করতে পারেন!', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  // Facebook Share
  const handleFacebookShare = () => {
    const quote = `🎉 আমি যুক্ত হয়েছি আমাদের পুঠিয়া-এ!\nপুঠিয়ার সবচেয়ে বিশাল তথ্যবহুল মোবাইল অ্যাপ — আমাদের উপজেলার সব দরকারি তথ্য এখন এক জায়গায়। আপনিও যুক্ত হোন!`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(quote)}`;
    window.open(fbUrl, '_blank', 'width=620,height=550,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
  };

  // Facebook post texts
  const detailedPostText = `🎉 আমি যুক্ত হয়েছি আমাদের পুঠিয়া-এ!

পুঠিয়ার সবচেয়ে বিশাল তথ্যবহুল মোবাইল অ্যাপ — আমাদের উপজেলার সব দরকারি তথ্য এখন এক জায়গায় 👇

🩸 জরুরি মুহূর্তে রক্তদাতা খুঁজুন
🩺 বিশেষজ্ঞ ডাক্তার, চেম্বার ও সিরিয়াল
🌦️ বৃষ্টির আগাম খবর
🏥 হাসপাতাল, অ্যাম্বুলেন্স ও জরুরি নম্বর
🚗 রাইড শেয়ার ও লোকাল ড্রাইভার
🛒 বাজার, ব্যবসা ও নাগরিক সেবা
📰 পুঠিয়ার খবর ও নোটিশ
🏆 তথ্য দিয়ে পয়েন্ট জিতুন — মাসের সেরাদের জন্য উপহার!

✅ একদম ফ্রি! আপনিও এখনই যুক্ত হন 👉
${siteUrl}

পুঠিয়ার তথ্য ও মানুষের পাশে — আমাদের পুঠিয়া ❤️
#পুঠিয়া #Puthia #আমাদের_পুঠিয়া #রাজশাহী`;

  const shortPostText = `🎉 আমি যুক্ত হয়েছি আমাদের পুঠিয়া ডিজিটাল প্ল্যাটফর্মে!

পুঠিয়ার জরুরি রক্তদাতা, বিশেষজ্ঞ ডাক্তার, অ্যাম্বুলেন্স, রেন্ট-এ-কার ও বাজারের সব তথ্য এখন এক অ্যাপেই 👇
✅ আপনিও যুক্ত হন একদম ফ্রি: ${siteUrl}

পুঠিয়ার তথ্য ও মানুষের পাশে — আমাদের পুঠিয়া ❤️
#আমাদের_পুঠিয়া #পুঠিয়া #রাজশাহী`;

  const currentPostText = postTab === 'detailed' ? detailedPostText : shortPostText;

  // Copy post text
  const handleCopyPostText = () => {
    copyToClipboard(currentPostText);
    setIsCopied(true);
    toast.success('পোস্টের লেখা কপি করা হয়েছে!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans antialiased">
      <Toaster position="top-center" />

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoSelect}
      />

      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            aria-label="পিছনে যান"
          >
            <ArrowLeft size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            আমার সদস্য কার্ড
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* ========================================================= */}
        {/* 1. THE MEMBER CARD (IDENTICAL TO SCREENSHOT)               */}
        {/* ========================================================= */}
        <div 
          ref={cardRef}
          className="relative overflow-hidden rounded-[30px] sm:rounded-[34px] p-5 sm:p-6 text-white shadow-xl select-none"
          style={{
            background: 'linear-gradient(180deg, #026649 0%, #037a54 45%, #01432f 100%)'
          }}
        >
          {/* Confetti & Streamers Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Ambient decorative dots */}
            <span className="absolute top-4 left-6 w-2 h-2 rounded-full bg-yellow-300 opacity-80" />
            <span className="absolute top-10 left-16 w-2.5 h-1 rounded-sm bg-pink-400 rotate-45 opacity-70" />
            <span className="absolute top-6 right-8 w-2 h-2 rounded-full bg-cyan-300 opacity-80" />
            <span className="absolute top-12 right-20 w-3 h-1.5 rounded-sm bg-yellow-400 -rotate-12 opacity-80" />
            <span className="absolute top-24 left-8 w-2 h-2 rounded-full bg-emerald-300 opacity-60" />
            <span className="absolute top-28 right-10 w-2.5 h-2.5 rounded-full bg-pink-300 opacity-70" />
            <span className="absolute top-36 left-20 w-2 h-2 rounded-sm bg-amber-300 rotate-12 opacity-60" />
            <span className="absolute top-44 right-6 w-2 h-2 rounded-full bg-cyan-200 opacity-70" />
            <span className="absolute top-52 left-7 w-2.5 h-1.5 rounded-sm bg-lime-300 rotate-45 opacity-70" />
            <span className="absolute bottom-36 right-8 w-2 h-2 rounded-full bg-yellow-300 opacity-70" />
            <span className="absolute bottom-44 left-10 w-2 h-2 rounded-full bg-pink-400 opacity-60" />
          </div>

          <div className="relative z-10 text-center">
            {/* Brand Title in Yellow */}
            <h2 className="text-xl sm:text-2xl font-black text-[#fed766] tracking-tight leading-tight drop-shadow-xs">
              আমাদের পুঠিয়া ডট কম
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-bold mt-0.5">
              পুঠিয়ার তথ্য ও মানুষের পাশে
            </p>

            {/* Big Headline */}
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-4 tracking-tight drop-shadow-sm">
              আমি যুক্ত হয়েছি!
            </h3>

            {/* User Avatar with Green Verified Badge */}
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full p-1 bg-gradient-to-tr from-cyan-300 via-emerald-300 to-teal-100 shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center border-2 border-white">
                  {customPhoto ? (
                    <img 
                      src={customPhoto} 
                      alt={userName} 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">
                      {avatarLetter}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Check Badge */}
              <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#10b981] border-2 border-white flex items-center justify-center text-white shadow-md">
                <Check size={16} className="stroke-[3.5]" />
              </div>
            </div>

            {/* User Name */}
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {userName}
            </h4>

            {/* Blood Group Pill (Shows only if not 'নেই') */}
            {bloodGroup && bloodGroup !== 'নেই' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e11d48] text-white text-xs font-black shadow-sm mt-1.5 mb-2">
                <span>🩸 রক্তের গ্রুপ {bloodGroup}</span>
              </div>
            )}

            {/* App Tagline */}
            <p className="text-xs sm:text-sm font-bold text-[#bbf7d0] mt-2 mb-3">
              পুঠিয়ার সবচেয়ে বিশাল তথ্যবহুল মোবাইল অ্যাপ
            </p>

            {/* 8 Features Grid (2 Rows x 4 Columns - Clean labels that fit without any truncation) */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-4 text-[9.5px] sm:text-[11px] font-bold">
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🩸 রক্তদাতা
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🩺 ডাক্তার
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🌦️ বৃষ্টির খবর
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🚗 রাইড শেয়ার
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🏥 হাসপাতাল
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🛒 বাজার
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                📰 খবর
              </div>
              <div className="bg-black/35 backdrop-blur-xs border border-white/10 rounded-full py-1.5 px-0.5 text-center whitespace-nowrap flex items-center justify-center">
                🏆 উপহার
              </div>
            </div>

            {/* White Callout Box with QR Code */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 flex items-center gap-3 text-slate-900 shadow-lg text-left">
              {/* QR Code Container */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 p-1 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                <QRCode 
                  value={siteUrl} 
                  size={64} 
                  level="M"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 64 64`}
                />
              </div>

              {/* QR Info & Domain Button */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h5 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                    আপনিও যুক্ত হন!
                  </h5>
                  <span className="text-sm">🤝</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5 line-clamp-1">
                  একদম ফ্রি • ভিজিট করুন বা QR স্ক্যান করুন 👉
                </p>

                {/* Dark Teal Pill Button */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#033a2a] text-white px-3 py-1 rounded-full text-xs font-black tracking-wide shadow-xs">
                  <Globe size={13} className="text-emerald-400" />
                  <span>{displayDomain}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CARD PHOTO BUTTON                                      */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-dashed border-emerald-400/90 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-700 font-black text-sm flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
        >
          <Camera size={19} className="stroke-[2.2]" />
          <span>কার্ডে নিজের ছবি দিন</span>
        </button>

        {/* ========================================================= */}
        {/* 3. BLOOD GROUP SELECTOR                                   */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-2.5">
          <label className="block text-xs sm:text-sm font-bold text-slate-600">
            কার্ডে রক্তের গ্রুপ
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {BLOOD_GROUPS.map((group) => {
              const isSelected = bloodGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setBloodGroup(group)}
                  className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#e11d48] text-white shadow-md ring-2 ring-rose-500/30 scale-[1.02]'
                      : 'bg-rose-50/70 hover:bg-rose-100/70 text-rose-700 active:scale-95'
                  }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. DOWNLOAD & SHARE BUTTONS                               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 gap-3">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="py-3.5 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download size={18} className="stroke-[2.5]" />
                <span>ডাউনলোড</span>
              </>
            )}
          </button>

          {/* Facebook Share Button */}
          <button
            type="button"
            onClick={handleFacebookShare}
            className="py-3.5 px-4 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Share2 size={18} className="stroke-[2.5]" />
            <span>ফেসবুকে শেয়ার</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 5. FACEBOOK POST COPY SECTION                             */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          
          {/* Section Header with Tabs */}
          <div className="bg-[#4f46e5] text-white px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black flex items-center gap-1.5">
              <span>📝 ফেসবুক পোস্টের লেখা</span>
            </h3>

            {/* Toggle Tabs */}
            <div className="flex items-center gap-1 bg-white/20 p-0.5 rounded-full text-xs font-bold">
              <button
                type="button"
                onClick={() => setPostTab('detailed')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  postTab === 'detailed'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                বিস্তারিত
              </button>
              <button
                type="button"
                onClick={() => setPostTab('short')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  postTab === 'short'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                ছোট
              </button>
            </div>
          </div>

          {/* Mock Facebook Post Box */}
          <div className="p-4 sm:p-5 space-y-3.5 text-left">
            {/* Author Row */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-xs overflow-hidden">
                {customPhoto ? (
                  <img src={customPhoto} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-none">
                  {userName}
                </h4>
                <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1 mt-1">
                  <span>এখনই</span>
                  <span>•</span>
                  <span>🌐</span>
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium select-text">
              {currentPostText}
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyPostText}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check size={19} className="stroke-[3]" />
                  <span>লেখা কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy size={19} className="stroke-[2.5]" />
                  <span>লেখা কপি করুন</span>
                </>
              )}
            </button>

            {/* Helper Caption */}
            <p className="text-[11px] sm:text-xs text-slate-500 text-center font-medium leading-relaxed px-2">
              কার্ডের ছবি পোস্ট করার সময় এই লেখা পেস্ট করুন — বন্ধুরা লিংকে চাপ দিয়েই যুক্ত হতে পারবেন।
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

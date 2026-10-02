import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Gift, Heart, Calendar, Users, Plus, Trash2, Clock, 
  Coins, DollarSign, Check, AlertCircle, Sparkles, TrendingUp, HelpCircle
} from 'lucide-react';

// Helper to convert English numbers to Bengali numbers
export function toBn(n: number | string): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnNums[+w]);
}

const formatBnCurrency = (val: number) => {
  return '৳ ' + toBn(val.toLocaleString('en-IN', { maximumFractionDigits: 0 }));
};

// Zodiac helper
const getZodiacSign = (day: number, month: number): { name: string; icon: string } => {
  // Month is 1-indexed
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'মেষ (Aries)', icon: '♈' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'বৃষ (Taurus)', icon: '♉' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'মিথুন (Gemini)', icon: '♊' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'কর্কট (Cancer)', icon: '♋' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'সিংহ (Leo)', icon: '♌' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'কন্যা (Virgo)', icon: '♍' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'তুলা (Libra)', icon: '♎' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'বৃশ্চিক (Scorpio)', icon: '♏' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'ধনু (Sagittarius)', icon: '♐' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'মকর (Capricorn)', icon: '♑' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'কুম্ভ (Aquarius)', icon: '♒' };
  return { name: 'মীন (Pisces)', icon: '♓' };
};

// Traditional Anniversary Gifts
const getAnniversaryMilestone = (years: number): { theme: string; material: string; description: string } => {
  const milestones: Record<number, { theme: string; material: string; description: string }> = {
    1: { theme: '১ম বর্ষপূর্তি', material: 'কাগজ (Paper)', description: 'নতুন শুরুর সূচনা ও সম্পর্কের কোমলতা।' },
    2: { theme: '২য় বর্ষপূর্তি', material: 'তুলা (Cotton)', description: 'সম্পর্কের মানিয়ে নেওয়ার ক্ষমতা ও নমনীয়তা।' },
    3: { theme: '৩য় বর্ষপূর্তি', material: 'চামড়া (Leather)', description: 'স্থায়িত্ব ও একে অপরকে সুরক্ষা দেওয়ার ক্ষমতা।' },
    4: { theme: '৪র্থ বর্ষপূর্তি', material: 'ফুল/ফল (Fruit/Flowers)', description: 'সম্পর্কের সৌন্দর্য ও প্রস্ফুটিত ভালোবাসা।' },
    5: { theme: '৫ম বর্ষপূর্তি', material: 'কাঠ (Wood)', description: 'মজবুত ভিত্তি ও দীর্ঘস্থায়ী শক্তির প্রতীক।' },
    10: { theme: '১০ম বর্ষপূর্তি', material: 'টিন/অ্যালুমিনিয়াম (Tin)', description: 'সম্পর্কের স্থায়িত্ব ও নমনীয়তার নিখুঁত মিশ্রণ।' },
    15: { theme: '১৫তম বর্ষপূর্তি', material: 'ক্রিস্টাল (Crystal)', description: 'একে অপরের প্রতি স্বচ্ছতা ও বিশুদ্ধ ভালোবাসা।' },
    20: { theme: '২০তম বর্ষপূর্তি', material: 'চীনামাটি (China)', description: 'যত্নশীল ভালোবাসা ও স্থায়ী সুকুমার সৌন্দর্য।' },
    25: { theme: '২৫তম রজত জয়ন্তী', material: 'রূপা (Silver)', description: 'একটি উজ্জ্বল, দীর্ঘস্থায়ী এবং অমূল্য মাইলফলক।' },
    30: { theme: '৩০তম বর্ষপূর্তি', material: 'মুক্তা (Pearl)', description: 'সময়ের সাথে গড়ে ওঠা অপরূপ অভ্যন্তরীণ সৌন্দর্য।' },
    40: { theme: '৪০তম রুবী জয়ন্তী', material: 'রুবি পাথর (Ruby)', description: 'চিরকাল প্রজ্জ্বলিত গভীর ও তীব্র ভালোবাসা।' },
    50: { theme: '৫০তম সুবর্ণ জয়ন্তী', material: 'সোনা (Gold)', description: 'ভালোবাসার সর্বোচ্চ ও সবচেয়ে মূল্যবান গৌরবময় রূপ।' },
  };

  return milestones[years] || { 
    theme: `${years}তম বর্ষপূর্তি`, 
    material: 'ভালোবাসা ও আন্তরিকতা', 
    description: 'বহু বছরের মধুর স্মৃতি ও পারস্পরিক সমঝোতা।' 
  };
};

// ============================================================================
// 1. Birthday Countdown (জন্মদিন কাউন্টডাউন)
// ============================================================================
export function BirthdayCountdown({ onGoBack }: { onGoBack: () => void }) {
  const [name, setName] = useState('প্রিয়জন');
  const [birthDateStr, setBirthDateStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear() - 25}-10-15`; // default preset
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!birthDateStr) return;
      const birthDate = new Date(birthDateStr);
      if (isNaN(birthDate.getTime())) return;

      const today = new Date();
      let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

      // If the birthday has already passed this year, the next birthday is next year
      if (nextBirthday.getTime() < today.getTime() && 
          !(nextBirthday.getDate() === today.getDate() && nextBirthday.getMonth() === today.getMonth())) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }

      const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

      const diffMs = nextBirthday.getTime() - today.getTime();
      if (diffMs <= 0 || isToday) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true });
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isToday: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [birthDateStr]);

  const getStats = () => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    const diffMs = today.getTime() - birthDate.getTime();
    if (diffMs < 0) return null;

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const approxBreaths = Math.round(totalDays * 20000); // 20,000 breaths per day avg
    const approxHeartbeats = Math.round(totalDays * 100000); // 100,000 heartbeats per day avg

    // Next age turning
    let nextAge = today.getFullYear() - birthDate.getFullYear();
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday.getTime() < today.getTime() && 
        !(nextBirthday.getDate() === today.getDate() && nextBirthday.getMonth() === today.getMonth())) {
      nextAge += 1;
    }
    if (nextAge < 0) nextAge = 0;

    const zodiac = getZodiacSign(birthDate.getDate(), birthDate.getMonth() + 1);

    return {
      totalDays,
      totalHours,
      totalMinutes,
      approxBreaths,
      approxHeartbeats,
      nextAge,
      zodiac
    };
  };

  const stats = getStats();

  return (
    <div id="birthday_countdown_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white flex justify-between items-center">
        <div>
          <button id="birthday_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="birthday_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Gift className="w-6 h-6" /> জন্মদিন কাউন্টডাউন (Birthday Countdown)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">পরিবার</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">কার জন্মদিন? (নাম):</label>
            <input
              id="birthday_name_input"
              type="text"
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500"
              placeholder="যেমন: আবির"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">জন্ম তারিখ নির্বাচন করুন:</label>
            <input
              id="birth_date_input"
              type="date"
              value={birthDateStr || ""}
              onChange={(e) => setBirthDateStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-rose-500"
            />
          </div>

          {stats && (
            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/60 space-y-3">
              <h3 className="text-xs font-black text-rose-700 flex items-center gap-1">
                <Sparkles size={14} /> জ্যোতিষ ও বিশেষ তথ্য
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-slate-400 font-bold block">রাশিচক্র (Zodiac Sign)</span>
                  <span className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                    <span className="text-lg">{stats.zodiac.icon}</span> {stats.zodiac.name}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-slate-400 font-bold block">পরবর্তী জন্মদিনে বয়স হবে</span>
                  <span className="font-black text-rose-600 text-sm block mt-0.5">
                    {toBn(stats.nextAge)} বছর
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-6 flex flex-col justify-between bg-slate-50 rounded-2xl border border-slate-100 p-6">
          <div className="text-center space-y-4">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">
              {name}-এর পরবর্তী জন্মদিনের বাকি
            </span>

            {timeLeft.isToday ? (
              <div className="py-6 space-y-3 animate-bounce">
                <div className="text-4xl">🎂🎉🥳</div>
                <h3 className="text-2xl font-black text-rose-600">শুভ জন্মদিন, {name}!</h3>
                <p className="text-xs text-slate-500 font-bold">আজ আপনার জীবনের একটি সুন্দর ও আনন্দময় দিন হোক।</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-rose-600 block">{toBn(timeLeft.days)}</span>
                  <span className="text-[10px] font-bold text-slate-400">দিন</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-rose-600 block">{toBn(timeLeft.hours)}</span>
                  <span className="text-[10px] font-bold text-slate-400">ঘণ্টা</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-rose-600 block">{toBn(timeLeft.minutes)}</span>
                  <span className="text-[10px] font-bold text-slate-400">মিনিট</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-rose-600 block">{toBn(timeLeft.seconds)}</span>
                  <span className="text-[10px] font-bold text-slate-400">সেকেন্ড</span>
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="mt-6 border-t border-slate-200/60 pt-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider text-center mb-2">
                জীবন পরিসংখ্যান (আজ পর্যন্ত কাটানো সময়)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-bold">মোট দিন:</span>
                  <span className="font-black text-slate-700">{toBn(stats.totalDays)} দিন</span>
                </div>
                <div className="flex justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-bold">মোট ঘণ্টা:</span>
                  <span className="font-black text-slate-700">{toBn(stats.totalHours)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100 col-span-2">
                  <span className="text-slate-400 font-bold">আনুমানিক মোট শ্বাসপ্রশ্বাস:</span>
                  <span className="font-black text-rose-600">{toBn(stats.approxBreaths)} বার</span>
                </div>
                <div className="flex justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-100 col-span-2">
                  <span className="text-slate-400 font-bold">আনুমানিক হৃদস্পন্দন:</span>
                  <span className="font-black text-rose-600">{toBn(stats.approxHeartbeats)} বার</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Wedding Anniversary Countdown (বিবাহবার্ষিকী কাউন্টডাউন)
// ============================================================================
export function AnniversaryCountdown({ onGoBack }: { onGoBack: () => void }) {
  const [partner1, setPartner1] = useState('বর');
  const [partner2, setPartner2] = useState('কনে');
  const [weddingDateStr, setWeddingDateStr] = useState(() => {
    const today = new Date();
    return `${today.getFullYear() - 3}-02-14`; // default preset
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!weddingDateStr) return;
      const weddingDate = new Date(weddingDateStr);
      if (isNaN(weddingDate.getTime())) return;

      const today = new Date();
      let nextAnniversary = new Date(today.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());

      if (nextAnniversary.getTime() < today.getTime() && 
          !(nextAnniversary.getDate() === today.getDate() && nextAnniversary.getMonth() === today.getMonth())) {
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      }

      const isToday = today.getDate() === weddingDate.getDate() && today.getMonth() === weddingDate.getMonth();

      const diffMs = nextAnniversary.getTime() - today.getTime();
      if (diffMs <= 0 || isToday) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true });
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isToday: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDateStr]);

  const getStats = () => {
    if (!weddingDateStr) return null;
    const weddingDate = new Date(weddingDateStr);
    if (isNaN(weddingDate.getTime())) return null;

    const today = new Date();
    const diffMs = today.getTime() - weddingDate.getTime();
    if (diffMs < 0) return null;

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (today.getFullYear() - weddingDate.getFullYear()) * 12 + today.getMonth() - weddingDate.getMonth();

    let anniversaryYear = today.getFullYear() - weddingDate.getFullYear();
    let nextAnniversary = new Date(today.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
    if (nextAnniversary.getTime() < today.getTime() && 
        !(nextAnniversary.getDate() === weddingDate.getDate() && nextAnniversary.getMonth() === weddingDate.getMonth())) {
      anniversaryYear += 1;
    }
    if (anniversaryYear <= 0) anniversaryYear = 1;

    const giftInfo = getAnniversaryMilestone(anniversaryYear);

    return {
      totalDays,
      totalWeeks,
      totalMonths,
      anniversaryYear,
      giftInfo
    };
  };

  const stats = getStats();

  return (
    <div id="anniversary_countdown_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-red-500 to-pink-600 text-white flex justify-between items-center">
        <div>
          <button id="anniversary_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="anniversary_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Heart className="w-6 h-6 text-white animate-pulse" /> বিবাহবার্ষিকী কাউন্টডাউন (Anniversary)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">পরিবার</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">প্রথম পার্টনারের নাম:</label>
              <input
                type="text"
                value={partner1 || ""}
                onChange={(e) => setPartner1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 block mb-1">দ্বিতীয় পার্টনারের নাম:</label>
              <input
                type="text"
                value={partner2 || ""}
                onChange={(e) => setPartner2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 block mb-1">বিয়ের শুভ তারিখ:</label>
            <input
              id="wedding_date_input"
              type="date"
              value={weddingDateStr || ""}
              onChange={(e) => setWeddingDateStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-red-500"
            />
          </div>

          {stats && (
            <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100/60 space-y-2.5">
              <h3 className="text-xs font-black text-red-700 flex items-center gap-1">
                <Gift size={14} className="text-red-500" /> বর্ষপূর্তির উপহার পরামর্শ (Traditional Gift)
              </h3>
              <p className="text-[10px] text-slate-400 font-bold block">
                ঐতিহ্যবাহী মাইলফলক অনুযায়ী {toBn(stats.anniversaryYear)}ম বর্ষপূর্তির উপহারের থিম:
              </p>
              <div className="bg-white p-3 rounded-xl border border-red-100">
                <span className="text-xs font-black text-slate-800 block">🎁 {stats.giftInfo.material}</span>
                <span className="text-[11px] text-slate-500 block mt-1 leading-relaxed">{stats.giftInfo.description}</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-6 flex flex-col justify-between bg-slate-50 rounded-2xl border border-slate-100 p-6">
          <div className="text-center space-y-4">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">
              {partner1} ও {partner2}-এর পরবর্তী বিবাহবার্ষিকীর বাকি
            </span>

            {timeLeft.isToday ? (
              <div className="py-6 space-y-3 animate-bounce">
                <div className="text-4xl">💍❤️🌹🥂</div>
                <h3 className="text-2xl font-black text-red-600">শুভ বিবাহবার্ষিকী!</h3>
                <p className="text-xs text-slate-500 font-bold">আপনাদের যৌথ জীবন হোক সীমাহীন ভালোবাসা, বোঝাপড়া ও শান্তিময়।</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-red-600 block">{toBn(timeLeft.days)}</span>
                  <span className="text-[10px] font-bold text-slate-400">দিন</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-red-600 block">{toBn(timeLeft.hours)}</span>
                  <span className="text-[10px] font-bold text-slate-400">ঘণ্টা</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-red-600 block">{toBn(timeLeft.minutes)}</span>
                  <span className="text-[10px] font-bold text-slate-400">মিনিট</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-black text-red-600 block">{toBn(timeLeft.seconds)}</span>
                  <span className="text-[10px] font-bold text-slate-400">সেকেন্ড</span>
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="mt-6 border-t border-slate-200/60 pt-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider text-center mb-2">
                একসাথে পথচলার মধুর সময়
              </span>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 block">মোট মাস</span>
                  <span className="font-black text-slate-700 text-xs mt-1 block">{toBn(stats.totalMonths)} মাস</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 block">মোট সপ্তাহ</span>
                  <span className="font-black text-slate-700 text-xs mt-1 block">{toBn(stats.totalWeeks)} সপ্তাহ</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 block">মোট দিন</span>
                  <span className="font-black text-red-500 text-xs mt-1 block">{toBn(stats.totalDays)} দিন</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Family Budget Planner (পরিবার বাজেট পরিকল্পনাকারী)
// ============================================================================
interface BudgetCategoryAllocation {
  id: string;
  name: string;
  allocated: number;
}

interface ExpenseItem {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
}

const DEFAULT_CATEGORIES: BudgetCategoryAllocation[] = [
  { id: 'food', name: 'খাদ্য ও বাজার', allocated: 12000 },
  { id: 'rent', name: 'বাড়ি ভাড়া ও ইউটিলিটি', allocated: 15000 },
  { id: 'medical', name: 'চিকিৎসা ও স্বাস্থ্য', allocated: 3000 },
  { id: 'education', name: 'শিক্ষা ও স্কুল ফি', allocated: 5000 },
  { id: 'transport', name: 'যাতায়াত', allocated: 2000 },
  { id: 'savings', name: 'সঞ্চয় ও ডিপিএস', allocated: 5000 },
  { id: 'entertainment', name: 'বিনোদন ও উপহার', allocated: 2000 },
  { id: 'others', name: 'অন্যান্য খরচ', allocated: 2000 },
];

export function FamilyBudgetPlanner({ onGoBack }: { onGoBack: () => void }) {
  const [income, setIncome] = useState<number>(45000);
  const [categories, setCategories] = useState<BudgetCategoryAllocation[]>(() => {
    const saved = localStorage.getItem('family_budget_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('family_budget_expenses');
    return saved ? JSON.parse(saved) : [
      { id: '1', categoryId: 'food', name: 'কাঁচাবাজার', amount: 3500, date: new Date().toISOString().split('T')[0] },
      { id: '2', categoryId: 'rent', name: 'বাসা ভাড়া', amount: 14000, date: new Date().toISOString().split('T')[0] },
    ];
  });

  // Modal / Inputs for adding Expense
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat] = useState('food');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Edit category allocations
  const [editingAllocations, setEditingAllocations] = useState(false);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('family_budget_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('family_budget_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expName || isNaN(amt) || amt <= 0) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      categoryId: expCat,
      name: expName,
      amount: amt,
      date: expDate
    };

    setExpenses([newItem, ...expenses]);
    setExpName('');
    setExpAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleCategoryAllocationChange = (id: string, val: string) => {
    const amt = parseFloat(val) || 0;
    setCategories(categories.map(c => c.id === id ? { ...c, allocated: amt } : c));
  };

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingCash = income - totalSpent;

  // Calculate spent per category
  const getCategorySpent = (catId: string) => {
    return expenses.filter(e => e.categoryId === catId).reduce((sum, e) => sum + e.amount, 0);
  };

  // Financial advice
  const getBudgetAdvice = () => {
    const percentage = income > 0 ? (totalSpent / income) * 100 : 0;
    if (percentage === 0) {
      return {
        label: 'বাজেট শুরু করুন',
        desc: 'আপনার খরচ তালিকাভুক্ত করা শুরু করতে নিচে দৈনিক খরচ যোগ করুন।',
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      };
    }
    if (percentage > 100) {
      return {
        label: '🚨 বাজেট সংকট!',
        desc: `আপনার মোট খরচ মোট পারিবারিক আয় ছাড়িয়ে গেছে ${formatBnCurrency(totalSpent - income)} টাকা! অপ্রয়োজনীয় খরচ অবিলম্বে কমান।`,
        color: 'bg-rose-50 border-rose-200 text-rose-800'
      };
    }
    if (percentage > 90) {
      return {
        label: '⚠️ সর্বোচ্চ সতর্ক অবস্থা!',
        desc: 'আপনি আয়ের ৯০%-এর বেশি খরচ করে ফেলেছেন। জরুরি প্রয়োজন ছাড়া আর কোনো খরচ না করার পরামর্শ রইলো।',
        color: 'bg-amber-50 border-amber-200 text-amber-800'
      };
    }
    if (percentage > 70) {
      return {
        label: 'মোটামুটি নিয়ন্ত্রণে আছে',
        desc: 'আপনার ব্যয়ের হার কিছুটা বেশি। মাসের বাকি দিনগুলো একটু বুঝে খরচ করলে সঞ্চয়ের লক্ষ্য পূরণ হবে।',
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      };
    }
    return {
      label: 'চমৎকার নিয়ন্ত্রণে আছে! 🎉',
      desc: 'আপনার খরচ বাজেটের নিখুঁত সীমানায় রয়েছে। আপনি সুন্দরভাবে সঞ্চয়ের পথে এগিয়ে যাচ্ছেন।',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    };
  };

  const advice = getBudgetAdvice();

  return (
    <div id="budget_planner_card" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-5xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white flex justify-between items-center">
        <div>
          <button id="budget_back_btn" onClick={onGoBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" /> ফিরে যান
          </button>
          <h2 id="budget_title" className="text-xl font-black mt-2 flex items-center gap-2">
            <Coins className="w-6 h-6" /> পরিবার বাজেট পরিকল্পনাকারী (Family Budget)
          </h2>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-bold">পরিবার</span>
      </div>

      {/* Financial Status Summary */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">মাসিক পারিবারিক আয়</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-black text-teal-600">{formatBnCurrency(income)}</span>
            <input
              type="number"
              value={income || ""}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              className="w-20 border border-slate-200 bg-slate-50 text-xs px-2 py-1 rounded font-bold"
              placeholder="আয়"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">মোট বাজেট বরাদ্দ</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {formatBnCurrency(totalAllocated)} 
            <span className="text-[10px] text-slate-400 font-bold ml-1">
              ({toBn(Math.round((totalAllocated / (income || 1)) * 100))}% বরাদ্দ)
            </span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">মোট বাস্তব ব্যয়</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            {formatBnCurrency(totalSpent)}
            <span className="text-[10px] text-slate-400 font-bold ml-1">
              ({toBn(Math.round((totalSpent / (income || 1)) * 100))}% ব্যয়)
            </span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">অবশিষ্ট সঞ্চয় / ব্যালেন্স</span>
          <span className={`text-xl font-black mt-1 block ${remainingCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatBnCurrency(remainingCash)}
          </span>
        </div>
      </div>

      {/* Advice banner */}
      <div className="px-6 py-4">
        <div className={`p-4 rounded-2xl border ${advice.color} flex items-start gap-3`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-black block">{advice.label}</span>
            <span className="text-xs font-semibold block mt-0.5">{advice.desc}</span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Budget Allocations & Categories */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1">
                <TrendingUp size={14} className="text-teal-600" /> খাতওয়ারী বাজেট বরাদ্দ
              </h3>
              <button
                onClick={() => setEditingAllocations(!editingAllocations)}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                {editingAllocations ? 'সম্পন্ন করুন' : 'বরাদ্দ পরিবর্তন'}
              </button>
            </div>

            <div className="space-y-4">
              {categories.map(cat => {
                const spent = getCategorySpent(cat.id);
                const percent = cat.allocated > 0 ? Math.min(100, Math.round((spent / cat.allocated) * 100)) : 0;
                
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{cat.name}</span>
                      
                      {editingAllocations ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={cat.allocated || ""}
                            onChange={(e) => handleCategoryAllocationChange(cat.id, e.target.value)}
                            className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-right font-bold text-xs"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">৳</span>
                        </div>
                      ) : (
                        <span className="font-black text-slate-500">
                          <span className="text-rose-500">{toBn(spent)}</span> / {toBn(cat.allocated)} ৳
                          <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">
                            {toBn(percent)}%
                          </span>
                        </span>
                      )}
                    </div>

                    {!editingAllocations && (
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Expenses Record & Add Expenses */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Expense Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-700">✍️ নতুন পারিবারিক ব্যয় যোগ করুন</h3>
            
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">ব্যয়ের নাম/বিবরণ:</label>
                <input
                  type="text"
                  value={expName || ""}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="যেমন: কারেন্ট বিল, চিনি ও তেল"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    value={expAmount || ""}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="৳"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">ব্যয়ের তারিখ:</label>
                  <input
                    type="date"
                    value={expDate || ""}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">ব্যয়ের খাত বা ক্যাটাগরি:</label>
                <select
                  value={expCat || ""}
                  onChange={(e) => setExpCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id || ""}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> ব্যয় যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-black text-slate-700">📋 ব্যয়ের ইতিহাস</h3>
              <span className="text-[10px] font-bold text-slate-400">সর্বমোট {toBn(expenses.length)}টি</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {expenses.length > 0 ? (
                expenses.map(exp => {
                  const cat = categories.find(c => c.id === exp.categoryId);
                  return (
                    <div key={exp.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/60 text-xs">
                      <div className="text-left">
                        <span className="font-bold text-slate-800 block">{exp.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold block">
                          {cat?.name || 'অন্যান্য'} • {toBn(exp.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-rose-600">-{toBn(exp.amount)} ৳</span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-[11px] font-bold text-slate-400 py-8">
                  কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

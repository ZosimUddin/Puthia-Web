import React, { useState } from 'react';
import { 
  AlertTriangle, Phone, MapPin, Clock, ShieldCheck, 
  ShieldAlert, Copy, Share2, Check, ExternalLink, 
  Heart, Flame, Stethoscope, Search, Ambulance, 
  CloudRain, Shield, Zap, AlertCircle, MessageCircle
} from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export type EmergencyCategoryKey = 
  | 'blood' 
  | 'fire' 
  | 'medical' 
  | 'missing' 
  | 'accident' 
  | 'disaster' 
  | 'security' 
  | 'utility' 
  | 'other';

export interface EmergencyCategoryMeta {
  id: EmergencyCategoryKey;
  label: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const EMERGENCY_CATEGORIES: EmergencyCategoryMeta[] = [
  { id: 'blood', label: 'রক্ত প্রয়োজন (Blood Needed)', icon: '🩸', badgeBg: 'bg-rose-100', badgeText: 'text-rose-800', borderColor: 'border-rose-300' },
  { id: 'fire', label: 'অগ্নিকাণ্ড ও ফায়ার সার্ভিস', icon: '🔥', badgeBg: 'bg-orange-100', badgeText: 'text-orange-800', borderColor: 'border-orange-300' },
  { id: 'medical', label: 'চিকিৎসা ও হাসপাতাল', icon: '🏥', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { id: 'accident', label: 'সড়ক দুর্ঘটনা ও উদ্ধার', icon: '🚑', badgeBg: 'bg-red-100', badgeText: 'text-red-800', borderColor: 'border-red-300' },
  { id: 'missing', label: 'নিখোঁজ সংবাদ ও সন্ধান', icon: '🔍', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-800', borderColor: 'border-indigo-300' },
  { id: 'disaster', label: 'প্রাকৃতিক দুর্যোগ ও বন্যা', icon: '⛈️', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', borderColor: 'border-blue-300' },
  { id: 'security', label: 'আইনশৃঙ্খলা ও পুলিশ', icon: '👮', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800', borderColor: 'border-purple-300' },
  { id: 'utility', label: 'বিদ্যুৎ / গ্যাস / পানি বিভ্রাট', icon: '⚡', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', borderColor: 'border-amber-300' },
  { id: 'other', label: 'অন্যান্য জরুরি সাহায্য', icon: '⚠️', badgeBg: 'bg-slate-100', badgeText: 'text-slate-800', borderColor: 'border-slate-300' },
];

export function getEmergencyCategoryMeta(catKey?: string): EmergencyCategoryMeta {
  if (!catKey) return EMERGENCY_CATEGORIES[EMERGENCY_CATEGORIES.length - 1];
  const found = EMERGENCY_CATEGORIES.find(c => c.id === catKey || c.label.includes(catKey));
  return found || {
    id: 'other',
    label: catKey.startsWith('🏷️') ? catKey : `🚨 ${catKey}`,
    icon: '🚨',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    borderColor: 'border-rose-300'
  };
}

export interface EmergencyAlertBannerProps {
  category?: string;
  location?: string;
  contact?: string;
  contactPerson?: string;
  time?: string;
  verificationStatus?: 'verified' | 'unverified' | 'in_review' | string;
  verifiedBy?: string;
  postId?: string;
  postTitle?: string;
  isAdmin?: boolean;
  onToggleVerification?: (postId: string, newStatus: 'verified' | 'unverified') => Promise<void> | void;
  className?: string;
}

export function EmergencyAlertBanner({
  category = 'blood',
  location,
  contact,
  contactPerson,
  time,
  verificationStatus = 'unverified',
  verifiedBy,
  postId,
  postTitle,
  isAdmin = false,
  onToggleVerification,
  className = ''
}: EmergencyAlertBannerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isVerified = verificationStatus === 'verified';
  const catMeta = getEmergencyCategoryMeta(category);

  // Copy helper
  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} কপি করা হয়েছে!`);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      toast.error('কপি করা সম্ভব হয়নি।');
    }
  };

  // Copy full emergency brief
  const handleCopyFullBrief = () => {
    const brief = [
      `🚨 [পুঠিয়া জরুরি তথ্য]`,
      `ধরন: ${catMeta.label}`,
      location ? `স্থান: ${location}` : '',
      contact ? `যোগাযোগ: ${contact} ${contactPerson ? `(${contactPerson})` : ''}` : '',
      time ? `সময়: ${time}` : '',
      `যাচাইকরণ: ${isVerified ? `যাচাইকৃত (${verifiedBy || 'উপজেলা প্রশাসন'})` : 'অপুনঃযাচাইকৃত (সতর্কতা অবলম্বন করুন)'}`,
      `সূত্র: পুঠিয়া ডিজিটাল সেবা পোর্টাল`
    ].filter(Boolean).join('\n');

    handleCopy(brief, 'সম্পূর্ণ জরুরি তথ্য');
  };

  // Share emergency alert
  const handleShareAlert = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🚨 জরুরি তথ্য: ${catMeta.label}`,
          text: `জরুরি নোটিশ: ${postTitle || catMeta.label}\nস্থান: ${location || 'পুঠিয়া'}\nযোগাযোগ: ${contact || 'বিস্তারিত দেখুন'}`,
          url: window.location.href
        });
      } catch {
        handleCopyFullBrief();
      }
    } else {
      handleCopyFullBrief();
    }
  };

  // Toggle Verification Handler for Admins
  const handleAdminVerifyToggle = async () => {
    if (!isAdmin || !onToggleVerification || !postId) return;
    try {
      setIsVerifying(true);
      const nextStatus = isVerified ? 'unverified' : 'verified';
      await onToggleVerification(postId, nextStatus);
      toast.success(nextStatus === 'verified' ? 'তথ্যটি যাচাইকৃত (Verified) হিসেবে চিহ্নিত করা হয়েছে।' : 'যাচাইকরণ স্ট্যাটাস প্রত্যাহার করা হয়েছে।');
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      toast.error('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all shadow-sm ${
      isVerified 
        ? 'border-rose-500/80 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 shadow-rose-500/5' 
        : 'border-amber-400 bg-gradient-to-br from-amber-50/90 via-white to-rose-50/30 shadow-amber-500/5'
    } ${className}`}>
      
      {/* Top Pulse Glow Beacon Bar */}
      <div className={`h-1.5 w-full ${isVerified ? 'bg-rose-500' : 'bg-amber-500'} flex items-center justify-end overflow-hidden`}>
        <div className="w-full h-full bg-white/40 animate-pulse" />
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        
        {/* 1. Header: 🚨 জরুরি তথ্য Indicator & Verification Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80">
          
          {/* Main Indicator: 🚨 জরুরি তথ্য */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-rose-700 tracking-tight flex items-center gap-1">
                <span>🚨</span>
                <span>জরুরি তথ্য</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 tracking-wider">
                Emergency Alert
              </span>
            </div>
          </div>

          {/* Verification Status (Verified / Unverified) Badge */}
          <div className="flex items-center gap-2">
            {isVerified ? (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                title="উপজেলা প্রশাসন বা স্থানীয় কর্তৃপক্ষ কর্তৃক এই তথ্যের সত্যতা যাচাই করা হয়েছে"
              >
                <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                <span>যাচাইকৃত তথ্য (Verified)</span>
              </div>
            ) : (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                title="এই তথ্যের সত্যতা এখনো উপজেলা প্রশাসন কর্তৃক যাচাই করা হয়নি"
              >
                <ShieldAlert size={14} className="text-amber-700 shrink-0" />
                <span>অপুনঃযাচাইকৃত (Unverified)</span>
              </div>
            )}

            {/* Admin Verification Quick Toggle Button */}
            {isAdmin && onToggleVerification && postId && (
              <button
                type="button"
                onClick={handleAdminVerifyToggle}
                disabled={isVerifying}
                className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-colors border cursor-pointer ${
                  isVerified
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-xs'
                }`}
                title="এডমিন হিসেবে জরুরি তথ্যের ভেরিফিকেশন পরিবর্তন করুন"
              >
                {isVerifying ? "প্রসেসিং..." : (isVerified ? "যাচাই প্রত্যাহার" : "যাচাই করুন (Verify)")}
              </button>
            )}
          </div>
        </div>

        {/* 2. Emergency Information Grid (Category, Location, Contact, Time) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* A. Emergency Category */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
            <span className="text-xl shrink-0 mt-0.5">{catMeta.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">জরুরি ক্যাটাগরি (Category)</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {catMeta.label}
              </p>
            </div>
          </div>

          {/* B. Emergency Location */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ঘটনাস্থল / এলাকা (Location)</p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {location || "পুঠিয়া, রাজশাহী"}
              </p>
            </div>
          </div>

          {/* C. Emergency Contact (with direct Call & Copy) */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs sm:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#006a4e] flex items-center justify-center shrink-0">
              <Phone size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">জরুরি যোগাযোগ (Contact)</p>
                {contactPerson && (
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {contactPerson}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                <p className="text-sm sm:text-base font-black text-[#006a4e] tracking-wide">
                  {contact || "জরুরি হটলাইন: ৯৯৯ / ০১৩১৮-৩০০০৪৪"}
                </p>

                {/* Contact Quick Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {contact && (
                    <>
                      <a
                        href={`tel:${contact.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black shadow-xs transition-colors no-underline"
                      >
                        <Phone size={13} />
                        <span>কল করুন</span>
                      </a>
                      
                      <button
                        type="button"
                        onClick={() => handleCopy(contact, 'ফোন নম্বর')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border-0 cursor-pointer"
                        title="নম্বর কপি করুন"
                      >
                        {copiedField === 'ফোন নম্বর' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedField === 'ফোন নম্বর' ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* D. Incident Time & Date */}
          {time && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs sm:col-span-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">জরুরি সময় / সময়সীমা (Time)</p>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                  {time}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Verification Notice Banner */}
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
          isVerified 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          {isVerified ? (
            <>
              <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">যাচাইকৃত জরুরি তথ্য</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {verifiedBy 
                    ? `${verifiedBy} কর্তৃক এই তথ্যের সত্যতা ও যোগাযোগের যথার্থতা নিশ্চিত করা হয়েছে।`
                    : 'পুঠিয়া উপজেলা প্রশাসন ও স্থানীয় স্বেচ্ছাসেবক টিম কর্তৃক তথ্যের সত্যতা যাচাই করা হয়েছে।'
                  }
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">অপুনঃযাচাইকৃত তথ্য — সতর্কতা অবলম্বন করুন</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  এই তথ্যটি একজন সম্মানিত নাগরিক কর্তৃক পোস্ট করা হয়েছে এবং এখনো উপজেলা কর্তৃপক্ষ কর্তৃক যাচাই করা হয়নি। কোনো আর্থিক লেনদেন বা পদক্ষেপ নেওয়ার পূর্বে নিজ দায়িত্বে ফোন করে নিশ্চিত হোন।
                </p>
              </div>
            </>
          )}
        </div>

        {/* 4. Bottom Action Bar: Share Alert & Copy Brief */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
          <button
            type="button"
            onClick={handleShareAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors shadow-xs border-0 cursor-pointer"
          >
            <Share2 size={13} />
            <span>সতর্কবার্তা শেয়ার করুন</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFullBrief}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border-0 cursor-pointer"
          >
            {copiedField === 'সম্পূর্ণ জরুরি তথ্য' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedField === 'সম্পূর্ণ জরুরি তথ্য' ? 'তথ্য কপি হয়েছে' : 'সম্পূর্ণ তথ্য কপি করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyAlertBanner;

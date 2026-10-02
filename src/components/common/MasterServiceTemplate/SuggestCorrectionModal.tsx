import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, Send, AlertCircle, Edit3, Phone, MapPin,
  Clock, Building2, Sparkles, Award, ArrowLeft, ArrowRight, Eye
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { ServiceConfig } from '../../../config/servicesConfig';

export interface CorrectionTarget {
  id?: string;
  title: string;
  serviceId: string;
  serviceTitle: string;
  collectionName: string;
  currentPhone?: string;
  currentAddress?: string;
  currentHours?: string;
}

interface SuggestCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: CorrectionTarget;
  onSuccess?: () => void;
}

const CORRECTION_REASONS = [
  { id: 'wrong_phone', label: '📞 এই ফোন নম্বরটি ভুল / বন্ধ', desc: 'সঠিক নম্বরটি দিন যাতে মানুষ যোগাযোগ করতে পারে' },
  { id: 'address_changed', label: '📍 ঠিকানা পরিবর্তন হয়েছে', desc: 'নতুন বা পরিবর্তিত সঠিক ঠিকানা দিন' },
  { id: 'closed', label: '🏢 এই প্রতিষ্ঠানটি আর চালু নেই / বন্ধ হয়ে গেছে', desc: 'প্রতিষ্ঠানটি বন্ধ থাকার তথ্য নিশ্চিত করুন' },
  { id: 'new_hours', label: '⏰ নতুন সময়সূচি হয়েছে / সেবা সময় পরিবর্তন', desc: 'বর্তমান সঠিক সময়সূচি দিন' },
  { id: 'other', label: '🔄 অন্যান্য তথ্য আপডেট বা সংশোধন', desc: 'নাম, সেবা বা অতিরিক্ত কোনো তথ্য সংযোজন' },
];

export const SuggestCorrectionModal: React.FC<SuggestCorrectionModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess,
}) => {
  const { user, userProfile } = useAuth();

  // Wizard Steps: 'form' -> 'preview' -> 'success'
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');

  const [reason, setReason] = useState<string>('wrong_phone');
  const [correctionDetails, setCorrectionDetails] = useState<string>('');
  const [correctPhone, setCorrectPhone] = useState<string>('');
  const [correctAddress, setCorrectAddress] = useState<string>('');
  const [sourceProof, setSourceProof] = useState<string>('');
  const [userContact, setUserContact] = useState<string>(userProfile?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!reason) {
      setErrorMessage('অনুগ্রহ করে সংশোধনের কারণ নির্বাচন করুন।');
      return;
    }

    if (!correctionDetails.trim() && !correctPhone.trim() && !correctAddress.trim()) {
      setErrorMessage('অনুগ্রহ করে সংশোধিত সঠিক তথ্য বা বিবরণ লিখুন।');
      return;
    }

    setStep('preview');
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedReasonObj = CORRECTION_REASONS.find((r) => r.id === reason);

      const payload = {
        targetItemId: target.id || 'general',
        targetTitle: target.title || 'সাধারণ তথ্য',
        serviceId: target.serviceId,
        serviceTitle: target.serviceTitle,
        targetCollection: target.collectionName,
        reasonId: reason,
        reasonLabel: selectedReasonObj?.label || reason,
        correctionDetails: correctionDetails.trim(),
        correctPhone: correctPhone.trim(),
        correctAddress: correctAddress.trim(),
        sourceProof: sourceProof.trim(),
        userContact: userContact.trim(),
        status: 'pending', // 🟡 যাচাইাধীন
        userId: user?.uid || 'anonymous',
        userName: userProfile?.name || user?.displayName || 'সচেতন নাগরিক',
        userEmail: user?.email || '',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'corrections'), payload);

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2500);
    } catch (err: any) {
      console.error('Error submitting correction:', err);
      setErrorMessage('সংশোধন প্রস্তাব জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonObj = CORRECTION_REASONS.find((r) => r.id === reason);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-white overflow-hidden flex flex-col w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="w-full h-full flex flex-col bg-white overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-[#006a4e] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
              <div className="pr-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white border-none cursor-pointer transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      পুরোনো তথ্য সংশোধন করুন
                    </h2>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium mt-0.5 truncate max-w-[200px] xs:max-w-xs sm:max-w-md">
                    প্রতিষ্ঠান: <span className="font-black text-white">{target.title}</span> ({target.serviceTitle})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:block p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border-none cursor-pointer transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Stepper Indicator */}
          {step !== 'success' && (
            <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 text-xs font-black shrink-0">
              <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
                <div className={`flex items-center gap-1.5 ${step === 'form' ? 'text-[#006a4e]' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'form' ? 'bg-[#006a4e] text-white' : 'bg-slate-200'}`}>
                    ১
                  </span>
                  <span>সংশোধন লিখুন</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
                <div className={`flex items-center gap-1.5 ${step === 'preview' ? 'text-[#006a4e]' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' ? 'bg-[#006a4e] text-white' : 'bg-slate-200'}`}>
                    ২
                  </span>
                  <span>প্রিভিউ ও যাচাই</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-slate-200">
                    ৩
                  </span>
                  <span>জমা দিন</span>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full p-4 sm:p-5 space-y-4">
              {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: FORM INPUT */}
            {step === 'form' && (
              <form id="correction-form" onSubmit={handleValidateToPreview} className="space-y-4">
                {/* Reward Callout */}
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Award size={16} />
                  </div>
                  <div className="text-xs text-emerald-900 leading-snug">
                    <span className="font-black text-emerald-950 block">কন্ট্রিবিউশন রিওয়ার্ড:</span>
                    সঠিক তথ্য দিয়ে সংশোধন প্রস্তাব পাঠালে এডমিন যাচাই ও অনুমোদনের পর আপনি পাবেন <span className="font-black text-emerald-700">+৫ ইস্টার</span>!
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <span>সংশোধনের ধরন নির্বাচন করুন:</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {CORRECTION_REASONS.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                          reason === r.id
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correction_reason"
                          value={r.id}
                          checked={reason === r.id}
                          onChange={() => setReason(r.id)}
                          className="mt-0.5 text-[#006a4e] focus:ring-[#006a4e]"
                        />
                        <div className="text-xs">
                          <p className="font-black text-slate-900">{r.label}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Inputs based on Reason */}
                {reason === 'wrong_phone' && (
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">
                      সঠিক ফোন নম্বর: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={correctPhone}
                      onChange={(e) => setCorrectPhone(e.target.value)}
                      placeholder="যেমন: 017xxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                      required
                    />
                  </div>
                )}

                {reason === 'address_changed' && (
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">
                      নতুন বা পরিবর্তিত সঠিক ঠিকানা: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={correctAddress}
                      onChange={(e) => setCorrectAddress(e.target.value)}
                      placeholder="যেমন: বানেশ্বর বাজার, পুঠিয়া (নতুন স্থান)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                      required
                    />
                  </div>
                )}

                {/* Details / Explanation */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">
                    সংশোধনের বিবরণ ও সঠিক তথ্য: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={correctionDetails}
                    onChange={(e) => setCorrectionDetails(e.target.value)}
                    placeholder="সঠিক তথ্য বিস্তারিত লিখুন (যেমন: ডাক্তার সাহেব এখন বিকাল ৪টায় বসেন বা নম্বর পরিবর্তন হয়েছে)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                    required
                  />
                </div>

                {/* Proof / Verification Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">
                      আপনার ফোন নম্বর (যাচাইকরণের জন্য):
                    </label>
                    <input
                      type="tel"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">
                      তথ্যসূত্র বা প্রমাণ (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      value={sourceProof}
                      onChange={(e) => setSourceProof(e.target.value)}
                      placeholder="যেমন: ভিজিটিং কার্ড, সাইনবোর্ড বা ফেসবুক পেজ"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: PREVIEW MODE */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <Eye size={16} className="text-[#006a4e] shrink-0" />
                  <span>জমা দেওয়ার আগে আপনার দেওয়া সংশোধিত তথ্যগুলো মিলিয়ে নিন:</span>
                </div>

                {/* Preview Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      মূল প্রতিষ্ঠান / তথ্য
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5">
                      {target.title}
                    </h3>
                    <p className="text-xs text-[#006a4e] font-bold">
                      বিভাগ: {target.serviceTitle}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block text-[11px]">সংশোধনের ধরন:</span>
                      <span className="font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {selectedReasonObj?.label}
                      </span>
                    </div>

                    {correctPhone && (
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">সংশোধিত ফোন নম্বর:</span>
                        <span className="font-black text-emerald-800">{correctPhone}</span>
                      </div>
                    )}

                    {correctAddress && (
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">সংশোধিত নতুন ঠিকানা:</span>
                        <span className="font-bold text-slate-800">{correctAddress}</span>
                      </div>
                    )}

                    <div>
                      <span className="font-bold text-slate-500 block text-[11px]">আপনার দেওয়া বিস্তারিত বিবরণ:</span>
                      <p className="font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 mt-1 whitespace-pre-line">
                        {correctionDetails}
                      </p>
                    </div>

                    {sourceProof && (
                      <div>
                        <span className="font-bold text-slate-500 block text-[11px]">তথ্যসূত্র:</span>
                        <span className="text-slate-700">{sourceProof}</span>
                      </div>
                    )}
                  </div>

                  {/* Submission Flow Lifecycle Notice */}
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#006a4e] font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>জমা দেওয়ার পর স্ট্যাটাস: 🟡 যাচাইাধীন (Pending Review)</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      এডমিন যাচাই শেষে তথ্যটি 🟢 প্রকাশিত (Published) হিসেবে আপডেট করা হবে এবং আপনার একাউন্টে +৫ ইস্টার যুক্ত হবে।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {step === 'success' && (
              <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    সংশোধন প্রস্তাব জমা সম্পন্ন হয়েছে!
                  </h3>
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-[#006a4e] text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                    <span>🟡 বর্তমান স্ট্যাটাস: যাচাইাধীন</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  ধন্যবাদ আপনার অবদানের জন্য! আমাদের টিম তথ্যটি যাচাই করবে। অনুমোদন হওয়া মাত্রই মূল পেজের তথ্য আপডেট হবে এবং আপনার প্রোফাইলে <strong>+৫ ইস্টার</strong> জমা হবে।
                </p>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-black flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  <span>তথ্য অনুমোদনে পাবেন +৫ ইস্টার!</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#006a4e] text-white text-xs font-black rounded-2xl border-none cursor-pointer shadow-md hover:bg-[#00543e] transition-all"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            )}
            </div>
          </div>

          {/* Footer Controls */}
          {step !== 'success' && (
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-2.5">
                {step === 'preview' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ArrowLeft size={14} />
                      <span>সম্পাদনা করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 border-none cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send size={15} />
                      <span>{isSubmitting ? 'জমা হচ্ছে...' : 'সংশোধন জমা দিন'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 cursor-pointer transition-colors"
                    >
                      বাতিল
                    </button>

                    <button
                      type="submit"
                      form="correction-form"
                      className="px-5 py-2.5 bg-[#006a4e] hover:bg-[#00543e] text-white text-xs font-black rounded-2xl flex items-center gap-1.5 border-none cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <span>প্রিভিউ দেখুন</span>
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

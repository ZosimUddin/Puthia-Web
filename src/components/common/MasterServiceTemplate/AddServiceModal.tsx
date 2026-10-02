import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, Send, AlertCircle, Image as ImageIcon, Trash2, Camera,
  Eye, Edit3, ArrowRight, ArrowLeft, Award, Sparkles, AlertTriangle, ShieldCheck,
  Building2, Phone, MapPin, Clock
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { ServiceConfig } from '../../../config/servicesConfig';
import { SuggestCorrectionModal } from './SuggestCorrectionModal';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ServiceConfig;
  onSuccess?: () => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  config,
  onSuccess,
}) => {
  const { user, userProfile } = useAuth();
  
  // Wizard steps: 'form' | 'preview' | 'success'
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Duplicate warning state
  const [duplicateItem, setDuplicateItem] = useState<{ id?: string; name: string } | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMessage(null);
      setDuplicateItem(null);
      setShowDuplicateWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ছবিটির সাইজ ১০ মেগাবাইটের কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(compressedDataUrl);
          setErrorMessage(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1 -> Step 2 validation + Duplicate detection
  const handleProceedToPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate required fields
    for (const field of config.addFormFields) {
      if (field.required && !formData[field.id]?.trim()) {
        setErrorMessage(`"${field.label}" ঘরটি পূরণ করা আবশ্যক।`);
        return;
      }
    }

    // 2. Duplicate detection check
    const nameField = config.fieldsSchema.nameKey || 'name';
    const enteredName = (formData[nameField] || formData.name || formData.title || '').trim();

    if (enteredName && !showDuplicateWarning) {
      try {
        const colRef = collection(db, config.collectionName);
        const snap = await getDocs(colRef);
        const found = snap.docs.find((d) => {
          const data = d.data();
          const existingName = (data.name || data.title || data[nameField] || '').trim().toLowerCase();
          return existingName && (existingName === enteredName.toLowerCase() || existingName.includes(enteredName.toLowerCase()) || enteredName.toLowerCase().includes(existingName));
        });

        if (found) {
          const dData = found.data();
          setDuplicateItem({ id: found.id, name: dData.name || dData.title || enteredName });
          setShowDuplicateWarning(true);
          return;
        }
      } catch (err) {
        console.warn('Duplicate check skipped due to network/rules:', err);
      }
    }

    setShowDuplicateWarning(false);
    setStep('preview');
  };

  // Step 2 -> Step 3: Final Submit to Firestore
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...formData,
        imageUrl: selectedImage || formData.imageUrl || formData.image || formData.photo || '',
        image: selectedImage || formData.imageUrl || formData.image || formData.photo || '',
        photo: selectedImage || formData.imageUrl || formData.image || formData.photo || '',
        serviceId: config.id,
        serviceTitle: config.title,
        status: 'pending', // 🟡 যাচাইাধীন (Pending Admin Verification)
        isVerified: false,
        userId: user?.uid || 'anonymous',
        userName: userProfile?.name || user?.displayName || 'সচেতন নাগরিক',
        userEmail: user?.email || '',
        userPhone: userProfile?.phone || formData.phone || formData.contactNumber || '',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
        rating: 5.0,
        reviewCount: 1,
      };

      await addDoc(collection(db, config.collectionName), payload);

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2500);
    } catch (err: any) {
      console.error('Error submitting service document:', err);
      setErrorMessage('তথ্য জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameField = config.fieldsSchema.nameKey || 'name';
  const itemName = formData[nameField] || formData.name || formData.title || 'নতুন তথ্য';

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[99999] bg-white overflow-hidden flex flex-col w-full h-full">
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
                      <span className="text-xl sm:text-2xl">{config.icon}</span>
                      <h2 className="text-base sm:text-lg font-black tracking-tight">
                        নতুন {config.title} তথ্য যোগ করুন
                      </h2>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium mt-0.5">
                      তথ্য দেখুন → সম্পাদনা করুন → জমা দিন
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

            {/* Stepper Wizard Bar */}
            {step !== 'success' && (
              <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 text-xs font-black shrink-0">
                <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 ${step === 'form' ? 'text-[#006a4e]' : 'text-slate-400'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'form' ? 'bg-[#006a4e] text-white' : 'bg-slate-200'}`}>
                      ১
                    </span>
                    <span>তথ্য লিখুন</span>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto w-full p-4 sm:p-5 space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

              {/* DUPLICATE WARNING MODAL / PROMPT */}
              {showDuplicateWarning && duplicateItem && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-xs font-black text-amber-950">
                        সতর্কতা: এই নামে একটি তথ্য ইতিমধ্যে রয়েছে!
                      </h4>
                      <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                        ডাটাবেজে <strong>"{duplicateItem.name}"</strong> নামে ইতিমধ্যে একটি তথ্য রয়েছে। ডুপ্লিকেট তথ্য যোগ করার পরিবর্তে আপনি কি এটির তথ্য সংশোধন বা আপডেট করতে চান?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDuplicateWarning(false);
                        setShowCorrectionModal(true);
                      }}
                      className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Edit3 size={14} />
                      <span>✏️ পুরোনো তথ্য সংশোধন করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDuplicateWarning(false);
                        setStep('preview');
                      }}
                      className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer"
                    >
                      তবুও নতুন হিসেবে এগিয়ে যান
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 1: FORM INPUT */}
              {step === 'form' && !showDuplicateWarning && (
                <form id="add-service-form" onSubmit={handleProceedToPreview} className="space-y-4">
                  {/* Reward & Verification Callout */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#006a4e] text-white rounded-xl shrink-0 mt-0.5">
                      <Award size={16} />
                    </div>
                    <div className="text-xs text-emerald-950 leading-snug">
                      <span className="font-black text-[#006a4e] block">কন্ট্রিবিউশন রিওয়ার্ড সিস্টেম:</span>
                      সঠিক তথ্য জমা দিলে এডমিন অনুমোদনের পর আপনি পাবেন <strong className="text-emerald-800">+৫ ইস্টার</strong>!
                    </div>
                  </div>

                  {/* Image Upload Component */}
                  <div className="space-y-1.5 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <ImageIcon size={16} className="text-[#006a4e]" />
                      <span>ছবি যুক্ত করুন (ঐচ্ছিক)</span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {selectedImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-emerald-200 mt-2 bg-white p-2 flex items-center gap-3">
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0 text-xs font-bold text-slate-700">
                          <p className="text-emerald-700 font-extrabold flex items-center gap-1">
                            <CheckCircle2 size={14} /> ছবি প্রস্তুত রয়েছে
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                            তথ্য জমার সাথে ছবিটি সংরক্ষিত হবে
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none cursor-pointer"
                          title="ছবি মুছে ফেলুন"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 px-3 bg-white hover:bg-emerald-50/50 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-black text-[#006a4e] flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Camera size={18} />
                          <span>গ্যালারি বা ক্যামেরা থেকে ছবি তুলুন / আপলোড করুন</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form Fields Mapping */}
                  <div className="space-y-3.5">
                    {config.addFormFields
                      .filter(
                        (f) =>
                          f.id !== 'imageUrl' &&
                          f.id !== 'image' &&
                          f.id !== 'photo' &&
                          f.id !== 'avatar' &&
                          !f.label.includes('ছবি') &&
                          !f.label.includes('ইমেজ')
                      )
                      .map((field) => (
                        <div key={field.id} className="space-y-1 text-left">
                          <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              {field.label} {field.required && <span className="text-rose-500">*</span>}
                            </span>
                            {field.required ? (
                              <span className="text-[10px] font-semibold text-rose-400">আবশ্যক</span>
                            ) : (
                              <span className="text-[10px] font-normal text-slate-400">ঐচ্ছিক</span>
                            )}
                          </label>

                          {field.type === 'select' ? (
                            <div className="space-y-2">
                              <select
                                value={
                                  formData[field.id] && !field.options?.some(o => o.value === formData[field.id])
                                    ? 'অন্যান্য'
                                    : formData[field.id] || ''
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'অন্যান্য') {
                                    handleChange(field.id, customInputs[field.id] || 'অন্যান্য');
                                  } else {
                                    handleChange(field.id, val);
                                  }
                                }}
                                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                                required={field.required}
                              >
                                <option value="">-- {field.label} নির্বাচন করুন --</option>
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {(formData[field.id] === 'অন্যান্য' || (formData[field.id] && !field.options?.some(o => o.value === formData[field.id]))) && (
                                <input
                                  type="text"
                                  placeholder="নির্দিষ্ট বিবরণ নিজে টাইপ করুন..."
                                  value={customInputs[field.id] || (formData[field.id] === 'অন্যান্য' ? '' : formData[field.id])}
                                  onChange={(e) => {
                                    const txt = e.target.value;
                                    setCustomInputs((prev) => ({ ...prev, [field.id]: txt }));
                                    handleChange(field.id, txt.trim() ? txt : 'অন্যান্য');
                                  }}
                                  className="w-full bg-emerald-50/70 border border-emerald-300 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e]"
                                  required={field.required}
                                />
                              )}
                            </div>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                              required={field.required}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#006a4e] transition-all"
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </form>
              )}

              {/* STEP 2: PREVIEW MODE ("তথ্য দেখুন → সম্পাদনা করুন → জমা দিন") */}
              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <Eye size={16} className="text-[#006a4e] shrink-0" />
                    <span>জমা দেওয়ার আগে আপনার দেওয়া তথ্যগুলোর প্রিভিউ দেখে নিন:</span>
                  </div>

                  {/* Visual Preview Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100/80 overflow-hidden border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                        {selectedImage ? (
                          <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span>{config.icon}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                            🟡 যাচাইাধীন (Pending)
                          </span>
                          <span className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            {config.title}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {itemName}
                        </h3>
                        {formData.speciality && (
                          <p className="text-xs font-bold text-[#006a4e]">
                            {formData.speciality}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Breakdown of Form Fields */}
                    <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2 text-xs divide-y divide-slate-100">
                      {config.addFormFields
                        .filter(f => !f.label.includes('ছবি') && !f.label.includes('ইমেজ'))
                        .map(field => {
                          const val = formData[field.id];
                          if (!val) return null;
                          return (
                            <div key={field.id} className="pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                              <span className="text-slate-500 font-bold text-[11px]">{field.label}:</span>
                              <span className="text-slate-900 font-black text-right">{val}</span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Verification Notice */}
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <ShieldCheck size={14} className="text-amber-700" />
                        <span>যাচাইকরণ প্রক্রিয়া:</span>
                      </p>
                      <p className="text-slate-600">
                        আপনার তথ্যটি জমা হওয়ার পর এডমিন টিম কর্তৃক ফোন বা সরাসরি যাচাই করা হবে। অনুমোদনের পর এটি 🟢 প্রকাশিত হবে এবং আপনার একাউন্টে +৫ ইস্টার যুক্ত হবে।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS STATE */}
              {step === 'success' && (
                <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006a4e] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      তথ্য সফলভাবে জমা হয়েছে!
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200">
                      <span>🟡 বর্তমান স্ট্যাটাস: যাচাইাধীন</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    ধন্যবাদ! আপনার জমা দেওয়া তথ্যটি এডমিন যাচাইকরণের কিউতে রয়েছে। এডমিন অনুমোদন দেওয়া মাত্রই এটি সাধারণ ব্যবহারকারীদের জন্য <strong>🟢 প্রকাশিত</strong> হবে।
                  </p>

                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-bold space-y-1 max-w-xs mx-auto text-left">
                    <p className="font-black text-[#006a4e] flex items-center gap-1.5">
                      <Sparkles size={16} />
                      <span>রিওয়ার্ড ও ইস্টার অর্জন:</span>
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      • তথ্য অনুমোদনে পাবেন <strong>+৫ ইস্টার</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#006a4e] text-white text-xs font-black rounded-2xl border-none cursor-pointer shadow-md hover:bg-[#00543e] transition-all"
                  >
                    ঠিক আছে, সম্পন্ন
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* Footer Buttons */}
            {step !== 'success' && !showDuplicateWarning && (
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
                        <span>{isSubmitting ? 'জমা হচ্ছে...' : 'নিশ্চিত ও তথ্য জমা দিন'}</span>
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
                        form="add-service-form"
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

      {/* Suggest Correction Modal if user switched from Duplicate Warning */}
      {showCorrectionModal && duplicateItem && (
        <SuggestCorrectionModal
          isOpen={showCorrectionModal}
          onClose={() => {
            setShowCorrectionModal(false);
            onClose();
          }}
          target={{
            id: duplicateItem.id,
            title: duplicateItem.name,
            serviceId: config.id,
            serviceTitle: config.title,
            collectionName: config.collectionName,
          }}
          onSuccess={() => {
            setShowCorrectionModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

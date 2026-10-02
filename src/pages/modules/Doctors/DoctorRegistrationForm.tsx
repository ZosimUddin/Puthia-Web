import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, ShieldCheck, MapPin, Phone, User, Stethoscope, Clock, DollarSign, Building2, Upload, AlertCircle, Camera, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Doctor } from '../../../types';
import { DOCTOR_SPECIALITIES, UNIONS, RAJSHAHI_UPAZILAS, WEEKDAYS, WORKPLACE_TYPES, PRESET_DOCTOR_AVATARS, getDoctorAvatarUrl } from './constants';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

interface RegistrationFormProps {
  onClose: () => void;
  editDoctor?: Doctor | null;
  onSaved?: () => void;
}

export default function DoctorRegistrationForm({ onClose, editDoctor, onSaved }: RegistrationFormProps) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: editDoctor?.name || '',
    profilePhoto: editDoctor?.profilePhoto || editDoctor?.imageUrl || '',
    gender: editDoctor?.gender || 'পুরুষ',
    phone: editDoctor?.phone || editDoctor?.contactNumber || userProfile?.phone || '',
    email: editDoctor?.email || user?.email || '',
    
    // Professional
    speciality: editDoctor?.speciality || editDoctor?.specialization || DOCTOR_SPECIALITIES[0].id,
    degrees: editDoctor?.degrees || editDoctor?.qualifications || editDoctor?.degree || '',
    bmdcNumber: editDoctor?.bmdcNumber || editDoctor?.bmdc_registration || '',
    experience: editDoctor?.experience ? String(editDoctor.experience) : '',
    treatmentAreasText: editDoctor?.services?.join(', ') || editDoctor?.treatmentAreas?.join(', ') || '',
    
    // Workplace
    workplaceType: editDoctor?.workplaceType || 'hospital',
    workplace: editDoctor?.workplace || '',
    
    // Chamber
    chamberName: editDoctor?.chamberName || '',
    chamberAddress: editDoctor?.chamberAddress || '',
    upazila: editDoctor?.upazila || 'পুঠিয়া',
    union: editDoctor?.union || UNIONS[1],
    village: editDoctor?.village || '',
    chamberDays: editDoctor?.chamberDays || ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    chamberTime: editDoctor?.chamberTime || editDoctor?.consultationTime || 'বিকাল ৫:০০ – রাত ৮:০০',
    visitFee: editDoctor?.visitFee || editDoctor?.fee || '',

    // Contact & Options
    whatsapp: editDoctor?.whatsapp || '',
    onlineConsultation: editDoctor?.onlineConsultation ?? editDoctor?.hasOnlineAppt ?? false,
    emergencyService: editDoctor?.emergencyService ?? false,
    googleMapUrl: editDoctor?.googleMapUrl || '',
    biography: editDoctor?.biography || ''
  });

  const [customPhotoUrl, setCustomPhotoUrl] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('অনুগ্রহ করে একটি ছবি (Image) ফাইল নির্বাচন করুন');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 500;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, profilePhoto: compressedDataUrl }));
          toast.success('ছবি সফলভাবে আপলোড হয়েছে!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => {
      const exists = prev.chamberDays.includes(dayId);
      if (exists) {
        return { ...prev, chamberDays: prev.chamberDays.filter(d => d !== dayId) };
      } else {
        return { ...prev, chamberDays: [...prev.chamberDays, dayId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.degrees.trim() || !formData.bmdcNumber.trim()) {
      toast.error("অনুগ্রহ করে সকল তারকাচিহ্নিত (*) প্রয়োজনীয় তথ্য প্রদান করুন");
      return;
    }

    setLoading(true);

    try {
      const expNum = formData.experience ? parseInt(formData.experience, 10) : 0;
      const slug = formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
      const servicesArray = formData.treatmentAreasText
        ? formData.treatmentAreasText.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const docPayload = {
        name: formData.name.trim(),
        profilePhoto: formData.profilePhoto.trim(),
        imageUrl: formData.profilePhoto.trim(),
        gender: formData.gender,
        phone: formData.phone.trim(),
        contactNumber: formData.phone.trim(),
        email: formData.email.trim(),
        
        speciality: formData.speciality,
        specialization: formData.speciality,
        degrees: formData.degrees.trim(),
        qualifications: formData.degrees.trim(),
        bmdcNumber: formData.bmdcNumber.trim(),
        bmdc_registration: formData.bmdcNumber.trim(),
        experience: expNum,
        services: servicesArray,
        treatmentAreas: servicesArray,

        workplaceType: formData.workplaceType,
        workplace: formData.workplace.trim(),

        chamberName: formData.chamberName.trim() || formData.workplace.trim() || 'প্রধান চেম্বার',
        chamberAddress: formData.chamberAddress.trim(),
        upazila: formData.upazila.trim(),
        union: formData.union,
        village: formData.village.trim(),
        chamberDays: formData.chamberDays,
        consultationDays: formData.chamberDays,
        chamberTime: formData.chamberTime.trim(),
        consultationTime: formData.chamberTime.trim(),
        visitFee: formData.visitFee.trim(),
        fee: formData.visitFee.trim(),

        whatsapp: formData.whatsapp.trim(),
        onlineConsultation: formData.onlineConsultation,
        hasOnlineAppt: formData.onlineConsultation,
        emergencyService: formData.emergencyService,
        googleMapUrl: formData.googleMapUrl.trim(),
        biography: formData.biography.trim(),

        status: editDoctor ? (editDoctor.status || 'pending') : 'pending',
        verificationStatus: editDoctor?.verificationStatus === 'verified' ? 'verified' : 'pending',
        isVerified: editDoctor?.isVerified === true,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'user'
      };

      if (editDoctor?.id) {
        await updateDoc(doc(db, "doctors_list", editDoctor.id), docPayload);
        toast.success("ডাক্তারের তথ্য সফলভাবে আপডেট হয়েছে!");
      } else {
        await addDoc(collection(db, "doctors_list"), {
          ...docPayload,
          slug,
          views: 0,
          rating: 0,
          reviewCount: 0,
          createdAt: serverTimestamp(),
          createdBy: user?.uid || 'user',
          userId: user?.uid || 'user'
        });
        toast.success("আপনার চিকিৎসক তথ্য সফলভাবে জমা হয়েছে!");
      }

      setSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => onClose(), 1800);
    } catch (error) {
      console.error("Doctor registration error:", error);
      toast.error("তথ্য জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Top Header */}
        <div className="bg-[#006a4e] text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h2 className="text-base font-bold text-white">
                {editDoctor ? 'ডাক্তারের তথ্য সম্পাদনা' : 'নতুন ডাক্তার নিবন্ধন'}
              </h2>
              <p className="text-[11px] text-emerald-100">আমাদের পুঠিয়া স্বাস্থ্য তথ্যভাণ্ডার</p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {success ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-2xl p-6">
              <div className="w-16 h-16 bg-emerald-50 text-[#006a4e] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">তথ্য সফলভাবে জমা হয়েছে!</h3>
              <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-md mx-auto">
                আপনার দেওয়া চিকিৎসকের তথ্য আমাদের ডাটাবেসে সংরক্ষিত হয়েছে। BMDC রেজিস্ট্রেশন নম্বর ও তথ্য যাচাইয়ের পর এটি পাবলিক ডিরেক্টরিতে প্রকাশিত হবে।
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Info Notice */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 text-xs text-[#006a4e] font-medium flex items-start gap-2.5">
                <ShieldCheck size={20} className="shrink-0 text-[#006a4e] mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-900">ভেরিফিকেশন প্রক্রিয়া:</span>
                  <span>তথ্য সাবমিটের পর অ্যাডমিন টিম BMDC নম্বর যাচাই করে প্রোফাইল “✓ Verified Doctor” হিসেবে পাবলিক ডিরেক্টরিতে অনুমোদন করবেন।</span>
                </div>
              </div>

              {/* 1. ব্যক্তিগত তথ্য */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[#006a4e]">
                  <User size={14} />
                  ১. ব্যক্তিগত তথ্য
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    চিকিৎসকের পূর্ণ নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="উদাঃ ডা. মোঃ আব্দুল করিম"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">লিঙ্গ</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    >
                      <option value="পুরুষ">পুরুষ</option>
                      <option value="নারী">নারী</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                {/* প্রোফাইল ছবি আপলোড ও নির্বাচন */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera size={14} className="text-[#006a4e]" />
                      <span>চিকিৎসকের প্রোফাইল ছবি</span>
                    </label>
                    {formData.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profilePhoto: '' })}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg"
                      >
                        <Trash2 size={12} />
                        ছবি মুছুন
                      </button>
                    )}
                  </div>

                  {/* Photo Preview & Upload Trigger */}
                  <div className="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-slate-200">
                    <div className="relative shrink-0">
                      <img
                        src={getDoctorAvatarUrl(formData)}
                        alt="Preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80';
                        }}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shadow-xs"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer bg-[#006a4e] hover:bg-[#005a42] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
                          <Upload size={14} />
                          <span>গ্যালারি / ক্যামেরা থেকে আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setCustomPhotoUrl(!customPhotoUrl)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                        >
                          {customPhotoUrl ? 'লিংক লুকান' : 'ছবির লিংক দিন'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">JPG, PNG বা WebP ছবি সিলেক্ট করতে পারেন</p>
                    </div>
                  </div>

                  {/* Custom URL Input if toggled */}
                  {customPhotoUrl && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-slate-600 block">ছবির সরাসরি URL</label>
                      <input
                        type="url"
                        value={formData.profilePhoto}
                        onChange={e => setFormData({ ...formData, profilePhoto: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                      />
                    </div>
                  )}

                  {/* Preset Avatar Selection */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      <span>অথবা ডিফল্ট প্রোফাইল ছবি বেছে নিন:</span>
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_DOCTOR_AVATARS.map((avatar) => {
                        const isSelected = formData.profilePhoto === avatar.url;
                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, profilePhoto: avatar.url })}
                            className={`flex flex-col items-center p-1.5 rounded-xl border transition-all text-center group ${
                              isSelected
                                ? 'border-[#006a4e] bg-emerald-50 ring-2 ring-[#006a4e]/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <img
                              src={avatar.url}
                              alt={avatar.label}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                            />
                            <span className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1">
                              {avatar.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. পেশাগত তথ্য */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[#006a4e]">
                  <Stethoscope size={14} />
                  ২. পেশাগত তথ্য ও BMDC রেজি
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      বিশেষজ্ঞতা <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.speciality}
                      onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    >
                      {DOCTOR_SPECIALITIES.map(sp => (
                        <option key={sp.id} value={sp.id}>{sp.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      BMDC রেজি নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.bmdcNumber}
                      onChange={e => setFormData({ ...formData, bmdcNumber: e.target.value })}
                      placeholder="উদাঃ A-45892"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    শিক্ষাগত ডিগ্রি ও যোগ্যতা <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.degrees}
                    onChange={e => setFormData({ ...formData, degrees: e.target.value })}
                    placeholder="উদাঃ MBBS (DMC), FCPS (মেডিসিন), MD"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">অভিজ্ঞতা (বছর)</label>
                    <input
                      type="number"
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="উদাঃ ৮"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">চিকিৎসার ক্ষেত্রসমূহ (কমা দিয়ে লিখুন)</label>
                    <input
                      type="text"
                      value={formData.treatmentAreasText}
                      onChange={e => setFormData({ ...formData, treatmentAreasText: e.target.value })}
                      placeholder="উদাঃ ডায়াবেটিস, উচ্চ রক্তচাপ, হাঁপানি"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. কর্মস্থল ও চেম্বার */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[#006a4e]">
                  <Building2 size={14} />
                  ৩. কর্মস্থল ও চেম্বার তথ্য
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">কর্মস্থলের ধরন</label>
                    <select
                      value={formData.workplaceType}
                      onChange={e => setFormData({ ...formData, workplaceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    >
                      {WORKPLACE_TYPES.filter(w => w.id !== 'all').map(w => (
                        <option key={w.id} value={w.id}>{w.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">কর্মস্থলের নাম</label>
                    <input
                      type="text"
                      value={formData.workplace}
                      onChange={e => setFormData({ ...formData, workplace: e.target.value })}
                      placeholder="উদাঃ পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">চেম্বারের নাম (যদি থাকে)</label>
                  <input
                    type="text"
                    value={formData.chamberName}
                    onChange={e => setFormData({ ...formData, chamberName: e.target.value })}
                    placeholder="উদাঃ সেন্ট্রাল ডায়াগনস্টিক সেন্টার, পুঠিয়া"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    চেম্বারের পূর্ণ ঠিকানা <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.chamberAddress}
                    onChange={e => setFormData({ ...formData, chamberAddress: e.target.value })}
                    placeholder="উদাঃ পুঠিয়া বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া বাজার"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">উপজেলা / থানা</label>
                    <select
                      value={formData.upazila}
                      onChange={e => setFormData({ ...formData, upazila: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    >
                      {RAJSHAHI_UPAZILAS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">ইউনিয়ন</label>
                    <select
                      value={formData.union}
                      onChange={e => setFormData({ ...formData, union: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    >
                      {UNIONS.filter(u => u !== 'সকল এলাকা').map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">গ্রাম / এলাকা</label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={e => setFormData({ ...formData, village: e.target.value })}
                      placeholder="উদাঃ কৃষ্ণপুর"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                {/* Consultation Days */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">চেম্বারের দিনসমূহ নির্বাচন করুন</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map(day => {
                      const isSelected = formData.chamberDays.includes(day.id);
                      return (
                        <button
                          type="button"
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-[#006a4e] text-white border-[#006a4e]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day.banglaName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">চেম্বারের সময়</label>
                    <input
                      type="text"
                      value={formData.chamberTime}
                      onChange={e => setFormData({ ...formData, chamberTime: e.target.value })}
                      placeholder="উদাঃ বিকাল ৫:০০ – রাত ৮:০০"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">ভিজিট ফি (টাকা)</label>
                    <input
                      type="text"
                      value={formData.visitFee}
                      onChange={e => setFormData({ ...formData, visitFee: e.target.value })}
                      placeholder="উদাঃ ৫০০"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. যোগাযোগ, সেবা ও অনলাইন পরামর্শ */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[#006a4e]">
                  <Phone size={14} />
                  ৪. যোগাযোগ ও সেবা অপশন
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">WhatsApp নম্বর</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Google Map লোকেশন লিংক</label>
                    <input
                      type="url"
                      value={formData.googleMapUrl}
                      onChange={e => setFormData({ ...formData, googleMapUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 flex-1">
                    <input
                      type="checkbox"
                      checked={formData.onlineConsultation}
                      onChange={e => setFormData({ ...formData, onlineConsultation: e.target.checked })}
                      className="w-4 h-4 text-[#006a4e] rounded accent-[#006a4e]"
                    />
                    <span className="text-xs font-bold text-slate-700">অনলাইন ভিডিও পরামর্শ উপলব্ধ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 flex-1">
                    <input
                      type="checkbox"
                      checked={formData.emergencyService}
                      onChange={e => setFormData({ ...formData, emergencyService: e.target.checked })}
                      className="w-4 h-4 text-[#006a4e] rounded accent-[#006a4e]"
                    />
                    <span className="text-xs font-bold text-slate-700">জরুরি চিকিৎসা সেবা উপলব্ধ</span>
                  </label>
                </div>
              </div>

              {/* 5. অতিরিক্ত পরিচিতি */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  চিকিৎসা সংক্রান্ত সংক্ষিপ্ত পরিচিতি (বায়ো)
                </label>
                <textarea
                  rows={3}
                  value={formData.biography}
                  onChange={e => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="চিকিৎসকের দক্ষতা, অভিজ্ঞতা ও রোগীদের জন্য বিশেষ পরামর্শ লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#006a4e] hover:bg-[#00543e] text-white font-bold text-sm rounded-2xl shadow-md border-none cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'সংরক্ষণ করা হচ্ছে...' : editDoctor ? 'তথ্য আপডেট করুন' : 'ডাক্তারের তথ্য জমা দিন'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

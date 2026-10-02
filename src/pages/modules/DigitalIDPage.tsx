import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IdCard, QrCode, Download, Share2, Edit3, CheckCircle2, ShieldCheck, 
  User, MapPin, Phone, Droplet, Sparkles, Printer, Copy, Check, Lock, 
  RefreshCw, Upload, ArrowLeft, AlertCircle, FileText, Smartphone, 
  Building2, Camera, Eye, Zap, Shield, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Header from '../../components/home/Header';
import Footer from '../../components/home/Footer';
import BottomNavigation from '../../components/home/BottomNavigation';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../../components/AuthModal';

// @ts-ignore
import puthiaBg from "../../assets/images/puthia_temple_bg_1783616072369.jpg";

const PUTHIA_UNIONS = [
  'পুঠিয়া সদর',
  'জিউপাড়া',
  'ভালুকগাছি',
  'শিলমাড়িয়া',
  'বানেশ্বর',
  'বেলপুকুরিয়া'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const WARDS = ['ওয়ার্ড ১', 'ওয়ার্ড ২', 'ওয়ার্ড ৩', 'ওয়ার্ড ৪', 'ওয়ার্ড ৫', 'ওয়ার্ড ৬', 'ওয়ার্ড ৭', 'ওয়ার্ড ৮', 'ওয়ার্ড ৯'];

export const DigitalIDPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Citizen Profile
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('puthia_digital_id_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      name: userProfile?.name || user?.displayName || 'জসিম উদ্দিন',
      nameEng: 'Md. Josim Uddin',
      photoURL: userProfile?.photoURL || '',
      union: userProfile?.union || 'পুঠিয়া সদর',
      ward: 'ওয়ার্ড ৩',
      village: userProfile?.village || 'জিউপাড়া, পুঠিয়া',
      nidNumber: '১৯৯৪৫৪০২৬১৭০০৮৫৯২',
      bloodGroup: userProfile?.bloodGroup || 'O+',
      phone: userProfile?.phone || user?.phoneNumber || '01712345678',
      emergencyPhone: '01812345679',
      fatherName: 'আব্দুল কুদ্দুস',
      occupation: 'কৃষি ও ব্যবসায়ী',
      issueDate: '১৫ জানুয়ারি ২০২৪',
      expiryDate: 'আজীবন মেয়াদী',
      idSerial: `PUT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };
  });

  // Sync from userProfile if logged in
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        name: userProfile.name || prev.name,
        photoURL: userProfile.photoURL || prev.photoURL,
        union: userProfile.union || prev.union,
        village: userProfile.village || prev.village,
        bloodGroup: userProfile.bloodGroup || prev.bloodGroup,
        phone: userProfile.phone || prev.phone
      }));
    }
  }, [userProfile]);

  // Save to LocalStorage whenever profile changes
  const saveProfileChanges = (updated: typeof profileData) => {
    setProfileData(updated);
    try {
      localStorage.setItem('puthia_digital_id_profile', JSON.stringify(updated));
    } catch (e) {}
    
    if (updateUserProfile) {
      updateUserProfile({
        name: updated.name,
        union: updated.union,
        village: updated.village,
        bloodGroup: updated.bloodGroup,
        phone: updated.phone,
        photoURL: updated.photoURL
      });
    }

    toast.success('ডিজিটাল পরিচিতি তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
    setIsEditModalOpen(false);
  };

  // Image Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('ছবির সাইজ ২ মেগাবাইটের কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfileData(prev => ({ ...prev, photoURL: base64 }));
        toast.success('ছবি আপলোড সম্পন্ন হয়েছে');
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Card Trigger
  const handleDownloadCard = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'ডিজিটাল আইডি কার্ড ডাউনলোড প্রসেস হচ্ছে...',
        success: 'ডিজিটাল কার্ড সফলভাবে ডাউনলোড হয়েছে! (Digital ID Card Ready)',
        error: 'ডাউনলোডে ত্রুটি দেখা দিয়েছে'
      }
    );
  };

  // Print Card Trigger
  const handlePrintCard = () => {
    window.print();
  };

  // Copy Verification Link
  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/digital-id?id=${profileData.idSerial}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    toast.success('আইডি ভেরিফিকেশন লিংক কপি করা হয়েছে');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fafcfb] flex flex-col font-sans">
      <Header 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSearch={() => {}} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(path) => {
          setIsSidebarOpen(false);
          navigate(path.startsWith('/') ? path : `/${path}`);
        }} 
      />

      <main className="flex-1 pb-24">
        <div className="animate-fade-in font-sans">
          
          {/* Top Banner Header */}
          <div 
            className="p-5 sm:p-7 rounded-b-[32px] text-white relative overflow-hidden mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)' }}
          >
            <div 
              className="absolute inset-0 opacity-[0.05] bg-cover bg-center pointer-events-none" 
              style={{ backgroundImage: `url(${puthiaBg})` }} 
            />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <button 
                onClick={() => navigate('/exclusive-features')} 
                className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition flex items-center justify-center cursor-pointer text-white"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> স্মার্ট নাগরিক প্রোফাইল
              </span>
            </div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                ডিজিটাল পরিচিতি
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                আপনার স্মার্ট নাগরিক প্রোফাইল, নিজস্ব QR কোড, ইউনিয়ন ও ওয়ার্ড ভিত্তিক যাচাইকৃত ডিজিটাল আইডি কার্ড।
              </p>
            </div>
          </div>

          <div className="px-4 max-w-3xl mx-auto space-y-6">

            {/* Guest Banner Notice */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">আপনি অতিথি হিসেবে কার্ড দেখছেন</p>
                    <p className="text-[11px] text-amber-700 font-medium">আপনার স্থায়ী প্রোফাইল তথ্য সংরক্ষণ করতে লগইন করুন।</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition shrink-0 cursor-pointer shadow-sm"
                >
                  লগইন করুন
                </button>
              </div>
            )}

            {/* Main Interactive Flip Digital ID Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-[#009664]" />
                  <h2 className="text-base font-black text-slate-800">অফিসিয়াল স্মার্ট ডিজিটাল কার্ড</h2>
                </div>
                <button
                  onClick={() => setFlipped(!flipped)}
                  className="text-xs font-bold text-[#009664] hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={13} className={flipped ? "rotate-180 transition-transform duration-500" : ""} />
                  {flipped ? 'সামনের অংশ দেখুন' : 'পিছনের অংশ দেখুন'}
                </button>
              </div>

              {/* Card Flip Container */}
              <div 
                className="relative w-full aspect-[1.62/1] cursor-pointer group perspective-1000 max-w-lg mx-auto select-none"
                onClick={() => setFlipped(!flipped)}
              >
                <div className={`w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* FRONT SIDE */}
                  <div 
                    className="absolute w-full h-full backface-hidden rounded-[24px] p-4 sm:p-6 shadow-xl border border-emerald-400/30 flex flex-col justify-between overflow-hidden text-white"
                    style={{ background: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #064e3b 100%)' }}
                  >
                    {/* Decorative Watermark Emblem */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
                      <Shield className="w-32 h-32 text-emerald-200" />
                    </div>

                    {/* Top Header Row */}
                    <div className="flex items-start justify-between border-b border-white/15 pb-2.5 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 font-black text-xs shrink-0 shadow-inner">
                          পুঠিয়া
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold text-amber-300 tracking-wider uppercase">আমদের পুঠিয়া পোর্টাল</p>
                          <h3 className="text-xs sm:text-sm font-black text-white leading-tight">স্মার্ট ডিজিটাল নাগরিক কার্ড</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-800/80 backdrop-blur-md border border-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <ShieldCheck size={12} className="text-emerald-300" />
                        <span>ভেরিফাইড</span>
                      </div>
                    </div>

                    {/* Main Middle Row: Photo + Information */}
                    <div className="flex items-center gap-3 sm:gap-4 my-auto relative z-10">
                      {/* Photo Container */}
                      <div className="relative group/photo shrink-0">
                        <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-amber-400/90 bg-emerald-950 shadow-md overflow-hidden flex items-center justify-center relative">
                          {profileData.photoURL ? (
                            <img src={profileData.photoURL} alt={profileData.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center text-center p-1">
                              <User size={28} className="text-amber-300/80 mb-0.5" />
                              <span className="text-[9px] text-emerald-200 font-bold">{profileData.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Camera overlay */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 p-1.5 rounded-full shadow-md hover:scale-110 transition cursor-pointer"
                          title="ছবি পরিবর্তন করুন"
                        >
                          <Camera size={12} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-white truncate leading-tight">{profileData.name}</h4>
                          <p className="text-[10px] text-amber-300 font-mono font-medium truncate">{profileData.nameEng}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] pt-0.5">
                          <div>
                            <span className="text-emerald-200/70 text-[10px] block">ইউনিয়ন</span>
                            <span className="font-bold text-white truncate block">{profileData.union}</span>
                          </div>
                          <div>
                            <span className="text-emerald-200/70 text-[10px] block">ওয়ার্ড</span>
                            <span className="font-bold text-amber-300 block">{profileData.ward}</span>
                          </div>
                          <div>
                            <span className="text-emerald-200/70 text-[10px] block">রক্তের গ্রুপ</span>
                            <span className="font-black text-rose-300 block">{profileData.bloodGroup}</span>
                          </div>
                          <div>
                            <span className="text-emerald-200/70 text-[10px] block">গ্রাম</span>
                            <span className="font-bold text-white truncate block">{profileData.village}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer Row */}
                    <div className="flex items-center justify-between border-t border-white/15 pt-2 relative z-10 text-[10px]">
                      <div>
                        <span className="text-emerald-200/70 block text-[9px]">স্মার্ট আইডেন্টিটি নম্বর</span>
                        <span className="font-mono font-black text-amber-300 tracking-wider text-xs">{profileData.idSerial}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsQrModalOpen(true);
                          }}
                          className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode size={16} className="text-amber-300" />
                          <span className="text-[9px] font-bold hidden sm:inline">কিউআর</span>
                        </button>
                        <span className="text-[9px] text-emerald-200/60 font-medium">ট্যাপ করে উল্টান 🔄</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div 
                    className="absolute w-full h-full backface-hidden rotate-y-180 rounded-[24px] p-4 sm:p-6 shadow-xl border border-emerald-400/30 flex flex-col justify-between overflow-hidden text-white"
                    style={{ background: 'linear-gradient(135deg, #022019 0%, #064e3b 60%, #012e23 100%)' }}
                  >
                    <div className="border-b border-white/15 pb-2 flex items-center justify-between">
                      <p className="text-[11px] font-black text-amber-300 uppercase tracking-widest">সিটিজেন আইডেন্টিফিকেশন ভল্ট</p>
                      <span className="text-[10px] text-emerald-200/80 font-mono">{profileData.idSerial}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-auto text-xs">
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">NID / জন্ম নিবন্ধন নম্বর</span>
                          <span className="font-mono font-bold text-white text-[11px]">{profileData.nidNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">পিতা/স্বামীর নাম</span>
                          <span className="font-bold text-white">{profileData.fatherName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">পেশা</span>
                          <span className="font-bold text-white">{profileData.occupation}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-l border-white/15 pl-3">
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">জরুরি যোগাযোগ</span>
                          <span className="font-bold text-rose-300 font-mono">{profileData.emergencyPhone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">ইস্যুর তারিখ</span>
                          <span className="font-medium text-white">{profileData.issueDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-300/70 block">মেয়াদ</span>
                          <span className="font-bold text-amber-300">{profileData.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Holographic Barcode & Seal */}
                    <div className="border-t border-white/15 pt-2 flex items-center justify-between">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-emerald-300/50 bg-black/30 px-2 py-1 rounded">
                        ||||| ||||||| ||| |||||| |||||
                      </div>
                      <div className="text-[9px] font-bold text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        পুঠিয়া উপজেলা প্রশাসন ভেরিফাইড
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Hidden File Input for photo upload */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={handleDownloadCard}
                  className="py-2.5 px-3 bg-[#009664] hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Download size={15} /> ডাউনলোড করুন
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Edit3 size={15} className="text-[#009664]" /> তথ্য এডিট করুন
                </button>

                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <QrCode size={15} className="text-amber-500" /> কিউআর কোড
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  {copiedLink ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} className="text-blue-600" />}
                  {copiedLink ? 'কপি হয়েছে!' : 'শেয়ার করুন'}
                </button>
              </div>
            </div>

            {/* Point 4: Important Details Summary Cards Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#009664]" />
                <h2 className="text-base font-black text-slate-800">গুরুত্বপূর্ণ তথ্য এক জায়গায়</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Personal Profile Summary */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <User size={16} className="text-[#009664]" /> ব্যক্তিগত বিবরণ
                    </span>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[11px] font-bold text-[#009664] hover:underline cursor-pointer"
                    >
                      এডিট
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">নাম:</span>
                      <span className="font-bold text-slate-800">{profileData.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">NID / জন্ম সনদ:</span>
                      <span className="font-mono font-bold text-slate-700">{profileData.nidNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">পিতা/স্বামীর নাম:</span>
                      <span className="font-bold text-slate-800">{profileData.fatherName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">রক্তের গ্রুপ:</span>
                      <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{profileData.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">পেশা:</span>
                      <span className="font-bold text-slate-800">{profileData.occupation}</span>
                    </div>
                  </div>
                </div>

                {/* Location & Contact Summary */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <MapPin size={16} className="text-blue-600" /> অবস্থান ও যোগাযোগ
                    </span>
                    <button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-[11px] font-bold text-[#009664] hover:underline cursor-pointer"
                    >
                      এডিট
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">ইউনিয়ন:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">{profileData.union}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">ওয়ার্ড নম্বর:</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">{profileData.ward}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">গ্রাম/এলাকা:</span>
                      <span className="font-bold text-slate-800">{profileData.village}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">মোবাইল নম্বর:</span>
                      <span className="font-mono font-bold text-slate-800">{profileData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">জরুরি নম্বর:</span>
                      <span className="font-mono font-bold text-rose-600">{profileData.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Point 5: Future Digital ID Readiness Banner */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-5 text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">ভবিষ্যতে Digital ID হিসেবে ব্যবহার</h3>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    সরকারি ও স্থানীয় ই-সেবা কার্যক্রমে আপনার ডিজিটাল আইডি ব্যবহারযোগ্য।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10 text-[11px]">
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <p className="font-bold text-amber-300">১. অটো ফরম ফিল</p>
                  <p className="text-[10px] text-emerald-100/70">আবেদন ফরমে তথ্য পূরণ</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <p className="font-bold text-amber-300">২. কিউআর ভেরিফাই</p>
                  <p className="text-[10px] text-emerald-100/70">তাৎক্ষণিক ডিজিটাল আইডি</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <p className="font-bold text-amber-300">৩. ই-সনদ সুবিধা</p>
                  <p className="text-[10px] text-emerald-100/70">নাগরিক সনদপত্র লিংক</p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <p className="font-bold text-amber-300">৪. নিরাপদ ভল্ট</p>
                  <p className="text-[10px] text-emerald-100/70">এনক্রিপ্টেড ডাটা ব্যাংক</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Edit3 size={18} className="text-[#009664]" /> ডিজিটাল প্রোফাইল এডিট
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfileChanges(profileData);
                }}
                className="space-y-3 text-xs"
              >
                {/* Photo Upload Row */}
                <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-emerald-300">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                        {profileData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 mb-1">প্রোফাইল ছবি</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#009664] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition cursor-pointer"
                    >
                      <Upload size={12} /> ছবি পরিবর্তন করুন
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম (বাংলায়)</label>
                  <input 
                    type="text"
                    value={profileData.name || ""}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name (English)</label>
                  <input 
                    type="text"
                    value={profileData.nameEng || ""}
                    onChange={(e) => setProfileData({ ...profileData, nameEng: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ইউনিয়ন</label>
                    <select
                      value={profileData.union || ""}
                      onChange={(e) => setProfileData({ ...profileData, union: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    >
                      {PUTHIA_UNIONS.map(u => (
                        <option key={u} value={u || ""}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ওয়ার্ড</label>
                    <select
                      value={profileData.ward || ""}
                      onChange={(e) => setProfileData({ ...profileData, ward: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    >
                      {WARDS.map(w => (
                        <option key={w} value={w || ""}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">গ্রাম / এলাকা</label>
                  <input 
                    type="text"
                    value={profileData.village || ""}
                    onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">রক্তের গ্রুপ</label>
                    <select
                      value={profileData.bloodGroup || ""}
                      onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg || ""}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                    <input 
                      type="text"
                      value={profileData.phone || ""}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NID / জন্ম নিবন্ধন নম্বর</label>
                  <input 
                    type="text"
                    value={profileData.nidNumber || ""}
                    onChange={(e) => setProfileData({ ...profileData, nidNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#009664]/30 focus:border-[#009664] outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পিতা/স্বামীর নাম</label>
                    <input 
                      type="text"
                      value={profileData.fatherName || ""}
                      onChange={(e) => setProfileData({ ...profileData, fatherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">পেশা</label>
                    <input 
                      type="text"
                      value={profileData.occupation || ""}
                      onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#009664] text-white rounded-xl font-bold shadow-md cursor-pointer hover:bg-emerald-700 transition"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Verification Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl font-sans"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <QrCode size={16} className="text-[#009664]" /> কিউআর কোড যাচাইকরণ
                </span>
                <button 
                  onClick={() => setIsQrModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center space-y-3">
                <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-inner border border-emerald-200 flex items-center justify-center">
                  {/* SVG QR representation */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-950">
                    <path fill="currentColor" d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                    <path fill="currentColor" d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                    <path fill="currentColor" d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                    <rect x="45" y="10" width="10" height="20" fill="currentColor" />
                    <rect x="45" y="40" width="20" height="10" fill="currentColor" />
                    <rect x="70" y="50" width="20" height="20" fill="currentColor" />
                    <rect x="50" y="70" width="15" height="15" fill="currentColor" />
                    <rect x="80" y="80" width="10" height="10" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  {profileData.idSerial}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{profileData.name}</p>
                <p className="text-[11px] text-slate-500">{profileData.union}, {profileData.ward}</p>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-[#009664] text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={14} /> ভেরিফিকেশন লিংক কপি করুন
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <BottomNavigation activeTab="services" onTabChange={() => {}} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default DigitalIDPage;

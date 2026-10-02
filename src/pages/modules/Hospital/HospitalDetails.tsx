import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Heart, Phone, Navigation, Bookmark, Share2, 
  MapPin, Clock, CheckCircle, Star, ThumbsUp, CornerDownLeft, 
  X, Calendar, ShieldCheck, Stethoscope, ChevronRight, MessageCircle,
  Globe, Mail, Building2, AlertTriangle, Send, Image as ImageIcon,
  User, Check, AlertCircle, Plus, Ambulance, Award, Layers
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Hospital, Doctor } from '../../../types';
import DoctorCard from '../Doctors/DoctorCard';
import DoctorDetails from '../Doctors/DoctorDetails';
import { toast } from 'sonner';
import { FACILITIES_LIST, SERVICES_LIST } from './constants';
import ContextualRecommendations from '../../../components/common/ContextualRecommendations';

interface HospitalDetailsProps {
  hospital: Hospital;
  onClose: () => void;
  savedHospitals?: string[];
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
  initialTab?: 'info' | 'services' | 'doctors' | 'appointment' | 'reviews';
}

export default function HospitalDetails({ 
  hospital, 
  onClose,
  savedHospitals = [],
  onToggleSave,
  initialTab = 'info'
}: HospitalDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'doctors' | 'appointment' | 'reviews'>(initialTab);
  const [isSaved, setIsSaved] = useState(savedHospitals.includes(hospital.id));
  
  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Doctors
  const [hospitalDoctors, setHospitalDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Appointment Form
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptDept, setApptDept] = useState(hospital.departments?.[0] || 'মেডিসিন');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('সকাল ১০:০০');
  const [apptReason, setApptReason] = useState('');
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [apptSuccess, setApptSuccess] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('ভুল ঠিকানা বা ফোন');
  const [reportCorrection, setReportCorrection] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Lightbox Image
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    setIsSaved(savedHospitals.includes(hospital.id));
  }, [savedHospitals, hospital.id]);

  // Fetch doctors for this hospital
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const q = query(collection(db, "doctors_list"));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Doctor[];
        
        // Filter doctors whose workplace or chamber matches hospital name
        const matched = docs.filter(d => 
          (d.workplace && d.workplace.includes(hospital.name)) ||
          (d.chamberAddress && d.chamberAddress.includes(hospital.name)) ||
          (hospital.doctorIds && hospital.doctorIds.includes(d.id))
        );
        setHospitalDoctors(matched);
      } catch (e) {
        console.error("Error fetching doctors for hospital:", e);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [hospital]);

  // Fetch reviews for hospital
  useEffect(() => {
    const q = query(
      collection(db, "hospital_reviews"),
      where("hospitalId", "==", hospital.id),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(items);
    }, (err) => {
      console.error("Error fetching hospital reviews:", err);
    });
    return () => unsubscribe();
  }, [hospital.id]);

  const handleToggleBookmark = (e?: React.MouseEvent) => {
    setIsSaved(!isSaved);
    if (onToggleSave) {
      onToggleSave(hospital.id, e);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.origin + `/hospitals/${hospital.slug || hospital.id}`;
    if (navigator.share) {
      navigator.share({
        title: hospital.name,
        text: `${hospital.name}\nঠিকানা: ${hospital.address}\nফোন: ${hospital.phone}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("লিংক কপি হয়েছে");
    }
  };

  const handleCall = () => {
    const num = hospital.emergencyHotline || hospital.phone;
    if (num) window.location.href = `tel:${num}`;
  };

  const handleWhatsApp = () => {
    const num = hospital.whatsapp || hospital.phone;
    if (num) {
      const clean = num.replace(/\D/g, '');
      const formatted = clean.startsWith('88') ? clean : `88${clean}`;
      window.open(`https://wa.me/${formatted}?text=হ্যালো,%20আমি%20${encodeURIComponent(hospital.name)}%20সম্পর্কে%20জানতে%20চাই।`, '_blank');
    }
  };

  const handleDirections = () => {
    if (hospital.googleMapUrl) {
      window.open(hospital.googleMapUrl, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.address)}`, '_blank');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error("দয়া করে নাম ও মন্তব্য লিখুন");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "hospital_reviews"), {
        hospitalId: hospital.id,
        userName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        likes: 0,
        createdAt: serverTimestamp()
      });

      // Update hospital average rating
      const newCount = (hospital.reviewCount || 0) + 1;
      const currentSum = (hospital.rating || 4.7) * (hospital.reviewCount || 1);
      const newAverage = parseFloat(((currentSum + reviewRating) / newCount).toFixed(1));

      await updateDoc(doc(db, "hospitals_list", hospital.id), {
        reviewCount: increment(1),
        rating: newAverage
      });

      setReviewComment('');
      setReviewName('');
      setReviewRating(5);
      setShowReviewModal(false);
      toast.success("আপনার রিভিউ জমা হয়েছে। ধন্যবাদ!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("রিভিউ জমা দিতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptName.trim() || !apptPhone.trim() || !apptDate) {
      toast.error("দয়া করে রোগীর নাম, ফোন নম্বর এবং তারিখ প্রদান করুন");
      return;
    }
    setIsSubmittingAppt(true);
    try {
      await addDoc(collection(db, "hospital_appointments"), {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        patientName: apptName.trim(),
        phone: apptPhone.trim(),
        department: apptDept,
        doctor: apptDoctor || 'যে কোনো উপলব্ধ ডাক্তার',
        date: apptDate,
        time: apptTime,
        reason: apptReason,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setApptSuccess(true);
      toast.success("অ্যাইস্টারমেন্টের আবেদন জমা হয়েছে!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("আবেদন জমা দিতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportCorrection.trim()) {
      toast.error("দয়া করে সঠিক তথ্যটি লিখুন");
      return;
    }
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "hospital_reports"), {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        reportType,
        correction: reportCorrection.trim(),
        contact: reportContact.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setShowReportModal(false);
      setReportCorrection('');
      toast.success("সংশোধনের অনুরোধ পাঠানো হয়েছে। অ্যাডমিন টিম যাচাই করে আপডেট করবে।");
    } catch (err) {
      console.error("Report error:", err);
      toast.error("অনুরোধ পাঠাতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const isVerified = hospital.isVerified !== false && hospital.verificationStatus !== 'rejected' && hospital.verificationStatus !== 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-y-auto"
    >
      {/* Sticky Header */}
      <div className="bg-[#006a4e] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs">
              {hospital.name}
            </h1>
            <span className="text-[10px] text-emerald-100 font-medium">হাসপাতাল বিস্তারিত</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleToggleBookmark}
            className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
            title={isSaved ? "সংরক্ষণ বাতিল" : "সংরক্ষণ করুন"}
          >
            <Heart size={20} className={isSaved ? "fill-rose-400 text-rose-400" : "text-white"} />
          </button>

          <button 
            onClick={handleShare}
            className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
            title="শেয়ার করুন"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4 pb-28">

        {/* Cover & Hero Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="h-44 sm:h-52 bg-slate-200 relative overflow-hidden">
            <img 
              src={hospital.coverImageUrl || hospital.imageUrl || `https://picsum.photos/seed/${hospital.id}/1000/600`}
              alt={hospital.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Badges on cover */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isVerified && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  <CheckCircle size={12} className="fill-white text-emerald-500" />
                  ✓ ভেরিফাইড
                </span>
              )}
              <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                🏥 {hospital.type || 'হাসপাতাল'}
              </span>
            </div>

            {/* Hero details at cover bottom */}
            <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight drop-shadow-md">
                {hospital.name}
              </h2>
              <p className="text-xs text-emerald-100 flex items-center gap-1 drop-shadow">
                <MapPin size={12} />
                <span>{hospital.address || `${hospital.union}, পুঠিয়া, রাজশাহী`}</span>
              </p>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="p-4 grid grid-cols-3 gap-2 bg-slate-50 border-t border-slate-100 text-center">
            <div>
              <span className="text-amber-500 font-extrabold text-sm flex items-center justify-center gap-1">
                ⭐ {hospital.rating || 4.7}
              </span>
              <p className="text-[10px] text-slate-500 font-medium">({hospital.reviewCount || 85} রিভিউ)</p>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[#006a4e] font-extrabold text-sm block">
                {hospital.bedCount ? `${hospital.bedCount} শয্যা` : 'উপলব্ধ'}
              </span>
              <p className="text-[10px] text-slate-500 font-medium">বেড সক্ষমতা</p>
            </div>
            <div>
              <span className="text-blue-600 font-extrabold text-sm block">
                {hospital.openingTime || '২৪ ঘণ্টা'}
              </span>
              <p className="text-[10px] text-slate-500 font-medium">সেবা সময়</p>
            </div>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="p-4 flex items-center justify-between gap-2 flex-wrap border-t border-slate-100">
            <button
              onClick={handleCall}
              className="flex-1 min-w-[100px] py-2.5 px-3 bg-[#006a4e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#00553e] transition-colors border-none cursor-pointer shadow-sm"
            >
              <Phone size={14} /> 📞 কল
            </button>

            {hospital.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="flex-1 min-w-[100px] py-2.5 px-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-colors border-none cursor-pointer shadow-sm"
              >
                <MessageCircle size={14} /> 💬 WhatsApp
              </button>
            )}

            <button
              onClick={handleDirections}
              className="flex-1 min-w-[100px] py-2.5 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors border-none cursor-pointer"
            >
              <Navigation size={14} /> 📍 দিকনির্দেশনা
            </button>

            {hospital.website && (
              <button
                onClick={() => window.open(hospital.website, '_blank')}
                className="py-2.5 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors border-none cursor-pointer"
              >
                <Globe size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'info', label: 'তথ্য ও সুবিধা', icon: '🏥' },
            { id: 'services', label: 'সেবা ও বিভাগ', icon: '🩺' },
            { id: 'doctors', label: `ডাক্তারগণ (${hospitalDoctors.length})`, icon: '👨‍⚕️' },
            { id: 'appointment', label: 'অ্যাইস্টারমেন্ট', icon: '📅' },
            { id: 'reviews', label: `রিভিউ (${reviews.length})`, icon: '⭐' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#006a4e] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Info & Facilities */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            
            {/* 24 Hours Emergency Alert Banner */}
            {(hospital.hasEmergency24h || hospital.emergencyHotline) && (
              <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="space-y-0.5">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                    🚑 ২৪ ঘণ্টা জরুরি বিভাগ
                  </span>
                  <p className="text-xs font-bold text-rose-900">জরুরি সেবার প্রয়োজন?</p>
                  <p className="text-[11px] text-rose-700">হটলাইন: {hospital.emergencyHotline || hospital.phone}</p>
                </div>
                <button
                  onClick={handleCall}
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition-colors border-none cursor-pointer shrink-0"
                >
                  🚑 কল করুন
                </button>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Building2 size={16} className="text-[#006a4e]" />
                <span>হাসপাতালের তথ্য</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">হাসপাতালের নাম</span>
                  <span className="text-slate-800 font-bold">{hospital.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">ধরন</span>
                  <span className="text-slate-800 font-bold">{hospital.type || 'সরকারি/বেসরকারি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">প্রতিষ্ঠার বছর</span>
                  <span className="text-slate-800 font-bold">{hospital.establishedYear || 'তথ্য পাওয়া যায়নি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">মালিকানা</span>
                  <span className="text-slate-800 font-bold">{hospital.ownership || 'তথ্য পাওয়া যায়নি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">লাইসেন্স/নিবন্ধন নম্বর</span>
                  <span className="text-slate-800 font-bold">{hospital.licenseNumber || 'তথ্য পাওয়া যায়নি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">ইউনিয়ন ও গ্রাম</span>
                  <span className="text-slate-800 font-bold">{hospital.union} {hospital.village ? `, ${hospital.village}` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">ফোন নম্বর</span>
                  <span className="text-slate-800 font-bold">{hospital.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Email</span>
                  <span className="text-slate-800 font-bold">{hospital.email || 'তথ্য পাওয়া যায়নি'}</span>
                </div>
              </div>

              {hospital.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium text-xs block mb-1">সংক্ষিপ্ত পরিচিতি</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{hospital.description}</p>
                </div>
              )}
            </div>

            {/* Facilities Section */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Layers size={16} className="text-[#006a4e]" />
                <span>হাসপাতালের সুবিধা</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FACILITIES_LIST.map(fac => {
                  const isAvailable = hospital.facilities?.includes(fac.name) || 
                                     (fac.name === 'Ambulance' && hospital.hasAmbulance) ||
                                     (fac.name === 'Parking' && hospital.hasParking) ||
                                     (fac.name === 'Wheelchair access' && hospital.isDisabledFriendly);
                  if (!isAvailable) return null;
                  return (
                    <div key={fac.id} className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-2xl flex items-center gap-2">
                      <span className="text-base">{fac.icon}</span>
                      <span className="text-xs font-bold text-slate-800">{fac.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bed Capacity */}
            {hospital.bedCapacity && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800">বেড ও সক্ষমতা</h3>
                  <span className="text-[10px] text-slate-400">সর্বশেষ আপডেট: {hospital.bedCapacity.updatedAt || 'সাম্প্রতিক'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-base font-black text-[#006a4e]">{hospital.bedCapacity.total || hospital.bedCount}</span>
                    <p className="text-[10px] text-slate-500 font-bold">মোট বেড</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-base font-black text-blue-600">{hospital.bedCapacity.general || 0}</span>
                    <p className="text-[10px] text-slate-500 font-bold">সাধারণ বেড</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-base font-black text-purple-600">{hospital.bedCapacity.icu || 0}</span>
                    <p className="text-[10px] text-slate-500 font-bold">ICU / CCU</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-base font-black text-rose-600">{hospital.bedCapacity.female || 0}</span>
                    <p className="text-[10px] text-slate-500 font-bold">প্রসূতি ও নারী</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery */}
            {hospital.gallery && hospital.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <ImageIcon size={16} className="text-[#006a4e]" />
                  <span>হাসপাতালের ছবি</span>
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {hospital.gallery.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className="h-20 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:opacity-90 transition-opacity"
                    >
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report wrong info button */}
            <div className="text-center pt-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 underline bg-transparent border-none cursor-pointer"
              >
                তথ্য ভুল মনে হচ্ছে? তথ্য সংশোধনের অনুরোধ করুন
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Services & Departments */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            
            {/* Services Grid */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">উপলব্ধ সেবাসমূহ</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SERVICES_LIST.map(srv => {
                  const isPresent = hospital.services?.includes(srv.name) || hospital.services?.includes(srv.id);
                  return (
                    <div 
                      key={srv.id} 
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                        isPresent 
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-800 font-bold' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-lg">{srv.icon}</span>
                      <span className="text-xs leading-tight">{srv.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">বিভাগসমূহ</h3>

              <div className="flex flex-wrap gap-2">
                {hospital.departments?.map((dept, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200">
                    🏥 {dept}
                  </span>
                ))}
              </div>
            </div>

            {/* Visiting Hours Schedule */}
            {hospital.schedule && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">সেবা ও সময়সূচি</h3>

                <div className="space-y-2 text-xs">
                  {hospital.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none">
                      <span className="font-bold text-slate-700">{item.day}</span>
                      <span className="text-slate-600">{item.openingTime} – {item.closingTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Doctors */}
        {activeTab === 'doctors' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">কর্মরত বিশেষজ্ঞ ডাক্তারগণ</h3>
              <span className="text-xs text-slate-500">{hospitalDoctors.length} জন ডাক্তার</span>
            </div>

            {loadingDoctors ? (
              <div className="text-center py-10 text-xs text-slate-400">ডাক্তার তালিকা লোড হচ্ছে...</div>
            ) : hospitalDoctors.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
                <Stethoscope size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">এই হাসপাতালে সরাসরি সংযুক্ত ডাক্তার তালিকা পাওয়া যায়নি</p>
                <p className="text-[11px] text-slate-400">অন্যান্য ডাক্তারের তথ্য দেখতে ডাক্তার মডিউলে ভিজিট করুন</p>
              </div>
            ) : (
              hospitalDoctors.map(doctor => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onSelect={setSelectedDoctor}
                />
              ))
            )}
          </div>
        )}

        {/* Tab 4: Appointment Form */}
        {activeTab === 'appointment' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">অ্যাইস্টারমেন্ট আবেদন</h3>
              <p className="text-xs text-slate-500">হাসপাতালে সরাসরি সিরিয়াল বা সাক্ষাতের জন্য ফর্মটি পূরণ করুন</p>
            </div>

            {apptSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle size={36} className="mx-auto text-[#006a4e]" />
                <h4 className="text-sm font-bold text-slate-900">আবেদন সফল হয়েছে!</h4>
                <p className="text-xs text-slate-600">
                  আপনার অ্যাইস্টারমেন্ট আবেদনটি সংরক্ষিত হয়েছে। প্রতিনিধি আপনার প্রদত্ত নম্বরে যোগাযোগ করবে।
                </p>
                <button
                  onClick={() => setApptSuccess(false)}
                  className="py-2 px-4 bg-[#006a4e] text-white text-xs font-bold rounded-xl border-none cursor-pointer"
                >
                  নতুন আবেদন করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAppointment} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">রোগীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={apptName}
                    onChange={e => setApptName(e.target.value)}
                    placeholder="যেমন: শরিফুল ইসলাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ফোন নম্বর *</label>
                    <input
                      type="tel"
                      required
                      value={apptPhone}
                      onChange={e => setApptPhone(e.target.value)}
                      placeholder="01712345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিভাগ *</label>
                    <select
                      value={apptDept}
                      onChange={e => setApptDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                    >
                      {hospital.departments?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">তারিখ *</label>
                    <input
                      type="date"
                      required
                      value={apptDate}
                      onChange={e => setApptDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পছন্দের সময়</label>
                    <select
                      value={apptTime}
                      onChange={e => setApptTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                    >
                      <option value="সকাল ১০:০০">সকাল ১০:০০</option>
                      <option value="দুপুর ১২:০০">দুপুর ১২:০০</option>
                      <option value="বিকাল ৫:০০">বিকাল ৫:০০</option>
                      <option value="সন্ধ্যা ৭:০০">সন্ধ্যা ৭:০০</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">সমস্যা / কারণ</label>
                  <textarea
                    rows={2}
                    value={apptReason}
                    onChange={e => setApptReason(e.target.value)}
                    placeholder="সংক্ষেপে শারীরিক সমস্যা লিখুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#006a4e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAppt}
                  className="w-full py-3 bg-[#006a4e] text-white font-bold text-xs rounded-xl hover:bg-[#00553e] transition-colors border-none cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingAppt ? 'জমা হচ্ছে...' : 'অ্যাইস্টারমেন্ট বুক করুন'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 flex items-center gap-1">
                  ⭐ {hospital.rating || 4.7}
                </span>
                <p className="text-xs text-slate-500 font-medium">সর্বমোট {reviews.length || hospital.reviewCount || 85} টি রিভিউ</p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="py-2.5 px-4 bg-[#006a4e] text-white text-xs font-bold rounded-xl hover:bg-[#00553e] transition-colors border-none cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>রিভিউ লিখুন</span>
              </button>
            </div>

            <div className="space-y-3">
              {reviews.map(rev => (
                <div key={rev.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                    <span className="text-amber-500 font-bold text-xs">⭐ {rev.rating}</span>
                  </div>
                  <p className="text-xs text-slate-600">{rev.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-100">
                  এখনো কোনো রিভিউ যোগ করা হয়নি। প্রথম রিভিউটি লিখুন!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contextual Recommendations System */}
        <div className="pt-4">
          <ContextualRecommendations category="hospital" contextTitle={hospital.name} />
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">রিভিউ দিন</h3>
                <button onClick={() => setShowReviewModal(false)} className="border-none bg-transparent text-slate-400 cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={e => setReviewName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">রেটিং</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-xl border-none bg-transparent cursor-pointer ${star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">আপনার অভিজ্ঞতা *</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="হাসপাতালের সেবার মান সম্পর্কে লিখুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-[#006a4e] text-white text-xs font-bold rounded-xl border-none cursor-pointer"
                >
                  {isSubmittingReview ? 'জমা হচ্ছে...' : 'রিভিউ পোস্ট করুন'}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">তথ্য সংশোধনের অনুরোধ</h3>
                <button onClick={() => setShowReportModal(false)} className="border-none bg-transparent text-slate-400 cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">সমস্যার ধরন</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="ভুল ঠিকানা বা ফোন">ভুল ঠিকানা বা ফোন</option>
                    <option value="সেবা বন্ধ আছে">সেবা বন্ধ বা পরিবর্তিত হয়েছে</option>
                    <option value="নাম বা বিভাগের ভুল">নাম বা বিভাগের ভুল</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">সঠিক তথ্য *</label>
                  <textarea
                    rows={3}
                    required
                    value={reportCorrection}
                    onChange={e => setReportCorrection(e.target.value)}
                    placeholder="সঠিক তথ্য বিশদভাবে লিখুন..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">আপনার ফোন / যোগাযোগের তথ্য (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={reportContact}
                    onChange={e => setReportContact(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 bg-[#006a4e] text-white text-xs font-bold rounded-xl border-none cursor-pointer"
                >
                  {isSubmittingReport ? 'পাঠানো হচ্ছে...' : 'অনুরোধ জমা দিন'}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox for Gallery */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-4">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 text-white text-2xl border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
            <img src={activeImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
          </div>
        )}
      </AnimatePresence>

      {/* Selected Doctor Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <DoctorDetails
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

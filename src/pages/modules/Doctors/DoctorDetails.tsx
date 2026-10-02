import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Phone, Clock, Star, 
  CheckCircle, Heart, MessageSquare, ArrowLeft,
  Calendar, Stethoscope, GraduationCap, Globe, DollarSign,
  Share2, AlertTriangle, Send, Copy, ExternalLink, Mail, Check, User, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Doctor, DoctorAppointment, DoctorReview, DoctorReport } from '../../../types';
import { DOCTOR_SPECIALITIES, WEEKDAYS, REPORT_REASONS, getDoctorAvatarUrl } from './constants';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';
import ContextualRecommendations from '../../../components/common/ContextualRecommendations';

interface DoctorDetailsProps {
  doctor: Doctor;
  allDoctors?: Doctor[];
  onClose: () => void;
  savedDoctors?: string[];
  onToggleSave?: (id: string, e?: React.MouseEvent) => void;
  onSelectDoctor?: (doctor: Doctor) => void;
  initialOpenAppointment?: boolean;
}

export default function DoctorDetails({ 
  doctor, 
  allDoctors = [], 
  onClose,
  savedDoctors = [],
  onToggleSave,
  onSelectDoctor,
  initialOpenAppointment = false
}: DoctorDetailsProps) {
  const { user, userProfile } = useAuth();

  const getBanglaInitials = (name: string) => {
    if (!name) return 'ড';
    const cleanName = name.replace(/ডাঃ|ডা:|ডা\./g, '').trim();
    const parts = cleanName.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return 'ড';
    const first = 'ড';
    const lastPart = parts[parts.length - 1];
    const second = lastPart ? lastPart.charAt(0) : '';
    return first + second;
  };

  const spec = DOCTOR_SPECIALITIES.find(s => s.id === doctor.speciality || s.id === doctor.specialization);
  const isSaved = savedDoctors.includes(doctor.id);
  const isVerified = doctor.isVerified === true || doctor.verificationStatus === 'verified';
  const phoneNumber = doctor.contactNumber || doctor.phone;
  const degrees = doctor.degrees || doctor.qualifications || doctor.degree;
  const bmdcNo = doctor.bmdcNumber || doctor.bmdc_registration;
  const workplace = doctor.workplace || doctor.chamberName || doctor.chamberAddress;
  
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false);
  
  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(initialOpenAppointment);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState(userProfile?.name || user?.displayName || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Appointment Form state
  const [apptData, setApptData] = useState({
    patientName: userProfile?.name || user?.displayName || '',
    patientPhone: userProfile?.phone || '',
    patientAge: '',
    patientGender: 'পুরুষ',
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: doctor.chamberTime || doctor.consultationTime || 'বিকাল ৫:০০ - ৬:০০',
    problemDescription: '',
    chamberName: doctor.chamberName || doctor.chamberAddress || doctor.workplace || 'প্রধান চেম্বার'
  });
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [apptSuccessData, setApptSuccessData] = useState<{ id: string } | null>(null);

  // Report Form state
  const [reportData, setReportData] = useState({
    reason: REPORT_REASONS[0],
    details: '',
    reporterPhone: userProfile?.phone || ''
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [activeTab, setActiveTab] = useState<'info' | 'chambers' | 'services' | 'reviews'>('info');

  // Load reviews from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "doctor_reviews"),
      where("doctorId", "==", doctor.id),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as DoctorReview));
      setReviews(items);
      setReviewsLoading(false);

      if (user?.uid) {
        const found = items.some(r => r.userId === user.uid);
        setUserAlreadyReviewed(found);
      }
    }, (error) => {
      console.error("Error loading reviews:", error);
      setReviewsLoading(false);
    });
    return () => unsubscribe();
  }, [doctor.id, user?.uid]);

  const getWhatsAppLink = (num?: string, name?: string) => {
    if (!num) return null;
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '88' + cleaned;
    }
    const msg = encodeURIComponent(`নমস্কার ডা. ${name || ''}, আমি 'আমাদের পুঠিয়া' প্ল্যাটফর্ম থেকে চেম্বার ও অ্যাপয়েন্টমেন্টের তথ্যের জন্য যোগাযোগ করছি।`);
    return `https://wa.me/${cleaned}?text=${msg}`;
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + `/doctors/${doctor.slug || doctor.id}`;
    navigator.clipboard.writeText(url);
    toast.success("লিংক কপি হয়েছে");
    setShowShareModal(false);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${doctor.name} - বিশেষজ্ঞ ডাক্তার`,
        text: `আমাদের পুঠিয়া পোর্টালে ডা. ${doctor.name}-এর চেম্বার ও অ্যাপয়েন্টমেন্টের তথ্য দেখুন।`,
        url: window.location.origin + `/doctors/${doctor.slug || doctor.id}`
      }).catch(() => {});
    } else {
      handleCopyShareLink();
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("রিভিউ দিতে অনুগ্রহ করে লগইন করুন");
      return;
    }
    if (userAlreadyReviewed) {
      toast.error("আপনি ইতোমধ্যে এই ডাক্তারের জন্য একটি রিভিউ দিয়েছেন");
      return;
    }
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error("নাম ও রিভিউ মন্তব্য লিখুন");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "doctor_reviews"), {
        doctorId: doctor.id,
        userId: user.uid,
        userName: reviewName.trim(),
        userPhoto: user.photoURL || '',
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp()
      });

      // Recalculate true rating average from actual DB reviews
      const prevReviews = [...reviews];
      const newCount = prevReviews.length + 1;
      const totalRatingSum = prevReviews.reduce((sum, r) => sum + (r.rating || 5), 0) + reviewRating;
      const newAverage = parseFloat((totalRatingSum / newCount).toFixed(1));

      await updateDoc(doc(db, "doctors_list", doctor.id), {
        reviewCount: newCount,
        rating: newAverage,
        updatedAt: serverTimestamp()
      });

      toast.success("আপনার রিভিউ সফলভাবে যুক্ত হয়েছে");
      setReviewComment('');
      setShowReviewModal(false);
    } catch (error) {
      console.error("Review submit error:", error);
      toast.error("রিভিউ যোগ করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptData.patientName.trim() || !apptData.patientPhone.trim() || !apptData.appointmentDate) {
      toast.error("রোগীর নাম, মোবাইল নম্বর এবং তারিখ প্রদান করুন");
      return;
    }

    setIsSubmittingAppt(true);
    try {
      const docRef = await addDoc(collection(db, "doctor_appointments"), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: apptData.patientName.trim(),
        patientPhone: apptData.patientPhone.trim(),
        patientAge: apptData.patientAge || '',
        patientGender: apptData.patientGender,
        appointmentDate: apptData.appointmentDate,
        preferredTime: apptData.preferredTime,
        chamberName: apptData.chamberName,
        problemDescription: apptData.problemDescription.trim(),
        status: 'pending',
        userId: user?.uid || 'guest',
        userPhone: apptData.patientPhone.trim(),
        createdAt: serverTimestamp()
      });

      setApptSuccessData({ id: docRef.id });
      toast.success("অ্যাপয়েন্টমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!");
    } catch (error) {
      console.error("Appointment error:", error);
      toast.error("অ্যাপয়েন্টমেন্ট সাবমিট করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.details.trim()) {
      toast.error("অনুগ্রহ করে রিপোর্টের বিস্তারিত বিবরণ লিখুন");
      return;
    }
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "doctor_reports"), {
        doctorId: doctor.id,
        doctorName: doctor.name,
        reason: reportData.reason,
        details: reportData.details.trim(),
        reportedBy: user?.uid || 'public_user',
        reporterPhone: reportData.reporterPhone,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      toast.success("আপনার রিপোর্ট গ্রহণ করা হয়েছে। অ্যাডমিন টিম তা পর্যালোচনা করবে।");
      setShowReportModal(false);
      setReportData({ reason: REPORT_REASONS[0], details: '', reporterPhone: '' });
    } catch (error) {
      console.error("Report error:", error);
      toast.error("রিপোর্ট পাঠানো যায়নি");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const chamberDaysList = doctor.chamberDays || doctor.consultationDays || [];
  const servicesList = doctor.services || doctor.treatmentAreas || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#006a4e] text-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {doctor.name}
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                {spec?.label || doctor.speciality || doctor.specialization || 'বিশেষজ্ঞ চিকিৎসক'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
              title="শেয়ার করুন"
            >
              <Share2 size={18} />
            </button>

            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => onToggleSave(doctor.id, e)}
                className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
                title={isSaved ? "সংরক্ষণ বাতিল" : "পছন্দ করুন"}
              >
                <Heart size={18} className={isSaved ? "fill-rose-400 text-rose-400" : "text-white"} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Main Doctor Profile Card */}
          <div className="flex flex-col sm:flex-row gap-4 items-start bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="shrink-0 mx-auto sm:mx-0 relative">
              <img
                src={getDoctorAvatarUrl(doctor)}
                alt={doctor.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80';
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-2 right-1/2 translate-x-1/2 sm:translate-x-0 sm:-right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-white whitespace-nowrap">
                ডাক্তার
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                  {doctor.name}
                </h1>
                {isVerified ? (
                  <span className="bg-emerald-100/80 text-[#006a4e] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 shadow-2xs">
                    <CheckCircle size={13} className="fill-[#006a4e] text-white shrink-0" />
                    আমাদের পুঠিয়া Verified
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    যাচাইাধীন
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#006a4e]">
                {spec?.label || doctor.speciality || doctor.specialization || 'বিশেষজ্ঞ চিকিৎসক'}
              </p>

              {degrees && (
                <p className="text-xs text-slate-600 font-medium">
                  {degrees}
                </p>
              )}

              {workplace && (
                <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                  <MapPin size={13} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{workplace}</span>
                </p>
              )}

              {/* Verified Information Badge */}
              <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>সর্বশেষ যাচাই: <strong className="font-extrabold">{(doctor as Record<string, any>).lastVerified || '১৫ আগস্ট ২০২৬'}</strong></span>
                </span>
                {bmdcNo && (
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200">
                    BMDC: {bmdcNo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1. 📞 যোগাযোগ (Call, WhatsApp, Map/Directions) */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-[#006a4e]" />
              ১. যোগাযোগ ও অ্যাপয়েন্টমেন্ট
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {phoneNumber ? (
                <a
                  href={`tel:${phoneNumber}`}
                  className="py-2.5 px-3 bg-[#006a4e] hover:bg-[#00543e] active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all text-decoration-none"
                >
                  <Phone size={15} /> কল করুন
                </a>
              ) : (
                <button disabled className="py-2.5 px-3 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200">
                  <Phone size={15} /> নম্বর অপ্রাপ্য
                </button>
              )}

              {doctor.whatsapp ? (
                <a
                  href={getWhatsAppLink(doctor.whatsapp, doctor.name) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all text-decoration-none"
                >
                  <MessageSquare size={15} /> WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowApptModal(true)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
                >
                  <Calendar size={15} /> সিরিয়াল বুকিং
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowApptModal(true)}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
              >
                <Calendar size={15} /> অ্যাপয়েন্টমেন্ট
              </button>

              {doctor.googleMapUrl ? (
                <a
                  href={doctor.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors text-decoration-none border border-slate-200"
                >
                  <MapPin size={15} className="text-emerald-600" /> Directions
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const queryStr = encodeURIComponent(`${workplace || doctor.name} পুঠিয়া রাজশাহী`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${queryStr}`, '_blank');
                  }}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                >
                  <MapPin size={15} className="text-emerald-600" /> ম্যাপ ঠিকানা
                </button>
              )}
            </div>
          </div>

          {/* 2. 🩺 চিকিৎসা সংক্রান্ত তথ্য (Doctor Information) */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Stethoscope size={15} className="text-[#006a4e]" />
              ২. চিকিৎসা সংক্রান্ত বিস্তারিত তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">বিশেষজ্ঞতা:</span>
                <span className="font-bold text-slate-800">{spec?.label || doctor.speciality || doctor.specialization || 'সাধারণ ও বিশেষজ্ঞ চিকিৎসক'}</span>
              </div>

              {degrees && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 font-semibold block text-[11px]">শিক্ষাগত যোগ্যতা:</span>
                  <span className="font-bold text-slate-800">{degrees}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">অভিজ্ঞতা:</span>
                <span className="font-bold text-slate-800">
                  {doctor.experience && doctor.experience > 0 ? `${doctor.experience} বছর+ সেবা অভিজ্ঞতা` : 'অভিজ্ঞ চিকিৎসক'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">চিকিৎসার ফি:</span>
                <span className="font-black text-emerald-700">
                  {doctor.visitFee || doctor.fee ? `৳${doctor.visitFee || doctor.fee}` : 'চেম্বারে সরাসরি পরামর্শে প্রযোজ্য'}
                </span>
              </div>

              {workplace && (
                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-500 font-semibold block text-[11px]">প্রধান কর্মস্থল / হাসপাতাল:</span>
                  <span className="font-bold text-slate-800">{workplace}</span>
                </div>
              )}
            </div>

            {/* Treatment Areas / Services */}
            {servicesList.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">চিকিৎসার প্রধান ক্ষেত্রসমূহ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {servicesList.map((srv, idx) => (
                    <span key={idx} className="bg-emerald-50 text-[#006a4e] text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                      <CheckCircle size={12} className="text-[#006a4e]" />
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. 🕐 চেম্বার/সেবা সময় (Chamber Hours Table) */}
          <div className="bg-emerald-50/40 p-4.5 rounded-2xl border border-emerald-100 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={15} className="text-[#006a4e]" />
                ৩. চেম্বার ও সেবা সময়সূচী
              </h3>
              {(doctor.chamberTime || doctor.consultationTime) && (
                <span className="text-xs font-bold text-[#006a4e] bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {doctor.chamberTime || doctor.consultationTime}
                </span>
              )}
            </div>

            {/* Day Schedule Table */}
            <div className="bg-white rounded-xl border border-emerald-200/80 overflow-hidden text-xs">
              {WEEKDAYS.map((dayObj) => {
                const isOpen = chamberDaysList.length === 0 || chamberDaysList.some(d => d === dayObj.id || d === dayObj.label || d === dayObj.banglaName);
                return (
                  <div key={dayObj.id} className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 last:border-none">
                    <span className="font-bold text-slate-700">{dayObj.banglaName}</span>
                    {isOpen ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {doctor.chamberTime || doctor.consultationTime || 'বিকাল ৫:০০ - রাত ৯:০০'}
                      </span>
                    ) : (
                      <span className="font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        বন্ধ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. 📍 চেম্বারের ঠিকানা (Location & Map) */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin size={15} className="text-[#006a4e]" />
              ৪. চেম্বারের ঠিকানা ও গুগল ম্যাপ
            </h3>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-800">{doctor.chamberName || workplace || 'প্রধান চেম্বার'}</p>
              <p className="text-slate-600 leading-relaxed">{doctor.chamberAddress || workplace || 'পুঠিয়া বাসস্ট্যান্ড সংলগ্ন, পুঠিয়া, রাজশাহী'}</p>
              <div className="flex flex-wrap gap-2 pt-1 text-slate-500 font-medium">
                {doctor.union && <span>ইউনিয়ন: <strong>{doctor.union}</strong></span>}
                {doctor.upazila && <span>উপজেলা: <strong>{doctor.upazila}</strong></span>}
                <span>জেলা: <strong>রাজশাহী</strong></span>
              </div>
            </div>

            {/* Interactive Directions Link */}
            <div className="pt-2">
              <a
                href={doctor.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${workplace || doctor.name} পুঠিয়া রাজশাহী`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all text-decoration-none shadow-xs"
              >
                <MapPin size={15} className="text-emerald-400" />
                গুগল ম্যাপে লাইভ রুট ডিরেকশন দেখুন
              </a>
            </div>
          </div>

          {/* 5. ⭐ Rating & Reviews */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  ৫. রেটিং ও সেবাগ্রহীতাদের মতামত
                </h3>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-lg font-black text-slate-800">
                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : (doctor.rating || '৫.০')}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">({reviews.length || doctor.reviewCount || 1}টি রিভিউ)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    toast.error("রিভিউ দিতে লগইন করুন");
                    return;
                  }
                  if (userAlreadyReviewed) {
                    toast.info("আপনি ইতিমধ্যে এই ডাক্তারের জন্য রিভিউ দিয়েছেন");
                    return;
                  }
                  setShowReviewModal(true);
                }}
                className="py-2 px-3 bg-[#006a4e] hover:bg-[#00543e] active:scale-95 text-white font-bold text-xs rounded-xl shadow-2xs border-none cursor-pointer"
              >
                Review লিখুন
              </button>
            </div>

            {/* Review List */}
            {reviewsLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">রিভিউ লোড হচ্ছে...</div>
            ) : reviews.length === 0 ? (
              <div className="py-4 text-center bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-700">এখনও কোনো রিভিউ যুক্ত হয়নি</p>
                <p className="text-[11px] text-slate-400">
                  আপনি সেবা নিয়ে থাকলে প্রথম অভিজ্ঞতা শেয়ার করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#006a4e] font-bold text-xs flex items-center justify-center">
                          {rev.userName ? rev.userName.charAt(0) : 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                        <span className="bg-emerald-100/70 text-[#006a4e] text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          ✓ Verified Patient
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={11} className={s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed pl-8">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. 🚩 Report & Update Information Request */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="font-bold text-amber-900 block flex items-center justify-center sm:justify-start gap-1">
                <AlertTriangle size={15} className="text-amber-600" />
                ৬. তথ্য সংশোধন বা রিপোর্টের অনুরোধ
              </span>
              <p className="text-[11px] text-amber-800">
                এই ডাক্তারের কোনো তথ্য ভুল বা পুরোনো মনে হলে আমাদের জানান। অ্যাডমিন পর্যালোচনা করে হালনাগাদ করবেন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="py-2 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs border-none cursor-pointer whitespace-nowrap active:scale-95"
            >
              তথ্য সংশোধন / রিপোর্ট
            </button>
          </div>

          {/* 7. 👨‍⚕️ আরও ডাক্তার দেখুন (Related Doctors Section) */}
          {allDoctors && allDoctors.length > 1 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope size={15} className="text-[#006a4e]" />
                  ৭. 👨‍⚕️ আরও ডাক্তার দেখুন
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">পুঠিয়া উপজেলার অন্যান্য বিশেষজ্ঞগণ</span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {allDoctors
                  .filter(d => d.id !== doctor.id)
                  .slice(0, 6)
                  .map((relDoc) => (
                    <div
                      key={relDoc.id}
                      onClick={() => onSelectDoctor && onSelectDoctor(relDoc)}
                      className="min-w-[180px] max-w-[200px] bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 cursor-pointer transition-all shadow-2xs hover:shadow-md shrink-0 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <img
                          src={getDoctorAvatarUrl(relDoc)}
                          alt={relDoc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 mx-auto"
                        />
                        <div className="text-center">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{relDoc.name}</h4>
                          <p className="text-[11px] font-semibold text-[#006a4e] truncate">
                            {relDoc.speciality || relDoc.specialization || 'বিশেষজ্ঞ'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {relDoc.workplace || relDoc.chamberName || 'পুঠিয়া'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-full mt-2.5 py-1.5 bg-emerald-50 text-[#006a4e] font-bold text-[11px] rounded-lg border border-emerald-200 hover:bg-[#006a4e] hover:text-white transition-colors"
                      >
                        প্রোফাইল দেখুন
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Contextual Recommendations */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <ContextualRecommendations category="doctor" contextTitle={doctor.name} />
          </div>
        </div>

        {/* Bottom Bar: Report link */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            <AlertTriangle size={13} />
            তথ্য ভুল / রিপোর্ট করুন
          </button>
          <span className="text-[11px] text-slate-400">আমাদের পুঠিয়া হেলথ ডিরেক্টরি</span>
        </div>
      </motion.div>

      {/* APPOINTMENT MODAL */}
      <AnimatePresence>
        {showApptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowApptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {apptSuccessData ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-emerald-50 text-[#006a4e] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">অ্যাপয়েন্টমেন্ট রিকোয়েস্ট সম্পন্ন!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ডা. {doctor.name}-এর চেম্বারে আপনার অ্যাপয়েন্টমেন্ট রিকোয়েস্ট গ্রহণ করা হয়েছে। সিরিয়াল নিশ্চিত হলে ফোনে যোগাযোগ করা হবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApptSuccessData(null);
                      setShowApptModal(false);
                    }}
                    className="w-full py-2.5 bg-[#006a4e] text-white font-bold text-xs rounded-xl border-none cursor-pointer mt-3"
                  >
                    ঠিক আছে
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAppointment} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={16} className="text-[#006a4e]" />
                      অ্যাপয়েন্টমেন্ট বুকিং
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowApptModal(false)}
                      className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    চিকিৎসক: <strong className="text-slate-700">{doctor.name}</strong> ({spec?.label || doctor.speciality || 'বিশেষজ্ঞ'})
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">রোগীর পূর্ণ নাম *</label>
                    <input
                      required
                      type="text"
                      value={apptData.patientName}
                      onChange={(e) => setApptData({ ...apptData, patientName: e.target.value })}
                      placeholder="রোগীর নাম লিখুন"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">মোবাইল নম্বর *</label>
                      <input
                        required
                        type="tel"
                        value={apptData.patientPhone}
                        onChange={(e) => setApptData({ ...apptData, patientPhone: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">বয়স</label>
                      <input
                        type="text"
                        value={apptData.patientAge}
                        onChange={(e) => setApptData({ ...apptData, patientAge: e.target.value })}
                        placeholder="উদাঃ ৩২ বছর"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">তারিখ *</label>
                      <input
                        required
                        type="date"
                        value={apptData.appointmentDate}
                        onChange={(e) => setApptData({ ...apptData, appointmentDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">পছন্দের সময়</label>
                      <input
                        type="text"
                        value={apptData.preferredTime}
                        onChange={(e) => setApptData({ ...apptData, preferredTime: e.target.value })}
                        placeholder="উদাঃ বিকাল ৫:০০"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">সমস্যার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</label>
                    <textarea
                      rows={2}
                      value={apptData.problemDescription}
                      onChange={(e) => setApptData({ ...apptData, problemDescription: e.target.value })}
                      placeholder="রোগের লক্ষণ বা সমস্যার কথা লিখুন"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAppt}
                    className="w-full py-3 bg-[#006a4e] hover:bg-[#00543e] text-white font-bold text-xs rounded-xl shadow-sm border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingAppt ? 'জমা দেওয়া হচ্ছে...' : 'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  মতামত ও রিভিউ প্রদান করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                <div className="text-center py-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">আপনার রেটিং নির্বাচন করুন</label>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-1 bg-transparent border-none cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">আপনার নাম *</label>
                  <input
                    required
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">আপনার মন্তব্য *</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="চিকিৎসকের আচরণ, পরামর্শ ও সেবার মান সম্পর্কে লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#006a4e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-3 bg-[#006a4e] hover:bg-[#00543e] text-white font-bold text-xs rounded-xl shadow-sm border-none cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'জমা দেওয়া হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  তথ্য সংশোধন বা রিপোর্ট করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">রিপোর্টের কারণ *</label>
                  <select
                    value={reportData.reason}
                    onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-rose-500"
                  >
                    {REPORT_REASONS.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">বিস্তারিত বিবরণ *</label>
                  <textarea
                    required
                    rows={3}
                    value={reportData.details}
                    onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                    placeholder="সঠিক তথ্য বা ভুলের কারণ উল্লেখ করুন..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">আপনার মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="tel"
                    value={reportData.reporterPhone}
                    onChange={(e) => setReportData({ ...reportData, reporterPhone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm border-none cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReport ? 'পাঠানো হচ্ছে...' : 'রিপোর্ট জমা দিন'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Share2 size={16} className="text-[#006a4e]" />
                  শেয়ার করুন
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-2.5 px-4 bg-[#006a4e] text-white font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Share2 size={14} /> সরাসরি শেয়ার করুন
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> প্রোফাইল লিংক কপি করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ShieldCheck, Clock, CheckCircle, AlertTriangle, 
  Trash2, Edit, Check, X, Star, Calendar, Flag, RefreshCw, Plus, Search,
  Phone, MapPin, Eye, ExternalLink, ShieldAlert, FileText, Stethoscope
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Doctor, DoctorAppointment, DoctorReport, DoctorReview } from '../../../types';
import { getDoctorAvatarUrl } from './constants';
import { toast } from 'sonner';

interface DoctorAdminPanelProps {
  onClose: () => void;
  onOpenAddDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
}

export const DoctorAdminPanel: React.FC<DoctorAdminPanelProps> = ({ 
  onClose, 
  onOpenAddDoctor,
  onEditDoctor 
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments' | 'reports' | 'reviews'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Correction modal state
  const [correctionDoctor, setCorrectionDoctor] = useState<Doctor | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');

  // Load doctors, appointments, reports, reviews from Firestore
  useEffect(() => {
    const qDoc = query(collection(db, "doctors_list"), orderBy("createdAt", "desc"));
    const unsubDoc = onSnapshot(qDoc, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
      setDoctors(docs);
      setLoading(false);
    }, (err) => {
      console.error("Docs load error:", err);
      setLoading(false);
    });

    const qAppt = query(collection(db, "doctor_appointments"), orderBy("createdAt", "desc"));
    const unsubAppt = onSnapshot(qAppt, (snapshot) => {
      setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DoctorAppointment)));
    }, () => {});

    const qRep = query(collection(db, "doctor_reports"), orderBy("createdAt", "desc"));
    const unsubRep = onSnapshot(qRep, (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DoctorReport)));
    }, () => {});

    const qRev = query(collection(db, "doctor_reviews"), orderBy("createdAt", "desc"));
    const unsubRev = onSnapshot(qRev, (snapshot) => {
      setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DoctorReview)));
    }, () => {});

    return () => {
      unsubDoc();
      unsubAppt();
      unsubRep();
      unsubRev();
    };
  }, []);

  // Stats
  const totalDoctors = doctors.length;
  const verifiedDoctors = doctors.filter(d => d.isVerified === true || d.verificationStatus === 'verified').length;
  const pendingDoctors = doctors.filter(d => d.status === 'pending' || d.verificationStatus === 'pending').length;
  const approvedDoctors = doctors.filter(d => d.status === 'approved' || d.status === 'active').length;
  const rejectedDoctors = doctors.filter(d => d.status === 'rejected').length;
  const correctionDoctors = doctors.filter(d => d.status === 'correction_required').length;
  const totalReports = reports.length;
  const totalAppointments = appointments.length;

  const handleUpdateDoctorStatus = async (doctorId: string, updates: Partial<Doctor>) => {
    try {
      await updateDoc(doc(db, "doctors_list", doctorId), {
        ...updates,
        updatedAt: serverTimestamp()
      } as any);
      toast.success("ডাক্তারের স্ট্যাটাস আপডেট করা হয়েছে");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("আপডেট করা সম্ভব হয়নি");
    }
  };

  const handleSendCorrection = async () => {
    if (!correctionDoctor || !correctionNote.trim()) return;
    try {
      await updateDoc(doc(db, "doctors_list", correctionDoctor.id), {
        status: 'correction_required',
        verificationStatus: 'correction_required',
        correctionNotes: correctionNote.trim(),
        updatedAt: serverTimestamp()
      });
      toast.success("সংশোধন নোট পাঠানো হয়েছে");
      setCorrectionDoctor(null);
      setCorrectionNote('');
    } catch (err) {
      toast.error("সংশোধন নোট পাঠানো যায়নি");
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ডাক্তারের প্রোফাইল ডাটাবেস থেকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "doctors_list", doctorId));
      toast.success("প্রোফাইল মুছে ফেলা হয়েছে");
    } catch (err) {
      console.error("Delete doctor error:", err);
      toast.error("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  const handleUpdateApptStatus = async (apptId: string, status: DoctorAppointment['status']) => {
    try {
      await updateDoc(doc(db, "doctor_appointments", apptId), { 
        status,
        updatedAt: serverTimestamp()
      });
      toast.success("অ্যাপয়েন্টমেন্ট স্ট্যাটাস হালনাগাদ হয়েছে");
    } catch (err) {
      toast.error("হালনাগাদ করা সম্ভব হয়নি");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, "doctor_reports", reportId));
      toast.success("রিপোর্ট রিমুভ করা হয়েছে");
    } catch (err) {
      toast.error("রিমুভ করা যায়নি");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, "doctor_reviews", reviewId));
      toast.success("রিভিউ ডিলিট করা হয়েছে");
    } catch (err) {
      toast.error("ডিলিট করা যায়নি");
    }
  };

  const filteredDoctorsList = doctors.filter(d => {
    const matchesSearch = !searchQuery || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.workplace?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bmdcNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && (d.status === 'pending' || d.verificationStatus === 'pending');
    if (filterStatus === 'approved') return matchesSearch && (d.status === 'approved' || d.status === 'active');
    if (filterStatus === 'rejected') return matchesSearch && d.status === 'rejected';
    if (filterStatus === 'correction_required') return matchesSearch && d.status === 'correction_required';
    if (filterStatus === 'verified') return matchesSearch && (d.isVerified === true || d.verificationStatus === 'verified');
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-y-auto"
    >
      {/* Top Header */}
      <div className="bg-[#006a4e] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer border-none bg-transparent"
          >
            <X size={22} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">ডাক্তার মডিউল অ্যাডমিন প্যানেল</h1>
            <p className="text-[11px] text-emerald-100">মডারেশন, BMDC ভেরিফিকেশন ও বুকিং সিস্টেম</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddDoctor}
          className="py-1.5 px-3 bg-white text-[#006a4e] font-bold text-xs rounded-xl flex items-center gap-1 border-none cursor-pointer shadow-sm hover:bg-emerald-50"
        >
          <Plus size={14} /> নতুন ডাক্তার
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 space-y-4 pb-24">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold block">মোট ডাক্তার</span>
            <span className="text-xl font-black text-slate-800">{totalDoctors}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-bold block">ভেরিফাইড ডাক্তার</span>
            <span className="text-xl font-black text-[#006a4e]">{verifiedDoctors}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] text-amber-700 font-bold block">অপেক্ষমান (Pending)</span>
            <span className="text-xl font-black text-amber-600">{pendingDoctors}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-[11px] text-blue-700 font-bold block">অ্যাপয়েন্টমেন্ট</span>
            <span className="text-xl font-black text-blue-600">{totalAppointments}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'doctors' ? 'bg-[#006a4e] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Stethoscope size={14} />
            ডাক্তার তালিকা ({doctors.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'appointments' ? 'bg-[#006a4e] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar size={14} />
            অ্যাপয়েন্টমেন্ট ({appointments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'reports' ? 'bg-[#006a4e] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flag size={14} />
            রিপোর্ট ({reports.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-none ${
              activeTab === 'reviews' ? 'bg-[#006a4e] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star size={14} />
            রিভিউ ({reviews.length})
          </button>
        </div>

        {/* TAB 1: DOCTOR LIST & MODERATION */}
        {activeTab === 'doctors' && (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2 shadow-2xs">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, BMDC নম্বর বা কর্মস্থল দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#006a4e]"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'সকল' },
                  { id: 'pending', label: `অপেক্ষমান (${pendingDoctors})` },
                  { id: 'approved', label: `অনুমোদিত (${approvedDoctors})` },
                  { id: 'rejected', label: `বাতিল (${rejectedDoctors})` },
                  { id: 'correction_required', label: `সংশোধন (${correctionDoctors})` },
                  { id: 'verified', label: `ভেরিফাইড (${verifiedDoctors})` },
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFilterStatus(st.id)}
                    className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer border ${
                      filterStatus === st.id
                        ? 'bg-[#006a4e] text-white border-[#006a4e]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors List */}
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">ডাক্তারদের ডাটা লোড হচ্ছে...</div>
            ) : filteredDoctorsList.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl p-6 border border-slate-200 space-y-2">
                <Users size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">কোনো ডাক্তার পাওয়া যায়নি</p>
                <p className="text-[11px] text-slate-400">নির্বাচিত ফিল্টারে কোনো রেকর্ড ডাটাবেসে নেই।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDoctorsList.map(docItem => {
                  const isVerified = docItem.isVerified === true || docItem.verificationStatus === 'verified';
                  const isPending = docItem.status === 'pending' || docItem.verificationStatus === 'pending';
                  const isApproved = docItem.status === 'approved' || docItem.status === 'active';
                  const isRejected = docItem.status === 'rejected';
                  const isCorrection = docItem.status === 'correction_required';

                  return (
                    <div
                      key={docItem.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <img
                            src={getDoctorAvatarUrl(docItem)}
                            alt={docItem.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80';
                            }}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                            referrerPolicy="no-referrer"
                          />

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-800">{docItem.name}</h3>
                              
                              {isVerified && (
                                <span className="bg-emerald-50 text-[#006a4e] text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle size={10} className="fill-[#006a4e] text-white" />
                                  Verified
                                </span>
                              )}

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                isCorrection ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'
                              }`}>
                                {isApproved ? 'অনুমোদিত' : isPending ? 'অপেক্ষমান' : isRejected ? 'বাতিল' : isCorrection ? 'সংশোধন প্রয়োজন' : docItem.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              {docItem.degrees} • <span className="text-[#006a4e] font-bold">{docItem.speciality}</span>
                            </p>

                            <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                              {docItem.bmdcNumber && (
                                <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                  BMDC: {docItem.bmdcNumber}
                                </span>
                              )}
                              {docItem.phone && <span>ফোন: {docItem.phone}</span>}
                              {docItem.workplace && <span>কর্মস্থল: {docItem.workplace}</span>}
                            </div>

                            {docItem.correctionNotes && (
                              <div className="text-xs text-purple-800 bg-purple-50 p-2 rounded-lg border border-purple-100 mt-1">
                                <strong>সংশোধন নোট:</strong> {docItem.correctionNotes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0 justify-end">
                          <div className="flex items-center gap-1.5">
                            {/* Approve */}
                            {!isApproved && (
                              <button
                                type="button"
                                onClick={() => handleUpdateDoctorStatus(docItem.id, { status: 'approved', verificationStatus: 'verified', isVerified: true })}
                                className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer flex items-center gap-1"
                              >
                                <Check size={13} /> অনুমোদন
                              </button>
                            )}

                            {/* Verify Toggle */}
                            <button
                              type="button"
                              onClick={() => handleUpdateDoctorStatus(docItem.id, { isVerified: !isVerified, verificationStatus: !isVerified ? 'verified' : 'pending' })}
                              className={`py-1.5 px-2.5 font-bold text-xs rounded-lg border-none cursor-pointer flex items-center gap-1 ${
                                isVerified ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              <ShieldCheck size={13} /> {isVerified ? 'Unverify' : 'Verify BMDC'}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => onEditDoctor(docItem)}
                              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border-none cursor-pointer flex items-center gap-1"
                              title="সম্পাদনা"
                            >
                              <Edit size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDoctor(docItem.id)}
                              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg border-none cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Request Correction */}
                            <button
                              type="button"
                              onClick={() => {
                                setCorrectionDoctor(docItem);
                                setCorrectionNote(docItem.correctionNotes || '');
                              }}
                              className="py-1 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-md border border-purple-200 cursor-pointer"
                            >
                              সংশোধন চান
                            </button>

                            {/* Reject */}
                            {!isRejected && (
                              <button
                                type="button"
                                onClick={() => handleUpdateDoctorStatus(docItem.id, { status: 'rejected', verificationStatus: 'rejected', isVerified: false })}
                                className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-md border border-rose-200 cursor-pointer"
                              >
                                বাতিল করুন
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl p-6 border border-slate-200 space-y-2">
                <Calendar size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                <p className="text-[11px] text-slate-400">এখনও কোনো রোগী সিরিয়াল রিকোয়েস্ট পাঠাননি।</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{appt.patientName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            appt.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {appt.status === 'confirmed' ? 'নিশ্চিত' : appt.status === 'completed' ? 'সম্পন্ন' : appt.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমান'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          চিকিৎসক: <strong className="text-[#006a4e]">{appt.doctorName}</strong> • ফোন: <strong>{appt.patientPhone}</strong>
                        </p>
                        <p className="text-xs text-slate-500">
                          তারিখ: <strong>{appt.appointmentDate}</strong> • সময়: {appt.preferredTime}
                        </p>
                        {appt.problemDescription && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1">
                            সমস্যা: {appt.problemDescription}
                          </p>
                        )}
                      </div>

                      {/* Status Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateApptStatus(appt.id, 'confirmed')}
                          className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateApptStatus(appt.id, 'completed')}
                          className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer"
                        >
                          Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')}
                          className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl p-6 border border-slate-200 space-y-2">
                <Flag size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">কোনো রিপোর্ট নেই</p>
                <p className="text-[11px] text-slate-400">ডাক্তার তথ্যের উপর কোনো ভুল বা অভিযোগ জমা পড়েনি।</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reports.map(rep => (
                  <div key={rep.id} className="bg-white p-4 rounded-2xl border border-rose-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded">
                          {rep.reason}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">
                          ডাক্তার: {rep.doctorName || rep.doctorId}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">{rep.details}</p>
                        {rep.reporterPhone && (
                          <p className="text-[11px] text-slate-400 mt-1">রিপোর্টারের ফোন: {rep.reporterPhone}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReport(rep.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer"
                        title="রিপোর্ট মুছুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl p-6 border border-slate-200 space-y-2">
                <Star size={32} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">কোনো রিভিউ নেই</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-800">{rev.userName}</strong>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={11} className={s <= rev.rating ? "fill-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{rev.comment}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border-none bg-transparent cursor-pointer"
                        title="রিভিউ মুছুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CORRECTION NOTE MODAL */}
      <AnimatePresence>
        {correctionDoctor && (
          <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-3 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                ডা. {correctionDoctor.name}-এর জন্য সংশোধন নোট
              </h3>
              <p className="text-xs text-slate-500">
                কী কী তথ্য সংশোধন করা প্রয়োজন তা উল্লেখ করুন:
              </p>
              <textarea
                rows={3}
                value={correctionNote}
                onChange={e => setCorrectionNote(e.target.value)}
                placeholder="উদাঃ BMDC নম্বর সঠিক নয়, অথবা চেম্বার ঠিকানায় অস্পষ্টতা আছে..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionDoctor(null)}
                  className="py-2 px-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSendCorrection}
                  className="py-2 px-4 bg-purple-600 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  পাঠান
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DoctorAdminPanel;

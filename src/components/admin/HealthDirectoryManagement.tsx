import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, Building2, Microscope, MapPin, Calendar, ShieldCheck, 
  Plus, Edit2, Trash2, Search, CheckCircle2, XCircle, AlertCircle, 
  Phone, Clock, Star, Award, Sparkles, Filter, Check, ExternalLink, 
  FileText, Activity, UserCheck, RefreshCw, Loader2, Eye, Map, 
  CheckSquare, AlertTriangle, ChevronRight, X, Heart, ShieldAlert,
  Users, DollarSign, Home
} from 'lucide-react';
import { 
  collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc, 
  orderBy, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Doctor, Hospital, HealthService } from '../../types';
import { toast } from 'sonner';

export interface DiagnosticCenterItem {
  id: string;
  name: string;
  licenseNumber?: string;
  phone: string;
  emergencyPhone?: string;
  address: string;
  union?: string;
  openingHours: string;
  tests: {
    name: string;
    price: number;
    turnaroundHours: string;
    description?: string;
  }[];
  homeSampleCollection: boolean;
  onlineReportAvailable: boolean;
  isVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'correction_required';
  status: 'active' | 'pending' | 'suspended';
  rating?: number;
  image?: string;
}

export interface ChamberItem {
  id: string;
  doctorId: string;
  doctorName: string;
  chamberName: string;
  hospitalOrClinicName?: string;
  address: string;
  landmark?: string;
  serialPhone: string;
  roomNo?: string;
  mapUrl?: string;
  newPatientFee: number;
  followupFee: number;
  isActive: boolean;
}

export interface DoctorScheduleItem {
  id: string;
  doctorId: string;
  doctorName: string;
  chamberId?: string;
  chamberName: string;
  visitingDays: string[]; // ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি']
  visitingHours: string; // "বিকাল ৪:০০ - রাত ৮:০০"
  maxDailyPatients: number; // e.g. 25
  isOffToday: boolean;
  offNotice?: string;
  status: 'active' | 'leave' | 'cancelled';
}

export interface VerificationAuditItem {
  id: string;
  type: 'doctor' | 'hospital' | 'diagnostic';
  title: string;
  regOrLicenseNumber: string;
  submittedBy: string;
  contactPhone: string;
  documentUrl?: string;
  status: 'pending' | 'verified' | 'rejected' | 'correction_required';
  adminNotes?: string;
  submittedAt: string;
}

// Initial Mock Seed Data for Puthia Health Directory
const SEED_DOCTORS: Partial<Doctor>[] = [
  {
    id: 'doc-puthia-1',
    name: 'ডা. সুদীপ চক্রবর্তী',
    bmdcNumber: 'A-45892',
    bmdc_registration: 'A-45892',
    qualifications: 'MBBS (Rajshahi Medical College), BCS (Health), FCPS (Medicine)',
    degrees: 'MBBS, BCS, FCPS',
    speciality: 'মেডিসিন ও হৃদরোগ বিশেষজ্ঞ',
    designation: 'উপজেলা স্বাস্থ্য কর্মকর্তা',
    experience: 12,
    workplace: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
    phone: '01711-456789',
    chamberName: 'সেবা ডিজিটাল ডায়াগনস্টিক চেম্বার',
    chamberAddress: 'থানা মোড়, পুঠিয়া, রাজশাহী',
    chamberDays: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
    chamberTime: 'বিকাল ৪:০০ - রাত ৮:০০',
    visitFee: '৫০০',
    isVerified: true,
    verificationStatus: 'verified',
    status: 'approved',
    profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-puthia-2',
    name: 'ডা. ফাতেমা তুজ জোহরা',
    bmdcNumber: 'A-56214',
    bmdc_registration: 'A-56214',
    qualifications: 'MBBS, DGO (BSMMU), MCPS (Gynae & Obs)',
    degrees: 'MBBS, DGO, MCPS',
    speciality: 'গাইনী ও প্রসূতি রোগ বিশেষজ্ঞ',
    designation: 'কনসালটেন্ট (গাইনী)',
    experience: 9,
    workplace: 'পুঠিয়া মা ও শিশু কল্যাণ কেন্দ্র',
    phone: '01712-345678',
    chamberName: 'মেডিকেল এইড ক্লিনিক চেম্বার',
    chamberAddress: 'ঝলমলিয়া বাজার, পুঠিয়া',
    chamberDays: ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
    chamberTime: 'বিকাল ৫:০০ - রাত ৮:৩০',
    visitFee: '৬০০',
    isVerified: true,
    verificationStatus: 'verified',
    status: 'approved',
    profilePhoto: 'https://images.unsplash.com/photo-1594824813566-88855ce78347?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'doc-puthia-3',
    name: 'ডা. আসিফ ইকবাল',
    bmdcNumber: 'A-62109',
    qualifications: 'MBBS (RMC), MS (Orthopedics)',
    degrees: 'MBBS, MS',
    speciality: 'হাড়-জোড়া ও পঙ্গু রোগ বিশেষজ্ঞ',
    designation: 'সহকারী অধ্যাপক (অর্থোপেডিক্স)',
    experience: 8,
    workplace: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল',
    phone: '01819-998877',
    chamberName: 'পপুলার ডায়াগনস্টিক চেম্বার',
    chamberAddress: 'পুঠিয়া বাসস্ট্যান্ড মোড়, পুঠিয়া',
    chamberDays: ['রবি', 'মঙ্গল', 'বৃহস্পতিবার'],
    chamberTime: 'সন্ধ্যা ৫:৩০ - রাত ৯:০০',
    visitFee: '৭০০',
    isVerified: false,
    verificationStatus: 'pending',
    status: 'pending',
    profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  }
];

const SEED_HOSPITALS: Partial<Hospital>[] = [
  {
    id: 'hosp-puthia-1',
    name: 'পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স',
    type: 'সরকারি',
    licenseNumber: 'DGHS-UPZ-4501',
    description: 'পুঠিয়া উপজেলার প্রধান ৫০ শয্যা বিশিষ্ট সরকারি স্বাস্থ্য কেন্দ্র। জরুরি সেবা, বহির্বিভাগ, ফ্রি ওষুধ বিতরণ ও প্রসূতি সেবা প্রদান করা হয়।',
    address: 'পুঠিয়া থানা মোড় সংলগ্ন, পুঠিয়া, রাজশাহী',
    union: 'পুঠিয়া সদর',
    phone: '01711-456789',
    emergencyHotline: '01711-456799',
    departments: ['জরুরি বিভাগ', 'বহির্বিভাগ (OPD)', 'মা ও শিশু ওয়ার্ড', 'সার্জারি বিভাগ', 'দাঁত ও চক্ষু বিভাগ'],
    bedCount: 50,
    bedCapacity: { total: 50, general: 40, emergency: 10, icu: 0 },
    openingTime: '২৪ ঘণ্টা খোলা',
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hosp-puthia-2',
    name: 'মেডিকেল এইড ডিজিটাল ক্লিনিক ও হাসপাতাল',
    type: 'বেসরকারি',
    licenseNumber: 'DGHS-PVT-8842',
    description: 'আধুনিক অপারেশন থিয়েটার, কেবিন, প্যাথলজি ও ২৪ ঘণ্টা অ্যাম্বুলেন্স সুবিধাসম্পন্ন প্রথম সারির প্রাইভেট হাসপাতাল।',
    address: 'ঝলমলিয়া বাজার, পুঠিয়া, রাজশাহী',
    union: 'ঝলমলিয়া',
    phone: '01730-889900',
    emergencyHotline: '01730-889911',
    departments: ['গাইনী ও প্রসূতি', 'সাধারণ সার্জারি', 'মেডিসিন', 'ডিজিটাল এক্স-রে ও ইসিজি'],
    bedCount: 25,
    bedCapacity: { total: 25, general: 18, icu: 2, emergency: 5 },
    openingTime: '২৪ ঘণ্টা খোলা',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'
  }
];

const SEED_DIAGNOSTICS: DiagnosticCenterItem[] = [
  {
    id: 'diag-puthia-1',
    name: 'সেবা ডিজিটাল ডায়াগনস্টিক ও ল্যাব',
    licenseNumber: 'DGHS-LAB-9921',
    phone: '01715-112233',
    emergencyPhone: '01715-112244',
    address: 'থানা মোড়, পুঠিয়া বাজার, পুঠিয়া, রাজশাহী',
    union: 'পুঠিয়া সদর',
    openingHours: 'সকাল ৭:০০ - রাত ১০:০০',
    homeSampleCollection: true,
    onlineReportAvailable: true,
    isVerified: true,
    verificationStatus: 'verified',
    status: 'active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    tests: [
      { name: 'CBC (সম্পূর্ণ রক্ত পরীক্ষা)', price: 400, turnaroundHours: '৩ ঘণ্টা', description: 'হিমোগ্লোবিন, অণুচক্রিকা ও ডাব্লুবিসি পরীক্ষা' },
      { name: 'Blood Group & Rh Factor', price: 150, turnaroundHours: '৩০ মিনিট', description: 'রক্তের গ্রুপ নির্ণয়' },
      { name: 'Fasting Blood Sugar (FBS)', price: 150, turnaroundHours: '১ ঘণ্টা', description: 'ডায়াবেটিস পরীক্ষা' },
      { name: 'Whole Abdomen USG', price: 800, turnaroundHours: '১ ঘণ্টা', description: 'পেটের আল্ট্রাসোনোগ্রাফি' },
      { name: 'Digital Chest X-Ray', price: 450, turnaroundHours: '২ ঘণ্টা', description: 'বুকের ডিজিটাল এক্স-রে' },
      { name: 'ECG (১২ লিড ইসিজি)', price: 300, turnaroundHours: '১৫ মিনিট', description: 'হৃদযন্ত্রের ইসিজি পরীক্ষা' }
    ]
  },
  {
    id: 'diag-puthia-2',
    name: 'পপুলার ডিজিটাল প্যাথলজি সেন্টার',
    licenseNumber: 'DGHS-LAB-1042',
    phone: '01722-445566',
    address: 'বাসস্ট্যান্ড রোড, পুঠিয়া',
    union: 'পুঠিয়া সদর',
    openingHours: 'সকাল ৭:৩০ - রাত ৯:৩০',
    homeSampleCollection: false,
    onlineReportAvailable: true,
    isVerified: true,
    verificationStatus: 'verified',
    status: 'active',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    tests: [
      { name: 'Lipid Profile', price: 900, turnaroundHours: '৬ ঘণ্টা', description: 'কোলেস্টেরল ও ট্রাইগ্লিসারাইড' },
      { name: 'Serum Creatinine', price: 300, turnaroundHours: '২ ঘণ্টা', description: 'কিডনি পরীক্ষা' },
      { name: 'Thyroid Panel (T3, T4, TSH)', price: 1200, turnaroundHours: '১২ ঘণ্টা', description: 'থাইরয়েড হরমোন টেস্ট' }
    ]
  }
];

const SEED_CHAMBERS: ChamberItem[] = [
  {
    id: 'ch-1',
    doctorId: 'doc-puthia-1',
    doctorName: 'ডা. সুদীপ চক্রবর্তী',
    chamberName: 'সেবা ডিজিটাল ডায়াগনস্টিক চেম্বার',
    hospitalOrClinicName: 'সেবা ডায়াগনস্টিক সেন্টার',
    address: 'থানা মোড় (২য় তলা), পুঠিয়া বাজার, পুঠিয়া',
    landmark: 'উপজেলা স্বাস্থ্য কমপ্লেক্সের বিপরীতে',
    serialPhone: '01715-112233',
    roomNo: '১০২ নম্বর রুম',
    newPatientFee: 500,
    followupFee: 300,
    isActive: true
  },
  {
    id: 'ch-2',
    doctorId: 'doc-puthia-2',
    doctorName: 'ডা. ফাতেমা তুজ জোহরা',
    chamberName: 'মেডিকেল এইড কনসালটেশন সেন্টার',
    hospitalOrClinicName: 'মেডিকেল এইড ক্লিনিক',
    address: 'ঝলমলিয়া বাজার রোড, পুঠিয়া',
    landmark: 'অগ্রণী ব্যাংকের নিচতলা',
    serialPhone: '01730-889900',
    roomNo: '২০১ নম্বর রুম',
    newPatientFee: 600,
    followupFee: 400,
    isActive: true
  }
];

const SEED_SCHEDULES: DoctorScheduleItem[] = [
  {
    id: 'sch-1',
    doctorId: 'doc-puthia-1',
    doctorName: 'ডা. সুদীপ চক্রবর্তী',
    chamberName: 'সেবা ডিজিটাল ডায়াগনস্টিক চেম্বার',
    visitingDays: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
    visitingHours: 'বিকাল ৪:০০ - রাত ৮:০০',
    maxDailyPatients: 25,
    isOffToday: false,
    status: 'active'
  },
  {
    id: 'sch-2',
    doctorId: 'doc-puthia-2',
    doctorName: 'ডা. ফাতেমা তুজ জোহরা',
    chamberName: 'মেডিকেল এইড কনসালটেশন সেন্টার',
    visitingDays: ['সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
    visitingHours: 'বিকাল ৫:০০ - রাত ৮:৩০',
    maxDailyPatients: 20,
    isOffToday: false,
    status: 'active'
  }
];

type DirectorySubTab = 'doctor' | 'hospital' | 'diagnostic' | 'chamber' | 'schedule' | 'verification';

export default function HealthDirectoryManagement() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<DirectorySubTab>('doctor');

  useEffect(() => {
    if (urlTab) {
      if (['doctor', 'hospital', 'diagnostic', 'chamber', 'schedule', 'verification'].includes(urlTab)) {
        setActiveTab(urlTab as DirectorySubTab);
      } else if (urlTab === 'doctors') {
        setActiveTab('doctor');
      } else if (urlTab === 'hospitals') {
        setActiveTab('hospital');
      }
    }
  }, [urlTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Data Collections
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCenterItem[]>([]);
  const [chambers, setChambers] = useState<ChamberItem[]>([]);
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([]);

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<DirectorySubTab>('doctor');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Verification Audit Modal
  const [auditItem, setAuditItem] = useState<{ item: any; type: 'doctor' | 'hospital' | 'diagnostic' } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Form States
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({
    name: '',
    bmdcNumber: '',
    speciality: '',
    qualifications: '',
    designation: '',
    experience: 5,
    workplace: '',
    phone: '',
    visitFee: '500',
    profilePhoto: '',
    status: 'approved',
    isVerified: true
  });

  const [hospitalForm, setHospitalForm] = useState<Partial<Hospital>>({
    name: '',
    type: 'সরকারি',
    licenseNumber: '',
    phone: '',
    emergencyHotline: '',
    address: '',
    union: 'পুঠিয়া সদর',
    bedCount: 30,
    description: '',
    imageUrl: ''
  });

  const [diagnosticForm, setDiagnosticForm] = useState<Partial<DiagnosticCenterItem>>({
    name: '',
    licenseNumber: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    union: 'পুঠিয়া সদর',
    openingHours: 'সকাল ৭:০০ - রাত ১০:০০',
    homeSampleCollection: true,
    onlineReportAvailable: true,
    tests: [
      { name: 'CBC Test', price: 400, turnaroundHours: '৩ ঘণ্টা' },
      { name: 'Blood Sugar (FBS)', price: 150, turnaroundHours: '১ ঘণ্টা' }
    ]
  });

  const [chamberForm, setChamberForm] = useState<Partial<ChamberItem>>({
    doctorName: '',
    chamberName: '',
    hospitalOrClinicName: '',
    address: '',
    landmark: '',
    serialPhone: '',
    newPatientFee: 500,
    followupFee: 300,
    isActive: true
  });

  const [scheduleForm, setScheduleForm] = useState<Partial<DoctorScheduleItem>>({
    doctorName: '',
    chamberName: '',
    visitingDays: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
    visitingHours: 'বিকাল ৪:০০ - রাত ৮:০০',
    maxDailyPatients: 25,
    isOffToday: false,
    status: 'active'
  });

  // Firestore Sync & Seed Fallback
  useEffect(() => {
    setLoading(true);
    
    // 1. Doctors Firestore listener
    const unsubDoc = onSnapshot(query(collection(db, "doctors_list")), (snap) => {
      if (!snap.empty) {
        setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor)));
      } else {
        setDoctors(SEED_DOCTORS as Doctor[]);
      }
    }, () => {
      setDoctors(SEED_DOCTORS as Doctor[]);
    });

    // 2. Hospitals Firestore listener
    const unsubHosp = onSnapshot(query(collection(db, "hospitals_list")), (snap) => {
      if (!snap.empty) {
        setHospitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Hospital)));
      } else {
        setHospitals(SEED_HOSPITALS as Hospital[]);
      }
    }, () => {
      setHospitals(SEED_HOSPITALS as Hospital[]);
    });

    // 3. Diagnostics Firestore listener
    const unsubDiag = onSnapshot(query(collection(db, "diagnostic_centers")), (snap) => {
      if (!snap.empty) {
        setDiagnostics(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiagnosticCenterItem)));
      } else {
        setDiagnostics(SEED_DIAGNOSTICS);
      }
    }, () => {
      setDiagnostics(SEED_DIAGNOSTICS);
    });

    // 4. Chambers Firestore listener
    const unsubCh = onSnapshot(query(collection(db, "chambers_list")), (snap) => {
      if (!snap.empty) {
        setChambers(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChamberItem)));
      } else {
        setChambers(SEED_CHAMBERS);
      }
    }, () => {
      setChambers(SEED_CHAMBERS);
    });

    // 5. Schedules Firestore listener
    const unsubSch = onSnapshot(query(collection(db, "doctor_schedules")), (snap) => {
      if (!snap.empty) {
        setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorScheduleItem)));
      } else {
        setSchedules(SEED_SCHEDULES);
      }
      setLoading(false);
    }, () => {
      setSchedules(SEED_SCHEDULES);
      setLoading(false);
    });

    return () => {
      unsubDoc();
      unsubHosp();
      unsubDiag();
      unsubCh();
      unsubSch();
    };
  }, []);

  // Seed All Health Directory Data to Firestore button
  const handleSeedAllData = async () => {
    setLoading(true);
    try {
      // Seed Doctors
      for (const docItem of SEED_DOCTORS) {
        await setDoc(doc(db, "doctors_list", docItem.id!), { ...docItem, createdAt: serverTimestamp() }, { merge: true });
      }
      // Seed Hospitals
      for (const hospItem of SEED_HOSPITALS) {
        await setDoc(doc(db, "hospitals_list", hospItem.id!), { ...hospItem, createdAt: serverTimestamp() }, { merge: true });
      }
      // Seed Diagnostics
      for (const diagItem of SEED_DIAGNOSTICS) {
        await setDoc(doc(db, "diagnostic_centers", diagItem.id), { ...diagItem, createdAt: serverTimestamp() }, { merge: true });
      }
      // Seed Chambers
      for (const chItem of SEED_CHAMBERS) {
        await setDoc(doc(db, "chambers_list", chItem.id), { ...chItem, createdAt: serverTimestamp() }, { merge: true });
      }
      // Seed Schedules
      for (const schItem of SEED_SCHEDULES) {
        await setDoc(doc(db, "doctor_schedules", schItem.id), { ...schItem, createdAt: serverTimestamp() }, { merge: true });
      }
      toast.success("পুঠিয়া হেলথ ডিরেক্টরির সকল নমুনা তথ্য ডাটাবেজে যুক্ত করা হয়েছে!");
    } catch (error) {
      console.error("Seed error:", error);
      toast.error("ডাটা সিড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  // Delete Actions
  const handleDeleteItem = async (id: string, type: DirectorySubTab) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ডাটাটি মুছে ফেলতে চান?")) return;
    try {
      const collName = 
        type === 'doctor' ? 'doctors_list' :
        type === 'hospital' ? 'hospitals_list' :
        type === 'diagnostic' ? 'diagnostic_centers' :
        type === 'chamber' ? 'chambers_list' : 'doctor_schedules';
      
      await deleteDoc(doc(db, collName, id));
      toast.success("তথ্য মুছে ফেলা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("মুছে ফেলা সম্ভব হয়নি");
    }
  };

  // Toggle Verification Badge / Status
  const handleToggleVerification = async (id: string, type: 'doctor' | 'hospital' | 'diagnostic', currentVerified: boolean) => {
    try {
      const collName = type === 'doctor' ? 'doctors_list' : type === 'hospital' ? 'hospitals_list' : 'diagnostic_centers';
      const nextStatus = currentVerified ? 'pending' : 'verified';
      
      await updateDoc(doc(db, collName, id), {
        isVerified: !currentVerified,
        verificationStatus: nextStatus,
        updatedAt: serverTimestamp()
      } as any);

      toast.success(!currentVerified ? "ভেরিফাইড ব্যাজ অনুমোদন প্রদান করা হয়েছে!" : "ভেরিফাইড ব্যাজ প্রত্যাহার করা হয়েছে");
    } catch (err) {
      console.error(err);
      toast.error("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  // Audit Approval
  const handleAuditDecision = async (status: 'verified' | 'rejected' | 'correction_required') => {
    if (!auditItem) return;
    try {
      const collName = auditItem.type === 'doctor' ? 'doctors_list' : auditItem.type === 'hospital' ? 'hospitals_list' : 'diagnostic_centers';
      await updateDoc(doc(db, collName, auditItem.item.id), {
        isVerified: status === 'verified',
        verificationStatus: status,
        correctionNotes: adminNote,
        rejectionReason: adminNote,
        updatedAt: serverTimestamp()
      } as any);

      toast.success(`অডিট ফলাফল সফলভাবে আপলোড করা হয়েছে: ${status}`);
      setAuditItem(null);
      setAdminNote('');
    } catch (err) {
      console.error(err);
      toast.error("অডিট ডাটা সেভ করতে ব্যর্থ হয়েছে");
    }
  };

  // Submit Add/Edit Form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemId = editingItem ? editingItem.id : `health-${Date.now()}`;

      if (modalType === 'doctor') {
        const collName = 'doctors_list';
        const docData = { ...doctorForm, updatedAt: serverTimestamp() };
        if (!editingItem) (docData as any).createdAt = serverTimestamp();
        await setDoc(doc(db, collName, itemId), docData, { merge: true });
        toast.success("ডাক্তারের তথ্য সংরক্ষিত হয়েছে");
      } else if (modalType === 'hospital') {
        const collName = 'hospitals_list';
        const hospData = { ...hospitalForm, updatedAt: serverTimestamp() };
        if (!editingItem) (hospData as any).createdAt = serverTimestamp();
        await setDoc(doc(db, collName, itemId), hospData, { merge: true });
        toast.success("হাসপাতালের তথ্য সংরক্ষিত হয়েছে");
      } else if (modalType === 'diagnostic') {
        const collName = 'diagnostic_centers';
        const diagData = { ...diagnosticForm, updatedAt: serverTimestamp() };
        if (!editingItem) (diagData as any).createdAt = serverTimestamp();
        await setDoc(doc(db, collName, itemId), diagData, { merge: true });
        toast.success("ডায়াগনস্টিক সেন্টারের তথ্য সংরক্ষিত হয়েছে");
      } else if (modalType === 'chamber') {
        const collName = 'chambers_list';
        const chData = { ...chamberForm, updatedAt: serverTimestamp() };
        if (!editingItem) (chData as any).createdAt = serverTimestamp();
        await setDoc(doc(db, collName, itemId), chData, { merge: true });
        toast.success("চেম্বার তথ্য সংরক্ষিত হয়েছে");
      } else if (modalType === 'schedule') {
        const collName = 'doctor_schedules';
        const schData = { ...scheduleForm, updatedAt: serverTimestamp() };
        if (!editingItem) (schData as any).createdAt = serverTimestamp();
        await setDoc(doc(db, collName, itemId), schData, { merge: true });
        toast.success("সিডিউল তথ্য সংরক্ষিত হয়েছে");
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      toast.error("সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal Helper
  const openEditModal = (type: DirectorySubTab, item?: any) => {
    setModalType(type);
    setEditingItem(item || null);

    if (type === 'doctor') {
      setDoctorForm(item || {
        name: '', bmdcNumber: '', speciality: '', qualifications: '', designation: '',
        experience: 5, workplace: '', phone: '', visitFee: '500', profilePhoto: '', status: 'approved', isVerified: true
      });
    } else if (type === 'hospital') {
      setHospitalForm(item || {
        name: '', type: 'সরকারি', licenseNumber: '', phone: '', emergencyHotline: '',
        address: '', union: 'পুঠিয়া সদর', bedCount: 30, description: ''
      });
    } else if (type === 'diagnostic') {
      setDiagnosticForm(item || {
        name: '', licenseNumber: '', phone: '', emergencyPhone: '', address: '', union: 'পুঠিয়া সদর',
        openingHours: 'সকাল ৭:০০ - রাত ১০:০০', homeSampleCollection: true, onlineReportAvailable: true,
        tests: [{ name: 'CBC Test', price: 400, turnaroundHours: '৩ ঘণ্টা' }]
      });
    } else if (type === 'chamber') {
      setChamberForm(item || {
        doctorName: '', chamberName: '', hospitalOrClinicName: '', address: '', landmark: '',
        serialPhone: '', newPatientFee: 500, followupFee: 300, isActive: true
      });
    } else if (type === 'schedule') {
      setScheduleForm(item || {
        doctorName: '', chamberName: '', visitingDays: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি'],
        visitingHours: 'বিকাল ৪:০০ - রাত ৮:০০', maxDailyPatients: 25, isOffToday: false, status: 'active'
      });
    }

    setIsModalOpen(true);
  };

  // Tab definitions
  const subTabs = [
    { id: 'doctor', label: '১. ডাক্তার (Doctor)', icon: Stethoscope, count: doctors.length },
    { id: 'hospital', label: '২. হাসপাতাল (Hospital)', icon: Building2, count: hospitals.length },
    { id: 'diagnostic', label: '৩. ডায়াগনস্টিক (Diagnostic)', icon: Microscope, count: diagnostics.length },
    { id: 'chamber', label: '৪. চেম্বার (Chamber)', icon: MapPin, count: chambers.length },
    { id: 'schedule', label: '৫. সিডিউল (Schedule)', icon: Calendar, count: schedules.length },
    { id: 'verification', label: '৬. লাইসেন্স অডিট (Verification)', icon: ShieldCheck, count: doctors.filter(d => !d.isVerified).length + hospitals.filter(h => !(h as any).isVerified).length }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Heart size={14} className="animate-pulse text-rose-400" />
              <span>উপজেলা হেলথ ডিরেক্টরি হাব (Health Directory Hub)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              স্বাস্থ্য ডিরেক্টরি ও চিকিৎসক ইস্টার
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              ডাক্তার, সরকারি/বেসরকারি হাসপাতাল, ডিজিটাল ডায়াগনস্টিক ল্যাব, চেম্বার লোকেশন, সিডিউল সময়সূচী এবং বিএমডিসি/ডিজিএইচএস লাইসেন্স ভেরিফিকেশন প্যানেল।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedAllData}
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-emerald-400" />
              <span>পুঠিয়া হেলথ সিড ডাটা</span>
            </button>

            <button
              onClick={() => openEditModal(activeTab === 'verification' ? 'doctor' : activeTab)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              <span>নতুন এন্ট্রি যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200 font-bold">মোট ডাক্তার</div>
            <div className="text-xl font-black text-white mt-1">{doctors.length} জন</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200 font-bold">হাসপাতাল/ক্লিনিক</div>
            <div className="text-xl font-black text-white mt-1">{hospitals.length} টি</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200 font-bold">ডায়াগনস্টিক সেন্টার</div>
            <div className="text-xl font-black text-white mt-1">{diagnostics.length} টি</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200 font-bold">অ্যাক্টিভ চেম্বার</div>
            <div className="text-xl font-black text-white mt-1">{chambers.length} টি</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-emerald-200 font-bold">বিএমডিসি ভেরিফাইড</div>
            <div className="text-xl font-black text-emerald-300 mt-1">
              {doctors.filter(d => d.isVerified).length} জন
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-amber-200 font-bold">পেন্ডিং অডিট</div>
            <div className="text-xl font-black text-amber-300 mt-1">
              {doctors.filter(d => !d.isVerified).length + hospitals.filter(h => !(h as any).isVerified).length} টি
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="w-full flex border-b border-gray-200 bg-white p-2 rounded-2xl shadow-sm gap-1.5 overflow-x-auto scrollbar-none">
        {subTabs.map((st) => {
          const IconComponent = st.icon;
          const isActive = activeTab === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveTab(st.id as DirectorySubTab)}
              className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 min-w-max ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={16} />
              <span>{st.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {st.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="নাম, বিএমডিসি/ডিজিএইচএস লাইসেন্স বা মোবাইল দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
            <Filter size={14} /> ফিল্টার:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="verified">ভেরিফাইড (Verified)</option>
            <option value="pending">পেন্ডিং (Pending)</option>
            <option value="approved">অনুমোদিত (Approved)</option>
          </select>
        </div>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 size={36} className="animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500">ডাটা লোড হচ্ছে...</p>
          </div>
        ) : (
          <>
            {/* 1. DOCTOR DIRECTORY TAB */}
            {activeTab === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors
                  .filter(d => 
                    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (d.speciality || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (d.bmdcNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((docItem) => (
                    <motion.div
                      layout
                      key={docItem.id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={docItem.profilePhoto || docItem.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'}
                            alt={docItem.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-emerald-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-gray-900 text-sm truncate">{docItem.name}</h3>
                              {docItem.isVerified && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                                  <ShieldCheck size={12} className="text-emerald-600" /> ভেরিফাইড
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-emerald-700 mt-0.5">{docItem.speciality}</p>
                            <p className="text-[11px] text-gray-500 truncate">{docItem.qualifications || docItem.degrees}</p>
                          </div>
                        </div>

                        <div className="space-y-2 bg-gray-50 p-3 rounded-2xl text-xs text-gray-600 mb-4 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-400">বিএমডিসি নম্বর:</span>
                            <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {docItem.bmdcNumber || docItem.bmdc_registration || 'প্রযোজ্য নয়'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-400">অভিজ্ঞতা:</span>
                            <span className="font-bold text-gray-800">{docItem.experience || 5} বছর</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-400">কর্মস্থল:</span>
                            <span className="font-bold text-gray-800 truncate max-w-[150px]">{docItem.workplace || 'উপজেলা স্বাস্থ্য কেন্দ্র'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-400">ভিজিট ফি:</span>
                            <span className="font-bold text-emerald-700">৳{docItem.visitFee || docItem.fee || 500}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                        <button
                          onClick={() => handleToggleVerification(docItem.id, 'doctor', !!docItem.isVerified)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                            docItem.isVerified 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <ShieldCheck size={14} />
                          <span>{docItem.isVerified ? 'ব্যাজ প্রত্যাহার' : 'ভেরিফাই করুন'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('doctor', docItem)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                            title="সম্পাদনা"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(docItem.id, 'doctor')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* 2. HOSPITAL DIRECTORY TAB */}
            {activeTab === 'hospital' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hospitals
                  .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((hosp) => (
                    <motion.div
                      layout
                      key={hosp.id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          <img
                            src={hosp.imageUrl || hosp.logoUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=300&q=80'}
                            alt={hosp.name}
                            className="w-20 h-20 rounded-2xl object-cover border border-emerald-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                {hosp.type || 'সরকারি'}
                              </span>
                              {hosp.licenseNumber && (
                                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {hosp.licenseNumber}
                                </span>
                              )}
                            </div>
                            <h3 className="font-black text-gray-900 text-base mt-1">{hosp.name}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={13} className="text-emerald-600" />
                              <span className="truncate">{hosp.address}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          {hosp.description}
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                            <div className="text-[10px] font-bold text-emerald-800">মোট বেড</div>
                            <div className="font-black text-emerald-900 text-sm mt-0.5">{hosp.bedCount || 30} শয্যা</div>
                          </div>
                          <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <div className="text-[10px] font-bold text-amber-800">জরুরি সেবা</div>
                            <div className="font-black text-amber-900 text-sm mt-0.5">২৪/৭ খোলা</div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                            <div className="text-[10px] font-bold text-blue-800">হটলাইন</div>
                            <div className="font-black text-blue-900 text-xs mt-0.5 truncate">{hosp.phone}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Phone size={13} className="text-emerald-600" /> {hosp.emergencyHotline || hosp.phone}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('hospital', hosp)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(hosp.id, 'hospital')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* 3. DIAGNOSTIC CENTER TAB */}
            {activeTab === 'diagnostic' && (
              <div className="space-y-4">
                {diagnostics
                  .filter(diag => diag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((diag) => (
                    <motion.div
                      layout
                      key={diag.id}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                            <Microscope size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-gray-900 text-base">{diag.name}</h3>
                              {diag.isVerified && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                  ডিজিএইচএস লাইসেন্সপ্রাপ্ত
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <MapPin size={13} className="text-emerald-600" /> {diag.address} | <Clock size={13} className="text-emerald-600" /> {diag.openingHours}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal('diagnostic', diag)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 size={14} /> সম্পাদনা
                          </button>
                          <button
                            onClick={() => handleDeleteItem(diag.id, 'diagnostic')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Lab Tests List */}
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <FileText size={14} className="text-teal-600" /> উপলব্ধ পরীক্ষা ও ফি তালিকা (Lab Tests & Pricing):
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {diag.tests.map((test, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900 text-xs">{test.name}</div>
                                <div className="text-[10px] text-gray-500">রিপোর্ট ডেলিভারি: {test.turnaroundHours}</div>
                              </div>
                              <div className="font-black text-emerald-700 text-xs bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                                ৳{test.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* 4. CHAMBER TAB */}
            {activeTab === 'chamber' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {chambers
                  .filter(c => c.chamberName.toLowerCase().includes(searchTerm.toLowerCase()) || c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((ch) => (
                    <motion.div
                      layout
                      key={ch.id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                            <MapPin size={12} /> চেম্বার পজিশন
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ch.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {ch.isActive ? 'সক্রিয়' : 'বন্ধ'}
                          </span>
                        </div>

                        <h3 className="font-black text-gray-900 text-base mb-1">{ch.chamberName}</h3>
                        <p className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-1">
                          <Stethoscope size={14} /> {ch.doctorName}
                        </p>

                        <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-4">
                          <div className="flex items-start gap-1.5">
                            <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{ch.address}</span>
                          </div>
                          {ch.landmark && (
                            <div className="text-[11px] text-gray-500 pl-5">ল্যান্ডমার্ক: {ch.landmark}</div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                            <span className="font-bold text-gray-500">নতুন রোগী ফি:</span>
                            <span className="font-black text-emerald-700">৳{ch.newPatientFee}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-500">পুরাতন রোগী ফি:</span>
                            <span className="font-black text-emerald-700">৳{ch.followupFee}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <a 
                          href={`tel:${ch.serialPhone}`}
                          className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Phone size={13} /> সিরিয়াল: {ch.serialPhone}
                        </a>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('chamber', ch)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(ch.id, 'chamber')}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}

            {/* 5. SCHEDULE TAB */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {schedules.map((sch) => (
                  <motion.div
                    layout
                    key={sch.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-900 text-base">{sch.doctorName}</h3>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {sch.chamberName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                        <span className="font-bold text-gray-400">রোগী দেখার দিন:</span>
                        {sch.visitingDays.map((day, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            {day}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-bold text-gray-700">
                          <Clock size={13} className="text-emerald-600" /> সময়: {sch.visitingHours}
                        </span>
                        <span className="font-bold text-emerald-700">
                          সর্বোচ্চ সিরিয়াল: {sch.maxDailyPatients} জন
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sch.isOffToday ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sch.isOffToday ? 'আজকে অফ/বন্ধ' : 'আজকে চেম্বার খোলা'}
                      </span>

                      <button
                        onClick={() => openEditModal('schedule', sch)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 size={14} /> সম্পাদনা
                      </button>
                      <button
                        onClick={() => handleDeleteItem(sch.id, 'schedule')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 6. VERIFICATION AUDIT TAB */}
            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-bold">
                  <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                  <span>
                    বিএমডিসি (BMDC) রেজিস্ট্রেশন ও ডিজিএইচএস (DGHS) লাইসেন্স যাচাইকরণ অডিট প্যানেল। প্রয়োজনীয় সনদপত্র সঠিক থাকলে সবুজ ভেরিফাইড ব্যাজ অনুমোদন দিন।
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map(d => (
                    <div key={d.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ডাক্তার</span>
                          <span className="font-mono text-xs text-gray-500 font-bold">BMDC: {d.bmdcNumber || d.bmdc_registration || 'N/A'}</span>
                        </div>
                        <h4 className="font-black text-gray-900 text-sm mt-1">{d.name}</h4>
                        <p className="text-xs text-gray-500">{d.qualifications}</p>
                      </div>

                      <button
                        onClick={() => setAuditItem({ item: d, type: 'doctor' })}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        অডিট করুন
                      </button>
                    </div>
                  ))}

                  {hospitals.map(h => (
                    <div key={h.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">হাসপাতাল</span>
                          <span className="font-mono text-xs text-gray-500 font-bold">DGHS: {h.licenseNumber || 'N/A'}</span>
                        </div>
                        <h4 className="font-black text-gray-900 text-sm mt-1">{h.name}</h4>
                        <p className="text-xs text-gray-500">{h.address}</p>
                      </div>

                      <button
                        onClick={() => setAuditItem({ item: h, type: 'hospital' })}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        অডিট করুন
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL FOR ADD / EDIT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Sparkles size={20} className="text-emerald-600" />
                  <span>{editingItem ? 'তথ্য আপডেট করুন' : 'নতুন তথ্য যুক্ত করুন'}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="space-y-4">
                {modalType === 'doctor' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">ডাক্তারের নাম *</label>
                        <input
                          type="text"
                          required
                          value={doctorForm.name || ''}
                          onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          placeholder="যেমন: ডা. সুদীপ চক্রবর্তী"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">বিএমডিসি নম্বর (BMDC Reg) *</label>
                        <input
                          type="text"
                          required
                          value={doctorForm.bmdcNumber || ''}
                          onChange={(e) => setDoctorForm({ ...doctorForm, bmdcNumber: e.target.value, bmdc_registration: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          placeholder="যেমন: A-45892"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">বিশেষজ্ঞতা / ক্যাটাগরি *</label>
                        <select
                          required
                          value={doctorForm.speciality || 'মেডিসিন'}
                          onChange={(e) => setDoctorForm({ ...doctorForm, speciality: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        >
                          <option value="মেডিসিন">🩺 মেডিসিন</option>
                          <option value="শিশু বিশেষজ্ঞ">👶 শিশু বিশেষজ্ঞ</option>
                          <option value="গাইনী ও প্রসূতি">👩‍⚕️ গাইনী ও প্রসূতি</option>
                          <option value="সার্জারি">🔪 সার্জারি</option>
                          <option value="হৃদরোগ">❤️ হৃদরোগ</option>
                          <option value="চক্ষু">👁️ চক্ষু</option>
                          <option value="দাঁত">🦷 দাঁত</option>
                          <option value="চর্মরোগ">🧴 চর্মরোগ</option>
                          <option value="অর্থোপেডিক">🦴 অর্থোপেডিক</option>
                          <option value="নাক-কান-গলা">👂 নাক-কান-গলা</option>
                          <option value="মানসিক স্বাস্থ্য">🧠 মানসিক স্বাস্থ্য</option>
                          <option value="কিডনি ও মূত্ররোগ">🫘 কিডনি ও মূত্ররোগ</option>
                          <option value="লিভার ও পরিপাকতন্ত্র">🧪 লিভার ও পরিপাকতন্ত্র</option>
                          <option value="অন্যান্য">❓ অন্যান্য</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">ডিগ্রী (Degrees)</label>
                        <input
                          type="text"
                          value={doctorForm.qualifications || ''}
                          onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          placeholder="যেমন: MBBS, FCPS, BCS (Health)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">কর্মস্থল</label>
                        <input
                          type="text"
                          value={doctorForm.workplace || ''}
                          onChange={(e) => setDoctorForm({ ...doctorForm, workplace: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">মোবাইল নম্বর</label>
                        <input
                          type="text"
                          value={doctorForm.phone || ''}
                          onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                          placeholder="01711-XXXXXX"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'hospital' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">হাসপাতালের নাম *</label>
                        <input
                          type="text"
                          required
                          value={hospitalForm.name || ''}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">ক্যাটাগরি / প্রতিষ্ঠানের ধরন</label>
                        <select
                          value={hospitalForm.type || 'সরকারি হাসপাতাল'}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, type: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        >
                          <option value="সরকারি হাসপাতাল">🏛️ সরকারি হাসপাতাল</option>
                          <option value="বেসরকারি হাসপাতাল">🏥 বেসরকারি হাসপাতাল</option>
                          <option value="ক্লিনিক">🩺 ক্লিনিক</option>
                          <option value="মাতৃ ও শিশু হাসপাতাল">🤱 মাতৃ ও শিশু হাসপাতাল</option>
                          <option value="জেনারেল হাসপাতাল">🏨 জেনারেল হাসপাতাল</option>
                          <option value="বিশেষায়িত হাসপাতাল">⚕️ বিশেষায়িত হাসপাতাল</option>
                          <option value="ডেন্টাল হাসপাতাল/ক্লিনিক">🦷 ডেন্টাল হাসপাতাল/ক্লিনিক</option>
                          <option value="চক্ষু হাসপাতাল/ক্লিনিক">👁️ চক্ষু হাসপাতাল/ক্লিনিক</option>
                          <option value="কমিউনিটি ক্লিনিক">🏡 কমিউনিটি ক্লিনিক</option>
                          <option value="অন্যান্য">❓ অন্যান্য</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700">ডিজিএইচএস লাইসেন্স নং</label>
                        <input
                          type="text"
                          value={hospitalForm.licenseNumber || ''}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, licenseNumber: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700">ফোন নম্বর</label>
                        <input
                          type="text"
                          value={hospitalForm.phone || ''}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                          className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700">ঠিকানা *</label>
                      <input
                        type="text"
                        required
                        value={hospitalForm.address || ''}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                        className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer"
                  >
                    {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIT MODAL */}
      <AnimatePresence>
        {auditItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span>লাইসেন্স ও বিএমডিসি অডিট</span>
                </h3>
                <button onClick={() => setAuditItem(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-400">নাম:</span>
                  <span className="font-black text-gray-900">{auditItem.item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-400">রেজিস্ট্রেশন/লাইসেন্স:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {auditItem.item.bmdcNumber || auditItem.item.licenseNumber || 'যাচাইযোগ্য'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">অডিট রিমার্কস বা মন্তব্য</label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="অ্যাডমিনের সিদ্ধান্ত সম্পর্কিত নোট..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3">
                <button
                  onClick={() => handleAuditDecision('verified')}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={14} /> ভেরিফাইড করুন
                </button>
                <button
                  onClick={() => handleAuditDecision('correction_required')}
                  className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlertTriangle size={14} /> সংশোধন লাগবেন
                </button>
                <button
                  onClick={() => handleAuditDecision('rejected')}
                  className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={14} /> রিজেক্ট করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

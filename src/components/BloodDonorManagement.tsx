import React, { useState, useEffect } from "react";
import { 
  Droplets, UserPlus, Trash2, Edit, Users, HeartHandshake, CheckCircle2, 
  XCircle, ShieldCheck, ShieldAlert, Phone, MapPin, Calendar, Search, 
  Filter, AlertTriangle, Plus, Clock, Award, Check, X, RefreshCw, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { 
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, serverTimestamp, setDoc 
} from "firebase/firestore";

export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  group?: string; // alias for compatibility
  phone: string;
  area: string;
  location?: string; // alias for compatibility
  unionName?: string;
  gender?: "পুরুষ" | "নারী" | "অন্যান্য";
  age?: number;
  nidOrId?: string;
  lastDonate?: string;
  lastDonationDate?: string;
  totalDonations?: number;
  isAvailable: boolean;
  verificationStatus: "verified" | "pending" | "unverified";
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  group?: string;
  unitsNeeded: number;
  hospital: string;
  area: string;
  contactPerson: string;
  phone: string;
  requiredDate: string;
  requiredTime?: string;
  urgency: "critical" | "urgent" | "normal";
  diseaseDetails?: string;
  status: "pending" | "approved" | "fulfilled" | "cancelled";
  matchedDonorIds?: string[];
  createdAt?: any;
  updatedAt?: any;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const PUTHIA_UNIONS = [
  "পুঠিয়া সদর",
  "বানেশ্বর",
  "বেলপুকুর",
  "জিউপাড়া",
  "শিলমাড়িয়া",
  "ভালুকগাছি",
  "ঝলমলিয়া",
  "উপজেলা স্বাস্থ্য কমপ্লেক্স এলাকা",
  "অন্যান্য"
];

// Fallback seed data if Firestore is empty
const INITIAL_DONORS: Donor[] = [
  {
    id: "donor-1",
    name: "মোঃ রফিকুল ইসলাম",
    bloodGroup: "O+",
    group: "O+",
    phone: "01712345678",
    area: "পুঠিয়া সদর",
    location: "পুঠিয়া সদর",
    unionName: "পুঠিয়া সদর",
    gender: "পুরুষ",
    age: 28,
    nidOrId: "1998561234789",
    lastDonate: "2026-05-10",
    lastDonationDate: "2026-05-10",
    totalDonations: 6,
    isAvailable: true,
    verificationStatus: "verified",
    notes: "নিয়মিত রক্তদাতা। পুঠিয়া সেন্ট্রাল ব্লাড ব্যাংকের স্বেচ্ছাসেবক।"
  },
  {
    id: "donor-2",
    name: "মোঃ আহসান হাবীব",
    bloodGroup: "A+",
    group: "A+",
    phone: "01823456789",
    area: "বানেশ্বর",
    location: "বানেশ্বর",
    unionName: "বানেশ্বর",
    gender: "পুরুষ",
    age: 32,
    nidOrId: "1994123456789",
    lastDonate: "2026-02-15",
    lastDonationDate: "2026-02-15",
    totalDonations: 12,
    isAvailable: true,
    verificationStatus: "verified",
    notes: "বানেশ্বর কলেজ চত্বর সংলগ্ন।"
  },
  {
    id: "donor-3",
    name: "মোছাঃ ফাতেমা খাতুন",
    bloodGroup: "B+",
    group: "B+",
    phone: "01934567890",
    area: "বেলপুকুর",
    location: "বেলপুকুর",
    unionName: "বেলপুকুর",
    gender: "নারী",
    age: 24,
    nidOrId: "2002789123456",
    lastDonate: "2026-08-01",
    lastDonationDate: "2026-08-01",
    totalDonations: 3,
    isAvailable: false,
    verificationStatus: "pending",
    notes: "সাম্প্রতিক রক্তদানের কারণে আগামী ৩ মাস রক্তদানে বিরতি।"
  },
  {
    id: "donor-4",
    name: "মোঃ জহুরুল হক",
    bloodGroup: "AB+",
    group: "AB+",
    phone: "01545678901",
    area: "জিউপাড়া",
    location: "জিউপাড়া",
    unionName: "জিউপাড়া",
    gender: "পুরুষ",
    age: 30,
    nidOrId: "1996890123456",
    lastDonate: "2025-11-20",
    lastDonationDate: "2025-11-20",
    totalDonations: 8,
    isAvailable: true,
    verificationStatus: "verified",
    notes: "জরুরি প্রয়োজনে যেকোনো সময় প্রস্তুত।"
  },
  {
    id: "donor-5",
    name: "মোঃ তানভীর আহমেদ",
    bloodGroup: "O-",
    group: "O-",
    phone: "01656789012",
    area: "শিলমাড়িয়া",
    location: "শিলমাড়িয়া",
    unionName: "শিলমাড়িয়া",
    gender: "পুরুষ",
    age: 26,
    nidOrId: "2000345678901",
    lastDonate: "2026-04-05",
    lastDonationDate: "2026-04-05",
    totalDonations: 4,
    isAvailable: true,
    verificationStatus: "verified",
    notes: "দুর্লভ ও সর্বজনীন দাতা (Universal Donor O-)।"
  }
];

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: "req-1",
    patientName: "মোসাঃ সালমা বেগম (প্রসূতি রোগী)",
    bloodGroup: "O+",
    group: "O+",
    unitsNeeded: 2,
    hospital: "পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স",
    area: "পুঠিয়া সদর",
    contactPerson: "মোঃ মোবারক হোসেন (ভাই)",
    phone: "01711223344",
    requiredDate: "2026-08-31",
    requiredTime: "বিকেল ৪:০০",
    urgency: "critical",
    diseaseDetails: "জরুরি সিজারিয়ান অপারেশন। ২ ব্যাগ O+ রক্তের তীব্র প্রয়োজন।",
    status: "pending"
  },
  {
    id: "req-2",
    patientName: "আব্দুস সামাদ (থ্যালাসেমিয়া রোগী)",
    bloodGroup: "A+",
    group: "A+",
    unitsNeeded: 1,
    hospital: "বানেশ্বর সেবা ক্লিনিক ও ডায়াগনস্টিক",
    area: "বানেশ্বর",
    contactPerson: "মোঃ কামরুল ইসলাম",
    phone: "01899887766",
    requiredDate: "2026-09-02",
    requiredTime: "সকাল ১০:০০",
    urgency: "urgent",
    diseaseDetails: "নিয়মিত রক্ত পরিবর্তন (Monthly Blood Transfusion)।",
    status: "approved"
  }
];

export default function BloodDonorManagement() {
  const [activeTab, setActiveTab] = useState<"donors" | "requests" | "verification">("donors");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] = useState<string>("all");

  // Notification Banner
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);
  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(null);

  // Donor Form State
  const [donorName, setDonorName] = useState("");
  const [donorGroup, setDonorGroup] = useState("O+");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorArea, setDonorArea] = useState("পুঠিয়া সদর");
  const [donorGender, setDonorGender] = useState<"পুরুষ" | "নারী" | "অন্যান্য">("পুরুষ");
  const [donorAge, setDonorAge] = useState<number>(25);
  const [donorNid, setDonorNid] = useState("");
  const [donorLastDonate, setDonorLastDonate] = useState("");
  const [donorTotalDonations, setDonorTotalDonations] = useState<number>(1);
  const [donorIsAvailable, setDonorIsAvailable] = useState<boolean>(true);
  const [donorVerification, setDonorVerification] = useState<"verified" | "pending" | "unverified">("verified");
  const [donorNotes, setDonorNotes] = useState("");

  // Request Form State
  const [reqPatientName, setReqPatientName] = useState("");
  const [reqBloodGroup, setReqBloodGroup] = useState("O+");
  const [reqUnits, setReqUnits] = useState<number>(1);
  const [reqHospital, setReqHospital] = useState("পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স");
  const [reqArea, setReqArea] = useState("পুঠিয়া সদর");
  const [reqContactPerson, setReqContactPerson] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
  const [reqTime, setReqTime] = useState("12:00");
  const [reqUrgency, setReqUrgency] = useState<"critical" | "urgent" | "normal">("critical");
  const [reqDisease, setReqDisease] = useState("");

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Firestore Realtime Listeners
  useEffect(() => {
    setLoading(true);
    const donorsRef = collection(db, "blood_donors");
    const requestsRef = collection(db, "blood_requests");

    const unsubDonors = onSnapshot(donorsRef, (snapshot) => {
      if (snapshot.empty) {
        setDonors(INITIAL_DONORS);
      } else {
        const list = snapshot.docs.map(docData => {
          const d = docData.data();
          return {
            id: docData.id,
            name: d.name || "",
            bloodGroup: d.bloodGroup || d.group || "O+",
            group: d.bloodGroup || d.group || "O+",
            phone: d.phone || "",
            area: d.area || d.location || "পুঠিয়া সদর",
            location: d.area || d.location || "পুঠিয়া সদর",
            unionName: d.unionName || d.area || "পুঠিয়া সদর",
            gender: d.gender || "পুরুষ",
            age: d.age || 25,
            nidOrId: d.nidOrId || "",
            lastDonate: d.lastDonate || d.lastDonationDate || "",
            lastDonationDate: d.lastDonate || d.lastDonationDate || "",
            totalDonations: d.totalDonations || 1,
            isAvailable: d.isAvailable ?? true,
            verificationStatus: d.verificationStatus || (d.verified ? "verified" : "pending"),
            notes: d.notes || "",
            createdAt: d.createdAt
          } as Donor;
        });
        setDonors(list);
      }
      setLoading(false);
    }, (err) => {
      console.error("Donors fetch error:", err);
      setDonors(INITIAL_DONORS);
      setLoading(false);
    });

    const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
      if (snapshot.empty) {
        setRequests(INITIAL_REQUESTS);
      } else {
        const list = snapshot.docs.map(docData => {
          const r = docData.data();
          return {
            id: docData.id,
            patientName: r.patientName || "",
            bloodGroup: r.bloodGroup || r.group || "O+",
            group: r.bloodGroup || r.group || "O+",
            unitsNeeded: r.unitsNeeded || 1,
            hospital: r.hospital || "",
            area: r.area || "পুঠিয়া সদর",
            contactPerson: r.contactPerson || "",
            phone: r.phone || "",
            requiredDate: r.requiredDate || r.date || "",
            requiredTime: r.requiredTime || "",
            urgency: r.urgency || "urgent",
            diseaseDetails: r.diseaseDetails || "",
            status: r.status || "pending",
            matchedDonorIds: r.matchedDonorIds || []
          } as BloodRequest;
        });
        setRequests(list);
      }
    }, (err) => {
      console.error("Requests fetch error:", err);
      setRequests(INITIAL_REQUESTS);
    });

    return () => {
      unsubDonors();
      unsubRequests();
    };
  }, []);

  // Reset Donor Form
  const resetDonorForm = () => {
    setEditingDonorId(null);
    setDonorName("");
    setDonorGroup("O+");
    setDonorPhone("");
    setDonorArea("পুঠিয়া সদর");
    setDonorGender("পুরুষ");
    setDonorAge(25);
    setDonorNid("");
    setDonorLastDonate("");
    setDonorTotalDonations(1);
    setDonorIsAvailable(true);
    setDonorVerification("verified");
    setDonorNotes("");
  };

  // Open Edit Donor Modal
  const handleOpenEditDonor = (donor: Donor) => {
    setEditingDonorId(donor.id);
    setDonorName(donor.name);
    setDonorGroup(donor.bloodGroup);
    setDonorPhone(donor.phone);
    setDonorArea(donor.area);
    setDonorGender(donor.gender || "পুরুষ");
    setDonorAge(donor.age || 25);
    setDonorNid(donor.nidOrId || "");
    setDonorLastDonate(donor.lastDonate || "");
    setDonorTotalDonations(donor.totalDonations || 1);
    setDonorIsAvailable(donor.isAvailable);
    setDonorVerification(donor.verificationStatus || "verified");
    setDonorNotes(donor.notes || "");
    setShowDonorModal(true);
  };

  // Save / Update Donor
  const handleSaveDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone) {
      showNotification("রক্তদাতার নাম ও ফোন নম্বর পূরণ করা বাধ্যতামূলক।", true);
      return;
    }

    const payload = {
      name: donorName,
      bloodGroup: donorGroup,
      group: donorGroup,
      phone: donorPhone,
      area: donorArea,
      location: donorArea,
      unionName: donorArea,
      gender: donorGender,
      age: Number(donorAge) || 25,
      nidOrId: donorNid,
      lastDonate: donorLastDonate,
      lastDonationDate: donorLastDonate,
      totalDonations: Number(donorTotalDonations) || 1,
      isAvailable: donorIsAvailable,
      verificationStatus: donorVerification,
      verified: donorVerification === "verified",
      notes: donorNotes,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingDonorId) {
        await updateDoc(doc(db, "blood_donors", editingDonorId), payload).catch(async () => {
          await setDoc(doc(db, "blood_donors", editingDonorId), payload);
        });
        showNotification("রক্তদাতার তথ্য সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await addDoc(collection(db, "blood_donors"), { ...payload, createdAt: serverTimestamp() });
        showNotification("নতুন রক্তদাতা নিবন্ধিত হয়েছে!");
      }
      setShowDonorModal(false);
      resetDonorForm();
    } catch (err) {
      console.error("Save donor error:", err);
      showNotification("রক্তদাতা তথ্য সংরক্ষণ করা সম্ভব হয়নি।", true);
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async (donor: Donor) => {
    try {
      await updateDoc(doc(db, "blood_donors", donor.id), {
        isAvailable: !donor.isAvailable,
        updatedAt: serverTimestamp()
      });
      showNotification(`${donor.name}-এর উপলব্ধতা পরিবর্তন করা হয়েছে।`);
    } catch (err) {
      console.error("Toggle availability error:", err);
      showNotification("উপলব্ধতা পরিবর্তন করা যায়নি।", true);
    }
  };

  // Change Verification Status
  const handleUpdateVerification = async (donorId: string, status: "verified" | "pending" | "unverified") => {
    try {
      await updateDoc(doc(db, "blood_donors", donorId), {
        verificationStatus: status,
        verified: status === "verified",
        updatedAt: serverTimestamp()
      });
      showNotification(`ভেরিফিকেশন স্ট্যাটাস '${status === "verified" ? "ভেরিফাইড" : status === "pending" ? "পেন্ডিং" : "বাতিল"}' এ সেট করা হয়েছে।`);
    } catch (err) {
      console.error("Update verification error:", err);
      showNotification("স্ট্যাটাস আপডেট করা সম্ভব হয়নি।", true);
    }
  };

  // Delete Donor
  const handleDeleteDonor = async (id: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রক্তদাতাকে তালিকা থেকে মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "blood_donors", id));
      showNotification("রক্তদাতা সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      console.error("Delete donor error:", err);
      showNotification("রক্তদাতা মুছতে সমস্যা হয়েছে।", true);
    }
  };

  // Save Emergency Blood Request
  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPatientName || !reqPhone || !reqHospital) {
      showNotification("রোগীর নাম, হাসপাতাল ও ফোন নম্বর দেওয়া বাধ্যতামূলক।", true);
      return;
    }

    const payload = {
      patientName: reqPatientName,
      bloodGroup: reqBloodGroup,
      group: reqBloodGroup,
      unitsNeeded: Number(reqUnits) || 1,
      hospital: reqHospital,
      area: reqArea,
      contactPerson: reqContactPerson || reqPatientName,
      phone: reqPhone,
      requiredDate: reqDate,
      requiredTime: reqTime,
      urgency: reqUrgency,
      diseaseDetails: reqDisease,
      status: "pending",
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "blood_requests"), payload);
      showNotification("জরুরি রক্তের আবেদন সফলভাবে পোস্ট করা হয়েছে!");
      setShowRequestModal(false);
      // Reset Request Form
      setReqPatientName("");
      setReqContactPerson("");
      setReqPhone("");
      setReqDisease("");
    } catch (err) {
      console.error("Save request error:", err);
      showNotification("আবেদন পোস্ট করতে সমস্যা হয়েছে।", true);
    }
  };

  // Update Request Status
  const handleUpdateRequestStatus = async (id: string, status: "pending" | "approved" | "fulfilled" | "cancelled") => {
    try {
      await updateDoc(doc(db, "blood_requests", id), {
        status,
        updatedAt: serverTimestamp()
      });
      showNotification("আবেদনের স্ট্যাটাস আপডেট করা হয়েছে!");
    } catch (err) {
      console.error("Update request status error:", err);
      showNotification("স্ট্যাটাস আপডেট করা সম্ভব হয়নি।", true);
    }
  };

  // Delete Request
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm("আপনি কি এই রক্তের আবেদনটি মুছে ফেলতে চান?")) return;
    try {
      await deleteDoc(doc(db, "blood_requests", id));
      showNotification("আবেদনটি মুছে ফেলা হয়েছে।");
    } catch (err) {
      console.error("Delete request error:", err);
      showNotification("আবেদন মুছতে ব্যর্থ হয়েছে।", true);
    }
  };

  // Calculate Blood Group Stats
  const groupStats = BLOOD_GROUPS.reduce((acc, grp) => {
    acc[grp] = donors.filter(d => d.bloodGroup === grp).length;
    return acc;
  }, {} as Record<string, number>);

  const verifiedCount = donors.filter(d => d.verificationStatus === "verified").length;
  const availableCount = donors.filter(d => d.isAvailable && d.verificationStatus === "verified").length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;

  // Filter Donors
  const filteredDonors = donors.filter(donor => {
    const queryStr = searchTerm.toLowerCase();
    const matchesSearch = 
      donor.name.toLowerCase().includes(queryStr) ||
      donor.phone.includes(queryStr) ||
      donor.area.toLowerCase().includes(queryStr) ||
      (donor.nidOrId && donor.nidOrId.includes(queryStr));

    const matchesGroup = selectedGroup === "all" || donor.bloodGroup === selectedGroup;
    const matchesArea = selectedArea === "all" || donor.area === selectedArea;
    const matchesAvailability = 
      selectedAvailability === "all" ||
      (selectedAvailability === "available" && donor.isAvailable) ||
      (selectedAvailability === "unavailable" && !donor.isAvailable);

    const matchesVerification = 
      selectedVerification === "all" || donor.verificationStatus === selectedVerification;

    return matchesSearch && matchesGroup && matchesArea && matchesAvailability && matchesVerification;
  });

  // Filter Requests
  const filteredRequests = requests.filter(req => {
    const queryStr = searchTerm.toLowerCase();
    const matchesSearch = 
      req.patientName.toLowerCase().includes(queryStr) ||
      req.hospital.toLowerCase().includes(queryStr) ||
      req.phone.includes(queryStr);

    const matchesGroup = selectedGroup === "all" || req.bloodGroup === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white p-6 md:p-8 rounded-[28px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold mb-2 backdrop-blur-sm border border-rose-500/30">
              <Droplets size={14} className="text-rose-400 fill-rose-400" />৮. Blood Donor Management Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              পুঠিয়া ব্লাড ব্যাংক ও ব্লাড ডোনার নেটওয়ার্ক
            </h1>
            <p className="text-rose-100/80 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              উপজেলার নিবন্ধিত রক্তদাতা, ব্লাড গ্রুপ ফিল্টারিং, এলাকা-ভিত্তিক ম্যাপিং, ভেরিফিকেশন ও জরুরি রক্তের আবেদন পরিচালনা প্যানেল।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => { resetDonorForm(); setShowDonorModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs md:text-sm rounded-[16px] shadow-lg transition-all hover:scale-[1.02]"
            >
              <UserPlus size={16} />
              <span>নতুন রক্তদাতা যুক্ত করুন</span>
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs md:text-sm rounded-[16px] backdrop-blur-sm border border-white/20 transition-all"
            >
              <HeartHandshake size={16} />
              <span>জরুরি রক্তের আবেদন</span>
            </button>
          </div>
        </div>

        {/* Blood Group Breakdown Counter */}
        <div className="mt-6 pt-6 border-t border-rose-800/60 grid grid-cols-4 sm:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(selectedGroup === grp ? "all" : grp)}
              className={`p-2 rounded-[14px] text-center transition-all border ${
                selectedGroup === grp 
                  ? "bg-white text-rose-900 border-white font-black scale-105 shadow-md" 
                  : "bg-rose-950/40 text-rose-100 border-rose-800/50 hover:bg-rose-900/60"
              }`}
            >
              <div className="text-xs font-black">{grp}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{groupStats[grp] || 0} জন</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 rounded-[16px] text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-rose-50 border border-rose-200 rounded-[16px] text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="text-rose-600 shrink-0" size={18} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-[16px]">
            <Droplets size={22} fill="currentColor" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{donors.length}</div>
            <div className="text-xs font-bold text-slate-500">মোট নিবন্ধিত দাতা</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[16px]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">{verifiedCount}</div>
            <div className="text-xs font-bold text-slate-500">ভেরিফাইড রক্তদাতা</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-[16px]">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-700">{availableCount}</div>
            <div className="text-xs font-bold text-slate-500">বর্তমানে প্রস্তুত (Available)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-[16px]">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700">{pendingRequestsCount}</div>
            <div className="text-xs font-bold text-slate-500">জরুরি পেন্ডিং আবেদন</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Container */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-[16px]">
            <button
              onClick={() => setActiveTab("donors")}
              className={`px-4 py-2 rounded-[12px] text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "donors" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users size={16} />
              <span>রক্তদাতা ডিরেক্টরি ({filteredDonors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-[12px] text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "requests" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HeartHandshake size={16} />
              <span>জরুরি রক্তের আবেদন ({requests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("verification")}
              className={`px-4 py-2 rounded-[12px] text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === "verification" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck size={16} />
              <span>ভেরিফিকেশন প্যানেল ({donors.filter(d => d.verificationStatus === "pending").length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা এলাকা খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Filter Toolbar for Donors Tab */}
        {activeTab === "donors" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            
            {/* Blood Group Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">ব্লাড গ্রুপ</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-[12px] px-3 py-2 focus:outline-none"
              >
                <option value="all">সকল ব্লাড গ্রুপ</option>
                {BLOOD_GROUPS.map(grp => <option key={grp} value={grp}>{grp}</option>)}
              </select>
            </div>

            {/* Area / Union Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">ইউনিয়ন / এলাকা</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-[12px] px-3 py-2 focus:outline-none"
              >
                <option value="all">সকল ইউনিয়ন/এলাকা</option>
                {PUTHIA_UNIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">উপলব্ধতা (Availability)</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-[12px] px-3 py-2 focus:outline-none"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="available">প্রস্তুত (Available)</option>
                <option value="unavailable">সাময়িক স্থগিত (Unavailable)</option>
              </select>
            </div>

            {/* Verification Status Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">ভেরিফিকেশন স্ট্যাটাস</label>
              <select
                value={selectedVerification}
                onChange={(e) => setSelectedVerification(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-[12px] px-3 py-2 focus:outline-none"
              >
                <option value="all">সকল ভেরিফিকেশন</option>
                <option value="verified">ভেরিফাইড (Verified)</option>
                <option value="pending">পেন্ডিং (Pending)</option>
                <option value="unverified">আনভেরিফাইড (Unverified)</option>
              </select>
            </div>

          </div>
        )}
      </div>

      {/* Main Tab Content Display */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-[24px] border border-slate-200">
          <RefreshCw className="animate-spin text-rose-600 mx-auto mb-2" size={32} />
          <p className="text-xs font-bold text-slate-500">রক্তদাতা ডাটাবেজ লোড হচ্ছে...</p>
        </div>
      ) : activeTab === "donors" ? (
        
        /* 1. DONORS LIST TAB */
        filteredDonors.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[24px] border border-slate-200">
            <Droplets className="text-slate-300 mx-auto mb-2" size={36} />
            <h3 className="text-sm font-black text-slate-700">কোন রক্তদাতা পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">ফিল্টার পরিবর্তন করুন অথবা নতুন রক্তদাতা যোগ করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map(donor => (
              <div key={donor.id} className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-[14px] bg-red-100 text-red-700 font-black text-sm flex items-center justify-center shrink-0 border border-red-200 shadow-sm">
                        {donor.bloodGroup}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-slate-900">{donor.name}</h3>
                          {donor.verificationStatus === "verified" && (
                            <span title="Verified Donor">
                              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{donor.area}</span>
                          {donor.age && <span>• {donor.age} বছর ({donor.gender || "পুরুষ"})</span>}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(donor)}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-full border transition-all ${
                        donor.isAvailable 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {donor.isAvailable ? "● রক্তদানে প্রস্তুত" : "○ সাময়িক বিরত"}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-[16px] border border-slate-100 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">মোবাইল নম্বর:</span>
                      <a href={`tel:${donor.phone}`} className="font-black text-blue-600 hover:underline flex items-center gap-1">
                        <Phone size={12} /> {donor.phone}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">সর্বশেষ রক্তদান:</span>
                      <span className="font-black text-slate-800">{donor.lastDonate || "তথ্য নেই"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">মোট রক্তদান:</span>
                      <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">{donor.totalDonations || 1} বার</span>
                    </div>
                  </div>

                  {donor.notes && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-3 font-medium">
                      "{donor.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {donor.verificationStatus === "pending" && (
                      <button
                        onClick={() => handleUpdateVerification(donor.id, "verified")}
                        className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Check size={12} /> ভেরিফাই করুন
                      </button>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      donor.verificationStatus === "verified" ? "text-emerald-700 bg-emerald-50" :
                      donor.verificationStatus === "pending" ? "text-amber-700 bg-amber-50" : "text-slate-500 bg-slate-100"
                    }`}>
                      {donor.verificationStatus === "verified" ? "ভেরিফাইড" : donor.verificationStatus === "pending" ? "অপেক্ষমান" : "আনভেরিফাইড"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditDonor(donor)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="সম্পাদনা"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDonor(donor.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      ) : activeTab === "requests" ? (

        /* 2. EMERGENCY REQUESTS TAB */
        filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[24px] border border-slate-200">
            <HeartHandshake className="text-slate-300 mx-auto mb-2" size={36} />
            <h3 className="text-sm font-black text-slate-700">কোন জরুরি রক্তের আবেদন নেই</h3>
            <p className="text-xs text-slate-400 mt-1">নতুন আবেদন করতে উপরের 'জরুরি রক্তের আবেদন' বোতামে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(req => (
              <div key={req.id} className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-[20px] bg-red-600 text-white font-black text-lg flex flex-col items-center justify-center shrink-0 shadow-md">
                    <span>{req.bloodGroup}</span>
                    <span className="text-[10px] font-normal opacity-90">{req.unitsNeeded} ব্যাগ</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{req.patientName}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        req.urgency === "critical" ? "bg-rose-100 text-rose-800" :
                        req.urgency === "urgent" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {req.urgency === "critical" ? "🚨 অতীব জরুরি (Critical)" : req.urgency === "urgent" ? "⚠️ জরুরি" : "সাধারণ"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600 font-medium">
                      <p><span className="font-bold text-slate-500">হাসপাতাল:</span> {req.hospital} ({req.area})</p>
                      <p><span className="font-bold text-slate-500">প্রয়োজনের সময়:</span> {req.requiredDate} {req.requiredTime && `(${req.requiredTime})`}</p>
                      <p><span className="font-bold text-slate-500">যোগাযোগ ব্যক্তি:</span> {req.contactPerson || req.patientName}</p>
                      <p><span className="font-bold text-slate-500">মোবাইল:</span> <a href={`tel:${req.phone}`} className="font-black text-blue-600 hover:underline">{req.phone}</a></p>
                    </div>

                    {req.diseaseDetails && (
                      <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                        "{req.diseaseDetails}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    req.status === "fulfilled" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    req.status === "approved" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    req.status === "cancelled" ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {req.status === "fulfilled" ? "✓ রক্ত প্রাপ্ত হয়েছে" : req.status === "approved" ? "অনুমোদিত" : req.status === "cancelled" ? "বাতিলকৃত" : "পেন্ডিং অনুমোদন"}
                  </span>

                  <div className="flex items-center gap-1">
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[12px] transition-all"
                      >
                        অনুমোদন দিন
                      </button>
                    )}
                    {req.status === "approved" && (
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, "fulfilled")}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[12px] transition-all"
                      >
                        সম্পন্ন চিহ্নিত করুন
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="মুছুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      ) : (

        /* 3. VERIFICATION QUEUE TAB */
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>রক্তদাতা ভেরিফিকেশন প্যানেল</span>
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                এনআইডি ও মোবাইল নম্বর যাচাই সাপেক্ষে রক্তদাতাকে অফিসিয়াল ভেরিফাইড ব্যাজ প্রদান করুন।
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
              {donors.filter(d => d.verificationStatus === "pending").length} জন অপেক্ষমান
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase bg-slate-50">
                  <th className="p-3 rounded-l-xl">রক্তদাতার নাম</th>
                  <th className="p-3">গ্রুপ</th>
                  <th className="p-3">ফোন নম্বর</th>
                  <th className="p-3">এলাকা</th>
                  <th className="p-3">এনআইডি / ভোটার আইডি</th>
                  <th className="p-3">বর্তমান স্ট্যাটাস</th>
                  <th className="p-3 text-right rounded-r-xl">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {donors.map(donor => (
                  <tr key={donor.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="p-3 font-black text-slate-900">{donor.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-black rounded-md text-[11px]">
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3">{donor.phone}</td>
                    <td className="p-3">{donor.area}</td>
                    <td className="p-3 font-mono">{donor.nidOrId || "প্রদান করা হয়নি"}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        donor.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        donor.verificationStatus === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-500"
                      }`}>
                        {donor.verificationStatus === "verified" ? "✓ ভেরিফাইড" : donor.verificationStatus === "pending" ? "● পেন্ডিং" : "আনভেরিফাইড"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {donor.verificationStatus !== "verified" && (
                          <button
                            onClick={() => handleUpdateVerification(donor.id, "verified")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all"
                          >
                            ভেরিফাই করুন
                          </button>
                        )}
                        {donor.verificationStatus === "verified" && (
                          <button
                            onClick={() => handleUpdateVerification(donor.id, "unverified")}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-lg transition-all"
                          >
                            বাতিল করুন
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DONOR ADD / EDIT MODAL */}
      {showDonorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="text-rose-600" size={20} />
                <span>{editingDonorId ? "রক্তদাতার তথ্য পরিবর্তন" : "নতুন রক্তদাতা নিবন্ধন"}</span>
              </h3>
              <button onClick={() => setShowDonorModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDonor} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">রক্তদাতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">ব্লাড গ্রুপ *</label>
                  <select
                    value={donorGroup}
                    onChange={e => setDonorGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={donorPhone}
                    onChange={e => setDonorPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">ইউনিয়ন / এলাকা *</label>
                  <select
                    value={donorArea}
                    onChange={e => setDonorArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    {PUTHIA_UNIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">বয়স</label>
                  <input
                    type="number"
                    value={donorAge}
                    onChange={e => setDonorAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">লিঙ্গ</label>
                  <select
                    value={donorGender}
                    onChange={e => setDonorGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="নারী">নারী</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">মোট রক্তদান</label>
                  <input
                    type="number"
                    value={donorTotalDonations}
                    onChange={e => setDonorTotalDonations(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">সর্বশেষ রক্তদানের তারিখ</label>
                  <input
                    type="date"
                    value={donorLastDonate}
                    onChange={e => setDonorLastDonate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">এনআইডি / পরিচয়পত্র (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={donorNid}
                    onChange={e => setDonorNid(e.target.value)}
                    placeholder="NID নম্বর"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">উপলব্ধতা (Availability)</label>
                  <select
                    value={donorIsAvailable ? "true" : "false"}
                    onChange={e => setDonorIsAvailable(e.target.value === "true")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="true">প্রস্তুত (Available)</option>
                    <option value="false">সাময়িক বিরত (Unavailable)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">ভেরিফিকেশন স্ট্যাটাস</label>
                  <select
                    value={donorVerification}
                    onChange={e => setDonorVerification(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="verified">ভেরিফাইড (Verified)</option>
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="unverified">আনভেরিফাইড (Unverified)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">অতিরিক্ত বিবরণ / নোট</label>
                <textarea
                  rows={2}
                  value={donorNotes}
                  onChange={e => setDonorNotes(e.target.value)}
                  placeholder="যেমন: কলেজ মোড় সংলগ্ন, বিকেল ৪টার পর লভ্য..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDonorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[12px]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[12px] shadow-md"
                >
                  {editingDonorId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* EMERGENCY REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <HeartHandshake className="text-rose-600" size={20} />
                <span>জরুরি রক্তের আবেদন পোস্ট করুন</span>
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">রোগীর নাম *</label>
                  <input
                    type="text"
                    required
                    value={reqPatientName}
                    onChange={e => setReqPatientName(e.target.value)}
                    placeholder="রোগীর সম্পূর্ণ নাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">প্রয়োজনীয় ব্লাড গ্রুপ *</label>
                  <select
                    value={reqBloodGroup}
                    onChange={e => setReqBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">কত ব্যাগ প্রয়োজন? *</label>
                  <input
                    type="number"
                    min={1}
                    value={reqUnits}
                    onChange={e => setReqUnits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">জরুরি মাত্রা (Urgency) *</label>
                  <select
                    value={reqUrgency}
                    onChange={e => setReqUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="critical">🚨 অতীব জরুরি (Critical)</option>
                    <option value="urgent">⚠️ জরুরি (Urgent)</option>
                    <option value="normal">সাধারণ (Normal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">হাসপাতাল / ক্লিনিিকের নাম *</label>
                  <input
                    type="text"
                    required
                    value={reqHospital}
                    onChange={e => setReqHospital(e.target.value)}
                    placeholder="যেমন: পুঠিয়া উপজেলা স্বাস্থ্য কমপ্লেক্স"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">ইউনিয়ন / এলাকা</label>
                  <select
                    value={reqArea}
                    onChange={e => setReqArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  >
                    {PUTHIA_UNIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">যোগাযোগের ব্যক্তি *</label>
                  <input
                    type="text"
                    value={reqContactPerson}
                    onChange={e => setReqContactPerson(e.target.value)}
                    placeholder="আত্মীয়/বন্ধুর নাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={reqPhone}
                    onChange={e => setReqPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">রক্তদানের তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={reqDate}
                    onChange={e => setReqDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">আনুমানিক সময়</label>
                  <input
                    type="text"
                    value={reqTime}
                    onChange={e => setReqTime(e.target.value)}
                    placeholder="যেমন: বিকেল ৪:০০"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">রোগের বিবরণ / বিশেষ নির্দেশিকা</label>
                <textarea
                  rows={2}
                  value={reqDisease}
                  onChange={e => setReqDisease(e.target.value)}
                  placeholder="যেমন: জরুরি সিজারিয়ান অপারেশন / থ্যালাসেমিয়া রক্ত পরিবর্তন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-[12px] p-2.5 font-medium focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[12px]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[12px] shadow-md"
                >
                  আবেদন প্রকাশ করুন
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
